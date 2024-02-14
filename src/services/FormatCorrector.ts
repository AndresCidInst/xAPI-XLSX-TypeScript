import { ContextActivity, Statement } from "@xapi/xapi";
import { Duration } from "luxon";

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

export function rounDecimals(statement: Statement) {
    const currentProgressVideo =
        statement.result?.extensions?.[
            "https://xapi.tego.iie.cl/extensions/video/progress"
        ];
    if (currentProgressVideo) {
        statement.result!.extensions![
            "https://xapi.tego.iie.cl/extensions/video/progress"
        ] = Number(currentProgressVideo.toFixed(3));
    }
    if (statement.result?.score?.scaled) {
        statement.result.score.scaled = Number(
            statement.result.score.scaled.toFixed(3),
        );
    }
}

export function typeGamePressInWordSoupInsert(statement: Statement) {
    const activityObject = Object(statement.object);
    activityObject.definition.type = "game";
}

export function formatDurationCorrect(statement: Statement) {
    formatGeneralDuration(statement);
    formatDurationBetweenPages(statement);
}

function formatGeneralDuration(statement: Statement) {
    const currentDuration: string | undefined = statement.result?.duration;
    if (statement.result && currentDuration) {
        statement.result.duration = formatDuration(currentDuration);
    }
}

function formatDurationBetweenPages(statement: Statement) {
    const currentDuration: string =
        statement.result?.extensions?.[
            "https://xapi.tego.iie.cl/extensions/time-between-pages"
        ];
    if (statement.result?.extensions && currentDuration) {
        statement.result.extensions[
            "https://xapi.tego.iie.cl/extensions/time-between-pages"
        ] = formatDuration(currentDuration);
    }
}

/**
 * Formatea la duración actual en un formato específico.
 *
 * @param currentDuration La duración actual en formato de cadena.
 * @returns La duración formateada en el formato "mm:ss:ms".
 */
function formatDuration(currentDuration: string): string {
    const duration = Duration.fromISO(currentDuration);
    const minutes = duration.minutes.toString().padStart(2, "0");
    const seconds =
        duration.milliseconds >= 500 ? duration.seconds + 1 : duration.seconds;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function typeActivityCmiClear(statement: Statement) {
    const currentStatement = Object(statement);
    if (currentStatement.object.definition.type?.includes("cmi.")) {
        currentStatement.object.definition.type =
            currentStatement.object.definition.type.replace("cmi.", "");
        statement = currentStatement as Statement;
    }
}
