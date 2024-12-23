"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuxiliarFiles = exports.deleteFile = exports.clearDatFile = exports.readJsonFile = exports.saveAuxiliarData = exports.getAllStatements = void 0;
const fs_1 = require("fs");
function getAllStatements() {
    console.log("Extrayendo declaraciones del archivo");
    const file = (0, fs_1.readFileSync)("data/LRSPruebasTiemposInactivos.json", "utf-8");
    return JSON.parse(file);
}
exports.getAllStatements = getAllStatements;
function saveAuxiliarData(dataToSave, fileName) {
    (0, fs_1.writeFileSync)(`src/auxiliarFiles/${fileName}.json`, JSON.stringify(dataToSave, null, 2), "utf8");
}
exports.saveAuxiliarData = saveAuxiliarData;
function readJsonFile(fileName) {
    const file = (0, fs_1.readFileSync)(`src/auxiliarFiles/${fileName}.json`, "utf-8");
    try {
        return JSON.parse(file);
    }
    catch (e) {
        console.error("Ha ocurrido un error al leer el archivo", e);
        console.log("Contenido del archivo", file, fileName);
        return [];
    }
}
exports.readJsonFile = readJsonFile;
function clearDatFile(fileName) {
    (0, fs_1.writeFileSync)(`src/auxiliarFiles/${fileName}.json`, "", "utf8");
}
exports.clearDatFile = clearDatFile;
function deleteFile(filePath) {
    if ((0, fs_1.existsSync)(filePath)) {
        (0, fs_1.unlinkSync)(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
    }
}
exports.deleteFile = deleteFile;
function deleteAuxiliarFiles() {
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
exports.deleteAuxiliarFiles = deleteAuxiliarFiles;
