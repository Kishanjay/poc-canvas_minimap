const svg = document.getElementById("svg");

let down = false;
let downX = 0;
let downY = 0;

let x = 0;
let y = 0;


document.addEventListener("mousemove", (ev) => {
    if (!down) { return }

    const dX = downX - ev.clientX;
    const dY = downY - ev.clientY;
    svg.setAttribute("viewBox", `${x +dX } ${y +dY} 350 350`)
})

svg.addEventListener("mousedown", (ev) => {
    down = true;
    downX = ev.clientX;
    downY = ev.clientY;
})

document.addEventListener("mouseup", () => {
    [x, y] = svg.getAttribute("viewBox").split(" ").map(Number)
    down = false;
})

console.log("ready")