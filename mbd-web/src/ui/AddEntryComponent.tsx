import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HealingIcon from "@mui/icons-material/Healing";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  clearSaveError,
  selectSaving,
  selectSaveError,
} from "@/lib/features/meals/mealsSlice";
import {
  selectError as selectFoodsError,
  clearError as clearSuggestedFoodsError,
} from "@/lib/features/foods/foodsSlice";
import { AddMealComponent } from "./AddMealComponent";
import { AddSymptomComponent } from "./AddSymptomComponent";

export const AddEntryComponent = () => {
  const dispatch = useAppDispatch();

  const saving = useAppSelector(selectSaving);
  const saveError = useAppSelector(selectSaveError);
  const foodsError = useAppSelector(selectFoodsError);

  const [selectedOption, setSelectedOption] = useState("meal");
  const [expanded, setExpanded] = useState(true);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleAccordionChange = (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded);
  };

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
          {selectedOption === "meal" ? (
            <AddMealComponent />
          ) : (
            <AddSymptomComponent />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
