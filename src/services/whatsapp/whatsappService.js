/* ==========================================================
   PEFA LAB — WHATSAPP SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/whatsapp/whatsappService.js

   PURPOSE:
   - Send registration-success WhatsApp notification
   - Calls the Supabase Edge Function
   - Keeps WhatsApp credentials out of the frontend
   ========================================================== */

import { supabase } from "../../supabase";

/**
 * Send a successful registration notification through WhatsApp.
 *
 * The actual WhatsApp/Meta API request is handled by the
 * Supabase Edge Function:
 *
 * supabase/functions/send-registration-whatsapp/index.ts
 *
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function sendRegistrationWhatsApp(payload = {}) {
  if (!payload || typeof payload !== "object") {
    throw new Error(
      "WhatsApp registration payload is required."
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "send-registration-whatsapp",
    {
      body: payload,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

export default sendRegistrationWhatsApp;