/**
 * MassEdit/code.js
 * @file Allows for addition/deletion of content from pages
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.ui.factory"
 * @external "wikia.window"
 * @external "mw"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk, ui */

require(["jquery", "mw", "wikia.window", "wikia.ui.factory"],
        function (jQuery, mw, wk, ui) {
    "use strict";

    if (jQuery("#massEdit-li").exists() || window.isMassEditLoaded) {
        return;
    }
    window.isMassEditLoaded = true;

    if (!window.dev || !window.dev.i18n) {
        wk.importArticle({
            type: "script",
            article: "u:dev:MediaWiki:I18n-js/code.js"
        });
    }
    var $i18n;

    /**
     * @class MassEdit
     * @classdesc The central MassEdit class
     */
    var MassEdit = {
        hasRights: /(bureaucrat|sysop|content-moderator|bot)/
            .test(wk.wgUserGroups.join(" ")),
        legalChars: new RegExp("^[" + wk.wgLegalTitleChars + "]*$"),

        /**
         * @method addLogEntry
         * @description Method allows for quick adding of a MassEdit log entry
         *              to the appropriate text field.
         * @param {String} field - The name of the JSON field
         * @returns {void}
         */
        addLogEntry: function (field) {
            jQuery("#massEdit-log").prepend($i18n.msg(field).plain() + "<br/>");
        },

        /**
         * @method returnNode
         * @description Method returns the id of the location to which the
         *              constructed link item is to be appended. For Oasis, this
         *              is the "My Tools" menu along with the other Mass family
         *              tools. For Monobook et al, this is the Toolbox module.
         * @returns {String}
         */
        returnNode: function () {
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                return "#my-tools-menu";
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                return "#p-tb ul";
            }
        },

        /**
         * @method constructItem
         * @description Method returns a completed <code>String</code>
         *              representing the menu link item. Is comprised of a
         *              link inside a list item.
         * @param {string} $text - Text to be displayed in the item and title
         * @returns {String}
         */
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "massEdit-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "massEdit-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },

        /**
         * @method isLegalPage
         * @description Utility function used to test if inputted page name
         *              matches the legal characters regex. Returns a boolean
         *              flag depending on result.
         * @param {string} $page - Inputter page name
         * @returns {boolean}
         */
        isLegalPage: function ($page) {
            if(!this.legalChars.test($page)) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("modalError");
                return false;
            } else {
                return true;
            }
        },

        /**
         * @method displayModal
         * @description Method constructs and displays the main user interface.
         *              Injects custom CSS prior to construction and handles all
         *              button click events.
         * @param {String} $modalHTML - The modal HTML layout
         * @returns {void}
         */
        displayModal: function ($modalHTML) {
            var that = this;

            mw.util.addCSS(
                "#massEdit-menu { " +
                    "width: 100%;" +
                "}" +
                "#massEdit-content-value," +
                "#massEdit-pages-value {" +
                    "height: 100px;" +
                    "width: 100%;" +
                    "padding: 0;" +
                    "overflow: scroll;" +
                "}" +
                "#massEdit-log {" +
                    "height: 100px;" +
                    "width: 98%;" +
                    "border: 1px solid;" +
                    "font-family: monospace;" +
                    "background: #fff;" +
                    "color: #aeaeae;" +
                    "overflow: scroll;" +
                    "padding:5px;" +
                "}"
            );

            ui.init(["modal"]).then(function (modal) {
                var config = {
                    vars: {
                        id: "massEdit-modal",
                        size: "medium",
                        title: $i18n.msg("itemTitle").plain(),
                        content: $modalHTML,
                        buttons: [{
                            vars: {
                                value: $i18n.msg("buttonCancel").plain(),
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "cancel"
                                }]
                            }
                        }, {
                            vars: {
                                value: $i18n.msg("buttonClear").plain(),
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "clear"
                                }]
                            }
                        }, {
                            vars: {
                                value: $i18n.msg("buttonSubmit").plain(),
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "submit"
                                }]
                            }
                        }]
                    }
                };

                modal.createComponent(config, function (massEditModal) {
                    massEditModal.bind("cancel", function () {
                        massEditModal.trigger("close");
                    });

                    massEditModal.bind("clear", function () {
                        jQuery("#massEdit-modal-form")[0].reset();
                    });

                     massEditModal.bind("submit", function () {
                        that.main();
                    });

                    massEditModal.show();
                });
            });
        },

        /**
         * @method handleWikitext
         * @description Callback function for <code>getWikitext</code>. Sifts
         *              through included data and passes relevant bits to the
         *              <code>editPage</code> method. Used exclusively by the
         *              "Delete Content" dropdown option.
         * @param {json} $data - Passed data from <code>getWikitext</code>
         * @param {String} $page - Specific page in question
         * @param {String} $replace - Text to be replaced by an empty String
         * @returns {void}
         */
        handleWikitext: function ($data, $page, $replace) {
            var $result = $data.query.pages[Object.keys($data.query.pages)[0]];
            var $text = $result.revisions[0]["*"];
            var $timestamp = $result.revisions[0].timestamp;
            var $starttimestamp = $result.starttimestamp;
            var $token = $result.edittoken;

            $text = $text.replace(new RegExp($replace, "g"), "");

            MassEdit.editPage($page, $text, "delete", $timestamp,
                $starttimestamp, $token);
        },

        /**
         * @method getWikitext
         * @description This method retrieves the content of the inputted page,
         *              including information about its time of creation and
         *              relevant timestamp info. Used exclusively by the "Delete
         *              Content" dropdown option
         * @param {string} $page - The page in question
         * @param {string} $replace - The text to be replaced in the callback
         * @param {function} callback - The callback handler
         */
        getWikitext: function ($page, $replace, callback) {
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "query",
                    prop: "info|revisions",
                    intoken: "edit",
                    titles: $page,
                    rvprop: "content|timestamp",
                    rvlimit: "1",
                    indexpageids: "true",
                    format : "json"
                }
            }).done(function ($data) {
                if (!$data.error) {
                    callback($data, $page, $replace);
                }
            });
        },

        /**
         * @method editPage
         * @description The one-size-fits-all editing handler for use by all
         *              three main MassEdit functions. Takes several different
         *              numbers of input parameters depending on the action to
         *              be taken by the handler.
         * @param {string} $page - The page to be edited
         * @param {string} $content - The content to be added to the page
         * @param {string} $action - Editing action (prepend, append, delete)
         * @param {string} $timestamp - Optional, for delete option only
         * @param {string} $starttimestamp - Optional, for delete option only
         * @param {string} $token - Optional, for delete option only
         * @returns {void}
         */
        editPage: function ($page, $content, $action, $timestamp,
                $starttimestamp, $token) {

            // Default base properties
            var $params = {
                action: "edit",
                minor: true,
                bot: true,
                title: $page,
                summary: this.config.editSummary
            };

            // Set additional Object properties depending on action to be taken
            switch ($action) {
            case "prepend":
                $params.prependtext = $content;
                $params.token = mw.user.tokens.get("editToken");
                break;
            case "append":
                $params.appendtext = $content;
                $params.token = mw.user.tokens.get("editToken");
                break;
            case "delete":
                $params.text = $content;
                $params.basetimestamp = $timestamp;
                $params.startimestamp = $starttimestamp;
                $params.token = $token;
                break;
            }

            jQuery.ajax({
                type: "POST",
                url: mw.util.wikiScript("api"),
                data: $params
            }).success(function ($data) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").prepend(
                    $i18n.msg("editSuccess").plain().replace("$1", $page) +
                    "<br/>"
                );
            }).fail(function ($data) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").prepend(
                    $i18n.msg("editFailure").plain().replace("$1", $page) +
                    "<br/>"
                );
            });
        },

        /**
         * @method main
         * @description The main method handles the collection of user input and
         *              invokes method based on the user's desired action. If
         *              the user is not in the proper user rights group, access
         *              is denied. If no action is selected, the user is
         *              prompted to select an action. <code>setInterval</code>
         *              is employed to ensure that the script does not make too
         *              many consecutive content GETs or edit POSTs; replaces
         *              <code>forEach</code> implementation.
         * @returns {void}
         */
        main: function () {
            if (!this.hasRights) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("modalUserRights");
                return;
            } else {
                var that = this;

                // User input
                var $index = jQuery("#massEdit-menu")[0].selectedIndex;
                var $input = jQuery("#massEdit-content-value")[0].value;
                var $pages = jQuery("#massEdit-pages-value")[0]
                        .value.split(/[\n]+/);

                // Fields used for setInterval iterations below
                var $counter = 0;
                var $editInterval;

                switch ($index) {
                case 0: // No action selected
                    this.addLogEntry("noOptionSelected");
                    break;
                case 1:
                case 2: // Edit methods (prepend and append)
                    var $action;
                    this.addLogEntry("loading");

                    if ($index === 1) {
                        $action = "prepend";
                    } else {
                        $action = "append";
                    }

                    $editInterval = setInterval(function () {
                        if (that.isLegalPage($pages[$counter])) {
                            that.editPage($pages[$counter], $input, $action);
                        }
                        $counter++;
                        if ($counter === $pages.length) {
                            clearInterval($editInterval);
                        }
                    }, that.config.editInterval);
                    break;
                case 3: // Find and delete
                    this.addLogEntry("loading");

                    $editInterval = setInterval(function () {
                        if (that.isLegalPage($pages[$counter])) {
                            that.getWikitext(
                                $pages[$counter],
                                $input,
                                that.handleWikitext
                            );
                        }
                        $counter++;
                        if ($counter === $pages.length) {
                            clearInterval($editInterval);
                        }
                    }, that.config.editInterval);
                    break;
                }
            }
        },

        /**
         * @method init
         * @description Method initializes the program, assembling the toolbar
                        link and handling click events.
         * @returns {void}
         */
        init: function ($lang) {
            var that = this;

            $lang.useUserLang();
            $i18n = $lang;

            this.config = jQuery.extend(
                {
                    editInterval: 500,
                    editSummary: $i18n.msg("meEditSummary").plain() +
                        " ([[w:c:dev:MassEdit|" +
                        $i18n.msg("meScript").plain() + "]])"
                },
                window.massEditConfig
            );

            var $modalHTML =
            "<form id='massEdit-modal-form' class='WikiaForm '>" +
                "<fieldset>" +
                    "<p>" + $i18n.msg("modalTitle1").plain() +
                        "<br />" +
                        "<select size='1' id='massEdit-menu' name='action'>" +
                            "<option selected=''>" +
                                $i18n.msg("modalTitle1").plain() +
                            "</option>" +
                            "<option value='prepend'>" +
                                $i18n.msg("dropdownPrepend").plain() +
                            "</option>" +
                            "<option value='append'>" +
                                $i18n.msg("dropdownAppend").plain() +
                            "</option>" +
                            "<option value='append'>" +
                                $i18n.msg("dropdownDelete").plain() +
                            "</option>" +
                        "</select>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $i18n.msg("modalTitle2").plain() +
                        "<br />" +
                        "<textarea id='massEdit-content-value' placeholder='" +
                            $i18n.msg("modalTemplateplaceholder").plain() +
                        "'/>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $i18n.msg("modalTitle3").plain() +
                        "<br />" +
                        "<textarea id='massEdit-pages-value' placeholder='" +
                            $i18n.msg("modalPagesplaceholder").plain() +
                        "'/>" +
                        "<br />" +
                    "</p>" +
                "</fieldset>" +
                "<br />" +
                "<hr>" +
            "</form>" +
            "<p>" + $i18n.msg("modalLog").plain() + "</p>" +
            "<div id='massEdit-log'></div>";

            var $toolbarElement = this.constructItem(
                $i18n.msg("itemTitle").plain()
            );
            var $desiredNode = this.returnNode();

            jQuery($toolbarElement).prependTo($desiredNode).click(function () {
                that.displayModal($modalHTML);
            });
        }
    };

    mw.hook("dev.i18n").add(function ($i18n) {
        jQuery.when(
            $i18n.loadMessages("MassEdit"),
            mw.loader.using("mediawiki.util")
        ).done(jQuery.proxy(MassEdit.init, MassEdit));
    });
});
