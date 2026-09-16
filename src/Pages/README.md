# PEFA — FINAL PRE-VERCEL FIX PACKAGE

## Changes included
1. Patient registration WhatsApp flow preserved.
2. Referral registration now triggers an automatic WhatsApp template after the referral row is successfully saved.
3. Laboratory result release now triggers an automatic WhatsApp template after the report is successfully changed to Released.
4. Dashboard now reads daily patient activity from `registrations` and laboratory workflow activity from `laboratory_results`; obsolete `payments` / `payment_transactions` dashboard calls are removed.
5. Dashboard refreshes on open, browser focus and every 60 seconds.
6. Dashboard Quick Action **Enter Result** now opens `/laboratory-result-entry`.
7. Result Dashboard's internal **Enter Result** action now uses the same valid `/laboratory-result-entry` route.
8. Logout uses React navigation + Supabase sign-out instead of forcing a full-page `/login` reload.
9. Vercel SPA rewrite is included to prevent React routes from becoming Vercel 404 pages.
10. The working Staff Management file with obsolete **Repair Auth** removed is included.

## Files
- `Dashboard.jsx` → `src/Pages/Dashboard.jsx`
- `ReferralDashboard.jsx` → `src/Pages/ReferralDashboard.jsx`
- `LaboratoryResultDashboard.jsx` → `src/Pages/laboratory/LaboratoryResultDashboard.jsx`
- `DashboardSidebar.jsx` → `src/Pages/DashboardSidebar.jsx` (use your actual sidebar filename if different)
- `StaffManagement.jsx` → `src/Pages/StaffManagement.jsx` only if this is the working file currently used by your app
- `supabase/functions/send-registration-whatsapp/index.ts` → replace the deployed WhatsApp Edge Function source
- `vercel.json` → project root

## WhatsApp templates required in Meta
### Existing patient registration template
`registration_successful`

Body variables, in order:
1. Patient name
2. Branch
3. Branch number
4. Registration number
5. Lab number
6. Access code
7. Patient portal URL

### New referral registration template
`referral_registration_successful`

Body variables, in order:
1. Referral name
2. Referral code
3. Referral phone
4. Referral email

### New released-result template
`result_released`

Body variables, in order:
1. Patient name
2. Lab number
3. Report name
4. Access code
5. Patient portal URL

The template names/languages must exactly match the approved Meta templates.

## Supabase secrets
Keep the existing secrets and add these event-specific settings:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_GRAPH_API_VERSION=v23.0`
- `PATIENT_PORTAL_URL=https://www.pefamedlab.com`
- `WHATSAPP_REGISTRATION_TEMPLATE_NAME=registration_successful`
- `WHATSAPP_REGISTRATION_TEMPLATE_LANGUAGE=en_US`
- `WHATSAPP_REFERRAL_TEMPLATE_NAME=referral_registration_successful`
- `WHATSAPP_REFERRAL_TEMPLATE_LANGUAGE=en_US`
- `WHATSAPP_RESULT_RELEASE_TEMPLATE_NAME=result_released`
- `WHATSAPP_RESULT_RELEASE_TEMPLATE_LANGUAGE=en_US`

## Deploy order
1. Replace the files above locally.
2. Run the normal local build/test.
3. Deploy only the WhatsApp Edge Function:
   `supabase functions deploy send-registration-whatsapp --project-ref tzyfqjguzcnniffgdbhs`
4. Test locally:
   - patient registration → WhatsApp
   - referral registration → WhatsApp
   - release an authorized result → WhatsApp
   - Dashboard daily figures/recent activity
   - Dashboard Enter Result
   - Result Dashboard Enter Result
   - logout
5. Only after local testing passes, commit/push `develop`; Vercel will build the branch.

## Important
- WhatsApp delivery depends on Meta-approved templates and correctly configured Supabase secrets.
- WhatsApp failures are non-blocking: a successful registration/referral/result release is not rolled back because WhatsApp failed.
- Do NOT deploy the old `PEFA_STAFF_AUTH_REPAIR_FINAL` package.
- Do NOT change the existing patient registration payload structure.
