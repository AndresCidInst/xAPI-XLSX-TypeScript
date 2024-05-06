import { Statement } from "@xapi/xapi";

export function groupingSwipCardsStatements(
    statements: Statement[],
): Statement[] {
    const swipCardsStatements: Statement[] = [];
    for (const statement of statements) {
        if (Object(statement).object.id.includes("swip_cards")) {
            swipCardsStatements.push(statement);
        }
    }
    return swipCardsStatements;
}
