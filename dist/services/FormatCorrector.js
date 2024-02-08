"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctInteractionPointsUriFormat = exports.correctUriExtensionResultWordSoup = exports.correctUriExtensionsGeneralFormat = void 0;
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
