import { createAppSlice } from "@/lib/createAppSlice";
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

export const mealsSlice = createAppSlice({
  name: "meals",
  initialState,
  reducers: (create) => ({
    mealsAsync: create.asyncThunk(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ days, offset }: { days: number; offset: number }) => {
        // const response = await axios.get(`/api/meals/history?days=${days}&offset=${offset}`);
        // return response.data;
        return [
          {
            id: "1",
            mealType: "breakfast",
            dateTime: "2023-10-01T08:00:00Z",
            foods: [
              { id: "1", name: "Eggs", thumbnail: "egg.jpg" },
              { id: "2", name: "Bacon", thumbnail: "bacon.jpg" },
            ],
          },
          {
            id: "2",
            mealType: "lunch",
            dateTime: "2023-10-01T12:00:00Z",
            foods: [
              { id: "3", name: "Sandwich", thumbnail: "sandwich.jpg" },
              { id: "4", name: "Salad", thumbnail: "salad.jpg" },
            ],
          },
        ];
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.meals = [...state.meals, ...action.payload];
        },
        rejected: (state) => {
          state.loading = false;
        },
      }
    ),
  }),
  selectors: {
    selectMeals: (state) => state.meals,
    selectLoading: (state) => state.loading,
  },
});

export const { selectMeals, selectLoading } = mealsSlice.selectors;
