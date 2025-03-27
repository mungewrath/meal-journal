import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { generateMockMeals } from "./mockData";
import axiosInstance from "@/lib/api/axios";

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
}

const initialState: MealsState = {
  meals: [],
  loading: false,
};

export const fetchMeals = createAsyncThunk(
  "meals/fetchMeals",
  async ({
    days,
    offset,
    idToken,
  }: {
    days: number;
    offset: number;
    idToken?: string;
  }) => {
    try {
      console.log(`idToken: ${idToken}`);

      const response = await axiosInstance.get(`/api/v1/meals/history`, {
        params: { days, offset },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Define types for API response
      interface ApiMeal {
        mealType: string;
        dateTime: string;
        foods: ApiFood[];
      }

      interface ApiFood {
        id?: string;
        foodId?: string;
        name: string;
        thumbnail?: string;
      }

      // Transform the response to match the expected format
      return response.data.map((meal: ApiMeal) => ({
        id: `${meal.mealType}-${meal.dateTime}`, // Generate an ID since backend doesn't provide one
        mealType: meal.mealType,
        dateTime: meal.dateTime,
        foods: meal.foods.map((food: ApiFood) => ({
          id: food.id || food.foodId,
          name: food.name,
          thumbnail: food.thumbnail,
        })),
      }));
    } catch (error) {
      console.error("Error fetching meals:", error);
      // Fall back to mock data on error
      console.warn("Error fetching meals, using mock data");
      return generateMockMeals(days, offset);
    }
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
    selectMeals: (state: MealsState) => state.meals,
    selectLoading: (state: MealsState) => state.loading,
  },
});

export const { selectMeals, selectLoading } = mealsSlice.selectors;
