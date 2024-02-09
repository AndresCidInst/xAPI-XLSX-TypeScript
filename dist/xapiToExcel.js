"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xapiToExcel = void 0;
const exceljs_1 = require("exceljs");
const FileProvider_1 = require("./FileProviders/FileProvider");
const consts_1 = require("./consts/consts");
const AuxiliarFiles_1 = require("./models/AuxiliarFiles");
const ExcelServices_1 = require("./services/ExcelServices");
const FormatCorrector_1 = require("./services/FormatCorrector");
const ProcessData_1 = require("./services/ProcessData");
const CategoryManipulator_1 = require("./services/manipulators/CategoryManipulator");
const ChoicesManipulators_1 = require("./services/manipulators/ChoicesManipulators");
const GroupingManipulator_1 = require("./services/manipulators/GroupingManipulator");
const ParentManipulator_1 = require("./services/manipulators/ParentManipulator");
/**
 * Convierte los datos de xAPI a un formato compatible con Excel y los inserta en el archivo.
 * @returns Una promesa que se resuelve cuando se han insertado los datos en el archivo.
 */
function xapiToExcel() {
    return __awaiter(this, void 0, void 0, function* () {
        //const requestServices = new RequestServices();
        //const statements: JSON[] = await requestServices.getAllStatements();
        const statements = (0, FileProvider_1.getAllStatements)();
        console.log("Corrigiendo formato de extensiones...");
        for (const statement of statements) {
            correctFormat(statement);
        }
        yield prepareData(statements);
        yield insertData(statements);
    });
}
exports.xapiToExcel = xapiToExcel;
/**
 * Corrige el formato de una declaración xAPI.
 * @param statement La declaración xAPI a corregir.
 */
function correctFormat(statement) {
    var _a;
    (0, FormatCorrector_1.correctUriExtensionsGeneralFormat)(statement);
    (0, FormatCorrector_1.correctInteractionPointsUriFormat)(statement);
    (0, FormatCorrector_1.removeAllDomainFromUris)(statement);
    const currentStatement = Object(statement);
    if (currentStatement["verb"]["id"] == "skipped-forward" ||
        currentStatement["verb"]["id"] == "skipped-backward") {
        (0, FormatCorrector_1.correctSkippedVideoExtensions)(statement);
    }
    if (currentStatement["verb"]["id"] == "played" &&
        currentStatement["object"]["id"].includes("sopaDeLetras")) {
        (0, FormatCorrector_1.correctUriExtensionResultWordSoup)(statement);
    }
    if (Object(statement)["object"]["id"] === "activities/profile/avatars" &&
        ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions)) {
        (0, FormatCorrector_1.correctAvatarChangeResultExtensionUri)(statement);
    }
}
/**
 * Prepara los datos complementarios y crea un archivo Excel.
 * @param statements - Lista de declaraciones en formato JSON.
 * @returns Una promesa que se resuelve cuando se ha creado el archivo Excel.
 */
function prepareData(statements) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Preparando datos complementarios...");
        recopilateComplementData(statements);
        console.log("Creando archivo excel...");
        yield (0, ExcelServices_1.createExcelFile)();
        clearAuxiliarFiles();
        console.log("Archivo Excel creado con exito. Datos complementarios almacenados con éxito ✅.");
    });
}
/**
 * Realiza el proceso de darle forma a los datos principales e Insertlos en el archivo Excel.
 *
 * @param statements - Los statements que contienen los datos a insertar.
 * @returns Una promesa que se resuelve cuando los datos se han insertado correctamente.
 */
function insertData(statements) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Recopilando datos principales de los statements...");
        const workbook = yield recopilateMainData(statements);
        console.log("Datos principales recopilados con éxito ✅.");
        console.log("Guardando datos principales en el archivo excel...");
        saveMainData(workbook);
        yield workbook.xlsx.writeFile("out/tego.xlsx");
        console.log("Datos principales guardados con éxito ✅.");
    });
}
/**
 * Guarda los datos principales en el libro de Excel.
 *
 * @param workbook El libro de Excel donde se guardarán los datos.
 */
function saveMainData(workbook) {
    const tegoSheet = workbook.getWorksheet(AuxiliarFiles_1.AxiliarFiles.datos_tego);
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
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AxiliarFiles.choices);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AxiliarFiles.category);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AxiliarFiles.grouping);
    (0, FileProvider_1.clearDatFile)(AuxiliarFiles_1.AxiliarFiles.parent);
}
/**
 * Recopila los datos principales a partir de una lista de declaraciones xAPI y los guarda en un archivo Excel.
 *
 * @param statements - Lista de declaraciones xAPI.
 * @returns El objeto Workbook que representa el archivo Excel modificado.
 */
function recopilateMainData(statements) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.Workbook();
        yield workbook.xlsx.readFile("out/tego.xlsx");
        const sheetList = workbook.worksheets;
        const finalData = [];
        const dataKeys = Object.keys(consts_1.fillHeaders);
        statements.forEach((statementJson) => {
            const statement = statementJson;
            finalData.push((0, ProcessData_1.dataRetriever)(statement, dataKeys, sheetList));
        });
        (0, FileProvider_1.saveAuxiliarData)(finalData, AuxiliarFiles_1.AxiliarFiles.datos_tego);
        return workbook;
    });
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
        (0, FileProvider_1.saveAuxiliarData)(choicesToSave, AuxiliarFiles_1.AxiliarFiles.choices);
    }
    if (parentToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(parentToSave, AuxiliarFiles_1.AxiliarFiles.parent);
    }
    if (categoryToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(categoryToSave, AuxiliarFiles_1.AxiliarFiles.category);
    }
    if (groupingToSave.length > 0) {
        (0, FileProvider_1.saveAuxiliarData)(groupingToSave, AuxiliarFiles_1.AxiliarFiles.grouping);
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
