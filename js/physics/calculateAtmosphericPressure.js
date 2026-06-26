function calculateAtmosphericPressure(rho, T, composition) {
    const R_univ = 8.314462618;
    const M = calculateMeanMolarMass(composition);
    const Rgas = R_univ / M;
    return rho * Rgas * T;
}