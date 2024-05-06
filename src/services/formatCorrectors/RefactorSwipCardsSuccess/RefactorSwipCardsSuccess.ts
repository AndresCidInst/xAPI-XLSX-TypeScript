import { Statement } from "@xapi/xapi";
import {
    groupingByActor,
    obtainStatementsByActor,
} from "../../StatetementsCleaners";
import { groupingSwipCardsStatements } from "./utils/SwipCardsUtils";

export function refactorSwipCardsSuccess(statements: Statement[]) {
    const users: string[] = groupingByActor(
        JSON.parse(JSON.stringify(statements)),
    );
    const totalReformedStatements: Statement[] = [];
    for (const user of users) {
        const userStatements: Statement[] = obtainStatementsByActor(
            JSON.parse(JSON.stringify(statements)),
            user,
        ) as unknown[] as Statement[];
        const swipCardsStatements: Statement[] =
            groupingSwipCardsStatements(userStatements);
        totalReformedStatements.concat(reformatStatements(swipCardsStatements));
    }
    return replaceStatements(statements, totalReformedStatements);
}

function reformatStatements(swipCardsStatements: Statement[]): Statement[] {
    const reformatedStatements: Statement[] = [];
    let beforePoints: number = 0;
    swipCardsStatements.forEach((statement) => {
        switch (statement.verb.id) {
            case "verbs/played":
            case "verbs/initialized": {
                beforePoints = 0;
                break;
            }
            case "verbs/answered": {
                if (beforePoints < statement.result!.score!.raw!) {
                    statement.result!.success = true;
                    reformatedStatements.push(statement);
                } else {
                    statement.result!.success = false;
                    reformatedStatements.push(statement);
                }
                beforePoints = statement.result!.score!.raw!;
                break;
            }
        }
    });
    return reformatedStatements;
}

function replaceStatements(
    statements: Statement[],
    reformatedStatements: Statement[],
): Statement[] {
    return statements.map((statement) => {
        const newStatement = reformatedStatements.find(
            (newStmt) => Object(newStmt).id == Object(statement).id,
        );
        return newStatement ? newStatement : statement;
    });
}
