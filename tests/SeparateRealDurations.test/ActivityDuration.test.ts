import { InitFinishActions } from "../../src/consts/ActionsEnums/initFinishActions";
import {
    isViewedAfterNavigationWithoutInit,
    isViewedWithoutReproduced,
} from "./../../src/services/formatCorrectors/SeparateRealDurations/utils/ActivityDuration";

describe("Tests unitarios para los métodos del archivo 'ActivityDurations'", () => {
    describe("Validación del método de verificación de navegación antes de miró sin inicio de video", () => {
        let currentStatementVerb = "";
        let statementsInitVerb = "";
        let pastInitVerb = "";

        beforeEach(() => {
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

        test("Sin verbo de finalización de video como verbo actual, debería ser false", () => {
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
    describe("Identificador de termino de video sin inicio de video", () => {
        let currentStatementVerb = "";
        let currentInitVerb = "";

        beforeEach(() => {
            currentStatementVerb = "";
            currentInitVerb = "";
        });

        test("Termino de video con inicio de video, debe dar false", () => {
            currentStatementVerb = InitFinishActions.videoFinish;
            currentInitVerb = InitFinishActions.videoInit;
            const wasVideoInit = isViewedWithoutReproduced(
                currentStatementVerb,
                currentInitVerb,
            );

            expect(wasVideoInit).toBe(false);
        });

        test("Termino de video sin inicio de video, debe dar true", () => {
            currentStatementVerb = InitFinishActions.videoFinish;
            currentInitVerb = "";
            const wasVideoInit = isViewedWithoutReproduced(
                currentStatementVerb,
                currentInitVerb,
            );

            expect(wasVideoInit).toBe(true);
        });

        test("Sin termino de video con inicio de video, debe dar false", () => {
            currentStatementVerb = "";
            currentInitVerb = InitFinishActions.videoInit;
            const wasVideoInit = isViewedWithoutReproduced(
                currentStatementVerb,
                currentInitVerb,
            );

            expect(wasVideoInit).toBe(false);
        });
    });
});
