#!/usr/bin/env node

let fs = require('fs');
let path = require('path');

let APP_CLASS = 'com.chabokpush.cordova.MyAppClass';
let FILE_NAME = 'AndroidManifest.xml'

function replaceClassName(currentCode, withClass, context){
    console.log('-----> Start to insert Chabok application class into the' + FILE_NAME + 'file.');

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/android/app/src/main');
    let manifestFile = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(manifestFile)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(manifestFile, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (data.indexOf(APP_CLASS) === -1) {
                if (!data.includes(APP_CLASS)) {
                    let result = data.replace(currentCode, withClass);

                    fs.writeFile(manifestFile, result, 'utf8', function (err) {
                        if (err) {
                            throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                        } else {
                            console.info('Add Chabok application class name into the AndroidManifest.xml file successfully.');
                        }
                    })
                } else {
                    console.warn( 'Chabok application class name already added to ' + FILE_NAME);
                }
            } else {
                console.warn( 'data contain (' + APP_CLASS + ') file and ignore to add class name to manifest.');
            }
        });
    } else {
        console.warn('Could not find AndroidManifest.xml file.');
    }
}

function insertChabokApplicationClass(context){
    replaceClassName(/<application/g, '<application android:name="' + APP_CLASS + '"', context)
}

function removeChabokApplicationClass(context){
    console.log('-----> Start to remove Chabok application class into the' + FILE_NAME + ' file.');

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/android/app/src/main');
    let manifestFile = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(manifestFile)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(manifestFile, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (data.indexOf(APP_CLASS)) {
                let result = data.replace('android:name="' + APP_CLASS + '"', '');

                fs.writeFile(manifestFile, result, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Removed Chabok application class name into the AndroidManifest.xml file successfully.');
                    }
                })
            } else {
                console.warn( 'data contain (' + APP_CLASS + ') file and ignore to remove class name to manifest.');
            }
        });
    } else {
        console.warn('Could not find AndroidManifest.xml file.');
    }
}

module.exports = function(context) {
    if (context.hook === 'before_plugin_uninstall'){
        removeChabokApplicationClass(context);
    } else {
        insertChabokApplicationClass(context);
    }
};
