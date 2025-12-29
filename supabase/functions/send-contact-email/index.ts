
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { name, email, phone, message, type } = await req.json();

        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set");
        }

        // 1. Fetch Target Email from web_settings
        // We use the service role key to bypass RLS if necessary, though web_settings should be public read
        const settingsRes = await fetch(`${SUPABASE_URL}/rest/v1/web_settings?select=home_config&limit=1`, {
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
        });

        const settingsData = await settingsRes.json();
        let targetEmail = "Ruzziventas@gmail.com"; // Default fallback

        if (settingsData && settingsData.length > 0 && settingsData[0].home_config?.contact?.targetEmail) {
            targetEmail = settingsData[0].home_config.contact.targetEmail;
        }

        // 2. Prepare Email Content
        const subject = `Nuevo Contacto Web: ${type} - ${name}`;
        const htmlContent = `
      <h2>Nueva Consulta desde la Web</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Tipo de Consulta:</strong> ${type}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
      <br />
      <p><small>Enviado desde el formulario de contacto web de Ruzzi.</small></p>
    `;

        // 3. Send Email via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Ruzzi Web <onboarding@resend.dev>", // Or a configured domain if available
                to: [targetEmail],
                subject: subject,
                html: htmlContent,
                reply_to: email
            }),
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: res.ok ? 200 : 400,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
