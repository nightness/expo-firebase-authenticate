import Constants from 'expo-constants';

// Get the SCHEME from app.config.json
export const SCHEME = Constants.manifest?.scheme ?? 'expofire';

export const firebaseConfig = {
    apiKey: "AIzaSyDsYxIVahiRykoLYJfGk1h98JQomUGpW8g",
    authDomain: "expo-firebase-authenticate.firebaseapp.com",
    projectId: "expo-firebase-authenticate",
    storageBucket: "expo-firebase-authenticate.appspot.com",
    messagingSenderId: "471911052488",
    appId: "1:471911052488:web:025186ebd0e78fff6461fd",
  };

export const authOptions = {
  scheme: SCHEME,
  path: 'redirect',	
}
  
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

  