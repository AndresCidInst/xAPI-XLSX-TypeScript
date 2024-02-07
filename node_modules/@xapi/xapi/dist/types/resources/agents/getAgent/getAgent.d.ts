import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { Person } from "../Person";
import { GetAgentParams } from "./GetAgentParams";
export declare function getAgent(this: XAPI, params: GetAgentParams): AxiosPromise<Person>;
