import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HealingIcon from "@mui/icons-material/Healing";
import { useState, useEffect } from "react";

export const AddComponent = () => {
  const [mealName, setMealName] = useState("");
  const [date, setDate] = useState("");
  const [selectedOption, setSelectedOption] = useState("meal");
  const [expanded, setExpanded] = useState(true);

  const handleMealNameChange = (event: SelectChangeEvent<string>) => {
    setMealName(event.target.value as string);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleAccordionChange = (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded);
  };

  useEffect(() => {
    // Set the default date to today's date
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {!expanded
            ? "Add a Meal or Symptom"
            : selectedOption === "meal"
              ? "Add a Meal"
              : "Add a Symptom"}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant={selectedOption === "meal" ? "contained" : "outlined"}
              startIcon={<RestaurantIcon />}
              onClick={() => handleOptionChange("meal")}
              sx={{ flexGrow: 1, mr: 1 }}
            >
              Meal
            </Button>
            <Button
              variant={selectedOption === "symptom" ? "contained" : "outlined"}
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
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Time"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
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
              {/* TODO: Update food input to allow multiple food entry */}
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
              Clear
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
  );
};
