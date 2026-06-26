function reloadGravity(star,chronometer,starship,TargetMass,dx,dy,distanza2,distanza,targetA,targetE,TargetCenter,TargetEpochAnomaly,BaseMass,deltaTime){
    const anomaly = calculateTrueAnomaly(star,chronometer,targetA,targetE,chronometer.time,TargetEpochAnomaly,BaseMass,null,deltaTime,false); 
    const tr = targetA * (1 - targetE * targetE) / (1 + targetE * Math.cos(anomaly)); 
    const TSpeed = Math.sqrt(G * BaseMass * (2 / tr - 1 / targetA)); 
    let TargetGamma =  1 / Math.sqrt(1 - Math.pow(TSpeed / c, 2)); 
    let TargetRelativisticMass = TargetMass * TargetGamma; 
    if(isNaN(anomaly)){ 
        TargetRelativisticMass = TargetMass;
    }
    if(distanza2 > 1e-12 && isFinite(distanza2)){
        const forzaPerMassa = G * TargetRelativisticMass / distanza2;
        if (isFinite(distanza) && TargetRelativisticMass >= 1e-6&&isFinite(forzaPerMassa)){
            const vShip = starship.velocity.modulo();
            const gammaShip = 1 / Math.sqrt(1 - Math.pow(vShip / c, 2));
            if(isFinite(gammaShip)&&!isNaN(gammaShip)){
                const ax = (dx / distanza) * forzaPerMassa / gammaShip;
                const ay = (dy / distanza) * forzaPerMassa / gammaShip;
                const px = starship.relativePosition.x;
                const py = starship.relativePosition.y;
                const grav = new Vettore(ax, ay,{x:px,y:py})
                starship.acceleration = grav.clone().add(starship.acceleration);
            }
        }
    }
}