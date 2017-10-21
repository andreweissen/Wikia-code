/**
 * UsernameAvailability/code.js
 * @file Allows users to check for extant usernames in modal
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
 
    if (
        window.isUsernameAvailabilityLoaded ||
        jQuery("#usernameavailability-a").exists()
    ) {
        return;
    }
    window.isUsernameAvailabilityLoaded = true;
 
    var $i18n = {
        en: { // English
            itemTitle: "Find a username",
            modalTitle: "Check Username Availability",
            modalCancel: "Cancel",
            modalSearch: "Search",
            modalExists: "$1 exists already!",
            modalUnclaimed: "$1 is available!",
            modalError: "Error: Special characters are forbidden."
        },
        be: { // Belarusian
            itemTitle: "Знайсці імя ўдзельніка",
            modalTitle: "Праверка даступнасці імя ўдзельніка",
            modalCancel: "Адмена",
            modalSearch: "Знайсці",
            modalExists: "$1 ўжо занята!",
            modalUnclaimed: "$1 даступна!",
            modalError: "Памылка: забаронена выкарыстанне спецыяльных знакаў."
        },
        es: { // Spanish
            itemTitle: "Encontrar un nombre de usuario",
            modalTitle: "Chequear la disponiblidad de un nombre de usuario",
            modalCancel: "Cancelar",
            modalSearch: "Buscar",
            modalExists: "¡$1 ya existe!",
            modalUnclaimed: "¡$1 está disponible!",
            modalError: "Error: Los carácteres especiales están prohibidos."
        },
        fr: { // French
            itemTitle: "Trouver un nom d\"utilisateur",
            modalTitle: "Vérifier la disponsibilité du nom",
            modalCancel: "Annuler",
            modalSearch: "Rechercher",
            modalExists: "$1 est déjà pris !",
            modalUnclaimed: "$1 est disponible !",
            modalError: "Erreur : les caractères spéciaux sont interdits."
        },
        it: { // Italian
            itemTitle: "Controlla un nome utente",
            modalTitle: "Controlla la disponibilità di un nome utente",
            modalCancel: "Annulla",
            modalSearch: "Cerca",
            modalExists: "$1 è già utilizzato!",
            modalUnclaimed: "$1 è disponibile!",
            modalError: "Errore: I caratteri speciali non sono ammessi."
        },
        ko: { // Korean
            itemTitle: "계정 이름 찾기",
            modalTitle: "계정 이름 사용가능 여부 검사",
            modalCancel: "취소",
            modalSearch: "검색",
            modalExists: "$1 이미 존재합니다.",
            modalUnclaimed: "$1 사용할 수 있습니다.",
            modalError: "오류: 특수 문자는 사용할 수 없습니다."
        },
        pl: { // Polish
            itemTitle: "Znajdź nazwę użytkownika",
            modalTitle: "Sprawdź dostępność nazwy użytkownika",
            modalCancel: "Anuluj",
            modalSearch: "Szukaj",
            modalExists: "$1 jest już zajęta!",
            modalUnclaimed: "$1 jest dostępna!",
            modalError: "Błąd: Znaki specjalnę są zabronione."
        },
        "pt-br": { // Portuguese (Brasil)
            itemTitle: "Encontrar um nome de usuário",
            modalTitle: "Verificar a disponibilidade do nome de usuário",
            modalCancel: "Cancelar",
            modalSearch: "Pesquisar",
            modalExists: "$1 já existe!",
            modalUnclaimed: "$1 está disponível!",
            modalError: "Erro: Caracteres especiais são proibidos."
        },
        ru: { // Russian
            itemTitle: "Найти имя участника",
            modalTitle: "Проверка доступности имени участника",
            modalCancel: "Отмена",
            modalSearch: "Найти",
            modalExists: "$1 уже занято",
            modalUnclaimed: "$1 доступно",
            modalError: "Ошибка: использование специальных символов запрещено!"
        },
        sr: { // Serbian (Cyrillic)
            itemTitle: "Пронађи корисничко име",
            modalTitle: "Провери доступност корисничког имена",
            modalCancel: "Откажи",
            modalSearch: "Провери",
            modalExists: "$1 већ постоји!",
            modalUnclaimed: "$1 је доступно!",
            modalError: "Грешка: Специјални карактери су забрањени."
        },
        "sr-el": { // Serbian (Latin)
            itemTitle: "Pronađi korisničko ime",
            modalTitle: "Proveri dostupnost korisničkog imena",
            modalCancel: "Otkaži",
            modalSearch: "Proveri",
            modalExists: "$1 već postoji!",
            modalUnclaimed: "$1 je dostupno!",
            modalError: "Greška: Specijalni karakteri su zabranjeni."
        },
        sv: { // Swedish
            itemTitle: "Hitta användarnamn",
            modalTitle: "Kolla Användarnamn Tillgänglighet",
            modalCancel: "Avboka",
            modalSearch: "Söka",
            modalExists: "$1 existerar redan!",
            modalUnclaimed: "$1 är tillgängligt!",
            modalError: "Specialtecken är förbjudna."
        },
        uk: { // Ukrainian
            itemTitle: "Знайти ім\"я користувача",
            modalTitle: "Перевірка доступності імені користувача",
            modalCancel: "Скасування",
            modalSearch: "Знайти",
            modalExists: "$1 вже зайнято!",
            modalUnclaimed: "$1 доступно!",
            modalError: "Помилка: заборонено використання спеціальних символів."
        },
        zh: { // Chinese
            itemTitle: "寻找用户名",
            modalTitle: "檢查可使用的用戶名",
            modalCancel: "取消",
            modalSearch: "搜索",
            modalExists: "$1 名已经存在！",
            modalUnclaimed: "$1 名可以使用！",
            modalError: "发生错误：不得使用特殊符号。"
        },
        "zh-hans": { // Chinese (simplified)
            itemTitle: "寻找用户名",
            modalTitle: "檢查可使用的用戶名",
            modalCancel: "取消",
            modalSearch: "搜寻",
            modalExists: "$1 名已经存在！",
            modalUnclaimed: "$1 名可以使用！",
            modalError: "发生错误：不得使用特殊符号。"
        },
        "zh-hant": { // Chinese (traditional)
            itemTitle: "尋找用戶名",
            modalTitle: "檢查可使用的用戶名",
            modalCancel: "取消",
            modalSearch: "搜尋",
            modalExists: "$1 已經存在！",
            modalUnclaimed: "$1 可以使用！",
            modalError: "發生錯誤：不得使用特殊符號。"
        },
        "zh-tw": { // Chinese (Taiwan)
            itemTitle: "尋找使用者名稱",
            modalTitle: "檢查可使用的使用者名稱",
            modalCancel: "取消",
            modalSearch: "搜尋",
            modalExists: "$1 已經存在！",
            modalUnclaimed: "$1 可以使用！",
            modalError: "發生錯誤：不得使用特殊符號。"
        }
    };
 
    var $lang = jQuery.extend(
        $i18n.en,
        $i18n[wk.wgUserLanguage.split("-")[0]],
        $i18n[wk.wgUserLanguage]
    );
 
    var UsernameAvailability = {
        modalHTML:
            "<form id='ua-modal-form' class='WikiaForm '>" +
                "<fieldset>" +
                    "<p>" + $lang.modalTitle + "<br />" +
                        "<input type='textbox' id='ua-input-value'" +
                            "maxlength='30' placeholder='" +
                                $lang.modalSearch +
                        "'/>" +
                    "</p>" +
                "</fieldset><br />" + "<hr />" +
            "</form>" +
            "<div id='ua-log'></div>",
 
        /**
         * @method returnNode
         * @description Returns a string denoting the mode to which the toolbar
         *              item is to be prepended. Previous implementation was
         *              Oasis only.
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
         * @description Returns a link element inside a list element to be
         *              prepended to the toolbar/toolbox
         * @param {string} $text
         * @returns {element}
         */
        constructItem: function ($text) {
            return mw.html.element("li", {
                "class": "overflow",
                "id": "usernameavailability-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "id": "usernameavailability-a",
                    "href": "#",
                    "title": $text
                }, $text)
            ));
        },
 
        /**
         * @method displayModal
         * @description Displays a user interface using wikia.ui.factory modal
         *              styles. Differs from previous jQuery modal UI
         *              implementation.
         * @returns {void}
         */
        displayModal: function () {
            var that = this;
 
            mw.util.addCSS(
                "#ua-modal {" +
                    "width: 500px !important;" +
                "}" +
                "#ua-input-value {" +
                    "height: 30px;" +
                    "width: 100%;" +
                    "padding: 0;" +
                "}" +
                "#ua-log {" +
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
                        id: "ua-modal",
                        size: "small",
                        title: $lang.itemTitle,
                        content: that.modalHTML,
                        buttons: [{
                            vars: {
                                value: $lang.modalCancel,
                                classes: [
                                    "normal",
                                    "primary"
                                ],
                                data: [{
                                    key: "event",
                                    value: "cancel"
                                }]
                            }
                        }, {
                            vars: {
                                value: $lang.modalSearch,
                                classes: [
                                    "normal",
                                    "primary"
                                ],
                                data: [{
                                    key: "event",
                                    value: "search"
                                }]
                            }
                        }]
                    }
                };
 
                modal.createComponent(config, function (uaModal) {
                    uaModal.bind("cancel", function () {
                        uaModal.trigger("close");
                    });
 
                    uaModal.bind("search", function () {
                        var $value = jQuery("#ua-input-value").val();
 
                        if (mw.Title.newFromText($value)) {
                            that.getData($value, that.handleData);
                        } else {
                            jQuery("#ua-log").prepend(
                                that.lang.modalError + "<br />"
                            );
                        }
 
                        jQuery("#ua-input-value").val();
                    });
 
                    uaModal.show();
                });
            });
        },
 
        /**
         * @method getData
         * @description Queries data concerning username input, passes to
         *              callback (handleData)
         * @param {string} $username
         * @param {callback} callback
         * @returns {void}
         */
        getData: function ($username, callback) {
            jQuery.nirvana.getJson("UserProfilePage", "renderUserIdentityBox", {
                title: "User:" + $username
            }).done(function ($data) {
                if ($data && $data.user) {
                    callback($data.user);
                }
            });
        },
 
        /**
         * @method handleData
         * @description Callback handler for data queried on username input.
         *              Adds log entry to log field. Previous implementation
         *              appended entries and displayed a link at the end. New
         *              implementation replaces "This username" with the input
         *              username itself and prepends to the log. Furthermore, if
         *              the user's registration date is a legit value, it is
         *              displayed after the entry.
         * @param {string} $user
         * @returns {void}
         */
        handleData: function ($user) {
            var $registration;
            var $userPageLink = mw.html.element("a", {
                target: "_blank",
                href: mw.util.getUrl(
                    "User:" + mw.util.wikiUrlencode($user.name)
                )
            }, $user.name);
 
            if ($user.registration) {
                $registration = "&nbsp;(" + $user.registration + ")";
            } else {
                $registration = "";
            }
 
            jQuery("#ua-log").prepend(
                $lang["modal" + ($user.edits === -1
                    ? "Unclaimed"
                    : "Exists")].replace("$1", $userPageLink) +
                $registration + "<br />"
            );
        },
 
        /**
         * @method init
         * @description Assembles contents and handles click events
         * @returns {void}
         */
        init: function () {
            var that = this;
            var $element = this.constructItem($lang.itemTitle);
            var $location = this.returnNode();
 
            jQuery($location).prepend($element).click(function () {
                that.displayModal();
            });
        }
    };
 
    mw.loader.using("mediawiki.util").then(
        jQuery.proxy(UsernameAvailability.init, UsernameAvailability)
    );
});