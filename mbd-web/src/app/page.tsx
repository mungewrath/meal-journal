"use client";
import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { useState, useEffect } from "react";
import Header from "./Header";
import AddComponent from "./AddComponent";
import { Box, Container, Typography } from "@mui/material";

export default function Home() {
  const [mealName, setMealName] = useState("");
  const [date, setDate] = useState("");
  const [selectedOption, setSelectedOption] = useState("meal");

  const handleMealNameChange = (event: SelectChangeEvent<string>) => {
    setMealName(event.target.value as string);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    // Set the default date to today's date
    const today = new Date().toISOString().split("T")[0];
    setDate(today);

    // Example of setting the date from a data call
    // fetch('/api/getDate')
    //   .then(response => response.json())
    //   .then(data => setDate(data.date));
  }, []);

  return (
    <div>
      <Header />
      <Container>
        <Box my={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to My Belly&apos;s Diary
          </Typography>
          <AddComponent
            mealName={mealName}
            date={date}
            selectedOption={selectedOption}
            handleMealNameChange={handleMealNameChange}
            handleDateChange={handleDateChange}
            handleOptionChange={handleOptionChange}
          />
        </Box>
      </Container>
    </div>
  );
}
