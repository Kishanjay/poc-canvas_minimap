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
    const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = svg.getAttribute("viewBox").split(" ").map(Number);

    // Grow relative to the current size. This means that if the size is bigger, we're zooming in relative at the same speed
    // as we do when the size is small.
    const wheelSpeed = viewBoxWidth*0.005; 

    // Multiply the scrolling velocity with the relative wheelSpeed to comeup with a scaled increment value
    // NOTE: can be a negative value
    const increment = ev.deltaY * wheelSpeed;
    
    // When zooming out, ensure that we leave at least 1px
    const newViewBoxWidth = Math.max(viewBoxWidth + increment, 1);

    // Scale the height at the same speed as the width
    const viewBoxScaleFactor = (newViewBoxWidth / viewBoxWidth)
    const newViewBoxHeight = viewBoxHeight * viewBoxScaleFactor;

    // Now we know the desired width and height, we know the delta width and height.
    // === how much more (or less) pixels we want to see.
    const deltaWidth = newViewBoxWidth - viewBoxWidth;
    const deltaHeight = newViewBoxHeight - viewBoxHeight;

    const { layerX, layerY} = ev;

    // Based on our mouse position we calculate how much of the deltas should be added to the left side (and the right side).
    // the intuition here is that if our mouse is at the left most position the increment should be added 100% on the rightside.
    // Thus the ratio is our mouse position relative to the width.
    const leftSideRatio = layerX / clientWidth;
    const rightSideRatio = layerY / clientHeight;

    const newViewBoxX = viewBoxX - (deltaWidth * leftSideRatio);
    const newViewBoxY = viewBoxY - (deltaHeight * rightSideRatio);

    svg.setAttribute("viewBox", `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`)
})



console.log("ready")