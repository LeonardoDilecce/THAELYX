class HeatShield{
    constructor(mass = 0,surface = new SurfaceData()){
        this.mass = mass;
        this.surface = surface;
        this.__type = "HeatShield";
    }
    clone(){
        return new HeatShield(this.mass,this.surface.clone());
    }
    toJSON() {
        return {
            __type:  this.__type,
            mass:  this.mass,
            surface : this.surface.toJSON(),
        };
    }
    static fromJSON(data) {
        if(data!= null){
            const p = new HeatShield(data.mass);
            p.surface = SurfaceData.fromJSON(data.surface);
            return p;
        }else return null;   
    }
}