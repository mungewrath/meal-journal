"use client";
import { Box, Container, Typography } from "@mui/material";
import { Header } from "./Header";
import { AddComponent } from "@/ui/AddComponent";
import { MealHistory } from "@/ui/MealHistory";

export default function Home() {
  return (
    <>
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
    </>
  );
}
