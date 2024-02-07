import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { StatementResponseWithAttachments, Statement } from "..";
import { GetVoidedStatementParamsWithAttachments, GetVoidedStatementParamsWithoutAttachments } from "./GetVoidedStatementParams";
export declare function getVoidedStatement(this: XAPI, params: GetVoidedStatementParamsWithAttachments): AxiosPromise<StatementResponseWithAttachments>;
export declare function getVoidedStatement(this: XAPI, params: GetVoidedStatementParamsWithoutAttachments): AxiosPromise<Statement>;
