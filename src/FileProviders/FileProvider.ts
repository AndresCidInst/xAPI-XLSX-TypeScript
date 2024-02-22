import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

export function getAllStatements(): JSON[] {
    console.log("Extrayendo declaraciones del archivo");
    const file = readFileSync("data/prueba-01-prueba.json", "utf-8");
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
        exit(1);
        return [];
    }
}

export function clearDatFile(fileName: string) {
    writeFileSync(`src/auxiliarFiles/${fileName}.json`, "", "utf8");
}
