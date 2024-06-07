import { userTest } from "../../consts/consts";
import { clearEntryAndClosingFailedStatements } from "./ClearFailedLiveCycle";

export function clearFailedStatements(statements: JSON[]): JSON[] {
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
        if (
            (currentStatement.verb.id == "verbs/attempted" ||
                currentStatement.verb.id == "verbs/found") &&
            currentStatement.object.id.includes("sopaDeLetras") &&
            currentStatement.result.response
        ) {
            const lastWordResponse: string =
                currentStatement.result.response.trim().split(/\s+/).pop() ||
                "";
            return /^[A-Za-z]+$/.test(lastWordResponse);
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
