import { BASE_URL } from "@env";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Song } from "../../types/song.type";

import { setHeaders } from "../../utils/helpers";
import { RootState } from "../index";

const initialState: {
  isLoading: boolean;
  isLoading2: boolean;
  results2: Song[];
  results: Song[];
} = {
  isLoading: true,
  results: [],
  isLoading2: true,
  results2: [],
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
export const topTrackAsync = createAsyncThunk<
  any,
  string,
  { state: RootState }
>("searchadada", async (any, { getState, rejectWithValue }) => {
  const accessToken = getState().auth.accessToken;
  try {
    const response = await fetch(
      `${BASE_URL}/overview/top-tracks?limit=10&page=1`,
      {
        method: "GET",
        headers: setHeaders(accessToken),
      },
    );
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
    builder.addCase(topTrackAsync.pending, (state) => {
      state.isLoading2 = true;
    });
    builder.addCase(topTrackAsync.fulfilled, (state, { payload }) => {
      state.isLoading2 = false;
      state.results2 = payload?.data?.data;
    });
  },
});

export default searchSlice.reducer;
