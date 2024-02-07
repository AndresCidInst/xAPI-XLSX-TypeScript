import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { VoidStatementParams } from "./VoidStatementParams";
export declare function voidStatement(this: XAPI, params: VoidStatementParams): AxiosPromise<string[]>;
