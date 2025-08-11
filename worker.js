import { parentPort, workerData } from 'worker_threads';
import { pathToFileURL } from 'url';

const { testFile } = workerData;

// The test files use node:test, which will run automatically when the file is executed.
// If any test fails, it will throw an error, which we can catch here.
import(pathToFileURL(testFile).href)
  .then(() => {
    parentPort.postMessage({ status: 'pass', file: testFile });
  })
  .catch((error) => {
    parentPort.postMessage({
      status: 'fail',
      file: testFile,
      error: { message: error.message, stack: error.stack },
    });
  });
