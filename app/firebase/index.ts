import Constants from 'expo-constants';
// import * as Google from 'expo-google-app-auth';
import firebase, { FirebaseApp, FirebaseError, initializeApp, getApp, getApps } from 'firebase/app';

import filestore, {
	DocumentChange,
	DocumentData,
	DocumentSnapshot,
	Timestamp,
	QuerySnapshot,
	QueryDocumentSnapshot,
	FieldValue,
	getFirestore,
	serverTimestamp,
} from 'firebase/firestore';

import {
	AuthError,
	GoogleAuthProvider,
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	getAuth,
	signInWithCredential,
	signInWithRedirect,
	sendPasswordResetEmail,
	signInWithCustomToken,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth';
import * as FirebaseAuth from 'react-firebase-hooks/auth';
import * as FirebaseFirestore from 'react-firebase-hooks/firestore';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { firebaseConfig } from './FirebaseConfig';
import { FirebaseContext, FirebaseProvider } from './FirebaseContext';
import { Platform } from 'react-native';

export {
	FirebaseContext,
	FirebaseProvider,
	getApp,
	getApps,
	createUserWithEmailAndPassword,
	signInWithRedirect,
	sendPasswordResetEmail,
	signInWithCustomToken,
	signInWithEmailAndPassword,
	signOut,
};

export type {
	AuthError,
	DocumentChange,
	DocumentData,
	DocumentSnapshot,
	FirebaseError,
	FirebaseUser,
	QueryDocumentSnapshot,
	QuerySnapshot,
	Timestamp,
};

// Client Key: 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
export const expoClientId = '471911052488-65irbbfsa4ko6kpa6qspfve42ppm9p51.apps.googleusercontent.com';

// export const androidClientId = '471911052488-s8q0g1p45emik3v7odoe8oa0fj2a6h2s.apps.googleusercontent.com';
export const androidClientId = '471911052488-f3lhcb307h93vqlv4o8482obgorcub7c.apps.googleusercontent.com';
//export const androidClientId = '471911052488-cn7ncmnbbbn1nel9crclsk53qd0b3iri.apps.googleusercontent.com';
export const iosClientId = '471911052488-k97l9ccjau4fbufkhssc9b1hocdu5jlt.apps.googleusercontent.com';
export const webClientId = '471911052488-0f0kip6ap9hquitqkhs9lql2afn1dmlr.apps.googleusercontent.com';

export const clientIds = {
	androidClientId,
	expoClientId,
	iosClientId,
	webClientId,
}

// interface LoginSuccess {
// 	type: 'success';
// 	accessToken?: string;
// 	idToken?: string;
// 	refreshToken?: string;
// 	user: Google.GoogleUser;
// }

let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
	firebaseApp = initializeApp(firebaseConfig);
} else {
	firebaseApp = getApp();
}

export const firebaseAuth = getAuth(firebaseApp);

export { GoogleAuthProvider, getAuth, getFirestore };

export const getCurrentTimeStamp = () => serverTimestamp();
export const getCurrentUser = () => firebaseAuth.currentUser;

export const useAuthState = () => FirebaseAuth.useAuthState(getAuth(firebaseApp));

// @ts-expect-error
export const getCollection = (collectionPath: string) => getFirestore(firebaseApp).collection(collectionPath);

export const useCollection = (collectionPath: string, includeMetadataChanges = false) =>
	!collectionPath
		? [undefined, false, new Error('useCollection: collectionPath not specified')]
		: FirebaseFirestore.useCollection(getCollection(collectionPath), {
				snapshotListenOptions: { includeMetadataChanges },
		  });

export const useCollectionOnce = (collectionPath: string, includeMetadataChanges = false) =>
	!collectionPath
		? [undefined, false, new Error('useCollectionOnce: collectionPath not specified')]
		: FirebaseFirestore.useCollectionOnce(getCollection(collectionPath));

export const useCollectionData = (collectionPath: string, includeMetadataChanges = false) =>
	!collectionPath
		? [undefined, false, new Error('useCollectionData: collectionPath not specified')]
		: FirebaseFirestore.useCollectionData(getCollection(collectionPath));

export const useCollectionDataOnce = (collectionPath: string, includeMetadataChanges = false) =>
	!collectionPath
		? [undefined, false, new Error('useCollectionDataOnce: collectionPath not specified')]
		: FirebaseFirestore.useCollectionDataOnce(getCollection(collectionPath));

// @ts-expect-error
export const getDocument = (documentPath: string) => getFirestore().doc(documentPath);

export const useDocument = (documentPath: string, includeMetadataChanges = false) =>
	!documentPath
		? [undefined, false, new Error('useDocument: documentPath was not specified')]
		: FirebaseFirestore.useDocument(getDocument(documentPath), {
				snapshotListenOptions: { includeMetadataChanges },
		  });

export const useDocumentOnce = (documentPath: string, includeMetadataChanges = false) =>
	!documentPath
		? [undefined, false, new Error('useDocumentOnce: documentPath was not specified')]
		: FirebaseFirestore.useDocumentOnce(getDocument(documentPath));

export const useDocumentData = (documentPath: string, includeMetadataChanges = false) =>
	!documentPath
		? [undefined, false, new Error('useDocumentData: documentPath was not specified')]
		: FirebaseFirestore.useDocumentData(getDocument(documentPath), {
				snapshotListenOptions: { includeMetadataChanges },
		  });

export const useDocumentDataOnce = (documentPath: string, includeMetadataChanges = false) =>
	!documentPath
		? [undefined, false, new Error('useDocument: documentPath was not specified')]
		: FirebaseFirestore.useDocumentDataOnce(getDocument(documentPath));

export const getData = (
	querySnapshot: QuerySnapshot<DocumentData>,
	orderBy?: string,
	length?: number,
	firstItem?: any
) => {
	// @ts-expect-error
	if (!orderBy) return querySnapshot.query.get();
	// @ts-expect-error
	else if (!length) return querySnapshot.query.orderBy(orderBy).get();
	// @ts-expect-error
	else if (!firstItem) return querySnapshot.query.orderBy(orderBy).limitToLast(length).get();
	// @ts-expect-error
	else return querySnapshot.query.orderBy(orderBy).limitToLast(length).startAt(firstItem).get();
};

export const getDocumentsDataWithId = (querySnapshot: QuerySnapshot<DocumentData>) => {
	let docs: DocumentData[] = [];
	querySnapshot.docs.forEach((doc: any) => {
		const data = doc.data();
		// Adds the doc's id to it's own data
		data.id = doc.id;
		docs.push(data);
	});
	return docs;
};

export const collectionContains = async (collection: string, docId: string) => {
	const firestore = getFirestore();
	// @ts-expect-error
	return await firestore.collection(collection).doc('ABC').get();
};

// export async function signInWithGoogleAsync() {
// 	//logOutAsync({ accessToken, iosClientId, androidClientId, iosStandaloneAppClientId, androidStandaloneAppClientId }): Promise<any>




// 	if (Platform.OS === 'web') {
// 		// try {
// 		// 	const result = await Google.logInAsync({
// 		// 		behavior: 'web',
// 		// 		androidClientId,
// 		// 		iosClientId,
// 		// 		scopes: ['profile', 'email'],
// 		// 	});
// 		// 	if (result.type === 'success') {
// 		// 		const { idToken } = result as LoginSuccess;
// 		// 		let credential = GoogleAuthProvider.credential(idToken);
// 		// 		return signInWithCredential(firebaseAuth, credential);
// 		// 	}
// 		// } catch (error) {
// 		// 	console.error(error);
// 		// }
// 	} else {
// 		// // Get the users ID token
// 		// const { idToken } = await GoogleSignin.signIn();

// 		// // Create a Google credential with the token
// 		// const googleCredential = GoogleAuthProvider.credential(idToken);

// 		// // Sign-in the user with the credential
// 		// return signInWithCredential(firebaseAuth, googleCredential);
// 	}
// }
