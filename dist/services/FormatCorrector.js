"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctUriExtensionsFormat = void 0;
function correctUriExtensionsFormat(statement) {
    var _a, _b;
    if ((_a = statement.result) === null || _a === void 0 ? void 0 : _a.extensions) {
        Object.keys(statement.result.extensions).forEach((uri) => {
            const value = statement.result.extensions[uri];
            delete statement.result.extensions[uri];
            statement.result.extensions[uri.replace(/&46;/g, ".")] = value;
        });
    }
    if ((_b = statement.context) === null || _b === void 0 ? void 0 : _b.extensions) {
        Object.keys(statement.context.extensions).forEach((uri) => {
            const value = statement.context.extensions[uri];
            delete statement.context.extensions[uri];
            statement.context.extensions[uri.replace(/&46;/g, ".")] = value;
        });
    }
}
exports.correctUriExtensionsFormat = correctUriExtensionsFormat;
