"use client";
import * as React from "react";
import { AuthProvider } from "react-oidc-context";
import Header from "./Header";
import AddComponent from "../ui/AddComponent";
import { Box, Container, Typography } from "@mui/material";
import { MealHistory } from "../ui/MealHistory";
import LoginPage from "@/ui/LoginPage";

export default function Home() {
  const cognitoAuthConfig = {
    authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT,
    response_type: "code",
    scope: "openid profile email",
  };

  return (
    <div>
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
    </div>
  );
}
