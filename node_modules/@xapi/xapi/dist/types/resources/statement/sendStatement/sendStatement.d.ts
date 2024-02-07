import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { SendStatementParams } from "./SendStatementParams";
export declare function sendStatement(this: XAPI, params: SendStatementParams): AxiosPromise<string[]>;
