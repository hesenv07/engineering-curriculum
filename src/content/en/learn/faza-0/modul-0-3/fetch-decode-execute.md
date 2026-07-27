---
title: "Fetch–Decode–Execute Cycle"
---

<Intro>

Three minutes before the first human being stood on the Moon, the computer flying the lander gave up. On 20 July 1969, descending toward the Sea of Tranquility, the Apollo Guidance Computer flashed a yellow code on its display: **1202**. Buzz Aldrin read it out. Then it happened again. Then 1201. Five alarms in four minutes, and in Houston, guidance officer Steve Bales had seconds to call abort or go. The alarm meant *executive overflow* — the computer had been handed more jobs than it could finish, because a rendezvous radar left in the wrong switch position was stealing roughly **13% of its cycles** on work nobody needed, on top of the 83% the descent already required. There were not enough cycles in the second. Bales, coached by Jack Garman reading a handwritten cheat sheet taped under the plexiglass of his console, called **go** — because Margaret Hamilton's team at MIT had built software that could throw away its least important jobs and keep flying. Eagle landed. Everything in that story turns on one fact about processors that this lesson is about: a CPU does exactly one thing, over and over, at a fixed rate — it fetches an instruction, works out what it means, and does it. Every capability your computer has is that loop, and the loop is a budget you can overspend.

</Intro>

<YouWillLearn>

- The three phases — **fetch**, **decode**, **execute** — and precisely what moves on each one
- How a single instruction is spread across several clock ticks, and why "one instruction per cycle" is a myth
- Why a **jump** is not a special power but one extra input on one multiplexer
- How an `if` is built from a subtraction nobody keeps and a flag feeding a switch
- What a loop looks like from the program counter's point of view — traced in real x86 machine code
- How **interrupts** break the loop from outside, which is the only reason your keyboard works

</YouWillLearn>

<InlineToc />

## The loop that never stops {/*the-loop-that-never-stops*/}

Last lesson laid out the parts: registers, an ALU, a program counter, an instruction register, a control unit. What was missing was *sequence*. A processor does not fire all its parts at once; it moves through the same three phases, forever, in the same order.

<Diagram name="fetch-decode-execute/cycle_ring" height={430} width={720} alt="A circular diagram titled 'the loop that never stops'. Three rounded boxes are arranged around a circle: FETCH at the top in blue with the note 'read the byte the PC points at', DECODE at the lower right in red with the note 'work out which switches to set', and EXECUTE at the lower left in blue with the note 'actually do it, then move the PC'. Grey curved arrows run clockwise between the three boxes, forming a closed ring. In the centre of the ring sits a grey box containing the monospace text PC, annotated 'the only state that carries over'. Captions below read: billions of times a second, from power-on until power-off; and: the CPU has no idle state — doing nothing is also a program.">

There is no fourth phase, no rest state, and no exit. From the moment power reaches the chip until it is cut, the processor is somewhere in this ring.

</Diagram>

That last caption deserves a moment. When your laptop is "idle," it is not stopped — it is running an *idle loop*, a small program whose whole job is to do nothing gracefully until something happens. The only thing that changes between a machine rendering video and a machine sitting on a desktop is **which** instructions the loop is fetching, never whether it is fetching.

Notice what sits in the middle of the ring: the **program counter**. Everything else in the CPU is scratch — register values, ALU inputs, control signals, all of it is regenerated each time round. The PC is the only thread of continuity, the single number that answers "where were we?" Change it and you have changed the future of the machine, which is the entire second half of this lesson.

## Fetch {/*fetch*/}

The first phase asks one question: *what am I supposed to do next?* The answer is always in the same place — at the address currently in the PC.

<Diagram name="fetch-decode-execute/fetch_detail" height={380} width={720} alt="A diagram titled 'FETCH: go and get the byte'. On the left, a red box labelled PC containing the value 2. A red arrow leads right into a grey box labelled 'address bus', annotated 'what is at address 2?', and on to a memory block on the right containing four binary values, the third of which, 00111111, is highlighted in red. A blue arrow leaves the memory block, travels down and left into a blue box labelled 'data bus', and continues left into a blue box labelled IR now containing 00111111. A dashed grey arrow loops from the PC box down and back around to the address path, labelled 'PC ← PC + 1'. Captions read: the byte at the address in the PC is copied into the instruction register; and: the PC quietly steps forward, before anyone has looked at what arrived.">

Address out, byte back, and the counter already pointing at the next one.

</Diagram>

Three things happen, in this order: <CodeStep step={1}>the PC drives the address bus</CodeStep>, <CodeStep step={2}>memory returns the byte at that address onto the data bus</CodeStep>, and <CodeStep step={3}>that byte is captured into the instruction register</CodeStep>.

Then a fourth thing, and it is the one worth remembering: <CodeStep step={4}>the PC is incremented</CodeStep> — *before anybody has looked at the instruction*. The processor optimistically assumes the next instruction is the next one in memory, because it almost always is. This is not a small detail. It means that by the time a jump instruction is decoded, the PC has **already moved on**, which is exactly why jump targets in real machine code are so often measured relative to "the instruction after this one." You will see that number, in hexadecimal, later in this lesson.

<Note>

Fetch is also where the memory ladder from last lesson comes to collect. If the instruction happens to be in the L1 instruction cache, this phase costs a few cycles. If it is not, the CPU may wait **200 cycles** for main memory — for a byte it has not even looked at yet. This is why processors work so hard to guess which instructions they will need *before* they need them, and why a tight loop that fits in cache can run an order of magnitude faster than one that does not.

</Note>

## Decode {/*decode*/}

The byte is in the IR. Now the control unit reads it and works out which switches to close.

<Diagram name="fetch-decode-execute/decode_detail" height={380} width={720} alt="A diagram titled 'DECODE: work out what it means'. At the top, the instruction register is shown split into two boxes: a blue box containing 0011 labelled 'opcode = SUB', and a grey box containing 1111 labelled 'operand = 15'. Arrows lead from both boxes down into a red box labelled 'control unit'. From that box, six dashed lines fan out to six signal boxes: MemRead = 1, MemAddr = 15, ALUop = SUB, AccWrite = 1, SetFlags = 1, and PCload = 0. Five are highlighted in red as active and the last is grey and inactive. A caption reads: one byte in, a fistful of switch settings out — pure combinational logic.">

The opcode is an index, not a calculation. The same four bits always raise the same wires.

</Diagram>

Decoding is a lookup, not a computation. The instruction splits into fields — here a 4-bit **opcode** saying *what* and a 4-bit **operand** saying *to what* — and the opcode indexes a fixed table of switch settings. Because the mapping never changes, the whole phase is combinational logic settling, exactly as described last lesson.

Notice `PCload = 0` sitting there, greyed out and inactive. That single wire is the difference between "carry on" and "go somewhere else," and for a `SUB` it stays down. Keep an eye on it.

## Execute {/*execute*/}

Now the switches are set, so data can move.

<Diagram name="fetch-decode-execute/execute_detail" height={380} width={720} alt="A diagram titled 'EXECUTE: actually do it'. On the left, a blue box labelled 'A register' containing 5 and a grey box labelled 'memory[15]' containing 1. Blue arrows lead from both into a notched blue ALU shape in the centre, labelled ALU with the operation SUB. A dashed red arrow points up into the ALU labelled 'ALUop from the control unit'. From the ALU, a blue arrow leads right to a box labelled 'result' containing 4, and a grey arrow leads to a box labelled 'flags' showing Z=0 N=0 C=0. A long blue arrow loops from the result box down and back left into the A register, labelled 'written back into A on the next clock edge'. A caption reads: the operands meet, the ALU does its one job, and the answer is stored.">

The only phase where anything actually happens to your data — and the flags come out whether you asked for them or not.

</Diagram>

For an arithmetic instruction this is the ALU doing what you built it to do two lessons ago. For a load it is a second trip to memory. For a store it is a write. And in every case, the result is captured **on a clock edge** — the discipline from the clock lesson, doing its job: the answer is allowed to settle all the way through the logic, and only then is it committed.

Two outputs leave the ALU, and the second one is easy to overlook. Alongside the result come the **flags** — `Z`, `N`, `C`, `V` — and they are stored whether anyone wants them or not. Nothing has used them yet. They are about to become the most important wires in the machine.

## Five ticks, one instruction {/*five-ticks-one-instruction*/}

The three phases are a logical description, not a timing diagram. On a simple processor each phase is broken into smaller steps, one per clock tick, often called **T-states**:

<Diagram name="fetch-decode-execute/tstate_timeline" height={400} width={720} alt="A timeline titled 'one instruction, five clock ticks'. Five boxes run left to right labelled T1 through T5, each containing a short description and a phase label beneath. T1: PC to address bus, phase fetch. T2: memory to IR, PC plus 1, phase fetch. T3: control unit, reads the opcode, phase decode. T4: operand to ALU, second input ready, phase execute. T5: result to register, flags set, phase execute. Grey arrows connect each box to the next. Below the boxes runs a red square-wave clock signal labelled clk, with one cycle aligned under each T-state. Captions read: the phases are not equal, and they are not always five — a simple instruction may take three, a memory access may take dozens, and a modern CPU overlaps several instructions at once; but the order is never violated: nothing executes before it has been fetched.">

One instruction, unrolled against the clock. Each tick moves one thing.

</Diagram>

This is where the most persistent misconception about processors dies. A 3 GHz CPU does not execute three billion instructions per second. It ticks three billion times per second, and instructions consume a *variable* number of ticks: a register-to-register add might take one, a division might take twenty, a load that misses cache might take two hundred. The average is called **CPI** — cycles per instruction — and squeezing it is what a huge fraction of processor engineering is about.

<Note>

If instructions take several cycles each, and most of the machine sits idle during most of those cycles, an obvious idea presents itself: while instruction 1 is executing, why not fetch instruction 2? And while that one decodes, fetch instruction 3? That idea is **pipelining**, it is how every processor built since the 1980s claws CPI back down toward 1 (and below), and it has its own lesson two stops from here. For now, keep the simple picture: one instruction, start to finish, then the next.

</Note>

## The instruction that says "go somewhere else" {/*the-instruction-that-says-go-somewhere-else*/}

Everything so far assumed the PC just counts up. If that were all it did, a program would be a straight line executed once — no loops, no functions, no conditions, no operating system. Every interesting thing a computer does requires the ability to *not* run the next instruction.

Here is the entire mechanism, and it is almost disappointing:

<Diagram name="fetch-decode-execute/pc_input_mux" height={380} width={340} alt="A diagram titled 'where the PC gets its next value'. On the left, two boxes feed into a red trapezoid labelled mux: an upper grey box containing PC + 1, annotated 'the default', and a lower red box containing 'target', annotated 'from the instruction'. A dashed red arrow points up into the bottom of the mux labelled 'jump?'. The mux output leads right into a box labelled PC. Captions read: a jump is not a special power — it is one extra input on one multiplexer.">

Two possible futures, one select wire.

</Diagram>

The PC is a register. Registers have inputs. Put a **multiplexer** on that input with two choices — the incremented value, or an address supplied by the instruction — and a single control wire decides which one gets written at the next clock edge. That wire is the `PCload` signal that sat greyed out in the decode diagram.

That is a jump. There is no "goto machinery," no special mode. The processor does not even experience it as unusual: it fetches, decodes, executes, and the execute phase of a `JMP` happens to write the PC instead of a register. Next cycle, fetch reads from wherever the PC now points, exactly as it always does.

## How an `if` happens {/*how-an-if-happens*/}

An unconditional jump gets you loops that never end. To make a *decision*, the mux's select wire must depend on data — and the wires that carry the necessary information are already there, produced by every ALU operation and quietly ignored until now.

<CodeDiagram>

```
 SUB 15      ; A = A - 1, and set the flags
 JZ  6       ; if Z is set, PC ← 6

 ; the SUB is doing two jobs:
 ;   the arithmetic that the program wants
 ;   the comparison that the branch will read
```

<Diagram name="fetch-decode-execute/branch_decision" height={380} width={340} alt="A diagram titled 'how the machine decides'. At the top, a grey box labelled SUB, annotated 'result thrown away, flags kept'. An arrow leads down to a red box containing Z = 1. An arrow leads right from it into a red box labelled JZ. An arrow leads down from JZ into a wider red box containing 'jump = 1'. Captions read: a comparison is a subtraction nobody keeps; and: an if is a flag feeding a multiplexer.">

Subtract, keep only the verdict, let one bit steer the switch.

</Diagram>

</CodeDiagram>

This is how every conditional you have ever written eventually resolves. A comparison such as `a == b` is compiled into a **subtraction whose result is discarded**; the only thing kept is the `Z` flag, which is 1 precisely when the two values were equal. `a < b` reads the sign and carry flags instead. Then a conditional branch instruction wires the chosen flag into the PC's multiplexer.

So the answer to "how does a computer make a decision" is, at the bottom: it doesn't. It subtracts, notices whether the answer was zero, and lets that one bit steer a switch.

## A loop, from the PC's point of view {/*a-loop-from-the-pcs-point-of-view*/}

Put jumps and flags together and you get repetition. Here is a complete program for a small machine — a counter that counts down from 5, printing as it goes. The instruction format is 4 bits of opcode and 4 bits of operand, so every instruction is exactly one byte:

```
 addr  byte        assembly     what it does
 ────  ────────    ─────────    ─────────────────────────────
   0   01010101    LDI 5        A ← 5
   1   11100000    OUT          print A
   2   00111111    SUB 15       A ← A − memory[15], set flags
   3   10000110    JZ  6        if Z then PC ← 6
   4   01100001    JMP 1        PC ← 1
   6   11110000    HLT          stop
  15   00000001    (data: 1)    the constant the loop subtracts
```

Seven meaningful bytes. Run it and the output is:

<ConsoleBlockMulti>

<ConsoleLogLine level="info">

5

</ConsoleLogLine>

<ConsoleLogLine level="info">

4

</ConsoleLogLine>

<ConsoleLogLine level="info">

3

</ConsoleLogLine>

<ConsoleLogLine level="info">

2

</ConsoleLogLine>

<ConsoleLogLine level="info">

1

</ConsoleLogLine>

</ConsoleBlockMulti>

Now watch the same program as the *processor* experiences it — not as seven instructions in memory, but as a path the PC walks through time:

<Diagram name="fetch-decode-execute/loop_pc_trace" height={420} width={720} alt="A line chart titled 'what a loop looks like from the PC point of view'. The vertical axis is labelled PC and runs from 0 to 7 with dashed gridlines. The horizontal axis is time, with 21 plotted points connected by a blue line. The line rises 0, 1, 2, 3, 4 then drops sharply back to 1, rises to 4 again, drops back to 1, and repeats this sawtooth four times before finally rising from 3 to 6 at the end. Each downward drop is drawn as a thick red segment and its endpoint marked with a red dot; upward steps are blue. Labels mark 'start' at the left and 'HLT' at the right. Captions read: each red drop is one JMP 1 — the PC being written instead of incremented; the program has 7 instructions; the processor executed 21 of them; a loop is not a structure in memory — it is a shape the PC traces over time.">

Twenty-one executions of seven instructions. The loop exists only in this shape.

</Diagram>

Seven instructions in memory; twenty-one executed. The loop does not exist anywhere as an object — there is no loop instruction, no bracket, no block. What exists is a sawtooth in the value of one register. **A loop is a shape the PC traces**, and that reframing pays off for the rest of your career: it is why a "loop" and a "function call" and a "goto" and an "exception" are all, at the machine level, the same act performed with different bookkeeping.

## The same thing, in real machine code {/*the-same-thing-in-real-machine-code*/}

None of this is a simplification for teaching. Here is a genuine C function compiled for a real x86-64 processor, disassembled with the raw bytes shown (symbol names trimmed for width):

<TerminalBlock>

gcc -O1 -c loop.c && objdump -d loop.o

Disassembly of section .text:
   0:  f3 0f 1e fa     endbr64
   4:  85 ff           test   %edi,%edi
   6:  74 0d           je     15
   8:  b8 00 00 00 00  mov    $0x0,%eax
   d:  01 f8           add    %edi,%eax
   f:  83 ef 01        sub    $0x1,%edi
  12:  75 f9           jne    d
  14:  c3              ret

</TerminalBlock>

Every claim this lesson has made is visible in those eight lines.

The loop body is three instructions, at addresses `d`, `f` and `12`. The `sub` at `f` decrements the counter **and sets the flags**, exactly as the toy program's `SUB` did. The `jne` at `12` reads those flags and conditionally writes the PC. And look at the bytes of that jump: `75 f9`. Two bytes — an opcode and an operand — and the operand is `0xf9`, which as a *signed byte* (Lesson 3 of Module 0.1, still earning its keep) is:

```
 0xf9 = 11111001 = −7

 the jne instruction sits at 0x12 and is 2 bytes long,
 so the PC has already advanced to 0x14 when the jump executes

 0x14 + (−7) = 0x0D   ← the top of the loop ✓
```

There it is: the fetch phase's early increment, two's complement, and the PC multiplexer, all cooperating inside two bytes of real machine code on a real processor. The jump is *relative* precisely because the PC has already moved.

<YouTubeIframe src="https://www.youtube.com/embed/dHWFpkGsxOs" title="Ben Eater — 8-bit CPU control logic: Part 3" />

If you would like to see this happen in physical hardware rather than in a diagram, the video above is worth an hour. Ben Eater builds a processor from individual logic chips on breadboards, and in this episode he wires up the instruction cycle itself — the ring counter that walks through T-states, the EEPROMs that turn an opcode into control signals — and then runs a program on it, with every control line visible as an LED. The machine he builds uses almost exactly the 4-bit-opcode format used in this lesson, so the instructions will look familiar.

<Pitfall>

**The program counter is not sacred, and nothing checks where it points.**

The mistake is imagining that the CPU "runs your function." It does not. It runs whatever the PC points at, and the PC is an ordinary register that any instruction with the right encoding can write.

This is why a corrupted return address is catastrophic rather than merely wrong. When a function returns, the processor loads the PC from a value stored in memory — and if something has overwritten that value, execution simply continues at the new address, fetching and decoding whatever bytes live there. There is no error, because from the CPU's point of view nothing unusual happened: it fetched, it decoded, it executed. Last lesson's `NX` bit exists to make *some* of those destinations illegal, but the underlying machine has no concept of a "valid" instruction address.

The related, gentler mistake is reading a disassembly and assuming each line costs the same. As the T-state diagram showed, instructions consume wildly different numbers of cycles, so *counting instructions is not measuring time*. Two functions with identical instruction counts can differ by an order of magnitude if one of them keeps missing cache during its fetch phase.

</Pitfall>

<DeepDive>

#### What breaks the loop from outside {/*what-breaks-the-loop-from-outside*/}

The cycle as described is airtight and completely deaf. Fetch, decode, execute, repeat — nothing in that ring can notice that you pressed a key, that a network packet arrived, or that a disk finished reading. If the only way to learn about the outside world were to check for it, a processor would have to interleave "has anything happened?" into everything it ever does, wasting most of its cycles asking questions whose answer is almost always no. That approach exists and is called **polling**; it is why a program stuck in a busy-wait loop can pin a core at 100% doing nothing.

The alternative is to let the outside world *interrupt*. A dedicated wire into the CPU — several, in practice — can be raised by any device that needs attention. At the end of the current instruction (never in the middle: the cycle finishes what it started), the processor checks that wire, and if it is high it does something remarkable in its simplicity:

1. It saves the PC — the return address — somewhere safe.
2. It loads the PC with the address of a handler routine, looked up in a table.
3. It carries on with the ordinary cycle, which now finds itself executing the handler.
4. The handler finishes with a "return from interrupt" instruction that restores the saved PC.

That is the whole mechanism. Notice that steps 2 to 4 are *just jumps* — the same multiplexer, the same PC-write, the same fetch phase afterwards. An interrupt is a jump that the hardware performs without being asked, and everything that makes a computer feel responsive is built on it: keyboards, mice, timers, network cards, and the operating system's ability to take a core back from a program that will not yield.

Which returns us to the Moon. The Apollo Guidance Computer's 1202 alarm was, at bottom, an interrupt-driven scheduler discovering that the jobs queued by interrupts exceeded the cycles available to run them. The radar's spurious signals were raising interrupts; each one stole cycles; the executive ran out of storage for new jobs and called a routine named `BAILOUT`, which discarded low-priority work and restarted the essential jobs. Five times in four minutes, the machine threw away everything non-critical and kept flying the descent. The cycle is a budget, and Hamilton's team had written software that knew what to cut when the budget ran out.

</DeepDive>

<DeepDive>

#### Programs that rewrite themselves {/*programs-that-rewrite-themselves*/}

Since instructions are just bytes in memory, and a `STA`-style instruction can write bytes to memory, nothing prevents a program from **writing into its own instruction stream**. In the early decades this was not a curiosity but standard practice: the Manchester Baby's descendants had no index registers, so the only way to walk through an array was to compute the next address and *store it into the operand field of the load instruction* before executing it. Self-modifying code was how you wrote a loop over data at all.

It has aged badly, for reasons that are a tour of everything this course has taught. Caches assume instruction memory does not change, so modifying it forces expensive invalidations. Pipelines have already fetched the instructions you are about to overwrite. Multiple cores may hold stale copies. Security policy (`W^X`) now forbids memory that is both writable and executable. And debugging code that is not the code you wrote is exactly as unpleasant as it sounds.

But the idea did not die — it moved upstairs and got a respectable name. A **JIT compiler** — in a JavaScript engine, a JVM, or a .NET runtime — writes fresh machine code into memory at runtime, flips that memory from writable to executable, and jumps into it. Your browser does this to the code on this page. That is self-modifying code with a permissions ceremony bolted on, and it is only possible because of the stored-program principle: to a processor, the output of a compiler and the input of a fetch phase are the same kind of thing, which is to say, bytes.

</DeepDive>

## Run the cycle yourself {/*run-the-cycle-yourself*/}

Below is the countdown program on a working machine, and this time you can step through it **one phase at a time**. Watch the three-phase ring turn: fetch lights up and the byte moves from memory into the IR while the PC ticks forward; decode splits the byte and raises the control signals; execute moves the data and, when the instruction is a jump, writes the PC instead.

The moments worth waiting for are at addresses 3 and 4. Step slowly through the `JZ` while `Z` is still 0 and watch `PCload` stay dark — the jump is fetched, decoded, and then *declines to happen*. Then run the loop down to zero and catch the one time it fires.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const PHASES = ['FETCH', 'DECODE', 'EXECUTE'];
const NAMES = {
  0: 'NOP', 1: 'LDA', 2: 'ADD', 3: 'SUB', 4: 'STA',
  5: 'LDI', 6: 'JMP', 8: 'JZ', 14: 'OUT', 15: 'HLT',
};
const INITIAL_MEM = [
  0x55, 0xE0, 0x3F, 0x86, 0x61, 0x00, 0xF0, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
];
const bin = (v) => v.toString(2).padStart(8, '0');

export default function CycleStepper() {
  const [mem, setMem] = useState(INITIAL_MEM);
  const [pc, setPc] = useState(0);
  const [ir, setIr] = useState(0);
  const [acc, setAcc] = useState(0);
  const [z, setZ] = useState(0);
  const [phase, setPhase] = useState(0);
  const [out, setOut] = useState([]);
  const [halted, setHalted] = useState(false);
  const [note, setNote] = useState('press step to begin');
  const [count, setCount] = useState(0);

  const op = (ir >> 4) & 15;
  const arg = ir & 15;

  const reset = () => {
    setMem(INITIAL_MEM); setPc(0); setIr(0); setAcc(0); setZ(0);
    setPhase(0); setOut([]); setHalted(false); setCount(0);
    setNote('press step to begin');
  };

  const stepPhase = () => {
    if (halted) return;
    if (phase === 0) {
      const fetched = mem[pc];
      setIr(fetched);
      setPc((pc + 1) & 15);
      setNote(`fetched ${bin(fetched)} from address ${pc}; PC advanced to ${(pc + 1) & 15}`);
      setPhase(1);
    } else if (phase === 1) {
      setNote(`opcode ${(ir >> 4) & 15} = ${NAMES[(ir >> 4) & 15] || '??'}, operand ${ir & 15}`);
      setPhase(2);
    } else {
      let msg = '';
      if (op === 5) { setAcc(arg); setZ(arg === 0 ? 1 : 0); msg = `A ← ${arg}`; }
      else if (op === 1) { setAcc(mem[arg]); setZ(mem[arg] === 0 ? 1 : 0); msg = `A ← memory[${arg}] = ${mem[arg]}`; }
      else if (op === 2) {
        const r = (acc + mem[arg]) & 255;
        setAcc(r); setZ(r === 0 ? 1 : 0); msg = `A ← ${acc} + ${mem[arg]} = ${r}`;
      } else if (op === 3) {
        const r = (acc - mem[arg]) & 255;
        setAcc(r); setZ(r === 0 ? 1 : 0); msg = `A ← ${acc} − ${mem[arg]} = ${r}, Z = ${r === 0 ? 1 : 0}`;
      } else if (op === 4) {
        const m = mem.slice(); m[arg] = acc; setMem(m); msg = `memory[${arg}] ← ${acc}`;
      } else if (op === 14) { setOut([...out, acc]); msg = `printed ${acc}`; }
      else if (op === 6) { setPc(arg); msg = `PCload = 1 → PC ← ${arg}`; }
      else if (op === 8) {
        if (z) { setPc(arg); msg = `Z is 1 → PCload = 1 → PC ← ${arg}`; }
        else { msg = `Z is 0 → PCload stays 0, the jump does not happen`; }
      } else if (op === 15) { setHalted(true); msg = 'HLT — the cycle stops here'; }
      setNote(msg);
      setPhase(0);
      setCount(count + 1);
    }
  };

  const stepInstruction = () => {
    let guard = 0;
    // finish the current instruction, however many phases remain
    while (guard++ < 4) { stepPhase(); if (phase === 2) break; }
  };

  const pcLoad = phase === 2 && (op === 6 || (op === 8 && z));
  const signals = [
    ['MemRead', phase === 0 || (phase === 2 && [1, 2, 3].includes(op)) ? 1 : 0],
    ['IRload', phase === 0 ? 1 : 0],
    ['PCinc', phase === 0 ? 1 : 0],
    ['ALUop', phase === 2 && [2, 3].includes(op) ? 1 : 0],
    ['AccWrite', phase === 2 && [1, 2, 3, 5].includes(op) ? 1 : 0],
    ['PCload', pcLoad ? 1 : 0],
  ];

  const chip = (text, on, col = DNG) => (
    <span style={{
      fontFamily: 'monospace', fontSize: 12, padding: '3px 8px', margin: 2,
      borderRadius: 6, display: 'inline-block',
      border: `1px solid ${on ? col : '#888'}`,
      background: on ? `${col}1e` : 'transparent',
      color: on ? col : '#888',
    }}>{text}</span>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={stepPhase} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          step one phase
        </button>
        <button onClick={stepInstruction} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          finish instruction
        </button>
        <button onClick={reset} style={{ fontSize: 15, padding: '4px 14px' }}>reset</button>
      </div>

      {/* the three-phase ring */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {PHASES.map((ph, i) => (
          <div key={ph} style={{
            flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9,
            border: `2px solid ${i === phase && !halted ? ACC : '#888'}`,
            background: i === phase && !halted ? `${ACC}1e` : 'transparent',
            color: i === phase && !halted ? ACC : '#888',
            fontWeight: i === phase && !halted ? 'bold' : 'normal',
          }}>{ph}</div>
        ))}
      </div>

      {/* memory */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
        {mem.map((b, i) => {
          const here = i === pc && !halted;
          const isData = i === 15;
          return (
            <div key={i} style={{ textAlign: 'center', margin: 1, width: 62 }}>
              <div style={{ fontSize: 10, color: '#888' }}>{i}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 11, padding: '4px 2px',
                border: `2px solid ${here ? DNG : '#888'}`, borderRadius: 6,
                background: here ? `${DNG}22` : (isData ? `${ACC}12` : 'transparent'),
              }}>{bin(b)}</div>
              <div style={{ fontSize: 9, color: here ? DNG : '#888' }}>
                {isData ? 'data' : (NAMES[(b >> 4) & 15] || '')}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          PC = <b style={{ color: DNG }}>{pc}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          IR = <b>{bin(ir)}</b> ({NAMES[op] || '??'} {op === 14 || op === 15 ? '' : arg})
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          A = <b style={{ color: ACC }}>{acc}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          Z = <b style={{ color: z ? DNG : 'inherit' }}>{z}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#888' }}>
          instructions run: {count}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 6 }}>control word</span>
        {signals.map(([n, on]) => chip(`${n}=${on}`, on, n === 'PCload' ? DNG : ACC))}
      </div>

      <div style={{
        padding: '8px 12px', borderRadius: 9, marginBottom: 8,
        border: `2px solid ${halted ? DNG : ACC}`,
        background: halted ? `${DNG}14` : `${ACC}14`,
      }}>
        <b style={{ color: halted ? DNG : ACC }}>{halted ? 'halted' : PHASES[phase]}</b>
        {' — '}{note}
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
        output: {out.length ? out.join('  ') : <span style={{ color: '#888' }}>(nothing yet)</span>}
      </div>
    </div>
  );
}
```

</Sandpack>

Step through the whole thing once and count what you saw. Twenty-one instructions, sixty-three phases, one adder, one multiplexer on the PC, and a single flag bit deciding when to stop. That is a computer running a program — the complete mechanism, with nothing left out and nowhere for magic to hide.

<Recap>

- A processor does exactly one thing forever: **fetch**, **decode**, **execute**, repeat. There is no idle state — a machine "doing nothing" is running an idle loop.
- **Fetch** puts the PC on the address bus, brings the byte back into the IR, and **increments the PC before anyone has looked at the instruction**. That early increment is why real jump offsets are measured from the *next* instruction.
- **Decode** is a lookup, not a computation: the opcode indexes a fixed table of switch settings, produced by combinational logic.
- **Execute** moves the data — ALU, memory, or register — and commits the result on a clock edge, always producing **flags** alongside the answer whether anyone wants them or not.
- One instruction spans several clock ticks (**T-states**), and different instructions take wildly different numbers of them. A 3 GHz CPU does **not** execute 3 billion instructions per second; the ratio is called **CPI**.
- A **jump** is one extra input on the multiplexer feeding the PC, selected by a single `PCload` wire. There is no special goto machinery.
- An **`if`** is a subtraction whose result is discarded and whose **`Z` flag** steers that multiplexer. A comparison is arithmetic nobody keeps.
- A **loop is not an object in memory** — it is a sawtooth shape the PC traces over time. Seven instructions produced twenty-one executions in this lesson's example, and real x86 does the same thing with `sub` setting flags and `jne` writing the PC via a signed relative offset (`75 f9` → −7 → back to the top).
- **Interrupts** are jumps the hardware performs unasked: save the PC, load a handler address, carry on. Every responsive device on your machine depends on them — and Apollo 11's 1202 alarm was an interrupt-driven scheduler running out of cycles.

</Recap>

<Challenges>

#### Count by twos {/*count-by-twos*/}

Modify the lesson's countdown program so that it prints `10, 8, 6, 4, 2` and then halts. You may change only two bytes. Give their addresses, their new values in binary, and explain why the loop still terminates.

<Hint>

Two things determine the sequence: the value the accumulator starts at, and the constant the loop subtracts each time round. Both are single bytes sitting in memory.

</Hint>

<Solution>

Two bytes change:

```
 address  old         new         meaning
 ───────  ────────    ────────    ──────────────────────
    0     01010101    01011010    LDI 10   (opcode 0101, operand 1010)
   15     00000001    00000010    the data constant becomes 2
```

The loop still terminates because 10 is an exact multiple of 2, so repeated subtraction lands precisely on zero and the `Z` flag fires:

```
 10 → 8 → 6 → 4 → 2 → 0 ✓   Z = 1, JZ takes the branch, HLT
```

And here is the trap worth noticing. Change the start value to **9** instead of 10 and the program never stops: the accumulator steps 9, 7, 5, 3, 1, then −1, which in eight-bit two's complement is 255, and off it goes around the whole range without ever hitting exactly zero. The loop tests `Z`, which means "equal to zero," not "less than or equal to zero" — and that difference between `!=` and `<=` as a loop condition is a real bug that has shipped in real software many times. If you want a loop that survives an unexpected starting value, test the sign or the carry, not equality.

</Solution>

#### Aim a real jump {/*aim-a-real-jump*/}

On x86-64, the short form of `jne` is two bytes: opcode `75` followed by a **signed 8-bit relative offset**. A `jne` sits at address `0x2A` and must jump backwards to `0x1C`. Compute the offset byte, give the two bytes of the complete instruction, and state the largest backward jump this form can express.

<Solution>

The offset is measured from the address of the **next** instruction, because the PC was incremented during fetch:

```
 the jne occupies 0x2A and 0x2B, so after fetch the PC holds 0x2C

 offset = target − (address after the instruction)
        = 0x1C − 0x2C
        = 28 − 44
        = −16

 −16 as a signed byte:  16 = 00010000
                        flip → 11101111
                        +1   → 11110000 = 0xF0
```

The complete instruction is **`75 f0`**.

The reach of this form is the range of a signed byte, which Module 0.1 established as −128 to +127: the furthest backward jump is **128 bytes** before the following instruction. That is not a lot, and it is why assemblers and linkers have to pick between a short jump and a longer encoding depending on distance — and why a small edit that pushes a target 3 bytes too far away can silently change the size of an instruction elsewhere in the file.

Worth appreciating what just happened: to answer this question you used the fetch phase's early increment, two's complement negation, and signed range limits — three lessons from three different modules, all inside two bytes.

</Solution>

#### The core that will not cool down {/*the-core-that-will-not-cool-down*/}

Transfer task. A teammate reports a problem: *"Our sensor-reading service pins one CPU core at 100% even when no sensor data is arriving. The profiler says almost all the time is inside `waitForData()`. We've already tried making the function shorter and it made no difference. The laptop fans run constantly and battery life is halved."* The function looks like this:

```
 while (dataReady == 0) {
     // nothing
 }
 processData();
```

Explain what the CPU is actually doing, why shortening the function changed nothing, and write the recommendation.

<Solution>

**What the CPU is doing:** running the fetch–decode–execute cycle at full speed, forever, on a loop that computes nothing. Every cycle it fetches the load of `dataReady`, decodes it, executes it, tests it, and jumps back — several instructions, billions of times a second. This is **polling**, and from the processor's point of view it is indistinguishable from useful work: the cycle has no concept of a "pointless" instruction. The core is at 100% because it genuinely is 100% busy, and it draws full power because, per the CMOS lesson, transistors burn energy when they *switch* — and these are switching as fast as the clock allows.

**Why shortening the function changed nothing:** the cost is not the size of the loop body, it is that the loop runs continuously. Making the body shorter makes each iteration faster, which means *more* iterations per second, not fewer. Optimising a busy-wait makes it burn power more efficiently.

**The recommendation:** *"This is a busy-wait, so the core is spinning through the fetch–decode–execute cycle with nothing to do. The fix is to stop asking and let the hardware tell us: block on the interrupt-driven path instead of polling a flag. Depending on the platform that means waiting on a condition variable / semaphore that the sensor's interrupt handler signals, an `epoll`/`select`-style wait on the device file descriptor, or a blocking read — in every case the OS de-schedules our thread, the core is free for other work or can enter a low-power state, and we are woken when data actually arrives. If we must poll for some reason (very short, predictable waits), at minimum add a sleep or a CPU pause/yield instruction inside the loop so we are not consuming every available cycle."*

The general principle, and the reason interrupts exist at all: **the cycle is a fixed budget of work per second, and a processor cannot tell the difference between spending it and wasting it.** Deciding what deserves cycles is not the hardware's job — it never was. Apollo 11's computer discovered the same thing at 30,000 feet, and survived only because someone had written down, in advance, what to throw away. ✓

</Solution>

</Challenges>

<LearnMore title="Instruction Set Architecture" path="/learn/faza-0/modul-0-3/instruction-set-architecture">

Every instruction in this lesson was invented for the occasion: four bits of opcode, four of operand, because that was convenient. Real processors make those choices once and then live with them for decades, because the encoding is a contract between everyone who will ever compile code and every chip that will ever run it. Next lesson: what an **instruction set** actually promises, why x86 instructions can be fifteen bytes long while ARM's are always four, and how a decision made in 1978 about how many registers to name is still shaping the machine on your desk.

</LearnMore>
