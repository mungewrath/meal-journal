import axiosInstance from "./axios";
import { SymptomsEntryState } from "../features/symptoms/symptomsSlice";
import { ApiSymptomsEntry } from "./contracts";

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
        dateTime: new Date(
          symptomEntry.dateTime.replace("+00:00", "-07:00")
        ).toISOString(), // // Hard-code timezone offset until backend is timezone aware
        symptoms: symptomEntry.symptoms,
      })
    );
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
};
