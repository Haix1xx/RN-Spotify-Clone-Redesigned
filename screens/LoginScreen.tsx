import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { COLORS, HEIGHT, icons, WIDTH } from "../constants";
import { loginAsync } from "../store/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./RootStackParams";
import { LoadingSpinner } from "../components";

type loginPlayerScreenProps = StackNavigationProp<RootStackParamList, "Login">;
const LoginScreen = () => {
  const [email, setEmail] = useState("user1@gmail.com");
  const [password, setPassword] = useState("123456789");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm state cho loader

  const dispatch = useDispatch();
  const navigation = useNavigation<loginPlayerScreenProps>();

  const handleLogin = async () => {
    const body = {
      email: email,
      password: password,
    };
    try {
      setLoading(true); // Bắt đầu hiển thị loader
      await dispatch(loginAsync(body));
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false); // Kết thúc hiển thị loader
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder='Nhập email'
        value={email}
        onChangeText={setEmail}
        placeholderTextColor='#999999'
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder='Password'
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor='#999999'
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showPasswordIcon}>
          <Image
            style={{ height: 22, width: 22, tintColor: COLORS.white }}
            source={showPassword ? icons.eye : icons.hideEye}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#ffffff",
  },
  input: {
    width: WIDTH * 0.8,
    height: 50,
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    color: "#ffffff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: WIDTH * 0.8,
  },
  passwordInput: {
    flex: 1,
  },
  showPasswordIcon: {
    position: "absolute",
    right: 15,
    transform: [{ translateY: -8 }],
  },
  button: {
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 10,
    width: WIDTH * 0.8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default LoginScreen;
