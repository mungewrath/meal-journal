"use client";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import LoginPage from "@/ui/LoginPage";
import { Box, Container, Typography } from "@mui/material";
import { Header } from "./Header";
import { AddEntryComponent } from "@/ui/AddEntryComponent";
import { History } from "@/ui/History";

export default function Home() {
  const cognitoAuthConfig = {
    authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT,
    response_type: "code",
    scope: "openid profile email",
    automaticSilentRenew: true,
    silent_redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT,
    accessTokenExpiringNotificationTimeInSeconds: 12 * 60 * 60,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  };

  return (
    <AuthProvider {...cognitoAuthConfig}>
      <Header />
      <Container>
        <Box my={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to My Belly&apos;s Diary
          </Typography>
          <LoginPage />
          <AddEntryComponent />
          <History />
        </Box>
      </Container>
    </AuthProvider>
  );
}
