import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { GetStatesParams } from "./GetStatesParams";
export declare function getStates(this: XAPI, params: GetStatesParams): AxiosPromise<string[]>;
