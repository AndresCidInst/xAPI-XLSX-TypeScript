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
export function timeCalculer(
    closeTime: string[],
    entryTimes: string[],
): Duration {
    const sumatoryTime = closeTime.reduce((resultantTime, time, index) => {
        const closeFormattedTime = new Date(time).getTime();
        const entryFormattedTime = new Date(entryTimes[index]).getTime();
        return resultantTime + (entryFormattedTime - closeFormattedTime);
    }, 0);
    const sumatoryTimeInSecond = Math.round(sumatoryTime / 1000);
    return Duration.fromObject({ seconds: Number(sumatoryTimeInSecond ?? 0) });
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
        return timeCalculer(timesOfInectivity, timesOfRetun);
    }

    return undefined;
}
