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
    normSquared() {
        const dx = this.x - this.origine.x;
        const dy = this.y - this.origine.y;
        return dx * dx + dy * dy;
    }
    modulo() {
        let x = Number(this.x);
        let y = Number(this.y);
        if (!isFinite(x)) x = 0;
        if (!isFinite(y)) y = 0;
        const xx = Math.abs(x) < 1e-15 ? 0 : x;
        const yy = Math.abs(y) < 1e-15 ? 0 : y;
        return Math.sqrt(xx * xx + yy * yy);
    }
    normalized(v) {
        const length = Math.hypot(v.x, v.y);
        if (length === 0) return { x: 0, y: 0 };
        const originx = v.origine.x;
        const originy = v.origine.y;
        return new Vettore(
            v.x / length,
            v.y / length,{originx,originy}
        );
    }
    get verso() {
        return Math.atan2(this.y, this.x);
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
    scale(fattore) {
        return new Vettore(this.x * fattore, this.y * fattore, { ...this.origine });
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
    normalize() {
        return this.divide(this.modulo || 1);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    setOrigine(x, y) {
        this.origine.x = x;
        this.origine.y = y;
        return this;
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = this.x * cos - this.y * sin;
        const ny = this.x * sin + this.y * cos;
        this.x = nx;
        this.y = ny;
        return this;
    }
    static fromPoints(p1, p2) {
        return new Vettore(p2.x - p1.x, p2.y - p1.y, p1);
    }
    static fromAngle(angle, modulo = 1, origine = { x: 0, y: 0 }) {
        return new Vettore(Math.cos(angle) * modulo, Math.sin(angle) * modulo, origine);
    }
}