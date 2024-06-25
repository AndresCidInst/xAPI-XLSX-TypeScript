import { Statement } from "@xapi/xapi";
import { unidadesActuales } from "../../consts/consts";
import { DataExtraColumnsModelImpl } from "../../models/DataExtraModel";
import { DataModelImpl } from "../../models/DataModel";

interface columnasNombreUnidadSubNombre {
    id: string;
    "object|definition|name|unity|es-CL": string;
    "object|definition|name|es-CL": string;
    "object|definition|name|subname|es-CL": string;
}

// eslint-disable-next-line prettier/prettier
export function addUnityAndSubActivityColumn(
    statements: Statement[],
    dataProcessed: DataModelImpl[],
) {
    const diccionarioUnidades: { [key: string]: string } = {};
    const extraColumns: columnasNombreUnidadSubNombre[] = [];
    const parentActivities: { [key: string]: string } = {};

    const videoStatements = statements.filter(
        (statement) => Object(statement).object.definition.type == "video",
    );

    const gameStatements = statements.filter(
        (statement) => Object(statement).object.definition.type == "game",
    );

    videoStatements.forEach((statement: Statement) => {
        const unidadId: string =
            statement.context?.contextActivities?.parent?.[0]?.id ?? "";
        const unidadNombre: string =
            statement.context?.contextActivities?.parent?.[0]?.definition
                ?.name?.["es-CL"] ?? "No visualizado";

        const nombreActividad: string =
            Object(statement).object.definition.name["es-CL"];

        const unidadPerteneciente = unityVideoGetter(
            Object(statement).object.id,
            unidadId,
        );
        const unitName =
            unidadPerteneciente != undefined
                ? unidadesActuales[unidadPerteneciente]
                : "No visualizado";
        diccionarioUnidades[
            statement.context?.contextActivities?.parent?.[0]?.id ?? ""
        ] = unidadNombre;
        extraColumns.push({
            id: Object(statement)["id"],
            "object|definition|name|unity|es-CL": unitName,
            "object|definition|name|es-CL": nombreActividad,
            "object|definition|name|subname|es-CL": "",
        });
    });

    gameStatements.forEach((statement: Statement) => {
        const unidadId: string =
            statement.context?.contextActivities?.parent?.[0]?.id ?? "";
        const nombreActividad: string =
            Object(statement).object.definition.name["es-CL"];
        const unidadPerteneciente = unityGetter(unidadId);

        if (
            unidadPerteneciente != undefined &&
            unidadId == unidadPerteneciente + "/game"
        ) {
            const unidadNombre: string = unidadesActuales[unidadPerteneciente];
            diccionarioUnidades[unidadId] = unidadNombre;
            extraColumns.push({
                id: Object(statement)["id"],
                "object|definition|name|unity|es-CL": unidadNombre,
                "object|definition|name|es-CL": nombreActividad,
                "object|definition|name|subname|es-CL": "",
            });
            parentActivities[Object(statement).object.id] = nombreActividad;
        } else {
            processChild(
                statement,
                unidadPerteneciente,
                extraColumns,
                parentActivities,
            );
        }
    });

    return transformDataModelToDataExtraColumn(dataProcessed, extraColumns);
}

function processChild(
    statement: Statement,
    unidad: string,
    extraColumns: columnasNombreUnidadSubNombre[],
    padresActividades: { [key: string]: string },
) {
    const nombreAcitividad =
        Object(statement)["object"]["definition"]["name"]["es-CL"];
    const idPadre = statement.context?.contextActivities?.parent?.[0]?.id ?? "";
    const nombrePadre = padresActividades[idPadre];
    extraColumns.push({
        id: Object(statement)["id"],
        "object|definition|name|unity|es-CL": unidadesActuales[unidad],
        "object|definition|name|es-CL": nombrePadre,
        "object|definition|name|subname|es-CL": nombreAcitividad,
    });
}

function transformDataModelToDataExtraColumn(
    dataProcessed: DataModelImpl[],
    extraColumns: columnasNombreUnidadSubNombre[],
) {
    const finalData: DataExtraColumnsModelImpl[] = [];
    dataProcessed.forEach((data: DataModelImpl) => {
        const combinateData = Object.assign(
            new DataExtraColumnsModelImpl(),
            data,
        );
        const preparedData = extraColumns.find(
            (column) => column.id == combinateData.id,
        );
        if (preparedData != undefined) {
            combinateData["object|definition|name|es-CL"] =
                preparedData["object|definition|name|es-CL"];
            combinateData["object|definition|name|subname|es-CL"] =
                preparedData["object|definition|name|subname|es-CL"];
            combinateData["object|definition|name|unity|es-CL"] =
                preparedData["object|definition|name|unity|es-CL"];
        } else {
            combinateData["object|definition|name|subname|es-CL"] = "";
            combinateData["object|definition|name|unity|es-CL"] = "";
        }
        finalData.push(combinateData);
    });
    return finalData;
}

function unityGetter(idActividadPadre: string): string {
    const unidadPerteneciente = Object.keys(unidadesActuales).filter(
        (unidad) => {
            return idActividadPadre.includes(unidad);
        },
    );
    return unidadPerteneciente[0] ?? undefined;
}

function unityVideoGetter(activityId: string, parentId: string): string {
    const unidadPertenecienteIdVideo = Object.keys(unidadesActuales).filter(
        (unidad) => {
            return activityId.includes(unidad);
        },
    );
    if (unidadPertenecienteIdVideo[0] != undefined) {
        return unidadPertenecienteIdVideo[0];
    }
    const unidadPertenecienteIdPadre = Object.keys(unidadesActuales).filter(
        (unidad) => {
            return parentId.includes(unidad);
        },
    );
    return unidadPertenecienteIdPadre[0] ?? undefined;
}
