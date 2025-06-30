import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthContainer = () => {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {view === "login" ? <Login /> : <Register />}
      <div className="text-center">
        {view === "login" ? (
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              onClick={() => setView("register")}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              onClick={() => setView("login")}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;