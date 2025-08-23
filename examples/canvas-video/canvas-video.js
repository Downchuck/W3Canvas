class CanvasVideoElement extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.shadowRoot.appendChild(this.canvas);

        this.src = null;
        this.path2d = null;

        this._currentTime = 0;
        this.duration = 10; // Let's say the video is 10 seconds long
        this.paused = true;
        this.animationFrameId = null;

        this.controlsContainer = null;
        this.playPauseButton = null;
        this.progressBar = null;
    }

    static get observedAttributes() {
        return ['src', 'width', 'height', 'controls'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src' && oldValue !== newValue) {
            this.src = newValue;
            this.load();
        } else if (name === 'width' || name === 'height') {
            this.updateCanvasSize();
        } else if (name === 'controls') {
            if (newValue !== null) {
                this.createControls();
            } else {
                this.removeControls();
            }
        }
    }

    connectedCallback() {
        this.updateCanvasSize();
        if (this.hasAttribute('src')) {
            this.src = this.getAttribute('src');
            this.load();
        }
        if (this.hasAttribute('controls')) {
            this.createControls();
        }
    }

    updateCanvasSize() {
        const width = this.getAttribute('width') || this.clientWidth;
        const height = this.getAttribute('height') || this.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(value) {
        this._currentTime = value;
        if (this.progressBar) {
            this.progressBar.value = this.currentTime;
        }
        this.render();
    }

    play() {
        if (!this.paused) return;
        this.paused = false;
        this.startTime = performance.now() - this.currentTime * 1000;
        this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
        if (this.playPauseButton) {
            this.playPauseButton.textContent = 'Pause';
        }
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.playPauseButton) {
            this.playPauseButton.textContent = 'Play';
        }
    }

    tick(now) {
        if (this.paused) return;

        this._currentTime = (now - this.startTime) / 1000;
        if (this.currentTime >= this.duration) {
            this._currentTime = this.duration;
            this.pause();
        }

        if (this.progressBar) {
            this.progressBar.value = this.currentTime;
        }

        this.render();

        if (!this.paused) {
            this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
        }
    }

    async load() {
        if (!this.src) return;

        try {
            const response = await fetch(this.src);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.status}`);
            }
            const svgText = await response.text();

            // Super simple regex to find the first path's d attribute.
            // This is not a robust SVG parser.
            const pathMatch = /<path[^>]*d="([^"]+)"/.exec(svgText);
            if (!pathMatch || !pathMatch[1]) {
                throw new Error('No path with a "d" attribute found in the SVG.');
            }

            const pathData = pathMatch[1];
            this.path2d = new Path2D(pathData);
            this.dispatchEvent(new Event('load'));
            this.render(); // Render the first frame
        } catch (error) {
            console.error('Error loading or parsing SVG:', error);
            this.dispatchEvent(new CustomEvent('error', { detail: { error } }));
        }
    }

    disconnectedCallback() {
        this.pause();
    }

    captureStream() {
        return this.canvas.captureStream();
    }

    createControls() {
        if (this.controlsContainer) return;

        const style = document.createElement('style');
        style.textContent = `
            .controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                padding: 5px;
            }
            .controls button {
                margin-right: 10px;
            }
            .controls input[type=range] {
                flex-grow: 1;
            }
        `;
        this.shadowRoot.appendChild(style);

        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'controls';

        this.playPauseButton = document.createElement('button');
        this.playPauseButton.textContent = 'Play';
        this.playPauseButton.addEventListener('click', () => {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
        this.controlsContainer.appendChild(this.playPauseButton);

        this.progressBar = document.createElement('input');
        this.progressBar.type = 'range';
        this.progressBar.min = 0;
        this.progressBar.max = this.duration;
        this.progressBar.step = 0.1;
        this.progressBar.value = this.currentTime;
        this.progressBar.addEventListener('input', () => {
            this.currentTime = this.progressBar.value;
        });
        this.controlsContainer.appendChild(this.progressBar);

        this.shadowRoot.appendChild(this.controlsContainer);
    }

    removeControls() {
        if (this.controlsContainer) {
            this.shadowRoot.removeChild(this.controlsContainer);
            this.controlsContainer = null;
            this.playPauseButton = null;
            this.progressBar = null;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.path2d) {
            this.ctx.save();

            // Animate the rotation based on the current time
            const rotation = (this.currentTime / this.duration) * 2 * Math.PI;

            // Translate to the center of the canvas to rotate around the center
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.rotate(rotation);
            // Translate back to the original position
            this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

            // We also need to translate the path itself to the center of the canvas
            this.ctx.translate(this.canvas.width / 2 - 50, this.canvas.height / 2 - 50);

            this.ctx.fill(this.path2d);

            this.ctx.restore();
        }
    }
}

customElements.define('canvas-video', CanvasVideoElement);
