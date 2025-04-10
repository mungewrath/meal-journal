"use client";
import { AuthProvider } from "react-oidc-context";
import LoginPage from "@/ui/LoginPage";
import { Box, Container, Typography } from "@mui/material";
import { Header } from "./Header";
import { AddComponent } from "@/ui/AddComponent";
import { MealHistory } from "@/ui/MealHistory";

export default function Home() {
  const cognitoAuthConfig = {
    authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT,
    response_type: "code",
    scope: "openid profile email",
    automaticSilentRenew: true,
    silent_redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT,
    accessTokenExpiringNotificationTimeInSeconds: 2 * 24 * 60 * 60,
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
          <AddComponent />
          <MealHistory />
        </Box>
      </Container>
    </AuthProvider>
  );
}
