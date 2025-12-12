// @ts-nocheck
// Disabling strict check for this file as it contains legacy canvas logic adapted to React
// However, we are refactoring to Classes to fix the specific build error about constructors.

interface CanvasContext extends CanvasRenderingContext2D {
  running: boolean;
  frame: number;
}

const E = {
  debug: true,
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

let pos = { x: 0, y: 0 };
let lines: Line[] = [];
let ctx: CanvasContext | null = null;
let f: Oscillator | null = null;

class Node {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
}

class Oscillator {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;

  constructor(options: { phase?: number; offset?: number; frequency?: number; amplitude?: number } = {}) {
    this.phase = options.phase || 0;
    this.offset = options.offset || 0;
    this.frequency = options.frequency || 0.001;
    this.amplitude = options.amplitude || 1;
  }

  update(): number {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }
}

class Line {
  spring: number;
  friction: number;
  nodes: Node[];

  constructor(options: { spring: number }) {
    this.spring = options.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (let i = 0; i < E.size; i++) {
      const t = new Node();
      t.x = pos.x;
      t.y = pos.y;
      this.nodes.push(t);
    }
  }

  update() {
    let spring = this.spring;
    let node = this.nodes[0];

    node.vx += (pos.x - node.x) * spring;
    node.vy += (pos.y - node.y) * spring;

    for (let i = 0; i < this.nodes.length; i++) {
      node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * E.dampening;
        node.vy += prev.vy * E.dampening;
      }

      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= E.tension;
    }
  }

  draw(c: CanvasContext) {
    let curr, next;
    let x = this.nodes[0].x;
    let y = this.nodes[0].y;

    c.beginPath();
    c.moveTo(x, y);

    for (let i = 1; i < this.nodes.length - 2; i++) {
      curr = this.nodes[i];
      next = this.nodes[i + 1];
      x = 0.5 * (curr.x + next.x);
      y = 0.5 * (curr.y + next.y);
      c.quadraticCurveTo(curr.x, curr.y, x, y);
    }

    curr = this.nodes[this.nodes.length - 2];
    next = this.nodes[this.nodes.length - 1];
    c.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
    c.stroke();
    c.closePath();
  }
}

function onMousemove(e: MouseEvent | TouchEvent) {
  function initLines() {
    lines = [];
    for (let i = 0; i < E.trails; i++) {
      lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
    }
  }

  function updatePos(e: MouseEvent | TouchEvent) {
    if ('touches' in e) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    } else {
      pos.x = (e as MouseEvent).clientX;
      pos.y = (e as MouseEvent).clientY;
    }
  }

  function updateTouch(e: TouchEvent) {
    if (e.touches.length === 1) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    }
  }

  document.removeEventListener("mousemove", onMousemove);
  document.removeEventListener("touchstart", onMousemove);
  
  document.addEventListener("mousemove", updatePos);
  document.addEventListener("touchmove", updatePos);
  document.addEventListener("touchstart", updateTouch);

  updatePos(e);
  initLines();
  render();
}

function render() {
  if (ctx && ctx.running) {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
    
    if (f) {
      // Use hsla for color on white background
      ctx.strokeStyle = "hsla(" + Math.round(f.update()) + ",80%,50%,0.05)";
    }
    
    ctx.lineWidth = 10;
    
    for (let i = 0; i < E.trails; i++) {
      if (lines[i]) {
        lines[i].update();
        lines[i].draw(ctx);
      }
    }
    ctx.frame++;
    window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  if (ctx) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }
}

export const renderCanvas = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;
  
  const context = canvas.getContext("2d") as CanvasContext;
  if (!context) return;
  
  ctx = context;
  ctx.running = true;
  ctx.frame = 1;
  
  f = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  // Set initial position to center to avoid glitch if no mouse movement
  pos.x = window.innerWidth / 2;
  pos.y = window.innerHeight / 2;

  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("touchstart", onMousemove);
  document.body.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  
  window.addEventListener("focus", () => {
    if (ctx && !ctx.running) {
      ctx.running = true;
      render();
    }
  });
  
  window.addEventListener("blur", () => {
    if (ctx) ctx.running = true;
  });
  
  resizeCanvas();
};
