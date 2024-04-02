/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InActionsVerbs } from "../../consts/ActionsEnums/InActionsVerbs";
import { InitFinishActions } from "../../consts/ActionsEnums/initFinishActions";
import {
    groupingByActor,
    obtainStatementsByActor,
} from "../StatetementsCleaners";

let countCalculations: number = 0;
const initActions: string[] = Object.entries(InitFinishActions)
    .filter(([key, value]) => key.includes("Init"))
    .map(([key, value]) => value as string);
const finalizationActions = Object.entries(InitFinishActions)
    .filter(([key, value]) => key.includes("Finish"))
    .map(([key, value]) => value as string);
const inActions: string[] = Object.values(InActionsVerbs);
let sumOfInactivityTime: number = 0;

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
        let pastVerb: string = "";
        const timesOfInectivity: string[] = [];
        const timesOfRetun: string[] = [];
        const userStatements = obtainStatementsByActor(statements, user).sort(
            (first, second) =>
                new Date(Object(first).timestamp).getTime() -
                new Date(Object(second).timestamp).getTime(),
        );
        userStatements.forEach((statement) => {
            const currentStatement = statement as unknown as Statement;
            if (
                initActions.includes(currentStatement.verb.id) ||
                currentStatement.verb.id == InitFinishActions.navegation
            ) {
                statementInitVerb = currentStatement.verb.id;
            }

            if (previusResetCase(statementInitVerb, pastVerb)) {
                resetTimesArrays(timesOfInectivity, timesOfRetun);
            }
            // Registro de tiempos de inactividad y retorno si procede
            if (statementInitVerb != "") {
                registerActivityDuration(
                    timesOfInectivity,
                    timesOfRetun,
                    currentStatement,
                    statementInitVerb,
                );
            }
            let calculatedTime: Duration | undefined = undefined;
            if (
                casesToCalculate(
                    statementInitVerb,
                    currentStatement.verb.id,
                    initActions,
                    timesOfInectivity,
                    timesOfRetun,
                )
            ) {
                calculatedTime = separeDurationCases(
                    timesOfInectivity,
                    timesOfRetun,
                    currentStatement,
                );
            }
            modifyStatement(
                calculatedTime,
                statementsDurationReformated,
                currentStatement,
            );

            if (
                finalResetCase(
                    statementInitVerb,
                    currentStatement.verb.id,
                    initActions,
                    timesOfInectivity,
                    timesOfRetun,
                    currentStatement.verb.id,
                )
            ) {
                statementInitVerb = "";
                resetTimesArrays(timesOfInectivity, timesOfRetun);
                sumOfInactivityTime = 0;
            } else if (
                caseToOnlyResetArrays(
                    currentStatement.verb.id,
                    Object(currentStatement).object.id,
                )
            ) {
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
        countCalculations,
        "cálculos para modificaciones",
    );
    return newStatements;
}

function modifyStatement(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
): void {
    if (currentStatement.verb.id == InitFinishActions.navegation) {
        navigationModifiedStatements(
            calculatedTime,
            statementsDurationReformated,
            currentStatement,
        );
        return;
    } else if (inActions.some((action) => action == currentStatement.verb.id)) {
        saverGameModifiedStatements(
            calculatedTime,
            statementsDurationReformated,
            currentStatement,
        );
        sumOfInactivityTime += calculatedTime?.seconds ?? 0;
        return;
    } else if (
        finalizationActions.some((action) => action == currentStatement.verb.id)
    ) {
        saverFinalModifiedStatements(
            statementsDurationReformated,
            currentStatement,
            calculatedTime,
        );
        return;
    } else if (currentStatement.result?.duration != undefined) {
        saverOtherModifiedStatements(
            statementsDurationReformated,
            currentStatement,
        );
    }
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
            ...result.extensions,
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
) {
    const timeExtensionKey =
        "https://xapi.tego.iie.cl/extensions/time-between-pages";
    const extensions = currentStatement.result?.extensions;
    const currentDuration = extensions?.[timeExtensionKey];

    if (!calculatedTime?.seconds && currentDuration) {
        statementsDurationReformatted.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(currentDuration, currentDuration),
            ),
        );
    } else if (calculatedTime && currentDuration) {
        const realDuration = subtractTimes(
            currentDuration,
            calculatedTime.toFormat("mm:ss"),
        );
        statementsDurationReformatted.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(realDuration, currentDuration),
            ),
        );
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

    if (!calculatedTime?.seconds && duration) {
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

    if (calculatedTime && currentDuration) {
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
        countCalculations++;

        statementsDurationReformated.push(
            addExtensionToStatement(currentStatement, newExtension),
        );
    }
}

function saverFinalModifiedStatements(
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
    calculedTime: Duration<boolean> | undefined,
) {
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

    if (sumOfInactivityTime != 0 || calculedTime != undefined) {
        countCalculations++;
    }
}

/**
 * Separa los casos de duración.
 *
 * @param timesOfInectivity - Los tiempos de inactividad.
 * @param timesOfRetun - Los tiempos de retorno.
 * @param statement - La declaración.
 * @returns La duración separada o undefined.
 */
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

    if (inActions.some((action) => action == statement.verb.id)) {
        if (timesOfInectivity.length > 0 && timesOfRetun.length > 0) {
            return timeCalculer(timesOfInectivity, timesOfRetun);
        }
        return;
    }

    return undefined;
}

/**
 * Registra la duración de la actividad en función de los parámetros proporcionados.
 *
 * @param timesOfInactivity - Array que contiene los tiempos de inactividad.
 * @param timesOfReturn - Array que contiene los tiempos de retorno.
 * @param currentStatement - Declaración actual.
 * @param statementsInitVerb - Verbo de inicio de las declaraciones.
 */
function registerActivityDuration(
    timesOfInactivity: string[],
    timesOfReturn: string[],
    currentStatement: Statement,
    statementsInitVerb: string,
) {
    const { verb, timestamp } = currentStatement;

    if (statementsInitVerb == InitFinishActions.navegation) {
        if (
            verb.id === InitFinishActions.entryApp ||
            verb.id === InitFinishActions.closeApp
        ) {
            const targetArray =
                verb.id === InitFinishActions.entryApp
                    ? timesOfReturn
                    : timesOfInactivity;
            targetArray.push(timestamp!);
        }
        return;
    }

    if (verb.id === InitFinishActions.closeApp) {
        timesOfInactivity.push(timestamp!);
    } else if (
        verb.id === InitFinishActions.entryApp ||
        verb.id === InitFinishActions.loginApp
    ) {
        timesOfReturn.push(timestamp!);
    }
}

/**
 * Calcula la duración real en segundos entre el tiempo de cierre y los tiempos de entrada.
 *
 * @param closeTime Los tiempos de cierre en formato de cadena.
 * @param entryTimes Los tiempos de entrada en formato de cadena.
 * @returns La duración calculada en segundos.
 */
function timeCalculer(closeTime: string[], entryTimes: string[]): Duration {
    const sumatoryTime = closeTime.reduce((resultantTime, time, index) => {
        const closeFormattedTime = new Date(time).getTime();
        const entryFormattedTime = new Date(entryTimes[index]).getTime();
        return resultantTime + (entryFormattedTime - closeFormattedTime);
    }, 0);
    const sumatoryTimeInSecond = sumatoryTime / 1000;
    return Duration.fromObject({ seconds: Number(sumatoryTimeInSecond ?? 0) });
}

function previusResetCase(initialAction: string, pastVerb: string) {
    if (
        initialAction == InitFinishActions.navegation &&
        pastVerb == InitFinishActions.loginApp
    ) {
        return true;
    }

    return false;
}
/**
 * Comprueba si se debe reiniciar el caso.
 * @param initialAction - La acción inicial.
 * @param currentAction - La acción final.
 * @param initActions - Las acciones iniciales.
 * @returns Devuelve true si se debe reiniciar el caso, de lo contrario devuelve false.
 */
function finalResetCase(
    initialAction: string,
    currentAction: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
    currentVerb: string,
): boolean {
    if (
        initialAction == InitFinishActions.navegation &&
        InitFinishActions.loginApp == currentVerb
    ) {
        return true;
    }

    if (
        currentAction == InitFinishActions.navegation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0
    ) {
        return true;
    }

    if (
        currentAction == InitFinishActions.gameFinish ||
        currentAction == InitFinishActions.videoFinish
    ) {
        return true;
    }

    if (
        initialAction == InitFinishActions.navegation &&
        initActions.some((action) => action == currentAction)
    ) {
        return true;
    }

    return false;
}

function caseToOnlyResetArrays(
    currentVerb: string,
    currentActivityId: string,
): boolean {
    const isInActivityGameAction = Object.values(InActionsVerbs).some(
        (action) => action == currentVerb,
    );

    const clues_soup_word =
        currentActivityId.includes("sopaDeLetras") &&
        currentActivityId.includes("clues");

    if (isInActivityGameAction && !clues_soup_word) {
        return true;
    }

    return false;
}

function casesToCalculate(
    initialAction: string,
    finalAction: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
): boolean {
    const toNavegation =
        finalAction == InitFinishActions.navegation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0;
    const finshedActivity =
        initActions.some((action) => action == initialAction) &&
        (finalAction == InitFinishActions.gameFinish ||
            finalAction == InitFinishActions.videoFinish);
    //const validRegister = currentId != currentInitId;
    const inActionActivity = inActions.some((action) => action == finalAction);

    if (toNavegation) {
        return true;
    }

    if (finshedActivity) {
        return true;
    }

    if (inActionActivity) {
        return true;
    }

    return false;
}

/**
 * Agrega una extensión a una declaración.
 *
 * @param statement La declaración a la que se le agregará la extensión.
 * @param extension La extensión que se agregará a la declaración.
 * @returns La declaración con la extensión agregada.
 */
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

/**
 * Convierte la duración real y la duración capturada en una extensión.
 * @param realDuration La duración real.
 * @param capturedDuration La duración capturada.
 * @returns Las extensiones con las duraciones.
 */
function durationToExtension(
    realDuration: string,
    capturedDuration: string,
): Extensions {
    return {
        "https://xapi.tego.iie.cl/extensions/duration": capturedDuration,
        "https://xapi.tego.iie.cl/extensions/real_duration": realDuration,
    };
}

function durationToExtensionNavegation(
    realDuration: string,
    timeBetweenPages: string,
): Extensions {
    return {
        "https://xapi.tego.iie.cl/extensions/real_duration": realDuration,
        "https://xapi.tego.iie.cl/extensions/time-between-pages":
            timeBetweenPages,
    };
}

/**
 * Resta dos tiempos en formato de cadena y devuelve el resultado en formato de cadena.
 * @param capturedTime El tiempo capturado en formato de cadena.
 * @param timeToSubstract El tiempo a restar en formato de cadena.
 * @returns El resultado de la resta en formato de cadena.
 */
function subtractTimes(capturedTime: string, timeToSubstract: string): string {
    const differenceSeconds =
        convertToSeconds(capturedTime) - convertToSeconds(timeToSubstract);

    const minutes = Math.floor(differenceSeconds / 60);
    const seconds = Math.floor(differenceSeconds % 60);

    const result = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return result;
}

/**
 * Convierte una cadena de tiempo en formato "mm:ss" a segundos.
 * @param time La cadena de tiempo en formato "mm:ss".
 * @returns El valor en segundos.
 */
function convertToSeconds(time: string): number {
    const parts = time.split(":");
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

/**
 * Reemplaza las declaraciones en formato JSON con las declaraciones reformateadas que contienen la duración correcta.
 *
 * @param statements - Las declaraciones en formato JSON a reemplazar.
 * @param statementsDurationReformated - Las declaraciones reformateadas que contienen la duración correcta.
 * @returns Las declaraciones reemplazadas.
 */
function replaceStatements(
    statements: JSON[],
    statementsDurationReformated: Statement[],
): JSON[] {
    return statements.map((statement) => {
        const newStatement = statementsDurationReformated.find(
            (newStmt) => Object(newStmt).id == Object(statement).id,
        );
        return newStatement
            ? JSON.parse(JSON.stringify(newStatement))
            : statement;
    });
}

function resetTimesArrays(timesOfInectivity: string[], timesOfRetun: string[]) {
    timesOfInectivity.splice(0, timesOfInectivity.length);
    timesOfRetun.splice(0, timesOfRetun.length);
}
