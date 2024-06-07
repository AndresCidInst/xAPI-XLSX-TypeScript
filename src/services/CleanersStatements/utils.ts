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
