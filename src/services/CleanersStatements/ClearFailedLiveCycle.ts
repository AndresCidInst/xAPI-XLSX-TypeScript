import { Statement } from "@xapi/xapi";
import { InitFinishActions } from "../../consts/ActionsEnums/initFinishActions";
import { groupingByActor, obtainStatementsByActor } from "./utils";

const idsStatementsInCLoseVideoPattern: string[] = [];
const idsToDelete: string[] = [];

function comprobeIsInitCloseVideoPattern(
    beforePreviousVerbId: string,
    pastVerb: string,
): boolean {
    return (
        beforePreviousVerbId.includes(InitFinishActions.closeApp) &&
        pastVerb.includes("verbs/paused")
    );
}

function compareData(
    currentStatementId: string,
    prevStatementId: string,
    prevVerbId: string,
    currentVerbId: string,
    beforePreviousVerbId: string,
    beforePreviousStatementId: string,
    lastIndex: number,
    listStatementsLength: number,
): void {
    const isCurrentIngreso =
        currentVerbId.includes("logged-in") ||
        currentVerbId.includes("re-entered");
    const isPreviousIngreso =
        prevVerbId.includes("logged-in") || prevVerbId.includes("re-entered");

    const isCurrentSalida = currentVerbId.includes("close");
    const isPreviousSalida = prevVerbId.includes("close");

    //Regla 5: Si no sigue el patron 'Cierre inesperado de un video'
    //En donde, por funcionamiento de la libreria de video de la app.
    // Al cerrar inesprada mente la APP en medio de la visualiacion de un video
    // Este gatilla primero la salida de la APP que la pausa del video
    if (comprobeIsInitCloseVideoPattern(beforePreviousVerbId, prevVerbId)) {
        if (isCurrentIngreso) {
            idsStatementsInCLoseVideoPattern.push(
                currentStatementId,
                beforePreviousStatementId,
            );
        }
    }

    if (isCurrentSalida && isPreviousSalida) {
        // Regla 1: Si ambos statements son de salida, se elimina el statement previo
        idsToDelete.push(prevStatementId);
    }
    //Regla 2: Si ambos statements son de ingreso, se elimina el statement actual
    else if (isCurrentIngreso && isPreviousIngreso) {
        idsToDelete.push(currentStatementId);
    }
    // Regla 3: Si el statement previo es de salida y el actual no es de ingreso
    else if (
        isPreviousSalida &&
        !isCurrentIngreso &&
        !(listStatementsLength - 2 == lastIndex)
    ) {
        idsToDelete.push(prevStatementId);
    }
    // Regla 4: Si el statement actual es de ingreso y el previo no es de salida
    else if (isCurrentIngreso && !isPreviousSalida) {
        idsToDelete.push(currentStatementId);
    }
}

function statementsIdToDelete(statements: Statement[]): string[] {
    let prevStatement: Statement | null = null;
    let beforePreviousVerbId: string = "";
    let beforePreviousStatementId: string = "";
    let lastIndex: number = 0;
    statements.forEach((currentStatement, index) => {
        if (prevStatement) {
            compareData(
                currentStatement.id!,
                prevStatement.id!,
                prevStatement.verb.id,
                currentStatement.verb.id,
                beforePreviousVerbId,
                beforePreviousStatementId,
                lastIndex,
                statements.length,
            );
        }
        lastIndex = index;
        beforePreviousVerbId = prevStatement?.verb.id ?? "";
        beforePreviousStatementId = prevStatement?.id ?? "";
        prevStatement = currentStatement;
    });

    const finalIdsToDelete = idsToDelete.filter(
        (id: string) => !idsStatementsInCLoseVideoPattern.includes(id),
    );

    idsToDelete.length = 0;
    idsStatementsInCLoseVideoPattern.length = 0;
    return finalIdsToDelete;
}

export function clearEntryAndClosingFailedStatements(statements: JSON[]) {
    const users = groupingByActor(statements);
    const finalIdsToDelete: string[] = [];
    users.forEach((user) => {
        const userStatements = obtainStatementsByActor(statements, user);
        const sortedFiltredUserStatements = userStatements.sort(
            (first, second) =>
                new Date(Object(first).timestamp).getTime() -
                new Date(Object(second).timestamp).getTime(),
        );
        finalIdsToDelete.push(
            ...statementsIdToDelete(
                sortedFiltredUserStatements as unknown as Statement[],
            ),
        );
    });
    return statements.filter((statement) => {
        return !finalIdsToDelete.includes(Object(statement).id);
    });
}
