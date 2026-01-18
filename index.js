#!/usr/bin/env node

const { spawn } = require('child_process');
const [, , matchString, ...commandArgs] = process.argv;

// Check if input is valid
if (!matchString || commandArgs.length === 0) {
  console.error('Usage: run-until-match "match" <command> [args...]');
  process.exit(2);
}

// Parse input and spawn child process
const [command, ...args] = commandArgs;
const child = spawn(command, args, {
  stdio: ['ignore', 'pipe', 'pipe'],
});

// Buffer to hold output data, and flag to indicate if match was found
let bufferStdOut = '';
let bufferStdErr = '';
let matched = false;

// Function to handle data from stdout and stderr
const handleData = (chunk, writer, stdOut = true) => {
  // Convert chunk to string and write to appropriate stream
  const text = chunk.toString();
  writer.write(text);

  if (stdOut) {
    bufferStdOut += text;
  } else {
    bufferStdErr += text;
  }

  // Check if current buffer contains string to match
  if (!matched && (bufferStdOut.includes(matchString) || bufferStdErr.includes(matchString))) {
    matched = true;
    child.kill('SIGINT');
  }

  // Limit buffer size to 5000 characters
  if (bufferStdOut.length > 10_000) {
    bufferStdOut = bufferStdOut.slice(-5_000);
  }
  if (bufferStdErr.length > 10_000) {
    bufferStdErr = bufferStdErr.slice(-5_000);
  }
};

// Register listeners for stdout and stderr
child.stdout.on('data', chunk => handleData(chunk, process.stdout));
child.stderr.on('data', chunk => handleData(chunk, process.stderr, false));

// Handle errors and exit events
child.on('error', err => {
  console.error('Failed to start command:', err.message);
  process.exit(1);
});

child.on('exit', code => {
  process.exit(matched ? 0 : code ?? 0);
});
