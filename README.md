Web works, Expo Go works; native builds need work.

Useful Documentation
===
    https://docs.expo.dev/versions/latest/sdk/google-sign-in/
    https://docs.expo.dev/guides/authentication/
    https://firebase.google.com/docs/android/setup
    https://docs.expo.dev/guides/linking/
    
Setup Web
===
    Only requires a valid firebase config

Setup Native
===
1. Add to app.json (or app.config.json)
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


Hosted Web Site

    https://expo-firebase-authenticate.web.app

