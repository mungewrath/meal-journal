import { SymptomsEntry } from "../features/symptoms/models";
import axiosInstance from "./axios";

export interface SaveSymptomsParams {
  symptomsEntry: {
    symptoms: string[];
    dateTime: string;
  };
  idToken: string;
}

export const saveSymptomsApi = async ({
  symptomsEntry,
  idToken,
}: SaveSymptomsParams): Promise<SymptomsEntry> => {
  try {
    // Transform the symptoms data to match the backend's expected format
    const backendSymptoms = {
      symptoms: symptomsEntry.symptoms,
      date_time: symptomsEntry.dateTime,
    };

    const response = await axiosInstance.post(
      `/api/v1/symptoms`,
      backendSymptoms,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const savedSymptoms = response.data;
    // Transform the response to match the expected format
    return {
      symptoms: savedSymptoms.symptoms,
      dateTime: savedSymptoms.date_time,
    };
  } catch (error) {
    console.error("Error saving symptoms entry:", error);
    throw error;
  }
};
