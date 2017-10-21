/**
 * ChatMessageWallCount/code.js
 * @file Allows user to check message wall notification while in chat
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk, MutationObserver, mainRoom */
 
require(["mw", "wikia.window"], function (mw, wk) {
    "use strict";
 
    if (
        wk.wgCanonicalSpecialPageName !== "Chat" ||
        window.isChatMessageWallCountLoaded
    ) {
        return;
    }
    window.isChatMessageWallCountLoaded = true;
 
    var $i18n = {
        "en": {
            title: "Message Wall Activity",
            loading: "Loading...",
            message: "You have $1 unread message(s)"
        },
        "it": {
            title: "Attività della Bacheca",
            loading: "Caricamento...",
            message: "Hai $1 messaggio/i non letti"
        },
        "be": {
            title: "Актыўнасць Сцены абмеркавання",
            loading: "Загрузка...",
            message: "Колькасць непрачытаных паведамленняў: $1"
        },
        "ru": {
            title: "Активность Стены обсуждения",
            loading: "Загрузка...",
            message: "Количество непрочитанных сообщений: $1"
        },
        "sv": {
            title: "Meddelandevägg-aktivitet",
            loading: "Läser in...",
            message: "Du har $1 nytt meddelande(n)"
        },
        "uk": {
            title: "Активність Стіни обговорення",
            loading: "Завантаження...",
            message: "Кількість непрочитаних повідомлень: $1"
        },
        "es": {
            title: "Actividad del Muro de Mensajes",
            loading: "Cargando...",
            message: "Tiene $1 mensaje(s) no leídos"
        },
        "zh": {
            title: "讯息墙活动",
            loading: "读取中...",
            message: "您有 $1 封未读的新讯息"
        },
        "zh-hant": {
            title: "讯息墙活动",
            loading: "读取中...",
            message: "您有 $1 封未读的新讯息"
        },
        "zh-hans": {
            title: "訊息牆活動",
            loading: "讀取中...",
            message: "您有 $1 封未讀的新訊息"
        },
        "zh-tw": {
            title: "訊息牆活動",
            loading: "讀取中...",
            message: "您有 $1 封未讀的新訊息"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    var ChatMessageWallCount = {
 
        /**
         * @method getCount
         * @description Queries WallNotificationsExternal controller for new
         *              message count data, replacing $1 in the displayed string
         * @returns {void}
         */
        getCount: function () {
            jQuery.nirvana.getJson(
                "WallNotificationsExternal",
                "getUpdateCounts"
            ).done(function ($data) {
                if (!$data.error) {
                    jQuery("#CMWC-count").html(
                        $lang.message.replace("$1", $data.count)
                    );
                }
            });
        },
 
        /**
         * @method constructUI
         * @description Constructs the main span-within-div interface. Could use
         *              some revision at some point.
         * @returns {void}
         */
        constructUI: function () {
            return mw.html.element("div", {
                "id": "CMWC-title"
            }, new mw.html.Raw(
                $lang.title + "<br />" +
                mw.html.element("span", {
                    "id": "CMWC-count"
                }, $lang.loading)
            ));
        },
 
        /**
         * @method main
         * @description The main method of the script; assembles interface and
         *              handles click events.
         * @returns {void}
         */
        main: function () {
            mw.util.addCSS(
                "#CMWC-title {" +
                    "font-weight: bold;" +
                    "font-size: 11px;" +
                    "position: absolute;" +
                    "cursor: pointer;" +
                    "top: 5px;" +
                    "right: 190px;" +
                "}" +
                "#CMWC-count {" +
                    "font-size: 10px;" +
                    "display: none;" +
                "}"
            );
 
            var that = this;
            var $interface = this.constructUI();
 
            jQuery("header#ChatHeader .public.wordmark").after($interface);
            jQuery("#CMWC-title").click(function () {
                if (this.toggle ^= 1) {
                    jQuery("#CMWC-count").fadeIn(500);
                    that.getCount();
                } else {
                    jQuery("#CMWC-count").fadeOut(500);
                }
            });
        },
 
        /**
         * @method init
         * @description MutationObserver to check if chat has properly loaded.
         *              Functionality adapted from work by [[User:Speedit]].
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
            jQuery.proxy(ChatMessageWallCount.main, ChatMessageWallCount)
        );
    } else {
        ChatMessageWallCount.init.observe(
            jQuery("#ChatHeader .User")[0],
            {
                childList: true
            }
        );
    }
});