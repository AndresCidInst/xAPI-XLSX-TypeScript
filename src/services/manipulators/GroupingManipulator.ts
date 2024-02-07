import { Activity, ActivityJson } from "../../models/ActivityModels";

export function getGroupingFromJson(
    grouping: ActivityJson[],
    groupingToSave: Activity[],
) {
    grouping.forEach((group) => {
        if (!groupingExistVerification(group, groupingToSave)) {
            groupingToSave.push({
                idActivity: group["id"],
            });
        }
    });
}
function groupingExistVerification(
    group: ActivityJson,
    groupingToSave: Activity[],
) {
    return groupingToSave.some(
        (savedGroup) => savedGroup.idActivity === group.id,
    );
}
