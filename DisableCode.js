/**
 * DisableCode/code.js
 * @file Allows users to disable custom user or site CSS/JS for testing
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "I18n-js"
 * @external "jQuery"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk */

require(["mw", "wikia.window", "jquery"], function (mw, wk, jQuery) {
    "use strict";

    if (window.isDisableCodeLoaded || jQuery("#disableCode").exists()) {
        return;
    }
    window.isDisableCodeLoaded = true;

    if (!window.dev || !window.dev.i18n) {
        wk.importArticle({
            type: "script",
            article: "u:dev:MediaWiki:I18n-js/code.js"
        });
    }
    var $i18n;

    /**
     * @class DisableCode
     * @classdesc The main DisableCode object literal
     */
    var DisableCode = {

        /**
         * @method constructItem
         * @description Method creates list items to be appended to the proper
         *              container element. If the item is the reset button, the
         *              <code>href</code> attribute is set to the current value
         *              of <code>window.location.href</code> minus any included
         *              <code>DisableCode.parameters</code> values. Probably
         *              should use legitimate click events in a future rewrite.
         * @param {String} $text
         * @param {String} $param
         * @returns {String}
         */
        constructItem: function ($text, $param) {
            var $href = window.location.href;
            var $search = (window.location.search)
                ? "&"
                : "?";

            if ($text === $i18n.msg("reset").plain()) {
                this.parameters.forEach(function ($selected) {
                    if ($href.indexOf($selected.param) !== -1) {
                        var $pStart = $href.indexOf($selected.param);
                        var $pSlice = $href.slice(
                                $pStart - 1,
                                $pStart + $selected.param.length + 2
                            );

                        $href = $href.replace(/#.*/, "").replace($pSlice, "");
                    }
                });
            } else {
                $href = $href.replace(/#.*/, "") + $search + $param + "=" + 0;
            }

            return mw.html.element("li", {
                "class": "overflow disableCode-li",
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "class": "disableCode-a",
                    "href": $href,
                    "title": $text
                }, $text)
            ));
        },

        /**
         * @method addItems
         * @description Utility method that simply adds the inputted elements to
         *              the container <code>ul</code> element.
         * @param {String[]} $items
         * @returns {void}
         */
        addItems: function ($items) {
            $items.forEach(function ($item) {
                jQuery("#disableCode-menu").append($item);
            });
        },

        /**
         * @method handlerMonobook
         * @description Method creates an appropriate Monobook-specific
         *              container element for the links, appends it, and invokes
         *              <code>addItems</code> to add elements to container.
         * @param {String[]} $assembledItems
         * @returns {void}
         */
        handlerMonobook: function ($assembledItems) {
            var $container = mw.html.element("div", {
                "class": "portlet",
                "id": "disableCode"
            }, new mw.html.Raw(
                mw.html.element("h5", {}, $i18n.msg("title").plain()) +
                mw.html.element("div", {
                    "class": "pBody",
                }, new mw.html.Raw(
                    mw.html.element("ul", {
                        "id": "disableCode-menu"
                    })
                ))
            ));

            jQuery("#column-one").append($container);
            this.addItems($assembledItems);
        },

        /**
         * @method handlerOasis
         * @description Method handles the creation of Oasis-specific container
         *              element in the form of a "My Tools" style dropdown menu.
         *              Includes click handler, appending of menu to toolbar,
         *              and an invocation of <code>addItems</code> to add array
         *              elements to container.
         * @param {String[]} $assembledItems
         * @returns {void}
         */
        handlerOasis: function ($assembledItems) {
            mw.util.addCSS(
                "#disableCode-menu {" +
                    "left: 10px;" +
                    "right: auto;" +
                    "display: none;" +
                "}"
            );

            var $container = mw.html.element("li", {
                "class": "mytools menu",
                "id": "disableCode"
            }, new mw.html.Raw(
                mw.html.element("span", {
                    "class": "arrow-icon-ctr",
                }, new mw.html.Raw(
                    mw.html.element("span", {
                        "class": "arrow-icon arrow-icon-single"
                    })
                )) +
                mw.html.element("a", {
                    "id": "disableCode-a",
                    "href": "#",
                    "title": $i18n.msg("title").plain()
                }, $i18n.msg("title").plain()) +
                mw.html.element("ul", {
                    "id": "disableCode-menu",
                    "class": "tools-menu",
                })
            ));

            jQuery(".toolbar .tools").prepend($container).click(function () {
                jQuery("#disableCode-menu").slideToggle("fast");
            });

            this.addItems($assembledItems);
        },

        /**
         * @method init
         * @description Main method of the program, this function constructs
         *              each of the list elements, includes them in a
         *              <code>String</code> array, and passes that array to the
         *              proper skin-specific handler method.
         * @param {JSON} $lang
         * @returns {void}
         */
        init: function ($lang) {
            var that = this;
            var $assembledItems = [];

            $lang.useUserLang();
            $i18n = $lang;

            this.parameters = [
                {
                    param: "reset-parameters",
                    title: $i18n.msg("reset").plain()
                },
                {
                    param: "useuserjs",
                    title: $i18n.msg("userJS").plain()
                },
                {
                    param: "useusercss",
                    title: $i18n.msg("userCSS").plain()
                },
                {
                    param: "usesitejs",
                    title: $i18n.msg("siteJS").plain()
                },
                {
                    param: "usesitecss",
                    title: $i18n.msg("siteCSS").plain()
                }
            ];

            this.parameters.forEach(function ($item) {
                $assembledItems.push(
                    that.constructItem($item.title, $item.param)
                );
            });

            switch (wk.skin) {
            case "oasis":
            case "wikia":
                this.handlerOasis($assembledItems);
                break;
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                this.handlerMonobook($assembledItems);
                break;
            }
        }
    };

    mw.hook("dev.i18n").add(function ($i18n) {
        jQuery.when(
            $i18n.loadMessages("DisableCode"),
            mw.loader.using("mediawiki.util")
        ).done(jQuery.proxy(DisableCode.init, DisableCode));
    });
});
