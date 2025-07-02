import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { AddItemsComponent } from "./AddItemsComponent";
import { DateTimeSelectorControls } from "./DateTimeSelectorControls";
import { FormControls } from "./FormControls";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useAuth } from "react-oidc-context";
import {
  fetchSuggestedFoods,
  selectSuggestedFoods,
  selectLoading as selectFoodsLoading,
} from "@/lib/features/foods/foodsSlice";
import {
  updateMeal,
  selectSaving as selectMealSaving,
  cancelEditing,
} from "@/lib/features/meals/mealsSlice";
import { convertToApiDateTime } from "@/lib/utils/dateUtils";
import { formatDate } from "@/lib/utils/dateUtils";
import { Meal } from "@/lib/features/meals/models";

interface Item {
  id: string;
  name: string;
  suggested: boolean;
  selected: boolean;
}

export const ReviseMealComponent = ({
  originalMeal,
}: {
  originalMeal: Meal;
}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // const selectedMeal = useAppSelector(selectSelectedMeal);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [entryName, setEntryName] = useState("");
  const [originalDateTime, setOriginalDateTime] = useState("");
  const [prepopulated, setPrepopulated] = useState(false);

  const saving = useAppSelector(selectMealSaving);
  // const saveError = useAppSelector(selectSaveError);
  const foodsLoading = useAppSelector(selectFoodsLoading);
  const suggestedFoods = useAppSelector(selectSuggestedFoods);

  // Initialize form with selected meal data
  useEffect(() => {
    if (originalMeal && !prepopulated) {
      const dateObj = originalMeal.dateTime;
      const formattedDate = dateObj.toISOString().split("T")[0];
      const formattedTime = dateObj.toTimeString().substring(0, 5);

      setDate(formattedDate);
      setTime(formattedTime);
      console.log("Re-broogaling Selected meal:", originalMeal);
      setEntryName(originalMeal.mealType);
      setOriginalDateTime(dateObj.toISOString());

      // Convert meal foods to items
      const items: Item[] = originalMeal.foods.map((food) => ({
        id: food.id,
        name: food.name,
        suggested: false,
        selected: true,
      }));

      setSelectedItems(items);
      setPrepopulated(true);
    }
  }, [originalMeal]);

  useEffect(() => {
    if (entryName && auth.user?.id_token) {
      dispatch(
        fetchSuggestedFoods({
          mealType: entryName,
          idToken: auth.user.id_token,
        })
      );
    }
  }, [entryName, auth.user?.id_token, dispatch]);

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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  const handleEntryNameChange = (event: SelectChangeEvent<string>) => {
    console.log("Entry name changed:", event.target.value);
    setEntryName(event.target.value as string);
  };

  const handleCancel = () => {
    dispatch(cancelEditing());
  };

  const handleSave = async () => {
    if (!auth.user?.id_token || !originalMeal) {
      console.error("No ID token available or no meal selected");
      return;
    }

    dispatch(
      updateMeal({
        meal: {
          meal_type: entryName,
          date_time: convertToApiDateTime(
            new Date(`${date}T${time || "00:00"}`)
          ),
          foods: selectedItems
            .filter((food) => food.selected)
            .map((item) => ({
              food_id: item.id,
              name: item.name,
              thumbnail: " ",
            })),
        },
        originalDateTime: convertToApiDateTime(new Date(originalDateTime)),
        idToken: auth.user.id_token,
      })
    );
  };

  return (
    <>
      <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
        Revising meal from{" "}
        {originalMeal ? formatDate(originalMeal.dateTime) : ""}
      </Typography>

      <DateTimeSelectorControls
        date={date}
        time={time}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        disabled={saving}
      />
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
      <FormControls
        disabled={
          saving ||
          !entryName ||
          !date ||
          !time ||
          mergedSelectedItems.filter((f) => f.selected).length === 0
        }
        saving={saving}
        onSave={handleSave}
        onClear={handleCancel}
        saveLabel="Revise"
        clearLabel="Cancel"
        color="secondary"
      />
    </>
  );
};
