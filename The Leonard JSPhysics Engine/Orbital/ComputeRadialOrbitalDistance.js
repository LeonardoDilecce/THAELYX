// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeRadialOrbitalDistance = function(
    a, 
    e, 
    anomaly
) 
{
    return a * (1 - e * e) / (1 + e * Math.cos(
        anomaly
    ));
}