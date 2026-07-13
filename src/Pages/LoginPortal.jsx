import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function LoginPortal() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase

        .from("staff_users")

        .select("*")

        .eq(
          "username",
          username.trim()
        )

        .single();

      if (
        error ||
        !data
      ) {

        alert(
          "Username Not Found"
        );

        return;

      }

      if (
        String(
          data.password
        ).trim() !==
        String(
          password
        ).trim()
      ) {

        alert(
          "Wrong Password"
        );

        return;

      }

      if (
        data.status !==
        "Active"
      ) {

        alert(
          "Account Disabled"
        );

        return;

      }

      localStorage.setItem(
        "pefa_user",
        JSON.stringify({
          id: data.id,
          username:
            data.username,
          full_name:
            data.full_name,
          email:
            data.email,
          phone:
            data.phone,
          role:
            data.role,
          department:
            data.department,
          branch:
            data.branch,
          profile_photo:
            data.profile_photo,
          signature_url:
            data.signature_url,
          status:
            data.status,
        })
      );

await supabase
  .from("audit_logs")
  .insert([
    {
      user_name:
        data.full_name,

      user_role:
        data.role,

      action:
        "User Login",

      module:
        "Authentication",

      description:
        `${data.full_name} logged into PEFA LIS`,
    },
  ]);

      navigate(
        "/dashboard"
      );

    } catch (err) {

      console.error(err);

      alert(
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >

      <form
        onSubmit={login}
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >

        <h1
          style={{
            marginBottom: "8px",
          }}
        >
          PEFA LIS
        </h1>

        <p
          style={{
            marginBottom: "30px",
            color: "#64748b",
          }}
        >
          Enterprise Login Portal
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          required
          style={{
            width: "100%",
            height: "55px",
            marginBottom: "15px",
            padding: "0 15px",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
          style={{
            width: "100%",
            height: "55px",
            marginBottom: "20px",
            padding: "0 15px",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: "55px",
            border: "none",
            borderRadius: "12px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >

          {loading
            ? "Signing In..."
            : "Login"}

        </button>

      </form>

    </div>

  );
}