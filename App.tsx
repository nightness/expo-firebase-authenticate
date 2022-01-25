/*
	This app consists of two screens, each with one button (either 'Login to Google' or 'Logout')
	Support intended only for Android and iOS

	Read the README.md and all the links in it!!!
*/
import React, { useEffect, useState } from 'react';
import { NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FirebaseApp, getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { useAuthRequest, useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithRedirect, signOut } from 'firebase/auth';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const { RNGoogleSignin } = NativeModules;

console.log(NativeModules);
console.log(RNGoogleSignin);

// If you want to setup your own firebase test project, all config is in here, otherwise you can use mine
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
			console.log(`LoginPage: useEffect [responseFromGoogle]: ${JSON.stringify(responseFromGoogle)}`);

			const { id_token } = responseFromGoogle.params;
			const auth = getAuth();
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(auth, credential)
				.then((value) => {
					console.log(`LoginPage: Successful Login ${JSON.stringify(value)}`);
					onLogin(value.user);
				})
				.catch((err) => {
					console.error(`LoginPage: useEffect [responseFromGoogle]`, err);
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
			console.log(`LoginPage: useEffect [auth] Logged-In ${auth.currentUser}`);
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
				console.log(`logout(): SignOut results`);
				try {
					onSuccess?.();
				} catch (err) {
					console.log(`logout(): ERROR (from callback) ${JSON.stringify(err)}`);
					onError && onError(err as any);
				}
			})
			.catch((err) => {
				console.error([`logout(): ERROR  (before callback)`, err]);
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
	// Is used to specify which main component to render
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [initialURL, setInitialURL] = useState<string | null>(null);

	// UrlHandler
	useEffect(() => {
		if (Platform.OS === 'web') return;

		Linking.getInitialURL().then((url) => {
			setInitialURL(url);
			console.log('getInitialURL: url is', url);
		});

		const urlHandler: Linking.URLListener = (event) => {
			console.log(`urlHandler: ${JSON.stringify(event)}`);
			// alert(event.url);
		};

		Linking.addEventListener('url', urlHandler);
		return () => {
			Linking.removeEventListener('url', urlHandler);
		};
	}, []);

	// useEffect(() => {
	// 	console.log(
	// 		'App: makeRedirectUri... I wonder if this is needed or taken care of for us by expo',
	// 		AuthSession.makeRedirectUri({
	// 			path: 'redirect',
	// 		})
	// 	);
	// }, []);

	// This code is not for web
	if (Platform.OS === 'web')
		return (
			<View>
				<Text>This project is for managed Expo Go and standalone native builds</Text>
			</View>
		);

	// Render app, LoginPage if
	return (
		<View style={styles.container}>
			{!isLoggedIn ? (
				<LoginPage onLogin={() => setIsLoggedIn(true)} />
			) : (
				<LogoutPage onLogout={() => setIsLoggedIn(false)} />
			)}
		</View>
	);
}
