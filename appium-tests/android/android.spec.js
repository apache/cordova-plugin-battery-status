/*jshint node: true, jasmine: true */

'use strict';

var STARTING_MESSAGE = 'Ready for action!';
var MINUTE = 60 * 1000;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW';
var BATTERY_HIGH = '73';
var BATTERY_LOW = '13';
var BATTERY_CRITICAL = '3';

var wdHelper = require('../helpers/wdHelper');
var screenshotHelper = require('../helpers/screenshotHelper');
var wd = wdHelper.getWD();
var shell = global.SHELL || require('shelljs');

describe('Battery status tests Android.', function () {
    var driver;
    // this indicates that there was a critical error and we should try to recover:
    var errorFlag = false;
    // this indicates that we couldn't restore Appium session and should fail fast:
    var stopFlag = false;
    // the name of webview context, it will be changed to match needed context if there are named ones:
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;

    function win() {
        expect(true).toBe(true);
    }

    function fail(error) {
        screenshotHelper.saveScreenshot(driver);
        if (error && error.message) {
            console.log('An error occured: ' + error.message);
            expect(true).toFailWithMessage(error.message);
            throw error.message;
        }
        if (error) {
            console.log('Failed expectation: ' + error);
            expect(true).toFailWithMessage(error);
            throw error;
        }
        // no message provided :(
        expect(true).toBe(false);
        throw 'An error without description occured';
    }

    function mockBatteryLevel(level) {
        console.log('Setting battery level to ' + level);
        shell.exec('adb shell dumpsys battery set level ' + level);
    }

    function mockCharger(on) {
        console.log('Setting charger ' + (on ? 'on' : 'off'));
        var status = on ? '1' : '0';
        shell.exec('adb shell dumpsys battery set ac ' + status);
        shell.exec('adb shell dumpsys battery set usb ' + status);
    }

    function resetMocks() {
        console.log('Resetting battery mocks');
        // reset doesn't work on certain emulators so we first set it to
        // charging, 100%, to avoid screen turning off
        shell.exec('adb shell dumpsys battery set ac 1');
        shell.exec('adb shell dumpsys battery set usb 1');
        shell.exec('adb shell dumpsys battery set level 100');
        shell.exec('adb shell dumpsys battery reset');
    }

    function removeListeners() {
        return removeListener('batterystatus')
            .then(function () {
                return removeListener('batterylow');
            })
            .then(function () {
                return removeListener('batterycritical');
            })
            .then(win, fail);
    }

    function maybeConfirm() {
        return driver
            .context('NATIVE_APP')
            .elementByXPath('//android.widget.Button[@text="OK"]')
            .click()
            .fail(function noop() { return driver; }) //don't fail if there's no prompt
            .context(webviewContext);
    }

    function getDriver() {
        driver = wdHelper.getDriver('Android');
        return driver;
    }

    function checkStopFlag() {
        if (stopFlag) {
            fail('Something went wrong: the stopFlag is on. Please see the log for more details.');
        }
        return stopFlag;
    }

    function addListener(listener) {
        return driver
            .execute('window.updateInfo = function (info) { document.getElementById("info").innerHTML = JSON.stringify(info); };')
            .execute('window.addEventListener("' + listener + '", window.updateInfo, false);');
    }

    function removeListener(listener) {
        return driver
            .execute('window.removeEventListener("' + listener + '", window.updateInfo, false)');
    }

    beforeEach(function () {
        jasmine.addMatchers({
            toFailWithMessage : function () {
                return {
                    compare: function (actual, msg) {
                        console.log('Failing with message: ' + msg);
                        var result = {
                            pass: false,
                            message: msg
                        };
                        // status 6 means that we've lost the session
                        // status 7 means that Appium couldn't find an element
                        // both these statuses mean that the test has failed but
                        // we should try to recreate the session for the following tests
                        if (msg.indexOf('Error response status: 6') >= 0 ||
                            msg.indexOf('Error response status: 7') >= 0) {
                            errorFlag = true;
                        }
                        return result;
                    }
                };
            }
        });
    });

    it('batterystatus.ui.util configuring driver and starting a session', function (done) {
        stopFlag = true; // just in case of timeout
        getDriver().then(function () {
            stopFlag = false;
        }, function (error) {
            fail(error);
        })
        .finally(done);
    }, 5 * MINUTE);

    it('batterystatus.ui.util determine webview context name', function (done) {
        if (checkStopFlag()) {
            done();
            return;
        }

        var i = 0;
        driver
            .contexts(function (err, contexts) {
                if (err) {
                    console.log(err);
                }
                for (i = 0; i < contexts.length; i++) {
                    if (contexts[i].indexOf('mobilespec') >= 0) {
                        webviewContext = contexts[i];
                    }
                }
                done();
            });
    }, MINUTE);

    describe('Specs', function () {
        beforeEach(function (done) {
            // prepare the app for the test
            if (!stopFlag) {
                driver
                    .context(webviewContext)
                    .then(function () {
                        return driver; // no-op
                    }, function (error) {
                        expect(true).toFailWithMessage(error);
                    })
                    .execute('document.getElementById("info").innerHTML = "' + STARTING_MESSAGE + '";')
                    .finally(done);
            }
            done();
        }, 3 * MINUTE);

        afterEach(function (done) {
            resetMocks();
            removeListeners()
                .finally(done);
        });

        afterEach(function (done) {
            if (!errorFlag || stopFlag) {
                // either there's no error or we've failed irrecoverably
                // nothing to worry about!
                done();
                return;
            }

            // recreate the session if there was a critical error in a previous spec
            stopFlag = true; // we're going to set this to false if we're able to restore the session
            driver
                .quit()
                .then(function () {
                    return getDriver()
                        .then(function () {
                            errorFlag = false;
                            stopFlag = false;
                        }, function (error) {
                            fail(error);
                            stopFlag = true;
                        });
                }, function (error) {
                    fail(error);
                    stopFlag = true;
                })
                .finally(done);
        }, 3 * MINUTE);

        //Mock battery charge level
        //Verify that the mocked and returned battery charge values match
        it('batterystatus.ui.spec.1 Verify battery charge level', function (done) {
            if (checkStopFlag()) {
                done();
                return;
            }
            driver
                .context(webviewContext)
                .then(function () {
                    return addListener('batterystatus');
                })
                .sleep(2000)
                .then(function () {
                    return mockBatteryLevel(BATTERY_HIGH);
                })
                .sleep(7000)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    expect(html.indexOf('"type":"batterystatus"')).toBeGreaterThan(-1);
                    expect(html.indexOf('"level":' + BATTERY_HIGH)).toBeGreaterThan(-1);
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        //Verify plugged in status (div id="pluggedValue")
        //Plug device in.
        //Verify device status.
        //Unplug device.
        //Verify device status.
        it('batterystatus.ui.spec.2 Verify plugged in status', function (done) {
            driver
                .context(webviewContext)
                .then(function () {
                    return addListener('batterystatus');
                })
                .sleep(2000)
                .then(function () {
                    // first mock it to true because status change event will only fire if the status has really changed
                    return mockCharger(true);
                })
                .sleep(3000)
                .then(function () {
                    return mockCharger(false);
                })
                .sleep(3000)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    expect(html.indexOf('"type":"batterystatus"')).toBeGreaterThan(-1);
                    expect(html.indexOf('"isPlugged":false')).toBeGreaterThan(-1);
                })
                .then(function () {
                    return mockCharger(true);
                })
                .sleep(3000)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    expect(html.indexOf('"type":"batterystatus"')).toBeGreaterThan(-1);
                    expect(html.indexOf('"isPlugged":true')).toBeGreaterThan(-1);
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        //Mock battery charge to a level less than twenty percent.
        //Verify that the batterylow event is raised.
        it('batterystatus.ui.spec.3 Verify battery charge low level', function (done) {
            driver
                .context(webviewContext)
                .then(function () {
                    return addListener('batterylow');
                })
                .sleep(2000)
                .then(function () {
                    return mockCharger(false);
                })
                .then(function () {
                    return mockBatteryLevel(BATTERY_LOW);
                })
                .sleep(3000)
                .then(maybeConfirm)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    //expect(html).toBe('true');
                    expect(html.indexOf('"type":"batterylow"')).toBeGreaterThan(-1);
                    expect(html.indexOf('"level":' + BATTERY_LOW)).toBeGreaterThan(-1);
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        //Mock battery charge to a level less than five percent.
        //Verify that the batterycritical event is raised.
        it('batterystatus.ui.spec.4 Verify battery charge critical level', function (done) {
            driver
                .context(webviewContext)
                .then(function () {
                    return addListener('batterycritical');
                })
                .sleep(2000)
                .then(function () {
                    return mockCharger(false);
                })
                .then(function () {
                    return mockBatteryLevel(BATTERY_CRITICAL);
                })
                .sleep(3000)
                .then(maybeConfirm)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    expect(html.indexOf('"type":"batterycritical"')).toBeGreaterThan(-1);
                    expect(html.indexOf('"level":' + BATTERY_CRITICAL)).toBeGreaterThan(-1);
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);
    });

    it('batterystatus.ui.util Destroy the session', function (done) {
        driver.quit(done);
    }, MINUTE);
});
