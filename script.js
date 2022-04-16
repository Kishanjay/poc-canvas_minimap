const svg = document.getElementById("svg");

let dragging = false;

let lastPanX;
let lastPanY;

const { clientWidth, clientHeight } = svg;

svg.addEventListener("mousedown", (ev) => {
    dragging = true;

    lastPanX = ev.clientX;
    lastPanY = ev.clientY;
})


document.addEventListener("mousemove", (ev) => {
    if (!dragging) { return }
    let [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = svg.getAttribute("viewBox").split(" ").map(Number);

    // Intuition: if we're projecting everything at twice the size, we need to pan twice as fast.
    const widthScale = viewBoxWidth / clientWidth;
    const heightScale = viewBoxHeight / clientHeight;

    const panDeltaX = (lastPanX - ev.clientX) * widthScale;
    const panDeltaY = (lastPanY - ev.clientY) * heightScale;

    svg.setAttribute("viewBox", `${viewBoxX +panDeltaX } ${viewBoxY +panDeltaY} ${viewBoxWidth} ${viewBoxHeight}`)

    lastPanX = ev.clientX;
    lastPanY = ev.clientY;
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