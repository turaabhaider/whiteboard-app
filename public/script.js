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

let startX = 0;
let startY = 0;
let tool = "brush"; 

function setTool(selectedTool) {
    tool = selectedTool;
}


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
    
    startX = pos.x; 
    startY = pos.y;

    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener("mouseup", (e) => {
    if (!drawing) return;
    drawing = false;

    const pos = getMousePos(canvas, e);

  
    if (tool !== "brush") {
        const data = {
            type: tool,
            x0: startX,
            y0: startY,
            x1: pos.x,
            y1: pos.y,
            color: colorPicker.value,
            size: brushSize.value
        };

        drawShape(data);
        socket.emit("draw", data);
    }
});

canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const pos = getMousePos(canvas, e);

    if (tool === "brush") {
        const data = {
            type: "brush",
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
    }
});

function drawLine(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
}

function drawShape(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;

    if (data.type === "square") {
        const width = data.x1 - data.x0;
        const height = data.y1 - data.y0;
        ctx.strokeRect(data.x0, data.y0, width, height);
    }

    if (data.type === "circle") {
        const radius = Math.sqrt(
            (data.x1 - data.x0) ** 2 +
            (data.y1 - data.y0) ** 2
        );
        ctx.beginPath();
        ctx.arc(data.x0, data.y0, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (data.type === "star") {
        drawStar(data.x0, data.y0, 5, 40, 20);
    }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.closePath();
    ctx.stroke();
}
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
});

socket.on("draw", (data) => {
    if (data.type === "brush") drawLine(data);
    else drawShape(data);
});

socket.on("clear", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});