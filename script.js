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
let downKeyIsPressed = false;

let ballsArray = []; // Array to store all the balls




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

// Instantiating the flippers with a maximum angle they can rotate
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 60, 30, 5, 30, 'left');
const rightFlipper = new Flipper(canvas.width * 0.65, canvas.height - 90, 60, 30, 5, -30, 'right');


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
    //this.inPlay = true;
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
    console.log(`Drag skipped - isPaused: ${isPause}, isMouseDown: ${isMouseDown}`);
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

    console.log(`Obstacle ${focused.key} moved to - X: ${newX}, Y: ${newY}`);
    
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
  // Calculate the normal vector at the point of collision
  const normal = { x: ball.x - obstacle.originalX, y: ball.y - obstacle.originalY };
  const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  normal.x /= normalLength;
  normal.y /= normalLength;

  // Calculate dot product of ball's velocity and the normal
  const dot = ball.speedX * normal.x + ball.speedY * normal.y;

  // Reflect the ball's velocity vector over the normal vector
  ball.speedX = ball.speedX - 2 * dot * normal.x;
  ball.speedY = ball.speedY - 2 * dot * normal.y;

  // This would be the place to adjust ball's speed to simulate energy loss
   ball.speedX *= 0.95; 
   ball.speedY *= 0.95;
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

    // Left flipper collision
    if (ball.x > leftFlipper.x - leftFlipper.width / 2 - ball.radius &&
      ball.x < leftFlipper.x + leftFlipper.width / 2 + ball.radius &&
      ball.y > leftFlipper.y - leftFlipper.height / 2 - ball.radius &&
      ball.y < leftFlipper.y + leftFlipper.height / 2 + ball.radius) {
      ball.speedY *= -1; // Reflect the ball vertically
    }

    // Right flipper collision
    if (ball.x > rightFlipper.x - rightFlipper.width / 2 - ball.radius &&
      ball.x < rightFlipper.x + rightFlipper.width / 2 + ball.radius &&
      ball.y > rightFlipper.y - rightFlipper.height / 2 - ball.radius &&
      ball.y < rightFlipper.y + rightFlipper.height / 2 + ball.radius) {
      ball.speedY *= -1; // Reflect the ball vertically
    }

    //Check for collision between the ball and an obstacle
obstacles.forEach(obstacle => {
  let dx = obstacle.originalX - ball.x;
  let dy = obstacle.originalY - ball.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  const sumOfRadii = ball.radius + obstacle.r + 2; //adding two because of the stroke

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
  
  rightFlipper.draw();
  leftFlipper.draw();

  leftFlipper.update();
  rightFlipper.update();
    // Always draw the obstacles, even when paused
    obstacles.forEach(obstacle => {
      obstacle.draw();
    }); 



  requestAnimationFrame(update); // Keep the animation loop running
}

// Event listeners for key presses
window.onload = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
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
    if (event.key === "ArrowLeft") {
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