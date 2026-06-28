/**
  * 
  * function ComputeAtmosphericPressure(
  *     rho,
  *     T,
  *     composition
  * )
  *
  * Computes the atmospheric pressure using the ideal gas law:
  * 
  *      P = ρ · R_gas · T
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * where:
  *   - ρ is the density of the gas mixture (kg/m³)
  *   - T is the absolute temperature (K)
  *   - R_gas = R_universal / M is the specific gas constant (J/kg·K)
  *   - M is the molar mass of the mixture (kg/mol)
  *
  * The function retrieves the effective molar mass of the atmosphere
  * from the current gas composition and computes the corresponding
  * specific gas constant. The resulting pressure is expressed in Pascal (Pa).
  *
  * Parameters:
  *   rho         - gas density (kg/m³)
  *   T           - temperature (K)
  *   composition - gas composition map (percentages 0–100)
  *
  * Returns:
  *   Atmospheric pressure in Pascal (Pa)
  *
  * Usage:
  *   const P = physicsEngine.ComputeAtmosphericPressure(
  *     rho, 
  *     T, 
  *     composition
  *   );
  *
  */
PhysicsEngine.prototype.ComputeAtmosphericPressure = function(
    rho, 
    T, 
    composition
)
{
    // Compute molar mass of the mixture (kg/mol)
    const M = physicsEngine.ComputeAtmosphericMolarMass(
        composition
    );
    // Specific gas constant for the mixture
    const Rgas = this.ℛ / M;
    // Ideal gas law: P = ρ R T
    return rho * Rgas * T;
};