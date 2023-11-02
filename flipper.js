const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const leftFlipper = {
  x: canvas.width * 0.35,
  y: canvas.height - 60,
  width: 100,
  height: 10,
  angle: 0,
  angularSpeed: 3,
  maxAngle: 30, // Maximum rotation angle
};

const rightFlipper = {
  x: canvas.width * 0.85,
  y: canvas.height - 50,
  width: 100,
  height: 10,
  angle: 0,
  angularSpeed: 3,
  maxAngle: 30, // Maximum rotation angle
};

function drawLeftFlipper(flipper) {
  ctx.save();
  ctx.translate(flipper.x-flipper.width / 2, flipper.y-flipper.height / 2);
  // Limit the flipper's angle to the maximum rotation angle
  flipper.angle = Math.min(Math.max(-flipper.maxAngle, flipper.angle), flipper.maxAngle);
  ctx.rotate(- (Math.PI / 180) * flipper.angle);
  ctx.fillStyle = "#ff0000"; // Red color
  ctx.fillRect(0, 0, flipper.width, flipper.height);

  ctx.restore();
}
function drawRightFlipper(flipper) {
  ctx.save();
  ctx.translate(flipper.x-flipper.width / 2, flipper.y-flipper.height / 2);
  // Limit the flipper's angle to the maximum rotation angle
  flipper.angle = Math.min(Math.max(-flipper.maxAngle, flipper.angle), flipper.maxAngle);
  ctx.rotate(- (Math.PI / 180) * flipper.angle);
  ctx.fillStyle = "#ff0000"; // Red color
  ctx.fillRect(0, 0, -flipper.width, -flipper.height);

  ctx.restore();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update the left flipper angle
  if (leftKeyIsPressed) {
    leftFlipper.angle += leftFlipper.angularSpeed;
  } else {
    leftFlipper.angle = -30;
  }

  // Update the right flipper angle
  if (rightKeyIsPressed) {
    rightFlipper.angle -= rightFlipper.angularSpeed;
  } else {
    rightFlipper.angle = 30;
  }

  // Draw the flippers
  drawLeftFlipper(leftFlipper);
  drawRightFlipper(rightFlipper);

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
