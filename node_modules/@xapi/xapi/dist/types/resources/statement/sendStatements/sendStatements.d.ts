import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { SendStatementsParams } from "./SendStatementsParams";
export declare function sendStatements(this: XAPI, params: SendStatementsParams): AxiosPromise<string[]>;
