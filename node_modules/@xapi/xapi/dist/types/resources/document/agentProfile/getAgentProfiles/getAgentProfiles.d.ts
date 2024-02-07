import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { GetAgentProfilesParams } from "./GetAgentProfilesParams";
export declare function getAgentProfiles(this: XAPI, params: GetAgentProfilesParams): AxiosPromise<string[]>;
