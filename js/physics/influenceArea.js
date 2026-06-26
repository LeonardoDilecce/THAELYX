function reloadInfluenceArea(starship, star) 
{
    if(starship&&star){
        const StashipX = starship.position.x;
        const StashipY = starship.position.y;
        let find = false;
        let PlausibileMoons = [];
        var MaxPlanetaryForce = 0.0;
        for(const planet of star.planets){
            const PlanetX = planet.position.x;
            const PlanetY = planet.position.y;
            const influenceAreaRadius = planet.influenceAreaRadius;
            const dx = StashipX - PlanetX;
            const dy = StashipY - PlanetY;
            const dist2 = dx*dx + dy*dy;
            const force = planet.mass / dist2;
            if(dist2 <= influenceAreaRadius * influenceAreaRadius){
                PlausibileMoons.push(...planet.moons);
                if(force>MaxPlanetaryForce){
                    find = true;
                    MaxPlanetaryForce = force;
                    starship.relatedObject = planet.name;
                    starship.relativePosition = {x:dx,y:dy};
                    starship.TypeRelObj = "planet";
                }
            }
            var MaxMoonInfForce = 0.0;    
            var findMoon = false;
            for(const moon of PlausibileMoons){
                const MoonX = moon.position.x;
                const MoonY = moon.position.y;
                const MoonInfluenceRadius = moon.influenceAreaRadius;
                const Mdx = StashipX - MoonX;
                const Mdy = StashipY - MoonY;
                const dist2 = Mdx*Mdx + Mdy*Mdy;
                const force = moon.mass / dist2;
                if((dist2 <= MoonInfluenceRadius * MoonInfluenceRadius)&&force>MaxMoonInfForce){     
                    findMoon = true;               
                    starship.relatedObject = moon.name;
                    starship.relativePosition = {x:Mdx,y:Mdy};
                    starship.TypeRelObj = "moon";
                    MaxMoonInfForce = force;
                }
            } 
        }
        if(!find&&!findMoon){
            const Sdx = StashipX- star.position.x;
            const Sdy = StashipY - star.position.y;
            const dist2 = Sdx*Sdx + Sdy*Sdy;
            if(dist2 <= star.influenceAreaRadius * star.influenceAreaRadius){
                starship.relatedObject = star.name;
                starship.relativePosition = {x:Sdx,y:Sdy};
                starship.TypeRelObj = "star";
                const distance = Math.sqrt(dist2);
                if(distance<=star.radius+star.corona.maxAltitude){
                    starship = null;
                }
            }else{
                const Gdx = StashipX;
                const Gdy = StashipY;
                starship.relatedObject = "Interstellar Space";
                starship.TypeRelObj = "";
                starship.relativePosition = {x:Gdx,y:Gdy};
            }
        }
    }
}