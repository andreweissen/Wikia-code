/**
 * MassEdit/code.js
 * @file Allows for addition/deletion/replacement of content from pages
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.ui.factory"
 * @external "wikia.window"
 * @external "I18n-js"
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
        meta: {
            author: "User:Eizen",
            created: "06/01/18",
            version: "1.0"
        },
        hasRights: /(sysop|content-moderator|bot)/
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
         * @param {String} $text - Text to be displayed in the item and title
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
         * @param {String} $page - Inputted page name
         * @returns {boolean}
         */
        isLegalPage: function ($page) {
            if(!this.legalChars.test($page)) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("modalSecurity");
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
                ".massEdit-textarea {" +
                    "height: 65px;" +
                    "width: 100%;" +
                    "padding: 0;" +
                    "overflow: auto;" +
                "}" +
                "#massEdit-log {" +
                    "height: 60px;" +
                    "width: 98%;" +
                    "border: 1px solid;" +
                    "font-family: monospace;" +
                    "background: #fff;" +
                    "color: #aeaeae;" +
                    "overflow: auto;" +
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

            // Disable replacements menu depending on current selected option
            jQuery(document).on("change", "#massEdit-menu", function () {
                if (jQuery("#massEdit-menu").val() === "replace") {
                    jQuery("#massEdit-replaceThis-value")
                        .prop("disabled", false);
                } else {
                    jQuery("#massEdit-replaceThis-value")
                        .prop("disabled", true);
                }
            });
        },

        /**
         * @method getContent
         * @description This method retrieves the content of the inputted page,
         *              including information about its time of creation and
         *              relevant timestamp info. Used exclusively by the find
         *              and dropdown option.
         * @param {String} $action - Editing action (prepend, append, replace)
         * @param {String} $page - The page in question
         * @param {String} $newContent - New text to replace the target
         * @param {String} $replace - The target to be replaced in the callback
         * @param {function} callback - The callback handler
         */
        getContent: function ($action, $page, $newContent, $replace, callback) {
            var that = this;
            this.api.get({
                action: "query",
                prop: "info|revisions",
                intoken: "edit",
                titles: $page,
                rvprop: "content|timestamp",
                rvlimit: "1",
                indexpageids: "true",
                format : "json"
            }).done(function ($data) {
                if (!$data.error) {
                    callback(           // handleContent()
                        that,           // this
                        $action,        // "replace"
                        $data,          // $data
                        $page,          // $pagesArray[$counter]
                        $newContent,    // "#massEdit-content-value"
                        $replace        // "#massEdit-replaceThis-value"
                    );
                }
            });
        },

        /**
         * @method handleContent
         * @description Callback function for <code>getContent</code>. Sifts
         *              through included data and passes relevant bits to the
         *              <code>editPage</code> method. Used exclusively by the
         *              find and replace dropdown option.
         * @param {this} that - Scope variable
         * @param {String} $action - Editing action (prepend, append, replace)
         * @param {JSON} $data - Passed data from <code>getContent</code>
         * @param {String} $page - Specific page in question
         * @param {String} $newContent - New text to replace the target
         * @param {String} $replaceThis - Text to be replaced by $newContent
         * @returns {void}
         */
        handleContent: function (
            that,
            $action,
            $data,
            $page,
            $newContent,
            $replaceThis
        ) {
            // Check if page actually exists
            if (Object.keys($data.query.pages)[0] === "-1") {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").prepend(
                    $i18n.msg("noSuchPage").plain().replace("$1", $page) +
                    "<br />"
                );
                return;
            }

            var $newText;
            var $result = $data.query.pages[Object.keys($data.query.pages)[0]];
            var $text = $result.revisions[0]["*"];
            var $timestamp = $result.revisions[0].timestamp;
            var $starttimestamp = $result.starttimestamp;
            var $token = $result.edittoken;

            // Replace all instances of chosen text with inputted new text
            $newText = $text.split($replaceThis).join($newContent);

            // Check if old & new revisions are identical in content
            if ($newText === $text) {
                jQuery("#massEdit-log").prepend(
                    $i18n.msg("noMatch").plain()
                        .replace("$1", $replaceThis)
                        .replace("$2", $page) +
                    "<br />"
                );
            } else {
                that.editPage(
                    that,
                    $page,
                    $newText,
                    $action,
                    $timestamp,
                    $starttimestamp,
                    $token
                );
            }
        },

        /**
         * @method editPage
         * @description The one-size-fits-all editing handler for use by all
         *              three main MassEdit functions. Takes several different
         *              numbers of input parameters depending on the action to
         *              be taken by the handler.
         * @param {this} that - Scope variable
         * @param {String} $page - The page to be edited
         * @param {String} $content - The content to be added to the page
         * @param {String} $action - Editing action (prepend, append, replace)
         * @param {String} $timestamp - Optional, for replace option only
         * @param {String} $starttimestamp - Optional, for replace option only
         * @param {String} $token - Optional, for replace option only
         * @returns {void}
         */
        editPage: function (
            that,
            $page,
            $content,
            $action,
            $timestamp,
            $starttimestamp,
            $token
        ) {

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
            case "replace":
                $params.text = $content;
                $params.basetimestamp = $timestamp;
                $params.startimestamp = $starttimestamp;
                $params.token = $token;
                break;
            }

            that.api.post($params).done(function ($data) {
                jQuery("#massEdit-modal-form")[0].reset();
                if (!$data.error) {
                    jQuery("#massEdit-log").prepend(
                        $i18n.msg("editSuccess").plain().replace("$1", $page) +
                        "<br />"
                    );
                } else {
                    jQuery("#massEdit-log").prepend(
                        $i18n.msg("editFailure").plain().replace("$1", $page) +
                        "<br />"
                    );
                }
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
         *              <br />
         *              <br />
         *              Addition of global pages-based find-and-replace option
         *              replaces old find-and-delete option, and now checks for
         *              cases of empty pages or empty target text.
         * @returns {void}
         */
        main: function () {
            var that = this;

            // Values of textareas
            var $newContent = jQuery("#massEdit-content-value")[0].value;
            var $toReplace = jQuery("#massEdit-replaceThis-value")[0].value;
            var $pagesInput = jQuery("#massEdit-pages-value")[0].value;
            var $pagesArray = $pagesInput.split(/[\n]+/);

            // Dropdown menu
            var $index = jQuery("#massEdit-menu")[0].selectedIndex;
            var $action = jQuery("#massEdit-menu").val();

            // Interval fields
            var $counter = 0;
            var $editInterval;

            // Is not in the proper rights group
            if (!this.hasRights) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("modalUserRights");
                return;
            // No pages included
            } else if (!$pagesInput) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("noPages");
                return;
            // Is either append/prepend with no content input included
            } else if ($action !== "replace" && !$newContent) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("noContent");
                return;
            // Is find-and-replace with no target content included
            } else if ($action === "replace" && !$toReplace) {
                jQuery("#massEdit-modal-form")[0].reset();
                this.addLogEntry("noTarget");
                return;
            } else {
                switch ($index) {
                case 0: // No action selected
                    this.addLogEntry("noOptionSelected");
                    break;
                case 1:
                case 2: // Edit methods (prepend and append)
                    this.addLogEntry("loading");

                    $editInterval = setInterval(function () {
                        if (that.isLegalPage($pagesArray[$counter])) {
                            that.editPage(
                                that,
                                $pagesArray[$counter],
                                $newContent,
                                $action
                            );
                        }
                        $counter++;
                        if ($counter === $pagesArray.length) {
                            clearInterval($editInterval);
                        }
                    }, that.config.editInterval);
                    break;
                case 3: // Find and replace
                    this.addLogEntry("loading");

                    $editInterval = setInterval(function () {
                        if (that.isLegalPage($pagesArray[$counter])) {
                            that.getContent(
                                $action,
                                $pagesArray[$counter],
                                $newContent,
                                $toReplace,
                                that.handleContent
                            );
                        }
                        $counter++;
                        if ($counter === $pagesArray.length) {
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
         *              link and handling click events. Config options are set
         *              per user input or the defaults.
         * @param {JSON} $lang - I18n-js content
         * @returns {void}
         */
        init: function ($lang) {
            var that = this;

            $lang.useUserLang();
            $i18n = $lang;

            this.api = new mw.Api();
            this.config = jQuery.extend(
                {
                    editInterval: 750,
                    editSummary: $i18n.msg("meEditSummary").plain() +
                        " ([[w:c:dev:MassEdit|" +
                        $i18n.msg("meScript").plain() + "]])"
                },
                window.massEditConfig
            );

            var $modalHTML =
            "<form id='massEdit-modal-form' class='WikiaForm '>" +
                "<fieldset>" +
                    "<p>" + $i18n.msg("modalSelect").plain() +
                        "<br />" +
                        "<select size='1' id='massEdit-menu' name='action'>" +
                            "<option selected=''>" +
                                $i18n.msg("modalSelect").plain() +
                            "</option>" +
                            "<option value='prepend'>" +
                                $i18n.msg("dropdownPrepend").plain() +
                            "</option>" +
                            "<option value='append'>" +
                                $i18n.msg("dropdownAppend").plain() +
                            "</option>" +
                            "<option value='replace'>" +
                                $i18n.msg("dropdownReplace").plain() +
                            "</option>" +
                        "</select>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $i18n.msg("modalContentTitle").plain() +
                        "<br />" +
                        "<textarea id='massEdit-content-value' " +
                            "class='massEdit-textarea' placeholder='" +
                            $i18n.msg("modalContentPlaceholder").plain() +
                        "'/>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $i18n.msg("modalReplaceTitle").plain() +
                        "<br />" +
                        "<textarea id='massEdit-replaceThis-value' " +
                            "class='massEdit-textarea' placeholder='" +
                            $i18n.msg("modalReplacePlaceholder").plain() +
                        "' disabled/>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $i18n.msg("modalPagesTitle").plain() +
                        "<br />" +
                        "<textarea id='massEdit-pages-value' " +
                            "class='massEdit-textarea' placeholder='" +
                            $i18n.msg("modalPagesPlaceholder").plain() +
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
            mw.loader.using(["mediawiki.util", "mediawiki.api"])
        ).done(jQuery.proxy(MassEdit.init, MassEdit));
    });
});
