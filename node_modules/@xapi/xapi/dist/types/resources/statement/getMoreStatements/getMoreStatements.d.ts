import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { StatementsResponse, StatementsResponseWithAttachments } from "..";
import { GetMoreStatementsParams } from "./GetMoreStatementsParams";
export declare function getMoreStatements(this: XAPI, params: GetMoreStatementsParams): AxiosPromise<StatementsResponse | StatementsResponseWithAttachments>;
