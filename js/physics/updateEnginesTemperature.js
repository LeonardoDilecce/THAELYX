function updateEnginesTemperature(distanza, surface, rho, v, area, deltaTime,massa, cp_surface, k = 1.83e-5, targetAtmosphere, combustibileBruciato, carburanteNome,targetMass, targetRadius, targetDistance,clone = false) {
    const σ = 5.67e-8;
    const ε_surface = materialCpMap[surface.material]?.ε ?? 0.8;
    const T0 = surface.T0 ?? surface.actualTemperature ?? 288.15;
    const composition = targetAtmosphere?.composition ?? {"O" : 0};
    const cp_gas = calculateGasCp(composition);
    let newTStatic = 2.725;
    let Tenv = newTStatic + v * v / (2 * cp_gas);
    if (rho === 0 || composition.length === 0) Tenv = 2.725;
    const cv = fuelMap[carburanteNome]?.cv ?? 43e6;
    const η = hullStructureMap[surface.kind]?.η ?? 0.3;
    const energiaCombustione = cv * combustibileBruciato * (1 - η);
    let P_rad_out = ε_surface * σ * area * (T0 ** 4 - Tenv ** 4);
    surface.actualTemperature += (energiaCombustione-P_rad_out) / (massa * cp_surface);
    if(surface.actualTemperature <2.725) surface.actualTemperature = 2.725;
}