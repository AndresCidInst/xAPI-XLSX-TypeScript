import { Extensions, Statement } from "@xapi/xapi";

export /**
 * Agrega una extensión a una declaración.
 *
 * @param statement La declaración a la que se le agregará la extensión.
 * @param extension La extensión que se agregará a la declaración.
 * @returns La declaración con la extensión agregada.
 */
function addExtensionToStatement(
    statement: Statement,
    extension: Extensions,
): Statement {
    return {
        ...statement,
        result: {
            ...statement.result,
            extensions: extension,
        },
    };
}

/**
 * Reemplaza las declaraciones en formato JSON con las declaraciones reformateadas que contienen la duración correcta.
 *
 * @param statements - Las declaraciones en formato JSON a reemplazar.
 * @param statementsDurationReformated - Las declaraciones reformateadas que contienen la duración correcta.
 * @returns Las declaraciones reemplazadas.
 */
export function replaceStatements(
    statements: JSON[],
    statementsDurationReformated: Statement[],
): { updatedStatements: JSON[]; countCalculations: number } {
    const countCalculations = necessaryCalculations(
        statementsDurationReformated,
        0,
    );
    const updatedStatements = statements.map((statement) => {
        const newStatement = statementsDurationReformated.find(
            (newStmt) => Object(newStmt).id == Object(statement).id,
        );
        return newStatement
            ? JSON.parse(JSON.stringify(newStatement))
            : statement;
    });

    return {
        updatedStatements,
        countCalculations,
    };
}

function necessaryCalculations(
    statementsDurationReformated: Statement[],
    countCalculations: number,
) {
    statementsDurationReformated.forEach((statement) => {
        if (
            statement.result?.extensions![
                "https://xapi.tego.iie.cl/extensions/duration"
            ] != undefined
        ) {
            if (
                statement.result?.extensions![
                    "https://xapi.tego.iie.cl/extensions/duration"
                ] !=
                statement.result?.extensions![
                    "https://xapi.tego.iie.cl/extensions/real_duration"
                ]
            ) {
                countCalculations++;
            }
        } else {
            if (
                statement.result?.extensions![
                    "https://xapi.tego.iie.cl/extensions/time-between-pages"
                ] !=
                statement.result?.extensions![
                    "https://xapi.tego.iie.cl/extensions/real_duration"
                ]
            ) {
                countCalculations++;
            }
        }
    });
    return countCalculations;
}
