import { getSupabaseClient } from '../lib/supabase.js';
import { logError, mapSupabaseError } from '../utils/errorHandler.js';

function failure(error, context) {
  logError(context, error);
  return { success: false, error: mapSupabaseError(error).message };
}

export const analyticsService = {
  async getDashboardSummary(dateFrom, dateTo) {
    try {
      const { data, error } = await getSupabaseClient().rpc('admin_dashboard_summary', {
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
      });
      if (error) return failure(error, 'Get admin dashboard summary');
      return { success: true, summary: data };
    } catch (error) {
      return failure(error, 'Get admin dashboard summary');
    }
  },

  async getAnalytics(dateFrom, dateTo) {
    try {
      const { data, error } = await getSupabaseClient().rpc('admin_analytics', {
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
      });
      if (error) return failure(error, 'Get admin analytics');
      return { success: true, analytics: data };
    } catch (error) {
      return failure(error, 'Get admin analytics');
    }
  },
};
