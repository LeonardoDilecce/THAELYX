PhysicsEngine.prototype.simulateAtmosphericColumn = function(
    composition, 
    massPlanet,
    radiusPlanet,
    T_final,
    P_surface,
    altitudeStart = 0,
    altitudeEnd,
    step,
    baseDensity
) 
{

    const g  = (G * massPlanet) / Math.pow(radiusPlanet, 2);
    const μ  = this.ComputeAtmosphericMolarMass(composition);
    const cp = this.ComputeAtmosphericSpecificHeat(composition);
    const lapseRateDry = g / cp;
    const humidityFactor= this.ComputeAtmosphericHumidityFactor(composition);
    const lapseRate = lapseRateDry * (1 - 26.6 * humidityFactor);
    const results = [];
    let P_prev = P_surface;  
    let T_prev = T_final;
    for (let z = altitudeStart; z <= altitudeEnd; z += step) {
        const epsilon = 2.725;
        const delta   = T_prev - epsilon;
        const attenuatedLapse = lapseRate * Math.tanh(delta / 25);
        let T_z = T_prev - attenuatedLapse * step;
        if (T_z < epsilon) T_z = epsilon;
        const rho_prev = (P_prev * μ) / (R * T_prev);
        results.push({ altitude:z,T: T_z});
        T_prev = T_z;
    }
    return results;
} 