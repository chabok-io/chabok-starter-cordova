#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const utilities = require("./utilities");

const IOS_DIR = 'platforms/ios';
const ANDROID_DIR = 'platforms/android';

const config = fs.readFileSync('config.xml').toString();
const name = utilities.getValue(config, 'name');

const PLATFORM = {
    IOS: {
        dest: [
            IOS_DIR + '/' + name + '/Chabok.sandbox.plist',
            'plugins/com.chabokpush.cordova/src/ios/Chabok.sandbox.plist',

            IOS_DIR + '/' + name + '/Chabok.production.plist',
            'plugins/com.chabokpush.cordova/src/ios/Chabok.production.plist',
        ],
        src: [
            'Chabok.sandbox.plist',

            'Chabok.production.plist',
        ]
    },
    ANDROID: {
        dest: [
            ANDROID_DIR + '/app/google-services.json',

            ANDROID_DIR + '/app/Chabok.sandbox.json',

            ANDROID_DIR + '/app/Chabok.production.json'
        ],
        src: [
            'google-services.json',

            'Chabok.sandbox.json',

            'Chabok.production.json',
        ],
    }
};

module.exports = function(cordovaContext) {
    console.log('(ℹ️) Get Chabok environment variable from config file or user set by adding plugin. \n' +
     '(🧪) example: Cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=PRODUCTION');

    // Copy key files to their platform specific folders
    if (utilities.directoryExists(IOS_DIR)) {
        console.log('(📱) Preparing Chabok files on iOS');

        utilities.copyKey(PLATFORM.IOS, 'iOS');
    }
    if (utilities.directoryExists(ANDROID_DIR)) {
        console.log('(📱) Preparing Chabok and Firebase files on Android');

        utilities.copyKey(PLATFORM.ANDROID, 'Android');
    }
};
