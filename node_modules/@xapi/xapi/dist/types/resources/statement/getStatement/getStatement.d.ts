import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { StatementResponseWithAttachments, Statement } from "..";
import { GetStatementParamsWithAttachments, GetStatementParamsWithoutAttachments } from "./GetStatementParams";
export declare function getStatement(this: XAPI, params: GetStatementParamsWithAttachments): AxiosPromise<StatementResponseWithAttachments>;
export declare function getStatement(this: XAPI, params: GetStatementParamsWithoutAttachments): AxiosPromise<Statement>;
