/**
 * ToolbarLinks.js
 * @file Enables addition of custom toolbar links
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "wikia.window"
 * @external "jQuery"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require */
 
require(["mw", "wikia.window"], function (mw, wk) {
    "use strict";
 
    var ToolbarLinks = {
        createToolbarLink: function ($linkText, $address) {
            var $href;
 
            if (arguments.length === 2) {
                $href = wk.wgArticlePath.replace("$1", $address);
            } else {
                $href = "#";
            }
 
            return mw.html.element("li", {
                "class": "overflow"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    title: $linkText,
                    href: $href
                }, $linkText)
            ));
        },
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
        constructLink: function ($address, $linkText) {
            var $element = this.createToolbarLink($linkText, $address);
 
            jQuery($element).appendTo(this.desiredNode);
        },
        importScript: function ($script, $linkText) {
            var $element = this.createToolbarLink($linkText);
 
            jQuery($element).appendTo(this.desiredNode).click(function () {
                wk.importScriptPage($script, "dev");
                jQuery(this).remove();
            });
        },
        init: function () {
            if (!window.customToolbarLinks || window.isToolbarLinksLoaded) {
                return;
            }
            window.isToolbarLinksLoaded = true;
            ToolbarLinks.desiredNode = ToolbarLinks.returnNode();
 
            window.customToolbarLinks.forEach(function ($link) {
                if ($link.action === "link") {
                    ToolbarLinks.constructLink($link.address, $link.title);
                } else if ($link.action === "import") {
                    ToolbarLinks.importScript($link.script, $link.title);
                }
            });
        }
    };
 
    jQuery(ToolbarLinks.init);
});