# Chroma-Q Vista 3

Controls Vista lighting software from Chroma-Q over OSC. Allows for control over most software buttons, softkeys, and actions, and allows for control surface emulation (must have a virtual EX console set up).

## Known limitations

- OSC cannot be used to trigger a specific cue in a specific cuelist. The Vista team says they are working on this for the upcoming Vista 3 R6 ([discussion feed](https://vistaforum.chroma-q.com/t/osc-jump-to-cue-command/3621)).
- Sending an out-of-range page/panel/bank/row/col parameter with a `Console: Playback button` or `Console: Playback fader` action **has been known to crash Vista**. Please test such actions before using in live enviornments.
- The OSC command for stealth does not work. Instead, use the Softkey action with softkey number 9 (same as pressing F9).

## Setup

> [!IMPORTANT]
> Requires Vista 3 R5 to use OSC control

In Vista, activate OSC in the Preferences dialog box (File > Preferences).

- Under _OSC Server_, check **OSC Server Enabled**
- Under _OSC Clients_, create a new client with Companion's IP address and an unused port number (defaults to 9000)
