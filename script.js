console.log("Hello world")

const svg = document.getElementById("svg");

class SvgMinimap {
    svgElement;
    dimensions;


    // Keep track of whether we're in 'dragging' mode. Since we're ALWAYS listening on every mouse on the whole document
    // we need to know that should be dragging the svg element with our mouse movements.
    #draggingSvg;

    // When dragging we need to update the x, and y coorindates of the viewBox. To figure out the relative drag distances
    // we require a starting position to compare with the position after dragging.
    #lastMouseXPosition;
    #lastMouseYPosition;

    // #baseX;
    // #baseY;

    constructor(svgElement) {
        this.svgElement = svgElement;
        if (!svgElement.getAttribute("viewBox")) {
          console.warn("No viewBox found on the svgElement, overwriting");
          const viewBox = `0 0 ${svgElement.clientWidth} ${svgElement.clientHeight}`; 
          console.log({viewBox})
          svgElement.setAttribute("viewBox", viewBox);
        }
        this.dimensions = this.getDimensions();

        this.#draggingSvg = false;
        this.#lastMouseXPosition = -1;
        this.#lastMouseYPosition = -1;
        // this.#baseX = undefined;
        // this.#baseY = undefined;

        this.createMinimap();

        setInterval(() => {
            this.tick();
        }, 1)
    }

    /**
     * Update the minimap based on the dimensions of the viewBox
     */
    tick() {
        const virtualViewBox = document.getElementById("virtualViewBox");
        const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number);
        virtualViewBox.setAttribute('x', x.toFixed(2))
        virtualViewBox.setAttribute('y', y.toFixed(2))
        virtualViewBox.setAttribute('width', width.toFixed(2))
        virtualViewBox.setAttribute('height', height.toFixed(2))
    }

    /**
     * Initialise the minimap component by creating the virtual map and the virtualViewBox
     */
    createMinimap() {
        const minimap = document.getElementById("minimap");

        const viewBoxWidth = this.dimensions.maxX - this.dimensions.minX;
        const viewBoxHeight = this.dimensions.maxY - this.dimensions.minY
        minimap.setAttribute("viewBox", `${this.dimensions.minX} ${this.dimensions.minY} ${viewBoxWidth} ${viewBoxHeight}`)
        minimap.innerHTML = this.svgElement.innerHTML
        minimap.innerHTML += `<rect x="${this.dimensions.minX}" y="${this.dimensions.minY}" width="${viewBoxWidth}" height="${viewBoxHeight}" style="fill:green;stroke:green;stroke-width:2;fill-opacity:0.1;stroke-opacity:0.9" id="virtualViewBox" />`

        minimap.addEventListener("mousedown", (ev) => {
            this.#draggingSvg = true;
            this.#lastMouseXPosition = ev.clientX;
            this.#lastMouseYPosition = ev.clientY;

            // const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number)
            // this.#baseX = x;
            // this.#baseY = y;
        })
        document.addEventListener("mousemove", (ev) => {
            if (!this.#draggingSvg) { 
                return;
            }

            // Compare the current mouse position with the previous position
            const { clientX: mouseXPosition, clientY: mouseYPosition } = ev;

            // How much we should pan the original svg element is the amount we move our mouse
            // Also taking into account that we're looking at the minimap with some scale.
            // e.g. If the minimap is 100px width but showing 400px, that means that every pixel panned should be moved
            // with a factor 4. Which is the same as deviding by the shown scale. Since the scale would be 0.25 
            // We're seeing the image at 1/4 its true size.
            const deltaX = (this.#lastMouseXPosition - mouseXPosition) / (this.virtualViewBoxScale);
            const deltaY = (this.#lastMouseYPosition - mouseYPosition)  / (this.virtualViewBoxScale);

            this.#lastMouseXPosition = mouseXPosition;
            this.#lastMouseYPosition = mouseYPosition;
            
            const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number)
            const rect = document.getElementById("virtualViewBox").getBoundingClientRect()

            // Not really necessary as it will get updated with the tick function anyways.
            // document.getElementById("virtualViewBox").setAttribute("x", `${rect.left+deltaX}`)
            // document.getElementById("virtualViewBox").setAttribute("y", `${rect.top+deltaY}`)

            // Width and height shouldn't change since we're only panning
            this.svgElement.setAttribute("viewBox", `${(x-deltaX).toFixed(2)} ${(y-deltaY).toFixed(2)} ${width} ${height}`)
        })

        document.addEventListener("mouseup", () => {
            this.#draggingSvg = false;
            this.#lastMouseXPosition = -1;
            this.#lastMouseYPosition = -1;
        })


        minimap.addEventListener(
          "wheel",
          (ev) => {
            // ev.deltaY is positive on zooming out and negative on zooming in.
            const zoomPercentage = ev.deltaY * -1;
            const zoomRatio = zoomPercentage * 0.01;
            this.zoom(zoomRatio);
          },
          { passive: true }
        );
    }

    zoom(zoomRatio, leftSideRatio = 0.5, topSideRatio = 0.5) {
      const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = this.svgElement.getAttribute("viewBox").split(" ").map(Number);
  
      // Calculate how much width and height should be added to the viewBox
      // Intution: zooming in with a factor 0.10, means that the viewBox should become 10% smaller
      const deltaViewBoxWidth = viewBoxWidth * zoomRatio * -1;
      const deltaViewBoxHeight = viewBoxHeight * zoomRatio * -1;
  
      // Calculate the new viewBox width and height based on the zoomRatio.
      // Intuition: when zooming in the viewBox is showing less pixels
      const newViewBoxWidth = viewBoxWidth + deltaViewBoxWidth;
      const newViewBoxHeight = viewBoxHeight + deltaViewBoxHeight;
  
      // Calculate the new x and y positions based on the left and top side ratios
      // Intuition: zooming in on the left means that the viewBoxWidth gets smaller
      //  which means that deltaViewBoxWidth is < 0.
      //  which means that viewBoxX should increase.
      //  therefore
      const newViewBoxX = viewBoxX + (-1 * deltaViewBoxWidth * 0.5);
      const newViewBoxY = viewBoxY + (-1 * deltaViewBoxHeight * 0.5);
  
      this.svgElement.setAttribute(
        "viewBox",
        `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`
      );
    }


    get virtualViewBoxScale() {
      const minimap = document.getElementById("minimap");
      const [, , viewBoxWidth, viewBoxHeight] = minimap.getAttribute("viewBox").split(" ").map(Number);
      const widthScale = minimap.clientWidth / viewBoxWidth;
      const heightScale = minimap.clientHeight / viewBoxHeight;
  
      if (widthScale.toFixed(2) !== heightScale.toFixed(2)) {
        console.error(`Got inconsistent scale: ${widthScale} vs ${heightScale}`);
      }
  
      return widthScale;
    }

    /**
     * Get the dimensions of the svgElement by gathering the mix and max dimensions of each child node.
     */
    getDimensions() {
        const dimensions = [...this.svgElement.children].reduce((prev, cur) => { 
            const curBox = cur.getBBox();
            const maxXCur = curBox.x + curBox.width;
            const maxYCur = curBox.y + curBox.height;

            if (!prev) {
                return { minX: curBox.x, maxX: maxXCur, minY: curBox.y, maxY: maxYCur}
            }

            let result = {
                minX: Math.min(prev.minX, curBox.x),
                maxX: Math.max(prev.maxX, maxXCur),
                minY: Math.min(prev.minY, curBox.y),
                maxY: Math.max(prev.maxY, maxYCur)
            }

            return result;
        }, null);

        return dimensions
    }

}

new SvgMinimap(svg);
