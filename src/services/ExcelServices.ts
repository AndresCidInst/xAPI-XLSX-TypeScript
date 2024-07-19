import Excel, { Worksheet } from "exceljs";
import { readJsonFile } from "../FileProviders/FileProvider";
import { AxiliarFiles } from "../consts/AuxiliarFiles";
import { fillHeaders } from "../consts/consts";
import { Activity, ActivityJson } from "../models/ActivityModels";
import { Choice, ChoiceJson } from "../models/ChoicesModels";
import { DataModelImpl } from "../models/DataModel";
import { Parent } from "../models/ParentModels";

export async function createExcelFile() {
    const workbook = new Excel.Workbook();
    addMainSheet(workbook);
    saveChoicesInExcel(workbook);
    saveCategoryInExcel(workbook);
    saveGroupingInExcel(workbook);

    await workbook.xlsx.writeFile(
        `out/tego_V${process.env.npm_package_version}.xlsx`,
    );
}

export async function getExcelSheetFromPath(
    sheetName: string,
    filePath: string,
): Promise<Excel.Worksheet | undefined> {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook.getWorksheet(sheetName);
}

export function saveMainDataInExcel(tegoSheet: Worksheet) {
    const tegoData: DataModelImpl[] = readJsonFile(
        AxiliarFiles.datos_tego,
    ) as unknown as DataModelImpl[];
    const headers = getSheetHeaders(tegoSheet);
    const formatedData: unknown[] = formatingData(tegoData, headers);
    tegoSheet.addRows(formatedData);
}

function formatingData(dataList: DataModelImpl[], headers: string[]) {
    const formatedData: unknown[] = [];
    dataList.forEach((data) => {
        const dataToSave: unknown[] = [];
        Object.entries(data).forEach(([key, value]) => {
            const index = headers.findIndex(
                (header) =>
                    header === fillHeaders[key as keyof typeof fillHeaders],
            );
            dataToSave[index] = value;
        });
        formatedData.push(dataToSave);
    });
    return formatedData;
}

function getSheetHeaders(workSheet: Worksheet) {
    const headers: string[] = [];
    workSheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value!.toString());
    });
    return headers;
}

function addMainSheet(workbook: Excel.Workbook) {
    const tegoSheet = workbook.addWorksheet("DATOS-TEGO");
    const headersToAdd: string[] = Object.values(fillHeaders);
    tegoSheet.addRow(headersToAdd);
}

function saveChoicesInExcel(workbook: Excel.Workbook) {
    const choicesSheet = workbook.addWorksheet("opciones_de_respuesta");
    choicesSheet.addRow(["id", "idChoice", "description"]);

    const choices: Choice[] = readJsonFile(
        AxiliarFiles.choices,
    ) as unknown as Choice[];
    choices.forEach((choice, index) => {
        choicesSheet.addRow([index + 1, choice.idChoice, choice.description]);
    });
}

function saveCategoryInExcel(workbook: Excel.Workbook) {
    const categorySheet = workbook.addWorksheet("categorias_de_actividad");
    categorySheet.addRow(["id", "idActividad"]);

    const category: Activity[] = readJsonFile(
        AxiliarFiles.category,
    ) as unknown as Activity[];
    category.forEach((category, index) => {
        categorySheet.addRow([index + 1, category.idActivity]);
    });
}

function saveGroupingInExcel(workbook: Excel.Workbook) {
    const groupingSheet = workbook.addWorksheet("grupos_de_actividad");
    groupingSheet.addRow(["id", "idActividad"]);

    const grouping: Activity[] = readJsonFile(
        AxiliarFiles.grouping,
    ) as unknown as Activity[];
    grouping.forEach((grouping, index) => {
        groupingSheet.addRow([index + 1, grouping.idActivity]);
    });
}

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

export function coordinateChoiceRetrieval(
    workSheet: Worksheet,
    data: ChoiceJson[],
) {
    const choicesAddress: string[] = [];
    workSheet.eachRow((row) => {
        if (
            data.some((choice) => row.getCell(2).value === choice.id) &&
            data.some(
                (choice) =>
                    row.getCell(3).value === choice.description["es-CL"],
            )
        ) {
            choicesAddress.push(`${workSheet.name}!${row.getCell(1).address}`);
        }
    });
    return arrayToCoordinate(choicesAddress);
}

export function coordinateActivityRetrieval(
    workSheet: Worksheet,
    data: ActivityJson[],
) {
    const activityAddress: string[] = [];
    workSheet.eachRow((row) => {
        if (data.some((activity) => row.getCell(2).value === activity.id)) {
            activityAddress.push(`${workSheet.name}!${row.getCell(1).address}`);
        }
    });
    return arrayToCoordinate(activityAddress);
}

function arrayToCoordinate(array: string[]) {
    return `${array.join(' & ", " & ')}`;
}
