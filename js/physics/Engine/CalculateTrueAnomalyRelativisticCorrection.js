PhysicsEngine.prototype.CalculateTrueAnomalyRelativisticCorrection = function(
    theta,
    a, 
    e,
    t,
    centralMass
) 
{
    const n = Math.sqrt(G * centralMass / Math.pow(a, 3)); 
    let epsilon = (G * centralMass) / (a * c * c);
    if (epsilon > 0.1) 
    {
        epsilon = 0.1;
    }
    epsilon /=100;
    let deltaPhi = (6 * Math.PI * G * centralMass) 
                   / (a * (1 - e * e) * c * c);
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    const period = 2 * Math.PI / n;
    let omega = deltaPhi / period;
    let v = r * omega;
    if (v >= c) 
    {
        v = 0.9999 * c;
        omega = v / r;
        deltaPhi = omega * period;
    }
    const beta = Math.min(v / c, 0.9999);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    let thetaRel = ((theta) + (deltaPhi/gamma) * (t / (2 * Math.PI / n))) % (2 * Math.PI);
    return thetaRel = (2 * Math.PI - thetaRel) % (2 * Math.PI);;      
}