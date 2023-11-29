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

let mousePosition = { x: 0, y: 0 };
let isMouseDown = false;
let focused = { state: false, key: null };
let isPause = false;


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

const leftFlipper = new Flipper(canvas.width * 0.35, canvas.height - 90, 120, 50, 10, 30, 'assets/img/leftFlipper.svg');

const rightFlipper = new Flipper(canvas.width * 0.65, canvas.height - 95, -120, -50, 10, 30, 'assets/img/rightFlipper.svg');

const ball = new Ball(canvas.width / 2, 30, 15, 10, 10);

const obstacles = [
  new Obstacle(W/2 , H / 2 - 50, 25, 'red'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, 'blue'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, 'green'),
];

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault(); // Prevent the default context menu
  getMousePosition(event); // Update the mouse position
  // Check if right-click intersects with an obstacle
  const obstacleToRemove = obstacles.findIndex(obstacle => intersects(obstacle));
  if (obstacleToRemove !== -1) {
    removeObstacleFromCanvas(obstacleToRemove, obstacles[obstacleToRemove].color);
  }
});
// This handler will be responsible for starting the drag event
function dragStartHandler(event) {
  if (!isPause) {
    alert("The game must be paused to move obstacles.");
    event.preventDefault(); // Prevent dragging
  } else {
    event.dataTransfer.setData("text/plain", event.target.id);
  }
}

function removeObstacleFromCanvas(index, obstacleColor) {
  // Check if the obstacle exists
  if (index < 0 || index >= obstacles.length || !isPause) {
    alert ('Please pause the simulation to remove obstacles.');
    return; // If the index is out of bounds, do nothing
  }

  // Remove the obstacle from the canvas
  obstacles.splice(index, 1);

  // Add an obstacle image back to the DOM
  const obstacleDiv = document.getElementById('obstacle-images');
  const newObstacleImage = document.createElement('img');
  newObstacleImage.src = `/assets/img/OBSTACLE_${obstacleColor}.png`; // Make sure the path matches the obstacle color
  newObstacleImage.classList.add("draggable-obstacle");
  newObstacleImage.id = 'obstacle-'+obstacleColor;
  newObstacleImage.draggable = true;
  newObstacleImage.addEventListener('dragstart', dragStartHandler); // Add the dragstart event listener
  obstacleDiv.appendChild(newObstacleImage);

  update(); // Redraw the canvas
}



// This function will update the draggability of obstacles based on isPause

  const draggableObstacles = document.querySelectorAll('.draggable-obstacle');
  draggableObstacles.forEach(obstacle => {

      obstacle.addEventListener('dragstart', dragStartHandler);
    
  });


// Existing dragover listener updated
document.body.addEventListener('dragover', function(event) {
  event.preventDefault(); // Necessary to allow a drop
  event.dataTransfer.dropEffect = "move"; // Indicate the drop effect as "move"
});

// New dragenter listener added
document.body.addEventListener('dragenter', function(event) {
  event.preventDefault(); // Necessary to make the drop zone valid
});
document.body.addEventListener('drop', function(event) {
  if (!isPause) {
    alert("You can only add obstacles to the canvas while the game is paused.");
    event.preventDefault(); // Prevent the default behavior
    return;
  }
  event.preventDefault();
  document.body.style.cursor = "default"; // Reset cursor after drop
  var obstacleId = event.dataTransfer.getData("text");
  
  // Calculate the drop position relative to the canvas
  var canvasRect = canvas.getBoundingClientRect();
  var x = event.clientX - canvasRect.left;
  var y = event.clientY - canvasRect.top;
  
  // Remove the corresponding obstacle image from the DOM
  var obstacleImage = document.getElementById(obstacleId);
  if (obstacleImage) {
    obstacleImage.remove();
  }

  // Add the obstacle to the canvas at the drop position
  addObstacleToCanvas(obstacleId, x, y);
});

// Function to add an obstacle to the canvas
function addObstacleToCanvas(obstacleId, x, y) {
  if (!isPause) {
    alert("The game must be paused to move obstacles.");
    // If the game is not paused, do nothing
    return;
  }
  if (obstacles.length >= 5) {
    alert("Maximum number of obstacles reached. Cannot add more.");
    return;
  } 
  // Determine the color based on the obstacle ID
  var color;
  switch (obstacleId) {
    case 'obstacle-red':
      color = 'red';
      break;
    case 'obstacle-blue':
      color = 'blue';
      break;
    case 'obstacle-green':
      color = 'green';
      break;
    default:
      color = 'unknown'; // Or any default color
  }

  // Create a new Obstacle object with the correct color and add it to your obstacles array
  var newObstacle = new Obstacle(x, y, 25, color);
  obstacles.push(newObstacle);
}


// Function to handle moving an obstacle
function move(e) {
  getMousePosition(e);
  if (focused.state) {
    const obstacle = obstacles[focused.key];
    // Calculate new position within canvas borders
    const newX = Math.max(obstacle.r, Math.min(W - obstacle.r, mousePosition.x));
    const newY = Math.max(0 + obstacle.r, Math.min(H - obstacle.r, mousePosition.y));

    // Check if the obstacle is within the draggable zone
    if (newX - obstacle.r/2 < zoneX || newX + obstacle.r/2 > zoneX + zoneWidth ||
        newY - obstacle.r/2 < zoneY || newY + obstacle.r/2 > zoneY + zoneHeight) {
      //alert("Obstacles need to be placed within the designated zone.");

      // Reset obstacle position to its original position
      /*setInterval((

      ) => {        obstacle.originalX = obstacle.x,
        obstacle.originalY = obstacle.y}, 2000);*/
        obstacle.originalX =  obstacle.originalX
        obstacle.originalY =   obstacle.originalY 
    } else {
      // Update obstacle position
      obstacle.originalX = newX;
      obstacle.originalY = newY;
    }
  }
}

// Global variables for draggable zone boundaries
const zoneX = 50;
const zoneY = 50;
const zoneWidth = canvas.width - 100;
const zoneHeight = canvas.height - 200;

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
    x: e.clientX - rect.left - (parseInt(window.getComputedStyle(canvas).borderWidth) || 0),
    y: e.clientY - rect.top - (parseInt(window.getComputedStyle(canvas).borderWidth) || 0)
  };
}

function intersects(obstacle) {
  const areaX = mousePosition.x - obstacle.originalX;
  const areaY = mousePosition.y - obstacle.originalY;
  // Check if the right-click is within the obstacle's radius
  return areaX * areaX + areaY * areaY <= obstacle.r * obstacle.r;
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
   
  // Function to reset the ball to its initial position and velocity
function resetBall() {
  // Reset ball properties
  ball.x = canvas.width / 2;
  ball.y = 30;
  ball.speedX = 10; // Reset to initial horizontal speed
  ball.speedY = 10; // Reset to initial vertical speed

  // If there are any more properties that you want to reset, do it here
}

// Function to handle all ball collisions
function handleCollisions() {


         // Top border collision
    if (ball.y  < ball.radius && ball.speedY < 0) {
      ball.speedY *= -1;
    }
  // Bottom border collision
  if (ball.y + ball.radius > canvas.height && ball.speedY > 0) {
   
    isPause = false;
    resetBall(); // Call the reset function instead of removeBall
    return;
  }

  // Right border collision
  if (ball.x + ball.radius > canvas.width && ball.speedX > 0) {
    
    ball.speedX *= -1;
  }

  // Left border collision
  if (ball.x - ball.radius < 0 && ball.speedX < 0) {
    
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


}

// Function to draw the draggable zone rectangle
function drawDraggableZone() {
  const zoneX = 50; // X-coordinate of the rectangle
  const zoneY = 50; // Y-coordinate of the rectangle
  const zoneWidth = canvas.width - 100; // Width of the rectangle
  const zoneHeight = canvas.height - 200; // Height of the rectangle

  ctx.save(); // Save the current state of the canvas
  ctx.setLineDash([10, 5]); // Set dashed lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black stroke
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Semi-transparent white fill
  ctx.rect(zoneX, zoneY, zoneWidth, zoneHeight);
  ctx.fill(); // Fill the rectangle
  ctx.stroke(); // Stroke the rectangle

  ctx.restore(); // Restore the state of the canvas
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (isPause) {
    drawDraggableZone(); // Draw the draggable zone when the game is paused
}
  if (!isPause) {
    // Update the x and y ball coordinates
    ball.x += ball.speedX;
   
    ball.y += ball.speedY;

    handleCollisions();


    // Ball collision with the left flipper
    if (
      ball.x > leftFlipper.x - ball.radius - leftFlipper.width / 2 &&
      ball.x < leftFlipper.x + ball.radius + leftFlipper.width / 2 &&
      ball.y > leftFlipper.y - ball.radius - leftFlipper.height / 2 &&
      ball.y < leftFlipper.y + ball.radius + leftFlipper.height / 2
    ) {
      //bounceFlippers.play();
      ball.speedY *= -1; // Reverse vertical direction
    }

    // Ball collision with the right flipper
    if (
      ball.x > rightFlipper.x - ball.radius - rightFlipper.width / 2 &&
      ball.x < rightFlipper.x + ball.radius + rightFlipper.width / 2 &&
      ball.y > rightFlipper.y - ball.radius - rightFlipper.height / 2 &&
      ball.y < rightFlipper.y + ball.radius + rightFlipper.height / 2
    ) {
      //bounceFlippers.play()
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



  requestAnimationFrame(update);
}


//Pause with the space bar

document.getElementById('playButton').addEventListener('click', function() {
  isPause = !isPause;
  // Call this function to initially set the correct draggability state
  this.textContent = isPause ? 'Pause' : 'Play'; // Change button text based on state
});


let leftKeyIsPressed = false;
let rightKeyIsPressed = false;
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
// Mousedown event listener
canvas.addEventListener("mousedown", function(e) {
  isMouseDown = true;
  getMousePosition(e);
  for (let i = 0; i < obstacles.length; i++) {
      if (intersects(obstacles[i])) {
          if (!isPause) {
              alert("You can't move obstacles while the game is running.");
              return;
          }
          focused.state = true;
          focused.key = i;
          obstacles[i].r *= 1.1; // Indicate selection
          break;
      }
  }
});
 // Mousemove event listener
canvas.addEventListener("mousemove", function(e) {
  if (focused.state && isMouseDown) {
      move(e);
  }
});
// Mouseup event listener
canvas.addEventListener("mouseup", function() {
  isMouseDown = false;
  if (focused.state) {
      obstacles[focused.key].r /= 1.1; // Reset the radius
      focused.state = false;
      focused.key = null;
  }
});


  update();
};