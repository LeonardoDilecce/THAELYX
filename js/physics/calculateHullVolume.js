function calculateHullVolume(h, d, s,kind) {
    const rEst = d / 2;
    const spessore = d * (s / 100);
    const rInt = rEst - spessore;
    const volumeEsterno = Math.PI * rEst ** 2 * h;
    const volumeInterno = Math.PI * rInt ** 2 * h;
    const area = hullStructureMap[kind]?.a ?? 1;
    return (volumeEsterno - volumeInterno) * area;
}