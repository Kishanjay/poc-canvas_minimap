import Logger from "@kjn/logger";
import EventEmitter from "@kjn/event-emitter";


export default class SvgPanZoom extends EventEmitter {
  #svgElement;

  // Keep track of whether we're in 'dragging' mode. Since we're ALWAYS listening on every mouse on the whole document
  // we need to know that should be dragging the svg element with our mouse movements.
  #draggingSvg;

  // When dragging we need to update the x, and y coorindates of the viewBox. To figure out the relative drag distances
  // we require a starting position to compare with the position after dragging.
  #lastMouseXPosition;
  #lastMouseYPosition;

  constructor(svgElement) {
    super();
    const viewBox = svgElement.getAttribute("viewBox");
    // To keep a consistent zoom experience the viewBox is reset on init.
    if (viewBox) { logger.warning("Overwriting existing viewbox of svg element", svgElement) }
    svgElement.setAttribute("viewBox", `0 0 ${svg.clientWidth} ${svg.clientHeight}`)


    // Keep the x, and y positions and update the dragging state
    svgElement.addEventListener("mousedown", (ev) => {
      this.#draggingSvg = true;
      this.#lastMouseXPosition = ev.clientX;
      this.#lastMouseYPosition = ev.clientY;
    })

    // Remove the x, and y positions and update the dragging state
    document.addEventListener("mouseup", () => { 
      this.#draggingSvg = false;
      this.#lastMouseXPosition = undefined;
      this.#lastMouseYPosition = undefined;
    })

    document.addEventListener("mousemove", (ev) => {
      if (!this.#draggingSvg) { return; }

      // Get the current viewBox values
      let [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = this.#svgElement.getAttribute("viewBox").split(" ").map(Number);
  
      // Compare the current mouse position with the previous position
      const { clientX: mouseXPosition, clientY: mouseYposition } = ev;
      const deltaX = (this.#lastMouseXPosition - mouseXPosition);
      const deltaY = (this.#lastMouseYPosition - mouseYposition)

      // Scale with how much we should pan the svg viewBox
      // Intuition: zoomed in -> less pixels on the screen -> panning should be scaled down.
      const panDeltaX =  deltaX / this.scale;
      const panDeltaY =  deltaY / this.scale;
  
      // Update the viewbox of the svgElement
      this.#svgElement.setAttribute("viewBox", `${viewBoxX +panDeltaX } ${viewBoxY +panDeltaY} ${viewBoxWidth} ${viewBoxHeight}`)
  
      // Store the new lastMousePositions
      this.#lastMouseXPosition = mouseXPosition;
      this.#lastMouseYPosition = mouseYposition;
    })

    svgElement.addEventListener("wheel",  ev => {
      // Use the mouse position relative to the svg element.
      const { layerX: mouseX, layerY: mouseY} = ev;
      
      // Based on our mouse position we calculate how much of the relative delta should be added to the left side (and the right side).
      // the intuition here is that if our mouse is at the left most position the increment should be added 100% on the rightside.
      const leftSideRatio = mouseX / this.#svgElement.clientWidth;
      const topSideRatio = mouseY / this.#svgElement.clientHeight;

      this.zoom(ev.deltaY, leftSideRatio, topSideRatio);
    })

    this.#svgElement = svgElement
    this.#svgElement.pinchifier = this;
  }

  zoom(factor, leftSideRatio = 0.5, topSideRatio = 0.5) {
    const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = this.#svgElement.getAttribute("viewBox").split(" ").map(Number);

    // Grow relative to the current projected size. This means that if the size is bigger, we're zooming in relative at the same 
    // speed as we do when the size is small.
    const zoomSpeed = viewBoxWidth*0.005; 

    // Multiply the scrolling velocity with the relative wheelSpeed to comeup with a scaled increment value
    // NOTE: can be a negative value.
    const sizeIncrement = factor * zoomSpeed;
    
    // Compute the new width by adding the increment. Ensure to leave at LEAST 1px when zooming in.
    const newViewBoxWidth = Math.max(viewBoxWidth + sizeIncrement, 1);

    // Scale the height exactly as much as the width.
    const viewBoxScaleFactor = (newViewBoxWidth / viewBoxWidth)
    const newViewBoxHeight = viewBoxHeight * viewBoxScaleFactor;

    // Now we know the desired width and height, we know the delta width and height.
    // === how much more (or less) pixels we want to see.

    // Based on the new widths and heights, compute the relative deltas. (=== new - old)
    const deltaWidth = newViewBoxWidth - viewBoxWidth;
    const deltaHeight = newViewBoxHeight - viewBoxHeight;

    // Compute how much of the deltaIncrement should go to each of the 4 sides. 0.5 means zooming in and out from
    // the very center position
    const newViewBoxX = viewBoxX - (deltaWidth * leftSideRatio);
    const newViewBoxY = viewBoxY - (deltaHeight * topSideRatio);

    this.#svgElement.setAttribute("viewBox", `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`)

    this.$emit("zoom", this.scale);
  }

  pan() {

  }

  get scale() {
    const [,,viewBoxWidth, viewBoxHeight] = this.#svgElement.getAttribute("viewBox").split(" ").map(Number);
    const widthScale = this.#svgElement.clientWidth / viewBoxWidth;
    const heightScale = this.#svgElement.clientHeight / viewBoxHeight;

    if (widthScale.toFixed(2) !== heightScale.toFixed(2)) {
      logger.error(`Got inconsistent scale: ${widthScale} vs ${heightScale}`)
    }

    return widthScale;
  }

}

const logger = new Logger("svg-pan-zoom")