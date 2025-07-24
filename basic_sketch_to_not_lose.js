let cap;
let img;

function setup() {
  createCanvas(640, 480);
  cap = createCapture(VIDEO);
  cap.size(width, height);
  cap.hide();

}

function draw(){
    background(0);
    cap.loadPixels();
    image(cap,0,0);
  
  }