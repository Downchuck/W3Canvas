import { stb_vorbis_open_memory, stb_vorbis_get_info, stb_vorbis_close } from '../../src/stb-vorbis/index.js';

class VorbisAudioElement extends HTMLElement {
    constructor() {
        super('vorbis-audio');
        this.vorbis_handle = null;
    }

    static get observedAttributes() {
        return ['src'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src') {
            this.loadAudio(newValue);
        }
    }

    async loadAudio(url) {
        if (this.vorbis_handle) {
            stb_vorbis_close(this.vorbis_handle);
            this.vorbis_handle = null;
        }

        if (!url) {
            return;
        }

        try {
            console.log(`Fetching audio from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio file: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            console.log(`Successfully fetched ${buffer.byteLength} bytes.`);

            console.log('Opening Vorbis stream...');
            const f = stb_vorbis_open_memory(buffer);
            if (!f) {
                throw new Error('Failed to open Vorbis stream.');
            }
            this.vorbis_handle = f;
            console.log('Successfully opened Vorbis stream.');

            const info = stb_vorbis_get_info(f);
            console.log('Stream info:', info);

            this.dispatchEvent(new Event('load'));

        } catch (error) {
            console.error('Error loading Vorbis audio:', error);
            this.dispatchEvent(new CustomEvent('error', { detail: { error } }));
        }
    }

    connectedCallback() {
        // Initial load if src is already set
        if (this.hasAttribute('src')) {
            this.loadAudio(this.getAttribute('src'));
        }
    }

    disconnectedCallback() {
        // Cleanup when the element is removed from the DOM
        if (this.vorbis_handle) {
            stb_vorbis_close(this.vorbis_handle);
            this.vorbis_handle = null;
            console.log('Vorbis stream closed.');
        }
    }
}

customElements.define('vorbis-audio', VorbisAudioElement);
