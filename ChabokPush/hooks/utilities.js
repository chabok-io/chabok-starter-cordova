/**
 * Utilities and shared functionality for the build hooks.
 */
var fs = require('fs');
var path = require("path");

fs.ensureDirSync = function (dir) {
    if (!fs.existsSync(dir)) {
        dir.split(path.sep).reduce(function (currentPath, folder) {
            currentPath += folder + path.sep;
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            return currentPath;
        }, '');
    }
};

module.exports = {
    /**
     * Used to get the name of the application as defined in the config.xml.
     *
     * @param {object} context - The Cordova context.
     * @returns {string} The value of the name element in config.xml.
     */
    getAppName: function (context) {
        var ConfigParser = context.requireCordovaModule("cordova-lib").configparser;
        var config = new ConfigParser("config.xml");
        return config.name();
    },

    /**
     * The ID of the plugin; this should match the ID in plugin.xml.
     */
    getPluginId: function () {
        return "cordova-plugin-firebase";
    },

    copyKey: function (platform, type) {
        if (!platform.src || typeof platform.src !== "object"){
            console.warn('Source is undefined or not Array... ' + typeof platform.src);
            return;
        }
        for (let i = 0; i < platform.src.length; i++) {
            const file = platform.src[i];

            if (this.fileExists(file)) {
                try {
                    const contents = fs.readFileSync(file).toString();

                    try {
                        platform.dest.forEach(function (destinationPath) {
                            if (path.basename(destinationPath) === path.basename(file)) {
                                const folder = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
                                fs.ensureDirSync(folder);
                                fs.writeFileSync(destinationPath, contents);
                                console.log('(✅) ' + destinationPath)
                            }
                        });
                    } catch (e) {
                        // skip
                    }
                } catch (err) {
                    console.log('=======>>>>>>>>> ' + err);
                }
            } else {
                console.log('(🟡) ' + file + '(Exists)')
            }
        }
        console.log('Copy all ' + type + ' files successfully');
    },

    getValue: function (config, name) {
        let value = config.match(new RegExp('<' + name + '(.*?)>(.*?)</' + name + '>', 'i'));
        if (value && value[2]) {
            return value[2]
        } else {
            return null
        }
    },

    fileExists: function (path) {
        try {
            return fs.statSync(path).isFile();
        } catch (e) {
            return false;
        }
    },

    directoryExists: function (path) {
        try {
            return fs.statSync(path).isDirectory();
        } catch (e) {
            return false;
        }
    },

    removeFile: function (path){
        if (this.fileExists(path)) {
            try {
                fs.unlinkSync(path);
                console.log('(🟢) ' + path + '(Removed)');
            } catch (err) {
                console.log('(🔴) ' + path + '(Removed: ' + err + ')');
            }
        } else {
            console.log('(🟡) ' + path + '(Not exists)');
        }
    },

    readChabokEnvFromProcess: function (variables) {
        let variablesStr = variables
        console.log('variablesStr = ' + variablesStr);
        if (typeof variables !== "string") {
            variablesStr = JSON.stringify(variables);
        }

        let envVarName = 'CHABOK_ENVIRONMENT';
        let envIndex = variablesStr.indexOf(envVarName)
        if (envIndex === -1) {
            return undefined
        }

        let startIndex = envIndex + envVarName.length + 1
        let env = variablesStr.substring(startIndex, startIndex + 3)

        return env.toLowerCase() === 'san' ? 'sandbox' : 'production';
    }
};
