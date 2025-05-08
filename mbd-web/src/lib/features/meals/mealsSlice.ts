import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMealsApi, FetchMealsParams } from "@/lib/api/fetchMeals";
import { saveMealApi, SaveMealParams } from "@/lib/api/saveMeal";
import { Meal } from "./models";
import { ApiMeal } from "@/lib/api/contracts";
import { convertFromApiDate } from "@/lib/utils/dateUtils";

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

interface MealsSliceState {
  meals: MealState[];
  loading: boolean;
  daysLoaded: number;
  saving: boolean;
  saveError: string | null;
  loadError: string | null;
}

export interface MealState {
  id: string;
  mealType: string;
  dateTime: string;
  foods: FoodState[];
}

// Function that takes in a Meal and returns a MealState with the dateTime converted to ISO string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mealFromDomain = (domain: Meal): MealState => {
  return {
    id: domain.id,
    mealType: domain.mealType,
    dateTime: domain.dateTime.toISOString(),
    foods: domain.foods.map((food) => ({
      ...food,
    })),
  };
};

const mealToDomain = (meal: MealState): Meal => {
  return {
    ...meal,
    dateTime: new Date(meal.dateTime),
    foods: meal.foods.map((food) => ({
      ...food,
    })),
  };
};

const mealFromApi = (apiMeal: ApiMeal): MealState => {
  return {
    id: `${apiMeal.meal_type}-${apiMeal.date_time}`,
    mealType: apiMeal.meal_type,
    dateTime: convertFromApiDate(apiMeal.date_time),
    foods: apiMeal.foods.map((food) => ({
      id: food.food_id!,
      ...food,
    })),
  };
};

interface FoodState {
  id: string;
  name: string;
  thumbnail?: string;
  isSuggested?: boolean;
}

const initialState: MealsSliceState = {
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
        state.loadError =
          `Failed to fetch meals: ${action.error?.message}` ||
          "Failed to fetch meals";
      })
      .addCase(saveMeal.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveMeal.fulfilled, (state, action) => {
        state.saving = false;
        state.meals = [mealFromApi(action.payload), ...state.meals];
      })
      .addCase(saveMeal.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          `Failed to save meal: ${action.error?.message}` ||
          "Failed to save meal";
      });
  },
  selectors: {
    selectMeals: (state: MealsSliceState) =>
      state.meals.map((m) => mealToDomain(m)),
    selectLoading: (state: MealsSliceState) => state.loading,
    selectDaysLoaded: (state: MealsSliceState) => state.daysLoaded,
    selectSaving: (state: MealsSliceState) => state.saving,
    selectSaveError: (state: MealsSliceState) => state.saveError,
    selectLoadError: (state: MealsSliceState) => state.loadError,
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
