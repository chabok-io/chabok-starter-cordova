## v1.1.1
- Update Chabok iOS SDK ([v2.2.0](https://github.com/chabok-io/chabok-client-ios/releases/tag/v2.2.0))
- Update Chabok android SDK ([v3.1.3](https://github.com/chabok-io/chabok-client-android/releases/tag/v3.1.3))
- Add `unsetUserAttribute` method.
- Add `incrementUserAttribute` and `decrementUserAttribute` methods.
- Add `trackPurchase`
- Support `Date` type in events and attributes.  

## v1.1.0
- Update Chabok iOS SDK ([v2.1.0](https://github.com/chabok-io/chabok-client-ios/releases/tag/v2.1.0))
- Update Chabok android SDK ([v3.1.2](https://github.com/chabok-io/chabok-client-android/releases/tag/v3.1.2))
- Now SDK install automatically:
``` bash
//SANDBOX
cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=SANDBOX

//OR PRODUCTION
cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=PRODUCTION
```
- Get notification actions by `setOnNotificationOpenedCallback`.
- Fix get connection status event.
