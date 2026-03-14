import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: isSuperAdmin } = await adminClient.rpc("is_super_admin", { _user_id: user.id });
    if (!isSuperAdmin) throw new Error("Only super admins can manage users");

    const { action, ...params } = await req.json();

    switch (action) {
      case "list": {
        const { data: roles } = await adminClient
          .from("user_roles")
          .select("*")
          .in("role", ["admin", "super_admin", "moderator"]);

        if (!roles?.length) return json({ users: [] });

        const userIds = [...new Set(roles.map((r: any) => r.user_id))];
        const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

        const adminUsers = users
          .filter((u: any) => userIds.includes(u.id))
          .map((u: any) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            roles: roles.filter((r: any) => r.user_id === u.id).map((r: any) => r.role),
          }));

        return json({ users: adminUsers });
      }

      case "create": {
        const { email, password, role } = params;
        if (!email || !password || !role) throw new Error("Missing email, password, or role");

        let userId: string;

        // Check if user already exists
        const { data: { users: existingUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const existingUser = existingUsers.find((u: any) => u.email === email);

        if (existingUser) {
          userId = existingUser.id;
          // Update password for existing user
          await adminClient.auth.admin.updateUserById(userId, { password });
        } else {
          const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (createErr) throw createErr;
          userId = newUser.user.id;
        }

        // Remove existing admin/mod roles and set the new one
        await adminClient.from("user_roles").delete().eq("user_id", userId).in("role", ["admin", "super_admin", "moderator"]);
        await adminClient.from("user_roles").insert({ user_id: userId, role });
        // moderators and super_admins also need the admin role for RLS policies
        if (role === "super_admin" || role === "moderator") {
          await adminClient.from("user_roles").insert({ user_id: userId, role: "admin" });
        }

        return json({ success: true, user_id: userId });
      }

      case "create_driver_account": {
        const { email, password, driver_id } = params;
        if (!email || !password || !driver_id) throw new Error("Missing email, password, or driver_id");

        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr) throw createErr;

        // Link driver to auth user
        await adminClient.from("drivers").update({ user_id: newUser.user.id }).eq("id", driver_id);

        return json({ success: true, user_id: newUser.user.id });
      }

      case "update_role": {
        const { user_id, role } = params;
        if (!user_id || !role) throw new Error("Missing user_id or role");
        if (user_id === user.id) throw new Error("Cannot change your own role");

        await adminClient.from("user_roles").delete().eq("user_id", user_id).in("role", ["admin", "super_admin", "moderator"]);
        await adminClient.from("user_roles").insert({ user_id, role });
        // moderators and super_admins also need the admin role for RLS policies
        if (role === "super_admin" || role === "moderator") {
          await adminClient.from("user_roles").insert({ user_id, role: "admin" });
        }

        return json({ success: true });
      }

      case "change_password": {
        const { user_id, new_password } = params;
        if (!user_id || !new_password) throw new Error("Missing user_id or new_password");

        const { error } = await adminClient.auth.admin.updateUserById(user_id, { password: new_password });
        if (error) throw error;

        return json({ success: true });
      }

      case "delete": {
        const { user_id } = params;
        if (!user_id) throw new Error("Missing user_id");
        if (user_id === user.id) throw new Error("Cannot delete yourself");

        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;

        return json({ success: true });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    return json({ error: err.message }, 400);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
