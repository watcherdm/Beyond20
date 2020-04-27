from settings import getDefaultSettings, getStoredSettings;
from dndbeyond import Monster, removeRollButtons;
from constants import BUTTON_STYLE_CSS, ROLLTYPE_STYLE_CSS;
from utils import isExtensionDisconnected, injectCSS, alertFullSettings;

print("Beyond20: D&D Beyond Encounter module loaded.");

settings = getDefaultSettings();
last_monster_name = "";
character = null;

function documentModified(mutations, observer) {
    nonlocal settings;
    nonlocal last_monster_name;
    nonlocal character;

    if (isExtensionDisconnected()) {
        console.log("This extension is DOWN!");
        observer.disconnect();
        return;

    }
    monster = $(".encounter-details-monster-summary-info-panel,.encounter-details__content-section--monster-stat-block,.combat-tracker-page__content-section--monster-stat-block,.monster-details-modal__body");
    monster_name = monster.find(".mon-stat-block__name").text();
    console.log("Doc modified, new mon : ", monster_name, " != != undefined", last_monster_name);
    if (monster_name == last_monster_name) {
        return;
    }
    last_monster_name = monster_name;
    removeRollButtons();
    character = Monster("Monster", global_settings=settings);
    character.parseStatBlock(monster);

}
function updateSettings(new_settings=null) {
    nonlocal settings;
    nonlocal character;

    if (new_settings) {
        settings = new_settings;
        if (character !== null) {
            character.setGlobalSettings(settings);
    } else {
        getStoredSettings((saved_settings) => {
            nonlocal settings;
            updateSettings(saved_settings);
            documentModified();
        }
        );

}
}
function handleMessage(request, sender, sendResponse) {
    if (request.action == "settings") {
        if (request.type == "general") {
            updateSettings(request.settings);
    } else if (request.action == "open-options") {
        alertFullSettings();

}
}
updateSettings();
injectCSS(BUTTON_STYLE_CSS);
injectCSS(ROLLTYPE_STYLE_CSS);
chrome.runtime.onMessage.addListener(handleMessage);
observer = new window.MutationObserver(documentModified);
observer.observe(document, {"subtree": true, "childList": true});
chrome.runtime.sendMessage({"action": "activate-icon"});
