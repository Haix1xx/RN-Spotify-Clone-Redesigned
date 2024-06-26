import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import TrackPlayer from "react-native-track-player";
import RNFetchBlob from "rn-fetch-blob";
import { RootState } from "../index";
import { setHeaders, shuffle } from "../../utils/helpers";
import { BASE_URL } from "@env";
import { ToastAndroid } from "react-native";
import { navigate } from "../../navigation";

const initialState = {
  isTrackPlaying: false,
  isShuffle: false,
  repeat: { one: false, all: false },
  searchTerm: "",
  currentTrack: {
    url: "",
    title: "",
    artwork: "",
    artist: "",
    id: "",
    duration: 0,
  },
  tracks: [] as any,
};
export const getPath = async (uri: string) => {
  console.log("uri", JSON.stringify(uri, null, 2));
  if (uri.startsWith("content://")) {
    const originalFilepath = await RNFetchBlob.fs.stat(decodeURI(uri));
    const wuri = `file://${originalFilepath.path}`;
    return wuri;
  }
  return uri;
};
export const initAsync = createAsyncThunk("trackPlayer/init", async () => {
  await TrackPlayer.setupPlayer({});
});
export const countStream = createAsyncThunk<any, string, { state: RootState }>(
  "stream/count",
  async (id, { getState, rejectWithValue }) => {
    const accessToken = getState().auth.accessToken;

    try {
      const response = await fetch(`${BASE_URL}/streams`, {
        method: "POST",
        headers: setHeaders(accessToken),
        body: JSON.stringify({
          track: id,
        }),
      });
      let data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
export const getTrack = createAsyncThunk<any, string, { state: RootState }>(
  "track/id",
  async (id, { getState, rejectWithValue, dispatch }) => {
    const accessToken = getState().auth.accessToken;
    try {
      const response = await fetch(`${BASE_URL}/tracks/${id}`, {
        method: "GET",
        headers: setHeaders(accessToken),
      });
      let data = await response.json();
      const song = data?.data?.data;
      const selectedTrack = {
        id,
        url: song?.url,
        title: song?.title,
        artist: song?.artist?.profile?.displayname || "",
        artwork: song?.coverPath,
        duration: song?.duration,
      };
      dispatch(resetPlayerAsync());
      dispatch(setCurrentTrackAsync(selectedTrack));
      dispatch(countStream(id));
      dispatch(playTrackAsync());
      navigate("TrackPlayer");

      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
export const predictShazam = createAsyncThunk<any, any, { state: RootState }>(
  "predict/shazam",
  async (song, { getState, rejectWithValue, dispatch }) => {
    const accessToken = getState().auth.accessToken;
    const formData = new FormData();
    formData.append("audio", {
      uri: song.uri || song,
      name: song.name || "output.aac",
      type: song.type || "audio/aac",
    });
    try {
      const response = await fetch(
        `https://allowing-square-werewolf.ngrok-free.app/api/v1/tracks/predict`,
        {
          method: "POST",
          headers: setHeaders(accessToken, "multipart/form-data"),
          body: formData,
        },
      );
      console.log("formData", JSON.stringify(formData, null, 2));
      let data = await response.json();
      console.log("data", JSON.stringify(data, null, 2));

      if (!data?.data) {
        ToastAndroid.showWithGravity(
          "Not found song! ",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        dispatch(getTrack(data?.data?.trackId));
      }
      return data;
    } catch (error) {
      console.log("error", JSON.stringify(error, null, 2));
      return rejectWithValue(error);
    }
  },
);
export const setCurrentTrackAsync = createAsyncThunk(
  "trackPlayer/setCurrentTrack",
  async (currentTrack: typeof initialState.currentTrack, { dispatch }) => {
    await TrackPlayer.add(currentTrack);
    dispatch(countStream(currentTrack.id));
    return currentTrack;
  },
);

export const playTrackAsync = createAsyncThunk(
  "trackPlayer/playTrack",
  async () => {
    await TrackPlayer.play();
  },
);

export const pauseTrackAsync = createAsyncThunk(
  "trackPlayer/pauseTrack",
  async () => {
    await TrackPlayer.pause();
  },
);

export const resetPlayerAsync = createAsyncThunk(
  "trackPlayer/resetPlayer",
  async () => {
    await TrackPlayer.reset();
  },
);

export const seekToPositionAsync = createAsyncThunk(
  "trackPlayer/seekToPosition",
  async (position: number) => {
    await TrackPlayer.seekTo(position);
  },
);

export const playNextTrackAsync = createAsyncThunk<
  any,
  void,
  { state: RootState }
>("trackPlayer/playNextTrack", async (_, { dispatch, getState }) => {
  const trackPlayer = getState().trackPlayer;

  const media = getState().media;
  const isAlbum = getState().media.type === "album";
  const lastIndex = trackPlayer.tracks.length - 1;
  const currentTrackIndex = trackPlayer.tracks.findIndex(
    (track: any) => track._id === trackPlayer.currentTrack.id,
  );
  let nextTrack;
  if (currentTrackIndex === lastIndex) {
    nextTrack = trackPlayer.tracks[0];
  } else {
    nextTrack = trackPlayer.tracks[currentTrackIndex + 1];
  }
  dispatch(resetPlayerAsync());

  dispatch(
    setCurrentTrackAsync({
      id: nextTrack._id,
      url: nextTrack.url,
      title: nextTrack.title,
      artist: nextTrack.artist?.displayname || " ",
      artwork: nextTrack.coverPath,
      duration: nextTrack.duration,
    }),
  );
  dispatch(countStream(nextTrack.id));
  if (currentTrackIndex === lastIndex && !trackPlayer.repeat.all) {
    dispatch(pauseTrackAsync());
  } else {
    dispatch(playTrackAsync());
  }
});

export const playPrevTrackAsync = createAsyncThunk<
  any,
  void,
  { state: RootState }
>("trackPlayer/playPrevTrack", async (_, { dispatch, getState }) => {
  const trackPlayer = getState().trackPlayer;
  const media = getState().media;
  const isAlbum = getState().media.type === "album";
  const currentTrackIndex = trackPlayer.tracks.findIndex(
    (track: any) => track._id === trackPlayer.currentTrack.id,
  );
  let prevTrack;
  if (currentTrackIndex < 1) {
    prevTrack = trackPlayer.tracks[trackPlayer.tracks.length - 1];
  } else {
    prevTrack = trackPlayer.tracks[currentTrackIndex - 1];
  }
  if (currentTrackIndex < 1 && !trackPlayer.repeat.all) {
    dispatch(seekToPositionAsync(0));
  } else {
    dispatch(resetPlayerAsync());
    dispatch(
      setCurrentTrackAsync({
        id: prevTrack._id,
        url: prevTrack.url,
        title: prevTrack.title,
        artist: prevTrack.artist?.displayname || " ",
        artwork: prevTrack.coverPath,
        duration: prevTrack.duration,
      }),
    );
    dispatch(countStream(prevTrack.id));

    dispatch(playTrackAsync());
  }
});

export const shuffleTracksAsync = createAsyncThunk<
  any,
  void,
  { state: RootState }
>("trackPlayer/shuffleTracks", async (_, { getState }) => {
  const trackPlayer = getState().trackPlayer;
  const currentTrack = trackPlayer.tracks.find(
    (track: any) => track._id === trackPlayer.currentTrack.id,
  );
  const filteredTracks = trackPlayer.tracks.filter(
    (track: any) => track._id !== currentTrack.id,
  );
  const randomTracks = shuffle(filteredTracks);
  randomTracks.unshift(currentTrack);
  return randomTracks;
});

export const unShuffleTracksAsync = createAsyncThunk<
  any,
  void,
  { state: RootState }
>("trackPlayer/unShuffleTracks", (_, { getState }) => {
  const originalTracks = getState().media.tracks;
  return originalTracks;
});

const trackPlayerSlice = createSlice({
  name: "trackPlayer",
  initialState,
  reducers: {
    setSearchTerm: (state, { payload }) => {
      state.searchTerm = payload;
    },
    setTracks: (state, { payload }) => {
      state.tracks = payload;
    },
    repeatOne: (state) => {
      state.repeat = { one: true, all: false };
    },
    repeatAll: (state) => {
      state.repeat = { one: false, all: true };
    },
    unsetRepeat: (state) => {
      state.repeat = { one: false, all: false };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initAsync.fulfilled, () => {});
    builder.addCase(setCurrentTrackAsync.fulfilled, (state, { payload }) => {
      state.currentTrack = payload;
    });
    builder.addCase(playTrackAsync.fulfilled, (state) => {
      state.isTrackPlaying = true;
    });
    builder.addCase(pauseTrackAsync.fulfilled, (state) => {
      state.isTrackPlaying = false;
    });
    builder.addCase(seekToPositionAsync.fulfilled, (state) => {});
    builder.addCase(shuffleTracksAsync.fulfilled, (state, { payload }) => {
      state.tracks = payload;
      state.isShuffle = true;
    });
    builder.addCase(unShuffleTracksAsync.fulfilled, (state, { payload }) => {
      state.tracks = payload;
      state.isShuffle = false;
    });
  },
});

export const { setSearchTerm, setTracks, repeatOne, repeatAll, unsetRepeat } =
  trackPlayerSlice.actions;

export default trackPlayerSlice.reducer;
