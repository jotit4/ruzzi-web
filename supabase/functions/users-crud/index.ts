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
        console.log(`[USERS CRUD v8] Action: ${action}`);

        if (action === 'delete') {
            const { userId, id } = data;
            const targetId = userId || id;
            if (!targetId) throw new Error('User ID is required for deletion');

            console.log(`[USERS CRUD] Deleting user ${targetId}...`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(targetId);

            if (deleteError) {
                console.error('[USERS CRUD] Delete error:', deleteError);
                throw deleteError;
            }

            return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (action === 'update') {
            const { id, userId, email, password, full_name, role, role_id, phone, position, department, is_active } = data
            const targetUserId = userId || id;

            if (!targetUserId) throw new Error('User ID is required for update');

            console.log(`[USERS CRUD] Updating user ${targetUserId}...`);

            // 1. Update Auth (Email, Password, Metadata)
            const authUpdates: any = {};
            if (email) authUpdates.email = email;
            if (password) authUpdates.password = password;
            if (full_name) authUpdates.user_metadata = { full_name };

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, authUpdates);
                if (authError) throw authError;
            }

            // 2. Update Profile
            // Construct profile updates object, only including defined values
            const profileUpdates: any = {};
            if (phone !== undefined) profileUpdates.phone = phone;
            if (position !== undefined) profileUpdates.position = position;
            if (department !== undefined) profileUpdates.department = department;
            if (is_active !== undefined) profileUpdates.is_active = is_active;
            if (full_name !== undefined) profileUpdates.full_name = full_name; // Sync full name to profile too

            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', targetUserId);

                if (profileError) throw profileError;
            }

            // 3. Update Role if provided
            let newRoleId = role_id;
            if (!newRoleId && role && ROLE_MAP[role]) {
                newRoleId = ROLE_MAP[role];
            }

            if (newRoleId) {
                // Check if role is actually different? Or just force update.
                // Delete existing roles
                await supabase.from('user_roles').delete().eq('user_id', targetUserId);

                const { error: roleError } = await supabase.from('user_roles').insert([{
                    user_id: targetUserId,
                    role_id: newRoleId,
                    assigned_at: new Date().toISOString()
                }]);
                if (roleError) console.error('Role update error:', roleError);
            }

            return new Response(JSON.stringify({ message: 'User updated successfully' }), {
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
            const { email, password, full_name, role_id, role, phone, position, department } = data

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

            // 2. Assign Role
            let roleId = role_id;
            if (!roleId && role) {
                roleId = ROLE_MAP[role] || ROLE_MAP['agent'];
            }

            if (!roleId) throw new Error('Role ID is required');

            // 3. Update Profile
            console.log(`[USERS CRUD] Updating profile for ${authUser.user.id}...`);
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name, // Ensure full_name is in profile
                    phone,
                    position,
                    department,
                    is_active: true
                })
                .eq('id', authUser.user.id)
                .select()
                .single()

            if (profileError) {
                console.error('[USERS CRUD] Profile update error:', profileError);
                // Fallback upsert
                const { error: upsertError } = await supabase
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
})
