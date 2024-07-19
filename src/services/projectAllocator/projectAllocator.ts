import { getExcelSheetFromPath } from "../ExcelServices";
import { Worksheet } from "exceljs";
import { Statement } from "@xapi/xapi";

export async function projectAllocator(jsonStatements: JSON[]) {
    const usersSheet = await getExcelSheetFromPath(
        "Usuarios",
        "data/Datos Usabilidad TEGO DB.xlsx",
    );
    if (usersSheet) {
        const data = extractData(usersSheet);
        return injectProjectsToUsers(jsonStatements, data);
    }

    return jsonStatements;
}

function injectProjectsToUsers(
    jsonStatements: JSON[],
    data: { [key: string]: string },
): JSON[] {
    const newStatements = jsonStatements.map((jsonStatement) => {
        const statement = jsonStatement as unknown as Statement;
        const actorName = Object(statement).actor.account.name;
        const project = data[actorName];
        if (statement.context?.extensions) {
            statement.context.extensions["project"] = project;
        } else {
            statement.context = {
                ...statement.context,
                extensions: { project },
            };
        }

        return statement;
    });

    return JSON.parse(JSON.stringify(newStatements));
}

function extractData(usersSheet: Worksheet): { [key: string]: string } {
    const userAndProjects: { [key: string]: string } = {};
    usersSheet.eachRow((row, rowNumber) => {
        const rut = reformatString(row.getCell("B").value?.toString() ?? "");
        if (!rut.includes("-") || rut.includes(".")) {
            console.log("Cuidao, hay un rut con mal formato: " + rut);
        }
        if (rowNumber > 1) {
            const usuario: string = rut;
            userAndProjects[usuario] = row.getCell("E").value?.toString() ?? "";
        }
    });
    return userAndProjects;
}

function reformatString(rut: string): string {
    let result = rut.replace(/[.+]/g, "");
    if (!result.includes("-")) {
        result = result.slice(0, -1) + "-" + result.slice(-1);
    }
    return result;
}
