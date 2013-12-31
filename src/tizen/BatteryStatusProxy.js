var cordova = require('cordova');

var batteryListenerId = null;

module.exports = {
    start: function(successCallback, errorCallback) {
        var batterySuccessCallback = function(power) {
            if (successCallback) {
                successCallback({level: Math.round(power.level * 100), isPlugged: power.isCharging});
            }
        };

        if (batteryListenerId === null) {
            batteryListenerId = tizen.systeminfo.addPropertyValueChangeListener("BATTERY", batterySuccessCallback);
        }

        tizen.systeminfo.getPropertyValue("BATTERY", batterySuccessCallback, errorCallback);
    },

    stop: function(successCallback, errorCallback) {
        tizen.systeminfo.removePropertyValueChangeListener(batteryListenerId);
        batteryListenerId = null;
    }
};

require("cordova/tizen/commandProxy").add("Battery", module.exports);
