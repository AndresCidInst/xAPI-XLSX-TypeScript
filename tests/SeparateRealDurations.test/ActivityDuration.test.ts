import { InitFinishActions } from "../../src/consts/ActionsEnums/initFinishActions";
import { isViewedAfterNavigationWithoutInit } from "./../../src/services/formatCorrectors/SeparateRealDurations/utils/ActivityDuration";

describe("Tests unitarios para los métodos del archivo 'ActivityDurations'", () => {
    describe("Validación del método de verificación de navegación antes de miró sin inicio de video", () => {
        let currentStatementVerb = "";
        let statementsInitVerb = "";
        let pastInitVerb = "";

        beforeAll(() => {
            currentStatementVerb = "";
            statementsInitVerb = "";
            pastInitVerb = "";
        });

        test("Con verbo de inicio de navegación y verbo actual miró, debería ser true", () => {
            currentStatementVerb = InitFinishActions.videoFinish;
            statementsInitVerb = InitFinishActions.navigation;
            pastInitVerb = "";

            const isViewedWitoutInit = isViewedAfterNavigationWithoutInit(
                currentStatementVerb,
                statementsInitVerb,
                pastInitVerb,
            );
            expect(isViewedWitoutInit).toBe(true);
        });

        test("Con verbo de anterior al pasado de inicio de video y verbo actual miró, debería ser false", () => {
            currentStatementVerb = InitFinishActions.videoFinish;
            statementsInitVerb = "";
            pastInitVerb = InitFinishActions.videoInit;

            const isViewedWitoutInit = isViewedAfterNavigationWithoutInit(
                currentStatementVerb,
                statementsInitVerb,
                pastInitVerb,
            );
            expect(isViewedWitoutInit).toBe(false);
        });

        test("Sin verbo de finnalización de video como verbo actual, debería ser false", () => {
            currentStatementVerb = InitFinishActions.videoFinish;
            statementsInitVerb = "";
            pastInitVerb = InitFinishActions.videoInit;

            const isViewedWitoutInit = isViewedAfterNavigationWithoutInit(
                currentStatementVerb,
                statementsInitVerb,
                pastInitVerb,
            );
            expect(isViewedWitoutInit).toBe(false);
        });
    });
});
