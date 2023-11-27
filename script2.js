// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.5;

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
   // ctx.strokeStyle = 'pink';
    ctx.lineWidth = 2;
    ctx.rect(0, 0, this.length, -15); // Draw the rectangle
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


  // Method to detect collision with the rectangle part of the flipper
  detectCollision(ball) {
    // Calculate the ball's position relative to the rectangle's pivot
    const relativeBallPos = {
      x: ball.x - this.x,
      y: ball.y - this.y
    };

    // Rotate the ball position to align with the rectangle's coordinate space
    const angleRad = -this.angle * Math.PI / 180;
    const rotatedBallPos = {
      x: relativeBallPos.x * Math.cos(angleRad) - relativeBallPos.y * Math.sin(angleRad),
      y: relativeBallPos.x * Math.sin(angleRad) + relativeBallPos.y * Math.cos(angleRad)
    };

    const rect = {
      x: 0, // x of the rectangle's pivot point
      y: -17, // y of the rectangle's bottom
      w: this.length,
      h: 17
    };

  return RectCircleColliding(rotatedBallPos, ball.radius, rect);
    
  }



}

// Collision detection function
function RectCircleColliding(circlePos, circleRadius, rect) {

  const rectCenterX = rect.x + rect.w / 2;
  const rectCenterY = rect.y + rect.h / 2;

  const distX = Math.abs(circlePos.x - rectCenterX);
  const distY = Math.abs(circlePos.y - rectCenterY);

  if (distX > (rect.w / 2 + circleRadius)) { return false; }
  if (distY > (rect.h / 2 + circleRadius)) { return false; }

  if (distX <= (rect.w / 2)) { return true; } 
  if (distY <= (rect.h / 2)) { return true; }

  const dx = distX - rect.w / 2;
  const dy = distY - rect.h / 2;
  return (dx * dx + dy * dy <= (circleRadius * circleRadius));
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
    //ctx.fill();
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
  const speedY = 0.1; // Always start with the same upward speed
  const newBall = new Ball(200, 500, 10, speedX, speedY, 'steel');
  ballsArray.push(newBall);
}
// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);
  createBall();
}
function reflectOffFlipper(ball, flipper) {
  console.log('Reflect function called');
console.log(flipper);
  // Calculate the normal vector at the point of collision
  let normal = {
    x: Math.cos((flipper.angle + 90) * Math.PI / 180), // Rotate by 90 degrees to get the perpendicular
    y: Math.sin((flipper.angle + 90) * Math.PI / 180)
  };

  // Calculate the dot product of ball's velocity and the normal
  const dot = ball.speedX * normal.x + ball.speedY * normal.y;

  // Reflect the ball's velocity vector over the normal vector
  ball.speedX = ball.speedX - 2 * dot * normal.x;
  ball.speedY = ball.speedY - 2 * dot * normal.y;

  // Log the new speed for debugging
  console.log(`ball speedX: ${ball.speedX}, ball speedY: ${ball.speedY}`);

  // Apply energy loss due to the collision
  ball.speedX *= 0.90;
  ball.speedY *= 0.90;

  // Eject the ball out of the flipper by moving it along the normal vector
  /*const ejectDistance = ball.radius / 2; // Half the ball's radius to ensure it's out of collision
  ball.x += normal.x * ejectDistance;
  ball.y += normal.y * ejectDistance;*/

  console.log(`ball speedX after energy loss: ${ball.speedX}, ball speedY after energy loss: ${ball.speedY}`);
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

      if (invisibleFlipper.detectCollision(ball) && !ball.colliding) {
        ctx.strokeStyle='red'
        reflectOffFlipper(ball, invisibleFlipper);
        ball.colliding = true; // Set the flag indicating that the ball is colliding
      } else if (!invisibleFlipper.detectCollision(ball)) {
        ball.colliding = false; // Clear the flag when the ball is not colliding
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