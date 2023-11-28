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
    
  updateInvisibleRect() {
    if (this.side === 'left' && leftKeyIsPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);
    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 25);
    }
  }
  // ...additional methods...
}

// Instantiate InvisibleFlipper class
const invisibleFlipper = new InvisibleFlipper(leftFlipper.x, leftFlipper.y, leftFlipper.length, leftFlipper.width, 25, 15, 30, 'left');

// Update function calls 
function update() {
  ...
    invisibleFlipper.drawRectangle();
    invisibleFlipper.updateInvisibleRect();
    handleCollisions();
  ...
}

Attempt 1:
Simple Collision Detection Implementation
- We first tried a basic collision detection mechanism using Axis-Aligned Bounding Box (AABB).
- This approach had issues with detecting collisions properly when the flipper was rotating.

// Additional methods on the InvisibleFlipper class:
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
      y: -17, // added 2 to 15 to compensate for lineWidth
      w: this.length,
      h: 17
    };
    return RectCircleColliding(rotatedBallPos, ball.radius, rect); 
} 

// AABB Collision detection function
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

// Reflect off flipper using AABB method
function reflectOffFlipper(ball, flipper) {
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

// Collision handling using AABB
function handleCollisions() {
  ...
  if (invisibleFlipper.detectCollision(ball) && !ball.colliding) {
        ctx.strokeStyle='red'
        reflectOffFlipper(ball, invisibleFlipper);
        ball.colliding = true; // Set the flag indicating that the ball is colliding
    } else if (!invisibleFlipper.detectCollision(ball)) {
        ball.colliding = false; // Clear the flag when the ball is not colliding
      }
}


Attempt 2:
Advanced Collision Detection with Rotating Flippers
- We then moved to a more complex collision detection to account for rotation.
- We still faced challenges with the collision detection during the flipper's rotation, particularly with fast movements.

// Additional methods on the InvisibleFlipper class:

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

// Method to detect collision with each edge of the flipper
detectCollision(ball) {
  const corners = this.getCorners();
  const edges = [
    { a: corners[0], b: corners[1] },
    { a: corners[1], b: corners[2] },
    { a: corners[2], b: corners[3] },
    { a: corners[3], b: corners[0] },
  ];

  for (let i = 0; i < edges.length; i++) {
    const nearest = {};
    if (lineCircleCollide(edges[i].a, edges[i].b, ball, ball.radius, nearest)) {
      console.log('Collision detected at edge:', i, 'Nearest point:', nearest);
      return { collision: true, point: nearest };
    }
  }
  return { collision: false };
}

// Advanced line-circle collision detection function
function lineCircleCollide(a, b, circle, radius, nearest) {
  // Vector from A to B
  const edge = { x: b.x - a.x, y: b.y - a.y };
  // Vector from A to circle's center
  const circleVec = { x: circle.x - a.x, y: circle.y - a.y };

  // Project circleVec onto edge to get the nearest point on the line
  const lengthSquared = edge.x * edge.x + edge.y * edge.y;
  const dotProduct = edge.x * circleVec.x + edge.y * circleVec.y;
  const t = dotProduct / lengthSquared;

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

// Reflect off flipper using line-circle collision method
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

  // Move the ball out of the collision
  ball.x += normal.x * (ball.radius - normalLength);
  ball.y += normal.y * (ball.radius - normalLength);
}

// Collision handling using line-circle collision method
function handleCollisions() {
  ...
    const collisionResult = invisibleFlipper.detectCollision(ball);
    if (collisionResult.collision && !ball.colliding) {
        ctx.strokeStyle = 'red';
        reflectOffFlipper(ball, collisionResult.point);
        ball.colliding = true; // Set the flag indicating that the ball is colliding
    } else if (!collisionResult.collision) {
    ball.colliding = false; // Clear the flag when the ball is not colliding
    }
}


Final Approach:
Horizontal Moving Flipper
- Due to the complexities and time constraints, we decided to implement a horizontal moving flipper.
- This simplified the collision detection and allowed us to meet the project deadline.
- Below is the retired code for the left and right rotating flippers, which we replaced with the new horizontal flipper implementation.

 Retired Rotating Flippers Code 
// Class defining a flipper
class Flipper {
  constructor(x, y, length, width, angularSpeed, maxAngle, side) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = width;
    this.angularSpeed = angularSpeed;
    //this.angle = 30 
    side === 'right' ? this.angle = -30 :  this.angle = 30;
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

    if (this.side === 'right' && rightKeyIsPressed) {
      this.angle = Math.min(this.angle + this.angularSpeed, -this.maxAngle);
      console.log('Right Flipper Angle: ' + this.angle);
    } else if (this.side === 'right') {
      this.angle = Math.max(this.angle - this.angularSpeed, this.maxAngle);
    }
  }


  // Method to draw flipper on canvas
  draw() {
    ctx.save(); // Save the current context state
    ctx.translate(this.x, this.y); // Set the origin to the flipper's pivot point
    ctx.rotate(this.angle * Math.PI / 180); // Convert angle to radians and rotate

    // Draw the main body of the flipper
    ctx.beginPath();
    if (this.side === 'right') {
      ctx.arc(0, 0, this.width / 2, Math.PI * 1.5, Math.PI * 0.5, false);
      ctx.arc(-this.length, 0, this.width / 3, Math.PI * 0.5, Math.PI * 1.5, false);
    } else {
      ctx.arc(0, 0, this.width / 2, Math.PI * 1.5, Math.PI * 0.5, true);
      ctx.arc(this.length, 0, this.width / 3, Math.PI * 0.5, Math.PI * 1.5, true);
    }
    ctx.closePath();

    // Style and fill the flipper body
    ctx.fillStyle = this.side === 'right' ? 'pink' : 'red';
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

// Instantiating the flippers
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 60, 30, 5, 30, 'left');
const rightFlipper = new Flipper(canvas.width * 0.65, canvas.height - 90, 60, 30, 5, -30, 'right');

// Update function calls for retired flippers
function update() {
  ...
  leftFlipper.update();
  rightFlipper.update();
  leftFlipper.draw();
  rightFlipper.draw();
  ...
}
  
  - The new approach can be seen in the main script.js, where we have now implemented a horizontal flipper that moves across the bottom of the screen, acting as a 'goalkeeper' to prevent the ball from passing.
*/