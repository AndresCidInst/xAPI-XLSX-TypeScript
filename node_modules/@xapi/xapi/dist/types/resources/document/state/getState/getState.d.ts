import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { GetStateParams } from "./GetStateParams";
import { Document } from "../../Document";
export declare function getState(this: XAPI, params: GetStateParams): AxiosPromise<Document>;
