import {
  saveSymptomsApi,
  SaveSymptomsParams,
} from "@/lib/api/saveSymptomsEntry";
import { fetchSymptomsApi, FetchSymptomsParams } from "@/lib/api/fetchSymptoms";
import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SymptomsEntry } from "./models";

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

interface SymptomsState {
  symptomsEntries: SymptomsEntry[];
  loading: boolean;
  daysLoaded: number;
  saving: boolean;
  saveError: string | null;
  loadError: string | null;
}

const initialState: SymptomsState = {
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
        console.log("Raw datetime:", action.payload.dateTime);
        // TODO: Match the backend format. This needs to be updated before we can display correct times
        const dateTime = `${action.payload.dateTime}+00:00`;
        console.log("Saved symptoms entry with dateTime:", dateTime);
        console.log("Current symptoms entries:", ...state.symptomsEntries);
        state.symptomsEntries = [
          { ...action.payload, dateTime: dateTime },
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
    selectSymptomsEntries: (state) => state.symptomsEntries,
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
