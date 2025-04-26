import axiosInstance from "./axios";
import { ApiFood } from "./contracts";
import { Food } from "../features/meals/models";

export interface FetchSuggestedFoodsParams {
  mealType: string;
  idToken: string;
}

export const fetchSuggestedFoodsApi = async ({
  mealType,
  idToken,
}: FetchSuggestedFoodsParams): Promise<Food[]> => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/foods/suggested/${mealType}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    // Transform the response to match the expected format
    return response.data.map((food: ApiFood) => ({
      id: food.food_id,
      name: food.name,
      thumbnail: food.thumbnail,
      isSuggested: true,
    }));
  } catch (error) {
    console.error("Error fetching suggested foods:", error);
    throw error;
  }
};
