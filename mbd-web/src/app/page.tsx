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
    authority:
      "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_3vQ5Mu7VR", // stage
    // "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_gholbnsH6", // prod
    // client_id: "2sr1932m3b9l641vdo6151uoor", //prod
    client_id: "6li7j91bl741p9st10pbvmgadm", //stage
    // redirect_uri: "http://localhost:3000",
    redirect_uri: "https://d1l9mogzhjoud6.cloudfront.net", // stage
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
