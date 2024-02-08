export const headersMatches = [
    "object|definition|correctResponsesPattern",
    "object|definition|choices",
    "context|contextActivities|grouping",
    "context|contextActivities|parent",
    "context|contextActivities|category",
];

export const reduxContain = [
    "founded_words",
    "is_interaction_points",
    "continuationGame",
];

export const containsReordenableToSave = {
    movedPiece: "https://xapi.tego.iie.cl/extensions/reordenable/movedPiece",
    movedPiecePastPosition:
        "https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePastPosition",
    movedPiecePosition:
        "https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePosition",
    currentOrder:
        "https://xapi.tego.iie.cl/extensions/reordenable/currentOrder",
};

export const fillHeaders = {
    id: "id_capruta",
    "actor|name": "nombre_usuario",
    "actor|account|name": "rut_usuario",
    "verb|display|es-CL": "verbo_nombre",
    "verb|id": "verbo_id",
    "object|id": "actividad_id",
    "object|definition|name|es-CL": "actividad_nombre",
    "object|definition|description|es-CL": "actividad_descripcion",
    "object|definition|type": "actividad_tipo",
    "object|definition|correctResponsesPattern":
        "actividad_elemento_u_orden_correcto",
    "object|definition|choices": "actividad_elementos_opciones",
    "context|platform": "contexto_dispositivo_usado",
    "context|contextActivities|parent": "contexto_actividad_padre_id",
    "context|contextActivities|grouping": "contexto_actividad_parte_grupo_id",
    "context|contextActivities|category":
        "contexto_actividad_parte_categoria_id",
    "context|extensions|https://xapi.tego.iie.cl/extensions/user/age":
        "usuario_edad",
    timestamp: "fecha_hora_captura",
    "result|completion": "resultado_completitud",
    "result|success": "resultado_exito",
    "result|score|min": "resultado_puntaje_minimo",
    "result|score|max": "resultado_puntaje_maximo",
    "result|score|raw": "resultado_puntaje_obtenido",
    "result|score|scaled": "resultado_porcentaje_exito",
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/length":
        "video_largo",
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/quality":
        "video_calidad",
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/videoSpeed":
        "velocidad_reproduccion",
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/fullScreen":
        "video_tamaño_pantalla",
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time":
        "video_posicion_usuario",
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/progress":
        "progreso_video",
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time_skipped/From":
        "segundo_anterior_al_salto",
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time_skipped/To":
        "segundo_posterior_al_salto",
    "result|extensions|https://xapi.tego.iie.cl/extensions/is_interaction_points":
        "estado_puntos_interaccion",
    "result|extensions|https://xapi.tego.iie.cl/extensions/continuationGame":
        "juego_sera_continuado",
    "result|extensions|https://xapi.tego.iie.cl/extensions/word_soup/founded_words":
        "palabras_encontradas",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiece":
        "pieza_movida",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePastPosition":
        "pieza_posicion_pasada",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePosition":
        "pieza_posicion_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/currentOrder":
        "orden_piezas_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/from":
        "avatar_cambiado",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/to":
        "avatar_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/from":
        "accesorio_cambiado",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/to":
        "accesorio_actual",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/from":
        "nombe_anterior",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/to":
        "nombre_actual",
    "context|extensions|https://xapi.tego.iie.cl/extensions/appointment_date":
        "fecha_destinada_cita",
    "context|extensions|https://xapi.tego.iie.cl/extensions/cancel_reason":
        "razon_cancelacion_cita",
    "result|extensions|https://xapi.tego.iie.cl/extensions/time-between-pages":
        "tiempo_entre_vistas",
};

export const headerAvatarChange = [
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/from",
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/to",
];
