class SurfaceData{
    constructor(height = 0, diameter = 0, kind = "",Cd=0,actualTemperature = 288.15,maxTemperature = 0,material = "",GLimit = 0,spessorePercentuale = 0){
        this.height = height;
        this.diameter = diameter;
        this.kind =kind;
        this.Cd= Cd;
        this.actualTemperature = actualTemperature;
        this.maxTemperature = maxTemperature;
        this.material = material;
        this.energiaTotale = 0;
        this.T0 =actualTemperature;
        this.spessorePercentuale = spessorePercentuale;
        this.GLimit = GLimit;
        const dati = [this.height, this.diameter, this.kind,this.Cd, this.material,this.GLimit].join("|");
        const Char = Math.random().toString(36).substring(2, 12) + Date.now();
        const base = btoa(unescape(encodeURIComponent(dati + "|" + Char)));
        this.id= ("srf_" + base.replace(/[^a-zA-Z0-9]/g, "")).padEnd(128, "x").substring(0, 128);
        this.__type = "Surface";
    }
    clone(){
        const s=new SurfaceData(this.height,this.diameter,this.kind,this.Cd,this.actualTemperature,this.maxTemperature,this.material,0,this.spessorePercentuale);
        s.energiaTotale = this.energiaTotale;
        s.id = this.id;
        s.T0 = this.T0;
        return s;
    }
    toJSON() {
        return {
            __type:  this.__type,
            height:  this.height,
            diameter : this.diameter,
            kind : this.kind,
            Cd : this.Cd,
            GLimit : this.GLimit,
            T0 : this.T0,
            actualTemperature : this.actualTemperature,
            energiaTotale : this.energiaTotale,
            maxTemperature : this.maxTemperature,
            material : this.material,
            spessorePercentuale : this.spessorePercentuale,
            id : this.id
        };
    }
    static fromJSON(data) {
        const s = new SurfaceData(data.height,data.diameter,data.kind,data.Cd,data.actualTemperature,data.maxTemperature,data.material,data.GLimit,data.spessorePercentuale);
        s.id = data.id;
        s.energiaTotale = data.energiaTotale;
        s.T0 = data.T0;
        return s;
    }
}