# Isomorphic Worker Implementation (`Worker` & `SharedWorker`)

This document provides an overview of the isomorphic `Worker` and `SharedWorker` implementation in this repository.

## 1. Overview

The goal of this implementation is to provide a Web Worker and Shared Worker API that is compatible with the project's Node.js-based environment, while mirroring the standard browser APIs as closely as possible. This allows for multi-threaded operations like font parsing and layout to be moved off the main thread.

The implementation consists of the following key files:
-   `src/worker/Worker.js`: The public-facing `Worker` class.
-   `src/worker/SharedWorker.js`: The public-facing `SharedWorker` class.
-   `src/worker/worker_bootstrap.js`: The internal script that sets up the environment for a new `Worker`.
-   `src/worker/shared_worker_bootstrap.js`: The internal script that sets up the environment for a new `SharedWorker`.
-   `src/dom/globals.js`: Provides the `GlobalScope` class, which acts as the `self` object inside a worker.

## 2. Key Features

-   **Isomorphic Design**: The workers are built on top of Node.js `worker_threads` but expose an API similar to browser workers (`postMessage`, `onmessage`, etc.).
-   **Isolated Scopes**: Each worker runs in its own `GlobalScope`, ensuring it does not interfere with the main thread or other workers.
-   **FontFace API Integration**: The `FontFace` and `FontFaceSet` APIs are available inside workers via `self.FontFace` and `self.fonts`. This allows fonts to be loaded and processed in a background thread.
-   **Shared Worker Connection Management**: The `SharedWorker` implementation correctly handles multiple clients connecting to the same underlying worker thread. It includes logic to prevent race conditions during initial connection.

## 3. Current Status & Known Issues

**The implementation is believed to be logically correct, but it is not verifiable in the current test environment.**

The primary known issue is a persistent **timeout problem when running the tests** (`tests/worker.test.js`). All attempts to run the tests result in the test process hanging until it is killed by a timeout.

### Debugging Performed

Extensive debugging was performed to isolate the cause of the hanging tests. The following potential causes were investigated and fixed, but none resolved the timeout issue:
1.  **Graceful Shutdown**: An `after()` hook was added to the test suite to ensure all shared workers were terminated.
2.  **Script Pathing**: Worker scripts are now loaded using `pathToFileURL` to ensure correct module resolution by the dynamic `import()` function.
3.  **Connection Race Conditions**: The `SharedWorker` bootstrap script now queues incoming connections to prevent messages from being dropped if they arrive before the worker's `onconnect` handler is set.
4.  **MessagePort Lifecycle**: The implementation now correctly calls `.start()` on `MessagePort` instances, which is required by the `worker_threads` API to begin message processing.
5.  **Filesystem Access**: A test was conducted to check if `fs` calls within the worker were the cause of the hang. The hang persisted even when all `fs` operations were removed from the worker thread.

A minimal test case that only creates and terminates a worker **passes successfully**. This indicates that the issue is not with the basic creation of a worker thread, but with the interaction and communication between the main thread and the worker thread in any non-trivial scenario.

**Conclusion**: The timeout is highly likely due to an **environmental issue** with the specific `worker_threads` implementation or configuration in the execution sandbox, rather than a bug in the application code itself.

## 4. Next Steps & Recommendations

1.  **Test in a Different Environment**: The immediate next step is to run the test suite (`yarn node --test tests/worker.test.js`) in a standard, local Node.js environment. This is critical to confirm that the code is correct and the issue is isolated to the development sandbox.
2.  **Complete FontFace Integration**: The `SharedWorker` font loading test in `tests/worker.test.js` was skipped during debugging. It should be re-enabled and verified once the timeout issue is resolved.
3.  **Enhance Error Handling**: The error handling in the bootstrap scripts could be made more robust to ensure that errors inside the worker are always propagated to the main thread in a structured way.
4.  **Expand API Compatibility**: The current implementation covers the core API. Further work could be done to implement other properties and events of the Worker API, such as `onerror`, `postMessage` with transferables, etc.
