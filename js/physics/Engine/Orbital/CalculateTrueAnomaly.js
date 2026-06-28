/**
  * 
  * function CalculateTrueAnomaly(
  *     a, 
  *     e, 
  *     t, 
  *     M0, 
  *     centralMass
  * )
  * 
  * Calculates the True Anomaly (ν) for a Keplerian orbit given:
  *   - a           : semi-major axis (m)
  *   - e           : eccentricity
  *   - t           : elapsed time (s)
  *   - M0          : initial mean anomaly at t = 0 (rad)
  *   - centralMass : mass of the central body (kg)
  * ------------
  * 
  * Last Update: 2026-06-28
  * -------------
  * 
  * This function performs classical Keplerian propagation:
  *   1. Computes the mean motion n = sqrt(GM / a³)
  *   2. Evaluates the Mean Anomaly M(t) = M0 + n·t
  *   3. Solves Kepler’s equation M = E − e·sin(E) to obtain the Eccentric Anomaly (E)
  *   4. Converts E → ν (True Anomaly) using the standard orbital geometry relation:
  *        tan(ν/2) = sqrt((1+e)/(1−e)) * tan(E/2)
  *
  * The returned value represents the Newtonian (non‑relativistic) true anomaly.
  * -------------
  * Usage:
  *   const nu = physicsEngine.CalculateTrueAnomaly(
  *       a,
  *       e, 
  *       t, 
  *       M0, 
  *       centralMass
  *   );
  * 
  **/
PhysicsEngine.prototype.CalculateTrueAnomaly = function(
    a, 
    e, 
    t, 
    M0,
    centralMass
) 
{
    // Mean motion (rad/s): orbital angular velocity in Keplerian motion
    const n = Math.sqrt(this.G * centralMass / Math.pow(a, 3)); 
    // Mean anomaly at time t (wrapped to 0–2π)
    const M = (M0 + n * t) % (2 * Math.PI);
    // Solve Kepler's equation to obtain the Eccentric Anomaly E 
    const E = this.SolveKepler(M, e);
    // Convert Eccentric Anomaly → True Anomaly (ν)
    // Formula derived from orbital geometry:
    // tan(ν/2) = sqrt((1+e)/(1-e)) * tan(E/2)
    return 2 * Math.atan2(
            Math.sqrt(1 + e) * Math.sin(E / 2),
            Math.sqrt(1 - e) * Math.cos(E / 2)
    );
}