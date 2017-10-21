/**
 * UserActivityTab/code.js
 * @file Provides a link to Special:UserActivity
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
 
    if (
        window.isUserActivityTabLoaded ||
        jQuery("li[data-id='user-activity']").exists()
    ) {
        return;
    }
    window.isUserActivityTabLoaded = true;
 
    /**
     * @class UserActivityTab
     * @classdesc main class
     */
    var UserActivityTab = {
 
        /*
         * From https://github.com/Wikia/app/blob/dev/
         * extensions/wikia/UserActivity/UserActivity.i18n.php
         * Thx Cube <dev.wikia.com/w/User_talk:KockaAdmiralac>
         */
        i18n: {
            "de": "Benutzeraktivität",
            "be": "Актыўнасць удзельніка",
            "en": "User Activity",
            "es": "Actividad del usuario",
            "fr": "Votre activité",
            "hi": "उपयोगकर्ता गतिविधि",
            "it": "Attività dell\"utente",
            "ja": "アクティビティ",
            "kn": "ಬಳಕೆದಾರರ ಚಟುವಟಿಕೆ",
            "pl": "Aktywność użytkownika",
            "pt": "Atividade",
            "ru": "Активность участника",
            "sr": "Корисничка активност",
            "sr-el": "Korisnička aktivnost",
            "sv": "Användaraktivitet",
            "uk": "Активність користувача",
            "zh": "用户活动",
            "zh-hant": "用户活動"
        },
 
        /**
         * @method constructItem
         * @description Method returns a link inside a list item
         * @param {string} $href
         * @param {string} $text
         * @returns {mw.html.element}
         */
        constructItem: function ($href, $text) {
            return mw.html.element("li", {
                "id": "useractivitytab-li",
                "data-id": "user-activity"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "useractivitytab-a",
                    "href": $href,
                    "title": $text
                }, $text)
            ));
        },
 
        /**
         * @method returnSkinContent
         * @description Method returns the name of the user page owner and the
         *              element after which to append the list item. Array
         *              content is skin-specific.
         * @returns {array} $skinSpecificContent
         */
        returnSkinContent: function () {
            var $skinSpecificContent = [];
 
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                $skinSpecificContent.push(
                    jQuery(".UserProfileMasthead .masthead-info h1").text(),
                    ".WikiaUserPagesHeader ul.tabs"
                );
                break;
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                $skinSpecificContent.push(
                    jQuery(".firstHeading, #firstHeading")
                        .clone().children().remove().end().text().split(":")[1],
                    "#p-cactions ul"
                );
                break;
            }
 
            return $skinSpecificContent;
        },
 
        /**
         * @method init
         * @description Assembles all the necessary content and appends to
         *              selected node only if the user page being viewed is the
         *              owner's.
         * @returns {void}
         */
        init: function () {
            var $lang =
                    this.i18n[wk.wgUserLanguage] ||
                    this.i18n[wk.wgUserLanguage.split("-")[0]] ||
                    this.i18n.en;
            var $href = "http://c" + wk.wgCookieDomain +
                    wk.wgArticlePath.replace("$1", "Special:UserActivity");
            var $skinContent = this.returnSkinContent();
            var $element = this.constructItem($href, $lang);
 
            if ($skinContent[0] === wk.wgUserName) {
                jQuery($skinContent[1]).append($element);
            }
        }
    };
 
    jQuery(document).ready(jQuery.proxy(UserActivityTab.init, UserActivityTab));
});