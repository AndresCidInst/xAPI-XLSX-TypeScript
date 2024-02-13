export function clearFailedStatements(statements: JSON[]): JSON[] {
    return statements.filter((statement) => {
        const currentStatement = Object(statement);
        // if (isTestUser(statement)) return false;
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

function isTestUser(statement: JSON): boolean {
    const currentStatement = Object(statement);
    return (
        (currentStatement.actor.account.name as string).startsWith("40.") ||
        currentStatement.actor.account.name == "11415764-3" ||
        currentStatement.actor.account.name == "17421134-7"
    );
}
