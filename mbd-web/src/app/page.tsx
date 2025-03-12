"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HealingIcon from "@mui/icons-material/Healing";
import { useState, useEffect } from "react";

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
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Belly&apos;s Diary
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to My Belly&apos;s Diary
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {selectedOption === "meal" ? "Add a Meal" : "Add a Symptom"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant={
                      selectedOption === "meal" ? "contained" : "outlined"
                    }
                    startIcon={<RestaurantIcon />}
                    onClick={() => handleOptionChange("meal")}
                    sx={{ flexGrow: 1, mr: 1 }}
                  >
                    Meal
                  </Button>
                  <Button
                    variant={
                      selectedOption === "symptom" ? "contained" : "outlined"
                    }
                    startIcon={<HealingIcon />}
                    onClick={() => handleOptionChange("symptom")}
                    sx={{ flexGrow: 1, ml: 1 }}
                  >
                    Symptom
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Date"
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
                {selectedOption === "meal" ? (
                  <>
                    <FormControl>
                      <InputLabel>Meal Name</InputLabel>
                      <Select value={mealName} onChange={handleMealNameChange}>
                        <MenuItem value="Breakfast">Breakfast</MenuItem>
                        <MenuItem value="Lunch">Lunch</MenuItem>
                        <MenuItem value="Dinner">Dinner</MenuItem>
                        <MenuItem value="Snack">Snack</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField label="Food" multiline rows={4} />
                  </>
                ) : (
                  <TextField label="Symptom" multiline rows={4} />
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                  >
                    Trash
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
      <footer></footer>
    </div>
  );
}
