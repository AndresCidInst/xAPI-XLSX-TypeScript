import { AxiosPromise } from "axios";
import XAPI from "../../../../XAPI";
import { Document } from "../../Document";
import { GetAgentProfileParams } from "./GetAgentProfileParams";
export declare function getAgentProfile(this: XAPI, params: GetAgentProfileParams): AxiosPromise<Document>;
