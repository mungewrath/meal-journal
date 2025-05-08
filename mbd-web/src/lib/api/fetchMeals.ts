import axiosInstance from "./axios";
import { ApiMeal } from "./contracts";
import { MealState } from "../features/meals/mealsSlice";
import { convertFromApiDate } from "../utils/dateUtils";

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
        id: `${meal.meal_type}-${meal.date_time}`, // Generate an ID since backend doesn't provide one
        mealType: meal.meal_type,
        dateTime: convertFromApiDate(meal.date_time),
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
