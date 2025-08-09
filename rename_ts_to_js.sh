#!/bin/bash
find . -type f -name "*.ts" -exec bash -c 'mv "$0" "${0%.ts}.js"' {} \;
