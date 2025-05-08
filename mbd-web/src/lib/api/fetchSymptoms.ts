import axiosInstance from "./axios";
import { SymptomsEntryState } from "../features/symptoms/symptomsSlice";
import { ApiSymptomsEntry } from "./contracts";
import { convertFromApiDate } from "../utils/dateUtils";

export interface FetchSymptomsParams {
  days: number;
  offset: number;
  idToken: string;
}

export const fetchSymptomsApi = async ({
  days,
  offset,
  idToken,
}: FetchSymptomsParams): Promise<SymptomsEntryState[]> => {
  try {
    console.log(`Fetching symptoms with days: ${days}, offset: ${offset}`);

    const response = await axiosInstance.get(`/api/v1/symptoms/history`, {
      params: { days, offset },
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data.map(
      (symptomEntry: ApiSymptomsEntry): SymptomsEntryState => ({
        dateTime: convertFromApiDate(symptomEntry.date_time),
        symptoms: symptomEntry.symptoms,
      })
    );
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
};
