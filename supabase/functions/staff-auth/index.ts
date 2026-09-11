/* ==========================================================
   PEFA LAB — STAFF AUTHENTICATION PROVISIONING
   ----------------------------------------------------------
   PURPOSE
   - Create and link PEFA staff records with Supabase Auth.
   - Update staff profile + linked Auth credentials.
   - Reset Supabase Auth passwords.
   - Activate / disable staff accounts.
   - Delete linked Auth + staff records.
   - Keep the service-role key server-side.

   SECURITY
   - JWT verification is enabled in supabase/config.toml.
   - The caller is independently verified here.
   - Only active Admin / Director staff may manage accounts.
   - Existing unlinked Admin / Director records may be linked
     automatically when their email matches the authenticated user.
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeUsername(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function validPassword(password: unknown) {
  return typeof password === "string" && password.length >= 6;
}

function isPrivilegedRole(role: unknown) {
  const normalized = cleanText(role).toLowerCase();
  return normalized === "admin" || normalized === "director";
}

function isActiveStatus(status: unknown) {
  return cleanText(status).toLowerCase() === "active";
}

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Authentication is required.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const authClient = createClient(
    supabaseUrl,
    anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data, error } = await authClient.auth.getUser();

  if (error || !data?.user) {
    throw new Error("Your Supabase Authentication session is invalid or expired.");
  }

  return data.user;
}

async function authorizeManager(user: any) {
  const authUserId = user.id;
  const authEmail = normalizeEmail(user.email);

  const { data: byAuthId, error: authIdError } = await supabaseAdmin
    .from("staff_users")
    .select("id, username, email, auth_user_id, full_name, role, status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (authIdError) {
    throw new Error(`Unable to verify staff authorization: ${authIdError.message}`);
  }

  if (byAuthId) {
    if (!isActiveStatus(byAuthId.status) || !isPrivilegedRole(byAuthId.role)) {
      throw new Error("Only an active Admin or Director may manage staff accounts.");
    }

    return byAuthId;
  }

  // Bootstrap an older PEFA privileged account that was created before
  // auth_user_id was populated. Matching both role/status and email is required.
  if (authEmail) {
    const { data: byEmail, error: emailError } = await supabaseAdmin
      .from("staff_users")
      .select("id, username, email, auth_user_id, full_name, role, status")
      .ilike("email", authEmail)
      .maybeSingle();

    if (emailError) {
      throw new Error(`Unable to verify staff authorization: ${emailError.message}`);
    }

    if (
      byEmail &&
      isActiveStatus(byEmail.status) &&
      isPrivilegedRole(byEmail.role)
    ) {
      const { data: linked, error: linkError } = await supabaseAdmin
        .from("staff_users")
        .update({ auth_user_id: authUserId })
        .eq("id", byEmail.id)
        .select("id, username, email, auth_user_id, full_name, role, status")
        .single();

      if (linkError) {
        throw new Error(`Unable to link your administrator account: ${linkError.message}`);
      }

      return linked;
    }
  }

  throw new Error("You are not authorized to manage staff accounts.");
}

async function ensureUniqueUsername(username: string, staffId?: number | string | null) {
  let query = supabaseAdmin
    .from("staff_users")
    .select("id")
    .eq("username", username)
    .limit(1);

  if (staffId !== null && staffId !== undefined && staffId !== "") {
    query = query.neq("id", staffId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Unable to check username: ${error.message}`);
  }

  if (data) {
    throw new Error("Username already exists.");
  }
}

async function ensureUniqueEmail(email: string, staffId?: number | string | null) {
  let query = supabaseAdmin
    .from("staff_users")
    .select("id")
    .ilike("email", email)
    .limit(1);

  if (staffId !== null && staffId !== undefined && staffId !== "") {
    query = query.neq("id", staffId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Unable to check email: ${error.message}`);
  }

  if (data) {
    throw new Error("Email address is already assigned to another staff record.");
  }
}

async function createAuthUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      source: "PEFA Staff Management",
    },
  });

  if (error || !data?.user) {
    throw new Error(error?.message || "Unable to create Supabase Authentication account.");
  }

  return data.user;
}

async function updateAuthUser(
  authUserId: string,
  attributes: Record<string, unknown>
) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    authUserId,
    attributes as any
  );

  if (error || !data?.user) {
    throw new Error(error?.message || "Unable to update Supabase Authentication account.");
  }

  return data.user;
}

async function deleteAuthUser(authUserId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

  if (error) {
    throw new Error(error.message || "Unable to delete Supabase Authentication account.");
  }
}

async function createStaff(payload: any) {
  const username = normalizeUsername(payload.username);
  const email = normalizeEmail(payload.email);
  const fullName = cleanText(payload.full_name);
  const password = payload.password;

  if (!username) throw new Error("Username is required.");
  if (!fullName) throw new Error("Full name is required.");
  if (!email) throw new Error("Email is required for the Supabase Authentication account.");
  if (!validPassword(password)) throw new Error("Password must contain at least 6 characters.");
  if (!payload.role) throw new Error("Staff role is required.");

  await ensureUniqueUsername(username);
  await ensureUniqueEmail(email);

  const authUser = await createAuthUser(email, password, fullName);

  const row = {
    username,
    full_name: fullName,
    email,
    phone: cleanText(payload.phone),
    role: cleanText(payload.role),
    department: cleanText(payload.department),
    branch: cleanText(payload.branch),
    profile_photo: cleanText(payload.profile_photo),
    signature_url: cleanText(payload.signature_url),
    status: cleanText(payload.status) || "Active",
    auth_user_id: authUser.id,
  };

  const { data, error } = await supabaseAdmin
    .from("staff_users")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    // Roll back the Auth user if the staff profile cannot be created.
    try {
      await deleteAuthUser(authUser.id);
    } catch (rollbackError) {
      console.error("[STAFF AUTH] Auth rollback failed:", rollbackError);
    }

    throw new Error(error?.message || "Unable to create staff profile.");
  }

  return data;
}

async function updateStaff(payload: any) {
  const staffId = payload.staff_id;

  if (staffId === null || staffId === undefined || staffId === "") {
    throw new Error("Staff ID is required for an update.");
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("staff_users")
    .select("*")
    .eq("id", staffId)
    .single();

  if (existingError || !existing) {
    throw new Error(existingError?.message || "Staff record was not found.");
  }

  const username = normalizeUsername(payload.username || existing.username);
  const email = normalizeEmail(payload.email || existing.email);
  const fullName = cleanText(payload.full_name || existing.full_name);

  if (!username) throw new Error("Username is required.");
  if (!email) throw new Error("Email is required for the Supabase Authentication account.");
  if (!fullName) throw new Error("Full name is required.");

  await ensureUniqueUsername(username, staffId);
  await ensureUniqueEmail(email, staffId);

  let authUserId = existing.auth_user_id || null;
  let newlyCreatedAuthUserId: string | null = null;

  // If an older staff row has no auth_user_id, create its Auth account when
  // the administrator supplies a password. This is also the repair path for
  // the current reception record.
  if (!authUserId) {
    if (!validPassword(payload.password)) {
      throw new Error(
        "This staff account is not linked to Supabase Authentication. Enter a password to create and link its Authentication account."
      );
    }

    const authUser = await createAuthUser(email, payload.password, fullName);
    authUserId = authUser.id;
    newlyCreatedAuthUserId = authUser.id;
  } else {
    const authAttributes: Record<string, unknown> = {
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        source: "PEFA Staff Management",
      },
    };

    if (validPassword(payload.password)) {
      authAttributes.password = payload.password;
    }

    await updateAuthUser(authUserId, authAttributes);
  }

  const row: Record<string, unknown> = {
    username,
    full_name: fullName,
    email,
    phone: cleanText(payload.phone),
    role: cleanText(payload.role),
    department: cleanText(payload.department),
    branch: cleanText(payload.branch),
    profile_photo: cleanText(payload.profile_photo),
    signature_url: cleanText(payload.signature_url),
    status: cleanText(payload.status) || existing.status || "Active",
    auth_user_id: authUserId,
  };

  // Do not write plaintext passwords into staff_users.
  row.password = null;

  const { data, error } = await supabaseAdmin
    .from("staff_users")
    .update(row)
    .eq("id", staffId)
    .select("*")
    .single();

  if (error || !data) {
    if (newlyCreatedAuthUserId) {
      try {
        await deleteAuthUser(newlyCreatedAuthUserId);
      } catch (rollbackError) {
        console.error("[STAFF AUTH] Auth rollback failed after profile update failure:", rollbackError);
      }
    }

    throw new Error(error?.message || "Unable to update staff profile.");
  }

  return data;
}

async function resetPassword(payload: any) {
  const staffId = payload.staff_id;
  const password = payload.password;

  if (staffId === null || staffId === undefined || staffId === "") {
    throw new Error("Staff ID is required.");
  }

  if (!validPassword(password)) {
    throw new Error("Password must contain at least 6 characters.");
  }

  const { data: staff, error } = await supabaseAdmin
    .from("staff_users")
    .select("id, full_name, username, auth_user_id")
    .eq("id", staffId)
    .single();

  if (error || !staff) {
    throw new Error(error?.message || "Staff record was not found.");
  }

  if (!staff.auth_user_id) {
    throw new Error("This staff account is not linked to Supabase Authentication. Edit the staff record and enter a password to create the link.");
  }

  await updateAuthUser(staff.auth_user_id, {
    password,
  });

  // Remove any legacy plaintext password from staff_users when the column exists.
  const { error: cleanupError } = await supabaseAdmin
    .from("staff_users")
    .update({ password: null })
    .eq("id", staffId);

  if (cleanupError) {
    console.warn("[STAFF AUTH] Legacy password cleanup warning:", cleanupError.message);
  }

  return staff;
}

async function setStatus(payload: any) {
  const staffId = payload.staff_id;
  const status = cleanText(payload.status) || "Disabled";

  if (staffId === null || staffId === undefined || staffId === "") {
    throw new Error("Staff ID is required.");
  }

  if (!["Active", "Disabled"].includes(status)) {
    throw new Error("Invalid staff status.");
  }

  const { data: staff, error: staffError } = await supabaseAdmin
    .from("staff_users")
    .select("*")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) {
    throw new Error(staffError?.message || "Staff record was not found.");
  }

  if (staff.auth_user_id) {
    // Supabase Auth supports temporary bans through ban_duration. The staff
    // table remains the authoritative PEFA application status as well.
    await updateAuthUser(staff.auth_user_id, {
      ban_duration: status === "Disabled" ? "876000h" : "none",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("staff_users")
    .update({
      status,
      password: null,
    })
    .eq("id", staffId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to change staff status.");
  }

  return data;
}

async function deleteStaff(payload: any) {
  const staffId = payload.staff_id;

  if (staffId === null || staffId === undefined || staffId === "") {
    throw new Error("Staff ID is required.");
  }

  const { data: staff, error: staffError } = await supabaseAdmin
    .from("staff_users")
    .select("id, full_name, username, auth_user_id")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) {
    throw new Error(staffError?.message || "Staff record was not found.");
  }

  if (staff.auth_user_id) {
    await deleteAuthUser(staff.auth_user_id);
  }

  const { error } = await supabaseAdmin
    .from("staff_users")
    .delete()
    .eq("id", staffId);

  if (error) {
    throw new Error(error.message || "Unable to delete staff record.");
  }

  return {
    id: staff.id,
    full_name: staff.full_name,
    username: staff.username,
  };
}


function sanitizeStaff(staff: any) {
  if (!staff) return staff;

  const { password: _password, ...safeStaff } = staff;
  return safeStaff;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response(
      { success: false, error: "Method not allowed." },
      405
    );
  }

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return response(
      {
        success: false,
        error: "Supabase server configuration is incomplete.",
      },
      500
    );
  }

  try {
    const user = await getAuthenticatedUser(req);
    await authorizeManager(user);

    let payload: Record<string, any> = {};

    try {
      payload = await req.json();
    } catch {
      return response(
        { success: false, error: "Invalid JSON request body." },
        400
      );
    }

    const action = cleanText(payload.action).toLowerCase();

    let staff;

    switch (action) {
      case "create":
        staff = await createStaff(payload);
        break;

      case "update":
        staff = await updateStaff(payload);
        break;

      case "reset_password":
        staff = await resetPassword(payload);
        break;

      case "set_status":
        staff = await setStatus(payload);
        break;

      case "delete":
        staff = await deleteStaff(payload);
        break;

      default:
        return response(
          {
            success: false,
            error:
              "Unsupported staff authentication action. Use create, update, reset_password, set_status or delete.",
          },
          400
        );
    }

    return response({
      success: true,
      action,
      staff: sanitizeStaff(staff),
    });
  } catch (error) {
    console.error("[STAFF AUTH] Function error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Staff authentication request failed.";

    return response(
      {
        success: false,
        error: message,
      },
      400
    );
  }
});
