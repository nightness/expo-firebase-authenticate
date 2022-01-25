/*
	This app consists of two screens, each with one button (either 'Login to Google' or 'Logout')
*/
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FirebaseApp, getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { useAuthRequest, useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithRedirect, signOut } from 'firebase/auth';
import Constants from 'expo-constants';

// If you want to setup your own firebase test project, all config is in here
import { authOptions, clientIds, firebaseConfig, SCHEME } from './config';

// The styles for components
import { styles } from './styles';

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
	firebaseApp = initializeApp(firebaseConfig);
} else {
	firebaseApp = getApp();
}

//
//	This is the LoginPage Component
//		onLogin: Happens have firebase has a current user
//
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
		console.log(`LoginPage: useEffect (requestToGoogle): ${JSON.stringify(requestToGoogle)}`);
	}, [requestToGoogle]);

	// Handles the response from google authentication (iOS / Android / Expo Go)
	useEffect(() => {
		// Successful response
		if (responseFromGoogle?.type === 'success') {
			console.log(`LoginPage: useEffect (responseFromGoogle): ${JSON.stringify(responseFromGoogle)}`);

			const { id_token } = responseFromGoogle.params;
			const auth = getAuth();
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(auth, credential)
				.then((value) => {
					console.log(
						`LoginPage: useEffect (responseFromGoogle)  signInWithCredential(auth, credential) ${JSON.stringify(
							value
						)} going to onLogin with ${JSON.stringify(value.user)}`
					);
					onLogin(value.user);
				})
				.catch((err) => {
					console.log(`LoginPage: useEffect (responseFromGoogle)  ERROR ERROR ERROR`);
				});
		}
		// THIS IS THE POINT OF WHERE IT FAILS!!!!!
		else {
			console.log(
				`LoginPage: useEffect (responseFromGoogle)
				${JSON.stringify(responseFromGoogle, null, 2)}`
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

	// Render component
	return (
		<TouchableOpacity
			style={styles.touchable}
			onPress={() => {
				console.log(`LoginPage: signInWithGoogle()`);
				promptGoogleAuthAsync();
			}}
		>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Login with Google</Text>
		</TouchableOpacity>
	);
};

//
//	This is the LogoutPage Component
//		onLogout: Happens after firebase current user is null
//
const LogoutPage = ({ onLogout }: any) => {
	const auth = getAuth();

	// Logs out of firebase, with success and error callbacks
	const logout = (onSuccess: () => any, onError?: (error: any) => any) => {
		let localAuth = getAuth();

		signOut(localAuth)
			.then(() => {
				console.log(`Logout: SignOut results`);
				try {
					onSuccess?.();
				} catch (err) {
					console.log(`Logout: ERROR in setGuest() >>>>>>> ${JSON.stringify(err)}`);
					onError && onError(err as any);
				}
			})
			.catch((err) => {
				console.error([`Logout: ERROR LOGGING OUT>>>>>`, err]);
				onError && onError(err);
			});
	};

	// When there is no current user, we are logged out, so call onLogout callback
	useEffect(() => {
		if (!auth.currentUser) {
			console.log(`LogoutPage: currentUser = ${JSON.stringify(auth.currentUser)} (null is good)`);
			onLogout();
		}
	}, [auth]);

	// Render component
	return (
		<TouchableOpacity
			style={styles.touchable}
			onPress={() => {
				logout(onLogout, () => console.error);
			}}
		>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Logout</Text>
		</TouchableOpacity>
	);
};

///
/// App Component
///
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
