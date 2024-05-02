import { Statement } from "@xapi/xapi";
import { Workbook, Worksheet } from "exceljs";
import { clearDatFile, saveAuxiliarData } from "./FileProviders/FileProvider";
import { AxiliarFiles } from "./consts/AuxiliarFiles";
import { fillHeaders } from "./consts/consts";
import { Activity, ActivityJson } from "./models/ActivityModels";
import { Choice } from "./models/ChoicesModels";
import { DataModelImpl } from "./models/DataModel";
import { Parent, ParentJson } from "./models/ParentModels";
import { CsvToJsonVersionXAPI } from "./services/CsvToJsonVersionXAPI/CsvToJsonVersionXAPI";
import { createExcelFile, saveMainDataInExcel } from "./services/ExcelServices";
import { dataRetriever, getValueByPath } from "./services/ProcessData";
import { RequestServices } from "./services/RequestServices";
import { clearFailedStatements } from "./services/StatetementsCleaners";
import {
    compareDates,
    correctAvatarChangeResultExtensionUri,
    correctDataTimeZone,
    correctInteractionPointsUriFormat,
    correctSkippedVideoExtensions,
    correctUriExtensionResultWordSoup,
    correctUriExtensionsGeneralFormat,
    descriptionFeedbackTriviaCorrect,
    formatDurationCorrect,
    removeAllDomainFromUris,
    reorderExtensionsCorrector,
    rounDecimals,
    typeActivityCmiClear,
    typeGamePressInWordSoupInsert,
} from "./services/formatCorrectors/GeneralCorrector";
import { separeDurationFromRealDuration } from "./services/formatCorrectors/SeparateRealDurations/RealDurationSeparator";
import { saveCategory as getCategoryFromJson } from "./services/manipulators/CategoryManipulator";
import { choiceMolder as getChoicesFromJson } from "./services/manipulators/ChoicesManipulators";
import { getGroupingFromJson } from "./services/manipulators/GroupingManipulator";
import { parentDataMolder as getParentFromJson } from "./services/manipulators/ParentManipulator";

/**
 * Convierte los datos de xAPI a un formato compatible con Excel y los inserta en el archivo.
 * @returns Una promesa que se resuelve cuando se han insertado los datos en el archivo.
 */
export async function xapiToExcel(
    fromLrs: boolean,
    fileName: string | undefined,
) {
    let statements: JSON[] = [];
    if (fromLrs) {
        const requestServices = new RequestServices();
        // eslint-disable-next-line prefer-const
        statements = await requestServices.getAllStatements();
    } else {
        console.log("Cargando datos del archivo CSV");
        const csvXAPI = new CsvToJsonVersionXAPI(`data/${fileName}`);
        statements = await csvXAPI.getData();
    }
    // const statements: JSON[] = getAllStatements();
    console.log("Limpiando declaraciones fallidas...");
    let newStatements = clearFailedStatements(statements);
    console.log("Declaraciones fallidas limpiadas ✅.");
    console.log("Corrigiendo detalles de las declaraciones...");
    newStatements.sort(compareDates);
    newStatements = refactorStatementsFormatsAndData(newStatements);
    console.log("Corrección de detalles de las declaraciones completada ✅.");
    await prepareData(newStatements);
    await insertData(newStatements);
}

function refactorStatementsFormatsAndData(statements: JSON[]): JSON[] {
    for (const statement of statements) {
        correctFormat(statement as unknown as Statement);
    }
    statements = separeDurationFromRealDuration(statements);
    return statements;
}

/**
 * Corrige el formato de una declaración xAPI.
 * @param statement La declaración xAPI a corregir.
 */
function correctFormat(statement: Statement) {
    const currentStatement = Object(statement);
    correctUriExtensionsGeneralFormat(statement);
    removeAllDomainFromUris(statement);
    typeActivityCmiClear(statement);
    if (
        currentStatement["verb"]["id"] == "verbs/skipped-forward" ||
        currentStatement["verb"]["id"] == "verbs/skipped-backward"
    ) {
        correctSkippedVideoExtensions(statement);
    }

    if (wordSoupFormattingCase(statement)) {
        correctUriExtensionResultWordSoup(statement);
    }

    if (
        currentStatement.verb.id.includes("pressed") &&
        currentStatement.object.id.includes("sopaDeLetras")
    ) {
        typeGamePressInWordSoupInsert(statement);
    }

    if (
        Object(statement)["object"]["id"] === "activities/profile/avatars" &&
        statement.result?.extensions
    ) {
        correctAvatarChangeResultExtensionUri(statement);
    }

    if (
        currentStatement["verb"]["id"] == "verbs/viewed" &&
        currentStatement["object"]["id"].includes("feedback-trivia")
    ) {
        descriptionFeedbackTriviaCorrect(statement);
    }

    if (
        statement.verb.id.includes("verbs/changed-order") &&
        String(Object(statement).object.id).includes("reordenable")
    ) {
        statement = reorderExtensionsCorrector(statement);
    }

    correctInteractionPointsUriFormat(statement);
    rounDecimals(statement);
    formatDurationCorrect(statement);
    correctDataTimeZone(statement);
}

/**
 * Comprueba si una declaración de xAPI corresponde a un caso de formato de sopa de letras.
 *
 * @param statement La declaración de xAPI a comprobar.
 * @returns Devuelve true si la declaración corresponde a un caso de formato de sopa de letras, de lo contrario devuelve false.
 */
function wordSoupFormattingCase(statement: Statement): boolean {
    const currentStatement = Object(statement);
    return (
        (currentStatement["verb"]["id"] == "verbs/attempted" ||
            currentStatement["verb"]["id"] == "verbs/found" ||
            currentStatement["verb"]["id"] == "verbs/played") &&
        currentStatement["object"]["id"].includes("sopaDeLetras")
    );
}

/**
 * Prepara los datos complementarios y crea un archivo Excel.
 * @param statements - Lista de declaraciones en formato JSON.
 * @returns Una promesa que se resuelve cuando se ha creado el archivo Excel.
 */
async function prepareData(statements: JSON[]) {
    console.log("Preparando datos complementarios...");
    recopilateComplementData(statements);

    console.log("Creando archivo excel...");
    await createExcelFile();
    clearAuxiliarFiles();
    console.log(
        "Archivo Excel creado con exito. Datos complementarios almacenados con éxito ✅.",
    );
}

/**
 * Realiza el proceso de darle forma a los datos principales e Insertlos en el archivo Excel.
 *
 * @param statements - Los statements que contienen los datos a insertar.
 * @returns Una promesa que se resuelve cuando los datos se han insertado correctamente.
 */
async function insertData(statements: JSON[]) {
    console.log("Recopilando datos principales de los statements...");
    const workbook: Workbook = await recopilateMainData(statements);
    console.log("Datos principales recopilados con éxito ✅.");
    console.log("Guardando datos principales en el archivo excel...");
    saveMainData(workbook);
    await workbook.xlsx.writeFile(
        `out/tego_V${process.env.npm_package_version}.xlsx`,
    );
    console.log("Datos principales guardados con éxito ✅.");
}

/**
 * Guarda los datos principales en el libro de Excel.
 *
 * @param workbook El libro de Excel donde se guardarán los datos.
 */
function saveMainData(workbook: Workbook) {
    const tegoSheet: Worksheet | undefined = workbook.getWorksheet(
        AxiliarFiles.datos_tego,
    );
    if (tegoSheet === undefined) {
        console.error("No se encontró la hoja de datos del Tego ❌.");
        return;
    }
    saveMainDataInExcel(tegoSheet);
}

/**
 * Limpia los archivos auxiliares.
 */
function clearAuxiliarFiles() {
    clearDatFile(AxiliarFiles.choices);
    clearDatFile(AxiliarFiles.category);
    clearDatFile(AxiliarFiles.grouping);
    clearDatFile(AxiliarFiles.parent);
}

/**
 * Recopila los datos principales a partir de una lista de declaraciones xAPI y los guarda en un archivo Excel.
 *
 * @param statements - Lista de declaraciones xAPI.
 * @returns El objeto Workbook que representa el archivo Excel modificado.
 */
async function recopilateMainData(statements: JSON[]) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(
        `out/tego_V${process.env.npm_package_version}.xlsx`,
    );
    const sheetList: Worksheet[] = workbook.worksheets;
    const finalData: DataModelImpl[] = [];
    const dataKeys = Object.keys(fillHeaders);
    statements.forEach((statementJson) => {
        const statement: Statement = statementJson as unknown as Statement;
        finalData.push(dataRetriever(statement, dataKeys, sheetList));
    });
    saveAuxiliarData(finalData, AxiliarFiles.datos_tego);
    return workbook;
}

/**
 * Recopila datos complementarios de una lista de declaraciones xAPI.
 *
 * @param statements - Lista de declaraciones xAPI.
 */
function recopilateComplementData(statements: JSON[]) {
    const choicesToSave: Choice[] = [];
    const parentToSave: Parent[] = [];
    const categoryToSave: Activity[] = [];
    const groupingToSave: Activity[] = [];
    for (const statement of statements) {
        captureChoices(statement, choicesToSave);
        captureParent(statement, parentToSave);
        capturerCategory(statement, categoryToSave);
        captureGrouping(statement, groupingToSave);
    }
    validationAdditionData(
        choicesToSave,
        parentToSave,
        categoryToSave,
        groupingToSave,
    );
}

/**
 * Valida y guarda los datos adicionales en archivos auxiliares según los parámetros proporcionados.
 *
 * @param choicesToSave - Arreglo de objetos Choice a guardar.
 * @param parentToSave - Arreglo de objetos Parent a guardar.
 * @param categoryToSave - Arreglo de objetos Activity a guardar.
 * @param groupingToSave - Arreglo de objetos Activity a guardar.
 */
function validationAdditionData(
    choicesToSave: Choice[],
    parentToSave: Parent[],
    categoryToSave: Activity[],
    groupingToSave: Activity[],
) {
    if (choicesToSave.length > 0) {
        saveAuxiliarData(choicesToSave, AxiliarFiles.choices);
    }
    if (parentToSave.length > 0) {
        saveAuxiliarData(parentToSave, AxiliarFiles.parent);
    }
    if (categoryToSave.length > 0) {
        saveAuxiliarData(categoryToSave, AxiliarFiles.category);
    }
    if (groupingToSave.length > 0) {
        saveAuxiliarData(groupingToSave, AxiliarFiles.grouping);
    }
}

/**
 * Captura las opciones de una declaracion y las guarda en un arreglo de opciones.
 *
 * @param statement - El enunciado en formato JSON.
 * @param choicesToSave - El arreglo de opciones donde se guardarán las opciones capturadas.
 */
function captureChoices(statement: JSON, choicesToSave: Choice[]) {
    const choices = getValueByPath(statement, "object|definition|choices");
    if (choices !== undefined && choices !== null) {
        getChoicesFromJson(choices as [], choicesToSave);
    }
}

/**
 * Captura la actividad padre de una declaración y lo guarda en un arreglo de padres.
 *
 * @param statement - La declaración JSON de la cual se desea capturar el padre.
 * @param parentToSave - El arreglo de padres en el cual se guardará el padre capturado.
 */
function captureParent(statement: JSON, parentToSave: Parent[]) {
    const parent = getValueByPath(
        statement,
        "context|contextActivities|parent|0",
    );
    if (parent !== undefined && parent !== null) {
        getParentFromJson(parent as ParentJson, parentToSave);
    }
}

/**
 * Captura la categoría dentro del atributo 'cetegory' de una declaración y la guarda en un arreglo de actividades.
 *
 * @param statement - La declaración JSON de la cual se desea capturar la categoría.
 * @param categoryToSave - El arreglo de actividades en el cual se guardará la categoría capturada.
 */
function capturerCategory(statement: JSON, categoryToSave: Activity[]) {
    const category = getValueByPath(
        statement,
        "context|contextActivities|category",
    );
    if (category !== undefined && category !== null) {
        getCategoryFromJson(category as ActivityJson[], categoryToSave);
    }
}

/**
 * Captura las actividades dentro del atributo 'grouping' de una declaracion y lo guarda en una lista de actividades.
 *
 * @param statement - La declaración JSON de la cual se desea capturar el agrupamiento.
 * @param groupingToSave - La lista de actividades en la cual se guardarán los agrupamientos capturados.
 */
function captureGrouping(statement: JSON, groupingToSave: Activity[]) {
    const grouping = getValueByPath(
        statement,
        "context|contextActivities|grouping",
    );
    if (grouping !== undefined && grouping !== null) {
        getGroupingFromJson(grouping as ActivityJson[], groupingToSave);
    }
}
