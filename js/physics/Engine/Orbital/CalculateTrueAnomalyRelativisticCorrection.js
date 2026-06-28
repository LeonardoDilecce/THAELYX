/**
  * 
  * function CalculateTrueAnomalyRelativisticCorrection(theta, a, e, t, centralMass)
  * 
  * Calculates the relativistic correction to the True Anomaly (ν) for a Keplerian orbit,
  * applying the General Relativity perihelion precession to the Newtonian true anomaly (θ).
  * ------------
  * 
  * Last Update: 2026-06-28
 * -------------
  * 
  * This function introduces the first‑order Schwarzschild relativistic correction:
  *
  *      Δφ = 6πGM / (a(1−e²)c²)
  *
  * The correction is applied as an additional angular drift accumulated over time,
  * scaled by the orbital period and the Lorentz factor γ, ensuring that the resulting
  * motion reproduces the characteristic GR perihelion advance (e.g., Mercury’s orbit).
  *
  * Parameters:
  *   theta       - Newtonian true anomaly (rad)
  *   a           - semi-major axis (m)
  *   e           - eccentricity
  *   t           - elapsed time (s)
  *   centralMass - mass of the central body (kg)
  *
  * Returns:
  *   Relativistically corrected true anomaly (rad)
  * -------------
  * Usage:
  *   const nuRel = physicsEngine.CalculateTrueAnomalyRelativisticCorrection(theta, a, e, t, centralMass);
  * 
  **/
PhysicsEngine.prototype.CalculateTrueAnomalyRelativisticCorrection = function(
    theta,
    a, 
    e,
    t,
    centralMass
) 
{
    // Mean motion n = sqrt(GM / a³)
    // Used to compute the orbital period and time scaling
    const n = Math.sqrt(G * centralMass / Math.pow(a, 3)); 
    // GR perihelion precession per orbit (Δφ)
    // Derived from the Schwarzschild metric (first-order approximation)
    let deltaPhi = (6 * Math.PI * G * centralMass) 
                   / (a * (1 - e * e) * c * c);
    // Instantaneous orbital radius r(θ)
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    // Orbital period (Newtonian)
    const period = 2 * Math.PI / n;
    // Angular drift rate ω associated with the GR precession
    let omega = deltaPhi / period;
    // Tangential velocity induced by the precession
    let v = r * omega;
    // Prevent unphysical superluminal velocities
    if (v >= c) 
    {
        v = this.maxRelativisticPrecision * c;
        omega = v / r;
        deltaPhi = omega * period; 
    }
    // β = v/c, clamped for numerical stability
    const beta = Math.min(v / c, this.maxRelativisticPrecision);
    // Lorentz factor γ = 1 / sqrt(1 − β²)
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    // Apply relativistic drift:
    // θ_rel = θ + (Δφ / γ) * (t / period)
    const thetaRel = (theta + (deltaPhi / gamma) * (t / period)) % (2 * Math.PI);
    // Normalize angle to 0–2π
    return (2 * Math.PI - thetaRel) % (2 * Math.PI);      
}