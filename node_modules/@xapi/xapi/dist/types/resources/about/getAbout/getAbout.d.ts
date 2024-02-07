import { AxiosPromise } from "axios";
import XAPI from "../../../XAPI";
import { About } from "../About";
import { GetAboutParams } from "./GetAboutParams";
export declare function getAbout(this: XAPI, params?: GetAboutParams): AxiosPromise<About>;
