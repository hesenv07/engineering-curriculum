---
title: "Anatomy of a CPU"
---

<Intro>

To program ENIAC in 1945, you walked up to it with a screwdriver. The machine filled a room, and "writing software" meant physically rewiring it — plugging patch cables between units, setting three thousand switches by hand, tracing the path a number would take through the hardware. A team of six mathematicians — Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Fran Bilas and Ruth Lichterman — did this work, and a single change of problem could take days. The machine could compute anything; it just had to be *rebuilt* each time you changed your mind. Then, in June 1945, a report circulated describing a different arrangement: don't wire the program into the machine — **write it into the memory, as numbers, right next to the data.** Three years later, on 21 June 1948, a small experimental machine in Manchester ran a 17-instruction program looking for the largest proper factor of 262,144, thought about it for 52 minutes, and printed 131,072. It was the first time a computer had ever executed a program stored in its own memory, and it is the reason you can change what your laptop does by moving a file instead of a cable. This lesson opens up the machine that idea produced, and names every part inside it.

</Intro>

<YouWillLearn>

- The **stored-program** idea, and the unsettling fact that a CPU cannot tell an instruction from a number
- The five parts every processor has: **registers**, the **ALU**, the **program counter**, the **instruction register**, and the **control unit**
- What a **register file** is, why it has two read ports and one write port, and why there are so few registers
- How the parts are wired into a **datapath**, and how **multiplexers** let one set of wires do many jobs
- What a **control signal** actually is — and how one instruction becomes a fistful of switch settings
- Why a register is ~1 cycle and main memory is ~200, and what that gap does to every program you write

</YouWillLearn>

## The idea that made a computer general {/*the-idea-that-made-a-computer-general*/}

ENIAC's problem was not speed. It was that the *program lived in the wiring*, so changing the program meant changing the machine. The fix, described in the June 1945 *First Draft of a Report on the EDVAC*, is so familiar today that its strangeness has worn off: put the instructions in the same memory as the data, encoded the same way — as numbers.

(The report went out under John von Neumann's name alone, which is why the arrangement is universally called the **von Neumann architecture**. J. Presper Eckert and John Mauchly, who had been developing these ideas with him, were not amused, and the credit dispute has never entirely settled. The name stuck anyway.)

Take a moment with what this actually means, because it is the single most important idea in this module and it sounds almost like a trick:

<Diagram name="cpu-anatomy/stored_program_memory" height={470} width={720} alt="A diagram titled 'one memory, and nothing in it is labelled'. On the left, a vertical column of six memory cells with addresses 00 to 05 running down their left side, each cell containing an eight-bit binary value: 00011011, 01000110, 11101100, 00000101, 10010110, 00000000. A red arrow labelled PC points at the first cell, annotated 'the CPU is looking here'. On the right, two panels branch from that same first cell. The upper blue panel is titled 'read as an instruction' and shows the byte split as 00 01 10 11 with the field names op, rd, rs1, rs2 beneath it, resolving to the text ADD R1, R2, R3. The lower red panel is titled 'read as a number' and shows 00011011 = 27, with the note 'just a byte, like any other'. Captions below read: the byte does not change, only which part of the CPU is looking at it; an instruction is not a special kind of data, it is data the PC happens to point at; and, in blue, bytes have no meaning — contracts do.">

The same eight bits, under two different readings. Neither reading is more "correct" than the other — the byte is not secretly an instruction.

</Diagram>

If that last caption sounds familiar, it should: it is Lesson 1 of this whole course, arriving at the deepest possible place. **Bytes have no meaning — contracts do.** We have applied that rule to integers, to negatives, to fractions, to text, to pixels. Now apply it to the program itself, and you get the stored-program computer: an instruction is simply a byte that the **program counter** happens to be pointing at when the machine goes looking for something to do.

Three consequences fall out immediately, and all three define modern computing:

- **Programs are data, so programs can be manipulated by programs.** A compiler is just software that reads bytes and writes other bytes; the fact that the output happens to be executable is a matter of where you put it. Loaders, linkers, JIT compilers, self-modifying code and viruses all live in the space this opens up.
- **Changing the program is free.** No screwdriver, no cables. Copy different numbers into memory and the same hardware becomes a different machine.
- **The machine has no idea what it is doing.** It cannot distinguish your carefully compiled function from a JPEG. If the program counter ends up pointing at image data, the CPU will cheerfully decode pixels as instructions and execute them. We will come back to this, because it is both a superpower and an entire category of security disaster.

## Opening the box {/*opening-the-box*/}

So: we need a machine that fetches numbers from memory, interprets them as commands, and does what they say. What has to be inside it?

<Diagram name="cpu-anatomy/cpu_block_diagram" height={460} width={720} alt="A block diagram titled 'everything inside the box'. A large rounded rectangle labelled CPU contains five components. Top left, a red-tinted box labelled 'control unit' with the note 'reads the instruction, sets every switch'. Top right, two small grey boxes labelled PC and IR, annotated 'where we are' and 'what we are doing'. Bottom left, a blue-tinted box labelled 'register file' containing R0 R1 R2 R3 and the note 'flip-flops from the last lesson'. Bottom centre, a blue notched arrow shape labelled ALU with the note 'you built this two lessons ago'. Below it a small grey box reads 'flags Z N C V'. Dashed red arrows run from the control unit down to the register file and the ALU, labelled 'control lines'. Blue arrows run from the register file into the ALU, and a blue arrow loops from the ALU output back into the register file, labelled 'result written back'. Outside the CPU on the right sits a tall grey box labelled 'memory' containing rows of dots, annotated 'instructions and data, side by side'. Two arrows connect CPU and memory: one rightward labelled 'address', one leftward labelled 'data'. Captions read: five parts, a bundle of control wires, and two buses to the outside world; that is a processor — all of it.">

Every processor ever built — the 1971 Intel 4004, the chip in your phone, the one in a washing machine — is a variation on this picture.

</Diagram>

Five parts, and you have already built two of them:

| Part | What it is | Where it came from |
|---|---|---|
| **Register file** | a handful of very fast storage slots | flip-flops, last lesson |
| **ALU** | the unit that adds, subtracts, and does logic | you built the adder two lessons ago |
| **Program counter (PC)** | a register holding the address of the next instruction | just a register |
| **Instruction register (IR)** | a register holding the instruction being worked on right now | just a register |
| **Control unit** | reads the IR and sets every switch in the machine accordingly | the genuinely new part |

Plus the wires. The bundles carrying data between parts are called **buses** — an address bus going out to memory ("give me what's at location 4,096") and a data bus carrying values back and forth. And running everywhere, mostly invisible in diagrams, is the clock from last lesson, telling every register when to capture.

Let us take the parts one at a time.

## The register file {/*the-register-file*/}

A **register** is a row of flip-flops that holds one value — 8 bits on a small microcontroller, 64 bits on your laptop. The **register file** is the collection of them, and it is the CPU's own private scratchpad: the only storage it can touch at full speed.

<Diagram name="cpu-anatomy/register_file" height={380} width={720} alt="A diagram titled 'the register file: a very small, very fast filing cabinet'. A large blue-tinted rounded box contains four labelled rows R0, R1, R2 and R3, each showing eight binary digits. On the left, two blue arrows labelled 'read port 1' and 'read port 2' leave the box heading left, each paired with a grey arrow pointing into the box labelled 'which register?'. Lower down, a red arrow labelled 'write port' points into the box, and a dashed red arrow labelled 'write enable' enters from the right. On the right, a blue arrow leaves the box towards labels reading 'two values out' and 'at the same time'. Captions below read: two reads and one write, every single cycle — which is exactly what R1 = R2 + R3 needs; and: each register is just 8, 32 or 64 flip-flops standing in a row.">

Two values out, one value in, all in the same cycle. The small grey arrows are the register *numbers* — the file has to be told which slots to open.

</Diagram>

Notice the port count, because it is not arbitrary. Look at the shape of an ordinary instruction:

```
 R1 = R2 + R3
      └┬┘  └┬┘     two values must come out
   └┬┘              one value must go in
```

Two reads and one write, simultaneously, every cycle. So the hardware provides exactly that: **two read ports and one write port**, each with its own small address input asking *which* register. With four registers those addresses are 2 bits; with 32 registers, 5 bits.

Which raises the obvious question: if registers are the fastest storage in the machine, why are there so few? A typical CPU has 16 or 32 of them — you could fit millions of flip-flops in the same silicon. Three reasons, and they are worth understanding because they explain a lot about why CPUs look the way they do:

- **Ports are expensive.** Every extra read port means another complete set of wires and multiplexers reaching every register. Cost grows much faster than the register count.
- **Bigger is slower.** A larger file needs deeper address decoding and longer internal wires, and — from last lesson — the slowest path sets the clock for the entire chip. A register file that took two cycles instead of one would slow down everything.
- **The register number lives inside the instruction.** This is the binding constraint. If an instruction is 32 bits and it must name three registers, then 32 registers cost 5 bits each — fifteen bits of every instruction spent on *nothing but which registers to use*. Doubling to 64 registers costs another three bits, which have to come out of somewhere else. The register count is a permanent decision baked into the instruction encoding, and changing it means designing a new architecture.

<Note>

This is the first appearance of a theme that dominates the rest of Phase 0: **the instruction encoding is a budget**, and everything a processor can express has to fit inside it. How many registers, how large a constant, how far a jump can reach — all of these are decided by how many bits the designers were willing to spend. That budget has a name, the **Instruction Set Architecture**, and it gets its own lesson two stops from here.

</Note>

## The ALU, revisited {/*the-alu-revisited*/}

You built this in Module 0.2. The **arithmetic logic unit** takes two values, performs one operation on them, and produces a result plus a set of flags. Two lessons ago it could add and subtract; a real ALU adds a handful of logic operations, which cost almost nothing because you already have the gates:

| Operation | How it is built |
|---|---|
| ADD, SUB | the ripple-carry (or lookahead) adder, with the mode wire for subtraction |
| AND, OR, XOR, NOT | one gate per bit, in parallel — 8 gates for an 8-bit AND |
| shifts | wires, literally: shifting left by one is connecting bit *i* to output *i+1* |

That last row is worth a second look. A shift needs **no gates at all** in the simple case — it is a rearrangement of which wire goes where, which is why shifting is traditionally the cheapest operation a CPU has, and why compilers turn `x * 8` into `x << 3` when they can.

The ALU also produces the **flags** you met in the adder lesson: `Z` (the result was zero), `N` (negative — just a copy of the top bit), `C` (carry out, unsigned overflow) and `V` or `O` (signed overflow, the XOR of the last two carries). The flags live in their own small register, and they are how a comparison becomes a decision: a CPU compares two numbers by *subtracting* them and throwing the result away, keeping only the flags.

## The datapath {/*the-datapath*/}

Now wire the parts together. The result is called the **datapath**, and it is where a subtlety appears that the block diagram hid: the wires are fixed, but the machine has to do different things on different cycles. Sometimes the ALU's second input should come from a register; sometimes from a constant embedded in the instruction. How does one set of wires serve both?

With a **multiplexer** — a switch made of gates that takes several inputs, one *select* signal, and passes exactly one input through to its output. A mux is to hardware what an `if` is to software, and it is everywhere:

<Diagram name="cpu-anatomy/datapath_mux" height={400} width={720} alt="A diagram titled 'the datapath: roads, and switches that choose the road'. On the left, a blue-tinted box labelled 'register file' containing R0 R1 R2 R3. Two blue arrows leave it: one labelled R1 going directly to the upper input of a notched ALU shape on the right, and one labelled R2 going into the upper input of a small red trapezoid labelled 'mux'. A second input to the mux comes from below, labelled 'constant'. A dashed red arrow points up into the bottom of the mux labelled 'which one?'. The mux output feeds the lower ALU input. A dashed red arrow points up into the ALU labelled 'which operation?'. The ALU output runs right, then loops down and all the way back left into the register file, labelled 'result' and 'written back into a register'. Captions read: the wires never move — the multiplexers decide which value is allowed down which road; and, in red: every dashed red line is a decision the control unit makes.">

The blue lines carry values; the dashed red lines carry decisions. Only the red ones change from one instruction to the next.

</Diagram>

Follow one instruction through it. For `R1 = R2 + R3`: the register file is told to read R2 and R3 onto its two output ports; the mux is told to select the register value rather than the constant; the ALU is told to add; the register file is told to write its input into R1 when the clock ticks. Four decisions, made by four sets of wires that carry no data at all.

Those wires are the point of this section. In hardware, **data flows along fixed roads, and control decides which roads are open.** The datapath is the road network; it never changes. What changes, every single cycle, is the pattern of switch settings laid over it.

## The control unit {/*the-control-unit*/}

Which brings us to the part that has no software equivalent, and is therefore the hardest to picture. The **control unit** reads the instruction sitting in the IR and produces the switch settings — a bundle of wires collectively called the **control word**.

<Diagram name="cpu-anatomy/control_word" height={400} width={720} alt="A diagram titled 'one instruction in, a fistful of switch settings out'. At the top, a row of four boxes labelled IR on the left, containing the bit pairs 00, 01, 10 and 11, with the field names op, rd, rs1 and rs2 beneath them; below the row is the text ADD R1, R2, R3. An arrow leads down into a red-tinted box labelled 'control unit'. From that box, six dashed lines fan out to six labelled signal boxes arranged in two rows: RegRead1 = 10, RegRead2 = 11, ALUop = ADD, UseConstant = 0, RegWrite = 1, and WriteAddr = 01. Five of the boxes are highlighted in red as active; the UseConstant box is greyed out as inactive. A caption reads: these wires are not data — they are the levers that steer the data.">

One byte enters the control unit; six switch settings leave it. This is the whole job of decoding.

</Diagram>

Read the six signals in that diagram and notice something: none of them contain a *value*. `RegWrite = 1` does not mean the number one is being stored anywhere; it means "the write port is armed, so at the next clock edge the register file should capture whatever is on its input." Control signals are verbs, not nouns.

And here is the pleasing part. What is the control unit *made of*? It takes the instruction bits as input and produces control bits as output, and the mapping is fixed — the same opcode always produces the same switch settings. That is a truth table. Which means the control unit is **combinational logic**: a pile of AND and OR gates, exactly like the ones in the first lesson of Module 0.2.

```
 opcode 00 (ADD)  →  ALUop=00, RegWrite=1, UseConstant=0
 opcode 01 (SUB)  →  ALUop=01, RegWrite=1, UseConstant=0
 opcode 10 (AND)  →  ALUop=10, RegWrite=1, UseConstant=0
 opcode 11 (OR)   →  ALUop=11, RegWrite=1, UseConstant=0

 four rows, and a designer can read the gates straight off the table ✓
```

For a machine this small the control unit really is a handful of gates. Real processors have hundreds of instructions and control words that are dozens of bits wide, and there are two ways to build them: **hardwired control** (a large block of combinational logic, fast, hard to change) or **microcoded control** (a small lookup memory inside the CPU holding the control word for each instruction, slower but far easier to fix and extend). The x86 processors on most desktops use microcode for their more complex instructions, which is why a CPU can receive a "microcode update" from your operating system — a genuine patch to the machine's own decoding tables, shipped as a file.

## Why registers exist at all {/*why-registers-exist-at-all*/}

One question has been hanging since the block diagram: if memory is right there, why does the CPU keep its own tiny stash of values? Because "right there" is a lie. Memory is *enormously* far away in the only unit that matters to a processor: clock cycles.

<Diagram name="cpu-anatomy/memory_speed_ladder" height={420} width={720} alt="A horizontal bar chart titled 'why registers exist', subtitled 'one CPU cycle at 3 GHz is 0.33 ns — now scale it so that a register takes one second'. Seven rows, each with a label on the left, a coloured bar whose length grows down the list, a cycle count in the middle and a human-scale time on the right. The rows read: register, 1 cycle, 1 second; L1 cache, 4 cycles, 4 seconds; L2 cache, 12 cycles, 12 seconds; L3 cache, 40 cycles, 40 seconds; main memory, about 200 cycles, 3 minutes; SSD, about 300,000 cycles, 3.5 days; hard disk seek, about 30,000,000 cycles, almost a year. The first four bars are blue and short, the last three are red and long. A caption reads: a register is not a small optimisation — it is a different world from memory.">

Each row gives the same wait twice: in CPU cycles, and then in a unit a human can actually feel.

</Diagram>

Scale it to human time and the picture becomes visceral. If reaching into a register took **one second**, then reaching into main memory would take **three minutes**, and waiting on a spinning hard disk would take **most of a year**. A processor that had to go to memory for every operand would spend essentially all of its life waiting.

So the deal every CPU makes is: **load a few values into registers, do as much work as possible there, and write the results back.** That is why machine code is full of loads and stores, why compilers work so hard at "register allocation," and why the same algorithm can run ten times faster or slower depending on whether its working set fits in fast storage.

Those middle rows — L1, L2, L3 — are the **cache**, the hardware's automatic attempt to hide the gap. They have their own lesson later in this module. For now, keep the ladder: it is the single most useful mental model for reasoning about program performance, and it explains more real-world slowness than any other fact in this course.

<Pitfall>

**"Programs are data" cuts in both directions.**

The mistake is treating the stored-program property purely as a convenience. It is also the reason a whole category of security vulnerability exists, and the mechanism is exactly the one from the first diagram: the CPU executes whatever the program counter points at, and it has no way to ask whether those bytes were meant to be code.

Feed a program more data than its buffer holds, and the excess can overwrite the stored return address sitting nearby. When the function returns, the program counter is loaded with an attacker-chosen value — often pointing straight back into the data the attacker just supplied. The CPU dutifully decodes that data as instructions and executes it. Nothing malfunctioned; every part did its job perfectly. That is the classic **buffer overflow**, and it worked because instructions and data live in one memory with no label distinguishing them.

The correction had to come from *outside* the pure von Neumann model. Modern systems mark memory pages as either writable or executable but never both — a policy called **W^X**, enforced by a hardware **NX ("no execute") bit** in the page tables. It is, in effect, a label bolted onto memory after fifty years, re-introducing the very distinction that von Neumann's design deliberately erased. Note what this means philosophically: the security fix is a *contract* imposed on bytes that have no inherent meaning — the same move this course has made in every single lesson.

</Pitfall>

<DeepDive>

#### The bottleneck named after its inventor {/*the-bottleneck-named-after-its-inventor*/}

Putting instructions and data in one memory bought generality at a price, and the price has a name. In his 1977 Turing Award lecture, *Can Programming Be Liberated from the von Neumann Style?*, John Backus — the man who had led the team that created FORTRAN — argued that the single connection between processor and memory had become the defining limitation of computing. He called it the **von Neumann bottleneck**: every instruction and every operand must squeeze, one at a time, through the same channel, and the CPU spends much of its life not computing but waiting for that channel.

There is an alternative, and it is older than the argument. The **Harvard architecture** — named after the Harvard Mark I, which read its instructions from punched tape while holding data in relays — keeps instructions and data in physically separate memories with separate buses. Fetching an instruction and reading a data value then happen simultaneously instead of taking turns.

Neither design won outright; the compromise is what shipped. Look inside a modern processor and you will find **separate L1 caches for instructions and data** — an L1I and an L1D, each with its own path into the core — sitting in front of a single unified main memory. Instructions and data are Harvard-separated close to the CPU where speed matters, and von Neumann-unified further out where flexibility matters. The industry calls this a **modified Harvard architecture**, and it is a good example of how these arguments usually end: not with one side winning, but with the boundary being moved to where each side is strongest.

</DeepDive>

<DeepDive>

#### The whole CPU, on one piece of silicon {/*the-whole-cpu-on-one-piece-of-silicon*/}

For twenty-five years after the Manchester Baby, a "CPU" meant a cabinet, or at best a board covered in chips. Then, in November 1971, Intel shipped the **4004**.

It had **2,300 transistors**. It was 4 bits wide, ran at 740 kHz, and it existed almost by accident: a Japanese calculator company, Busicom, had commissioned Intel to build a set of a dozen custom chips for a desktop calculator. Ted Hoff proposed replacing the whole set with one general-purpose programmable processor plus memory; Stanley Mazor helped define it, Federico Faggin designed the silicon, and Masatoshi Shima represented Busicom. The chip belonged to Busicom under the contract — and Intel, sensing what it had, negotiated to buy the rights back for **$60,000**.

Put the 4004 next to a modern processor and the ratios stop being comprehensible. Sixteen billion transistors against 2,300 is a factor of about **seven million**. And yet the block diagram at the top of this lesson describes both of them. The 4004 had registers, an ALU, a program counter, an instruction register and a control unit. Everything since — caches, pipelines, multiple cores, branch predictors, vector units — is an elaboration built *around* those five parts, not a replacement for them. This is why learning the anatomy once is worth so much: the parts list has not changed in seventy-five years.

</DeepDive>

## Build a CPU and watch it think {/*build-a-cpu-and-watch-it-think*/}

Everything above, running. Below is a complete processor: four 8-bit registers, an ALU, a program counter, an instruction register, a control unit, and six bytes of program memory. The instruction format is one byte, split into four 2-bit fields:

```
  7 6   5 4   3 2   1 0
 ┌─────┬─────┬─────┬─────┐
 │ op  │ rd  │ rs1 │ rs2 │      op:  00 ADD   01 SUB
 └─────┴─────┴─────┴─────┘           10 AND   11 OR
```

Press **step** and watch every part move at once: the PC picks an address, the byte at that address lands in the IR, the control unit lights up the signals that byte implies, two registers appear at the ALU's inputs, and the result is written back. Two things are worth hunting for. First, look at the program bytes: they are `6, 87, 161, 242, 0, 64` — the instruction at address 4 is literally the number **zero**. Second, watch the flags: two of these instructions produce a zero result and raise `Z`, which is how every `if` statement you have ever written eventually gets decided.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const OPS = ['ADD', 'SUB', 'AND', 'OR'];
const PROGRAM = [6, 87, 161, 242, 0, 64];
const INITIAL = [0, 5, 3, 1];

const bin = (v, n = 8) => v.toString(2).padStart(n, '0');
const decode = (byte) => ({
  op: (byte >> 6) & 3,
  rd: (byte >> 4) & 3,
  rs1: (byte >> 2) & 3,
  rs2: byte & 3,
});

function execute(op, a, b) {
  let raw;
  if (op === 0) raw = a + b;
  else if (op === 1) raw = a - b;
  else if (op === 2) raw = a & b;
  else raw = a | b;
  const value = raw & 255;
  const carry = (op === 0 && raw > 255) || (op === 1 && raw < 0) ? 1 : 0;
  return { value, carry, zero: value === 0 ? 1 : 0, neg: (value >> 7) & 1 };
}

export default function TinyCPU() {
  const [pc, setPc] = useState(0);
  const [regs, setRegs] = useState(INITIAL);
  const [flags, setFlags] = useState({ zero: 0, neg: 0, carry: 0 });
  const [last, setLast] = useState(null);

  const halted = pc >= PROGRAM.length;
  const byte = halted ? 0 : PROGRAM[pc];
  const f = decode(byte);
  const aVal = regs[f.rs1];
  const bVal = regs[f.rs2];
  const preview = execute(f.op, aVal, bVal);

  const step = () => {
    if (halted) return;
    const next = regs.slice();
    next[f.rd] = preview.value;
    setRegs(next);
    setFlags({ zero: preview.zero, neg: preview.neg, carry: preview.carry });
    setLast({ pc, text: `${OPS[f.op]} R${f.rd}, R${f.rs1}, R${f.rs2}`, value: preview.value });
    setPc(pc + 1);
  };
  const reset = () => {
    setPc(0); setRegs(INITIAL);
    setFlags({ zero: 0, neg: 0, carry: 0 }); setLast(null);
  };

  const card = (title, children, col = '#888') => (
    <div style={{
      border: `2px solid ${col}`, borderRadius: 10, padding: '8px 12px',
      margin: 4, minWidth: 150
    }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );

  const signals = halted ? [] : [
    ['RegRead1', `R${f.rs1}`, 1],
    ['RegRead2', `R${f.rs2}`, 1],
    ['ALUop', OPS[f.op], 1],
    ['UseConstant', '0', 0],
    ['RegWrite', '1', 1],
    ['WriteAddr', `R${f.rd}`, 1],
  ];

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={step} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          step
        </button>
        <button onClick={reset} style={{ fontSize: 15, padding: '4px 14px' }}>reset</button>
        {halted && <span style={{ marginLeft: 12, color: ACC }}>
          <b>program finished</b> — nothing left at the PC
        </span>}
      </div>

      {/* memory */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 6 }}>
        <span style={{ width: 74, color: '#888', fontSize: 12 }}>memory</span>
        {PROGRAM.map((b, i) => {
          const here = i === pc;
          const d = decode(b);
          return (
            <div key={i} style={{ textAlign: 'center', margin: 2 }}>
              <div style={{ fontSize: 10, color: '#888' }}>{i}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 14, padding: '6px 8px',
                border: `2px solid ${here ? DNG : '#888'}`, borderRadius: 7,
                background: here ? `${DNG}22` : 'transparent'
              }}>{bin(b)}</div>
              <div style={{ fontSize: 10, color: here ? DNG : '#888' }}>
                {here ? `PC → ${b}` : b}
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>
                {OPS[d.op]} R{d.rd},R{d.rs1},R{d.rs2}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {card('program counter', (
          <div style={{ fontFamily: 'monospace', fontSize: 20 }}>PC = {pc}</div>
        ), DNG)}

        {card('instruction register', (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 20 }}>{bin(byte)}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              = the number {byte}
            </div>
          </div>
        ), DNG)}

        {card('decoded fields', (
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            <span style={{ color: ACC }}>{bin(f.op, 2)}</span>{' '}
            {bin(f.rd, 2)} {bin(f.rs1, 2)} {bin(f.rs2, 2)}
            <div style={{ fontSize: 12, color: '#888' }}>op rd rs1 rs2</div>
            <div style={{ fontSize: 14, marginTop: 2 }}>
              {OPS[f.op]} R{f.rd}, R{f.rs1}, R{f.rs2}
            </div>
          </div>
        ), ACC)}
      </div>

      {/* control word */}
      <div style={{ margin: '8px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ width: 68, color: '#888', fontSize: 12, alignSelf: 'center' }}>
          control word
        </span>
        {signals.map(([name, val, on]) => (
          <span key={name} style={{
            fontFamily: 'monospace', fontSize: 12, padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${on ? DNG : '#888'}`,
            background: on ? `${DNG}1e` : 'transparent',
            color: on ? DNG : '#888'
          }}>{name}={val}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {card('register file', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            {regs.map((v, i) => (
              <div key={i} style={{
                color: !halted && i === f.rd ? DNG : 'inherit'
              }}>
                R{i} = {bin(v)} = {String(v).padStart(3, ' ')}
                {!halted && i === f.rs1 && <span style={{ color: ACC }}> ← ALU A</span>}
                {!halted && i === f.rs2 && <span style={{ color: ACC }}> ← ALU B</span>}
              </div>
            ))}
          </div>
        ), ACC)}

        {card('ALU', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            <div>A = {aVal}</div>
            <div>B = {bVal}</div>
            <div style={{ color: ACC }}>
              {OPS[f.op]} → {preview.value}
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>result, before writing back</div>
          </div>
        ), ACC)}

        {card('flags', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            {[['Z', flags.zero, 'result was zero'],
              ['N', flags.neg, 'top bit set'],
              ['C', flags.carry, 'carry out']].map(([n, v, why]) => (
              <div key={n} style={{ color: v ? DNG : '#888' }}>
                {n} = {v} <span style={{ fontSize: 11 }}>({why})</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {last && (
        <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
          last executed: address {last.pc} held the byte{' '}
          <b style={{ fontFamily: 'monospace' }}>{PROGRAM[last.pc]}</b>, which the
          control unit read as <b>{last.text}</b>, producing {last.value}.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Step through the whole program once and then look back at what you watched. There was no magic layer, no interpreter, no hidden intelligence. A number selected an address; the byte at that address set some switches; the switches routed two values into an adder; the adder's output was captured by a register on a clock edge. Repeat six times and the machine has "run a program."

The only thing missing is the *sequence* — the disciplined order in which those steps happen inside each clock cycle, and how the PC knows to advance. That order has a name, and it is the next lesson.

<Recap>

- The **stored-program** idea — from the 1945 EDVAC report, first executed by the Manchester Baby on 21 June 1948 — puts instructions in the same memory as data, encoded as ordinary numbers. Programming stopped being rewiring.
- A CPU **cannot distinguish an instruction from a number**. The byte `00011011` is `ADD R1, R2, R3` or the value 27 depending only on whether the program counter is pointing at it. *Bytes have no meaning — contracts do*, applied to the program itself.
- Every processor contains five parts: the **register file**, the **ALU**, the **program counter**, the **instruction register**, and the **control unit**, connected by **buses** and paced by the clock.
- A **register file** provides **two read ports and one write port**, because `R1 = R2 + R3` needs exactly that. Registers are few (16–32) because ports are expensive, larger files are slower, and every register number must be spelled out inside the instruction encoding.
- The **datapath** is a fixed road network; **multiplexers** decide which value travels which road. A mux is the hardware equivalent of an `if`.
- **Control signals** carry no data — they are verbs. Because the mapping from opcode to control word is a fixed truth table, the control unit is just combinational logic: **hardwired** for speed, or **microcoded** for flexibility, which is why CPUs can receive microcode updates.
- Memory is far away in the only unit that matters: a register is ~1 cycle, L1 ~4, main memory ~**200**. Scaled so a register takes one second, memory takes three minutes and a disk seek takes most of a year — which is why CPUs load into registers and work there.
- The stored-program property is also a vulnerability: **buffer overflows** work because execution follows the PC wherever it lands. The fix, **W^X** enforced by the hardware **NX bit**, is a contract bolted onto memory to restore a distinction the architecture deliberately erased.

</Recap>

<Challenges>

#### Assemble and disassemble {/*assemble-and-disassemble*/}

Using the toy's format — `op(2) rd(2) rs1(2) rs2(2)`, with `00`=ADD, `01`=SUB, `10`=AND, `11`=OR — do both directions. (a) Encode `SUB R3, R2, R0` into a single byte, in binary and in decimal. (b) The byte `170` appears in memory. What instruction is it? (c) Explain what the CPU would do if the program counter pointed at a byte that the programmer had intended purely as data.

<Hint>

For (a), write the four 2-bit fields side by side, then read the eight bits as one number. For (b), convert 170 to binary first, then split it into four pairs.

</Hint>

<Solution>

**(a) `SUB R3, R2, R0`:**

```
 op  = SUB = 01
 rd  = R3  = 11
 rs1 = R2  = 10
 rs2 = R0  = 00

 byte = 01 11 10 00 = 01111000 = 64 + 32 + 16 + 8 = 120 ✓
```

**(b) The byte 170:**

```
 170 = 10101010

 split:  10 | 10 | 10 | 10
         op   rd   rs1  rs2
         AND  R2   R2   R2

 → AND R2, R2, R2
```

Which is an instruction that computes `R2 AND R2` and stores it in R2 — a perfectly legal, completely pointless operation that leaves the machine exactly as it found it (though it does update the flags, which is occasionally the actual reason to write such a thing).

**(c) Pointing the PC at data:** the CPU would decode it and execute it. There is no check, no type tag, no error — the byte would be split into `op`, `rd`, `rs1`, `rs2` like any other, and some registers would be overwritten with the results. A stored-program machine has exactly one way of deciding whether a byte is an instruction: whether the program counter is pointing at it. This is why the Pitfall's `NX` bit had to be added in hardware; the architecture itself offers nothing to appeal to.

</Solution>

#### Count the ports {/*count-the-ports*/}

A design team proposes an instruction that computes `R1 = R2 + R3 + R4` in a single cycle. (a) What does this demand from the register file? (b) What does it demand from the ALU? (c) Why might the team reject it even though both are technically buildable?

<Solution>

**(a) The register file** would need **three read ports** instead of two, because three source values must appear simultaneously. Every additional read port duplicates the address decoding and the output multiplexing for *every* register in the file — this is not a 50% cost increase, it is closer to another full copy of the read machinery.

**(b) The ALU** would need to add three numbers at once. It can be done — but a three-input adder is meaningfully deeper than a two-input one, and depth is delay. From the clock lesson: if this new path becomes the critical path, it does not just slow down this instruction, it lowers the clock frequency for **every instruction in the entire processor**.

**(c) Why reject it.** Three reasons, in rough order of how often they decide these arguments:

- **The encoding budget.** The instruction must now name four registers instead of three. With 32 registers that is 5 more bits taken out of a fixed-width instruction — bits that have to be stolen from somewhere, possibly shrinking the constant field or the number of available opcodes for *all* instructions.
- **The clock.** A slower critical path taxes every instruction to speed up a rare one. Two ordinary `ADD`s do the same job in two cycles without touching the clock.
- **How often is it actually useful?** Adding three registers is not a common pattern; spending permanent hardware and permanent encoding space on it is a poor trade.

The general shape of the answer is the recurring lesson of processor design: **local speedups that lengthen the critical path or eat encoding space are usually losses**, because both of those costs are paid globally and forever.

</Solution>

#### The mystery slowdown {/*the-mystery-slowdown*/}

Transfer task. A colleague brings you a performance puzzle. Two functions do the same arithmetic on the same amount of data, and both compile to nearly identical instruction counts — but one runs about **five times slower**. The fast one walks a small array repeatedly; the slow one walks a very large array once, touching each element in a scattered order. The CPU counters show both executing a similar number of instructions per second's worth of *work*, but the slow one shows the core idle a large fraction of the time.

Using only what this lesson established, explain what is almost certainly happening, why "same instruction count" was a misleading measurement, and what you would suggest they measure or change next.

<Solution>

**What is happening.** The two functions are not doing the same amount of *waiting*. Instruction count measures work issued to the ALU; it says nothing about where the operands came from. The fast function's data is small enough that its values stay in the fast end of the ladder — registers and the nearest cache levels, a handful of cycles away. The slow function reaches into a large array in a scattered pattern, so a large share of its operands come from main memory at roughly **200 cycles** apiece. The core is not computing slowly; it is **stalled**, holding still while a value crosses a distance that this lesson measured as three minutes on the one-second-per-register scale.

**Why "same instruction count" misled them.** It is a measure of the ALU's workload, and the ALU was never the bottleneck. The block diagram makes the reason plain: the register file and ALU sit inside the CPU and run at clock speed, while memory sits on the far side of a bus. An instruction that reads a register and an instruction that reads memory look identical in a count and differ by two orders of magnitude in time. Counting instructions to predict runtime is like counting a delivery route's stops without asking how far apart they are.

**What to measure or change next:**

- **Measure the stalls, not the instructions.** Cache miss counts and cycles-stalled-on-memory are the numbers that will show the difference immediately; most CPUs expose these as hardware performance counters.
- **Change the access pattern before changing the arithmetic.** Walking memory in order is dramatically friendlier than jumping around, so restructuring the loop to touch data sequentially, or processing it in blocks small enough to stay in fast storage, often buys more than any amount of instruction tuning.
- **Reconsider the data layout.** Sometimes the fix is not in the loop at all but in how the data is arranged — packing the fields actually being read next to each other so that one trip to memory brings back more useful values.

The transferable habit, and the one the memory ladder exists to teach: **when a program is slow, ask where its data is before you ask what its code does.** Most of modern performance work is not about making the ALU busier; it is about keeping it from waiting. ✓

</Solution>

</Challenges>

<LearnMore title="Fetch–Decode–Execute Cycle" path="/learn/faza-0/modul-0-3/fetch-decode-execute">

You now know every part and how they are wired — but not the order in which they move. A real processor does not do everything at once: within each tick it *fetches* the byte the PC points at, *decodes* it into control signals, and *executes* the operation, then advances the PC and does it again, billions of times a second, forever. Next lesson follows one instruction all the way around that loop, and answers the question the toy above quietly dodged: what happens when the instruction says not "add these" but "go somewhere else"?

</LearnMore>
