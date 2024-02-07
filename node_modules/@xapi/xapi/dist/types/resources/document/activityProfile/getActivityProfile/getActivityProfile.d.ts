import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { GetActivityProfileParams } from "./GetActivityProfileParams";
import { Document } from "../../Document";
export declare function getActivityProfile(this: XAPI, params: GetActivityProfileParams): AxiosPromise<Document>;
