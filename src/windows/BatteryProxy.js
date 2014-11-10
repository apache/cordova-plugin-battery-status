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

var timer;
var UPDATE_INTERVAL = 1000 * 60; // 60 seconds

var Battery = {
    start: function (win, fail, args, env) {
        try {
            if (WinJS.Utilities.isPhone === true) {
                function getBatteryStatus(success, error) {
                    var unparsedInfo = BatteryStatus.BatteryStatus.getBatteryStatus();
                    var info = JSON.parse(unparsedInfo);

                    if (info.hasOwnProperty("exceptionMessage")) {
                        error(info.exceptionMessage);
                        return;
                    }

                    success(info, { keepCallback: true });
                }

                getBatteryStatus(win, fail);
                timer = setInterval(getBatteryStatus, UPDATE_INTERVAL, win, fail);
            } else {
                fail("The operation is unsupported by this platform.");
            }
        } catch(e) {
            fail(e);
        }        
    },

    stop: function () {
        timer && clearInterval(timer);
    }
};

require("cordova/exec/proxy").add("Battery", Battery);
