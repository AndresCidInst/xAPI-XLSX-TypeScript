import { Statement } from "@xapi/xapi";
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

export class RequestServices {
    private token: string | undefined;
    private endpoint: string | undefined;
    private version: string;
    private headers: { [key: string]: string } | undefined;

    constructor() {
        dotenv.config();
        this.token = process.env.TOKEN;
        this.endpoint = process.env.ENDPOINT;
        this.version = process.env.VERSION ?? "";
        this.buildHeaders();
    }

    async getAllStatements() {
        const retrievedStatements: Statement[] = [];
        let fromStatements: Statement[] = [];
        console.log("Obteniendo statements...");
        do {
            let lastStatementTimeStamp: string = "";
            if (retrievedStatements.length > 0) {
                lastStatementTimeStamp =
                    retrievedStatements[retrievedStatements.length - 1][
                        "timestamp"
                    ] ?? "";
            }
            const statements: AxiosResponse<{ statements: Statement[] }> =
                await axios.get(`${this.endpoint}/statements`, {
                    headers: this.headers,
                    params: {
                        ascending: "true",
                        since: lastStatementTimeStamp,
                    },
                });
            fromStatements = this.responseData(statements);
            retrievedStatements.push(...fromStatements);
            process.stdout.write("\r\x1B[K");

            process.stdout.write(
                "\rSe han obtenido " +
                    retrievedStatements.length +
                    " statements",
            );
        } while (fromStatements.length == 100);
        this.verificationContainsStatements(retrievedStatements);
        return JSON.parse(JSON.stringify(retrievedStatements));
    }

    async getSomeStatements(numberOfStatements: number) {
        const statements: AxiosResponse = await axios.get(
            `${this.endpoint}/statements`,
            {
                headers: this.headers,
                params: {
                    ascending: "true",
                    limit: numberOfStatements,
                },
            },
        );
        return this.responseData(statements);
    }

    buildHeaders() {
        this.headers = {
            "Content-Type": "application/json",
            Authorization: `${this.token}`,
            "X-Experience-API-Version": this.version,
        };
    }

    responseData(response: AxiosResponse) {
        if (response.status == 200) {
            return response.data["statements"];
        }
        console.error("Error al obtener los statements del LRS ❌.");
        console.log(response.statusText);
        return [];
    }

    verificationContainsStatements(statements: Statement[]) {
        if (statements.length > 0) {
            process.stdout.write("\r\x1B[KObtencion completa\n");
        } else {
            process.stdout.write(
                "\r\x1B[KNo se pudieron obtener los statements\n",
            );
        }
    }
}
