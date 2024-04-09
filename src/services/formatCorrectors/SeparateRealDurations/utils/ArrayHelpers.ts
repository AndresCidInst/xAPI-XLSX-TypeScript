export function resetTimesArrays(
    timesOfInectivity: string[],
    timesOfRetun: string[],
) {
    timesOfInectivity.splice(0, timesOfInectivity.length);
    timesOfRetun.splice(0, timesOfRetun.length);
}
