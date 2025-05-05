import axiosInstance from "./axios";
import { SymptomsEntry } from "../features/symptoms/models";

interface ApiSymptomsEntry {
  dateTime: string;
  symptoms: string[];
}

export interface FetchSymptomsParams {
  days: number;
  offset: number;
  idToken: string;
}

export const fetchSymptomsApi = async ({
  days,
  offset,
  idToken,
}: FetchSymptomsParams): Promise<SymptomsEntry[]> => {
  try {
    console.log(`Fetching symptoms with days: ${days}, offset: ${offset}`);

    const response = await axiosInstance.get(`/api/v1/symptoms/history`, {
      params: { days, offset },
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data.map((symptomEntry: ApiSymptomsEntry) => ({
      dateTime: symptomEntry.dateTime,
      symptoms: symptomEntry.symptoms,
    }));
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
};
