import { ContextActivity, Statement } from "@xapi/xapi";

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
    if (
        statement.verb.id === "verbs/found" ||
        statement.verb.id === "verbs/attempted"
    ) {
        const attempWord: string = statement
            .result!.response!.split(" ")
            .pop()!;
        statement.result!.extensions = {
            "https://xapi.tego.iie.cl/extensions/word_soup/founded_words":
                attempWord,
        };
    }
    Object.keys(statement["result"]!["extensions"]!).forEach((uri: string) => {
        const lastSegmentUri = uri.split("/").pop();
        const value = statement["result"]!["extensions"]![uri];
        delete statement.result!.extensions![uri];
        statement.result!.extensions![
            `https://xapi.tego.iie.cl/extensions/word_soup/${lastSegmentUri}`
        ] = value;
    });
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
    const fromUri: string =
        Object.keys(statement.result!.extensions!).find((uri) =>
            uri.includes("from"),
        ) ?? "";
    const toUri: string =
        Object.keys(statement.result!.extensions!).find((uri) =>
            uri.includes("to"),
        ) ?? "";
    changeAvatarUrisValue(fromUri, toUri, statement);
}

function changeAvatarUrisValue(
    fromUri: string,
    toUri: string,
    statement: Statement,
) {
    const fromValue: number = statement.result?.extensions![fromUri];
    const toValue: number = statement.result?.extensions![toUri];
    delete statement.result?.extensions![fromUri];
    delete statement.result?.extensions![toUri];
    statement.result!.extensions![
        "https://xapi.tego.iie.cl/extensions/profile/avatar/from"
    ] = fromValue;
    statement.result!.extensions![
        "https://xapi.tego.iie.cl/extensions/profile/avatar/to"
    ] = toValue;
}

export function correctSkippedVideoExtensions(statement: Statement) {
    const currentExtensions = Object.entries(statement.result!.extensions!);
    const fromValue = currentExtensions[0][1]["From"];
    const toValue = currentExtensions[0][1]["To"];
    delete statement.result!.extensions![currentExtensions[0][0]];
    statement.result!.extensions![
        "https://xapi.tego.iie.cl/extensions/video/time_skipped/From"
    ] = fromValue;
    statement.result!.extensions![
        "https://xapi.tego.iie.cl/extensions/video/time_skipped/To"
    ] = toValue;
}

export function removeAllDomainFromUris(statement: Statement) {
    const domainToExclude = "https://xapi.tego.iie.cl/";
    statement = deleteUriPrincipalPlaces(statement, domainToExclude);
    deleteUriContextActivities(statement, domainToExclude);
}

function deleteUriPrincipalPlaces(
    statement: Statement,
    domainToExclude: string,
) {
    const currentStatement = Object(statement);
    const statementVerb = currentStatement.verb.id
        .split("/")
        .slice(-2)
        .join("/") as string;
    currentStatement.verb.id = !statementVerb.includes("verb/")
        ? statementVerb
        : (statementVerb.replace("verb/", "verbs/") as string);

    currentStatement.object.id = currentStatement.object.id.replace(
        domainToExclude,
        "",
    );

    if (currentStatement.object.definition.type) {
        currentStatement.object.definition.type =
            currentStatement.object.definition.type.split("/").pop() as string;
    }

    return currentStatement as Statement;
}

function deleteUriContextActivities(
    statement: Statement,
    domainToExclude: string,
) {
    if (statement.context?.contextActivities?.parent) {
        objectUriReplace(
            statement.context!.contextActivities!.parent!,
            domainToExclude,
        );
    }
    if (statement.context?.contextActivities?.category) {
        objectUriReplace(
            statement.context!.contextActivities!.category,
            domainToExclude,
        );
    }
    if (statement.context?.contextActivities?.grouping) {
        objectUriReplace(
            statement.context!.contextActivities!.grouping,
            domainToExclude,
        );
    }
}

function objectUriReplace(
    activities: ContextActivity[],
    domainToExclude: string,
) {
    if (activities) {
        for (const activity of activities) {
            activity.id = activity.id.replace(domainToExclude, "");
        }
    }
}

export function descriptionFeedbackTriviaCorrect(statement: Statement) {
    const currentObject = Object(statement.object);
    currentObject.definition.description["es-CL"] =
        currentObject.definition.description["es-CL"].replace(
            "Resultado de la Trivia -5Con retroalimentación objetiva sobre  nutricion.",
            "Resultado de la Trivia - 5. Con retroalimentación objetiva sobre  nutricion.",
        );
    statement.object = currentObject;
}
