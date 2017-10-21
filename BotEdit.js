/**
 * BotEdit.js
 * @file Source editor popup but with moar <code>bot:true</code> ( ͡◉ ͜ʖ ͡◉)
 *       Still in testing phase; use with caution
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.ui.factory"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser */
/*global mw, jQuery, window, require, wk, ui */
 
require(["mw", "wikia.window", "wikia.ui.factory"], function (mw, wk, ui) {
    "use strict";
 
    if (window.isBotEditLoaded) {
        return;
    }
    window.isBotEditLoaded = true;
 
    var $i18n = {
        "en": {
            submit: "Submit",
            cancel: "Cancel",
            script: "BotEdit",
            reloadText: "Reloading...",
            successBanner: "Edit successfully published!",
            errorBanner: "Error encountered!"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    var BotEdit = {
        modalHTML: 
            "<div id='BotEdit-modal-changes' class='WikiaArticle diff'>" +
                "<textarea id='BotEdit-modal-changes-ta'/>" +
            "</div>",
        showBanner: function ($message, $status) {
            var $statusClass = ($status === "error"
                ? "error"
                : "confirm");
            new wk.BannerNotification($message, $statusClass).show();
        },
        partialReload: function () {
            jQuery("#mw-content-text")
                .load(
                    window.location.href + " #mw-content-text > *",
                    function () {
                        jQuery(".WikiaArticle").stopThrobbing();
                        jQuery("#mw-content-text").fadeToggle(3000);
                    }
                );
        },
        postContent: function ($content, $timestamp, $starttimestamp, $token) {
            jQuery.ajax({
                type: "POST",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "edit",
                    bot: true,
                    minor: true,
                    title: wk.wgPageName,
                    text: $content,
                    basetimestamp: $timestamp,
                    startimestamp: $starttimestamp,
                    token: $token
                }
            }).success(function ($data) {
                BotEdit.showBanner($lang.successBanner, "confirm");
                BotEdit.partialReload();
            }).fail(function ($data) {
                BotEdit.showBanner($lang.errorBanner, "error");
                BotEdit.partialReload();
            });
        },
        constructItem: function ($text) {
            return mw.html.element("li", {
                "id": "BotEdit-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "BotEdit-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },
        displayModal: function ($text, $timestamp, $starttimestamp, $token) {
            mw.util.addCSS(
                "#BotEdit-modal-changes-ta {" +
                    "font-family: monospace;" +
                    "height: 300px;" +
                    "width: 100%;" +
                    "padding: 0;" +
                "}"
            );
 
            ui.init(["modal"]).then(function (modal) {
                var config = {
                    vars: {
                        id: "BotEdit-modal",
                        size: "medium",
                        title: $lang.script + ": "
                                + wk.wgPageName.replace(/_/g, " "),
                        content: BotEdit.modalHTML,
                        buttons: [{
                            vars: {
                                value: $lang.cancel,
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "cancel"
                                }]
                            }
                        }, {
                            vars: {
                                value: $lang.submit,
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "submit"
                                }]
                            }
                        }]
                    }
                };
 
                modal.createComponent(config, function (botModal) {
                    botModal.bind("cancel", function () {
                        botModal.trigger("close");
                        BotEdit.partialReload();
                    });
 
                    botModal.bind("submit", function () {
                        $text = jQuery("#BotEdit-modal-changes-ta").val();
                        botModal.trigger("close");
                        BotEdit.postContent(
                            $text,
                            $timestamp,
                            $starttimestamp,
                            $token
                        );
                    });
 
                    botModal.show();
                    jQuery("#BotEdit-modal-changes-ta").html($text);
                });
            });
        },
        getWikitext: function (callback) {
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "query",
                    prop: "info|revisions",
                    intoken: "edit",
                    titles: wk.wgPageName,
                    rvprop: "content|timestamp",
                    rvlimit: "1",
                    indexpageids: "true",
                    format: "json"
                }
            }).done(function ($data) {
                if (!$data.error) {
                    callback($data);
                }
            });
        },
        handleWikitext: function ($data) {
            var $result = $data.query.pages[wk.wgArticleId];
            var $text = $result.revisions[0]["*"];
            var $timestamp = $result.revisions[0].timestamp;
            var $startstamp = $result.starttimestamp;
            var $token = $result.edittoken;
 
            BotEdit.displayModal($text, $timestamp, $startstamp, $token);
        },
        init: function () {
            var that = this;
            var $element = this.constructItem($lang.script);
 
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                jQuery($element).prependTo("#my-tools-menu");
                break;
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                jQuery($element).appendTo("#p-tb ul");
                break;
            }
 
            jQuery("#BotEdit-a").click(function () {
                jQuery("#mw-content-text").fadeToggle(1400);
                jQuery(".WikiaArticle").startThrobbing();
                jQuery("#mw-content-text")
                        .html("<img id='BotEdit-throbber' src='" +
                        wk.stylepath + "/common/images/ajax.gif' /> " +
                        $lang.reloadText);
 
                that.getWikitext(that.handleWikitext);
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(BotEdit.init, BotEdit)
    );
});