class SimulatorChronometer{
    constructor(year = 2000, month = 1, day = 1, hours = 12, minutes = 0, seconds = 0, speed = 1) {
        this.year = year
        this.month = month
        this.day = day
        this.hours = hours
        this.minutes = minutes
        this.seconds = seconds
        this.ryear = year
        this.rmonth = month
        this.rday = day
        this.rhours = hours
        this.rminutes = minutes
        this.rseconds = seconds
        this.speed = speed
        this.targetSpeed = speed;
        this.executing = true
        this.lastFrameTime = performance.now();
        this.time=0;
        this.gamma = 1;
        this.__type = "SimulatorChronometer";
    }
    static fromJSON(data) {
        const c = new SimulatorChronometer(data.year,data.month,data.day,data.hours,data.minutes,data.seconds,data.speed)
        c.executing = data.executing;
        c.lastFrameTime = performance.now();
        c.time = data.time;
        c.targetSpeed = data.targetSpeed;
        c.gamma = data.gamma;
        c.ryear = data.year,
        c.rmonth = data.month,
        c.rday = data.day,
        c.rhours = data.hours,
        c.rminutes =data. minutes,
        c.rseconds = data.seconds
        return c;
    }
    clone(){
        const c = new SimulatorChronometer(this.year,this.month,this.day,this.hours,this.minutes,this.seconds,this.speed);
        c.executing = this.executing;
        c.lastFrameTime = performance.now();
        c.time = this.time;
        c.targetSpeed = this.targetSpeed;
        c.gamma = this.gamma;
        c.ryear = this.year,
        c.rmonth = this.month,
        c.rday = this.day,
        c.rhours = this.hours,
        c.rminutes =this. minutes,
        c.rseconds = this.seconds
        return c;
    }
    toJSON() {
        return {
            __type:  this.__type,
            year:  this.year,
            month : this.month,
            day : this.day,
            hours : this.hours,
            minutes : this.minutes,
            seconds:  this.seconds,
            speed : this.speed,
            executing : this.executing,
            targetSpeed : this.targetSpeed,
            time : this.time,
            gamma : this.gamma,
            ryear : this.year,
            rmonth : this.month,
            rday : this.day,
            rhours : this.hours,
            rminutes :this. minutes,
            rseconds : this.seconds
        };
    }
}  