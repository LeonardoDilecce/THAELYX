function simulateAtmosphericColumn(composition, massPlanet,radiusPlanet,T_final,P_surface,altitudeStart = 0,altitudeEnd,step,baseDensity) {
    function calcolaMassaMolareMedia2(composition) {
        let sum = 0;
        for (const gas in composition) {
            const mw = gasThermalMap[gas].molarMass;
            sum += (composition[gas] * mw);
        }
        return sum / 100 / 1000; 
    }
    function calcolaCpMedia2(composition) {
        let sum = 0;
        let totalPct = 0;
        for (const gas in composition) {
            const cp = gasThermalMap[gas].specificHeat;
            const pct = composition[gas];
            sum += cp * pct;
            totalPct += pct;
        }
        return sum / totalPct;
    }
    function calcolaUmiditàAtmosferica(composition) {
        let total = 0;
        for (const gas in composition) {
            const humFactor = gasThermalMap[gas].humidity || 0;
            const pct = composition[gas];
            total += humFactor * (pct / 100);
        }
        return total; 
    }
    const g  = (G * massPlanet) / Math.pow(radiusPlanet, 2);
    const μ  = calcolaMassaMolareMedia2(composition);
    const cp = calcolaCpMedia2(composition); 
    const lapseRateDry = g / cp; 
    const humidityFactor= calcolaUmiditàAtmosferica(composition);
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