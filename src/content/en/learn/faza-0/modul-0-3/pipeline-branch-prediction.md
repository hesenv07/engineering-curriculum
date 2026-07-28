---
title: "Pipelining and Branch Prediction"
---

<Intro>

In 1913, at the Highland Park plant in Michigan, Henry Ford's engineers changed how a Model T chassis was put together. Before that year, a team of workers gathered around a stationary chassis and built the whole car, start to finish; it took **twelve hours and thirty minutes**. The new arrangement moved the chassis along a line past workers who each did one small job and then did it again on the next car. Nobody worked faster. Nobody was more skilled. But by the end of the year, a chassis took **one hour and thirty-three minutes** — about eight times less. The trick was not speed; it was refusing to let anyone stand idle waiting for someone else to finish. Sixty years later, processor designers reached for the same idea, and it is the single largest reason the machine in front of you is fast. It also created a problem Ford never had: an assembly line has to know which car comes next, and a processor, arriving at an `if` statement, does not.

</Intro>

<YouWillLearn>

- Why overlapping instructions makes a processor faster — and why it does **not** make any single instruction faster
- The five classic pipeline stages, and what sits between them
- The two things that break the idea: **data hazards** and **branches** — and how each is fixed
- How a **branch predictor** guesses, learns, and why a two-bit counter beats a one-bit one
- What a **misprediction** actually costs, measured on a real machine (a 15× difference from sorting an array)
- How speculation — doing work before you know you should — became one of the decade's biggest security holes

</YouWillLearn>

<InlineToc />

## The idea {/*the-idea*/}

Start away from computers entirely.

Suppose building a car takes four steps: build the frame, drop in the engine, fit the wheels, paint it. Each step takes one hour. One worker doing all four steps produces a car every four hours.

Now hire four workers and give each one a single step. The frame-builder finishes a frame and hands it on — and instead of waiting, immediately starts the *next* frame. After a short warm-up, all four workers are busy all the time, and a finished car comes off the end **every hour**.

<Diagram name="pipeline-branch-prediction/assembly_line" height={400} width={720} alt="A diagram titled 'one worker, or four workers in a row'. The top half shows a single row of eight grey boxes labelled frame, engine, wheels, paint, repeated twice, marked 'car 1' and 'car 2', with a red note reading '8 slots' and a caption 'two cars take eight time slots — nobody works while someone else does'. The bottom half shows four staggered rows of blue boxes, one row per car, each row containing the same four labelled steps but shifted one position to the right compared with the row above, forming a diagonal staircase. A caption reads: a car still takes four steps — but a finished car now rolls off every single slot.">

Top: one worker, eight slots for two cars. Bottom: four workers, and the staircase that makes a car appear every slot.

</Diagram>

Look carefully at the bottom half of that picture, because it contains the whole idea and one crucial subtlety.

**Each individual car still takes four hours.** Nothing about the process got faster for any one car. What changed is that four cars are now *in progress at the same time*, at different stages, so cars come out four times as often.

This is **pipelining**, and applying it to a processor is almost embarrassingly direct: an instruction goes through a fixed sequence of steps, so let several instructions occupy different steps at once.

## Cutting an instruction into five {/*cutting-an-instruction-into-five*/}

Two lessons ago you followed one instruction through fetch, decode and execute. To pipeline it, that journey is chopped into stages — traditionally five:

<Diagram name="pipeline-branch-prediction/five_stages" height={340} width={720} alt="A diagram titled 'one instruction, cut into five jobs'. Five boxes sit in a row labelled IF (fetch: read the byte the PC points at), ID (decode: split the fields, read the registers), EX (execute: the ALU does its one job), MEM (memory: load or store, if the instruction asks), and WB (write back: put the result into a register). Grey arrows connect each box to the next, and red dashed vertical lines sit between every pair of boxes. Captions read: between every pair of stages sits a register that holds the half-finished work; these dividers are the whole trick — they let five instructions occupy the five stages at the same time without treading on each other; and: the stages are exactly the phases of the last two lessons, only now they are separate rooms.">

The same journey as before, now with walls between the rooms.

</Diagram>

Those red dashed lines matter more than they look. Between every pair of stages sits a **pipeline register** — a row of flip-flops, exactly the kind you built in Module 0.2 — holding the half-finished instruction.

Without them, the five stages would be one long chain of combinational logic and everything would smear together. With them, each stage is a sealed room: it takes whatever arrived at the clock edge, works on it for one cycle, and hands the result to the next room at the next edge. That is what makes it safe for five different instructions to be in the machine at once.

## Watch it fill up {/*watch-it-fill-up*/}

Here is the same three instructions, run the old way and the new way:

<DiagramGroup>

<Diagram name="pipeline-branch-prediction/timing_sequential" height={340} width={340} alt="A small timing grid titled 'one at a time', subtitled 'each instruction finishes before the next starts'. Three rows labelled i1, i2 and i3 sit under a numbered cycle axis running to 15. Each row contains five consecutive coloured blocks representing the IF, ID, EX, MEM and WB stages, and the blocks of each row begin only after the previous row's blocks have ended, forming three separate runs across the grid. A colour legend beneath names the five stages. The summary reads: 3 instructions, 15 cycles.">

Nothing overlaps. Fifteen cycles for three instructions.

</Diagram>

<Diagram name="pipeline-branch-prediction/timing_pipelined" height={340} width={340} alt="A small timing grid titled 'overlapped', subtitled 'a new instruction starts every cycle'. Three rows labelled i1, i2 and i3 sit under a numbered cycle axis running to 15. Each row contains five consecutive coloured blocks for the IF, ID, EX, MEM and WB stages, but each row starts one cycle later than the row above, so the blocks form a tight diagonal staircase clustered at the left of the grid. A colour legend beneath names the five stages. The summary reads: 3 instructions, 7 cycles.">

Same work, same stages, same hardware speed. Seven cycles.

</Diagram>

</DiagramGroup>

Scale that up and the effect becomes dramatic:

<Diagram name="pipeline-branch-prediction/pipeline_chart" height={400} width={720} alt="A large grid titled 'five instructions moving through five stages'. Nine columns are labelled c1 to c9 and five rows are labelled instr 1 to instr 5. Each row contains five coloured cells labelled IF, ID, EX, MEM and WB, and each row is shifted one column right of the row above, forming a wide diagonal staircase across the grid. Beneath the grid, a horizontal band is divided into three labelled regions: 'filling up' covering the first four cycles, 'full' covering cycle five, and 'draining' covering the last four cycles. Captions read: 5 instructions in 9 cycles instead of 25 — and once the pipe is full, one instruction finishes every single cycle.">

The canonical picture of a pipeline. Read a row to follow one instruction; read a column to see what the machine is doing in one cycle.

</Diagram>

Twenty-five cycles became nine. The general formula is simple enough to keep in your head:

```
 without pipelining:   N × k        cycles     (N instructions, k stages)
 with pipelining:      k + (N − 1)  cycles

 5 instructions, 5 stages:   25  →  9
 100 instructions:          500  →  104
 1,000,000 instructions:   5,000,000  →  1,000,004
```

For a long run of instructions the `k` and the `− 1` stop mattering, and the speedup approaches **k**: the number of stages. Five stages, five times the throughput. This is why processors kept adding stages.

## What you actually gained {/*what-you-actually-gained*/}

Now the subtlety, and it trips up almost everyone the first time:

<Diagram name="pipeline-branch-prediction/latency_throughput" height={330} width={720} alt="A diagram titled 'faster, but not in the way you might expect', showing two side-by-side boxes. The left red box is headed 'latency' with the description 'how long ONE instruction takes' and the note 'unchanged — still 5 cycles. Slightly worse, in fact, because of the dividers between stages'. The right blue box is headed 'throughput' with the description 'how many finish per second' and the note 'up to 5× better — this is the whole prize'. Captions below read: the assembly line did not make one car faster to build, it made cars come out more often; and: this distinction matters — a pipelined chip has the same or worse response time for a single operation, and far more work done per second overall.">

Two different questions, two different answers. Pipelining only improves one of them.

</Diagram>

**Latency** is how long one instruction takes from start to finish. Pipelining does not improve it. If anything it makes it slightly worse, because each pipeline register adds a small delay of its own.

**Throughput** is how many instructions complete per second. That is what improves, by up to a factor of k.

The reason this is worth belabouring: it is the same trade you will meet everywhere in systems — in networks, in databases, in your own code. Adding a queue, a buffer, or a batch almost always improves throughput and worsens latency. Knowing which one your problem cares about is most of the skill.

One more benefit hides in the chart, and it is arguably bigger. Each stage now does only a *fifth* of the work per cycle, so each stage's critical path is a fifth as long — which means (per the clock lesson) **the clock can run much faster**. Pipelining does not just overlap work; it lets you raise the frequency of the entire chip. This is exactly how processors climbed from megahertz to gigahertz.

So far this all sounds free. It is not.

## Problem 1: the answer is not ready yet {/*problem-1-the-answer-is-not-ready-yet*/}

Real code does not consist of unrelated instructions. It looks like this:

```
 add r1, r2, r3     ; r1 = r2 + r3
 sub r4, r1, r5     ; r4 = r1 − r5     ← needs r1
```

The second instruction needs a value the first one has not finished producing:

<Diagram name="pipeline-branch-prediction/data_hazard" height={360} width={720} alt="A timing grid titled 'problem 1: the answer is not ready yet'. Two rows are shown against cycle columns c1 to c7. The first row, labelled 'add r1, r2, r3', has its five stage cells IF, ID, EX, MEM, WB in cycles 1 to 5. The second row, labelled 'sub r4, r1, r5', has its cells shifted one cycle right, in cycles 2 to 6, so its ID stage falls in cycle 3. A red arrow runs from the WB cell of the first row in cycle 5 back to the ID cell of the second row in cycle 3, labelled 'r1 is written here, but read here — two cycles too early'. Captions read: instruction 2 reads r1 in cycle 3; instruction 1 does not write it until cycle 5; the naive fix is to make instruction 2 wait — two wasted cycles, called a stall or bubble; and this happens constantly, because real code is full of results used immediately.">

The dependency every real program is full of, and the two cycles it would cost if we simply waited.

</Diagram>

This is called a **data hazard**. Instruction 2 wants to read `r1` in cycle 3, but instruction 1 does not write it until cycle 5.

The obvious fix is to make instruction 2 wait. Two cycles of nothing — called a **stall**, or a **bubble**, because an empty slot travels down the pipeline like a bubble in a pipe. It works, and it is slow: real code uses a result immediately far more often than not, so a machine that stalls on every dependency gives back most of what pipelining won.

The clever fix takes one look at the diagram and asks: *why are we waiting?* The value exists at the end of cycle 3 — it is sitting right there in the EX stage's output. It is not *in the register file* yet, but who cares where it is stored, as long as we can get at it?

<Diagram name="pipeline-branch-prediction/forwarding" height={340} width={720} alt="A timing grid titled 'the fix: hand the answer over early'. Two rows are shown against cycle columns c1 to c7. The first row, labelled 'add r1, r2, r3', has its stage cells in cycles 1 to 5; the second row, labelled 'sub r4, r1, r5', has its cells in cycles 2 to 6. A thick blue arrow runs from the EX cell of the first row in cycle 3 directly to the EX cell of the second row in cycle 4, labelled 'the ALU result is routed straight to the next instruction's input'. Captions read: the value exists at the end of cycle 3 — it just has not reached the register file yet; so add a wire that carries it directly from one ALU input to the next: forwarding; no stall at all — real CPUs have a web of these bypass paths.">

One extra wire, and the stall is gone.

</Diagram>

Add a wire. Route the ALU's output straight back to the ALU's input for the next instruction, bypassing the register file entirely. This is called **forwarding** (or bypassing), and with it the dependency above costs **nothing at all**.

A real processor has a dense web of these paths — from every stage that can produce a value to every stage that can consume one — plus logic that watches register numbers each cycle and decides which path to use. It is a lot of hardware to avoid waiting, and it is worth every transistor.

<Note>

Forwarding cannot fix everything. If instruction 1 is a **load from memory**, its value does not exist until the MEM stage in cycle 4 — but the next instruction wants it in cycle 4 too. Even forwarding cannot send a value backwards in time, so this case costs a real one-cycle stall, known as the *load-use hazard*.

Compilers know about it. When you see an optimising compiler reorder your code so that a loaded value is used a couple of instructions later, this is often what it is doing: filling that slot with something useful.

</Note>

## Problem 2: which instruction comes next? {/*problem-2-which-instruction-comes-next*/}

The second problem is much harder, and it has no clever wire that makes it disappear.

The fetch stage needs an address every single cycle. Normally that is easy — the next instruction is the next one in memory. But roughly one instruction in five or six is a **branch**, and a conditional branch does not know where it is going until it has been executed:

<Diagram name="pipeline-branch-prediction/branch_bubble" height={360} width={720} alt="A timing grid titled 'problem 2: which instruction comes next?'. The first row, labelled 'beq r1, r2, far', shows five stage cells across cycles 1 to 5, with the EX cell in cycle 3 highlighted in red and annotated below 'the answer is known here'. Two further rows below are labelled with question marks and show a single dashed empty cell containing a question mark, in cycles 2 and 3 respectively, each annotated 'which address should this fetch from?'. Captions read: the branch does not know where it is going until cycle 3, but the fetch stage needs an address in cycle 2; the pipeline has to do something with cycles it cannot fill; and waiting costs two cycles on this five-stage pipe — and far more on a real one.">

The fetch stage needs an answer a cycle before the answer exists.

</Diagram>

Cycle 2 arrives, the fetch stage asks "what address?", and the honest answer is *nobody knows yet*.

There are three possible responses, and processors have tried all of them:

1. **Wait** until the branch resolves. Correct, simple, and it throws away two cycles on this toy pipeline — and fifteen or more on a real one. Since branches are roughly one instruction in six, this is catastrophic.
2. **Do something useful anyway.** Some early designs defined the instruction after a branch to always execute, whatever the outcome (a *delay slot*), and let the compiler find something harmless to put there. It works, it is ugly, and it bakes a pipeline depth into the instruction set forever.
3. **Guess.** Fetch *as if* you knew the answer, and be prepared to undo it.

Guessing won, and it is not a hack. It is the defining feature of every fast processor built in the last thirty years.

## The guess {/*the-guess*/}

Guessing works because branches are extraordinarily predictable. A loop that runs a thousand times takes its backward branch a thousand times and falls through once. An error check succeeds nearly always. A null test fails nearly always. The behaviour of a branch is not random — it has *history*.

The simplest useful predictor stores, for each branch it has seen, a two-bit counter:

<Diagram name="pipeline-branch-prediction/predictor_state" height={380} width={720} alt="A state machine diagram titled 'the guess, and how it learns'. Four boxes sit in a row, labelled with the binary values 00, 01, 10 and 11 above them. From left to right they read: strongly not taken, weakly not taken, weakly taken, and strongly taken; the two left boxes are grey and the two right boxes are blue. Blue arrows along the top run left to right between adjacent states, labelled 'branch was taken → shift right'. Grey arrows along the bottom run right to left, labelled 'branch was not taken ← shift left'. Captions read: predict TAKEN on the right two states, NOT TAKEN on the left two; two bits, not one, so a single surprise does not flip the prediction — a loop that runs a thousand times is mispredicted once, at the end, not twice; and real predictors are far cleverer than this, and get well over 95% right.">

Four states, two bits, and a machine that changes its mind slowly on purpose.

</Diagram>

Read the state machine as a confidence meter. Every time the branch is taken, the counter moves one step toward "strongly taken." Every time it is not taken, one step the other way. The prediction is simply which half you are in.

Why two bits rather than one? Consider a loop that runs a thousand times. With a one-bit predictor, the single fall-through at the end flips the prediction — so the *next* time the loop starts, the first iteration is mispredicted too. Two mistakes per loop. With two bits, one surprise merely knocks the counter from "strongly" to "weakly" without changing the prediction, so the loop costs **one** misprediction instead of two. A single extra bit halved the error rate, which is the sort of result that makes computer architects very happy.

Real predictors are enormously more sophisticated — they track patterns across many branches, keep several predictors and learn which to trust, and index tables by long histories of recent outcomes. Accuracy on ordinary code is typically **above 95%, often above 99%**.

That sounds like a solved problem. It is not, and the next section is why.

## When the guess is wrong {/*when-the-guess-is-wrong*/}

If the prediction turns out to be wrong, everything fetched on the wrong path must be discarded:

<Diagram name="pipeline-branch-prediction/misprediction_flush" height={380} width={720} alt="A timing grid titled 'when the guess is wrong'. The top row, labelled branch, shows five stage cells across cycles 1 to 5, with the EX cell in cycle 3 highlighted in red. Below it, two rows labelled 'guessed 1' and 'guessed 2' show faded stage cells beginning in cycles 2 and 3, each struck through with a large red cross and annotated 'thrown away'. A fourth row, labelled 'correct one' in blue, shows a full set of five stage cells beginning in cycle 4, annotated 'restarts here'. Captions read: the work was not wrong, it was irrelevant — nothing it did was allowed to become visible; on this toy pipeline that costs 2 cycles, on a real 15 to 20 stage pipeline, 15 to 20; and: which is why a predictor that is right 95% of the time is not good enough.">

Everything on the wrong path is cancelled before it can touch anything real.

</Diagram>

This is a **pipeline flush**. The partially-completed instructions are cancelled before they can write anything, the fetch stage is pointed at the correct address, and the pipeline refills from empty.

The cost is roughly the depth of the pipeline. On a modern processor with fifteen to twenty stages, a single mispredicted branch costs **fifteen to twenty cycles** — during which the machine accomplishes nothing at all.

Now do the arithmetic on that 95% accuracy. If one instruction in six is a branch, and 5% of branches are mispredicted at 15 cycles each:

```
 per 100 instructions:
   ~17 branches
   ~0.85 mispredictions        (5% of 17)
   ~12.8 wasted cycles         (0.85 × 15)

 against ~100 cycles of useful work, that is roughly 13% of the machine
 thrown away — from a predictor that is right 19 times out of 20
```

This is why enormous effort goes into the last few percent of prediction accuracy, and why "95% correct" is considered mediocre.

### You can measure this yourself {/*you-can-measure-this-yourself*/}

None of the above is theoretical. Here is a C program that sums the elements of an array that are ≥ 128, run twice on identical data — once in random order, once sorted:

```c
for (int r = 0; r < 1000; r++)
    for (int i = 0; i < N; i++)
        if (data[i] >= 128) sum += data[i];
```

Sorting the array changes nothing about how much work is done. The same elements are compared, the same ones are added, the instruction count is identical. All that changes is the *order*, and therefore whether the branch is predictable.

<TerminalBlock>

gcc -O2 -fno-if-conversion branch.c -o branch && ./branch

unsorted      153.0 ms
sorted         10.8 ms

</TerminalBlock>

**About fifteen times faster**, from sorting the input. On unsorted data the branch is essentially a coin flip and the predictor is helpless; on sorted data it is wrong exactly once, at the point where the values cross 128.

This is a real measurement from the machine that generated this page, and it is the single most convincing demonstration of branch prediction there is. It is also the subject of one of the most-read questions ever asked on Stack Overflow, precisely because the result looks impossible until you know about the pipeline.

<Note>

There is a twist worth knowing. Compile the same program with plain `-O2` and the gap disappears — both versions run in about 12 ms. The compiler noticed the branch was cheap to eliminate and replaced it with a **conditional move**: an instruction that computes both possibilities and selects one, with no branch at all. No branch, nothing to mispredict, and the sorted/unsorted distinction becomes irrelevant.

That is why the command above passes `-fno-if-conversion` — it *forces* the compiler to leave a real branch in place so the effect is visible. And it is a useful lesson in itself: the fastest branch is often the one that is not there.

</Note>

<Pitfall>

**Do not go looking for branches to remove.**

Having just seen a 15× speedup from branch prediction, the natural reaction is to hunt down every `if` in your codebase. This is almost always a waste of effort, and sometimes actively harmful.

The reason is in the numbers above: predictors are right 95–99% of the time. A branch that is predictable — which is nearly all of them, because loops, error checks and null tests all have strong patterns — costs approximately **nothing**. Restructuring readable code to eliminate a branch the hardware was already handling perfectly makes the code worse and the program no faster.

The cases where it does matter are narrow and recognisable: a branch inside a hot inner loop whose condition depends on data that is effectively random. That is when the predictor has nothing to learn from, and that is when techniques like sorting the data, using a conditional move, or reformulating the computation branchlessly can pay for themselves.

The order of operations is always: **measure first**. Modern CPUs expose a branch-misprediction counter, and profilers can report it. If mispredictions are not showing up in your profile, the branches are not your problem — and you have just been given an excellent excuse not to write clever unreadable code.

</Pitfall>

<DeepDive>

#### The guess that could be watched {/*the-guess-that-could-be-watched*/}

On 3 January 2018, researchers disclosed a family of vulnerabilities that affected essentially every high-performance processor built in the previous two decades. They were found independently by Jann Horn at Google's Project Zero and by Paul Kocher working with several other researchers, and the most famous of them is called **Spectre**. Its root cause is the subject of this lesson.

Here is the shape of it. When a processor speculates past a branch, it executes instructions it may have to undo. The undo is thorough as far as the *program* is concerned: registers are restored, memory writes are cancelled, and nothing the wrong-path instructions computed ever becomes visible in the result.

But "visible in the result" is not the same as "leaves no trace."

While running on the wrong path, an instruction may read a memory location — and reading memory **loads it into the cache**. When the misprediction is discovered and the work is thrown away, the register changes are undone. The cache is not. The data sits there, and future accesses to that address will be measurably faster.

That is the leak. An attacker can:

1. Train the branch predictor by running a piece of code many times so it confidently predicts one way.
2. Then supply an input that makes the prediction wrong — but only *after* the processor has already speculatively executed a read it should never have been allowed to perform.
3. Let the flush happen. The read is undone, officially.
4. Time a series of memory accesses. Whichever one is unusually fast reveals what the speculative read touched, and from that, the secret value.

Nothing in that sequence is a bug in the ordinary sense. Every component behaved exactly as designed: the predictor guessed, the pipeline speculated, the flush was correct, and the cache did its job. The vulnerability lives in the *interaction* — in the gap between "architecturally undone" and "physically undetectable."

The consequences were large and are still with us. Mitigations arrived in microcode, compilers, operating systems and browsers, and many of them cost real performance because they amount to *speculating less*. Browsers reduced the precision of their timers, because measuring the cache requires a good clock. And a generation of architects learned an uncomfortable lesson: performance techniques that are invisible to the programmer are not necessarily invisible to an attacker.

It is also, in its way, the perfect ending to this lesson. Pipelining works by doing things before you are certain you should. It turns out the universe keeps a receipt.

</DeepDive>

<DeepDive>

#### How deep should the pipeline be? {/*how-deep-should-the-pipeline-be*/}

If five stages give five times the throughput, why not fifty?

Intel came closest to trying. The Pentium 4's original design had a **20-stage** pipeline, and a later revision pushed it to **31**. The logic was sound on paper: shorter stages mean a shorter critical path, which means a higher clock, which was exactly what the marketing of the era rewarded.

Three things pushed back.

**The misprediction penalty scales with depth.** A 31-stage pipeline throws away 31 cycles of work every time the predictor is wrong. At even 3% mispredictions on branch-heavy code, that is a punishing tax on everything.

**The overheads do not shrink.** Every stage boundary needs pipeline registers, and each one costs setup time and clock-to-Q delay that does not get smaller when you slice the logic thinner. Past a certain point you are adding register delay faster than you are removing logic delay, and the clock stops improving.

**Power grows with frequency.** As Module 0.2 established, switching is what costs energy — and pushing the clock to justify a deep pipeline means pushing voltage too, which is where the heat comes from.

The Pentium 4 line was eventually abandoned in favour of a design descended from the shorter-pipelined Pentium M, and the industry settled around **fourteen to twenty stages** — deep enough to reach a good clock, shallow enough that mispredictions do not dominate.

Which leaves a question this lesson has been circling. If frequency stopped rising and pipelines stopped deepening, where did the last twenty years of performance come from? That is the next lesson's subject, and the answer involves giving up on making one instruction stream faster.

</DeepDive>

## Run the pipeline yourself {/*run-the-pipeline-yourself*/}

Below is a small loop running on a five-stage pipeline. Step through it cycle by cycle and watch instructions move right, one stage per tick, with new ones entering behind them.

The switch that matters is **branch prediction**. Turn it on and the machine guesses that the loop's backward branch will be taken — right three times out of four, wrong only when the loop finally exits. Turn it off and it assumes every branch falls through, which is wrong on every iteration except the last. Same program, same instructions, same hardware. Watch the cycle count.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];
const ITERS = 4;
const PENALTY = 2; // cycles lost to a flush, on this five-stage model

// the loop, unrolled into the sequence that actually executes
function buildTrace() {
  const t = [];
  for (let i = 0; i < ITERS; i++) {
    t.push({ text: 'add  r1, r1, r2', br: false, iter: i });
    t.push({ text: 'sub  r3, r3, #1', br: false, iter: i });
    t.push({ text: 'bne  r3, loop', br: true, iter: i, taken: i < ITERS - 1 });
  }
  return t;
}
const TRACE = buildTrace();

export default function PipelineLab() {
  const [predict, setPredict] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [slots, setSlots] = useState([null, null, null, null, null]);
  const [next, setNext] = useState(0);
  const [retired, setRetired] = useState(0);
  const [miss, setMiss] = useState(0);
  const [bubbles, setBubbles] = useState(0);
  const [stall, setStall] = useState(0);
  const [log, setLog] = useState('press step to start the clock');

  const reset = (p) => {
    setPredict(p);
    setCycle(0); setSlots([null, null, null, null, null]);
    setNext(0); setRetired(0); setMiss(0); setBubbles(0); setStall(0);
    setLog('press step to start the clock');
  };

  const finished = next >= TRACE.length && slots.every((s) => s === null);

  const step = () => {
    if (finished) return;
    let note = '';
    const done = slots[4];
    const shifted = [null, slots[0], slots[1], slots[2], slots[3]];
    let nx = next, ms = miss, bb = bubbles, st = stall;

    // a branch leaving EX resolves now
    const br = slots[2];
    if (br && br.br) {
      const guessed = predict ? true : false;
      if (guessed !== br.taken) {
        ms += 1;
        st = PENALTY;
        shifted[0] = null;
        shifted[1] = null;
        note = `misprediction on the branch from iteration ${br.iter + 1}: ` +
               `guessed ${guessed ? 'taken' : 'not taken'}, it was ` +
               `${br.taken ? 'taken' : 'not taken'} — pipeline flushed`;
      } else {
        note = `branch from iteration ${br.iter + 1} predicted correctly, no penalty`;
      }
    }

    // fetch, unless we are serving a flush penalty
    if (st > 0) {
      st -= 1; bb += 1;
      if (!note) note = 'refilling the pipeline after the flush — nothing fetched';
    } else if (shifted[0] === null && nx < TRACE.length) {
      shifted[0] = { ...TRACE[nx], id: nx };
      nx += 1;
      if (!note) note = `fetched: ${shifted[0].text}`;
    } else if (!note) {
      note = 'nothing left to fetch — draining';
    }

    setSlots(shifted);
    setNext(nx); setMiss(ms); setBubbles(bb); setStall(st);
    if (done) setRetired(retired + 1);
    setCycle(cycle + 1);
    setLog(note);
  };

  const runAll = () => { for (let i = 0; i < 60; i++) step(); };

  const ipc = cycle > 0 ? (retired / cycle).toFixed(2) : '—';

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={step} disabled={finished}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          step one cycle
        </button>
        <button onClick={() => reset(predict)}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 14 }}>reset</button>
        <button onClick={() => reset(true)} style={{
          padding: '4px 12px', marginRight: 6, borderRadius: 6, cursor: 'pointer',
          border: `2px solid ${predict ? ACC : '#888'}`,
          background: predict ? `${ACC}1e` : 'transparent',
          color: predict ? ACC : 'inherit', fontWeight: predict ? 'bold' : 'normal',
        }}>prediction ON</button>
        <button onClick={() => reset(false)} style={{
          padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
          border: `2px solid ${!predict ? DNG : '#888'}`,
          background: !predict ? `${DNG}1e` : 'transparent',
          color: !predict ? DNG : 'inherit', fontWeight: !predict ? 'bold' : 'normal',
        }}>prediction OFF</button>
      </div>

      {/* the pipeline */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {STAGES.map((s, i) => {
          const occ = slots[i];
          return (
            <div key={s} style={{
              flex: 1, minHeight: 74, padding: '6px 8px', borderRadius: 9,
              border: `2px solid ${occ ? (occ.br ? DNG : ACC) : '#888'}`,
              background: occ ? (occ.br ? `${DNG}14` : `${ACC}14`) : 'transparent',
            }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{s}</div>
              {occ ? (
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{occ.text}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                    iteration {occ.iter + 1}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
                  empty
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '8px 12px', borderRadius: 9, marginBottom: 10,
        border: `2px solid ${log.includes('mispred') ? DNG : ACC}`,
        background: log.includes('mispred') ? `${DNG}14` : `${ACC}10`,
      }}>
        <b>cycle {cycle}</b> — {log}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontFamily: 'monospace' }}>
        <span>cycles: <b>{cycle}</b></span>
        <span>instructions done: <b>{retired}</b> / {TRACE.length}</span>
        <span>mispredictions: <b style={{ color: miss ? DNG : 'inherit' }}>{miss}</b></span>
        <span>wasted cycles: <b style={{ color: bubbles ? DNG : 'inherit' }}>{bubbles}</b></span>
        <span>IPC: <b style={{ color: ACC }}>{ipc}</b></span>
      </div>

      {finished && (
        <div style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${predict ? ACC : DNG}`,
          background: predict ? `${ACC}14` : `${DNG}14`,
        }}>
          <b style={{ color: predict ? ACC : DNG }}>
            Finished in {cycle} cycles with prediction {predict ? 'ON' : 'OFF'}.
          </b>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {TRACE.length} instructions, {miss} misprediction{miss === 1 ? '' : 's'},{' '}
            {bubbles} cycles thrown away. Now switch the predictor{' '}
            {predict ? 'OFF' : 'ON'} and run it again — identical program,
            identical hardware.
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>
        Simplified model: each flush costs {PENALTY} cycles. A real processor
        with fifteen to twenty stages pays fifteen to twenty.
      </p>
    </div>
  );
}
```

</Sandpack>

Run it both ways and compare the totals. The instruction count never changes — twelve, every time. What changes is how many cycles the machine needed to get through them, and the whole difference is guesses.

<Recap>

- **Pipelining** overlaps instructions the way an assembly line overlaps cars: cut the work into stages and keep every stage busy. Ford's Highland Park line cut Model T chassis assembly from **12h30m to 1h33m** without anyone working faster.
- The classic split is five stages — **IF, ID, EX, MEM, WB** — with a **pipeline register** between each pair holding the half-finished instruction. Those dividers are what make it safe for five instructions to be in flight at once.
- The maths: `N × k` cycles become `k + (N − 1)`. For long runs the speedup approaches **k**, the number of stages. Pipelining also shortens each stage's critical path, which lets the **clock run faster** — this is how processors reached gigahertz.
- Pipelining improves **throughput**, not **latency**. One instruction still takes just as long; more of them finish per second. This trade — better throughput, equal or worse latency — recurs everywhere in systems.
- **Data hazards** happen when an instruction needs a result that is not written yet. Stalling works and is slow; **forwarding** routes the value straight from one stage's output to the next stage's input and usually costs nothing. A load-use hazard still costs one real cycle, because a value cannot travel backwards in time.
- **Branches** are the hard problem: fetch needs an address before the branch has been resolved. The answer is to **guess**, then undo if wrong.
- A **two-bit saturating counter** predicts well because one surprise does not flip its mind — a thousand-iteration loop costs one misprediction instead of two. Real predictors exceed 95%, often 99%.
- A **misprediction flushes the pipeline**, costing roughly its depth: 15–20 cycles on a modern chip. Even at 95% accuracy this can waste over 10% of the machine.
- Measured on a real machine: the same loop over the same data ran in **153 ms unsorted and 10.8 ms sorted** — about **15×**, entirely because sorting made the branch predictable.
- **Spectre** (disclosed January 2018) exploited exactly this machinery: speculative work is undone architecturally but leaves traces in the cache, which can be timed. Every part behaved as designed; the leak was in the gap between "undone" and "undetectable."

</Recap>

<Challenges>

#### Count the cycles {/*count-the-cycles*/}

A processor has a 5-stage pipeline. (a) How many cycles does it take to execute 20 instructions with no hazards or branches? (b) How many would the same 20 instructions take with no pipelining at all? (c) What is the speedup, and why is it not exactly 5?

<Hint>

Use `k + (N − 1)` for the pipelined case and `N × k` for the unpipelined one. For (c), think about what the pipeline is doing during the first few cycles.

</Hint>

<Solution>

**(a)** Pipelined:

```
 k + (N − 1) = 5 + (20 − 1) = 24 cycles
```

**(b)** Unpipelined:

```
 N × k = 20 × 5 = 100 cycles
```

**(c)** The speedup:

```
 100 / 24 ≈ 4.2×
```

Not 5×, because of the **fill**. During the first four cycles the pipeline is not yet full — only one stage is busy in cycle 1, two in cycle 2, and so on. Those four cycles are pure overhead, and they are paid once regardless of how long the program runs.

Which means the speedup improves the longer the run:

```
     20 instructions:   100 /   24  ≈ 4.2×
    100 instructions:   500 /  104  ≈ 4.8×
 10,000 instructions: 50,000 / 10,004 ≈ 5.0×
```

The fill cost is fixed, so it becomes negligible. This is the same shape of argument as the pipeline flush: a fixed penalty matters enormously when it happens often, and not at all when it happens once.

</Solution>

#### The cost of a bad guess {/*the-cost-of-a-bad-guess*/}

A processor has a **16-stage** pipeline and a misprediction costs the full depth. In a program, 20% of instructions are branches, and the predictor is right 90% of the time. (a) How many cycles are wasted per 1,000 instructions? (b) If a better predictor raises accuracy from 90% to 98%, how many cycles does that save? (c) Comment on what this says about where design effort should go.

<Solution>

**(a)** Per 1,000 instructions:

```
 branches          = 1,000 × 0.20  = 200
 mispredictions    =   200 × 0.10  =  20
 cycles wasted     =    20 × 16    = 320 cycles
```

Against roughly 1,000 cycles of useful work, that is about **24% of the machine thrown away**.

**(b)** At 98% accuracy:

```
 mispredictions    = 200 × 0.02 = 4
 cycles wasted     =   4 × 16   = 64 cycles

 saving = 320 − 64 = 256 cycles per 1,000 instructions
```

The program gets roughly **20% faster** from a change that only improved the predictor's accuracy by eight percentage points.

**(c)** Two things stand out. First, **the last few percent of prediction accuracy are worth an enormous amount**, because the penalty is multiplied by depth. Going from 90% to 98% removed 80% of the mispredictions, not 8%. That is why branch predictors are among the most heavily engineered parts of a modern CPU and why designers will spend a lot of silicon on them.

Second, notice how depth and accuracy multiply. A deeper pipeline raises the clock but also raises the cost of every wrong guess — so the two design decisions cannot be made independently. Doubling the depth roughly doubles the misprediction tax, which is exactly the argument that ended the Pentium 4 era.

</Solution>

#### The profiling report {/*the-profiling-report*/}

Transfer task. A colleague is optimising a function that scans a large array of records and processes only the ones matching a filter. They come to you with a plan:

*"The profiler says this loop is our hot spot. I've read about branch prediction, so I'm going to rewrite all the `if` statements in the loop as branchless arithmetic using masks. It'll be uglier but it should be much faster."*

What would you ask them before agreeing, what could make this plan right, what could make it wrong, and what is the alternative they have not considered?

<Solution>

**What to ask first:** *are the branches actually mispredicting?* "This loop is the hot spot" says where the time goes; it does not say why. A loop can be slow because of cache misses, because of dependency chains, because it does too much work, or because of mispredictions — and the fix for each is different. Modern CPUs expose a branch-misprediction counter, and profilers can read it. **Measure that number before writing any code.**

**What would make the plan right:** if the filter condition depends on data that is effectively random — the unsorted-array case from this lesson — then the predictor has no pattern to learn, will be wrong roughly half the time, and each miss costs the full pipeline depth. In that situation branchless code can genuinely be several times faster, and the measured 15× in this lesson shows the upper end of what is at stake.

**What would make the plan wrong:** if the condition is *predictable* — nearly always true, nearly always false, or following any regular pattern — then the predictor is already right 95–99% of the time and those branches cost almost nothing. Rewriting them branchless would make the code harder to read, and could easily make it **slower**, because branchless code computes both sides of the condition every time. A branch that is correctly predicted skips the work entirely; a branchless version always does it.

**The alternative they have not considered:** change the *data*, not the code. If the records can be sorted or partitioned by the filter condition — grouping matches together — the branch becomes predictable and the problem disappears without touching the loop at all. That is precisely the sorted-array result. Depending on the workload, it may also be possible to filter once and reuse the result, or to store the matching records separately in the first place.

The general habit: **measure the specific cause, then match the fix to it.** Reaching for a technique because it is famous, rather than because the counter says so, is how readable code gets sacrificed for no gain. ✓

</Solution>

</Challenges>

<LearnMore title="Why CPUs Stopped Getting Faster" path="/learn/faza-0/modul-0-3/moore-law">

Pipelining, forwarding and prediction all point in one direction: extract more speed from a single stream of instructions. For about thirty years that worked spectacularly. Then, around 2005, it stopped — clock speeds levelled off, pipelines stopped getting deeper, and the industry made a hard turn that changed how software has to be written ever since. Next lesson: what physical wall the industry hit, why Moore's law kept going while performance did not, and why your laptop has eight cores instead of one very fast one.

</LearnMore>
