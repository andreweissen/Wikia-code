/**
 * AnonLookup.js
 * @file Acquires data on selected IP addresses
 * @author Eizen <dev.wikia.com/wiki/User_talk:Eizen>
 * @external "mediawiki.util"
 * @external "jQuery"
 * @external "wikia.ui.factory"
 * @external "wikia.window"
 * @external "mw"
 */
 
/*jslint browser, this:true */
/*global mw, jQuery, window, require, wk, ui */
 
require(["mw", "wikia.window", "wikia.ui.factory"], function (mw, wk, ui) {
    "use strict";
 
    if (jQuery("#AnonLookup-li").exists() || window.isAnonLookupLoaded) {
        return;
    }
    window.isAnonLookupLoaded = true;
 
    var $i18n = {
        "en": {
            script: "AnonLookup",
            summary: "As this script uses an external API for anon data, " +
                "please restrict data queries to 150 per minute.",
            buttonCancel: "Close",
            buttonClear: "Clear",
            buttonSubmit: "Submit",
            modalInput: "Input an IP address",
            error: "ERROR: Data query failed",
            isp: "ISP",
            city: "City",
            region: "Region",
            country: "Country"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    var AnonLookup = {
        modalHTML: 
            "<div id='AnonLookup-modal-changes' class='WikiaArticle diff'>" +
                "<div id='AnonLookup-modal-summary'>" + $lang.summary + "</div>" +
                "<hr><br />" +
                "<textarea id='AnonLookup-modal-input' placeholder='" +
                    $lang.modalInput +
                "'/>" +
                "<br />" +
                "<div id='AnonLookup-modal-changes-div'></div>" +
            "</div>",
        returnNode: function () {
            switch (wk.skin) {
            case "oasis":
            case "wikia":
                return "#my-tools-menu";
            case "monobook":
            case "wowwiki":
            case "uncyclopedia":
                return "#p-tb ul";
            }
        },
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "AnonLookup-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "AnonLookup-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },
        displayModal: function () {
            mw.util.addCSS(
                "#AnonLookup-modal-input {" +
                    "width: 98%;" +
                "}" +
                "#AnonLookup-modal-changes-div {" +
                    "height: 100px;" +
                    "width: auto;" +
                    "border: 1px solid #808080;" +
                    "border-color: rgb(169, 169, 169);" +
                    "font-family: monospace;" +
                    "background: #fff;" +
                    "color: #808080;" +
                    "overflow: scroll;" +
                    "padding:5px;" +
                "}"
            );
 
            ui.init(["modal"]).then(function (modal) {
                var config = {
                    vars: {
                        id: "AnonLookup-modal",
                        size: "small",
                        title: $lang.script,
                        content: AnonLookup.modalHTML,
                        buttons: [
                            {
                                vars: {
                                    value: $lang.buttonCancel,
                                    classes: [
                                        "normal",
                                        "primary"
                                    ],
                                    data: [
                                        {
                                            key: "event",
                                            value: "cancel"
                                        }
                                    ]
                                }
                            },
                            {
                                vars: {
                                    value: $lang.buttonClear,
                                    classes: [
                                        "normal",
                                        "primary"
                                    ],
                                    data: [
                                        {
                                            key: "event",
                                            value: "clear"
                                        }
                                    ]
                                }
                            },
                            {
                                vars: {
                                    value: $lang.buttonSubmit,
                                    classes: [
                                        "normal",
                                        "primary"
                                    ],
                                    data: [
                                        {
                                            key: "event",
                                            value: "submit"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                };
 
                modal.createComponent(config, function (AnonLookupModal) {
                    AnonLookupModal.bind("cancel", function () {
                        AnonLookupModal.trigger("close");
                    });
 
                    AnonLookupModal.bind("clear", function () {
                        jQuery("#AnonLookup-modal-input").val("");
                        jQuery("#AnonLookup-modal-changes-div").empty();
                    });
 
                    AnonLookupModal.bind("submit", function () {
                        var $ip = jQuery("#AnonLookup-modal-input")[0].value;
                        AnonLookup.getData($ip, AnonLookup.handleData);
                    });
 
                    AnonLookupModal.show();
                });
            });
        },
        getData: function ($ipAddress, callback) {
            jQuery.ajax({
                type: "GET",
                dataType: "jsonp",
                url: "http://ip-api.com/json/" + $ipAddress
            }).done(function ($data) {
                if ($data.status !== "fail") {
                    callback($data);
                } else {
                    jQuery("#AnonLookup-modal-changes-div").prepend(
                        "<span>" + $lang.error + "</span><hr>"
                    );
                }
            });
        },
        handleData: function ($data) {
            var $geoData = [
                {
                    text: $lang.isp,
                    data: $data.isp
                },
                {
                    text: $lang.city,
                    data: $data.city
                },
                {
                    text: $lang.region,
                    data: $data.regionName
                },
                {
                    text: $lang.country,
                    data: $data.country
                },
            ];
 
            var $resultsHTML =
                    "<div class='AnonLookup-modal-results'></div><hr>";
 
            jQuery("#AnonLookup-modal-changes-div").prepend($resultsHTML);
 
            $geoData.forEach(function ($entry) {
                jQuery(
                    "<span>" +
                        $entry.text + ": " + $entry.data +
                    "</span><br />"
                )
                    .appendTo(".AnonLookup-modal-results");
            });
        },
        init: function () {
            var that = this;
            var $desiredNode = this.returnNode();
            var $element = this.constructItem($lang.script);
 
            jQuery($element).prependTo($desiredNode).click(function () {
                that.displayModal();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(AnonLookup.init, AnonLookup)
    );
});