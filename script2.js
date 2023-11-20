// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.05;

let pause = false;
let leftKeyIsPressed = false;
let ballsArray = []; // Array to store all the balls

// Class defining a flipper
class Flipper {
  constructor(x, y, length, width, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angularSpeed = angularSpeed;
    this.angle = 30;
    this.maxAngle = maxAngle; // Maximum rotation angle
    this.side = side;
  }
  // Method to update flipper's angle
  update() {
    if (this.side === 'left' && leftKeyIsPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);
      console.log('Left Flipper Angle: ' + this.angle);
    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 30);
    }
  }
  // Method to draw flipper on canvas
  draw() {
    ctx.save(); // Save the current context state
    ctx.translate(this.x, this.y); // Set the origin to the flipper's pivot point
    ctx.rotate(this.angle * Math.PI / 180); // Convert angle to radians and rotate
    // Draw the main body of the flipper
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.arc(this.length, 0, this.width / 3, Math.PI * 0.5, Math.PI * 1.5, true);
    ctx.closePath();
    // Style and fill the flipper body
    ctx.fillStyle =  'red';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw the pivot circle
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore(); // Restore the context to its original state
  }
}
// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 60, 30, 5, 30, 'left');
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
  const speedY = 5; // Always start with the same upward speed
  const newBall = new Ball(200, 100, 10, speedX, speedY, 'steel');
  ballsArray.push(newBall);
}
// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);
  createBall();
}
// Function to handle all ball collisions
function handleCollisions() {
  ballsArray.forEach((ball, index) => {
    if (!pause) {
    // Update the position if the ball is not on the mechanism
    if (!ball.onThrowingMechanism) {
      ball.x += ball.speedX;
      ball.y += ball.speedY;
    }
    // Bottom border collision
    if (ball.y + ball.radius > H && ball.speedY > 0) {
      // alert('You lost! Click OK to launch a new ball.');
      removeBall(index);
      return;
    }
    // Left flipper collision
    if (ball.x > leftFlipper.x - leftFlipper.width / 2 - ball.radius &&
      ball.x < leftFlipper.x + leftFlipper.width / 2 + ball.radius &&
      ball.y > leftFlipper.y - leftFlipper.height / 2 - ball.radius &&
      ball.y < leftFlipper.y + leftFlipper.height / 2 + ball.radius) {
      ball.speedY *= -1; // Reflect the ball vertically
    }
  }
  });
}
// The update function, called once per frame
function update() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'palegreen';
  ctx.fillRect(26, 20, W, H);
  // Update and draw each ball
  ballsArray.forEach(ball => {
    if (!ball.onThrowingMechanism) {
        // Normal motion if the ball is not on the arc path
        ball.x += ball.speedX;
        ball.y += ball.speedY;      
    } 
    ball.draw();
  });
  handleCollisions();
  // Draw flippers after the balls
  leftFlipper.draw();
  leftFlipper.update();
  requestAnimationFrame(update);
}

// Event listeners for key presses
window.onload = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      leftKeyIsPressed = true;
    } 
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
      leftKeyIsPressed = false;
    } 
  });
  createBall();  // Start the game with one ball
  update();
};


