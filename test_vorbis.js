import { stb_vorbis_open_memory, stb_vorbis_get_frame_float, stb_vorbis_get_info, stb_vorbis_close } from './src/stb-vorbis/index.js';

const ogg_url = 'https://upload.wikimedia.org/wikipedia/commons/9/92/MT63_sample.ogg';

async function main() {
    console.log('Fetching audio file...');
    try {
        const response = await fetch(ogg_url);
        if (!response.ok) {
            console.error(`Failed to fetch audio file: ${response.statusText}`);
            return;
        }
        const buffer = await response.arrayBuffer();
        console.log(`Successfully fetched ${buffer.byteLength} bytes.`);

        console.log('Opening Vorbis stream...');
        const f = stb_vorbis_open_memory(buffer);
        if (!f) {
            console.error('Failed to open Vorbis stream.');
            return;
        }
        console.log('Successfully opened Vorbis stream.');

        const info = stb_vorbis_get_info(f);
        console.log('Stream info:', info);

        let total_samples = 0;
        let frame_count = 0;
        while (true) {
            const result = stb_vorbis_get_frame_float(f);
            if (result.samples === 0) {
                break;
            }
            frame_count++;
            total_samples += result.samples;
            console.log(`Decoded frame ${frame_count}: ${result.samples} samples, ${result.channels} channels.`);
        }

        console.log(`--- Decoding Complete ---`);
        console.log(`Total frames decoded: ${frame_count}`);
        console.log(`Total samples decoded: ${total_samples}`);

        stb_vorbis_close(f);
        console.log('Stream closed.');

    } catch (e) {
        console.error('An error occurred during testing:', e);
    }
}

main();
