/**
 * CodeQuickLinks/code.js
 * @file Adds modules containing quick links to personal and wiki code files
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

    if (window.isCodeQuickLinksLoaded) {
        return;
    }
    window.isCodeQuickLinksLoaded = true;

    if (!window.dev || !window.dev.i18n) {
        wk.importArticle({
            type: "script",
            article: "u:dev:MediaWiki:I18n-js/code.js"
        });
    }
    var $i18n;

    var CodeQuickLinks = {

        /**
         * @method assemblePageNames
         * @description The beating heart of the program, this method returns an
         *              object containing arrays of assembled file objects, each
         *              with a display name and a correctly assemble address.
         * @param {Object} $fileNames - Object of two string arrays
         * @returns {Object} $files - Object containing file arrays, user/wiki
         */
        assemblePageNames: function ($fileNames) {
            var $suffixes = [".css", ".js"];
            var $files = {
                siteFiles: [],
                userFiles: []
            };

            // Yep, this really happened
            jQuery.each($fileNames, function ($key, $value) {
                if ($key === "standard") {
                    $value.forEach(function ($file) {
                        jQuery.each($files, function ($_key, $_value) {
                            var $prefix = ($_key === "siteFiles")
                                ? "MediaWiki:"
                                : "Special:MyPage/";
                            $suffixes.forEach(function ($suffix) {
                                // Only 4 nested for loops? We must go deeper...
                                var $completeFile = {};
                                $completeFile.name = $file + $suffix;
                                $completeFile.href =
                                    mw.util.getUrl(
                                        $prefix + $file.toLowerCase() + $suffix
                                    );
                                $files[$_key].push($completeFile);
                            });
                        });
                    });
                } else {
                    $value.forEach(function ($file) {
                        var $fileObject;
                        var $prefix;
                        switch ($file) {
                        case "Global":
                            $suffixes.forEach(function ($suffix) {
                                $fileObject = {};
                                $fileObject.name = $file + $suffix;
                                $fileObject.href =
                                    "//c" + wk.wgCookieDomain +
                                    wk.wgArticlePath.replace(
                                        "$1",
                                        "Special:MyPage/" +
                                            $file.toLowerCase() + $suffix
                                    );
                                $files.userFiles.push($fileObject);
                            });
                            break;
                        case "ImportJS":
                        case "JSPages":
                            $prefix = ($file === "ImportJS")
                                ? "MediaWiki:"
                                : "Special:";
                            $fileObject = {};
                            $fileObject.name = $file;
                            $fileObject.href = mw.util.getUrl($prefix + $file);
                            $files.siteFiles.push($fileObject);
                            break;
                        }
                    });
                }
            });

            // Alphabetically sorting the array names
            jQuery.each($files, function ($key, $value) {
                $value.sort(function ($a, $b) {
                    return $a.name.localeCompare($b.name);
                });
            });

            return $files;
        },

        /**
         * @method returnNode
         * @description Returns the proper node to which the rail module or
         *              portlets are to be prepended. Also sets the skin family
         *              depending on user's skin.
         * @returns {string}
         */
        returnNode: function () {
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                this.skinFamily = "oasis";
                return "#WikiaRail";
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                this.skinFamily = "monobook";
                return "#column-one";
            }
        },

        /**
         * @method constructListElement
         * @description Method constructs an individual list element to be
         *              appended to a subSection element.
         * @param {string} $text
         * @param {string} $href
         * @returns {string}
         */
        constructListElement: function ($text, $href) {
            return mw.html.element("li", {
                "class": "cql-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "class": "cql-a",
                    "href": $href,
                    "title": $text
                }, $text)
            ));
        },

        /**
         * @method constructSubSection
         * @description This method accepts a fair few parameters so as to
         *              expand its use to both Oasis and Monobook. In Monobook,
         *              this method assembles portlets to be added to the
         *              sidebar; in Oasis, these are added to the rail module.
         * @param {string} $outerDivClass
         * @param {string} $outerDivId
         * @param {string} $heading - either h4 or h5
         * @param {string} $text
         * @param {string} $innerDivClass
         * @param {string} $innerDivId
         * @returns {string}
         */
        constructSubSection: function (
            $outerDivClass,
            $outerDivId,
            $heading,
            $text,
            $innerDivClass,
            $innerDivId
        ) {
            return mw.html.element("div", {
                "class": $outerDivClass,
                "id": $outerDivId
            }, new mw.html.Raw(
                mw.html.element($heading, {}, $text) +
                mw.html.element("div", {
                    "class": $innerDivClass,
                    "id": $innerDivId
                }, new mw.html.Raw(
                    mw.html.element("ul", {})
                ))
            ));
        },

        /**
         * @method constructRailModule
         * @description Assembles a rail module for use in the Oasis skin. Is
         *              not used in Monobook.
         * @param {string} $text
         * @returns {string}
         */
        constructRailModule: function ($text) {
            return mw.html.element("section", {
                "class": "rail-module",
                "id": "cql-module"
            }, new mw.html.Raw(
                mw.html.element("h2", {}, $text) +
                mw.html.element("div", {
                    "id": "cql-module-content"
                })
            ));
        },

        /**
         * @method injectOasisCSS
         * @description Based on the previous incarnation of the script, this
         *              method adds some custom rail module styling in Oasis.
         * @returns {void}
         */
        injectOasisCSS: function () {
            mw.util.addCSS(
                "#cql-module {" +
                    "margin: 0;" +
                    "border:none;" +
                    "padding: 20px 15px 15px;" +
                    "position: relative;" +
                "}" +
                "#cql-module:after {" +
                    "clear: both;" +
                    "content: ' ';" +
                    "display: block;" +
                    "height: 0;" +
                "}" +
                "#cql-module-userFiles-outer {" +
                    "float:left;" +
                "}" +
                "#cql-module-siteFiles-outer {" +
                    "float:right;" +
                "}" +
                "#cql-module-content {" +
                    "margin-top:-10px;" +
                "}" +
                ".cql-li {" +
                    "margin:5px;" +
                "}" +
                ".cql-a {" +
                    "font-size: 12px;" +
                    "font-weight: bold;" +
                "}" +
                ".cql-module-outerDiv h4 {" +
                    "font-size:14px;" +
                "}"
            );
        },

        /**
         * @method main
         * @description Method coordinates the central action of the script,
         *              assembling various elements based on skin and such.
         * @param {JSON} $lang
         * @returns {void}
         */
        main: function ($lang) {
            var that = this;

            $lang.useUserLang();
            $i18n = $lang;

            var $config;
            var $fileNames;
            var $extraLinks;
            var $assembledFiles;
            var $location = this.returnNode();

            $fileNames = {
                standard: [
                    "Chat",
                    "Common",
                    "Monobook",
                    "Wikia"
                ],
                custom: [
                    "Global",
                    "ImportJS",
                    "JSPages"
                ]
            };

            $config = jQuery.extend(
                {
                    replaceAllDefaultLinks: false,
                    linkSet: {}
                },
                window.customCodeQuickLinks
            );

            if ($config.replaceAllDefaultLinks) {
                $assembledFiles = $config.linkSet;
            } else {
                $assembledFiles = this.assemblePageNames($fileNames);
                $extraLinks = $config.linkSet;

                Object.keys($extraLinks).forEach(function ($array) {
                    $extraLinks[$array].forEach(function ($link) {
                        $assembledFiles[$array].push($link);
                    });
                });
            }

            if (this.skinFamily === "oasis") {
                var $railModule = this.constructRailModule(
                    $i18n.msg("title").plain());
                jQuery($location).prepend($railModule);

                this.injectOasisCSS();
                $location = "#cql-module-content";
            }

            // Pretty sure a bit of my soul died here
            jQuery.each($assembledFiles, function ($key, $value) {
                var $column = that.constructSubSection(
                    (that.skinFamily === "oasis")
                        ? "cql-module-outerDiv"
                        : "portlet",
                    "cql-module-" + $key + "-outer",
                    (that.skinFamily === "oasis")
                        ? "h4"
                        : "h5",
                    ($key === "userFiles")
                        ? $i18n.msg("personal").plain()
                        : $i18n.msg("local").plain(),
                    (that.skinFamily === "oasis")
                        ? "cql-module-innerDiv"
                        : "pBody",
                    "cql-module-" + $key + "-inner"
                );
                jQuery($location).prepend($column);
            });

            // More nested loops
            jQuery.each($assembledFiles, function ($key, $value) {
                $value.forEach(function ($file) {
                    var $item =
                        that.constructListElement($file.name, $file.href);

                    jQuery("#cql-module-" + $key + "-inner ul").append($item);
                });
            });
        }
    };

    mw.hook("dev.i18n").add(function ($i18n) {
        jQuery.when(
            $i18n.loadMessages("CodeQuickLinks"),
            mw.loader.using("mediawiki.util")
        ).done(jQuery.proxy(CodeQuickLinks.main, CodeQuickLinks));
    });
});
