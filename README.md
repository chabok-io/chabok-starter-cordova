# Installation

for `sandbox` environment:
```bash
$ cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=SANDBOX
```

for `production` environment:
```bash
$ cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=PRODUCTION
```

## Manual

for `sandbox` environment:
```bash
$ cordova plugin add path_to_folder/cordova_sdk_plugin --variable CHABOK_ENVIRONMENT=SANDBOX
```

for `production` environment:
```bash
$ cordova plugin add path_to_folder/cordova_sdk_plugin --variable CHABOK_ENVIRONMENT=PRODUCTION
```

## Remove

```bash
$ cordova plugin remove com.chabokpush.cordova 
```

# Run

for iOS:
```bash
$ cordova emulate ios --target="iPhone-6s, 12.2"
```

for Android:
```bash
$ cordova emulate android
```
