import { Statement } from "@xapi/xapi";

export function clearFailedStatements(statements: JSON[]): JSON[] {
    statements = clearTestUsers(statements);
    statements = clearDuplicatedStatements(statements);
    statements = clearEntryAndClosingFailedStatements(statements);
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        if (currentStatement.verb.id == "verbs/went-to") {
            return !currentStatement["object"]["id"].includes("Topics");
        }
        if (
            (currentStatement.verb.id == "verbs/attempted" ||
                currentStatement.verb.id == "verbs/found") &&
            currentStatement.object.id.includes("sopaDeLetras") &&
            currentStatement.result.response
        ) {
            const lastWordResponse: string =
                currentStatement.result.response.trim().split(/\s+/).pop() ||
                "";
            return /^[A-Z]+$/.test(lastWordResponse);
        }
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
        currentStatement.actor.account.name == "11415764-3" ||
        currentStatement.actor.account.name == "17421134-7" ||
        currentStatement.actor.account.name == "7381739-0"
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
        console.log(user);
        const userStatements = obtainStatementsByActor(statements, user).filter(
            (statement) => {
                const currentStatement = Object(statement);
                return (
                    currentStatement.object.definition.type === "app-lifecycle"
                );
            },
        );
        idsToDelete.push(
            ...statementsIdToDelete(userStatements as unknown as Statement[]),
        );
    });
    return statements.filter((statement) => {
        return !idsToDelete.includes(Object(statement).id);
    });
}

function groupingByActor(statements: JSON[]): string[] {
    const actorNames = statements.reduce((names, statement) => {
        const currentStatement = Object(statement);
        names.add(currentStatement.actor.account.name);
        return names;
    }, new Set<string>());
    return Array.from(actorNames);
}

function obtainStatementsByActor(
    statements: JSON[],
    actorName: string,
): JSON[] {
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        return currentStatement.actor.account.name == actorName;
    });
}

function statementsIdToDelete(statements: Statement[]): string[] {
    let idsToDelete: string[] = [];
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
    currentId: string,
    previusId: string,
    previusVerb: string,
    currentVerb: string,
    idsToDelete: string[],
) {
    if (
        (previusVerb === "verbs/logged-in" ||
            previusVerb === "verbs/re-entered") &&
        (currentVerb === "verbs/logged-in" ||
            currentVerb === "verbs/re-entered")
    ) {
        console.log(previusId, currentId, previusVerb, currentVerb);
        idsToDelete.push(currentId);
    }

    if (currentVerb === "verbs/close" && previusVerb === "verbs/close") {
        console.log(previusId, currentId, previusVerb, currentVerb);
        idsToDelete.push(previusId);
    }
}
