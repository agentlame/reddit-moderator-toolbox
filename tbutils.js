function initwrapper() {
(function (TBUtils) {

    // We need these before we can do anything.
    TBUtils.logged = true;

    var CHROME = 'chrome', FIREFOX = 'firefox', OPERA = 'opera', SAFARI = 'safari', UNKOWN_BROWSER = 'unknown',
        ECHO = 'echo', SHORTNAME = 'TBUtils', SETTINGS_NAME = 'Utils';

    //Private variables
    var now = new Date().getTime(),

        shortLength = TBStorage.getSetting(SETTINGS_NAME, 'shortLength', 15),
        longLength = TBStorage.getSetting(SETTINGS_NAME, 'longLength', 45),

        lastgetLong = TBStorage.getCache(SETTINGS_NAME, 'lastGetLong', -1),
        lastgetShort = TBStorage.getCache(SETTINGS_NAME, 'lastGetShort', -1),
        cacheName = TBStorage.getCache(SETTINGS_NAME, 'cacheName', ''),
        seenNotes = TBStorage.getSetting(SETTINGS_NAME, 'seenNotes', []),
        lastVersion = TBStorage.getSetting(SETTINGS_NAME, 'lastVersion', 0),
        newLogin = (cacheName != TBUtils.logged),
        getnewLong = (((now - lastgetLong) / (60 * 1000) > longLength) || newLogin),
        getnewShort = (((now - lastgetShort) / (60 * 1000) > shortLength) || newLogin),
        betaRelease = true,  /// DO NOT FORGET TO SET FALSE BEFORE FINAL RELEASE! ///


        randomQuotes = ["Dude, in like 24 months, I see you Skyping someone to watch them search someone's comments on reddit.",
            "Simple solution, don't use nightmode....",
            "Nightmode users are a buncha nerds.",
            "Oh, so that's where that code went, I thought i had lost it somehow.",
            "Are all close buttons pretty now?!?!?",
            "As a Business Analyst myself...",
            "TOOLBOX ISN'T YOUR PERSONAL TOOL!",
            "You are now an approvened submitter",
            "Translate creesch's Klingon settings to English.",
            "Cuz Uncle Jessy was hot and knew the Beach Boys",
            "Don't worry too much. There's always extra pieces.",
            "Make the check actually check.",
            "I dunno what this 'Safari' thing is.",
            "eeeeew... why is there PHP code in this room?",
            "nah there is an actual difference between stuff",
            "...have you paid money *out of your own pocket* to anyone to vet this product?",
            "first I want to make sure my thing actually does work sort of",
            "Don't let \"perfect\" get in the way of \"good.\"",
            "damnit creesch, put a spoiler tag, now the ending of toolbox is ruined for me",
            "It's not even kinda bad... It's strangely awful.",
            "Like a good neighbor, /u/andytuba is there",
            "toolbox is build on beer"],

        RandomFeedbackText = ["Please hold, your call is important to us.",
            "Remember, toolbox loves you.",
            "toolbox will be back later, gone fishing.",
            "toolbox is 'doing things', don't ask.",
            "Tuning probability drive parameters.",
            "Initiating data transfer: NSA_backdoor_package. ",
            "Please post puppy pictures, they are so fluffy!",
            "RES is visiting for a sleepover,  no time right now",
            "toolbox is on strike, we demand more karma!",
            "brb... kicking Gustavobc from #toolbox",
            "Requesting a new insurance quote from /u/andytuba"];


    // Public variables
    TBUtils.extensionName = 'toolbox base';
    TBUtils.extensionURL = "http://www.example.com";
    TBUtils.toolboxVersion = '1.0' + ((betaRelease) ? ' (beta)' : '');
    TBUtils.shortVersion = 100; //don't forget to change this one!  This is used for the 'new version' notification.
    TBUtils.releaseName = 'YO MAMA';
    TBUtils.configSchema = 1;
    TBUtils.isExtension = true;
    TBUtils.RandomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
    TBUtils.RandomFeedback = RandomFeedbackText[Math.floor(Math.random() * RandomFeedbackText.length)];
    TBUtils.log = [];
    TBUtils.logModules = [];
    TBUtils.debugMode = TBStorage.getSetting(SETTINGS_NAME, 'debugMode', false);
    TBUtils.devMode = TBStorage.getSetting(SETTINGS_NAME, 'devMode', false);
    TBUtils.betaMode = TBStorage.getSetting(SETTINGS_NAME, 'betaMode', false);
    TBUtils.advancedMode = TBStorage.getSetting(SETTINGS_NAME, 'advancedMode', false);
    TBUtils.firstRun = false;
    TBUtils.betaRelease = betaRelease;

    // Shouldn't really mess with this.
    TBUtils.devLock = true;

    //* REMOVE THIS *//
    /*
    TBUtils.debugMode = true;
    TBUtils.devMode = true;
    TBUtils.betaMode = true;
    TBUtils.advancedMode = true;
    */

    // Stuff from TBStorage
    TBUtils.browser = TBStorage.browser;
    TBUtils.domain = TBStorage.domain;
    TBUtils.browsers = TBStorage.browsers;


    // Do settings echo before anything else.  If it fails, exit toolbox.
    var ret = TBStorage.setSetting(SETTINGS_NAME, 'echoTest', ECHO);
    if (ret !== ECHO) {
        alert(TBUtils.extensionName + ' can not save settings to localstorage\n\ntoolbox will now exit');
        return;
    }

    $('body').addClass('mod-toolbox');


    // Get cached info.
    TBUtils.noteCache = (getnewShort) ? {} : TBStorage.getCache(SETTINGS_NAME, 'noteCache', {});
    TBUtils.configCache = (getnewLong) ? {} : TBStorage.getCache(SETTINGS_NAME, 'configCache', {});
    TBUtils.noConfig = (getnewShort) ? [] : TBStorage.getCache(SETTINGS_NAME, 'noConfig', []);
    TBUtils.noNotes = (getnewShort) ? [] : TBStorage.getCache(SETTINGS_NAME, 'noNotes', []);
    TBUtils.mySubs = (getnewLong) ? [] : TBStorage.getCache(SETTINGS_NAME, 'moderatedSubs', []);
    TBUtils.mySubsData = (getnewLong) ? [] : TBStorage.getCache(SETTINGS_NAME, 'moderatedSubsData', []);

    if (TBUtils.debugMode) {
        var consoleText = TBUtils.extensionName + ' version: ' + TBUtils.toolboxVersion +
            ', Browser: ' + TBUtils.browser +
            ', Extension: ' + TBUtils.isExtension +
            ', Beta features: ' + TBUtils.betaMode;// +
            //'\n\n"' + TBUtils.RandomQuote+ '"\n';

        TBUtils.log.push(consoleText);
    }

    // Update cache vars as needed.
    if (newLogin) {
        $.log('Account changed', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'cacheName', TBUtils.logged);
    }

    if (getnewLong) {
        $.log('Long cache expired', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'lastGetLong', now);
    }

    if (getnewShort) {
        $.log('Short cache expired', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'lastGetShort', now);
    }

    if (seenNotes.length > 250) {
        $.log("clearing seen notes", false, SHORTNAME);
        seenNotes.splice(150, (seenNotes.length - 150));
        TBStorage.setSetting(SETTINGS_NAME, 'seenNotes', seenNotes);
    }


    // First run changes.
    if (TBUtils.shortVersion > lastVersion) {

        // These need to happen for every version change
        TBUtils.firstRun = true; // for use by other modules.
        TBStorage.setSetting(SETTINGS_NAME, 'lastVersion', TBUtils.shortVersion); //set last version to this version.

        //** This should be a per-release section of stuff we want to change in each update.  Like setting/converting data/etc.  It should always be removed before the next release. **//

        // Start: version changes.
        /* TBUtils.[get/set]Setting IS NOT DEFINDED YET!!!  Use TBStorage.[get/set]settings */

        // 3.3 version changes
        $.log('Running ' + TBUtils.toolboxVersion + ' changes', true, SHORTNAME);


        // End: version changes.

        // These two should be left for every new release. If there is a new beta feature people want, it should be opt-in, not left to old settings.
        TBStorage.setSetting(SETTINGS_NAME, 'debugMode', false);
        TBStorage.setSetting(SETTINGS_NAME, 'betaMode', false);
        TBUtils.debugMode = false;
        TBUtils.betaMode = false;
    }


    TBUtils.events = {
        TB_TEMPLATE_BUILDER: 'TB_TEMPLATE_BUILDER',
        TB_CHECK_POSTS: 'TB_CHECK_POSTS',
        TB_ABOUT_PAGE: "TB_ABOUT_PAGE"
    };

    // Methods and stuff

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    TBUtils.sendEvent = function (tbuEvent){
        $.log('Sending event: ' + tbuEvent, false, SHORTNAME);
        window.dispatchEvent( new CustomEvent(tbuEvent) );
    };

    TBUtils.catchEvent = function (tbuEvent, callback){
       if (!callback) return;

        window.addEventListener(tbuEvent, callback);
    };

	TBUtils.escapeHTML = function(html)
	{
		var entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		};

		return String(html).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	};

	TBUtils.unescapeHTML = function(html)
	{
		var entityMap = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			'&quot;': '"',
			'&#39;': "'",
			'&#x2F;' : "/"
		};

		return String(html).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	};

    TBUtils.getTime = function() {
        return new Date().getTime();
    };

    TBUtils.getRandomNumber = function(maxInt){
        return Math.floor((Math.random() * maxInt) + 1)
    };

    //
    TBUtils.minutesToMilliseconds = function (mins) {
        var oneMin = 60000,
            milliseconds = mins * 60 * 1000;

        // Never return less than one min.
        if (milliseconds < oneMin) {
            milliseconds = oneMin
        }

        return milliseconds;
    };

    TBUtils.daysToMilliseconds = function (days) {
        return days * 86400000;
    };

    TBUtils.millisecondsToDays = function (milliseconds) {
        return milliseconds / 86400000;
    };

    // convert unix epoch timestamps to ISO format
    TBUtils.timeConverterISO = function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = ('0' + (a.getUTCMonth() + 1)).slice(-2);
        var date = ('0' + a.getUTCDate()).slice(-2);
        var hour = ('0' + a.getUTCHours()).slice(-2);
        var min = ('0' + a.getUTCMinutes()).slice(-2);
        var sec = ('0' + a.getUTCSeconds()).slice(-2);
        return year + '-' + month + '-' + date + 'T' + hour + ':' + min + ':' + sec + 'Z';
    };

	TBUtils.niceDateDiff = function(origdate, newdate) {
		// Enter the month, day, and year below you want to use as
		// the starting point for the date calculation
		if (!newdate) {
			newdate = new Date();
		}

		var amonth = origdate.getUTCMonth() + 1;
		var aday = origdate.getUTCDate();
		var ayear = origdate.getUTCFullYear();

		var tyear = newdate.getUTCFullYear();
		var tmonth = newdate.getUTCMonth() + 1;
		var tday = newdate.getUTCDate();

		var y = 1;
		var mm = 1;
		var d = 1;
		var a2 = 0;
		var a1 = 0;
		var f = 28;

		if (((tyear % 4 === 0) && (tyear % 100 !== 0)) || (tyear % 400 === 0)) {
			f = 29;
		}

		var m = [31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		var dyear = tyear - ayear;

		var dmonth = tmonth - amonth;
		if (dmonth < 0 && dyear > 0) {
			dmonth = dmonth + 12;
			dyear--;
		}

		var dday = tday - aday;
		if (dday < 0) {
			if (dmonth > 0) {
				var ma = amonth + tmonth;

				if (ma >= 12) {
					ma = ma - 12;
				}
				if (ma < 0) {
					ma = ma + 12;
				}
				dday = dday + m[ma];
				dmonth--;
				if (dmonth < 0) {
					dyear--;
					dmonth = dmonth + 12;
				}
			} else {
				dday = 0;
			}
		}

		var returnString = '';

		if (dyear === 0) {
			y = 0;
		}
		if (dmonth === 0) {
			mm = 0;
		}
		if (dday === 0) {
			d = 0;
		}
		if ((y === 1) && (mm === 1)) {
			a1 = 1;
		}
		if ((y === 1) && (d === 1)) {
			a1 = 1;
		}
		if ((mm === 1) && (d === 1)) {
			a2 = 1;
		}
		if (y === 1) {
			if (dyear === 1) {
				returnString += dyear + ' year';
			} else {
				returnString += dyear + ' years';
			}
		}
		if ((a1 === 1) && (a2 === 0)) {
			returnString += ' and ';
		}
		if ((a1 === 1) && (a2 === 1)) {
			returnString += ', ';
		}
		if (mm === 1) {
			if (dmonth === 1) {
				returnString += dmonth + ' month';
			} else {
				returnString += dmonth + ' months';
			}
		}
		if (a2 === 1) {
			returnString += ' and ';
		}
		if (d === 1) {
			if (dday === 1) {
				returnString += dday + ' day';
			} else {
				returnString += dday + ' days';
			}
		}
		if (returnString === '') {
			returnString = '0 days';
		}
		return returnString;
	};

    // convert unix epoch timestamps to readable format dd-mm-yyyy hh:mm:ss UTC
    TBUtils.timeConverterRead = function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = ('0' + (a.getUTCMonth() + 1)).slice(-2);
        var date = ('0' + a.getUTCDate()).slice(-2);
        var hour = ('0' + a.getUTCHours()).slice(-2);
        var min = ('0' + a.getUTCMinutes()).slice(-2);
        var sec = ('0' + a.getUTCSeconds()).slice(-2);
        return date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec + ' UTC';
    };

    // convert titles to a format usable in urls
    // from r2.lib.utils import title_to_url
    TBUtils.title_to_url = function (title) {
        var max_length = 50;

        title = title.replace(/\s+/g, "_");     //remove whitespace
        title = title.replace(/\W+/g, "");      //remove non-printables
        title = title.replace(/_+/g, "_");      //remove double underscores
        title = title.replace(/^_+|_+$/g, "");  //remove trailing underscores
        title = title.toLowerCase();            //lowercase the title

        if (title.length > max_length) {
            title = title.substr(0, max_length);
            title = title.replace(/_[^_]*$/g, "");
        }

        return title || "_";
    };

    // Easy way to use templates. Usage example:
    //    TBUtils.template('/r/{{subreddit}}/comments/{{link_id}}/{{title}}/', {
    //                'subreddit': 'toolbox',
    //                'title':  title_to_url('this is a title we pulled from a post),
    //                'link_id': '2kwx2o'
    //            });
    TBUtils.template = function (tpl, variables) {
        return tpl.replace(/{{([^}]+)}}/g, function (match, variable) {
            return variables[variable];
        });
    };


    TBUtils.alert = function (message, callback) {
        var $noteDiv = $('<div id="tb-notification-alert"><span>' + message + '</span></div>');
        $noteDiv.append('<img src="data:image/png;base64,' + TBui.iconClose + '" class="note-close" title="Close" />');
        $noteDiv.appendTo('body');

        $noteDiv.click(function (e) {
            $noteDiv.remove();
            if (e.target.className === 'note-close') {
                callback(false);
                return;
            }
            callback(true);
        });
    };


    TBUtils.showNote = function (note) {
        if (!note.id || !note.text) return;

        function show() {
            if ($.inArray(note.id, seenNotes) === -1) {
                //TBStorage.setSetting(SETTINGS_NAME, 'noteLastShown', now);

                TBUtils.alert(note.text, function (resp) {
                    seenNotes.push(note.id);
                    TBStorage.setSetting(SETTINGS_NAME, 'seenNotes', seenNotes);
                    if (note.link && note.link.match(/^(https?\:|\/)/i) && resp) window.open(note.link);
                });
            }
        }

        //platform check.
        switch (note.platform) {
            case 'firefox':
                if (TBUtils.browser == FIREFOX && TBUtils.isExtension) show();
                break;
            case 'chrome':
                if (TBUtils.browser == CHROME && TBUtils.isExtension) show();
                break;
            case 'opera':
                if (TBUtils.browser == OPERA && TBUtils.isExtension) show();
                break;
            case 'safari':
                if (TBUtils.browser == SAFARI && TBUtils.isExtension) show();
                break;
            case 'script':
                if (!TBUtils.isExtension) show();
                break;
            case 'all':
                show();
                break;
            default:
                show();
        }
    };


    TBUtils.notification = function (title, body, url, timeout) {
        if  (!timeout) timout = 10000;

        var toolboxnotificationenabled = true;

        // check if notifications are enabled. When they are not we simply abort the function.
        if (toolboxnotificationenabled === false) {
            //console.log('notifications disabled, stopping function');
            return;
        }

        if (!('Notification' in window)) {
            // fallback on a javascript notification
            $.log('boring old rickety browser, falling back on jquery based notifications', false, SHORTNAME);
            body = body.replace(/(?:\r\n|\r|\n)/g, '<br />');
            $.sticky('<strong>' + title + '</strong><br><p><a href="' + url + '">' + body + '<a></p>', {'autoclose': timeout});

        } else if (Notification.permission === 'granted') {

            var notification = new Notification(title, {
                dir: "auto",
                body: body,
                icon: "data:image/png;base64," + TBui.logo64
            });
            setTimeout(function () {
                notification.close()
            }, timeout);

            notification.onclick = function () {
                // Open the page
                $.log('notification clicked', false, SHORTNAME);

                open(url);
                // Remove notification
                this.close();
            }

        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {

                // Whatever the user answers, we make sure we store the information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }

                // If the user is okay, let's create a notification
                if (permission === 'granted') {
                    var notification = new Notification(title, {
                        dir: "auto",
                        body: body,
                        icon: "data:image/png;base64," + TBui.logo64
                    });
                    setTimeout(function () {
                        notification.close()
                    }, timeout);

                    notification.onclick = function () {
                        // Open the page
                        $.log('notification clicked', false, SHORTNAME);

                        open(url);
                        // Remove notification
                        this.close();
                    }
                }
            });
        } else {
            // They have the option enabled, but won't grant permissions, so fall back.
            body = body.replace(/(?:\r\n|\r|\n)/g, '<br />');
            $.sticky('<strong>' + title + '</strong><br><p><a href="' + url + '">' + body + '<a></p>', {'autoclose': timeout});
        }
    };


    TBUtils.humaniseDays = function (diff) {
        var str = '';
        var values = {
            ' year': 365,
            ' month': 30,
            ' week': 7,
            ' day': 1
        };

        for (var x in values) {
            var amount = Math.floor(diff / values[x]);

            if (amount >= 1) {
                str += amount + x + (amount > 1 ? 's' : '') + ' ';
                diff -= amount * values[x];
            }
        }
        return str.slice(0, -1);
    };

    TBUtils.stringFormat = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };


    TBUtils.sortBy = function (arr, prop) {
        return arr.sort(function (a, b) {
            if (a[prop] < b[prop]) return 1;
            if (a[prop] > b[prop]) return -1;
            return 0;
        });
    };

    TBUtils.getHead = function (url, doneCallback) {
        $.ajax({
            type: 'HEAD',
            url: url
        })
            .done(function (data, status, jqxhr) {
                // data isn't needed; just the tip
                doneCallback(status, jqxhr);
            });
    };

    // Because normal .sort() is case sensitive.
    TBUtils.saneSort = function (arr) {
        return arr.sort(function (a, b) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
    };

    TBUtils.saneSortAs = function (arr) {
        return arr.sort(function (a, b) {
            if (a.toLowerCase() > b.toLowerCase()) return -1;
            if (a.toLowerCase() < b.toLowerCase()) return 1;
            return 0;
        });
    };

    TBUtils.replaceAll = function (find, replace, str) {
        find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return str.replace(new RegExp(find, 'g'), replace);
    };

    TBUtils.getHashParameter = function(ParameterKey)
    {
        var hash = window.location.hash.substring(1);
        var params = hash.split('&');
        $.log(params, false, SHORTNAME);
        for (var i = 0; i < params.length; i++)
        {
            var keyval = params[i].split('='),
                key = keyval[0].replace('?','');
            if (key == ParameterKey)
            {
                return keyval[1];
            }
        }
    };

    TBUtils.replaceTokens = function (info, content) {
        $.log(info, false, SHORTNAME);
        for (var i in info) {
            var pattern = new RegExp('{' + i + '}', 'mig');
            content = content.replace(pattern, info[i]);
        }

        return content;
    };


    // Prevent page lock while parsing things.  (stolen from RES)
    TBUtils.forEachChunked = function (array, chunkSize, delay, call, complete, start) {
        if (array === null) finish();
        if (chunkSize === null || chunkSize < 1) finish();
        if (delay === null || delay < 0) finish();
        if (call === null) finish();
        var counter = 0;
        //var length = array.length;

        function doChunk() {
            if (counter == 0 && start) {
                start();
            }

            for (var end = Math.min(array.length, counter + chunkSize); counter < end; counter++) {
                var ret = call(array[counter], counter, array);
                if (ret === false) return window.setTimeout(finish, delay);
            }
            if (counter < array.length) {
                window.setTimeout(doChunk, delay);
            } else {
                window.setTimeout(finish, delay);
            }
        }

        window.setTimeout(doChunk, delay);

        function finish() {
            return complete ? complete() : false;
        }
    };

    // Import export methods
    TBUtils.exportSettings = function (subreddit, callback) {
        $.log("exportSettings is not implemented", false, SHORTNAME);
    };


    TBUtils.importSettings = function (subreddit, callback) {
        $.log("importSettings is not implemented", false, SHORTNAME);
    };


    // Utility methods
    TBUtils.removeQuotes = function (string) {
        return string.replace(/['"]/g, '');
    };

    TBUtils.stringToColor = function (str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

        // int/hash to hex
        for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

        return color;
    };


    // easy way to simulate the php html encode and decode functions
    TBUtils.htmlEncode = function (value) {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
    };

    TBUtils.htmlDecode = function (value) {
        return $('<div/>').html(value).text();
    };


    TBUtils.zlibInflate = function (stringThing) {
        // Expand base64
        stringThing = atob(stringThing);
        // zlib time!
        var inflate = new pako.Inflate({to:'string'});
        inflate.push(stringThing);
        return inflate.result;
    };

    TBUtils.zlibDeflate = function (objThing) {
        // zlib time!
        var deflate = new pako.Deflate({to:'string'});
        deflate.push(objThing, true);
        objThing = deflate.result;
        // Collapse to base64
        return btoa(objThing);
    };


    TBUtils.clearCache = function () {
        $.log('TBUtils.clearCache()', false, SHORTNAME);

        TBUtils.noteCache = {};
        TBUtils.configCache = {};
        TBUtils.noConfig = [];
        TBUtils.noNotes = [];
        TBUtils.mySubs = [];
        TBUtils.mySubsData = [];

        TBStorage.clearCache();
    };


    window.onbeforeunload = function () {
        // TBUI now handles the long load array.
        if (TBui.longLoadArray.length > 0) {
            return 'toolbox is still busy!';
        }


        // Cache data.
        TBStorage.setCache(SETTINGS_NAME, 'configCache', TBUtils.configCache);
        TBStorage.setCache(SETTINGS_NAME, 'noteCache', TBUtils.noteCache);
        TBStorage.setCache(SETTINGS_NAME, 'noConfig', TBUtils.noConfig);
        TBStorage.setCache(SETTINGS_NAME, 'noNotes', TBUtils.noNotes);
        TBStorage.setCache(SETTINGS_NAME, 'moderatedSubs', TBUtils.mySubs);
        TBStorage.setCache(SETTINGS_NAME, 'moderatedSubsData', TBUtils.mySubsData);

        // Just in case.
        //TBStorage.unloading();
    };


    // get toolbox news
    /*
    (function getNotes() {
      // not implemented
    })();
    */

}(TBUtils = window.TBUtils || {}));
}

(function () {
    // wait for storage
    window.addEventListener("TBStorageLoaded", function () {
        initwrapper();

        var event = new CustomEvent("TBUtilsLoaded");
        window.dispatchEvent(event);
    });
})();
