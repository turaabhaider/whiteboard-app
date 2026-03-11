const socket = io();

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");

let drawing = false;
let lastX = 0;
let lastY = 0;


canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const data = {
        x0: lastX,
        y0: lastY,
        x1: e.clientX,
        y1: e.clientY,
        color: colorPicker.value,
        size: brushSize.value
    };

    drawLine(data);          
    socket.emit("draw", data);

    lastX = e.clientX;
    lastY = e.clientY;
});


socket.on("draw", (data) => drawLine(data));

function drawLine(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
}


clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
});


socket.on("clear", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});