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


// Class defining the invisible parts of a flipper for collision detection
class InvisibleFlipper {
  constructor(x, y, length, width, angle, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angle = angle; // the current angle of the visible flipper
    this.angularSpeed = angularSpeed;
    this.maxAngle = 25; // Maximum rotation angle
    this.side = side;
  }


  drawRectangle() {
    ctx.save();
    ctx.translate(this.x, this.y); // Move to the pivot point

    ctx.rotate(this.angle * Math.PI / 180); // Rotate by the flipper's angle
    ctx.beginPath();
    ctx.strokeStyle = 'pink';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.length, -15); // Draw the rectangle
    ctx.restore();
  }
  

  // Method to update the trapezium's points based on the flipper's current angle
  updateInvisibleRect() {
    //this.angle = angle; // Update the angle to match the visible flipper
    if (this.side === 'left' && leftKeyIsPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);

    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 25);
    }
  
  }


detectCollision(ball) {
  // Calculate the ball's position relative to the flipper's pivot
  const relativeBallPos = {
    x: ball.x - this.x,
    y: ball.y - this.y
  };


  // Rotate the ball position to align with the flipper's coordinate space

  const angleRad = -this.angle * Math.PI / 180;
  const rotatedBallPos = {
    x: relativeBallPos.x * Math.cos(angleRad) - relativeBallPos.y * Math.sin(angleRad),
    y: relativeBallPos.x * Math.sin(angleRad) + relativeBallPos.y * Math.cos(angleRad)
  };

  // Check if the rotated ball position is within the bounds of the rectangle
  // Assuming the rectangle's bottom-left corner is at (0, -15) and the top-right corner is at (length, 5)
  if (rotatedBallPos.x > 0  - ball.radius - this.length&& 
    rotatedBallPos.x< 0 + ball.radius + this.length  &&
    rotatedBallPos.y < 0 + ball.radius +15 && 
    rotatedBallPos.y  > 0 - ball.radius  -15) {
    // The ball is colliding with the rectangle
    console.log('Detecting collision');
    return true;
  }

  return false;
}

}

// Class defining a flipper
class Flipper {
  constructor(x, y, length, width, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angularSpeed = angularSpeed;
    this.angle = 10;
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

      // Update the invisible flipper's trapezium
   // this.invisibleFlipper.updateTrapezium(this.angle);

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
     // Restore the context to its original state

    ctx.restore();

    // Drawing the invisible flipper's trapezium for debugging
   
    //this.invisibleFlipper.drawTrapezium();
  }
}
// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 60, 30, 10, 30, 'left');
const invisibleFlipper = new InvisibleFlipper(leftFlipper.x, leftFlipper.y, leftFlipper.length, leftFlipper.width, 25, 10, 30, 'left');

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
function reflectOffFlipper(ball, flipper) {
  console.log('Reflect function called');

  // Calculate the normal vector at the point of collision
  // This normal assumes that the flipper is a flat surface
  let normal = {
    x: Math.cos((flipper.angle + 90) * Math.PI / 180), // Rotate by 90 degrees to get the perpendicular
    y: Math.sin((flipper.angle + 90) * Math.PI / 180)
  };

  // Calculate the dot product of ball's velocity and the normal
  const dot = ball.speedX * normal.x + ball.speedY * normal.y;

  // Reflect the ball's velocity vector over the normal vector
  // The new velocity is obtained by subtracting twice the dot product times the normal vector from the original velocity
  ball.speedX = ball.speedX - 2 * dot * normal.x;
  ball.speedY = ball.speedY - 2 * dot * normal.y;

  // Log the new speed for debugging
  console.log(`ball speedX: ${ball.speedX}, ball speedY: ${ball.speedY}`);

  // Apply energy loss due to the collision
  // The energy loss is simulated by reducing the speed by a certain percentage
  ball.speedX *= 0.90;
  ball.speedY *= 0.90;
}

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

// You would call this function in your collision handling code
if (invisibleFlipper.detectCollision(ball)) {
 
  // Determine the collision point ('trapezium' or 'circle')
  let collisionPoint = 'trapezium'; // This is an example, you need to determine it based on your logic
  reflectOffFlipper(ball, invisibleFlipper);

}
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
  handleCollisions();
  // Draw flippers after the balls
  leftFlipper.draw();
  leftFlipper.update();

  invisibleFlipper.drawRectangle();
  invisibleFlipper.updateInvisibleRect();
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