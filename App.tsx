import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  FirebaseContext,
  FirebaseError,
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  clientIds,
  FirebaseProvider,
} from "./app/firebase";

import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { signInWithCredential } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { SCHEME } from "./app/constants";

const LoginPage = ({ onLogin }: any) => {
  const auth = getAuth();
  const [requestToGoogle, responseFromGoogle, promptGoogleAuthAsync] =
    Google.useIdTokenAuthRequest(clientIds, {
      scheme: SCHEME,
      path: "redirect",
    });

  // Handles the response from google authentication (iOS / Android / Expo Go)
  useEffect(() => {
    if (responseFromGoogle?.type === "success") {
      const { id_token } = responseFromGoogle.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((value) => {          
          console.log(
            "AuthenticationPage: Successful native login using Google"
          );
          onLogin(value.user)          
        })
        .catch((err) => {});
    }
  }, [responseFromGoogle]);

  useEffect(() => {
    if (auth.currentUser) onLogin(auth.currentUser);
  }, [auth]);

  const signInWithGoogle = async () => {
    if (Platform.OS === "web") {
      console.log("LoginPage: ABOUT TO GO TO GOOGLE AUTH!");
      const provider = new GoogleAuthProvider();
      signInWithRedirect(getAuth(), provider).catch((error: FirebaseError) => {
        console.error(error);
      });
    } else if (Platform.OS === "android" || Platform.OS === "ios") {
      promptGoogleAuthAsync();
    }
  };

  return (
    <TouchableOpacity style={styles.touchable} onPress={signInWithGoogle}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Login with Google</Text>
    </TouchableOpacity>
  );
};

const LogoutPage = ({ onLogout }: any) => {
  const auth = getAuth();
  const { logout } = useContext(FirebaseContext);

  useEffect(() => {
    if (!auth.currentUser) onLogout();
  }, [auth]);

  const onPressHandler = () => {
    logout(onLogout, () => console.error);
  };

  return (
    <TouchableOpacity style={styles.touchable} onPress={onPressHandler}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <FirebaseProvider>
      <View style={styles.container}>
        {!loggedIn ? (
          <LoginPage onLogin={() => setLoggedIn(true)} />
        ) : (
          <LogoutPage onLogout={() => setLoggedIn(false)} />
        )}
      </View>
    </FirebaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    alignSelf: "center",
    maxHeight: 70,
    justifyContent: "center",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 5,
    marginTop: 100,
  },
  touchable: {
    alignContent: "center",
    alignSelf: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 20
  },
});
