var wd = global.WD || require('wd');
var driver;

module.exports.getDriver = function (platform, callback) {
    var serverConfig = {
        host: 'localhost',
        port: 4723
    };
    var driverConfig = {
        browserName: '',
        'appium-version': '1.3',
        platformName: platform,
        platformVersion: '',
        deviceName: '',
        app: global.PACKAGE_PATH
    };

    driver = wd.promiseChainRemote(serverConfig);
    module.exports.configureLogging(driver);
    driver.init(driverConfig).setImplicitWaitTimeout(10000)
    .sleep(20000) // wait for the app to load
    .then(callback);

    return driver;
};

module.exports.getWD = function () {
    return wd;
}

module.exports.configureLogging = function (driver) {
  driver.on('status', function (info) {
    console.log(info);
  });
  driver.on('command', function (meth, path, data) {
    console.log(' > ' + meth, path, data || '');
  });
  driver.on('http', function (meth, path, data) {
    console.log(' > ' + meth, path, data || '');
  });
};