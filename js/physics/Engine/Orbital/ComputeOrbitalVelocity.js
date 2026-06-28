PhysicsEngine.prototype.ComputeOrbitalVelocity = function(
    radialDistance,
    mass,
    a
) 
{
    return Math.sqrt(G * mass * (2 / radialDistance - 1 / a)); 
}