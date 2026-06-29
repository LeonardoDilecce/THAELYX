// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeGravity = function(
    mass,
    x,
    y
) 
{
    return this.G * mass / (x*x + y*y);
}