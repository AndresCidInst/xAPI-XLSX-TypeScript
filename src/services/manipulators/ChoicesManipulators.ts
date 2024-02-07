import { Choice, ChoiceJson } from "../../models/ChoicesModels";

export function choiceMolder(choices: [], choicesToSave: Choice[]) {
    choices.forEach((choice) => {
        if (!choiceExistVerification(choice, choicesToSave)) {
            choicesToSave.push({
                idChoice: choice["id"],
                description: choice["description"]["es-CL"],
            });
        }
    });
}

function choiceExistVerification(choice: ChoiceJson, choicesToSave: Choice[]) {
    return choicesToSave.some(
        (savedChoice) =>
            savedChoice.idChoice === choice.id &&
            savedChoice.description === choice.description["es-CL"],
    );
}
