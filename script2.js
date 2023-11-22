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
  constructor(x, y, length, width, angle) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angle = angle; // the current angle of the visible flipper

    // Define the points of the trapezium relative to the flipper's pivot point
    this.trapeziumPoints = [
      { x: 0, y: 0 },
      { x: this.length, y: 0 },
      { x: this.length, y: -this.width / 3 },
      { x: 0, y: -this.width / 2 }
    ];
  }

  // Method to draw the trapezium for collision detection (for debugging)
  drawTrapezium() {
    ctx.save(); // Save the current context state
    ctx.translate(this.x, this.y); // Set the origin to the flipper's pivot point
    ctx.rotate(this.angle * Math.PI / 180); // Convert angle to radians and rotate
    ctx.beginPath();
    ctx.strokeStyle = 'pink';
    ctx.lineWidth = 2;

    // Draw the trapezium based on the relative points
    this.trapeziumPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore(); // Restore the context to its original state
  }

  // Method to update the trapezium's points based on the flipper's current angle
  updateTrapezium(angle) {
    this.angle = angle; // Update the angle to match the visible flipper
    // Transform the trapezium points based on the new angle if needed
  }

  // Add collision detection methods here
  // Method to detect collision with the upper line of the trapezium
detectCollision(ball) {
  // Convert the line segment and ball position to the same coordinate space
  const lineStart = this.trapeziumPoints[3];
  const lineEnd = this.trapeziumPoints[2];
  const relativeBallPos = {
    x: ball.x - this.x,
    y: ball.y - this.y
  };

  // Rotate the ball position to align with the line segment
  const angleRad = -this.angle * Math.PI / 180;
  const rotatedBallPos = {
    x: relativeBallPos.x * Math.cos(angleRad) - relativeBallPos.y * Math.sin(angleRad),
    y: relativeBallPos.x * Math.sin(angleRad) + relativeBallPos.y * Math.cos(angleRad)
  };

  // Check if the ball is within the bounding box of the line segment
  if (rotatedBallPos.x + ball.radius < lineStart.x || rotatedBallPos.x - ball.radius > lineEnd.x) {
    return false; // No collision possible if the ball is outside the line segment bounds
  }

  // Calculate the distance from the ball to the line segment
  const distToLine = Math.abs(rotatedBallPos.y - lineStart.y); // Since the line is horizontal after rotation, y is constant

  // Check for collision (the ball is colliding if the distance to the line is less than its radius)
  if (distToLine <= ball.radius) {
    // Handle the collision
    // Calculate the normal vector of the line
    const lineAngle = Math.atan2(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x);
    const normal = { x: Math.sin(lineAngle), y: -Math.cos(lineAngle) };
    console.log(normal);
    // Reflect the ball's velocity vector off the line's normal vector
    const dotProduct = ball.speedX * normal.x + ball.speedY * normal.y;
    ball.speedX = ball.speedX - 2 * dotProduct * normal.x;
    ball.speedY = ball.speedY - 2 * dotProduct * normal.y;

    // Multiply by restitution to reduce the energy of the ball post-collision
    ball.speedX *= ball.restitution;
    ball.speedY *= ball.restitution;

    // Reposition the ball slightly outside the collision point to prevent sticking
    ball.x += normal.x * (ball.radius - distToLine + 1);
    ball.y += normal.y * (ball.radius - distToLine + 1);

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
    this.angle = 30;
    this.maxAngle = maxAngle; // Maximum rotation angle
    this.side = side;
  }
  // Method to update flipper's angle
  update() {
    if (this.side === 'left' && leftKeyIsPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);
      console.log('Left Flipper Angle: ' + this.angle);
      console.log(this.x,this.y);
    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 30);
    }

      // Update the invisible flipper's trapezium
    this.invisibleFlipper.updateTrapezium(this.angle);
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
    this.invisibleFlipper.drawTrapezium();
  }
}
// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 60, 30, 5, 30, 'left');
leftFlipper.invisibleFlipper = new InvisibleFlipper(leftFlipper.x, leftFlipper.y, leftFlipper.length, leftFlipper.width, leftFlipper.angle);

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

      // Collision with the upper line of the trapezium
      if (leftFlipper.invisibleFlipper.detectCollision(ball)) {
        // Collision handling code here (if any additional handling is needed)
        console.log('Collision detected with the upper line of the trapezium');
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


