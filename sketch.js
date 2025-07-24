/* * * * * * * * * * * * * * * * * * *
 * One of the references used in this file: Projector Camera Example - Finger painting Keith O'Hara <kohara2@swarthmore.edu>
 * 
 * revised for p5 & opencv (Apr 2024)
 * 
 * 'c': calibrate (tinted green when calibrated)
 * 'f': feedback
 * 
 */

let cap;
let grid;
let gridCorners;
let mat;

let handpose;
let video;
let predictions = [];

let fruit, fruitPic, fruitx, fruity; //it's funny that it's not fruit anymore
let imgarray = ['imgs/fly.png', 'imgs/mosquito.png', 'imgs/dragonfly.png', 'imgs/glowy.png', 'imgs/bugeye.png', 'imgs/moth.png', 'imgs/bonus_fly.png', 'imgs/bee.png'];
let fruitsizex, fruitsizey;
let path;
let pts = 0;
let fruitpts = [10, 50, -10, -25, 25, 35, 75, 20];
let sliced1, sliced2;
let clicked = false;
let score = 0;
let font;

//particle system vars
let slice_effect;
let timer = 3000; //3 sec
let nextChange = timer;

function preload() {
  grid = loadImage("https://cdn.glitch.global/f3b3c95e-9175-4f09-972d-e4dd5d2ab7b6/pattern.png?v=1712190597405");
  //font = loadFont('inconsolata.otf');
  
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke()
  fill(200, 0, 0, 128);

  cap = createCapture(VIDEO);
  cap.size(640, 480);
  cap.hide();

  grid.resize(width*.75, height);

  handpose = ml5.handpose(cap, modelReady);
  //secondHand = ml5.secondHand(cap, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });
  //particles
  slice_effect = new System(createVector(fruitx+75,fruity+75));
  
  //FRUIT
  fruitPic = loadImage(imgarray[0]);
  fruitsizex = random(50, 150);
  fruitsizey = random(50, 150);
  fruitx = 0;
  fruity = 0;
  fruit = new Fruit(fruitx, fruity);

  fruitpath();
  //text -- currently not functional so it prints the score to the console
  //textFont(font);
  //textSize(40);

}


function modelReady() {
  console.log("Model ready!");
}


function initCV() {
  // setup opencv stuff and find corners of chessboard
  mat = cv.Mat.eye(3, 3, cv.CV_64F);
  grid.loadPixels();
  let src = cv.imread(grid.canvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY, 0);
  gridCorners = new cv.Mat();
  let cornersS = new cv.Size(9, 6);
  cv.findChessboardCorners(gray, cornersS, gridCorners)
  src.delete();
  gray.delete();
}


function draw() {
  translate(-width / 2, -height / 2);
  background(0);
  //text("SCORE: ", 20, 20);
      //printing out the score is not working but that is a minor part of the project all things considered
  image(cap, 0, 0);
  //image(fruitPic, fruitx, fruity, 150, 150);


  if (key == 'c') { //callibrate - show chess board
    if (!mat) initCV();
    cap.loadPixels();

    let src = cv.imread(cap.canvas);

    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY, 0);

    let corners = new cv.Mat();
    let cornersS = new cv.Size(9, 6);
    if (cv.findChessboardCorners(gray, cornersS, corners)) {
      print("grid corners");
      print(gridCorners.data32F);
      print("webcam corners");
      print(corners.data32F);
      if (mat) mat.delete();
      mat = cv.findHomography(corners, gridCorners);
      print("homography");
      print(mat.data64F);
      tint(0, 255, 0);
    }


    image(grid, 0, 0);
    src.delete();
    gray.delete();
    corners.delete();

    return;
  }
  else if(key == 't'){ //tester clause 1
    background(0);
    image(cap, 0, 0);
    image(fruitPic, fruitx, fruity, 150, 150);

    drawPoints(predictions);

    handCheck(predictions);
  }
  else if (key == ' ') { //previously a blank screen and now the start lol
    //background(150);
    image(cap, 0, 0);
    

    //image(fruitPic, fruitx, fruity, 150, 150);
    fruit.follow(path);
    fruit.update();
    var pos = fruit.getPos();
    push();
    translate(pos.x, pos.y);
    //console.log(pos.x);
    fruitx = Math.round(pos.x.x);
    fruity = Math.round(pos.x.y);
    image(fruitPic, 0, 0, fruitsizex, fruitsizey);
    //console.log("pos: ", fruitx, fruity);
    slice_effect.addFloaties();
    slice_effect.run();
    //slice_effect.fullhide();
    pop();
    drawPoints(predictions);
    if(handCheck(predictions)){
      addScore(pts);
      fruitReset();
    }
    
  }
  else if (key == 'p'){ //same as the above but without the floaties distraction
//added later as a result of my friend mentioning this was hurting their eyes
    image(cap, 0, 0);
    
    fruit.follow(path);
    fruit.update();
    var pos = fruit.getPos();
    push();
    translate(pos.x, pos.y);
    fruitx = Math.round(pos.x.x);
    fruity = Math.round(pos.x.y);
    image(fruitPic, 0, 0, fruitsizex, fruitsizey);
    pop();
    drawPoints(predictions);
    if(handCheck(predictions)){
      addScore(pts);
      fruitReset();
    }
      
  }
  else if (key == 'f') { //feedback

    if (!mat) initCV();
    applyMatrix(
      mat.data64F[0], mat.data64F[3], 0, mat.data64F[6],
      mat.data64F[1], mat.data64F[4], 0, mat.data64F[7],
      0, 0, 1, 0,
      mat.data64F[2], mat.data64F[5], 0, mat.data64F[8]);


    image(cap, 0, 0);
  }
  else if(key == 'h') { //draw hand
    background(0);
    image(cap, 0, 0);
    drawPoints(predictions);
  }
  else {
    //background(0);
    //image(cap, 0, 0);
    //drawPoints(predictions); 
  }

  
}

function drawPoints(arrPredict){
  for (let i = 0; i < arrPredict.length; i += 1) {
      const prediction = arrPredict[i];
      for (let j = 0; j < prediction.landmarks.length; j += 1) {
        const keypoint = prediction.landmarks[j];
        fill(0, 255, 0);
        noStroke();
        ellipse(keypoint[0], keypoint[1], 10, 10);
      }
    }
}

function handCheck(arrPredict){
  //console.log("start handcheck function");
  for(let i = 0; i < arrPredict.length; i++){
    const prediction = arrPredict[i];
      for (let j = 0; j < prediction.landmarks.length; j += 1) {
        //each hypothetical point in the predicted hand
        const keypoint = prediction.landmarks[j];
        //console.log(keypoint[0]);
        
        let x = Math.round(keypoint[0]);
        let y = Math.round(keypoint[1]);
        

        let rangex = Math.abs(x-fruitx);
        let rangey = Math.abs(y-fruity);
        //console.log(x);
        if(rangex <=10 && rangey<=10){
            //x is the same && if y is the same
            //fruit.remove();
            //console.log("touch touch touch touch");
            
            return true;
          }
      }
    }
  //console.log("end handcheck function");
  
}

function addScore(points){
  score = score + points;
  console.log("score: ", score);
}

function fruitReset(){
  //delete fruit constructor parts
  delete fruit.acceleration;
  delete fruit.velocity;
  delete fruit.position;
  delete fruit.r;
  delete fruit.maxspeed;
  delete fruit.maxforce;

  fruitsizex = random(50, 150);
  fruitsizey = random(50, 150);
  fruitx = random(0,600);
  fruity = random(0,400);
  fruit = new Fruit(fruitx,fruity);
  let rand = Math.round(random(1,8));
  pts = fruitpts[rand];
  //console.log("random fruit: ", imgarray[rand]);
  //image(fruitPic, 0,0);
  fruitPic = loadImage(imgarray[rand]);
  fruitpath();

  //fruit.follow(path);
}


function fruitpath(){
  //concept: first we're trying with just a curve creation
  //then we continue to moving the image over that curve
  //yay
  // video dimensions 640 x 480
  {/* ATTEMPT 1 FOR PATHING -- USING p5 CURVE METHOD
  translate(-width / 2, -height / 2);
  let startx = Math.round(640* Math.random()); 
  let endx = 640 - startx; //symmetry yay
  let x2, y2, x3, y3;
  let diff = Math.abs(startx-endx);
  y2 = Math.round(400 * Math.random());
  y3 = Math.round(400 * Math.random());
  if(startx < endx){
    //start left
    x2 = startx + Math.round(diff*Math.random());
    x3 = endx - Math.round(diff*Math.random());
    
  }
  else{
    //start right
    x2 = startx - Math.round(diff*Math.random());
    x3 = endx + Math.round(diff*Math.random());
    
  }
  fill('red');
  curve(); //look at instructions on curve drawing
  line(0,10,0,0,30,0);
*/}
  
  /* ATTEMPT 2 FOR PATHING -- USING vector points*/ 
  path = new Pathing();
  path.addPoint(Math.round(random(0,50)),0); //somewhere on the left
  for(let i = 0; i < 10; i++){
    //10 random points on the screen, fruit will be just moving around on the screen
    path.addPoint(Math.round(random(50, 300)), Math.round(random(20, 200)));

  }
  path.addPoint(Math.round(random(300,300)), 0); //on the right

}


//Particle System code -- based on p5 guide, used in another of my own projects

let Floaties = function(position){
  this.acceleration = createVector(0, .05); //example says acceleration
  this.velocity = createVector(random(-3,3), random(-3,3)); //example says velocity
  this.position = position.copy(); //example says position
  this.lifespan = 200;
};

Floaties.prototype.run = function(){
    this.update();
    this.display();
};

Floaties.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

Floaties.prototype.display = function(){
  stroke(200,this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

Floaties.prototype.hide = function(){
  noStroke();
  noFill();
};

Floaties.prototype.isDead = function(){
  return this.lifespan < 0;
};

let System = function(position){
  this.origin = position.copy();
  this.particles = [];
};

System.prototype.addFloaties = function(){
  this.particles.push(new Floaties(this.origin));
};

System.prototype.run = function(){
  for(let i = this.particles.length-1; i >= 0; i--){
    let p = this.particles[i];
    p.run();
    if(p.isDead()){
      this.particles.splice(i,1);
    }
  }
};

System.prototype.fullhide = function(){
  for (let i = this.particles.length-1; i >= 0; i--) {
    let p = this.particles[i];
    p.hide();
  }
};


