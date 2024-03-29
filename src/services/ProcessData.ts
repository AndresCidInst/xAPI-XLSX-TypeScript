import { Extensions, Statement } from "@xapi/xapi";
import { Worksheet } from "exceljs";
import {
    containsReordenableToSave,
    headersMatches,
    reduxContain,
} from "../consts/consts";
import { ActivityJson } from "../models/ActivityModels";
import { ChoiceJson } from "../models/ChoicesModels";
import { DataModelImpl } from "../models/DataModel";
import {
    coordinateActivityRetrieval,
    coordinateChoiceRetrieval,
} from "./ExcelServices";

export function dataRetriever(
    statement: Statement,
    keys: string[],
    sheetList: Worksheet[],
): DataModelImpl {
    const savedData: DataModelImpl = new DataModelImpl();
    try {
        if (isReordenableStatement(statement) && statement.result?.extensions) {
            statement.result.extensions = statementPathReordenableTransform(
                statement.result.extensions,
            );
        }
        keys.forEach((path) => {
            const value = getValueByPath(
                JSON.parse(JSON.stringify(statement)),
                path,
            );
            if (statement.id == "524511d1-0a37-4a58-869b-9c18765e163e") {
                console.log(path, value, "\n", statement);
            }
            if (value !== undefined && value !== null && value !== "") {
                if (needToBeProcessed(path, statement.verb.id)) {
                    savedData[path] = ProcessData(
                        value,
                        path,
                        sheetList,
                        statement.verb.id,
                    );
                } else {
                    savedData[path] = value as string | number | boolean | Date;
                }
            } else {
                savedData[path] = "N/A";
            }
        });
    } catch (error) {
        console.error("Error al procesar los datos");
    }
    return savedData as unknown as DataModelImpl;
}
function isReordenableStatement(statement: Statement): boolean {
    if ("id" in statement.object) {
        return (
            (statement.object["id"] as string).includes("reordenable") &&
            statement["verb"]["id"] == "verbs/changed-order"
        );
    }
    return false;
}

function statementPathReordenableTransform(extensions: Extensions): Extensions {
    const transformedExtensions: Extensions = {};
    const newKeys = Object.keys(containsReordenableToSave);
    Object.keys(extensions).forEach((key) => {
        const keyArray = key.split("/");
        const foundKey = newKeys.find(
            (newKey) => keyArray[keyArray.length - 1] == newKey,
        );
        if (foundKey !== undefined && foundKey !== null) {
            if (foundKey.includes("currentOrder")) {
                transformedExtensions[
                    containsReordenableToSave[
                        foundKey as keyof typeof containsReordenableToSave
                    ]
                ] = (extensions[key] as []).join(",");
            } else {
                transformedExtensions[
                    containsReordenableToSave[
                        foundKey as keyof typeof containsReordenableToSave
                    ]
                ] = extensions[key];
            }
        }
    });
    return transformedExtensions;
}

export function getValueByPath(obj: JSON, path: string) {
    const splittedPath = path.split("|");
    let value: unknown = obj;
    if (path == "timestamp|date" || path == "timestamp|time") {
        return path.includes("date")
            ? (value as Statement).timestamp!.split("T")[0]
            : (value as Statement).timestamp!.split("T")[1].split(".")[0];
    }
    splittedPath.forEach((path) => {
        if (typeof value === "object" && value !== null) {
            value = (value as { [key: string]: unknown })[path];
        } else {
            return value;
        }
    });

    return value;
}

function needToBeProcessed(path: string, verb: string): boolean {
    return (
        headersMatches.includes(path) ||
        reduxContain.some((contain) => path.includes(contain)) ||
        isFoundOrAttempSoupWord(verb)
    );
}

function isFoundOrAttempSoupWord(verb: string) {
    return verb.includes("verbs/found") || verb.includes("verbs/attempted");
}

function ProcessData(
    value: unknown,
    path: string,
    sheetList: Worksheet[],
    verb: string,
): { formula: string; result: null } | string | boolean | number {
    if (headersMatches.includes(path)) {
        return processHeadersMatches(value, path, sheetList);
    }
    if (reduxContain.some((contain) => path.includes(contain))) {
        return processReduxContain(value, path);
    }
    if (isFoundOrAttempSoupWord(verb)) {
        return path.includes("result|response")
            ? (value as string).split(" ").at(-1)!
            : (value as string);
    }
    return "N/A";
}

function processHeadersMatches(
    value: unknown | [],
    path: string,
    sheetList: Worksheet[],
) {
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
                formula: coordinateChoiceRetrieval(
                    sheet!,
                    value as ChoiceJson[],
                ),
                result: null,
            };
        }
        case "context|contextActivities|grouping":
        case "context|contextActivities|parent":
        case "context|contextActivities|category": {
            const nameSheet = path.split("|")[path.split("|").length - 1];
            const sheet = sheetList.find((sheet) => sheet.name === nameSheet);
            return {
                formula: coordinateActivityRetrieval(
                    sheet!,
                    value as ActivityJson[],
                ),
                result: null,
            };
        }
    }
    return "N/A";
}

function processReduxContain(value: unknown, path: string): string | boolean {
    if (path.includes("founded_words")) {
        return Array.isArray(value)
            ? (value as []).join(",")
            : (value as string);
    } else if (
        path.includes("is_interaction_points") ||
        path.includes("continuationGame")
    ) {
        return value as unknown as boolean;
    }
    return "N/A";
}
