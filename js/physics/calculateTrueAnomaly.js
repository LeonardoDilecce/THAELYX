function calculateTrueAnomaly(star, chronometer, a, e, t, M0 = 0, centralMass, planet, deltaTime, update = true) {
    const n = Math.sqrt(G * centralMass / Math.pow(a, 3));
    const M = (M0 + n * t) % (2 * Math.PI);
    const E = solveKepler(M, e);
    const theta = 2 * Math.atan2(
            Math.sqrt(1 + e) * Math.sin(E / 2),
            Math.sqrt(1 - e) * Math.cos(E / 2));
    let epsilon = (G * centralMass) / (a * c * c);
    if (epsilon > 0.1) epsilon =  0.1;
    let deltaPhi = (6 * Math.PI * G * centralMass) / (a * (1 - e * e) * c * c);
    epsilon /=100;
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    const period = 2 * Math.PI / n;
    let omega = deltaPhi / period;
    let v = r * omega;
    if (v >= c) {
        v = 0.9999 * c;
        omega = v / r;
        deltaPhi = omega * period;
    }
    const beta = Math.min(v / c, 0.9999);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    let thetaRel = ((theta) + (deltaPhi/gamma) * (t / (2 * Math.PI / n))) % (2 * Math.PI);
    if(update&&chronometer.speed!=0&&isFinite(chronometer.gamma)&&!isNaN(chronometer.gamma)){
        planet.a = a * (1 - 1.5 * epsilon); 
        planet.e = e * (1 - epsilon);
        planet.meanSpeed = Math.sqrt(G * centralMass / Math.pow(planet.a, 3));
        const EventHorizonRadius = (2 * G * centralMass) / (c * c);
        const distanceToCenter = Math.sqrt(planet.position.x*planet.position.x+planet.position.y*planet.position.y);
        if ((distanceToCenter <= EventHorizonRadius) && distanceToCenter != 0) {
            for (let i = 0; i < star.planets.length; i++) {
                if (star.planets[i].name === planet.name) {
                    star.planets.splice(i, 1);
                    console.log(`🕳️ ${planet.name} è stato assorbito dal buco nero.`);
                    break;
                }
            }
        }           
    }
    return thetaRel = (2 * Math.PI - thetaRel) % (2 * Math.PI);;      
}