import * as Linking from 'expo-linking';
import React, { useContext, createContext, useState, useEffect } from 'react';
import { View, Text, Platform, Image, ActivityIndicator } from 'react-native';
import { useAuthState, getAuth, getFirestore, FirebaseUser } from './index';
import { parseUri, UriType } from '../libs';

import { signOut } from 'firebase/auth';

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
		console.log(`FirebaseContext.tsx: useEffect ([])`);

		Linking.getInitialURL()
			.then((url) => {
				console.log(
					`FirebaseContext.tsx: useEffect ([]) INSIDE call to Linking.getInitialURL url: ${JSON.stringify(url)}`
				);

				const initialURL = url ? parseUri(url) : null;
				setInitialURL(initialURL);

				console.log(
					`FirebaseContext.tsx: useEffect ([]) INSIDE call to Linking.getInitialURL initialURL ${JSON.stringify(
						initialURL
					)}`
				);

				// Only run for native builds, but not on Expo Go
				// if (Platform.OS !== 'web' && initialURL?.protocol !== 'exp') {
				// 	const results = [];

				// 	// results.push(Linking.createURL('oauthredirect'));
				// 	results.push(Linking.createURL('redirect'));
				// 	// results.push(Linking.createURL('/oauthredirect'));
				// 	// results.push(Linking.createURL('/redirect'));
				// 	// results.push(Linking.createURL('expofire://redirect'));
				// 	// results.push(Linking.createURL('net.openid.appauth.RedirectUriReceiverActivity'));
				// 	// results.push(Linking.createURL('net.openid.appauth.AuthorizationManagementActivity'));

				// 	console.log(
				// 		`FirebaseContext.tsx: useEffect ([]) INSIDE call to Linking.getInitialURL got results for NOT WEB NOT EXP  results:  ${JSON.stringify(
				// 			results
				// 		)}`
				// 	);

				// 	// console.log('CREATE URL', results);
				// }
			})
			.catch((err) =>
				console.log(
					`FirebaseContext.tsx: useEffect ([]) ERROR ERROR  call to Linking.getInitialURL err:  ${JSON.stringify(err)}`
				)
			);

		// console.error('An error occurred setting	Linking.getInitialURL', err)
		// );

		const urlHandler: Linking.URLListener = (event) => {
			console.log(`FirebaseContext.tsx: urlHandler ${JSON.stringify(event)}`);
			alert(event.url);
		};

		Linking.addEventListener('url', urlHandler);
		console.log(`FirebaseContext.tsx: useEffect ([]) Linking.addEventListener was called before this with urlHandler`);
		return () => {
			console.log(`FirebaseContext.tsx: useEffect ([]) Linking.addEventListener REMOVING LISTENER REMOVING LISTENER`);
			Linking.removeEventListener('url', urlHandler);
		};
	}, []);

	const logout = (onSuccess: () => void, onError?: (error: Error) => void) => {
		console.log(`FirebaseContext: LOGGING OUT Logging out...`);
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

	const updateUserToken = async () => {
		if (!currentUser) {
			setAuthToken(undefined);
			return;
		}

		const token: any = await currentUser.getIdToken(true);
		setAuthToken(token);
		console.log(`FirebaseContext: New Token set... (WE DONT USE?)`, token.substr(0, 10));
	};

	if (errorUser)
		return (
			<View>
				<Text>{JSON.stringify(errorUser)}</Text>
			</View>
		);
	else if (!errorUser && isLoading) return <ActivityIndicator />;

	// tvLog(['Load: Rendering: FirebaseContext', currentUser]);

	// console.log(`FirebaseContext.tsx: MAIN RENDER.... currentUser: ${JSON.stringify(currentUser)}`);

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
