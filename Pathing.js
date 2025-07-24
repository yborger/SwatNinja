//This particular class was came from https://editor.p5js.org/peterlightspeeder/sketches/8uzbhNDRy
//I had a much more convoluted constructor (I forgot I could make an empty array and add to it after working in static arrays for a while) 
//I greatly appreciate the conciseness utilized by this creator and give full credit for this class


class Pathing {

    constructor() {
      this.radius = 20;
      this.points = [];
    }
  
    /////////////////////////////
    addPoint(x, y) {
      let point = createVector(x, y);
      this.points.push(point);
    }
  
}  