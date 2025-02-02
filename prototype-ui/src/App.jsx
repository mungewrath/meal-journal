import React from "react";
import FoodJournalApp from "./components/FoodJournalApp";
import { useAuth } from "react-oidc-context";

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
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => auth.removeUser()}>Sign out</button>

        <div className="min-h-screen bg-gray-50">
          <FoodJournalApp />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default App;
