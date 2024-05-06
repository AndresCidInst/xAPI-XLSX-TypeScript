/* eslint-disable @typescript-eslint/no-unused-vars */
import { Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InActionsVerbs } from "../../../consts/ActionsEnums/InActionsVerbs";
import { InitFinishActions } from "../../../consts/ActionsEnums/initFinishActions";
import {
    groupingByActor,
    obtainStatementsByActor,
} from "../../StatetementsCleaners";
import {
    caseToAddValueToInitVerb,
    caseToOnlyResetArrays,
    casesToCalculate,
    finalResetCase,
    previusResetCase,
    registerActivityDuration,
} from "./utils/ActivityDuration";
import { resetTimesArrays } from "./utils/ArrayHelpers";
import {
    modifyStatement,
    totalMidifications,
} from "./utils/StatementModifiers";
import { replaceStatements } from "./utils/StatementReformater";
import { separeDurationCases } from "./utils/TimeCalculations";

const initActions: string[] = Object.entries(InitFinishActions)
    .filter(([key, value]) => key.includes("Init"))
    .map(([key, value]) => value as string);
const finishActions = Object.entries(InitFinishActions)
    .filter(([key, value]) => key.includes("Finish"))
    .map(([key, value]) => value as string);
const inActions: string[] = Object.values(InActionsVerbs);

/**
 * Separa la duración de la duración real de las declaraciones.
 *
 * @param statements - Las declaraciones JSON.
 * @returns Las declaraciones con la duración separada.
 */
export function separeDurationFromRealDuration(statements: JSON[]) {
    const users: string[] = groupingByActor(statements);
    const statementsDurationReformated: Statement[] = [];

    users.forEach((user) => {
        let statementInitVerb: string = "";
        let pastInicialVerb: string = "";
        let pastVerb: string = "";
        const timesOfInectivity: string[] = [];
        const timesOfRetun: string[] = [];
        let sumOfInactivityTime: number = 0;
        const userStatements = obtainStatementsByActor(statements, user).sort(
            (first, second) =>
                new Date(Object(first).timestamp).getTime() -
                new Date(Object(second).timestamp).getTime(),
        );
        userStatements.forEach((statement) => {
            const currentStatement = statement as unknown as Statement;
            if (
                caseToAddValueToInitVerb(
                    initActions,
                    currentStatement,
                    inActions,
                )
            ) {
                pastInicialVerb = statementInitVerb;
                statementInitVerb = currentStatement.verb.id;
            }
            if (
                previusResetCase(currentStatement.verb.id, inActions, pastVerb)
            ) {
                resetTimesArrays(timesOfInectivity, timesOfRetun);
                sumOfInactivityTime = 0;
            }

            registerActivityDuration(
                timesOfInectivity,
                timesOfRetun,
                currentStatement,
                statementInitVerb,
            );

            let calculatedTime: Duration | undefined = undefined;
            if (
                casesToCalculate(
                    currentStatement.verb.id,
                    Object(currentStatement).object.id,
                    timesOfInectivity,
                    timesOfRetun,
                    sumOfInactivityTime,
                    inActions,
                )
            ) {
                calculatedTime = separeDurationCases(
                    timesOfInectivity,
                    timesOfRetun,
                    currentStatement,
                    inActions,
                );
            }

            sumOfInactivityTime = modifyStatement(
                calculatedTime,
                statementsDurationReformated,
                currentStatement,
                inActions,
                finishActions,
                sumOfInactivityTime,
            );

            if (
                caseToOnlyResetArrays(
                    currentStatement.verb.id,
                    Object(currentStatement).object.id,
                )
            ) {
                resetTimesArrays(timesOfInectivity, timesOfRetun);
            } else if (
                finalResetCase(
                    currentStatement.verb.id,
                    initActions,
                    timesOfInectivity,
                    timesOfRetun,
                    pastVerb,
                )
            ) {
                sumOfInactivityTime = 0;
                statementInitVerb = "";
                resetTimesArrays(timesOfInectivity, timesOfRetun);
            }
            pastVerb = currentStatement.verb.id;
        });
    });

    const newStatements = replaceStatements(
        statements,
        statementsDurationReformated,
    );
    console.log(
        "Se han realizado:",
        totalMidifications,
        "cálculos para modificaciones",
    );

    return newStatements.updatedStatements;
}
