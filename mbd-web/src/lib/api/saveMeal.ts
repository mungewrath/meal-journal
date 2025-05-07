import axiosInstance from "./axios";
import { ApiMeal } from "./contracts";

export interface SaveMealParams {
  meal: ApiMeal;
  idToken: string;
}

export const saveMealApi = async ({
  meal,
  idToken,
}: SaveMealParams): Promise<ApiMeal> => {
  try {
    const response = await axiosInstance.post(`/api/v1/meals`, meal, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const savedMeal = response.data;
    return savedMeal;
  } catch (error) {
    console.error("Error saving meal:", error);
    throw error;
  }
};
