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

## Variables and feedbacks

Variables and feedbacks use **received OSC messages** from the configured Target IP. Set Vista's OSC client's destination port to this module's Listen Port. Enable verbose logging to see incoming addresses and arguments. A successfully opened receiver does not confirm that Vista is online.

In the connection settings, enter one mapping per line under **OSC variables**:

```text
grandmaster=/V3/console/EX/1/gmFader
```

This creates `$(vista:grandmaster)` when the connection is named `vista`. The mapping reads the first argument at that exact, case-sensitive address. Use the actual addresses Vista sends in your setup; the example is a documented control address, not a guarantee that Vista broadcasts it. Values keep their received units (for example, a fader value of `0.5` stays `0.5`, not `50`).

For messages with multiple arguments, append a space and an argument number from 1 to 64. For example, if your show sends `/myshow/cue` with arguments `4` and `Intro`:

```text
cue_number=/myshow/cue
cue_name=/myshow/cue 2
```

`/myshow/cue` is an illustrative, user-defined address, not a built-in Vista cue-status API. Cue numbers, cue names, cuelist state and other values are available only if your Vista setup sends that information. The module does not query or infer playback state from sent commands. Vista's R5 notes document OSC client setup and the contextual **Help > External I/O Reference**, but do not specify an automatic cue-status subscription protocol. See the [Vista 3 R5.0 release notes, pages 38–49](https://www.sceneteknikk.no/wp-content/uploads/Vista-by-Chroma-Q-Vista-3-R5.0-Release-Notes.pdf).

Variable IDs may contain letters, digits and underscores. Blank lines and lines starting with `#` are ignored. IDs must be unique and cannot use the diagnostic variable IDs below, `__proto__`, `constructor`, or `prototype`. Wildcard addresses are not supported. Invalid lines are reported in the connection log; valid lines still work.

Add the **OSC: Variable value** feedback to a button and select a mapped variable. Choose text equality/inequality, numeric equality/ordering, On, Off, or Value received. Numeric equality allows an absolute tolerance of `0.000001` for OSC float rounding. On accepts boolean `true`, number `1`, or text `true`/`1`; Off accepts the corresponding `false`/`0` values. Text comparisons are case-sensitive. The comparison value is ignored for On, Off and Value received.

Values are unknown until received. Unknown values never activate the comparison feedback, including Text does not equal or Off. Missing arguments and unsupported values (such as blobs, arrays or non-finite numbers) clear the affected variable. Zero, `false` and empty strings are valid received values. Values persist until replaced, cleared, or the connection is reconfigured, fails, or is destroyed; they have no expiry timer. OSC bundles, including nested bundles, are processed immediately in message order; future bundle timetags are not scheduled.

The following diagnostic variables are always defined:

| Variable                | Meaning                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `osc_listening`         | The local OSC receiver is listening; does not confirm Vista is online                              |
| `osc_messages_received` | Number of accepted messages from Target IP since reconnect (each bundle message counts separately) |
| `osc_last_address`      | Last accepted OSC address                                                                          |
| `osc_last_value`        | First argument of the last accepted message, or unknown when missing/unsupported                   |

The **OSC: Receiver listening** feedback follows the same local receiver state as `osc_listening`.

## Development checks

Run `yarn test` to build and run the automated checks, `yarn lint` for lint/format checks, and `yarn package` to build the distributable. Tests use synthetic OSC traffic over local UDP sockets; actual Vista output and playback behavior still require testing against your show.
