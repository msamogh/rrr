import React from 'react';
import ReactDOM from 'react-dom';
import saveSvgAsPng from '../../../node_modules/save-svg-as-png/saveSvgAsPng';
import './MaskingCanvas.css';


// const _url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Cephalometric_radiograph.JPG/600px-Cephalometric_radiograph.JPG';
// const height = 480;
// const width = 600;


class DrawCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paths: [[]],
      isDrawing: false,
      top: 0,
      left: 0,
      simplify: false,
      simplifyThreshold: props.attributes.brushSize,
      height: 0,
      width: 0,
      color: props.attributes.color,
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Cephalometric_radiograph.JPG/600px-Cephalometric_radiograph.JPG',
    };
  }

  componentWillMount() {
    this.getMeta(this.state.uri);
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this.refs.canvas);
    const rect = node.getBoundingClientRect();
    const { left, top } = rect;
    this.setState({ top, left });
    node.ondragstart = function () { return false; };

    this.getNextImage();
  }

  getMeta = (url) => {
    const img = new Image();
    img.addEventListener('load', () => {
      this.setState({ width: img.naturalWidth, height: img.naturalHeight });
      const node = ReactDOM.findDOMNode(this.refs.canvas);
      const rect = node.getBoundingClientRect();
      const { left, top } = rect;
      this.setState({ top, left });
      // alert( img.naturalWidth +' '+ img.naturalHeight );
    });
    img.src = url;
  }

  handleMouseDown() {
    if (!this.state.isDrawing) {
      this.setState({
        paths: [].concat(this.state.paths, [[]]),
      });
    }
    this.setState({ isDrawing: true });
  }

  handleMouseMove(e) {
    if (this.state.isDrawing) {
      const x = e.pageX - this.state.left;
      const y = e.pageY - this.state.top;
      const paths = this.state.paths.slice(0);
      const activePath = paths[paths.length - 1];
      activePath.push({ x, y });
      this.setState({ paths });
    }
  }

  handleMouseUp() {
    if (this.state.isDrawing) {
      this.setState({ isDrawing: false });
      const node = ReactDOM.findDOMNode(this.refs.canvas);
      saveSvgAsPng.svgAsPngUri(node, {}, (uri) => {
        this.setState({ uri, paths: [[]] });
      });
    }
  }

  toggleSimplify() {
    this.setState({ simplify: !this.state.simplify });
  }

  setThreshold(e) {
    this.setState({ simplifyThreshold: e.target.value });
  }

  save = () => {
    const node = ReactDOM.findDOMNode(this.refs.canvas);
    // saveSvgAsPng.saveSvgAsPng(node, 'diagram.png');
    saveSvgAsPng.svgAsPngUri(node, {}, (uri) => {
      this.setState({ uri });
      console.log(uri);
      this.getMask();
    });
  }

  getMask = () => {
    const { height, width } = this.state;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height).data;
      const imageToMat = [];
      console.log(imageData);
      for (let row = 0, count = -1; row < width * height; row++) {
        // TODO use dynamic mask colour
        if (imageData[++count] === 0 && imageData[++count] === 0 && imageData[++count] === 255 && imageData[++count] === 255) {
          imageToMat[row] = 1;
        } else {
          imageToMat[row] = 0;
        }
      }
      console.log(imageToMat);
      // TODO fetch post mask here.
    };
    img.src = this.state.uri;
  }

  getNextImage = () => {
    // TODO get new image
  }

  done = () => {
    // TODO send done message
  }

  render() {
    const { height, width } = this.state;
    const paths = this.state.paths.map((_points) => {
      let path = '';
      const points = _points.slice(0);
      if (points.length > 0) {
        path = `M ${points[0].x} ${points[0].y}`;
        let p1,
          p2,
          end;
        for (let i = 1; i < points.length - 2; i += 2) {
          p1 = points[i];
          p2 = points[i + 1];
          end = points[i + 2];
          path += ` C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${end.x} ${end.y}`;
        }
      }
      return path;
    }).filter(p => p !== '');
    return (
      <div className="MaskingCanvas">
        <h1>Draw to mask</h1>
        <div className="MaskingCanvas-body">
          <svg
            style={{ border: '0px solid black', cursor: 'crosshair' }}
            width={width}
            height={height}
            ref="canvas"
            onMouseDown={this.handleMouseDown.bind(this)}
            onMouseUp={this.handleMouseUp.bind(this)}
            onMouseMove={this.handleMouseMove.bind(this)}
          >
            <image x={0} y={0} xlinkHref={this.state.uri} height={height} width={width} />
            {
              paths.map(path => (<path
                key={path}
                stroke={this.props.attributes.color}
                strokeWidth={this.props.attributes.brushSize}
                d={path}
                fill="none"
              />))
            }
          </svg>
        </div>
        <div className="MaskingCanvas-button-container">
          <button onClick={this.getNextImage}>get previous image</button>
          <button onClick={this.save}>save</button>
          <button onClick={this.getNextImage}>get next image</button>
        </div>
      </div>
    );
  }
}

export default DrawCanvas;
