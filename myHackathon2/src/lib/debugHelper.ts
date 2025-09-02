import { supabase } from './supabase';

interface DebugQuery {
  table: string;
  select?: string;
  filters?: Record<string, any>;
}

interface DebugResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  suggestion?: string;
  debug?: any;
}

/**
 * Debug helper to test Supabase queries and get detailed error information
 */
export class SupabaseDebugHelper {
  /**
   * Test a Supabase query and return detailed debugging information
   */
  static async testQuery(query: DebugQuery): Promise<DebugResult> {
    console.log('=== SUPABASE QUERY DEBUG ===');
    console.log('Testing query:', JSON.stringify(query, null, 2));

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
          } else if (key.startsWith('neq.')) {
            supabaseQuery = supabaseQuery.neq(key.replace('neq.', ''), value);
          } else if (key.startsWith('gt.')) {
            supabaseQuery = supabaseQuery.gt(key.replace('gt.', ''), value);
          } else if (key.startsWith('gte.')) {
            supabaseQuery = supabaseQuery.gte(key.replace('gte.', ''), value);
          } else if (key.startsWith('lt.')) {
            supabaseQuery = supabaseQuery.lt(key.replace('lt.', ''), value);
          } else if (key.startsWith('lte.')) {
            supabaseQuery = supabaseQuery.lte(key.replace('lte.', ''), value);
          }
        });
      }

      // Limit to 5 for testing
      supabaseQuery = supabaseQuery.limit(5);

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('❌ Query failed:', error);

        let suggestion = 'Check your query syntax and table permissions';

        // Provide specific suggestions based on error
        if (error.message.includes('foreign key')) {
          suggestion = 'Foreign key constraint error. Check your relationships and ensure referenced records exist.';
        } else if (error.message.includes('permission')) {
          suggestion = 'Permission denied. Check your RLS policies and user authentication.';
        } else if (error.message.includes('column')) {
          suggestion = 'Column error. Check column names and data types.';
        } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
          suggestion = 'Table or relation does not exist. Check table names.';
        }

        return {
          success: false,
          message: 'Query failed',
          error,
          suggestion,
          debug: {
            table: query.table,
            select: query.select,
            filters: query.filters,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            errorHint: error.hint
          }
        };
      }

      console.log('✅ Query succeeded');
      console.log('Sample data:', JSON.stringify(data, null, 2));

      return {
        success: true,
        message: 'Query succeeded',
        data,
        suggestion: 'Query executed successfully',
        debug: {
          table: query.table,
          select: query.select,
          filters: query.filters,
          recordCount: data?.length || 0,
          columns: data && data.length > 0 ? Object.keys(data[0]) : []
        }
      };

    } catch (err: any) {
      console.error('❌ Unexpected error:', err);

      return {
        success: false,
        message: 'Unexpected error occurred',
        error: err,
        suggestion: 'Check your network connection and try again',
        debug: {
          table: query.table,
          error: err.message
        }
      };
    }
  }

  /**
   * Test common problematic queries from the dashboards
   */
  static async testCommonQueries() {
    console.log('=== TESTING COMMON DASHBOARD QUERIES ===');

    const testQueries: { name: string; query: DebugQuery }[] = [
      {
        name: 'Meal Requests (Approved)',
        query: {
          table: 'meal_requests',
          select: '*',
          filters: { 'eq.status': 'approved' }
        }
      },
      {
        name: 'Donations (by donor)',
        query: {
          table: 'donations',
          select: '*',
          filters: { 'eq.donor_id': 'test-user-id' }
        }
      },
      {
        name: 'Profiles (all)',
        query: {
          table: 'profiles',
          select: '*'
        }
      },
      {
        name: 'Meal Requests with Student Join',
        query: {
          table: 'meal_requests',
          select: '*, student:profiles(*)',
          filters: { 'eq.status': 'approved' }
        }
      }
    ];

    const results: { name: string; result: DebugResult }[] = [];

    for (const test of testQueries) {
      console.log(`\n--- Testing: ${test.name} ---`);
      const result = await this.testQuery(test.query);
      results.push({ name: test.name, result });
    }

    console.log('\n=== SUMMARY ===');
    results.forEach(({ name, result }) => {
      console.log(`${name}: ${result.success ? '✅' : '❌'} ${result.message}`);
      if (!result.success && result.suggestion) {
        console.log(`  Suggestion: ${result.suggestion}`);
      }
    });

    return results;
  }

  /**
   * Log detailed error information for debugging
   */
  static logDetailedError(error: any, context?: string) {
    console.group(`🚨 Supabase Error${context ? ` (${context})` : ''}`);
    console.error('Error object:', error);
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('Details:', error?.details);
    console.error('Hint:', error?.hint);
    console.error('Stack:', error?.stack);
    console.groupEnd();
  }
}

// Export convenience functions
export const testSupabaseQuery = SupabaseDebugHelper.testQuery.bind(SupabaseDebugHelper);
export const testCommonQueries = SupabaseDebugHelper.testCommonQueries.bind(SupabaseDebugHelper);
export const logSupabaseError = SupabaseDebugHelper.logDetailedError.bind(SupabaseDebugHelper);
