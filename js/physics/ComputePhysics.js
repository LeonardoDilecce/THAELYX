// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
function ComputePhysics(engine,starship,deltaTime,clone){
    if(!starship) return;
    let baseCoordinates = {x:0,y:0}
    let TargetMass  = 0;
    let HillRadius = 0;
    let targetA = 0;
    let targetPlanetName;
    let targetE= 0;
    let TargetEpochAnomaly = 0;
    let targetRadius = 0;
    let TargetCenter = {x:0,y:0};
    let BaseMass = 0;
    let targetDistance = -1;
    let targetAtmosphere = null;
    if(starship){
        starship.acceleration = new Vettore(0, 0,{x:0,y:0})
        var find = false;
        for (const planet of globalGameData.Star.planets){
            if(planet.name === starship.relatedObject){
                baseCoordinates = planet.position;
                HillRadius = planet.influenceAreaRadius;
                TargetMass = planet.mass;
                targetRadius = planet.radius;
                targetA = planet.a;
                targetE = planet.e;
                TargetEpochAnomaly = planet.epochAnomaly;
                find = true;
                targetPlanetName = planet.name;
                TargetCenter = globalGameData.Star.position;
                BaseMass = globalGameData.Star.mass;
                targetAtmosphere =planet.atmosphere;
                if(Math.sqrt(globalGameData.Starship.relativePosition.x**2+globalGameData.Starship.relativePosition.y**2)<planet.radius+planet.atmosphere.maxAltitude){
                    targetDistance = Math.sqrt(planet.position.x**2+planet.position.y**2);
                }
            }else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === starship.relatedObject){
                        baseCoordinates = moon.position;
                        find = true;
                        TargetMass = moon.mass;
                        HillRadius = moon.influenceAreaRadius;
                        targetRadius = moon.radius;
                        TargetEpochAnomaly = moon.epochAnomaly;
                        targetA = moon.a;
                        targetE = moon.e;
                        targetPlanetName = moon.name;
                        TargetCenter = planet.position;
                        BaseMass = planet.mass;
                        targetAtmosphere =moon.atmosphere;
                        if(Math.sqrt(globalGameData.Starship.relativePosition.x**2+globalGameData.Starship.relativePosition.y**2)<moon.radius+moon.atmosphere.maxAltitude){
                            targetDistance = Math.sqrt(planet.position.x**2+planet.position.y**2);
                        }
                    }
                }
            }
        }
        if(!find){
            if(starship.relatedObject == "Interstellar Space"){
                baseCoordinates = { x: 0, y: 0 };
                targetRadius = 0;
                    starship.ferma=false;
            }else{
                baseCoordinates = globalGameData.Star.position;
                HillRadius = globalGameData.Star.influenceAreaRadius;
                TargetMass = globalGameData.Star.mass;
                targetRadius = globalGameData.Star.radius;
                starship.ferma=false;
            }
            if(targetDistance<0) targetDistance = Math.sqrt(globalGameData.Starship.position.x**2+globalGameData.Starship.position.y**2);
        }
    }
    starship.angularVelocity = 0;
    const dx = -starship.relativePosition.x;
    const dy = -starship.relativePosition.y;
    const distanza2 = dx*dx + dy*dy;
    const distanza = Math.sqrt(distanza2);
    reloadThermodynamics(starship,deltaTime,targetAtmosphere,distanza-targetRadius,TargetMass,targetRadius,targetDistance);
    reloadParachuteDeployment(starship,targetAtmosphere,deltaTime);
    if(!starship.ferma&&starship.EnginesOnline) reloadFuelConsumption(starship,deltaTime,targetAtmosphere, TargetMass, targetRadius, targetDistance);
    if(!starship.ferma) reloadAcceleration(engine,starship,deltaTime,TargetMass,targetRadius,targetAtmosphere,targetA,targetE,TargetCenter,TargetEpochAnomaly,BaseMass);
    const a0 = starship.acceleration.clone();
    if(!starship.ferma){
        starship.relativePosition.x += starship.velocity.x * deltaTime+ 0.5 * a0.x * deltaTime * deltaTime;
        starship.relativePosition.y += starship.velocity.y * deltaTime + 0.5 * a0.y * deltaTime * deltaTime;
    }
    if(!starship.ferma) reloadAcceleration(engine,starship,deltaTime,TargetMass,targetRadius,targetAtmosphere,targetA,targetE,TargetCenter,TargetEpochAnomaly,BaseMass);
    const a1 = starship.acceleration.clone();
    starship.velocity.x += 0.5 * (a0.x + a1.x) * deltaTime;
    starship.velocity.y += 0.5 * (a0.y + a1.y) * deltaTime;
    const v = starship.velocity.modulo();
    if (v >= 0.99999999999999999 * c) {
        starship.velocity = starship.velocity.scale(0.99999999999999999 * c / v);
    }
    if(starship.altitudineRelativa<0){
        const cdx = starship.relativePosition.x;
        const cdy = starship.relativePosition.y;
        const distance = Math.sqrt(cdx * cdx + cdy * cdy);
        if (distance <= targetRadius) {
            const nx = cdx / distance;
            const ny = cdy / distance;
            starship.relativePosition.x = nx * targetRadius;
            starship.relativePosition.y = ny * targetRadius;
            starship.altitudineRelativa = 0;
            starship.ferma = true;
            const dx = -starship.relativePosition.x;
            const dy = -starship.relativePosition.y;
            const distanza2 = dx*dx + dy*dy;
            const distanza = Math.sqrt(distanza2);
            if(distanza2 > 1e-12 && isFinite(distanza2)){
                const gravity = G * TargetMass / distanza2;
                const impactAngle = starship.angle;
                const angleFactor = Math.abs(Math.cos(impactAngle)); 
                const maxSafeVelocity = 10 + gravity;
                const criticalVelocity = maxSafeVelocity / (0.3+ angleFactor);
                if(starship.velocity.modulo() > criticalVelocity){
                    if(starship.name != "clone"){
                        const deadSpeed =starship.velocity.modulo();
                        globalGameData.Starship = null;
                        alert(`MISSION FAILED! Your starship crashed on the surface of ${targetPlanetName} at a velocity of ${deadSpeed} m/s.`);
                    }
                    starship = null;

                }
                if(starship&&starship.name!="clone"){
                    const stadio = starship.Stages[starship.actualStage];
                    if(stadio&&stadio.parachute&&stadio.parachute.openingPercent >=100){
                        const parMass = ((stadio.parachute.numParachutes * stadio.parachute.areaParachute) * (paraMaterialsMap[stadio.parachute.parachuteMaterial]?.m ?? 0))*(parastructureMap[stadio.parachute.parachuteGeometry]?.a ?? 0);
                        stadio.mass-= parMass;
                        starship.mass-= parMass;
                        stadio.parachute = null;
                        document.getElementById("ParachuteButton").textContent = " ";
                        document.getElementById("ParachuteButton").classList.add("NoClickButton");
                    }
                }
            }
            if(starship){
                starship.velocity.x = 0;
                starship.velocity.y = 0;
            }
        }
    }
    if(starship&&!starship.ferma&&starship.name != "clone"){
        for(const stage of Object.values(starship.Stages)){
            const deadSpeed =starship.acceleration.modulo();
            if(stage.surface.GLimit < starship.acceleration.modulo()/9.81){
                globalGameData.Starship = null;
                alert(`MISSION FAILED! Your starship destroyed due to an enormous G-Force exceding structural resistance. Actual G-Force: ${deadSpeed/9.81}`);
                starship = null;
                break;
            }else{
                if(stage.parachute!=null&&stage.parachute.surface.GLimit < starship.acceleration.modulo()/9.81){
                    stage.parachute = null;
                    alert(`WARNING! Parachute destroyed due to an enormous G-Force exceding structural resistance. Actual G-Force: ${deadSpeed/9.81}`);
                }
                if(stage.heatShield!=null&&stage.heatShield.surface.GLimit < starship.acceleration.modulo()/9.81){
                    stage.parachute = null;
                    alert(`WARNING! Heat Shield destroyed due to an enormous G-Force exceding structural resistance. Actual G-Force: ${deadSpeed/9.81}`);
                }
                if(stage.Engine!=null&&stage.Engine.surface.GLimit < starship.acceleration.modulo()/9.81){
                    stage.Engine = null;
                    alert(`WARNING! Engine destroyed due to an enormous G-Force exceding structural resistance. Actual G-Force: ${deadSpeed/9.81}`);
                }
            }
        }
    }
    if(starship){
        const absolutePositionfinal = {
            x: baseCoordinates.x + starship.relativePosition.x,
            y: baseCoordinates.y + starship.relativePosition.y
        };
        starship.position = absolutePositionfinal;
    }
    if(!clone) reloadButtons(starship,starship?.altitudineRelativa??0,targetRadius,targetAtmosphere);
}