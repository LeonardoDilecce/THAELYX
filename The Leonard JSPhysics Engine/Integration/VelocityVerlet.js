// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
PhysicsEngine.prototype.VelocityVerlet = function(
    position, 
    velocity, 
    a0, 
    a1, 
    deltaTime
)
{
    const newPos = new Vector(
        position.x + velocity.x * deltaTime + 0.5 * a0.x * deltaTime * deltaTime,
        position.y + velocity.y * deltaTime + 0.5 * a0.y * deltaTime * deltaTime
    );
    const newVel = new Vector(
        velocity.x + 0.5 * (a0.x + a1.x) * deltaTime,
        velocity.y + 0.5 * (a0.y + a1.y) * deltaTime
    );
    return { 
        position: newPos, 
        velocity: newVel 
    };
}