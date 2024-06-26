import { ContextActivity, Extensions, Statement } from "@xapi/xapi";
import { DateTime } from "luxon";
import { containsReordenableToSave } from "../../consts/consts";

export function correctUriExtensionsGeneralFormat(statement: Statement): void {
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

export function correctUriExtensionResultWordSoup(statement: Statement): void {
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

export function correctInteractionPointsUriFormat(statement: Statement): void {
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

export function reorderExtensionsCorrector(statement: Statement) {
    statement.result!.extensions = statementPathReordenableTransform(
        statement.result!.extensions!,
    );
    return statement;
}

function statementPathReordenableTransform(extensions: Extensions): Extensions {
    const transformedExtensions: Extensions = {};
    const newKeys = Object.keys(containsReordenableToSave);

    Object.keys(extensions).forEach((key) => {
        const lastKeySegment = getLastKeySegment(key);
        const foundKey = newKeys.find((newKey) => lastKeySegment === newKey);
        if (foundKey) {
            transformedExtensions[getTransformedKey(foundKey)] =
                getTransformedValue(foundKey, extensions[key]);
        }
    });
    return transformedExtensions;
}

function getTransformedValue(foundKey: string, value: unknown): unknown {
    if (foundKey.includes("currentOrder")) {
        return (value as []).join(",");
    }
    return value;
}

function getTransformedKey(foundKey: string): string {
    return containsReordenableToSave[
        foundKey as keyof typeof containsReordenableToSave
    ];
}

function getLastKeySegment(key: string): string {
    return key.split("/").pop() || "";
}

export function correctAvatarChangeResultExtensionUri(
    statement: Statement,
): void {
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
): void {
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

export function correctSkippedVideoExtensions(statement: Statement): void {
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

export function removeAllDomainFromUris(statement: Statement): void {
    const domainToExclude = "https://xapi.tego.iie.cl/";
    statement = deleteUriPrincipalPlaces(statement, domainToExclude);
    deleteUriContextActivities(statement, domainToExclude);
}

function deleteUriPrincipalPlaces(
    statement: Statement,
    domainToExclude: string,
): Statement {
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
): void {
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
): void {
    if (activities) {
        for (const activity of activities) {
            activity.id = activity.id.replace(domainToExclude, "");
        }
    }
}

export function descriptionFeedbackTriviaCorrect(statement: Statement): void {
    const currentObject = Object(statement.object);
    currentObject.definition.description["es-CL"] =
        currentObject.definition.description["es-CL"].replace(
            "Resultado de la Trivia -5Con retroalimentación objetiva sobre  nutricion.",
            "Resultado de la Trivia - 5. Con retroalimentación objetiva sobre  nutricion.",
        );
    statement.object = currentObject;
}

export function rounDecimals(statement: Statement): void {
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

export function typeGamePressInWordSoupInsert(statement: Statement): void {
    const activityObject = Object(statement.object);
    activityObject.definition.type = "game";
}

export function formatDurationCorrect(statement: Statement): void {
    formatGeneralDuration(statement);
    formatDurationBetweenPages(statement);
}

function formatGeneralDuration(statement: Statement): void {
    const currentDuration: string | undefined = statement.result?.duration;
    if (statement.result && currentDuration) {
        statement.result.duration = formatDuration(currentDuration);
    }
}

function formatDurationBetweenPages(statement: Statement): void {
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

export function trueSuccessToUnlockWord(statement: Statement): void {
    statement.result!.success = true;
}

/**
 * Formatea la duración actual en un formato específico.
 *
 * @param currentDuration La duración actual en formato de cadena.
 * @returns La duración formateada en el formato "mm:ss:ms".
 */
function formatDuration(input: string): string {
    // RegExp para extraer horas, minutos y segundos
    const pattern = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
    const match = input.match(pattern);

    // Extraer y convertir a números, considerando valores no encontrados como 0
    const hours = parseInt(match?.[1] ?? "0");
    const minutes = parseInt(match?.[2] ?? "0");
    const seconds = parseFloat(match?.[3] ?? "0");

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    const outputMinutes = Math.floor(totalSeconds / 60);
    const outputSeconds = Math.round(totalSeconds % 60);

    const formattedMinutes = outputMinutes.toString().padStart(2, "0");
    const formattedSeconds = outputSeconds.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

export function typeActivityCmiClear(statement: Statement): void {
    const currentStatement = Object(statement);
    if (currentStatement.object.definition.type?.includes("cmi.")) {
        currentStatement.object.definition.type =
            currentStatement.object.definition.type.replace("cmi.", "");
        statement = currentStatement as Statement;
    }
}

export function correctDataTimeZone(statement: Statement): void {
    const uctDataTime = DateTime.fromISO(statement.timestamp!, { zone: "utc" });
    const chileanDate = uctDataTime.setZone("America/Santiago").toISO()!;
    statement.timestamp = chileanDate.replace("-03:00", "");
    statement.timestamp = roundMilliseconds(statement.timestamp);
}

function roundMilliseconds(timestamp: string): string {
    const date = new Date(timestamp);
    if (date.getMilliseconds() >= 500) {
        date.setSeconds(date.getSeconds() + 1);
    }
    date.setMilliseconds(0);
    return date.toISOString().split(".")[0];
}

export function compareDates(a: JSON, b: JSON): number {
    const firstStatement = Object(a);
    const secondStatement = Object(b);
    const firstDate = new Date(firstStatement["timestamp"]);
    const secondDate = new Date(secondStatement["timestamp"]);
    if (firstDate < secondDate) {
        return -1;
    }
    if (firstDate > secondDate) {
        return 1;
    }
    return 0;
}
