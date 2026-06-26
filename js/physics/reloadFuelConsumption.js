function reloadFuelConsumption(starship,deltaTime,targetAtmosphere,targetMass,targetRadius,targetDistance){
    const stadio = starship.Stages[starship.actualStage];
    if(stadio){
        const motore = stadio.Engine;
        if(motore){
            const forzaMotore  = motore.Thrust * (motore.thrustPercent / 100);
            const CombustibileBruciato = (forzaMotore*(fuelMap[stadio.tipoCarburante]?.tsfc??0)*deltaTime);
            const volumeConsumato = CombustibileBruciato /  (fuelMap[stadio.tipoCarburante]?.density??0);
            const vel = starship.velocity.modulo();
            const dx = -starship.relativePosition.x;
            const dy = -starship.relativePosition.y;
            const distanza2 = dx*dx + dy*dy;
            const distanza = Math.sqrt(distanza2);
            const cp = materialCpMap[motore.surface.material]?.cp ?? 1;
            const k = materialCpMap[motore.surface.material]?.k ?? 1e-4;
            let rho = (targetAtmosphere?.density??0) * Math.exp(-distanza / (targetAtmosphere?.scaleHeight??0));
            if (distanza > (targetAtmosphere?.maxAltitude ?? 0)) 
                rho = 0;
            if(!targetAtmosphere||!isFinite(rho)||isNaN(rho)) rho = 0;
            if(!isFinite(rho)) rho = 0;
            let clone = false;
            if(starship.name=="clone") clone = true;
            const area = calculateHullVolume(motore.surface.height, motore.surface.diameter, motore.surface.spessorePercentuale, motore.surface.kind);
            if(stadio.quantitaCarburante - volumeConsumato>=0){
                stadio.quantitaCarburante -=volumeConsumato;
                starship.mass-=CombustibileBruciato;
                stadio.mass-=CombustibileBruciato;
                starship.mass = Math.max(starship.mass, 0);
                stadio.mass = Math.max(stadio.mass, 0);
                updateEnginesTemperature(distanza, motore.surface, rho, vel, area, deltaTime, motore.mass,cp, k, targetAtmosphere,CombustibileBruciato,stadio.tipoCarburante, targetMass, targetRadius, targetDistance, clone);
            }else{
                const massaResidua = stadio.quantitaCarburante * (fuelMap[stadio.tipoCarburante]?.density??0);
                const SpintaReale = massaResidua / ((fuelMap[stadio.tipoCarburante]?.tsfc??0) * deltaTime);
                motore.thrustPercent = (SpintaReale / motore.Thrust) * 100;
                starship.mass -= stadio.quantitaCarburante * (fuelMap[stadio.tipoCarburante]?.density??0);
                stadio.mass -= stadio.quantitaCarburante * (fuelMap[stadio.tipoCarburante]?.density??0);
                stadio.quantitaCarburante = 0;
                updateEnginesTemperature(distanza, motore.surface, rho, vel, area, deltaTime, motore.mass,cp, k, targetAtmosphere,massaResidua,stadio.tipoCarburante, targetMass, targetRadius, targetDistance, clone);
            }
        }
    }
}