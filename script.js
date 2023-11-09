// get the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let b = new Array(); // balls (array of objects)
const W = canvas.width, H = canvas.height;
//class defining (flipper and ball)
const obstacles = []
class Flipper {
  constructor(x, y, width, height, angularSpeed, maxAngle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0; //current angle
    this.angularSpeed = angularSpeed; //flipper speed
    this.maxAngle = maxAngle; //maximum rotation angle
  }

  draw() {
    ctx.save();
    ctx.translate(this.x - this.width / 2, this.y - this.height / 2);
    this.angle = Math.min(Math.max(-this.maxAngle, this.angle), this.maxAngle);
    ctx.rotate(-Math.PI / 180 * this.angle);
    ctx.fillStyle = "#90BE6D"; // Green color
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}

class Ball {
  constructor(x, y, radius, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    //this.bounce = 0.7; //  Bounce factor rubber ball (RUBBER BALL)
    this.gravity = 0.5; // Gravity factor rubber ball (RUBBER BALL)7
    this.friction = 0.98; //FOR WOODEN BALL IS 0.95
    this.restitution = 0.2; //FOR WOODEN IS 0.8
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#255f85"; // Blue color
    ctx.fill();
    ctx.closePath();
  }
  applyFriction() {
    this.speedX *= this.friction;
    this.speedY *= this.friction;
  }
}

class Obstacle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    obstacles.push(this)
}

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.fillStyle = "#ffc857"; // Green color
    ctx.fill();
    ctx.closePath();
  }

}

const leftFlipper = new Flipper(canvas.width * 0.37, canvas.height - 80, 100, 10, 10, 30);
const rightFlipper = new Flipper(canvas.width * 0.62, canvas.height - 80, -100, -10, 10, 30);
const ball = new Ball(canvas.width / 2, 30, 15, 10, 10);
const obstacleCenter = new Obstacle(canvas.width/2, canvas.height/2 - 50, 15)
const obstacleUpperRight = new Obstacle(canvas.width/2 + 100, canvas.height/2 - 150, 15)
const obstacleUpperLeft = new Obstacle(canvas.width/2 - 100 , canvas.height/2 - 150, 15)
const obstacleDownRight = new Obstacle(canvas.width/2 + 100, canvas.height/2 + 50, 15)
const obstacleDownLeft = new Obstacle(canvas.width/2 - 100, canvas.height/2 + 50, 15)

function checkBallObstacleCollision(ball, obstacle) {
  const dx = ball.x - obstacle.x;
  const dy = ball.y - obstacle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ball.radius + obstacle.r) {
    // Collision detected
    return true;
  }

  return false;
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //updating the x and y ball coordinates
  ball.x += ball.speedX;
  ball.y += ball.speedY;

    // Apply gravity
   //ball.speedY += ball.gravity;


  // Ball collisions with the canvas boundaries
  if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
    ball.speedX *= -1 
  }

  if (ball.y < ball.radius) {
    ball.speedY *= -1
  }

  // Ball collision with the left flipper
  if (
    ball.x > leftFlipper.x - ball.radius - leftFlipper.width / 2 &&
    ball.x < leftFlipper.x + ball.radius + leftFlipper.width / 2 &&
    ball.y > leftFlipper.y - ball.radius - leftFlipper.height / 2 &&
    ball.y < leftFlipper.y + ball.radius + leftFlipper.height / 2
  ) {
    ball.speedY *= -1 // * ball.bounce; RUBBER // Reverse and reduce vertical speed;
  }

  // Ball collision with the right flipper
  if (
    ball.x > rightFlipper.x - ball.radius - rightFlipper.width / 2 &&
    ball.x < rightFlipper.x + ball.radius + rightFlipper.width / 2 &&
    ball.y > rightFlipper.y - ball.radius - rightFlipper.height / 2 &&
    ball.y < rightFlipper.y + ball.radius + rightFlipper.height / 2
  ) {
    ball.speedY *= -1; // Reverse vertical direction
  }

  for (const obstacle of obstacles) {
    if (checkBallObstacleCollision(ball, obstacle)) {
      // Handle collision, e.g., reverse ball direction or apply some effect
      ball.speedY *= -1; // Reverse vertical direction
    }
  }

  // Update the left flipper angle
  if (leftKeyIsPressed) {
    leftFlipper.angle += leftFlipper.angularSpeed;
  } else {
    leftFlipper.angle -= leftFlipper.angularSpeed;
  }

  // Update the right flipper angle
  if (rightKeyIsPressed) {
    rightFlipper.angle -= rightFlipper.angularSpeed;
  } else {
    rightFlipper.angle += rightFlipper.angularSpeed;
  }

  

  // Draw the flippers and ball
  ball.draw();
  leftFlipper.draw();
  rightFlipper.draw();
  obstacleCenter.draw();
  obstacleUpperRight.draw();
  obstacleUpperLeft.draw();
  obstacleDownLeft.draw();
  obstacleDownRight.draw()

  requestAnimationFrame(update);
}


let leftKeyIsPressed = false;
let rightKeyIsPressed = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    leftKeyIsPressed = true;
  } else if (event.key === "ArrowRight") {
    rightKeyIsPressed = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    leftKeyIsPressed = false;
  } else if (event.key === "ArrowRight") {
    rightKeyIsPressed = false;
  }
});

update();
