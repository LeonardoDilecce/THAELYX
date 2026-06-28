// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeOrbitalVelocity = function(
    radialDistance,
    mass,
    a
) 
{
    return Math.sqrt(G * mass * (2 / radialDistance - 1 / a)); 
}