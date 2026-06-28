PhysicsEngine.prototype.CalculateTrueAnomaly = function(
    star, 
    chronometer, 
    a, 
    e, 
    t, 
    M0 = 0, 
    centralMass, 
    planet, 
    deltaTime
) 
{
    const n = Math.sqrt(G * centralMass / Math.pow(a, 3)); 
    const M = (M0 + n * t) % (2 * Math.PI); 
    const E = this.SolveKepler(M, e);
    return 2 * Math.atan2(
            Math.sqrt(1 + e) * Math.sin(E / 2),
            Math.sqrt(1 - e) * Math.cos(E / 2)
    );
}