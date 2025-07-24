//Inspired by https://editor.p5js.org/peterlightspeeder/sketches/8uzbhNDRy 
//DISCLAIMER: A lot of this file is what was written in their Bird.js class
//I used this to mimic the p5 "curve" method, as it has a smooth movement to it that did not depend on the time functions of p5
//While I did adjust parts of this code to my liking, it is not entirely my work and I want to give credit where it is due

class Fruit{

    constructor(x,y){
        this.accel = createVector(0, 0);
        this.speed = createVector(4, 0);
        this.position = createVector(x, y);

        this.r = 3.0; //RADIUS of fruit img (pretend it's a circle -- half width)
        this.maxspeed = 6;
        this.maxforce = 0.1;
    }

    follow(p){
        let predict = this.speed.copy();
        predict.normalize();
        predict.mult(25);
        let predictLoc = p5.Vector.add(this.position, predict);

        let target = 0;
        let record = 9999999; //arbitrary big number to get reset later

        for(let i = 0; i < p.points.length - 1; i++){
            let a = p.points[i].copy();
            let b = p.points[i+1].copy(); //this is why it's length-1
            let normalPt = this.getNormalPoint(predictLoc, a, b);

            if(normalPt.x < a.x || normalPt.x > b.x){
                normalPt = b.copy();
            }

            let dist = p5.Vector.dist(predictLoc, normalPt);

            if(dist < record){
                record = dist; 

                target = normalPt.copy();
            }
        }

        this.seek(target);

    }
    
    getNormalPoint(p, a, b) {

        let ap = p5.Vector.sub(p, a);
        let ab = p5.Vector.sub(b, a);
        ab.normalize();
    
        // Instead of d = ap.mag() * cos(theta)
        // See file explanation.js or page 290
        let d = ap.dot(ab);
    
        ab.mult(d);
    
        let normalPoint = p5.Vector.add(a, ab);
        return normalPoint;
    }

    seek(target){
        let goal = p5.Vector.sub(target, this.position);
        goal.normalize();
        goal.mult(this.maxspeed); //where is the next location based on speed
        let steer = p5.Vector.sub(goal, this.speed);
        steer.limit(this.maxforce); //
        this.accel.add(steer);
    }

    update(){
        this.speed.add(this.accel);
        this.speed.limit(this.maxspeed);
        this.position.add(this.speed);
        this.accel.mult(0); //0 the acceleration so it doesn't get FASTER
    }

    getPos(){
        this.theta = this.speed.heading() + PI / 2; 
        return{x:this.position, y:this.position.y, r:this.theta}
    }

    

}