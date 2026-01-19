# run-until-match

[![](https://img.shields.io/npm/v/run-until-match)](https://www.npmjs.com/package/run-until-match)

`run-until-match` is a small Node.js CLI utility that runs a command and terminates it when its output matches a given string.

This is particularly useful when working with tools or packages that do not exit cleanly and keep the process running after their work is complete. By watching the standard output and standard error streams, you can wait for a known string and then stop the process. This makes it possible to chain such commands reliably in scripts and CI pipelines.

The tool was inspired by real-world issues encountered with packages such as [typeorm-seeding](https://github.com/w3tecch/typeorm-seeding).

> [!WARNING]  
> Using `run-until-match` with untrusted or user input may expose you to command injection attacks! **ONLY EVER RUN THIS COMMAND IN TRUSTED ENVIRONMENTS!**

## Usage

Run `run-until-match` via `npx`, passing the match string first, followed by the command and its arguments:

```sh
npx run-until-match "bytes from" ping google.com
```

In this example, `ping google.com` is closed as soon as the string appears in stdout or stderr. Since `ping` prints this line after the first response, the command effectively executes only once.

All output from the underlying command is forwarded to the terminal until the match is detected. When a match occurs, the process is interrupted using `SIGINT`, equivalent to pressing Ctrl+C.

## Exit behavior

* If the match string is found, `run-until-match` exits with status code 0.
* If the command exits on its own before a match is found, the original exit code is propagated.
