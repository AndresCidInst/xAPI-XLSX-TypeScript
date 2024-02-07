import { Activity, ActivityJson } from "../../models/ActivityModels";

export function saveCategory(
    categories: ActivityJson[],
    categoryList: Activity[],
) {
    categories.forEach((category) => {
        if (!verificationCategoryExist(category, categoryList)) {
            categoryList.push({
                idActivity: category.id,
            });
        }
    });
}

function verificationCategoryExist(
    category: ActivityJson,
    categoryList: Activity[],
) {
    return categoryList.some((categorySaved) => {
        return categorySaved.idActivity === category.id;
    });
}
