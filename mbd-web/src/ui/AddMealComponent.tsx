import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
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
  clearSuggestedFoods,
} from "@/lib/features/foods/foodsSlice";
import {
  saveMeal,
  selectSaving as selectMealSaving,
  selectSaveError,
} from "@/lib/features/meals/mealsSlice";
import { convertToApiDateTime } from "@/lib/utils/dateUtils";

interface Item {
  id: string;
  name: string;
  suggested: boolean;
  selected: boolean;
}

export const AddMealComponent = ({}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [entryName, setEntryName] = useState("");

  const saving = useAppSelector(selectMealSaving);
  const saveError = useAppSelector(selectSaveError);
  const foodsLoading = useAppSelector(selectFoodsLoading);
  const suggestedFoods = useAppSelector(selectSuggestedFoods);

  useEffect(() => {
    // Set the default date to today's date in Pacific Time
    const today = new Date();
    const pacificOffset = -7 * 60; // Pacific Time is UTC-7
    const pacificDate = new Date(today.getTime() + pacificOffset * 60 * 1000);
    const formattedDate = pacificDate.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

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
    setEntryName(event.target.value as string);
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

    dispatch(
      saveMeal({
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
        idToken: auth.user.id_token,
      })
    );

    // TODO: Is this going to catch errors correctly? Looks like the dispatch is async and this won't be updated
    if (!saveError) {
      handleClear();
    }
  };

  return (
    <>
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
        onClear={handleClear}
      />
    </>
  );
};
