/**
 * CreateUserPage.js
 * @file Personal variation of QuickCreateUserPage
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
 
    if (window.isCreateUserPageLoaded || jQuery("#cup-li").exists()) {
        return;
    }
    window.isCreateUserPageLoaded = true;
 
    var CreateUserPage = {
        lang: {
            title: "CreateUserPage",
            summary: "Creating user page",
            script: "script",
            successBanner: "Successfully created page!",
            errorBanner: "Error \"$1\" was encountered!"
        },
        showBanner: function ($message, $status) {
            var $statusClass = ($status === "error"
                ? "error"
                : "confirm");
            new wk.BannerNotification($message, $statusClass).show();
        },
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "cup-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "cup-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },
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
        postContent: function ($title, $template) {
            var that = this;
            jQuery.ajax({
                type: "POST",
                url: mw.util.wikiScript("api"),
                dataType: "json",
                data: {
                    action: "edit",
                    minor: true,
                    bot: true,
                    title: $title,
                    summary: that.lang.summary + " " +
                            "([[w:c:eizen:User:Eizen/CreateUserPage." +
                            "javascript|" + that.lang.script + "]])",
                    text: $template,
                    format: "json",
                    token: mw.user.tokens.get("editToken")
                }
            }).done(function ($data) {
                if (!$data.error && $data.edit.result === "Success") {
                    that.showBanner(that.lang.successBanner, "confirm");
                } else {
                    that.showBanner(
                        that.lang.errorBanner.replace("$1", $data.error.code),
                        "error"
                    );
                }
            }).fail(function ($data) {
                that.showBanner(
                    that.lang.errorBanner.replace("$1", $data.error.code),
                    "error"
                );
            });
        },
        init: function () {
            var that = this;
            var $template = window.createUserPageTemplate ||
                    "{{w::User:" + wk.wgUserName + "}}";
            var $title = "User:" + wk.wgUserName;
            var $element = this.constructItem(this.lang.title);
 
            jQuery($element).prependTo(this.returnNode()).click(function () {
                that.postContent($title, $template);
                jQuery(this).remove();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(CreateUserPage.init, CreateUserPage)
    );
});