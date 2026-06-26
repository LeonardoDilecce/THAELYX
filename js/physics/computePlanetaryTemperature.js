function computePlanetaryTemperature(composition, luminosity, distance, albedo = 0.3,density_atm = 1.04125e4,molecularWeight = null, scaleHeight = null,massPlanet, radiusPlanet,baseDensity,maxAltitude,pressure,relativeAltitude) {
    const T_eq = Math.pow(((1 - albedo) * luminosity) / (16 * Math.PI * S * Math.pow(distance, 2)),0.25);
    let f_GH = 0;
    const M_0 = baseDensity*scaleHeight;
    if(density_atm<=0) return 2.725;
    let radiativeWm2 = 0;
    const density_atm_2 = density_atm * scaleHeight;
    const ratioMass = density_atm_2 / M_0;
    const M_eff = ratioMass / (1 + ratioMass);
    for (const gas in composition) {
        const props = gasThermalMap[gas];
        if (!props) continue;
        const value = composition[gas];
        radiativeWm2 += (props.radiativeForce * value/100)*M_eff;
        const scaled = Math.log1p(value);
        f_GH += props.greenhouse * scaled;
    }
    const T_radiative = T_eq + (radiativeWm2 / (4 * S)) ** 0.25 - T_eq;
    const greenhouseTerm = 1 + D * f_GH * M_eff;
    const T_final = T_eq * Math.pow(greenhouseTerm, 0.25) + T_radiative;
    const testResult = simulateAtmosphericColumn(composition,massPlanet,radiusPlanet,T_final,pressure,0,maxAltitude,1,density_atm);
    let bestMatch = testResult[0];
    let minDiff = Math.abs(testResult[0].altitude - relativeAltitude);
    for (const entry of testResult) {
        const diff = Math.abs(entry.altitude -  relativeAltitude);
        if (diff < minDiff) {
            bestMatch = entry;
            minDiff = diff;
        }
    }
    const tempBase = bestMatch.T;
    const b = tempBase;
    return tempBase;
}  