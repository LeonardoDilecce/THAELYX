function updateReentryTemperature(distanza, surface, rho, v, area, deltaTime,massa, cp_surface, k = 1.83e-5,targetAtmosphere, clone = false,targetMass = 0, targetRadius = 0, targetDistance = 0) {
    const σ = 5.67e-8;
    const ε_surface = materialCpMap[surface.material]?.ε ?? 0.8;
    let Tenv = 2.725; 
    if (targetAtmosphere && targetAtmosphere.composition) {
        const composition = targetAtmosphere.composition;
        const cp_gas = calculateGasCp(composition);
        const pressure = calculateAtmosphericPressure(rho, 288.15, composition);
        const T0 = surface.T0 ?? surface.actualTemperature ?? 288.15;
        let newTStatic = 2.725;
        if (!clone)  newTStatic = computePlanetaryTemperature( composition, globalGameData.Star.luminosity, targetDistance,  targetAtmosphere.albedo,  rho,  targetAtmosphere.molecularWeight, targetAtmosphere.scaleHeight, targetMass, targetRadius,targetAtmosphere.density,   targetAtmosphere.maxAltitude,  pressure,distanza);
        Tenv = newTStatic + v * v / (2 * cp_gas);
        if (rho === 0) Tenv = 2.725;
    }
    const T0 = surface.T0 ?? surface.actualTemperature ?? 288.15;
    let P_rad_out = ε_surface * σ * area * (T0 ** 4 - Tenv ** 4);
    if (Tenv > 6000) k = 1.83e-4;
    else k = 1.83e-5;
    const q_conv = k * Math.sqrt(rho) * v ** 3;
    const E_conv = q_conv * area * deltaTime;
    const C = 1.83e-4;
    const q_rad_real = C * Math.sqrt(rho / surface.diameter) * v ** 3;
    let E_rad_in = q_rad_real * area * deltaTime;
    function CalcolaRadiazioneOutputRientro(P_rad_out) {
        return Math.max(P_rad_out * 0.0002384216, 1e-4);
    }
    if (Tenv > 6000) P_rad_out = CalcolaRadiazioneOutputRientro(P_rad_out);
    const E_rad_out = P_rad_out * deltaTime;
    const E_abs = E_conv + E_rad_in;
    const ΔE = E_abs - E_rad_out;
    surface.energiaTotale = (surface.energiaTotale ?? 0) + (isFinite(ΔE) ? ΔE : 0);
    surface.actualTemperature = T0 + surface.energiaTotale / (massa * cp_surface);
    if(surface.actualTemperature <2.725) surface.actualTemperature = 2.725;
}