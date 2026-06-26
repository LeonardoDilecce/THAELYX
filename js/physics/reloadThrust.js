function reloadThrust(starship){
    const stadio = starship.Stages[starship.actualStage];
    if(stadio){
        const motore = stadio.Engine;
        if(motore){
            const v = Math.min(starship.velocity.modulo(), c * 0.99999999999999);
            const gamma = 1 / Math.sqrt(1 - (v * v) / (c * c));
            const forzaMotore  = motore.Thrust * (motore.thrustPercent / 100);
            const angoloAssoluto = motore.angle + starship.angle;
            motore.angle = 0;
            const direzioneSpinta = new Vettore(
                Math.cos(angoloAssoluto),
                Math.sin(angoloAssoluto),
                starship.relativePosition
            );
            const massaRiposo = starship.mass;
            const accelSpinta = forzaMotore*(hullStructureMap[motore.surface.kind]?.η??0) / (massaRiposo * Math.pow(gamma, 3));
            if(stadio.quantitaCarburante >1e-6){
                const thrust = direzioneSpinta.clone().multiply(accelSpinta);
                starship.acceleration.add(thrust);
                const braccio = new Vettore(5, 0).ruotato(starship.angle);
                const torque = braccio.x * thrust.y - braccio.y * thrust.x;
                if(isNaN(torque / 1000000)){
                    console.error("NaN rilevato! nel torque");
                }else starship.angularVelocity += motore.thrustPercent*torque / 10000;
            }else{
                stadio.quantitaCarburante = 0;
                motore.thrustPercent = 0;
            }
        }
    }
}