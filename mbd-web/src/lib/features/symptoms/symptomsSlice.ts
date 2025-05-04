import {
  saveSymptomsApi,
  SaveSymptomsParams,
} from "@/lib/api/saveSymptomsEntry";
import { createAppSlice } from "@/lib/createAppSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const saveSymptomsEntry = createAsyncThunk(
  "symptoms/saveSymptoms",
  async (params: SaveSymptomsParams) => {
    return saveSymptomsApi(params);
  }
);

interface SymptomsState {
  symptoms: string[];
  loading: boolean;
  saving: boolean;
  saveError: string | null;
}

const initialState: SymptomsState = {
  symptoms: [],
  loading: false,
  saving: false,
  saveError: null,
};

export const symptomsSlice = createAppSlice({
  name: "symptoms",
  initialState: initialState,
  reducers: (create) => ({
    clearSaveError: create.reducer((state) => {
      state.saveError = null;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(saveSymptomsEntry.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveSymptomsEntry.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveSymptomsEntry.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error.message || "Failed to save symptoms";
      });
  },
  selectors: {
    selectSymptoms: (state) => state.symptoms,
    selectLoading: (state) => state.loading,
    selectSaving: (state) => state.saving,
    selectSaveError: (state) => state.saveError,
  },
});

export const { clearSaveError } = symptomsSlice.actions;
export const { selectSymptoms, selectLoading, selectSaving, selectSaveError } =
  symptomsSlice.selectors;
