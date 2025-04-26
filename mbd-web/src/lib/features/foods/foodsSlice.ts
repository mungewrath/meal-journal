import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchSuggestedFoodsApi,
  FetchSuggestedFoodsParams,
} from "@/lib/api/fetchSuggestedFoods";
import { Food } from "../meals/models";

export const fetchSuggestedFoods = createAsyncThunk(
  "foods/fetchSuggestedFoods",
  async (params: FetchSuggestedFoodsParams) => {
    return fetchSuggestedFoodsApi(params);
  }
);

interface FoodsState {
  suggestedFoods: Food[];
  loading: boolean;
  error: string | null;
}

const initialState: FoodsState = {
  suggestedFoods: [],
  loading: false,
  error: null,
};

export const foodsSlice = createAppSlice({
  name: "foods",
  initialState,
  reducers: (create) => ({
    clearError: create.reducer((state) => {
      state.error = null;
    }),
    clearSuggestedFoods: create.reducer((state) => {
      state.suggestedFoods = [];
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuggestedFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestedFoods = action.payload;
      })
      .addCase(fetchSuggestedFoods.rejected, (state, action) => {
        state.loading = false;
        state.error =
          `Failed to fetch suggested foods: ${action.error?.message}` ||
          "Failed to fetch suggested foods";
      });
  },
  selectors: {
    selectSuggestedFoods: (state: FoodsState) => state.suggestedFoods,
    selectLoading: (state: FoodsState) => state.loading,
    selectError: (state: FoodsState) => state.error,
  },
});

export const { clearError, clearSuggestedFoods } = foodsSlice.actions;

export const { selectSuggestedFoods, selectLoading, selectError } =
  foodsSlice.selectors;
