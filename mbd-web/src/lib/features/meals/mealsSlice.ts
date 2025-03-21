import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { generateMockMeals } from "./mockData";
// import axios from "axios";

interface Food {
  id: string;
  name: string;
  thumbnail?: string;
}

interface Meal {
  id: string;
  mealType: string;
  dateTime: string;
  foods: Food[];
}

interface MealsState {
  meals: Meal[];
  loading: boolean;
  offset: number;
}

const initialState: MealsState = {
  meals: [],
  loading: false,
  offset: 0,
};

// Commenting out the API call and using mock data instead
export const fetchMeals = createAsyncThunk(
  "meals/fetchMeals",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ days, offset }: { days: number; offset: number }) => {
    // const response = await axios.get(`/api/meals/history?days=${days}&offset=${offset}`);
    // return response.data;
    return generateMockMeals();
  }
);

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
      })
      .addCase(fetchMeals.rejected, (state) => {
        state.loading = false;
      });
  },
  selectors: {
    selectMeals: (state) => state.meals,
    selectLoading: (state) => state.loading,
  },
});

export const { selectMeals, selectLoading } = mealsSlice.selectors;
