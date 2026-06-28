// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeCentrifugalAcceleration = function(
    relativePositionX,
    relativePositionY,
    omega
)
{
    return new Vector(
        relativePositionX, 
        relativePositionY
    ).multiply(
        omega * omega
    );
}