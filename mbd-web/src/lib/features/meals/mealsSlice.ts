import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMealsApi, FetchMealsParams } from "@/lib/api/fetchMeals";
import { saveMealApi, SaveMealParams } from "@/lib/api/saveMeal";
import { updateMealApi, UpdateMealParams } from "@/lib/api/updateMeal";
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

export const updateMeal = createAsyncThunk(
  "meals/updateMeal",
  async (params: UpdateMealParams) => {
    return updateMealApi(params);
  }
);

interface MealsSliceState {
  meals: MealState[];
  loading: boolean;
  daysLoaded: number;
  saving: boolean;
  saveError: string | null;
  loadError: string | null;
  selectedMealId: string | null;
  editing: boolean;
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
  selectedMealId: null,
  editing: false,
};

export const mealsSlice = createAppSlice({
  name: "meals",
  initialState,
  reducers: (create) => ({
    clearSaveError: create.reducer((state) => {
      state.saveError = null;
      return state;
    }),
    clearLoadError: create.reducer((state) => {
      state.loadError = null;
      return state;
    }),
    selectMeal: create.reducer<string>((state, action) => {
      state.selectedMealId = action.payload;
      return state;
    }),
    startEditing: create.reducer((state) => {
      state.editing = true;
      return state;
    }),
    cancelEditing: create.reducer((state) => {
      state.editing = false;
      state.selectedMealId = null;
      return state;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.pending, (state) => {
        state.loading = true;
        return state;
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = [...state.meals, ...action.payload];
        state.daysLoaded += action.meta.arg.days;
        return state;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.loading = false;
        state.loadError = action.error?.message
          ? `Failed to fetch meals: ${action.error.message}`
          : "Failed to fetch meals";
        return state;
      })
      .addCase(saveMeal.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        return state;
      })
      .addCase(saveMeal.fulfilled, (state, action) => {
        state.saving = false;
        state.meals = [mealFromApi(action.payload), ...state.meals];
        return state;
      })
      .addCase(saveMeal.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error?.message
          ? `Failed to save meal: ${action.error.message}`
          : "Failed to save meal";
        return state;
      })
      .addCase(updateMeal.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        return state;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        // Find and replace the updated meal
        const updatedMeal = mealFromApi(action.payload);
        const index = state.meals.findIndex(
          (meal) => meal.id === updatedMeal.id
        );

        console.log("Updating meal with ID:", updatedMeal.id);
        console.log("Original date/time:", action.meta.arg.originalDateTime);
        console.log("Index of existing meal:", index);

        if (index !== -1) {
          state.meals[index] = updatedMeal;
        } else {
          // If the meal ID changed (due to date/time change), remove the old one and add the new one
          const oldIndex = state.meals.findIndex(
            (meal) => meal.id === state.selectedMealId
          );
          if (oldIndex !== -1) {
            console.log("Removing old meal with ID:", state.selectedMealId);
            state.meals.splice(oldIndex, 1);
          } else {
            console.log("Old meal not found for ID:", state.selectedMealId);
          }

          state.meals.push(updatedMeal);
          // Sort meals by date (newest first)
          state.meals.sort(
            (a, b) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          );
        }

        state.saving = false;
        state.editing = false;
        state.selectedMealId = null;

        return state;
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error?.message
          ? `Failed to update meal: ${action.error.message}`
          : "Failed to update meal";
        return state;
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
    selectSelectedMealId: (state: MealsSliceState) => state.selectedMealId,
    selectEditing: (state: MealsSliceState) => state.editing,
    selectSelectedMeal: (state: MealsSliceState) => {
      if (!state.selectedMealId) return null;
      const meal = state.meals.find((m) => m.id === state.selectedMealId);
      return meal ? mealToDomain(meal) : null;
    },
  },
});

export const {
  selectMeals,
  selectLoading,
  selectDaysLoaded,
  selectSaving,
  selectSaveError,
  selectLoadError,
  selectSelectedMealId,
  selectEditing,
  selectSelectedMeal,
} = mealsSlice.selectors;

export const {
  clearSaveError,
  clearLoadError,
  selectMeal,
  startEditing,
  cancelEditing,
} = mealsSlice.actions;
