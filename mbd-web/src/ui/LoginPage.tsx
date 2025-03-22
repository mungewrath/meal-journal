"use client";

import React from "react";
import { useAuth } from "react-oidc-context";
import Button from "@mui/material/Button";

function LoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Error
      </div>
    );
  }

  if (auth.isAuthenticated) {
    console.log(auth.user);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          Welcome, {auth.user?.profile["cognito:username"]}
          <div className="space-y-2 overflow-x-auto">
            <pre> ID Token: {auth.user?.id_token} </pre>
            <pre> Access Token: {auth.user?.access_token} </pre>
            <pre> Refresh Token: {auth.user?.refresh_token} </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Button onClick={() => auth.signinRedirect()}>Sign in</Button>
    </div>
  );
}

export default LoginPage;
