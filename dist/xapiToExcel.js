"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xapiToExcel = void 0;
const exceljs_1 = require("exceljs");
const FileProvider_1 = require("./FileProviders/FileProvider");
const AuxiliarFiles_1 = require("./consts/AuxiliarFiles");
const consts_1 = require("./consts/consts");
const StatetementsCleaners_1 = require("./services/CleanersStatements/StatetementsCleaners");
const CsvToJsonVersionXAPI_1 = require("./services/CsvToJsonVersionXAPI/CsvToJsonVersionXAPI");
const ProcessData_1 = require("./services/DataProcessor/ProcessData");
const extraColumnsAdders_1 = require("./services/DataProcessor/extraColumnsAdders");
const ExcelServices_1 = require("./services/ExcelServices");
const RequestServices_1 = require("./services/RequestServices");
const GeneralCorrector_1 = require("./services/formatCorrectors/GeneralCorrector");
const RefactorSwipCardsSuccess_1 = require("./services/formatCorrectors/RefactorSwipCardsSuccess/RefactorSwipCardsSuccess");
const RealDurationSeparator_1 = require("./services/formatCorrectors/SeparateRealDurations/RealDurationSeparator");
const DurationUtils_1 = require("./services/formatCorrectors/SeparateRealDurations/utils/DurationUtils");
const CategoryManipulator_1 = require("./services/manipulators/CategoryManipulator");
const ChoicesManipulators_1 = require("./services/manipulators/ChoicesManipulators");
const GroupingManipulator_1 = require("./services/manipulators/GroupingManipulator");
const ParentManipulator_1 = require("./services/manipulators/ParentManipulator");
const projectAllocator_1 = require("./services/projectAllocator/projectAllocator");
/**
 * Convierte los datos de xAPI a un formato compatible con Excel y los inserta en el archivo.
 * @returns Una promesa que se resuelve cuando se han insertado los datos en el archivo.
 */
async function xapiToExcel(fromLrs, fileName) {
    let statements = [];
    if (fromLrs) {
        const requestServices = new RequestServices_1.RequestServices();
        // eslint-disable-next-line prefer-const
        statements = await requestServices.getAllStatements();
    }
    else {
        console.log("Cargando datos del archivo CSV");
        const csvXAPI = new CsvToJsonVersionXAPI_1.CsvToJsonVersionXAPI(`data/${fileName}`);
        statements = await csvXAPI.getData();
    }
    console.log("Limpiando declaraciones fallidas...");
    let newStatements = (0, StatetementsCleaners_1.clearFailedStatements)(statements);
    console.log("Declaraciones fallidas limpiadas ✅.");
    console.log("Corrigiendo detalles de las declaraciones...");
    newStatements.sort(GeneralCorrector_1.compareDates);
    newStatements = refactorStatementsFormatsAndData(newStatements);
    newStatements = await (0, projectAllocator_1.projectAllocator)(newStatements);
    console.log("Corrección de detalles de las declaraciones completada ✅.");
    await prepareComplementData(newStatements);
    await insertData(newStatements);
}
exports.xapiToExcel = xapiToExcel;
function refactorStatementsFormatsAndData(statements) {
    for (const statement of statements) {
        correctFormat(statement);
    }
    statements = (0, RealDurationSeparator_1.separeDurationFromRealDuration)(statements);
    statements = JSON.parse(JSON.stringify((0, RefactorSwipCardsSuccess_1.refactorSwipCardsSuccess)(statements)));
    return statements;
}
/**
 * Corrige el formato de una declaración xAPI.
 * @param statement La declaración xAPI a corregir.
 */
function correctFormat(statement) {
    const currentStatement = Object(statement);
    (0, GeneralCorrector_1.correctUriExtensionsGeneralFormat)(statement);
    (0, GeneralCorrector_1.removeAllDomainFromUris)(statement);
    (0, GeneralCorrector_1.typeActivityCorrector)(statement);
    if (currentStatement["verb"]["id"] == "verbs/skipped-forward" ||
        currentStatement["verb"]["id"] == "verbs/skipped-backward") {
        (0, GeneralCorrector_1.correctSkippedVideoExtensions)(statement);
    }
    if (wordSoupFormattingCase(statement)) {
        (0, GeneralCorrector_1.correctUriExtensionResultWordSoup)(statement);
    }
    if (currentStatement.verb.id.includes("pressed") &&
        currentStatement.object.id.includes("sopaDeLetras")) {
        (0, GeneralCorrector_1.typeGamePressInWordSoupInsert)(statement);
        if (currentStatement.object.id.includes("unlockWord")) {
            (0, GeneralCorrector_1.trueSuccessToUnlockWord)(statement);
        }
    }
    if (Object(statement)["object"]["id"] === "activities/profile/avatars" &&
        statement.result?.extensions) {
        (0, GeneralCorrector_1.correctAvatarChangeResultExtensionUri)(statement);
    }
    if (currentStatement["verb"]["id"] == "verbs/viewed" &&
        currentStatement["object"]["id"].includes("feedback-trivia")) {
        (0, GeneralCorrector_1.descriptionFeedbackTriviaCorrect)(statement);
    }
    if (statement.verb.id.includes("verbs/changed-order") &&
        String(Object(statement).object.id).includes("reordenable")) {
        statement = (0, GeneralCorrector_1.reorderExtensionsCorrector)(statement);
    }
    (0, GeneralCorrector_1.correctInteractionPointsUriFormat)(statement);
    (0, GeneralCorrector_1.rounDecimals)(statement);
    (0, GeneralCorrector_1.formatDurationCorrect)(statement);
    (0, GeneralCorrector_1.correctDataTimeZone)(statement);
}
/**
 * Comprueba si una declaración de xAPI corresponde a un caso de formato de sopa de letras.
 *
 * @param statement La declaración de xAPI a comprobar.
 * @returns Devuelve true si la declaración corresponde a un caso de formato de sopa de letras, de lo contrario devuelve false.
 */
function wordSoupFormattingCase(statement) {
    const currentStatement = Object(statement);
    return ((currentStatement["verb"]["id"] == "verbs/attempted" ||
        currentStatement["verb"]["id"] == "verbs/found" ||
        currentStatement["verb"]["id"] == "verbs/played") &&
        currentStatement["object"]["id"].includes("sopaDeLetras"));
}
/**
 * Prepara los datos complementarios y crea un archivo Excel.
 * @param statements - Lista de declaraciones en formato JSON.
 * @returns Una promesa que se resuelve cuando se ha creado el archivo Excel.
 */
async function prepareComplementData(statements) {
    console.log("Preparando datos complementarios...");
    recopilateComplementData(statements);
    console.log("Creando archivo excel...");
    await (0, ExcelServices_1.createExcelFile)();
    clearAuxiliarFiles();
    console.log("Archivo Excel creado con exito. Datos complementarios almacenados con éxito ✅.");
}
/**
 * Realiza el proceso de darle forma a los datos principales e Insertlos en el archivo Excel.
 *
 * @param statements - Los statements que contienen los datos a insertar.
 * @returns Una promesa que se resuelve cuando los datos se han insertado correctamente.
 */
async function insertData(statements) {
    console.log("Recopilando datos principales de los statements...");
    const workbook = await recopilateMainData(statements);
    console.log("Datos principales recopilados con éxito ✅.");
    console.log("Guardando datos principales en el archivo excel...");
    saveMainData(workbook);
    await workbook.xlsx.writeFile(`out/tego_V${process.env.npm_package_version}.xlsx`);
    console.log("Datos principales guardados con éxito ✅.");
}
/**
 * Guarda los datos principales en el libro de Excel.
 *
 * @param workbook El libro de Excel donde se guardarán los datos.
 */
function saveMainData(workbook) {
    const tegoSheet = workbook.getWorksheet(AuxiliarFiles_1.AuxiliarFiles.datos_tego);
    if (tegoSheet === undefined) {
        console.error("No se encontró la hoja de datos del Tego ❌.");
        return;
    }
    (0, ExcelServices_1.saveMainDataInExcel)(tegoSheet);
}
/**
 * Limpia los archivos auxiliares.
 */
function clearAuxiliarFiles() {
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AuxiliarFiles.choices);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AuxiliarFiles.category);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AuxiliarFiles.grouping);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AuxiliarFiles.parent);
}
/**
 * Recopila los datos principales a partir de una lista de declaraciones xAPI y los guarda en un archivo Excel.
 *
 * @param statements - Lista de declaraciones xAPI.
 * @returns El objeto Workbook que representa el archivo Excel modificado.
 */
async function recopilateMainData(statements) {
    const workbook = new exceljs_1.Workbook();
    await workbook.xlsx.readFile(`out/tego_V${process.env.npm_package_version}.xlsx`);
    const sheetList = workbook.worksheets;
    const processedData = [];
    const dataKeys = Object.keys(consts_1.fillHeaders);
    const keyToProcessStatements = dataKeys.filter((key) => key != "object|definition|name|unity|es-CL" &&
        key != "object|definition|name|subname|es-CL");
    const statementsObject = statements;
    const reformatedRealTimeStatements = [];
    statementsObject.forEach((statement) => {
        reformatedRealTimeStatements.push(formatDurations(statement));
    });
    reformatedRealTimeStatements.forEach((statement) => {
        processedData.push((0, ProcessData_1.dataRetriever)(statement, keyToProcessStatements, sheetList));
    });
    const finalData = (0, extraColumnsAdders_1.addUnityAndSubActivityColumn)(statementsObject, processedData);
    (0, FileProvider_1.saveAuxiliarData)(finalData, AuxiliarFiles_1.AuxiliarFiles.datos_tego);
    return workbook;
}
function formatDurations(statement) {
    let extensiones = undefined;
    if (statement.result?.extensions) {
        extensiones = statement.result.extensions;
    }
    if (extensiones &&
        extensiones["https://xapi.tego.iie.cl/extensions/real_duration"]) {
        let tiempoActual = extensiones["https://xapi.tego.iie.cl/extensions/real_duration"];
        if (extensiones["https://xapi.tego.iie.cl/extensions/real_duration"].includes("-")) {
            tiempoActual = tiempoActual.replace("-", "");
        }
        let nuevoFormatoDuracion = (0, DurationUtils_1.convertToSeconds)(tiempoActual).toString();
        if (extensiones["https://xapi.tego.iie.cl/extensions/real_duration"].includes("-")) {
            nuevoFormatoDuracion = nuevoFormatoDuracion.replace("-", "");
        }
        statement.result.extensions["https://xapi.tego.iie.cl/extensions/real_duration"] = nuevoFormatoDuracion == "0" ? "1" : nuevoFormatoDuracion;
    }
    return statement;
}
/**
 * Recopila datos complementarios de una lista de declaraciones xAPI.
 *
 * @param statements - Lista de declaraciones xAPI.
 */
function recopilateComplementData(statements) {
    const choicesToSave = [];
    const parentToSave = [];
    const categoryToSave = [];
    const groupingToSave = [];
    for (const statement of statements) {
        captureChoices(statement, choicesToSave);
        captureParent(statement, parentToSave);
        capturerCategory(statement, categoryToSave);
        captureGrouping(statement, groupingToSave);
    }
    validationAdditionData(choicesToSave, parentToSave, categoryToSave, groupingToSave);
}
/**
 * Valida y guarda los datos adicionales en archivos auxiliares según los parámetros proporcionados.
 *
 * @param choicesToSave - Arreglo de objetos Choice a guardar.
 * @param parentToSave - Arreglo de objetos Parent a guardar.
 * @param categoryToSave - Arreglo de objetos Activity a guardar.
 * @param groupingToSave - Arreglo de objetos Activity a guardar.
 */
function validationAdditionData(choicesToSave, parentToSave, categoryToSave, groupingToSave) {
    if (choicesToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(choicesToSave, AuxiliarFiles_1.AuxiliarFiles.choices);
    }
    if (parentToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(parentToSave, AuxiliarFiles_1.AuxiliarFiles.parent);
    }
    if (categoryToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(categoryToSave, AuxiliarFiles_1.AuxiliarFiles.category);
    }
    if (groupingToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(groupingToSave, AuxiliarFiles_1.AuxiliarFiles.grouping);
    }
}
/**
 * Captura las opciones de una declaracion y las guarda en un arreglo de opciones.
 *
 * @param statement - El enunciado en formato JSON.
 * @param choicesToSave - El arreglo de opciones donde se guardarán las opciones capturadas.
 */
function captureChoices(statement, choicesToSave) {
    const choices = (0, ProcessData_1.getValueByPath)(statement, "object|definition|choices");
    if (choices !== undefined && choices !== null) {
        (0, ChoicesManipulators_1.choiceMolder)(choices, choicesToSave);
    }
}
/**
 * Captura la actividad padre de una declaración y lo guarda en un arreglo de padres.
 *
 * @param statement - La declaración JSON de la cual se desea capturar el padre.
 * @param parentToSave - El arreglo de padres en el cual se guardará el padre capturado.
 */
function captureParent(statement, parentToSave) {
    const parent = (0, ProcessData_1.getValueByPath)(statement, "context|contextActivities|parent|0");
    if (parent !== undefined && parent !== null) {
        (0, ParentManipulator_1.parentDataMolder)(parent, parentToSave);
    }
}
/**
 * Captura la categoría dentro del atributo 'cetegory' de una declaración y la guarda en un arreglo de actividades.
 *
 * @param statement - La declaración JSON de la cual se desea capturar la categoría.
 * @param categoryToSave - El arreglo de actividades en el cual se guardará la categoría capturada.
 */
function capturerCategory(statement, categoryToSave) {
    const category = (0, ProcessData_1.getValueByPath)(statement, "context|contextActivities|category");
    if (category !== undefined && category !== null) {
        (0, CategoryManipulator_1.saveCategory)(category, categoryToSave);
    }
}
/**
 * Captura las actividades dentro del atributo 'grouping' de una declaracion y lo guarda en una lista de actividades.
 *
 * @param statement - La declaración JSON de la cual se desea capturar el agrupamiento.
 * @param groupingToSave - La lista de actividades en la cual se guardarán los agrupamientos capturados.
 */
function captureGrouping(statement, groupingToSave) {
    const grouping = (0, ProcessData_1.getValueByPath)(statement, "context|contextActivities|grouping");
    if (grouping !== undefined && grouping !== null) {
        (0, GroupingManipulator_1.getGroupingFromJson)(grouping, groupingToSave);
    }
}
