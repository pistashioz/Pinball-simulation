// get the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//class defining (flipper and ball)
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
    ctx.fillStyle = "#ff0000"; // Red color
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
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff00"; // Green color
    ctx.fill();
    ctx.closePath();
  }
}

const leftFlipper = new Flipper(canvas.width * 0.37, canvas.height - 80, 100, 10, 10, 30);
const rightFlipper = new Flipper(canvas.width * 0.62, canvas.height - 80, -100, -10, 10, 30);
const ball = new Ball(canvas.width / 2, 30, 10, 10, 10);

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //updating the x and y ball coordinates
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball collisions with the canvas boundaries
  if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
    ball.speedX *= -1; // Reverse horizontal direction if the ball hits the canvas horizontal limits
  }

  if (ball.y < ball.radius) {
    ball.speedY *= -1; // Reverse vertical direction if the ball hits the canvas vertical limits
  }

  // Ball collision with the left flipper
  if (
    ball.x > leftFlipper.x - ball.radius - leftFlipper.width / 2 &&
    ball.x < leftFlipper.x + ball.radius + leftFlipper.width / 2 &&
    ball.y > leftFlipper.y - ball.radius - leftFlipper.height / 2 &&
    ball.y < leftFlipper.y + ball.radius + leftFlipper.height / 2
  ) {
    ball.speedY *= -1; // Reverse vertical direction
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
