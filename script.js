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

    #baseX;
    #baseY;

    constructor(svgElement) {
        this.svgElement = svgElement;
        this.dimensions = this.getDimensions();

        this.#draggingSvg = false;
        this.#lastMouseXPosition = -1;
        this.#lastMouseYPosition = -1;
        this.#baseX = undefined;
        this.#baseY = undefined;

        this.createMinimap();

        setInterval(() => {
            this.tick();
        }, 1)
    }

    tick() {
        const virtualViewBox = document.getElementById("virtualViewBox");
        const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number);
        virtualViewBox.setAttribute('x', x)
        virtualViewBox.setAttribute('y', y)
        virtualViewBox.setAttribute('width', width)
        virtualViewBox.setAttribute('height', height)
    }

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

            const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number)
            this.#baseX = x;
            this.#baseY = y;
        })
        document.addEventListener("mousemove", (ev) => {
            if (!this.#draggingSvg) { 
                return;
            }

            // Compare the current mouse position with the previous position
            const { clientX: mouseXPosition, clientY: mouseYPosition } = ev;
            const deltaX = (this.#lastMouseXPosition - mouseXPosition) * (400 / 300);
            const deltaY = (this.#lastMouseYPosition - mouseYPosition)  *  (400 / 300);
            console.log({deltaX, deltaY})

            this.#lastMouseXPosition = mouseXPosition;
            this.#lastMouseYPosition = mouseYPosition;
            
            const [x, y, width, height] = this.svgElement.getAttribute("viewBox").split(" ").map(Number)
            const rect = document.getElementById("virtualViewBox").getBoundingClientRect()
            document.getElementById("virtualViewBox").setAttribute("x", `${rect.left+deltaX}`)
            document.getElementById("virtualViewBox").setAttribute("y", `${rect.top+deltaY}`)
            this.svgElement.setAttribute("viewBox", `${x-deltaX} ${y-deltaY} ${width} ${height}`)
        })

        document.addEventListener("mouseup", () => {
            this.#draggingSvg = false;
            this.#lastMouseXPosition = -1;
            this.#lastMouseYPosition = -1;
        })

    }

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
