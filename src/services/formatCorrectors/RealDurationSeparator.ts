import { Extensions, Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InitFinishActions } from "../../consts/initFinishActions";
import {
    groupingByActor,
    obtainStatementsByActor,
} from "../StatetementsCleaners";

export function separeDurationFromRealDuration(statements: JSON[]) {
    const users: string[] = groupingByActor(statements);
    const statementsDurationReformated: Statement[] = [];
    const initActions = Object.entries(InitFinishActions)
        .filter(([key, value]) => key.includes("Init"))
        .map(([key, value]) => value);
    users.forEach((user) => {
        let statementInitVerb: string = "";
        const timesOfInectivity: string[] = [];
        const timesOfRetun: string[] = [];
        obtainStatementsByActor(statements, user).forEach((statement) => {
            const currentStatement = statement as unknown as Statement;
            if (
                initActions.some((action) => currentStatement.verb.id == action)
            ) {
                timesOfInectivity.splice(0, timesOfInectivity.length);
                timesOfRetun.splice(0, timesOfRetun.length);
                statementInitVerb = currentStatement.verb.id;
                return;
            }
            registerActivityDuration(
                timesOfInectivity,
                timesOfRetun,
                currentStatement,
                statementInitVerb,
            );
            const calculatedTime: Duration | undefined = separeDurationCases(
                timesOfInectivity,
                timesOfRetun,
                currentStatement,
            );
            if (calculatedTime) {
                if (calculatedTime.seconds == 0) {
                    statementsDurationReformated.push(
                        addExtensionToStatement(
                            currentStatement,
                            durationToExtensión(
                                currentStatement.result!.duration!,
                                currentStatement.result!.duration!,
                            ),
                        ),
                    );
                } else {
                    const realDuration = subtractTimes(
                        currentStatement.result!.duration!,
                        calculatedTime.toFormat("mm:ss"),
                    );
                    statementsDurationReformated.push(
                        addExtensionToStatement(
                            currentStatement,
                            durationToExtensión(
                                realDuration,
                                currentStatement.result!.duration!,
                            ),
                        ),
                    );
                }
            }
            if (
                resetCase(
                    statementInitVerb,
                    currentStatement.verb.id,
                    initActions,
                )
            ) {
                timesOfInectivity.splice(0, timesOfInectivity.length);
                timesOfRetun.splice(0, timesOfRetun.length);
                statementInitVerb = "";
            }
        });
    });

    return replaceStatements(statements, statementsDurationReformated);
}

function separeDurationCases(
    timesOfInectivity: string[],
    timesOfRetun: string[],
    statement: Statement,
): Duration | undefined {
    if (statement.verb.id == InitFinishActions.navegation) {
        if (timesOfInectivity.length > 0 && timesOfRetun.length > 0) {
            return timeCalculer(timesOfInectivity, timesOfRetun);
        }
        return;
    }
    if (
        statement.verb.id == InitFinishActions.gameFinish ||
        statement.verb.id == InitFinishActions.videoFinish
    ) {
        return timeCalculer(timesOfInectivity, timesOfRetun);
    }

    return undefined;
}

function registerActivityDuration(
    timesOfInectivity: string[],
    timesOfRetun: string[],
    currentStatement: Statement,
    statementsInitVerb: string,
) {
    if (
        statementsInitVerb != "" &&
        currentStatement.verb.id == InitFinishActions.closeApp
    ) {
        timesOfInectivity.push(currentStatement.timestamp!);
        return;
    }

    if (
        statementsInitVerb != "" &&
        (currentStatement.verb.id == InitFinishActions.entryApp ||
            currentStatement.verb.id == InitFinishActions.loginApp)
    ) {
        timesOfRetun.push(currentStatement.timestamp!);
        return;
    }
}

function timeCalculer(closeTime: string[], entryTimes: string[]): Duration {
    const sumatoryTime = closeTime.reduce((resultantTime, time, index) => {
        const closeFormattedTime = new Date(time).getTime();
        const entryFormattedTime = new Date(entryTimes[index]).getTime();
        return resultantTime + (entryFormattedTime - closeFormattedTime);
    }, 0);
    const sumatoryTimeInSecond = sumatoryTime / 1000;
    return Duration.fromObject({ seconds: Number(sumatoryTimeInSecond ?? 0) });
}

function resetCase(
    initialAction: string,
    finalAction: string,
    initActions: string[],
): boolean {
    if (initialAction == finalAction) {
        return true;
    }

    if (
        finalAction == InitFinishActions.gameFinish ||
        finalAction == InitFinishActions.videoFinish
    ) {
        return true;
    }

    if (
        initialAction == InitFinishActions.navegation &&
        initActions.some((action) => action == finalAction)
    ) {
        return true;
    }

    return false;
}

function addExtensionToStatement(
    statement: Statement,
    extension: Extensions,
): Statement {
    return {
        ...statement,
        result: {
            ...statement.result,
            extensions: extension,
        },
    };
}

function durationToExtensión(
    realDuration: string,
    capturedDuration: string,
): Extensions {
    return {
        "https://xapi.tego.iie.cl/extensions/duration": capturedDuration,
        "https://xapi.tego.iie.cl/extensions/real_duration": realDuration,
    };
}

function subtractTimes(capturedTime: string, timeToSubstract: string): string {
    const differenceSeconds =
        convertToSeconds(capturedTime) - convertToSeconds(timeToSubstract);

    const minutes = Math.floor(differenceSeconds / 60);
    const seconds = Math.floor(differenceSeconds % 60);

    const result = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return result;
}

function convertToSeconds(time: string): number {
    const parts = time.split(":");
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

function replaceStatements(
    statements: JSON[],
    statementsDurationReformated: Statement[],
): JSON[] {
    return statements.map((statement) => {
        const newStatement = statementsDurationReformated.find(
            (newStmt) => Object(newStmt).id === Object(statement).id,
        );
        return newStatement
            ? JSON.parse(JSON.stringify(newStatement))
            : statement;
    });
}
