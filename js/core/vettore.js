// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Leonardo Dilecce
class Vettore 
{
    constructor(x = 0, y = 0, origine = { x: 0, y: 0 }) {
        this.x = x;
        this.y = y;
        this.origine = { ...origine };
        this.__type = "Vettore";
    }
    toJSON() {
        return {
            __type:  this.__type,
            x:  this.x,
            y:  this.y,
            origine : this.origine,
        };
    }
    static fromJSON(data) {
        const v = new Vettore(data.x,data.y,data.origine)
        return v;
    }
    get destinazione() {
        return {
            x: this.origine.x + this.x,
            y: this.origine.y + this.y
        };
    }
    get verso() {
        return Math.atan2(this.y, this.x);
    }

    modulo() {
        return Math.hypot(this.x, this.y);
    }


    ruotato(angolo) {
        const cos = Math.cos(angolo);
        const sin = Math.sin(angolo);
        return new Vettore(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.origine
        );
    }
    clone() {
        return new Vettore(this.x, this.y, this.origine);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }
}