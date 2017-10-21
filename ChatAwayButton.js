/**
 * ChatAwayButton.js
 * @file Adds "Away" button to chat, isolated functionality from ChatHacks
 *       Kinda sorta for the author's personal use mainly, but others are free
 *       to import as desired.
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "wikia.window"
 * @external "jQuery"
 * @external "mw"
 */
 
require(["mw", "wikia.window"], function (mw, wk) {
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
         * Translations retrieved from...
         * https://github.com/Wikia/app/blob
         * /e5a9fa8e9e0fa9d77e937a06ee02e65917d24d37
         * /extensions/wikia/Chat2/Chat.i18n.php
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
            "zh-hant": "不在座位",
        },
 
        /**
         * @method constructButton
         * @description Returns a button element
         * @param {string} $text        The text to display in the button
         * @returns {mw.html.element}
         */
        constructButton: function ($text) {
            return mw.html.element("button", {
                class: "button",
                id: "ChatAwayButton"
            }, $text);
        },
 
        /**
         * @method setStatus
         * @description Sets the away/present status of the user in question
         * @param {string} $status      The current status of the user
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
         * @description The main method, handles placement and click events
         * @returns {void}
         */
        main: function () {
            var that = this;
            var $lang =
                this.i18n[wk.wgUserLanguage] ||
                this.i18n[wk.wgUserLanguage.split("-")[0]] ||
                this.i18n.en;
 
            var $awayButton = this.constructButton($lang);
 
            /**
             * jQuery.noop'ing the defaults as I'm not a fan of the setTimeout
             * implementation currently used in the controller. Also, this way
             * allows for adding messages to the main room without having to
             * reset status to back.
             *
             * Yeah yeah, empty function instances cost a bit of memory, sue me.
             */
            NodeChatController.prototype.setAway = function () {return;};
            NodeChatController.prototype.setBack = function () {return;};
 
            /**
             * Modified from ChatSendButton by User:OneTwoThreeFall
             * Button sits above ChatSendButton if present
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
                // Oh yeah, bitwise for days
                return (this.toggle ^= 1)
                    ? that.setStatus(STATUS_STATE_AWAY)
                    : that.setStatus(STATUS_STATE_PRESENT);
            });
        },
 
        /**
         * @method init
         * @description MutationObserver since there's no actual event/hook :(
         * @returns {void}
         */
        init: new MutationObserver(function () {
            if (window.mainRoom && mainRoom.isInitialized) {
                mw.loader.using("mediawiki.util").then(
                    jQuery.proxy(ChatAwayButton.main, ChatAwayButton)
                );
                ChatAwayButton.init.disconnect();
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