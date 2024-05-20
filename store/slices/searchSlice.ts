import { BASE_URL } from "@env";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Song } from "../../types/song.type";

import { setHeaders } from "../../utils/helpers";
import { RootState } from "../index";

const initialState: {
  isLoading: boolean;
  results: Song[];
} = {
  isLoading: true,
  results: [],
};

export const searchItemsAsync = createAsyncThunk<
  any,
  string,
  { state: RootState }
>("search/searchItems", async (query, { getState, rejectWithValue }) => {
  const accessToken = getState().auth.accessToken;
  const encodeSearchQuery = encodeURIComponent(query);
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeSearchQuery}`, {
      method: "GET",
      headers: setHeaders(accessToken),
    });
    let data = await response.json();

    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(searchItemsAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(searchItemsAsync.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.results = [
        ...(payload.data?.artists || []),
        ...(payload.data?.albums || []),
        ...(payload.data?.tracks || []),
        ...(payload.data?.playlists || []),
        // ...(payload.data?.playlists.items || []),
      ];
    });
  },
});

export default searchSlice.reducer;
