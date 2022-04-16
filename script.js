const svg = document.getElementById("svg");

let dragging = false;

let previousMoveX;
let previousMoveY;

svg.addEventListener("mousedown", (ev) => {
    dragging = true;

    previousMoveX = ev.clientX;
    previousMoveY = ev.clientY;
})


document.addEventListener("mousemove", (ev) => {
    if (!dragging) { return }
    let [curX, curY, width, height] = svg.getAttribute("viewBox").split(" ").map(Number);

    const deltaX = previousMoveX - ev.clientX;
    const deltaY = previousMoveY - ev.clientY;
    previousMoveX = ev.clientX;
    previousMoveY = ev.clientY;

    svg.setAttribute("viewBox", `${curX +deltaX } ${curY +deltaY} ${width} ${height}`)
})

document.addEventListener("mouseup", () => {
    dragging = false;
})



svg.addEventListener("wheel", ev => {
    const [x, y, width, height] = svg.getAttribute("viewBox").split(" ").map(Number);
    const factor = ev.deltaY;

    const newWidth = Math.max(width + factor, 1);
    const newHeight = height * (newWidth / width);

    const deltaWidth = newWidth - width;
    const deltaHeight = newHeight - height;

    console.log({deltaHeight, deltaWidth})

    const { layerX, layerY} = ev;
    

    const newX = x - deltaWidth / 2;
    const newY = y - deltaHeight / 2;

    svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`)
})



console.log("ready")