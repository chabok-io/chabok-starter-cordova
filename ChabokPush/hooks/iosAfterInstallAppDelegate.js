#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const utilities = require("./utilities");

const FILE_NAME = 'AppDelegate.m';
const config = fs.readFileSync('config.xml').toString();
const name = utilities.getValue(config, 'name');
const ChabokImport = '#import <AdpPushClient/AdpPushClient.h>';

function addChabokLib(context){
    console.log('-----> Start to insert Chabok application class into the ' + FILE_NAME + 'file.');

    let chkEnv = utilities.readChabokEnvFromProcess(context.cmdLine);
    let ChabokConfigEnv = '[PushClientManager.defaultManager configureEnvironment:' +
        chkEnv.charAt(0).toUpperCase() + chkEnv.substring(1) + '];';


    let platformRoot = path.join(context.opts.projectRoot, 'platforms/ios/'+name+'/Classes');
    console.log('platformRoot = ' + platformRoot);

    let applicationClass = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(applicationClass)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(applicationClass, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            if (!data.includes(ChabokImport)) {
                let result = data.replace('#import "AppDelegate.h"', '#import "AppDelegate.h" \n' + ChabokImport);

                result = result.replace('self.viewController = [[MainViewController alloc] init];',
                    '    ' + ChabokConfigEnv + '\n\n    self.viewController = [[MainViewController alloc] init];');

                console.log('Add Chabok configureEnvironment method into the iOS AppDelegate class. \n\n' + result);

                fs.writeFile(applicationClass, result, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Add Chabok class in AppDelegate file successfully.');
                    }
                })
            } else {
                console.warn('Chabok import into application class already added.');
            }
        });
    } else {
        console.warn('Could not find '+FILE_NAME+' file.');
    }
}

function removeChabokLib(context){
    console.log('-----> Start to remove Chabok application class into the ' + FILE_NAME + ' file.');

    let platformRoot = path.join(context.opts.projectRoot, 'platforms/ios/'+name+'/Classes');
    console.log('platformRoot = ' + platformRoot);

    let applicationClass = path.join(platformRoot, FILE_NAME);

    if (fs.existsSync(applicationClass)) {
        console.log('The ' + FILE_NAME + ' file is exist and start to read the file.');

        fs.readFile(applicationClass, 'utf8', function (err, data) {
            if (err) {
                throw new Error('Unable to find ' + FILE_NAME + ': ' + err);
            }

            let chkEnv = ''
            if (data.indexOf('configureEnvironment:Sandbox')){
                chkEnv = 'Sandbox'
            } else {
                chkEnv = 'Production'
            }

            let ChabokConfigEnv = '[PushClientManager.defaultManager configureEnvironment:' +
                chkEnv + '];';

            if (data.includes(ChabokImport)) {
                let result = data.replace('#import "AppDelegate.h" \n' + ChabokImport, '#import "AppDelegate.h"');

                result = result.replace('    ' + ChabokConfigEnv + '\n\n    self.viewController = [[MainViewController alloc] init];', 'self.viewController = [[MainViewController alloc] init];');

                console.log('Remove Chabok configureEnvironment method from the iOS AppDelegate class. \n\n' + result);

                fs.writeFile(applicationClass, result, 'utf8', function (err) {
                    if (err) {
                        throw new Error('Unable to write ' + FILE_NAME + ': ' + err);
                    } else {
                        console.info('Remove Chabok class in AppDelegate file successfully.');
                    }
                })
            } else {
                console.warn('Chabok import into application class already removed.');
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
