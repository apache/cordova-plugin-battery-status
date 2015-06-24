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

exports.defineAutoTests = function () {
    var isWindowsStore = (cordova.platformId == "windows8") || (cordova.platformId == "windows" && !WinJS.Utilities.isPhone),
        onEvent;

    describe('Battery (navigator.battery)', function () {

        it("battery.spec.1 should exist", function () {
            if (isWindowsStore) {
                pending('Battery status is not supported on windows store');
            }

            expect(navigator.battery).toBeDefined();
        });
    });

    describe('Battery Events', function () {

        describe("batterystatus", function () {

            afterEach(function () {
                if (!isWindowsStore) {
                    try {
                        window.removeEventListener("batterystatus", onEvent, false);
                    }
                    catch (e) {
                        console.err('Error removing batterystatus event listener: ' + e)
                    }
                }
            });

            it("battery.spec.2 should fire batterystatus events", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryStatus");

                // batterystatus -> 30
                window.addEventListener("batterystatus", onEvent, false);

                navigator.battery._status({
                    level: 30,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);

            });
        });

        describe("batterylow", function () {

            afterEach(function () {
                if (!isWindowsStore) {
                    try {
                        window.removeEventListener("batterylow", onEvent, false);
                    }
                    catch (e) {
                        console.err('Error removing batterylow event listener: ' + e)
                    }
                }
            });

            it("battery.spec.3 should fire batterylow event (30 -> 20)", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryLow");

                // batterylow 30 -> 20
                window.addEventListener("batterylow", onEvent, false);

                navigator.battery._status({
                    level : 30,
                    isPlugged : false
                });

                navigator.battery._status({
                    level : 20,
                    isPlugged : false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);

            });

            it("battery.spec.3.1 should fire batterylow event (30 -> 19)", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryLow");

                // batterylow 30 -> 19
                window.addEventListener("batterylow", onEvent, false);

                navigator.battery._status({
                    level : 30,
                    isPlugged : false
                });

                navigator.battery._status({
                    level : 19,
                    isPlugged : false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);
            });

            it("battery.spec.3.2 should not fire batterylow event (5 -> 20)", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryLow");

                // batterylow should not fire when level increases (5->20) ( CB-4519 )
                window.addEventListener("batterylow", onEvent, false);

                navigator.battery._status({
                    level : 5,
                    isPlugged : false
                });

                navigator.battery._status({
                    level: 20,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();
                    done();
                }, 100);
            });

            it("battery.spec.3.3 batterylow event(21 -> 20) should not fire if charging", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryLow");

                // batterylow should NOT fire if we are charging   ( CB-4520 )
                window.addEventListener("batterylow", onEvent, false);

                navigator.battery._status({
                    level : 21,
                    isPlugged : true
                });

                navigator.battery._status({
                    level : 20,
                    isPlugged : true
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();
                    done();
                }, 100);
            });
        });

        describe("batterycritical", function () {

            afterEach(function () {
                if (!isWindowsStore) {
                    try {
                        window.removeEventListener("batterycritical", onEvent, false);
                    }
                    catch (e) {
                        console.err('Error removing batterycritical event listener: ' + e)
                    }
                }
            });

            it("battery.spec.4 should fire batterycritical event (19 -> 5)", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryCritical");

                // batterycritical 19->5
                window.addEventListener("batterycritical", onEvent, false);

                navigator.battery._status({
                    level: 19,
                    isPlugged: false
                });

                navigator.battery._status({
                    level: 5,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);

            });

            it("battery.spec.4.1 should fire batterycritical event (19 -> 4)", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryCritical");

                // batterycritical 19->4
                window.addEventListener("batterycritical", onEvent, false);

                navigator.battery._status({
                    level: 19,
                    isPlugged: false
                });

                navigator.battery._status({
                    level: 4,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);

            });

            it("battery.spec.4.2 should fire batterycritical event (100 -> 4) when decreases", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryCritical");

                // setup: batterycritical should fire when level decreases (100->4) ( CB-4519 )
                window.addEventListener("batterycritical", onEvent, false);

                navigator.battery._status({
                    level: 100,
                    isPlugged: false
                });

                navigator.battery._status({
                    level: 4,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);
            });

            it("battery.spec.4.3 should not fire batterycritical event (4 -> 5) when increasing", function (done) {
                if (isWindowsStore) {
                    pending('Battery status is not supported on windows store');
                }

                onEvent = jasmine.createSpy("BatteryCritical");

                window.addEventListener("batterycritical", onEvent, false);

                // batterycritical should not fire when level increases (4->5)( CB-4519 )
                navigator.battery._status({
                    level: 4,
                    isPlugged: false
                });

                navigator.battery._status({
                    level: 5,
                    isPlugged: false
                });

                setTimeout(function () {
                    expect(onEvent.calls.count()).toBeLessThan(2);
                    done();
                }, 100);
            });

            it("battery.spec.4.4 should not fire batterycritical event (6 -> 5) if charging", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("BatteryCritical");

                window.addEventListener("batterycritical", onEvent, false);

                // batterycritical should NOT fire if we are charging   ( CB-4520 )
                navigator.battery._status({
                    level: 6,
                    isPlugged: true
                });

                navigator.battery._status({
                    level: 5,
                    isPlugged: true
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();
                    done();
                }, 100);
            });
        });
    });

    describe("Battery (navigator.getBattery)", function () {
        it("battery.spec.5 should exist", function () {
            if (isWindowsStore) {
                pending("Battery status is not supported on windows store");
            }

            expect(navigator.getBattery() ).toBeDefined();
        });

        it("battery.spec.5.1 should be promise", function () {
            if (isWindowsStore) {
                pending("Battery status is not supported on windows store");
            }

            navigator.getBattery().then(function(battery) {
                expect(battery).toBeDefined();
            }, function(reason) {
              done(new Error("Promise should  be resolved")); // Success
            });
        });
    });

   describe("GetBattery Events", function () {

        describe("chargingchange", function () {

            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("chargingchange", onEvent);
                            done();
                        }, function(reason) {
                            done(new Error("Promise should be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing batterystatus event listener: " + e);
                    }
                }
            });

            it("battery.spec.6 should fire chargingchange events", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }
                onEvent = jasmine.createSpy("Chargingchange");

                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("chargingchange", onEvent);
                    battery._status({
                        level : 0.8,
                        charging : false
                    });
                    setTimeout(function () {
                        battery._status({
                            level : 0.81,
                            charging : true
                        });
                    }, 0);
                  
                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);
                 
            });


            it("battery.spec.6.1 level should be between 0 and 1", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }
                onEvent = jasmine.createSpy("Chargingchange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    batteryManager = battery;
                    battery.addEventListener("chargingchange", onEvent);
                    battery._status({
                        level : 0.9,
                        charging : true
                    });
                }, function(reason) {
                  done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(batteryManager.level >= 0).toBeTruthy();
                    expect(batteryManager.level <= 1).toBeTruthy();
                    done();
                }, 100);
              
            });
        });

        describe("chargingtimechange without device information", function () {

            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("chargingtimechange", onEvent);
                            done();
                        }, function(reason) {
                          done(new Error("Promise should be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing chargingtimechange event listener: " + e);
                    }
                }
            });

            it("battery.spec.7 should equal 0 if no information", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }
                onEvent = jasmine.createSpy("Chargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("chargingtimechange", onEvent);
                    batteryManager = battery;
                    battery._status({
                        level : 0.9,
                        charging : true
                    });
                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();
                    //Is a number and not a string
                    expect(batteryManager.chargingTime).toEqual(0);    
                    done();
                }, 100);
      
            });
        });
        
        describe("chargingtimechange with device information", function () {

            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("chargingtimechange", onEvent);
                            done();
                        }, function(reason) {
                          done(new Error("Promise should be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing chargingtimechange event listener: " + e);
                    }
                }
            });

            it("battery.spec.8 should fire chargingtimechange event when charging ", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Chargingtimechange");
                navigator.getBattery().then(function(battery) {

                    battery.addEventListener("chargingtimechange", onEvent);
                    battery._status({
                        level : 0.9,
                        charging : true,
                        chargingTime : 30
                    });
                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    done();
                }, 100);

            });

            it("battery.spec.8.1 should fire chargingtimechange when dicharging and be equal positive Infinity", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Chargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    batteryManager = battery;
                    battery.addEventListener("chargingtimechange", onEvent);
                    battery._status({
                        level : 0.9,
                        charging : false,
                        chargingTime :"positive Infinity"
                    });
  
                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled(); 
                    expect(batteryManager.chargingTime).toEqual("positive Infinity");        
                    done();
                }, 100);
            });

            it("battery.spec.8.2 should fire chargingtimechange when battery is full and equal 0", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Chargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    batteryManager = battery;
                    battery.addEventListener("chargingtimechange", onEvent);
                    battery._status({
                        level : 0.9,
                        charging : true
                    });
                    setTimeout(function () {
                        battery._status({
                            level : 0.81,
                            charging : true,
                            chargingTime : 0
                        });
                    }, 0);
                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();
                    expect(batteryManager.chargingTime).toEqual(0);        
                    done();
                }, 100);
            });
        });

        describe("dischargingtimechange without device information", function () {

            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("dischargingtimechange", onEvent);
                            done();
                        }, function(reason) {
                          done(new Error("Promise should  be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing dischargingtimechange event listener: " + e);
                    }
                }
            });

            it("battery.spec.9 should equal positive Infinity ", function (done) {
               if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Dischargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("dischargingtimechange", onEvent);
                    batteryManager = battery;
                    battery._status({
                        level : 0.9,
                        charging : false,
                        dischargingTime : "positive Infinity"
                    });
                }, function(reason) {
                    done(new Error("Promise should  be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();  
                    //Is a number and not a string
                    expect(batteryManager.dischargingTime).toEqual("positive Infinity");   
                    done();
                }, 100);

            });
        });

        describe("dischargingtimechange with device information", function () {
            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("dischargingtimechange", onEvent);
                            done();
                        }, function(reason) {
                          done(new Error("Promise should  be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing dischargingtimechange event listener: " + e);
                    }
                }
            });

            it("battery.spec.10 should fire ondischargingtimechange event when discharging and equal number ", function (done) {
               if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Dischargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("dischargingtimechange", onEvent);
                    batteryManager = battery;
                    battery._status({
                        level : 0.9,
                        charging : false,
                        dischargingTime : 456
                    });
                }, function(reason) {
                    done(new Error("Promise should  be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled();  
                    //Is a number and not a string
                    expect(batteryManager.dischargingTime).toMatch(/\d{1,}/);   
                    done();
                }, 100);

            });
            

             it("battery.spec.10.1 should fire ondischargingtimechange when charging and be equal positive Infinity", function (done) {
                if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("Dischargingtimechange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    batteryManager = battery;
                    battery.addEventListener("dischargingtimechange", onEvent);
                    battery._status({
                        level : 0.89,
                        charging : true,
                        dischargingTime : "positive Infinity"
                    });
                }, function(reason) {
                    done(new Error("Promise should  be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).toHaveBeenCalled(); 
                    expect(batteryManager.dischargingTime).toEqual("positive Infinity");        
                    done();
                }, 100);
            });
        });
        describe("levelchange", function () {
            afterEach(function (done) {
                if (!isWindowsStore) {
                    try {
                        navigator.getBattery().then(function(battery) {
                            battery.removeEventListener("levelChange", onEvent);
                            done();
                        }, function(reason) {
                          done(new Error("Promise should be resolved")); 
                        });
                    }
                    catch (e) {
                        console.err("Error removing dischargingtimechange event listener: " + e);
                    }
                }
            });

            it("battery.spec.11 should fire levelChange event when charging", function (done) {
               if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("LevelChange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("levelChange", onEvent);
                    batteryManager = battery;
                    battery._status({
                        level : 0.9,
                        charging : true,
                        dischargingTime : "positive Infinity"
                    });

                    setTimeout(function () {
                        battery._status({
                            level : 0.92,
                            charging : true,
                            dischargingTime : "positive Infinity"
                        });  
                        done();
                    }, 0);      

                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();  
                    done();
                }, 100);

            });

            it("battery.spec.11.1 should fire levelChange event when discharging", function (done) {
               if (isWindowsStore) {
                    pending("Battery status is not supported on windows store");
                }

                onEvent = jasmine.createSpy("LevelChange");
                var batteryManager = null;
                navigator.getBattery().then(function(battery) {
                    battery.addEventListener("levelChange", onEvent);
                    batteryManager = battery;
                    battery._status({
                        level : 0.9,
                        charging : false,
                        dischargingTime : "positive Infinity"
                    });

                    setTimeout(function () {
                        battery._status({
                            level : 0.85,
                            charging : false,
                            dischargingTime : "positive Infinity"
                        });  
                        done();
                    }, 0);      

                }, function(reason) {
                    done(new Error("Promise should be resolved")); 
                });

                setTimeout(function () {
                    expect(onEvent).not.toHaveBeenCalled();  
                    done();
                }, 100);

            });
        });

    });
};


//******************************************************************************************
//***************************************Manual Tests***************************************
//******************************************************************************************

exports.defineManualTests = function (contentEl, createActionButton) {

    /* Battery */
    function updateInfo(info) {
        document.getElementById('levelValue').innerText = info.level;
        document.getElementById('pluggedValue').innerText = info.isPlugged;
        if (info.level > 5) {
            document.getElementById('criticalValue').innerText = "false";
        }
        if (info.level > 20) {
            document.getElementById('lowValue').innerText = "false";
        }
    }

    function batteryLow(info) {
        document.getElementById('lowValue').innerText = "true";
    }

    function batteryCritical(info) {
        document.getElementById('criticalValue').innerText = "true";
    }

    function addBattery() {
        window.addEventListener("batterystatus", updateInfo, false);
    }

    function removeBattery() {
        window.removeEventListener("batterystatus", updateInfo, false);
    }

    function addLow() {
        window.addEventListener("batterylow", batteryLow, false);
    }

    function removeLow() {
        window.removeEventListener("batterylow", batteryLow, false);
    }

    function addCritical() {
        window.addEventListener("batterycritical", batteryCritical, false);
    }

    function removeCritical() {
        window.removeEventListener("batterycritical", batteryCritical, false);
    }


    /* getBattery */
    function charingchange() {
        navigator.getBattery().then(function(battery) {
            document.getElementById('chargingValue').innerText = (battery.charging ? "Yes" : "No");
        }).catch(function(error) {
            console.log("Failed to get Battery information!", error);
        });
    }

    function chargingtimechange() {
        navigator.getBattery().then(function(battery) {
            document.getElementById('chargingTimeValue').innerText = battery.chargingTime;
        }).catch(function(error) {
            console.log("Failed to get Battery information!", error);
        });    
    } 

    function dischargingtimechange() {
        navigator.getBattery().then(function(battery) {
            document.getElementById('dischargingTimeValue').innerText = battery.dischargingTime;
        }).catch(function(error) {
            console.log("Failed to get Battery information!", error);
        });    
    }

    function levelchange() {
        navigator.getBattery().then(function(battery) {
            document.getElementById('levelValue').innerText = battery.level;
        }).catch(function(error) {
            console.log("Failed to get Battery information!", error);
        });  
    }


    function addChargingchange() {
        navigator.getBattery().then(function(battery) {
            battery.addEventListener("chargingchange", charingchange);
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function removeChargingchange() {
        navigator.getBattery().then(function(battery) {
            battery.removeEventListener("chargingchange", charingchange);
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function addChargingtimechange() {
        navigator.getBattery().then(function(battery) {
            battery.addEventListener("chargingtimechange", chargingtimechange);
            document.getElementById('chargingTimeValue').innerText = battery.chargingTime;
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function removeChargingtimechange() {
        navigator.getBattery().then(function(battery) {
            battery.removeEventListener("chargingtimechange", chargingtimechange);
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function addDischargingtimechange() {
        navigator.getBattery().then(function(battery) {
            battery.addEventListener("dischargingtimechange", dischargingtimechange);
            document.getElementById("dischargingTimeValue").innerText = battery.dischargingTime;
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function removeDischargingtimechange() {
        navigator.getBattery().then(function(battery) {
            battery.removeEventListener("dischargingtimechange", dischargingtimechange);
        }, function(reason) {
          return new Error("Promise should be resolved"); 
        });
    }

    function addLevelchange() {
        navigator.getBattery().then(function(battery) {
            battery.addEventListener("levelchange", levelchange);
        }, function(reason) {
            return new Error("Promise should be resolved"); 
        });
    }

    function removeLevelchange() {
        navigator.getBattery().then(function(battery) {
            battery.removeEventListener("levelchange", levelchange);
        }, function(reason) {
         return new Error("Promise should be resolved"); 
        });
    }

    //Generate Dynamic Table
    function generateTable(tableId, rows, cells, elements) {
        var table = document.createElement('table');
        for (var r = 0; r < rows; r++) {
            var row = table.insertRow(r);
            for (var c = 0; c < cells; c++) {
                var cell = row.insertCell(c);
                cell.setAttribute("align", "center");
                for (var e in elements) {
                    if (elements[e].position.row == r && elements[e].position.cell == c) {
                        var htmlElement = document.createElement(elements[e].tag);
                        var content;

                        if (elements[e].content !== "") {
                            content = document.createTextNode(elements[e].content);
                            htmlElement.appendChild(content);
                        }
                        if (elements[e].type) {
                            htmlElement.type = elements[e].type;
                        }
                        htmlElement.setAttribute("id", elements[e].id);
                        cell.appendChild(htmlElement);
                    }
                }
            }
        }
        table.setAttribute("align", "center");
        table.setAttribute("id", tableId);
        return table;
    }
    // Battery Elements
    var batteryElements =
        [{
            id : "statusTag",
            content : "Status:",
            tag : "div",
            position : {
                row : 0,
                cell : 0
            }
        }, {
            id : "statusValue",
            content : "",
            tag : "div",
            position : {
                row : 0,
                cell : 1
            }
        }, {
            id : "levelTag",
            content : "Level:",
            tag : "div",
            position : {
                row : 1,
                cell : 0
            }
        }, {
            id : "levelValue",
            content : "",
            tag : "div",
            position : {
                row : 1,
                cell : 1
            }
        }, {
            id : "pluggedTag",
            content : "Plugged:",
            tag : "div",
            position : {
                row : 2,
                cell : 0
            }
        }, {
            id : "pluggedValue",
            content : "",
            tag : "div",
            position : {
                row : 2,
                cell : 1
            }
        }, {
            id : "lowTag",
            content : "Low:",
            tag : "div",
            position : {
                row : 3,
                cell : 0
            }
        }, {
            id : "lowValue",
            content : "",
            tag : "div",
            position : {
                row : 3,
                cell : 1
            }
        }, {
            id : "criticalTag",
            content : "Critical:",
            tag : "div",
            position : {
                row : 4,
                cell : 0
            }
        }, {
            id : "criticalValue",
            content : "",
            tag : "div",
            position : {
                row : 4,
                cell : 1
            }
        }, {
            id : "chargingTag",
            content : "Charging:",
            tag : "div",
            position : {
                row : 5,
                cell : 0
            }
        }, {
            id : "chargingValue",
            content : "",
            tag : "div",
            position : {
                row : 5,
                cell : 1
            }
        }, {
            id : "chargingTimeTag",
            content : "ChargingTime:",
            tag : "div",
            position : {
                row : 6,
                cell : 0
            }
        }, {
            id : "chargingTimeValue",
            content : "",
            tag : "div",
            position : {
                row : 6,
                cell : 1
            }
        }, {
            id : "dischargingTimeTag",
            content : "DischargingTime:",
            tag : "div",
            position : {
                row : 7,
                cell : 0
            }
        }, {
            id : "dischargingTimeValue",
            content : "",
            tag : "div",
            position : {
                row : 7,
                cell : 1
            }
        }
    ];

    //Title audio results
    var div = document.createElement('h2');
    div.appendChild(document.createTextNode('Battery Status'));
    div.setAttribute("align", "center");
    contentEl.appendChild(div);

    var batteryTable = generateTable('info', 8, 3, batteryElements);
    contentEl.appendChild(batteryTable);

    div = document.createElement('h2');
    div.appendChild(document.createTextNode('Actions'));
    div.setAttribute("align", "center");
    contentEl.appendChild(div);

    contentEl.innerHTML += '<h3>Battery Status Tests</h3>' +
        'Will update values for level and plugged when they change. If battery low and critical values are false, they will get updated in status box, but only once' +
        '<div id="addBS"></div><div id="remBs"></div>' +
        '<h3>Battery Low Tests</h3>' +
        '</p> Will update value for battery low to true when battery is below 20%' +
        '<div id="addBl"></div><div id="remBl"></div>' +
        '<h3>Battery Critical Tests</h3>' +
        '</p> Will update value for battery critical to true when battery is below 5%' +
        '<div id="addBc"></div><div id="remBc"></div>' ;

    //getBattery
    contentEl.innerHTML += '<h3>Battery charging Tests</h3>' +
        '</p>  Will update value for batteryManger charging if battery is charging or discharging' +
        '<div id="addCc"></div><div id="remCc"></div>' +
        '<h3>Battery chargingTime Tests</h3>' +
        '</p> Will update value for batteryManger chargingTime when it change' +
        '<div id="addCtc"></div><div id="remCtc"></div>' +
        '<h3>Battery dischargingtimechange Tests</h3>' +
        '</p> Will update value for batteryManger dischargingTime when it change' +
        '<div id="addDtc"></div><div id="remDtc"></div>' +
        '<h3>Battery levelchange Tests</h3>' +
        '</p> Will update value for batteryManger level when it change' +
        '<div id="addLc"></div><div id="remLc"></div>';

    createActionButton('Add "batterystatus" listener', function () {
        addBattery();
    }, 'addBS');
    createActionButton('Remove "batterystatus" listener', function () {
        removeBattery();
    }, 'remBs');
    createActionButton('Add "batterylow" listener', function () {
        addLow();
    }, 'addBl');
    createActionButton('Remove "batterylow" listener', function () {
        removeLow();
    }, 'remBl');
    createActionButton('Add "batterycritical" listener', function () {
        addCritical();
    }, 'addBc');
    createActionButton('Remove "batterycritical" listener', function () {
        removeCritical();
    }, 'remBc');

    /* getBattery */
    createActionButton('Add "chargingchange" listener', function () {
        addChargingchange();
    }, 'addCc');
    createActionButton('Remove "chargingchange" listener', function () {
        removeLow();
    }, 'remCc');
    createActionButton('Add "chargingtimechange" listener', function () {
        addChargingtimechange();
    }, 'addCtc');
    createActionButton('Remove "chargingtimechange" listener', function () {
        removeChargingtimechange();
    }, 'remCtc');

    createActionButton('Add "dischargingtimechange" listener', function () {
        addDischargingtimechange();
    }, 'addDtc');
    createActionButton('Remove "dischargingtimechange" listener', function () {
        removeDischargingtimechange();
    }, 'remDtc');
    createActionButton('Add "levelchange" listener', function () {
        addLevelchange();
    }, 'addLc');
    createActionButton('Remove "levelchange" listener', function () {
        removeLevelchange();
    }, 'remLc');
};