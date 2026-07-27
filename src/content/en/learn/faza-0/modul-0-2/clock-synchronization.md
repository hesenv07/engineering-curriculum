---
title: "Clock and Synchronization"
---

<Intro>

In the year 2000, Intel launched the Pentium 4 at 1.5 GHz and told the world where it was going. The chip's architecture, NetBurst, had been designed from the ground up around one goal — clock speed — and Intel's published roadmap projected the family reaching **10 GHz**. Engineers inside the company were less serene: for years they had been passing around a chart of power density that put the trend line for future processors alongside a hot plate, then a nuclear reactor core, then a rocket nozzle. Then came October 2004, and Intel quietly cancelled the 4 GHz Pentium 4. Not delayed — cancelled. The fastest Pentium 4 ever sold ran at 3.8 GHz, and more than twenty years later the laptop you are reading this on is very likely clocked between 2 and 5 GHz. The number stopped. Last lesson you built an adder that produces the right answer *eventually* — the carry has to walk, and it walks a different distance depending on the numbers. This lesson is about the wire that decides when "eventually" has arrived: what a clock physically is, what it costs, why every digital machine on Earth has the same three-part shape, and why that one number on the box hit a wall it has never climbed over.

</Intro>

<YouWillLearn>

- Why a correct circuit still produces garbage if you read it at the wrong moment — and what a **glitch** actually looks like
- What a **clock** is: period, frequency, the rising edge, and the discipline it enforces
- How adding a single feedback loop turns logic into **memory** — the latch, and then the **flip-flop**
- The universal shape of every digital system: **register → combinational logic → register**
- How to compute a chip's maximum clock speed from **T_cq + logic + setup + skew**, with real picoseconds
- **Metastability**: the one failure that no amount of careful design can eliminate, only make astronomically unlikely

</YouWillLearn>

## The answer that is briefly a lie {/*the-answer-that-is-briefly-a-lie*/}

Return to the 8-bit ripple-carry adder from last lesson and ask a question we carefully avoided: *when* is its output correct?

Not "is it correct" — we proved that with truth tables. **When.** Because the eight sum bits do not appear simultaneously. Bit 0 has everything it needs immediately: its two inputs are sitting right there, and its carry-in is a hardwired 0. It settles almost at once. Bit 7, by contrast, cannot know its own answer until the carry has clawed its way up through seven full adders below it. Between those two extremes, each bit lands at its own moment.

<Diagram name="clock-synchronization/settling_timing" height={450} width={720} alt="A timing chart titled 'the eight answer bits do not arrive together'. Eight horizontal tracks are stacked, labelled S7 at the top down to S0 at the bottom. Each track begins with a red diagonally hatched region marked as unstable and then switches to a solid blue region labelled 'stable'. The hatched region is longest for S7, ending at 16 on the time axis, and shortest for S0, ending at 2; the tracks in between end at 14, 12, 10, 8, 6 and 4, forming a descending staircase. A horizontal axis below is labelled 'time, in gate delays' and ticked from 0 to 18. Two vertical dashed lines cross all tracks: a red one at time 6 labelled 'read here', and a blue one at time 17 labelled 'or here'. Captions below read 'too early: five bits are still garbage' in red and 'the whole result is trustworthy only after the slowest bit lands' in blue.">

The same addition, drawn against time instead of against truth. Everything left of a bit's blue region is not a wrong answer — it is *no answer*.

</Diagram>

Look at what happens if you read the result at gate delay 6. Bits 0, 1 and 2 have settled and are telling the truth. Bits 3 through 7 are still mid-flight: their transistors are switching, their output wires are somewhere between voltages, and whatever value you capture from them is an accident of timing. Combine the two halves and you get an 8-bit number that is not the sum, not the previous sum, and not any row of any truth table. It is a value that briefly existed and meant nothing.

Engineers call these transient wrong values **glitches**, and they are not rare or exotic — every combinational circuit produces them on every input change. Consider the simplest possible case:

```
 Suppose A goes from 1 to 0, and we compute  (A AND B) OR (NOT A AND C)
 with B = 0 and C = 1, so the answer should stay… let's trace it.

 before:  A=1, B=0, C=1  →  (1 AND 0) OR (0 AND 1)  =  0 OR 0  =  0
 after:   A=0, B=0, C=1  →  (0 AND 0) OR (1 AND 1)  =  0 OR 1  =  1

 The output must go 0 → 1. But NOT A takes one gate delay to appear,
 so for that one gate delay the circuit briefly believes:

 during:  A=0 (already), NOT A=0 (still stale)  →  0 OR 0  =  0

 …and then flips to 1. The output is correct, then correct again,
 with a moment of nothing in between. ✓
```

This is the uncomfortable truth that Lesson 1's tidy truth tables hid: **a truth table describes what a circuit settles to, never what it does on the way there.** Combinational logic has no notion of time, and physics insists on one.

So we need a rule, and the rule has to be brutally simple, because it will be applied to billions of gates at once. Something has to say: *ignore everything the wires are doing, except at these specific instants — and make sure the instants are far enough apart that the slowest signal has finished.*

## The whistle on the factory floor {/*the-whistle-on-the-factory-floor*/}

Here is the machine to keep in your head, and it is a real one.

Picture an assembly line. Each station has one worker with one job: attach a bolt, weld a seam, check a gasket. Between stations sit the parts. Now add the only piece of coordination the whole factory has — a **whistle**. When the whistle blows, every worker simultaneously pushes their part one station down the line and picks up whatever arrived from behind. Then they work. Then the whistle blows again.

Everything important about digital design is already in that picture:

- **Nobody has to watch anybody else.** A worker doesn't need to know when their neighbour finished. They just need to be done before the whistle.
- **The whistle interval is set by the slowest worker**, not the average one. If the gasket check takes eleven seconds, blowing the whistle every ten seconds means half-checked gaskets go down the line forever.
- **Fast workers wait.** The bolt-attacher who finishes in two seconds stands idle for eight. That idleness is not waste to be optimized away — it is the price of everyone agreeing on when "now" is.
- **Work happens between whistles; state changes at the whistle.** Nothing moves during the interval, and everything moves at the instant.

That whistle is the **clock**: one wire, running to every corner of the chip, carrying nothing but a voltage that alternates between 0 and 1 forever.

<Diagram name="clock-synchronization/clock_waveform" height={300} width={720} alt="A waveform diagram titled 'the clock: a wire that says NOW'. A blue square wave runs across the figure for four complete cycles, alternating between a high level labelled 1 and a low level labelled 0 on the left axis. One full cycle is bracketed by two vertical dashed grey lines with a double-headed arrow between them, labelled 'one period T'. At the start of each cycle, a red dot marks the rising edge, with a red arrow pointing down at it; a red label reads 'rising edge — every register looks at its input'. Below the waveform, two lines of monospace text read 'frequency = 1 / T' and '1 GHz = 1000 ps per tick · 3 GHz = 333 ps · 4 GHz = 250 ps'.">

The entire signal. No data, no meaning, no information beyond one thing repeated forever: *now… now… now…*

</Diagram>

The **period** `T` is how long one cycle lasts; the **frequency** is how many cycles fit in a second, and the two are simply reciprocals:

```
 frequency = 1 / T          T = 1 / frequency

   1 GHz  →  T = 1 / 1,000,000,000 s  =  1000 ps
   3 GHz  →  T ≈  333 ps
   4 GHz  →  T =  250 ps
  10 GHz  →  T =  100 ps        ← Intel's promise from the Intro
```

When someone says a processor "runs at 3 GHz," this is the whole claim: its whistle blows three billion times per second, so every piece of logic in it has 333 picoseconds to finish whatever it was asked to do. Not "it performs three billion operations" — we will take that misreading apart in a Pitfall later.

By convention, almost all chips act on the **rising edge**: the instant the clock goes from 0 to 1. The falling edge is ignored. Why an *edge* and not the whole high period? Because an edge is a moment, and a moment is unambiguous. If registers copied their inputs during the entire time the clock was high, a fast signal could race through two registers in one tick — the assembly-line equivalent of a part sliding through two stations on one whistle.

## A circuit that remembers {/*a-circuit-that-remembers*/}

A clock by itself changes nothing. Blowing a whistle at a factory with no shelves between stations accomplishes exactly nothing — parts need somewhere to *sit* while the next worker gets to them. We need a circuit that can be told "capture this value and hold it," and every circuit built so far is incapable of that, for a reason worth naming.

Everything in this module has been **combinational**: the output is a function of the inputs, right now, and nothing else. Feed the same inputs and you get the same output, always, with no history. Such a circuit cannot remember, by construction — there is nowhere for a memory to live.

The fix is one of the great small ideas in engineering, and it is disorienting the first time you see it. Take two NOR gates and **wire each one's output back into the other one's input.**

<Diagram name="clock-synchronization/latch_feedback" height={340} width={720} alt="A schematic titled 'add one loop and the circuit remembers'. Two NOR gates, drawn as blue shield shapes each with a small circle on the output, sit one above the other. An input labelled R in monospace enters the upper NOR gate; an input labelled S enters the lower NOR gate. The upper gate's output runs right to a label Q, and the lower gate's output runs right to a label 'not Q'. Two red wires with arrowheads form a cross: a red junction dot on the Q wire loops down and back to the left into the lower gate's free input, and a red junction dot on the not-Q wire loops up and back into the upper gate's free input. Captions below read 'each output is wired back into the other gate — the pair holds its own state' in red, and 'no clock yet, and already this circuit has a past' in grey.">

Two ordinary gates, one extra pair of wires — and the circuit acquires something no combinational circuit can have: a state that depends on what happened earlier.

</Diagram>

The two gates compute each other's inputs, so write them as a pair — remembering that a NOR outputs 1 only when *both* its inputs are 0:

```
 Q     = NOR(R, not Q)
 not Q = NOR(S, Q)
```

Trace why it holds. Suppose `Q` is 1 and `not Q` is 0, with both `S` and `R` at 0:

```
 Q     = NOR(R=0, notQ=0)  = 1   → Q stays 1     ✓
 not Q = NOR(S=0, Q=1)     = 0   → notQ stays 0  ✓
```

Each output is producing exactly the condition the other one needs to keep producing it. The circuit is holding itself up by its own bootstraps, and it will do so until the power dies or someone interferes.

Interfering is what `S` and `R` are for. Start from the opposite state — `Q=0`, `not Q=1` — and pulse `S` to 1:

```
 not Q = NOR(S=1, Q=0)     = 0   → notQ falls to 0
 Q     = NOR(R=0, notQ=0)  = 1   → Q rises to 1
 …and now drop S back to 0:
 not Q = NOR(S=0, Q=1)     = 0   → notQ stays 0   ✓ state kept
```

The pulse was momentary; the state it created is permanent. **Set** and **Reset**. This arrangement is called an **SR latch**, and it is the ancestor of every bit of memory in every computer, including the DRAM in the machine you are using.

But an SR latch is not yet what we need. It responds the instant its inputs move, which is precisely the anarchy we are trying to escape. Two refinements fix that:

- Add a control input so the latch only listens when that input is high. Now it is a **gated D latch** — `D` for data, one input, "store this while the gate is open."
- Then make it listen not during a *period* but at an *instant* — the rising edge. That is the **edge-triggered D flip-flop**, and it is built, in the standard construction, from two D latches in series driven by opposite clock phases, so that one is always closed. The part is often called a **register** when several are ganged together to hold a whole byte or word.

The behaviour of a D flip-flop is a single sentence, and it is worth memorizing exactly: **on each rising clock edge, the output takes the value the input had at that instant, and holds it, ignoring everything the input does until the next edge.**

<Note>

Notice what just happened to our vocabulary. Until this page, a circuit was a *function*: give it inputs, receive outputs, no history, no time. With one feedback loop, we now have circuits that have a **state** — and a machine with state, a clock, and logic between them is called a **finite state machine**, which is the formal object that every processor, protocol handler, traffic light and vending machine ultimately is. Module 0.3 will open up a CPU and find, at its core, exactly this: a big pile of registers, a big pile of combinational logic, and a wire that says *now*.

</Note>

## The shape of every digital machine {/*the-shape-of-every-digital-machine*/}

With flip-flops and a clock, the discipline that organizes all of digital design falls out, and it is so uniform that once you see it you cannot unsee it:

<Diagram name="clock-synchronization/register_logic_register" height={340} width={720} alt="A block diagram titled 'the shape of every digital system ever built'. On the left, a blue-tinted rounded box labelled 'hold' and 'register' with a small red triangle at its lower-left corner marking the clock input. An arrow leads right from it into a large grey irregular cloud shape labelled 'combinational logic', with sub-labels 'adder, gates, decoders …' and 'no memory, just settling'. Another arrow leads from the cloud right into a second identical register box on the right. Along the bottom runs a horizontal red line labelled 'clock', with two short red wires rising from it into the clock triangles of both registers. A caption reads: state sits in the registers, work happens between them, the clock decides when it counts.">

Registers hold; logic computes; the clock separates the two in time. Every processor, GPU, network chip and microcontroller is this picture, repeated until it fills a die.

</Diagram>

The contract is exact and it is the whole of synchronous design:

1. At a rising edge, the left register presents a stable value to the logic.
2. The logic churns — glitching, settling, doing whatever physics does — for the rest of the period.
3. Before the next rising edge, its output must be **stable and correct**.
4. At that edge, the right register captures it, and the cycle repeats.

Everything the last two lessons taught lives in step 2, and the clock's only job is to guarantee step 3. Which raises the question this lesson has been circling: exactly how much time does step 2 need, and who decides?

## The speed limit, calculated {/*the-speed-limit-calculated*/}

A flip-flop is a physical device, so it comes with its own timing demands beyond "capture at the edge." Three numbers matter, and every datasheet lists them:

- **Clock-to-Q (`T_cq`)** — after the edge, the flip-flop takes a little time to actually produce its new output. Its answer is not instantaneous either.
- **Setup time (`T_setup`)** — the input must already be stable for a short window *before* the edge. A flip-flop is not a camera shutter; it needs the value to hold still while it grabs it.
- **Hold time (`T_hold`)** — the input must remain stable for a short window *after* the edge, too.

Add these to the logic delay and you get the fundamental inequality of digital hardware. Everything that must happen between two ticks:

```
 T_clock  ≥  T_cq  +  T_logic  +  T_setup  +  T_skew
```

Put real numbers on it — these are plausible values for a modern process:

```
 T_cq      =  30 ps     the launching flip-flop's own delay
 T_logic   = 250 ps     the slowest path through the combinational cloud
 T_setup   =  20 ps     the capturing flip-flop's demand
 T_skew    =  25 ps     the clock arriving late at the far end (next section)
 ─────────────────────
 total     = 325 ps

 maximum frequency = 1 / 325 ps ≈ 3.08 GHz
```

<Diagram name="clock-synchronization/timing_budget" height={360} width={720} alt="A diagram titled 'what has to fit between two ticks' showing two horizontal bars. The upper bar, labelled 'at 3 GHz', is a rectangle representing a clock period of 333 ps, filled left to right with four coloured segments labelled Tcq, 'logic delay', 'setup' and a red 'skew' segment, followed by a small dashed blue segment labelled 'slack'; underneath in blue is the verdict 'fits, with 8 ps to spare'. The lower bar, labelled 'at 4 GHz', shows the same four segments against a shorter 250 ps period frame, so the segments extend past the right edge of the frame into a solid red block labelled 'late'; underneath in red is the verdict 'misses the edge by 75 ps'. Captions below read: 30 + 250 + 20 + 25 = 325 ps of work must finish before the next rising edge; and: the slowest path in the whole chip sets the clock for every part of it.">

The same circuit against two different whistles. Nothing about the logic changed between the two bars — only how long it was given.

</Diagram>

Read the lower bar carefully, because it contains the single most important consequence in this lesson. At 4 GHz the period is 250 ps, and our 325 ps of work does not fit. The chip does not run slower, or warm up, or return an approximate answer. The capturing flip-flop samples a value that has not finished settling and stores **garbage**, and from that moment the machine is confidently computing on a number that never existed. Timing failures are the hardware version of the villain this course keeps meeting: silent, wrong data.

And note the phrase in the caption: *the slowest path in the whole chip*. Not the average path — the **critical path**. If a single unlucky route through one obscure corner of a billion-transistor design takes 400 ps, then the entire processor, every core, every cache, must be clocked slowly enough for that one path. This is why chip designers spend enormous effort hunting critical paths, and why last lesson's carry-lookahead adder exists at all: a 64-bit ripple-carry adder needs about 1,920 ps, which alone would cap a whole CPU at roughly **0.5 GHz**.

<Pitfall>

**A higher clock does not mean a faster computer.**

The mistake is treating gigahertz as a performance number. It isn't; it is half of one. The actual relationship is:

```
 work per second  =  work per cycle  ×  cycles per second
                     └── IPC ──┘        └── frequency ──┘
```

A design can buy frequency by making each cycle do *less* — chop the logic into more, smaller stages so each one fits in a shorter period. That is exactly what the Pentium 4's NetBurst architecture did, and it is why a 3.8 GHz Pentium 4 could lose benchmarks to an AMD Athlon 64 running at 2.4 GHz: the Athlon did substantially more per tick. AMD leaned on this so hard that it stopped putting clock speeds in its product names altogether, selling "Athlon 64 3200+" instead — a number chosen to mean *comparable to a 3.2 GHz competitor*, not to describe its own clock. Apple ran advertising on the same point, under the name "the megahertz myth."

The correction is to compare **time to finish a real task**, never the number on the box. And the same trap has a modern costume: two machines at the same frequency can differ by multiples because of cache behaviour, core count, memory bandwidth or thermal throttling — a laptop that boosts to 5 GHz for eleven seconds and then settles at 2.5 GHz has a 5 GHz sticker and 2.5 GHz performance for any job longer than a sneeze.

</Pitfall>

## The whistle has to reach everyone {/*the-whistle-has-to-reach-everyone*/}

There is one term in the timing equation we have not justified: `T_skew`. It exists because the clock is not an abstract idea — it is a voltage on a physical wire that must reach every flip-flop on the chip, and there are hundreds of millions of them.

They cannot all be the same distance from the source. So the clock arrives at some flip-flops slightly before others, and that difference is **clock skew**. If one register hears the whistle 25 ps after its neighbour, then in the worst case the receiving end effectively has 25 ps less time to have its input ready — skew is subtracted straight out of the logic budget, which is why it sits in the inequality.

<Diagram name="clock-synchronization/clock_tree_skew" height={400} width={720} alt="A diagram titled 'one tick, millions of listeners'. On the left, a red dot labelled 'clock source' connects rightward to a vertical red spine, which branches symmetrically into upper and lower horizontal red wires, each of which branches again into two shorter vertical segments, then into four horizontal wires reaching four grey boxes on the right labelled FF. Three of the boxes are annotated in blue 'arrives at 0 ps' and the bottom one is annotated in red 'arrives at 25 ps'. Captions below read: the last flip-flop hears the whistle 25 ps late — that gap is clock skew, and every picosecond of it is stolen from the logic budget.">

Chip designers fight skew with deliberately symmetric distribution networks — the classic pattern is an **H-tree**, where every path from source to leaf has the same length by construction.

</Diagram>

Two facts about the clock network are worth carrying around because they explain a great deal about modern chips.

**First: the clock is one of the largest power consumers on the die.** It is the only signal that switches *every single cycle, everywhere*, and CMOS burns energy precisely when it switches (Lesson 1 of this module). A network driving hundreds of millions of flip-flop inputs, toggling billions of times per second, can account for a substantial share of a processor's total power. The standard remedy is **clock gating**: shutting the whistle off to the parts of the chip that have nothing to do this cycle — which is a big part of why an idle laptop is cool and a compiling one is not.

**Second, and stranger: at modern frequencies, the chip is larger than a clock tick.** Light travels about 30 cm in one nanosecond. At 3 GHz, one whole period is 333 ps, so:

```
 light in one 3 GHz cycle:            ≈ 10 cm
 an electrical signal in silicon:     ≈  5 cm   (roughly half c, at best)
 a large processor die:               ≈  2 cm across

 → a signal can cross the die about twice per tick, in the best case,
   before any transistor delay is counted at all
```

At 10 GHz — the Intro's promise — one period is 100 ps, a signal manages perhaps 1.5 cm, and simply *crossing the chip* consumes the entire cycle. This is not an engineering difficulty to be optimized away; it is the speed of light setting a floor. It is also why modern designs are built as many small, local blocks that mostly talk to their neighbours: at these speeds, distance is time.

<DeepDive>

#### Metastability: the failure you cannot design away {/*metastability-the-failure-you-cannot-design-away*/}

Everything above assumed that data arriving at a flip-flop respects setup and hold. Inside one clock domain a designer can guarantee that. But some inputs are simply not under our control — a button pressed by a human finger, a packet arriving from a network chip with its own crystal, a signal crossing from one part of a chip running at 800 MHz into another running at 2.4 GHz. Such a signal will eventually change at the *exact* forbidden instant, right in the setup window.

What happens then is the strangest phenomenon in digital electronics. The flip-flop does not choose 0. It does not choose 1. It enters **metastability**: an unstable balance point where its internal feedback loop sits with both halves half-on, its output hovering at an intermediate voltage that is neither a legal 0 nor a legal 1. It is the electronic version of a pencil balanced perfectly on its tip, or the philosophers' Buridan's ass, starving between two identical bales of hay because nothing breaks the tie.

The pencil does eventually fall. So does the flip-flop — thermal noise nudges it off the peak and it resolves to some value. The problem is that **there is no upper bound on how long that takes.** The resolution time is probabilistic, decaying exponentially:

```
 MTBF  ≈  e^(t / τ)  /  (T₀ × f_clock × f_data)
```

Don't memorize the formula; look at what the exponent does. With representative values (τ = 20 ps, a 1 GHz clock, an asynchronous input changing 10 million times a second), the mean time between failures for a given amount of settling slack `t`:

```
  t = 200 ps   →  MTBF ≈ 0.1 seconds      (catastrophic)
  t = 400 ps   →  MTBF ≈ 40 minutes       (still unusable)
  t = 600 ps   →  MTBF ≈ 1.7 years        (getting somewhere)
```

Every extra 200 ps of waiting bought roughly *four orders of magnitude* of reliability. That exponential is the entire engineering strategy, and it produces the standard fix, which looks almost too simple: put **two flip-flops in series** and feed the asynchronous signal through both. The first one may go metastable; it then gets an entire clock period to resolve before the second one samples it. Two flip-flops in a row is called a **synchronizer**, and it is mandatory at every boundary where a signal crosses from one clock domain into another — a discipline known as **clock domain crossing**, and one of the richest sources of intermittent, unreproducible, career-shortening bugs in all of hardware.

Note carefully what the synchronizer does and does not do. It does not eliminate metastability — that is impossible, and there is a proof: any device that must decide between two options in bounded time can be driven into an unbounded decision by an input arriving at exactly the wrong moment. What the synchronizer does is push the mean time between failures out to centuries, so that "impossible" and "won't happen before the sun expands" become, for engineering purposes, the same statement. It is the same bargain as Lesson 10's 256-bit seed: you cannot make the bad case impossible, only unreachable.

</DeepDive>

<DeepDive>

#### The machines that refused the whistle {/*the-machines-that-refused-the-whistle*/}

Step back and notice how much the clock costs us. Every circuit waits for the worst case even when the data was easy — the Sandpack below will show you an addition that settles in 4 gate delays being given 16 anyway. The clock network burns a large share of the power budget. Skew eats into every timing path. The whole chip is hostage to its single slowest route.

So why not build circuits with no clock at all, where each block signals "I'm done" to the next one and work flows forward as fast as the data actually allows? This is **asynchronous** (or self-timed) logic, and it is not a thought experiment. Ivan Sutherland — who had already received the 1988 Turing Award — devoted his Turing lecture to a design style he called **micropipelines**, built on exactly this handshaking idea. Through the 1990s a team at the University of Manchester built the **AMULET** processors, a series of fully asynchronous implementations of the ARM architecture that ran real ARM code with no clock anywhere in them.

The advantages are real: average-case speed instead of worst-case, no clock power, no skew, dramatically less electromagnetic emission (a clocked chip screams at its own frequency; an asynchronous one hums broadband), and graceful behaviour as voltage and temperature drift. So why is the machine in front of you synchronous?

Because the whistle buys something worth more than all of that: **a place to stand.** With a clock, a designer can reason about the circuit as a sequence of discrete, complete states — the entire toolchain of simulation, formal verification, static timing analysis and automated place-and-route is built on that assumption. Remove it, and every block needs handshake circuitry (area and delay), the tools mostly do not exist, and the verification problem explodes into reasoning about every possible ordering of every signal. Asynchronous design traded away the very thing that lets teams of hundreds build billion-transistor chips at all.

The compromise is what actually shipped. A modern processor is not one clock domain but *many* — different frequencies for cores, memory interface, and I/O — each internally synchronous, with synchronizers at every border. Globally asynchronous, locally synchronous. The whistle won, but there is now more than one factory.

</DeepDive>

## The timing lab {/*the-timing-lab*/}

Time to break a working circuit purely by rushing it. Below is last lesson's 8-bit adder, now with a clock. Choose the numbers, then drag the clock period and watch the sample point move: bits that have settled report their real values, and bits that have not are shown as `?` — because that is honestly all you know about them.

Three things are worth doing in order. Load `1 + 1` and see how little time it needs. Load `127 + 1` and watch the settle times march up the carry chain to 16 gate delays. Then, with `127 + 1` loaded, drag the period down to 10 and observe that the machine now returns a confident, specific, completely wrong answer — with no error, no warning, and no way for the next stage to know.

<Sandpack>

```js
import { useState } from 'react';

const N = 8;
const ACC = '#087ea4';
const DNG = '#c1554d';
const GATE_PS = 15; // picoseconds per gate delay

const toBits = (v) => Array.from({ length: N }, (_, i) => (v >> i) & 1);
const toVal = (bits) => bits.reduce((s, b, i) => s + b * 2 ** i, 0);

// generate / propagate timing, exactly the model from the previous lesson
function analyse(a, b) {
  const cVal = [0];
  const cValid = [0];
  for (let i = 0; i < N; i++) {
    const g = a[i] & b[i];
    const p = a[i] ^ b[i];
    if (p === 1) {
      cVal.push(cVal[i]);          // this column just passes the carry along
      cValid.push(cValid[i] + 2);  // so it must wait for it
    } else {
      cVal.push(g);                // decided locally, no waiting
      cValid.push(2);
    }
  }
  const sum = [];
  const settle = [];
  for (let i = 0; i < N; i++) {
    sum.push(a[i] ^ b[i] ^ cVal[i]);
    settle.push(Math.max(2, cValid[i] + 2));
  }
  return { sum, settle, worst: Math.max(...settle) };
}

export default function TimingLab() {
  const [a, setA] = useState(toBits(127));
  const [b, setB] = useState(toBits(1));
  const [period, setPeriod] = useState(18);

  const { sum, settle, worst } = analyse(a, b);
  const stable = settle.map((t) => t <= period);
  const badBits = stable.filter((s) => !s).length;
  const correct = badBits === 0;

  const av = toVal(a);
  const bv = toVal(b);
  const trueSum = toVal(sum);
  const maxGHz = 1000 / (worst * GATE_PS);
  const nowGHz = 1000 / (period * GATE_PS);

  const flip = (arr, set, i) => set(arr.map((v, j) => (j === i ? 1 - v : v)));
  const preset = (x, y) => { setA(toBits(x)); setB(toBits(y)); };
  const idx = Array.from({ length: N }, (_, k) => N - 1 - k);
  const TMAX = 20;
  const pct = (t) => `${(t / TMAX) * 100}%`;

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => preset(1, 1)}>1 + 1</button>{' '}
        <button onClick={() => preset(15, 1)}>15 + 1</button>{' '}
        <button onClick={() => preset(127, 1)}>127 + 1</button>{' '}
        <button onClick={() => preset(200, 100)}>200 + 100</button>
      </div>

      <div style={{ fontFamily: 'monospace', marginBottom: 8 }}>
        <div>
          A {idx.map((i) => (
            <button key={i} onClick={() => flip(a, setA, i)} style={{
              width: 30, height: 30, margin: 1, cursor: 'pointer',
              fontFamily: 'monospace',
              border: `1px solid ${a[i] ? ACC : '#888'}`,
              background: a[i] ? `${ACC}22` : 'transparent'
            }}>{a[i]}</button>
          ))} = {av}
        </div>
        <div>
          B {idx.map((i) => (
            <button key={i} onClick={() => flip(b, setB, i)} style={{
              width: 30, height: 30, margin: 1, cursor: 'pointer',
              fontFamily: 'monospace',
              border: `1px solid ${b[i] ? ACC : '#888'}`,
              background: b[i] ? `${ACC}22` : 'transparent'
            }}>{b[i]}</button>
          ))} = {bv}
        </div>
      </div>

      <div style={{ margin: '14px 0' }}>
        <label style={{ fontSize: 14 }}>
          clock period: <b style={{ fontFamily: 'monospace' }}>{period}</b> gate
          delays = {period * GATE_PS} ps ={' '}
          <b style={{ fontFamily: 'monospace' }}>{nowGHz.toFixed(2)} GHz</b>
        </label>
        <input type="range" min="2" max={TMAX} value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          style={{ width: '100%' }} />
      </div>

      {/* per-bit settling tracks */}
      <div style={{ position: 'relative' }}>
        {idx.map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}>
            <span style={{ width: 34, fontFamily: 'monospace', fontSize: 13 }}>S{i}</span>
            <div style={{
              position: 'relative', flex: 1, height: 20,
              background: '#8881', borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: pct(settle[i]), background: `${DNG}44`
              }} />
              <div style={{
                position: 'absolute', left: pct(settle[i]), top: 0, bottom: 0,
                right: 0, background: `${ACC}33`
              }} />
              <span style={{
                position: 'absolute', left: `calc(${pct(settle[i])} + 6px)`,
                fontSize: 11, lineHeight: '20px', color: ACC
              }}>settles at {settle[i]}</span>
            </div>
            <span style={{
              width: 30, textAlign: 'center', fontFamily: 'monospace',
              fontSize: 17, color: stable[i] ? ACC : DNG
            }}>{stable[i] ? sum[i] : '?'}</span>
          </div>
        ))}
        {/* the sample line */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `calc(34px + (100% - 64px) * ${period / TMAX})`,
          width: 2, background: correct ? ACC : DNG
        }} />
      </div>

      <p style={{ fontFamily: 'monospace', fontSize: 15, marginTop: 12 }}>
        latched value:{' '}
        <b style={{ color: correct ? ACC : DNG }}>
          {idx.map((i) => (stable[i] ? sum[i] : '?')).join('')}
        </b>
        {correct
          ? ` = ${trueSum}`
          : `  (the true answer is ${trueSum})`}
      </p>

      <div style={{
        padding: '10px 14px', borderRadius: 10, marginTop: 4,
        border: `2px solid ${correct ? ACC : DNG}`,
        background: correct ? `${ACC}18` : `${DNG}18`
      }}>
        {correct ? (
          <span style={{ color: ACC }}>
            <b>Stable.</b> Every bit settled with{' '}
            {period - worst} gate {period - worst === 1 ? 'delay' : 'delays'} of slack.
          </span>
        ) : (
          <span style={{ color: DNG }}>
            <b>Timing failure.</b> {badBits} of {N} bits were still moving when
            the edge arrived. The register stored a value that is not the sum,
            not the old value, and not any row of any truth table — and nothing
            downstream can tell.
          </span>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>
        These numbers need {worst} gate delays, so this addition alone caps the
        clock at <b>{maxGHz.toFixed(2)} GHz</b> (at {GATE_PS} ps per gate). Try{' '}
        <code>1 + 1</code> and then <code>127 + 1</code>: the circuit is
        identical, the data is not — which is exactly why the clock has to be
        set for the worst case and never for the case you happen to be running.
      </p>
    </div>
  );
}
```

</Sandpack>

That last sentence is the lesson's whole moral, and it is worth stating plainly. `1 + 1` finishes in 4 gate delays; `127 + 1` needs 16. The hardware cannot ask the clock for extra time on hard data, and it cannot return early on easy data. It gets one interval, chosen once, at design time, for the worst input anyone might ever supply. Every fast case in your processor is quietly waiting for a slow case that may never occur.

That observation is also a door. If most work finishes early, and the clock is set by a rare worst case, then the obvious move is to *chop the long path into shorter pieces* so the whistle can blow faster — and let several instructions be in flight at once, each in a different stage. That is **pipelining**, and it is the single most important idea in processor design. It has its own lesson, two stops away.

<Recap>

- Combinational logic is correct only *eventually*. Different output bits settle at different times, and in between they produce **glitches** — values that match no row of any truth table. A truth table describes the destination, never the journey.
- A **clock** is one wire carrying an endlessly repeating square wave. Its **period** `T` and **frequency** are reciprocals: 1 GHz = 1000 ps per tick, 3 GHz ≈ 333 ps, 4 GHz = 250 ps. Almost all logic acts on the **rising edge**, because a moment is unambiguous where a stretch of time is not.
- Feedback creates memory: cross-couple two NOR gates and you get an **SR latch** that holds its own state. Gate it, then make it edge-triggered, and you have a **D flip-flop** — *on each rising edge, capture the input and hold it until the next edge*. This is where circuits stop being functions and start being **state machines**.
- Every digital system has one shape: **register → combinational logic → register**, with the clock feeding both registers. State lives in the registers; work happens between them.
- The speed limit is arithmetic: **T_clock ≥ T_cq + T_logic + T_setup + T_skew**. With 30 + 250 + 20 + 25 = 325 ps, the ceiling is about **3.08 GHz** — and the `T_logic` that counts is the **critical path**, the single slowest route on the entire chip.
- **Clock skew** is the clock arriving at different flip-flops at different times; it is subtracted straight from the logic budget, and it is fought with symmetric **H-tree** distribution. The clock network is also one of the biggest power consumers on a die, which is why **clock gating** exists.
- Physics has the last word on frequency: at 3 GHz a signal in silicon covers roughly 5 cm per tick against a die about 2 cm across, and at 10 GHz it barely crosses the chip at all.
- **Metastability** cannot be eliminated, only made improbable: a flip-flop sampled at exactly the wrong instant hovers between 0 and 1 for an unbounded time. Two flip-flops in series — a **synchronizer** — push the MTBF from fractions of a second to centuries, and are mandatory at every **clock domain crossing**.
- Clock speed is not performance: **work per second = work per cycle × cycles per second**, which is why a 3.8 GHz Pentium 4 could lose to a 2.4 GHz Athlon 64.

</Recap>

<Challenges>

#### Set the whistle {/*set-the-whistle*/}

A design has these timings: `T_cq` = 40 ps, the slowest combinational path is 310 ps, `T_setup` = 25 ps, and clock skew is 35 ps. (a) What is the fastest clock this design can run at? (b) The team wants 3.5 GHz. How many picoseconds must be cut, and from where could they plausibly come? (c) If they instead ship at 2 GHz, how much slack does each cycle have?

<Hint>

Add the four numbers to get the minimum period, then invert it for the frequency. For (b), work out the period 3.5 GHz demands and compare. Remember which of the four terms a designer can actually change.

</Hint>

<Solution>

**(a)** Sum the budget:

```
 40 + 310 + 25 + 35 = 410 ps

 max frequency = 1 / 410 ps = 1 / (410 × 10⁻¹²) ≈ 2.44 GHz
```

**(b)** 3.5 GHz demands a period of `1 / 3.5 GHz ≈ 286 ps`. The design needs 410 ps, so **124 ps must be removed**.

Where from? Not from `T_cq` or `T_setup` — those are properties of the flip-flop cells, fixed by the process library. That leaves two:

- **The logic path (310 ps).** This is the real target: restructure the critical path the way last lesson's carry-lookahead restructured the carry chain, or split it across two cycles (pipelining), which converts one 310 ps stage into two of roughly 155 ps.
- **The skew (35 ps).** A better-balanced clock tree might recover 10–20 ps, but it cannot supply 124 ps on its own.

Realistically only pipelining or a logic redesign gets there — which is the honest answer to most "can we just clock it faster?" requests.

**(c)** At 2 GHz the period is 500 ps, so the slack is `500 − 410 = 90 ps` per cycle. Worth noticing: that slack is not wasted, it is *margin* — the cushion that keeps the chip working when it is hot, when the supply voltage droops, and when a particular manufactured die happens to land on the slow side of process variation. Shipping with near-zero slack is how you get a product that works on the bench and fails in a warm room.

</Solution>

#### Where does the memory come from? {/*where-does-the-memory-come-from*/}

The SR latch is built from two NOR gates, and `NOR` outputs 1 only when both inputs are 0. Starting from the state `S=0, R=0, Q=1, notQ=0`, show that the circuit holds. Then pulse `R` to 1 and trace what happens, gate by gate, until it settles. Finally, explain in one sentence why `S=1, R=1` is forbidden.

<Solution>

**Holding.** The circuit is the pair `Q = NOR(R, notQ)` and `notQ = NOR(S, Q)`. With `S=0, R=0` and the state `Q=1, notQ=0`:

```
 Q     = NOR(R=0, notQ=0)  = 1   → Q stays 1     ✓
 not Q = NOR(S=0, Q=1)     = 0   → notQ stays 0  ✓
```

Each gate supplies exactly the input the other one needs to keep producing its current value. Nothing can change, so the state persists — and that persistence *is* the memory.

**Pulsing R to 1** (a reset, starting from `Q=1, notQ=0`):

```
 step 1:  Q     = NOR(R=1, notQ=0)  = 0    ← R forces Q low
 step 2:  not Q = NOR(S=0, Q=0)     = 1    ← the lower gate is released
 step 3:  Q     = NOR(R=1, notQ=1)  = 0    ← still 0, now held from both sides
 release R to 0:
 step 4:  Q     = NOR(R=0, notQ=1)  = 0    ← notQ alone keeps Q down ✓
```

Settled at `Q=0, notQ=1`, and it stays there after `R` returns to 0. Notice the handover in steps 3 and 4: while `R` was high it was doing the work, and by the time it let go, the feedback loop had taken over. The input is a nudge; the loop is the memory.

**Why `S=1, R=1` is forbidden:** both gates are forced low, so `Q` and `not Q` are *both* 0 — two outputs whose names promise they are opposites, and they are not, so any downstream logic reading them sees an impossible state. The deeper problem comes at release: if both inputs return to 0 at the same moment, both gates try to rise at once, each still seeing the other low, and which one wins is decided by nanoscopic differences in transistor strength and thermal noise. The latch lands in either state unpredictably — or balances between them, which is precisely the **metastability** from this lesson's DeepDive, arriving here from an entirely different direction.

</Solution>

#### The intermittent bug {/*the-intermittent-bug*/}

Transfer task. You are helping debug a board. A microcontroller reads a `DOOR_OPEN` signal from a mechanical switch on a sensor board; the two boards have separate oscillators. The firmware does:

```c
if (door_open_reg) { halt_motor(); }
```

The reported symptom: *"Roughly once every few days the motor halts for no reason, or fails to halt when the door opens. We cannot reproduce it. We've checked the wiring, replaced the switch, added a delay in the loop, and logged everything — the log shows the register reading a value that contradicts what the sensor board sent."*

Explain the root cause in terms of this lesson, say why every fix they tried was doomed, and write the recommendation — including what the fix does and does not guarantee.

<Solution>

**Root cause: an unsynchronized clock domain crossing.** The sensor board has its own oscillator, so `DOOR_OPEN` changes at moments that have no relationship whatsoever to the microcontroller's clock. Sooner or later — and "once every few days" is exactly the right order of magnitude — the signal transitions inside the capturing flip-flop's setup/hold window. That flip-flop goes **metastable**, hovers between 0 and 1 for an unbounded time, and whatever the downstream logic samples from it is arbitrary. Worse, different parts of the circuit reading that same hovering output can resolve it *differently*, which is how a log ends up "contradicting" reality.

**Why each attempted fix was doomed:**

- **Checking the wiring / replacing the switch.** The hardware is fine. This is not a fault; it is the correct behaviour of a flip-flop presented with an input that violates its timing requirements. Nothing is broken to find.
- **Adding a delay in the loop.** Delay changes *when* the sampling happens, not the fact that an asynchronous signal will eventually land in the forbidden window. It shifts the lottery; it does not stop playing it.
- **Trying to reproduce it.** The failure probability is exponentially small per sample and enormous over months, so it is effectively unreproducible on demand — which is the signature of the whole failure class. An intermittent bug that resists reproduction and involves two clock domains should make you suspect synchronization before anything else.

**Recommendation:** *"This is a classic clock-domain-crossing failure, not a wiring fault. `DOOR_OPEN` is asynchronous to our clock, so the input flip-flop will occasionally go metastable and hand the rest of the logic an undefined value. Fix: pass the signal through a two-flip-flop synchronizer in the same clock domain before anything reads it — the first stage absorbs the metastability and gets a full clock period to resolve, the second presents a clean value. Add debouncing after that, since a mechanical switch also bounces. Note for the safety review: this makes failure astronomically unlikely (MTBF in centuries rather than days), but it does not make it impossible — metastability cannot be eliminated, only pushed out. If halting the motor is safety-critical, the synchronizer belongs alongside an independent hardware interlock, not instead of one."*

The transferable habit is the one this module keeps teaching in different costumes: **name the contract at the boundary.** Lesson 5 asked which byte order the wire uses; Lesson 8 asked what a checksum actually proves; here the question is *which clock does this signal belong to* — and any signal that answers "a different one" needs a synchronizer before it is allowed to influence anything. ✓

</Solution>

</Challenges>

<LearnMore title="Anatomy of a CPU" path="/learn/faza-0/modul-0-3/cpu-anatomy">

That completes the machine's foundations: switches that make decisions, gates that do arithmetic, registers that remember, and a clock that says when. You now have every part a processor is built from — and no idea yet what a processor *is*. Next module opens one up: the registers that hold your variables, the arithmetic unit you already built, the control logic that decides which operation happens this tick, and the strange fact that the program itself is just more numbers sitting in the same memory as the data.

</LearnMore>
