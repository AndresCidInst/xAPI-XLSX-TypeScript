import { Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InitFinishActions } from "../../../../consts/ActionsEnums/initFinishActions";
import {
    convertToSeconds,
    durationToExtension,
    durationToExtensionNavegation,
    subtractTimes,
} from "./DurationUtils";
import { addExtensionToStatement } from "./StatementReformater";

export let totalMidifications: number = 0;

export function modifyStatement(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
    inActions: string[],
    finalizationActions: string[],
    sumOfInactivityTime: number,
): number {
    if (currentStatement.verb.id == InitFinishActions.navigation) {
        navigationModifiedStatements(
            calculatedTime,
            statementsDurationReformated,
            currentStatement,
            sumOfInactivityTime,
        );
    } else if (inActions.some((action) => action == currentStatement.verb.id)) {
        saverGameModifiedStatements(
            calculatedTime,
            statementsDurationReformated,
            currentStatement,
        );
        sumOfInactivityTime += calculatedTime?.seconds ?? 0;
    } else if (
        finalizationActions.some(
            (action: string) => action == currentStatement.verb.id,
        )
    ) {
        sumOfInactivityTime = saverFinalModifiedStatements(
            statementsDurationReformated,
            currentStatement,
            calculatedTime,
            sumOfInactivityTime,
        );
    } else if (currentStatement.result?.duration != undefined) {
        saverOtherModifiedStatements(
            statementsDurationReformated,
            currentStatement,
        );
    }
    return sumOfInactivityTime;
}

function saverOtherModifiedStatements(
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
) {
    const { result } = currentStatement;
    let newExtension = durationToExtension(
        result!.duration!,
        result!.duration!,
    );

    if (result?.extensions) {
        newExtension = {
            ...result?.extensions,
            ...newExtension,
        };
    }

    statementsDurationReformated.push(
        addExtensionToStatement(currentStatement, newExtension),
    );
}

function navigationModifiedStatements(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformatted: Statement[],
    currentStatement: Statement,
    sumOfInactivityTime: number,
) {
    const timeExtensionKey =
        "https://xapi.tego.iie.cl/extensions/time-between-pages";
    const extensions = currentStatement.result?.extensions;
    const currentDuration = extensions?.[timeExtensionKey];
    if (
        (calculatedTime == undefined || calculatedTime.seconds < 0) &&
        currentDuration
    ) {
        statementsDurationReformatted.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(currentDuration, currentDuration),
            ),
        );
    } else if (sumOfInactivityTime != 0) {
        const realDuration = subtractTimes(
            currentDuration,
            Duration.fromObject({ second: sumOfInactivityTime }).toFormat(
                "mm:ss",
            ),
        );
        statementsDurationReformatted.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(realDuration, currentDuration),
            ),
        );
        totalMidifications++;
    } else if (calculatedTime && currentDuration) {
        const realDuration = subtractTimes(
            currentDuration,
            calculatedTime.toFormat("mm:ss"),
        );
        statementsDurationReformatted.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(
                    realDuration.includes("-") ? currentDuration : realDuration,
                    currentDuration,
                ),
            ),
        );
        totalMidifications++;
    }
}

/**
 * Guarda las declaraciones modificadas normalmente.
 *
 * @param calculatedTime - Tiempo calculado.
 * @param statementsDurationReformated - Array de declaraciones con duración reformateada.
 * @param currentStatement - Declaración actual.
 */
function saverGameModifiedStatements(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
) {
    const { result } = currentStatement;

    if (!result?.duration) {
        return;
    }
    const { duration, extensions } = result;

    if (calculatedTime == undefined && duration) {
        let newExtension = durationToExtension(duration, duration);
        if (result?.extensions) {
            newExtension = {
                ...result.extensions,
                ...newExtension,
            };
        }
        statementsDurationReformated.push(
            addExtensionToStatement(currentStatement, newExtension),
        );
        return;
    }

    const currentDuration =
        duration ?? extensions?.[Object.keys(extensions)[0]];

    if (calculatedTime != undefined && currentDuration) {
        const realDuration = subtractTimes(
            currentDuration,
            calculatedTime.toFormat("mm:ss"),
        );
        let newExtension = durationToExtension(realDuration, currentDuration);

        if (result?.extensions) {
            newExtension = {
                ...result.extensions,
                ...newExtension,
            };
        }
        statementsDurationReformated.push(
            addExtensionToStatement(currentStatement, newExtension),
        );
        totalMidifications++;
    }
}

function saverFinalModifiedStatements(
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
    calculedTime: Duration<boolean> | undefined,
    sumOfInactivityTime: number,
): number {
    const { result } = currentStatement;
    const currentDuration = convertToSeconds(
        currentStatement.result!.duration!,
    );
    const realDuration = currentDuration - sumOfInactivityTime;
    let realDurationFormatted: string;

    if (calculedTime == undefined) {
        realDurationFormatted = Duration.fromObject({
            seconds: realDuration,
        }).toFormat("mm:ss");
    } else {
        const calculedRealTime = realDuration - calculedTime.seconds;
        realDurationFormatted = Duration.fromObject({
            second: calculedRealTime,
        }).toFormat("mm:ss");
    }

    if (calculedTime != undefined || sumOfInactivityTime != 0) {
        totalMidifications++;
    }

    const currentDurationFormatted = Duration.fromObject({
        seconds: currentDuration,
    }).toFormat("mm:ss");

    let newExtension = durationToExtension(
        realDurationFormatted,
        currentDurationFormatted,
    );

    if (result?.extensions) {
        newExtension = {
            ...result.extensions,
            ...newExtension,
        };
    }

    statementsDurationReformated.push(
        addExtensionToStatement(currentStatement, newExtension),
    );

    return sumOfInactivityTime;
}
