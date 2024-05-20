import { BASE_URL } from "@env";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";

import { setHeaders } from "../../utils/helpers";

const getArtistInfo = async (artistId: string, accessToken: string) => {
  const response = await fetch(`${BASE_URL}/artists/${artistId}`, {
    method: "GET",
    headers: setHeaders(accessToken),
  });
  const data = await response.json();

  return data;
};

export const getPlaylistTracksAsync = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: any }
>(
  "media/getPlaylistTracks",
  async (playlistId, { getState, rejectWithValue }) => {
    const accessToken = getState().auth.accessToken;
    try {
      const response = await fetch(
        `${BASE_URL}/f-playlists/${playlistId}/tracks`,
        {
          method: "GET",
          headers: setHeaders(accessToken),
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getAlbumsTracksAsync = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: any }
>("media/getAlbumTracks", async (albumId, { getState, rejectWithValue }) => {
  const accessToken = getState().auth.accessToken;
  try {
    const response = await fetch(`${BASE_URL}/albums/${albumId}/tracks`, {
      method: "GET",
      headers: setHeaders(accessToken),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getArtistTracksAsync = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: any }
>("media/getArtistTracks", async (artistId, { getState, rejectWithValue }) => {
  const accessToken = getState().auth.accessToken;
  const artistInfo = await getArtistInfo(artistId, accessToken);
  try {
    const response = await fetch(`${BASE_URL}/artists/${artistId}/top-tracks`, {
      method: "GET",
      headers: setHeaders(accessToken),
    });
    const data = await response.json();
    console.log("artistInfo", JSON.stringify(artistInfo, null, 2));
    return { ...data, artist: artistInfo?.data?.data };
  } catch (error) {
    return rejectWithValue(error);
  }
});

const initialState = {
  isLoading: true,
  title: "",
  description: "",
  type: "",
  releaseDate: "",
  coverPath: "",
  followers: { total: 0 },
  tracks: [
    {
      id: "",
      artists: [{ name: "" }],
      preview_url: "",
      name: "",
      explicit: false,
      album: { name: "", images: [{ url: "" }] },
      duration_ms: 0,
    },
  ],
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPlaylistTracksAsync.fulfilled, (state, { payload }) => {
      const formatPayload = payload.data.data;
      const filteredTracks = formatPayload.tracks
        .filter((track: any) => track.preview_url !== null)
        .map((item: any) => item.track);
      formatPayload.tracks = filteredTracks;
      return {
        ...formatPayload,
        type: "playlist",
        followers: { total: 0 },
        isLoading: false,
      };
    });
    builder.addCase(getPlaylistTracksAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAlbumsTracksAsync.fulfilled, (state, { payload }) => {
      const formatPayload = payload.data.data;
      const filteredTracks = formatPayload.tracks
        .filter((track: any) => track.preview_url !== null)
        .map((item: any) => item.track);
      formatPayload.tracks = filteredTracks;
      return {
        ...formatPayload,
        type: "album",
        followers: { total: 0 },
        isLoading: false,
      };
    });
    builder.addCase(getAlbumsTracksAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getArtistTracksAsync.fulfilled, (state, { payload }) => {
      const formatPayload = payload.data.data;
      const filteredTracks = formatPayload.filter(
        (track: any) => track.preview_url !== null,
      );
      formatPayload.tracks = filteredTracks;

      return {
        ...state,
        tracks: filteredTracks,
        coverPath: payload.artist?.avatar,
        title: payload.artist?.displayname,
        type: "artist",
        followers: { total: 0 },
        isLoading: false,
      };
    });
    builder.addCase(getArtistTracksAsync.pending, (state) => {
      state.isLoading = true;
    });
  },
});

export default mediaSlice.reducer;
