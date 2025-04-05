import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Meal } from "./models";
import { fetchMealsApi, FetchMealsParams } from "@/lib/api/fetchMeals";

export const fetchMeals = createAsyncThunk(
  "meals/fetchMeals",
  async (params: FetchMealsParams) => {
    return fetchMealsApi(params);
  }
);

interface MealsState {
  meals: Meal[];
  loading: boolean;
  daysLoaded: number;
}

const initialState: MealsState = {
  meals: [],
  loading: false,
  daysLoaded: 0,
};

export const mealsSlice = createAppSlice({
  name: "meals",
  initialState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reducers: (create) => ({}),
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
      });
  },
  selectors: {
    selectMeals: (state: MealsState) => state.meals,
    selectLoading: (state: MealsState) => state.loading,
    selectDaysLoaded: (state: MealsState) => state.daysLoaded,
  },
});

export const { selectMeals, selectLoading, selectDaysLoaded } =
  mealsSlice.selectors;
