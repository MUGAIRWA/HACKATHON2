// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.2";

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
    avatar_url?: string;
  };
}

Deno.serve(async (req: Request) => {
  try {
    const { record, type }: { record: AuthUser; type: string } = await req.json();

    // We only care about new Auth user inserts
    if (type !== "INSERT" || !record?.id) {
      return new Response(
        JSON.stringify({ message: "Not a user insert event" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("=== CREATING PROFILE FOR NEW USER ===");
    console.log("User ID:", record.id);
    console.log("Email:", record.email);
    console.log("User metadata:", record.user_metadata);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Read from user_metadata (correct field)
    const fullName = record.user_metadata?.full_name ?? null;
    const role = record.user_metadata?.role ?? "student";
    const avatarUrl = record.user_metadata?.avatar_url ?? null;

    console.log("Extracted values:");
    console.log("- full_name:", fullName);
    console.log("- role:", role);
    console.log("- avatar_url:", avatarUrl);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: record.id,           // matches auth.users.id
        email: record.email,
        full_name: fullName,     // <- correct value from user_metadata
        role: role,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Profile insert error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      return new Response(
        JSON.stringify({
          message: "Error creating profile",
          error: error.message,
          details: error.details
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ Profile created successfully:", data);

    return new Response(
      JSON.stringify({
        message: "Profile created successfully",
        data
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({
        message: "Unexpected error",
        error: err.message
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
