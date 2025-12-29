Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { leadId, agentId, assignedBy } = await req.json();

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'leadId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no agentId provided, find agent with least leads (round-robin)
    let targetAgentId = agentId;

    if (!targetAgentId) {
      // Get all agents
      const agentsRes = await fetch(`${supabaseUrl}/rest/v1/user_roles?select=user_id,roles!inner(name)&roles.name=eq.agent`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      const agents = await agentsRes.json();

      if (agents && agents.length > 0) {
        // Count leads per agent
        const countsRes = await fetch(`${supabaseUrl}/rest/v1/lead_assignments?select=agent_id&is_active=eq.true`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const assignments = await countsRes.json();

        const counts: Record<string, number> = {};
        agents.forEach((a: { user_id: string }) => { counts[a.user_id] = 0; });
        assignments.forEach((a: { agent_id: string }) => {
          if (counts[a.agent_id] !== undefined) counts[a.agent_id]++;
        });

        // Find agent with minimum leads
        targetAgentId = Object.entries(counts).reduce((min, [id, count]) => 
          count < counts[min] ? id : min
        , agents[0].user_id);
      }
    }

    if (!targetAgentId) {
      return new Response(JSON.stringify({ error: 'No agents available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deactivate previous assignments
    await fetch(`${supabaseUrl}/rest/v1/lead_assignments?lead_id=eq.${leadId}`, {
      method: 'PATCH',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_active: false })
    });

    // Create new assignment
    const createRes = await fetch(`${supabaseUrl}/rest/v1/lead_assignments`, {
      method: 'POST',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        lead_id: leadId,
        agent_id: targetAgentId,
        assigned_by: assignedBy || null,
        is_active: true
      })
    });

    const assignment = await createRes.json();

    // Update lead's assigned_to field
    await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
      method: 'PATCH',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ assigned_to: targetAgentId })
    });

    return new Response(JSON.stringify({ data: assignment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
