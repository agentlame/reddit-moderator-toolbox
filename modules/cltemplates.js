function cltemplates() {
var self = new TB.Module('CL Templates');
self.shortname = 'ClTemplates';

self.settings['enabled']['default'] = true;

// Basic settings.
self.register_setting('templates', {
    'type': 'array',
    'default': [],
    'title': 'templates object',
    'advanced': true
});

    // Basic settings.
self.register_setting('builder', {
    'type': 'action',
    'title': 'template builder',
    'class': 'tb-template-builder',
    'event': TB.utils.events.TB_TEMPLATE_BUILDER
});
var template = {
    templateName: '',
    phoneNumber: '',
    contactName: '',
    title: '',
    location: '',
    zipCode: '',
    postBody: '',
    squareFeet: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    laundry: '',
    parking: '',
    catsAllowed: false,
    dogsAllowed: false,
    wantMap: '',
    street: '',
    crossStreet: '',
    city: '',
    state: ''
};

var $body = $('body');

self.init = function () {
    self.templateBuilder();
    self.templatePicker();
};

self.templatePicker = function () {
    var posting = $('.posting').length;

    // Not a posting page.
    if (!posting) return;
    self.log('posting page!');

    template = {
        "templateName":"2BR - EW - First month free",
        "contactName":"Neil",
        "title":"First month free!  Move in today!",
        "location":"Columbus",
        "phoneNumber":"2165022126",
        "zipCode":"43205",
        "postBody":"Located less than 2 miles from OSU and the Medical Center, this popular Grandview community offers 25 unique 1, 2, and 3 bedroom apartment floor plans -- including roommate-friendly 2 and 3 bedroom layouts.\n\n* Upgraded kitchens with stainless steel appliances\n* Washer and dryer in all apartment homes\n* Two resort-style pools, 24 hour fitness center and free tanning\n* Onsite parking garage and covered parking available\n* Walking distance to the Columbus Ale House and Brazenhead\n\nBeautiful 2BR/2BA with Huge Closets in Grandview! Only 1 left!\n\n$1049 -- Stylish 1BR! Huge Walk-in Closet\n$1159- Spacious 1 BR with Den!\n$1499 -- Unique 2BR with Separate Dining Room!",
        "squareFeet":"600",
        "rent":"790",
        "bedrooms":"2",
        "bathrooms":"4",
        "laundry":"1",
        "parking":"2",
        "catsAllowed":false,
        "dogsAllowed":true,
        "street":"1555 Bryden Rd",
        "crossStreet":"Kelton Ave",
        "city":"Columbus",
        "state":"Ohio"
    };


    var $byPhone = $('#contact_phone_ok'), //check
        $contactPhone = $('#contact_phone'),
        $contactName = $('#contact_name'),
        $postingTitle = $('#PostingTitle'),
        $location = $('#GeographicArea'),
        $zipCode = $('#postal_code'),
        $postBody = $('#PostingBody'),
        $titleDiv = $('.title '),

        $squareFeet = $('#Sqft'),
        $rent = $('input[name=Ask]'),
        $bedrooms = $('#Bedrooms'), //select
        $bathrooms = $('#bathrooms'), //select
        $laundry = $('#laundry'), //select
        $parking = $('#parking'), //select
        $cats = $('#pets_cat'), //check
        $dogs = $('#pets_dog'), //check
        $showMap = $('#wantamap'), //check
        $street = $('#xstreet0'),
        $crossStreet = $('#xstreet1'),
        $city = $('#city'),
        $state = $('#region');


    $titleDiv.before('<a href="javascript:;" class="tb-paste-template tb-general-button">paste template</a><br><br>');

    $body.on('click', '.tb-paste-template', function () {
        // non=optionals
        $byPhone.prop('checked', true);

        // conditionals
        if (template.street && template.city && template.state) {
            $showMap.prop('checked', true);
        }

        $contactPhone.val(template.phoneNumber);
        $contactName.val(template.contactName);
        $postingTitle.val(template.title);
        $location.val(template.location);
        $zipCode.val(template.zipCode);
        $postBody.val(template.postBody);

        $squareFeet.val(template.squareFeet);
        $rent.val(template.rent);
        $bedrooms.val(template.bedrooms);
        $bathrooms.val(template.bathrooms);
        $laundry.val(template.laundry);
        $parking.val(template.parking);

        $cats.prop('checked', template.catsAllowed);
        $dogs.prop('checked', template.dogsAllowed);

        $street.val(template.street);
        $crossStreet.val(template.crossStreet);
        $city.val(template.city);
        $state.val(template.state);

    });
};

self.templateBuilder = function () {

    TB.utils.catchEvent(TB.utils.events.TB_TEMPLATE_BUILDER, function () {
        self.log('loading template builder');

        var $overlay = TB.ui.overlay(
            'template builder',
            [
                {
                    title: '',
                    tooltip: '',
                    content: '\
            <a href="javascript:;" id="tb-add-template"><img src="data:image/png;base64,' + TBui.iconAdd + '"> Add new template</a>\
            <span id="tb-add-template-form" style="display: none">\
                <input type="text" id="template-name" placeholder="name of template"/><br/>\
                <input type="text" id="contact-name" placeholder="contact name" /><br/>\
                <input type="text" id="post-title" placeholder="title of post" /><br/>\
                <input type="text" id="post-location" placeholder="location" /><br/>\
                \
                <input type="number" id="contact-phone" placeholder="phone number" /> \
                <input type="number" id="zip-code" placeholder="zipcode" />\
                <input type="number" id="square-feet" placeholder="square feet" /> \
                <input type="number" id="rent" placeholder="rent" /> <br/>\
                \
                <textarea class="post-body" rows="10" placeholder="posting body"></textarea><br/>\
                <!-- NOTE: the values used are based on the values used on the posting page. That is why they seem out of order. -->\
                <label> bedrooms: <select id="post-bedrooms"> \
                    <option value="0">0</option>\
                    <option value="1">1</option>\
                    <option value="2">2</option>\
                    <option value="3">3</option>\
                    <option value="4">4</option>\
                </select></label>\
                <label> bathrooms: <select id="post-bathrooms">\
                    <option value="3">1</option>\
                    <option value="4">1.5</option>\
                    <option value="5">2</option>\
                    <option value="6">2.5</option>\
                    <option value="7">3</option>\
                </select></label>\
                <label> laundry: <select id="post-laundry">\
                    <option value="2">laundry in bldg</option>\
                    <option value="1">w/d in unit</option>\
                    <option value="3">laundry on site</option>\
                    <option value="4">w/d hookups</option>\
                    <option value="5">no laundry on site</option>\
                </select></label>\
                <label> parking: <select id="post-parking">\
                    <option value="4">off-street parking</option>\
                    <option value="5">street parking</option>\
                    <option value="1">carport</option>\
                    <option value="2">attached garage</option>\
                    <option value="3">detached garage</option>\
                    <option value="7">no parking</option>\
                </select></label> <br/>\
                \
                <label><input type="checkbox" id="cats-allowed">cats allowed</label>\
                <label><input type="checkbox" id="dogs-allowed">dogs allowed</label>\
                \
                <input type="text" id="post-street" placeholder="street address"/><br/>\
                <input type="text" id="cross-street" placeholder="cross street (optional)" /><br/>\
                <input type="text" id="post-city" placeholder="city" /><br/>\
                <input type="text" id="post-state" placeholder="state" /><br/>\
                \
                <input class="save-new-template" type="button" value="Save new template"><input class="cancel-new-template" type="button" value="Cancel adding template">\
            </span>\
            <table id="tb-template-list">\
            </table>\
            ',
                    footer: ''
                }
            ],
            '', // meta
            'tb-templates' // class
        ).appendTo('body');
        $body.css('overflow', 'hidden');

        $body.on('click', '.tb-templates .close', function () {
            $('.tb-templates').remove();
            $body.css('overflow', 'auto');
        });

        // Adding a new reason
        $body.on('click', '#tb-add-template', function () {
            $(this).hide();
            $body.find('#tb-add-template-form').show();
        });

        // Save new reason
        $body.on('click', '.save-new-template', function () {

            var template = {
                templateName: $body.find('#template-name').val(),
                contactName: $body.find('#contact-name').val(),
                title: $body.find('#post-title').val(),
                location: $body.find('#post-location').val(),
                phoneNumber: $body.find('#contact-phone').val(),
                zipCode: $body.find('#zip-code').val(),
                postBody: $body.find('.post-body').val(),

                squareFeet: $body.find('#square-feet').val(),
                rent: $body.find('#rent').val(),
                bedrooms: $body.find('#post-bedrooms').val(),
                bathrooms: $body.find('#post-bathrooms').val(),
                laundry: $body.find('#post-laundry').val(),
                parking: $body.find('#post-parking').val(),

                catsAllowed: $body.find('#cats-allowed').prop("checked"),
                dogsAllowed: $body.find('#dogs-allowed').prop("checked"),

                street: $body.find('#post-street').val(),
                crossStreet: $body.find('#cross-street').val(),
                city: $body.find('#post-city').val(),
                state: $body.find('#post-state').val()
            };

            self.log(template);

            var templates = self.setting('templates');
            templates.push(template);
            self.setting('templates', templates);


            // And finally we repopulate the reasons list and hide the current form.
            $body.find('#tb-template-list').html('');
            populateTemplates();

            $body.find('#tb-add-template').show();
            $body.find('#tb-add-template-form').hide();
            $body.find('#template-name').val('');
            $body.find('#contact-name').val('');
            $body.find('#post-title').val('');
            $body.find('#post-location').val('');
            $body.find('#contact-phone').val('');
            $body.find('#zip-code').val('');
            $body.find('.post-body').val('');
            $body.find('#square-feet').val('');
            $body.find('#rent').val('');
            $body.find('#post-bedrooms').val('0');
            $body.find('#post-bathrooms').val('3');
            $body.find('#post-laundry').val('2');
            $body.find('#post-parking').val('4');
            $body.find('#cats-allowed').prop("checked", false);
            $body.find('#dogs-allowed').prop("checked", false);
            $body.find('#post-street').val('');
            $body.find('#cross-street').val('');
            $body.find('#post-city').val('');
            $body.find('#post-state').val('');
        });

        /*
         // cancel
         $body.on('click', '#tb-add-removal-reason-form .cancel-new-reason', function () {

         $body.find('#tb-add-removal-reason').show();
         $body.find('#tb-add-removal-reason-form').hide();
         $body.find('#tb-add-removal-reason-form .edit-area').val('');
         $body.find('#tb-add-removal-reason-form input[name=removal-title]').val('');
         $body.find('#tb-add-removal-reason-form input[name=flair-text]').val('');
         $body.find('#tb-add-removal-reason-form input[name=flair-css]').val('');
         $body.find('#tb-add-removal-reason-form input[name=edit-note]').val('');
         });
         */

        // With this function we'll fetch the removal reasons!
        function populateTemplates() {
            var templates = self.setting('templates');


            var i = 0;
            $(templates).each(function () {
                var label = this.templateName;
                if (label == '') {
                    label = '<span style="color: #cecece">(no name)</span>';
                } else {
                    if (label.length > 200) {
                        label = label.substring(0, 197) + '...';
                    }
                }

                self.log(label);

                var templateName = this.templateName,
                    name = this.contactName,
                    title = this.title,
                    location = this.location,
                    phoneNumber = this.phoneNumber,
                    zipCode = this.zipCode,
                    postBody = this.postBody;


                var templateTemplate = '\
            <tr class="template" data-reason="{{i}}">\
                <td class="template-buttons">\
                    <a href="javascript:;" data-reason="{{i}}" class="edit"><img src="data:image/png;base64,{{uiCommentEdit}}"></a> <br>\
                    <a href="javascript:;" data-reason="{{i}}" class="delete"><img src="data:image/png;base64,{{uiCommentRemove}}"></a>\
                </td>\
                <td class="template-content" data-reason="{{i}}">\
                    <span class="template-label" data-for="template-{{i++}}"><span><h3 class="template-title">{{title}}</h3>{{label}}</span></span><br>\
                    <span class="template-edit" style="display: none">\
                    <input type="text" id="template-name" placeholder="name of template" value="{{templateName}}"/><br/>\
                    <input type="text" id="contact-name" placeholder="contact name" value="{{name}}"/><br/>\
                    <input type="text" id="post-title" placeholder="title of post" value="{{title}}"/><br/>\
                    <input type="text" id="post-location" placeholder="location" value="{{location}}"/><br/>\
                    <input type="number" id="contact-phone" placeholder="phone number" value="{{phoneNumber}}"/> <input type="number" id="zip-code" placeholder="zipcode" value="{{zipCode}}"/> <br/>\
                    <textarea class="post-body" rows="10" placeholder="posting body">{{postBody}}</textarea><br/>\
                    <input class="save-new-template" type="button" value="Save new template"><input class="cancel-new-template" type="button" value="Cancel adding template">\
                    </span>\
                </td>\
            </tr>';

                var templateTemplateHTML = TBUtils.template(templateTemplate, {
                    'i': i,
                    'i++': (i++),
                    'label': label,
                    'templateName': templateName,
                    'title': title,
                    'name': name,
                    'location': location,
                    'phoneNumber': phoneNumber,
                    'zipCode': zipCode,
                    'postBody': postBody,
                    'uiCommentRemove': TBui.iconCommentRemove,
                    'uiCommentEdit': TBui.iconCommentsEdit
                });

                var $templatesList = $body.find('#tb-template-list');

                $templatesList.append(templateTemplateHTML);
            });

        }
        populateTemplates();

    });
};

TB.register_module(self);
}

(function () {
    window.addEventListener("TBModuleLoaded", function () {
        cltemplates();
    });
})();
