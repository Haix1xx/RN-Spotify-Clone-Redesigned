import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as mediaActions from "../store/slices/mediaSlice";

import {
  Header,
  HorizontalCardContainer,
  TextButton,
  TextTitle,
} from "../components";
import { SIZES, COLORS, FONTS, MEDIA } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks";
import * as userActions from "../store/slices/userSlice";
import * as playlistActions from "../store/slices/playlistSlice";
import * as trackPlayerActions from "../store/slices/trackPlayerSlice";
import { navigate } from "../navigation";

const Home = () => {
  const user = useAppSelector((state) => state.user);
  const playlist = useAppSelector((state) => state.playlist);
  const dispatch = useAppDispatch();
  const library = useAppSelector((state) => state.library);
  const { topArtists } = library;
  console.log("topTracks", JSON.stringify(topArtists, null, 2));
  useEffect(() => {
    dispatch(userActions.getUserPlaylistsAsync("15"));
    dispatch(userActions.getUserRecentlyPlayedAsync("10"));
    dispatch(
      userActions.getUserTopArtistsAsync({
        time_range: "long_term",
        limit: "3",
      }),
    );
    dispatch(
      playlistActions.getCategoryPlaylistAsync({
        categoryId: "toplists",
        limit: "10",
      }),
    );
    dispatch(playlistActions.getFeaturedPlaylistsAsync("1"));
    dispatch(playlistActions.getNewReleasesAsync("10"));
    dispatch(trackPlayerActions.initAsync());
  }, [dispatch]);

  const renderButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        <TextButton
          label='explore'
          buttonContainerStyle={{ paddingHorizontal: 26 }}
        />
        <TextButton
          label='upgrade to premium'
          buttonContainerStyle={styles.textButton}
        />
      </View>
    );
  };

  const renderTopArtistsAndTracksContainer = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          navigate("TopTrack");
        }}
        style={{ paddingBottom: SIZES.paddingBottom }}>
        <TextTitle label='TOP ARTIST AND TRACKS' />
        <View style={styles.artistsAndTracksContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.topArtistsAndTracksText}>
              SEE YOUR ALL TIME TOP ARTISTS AND TRACKS
            </Text>
            <Text style={{ color: COLORS.white, ...FONTS.body }}>
              Your top tracks and artists thought your listening history
            </Text>
          </View>
          {topArtists &&
            topArtists
              .filter((_, index) => index <= 2)
              .map((artist) => {
                return (
                  <View key={`${artist.id}`} style={{ width: 30 }}>
                    <Image
                      style={styles.topArtistAndTracksImage}
                      source={
                        artist.profile?.avatar
                          ? {
                              uri: artist.profile?.avatar,
                            }
                          : require("../assets/images/image-placeholder.png")
                      }
                    />
                  </View>
                );
              })}
        </View>
      </TouchableOpacity>
    );
  };
  console.log(
    "playlist.featured[0]",
    JSON.stringify(playlist.featured[0], null, 2),
  );
  return (
    <View style={styles.container}>
      <ScrollView>
        <Header />
        <View style={{ paddingBottom: 120 }}>
          <HorizontalCardContainer
            label='MY PLAYLISTS'
            cardItemImageStyle={{ opacity: 0.6 }}
            cardItemTextStyle={styles.playlistTextStyle}
            data={user.playlists}
          />
          {renderButtons()}
          <HorizontalCardContainer
            label='RECENTLY PLAYED'
            data={user.recentlyPlayed}
          />
          {renderTopArtistsAndTracksContainer()}
          {/* featured */}
          <View style={{ paddingBottom: SIZES.paddingBottom }}>
            <TextTitle label='FEATURED' />
            <View style={styles.featuredContainer}>
              <ImageBackground
                style={styles.featuredImage}
                resizeMode='repeat'
                source={
                  playlist.featured[0]?.coverPath
                    ? {
                        uri: playlist.featured[0]?.coverPath,
                      }
                    : require("../assets/images/image-placeholder.png")
                }>
                <TextButton
                  onPress={() => {
                    navigate("TopTrack");
                  }}
                  label='CHECK IT OUT'
                  buttonContainerStyle={{
                    backgroundColor: COLORS.black,
                    borderWidth: 1,
                  }}
                />
              </ImageBackground>
            </View>
          </View>
          <HorizontalCardContainer
            label='NEW RELEASES'
            data={playlist.newReleases}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SIZES.paddingTop,
    backgroundColor: COLORS.black,
    width: "100%",
  },
  playlistTextStyle: {
    paddingLeft: 10,
    position: "absolute",
    bottom: SIZES.padding,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.paddingBottom,
  },
  textButton: {
    paddingHorizontal: 26,
    backgroundColor: COLORS.black,
    borderColor: COLORS.white,
    borderWidth: 1,
  },
  artistsAndTracksContainer: {
    paddingRight: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.lightGray3,
    padding: 10,
    borderRadius: 20,
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row-reverse",
  },
  topArtistsAndTracksText: {
    color: COLORS.white,
    paddingBottom: 30,
    ...FONTS.h3,
  },
  textContainer: {
    paddingLeft: 45,
    paddingRight: 80,
    justifyContent: "center",
  },
  topArtistAndTracksImage: {
    height: 135,
    width: 68,
    borderRadius: 20,
  },
  featuredContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredImage: {
    width: "100%",
    height: 210,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
