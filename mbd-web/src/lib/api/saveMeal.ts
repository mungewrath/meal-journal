import axiosInstance from "./axios";
import { ApiFood } from "./contracts";
import { Meal } from "../features/meals/models";

export interface SaveMealParams {
  meal: {
    mealType: string;
    dateTime: string;
    foods: Array<{
      id?: string;
      name: string;
      thumbnail?: string;
    }>;
  };
  idToken: string;
}

export const saveMealApi = async ({
  meal,
  idToken,
}: SaveMealParams): Promise<Meal> => {
  try {
    // Transform the meal data to match the backend's expected format
    const backendMeal = {
      meal_type: meal.mealType,
      date_time: meal.dateTime,
      foods: meal.foods.map((food) => ({
        food_id: food.id || crypto.randomUUID(), // Generate a UUID if no ID is provided
        name: food.name,
        thumbnail: food.thumbnail || " ", // Use a space as default thumbnail
      })),
    };

    const response = await axiosInstance.post(`/api/v1/meals`, backendMeal, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const savedMeal = response.data;
    // Transform the response to match the expected format
    return {
      id: `${savedMeal.mealType}-${savedMeal.dateTime}`,
      mealType: savedMeal.mealType,
      dateTime: savedMeal.dateTime,
      foods: savedMeal.foods.map((food: ApiFood) => ({
        id: food.food_id,
        name: food.name,
        thumbnail: food.thumbnail,
      })),
    };
  } catch (error) {
    console.error("Error saving meal:", error);
    throw error;
  }
};
