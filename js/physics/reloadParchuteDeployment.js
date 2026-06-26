function reloadParachuteDeployment(starship,targetAtmosphere,deltaTime){
    if(starship!=null&&targetAtmosphere!=null){
        const stadio = starship.Stages[starship.actualStage];
        if(stadio&&stadio.parachute){
            const h = starship.altitudineRelativa;
            const e = (paraMaterialsMap[stadio.parachute.parachuteMaterial]?.e ?? 0.2)+(parastructureMap[stadio.parachute.parachuteGeometry]?.e ?? 0.2);
            const densita = targetAtmosphere.density * Math.exp(- h/ targetAtmosphere.scaleHeight)
            const aperturaAlSec = (1 / (2 +4 * e)*100* densita)/(hullStructureMap[stadio.parachute.surface.kind]?.η??0.90);
            const deployIncrement = aperturaAlSec * deltaTime;
            if(stadio.parachute.openingPercent + deployIncrement<=stadio.parachute.TargetOpenPercent)stadio.parachute.openingPercent +=deployIncrement;
            else if(stadio.parachute.openingPercent<stadio.parachute.TargetOpenPercent) stadio.parachute.openingPercent = stadio.parachute.TargetOpenPercent;     
        }
    }
}