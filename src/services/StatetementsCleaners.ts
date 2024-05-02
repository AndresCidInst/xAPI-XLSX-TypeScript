import { Statement } from "@xapi/xapi";
import { userTest } from "../consts/consts";

export function clearFailedStatements(statements: JSON[]): JSON[] {
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

function clearTestUsers(statements: JSON[]): JSON[] {
    return statements.filter((statement) => {
        return !isTestUser(statement);
    });
}

function isTestUser(statement: JSON): boolean {
    const currentStatement = Object(statement);
    return (
        (currentStatement.actor.account.name as string).startsWith("40.") ||
        userTest.includes(currentStatement.actor.account.name)
    );
}

function clearDuplicatedStatements(statements: JSON[]): JSON[] {
    const uniqueStatements = new Map();
    statements.forEach((statement: JSON) => {
        const currentStatement = Object(statement);
        uniqueStatements.set(
            currentStatement["object"]["id"] + currentStatement["timestamp"],
            statement,
        );
    });
    return Array.from(uniqueStatements.values());
}

function clearEntryAndClosingFailedStatements(statements: JSON[]) {
    const users = groupingByActor(statements);
    const idsToDelete: string[] = [];
    users.forEach((user) => {
        const userStatements = obtainStatementsByActor(statements, user);
        const sortedFiltredUserStatements = userStatements.sort(
            (first, second) =>
                new Date(Object(first).timestamp).getTime() -
                new Date(Object(second).timestamp).getTime(),
        );
        idsToDelete.push(
            ...statementsIdToDelete(
                sortedFiltredUserStatements as unknown as Statement[],
            ),
        );
    });
    return statements.filter((statement) => {
        return !idsToDelete.includes(Object(statement).id);
    });
}

export function groupingByActor(statements: JSON[]): string[] {
    const actorNames = statements.reduce((names, statement) => {
        const currentStatement = Object(statement);
        names.add(currentStatement.actor.account.name);
        return names;
    }, new Set<string>());
    return Array.from(actorNames);
}

export function obtainStatementsByActor(
    statements: JSON[],
    actorName: string,
): JSON[] {
    return statements.filter((statement) => {
        return Object(statement).actor.account.name == actorName;
    });
}

function statementsIdToDelete(statements: Statement[]): string[] {
    const idsToDelete: string[] = [];
    let prevStatement: Statement | null = null;
    statements.forEach((currentStatement) => {
        if (prevStatement) {
            compareData(
                currentStatement.id!,
                prevStatement.id!,
                prevStatement.verb.id,
                currentStatement.verb.id,
                idsToDelete,
            );
        }

        prevStatement = currentStatement;
    });

    return idsToDelete;
}

function compareData(
    currentStatementId: string,
    prevStatementId: string,
    prevVerbId: string,
    currentVerbId: string,
    idsToDelete: string[],
): void {
    const isCurrentIngreso =
        currentVerbId.includes("logged-in") ||
        currentVerbId.includes("re-entered");
    const isPreviousIngreso =
        prevVerbId.includes("logged-in") || prevVerbId.includes("re-entered");

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
