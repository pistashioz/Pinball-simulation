// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.5;

let pause = false;
let leftKeyIsPressed = false;
let rightKeyIsPressed = false;
let right
let ballsArray = []; // Array to store all the balls

// Class defining a flipper
class Flipper {
  constructor(x, y, length, height, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.height = height;
    this.angularSpeed = angularSpeed;
    this.angle = (side === 'left' ? 10 : -10);
    this.maxAngle = maxAngle; // Maximum rotation angle
    this.side = side;
  }
  // Method to update flipper's angle
  update() {
    if (this.side === 'left' && leftKeyIsPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);
    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 20);
    }

    if (this.side === 'right' && rightKeyIsPressed) {
        console.log('called right flipper');
      this.angle = Math.min(this.angle + this.angularSpeed, this.maxAngle);
    } else if (this.side === 'right') {
      this.angle = Math.max(this.angle - this.angularSpeed, -20);
    }
  }
  // Method to draw flipper on canvas
  draw() {
    ctx.save(); // Save the current context state
  
    // Calculate the rotated end points of the flipper for debugging arcs
    var cosAngle = Math.cos(this.angle * Math.PI / 180);
    var sinAngle = Math.sin(this.angle * Math.PI / 180);
  
    // Translate and rotate the canvas to draw the flipper
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);
  
    if (this.side === 'right') {
      ctx.scale(-1, 1); // Mirror the flipper for the right side
    }
  
    // The pivot point is at the center of the flipper's base (green arc)
    let pivotX = -this.height / 2;
    let pivotY = -this.height / 2;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath();
  
    // The endpoint is at the end of the flipper (red arc)
    let endpointX = pivotX + this.length;
    let endpointY = pivotY;
    ctx.beginPath();
    ctx.arc(endpointX, endpointY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  
        // The endpoint is at the end of the flipper (red arc)
        let endpointXX = pivotX + this.length;
        let endpointYY = pivotY+this.height;
        ctx.beginPath();
        ctx.arc(endpointXX, endpointYY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'purple';
        ctx.fill();
        ctx.closePath();

    // Draw the flipper
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.rect(pivotX, pivotY, this.length, this.height);
    ctx.stroke();
    ctx.closePath();
  
    ctx.restore();
  }
  
}
// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 90, 30, 22, 10, 'left');
// Adjust the position for the right flipper
const rightFlipper = new Flipper(canvas.width * 0.75, canvas.height - 90, 90, 30, 22, 10, 'right');

// Class defining a ball
class Ball {
  constructor(x, y, radius, speedX, speedY, material) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.material = material;
    this.onThrowingMechanism = false;
    this.setPhysicalProperties(material);
    this.colliding = false;
  }
  setPhysicalProperties(material) {
    switch (material) {
      case 'steel':
        this.mass = 1;
        this.restitution = 0.15;
        break;
      case 'wood':
        this.mass = 0.5;
        this.restitution = 0.3;
        break;
      case 'rubber':
        this.mass = 0.25;
        this.restitution = 0.8;
        break;
      default:
        this.mass = 1;
        this.restitution = 0.4;
    }
  }
  // Method to draw the ball on the canvas
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff00"; // Green color for the ball
    ctx.fill();
    ctx.closePath();
  }
}
// Function to create a new ball and add it to the balls array

function createBall() {
  const speedX = 0; // Random horizontal speed
  const speedY = 25; // Always start with the same upward speed
  const newBall = new Ball(315, 300, 10, speedX, speedY, 'steel');
  ballsArray.push(newBall);
}
// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);
  createBall();
}

// Function to calculate the distance from a point to a line segment
function distToSegmentSquared(p, v, w) {
    var l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 == 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2);
  }
  
  function checkFlipperBallCollision(flipper, ball) {
    // Calculate the rotated end points of the flipper
    var cosAngle = Math.cos(flipper.angle * Math.PI / 180);
    var sinAngle = Math.sin(flipper.angle * Math.PI / 180);
  
    let flipperBaseX, flipperBaseY, flipperEndX, flipperEndY;
  
    if (flipper.side === 'left') {
      // Left flipper base (pivot)
      flipperBaseX = flipper.x - (flipper.height / 2) * sinAngle;
      flipperBaseY = flipper.y + (flipper.height / 2) * cosAngle;
      // Left flipper end
      flipperEndX = flipperBaseX + flipper.length * cosAngle;
      flipperEndY = flipperBaseY + flipper.length * sinAngle;
    } else {
      // Right flipper base (pivot), mirrored around the flipper's x axis
      flipperBaseX = flipper.x + (flipper.height / 2) * sinAngle;
      flipperBaseY = flipper.y - (flipper.height / 2) * cosAngle;
      // Right flipper end
      flipperEndX = flipperBaseX - flipper.length * cosAngle;
      flipperEndY = flipperBaseY - flipper.length * sinAngle;
    }
  
    let flipperEnd1 = { x: flipperBaseX, y: flipperBaseY };
    let flipperEnd2 = { x: flipperEndX, y: flipperEndY };
  
    // Check collision with each edge of the flipper
    var ballPos = { x: ball.x, y: ball.y };

    var distance = Math.sqrt(distToSegmentSquared(ballPos, flipperEnd1, flipperEnd2));
    if (distance < ball.radius) {
        // Calculate normal of the flipper's edge
        var dx = flipperEnd2.x - flipperEnd1.x;
        var dy = flipperEnd2.y - flipperEnd1.y;
        var length = Math.sqrt(dx * dx + dy * dy);
        var normal = { x: dy / length, y: -dx / length };

        // Reflect ball's velocity over the normal
        var dot = 2 * (ball.speedX * normal.x + ball.speedY * normal.y);
        ball.speedX = ball.speedX - dot * normal.x;
        ball.speedY = ball.speedY - dot * normal.y;

        // Move the ball outside of the collision area along the normal
        var overlap = ball.radius - distance;
        ball.x += overlap * normal.x;
        ball.y += overlap * normal.y;
    }
}
  
  
  // Update your handleCollisions function to include flipper-ball collision check
  function handleCollisions() {
    ballsArray.forEach((ball, index) => {
      if (!pause) {
        // Existing collision checks for other game elements (like walls, etc.)
  
        // Check collision with the left flipper
        checkFlipperBallCollision(leftFlipper, ball);
  
        // Check collision with the right flipper
        checkFlipperBallCollision(rightFlipper, ball);
      }
    });
  }
  
  

// The update function, called once per frame
function update() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'palegreen';
  ctx.fillRect(47, 21, W-75, H-22);
  ctx.strokeRect(47, 21, W-75, H-22);
  // Update and draw each ball
  ballsArray.forEach(ball => {
    if (!ball.onThrowingMechanism) {
        // Normal motion if the ball is not on the arc path
        ball.x += ball.speedX;
        ball.y += ball.speedY;      
    } 
    ball.draw();
  });
  
  // Draw flippers after the balls
  leftFlipper.draw();
  leftFlipper.update();

rightFlipper.draw();
rightFlipper.update();
  handleCollisions();
  
  requestAnimationFrame(update);
}

// Event listeners for key presses
window.onload = () => {
// Update your event listeners to track right key presses
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      leftKeyIsPressed = true;
    }
    if (event.key === "ArrowRight") {
      rightKeyIsPressed = true;
    }
  });
  
  document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
      leftKeyIsPressed = false;
    }
    if (event.key === "ArrowRight") {
      rightKeyIsPressed = false;
    }
  });
  createBall();  // Start the game with one ball
  update();
};
