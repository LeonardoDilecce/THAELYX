/**
  * 
  * function ComputeAtmosphericSpecificHeat(composition)
  * 
  * Computes the specific heat capacity at constant pressure (Cp) of a gas
  * mixture using a weighted average based on the composition percentages.
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * The function performs:
  *
  *      totalCp += Cp_gas * percentage
  *      totalPct += percentage
  *
  * and returns:
  *
  *      Cp_mix = totalCp / totalPct
  *
  * This ensures correct normalization even if the composition does not sum
  * exactly to 100%.
  *
  * Parameters:
  *   composition - object containing gas percentages (0–100)
  *
  * Returns:
  *   Specific heat capacity of the mixture (J/kg·K)
  * -------------
  * Usage:
  *   const cp = physicsEngine.ComputeAtmosphericSpecificHeat(atmosphereComposition);
  * 
  **/
PhysicsEngine.prototype.ComputeAtmosphericSpecificHeat = function(
    composition
) 
{
    let total = 0;
    let totalPct = 0;
    // Iterate through each gas in the mixture
    for (const gas in composition) 
    {
        // Specific heat capacity of the gas (J/kg·K)
        const cp = gasThermalMap[gas].specificHeat;
        // Percentage of this gas in the mixture
        const pct = composition[gas];
        // Weighted contribution to Cp
        total += cp * pct;
        // Track total percentage for normalization
        totalPct += pct;
    }
    // Return weighted average Cp
    // (works even if percentages do not sum exactly to 100)
    return total / totalPct;
}