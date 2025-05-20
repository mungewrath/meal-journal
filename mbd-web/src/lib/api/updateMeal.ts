import axiosInstance from "./axios";
import { ApiMeal } from "./contracts";

export interface UpdateMealParams {
  meal: ApiMeal;
  originalDateTime: string;
  idToken: string;
}

export const updateMealApi = async ({
  meal,
  originalDateTime,
  idToken,
}: UpdateMealParams): Promise<ApiMeal> => {
  try {
    const response = await axiosInstance.put(
      `/api/v1/meals`,
      {
        ...meal,
        original_date_time: originalDateTime,
      },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const updatedMeal = response.data;
    return updatedMeal;
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};
