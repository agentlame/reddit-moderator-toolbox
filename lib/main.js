var data = require("sdk/self").data;
var ss = require('sdk/simple-storage');
var pageMod = require("sdk/page-mod");
var privateBrowsing = require("sdk/private-browsing");

pageMod.PageMod({
    include: "*.craigslist.com",
    attachTo: ["top", "frame", "existing"],
    contentScriptWhen: 'end',
    contentStyleFile: [
        data.url("styles/toolbox.css"),
        data.url("styles/modbar.css")
    ],
    contentScriptFile: [
        data.url("libs/jquery-2.1.1.js"),
        data.url("libs/tbplugins.js"),
        data.url("libs/pako.js"),
        data.url("tbstorage.js"),
        data.url("tbui.js"),
        data.url("tbutils.js"),
        data.url("tbmodule.js"),
        data.url("modules/modbar.js"),
        data.url("modules/clwatcher.js"),
        data.url("tbmoduleinit.js") // this one always goes last
    ],
    contentScriptOptions: {
        "icon16": data.url("images/icon16.png"), // reference from content script with 'self.options.icon16'
        "nukeIcon": data.url("images/nuke.png") // 'self.options.nukeIcon'
    },
    onAttach: settingsWorker
});

function settingsWorker(worker) {
    worker.port.on('tb-getsettings', function () {
        worker.port.emit('tb-settings-reply', ss.storage.tbsettings);
    });

    worker.port.on('tb-setsettings', function (tbsettingString) {
        if (privateBrowsing.isPrivate(worker)) {
            console.log('private browser. Not storing.')
        } else {
            ss.storage.tbsettings = tbsettingString;
        }
    });

    worker.port.on('tb-clearsettings', function () {
        delete ss.storage.tbsettings;
        worker.port.emit('tb-clearsettings-reply', ss.storage.tbsettings);
    });
}
