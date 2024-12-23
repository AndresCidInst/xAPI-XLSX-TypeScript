import { Statement } from "@xapi/xapi";
import { clearFailedStatements } from "./../../src/services/CleanersStatements/StatetementsCleaners";
import { compareDates } from "./../../src/services/formatCorrectors/GeneralCorrector";
import { correctFormat } from "./../../src/xapiToExcel";
import * as fs from "fs";
import { separeDurationFromRealDuration } from "../../src/services/formatCorrectors/SeparateRealDurations/RealDurationSeparator";

describe("Pruebas para el método que entrega los tiempos inactivos restados a los registros", () => {
    let testStatementData: JSON[] = [];
    function extractDataFromJsonFile(path: string): JSON[] {
        try {
            const jsonString = fs.readFileSync(path, "utf8");
            const data: JSON[] = JSON.parse(jsonString);
            return data;
        } catch (err) {
            console.log("Error al leer o parsear el archivo:", err);
            return [];
        }
    }

    beforeAll(() => {
        const testData = extractDataFromJsonFile(
            "tests/testData/LRSPruebasTiemposInactivos.json",
        );

        const cleanTestData = clearFailedStatements(testData);
        cleanTestData.sort(compareDates);
        for (const statement in cleanTestData) {
            correctFormat(statement as unknown as Statement);
        }
        testStatementData = cleanTestData;
    });

    describe("Pruebas para el caso de los videos con término", () => {
        let calculatedData: JSON[] = [];
        test("Comprobando el correcto funcionamiento con los resultados que debería dar", () => {
            calculatedData = separeDurationFromRealDuration(testStatementData);
            console.log(
                calculatedData.find(
                    (statement) =>
                        Object(statement).id ==
                        "27ffbfce-d2d3-4733-89c7-64bc82d19ac1",
                ),
            );
        });
    });
});
