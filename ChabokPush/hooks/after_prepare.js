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

// This hook copies configuration options from google-services.json into string resources
// It basically does _part of_ what the Goolge Services gradle plugin does, since cordova
// does not allow plugins to edit the root build.gradle

function log(message) {
    console.log("(CHABOK) - " + message);
}

/**
 * Reads a config from config.xml
 * Simple regexp over xml so it will tolerate a lot of brokenness
 * @param {string} config
 * @param {string} name
 * @param {string} defaultValue
 */
function readConfigVariable(config, name, defaultValue) {
    const regexp = new RegExp('<variable name="' + name + '" value="(.*)"');
    const match = config.match(regexp);
    return match && match[1] ? match[1] : defaultValue;
}

function isSandboxEnvironment(projectRoot) {
    const config = fs
        .readFileSync(path.join(projectRoot, "config.xml"))
        .toString();
    let rawEnableFirebaseConfigExtraction = readConfigVariable(
        config,
        "CHABOK_ENVIRONMENT",
        "SANDBOX"
    );

    const chkProcessEnvVar = readChabokEnvFromProcess(process.argv)
    if (chkProcessEnvVar) {
        rawEnableFirebaseConfigExtraction = chkProcessEnvVar;
    }
    return rawEnableFirebaseConfigExtraction.toLowerCase() === "sandbox";

}

function readChabokEnvFromProcess(variables){
    let variablesStr = JSON.stringify(variables);

    let envVarName = 'CHABOK_ENVIRONMENT';
    let envIndex = variablesStr.indexOf(envVarName)
    if (envIndex === -1){
        return undefined
    }

    let startIndex = envIndex + envVarName.length + 1
    let env = variablesStr.substring(startIndex,startIndex + 3)

    return env.toLowerCase() === 'san'? 'sandbox' : 'production';
}

function removeChabokEnvFromArray(array, variable){
    let index = -1
    array.forEach(function(val,i){
        if(val.includes(variable)) {  //or val.match(/fine/g)
            index = i
            delete array[i]
        }
    })

    return array.filter(v => v !== undefined);
}


module.exports = function(cordovaContext) {
    console.log('(ℹ️) Get Chabok environment variable from config file or user set by adding plugin. \n' +
     '(🧪) example: Cordova plugin add com.chabokpush.cordova --variable CHABOK_ENVIRONMENT=PRODUCTION');

    const projectRoot = cordovaContext.opts.projectRoot;
    let isSandbox = isSandboxEnvironment(projectRoot);
    let chkEnv = isSandbox ? 'sandbox' : 'production';
    // let ignoreCopyChkEnvFile = !isSandbox ? 'sandbox' : 'production';
    //
    // console.log('(🖥) Environment is ' + chkEnv);
    //
    // PLATFORM.IOS.dest = removeChabokEnvFromArray(PLATFORM.IOS.dest,ignoreCopyChkEnvFile);
    // PLATFORM.IOS.src = removeChabokEnvFromArray(PLATFORM.IOS.src,ignoreCopyChkEnvFile);
    //
    // PLATFORM.ANDROID.dest = removeChabokEnvFromArray(PLATFORM.ANDROID.dest,ignoreCopyChkEnvFile);
    // PLATFORM.ANDROID.src = removeChabokEnvFromArray(PLATFORM.ANDROID.src,ignoreCopyChkEnvFile);

    console.log('(🛒) iOS files ready to copy: \n ' + JSON.stringify(PLATFORM.IOS))
    console.log('\n\n(🛒) Android files ready to copy: \n ' + JSON.stringify(PLATFORM.ANDROID))

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
