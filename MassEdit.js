/**
 * MassEdit/code2.js
 * @file Allows for addition/deletion of content from pages
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
 
    if (jQuery("#massEdit-li").exists() || window.isMassEditLoaded) {
        return;
    }
    window.isMassEditLoaded = true;
 
    // Language stuff; remember to leave $1 in your translations
    var $i18n = {
        "en": { // English
            itemTitle: "MassEdit",
            modalTitle1: "Select Action",
            modalTitle2: "Enter Content",
            modalTitle3: "Enter Pages",
            dropdownPrepend: "Prepend content to page(s)",
            dropdownAppend: "Append content to page(s)",
            dropdownDelete: "Delete content from page(s)",
            buttonCancel: "Cancel",
            buttonSubmit: "Submit",
            buttonClear: "Clear",
            modalTemplateplaceholder: "Page content may take the form of text, wikitext, or HTML.",
            modalPagesplaceholder: "Example 1\nExample 2\nExample 3",
            modalLog: "MassEdit log",
            loading: "Editing...",
            noOptionSelected: "Error: Please select an action to perform before submitting.",
            editSuccess: "Success: $1 successfully edited!",
            editFailure: "Error: $1 not edited. Please try again.",
            modalError: "Error: Use of some characters is prohibited for security reasons.",
            modalUserRights: "Error: Incorrect user rights group.",
            meEditSummary: "Editing page content",
            meScript: "script"
        },
        "be": { // Belarusian
            itemTitle: "MassEdit",
            modalTitle1: "Выберыце дзею",
            modalTitle2: "Пакажыце кантэнт",
            modalTitle3: "Пакажыце старонкі",
            dropdownPrepend: "Кантэнт, што дадаецца на старонку(і)",
            dropdownAppend: "Даданне кантэнту на старонку(і)",
            dropdownDelete: "Delete content from page(s)",
            buttonCancel: "Скасаванне",
            buttonCreate: "Стварыць",
            buttonClear: "Ачысціць",
            modalTemplateplaceholder: "Змесціва старонкі можа быць пададзена ў выглядзе тэксту, вікі-тэксту ці HTML-кода.",
            modalPagesplaceholder: "Пример 1\nПример 2\nПример 3",
            modalLog: "Часопіс MassEdit",
            loading: "Загрузка…",
            noOptionSelected: "Абмыла: калі ласка, выберыце дзеянне, якое трэба зрабіць перад захаваннем.",
            editSuccess: "$1 паспяхова адрэдагавана!",
            editFailure: "Абмыла: $1 не адрэдагавана. Калі ласка, паспрабуйце зноў.",
            modalError: "Абмыла: выкарыстанне некаторых знакаў забаронена па меркаваннях бяспекі.",
            modalUserRights: "Абмыла: няправільныя групы праў удзельнікаў.",
            meEditSummary: "Старонка рэдагавання кантэнту",
            meScript: "скрыпт"
        },
        "nl": { // Dutch
            itemTitle: "MassEdit",
            modalTitle1: "Actie selecteren",
            modalTitle2: "Inhoud invoeren",
            modalTitle3: "Pagina\"s opgeven",
            dropdownPrepend: "Inhoud boven aan de pagina\"s toevoegen",
            dropdownAppend: "Inhoud onderaan aan de pagina\"s toevoegen",
            dropdownDelete: "Delete content from page(s)",
            buttonCancel: "Annuleren",
            buttonCreate: "Opslaan",
            buttonClear: "Leegmaken",
            modalTemplateplaceholder: "Paginainhoud kan tekst, wikitekst of HTML zijn.",
            modalPagesplaceholder: "Voorbeeld 1\nVoorbeeld 2\nVoorbeeld 3",
            modalLog: "MassEdit logboek",
            loading: "Bewerken...",
            noOptionSelected: "Fout: Selecteer een actie om uit te voeren alvorens op te slaan.",
            editSuccess: "Succes: $1 succesvol bewerkt!",
            editFailure: "Fout: $1 niet bewerkt. Probeer het opnieuw.",
            modalError: "Fout: Gebruik van sommige karakters is niet toegestaan vanwege veiligheidsredenen.",
            modalUserRights: "Fout: Onjuiste gebruikersgroep.",
            meEditSummary: "Paginainhoud bewerkt",
            meScript: "script"
        },
        "ru": { // Russian
            itemTitle: "MassEdit",
            modalTitle1: "Выберите действие",
            modalTitle2: "Укажите контент",
            modalTitle3: "Укажите страницы",
            dropdownPrepend: "Контент, добавляемый на страницу(ы)",
            dropdownAppend: "Добавление контента на страницу(ы)",
            dropdownDelete: "Delete content from page(s)",
            buttonCancel: "Отмена",
            buttonCreate: "Создать",
            buttonClear: "Очистить",
            modalTemplateplaceholder: "Содержимое страницы может быть представлено в виде текста, вики-текста или HTML-кода.",
            modalPagesplaceholder: "Пример 1\nПример 2\nПример 3",
            modalLog: "Журнал MassEdit",
            loading: "Загрузка…",
            noOptionSelected: "Ошибка: пожалуйста, выберите действие, которое нужно сделать перед сохранением.",
            editSuccess: "$1 успешно отредактировано!",
            editFailure: "Ошибка: $1 не отредактировано. Пожалуйста, попробуйте снова.",
            modalError: "Ошибка: использование некоторых символов запрещено по соображениям безопасности.",
            modalUserRights: "Ошибка: неправильные группы прав участников.",
            meEditSummary: "Страница редактирования контента",
            meScript: "скрипт"
        },
        "uk": { // Ukrainian
            itemTitle: "MassEdit",
            modalTitle1: "Виберіть дію",
            modalTitle2: "Вкажіть вміст",
            modalTitle3: "Вкажіть сторінки",
            dropdownPrepend: "Вміст, доданий на сторінку(и)",
            dropdownAppend: "Додавання вмісту на сторінку(и)",
            dropdownDelete: "Delete content from page(s)",
            buttonCancel: "Скасування",
            buttonCreate: "Створити",
            buttonClear: "Очистити",
            modalTemplateplaceholder: "Вміст сторінки може бути представлено у вигляді тексту, вікі-тексту або HTML-коду.",
            modalPagesplaceholder: "Приклад 1\nПриклад 2\nПриклад 3",
            modalLog: "Журнал MassEdit",
            loading: "Завантаження…",
            noOptionSelected: "Помилка: будь ласка, виберіть дію, яку потрібно зробити перед збереженням.",
            editSuccess: "$1 успішно відредаговано!",
            editFailure: "Помилка: $1 не відредаговано. Будь ласка, спробуйте знову.",
            modalError: "Помилка: використання деяких символів заборонено з міркувань безпеки.",
            modalUserRights: "Помилка: неправильні групи прав користувачів.",
            meEditSummary: "Сторінка редагування вмісту",
            meScript: "скрипт"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    /**
     * @class MassEdit
     * @classdesc The central MassEdit class
     */
    var MassEdit = {
        modalHTML:
            "<form id='massEdit-modal-form' class='WikiaForm '>" +
                "<fieldset>" +
                    "<p>" + $lang.modalTitle1 +
                        "<br />" +
                        "<select size='1' id='massEdit-menu' name='action'>" +
                            "<option selected=''>" +
                                $lang.modalTitle1 +
                            "</option>" +
                            "<option value='prepend'>" +
                                $lang.dropdownPrepend +
                            "</option>" +
                            "<option value='append'>" +
                                $lang.dropdownAppend +
                            "</option>" +
                            "<option value='append'>" +
                                $lang.dropdownDelete +
                            "</option>" +
                        "</select>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $lang.modalTitle2 +
                        "<br />" +
                        "<textarea id='massEdit-content-value' placeholder='" +
                            $lang.modalTemplateplaceholder +
                        "'/>" +
                        "<br />" +
                    "</p>" +
                    "<br />" +
                    "<p>" + $lang.modalTitle3 +
                        "<br />" +
                        "<textarea id='massEdit-pages-value' placeholder='" +
                            $lang.modalPagesplaceholder +
                        "'/>" +
                        "<br />" +
                    "</p>" +
                "</fieldset>" +
                "<br />" +
                "<hr>" +
            "</form>" +
            "<p>" + $lang.modalLog + "</p>" +
            "<div id='massEdit-log'></div>",
        hasRights: /(bureaucrat|sysop|content-moderator|bot)/
            .test(wk.wgUserGroups.join(" ")),
        legalChars: new RegExp('^[' + wk.wgLegalTitleChars + ']*$'),

        /**
         * @method returnNode
         * @description returns class/id to which the item is appended
         * @returns {string}
         */
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

        /**
         * @method constructItem
         * @description assembles toolbar/toolbox item
         * @param {string} $text
         * @returns {mw.html.element}
         */
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "massEdit-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "massEdit-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },

        /**
         * @method checkPage
         * @description compares if page name matches accepted character regex
         *              returns true/false flag
         * @param {string} $page
         * @returns {boolean}
         */
        checkPage: function ($page) {
            if(!this.legalChars.test($page)) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").append($lang.modalError + "<br/>");
                return false;
            } else {
                return true;
            }
        },

        /**
         * @method displayModal
         * @description Assembles and displays the main UI
         * @returns {void}
         */
        displayModal: function () {
            mw.util.addCSS(
                "#massEdit-menu { " +
                    "width: 100%;" +
                "}" +
                "#massEdit-content-value," +
                "#massEdit-pages-value {" +
                    "height: 100px;" +
                    "width: 100%;" +
                    "padding: 0;" +
                    "overflow: scroll;" +
                "}" +
                "#massEdit-log {" +
                    "height: 100px;" +
                    "width: 98%;" +
                    "border: 1px solid;" +
                    "font-family: monospace;" +
                    "background: #fff;" +
                    "color: #aeaeae;" +
                    "overflow: scroll;" +
                    "padding:5px;" +
                "}"
            );
 
            ui.init(["modal"]).then(function (modal) {
                var config = {
                    vars: {
                        id: "massEdit-modal",
                        size: "medium",
                        title: $lang.itemTitle,
                        content: MassEdit.modalHTML,
                        buttons: [{
                            vars: {
                                value: $lang.buttonCancel,
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "cancel"
                                }]
                            }
                        }, {
                            vars: {
                                value: $lang.buttonClear,
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "clear"
                                }]
                            }
                        }, {
                            vars: {
                                value: $lang.buttonSubmit,
                                classes: ["normal", "primary"],
                                data: [{
                                    key: "event",
                                    value: "submit"
                                }]
                            }
                        }]
                    }
                };
 
                modal.createComponent(config, function (massEditModal) {
                    massEditModal.bind("cancel", function () {
                        massEditModal.trigger("close");
                    });
 
                    massEditModal.bind("clear", function () {
                        jQuery("#massEdit-modal-form")[0].reset();
                    });
 
                     massEditModal.bind("submit", function () {
                        //jQuery.proxy(MassEdit.main, MassEdit);
                        MassEdit.main();
                    });
 
                    massEditModal.show();
                });
            });
        },

        /**
         * @method handleWikitext
         * @description assembles/organizes data for page editing
         * @param {json} $data
         * @param {string} $page
         * @param {string} $replace
         * @returns {void}
         */
        handleWikitext: function ($data, $page, $replace) {
            var $result = $data.query.pages[Object.keys($data.query.pages)[0]];
            var $text = $result.revisions[0]["*"];
            var $timestamp = $result.revisions[0].timestamp;
            var $starttimestamp = $result.starttimestamp;
            var $token = $result.edittoken;
 
            $text = $text.replace(new RegExp($replace, "g"), "");
 
            MassEdit.editPage(
                $page,
                $text,
                "delete",
                $timestamp,
                $starttimestamp,
                $token
            );
        },

        /**
         * @method getWikitext
         * @description retrieves data related to a page's wikitext content
         * @param {string} $page
         * @param {string} $replace
         * @param {function} callback
         */
        getWikitext: function ($page, $replace, callback) {
            jQuery.ajax({
                type: "GET",
                url: mw.util.wikiScript("api"),
                data: {
                    action: "query",
                    prop: "info|revisions",
                    intoken: "edit",
                    titles: $page,
                    rvprop: "content|timestamp",
                    rvlimit: "1",
                    indexpageids: "true",
                    format : "json"
                }
            }).done(function ($data) {
                if (!$data.error) {
                    callback($data, $page, $replace);
                }
            });
        },

        /**
         * @method editPage
         * @description main function for editing page content
         * @param {string} $page
         * @param {string} $content
         * @param {string} $action
         * @param {string} $timestamp (optional)
         * @param {string} $starttimestamp (optional)
         * @param {string} $token (optional)
         * @returns {void}
         */
        editPage: function (
            $page,
            $content,
            $action,
            $timestamp,
            $starttimestamp,
            $token
        ) {
            var $params = {
                action: "edit",
                minor: true,
                bot: true,
                title: $page,
                summary: $lang.meEditSummary + " ([[w:c:dev:MassEdit|" +
                        $lang.meScript + "]])"
            };
 
            switch ($action) {
            case "prepend":
                $params.prependtext = $content;
                $params.token = mw.user.tokens.get("editToken")
                break;
            case "append":
                $params.appendtext = $content;
                $params.token = mw.user.tokens.get("editToken")
                break;
            case "delete":
                $params.text = $content;
                $params.basetimestamp = $timestamp;
                $params.startimestamp = $starttimestamp;
                $params.token = $token;
                break;
            }
 
            jQuery.ajax({
                type: "POST",
                url: mw.util.wikiScript("api"),
                data: $params
            }).success(function ($data) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").append(
                    $lang.editSuccess.replace("$1", $page) + "<br/>"
                );
            }).fail(function ($data) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").append(
                    $lang.editFailure.replace("$1", $page) + "<br/>"
                );
            });
        },

        /**
         * @method main
         * @description the main method of the program, coordinates program flow
         * @returns {void}
         */
        main: function () {
            if (!this.hasRights) {
                jQuery("#massEdit-modal-form")[0].reset();
                jQuery("#massEdit-log").append($lang.modalUserRights + "<br/>");
                return;
            } else {
                var that = this;
                var $index = jQuery("#massEdit-menu")[0].selectedIndex;
                var $input = jQuery("#massEdit-content-value")[0].value;
                var $pages = jQuery("#massEdit-pages-value")[0]
                        .value.split(/[\n]+/);
 
                switch ($index) {
                case 0: // No action selected
                    jQuery("#massEdit-modal-form")[0].reset();
                    jQuery("#massEdit-log")
                            .append($lang.noOptionSelected + "<br/>");
                    break;
                case 1:
                case 2: // Edit methods
                    var $action;
                    jQuery("#massEdit-log").append($lang.loading + "<br/>");
                    if ($index === 1) {
                        $action = "prepend";
                    } else {
                        $action = "append";
                    }
 
                    $pages.forEach(function ($page) {
                        var $isLegalPage = that.checkPage($page);
 
                        if ($isLegalPage) {
                            that.editPage($page, $input, $action);
                        }
                    });
                    break;
                case 3: // Find and replace
                    jQuery("#massEdit-log").append($lang.loading + "<br/>");
 
                    $pages.forEach(function ($page) {
                        var $isLegalPage = that.checkPage($page);
 
                        if ($isLegalPage) {
                            that.getWikitext(
                                $page,
                                $input,
                                that.handleWikitext
                            );
                        }
                    });
                    break;
                }
            }
        },

        /**
         * @method init
         * @description initializes the program, assembling the toolbar link and
                        handling click events
         * @returns {void}
         */
        init: function () {
            var that = this;
            var $toolbarElement = this.constructItem($lang.itemTitle);
            var $desiredNode = this.returnNode();
 
            jQuery($toolbarElement).appendTo($desiredNode).click(function () {
                that.displayModal();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(MassEdit.init, MassEdit)
    );
});