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
import { useState, useEffect, useMemo } from "react";
import { AddItemsComponent } from "@/ui/AddItemsComponent";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  saveMeal,
  clearSaveError,
  selectSaving,
  selectSaveError,
} from "@/lib/features/meals/mealsSlice";
import {
  fetchSuggestedFoods,
  selectSuggestedFoods,
  selectLoading as selectFoodsLoading,
  selectError as selectFoodsError,
  clearSuggestedFoods,
  clearError as clearSuggestedFoodsError,
} from "@/lib/features/foods/foodsSlice";
import { useAuth } from "react-oidc-context";

interface Item {
  id: string;
  name: string;
  suggested: boolean;
  selected: boolean;
}

export const AddEntryComponent = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const saving = useAppSelector(selectSaving);
  const saveError = useAppSelector(selectSaveError);
  const suggestedFoods = useAppSelector(selectSuggestedFoods);
  const foodsLoading = useAppSelector(selectFoodsLoading);
  const foodsError = useAppSelector(selectFoodsError);

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
    dispatch(clearSuggestedFoods());
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
            foods: selectedItems
              .filter((food) => food.selected)
              .map((item) => ({
                food_id: item.id,
                name: item.name,
              })),
          },
          idToken: auth.user.id_token,
        })
      );

      // TODO: Is this going to catch errors correctly? Looks like the dispatch is async and this won't be updated
      if (!saveError) {
        handleClear();
      }
    } else {
      // TODO: Implement symptom saving
      console.log("Saving symptom:", { entryName, date, time, selectedItems });
    }
  };

  useEffect(() => {
    // Set the default date to today's date in Pacific Time
    const today = new Date();
    const pacificOffset = -7 * 60; // Pacific Time is UTC-7
    const pacificDate = new Date(today.getTime() + pacificOffset * 60 * 1000);
    const formattedDate = pacificDate.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  // Fetch suggested foods when meal type changes. Dependent on auth being available
  // which is why it can't be a direct event handler
  useEffect(() => {
    if (selectedOption === "meal" && entryName && auth.user?.id_token) {
      dispatch(
        fetchSuggestedFoods({
          mealType: entryName,
          idToken: auth.user.id_token,
        })
      );
    }
  }, [selectedOption, entryName, auth.user?.id_token, dispatch]);

  const mergedSelectedItems = useMemo(() => {
    const prevAndSuggested = [
      ...selectedItems.filter((item) => !item.suggested || item.selected),
      ...suggestedFoods.map((food) => ({
        id: food.id,
        name: food.name,
        suggested: true,
        selected: false,
      })),
    ];

    return prevAndSuggested
      .filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedItems, suggestedFoods]);

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
          {(saveError || foodsError) && (
            <Alert
              severity="error"
              onClose={() => {
                dispatch(clearSaveError());
                dispatch(clearSuggestedFoodsError());
              }}
            >
              {saveError || foodsError}
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
                items={mergedSelectedItems}
                onChange={setSelectedItems}
                disabled={saving || foodsLoading}
                placeholder="Search for foods or add a new one..."
                label="Food"
              />
              {foodsLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
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
                saving ||
                !entryName ||
                !date ||
                mergedSelectedItems.filter((f) => f.selected).length === 0
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
