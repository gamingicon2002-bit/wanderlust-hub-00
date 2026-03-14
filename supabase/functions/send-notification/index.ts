import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, booking_id } = body;

    // Helper: replace template vars
    const replaceVars = (template: string, booking: any, extras: Record<string, string> = {}) => {
      let result = template
        .replace(/\{\{customer_name\}\}/g, booking.customer_name || "")
        .replace(/\{\{customer_email\}\}/g, booking.customer_email || "")
        .replace(/\{\{customer_phone\}\}/g, booking.customer_phone || "")
        .replace(/\{\{reference_name\}\}/g, booking.reference_name || "")
        .replace(/\{\{travel_date\}\}/g, booking.travel_date || "")
        .replace(/\{\{travel_time\}\}/g, booking.travel_time || "")
        .replace(/\{\{pickup_location\}\}/g, booking.pickup_location || "")
        .replace(/\{\{drop_location\}\}/g, booking.drop_location || "")
        .replace(/\{\{status\}\}/g, booking.status || "")
        .replace(/\{\{num_travelers\}\}/g, String(booking.num_travelers || ""))
        .replace(/\{\{vehicle_type\}\}/g, booking.vehicle_type || "")
        .replace(/\{\{notes\}\}/g, booking.notes || "");
      for (const [k, v] of Object.entries(extras)) {
        result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      }
      return result;
    };

    // Helper: send WhatsApp
    const sendWhatsApp = async (settings: any, phone: string, message: string) => {
      if (!settings?.whatsapp_enabled || !settings?.whatsapp_api_url || !settings?.whatsapp_api_key) return { sent: false, reason: "whatsapp_not_configured" };
      if (!phone) return { sent: false, reason: "no_phone" };
      try {
        await fetch(settings.whatsapp_api_url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${settings.whatsapp_api_key}` },
          body: JSON.stringify({ phone, message }),
        });
        return { sent: true };
      } catch (e: any) {
        console.error("WhatsApp error:", e);
        return { sent: false, reason: e.message };
      }
    };

    // Helper: send email via SMTP
    const sendEmail = async (settings: any, to: string, subject: string, htmlBody: string) => {
      if (!settings?.smtp_enabled || !settings?.smtp_host) return { sent: false, reason: "smtp_not_configured" };
      if (!to) return { sent: false, reason: "no_email" };
      try {
        const credentials = btoa(`\0${settings.smtp_user}\0${settings.smtp_pass}`);
        const emailContent = [
          `From: ${settings.smtp_from_name || "Admin"} <${settings.smtp_from_email || settings.smtp_user}>`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          htmlBody,
        ].join("\r\n");

        const conn = await Deno.connectTls({
          hostname: settings.smtp_host,
          port: parseInt(settings.smtp_port) || 465,
        });
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const read = async () => { const buf = new Uint8Array(1024); const n = await conn.read(buf); return decoder.decode(buf.subarray(0, n || 0)); };
        const write = async (cmd: string) => { await conn.write(encoder.encode(cmd + "\r\n")); return await read(); };
        await read();
        await write(`EHLO localhost`);
        await write(`AUTH PLAIN ${credentials}`);
        await write(`MAIL FROM:<${settings.smtp_from_email || settings.smtp_user}>`);
        await write(`RCPT TO:<${to}>`);
        await write(`DATA`);
        await conn.write(encoder.encode(emailContent + "\r\n.\r\n"));
        await read();
        await write(`QUIT`);
        conn.close();
        return { sent: true };
      } catch (e: any) {
        console.error("SMTP error:", e);
        return { sent: false, reason: e.message };
      }
    };

    // Get booking
    const { data: booking } = await admin.from("bookings").select("*").eq("id", booking_id).single();
    if (!booking) throw new Error("Booking not found");

    // Get settings
    const { data: settings } = await admin.from("site_settings").select("*").limit(1).single();

    // Get booking drivers
    const { data: bookingDrivers } = await admin.from("booking_drivers").select("driver_id, vehicle_id").eq("booking_id", booking_id);
    const driverIds = (bookingDrivers || []).map((bd: any) => bd.driver_id);
    let driverRecords: any[] = [];
    if (driverIds.length > 0) {
      const { data } = await admin.from("drivers").select("*").in("id", driverIds);
      driverRecords = data || [];
    }
    // Fallback to legacy driver_id
    if (driverRecords.length === 0 && booking.driver_id) {
      const { data } = await admin.from("drivers").select("*").eq("id", booking.driver_id).single();
      if (data) driverRecords = [data];
    }

    const results: any = { email: [], whatsapp: [], notifications: [] };

    if (action === "booking_confirmed" || action === "manual_notify") {
      const channel = body.channel || "all"; // "email", "whatsapp", "all"
      const targets = body.targets || ["customer", "admin", "driver"]; // who to notify
      const customMessage = body.message || "";
      const customSubject = body.subject || "";

      const statusLabel = (booking.status || "pending").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const defaultSubject = `Booking ${statusLabel} — ${booking.reference_name || "Trip"} on ${booking.travel_date || "TBD"}`;
      const subject = customSubject || defaultSubject;

      const defaultMsg = replaceVars(
        settings?.whatsapp_booking_template || "Hello {{customer_name}}, your booking for {{reference_name}} on {{travel_date}} has been {{status}}. Thank you!",
        booking
      );
      const msg = customMessage || defaultMsg;

      const emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#2563eb">${settings?.company_name || "Travel Company"}</h2>
        <p>${msg.replace(/\n/g, "<br>")}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Customer</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${booking.customer_name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Package/Vehicle</td><td style="padding:8px;border-bottom:1px solid #eee">${booking.reference_name || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Travel Date</td><td style="padding:8px;border-bottom:1px solid #eee">${booking.travel_date || "TBD"} ${booking.travel_time || ""}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Pickup</td><td style="padding:8px;border-bottom:1px solid #eee">${booking.pickup_location || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Drop</td><td style="padding:8px;border-bottom:1px solid #eee">${booking.drop_location || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Travelers</td><td style="padding:8px;border-bottom:1px solid #eee">${booking.num_travelers || 1}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Status</td><td style="padding:8px;border-bottom:1px solid #eee"><strong style="color:#2563eb">${statusLabel}</strong></td></tr>
          ${driverRecords.length > 0 ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Driver(s)</td><td style="padding:8px;border-bottom:1px solid #eee">${driverRecords.map((d: any) => d.name).join(", ")}</td></tr>` : ""}
        </table>
        ${booking.notes ? `<p style="color:#888;font-size:13px"><strong>Notes:</strong> ${booking.notes}</p>` : ""}
        <p style="color:#aaa;font-size:11px;margin-top:24px">— ${settings?.company_name || "Travel Company"}</p>
      </div>`;

      // Customer
      if (targets.includes("customer")) {
        if (channel === "all" || channel === "email") {
          results.email.push({ to: "customer", ...await sendEmail(settings, booking.customer_email, subject, emailHtml) });
        }
        if (channel === "all" || channel === "whatsapp") {
          results.whatsapp.push({ to: "customer", ...await sendWhatsApp(settings, booking.customer_phone, msg) });
        }
      }

      // Admin
      if (targets.includes("admin")) {
        const adminMsg = customMessage || replaceVars(
          settings?.whatsapp_admin_template || "New booking update: {{customer_name}} — {{reference_name}} on {{travel_date}}",
          booking
        );
        if (channel === "all" || channel === "whatsapp") {
          if (settings?.whatsapp) {
            results.whatsapp.push({ to: "admin", ...await sendWhatsApp(settings, settings.whatsapp, adminMsg) });
          }
        }
        if (channel === "all" || channel === "email") {
          if (settings?.contact_email) {
            results.email.push({ to: "admin", ...await sendEmail(settings, settings.contact_email, `[Admin] ${subject}`, emailHtml) });
          }
        }
        // In-app notifications
        const { data: adminRoles } = await admin.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]);
        if (adminRoles) {
          for (const role of adminRoles) {
            await admin.from("notifications").insert({
              user_id: role.user_id, title: `Booking ${statusLabel}`,
              message: `${booking.customer_name} — ${booking.reference_name || "N/A"} on ${booking.travel_date || "TBD"}`,
              type: "booking", link: "/admin/bookings",
            });
            results.notifications.push({ to: role.user_id });
          }
        }
      }

      // Drivers
      if (targets.includes("driver") && driverRecords.length > 0) {
        const driverMsg = `Trip assigned: ${booking.customer_name} — ${booking.reference_name || "N/A"} on ${booking.travel_date || "TBD"}. Pickup: ${booking.pickup_location || "TBD"}`;
        for (const driver of driverRecords) {
          if (channel === "all" || channel === "whatsapp") {
            if (driver.phone) results.whatsapp.push({ to: `driver:${driver.name}`, ...await sendWhatsApp(settings, driver.phone, driverMsg) });
          }
          if (channel === "all" || channel === "email") {
            if (driver.email) results.email.push({ to: `driver:${driver.name}`, ...await sendEmail(settings, driver.email, `Trip Assigned — ${booking.reference_name || "Trip"}`, emailHtml) });
          }
          if (driver.user_id) {
            await admin.from("notifications").insert({
              user_id: driver.user_id, title: "Trip Update",
              message: `${booking.customer_name} — ${booking.reference_name || "N/A"} on ${booking.travel_date || "TBD"}`,
              type: "booking", link: "/driver",
            });
            results.notifications.push({ to: driver.user_id });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
