// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.ComputeDistance = function(
    x,
    y
)
{
    return Math.sqrt(
        x*x + y*y
    );
}