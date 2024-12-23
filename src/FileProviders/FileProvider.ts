import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";

export function getAllStatements(): JSON[] {
    console.log("Extrayendo declaraciones del archivo");
    const file = readFileSync("data/LRSPruebasTiemposInactivos.json", "utf-8");
    return JSON.parse(file);
}

export function saveAuxiliarData(dataToSave: unknown, fileName: string) {
    writeFileSync(
        `src/auxiliarFiles/${fileName}.json`,
        JSON.stringify(dataToSave, null, 2),
        "utf8",
    );
}

export function readJsonFile(fileName: string): JSON[] {
    const file = readFileSync(`src/auxiliarFiles/${fileName}.json`, "utf-8");
    try {
        return JSON.parse(file);
    } catch (e) {
        console.error("Ha ocurrido un error al leer el archivo", e);
        console.log("Contenido del archivo", file, fileName);
        return [];
    }
}

export function clearDatFile(fileName: string) {
    writeFileSync(`src/auxiliarFiles/${fileName}.json`, "", "utf8");
}

export function deleteFile(filePath: string) {
    if (existsSync(filePath)) {
        unlinkSync(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
    }
}

export function deleteAuxiliarFiles() {
    const auxiliarFiles = [
        "./../auxiliarFiles/parent.json",
        "./../auxiliarFiles/opciones_de_respuesta.json",
        "./../auxiliarFiles/grupos_de_actividad.json",
        "./../auxiliarFiles/grouping.json",
        "./../auxiliarFiles/DATOS-TEGO.json",
        "./../auxiliarFiles/datos_tego.json",
        "./../auxiliarFiles/choices.json",
        "./../auxiliarFiles/category.json",
        "./../auxiliarFiles/categorias_de_actividad.json",
    ];

    for (const fileName in auxiliarFiles) {
        deleteFile(fileName);
    }
}
