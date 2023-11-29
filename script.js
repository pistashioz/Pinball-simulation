// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.35;
const BOUNCE_THRESHOLD = 2.5; // Minimum speed for bounce

const MIDDLE_OFFSET =   W/2 +13;
//sound effects
const BOUNCE_SOUND = new Audio("assets/audio/Jump.wav");
const BOUNCE_FLIPPERS = new Audio("assets/audio/jumpFlipper.wav");
const GRAB_OBSTACLES = new Audio("assets/audio/grab.wav");

let mousePosition = { x: 0, y: 0 };
let isMouseDown = false;
let focused = { state: false, key: null };
let isPause = false;

let leftKeyIsPressed = false;
let rightKeyIsPressed = false;
let flippersKeyPressed = false;
let downKeyIsPressed = false;

let ballsArray = []; // Array to store all the balls




// Class defining a flipper
class TwoFlipper {
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
    if (this.side === 'left' && flippersKeyPressed) {
      this.angle = Math.max(this.angle - this.angularSpeed, -this.maxAngle);
    } else if (this.side === 'left') {
      this.angle = Math.min(this.angle + this.angularSpeed, 15);
    }

    if (this.side === 'right' && flippersKeyPressed) {
        console.log('called right flipper');
      this.angle = Math.min(this.angle + this.angularSpeed, this.maxAngle);
    } else if (this.side === 'right') {
      this.angle = Math.max(this.angle - this.angularSpeed, -15);
    }
  }
  // Method to draw flipper on canvas
  draw() {


    ctx.save(); // Save the current context state
  
    // Calculate the rotated end points of the flipper for debugging arcs

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


    // Draw the flipper
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.rect(-this.height/2, -this.height/2, this.length, this.height);
    ctx.stroke();
    ctx.closePath();
  
    ctx.restore();


  }
  
}
// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new TwoFlipper(canvas.width * 0.25, canvas.height - 90, 90, 30, 25, 10, 'left');
// Adjust the position for the right flipper
const rightFlipper = new TwoFlipper(canvas.width * 0.65, canvas.height - 90, 90, 30, 25, 10, 'right');
function drawActualPositions(flipper) {

  // Original top left corner coordinates relative to the pivot
  let topLeftX = -flipper.height/2;
      // If the flipper is on the right side, invert the x-coordinate
  let topLeftY = -flipper.height/2;

  // Convert angle to radians and calculate the cosine and sine
  let angleInRadians = flipper.angle * Math.PI / 180; // Negative for inverse rotation
  if (flipper.side === 'right') {
    angleInRadians = -flipper.angle * Math.PI / 180;
  }
  let cosAngle = Math.cos(angleInRadians);
  let sinAngle = Math.sin(angleInRadians);

  // Apply the inverse rotation to get the coordinates in the untransformed space
  let untransformedTopLeftX = cosAngle * topLeftX - sinAngle * topLeftY;
  let untransformedTopLeftY = sinAngle * topLeftX + cosAngle * topLeftY;

    // Calculate the position of the bottom corner relative to the pivot point
    let bottomCornerX = flipper.length - flipper.height/2;
    let bottomCornerY = flipper.height/2;
  
    // Apply the inverse rotation to get the coordinates in the untransformed space
    let untransformedBottomCornerX = cosAngle * bottomCornerX - sinAngle * bottomCornerY;
    let untransformedBottomCornerY = sinAngle * bottomCornerX + cosAngle * bottomCornerY;
  

  // If the flipper is on the right side, invert the x-coordinate
  if (flipper.side === 'right') {
    untransformedTopLeftX = -untransformedTopLeftX; // Invert the x-coordinate due to scale transformation
    untransformedBottomCornerX = -untransformedBottomCornerX; // Invert the x-coordinate due to scale transformation
  }
  // Translate by the flipper's position to get the final position
  let finalTopLeftX = flipper.x + untransformedTopLeftX;
  let finalTopLeftY = flipper.y + untransformedTopLeftY;

    // Translate back by the flipper's original position to get the final position
    let finalBottomCornerX = flipper.x + untransformedBottomCornerX;
    let finalBottomCornerY = flipper.y + untransformedBottomCornerY;
  
    // Draw the actual position of the bottom corner
    ctx.beginPath();
    ctx.arc(finalBottomCornerX, finalBottomCornerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'red'; // Red for the new corner
    ctx.fill();
    ctx.closePath();

  // Draw the actual position of the top left corner (pink circle)
  ctx.beginPath();
  ctx.arc(finalTopLeftX, finalTopLeftY, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'pink'; // Pink to differentiate from green
  ctx.fill();
  ctx.closePath();

  // Reverse the transformation for the endpoint
  // Translate the endpoint back by the pivot position
  let translatedEndpointX = flipper.length-flipper.height/2;
  let translatedEndpointY = -flipper.height/2;



  let rotatedX = translatedEndpointX * cosAngle - translatedEndpointY * sinAngle;
  let rotatedY = translatedEndpointX * sinAngle + translatedEndpointY * cosAngle;

    // If the flipper is on the right side, invert the x-coordinate
    if (flipper.side === 'right') {
      rotatedX = -rotatedX; // Invert the x-coordinate due to scale transformation
      angleInRadians = -flipper.angle * Math.PI / 180;
         untransformedTopLeftX = -untransformedTopLeftX; // Invert the x-coordinate due to scale transformation
    }

  // Translate back by the original position
  let finalX = flipper.x + rotatedX;
  let finalY = flipper.y + rotatedY;
// Apply the mirroring if the flipper is on the right side

  ctx.beginPath();
  ctx.arc(finalX, finalY, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'purple'; // Using purple to differentiate from red
  ctx.fill();
  ctx.closePath();

  // Return the calculated positions including the new bottom corner
  return {
    topLeft: { x: finalTopLeftX, y: finalTopLeftY },
    topRight: { x: finalX, y: finalY },
    bottomCorner: { x: finalBottomCornerX, y: finalBottomCornerY } // Add this line to include the new corner
  };
}


// Call this function for each flipper after they are drawn

// Class defining the invisible parts of a flipper for collision detection
class Flipper {
  constructor(x, y, height, width, moveSpeed) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.moveSpeed = moveSpeed; // the current angle of the visible flipper
  }

  draw() {
    ctx.save();

      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'green';
      ctx.lineWidth = 2;
      ctx.rect(this.x , this.y, this.width, this.height); // Draw the rectangle
      ctx.stroke();
      //ctx.fill();
   
    ctx.restore();
  }
  
  // Method to update flipper's position
  update() {
    if (leftKeyIsPressed && this.x > 0 && !isPause) {
      this.x = Math.max(this.x - this.moveSpeed, 0); // Move left
    }
    if (rightKeyIsPressed && (this.x + this.width) < canvas.width  && !isPause) {
      this.x = Math.min(this.x + this.moveSpeed, canvas.width - this.width); // Move right
    }
  }




}

const rectFlipper = new Flipper(canvas.width / 2 - 30, canvas.height - 80,  40, 90, 5);

// Class for the throwing mechanism
class ThrowingMechanism {
  constructor(x, y, width, height, stiffness = 0.3) { // Default stiffness value
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.stiffness = stiffness;
    this.compressionTime = 0;
  }

  draw() {
    ctx.save();

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + this.width, this.y + 10);
    //ctx.rect(this.x, this.y, this.width, this.height);
    ctx.lineTo(this.x + 23, this.y+10)
    ctx.lineTo(this.x + 23, this.y+100);
    ctx.lineTo(this.x+13, this.y+100);
    ctx.lineTo(this.x+13, this.y+10);
    ctx.lineTo(this.x, this.y+10);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    /*ctx.beginPath();
  
    ctx.ellipse(100, 100, 5, 15, Math.PI /2, 0,  Math.PI, true);
    ctx.lineWidth=2;
    ctx.stroke();
    

    ctx.beginPath();
    ctx.ellipse(100, 110, 5, 15, Math.PI /2, 0,  Math.PI, false);

    ctx.lineWidth=2;
    ctx.stroke();*/
    let value = 16;
    //A loop to draw 10 ellipses on the canvas
    for (let i = 0; i < 1; i++) {
    
      let clockwise = true;
      if (i % 2 !== 0) {
        clockwise = false
      }

      ctx.beginPath();
      ctx.ellipse(this.x+18, this.y + value, 5, 15, Math.PI /2, 0.40,  3.5, clockwise);

      ctx.lineWidth=2;
      ctx.stroke();
      ctx.closePath();

      // Increment the value by 5 each time
      value += 10;
  
    }

    ctx.restore();
  };
}

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
    this.inPlay = true;
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
    ctx.stroke();
    ctx.closePath();
  }
}

class Obstacle {
  constructor(x, y, r, color) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.shakeFrames = 0; // No shake initially
    this.shakeMagnitude = 2; // Shake by 4 pixels/units
    this.shakeDirection = { x: 0, y: 0 };
  }

  draw() {
    // Use the original position plus any temporary shake offset
    let drawX = this.originalX + this.shakeDirection.x;
    let drawY = this.originalY + this.shakeDirection.y;

    // Draw the larger circle
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Draw the smaller circle
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.r / 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
  }

  shake(dx, dy) {
    if (this.shakeFrames > 0) {
       this.shakeDirection.x = dx * this.shakeMagnitude;
      this.shakeDirection.y = dy * this.shakeMagnitude;
      this.shakeFrames--;
    } 
  }
}

const throwingMechanism = new ThrowingMechanism(W - 57, H - 120, 37, 100);

//Array with obstacles' values
const obstacles = [
  new Obstacle(MIDDLE_OFFSET, H / 2 - 50, 25, 'red'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, 'blue'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, 'green'),
];


// Function to check if the mouse position intersects with an obstacle
function move(e) {
  if (!isPause || !isMouseDown) {
    //console.log(`Drag skipped - isPaused: ${isPause}, isMouseDown: ${isMouseDown}`);
    return;
  }

  getMousePosition(e);

  if (focused.state) {
    const obstacle = obstacles[focused.key];
    // Ensure the obstacle stays within the canvas borders
    const newX = Math.max(26 + obstacle.r, Math.min(W - 20 - obstacle.r, mousePosition.x));
    const newY = Math.max(0 + obstacle.r, Math.min(H - obstacle.r, mousePosition.y));
    obstacle.originalX = newX;
    obstacle.originalY  = newY;

    //console.log(`Obstacle ${focused.key} moved to - X: ${newX}, Y: ${newY}`);
    
  } else {
    for (let i = 0; i < obstacles.length; i++) {
      if (intersects(obstacles[i])) {
        focused.state = true;
        focused.key = i;
        obstacles[i].r *= 1.1; // Slightly increase the radius to indicate selection
        console.log(`Obstacle ${i} focused`);
        break;
      }
    }
  }
}

function setDraggable(e) {
  isMouseDown = e.type === "mousedown";
  console.log(`Mouse ${e.type} at - X: ${e.clientX}, Y: ${e.clientY}`);
  if (!isMouseDown) {
    if (focused.state) {
      obstacles[focused.key].r /= 1.1; // Reset the radius
      focused.state = false;
      focused.key = null;
      console.log(`Focus released`);
    }
  }
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  mousePosition = {
    x: Math.round(e.clientX - rect.left),
    y: Math.round(e.clientY - rect.top)
  };
  console.log(`Mouse position - X: ${mousePosition.x}, Y: ${mousePosition.y}`);
}

function intersects(obstacle) {
  // subtract the x, y coordinates from the mouse position to get coordinates 
  // for the hotspot location and check against the area of the radius
  const areaX = mousePosition.x - obstacle.originalX;
  const areaY = mousePosition.y - obstacle.originalY;
  return areaX * areaX + areaY * areaY <= obstacle.r * obstacle.r;
}

// Function to create a new ball and add it to the balls array
function createBall() {
  const speedX = 0; // Random horizontal speed
  const speedY = 5; // Always start with the same upward speed
  //const newBall = new Ball(throwingMechanism.x + throwingMechanism.width / 2, throwingMechanism.y - 120, 10, 0, speedY);
   const newBall = new Ball(MIDDLE_OFFSET, 100, 10, -5, 0, 'steel');
  ballsArray.push(newBall);
}

// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);

  //leftFlipper.angle = Math.min(Math.max(-leftFlipper.maxAngle, leftFlipper.angle), leftFlipper.maxAngle)

  //rightFlipper.angle = Math.min(Math.max(-rightFlipper.maxAngle, rightFlipper.angle), rightFlipper.maxAngle)
  
  createBall();
}

function drawShadows() {

  ctx.save();
  ctx.fillStyle = "black"
  ctx.beginPath();
  ctx.moveTo(W - 20, 20);
  ctx.lineTo(W - 28, 20);
  ctx.lineTo(W - 20, H - 20);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(18, 0);
  ctx.lineTo(26, H);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

};

// Function to draw the borders of the pinball table
function drawBorder() {

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "tan";

  // Drawing borders in a loop to avoid repetition
  const borderPath = [
    { moveTo: [26, 0], lineTo: [46, 20], close: [W - 20, 20], end: [W, 0] },
    { moveTo: [26, 0], lineTo: [46, 20], close: [46, H - 20], end: [26, H] }, // right border
    { moveTo: [W, 0], lineTo: [W - 20, 20], close: [W - 20, H - 20], end: [W, H] }, // left border
    { moveTo: [26, H], lineTo: [46, H - 20], close: [W - 20, H - 20], end: [W, H] }
  ];

  borderPath.forEach(path => {
    ctx.beginPath();
    ctx.moveTo(...path.moveTo);
    ctx.lineTo(...path.lineTo);
    ctx.lineTo(...path.close);
    ctx.lineTo(...path.end);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

// Function to draw the throwing mechanism
function throwingMech() {

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'green';
  
  ctx.beginPath();
  ctx.moveTo(W - 58, H-20);
  ctx.lineTo(W - 58, 150);
  ctx.stroke();
  ctx.closePath();

  // Set the starting point for the arc
  const x = 250;
  const y = 250;
  const radius = 100;
  const startAngle = 0;
  const endAngle = -1.0;

  // Draw the arc
  ctx.beginPath();
  ctx.arc(W - 158, 150, radius, startAngle, endAngle, true);

  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth=1;
  ctx.moveTo(MIDDLE_OFFSET, 20);
  //ctx.lineTo(MIDDLE_OFFSET, H);
  ctx.stroke();
  ctx.closePath();

    ctx.restore();




}
console.log(ballsArray);

function reflect(ball, obstacle) {
 
let normal

  normal = { x: ball.x - obstacle.originalX, y: ball.y - obstacle.originalY };
  // Calculate the normal vector at the point of collision

  const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  normal.x /= normalLength;
  normal.y /= normalLength;

  // Calculate dot product of ball's velocity and the normal
  const dot = ball.speedX * normal.x + ball.speedY * normal.y;

  // Reflect the ball's velocity vector over the normal vector
  ball.speedX = ball.speedX - 2 * dot * normal.x;
  ball.speedY = ball.speedY - 2 * dot * normal.y;

  // This would be the place to adjust ball's speed to simulate energy loss
   ball.speedX *= 0.99; 
   ball.speedY *= 0.99;
}

  function isColliding(circle, rectangle, lineWidth) {
    // Adjust the circle's radius to account for the stroke
    const totalRadius = circle.radius + lineWidth ;
    
    // Check if the bottom of the circle is colliding with the top of the rectangle
    if (circle.y + totalRadius >= rectangle.y + lineWidth  && // Bottom of circle is below the top of rectangle (considering stroke)
        circle.y - totalRadius <= rectangle.y + rectangle.height && // Top of circle is above the bottom of rectangle
        circle.x >= rectangle.x && // Left side of circle is after the left side of rectangle
        circle.x <= rectangle.x + rectangle.width) { // Right side of circle is before the right side of rectangle
      return true;
    }
    return false;
  }


  function reflectOffFlipper(ball, flipper) {
    // The normal vector for the top edge of a horizontal flipper would be straight up

  
    const normal = { x: 0, y: -1 };
  
    // Calculate dot product of ball's velocity and the normal
    const dot = ball.speedX * normal.x + ball.speedY * normal.y;
  console.log(`ball's speed before bounce: ${ball.speedX}, ${ball.speedY}`);
    // Reflect the ball's velocity vector over the normal vector
    ball.speedX = ball.speedX - 2 * dot * normal.x;
    ball.speedY = ball.speedY - 2 * dot * normal.y;
    console.log(`ball's speed after bounce: ${ball.speedX}, ${ball.speedY}`);
  
    // This would be the place to adjust ball's speed to simulate energy loss
    //ball.speedX *= 0.95;
    //ball.speedY *= 0.95;
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
  // Get the calculated flipper positions
  var positions = drawActualPositions(flipper);

  // Define line segments
  let flipperTopEdge = { start: positions.topLeft, end: positions.topRight };
  let flipperSideEdge = { start: positions.topRight, end: positions.bottomCorner };

  // Check collision with the top edge of the flipper
  checkCollisionForLineSegment(ball, flipperTopEdge.start, flipperTopEdge.end);

  // Check collision with the side edge of the flipper
  checkCollisionForLineSegment(ball, flipperSideEdge.start, flipperSideEdge.end);
}

function checkCollisionForLineSegment(ball, segmentStart, segmentEnd) {
  var ballPos = { x: ball.x, y: ball.y };
  var distance = Math.sqrt(distToSegmentSquared(ballPos, segmentStart, segmentEnd));

  if (distance < ball.radius) {
      handleFlipperCollision(ball, segmentStart, segmentEnd, distance);
  }
}

function handleFlipperCollision(ball, segmentStart, segmentEnd, distance) {
  // Calculate normal of the flipper's edge
  var dx = segmentEnd.x - segmentStart.x;
  var dy = segmentEnd.y - segmentStart.y;
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


// Function to handle all ball collisions
function handleCollisions() {
  const borderWidth = 20 + ctx.lineWidth; // Including the line width in the border size
  const borderWidthRight = 46 + ctx.lineWidth; // Including the line width in the border size
  const throwingMechWidth = 58;

  ballsArray.forEach((ball, index) => {
     
    // Ball collision with the top of the throwing mechanism
    if (ball.x >= throwingMechanism.x &&
        ball.x <= throwingMechanism.x + throwingMechanism.width &&
        ball.y + ball.radius >= throwingMechanism.y &&
        ball.y - ball.radius <= throwingMechanism.y + throwingMechanism.height) {

      // If the ball is moving downwards, check for a bounce
      if (ball.speedY > 0) {
        // Check if the bounce is significant enough to occur
        if (Math.abs(ball.speedY) > BOUNCE_THRESHOLD) {
          ball.speedY = -ball.speedY * ball.restitution;
        } else {
          // If the bounce is too low, just set the ball on the mechanism
          ball.onThrowingMechanism = true;
          ball.speedY = 0;
        }
        // Adjust the ball's position to be on top of the mechanism after the bounce
        if (ball.y + ball.radius > throwingMechanism.y) {
          ball.y = throwingMechanism.y - ball.radius;
        }
      }
    }

    // Update the position if the ball is not on the mechanism
    if (!ball.onThrowingMechanism) {
      ball.x += ball.speedX;
      ball.y += ball.speedY;
    }
    // Top border collision
    if (ball.y - ball.radius < borderWidth && ball.speedY < 0) {
      ball.speedY *= -4;
    }

    // Bottom border collision
    if (ball.y + ball.radius > H && ball.speedY > 0) {
      // alert('You lost! Click OK to launch a new ball.');
      isPause = false;
      removeBall(index);
      return;
    }

    // Left and right border collision
    if ((ball.x - ball.radius < borderWidthRight && ball.speedX < 0) ||
      (ball.x + ball.radius > W - borderWidth - throwingMechWidth && ball.speedX > 0)) {
      ball.speedX *= -1;
    }
    let lineWidth = 2; // Example line width

    //Check for collision between the ball and an obstacle
obstacles.forEach(obstacle => {
  let dx = obstacle.originalX - ball.x;
  let dy = obstacle.originalY - ball.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  const sumOfRadii = ball.radius + obstacle.r + lineWidth; //adding two because of the stroke

  if (distance <= sumOfRadii) {
    // Collision detected
    obstacle.shakeFrames = 10; // Shake for 5 frames, for example
    const shakeDirectionX = dx / distance; // Normalized shake direction X
    const shakeDirectionY = dy / distance; // Normalized shake direction Y
    obstacle.shake(shakeDirectionX, shakeDirectionY);
    reflect(ball, obstacle);
  }else {
    obstacle.shakeDirection.x = 0;
    obstacle.shakeDirection.y = 0;
  }
 
});

        // Check collision with the left flipper
        checkFlipperBallCollision(leftFlipper, ball);
  
        // Check collision with the right flipper
        checkFlipperBallCollision(rightFlipper, ball);


  
  });

}



// The update function, called once per frame
function update() {
 

  if (!isPause) {
  // Define the arc parameters
  const arcCenterX = W - 140;
  const arcCenterY = 140;
  const arcRadius = 100;
  const arcStartAngle = 0; // Starting at the top of the circle
  const arcEndAngle = -1.6; // Specific angle for the arc ending
  const MIN_VELOCITY_THRESHOLD = 1.5; // This value should be determined experimentally or calculated based on physics

  // Update and draw each ball
  
  ballsArray.forEach(ball => {
    if (!ball.onThrowingMechanism) {
      // Apply gravity if the ball is not on the arc
      ball.speedY += GRAVITY;

      // Determine the current angle based on the ball's position
      let ballAngle = Math.atan2(ball.y - arcCenterY, ball.x - arcCenterX);

      // Check if the ball is within the arc's angle range
      if (!ball.inPlay && ballAngle <= arcStartAngle && ballAngle >= arcEndAngle ) {
        // Calculate tangential velocity components based on the entry angle
        let tangentVelocityMagnitude = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        ball.speedX = tangentVelocityMagnitude * Math.cos(ballAngle - Math.PI / 2);
        ball.speedY = tangentVelocityMagnitude * Math.sin(ballAngle - Math.PI / 2);

        // Check if the ball's tangential velocity is enough to complete the arc
        if (tangentVelocityMagnitude < MIN_VELOCITY_THRESHOLD) {
          // Not enough velocity to complete the arc
          // Reverse the direction and simulate the ball falling back down
          ball.speedX = -ball.speedX * 0.50; // Reverse X velocity and apply some damping
          ball.speedY = -ball.speedY * 0.50; // Reverse Y velocity and apply some damping
        } else {
          // Move the ball along the arc using the tangential velocity
          ball.x += ball.speedX;
          ball.y += ball.speedY;

          // Adjust ball to stay on the arc
          let distanceFromCenter = Math.sqrt((ball.x - arcCenterX) ** 2 + (ball.y - arcCenterY) ** 2);
          if (distanceFromCenter != arcRadius) {
            let correctionFactor = arcRadius / distanceFromCenter;
            ball.x = arcCenterX + correctionFactor * (ball.x - arcCenterX);
            ball.y = arcCenterY + correctionFactor * (ball.y - arcCenterY);
          }
        }

      } else if (ballAngle <= arcEndAngle) {
        ball.inPlay = true;
      }
      else {
        // Normal motion if the ball is not on the arc path
        ball.x += ball.speedX;
        ball.y += ball.speedY;      
      }
    } else if (ball.onThrowingMechanism) {
      // Make the ball follow the mechanism if it is on it
      ball.x = throwingMechanism.x + throwingMechanism.width / 2;
      ball.y = throwingMechanism.y - ball.radius;
      ball.inPlay = false; // Reset inPlay when ball is on the mechanism
    }


  });

  handleCollisions();




// If the down arrow key is pressed, increase the compression of the throwing mechanism
if (downKeyIsPressed) {
  // Make sure the height doesn't go below a certain threshold
  if (throwingMechanism.height > 16) {
    throwingMechanism.height -= 1;
    throwingMechanism.y += 1;
    // Increase the compression time more significantly
    throwingMechanism.compressionTime += 1; // Adjust this value as needed
  }
} else {
  // Launch the ball if there's compression time accumulated
  if (throwingMechanism.compressionTime > 0) {
    // Calculate the force based on the compression time and stiffness
    const force = throwingMechanism.compressionTime * throwingMechanism.stiffness;
    
    // Apply force to the ball that's on the mechanism
    ballsArray.forEach(ball => {
      if (ball.onThrowingMechanism) {
        // Calculate the acceleration (force divided by mass)
        // Remember, force is mass times acceleration, so acceleration is force divided by mass
        const acceleration = force / ball.mass;
        
        // Launch the ball upwards with the calculated acceleration
        // The negative sign is because we want to move the ball in the opposite direction of gravity (upwards)
        ball.speedY = -acceleration; 
        ball.onThrowingMechanism = false; // The ball is no longer on the mechanism
      }
    });
    
    // Reset the compression time after the ball is launched
    throwingMechanism.compressionTime = 0;
  }

  // Reset the height of the throwing mechanism
  throwingMechanism.height += 15;
  throwingMechanism.y -= 15;
  // Ensure that the mechanism does not extend beyond its original size
  if (throwingMechanism.height > 100) {
    throwingMechanism.height = 100;
  }
  if (throwingMechanism.y < H - 120) {
    throwingMechanism.y = H - 120;
  }
}

  }

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = 'palegreen';
  ctx.fillRect(47, 21, W, H);

  ctx.beginPath();
  ctx.arc(W - 140, 140, 100, 0, -1.6, true);
  ctx.stroke();
  ctx.closePath();

  ballsArray.forEach(ball => {    ball.draw();}); 
  drawShadows();

  throwingMechanism.draw();

  drawBorder();
  throwingMech();

  // Draw flippers after the balls
  
 // horizontalFlipper.draw();
  //horizontalFlipper.update();

    // Draw flippers after the balls
    leftFlipper.draw();
    leftFlipper.update();
  
  rightFlipper.draw();
  rightFlipper.update();
  
  drawActualPositions(leftFlipper);
drawActualPositions(rightFlipper);


  //rectFlipper.draw();
  //rectFlipper.update();

    obstacles.forEach(obstacle => {
      obstacle.draw();
    }); 



  requestAnimationFrame(update); // Keep the animation loop running
}

// Event listeners for key presses
window.onload = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === 'z' || event.key === 'Z') {
      // Trigger the flipper action
      flippersKeyPressed = true;
    } else    if (event.key === "ArrowLeft") {
      leftKeyIsPressed = true;
    } else if (event.key === "ArrowRight") {
      rightKeyIsPressed = true;
    } else if (event.key === "ArrowDown") {
      // Only allow pressing down if no ball is currently moving on the mechanism
      const canPressMechanism = ballsArray.every(ball =>
        ball.onThrowingMechanism
      );

      if (canPressMechanism) {
        downKeyIsPressed = true;
        console.log('ArrowDown pressed');
      } 
    }
    // if the event key is the space bar
    else if (event.key === " ") {
      isPause = !isPause
      event.preventDefault()
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === 'z' || event.key === 'Z') {
      // Trigger the flipper action
      flippersKeyPressed = false;
    } else if (event.key === "ArrowLeft") {
      leftKeyIsPressed = false;
    } else if (event.key === "ArrowRight") {
      rightKeyIsPressed = false;
    } else if (event.key === "ArrowDown") {
      downKeyIsPressed = false;
    };
  });
  // Add event listeners for the drag feature
  canvas.addEventListener("mousedown", function(e) {
    setDraggable(e);
    move(e); // Begin the drag on mousedown
  });
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("mouseup", setDraggable);

  
  createBall();  // Start the game with one ball
  update();
};