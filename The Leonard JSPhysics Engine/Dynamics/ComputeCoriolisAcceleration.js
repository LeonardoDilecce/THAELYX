// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeCoriolisAcceleration = function(
    relativeVelocity,
    omega
)
{
    return new Vector(
        -relativeVelocity.y, 
        relativeVelocity.x
    ).multiply(
        -2 * omega
    );
}