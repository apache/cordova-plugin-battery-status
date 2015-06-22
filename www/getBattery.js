/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cordova = require('cordova'),
    exec = require('cordova/exec'),
    channel = require('cordova/channel');

/**
* This class contains information about the current battery status.
*/
var BatteryManager = function() {
    //The level value:
    // must be set to 0 if the system's battery is depleted and the system is about to be suspended, 
    //and to 1.0 if the battery is full, 
    this._level = 1.0;

    //The charging value : 
    //- false if the battery is discharging or full
    //- set to true if the battery is charging
    this._charging = true;

    //ChargingTime value : 
    //- 0 if the battery is full or if there is no battery attached to the system
    //- positive Infinity if the battery is discharging,
    this._chargingTime = 0;

    //_dischargingTime value : 
    //- positive Infinity, if the battery is charging
    //- positive Infinity if the battery is discharging,
    this._dischargingTime = "positive Infinity";

    // Create new event handlers on the object  (chanel instance);
    this.onchargingchange = cordova.addWindowEventHandler("chargingchange");
};

var batteryManager = new BatteryManager();
//Readonly properties
Object.defineProperty(batteryManager, "charging", {
    get : function () { return batteryManager._charging; }
});
Object.defineProperty(batteryManager, "chargingTime", {
    get : function () { return batteryManager._chargingTime; }
});
Object.defineProperty(batteryManager, "dischargingTime", {
    get : function () { return batteryManager._dischargingTime; }
});
Object.defineProperty(batteryManager, "level", {
    get : function () { return batteryManager._level; }
});

/**
 * Callback for battery status
 *
 * @param {Object} info            keys: level, isPlugged , charging
 */
BatteryManager.prototype._status = function (info) {
    if (info) {
        if (batteryManager._level !== info.level || batteryManager._isPlugged !== info.isPlugged) {

            if (!info.hasOwnProperty('charging')) {
                info.charging = info.isPlugged;
            }

            if (info.level === null && batteryManager._level !== null) {
                return; // special case where callback is called because we stopped listening to the native side.
            }

            if (batteryManager._charging !== info.charging) {
                batteryManager._charging = info.charging;
                cordova.fireWindowEvent("chargingchange", info);
            }

            batteryManager._level = info.level;
            batteryManager._isPlugged = info.isPlugged;
        }
    }
};

/**
 * Error callback for battery start
 */
BatteryManager.prototype._error = function(e) {
    console.log("Error initializing Battery: " + e);
};

/**
* Keep track of how many handlers we have so we can start and stop 
* the native battery listener appropriately (and hopefully save on battery life!).
*/
function handlers() {
    return batteryManager.onchargingchange.numHandlers;
}

/**
* Event handlers for when callbacks get registered for the battery.
* Function that is called when the first listener is subscribed, or when
* the last listener is unsubscribed.
*/
BatteryManager.onHasSubscribersChange = function () {
    // If we just registered the first handler, make sure native listener is started.
    if (this.numHandlers === 1 && handlers() === 1) {
        exec(batteryManager._status, batteryManager._error, "Battery", "start", []);
    } else if (handlers() === 0) {
        exec(null, null, "Battery", "stop", []);
    }
};

function getBattery() {
    return new Promise(
        function (resolve, reject) {
            if (batteryManager) {
                resolve(batteryManager);
            } else {
                reject("Not Support");
            }
        }
    );
}

module.exports = getBattery;

