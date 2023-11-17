// get the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let b = new Array(); // balls (array of objects)
const W = canvas.width, H = canvas.height;
let isMouseDown = false;
let focused = { state: false, key: null };
let pause = false

//sound effects
const bounceSound = new Audio("assets/audio/jump.wav");
var bounceFlippers = new Audio("assets/audio/jumpFlipper.wav")



class Flipper {
  constructor(x, y, width, height, angularSpeed, maxAngle, imagePath) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0; //current angle
    this.angularSpeed = angularSpeed; //flipper speed
    this.maxAngle = maxAngle; //maximum rotation angle
    this.image = new Image();
    this.image.src = imagePath;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x - this.width / 2, this.y - this.height / 2);
    this.angle = Math.min(Math.max(-this.maxAngle, this.angle), this.maxAngle);
    ctx.rotate(-Math.PI / 180 * this.angle);
    ctx.drawImage(this.image, 0, 0, this.width, this.height);// Green color

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
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color
    this.shakeFrames = 5;
    this.shakeMagnitude = 5; // Adjust the magnitude of the shake
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color; // Green color
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r / 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF"; // Green color
    ctx.fill();
    ctx.closePath();

    
  }

  shake() {
    if (this.shakeFrames > 0) {
      this.x += Math.random() * this.shakeMagnitude - this.shakeMagnitude / 2;
      this.y += Math.random() * this.shakeMagnitude - this.shakeMagnitude / 2;
      this.shakeFrames--;
    }
  }
}
const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 120, 50, 10, 30, 'assets/img/leftFlipper.svg');
const rightFlipper = new Flipper(canvas.width * 0.65, canvas.height - 95, -120, -50, 10, 30, 'assets/img/rightFlipper.svg');
const ball = new Ball(canvas.width / 2, 30, 15, 10, 10);
const obstacles = [
  new Obstacle(W / 2, H / 2 - 50, 25, 'red'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, 'blue'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, 'green'),
  new Obstacle(W / 2 + 100, H / 2 + 50, 25, 'purple'),
  new Obstacle(W / 2 - 100, H / 2 + 50, 25,'yellow'),
];


function checkBallObstacleCollision(ball, obstacle) {

  const dx = ball.x - obstacle.x;
  const dy = ball.y - obstacle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ball.radius + obstacle.r) {
    // Collision detected
    bounceSound.play();
    obstacle.shakeFrames = 10;
    return true;
  }

  return false;
}
function draw(){
      //clear canvas
      ctx.clearRect(0, 0, W, H);
      leftFlipper.draw();
      rightFlipper.draw();
      for (const obstacle of obstacles) {
        obstacle.draw();
      }
}

function move(e) {
  if (!isMouseDown) {
    return;
  }
  getMousePosition(e);

  if (focused.state) {
    obstacles[focused.key].x = mousePosition.x;
    obstacles[focused.key].y = mousePosition.y;

    draw();
    return;
  }

  for (var i = 0; i < obstacles.length; i++) {
    if (intersects(obstacles[i])) {
      focused.state = true;
      focused.key = i;
      obstacles[i].r = 35;
      break;
    }
  }

  draw();
}


function setDraggable(e) {
  var t = e.type;
  if (t === "mousedown") {
    isMouseDown = true;
  } else if (t === "mouseup") {
    for (var i = 0; i < obstacles.length; i++) {
      if (intersects(obstacles[i])) {
        obstacles[i].r = 25;
      }
    }
    isMouseDown = false;
    releaseFocus();
  }
}


function releaseFocus(){
  focused.state = false
}

function getMousePosition(e){
  var rect = canvas.getBoundingClientRect();
  mousePosition = {
    x: Math.round(e.x - rect.left),
    y: Math.round(e.y - rect.top)
  }
}
function intersects(obstacle) {
  // subtract the x, y coordinates from the mouse position to get coordinates 
  // for the hotspot location and check against the area of the radius
  var areaX = mousePosition.x - obstacle.x;
  var areaY = mousePosition.y - obstacle.y;
  //return true if x^2 + y^2 <= radius squared.
  return areaX * areaX + areaY * areaY <= obstacle.r * obstacle.r;
}

draw();
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!pause) {
    // Update the x and y ball coordinates
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Apply gravity
    // ball.speedY += ball.gravity;

    // Ball collisions with the canvas boundaries
    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
      
      ball.speedX *= -1;
    }

    if (ball.y < ball.radius) {
    
      ball.speedY *= -1;
    }

    // Ball collision with the left flipper
    if (
      ball.x > leftFlipper.x - ball.radius - leftFlipper.width / 2 &&
      ball.x < leftFlipper.x + ball.radius + leftFlipper.width / 2 &&
      ball.y > leftFlipper.y - ball.radius - leftFlipper.height / 2 &&
      ball.y < leftFlipper.y + ball.radius + leftFlipper.height / 2
    ) {
      bounceFlippers.play();
      ball.speedY *= -1; // Reverse vertical direction
    }

    // Ball collision with the right flipper
    if (
      ball.x > rightFlipper.x - ball.radius - rightFlipper.width / 2 &&
      ball.x < rightFlipper.x + ball.radius + rightFlipper.width / 2 &&
      ball.y > rightFlipper.y - ball.radius - rightFlipper.height / 2 &&
      ball.y < rightFlipper.y + ball.radius + rightFlipper.height / 2
    ) {
      bounceFlippers.play()
      ball.speedY *= -1; // Reverse vertical direction
    }

    for (const obstacle of obstacles) {
      obstacle.shake();
      if (checkBallObstacleCollision(ball, obstacle)) {
        
        // Reverse ball direction and apply shake effect on obstacle
        ball.speedY *= -1; // Reverse vertical direction
        //cambiar la posicion frame por frame
      }
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
  for (const obstacle of obstacles) {
    obstacle.draw();
  }

  requestAnimationFrame(update);
}

//pause with the space bar

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    pause = !pause
    event.preventDefault()
  }
});



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
canvas.addEventListener("mousedown", setDraggable);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", setDraggable);

update();
