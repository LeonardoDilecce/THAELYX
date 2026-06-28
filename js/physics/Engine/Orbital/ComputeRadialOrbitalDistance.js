PhysicsEngine.prototype.ComputeRadialOrbitalDistance = function(
    a, 
    e, 
    anomaly
) 
{
    return a * (1 - e * e) / (1 + e * Math.cos(
        anomaly
    ));
}