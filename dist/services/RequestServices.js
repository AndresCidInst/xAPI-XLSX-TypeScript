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
        this.statements_endpoint = process.env.STATEMENTS_ENDPOINT;
        this.endpoint = process.env.ENDPOINT;
        this.version = (_a = process.env.VERSION) !== null && _a !== void 0 ? _a : "";
        this.buildHeaders();
    }
    getAllStatements() {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedStatements = [];
            let lastTimeStampFromLrs = "";
            const latestStatement = yield this.getLastStatementsId();
            let lastStatementFromLrs;
            let fromStatements = [];
            try {
                do {
                    fromStatements =
                        yield this.fetchStatements(lastTimeStampFromLrs);
                    retrievedStatements.push(...fromStatements);
                    //process.stdout.write("\r\x1B[K");
                    console.log("\rSe han obtenido " +
                        retrievedStatements.length +
                        " statements. Comprobando la existencia del ultimo statemnt: " +
                        retrievedStatements.includes(latestStatement));
                    lastStatementFromLrs =
                        retrievedStatements[retrievedStatements.length - 1];
                    if (new Date(lastStatementFromLrs.timestamp) >
                        new Date(lastTimeStampFromLrs)) {
                        console.log(lastStatementFromLrs.timestamp);
                    }
                    if (fromStatements.length > 0) {
                        lastTimeStampFromLrs = lastStatementFromLrs.timestamp;
                    }
                } while (fromStatements.length == 100);
                this.verificationContainsStatements(retrievedStatements);
            }
            catch (error) {
                console.error("Error al obtener los statements:", error);
                throw error;
            }
            return JSON.parse(JSON.stringify(retrievedStatements));
        });
    }
    fetchStatements(lastTimeStamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`${this.statements_endpoint}/statements`, {
                headers: this.headers,
                params: {
                    ascending: "true",
                    since: lastTimeStamp,
                    limit: 100,
                },
            });
            return this.responseData(response);
        });
    }
    getLastStatementsId() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastStatements = yield axios_1.default.get(`${this.endpoint}/api/connection/statement`, {
                headers: this.headers,
                params: {
                    sort: '{"timestamp": -1}',
                },
            });
            return lastStatements.data.edges["0"].node.statement;
        });
    }
    compareDates(currentTime, lastTimeSaved) {
        return lastTimeSaved.includes(currentTime);
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
