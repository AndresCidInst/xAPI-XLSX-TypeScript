"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueByPath = exports.dataRetriever = void 0;
const consts_1 = require("../consts/consts");
const DataModel_1 = require("../models/DataModel");
const ExcelServices_1 = require("./ExcelServices");
function dataRetriever(statement, keys, sheetList) {
    var _a;
    const savedData = new DataModel_1.DataModelImpl();
    try {
        if (isReordenableStatement(statement) && ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions)) {
            statement.result.extensions = statementPathReordenableTransform(statement.result.extensions);
        }
        keys.forEach((path) => {
            const value = getValueByPath(JSON.parse(JSON.stringify(statement)), path);
            if (value !== undefined && value !== null && value !== "") {
                if (needToBeProcessed(path, statement.verb.id)) {
                    savedData[path] = ProcessData(value, path, sheetList, statement.verb.id);
                }
                else {
                    savedData[path] = value;
                }
            }
            else {
                savedData[path] = "N/A";
            }
        });
    }
    catch (error) {
        console.error("Error al procesar los datos");
    }
    return savedData;
}
exports.dataRetriever = dataRetriever;
function isReordenableStatement(statement) {
    if ("id" in statement.object) {
        return (statement.object["id"].includes("reordenable") &&
            statement["verb"]["id"] == "verbs/changed-order");
    }
    return false;
}
function statementPathReordenableTransform(extensions) {
    const transformedExtensions = {};
    const newKeys = Object.keys(consts_1.containsReordenableToSave);
    Object.keys(extensions).forEach((key) => {
        const keyArray = key.split("/");
        const foundKey = newKeys.find((newKey) => keyArray[keyArray.length - 1] == newKey);
        if (foundKey !== undefined && foundKey !== null) {
            if (foundKey.includes("currentOrder")) {
                transformedExtensions[consts_1.containsReordenableToSave[foundKey]] = extensions[key].join(",");
            }
            else {
                transformedExtensions[consts_1.containsReordenableToSave[foundKey]] = extensions[key];
            }
        }
    });
    return transformedExtensions;
}
function getValueByPath(obj, path) {
    const splittedPath = path.split("|");
    let value = obj;
    if (path == "timestamp|date" || path == "timestamp|time") {
        return path.includes("date")
            ? value.timestamp.split("T")[0]
            : value.timestamp.split("T")[1].split(".")[0];
    }
    splittedPath.forEach((path) => {
        if (typeof value === "object" && value !== null) {
            value = value[path];
        }
        else {
            return value;
        }
    });
    return value;
}
exports.getValueByPath = getValueByPath;
function needToBeProcessed(path, verb) {
    return (consts_1.headersMatches.includes(path) ||
        consts_1.reduxContain.some((contain) => path.includes(contain)) ||
        isFoundOrAttempSoupWord(verb));
}
function isFoundOrAttempSoupWord(verb) {
    return verb.includes("verbs/found") || verb.includes("verbs/attempted");
}
function ProcessData(value, path, sheetList, verb) {
    if (consts_1.headersMatches.includes(path)) {
        return processHeadersMatches(value, path, sheetList);
    }
    if (consts_1.reduxContain.some((contain) => path.includes(contain))) {
        return processReduxContain(value, path);
    }
    if (isFoundOrAttempSoupWord(verb)) {
        return path.includes("result|response")
            ? value.split(" ").at(-1)
            : value;
    }
    return "N/A";
}
function processHeadersMatches(value, path, sheetList) {
    let processedData = "";
    switch (path) {
        case "object|definition|correctResponsesPattern":
        case "result|extensions|https://xapi.tego.iie.cl/extensions/word_soup/founded_words":
        case "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/currentOrder":
            if (Array.isArray(value)) {
                processedData = value.join(",");
            }
            return processedData;
        case "object|definition|choices": {
            const sheet = sheetList.find((sheet) => sheet.name === "choices");
            return {
                formula: (0, ExcelServices_1.coordinateChoiceRetrieval)(sheet, value),
                result: null,
            };
        }
        case "context|contextActivities|grouping":
        case "context|contextActivities|parent":
        case "context|contextActivities|category": {
            const nameSheet = path.split("|")[path.split("|").length - 1];
            const sheet = sheetList.find((sheet) => sheet.name === nameSheet);
            return {
                formula: (0, ExcelServices_1.coordinateActivityRetrieval)(sheet, value),
                result: null,
            };
        }
    }
    return "N/A";
}
function processReduxContain(value, path) {
    if (path.includes("founded_words")) {
        return Array.isArray(value)
            ? value.join(",")
            : value;
    }
    else if (path.includes("is_interaction_points") ||
        path.includes("continuationGame")) {
        return value;
    }
    return "N/A";
}
