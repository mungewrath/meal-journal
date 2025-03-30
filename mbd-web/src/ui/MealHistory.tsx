"use client";

import { useEffect } from "react";
import { Box, Typography, CircularProgress, Button, Chip } from "@mui/material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useAuth } from "react-oidc-context";
import {
  selectMeals,
  selectLoading,
  selectDaysLoaded,
} from "@/lib/features/meals/mealsSlice";
import {
  INITIAL_MEAL_DAYS_FETCHED,
  MEAL_DAYS_PER_FETCH,
} from "@/lib/features/meals/mealsConstants";
import { fetchMeals } from "@/lib/features/meals/mealsSlice";

export const MealHistory = () => {
  const meals = useAppSelector(selectMeals);
  const loading = useAppSelector(selectLoading);
  const daysLoaded = useAppSelector(selectDaysLoaded);
  const dispatch = useAppDispatch();

  const auth = useAuth();
  const idToken = auth.isAuthenticated ? auth.user?.id_token : undefined;

  useEffect(() => {
    if (auth.isAuthenticated && idToken) {
      // Test data in chumpy user has meals logged 2/21 and 2/23
      dispatch(
        fetchMeals({ days: INITIAL_MEAL_DAYS_FETCHED, offset: 0, idToken })
      );
    }
  }, [dispatch, auth, idToken]);

  // TODO: Currently assumes that the day does not change. If you reload the page at midnight, you end up with incorrect results
  const handleFetchMeals = () => {
    dispatch(
      fetchMeals({
        days: MEAL_DAYS_PER_FETCH,
        offset: daysLoaded,
        idToken: idToken!,
      })
    );
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
      return `${date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      })} ${date.toLocaleDateString("en-US", { weekday: "short" })}'s`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      {meals
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        )
        .map((meal) => (
          <Box key={meal.id} my={2} p={2} border={1} borderRadius={3}>
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
      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            onClick={handleFetchMeals}
            variant="contained"
            color="primary"
          >
            Load More
          </Button>
        </Box>
      )}
      <Box display="flex" justifyContent="center" mt={1}>
        <Typography variant="body2" color="textSecondary">
          {daysLoaded > 0 && (
            <>
              Showing meals since{" "}
              {new Date(
                new Date().setDate(new Date().getDate() - daysLoaded)
              ).toLocaleDateString()}
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};
