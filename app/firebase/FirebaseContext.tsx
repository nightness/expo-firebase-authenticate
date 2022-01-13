import React, { useContext, createContext, useState, useEffect } from 'react';
import { View, Text, Platform, Image, ActivityIndicator } from 'react-native';
import { useAuthState, getAuth, getFirestore, FirebaseUser } from './index';
import * as Linking from 'expo-linking';

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
	const [authToken, setAuthToken] = useState();

	const [currentUser, isLoading, errorUser] = useAuthState();

	useEffect(() => {
		console.log('Loading initial state and starting firebase');
		if (Platform.OS !== 'web') {
			const results = [];

			results.push(Linking.createURL('https://google.com'));

			console.log('CREATE URL', results);

			const urlHandler: Linking.URLListener = (event) => {
				console.log(`URL LISTENER:`, event);
				alert(event.url);
			};

			Linking.addEventListener('url', urlHandler);
			return () => {
				Linking.removeEventListener('url', urlHandler);
			};
        }
	}, []);

	const logout = (onSuccess: () => null, onError: (err: Error) => void) => {
		console.log(`FirebaseContext: LOGGING OUT Logging out...`);
		let localAuth = getAuth();

		signOut(localAuth)
			.then(() => {
				console.log(`FirebaseContext: WE ARE IN THE SIGNOUT >>>>>>>`);
				try {
					onSuccess();
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
