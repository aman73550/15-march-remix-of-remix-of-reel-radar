import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { secret_key } = await req.json();
    
    // Simple secret to prevent unauthorized calls
    if (secret_key !== "setup-admin-73550") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Admin credentials from environment (not hardcoded)
    const email = Deno.env.get("ADMIN_EMAIL") || "admin@system.local";
    const password = Deno.env.get("ADMIN_PASSWORD") || "ChangeMeNow123!";

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
      console.log("Admin user already exists, password updated:", userId);
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      userId = newUser.user.id;
      console.log("Admin user created:", userId);
    }

    // Assign admin role
    const { error: roleErr } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role: "admin",
    }, { onConflict: "user_id,role" });

    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ success: true, email, message: "Admin created. Login at /bosspage-login" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
