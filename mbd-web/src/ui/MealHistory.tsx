"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { useAppSelector } from "@/lib/hooks";
import { selectMeals, selectLoading } from "@/lib/features/meals/mealsSlice";

export const MealHistory = () => {
  const meals = useAppSelector(selectMeals);
  const loading = useAppSelector(selectLoading);

  return (
    <Box sx={{ height: "400px", overflow: "auto" }}>
      {meals.map((meal) => (
        <Box key={meal.id} my={2}>
          <Typography variant="h6">{meal.mealType}</Typography>
          <Typography variant="body2">
            {new Date(meal.dateTime).toLocaleString()}
          </Typography>
          <Box>
            {meal.foods.map((food) => (
              <Typography key={food.id} variant="body2">
                {food.thumbnail ? `${food.thumbnail} ` : ""}
                {food.name}
              </Typography>
            ))}
          </Box>
        </Box>
      ))}
      {loading && <CircularProgress />}
    </Box>
  );
};
