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

self.register_setting('builder', {
    'type': 'action',
    'title': 'template builder',
    'class': 'tb-template-builder',
    'event': TB.utils.events.TB_TEMPLATE_BUILDER
});

var templateStruc = {
    templateName: '',
    phoneNumber: '',
    contactName: '',
    title: '',
    location: '',
    zipCode: '',
    postBody: '',
    squareFeet: '',
    rent: '',
    bedrooms: '0',
    bathrooms: '3',
    laundry: '2',
    parking: '4',
    catsAllowed: false,
    dogsAllowed: false,
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


    var $titleDiv = $('.title '),

        $byPhone = $('#contact_phone_ok'), //check
        $showMap = $('#wantamap'), //check

        $contactPhone = $('#contact_phone'),
        $contactName = $('#contact_name'),
        $postingTitle = $('#PostingTitle'),
        $location = $('#GeographicArea'),
        $zipCode = $('#postal_code'),

        $postBody = $('#PostingBody'),

        $squareFeet = $('#Sqft'),
        $rent = $('input[name=Ask]'),
        $bedrooms = $('#Bedrooms'), //select
        $bathrooms = $('#bathrooms'), //select

        $laundry = $('#laundry'), //select
        $parking = $('#parking'), //select

        $cats = $('#pets_cat'), //check
        $dogs = $('#pets_dog'), //check

        $street = $('#xstreet0'),
        $crossStreet = $('#xstreet1'),
        $city = $('#city'),
        $state = $('#region');


    //$titleDiv.before('<a href="javascript:;" class="tb-paste-template tb-general-button">paste template</a><br><br>');
    var TEMPLATE_SELECT = 'TEMPLATE_SELECT',
        templates = self.setting('templates');

    if (templates.length < 1) {
        self.log('no templates found');
        return;
    }

    self.log('adding template select');
    $titleDiv.before('<select class="tb-template-select"><option value="' + TEMPLATE_SELECT + '">select template</option></select>\
        &nbsp;<button class="tb-template-edit" >add/edit templates</button><br><br>');


    var $templateSelect = $('.tb-template-select');
    $(templates).each(function (idx, template) {
        self.log('found template: ' + template.templateName);
        $templateSelect.append($('<option>', {
            value: idx
        }).text(template.templateName));

    });

    $templateSelect.change(function () {
        var $this = $(this),
            templateIndex = $this.val(),
            template = templates[templateIndex];


        if (templateIndex !== TEMPLATE_SELECT) {
            self.log('inserting template');

            $postingTitle.prop('readonly', true);
            $location.prop('readonly', true);

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

            // reset dropdown
            $(this).val(TEMPLATE_SELECT);
        }
    });

    $body.on('click', '.tb-template-edit', function (e) {
        e.preventDefault();
        self.log('loading template builder');

        TB.utils.sendEvent(TB.utils.events.TB_TEMPLATE_BUILDER);
    });
};

self.templateBuilder = function () {

    TB.utils.catchEvent(TB.utils.events.TB_TEMPLATE_BUILDER, function () {
        self.log('loading template builder');

        TB.ui.overlay(
            'template builder',
            [
                {
                    title: '',
                    tooltip: '',
                    content: '\
                <a href="javascript:;" id="tb-add-template"><img src="data:image/png;base64,' + TBui.iconAdd + '"> Add new template</a>\
                <span id="tb-add-template-form" style="display: none">\
                    <input type="text" id="template-name" placeholder="name of template" class="req"/><br/>\
                    <input type="text" id="contact-name" placeholder="contact name" /><br/>\
                    <input type="text" id="post-title" placeholder="title of post" class="req"/><br/>\
                    <input type="text" id="post-location" placeholder="location" class="req"/><br/>\
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

        // Adding a new template
        $body.on('click', '#tb-add-template', function () {
            $(this).hide();
            $body.find('#tb-add-template-form').show();
        });

        // Save new template
        function clearForm() {


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
        }

        $body.on('click', '.save-new-template', function () {
            var templateName = $body.find('#template-name').val(),
                templateTitle = $body.find('#post-title').val(),
                templateLocation = $body.find('#post-location').val();

            if (templateName.length < 1) {
                TB.ui.textFeedback('template name is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            if (templateTitle.length < 1) {
                TB.ui.textFeedback('post title is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            if (templateLocation.length < 1) {
                TB.ui.textFeedback('location is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            var template = {
                templateName: templateName,
                contactName: $body.find('#contact-name').val(),
                title: templateTitle,
                location: templateLocation,
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


            // And finally we repopulate the templates list and hide the current form.
            populateTemplates();
            clearForm();
        });


        // cancel
        $body.on('click', '.cancel-new-template', function () {
            clearForm();
        });


        // With this function we'll fetch the templates!
        function populateTemplates() {
            $body.find('#tb-template-list').html('');

            var templates = self.setting('templates');

            $(templates).each(function (idx, template) {
                var label = template.templateName;
                if (label == '') {
                    label = '<span style="color: #cecece">(no name)</span>';
                } else {
                    if (label.length > 200) {
                        label = label.substring(0, 197) + '...';
                    }
                }

                self.log(label);


                var templateTemplate = '\
                    <tr class="template" data-template="{{i}}">\
                        <td class="template-buttons">\
                            <a href="javascript:;" data-template="{{idx}}" class="edit"><img src="data:image/png;base64,{{uiCommentEdit}}"></a><br>\
                            <a href="javascript:;" data-template="{{idx}}" class="delete"><img src="data:image/png;base64,{{uiCommentRemove}}"></a>\
                        </td>\
                        <td class="template-content" data-template="{{idx}}">\
                            <span class="template-label" data-for="template-{{idx}}"><span><h3 class="template-title">{{label}}</h3>{{title}}</span></span><br>\
                            <span class="template-edit" style="display: none">\
                            \
                            <input type="text" id="template-name" placeholder="name of template" value="{{templateName}}"/><br/>\
                            <input type="text" id="contact-name" placeholder="contact name" value="{{contactName}}"/><br/>\
                            <input type="text" id="post-title" placeholder="title of post" value="{{title}}"/><br/>\
                            <input type="text" id="post-location" placeholder="location" value="{{location}}"/><br/>\
                            \
                            <input type="number" id="contact-phone" placeholder="phone number" value="{{phoneNumber}}"/>\
                            <input type="number" id="zip-code" placeholder="zipcode" value="{{zipCode}}"/>\
                            <input type="number" id="square-feet" placeholder="square feet" value="{{squareFeet}}"/>\
                            <input type="number" id="rent" placeholder="rent" value="{{rent}}"/> <br/>\
                            \
                            <textarea class="post-body" rows="10" placeholder="posting body">{{postBody}}</textarea><br/>\
                            \
                            <label> bedrooms: <select class="{{idx}}-bedrooms" id="post-bedrooms">\
                                <option value="0">0</option>\
                                <option value="1">1</option>\
                                <option value="2">2</option>\
                                <option value="3">3</option>\
                                <option value="4">4</option>\
                            </select></label>\
                            <label> bathrooms: <select class="{{idx}}-bathrooms" id="post-bathrooms">\
                                <option value="3">1</option>\
                                <option value="4">1.5</option>\
                                <option value="5">2</option>\
                                <option value="6">2.5</option>\
                                <option value="7">3</option>\
                            </select></label>\
                            <label> laundry: <select class="{{idx}}-laundry" id="post-laundry">\
                                <option value="2">laundry in bldg</option>\
                                <option value="1">w/d in unit</option>\
                                <option value="3">laundry on site</option>\
                                <option value="4">w/d hookups</option>\
                                <option value="5">no laundry on site</option>\
                            </select></label>\
                            <label> parking: <select class="{{idx}}-parking" id="post-parking">\
                                <option value="4">off-street parking</option>\
                                <option value="5">street parking</option>\
                                <option value="1">carport</option>\
                                <option value="2">attached garage</option>\
                                <option value="3">detached garage</option>\
                                <option value="7">no parking</option>\
                            </select></label><br/>\
                            \
                            <label><input type="checkbox" class="{{idx}}-cats" id="cats-allowed">cats allowed</label>\
                            <label><input type="checkbox" class="{{idx}}-dogs" id="dogs-allowed">dogs allowed</label>\
                            \
                            <input type="text" id="post-street" placeholder="street address" value="{{street}}"/><br/>\
                            <input type="text" id="cross-street" placeholder="cross street (optional)" value="{{crossStreet}}"/><br/>\
                            <input type="text" id="post-city" placeholder="city" value="{{city}}"/><br/>\
                            <input type="text" id="post-state" placeholder="state" value="{{state}}"/><br/>\
                            <input class="save-edit-template" type="button" value="Save template"><input class="cancel-edit-template" type="button" value="Cancel editing template">\
                            </span>\
                        </td>\
                    </tr>';

                var templateTemplateHTML = TBUtils.template(templateTemplate, {
                    idx: idx,
                    label: label,

                    templateName: template.templateName,
                    contactName: template.contactName,
                    title: template.title,
                    location: template.location,

                    phoneNumber: template.phoneNumber,
                    zipCode: template.zipCode,
                    squareFeet: template.squareFeet,
                    rent: template.rent,

                    postBody: template.postBody,

                    street: template.street,
                    crossStreet: template.crossStreet,
                    city: template.city,
                    state: template.state,

                    uiCommentRemove: TBui.iconCommentRemove,
                    uiCommentEdit: TBui.iconCommentsEdit
                });

                var $templatesList = $body.find('#tb-template-list');
                $templatesList.append(templateTemplateHTML);

                // selects and props can't be templated.
                $('.' + idx + '-bedrooms').val(template.bedrooms);
                $('.' + idx + '-bathrooms').val(template.bathrooms);
                $('.' + idx + '-laundry').val(template.laundry);
                $('.' + idx + '-parking').val(template.parking);

                $('.' + idx + '-cats').prop('checked', template.catsAllowed);
                $('.' + idx + '-dogs').prop('checked', template.dogsAllowed);
            });

        }

        populateTemplates();

        // editing of templates
        $body.on('click', '.template-buttons .edit', function () {
            var $this = $(this);

            $this.closest('tr.template').find('.template-label').hide();
            $this.closest('tr.template').find('.template-edit').show();
        });

        // deleting a template
        $body.on('click', '.template-buttons .delete', function () {
            var $this = $(this);

            var confirmDelete = confirm('This will delete this template, are you sure?');
            if (confirmDelete) {
                var templateIndex = $this.attr('data-template');
                if (!templateIndex) return;

                var templates = self.setting('templates');
                templates.splice(templateIndex, 1);
                self.setting('templates', templates);

                $this.closest('.template').remove();
            }
        });

        // save edited template
        $body.on('click', '.template-edit .save-edit-template', function () {
            var $this = $(this),
                $templateContent = $this.closest('td.template-content'),
                templateIndex = $templateContent.attr('data-template'),
                templates = self.setting('templates')[templateIndex];

            if (!templateIndex) return;

            var templateName = $templateContent.find('#template-name').val(),
                templateTitle = $templateContent.find('#post-title').val(),
                templateLocation = $templateContent.find('#post-location').val();

            if (templateName.length < 1) {
                TB.ui.textFeedback('template name is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            if (templateTitle.length < 1) {
                TB.ui.textFeedback('post title is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            if (templateLocation.length < 1) {
                TB.ui.textFeedback('location is required', TB.ui.FEEDBACK_NEGATIVE);
                return;
            }

            templates[templateIndex] = {
                templateName: templateName,
                contactName: $templateContent.find('#contact-name').val(),
                title: templateTitle,
                location: templateLocation,
                phoneNumber: $templateContent.find('#contact-phone').val(),
                zipCode: $templateContent.find('#zip-code').val(),
                postBody: $templateContent.find('.post-body').val(),

                squareFeet: $templateContent.find('#square-feet').val(),
                rent: $templateContent.find('#rent').val(),
                bedrooms: $templateContent.find('#post-bedrooms').val(),
                bathrooms: $templateContent.find('#post-bathrooms').val(),
                laundry: $templateContent.find('#post-laundry').val(),
                parking: $templateContent.find('#post-parking').val(),

                catsAllowed: $templateContent.find('#cats-allowed').prop("checked"),
                dogsAllowed: $templateContent.find('#dogs-allowed').prop("checked"),

                street: $templateContent.find('#post-street').val(),
                crossStreet: $templateContent.find('#cross-street').val(),
                city: $templateContent.find('#post-city').val(),
                state: $templateContent.find('#post-state').val()
            };

            self.setting('templates', templates);

            var label = templateName;
            if (label == '') {
                label = '<span style="color: #cecece">(no name)</span>';
            } else {
                if (label.length > 200) {
                    label = label.substring(0, 197) + '...';
                }
            }


            var $templateLabel = $templateContent.find('.template-label');
            $templateLabel.html('<span><h3 class="template-title">' + label + '</h3>' + templateTitle + '</span>');


            $templateLabel.show();
            $templateContent.find('.template-edit').hide();
        });

        // cancel
        $body.on('click', '.template-edit .cancel-edit-template', function () {
            var $this = $(this),
                $templateContent = $this.closest('td.template-content'),
                templateIndex = $templateContent.attr('data-template'),
                template = self.setting('templates')[templateIndex];

            if (!templateIndex) return;

            $templateContent.find('#template-name').val(template.templateName || '');
            $templateContent.find('#contact-name').val(template.contactName || '');
            $templateContent.find('#post-title').val(template.title || '');
            $templateContent.find('#post-location').val(template.location || '');
            $templateContent.find('#contact-phone').val(template.phoneNumber || '');
            $templateContent.find('#zip-code').val(template.zipCode || '');
            $templateContent.find('.post-body').val(template.postBody || '');
            $templateContent.find('#square-feet').val(template.squareFeet || '');
            $templateContent.find('#rent').val(template.rent || '');
            $templateContent.find('#post-bedrooms').val(template.bedrooms || '0');
            $templateContent.find('#post-bathrooms').val(template.bathrooms || '3');
            $templateContent.find('#post-laundry').val(template.laundry || '2');
            $templateContent.find('#post-parking').val(template.parking || '4');
            $templateContent.find('#cats-allowed').prop("checked", template.catsAllowed);
            $templateContent.find('#dogs-allowed').prop("checked", template.dogsAllowed);
            $templateContent.find('#post-street').val(template.street || '');
            $templateContent.find('#cross-street').val(template.crossStreet || '');
            $templateContent.find('#post-city').val(template.city || '');
            $templateContent.find('#post-state').val(template.state || '');

            $templateContent.find('.template-label').show();
            $templateContent.find('.template-edit').hide();
        });
    });
};

TB.register_module(self);
}

(function () {
    window.addEventListener("TBModuleLoaded", function () {
        cltemplates();
    });
})();
