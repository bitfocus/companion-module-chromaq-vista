# companion-module-chromaq-vista

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

## MIDI Show Control

Optional MIDI SysEx output supports GO, STOP, and RESUME with configurable OS output port, device ID, command format, and numeric cue/cuelist addresses. See [MSC setup and capability references](./companion/HELP.md#midi-show-control-msc). OSC remains enabled by default; MSC is opt-in.

Run `yarn test` for MSC protocol and output lifecycle tests, `yarn lint` for code checks, and `yarn package` to build the Companion module.
