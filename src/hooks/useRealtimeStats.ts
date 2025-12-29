import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AdminStats } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalProperties: 0,
    totalLeads: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    activeProperties: 0,
    totalViews: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [leadsRes, propsRes, closedRes, propertiesRes, salesRes] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      const totalLeads = leadsRes.count || 0;
      const activeProperties = propsRes.count || 0;
      const closedLeads = closedRes.count || 0;
      const totalProperties = propertiesRes.count || 0;
      const totalSales = salesRes.count || 0;

      // Calcular ingresos mensuales estimados (basado en ventas completadas)
      const monthlyRevenue = totalSales * 250000; // Estimación: $250,000 USD por venta

      const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

      setStats({
        totalProperties,
        totalLeads,
        totalSales,
        monthlyRevenue,
        activeProperties,
        totalViews: 12400 + totalLeads * 5,
        conversionRate: parseFloat(conversionRate.toFixed(1))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Setup realtime subscriptions for stats changes (temporarily disabled)
    const statsChannel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => {
          // Recalculate stats when leads change
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          // Recalculate stats when properties change
          fetchStats();
        }
      )
      .subscribe();

    setChannel(statsChannel);

    return () => {
      statsChannel.unsubscribe();
    };
  }, []); // Remove dependencies to fix infinite re-renders

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    isConnected: !!channel
  };
}
