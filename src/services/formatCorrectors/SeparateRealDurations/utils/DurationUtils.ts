import { Extensions } from "@xapi/xapi";

/**
 * Convierte una cadena de tiempo en formato "mm:ss" a segundos.
 * @param time La cadena de tiempo en formato "mm:ss".
 * @returns El valor en segundos.
 */
export function convertToSeconds(time: string): number {
    const parts = time.split(":");
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

/**
 * Resta dos tiempos en formato de cadena y devuelve el resultado en formato de cadena.
 * @param capturedTime El tiempo capturado en formato de cadena.
 * @param timeToSubstract El tiempo a restar en formato de cadena.
 * @returns El resultado de la resta en formato de cadena.
 */
export function subtractTimes(
    capturedTime: string,
    timeToSubstract: string,
): string {
    const differenceSeconds =
        convertToSeconds(capturedTime) - convertToSeconds(timeToSubstract);

    const minutes = Math.floor(differenceSeconds / 60);
    const seconds = Math.floor(differenceSeconds % 60);

    const result = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return result;
}

/**
 * Convierte la duración real y la duración capturada en una extensión.
 * @param realDuration La duración real.
 * @param capturedDuration La duración capturada.
 * @returns Las extensiones con las duraciones.
 */
export function durationToExtension(
    realDuration: string,
    capturedDuration: string,
): Extensions {
    return {
        "https://xapi.tego.iie.cl/extensions/duration": capturedDuration,
        "https://xapi.tego.iie.cl/extensions/real_duration": realDuration,
    };
}

export function durationToExtensionNavegation(
    realDuration: string,
    timeBetweenPages: string,
): Extensions {
    return {
        "https://xapi.tego.iie.cl/extensions/real_duration": realDuration,
        "https://xapi.tego.iie.cl/extensions/time-between-pages":
            timeBetweenPages,
    };
}
