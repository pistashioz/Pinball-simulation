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
    ctx.strokeStyle='red';
    ctx.rect(0, 0, this.length, -15); // Draw the rectangle
    ctx.stroke();
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

  // Method to get the rotated rectangle's corners
  getCorners() {
    const corners = [
      { x: 0, y: -15 },
      { x: this.length, y: -15 },
      { x: this.length, y: 0 },
      { x: 0, y: 0 },
    ];



    return corners.map(corner => this.rotatePoint(corner));
  }

    // Method to rotate a point around the pivot
    rotatePoint(point) {
      const angleRad = this.angle * Math.PI / 180;
      return {
        x: point.x * Math.cos(angleRad) - point.y * Math.sin(angleRad) + this.x,
        y: point.x * Math.sin(angleRad) + point.y * Math.cos(angleRad) + this.y
      };
    }
  // Method to detect collision with the rectangle part of the flipper
  /*detectCollision(ball) {
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
    
  }*/

// Method to detect collision with each edge of the flipper
detectCollision(ball) {
  const corners = this.getCorners();
  const edges = [
    { a: corners[0], b: corners[1] },
    { a: corners[1], b: corners[2] },
    { a: corners[2], b: corners[3] },
    { a: corners[3], b: corners[0] },
  ];

  //console.log('Ball position:', ball.x, ball.y);
 // console.log('Flipper angle:', this.angle);

  for (let i = 0; i < edges.length; i++) {
    const nearest = {};
    //console.log('Checking edge:', edges[i].a, edges[i].b);
    console.log(lineCircleCollide(edges[i].a, edges[i].b, ball, ball.radius, nearest));
    if (lineCircleCollide(edges[i].a, edges[i].b, ball, ball.radius, nearest)) {
      console.log('Collision detected at edge:', i, 'Nearest point:', nearest);
      return { collision: true, point: nearest };
    }
  }

 //console.log('No collision detected');
  return { collision: false };
}

}
function lineCircleCollide(a, b, circle, radius, nearest) {
  // Vector from A to B
  const edge = { x: b.x - a.x, y: b.y - a.y };
  // Vector from A to circle's center
  const circleVec = { x: circle.x - a.x, y: circle.y - a.y };

  // Project circleVec onto edge to get the nearest point on the line
  const lengthSquared = edge.x * edge.x + edge.y * edge.y;
  const dotProduct = edge.x * circleVec.x + edge.y * circleVec.y;
  let t = dotProduct / lengthSquared;

  // Clamp t to the range [0,1]
  t = Math.max(0, Math.min(1, t));

  // Find the nearest point on the line segment
  nearest.x = a.x + t * edge.x;
  nearest.y = a.y + t * edge.y;

  // Draw the line for visual debugging
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = 'yellow';
  ctx.stroke();

  // Draw the nearest point for visual debugging
  ctx.beginPath();
  ctx.arc(nearest.x, nearest.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'purple';
  ctx.fill();

  // Draw the circle for visual debugging
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'blue';
  ctx.stroke();

  // Log the results for debugging
  console.log('Projected point:', nearest.x, nearest.y);
  console.log('Actual circle center:', circle.x, circle.y);
  console.log('Distance to circle:', Math.sqrt(Math.pow(nearest.x - circle.x, 2) + Math.pow(nearest.y - circle.y, 2)), 'Radius:', radius);

  // Check if the nearest point is within the circle's radius
  return Math.sqrt(Math.pow(nearest.x - circle.x, 2) + Math.pow(nearest.y - circle.y, 2)) <= radius;
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
const invisibleFlipper = new InvisibleFlipper(leftFlipper.x, leftFlipper.y, leftFlipper.length, leftFlipper.width, 25, leftFlipper.angularSpeed, leftFlipper.maxAngle, leftFlipper.side);

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
  const speedY = 0.9; // Always start with the same upward speed
  const newBall = new Ball(200, 300, 10, speedX, speedY, 'steel');
  ballsArray.push(newBall);
}
// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);
  createBall();
}
/*
function reflectOffFlipper(ball, flipper) {
console.log('called');
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


  // Apply energy loss due to the collision
  ball.speedX *= 0.90;
  ball.speedY *= 0.90;


}
*/

function reflectOffFlipper(ball, collisionPoint) {
  console.log('called');

  // Calculate the normal vector at the point of collision
  // Assuming collisionPoint is the nearest point on the flipper to the ball
  let normal = {
    x: collisionPoint.x - ball.x,
    y: collisionPoint.y - ball.y
  };

  // Normalize the normal vector
  let normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  normal.x /= normalLength;
  normal.y /= normalLength;

  // Calculate the dot product of ball's velocity and the normal
  const dot = ball.speedX * normal.x + ball.speedY * normal.y;

  // Reflect the ball's velocity vector over the normal vector
  ball.speedX = ball.speedX - 2 * dot * normal.x;
  ball.speedY = ball.speedY - 2 * dot * normal.y;

  // Apply energy loss due to the collision
  ball.speedX *= 0.90;
  ball.speedY *= 0.90;

  // Optional: Move the ball out of the collision
  ball.x += normal.x * (ball.radius - normalLength);
  ball.y += normal.y * (ball.radius - normalLength);
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

     /* if (invisibleFlipper.detectCollision(ball) && !ball.colliding) {
        ctx.strokeStyle='red'
        reflectOffFlipper(ball, invisibleFlipper);
        ball.colliding = true; // Set the flag indicating that the ball is colliding
      } else if (!invisibleFlipper.detectCollision(ball)) {
        ball.colliding = false; // Clear the flag when the ball is not colliding
      }*/
      const collisionResult = invisibleFlipper.detectCollision(ball);

      if (collisionResult.collision && !ball.colliding) {
     
        ctx.strokeStyle = 'red';
        reflectOffFlipper(ball, collisionResult.point);
        ball.colliding = true; // Set the flag indicating that the ball is colliding
      } else if (!collisionResult.collision) {
        
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
  
  // Draw flippers after the balls
  leftFlipper.draw();
  leftFlipper.update();

  invisibleFlipper.drawRectangle();
  invisibleFlipper.updateInvisibleRect();
  handleCollisions();
  
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


/* 
Development Notes and Experimentation Log:

Initial Concept:
- The original design of the flippers did not conform to a simple rectangular shape. 
- We conceptualized breaking down the flipper into more primitive shapes for collision detection: a rectangle and two half-circles.
- This led to the creation of the InvisibleFlipper class, which would handle the collision detection logic by considering the flipper's geometry and rotation.

class InvisibleFlipper {
  constructor(x, y, length, width, angle, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angle = angle; // the current angle of the visible flipper
    this.angularSpeed = angularSpeed;
    this.maxAngle = maxAngle; // Maximum rotation angle
    this.side = side;
  }

  drawRectangle() {
    ctx.save();
    ctx.translate(this.x, this.y); // Move to the pivot point
    ctx.rotate(this.angle * Math.PI / 180); // Rotate by the flipper's angle
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle='red';
    ctx.rect(0, 0, this.length, -15); // Draw the rectangle representing the flipper's collision area
    ctx.stroke();
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
  // ...additional methods...
}

Attempt 1:
Simple Collision Detection Implementation
- We first tried a basic collision detection mechanism using Axis-Aligned Bounding Box (AABB).
- This approach had issues with detecting collisions properly when the flipper was rotating.
...

Attempt 2:
Advanced Collision Detection with Rotating Flippers
- We then moved to a more complex collision detection to account for rotation.
- We faced challenges with the collision detection during the flipper's rotation, particularly with fast movements.
...

Final Approach:
Horizontal Moving Flipper
- Due to the complexities and time constraints, we decided to implement a horizontal moving flipper.
- This simplified the collision detection and allowed us to meet the project deadline.
...

*/
