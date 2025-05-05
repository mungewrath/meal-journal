"use client";

import { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useAuth } from "react-oidc-context";
import { Meal } from "@/lib/features/meals/models";
import { SymptomsEntry } from "@/lib/features/symptoms/models";
import {
  selectMeals,
  selectLoading as selectMealsLoading,
  selectDaysLoaded as selectMealsDaysLoaded,
  fetchMeals,
  selectLoadError as selectMealsLoadError,
  clearLoadError as clearMealsLoadError,
} from "@/lib/features/meals/mealsSlice";

import {
  selectSymptomsEntries,
  selectLoading as selectSymptomsLoading,
  selectDaysLoaded as selectSymptomsDaysLoaded,
  fetchSymptoms,
  selectLoadError as selectSymptomsLoadError,
  clearLoadError as clearSymptomsLoadError,
} from "@/lib/features/symptoms/symptomsSlice";
import {
  INITIAL_MEAL_DAYS_FETCHED,
  MEAL_DAYS_PER_FETCH,
} from "@/lib/features/meals/mealsConstants";
import { MealHistoryEntryComponent } from "./MealHistoryEntryComponent";
import { SymptomHistoryEntryComponent } from "./SymptomHistoryEntryComponent";

// Use the same constants for symptoms
const INITIAL_SYMPTOMS_DAYS_FETCHED = INITIAL_MEAL_DAYS_FETCHED;
const SYMPTOMS_DAYS_PER_FETCH = MEAL_DAYS_PER_FETCH;

// Type to represent both meals and symptoms for combined display
interface HistoryEntry {
  type: "meal" | "symptom";
  dateTime: string;
  content: Meal | SymptomsEntry;
}

export const History = () => {
  const meals = useAppSelector(selectMeals);
  const mealsLoading = useAppSelector(selectMealsLoading);
  const mealsDaysLoaded = useAppSelector(selectMealsDaysLoaded);
  const mealsLoadError = useAppSelector(selectMealsLoadError);

  const symptomsEntries = useAppSelector(selectSymptomsEntries);
  const symptomsLoading = useAppSelector(selectSymptomsLoading);
  const symptomsDaysLoaded = useAppSelector(selectSymptomsDaysLoaded);
  const symptomsLoadError = useAppSelector(selectSymptomsLoadError);

  const dispatch = useAppDispatch();

  const auth = useAuth();
  const idToken = auth.isAuthenticated ? auth.user?.id_token : undefined;

  useEffect(() => {
    if (auth.isAuthenticated && idToken) {
      dispatch(
        fetchMeals({ days: INITIAL_MEAL_DAYS_FETCHED, offset: 0, idToken })
      );
      dispatch(
        fetchSymptoms({
          days: INITIAL_SYMPTOMS_DAYS_FETCHED,
          offset: 0,
          idToken,
        })
      );
    }
  }, [dispatch, auth, idToken]);

  // TODO: Currently assumes that the day does not change. If you reload the page at midnight, you end up with incorrect results
  const handleLoadMore = () => {
    dispatch(
      fetchMeals({
        days: MEAL_DAYS_PER_FETCH,
        offset: mealsDaysLoaded,
        idToken: idToken!,
      })
    );
    dispatch(
      fetchSymptoms({
        days: SYMPTOMS_DAYS_PER_FETCH,
        offset: symptomsDaysLoaded,
        idToken: idToken!,
      })
    );
  };

  const combinedHistory = [
    ...meals.map(
      (meal): HistoryEntry => ({
        type: "meal",
        dateTime: meal.dateTime,
        content: meal,
      })
    ),
    ...symptomsEntries.map(
      (symptom): HistoryEntry => ({
        type: "symptom",
        dateTime: symptom.dateTime,
        content: symptom,
      })
    ),
  ].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  const loading = mealsLoading || symptomsLoading;
  const daysLoaded =
    Math.min(
      mealsDaysLoaded > 0 ? mealsDaysLoaded : Infinity,
      symptomsDaysLoaded > 0 ? symptomsDaysLoaded : Infinity
    ) || 0;

  return (
    <Box sx={{ overflow: "auto" }}>
      {mealsLoadError && (
        <Alert severity="error" onClose={() => dispatch(clearMealsLoadError())}>
          {mealsLoadError}
        </Alert>
      )}
      {symptomsLoadError && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearSymptomsLoadError())}
        >
          {symptomsLoadError}
        </Alert>
      )}

      {combinedHistory.map((entry, index) =>
        entry.type === "meal" ? (
          <MealHistoryEntryComponent
            key={`meal-${index}-${entry.dateTime}`}
            meal={entry.content as Meal}
          />
        ) : (
          <SymptomHistoryEntryComponent
            key={`symptom-${index}-${entry.dateTime}`}
            symptom={entry.content as SymptomsEntry}
          />
        )
      )}

      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button onClick={handleLoadMore} variant="contained" color="primary">
            Load More
          </Button>
        </Box>
      )}
      <Box display="flex" justifyContent="center" mt={1}>
        <Typography variant="body2" color="textSecondary">
          {daysLoaded > 0 && (
            <>
              Showing history since&nbsp;
              {new Date(
                new Date().setDate(
                  new Date().getDate() -
                    Math.min(mealsDaysLoaded, symptomsDaysLoaded)
                )
              ).toLocaleDateString()}
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};
