import {
  saveSymptomsApi,
  SaveSymptomsParams,
} from "@/lib/api/saveSymptomsEntry";
import { fetchSymptomsApi, FetchSymptomsParams } from "@/lib/api/fetchSymptoms";
import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SymptomsEntry } from "./models";
import { ApiSymptomsEntry } from "@/lib/api/contracts";
import { convertFromApiDate } from "@/lib/utils/dateUtils";

export const saveSymptomsEntry = createAsyncThunk(
  "symptoms/saveSymptoms",
  async (params: SaveSymptomsParams) => {
    return saveSymptomsApi(params);
  }
);

export const fetchSymptoms = createAsyncThunk(
  "symptoms/fetchSymptoms",
  async (params: FetchSymptomsParams) => {
    return fetchSymptomsApi(params);
  }
);

interface SymptomsSliceState {
  symptomsEntries: SymptomsEntryState[];
  loading: boolean;
  daysLoaded: number;
  saving: boolean;
  saveError: string | null;
  loadError: string | null;
}

export interface SymptomsEntryState {
  dateTime: string;
  symptoms: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const symptomsEntryFromDomain = (domain: SymptomsEntry): SymptomsEntryState => {
  return {
    // TODO: Convert from the backend format. This needs to be updated before we can display correct times
    dateTime: domain.dateTime.toISOString(),
    symptoms: domain.symptoms,
  };
};

const symptomsEntryToDomain = (entry: SymptomsEntryState): SymptomsEntry => {
  return {
    dateTime: new Date(entry.dateTime),
    symptoms: entry.symptoms,
  };
};

const symptomsEntryFromApi = (
  apiEntry: ApiSymptomsEntry
): SymptomsEntryState => {
  return {
    dateTime: convertFromApiDate(apiEntry.date_time),
    symptoms: apiEntry.symptoms,
  };
};

const initialState: SymptomsSliceState = {
  symptomsEntries: [],
  loading: false,
  daysLoaded: 0,
  saving: false,
  saveError: null,
  loadError: null,
};

export const symptomsSlice = createAppSlice({
  name: "symptoms",
  initialState: initialState,
  reducers: (create) => ({
    clearSaveError: create.reducer((state) => {
      state.saveError = null;
    }),
    clearLoadError: create.reducer((state) => {
      state.loadError = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(saveSymptomsEntry.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveSymptomsEntry.fulfilled, (state, action) => {
        state.saving = false;
        state.symptomsEntries = [
          symptomsEntryFromApi(action.payload),
          ...state.symptomsEntries,
        ];
      })
      .addCase(saveSymptomsEntry.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error.message || "Failed to save symptoms";
      })
      .addCase(fetchSymptoms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSymptoms.fulfilled, (state, action) => {
        state.loading = false;
        state.symptomsEntries = [...state.symptomsEntries, ...action.payload];
        state.daysLoaded += action.meta.arg.days;
      })
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.loading = false;
        state.loadError =
          `Failed to fetch symptoms: ${action.error?.message}` ||
          "Failed to fetch symptoms";
      });
  },
  selectors: {
    selectSymptomsEntries: (state) =>
      state.symptomsEntries.map((entry) => symptomsEntryToDomain(entry)),
    selectLoading: (state) => state.loading,
    selectDaysLoaded: (state) => state.daysLoaded,
    selectSaving: (state) => state.saving,
    selectSaveError: (state) => state.saveError,
    selectLoadError: (state) => state.loadError,
  },
});

export const { clearSaveError, clearLoadError } = symptomsSlice.actions;
export const {
  selectSymptomsEntries,
  selectLoading,
  selectDaysLoaded,
  selectSaving,
  selectSaveError,
  selectLoadError,
} = symptomsSlice.selectors;
