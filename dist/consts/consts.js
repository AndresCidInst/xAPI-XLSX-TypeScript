"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTest = exports.unidadesActuales = exports.juegosActuales = exports.typesToChange = exports.attributesToTransform = exports.obligatoryAttibutesStatements = exports.headerAvatarChange = exports.fillHeaders = exports.containsReordenableToSave = exports.reduxContain = exports.headersMatches = void 0;
exports.headersMatches = [
    "object|definition|correctResponsesPattern",
    "object|definition|choices",
    "context|contextActivities|grouping",
    "context|contextActivities|parent",
    "context|contextActivities|category",
];
exports.reduxContain = [
    "founded_words",
    "is_interaction_points",
    "continuationGame",
];
exports.containsReordenableToSave = {
    movedPiece: "https://xapi.tego.iie.cl/extensions/reordenable/movedPiece",
    movedPiecePastPosition: "https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePastPosition",
    movedPiecePosition: "https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePosition",
    currentOrder: "https://xapi.tego.iie.cl/extensions/reordenable/currentOrder",
};
exports.fillHeaders = {
    id: "captura_id",
    "actor|name": "nombre_usuario",
    "actor|account|name": "rut_usuario",
    "context|extensions|https://xapi.tego.iie.cl/extensions/user/age": "usuario_edad",
    "verb|display|es-CL": "verbo_nombre",
    "object|definition|name|unity|es-CL": "unidad",
    "object|definition|name|es-CL": "actividad",
    "object|definition|name|subname|es-CL": "subactividad",
    "object|definition|description|es-CL": "actividad_descripcion",
    "object|definition|type": "actividad_tipo",
    "object|definition|correctResponsesPattern": "actividad_elemento_u_orden_correcto",
    "object|definition|choices": "actividad_elementos_opciones",
    "result|response": "retroalimentacion_respuesta",
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/fullScreen": "video_estado_pantalla_completa",
    "result|extensions|https://xapi.tego.iie.cl/extensions/word_soup/founded_words": "sopa_de_letras_palabras_encontradas",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiece": "reordenable_pieza_movida",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePastPosition": "reordenable_pieza_posicion_pasada",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePosition": "reordenable_pieza_posicion_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/currentOrder": "reordenable_orden_piezas_actual",
    "timestamp|date": "fecha_captura",
    "timestamp|time": "hora_captura",
    "result|extensions|https://xapi.tego.iie.cl/extensions/real_duration": "tiempo_real_registrado",
    "result|completion": "resultado_completitud",
    "result|success": "resultado_exito",
    "result|score|raw": "puntaje_obtenido",
    "result|score|scaled": "porcentaje_exito",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/from": "avatar_cambiado",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/to": "avatar_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/from": "accesorio_cambiado",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/to": "accesorio_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/from": "avatar_nombre_anterior",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/to": "avatar_nombre_actual",
    "context|extensions|https://xapi.tego.iie.cl/extensions/appointment_date": "cita_fecha_destinada",
    "context|extensions|https://xapi.tego.iie.cl/extensions/cancel_reason": "cita_razon_cancelacion",
};
exports.headerAvatarChange = [
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/from",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/to",
];
exports.obligatoryAttibutesStatements = [
    "id",
    "actor",
    "verb",
    "object",
    "context",
    "result",
    "timestamp",
    "stored",
];
exports.attributesToTransform = [
    "actor",
    "verb",
    "object",
    "context",
    "result",
];
exports.typesToChange = {
    educational: "video",
};
exports.juegosActuales = [
    "trivia",
    "sopaDeLetras",
    "swip_cards",
    "reordenable",
];
exports.unidadesActuales = {
    "activities/higiene_dental": "Higiene Dental",
    "activities/nutricion": "Nutricion",
    "activities/higiene_de_protesis_dental": "Higiene De Protesis Dental",
    "activities/prevencion_del_cancer_oral": "Cancer Oral",
    "activities/complementario": "Material complementario",
};
exports.userTest = [
    "11415764-3",
    "17421134-7",
    "19306223-7",
    "8315916-2",
    "99999990-8",
];
