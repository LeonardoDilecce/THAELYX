function reloadDrag(starship,targetAtmosphere,deltaTime,distanza){
    const h = distanza;
    if (targetAtmosphere && h >= 0&&h < targetAtmosphere.maxAltitude) {
        let rho = targetAtmosphere.density * Math.exp(- h/ targetAtmosphere.scaleHeight);
        const output = reloadStarshipDragCoefficient(starship);
        let Cd = output.Cd;
        let A = output.A;
        const stadio = starship.Stages[starship.actualStage];
        if(stadio&&stadio.parachute!=null){
            const Apar = ((stadio.parachute.areaParachute));
            const CdPar = ((paraMaterialsMap[stadio.parachute.parachuteMaterial]?.cd ?? 0)*(parastructureMap[stadio.parachute.parachuteGeometry]?.cd ?? 0))* (1 - 0.12 * (stadio.parachute.numParachutes-1))
            A+=Apar*(stadio.parachute.openingPercent/100);
            Cd+=CdPar;
            const mat = paraMaterialsMap[stadio.parachute.parachuteMaterial];
            const str = parastructureMap[stadio.parachute.parachuteGeometry];
            const sigmaEff = mat.r * str.r;
            const PaMax    = sigmaEff / str.a; 
            const CdTot    = mat.cd * str.cd;  
            const hMaxDeploy = -targetAtmosphere.scaleHeight * Math.log(0.1 / targetAtmosphere.density);
            stadio.parachute.maxDeployAltitude = hMaxDeploy;
            if(h<=hMaxDeploy){
                const vMaxSafe = Math.sqrt((2 * PaMax) / (rho * CdTot));
                stadio.parachute.maxShipSpeed = vMaxSafe*0.98;
            }
        }
        const vx = starship.velocity.x;
        const vy = starship.velocity.y;
        const v = Math.sqrt(vx * vx + vy * vy);
        if (v > 1e-3) {
            const drag = 0.5 * rho * v * v * Cd * A;
            const dirX = -vx / v;
            const dirY = -vy / v;
            const dragForce = new Vettore(dirX * drag / starship.mass, dirY * drag / starship.mass, {
                x: starship.relativePosition.x,
                y: starship.relativePosition.y
            });
            if(!isNaN(dragForce.modulo())&&dragForce.modulo() > 1e-6&&stadio.parachute){
                starship.acceleration.add(dragForce);
                stadio.parachute.actualPa = dragForce.modulo()*stadio.parachute.openingPercent;
                const superficieEffettiva = stadio.parachute.numParachutes * stadio.parachute.areaParachute * (parastructureMap[stadio.parachute.parachuteGeometry]?.a ?? 1);
                const dragMassima = ((paraMaterialsMap[stadio.parachute.parachuteMaterial]?.r ?? 0) * superficieEffettiva) / (parastructureMap[stadio.parachute.parachuteGeometry]?.r ?? 1);
                if(stadio.parachute.actualPa>dragMassima&&starship.name!="clone"){
                    const parMass = ((stadio.parachute.numParachutes * stadio.parachute.areaParachute) * (paraMaterialsMap[stadio.parachute.parachuteMaterial]?.m ?? 0))*(parastructureMap[stadio.parachute.parachuteGeometry]?.a ?? 0);
                    stadio.mass-= parMass;
                    starship.mass-= parMass;
                    alert(`WARNING: Parachute destroyed due to atmospheric drag exceeding its maximum force limit. Actual force: ${stadio.parachute.actualPa} N.`);
                    stadio.parachute = null;
                }
            }else if(!isNaN(dragForce.modulo())&&dragForce.modulo() > 1e-6){
                starship.acceleration.add(dragForce);
            }
        }  
        if(stadio.parachute){
            const e = (paraMaterialsMap[stadio.parachute.parachuteMaterial]?.e ?? 0.2)+(parastructureMap[stadio.parachute.parachuteGeometry]?.e ?? 0.2);
            const aperturaAlSec = 1 / (2 +4 * e)*100;
            const deployIncrement = aperturaAlSec * deltaTime;
            if(stadio.parachute.openingPercent + deployIncrement<=stadio.parachute.TargetOpenPercent){
                stadio.parachute.openingPercent +=deployIncrement;
            }else if(stadio.parachute.openingPercent<stadio.parachute.TargetOpenPercent){
                stadio.parachute.openingPercent = stadio.parachute.TargetOpenPercent;
            }
        }
    }
}