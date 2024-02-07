import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { StatementsResponseWithAttachments, StatementsResponse } from "..";
import { GetStatementsParamsWithAttachments, GetStatementsParamsWithoutAttachments } from "./GetStatementsParams";
export declare function getStatements(this: XAPI, params: GetStatementsParamsWithAttachments): AxiosPromise<StatementsResponseWithAttachments>;
export declare function getStatements(this: XAPI, params?: GetStatementsParamsWithoutAttachments): AxiosPromise<StatementsResponse>;
