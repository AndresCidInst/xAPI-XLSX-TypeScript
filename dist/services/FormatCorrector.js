"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rounDecimals = exports.descriptionFeedbackTriviaCorrect = exports.removeAllDomainFromUris = exports.correctSkippedVideoExtensions = exports.correctAvatarChangeResultExtensionUri = exports.correctInteractionPointsUriFormat = exports.correctUriExtensionResultWordSoup = exports.correctUriExtensionsGeneralFormat = void 0;
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
    if (statement.verb.id === "verbs/found" ||
        statement.verb.id === "verbs/attempted") {
        const attempWord = statement
            .result.response.split(" ")
            .pop();
        statement.result.extensions = {
            "https://xapi.tego.iie.cl/extensions/word_soup/founded_words": attempWord,
        };
    }
    Object.keys(statement["result"]["extensions"]).forEach((uri) => {
        const lastSegmentUri = uri.split("/").pop();
        const value = statement["result"]["extensions"][uri];
        delete statement.result.extensions[uri];
        statement.result.extensions[`https://xapi.tego.iie.cl/extensions/word_soup/${lastSegmentUri}`] = value;
    });
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
    var _a, _b;
    const fromUri = (_a = Object.keys(statement.result.extensions).find((uri) => uri.includes("from"))) !== null && _a !== void 0 ? _a : "";
    const toUri = (_b = Object.keys(statement.result.extensions).find((uri) => uri.includes("to"))) !== null && _b !== void 0 ? _b : "";
    changeAvatarUrisValue(fromUri, toUri, statement);
}
exports.correctAvatarChangeResultExtensionUri = correctAvatarChangeResultExtensionUri;
function changeAvatarUrisValue(fromUri, toUri, statement) {
    var _a, _b, _c, _d;
    const fromValue = (_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions[fromUri];
    const toValue = (_b = statement.result) === null || _b === void 0 ? void 0 : _b.extensions[toUri];
    (_c = statement.result) === null || _c === void 0 ? true : delete _c.extensions[fromUri];
    (_d = statement.result) === null || _d === void 0 ? true : delete _d.extensions[toUri];
    statement.result.extensions["https://xapi.tego.iie.cl/extensions/profile/avatar/from"] = fromValue;
    statement.result.extensions["https://xapi.tego.iie.cl/extensions/profile/avatar/to"] = toValue;
}
function correctSkippedVideoExtensions(statement) {
    const currentExtensions = Object.entries(statement.result.extensions);
    const fromValue = currentExtensions[0][1]["From"];
    const toValue = currentExtensions[0][1]["To"];
    delete statement.result.extensions[currentExtensions[0][0]];
    statement.result.extensions["https://xapi.tego.iie.cl/extensions/video/time_skipped/From"] = fromValue;
    statement.result.extensions["https://xapi.tego.iie.cl/extensions/video/time_skipped/To"] = toValue;
}
exports.correctSkippedVideoExtensions = correctSkippedVideoExtensions;
function removeAllDomainFromUris(statement) {
    const domainToExclude = "https://xapi.tego.iie.cl/";
    statement = deleteUriPrincipalPlaces(statement, domainToExclude);
    deleteUriContextActivities(statement, domainToExclude);
}
exports.removeAllDomainFromUris = removeAllDomainFromUris;
function deleteUriPrincipalPlaces(statement, domainToExclude) {
    const currentStatement = Object(statement);
    const statementVerb = currentStatement.verb.id
        .split("/")
        .slice(-2)
        .join("/");
    currentStatement.verb.id = !statementVerb.includes("verb/")
        ? statementVerb
        : statementVerb.replace("verb/", "verbs/");
    currentStatement.object.id = currentStatement.object.id.replace(domainToExclude, "");
    if (currentStatement.object.definition.type) {
        currentStatement.object.definition.type =
            currentStatement.object.definition.type.split("/").pop();
    }
    return currentStatement;
}
function deleteUriContextActivities(statement, domainToExclude) {
    var _a, _b, _c, _d, _e, _f;
    if ((_b = (_a = statement.context) === null || _a === void 0 ? void 0 : _a.contextActivities) === null || _b === void 0 ? void 0 : _b.parent) {
        objectUriReplace(statement.context.contextActivities.parent, domainToExclude);
    }
    if ((_d = (_c = statement.context) === null || _c === void 0 ? void 0 : _c.contextActivities) === null || _d === void 0 ? void 0 : _d.category) {
        objectUriReplace(statement.context.contextActivities.category, domainToExclude);
    }
    if ((_f = (_e = statement.context) === null || _e === void 0 ? void 0 : _e.contextActivities) === null || _f === void 0 ? void 0 : _f.grouping) {
        objectUriReplace(statement.context.contextActivities.grouping, domainToExclude);
    }
}
function objectUriReplace(activities, domainToExclude) {
    if (activities) {
        for (const activity of activities) {
            activity.id = activity.id.replace(domainToExclude, "");
        }
    }
}
function descriptionFeedbackTriviaCorrect(statement) {
    const currentObject = Object(statement.object);
    currentObject.definition.description["es-CL"] =
        currentObject.definition.description["es-CL"].replace("Resultado de la Trivia -5Con retroalimentación objetiva sobre  nutricion.", "Resultado de la Trivia - 5. Con retroalimentación objetiva sobre  nutricion.");
    statement.object = currentObject;
}
exports.descriptionFeedbackTriviaCorrect = descriptionFeedbackTriviaCorrect;
function rounDecimals(statement) {
    var _a, _b, _c, _d;
    const currentProgressVideo = (_b = (_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b["https://xapi.tego.iie.cl/extensions/video/progress"];
    if (currentProgressVideo) {
        statement.result.extensions["https://xapi.tego.iie.cl/extensions/video/progress"] = Number(currentProgressVideo.toFixed(3));
    }
    if ((_d = (_c = statement.result) === null || _c === void 0 ? void 0 : _c.score) === null || _d === void 0 ? void 0 : _d.scaled) {
        statement.result.score.scaled = Number(statement.result.score.scaled.toFixed(3));
    }
}
exports.rounDecimals = rounDecimals;
