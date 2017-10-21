/**
 * BlogLink.js
 * @file Adds links to user's blogs, contributions, and pseudo talk pages
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 *         Ursuul <dev.wikia.com/wiki/User_talk:Ursuul>
 * @external "mediawiki.util"
 * @external "jquery"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk */
 
require(["jquery", "mw", "wikia.window"], function (jQuery, mw, wk) {
    "use strict";
 
    if (window.isBlogLinkLoaded) {
        return;
    }
    window.isBlogLinkLoaded = true;
 
    var $i18n = {
        "be": {
            blog: "Мой блог",
            contribs: "Мой унёсак",
            talk: "Мая сцяна абмеркавання"
        },
        "de": {
            blog: "Mein Blog",
            contribs: "Mein Beiträge",
            talk: "Nachrichten"
        },
        "en": {
            blog: "My Blog",
            contribs: "My Contributions",
            talk: "My Talk"
        },
        "es": {
            blog: "Mi Blog",
            contribs: "Mis Contribuciones",
            talk: "Mis mensajes"
        },
        "fr": {
            blog: "Mon Blog",
            contribs: "Mes contributions",
            talk: "Mes messages"
        },
        "it": {
            blog: "Il mio Blog",
            contribs: "I miei contributi",
            talk: "I miei messaggi"
        },
        "ja": {
            blog: "私のブログ",
            contribs: "私の貢献",
            talk: "トーク"
        },
        "ko": {
            blog: "내 블로그",
            contribs: "기여 목록",
            talk: "내 토크"
        },
        "nl": {
            blog: "Mijn Blog",
            contribs: "Mijn bijdragen",
            talk: "Mijn overleg"
        },
        "pl": {
            blog: "Mój Blog",
            contribs: "Moje edycje",
            talk: "Moja dyskusja"
        },
        "pt": {
            blog: "Meu blog",
            contribs: "Minhas contribuições",
            talk: "Minhas mensagens"
        },
        "pt-br": {
            blog: "Meu blog",
            contribs: "Minhas contribuições",
            talk: "Minhas mensagens"
        },
        "ro": {
            blog: "Blogul meu",
            contribs: "Contribuțiile mele",
            talk: "Talk-ul meu"
        },
        "ru": {
            blog: "Мой блог",
            contribs: "Мой вклад",
            talk: "Моя стена обсуждения"
        },
        "tr": {
            blog: "Bloğum",
            contribs: "Katkılarım",
            talk: "Benim Mesaj"
        },
        "uk": {
            blog: "Мій блоґ",
            contribs: "Мій вклад",
            talk: "Моя стіна обговорення"
        },
        "zh": {
            blog: "我的博客",
            contribs: "我的貢獻",
            talk: "我的談話頁"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    /**
     * @class BlogLink
     */
    var BlogLink = {
 
        /**
         * @method determineSkinFamily
         * @description Method returns a string indicating the skin family the
         *              user is using, and additionally sets the default link
         *              placement node.
         * @returns {string}
         */
        determineSkinFamily: function () {
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                this.defaultPlacement = ".wds-global-navigation__user-menu " +
                        "div:nth-child(2) ul li:nth-child(3)";
                return "oasis";
            case "monobook":
            case "uncyclopedia":
            case "wowwiki":
                this.defaultPlacement = "#p-personal ul > li#pt-mycontris";
                return "monobook";
            }
        },
 
        /**
         * @method addLink
         * @description Method invokes construction method, producing a new HTML
         *              link element, which is then added before the target
         *              element or before the default location if the target is
         *              not found.
         * @param {string} $title - used in construction of element id
         * @param {string} $href
         * @param {string} $text
         * @param {string} $target
         * @returns {void}
         */
        addLink: function ($title, $href, $text, $target) {
            var $element = this.constructItem(
                $title,
                mw.util.getUrl($href),
                $text
            );
 
            if (jQuery($target).exists()) {
                jQuery($target).before($element);
            } else {
                jQuery(this.defaultPlacement).before($element);
            }
        },
 
        /**
         * @method constructItem
         * @description Returns a string of constructed link-in-list elements to
         *              be added to the proper target node.
         * @param {string} $parameter
         * @param {string} $href
         * @param {string} $text
         * @returns {string}
         */
        constructItem: function ($parameter, $href, $text) {
            return mw.html.element("li", {
                "id": "bl-" + $parameter
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "bl-" + $parameter + "-a",
                    "href": $href,
                    "title": $text
                }, $text)
            ));
        },
 
        /**
         * @method checkForBlogs
         * @description Method retrives data regarding the activated features on
         *              the wiki in question and invokes the addLink method if
         *              blogs are enabled.
         * @returns {void}
         */
        checkForBlogs: function () {
            var that = this;
            jQuery.nirvana.getJson(
                "WikiFeaturesSpecialController",
                "index"
            ).done(function ($data) {
                if (
                    !$data.error &&
                    $data.features[1].name === "wgEnableBlogArticles" &&
                    $data.features[1].enabled === true
                ) {
                    that.addLink(
                        "blog",
                        "User blog:" + wk.wgUserName,
                        $lang.blog,
                        "#bl-contributions"
                    );
                }
            });
        },
 
        /**
         * @method main
         * @description Method coordinates the main action of the script,
         *              checking for user config and building links accordingly.
         * @returns {void}
         */
        main: function () {
            this.config = jQuery.extend(
                {
                    talk: true,
                    contribs: true
                },
                window.blogLinkConfig
            );
 
            this.skinFamily = this.determineSkinFamily();
 
            // Add contribs link only in Oasis
            if (this.skinFamily === "oasis" && this.config.contribs) {
                this.addLink(
                    "contributions",
                    "Special:Contributions/" + wk.wgUserName,
                    $lang.contribs,
                    this.defaultPlacement
                );
            }
 
            // Add PTP link only if the script is loaded on the wiki
            if (this.config.talk) {
                mw.hook("pseudotalkpages.loaded").add(function () {
                    jQuery.proxy(
                        BlogLink.addLink(
                            "talk",
                            "User:" + wk.wgUserName + "/Talk",
                            $lang.talk,
                            "#bl-blog"
                        ),
                        BlogLink
                    );
                });
            }
 
            // For whatever reason, En-CC has no WikiFeaturesSpecialController
            if (wk.wgCityId !== "177") {
                this.checkForBlogs();
            } else {
                this.addLink(
                    "blog",
                    "User blog:" + wk.wgUserName,
                    $lang.blog,
                    "#bl-contributions"
                );
            }
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(BlogLink.main, BlogLink)
    );
});