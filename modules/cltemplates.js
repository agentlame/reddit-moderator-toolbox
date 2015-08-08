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
    postBody: ''
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

    template.phoneNumber = '2165022126';
    template.contactName = 'Neil';
    template.title = '10 mins from downtown! No application fee today only!';
    template.location = '1555 Bryden Rd';
    template.zipCode = '43205';
    template.postBody = '- One Bedroom Apartment\
\n- $99 Deposit!\
\n- Newly Renovated\
\n- Air Conditioning\
\n- Plenty Of Closet Space, Fully Equipped Kitchen\
\n- On-site laundry Facility\
\n- On bus line\
\n- Close  downtown\
\n- Cats welcome!\
\n- On-site Maintenance';

    var $contactPhone = $('#contact_phone'),
        $contactName = $('#contact_name'),
        $postingTitle = $('#PostingTitle'),
        $location = $('#GeographicArea'),
        $zipCode = $('#postal_code'),
        $postBody = $('#PostingBody'),
        $titleDiv = $('.title ');

    $titleDiv.before('<a href="javascript:;" class="tb-paste-template tb-general-button">paste template</a><br><br>');

    $body.on('click', '.tb-paste-template', function () {
        $contactPhone.val(template.phoneNumber);
        $contactName.val(template.contactName);
        $postingTitle.val(template.title);
        $location.val(template.location);
        $zipCode.val(template.zipCode);
        $postBody.val(template.postBody);
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
                <input type="number" id="contact-phone" placeholder="phone number" /> <input type="number" id="zip-code" placeholder="zipcode" /> <br/>\
                <textarea class="post-body" rows="10" placeholder="posting body"></textarea><br/>\
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

            var templateName = $body.find('#template-name').val(),
                name = $body.find('#contact-name').val(),
                title = $body.find('#post-title').val(),
                location = $body.find('#post-location').val(),
                phoneNumber = $body.find('#contact-phone').val(),
                zipCode = $body.find('#zip-code').val(),
                postBody = $body.find('.post-body').val();

            var template = {
                templateName: templateName,
                contactName: name,
                title: title,
                location: location,
                phoneNumber: phoneNumber,
                zipCode: zipCode,
                postBody: postBody
            };

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
