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
            IOS_DIR + '/www/Chabok.sandbox.plist',
            'www/Chabok.sandbox.plist',

            'Chabok.production.plist',
            IOS_DIR + '/www/Chabok.production.plist',
            'www/Chabok.production.plist'
        ]
    },
    ANDROID: {
        dest: [
            ANDROID_DIR + '/google-services.json',
            ANDROID_DIR + '/app/google-services.json',

            ANDROID_DIR + '/Chabok.sandbox.json',
            ANDROID_DIR + '/app/Chabok.sandbox.json',

            ANDROID_DIR + '/Chabok.production.json',
            ANDROID_DIR + '/app/Chabok.production.json'
        ],
        src: [
            'google-services.json',
            ANDROID_DIR + '/assets/www/google-services.json',
            'www/google-services.json',
            ANDROID_DIR + '/app/src/main/google-services.json',

            'Chabok.sandbox.json',
            ANDROID_DIR + '/assets/www/Chabok.sandbox.json',
            'www/Chabok.sandbox.json',
            ANDROID_DIR + '/app/src/main/Chabok.sandbox.json',

            'Chabok.production.json',
            ANDROID_DIR + '/assets/www/Chabok.production.json',
            'www/Chabok.production.json',
            ANDROID_DIR + '/app/src/main/Chabok.production.json'
        ],
    }
};


module.exports = function(context) {
    console.log('(🏁) Start removing iOS config files');
    PLATFORM.IOS.dest.forEach(path => {
        utilities.removeFile(path);
    })
    console.log('(🔚) Finish removing iOS config files.');

    console.log('(🏁) Start removing Android config files');
    PLATFORM.ANDROID.dest.forEach(path => {
        utilities.removeFile(path);
    })
    console.log('(🔚) Finish removing Android config files.');

    let FILE_NAME = 'MyAppClass.java';
    let platformAndroidRoot = path.join(context.opts.projectRoot,
        'platforms/android/app/src/main/java/com/chabokpush/cordova/ChabokPush');
    let applicationClass = path.join(platformAndroidRoot, FILE_NAME);
    utilities.removeFile(applicationClass);

}
