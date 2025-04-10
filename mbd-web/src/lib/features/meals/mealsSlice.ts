import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Meal } from "./models";
import { fetchMealsApi, FetchMealsParams } from "@/lib/api/fetchMeals";
import { saveMealApi, SaveMealParams } from "@/lib/api/saveMeal";

export const fetchMeals = createAsyncThunk(
  "meals/fetchMeals",
  async (params: FetchMealsParams) => {
    return fetchMealsApi(params);
  }
);

export const saveMeal = createAsyncThunk(
  "meals/saveMeal",
  async (params: SaveMealParams) => {
    return saveMealApi(params);
  }
);

interface MealsState {
  meals: Meal[];
  loading: boolean;
  daysLoaded: number;
  saving: boolean;
  error: string | null;
}

const initialState: MealsState = {
  meals: [],
  loading: false,
  daysLoaded: 0,
  saving: false,
  error: null,
};

export const mealsSlice = createAppSlice({
  name: "meals",
  initialState,
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = [...state.meals, ...action.payload];
        state.daysLoaded += action.meta.arg.days;
      })
      .addCase(fetchMeals.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveMeal.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveMeal.fulfilled, (state, action) => {
        state.saving = false;
        state.meals = [action.payload, ...state.meals];
      })
      .addCase(saveMeal.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to save meal";
      });
  },
  selectors: {
    selectMeals: (state: MealsState) => state.meals,
    selectLoading: (state: MealsState) => state.loading,
    selectDaysLoaded: (state: MealsState) => state.daysLoaded,
    selectSaving: (state: MealsState) => state.saving,
    selectError: (state: MealsState) => state.error,
  },
});

export const {
  selectMeals,
  selectLoading,
  selectDaysLoaded,
  selectSaving,
  selectError,
} = mealsSlice.selectors;

export const { clearError } = mealsSlice.actions;
