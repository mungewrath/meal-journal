"use client";

import { Box, Typography, CircularProgress, Button, Chip } from "@mui/material";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useAuth } from "react-oidc-context";
import {
  selectMeals,
  selectLoading,
  fetchMeals,
} from "@/lib/features/meals/mealsSlice";

export const MealHistory = () => {
  const meals = useAppSelector(selectMeals);
  const loading = useAppSelector(selectLoading);
  const dispatch = useAppDispatch();

  const auth = useAuth();
  const idToken = auth.isAuthenticated ? auth.user?.id_token : undefined;

  useEffect(() => {
    if (auth.isAuthenticated && idToken) {
      // Test data in chumpy user has meals logged 2/21 and 2/23
      dispatch(fetchMeals({ days: 27, offset: 4, idToken }));
    }
  }, [dispatch, auth, idToken]);

  const handleFetchMeals = () => {
    const daysLoaded = new Set(
      meals.map((meal) => new Date(meal.dateTime).toDateString())
    ).size;
    dispatch(fetchMeals({ days: 1, offset: daysLoaded, idToken }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today's";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's";
    } else {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleDateString("en-US", { weekday: "short" })}'s`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box sx={{ height: "400px", overflow: "auto" }}>
      {meals
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        )
        .map((meal) => (
          <Box key={meal.id} my={2} p={2} border={1} borderRadius={2}>
            <Typography variant="h6">
              <span title={new Date(meal.dateTime).toLocaleDateString()}>
                {formatDate(meal.dateTime)}
              </span>{" "}
              <span title={formatTime(meal.dateTime)}>{meal.mealType}</span>
            </Typography>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {meal.foods.map((food) => (
                <Chip key={food.id} label={`${food.name} ${food.thumbnail}`} />
              ))}
            </Box>
          </Box>
        ))}
      {loading && <CircularProgress />}
      <Box display="flex" justifyContent="center" mt={2}>
        <Button onClick={handleFetchMeals} variant="contained" color="primary">
          Load More
        </Button>
      </Box>
    </Box>
  );
};
