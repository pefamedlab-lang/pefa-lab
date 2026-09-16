import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

type EventType =
  | "patient_registration"
  | "referral_registration"
  | "result_released";

type Payload = {
  event_type?: EventType;
  registration_id?: number | string | null;
  patient_name?: string | null;
  phone?: string | null;
  branch?: string | null;
  branch_number?: string | null;
  registration_number?: string | null;
  lab_number?: string | null;
  access_code?: string | null;
  service_type?: string | null;
  tests?: string | string[] | null;
  referral_id?: number | string | null;
  referral_name?: string | null;
  referring_doctor?: string | null;
  clinical_history?: string | null;
  result_id?: number | string | null;
  result_test?: string | null;
  result_status?: string | null;
  result_url?: string | null;
};

const text = (value: unknown): string =>
  value == null ? "" : String(value).trim();

function normalizePhone(value: unknown): string {
  let phone = text(value).replace(/[^\d+]/g, "");
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) phone = `234${phone.slice(1)}`;
  return phone;
}

function stringifyTests(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean).join(", ");
  }
  return text(value);
}

function firstEnv(...names: string[]): string {
  for (const name of names) {
    const value = Deno.env.get(name);
    if (value && value.trim()) return value.trim();
  }
  return "";
}

function templateName(eventType: EventType): string {
  if (eventType === "referral_registration") {
    return firstEnv(
      "WHATSAPP_REFERRAL_TEMPLATE_NAME",
      "WHATSAPP_TEMPLATE_NAME",
    ) || "referral_registration_successful";
  }

  if (eventType === "result_released") {
    return firstEnv(
      "WHATSAPP_RESULT_RELEASE_TEMPLATE_NAME",
      "WHATSAPP_TEMPLATE_NAME",
    ) || "result_released";
  }

  return firstEnv(
    "WHATSAPP_REGISTRATION_TEMPLATE_NAME",
    "WHATSAPP_TEMPLATE_NAME",
  ) || "registration_successful";
}

function templateLanguage(eventType: EventType): string {
  if (eventType === "referral_registration") {
    return firstEnv(
      "WHATSAPP_REFERRAL_TEMPLATE_LANGUAGE",
      "WHATSAPP_TEMPLATE_LANGUAGE",
    ) || "en_US";
  }

  if (eventType === "result_released") {
    return firstEnv(
      "WHATSAPP_RESULT_RELEASE_TEMPLATE_LANGUAGE",
      "WHATSAPP_TEMPLATE_LANGUAGE",
    ) || "en_US";
  }

  return firstEnv(
    "WHATSAPP_REGISTRATION_TEMPLATE_LANGUAGE",
    "WHATSAPP_TEMPLATE_LANGUAGE",
  ) || "en_US";
}

function patientPortalUrl(labNumber: string): string {
  const base =
    firstEnv("PATIENT_PORTAL_URL") || "https://www.pefamedlab.com";
  if (!labNumber) return base;
  return `${base.replace(/\/+$/, "")}/patient-result?lab_number=${encodeURIComponent(labNumber)}`;
}

function buildTemplateParameters(
  eventType: EventType,
  payload: Payload,
): Array<{ type: string; text: string }> {
  const patientName = text(payload.patient_name) || "Patient";
  const branch = text(payload.branch);
  const branchNumber = text(payload.branch_number);
  const registrationNumber = text(payload.registration_number);
  const labNumber = text(payload.lab_number);
  const accessCode = text(payload.access_code);
  const tests = stringifyTests(payload.tests);
  const doctor = text(payload.referring_doctor);
  const referralName = text(payload.referral_name);
  const resultTest = text(payload.result_test) || tests || "Laboratory result";
  const resultUrl = text(payload.result_url) || patientPortalUrl(labNumber);

  if (eventType === "referral_registration") {
    return [
      { type: "text", text: patientName },
      { type: "text", text: referralName || doctor || "Referral" },
      { type: "text", text: registrationNumber },
      { type: "text", text: labNumber },
    ];
  }

  if (eventType === "result_released") {
    return [
      { type: "text", text: patientName },
      { type: "text", text: labNumber },
      { type: "text", text: resultTest },
      { type: "text", text: resultUrl },
      { type: "text", text: accessCode },
    ];
  }

  return [
    { type: "text", text: patientName },
    { type: "text", text: branch },
    { type: "text", text: branchNumber },
    { type: "text", text: registrationNumber },
    { type: "text", text: labNumber },
    { type: "text", text: accessCode },
    { type: "text", text: patientPortalUrl(labNumber) },
  ];
}

async function requireAuthenticatedUser(req: Request) {
  const supabaseUrl = firstEnv("SUPABASE_URL");
  const anonKey = firstEnv("PEFA_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not configured.");
  }

  const authHeader = req.headers.get("Authorization") ||
    req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization token.");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) throw new Error("Missing authorization token.");

  const authClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid or expired authentication token.");
  }

  return data.user;
}

async function recordNotification(
  admin: ReturnType<typeof createClient>,
  payload: Payload,
  eventType: EventType,
  status: string,
  providerMessageId: string | null,
  errorMessage: string | null,
) {
  const row = {
    registration_id:
      payload.registration_id == null
        ? null
        : Number(payload.registration_id) || null,
    patient_name: text(payload.patient_name) || null,
    phone: text(payload.phone) || null,
    branch: text(payload.branch) || null,
    branch_number: text(payload.branch_number) || null,
    registration_number: text(payload.registration_number) || null,
    lab_number: text(payload.lab_number) || null,
    message_type: eventType,
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === "sent" ? new Date().toISOString() : null,
  };

  const { error } = await admin
    .from("whatsapp_notifications")
    .insert(row);

  if (error) {
    console.warn("[PEFA WHATSAPP] Notification log failed:", error.message);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed." }),
      { status: 405, headers: jsonHeaders },
    );
  }

  try {
    await requireAuthenticatedUser(req);

    const payload = (await req.json()) as Payload;
    const eventType: EventType =
      payload.event_type === "referral_registration"
        ? "referral_registration"
        : payload.event_type === "result_released"
        ? "result_released"
        : "patient_registration";

    const phone = normalizePhone(payload.phone);

    if (!phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "A valid patient WhatsApp phone number is required.",
        }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const accessToken = firstEnv("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = firstEnv("WHATSAPP_PHONE_NUMBER_ID");
    const graphVersion =
      firstEnv("WHATSAPP_GRAPH_API_VERSION") || "v23.0";

    if (!accessToken || !phoneNumberId) {
      throw new Error(
        "WhatsApp credentials are not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
      );
    }

    const template = templateName(eventType);
    const language = templateLanguage(eventType);

    const graphUrl =
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

    const graphResponse = await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: template,
          language: { code: language },
          components: [
            {
              type: "body",
              parameters: buildTemplateParameters(eventType, payload),
            },
          ],
        },
      }),
    });

    const graphText = await graphResponse.text();

    let graphJson: any = null;
    try {
      graphJson = graphText ? JSON.parse(graphText) : null;
    } catch {
      graphJson = null;
    }

    const providerMessageId =
      graphJson?.messages?.[0]?.id || null;

    const supabaseUrl = firstEnv("SUPABASE_URL");
    const serviceRoleKey = firstEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.",
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (!graphResponse.ok) {
      const errorMessage =
        graphJson?.error?.message ||
        graphJson?.error?.error_user_msg ||
        graphText ||
        `WhatsApp API returned HTTP ${graphResponse.status}.`;

      await recordNotification(
        admin,
        payload,
        eventType,
        "failed",
        null,
        errorMessage,
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          provider_status: graphResponse.status,
        }),
        { status: 502, headers: jsonHeaders },
      );
    }

    await recordNotification(
      admin,
      payload,
      eventType,
      "sent",
      providerMessageId,
      null,
    );

    return new Response(
      JSON.stringify({
        success: true,
        event_type: eventType,
        template,
        language,
        provider_message_id: providerMessageId,
      }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("[PEFA WHATSAPP] Function error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
