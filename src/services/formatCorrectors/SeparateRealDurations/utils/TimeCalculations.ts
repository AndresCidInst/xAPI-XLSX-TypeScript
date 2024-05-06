import { Statement } from "@xapi/xapi";
import { Duration } from "luxon";
import { InitFinishActions } from "../../../../consts/ActionsEnums/initFinishActions";

/**
 * Calcula la duración real en segundos entre el tiempo de cierre y los tiempos de entrada.
 *
 * @param closeTime Los tiempos de cierre en formato de cadena.
 * @param entryTimes Los tiempos de entrada en formato de cadena.
 * @returns La duración calculada en segundos.
 */
export function calculateDuration(
    closeTimes: string[],
    entryTimes: string[],
): Duration {
    const totalDurationInMillis = closeTimes.reduce(
        (total, closeTime, index) => {
            const closeTimeInMillis = parseTimeToMillis(closeTime);
            const entryTimeInMillis = parseTimeToMillis(entryTimes[index]);
            return total + (entryTimeInMillis - closeTimeInMillis);
        },
        0,
    );

    const totalDurationInSeconds = Math.round(totalDurationInMillis / 1000);
    return Duration.fromObject({ seconds: totalDurationInSeconds });
}

function parseTimeToMillis(time: string): number {
    const timeInMillis = new Date(time).getTime();
    return Number.isNaN(timeInMillis) ? 0 : timeInMillis;
}

/**
 * Separa los casos de duración.
 *
 * @param timesOfInectivity - Los tiempos de inactividad.
 * @param timesOfRetun - Los tiempos de retorno.
 * @param statement - La declaración.
 * @returns La duración separada o undefined.
 */
export function separeDurationCases(
    timesOfInectivity: string[],
    timesOfRetun: string[],
    statement: Statement,
    inActions: string[],
): Duration | undefined {
    const inactiveTImesRegistrated: boolean =
        timesOfInectivity.length > 0 && timesOfRetun.length > 0;
    const isNavigation: boolean =
        statement.verb.id == InitFinishActions.navigation;
    const isGameAction = inActions.some(
        (action: string) => action == statement.verb.id,
    );
    const isFinishAction: boolean =
        statement.verb.id == InitFinishActions.gameFinish ||
        statement.verb.id == InitFinishActions.videoFinish;
    if (
        inactiveTImesRegistrated &&
        (isNavigation || isFinishAction || isGameAction)
    ) {
        return calculateDuration(timesOfInectivity, timesOfRetun);
    }

    return undefined;
}
