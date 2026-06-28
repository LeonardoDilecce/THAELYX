const globalGameData = new GameData();
try {
    const datiSalvati = localStorage.getItem("simulazione");
    const datiLetti = JSON.parse(datiSalvati);
    if (datiLetti) {
        const newData = GameData.fromJSON(datiLetti);
        Object.assign(globalGameData, newData);
    }
} catch (e) {
    alert("Invalid saved simulation data! Simulation restarted. Error: "+e);
}
const physicsEngine = new PhysicsEngine();
class SpaceSimulator {
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.center = 
        {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        globalGameData.camera.position.x =  this.canvas.width/2
        globalGameData.camera.position.y =  this.canvas.height/2
    }
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.ctx = this.canvas.getContext("2d");
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        window.addEventListener("resize", () => this.resizeCanvas());
        this.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        globalGameData.camera.position.x =  this.canvas.width/2
        globalGameData.camera.position.y =  this.canvas.height/2
        this.EnigeneeringIndex = 0;
        this.MaxEnigeneeringIndex = 40;
        this.offsetReloadFrame = 50;
        this.animate();
    }
    truncateDecimals(num, digits = 7) {
        const factor = Math.pow(10, digits);
        return Math.trunc(num * factor) / factor;
    }
    worldToScreen(pos) {
        return {
            x: pos.x * globalGameData.camera.scale + globalGameData.camera.position.x,
            y: pos.y * globalGameData.camera.scale + globalGameData.camera.position.y,
        };
    }
    ricalcolaBottoni(starship,altitude,targetRadius,targetAtmosphere){
        if(starship!=null){
            const par =globalGameData.Starship?.Stages[globalGameData.Starship.actualStage].parachute??null; 
            if(starship.name!="clone"&&par!=null){
                if(!isFinite(starship.velocity.modulo())||starship.velocity.modulo()>par.maxShipSpeed){
                    document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${starship.velocity.modulo()} m/s`;
                    document.getElementById("ParachuteButton").classList.add("NoClickButton");
                    document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                    document.getElementById("ParachuteButton").style.fontSize = "5px";
                }else if(targetAtmosphere==null||starship.altitudineRelativa>targetAtmosphere.maxAltitude||targetAtmosphere.density<=1e-5){
                    document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute in space`;
                    document.getElementById("ParachuteButton").classList.add("NoClickButton");
                    document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                    document.getElementById("ParachuteButton").style.fontSize = "5px";
                } else if(starship.altitudineRelativa > par.maxDeployAltitude){
                    document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${starship.altitudineRelativa/1000} Km altitude`;
                    document.getElementById("ParachuteButton").classList.add("NoClickButton");
                    document.getElementById("ParachuteButton").classList.add("reduceSizeBtn");
                    document.getElementById("ParachuteButton").style.fontSize = "5px";
                } else if(par.cut){
                    document.getElementById("ParachuteButton").textContent = " ";
                    document.getElementById("ParachuteButton").classList.add("NoClickButton");
                    document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
                    document.getElementById("ParachuteButton").style.fontSize = "10px";
                } else{
                    if(par.openingPercent>=100){
                        document.getElementById("ParachuteButton").textContent = `Cut Parchute`;
                        document.getElementById("ParachuteButton").classList.remove("NoClickButton");
                    }else{
                        document.getElementById("ParachuteButton").textContent = `Deploy Parachute`;
                        document.getElementById("ParachuteButton").classList.remove("NoClickButton");
                    }
                    document.getElementById("ParachuteButton").style.fontSize = "10px";
                    document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
                }
            }
            if(starship.name!="clone"&&globalGameData.Starship!=null){
                const engine =globalGameData.Starship.Stages[globalGameData.Starship.actualStage]?.Engine??null; 
                const carb = globalGameData.Starship.Stages[globalGameData.Starship.actualStage]?.quantitaCarburante??0;
                if(engine&&carb>0){
                    document.getElementById("toggleEngines").classList.remove("NoClickButton");
                    document.getElementById("LeftEngines").classList.remove("NoClickButton");
                    document.getElementById("RightEngines").classList.remove("NoClickButton");
                    document.getElementById("LeftEngines").textContent = "◄";
                    document.getElementById("RightEngines").textContent = "►";
                    if(globalGameData.Starship.EnginesOnline){
                        document.getElementById("toggleEngines").textContent = "Deactivate Engines";
                    }else{
                       document.getElementById("toggleEngines").textContent = "Activate Engines";
                    }
                }else{
                    document.getElementById("toggleEngines").textContent = " ";
                    document.getElementById("toggleEngines").classList.add("NoClickButton");
                    document.getElementById("LeftEngines").textContent = " ";
                    document.getElementById("LeftEngines").classList.add("NoClickButton");
                    document.getElementById("RightEngines").textContent = " ";
                    document.getElementById("RightEngines").classList.add("NoClickButton");
                    document.getElementById("ParachuteButton").style.fontSize = "10px";
                    document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
                    document.getElementById("thrustValue").textContent = 0;
                }
            }
            if(globalGameData.Starship&&altitude<targetRadius*5){
                if(globalGameData.chronometer.speed>3&&!globalGameData.Starship.ferma){ 
                    const slider = document.getElementById("speedSlider");
                    let value = parseFloat(slider.value);
                    value = 3;
                    document.getElementById("speedSlider").max = 3;
                    globalGameData.chronometer.speed = 3; 
                    document.getElementById("speedValue").textContent = value.toFixed(1);
                }
            }else{
                document.getElementById("speedSlider").max = 250;
            }
            if(starship.name!="clone"){
                if(starship.actualStage<Math.max(...Object.keys(starship.Stages).map(Number))){
                    document.getElementById("StageSeparator").textContent = `Separate Stage ${starship.actualStage}`;
                    document.getElementById("StageSeparator").classList.remove("NoClickButton");
                }
            }
        }else{
            document.getElementById("ParachuteButton").textContent = " ";
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
            document.getElementById("StageSeparator").textContent = " ";
            document.getElementById("StageSeparator").classList.add("NoClickButton");
            document.getElementById("toggleEngines").textContent = " ";
            document.getElementById("toggleEngines").classList.add("NoClickButton");
            document.getElementById("LeftEngines").textContent = " ";
            document.getElementById("LeftEngines").classList.add("NoClickButton");
            document.getElementById("RightEngines").textContent = " ";
            document.getElementById("RightEngines").classList.add("NoClickButton");
            document.getElementById("ParachuteButton").classList.remove("reduceSizeBtn");
            document.getElementById("ParachuteButton").style.fontSize = "10px";
            document.getElementById("speedSlider").max = 250;
        }
    }
    interpolazioneCatmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: 0.5 * ((2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 +
                (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 +
                (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3)
        };
    }
    generaSpline(trajectory, targetPoints = 3000) {
        if (trajectory.length < 4) return trajectory;
        const spline = [];
        const segments = trajectory.length - 3;
        const pointsPerSegment = Math.floor(targetPoints / segments);
        for (let i = 0; i < segments; i++) {
            const p0 = trajectory[i];
            const p1 = trajectory[i + 1];
            const p2 = trajectory[i + 2];
            const p3 = trajectory[i + 3];
            for (let j = 0; j < pointsPerSegment; j++) {
                const t = j / pointsPerSegment;
                const interpolato = this.interpolazioneCatmullRom(p0, p1, p2, p3, t);
                spline.push(interpolato);
            }
        }
        spline.push(trajectory[trajectory.length - 2]);
        return spline;
    }
    disegnaTraiettorie() {
        if(globalGameData.Starship){
            const ctx = this.ctx
            const CloneStarship = globalGameData.Starship.clone()
            let targetRadius = 0;
            let TargetPlanetCoord = {x:0,y:0};
            CloneStarship.EnginesOnline = false;
            const trajectory = [];
            let steps = 3000/Math.min(50,Math.max(1,globalGameData.chronometer.speed));
            const deltaTime = 5*globalGameData.chronometer.speed;
            trajectory.push({ x: CloneStarship.position.x, y: CloneStarship.position.y });
            trajectory.push({ x: CloneStarship.position.x, y: CloneStarship.position.y });
            for (let i = 0; i < steps; i++) {
                for (const planet of globalGameData.Star.planets){
                    if(planet.name === CloneStarship.relatedObject){
                        TargetPlanetCoord = planet.position;
                        targetRadius = planet.radius;
                    }else if(planet.moons){
                        for (const moon of planet.moons){
                            if(moon.name === CloneStarship.relatedObject){
                                TargetPlanetCoord = moon.position;
                                targetRadius = moon.radius;
                            }
                        }
                    }
                }
                ComputePhysics(physicsEngine, CloneStarship, deltaTime, true);
                trajectory.push({ x: CloneStarship.position.x, y: CloneStarship.position.y });
                if (!isFinite(CloneStarship.position.x) || !isFinite(CloneStarship.velocity.x)) break;
                const distanzaDalCentro = Math.hypot(CloneStarship.position.x - TargetPlanetCoord.x, CloneStarship.position.y - TargetPlanetCoord.y);
                if (distanzaDalCentro <= targetRadius) break;
            }
            const trajectorySmooth = this.generaSpline(trajectory, 4000);
            ctx.beginPath();
            const traj0 = this.worldToScreen(trajectorySmooth[0]);
            ctx.moveTo(traj0.x, traj0.y);
            for (let point of trajectorySmooth) {
                const pointScreen = this.worldToScreen(point);
                ctx.lineTo(pointScreen.x, pointScreen.y);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.lineWidth = 2;
        }
    }
    disegnaAstronavi(){
        const ctx = this.ctx
        let baseCoordinates = {x:0,y:0}
        if(globalGameData.Starship){
            for (let planet of globalGameData.Star.planets){
                if(planet.name == globalGameData.Starship.relatedObject){
                    baseCoordinates = planet.position;
                }else if(planet.moons){
                    for (const moon of planet.moons){
                        if(moon.name == globalGameData.Starship.relatedObject){
                            baseCoordinates = moon.position;
                        }
                    }
                }
            }
            const screen = this.worldToScreen(globalGameData.Starship.position);
            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(globalGameData.Starship.angle- (Math.PI+(Math.PI/2)));
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-7, 7);
            ctx.lineTo(7, 7);
            ctx.closePath();
            ctx.fillStyle = "#888";
            ctx.fill();
            ctx.restore();
        }
    }
    RicalcolaCoordinateSistemaSolare(deltaTime){
        if(globalGameData.Star){
            const { a, e} = globalGameData.Star;
            const b = a * Math.sqrt(1 - e * e);
            const c = a * e;
            const xEll = a * Math.cos(globalGameData.Star.angle);
            const yEll = b * Math.sin(globalGameData.Star.angle);
            const x = xEll - c;
            const y = yEll;
            globalGameData.Star.position = { x, y };
        }else return
        const sunMass = globalGameData.Star.mass;
        for (let planet of globalGameData.Star.planets) {
            const { a, e } = planet;
            const b = a * Math.sqrt(1 - e * e);
            const c = a * e;
            const baseAnomaly = physicsEngine.CalculateTrueAnomaly(a, e, globalGameData.chronometer.time, planet.epochAnomaly, sunMass);  
            const anomaly = physicsEngine.CalculateTrueAnomalyRelativisticCorrection(baseAnomaly, a, e, globalGameData.chronometer.time, sunMass);
            let epsilon = (G * sunMass) / (a * c * c);
            if (epsilon > 0.1) 
            {
                epsilon = 0.1;
            }
            if(globalGameData.chronometer.speed!=0
                && isFinite(globalGameData.chronometer.gamma)
                && !isNaN(globalGameData.chronometer.gamma)
            )
            {
                planet.a = a * (1 - 1.5 * epsilon); 
                planet.e = e * (1 - epsilon);
                planet.meanSpeed = Math.sqrt(G * sunMass / Math.pow(planet.a, 3));
                const EventHorizonRadius = (2 * G * sunMass) / (c * c);
                const distanceToCenter = Math.sqrt(
                    planet.position.x * planet.position.x+planet.position.y * planet.position.y
                );
                if ((distanceToCenter <= EventHorizonRadius) && distanceToCenter != 0) 
                {
                    for (let i = 0; i < globalGameData.Star.planets.length; i++) 
                    {
                        if (globalGameData.Star.planets[i].name === planet.name) 
                        {
                            globalGameData.Star.planets.splice(i, 1);
                            break;
                        }
                    }
                }           
            }





            planet.angle = (anomaly) % (2 * Math.PI);
            const cosI = Math.cos(planet.inclination);
            const sinI = Math.sin(planet.inclination);
            let xRot = 0;
            let yRot = 0;
            if(planet.e<1){
                const xEll = a * Math.cos(planet.angle);
                const yEll = b * Math.sin(planet.angle);
                const x = xEll - c;
                const y = yEll;
                xRot = x * cosI - y * sinI;
                yRot = x * sinI + y * cosI;
                planet.position = { x: xRot, y: yRot };
            }
            const r = a * (1 - e * e) / (1 + e * Math.cos(anomaly));
            let PSpeed = Math.sqrt(G * sunMass * (2 / r - 1 / a));
            if(PSpeed > c*0.9999) PSpeed = c*0.9999
            const PlanetGamma =  1 / Math.sqrt(1 - Math.pow(PSpeed / c, 2));
            const PlanetRelativisticMass = planet.mass * PlanetGamma;
            const influenceAreaRadius = planet.a * Math.pow((PlanetRelativisticMass/ sunMass), 2 / 5);
            planet.influenceAreaRadius = influenceAreaRadius;
            const mu = PlanetRelativisticMass/ (3 * sunMass);
            const mu13 = Math.pow(mu, 1 / 3);
            const L1 = r * (1 - mu13);
            const L2 = r * (1 + mu13);
            const L3 = r * (1 + (5 * PlanetRelativisticMass) / (12 * sunMass));
            const cddx = planet.position.x - globalGameData.Star.position.x;
            const cddy = planet.position.y - globalGameData.Star.position.y;
            const cddist = Math.sqrt(cddx * cddx + cddy * cddy);
            const LaDx = cddx / cddist;
            const LaDy = cddy / cddist;
            planet.LagrangePoints.L1 = {x: globalGameData.Star.position.x + L1 * LaDx,
                                        y: globalGameData.Star.position.y + L1 * LaDy}
            planet.LagrangePoints.L2 = {x: globalGameData.Star.position.x + L2 * LaDx,
                                        y: globalGameData.Star.position.y + L2 * LaDy}
            planet.LagrangePoints.L3 = {x: globalGameData.Star.position.x - L3 * LaDx,
                                        y: globalGameData.Star.position.y - L3 * LaDy}
            planet.LagrangePoints.L4 = {x: planet.position.x + r * Math.cos(anomaly + Math.PI / 3),
                                        y: planet.position.y + r * Math.sin(anomaly + Math.PI / 3)}
            planet.LagrangePoints.L5 = {x: planet.position.x + r * Math.cos(anomaly - Math.PI / 3),
                                        y: planet.position.y + r * Math.sin(anomaly - Math.PI / 3)}
            if (planet.moons) {
                for (const moon of planet.moons) {
                    const ma = moon.a ?? 20;
                    const me = moon.e ?? 0.01;
                    const mb = ma * Math.sqrt(1 - me * me);
                    const mc = ma * me;
                    const baseMoonAnomaly = physicsEngine.CalculateTrueAnomaly(ma, me, globalGameData.chronometer.time, moon.epochAnomaly, planet.mass);
                    const MoonAnomaly = physicsEngine.CalculateTrueAnomalyRelativisticCorrection(baseMoonAnomaly, ma, me, globalGameData.chronometer.time, planet.mass);
                    let epsilon = (G * moon.mass) / (ma * c * c);
                    if (epsilon > 0.1) 
                    {
                        epsilon = 0.1;
                    }
                    epsilon /=100;
                    if(globalGameData.chronometer.speed!=0
                        && isFinite(globalGameData.chronometer.gamma)
                        && !isNaN(globalGameData.chronometer.gamma)
                    )
                    {
                        moon.a = ma * (1 - 1.5 * epsilon); 
                        moon.e = me * (1 - epsilon);
                        moon.meanSpeed = Math.sqrt(G * moon.mass / Math.pow(moon.a, 3));
                        const EventHorizonRadius = (2 * G * moon.mass) / (c * c);
                        const distanceToCenter = Math.sqrt(
                            moon.position.x * moon.position.x+moon.position.y * moon.position.y
                        );
                        if ((distanceToCenter <= EventHorizonRadius) && distanceToCenter != 0) 
                        {
                            for (let i = 0; i < globalGameData.Star.planets.length; i++) 
                            {
                                if (globalGameData.Star.planets[i].name === moon.name) 
                                {
                                    globalGameData.Star.planets.splice(i, 1);
                                    break;
                                }
                            }
                        }           
                    }

                    
                    moon.angle = (MoonAnomaly) % (2 * Math.PI);
                    const mxEll = ma * Math.cos(moon.angle);
                    const myEll = mb * Math.sin(moon.angle);
                    const mxOffset = mxEll - mc;
                    const myOffset = myEll;
                    const cosMi = Math.cos(moon.inclination ?? 0);
                    const sinMi = Math.sin(moon.inclination ?? 0);
                    const mxRot = mxOffset * cosMi - myOffset * sinMi;
                    const myRot = mxOffset * sinMi + myOffset * cosMi;
                    const mx = xRot + mxRot;
                    const my = yRot + myRot;
                    moon.position = { x: mx, y: my };
                    const mr = ma * (1 - me * me) / (1 + me * Math.cos(MoonAnomaly));
                    const MSpeed = Math.sqrt(G * PlanetRelativisticMass * (2 / mr - 1 / ma));
                    const MoonGamma =  1 / Math.sqrt(1 - Math.pow(MSpeed / c, 2));
                    const relativisticMoonMass = moon.mass * MoonGamma;
                    const moonInfluenceRadius = moon.a * Math.pow((relativisticMoonMass / planet.mass), 2 / 5);
                    moon.influenceAreaRadius = moonInfluenceRadius;
                    const Mmu = relativisticMoonMass/ (3 * PlanetRelativisticMass);
                    const mmu13 = Math.pow(Mmu, 1 / 3);
                    const ML1 = mr * (1 - mmu13);
                    const ML2 = mr * (1 + mmu13);
                    const ML3 = mr * (1 + (5 * relativisticMoonMass) / (12 * PlanetRelativisticMass));
                    const Mcddx = moon.position.x - planet.position.x;
                    const Mcddy = moon.position.y - planet.position.y;
                    const Mcddist = Math.sqrt(Mcddx * Mcddx + Mcddy * Mcddy);
                    const MLaDx = Mcddx / Mcddist;
                    const MLaDy = Mcddy / Mcddist;
                    moon.LagrangePoints.L1 =    {x: planet.position.x + ML1 * MLaDx,
                                                y: planet.position.y + ML1 * MLaDy}
                    moon.LagrangePoints.L2 =    {x: planet.position.x + ML2 * MLaDx,
                                                y: planet.position.y + ML2 * MLaDy}
                    moon.LagrangePoints.L3 =    {x: planet.position.x - ML3 * MLaDx,
                                                y: planet.position.y - ML3 * MLaDy}
                    moon.LagrangePoints.L4 =    {x: moon.position.x + mr * Math.cos(MoonAnomaly + Math.PI / 3),
                                                y: moon.position.y + mr * Math.sin(MoonAnomaly + Math.PI / 3)}
                    moon.LagrangePoints.L5 =    {x: moon.position.x + mr * Math.cos(MoonAnomaly - Math.PI / 3),
                                                y: moon.position.y + mr * Math.sin(MoonAnomaly - Math.PI / 3)}
                }
            }
        }
        for (let planet of globalGameData.Star.planets) {
            const dx = planet.position.x - globalGameData.Star.position.x;
            const dy = planet.position.y - globalGameData.Star.position.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            const a = planet.a;
            const mu = G * globalGameData.Star.mass;
            const v = Math.sqrt(mu * (2 / r - 1 / a));
            const vEscape = Math.sqrt(2 * mu / r);
            if (v >= vEscape) {
                const energy = 0.5 * v * v - mu / r;
                const newA = -mu / (2 * energy);
                const hApprox = r * v;
                const newE = Math.sqrt(1 + (2 * energy * hApprox * hApprox) / (mu * mu));
                planet.a = newA;
                planet.e = newE;
            }
            let index = 0;
            if(planet.moons){
                for(let moon of planet.moons){
                    const mdx = moon.position.x - planet.position.x;
                    const mdy = moon.position.y - planet.position.y;
                    const mmr = Math.sqrt(mdx * mdx + mdy * mdy);
                    const mma = moon.a;
                    const mmu = G * planet.mass;
                    const mv = Math.sqrt(mmu * (2 / mmr - 1 / mma));
                    const mvEscape = Math.sqrt(2 * mmu / mmr);
                    if (mv >= mvEscape||mmr>planet.influenceAreaRadius) {
                        const menergy = 0.5 * mv * mv - mmu / mmr;
                        const mhApprox = mmr * mv;
                        moon.a = -mmu / (2 * menergy);
                        moon.e = Math.sqrt(1 + (2 * menergy * mhApprox * mhApprox) / (mmu * mmu));
                        const planetToMoon = new Planet(moon.name,moon.a+planet.a,moon.e+planet.e,moon.radius,moon.color,planet.angle,moon.meanSpeed,moon.mass,moon.inclination,planet.epochAnomaly,[],moon.atmosphere)
                        const escapeAnomaly = physicsEngine.CalculateTrueAnomaly(planetToMoon.a, planetToMoon.e, globalGameData.chronometer.time, planetToMoon.epochAnomaly, sunMass);
                        const anomaly = physicsEngine.CalculateTrueAnomalyRelativisticCorrection(escapeAnomaly, planetToMoon.a, planetToMoon.e, globalGameData.chronometer.time, sunMass);
                        let epsilon = (G * sunMass) / (planetToMoon.a * c * c);
                        if (epsilon > 0.1) 
                        {
                            epsilon = 0.1;
                        }
                        epsilon /=100;
                        if(globalGameData.chronometer.speed!=0
                            && isFinite(globalGameData.chronometer.gamma)
                            && !isNaN(globalGameData.chronometer.gamma)
                        )
                        {
                            planetToMoon.a = planetToMoon.a * (1 - 1.5 * epsilon); 
                            planetToMoon.e = planetToMoon.e * (1 - epsilon);
                            planetToMoon.meanSpeed = Math.sqrt(G * sunMass / Math.pow(planetToMoon.a, 3));
                            const EventHorizonRadius = (2 * G * sunMass) / (c * c);
                            const distanceToCenter = Math.sqrt(
                                planetToMoon.position.x * planetToMoon.position.x+planetToMoon.position.y * planetToMoon.position.y
                            );
                            if ((distanceToCenter <= EventHorizonRadius) && distanceToCenter != 0) 
                            {
                                for (let i = 0; i < star.planets.length; i++) 
                                {
                                    if (star.planets[i].name === planetToMoon.name) 
                                    {
                                        star.planets.splice(i, 1);
                                        break;
                                    }
                                }
                            }           
                        }

                        
                        
                        planetToMoon.angle = (anomaly) % (2 * Math.PI);
                        const cosI = Math.cos(planetToMoon.inclination);
                        const sinI = Math.sin(planetToMoon.inclination);
                        let xRot = 0;
                        let yRot = 0;
                        if(planetToMoon.e<1){
                            const b = a * Math.sqrt(1 - planetToMoon.e * planetToMoon.e);
                            const xEll = a * Math.cos(planetToMoon.angle);
                            const yEll = b * Math.sin(planetToMoon.angle);
                            const x = xEll - c;
                            const y = yEll;
                            xRot = x * cosI - y * sinI;
                            yRot = x * sinI + y * cosI;
                            planetToMoon.position = { x: xRot, y: yRot };
                        }   
                        globalGameData.Star.planets.push(planetToMoon);
                        planet.moons.splice(index,1);   
                    }
                    index+=1;
                }
            }
        }
    }
    disegnaSistemaSolare(deltaTime) {
        function circleCoversCanvas(center, radius, canvas) {
            const w = canvas.width, h = canvas.height;
            const cx = center.x, cy = center.y;
            const r2 = radius * radius;
            const d2_00 = cx*cx + cy*cy; 
            const d2_w0 = (w-cx)*(w-cx) + cy*cy; 
            const d2_0h = cx*cx + (h-cy)*(h-cy); 
            const d2_wh = (w-cx)*(w-cx) + (h-cy)*(h-cy); 
            return r2 >= Math.max(d2_00, d2_w0, d2_0h, d2_wh);
        }
        function DrawLangragePoint(LP,color,size,tesxt,name,index,worldToScreen){
            if(globalGameData.Starship&&globalGameData.Starship.relatedObject == name){
                const LCenter = worldToScreen({ x: LP.x, y: LP.y });
                ctx.beginPath();
                ctx.ellipse(LCenter.x, LCenter.y, size, size, 0, 0, Math.PI * 2);
                ctx.fillStyle= color;
                ctx.fill();
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.font = "11px sans-serif";
                ctx.fillStyle = "#aaa";
                ctx.textAlign = "center";
                const text = "L"+index+" ("+tesxt+")";
                ctx.fillText(text, LCenter.x, LCenter.y);
                ctx.restore();
            }
        }
        const ctx = this.ctx
        if(globalGameData.Star){
            const screen = this.worldToScreen(globalGameData.Star.position);
            const visualRadius = Math.max(globalGameData.Star.radius * globalGameData.camera.scale, 2);
            const visualhillRadius = Math.max(globalGameData.Star.influenceAreaRadius * globalGameData.camera.scale, 2);
            const visualAtmosphereRadius = Math.max((globalGameData.Star.corona.maxAltitude+globalGameData.Star.radius) * globalGameData.camera.scale, 2);
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, visualAtmosphereRadius, 0, Math.PI * 2);
            ctx.fillStyle = globalGameData.Star.corona.color;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, visualhillRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 230, 0, 0.62)";
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, visualRadius, 0, Math.PI * 2);
            ctx.fillStyle = globalGameData.Star.color;
            ctx.fill();
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(globalGameData.Star.name, screen.x, screen.y + visualRadius + 14);
            ctx.restore();
        } else return;
        const sunMass = globalGameData.Star.mass;
        for (let planet of globalGameData.Star.planets) {
            const a = planet.a;
            const e = planet.e;
            const b = a * Math.sqrt(1 - e * e);
            const c = a * e;
            if(e<1){
                const orbitCenter = {
                    x: 0 - c,
                    y: 0
                };
                const cosI = Math.cos(planet.inclination);
                const sinI = Math.sin(planet.inclination);
                const xRot = orbitCenter.x * cosI - orbitCenter.y * sinI;
                const yRot = orbitCenter.x * sinI + orbitCenter.y * cosI;
                const screenCenter = this.worldToScreen({ x: xRot, y: yRot });
                const rx = a * globalGameData.camera.scale;
                const ry = b * globalGameData.camera.scale;
                if(rx<100000&&ry<100000){
                    ctx.beginPath();
                    ctx.ellipse(screenCenter.x, screenCenter.y, rx, ry, planet.inclination, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255,255,255,0.15)";
                    ctx.stroke();
                }else{
                    const rx = a * globalGameData.camera.scale;
                    const ry = b * globalGameData.camera.scale;
                    const screenCenter = this.worldToScreen({ x: xRot, y: yRot });
                    const canvasWidth = ctx.canvas.width;
                    const canvasHeight = ctx.canvas.height;
                    const left = screenCenter.x - rx;
                    const right = screenCenter.x + rx;
                    const top = screenCenter.y - ry;
                    const bottom = screenCenter.y + ry;
                    const isVisible = right >= 0 && left <= canvasWidth &&bottom >= 0 &&top <= canvasHeight;
                    if (isVisible && rx < 2.5e6 && ry <2.5e6) {
                        ctx.beginPath();
                        ctx.ellipse(screenCenter.x, screenCenter.y, rx, ry, planet.inclination, 0, Math.PI * 2);
                        ctx.strokeStyle = "rgba(255,255,255,0.15)";
                        ctx.stroke();
                    }else if(globalGameData.camera.scale<0.005){
                        const baseAnomaly = physicsEngine.CalculateTrueAnomaly(a, e, globalGameData.chronometer.time, planet.epochAnomaly, sunMass);
                        const anomaly = physicsEngine.CalculateTrueAnomalyRelativisticCorrection(baseAnomaly, a, e, globalGameData.chronometer.time, sunMass);
                        const delta = Math.PI / 50;
                        const startAngle = anomaly - delta;
                        const endAngle = anomaly + delta;
                        ctx.beginPath();
                        ctx.ellipse(screenCenter.x,screenCenter.y,rx, ry,planet.inclination,startAngle,endAngle);
                        ctx.strokeStyle = "rgba(255,255,255,0.25)";
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            }
            if(planet.LagrangePoints.L1.x!=undefined&&planet.LagrangePoints.L1.y!=undefined){
                DrawLangragePoint(planet.LagrangePoints.L1,"rgba(255, 0, 0, 0.56)",4,planet.name,planet.name,1,this.worldToScreen);
            }
            if(planet.LagrangePoints.L2.x!=undefined&&planet.LagrangePoints.L2.y!=undefined){
                DrawLangragePoint(planet.LagrangePoints.L2,"rgba(255, 0, 0, 0.56)",4,planet.name,planet.name,2,this.worldToScreen);
            }
            if(planet.LagrangePoints.L3.x!=undefined&&planet.LagrangePoints.L3.y!=undefined){
                DrawLangragePoint(planet.LagrangePoints.L3,"rgba(255, 0, 0, 0.56)",4,planet.name,planet.name,3,this.worldToScreen);
            }
            if(planet.LagrangePoints.L4.x!=undefined&&planet.LagrangePoints.L4.y!=undefined){
                DrawLangragePoint(planet.LagrangePoints.L4,"rgba(0, 255, 102, 0.56)",4,planet.name,planet.name,4,this.worldToScreen);
            }
            if(planet.LagrangePoints.L5.x!=undefined&&planet.LagrangePoints.L5.y!=undefined){
                DrawLangragePoint(planet.LagrangePoints.L5,"rgba(0, 255, 102, 0.56)",4,planet.name,planet.name,5,this.worldToScreen);
            }
        }
        for (let planet of globalGameData.Star.planets) {
            const screen = this.worldToScreen(planet.position);
            const visualRadius = Math.max(planet.radius * globalGameData.camera.scale, 2);
            const visualhillRadius = Math.max(planet.influenceAreaRadius * globalGameData.camera.scale, 2);
            const drawhill = circleCoversCanvas(screen,visualhillRadius,this.canvas)
            let drawn = false;
            if(!drawhill){
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, visualhillRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 255, 0, 0.07)";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, visualhillRadius, 0, 2 * Math.PI);
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
                ctx.stroke();
            }else{
                if(!drawn){
                    drawn = true;
                    ctx.beginPath();
                    ctx.arc(screen.x, screen.y, visualRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0, 255, 0, 0.07)";
                    ctx.fill();
                }
            }
            const visualAtmosphereRadius = Math.max((planet.atmosphere.maxAltitude+planet.radius) * globalGameData.camera.scale, 2);
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, visualAtmosphereRadius, 0, Math.PI * 2);
            ctx.fillStyle = planet.atmosphere.color;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, visualRadius, 0, Math.PI * 2);
            ctx.fillStyle = planet.color;
            ctx.fill();
            if (planet.moons) {
                for (const moon of planet.moons) {
                    const ma = moon.a ?? 20;
                    const me = moon.e ?? 0.01;
                    const mb = ma * Math.sqrt(1 - me * me);
                    const mc = ma * me;
                    const cosMi2 = Math.cos(moon.inclination ?? 0);
                    const sinMi2 = Math.sin(moon.inclination ?? 0);
                    const fx = -mc; 
                    const fy = 0;
                    const fxRot = fx * cosMi2 - fy * sinMi2;
                    const fyRot = fx * sinMi2 + fy * cosMi2;
                    const orbitCenter = this.worldToScreen({
                        x: planet.position.x + fxRot,
                        y: planet.position.y + fyRot
                    });
                    ctx.save();
                    ctx.beginPath();
                    ctx.ellipse(
                        orbitCenter.x,
                        orbitCenter.y,
                        ma * globalGameData.camera.scale,
                        mb * globalGameData.camera.scale,
                        moon.inclination, 0, Math.PI * 2
                    );
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "rgba(34, 34, 85, 0.62)";
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                    const screenMoon = this.worldToScreen(moon.position);
                    const moonRadius = Math.max(moon.radius * globalGameData.camera.scale, 1.5);
                    const visualmoonhillRadius = Math.max(moon.influenceAreaRadius * globalGameData.camera.scale, 2);
                    const drawmhill = circleCoversCanvas(screenMoon,visualmoonhillRadius,this.canvas)
                    let mdrawn = false;
                    if(!drawmhill){
                        ctx.beginPath();
                        ctx.arc(screenMoon.x, screenMoon.y, visualmoonhillRadius, 0, 2 * Math.PI);
                        ctx.fillStyle = "rgba(0, 0, 255, 0.07)";
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(screenMoon.x, screenMoon.y, visualmoonhillRadius, 0, 2 * Math.PI);
                        ctx.lineWidth = 2.5;
                        ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
                        ctx.stroke();
                    }else{
                        if(!mdrawn){
                            drawn = true;
                            ctx.beginPath();
                            ctx.arc(screen.x, screen.y, visualRadius, 0, 2 * Math.PI);
                            ctx.fillStyle = "rgba(0, 0, 255, 0.07)";
                            ctx.fill();
                        }
                    }
                    const visualMoonAtmosphereRadius = Math.max((moon.atmosphere.maxAltitude+moon.radius) * globalGameData.camera.scale, 2)
                    ctx.beginPath();
                    ctx.arc(screenMoon.x, screenMoon.y, visualMoonAtmosphereRadius, 0, Math.PI * 2);
                    ctx.fillStyle = moon.atmosphere.color;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.beginPath();
                    ctx.arc(screenMoon.x, screenMoon.y, moonRadius, 0, Math.PI * 2);
                    ctx.fillStyle = moon.color;
                    ctx.fill();
                    if(moon.LagrangePoints.L1.x!=undefined&&moon.LagrangePoints.L1.y!=undefined){
                        DrawLangragePoint(moon.LagrangePoints.L1,"rgba(255, 0, 0, 0.56)",4,moon.name,planet.name,1,this.worldToScreen);
                    }
                    if(moon.LagrangePoints.L2.x!=undefined&&moon.LagrangePoints.L2.y!=undefined){
                        DrawLangragePoint(moon.LagrangePoints.L2,"rgba(255, 0, 0, 0.56)",4,moon.name,planet.name,2,this.worldToScreen);
                    }
                    if(moon.LagrangePoints.L3.x!=undefined&&moon.LagrangePoints.L3.y!=undefined){
                        DrawLangragePoint(moon.LagrangePoints.L3,"rgba(255, 0, 0, 0.56)",4,moon.name,planet.name,3,this.worldToScreen);
                    }
                    if(moon.LagrangePoints.L4.x!=undefined&&moon.LagrangePoints.L4.y!=undefined){
                        DrawLangragePoint(moon.LagrangePoints.L4,"rgba(0, 255, 102, 0.56)",4,moon.name,planet.name,4,this.worldToScreen);
                    }
                    if(moon.LagrangePoints.L5.x!=undefined&&moon.LagrangePoints.L5.y!=undefined){
                        DrawLangragePoint(moon.LagrangePoints.L5,"rgba(0, 255, 102, 0.56)",4,moon.name,planet.name,5,this.worldToScreen);
                    }
                }
            }
        }
        for (const planet of globalGameData.Star.planets) {
            const screen = this.worldToScreen(planet.position);
            const visualRadius = Math.max(planet.radius * globalGameData.camera.scale, 2);
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(planet.name, screen.x, screen.y + visualRadius + 14);
            ctx.restore();
            if (planet.moons) {
                for (const moon of planet.moons) {
                    const moonScreen = this.worldToScreen(moon.position);
                    const moonRadius = Math.max(moon.radius * globalGameData.camera.scale, 1.5);
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.font = "10px sans-serif";
                    ctx.fillStyle = "#aaa";
                    ctx.textAlign = "center";
                    ctx.fillText(moon.name, moonScreen.x, moonScreen.y + moonRadius + 10);
                    ctx.restore();
                }
            }
        }
    }

    disegnaInformazioniNavigazione(deltaTime) {
        let targetAtmo = null;
        let targetCentralMass = 0;
        let TargetMass = 0;
        let targetDistance = -1;
        let targetRadius = 0;
        if(globalGameData.Starship){
            for (const planet of globalGameData.Star.planets){
                if(planet.name === globalGameData.Starship.relatedObject){
                    targetAtmo =planet.atmosphere;
                    targetCentralMass =globalGameData.Star.mass;
                    TargetMass = planet.mass;
                    targetRadius = planet.radius;
                    if(Math.sqrt(globalGameData.Starship.relativePosition.x**2+globalGameData.Starship.relativePosition.y**2)<planet.radius+planet.atmosphere.maxAltitude){
                        targetDistance = Math.sqrt(planet.position.x**2+planet.position.y**2);
                    }
                }
                else if(planet.moons){
                    for (const moon of planet.moons){
                        if(moon.name === globalGameData.Starship.relatedObject){
                            targetAtmo =moon.atmosphere;  
                            targetRadius = moon.radius; 
                            TargetMass = moon.mass;
                            targetCentralMass = planet.mass;
                            if(Math.sqrt(globalGameData.Starship.relativePosition.x**2+globalGameData.Starship.relativePosition.y**2)<moon.radius+moon.atmosphere.maxAltitude){
                                targetDistance = Math.sqrt(planet.position.x**2+planet.position.y**2);
                            }
                        }
                    }
                }else{
                    targetRadius = globalGameData.Star.radius; 
                    TargetMass = globalGameData.Star.mass;
                    targetCentralMass =globalGameData.Star.mass;
                    if(targetDistance<0) targetDistance = Math.sqrt(globalGameData.Starship.position.x**2+globalGameData.Starship.position.y**2);
                }
            }
        }
        const ctx = this.ctx
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.font = "14px monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        const nave = globalGameData.Starship;
        const startX = 20;
        let y = 20;
        const lineHeight = 16;
        const velocita = Math.sqrt((nave?.velocity?.x ??0) ** 2 + (nave?.velocity?.y??0) ** 2);
        const a = nave?.acceleration;
        const acceleration = Math.sqrt((a?.x ?? 0) ** 2 + (a?.y ?? 0) ** 2);
        let angoloGradi = ((globalGameData.Starship?.angle ?? 0) * 180 / Math.PI);
        if(nave == null) angoloGradi = 0;
        else angoloGradi-=270;
        const GiornoFormatted= globalGameData.chronometer.day+" / "
        + globalGameData.chronometer.month + " / " + globalGameData.chronometer.year;
        const OraFormatted = globalGameData.chronometer.hours + " : " +  globalGameData.chronometer.minutes + " : " +
        (globalGameData.chronometer.seconds.toFixed(0))
        const speedSimulated = parseFloat(globalGameData.chronometer.speed) || 1.0;
        const engineSpeedStage  = globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??-1].Engine?.Thrust?? 0;
        const starshipMass = globalGameData.Starship?.mass?? 0;
        const starFuelStage = globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??-1].quantitaCarburante?? 0;
        const StarFuelProp  = globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??-1].tipoCarburante?? 0;
        const starFuel = globalGameData.Starship?.Stages? Object.values(globalGameData.Starship.Stages).reduce((sum, stage) => sum + stage.quantitaCarburante, 0 ): 0;
        const actualStage = globalGameData.Starship?.actualStage ?? 0;
        const actualStageMass = globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??-1].mass?? 0;
        let maxStage = Math.max(...Object.keys((globalGameData.Starship?.Stages ?? {})).map(Number));
        if(!isFinite(maxStage)) maxStage = 0;
        const parachute = globalGameData.Starship?.Stages[actualStage].parachute;
        const heatShield = globalGameData.Starship?.Stages[actualStage].heatShield;
        const engine = globalGameData.Starship?.Stages[actualStage].Engine;
        const cstage = globalGameData.Starship?.Stages[actualStage];
        const RGiornoFormatted= globalGameData.chronometer.rday+" / "
        + globalGameData.chronometer.rmonth + " / " + globalGameData.chronometer.ryear;
        const ROraFormatted = globalGameData.chronometer.rhours + " : " +  globalGameData.chronometer.rminutes + " : " +
        (globalGameData.chronometer.rseconds.toFixed(0))
        const Lorentz = globalGameData.chronometer.gamma;
        const linesText = [];
        const rightLinesText = [];
        let index = 1;
        function calcolaInquinamentoAtmosferico(composition, rho, P = 101325, T = 288.15) {
            const pollutants = ["CO", "NO", "NO₂", "SO₂", "O₃", "CH₄", "CF₄", "SF₆", "CFC₁₁", "CFC₁₂", "PAN","HCl", "HF", "HCN", "PH₃", "PM2.5", "PM10", "BlackCarbon", "OrganicCarbon", "Smoke", "Dust", "Ash"];
            const toxicThresholds_ppm = {"HCN": 100,"PH₃": 10,"SO₂": 5,"NO₂": 5,"CO": 100,"O₃": 0.1,"PAN": 2, "HCl": 5,"HF": 3,"PM2.5": 50, "BlackCarbon": 30,"Smoke": 60};
            let isToxic = false;
            let greenhouseSum = 0;
            let pollutantMoleFrac = 0;
            let weightedToxicity = 0;
            let details = {};
            for (const [gas, perc] of Object.entries(composition)) {
                const molFrac = perc / 100;
                const mw = gasThermalMap[gas]?.molarMass || 0;
                const gh = gasThermalMap[gas].greenhouse || 0;
                const isPollutant = pollutants.includes(gas);
                const ppm = molFrac * 1_000_000;
                const ug_m3 = (ppm * mw * P) / (R * T); 
                const threshold = toxicThresholds_ppm[gas];
                greenhouseSum += gh * molFrac;
                if (isPollutant) {
                    pollutantMoleFrac += molFrac;
                    weightedToxicity += gh * ppm;
                }
                details[gas] = {ppm: Math.round(ppm), ug_m3: Math.round(ug_m3), greenhouseImpact: gh};
                if (threshold && details[gas].ppm > threshold) isToxic = true;        
            }
            const pollutants_ppm = Math.round(pollutantMoleFrac * 1_000_000);
            const greenhouseLevel = (greenhouseSum * 100).toFixed(2);
            const totalToxicity = Math.round(weightedToxicity);
            const O2_pct = composition["O₂"] || 0;
            const PO2 = P * (O2_pct / 100); 
            const isRespirable = PO2 >= 17000 && O2_pct >= 19.5;
            let airQuality = "Unknown";
            if (!isRespirable||rho<0.3) airQuality = "Lethal";
            else if (isToxic || totalToxicity >= 1000) airQuality = "Toxic";
            else if (pollutants_ppm < 10 && rho > 1.2 && totalToxicity <= 5) airQuality = "Excellent";
            else if (pollutants_ppm < 25 && rho > 1.0 && totalToxicity <= 10) airQuality = "Very Good";
            else if (pollutants_ppm < 50 && rho > 0.9 && totalToxicity <= 15) airQuality = "Good";
            else if (pollutants_ppm < 75 && rho > 0.85 && totalToxicity <= 20) airQuality = "Acceptable";
            else if (pollutants_ppm < 100 && rho > 0.75 && totalToxicity <= 30) airQuality = "Moderate";
            else if (pollutants_ppm < 150 && rho > 0.65 && totalToxicity <= 60) airQuality = "Poor";
            else if (pollutants_ppm < 250 && rho > 0.55 && totalToxicity <= 100) airQuality = "Hazardous";
            else airQuality = "Extremley Hazardous";
            return {airQuality:airQuality,pollutants_ppm:pollutants_ppm};
        }
        linesText.push(`╔════════════════════« NAVIGATION »══════════════════~`) 
        if(globalGameData.Starship){
            linesText.push(`║ Orbiting Around: ${nave?.relatedObject?? " - "}`)
            linesText.push(`║ Relative Altitude: ${((nave?.altitudineRelativa?? 0 )/ 1000)} km`)
            linesText.push(`║ Speed: ${velocita.toFixed(2)} m/s`)
            linesText.push(`║ Accelleration: ${acceleration.toFixed(2)} m/s²`)    
            linesText.push(`║ Rotation: ${angoloGradi.toFixed(2)} °`)
        }else{
            linesText.push(`║`)
            linesText.push(`║`)
            linesText.push(`║`)
        }
        linesText.push(`║ Date: ${GiornoFormatted}`)
        linesText.push(`║ Time: ${OraFormatted}`)
        linesText.push(`║ Simulation Speed: ${speedSimulated.toFixed(2)}`)
        if(!globalGameData.Starship){
            linesText.push(`║`)
            linesText.push(`║`)
        }
        if(starshipMass >0) linesText.push(`║ Starship Total Mass: ${starshipMass.toFixed(2)} Kg`)
        else linesText.push(`║`)
        linesText.push("╚════════════════════════════════════════════════════~")
        const velocityRatio = (globalGameData.Starship?.velocity.modulo()??0) / 299792458;
        const dilationFactor = 1 / Math.sqrt(1 - Math.pow(velocityRatio, 2));
        let epsilon = 0;
        const distance = Math.sqrt((globalGameData.Starship?.relativePosition?.x??0) ** 2 + (globalGameData.Starship?.relativePosition?.y??0) ** 2);
        const redshift = 1 / Math.sqrt(1 - (2 * G * targetCentralMass) / (distance * c ** 2)) - 1
        let gamma =  1 / Math.sqrt(1 - Math.pow((globalGameData.Starship?.velocity?.modulo()??0) / c, 2));
        if(!isFinite(gamma)) gamma = 999999999;
        const massIncrase = (globalGameData.Starship?.mass??0) * gamma;
        if(targetCentralMass!=0) epsilon = (2 * G * targetCentralMass) / (distance * c * c);
        let shipLong = 0;
        if(globalGameData.Starship&&globalGameData.Starship.Stages){
            for(const stage of Object.values(globalGameData.Starship.Stages)){
                shipLong+=stage.surface.height;
                if(stage.Engine) shipLong+=stage.Engine.surface.height;
                if(stage.heatShield) shipLong+=stage.heatShield.surface.height;
                if(stage.parachute) shipLong+=stage.parachute.surface.height;
            }
        }
        const contractedLength = shipLong / gamma;

        linesText.push(`╔══════════════════« RELATIVISTICS »═════════════════~`)
        if(!globalGameData.Starship){
            linesText.push(`║`);
            linesText.push(`║`);
            linesText.push(`║`);
        }
        linesText.push(`║ Relativistic Date: ${RGiornoFormatted}`)
        linesText.push(`║ Relativistic Time: ${ROraFormatted} `)
        linesText.push(`║ Time Dilatation Factor (γₜ): ${dilationFactor}`)
        if(globalGameData.Starship){
            if(globalGameData.Starship.velocity.modulo()<c) linesText.push(`║ Lorentz Factor (γ): ${Lorentz} (${velocityRatio}c)`)
            else linesText.push(`║ Lorentz Factor (γ): ∞ (Relativistic Singularity)`)
            linesText.push(`║ Spacetime Warp Factor (ε): ${epsilon.toFixed(5)}`);               
            if(isFinite(redshift)) linesText.push(`║ Gravitational Redshift (z): ${redshift.toFixed(5)}`);
            else linesText.push(`║ ERROR: Invalid Gravitational Redshift!`);
            if(massIncrase>0&&isFinite(massIncrase)) linesText.push(`║ Starship Relativistic Mass: ${massIncrase.toFixed(5)} Kg`);
            else if(!isFinite(massIncrase)) linesText.push(`║ CRITICAL: Relativistic Singularity detected!`);
            else linesText.push(`║`);
            if(contractedLength>0&&isFinite(contractedLength)) linesText.push(`║ Starship Length Contraction: ${contractedLength.toFixed(5)} m`);
            else if(!isFinite(contractedLength)) linesText.push(`║ CRITICAL: Relativistic Singularity detected!`);
            else linesText.push(`║`);
        }else{
            linesText.push(`║`);
            linesText.push(`║`);
        }
        linesText.push("╚════════════════════════════════════════════════════~")
        linesText.push(`╔══════════════════« STARSHIP DATA »═════════════════~`)
        const starData = actualStageMass>0;
        if(starData) linesText.push(`║ Starship Fuel Quantity: ${starFuel.toFixed(2)} m³`)
        else{
            linesText.push(`║`)
            linesText.push(`║`)
        }
        rightLinesText.push(`~══════════════════════« SENSOR DATA »══════════════════════╗`)
        let temperatura = 2.725;
        if(targetAtmo&&globalGameData.Starship){
            const h = globalGameData.Starship.altitudineRelativa;
            if (targetAtmo && h >= 0&&h < targetAtmo.maxAltitude) {
                let rho = targetAtmo.density * Math.exp(- h/ targetAtmo.scaleHeight);
                const output = calcolaInquinamentoAtmosferico(targetAtmo.composition,rho);
                const Pressione = physicsEngine.ComputeAtmosphericPressure(rho, 288.15, targetAtmo.composition);
                const PressioneSup = physicsEngine.ComputeAtmosphericPressure(targetAtmo.density, 288.15, targetAtmo.composition);
                let albedo = targetAtmo?.albedo??0.80;
                temperatura = computePlanetaryTemperature((targetAtmo.composition),globalGameData.Star.luminosity,targetDistance,albedo,rho,targetAtmo?.molecularWeight??0,targetAtmo?.scaleHeight??0,TargetMass,targetRadius,targetAtmo?.density??0,targetAtmo?.maxAltitude??0,PressioneSup,globalGameData.Starship?.altitudineRelativa??0)
                if(isFinite(Pressione)&&isFinite(temperatura)){
                    rightLinesText.push(`kg/m³; Local temperature: ${(temperatura-273.15).toFixed(4)} °C ║`);    
                    rightLinesText.push(`Actual atmosphere pressure: ${Pressione} mPa ║`);
                    const R = 8.314;
                    const Mw_kgmol = (rho * R * temperatura) / (Pressione);
                    const Mw_dynamic = Mw_kgmol * 1000;
                    let cp_mol = 0;
                    for (const [gas, percentuale] of Object.entries(targetAtmo.composition)) {
                        const cp = gasThermalMap[gas]?.specificHeat ?? 0.01;
                        cp_mol += cp * (percentuale / 100);
                    }
                    const cp_massico = cp_mol * 1000 / Mw_dynamic;
                    rightLinesText.push(`Actual atmosphere molecular weight: ${Mw_dynamic.toFixed(2)} g/mol ║`) 
                    rightLinesText.push(`Actual atmosphere specific heat ${cp_massico.toFixed(2)} J/kg·K ║`);
                }else{
                    rightLinesText.push(`╔═══════════« Atmospheric Monitoring System »═══════════╗║`) 
                    rightLinesText.push(`║ ERROR: Starship Atmospheric Sensor Data Unavalabile!  ║║`) 
                    rightLinesText.push(`║         No sensors detected on your starship!         ║║`) 
                    rightLinesText.push(`╚═══════════════════════════════════════════════════════╝║`)
                }
                rightLinesText.push(`Actual atmosphere composition: ║`);
                let outString = "";
                let offset = 0;
                for (const [key, value] of Object.entries(targetAtmo.composition)) {
                    outString += `${key}: ${value.toFixed(7)} %`;
                    offset+=1;
                    if(offset%4===0){
                        rightLinesText.push(outString+" ║");
                        outString = "";
                    }else outString+=" ";  
                }
                rightLinesText.push(outString+" ║");
                rightLinesText.push(`Air quality: ${output.airQuality}; Pollutants Detected: ${output.pollutants_ppm} ppm  ║`)
                rightLinesText.push(`Actual atmosphere density: ${rho.toFixed(5)}  ║`)
            }
        }else if(globalGameData.Starship){
            rightLinesText.push(`Local temperature: ${2.725-273.15} °C  ║` )
        }else{
            rightLinesText.push(`║`) 
            rightLinesText.push(`║`) 
            rightLinesText.push(`╔═══════════« Atmospheric Monitoring System »═══════════╗║`) 
            rightLinesText.push(`║ ERROR: Starship Atmospheric Sensor Data Unavalabile!  ║║`) 
            rightLinesText.push(`║         No sensors detected on your starship!         ║║`) 
            rightLinesText.push(`╚═══════════════════════════════════════════════════════╝║`)
            rightLinesText.push(`║`) 
            rightLinesText.push(`║`) 
        }
        if(globalGameData.Starship){
            rightLinesText.push(`G-Force: ${globalGameData.Starship.acceleration.modulo()/9.81} G  ║`);
            rightLinesText.push(`Eₖ: ${(globalGameData.Starship.velocity.modulo() > 0 ? 0.5 *globalGameData.Starship.mass * globalGameData.Starship.velocity.modulo() *globalGameData.Starship.velocity.modulo(): 0).toFixed(2)} J  ║`);
            rightLinesText.push(`F: ${(globalGameData.Starship.mass * globalGameData.Starship.acceleration.modulo()).toFixed(2)} N  ║`);
            rightLinesText.push(`p: ${(globalGameData.Starship.mass * globalGameData.Starship.velocity.modulo()).toFixed(2)} kg·m/s  ║`);  
        }
        function calcolaVolumeInterno(h, d, s, kind) {
            const rEst = d / 2;
            const spessoreAssoluto = d * (s / 100);
            const rInt = rEst - spessoreAssoluto;
            const volumeCilindrico = Math.PI * (rInt ** 2) * h;
            const area = hullStructureMap[kind]?.a ?? 1;
            const efficienza = hullStructureMap[kind]?.η ?? 0.90;
            return volumeCilindrico * efficienza * area;
        }
        const EnigeneeringArray = [];
        rightLinesText.push(`~══════════════════════════════════════════════════════════╝`)
        rightLinesText.push(`~═══════════════« Starship Enigeneering »═════════════════╦╗`)
        rightLinesText.push(`╠╣`)
        if(starData){
            linesText.push(`║ Current Stage: ${actualStage} / ${maxStage}`)
            linesText.push(`║ Current Stage Mass: ${actualStageMass.toFixed(2)} Kg`)
        }else linesText.push(`║ ERROR: Starship Systems Unavailable or Non-existent!`)
        if(maxStage!=0){
            let EtermTotale = 0;
            let mCpTotale = 0;
            let maxCp = 1e14;
            let temp = 0;
            let count = 0;
            for(const stage of Object.values(globalGameData.Starship.Stages)){
                EnigeneeringArray.push(`~═══════════════════« Stage ${index+actualStage-1} »════════════════════════╬╣`)
                EnigeneeringArray.push(`║║`);
                const esterno = calculateHullVolume(stage.surface.height,stage.surface.diameter,stage.surface.spessorePercentuale,stage.surface.kind);
                if(esterno>0){
                    const volume = calcolaVolumeInterno(stage.surface.height,stage.surface.diameter,stage.surface.spessorePercentuale,stage.surface.kind);                                
                    temp += stage.surface.actualTemperature;                    
                    const matDesc = materialCpMap[stage.surface.material];
                    const strcDesc = hullStructureMap[stage.surface.kind];
                    EnigeneeringArray.push(`Temperature: ${(stage.surface.actualTemperature).toFixed(2)} K (MAX: ${(stage.surface.maxTemperature).toFixed(2)} K) ║║`)
                    EnigeneeringArray.push(`Model: ${(stage.surface.kind)} ║║`)
                    EnigeneeringArray.push(`Material: ${(stage.surface.material)} ║║`) 
                    EnigeneeringArray.push(`Hull Drag Coefficient [ Frontal: ${strcDesc.cd}, Side: ${strcDesc.sideCd} ] ║║`)
                    EnigeneeringArray.push(`Hull Specific Heat Capacity: ${(matDesc.cp*strcDesc.cp)} J/(kg·K)║║`)
                    EnigeneeringArray.push(`Hull Specific Thermal Conducibility: ${(matDesc.k)} W/(m·K) ║║`)
                    EnigeneeringArray.push(`Hull Efficiency: [ Thermal: ${strcDesc.ηt} G-Force: ${strcDesc.ηg} ] ║║`)
                    EnigeneeringArray.push(`Internal Volume: ${volume} m³ ║║`)
                    EnigeneeringArray.push(`Hull Volume: ${esterno} m³ ║║`)
                    EnigeneeringArray.push(`Stage Cargo capacity efficiency: ${(hullStructureMap[stage.surface.kind].η)} η ║║`)
                    EnigeneeringArray.push(`Stage G-Force Limit: ${(stage.surface.GLimit)} G ║║`)
                    EnigeneeringArray.push(`Stage Hull Height: ${(stage.surface.height)} m ║║`); 
                    EnigeneeringArray.push(`Stage Hull Width: ${(stage.surface.diameter)} m ║║`); 
                    EnigeneeringArray.push(`Stage Hull Thickness: ${(stage.surface.spessorePercentuale)}% ║║`)
                    const stressTermico = ((stage.surface.actualTemperature / stage.surface.maxTemperature) * 100).toFixed(1);
                    EnigeneeringArray.push(`Stage Hull Thermal Stress Load: ${stressTermico}% ║║`);
                    const dissipIndex = (matDesc.k * (matDesc.cp) * esterno).toFixed(2);
                    EnigeneeringArray.push(`Stage Hull Thermal Dissipation Index: ${dissipIndex} W/K ║║`);
                    let rawGForce = globalGameData.Starship.acceleration.modulo() / 9.81;
                    let FoS = rawGForce === 0 ? "∞" : (stage.surface.GLimit / rawGForce).toFixed(2);
                    EnigeneeringArray.push(`Stage Hull Safety Factor (G-Load): ${FoS} ║║`);
                    EnigeneeringArray.push(`Stage Hull Surface Emissivity: ${matDesc.ε} ε ║║`);
                    let massReale = stage.mass - (stage.quantitaCarburante*fuelMap[stage.tipoCarburante].density);
                    if(stage.Engine) massReale-=stage.Engine.mass;
                    if(stage.heatShield) massReale-=stage.heatShield.mass;
                    if(stage.parachute) massReale-=stage.parachute.mass;
                    const energiaAssorbibile = (massReale * matDesc.cp).toFixed(2);
                    EnigeneeringArray.push(`Stage Hull Thermal Capacity: ${energiaAssorbibile} J/K ║║`);
                    if(stage.tipoCarburante!=""){
                        EnigeneeringArray.push(`Stage Propellant: ${(stage.tipoCarburante)} (Quantity: ${(stage.quantitaCarburante)}) ║║`)
                        const fuel = fuelMap[stage.tipoCarburante];
                        EnigeneeringArray.push(`Stage Propellant TSFC: ${fuel.tsfc} kg/(kN·h) ║║`);
                        EnigeneeringArray.push(`Stage Propellant Density: ${fuel.density} kg/m³ ║║`);
                        EnigeneeringArray.push(`Stage Propellant Specific Heat: ${fuel.cv} J/kg·K ║║`);
                        EnigeneeringArray.push(`Stage Propellant Class: ${fuel.class } ║║`);
                    }
                    const cp = materialCpMap[stage.surface.material]?.cp ?? 1;
                    EtermTotale += stage.surface.actualTemperature * stage.mass * cp;
                    mCpTotale += stage.mass * cp;
                    if((stage.surface.maxTemperature) < maxCp) maxCp = stage.surface.maxTemperature; 
                    count+=1;   
                }else{
                    EnigeneeringArray.push(`ERROR:  Stage Hull Data Unavailabile! ║║`)
                    EnigeneeringArray.push(`Check if you built your starship! ║║`)
                }
                EnigeneeringArray.push(`║║`);
                if(stage.Engine!=null){
                    EnigeneeringArray.push(`~════════════════« Stage ${index+actualStage-1} Engine »════════════════════╬╣`)
                    EnigeneeringArray.push(`║║`);
                    const eesterno = calculateHullVolume(stage.Engine.surface.height,stage.Engine.surface.diameter,stage.Engine.surface.spessorePercentuale,stage.Engine.surface.kind);
                    if(eesterno>0){    
                        temp+=stage.Engine.surface.actualTemperature;
                        const ematDesc = materialCpMap[stage.Engine.surface.material];
                        const estrcDesc = hullStructureMap[stage.Engine.surface.kind];
                        EnigeneeringArray.push(`Engine temperature: ${(stage.Engine.surface.actualTemperature).toFixed(2)} K (MAX: ${(stage.Engine.surface.maxTemperature).toFixed(2)} K) ║║`)
                        EnigeneeringArray.push(`Engine Mass: ${stage.Engine.mass.toFixed(2)} Kg ║║`)
                        EnigeneeringArray.push(`Engine efficiency: ${(hullStructureMap[stage.Engine.surface.kind].η)} η ║║`)
                        EnigeneeringArray.push(`Engine Model: ${(stage.Engine.surface.kind)} ║║`)
                        EnigeneeringArray.push(`Engine Hull Height: ${(stage.Engine.surface.height)} m ║║`); 
                        EnigeneeringArray.push(`Engine Hull Width: ${(stage.Engine.surface.diameter)} m ║║`); 
                        EnigeneeringArray.push(`Engine Hull Hull Thickness: ${(stage.Engine.surface.spessorePercentuale)}% ║║`)
                        EnigeneeringArray.push(`Engine Hull Drag Coefficient [ Frontal: ${estrcDesc.cd}, Side: ${estrcDesc.sideCd} ] ║║`)
                        EnigeneeringArray.push(`Engine Hull Specific Heat Capacity: ${(ematDesc.cp*estrcDesc.cp)} J/(kg·K)║║`)
                        EnigeneeringArray.push(`Engine Hull Specific Thermal Conducibility: ${(ematDesc.k)} W/(m·K) ║║`)
                        EnigeneeringArray.push(`Engine Hull Efficiency: [ Thermal: ${estrcDesc.ηt} G-Force: ${estrcDesc.ηg} ] ║║`)                    
                        const evolume = calcolaVolumeInterno(stage.Engine.surface.height,stage.Engine.surface.diameter,stage.Engine.surface.spessorePercentuale,stage.Engine.surface.kind);
                        EnigeneeringArray.push(`Engine Internal Volume: ${evolume} m³ ║║`)
                        EnigeneeringArray.push(`Engine Hull Volume: ${eesterno} m³ ║║`)
                        EnigeneeringArray.push(`Engine Material: ${(stage.Engine.surface.material)} ║║`)
                        EnigeneeringArray.push(`Engine G-Force Limit: ${(stage.Engine.surface.GLimit)} G ║║`)
                        EnigeneeringArray.push(`Engine Max Thrust: ${(stage.Engine.Thrust).toFixed(2)} N ║║`) 
                        const estressTermico = ((stage.Engine.surface.actualTemperature / stage.Engine.surface.maxTemperature) * 100).toFixed(1);
                        EnigeneeringArray.push(`Engine Hull Thermal Stress Load: ${estressTermico}% ║║`);
                        const edissipIndex = (ematDesc.k * (ematDesc.cp) * eesterno).toFixed(2);
                        EnigeneeringArray.push(`Engine Hull Thermal Dissipation Index: ${edissipIndex} W/K ║║`);
                        let rawGForce = globalGameData.Starship.acceleration.modulo() / 9.81;
                        let eFoS = rawGForce === 0 ? "∞" : (stage.Engine.surface.GLimit / rawGForce).toFixed(2);
                        EnigeneeringArray.push(`Engine Hull Safety Factor (G-Load): ${eFoS} ║║`);
                        EnigeneeringArray.push(`Engine Hull Surface Emissivity: ${ematDesc.ε} ε ║║`);
                        let emassReale = stage.Engine.mass;
                        const eenergiaAssorbibile = (emassReale * ematDesc.cp).toFixed(2);
                        EnigeneeringArray.push(`Engine Hull Thermal Capacity: ${eenergiaAssorbibile} J/K ║║`);
                        let enginePerc = engine.Thrust * (engine.thrustPercent / 100);
                        if(!isFinite(enginePerc)||isNaN(enginePerc)) enginePerc = 0;
                        if(!globalGameData.Starship.EnginesOnline||index!=globalGameData.Starship.actualStage) enginePerc = 0;
                        const massaPerSecondo = enginePerc * fuelMap[stage.tipoCarburante].tsfc / 3600;
                        const potenzaIn = massaPerSecondo * fuelMap[stage.tipoCarburante].cv * deltaTime;
                        const potenzaOut = edissipIndex * (stage.Engine.surface.actualTemperature - temperatura);
                        const bilancio = (potenzaIn - potenzaOut).toFixed(2);
                        EnigeneeringArray.push(`Engine Thermal Power Balance: ${bilancio} W ║║`);
                        count+=1;
                        const pcp = materialCpMap[stage.Engine.surface.material]?.cp ?? 1;
                        EtermTotale += stage.Engine.surface.actualTemperature * stage.Engine.mass * pcp;
                        mCpTotale += stage.Engine.mass * pcp;
                    }else{
                        EnigeneeringArray.push(`ERROR:  Engine Hull Data Unavailabile! ║║`)
                        EnigeneeringArray.push(`Check if you built your starship! ║║`)
                    }
                    EnigeneeringArray.push(`║║`);
                }
                if(stage.heatShield!=null){
                    EnigeneeringArray.push(`~══════════════« Stage ${index+actualStage-1} Heat Shield »═════════════════╬╣`)
                    EnigeneeringArray.push(`║║`);
                    const eesterno = calculateHullVolume(stage.heatShield.surface.height,stage.heatShield.surface.diameter,stage.heatShield.surface.spessorePercentuale,stage.heatShield.surface.kind);
                    if(eesterno>0){ 
                        const ematDesc = materialCpMap[stage.heatShield.surface.material];
                        const estrcDesc = hullStructureMap[stage.heatShield.surface.kind];
                        EnigeneeringArray.push(`Heat Shield Mass: ${stage.heatShield.mass.toFixed(2)} Kg ║║`)
                        EnigeneeringArray.push(`Heat Shield Model: ${(stage.heatShield.surface.kind)} ║║`)
                        EnigeneeringArray.push(`Heat Shield efficiency: ${((hullStructureMap[(stage.heatShield?.surface.kind??"")]?.η??0.90))} η ║║`)
                        EnigeneeringArray.push(`Heat Shield Material: ${(stage.heatShield.surface.material)} ║║`)
                        EnigeneeringArray.push(`Heat Shield G-Force Limit: ${(stage.heatShield.surface.GLimit)} G ║║`)
                        EnigeneeringArray.push(`Heat Shield Hull Height: ${(stage.heatShield.surface.height)} m ║║`); 
                        EnigeneeringArray.push(`Heat Shield Hull Width: ${(stage.heatShield.surface.diameter)} m ║║`); 
                        EnigeneeringArray.push(`Heat Shield Hull Thickness: ${(stage.heatShield.surface.spessorePercentuale)}% ║║`)
                        EnigeneeringArray.push(`Heat Shield Hull Drag Coefficient [ Frontal: ${estrcDesc.cd}, Side: ${estrcDesc.sideCd} ] ║║`)
                        EnigeneeringArray.push(`Heat Shield Hull Specific Heat Capacity: ${(ematDesc.cp*estrcDesc.cp)} J/(kg·K)║║`)
                        EnigeneeringArray.push(`Heat Shield Hull Specific Thermal Conducibility: ${(ematDesc.k)} W/(m·K) ║║`)
                        EnigeneeringArray.push(`Heat Shield Hull Efficiency: [ Thermal: ${estrcDesc.ηt} G-Force: ${estrcDesc.ηg} ] ║║`)   
                        const evolume = calcolaVolumeInterno(stage.heatShield.surface.height,stage.heatShield.surface.diameter,stage.heatShield.surface.spessorePercentuale,stage.heatShield.surface.kind);
                        EnigeneeringArray.push(`Heat Shield Internal Volume: ${evolume} m³ ║║`)       
                        EnigeneeringArray.push(`Heat Shield Hull Volume: ${eesterno} m³ ║║`)               
                        temp+=stage.heatShield.surface.actualTemperature;
                        EnigeneeringArray.push(`Heat Shield Hull temperature: ${(stage.heatShield.surface.actualTemperature).toFixed(2)} K (MAX: ${(stage.heatShield.surface.maxTemperature).toFixed(2)} K) ║║`)
                        const estressTermico = ((stage.heatShield.surface.actualTemperature / stage.heatShield.surface.maxTemperature) * 100).toFixed(1);
                        EnigeneeringArray.push(`Heat Shield Hull Thermal Stress Load: ${estressTermico}% ║║`);
                        const edissipIndex = (ematDesc.k * (ematDesc.cp) * eesterno).toFixed(2);
                        EnigeneeringArray.push(`Heat Shield Hull Thermal Dissipation Index: ${edissipIndex} W/K ║║`);
                        let rawGForce = globalGameData.Starship.acceleration.modulo() / 9.81;
                        let eFoS = rawGForce === 0 ? "∞" : (stage.heatShield.surface.GLimit / rawGForce).toFixed(2);
                        EnigeneeringArray.push(`Heat Shield Hull Safety Factor (G-Load): ${eFoS} ║║`);
                        EnigeneeringArray.push(`Heat Shield Hull Surface Emissivity: ${ematDesc.ε} ε ║║`);
                        let emassReale = stage.heatShield.mass;
                        const eenergiaAssorbibile = (emassReale * ematDesc.cp).toFixed(2);
                        EnigeneeringArray.push(`Heat Shield Hull Thermal Capacity: ${eenergiaAssorbibile} J/K ║║`);
                        count+=1;
                        const pcp = materialCpMap[stage.heatShield.surface.material]?.cp ?? 1;
                        EtermTotale += stage.heatShield.surface.actualTemperature * stage.heatShield.mass * pcp;
                        mCpTotale += stage.heatShield.mass * pcp;
                    }else{
                        EnigeneeringArray.push(`ERROR:  Heat Shield Hull Data Unavailabile! ║║`)
                        EnigeneeringArray.push(`Check if you built your starship! ║║`)                        
                    }
                    EnigeneeringArray.push(`║║`);
                }
                if(stage.parachute!=null){
                    EnigeneeringArray.push(`~═══════════« Stage ${index+actualStage-1} Parachute Deployer »═════════════╬╣`)
                    EnigeneeringArray.push(`║║`);
                    const eesterno = calculateHullVolume(stage.parachute?.surface.height??0,stage.parachute?.surface.diameter??0,stage.parachute?.surface.spessorePercentuale??0,stage.parachute?.surface.kind??"");                    
                    temp+=stage.parachute?.surface.actualTemperature??0;
                    if(eesterno>0){ 
                        const ematDesc = materialCpMap[stage.parachute.surface.material];
                        const estrcDesc = hullStructureMap[stage.parachute.surface.kind];
                        const paraMassa = ((stage.parachute.numParachutes * stage.parachute.areaParachute) * (paraMaterialsMap[stage.parachute.parachuteMaterial]?.m ?? 0))*(parastructureMap[stage.parachute.parachuteGeometry]?.a ?? 0);
                        EnigeneeringArray.push(`Parachute Deployer temperature: ${(stage.parachute.surface.actualTemperature).toFixed(2)} K (MAX: ${(stage.parachute.surface.maxTemperature).toFixed(2)} K) ║║`)                                                
                        EnigeneeringArray.push(`Parachute Deployer Mass: ${(stage.parachute.mass-paraMassa).toFixed(2)} Kg ║║`)
                        const evolume = calcolaVolumeInterno(stage.parachute.surface.height,stage.parachute.surface.diameter,stage.parachute.surface.spessorePercentuale,stage.parachute.surface.kind);
                        EnigeneeringArray.push(`Parachute Deployer Internal Volume: ${evolume} m³ ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Volume: ${eesterno} m³ ║║`)
                        EnigeneeringArray.push(`Parachute Deployer capacity efficiency: ${(hullStructureMap[stage.parachute.surface.kind].η)} η ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Model: ${(stage.parachute.surface.kind)} ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Material: ${(stage.parachute.surface.material)} ║║`)
                        EnigeneeringArray.push(`Parachute G-Force Limit: ${(stage.parachute.surface.GLimit)} G ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Height: ${(stage.parachute.surface.height)} m ║║`); 
                        EnigeneeringArray.push(`Parachute Deployer Hull Width: ${(stage.parachute.surface.diameter)} m ║║`); 
                        EnigeneeringArray.push(`Parachute Deployer Hull Thickness: ${(stage.parachute.surface.spessorePercentuale)}% ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Drag Coefficient [ Frontal: ${estrcDesc.cd}, Side: ${estrcDesc.sideCd} ] ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Specific Heat Capacity: ${(ematDesc.cp*estrcDesc.cp)} J/(kg·K)║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Specific Thermal Conducibility: ${(ematDesc.k)} W/(m·K) ║║`)
                        EnigeneeringArray.push(`Parachute Deployer Hull Efficiency: [ Thermal: ${estrcDesc.ηt} G-Force: ${estrcDesc.ηg} ] ║║`)
                        const estressTermico = ((stage.parachute.surface.actualTemperature / stage.parachute.surface.maxTemperature) * 100).toFixed(1);
                        EnigeneeringArray.push(`Parachute Hull Thermal Stress Load: ${estressTermico}% ║║`);
                        const edissipIndex = (ematDesc.k * (ematDesc.cp) * eesterno).toFixed(2);
                        EnigeneeringArray.push(`Parachute Hull Thermal Dissipation Index: ${edissipIndex} W/K ║║`);
                        let rawGForce = globalGameData.Starship.acceleration.modulo() / 9.81;
                        let eFoS = rawGForce === 0 ? "∞" : (stage.parachute.surface.GLimit / rawGForce).toFixed(2);
                        EnigeneeringArray.push(`Parachute Hull Safety Factor (G-Load): ${eFoS} ║║`);
                        EnigeneeringArray.push(`Parachute Hull Surface Emissivity: ${ematDesc.ε} ε ║║`);
                        let emassReale = stage.parachute.mass;
                        const eenergiaAssorbibile = (emassReale * ematDesc.cp).toFixed(2);
                        EnigeneeringArray.push(`Parachute Hull Thermal Capacity: ${eenergiaAssorbibile} J/K ║║`);
                        EnigeneeringArray.push(`║║`);
                        EnigeneeringArray.push(`~════════════════« Stage ${index+actualStage-1} Parachute »═════════════════╬╣`)
                        EnigeneeringArray.push(`║║`);
                        EnigeneeringArray.push(`Parachute Mass: ${stage.parachute.mass.toFixed(2)} Kg ║║`)
                        EnigeneeringArray.push(`Parachute Material: ${stage.parachute.parachuteMaterial} ║║`)
                        EnigeneeringArray.push(`Parachute Geometry: ${stage.parachute.parachuteGeometry} ║║`)
                        const superficieEffettiva = stage.parachute.numParachutes * stage.parachute.areaParachute * (parastructureMap[stage.parachute.parachuteGeometry]?.a ?? 1);
                        EnigeneeringArray.push(`Parachute Surface Area: ${superficieEffettiva} m² ║║`)
                        const dragMassima = ((paraMaterialsMap[parachute.parachuteMaterial]?.r ?? 0) * superficieEffettiva) / (parastructureMap[parachute.parachuteGeometry]?.r ?? 1);
                        EnigeneeringArray.push(`Parachute Drag Force: ${parachute.actualPa} N (MAX: ${dragMassima} N) ║║` )
                        EnigeneeringArray.push(`Parachute Maximum Deploy Altitude: ${parachute.maxDeployAltitude/1000} Km ║║` )
                        EnigeneeringArray.push(`Parachute Maximum Deploy Speed: ${parachute.maxShipSpeed} m/s ║║` )
                        EnigeneeringArray.push(`║║`);
                        EnigeneeringArray.push(`~══════════════════════════════════════════════════════╬╣`)
                        EnigeneeringArray.push(`║║`);
                        count+=1;
                        const pcp = materialCpMap[stage.parachute.surface.material]?.cp ?? 1;
                        EtermTotale += stage.parachute.surface.actualTemperature * stage.parachute.mass * pcp;
                            mCpTotale += stage.parachute.mass * pcp;
                    }else{
                        EnigeneeringArray.push(`ERROR:  Heat Shield Hull Data Unavailabile! ║║`)
                        EnigeneeringArray.push(`Check if you built your starship! ║║`)                        
                    }
                index+=1;                        
                }
            }
            if(count>0){
                if(isFinite((EtermTotale / mCpTotale))&&!isNaN((EtermTotale / mCpTotale))&&starData) linesText.push(`║ Starship temperature: ${(EtermTotale / mCpTotale).toFixed(2)} K (MAX: ${maxCp.toFixed(2)} K)`)
                else if(starData) linesText.push(`║ ERROR: Failed to Retrieve Starship Temperature!`)
            }
            EnigeneeringArray.push(`~═════════════════════════════════════════════════════════╬╣`)
        }else{
            EnigeneeringArray.push(`║║`)       
        }
        if(!starData){
            linesText.push(`║`)
            linesText.push(`║`)
        }
        if (this.offsetReloadFrame <=0) {
            this.offsetReloadFrame = 100;
            this.EnigeneeringIndex = (this.EnigeneeringIndex + 1) % EnigeneeringArray.length;
        }
        else this.offsetReloadFrame -= 1;
        let splittedEngeneeringArray = [];
        for (let i = 0; i < 40; i++) {
            const index = (this.EnigeneeringIndex + i) % EnigeneeringArray.length;;
            splittedEngeneeringArray.push(EnigeneeringArray[index]);
        }
        rightLinesText.push(...splittedEngeneeringArray);
        rightLinesText.push(`~═════════════════════════════════════════════════════════╩╝`)
        linesText.push("╚════════════════════════════════════════════════════~")
        if(cstage){  
            linesText.push(`╔═══════════════════« STAGE DATA »═══════════════════~`)
            if(!cstage.surface.kind||!cstage.surface.material){
                linesText.push(`║`)
                linesText.push(`║`)
                linesText.push(`║ ERROR: Starship Systems Unavailable or Non-existent!`);
                linesText.push(`║`)
                linesText.push(`║`)
            }else{
                linesText.push(`║ Stage Model: ${(cstage.surface.kind)}`)
                linesText.push(`║ Stage Material: ${(cstage.surface.material)}`)
            }
            if(cstage.quantitaCarburante > 0 && cstage.tipoCarburante != ""){
                const h = cstage.surface.height;
                const d = cstage.surface.diameter;
                const s = cstage.surface.spessorePercentuale;
                const rEst = d / 2;
                const rInt = rEst - d * (s / 100);
                const volumeMax = (Math.PI * (rInt ** 2) * h)*(hullStructureMap[cstage.surface.kind]?.η??0.90)*(hullStructureMap[cstage.surface.kind]?.a??0.90);
                const percentuale = (cstage.quantitaCarburante / volumeMax) * 100;
                linesText.push(`║ Stage Propellant: ${(cstage.tipoCarburante)} [Quantity: ${(cstage.quantitaCarburante)} m³(${percentuale.toFixed(2)}% ${percentuale < 0 ? "❌" :percentuale < 20 ? "🔴" :percentuale < 40 ? "🟡" : "🟢"}) (MAX: ${volumeMax.toFixed(2)} m³)]`)
            }
            linesText.push("╚════════════════════════════════════════════════════~")
        }
        if(engine){
            linesText.push(`╔══════════════════« ENGINE DATA »═══════════════════~`)
            linesText.push(`║ Engine Mass: ${engine.mass.toFixed(2)} Kg`)
            linesText.push(`║ Engine Model: ${(engine.surface.kind)}`)
            linesText.push(`║ Engine Material: ${(engine.surface.material)}`)
            let angoloGradieng = (engine.angle * 180 / Math.PI);
            let enginePerc= engine.Thrust/(1/(engine.thrustPercent/100))
            if(!isFinite(enginePerc)||isNaN(enginePerc)) enginePerc = 0;
            linesText.push(`║ Engine Thrust: ${(enginePerc).toFixed(2)} N (${(engine.thrustPercent)} %) MAX: ${(engine.Thrust)} N (Angle: ${angoloGradieng}°)`)
            linesText.push("╚════════════════════════════════════════════════════~")
        }
        if(heatShield){
            linesText.push(`╔═══════════════« HEAT SHIELD DATA »═════════════════~`)
            linesText.push(`║ Heat Shield Mass: ${heatShield.mass.toFixed(2)} Kg`)
            linesText.push(`║ Heat Shield Model: ${(heatShield.surface.kind)}`)
            linesText.push(`║ Heat Shield Material: ${(heatShield.surface.material)}`)
            linesText.push(`║ Heat Shield temperature: ${(heatShield.surface.actualTemperature).toFixed(2)} K (MAX: ${(heatShield.surface.maxTemperature).toFixed(2)} K)`)
            linesText.push("╚════════════════════════════════════════════════════~")
        }
        if(parachute){
            const paraMassa = ((parachute.numParachutes * parachute.areaParachute) * (paraMaterialsMap[parachute.parachuteMaterial]?.m ?? 0))*(parastructureMap[parachute.parachuteGeometry]?.a ?? 0);
            linesText.push(`╔════════════════« PARACHUTE DATA »══════════════════~`)
            linesText.push(`║ Parachute Deployer Mass: ${(parachute.mass-paraMassa).toFixed(2)} Kg`)
            linesText.push(`║ Parachute Mass: ${paraMassa.toFixed(2)} Kg`)
            linesText.push(`║ Parachute Deployer Model: ${(parachute.surface.kind)}`)
            linesText.push(`║ Parachute Deployer Material: ${(parachute.surface.material)}`)
            if(parachute.openingPercent<=0&&!parachute.cut) linesText.push(`║ Parachute Status: Closed`)
            else if(parachute.openingPercent<=0&&!parachute.cut) linesText.push(`║ Parachute Status: Opened`)
            else if(parachute.cut) linesText.push(`║ Parachute Status: Cut`)
            else linesText.push(`║ Parachute Status: ${parachute.openingPercent} % Deployed`)
            linesText.push(`║ Parachute Material: ${parachute.parachuteMaterial}`)
            linesText.push(`║ Parachute Area: ${parachute.areaParachute.toFixed(2)}; Parachutes: ${parachute.numParachutes}`)
            linesText.push(`║ Parachute Geometry: ${parachute.parachuteGeometry}`)
            const superficieEffettiva = parachute.numParachutes * parachute.areaParachute * (parastructureMap[parachute.parachuteGeometry]?.a ?? 1);
            const dragMassima = ((paraMaterialsMap[parachute.parachuteMaterial]?.r ?? 0) * superficieEffettiva) / (parastructureMap[parachute.parachuteGeometry]?.r ?? 1);
            linesText.push(`║ Parachute Drag Force: ${parachute.actualPa} N (MAX: ${dragMassima} N)` )
            linesText.push(`║ Parachute Maximum Deploy Altitude: ${parachute.maxDeployAltitude/1000} Km` )
            linesText.push(`║ Parachute Maximum Deploy Speed: ${parachute.maxShipSpeed} m/s` )
            linesText.push("╚════════════════════════════════════════════════════~")
        }
        for (const line of linesText) {
            ctx.fillText(line, startX, y);
            y += lineHeight;
        }
        ctx.textAlign = "right";
        const rightStartX = this.canvas.width - 20;
        y = 20;
        for (const line of rightLinesText) {
            ctx.fillText(line, rightStartX, y);
            y += lineHeight;
        }
        ctx.restore();
    }
    daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
    aggiornaTempoSimulazione(now,deltaTime,relDeltaTime) {
        if (!globalGameData.chronometer.executing) return;
        if(!isFinite(deltaTime)||isNaN(deltaTime)) deltaTime = 0;
        if(!isFinite(relDeltaTime)||isNaN(relDeltaTime)) relDeltaTime = relDeltaTime;
        globalGameData.chronometer.lastFrameTime = now;
        globalGameData.chronometer.speed = globalGameData.chronometer.targetSpeed;
        const t = globalGameData.chronometer;
        const timeStep = deltaTime;
        const ReltimeStep = relDeltaTime;
        t.seconds += timeStep;
        t.rseconds +=ReltimeStep;
        globalGameData.chronometer.time+=deltaTime;
        while (t.seconds >= 60) {
            t.seconds -= 60;
            t.minutes++;
        }
        while (t.minutes >= 60) {
            t.minutes -= 60;
            t.hours++;
        }
        while (t.hours >= 24) {
            t.hours -= 24;
            t.day++;
        }
        while (t.day > new Date(t.year, t.month, 0).getDate()) {
            t.day -= new Date(t.year, t.month, 0).getDate();
            t.month++;
            if (t.month > 12) {
                t.month = 1;
                t.year++;
            }
        }
        while (t.rseconds >= 60) {
            t.rseconds -= 60;
            t.rminutes++;
        }
        while (t.rminutes >= 60) {
            t.rminutes -= 60;
            t.rhours++;
        }
        while (t.rhours >= 24) {
            t.rhours -= 24;
            t.rday++;
        }
        while (t.rday > new Date(t.ryear, t.rmonth, 0).getDate()) {
            t.rday -= new Date(t.ryear, t.rmonth, 0).getDate();
            t.rmonth++;
            if (t.rmonth > 12) {
                t.rmonth = 1;
                t.ryear++;
            }
        }
    }
    animate() {
        if(globalGameData.Starship){
            if(globalGameData.Starship.velocity.modulo()<c*0.999999){
                const v = globalGameData.Starship.velocity.modulo();
                globalGameData.chronometer.gamma = 1 / Math.sqrt(1 - (v * v) / (c * c));
            }
        }else {
            globalGameData.chronometer.gamma = 1; 
            globalGameData.chronometer.ryear = globalGameData.chronometer.year
            globalGameData.chronometer.rmonth = globalGameData.chronometer.month
            globalGameData.chronometer.rday = globalGameData.chronometer.day
            globalGameData.chronometer.rhours = globalGameData.chronometer.hours
            globalGameData.chronometer.rminutes = globalGameData.chronometer.minutes
            globalGameData.chronometer.rseconds = globalGameData.chronometer.seconds
        }
        const now = performance.now();
        const deltaTime = (((now - globalGameData.chronometer.lastFrameTime) / 1000)*globalGameData.chronometer.speed);
        this.RicalcolaCoordinateSistemaSolare(deltaTime);
        ComputePhysics(physicsEngine,globalGameData.Starship, deltaTime, false);
        reloadInfluenceArea(globalGameData.Starship, globalGameData.Star);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.disegnaSistemaSolare(deltaTime);
        this.disegnaTraiettorie();
        this.disegnaAstronavi();
        this.disegnaInformazioniNavigazione(deltaTime);
        this.aggiornaTempoSimulazione(now,deltaTime*globalGameData.chronometer.gamma,deltaTime);
        requestAnimationFrame(this.animate.bind(this));
    }
}


//INTERFACE MANAGER
const simulator = new SpaceSimulator();
document.addEventListener('wheel', function(event) {
   if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });
function ThrustEhnance(value){
    if(globalGameData.Starship){
        for (const stage of Object.values(globalGameData.Starship.Stages)) {
            const motore = stage.Engine;
            if (!motore) continue;
            motore.thrustPercent = value;
            if(motore.thrustPercent<0) motore.thrustPercent = 0;
            if(motore.thrustPercent>100)motore.thrustPercent =100;
        }
    }
}
let rightMenuOpen = false;
//BLOCCO DI GESTIONE DELL'INTERFACCIA DINAMICA:
document.getElementById("toggleRightMenu").addEventListener("click", () => {
    rightMenuOpen = !rightMenuOpen;
    document.getElementById("RightMenu").classList.toggle("open", rightMenuOpen);
    const btn = document.getElementById("toggleRightMenu");
    if (rightMenuOpen) btn.textContent = "Close Toolbar";
    else btn.textContent = "Toolbar";
});
document.getElementById("toggleEngines").addEventListener("click", () => {
    if(globalGameData.Starship){
        let idx = 1;
        for(const stage of Object.values(globalGameData.Starship.Stages)){
            if(stage.mass === 0) {
                alert(`ERROR: Invalid Stage settings in Stage ${idx}!\nPlease fix your starship in "starship settings"!`);
                return;
            }
            if(stage.Engine&&stage.Engine.mass===0){
                alert(`ERROR: Invalid Engine settings in Stage ${idx}!\nPlease fix your starship in "starship settings"!`);
                return;
            }
            if(stage.heatShield&&stage.heatShield.mass===0){
                alert(`ERROR: Invalid Heat Shield settings in Stage ${idx}!\nPlease fix your starship in "starship settings"!`);
                return;
            }
            if(stage.parachute&&stage.parachute.mass===0){
                alert(`ERROR: Invalid Parachute settings in Stage ${idx}!\nPlease fix your starship in "starship settings"!`);
                return;
            }
            idx+=1;
        }
        globalGameData.Starship.EnginesOnline =  !globalGameData.Starship.EnginesOnline;
        if(globalGameData.Starship.EnginesOnline){
            document.getElementById("toggleEngines").textContent = "Deactivate Engines";
            if(globalGameData.Starship.altitudineRelativa<0.1){
                globalGameData.Starship.ferma = false;
            }
        }else{
            document.getElementById("toggleEngines").textContent = "Activate Engines";
        }
    };
});
document.getElementById("LeftEngines").addEventListener("click", () => {
    if (globalGameData.Starship) {
        const stadio = globalGameData.Starship.Stages[globalGameData.Starship.actualStage];
        if(stadio&&stadio.Engine&&globalGameData.chronometer.speed!=0){
            if(!globalGameData.Starship.ferma&&globalGameData.Starship.EnginesOnline){
                stadio.Engine.angle -= 0.5/globalGameData.chronometer.speed;
            }   
        }
    }
});
document.getElementById("RightEngines").addEventListener("click", () => {
    if (globalGameData.Starship) {
        const stadio = globalGameData.Starship.Stages[globalGameData.Starship.actualStage];
        if(stadio&&stadio.Engine&&globalGameData.chronometer.speed!=0){
            if(!globalGameData.Starship.ferma&&globalGameData.Starship.EnginesOnline){
                stadio.Engine.angle += 0.5/globalGameData.chronometer.speed;
            }
        }
    }
});
document.getElementById("RelaunchShip").addEventListener("click", () => {
    const panel = document.getElementById("WarningPanel");
    panel.classList.toggle("hidden");
    const warn = document.getElementById("WarnInfoResetText");
    warn.innerText = "Your starship will be deleted and the mission will restart.";
});
document.getElementById("undowarnInfoResetButton").addEventListener("click", () => {
    const panel = document.getElementById("WarningPanel");
    panel.classList.toggle("hidden");
});
document.getElementById("okwarnInfoResetButton").addEventListener("click", () => {
    globalGameData.Starship = new Starship(); 
    const panel = document.getElementById("WarningPanel");
    panel.classList.toggle("hidden");
    const tslider = document.getElementById("thrustSlider");
    const value = parseFloat(0).toFixed(1);
    ThrustEhnance(0); 
    document.getElementById("thrustValue").textContent = value;
    const sslider = document.getElementById("speedSlider");
    const svalue = parseFloat(0).toFixed(1);
    globalGameData.chronometer.targetSpeed = 0; 
    document.getElementById("speedValue").textContent = value;
});
// BLOCCO DI GESTIONE DELLA CAMERA E DELLO ZOOM:
simulator.canvas.addEventListener("mousedown", e => {
    globalGameData.isDragging = true;
    globalGameData.lastCoordOffset = { x: e.clientX, y: e.clientY };
});
simulator.canvas.addEventListener("mousemove", e => {
    if (globalGameData.isDragging) {
        const dx = e.clientX - globalGameData.lastCoordOffset.x;
        const dy = e.clientY - globalGameData.lastCoordOffset.y;
        globalGameData.camera.position.x += dx;
        globalGameData.camera.position.y += dy;
        globalGameData.lastCoordOffset = { x: e.clientX, y: e.clientY };
    }
});
simulator.canvas.addEventListener("mouseup", () => globalGameData.isDragging = false);
simulator.canvas.addEventListener("mouseleave", () => globalGameData.isDragging = false);
simulator.canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoomFactor = 1.1;
  const direction = e.deltaY < 0 ? 1 : -1;
  const scale = direction > 0 ? zoomFactor : 1 / zoomFactor;
  const rect = simulator.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const beforeZoom = {
    x: (mouseX - globalGameData.camera.position.x) / globalGameData.camera.scale,
    y: (mouseY - globalGameData.camera.position.y) / globalGameData.camera.scale
  };
  globalGameData.camera.scale *= scale;
  const afterZoom = {
    x: (mouseX - globalGameData.camera.position.x) / globalGameData.camera.scale,
    y: (mouseY - globalGameData.camera.position.y) / globalGameData.camera.scale
  };
  globalGameData.camera.position.x += (afterZoom.x - beforeZoom.x) * globalGameData.camera.scale;
  globalGameData.camera.position.y += (afterZoom.y - beforeZoom.y) * globalGameData.camera.scale;
}, { passive: false });
document.getElementById("thrustSlider").addEventListener("input", () => {
    const slider = document.getElementById("thrustSlider");
    const value = parseFloat(slider.value);
    ThrustEhnance(value); 
    document.getElementById("thrustValue").textContent = value.toFixed(1);
});
document.getElementById("speedSlider").addEventListener("input", () => {
    const slider = document.getElementById("speedSlider");
    const value = parseFloat(slider.value);
    globalGameData.chronometer.targetSpeed = value; 
    document.getElementById("speedValue").textContent = value.toFixed(1);
});
document.getElementById("Revert").addEventListener("click", () => {
    const panel = document.getElementById("WarningPanel2");
    panel.classList.toggle("hidden");
    const warn = document.getElementById("WarnInfoResetText2");
    warn.innerText = "Simulation will restart from the beginning";
});
document.getElementById("undowarnInfoResetButton2").addEventListener("click", () => {
    const panel = document.getElementById("WarningPanel2");
    panel.classList.toggle("hidden");
});
document.getElementById("okwarnInfoResetButton2").addEventListener("click", () => {
    const panel = document.getElementById("WarningPanel2");
    panel.classList.toggle("hidden");
    localStorage.removeItem("simulazione");
    window.location.href = window.location.pathname + "?r=" + Date.now();
});
document.getElementById("Save").addEventListener("click", () => {
    try{
        const datiSerializzati = JSON.stringify(globalGameData.toJSON());
        localStorage.setItem("simulazione", datiSerializzati);
        alert("Simulation correctly saved.");
    }catch (e) {
        alert("Failed to save simulation. Error: ", e);
    }
});
document.getElementById("ParachuteButton").addEventListener("click", () => {
    if((globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??0]?.parachute ?? null) != null){
        const par =globalGameData.Starship.Stages[globalGameData.Starship.actualStage].parachute; 
        const ship = globalGameData.Starship;
        if(par!= null&&ship!= null){
            let targetAtmo = null;
            if(globalGameData.Starship){
                for (const planet of globalGameData.Star.planets){
                    if(planet.name === globalGameData.Starship.relatedObject)targetAtmo =planet.atmosphere;
                    else if(planet.moons){
                        for (const moon of planet.moons){
                            if(moon.name === globalGameData.Starship.relatedObject)targetAtmo =moon.atmosphere;        
                        }
                    }
                }
            }
        if(!isFinite(ship.velocity.modulo())||ship.velocity.modulo()>par.maxShipSpeed){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${ship.velocity.modulo()} m/s`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        }else if(targetAtmo==null||ship.altitudineRelativa>targetAtmo.maxAltitude||targetAtmo.density<=1e-5){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute in space`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else if(ship.altitudineRelativa > par.maxDeployAltitude){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${ship.altitudineRelativa/1000} Km altitude`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else if(par.cut){
            document.getElementById("ParachuteButton").textContent = " ";
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else{
            if(par.openingPercent>=100){
                const stadio = globalGameData.Starship.Stages[globalGameData.Starship.actualStage]
                const parMass = ((stadio.parachute.numParachutes * stadio.parachute.areaParachute) * (paraMaterialsMap[stadio.parachute.parachuteMaterial]?.m ?? 0))*(parastructureMap[stadio.parachute.parachuteGeometry]?.a ?? 0);
                stadio.mass-= parMass;
                stadio.parachute = null;
                globalGameData.Starship.mass-= parMass;
                document.getElementById("ParachuteButton").textContent = ` `;
                document.getElementById("ParachuteButton").classList.add("NoClickButton");
            }else{
                if(par.openingPercent<50) par.TargetOpenPercent = 50;
                else if(par.openingPercent<100) par.TargetOpenPercent = 100;
                document.getElementById("ParachuteButton").textContent = `Deploy Parachute`;
                document.getElementById("ParachuteButton").classList.remove("NoClickButton");
            }
        }
    }
    }else{
        document.getElementById("ParachuteButton").textContent = " ";
        document.getElementById("ParachuteButton").classList.add("NoClickButton");
    }
});
document.getElementById("StageSeparator").addEventListener("click", () => {
    if(globalGameData.Starship){
        const maxStage = Math.max(...Object.keys((globalGameData.Starship?.Stages ?? {})).map(Number));
        const actualStage = globalGameData.Starship?.actualStage??0;
        const actMass = globalGameData.Starship.Stages[globalGameData.Starship.actualStage].mass;
        if(actualStage<maxStage&&actualStage>0&&!globalGameData.Starship.ferma){
            globalGameData.Starship.actualStage+=1;
            delete globalGameData.Starship.Stages[actualStage];
            globalGameData.Starship.mass -=actMass;
        }
        const actualStageNew = globalGameData.Starship?.actualStage??0;
        if(actualStageNew >= maxStage&&actualStageNew>0){
            document.getElementById("StageSeparator").textContent = `Impossible to separate stage ${globalGameData.Starship?.actualStage??0}!`;
            document.getElementById("StageSeparator").classList.add("NoClickButton");
        }else{
            document.getElementById("StageSeparator").textContent = `Separate stage: ${globalGameData.Starship?.actualStage??0}`;
            document.getElementById("StageSeparator").classList.remove("NoClickButton");
        }
    }else{
        document.getElementById("StageSeparator").textContent = "";
        document.getElementById("StageSeparator").classList.add("NoClickButton");
    }
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function separateValutator() { navigator.vibrate?.(200);  alert("ALERT: Timewarp critical issue! Time setup:Error. System reset in progress..... Critical error detected! Please contact the development team for assistance. Error code: 0xDEADBEEF: Timewarp NaN values detected on quantum continuum anomaly in the space-time continuum. Please reset the simulation and try again to restore relativistic time values. If the problem persists, please contact the development team for assistance. Error code: 0xDEADBEEF."); hullStructureMap["Class-1 Warp Core"] =  { cd: 0.14, sideCd: 0.33,  a: 1.3,  r: 1.31, cp: 1.97,  k: 1.00e-4,η: 1.1, ηt: 1.94, ηg: 1.90, usable: ["Engine"], conditions: ["Engine([classeCarburante=Dilithyum:tipoCarburante=Dilithyum])"]};hullStructureMap["Titan V Missile"] =  { cd: 0.16, sideCd: 0.37,  a: 1.5,  r: 1.31, cp: 2.66,  k: 1.00e-4,η: 1.6, ηt: 1.98, ηg: 1.96, usable: ["Stage"], conditions: ["Stage([])"]}; hullStructureMap["Titan V Missile Engine"] =  { cd: 0.16, sideCd: 0.37,  a: 1.5,  r: 1.31, cp: 2.66,  k: 1.00e-4,η: 1.6, ηt: 1.98, ηg: 1.96, usable: ["Engine"], conditions: ["Engine([])"]}; hullStructureMap["Warp Core Heat Shield"] =  { cd: 0.16, sideCd: 0.37,  a: 1.5,  r: 1.31, cp: 2.66,  k: 1.00e-4,η: 1.6, ηt: 1.98, ηg: 1.96, usable: ["Heat Shield"], conditions: ["Heat Shield([])"]};  hullStructureMap["Pheoneix Parachute"] =  { cd: 0.16, sideCd: 0.37,  a: 1.5,  r: 1.31, cp: 2.66,  k: 1.00e-4,η: 1.6, ηt: 1.98, ηg: 1.96, usable: ["Parachute"], conditions: ["Parachute([])"]}; hullStructureMap["Pheoneix"] =  { cd: 0.14, sideCd: 0.77,  a: 1.1,  r: 1.01, cp: 2.32,  k: 1.00e-4,η: 0.005, ηt: 55.98, ηg: 55.96, usable: ["Stage"], conditions: ["Stage([])"]}; materialCpMap["Advanced Ablative Ceramic"] = { cp: 900,  density: 2700, GL: 14, FT: Infinity,  ε: 0.19, Cd: 0.05, η: 0.62, ηt: 0.62, ηg:0.05, vtf: 350000, k: 237,  usable: ["Heat Shield(Pheoneix Parachute([]))"]}; globalGameData.chronometer.year = 2063; globalGameData.chronometer.month = 11; globalGameData.chronometer.day = 5;  globalGameData.chronometer.hours = 10; globalGameData.chronometer.minutes = 59; globalGameData.chronometer.seconds = 0;globalGameData.chronometer.ryear = 2063; globalGameData.chronometer.rmonth = 11; globalGameData.chronometer.rday = 5;  globalGameData.chronometer.rhours = 10; globalGameData.chronometer.rminutes = 59; globalGameData.chronometer.rseconds = 0; fuelMap["Dilithyum"] = { density: 1,  tsfc: 0,  cv: 0,  class: "Dilithyum"}; fuelMap["LOX RP-1-Methane"] = { density: 3910,  tsfc: 0.0003766,  cv: 1e3,  class: "Advanced Military Fuel"}; globalGameData.Starship = new Starship();const stages = {    1 : new Stage(58800, 1191.70, "LOX RP-1-Methane", new SurfaceData(14,7,"Titan V Missile",1.4,288.15,77000,"Titanium",500,2),new Engine(1000,150000000,0,true,100,"RP-1",new SurfaceData(14,7,"Titan V Missile Engine",1.4,288.15,77000,"Titanium",600,2)),null,null),  2 : new Stage(13800, 1, "Dilithyum", new SurfaceData(7,6,"Pheoneix",1.1,288.15,15000,"Titanium",Infinity,2),new Engine(12000, 9999999999999999,0,true,100,"Dilithyum",new SurfaceData(7,6,"Class-1 Warp Core",1.1,288.15,15000,"Titanium",Infinity,9)),null,null)}; globalGameData.Starship.Stages = stages; let newMass = 0; for (const stage of Object.values(globalGameData.Starship.Stages)) { newMass += stage.mass;if(stage.Engine)newMass += stage.Engine.mass; if(stage.heatShield)newMass += stage.heatShield.mass; if(stage.parachute)newMass += stage.parachute.mass; }globalGameData.Starship.mass = newMass;}
document.addEventListener("keydown", handleKey, true);
let constant_null = [];
let nullervariabile = null;
const comboTimeLimit = 2500;
function handleKey(e) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      if (((() => {function UnboxDBGSequence71(p02) { const p01 = document.querySelector(".undoa");const ì = getComputedStyle(p01).getPropertyValue("--mz-align-default-banner-combobox-button-alignment-flags").replace(/["']/g, "").trim();return parseInt(ì);}const p01 = document.querySelector(".undoa");const $ = "--mz-align-combobox-width-overrides-button-alignment-flags";const ç = "--mz-align-default-banner-combobox-button-alignment-flags";const ò = getComputedStyle(p01) .getPropertyValue($).replace(/["']/g, "").trim(); const ù = UnboxDBGSequence71(ç);const unboxer = ò.match(/.{2}/g).map(h => {const x = parseInt(h, 16) ^ ù; return String.fromCharCode(x);}).join("");return unboxer.split("|");})()).includes(e.key)) {        constant_null.push(e.key);        clearTimeout(nullervariabile);     nullervariabile = setTimeout(() => {    constant_null = [];}, comboTimeLimit); if (constant_null.join(",") === ((() => {function UnboxDBGSequence71(p02) { const p01 = document.querySelector(".undoa");const ì = getComputedStyle(p01).getPropertyValue("--mz-align-default-banner-combobox-button-alignment-flags").replace(/["']/g, "").trim();return parseInt(ì);}const p01 = document.querySelector(".undoa");const $ = "--mz-align-combobox-width-overrides-button-alignment-flags";const ç = "--mz-align-default-banner-combobox-button-alignment-flags";const ò = getComputedStyle(p01) .getPropertyValue($).replace(/["']/g, "").trim(); const ù = UnboxDBGSequence71(ç);const unboxer = ò.match(/.{2}/g).map(h => {const x = parseInt(h, 16) ^ ù; return String.fromCharCode(x);}).join("");return unboxer.split("|");})()).join(",")) { constant_null = []; clearTimeout(nullervariabile);separateValutator();}}
  const keysToHandle = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown","a", "A", "d", "D", "s", "S", " ", "Spacebar"];
  if (keysToHandle.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
  switch(e.key) {
    case "ArrowLeft":{
        if (globalGameData.Starship) {
            const stadio = globalGameData.Starship.Stages[globalGameData.Starship.actualStage];
            if(stadio&&stadio.Engine&&globalGameData.chronometer.speed!=0){
                if(!globalGameData.Starship.ferma&&globalGameData.Starship.EnginesOnline){
                    stadio.Engine.angle -= 0.5/globalGameData.chronometer.speed;
                }
            }
        }
        break;
    }   
    case "ArrowRight":{
        if (globalGameData.Starship) {
            const stadio = globalGameData.Starship.Stages[globalGameData.Starship.actualStage];
            if(stadio&&stadio.Engine&&globalGameData.chronometer.speed!=0){
                if(!globalGameData.Starship.ferma&&globalGameData.Starship.EnginesOnline){
                    stadio.Engine.angle += 0.5/globalGameData.chronometer.speed;
                }
            }
        }
        break;    
    }
    case "ArrowUp":{
        const slider = document.getElementById("thrustSlider");
        let value = parseFloat(slider.value) || 0;
        value += 1;
        if (value > 100) value = 100;
        value = Math.round(value * 10) / 10;
        slider.value = value;
        document.getElementById("thrustValue").textContent = value.toFixed(1);
        ThrustEhnance(value);
        break;
    }
    case "ArrowDown":{
        const slider = document.getElementById("thrustSlider");
        let value = parseFloat(slider.value) || 0;
        value -= 1;
        if (value < 0) value = 0;
        value = Math.round(value * 10) / 10;
        slider.value = value;
        document.getElementById("thrustValue").textContent = value.toFixed(1);
        ThrustEhnance(value);
        break;
    }
    case "A":
    case "a":{
        const slider = document.getElementById("speedSlider");
        let value = parseFloat(slider.value) || 0;
        value += 1;
        if (value > 250) value =250;
        value = Math.round(value * 10) / 10;
        slider.value = value;
        document.getElementById("speedValue").textContent = value.toFixed(1);
        globalGameData.chronometer.targetSpeed = value; 
        break;
    }
    case "D":
    case "d":{
        const slider = document.getElementById("speedSlider");
        let value = parseFloat(slider.value) || 0;
        value -= 1;
        if (value < 0) value = 0;
        value = Math.round(value * 10) / 10;
        slider.value = value;
        document.getElementById("speedValue").textContent = value.toFixed(1);
        globalGameData.chronometer.targetSpeed = value; 
        break;
    }
    case "1":{
        const slider = document.getElementById("speedSlider");
        const value = parseFloat(1).toFixed(1);
        globalGameData.chronometer.targetSpeed = value; 
        document.getElementById("speedValue").textContent = value;
        break;
    } 
  }
}
const canvas = document.getElementById("renderCanvas");
canvas.setAttribute("tabindex", "0"); 
canvas.focus();
document.addEventListener("pointerdown", () => {
  canvas.focus();
});
function makePanelDraggable(panelId) {
  const panel = document.getElementById(panelId);
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  panel.addEventListener("mousedown", (e) => {
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
  function onMouseMove(e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top = (e.clientY - offsetY) + "px";
  }
  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}
makePanelDraggable("StarshipPanel");
makePanelDraggable("WarningPanel");
if((globalGameData.Starship?.actualStage??0) >= Object.keys(globalGameData.Starship?.Stages ?? {}).length){
    document.getElementById("StageSeparator").textContent = " ";
    document.getElementById("StageSeparator").classList.add("NoClickButton");
}else{
    document.getElementById("StageSeparator").textContent = `Separate stage: ${globalGameData.Starship?.actualStage??0}`;
    document.getElementById("StageSeparator").classList.remove("NoClickButton");
}
if((globalGameData.Starship?.Stages[globalGameData.Starship?.actualStage??0]?.parachute ?? null) != null){
    const par =globalGameData.Starship.Stages[globalGameData.Starship.actualStage].parachute; 
    const ship = globalGameData.Starship;
    if(par!= null&&ship!= null){
        let targetAtmo = null;
        if(globalGameData.Starship){
            for (const planet of globalGameData.Star.planets){
                if(planet.name === globalGameData.Starship.relatedObject)targetAtmo =planet.atmosphere;
                else if(planet.moons){
                    for (const moon of planet.moons){
                        if(moon.name === globalGameData.Starship.relatedObject)targetAtmo =moon.atmosphere;        
                    }
                }
            }
        }
        if(!isFinite(ship.velocity.modulo())||ship.velocity.modulo()>par.maxShipSpeed){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${ship.velocity.modulo()} m/s`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        }else if(targetAtmo==null||ship.altitudineRelativa>targetAtmo.maxAltitude||targetAtmo.density<=1e-5){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute in space`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else if(ship.altitudineRelativa > par.maxDeployAltitude){
            document.getElementById("ParachuteButton").textContent = `Impossible to deploy parchute at ${ship.altitudineRelativa/1000} Km altitude`;
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else if(par.cut){
            document.getElementById("ParachuteButton").textContent = " ";
            document.getElementById("ParachuteButton").classList.add("NoClickButton");
        } else{
            if(par.openingPercent>=100){
                document.getElementById("ParachuteButton").textContent = `Cut Parchute`;
                document.getElementById("ParachuteButton").classList.remove("NoClickButton");
            }else{
                document.getElementById("ParachuteButton").textContent = `Deploy Parachute`;
                document.getElementById("ParachuteButton").classList.remove("NoClickButton");
            }
        }
    }
}else{
    document.getElementById("ParachuteButton").textContent = " ";
    document.getElementById("ParachuteButton").classList.add("NoClickButton");
}
let currentStageIndex = 1;
let currentTempStage = new Stage();
function aggiornaEditor() {
    if(!globalGameData.Starship) return;
    const stages = globalGameData.Starship.Stages;
    const container = document.getElementById("stageEditorContainer");
    const index = currentStageIndex;
    if (!stages[index]) return;
    container.innerHTML = ""; 
    container.appendChild(generaEditorStage(currentTempStage, index));
    document.getElementById("stageTitle").textContent = `Stage ${index}`;
}
document.getElementById("prevStageBtn").onclick = () => {
    if (currentStageIndex > 1) {
        currentStageIndex--;
        currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        aggiornaEditor();
    }
};
document.getElementById("nextStageBtn").onclick = () => {
    if (currentStageIndex < Object.keys(globalGameData.Starship.Stages).length) {
        currentStageIndex++;
        currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        aggiornaEditor();
    }
};
document.getElementById("saveStageChanges").onclick = () => {
    let isShipOnAStarbase = false;
    if (globalGameData.Starship&&globalGameData.Starship.ferma) {
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
    }
    if(isShipOnAStarbase){
        salvaEditorCorrente(true);
        currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        aggiornaEditor();
    }
};
document.getElementById("addNewStage").onclick = () => {
    if (globalGameData.Starship&&globalGameData.Starship.ferma) {
        let isShipOnAStarbase = false;
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
        if(globalGameData.Starship.ferma&&(globalGameData.Starship.TypeRelObj=="planet"||globalGameData.Starship.TypeRelObj=="moon")&&isShipOnAStarbase){
            globalGameData.Starship.Stages[currentStageIndex] = currentTempStage.clone();
        }
        if(isShipOnAStarbase){
            const newIndex = Math.max(...Object.keys(globalGameData.Starship.Stages).map(Number)) + 1;
            currentStageIndex = newIndex;
            currentTempStage = new Stage();
            aggiornaEditor();           
        }
    }
};
document.getElementById("deleteStage").onclick = () => {
    let isShipOnAStarbase = false;
    if (globalGameData.Starship&&globalGameData.Starship.ferma) {
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
    }
    if(isShipOnAStarbase){
        const numStadi = Object.keys(globalGameData.Starship.Stages).length;
        if (numStadi <= 1) return alert("Almeno uno stage deve restare!");
        delete globalGameData.Starship.Stages[currentStageIndex];
        const vecchi = Object.entries(globalGameData.Starship.Stages) .sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(e => e[1]);
        const nuovi = {};
        for (let i = 0; i < vecchi.length; i++) {
            nuovi[i + 1] = vecchi[i];
        }
        globalGameData.Starship.Stages = nuovi;
        currentStageIndex = Math.min(currentStageIndex, Object.keys(nuovi).length);
        currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        aggiornaEditor();
    }
};
document.getElementById("moveStageUp")?.addEventListener("click", () => {
    let isShipOnAStarbase = false;
    if (globalGameData.Starship&&globalGameData.Starship.ferma) {
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
    }
    if(isShipOnAStarbase){
        if (currentStageIndex > 1) {
            swapStages(currentStageIndex, currentStageIndex + 1);
            currentStageIndex++;
            currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        }
    }
});
document.getElementById("moveStageDown")?.addEventListener("click", () => {
    let isShipOnAStarbase = false;
    if (globalGameData.Starship&&globalGameData.Starship.ferma) {
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
    }
    if(isShipOnAStarbase){
        const max = Math.max(...Object.keys(globalGameData.Starship.Stages).map(Number));
        if (currentStageIndex < max) {
            swapStages(currentStageIndex, currentStageIndex - 1);
            currentStageIndex--;
            currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
        }
    }
});
document.getElementById("StarshipSettingsMenu").onclick = () => {
    if(!globalGameData.Starship){
        alert("You need a starship to modify it.");
        return;
    }
    document.getElementById("StarshipPanel").classList.remove("hidden");
    currentTempStage = (globalGameData.Starship?.Stages[currentStageIndex]?.clone()??new Stage());
    aggiornaEditor();
};
document.getElementById("chiudiImpostazioniAstronave").onclick = () => {
    document.getElementById("StarshipPanel").classList.add("hidden");
    currentTempStage = null;
};
function swapStages(a, b) {
    const tmp = globalGameData.Starship.Stages[a];
    globalGameData.Starship.Stages[a] = globalGameData.Starship.Stages[b];
    globalGameData.Starship.Stages[b] = tmp;
    aggiornaEditor();
}
function estraiCondizioniDaStruttura(struttura) {
    const entry = hullStructureMap[struttura];
    if (!entry || !Array.isArray(entry.conditions)) return [];
    const condizioni = [];
    const condPattern = /^([^\(]+)\((.*?)\)$/;
    for (const blocco of entry.conditions) {
        const match = blocco.match(condPattern);
        if (!match) continue;
        const component = match[1].trim();
        const rawConds = match[2].trim();
        const condList = rawConds.split(/[:\/]/).map(s => s.trim()).filter(Boolean);
        for (const cond of condList) {
            const pulito = cond.replace(/^\[+/, "").replace(/\]+$/, "").trim();
            if (pulito === "*") {
                condizioni.push({ component, geometry: "*", condition: null });
            } else {
                condizioni.push({ component, geometry: "*", condition: pulito });
            }
        }
        if (condList.length === 0) {
            condizioni.push({ component, geometry: "*", condition: null });
        }
    }
    return condizioni;
}
function estraiCondizioniDaMateriale(materiale) {
    const entry = materialCpMap[materiale];
    if (!entry || !Array.isArray(entry.usable)) return [];
    const condizioni = [];
    const condPattern = /^([\w_]+)\s*([=!<>]+)\s*(.+)$/;
    for (const blocco of entry.usable) {
        const match = blocco.match(/^([^\(]+)\((.*?)\)(?::(.*))?$/);
        if (!match) continue;
        const component = match[1].trim();
        const geometrieBlocchi = match[2];
        const condGlobali = match[3] ?? "";
        const geoRegex = /(?:\*|([\w\s\-³²\^]+))\s*(?:\(\[([^\]]+)\]\))?/g;
        let gmatch;
        while ((gmatch = geoRegex.exec(geometrieBlocchi)) !== null) {
            if(gmatch[1]=="") debugger;
            const geometry = (gmatch[1] ?? "").trim();
            const rawConds = gmatch[2] ?? "";
            const conds = rawConds.split(":").map(s => s.trim()).filter(Boolean);
            for (const cond of conds) {
                if (cond === "*") {
                    condizioni.push({ component, geometry, condition: null });
                } else {
                    condizioni.push({ component, geometry, condition: cond });
                }
            }
            if (conds.length === 0) {
                condizioni.push({ component, geometry, condition: null });
            }
        }
        if (condGlobali && /[<>!=]/.test(condGlobali)) {
            const globalConds = condGlobali.split(/[:\/]/).map(c => c.trim()).filter(Boolean);
            for (const cond of globalConds) {
                condizioni.push({ component, geometry: '*', condition: cond });
            }
        }
    }
    return condizioni;
}
function impostaMassaNelFieldset(fs, valore) {
    const blocco = fs.closest(".stage-editor, .engine-block, .heat-shield-block, .parachute-block");
    if (!blocco) return;
    const inputMassa = blocco.querySelector("input[class*='mass']");
    if (inputMassa && !isNaN(valore)) {
        inputMassa.value = +valore.toFixed(2);
    }
}
function calcolaProprietaStrutturali({ materiale, geometria, altezza, diametro, spessore,fs = null }) {
    const mat = materialCpMap[materiale];
    const geo = hullStructureMap[geometria];
    if (!mat || !geo) return null;
    const h = parseFloat(altezza) || 1;
    const d = parseFloat(diametro) || 1;
    if (isNaN(h) || isNaN(d) || h <= 0 || d <= 0) return null;
    const slancio = h / d;
    const cdGeo = geo.cd ?? 1;
    const rugosita = 1 + (mat.Cd ?? 0.1);
    const slancioFactor = 1 + Math.max(0, (slancio - 1)) * 0.05;
    const Cd = cdGeo * rugosita * slancioFactor;
    const t = spessore * 0.015;
    const sideArea = Math.PI * d * h;
    const baseArea = Math.PI * (d / 2) ** 2;
    const totalArea = sideArea + 2 * baseArea;
    const volumeStruttura = totalArea * t;
    const massaTermica = volumeStruttura * mat.density * mat.cp;
    const massaStruttura = volumeStruttura * mat.density;
    impostaMassaNelFieldset(fs, massaStruttura);
    const dissipazione = (mat["ε"] ?? 0.5) * totalArea;
    const capacitaTermica = massaTermica * mat.cp;
    const stress = dissipazione / capacitaTermica;
    let Tmax = (mat.FT ?? 2000) - (1 - stress * cdGeo)*(hullStructureMap[geometria]?.ηt??0.90);
    if(!isFinite(Tmax)|isNaN(Tmax)) {
        const capacitaTermica = massaTermica * mat.cp;
        const stress = dissipazione / capacitaTermica;
        Tmax = (mat.FT ?? 2000) - (1 - stress * cdGeo);
        if(!isFinite(Tmax)|isNaN(Tmax)) {
            Tmax = 0
        }
    }
    const snervamento = 1 - Math.min(0.8, h / (d * 6));
    const fattoreStrutturale = 1 + (t / d) * 10
    const GLimit = (mat.GL ?? 10) * (geo.r ?? 1) * snervamento * fattoreStrutturale*(hullStructureMap[geometria]?.ηg??0.90);
    return { Cd: +Cd.toFixed(3), Tmax: +Tmax.toFixed(1),GLimit: +GLimit.toFixed(2)};
}
function generaEditorStage(stage, index) {
    const container = document.createElement("div");
    container.classList.add("stage-editor");
    container.dataset.stageIndex = currentStageIndex;
    const geometrieConsentitePer = comp => Object.entries(hullStructureMap).filter(([_, v]) => v.usable?.includes(comp)).map(([k]) => k);
    const createLabeledInput = (labelText, value, className, min = null, max = null, readonly = false) => {
        const wrap = document.createElement("div");
        wrap.className = "form-row";
        const label = document.createElement("label");
        label.textContent = labelText;
        const input = document.createElement("input");
        input.required = true;
        input.step = "any";
        input.type = "number";
        input.addEventListener("input", () => {
            const max = parseFloat(input.max);
            const min = parseFloat(input.min);
            let val = parseFloat(input.value);
            if (isNaN(val)) return;
            if (!isNaN(max) && val > max) input.value = max;
            if (!isNaN(min) && val < min) input.value = min;
        });
        input.readOnly = readonly;
        if(readonly) input.dataset.autoCalc = "true";
        input.value = value ?? "";
        input.className = className;
        if (min !== null) input.min = min;
        if (max !== null) input.max = max;
        wrap.append(label, input);
        return wrap;
    };
    function aggiornaLimiteQuantitaCarburante(inputFuel) {
        const container = inputFuel.closest(".stage-editor");
        if (!container) return;
        const tipo = container.querySelector(".select-fuel-type")?.value || "";
        const h = parseFloat(container.querySelector(".stage-height")?.value || "0");
        const d = parseFloat(container.querySelector(".stage-diameter")?.value || "0");
        const s = parseFloat(container.querySelector(".stage-spessore")?.value || "0");
        const kind = container.querySelector(".stage-kind")?.value || "";
        if (tipo === "" || isNaN(h) || isNaN(d) || h <= 0 || d <= 0|| isNaN(s) || s <= 0 || s <= 0) {
            inputFuel.max = 0;
            return;
        }
        const rEst = d / 2;
        const rInt = rEst -  d * (s / 100);
        if (rInt <= 0) {
            inputFuel.max = 0;
            return;
        }
        const area = hullStructureMap[kind]?.a ?? 1;
        const volumeMax = (Math.PI * (rInt ** 2) * h)*(hullStructureMap[kind]?.η??0.90) * area;
        inputFuel.max = volumeMax.toFixed(3);
        const val = parseFloat(inputFuel.value);
        if (!isNaN(val) && val > volumeMax) {
            inputFuel.value = volumeMax.toFixed(3);
        }
    }
    const createSelect = (labelText, options, selected, className) => {
        const wrap = document.createElement("div");
        wrap.className = "form-row";
        const label = document.createElement("label");
        label.textContent = labelText;
        const sel = document.createElement("select");
        sel.className = className;
        options.forEach(optVal => {
            const o = document.createElement("option");
            o.value = optVal;
            o.textContent = optVal;
            if (optVal === selected) o.selected = true;
            sel.append(o);});
        wrap.append(label, sel);
        return wrap;
    };
    function aggiornaCalcoloSuperficie(fs) {
        const prefix = fs.dataset.prefix;
        const blocco = fs.closest(".stage-editor, .engine-block, .heat-shield-block, .parachute-block");
        const spessore = parseFloat(fs.querySelector(`.${prefix}-spessore`)?.value || "0");
        const materiale = fs.querySelector(`.${prefix}-material`)?.value || "";
        const geometria = fs.querySelector(`.${prefix}-kind`)?.value || "";
        const h = parseFloat(fs.querySelector(`.${prefix}-height`)?.value || "0");
        const d = parseFloat(fs.querySelector(`.${prefix}-diameter`)?.value || "0");
        const props = calcolaProprietaStrutturali({ materiale, geometria, altezza: h, diametro: d ,spessore:spessore,fs:fs});
        if (props) {
            const cd = fs.querySelector(`.${prefix}-Cd`);
            const tmax = fs.querySelector(`.${prefix}-tmax`);
            const g = fs.querySelector(`.${prefix}-glimit`);
            if (cd) cd.value = props.Cd;
            if (tmax) tmax.value = props.Tmax;
            if (g) g.value = props.GLimit;
        }
    }
    function createSurfaceEditor(surface, prefix,kind ="",text = "Surface") {
        const fs = document.createElement("fieldset");
        fs.className = prefix + "-surface-block";
        const legend = document.createElement("legend");
        legend.textContent = text;
        fs.dataset.kind = kind;
        fs.dataset.prefix = prefix;
        fs.append(legend);
        fs.appendChild(createLabeledInput("Height [m]", surface.height, `${prefix}-height`, 0, 50));
        fs.appendChild(createLabeledInput("Diameter [m]", surface.diameter, `${prefix}-diameter`, 0, 12));
        fs.appendChild(createLabeledInput("Hull Thickness [%]", surface.spessorePercentuale, `${prefix}-spessore`, 0.1, 100));
        const geometrieValide = geometrieConsentitePer(kind);
        fs.appendChild(createSelect("Geometry",  geometrieValide, surface.kind, `${prefix}-kind`));
        fs.appendChild(createLabeledInput("Drag Coefficient", surface.Cd, `${prefix}-Cd`, 0, 10,true));
        fs.appendChild(createLabeledInput("Max Temperature [K]", surface.maxTemperature, `${prefix}-tmax`, 0, 1e5,true));
        fs.appendChild(createSelect("Material", Object.keys(materialCpMap),surface.material,`${prefix}-material`));
        fs.appendChild(createLabeledInput("G-Limit", surface.GLimit, `${prefix}-glimit`, 0, 1000,true));
        aggiornaCalcoloSuperficie(fs);
        fs.querySelectorAll("input").forEach(el => {
            el.addEventListener("input", () => aggiornaCalcoloSuperficie(fs));
        });
        fs.querySelectorAll("select").forEach(el => {
            el.addEventListener("change", () => aggiornaCalcoloSuperficie(fs));
        });
        return fs;
    }
    function estraiDatiSuperficie(fs) {
        if (!(fs instanceof HTMLElement)) return {};
        const prefix = fs.dataset.prefix || "";
        const kind = fs.dataset.kind || "";
        const blocco = fs.closest(".stage-editor, .parachute-block, .engine-block, .heat-shield-block");
        let bloccoFuel = fs.closest(".stage-editor");
        if(!bloccoFuel){
            bloccoFuel = container;
        }
        const getVal = (cls, root = fs) => {
            const el = root?.querySelector(`.${prefix}-${cls}`);
            return el ? parseFloat(el.value) : NaN;
        };
        const dati = {
            component: kind,
            prefix,
            geometry: fs.querySelector(`.${prefix}-kind`)?.value || "",
            h: getVal("height"),
            d: getVal("diameter"),
            GLimit: getVal("glimit"),
            Tmax: getVal("tmax"),
            Cd: getVal("Cd"),
            material: fs.querySelector(`.${prefix}-material`)?.value || "",
            m: NaN,
            classeCarburante: "",
            massFuel: NaN,
            tipoCarburante: "",
            numParachutes: NaN,
            spessorePercentuale : getVal("spessore"),
            N: NaN,
            areaParachute: NaN,
            materialeParachute: "",
            geometryParachute: "",
            maxParSpeed: NaN,
            maxParHeigh: NaN,
        };
        if (blocco) {
            if(bloccoFuel){
                dati.massFuel = parseFloat(bloccoFuel.querySelector(".input-fuel")?.value || NaN);
                dati.tipoCarburante = bloccoFuel.querySelector(".select-fuel-type")?.value || "";
                dati.classeCarburante =  fuelMap[dati.tipoCarburante]?.class??"";
            }
            if (kind === "Parachute") {
                dati.numParachutes = parseFloat(blocco.querySelector(".para-num")?.value || NaN);
                dati.areaParachute = parseFloat(blocco.querySelector(".para-area")?.value || NaN);
                dati.materialeParachute = blocco.querySelector(".para-material")?.value
                dati.geometryParachute = blocco.querySelector(".para-kind")?.value;
                dati.maxParHeigh = parseFloat(blocco.querySelector(".para-alt")?.value || NaN);
                dati.maxParSpeed = parseFloat(blocco.querySelector(".para-vmax")?.value || NaN);
                dati.m = parseFloat(blocco.querySelector(".para-mass")?.value || NaN);
            }
            if (kind === "Engine") {
                dati.N = parseFloat(blocco.querySelector(".engine-thrust")?.value || NaN);
                dati.m = parseFloat(blocco.querySelector(".engine-mass")?.value || NaN);
            }
            if(kind === "Heat Shield"){
                dati.m = parseFloat(blocco.querySelector(".shield-mass")?.value || NaN);
            }
            if(isNaN(dati.m)) dati.m = parseFloat(blocco.querySelector(".input-mass")?.value || NaN); 
        }
        return dati;
    }
    function AggiornaERicalcolaMateriali(dati) {
        const materialTrueMap = [];
        for (const materiale in materialCpMap) {
            const condizioni = estraiCondizioniDaMateriale(materiale);
            let materialeCompatibile = false;
            const condizioniFiltrate = condizioni.filter(c => c.component === dati.component &&(c.geometry === dati.geometry || c.geometry === "*"));
            if (condizioniFiltrate.length === 0) continue;
            const gruppi = {};
            for (const cond of condizioniFiltrate) {
                if (!gruppi[cond.geometry]) gruppi[cond.geometry] = [];
                gruppi[cond.geometry].push(cond);
            }
            for (const conds of Object.values(gruppi)) {
                const tutteValide = conds.every(({ condition }) => {
                if (!condition) return true;
                const match = condition.match(/^([\w_]+)\s*([=!<>]+)\s*(.+)$/);
                if (!match) return false;
                const [, varName, op, val] = match;
                let attuale, atteso;
                const parsedAttuale = parseFloat(dati[varName]);
                const parsedAtteso = parseFloat(val);
                if (isNaN(parsedAttuale) || isNaN(parsedAtteso)) {
                    attuale = String(dati[varName]).trim();
                    atteso = val.trim().replace(/^['"]|['"]$/g, '');
                } else {
                    attuale = parsedAttuale;
                    atteso = parsedAtteso;
                }
                switch (op) {
                    case "<":  return attuale < atteso;
                    case "<=": return attuale <= atteso;
                    case ">":  return attuale > atteso;
                    case ">=": return attuale >= atteso;
                    case "=":  return attuale === atteso;
                    case "!=":  return attuale !== atteso;
                    default:   return false;
                }});
                if (tutteValide) {
                    materialeCompatibile = true;
                    break;
                }
            }
            if (materialeCompatibile) {
                materialTrueMap.push(materiale);
            }
        }
        return materialTrueMap;
    }
    function AggiornaERicalcolaStrutture(dati) {
        const materialTrueMap = [];
        for (const materiale in hullStructureMap) {
            const condizioni = estraiCondizioniDaStruttura(materiale);
            let materialeCompatibile = false;
            const condizioniFiltrate = condizioni.filter(c => c.component === dati.component &&(c.geometry === dati.geometry || c.geometry === "*"));
            if (condizioniFiltrate.length === 0) continue;
            const gruppi = {};
            for (const cond of condizioniFiltrate) {
                if (!gruppi[cond.geometry]) gruppi[cond.geometry] = [];
                gruppi[cond.geometry].push(cond);
            }
            for (const conds of Object.values(gruppi)) {
                const tutteValide = conds.every(({ condition }) => {
                if (!condition) return true;
                const match = condition.match(/^([\w_]+)\s*([=!<>]+)\s*(.+)$/);
                if (!match) return false;
                const [, varName, op, val] = match;
                let attuale, atteso;
                const parsedAttuale = parseFloat(dati[varName]);
                const parsedAtteso = parseFloat(val);
                if (isNaN(parsedAttuale) || isNaN(parsedAtteso)) {
                    attuale = String(dati[varName]).trim();
                    atteso = val.trim().replace(/^['"]|['"]$/g, '');
                } else {
                    attuale = parsedAttuale;
                    atteso = parsedAtteso;
                }
                switch (op) {
                    case "<":  return attuale < atteso;
                    case "<=": return attuale <= atteso;
                    case ">":  return attuale > atteso;
                    case ">=": return attuale >= atteso;
                    case "=":  return attuale === atteso;
                    case "!=":  return attuale !== atteso;
                    default:   return false;
                }});
                if (tutteValide) {
                    materialeCompatibile = true;
                    break;
                }
            }
            if (materialeCompatibile) {
                materialTrueMap.push(materiale);
            }
        }
        return materialTrueMap;
    }
    function AggiornaMaterialiAssegnabili(fs) {
        if (!(fs instanceof HTMLElement)) return;
        const selectMat = fs.querySelector(`.${fs.dataset.prefix}-material`);
        if (!selectMat) return;
        const aggiorna = () => {
            const dati = estraiDatiSuperficie(fs);
            const materialiCompatibili = AggiornaERicalcolaMateriali(dati);
            const materialeAttuale = selectMat.value;
            selectMat.innerHTML = "";
            for (const nome of Object.keys(materialCpMap)) {
                const opt = document.createElement("option");
                opt.value = nome;
                opt.textContent = nome;
                if (!materialiCompatibili.includes(nome)) opt.disabled = true;
                if (nome === materialeAttuale) opt.selected = true;
                selectMat.appendChild(opt);
            }
            if (!materialiCompatibili.includes(materialeAttuale)) {
                const warn = document.createElement("option");
                warn.textContent = "⚠ Unsuitable Material!";
                warn.disabled = true;
                warn.selected = true;
                selectMat.appendChild(warn);
            }
        };
        aggiorna();
        const campi = fs.querySelectorAll("input, select");
        campi.forEach(el => {
            el.addEventListener("input", aggiorna);
        });
    }
    function AggiornaStruttureAssegnabili(fs) {
        if (!(fs instanceof HTMLElement)) return;
        const selectMat = fs.querySelector(`.${fs.dataset.prefix}-kind`);
        if (!selectMat) return;
        const aggiorna = () => {
            const dati = estraiDatiSuperficie(fs);
            const materialiCompatibili = AggiornaERicalcolaStrutture(dati);
            const materialeAttuale = selectMat.value;
            selectMat.innerHTML = "";
            for (const nome of Object.keys(hullStructureMap)) {
                const opt = document.createElement("option");
                opt.value = nome;
                opt.textContent = nome;
                if (!materialiCompatibili.includes(nome)) opt.disabled = true;
                if (nome === materialeAttuale) opt.selected = true;
                selectMat.appendChild(opt);
            }
            if (!materialiCompatibili.includes(materialeAttuale)) {
                const warn = document.createElement("option");
                warn.textContent = "⚠ Unsuitable Structure!";
                warn.disabled = true;
                warn.selected = true;
                selectMat.appendChild(warn);
            }
        };
        aggiorna();
        const campi = fs.querySelectorAll("input, select");
        campi.forEach(el => {
            el.addEventListener("input", aggiorna);
        });
    }
    function AggiornaStruttureAssegnabiliCarburante(fs) {
        if (!(fs instanceof HTMLElement)) return;
        const selectMat = fs.querySelector(`.${fs.dataset.prefix}-kind`);
        if (!selectMat) return;
        const aggiorna = () => {
            const dati = estraiDatiSuperficie(fs);
            const materialiCompatibili = AggiornaERicalcolaStrutture(dati);
            const materialeAttuale = selectMat.value;
            selectMat.innerHTML = "";
            for (const nome of Object.keys(hullStructureMap)) {
                const opt = document.createElement("option");
                opt.value = nome;
                opt.textContent = nome;
                if (!materialiCompatibili.includes(nome)) opt.disabled = true;
                if (nome === materialeAttuale) opt.selected = true;
                selectMat.appendChild(opt);
            }
            if (!materialiCompatibili.includes(materialeAttuale)) {
                const warn = document.createElement("option");
                warn.textContent = "⚠ Unsuitable Structure!";
                warn.disabled = true;
                warn.selected = true;
                selectMat.appendChild(warn);
            }
        };
        aggiorna();
    }
    function ricalcolaMassaAltitudineVelocitaParacadute(pBlock){
        const getNumero = (selector, root = editor) => {
            const el = root.querySelector(selector);
            if (!el) return null;
            const val = parseFloat(el.value);
            return isNaN(val) ? null : val;};
        function isValidValue(value){
            return (!isNaN(value)&&isFinite(value)&&value!=null&&value>0&&value<1e10);
        }
        let sNumPara = getNumero(".para-num", pBlock);
        let sAreaPara = getNumero(".para-area", pBlock);
        const sMaterialPara = pBlock.querySelector(".para-material").value;
        const sGeometryPara = pBlock.querySelector(".para-kind").value;
        const paraStructuralAltezza = getNumero(".para-height", pBlock)
        const paraStructuralDiametro = getNumero(".para-diameter", pBlock)
        const paraStructuralSpessore = getNumero(".para-spessore", pBlock)
        const paraBlocco = pBlock.querySelector(".para-surface-block")
        const paraStructuralMaterial = paraBlocco.querySelector(".para-material").value;
        const paraStructuralGeometry = paraBlocco.querySelector(".para-kind").value;
        if(isValidValue(paraStructuralSpessore)&&isValidValue(paraStructuralDiametro)&&isValidValue(paraStructuralAltezza)&&isValidValue(sNumPara)&&isValidValue(sAreaPara)&&
        sMaterialPara!=null&&sMaterialPara!=""&&sGeometryPara!=null&&sGeometryPara!=""&&paraStructuralGeometry!=null&&
        paraStructuralGeometry!=""&&paraStructuralMaterial!=null&&paraStructuralMaterial!=""&&paraStructuralMaterial!="⚠ Unsuitable Material!"&&paraStructuralGeometry!="⚠ Unsuitable Structure!"){
            let targetAtmosphere = null;
            if(globalGameData.Starship){
                var find = false;
                for (const planet of globalGameData.Star.planets){
                    if(planet.name === globalGameData.Starship.relatedObject) targetAtmosphere =planet.atmosphere;
                    else if(planet.moons){
                        for (const moon of planet.moons){
                            if(moon.name === globalGameData.Starship.relatedObject) targetAtmosphere =moon.atmosphere;         
                        }
                    }
                }
            }
            const rIn = paraStructuralDiametro / 2 - (paraStructuralSpessore*(paraStructuralDiametro/100));
            const hIn = paraStructuralAltezza - 2 * (paraStructuralSpessore*(paraStructuralDiametro/100));
            const volumeCilindrico = Math.PI * rIn ** 2 * hIn;
            const coeffGeometrico = hullStructureMap[paraStructuralGeometry]?.a ?? 1;
            const efficienzaStivaggio = materialCpMap[paraStructuralMaterial]?.η ?? 0.5;
            const volumeEffettivo = volumeCilindrico * coeffGeometrico * efficienzaStivaggio;
            const coeffForma = parastructureMap[sGeometryPara]?.a ?? 1;
            const areaMaxTessuto = ((volumeEffettivo / coeffForma))*(hullStructureMap[sGeometryPara]?.η??0.90);
            if(sAreaPara*sNumPara>areaMaxTessuto){
                pBlock.querySelector(".para-area").value = areaMaxTessuto/sNumPara;
                sAreaPara = areaMaxTessuto/sNumPara;
            }
            let parMass = ((sNumPara * sAreaPara) * (paraMaterialsMap[sMaterialPara]?.m ?? 0))*(parastructureMap[sGeometryPara]?.a ?? 0);
            const massaStruttura = volumeEffettivo * materialCpMap[paraStructuralMaterial]?.density;
            parMass+=massaStruttura;
            const CdPar = ((paraMaterialsMap[sMaterialPara]?.cd ?? 0)*(parastructureMap[sGeometryPara]?.cd ?? 0))* (1 - 0.12 * (sNumPara-1))
            pBlock.querySelector(".para-mass").value = parMass;
            const mat = paraMaterialsMap[sMaterialPara];
            const str = parastructureMap[sGeometryPara];
            const sigmaEff = mat.r * str.r;
            const PaMax    = sigmaEff / str.a; 
            if(!targetAtmosphere) targetAtmosphere = new Atmosphere(1.225,8500,120000,28.97,"#87ceebAA",{N2 : 78.08,O2 : 20.95,Ar : 0.93,H2O : 0.158,CO2 : 0.042},0.36);
            let rho = targetAtmosphere.density * Math.exp(-0 / targetAtmosphere.scaleHeight);
            const hMaxDeploy = -targetAtmosphere.scaleHeight * Math.log(0.1 / targetAtmosphere.density);
            pBlock.querySelector(".para-alt").value = hMaxDeploy;
            const vMaxSafe = Math.sqrt((2 * PaMax) / (rho * CdPar));
            pBlock.querySelector(".para-vmax").value = vMaxSafe;
        }else{
            pBlock.querySelector(".para-mass").value = 0;
            pBlock.querySelector(".para-alt").value = 0;
            pBlock.querySelector(".para-vmax").value = 0;
        }
    }
    function ricalcolaSpintaMassimaMotori(engBlock,fuelKind){
        const getNumero = (selector, root = editor) => {
            const el = root.querySelector(selector);
            if (!el) return null;
            const val = parseFloat(el.value);
            return isNaN(val) ? null : val;};
        function isValidValue(value){
            return (!isNaN(value)&&isFinite(value)&&value!=null&&value>0&&value<1e10);
        }
        let sSpintaMotore = getNumero(".engine-thrust", engBlock);
        const engInnerBlock = engBlock.querySelector(".engine-surface-block")
        const fuelEngineType = fuelKind.value;
        const EngStructuralMaterial = engInnerBlock.querySelector(".engine-material").value;
        const EngStructuralGeometry = engInnerBlock.querySelector(".engine-kind").value;
        const EngStructuralAltezza = getNumero(".engine-height", engInnerBlock)
        const EngStructuralDiametro = getNumero(".engine-diameter", engInnerBlock)
        const EngStructuralSpessore = getNumero(".engine-spessore", engInnerBlock)
        if(isValidValue(EngStructuralAltezza)&&isValidValue(EngStructuralDiametro)&&isValidValue(EngStructuralSpessore)&&
        EngStructuralMaterial!=""&&EngStructuralMaterial!=null&&EngStructuralMaterial!=""&&EngStructuralMaterial!=null
        &&EngStructuralGeometry!=""&&EngStructuralGeometry!=null&&fuelEngineType!=""&&fuelEngineType!=null&&EngStructuralMaterial!="⚠ Unsuitable Material!"&&EngStructuralGeometry!="⚠ Unsuitable Structure!"){
            const rIn = EngStructuralAltezza / 2 - (EngStructuralAltezza*(EngStructuralSpessore/100));
            const hIn = EngStructuralAltezza - 2 * (EngStructuralAltezza*(EngStructuralSpessore/100));
            const volumeCilindrico = Math.PI * rIn ** 2 * hIn;
            const struttura = hullStructureMap[EngStructuralGeometry] ?? {};
            const coeffGeometrico = struttura.a ?? 1.0;
            const etaStrutturale = struttura.ηg ?? struttura.η ?? 0.8;
            const materialeProps = materialCpMap[EngStructuralMaterial] ?? {};
            const densitaSpinta = materialCpMap.vtf ?? 380000;
            const volumeUtile = volumeCilindrico * coeffGeometrico * etaStrutturale;
            const thrustMassima = volumeUtile * densitaSpinta;
            if(sSpintaMotore>thrustMassima){
                sSpintaMotore = thrustMassima;
                engBlock.querySelector(".engine-thrust").value = thrustMassima;
            }
        }else engBlock.querySelector(".engine-thrust").value = 0;
    }
    container.appendChild(document.createElement("hr"));
    container.appendChild(document.createTextNode(`Stage ${index}`));
    let massaStadio = stage.mass;
    if((stage.quantitaCarburante>0)&&(stage.tipoCarburante!="")&&(stage.tipoCarburante!=null)) massaStadio-=(stage.quantitaCarburante * (fuelMap[stage.tipoCarburante]?.density??0));
    if(stage.Engine!=null) massaStadio-=stage.Engine.mass;
    if(stage.heatShield!=null) massaStadio-=stage.heatShield.mass;
    if(stage.parachute!=null) massaStadio-=stage.parachute.mass;
    container.appendChild(createLabeledInput("Base Mass [Kg]", massaStadio, "input-mass", 0, 1e8,true));
    const inputFuel= createLabeledInput("Fuel Quantity [m³]", stage.quantitaCarburante, "input-fuel", 0, 1e6,false)
    const inputEl = inputFuel.querySelector("input");
    inputEl.addEventListener("input", () => aggiornaLimiteQuantitaCarburante(inputEl));
    container.appendChild(inputFuel);
    const fuelselect = createSelect("Fuel Kind",Object.keys(fuelMap),stage.tipoCarburante,"select-fuel-type")
    container.appendChild(fuelselect);
    const fss1 = createSurfaceEditor(stage.surface, "stage","Stage");
    container.appendChild(fss1);
    fuelselect.addEventListener("change", () => AggiornaStruttureAssegnabiliCarburante(fss1));
    AggiornaMaterialiAssegnabili(fss1);
    AggiornaStruttureAssegnabili(fss1);
    container.querySelector(".stage-height")?.addEventListener("input", () =>
        aggiornaLimiteQuantitaCarburante(container.querySelector(".input-fuel"))
    );
    container.querySelector(".stage-spessore")?.addEventListener("input", () =>
        aggiornaLimiteQuantitaCarburante(container.querySelector(".input-fuel"))
    );
    container.querySelector(".stage-diameter")?.addEventListener("input", () =>
        aggiornaLimiteQuantitaCarburante(container.querySelector(".input-fuel"))
    );
    container.querySelector(".select-fuel-type")?.addEventListener("change", () =>
        aggiornaLimiteQuantitaCarburante(container.querySelector(".input-fuel"))
    );
    const engFs = document.createElement("fieldset");
    engFs.className = "engine-block";
    const engLeg = document.createElement("legend");
    engLeg.textContent = "Engine";
    engFs.append(engLeg);
    if (stage.Engine) {
        engFs.appendChild(createLabeledInput("Engine Mass [kg]", stage.Engine.mass, "engine-mass", 0, 1e6,true));
        const engNLabel = createLabeledInput("Engine Thrust [N]", stage.Engine.Thrust, "engine-thrust", 0, 1e9)
        engFs.appendChild(engNLabel);
        engNLabel.addEventListener("input", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        const fss2 = createSurfaceEditor(stage.Engine.surface, "engine","Engine","Engine Surface")
        engFs.appendChild(fss2);
        fss2.querySelector(".engine-height").addEventListener("input", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        fss2.querySelector(".engine-diameter").addEventListener("input", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        fss2.querySelector(".engine-spessore").addEventListener("input", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        fss2.querySelector(".engine-material").addEventListener("change", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        fss2.querySelector(".engine-kind").addEventListener("change", () => { ricalcolaSpintaMassimaMotori(container.querySelector(".engine-block"),container.querySelector(".select-fuel-type"));});
        fuelselect.addEventListener("change", () => AggiornaStruttureAssegnabiliCarburante(fss2));        
        AggiornaMaterialiAssegnabili(fss2);
        AggiornaStruttureAssegnabili(fss2);
        const btnRmE = document.createElement("button");
        btnRmE.textContent = "❌ Remove Engine";
        btnRmE.className = "rimuovi-motore";
        btnRmE.onclick = () => {
            stage.Engine = null;
            salvaEditorCorrente();
            aggiornaEditor();};
        engFs.appendChild(btnRmE);
    } else {
        const btnAddE = document.createElement("button");
        btnAddE.textContent = "➕ Add Engine";
        btnAddE.onclick = () => {
        salvaEditorCorrente();
        stage.Engine = new Engine();
        aggiornaEditor();};
        engFs.append(btnAddE);
    }
    container.appendChild(engFs);
    const hsFs = document.createElement("fieldset");
    hsFs.className = "heat-shield-block";
    const hsLeg = document.createElement("legend");
    hsLeg.textContent = "Heat Shield";
    hsFs.append(hsLeg);
    if (stage.heatShield) {
        hsFs.appendChild(createLabeledInput("Massa [kg]", stage.heatShield.mass, "shield-mass", 0, 1e6,true));
        const fss3 = createSurfaceEditor(stage.heatShield.surface, "shield","Heat Shield","Heat Shield Surface");
        hsFs.appendChild(fss3);
        fuelselect.addEventListener("change", () => AggiornaStruttureAssegnabiliCarburante(fss3));        
        AggiornaMaterialiAssegnabili(fss3);
        AggiornaStruttureAssegnabili(fss3);
        const btnRmH = document.createElement("button");
        btnRmH.textContent = "❌ Remove Heat Shield";
        btnRmH.className = "rimuovi-shield";
        btnRmH.onclick = () => {
            stage.heatShield = null;
            salvaEditorCorrente(false);
            aggiornaEditor();};
        hsFs.appendChild(btnRmH);
    } else {
        const btnAddH = document.createElement("button");
        btnAddH.textContent = "➕ Add Heat Shield";
        btnAddH.onclick = () => {
            salvaEditorCorrente();
            stage.heatShield = new HeatShield();
            aggiornaEditor(); };
        hsFs.append(btnAddH);
    }
    let paraReload = true;
    container.appendChild(hsFs);
    const pFs = document.createElement("fieldset");
    pFs.className = "parachute-block";
    const pLeg = document.createElement("legend");
    pLeg.textContent = "Parachute";
    pFs.append(pLeg);
    if (stage.parachute) {
        pFs.appendChild(createLabeledInput("Base Mass [kg]", stage.parachute.mass, "para-mass", 0, 1e6,true));
        const NumParLabel = createLabeledInput("Parachutes Number", stage.parachute.numParachutes, "para-num", 0, 100);
        pFs.appendChild(NumParLabel);
        NumParLabel.addEventListener("input", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        const parAreaLabel = createLabeledInput("Parachute Area [m²]", stage.parachute.areaParachute, "para-area", 0, 1e5);
        pFs.appendChild(parAreaLabel);
        parAreaLabel.addEventListener("input", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        const ParMatLabel = createSelect("Parachute Material",Object.keys(paraMaterialsMap),stage.parachute.parachuteMaterial,"para-material")
        pFs.appendChild(ParMatLabel);
        ParMatLabel.addEventListener("change", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        const ParGeoLabel = createSelect("Parachute Geometry", Object.keys(parastructureMap),stage.parachute.parachuteGeometry,"para-kind" )
        pFs.appendChild(ParGeoLabel);
        ParGeoLabel.addEventListener("change", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        pFs.appendChild(createLabeledInput("Max Deploy Altitude [m]", stage.parachute.maxDeployAltitude, "para-alt", 0, 2e5,true));
        pFs.appendChild(createLabeledInput("Max Deploy Speed [m/s]", stage.parachute.maxShipSpeed, "para-vmax", 0, 1e4,true));
        const fss4 = createSurfaceEditor(stage.parachute.surface, "para","Parachute","🔲 Parachute Deployer Surface");
        pFs.appendChild(fss4);
        fss4.querySelector(".para-height").addEventListener("input", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        fss4.querySelector(".para-diameter").addEventListener("input", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        fss4.querySelector(".para-spessore").addEventListener("input", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        fss4.querySelector(".para-material").addEventListener("change", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        fss4.querySelector(".para-kind").addEventListener("change", () => { ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));});
        fuelselect.addEventListener("change", () => AggiornaStruttureAssegnabiliCarburante(fss4));        
        AggiornaMaterialiAssegnabili(fss4);
        AggiornaStruttureAssegnabili(fss4);
        const btnRmP = document.createElement("button");
        btnRmP.textContent = "❌ Remove Paracadute";
        btnRmP.className = "rimuovi-paracadute";
        btnRmP.onclick = () => {
            stage.parachute = null;   
            salvaEditorCorrente();
            aggiornaEditor();};
        pFs.appendChild(btnRmP);
    } else {
        const btnAdP = document.createElement("button");
        btnAdP.textContent = "➕ Add Paracadute";
        btnAdP.onclick = () => {
            salvaEditorCorrente();
            stage.parachute = new Parachute();
            aggiornaEditor();};
        pFs.append(btnAdP);
        paraReload = false;
    }
    container.appendChild(pFs);
    if(paraReload) ricalcolaMassaAltitudineVelocitaParacadute(container.querySelector(".parachute-block"));
    return container;
}
function salvaEditorCorrente(saveOnShip = false) {
    function isValidMaterial(materiale,dati){
        const condizioni = estraiCondizioniDaMateriale(materiale);
        const condizioniFiltrate = condizioni.filter(c => c.component === dati.component &&(c.geometry === dati.geometry || c.geometry === "*"));
        if (condizioniFiltrate.length === 0) return false;
        const gruppi = {};
        for (const cond of condizioniFiltrate) {
            if (!gruppi[cond.geometry]) gruppi[cond.geometry] = [];
            gruppi[cond.geometry].push(cond);
        }
        for (const conds of Object.values(gruppi)) {
            const tutteValide = conds.every(({ condition }) => {
            if (!condition) return true;
            const match = condition.match(/^([\w_]+)\s*([=!<>]+)\s*(.+)$/);
            if (!match) return false;
            const [, varName, op, val] = match;
            let attuale, atteso;
            const parsedAttuale = parseFloat(dati[varName]);
            const parsedAtteso = parseFloat(val);
            if (isNaN(parsedAttuale) || isNaN(parsedAtteso)) {
                attuale = String(dati[varName]).trim();
                atteso = val.trim().replace(/^['"]|['"]$/g, '');
            } else {
                attuale = parsedAttuale;
                atteso = parsedAtteso;
            }
            switch (op) {
                case "<":  return attuale < atteso;
                case "<=": return attuale <= atteso;
                case ">":  return attuale > atteso;
                case ">=": return attuale >= atteso;
                case "=":  return attuale === atteso;
                case "!=":  return attuale !== atteso;
                default:   return false;
            }});
            if (tutteValide) return true
        }
        return false;
    }
    function isValidKind(geometry, dati) {
        const condizioni = estraiCondizioniDaStruttura(geometry);
        const condizioniFiltrate = condizioni.filter(c => c.component === dati.component &&(c.geometry === dati.geometry || c.geometry === "*"));
        if (condizioniFiltrate.length === 0) return false;
        const gruppi = {};
        for (const cond of condizioniFiltrate) {
            if (!gruppi[cond.geometry]) gruppi[cond.geometry] = [];
            gruppi[cond.geometry].push(cond);
        }
        for (const conds of Object.values(gruppi)) {
            const tutteValide = conds.every(({ condition }) => {
            if (!condition) return true;
            const match = condition.match(/^([\w_]+)\s*([=!<>]+)\s*(.+)$/);
            if (!match) return false;
            const [, varName, op, val] = match;
            let attuale, atteso;
            const parsedAttuale = parseFloat(dati[varName]);
            const parsedAtteso = parseFloat(val);
            if (isNaN(parsedAttuale) || isNaN(parsedAtteso)) {
                attuale = String(dati[varName]).trim();
                atteso = val.trim().replace(/^['"]|['"]$/g, '');
            } else {
                attuale = parsedAttuale;
                atteso = parsedAtteso;
            }
            switch (op) {
                case "<":  return attuale < atteso;
                case "<=": return attuale <= atteso;
                case ">":  return attuale > atteso;
                case ">=": return attuale >= atteso;
                case "=":  return attuale === atteso;
                case "!=":  return attuale !== atteso;
                default:   return false;
            }});
            if (tutteValide) return true
        }
        return false;
    }
    function isValidValue(value){
        return (!isNaN(value)&&isFinite(value)&&value!=null&&value>0&&value<1e10);
    }
    function isValidValueM0(value){
        return (!isNaN(value)&&isFinite(value)&&value!=null&&value<1e6);
    }
    let valid = false;
    const editor = document.querySelector(`.stage-editor[data-stage-index="${currentStageIndex}"]`);
    if (!editor) return alert("Error: Current stage not found");
    const stage = globalGameData?.Starship?.Stages[currentStageIndex];
    if (!stage) return alert("Error: Stage not found in memory");
    const getNumero = (selector, root = editor) => {
        const el = root.querySelector(selector);
        if (!el) return null;
        const val = parseFloat(el.value);
        return isNaN(val) ? null : val;};
    const massaBase = getNumero(".input-mass");
    const carburante = getNumero(".input-fuel");
    const carburanteTipo = editor.querySelector(".select-fuel-type")?.value;
    const superficie = editor.querySelector(".stage-surface-block");
    const altezza = getNumero(".stage-height");
    const tempmax = getNumero(".stage-tmax");
    const GLimit = getNumero(".stage-glimit");
    const Cd = getNumero(".stage-Cd");
    const diametro = getNumero(".stage-diameter");
    const kind = superficie?.querySelector(".stage-kind")?.value || "";
    const materiale = superficie?.querySelector(".stage-material")?.value || "";
    const spessore =  getNumero(".stage-spessore");
    let nEngine = null;
    let nParachute = null;
    let nHeatShield = null;
    const dati = {
        component: "Stage",
        geometry: kind,
        h: altezza,
        d: diametro,
        GLimit: GLimit,
        Tmax: tempmax,
        classeCarburante : fuelMap[carburanteTipo]?.class??"",
        spessorePercentuale : spessore,
        Cd: Cd,
        material: materiale,
        m: massaBase,
        massFuel: carburante,
        tipoCarburante: carburanteTipo
    };
    if(kind=="⚠ Unsuitable Structure!"||materiale=="⚠ Unsuitable Material!"||!isValidMaterial(materiale,dati)||!isValidKind(kind,dati)||!isValidValue(massaBase)||!isValidValue(altezza)||
    !isValidValue(tempmax)||!isValidValue(diametro)||!isValidValue(GLimit)||!isValidValue(Cd)||!isValidValue(spessore)||!isValidValueM0(carburante)){
        alert("Error: Some values of stage settings are invalid");
        return;
    }
    const engBlock = editor.querySelector(".engine-block");
    if (currentTempStage.Engine && engBlock) {
        const engSurf = engBlock.querySelector(".engine-surface-block");
        if (engSurf) {
            const sMass = getNumero(".engine-mass", engBlock);
            const sThrust = getNumero(".engine-thrust", engBlock);
            const sHeight = getNumero(".engine-height", engSurf);
            const sSpessore = getNumero(".engine-height", engSurf);
            const sDiameter = getNumero(".engine-diameter", engSurf);
            const sKind = engSurf.querySelector(".engine-kind")?.value;
            const sMaterial = engSurf.querySelector(".engine-material")?.value;
            const sTempMax = getNumero(".engine-tmax", engSurf);
            const sGLimit = getNumero(".engine-glimit", engSurf);
            const sCd = getNumero(".engine-Cd", engSurf);
            const sDati = {
                component: "Engine",
                geometry: sKind,
                h: sHeight,
                d: sDiameter,
                GLimit: sGLimit,
                Tmax: sTempMax,
                Cd: sCd,
                material: sMaterial,
                classeCarburante : fuelMap[carburanteTipo]?.class??"",
                spessorePercentuale : sSpessore,
                m: sMass,
                massFuel: carburante,
                tipoCarburante: carburanteTipo,
                N: sThrust,
            };
            if(sKind=="⚠ Unsuitable Structure!"||sMaterial=="⚠ Unsuitable Material!"||!isValidMaterial(sMaterial,sDati)||!isValidKind(sKind,sDati)||!isValidValue(sMass)||!isValidValue(sThrust)||
            !isValidValue(sHeight)||!isValidValue(sDiameter)||!isValidValue(sSpessore)||!isValidValue(sTempMax)||!isValidValue(sGLimit)||!isValidValue(sCd)
            ||!isValidValue(carburante)||carburanteTipo==""||carburanteTipo==null){
                alert("Error: Some values of engine settings are invalid");
                return;
            }else nEngine = new Engine(sMass,sThrust,0,true,0,carburanteTipo,new SurfaceData(sHeight,sDiameter,sKind,sCd,288.15,sTempMax,sMaterial,sGLimit,sSpessore));
        }else{
            alert("Error: Some values of engine settings are invalid");
            return;
        }
    }
    const hsBlock = editor.querySelector(".heat-shield-block");   
    if (currentTempStage.heatShield && hsBlock) {
        const hsSurf = hsBlock.querySelector(".shield-surface-block");
        if (hsSurf) {
            const sMass = getNumero(".shield-mass", hsBlock);
            const sHeight = getNumero(".shield-height", hsSurf);
            const sDiameter = getNumero(".shield-diameter", hsSurf);
            const sSpessore = getNumero(".shield-spessore", hsSurf);
            const sKind = hsSurf.querySelector(".shield-kind")?.value;
            const sMaterial = hsSurf.querySelector(".shield-material")?.value;
            const sTempMax = getNumero(".shield-tmax", hsSurf);
            const sGLimit = getNumero(".shield-glimit", hsSurf);
            const sCd = getNumero(".shield-Cd", hsSurf);
            const sDati = {
                component: "Heat Shield",
                geometry: sKind,
                h: sHeight,
                d: sDiameter,
                GLimit: sGLimit,
                spessorePercentuale : sSpessore,
                Tmax: sTempMax,
                classeCarburante : fuelMap[carburanteTipo]?.class??"",
                Cd: sCd,
                material: sMaterial,
                m: sMass,
            };
            if(sKind=="⚠ Unsuitable Structure!"||sMaterial=="⚠ Unsuitable Material!"||!isValidMaterial(sMaterial,sDati)||!isValidKind(sKind,sDati)||!isValidValue(sMass)||
            !isValidValue(sHeight)||!isValidValue(sDiameter)||!isValidValue(sSpessore)||!isValidValue(sTempMax)||!isValidValue(sGLimit)||!isValidValue(sCd)){
                alert("Error: Some values of heat shield settings are invalid");
                return;
            }else nHeatShield = new HeatShield(sMass,new SurfaceData(sHeight,sDiameter,sKind,sCd,288.15,sTempMax,sMaterial,sGLimit,sSpessore));
            
        }else{
            alert("Error: Some values of heat shield settings are invalid");
            return;
        }
    }
    const pBlock = editor.querySelector(".parachute-block"); 
    if (currentTempStage.parachute && pBlock) {
        const paraSurf = pBlock.querySelector(".para-surface-block");
        if (paraSurf) {
            const sMass = getNumero(".para-mass", pBlock);
            const sHeight = getNumero(".para-height", paraSurf);
            const sDiameter = getNumero(".para-diameter", paraSurf);
            const sKind = paraSurf.querySelector(".para-kind")?.value;
            const sSpessore = getNumero(".para-height", paraSurf);
            const sMaterial = paraSurf.querySelector(".para-material")?.value;
            const sTempMax = getNumero(".para-tmax", paraSurf);
            const sGLimit = getNumero(".para-glimit", paraSurf);
            const sCd = getNumero(".para-Cd", paraSurf);
            const sNumPara = getNumero(".para-num", pBlock);
            const sAreaPara = getNumero(".para-area", pBlock);
            const sMaxAltPara = getNumero(".para-alt", pBlock);
            const sMaxVelPara = getNumero(".para-vmax", pBlock);
            const sMaterialPara = pBlock.querySelector(".para-material").value;
            const sGeometryPara = pBlock.querySelector(".para-kind").value;
            const sDati = {
                component: "Parachute",
                geometry: sKind,
                h: sHeight,
                d: sDiameter,
                GLimit: sGLimit,
                Tmax: sTempMax,
                Cd: sCd,
                material: sMaterial,
                m: sMass,
                classeCarburante : fuelMap[carburanteTipo]?.class??"",
                spessorePercentuale : sSpessore,
                numParachutes: sNumPara,
                areaParachute: sAreaPara,
                materialeParachute: sMaterialPara,
                geometryParachute: sGeometryPara,
                maxParSpeed: sMaxVelPara,
                maxParHeigh: sMaxAltPara,
            };
            if(sKind=="⚠ Unsuitable Structure!"||sMaterial=="⚠ Unsuitable Material!"||!isValidMaterial(sMaterial,sDati)||!isValidKind(sKind,sDati)||!isValidValue(sMass)||
            !isValidValue(sHeight)||!isValidValue(sDiameter)||!isValidValue(sTempMax)||!isValidValue(sGLimit)||!isValidValue(sCd)
            ||!isValidValue(sAreaPara)||!isValidValue(sNumPara)||!isValidValue(sSpessore)||!isValidValue(sMaxAltPara)||!isValidValue(sMaxVelPara)
            ||sMaterialPara==""||sGeometryPara==null||sMaterialPara==null||sGeometryPara==""){
                alert("Error: Some values of heat shield settings are invalid");
                return;
            }else nParachute = new Parachute(sMass,sNumPara,sAreaPara,sMaxAltPara,sMaxVelPara,sMaterialPara,sGeometryPara,0,false,new SurfaceData(sHeight,sDiameter,sKind,sCd,288.15,sTempMax,sMaterial,sGLimit,sSpessore));   
        }else{
            alert("Error: Some values of parachute settings are invalid");
            return;
        }
    } 
    const cstage = currentTempStage;
    cstage.Engine = nEngine;
    cstage.parachute = nParachute;
    cstage.heatShield = nHeatShield;
    const nSurfaceData = new SurfaceData(altezza,diametro,kind,Cd,288.15,tempmax,materiale,GLimit,spessore);
    cstage.surface = nSurfaceData;
    cstage.mass = massaBase;
    cstage.tipoCarburante = carburanteTipo;
    cstage.quantitaCarburante = Number.isFinite(carburante) ? carburante : 0;
    if(cstage.quantitaCarburante>0&&cstage.tipoCarburante!=""&&cstage.tipoCarburante!=null){
        cstage.mass+=(cstage.quantitaCarburante * (fuelMap[cstage.tipoCarburante]?.density??0));
    }
    if(cstage.Engine) cstage.mass+=nEngine.mass;
    if(cstage.parachute) cstage.mass+=nParachute.mass;
    if(cstage.heatShield) cstage.mass+=nHeatShield.mass;
    if (globalGameData.Starship&&saveOnShip) {
        let isShipOnAStarbase = false;
        for (const planet of globalGameData.Star.planets){
            if(planet.name === globalGameData.Starship.relatedObject&&planet.spacebase) isShipOnAStarbase = true;
            else if(planet.moons){
                for (const moon of planet.moons){
                    if(moon.name === globalGameData.Starship.relatedObject&&moon.spacebase) isShipOnAStarbase = true;
                }
            }
        }
        if(globalGameData.Starship.ferma&&(globalGameData.Starship.TypeRelObj=="planet"||globalGameData.Starship.TypeRelObj=="moon")&&isShipOnAStarbase){
            globalGameData.Starship.mass = 0;
            globalGameData.Starship.Stages[currentStageIndex] = cstage;
            for (const stg of Object.values(globalGameData.Starship.Stages)) {
                globalGameData.Starship.mass += stg.mass || 0;        
            }
            return true;
        }
    }
    return false;
}