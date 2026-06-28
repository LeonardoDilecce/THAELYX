// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
  * 
  * function ComputeAtmosphericSpecificHeat(
  *     composition
  * )
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
  *   const cp = physicsEngine.ComputeAtmosphericSpecificHeat(
  *       atmosphereComposition
  *   );
  * 
  **/
PhysicsEngine.prototype.ComputeAtmosphericSpecificHeat = function(
    composition
) 
{
    let total = 0;
    let totalPct = 0;
    // Iterate through each gas in the mixture
    // (percentages may not sum exactly to 100)
    for (const gas in composition) 
    {
        // Percentage of this gas in the mixture
        const pct = composition[gas];
        totalPct += pct;
    }
    // Avoid division by zero (empty or invalid composition)
    if (totalPct <= 0) return 0;
    // Weighted average Cp (J/kg·K)
    for (const gas in composition) 
    {
        // Specific heat capacity of the gas (J/kg·K)
        const cp = gasThermalMap[gas]?.specificHeat;
        if (!cp) continue; // Skip unknown gases
        // Percentage of this gas in the mixture
        const pct = composition[gas];
        // Normalized fraction (robust even if totalPct ≠ 100)
        const fraction = pct / totalPct;
        // Weighted contribution to Cp
        total += fraction * cp;
    }
    // Return weighted average Cp
    return total;
}
