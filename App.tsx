import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { maybeCompleteAuthSession } from 'expo-web-browser';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { useAuthRequest, useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithRedirect, signOut } from 'firebase/auth';

import Constants from 'expo-constants';

import { FirebaseError } from 'firebase/app';

// If you want to setup your own firebase test project, all config is in here
import { authOptions, clientIds, firebaseConfig, SCHEME } from './config';

// maybeCompleteAuthSession({
// 	skipRedirectCheck: true,
// });

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
	firebaseApp = initializeApp(firebaseConfig);
} else {
	firebaseApp = getApp();
}

const LoginPage = ({ onLogin }: any) => {
	const auth = getAuth();

	// Hook trick, as long as the conditional never changes (and it doesn't), this will work.
	if (Constants.appOwnership === 'expo') {
		// Works with Expo GO (for managed)
		var [requestToGoogle, responseFromGoogle, promptGoogleAuthAsync] = useIdTokenAuthRequest(clientIds, authOptions);
	} else {
		// Doesn't work with Expo GO (for standalone)
		var [requestToGoogle, responseFromGoogle, promptGoogleAuthAsync] = useAuthRequest(clientIds, authOptions);
	}

	// Logging, this is the request we send to google
	useEffect(() => {
		console.log(`App.tsx: useEffect (requestToGoogle) requestToGoogle: ${JSON.stringify(requestToGoogle)}`);
	}, [requestToGoogle]);

	// Handles the response from google authentication (iOS / Android / Expo Go)
	useEffect(() => {
		if (responseFromGoogle?.type === 'success') {
			console.log(
				`App.tsx: useEffect (responseFromGoogle)  responseFromGoogle?.type === 'success' responseFromGoogle: ${JSON.stringify(
					responseFromGoogle
				)}`
			);

			const { id_token } = responseFromGoogle.params;
			const auth = getAuth();
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(auth, credential)
				.then((value) => {
					console.log(
						`App.tsx: useEffect (responseFromGoogle)  signInWithCredential(auth, credential) ${JSON.stringify(
							value
						)} going to onLogin with ${JSON.stringify(value.user)}`
					);
					// console.log('AuthenticationPage: Successful native login using Google');
					onLogin(value.user);
				})
				.catch((err) => {
					console.log(`App.tsx: useEffect (responseFromGoogle)  ERROR ERROR ERROR`);
					// alert(JSON.stringify(err));
				});
		} else {
			console.log(
				`App.tsx: LoginPage useEffect (responseFromGoogle) responseFromGoogle?.type  ${JSON.stringify(
					responseFromGoogle,
					null,
					2
				)}`
			);
		}
	}, [responseFromGoogle]);

	// Invoke the onLogin callback after firebase has a user
	useEffect(() => {
		if (auth.currentUser) {
			console.log(`App.tsx: useEffect (auth) Logged-In ${auth.currentUser}`);
			onLogin(auth.currentUser);
		}
	}, [auth]);

	// Platform independent sign-in with google
	const signInWithGoogle = async () => {
		if (Platform.OS === 'web') {
			console.log(`App.tsx: signInWithGoogle(): Platform Web`);
			const provider = new GoogleAuthProvider();
			signInWithRedirect(getAuth(), provider)
				.then(() => {
					onLogin(auth.currentUser);
				})
				.catch((error: FirebaseError) => {
					console.error(error);
				});
		} else if (Platform.OS === 'android' || Platform.OS === 'ios') {
			console.log(`App.tsx: signInWithGoogle(): Platform NOT Web`);
			promptGoogleAuthAsync();
		}
	};

	console.log(`App.tsx: LoginPage Rendering`);

	return (
		<TouchableOpacity style={styles.touchable} onPress={signInWithGoogle}>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Login with Google</Text>
		</TouchableOpacity>
	);
};

const LogoutPage = ({ onLogout }: any) => {
	const auth = getAuth();

	const logout = (onSuccess: () => any, onError?: (error: any) => any) => {
		let localAuth = getAuth();

		signOut(localAuth)
			.then(() => {
				console.log(`FirebaseContext: WE ARE IN THE SIGNOUT >>>>>>>`);
				try {
					onSuccess?.();
				} catch (err) {
					console.log(`FirebaseContext: ERROR in setGuest() >>>>>>> ${JSON.stringify(err)}`);
					onError && onError(err as any);
				}
				// onSuccess();
			})
			.catch((err) => {
				console.error([`FirebaseContext: ERROR LOGGING OUT>>>>>`, err]);
				onError && onError(err);
			});
	};

	useEffect(() => {
		if (!auth.currentUser) {
			console.log(`App.tsx: Logged out... auth.currentUser: ${JSON.stringify(auth.currentUser)}`);
			onLogout();
		}
	}, [auth]);

	const onPressHandler = () => {
		logout(onLogout, () => console.error);
	};

	console.log(`App.tsx: LogoutPage(): Rendering LogoutPage`);

	return (
		<TouchableOpacity style={styles.touchable} onPress={onPressHandler}>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Logout</Text>
		</TouchableOpacity>
	);
};

export default function App() {
	const [loggedIn, setLoggedIn] = useState(false);

	console.log(`App.tsx: App(): Rendering App.tsx`);

	// useEffect(() => {
	// 	console.log(
	// 		'MAKE URI:::::::::',
	// 		AuthSession.makeRedirectUri({
	// 			path: 'redirect',
	// 		})
	// 	);
	// }, []);

	// I chopped too much and broke web, only testing native builds (not web)
	if (Platform.OS === 'web') return <View />;

	return (
		<View style={styles.container}>
			{!loggedIn ? <LoginPage onLogin={() => setLoggedIn(true)} /> : <LogoutPage onLogout={() => setLoggedIn(false)} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignContent: 'center',
		alignSelf: 'center',
		maxHeight: 70,
		justifyContent: 'center',
		borderColor: 'black',
		borderRadius: 10,
		borderWidth: 5,
		marginTop: 100,
	},
	touchable: {
		alignContent: 'center',
		alignSelf: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		paddingHorizontal: 20,
	},
});
