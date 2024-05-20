import React, { useEffect, memo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks";
import { RootStackParamList } from "./RootStackParams";
import { COLORS, FONTS, icons, MEDIA } from "../constants";
import { trimText } from "../utils/helpers";
import { LoadingSpinner, MediaHeader, MediaItem } from "../components";
import * as mediaActions from "../store/slices/mediaSlice";
import * as trackPlayerActions from "../store/slices/trackPlayerSlice";
import {
  animateOpacity,
  animateHeight,
  animateScale,
} from "../utils/animations";

type tracksScreenProps = NativeStackScreenProps<RootStackParamList, "Media">;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Media = ({ route: { params }, navigation }: tracksScreenProps) => {
  const scrollY = useSharedValue(0);
  const { mediaId, mediaType } = params;
  const media = useAppSelector((state) => state.media);
  const dispatch = useAppDispatch();
  const { tracks } = media;
  console.log("media", JSON.stringify(media, null, 2));
  useEffect(() => {
    if (mediaType === MEDIA.playlist) {
      dispatch(mediaActions.getPlaylistTracksAsync(mediaId));
    } else if (mediaType === MEDIA.album) {
      dispatch(mediaActions.getAlbumsTracksAsync(mediaId));
    } else if (mediaType === MEDIA.artist) {
      dispatch(mediaActions.getArtistTracksAsync(mediaId));
    }
  }, [mediaId, mediaType, dispatch]);

  useEffect(() => {
    dispatch(trackPlayerActions.setTracks(tracks));
  }, [tracks]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const renderTracks = ({ item }: any) => {
    return (
      <MediaItem
        type={media?.type}
        id={item._id}
        previewUrl={item.coverPath}
        explicit={item.explicit}
        trackNumber={item.track_number}
        name={item.title}
        artists={
          item.artist || {
            profile: {
              displayname: media.title,
            },
          }
        }
        durationMs={item.duration_ms}
        duration={item.duration}
        albumImages={[]}
        url={item?.url}
      />
    );
  };
  return (
    <SafeAreaView style={{ backgroundColor: COLORS.black, flex: 1 }}>
      <StatusBar
        animated={true}
        barStyle={"light-content"}
        backgroundColor={COLORS.black}
      />
      <Animated.View
        style={[
          styles.headerContainer,
          animateOpacity(scrollY),
          animateHeight(scrollY),
        ]}>
        <LinearGradient
          style={styles.linearGradient}
          colors={[
            COLORS.black,
            COLORS.black,
            COLORS.black,
            "rgba(7, 7, 7, 0.55)",
            "rgba(7, 7, 7, 0.50)",
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Image style={styles.backIcon} source={icons.back} />
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, ...FONTS.h3 }}>
          {/* {trimText(media.name, 34)} */}
        </Text>
      </Animated.View>

      {media.isLoading ? (
        <LoadingSpinner />
      ) : (
        <Animated.View>
          <AnimatedFlatList
            scrollEventThrottle={1}
            onScroll={scrollHandler}
            ListHeaderComponent={
              <MediaHeader
                type={mediaType}
                imageUrl={media.coverPath}
                title={media.title}
                totalTracks={tracks.length}
                mediaDescription={media.description}
                followers={media.followers.total}
                releaseDate={media.releaseDate}
                scrollY={scrollY}
                animateScale={() => animateScale(scrollY)}
              />
            }
            ListFooterComponent={<View style={{ marginBottom: 250 }} />}
            data={tracks}
            renderItem={renderTracks}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    width: "100%",
    backgroundColor: COLORS.lightGray3,
    flexDirection: "row",
    alignItems: "center",
  },
  linearGradient: {
    height: "100%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent",
  },
  backIcon: {
    width: 25,
    height: 25,
    tintColor: COLORS.white,
    marginRight: 20,
    marginLeft: 20,
  },
});

export default memo(Media);
