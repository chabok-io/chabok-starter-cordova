var exec = require('cordova/exec');

const  bridgeName = 'ChabokPush';
var ChabokPush = function () {}

ChabokPush.prototype.configureEnvironment = function (devMode, success, error) {
    exec(success, error, bridgeName, 'configureEnvironment', [devMode]);
};

ChabokPush.prototype.login = function (userId, success, error) {
    exec(success, error, bridgeName, 'login', [userId]);
};

ChabokPush.prototype.logout = function () {
    exec(function () {
    }, function () {
    }, bridgeName, 'logout', []);
};

ChabokPush.prototype.addTag = function (tagName, success, error) {
    exec(success, error, bridgeName, 'addTag', [tagName]);
};

ChabokPush.prototype.removeTag = function (tagName, success, error) {
    exec(success, error, bridgeName, 'removeTag', [tagName]);
};

ChabokPush.prototype.appWillOpenUrl = function (url) {
    exec(function () {
    }, function () {
    }, bridgeName, 'appWillOpenUrl', [url]);
};

ChabokPush.prototype.getUserAttributes = function (success, error) {
    exec(success, error, bridgeName, 'getUserAttributes', []);
};

ChabokPush.prototype.setUserAttributes = function (userInfo) {
    exec(function () {
    }, function () {
    }, bridgeName, 'setUserAttributes', [userInfo]);
};

ChabokPush.prototype.getUserInfo = function (success, error) {
    exec(success, error, bridgeName, 'getUserAttributes', []);
};

ChabokPush.prototype.setUserInfo = function (userInfo) {
    exec(function () {
    }, function () {
    }, bridgeName, 'setUserAttributes', [userInfo]);
};

ChabokPush.prototype.setDefaultTracker = function (trackerName) {
    exec(function () {
    }, function () {
    }, bridgeName, 'setDefaultTracker', [trackerName]);
};

ChabokPush.prototype.track = function (trackName, data) {
    exec(function () {
    }, function () {
    }, bridgeName, 'track', [trackName, data]);
};

ChabokPush.prototype.resetBadge = function () {
    exec(function () {
    }, function () {
    }, bridgeName, 'resetBadge', []);
};

ChabokPush.prototype.publish = function (message, success, error) {
    exec(success, error, bridgeName, 'publish', [message]);
};

ChabokPush.prototype.getUserId = function (success, error) {
    exec(success, error, bridgeName, 'getUserId', []);
};

ChabokPush.prototype.getInstallationId = function (success, error) {
    exec(success, error, bridgeName, 'getInstallationId', []);
};

ChabokPush.prototype.setOnMessageCallback = function (oneMessage) {
    exec(oneMessage, function () {}, bridgeName, 'setOnMessageCallback', []);
};

ChabokPush.prototype.setOnConnectionStatusCallback = function (onConnection) {
    exec(onConnection, function () {}, bridgeName, 'setOnConnectionStatusCallback', []);
};

ChabokPush.prototype.setOnNotificationOpenedCallback = function (notificationOpen) {
    exec(notificationOpen, function () {}, bridgeName, 'setOnNotificationOpenedCallback', []);
};


//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.ChabokPush)
    window.plugins.ChabokPush = new ChabokPush();

if (typeof module != 'undefined' && module.exports)
    module.exports = ChabokPush;
