import { Parent, ParentJson } from "../../models/ParentModels";

export function parentDataMolder(parent: ParentJson, parentList: Parent[]) {
    if (!verificationParentExist(parent, parentList)) {
        const name = parent.definition?.name
            ? parent.definition.name["es-CL"]
            : "N/A";
        const description = parent.definition?.description
            ? parent.definition.description["es-CL"]
            : "N/A";
        parentList.push({
            idActividad: parent.id,
            name: name,
            description: description,
        });
    }
}

function verificationParentExist(parent: ParentJson, parentList: Parent[]) {
    return parentList.some(
        (savedParent) => savedParent.idActividad === parent.id,
    );
}
