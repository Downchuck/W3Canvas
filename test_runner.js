import { Worker } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testsDir = path.join(__dirname, 'tests');
const workerPath = path.join(__dirname, 'worker.js');

async function run() {
  const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.test.js'));
  let passed = 0;
  let failed = 0;
  let total = 0;

  const promises = testFiles.map(file => {
    return new Promise((resolve) => {
      total++;
      const testFilePath = path.join(testsDir, file);
      const worker = new Worker(workerPath, {
        workerData: { testFile: testFilePath }
      });

      let hasErrored = false;

      const handleError = (err) => {
          if (hasErrored) return;
          hasErrored = true;
          console.error(`FAIL: ${file}`);
          console.error(err);
          failed++;
          resolve();
      }

      worker.on('message', (result) => {
        if (hasErrored) return;
        if (result.status === 'pass') {
          console.log(`PASS: ${file}`);
          passed++;
        } else {
          handleError(result.error.stack);
        }
        resolve();
      });

      worker.on('error', handleError);

      worker.on('exit', (code) => {
        if (code !== 0 && !hasErrored) {
            handleError(new Error(`Worker stopped with exit code ${code}`));
        }
        resolve();
      });
    });
  });

  await Promise.all(promises);

  console.log('\n--- Test Summary ---');
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

run();
