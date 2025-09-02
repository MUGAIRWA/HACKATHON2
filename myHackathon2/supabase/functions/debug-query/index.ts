// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.2";
interface DebugRequest {
  query?: {
    table: string;
    select?: string;
    filters?: Record<string, any>;
  };
  error?: any;
  testQuery?: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Parse the request JSON
    const { query, error, testQuery = true }: DebugRequest = await req.json();

    // Log detailed error information
    console.log("=== SUPABASE QUERY DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());

    if (query) {
      console.log("Query that caused the error:", JSON.stringify(query, null, 2));
    }

    if (error) {
      console.log("Error details:", JSON.stringify(error, null, 2));
      console.log("Error message:", error.message);
      console.log("Error code:", error.code);
      console.log("Error details:", error.details);
      console.log("Error hint:", error.hint);
    }

    // Optionally test the query with proper error handling
    if (query && testQuery) {
      console.log("=== TESTING QUERY ===");

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!
      );

      try {
        // Build the query dynamically
        let supabaseQuery = supabase.from(query.table).select(query.select || '*');

        // Add filters if provided
        if (query.filters) {
          Object.entries(query.filters).forEach(([key, value]) => {
            if (key.startsWith('eq.')) {
              supabaseQuery = supabaseQuery.eq(key.replace('eq.', ''), value);
            } else if (key.startsWith('in.')) {
              supabaseQuery = supabaseQuery.in(key.replace('in.', ''), value);
            }
          });
        }

        // Limit to 1 for testing
        supabaseQuery = supabaseQuery.limit(1);

        const { data, error: testError } = await supabaseQuery;

        if (testError) {
          console.log("❌ Test query failed:", testError);
          return new Response(JSON.stringify({
            success: false,
            message: "Query test failed",
            error: testError,
            suggestion: "Check your foreign key references, table names, and column types",
            debug: {
              table: query.table,
              select: query.select,
              filters: query.filters
            }
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        console.log("✅ Test query succeeded");
        console.log("Sample data structure:", JSON.stringify(data, null, 2));

        return new Response(JSON.stringify({
          success: true,
          message: "Query test succeeded",
          data: data,
          suggestion: "Your original query might have syntax issues with foreign key references or joins",
          debug: {
            table: query.table,
            select: query.select,
            filters: query.filters,
            recordCount: data?.length || 0
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (testErr) {
        console.log("❌ Test execution failed:", testErr);
        return new Response(JSON.stringify({
          success: false,
          message: "Test execution failed",
          error: testErr,
          suggestion: "Check your environment variables and Supabase connection"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      message: "No query provided for testing",
      suggestion: "Provide a query object with table, select, and optional filters"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      suggestion: "Check your request format and try again"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
