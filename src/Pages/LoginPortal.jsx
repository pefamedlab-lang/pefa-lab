
/* ============================================================
   PEFA LIS
   LOGIN PORTAL
   ------------------------------------------------------------
   VERSION
   ------------------------------------------------------------
   Clean production login flow.

   FEATURES
   ------------------------------------------------------------
   ✓ Username login
   ✓ Email login
   ✓ Supabase Authentication
   ✓ auth_user_id verification
   ✓ Active staff verification
   ✓ PEFA localStorage session
   ✓ Immediate dashboard navigation
   ✓ Non-blocking audit logging
   ✓ Duplicate-click protection
   ✓ No artificial Supabase promise timeout
   ✓ Clear login status
   ============================================================ */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";


/* ============================================================
   STAFF FIELDS
   ============================================================ */

const STAFF_FIELDS = `
  id,
  username,
  full_name,
  email,
  role,
  department,
  status,
  branch,
  signature_url,
  phone,
  profile_photo,
  auth_user_id
`;


/* ============================================================
   HELPERS
   ============================================================ */

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}


function isActive(status) {
  return (
    String(status || "")
      .trim()
      .toLowerCase() === "active"
  );
}


/* ============================================================
   LOGIN PORTAL
   ============================================================ */

export default function LoginPortal() {
  const navigate = useNavigate();


  /* ==========================================================
     STATE
     ========================================================== */

  const [loginValue, setLoginValue] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");


  /* ==========================================================
     MESSAGE
     ========================================================== */

  const showMessage = (
    text,
    type = "error"
  ) => {
    setMessage(text);
    setMessageType(type);
  };


  /* ==========================================================
     LOGIN
     ========================================================== */

  const login = async (event) => {
    event.preventDefault();


    /* --------------------------------------------------------
       PREVENT DOUBLE CLICK
       -------------------------------------------------------- */

    if (loading) {
      return;
    }


    /* --------------------------------------------------------
       INPUT
       -------------------------------------------------------- */

    const identifier =
      loginValue.trim();

    const cleanPassword =
      password;


    /* --------------------------------------------------------
       VALIDATION
       -------------------------------------------------------- */

    if (!identifier) {
      showMessage(
        "Enter your username or email."
      );

      return;
    }


    if (!cleanPassword) {
      showMessage(
        "Enter your password."
      );

      return;
    }


    /* --------------------------------------------------------
       START
       -------------------------------------------------------- */

    setLoading(true);

    showMessage(
      "Starting secure login...",
      "loading"
    );


    try {
      let email = "";
      let staff = null;


      /* ======================================================
         STEP 1
         IDENTIFY LOGIN TYPE
         ====================================================== */

      if (
        isEmail(identifier)
      ) {

        /* ----------------------------------------------------
           EMAIL LOGIN
           ---------------------------------------------------- */

        email =
          identifier.toLowerCase();


        showMessage(
          "Authenticating...",
          "loading"
        );

      } else {

        /* ----------------------------------------------------
           USERNAME LOGIN
           ---------------------------------------------------- */

        showMessage(
          "Finding staff account...",
          "loading"
        );


        const {
          data,
          error,
        } = await supabase
          .from("staff_users")
          .select(`
            id,
            username,
            email,
            auth_user_id,
            status
          `)
          .eq(
            "username",
            identifier
          )
          .maybeSingle();


        if (error) {

          console.error(
            "Username lookup error:",
            error
          );


          showMessage(
            `Unable to check staff account: ${error.message}`
          );

          return;
        }


        if (!data) {

          showMessage(
            "Staff account not found."
          );

          return;
        }


        /* ----------------------------------------------------
           STATUS CHECK
           ---------------------------------------------------- */

        if (
          !isActive(data.status)
        ) {

          showMessage(
            "Your staff account is disabled. Please contact an administrator."
          );

          return;
        }


        /* ----------------------------------------------------
           AUTH LINK CHECK
           ---------------------------------------------------- */

        if (
          !data.auth_user_id
        ) {

          showMessage(
            "This staff account is not linked to Supabase Authentication. Please contact an administrator."
          );

          return;
        }


        /* ----------------------------------------------------
           EMAIL
           ---------------------------------------------------- */

        email =
          data.email
            ?.trim()
            .toLowerCase();


        if (!email) {

          showMessage(
            "This staff account does not have a valid email address."
          );

          return;
        }
      }


      /* ======================================================
         STEP 2
         SUPABASE AUTHENTICATION
         ------------------------------------------------------
         IMPORTANT:
         Do NOT wrap this in Promise.race().
         Supabase returns a proper Auth response.
         ====================================================== */

      showMessage(
        "Authenticating...",
        "loading"
      );


      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password: cleanPassword,
        });


      /* ======================================================
         AUTH ERROR
         ====================================================== */

      if (authError) {

        console.error(
          "Supabase authentication error:",
          authError
        );


        const authMessage =
          authError.message ||
          "Invalid email or password.";


        if (
          authMessage
            .toLowerCase()
            .includes(
              "email not confirmed"
            )
        ) {

          showMessage(
            "Your email address has not been verified. Please verify your email before logging in."
          );

        } else if (
          authMessage
            .toLowerCase()
            .includes(
              "invalid login credentials"
            )
        ) {

          showMessage(
            "Invalid email/username or password."
          );

        } else {

          showMessage(
            authMessage
          );
        }


        return;
      }


      /* ======================================================
         STEP 3
         AUTH USER
         ====================================================== */

      const authUser =
        authData?.user;


      if (!authUser) {

        showMessage(
          "Authentication failed. No authenticated user was returned."
        );

        return;
      }


      /* ======================================================
         STEP 4
         GET PEFA STAFF RECORD
         ====================================================== */

      showMessage(
        "Verifying staff account...",
        "loading"
      );


      const {
        data: staffData,
        error: staffError,
      } =
        await supabase
          .from("staff_users")
          .select(STAFF_FIELDS)
          .eq(
            "auth_user_id",
            authUser.id
          )
          .maybeSingle();


      /* ======================================================
         STAFF LOOKUP ERROR
         ====================================================== */

      if (staffError) {

        console.error(
          "Staff verification error:",
          staffError
        );


        /*
         * Authentication succeeded, but PEFA staff profile
         * verification failed.
         */

        await supabase.auth.signOut();


        showMessage(
          `Unable to verify your PEFA staff profile: ${staffError.message}`
        );

        return;
      }


      staff =
        staffData;


      /* ======================================================
         STAFF MUST EXIST
         ====================================================== */

      if (!staff) {

        await supabase.auth.signOut();


        showMessage(
          "Your Supabase account is not linked to a PEFA staff account. Please contact an administrator."
        );

        return;
      }


      /* ======================================================
         STEP 5
         AUTH USER ID SECURITY CHECK
         ====================================================== */

      if (
        String(staff.auth_user_id) !==
        String(authUser.id)
      ) {

        console.error(
          "AUTH USER ID MISMATCH",
          {
            authenticatedUser:
              authUser.id,

            staffAuthUser:
              staff.auth_user_id,
          }
        );


        await supabase.auth.signOut();


        showMessage(
          "This staff account is not correctly linked to the authenticated user."
        );

        return;
      }


      /* ======================================================
         STEP 6
         ACTIVE STATUS
         ====================================================== */

      if (
        !isActive(
          staff.status
        )
      ) {

        await supabase.auth.signOut();


        showMessage(
          "Your staff account is disabled. Please contact an administrator."
        );

        return;
      }


      /* ======================================================
         STEP 7
         CREATE PEFA USER OBJECT
         ====================================================== */

      const pefaUser = {
        id:
          staff.id,

        username:
          staff.username || "",

        full_name:
          staff.full_name || "",

        email:
          staff.email || "",

        role:
          staff.role || "",

        department:
          staff.department || "",

        status:
          staff.status || "",

        branch:
          staff.branch || "",

        signature_url:
          staff.signature_url || "",

        phone:
          staff.phone || "",

        profile_photo:
          staff.profile_photo || "",

        auth_user_id:
          staff.auth_user_id,

        supabase_user_id:
          authUser.id,
      };


      /* ======================================================
         STEP 8
         SAVE PEFA SESSION
         ====================================================== */

      try {

        localStorage.setItem(
          "pefa_user",
          JSON.stringify(
            pefaUser
          )
        );

      } catch (storageError) {

        console.error(
          "PEFA session storage error:",
          storageError
        );


        await supabase.auth.signOut();


        showMessage(
          "Unable to save the PEFA login session in this browser."
        );

        return;
      }


      /* ======================================================
         STEP 9
         VERIFY LOCAL SESSION
         ====================================================== */

      const savedUser =
        localStorage.getItem(
          "pefa_user"
        );


      if (!savedUser) {

        await supabase.auth.signOut();


        showMessage(
          "PEFA login session could not be saved."
        );

        return;
      }


      /* ======================================================
         STEP 10
         NAVIGATE IMMEDIATELY
         ====================================================== */

      showMessage(
        "Login successful. Opening dashboard...",
        "success"
      );


      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );


      /* ======================================================
         STEP 11
         AUDIT LOG
         ------------------------------------------------------
         NEVER await this.
         ====================================================== */

      supabase
        .from("audit_logs")
        .insert([
          {
            user_name:
              staff.full_name,

            user_role:
              staff.role,

            action:
              "User Login",

            module:
              "Authentication",

            description:
              `${staff.full_name} logged into PEFA LIS`,
          },
        ])
        .then(
          ({ error }) => {

            if (error) {

              console.warn(
                "Login audit log failed:",
                error
              );
            }
          }
        )
        .catch(
          (error) => {

            console.warn(
              "Login audit log exception:",
              error
            );
          }
        );


    } catch (error) {

      /* ======================================================
         UNEXPECTED ERROR
         ====================================================== */

      console.error(
        "PEFA Login Error:",
        error
      );


      showMessage(
        error?.message ||
          "Login failed. Please try again."
      );


    } finally {

      /* ======================================================
         ALWAYS STOP LOADING
         ====================================================== */

      setLoading(false);
    }
  };


  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        background:
          "#f8fafc",

        padding:
          "20px",

        boxSizing:
          "border-box",
      }}
    >

      <form
        onSubmit={login}

        style={{
          width:
            "100%",

          maxWidth:
            "450px",

          background:
            "#ffffff",

          padding:
            "40px",

          borderRadius:
            "20px",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",

          boxSizing:
            "border-box",
        }}
      >

        {/* ==================================================
            HEADER
            ================================================== */}

        <h1
          style={{
            margin:
              "0 0 8px 0",

            fontSize:
              "30px",

            fontWeight:
              "800",

            color:
              "#0f172a",
          }}
        >
          PEFA LIS
        </h1>


        <p
          style={{
            margin:
              "0 0 30px 0",

            color:
              "#64748b",

            fontSize:
              "15px",
          }}
        >
          Enterprise Login Portal
        </p>


        {/* ==================================================
            USERNAME / EMAIL
            ================================================== */}

        <input
          type="text"

          placeholder="Username or Email"

          value={loginValue}

          onChange={(event) => {

            setLoginValue(
              event.target.value
            );

            if (!loading) {
              setMessage("");
              setMessageType("");
            }
          }}

          required

          disabled={
            loading
          }

          autoFocus

          autoComplete="username"

          style={{
            width:
              "100%",

            height:
              "55px",

            marginBottom:
              "15px",

            padding:
              "0 15px",

            border:
              "1px solid #cbd5e1",

            borderRadius:
              "12px",

            outline:
              "none",

            fontSize:
              "15px",

            boxSizing:
              "border-box",
          }}
        />


        {/* ==================================================
            PASSWORD
            ================================================== */}

        <input
          type="password"

          placeholder="Password"

          value={password}

          onChange={(event) => {

            setPassword(
              event.target.value
            );

            if (!loading) {
              setMessage("");
              setMessageType("");
            }
          }}

          required

          disabled={
            loading
          }

          autoComplete="current-password"

          style={{
            width:
              "100%",

            height:
              "55px",

            marginBottom:
              "20px",

            padding:
              "0 15px",

            border:
              "1px solid #cbd5e1",

            borderRadius:
              "12px",

            outline:
              "none",

            fontSize:
              "15px",

            boxSizing:
              "border-box",
          }}
        />


        {/* ==================================================
            STATUS
            ================================================== */}

        {message && (
          <div
            style={{
              marginBottom:
                "18px",

              padding:
                "12px 14px",

              borderRadius:
                "10px",

              background:
                messageType ===
                "loading"
                  ? "#eff6ff"
                  : messageType ===
                    "success"
                    ? "#f0fdf4"
                    : "#fef2f2",

              color:
                messageType ===
                "loading"
                  ? "#1d4ed8"
                  : messageType ===
                    "success"
                    ? "#15803d"
                    : "#b91c1c",

              border:
                messageType ===
                "loading"
                  ? "1px solid #bfdbfe"
                  : messageType ===
                    "success"
                    ? "1px solid #bbf7d0"
                    : "1px solid #fecaca",

              fontSize:
                "14px",

              lineHeight:
                "1.5",
            }}
          >

            {messageType ===
              "loading" && (
              <span
                style={{
                  display:
                    "inline-block",

                  width:
                    "8px",

                  height:
                    "8px",

                  marginRight:
                    "8px",

                  borderRadius:
                    "50%",

                  background:
                    "#2563eb",
                }}
              />
            )}

            {message}

          </div>
        )}


        {/* ==================================================
            LOGIN BUTTON
            ================================================== */}

        <button
          type="submit"

          disabled={
            loading
          }

          style={{
            width:
              "100%",

            height:
              "55px",

            border:
              "none",

            borderRadius:
              "12px",

            background:
              loading
                ? "#64748b"
                : "#2563eb",

            color:
              "#ffffff",

            fontWeight:
              "700",

            fontSize:
              "15px",

            cursor:
              loading
                ? "not-allowed"
                : "pointer",

            opacity:
              loading
                ? 0.8
                : 1,

            transition:
              "all 0.2s ease",
          }}
        >
          {loading
            ? "Signing In..."
            : "Staff Login"}
        </button>

      </form>

    </div>
  );
}