import { Meal } from "@/lib/features/meals/models";
import { formatDate, formatTime } from "@/lib/utils/dateUtils";
import { Box, Typography, Chip } from "@mui/material";

export const MealHistoryEntryComponent = ({ meal }: { meal: Meal }) => {
  return (
    <Box
      key={`meal-${meal.id}`}
      my={2}
      p={2}
      border={1}
      borderRadius={3}
      bgcolor={"#f0fff8"}
    >
      <Typography variant="h6">
        <span title={formatTime(meal.dateTime)}>{meal.mealType}</span>{" "}
        <span title={new Date(meal.dateTime).toLocaleDateString()}>
          {formatDate(meal.dateTime)}
        </span>
      </Typography>
      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
        {meal.foods.map((food) => (
          <Chip key={food.id} label={`${food.name} ${food.thumbnail}`.trim()} />
        ))}
      </Box>
    </Box>
  );
};
