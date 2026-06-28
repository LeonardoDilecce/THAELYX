// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
  * 
  * function ComputeAtmosphericHumidityFactor(
  *     composition
  * )
  * 
  * Computes the weighted humidity factor of a gas mixture based on its
  * composition. Each gas contributes according to its percentage and its
  * predefined humidity coefficient stored in gasThermalMap.
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * The function iterates through the gas composition map and accumulates:
  *
  *      humidity_total += humidity_gas * (percentage / 100)
  *
  * where:
  *   - humidity_gas is the humidity coefficient of the gas
  *   - percentage is the gas fraction in the mixture (0–100)
  *
  * Parameters:
  *   composition - object containing gas percentages (e.g., { N2: 78, O2: 21, ... })
  *
  * Returns:
  *   Weighted humidity factor of the mixture (dimensionless)
  * -------------
  * Usage:
  *   const hum = physicsEngine.ComputeAtmosphericHumidityFactor(
  *       atmosphereComposition
  *   );
  * 
  **/
PhysicsEngine.prototype.ComputeAtmosphericHumidityFactor = function(
    composition
) {
    // Iterate through each gas in the mixture
    let total = 0;
    for (const gas in composition) 
    {
        // Humidity coefficient for the gas (0 if not defined)
        const humFactor = gasThermalMap[gas].humidity || 0;
        // Percentage of this gas in the mixture (0–100)
        const pct = composition[gas];
        // Weighted contribution: humidity_gas * (percentage / 100)
        total += humFactor * (pct / 100);
    }
    // Return the total humidity factor of the mixture
    return total; 
}