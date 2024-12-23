import { Statement } from "@xapi/xapi";
import { InActionsVerbs } from "../../../../consts/ActionsEnums/InActionsVerbs";
import { InitFinishActions } from "../../../../consts/ActionsEnums/initFinishActions";

let isNavigatiosPostReproduced: boolean = false;

/**
 * Registra la duración de la actividad en función de los parámetros proporcionados.
 *
 * @param timesOfInactivity - Array que contiene los tiempos de inactividad.
 * @param timesOfReturn - Array que contiene los tiempos de retorno.
 * @param currentStatement - Declaración actual.
 * @param statementInitVerb - Verbo de inicio de las declaraciones.
 */
export function registerActivityDuration(
    timesOfInactivity: string[],
    timesOfReturn: string[],
    currentStatement: Statement,
    statementInitVerb: string,
) {
    const { verb, timestamp } = currentStatement;

    if (statementInitVerb == InitFinishActions.navigation) {
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
    initActions: string[],
) {
    if (
        currentVerb == InitFinishActions.navigation &&
        inActions.some((action) => action == pastVerb)
    ) {
        return true;
    }

    if (
        initActions.some((action) => action == currentVerb) &&
        currentVerb != InitFinishActions.videoInit
    ) {
        return true;
    }

    if (initActions.some((action: string) => action == currentVerb)) {
        return true;
    }

    return false;
}

export function isCaseToUsePastInitVerb(
    currentStatement: Statement,
    statementInitVerb: string,
    pastVerb: string,
): boolean {
    const isNavigationTrueInitActionAfterReproduce =
        currentStatement.verb.id == InitFinishActions.closeApp &&
        pastVerb == InitFinishActions.navigation &&
        statementInitVerb == InitFinishActions.videoInit;

    //const navigationAfterVideo = currentStatement.verb.id == InitFinishActions.navigation &&

    return isNavigationTrueInitActionAfterReproduce;
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
    timesOfInectivity: string[],
    timesOfRetun: string[],
    pastVerb: string,
    statementInitVerb: string,
): boolean {
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
        currentVerb == InitFinishActions.videoFinish &&
        pastVerb == InitFinishActions.navigation
    ) {
    }

    if (
        statementInitVerb == InitFinishActions.navigation &&
        currentVerb == InitFinishActions.navigation
    ) {
        return true;
    }

    if (
        currentVerb == InitFinishActions.navigation &&
        timesOfInectivity.length > 0 &&
        timesOfRetun.length > 0 &&
        statementInitVerb != InitFinishActions.videoInit
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
    currentInitVerb: string,
    pastVerb: string,
): boolean {
    const currentActionId = currentStatement.verb.id;

    const isInitAction = initActions.includes(currentActionId);

    const isNavigationAction = currentActionId === InitFinishActions.navigation;

    const isResolutiveGameAction =
        inActions.includes(currentActionId) &&
        caseIsntSoupWordClues(Object(currentStatement).object.id);

    let isReproducedWithoutFinish =
        currentInitVerb == InitFinishActions.videoInit &&
        currentStatement.verb.id == InitFinishActions.navigation;

    if (
        isNavigatiosPostReproduced &&
        currentStatement.verb.id == InitFinishActions.videoFinish
    ) {
        isNavigatiosPostReproduced = false;
    }

    if (
        isReproducedWithoutFinish &&
        currentStatement.verb.id == InitFinishActions.navigation
    ) {
        isNavigatiosPostReproduced = true;
    }

    if (
        isNavigatiosPostReproduced &&
        currentStatement.verb.id == InitFinishActions.navigation &&
        pastVerb == "verbs/paused"
    ) {
        isReproducedWithoutFinish = false;
    }

    return (
        (isInitAction || isNavigationAction || isResolutiveGameAction) &&
        !isReproducedWithoutFinish
    );
}

export function isViewedAfterNavigationWithoutInit(
    currentStatementVerb: string,
    statementsInitVerb: string,
    pastInitVerb: string,
): boolean {
    if (currentStatementVerb != InitFinishActions.videoFinish) return false;

    const isCurrentInitVerbNevigation: boolean =
        statementsInitVerb == InitFinishActions.navigation;

    if (!isCurrentInitVerbNevigation) return false;

    const isViewedWithInit: boolean =
        pastInitVerb == InitFinishActions.videoInit;

    if (isViewedWithInit) return false;

    return true;
}

export function isViewedWithoutReproduced(
    currentStatementVerb: string,
    statementsInitVerb: string,
): boolean {
    const isReproducted = statementsInitVerb == InitFinishActions.videoInit;
    const isViewed = currentStatementVerb == InitFinishActions.videoFinish;

    if (!isViewed) return false;

    return !isReproducted && isViewed;
}
