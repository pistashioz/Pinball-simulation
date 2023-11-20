// Accessing the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Global variables for easier access
const W = canvas.width;
const H = canvas.height;

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
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.compressionTime = 0;  // Track the time the mechanism is compressed
  };

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
  constructor(x, y, radius, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.onThrowingMechanism = false; // New property to track if the ball is on the mechanism
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
  const newBall = new Ball(throwingMechanism.x + throwingMechanism.width / 2, throwingMechanism.y - 120, 10, 0, speedY);
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
  const endAngle = -0.5;

  // Draw the arc
  ctx.beginPath();
  ctx.arc(W - 175, 150, radius, startAngle, endAngle, true);

  ctx.stroke();
  ctx.closePath();
  ctx.restore();


}

// Function to handle all ball collisions
function handleCollisions() {
  const borderWidth = 20 + ctx.lineWidth; // Including the line width in the border size
  const borderWidthRight = 46 + ctx.lineWidth; // Including the line width in the border size
  const throwingMechWidth = 58;
  const throwingMechTop = throwingMechanism.y;

  ballsArray.forEach((ball, index) => {
    // Ball collision with the top of the throwing mechanism
    if (!ball.onThrowingMechanism &&
      ball.x >= throwingMechanism.x &&
      ball.x <= throwingMechanism.x + throwingMechanism.width &&
      ball.y + ball.radius >= throwingMechTop &&
      ball.y + ball.radius <= throwingMechTop + ball.speedY) {
      ball.speedY = -ball.speedY * 0.6; // Invert and reduce the speed to simulate a bounce
      if (Math.abs(ball.speedY) < 1) { // If the speed is very low, stop the ball
        ball.onThrowingMechanism = true;
        ball.speedY = 0;
        ball.y = throwingMechTop - ball.radius; // Adjust ball position to sit on the mechanism
      }
    }
    // If the ball is on the throwing mechanism, stop checking for other collisions
    if (ball.onThrowingMechanism) {
      return;
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
  ctx.arc(W - 150, 150, 100, 0, -2.5, true); 
  ctx.stroke();
  ctx.closePath();
  
// Define the arc parameters
const arcCenterX = W - 150;
const arcCenterY = 150;
const arcRadius = 100;
const arcStartAngle = 0; // Starting at the top of the circle
const arcEndAngle = -1.5; // Specific angle for the arc ending

// Update and draw each ball
ballsArray.forEach(ball => {
  if (!ball.onThrowingMechanism) {
    ball.speedY += 0.2; // Apply gravity effect
    
    // Check if the ball is in the exit path region
    if (ball.x > W - 150 && ball.y < 150) {
      // Determine the current angle based on the ball's position
      let angle = Math.atan2(ball.y - arcCenterY, ball.x - arcCenterX);

      // Check if the ball is within the arc angle range
      if (angle <= arcStartAngle && angle >= arcEndAngle) {
        // Move the ball along the arc
        angle -= 0.05; // This value controls the speed of the ball along the arc
        ball.x = arcCenterX + arcRadius * Math.cos(angle);
        ball.y = arcCenterY + arcRadius * Math.sin(angle);

        // Adjust speed to be tangent to the arc
        ball.speedX = -Math.abs(arcRadius * Math.cos(angle));
        ball.speedY = -Math.abs(arcRadius * Math.sin(angle));
      } else {
        // If the ball has moved past the arc, set a new velocity based on the compression time
        const exitSpeed = Math.min(throwingMechanism.compressionTime * 0.1, 5); // The max exit speed is capped at 5
        console.log(exitSpeed + " seconds");
        //ball.speedX = 5;
        ball.speedY = exitSpeed;
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        throwingMechanism.compressionTime = 0; // Reset the compression time
      }
    } else {
      // Normal movement
      ball.x += ball.speedX;
      ball.y += ball.speedY;
    }
  } else {
    // Make the ball follow the mechanism
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
      throwingMechanism.compressionTime += 0.5; // Increase compression time
    }
  } else {
    if (throwingMechanism.compressionTime > 0) {
      // Calculate force based on compression time
      const force = Math.min(throwingMechanism.compressionTime, 100); // Cap the force to a max value

      // Apply force to the ball that's on the mechanism
      ballsArray.forEach(ball => {
        if (ball.onThrowingMechanism) {
          ball.speedY = -force; // Launch the ball upwards with the calculated force
          ball.onThrowingMechanism = false; // The ball is no longer on the mechanism
        }
      });

      // Reset compression time and restore mechanism's height
     //throwingMechanism.compressionTime = 0;

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
