import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/api/axios";
import { ApiMeal } from "../../api/contracts";

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
      console.log(`Fetching meals with days: ${days}, offset: ${offset}`);

      const response = await axiosInstance.get(`/api/v1/meals/history`, {
        params: { days, offset },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Transform the response to match the expected format
      return response.data.map((meal: ApiMeal) => ({
        id: `${meal.mealType}-${meal.dateTime}`, // Generate an ID since backend doesn't provide one
        mealType: meal.mealType,
        dateTime: meal.dateTime,
        foods: meal.foods.map((food) => ({
          id: food.food_id,
          name: food.name,
          thumbnail: food.thumbnail,
        })),
      }));
    } catch (error) {
      console.error("Error fetching meals:", error);
      return [];
      // Fall back to mock data on error
      // console.warn("Error fetching meals, using mock data");
      // return generateMockMeals(days, offset);
    }
  }
);
