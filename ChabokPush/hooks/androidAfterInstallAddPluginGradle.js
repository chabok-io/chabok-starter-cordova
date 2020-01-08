#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const utilities = require("./utilities");

const FILE_NAME = 'build.gradle';
const mavenRepo = 'maven {\n' +
    '            url "https://plugins.gradle.org/m2/"\n' +
    '        }';

function addChabokLib(context){
    console.log('(LAST) -----> Start to insert Chabok plugin into the ' + FILE_NAME + ' file.');

    let chabokAndFirebaseGradle = 'classpath "io.chabok.plugin:chabok-services:1.0.0"\n' +
        '        classpath \'com.google.gms:google-services:4.3.2\'';

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/android');

    let buildGradleFIle = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(buildGradleFIle)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(buildGradleFIle, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (!data.includes(mavenRepo)) {
                data = data.replace('jcenter()',
                    'jcenter()\n        ' + mavenRepo);

                console.log('Add maven plugin into the Android '+FILE_NAME+'. \n\n' + data);

                fs.writeFile(buildGradleFIle, data, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Add maven plugin in '+FILE_NAME+' file successfully.');
                    }
                })
            } else {
                console.warn('maven plugin already added.');
            }

            if (!data.includes(chabokAndFirebaseGradle)) {
                let result = data.replace('classpath \'com.android.tools.build:gradle',
                    chabokAndFirebaseGradle + '\n        classpath \'com.android.tools.build:gradle');

                console.log('Add Chabok plugin into the Android '+FILE_NAME+'. \n\n' + result);

                fs.writeFile(buildGradleFIle, result, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Add Chabok plugin in '+FILE_NAME+' file successfully.');
                    }
                })
            } else {
                console.warn('Chabok plugin already added.');
            }
        });
    } else {
        console.warn('Could not find '+FILE_NAME+' file.');
    }
}

function removeChabokLib(context){
    console.log('-----> Start to remove Chabok plugin into the ' + FILE_NAME + ' file.');

    let chabokAndFirebaseGradle = 'classpath \'com.google.gms:google-services:4.3.2\'\n' +
        '        classpath \'com.android.tools.build:gradle:3.5.1\'';

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/android');

    let buildGradleFIle = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(buildGradleFIle)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(buildGradleFIle, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (data.includes(mavenRepo)) {
                let result = data.replace('jcenter()' + mavenRepo,
                    'jcenter()'
                    );

                result = result.replace(
                    'classpath "io.chabok.plugin:chabok-services:1.0.0" \n\n' + chabokAndFirebaseGradle,
                    'classpath \'com.android.tools.build:gradle:3.5.1\'');

                console.log('Removed Chabok plugin from the Android '+FILE_NAME+'. \n\n' + result);

                fs.writeFile(buildGradleFIle, result, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Removed Chabok plugin in '+FILE_NAME+' file successfully.');
                    }
                })
            } else {
                console.warn('Chabok plugin already removed.');
            }
        });
    } else {
        console.warn('Could not find '+FILE_NAME+' file.');
    }
}

module.exports = function(context) {
    if (context.hook === 'before_plugin_uninstall'){
        removeChabokLib(context);
    } else {
        addChabokLib(context);
    }
};
