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

## MIDI Show Control (MSC)

MSC output is optional and disabled by default. Existing OSC actions keep their IDs and behavior. For MIDI-only operation, uncheck **Enable OSC**; no IP address is needed.

1. Create a MIDI route from the computer running Companion to Vista: a hardware MIDI interface, macOS IAC bus, or an OS network MIDI session (such as RTP-MIDI). This module selects an existing OS output port; it does not create a network MIDI session.
2. In Vista **File > User Preferences > MIDI**, select the receiving external MIDI port and set the MSC device ID. Enable MIDI Show Control in Vista. Menu wording can vary by Vista version.
3. In this connection, enable MSC, choose the matching **MIDI output port**, and set the **device ID** in decimal. Save the connection. Save and reopen settings to refresh the port list after adding a port. Selection uses the exact port name, so port reordering will not silently redirect commands. Missing or duplicate names are rejected.
4. Leave **command format** at **1 (Lighting / 0x01)**, the format documented for Vista. Other 7-bit values are an advanced override; Vista acceptance of those formats is not confirmed.
5. Add **MSC: GO / STOP / RESUME** to a button and choose the command, cue, and optional cuelist.

- **GO (0x01)** plays the numbered cue, or advances to the next cue when the cue and list fields are blank.
- **STOP (0x02)** pauses running transitions. **RESUME (0x03)** continues stopped transitions. With no cue, they affect all applicable transitions; these are not release commands.
- A cue alone addresses that cue number in the open cuelists. A cue plus cuelist targets that numbered cue in that list. Lists must be available to MSC in Vista. Both fields use numeric identifiers, not names, and preserve decimal sections (for example cue `34.5`, list `12`).
- A cuelist without a cue is rejected: the MSC specification requires a cue when a list is supplied, and an empty-cue/list extension has not been verified in Vista. For next-cue control of selected lists, manage Vista's open cuelists externally before sending a blank GO. This module does not change open/closed list membership.
- Device IDs are **0–127**, with **127 (0x7F)** the MSC all-call/broadcast ID. The Vista 3.3 guide prints a range of 0–128; 128 cannot fit a 7-bit SysEx data byte and is rejected here. Use a specific matching ID for normal operation.

The emitted frame is `F0 7F <device> 02 <format> <command> [ASCII cue [00 ASCII cuelist]] F7`. For device 1, Lighting format, GO cue 34.5 in list 12 is:

```text
F0 7F 01 02 01 01 33 34 2E 35 00 31 32 F7
```

MSC is output only: an open MIDI port does not confirm that Vista received or executed a command, and these actions provide no playback feedback. A send error closes the output and reports an error; save settings to reconnect. OSC reception is unchanged.

### Capability references and validation

- [Vista 3.3 User Guide](https://www.vistabychromaq.com/wordpress/wp-content/uploads/2020/11/Vista-V3R3-User-Guide.pdf), Appendix 3, printed pages 302–304: MIDI routes, GO, STOP, RESUME, and cuelist behavior.
- [Jands TBJLT196, 4 July 2018](https://cdck-file-uploads-us1.s3.dualstack.us-west-2.amazonaws.com/flex016/uploads/chroma_q/original/1X/4ccdeb1498d05e2fee31d93d6f0c4947df7cdcda.pdf): Vista 2.3/3.0 frame format, numeric ASCII addressing, and published GO examples. Its table omits RESUME and contains inconsistent entries (including STOP's “Enter” column); use the user guide and standard command bytes above.
- [MSC specification](https://www.richmondsounddesign.com/docs/midi-show-control-specification.pdf), command definitions: GO 01, STOP 02, RESUME 03 and cue/list requirements.

Run `yarn test`, `yarn lint`, and `yarn package` to validate the implementation. Tests cover documented byte sequences, invalid inputs, and MIDI port lifecycle using a fake output. Before live use, test against your Vista version: route MIDI, match device IDs, GO a numbered cue/list, STOP a long fade, RESUME it, then check blank-address behavior with your open lists. Confirm existing OSC buttons still work with MSC enabled and disabled. Automated tests cannot establish actual Vista execution.
