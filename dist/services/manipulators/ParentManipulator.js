"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentDataMolder = void 0;
function parentDataMolder(parent, parentList) {
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
exports.parentDataMolder = parentDataMolder;
function verificationParentExist(parent, parentList) {
    return parentList.some((savedParent) => savedParent.idActividad === parent.id);
}
