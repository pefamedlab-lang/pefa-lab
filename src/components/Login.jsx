import { useState } from "react";

export default function Login({
  staffAccounts,
  setLoggedInUser,
}) {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
    const user =
      staffAccounts.find(
        (staff) =>
          staff.username ===
            username &&
          staff.password ===
            password
      );

    if (user) {
      setLoggedInUser(user);

      alert(
        `Welcome ${user.name}`
      );
    } else {
      alert(
        "Invalid Login"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        background: "white",
        padding: "40px",
        borderRadius: "15px",
      }}
    >
      <h2>
        PEFA STAFF LOGIN
      </h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
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
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "14px",
          background: "#0097b2",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}