"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtainStatementsByActor = exports.groupingByActor = exports.clearFailedStatements = void 0;
const consts_1 = require("../consts/consts");
function clearFailedStatements(statements) {
    statements = clearTestUsers(statements);
    statements = clearDuplicatedStatements(statements);
    statements = clearEntryAndClosingFailedStatements(statements);
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        if (currentStatement.verb.id == "verbs/went-to") {
            return !currentStatement["object"]["id"].includes("Topics");
        }
        // if (
        //     (currentStatement.verb.id == "verbs/attempted" ||
        //         currentStatement.verb.id == "verbs/found") &&
        //     currentStatement.object.id.includes("sopaDeLetras") &&
        //     currentStatement.result.response
        // ) {
        //     const lastWordResponse: string =
        //         currentStatement.result.response.trim().split(/\s+/).pop() ||
        //         "";
        //     if (/^[A-Z]+$/.test(lastWordResponse) == false) {
        //         console.log(lastWordResponse);
        //     }
        //     return /^[A-Z]+$/.test(lastWordResponse);
        // }
        // if (currentStatement.id == "bd337201-dfdc-4d41-a2a9-56bf311263f4") {
        //     console.log(currentStatement);
        //     return false;
        // }
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
    statements.forEach((currentStatement) => {
        if (prevStatement) {
            compareData(currentStatement.id, prevStatement.id, prevStatement.verb.id, currentStatement.verb.id, idsToDelete);
        }
        prevStatement = currentStatement;
    });
    return idsToDelete;
}
function compareData(currentStatementId, prevStatementId, prevVerbId, currentVerbId, idsToDelete) {
    const isCurrentIngreso = currentVerbId.includes("logged-in") ||
        currentVerbId.includes("re-entered");
    const isPreviousIngreso = prevVerbId.includes("logged-in") || prevVerbId.includes("re-entered");
    const isCurrentSalida = currentVerbId.includes("close");
    const isPreviousSalida = prevVerbId.includes("close");
    if (isCurrentSalida && isPreviousSalida) {
        // Regla 1: Si ambos statements son de salida, se elimina el statement previo
        idsToDelete.push(prevStatementId);
    }
    //Regla 2: Si ambos statements son de ingreso, se elimina el statement actual
    else if (isCurrentIngreso && isPreviousIngreso) {
        idsToDelete.push(currentStatementId);
    }
    // Regla 3: Si el statement previo es de salida y el actual no es de ingreso
    else if (isPreviousSalida && !isCurrentIngreso) {
        idsToDelete.push(prevStatementId);
    }
    // Regla 4: Si el statement actual es de ingreso y el previo no es de salida
    else if (isCurrentIngreso && !isPreviousSalida) {
        idsToDelete.push(currentStatementId);
    }
}
