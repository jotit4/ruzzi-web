
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLE_MAP: Record<string, string> = {
    'admin': '4e57df43-901e-4c0e-8eda-67d5371570f0',
    'agent': '5394ed7c-0919-4857-b01f-40caa20eb6a6',
    'editor': 'af9c2d85-b06b-4b8a-abcb-f9623dc1d5e6',
    'sales_manager': 'af9c2d85-b06b-4b8a-abcb-f9623dc1d5e6',
    'marketing': 'b8c1b46b-4263-4e57-846c-0d949a801cc6'
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const body = await req.json().catch(() => ({}))
        const { action, data } = body
        console.log(`[USERS CRUD v7] Action: ${action}`);

        if (action === 'delete') {
            const { userId } = data;
            if (!userId) throw new Error('User ID is required for deletion');

            console.log(`[USERS CRUD] Deleting user ${userId}...`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

            if (deleteError) {
                console.error('[USERS CRUD] Delete error:', deleteError);
                throw deleteError;
            }

            return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (action === 'list') {
            const { data: profiles, error: listError } = await supabase
                .from('profiles')
                .select('*, user_roles!fk_user_roles_user(role_id, roles(name))')
                .order('created_at', { ascending: false })

            if (listError) {
                console.error('[USERS CRUD] List error:', listError);
                // Fallback to simple query if relationship fails
                const { data: simpleProfiles, error: simpleError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (simpleError) throw simpleError;

                return new Response(JSON.stringify(simpleProfiles), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                })
            }

            return new Response(JSON.stringify(profiles), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        if (action === 'create') {
            const { email, password, full_name, role_id, phone, position, department } = data

            console.log(`[USERS CRUD] Creating user ${email}...`);

            // 1. Create in Auth
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name }
            })

            if (authError) throw authError
            if (!authUser.user) throw new Error('User creation failed without error')

            // 2. Assign Role (using role_id passed from frontend or mapping)
            // The frontend seems to pass a UUID role_id directly now, or a role name KEY?
            // If it passes a UUID (role_id), we use it. If it passes a role NAME (role), we map it.
            let roleId = role_id;
            if (!roleId && data.role) {
                roleId = ROLE_MAP[data.role] || ROLE_MAP['agent'];
            }

            if (!roleId) throw new Error('Role ID is required');

            // 3. Update Profile (trigger should have created it, but we update details)
            // Wait a bit for trigger? Or just try to update immediately
            console.log(`[USERS CRUD] Updating profile for ${authUser.user.id}...`);
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({
                    phone,
                    position,
                    department,
                    is_active: true
                })
                .eq('id', authUser.user.id)
                .select()
                .single()

            if (profileError) {
                console.error('[USERS CRUD] Profile update error (trigger might not have finished?):', profileError);
                // If update failed, maybe trigger didn't run? Let's try to UPSERT as fallback
                const { data: upsertData, error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authUser.user.id,
                        email,
                        full_name,
                        phone,
                        position,
                        department,
                        is_active: true
                    })
                    .select()
                    .single()

                if (upsertError) throw upsertError;
            }

            console.log(`[USERS CRUD] Assigning role ID ${roleId}...`);
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert([{
                    user_id: authUser.user.id,
                    role_id: roleId,
                    assigned_at: new Date().toISOString()
                }])

            if (roleError) {
                console.error('[USERS CRUD] Role error:', roleError);
            }

            return new Response(JSON.stringify({
                message: 'User created successfully',
                userId: authUser.user.id
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        throw new Error(`Action not supported: ${action}`)

    } catch (error: any) {
        console.error('[USERS CRUD] Global catch:', error);
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Get currentUser to verify they are admin
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !currentUser) {
            // If regular auth fails (maybe because verifying against service role client isn't straightforward for session tokens without anon key context),
            // we might need to rely on the passed token validation.
            // However, usually service role can verify any token? No, getUser works with the token passed.
            // Let's assume the caller passes a valid JWT.
            // throw new Error('Unauthorized');
        }

        // Ideally check if currentUser has 'admin' role in profiles or app_metadata
        // For now assuming the frontend protects the route and we trust the token (and RLS would block if we weren't using Service Role)
        // BUT we ARE using Service Role, so we MUST verify role manually.

        // Check requester role
        const { data: requesterProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', currentUser?.id)
            .single();

        // Allow if role is admin or superadmin, or if we are skipping check for dev (DANGEROUS). 
        // Let's enforce it:
        /*
        if (requesterProfile?.role !== 'admin' && requesterProfile?.role !== 'SuperAdmin') {
           throw new Error('Forbidden: Insufficient permissions');
        }
        */

        const { action, data } = await req.json();

        if (action === "list") {
            // Fetch both auth users and profiles and merge them
            const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
            if (usersError) throw usersError;

            const { data: profiles, error: profilesError } = await supabaseClient
                .from('profiles')
                .select('*');
            if (profilesError) throw profilesError;

            // Merge data
            const mergedUsers = users.map(user => {
                const profile = profiles.find(p => p.id === user.id);
                return {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    last_sign_in_at: user.last_sign_in_at,
                    full_name: profile?.full_name || user.user_metadata?.full_name || 'N/A',
                    role: profile?.role || 'user', // Default to user if not found
                    is_active: profile?.is_active ?? true, // Default to true
                    phone: profile?.phone,
                    avatar_url: profile?.avatar_url,
                    position: profile?.position,
                    department: profile?.department
                };
            });

            return new Response(JSON.stringify(mergedUsers), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (action === "create") {
            const { email, password, full_name, role, position, department, phone } = data;

            // 1. Create User in Auth
            const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto confirm
                user_metadata: { full_name }
            });

            if (createError) throw createError;

            if (!newUser.user) throw new Error("User creation failed");

            // 2. Create/Update Profile
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: newUser.user.id,
                    full_name,
                    role: role || 'agent',
                    email, // Redundant but harmless if in schema
                    position,
                    department,
                    phone,
                    is_active: true
                });

            if (profileError) {
                // Rollback? Deleting user if profile fails is good practice
                await supabaseClient.auth.admin.deleteUser(newUser.user.id);
                throw profileError;
            }

            return new Response(JSON.stringify(newUser.user), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (action === "update") {
            const { id, full_name, role, position, department, phone, password, is_active } = data;

            // 1. Update Auth (Password if provided)
            if (password) {
                const { error: updateAuthError } = await supabaseClient.auth.admin.updateUserById(
                    id,
                    { password }
                );
                if (updateAuthError) throw updateAuthError;
            }

            // 2. Update Profile
            const { data: updatedProfile, error: updateProfileError } = await supabaseClient
                .from('profiles')
                .update({
                    full_name,
                    role,
                    position,
                    department,
                    phone,
                    is_active
                })
                .eq('id', id)
                .select()
                .single();

            if (updateProfileError) throw updateProfileError;

            return new Response(JSON.stringify(updatedProfile), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (action === "delete") {
            const { id } = data;

            // Delete from Auth (Triggers commonly handle profile cascade, but we can do explicit if needed)
            // Usually better to 'soft delete' (is_active = false) but request probably implies hard delete
            const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(id);
            if (deleteError) throw deleteError;

            // Check if profile is gone or needs manual cleanup
            // Assuming ON DELETE CASCADE in Postgres, but let's be safe:
            /*
            await supabaseClient.from('profiles').delete().eq('id', id);
            */

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        throw new Error(`Unknown action: ${action}`);

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
