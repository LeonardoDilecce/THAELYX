/**
  * 
  * function ComputeAtmosphericColumn(
  *     composition,
  *     planetMass, 
  *     planetRadius,
  *     T_final, 
  *     P_surface, 
  *     altitudeStart,                            
  *     altitudeEnd, 
  *     baseDensity
  * )
  * 
  * Computes a vertical atmospheric temperature profile (atmospheric column)
  * using a simplified lapse-rate-based model. The simulation integrates
  * temperature with altitude from altitudeStart to altitudeEnd, applying
  * humidity‑dependent lapse rate attenuation.
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * The model uses:
  *   - Constant gravitational acceleration at the surface
  *   - Effective molar mass of the gas mixture
  *   - Specific heat capacity Cp of the mixture
  *   - Dry adiabatic lapse rate Γ_d = g / Cp
  *   - Humidity‑scaled lapse rate to approximate moist‑air behavior
  *   - Hyperbolic tangent attenuation to prevent unrealistic cooling
  *
  * At each altitude step:
  *   1. The lapse rate is attenuated based on the current temperature
  *   2. Temperature is updated: T(z+Δz) = T(z) − Γ(z)·Δz
  *   3. Temperature is clamped to a minimum threshold
  *   4. Density is computed using the ideal gas law (for future extensions)
  *
  * Parameters:
  *   composition   - gas composition map (percentages 0–100)
  *   planetMass    - mass of the planet (kg)
  *   planetRadius  - radius of the planet (m)
  *   T_final       - initial temperature at altitudeStart (K)
  *   P_surface     - pressure at altitudeStart (Pa)
  *   altitudeStart - starting altitude (m)
  *   altitudeEnd   - ending altitude (m)
  *   baseDensity   - reference density (unused placeholder for extensions)
  *
  * Returns:
  *   Array of objects: [{ altitude: z, T: temperature_at_z }, ...]
  * -------------
  * Usage:
  *   const column = physicsEngine.ComputeAtmosphericColumn(
  *       composition, 
  *       planetMass, 
  *       planetRadius,
  *       T0, 
  *       P0, 
  *       0, 
  *       50000,
  *       baseDensity
  *   );
  * 
  **/

PhysicsEngine.prototype.ComputeAtmosphericColumn = function(
    composition, 
    planetMass,
    planetRadius,
    T_final,
    P_surface,
    altitudeStart,
    altitudeEnd,
    baseDensity
) 
{

    // Gravitational acceleration at the surface (assumed constant)
    const g  = (this.G * planetMass) / Math.pow(planetRadius, 2);
    // Effective molar mass of the atmospheric mixture (kg/mol)
    const μ  = this.ComputeAtmosphericMolarMass(composition);
    // Specific heat capacity Cp of the mixture (J/kg·K)
    const cp = this.ComputeAtmosphericSpecificHeat(composition);
    // Dry adiabatic lapse rate Γ_d = g / Cp
    const lapseRateDry = g / cp;
    // Humidity factor modifies the lapse rate (moist air cools more slowly)
    const humidityFactor= this.ComputeAtmosphericHumidityFactor(composition);
    // Final lapse rate used in the simulation (scaled + humidity correction)
    const lapseRate = lapseRateDry * (this.atmosphericColumnSimulationLapseRateFactor * humidityFactor);
    const results = [];
    // Initial pressure and temperature at the starting altitude
    let P_prev = P_surface;  
    let T_prev = T_final;
    // Integrate the atmospheric column from altitudeStart to altitudeEnd
    for (let z = altitudeStart; z <= altitudeEnd; z += this.atmosphericColumnSimulationStep) 
    {
        // Temperature difference used to attenuate the lapse rate
        const delta   = T_prev - this.atmosphericColumnSimulationEpsilon;
        // Smooth attenuation using tanh() to avoid unrealistic cooling near low temperatures
        const attenuatedLapse = lapseRate * Math.tanh(delta / this.atmosphericColumnSimulationLapseRateAttenuation);
        // New temperature at altitude z
        let T_z = T_prev - attenuatedLapse * this.atmosphericColumnSimulationStep;
         // Prevent temperature from dropping below a physical minimum
        if (T_z < this.atmosphericColumnSimulationEpsilon)
        {
            T_z = this.atmosphericColumnSimulationEpsilon;
        }
        // Density at previous layer (ideal gas law)
        const rho_prev = (P_prev * μ) / (this.ℛ * T_prev);
        // Store computed values for this altitude
        results.push({ altitude:z,T: T_z});
        // Prepare for next iteration
        T_prev = T_z;
    }
    return results;
} 