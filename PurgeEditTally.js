/**
 * PurgeEditTally.js
 * @file For whatever reason, the Oasis user page masthead edit count tally
 *       (try saying that quickly) does not update itself quickly the way the
 *       contribs page tally does. This script forces a purge upon navigating to
 *       a user page in Oasis.
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "jQuery"
 * @external "wikia.ui.factory"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk */
 
require(["mw", "wikia.window"], function (mw, wk) {
    "use strict";
 
    if (
        !jQuery("#UserProfileMasthead").exists() ||
        wk.wgNamespaceNumber !== 2
    ) {
        return;
    }
 
    var PurgeEditTally = {
        reload: function () {
            jQuery(".contributions-details")
                .load(
                    window.location.href + " .contributions-details > *",
                    function () {
                        mw.hook("refreshedMasthead").fire();
                    }
                );
        },
        purgePage: function () {
            var that = this;
 
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "purge",
                    titles: wk.wgPageName
                }
            }).done(function () {
                that.reload();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(PurgeEditTally.purgePage, PurgeEditTally)
    );
});