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
let isPause = false
let pause = false
let obstaclesInCanvas = []


const MIDDLE_OFFSET =   W/2 +13;

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
//Array with obstacles' values
const obstacles = [
  new Obstacle(MIDDLE_OFFSET, H / 2 - 50, 25, 'red'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, 'blue'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, 'green'),
];

//Array with obstacles' in the box values
const obstaclesInBox = [
  new ObstacleInBox(WObs / 2, 30, 25, 'purple'),
  new ObstacleInBox(WObs / 2, 100, 25, 'yellow'),
  new ObstacleInBox(WObs / 2, 255, 25, 'orange'),
  new ObstacleInBox(WObs / 2, 180, 25, 'brown')
]


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
  //define obstacles coordinates in canvas when clicked
  if (obstaclesInBox[i].color === 'yellow') {
    obstaclesInBox[i].x = W / 2 - 100;
    obstaclesInBox[i].y = H / 2 + 120;
  } else if (obstaclesInBox[i].color === 'purple') {
    obstaclesInBox[i].x = W / 2 + 100;
    obstaclesInBox[i].y = H / 2 + 120;
  } else if (obstaclesInBox[i].color === 'brown') {
    obstaclesInBox[i].x = W / 2 - 30;
    obstaclesInBox[i].y = H / 2 + 175;
  } else {
    obstaclesInBox[i].x = W / 2 + 40;
    obstaclesInBox[i].y = H / 2 + 175;
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

function getMousePositionBox(e){
  var rect = canvasObs.getBoundingClientRect();
  //calculate mouse position relative to the canvas
  mousePosition = {
    x: Math.round(e.x - rect.left),
    y: Math.round(e.y - rect.top)
  }
}

function moveInBox(e) {
}


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
   
// Function to handle all ball collisions
function handleCollisions() {
  const borderWidth = 20 + ctx.lineWidth; // Including the line width in the border size
  const borderWidthRight = 46 + ctx.lineWidth; // Including the line width in the border size
  const throwingMechWidth = 58;


     

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


  
  

}



function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxObs.clearRect(0, 0, canvas.width, canvas.height);
  if (!pause) {
    // Update the x and y ball coordinates
    ball.x += ball.speedX;
    //add limits to the ball!! 
    ball.y += ball.speedY;

    handleCollisions();
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
  obstacles.forEach(obstacle => {
    obstacle.draw();
  }); 


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
  //Get every coordinate inside canvas
  return (
    mousePosition.x >= 0 &&
    mousePosition.x <= W &&
    mousePosition.y >= 0 &&
    mousePosition.y <= H
  );
}

//Pause with the space bar

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