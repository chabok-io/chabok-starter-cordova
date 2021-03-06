#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const utilities = require("./utilities");

function setFileName(filename){
    this.fileName = filename;
}

function setImportCode(importCode){
    this.importCode = importCode;
}

function setFunctionCallCode(functionCall) {
    this.functionCall = functionCall;
}

function setDirectoryPath(directoryPath){
    this.directionPath = directoryPath;
}

function getChabokEnvironment(context){
    return  utilities.readChabokEnvFromProcess(context.cmdLine);
}

function getRelativePath(context){
    return path.join(context.opts.projectRoot, this.directionPath);
}

function getFileFullPath(){
    return path.join(getRelativePath(), this.fileName);
}

function isFileExists(file){
    return fs.existsSync(applicationClass)
}


module.exports = function(context) {
    let chkEnv = utilities.readChabokEnvFromProcess(context.cmdLine);
    let ChabokConfigEnv = 'AdpPushClient.configureEnvironment(Environment.'+chkEnv.toUpperCase()+');';

    console.log('-----> Start to insert Chabok application class into the ' + FILE_NAME + 'file.');

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/java/com/chabokpush/cordova');
    console.log('platformRoot = ' + platformRoot);

    let applicationClass = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(applicationClass)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(applicationClass, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (data.indexOf(FILE_NAME) === -1) {
                if (!data.includes(ChabokImport)) {
                    let result = data.replace('import android.app.Application;', 'import android.app.Application; \n' + ChabokImport);

                    result = result.replace('super.onCreate();', 'super.onCreate();' +
                        ' \n \n        ' + ChabokConfigEnv);

                    console.log('Add Chabok configureEnvironment method into the Android Application class. \n\n' + result);

                    fs.writeFile(applicationClass, result, 'utf8', function (err) {
                        if (err) {
                            throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                        } else {
                            console.info('Add Chabok class import in application class successfully.');
                        }
                    })
                } else {
                    console.warn( 'Chabok import into application class already added.');
                }
            } else {
                console.warn( 'data contain ' + FILE_NAME + ' file and ignore to add ' + FILE_NAME + ' name.');
            }
        });
    } else {
        console.warn('Could not find '+FILE_NAME+' file.');
    }
};
