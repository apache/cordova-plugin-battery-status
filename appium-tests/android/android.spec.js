/*jslint node: true, plusplus: true */
/*global beforeEach, afterEach */
/*global describe, it, xit, expect */
'use strict';

var wdHelper = require('../helpers/wdHelper');
var wd       = wdHelper.getWD();
var shell    = global.SHELL || require('shelljs');

describe('Battery status tests Android.', function () {
    var driver;

    function win() {
        expect(true).toBe(true);
    }

    function fail(error) {
        if (error && error.message) {
            console.log('An error occured: ' + error.message);
            expect(true).toFailWithMessage(error.message);
            return;
        }
        if (error) {
            console.log('Failed expectation: ' + error);
            expect(true).toFailWithMessage(error);
            return;
        }
        // no message provided :(
        console.log('An error without description occured');
        expect(true).toBe(false);
    }

    function mockBatteryLevel(level) {
        shell.exec('adb shell dumpsys battery set level ' + level);
    }

    function mockCharger(on) {
        var status = on ? '1' : '0';
        shell.exec('adb shell dumpsys battery set ac ' + status);
        shell.exec('adb shell dumpsys battery set usb ' + status);
    }

    function resetMocks() {
        shell.exec('adb shell dumpsys battery reset');
    }

    function maybeConfirm() {
        return driver
            .context('NATIVE_APP')
            .elementByXPath('//android.widget.Button[@text="OK"]')
            .click()
            .fail(function noop() { return driver; }) //don't fail if there's no "OK" button
            .context('WEBVIEW');
    }

    beforeEach(function () {
        this.addMatchers({
            toFailWithMessage : function (failmessage) {
                this.message = function () { return failmessage; };
                return false;
            }
        });
    });

    it('batterystatus.ui.util.1 configuring driver and starting a session', function (done) {
        driver = wdHelper.getDriver('Android', done);
    }, 240000);

    it('batterystatus.ui.util.2 go to battery tests', function (done) {
        driver
            .context('WEBVIEW')
            .elementByXPath('//a[text()=\'Plugin Tests (Automatic and Manual)\']')
            .click()
            .then(win, function () {
                fail('Couldn\'t find "Plugin Tests (Automatic and Manual)" link.');
            })
            .sleep(15000)
            .elementByXPath('//a[text()=\'Manual Tests\']')
            .click()
            .then(win, function () {
                fail('Couldn\'t find "Manual Tests" link.');
            })
            .elementByXPath('//a[text()="cordova-plugin-battery-status-tests.tests"]')
            .click()
            .then(win, function () {
                fail('Couldn\'t find "cordova-plugin-battery-status-tests.tests" link.');
            })
            .finally(done);
    }, 80000);

    describe('Specs (emulator)', function () {
        afterEach(function () {
            resetMocks();
        });

        //Mock battery charge level
        //Verify that the mocked and returned battery charge values match
        it('batterystatus.ui.spec.1 Verify battery charge level', function (done) {
            driver
                .context('WEBVIEW')
                .elementByXPath('//a[text()=\'Add "batterystatus" listener\']')
                .click()
                .sleep(2000)
                .then(function () {
                    return mockBatteryLevel("72");
                })
                .sleep(3000)
                .elementById('levelValue')
                .getAttribute('innerHTML')
                .then(function (status) {
                    expect(status).toBe('72');
                })
                .elementByXPath('//a[text()=\'Remove "batterystatus" listener\']')
                .click()
                .then(win, fail)
                .finally(done);
        }, 300000);

        //Verify plugged in status (div id="pluggedValue")
        //Plug device in.
        //Verify device status.
        //Unplug device.
        //Verify device status.
        it('batterystatus.ui.spec.2 Verify plugged in status', function (done) {
            driver
                .context('WEBVIEW')
                .elementByXPath('//a[text()=\'Add "batterystatus" listener\']')
                .click()
                .sleep(2000)
                .then(function () {
                    // first mock it to true because status change event will only fire if the status has realy changed
                    return mockCharger(true);
                })
                .sleep(3000)
                .then(function () {
                    return mockCharger(false);
                })
                .sleep(3000)
                .elementById('pluggedValue')
                .getAttribute('innerHTML')
                .then(function (status) {
                    expect(status).toBe('false');
                })
                .then(function () {
                    return mockCharger(true);
                })
                .sleep(3000)
                .elementById('pluggedValue')
                .getAttribute('innerHTML')
                .then(function (status) {
                    expect(status).toBe('true');
                })
                .elementByXPath('//a[text()=\'Remove "batterystatus" listener\']')
                .click()
                .then(win, fail)
                .finally(done);
        }, 300000);

        //Mock battery charge to a level less than twenty percent.
        //Verify that the batterylow event is raised.
        it('batterystatus.ui.spec.3 Verify battery charge low level', function (done) {
            driver
                .context('WEBVIEW')
                .elementByXPath('//a[text()=\'Add "batterylow" listener\']')
                .click()
                .sleep(2000)
                .then(function () {
                    return mockCharger(false);
                })
                .sleep(3000)
                .then(function () {
                    return mockBatteryLevel('14');
                })
                .sleep(3000)
                .then(maybeConfirm)
                .elementById('lowValue')
                .getAttribute('innerHTML')
                .then(function (status) {
                    expect(status).toBe('true');
                })
                .elementByXPath('//a[text()=\'Remove "batterylow" listener\']')
                .click()
                .then(win, fail)
                .finally(done);
        }, 300000);

        //Mock battery charge to a level less than five percent.
        //Verify that the batterycritical event is raised.
        it('batterystatus.ui.spec.4 Verify battery charge critical level', function (done) {
            driver
                .context('WEBVIEW')
                .elementByXPath('//a[text()=\'Add "batterycritical" listener\']')
                .click()
                .sleep(2000)
                .then(function () {
                    return mockCharger(false);
                })
                .sleep(3000)
                .then(function () {
                    return mockBatteryLevel('4');
                })
                .sleep(3000)
                .then(maybeConfirm)
                .elementById('criticalValue')
                .getAttribute('innerHTML')
                .then(function (status) {
                    expect(status).toBe('true');
                }, fail)
                .elementByXPath('//a[text()=\'Remove "batterycritical" listener\']')
                .click()
                .then(win, fail)
                .finally(done);
        }, 300000);
    });

    it('batterystatus.ui.util.3 Destroy the session', function (done) {
        driver.quit(done);
    }, 10000);
});
