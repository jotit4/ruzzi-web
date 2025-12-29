import { useState, useEffect, useCallback } from 'react';
import { supabase, DbLead } from '../lib/supabase';
import { Lead } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Convert DB lead to frontend Lead type
function mapDbToLead(dbLead: DbLead): Lead {
  const statusMap: Record<string, Lead['status']> = {
    new: 'pending',
    contacted: 'confirmed',
    interested: 'confirmed',
    appointment: 'confirmed',
    negotiating: 'confirmed',
    closed: 'completed',
    discarded: 'cancelled'
  };

  return {
    id: dbLead.id,
    client_name: `${dbLead.first_name} ${dbLead.last_name}`,
    client_email: dbLead.email || '',
    client_phone: dbLead.phone || '',
    property_id: dbLead.property_type_preference || 'general',
    booking_date: dbLead.created_at,
    status: statusMap[dbLead.status] || 'pending',
    notes: dbLead.notes || null,
    created_by: dbLead.assigned_to || null,
    updated_by: dbLead.assigned_to || null,
    // Legacy properties for compatibility
    name: `${dbLead.first_name} ${dbLead.last_name}`,
    email: dbLead.email || '',
    phone: dbLead.phone || '',
    type: dbLead.property_type_preference || 'Consulta General',
    message: dbLead.notes || '',
    date: dbLead.created_at.split('T')[0],
    assignedTo: dbLead.assigned_to || undefined
  };
}

export function useRealtimeLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const { data, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads((data || []).map(mapDbToLead));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLeadInList = useCallback((updatedLead: Lead) => {
    setLeads(prev => {
      const index = prev.findIndex(l => l.id === updatedLead.id);
      if (index !== -1) {
        const newList = [...prev];
        newList[index] = updatedLead;
        return newList;
      }
      return [updatedLead, ...prev];
    });
  }, []);

  const addLeadToList = useCallback((newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLeads();

    // Setup realtime subscription
    const leadsChannel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Leads change received!', payload);

          if (payload.eventType === 'INSERT') {
            const newLead = payload.new as DbLead;
            const mappedLead = mapDbToLead(newLead);
            addLeadToList(mappedLead);
          } else if (payload.eventType === 'UPDATE') {
            const updatedLead = payload.new as DbLead;
            const mappedLead = mapDbToLead(updatedLead);
            updateLeadInList(mappedLead);
          } else if (payload.eventType === 'DELETE') {
            const deletedLead = payload.old as DbLead;
            setLeads(prev => prev.filter(l => l.id !== deletedLead.id));
          }
        }
      )
      .subscribe();

    setChannel(leadsChannel);

    return () => {
      leadsChannel.unsubscribe();
    };
  }, [fetchLeads, updateLeadInList, addLeadToList]);

  const addLead = async (lead: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const nameParts = lead.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: sourceData } = await supabase
      .from('lead_sources')
      .select('id')
      .eq('name', 'website')
      .maybeSingle();

    const { error } = await supabase.from('leads').insert({
      first_name: firstName,
      last_name: lastName,
      email: lead.email,
      phone: lead.phone,
      notes: lead.message,
      property_type_preference: lead.type,
      lead_source_id: sourceData?.id || null,
      status: 'new',
      priority: 'medium'
    });

    if (error) throw error;
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    const statusMap: Record<Lead['status'], DbLead['status']> = {
      pending: 'new',
      confirmed: 'contacted',
      cancelled: 'discarded',
      completed: 'closed',
      // Mappings for remaining frontend statuses to backend statuses
      new: 'new',
      contacted: 'contacted',
      qualified: 'qualified',
      lost: 'lost',
      closed: 'closed',
      interested: 'contacted',
      appointment: 'contacted',
      negotiating: 'qualified',
      discarded: 'discarded'
    };

    const { error } = await supabase
      .from('leads')
      .update({ status: statusMap[status] })
      .eq('id', id);

    if (error) throw error;
  };

  return {
    leads,
    loading,
    error,
    addLead,
    updateLeadStatus,
    refetch: fetchLeads,
    isConnected: !!channel
  };
}
