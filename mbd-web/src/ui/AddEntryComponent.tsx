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
  CircularProgress,
  Alert,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HealingIcon from "@mui/icons-material/Healing";
import { useState, useEffect } from "react";
import { AddItemsComponent } from "@/ui/AddItemsComponent";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  saveMeal,
  clearSaveError,
  selectSaving,
  selectSaveError,
} from "@/lib/features/meals/mealsSlice";
import { useAuth } from "react-oidc-context";

interface Item {
  id: string;
  name: string;
}

export const AddEntryComponent = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const saving = useAppSelector(selectSaving);
  const saveError = useAppSelector(selectSaveError);
  const [entryName, setEntryName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("meal");
  const [expanded, setExpanded] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const handleEntryNameChange = (event: SelectChangeEvent<string>) => {
    setEntryName(event.target.value as string);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
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

  const handleClear = () => {
    setEntryName("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setSelectedItems([]);
  };

  const handleSave = async () => {
    if (!auth.user?.id_token) {
      console.error("No ID token available");
      return;
    }

    if (selectedOption === "meal") {
      const dateTime = `${date}T${time || "00:00"}`;
      dispatch(
        saveMeal({
          meal: {
            mealType: entryName,
            dateTime,
            foods: selectedItems.map((item) => ({
              name: item.name,
            })),
          },
          idToken: auth.user.id_token,
        })
      );

      if (!saveError) {
        handleClear();
      }
    } else {
      // TODO: Implement symptom saving
      console.log("Saving symptom:", { entryName, date, time, selectedItems });
    }
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
          {saveError && (
            <Alert severity="error" onClose={() => dispatch(clearSaveError())}>
              {saveError}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant={selectedOption === "meal" ? "contained" : "outlined"}
              startIcon={<RestaurantIcon />}
              onClick={() => handleOptionChange("meal")}
              sx={{ flexGrow: 1, mr: 1 }}
              disabled={saving}
            >
              Meal
            </Button>
            <Button
              variant={selectedOption === "symptom" ? "contained" : "outlined"}
              startIcon={<HealingIcon />}
              onClick={() => handleOptionChange("symptom")}
              sx={{ flexGrow: 1, ml: 1 }}
              disabled={saving}
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
              disabled={saving}
            />
            <TextField
              label="Time"
              type="time"
              value={time}
              onChange={handleTimeChange}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flexGrow: 1 }}
              disabled={saving}
            />
          </Box>
          {selectedOption === "meal" ? (
            <>
              <FormControl>
                <InputLabel>Meal Name</InputLabel>
                <Select
                  value={entryName}
                  onChange={handleEntryNameChange}
                  disabled={saving}
                >
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                  <MenuItem value="Snack">Snack</MenuItem>
                </Select>
              </FormControl>
              <AddItemsComponent
                items={selectedItems}
                onChange={setSelectedItems}
                disabled={saving}
                placeholder="Search for foods or add a new one..."
                label="Food"
              />
            </>
          ) : (
            <AddItemsComponent
              items={selectedItems}
              onChange={setSelectedItems}
              disabled={saving}
              placeholder="Search for symptoms or add a new one..."
              label="Symptom"
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleClear}
              disabled={saving}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={
                saving || !entryName || !date || selectedItems.length === 0
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
