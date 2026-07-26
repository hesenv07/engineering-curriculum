---
title: "Building an Adder from Gates"
---

<Intro>

In November 1937, a Bell Labs mathematician named George Stibitz took some spare telephone relays home, sat down at his kitchen table, and built a machine out of them. For a display he wired up two flashlight bulbs. For the switches that fed it numbers he cut strips of metal from a tobacco tin. The whole apparatus did exactly one thing: it added two binary digits and lit the bulbs to show the answer. His colleagues later called it the **Model K** — K for Kitchen. That same year, in the same company's orbit, Claude Shannon was submitting the thesis you met last lesson, proving that relays *could* do logic; Stibitz went ahead and did arithmetic with them on his kitchen table. Within three years Bell Labs had turned the idea into the Complex Number Computer, and on September 11, 1940, an audience at Dartmouth College watched a mathematician type problems into a teletype in New Hampshire and receive answers from a machine in New York — the first time anyone used a computer they were not standing next to. Last lesson you assembled a parts bin of gates. This lesson we spend it, and the thing we build is the single most important circuit in any computer: the one that adds.

</Intro>

<YouWillLearn>

- Why adding two bits produces **two** outputs, and why one of them is XOR and the other is plain AND
- The **half adder**, why "half" is an honest name, and the **full adder** that fixes it
- How chaining full adders builds an adder of any width — Lesson 2's odometer, now in silicon
- Where the **carry flag** and the **signed overflow flag** come from, why they are different, and how they finally explain `+127 + 1 = −128`
- How the same circuit performs subtraction with no subtractor anywhere — paying off Lesson 3's promise
- Why the carry is the slowest thing in your processor, and what Babbage and modern chip designers do about it

</YouWillLearn>

## What adding actually is {/*what-adding-actually-is*/}

Start smaller than seems useful: add **one bit to one bit**. There are only four possibilities, so as last lesson established, writing all four down is not a sample — it is the complete specification.

```
 0 + 0 = 0
 0 + 1 = 1
 1 + 0 = 1
 1 + 1 = 2   ← and here is the problem
```

Three of those answers fit in one bit. The fourth does not: two, in binary, is `10` — a two-digit answer. This is the exact moment from Lesson 2 that you have already lived through on the odometer: a column fills up, rolls over to zero, and something has to be handed to the column on its left. That something is the **carry**.

So a one-bit adder cannot have one output. It needs two: the digit that stays in this column, called the **sum**, and the digit that moves left, called the **carry**. Write the truth table with both columns showing:

| A | B | carry | sum | | as a number |
|---|---|-------|-----|---|---|
| 0 | 0 | 0 | 0 | | `00` = 0 |
| 0 | 1 | 0 | 1 | | `01` = 1 |
| 1 | 0 | 0 | 1 | | `01` = 1 |
| 1 | 1 | 1 | 0 | | `10` = 2 |

Now look hard at those two output columns, because you have seen both of them before — yesterday, in the gate bench.

The **sum** column reads 0, 1, 1, 0. That is **XOR**: one or the other, but not both. The **carry** column reads 0, 0, 0, 1. That is **AND**: only when both.

## The half adder {/*the-half-adder*/}

There is no further work to do. Binary addition of two bits *is* one XOR and one AND, wired to the same two inputs:

<Diagram name="building-an-adder/half_adder" height={340} width={720} alt="A gate schematic titled 'the half adder: two gates, and you can add'. On the left, two input wires labelled A and B in monospace. Each input has a junction dot and fans out to both of two gates: an XOR gate drawn as a shield shape with an extra leading arc, labelled XOR, sitting in the upper half, and an AND gate drawn as a flat-backed D-shape, labelled AND, sitting in the lower half. The XOR gate's output runs right as a blue arrow to the label 'sum'; the AND gate's output runs right as a red arrow to the label 'carry'. A small note near the carry output reads '1 + 1 = 10'. A caption at the bottom reads: the sum column is XOR, the carry column is AND.">

The entire circuit. Two gates, four transistors each in CMOS — so binary addition of two bits costs about eight transistors.

</Diagram>

This is called a **half adder**, and the name is a warning, not modesty. Look at what it cannot do. It has two inputs, so it can accept the two digits being added — but a real addition column has a *third* input: the carry arriving from the column to its right. Trace the odometer again with a two-digit example, `11 + 01`:

```
    1 1        the right column: 1 + 1 = 0, carry 1
  + 0 1        the left column:  1 + 0 + 1 ← three things to add
  ─────
  1 0 0
```

The left column has to add three bits, not two. A half adder physically has nowhere to put that third wire. So it can serve as the rightmost column of an addition and nowhere else — which is roughly half a useful component, honestly named.

## The full adder {/*the-full-adder*/}

The fix is a circuit with **three inputs** — A, B, and a carry coming in, universally written `Cin` — and the same two outputs. Three inputs means 2³ = 8 rows, and again, all eight rows *is* the specification:

| A | B | Cin | | Cout | Sum | | total |
|---|---|-----|---|------|-----|---|-------|
| 0 | 0 | 0 | | 0 | 0 | | 0 |
| 0 | 0 | 1 | | 0 | 1 | | 1 |
| 0 | 1 | 0 | | 0 | 1 | | 1 |
| 0 | 1 | 1 | | 1 | 0 | | 2 |
| 1 | 0 | 0 | | 0 | 1 | | 1 |
| 1 | 0 | 1 | | 1 | 0 | | 2 |
| 1 | 1 | 0 | | 1 | 0 | | 2 |
| 1 | 1 | 1 | | 1 | 1 | | 3 |

Read the right-hand column: the two output bits always spell the number of 1s among the three inputs, in binary. That is all a full adder is — a device that **counts how many of its three inputs are 1**, and reports the count in two bits.

You could build this from scratch, but there is a tidier route: a full adder is **two half adders and one OR gate**. Add A and B with the first half adder. Then add its sum to `Cin` with the second half adder — that gives the final sum bit. Each half adder may have produced a carry, and *at most one of them can have*, so an OR gate collects whichever one fired:

<Diagram name="building-an-adder/full_adder" height={380} width={720} alt="A gate schematic titled 'the full adder: three inputs in, two out'. On the far left, inputs A and B each fan out via junction dots into a first pair of gates labelled 'half adder 1': an XOR gate above and an AND gate below. The XOR gate's output, labelled 'A xor B' in blue, runs right to a junction dot and fans into a second pair of gates labelled 'half adder 2': another XOR above and another AND below. A third input labelled Cin enters low on the left, runs right along the bottom to a junction dot, and fans up into the second input of both gates of half adder 2. The second XOR's output runs right as a blue arrow to the label 'Sum'. The AND outputs of both half adders run in red into a two-input OR gate on the right, whose output runs as a red arrow to the label 'Cout'. A caption at the bottom reads: two half adders and one OR — and now carries can flow in as well as out.">

Five gates total. Every arithmetic unit in every processor you have ever used is built from copies of this.

</Diagram>

**Worked example — trace `A=1, B=1, Cin=1`** (the bottom row of the table, and the only row where everything is on):

```
 half adder 1:  A XOR B = 1 XOR 1 = 0        ← its sum
                A AND B = 1 AND 1 = 1        ← its carry

 half adder 2:  0 XOR Cin = 0 XOR 1 = 1      ← the final Sum
                0 AND Cin = 0 AND 1 = 0      ← its carry

 the OR gate:   1 OR 0 = 1                   ← the final Cout

 result: Cout = 1, Sum = 1  →  binary 11 = 3
 check:  1 + 1 + 1 = 3 ✓
```

**Worked example — trace `A=1, B=0, Cin=1`:**

```
 half adder 1:  1 XOR 0 = 1  ·  1 AND 0 = 0
 half adder 2:  1 XOR 1 = 0  ·  1 AND 1 = 1
 the OR gate:   0 OR 1 = 1

 result: Cout = 1, Sum = 0  →  binary 10 = 2
 check:  1 + 0 + 1 = 2 ✓
```

Notice the OR gate never sees both inputs high: half adder 1 only carries when A and B are both 1, and in that case its sum is 0, so half adder 2 cannot carry. The two carries are mutually exclusive, which is why a plain OR is enough to merge them.

## Eight in a row {/*eight-in-a-row*/}

Now build an 8-bit adder, and the construction is almost anticlimactic: take eight full adders, one per bit position, and **wire each one's Cout into its left neighbour's Cin.** Feed the rightmost adder a Cin of 0, because nothing carries into the ones column.

<Diagram name="building-an-adder/ripple_carry" height={340} width={720} alt="A schematic titled 'eight full adders in a row: the carry has to walk'. Eight rounded boxes sit in a row, each labelled FA with a bit index beneath, numbered 7 on the left down to 0 on the right; the seven boxes for bits 0 through 6 are tinted red and the box for bit 7 is grey. Above each box, small labels read A7 B7, A6 B6, and so on, with short wires dropping into the boxes. Below each box, a blue wire drops to a sum label S7, S6, down to S0. Red arrows run leftward between adjacent boxes, each carrying the carry from one stage into the next. On the right, a grey arrow labelled 0 feeds the carry input of bit 0; on the left, a red arrow labelled CF leaves bit 7. Captions read: bit 0 finishes first, bit 7 cannot start until the carry reaches it; and: correct for any width, and slower for every bit you add.">

This is called a **ripple-carry adder**, and the name is a literal description: the carry ripples right to left, exactly the way it does when you add on paper.

</Diagram>

This is the odometer from Lesson 2 rebuilt in gates — same mechanism, same right-to-left carry, same rollover. And it scales trivially: want 32 bits, use 32 full adders; want 64, use 64. Nothing about the design changes.

**Worked example — `00000111 + 00000011` (7 + 3), following the carry:**

```
 carry in:  0 0 0 0 1 1 1 0 →      (the carry as it arrives at each column)
        A:  0 0 0 0 0 1 1 1
        B:  0 0 0 0 0 0 1 1
      sum:  0 0 0 0 1 0 1 0

 bit 0: 1 + 1 + 0 = 10 → sum 0, carry 1
 bit 1: 1 + 1 + 1 = 11 → sum 1, carry 1
 bit 2: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 3: 0 + 0 + 1 = 01 → sum 1, carry 0
 bits 4-7: all zero, nothing more happens

 result: 00001010 = 8 + 2 = 10 ✓
```

The carry survived three columns before dying out. Hold on to that observation — it becomes the most important number in this lesson two sections from now.

## The two alarms {/*the-two-alarms*/}

Look at the leftmost full adder in that chain. Its `Cout` has nowhere to go: there is no bit 8. What happens to it?

It becomes a **flag** — a single bit the processor keeps beside the result to describe how the addition went. And here is where a debt from Lesson 3 finally comes due, because the top of an adder produces **two different alarms**, and confusing them is one of the most persistent bugs in systems programming.

<Diagram name="building-an-adder/overflow_flags" height={340} width={720} alt="A schematic titled 'two different alarms, one adder'. In the centre sits a grey rounded box labelled FA, bit 7, with inputs A7 B7 entering from above and a blue sum output S7 dropping below. A wire enters from the right labelled C6, annotated 'carry in', with a junction dot on it; a wire leaves to the left labelled C7, also with a junction dot. From the left junction, a red wire branches upward to a label CF, annotated 'unsigned alarm'. From both junctions, red wires run down into the two inputs of an XOR gate at the bottom, whose red output arrow leads to a label OF annotated 'signed alarm'. A caption at the bottom reads: CF is just the last carry, OF is C6 XOR C7 — they fire on different sums.">

Two flags, taken from the same adder within a hair's breadth of each other — and they do not agree.

</Diagram>

**The carry flag (CF)** is simply the carry out of the top bit. Under the *unsigned* contract, it means "the true answer needed a ninth bit, and you only have eight" — an unsigned overflow.

**The overflow flag (OF)** is the XOR of the carry *into* the top bit and the carry *out of* it. Under the *signed* two's-complement contract, it means "the sign came out wrong." The formula looks arbitrary until you remember Lesson 3's deepest idea: in two's complement, the top bit's weight is **−128**, not +128. So the top column is not doing the same arithmetic as the others, and the tell that it went wrong is precisely a *disagreement* between the carry going in and the carry coming out.

Now the payoff. Two additions, same adder, same eight bits — and the flags come out **opposite**.

**Case 1 — `127 + 1`, the crime scene from Lesson 3:**

```
 carry:  1 1 1 1 1 1 1 0 →
     A:  0 1 1 1 1 1 1 1     127
     B:  0 0 0 0 0 0 0 1       1
   sum:  1 0 0 0 0 0 0 0

 carry into bit 7 = 1     carry out of bit 7 = 0
 CF = 0        →  unsigned: 128 fits in 8 bits, nothing wrong ✓
 OF = 1 XOR 0 = 1  →  signed: BROKEN
 result read as signed: 10000000 = −128 ✗
```

There it is, at last, in copper. `+127 + 1 = −128` is not a bug in an instruction or a quirk of a language — it is a carry rippling seven columns and landing in a column whose weight is negative. And note that the unsigned reading of the very same bits is **128, perfectly correct**. One addition, one result, two contracts, one of them violated.

**Case 2 — `200 + 100`, the mirror image:**

```
 carry:  1 0 0 0 0 0 0 0 →
     A:  1 1 0 0 1 0 0 0     200 unsigned  (or −56 signed)
     B:  0 1 1 0 0 1 0 0     100
   sum:  0 0 1 0 1 1 0 0

 carry into bit 7 = 1     carry out of bit 7 = 1
 CF = 1        →  unsigned: 300 does not fit ✗ (result reads 44)
 OF = 1 XOR 1 = 0  →  signed: fine ✓  (−56 + 100 = 44, and 44 is what we got)
```

The two flags fire on different sums, which proves they are genuinely independent facts about the same eight bits. This is why every processor's status register carries **both** — x86 has `CF` and `OF`, ARM has `C` and `V` — and why assembly has separate branch instructions for each. The adder does not know which contract you are using. It computes both alarms and lets your code decide which one it cares about.

<Pitfall>

**The carry flag and the overflow flag are not the same flag.**

The mistake shows up in three costumes. In assembly, branching on carry (`jc`) when you meant signed overflow (`jo`) — or the reverse — produces code that is correct on most inputs and wrong near the boundaries, which is the worst possible failure profile. In C, mixing signed and unsigned types in one comparison makes the compiler silently convert one of them, so `if (i < len)` with a signed `i` and unsigned `len` can behave in ways neither the carry nor the overflow intuition predicts. And in high-level code, "I'll check for overflow after adding" fails for signed types for the reason Lesson 3 gave: signed overflow is undefined behaviour in C and C++, so the compiler may delete the check.

The correction is to say out loud which contract you are in *before* you test anything. Unsigned arithmetic overflows when the result is smaller than either input — that test is well-defined and reliable. Signed arithmetic must be checked *before* the operation (`b > 0 && a > INT_MAX − b`) or with a checked-arithmetic builtin that reads the hardware's OF for you. Same wires, two contracts, two tests — and the habit this module keeps drilling: name the contract first.

</Pitfall>

## Subtraction, for free {/*subtraction-for-free*/}

Lesson 3 made a claim and left it hanging: *your CPU does not contain a subtractor.* Every subtraction you have ever run was secretly an addition. Now you can see the actual wires.

The recipe from Lesson 3 was: to negate a number, flip every bit and add 1. So `A − B` is `A + (NOT B) + 1`. Look at what the adder already has lying around:

- **Flipping every bit of B** — an XOR gate flips its input when its other input is 1, and passes it through unchanged when that input is 0 (check the XOR column if you doubt it: `x XOR 0 = x`, `x XOR 1 = NOT x`). So put one XOR on each B input, and wire all of them to a single **mode** line.
- **Adding 1** — the rightmost full adder has an unused `Cin`, which we tied to 0. Tie it to the mode line instead.

<Diagram name="building-an-adder/add_subtract" height={360} width={720} alt="A schematic titled 'one circuit, both operations'. On the left, a red control line labelled 'mode' with the annotations '0 = add' and '1 = sub' runs right and then branches downward through a junction dot. Three input bits labelled B2, B1, B0 each enter their own XOR gate drawn in red; the mode line feeds the second input of all three XOR gates, annotated 'mode = 1 flips every B bit'. The three XOR outputs run right into a large blue rounded box labelled 'the same ripple adder'. A grey wire enters the bottom of the box annotated 'A bits enter here too'. The mode line also continues down and right into the bottom of the adder box, annotated 'carry-in = mode'. The adder's output runs right as a blue arrow to the label 'result'. A caption at the bottom reads: flip B and add one — two's complement negation, done in wire.">

Eight XOR gates and one wire. That is the entire cost of subtraction.

</Diagram>

Set mode to 0 and the XORs pass B through untouched while Cin stays 0: the circuit adds. Set mode to 1 and every B bit inverts while Cin becomes 1: the circuit computes `A + NOT B + 1`, which is `A − B`. The adder itself never changes and never knows.

**Worked example — `7 − 3` in 8 bits, mode = 1:**

```
        A:  0 0 0 0 0 1 1 1      7
        B:  0 0 0 0 0 0 1 1      3
 after XOR: 1 1 1 1 1 1 0 0      NOT B
       Cin: 1                    (the mode bit)

 add them:  00000111 + 11111100 + 1
 carry:     1 1 1 1 1 1 1 1 →
      sum:  0 0 0 0 0 1 0 0

 result: 00000100 = 4 ✓        and 7 − 3 = 4
```

The carry out is 1 here, which under the subtraction reading means "no borrow was needed" — the reason `CF` is often called the *borrow* flag in subtraction contexts, inverted. Try the other direction, `5 − 9`, and the sum comes out `11111100`: 252 unsigned, but **−4** read as signed, which is the right answer under the contract that can express it. The adder produced eight bits; Lesson 3 taught you which contract makes them mean −4.

One circuit, four jobs — signed add, unsigned add, signed subtract, unsigned subtract — and the circuit cannot tell them apart. That is the economy that made two's complement win, seen from the hardware side.

<DeepDive>

#### The carry is the slowest thing in the machine {/*the-carry-is-the-slowest-thing*/}

The ripple-carry adder is correct at every width. It is also, for wide numbers, unusably slow — and the reason is visible in its own diagram: **bit 7 cannot compute its answer until the carry has walked all the way from bit 0.**

Put numbers on it. Inside a full adder, the path from `Cin` to `Cout` passes through an AND and then an OR: **two gate delays per stage**. So a 64-bit ripple-carry adder has a worst-case path of

```
 64 stages × 2 gates = 128 gate delays

 at ~15 picoseconds per gate:  128 × 15 ps = 1.92 nanoseconds
```

Now compare that against a clock. A 1 GHz processor gives each step **1.0 ns**; a 3 GHz processor gives **0.33 ns**. A 64-bit ripple-carry adder cannot finish in either. Build a CPU this way and the adder alone caps your clock speed at around 500 MHz, forever, no matter how good your transistors are. The circuit is not wrong — it is *late*, which in hardware is the same thing as wrong.

Charles Babbage hit this wall in brass in the 1830s. Carry propagation was the hardest mechanical problem in his Analytical Engine: doing it digit by digit meant the machine's speed collapsed as he added digits. His answer was a mechanism he called the **anticipating carriage** — machinery that worked out where carries were *going* to land, in parallel, instead of passing them along one wheel at a time. He was solving this exact section's problem, one hundred and forty years before anyone had a transistor.

The modern version is called **carry-lookahead**, and the trick is to notice that each column can announce two facts about itself *without waiting for anyone*:

```
 generate:   Gi = Ai AND Bi        "I will produce a carry no matter what"
 propagate:  Pi = Ai XOR Bi        "I will pass along whatever carry reaches me"
```

Both are computable immediately from that column's own inputs, in one gate delay, for all 64 columns simultaneously. Then the carry into any column is a formula in the G's and P's below it — for example `C2 = G1 OR (P1 AND G0) OR (P1 AND P0 AND C0)` — an expression you can evaluate with a *tree* of gates rather than a chain. A tree of depth log₂(64) = **6** replaces a chain of 128, and a real 64-bit add lands comfortably inside one clock tick.

The price is area and power: lookahead logic needs far more gates than the ripple version, and every one of them burns energy when it switches. That is the trade you will see again in every phase of this course — **space for time**, paid in transistors. Your processor's adder is a small forest of these trees, and it exists because the alternative was a 500 MHz ceiling.

</DeepDive>

<DeepDive>

#### When the arithmetic circuit is simply wrong {/*when-the-arithmetic-circuit-is-wrong*/}

An adder is small enough to verify exhaustively — 8 rows for a full adder, and formal tools can prove a 64-bit adder correct for all 2¹²⁸ input pairs without testing them. Division is not so lucky, and in 1994 that difference cost Intel half a billion dollars.

The original Pentium divided using an algorithm that consults a **lookup table** of precomputed values. When the table was transferred into the chip's circuitry, a scripting error left **five entries missing** — five cells out of over a thousand, reading zero instead of their correct values. The chips shipped. In June 1994 a mathematician named Thomas Nicely, computing prime reciprocals at Lynchburg College, noticed his sums were off; after months of checking his own code he concluded the processor was wrong and went public that October. The most quoted demonstration was a single division:

```
 4195835 / 3145727

 correct:   1.333820449136241…
 Pentium:   1.333739068902037…
             └── wrong from the fourth significant digit
```

Intel first argued that almost no user would ever hit the flaw — statistically defensible, and a public-relations catastrophe. Within weeks the company offered replacements to anyone who asked and took a charge of about **$475 million** against earnings.

Two things are worth carrying away. First, the shape of the failure is one you have met twice: Lesson 3's `binarySearch` bug was "correct algorithm, broken implementation," and this is the same sentence written in silicon — the division algorithm was sound; five table entries were not. Second, the remedy differs completely. Software ships a patch on Tuesday; a wrong circuit means physically replacing every unit sold. That asymmetry is why hardware engineering leans so heavily on *proof* rather than testing, and why the humble full adder — eight rows, provable by inspection — is the kind of component you want at the bottom of a machine that cannot be patched.

</DeepDive>

## Build the adder yourself {/*build-the-adder-yourself*/}

Here is the full circuit, live. Toggle the bits of A and B, watch each column's carry appear, and read the result under both contracts at once. The carry chips between columns light up when a carry is actually travelling; the **ripple length** counter shows how many stages the carry had to walk, which is the delay the previous DeepDive was about. Flip to **subtract** and the B row shows what the XOR gates are really feeding the adder.

Three presets are worth visiting in order: `127 + 1` (watch OF fire while CF stays dark), `200 + 100` (watch exactly the opposite), and `255 + 1` (watch a carry ripple through all eight stages — the longest walk an 8-bit adder can take).

<Sandpack>

```js
import { useState } from 'react';

const N = 8;
const ACC = '#087ea4';
const DNG = '#c1554d';
const toBits = (v) => Array.from({ length: N }, (_, i) => (v >> i) & 1);
const toVal = (bits) => bits.reduce((s, b, i) => s + b * 2 ** i, 0);
const asSigned = (v) => (v >= 128 ? v - 256 : v);

export default function AdderLab() {
  const [a, setA] = useState(toBits(127));
  const [b, setB] = useState(toBits(1));
  const [sub, setSub] = useState(false);

  // the XOR row and the carry-in are both driven by the mode bit
  const bIn = b.map((x) => (sub ? 1 - x : x));

  const sum = [];
  const carry = [sub ? 1 : 0]; // carry[i] = the carry arriving at bit i
  for (let i = 0; i < N; i++) {
    sum.push(a[i] ^ bIn[i] ^ carry[i]);
    carry.push((a[i] & bIn[i]) | (carry[i] & (a[i] ^ bIn[i])));
  }

  const cf = carry[N];
  const of = carry[N] ^ carry[N - 1];
  const result = toVal(sum);
  const av = toVal(a);
  const bv = toVal(b);

  // how far did the carry actually have to walk?
  let ripple = 0;
  for (let i = 0; i < N; i++) if (carry[i + 1]) ripple = i + 1;

  const flip = (arr, set, i) =>
    set(arr.map((v, j) => (j === i ? 1 - v : v)));

  const preset = (x, y, s) => {
    setA(toBits(x));
    setB(toBits(y));
    setSub(s);
  };

  const cell = (content, color, dim) => (
    <div style={{
      width: 40, height: 40, margin: 2, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', fontSize: 19,
      border: `2px solid ${dim ? '#888' : color}`,
      background: dim ? 'transparent' : `${color}22`,
      color: dim ? 'inherit' : color
    }}>{content}</div>
  );

  const idx = Array.from({ length: N }, (_, k) => N - 1 - k); // bit 7 first

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => preset(127, 1, false)}>127 + 1</button>{' '}
        <button onClick={() => preset(200, 100, false)}>200 + 100</button>{' '}
        <button onClick={() => preset(255, 1, false)}>255 + 1</button>{' '}
        <button onClick={() => preset(7, 3, true)}>7 &minus; 3</button>{' '}
        <button onClick={() => setSub(!sub)} style={{
          fontWeight: 'bold', color: sub ? DNG : ACC
        }}>
          mode: {sub ? 'SUBTRACT' : 'ADD'}
        </button>
      </div>

      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ color: '#888', paddingRight: 8 }}>bit</td>
            {idx.map((i) => (
              <td key={i} style={{
                textAlign: 'center', color: '#888', fontFamily: 'monospace'
              }}>{i}</td>
            ))}
            <td />
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>A</td>
            {idx.map((i) => (
              <td key={i}>
                <div onClick={() => flip(a, setA, i)} style={{ cursor: 'pointer' }}>
                  {cell(a[i], ACC, !a[i])}
                </div>
              </td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {av} / {asSigned(av)}
            </td>
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>B</td>
            {idx.map((i) => (
              <td key={i}>
                <div onClick={() => flip(b, setB, i)} style={{ cursor: 'pointer' }}>
                  {cell(b[i], ACC, !b[i])}
                </div>
              </td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {bv} / {asSigned(bv)}
            </td>
          </tr>

          {sub && (
            <tr>
              <td style={{ paddingRight: 8, fontFamily: 'monospace', color: DNG }}>
                NOT B
              </td>
              {idx.map((i) => (
                <td key={i}>{cell(bIn[i], DNG, !bIn[i])}</td>
              ))}
              <td style={{ paddingLeft: 10, fontSize: 12, color: '#888' }}>
                after the XOR row
              </td>
            </tr>
          )}

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace', color: DNG }}>
              carry in
            </td>
            {idx.map((i) => (
              <td key={i}>{cell(carry[i], DNG, !carry[i])}</td>
            ))}
            <td style={{ paddingLeft: 10, fontSize: 12, color: '#888' }}>
              arrives from the right
            </td>
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>sum</td>
            {idx.map((i) => (
              <td key={i}>{cell(sum[i], ACC, !sum[i])}</td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {result} / {asSigned(result)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontFamily: 'monospace', fontSize: 15 }}>
        carry rippled through{' '}
        <b style={{ color: ripple > 4 ? DNG : ACC }}>{ripple}</b> of {N} stages
        {' '}&middot;{' '}
        <span style={{ color: '#888' }}>
          {ripple * 2} gate delays on the critical path
        </span>
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          border: `2px solid ${cf ? DNG : '#888'}`,
          background: cf ? `${DNG}22` : 'transparent'
        }}>
          <b style={{ fontFamily: 'monospace' }}>CF = {cf}</b>
          <div style={{ fontSize: 12, color: cf ? DNG : '#888' }}>
            {cf
              ? `unsigned is wrong: ${av} + ${bv} = ${av + bv}, not ${result}`
              : 'unsigned reading is correct'}
          </div>
        </div>
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          border: `2px solid ${of ? DNG : '#888'}`,
          background: of ? `${DNG}22` : 'transparent'
        }}>
          <b style={{ fontFamily: 'monospace' }}>OF = {of}</b>
          <div style={{ fontSize: 12, color: of ? DNG : '#888' }}>
            {of
              ? `signed is wrong: the sign flipped, result reads ${asSigned(result)}`
              : 'signed reading is correct'}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#888' }}>
        Click any A or B bit to flip it. Nothing here is a simulation of an
        adder &mdash; these are the full adder equations, one per column.
      </p>
    </div>
  );
}
```

</Sandpack>

The two lines worth staring at are the ones computing `sum` and `carry` in that loop. They are not a model of the circuit; they *are* the circuit — `a ^ b ^ cin` is the two XORs, and `(a & b) | (cin & (a ^ b))` is the two ANDs and the OR. Twelve characters of JavaScript and five gates of silicon are the same object described in two notations.

<Recap>

- Adding two bits needs **two** outputs, because `1 + 1 = 10` does not fit in one bit. The **sum** column is exactly **XOR**; the **carry** column is exactly **AND**. That pair is the **half adder** — two gates.
- It is called half because a real column has **three** inputs: A, B, and the carry arriving from the right. The **full adder** takes all three and reports how many of them are 1, in two bits — built from **two half adders plus one OR** (the two internal carries can never both fire).
- Chain N full adders, each one's `Cout` into the next one's `Cin`, and you have an N-bit **ripple-carry adder** — Lesson 2's odometer in gates, correct at any width.
- The top adder produces **two independent flags**. **CF** is the final carry (unsigned overflow). **OF** is `carry-into-MSB XOR carry-out-of-MSB` (signed overflow), because the top bit's weight is −128 rather than +128.
- Those flags disagree, which proves they are different facts: `127 + 1` gives **CF = 0, OF = 1** (unsigned 128 is fine, signed reads −128 — Lesson 3's mystery, solved in copper), while `200 + 100` gives **CF = 1, OF = 0** (unsigned 300 overflows, signed −56 + 100 = 44 is correct).
- **Subtraction is free**: put an XOR on every B input, tie them and the first `Cin` to one **mode** wire, and `mode = 1` computes `A + NOT B + 1` — two's complement negation done in wire. One circuit, four jobs, and it cannot tell them apart.
- The carry is the **critical path**: two gate delays per stage means a 64-bit ripple adder needs ~128 gate delays ≈ 1.92 ns, which does not fit in a 1 ns clock tick. **Carry-lookahead** computes `generate` and `propagate` per column and evaluates carries as a tree of depth log₂(64) = 6 — buying time with transistors, exactly the trade Babbage's **anticipating carriage** attempted in brass in the 1830s.
- Adders are small enough to *prove* correct; dividers are not. The 1994 **Pentium FDIV** bug — five missing lookup-table entries — made `4195835 / 3145727` wrong from the fourth digit and cost Intel about **$475 million**, because a wrong circuit cannot be patched on Tuesday.

</Recap>

<Challenges>

#### Trace the chain {/*trace-the-chain*/}

Add `00001111 + 00000001` (15 + 1) with an 8-bit ripple-carry adder. Show the carry arriving at every column, give the result, and state how many stages the carry had to walk. Then answer: using two gate delays per stage, how long does this particular addition take compared with `00000001 + 00000001`?

<Hint>

Work right to left, one column at a time, feeding each carry into the next. The carry stops travelling as soon as a column produces a 0 carry — count how many columns it passed through before that happens.

</Hint>

<Solution>

```
 carry in:  0 0 0 1 1 1 1 0 →
        A:  0 0 0 0 1 1 1 1     15
        B:  0 0 0 0 0 0 0 1      1
      sum:  0 0 0 1 0 0 0 0

 bit 0: 1 + 1 + 0 = 10 → sum 0, carry 1
 bit 1: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 2: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 3: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 4: 0 + 0 + 1 = 01 → sum 1, carry 0
 bits 5-7: 0 + 0 + 0 = 0

 result: 00010000 = 16 ✓
```

Four stages produced a carry (bits 0 through 3) before bit 4 absorbed it, so the critical path ran through about **4 × 2 = 8 gate delays**.

For `1 + 1 = 00000010`, only bit 0 produces a carry — **one stage, about 2 gate delays**, four times faster.

And this is the uncomfortable part of the ripple design: the *same circuit* takes different amounts of time depending on its data. Hardware cannot ship a component that is sometimes ready and sometimes not, so the clock has to be slow enough for the **worst** case (`11111111 + 00000001`, a carry through all eight stages) on every single addition, including `0 + 0`. Everything you build from here pays the worst case always — which is precisely why the next lesson is about the clock.

</Solution>

#### Predict both flags {/*predict-both-flags*/}

For each 8-bit addition below, compute the result bits, then CF and OF, then say which interpretation — unsigned, signed, both, or neither — got a wrong answer.

**(a)** `01100100 + 00110010` (100 + 50)  ·  **(b)** `11111111 + 00000001` (255 + 1)  ·  **(c)** `10000000 + 10000000`

<Solution>

**(a) 100 + 50**

```
 carry:  1 1 0 0 0 0 0 0 →      into bit 7 = 1, out of bit 7 = 0
   sum:  1 0 0 1 0 1 1 0   = 150 unsigned, −106 signed

 CF = 0   OF = 1 XOR 0 = 1
```

Unsigned is **correct** (150 fits). Signed is **wrong**: 100 + 50 = 150 exceeds +127, so it wrapped to −106. Only the signed reading broke — the same failure as Lesson 3's temperature sensor.

**(b) 255 + 1**

```
 carry:  1 1 1 1 1 1 1 0 →      into bit 7 = 1, out of bit 7 = 1
   sum:  0 0 0 0 0 0 0 0   = 0 unsigned, 0 signed

 CF = 1   OF = 1 XOR 1 = 0
```

Unsigned is **wrong** (256 became 0 — Lesson 2's rollover). Signed is **correct**: as signed values this was −1 + 1 = 0 ✓. Note the carry rippled all eight stages here: the slowest addition an 8-bit adder can perform.

**(c) 128 + 128**

```
 carry:  0 0 0 0 0 0 0 0 →      into bit 7 = 0, out of bit 7 = 1
   sum:  0 0 0 0 0 0 0 0   = 0

 CF = 1   OF = 0 XOR 1 = 1
```

**Both** are wrong. Unsigned: 256 does not fit. Signed: −128 + −128 = −256, nowhere near representable, and adding two negatives produced 0. This is the case that shows why OF needs its XOR formula rather than just watching the sign bit — and note how cheaply the hardware detects a disaster this complete: one XOR gate on two wires.

</Solution>

#### The width upgrade {/*the-width-upgrade*/}

Transfer task. You are reviewing a hardware design proposal. A junior engineer needs to widen a packet-byte counter from 32 bits to 64 bits, and writes: *"Simple change: our 32-bit adder is a clean ripple-carry design, so I'll instantiate 64 stages instead of 32. Same logic, same verification, just twice as many cells. The chip runs at 1 GHz and the current adder meets timing with room to spare."*

Assume two gate delays per ripple stage and about 15 ps per gate. Compute the worst-case delay before and after, decide whether the proposal ships, and write the review — including at least two concrete options and what each one costs.

<Solution>

**The arithmetic first.**

```
 clock period at 1 GHz:            1 / 10⁹ s = 1000 ps = 1.00 ns

 32-bit ripple:  32 × 2 × 15 ps =  960 ps  →  fits in 1000 ps, barely
 64-bit ripple:  64 × 2 × 15 ps = 1920 ps  →  nearly 2× the budget ✗
```

So the proposal **does not ship**, and notice the trap in the engineer's own sentence: "meets timing with room to spare" is false even today — 960 ps of a 1000 ps budget is a 4% margin, before wiring delay, clock skew, temperature, or manufacturing variation are accounted for. The existing design is already at the edge; doubling it is not "twice as many cells," it is **twice the delay on the critical path**, because ripple-carry delay grows linearly with width while the clock period does not grow at all.

**The options, with prices:**

1. **Carry-lookahead (or a hybrid like carry-select).** Compute `generate` and `propagate` per column and resolve carries as a tree: depth on the order of log₂(64) ≈ 6 levels instead of 64 stages, comfortably inside 1 ns. Cost: substantially more gates, so more area and more switching power — and a more complex block to verify, though adders are formally provable so this is tractable.
2. **Pipeline the addition across two clock cycles.** Add the low 32 bits in cycle one, latch the carry, add the high 32 bits in cycle two. Cost: results arrive a cycle later, and every consumer of the counter must tolerate that latency — a design-wide change, not a local one.
3. **Question the requirement.** A packet counter is not on any critical decision path; if it only needs to be *read* occasionally, it can be updated over two cycles or clocked in a slower domain. Cost: near zero, if the requirement really is that loose — which is worth five minutes of asking before spending gates.

**Review comment:** *"Blocking as written. Ripple-carry delay is linear in width, so 64 stages is ~1.92 ns against a 1.00 ns period — and the existing 32-bit version is already at ~960 ps, i.e. a 4% margin before wiring, skew and process variation, so I'd treat the current design as at-risk too. Please either move to a lookahead/carry-select structure (more area and power, fits in one cycle) or pipeline over two cycles (free in area, costs a cycle of latency for every reader). Before either, let's confirm how fast this counter actually needs to be visible — if it tolerates two-cycle updates, option 3 is the cheapest fix by far."*

The transferable habit: **when a proposal says "just more of the same," ask which quantity grows and how fast.** Twice the width was twice the *cells* and twice the *delay* — and only one of those two numbers had a hard ceiling sitting next to it. ✓

</Solution>

</Challenges>

<LearnMore title="Clock and Synchronization" path="/learn/faza-0/modul-0-2/clock-synchronization">

You have built a circuit that produces the right answer — eventually. The carry needs time to walk, the walk takes a different number of steps depending on the numbers, and until it finishes, the output bits are a meaningless flicker that belongs to no row of any truth table. So the machine needs one more thing before it can be trusted: something that says *now*. Next lesson: the clock, the heartbeat that makes billions of racing signals agree on when the answer counts — and why the fastest circuit in the world is useless if nobody knows when to look at it.

</LearnMore>
