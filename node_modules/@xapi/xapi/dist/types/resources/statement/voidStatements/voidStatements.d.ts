import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { VoidStatementsParams } from "./VoidStatementsParams";
export declare function voidStatements(this: XAPI, params: VoidStatementsParams): AxiosPromise<string[]>;
