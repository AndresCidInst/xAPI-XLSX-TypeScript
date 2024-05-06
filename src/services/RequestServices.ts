import { Statement } from "@xapi/xapi";
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

export class RequestServices {
    private token: string | undefined;
    private statements_endpoint: string | undefined;
    private endpoint: string | undefined;
    private version: string;
    private headers: { [key: string]: string } | undefined;

    constructor() {
        dotenv.config();
        this.token = process.env.TOKEN;
        this.statements_endpoint = process.env.STATEMENTS_ENDPOINT;
        this.endpoint = process.env.ENDPOINT;
        this.version = process.env.VERSION ?? "";
        this.buildHeaders();
    }

    async getAllStatements(): Promise<JSON[]> {
        const retrievedStatements: Statement[] = [];
        let lastTimeStampFromLrs: string = "";
        const latestStatement: Statement = await this.getLastStatementsId();
        let lastStatementFromLrs: Statement;
        let fromStatements: Statement[] = [];
        try {
            do {
                fromStatements =
                    await this.fetchStatements(lastTimeStampFromLrs);
                retrievedStatements.push(...fromStatements);
                //process.stdout.write("\r\x1B[K");
                console.log(
                    "\rSe han obtenido " +
                        retrievedStatements.length +
                        " statements. Comprobando la existencia del ultimo statemnt: " +
                        retrievedStatements.includes(latestStatement),
                );
                lastStatementFromLrs =
                    retrievedStatements[retrievedStatements.length - 1];
                if (
                    new Date(lastStatementFromLrs.timestamp!) >
                    new Date(lastTimeStampFromLrs)
                ) {
                    console.log(lastStatementFromLrs.timestamp!);
                }
                if (fromStatements.length > 0) {
                    lastTimeStampFromLrs = lastStatementFromLrs.timestamp!;
                }
            } while (fromStatements.length == 100);

            this.verificationContainsStatements(retrievedStatements);
        } catch (error) {
            console.error("Error al obtener los statements:", error);
            throw error;
        }

        return JSON.parse(JSON.stringify(retrievedStatements));
    }

    private async fetchStatements(lastTimeStamp: string): Promise<Statement[]> {
        const response = await axios.get(
            `${this.statements_endpoint}/statements`,
            {
                headers: this.headers,
                params: {
                    ascending: "true",
                    since: lastTimeStamp,
                    limit: 100,
                },
            },
        );

        return this.responseData(response);
    }

    async getLastStatementsId(): Promise<Statement> {
        const lastStatements: AxiosResponse = await axios.get(
            `${this.endpoint}/api/connection/statement`,
            {
                headers: this.headers,
                params: {
                    sort: '{"timestamp": -1}',
                },
            },
        );
        return lastStatements.data.edges["0"].node.statement;
    }

    compareDates(currentTime: string, lastTimeSaved: string[]): boolean {
        return lastTimeSaved.includes(currentTime);
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
