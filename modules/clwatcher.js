function notifiermod() {
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
    'title': 'Page to check'
});

self.register_setting('contactNumber', {
    'type': 'number',
    'default': 0,
    'title': 'Contact number of post'
});

// Advanced settings
self.register_setting('checkDelay', {
    'type': 'number',
    'default': 500,
    'title': 'Delay between checking each post (in milliseconds)',
    'advanced': true
});
self.register_setting('checkInterval', {
    'type': 'number',
    'default': 30, // 60 secs.
    'advanced': true,
    'title': 'Interval to check for new items (time in minutes).'
});

// Hidden settings.
self.register_setting('wwwNotifications', {
    'type': 'boolean',
    'default': false,
    'title': 'Only check for notifications on www.reddit.com (prevents duplicate notifications)',
    'hidden': true
});

/// Private storage settings.
self.register_setting('lastChecked', {
    'type': 'number',
    'default': -1,
    'hidden': true
});

self.init = function () {

    var wwwNotifications = self.setting('wwwNotifications'),
        checkInterval = TB.utils.minutesToMilliseconds(self.setting('checkInterval'));//setting is in seconds, convert to milliseconds.


    function getmessages() {
        self.log('getting messages');

        // get some of the variables again, since we need to determine if there are new messages to display and counters to update.
        var lastchecked = self.setting('lastChecked'),
            now = TB.utils.getTime();

        if ((now - lastchecked) < checkInterval) {
            self.log('too soon: ' + (now - lastchecked) + ' waiting for: ' + checkInterval);
            return;
        }


        // We still want counts updated, just no notifications shown.
        // That's why we do this here.
        if (wwwNotifications && TB.utils.domain !== 'www') {
            self.log("non-www domain; don't show notifications");
            return;
        }

        //$.log('updating totals');
        // We're checking now.
        self.setting('lastChecked', now);

        self.log('running check');
        self.checkPage();
    }

    setInterval(getmessages, checkInterval);
    getmessages();
};

self.checkPage = function() {
    var pageToCheck = self.setting('pageToCheck');
    $.get(pageToCheck, function (page) {
        var $page = $(page),
            $hdrlnk = $page.find('.hdrlnk'),

            contactNumber = self.setting('contactNumber'),
            found = false,
            totalLinks = $hdrlnk.length,

            REPLY_URL = '/reply/col/apa/',
            TEL_STRING = 'tel:',
            SMS_LINK = 'sms:',
            CHECK_DELAY = self.setting('checkDelay');


        function cleanTelNumber(number) {
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
            TBUtils.alert("You do not have a post on the front page!", function () {
                window.location.href = "https://post.craigslist.org/";
            })
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

                    found = (contactNumber == telNum);
                    self.log('found: ' + found);
                }

                if (idx == (totalLinks - 1) && !found) {
                    notFound();
                }
            })

        }

        self.log(totalLinks);
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
} // notifier() wrapper

(function () {
    window.addEventListener("TBModuleLoaded", function () {
        notifiermod();
    });
})();
