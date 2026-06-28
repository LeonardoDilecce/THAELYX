// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
/**
  * 
  * function SolveKepler(
  *     M, 
  *     e
  * )
  * 
  * Solves Kepler’s Equation:
  *      M = E − e·sin(E)
  * for the Eccentric Anomaly (E), given:
  *   - M : Mean Anomaly (rad)
  *   - e : eccentricity
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * This function uses the Newton–Raphson iterative method:
  *      E_{n+1} = E_n − f(E)/f'(E)
  * where:
  *      f(E)  = E − e·sin(E) − M
  *      f'(E) = 1 − e·cos(E)
  *
  * The initial guess is chosen as:
  *   - E ≈ M for e < 0.8 (fast convergence)
  *   - E ≈ π for high eccentricity (more stable)
  *
  * Iteration continues until |ΔE| < tolerance or the maximum number
  * of iterations is reached.
  * -------------
  * Usage:
  *   const E = physicsEngine.SolveKepler(
  *       M, 
  *       e
  *   );
  * 
  **/

PhysicsEngine.prototype.SolveKepler = function(
    M, 
    e
) 
{
    // Initial guess:
    // For low eccentricity, E ≈ M converges molto velocemente.
    // Per e > 0.8, M è pessimo: usare π è più stabile.
    let E = e < 0.8 ? M : Math.PI;
    let delta = 0;   
    let iteration = 0;
    // Newton–Raphson iteration for Kepler's equation:
    // E_{n+1} = E_n - (E - e*sin(E) - M) / (1 - e*cos(E))
    do 
    {
        delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= delta;
    } 
    while (
        Math.abs(delta) > this.keplerTolerance 
        && ++iteration < this.maxKeplerSolverIterations
    );
    // Returns the Eccentric Anomaly found
    return E;  
}