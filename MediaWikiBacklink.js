/**
 * MediaWikiBacklink/code.js
 * @file Adds backlink to doc page from MediaWiki page if it exists
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.window"
 * @external "mw"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk */

require(["jquery", "mw", "wikia.window"], function (jQuery, mw, wk) {
    "use strict";

    if (wk.wgNamespaceNumber !== 8 || window.isMWBacklinkLoaded) {
        return;
    }
    window.isMWBacklinkLoaded = true;

    /**
     * @class MediaWikiBacklink
     * @classdesc The main MediaWikiBacklink class
     */
    var MediaWikiBacklink = {

        /**
         * @method getData
         * @description Method retrieves data pertaining to the pages linking to
         *              the MediaWiki page in question and passes that to the
         *              handler.
         * @param {function} callback
         * @returns {void}
         */
        getData: function (callback) {
            var that = this;

            this.api.get({
                action: "query",
                list: "backlinks",
                bltitle: wk.wgPageName,
                blnamespace: 0,
                format: "json"
            }).done(function ($data) {
                if (!$data.error) {
                    callback($data, that);
                }
            });
        },

        /**
         * @method handleData
         * @description Method handler deals with included data and appends a
         *              link to the most relevant mainspace page if it exists.
         *              Originally, there was a bit more nuance in terms of
         *              appearance, depending on the skin being used to view the
         *              MediaWiki page. However, in the interest of simplicity,
         *              much of that has been removed.
         * @param {JSON} $data
         * @param {this} that
         * @returns {void}
         */
        handleData: function ($data, that) {
            var $target;
            var $html;

            $data.query.backlinks.forEach(function ($link) {
                if ($link.ns === 0 && (
                    $link.title === that.redacted ||
                    $link.title.replace(/ /g, "_") === that.redacted)
                ) {
                    $html = "&lt; <a href='" + mw.util.getUrl($link.title) +
                        "' title='" + $link.title + "'>" + $link.title + "</a>";

                    if (wk.skin === "oasis") {
                        $html = $html + " | ";
                        $target = "#PageHeader .page-header__page-subtitle";
                    } else {
                        $target = "#bodyContent";
                    }

                    jQuery($target).prepend($html);
                }
            });
        },

        /**
         * @method init
         * @description init method initializes new <code>mw.Api</code> instance
         *              and invokes the <code>getData</code> method. Redacted
         *              <code>wgPageName</code> value using regex allows for
         *              selection of proper doc page to link back to. It is
         *              assumed the code page is stored in a location that
         *              follows Dev Wiki naming conventions, i.e.
         *              <code>MediaWiki:ExampleScript.js</code> or
         *              <code>MediaWiki:ExampleScript/code.js</code>.
         * @returns {void}
         */
        init: function () {
            this.api = new mw.Api();
            this.redacted = wk.wgPageName.split(/:(.+)/)[1].split(/[\/.]+/)[0];
            this.getData(this.handleData);
        }
    };

    mw.loader.using(["mediawiki.util", "mediawiki.api"]).then(
        jQuery.proxy(MediaWikiBacklink.init, MediaWikiBacklink)
    );
});
