"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinateActivityRetrieval = exports.coordinateChoiceRetrieval = exports.saveMainDataInExcel = exports.getExcelSheetFromPath = exports.createExcelFile = void 0;
const exceljs_1 = __importStar(require("exceljs"));
const FileProvider_1 = require("../FileProviders/FileProvider");
const AuxiliarFiles_1 = require("../consts/AuxiliarFiles");
const consts_1 = require("../consts/consts");
async function createExcelFile() {
    const workbook = new exceljs_1.default.Workbook();
    addMainSheet(workbook);
    saveChoicesInExcel(workbook);
    saveCategoryInExcel(workbook);
    saveGroupingInExcel(workbook);
    await addExplicativeDataToNewExcel(workbook);
    await workbook.xlsx.writeFile(`out/tego_V${process.env.npm_package_version}.xlsx`);
}
exports.createExcelFile = createExcelFile;
async function addExplicativeDataToNewExcel(newWorkbook) {
    const complementaryData = new exceljs_1.Workbook();
    await complementaryData.xlsx.readFile("data/DiccionarioDatosYComplementos.xlsx");
    complementaryData.eachSheet((sheet) => {
        const createdSheet = newWorkbook.addWorksheet(sheet.name);
        copyCells(createdSheet, sheet);
        combinateCells(createdSheet, sheet);
        // Comitear las filas para guardar cambios
        createdSheet.commit;
    });
}
function copyCells(createdSheet, originalSheet) {
    originalSheet.columns.forEach((col, index) => {
        const newCol = createdSheet.getColumn(index + 1);
        newCol.width = col.width;
        newCol.style = col.style;
        col.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
            const newCell = createdSheet.getRow(rowNumber).getCell(index + 1);
            newCell.value = cell.value;
            newCell.style = cell.style;
            newCell.numFmt = cell.numFmt;
            newCell.font = cell.font;
            newCell.alignment = cell.alignment;
            newCell.border = cell.border;
            newCell.fill = cell.fill;
        });
    });
}
function combinateCells(createdSheet, originalSheet) {
    originalSheet.model.merges.forEach((merge) => {
        createdSheet.mergeCells(merge);
    });
}
async function getExcelSheetFromPath(sheetName, filePath) {
    const workbook = new exceljs_1.default.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook.getWorksheet(sheetName);
}
exports.getExcelSheetFromPath = getExcelSheetFromPath;
function saveMainDataInExcel(tegoSheet) {
    const tegoData = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AuxiliarFiles.datos_tego);
    const headers = getSheetHeaders(tegoSheet);
    const formatedData = formatingData(tegoData, headers);
    tegoSheet.addRows(formatedData);
}
exports.saveMainDataInExcel = saveMainDataInExcel;
function formatingData(dataList, headers) {
    const formatedData = [];
    dataList.forEach((data) => {
        const dataToSave = [];
        Object.entries(data).forEach(([key, value]) => {
            const index = headers.findIndex((header) => header === consts_1.fillHeaders[key]);
            dataToSave[index] = value;
        });
        formatedData.push(dataToSave);
    });
    return formatedData;
}
function getSheetHeaders(workSheet) {
    const headers = [];
    workSheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString() ?? "");
    });
    return headers;
}
function addMainSheet(workbook) {
    const tegoSheet = workbook.addWorksheet(AuxiliarFiles_1.AuxiliarFiles.datos_tego);
    const headersToAdd = Object.values(consts_1.fillHeaders);
    tegoSheet.addRow(headersToAdd);
}
function saveChoicesInExcel(workbook) {
    const choicesSheet = workbook.addWorksheet(AuxiliarFiles_1.AuxiliarFiles.choices);
    choicesSheet.addRow(["id", "idChoice", "description"]);
    const choices = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AuxiliarFiles.choices);
    choices.forEach((choice, index) => {
        choicesSheet.addRow([index + 1, choice.idChoice, choice.description]);
    });
}
function saveCategoryInExcel(workbook) {
    const categorySheet = workbook.addWorksheet(AuxiliarFiles_1.AuxiliarFiles.category);
    categorySheet.addRow(["id", "idActividad"]);
    const category = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AuxiliarFiles.category);
    category.forEach((category, index) => {
        categorySheet.addRow([index + 1, category.idActivity]);
    });
}
function saveGroupingInExcel(workbook) {
    const groupingSheet = workbook.addWorksheet(AuxiliarFiles_1.AuxiliarFiles.grouping);
    groupingSheet.addRow(["id", "idActividad"]);
    const grouping = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AuxiliarFiles.grouping);
    grouping.forEach((grouping, index) => {
        groupingSheet.addRow([index + 1, grouping.idActivity]);
    });
}
/*
function saveParentInExcel(workbook: Excel.Workbook) {
    const parentSheet = workbook.addWorksheet(AxiliarFiles.parent);
    parentSheet.addRow(["id", "idActividad", "nombre", "descripcion"]);

    const parent: Parent[] = readJsonFile(
        AxiliarFiles.parent,
    ) as unknown as Parent[];
    parent.forEach((parent, index) => {
        parentSheet.addRow([
            index + 1,
            parent.idActividad,
            parent.name,
            parent.description,
        ]);
    });
}
*/
function coordinateChoiceRetrieval(workSheet, data) {
    const choicesAddress = [];
    workSheet.eachRow((row) => {
        if (data.some((choice) => row.getCell(2).value === choice.id) &&
            data.some((choice) => row.getCell(3).value === choice.description["es-CL"])) {
            choicesAddress.push(`${workSheet.name}!${row.getCell(1).address}`);
        }
    });
    return arrayToCoordinate(choicesAddress);
}
exports.coordinateChoiceRetrieval = coordinateChoiceRetrieval;
function coordinateActivityRetrieval(workSheet, data) {
    const activityAddress = [];
    workSheet.eachRow((row) => {
        if (data.some((activity) => row.getCell(2).value === activity.id)) {
            activityAddress.push(`${workSheet.name}!${row.getCell(1).address}`);
        }
    });
    return arrayToCoordinate(activityAddress);
}
exports.coordinateActivityRetrieval = coordinateActivityRetrieval;
function arrayToCoordinate(array) {
    return `${array.join(' & ", " & ')}`;
}
