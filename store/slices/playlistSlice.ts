import { BASE_URL } from "@env";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { setHeaders } from "../../utils/helpers";
import { RootState } from "../index";

const initialState = {
  topLists: [] as any,
  featured: [{ images: [{ url: "" }] }],
  newReleases: [] as any,
};

export const getCategoryPlaylistAsync = createAsyncThunk<
  any,
  { categoryId: string; limit: string },
  { state: RootState }
>("playlist/getCategoryPlaylist", async (args, { getState }) => {
  const accessToken = getState().auth.accessToken;
  const response = await fetch(
    `${BASE_URL}/browse/categories/${args.categoryId}/playlists?limit=${args.limit}`,
    {
      method: "GET",
      headers: setHeaders(accessToken),
    },
  );
  const data = await response.json();
  return data;
});

export const getFeaturedPlaylistsAsync = createAsyncThunk<
  any,
  string,
  { state: RootState }
>("playlist/getFeaturedPlaylist", async (limit, { getState }) => {
  const accessToken = getState().auth.accessToken;
  const response = await fetch(`${BASE_URL}/f-playlists`, {
    method: "GET",
    headers: setHeaders(accessToken),
  });
  const data = await response.json();
  return data;
});

export const getNewReleasesAsync = createAsyncThunk<
  any,
  string,
  { state: RootState }
>("playlist/getNewReleases", async (limit, { getState }) => {
  const accessToken = getState().auth.accessToken;
  const response = await fetch(
    `${BASE_URL}/search/new-releases?limit=${limit}`,
    {
      method: "GET",
      headers: setHeaders(accessToken),
    },
  );
  const data = await response.json();
  return data;
});

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //   builder.addCase(
    //     getCategoryPlaylistAsync.fulfilled,
    //     (state, { payload }) => {
    //       // state.topLists = payload.playlists.items
    //       state.topLists = [];
    //     },
    //   );
    builder.addCase(
      getFeaturedPlaylistsAsync.fulfilled,
      (state, { payload }) => {
        state.featured = payload.data?.data || [];
      },
    );
    builder.addCase(getNewReleasesAsync.fulfilled, (state, { payload }) => {
      state.newReleases = [
        ...(payload.data?.artists || []),
        ...(payload.data?.albums || []),
        ...(payload.data?.tracks || []),
        ...(payload.data?.playlists || []),
        // ...(payload.data?.playlists.items || []),
      ];
      // state.newReleases = payload.albums.items.map((item: any) => {
      //   const albumName = item.name;
      //   return { ...item, name: albumName, albumName };
      // });
    });
  },
});

export default playlistSlice.reducer;
