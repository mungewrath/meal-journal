"use client";

import { useAuth } from "react-oidc-context";

function LoginPage() {
  const auth = useAuth();

  if (auth.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Auth Error: {auth.error.message}
      </div>
    );
  }

  if (auth.isAuthenticated && process.env.NEXT_PUBLIC_DEBUG_AUTH === "true") {
    console.log(auth.user);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="space-y-2 overflow-x-auto">
            <pre> User: {auth.user?.profile["cognito:username"] as string}</pre>
            <pre> ID Token: {auth.user?.id_token} </pre>
            <pre> Access Token: {auth.user?.access_token} </pre>
            <pre> Refresh Token: {auth.user?.refresh_token} </pre>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
