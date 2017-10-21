/**
 * ChatAwayButton.js
 * @file Adds "Away" button to chat, isolated functionality from ChatHacks
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "wikia.window"
 * @external "jQuery"
 * @external "mw"
 */

/*jslint browser, this:true */
/*global mw,jQuery,window,require,wk,mainRoom,models,NodeChatController */

require(["jquery", "mw", "wikia.window"], function (jQuery, mw, wk) {
    "use strict";

    if (
        wk.wgCanonicalSpecialPageName !== "Chat" ||
        window.isChatAwayButtonLoaded
    ) {
        return;
    }
    window.isChatAwayButtonLoaded = true;

    /**
     * @class ChatAwayButton
     * @classdesc The central ChatAwayButton class
     */
    var ChatAwayButton = {

        /*
         * Translations retrieved from
         * https://github.com/Wikia/app/blob
         * /dev/extensions/wikia/Chat2/Chat.i18n.php
         */
        i18n: {
            "en": "Away",
            "ar": "مشغول",
            "az": "Kənar",
            "azb": "اوزاق",
            "br": "Ezvezant",
            "ca": "Absent",
            "cs": "Pryč",
            "de": "Abwesend",
            "diq": "Duri de",
            "es": "Ausente",
            "fa": "دور",
            "fi": "Poissa",
            "fr": "Absent",
            "gl": "Ausente",
            "he": "לא זמין",
            "hu": "Távol",
            "ia": "Absente",
            "id": "Pergi",
            "it": "Assente",
            "ja": "退席中",
            "kn": "ದೂರದಲ್ಲಿ",
            "ko": "부재중",
            "lb": "Net do",
            "lrc": "دير",
            "mk": "Отсутен",
            "ms": "Keluar",
            "nb": "Borte",
            "nl": "Weg",
            "oc": "Absent",
            "pl": "Zaraz wracam",
            "pms": "Assent",
            "ps": "ليرې دی",
            "pt": "Ausente",
            "ru": "Отсутствует",
            "sco": "Awa",
            "sv": "Borta",
            "te": "ఇక్కడ లేరు",
            "tl": "Nasa malayo",
            "uk": "Відсутній",
            "vi": "Vắng",
            "zh-hans": "不在",
            "zh-hant": "不在座位"
        },

        /**
         * @method constructButton
         * @description Method constructs a simple button element and returns
         *              it.
         * @param {string} $text
         * @returns {string}
         */
        constructButton: function ($text) {
            return mw.html.element("button", {
                class: "button",
                id: "ChatAwayButton"
            }, $text);
        },

        /**
         * @method setStatus
         * @description Sets the away/present status of the user in question;
         *              slight modification to the standard methods used.
         * @param {string} $status
         * @returns {void}
         */
        setStatus: function ($status) {
            mainRoom.socket.send(
                new models.SetStatusCommand({
                    statusState: $status,
                    statusMessage: ""
                }).xport()
            );
        },

        /**
         * @method main
         * @description The main method, handles placement and click events. The
         *              default <tt>setAway</tt> and <tt>setBack</tt> methods
         *              have been noop'ed in this script for my own personal
         *              preference, as I'm not a fan of the <tt>setTimeout</tt>
         *              implementation used or the inability to add messages to
         *              the chat while away.
         * @returns {void}
         */
        main: function () {
            var that = this;
            var $lang =
                    this.i18n[wk.wgUserLanguage] ||
                    this.i18n[wk.wgUserLanguage.split("-")[0]] ||
                    this.i18n.en;

            var $awayButton = this.constructButton($lang);

            // Negating the defaults
            NodeChatController.prototype.setAway = function () {return;};
            NodeChatController.prototype.setBack = function () {return;};

            /**
             * Modified from ChatSendButton by User:OneTwoThreeFall
             * Button sits above ChatSendButton if present and beside standard
             * ChatHacks buttons (though I don't know why you'd import this
             * with ChatHacks)
             */
            mw.util.addCSS(
                ".Write [name='message'] {" +
                    "width: calc(100% - 70px);" +
                "}" +
                "#ChatAwayButton {" +
                    "position: absolute;" +
                    "bottom: 25px;" +
                    "right: 58px;" +
                "}" +
                "input + #ChatAwayButton:last-child {" +
                    "bottom: 12px;" +
                    "right: 12px;" +
                "}"
            );

            jQuery($awayButton).appendTo(".Write").click(function () {
                return (this.toggle ^= 1)
                    ? that.setStatus(STATUS_STATE_AWAY)
                    : that.setStatus(STATUS_STATE_PRESENT);
            });
        },

        /**
         * @method init
         * @description The use of a MutationObserver is esential since there's
         *              no actual event/hook. Modified from code by User:Speedit
         * @returns {void}
         */
        init: new MutationObserver(function () {
            if (window.mainRoom && mainRoom.isInitialized) {
                mw.loader.using("mediawiki.util").then(
                    jQuery.proxy(this.main, this)
                );
                this.init.disconnect();
            }
        })
    };

    if (window.mainRoom && mainRoom.isInitialized) {
        mw.loader.using("mediawiki.util").then(
            jQuery.proxy(ChatAwayButton.main, ChatAwayButton)
        );
    } else {
        ChatAwayButton.init.observe(
            jQuery("#ChatHeader .User")[0],
            {
                childList: true
            }
        );
    }
});
