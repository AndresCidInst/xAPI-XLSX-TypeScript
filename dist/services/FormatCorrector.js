"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.separeDurationFromRealDuration = exports.compareDates = exports.correctDataTimeZone = exports.typeActivityCmiClear = exports.formatDurationCorrect = exports.typeGamePressInWordSoupInsert = exports.rounDecimals = exports.descriptionFeedbackTriviaCorrect = exports.removeAllDomainFromUris = exports.correctSkippedVideoExtensions = exports.correctAvatarChangeResultExtensionUri = exports.correctInteractionPointsUriFormat = exports.correctUriExtensionResultWordSoup = exports.correctUriExtensionsGeneralFormat = void 0;
const luxon_1 = require("luxon");
const process_1 = require("process");
const initFinishActions_1 = require("../consts/initFinishActions");
const StatetementsCleaners_1 = require("./StatetementsCleaners");
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
function typeGamePressInWordSoupInsert(statement) {
    const activityObject = Object(statement.object);
    activityObject.definition.type = "game";
}
exports.typeGamePressInWordSoupInsert = typeGamePressInWordSoupInsert;
function formatDurationCorrect(statement) {
    formatGeneralDuration(statement);
    formatDurationBetweenPages(statement);
}
exports.formatDurationCorrect = formatDurationCorrect;
function formatGeneralDuration(statement) {
    var _a;
    const currentDuration = (_a = statement.result) === null || _a === void 0 ? void 0 : _a.duration;
    if (statement.result && currentDuration) {
        statement.result.duration = formatDuration(currentDuration);
    }
}
function formatDurationBetweenPages(statement) {
    var _a, _b, _c;
    const currentDuration = (_b = (_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b["https://xapi.tego.iie.cl/extensions/time-between-pages"];
    if (((_c = statement.result) === null || _c === void 0 ? void 0 : _c.extensions) && currentDuration) {
        statement.result.extensions["https://xapi.tego.iie.cl/extensions/time-between-pages"] = formatDuration(currentDuration);
    }
}
/**
 * Formatea la duración actual en un formato específico.
 *
 * @param currentDuration La duración actual en formato de cadena.
 * @returns La duración formateada en el formato "mm:ss:ms".
 */
function formatDuration(currentDuration) {
    const duration = luxon_1.Duration.fromISO(currentDuration);
    const minutes = duration.minutes.toString().padStart(2, "0");
    const seconds = duration.milliseconds >= 500 ? duration.seconds + 1 : duration.seconds;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
function typeActivityCmiClear(statement) {
    var _a;
    const currentStatement = Object(statement);
    if ((_a = currentStatement.object.definition.type) === null || _a === void 0 ? void 0 : _a.includes("cmi.")) {
        currentStatement.object.definition.type =
            currentStatement.object.definition.type.replace("cmi.", "");
        statement = currentStatement;
    }
}
exports.typeActivityCmiClear = typeActivityCmiClear;
function correctDataTimeZone(statement) {
    const uctDataTime = luxon_1.DateTime.fromISO(statement.timestamp, { zone: "utc" });
    const chileanDate = uctDataTime.setZone("America/Santiago").toISO();
    statement.timestamp = chileanDate.replace("-03:00", "");
}
exports.correctDataTimeZone = correctDataTimeZone;
function compareDates(a, b) {
    const firstStatement = Object(a);
    const secondStatement = Object(b);
    const firstDate = new Date(firstStatement["timestamp"]);
    const secondDate = new Date(secondStatement["timestamp"]);
    if (firstDate < secondDate) {
        return -1;
    }
    if (firstDate > secondDate) {
        return 1;
    }
    return 0;
}
exports.compareDates = compareDates;
function separeDurationFromRealDuration(statements) {
    const users = (0, StatetementsCleaners_1.groupingByActor)(statements);
    const statementsDurationReformated = [];
    users.forEach((user) => {
        let idStatementInit = "";
        const timesOfInectivity = [];
        const timesOfRetun = [];
        let timeToSubtract;
        (0, StatetementsCleaners_1.obtainStatementsByActor)(statements, user).forEach((statement) => {
            const currentStatement = statement;
            if (currentStatement.verb.id == initFinishActions_1.InitFinishActions.navegation) {
                if (timesOfInectivity.length > 0 && timesOfRetun.length > 0) {
                    timeToSubtract = timeSubstract(timesOfInectivity, timesOfRetun);
                    console.log("user", user);
                    console.log(idStatementInit);
                    console.log(Object(statement).id);
                    (0, process_1.exit)(0);
                }
                idStatementInit = currentStatement.id;
                return;
            }
            if (idStatementInit != "" &&
                currentStatement.verb.id == initFinishActions_1.InitFinishActions.closeApp) {
                timesOfInectivity.push(currentStatement.timestamp);
                return;
            }
            if (idStatementInit != "" &&
                (currentStatement.verb.id == initFinishActions_1.InitFinishActions.entryApp ||
                    currentStatement.verb.id == initFinishActions_1.InitFinishActions.loginApp)) {
                timesOfRetun.push(currentStatement.timestamp);
                return;
            }
        });
    });
    return statements;
}
exports.separeDurationFromRealDuration = separeDurationFromRealDuration;
function timeSubstract(closeTime, entryTimes) {
    const resultantTime = closeTime.reduce((resultantTime, time, index) => {
        const closeFormattedTime = new Date(time).getTime();
        const entryFormattedTime = new Date(entryTimes[index]).getTime();
        return resultantTime + (closeFormattedTime - entryFormattedTime);
    }, "");
    return luxon_1.Duration.fromObject({ seconds: Number(resultantTime) });
}
