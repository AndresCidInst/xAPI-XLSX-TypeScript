"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.choiceMolder = void 0;
function choiceMolder(choices, choicesToSave) {
    choices.forEach((choice) => {
        if (!choiceExistVerification(choice, choicesToSave)) {
            choicesToSave.push({
                idChoice: choice["id"],
                description: choice["description"]["es-CL"],
            });
        }
    });
}
exports.choiceMolder = choiceMolder;
function choiceExistVerification(choice, choicesToSave) {
    return choicesToSave.some((savedChoice) => savedChoice.idChoice === choice.id &&
        savedChoice.description === choice.description["es-CL"]);
}
