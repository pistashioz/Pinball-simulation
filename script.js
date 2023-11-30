//dropdown
function showToggle() {
  var dropdown = document.getElementById("myDropdown");
  if (isPause) {
    dropdown.classList.toggle("show");
  } else {
    showMessage("The game must be paused to change the ball material.");
    // If the dropdown is shown, hide it and then blur the button
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
    // Blur the button to remove focus
    document.querySelector('.dropbtn').blur();
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

let flippersKeyPressed = false;
let downKeyIsPressed = false;

let GRAVITY = 0.05;
const BOUNCE_THRESHOLD = 2.5; // Minimum speed for bounce

//sound effects
const bounceSound = new Audio("assets/audio/jump.wav");
const bounceFlippers = new Audio("assets/audio/jumpFlipper.wav")
const addObstacle = new Audio('assets/audio/click.wav')
const releaseObstacle = new Audio('assets/audio/release.wav')
const grabObstacles = new Audio('assets/Audio/drag.wav')

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

// Function to handle material selection and storage
function handleMaterialChange(material) {
  if (isPause) {
    localStorage.setItem('ballMaterial', material); // Store the material in local storage
    location.reload(); // Refresh the page
  } else {
    showMessage('The game must be paused to change the ball material.');
  }
}

function showMessage(text) {
  var messageContainer = document.getElementById('messageContainer');
  messageContainer.textContent = text; // Set the text
  messageContainer.style.display = 'block'; // Make the container visible
  messageContainer.style.animation = 'popIn 0.5s ease forwards'; // Apply the pop-in animation

  // After 5 seconds, start the pop-out animation
  setTimeout(function() {
    messageContainer.style.animation = 'popOut 0.5s ease forwards';
  }, 4500);

  // Finally, hide the container after the pop-out animation completes
  setTimeout(function() {
    messageContainer.style.display = 'none'; // Hide the container
    messageContainer.textContent = ''; // Clear the text
  }, 5000); // Wait for the pop-out animation to finish
}
document.getElementById('material-steel').addEventListener('click', function(e) {
  e.preventDefault();
  handleMaterialChange('steel');
});

document.getElementById('material-wood').addEventListener('click', function(e) {
  e.preventDefault();
  handleMaterialChange('wood');
});

document.getElementById('material-rubber').addEventListener('click', function(e) {
  e.preventDefault();
  handleMaterialChange('rubber');
});

document.getElementById('submitGravity').addEventListener('click', function(e) {
  e.preventDefault();
  if (isPause) {
      const selectedGravity = document.getElementById('gravity').value;
      localStorage.setItem('selectedGravity', selectedGravity); // Store the gravity value in local storage
      GRAVITY = parseFloat(selectedGravity); // Update the gravity constant
      location.reload(); // Refresh the page
  } else {
    showMessage('The game must be paused to change gravity.');
  }
});



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
       
        ctx.fillStyle = '#fcace3';

        ctx.rect(this.x , this.y, this.width, this.height); // Draw the rectangle
        ctx.stroke();
        ctx.fill();
    
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

const rectFlipper = new Flipper(canvas.width / 2 - 30, canvas.height - 80,  20, 110, 15);


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
const leftFlipper = new TwoFlipper(canvas.width * 0.13, canvas.height - 90, 120, 20, 25, 10, 'left');
// Adjust the position for the right flipper
const rightFlipper = new TwoFlipper(canvas.width * 0.77, canvas.height - 90, 120, 20, 25, 10, 'right');
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


class Ball {
  constructor(x, y, radius, speedX, speedY, material) {
    this.x = x;
    this.y = y;
    this.originalSpeedX = speedX;
    this.originalSpeedY = speedY;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.material = material;
    this.onThrowingMechanism = false;
    this.inPlay = true;
    this.setPhysicalProperties(material);
    this. correctionVelocity = { x: 0, y: 0 };
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

    // Method to pause the ball's movement
    pause() {
      this.originalSpeedX = this.speedX;
      this.originalSpeedY = this.speedY;
      this.speedX = 0;
      this.speedY = 0;
    }
  
    // Method to resume the ball's movement
    resume() {
      this.speedX = this.originalSpeedX;
      this.speedY = this.originalSpeedY;
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
  constructor(x, y, r, color, tempColor) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.tempColor = tempColor; // Temporary color for collision
    this.currentColor = color; // Current color of the obstacle
    this.shakeFrames = 0;
    this.shakeMagnitude = 2;
    this.shakeDirection = { x: 0, y: 0 };
    this.collisionFrames = 0; // Duration for color change on collision
  }

  draw() {
    let drawX = this.originalX + this.shakeDirection.x;
    let drawY = this.originalY + this.shakeDirection.y;

    // Outer circle
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.currentColor; // Use the current color
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Inner circle
    ctx.beginPath();
    ctx.arc(drawX, drawY, Math.floor(this.r/3), 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();

    if (this.collisionFrames > 0) {
      this.collisionFrames--;
    } else {
      this.currentColor = this.color; // Reset to original color after collision effect
    }
  }

  shake(dx, dy) {
    if (this.shakeFrames > 0) {
      this.shakeDirection.x = dx * this.shakeMagnitude;
      this.shakeDirection.y = dy * this.shakeMagnitude;
      this.shakeFrames--;
    }
  }

  collide() {
    this.currentColor = this.tempColor; // Set the temporary color
    this.collisionFrames = 10; // Set the duration of the color change effect
  }
}


const obstacles = [
  new Obstacle(W / 2, H / 2 - 50, 25, '#bfaac7', '#afcdd7'),
  new Obstacle(W / 2 + 100, H / 2 - 150, 25, '#e3d896', '#d8947c'),
  new Obstacle(W / 2 - 100, H / 2 - 150, 25, '#384b8a', '#dfd0b9'),
];

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
    ctx.lineTo(this.x, this.y);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

  

    ctx.restore();
  };
}


const throwingMechanism = new ThrowingMechanism(W - 37, H - 220, 37, 100);
const ball = new Ball(throwingMechanism.x + throwingMechanism.width / 2, throwingMechanism.y - 120, 15, 0, 2, 'rubber');
//const ball =  new Ball(canvas.width / 2, 30, 15, 1, 1);

// Global flag to indicate whether to draw the door
let shouldDrawDoor = false;
// Define the door's dimensions and position
const doorX = W - 139 + 51;
const doorY = 0;
const doorWidth = 6;
const doorHeight = 64;
function drawDoor() {

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#FF0000';
    ctx.rect(doorX, doorY, doorWidth, doorHeight);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}
// The center of the arc, radius, and angles
const arcCenterX = W - 139;
const arcCenterY = 150;
const radius = 100;
const startAngle = 0;
const endAngle = -1.1; // Radians, make sure this is consistent with how you draw your arc
const lineWidth = 6; // The thickness of the arc stroke

// Assuming wallX, wallY, wallWidth, and wallHeight are defined according to your rectangle
const wallX = W - 42;
const wallY = 150;
const wallWidth = 6;
const wallHeight = 330;

const wall2X = W - 42;
const wall2Y = 480;
const wall2Width = 42;
const wall2Height = 120;

  // Handle collision with the new horizontal wall
  const horizontalWallX = W - 84;
  const horizontalWallXSc = 4;
  const horizontalWallY = 500;
  const horizontalWallWidth = 42;
  const horizontalWallHeight = 20;
  const horizontalWall2X = 2;
// Function to draw the throwing mechanism
function throwingMech() {

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'green';
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.rect(W - 42, 150, 6, 330);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'pink';
  ctx.strokeStyle='black';
  ctx.lineWidth =2;
  ctx.rect(W - 42, 480, 42, 120);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'purple';
  ctx.strokeStyle='black';
  ctx.lineWidth =2;
  ctx.rect(W - 84, 500, 42, 20);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'purple';
  ctx.strokeStyle='black';
  ctx.lineWidth =2;
  ctx.rect( 2, 500, 42, 20);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // NEED TO CHECK FOR THE COLLISIONS WITH THIS ARC
  // Draw the arc
  ctx.beginPath();
  ctx.arc(W - 139, 150, radius, startAngle, endAngle, true);
ctx.lineWidth = 6;
ctx.strokeStyle = 'pink';
  ctx.stroke();
  ctx.closePath();

    ctx.restore();




}

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
    showMessage("The game must be paused to move obstacles.");
    event.preventDefault(); // Prevent dragging
  } else {
    event.dataTransfer.setData("text/plain", event.target.id);
  }
}

function removeObstacleFromCanvas(index, obstacleColor) {
  // Check if the obstacle exists
  if (index < 0 || index >= obstacles.length || !isPause) {
    showMessage ('Please pause the simulation to remove obstacles.');
    return; // If the index is out of bounds, do nothing
  }

  // Remove the obstacle from the canvas
  obstacles.splice(index, 1);

  // Add an obstacle image back to the DOM
  const obstacleDiv = document.getElementById('obstacle-images');
  const newObstacleImage = document.createElement('img');
  if (obstacleColor === '#bfaac7') {
    obstacleColor = 'LILAC';
  } else if (obstacleColor === '#e3d896') {
    obstacleColor = 'YELLOW';
  } else if (obstacleColor === '#384b8a') {
    obstacleColor = 'BLUE';
  } else if (obstacleColor === '#79b792') {
obstacleColor = 'green';
  } else if (obstacleColor === '#c8b750') {
    obstacleColor = 'mustard';
  } else if (obstacleColor === '#cf3641') {
    obstacleColor = 'red';
  } 
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
    showMessage("You can only add obstacles to the canvas while the game is paused.");
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

  // Attempt to add the obstacle to the canvas
  var obstacleAdded = addObstacleToCanvas(obstacleId, x, y);

  // If the obstacle is successfully added, then remove the corresponding obstacle image from the DOM
  if (obstacleAdded) {
    var obstacleImage = document.getElementById(obstacleId);
    if (obstacleImage) {
      obstacleImage.remove();
    }
  }
});

function addObstacleToCanvas(obstacleId, x, y) {
  if (!isPause) {
    showMessage("The game must be paused to move obstacles.");
    return false;
  }

  if (obstacles.length >= 5) {
    showMessage("Maximum number of obstacles reached. Cannot add more.");
    return false;
  } 

  // Define the draggable zone
  const zoneX = 50; // X-coordinate of the rectangle
  const zoneY = 50; // Y-coordinate of the rectangle
  const zoneWidth = canvas.width - 100; // Width of the rectangle
  const zoneHeight = canvas.height - 200; // Height of the rectangle

  // Check if the dropped position is within the draggable zone
  if (x - 12.5 < zoneX || x + 12.5 > zoneX + zoneWidth ||
      y - 12.5 < zoneY || y + 12.5 > zoneY + zoneHeight) {
        showMessage("Obstacles need to be placed within the designated zone.");
    return false;
  }

  // Determine the color based on the obstacle ID
  let color, tempColor;
  switch (obstacleId) {
    case 'obstacle-red':
      color = '#cf3641';
      tempColor = "#8d85b6";
      break;
    case 'obstacle-mustard':
      color = '#c8b750';
      tempColor = "#92b7b1";
      break;
    case 'obstacle-green':
      color = '#79b792';
      tempColor = "#dbd57f";
      break;
    case 'obstacle-BLUE':
      color = '#384b8a';
      tempColor = "#dfd0b9";
      break;
    case 'obstacle-YELLOW':
      color = '#e3d896';
      tempColor = "#d8947c"; 
      break;
    case 'obstacle-LILAC':
      color = '#bfaac7';
      tempColor = "#afcdd7"; 
      break;
    default:
      color = 'unknown'; // Or any default color
  }
  if (isCollisionWithOtherObstacles(x, y, 25)) {
    showMessage("Obstacles must not overlap with others.");
    return false; // Prevent adding the new obstacle
  }

  // Create a new Obstacle object with the correct color and add it to your obstacles array
  addObstacle.play();
  var newObstacle = new Obstacle(x, y, 25, color,tempColor);
  obstacles.push(newObstacle);
  return true;
}

function isCollisionWithOtherObstacles(x, y, radius, ignoredIndex = -1) {
  return obstacles.some((obstacle, index) => {
    if (index === ignoredIndex) return false; // Ignore collision check with itself

    const dx = x - obstacle.originalX;
    const dy = y - obstacle.originalY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (radius + obstacle.r); // Check if the distance is less than the sum of the radii
  });
}


function move(e) {
  getMousePosition(e);
  if (focused.state) {
    const obstacle = obstacles[focused.key];
    const newX = Math.max(obstacle.r, Math.min(W - obstacle.r, mousePosition.x));
    const newY = Math.max(obstacle.r, Math.min(H - obstacle.r, mousePosition.y));

    // Check if the new position is within the draggable zone and not colliding
    if ((newX - obstacle.r/2 < zoneX || newX + obstacle.r/2 > zoneX + zoneWidth ||
        newY - obstacle.r/2 < zoneY || newY + obstacle.r/2 > zoneY + zoneHeight) ||
        isCollisionWithOtherObstacles(newX, newY, obstacle.r, focused.key)) {

      // Optionally, reset obstacle position
      obstacle.originalX= obstacle.originalX;
      obstacle.originalY= obstacle.originalY;
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
  

  }
   
// Function to reset the ball to its initial position and velocity
function resetBall() {
  // Reset ball properties
  ball.x = throwingMechanism.x + throwingMechanism.width / 2;
  ball.y = throwingMechanism.y - 120;
  ball.speedX = 0; // Reset to initial horizontal speed
  ball.speedY = 2; // Reset to initial vertical speed
  ball.correctionVelocity = { x: 0, y: 0 }; // Reset any correction velocities
    shouldDrawDoor = false;

}
function ballFlipperCollision(ball, flipper) {
  // Collision with top edge of the flipper
  if (ball.x + ball.radius > flipper.x && ball.x - ball.radius < flipper.x + flipper.width) {
    if (ball.y + ball.radius > flipper.y && ball.y - ball.radius < flipper.y + flipper.height) {
      // Reflect the Y velocity
      ball.speedY *= -1;

      // Set a correction velocity to move the ball out of the flipper
      ball.correctionVelocity.y = -flipper.moveSpeed;

      return;
    }
  }

 // Collision with left side of the flipper
 if (ball.y > flipper.y && ball.y < flipper.y + flipper.height) {
  if (ball.x - ball.radius < flipper.x && ball.x > flipper.x - flipper.width / 2) {
    // Reflect the X velocity
    ball.speedX *= -1;

    // Set a correction velocity to move the ball out of the flipper
    ball.correctionVelocity.x = -flipper.moveSpeed;

      return;
    }
  }

  // Check for collision with the right side of the flipper
  if (ball.y > flipper.y && ball.y < flipper.y + flipper.height) {
    if (ball.x + ball.radius > flipper.x + flipper.width && ball.x < flipper.x + flipper.width + flipper.width / 2) {
      // Reflect the ball's X velocity
      ball.speedX *= -1;

      // Set a correction velocity to move the ball out of the flipper
      ball.correctionVelocity.x = flipper.moveSpeed;


      return;
    }
  }
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
function ballArcSegmentCollision(ball, arcCenterX, arcCenterY, radius, startAngle, endAngle, lineWidth) {
  // Calculate the distance from the ball to the arc's center
  let dx = ball.x - arcCenterX;
  let dy = ball.y - arcCenterY;
  let distanceToCenter = Math.sqrt(dx * dx + dy * dy);

  // Normalize the angle to be between 0 and 2*PI
  let angleToBall = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);

  // Convert angles to a 0 to 2*PI range
  let normalizedStartAngle = (startAngle + 2 * Math.PI) % (2 * Math.PI);
  let normalizedEndAngle = (endAngle + 2 * Math.PI) % (2 * Math.PI);

  // Check if the ball's angle is within the arc segment's range
  let isWithinAngleRange = normalizedStartAngle < normalizedEndAngle
    ? angleToBall <= normalizedStartAngle || angleToBall >= normalizedEndAngle
    : angleToBall >= normalizedEndAngle && angleToBall <= normalizedStartAngle;

  // Check if the ball is within the arc's radial range
  let isWithinRadialRange = distanceToCenter >= radius - lineWidth / 2 - ball.radius && 
                            distanceToCenter <= radius + lineWidth / 2 + ball.radius;

  if (isWithinAngleRange && isWithinRadialRange) {
    // Collision detected
    console.log('collided with arc segment', angleToBall, distanceToCenter);
    // Reflect the ball's velocity
    // The reflection is simplified here for the purpose of the example
    ball.speedX *= -1;
    ball.speedY *= -1;
    return true; // Indicate that a collision has occurred
  }

  return false; // No collision with the arc segment
}function ballWallCollision(ball, wallX, wallY, wallWidth, wallHeight, isHorizontal = false) {
  // Check for collision with the sides of the wall (if it's vertical)
  if (!isHorizontal && ball.y + ball.radius > wallY && ball.y - ball.radius < wallY + wallHeight) {
    if (ball.x + ball.radius > wallX && ball.x - ball.radius < wallX + wallWidth) {
      // Reflect the ball's X velocity
      ball.speedX *= -1;
      // Ensure the ball is placed just outside the wall bounds
      ball.x = ball.x > wallX ? wallX + wallWidth + ball.radius : wallX - ball.radius;
      return true; // Collision occurred
    }
  }

  // Check for collision with the top/bottom of the wall (if it's horizontal)
  if (isHorizontal && ball.x + ball.radius > wallX && ball.x - ball.radius < wallX + wallWidth) {
    if (ball.y + ball.radius > wallY && ball.y - ball.radius < wallY + wallHeight) {
      // Reflect the ball's Y velocity
      ball.speedY *= -1;
      // Ensure the ball is placed just outside the wall bounds
      ball.y = ball.y > wallY ? wallY + wallHeight + ball.radius : wallY - ball.radius;
      return true; // Collision occurred
    }
  }

  return false; // No collision occurred
}
// Function to handle all ball collisions
function handleCollisions() {
     
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
  // Handle collision with the flipper
  ballFlipperCollision(ball, rectFlipper);
         // Top border collision
    if (ball.y  < ball.radius && ball.speedY < 0) {
      ball.speedY *= -1;
    }
  // Bottom border collision
  if (ball.y + ball.radius > canvas.height && ball.speedY > 0) {
   
    isPause = false;
    resetBall(); // Call the reset function
    return;
  }

  // Right border collision
  if (ball.x + ball.radius > canvas.width && ball.speedX > 0) {
    
    ball.speedX *= -1;
  }

console.log('Before collision check, speedX:', ball.speedX);

// Left border collision
if (ball.x - ball.radius < 0 && ball.speedX < 0) {

  ball.speedX *= -1;
  ball.x = ball.radius;

}



    let lineWidth = 2; // Example line width

   // Check for collision between the ball and an obstacle
   obstacles.forEach(obstacle => {
    let dx = obstacle.originalX - ball.x;
    let dy = obstacle.originalY - ball.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    const sumOfRadii = ball.radius + obstacle.r ;

    if (distance <= sumOfRadii) {
      obstacle.collide(); // Trigger color change on collision
      obstacle.shakeFrames = 10;
      const shakeDirectionX = dx / distance;
      const shakeDirectionY = dy / distance;
      obstacle.shake(shakeDirectionX, shakeDirectionY);
      reflect(ball, obstacle);
    }
  });
        // Check collision with the left flipper
        //checkFlipperBallCollision(leftFlipper, ball);
  
        // Check collision with the right flipper
        //checkFlipperBallCollision(rightFlipper, ball);
    // First check collision with the arc segment
  let collidedWithArcSegment = ballArcSegmentCollision(ball, arcCenterX, arcCenterY, radius, startAngle, endAngle, lineWidth);

  // Only check for collision with the door if there was no collision with the arc segment
  if (!collidedWithArcSegment && shouldDrawDoor) {
    // Check for collision with the door
    if (ball.x + ball.radius > doorX && ball.x - ball.radius < doorX + doorWidth &&
        ball.y + ball.radius > doorY && ball.y - ball.radius < doorY + doorHeight) {
      console.log('door hit');
      // Reflect ball's X velocity for a vertical wall
      ball.speedX *= -1;
      ball.speedY *= -1;

      // Adjust ball's position to avoid it getting stuck in the door
      if (ball.x > doorX) {
        // Ball hit the left side of the door
        ball.x = doorX + doorWidth + ball.radius;
      } else {
        // Ball hit the right side of the door
        ball.x = doorX - ball.radius;
      }
    }
  }
  const hasCollidedWithWall = ballWallCollision(ball, wallX, wallY, wallWidth, wallHeight);

  const hasCollidedWithWall2 = ballWallCollision(ball, wall2X, wall2Y, wall2Width, wall2Height);

const hasCollidedWithHorizontalWall = ballWallCollision(
  ball,
  horizontalWallX,
  horizontalWallY,
  horizontalWallWidth,
  horizontalWallHeight,
  true // This wall is horizontal
);


// Check for collision with the new horizontal wall
const hasCollidedWithHorizontalWall2 = ballWallCollision(
  ball,
  horizontalWall2X,
  horizontalWallY,
  horizontalWallWidth,
  horizontalWallHeight,
  true // This wall is horizontal
);



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

  if (isPause) {
    if (!ball.isPaused) {
      ball.pause(); // Pause the ball's movement
      ball.isPaused = true;
    }
    drawDraggableZone(); // Draw the draggable zone when the game is paused
}

if (!isPause) {  
  if (ball.isPaused) {
    ball.resume(); // Resume the ball's movement
    ball.isPaused = false;
  }
  // Define the arc parameters
  const arcCenterX = W - 120;
  const arcCenterY = 140;
  const arcRadius = 100;
  const arcStartAngle = 0; // Starting at the top of the circle
  const arcEndAngle = -1.2; // Specific angle for the arc ending
  const MIN_VELOCITY_THRESHOLD = 1.5; // This value should be determined experimentally or calculated based on physics

  // Update and draw each ball

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
        } 
else {
      // Normal motion if the ball is not on the arc path
    // 
      ball.x += ball.speedX;
      ball.y += ball.speedY;
              // Check if the ball has just exited the arc segment
              if (!ball.inPlay && ballAngle < arcEndAngle) {
                ball.inPlay = true; // Ball is now in play
                shouldDrawDoor = true; // Set the flag to draw the door
            }
    
  // Apply correction velocity if set
  if (ball.correctionVelocity.x !== 0 || ball.correctionVelocity.y !== 0) {
    ball.x += ball.correctionVelocity.x;
    ball.y += ball.correctionVelocity.y;

    // Reset the correction velocity after applying
    ball.correctionVelocity.x *= 0.85; // Dampen the correction velocity for a gradual effect
    ball.correctionVelocity.y *= 0.85; // Dampen the correction velocity for a gradual effect

    // Clear the correction velocity when it's small enough
    if (Math.abs(ball.correctionVelocity.x) < 0.1) ball.correctionVelocity.x = 0;
    if (Math.abs(ball.correctionVelocity.y) < 0.1) ball.correctionVelocity.y = 0;
  }
        }
      } else if (ball.onThrowingMechanism) {
        // Make the ball follow the mechanism if it is on it
        ball.x = throwingMechanism.x + throwingMechanism.width / 2;
        ball.y = throwingMechanism.y - ball.radius;
        ball.inPlay = false; // Reset inPlay when ball is on the mechanism
      
      }
  
  
    

  }
    

  handleCollisions();



// If the down arrow key is pressed, increase the compression of the throwing mechanism
if (downKeyIsPressed) {
  // Make sure the height doesn't go below a certain threshold
  if (throwingMechanism.height > 16) {
    throwingMechanism.height -= 1;
    throwingMechanism.y += 1;
    // Increase the compression time more significantly
    throwingMechanism.compressionTime += 0.2; // Adjust this value as needed
  }
} else {
  // Launch the ball if there's compression time accumulated
  if (throwingMechanism.compressionTime > 0) {
    // Calculate the force based on the compression time and stiffness
    const force = throwingMechanism.compressionTime;
    
    // Apply force to the ball that's on the mechanism

      if (ball.onThrowingMechanism) {
        // Calculate the acceleration (force divided by mass)
        // acceleration is force divided by mass
        const acceleration = force/ball.mass; ;
        
        // Launch the ball upwards with the calculated acceleration
        // The negative sign is because we want to move the ball in the opposite direction of gravity (upwards)
        ball.speedY = -acceleration; 
        ball.onThrowingMechanism = false; // The ball is no longer on the mechanism
      }
    
    
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
  if (throwingMechanism.y < H - 220) {
    throwingMechanism.y = H - 220;
  }
}

  

  ctx.clearRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(W - 120, 140, 100, 0, -1.2, true);
  ctx.stroke();
  ctx.closePath();
  if (shouldDrawDoor) {
    drawDoor();
    //shouldDrawDoor = false; // Reset the flag
}

  throwingMechanism.draw();
  throwingMech();
    // Draw flippers after the balls
   /* leftFlipper.draw();
  leftFlipper.update();
  
  rightFlipper.draw();
  rightFlipper.update();
  
  drawActualPositions(leftFlipper);
drawActualPositions(rightFlipper);*/


  // Draw the flippers and ball
  ball.draw();
  rectFlipper.draw();
  rectFlipper.update();
  obstacles.forEach(obstacle => {
    obstacle.draw();
  }); 



  requestAnimationFrame(update);
}


document.getElementById('playButton').addEventListener('click', function() {
  isPause = !isPause;
  // Call this function to initially set the correct draggability state
  this.textContent = isPause ? 'Pause' : 'Play'; // Change button text based on state
});

document.getElementById('refreshButton').addEventListener('click', function() {
  window.location.reload();
});

document.getElementById('playMusicButton').addEventListener('click', function() {
  const playMusicButton = document.getElementById('playMusicButton');
  if (backgroundMusic.paused) {
      backgroundMusic.play();
      playMusicButton.textContent = "Pause Music"; // Change button text to "Pause Music"
  } else {
      backgroundMusic.pause();
      playMusicButton.textContent = "Play Music"; // Change button text to "Play Music"
  }
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


      if ( ball.onThrowingMechanism) {
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

    const storedMaterial = localStorage.getItem('ballMaterial');
    if (storedMaterial) {
      ball.setPhysicalProperties(storedMaterial);
    }
    const storedGravity = localStorage.getItem('selectedGravity');
    if (storedGravity) {
        GRAVITY = parseFloat(storedGravity);
        document.getElementById('gravity').value = storedGravity;
    }
  
// Mousedown event listener
canvas.addEventListener("mousedown", function(e) {
  isMouseDown = true;
  getMousePosition(e);
  for (let i = 0; i < obstacles.length; i++) {
      if (intersects(obstacles[i])) {
          if (!isPause) {
            showMessage("You can't move obstacles while the game is running.");
              return;
          }
          grabObstacles.play()
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
      releaseObstacle.play()
      obstacles[focused.key].r /= 1.1; // Reset the radius
      focused.state = false;
      focused.key = null;
  }
});


  update();
};