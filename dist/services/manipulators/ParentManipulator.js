"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentDataMolder = void 0;
function parentDataMolder(parent, parentList) {
    var _a, _b;
    if (!verificationParentExist(parent, parentList)) {
        const name = ((_a = parent.definition) === null || _a === void 0 ? void 0 : _a.name)
            ? parent.definition.name["es-CL"]
            : "N/A";
        const description = ((_b = parent.definition) === null || _b === void 0 ? void 0 : _b.description)
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
