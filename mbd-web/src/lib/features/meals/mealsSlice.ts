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
  saveError: string | null;
  loadError: string | null;
}

const initialState: MealsState = {
  meals: [],
  loading: false,
  daysLoaded: 0,
  saving: false,
  saveError: null,
  loadError: null,
};

export const mealsSlice = createAppSlice({
  name: "meals",
  initialState,
  reducers: (create) => ({
    clearSaveError: create.reducer((state) => {
      state.saveError = null;
    }),
    clearLoadError: create.reducer((state) => {
      state.loadError = null;
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
      .addCase(fetchMeals.rejected, (state, action) => {
        state.loading = false;
        state.loadError = action.error.message || "Failed to fetch meals";
      })
      .addCase(saveMeal.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveMeal.fulfilled, (state, action) => {
        state.saving = false;
        state.meals = [action.payload, ...state.meals];
      })
      .addCase(saveMeal.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error.message || "Failed to save meal";
      });
  },
  selectors: {
    selectMeals: (state: MealsState) => state.meals,
    selectLoading: (state: MealsState) => state.loading,
    selectDaysLoaded: (state: MealsState) => state.daysLoaded,
    selectSaving: (state: MealsState) => state.saving,
    selectSaveError: (state: MealsState) => state.saveError,
    selectLoadError: (state: MealsState) => state.loadError,
  },
});

export const {
  selectMeals,
  selectLoading,
  selectDaysLoaded,
  selectSaving,
  selectSaveError,
  selectLoadError,
} = mealsSlice.selectors;

export const { clearSaveError, clearLoadError } = mealsSlice.actions;
