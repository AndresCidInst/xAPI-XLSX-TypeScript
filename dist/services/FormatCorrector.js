"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctAvatarChangeResultExtensionUri = exports.correctInteractionPointsUriFormat = exports.correctUriExtensionResultWordSoup = exports.correctUriExtensionsGeneralFormat = void 0;
function correctUriExtensionsGeneralFormat(statement) {
    var _a, _b;
    if ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions) {
        Object.keys(statement.result.extensions).forEach((uri) => {
            const value = statement.result.extensions[uri];
            delete statement.result.extensions[uri];
            statement.result.extensions[uri.replace(/&46;/g, ".")] = value;
        });
    }
    if ((_b = statement.context) === null || _b === void 0 ? void 0 : _b.extensions) {
        Object.keys(statement.context.extensions).forEach((uri) => {
            const value = statement.context.extensions[uri];
            delete statement.context.extensions[uri];
            statement.context.extensions[uri.replace(/&46;/g, ".")] = value;
        });
    }
}
exports.correctUriExtensionsGeneralFormat = correctUriExtensionsGeneralFormat;
function correctUriExtensionResultWordSoup(statement) {
    const currentStatement = Object(statement);
    if (currentStatement["verb"]["id"] ==
        "https://xapi.tego.iie.cl/verbs/played" &&
        currentStatement["object"]["id"].includes("sopaDeLetras")) {
        Object.keys(currentStatement["result"]["extensions"]).forEach((uri) => {
            const lastSegmentUri = uri.split("/").pop();
            const value = currentStatement["result"]["extensions"][uri];
            delete statement.result.extensions[uri];
            statement.result.extensions[`https://xapi.tego.iie.cl/extensions/word_soup/${lastSegmentUri}`] = value;
        });
    }
}
exports.correctUriExtensionResultWordSoup = correctUriExtensionResultWordSoup;
function correctInteractionPointsUriFormat(statement) {
    var _a;
    if ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions) {
        const uris = Object.keys(statement.result.extensions);
        const position = uris.findIndex((uri) => uri.includes("is_interaction_points"));
        if (position !== -1) {
            const value = statement.result.extensions[uris[position]];
            delete statement.result.extensions[uris[position]];
            statement.result.extensions["https://xapi.tego.iie.cl/extensions/is_interaction_points"] = value;
        }
    }
}
exports.correctInteractionPointsUriFormat = correctInteractionPointsUriFormat;
function correctAvatarChangeResultExtensionUri(statement) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (Object(statement)["object"]["id"] ===
        "https://xapi.tego.iie.cl/activities/profile/avatars" &&
        ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions)) {
        const fromUri = (_b = Object.keys(statement.result.extensions).find((uri) => uri.includes("from"))) !== null && _b !== void 0 ? _b : "";
        const toUri = (_c = Object.keys(statement.result.extensions).find((uri) => uri.includes("to"))) !== null && _c !== void 0 ? _c : "";
        const fromValue = (_d = statement.result) === null || _d === void 0 ? void 0 : _d.extensions[fromUri];
        const toValue = (_e = statement.result) === null || _e === void 0 ? void 0 : _e.extensions[toUri];
        (_f = statement.result) === null || _f === void 0 ? true : delete _f.extensions[fromUri];
        (_g = statement.result) === null || _g === void 0 ? true : delete _g.extensions[toUri];
        statement.result.extensions["https://xapi.tego.iie.cl/extensions/profile/avatar/from"] = fromValue;
        statement.result.extensions["https://xapi.tego.iie.cl/extensions/profile/avatar/to"] = toValue;
    }
}
exports.correctAvatarChangeResultExtensionUri = correctAvatarChangeResultExtensionUri;
