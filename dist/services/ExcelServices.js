"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinateActivityRetrieval = exports.coordinateChoiceRetrieval = exports.saveMainDataInExcel = exports.createExcelFile = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const FileProvider_1 = require("../FileProviders/FileProvider");
const AuxiliarFiles_1 = require("../consts/AuxiliarFiles");
const consts_1 = require("../consts/consts");
async function createExcelFile() {
    const workbook = new exceljs_1.default.Workbook();
    addMainSheet(workbook);
    saveChoicesInExcel(workbook);
    saveCategoryInExcel(workbook);
    saveGroupingInExcel(workbook);
    saveParentInExcel(workbook);
    await workbook.xlsx.writeFile(`out/tego_V${process.env.npm_package_version}.xlsx`);
}
exports.createExcelFile = createExcelFile;
function saveMainDataInExcel(tegoSheet) {
    const tegoData = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AxiliarFiles.datos_tego);
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
        headers.push(cell.value.toString());
    });
    return headers;
}
function addMainSheet(workbook) {
    const tegoSheet = workbook.addWorksheet("datos_tego");
    const headersToAdd = Object.values(consts_1.fillHeaders);
    tegoSheet.addRow(headersToAdd);
}
function saveChoicesInExcel(workbook) {
    const choicesSheet = workbook.addWorksheet(AuxiliarFiles_1.AxiliarFiles.choices);
    choicesSheet.addRow(["id", "idChoice", "description"]);
    const choices = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AxiliarFiles.choices);
    choices.forEach((choice, index) => {
        choicesSheet.addRow([index + 1, choice.idChoice, choice.description]);
    });
}
function saveCategoryInExcel(workbook) {
    const categorySheet = workbook.addWorksheet(AuxiliarFiles_1.AxiliarFiles.category);
    categorySheet.addRow(["id", "idActividad"]);
    const category = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AxiliarFiles.category);
    category.forEach((category, index) => {
        categorySheet.addRow([index + 1, category.idActivity]);
    });
}
function saveGroupingInExcel(workbook) {
    const groupingSheet = workbook.addWorksheet(AuxiliarFiles_1.AxiliarFiles.grouping);
    groupingSheet.addRow(["id", "idActividad"]);
    const grouping = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AxiliarFiles.grouping);
    grouping.forEach((grouping, index) => {
        groupingSheet.addRow([index + 1, grouping.idActivity]);
    });
}
function saveParentInExcel(workbook) {
    const parentSheet = workbook.addWorksheet(AuxiliarFiles_1.AxiliarFiles.parent);
    parentSheet.addRow(["id", "idActividad", "nombre", "descripcion"]);
    const parent = (0, FileProvider_1.readJsonFile)(AuxiliarFiles_1.AxiliarFiles.parent);
    parent.forEach((parent, index) => {
        parentSheet.addRow([
            index + 1,
            parent.idActividad,
            parent.name,
            parent.description,
        ]);
    });
}
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
