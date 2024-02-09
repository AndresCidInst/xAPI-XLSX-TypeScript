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
            if (value !== undefined && value !== null && value !== "") {
                if (needToBeProcessed(path)) {
                    savedData[path] = ProcessData(value, path, sheetList);
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
            statement["verb"]["id"] === "changed-order"
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
    splittedPath.forEach((path) => {
        if (typeof value === "object" && value !== null) {
            value = (value as { [key: string]: unknown })[path];
        } else {
            return value;
        }
    });

    return value;
}

function needToBeProcessed(path: string) {
    return (
        headersMatches.includes(path) ||
        reduxContain.some((contain) => path.includes(contain))
    );
}

function ProcessData(
    value: unknown,
    path: string,
    sheetList: Worksheet[],
): string | boolean | number {
    if (headersMatches.includes(path)) {
        return processHeadersMatches(value, path, sheetList);
    }
    if (reduxContain.some((contain) => path.includes(contain))) {
        return processReduxContain(value, path);
    }
    return "N/A";
}

function processHeadersMatches(
    value: unknown | [],
    path: string,
    sheetList: Worksheet[],
): string {
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
            return coordinateChoiceRetrieval(sheet!, value as ChoiceJson[]);
        }
        case "context|contextActivities|grouping":
        case "context|contextActivities|parent":
        case "context|contextActivities|category": {
            const nameSheet = path.split("|")[path.split("|").length - 1];
            const sheet = sheetList.find((sheet) => sheet.name === nameSheet);
            return coordinateActivityRetrieval(sheet!, value as ActivityJson[]);
        }
    }
    return "N/A";
}

function processReduxContain(value: unknown, path: string): string | boolean {
    if (path.includes("founded_words") && Array.isArray(value)) {
        return (value as []).join(",");
    } else if (
        path.includes("is_interaction_points") ||
        path.includes("continuationGame")
    ) {
        return value as unknown as boolean;
    }
    return "N/A";
}
