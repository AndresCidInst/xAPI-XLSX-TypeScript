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

export function correctInteractionPointsUriFormat(statement: Statement) {
    if (statement.result?.extensions) {
        const uris = Object.keys(statement.result!.extensions!);
        const position = uris.findIndex((uri) =>
            uri.includes("is_interaction_points"),
        );
        if (position !== -1) {
            const value = statement.result!.extensions![uris[position]];
            delete statement.result!.extensions![uris[position]];
            statement.result!.extensions![
                "https://xapi.tego.iie.cl/extensions/is_interaction_points"
            ] = value;
        }
    }
}

export function correctAvatarChangeResultExtensionUri(statement: Statement) {
    if (
        Object(statement)["object"]["id"] ===
            "https://xapi.tego.iie.cl/activities/profile/avatars" &&
        statement.result?.extensions
    ) {
        const fromUri: string =
            Object.keys(statement.result.extensions).find((uri) =>
                uri.includes("from"),
            ) ?? "";
        const toUri: string =
            Object.keys(statement.result.extensions).find((uri) =>
                uri.includes("to"),
            ) ?? "";
        const fromValue: number = statement.result?.extensions[fromUri];
        const toValue: number = statement.result?.extensions[toUri];
        delete statement.result?.extensions[fromUri];
        delete statement.result?.extensions[toUri];
        statement.result.extensions[
            "https://xapi.tego.iie.cl/extensions/profile/avatar/from"
        ] = fromValue;
        statement.result.extensions[
            "https://xapi.tego.iie.cl/extensions/profile/avatar/to"
        ] = toValue;
    }
}
