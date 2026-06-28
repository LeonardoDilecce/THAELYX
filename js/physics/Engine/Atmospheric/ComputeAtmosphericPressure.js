PhysicsEngine.prototype.ComputeAtmosphericPressure = function(
    rho, 
    T, 
    composition
) 
{
    const M = physicsEngine.ComputeAtmosphericMolarMass(
        composition
    );
    const Rgas = this.ℛ / M;
    return rho * Rgas * T;
}