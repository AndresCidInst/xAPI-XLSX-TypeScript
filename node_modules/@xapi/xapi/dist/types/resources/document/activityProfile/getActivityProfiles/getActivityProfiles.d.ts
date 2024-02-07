import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { GetActivityProfilesParams } from "./GetActivityProfilesParams";
export declare function getActivityProfiles(this: XAPI, params: GetActivityProfilesParams): AxiosPromise<string[]>;
