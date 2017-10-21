/**
 * PageCreator
 * @file Displays information related to page's creator
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @license Apache-2.0
 * @external "jQuery"
 * @external "mediawiki.util"
 * @external "mediawiki.api"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window */
 
mw.loader.using(["mediawiki.util", "mediawiki.api"], function () {
    "use strict";
 
    var $conf = mw.config.get([
        "skin",
        "wgPageName",
        "wgArticleId",
        "wgUserLanguage",
        "wgNamespaceNumber"
    ]);
 
    if (jQuery("#page-creator").exists() || $conf.wgNamespaceNumber === -1) {
        return;
    }
 
    // Remember to include the $1 and $2 placeholders
    var $i18n = {
        "be": {
            main: "Створана удзельнікам $1",
            on: "$2",
            talk: "talk",
            contribs: "contribs"
        },
        "de": {
            main: "Erstellt von $1",
            on: "und $2",
            talk: "talk",
            contribs: "contribs"
        },
        "en": {
            main: "Created by $1",
            on: "on $2",
            talk: "talk",
            contribs: "contribs"
        },
        "es": {
            main: "Creado por $1",
            on: "y $2",
            talk: "talk",
            contribs: "contribs"
        },
        "fr": {
            main: "Créé par $1",
            on: "et $2",
            talk: "talk",
            contribs: "contribs"
        },
        "it": {
            main: "Creata da $1",
            on: "il giorno $2",
            talk: "discussioni",
            contribs: "contributi"
        },
        "hi": {
            main: "$1 के द्वारा बनाई गई",
            on: "$2 पर",
            talk: "talk",
            contribs: "contribs"
        },
        "kn": {
            main: "ರಚಿಸಿದವರು $1",
            on: "$2 ನಲ್ಲಿ",
            talk: "talk",
            contribs: "contribs"
        },
        "nl": {
            main: "Aangemaakt door $1",
            on: "op $2",
            talk: "talk",
            contribs: "contribs"
        },
        "pl": {
            main: "Utworzone przez $1",
            on: "dnia $2",
            talk: "talk",
            contribs: "contribs"
        },
        "pt": {
            main: "Criada por $1",
            on: "em $2",
            talk: "talk",
            contribs: "contribs"
        },
        "pt-br": {
            main: "Criada por $1",
            on: "em $2",
            talk: "talk",
            contribs: "contribs"
        },
        "ru": {
            main: "Создано участником $1",
            on: "$2",
            talk: "talk",
            contribs: "contribs"
        },
        "sv": {
            main: "Skapad av $1",
            on: "på $2",
            talk: "talk",
            contribs: "contribs"
        },
        "uk": {
            main: "Створено користувачем $1",
            on: "$2",
            talk: "talk",
            contribs: "contribs"
        },
        "zh": {
            main: "由 $1 创建",
            on: "于 $2",
            talk: "讨论",
            contribs: "贡献"
        },
        "zh-hant": {
            main: "由 $1 創建",
            on: "於 $2",
            talk: "討論",
            contribs: "貢獻"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[$conf.wgUserLanguage.split("-")[0]],
        $i18n[$conf.wgUserLanguage]
    );
 
    var $api = new mw.Api();
 
    var $namespaces = window.pageCreatorNamespaces || [0, 4, 8, 10, 14];
    var $useAvatar = window.pageCreatorAvatar || false;
    var $useTimestamp = window.pageCreatorTimestamp || false;
    var $useUTC = window.pageCreatorUTC || false;
 
    /**
     * @class PageCreator
     * @classdesc The central PageCreator class
     */
    var PageCreator = {

        /**
         * @method getData
         * @param {function} callback
         * @returns {void}
         */
        getData: function (callback) {
            var that = this;
 
            $api.get({
                action: "query",
                prop: "revisions",
                titles: $conf.wgPageName,
                rvprop: "ids|timestamp|user|userid",
                rvlimit: "1",
                rvdir: "newer",
                format: "json"
            }).done(function ($data) {
                if (!$data.error) {
                    callback(that, $data);
                }
            });
        },

        /**
         * @method handleData
         * @param {object} that
         * @param {json} $result
         * @returns {void}
         */
        handleData: function (that, $result) {
            var $data = $result.query.pages[$conf.wgArticleId].revisions[0];
            var $revisionURL = $conf.wgPageName + "?oldid=" + $data.revid;
            var $divElement = mw.html.element("div", {id: "page-creator"});
 
            var $userNameLink =
                    "<img id='pc-avatar'/><a href='/wiki/User:" +
                    $data.user + "'>" + $data.user + "</a> " +
                    "(<a href='/wiki/User_talk:" + $data.user + "'>" +
                    $lang.talk + "</a> | <a href='/wiki/" +
                    "Special:Contributions/" + $data.user + "'>" +
                    $lang.contribs + "</a>)";
 
            //Placement of PC before LE if possible
            if (jQuery("#lastEdited").exists()) {
                jQuery($divElement).insertBefore("#lastEdited");
            } else {
                switch ($conf.skin) {
                case "oasis":
                case "wikia":
                    jQuery($divElement)
                        .appendTo("#PageHeader .page-header__title");
                    break;
                case "monobook":
                case "uncyclopedia":
                case "wowwiki":
                    jQuery($divElement).prependTo("#bodyContent");
                    break;
                }
            }
 
            if ($useAvatar === true && $data.userid !== 0) {
                that.getAvatar($data.user);
            }
 
            if ($useTimestamp === true) {
                that.handleTimestamps($data, $revisionURL, $userNameLink);
            } else {
                jQuery("#page-creator")
                    .html(
                        $lang.main.replace(/\$1/g, $userNameLink)
                    );
            }
        },

        /**
         * @method handleTimestamps
         * @param {json} $data
         * @param {string} $rev
         * @param {string} $link
         * @returns {void}
         */
        handleTimestamps: function ($data, $rev, $link) {
            var $time;
            var $formattedCreationDate;
            var $creationDateLink;
 
            if ($useUTC === true) {
                $time = new Date($data.timestamp).toUTCString();
                $formattedCreationDate = $time.slice(0, 3) + ", " +
                        $time.slice(4, 16) + ", " + $time.slice(17, 25) +
                        " (" + $time.slice(26) + ")";
            } else {
                $time = new Date($data.timestamp).toString();
                $formattedCreationDate = $time.slice(0, 3) + ", " +
                        $time.slice(4, 15) + ", " + $time.slice(16, 24) +
                        " " + $time.slice(34);
            }
 
            $creationDateLink = "<a href='/wiki/" + $rev + "'>" +
                    $formattedCreationDate + "</a>";
 
            jQuery("#page-creator")
                .html(
                    $lang.main.replace(/\$1/g, $link) + " "
                    + $lang.on.replace(/\$2/g, $creationDateLink)
                );
        },

        /**
         * @method getAvatar
         * @param {string} $userName
         * @returns {void}
         */
        getAvatar: function ($userName) {
            jQuery.nirvana.getJson("UserProfilePage", "renderUserIdentityBox", {
                title: "User:" + $userName
            }).done(function (d) {
                if (!d.error) {
                    var $avatar = d.user.avatar.split("/150")[0].concat("/15");
                    jQuery("#pc-avatar").attr("src", $avatar).after("&nbsp;");
                }
            });
        },

        /**
         * @method init
         * @returns {void}
         */
        init: function () {
            mw.util.addCSS(
                "#page-creator {" +
                    "line-height: normal;" +
                    "font-size: 12px;" +
                    "font-weight: normal;" +
                "}"
            );
 
            if (jQuery.inArray($conf.wgNamespaceNumber, $namespaces) !== -1) {
                this.getData(this.handleData);
            }
        }
    };
 
    PageCreator.init();
});