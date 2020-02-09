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
    var _attrs = {};
    if (userInfo) {
        Object.keys(userInfo).forEach(function(key) {
            if (isValidDate(userInfo[key])) {
                _attrs['@CHKDATE_' + key] = userInfo[key].getTime().toString();
            } else {
                _attrs[key] = userInfo[key];
            }
        });
    }

    exec(function () {
    }, function () {
    }, bridgeName, 'setUserAttributes', [_attrs]);
};

ChabokPush.prototype.incrementUserAttribute = function (attributeKey, attributeValue = 1) {
    if (typeof attributeValue != 'number') {
        throw new Error('Invalid increment value.');
    }
    
    exec(function () {
    }, function () {
    }, bridgeName, 'incrementUserAttribute', [attributeKey, attributeValue]);
};

ChabokPush.prototype.decrementUserAttribute = function (attributeKey, attributeValue = 1) {
    if (typeof attributeValue != 'number') {
        throw new Error('Invalid decrement value.');
    }

    exec(function () {
    }, function () {
    }, bridgeName, 'decrementUserAttribute', [attributeKey, attributeValue]);
};

ChabokPush.prototype.unsetUserAttribute = function (attributeKey) {
    exec(function () {
    }, function () {
    }, bridgeName, 'unsetUserAttribute', [attributeKey]);
};

ChabokPush.prototype.getUserInfo = function (success, error) {
    exec(success, error, bridgeName, 'getUserAttributes', []);
};

ChabokPush.prototype.setUserInfo = function (userInfo) {
    var _attrs = {};
    if (userInfo) {
        Object.keys(userInfo).forEach(function(key) {
            if (isValidDate(userInfo[key])) {
                _attrs['@CHKDATE_' + key] = userInfo[key].getTime().toString();
            } else {
                _attrs[key] = userInfo[key];
            }
        });
    }

    exec(function () {
    }, function () {
    }, bridgeName, 'setUserAttributes', [_attrs]);
};

ChabokPush.prototype.setDefaultTracker = function (trackerName) {
    exec(function () {
    }, function () {
    }, bridgeName, 'setDefaultTracker', [trackerName]);
};

ChabokPush.prototype.track = function (trackName, data) {
    var _data = {};
    if (data) {
        Object.keys(data).forEach(function(key) {
            if (isValidDate(data[key])) {
                _data['@CHKDATE_' + key] = data[key].getTime().toString();
            } else {
                _data[key] = data[key];
            }
        });
    }

    exec(function () {
    }, function () {
    }, bridgeName, 'track', [trackName, _data]);
};

trackPurchase = (eventName, chabokEvent) => {
    var _event = {};
    if (chabokEvent) {
        Object.keys(chabokEvent).forEach(function(key) {
            if (key == 'data') {
                var _data = {};
                Object.keys(chabokEvent[key]).forEach(function(key2) {
                    if (isValidDate(chabokEvent[key][key2])) {
                        _data['@CHKDATE_' + key2] = chabokEvent[key][key2].getTime().toString();
                    } else {
                        _data[key2] = chabokEvent[key][key2];
                    }
                });
                _event[key] = _data;
            } else {
                _event[key] = chabokEvent[key];
            }
        });
    }

    exec(function () {
    }, function () {
    }, bridgeName, 'trackPurchase', [eventName, _event]);
}

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

<<<<<<< Updated upstream
=======
ChabokPush.prototype.setOnNotificationOpenedCallback = function (notificationOpen) {
    exec(notificationOpen, function () {}, bridgeName, 'setOnNotificationOpenedCallback', []);
};

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
};
>>>>>>> Stashed changes

//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.ChabokPush = new ChabokPush();

if (typeof module != 'undefined' && module.exports)
    module.exports = ChabokPush;
