"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtainStatementsByActor = exports.groupingByActor = exports.clearFailedStatements = void 0;
const initFinishActions_1 = require("../consts/ActionsEnums/initFinishActions");
const consts_1 = require("../consts/consts");
function clearFailedStatements(statements) {
    statements = clearTestUsers(statements);
    statements = clearDuplicatedStatements(statements);
    statements = clearEntryAndClosingFailedStatements(statements);
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        //Verifica que no hayan palabras 'Topics'
        if (currentStatement.verb.id == "verbs/went-to") {
            return !currentStatement["object"]["id"].includes("Topics");
        }
        //Verifricq que en el response de las respuestas hayan letras y no texto vacío
        if ((currentStatement.verb.id == "verbs/attempted" ||
            currentStatement.verb.id == "verbs/found") &&
            currentStatement.object.id.includes("sopaDeLetras") &&
            currentStatement.result.response) {
            const lastWordResponse = currentStatement.result.response.trim().split(/\s+/).pop() ||
                "";
            if (/^[A-Za-z]+$/.test(lastWordResponse) == false) {
                console.log(lastWordResponse);
            }
            return /^[A-Za-z]+$/.test(lastWordResponse);
        }
        return true;
    });
}
exports.clearFailedStatements = clearFailedStatements;
function clearTestUsers(statements) {
    return statements.filter((statement) => {
        return !isTestUser(statement);
    });
}
function isTestUser(statement) {
    const currentStatement = Object(statement);
    return (currentStatement.actor.account.name.startsWith("40.") ||
        consts_1.userTest.includes(currentStatement.actor.account.name));
}
function clearDuplicatedStatements(statements) {
    const uniqueStatements = new Map();
    statements.forEach((statement) => {
        const currentStatement = Object(statement);
        uniqueStatements.set(currentStatement["object"]["id"] + currentStatement["timestamp"], statement);
    });
    return Array.from(uniqueStatements.values());
}
function clearEntryAndClosingFailedStatements(statements) {
    const users = groupingByActor(statements);
    const idsToDelete = [];
    users.forEach((user) => {
        const userStatements = obtainStatementsByActor(statements, user);
        const sortedFiltredUserStatements = userStatements.sort((first, second) => new Date(Object(first).timestamp).getTime() -
            new Date(Object(second).timestamp).getTime());
        idsToDelete.push(...statementsIdToDelete(sortedFiltredUserStatements));
    });
    return statements.filter((statement) => {
        return !idsToDelete.includes(Object(statement).id);
    });
}
function groupingByActor(statements) {
    const actorNames = statements.reduce((names, statement) => {
        const currentStatement = Object(statement);
        names.add(currentStatement.actor.account.name);
        return names;
    }, new Set());
    return Array.from(actorNames);
}
exports.groupingByActor = groupingByActor;
function obtainStatementsByActor(statements, actorName) {
    return statements.filter((statement) => {
        return Object(statement).actor.account.name == actorName;
    });
}
exports.obtainStatementsByActor = obtainStatementsByActor;
function statementsIdToDelete(statements) {
    const idsToDelete = [];
    let prevStatement = null;
    let beforePreviousVerbId = "";
    statements.forEach((currentStatement) => {
        var _a;
        if (prevStatement) {
            compareData(currentStatement.id, prevStatement.id, prevStatement.verb.id, currentStatement.verb.id, idsToDelete, beforePreviousVerbId);
        }
        beforePreviousVerbId = (_a = prevStatement === null || prevStatement === void 0 ? void 0 : prevStatement.verb.id) !== null && _a !== void 0 ? _a : "";
        prevStatement = currentStatement;
    });
    return idsToDelete;
}
function compareData(currentStatementId, prevStatementId, prevVerbId, currentVerbId, idsToDelete, beforePreviousVerbId) {
    const isCurrentIngreso = currentVerbId.includes("logged-in") ||
        currentVerbId.includes("re-entered");
    const isPreviousIngreso = prevVerbId.includes("logged-in") || prevVerbId.includes("re-entered");
    const isCurrentSalida = currentVerbId.includes("close");
    const isPreviousSalida = prevVerbId.includes("close");
    const isCloseVideoPattern = isCurrentIngreso &&
        beforePreviousVerbId == initFinishActions_1.InitFinishActions.closeApp &&
        currentVerbId.includes("paused");
    if (isCloseVideoPattern) {
        console.log("Si estoy aca");
    }
    if (isCurrentSalida && isPreviousSalida) {
        // Regla 1: Si ambos statements son de salida, se elimina el statement previo
        idsToDelete.push(prevStatementId);
    }
    //Regla 2: Si ambos statements son de ingreso, se elimina el statement actual
    else if (isCurrentIngreso && isPreviousIngreso) {
        idsToDelete.push(currentStatementId);
    }
    //Regla 3: Si no sigue el patron 'Cierre inesperado de un video'
    //En donde, por funcionamiento de la libreria de video de la app.
    // Al cerrar inesprada mente la APP en medio de la visualiacion de un video
    // Este gatilla primero la salida de la APP que la pausa del video
    else if (!isCloseVideoPattern) {
        idsToDelete.push(prevStatementId);
    }
    // Regla 4: Si el statement previo es de salida y el actual no es de ingreso
    else if (isPreviousSalida && !isCurrentIngreso) {
        idsToDelete.push(prevStatementId);
    }
    // Regla 5: Si el statement actual es de ingreso y el previo no es de salida
    else if (isCurrentIngreso && !isPreviousSalida) {
        idsToDelete.push(currentStatementId);
    }
}
