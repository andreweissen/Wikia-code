/**
 * @name:           SelectiveDelete
 * @description:    Only deletes pages created by specific user(s) from category(s)
 * @author:         Count of Howard <dev.wikia.com/wiki/User:Count_of_Howard>
 * @date:           27/04/17
 * @notes:          User-requested script to aid in targeted deletion
 */

/*
 * Author's Note (10/21/17)
 *
 * It is worth pointing out that this script was created prior to the author's implementation of his
 * personal coding styleguide and as such may appear sloppier and messier than other scripts
 * displayed here.
 */

/* jshint browser:true, jquery:true, bitwise:false, laxbreak:true, laxcomma:true, smarttabs:true */
/* global mediaWiki, console */
 
(function ($, mw) {
    "use strict";
 
    // Prevent double loading
    if($("#sd-item").length !== 0) {
        return;
    }
 
    var config = mw.config.get([
            "skin",
            "wgUserLanguage",
            "wgUserGroups"
        ]),
        i18n = { // Remember to leave the variable placeholder $1 in your translations
            "en": { // English
                scriptTitle: "SelectiveDelete",
                deletionReason: "Deleting pages via $1",
                modalCategoryTitle: "Enter category names separated by new lines",
                modalCategoryPlaceholder: "Format as \"Category:Example\" or \"Example\"",
                modalUserTitle: "Enter usernames separated by new lines",
                modalUsersPlaceholder: "Format as \"User:Example\" or \"Example\"",
                modalLog: "SelectiveDelete Log",
                modalButtonCancel: "Cancel",
                modalButtonClear: "Reset",
                modalButtonDelete: "Delete",
                logBeginningProcess: "Gathering data...",
                logErrorCannotDelete: "Error: Only admins and content moderators may use SelectiveDelete.",
                logErrorAPIError: "Error: Script has encountered MediaWiki API error $1",
                logErrorEmptyCat: "Error: $1 is empty or does not exist.",
                logErrorNoMatch: "Error: There are no pages matching the category/user input.",
                logDeletionFailure: "Error: $1 was unable to be deleted.",
                logDeletionSuccess: "Success: $1 was deleted!"
            }
        },
        lang = $.extend(
            i18n.en,
            i18n[config.wgUserLanguage.split("-")[0]],
            i18n[config.wgUserLanguage]
        ),
        canDelete = /(sysop|content-moderator|staff|helper|vstf)/.test(config.wgUserGroups.join(" ")),
        deletionDelay = window.selectiveDeleteDelay || 1000, // 1 sec default delay between deletions
        membersMax = window.selectiveDeleteMembersMax || 100, // 100 pages returned from API call
        modalHTML =
            "<form id='sd-modal-form' class='WikiaForm'>" +
                "<div id='modalHeader'><h2>" + lang.scriptTitle + "</h2></div>" +
                "<hr>" +
                "<fieldset>" +
                    "<br />" +
                    "<p>" + lang.modalCategoryTitle +
                        "<br />" +
                        "<textarea id='sd-cat-value' placeholder='"+ lang.modalCategoryPlaceholder + "'/>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + lang.modalUserTitle +
                        "<br />" +
                        "<textarea id='sd-user-value' placeholder='" + lang.modalUsersPlaceholder + "'/>" +
                        "<br />" +
                    "</p>" +
                "</fieldset>" +
                "<br />" +
                "<hr>" +
            "</form>" +
            "<p>" + lang.modalLog + "</p>" +
            "<div id='sd-log'></div>";
 
    // Globals declarations
    var validatedUsers,         // Array of validated usernames
        validatedCategories,    // Array of validated categories
        numCatMembers,          // Integer count of pages in present category
        categoriesCounter,      // Current category number
        membersCounter,         // Current member page number
        markedPages;            // Array of pages marked for deletion
 
    // Globals definitions, initial default values
    numCatMembers = 0;
    categoriesCounter = 0;
    membersCounter = 0;
    markedPages = [];
 
    /*
     * init simply places the HTML item and link on the page depending on the skin
     * used to view the page.
     * Oasis:       Appends item to bottom user toolbar
     * Monobook:    Appends item to toolbox module on left-hand side
     */
    function init() {
        var sdItem = mw.html.element("li", {
            id: "sd-item",
            class: "overflow"
        }, new mw.html.Raw(
            mw.html.element("a", {
                href: "#",
                title: lang.scriptTitle,
                id: "sd-item-a"
            }, lang.scriptTitle)
        ));
 
        switch (config.skin) {
            case "oasis":
            case "wikia":
                $(sdItem).appendTo(".toolbar .tools");
                break;
            case "monobook":
            case "uncyclopedia":
            case "wowwiki":
                $(sdItem).appendTo("#p-tb ul");
                break;
        }
 
        $("#sd-item").click(function () {
            modalWindow();
        });
    }
 
    /*
     * This function simply displays the UI modal that serves as the means by
     * which the user interacts with the script and inputs data.
     */
    function modalWindow() {
        mw.util.addCSS(
            "#sd-cat-value," +
            "#sd-user-value {" +
                "height: 100px;" +
                "width: 100%;" +
                "padding: 0;" +
                "overflow: scroll;" +
            "}" +
            "#sd-log {" +
                "height: 100px;" +
                "width: 98%;" +
                "border: 1px solid black;" +
                "font-family: monospace;" +
                "background: #fff;" +
                "color: #aeaeae;" +
                "overflow: scroll;" +
                "padding:5px;" +
            "}"
        );
 
        // UI modal
        $.showCustomModal(
            lang.itemTitle,
            modalHTML,
            {
                id: "sd-modal-window",
                width: 500,
                buttons: [
                    {
                        id: "sd-cancel-button",
                        message: lang.modalButtonCancel,
                        handler: function() {
                            $("#sd-modal-window").closeModal();
                            console.log(lang.scriptTitle + " " + lang.modalButtonCancel);
                        }
                    },
                    {
                        id: "sd-reset-button",
                        message: lang.modalButtonClear,
                        handler: function() {
                            $("#sd-modal-form")[0].reset();
                            console.log(lang.scriptTitle + " " + lang.modalButtonClear);
                        }
                    },
                    {
                        id: "sd-delete-button",
                        message: lang.modalButtonDelete,
                        handler: deletionButtonHandler
                    }
                ]
            }
        );
    }
 
    /*
     * This method handles clicks of the deletion button. If the user is not in the correct usergroup, it
     * logs an error and forbids further use of the script. Otherwise, it assigns user input to a set of 
     * variables and runs the appropriate validation methods, logging results in the console. It then hands off
     * the actual data acquisition and handling to the iterationHandler.
     */
    function deletionButtonHandler() {
        // Logs an error message if the user is not in the proper usergroups
        if (!canDelete) {
            $("#sd-modal-form")[0].reset();
            $("#sd-log").prepend(lang.logErrorCannotDelete + "<br/>");
            console.log(lang.scriptTitle + " " + lang.logErrorCannotDelete);
            return;
        }
 
        // Determines whether or not delete button is disabled and forbids additional clicks
        if (
            typeof $("#sd-delete-button").attr("disabled") !== typeof undefined &&
            $("#sd-delete-button").attr("disabled") !== false
        ) {
            return;
        }
 
        // Grays out the delete button and logs a message telling the user that the process has begun
        $("#sd-delete-button")[0].setAttribute("disabled", "disabled");
        $("#sd-log").prepend(lang.logBeginningProcess + "<br/>");
        console.log(lang.scriptTitle + " " + lang.logBeginningProcess);
 
        // Input values, split by new lines
        var inputCategories = $("#sd-cat-value")[0].value.split(/[\n]+/),
            inputUsers = $("#sd-user-value")[0].value.split(/[\n]+/);
 
        // Log the input
        console.log(lang.scriptTitle + " inputCategory, pre-validation: " + inputCategories);
        console.log(lang.scriptTitle + " inputUsers, pre-validation: " + inputUsers);
 
        // Validate input arrays
        validatedCategories = validateInputCategories(inputCategories);
        validatedUsers = validateInputUsers(inputUsers);
 
        // Log the validated input
        console.log(lang.scriptTitle + " inputCategory, post-validation: " + validatedCategories);
        console.log(lang.scriptTitle + " inputUsers, post-validation: " + validatedUsers);
 
        // Run the iteration handler for the first cat
        iterationHandler();
        $("#sd-modal-form")[0].reset();
    }
 
    /*
     * This method handles all the countless AJAX calls and callbacks that this script needs to employ
     * properly to determine which pages are by which users. It's not pretty, but it directs the behavior
     * of the script depending on where it is in the deletion process.
     *
     * Code-to-English comments are for my sake and for ease of readability.
     */
    function iterationHandler() {
        // If we aren't at the last cat...
        if (categoriesCounter < validatedCategories.length) {
            // ...and if we are at the last page in the current cat...
            if (membersCounter === numCatMembers) {
                // ... and if there are no user/cat matching pages and this isn't the first cat...
                if (
                    markedPages.length === 0 &&
                    categoriesCounter !== 0
                ) {
                    // ...log error and move on
                    $("#sd-delete-button")[0].removeAttribute("disabled");
                    $("#sd-log").prepend(lang.logErrorNoMatch + "<br/>");
                    console.log(lang.scriptTitle + " " + lang.logErrorNoMatch);
                // Otherwise we get category pages and handle them (janked way of running the first cat from deletionButtonHandler)
                } else {
                    getCategoryMembers(validatedCategories[categoriesCounter], handleCategoryMembers);
                }
                // Move onto next cat and reset the pages counter
                categoriesCounter++;
                membersCounter = 0;
            }
        // Otherwise, if we're at the final cat and last page in that cat...
        } else if (membersCounter === numCatMembers) {
            // ...and if there are some pages that match the user/cat input...
            if (markedPages.length > 0) {
                // ...run the deletion handler on those pages.
                deletionHandler();
            // Otherwise, log an error and reset all globals.
            } else {
                $("#sd-delete-button")[0].removeAttribute("disabled");
                $("#sd-log").prepend(lang.logErrorNoMatch + "<br/>");
                console.log(lang.scriptTitle + " " + lang.logErrorNoMatch);
 
                // Globals redefinition to original values
                categoriesCounter = 0;
                membersCounter = 0;
                numCatMembers = 0;
                markedPages = [];
            }
        }
    }
 
    /*
     * This method deletes the pages at the rate indicated in the deleteDelay variable, then
     * resets the globals to their original values. Only runs if there are matching pages to be
     * found in the proper array.
     */
    function deletionHandler() {
        var counter = 0,
            deletionInterval = setInterval(function () {
            if (counter === markedPages.length) {
                clearInterval(deletionInterval);
                $("#sd-delete-button")[0].removeAttribute("disabled");
 
                //Redefinition for script reuse
                categoriesCounter = 0;
                membersCounter = 0;
                numCatMembers = 0;
                markedPages = [];
            } else {
                deletePage(markedPages[counter]);
                counter++;
            }
        }, deletionDelay);
    }
 
    /*
     * These methods validate input and ensure that all items passed to the API do not result in
     * errors from unencoded titles and the like. "User:" is stripped from the input and "Category:" is
     * applied if it is missing from the input. Users can input values in either form without fear of 
     * script malfunction.
     */
    function validateInputCategories(categories) {
        for (var i = 0; i < categories.length; i++) {
            // Removes leading/trailing whitespace
            categories[i] = categories[i].trim();
 
            if (categories[i].startsWith("Category:") === false) {
                categories[i] = "Category:" + categories[i];
            }
            categories[i] = mw.util.wikiUrlencode(categories[i]);
        }
        return categories;
    }
 
    function validateInputUsers(users) {
        for (var i = 0; i < users.length; i++) {
            // Removes leading/trailing whitespace
            users[i] = users[i].trim();
 
            if (users[i].startsWith("User:") === true) {
                users[i] = users[i].split("User:")[1];
            }
        }
        return users;
    }
 
    /*
     * The getCategoryMembers method takes a category name and produces an array of pages contained
     * within that category. The default is 100 pages, but can be adjusted through the inclusion of
     * a window variable.
     */
    function getCategoryMembers(category, callback) {
        $.ajax({
            type: "GET",
            url: mw.util.wikiScript("api"),
            data: {
                action: "query",
                list: "categorymembers",
                cmtitle: category, // is already encoded
                cmprop: "title|timestamp",
                cmsort: "timestamp",
                cmdir: "desc",
                cmlimit: membersMax,
                format: "json"
            }
        }).done(function (d) {
            callback(d, category);
        });
    }
 
    /*
     * This method, as the name implies, handles the pages present in the queried category.
     * It determines whether the cat "exists" by checking the page count contained within, and if
     * the cat exists, runs its pages back to the API to acquire page creator info.
     */
    function handleCategoryMembers(results, category) {
        var data;
 
        // If there is no API error...
        if(!results.error) {
            data = results.query.categorymembers;
            numCatMembers = data.length;
 
            // ...and if the category is empty of pages...
            if (numCatMembers === 0) {
                // Log an error, rerun the iteration handler, and exit the function
                $("#sd-log").prepend(lang.logErrorEmptyCat.replace("$1", category) + "<br/>");
                console.log(lang.scriptTitle + " " + lang.logErrorEmptyCat.replace("$1", category));
                 // Since we can't reach the iterationHandler in handlePageCreator, call it here
                iterationHandler();
            // Otherwise, proceed to acquire page creator info for each of the pages in the cat
            } else {
                for (var i = 0; i < numCatMembers; i++) {
                    getPageCreator(data[i].title, handlePageCreator);
                }
            }
        // Otherwise if the API throws cminvalidcategory...
        } else {
            // ...log an error and rerun the iteration handler
            $("#sd-log").prepend(lang.logErrorAPIError.replace("$1", results.error.code) + "<br/>");
            console.log(lang.scriptTitle + " " + lang.logErrorAPIError.replace("$1", results.error.code));
 
            // Since we can't reach the iterationHandler within handlePageCreator, call it here
            iterationHandler();
        }
    }
 
    /*
     * Unfortunately, the API doesn't allow multiple pages to be included per call if you're using the 
     * rvdir parameter to sort by age, so multiple calls are required.
     */
    function getPageCreator(page, callback) {
        $.ajax({
            type: "GET",
            url: mw.util.wikiScript("api"),
            data: {
                action: "query",
                prop: "revisions",
                titles: mw.util.wikiUrlencode(page),
                rvprop: "user|userid",
                rvlimit: 1, // Only need the first revision of the page
                rvdir: "newer",
                format: "json"
            }
        }).done(function (d) {
            callback(d, page);
        });
    }
 
    /*
     * This method is the deepest API "get" data handler in the chain, as after its use, data is pushed to a global
     * array for deletion. It determines whether or not the page in question was created by one of the inputted
     * users, and if so, pushes the page into the markedPages array.
     */
    function handlePageCreator(results, page) {
        var pageCreator, data;
 
        // If there are no API errors...
        if(!results.error) {
            data = results.query.pages;
            pageCreator = data[Object.keys(results.query.pages)[0]].revisions[0].user;
 
            // ...if this page was created by one of the inputted users...
            if ($.inArray(pageCreator, validatedUsers) !== -1) {
                // ...push it into the deletion array and move on
                markedPages.push(page);
            }
        // Otherwise, log an error
        } else {
            $("#sd-log").prepend(lang.logErrorAPIError.replace("$1", results.error.code) + "<br/>");
            console.log(lang.scriptTitle + " " + lang.logErrorAPIError.replace("$1", results.error.code));
        }
 
        // In any case, move on to the next page and rerun the iteration handler to gauge place in process
        membersCounter++;
        iterationHandler();
    }
 
    /*
     * Standard deletion handler. Deletes one page at a time, logging a message depending upon the status of the process.
     * Deletions are marked as bot so as to not flood RC with mass deletions.
     */
    function deletePage(page) {
        $.ajax({
            type: "POST",
            url: mw.util.wikiScript("api"),
            data: {
                action: "delete",
                watchlist: "nochange",
                title: mw.util.wikiUrlencode(page),
                reason: lang.deletionReason.replace("$1", "[[w:c:dev:SelectiveDelete|" + lang.scriptTitle + "]]"),
                token: mw.user.tokens.get("editToken"),
                bot: true
            }
        }).done(function (d) {
            if (d.error) {
                // Standard general purpose error log
                $("#sd-log").prepend(lang.logErrorAPIError.replace("$1", d.error.code) + "<br/>");
                console.log(lang.scriptTitle + " " + lang.logErrorAPIError.replace("$1", d.error.code));
            }
        }).success(function (d) {
            $("#sd-log").prepend(lang.logDeletionSuccess.replace("$1", page) + "<br/>");
            console.log(lang.scriptTitle + " " + lang.logDeletionSuccess.replace("$1", page));
        }).fail(function (d) {
            $("#sd-log").prepend(lang.logDeletionFailure.replace("$1", page) + "<br/>");
            console.log(lang.scriptTitle + " " + lang.logDeletionFailure.replace("$1", page));
        });
    }
 
    // Dew it
    init();
}(jQuery, mediaWiki));