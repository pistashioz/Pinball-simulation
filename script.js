// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.75;

let leftKeyIsPressed = false;
let rightKeyIsPressed = false;
let downKeyIsPressed = false;

let ballsArray = []; // Array to store all the balls

// Class defining a flipper
class Flipper {
  constructor(x, y, width, height, angularSpeed, maxAngle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0; // Current angle
    this.angularSpeed = angularSpeed; // Flipper speed
    this.maxAngle = maxAngle; // Maximum rotation angle
  }

  // Method to draw flipper on canvas
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    this.angle = Math.min(Math.max(-this.maxAngle, this.angle), this.maxAngle);
    ctx.rotate(-Math.PI / 180 * this.angle);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

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
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();

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
    this.mass = this.setMassBasedOnMaterial(material);
    this.onThrowingMechanism = false;
  }
  
  setMassBasedOnMaterial(material) {
    switch (material) {
      case 'steel':
        return 1; // mass in grams for a steel ball
      case 'wood':
        return 0.5; // mass in grams for a wooden ball
      case 'rubber':
        return 0.25; // mass in grams for a rubber ball
      default:
        return 1; // default to steel if no material is matched
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

// Instantiating the flippers
const leftFlipper = new Flipper(W * 0.33, H - 80, 65, 10, 10, 30);
const rightFlipper = new Flipper(W * 0.57, H - 80, -65, -10, 10, 30);
const throwingMechanism = new ThrowingMechanism(W - 57, H - 120, 20, 100);


// Function to create a new ball and add it to the balls array
function createBall() {
  const speedX = 5 * (Math.random() > 0.5 ? 1 : -1); // Random horizontal speed
  const speedY = 5; // Always start with the same upward speed
  // const newBall = new Ball(W / 2, 40, 10, speedX, speedY);
  // Place the second ball above the throwing mechanism
  const newBall = new Ball(throwingMechanism.x + throwingMechanism.width / 2, throwingMechanism.y - 100, 10, 0, speedY, 'rubber');
  ballsArray.push(newBall);
}

// Function to remove a ball from the array and create a new one
function removeBall(index) {
  ballsArray.splice(index, 1);

  /* leftFlipper.angle = Math.min(Math.max(-leftFlipper.maxAngle, leftFlipper.angle), leftFlipper.maxAngle)
  console.log(leftFlipper.angle); 
  rightFlipper.angle = Math.min(Math.max(-rightFlipper.maxAngle, rightFlipper.angle), rightFlipper.maxAngle)
  console.log(rightFlipper.angle); */

  createBall();
}

function drawShadows() {

  ctx.save();
  ctx.lineWidth = 4;
  ctx.fillStyle = "black"
  ctx.strokeStyle = 'pink';
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
    { moveTo: [26, 0], lineTo: [46, 20], close: [46, H - 20], end: [26, H] },
    { moveTo: [W, 0], lineTo: [W - 20, 20], close: [W - 20, H - 20], end: [W, H] },
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
  ctx.moveTo(W - 75, H-20);
  ctx.lineTo(W - 75, 150);
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
  ctx.arc(W - 175, 150, radius, startAngle, endAngle, true);

  ctx.stroke();
  ctx.restore();




}

// Function to handle all ball collisions
function handleCollisions() {
  const borderWidth = 20 + ctx.lineWidth; // Including the line width in the border size
  const borderWidthRight = 46 + ctx.lineWidth; // Including the line width in the border size
  const throwingMechWidth = 58;
  const throwingMechTop = throwingMechanism.y;
  const throwingMechBottom = throwingMechanism.y + throwingMechanism.height;

  // Constants for collision handling
  const BOUNCE_THRESHOLD = 2; // Minimum speed for bounce
  const RESTITUTION = 0.3; // Bounce restitution factor

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
          ball.speedY = -ball.speedY * RESTITUTION;
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
      ball.speedY *= -1;
    }

    // Bottom border collision
    if (ball.y + ball.radius > H && ball.speedY > 0) {
      // alert('You lost! Click OK to launch a new ball.');
      removeBall(index);
      return;
    }

    // Left and right border collision
    if ((ball.x - ball.radius < borderWidthRight && ball.speedX < 0) ||
      (ball.x + ball.radius > W - borderWidth - throwingMechWidth && ball.speedX > 0)) {
      ball.speedX *= -1;
    }

    // Calculate flipper edges based on current angle
    /*const flipperEdgeX = flipper.x + Math.cos(flipper.angle * Math.PI / 180) * flipper.width / 2;
    const flipperEdgeY = flipper.y + Math.sin(flipper.angle * Math.PI / 180) * flipper.height / 2;*/

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
  });
}

// The update function, called once per frame
function update() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'palegreen';
  ctx.fillRect(26, 20, W, H);

  ctx.beginPath();
  ctx.arc(W - 145, 140, 100, -0.5, -1.6, true);
  ctx.stroke();
  ctx.closePath();

// Define the arc parameters
const arcCenterX = W - 145;
const arcCenterY = 140;
const arcRadius = 100;
const arcStartAngle = -0.5; // Starting at the top of the circle
const arcEndAngle = -1.6; // Specific angle for the arc ending


// Update and draw each ball
ballsArray.forEach(ball => {
  if (!ball.onThrowingMechanism) {
    ball.speedY += GRAVITY; // Apply gravity effect
    
    // Determine the current angle based on the ball's position
    let ballAngle = Math.atan2(ball.y - arcCenterY, ball.x - arcCenterX);
    

    console.log(throwingMechanism.compressionTime);
    
    // Check if the ball is still following the arc
    if (ballAngle <= arcStartAngle && ballAngle >= arcEndAngle) {
      //Check if the ball is moving upwards and has not yet lost all its upward force
      


      // Calculate the speed of the ball along the arc based on compression time
      const arcSpeed = ball.speedY ; // Adjust as needed
      
      // Move the ball along the arc
      ballAngle -= arcSpeed; // Control the speed of the ball along the arc
      ball.x = arcCenterX + arcRadius * Math.cos(ballAngle);
      ball.y = arcCenterY + arcRadius * Math.sin(ballAngle);
      
      // Adjust speed to be tangent to the arc
      ball.speedX = -Math.abs(arcRadius * Math.cos(ballAngle));
      ball.speedY = -Math.abs(arcRadius * Math.sin(ballAngle));
      

    } else {
      // If the ball has moved past the arc, set a new velocity based on the compression time
      /*if (ballAngle < arcEndAngle && throwingMechanism.compressionTime > 0) {
        const exitSpeed = Math.min(throwingMechanism.compressionTime, 5); // Cap the speed to a max value
        console.log(exitSpeed);
        ball.speedX = exitSpeed * Math.cos(arcEndAngle); 
        ball.speedY = exitSpeed * Math.sin(arcEndAngle);
        
        console.log(`The speed of the ball is ${ball.speedX} speedX and ${ball.speedY} speedY.`);

        throwingMechanism.compressionTime = 0; // Reset the compression time
      }*/
            // Normal free fall motion if the ball is not on the arc path
            ball.x += ball.speedX;
  
            ball.y += ball.speedY;

            throwingMechanism.compressionTime = 0;
          }
        } else {
          // Make the ball follow the mechanism if it is on it
            // Center the ball on the mechanism
          ball.x = throwingMechanism.x + throwingMechanism.width / 2;
          ball.y = throwingMechanism.y - ball.radius;
        }
        
        ball.draw();
      });
      
      
      
     


  drawShadows();

  throwingMechanism.draw();

  drawBorder();
  throwingMech();

  handleCollisions();

  // Update flipper angles based on key presses
  if (leftKeyIsPressed) {
    leftFlipper.angle += leftFlipper.angularSpeed;
  } else {
    leftFlipper.angle -= leftFlipper.angularSpeed;
  }

  if (rightKeyIsPressed) {
    rightFlipper.angle -= rightFlipper.angularSpeed;
  } else {
    rightFlipper.angle += rightFlipper.angularSpeed;
  }

  // If the down arrow key is pressed, reduce the height of the throwing mechanism
  if (downKeyIsPressed) {

    if (throwingMechanism.height > 16) {
      throwingMechanism.height -= 1;
      throwingMechanism.y += 1;
      throwingMechanism.compressionTime += 60; // Increase compression time
      
    }
  } else {
    if (throwingMechanism.compressionTime > 0) {
      // Calculate force based on compression time
     // const force = Math.min(throwingMechanism.compressionTime, 100); // Cap the force to a max value
      const force = throwingMechanism.compressionTime * throwingMechanism.stiffness; 
      console.log(`The force value is ${force}`);
      // Apply force to the ball that's on the mechanism
      ballsArray.forEach(ball => {
        if (ball.onThrowingMechanism) {
          ball.speedY = -force / ball.mass; // Launch the ball upwards with the calculated force  
          console.log(`The ball speed Y is ${ball.speedY}`);
          ball.speedX = 0;    // Reset the horizontal velocity if you want the ball to only move upwards
          ball.onThrowingMechanism = false; // The ball is no longer on the mechanism
        }
      });
  
       throwingMechanism.compressionTime = 0; // Reset the compression time

    }

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



  // Draw flippers after the balls
  leftFlipper.draw();
  rightFlipper.draw();


  // Request the next frame
  requestAnimationFrame(update);
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


  createBall();  // Start the game with one ball
  update();
};


