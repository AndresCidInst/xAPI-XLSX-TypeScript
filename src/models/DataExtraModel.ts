interface DataModel {
    [key: string]:
        | string
        | boolean
        | number
        | Date
        | { formula: string; result: null };
}

export class DataExtraColumnsModelImpl implements DataModel {
    "id": string;
    "actor|name": string;
    "actor|account|name": string;
    "context|extensions/https://xapi.tego.iie.cl/extensions/user/age": number;
    "verb|display|es-CL": string;
    "verb|id": string;
    "object|id": string;
    "object|definition|name|unity|es-CL": string;
    "object|definition|name|es-CL": string;
    "object|definition|name|subname|es-CL": string;
    "object|definition|description|es-CL": string;
    "object|definition|type": string;
    "object|definition|correctResponsesPattern": string;
    "object|definition|choices": string;
    "context|platform": string;
    "context|contextActivities|parent": string;
    "context|contextActivities|grouping": string;
    "context|contextActivities|category": string;
    "context|registration": string;
    "timestamp|date": string;
    "timestamp|time": string;
    "result|completion": boolean;
    "result|success": boolean;
    "result|score|min": number;
    "result|score|max": number;
    "result|score|raw": number;
    "result|score|scaled": number;
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/length": number;
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/quality": string;
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/videoSpeed": number;
    "context|extensions|https://xapi.tego.iie.cl/extensions/video/fullScreen": boolean;
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/progress": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time_skipped/From": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/video/time_skipped/To": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/is_interaction_points": boolean;
    "result|extensions|https://xapi.tego.iie.cl/extensions/continuationGame": boolean;
    "result|extensions|https://xapi.tego.iie.cl/extensions/word_soup/founded_words": string;
    "result|response": string;
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiece": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePastPosition": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/movedPiecePosition": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/reordenable/currentOrder": string;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/from": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar/to": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/from": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/avatar_acccessory/to": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/from": string;
    "result|extensions|https://xapi.tego.iie.cl/extensions/profile/change_name/to": string;
    "context|extensions|https://xapi.tego.iie.cl/extensions/appointment_date": Date;
    "context|extensions|https://xapi.tego.iie.cl/extensions/cancel_reason": string;
    "result|extensions|https://xapi.tego.iie.cl/extensions/time-between-pages": number;
    "result|extensions|https://xapi.tego.iie.cl/extensions/duration": string;
    "result|extensions|https://xapi.tego.iie.cl/extensions/real_duration": string;

    constructor() {}
    [key: string]:
        | string
        | number
        | boolean
        | Date
        | { formula: string; result: null };
}
