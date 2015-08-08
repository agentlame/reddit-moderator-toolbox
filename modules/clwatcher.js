function clwatcher() {
var self = new TB.Module('CL Watcher');
self.shortname = 'ClWatcher';

self.settings['enabled']['default'] = true;

// Basic settings.
self.register_setting('contactName', {
    'type': 'text',
    'default': '',
    'title': 'Contact name of post',
    'hidden': true
});

//http://columbus.craigslist.org/search/apa
self.register_setting('pageToCheck', {
    'type': 'text',
    'default': 'columbus.craigslist.org/search/apa',
    'title': 'Page to check',
    'advanced': true
});

self.register_setting('contactNumber', {
    'type': 'number',
    'default': 0,
    'title': 'Contact number of post'
});

// Advanced settings
self.register_setting('checkDelay', {
    'type': 'number',
    'default': 1000,
    'title': 'Delay between checking each post (in milliseconds)',
    'advanced': true
});

self.register_setting('checkInterval', {
    'type': 'number',
    'default': 50, // 60 secs.
    'advanced': true,
    'title': 'Interval to check for new items (time in minutes).'
});

/// Private storage settings.
self.register_setting('lastChecked', {
    'type': 'number',
    'default': -1,
    'advanced': true
});

var now = TB.utils.getTime();

self.init = function () {

    var wwwNotifications = self.setting('wwwNotifications'),
        checkInterval = TB.utils.minutesToMilliseconds(self.setting('checkInterval'));//setting is in seconds, convert to milliseconds.


    function getmessages() {
        self.log('getting messages');


        var lastchecked = self.setting('lastChecked');

        if ((now - lastchecked) < checkInterval) {
            self.log('too soon: ' + (now - lastchecked) + ' waiting for: ' + checkInterval);
            return;
        }

        self.log('running check');
        self.checkPage();
    }

    setInterval(getmessages, checkInterval);
    getmessages();
};

self.checkPage = function() {
    var pageToCheck = self.setting('pageToCheck');
    $.get('//' + pageToCheck, function (page) {
        var $page = $(page),
            $hdrlnk = $page.find('.hdrlnk'),

            contactNumber = cleanTelNumber(self.setting('contactNumber')),
            found = false,
            totalLinks = $hdrlnk.length,

            REPLY_URL = '/reply/col/apa/',
            TEL_STRING = 'tel:',
            SMS_LINK = 'sms:',
            CHECK_DELAY = self.setting('checkDelay');

        if (contactNumber == 0) {
            self.log('No contact number found.');
            TBUtils.alert("No contact number saved. Click here to add one.", function () {
                window.location.href = "/#?tbsettings=clwatcher";
            });
            return;
        }

        // We're checking now.
        self.setting('lastChecked', now);


        function cleanTelNumber(number) {
            number = number.toString();
            number = number.replace(TEL_STRING, '');
            number = number.replace(SMS_LINK, '');
            number = TBUtils.replaceAll('.', '', number);
            number = TBUtils.replaceAll(' ', '', number);
            number = TBUtils.replaceAll('-', '', number);
            number = TBUtils.replaceAll('(', '', number);
            number = TBUtils.replaceAll(')', '', number);
            return number;
        }

        function notFound() {
            TBUtils.notification("You do not have a post on the front page!", "Click here to post a new ad.", "//post.craigslist.org/", 100000);
        }

        function processLink(id, idx) {
            var url = REPLY_URL + id;
            self.log(url);
            self.log(idx);

            $.get(url, function (page) {
                if (found) return;
                var $page = $(page),
                    telNum = $page.find('.replytellink').attr('href');

                if (telNum) {
                    telNum = cleanTelNumber(telNum);
                    self.log(telNum);

                    if (contactNumber == telNum) {
                        found = true;
                        TBui.longLoadNonPersistent(false);
                    }
                    self.log('found: ' + found);
                }

                if (idx == (totalLinks - 1) && !found) {
                    self.log('not found');
                    notFound();
                    TBui.longLoadNonPersistent(false);
                }
            })

        }

        self.log(totalLinks);
        TBui.longLoadNonPersistent(true, "Checking front page for posts.", TBui.FEEDBACK_NEUTRAL, 10000, TBui.DISPLAY_BOTTOM);
        if (totalLinks > 0) {
            $hdrlnk.each(function (idx, link) {
                var id = $(link).data('id');

                setTimeout(function () {
                    if (found) return;
                    processLink(id, idx);
                }, CHECK_DELAY * idx);
            })
        }
    });
};

TB.register_module(self);
}

(function () {
    window.addEventListener("TBModuleLoaded", function () {
        clwatcher();
    });
})();
