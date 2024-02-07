import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { Activity } from "../Activity";
import { GetActivityParams } from "./GetActivityParams";
export declare function getActivity(this: XAPI, params: GetActivityParams): AxiosPromise<Activity>;
