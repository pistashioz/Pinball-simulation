//dropdown

function showToggle() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


// get the pinball canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
//get the obstacle box canvas and context
const canvasObs = document.getElementById('canvasObs');
const ctxObs = canvasObs.getContext('2d')
const WObs = canvasObs.width, HObs = canvasObs.height;

let isMouseDown = false;
let focused = { state: false, key: null };
let pause = false
let obstaclesInCanvas = []



//sound effects
const bounceSound = new Audio("assets/audio/jump.wav");
const bounceFlippers = new Audio("assets/audio/jumpFlipper.wav")
const grabObstacles = new Audio('assets/Audio/grab.wav')


//Classes 
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
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#255f85"; // Blue color
    ctx.fill();
    ctx.closePath();
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
    //Bigger circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = this.color; // Green color
      ctx.fill();
      ctx.closePath();
  
      //Smaller circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r / 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF"; // Green color
      ctx.fill();
      ctx.closePath();  
  
  }

  //shake effect in obstacles
  shake() {
      if (this.shakeFrames > 0) {
        // update  x and y coordinates with random values within a specified range
        this.x += Math.random() * this.shakeMagnitude - this.shakeMagnitude / 2;
        this.y += Math.random() * this.shakeMagnitude - this.shakeMagnitude / 2;
        // decrease the number of remaining shake frames
        this.shakeFrames--;
    }

  }
}

class ObstacleInBox{
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color
    this.shakeFrames = 5;
    this.shakeMagnitude = 5; // Adjust the magnitude of the shake
  }
  draw() {
    //Bigger circle
      ctxObs.beginPath();
      ctxObs.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctxObs.fillStyle = this.color; // Green color
      ctxObs.fill();
      ctxObs.closePath();
  
      //Smaller circle
      ctxObs.beginPath();
      ctxObs.arc(this.x, this.y, this.r / 3, 0, 2 * Math.PI);
      ctxObs.fillStyle = "#FFFFFF"; // Green color
      ctxObs.fill();
      ctxObs.closePath();  
  
  }
}


const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 120, 50, 10, 30, 'assets/img/leftFlipper.svg');
const rightFlipper = new Flipper(canvas.width * 0.65, canvas.height - 95, -120, -50, 10, 30, 'assets/img/rightFlipper.svg');
const ball = new Ball(canvas.width / 2, 30, 15, 10, 10);
//Array with obstacles' values
const obstacles = [
  new Obstacle(W / 2, H / 2 - 50, 25, 'red'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, 'blue'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, 'green')
]
//Array with obstacles' in the box values
const obstaclesInBox = [
  new ObstacleInBox(WObs / 2, HObs / 2, 25, 'purple'),
  new ObstacleInBox(WObs / 2, HObs / 2 + 100, 25, 'yellow'),
  new ObstacleInBox(WObs / 2, HObs / 2 - 100, 25, 'orange')
]


//Function to check for collision between the ball and an obstacle
function checkBallObstacleCollision(ball, obstacle) {
  //calculate the distance between the center of the ball and the center of the obstacle
  const dx = ball.x - obstacle.x;
  const dy = ball.y - obstacle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  //check if the distance is less than the sum of the ball and obstacle radius 
  if (distance < ball.radius + obstacle.r) {
    // Collision detected so we play a bounce sound
    bounceSound.play();
    //trigger a shaking effect on the obstacle
    obstacle.shakeFrames = 10;
    //the collision ocurred
    return true;
  }
  //in case no collision was detected
  return false;
}
function draw(){
      //clear canvas
      ctx.clearRect(0, 0, W, H);
      leftFlipper.draw();
      rightFlipper.draw();
      //draw each obstacle in obstacles array
      for (const obstacle of obstacles) {
        obstacle.draw();
      }
}



function moveInBox(e) {
  //check if mouse btn is not pressed
  if (!isMouseDown) {
    return;
  }
  getMousePositionBox(e);

  //check if an obstacle is focused for movement
  if (focused.state) {
    //update the focused obstacle's position to the mouse position
    obstaclesInBox[focused.key].x = mousePosition.x;
    obstaclesInBox[focused.key].y = mousePosition.y;

    draw();
    return;
  }
  //if no obstacle is focused
  for (var i = 0; i < obstaclesInBox.length; i++) {
    //check if mouse intersects with an obstacle
    if (intersects(obstaclesInBox[i])) {
      //play audio if intersection is detected and change focused state to true so we can store the index of the focused obstacle
      grabObstacles.play()
      focused.state = true;
      focused.key = i;
      //increase the size of the current obstacle to be perceived as we grabbed it
      obstaclesInBox[i].r = 35;
      break;
    }
  }

  draw();
}




function move(e) {
  //check if mouse btn is not pressed
  if (!isMouseDown) {
    return;
  }
  getMousePosition(e);

  //check if an obstacle is focused for movement
  if (focused.state) {
    //update the focused obstacle's position to the mouse position
    obstacles[focused.key].x = mousePosition.x;
    obstacles[focused.key].y = mousePosition.y;

    draw();
    return;
  }
  //if no obstacle is focused
  for (var i = 0; i < obstacles.length; i++) {
    //check if mouse intersects with an obstacle
    if (intersects(obstacles[i])) {
      //play audio if intersection is detected and change focused state to true so we can store the index of the focused obstacle
      grabObstacles.play()
      focused.state = true;
      focused.key = i;
      //increase the size of the current obstacle to be perceived as we grabbed it
      obstacles[i].r = 35;
      break;
    }
  }

  draw();
}

function setDraggable(e) {
  let type = e.type;
  if (type === "mousedown") {
    isMouseDown = true;
    moveOutsideCanvas(e);
  } else if (type === "mouseup") {
    for (let i = 0; i < obstacles.length; i++) {
      if (intersects(obstacles[i])) {
        obstacles[i].r = 25;
      }
    }
    isMouseDown = false;
    releaseFocus();
  }
}
function setClickable(e){
  let type = e.type;
  if(type === 'click'){
    handleClickBox(e)
  }
}

function handleClickBox(e){
  getMousePositionBox(e);
    // Check if an obstacle is clicked
    for (var i = 0; i < obstaclesInBox.length; i++) {

      if (intersects(obstaclesInBox[i])) {
        // Handle the click on the obstacle
        handleObstacleClick(i);
        break;
      }
    }
  
    draw();
}

function handleObstacleClick(i){
  grabObstacles.play();

  // Handle the obstacle click here
  if (obstaclesInBox[i].color === 'yellow') {
    obstaclesInBox[i].x = W / 2 - 100;
    obstaclesInBox[i].y = H / 2 + 50;
  } else if (obstaclesInBox[i].color === 'purple') {
    obstaclesInBox[i].x = W / 2 + 100;
    obstaclesInBox[i].y = H / 2 + 50;
  } else {
    obstaclesInBox[i].x = W / 2;
    obstaclesInBox[i].y = H / 2 + 100;
  }

  // Create a new Obstacle based on the properties of the focused obstacle in the box
  const newObstacle = new Obstacle(obstaclesInBox[i].x, obstaclesInBox[i].y, 25, obstaclesInBox[i].color);

  // Add the selected obstacle inside obstaces array
  obstacles.push(newObstacle);

  // Remove the obstacle from the obstaclesInBox array
  obstaclesInBox.splice(i, 1);

  // Redraw canvas to show the new obstacle
  draw();
}

function releaseFocus(){
  focused.state = false
}

function getMousePosition(e){
  var rect = canvas.getBoundingClientRect();
  //calculate mouse position relative to the canvas
  mousePosition = {
    x: Math.round(e.x - rect.left),
    y: Math.round(e.y - rect.top)
  }
}

function getMousePositionBox(e){
  var rect = canvasObs.getBoundingClientRect();
  //calculate mouse position relative to the canvas
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
  ctxObs.clearRect(0, 0, canvas.width, canvas.height);
  if (!pause) {
    // Update the x and y ball coordinates
    ball.x += ball.speedX;
    //add limits to the ball!! 
    ball.y += ball.speedY;


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
  for (const obstacle of obstaclesInBox){
    obstacle.draw();
  }

  requestAnimationFrame(update);
}

function moveOutsideCanvas(e) {
  if (isMouseDown && focused.state) {
    getMousePosition(e);
    if (isMouseInsideCanvas()) {
      obstacles[focused.key].x = mousePosition.x;
      obstacles[focused.key].y = mousePosition.y;
    }
    draw();
  }
}

function releaseOutsideCanvas() {
  if (isMouseDown && focused.state) {
    if (isMouseInsideCanvas()) {
      obstacles[focused.key].r = 25;
    }
    isMouseDown = false;
    releaseFocus();
  }
}

function isMouseInsideCanvas() {
  return (
    mousePosition.x >= 0 &&
    mousePosition.x <= W &&
    mousePosition.y >= 0 &&
    mousePosition.y <= H
  );
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

canvasObs.addEventListener("click", setClickable);
canvasObs.addEventListener("mousemove", moveInBox);

window.addEventListener("mousemove", moveOutsideCanvas);
window.addEventListener("mouseup", releaseOutsideCanvas);

update();