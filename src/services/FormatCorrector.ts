import { Statement } from "@xapi/xapi";

export function correctUriExtensionsFormat(statement: Statement) {
    if (statement.result?.extensions) {
        Object.keys(statement.result.extensions).forEach((uri) => {
            const value = statement.result!.extensions![uri];
            delete statement.result!.extensions![uri];
            statement.result!.extensions![uri.replace(/&46;/g, ".")] = value;
        });
    }
    if (statement.context?.extensions) {
        Object.keys(statement.context.extensions).forEach((uri) => {
            const value = statement.context!.extensions![uri];
            delete statement.context!.extensions![uri];
            statement.context!.extensions![uri.replace(/&46;/g, ".")] = value;
        });
    }
}
