/**
 * UploadModal.js
 * @file Expands advanced options and inserts template into image summary
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
 
    // Forbid loading on pages that aren't Special:Images or if script is loaded
    if (wk.wgPageName !== "Special:Images" || window.isUploadModalLoaded) {
        return;
    }
    window.isUploadModalLoaded = true;
 
    /**
     * @class UploadModal
     * @classdesc The main upload modal object literal
     */
    var UploadModal = {
 
        /**
         * @method main
         * @description Inserts contents of Template:Information into the
         *              textarea of the upload modal
         * @returns {void}
         */
        main: function () {
            if (jQuery("#UploadPhotosWrapper").exists()) {
                clearInterval(this.interval);
                jQuery("textarea[name='wpUploadDescription']").val(
                    "== Summary ==\n" +
                    "{{Information\n" +
                    "|attention=\n" +
                    "|description=\n" +
                    "|source=\n" +
                    "|author=\n" +
                    "|filespecs=\n" +
                    "|licensing=\n" +
                    "|other versions=\n" +
                    "|cat licensee=\n" +
                    "|cat subject=\n" +
                    "|cat type=\n" +
                    "}}"
                );
            }
        },
 
        /**
         * @method init
         * @description Handles "Add new photo" clicks, adjusts the CSS of the
         *              advanced options area, and hides the default
                        expand/close toggle
         * @returns {void}
         */
        init: function () {
            var that = this;
 
            jQuery("#page-header-add-new-photo").click(function () {
                mw.util.addCSS(
                    ".UploadPhotos .options {" +
                        "display: block !important;" +
                    "}" +
                    ".UploadPhotos .options textarea {" +
                        "height: 8em !important;" +
                    "}" +
                    ".UploadPhotos .advanced {" +
                        "display: none !important;" +
                    "}"
                );
 
                that.interval = setInterval(jQuery.proxy(that.main, that), 100);
            });
        }
    };
 
    // Util module is required for script CSS to function
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(UploadModal.init, UploadModal)
    );
});