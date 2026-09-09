/* ==========================================================
   PEFA LAB — SEND REGISTRATION WHATSAPP
   ----------------------------------------------------------
   PATH:
   supabase/functions/send-registration-whatsapp/index.ts

   PURPOSE:
   - Send successful registration notification
   - Uses WhatsApp Business Cloud API
   - Keeps WhatsApp credentials server-side
   - Records notification status in Supabase
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ?? "";

const serviceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const whatsappAccessToken =
  Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";

const whatsappPhoneNumberId =
  Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";

const graphApiVersion =
  Deno.env.get("WHATSAPP_GRAPH_API_VERSION") ??
  "v23.0";

const templateName =
  Deno.env.get("WHATSAPP_TEMPLATE_NAME") ??
  "registration_successful";

const templateLanguage =
  Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") ??
  "en_US";

const patientPortalUrl =
  Deno.env.get("PATIENT_PORTAL_URL") ??
  "https://www.pefamedlab.com";


/* ==========================================================
   SUPABASE ADMIN CLIENT
   ========================================================== */

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);


/* ==========================================================
   PHONE NUMBER NORMALIZER
   ========================================================== */

function normalizeNigeriaPhone(
  phone: unknown
): string {
  if (!phone) return "";

  let value = String(phone)
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

  if (!value) return "";

  /*
   * +2348012345678
   * becomes:
   * 2348012345678
   */
  if (value.startsWith("+234")) {
    return value.substring(1);
  }

  /*
   * 2348012345678
   */
  if (value.startsWith("234")) {
    return value;
  }

  /*
   * 08012345678
   * becomes:
   * 2348012345678
   */
  if (value.startsWith("0")) {
    return `234${value.substring(1)}`;
  }

  return value;
}


/* ==========================================================
   MAIN FUNCTION
   ========================================================== */

Deno.serve(async (req: Request) => {
  /*
   * CORS preflight
   */
  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        headers: corsHeaders,
      }
    );
  }

  /*
   * Only POST is accepted
   */
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  let payload: Record<string, any> = {};

  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid JSON request body.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  const {
    registration_id,
    patient_name,
    phone,
    branch,
    branch_number,
    registration_number,
    lab_number,
    access_code,
    service_type,
    tests,
  } = payload;


  /* ========================================================
     VALIDATION
     ======================================================== */

  const normalizedPhone =
    normalizeNigeriaPhone(phone);

  if (!patient_name) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Patient name is required.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  if (!normalizedPhone) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "A valid patient phone number is required.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  if (!whatsappAccessToken) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "WHATSAPP_ACCESS_TOKEN is not configured.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  if (!whatsappPhoneNumberId) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "WHATSAPP_PHONE_NUMBER_ID is not configured.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }


  /* ========================================================
     TEST LIST
     ======================================================== */

  let testList = "";

  if (Array.isArray(tests)) {
    testList = tests
      .filter(Boolean)
      .map((test: any) => {
        if (typeof test === "string") {
          return test;
        }

        return (
          test?.name ||
          test?.test_name ||
          test?.test ||
          ""
        );
      })
      .filter(Boolean)
      .join(", ");
  }

  if (!testList) {
    testList =
      service_type ||
      "Laboratory Service";
  }


  /* ========================================================
     WHATSAPP MESSAGE
     ======================================================== */

  const templateComponents = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: String(patient_name),
        },
        {
          type: "text",
          text: String(
            branch || "PEFA Medical Diagnostic Services"
          ),
        },
        {
          type: "text",
          text: String(
            branch_number || "N/A"
          ),
        },
        {
          type: "text",
          text: String(
            registration_number || "N/A"
          ),
        },
        {
          type: "text",
          text: String(
            lab_number || "N/A"
          ),
        },
        {
          type: "text",
          text: String(
            access_code || "N/A"
          ),
        },
        {
          type: "text",
          text: patientPortalUrl,
        },
      ],
    },
  ];


  /* ========================================================
     AUDIT RECORD — PENDING
     ======================================================== */

  let notificationId: string | null = null;

  try {
    const {
      data: notification,
      error: notificationError,
    } = await supabaseAdmin
      .from("whatsapp_notifications")
      .insert({
        registration_id:
          registration_id || null,

        patient_name:
          String(patient_name),

        phone:
          normalizedPhone,

        branch:
          branch || null,

        branch_number:
          branch_number || null,

        registration_number:
          registration_number || null,

        lab_number:
          lab_number || null,

        message_type:
          "registration_successful",

        status:
          "pending",

        error_message:
          null,

        provider_message_id:
          null,

        created_at:
          new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!notificationError) {
      notificationId =
        notification?.id || null;
    } else {
      console.error(
        "[WhatsApp] Audit insert failed:",
        notificationError
      );
    }
  } catch (auditError) {
    console.error(
      "[WhatsApp] Audit insert exception:",
      auditError
    );
  }


  /* ========================================================
     META GRAPH API
     ======================================================== */

  const graphUrl =
    `https://graph.facebook.com/` +
    `${graphApiVersion}/` +
    `${whatsappPhoneNumberId}/messages`;

  try {
    const whatsappResponse =
      await fetch(graphUrl, {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${whatsappAccessToken}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messaging_product:
            "whatsapp",

          to:
            normalizedPhone,

          type:
            "template",

          template: {
            name:
              templateName,

            language: {
              code:
                templateLanguage,
            },

            components:
              templateComponents,
          },
        }),
      });


    const whatsappResult =
      await whatsappResponse.json();


    /* ======================================================
       WHATSAPP FAILED
       ====================================================== */

    if (!whatsappResponse.ok) {
      const errorMessage =
        whatsappResult?.error?.message ||
        whatsappResult?.error?.error_data?.details ||
        "WhatsApp message failed.";

      console.error(
        "[WhatsApp] Meta API error:",
        whatsappResult
      );

      if (notificationId) {
        await supabaseAdmin
          .from("whatsapp_notifications")
          .update({
            status:
              "failed",

            error_message:
              errorMessage,
          })
          .eq(
            "id",
            notificationId
          );
      }

      return new Response(
        JSON.stringify({
          success: false,
          sent: false,
          error: errorMessage,
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }


    /* ======================================================
       SUCCESS
       ====================================================== */

    const providerMessageId =
      whatsappResult?.messages?.[0]?.id ||
      null;

    if (notificationId) {
      await supabaseAdmin
        .from("whatsapp_notifications")
        .update({
          status:
            "sent",

          provider_message_id:
            providerMessageId,

          sent_at:
            new Date().toISOString(),

          error_message:
            null,
        })
        .eq(
          "id",
          notificationId
        );
    }


    return new Response(
      JSON.stringify({
        success: true,
        sent: true,
        provider_message_id:
          providerMessageId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );

  } catch (error) {

    console.error(
      "[WhatsApp] Request exception:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown WhatsApp error.";

    if (notificationId) {
      await supabaseAdmin
        .from("whatsapp_notifications")
        .update({
          status:
            "failed",

          error_message:
            errorMessage,
        })
        .eq(
          "id",
          notificationId
        );
    }

    return new Response(
      JSON.stringify({
        success: false,
        sent: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});