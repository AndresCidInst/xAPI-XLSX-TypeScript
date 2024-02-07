"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupingFromJson = void 0;
function getGroupingFromJson(grouping, groupingToSave) {
    grouping.forEach((group) => {
        if (!groupingExistVerification(group, groupingToSave)) {
            groupingToSave.push({
                idActivity: group["id"],
            });
        }
    });
}
exports.getGroupingFromJson = getGroupingFromJson;
function groupingExistVerification(group, groupingToSave) {
    return groupingToSave.some((savedGroup) => savedGroup.idActivity === group.id);
}
