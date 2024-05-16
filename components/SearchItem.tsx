import React from "react";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import { COLORS, FONTS, MEDIA } from "../constants";
import BulletDot from "./BulletDot";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../screens/RootStackParams";
import * as trackPlayerActions from "../store/slices/trackPlayerSlice";
import { useAppDispatch } from "../hooks/redux-hooks";
import { IUser } from "../types/user.type";
import { Song } from "../types/song.type";

type searchItemNavProps = StackNavigationProp<RootStackParamList, "Search">;

const SearchItem = ({
  id,
  album,
  title,
  artist,
  url,
  searchTerm,
  duration,
  coverPath,
  type,
  avatar,
  displayname,
}: Partial<Song> & {
  searchTerm: string;
}) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<searchItemNavProps>();
  let albumImageUrl: string | undefined;
  if (type === MEDIA.artist) {
    // albumImageUrl = album.images[0].url;
    albumImageUrl = avatar;
  } else {
    // albumImageUrl = images.length > 0 ? images[0].url : "";
    albumImageUrl = coverPath;
  }
  const onSearchItemHandler = () => {
    if (type !== MEDIA.track) {
      navigation.navigate("Media", {
        mediaType: type,
        mediaId: id,
      });
    } else {
      const selectedTrack = {
        id,
        url: url,
        title: title,
        artist: artist?.profile?.displayname || "",
        artwork: albumImageUrl,
        duration: duration,
      };
      dispatch(trackPlayerActions.resetPlayerAsync());
      dispatch(trackPlayerActions.setCurrentTrackAsync(selectedTrack));
      dispatch(trackPlayerActions.playTrackAsync());
      dispatch(trackPlayerActions.setSearchTerm(searchTerm));
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onSearchItemHandler()}
      activeOpacity={0.7}
      style={{ marginBottom: 15 }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ height: 40, width: 40, marginRight: 15 }}>
          <Image
            style={{
              width: "100%",
              height: "100%",
              borderRadius: type === MEDIA.artist ? 20 : 0,
            }}
            source={
              albumImageUrl
                ? { uri: albumImageUrl }
                : require("../assets/images/image-placeholder.png")
            }
          />
        </View>
        <View>
          <Text style={{ color: COLORS.white, ...FONTS.bodyBold }}>
            {title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: COLORS.lightGray, ...FONTS.body }}>
              {type === MEDIA.artist ? displayname : type}
            </Text>
            {type !== MEDIA.artist && type !== MEDIA.playlist && (
              <>
                <BulletDot />
                <Text style={{ color: COLORS.lightGray, ...FONTS.body }}>
                  {artist?.profile?.displayname}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;
