import { Statement } from "@xapi/xapi";
import dotenv from "dotenv";
import { Workbook, Worksheet } from "exceljs";
import { obligatoryAttibutesStatements } from "../../consts/consts";

export class CsvToJsonVersionXAPI {
    private lrs_id: string;

    constructor(private filePath: string) {
        dotenv.config();
        this.lrs_id = process.env.LRS_ID ?? "";
    }

    async getData(): Promise<JSON[]> {
        const worksheet: Worksheet = await this.readFile();
        const headers = this.extractHeaders(worksheet);
        const data = this.convertDataToObject(headers, worksheet);
        const dataToRetrieve = this.filterExcedentData(data);
        const statements = this.transformData(dataToRetrieve);
        return JSON.parse(JSON.stringify(statements));
    }

    filterExcedentData(statementsData: { [key: string]: string | null }[]) {
        statementsData = statementsData.filter(
            (statement) => statement.lrs_id == this.lrs_id,
        );
        return statementsData.map((data) =>
            this.filterObject(data, obligatoryAttibutesStatements),
        );
    }

    transformData(statementsData: { [key: string]: string | null }[]) {
        const correctData: Statement[] = [];
        for (const statement of statementsData) {
            const newStatement: Statement = {
                id: statement.id!,
                actor: statement.actor ? JSON.parse(statement.actor) : null,
                verb: statement.verb ? JSON.parse(statement.verb) : null,
                object: statement.object ? JSON.parse(statement.object) : null,
                context: statement.context
                    ? JSON.parse(statement.context)
                    : null,
                result: statement.result ? JSON.parse(statement.result) : null,
                timestamp: statement.timestamp!,
                stored: statement.stored!,
            };
            correctData.push(newStatement);
        }
        return correctData;
    }

    async readFile() {
        const workbook = new Workbook();
        return await workbook.csv.readFile(this.filePath);
    }

    extractHeaders(worksheet: Worksheet) {
        const headers: { [key: string]: string } = {};
        const row = worksheet.getRow(1);
        row.eachCell((cell) => {
            headers[cell.value?.toString() ?? ""] = cell.$col$row.replace(
                /[\d$]+/g,
                "",
            );
        });
        return headers;
    }

    convertDataToObject(
        headers: { [key: string]: string },
        worksheet: Worksheet,
    ): { [key: string]: string | null }[] {
        const preparedData: { [key: string]: string | null }[] = [];
        const onlyHeaders = Object.keys(headers);
        worksheet.eachRow((row, numberRow) => {
            const currentData: { [key: string]: string | null } = {};
            if (numberRow != 1) {
                onlyHeaders.forEach((keyName) => {
                    return (currentData[keyName] =
                        row.getCell(headers[keyName]).value?.toString() ??
                        null);
                });
                preparedData.push(currentData);
            }
        });
        return preparedData;
    }

    filterObject(
        original: { [key: string]: string | null },
        attributes: string[],
    ) {
        const filteredObject: { [key: string]: string | null } = {};
        attributes.forEach((attr) => {
            if (attr in original) {
                filteredObject[attr] = original[attr];
            }
        });
        return filteredObject;
    }
}
