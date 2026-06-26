function reloadThermodynamics(starship, deltaTime, targetAtmosphere, distanza,targetMass = 0,targetRadius = 0,targetDistance = 0) {
    if (!starship||starship.name === "clone") return;
    const output = reloadStarshipDragCoefficient(starship);
    const surfaces = output.surfaces;
    const vel = starship.velocity.modulo();
    let clone = false;
    if(starship.name=="clone") clone = true;
    let rho = (targetAtmosphere?.density??0) * Math.exp(-distanza / (targetAtmosphere?.scaleHeight??0));
    if(distanza>(targetAtmosphere?.maxAltitude??0)) rho = 0;
    if(!targetAtmosphere||!isFinite(rho)||isNaN(rho)) rho = 0;
    if (!Array.isArray(surfaces) || surfaces.length === 0) return;
    for (const stage of Object.values(starship.Stages)) {
        const surfaceMain = stage.surface;
        const surfaceID = surfaceMain?.id;
        const isExposed = id => surfaces.some(s => s.id === id);
        if (!surfaceID || !isExposed(surfaceID)) continue;
        const hs = stage.heatShield?.surface;
        const hsVisible = hs && isExposed(hs.id);
        if (hsVisible) {
            const hsEntry = surfaces.find(s => s.id === hs.id);
            const hsCp = materialCpMap[hs.material]?.cp ?? 1;
            const hsK = materialCpMap[hs.material]?.k ?? 1e-4;
            updateReentryTemperature(distanza, hs, rho, vel, hsEntry.a.a, deltaTime, stage.heatShield.mass, hsCp, hsK, targetAtmosphere,clone,targetMass,targetRadius,targetDistance);
            if (hs.actualTemperature > hs.maxTemperature&&starship.name !== "clone") {
                alert(`Heat Shield destroyed at ${hs.actualTemperature.toFixed(1)} K`);
                stage.heatShield = null;
            } else if(rho>0)continue; 
        }
        const sEntry = surfaces.find(s => s.id === surfaceID);
        const cpMain = materialCpMap[surfaceMain.material]?.cp ?? 1;
        const kMain = materialCpMap[surfaceMain.material]?.k ?? 1e-4;
        updateReentryTemperature(distanza, surfaceMain, rho, vel,  sEntry.a.a, deltaTime, stage.mass,cpMain, kMain, targetAtmosphere,clone,targetMass,targetRadius,targetDistance);
        if (surfaceMain.actualTemperature > surfaceMain.maxTemperature &&starship.name !== "clone") {
            alert(`MISSION FAILED! Your starship burned ${surfaceMain.actualTemperature.toFixed(1)} K`);
            starship = null;
            globalGameData.Starship = null;
            break;
        }
        for (const component of ["parachute", "Engine"]) {
            const part = stage[component];
            const surface = part?.surface;
            if (surface && isExposed(surface.id)) {
                const entry = surfaces.find(s => s.id === surface.id);
                const cp = materialCpMap[surface.material]?.cp ?? 1;
                const k = materialCpMap[surface.material]?.k ?? 1e-4;
                updateReentryTemperature(  distanza, surface, rho, vel, entry.a.a, deltaTime, part.mass,cp, k, targetAtmosphere,clone,targetMass,targetRadius,targetDistance);
                if (surface.actualTemperature > surface.maxTemperature&&starship.name !== "clone") {
                    alert(`⚠️ ${component} destroyed: ${surface.actualTemperature.toFixed(1)} K`);
                    stage[component] = null;
                }
            }
        }
    }
}