import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DocumentPicker, { types } from "react-native-document-picker";
import { AudioRecorder, AudioUtils } from "react-native-audio";
import LinearGradient from "react-native-linear-gradient";
import FontistoIcons from "react-native-vector-icons/Fontisto";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/SimpleLineIcons";
import { connect, useDispatch } from "react-redux";
import { icons } from "../constants";
import { getPath, predictShazam } from "../store/slices/trackPlayerSlice";
import { Styles } from "./Styles";

const {
  container,
  shazam_button_container,
  shazam_button_hole,
  shazam_button_background,
  search_button_container,
  search_button_background,
  scroll_container,
  home_gradient,
  home_text,
  action_text,
} = Styles;

const { width, height } = Dimensions.get("window");

const SHAZAM_BUTTON_SIZE = width * 0.5;
const SEARCH_BUTTON_SIZE = width * 0.175;
const NAV_BUTTONS_SIZE = 30;

const AnimatedFontistoIcons = Animated.createAnimatedComponent(FontistoIcons);

const scale = new Animated.Value(1);

const pusle_animation = Animated.loop(
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 1.05,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
  ]),
);

const press_in_animation = Animated.loop(
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 0.8,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 0.75,
      duration: 1000,
      useNativeDriver: true,
    }),
  ]),
);

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
    pusle_animation.start();
  }, []);
  useEffect(() => {
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      setState((prev) => {
        return { ...prev, hasPermission: isAuthorised };
      });

      if (!isAuthorised) return;

      prepareRecordingPath(state.audioPath);

      AudioRecorder.onProgress = (data) => {
        setState((prev) => {
          return { ...prev, currentTime: Math.floor(data.currentTime) };
        });
      };

      AudioRecorder.onFinished = (data) => {
        dispatch(predictShazam(data?.audioFileURL));
      };
    });
  }, []);
  const prepareRecordingPath = (audioPath: any) => {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000,
      // IncludeBase64: true,
    });
  };
  const _record = async () => {
    if (state.recording) {
      console.warn("Already recording!");
      return;
    }

    if (!state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    if (state.stoppedRecording) {
      prepareRecordingPath(state.audioPath);
    }

    setState((prev) => {
      return { ...prev, recording: true, paused: false };
    });
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  };
  const handleDocumentSelection = useCallback(async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    try {
      const response = await DocumentPicker.pickSingle({
        presentationStyle: "fullScreen",
        type: [types.audio],
      });

      const theSong = await getPath(response.uri);
      console.log("theSong", JSON.stringify(response, null, 2));
      dispatch(
        predictShazam({
          ...response,
          uri: theSong,
        }),
      );
    } catch (err) {
      console.warn(err);
    }
  }, []);
  const [state, setState] = useState({
    currentTime: 0.0,
    recording: false,
    paused: false,
    stoppedRecording: false,
    finished: false,
    audioPath: AudioUtils.DocumentDirectoryPath + "/output.aac",
    hasPermission: undefined,
  });

  const onPressInShazam = () => {
    _record();

    pusle_animation.stop();
    press_in_animation.reset();
    press_in_animation.start();
  };
  const _stop = async () => {
    if (!state.recording) {
      console.warn("Can't stop, not recording!");
      return;
    }
    setState((prev) => {
      return {
        ...prev,
        stoppedRecording: true,
        recording: false,
        paused: false,
      };
    });

    try {
      const filePath = await AudioRecorder.stopRecording();
      if (Platform.OS === "android") {
        console.log("filePath", JSON.stringify(filePath, null, 2));

        _finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  };

  const tr;

  const _finishRecording = (didSucceed, filePath) => {
    setState((prev) => {
      return { ...prev, finished: didSucceed };
    });
    console.log(`Finished recording of duration ${state.currentTime} `);
  };
  const onPressOutShazam = () => {
    _stop();
    press_in_animation.stop();
    pusle_animation.reset();
    pusle_animation.start();
  };

  return (
    <ScrollView style={[container]} contentContainerStyle={scroll_container}>
      <ImageBackground style={[container, home_gradient]} source={icons.bg}>
        <Text style={[home_text, action_text]}>Tap to Soundee</Text>

        <View style={shazam_button_container}>
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
            activeOpacity={1}
            onPressIn={onPressInShazam}
            onPressOut={onPressOutShazam}>
            <LinearGradient
              colors={[
                "rgba(0,0,0,1)",
                "rgba(0,0,0, 0.3)",
                "rgba(0,0,0, 0.15)",
              ]}
              locations={[0, 0.001, 0.5]}
              style={shazam_button_hole}
            />
            {/* <SharedElement style={{justifyContent: "center", alignItems: "center"}} id="shazam-button-background"> */}
            <Animated.View
              style={[shazam_button_background, { transform: [{ scale }] }]}
            />
            {/* </SharedElement> */}
            {/* <SharedElement id="shazam-button" ><View style={{width: SHAZAM_BUTTON_SIZE, height: SHAZAM_BUTTON_SIZE, backgroundColor: "rgba(0,0,0,1)"}} /></SharedElement> */}
            {/* <SharedElement id="shazam-button" > */}
            <AnimatedFontistoIcons
              name='shazam'
              color='rgb(75, 180, 255)'
              size={SHAZAM_BUTTON_SIZE}
              style={{ transform: [{ scale }] }}
            />
            {/* </SharedElement> */}
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
          }}>
          <View style={search_button_container}>
            <View style={[search_button_background]} />
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleDocumentSelection}>
              <IonIcons
                name='cloud-upload'
                color='rgb(20, 150, 255)'
                size={30}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            top: 60,
            left: 25,
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <MaterialCommunityIcons
              name='arrow-left'
              color='white'
              size={NAV_BUTTONS_SIZE}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            position: "absolute",
            top: 60,
            right: 25,
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <FontistoIcons
              name='search'
              color='white'
              size={NAV_BUTTONS_SIZE}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default connect(null)(Home);
