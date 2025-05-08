import axiosInstance from "./axios";
import { ApiSymptomsEntry } from "./contracts";

export interface SaveSymptomsParams {
  symptomsEntry: ApiSymptomsEntry;
  idToken: string;
}

export const saveSymptomsApi = async ({
  symptomsEntry,
  idToken,
}: SaveSymptomsParams): Promise<ApiSymptomsEntry> => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/symptoms`,
      symptomsEntry,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const savedSymptoms = response.data;

    return {
      symptoms: savedSymptoms.symptoms,
      date_time: savedSymptoms.date_time,
    };
  } catch (error) {
    console.error("Error saving symptoms entry:", error);
    throw error;
  }
};
