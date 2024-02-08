import { Statement } from "@xapi/xapi";

export function correctUriExtensionsGeneralFormat(statement: Statement) {
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

export function correctUriExtensionResultWordSoup(statement: Statement) {
    const currentStatement = Object(statement);
    if (
        currentStatement["verb"]["id"] ==
            "https://xapi.tego.iie.cl/verbs/played" &&
        currentStatement["object"]["id"].includes("sopaDeLetras")
    ) {
        Object.keys(currentStatement["result"]["extensions"]).forEach(
            (uri: string) => {
                const lastSegmentUri = uri.split("/").pop();
                const value = currentStatement["result"]["extensions"][uri];
                delete statement.result!.extensions![uri];
                statement.result!.extensions![
                    `https://xapi.tego.iie.cl/extensions/word_soup/${lastSegmentUri}`
                ] = value;
            },
        );
    }
}
