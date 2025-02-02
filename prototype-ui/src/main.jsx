import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_gholbnsH6",
  client_id: "2sr1932m3b9l641vdo6151uoor",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "openid profile email",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
