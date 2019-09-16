const canvas = () => document.createElement("canvas").getContext("2d") ? true : false

const Renderer = canvas() ? CanvasRenderer : SVGRenderer

export default Renderer