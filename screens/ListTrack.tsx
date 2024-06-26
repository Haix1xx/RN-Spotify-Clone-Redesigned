import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Header,
  LoadingSpinner,
  MediaItem,
  SearchItem,
  TextTitle,
} from "../components";
import * as searchActions from "../store/slices/searchSlice";

import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SIZES } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks";

const ListTrack = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search);
  useEffect(() => {
    dispatch(searchActions.topTrackAsync());
  }, []);

  const renderSearchResults = () => {
    if (search?.isLoading2) return <LoadingSpinner />;
    if (!search?.results2) {
      return (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: SIZES.padding,
          }}>
          <Text style={{ color: COLORS.white, ...FONTS.h1 }}>
            Couldn't find
          </Text>
        </View>
      );
    }

    return (
      <View>
        {search?.results2?.map((it) => {
          const item = it.track;
          return (
            <MediaItem
              type={"tracks"}
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
        })}
      </View>
    );
  };

  return (
    <View style={styles.searchScreen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Header />
          {/* search component */}
          <TextTitle label='Top tracks' containerStyle={{ ...FONTS.h1 }} />
        </View>
        <View style={styles.footerContainer}>{renderSearchResults()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  searchScreen: {
    flex: 1,
    paddingTop: SIZES.paddingTop,
    backgroundColor: COLORS.black,
    width: "100%",
  },
  searchContainer: {
    marginHorizontal: SIZES.padding,
    paddingHorizontal: 15,
    borderColor: COLORS.white,
    borderWidth: 1,
    borderRadius: 50,
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    marginBottom: SIZES.paddingBottom,
  },
  textInput: {
    height: 60,
    flex: 1,
    marginLeft: 10,
    color: COLORS.white,
    ...FONTS.body,
  },
  footerContainer: {
    paddingBottom: 120,
    paddingHorizontal: SIZES.padding,
  },
  cardItemContainer: {
    backgroundColor: COLORS.lightGray3,
    padding: 10,
    borderRadius: 20,
    flexDirection: "row-reverse",
  },
  cardItemImageContainer: {
    width: 30,
    position: "relative",
    left: 50,
  },
  cardItemImage: {
    height: 135,
    width: 80,
    borderRadius: 20,
  },
  cardItemCategory: {
    width: 185,
    marginRight: 58,
    justifyContent: "center",
  },
  categoryName: {
    color: COLORS.white,
    paddingBottom: 10,
    ...FONTS.h2,
  },
  searchIcon: {
    height: 25,
    width: 25,
    tintColor: COLORS.white,
  },
});

export default ListTrack;
