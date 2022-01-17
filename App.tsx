import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
} from './app/firebase';

import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { SCHEME } from './app/constants';

const LoginPage = ({ onLogin, loginText }: any) => {
	const auth = getAuth();
	const [requestToGoogle, responseFromGoogle, promptGoogleAuthAsync] = Google.useIdTokenAuthRequest(clientIds, {
		scheme: SCHEME,
		// path: "redirect",
	});

	useEffect(() => {
		console.log(`App.tsx: useEffect (requestToGoogle) requestToGoogle: ${JSON.stringify(requestToGoogle)}`);
		// console.log('GOOGLE: ', requestToGoogle);
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
					alert(JSON.stringify(err));
				});
		} else {
			console.log(
				`App.tsx: useEffect (responseFromGoogle)  responseFromGoogle?.type  OTHER THAN 'success' (not success) ${JSON.stringify(
					responseFromGoogle,
					null,
					2
				)}`
			);
		}
	}, [responseFromGoogle]);

	useEffect(() => {
		if (auth.currentUser) {
			console.log(`App.tsx: useEffect (auth) :going to onLogin with ${auth.currentUser}`);

			onLogin(auth.currentUser);
		}
	}, [auth]);

	const signInWithGoogle = async () => {
		if (Platform.OS === 'web') {
			console.log(`App.tsx: signInWithGoogle(): Platform Web`);
			// console.log('LoginPage: ABOUT TO GO TO GOOGLE AUTH!');
			const provider = new GoogleAuthProvider();
			signInWithRedirect(getAuth(), provider).catch((error: FirebaseError) => {
				console.error(error);
			});
		} else if (Platform.OS === 'android' || Platform.OS === 'ios') {
			console.log(`App.tsx: signInWithGoogle(): Platform NOT Web`);

			promptGoogleAuthAsync();
		}
	};

	console.log(`App.tsx: LoginPage(): Rendering MAIN for LoginPage Inside of App.tsx`);

	return (
		<TouchableOpacity style={styles.touchable} onPress={signInWithGoogle}>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Login with Google</Text>
			<Text>{loginText}</Text>
		</TouchableOpacity>
	);
};

const LogoutPage = ({ onLogout }: any) => {
	const auth = getAuth();
	const { logout } = useContext(FirebaseContext);

	useEffect(() => {
		if (!auth.currentUser) {
			console.log(`App.tsx: useEffect (auth)  LogoutPage auth.currentUser: ${JSON.stringify(auth.currentUser)}`);
			onLogout();
		}
	}, [auth]);

	const onPressHandler = () => {
		logout(onLogout, () => console.error);
	};

	console.log(`App.tsx: LogoutPage(): Rendering MAIN for LogoutPage Inside of App.tsx`);

	return (
		<TouchableOpacity style={styles.touchable} onPress={onPressHandler}>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Logout</Text>
		</TouchableOpacity>
	);
};

export default function App() {
	const [loggedIn, setLoggedIn] = useState(false);

	console.log(`App.tsx: App(): Rendering MAIN App.tsx MAIN MAIN MAIN`);

	return (
		<FirebaseProvider>
			<View style={styles.container}>
				{!loggedIn ? (
					<LoginPage onLogin={() => setLoggedIn(true)} loginText={'Logged in!!!'} />
				) : (
					<LogoutPage onLogout={() => setLoggedIn(false)} loginText={'Not logged in!!!'} />
				)}
			</View>
		</FirebaseProvider>
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
