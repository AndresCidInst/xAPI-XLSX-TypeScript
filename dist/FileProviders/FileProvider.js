"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDatFile = exports.readJsonFile = exports.saveAuxiliarData = exports.getAllStatements = void 0;
const fs_1 = require("fs");
const process_1 = require("process");
function getAllStatements() {
    const file = (0, fs_1.readFileSync)("data/prueba-01-Prueba.json", "utf-8");
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
        (0, process_1.exit)(1);
        return [];
    }
}
exports.readJsonFile = readJsonFile;
function clearDatFile(fileName) {
    (0, fs_1.writeFileSync)(`src/auxiliarFiles/${fileName}.json`, "", "utf8");
}
exports.clearDatFile = clearDatFile;
