# Whip

Glue code for creating and using custom tools with a locally hosted LLM model.

Whip uses [Ollama's JS API](https://npmjs.com/package/ollama) to provide a basic agentic loop, with callable tools written in TypeScript.

## Prerequisites

- Node.js (installation via [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) recommended) ([supported version](./.nvmrc))
- [Ollama](https://ollama.com/download)
- LLM model with tool call support, e.g. [gemma4:e4b](https://ollama.com/library/gemma4)

```sh
$ ollama install gemma4:e4b
```

## Installation

- Clone the repo, `cd` into the project root and install Node.js dependencies:

```sh
$ git clone git@github.com:thykka/whip.git
$ cd ollama-tools
$ npm i
```

- Run the agent with your prompt

```sh
$ npm start "Is it Friday yet?"
```

## Creating tools

Copy [`hello`](./tools/hello.ts) for a simple starting point.
Remember to import and add your tool to the `toolSpecs` object in [index.ts](./index.ts).
