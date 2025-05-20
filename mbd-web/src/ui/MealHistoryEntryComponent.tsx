import { Meal } from "@/lib/features/meals/models";
import { formatDate, formatTime } from "@/lib/utils/dateUtils";
import { Box, Typography, Chip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectMeal,
  startEditing,
  selectSelectedMealId,
} from "@/lib/features/meals/mealsSlice";

export const MealHistoryEntryComponent = ({ meal }: { meal: Meal }) => {
  const dispatch = useAppDispatch();
  const selectedMealId = useAppSelector(selectSelectedMealId);
  const isSelected = selectedMealId === meal.id;

  const handleSelectMeal = () => {
    dispatch(selectMeal(meal.id));
  };

  const handleEditMeal = () => {
    dispatch(startEditing());
  };

  return (
    <Box
      key={`meal-${meal.id}`}
      my={2}
      p={2}
      border={1}
      borderRadius={3}
      bgcolor={isSelected ? "#e3f2fd" : "#f0fff8"}
      onClick={handleSelectMeal}
      sx={{
        cursor: "pointer",
        position: "relative",
        "&:hover": {
          boxShadow: 1,
        },
      }}
    >
      <Typography variant="h6">
        <span>
          {meal.mealType}, {formatDate(meal.dateTime)}
        </span>
        <span
          style={{
            color: "#999",
            marginLeft: "10px",
            fontWeight: "lighter",
            float: "right",
          }}
        >
          {formatTime(meal.dateTime)}
        </span>
      </Typography>
      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
        {meal.foods.map((food) => (
          <Chip key={food.id} label={`${food.name} ${food.thumbnail}`.trim()} />
        ))}
      </Box>
      {isSelected && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            color="primary"
            // sx={{ position: "absolute", top: 8, right: 8 }}

            onClick={handleEditMeal}
            aria-label="Edit meal"
          >
            <EditIcon /> Edit
          </Button>
        </Box>
      )}
    </Box>
  );
};
