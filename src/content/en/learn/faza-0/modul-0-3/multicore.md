---
title: "Multi-core: Core, Thread, Hyper-threading"
---

<Intro>

In 1995, three researchers at the University of Washington published a measurement that should have been embarrassing for the entire processor industry. Dean Tullsen, Susan Eggers and Henry Levy took the most aggressive processor designs anyone was then proposing — cores capable of issuing **eight instructions every cycle** — and worked out how many they would actually manage on real programs. The answer was fewer than **1.5**. A machine built at enormous expense to do eight things at once was, in practice, doing barely one and a half, because real code spends its time waiting: for memory, for a branch to resolve, for the previous instruction's result. The expensive execution units sat idle most of the time. Their proposal was almost impudent in its simplicity: if one program cannot keep this core busy, **let two programs share it**. Seven years later Intel shipped that idea to consumers under the name Hyper-Threading, and ever since, the number of "processors" your operating system reports has been a polite fiction. This lesson is about what that fiction hides — and why the word "thread" now means three different things.

</Intro>

<YouWillLearn>

- What a **process** is, what a **thread** is, and exactly which parts of memory they share
- The difference between **concurrency** and **parallelism** — the distinction most performance arguments get wrong
- What the **scheduler** and a **context switch** actually do, and why taking turns is not free
- Why adding threads does not add parallelism — demonstrated on a real one-core machine
- What **SMT** (Intel calls it Hyper-Threading) actually duplicates, and what it leaves shared
- Why the same feature can give **+30%** on one workload and **−10%** on another
- How to read your machine's real topology, and what "8 CPUs" is really telling you
- How many threads you should actually use — and why the honest answer depends on what your program waits for

</YouWillLearn>

<InlineToc />

## What is actually running on your computer {/*what-is-actually-running*/}

Start with something more basic than threads, because threads make no sense without it.

A program sitting on your disk is not running. It is a file — bytes, exactly as Module 0.3 established, instructions and data with nobody pointing a program counter at them. When you launch it, the operating system builds something around those bytes: a **process**.

A process is a running program *plus everything it needs to run*. Most importantly, it gets its own private region of memory:

<Diagram name="multicore/process_anatomy" height={420} width={720} alt="A diagram titled 'what happens when you run a program', showing two large outlined boxes side by side. The left blue box is labelled 'process A (your editor)' and contains four stacked panels labelled: the code (the instructions, loaded from the file), globals (variables that live for the whole program), the heap (memory you asked for at runtime), and, in red, the stack (where the program is, and its local variables). The right grey box is labelled 'process B (your browser)' and contains the same four panels, each annotated 'its own copy, entirely separate'. Between the two boxes a red line is struck through with a large cross, labelled 'cannot see'. Captions read: a process is a running program plus its own private memory; one crashing cannot corrupt the other — the isolation is enforced by hardware.">

Two programs running, each in its own sealed room. Nothing here is shared.

</Diagram>

Four things live inside a process, and it is worth naming all four because two of them come back later:

- **The code** — the instructions, copied in from the file.
- **The globals** — variables that exist for the program's whole life.
- **The heap** — memory the program requests as it runs (what happens when you allocate a list, an object, a buffer).
- **The stack** — this one matters most for what follows. The stack records *where the program currently is*: which function called which, and the local variables belonging to each of those calls. Every time a function is called, a new frame goes on top; every time one returns, a frame comes off. The stack is the program's memory of how it got here.

The other crucial property is the cross in the middle of that diagram. **Two processes cannot see each other's memory.** Your text editor cannot read your browser's variables, even accidentally, even if it tried. That isolation is enforced by the hardware, and it is why one program crashing does not take down the machine.

Isolation is excellent for safety. It is inconvenient when you *want* two things to cooperate closely, because now they must communicate through the operating system — sending messages, sharing files, opening sockets — and all of that is slow compared with simply reading a variable.

Which is exactly the problem threads solve.

## A thread is a second line of execution {/*a-thread-is-a-second-line-of-execution*/}

Ask what a process actually needs in order to be *executing*, and the list is short. It needs a program counter, saying which instruction is next. It needs the register values it is working with. And it needs a stack, holding its call history and local variables.

Everything else — the code, the globals, the heap — is not about *where you are*. It is about *what is there*.

So here is the idea. Duplicate only the first list. Give the process a second program counter, a second set of registers, and a second stack, while leaving the code and the data shared. Now the process has two independent places in the program, both looking at the same data.

That second place in the program is a **thread**.

<Diagram name="multicore/process_vs_thread" height={440} width={720} alt="A diagram titled 'one process, three threads'. A large blue outlined box represents one process. Inside its upper half, under the red heading 'each thread has its own', sit three red-tinted boxes labelled thread 1, thread 2 and thread 3, each listing: program counter, registers, its own stack. In the lower half, under the blue heading 'and all of them share', sit four blue boxes labelled: the code, globals, the heap, open files. Captions read: sharing memory is what makes threads cheap to talk between — and easy to break; two threads writing the same variable is a data race, and nothing stops them; and: a process is isolation, a thread is a second place in the same program.">

The top half is why threads can be in different places. The bottom half is why they can help each other, and hurt each other.

</Diagram>

Read the two halves of that diagram as the definition, because between them they explain almost everything about threads:

**What each thread owns privately** is its program counter, its registers and its stack. It has to — otherwise two threads could not be at different points in the program, and a function call in one would corrupt the other's local variables.

**What every thread shares** is the code, the globals, the heap and the open files. Thread 1 can write to a variable and thread 2 can read it, immediately, with no message-passing and no operating system involved. Communication is just a memory access.

That sharing is the whole reason threads exist. It is also the whole reason they are dangerous. Nothing prevents thread 1 and thread 2 from writing the same variable at the same moment, and when that happens the result depends on timing that nobody controls — a **data race**. This is why concurrent programming needs locks, atomics, channels and the rest of the machinery: not because threads are complicated, but because shared memory has no rules of its own.

<Note>

The distinction is easiest to remember as a trade:

- **Processes** are isolated and safe, and talking between them is expensive.
- **Threads** share everything and talking is nearly free, so *you* become responsible for the safety.

There is no third option that gives you both, which is why languages keep proposing different ways to manage the second case — Rust's ownership rules, Go's channels, JavaScript's decision to have no shared-memory threads at all by default.

</Note>

## Concurrency is not parallelism {/*concurrency-is-not-parallelism*/}

Now the distinction that the rest of this lesson depends on, and it is the one most often blurred. It is not a subtlety; the two words describe genuinely different things.

Imagine a coffee shop with **one barista** and two customers:

<Diagram name="multicore/concurrency_vs_parallelism" height={476} width={720} alt="A timeline diagram titled 'one barista, or two', divided into two halves. The upper half, headed 'CONCURRENCY, one barista, two customers', shows three tracks: the barista's track has four red blocks reading 'take A's order', 'take B's order', 'finish A' and 'finish B', with gaps between them; the 'drink A' track shows ordered, then a blue block 'machine runs', then served; the 'drink B' track shows the same, offset later. A caption notes that two jobs make progress together but the barista only ever does one thing at a time. The lower half, headed 'PARALLELISM, two baristas', shows two tracks, barista 1 and barista 2, each with a single long blue block reading 'makes drink A start to finish' and 'makes drink B start to finish', running side by side over the same time span. A caption reads: one core can be concurrent, only more cores can be parallel.">

The top half needs one worker and some patience. The bottom half needs a second worker, and nothing else will do.

</Diagram>

Follow the top half. The barista takes A's order and starts the espresso machine. The machine now takes thirty seconds, during which the barista is **doing nothing useful** — so instead of standing there, she takes B's order. Then she goes back and finishes A. Then B.

At every instant, the barista is doing at most one thing. Yet both drinks were in progress the whole time. That is **concurrency**: dealing with several things at once by interleaving them, using the gaps where one job is waiting.

The bottom half is **parallelism**: two baristas, two drinks, genuinely simultaneous. Two hands doing two things in the same instant.

The definitions in one line each:

```
 concurrency  =  several jobs in progress, interleaved on however many workers you have
 parallelism  =  several jobs executing in the same instant, which requires several workers
```

And the consequence that matters:

- **One core can be highly concurrent.** It fills waiting time with other work. This is why a single-core machine can serve thousands of simultaneous web requests, and why `async`/`await` exists.
- **One core can never be parallel.** There is one engine. It does one thing at a time, however many jobs are in flight.

Hold on to the barista image, because later in this lesson it comes back in disguise. Hyper-threading is exactly this trick applied *inside* a core: when one instruction stream stalls waiting for memory, let another use the idle moment.

## How one core runs many threads {/*how-one-core-runs-many-threads*/}

If a core can only execute one thread at a time, how does a machine with four cores run the two hundred threads your operating system currently has?

It takes turns, very quickly, and the mechanism is worth seeing because its cost explains several things later:

<Diagram name="multicore/context_switch" height={400} width={720} alt="A diagram titled 'how one core runs two threads: it takes turns'. Three boxes run left to right: a blue box 'thread 1 running' noting that registers, PC and flags are all in the core; a red box 'the switch' listing three steps — save thread 1's state, load thread 2's state, jump to where it was; and a blue box 'thread 2 running' noting that the core has no memory of thread 1 at all. Arrows connect them. A note beneath reads: what triggers it is a timer interrupt, the hardware jump from two lessons ago. A large red panel below is headed 'the cost is not the copying' and explains that saving a few dozen registers is fast, but the caches are now full of thread 1's data and thread 2 has to fault it all back in from memory at around 200 cycles a time. Captions read: this is why 16 threads on 1 core is not faster than 1 thread — the work is the same, and now you are paying for the turns as well.">

Three cheap steps and one expensive consequence.

</Diagram>

The part of the operating system that decides who runs next is the **scheduler**. It keeps a queue of threads that are ready to run, hands one to each available core, and after a few milliseconds takes it back and gives the core to somebody else.

What makes that possible is the **timer interrupt** — the mechanism from the fetch–decode–execute lesson. A hardware timer raises an interrupt at regular intervals, the CPU jumps into the operating system, and the operating system gets to decide whether to give the core back to the same thread or to a different one. Without that interrupt, a thread that never voluntarily yielded could keep a core forever.

The changeover itself is called a **context switch**, and it is three steps: save everything that identifies where thread 1 was (its registers, its program counter, its flags), load the same things for thread 2, and jump to where thread 2 left off. Since a thread *is* essentially that bundle of state, swapping the bundle swaps the thread.

The interesting part is where the cost lives. Copying a few dozen registers is fast — a handful of nanoseconds. The expensive part is invisible in the diagram: **the caches are now full of the wrong data.** Thread 1 had spent its turn filling L1 and L2 with the memory it was using, and thread 2 wants entirely different memory. Every access thread 2 makes is a miss, and per the memory ladder that is around two hundred cycles each, until the cache refills with its data — at which point its turn ends and the whole thing happens again.

This is the honest explanation for the benchmark you are about to see. Sixteen threads on one core do not go faster than one thread, because turn-taking does not create capacity. It only divides the same capacity into smaller pieces, and charges you for the division.


## Three things called "thread" {/*three-things-called-thread*/}

With processes, threads, concurrency and scheduling in place, one piece of vocabulary can be pinned down — and it is the piece that causes almost every wrong conclusion about multicore performance, because the same word gets used for three different things:

<Diagram name="multicore/core_vs_thread" height={400} width={720} alt="A diagram titled 'three things that all get called thread', showing three stacked panels. The first, in red, is headed 'a core' and labelled 'physical hardware', with the note 'an actual set of transistors that can fetch, decode and execute'. The second, in blue, is headed 'a hardware thread' and labelled 'an illusion the core provides', with the note 'one extra copy of the registers, so the core can hold two jobs half-done at once'. The third, in grey, is headed 'an OS thread' and labelled 'a software object', with the note 'a stack, a saved register set and a place in a queue — you can have thousands, on any number of cores'. A caption reads: only the first one can do work, the other two are ways of organising who gets to use it.">

Three layers of the same word. Keep them separate and most performance arguments resolve themselves.

</Diagram>

- A **core** is hardware. It is the machine from the last four lessons: a register file, an ALU, a pipeline, a control unit. It executes instructions. There are as many of them as the chip physically contains, and no more.
- A **hardware thread** — also called a *logical processor*, or a *logical CPU* — is a duplicated set of *state* inside one core. Same execution hardware, one extra place to keep track of a job.
- An **OS thread** is a software object: a stack, a saved set of register values, and an entry in the scheduler's queue. You can create ten thousand of them on a machine with one core. Nothing stops you.

Only the first of these can do work. The other two are bookkeeping about *who is allowed to use* the thing that does work.

That distinction sounds pedantic until you watch it decide a benchmark.

## Threads do not create parallelism {/*threads-do-not-create-parallelism*/}

Here is a program that does a fixed amount of arithmetic — sixty million additions — and splits it evenly across `N` threads. Run it on a machine with **one** core and see what happens as `N` grows:

<TerminalBlock>

gcc -O2 -pthread over.c -o over && ./over

CPU-bound work split across N threads, on a 1-vCPU machine

   1 thread      137.7 ms
   2 threads     139.3 ms
   4 threads     134.1 ms
   8 threads     137.8 ms
  16 threads     141.1 ms

</TerminalBlock>

Sixteen threads is exactly as fast as one thread. Not slower in any meaningful way, and certainly not faster.

This is a real measurement from the machine that built this page, and it is worth sitting with, because it is the cleanest possible statement of the lesson's first point. The threads were created. The operating system scheduled them. They ran. And the total time did not budge, because **there was only ever one core to run them on**. Sixteen threads on one core is one core's worth of work, divided into sixteen pieces and interleaved.

An OS thread is a *request* to run something. A core is the *capacity* to run it. Creating more requests does not create more capacity — the scheduler simply takes turns, and the work takes exactly as long as it always did, plus a small amount for the switching.

<Note>

Notice what the benchmark deliberately measured: **arithmetic**, with no waiting in it at all. That is the case where threads cannot help a single core, and the result is flat.

Change the workload to something that waits — a program fetching twenty web pages, say — and the same sixteen threads on the same one core would be dramatically faster than one thread, because now there are gaps to fill. That is the barista, and it is why "will threads help?" cannot be answered without knowing what the program is waiting for.

The rest of this lesson is about the other half of the question: what happens when you do have several cores, and what a processor does when it only has one but would like to pretend otherwise.

</Note>

## Why a core sits idle {/*why-a-core-sits-idle*/}

Now back to the 1995 measurement, because it sets up everything that follows.

A modern core is **superscalar**: it has several execution units and can start multiple instructions in the same cycle. Call the number of instructions it can begin per cycle its *issue width* — four is typical, and some designs go wider. Draw those slots as a grid, one row per cycle, and ask what fraction actually gets filled:

<Diagram name="multicore/issue_slots" height={470} width={720} alt="A diagram titled 'the problem SMT was invented to fix', with the note that a wide core can issue four instructions per cycle. Two grids sit side by side, each eight rows of four slots. The left grid, labelled 'one thread', has many slots drawn as empty dashed outlines and only nine of thirty-two filled in blue, annotated 'gaps everywhere: stalls on cache'. The right grid, labelled 'two threads sharing the core', has the same nine blue slots plus sixteen more filled in a second lighter blue, twenty-five of thirty-two in total, annotated 'the second thread fills them'. A caption reads: the 1995 SMT paper measured this — even an 8-issue core could not sustain 1.5 instructions per cycle.">

Left: what one thread manages. Right: the same core, with somebody else's work poured into the gaps.

</Diagram>

Look at the left grid. Two kinds of waste are visible, and both are ordinary:

- **Some cycles are partly used.** The core could have started four instructions but only found one or two that were ready — the rest depended on results not yet available.
- **Some cycles are entirely empty.** The core found *nothing* it could start, because it is waiting on a cache miss or recovering from a mispredicted branch.

This is not a badly written program. It is what normal code does. Dependencies and memory latency mean a single instruction stream simply does not contain four independent instructions in every cycle, and no amount of pipelining or prediction manufactures work that is not there. This is the **ILP wall** from the last lesson, seen from inside the core.

Now look at the right grid. Same core, same execution units, no new hardware to do arithmetic — but a *second* instruction stream is available, and its instructions do not depend on the first stream's results at all. When thread A stalls, thread B has something ready.

That is **simultaneous multithreading**, or **SMT**. Intel's marketing name for it is **Hyper-Threading**.

## What SMT actually duplicates {/*what-smt-actually-duplicates*/}

Here is the crucial engineering detail, and the source of every realistic expectation about SMT:

<Diagram name="multicore/smt_duplicated_shared" height={420} width={720} alt="A diagram titled 'what gets copied, and what gets shared', showing one large outlined box labelled 'one physical core'. Inside it, two blue-tinted boxes at the top are labelled 'logical processor 1' and 'logical processor 2', each noting 'own registers, own PC, own flags' and 'the OS sees a whole CPU here', with the caption 'duplicated — cheap, only a few thousand transistors'. Below them, four red-tinted boxes read: ALUs and the FPU, L1 and L2 cache, branch predictor, and the pipeline itself, with the caption 'shared — and this is where the fighting happens'. Two captions below read: SMT does not add an execution engine, it adds a second place to stand while waiting for one; and: that is why two logical processors are nothing like two cores.">

A few thousand transistors of duplication, and everything expensive left shared.

</Diagram>

What gets duplicated is **architectural state**: the register file, the program counter, the flags — everything needed to keep a second job's place in the world. In transistor terms this is nearly free, a few thousand transistors against a core's hundreds of millions. That is what made SMT so attractive: Intel reportedly added it to the Pentium 4 for something in the region of 5% extra die area.

What does **not** get duplicated is everything that does the actual work: the arithmetic units, the caches, the branch predictor, the pipeline itself. Those are shared, cycle by cycle, between the two logical processors.

So the honest one-sentence description is: **SMT does not add an engine; it adds a second place to stand while waiting for the engine.** Two logical processors on one core are emphatically not two cores. They are one core that is better at not being idle.

## When it helps, and when it hurts {/*when-it-helps-and-when-it-hurts*/}

Because the execution units are shared, whether SMT helps depends entirely on whether the two threads want *different* things at *different* times:

<DiagramGroup>

<Diagram name="multicore/smt_helps" height={360} width={340} alt="A panel titled 'when SMT wins', subtitled 'the two jobs need different things'. Two boxes describe thread A in blue as 'waiting on memory, often stalled' and thread B in lighter blue as 'pure arithmetic, uses the ALUs'. A verdict box below reads 'up to about +30%' with the explanation 'B works in the gaps A leaves behind'.">

Complementary workloads. One stalls, the other computes.

</Diagram>

<Diagram name="multicore/smt_hurts" height={360} width={340} alt="A panel titled 'when SMT loses', subtitled 'the two jobs want the same thing'. Two red boxes describe thread A as 'streaming a large array through L1' and thread B as 'streaming a different large array'. A verdict box below reads 'measured as low as 0.90×' with the explanation 'they evict each other's cache lines'.">

Competing workloads. Each halves the other's cache.

</Diagram>

</DiagramGroup>

The numbers here are not hand-waving; SMT has been measured carefully many times. A 2004 study from Cambridge ran pairs of benchmarks on a Hyper-Threaded Pentium 4 and found a **mean speedup of about 1.20** across many pairings — with the best pair reaching about **1.50** and the worst pair coming in at **0.90**, meaning the two threads together got *less* done than running them one after the other.

That last figure is the one worth remembering. SMT is not a guaranteed win. It is a bet that two jobs will fit together, and the bet can lose.

The same study measured two real cores on the same workloads and got a mean speedup of **1.77** — much closer to the 2× you would hope for. Which is exactly what the previous section predicts: two cores have two of everything, and two logical processors have one of most things.

<Note>

SMT is common but not universal, and that tells you something. IBM's POWER processors go much further — offering two, four or even eight threads per core — because they are aimed at server workloads full of memory stalls, precisely where the gaps are largest.

Apple's M-series chips, on the other hand, have **no SMT at all**. Their design instead uses very wide cores plus a mix of performance and efficiency cores. That is a legitimate alternative reading of the same trade-off: if you can build a core wide enough and a memory system good enough, you may prefer to spend the area on more real cores than on making one core better at waiting.

</Note>

## What your machine is really telling you {/*what-your-machine-is-really-telling-you*/}

All of which explains a number that confuses people constantly:

<Diagram name="multicore/os_topology" height={400} width={720} alt="A diagram titled 'why your machine reports more CPUs than it has'. The upper box, labelled 'the silicon: 4 physical cores', contains four red boxes labelled core 0 to core 3, each holding two smaller blue boxes labelled LP0 through LP7. An arrow leads down to a lower blue box labelled 'what the operating system reports: 8 processors', containing eight small boxes labelled cpu0 through cpu7. Captions read: both numbers are honest — 8 places to queue work, 4 engines to do it; and, in red: cpu0 and cpu1 are siblings, they are the same core, and they compete.">

Eight names for four engines. Both counts are correct; only one of them can do arithmetic.

</Diagram>

Your operating system reports **logical processors**, because those are what it can schedule onto. A four-core chip with SMT presents eight of them, and every tool that counts CPUs — task managers, `nproc`, `os.cpu_count()`, `navigator.hardwareConcurrency` — will tell you eight.

Both numbers are true. There are eight queues and four engines.

You can see the real structure directly. On Linux, `lscpu` separates the two ideas:

<TerminalBlock>

lscpu | grep -E 'CPU\(s\)|Thread|Core|Socket|L1d|L2|L3'

CPU(s):                    1
Thread(s) per core:        1
Core(s) per socket:        1
Socket(s):                 1
L1d cache:                 32 KiB
L2 cache:                  1 MiB
L3 cache:                  33 MiB

</TerminalBlock>

That is the actual machine that generated this page — a cloud container with a single core and no SMT, which is why the sixteen-thread benchmark earlier went nowhere. On a laptop with four SMT-enabled cores the same command would report `CPU(s): 8`, `Thread(s) per core: 2`, `Core(s) per socket: 4`.

Multiply the last three lines and you get the first:

```
 CPU(s) = Thread(s) per core × Core(s) per socket × Socket(s)

 a typical laptop:      2 × 4 × 1  =  8
 a two-socket server:   2 × 32 × 2 = 128
 this container:        1 × 1 × 1  =  1
```

There is one more thing worth knowing how to find: **which logical processors are siblings**, sharing a core. Linux exposes it per CPU:

<TerminalBlock>

cat /sys/devices/system/cpu/cpu0/topology/thread_siblings_list

0,4

</TerminalBlock>

On a machine that answers `0,4`, logical CPUs 0 and 4 are the same physical core. That matters if you ever pin work to specific CPUs: putting two demanding threads on `0` and `4` puts them in the same engine, competing, while `0` and `1` might be genuinely separate cores. Getting this backwards is a classic and invisible performance bug.

## What the siblings share {/*what-the-siblings-share*/}

Since SMT siblings share caches, it is worth laying out the whole hierarchy — because the sharing goes further than most people assume:

<Diagram name="multicore/cache_sharing" height={400} width={720} alt="A diagram titled 'what is yours, and what you are sharing'. Four boxes represent core 0 to core 3; each contains two small blue boxes labelled LP0/LP1 through LP6/LP7, plus two red bars labelled 'L1 shared by both' and 'L2 shared by both'. Below all four cores, a wide blue bar reads 'L3, shared by every core on the chip', and beneath that a grey bar reads 'main memory, one bus, shared by everything'. Captions read: two logical processors on one core share even their L1, which is why a memory-hungry pair can evict each other's data and end up slower than running one at a time.">

Sharing does not stop at the core boundary — it goes all the way out to the memory bus.

</Diagram>

Reading from the inside out:

- **L1 and L2** belong to a core, and SMT siblings share them. Two threads on one core are drawing from the same small pool — a 32 KiB L1 becomes 16 KiB each if they both want all of it.
- **L3** is shared by every core on the chip. Four busy cores are competing here even when they are otherwise independent.
- **Main memory** is one bus. Eight cores do not get eight times the bandwidth; they queue.

This is why "add more threads" has a ceiling that has nothing to do with Amdahl's law. Even a perfectly parallel program with zero serial section will stop scaling once it saturates memory bandwidth, because the thing it is waiting for is shared by everyone.

## Not all cores are equal any more {/*not-all-cores-are-equal-any-more*/}

One more complication, and it is recent. For most of multicore's history every core on a chip was identical. That is no longer true.

<Diagram name="multicore/hybrid_cores" height={380} width={720} alt="A diagram titled 'not all cores are the same any more'. On the left, a red panel headed 'performance cores' contains four larger boxes labelled P0 to P3, noted as 'big, deep, power-hungry — for the task you are waiting on'. On the right, a blue panel headed 'efficiency cores' contains eight smaller boxes labelled E0 to E7, noted as 'small, simple, sip power — for everything in the background'. Captions read: if most of the chip has to stay dark, you want the option of lighting the cheap thing; and now the scheduler has a genuinely hard question: which kind of core does this thread deserve; and: four cores stopped being a useful description of a processor.">

Two kinds of core on one chip, and a scheduling problem that did not exist ten years ago.

</Diagram>

This follows directly from last lesson's dark silicon problem. If you cannot power the whole chip anyway, you gain by having **different kinds** of core: a few large ones for work the user is waiting on, and several small efficient ones for background work where latency does not matter.

ARM shipped this idea first as **big.LITTLE** in 2011, mobile chips have used it for over a decade, Apple's M1 (2020) pairs four performance cores with four efficiency cores, and Intel brought it to desktops with Alder Lake in 2021.

The consequence is that a modern core count is almost uninformative on its own. A chip advertising "12 cores" might be 4 performance cores with SMT (8 logical) plus 8 efficiency cores without it (8 logical) — sixteen logical processors, of two quite different kinds, and the ones that are fast are outnumbered by the ones that are not. Which core a thread lands on can change its speed by a factor of two or more, and deciding that has become one of the hardest jobs an operating system scheduler does.

<DeepDive>

#### The bug where two variables collide {/*the-bug-where-two-variables-collide*/}

There is a performance bug that is invisible in source code, comes from cache sharing, and is common enough to be worth recognising on sight.

Caches do not move individual bytes. They move fixed-size blocks called **cache lines**, and on essentially every current processor a line is **64 bytes** — a figure you can confirm on any Linux machine:

<TerminalBlock>

getconf LEVEL1_DCACHE_LINESIZE

64

</TerminalBlock>

Now consider a very ordinary piece of code. Several threads each keep their own counter, and the counters live in an array:

```c
long counters[8];        // 8 × 8 bytes = 64 bytes: ONE cache line

void *worker(void *arg) {
    int id = *(int *)arg;
    for (long i = 0; i < 100000000; i++)
        counters[id]++;          // each thread touches only its own slot
}
```

Read it as a programmer and it is flawless: no shared variable, no lock needed, no data race. Each thread writes only to its own element.

Read it as a cache and it is a disaster. All eight counters sit in **one 64-byte line**, and a cache line is the smallest unit of ownership the hardware has. When thread 0 writes `counters[0]`, the coherence protocol must give its core exclusive ownership of that line — which means taking it away from every other core. Thread 1 then writes `counters[1]`, and the line has to travel back. Eight threads on eight cores spend their time passing a single cache line between them, thousands of times, and the counters are along for the ride.

This is called **false sharing**: no variable is genuinely shared, but the hardware cannot tell, because it tracks lines and not variables. The fix is to stop the counters sharing a line, by padding each one out to a full 64 bytes:

```c
struct padded { long value; char pad[56]; };   // 8 + 56 = 64
struct padded counters[8];                     // now one line each
```

Same logic, same instruction count, and often several times faster on a multi-core machine. (The container that produced this page has one core, so it cannot demonstrate the effect — false sharing needs genuinely simultaneous writers to appear. On any multi-core laptop it is dramatic, and worth trying.)

The transferable point is the one this module keeps making from different angles: **the hardware's unit of work is not the same as your program's unit of meaning.** Bytes have no meaning without a contract; cache lines have no idea which of your variables they contain.

</DeepDive>

<DeepDive>

#### The security bill for sharing {/*the-security-bill-for-sharing*/}

Two logical processors sharing physical resources creates a subtler problem than performance: they can *observe* each other.

The mechanism is the same shape as Spectre from the last lesson. If two threads share an execution unit, then thread A's use of that unit slows thread B down by a measurable amount. If they share a cache, then A's evictions change B's timings. Neither thread can *read* the other's data directly — but timing is data, and a patient attacker can reconstruct secrets from it.

This is not theoretical. A series of side-channel attacks against SMT appeared in 2018 and after, exploiting contention on execution ports and on shared address-translation caches. And unlike Spectre, the affected threads may belong to completely different programs, or different users, or different virtual machines on a cloud host that happened to schedule them onto sibling logical processors.

The responses have been notably blunt. **OpenBSD disabled SMT by default in 2018**, on the grounds that the security properties could not be reasoned about. Various security-sensitive deployments and some cloud configurations do the same, accepting the performance loss. Others keep SMT but add scheduler rules ensuring that sibling logical processors are never given to different security domains at the same time — so a core is either running one tenant's work or nobody's.

There is a general principle worth extracting, because it will keep recurring as you go deeper into systems: **shared resources leak.** Any time two parties are made faster by sharing a physical thing, the sharing is potentially observable, and the observation is potentially a channel. Performance engineering and isolation pull in opposite directions, and every clever sharing mechanism eventually gets audited on those grounds.

</DeepDive>

<Pitfall>

**"One thread per CPU" is a starting guess, not an answer.**

The most common way to choose a thread count is to call whatever function reports the number of processors and use that. It is a reasonable default, and it is wrong often enough to be worth understanding.

Three problems with it:

**The number it returns counts logical processors, not cores.** On an SMT machine that means you are creating eight compute-heavy threads for four engines. For workloads with lots of memory stalls that is fine and even good. For dense arithmetic — the kind that keeps execution units genuinely busy — the extra threads mostly contend, and you may do better with one per *physical core*. This is why serious numerical libraries make it configurable and often default to physical cores.

**It ignores what the threads are waiting for.** If your threads spend most of their time blocked on network or disk, the CPU count is nearly irrelevant — you want enough threads to cover the waiting, which might be hundreds, and which is the reason async runtimes exist. If they spend all their time computing, more threads than cores buys nothing but scheduling overhead, exactly as the sixteen-thread benchmark showed.

**On a shared machine it is a lie.** In a container with a CPU limit, or on a busy server, the number of processors your process *can see* is often not the number it is *allowed to use*. A JVM or Go runtime that sizes its thread pool from the host's CPU count inside a container limited to two cores will create wildly too many threads — a well-known and expensive class of production problem.

The correction is unglamorous: **decide from the workload, then measure the scaling curve.** Run your actual job at 1, 2, 4, 8 threads and look at where the line flattens. That curve tells you the parallel fraction, the contention point and the right thread count all at once, and it takes minutes.

</Pitfall>

## Try the topology yourself {/*try-the-topology-yourself*/}

Set up a machine and a workload, and see what you actually get. Choose how many physical cores the chip has, whether SMT is enabled, what kind of work the threads do, and how many threads you create.

Two experiments are worth running. Set 4 cores with SMT on, pick **dense arithmetic**, and walk the thread count from 1 to 16 — watch the gain flatten hard past 4. Then switch to **memory-stalling** work and run it again: now the logical processors earn their keep, because there are gaps to fill.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const T2 = '#5aa9c4';

// how much a second thread on the SAME core contributes, by workload type
const WORKLOADS = [
  ['dense arithmetic', 0.05, 'execution units already busy — a sibling has nothing to fill'],
  ['mixed application code', 0.28, 'the classic case: some stalls, some work'],
  ['memory-stalling', 0.45, 'lots of waiting, so a sibling has plenty of gaps'],
  ['cache-thrashing', -0.12, 'the pair evicts each other — worse than running alone'],
];

export default function TopologyLab() {
  const [cores, setCores] = useState(4);
  const [smt, setSmt] = useState(true);
  const [work, setWork] = useState(1);
  const [threads, setThreads] = useState(4);

  const logical = cores * (smt ? 2 : 1);
  const [wName, smtGain, wNote] = WORKLOADS[work];

  // simplified model: threads up to `cores` each get a whole core;
  // threads beyond that pair onto busy cores and contribute smtGain;
  // threads beyond `logical` just timeshare and add nothing.
  const active = Math.min(threads, logical);
  const onOwnCore = Math.min(active, cores);
  const paired = Math.max(0, active - cores);
  const throughput = onOwnCore + paired * smtGain;
  const perThread = throughput / threads;
  const oversubscribed = threads > logical;

  const ideal = threads;
  const bar = (n, col, label) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
      <span style={{ width: 132, fontSize: 12, color: '#888' }}>{label}</span>
      <div style={{ flex: 1, height: 22, background: '#8881', borderRadius: 5 }}>
        <div style={{
          width: `${Math.min(100, (n / 16) * 100)}%`, height: '100%',
          background: `${col}55`, borderRadius: 5,
        }} />
      </div>
      <span style={{ width: 62, textAlign: 'right', fontFamily: 'monospace', fontSize: 13 }}>
        {n.toFixed(2)}×
      </span>
    </div>
  );

  const pick = (label, on, onClick) => (
    <button onClick={onClick} style={{
      margin: 2, padding: '3px 10px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
      fontFamily: 'monospace',
      border: `2px solid ${on ? ACC : '#888'}`,
      background: on ? `${ACC}1e` : 'transparent',
      color: on ? ACC : 'inherit', fontWeight: on ? 'bold' : 'normal',
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ display: 'inline-block', width: 120, fontSize: 13, color: '#888' }}>
          physical cores
        </span>
        {[1, 2, 4, 8].map((c) => pick(String(c), cores === c, () => setCores(c)))}
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ display: 'inline-block', width: 120, fontSize: 13, color: '#888' }}>
          SMT
        </span>
        {pick('on', smt, () => setSmt(true))}
        {pick('off', !smt, () => setSmt(false))}
        <span style={{ marginLeft: 10, fontSize: 12, color: '#888' }}>
          → the OS will report <b style={{ fontFamily: 'monospace' }}>{logical}</b> processors
        </span>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ display: 'inline-block', width: 120, fontSize: 13, color: '#888' }}>
          workload
        </span>
        {WORKLOADS.map(([n], i) => pick(n, work === i, () => setWork(i)))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <span style={{ display: 'inline-block', width: 120, fontSize: 13, color: '#888' }}>
          threads created
        </span>
        {[1, 2, 4, 8, 16].map((t) => pick(String(t), threads === t, () => setThreads(t)))}
      </div>

      {/* the machine */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {Array.from({ length: cores }, (_, c) => {
          const slots = smt ? 2 : 1;
          return (
            <div key={c} style={{
              border: `2px solid ${DNG}`, background: `${DNG}10`,
              borderRadius: 9, padding: '5px 7px',
            }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>core {c}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: slots }, (_, k) => {
                  const lp = c + k * cores;           // first pass fills own cores
                  const filled = lp < active;
                  const isPaired = k === 1 && filled;
                  return (
                    <div key={k} style={{
                      width: 44, height: 38, borderRadius: 6, fontSize: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${filled ? (isPaired ? T2 : ACC) : '#888'}`,
                      background: filled ? (isPaired ? `${T2}28` : `${ACC}28`) : 'transparent',
                      color: filled ? 'inherit' : '#888',
                    }}>{filled ? `T${lp}` : 'idle'}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {bar(ideal, '#888', 'if it scaled perfectly')}
      {bar(Math.max(throughput, 0), throughput >= cores ? ACC : DNG, 'what you actually get')}

      <div style={{
        marginTop: 10, padding: '10px 14px', borderRadius: 10,
        border: `2px solid ${throughput >= cores * 0.95 ? ACC : DNG}`,
        background: throughput >= cores * 0.95 ? `${ACC}14` : `${DNG}14`,
      }}>
        <b style={{ color: throughput >= cores * 0.95 ? ACC : DNG }}>
          {throughput.toFixed(2)}× throughput from {threads} thread{threads > 1 ? 's' : ''}
          {' '}on {cores} core{cores > 1 ? 's' : ''}
        </b>
        <div style={{ fontSize: 13, marginTop: 5, color: '#888' }}>
          {oversubscribed
            ? `${threads - logical} thread${threads - logical > 1 ? 's have' : ' has'} nowhere to run — they timeshare, adding scheduling overhead and no work.`
            : paired > 0
              ? `${paired} thread${paired > 1 ? 's are' : ' is'} sharing a core with a sibling. ${wNote}.`
              : 'Every thread has a core to itself — the best case there is.'}
        </div>
        <div style={{ fontSize: 13, marginTop: 5 }}>
          efficiency per thread:{' '}
          <b style={{ fontFamily: 'monospace', color: perThread < 0.5 ? DNG : ACC }}>
            {(perThread * 100).toFixed(0)}%
          </b>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: '#888', marginTop: 10 }}>
        Simplified model. The SMT contribution per paired thread is set by the
        workload type: {(smtGain * 100).toFixed(0)}% for {wName}. Real gains
        depend on the specific code, and the cache-thrashing case really can go
        negative.
      </p>
    </div>
  );
}
```

</Sandpack>

Notice the shape of what the toy shows. Going from 1 thread to `cores` threads is close to linear — that is real parallelism, real engines. Going from `cores` to `logical` gives you a fraction that depends entirely on the workload, from about half a core's worth down to *negative*. And going past `logical` gives you nothing at all, which is the sixteen-thread benchmark from the start of the lesson, generalised.

<Recap>

- **Core**, **hardware thread** (logical processor) and **OS thread** are three different things. Only a core does work; the other two are ways of organising access to it.
- **Threads do not create parallelism.** Measured on a real one-core machine, splitting fixed CPU-bound work across 1 to 16 threads took the same 134–141 ms every time. Threads help with *waiting* (concurrency), not with *doing* (parallelism).
- A wide core is idle a lot: the 1995 SMT paper found that even an **8-issue** design could not sustain **1.5 instructions per cycle**, because dependencies and cache misses leave issue slots empty.
- **SMT** (Intel's Hyper-Threading, announced 2001, shipped 2002) duplicates **architectural state** — registers, PC, flags — for a few percent of die area, while **sharing** the ALUs, caches, branch predictor and pipeline. It adds a second place to wait, not a second engine.
- Gains depend entirely on whether the two threads want different resources: measured means around **1.20×**, best pairings near **1.50×**, and worst pairings **0.90×** — genuinely slower than running the jobs one after another.
- Your OS reports **logical processors**: `CPU(s) = threads-per-core × cores-per-socket × sockets`. Sibling logical CPUs share a core and compete; `thread_siblings_list` tells you which.
- Sharing runs deep: SMT siblings share **L1 and L2**, all cores share **L3**, and everything shares one **memory bus** — so even a perfectly parallel program stops scaling when bandwidth saturates.
- **False sharing** is the invisible version of this: cache lines are 64 bytes, so independent variables in the same line ping-pong between cores. Padding to a line fixes it with no logical change.
- Cores are no longer identical. **Performance and efficiency cores** (ARM big.LITTLE 2011, Apple M1 2020, Intel Alder Lake 2021) mean a core count alone barely describes a chip, and which core a thread lands on can change its speed by a factor of two.
- Shared resources leak: SMT siblings can observe each other through timing, which is why **OpenBSD disabled SMT by default in 2018** and why some deployments still turn it off.

</Recap>

<Challenges>

#### Read the topology {/*read-the-topology*/}

A server reports the following. (a) How many physical cores does it have? (b) How many logical processors? (c) You need to run 32 threads of dense floating-point arithmetic. How many would you actually start, and why?

```
 CPU(s):                 64
 Thread(s) per core:     2
 Core(s) per socket:     16
 Socket(s):              2
```

<Hint>

Multiply the last three lines together and check it matches the first. Then ask which of the two numbers — cores or logical processors — corresponds to something that can actually execute arithmetic.

</Hint>

<Solution>

**(a) Physical cores:**

```
 cores per socket × sockets = 16 × 2 = 32 physical cores
```

**(b) Logical processors:**

```
 threads per core × cores per socket × sockets = 2 × 16 × 2 = 64
```

Which matches the reported `CPU(s): 64` ✓. Sixty-four queues, thirty-two engines.

**(c) How many threads to start: 32, not 64.**

The workload is dense floating-point arithmetic, which means it keeps the execution units genuinely busy — there are very few stalls, so very few gaps for an SMT sibling to fill. Pairing two such threads on one core makes them compete for the same FPU and the same L1, and the realistic gain is close to zero and can be negative.

So one thread per **physical** core is the right starting point, and it is why numerical libraries (BLAS implementations, for instance) commonly default to physical core count rather than to whatever the OS reports.

Two caveats worth stating in a real answer:

- **This is a starting point, not a verdict.** Run the job at 32 and at 64 and compare. It takes minutes and settles the argument.
- **Two sockets means NUMA.** On a multi-socket machine, memory is attached to sockets, and a thread reading memory belonging to the *other* socket pays a significant latency penalty. Thread placement matters here beyond just counting — which is a topic the next lessons on memory will make sense of.

</Solution>

#### Predict the SMT result {/*predict-the-smt-result*/}

For each pair of workloads sharing one SMT-enabled core, predict whether enabling SMT helps a lot, helps a little, or hurts — and say why in one sentence.

**(a)** A web server handling requests (lots of waiting on network and database) + a background log compressor.
**(b)** Two threads each multiplying large dense matrices.
**(c)** Two threads each scanning a different 100 MB array from start to finish.
**(d)** A single-threaded program, alone on the machine.

<Solution>

**(a) Helps a lot.** The web server thread spends most of its time blocked or stalled on memory, leaving the execution units idle; the compressor is compute-heavy and has work ready whenever a slot opens. This is the complementary case SMT was designed for, and the gain can approach the upper end of the measured range.

**(b) Helps very little, possibly hurts.** Dense matrix multiplication is written specifically to keep the floating-point units saturated and its working set inside cache. There are almost no idle slots for a sibling to use, so the second thread mostly queues behind the first for the same FPU, and it halves the effective cache each thread gets. This is the case where tuned numerical libraries deliberately use one thread per physical core.

**(c) Hurts.** Neither thread's data fits in L1 or L2, both are streaming continuously, and they share those caches — so each one evicts the other's lines before they can be reused, converting cache hits into misses. This is the **0.90×** case from the Cambridge measurements: the pair together achieves less than running them sequentially would.

**(d) No effect at all.** SMT only does something when there are two runnable threads on the core. One thread on an SMT core behaves exactly like one thread on a non-SMT core — which is also why SMT never *reduces* single-threaded performance, and why it was such an easy feature to ship.

The pattern across all four: **SMT converts one thread's idle time into another thread's work.** If there is no idle time, there is nothing to convert; if the two threads' idle time comes from fighting each other, you have made things worse.

</Solution>

#### The container that lied {/*the-container-that-lied*/}

Transfer task. A service is deployed in a container limited to **2 CPUs**, on a host machine with 64 logical processors. It runs on a runtime that sizes its worker pool from the number of processors it detects. Under load, the team observes: very high context-switch counts, latency that gets *worse* as traffic increases, memory usage far above expectations, and CPU utilisation that never reaches the container's limit.

Explain what is almost certainly happening, why each symptom follows, and what you would change.

<Solution>

**What is happening.** The runtime asked the operating system how many processors there are and was told **64** — the host's count, not the container's limit. So it created a worker pool sized for 64 processors, along with whatever per-worker structures it allocates. The container's scheduler, however, will only ever let those workers accumulate **2 CPUs' worth** of runtime. The result is dozens of runnable threads sharing two cores' worth of capacity.

**Why each symptom follows:**

- **High context-switch counts.** Far more runnable threads than available CPUs means the scheduler must constantly rotate them. Each switch saves and restores register state and disturbs the cache — pure overhead that produces no work, exactly the effect the sixteen-thread benchmark in this lesson isolated.
- **Latency worsening under load.** With many workers competing, any individual request waits behind more others, and each one is switched away from mid-flight. Queueing plus switching means the *tail* latency degrades much faster than the average.
- **Memory above expectations.** Every thread needs a stack (often a megabyte or more of reserved address space) plus runtime bookkeeping. Sizing for 64 processors instead of 2 multiplies that cost by more than thirty.
- **Utilisation never hitting the limit.** Time spent switching contexts and thrashing cache is time not spent executing the application, so the useful work plateaus below what the two CPUs could deliver.

**What I would change:**

1. **Tell the runtime the truth.** Most runtimes have an explicit setting for this — a thread-pool size, a worker count, or a "container-aware" mode that reads the container's CPU limit rather than the host's processor count. Set it explicitly to match the limit rather than relying on detection.
2. **Prefer detection that respects limits.** Where available, read the container's own quota rather than the host's CPU count. Modern runtimes increasingly do this by default; older ones do not, and the version matters.
3. **Then size from the workload.** Two CPUs is the compute ceiling, but if the service spends most of its time waiting on databases and network calls, the right *concurrency* may still be much higher than 2 — that waiting is what threads or async tasks are good at covering. The correct answer is likely "a small number of workers, each handling many concurrent requests," rather than "a worker per request."
4. **Measure the curve.** Load-test at several pool sizes and find where latency stops improving. That number is the answer; everything above is reasoning about where to start looking.

The transferable habit, and the one this lesson exists to install: **the number of processors a program can see is not the number it is allowed to use, and neither of them is the number of threads it should create.** ✓

</Solution>

</Challenges>

<LearnMore title="CPU Cache: L1, L2, L3" path="/learn/faza-0/modul-0-3/cpu-cache">

Cache has now come up in every lesson of this module and been deferred every time: the memory ladder where a register is one cycle and RAM is two hundred, the fetch stage that sometimes waits, the sorted-array benchmark, the SMT siblings evicting each other, false sharing. Next lesson it finally gets the whole stage — how a cache decides what to keep, what a cache line really is, why looping over a two-dimensional array in the wrong order can be an order of magnitude slower, and why understanding this one topic changes more real-world program performance than anything else in this phase.

</LearnMore>
