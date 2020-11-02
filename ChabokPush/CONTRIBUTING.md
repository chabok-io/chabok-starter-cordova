# Table of contents:
* [Project Notes](#project-notes)
* [Android contributing instructions:](#android-contributing-instructions)
    - [Notes](#notes)
    - [Update Android native SDK](#update-android-native-sdk)
    - [Without any breaking changes](#without-any-breaking-changes)
    - [With breaking changes](#with-breaking-changes)
* [iOS contributing instructions:](#ios-contributing-instructions)
    - [Notes](#notes-1)
    - [Update iOS native SDK](#update-ios-native-sdk)
    - [Without any breaking changes](#without-any-breaking-changes-1)
    - [With breaking changes](#with-breaking-changes-1)


## Project Notes
1) For developing in this project use **WebStorm** IDE. This is the best IDE and more compatible with Cordova platform.

2) All js module codes are in `ChabokPush/www` path. After applied changes in the native modules, Don't forget apply them on the js module if need.

3) This SDK by using the Cordova webhooks, automatically add all native code for initialize SDK to the native project.

## Android contributing instructions:

### Notes:
1) For developing Android native bridge use **Android Studio** IDE.

2) Never change the `MyAppClass.java` class. This is application class and helps SDK to automatically apply initialize code.

3) Cordova has two-way communication channel from the native module to js module and conversely. You can communication with service by using `sendPluginResult` method.

4) For running project on android device follow the instruction:

```
cordova run android
```

### Update Android native SDK:
All Chabok libraries follow the semantic versioning.

#### Without any breaking changes:
If it hasn't any breaking changes follow this instruction:

```
vi plugin.xml
```

Just change Chabok Android SDK Version:

from:
``` xml
<framework src="com.adpdigital.push:chabok-lib:3.4.0" />
``` 
to:
``` xml
<framework src="com.adpdigital.push:chabok-lib:3.5.0" />
```

#### With breaking changes
If it has some breaking changes first follow the above instruction. After that if breaking changes includes code changes, don't forget apply all changes in `ChabokPush.java` bridge class.
The `ChabokPush` is a simple bridge for connect the native module and js module.

## iOS contributing instructions:

### Notes:
1) For developing iOS native bridge use **Xcode** IDE. Open project from `/ios` path.

2) For testing iOS bridge you should use `cocoapods` with `1.7.5` version.

3) For running project on iOS device follow the instruction:

```
cordova run android
```

### Update iOS native SDK:
All Chabok libraries follow the semantic versioning.

#### Without any breaking changes:
If it hasn't any breaking changes follow this instruction:

```
vi plugin.xml
```

Just change Chabok iOS SDK Version:

from:
``` xml
<pod name="ChabokPush" spec="~> 2.2.0"/>
``` 
to:
``` xml
<pod name="ChabokPush" spec="~> 2.2.0"/>
```

#### With breaking changes
If it has some breaking changes first follow the above instruction. After that if breaking changes includes code changes, don't forget apply all changes in `ChabokPush.m` bridge class.
The `ChabokPush` is a simple bridge for connect the native module and js module.
