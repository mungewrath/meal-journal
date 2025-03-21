"use client";
import * as React from "react";
import Header from "./Header";
import AddComponent from "../ui/AddComponent";
import { Box, Container, Typography } from "@mui/material";
import { MealHistory } from "../ui/MealHistory";

export default function Home() {
  return (
    <div>
      <Header />
      <Container>
        <Box my={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to My Belly&apos;s Diary
          </Typography>
          <AddComponent />
          <MealHistory />
        </Box>
      </Container>
    </div>
  );
}
