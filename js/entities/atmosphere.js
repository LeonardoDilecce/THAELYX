class Atmosphere{
    constructor(density = 0,scaleHeight= 0,maxAltitude= 0,molecularWeight= 0,color =  "#00000000",composition  = {},albedo = 0){
        this.density = density;
        this.scaleHeight = scaleHeight;
        this.maxAltitude = maxAltitude;
        this.molecularWeight = molecularWeight;
        this.color = color;
        this.composition = composition;
        this.albedo = albedo
        this.__type = "Atmosphere";
    }
    toJSON() {
        return {
            __type:  this.__type,
            density : this.density,
            scaleHeight : this.scaleHeight,
            maxAltitude : this.maxAltitude,
            composition : this.composition,
            molecularWeight : this.molecularWeight,
            albedo : this.albedo,
            color : this.color
        };
    }
    static fromJSON(data) {
        const a = new Atmosphere(data.density,data.scaleHeight,data.maxAltitude,data.molecularWeight,data.color,data.composition,data.albedo);
        return a;
    }
}