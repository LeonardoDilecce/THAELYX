/**
  * 
  * function ComputeAtmosphericMolarMass(composition)
  * 
  * Computes the effective molar mass (kg/mol) of a gas mixture using the
  * weighted average of the molar masses of its components.
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * The function accumulates:
  *
  *      total += percentage * molar_mass_gas
  *
  * and then normalizes by dividing by 100 (percentage scale)
  * and by 1000 to convert from g/mol to kg/mol.
  *
  * Parameters:
  *   composition - object containing gas percentages (0–100)
  *
  * Returns:
  *   Effective molar mass of the mixture (kg/mol)
  * -------------
  * Usage:
  *   const mw = physicsEngine.ComputeAtmosphericMolarMass(atmosphereComposition);
  * 
  **/
PhysicsEngine.prototype.ComputeAtmosphericMolarMass = function(
    composition
) 
{
    let total = 0;
    // Iterate through each gas in the mixture
    for (const gas in composition) 
    {
        // Molar mass of the gas (g/mol)
        const mw = gasThermalMap[gas].molarMass;
        // Accumulate weighted contribution: percentage * molar mass
        total += (composition[gas] * mw);
    }
    // Convert:
    //   - divide by 100 to normalize percentages
    //   - divide by 1000 to convert g/mol → kg/mol
    return total / 100 / 1000; 
}