/**
 * InsertTemplate.js
 * @file Automatically adds template to file pages without sourcing info
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk */
 
require(["mw", "wikia.window"], function (mw, wk) {
    "use strict";
 
    if (wk.wgNamespaceNumber !== 6 || wk.wgCityId !== "644") {
        return;
    }
 
    var InsertTemplate = {
        lang: {
            title: "InsertTemplate",
            summary: "Inserting template " +
                    "([[w:c:eizen:User:Eizen/InsertTemplate.javascript" +
                    "|script]])",
            successBanner: "Success!",
            errorBanner: "Error!"
        },
 
        /**
         * @description Sourcing template retrieved from
         *              <tt><nowiki>[[Template:Information]]</nowiki></tt>
         */
        template: "== Summary ==\n{{Information\n|attention=\n|description=\n" +
                "|source=\n|author=\n|filespecs=\n|licensing=\n" +
                "|other versions=\n|cat licensee=\n|cat subject=\n|cat type=" +
                "\n}}\n",
 
        /**
         * @method showBanner
         * @description Displays a notification banner informing the user of the
         *              status of the post request
         * @param {string} $message
         * @param {string} $status
         * @returns {void}
         */
        showBanner: function ($message, $status) {
            var $statusClass = ($status === "error"
                ? "error"
                : "confirm");
            new wk.BannerNotification($message, $statusClass).show();
        },
 
        /**
         * @method returnNode
         * @description Returns a string specifying the node to which the list
         *              item is to be appended.
         * @returns {string}
         */
        returnNode: function () {
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                return ".toolbar .tools";
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                return "#p-tb ul";
            }
        },
 
        /**
         * @method constructItem
         * @description Assembles and returns a <tt>mw.html.element</tt> list
         *              element for placement on the toolbar/toolbox
         * @param {string} $text
         * @returns {mw.html.element}
         */
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "insertTemplate-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "insertTemplate-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },
 
        /**
         * @method partialReload
         * @description Reloads the section of image file including text content
         *              without the need to reload the page to see the template.
         * @returns {void}
         */
        partialReload: function () {
            jQuery("#mw-content-text")
                .load(
                    window.location.href + " #mw-content-text > *",
                    function () {
                        jQuery("#mw-content-text").fadeToggle(900);
                    }
                );
        },
 
        /**
         * @method postTemplate
         * @description POST request method to prepend content of sourcing
         *              template to file page being viewed. Edits are marked as
         *              minor and bot to hide action from feeds.
         * @returns {void}
         */
        postTemplate: function () {
            var that = this;
 
            jQuery.ajax({
                type: "POST",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "edit",
                    bot: true,
                    minor: true,
                    prependtext: this.template,
                    title: wk.wgPageName,
                    summary: this.lang.summary,
                    token: mw.user.tokens.get("editToken")
                }
            }).success(function ($data) {
                that.showBanner(that.lang.successBanner, "confirm");
                that.partialReload();
            }).fail(function ($data) {
                that.showBanner(that.lang.errorBanner, "error");
                that.partialReload();
            });
        },
 
        /**
         * @method init
         * @description Assembles content and handles all associated click
         *              events
         * @returns {void}
         */
        init: function () {
            var that = this;
            var $location = this.returnNode();
            var $element = this.constructItem(this.lang.title);
 
            jQuery($location).append($element).click(function () {
                jQuery("#mw-content-text").fadeToggle(900);
                that.postTemplate();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(InsertTemplate.init, InsertTemplate)
    );
});