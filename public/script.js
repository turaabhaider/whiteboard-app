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

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const pos = getMousePos(canvas, e);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const pos = getMousePos(canvas, e);

    const data = {
        x0: lastX,
        y0: lastY,
        x1: pos.x,
        y1: pos.y,
        color: colorPicker.value,
        size: brushSize.value
    };

    drawLine(data);          
    socket.emit("draw", data);

    lastX = pos.x;
    lastY = pos.y;
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