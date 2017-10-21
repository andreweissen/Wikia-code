/**
 * ContribsLink.js
 * @file Personal variant of script by KnazO <dev.wikia.com/wiki/User:KnazO>
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window */
 
mw.loader.using("mediawiki.util").then(function () {
    "use strict";
 
    if (
        window.isContribsLinkLoaded ||
        jQuery("#bl-contributions").exists() ||
        jQuery("a[data-tracking-label='account.contributions']").exists() ||
        !jQuery(".wds-global-navigation__content-bar").exists()
    ) {
        return;
    }
    window.isContribsLinkLoaded = true;
 
    var ContribsLink = {
        constructItem: function ($text) {
            return mw.html.element("li", {
                "id": "contributionsLink"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "class": "wds-global-navigation__dropdown-link",
                    "data-tracking-label": "account.contributions",
                    "href": mw.util.getUrl("Special:MyContributions"),
                    "title": $text
                }, $text)
            ));
        },
        init: function () {
            var $text = window.contribsLinksText || "My Contributions";
            var $element = this.constructItem($text)
 
            jQuery(
                ".wds-global-navigation__user-menu " +
                "div:nth-child(2) ul li:nth-child(2)"
            ).after($element);
        }
    };
 
    mw.hook("wikipage.content").add(
        jQuery.proxy(ContribsLink.init, ContribsLink)
    );
});