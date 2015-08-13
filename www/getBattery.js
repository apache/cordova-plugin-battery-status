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

var exec = require('cordova/exec'),
    channel = require('cordova/channel'),
    targetEventHandlers = {};

function addEventHandler(type) {
    var e = type.toLowerCase();
    return (targetEventHandlers[e] = channel.create(type));
}

/**
* This class contains information about the current battery status.
*/
var BatteryManager = function () {
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
    this._dischargingTime = 'positive Infinity';

    // Create new event handlers on the object (chanel instance);
    this.onchargingchange = addEventHandler('chargingchange');
    this.onchargingtimechange = addEventHandler('chargingtimechange');
    this.ondischargingtimechange = addEventHandler('dischargingtimechange');
    this.onlevelchange = addEventHandler('levelchange');

    //set the onHasSubscribersChange to call native bridge when events are subsribed
    this.onchargingchange.onHasSubscribersChange = BatteryManager.onHasSubscribersChange;
    this.onchargingtimechange.onHasSubscribersChange = BatteryManager.onHasSubscribersChange;
    this.ondischargingtimechange.onHasSubscribersChange = BatteryManager.onHasSubscribersChange;
    this.onlevelchange.onHasSubscribersChange = BatteryManager.onHasSubscribersChange;
};


/**
* Keep track of how many handlers we have so we can start and stop
* the native battery listener appropriately (and hopefully save on battery life!).
*/
function handlers() {
    return batteryManager.onchargingchange.numHandlers +
           batteryManager.onchargingtimechange.numHandlers +
           batteryManager.ondischargingtimechange.numHandlers +
           batteryManager.onlevelchange.numHandlers;
}

/**
* Event handlers for when callbacks get registered for the battery.
* Function that is called when the first listener is subscribed, or when
* the last listener is unsubscribed.
*/
BatteryManager.onHasSubscribersChange = function () {
    // If we just registered the first handler, make sure native listener is started.
    if (this.numHandlers === 1 && handlers() === 1) {
        exec(batteryManager._status, batteryManager._error, 'Battery', 'start', []);
    } else if (handlers() === 0) {
        exec(null, null, 'Battery', 'stop', []);
    }
};

var batteryManager = new BatteryManager();
//Readonly properties
Object.defineProperty(batteryManager, 'charging', {
    get : function () { return batteryManager._charging; }
});
Object.defineProperty(batteryManager, 'chargingTime', {
    get : function () { return batteryManager._chargingTime; }
});
Object.defineProperty(batteryManager, 'dischargingTime', {
    get : function () { return batteryManager._dischargingTime; }
});
Object.defineProperty(batteryManager, 'level', {
    get : function () { return batteryManager._level; }
});


/**
 * Callback for battery status
 *
 * @param {Object} info            keys: level, isPlugged , charging, chargingtimechange
 */
BatteryManager.prototype._status = function (info) {
    if (info) {

        if (info.level === null && batteryManager._level !== null) {
            return; // special case where callback is called because we stopped listening to the native side.
        }

        //level must be between 0 and 1.0
        if (info.level > 1) {
            info.level = (info.level / 100);
        }

        if (!info.hasOwnProperty('charging')) {
            info.charging = info.isPlugged;
        }

        if (batteryManager._charging !== info.charging) {
            batteryManager._charging = info.charging;
            batteryManager.dispatchEvent('chargingchange');
        }

        //not all device provide chargingTime or discharging time
        if (info.hasOwnProperty('chargingTime') && (batteryManager._chargingTime !== info.chargingTime)) {
            batteryManager._chargingTime = info.chargingTime;
            batteryManager.dispatchEvent('chargingtimechange');
        }

        if (info.hasOwnProperty('dischargingTime') && (batteryManager._dischargingTime !== info.dischargingTime)) {
            batteryManager._dischargingTime = info.dischargingTime;
            batteryManager.dispatchEvent('dischargingtimechange');
        }

        if (batteryManager._level !== info.level) {
            batteryManager._level = info.level;
            batteryManager.dispatchEvent('levelchange');
        }
    }
};


/**
 * Error callback for battery start
 */
BatteryManager.prototype._error = function (e) {
    console.log('Error initializing Battery: ' + e);
};

// EventTarget Interface
/**
 * Adds an event listener to the target.
 * @param {string} type The name of the event.
 * @param {handler} The handler for the event. This is
 *     called when the event is dispatched.
 */
BatteryManager.prototype.addEventListener = function (type, handler) {
    var e = type.toLowerCase();
    //if the type is a channel(EventHandler)
    if ((targetEventHandlers[e] !== 'undefined')) {
        targetEventHandlers[e].subscribe(handler);
    } else {
        console.log('Error with channel');
    }
};

/**
 * Removes an event listener from the target.
 * @param {string} type The name of the event.
 * @param {EventListenerType} handler The handler for the event.
 */
BatteryManager.prototype.removeEventListener = function (type, handler) {
    var e = type.toLowerCase();
    if (typeof targetEventHandlers[e] !== 'undefined') {
        targetEventHandlers[e].unsubscribe(handler);
    } else {
        console.log('Error with channel in removeListener');
    }
};

function createEvent(type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

/**
 * Dispatches an event and calls all the listeners that are listening to
 * the type of the event.
 * @param {!Event} event The event to dispatch.
 */
BatteryManager.prototype.dispatchEvent = function (type) {
    var e = type.toLowerCase(),
        evt = createEvent(e,null);
    if (typeof targetEventHandlers[e] !== 'undefined') {
        setTimeout(function () {
            targetEventHandlers[e].fire(evt);
        }, 0);
    } else {
        console.log('Error with channel in dispatchEvent');
    }
};

function getBattery() {
    var existingBatteryManager = cordova.require('cordova/modulemapper').getOriginalSymbol(window, 'navigator.getBattery');
    //Promise detection
    if (typeof Promise !== 'undefined') {
        //if implementation use promise (warning with firefoxos)
        if (typeof existingBatteryManager === 'function' && existingBatteryManager().then === 'function') {
            return existingBatteryManager();
        }
        return new Promise(
            function (resolve, reject) {
                    resolve(batteryManager);
            }
        );
    } else {
        console.log('Promise not supported');
    }
}

module.exports = getBattery;