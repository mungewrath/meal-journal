"use client";

import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  selectMeals,
  selectLoading,
  fetchMeals,
} from "@/lib/features/meals/mealsSlice";

export const MealHistory = () => {
  const meals = useAppSelector(selectMeals);
  const loading = useAppSelector(selectLoading);
  const dispatch = useAppDispatch();

  const handleFetchMeals = () => {
    dispatch(fetchMeals({ days: 7, offset: 0 }));
  };

  return (
    <Box sx={{ height: "400px", overflow: "auto" }}>
      <Button onClick={handleFetchMeals} variant="contained" color="primary">
        Fetch Meals
      </Button>
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
