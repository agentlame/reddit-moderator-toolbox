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
    'title': 'Contact number of post',
    'hidden': true
});

// Advanced settings
self.register_setting('checkDelay', {
    'type': 'number',
    'default': 1000,
    'title': 'Delay between checking each post (in milliseconds)',
    'advanced': true,
    'hidden': true
});

self.register_setting('checkInterval', {
    'type': 'number',
    'default': 35, // 60 secs.
    'title': 'How often to check the front page (time in minutes).'
});

/// Private storage settings.
self.register_setting('lastChecked', {
    'type': 'number',
    'default': -1,
    'advanced': true
});

var now = TB.utils.getTime();

self.init = function () {

    TB.utils.catchEvent(TB.utils.events.TB_CHECK_POSTS, function () {
        self.log('running check');
        self.checkPage();
    });

    var checkInterval = TB.utils.minutesToMilliseconds(self.setting('checkInterval'));//setting is in seconds, convert to milliseconds.


    function getmessages() {
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
    var pageToCheck = self.setting('pageToCheck'),
        templates = TBStorage.getSetting('ClTemplates', 'templates', []);

    if (templates.length <= 0) {
        self.log('No templates found.');
        TBUtils.alert("No posting templates click. Click here to add one.", function () {
            TB.utils.sendEvent(TB.utils.events.TB_TEMPLATE_BUILDER);
        });
        return;
    }

    $.get('//' + pageToCheck, function (page) {
        var $page = $(page),
            $title = $page.find('.hdrlnk'),
            totalLinks = $title.length,
            found = false;
            //$location = $page.find('.pnr');

        // We're checking now.
        self.setting('lastChecked', now);

        self.log(totalLinks);
        TBui.longLoadNonPersistent(true, "Checking front page for posts.", TBui.FEEDBACK_NEUTRAL, 10000, TBui.DISPLAY_BOTTOM);

        function checkTitle(title, idx){

            var $this = $(title),
                postTitle = $this.text(),
                postRent = $this.parent().next().find('.price').text();

            self.log(idx);
            self.log(postTitle);
            self.log(postRent);

            $.each(templates, function () {
                var rent = '$' + this.rent.toString();
                if (this.title == postTitle && rent == postRent) {
                    found = true;
                    return false;
                }
            });
        }

        function pageCheckComplete() {

            if (!found) {
                TBUtils.notification("You do not have a post on the front page!", "Click here to post a new ad.", "//post.craigslist.org/", 100000);
            } else{
                TB.ui.textFeedback('Found post on front page!', TB.ui.FEEDBACK_POSITIVE, 1000, TB.ui.DISPLAY_BOTTOM);
            }
            TBui.longLoadNonPersistent(false);
        }

        if (totalLinks > 0) {
            TBUtils.forEachChunked($title, 5, 500, checkTitle, pageCheckComplete);
        }

    });

    /*** check by number method ***
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
     */
};

TB.register_module(self);
}

(function () {
    window.addEventListener("TBModuleLoaded", function () {
        clwatcher();
    });
})();
