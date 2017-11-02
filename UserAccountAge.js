/**
 * UserAccountAge/code2.js
 * @file Appends user tag with time since account's creation
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

    if (!jQuery("#UserProfileMasthead").exists() || window.isUAALoaded) {
        return;
    }
    window.isUAALoaded = true;

    /**
     * @class UserAccountAge
     * @classdesc The main obj literal
     */
    var UserAccountAge = {

        /**
         * @method constructElement
         * @description Method returns a string of assembled HTML, in this case,
         *              a user tag linking to a bit of JSON displaying the
         *              user's date of creation and userid.
         * @param {string} $text
         * @param {string} $address
         * @returns {string}
         */
        constructElement: function ($text, $address) {
            return mw.html.element("span", {
                "class": "tag",
                "id": "userAccountAge-span"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "userAccountAge-a",
                    "class": "timeago",
                    "href": $address,
                    "title": $text
                }, $text)
            ));
        },

        /**
         * @method getUserData
         * @description This method retrieves the user's data pertaining to the
         *              user's date of registration. Previously made call to
         *              <tt>usercontribs</tt> for no apparent reason.
         * @param {string} $user
         * @param {function} callback
         * @returns {void}
         */
        getUserData: function ($user, callback) {
            var that = this;
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "query",
                    list: "users",
                    usprop: "registration",
                    ususers: $user,
                    format: "json"
                }
            }).done(function ($data) {
                if (!$data.error) {
                    callback(that, $data);
                }
            });
        },

        /**
         * @method handleUserData
         * @description handleUserData deals with the data, handling cases
         *              wherein the API has no proper data to return regarding a
         *              user and appending the user tag to the masthead.
         * @param {this} that
         * @param {Object} $data
         * @returns {void}
         */
        handleUserData: function (that, $data) {
            if (
                $data.query.users[0].registration === null ||
                $data.query.users[0].hasOwnProperty("missing") ||
                $data.query.users[0].hasOwnProperty("invalid")
            ) {
                return;
            }

            var $date = new Date($data.query.users[0].registration).toString();
            $date = $date.slice(0, 3) + ", " + $date.slice(4, 15) + ", " +
                    $date.slice(16, 24);

            var $address = wk.wgScriptPath +
                    "/api.php?format=jsonfm&action=query&list=users" +
                    "&usprop=registration&ususers=" + $data.query.users[0].name;

            var $userTag = that.constructElement($date, $address);

            mw.util.addCSS("#userAccountAge-a {color:inherit !important;}");
            jQuery(".masthead-info hgroup").append($userTag);
            jQuery(".timeago").timeago();
        },

        /**
         * @method init
         * @description Method grabs the user's masthead text user name, and
         *              uses it to retrieve the user data.
         * @returns {void}
         */
        init: function () {
            var $user = jQuery(".UserProfileMasthead .masthead-info h1").text();
            this.getUserData($user, this.handleUserData);
        }
    };

    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(UserAccountAge.init, UserAccountAge)
    );
});
