import { Statement } from "@xapi/xapi";
import { Worksheet } from "exceljs";
import { headersMatches, reduxContain } from "../../consts/consts";
import { ActivityJson } from "../../models/ActivityModels";
import { ChoiceJson } from "../../models/ChoicesModels";
import { DataModelImpl } from "../../models/DataModel";
import {
    coordinateActivityRetrieval,
    coordinateChoiceRetrieval,
} from "../ExcelServices";

export function dataRetriever(
    statement: Statement,
    keys: string[],
    sheetList: Worksheet[],
): DataModelImpl {
    const savedData: DataModelImpl = new DataModelImpl();
    try {
        keys.forEach((path) => {
            const value = getValueByPath(
                JSON.parse(JSON.stringify(statement)),
                path,
            );
            if (value !== undefined && value !== null) {
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
                savedData[path] = "";
            }
        });
    } catch (error) {
        console.error("Error al procesar los datos");
    }
    return savedData as unknown as DataModelImpl;
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
    return "";
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
    return "";
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
    return "";
}
