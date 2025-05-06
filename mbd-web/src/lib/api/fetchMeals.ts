import axiosInstance from "./axios";
import { ApiMeal } from "./contracts";
import { MealState } from "../features/meals/mealsSlice";

export interface FetchMealsParams {
  days: number;
  offset: number;
  idToken: string;
}

export const fetchMealsApi = async ({
  days,
  offset,
  idToken,
}: FetchMealsParams): Promise<MealState[]> => {
  try {
    console.log(`Fetching meals with days: ${days}, offset: ${offset}`);

    const response = await axiosInstance.get(`/api/v1/meals/history`, {
      params: { days, offset },
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    // Transform the response to match the expected format
    return response.data.map(
      (meal: ApiMeal): MealState => ({
        id: `${meal.mealType}-${meal.dateTime}`, // Generate an ID since backend doesn't provide one
        mealType: meal.mealType,
        dateTime: new Date(
          meal.dateTime.replace("+00:00", "-07:00")
        ).toISOString(), // Hard-code timezone offset until backend is timezone aware
        foods: meal.foods.map((food) => ({
          id: food.food_id!,
          name: food.name,
          thumbnail: food.thumbnail,
        })),
      })
    );
  } catch (error) {
    console.error("Error fetching meals:", error);
    throw error;
  }
};
