"use client";

import { useEffect } from "react";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../components/AuthProvider";

export default function Home() {
  const { ready, user, login } = useAuth();
  useEffect(() => {
    if (ready && user) window.location.replace("/dashboard");
  }, [ready, user]);
  if (!ready)
    return (
      <div className="page-state">
        <span className="loader" />
        Preparing workspace...
      </div>
    );
  return <LoginForm onLogin={login} />;
}
