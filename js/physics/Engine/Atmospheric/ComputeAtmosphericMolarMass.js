/**
  * 
  * function ComputeAtmosphericMolarMass(
  *     composition
  * )
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
  *   const mw = physicsEngine.ComputeAtmosphericMolarMass(
  *       atmosphereComposition
  *   );
  * 
  **/
PhysicsEngine.prototype.ComputeAtmosphericMolarMass = function(
    composition
) 
{
    // Compute total percentage (may not be exactly 100)
    let totalPct = 0;
    for (const gas in composition) 
    {
        totalPct += composition[gas];
    }
    // Avoid division by zero
    if (totalPct <= 0) 
    {
        return 0;
    }
    let total = 0;
    // Weighted average molar mass (kg/mol)
    for (const gas in composition) 
    {
        const pct = composition[gas];
        // Molar mass of the gas (g/mol) → convert to kg/mol
        const mw = gasThermalMap[gas]?.molarMass;
        if (!mw) 
        {
            continue; // skip unknown gases    
        }
        const fraction = pct / totalPct;   // normalized fraction
        total += fraction * (mw / 1000);   // convert g/mol → kg/mol
    }
    return total;
}