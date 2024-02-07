import { ActivityJson } from "./ActivityModels";

export interface ParentJson extends ActivityJson {}

export interface Parent {
    id?: string;
    idActividad: string;
    name: string;
    description: string;
}
