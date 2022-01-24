import React from 'react';
import { Platform } from 'react-native';
import { maybeCompleteAuthSession } from 'expo-web-browser'

import { authOptions, clientIds, SCHEME } from './app/config';
import AppAuth1 from './AppAuth1';
import AppAuth2 from './AppAuth2';

if (Platform.OS === 'web') {
	maybeCompleteAuthSession();
}

export default function App() {
	return (
		<AppAuth1 />
	);
}