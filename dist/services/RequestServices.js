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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestServices = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
class RequestServices {
    constructor() {
        var _a;
        dotenv_1.default.config();
        this.token = process.env.TOKEN;
        this.endpoint = process.env.ENDPOINT;
        this.version = (_a = process.env.VERSION) !== null && _a !== void 0 ? _a : "";
        this.buildHeaders();
    }
    getAllStatements() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedStatements = [];
            let fromStatements = [];
            console.log("Obteniendo statements...");
            let lastStatementTimeStamp = "";
            do {
                if (retrievedStatements.length > 0) {
                    lastStatementTimeStamp =
                        (_a = retrievedStatements[retrievedStatements.length - 1]["timestamp"]) !== null && _a !== void 0 ? _a : "";
                }
                const statements = yield axios_1.default.get(`${this.endpoint}/statements`, {
                    headers: this.headers,
                    params: {
                        ascending: "true",
                        since: lastStatementTimeStamp,
                    },
                });
                fromStatements = this.responseData(statements);
                retrievedStatements.push(...fromStatements);
                process.stdout.write("\r\x1B[K");
                process.stdout.write("\rSe han obtenido " +
                    retrievedStatements.length +
                    " statements");
            } while (fromStatements.length == 100);
            this.verificationContainsStatements(retrievedStatements);
            return JSON.parse(JSON.stringify(retrievedStatements));
        });
    }
    getSomeStatements(numberOfStatements) {
        return __awaiter(this, void 0, void 0, function* () {
            const statements = yield axios_1.default.get(`${this.endpoint}/statements`, {
                headers: this.headers,
                params: {
                    ascending: "true",
                    limit: numberOfStatements,
                },
            });
            return this.responseData(statements);
        });
    }
    buildHeaders() {
        this.headers = {
            "Content-Type": "application/json",
            Authorization: `${this.token}`,
            "X-Experience-API-Version": this.version,
        };
    }
    responseData(response) {
        if (response.status == 200) {
            return response.data["statements"];
        }
        console.error("Error al obtener los statements del LRS ❌.");
        console.log(response.statusText);
        return [];
    }
    verificationContainsStatements(statements) {
        if (statements.length > 0) {
            process.stdout.write("\r\x1B[KObtencion completa\n");
        }
        else {
            process.stdout.write("\r\x1B[KNo se pudieron obtener los statements\n");
        }
    }
}
exports.RequestServices = RequestServices;
