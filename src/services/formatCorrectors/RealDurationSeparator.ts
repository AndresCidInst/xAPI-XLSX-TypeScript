/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extensions, Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InitFinishActions } from "../../consts/initFinishActions";
import {
    groupingByActor,
    obtainStatementsByActor,
} from "../StatetementsCleaners";
let countCalculations: number = 0;
/**
 * Separa la duración de la duración real de las declaraciones.
 *
 * @param statements - Las declaraciones JSON.
 * @returns Las declaraciones con la duración separada.
 */
export function separeDurationFromRealDuration(statements: JSON[]) {
    const users: string[] = groupingByActor(statements);
    const statementsDurationReformated: Statement[] = [];
    const initActions = Object.entries(InitFinishActions)
        .filter(([key, value]) => key.includes("Init"))
        .map(([key, value]) => value as string);
    users.forEach((user) => {
        let statementInitVerb: string = "";
        let statementInitId: string = "";
        let pastInitialVerb: string = "";
        let pastVerb: string = "";
        const timesOfInectivity: string[] = [];
        const timesOfRetun: string[] = [];
        const userStatements = obtainStatementsByActor(statements, user).sort(
            (first, second) =>
                new Date(Object(first).timestamp).getTime() -
                new Date(Object(second).timestamp).getTime(),
        );
        userStatements.forEach((statement) => {
            if (statementInitVerb != "") {
                pastInitialVerb = statementInitVerb;
            }
            const currentStatement = statement as unknown as Statement;
            if (
                initActions.includes(currentStatement.verb.id) ||
                currentStatement.verb.id == InitFinishActions.navegation
            ) {
                // Gestión de acciones de inicio y navegación
                statementInitVerb = currentStatement.verb.id;
                statementInitId = currentStatement.id!;
            }
            if (previusResetCase(statementInitVerb, pastVerb)) {
                statementInitVerb = "";
                statementInitId = "";
                resetTimesArrays(timesOfInectivity, timesOfRetun);
                return;
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
                    statementInitId,
                    currentStatement.id!,
                )
            ) {
                calculatedTime = separeDurationCases(
                    timesOfInectivity,
                    timesOfRetun,
                    currentStatement,
                );
            }
            if (
                currentStatement.verb.id == InitFinishActions.navegation ||
                currentStatement.verb.id == InitFinishActions.gameFinish ||
                currentStatement.verb.id == InitFinishActions.videoFinish
            ) {
                if (statementInitVerb == InitFinishActions.navegation) {
                    navegationModificedStatements(
                        calculatedTime,
                        statementsDurationReformated,
                        currentStatement,
                    );
                } else {
                    saverNormalModifiedStatements(
                        calculatedTime,
                        statementsDurationReformated,
                        currentStatement,
                    );
                }
            }

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
                statementInitId = "";
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
        "Cantidad de modificaciones necesarias realizados:",
        countCalculations,
    );
    return newStatements;
}

function navegationModificedStatements(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
) {
    if (calculatedTime == undefined || calculatedTime.seconds == 0) {
        statementsDurationReformated.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtensionNavegation(
                    currentStatement.result?.extensions![
                        "https://xapi.tego.iie.cl/extensions/time-between-pages"
                    ],
                    currentStatement.result?.extensions![
                        "https://xapi.tego.iie.cl/extensions/time-between-pages"
                    ],
                ),
            ),
        );
    } else {
        const currentKey = Object.keys(currentStatement.result!.extensions!)[0];
        const currentDuration: string =
            currentStatement.result!.extensions![currentKey];
        const realDuration = subtractTimes(
            currentDuration,
            calculatedTime.toFormat("mm:ss"),
        );
        countCalculations++;
        statementsDurationReformated.push(
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
function saverNormalModifiedStatements(
    calculatedTime: Duration<boolean> | undefined,
    statementsDurationReformated: Statement[],
    currentStatement: Statement,
) {
    if (calculatedTime == undefined || calculatedTime.seconds == 0) {
        statementsDurationReformated.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtension(
                    currentStatement.result!.duration!,
                    currentStatement.result!.duration!,
                ),
            ),
        );
    } else {
        let currentDuration: string = "";
        if (currentStatement.result!.duration == undefined) {
            const durationKey = Object.keys(
                currentStatement.result!.extensions!,
            )[0];
            currentDuration = currentStatement.result!.extensions![durationKey];
        } else {
            currentDuration = currentStatement.result!.duration!;
        }
        const realDuration = subtractTimes(
            currentDuration,
            calculatedTime.toFormat("mm:ss"),
        );
        countCalculations++;
        statementsDurationReformated.push(
            addExtensionToStatement(
                currentStatement,
                durationToExtension(realDuration, currentDuration),
            ),
        );
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

    return undefined;
}

/**
 * Registra la duración de la actividad en función de los parámetros proporcionados.
 *
 * @param timesOfInectivity - Array que contiene los tiempos de inactividad.
 * @param timesOfRetun - Array que contiene los tiempos de retorno.
 * @param currentStatement - Declaración actual.
 * @param statementsInitVerb - Verbo de inicio de las declaraciones.
 */
function registerActivityDuration(
    timesOfInectivity: string[],
    timesOfRetun: string[],
    currentStatement: Statement,
    statementsInitVerb: string,
) {
    if (statementsInitVerb == InitFinishActions.navegation) {
        if (currentStatement.verb.id == InitFinishActions.entryApp) {
            timesOfRetun.push(currentStatement.timestamp!);
            return;
        }
        if (currentStatement.verb.id == InitFinishActions.closeApp) {
            timesOfInectivity.push(currentStatement.timestamp!);
            return;
        }
    }

    if (currentStatement.verb.id == InitFinishActions.closeApp) {
        timesOfInectivity.push(currentStatement.timestamp!);
        return;
    }

    if (
        currentStatement.verb.id == InitFinishActions.entryApp ||
        currentStatement.verb.id == InitFinishActions.loginApp
    ) {
        timesOfRetun.push(currentStatement.timestamp!);
        return;
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

function casesToCalculate(
    initialAction: string,
    finalAction: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
    currentInitId: string,
    currentId: string,
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

    if (toNavegation) {
        return true;
    }

    if (finshedActivity) {
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
