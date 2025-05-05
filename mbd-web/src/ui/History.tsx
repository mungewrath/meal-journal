"use client";

import { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      })}`;
    } else {
      return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleDateString(
        "en-US",
        {
          month: "numeric",
          day: "numeric",
        }
      )}`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
          // Meal entry
          <Box
            key={`meal-${(entry.content as Meal).id}`}
            my={2}
            p={2}
            border={1}
            borderRadius={3}
            bgcolor={"#f0fff8"}
          >
            <Typography variant="h6">
              <span title={formatTime(entry.dateTime)}>
                {(entry.content as Meal).mealType}
              </span>{" "}
              <span title={new Date(entry.dateTime).toLocaleDateString()}>
                {formatDate(entry.dateTime)}
              </span>
            </Typography>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(entry.content as Meal).foods.map((food) => (
                <Chip
                  key={food.id}
                  label={`${food.name} ${food.thumbnail}`.trim()}
                />
              ))}
            </Box>
          </Box>
        ) : (
          // Symptom entry
          <Box
            key={`symptom-${index}-${entry.dateTime}`}
            my={2}
            p={2}
            border={1}
            borderRadius={3}
            bgcolor={"#f8f0f0"} // Light reddish background for symptoms
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <MedicalInformationIcon sx={{ mr: 1, color: "#d32f2f" }} />
              <span title={formatTime(entry.dateTime)}>Symptoms</span>
              <span title={new Date(entry.dateTime).toLocaleDateString()}>
                &nbsp;{formatDate(entry.dateTime)}
              </span>
            </Typography>
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {(entry.content as SymptomsEntry).symptoms.map(
                (symptom: string, idx: number) => (
                  <Chip
                    key={`${symptom}-${idx}`}
                    label={symptom}
                    color="error"
                    variant="outlined"
                  />
                )
              )}
            </Box>
          </Box>
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
