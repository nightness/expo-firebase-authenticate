import * as Linking from "expo-linking";
import React, { useContext, createContext, useState, useEffect } from "react";
import { View, Text, Platform, Image, ActivityIndicator } from "react-native";
import { useAuthState, getAuth, getFirestore, FirebaseUser } from "./index";
import { parseUri, UriType } from "../libs";

import { signOut } from "firebase/auth";

type ContextType = {
  currentUser?: FirebaseUser | null;
  isLoading: boolean;
  error?: any;
  authToken?: string;
  logout: (onSuccess: () => void, onError?: (error: Error) => void) => void;
};

export const FirebaseContext = createContext<ContextType>({
  isLoading: true,
  logout: (onSuccess: () => void, onError?: (error: Error) => void) => null,
});

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const FirebaseProvider = ({ children }: Props) => {
  const [currentUser, isLoading, errorUser] = useAuthState();
  const [authToken, setAuthToken] = useState();
  const [initialURL, setInitialURL] = useState<UriType | null | undefined>();

  useEffect(() => {
    console.log("Loading initial state and starting firebase");
    Linking.getInitialURL()
      .then((url) => {
        const initialURL = url ? parseUri(url) : null;
        setInitialURL(initialURL);

        // Only run for native builds, but not on Expo Go
        if (Platform.OS !== "web" && initialURL?.protocol !== "exp") {
          const results = [];

          results.push(Linking.createURL("oauthredirect"));
          results.push(Linking.createURL("redirect"));
          results.push(Linking.createURL(""));
          results.push(Linking.createURL("*"));

          console.log("CREATE URL", results);

        }
      })
      .catch((err) =>
        console.error("An error occurred setting  Linking.getInitialURL", err)
      );

      const urlHandler: Linking.URLListener = (event) => {
        console.log(`URL LISTENER:`, event);
        alert(event.url);
      };

      Linking.addEventListener("url", urlHandler);
      return () => {
        Linking.removeEventListener("url", urlHandler);
      };

  }, []);

  // useEffect(() => {
  //   if (initialURL === undefined) return;

  //   // Only run for native builds
  //   if (Platform.OS !== "web" && initialURL?.protocol !== "exp") {
  //     const results = [];

  //     results.push(Linking.createURL("oauthredirect"));
  //     results.push(Linking.createURL("redirect"));

  //     console.log("CREATE URL", results);

  //     const urlHandler: Linking.URLListener = (event) => {
  //       console.log(`URL LISTENER:`, event);
  //       alert(event.url);
  //     };

  //     Linking.addEventListener("url", urlHandler);
  //     return () => {
  //       Linking.removeEventListener("url", urlHandler);
  //     };
  //   }
  // }, [initialURL]);

  const logout = (onSuccess: () => void, onError?: (error: Error) => void) => {
    console.log(`FirebaseContext: LOGGING OUT Logging out...`);
    let localAuth = getAuth();

    signOut(localAuth)
      .then(() => {
        console.log(`FirebaseContext: WE ARE IN THE SIGNOUT >>>>>>>`);
        try {
          onSuccess?.();
        } catch (err) {
          console.log(
            `FirebaseContext: ERROR in setGuest() >>>>>>> ${JSON.stringify(
              err
            )}`
          );
          onError && onError(err as any);
        }
        // onSuccess();
      })
      .catch((err) => {
        console.error([`FirebaseContext: ERROR LOGGING OUT>>>>>`, err]);
        onError && onError(err);
      });
  };

  const updateUserToken = async () => {
    if (!currentUser) {
      setAuthToken(undefined);
      return;
    }

    const token: any = await currentUser.getIdToken(true);
    setAuthToken(token);
    console.log(
      `FirebaseContext: New Token set... (WE DONT USE?)`,
      token.substr(0, 10)
    );
  };

  if (errorUser)
    return (
      <View>
        <Text>{JSON.stringify(errorUser)}</Text>
      </View>
    );
  else if (!errorUser && isLoading) return <ActivityIndicator />;

  // tvLog(['Load: Rendering: FirebaseContext', currentUser]);

  return (
    <FirebaseContext.Provider
      value={{
        currentUser,
        isLoading,
        error: errorUser,
        authToken,
        logout,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
