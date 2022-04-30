console.log("Hello world")

const svg = document.getElementById("svg");

class SvgMinimap {
    svg;
    dimensions;

    constructor(svg) {
        this.svg = svg;
        this.dimensions = this.getDimensions();

        this.createMinimap();

        setInterval(() => {
            this.tick();
        }, 100)
    }

    tick() {
        const virtualViewBox = document.getElementById("virtualViewBox");
        const [x, y, width, height] = this.svg.getAttribute("viewBox").split(" ").map(Number);
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
        minimap.innerHTML = this.svg.innerHTML
        minimap.innerHTML += `<rect x="${this.dimensions.minX}" y="${this.dimensions.minY}" width="${viewBoxWidth}" height="${viewBoxHeight}" style="fill:green;stroke:green;stroke-width:2;fill-opacity:0.1;stroke-opacity:0.9" id="virtualViewBox" />`

    }

    getDimensions() {
        const dimensions = [...this.svg.children].reduce((prev, cur) => { 
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
