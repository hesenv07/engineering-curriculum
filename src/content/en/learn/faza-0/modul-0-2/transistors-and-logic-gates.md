---
title: "Transistors and Logic Gates"
---

<Intro>

In 1854, an English mathematician named George Boole published a book arguing that human reasoning could be written as algebra. Where ordinary algebra had numbers, his had exactly two values — true and false — and where it had plus and times, his had *or* and *and*. He titled it *An Investigation of the Laws of Thought*, and he meant it literally: he believed he was writing down the mechanics of the mind. He died ten years later, having never seen his system used for anything at all. Eighty-three years after that book, a 21-year-old graduate student at MIT was working a dull job maintaining a room-sized mechanical calculator full of clicking electrical relays, and he noticed something nobody had noticed: **Boole's algebra was not a description of thought. It was a wiring diagram.** A relay is either open or closed — two values. Two relays in a row behave exactly like Boole's *and*. Two side by side behave exactly like his *or*. Claude Shannon wrote this up as his 1937 master's thesis, and in doing so he handed the world the instruction manual for building a mind out of switches. (You have met Shannon before: eleven years later he would write the paper that named the **bit**, in Lesson 1.) Ten lessons taught you what a bit *means*. This lesson is where a bit finally becomes a physical thing you could hold — and where a lump of silicon starts making decisions.

</Intro>

<YouWillLearn>

- What a bit physically **is** — a voltage, plus a contract about where the threshold sits
- Why the digital world is built from exactly two states, and why that choice makes data survive noise
- What a **transistor** actually does: a switch whose handle is another wire, with no moving parts
- How switches in **series** become AND and switches in **parallel** become OR — the entire foundation, in two pictures
- The seven gates worth memorizing, their truth tables, and how to trace a circuit by hand
- Why a real NAND gate costs **4 transistors** while AND costs 6 — and why one gate type can build every circuit that has ever existed

</YouWillLearn>

## A bit, at last, in the physical world {/*a-bit-in-the-physical-world*/}

For ten lessons a bit has been an abstraction: a 0 or a 1, a switch in a diagram, something you could reason about but not touch. Time to answer the question that was quietly postponed the whole time. **What is a bit made of?**

In almost every computer ever built, the answer is **a voltage on a wire**. That's all. A wire sitting near zero volts is a 0; a wire held up near the supply voltage is a 1.

But notice immediately what kind of answer that is, because it is the oldest idea in this course wearing new clothes. Voltage is a *continuous* quantity — a wire can sit at 0.3 volts, or 1.7, or 2.85. Nature does not hand you two states; it hands you a dial. The two states are something *we impose*, by declaring a threshold and agreeing to ignore everything in between:

```
  3.3 V ──┬─────────────────────────
          │   read as 1
  2.0 V ──┴─────────────────────────
              no meaning assigned
  0.8 V ──┬─────────────────────────
          │   read as 0
  0.0 V ──┴─────────────────────────
```

Lesson 1's first rule was **bytes have no meaning — contracts do**. Here is that rule one floor further down: **volts have no meaning either.** 2.9 volts is not a 1; it is 2.9 volts, which *this family of chips has agreed to call* a 1. Change chip families and the numbers change — 5 V logic, 3.3 V, 1.8 V, and inside a modern processor core, well under a volt. Every one of those is a different contract over the same physics.

And that middle band — the region with no meaning assigned — is not wasted space. It is the single most valuable design decision in the history of computing, because it buys **noise immunity**. Suppose a chip transmits a 1 by driving a wire to 3.3 V, and along the way the signal picks up interference, resistance, crosstalk from a neighbouring wire, and arrives at 2.6 V. Degraded — but still comfortably above 2.0 V, so the receiver reads a clean 1, and here is the crucial part: it doesn't pass along the damaged 2.6 V. It generates a **fresh, full-strength 3.3 V** for the next stage. The noise is not reduced. It is *deleted*.

That is why a file copied ten thousand times is bit-identical to the original, while a photocopy of a photocopy of a photocopy turns to mush, and a cassette dubbed from a cassette hisses. Analog signals accumulate every insult they ever receive. Digital signals get rounded back to perfection at every single stage — which, if you remember Lesson 7's one-way door, is a rather satisfying reversal: quantizing *away* information is exactly what makes the surviving information indestructible.

## The switch whose handle is a wire {/*the-switch-whose-handle-is-a-wire*/}

Now, who does the switching? Follow the actual hardware, because each generation fixes a specific flaw in the last one, and the progression explains why modern computers look the way they do.

**Relays** came first — the technology Shannon was staring at in 1937. A relay is a mechanical switch with an electromagnet bolted to it: send current through the coil, the magnet yanks a metal arm, and a *separate* circuit snaps closed. That single property is the one that matters, and it is worth saying slowly, because everything downstream depends on it: a relay is **a switch whose handle is another wire**. An ordinary light switch needs a finger. A relay can be flipped by electricity — which means one switch can flip another switch, which means switches can be chained into arbitrarily long trains of cause and effect *with nobody in the room*. That is the whole idea of automatic computation, and it was available in 1937. The Harvard Mark I, built from electromechanical parts, managed about **3 additions per second** — you could watch it think, and hear it.

**Vacuum tubes** came next, doing the same job with no moving parts: a hot filament boils off electrons, and a small voltage on a grid controls how many get through. Nothing mechanical means nothing to physically move, so tubes switched roughly a thousand times faster. ENIAC (1945) used **17,468** of them to reach about **5,000 additions per second** — a 1,600× speedup over the Mark I. The bill came in other currencies: 27 tons, 150 kilowatts, and thousands of glass bulbs that ran white-hot and burned out, so that a routine part of operating the world's most advanced computer was hunting for which tube had died.

**The transistor** fixed the rest. On December 16, 1947, at Bell Labs, John Bardeen and Walter Brattain got a sliver of germanium with two gold contacts to amplify a signal; a week later they demonstrated it to management. With William Shockley they shared the 1956 Nobel Prize in Physics. The name was coined in-house, from *transresistance*, and the thing itself is best understood as the relay's dream: a switch operated by a wire, with no moving parts, no filament, no heat to speak of, made of solid material — and, crucially, **shrinkable**.

<Diagram name="transistors-and-logic-gates/transistor_switch" height={360} width={720} alt="Three panels side by side under the title 'a switch whose handle is another wire'. Left panel, labelled 'inside one transistor': a grey silicon body with darker source and drain pads at each end, a red gate plate sitting just above the body with a red lead going up labelled 'gate', a dashed blue line between source and drain labelled 'channel', and leads dropping from the pads labelled 'source' and 'drain'; a note reads 'voltage on the gate opens or closes the channel'. Middle panel, labelled 'gate = 0' in grey: a simple circuit with a battery on the left, an open switch on the top wire drawn as a lifted lever, and an unlit lamp on the right; a red 'control wire' leads into the switch; caption 'open — no current'. Right panel, labelled 'gate = 1' in blue: the same circuit with the switch closed as a straight line and the lamp lit, drawn with blue radiating rays; caption 'closed — current flows'. A caption across the bottom reads: no moving parts, nothing to wear out, and it flips billions of times a second.">

One transistor. A voltage on the gate decides whether the channel between source and drain conducts — so the wire on the left decides whether the circuit on the right is connected.

</Diagram>

That last property, shrinkability, is where the numbers stop being intuitive. A processor like Apple's M1 (2020) holds about **16 billion** transistors on a die of roughly 120 mm² — a fingernail. That is **133 million switches per square millimetre**, and nearly **a million times** as many switches as ENIAC had tubes, in something you can lose in a pocket. Each one can flip billions of times per second; at 3 GHz a single tick lasts about 333 picoseconds.

<Note>

A transistor is not a tiny mechanical switch, and the mental image of a little metal lever is worth discarding now. Nothing moves. The gate sits above the silicon separated by an insulating layer, and its *electric field* reaches through that insulator to attract or repel charge carriers in the material below, forming or dissolving a conducting channel. That is why the common type is called a MOSFET — a metal-oxide-semiconductor **field-effect** transistor. Nothing touches; a field does the work. This is also why transistors have no wear-out mechanism in the way a relay's contacts do, and why they can be driven at frequencies a mechanical part could never survive.

</Note>

## Two switches make a decision {/*two-switches-make-a-decision*/}

Here is Shannon's 1937 insight, and it is genuinely this simple. Take a battery, a lamp, and two switches. You can wire the switches two ways, and the two ways behave differently.

<DiagramGroup>

<Diagram name="transistors-and-logic-gates/switch_series_and" height={340} width={340} alt="A circuit diagram titled 'two switches in a row', subtitled 'series wiring'. A battery on the lower left connects up and along the top wire through two closed switches drawn in blue, labelled A and B in monospace, then right and down to a lit lamp drawn as a circle with an X inside and blue rays around it, then back along the bottom to the battery. Caption inside the figure reads 'both closed → lamp on'.">

**Series.** The current has to get through A *and then* through B. One open switch anywhere in the chain breaks everything.

</Diagram>

<Diagram name="transistors-and-logic-gates/switch_parallel_or" height={340} width={340} alt="A circuit diagram titled 'two switches side by side', subtitled 'parallel wiring'. A battery on the lower left connects up to a point where the wire splits into two parallel branches: the upper branch has a closed switch drawn in blue labelled A, the lower branch has an open switch drawn as a lifted lever in grey labelled B. The branches rejoin on the right and continue to a lit lamp with blue rays around it, then back along the bottom to the battery. Caption inside the figure reads 'either closed → lamp on'.">

**Parallel.** The current has two routes. Closing either one is enough; the lamp only stays dark if *both* are open.

</Diagram>

</DiagramGroup>

Now write down what each circuit does, using 1 for "closed" and 1 for "lamp on" — the contract from the previous section, applied to switches:

| A | B | series (lamp) | parallel (lamp) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 |

Look at those two columns. The series column is 1 only when both inputs are 1: that is Boole's **AND**, built out of copper. The parallel column is 1 whenever at least one input is 1: Boole's **OR**. Nobody designed these circuits to do logic. Logic is just what wiring *is*, once you agree to call voltages 0 and 1. ✓

That is the whole trick, and everything else in this module is consequences. A table like the one above is called a **truth table**, and it is the complete specification of a piece of logic — for two inputs there are only four possible situations, so if you have written down all four rows, you are *finished*; there is nothing left to discover about that circuit. This is a luxury software rarely offers.

One thing switches alone cannot do, though. Both circuits above are **monotone**: adding a closed switch can only ever turn the lamp on, never off. Yet the most basic logical operation of all is *reversal* — given 1, produce 0. For **NOT** you need a switch that connects the output to ground when its input is high, so that turning the input on pulls the output *down*. Transistors do this naturally, and it is why real gates are built the way the next section shows.

## The gates worth memorizing {/*the-gates-worth-memorizing*/}

A **logic gate** is a small circuit that computes one of these functions — a reusable part with inputs on the left and an output on the right. There are exactly seven you need:

| A | B | AND | OR | NAND | NOR | XOR | XNOR | | NOT A |
|---|---|-----|----|------|-----|-----|------|---|-------|
| 0 | 0 | 0 | 0 | **1** | **1** | 0 | 1 | | 1 |
| 0 | 1 | 0 | 1 | **1** | 0 | **1** | 0 | | 1 |
| 1 | 0 | 0 | 1 | **1** | 0 | **1** | 0 | | 0 |
| 1 | 1 | 1 | 1 | **0** | 0 | 0 | 1 | | 0 |

Read them as sentences rather than memorizing columns:

- **AND** — "both". **OR** — "at least one". **NOT** — "the opposite".
- **NAND** — "not both", which is AND with its output flipped. Look at the column: it is 1 almost always, and drops to 0 only in the single case where both inputs are 1.
- **NOR** — "neither".
- **XOR** — *exclusive* or, meaning "exactly one, but not both". This is the gate that matches how people usually use the English word "or" ("tea or coffee" rarely means you may have both), and it is the one you have already met: XOR was the carry-free addition inside Lesson 8's CRC division. It is also, as the next lesson will show, most of what an adder is.
- **XNOR** — "the same", which is why it is the natural equality test.

**Worked example — build XOR out of AND, OR and NOT.** Suppose your parts bin has no XOR. "Exactly one of them" can be said differently: *either A is on while B is off, or B is on while A is off.* In gates: `(A AND NOT B) OR (NOT A AND B)`. Check all four rows — and with two inputs, four rows is a *proof*, not a spot check:

```
 A B │ NOT B │ A AND NOT B │ NOT A │ NOT A AND B │  OR  → out
 ────┼───────┼─────────────┼───────┼─────────────┼────────────
 0 0 │   1   │      0      │   1   │      0      │      0
 0 1 │   0   │      0      │   1   │      1      │      1
 1 0 │   1   │      1      │   0   │      0      │      1
 1 1 │   0   │      0      │   0   │      0      │      0

 output column: 0 1 1 0  =  exactly the XOR column above ✓
```

Five gates, and a new part exists. This is the entire method of digital design: describe what you want as a truth table, then assemble gates until the columns match.

## What a gate is really made of {/*what-a-gate-is-really-made-of*/}

Time to open a gate up, because the inside explains a fact that looks backwards at first: in real silicon, **NAND is cheaper than AND**.

Modern chips use a style called **CMOS**, which pairs up two flavours of transistor:

- an **N-type** closes when its gate is 1 (a "1 closes it" switch), and is good at pulling a wire down to 0;
- a **P-type** closes when its gate is **0** — the opposite — and is good at pulling a wire up to 1.

Every CMOS gate is then built the same way: a network of P-types above the output that can pull it *up* to 1, and a mirror-image network of N-types below that can pull it *down* to 0, arranged so that exactly one of the two networks conducts at any moment. Wire them like this and you get a NAND:

<Diagram name="transistors-and-logic-gates/cmos_nand" height={400} width={720} alt="A schematic titled 'a real NAND gate: four transistors'. A horizontal power rail runs across the top marked 1 and labelled 'power'; a horizontal ground rail runs across the bottom marked 0 and labelled 'ground'. Two vertical switches hang side by side from the power rail down to a shared horizontal wire in the middle; their inputs are labelled A and B at the top and each is annotated in red 'closes if A = 0' and 'closes if B = 0'. The shared middle wire carries a blue dot, from which a blue wire runs right to a label 'out'. From that same dot, two more vertical switches run in a single column down to the ground rail, annotated in blue 'closes if A = 1' and 'closes if B = 1'. Side notes on the left read, in red, 'two switches side by side: either one can pull out to 1' and, in blue, 'two switches in a row: both needed to pull out to 0'. A caption at the bottom reads: out drops to 0 only when A = 1 and B = 1 — which is exactly NAND.">

Four transistors. The P-types on top are wired in **parallel** (either can pull the output up); the N-types underneath are wired in **series** (both are needed to pull it down) — the same two arrangements from the lamp circuits, now stacked.

</Diagram>

Trace it in the only case that matters. Set **A = 1 and B = 1**: both N-types close, so the series path to ground completes and the output is dragged to 0. Meanwhile both P-types — which close on 0 — are open, so nothing fights it. Output = 0. In every other case at least one input is 0, which opens the N-series (no path down) and closes at least one P-type (a path up), so the output is 1. That is the NAND column exactly. ✓

Now count the cost. NAND: **4 transistors**. NOR: 4. NOT: **2** (one P, one N — the smallest gate there is). And AND? There is no way to build a non-inverting gate directly in this style, because the pull-down network always inverts the sense of its inputs. So AND is built as **NAND followed by a NOT — 6 transistors**, half again as expensive as the "simpler" operation. Chip designers therefore think in NAND and NOR the way you think in `if` statements, and a compiler for hardware will happily rewrite your ANDs and ORs into inverting gates to save area.

One more consequence, and it will matter for the rest of Phase 0: notice that when a CMOS gate is *sitting still*, one network is open, so there is no path from power to ground and almost no current flows. A gate at rest is nearly free. It costs energy mainly in the instants when it **switches** — charging and discharging the wire at its output. That single fact is why processors are rated in gigahertz *and* watts, why your laptop is cool while idle and hot while compiling, and why the industry's central problem for the last twenty years has been heat. We will collect on that observation twice more before this phase is over.

<DeepDive>

#### Why two states, and not ten {/*why-two-states-and-not-ten*/}

Binary can feel like a strange, arbitrary constraint — humans count in tens, and a wire can obviously hold more than two distinguishable voltages. So why did the entire industry standardize on the smallest possible number of states?

It has been tried both other ways, and both are in your notes already. **ENIAC (1945)** was a *decimal* machine: it represented digits 0–9 directly, using ten-position ring counters, because its designers wanted to match human arithmetic. **Setun (1958)**, built at Moscow State University, used balanced *ternary* — three states — and it was elegant, genuinely efficient by some measures, and it worked. Neither approach survived.

The reason is the noise margin from the first section. Suppose your supply is 3.3 V. With two states, the gap between "definitely 0" and "definitely 1" is well over a volt — you can insult a signal badly and still recover it perfectly. Slice the same 3.3 V into ten levels and each is about 0.33 V from its neighbours, minus the margins; now a modest amount of interference turns a 6 into a 5, and *silently*, since the receiver has no way to know it was handed a damaged value. With three levels, still worse than two.

There is a second reason, more fundamental. "Is this switch open or closed?" is the easiest question you can ask a piece of matter — it is a question about whether a path exists. "Is this switch 40% open?" demands that a device hold an analog quantity precisely, across temperature swings, manufacturing variation, and twenty years of ageing. Two states means every component only has to be trustworthy about the *extremes*, where physics is most cooperative: fully on, fully off.

So binary is not a limitation the industry accepted; it is the *cheapest possible reliability*. Everything in Module 0.1 — the byte, two's complement, IEEE 754, UTF-8 — is downstream of a decision made because two states are the hardest thing to accidentally break.

</DeepDive>

<DeepDive>

#### One gate to rule them all {/*one-gate-to-rule-them-all*/}

Here is a result that sounds like an exaggeration and is not: **NAND alone is enough to build every possible digital circuit.** Not "most". Every one — every processor, every memory, every graphics chip that will ever be designed. A gate with this property is called **universal**, and NAND has it. So does NOR.

The proof is constructive, and short enough to do here. If you can build NOT, AND and OR out of NAND, then you can build anything, because any truth table whatsoever can be written as ORs of ANDs of possibly-inverted inputs.

<Diagram name="transistors-and-logic-gates/nand_universality" height={320} width={720} alt="Three bordered panels titled 'every gate, from one gate'. Left panel headed NOT with the note '1 gate': a single NAND symbol — a D-shape in blue with a small circle on its output — has input A split and fed into both of its input pins, with the output labelled 'not A'. Middle panel headed AND with the note '2 gates': inputs A and B feed a first NAND, whose output feeds into both input pins of a second NAND, whose output is labelled 'A and B'. Right panel headed OR with the note '3 gates': input A feeds both pins of one small NAND and input B feeds both pins of a second small NAND; the two outputs feed the two inputs of a third NAND, whose output is labelled 'A or B'. A caption at the bottom reads: a factory that can print one part can build any circuit that has ever existed.">

Three constructions, and universality is proved. Each little D-shape with a bubble is the same four-transistor part.

</Diagram>

**NOT** is one NAND with both inputs tied to the same wire. NAND means "not both", and when the two inputs are the same value, "not both" collapses to "not":

```
 A │ A NAND A
 ──┼──────────
 0 │    1
 1 │    0        = NOT A ✓
```

**AND** is a NAND followed by that NOT — invert the inverted answer:

```
 A B │ A NAND B │ then NAND with itself → out
 ────┼──────────┼─────────────────────────────
 0 0 │    1     │            0
 0 1 │    1     │            0
 1 0 │    1     │            0
 1 1 │    0     │            1     = A AND B ✓
```

**OR** takes De Morgan's law — "at least one is true" is the same statement as "they are not both false." Invert both inputs, then NAND them:

```
 A B │ NOT A │ NOT B │ (NOT A) NAND (NOT B)
 ────┼───────┼───────┼──────────────────────
 0 0 │   1   │   1   │          0
 0 1 │   1   │   0   │          1
 1 0 │   0   │   1   │          1
 1 1 │   0   │   0   │          1    = A OR B ✓
```

This is not merely a curiosity for exams — it is a manufacturing strategy. A fabrication line that can reliably print one four-transistor cell can build anything, and a chip built from one repeated cell is easier to lay out, verify, and yield. The most famous demonstration flew: the **Apollo Guidance Computer**, the machine that navigated humans to the Moon, was built from roughly **2,800 identical integrated circuits**, each containing a pair of three-input **NOR** gates — about 5,600 gates of a *single type*, and nothing else. The engineers chose one universal gate and repeated it, partly because a single part number was far easier to test and trust with lives. Everything from the guidance equations to the display interface was that one gate, wired differently.

</DeepDive>

<Pitfall>

**Gates do not compute instantly.**

The mistake is to read a truth table as if it were a mathematical equation, true at all times. A physical gate is a switch driving a wire, and both take time: the transistors must actually turn on, and the output wire's capacitance must actually charge. That delay — tens of picoseconds for a modern gate, more for a long wire — is called **propagation delay**, and it means that for a brief window after its inputs change, a gate's output is *wrong*.

Worse, the wrongness can be visible and weird. Chain two gates where one path is slower than the other and the output can flicker to a value that appears in no row of your truth table, before settling to the correct one. Circuit designers call these **glitches**, and a truth table cannot predict them, because a truth table has no notion of time.

The correction is not faster gates; it is *waiting*. Real designs compute the answer, then wait long enough for the slowest path to settle, and only then read the result — and the thing that enforces the waiting is the **clock**, the third lesson of this module. So the lesson to carry forward is this: a truth table describes what a circuit settles to, never what it does on the way there. Every combinational circuit you will ever meet is correct only *after* it has been given time.

</Pitfall>

## The gate bench {/*the-gate-bench*/}

Lesson 1 handed you eight switches and let you build a byte. Here are two switches and every decision they can make. Flip A and B; each gate's output lights up live, and the row of the truth table you are currently standing in is highlighted. Two things worth hunting for: find the single row where NAND goes dark, and confirm that XOR and OR disagree in exactly one row:

<Sandpack>

```js
import { useState } from 'react';

const G = [
  ['AND', (a, b) => a && b],
  ['OR', (a, b) => a || b],
  ['NAND', (a, b) => !(a && b)],
  ['NOR', (a, b) => !(a || b)],
  ['XOR', (a, b) => a !== b],
  ['XNOR', (a, b) => a === b],
];
const ROWS = [[0, 0], [0, 1], [1, 0], [1, 1]];
const td = { padding: '4px 9px' };

export default function GateBench() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const toggle = (v, set) => (
    <button onClick={() => set(v ? 0 : 1)} style={{
      width: 74, height: 74, fontSize: 30, margin: 8, borderRadius: 12,
      cursor: 'pointer', fontFamily: 'monospace',
      border: `2px solid ${v ? '#087ea4' : '#888'}`,
      background: v ? '#087ea4' : 'transparent',
      color: v ? 'white' : 'inherit'
    }}>{v}</button>
  );
  return (
    <div style={{ fontFamily: 'system-ui', textAlign: 'center' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 18 }}>
        A {toggle(a, setA)} {toggle(b, setB)} B
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {G.map(([n, f]) => {
          const out = f(a, b) ? 1 : 0;
          return (
            <div key={n} style={{
              width: 92, margin: 5, padding: '8px 0', borderRadius: 10,
              border: `2px solid ${out ? '#087ea4' : '#888'}`,
              background: out ? '#087ea41f' : 'transparent'
            }}>
              <div style={{ fontSize: 13, color: '#888' }}>{n}</div>
              <div style={{ fontSize: 26, fontFamily: 'monospace',
                color: out ? '#087ea4' : 'inherit' }}>{out}</div>
            </div>
          );
        })}
      </div>
      <table style={{ margin: '14px auto', borderCollapse: 'collapse',
        fontFamily: 'monospace', fontSize: 15 }}>
        <tbody>
          <tr style={{ color: '#888' }}>
            {['A', 'B', ...G.map((g) => g[0])].map((h) => (
              <td key={h} style={td}>{h}</td>
            ))}
          </tr>
          {ROWS.map(([ra, rb]) => {
            const here = ra === a && rb === b;
            return (
              <tr key={`${ra}${rb}`} style={{
                background: here ? '#087ea425' : 'transparent',
                outline: here ? '2px solid #087ea4' : 'none'
              }}>
                <td style={td}>{ra}</td>
                <td style={td}>{rb}</td>
                {G.map(([n, f]) => (
                  <td key={n} style={td}>{f(ra, rb) ? 1 : 0}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: '#888' }}>
        Four rows is the whole truth. There is nothing else these two
        wires can ever do.
      </p>
    </div>
  );
}
```

</Sandpack>

Sit with that last line for a moment, because it is the reason this module can exist at all. A two-input gate has four possible situations, and you have just seen all of them. Nothing is hidden, nothing is probabilistic, nothing depends on the weather. Build from parts this small and this completely understood, and you can reason about a machine of twenty billion of them — which is what the rest of Phase 0 does.

<Recap>

- A bit in hardware is **a voltage plus a contract**: below one threshold it is read as 0, above another as 1, and the band between them is deliberately left meaningless. Volts have no meaning on their own — the same physics is 5 V logic, 3.3 V logic, or sub-1 V inside a modern core.
- That meaningless middle band buys **noise immunity**: a degraded signal is read as the nearest legal value and then *regenerated at full strength*, so digital data survives copying while analog accumulates every insult. Binary won over decimal (ENIAC) and ternary (Setun) because two states are the cheapest thing to be reliable about.
- A **transistor** is a switch whose handle is another wire — a voltage on the **gate** opens or closes the channel between source and drain, with no moving parts. Apple's M1 fits about 16 billion of them on ~120 mm², roughly **133 million per square millimetre** and nearly a million times ENIAC's 17,468 tubes.
- **Switches in series behave like AND; switches in parallel behave like OR.** That is Shannon's 1937 thesis in one sentence: logic is not something added to wiring, it is what wiring already does once you name the voltages. **NOT** requires a transistor that pulls the output *down*, which plain switches cannot do.
- A **truth table** is a complete specification: with two inputs there are only four rows, so checking all four is a proof. The seven gates: **AND** (both), **OR** (at least one), **NOT**, **NAND** (not both), **NOR** (neither), **XOR** (exactly one), **XNOR** (the same).
- In **CMOS**, P-types pull up and close on 0, N-types pull down and close on 1. NAND costs **4 transistors**, NOT costs 2, and AND costs **6** (NAND + NOT) — inverting gates are the native ones, which is why hardware is designed in NAND and NOR. A gate at rest draws almost nothing; it burns power when it **switches**.
- **NAND is universal**, and so is NOR: NOT is one NAND with its inputs tied, AND is two, OR is three (via De Morgan). The Apollo Guidance Computer was built from about **2,800 chips of one part** — dual three-input NOR gates, and nothing else.
- Gates have **propagation delay**, so a truth table describes only what a circuit *settles to*, never what it does on the way. Glitches are real, and the fix is waiting — which is what a clock is for.

</Recap>

<Challenges>

#### Wire the interlock {/*wire-the-interlock*/}

A microwave should only run when the door is closed **and** the start button is pressed. A fire alarm should sound when the smoke sensor trips **or** the manual pull is used. For each one, say whether you would wire the two switches in series or in parallel, and write the truth table. Then answer the design question: which of the two arrangements is the safer default if a wire inside the machine breaks?

<Hint>

A broken wire is a switch that can never close again. Ask what each circuit does when one of its two paths is permanently dead — and then ask which failure you would rather have in a microwave, and which in a fire alarm.

</Hint>

<Solution>

**Microwave — series (AND).** Both conditions must hold.

```
 door  start │ magnetron
 ────────────┼───────────
   0     0   │     0
   0     1   │     0
   1     0   │     0
   1     1   │     1     ✓
```

**Fire alarm — parallel (OR).** Either trigger is enough.

```
 smoke  pull │ siren
 ────────────┼───────
   0     0   │   0
   0     1   │   1
   1     0   │   1
   1     1   │   1     ✓
```

**The broken-wire question.** A break makes a switch permanently open. In **series**, one break means the output can never turn on — the machine becomes *inert*. In **parallel**, one break only removes one of two triggers; the other still works, and the output can still fire.

So the safe default depends entirely on which outcome is dangerous, and the two examples are deliberately opposite. For the microwave, "never turns on" is a harmless failure and "turns on with the door open" is not — series is right, and this is genuinely why real interlocks are wired so that a fault kills the power rather than enabling it. For the alarm, "never sounds" is the catastrophic failure, so parallel is right, and real fire systems go further by continuously monitoring the wiring itself so that a break is *reported* rather than silently reducing coverage.

That last point is Lesson 8's lesson arriving in copper: the dangerous failure is not the loud one, it is the silent one. A dead alarm circuit looks exactly like a quiet building.

</Solution>

#### Build NOT and AND from NOR only {/*build-not-and-and-from-nor-only*/}

The lesson proved NAND is universal. Now prove it for the other one — the gate Apollo actually flew. Using **NOR gates only** (`A NOR B` = 1 when neither input is 1), build NOT, then OR, then AND. Verify each with a truth table.

<Solution>

**NOT** — one NOR with both inputs tied together. "Neither is 1" collapses to "it is not 1":

```
 A │ A NOR A
 ──┼─────────
 0 │    1
 1 │    0      = NOT A ✓
```

**OR** — NOR is already OR-with-a-flipped-output, so flip it back with the NOT above (two gates total):

```
 A B │ A NOR B │ then NOR with itself
 ────┼─────────┼──────────────────────
 0 0 │    1    │          0
 0 1 │    0    │          1
 1 0 │    0    │          1
 1 1 │    0    │          1      = A OR B ✓
```

**AND** — De Morgan again, mirrored: "both are true" is the same statement as "neither is false." Invert both inputs, then NOR them (three gates):

```
 A B │ NOT A │ NOT B │ (NOT A) NOR (NOT B)
 ────┼───────┼───────┼─────────────────────
 0 0 │   1   │   1   │          0
 0 1 │   1   │   0   │          0
 1 0 │   0   │   1   │          0
 1 1 │   0   │   0   │          1     = A AND B ✓
```

Notice the pleasing symmetry with the NAND constructions in the lesson: NAND builds AND in two gates and OR in three; NOR builds OR in two and AND in three. Each universal gate is *cheap* at the operation it already almost is, and pays one extra layer for the other. Apollo's engineers picked NOR and built a Moon mission out of about 5,600 copies of it.

</Solution>

#### The De Morgan bug {/*the-de-morgan-bug*/}

Transfer task. A pull request "simplifies" a permission check:

```js
// before
if (!(isExpired && isRevoked)) { grantAccess(); }

// after — "cleaner"
if (!isExpired && !isRevoked) { grantAccess(); }
```

The author reports that all their tests still pass. Show with a truth table exactly where the two expressions disagree, state which real-world situation now behaves wrongly and in which direction, explain why the test suite missed it, and write the review comment — including the correct rewrite.

<Solution>

Let `E = isExpired`, `R = isRevoked`:

```
 E R │ !(E && R)  │ !E && !R  │ agree?
 ────┼────────────┼───────────┼────────
 0 0 │     1      │     1     │  yes
 0 1 │     1      │     0     │  NO
 1 0 │     1      │     0     │  NO
 1 1 │     0      │     0     │  yes
```

They disagree in **exactly the two mixed rows** — where one flag is set and the other is not.

**Which direction, and is that good or bad?** The original grants access unless a token is *both* expired *and* revoked — which, read plainly, is a suspiciously permissive rule: an expired-but-not-revoked token gets in. The rewrite denies access if *either* flag is set. So the "cleaner" version is actually the stricter, and almost certainly the *intended*, policy — which makes this a genuinely nasty review, because the change is a behavioural rewrite disguised as a formatting cleanup. The honest reading is that the original condition was probably already a bug, and the PR silently fixes it while claiming to do nothing.

**Why the tests passed:** they evidently only covered the agreeing rows — a fully valid token (0,0) and a thoroughly dead one (1,1). Two inputs have four states and the suite exercised two of them. The lesson's own habit is the fix: with two booleans, *four rows is the whole truth*, and a test suite that skips rows is not testing a condition, it is sampling it.

**Review comment:** *"These two conditions are not equivalent — they differ whenever exactly one flag is set (expired-not-revoked, and revoked-not-expired), so this changes access policy rather than tidying it. De Morgan's law gives the true equivalent of the original: `!(E && R)` is `!E || !R` — note the `||`. If the new stricter behaviour is what we want (I think it is: any expired or revoked token should be refused), let's land it as a deliberate fix with that reasoning in the message, plus tests for all four flag combinations, since the current suite only covers two."*

The transferable habit is the one this lesson has been drilling: **when a condition has two boolean inputs, write down all four rows.** Hardware engineers do this reflexively because a truth table *is* their specification, and it is why the same algebra that lays out four transistors also settles code review arguments. Boole was writing about thought after all — he was just about 170 years early to the pull request. ✓

</Solution>

</Challenges>

<LearnMore title="Building an Adder from Gates" path="/learn/faza-0/modul-0-2/building-an-adder">

You now own the complete parts bin: AND, OR, NOT, and the observation that four rows is a full specification. Next lesson we spend it on the machine Lesson 2 promised and Lesson 3 kept borrowing — the one that actually adds. It starts with a surprise: adding two single bits needs exactly two gates, one of them XOR, and the "carry" you learned on the odometer turns out to be a plain AND. Chain enough of those and you have built the arithmetic unit at the centre of every processor on Earth — including, at last, an honest answer to why `+127 + 1` came out as `−128`.

</LearnMore>
