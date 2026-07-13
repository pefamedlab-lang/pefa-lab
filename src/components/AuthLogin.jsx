import "../styles/dashboard.css";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Lock,
  Mail,
  LogIn,
} from "lucide-react";

export default function AuthLogin() {
  const navigate =
    useNavigate();

  // STATES

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // LOGIN

  const handleLogin =
    async (e) => {
      e.preventDefault();

      setLoading(true);

      // TEMP DEVELOPMENT LOGIN

      if (
        email ===
          "admin@pefa.com" &&
        password ===
          "admin123"
      ) {
        localStorage.setItem(
          "pefa_user",

          JSON.stringify({
            full_name:
              "Administrator",

            role:
              "Admin",
          })
        );

        navigate(
          "/dashboard"
        );
      }

      else {
        alert(
          "Invalid Login Credentials"
        );
      }

      setLoading(false);
    };

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "linear-gradient(to right, #0f172a, #1e3a8a)",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        padding: "20px",
      }}
    >
      {/* CARD */}

      <div
        style={{
          background:
            "white",

          width: "100%",

          maxWidth:
            "450px",

          padding: "40px",

          borderRadius:
            "20px",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* TITLE */}

        <div
          style={{
            textAlign:
              "center",

            marginBottom:
              "35px",
          }}
        >
          <h1
            style={{
              color:
                "#0f172a",

              marginBottom:
                "10px",
            }}
          >
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p
            style={{
              color:
                "#6b7280",
            }}
          >
            Enterprise
            Laboratory
            Information
            System
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleLogin
          }
        >
          {/* EMAIL */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label>
              Email
            </label>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Mail
                size={18}
                style={{
                  position:
                    "absolute",

                  left: "12px",

                  top: "15px",

                  color:
                    "#6b7280",
                }}
              />

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target
                      .value
                  )
                }
                style={{
                  paddingLeft:
                    "40px",
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div
            style={{
              marginBottom:
                "30px",
            }}
          >
            <label>
              Password
            </label>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Lock
                size={18}
                style={{
                  position:
                    "absolute",

                  left: "12px",

                  top: "15px",

                  color:
                    "#6b7280",
                }}
              />

              <input
                type="password"
                placeholder="Enter Password"
                value={
                  password
                }
                onChange={(e) =>
                  setPassword(
                    e.target
                      .value
                  )
                }
                style={{
                  paddingLeft:
                    "40px",
                }}
              />
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="logout-btn"
            style={{
              width: "100%",

              justifyContent:
                "center",

              padding:
                "14px",
            }}
          >
            <LogIn
              size={18}
            />

            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* DEMO */}

        <div
          style={{
            marginTop:
              "30px",

            textAlign:
              "center",

            color:
              "#6b7280",

            fontSize:
              "14px",
          }}
        >
          Demo Login:
          <br />

          admin@pefa.com
          <br />

          Password:
          admin123
        </div>
      </div>
    </div>
  );
}