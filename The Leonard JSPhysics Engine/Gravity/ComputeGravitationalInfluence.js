// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
 * 
 * function ComputeGravitationalInfluence(
 *     mass, 
 *     x1, 
 *     y1, 
 *     x2, 
 *     y2
 * )
 * 
 * Computes the gravitational influence exerted by a body of given mass
 * at a point in 2D space, using the simplified inverse‑square relation:
 *
 *      influence = mass / r²
 *
 * This is a lightweight helper used for dominance checks, SOI logic,
 * and approximate gravitational comparisons.
 * ------------
 * 
 * Last Update: 2026-06-28
 * -------------
 * 
 * Parameters:
 *   mass - mass of the attracting body (kg)
 *   x1,y1 - coordinates of the source body
 *   x2,y2 - coordinates of the target point
 *
 * Returns:
 *   Gravitational influence value (dimensionless)
 * -------------
 * Usage:
 *   const F = physicsEngine.ComputeGravitationalInfluence(
 *       m, 
 *       x1, 
 *       y1, 
 *       x2, 
 *       y2
 *   );
 * 
 **/
PhysicsEngine.prototype.ComputeGravitationalInfluence = function(
    mass,
    x1, 
    y1,
    x2, 
    y2
) 
{
    // Vector difference between the two points
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Squared distance (avoids expensive sqrt)
    const dist2 = dx * dx + dy * dy;
    // Influence proportional to mass / r²
    return mass / dist2;
}
