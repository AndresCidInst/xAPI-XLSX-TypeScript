"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCategory = void 0;
function saveCategory(categories, categoryList) {
    categories.forEach((category) => {
        if (!verificationCategoryExist(category, categoryList)) {
            categoryList.push({
                idActivity: category.id,
            });
        }
    });
}
exports.saveCategory = saveCategory;
function verificationCategoryExist(category, categoryList) {
    return categoryList.some((categorySaved) => {
        return categorySaved.idActivity === category.id;
    });
}
