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
    initialAction: string,
    pastVerb: string,
    finishActions: string[],
    currentVerb: string,
) {
    if (
        (initialAction == InitFinishActions.navigation ||
            currentVerb == "verbs/viewed") &&
        pastVerb == InitFinishActions.loginApp
    ) {
        return true;
    }

    if (
        finishActions.some((action) => action == pastVerb) &&
        initialAction != InitFinishActions.navigation
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
    initialAction: string,
    currentAction: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
    currentVerb: string,
): boolean {
    if (
        initialAction == InitFinishActions.navigation &&
        InitFinishActions.loginApp == currentVerb
    ) {
        return true;
    }

    if (
        currentAction == InitFinishActions.navigation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0
    ) {
        return true;
    }

    if (
        initialAction == InitFinishActions.navigation &&
        initActions.some((action) => action == currentAction)
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
    initialAction: string,
    finalAction: string,
    initActions: string[],
    timesOfInectivity: string[],
    timesOfRetun: string[],
    inActions: string[],
): boolean {
    const toNavegation =
        finalAction == InitFinishActions.navigation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0;
    const finshedActivity =
        initActions.some((action) => action == initialAction) &&
        (finalAction == InitFinishActions.gameFinish ||
            finalAction == InitFinishActions.videoFinish);
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
