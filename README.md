Expo Go works... Standalone native builds are not handling the deep link from redirect url.

Useful Documentation
===
    This is the official expo authentication package
    https://docs.expo.dev/versions/latest/sdk/auth-session/

    This is a setup guide for various authentication methods
    https://docs.expo.dev/guides/authentication/

    Firebase Docs
    https://firebase.google.com/docs/android/setup
    https://firebase.google.com/docs/auth/android/start

    Linking
    https://docs.expo.dev/guides/linking/
    https://javascript.plainenglish.io/easy-deep-linking-with-react-native-and-expo-84e3c7b9d63e

    Google Cloud Credentials
    https://console.cloud.google.com/apis/credentials?pli=1&project=expo-firebase-authenticate

    HMMM???
    https://github.com/expo/expo/issues/11714

    Android Doc on Deep Linking
    https://developer.android.com/training/app-links/deep-linking

    
Setup Checklist
===
1. Add scheme to app.json (or app.config.json)
    ```
    {
        "expo": {
            "scheme": "expofire"
        }
    }

2. Setup Android App in Firebase project and download the google services file, and save it to the project's root folder.
3. Update app.config.json
    ```
    "android": {
		"googleServicesFile": "./google-services.json",
        ...

4. Add an Android app to your Firebase project
5. Update the config.ts file in this project with that information

6. Added to app.config.json

    ```
    "android": {
        "intentFilters": [
            {
                "action": "VIEW",
                "data": [
                    {
                        "scheme": "app",
                        "host": "com.nightness.expofire"
                    }
                ],
                "category": ["BROWSABLE", "DEFAULT"]
            }
        ]
        ...

Building
===

expo build:android didn't work for me, do this instead...

expo eject
yarn android
-- or --
cd android && ./gradlew assembleRelease