import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Admin only");

    const { recipients, subject, body } = await req.json();
    if (!recipients?.length || !subject || !body) throw new Error("Missing recipients, subject, or body");

    // Get SMTP settings
    const { data: settings } = await admin.from("site_settings").select("*").limit(1).single();
    if (!settings?.smtp_enabled || !settings?.smtp_host) throw new Error("SMTP not configured. Go to Notifications > SMTP to set it up.");

    // Send emails using Deno's built-in SMTP (simplified - in production use a proper SMTP library)
    // For now, we'll use a fetch-based approach that works with most transactional email APIs
    const results = [];
    for (const recipient of recipients) {
      const personalizedBody = body
        .replace(/\{\{customer_name\}\}/g, recipient.name || "")
        .replace(/\{\{customer_email\}\}/g, recipient.email || "")
        .replace(/\{\{company_name\}\}/g, settings.company_name || "");

      const personalizedSubject = subject
        .replace(/\{\{customer_name\}\}/g, recipient.name || "")
        .replace(/\{\{company_name\}\}/g, settings.company_name || "");

      // Use SMTP via raw connection
      try {
        // Base64 encode credentials
        const credentials = btoa(`\0${settings.smtp_user}\0${settings.smtp_pass}`);
        
        // For Gmail and similar services, we construct a proper email
        const emailContent = [
          `From: ${settings.smtp_from_name || "Admin"} <${settings.smtp_from_email || settings.smtp_user}>`,
          `To: ${recipient.email}`,
          `Subject: ${personalizedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          personalizedBody,
        ].join("\r\n");

        // Connect to SMTP
        const conn = await Deno.connectTls({
          hostname: settings.smtp_host,
          port: parseInt(settings.smtp_port) || 465,
        });

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const read = async () => {
          const buf = new Uint8Array(1024);
          const n = await conn.read(buf);
          return decoder.decode(buf.subarray(0, n || 0));
        };
        const write = async (cmd: string) => {
          await conn.write(encoder.encode(cmd + "\r\n"));
          return await read();
        };

        await read(); // greeting
        await write(`EHLO localhost`);
        await write(`AUTH PLAIN ${credentials}`);
        await write(`MAIL FROM:<${settings.smtp_from_email || settings.smtp_user}>`);
        await write(`RCPT TO:<${recipient.email}>`);
        await write(`DATA`);
        await conn.write(encoder.encode(emailContent + "\r\n.\r\n"));
        await read();
        await write(`QUIT`);
        conn.close();

        results.push({ email: recipient.email, status: "sent" });
      } catch (smtpErr: any) {
        console.error(`SMTP error for ${recipient.email}:`, smtpErr);
        results.push({ email: recipient.email, status: "failed", error: smtpErr.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
