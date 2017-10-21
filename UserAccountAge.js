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
 
    var UserAccountAge = {
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
        getUserData: function ($user, callback) {
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "query",
                    list: "users|usercontribs",
                    usprop: "registration",
                    ususers: $user,
                    uclimit: 1,
                    ucprop: "timestamp",
                    ucuser: $user,
                    format: "json"
                }
            }).done(function ($data) {
                if (!$data.error) {
                    callback($data);
                }
            });
        },
        handleUserData: function ($data) {
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
                    "&usprop=registration&uclimit=1&ucprop=timestamp&ususers=" +
                    $data.query.users[0].name;
 
            var $userTag = UserAccountAge.constructElement($date, $address);
 
            mw.util.addCSS("#userAccountAge-a {color:inherit !important;}");
            jQuery(".masthead-info hgroup").append($userTag);
            jQuery(".timeago").timeago();
 
        },
        init: function () {
            var $user = jQuery(".UserProfileMasthead .masthead-info h1").text();
            this.getUserData($user, this.handleUserData);
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(UserAccountAge.init, UserAccountAge)
    );
});