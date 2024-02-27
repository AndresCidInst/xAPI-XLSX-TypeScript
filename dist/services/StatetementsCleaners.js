"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtainStatementsByActor = exports.groupingByActor = exports.clearFailedStatements = void 0;
const consts_1 = require("../consts/consts");
function clearFailedStatements(statements) {
    // statements = clearTestUsers(statements);
    statements = clearDuplicatedStatements(statements);
    statements = clearEntryAndClosingFailedStatements(statements);
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        if (currentStatement.verb.id == "verbs/went-to") {
            return !currentStatement["object"]["id"].includes("Topics");
        }
        if ((currentStatement.verb.id == "verbs/attempted" ||
            currentStatement.verb.id == "verbs/found") &&
            currentStatement.object.id.includes("sopaDeLetras") &&
            currentStatement.result.response) {
            const lastWordResponse = currentStatement.result.response.trim().split(/\s+/).pop() ||
                "";
            return /^[A-Z]+$/.test(lastWordResponse);
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
        const userStatements = obtainStatementsByActor(statements, user).filter((statement) => {
            const currentStatement = Object(statement);
            return (currentStatement.object.definition.type === "app-lifecycle");
        });
        idsToDelete.push(...statementsIdToDelete(userStatements));
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
        const currentStatement = Object(statement);
        return currentStatement.actor.account.name == actorName;
    });
}
exports.obtainStatementsByActor = obtainStatementsByActor;
function statementsIdToDelete(statements) {
    let idsToDelete = [];
    let prevStatement = null;
    statements.forEach((currentStatement) => {
        if (prevStatement) {
            compareData(currentStatement.id, prevStatement.id, prevStatement.verb.id, currentStatement.verb.id, idsToDelete);
        }
        prevStatement = currentStatement;
    });
    return idsToDelete;
}
function compareData(currentId, previusId, previusVerb, currentVerb, idsToDelete) {
    if ((previusVerb === "verbs/logged-in" ||
        previusVerb === "verbs/re-entered") &&
        (currentVerb === "verbs/logged-in" ||
            currentVerb === "verbs/re-entered")) {
        idsToDelete.push(currentId);
    }
    if (currentVerb === "verbs/close" && previusVerb === "verbs/close") {
        idsToDelete.push(previusId);
    }
}
