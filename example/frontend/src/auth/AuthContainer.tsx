import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthContainer = () => {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="auth-container">
      {view === "login" ? <Login /> : <Register />}

      <div className="auth-toggle">
        {view === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              className="link-button"
              onClick={() => setView("register")}
            >
              Register now
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              className="link-button"
              onClick={() => setView("login")}
            >
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;