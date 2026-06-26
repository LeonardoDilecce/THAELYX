class Camera{
    constructor(){
        this.position= { x: 0, y: 0 };
        this.scale =  1e-9;
        this.target =  null;
        this.__type =  "Camera";
    }
    static fromJSON(data) {
        const c = new Camera()
        c.position = data.position;
        c.scale = data.scale;
        c.target = data.target;
        return c;
    }
    clone(){
        const c = new Camera()
        c.position = this.position;
        c.scale = this.scale;
        c.target = this.target;
        return c;
    }
    toJSON() {
        return {
            __type:  this.__type,
            position:  this.position,
            scale : this.scale,
            target : this.target,
        };
    }
}