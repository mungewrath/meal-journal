import axiosInstance from "./axios";
import { ApiMeal } from "./contracts";
import { Meal } from "../features/meals/models";

export interface FetchMealsParams {
  days: number;
  offset: number;
  idToken: string;
}

export const fetchMealsApi = async ({
  days,
  offset,
  idToken,
}: FetchMealsParams): Promise<Meal[]> => {
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
};
