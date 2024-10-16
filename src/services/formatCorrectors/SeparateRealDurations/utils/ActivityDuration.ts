import { Statement } from "@xapi/xapi";
import { InActionsVerbs } from "../../../../consts/ActionsEnums/InActionsVerbs";
import { InitFinishActions } from "../../../../consts/ActionsEnums/initFinishActions";

/**
 * Registra la duración de la actividad en función de los parámetros proporcionados.
 *
 * @param timesOfInactivity - Array que contiene los tiempos de inactividad.
 * @param timesOfReturn - Array que contiene los tiempos de retorno.
 * @param currentStatement - Declaración actual.
 * @param statementsInitVerb - Verbo de inicio de las declaraciones.
 */
export function registerActivityDuration(
    timesOfInactivity: string[],
    timesOfReturn: string[],
    currentStatement: Statement,
    statementsInitVerb: string,
) {
    const { verb, timestamp } = currentStatement;

    if (statementsInitVerb == InitFinishActions.navigation) {
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

export function previusResetCase(
    currentVerb: string,
    inActions: string[],
    pastVerb: string,
) {
    if (
        currentVerb == InitFinishActions.navigation &&
        inActions.some((action) => action == pastVerb)
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
export function finalResetCase(
    currentVerb: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
    pastVerb: string,
): boolean {
    if (
        initActions.some((action) => action == currentVerb) &&
        currentVerb != InitFinishActions.videoInit
    ) {
        return true;
    }

    if (currentVerb == InitFinishActions.gameFinish) {
        return true;
    }

    if (currentVerb == InitFinishActions.loginApp) {
        return true;
    }

    if (
        currentVerb == InitFinishActions.navigation &&
        pastVerb == InitFinishActions.videoFinish
    ) {
        return true;
    }

    if (
        currentVerb == InitFinishActions.navigation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0
    ) {
        return true;
    }

    return false;
}
function caseIsntSoupWordClues(currentActivityId: string) {
    return !(
        currentActivityId.includes("sopaDeLetras") &&
        currentActivityId.includes("clues")
    );
}

export function caseToOnlyResetArrays(
    currentVerb: string,
    currentActivityId: string,
): boolean {
    const isInActivityGameAction = Object.values(InActionsVerbs).some(
        (action) => action == currentVerb,
    );
    const cluesSoupWord: boolean = caseIsntSoupWordClues(currentActivityId);

    const pertinentGameAction: boolean =
        isInActivityGameAction && cluesSoupWord;

    return pertinentGameAction;
}

export function casesToCalculate(
    currentAction: string,
    currentObjectId: string,
    timesOfInectivity: string[],
    timesOfRetun: string[],
    suumOfInactivityTime: number,
    inActions: string[],
): boolean {
    const emptyArrays =
        timesOfInectivity.length == 0 &&
        timesOfRetun.length == 0 &&
        suumOfInactivityTime == 0;

    const isCluesSoupWord = caseIsntSoupWordClues(currentObjectId);

    const toNavegation =
        currentAction == InitFinishActions.navigation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0;
    const finshedActivity =
        currentAction == InitFinishActions.gameFinish ||
        currentAction == InitFinishActions.videoFinish;
    const inActionActivity = inActions.some(
        (action) => action == currentAction,
    );

    return (
        toNavegation ||
        finshedActivity ||
        inActionActivity ||
        isCluesSoupWord ||
        !emptyArrays
    );
}

export function caseToAddValueToInitVerb(
    initActions: string[],
    currentStatement: Statement,
    inActions: string[],
): boolean {
    const currentActionId = currentStatement.verb.id;
    const isInitAction = initActions.includes(currentActionId);
    const isNavigationAction = currentActionId === InitFinishActions.navigation;
    const isResolutiveGameAction =
        inActions.includes(currentActionId) &&
        caseIsntSoupWordClues(Object(currentStatement).object.id);

    return isInitAction || isNavigationAction || isResolutiveGameAction;
}

export function isViewedAfterNavigationWithoutInit(
    currentStatementVerb: string,
    statementsInitVerb: string,
    pastInitVerb: string,
): boolean {
    if (currentStatementVerb != InitFinishActions.videoFinish) return false;

    //Valida que la acción actual es de navegación o no
    const isCurrentInitVerbNevigation: boolean =
        statementsInitVerb == InitFinishActions.navigation;

    if (!isCurrentInitVerbNevigation) return false;

    //Valida que el video tenga inicio
    const isViewedWithInit: boolean =
        pastInitVerb == InitFinishActions.videoInit;

    if (isViewedWithInit) return false;

    return true;
}
