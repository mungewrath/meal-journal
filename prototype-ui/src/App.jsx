import React from "react";
import FoodJournalApp from "./components/FoodJournalApp";
import { useAuth } from "react-oidc-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "2sr1932m3b9l641vdo6151uoor";
    const logoutUri = "https://poohbear";
    const cognitoDomain =
      "https://mj-user-pool-domain.auth.us-west-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto border-2 border-blue-200">
          <CardHeader className="bg-blue-500 text-white rounded-t-lg">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="bg-blue-50">
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-blue-800">Please wait...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto border-2 border-red-200">
          <CardHeader className="bg-red-500 text-white rounded-t-lg">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="bg-red-50">
            <p className="text-red-800 py-2">{auth.error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    console.log(auth.user);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-500 text-white rounded-t-lg">
              <CardTitle>
                Welcome, {auth.user?.profile["cognito:username"]}
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-blue-50 space-y-4">
              <div className="space-y-2 overflow-x-auto">
                <pre> ID Token: {auth.user?.id_token} </pre>
                <pre> Access Token: {auth.user?.access_token} </pre>
                <pre> Refresh Token: {auth.user?.refresh_token} </pre>
              </div>
              <Button
                variant="secondary"
                className="w-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-200"
                onClick={() => auth.removeUser()}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
          <FoodJournalApp />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto border-2 border-blue-200">
        <CardHeader className="bg-blue-500 text-white rounded-t-lg">
          <CardTitle>Welcome to Meal Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-blue-50 py-4">
          <Button
            variant="secondary"
            className="w-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-200"
            onClick={() => auth.signinRedirect()}
          >
            Sign in
          </Button>
          <Button
            variant="secondary"
            className="w-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-200"
            onClick={() => signOutRedirect()}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
