---
title: "Memory Hierarchy"
---

<Intro>

In September 1956, IBM announced a machine called the 305 RAMAC, and inside it was something no computer had ever had before: a disk you could read from at random, without winding through a tape to get there. The IBM 350 Disk Storage Unit held **five million characters**. It contained fifty spinning platters, each two feet across, weighed about a ton, and cost roughly **$3,200 a month to rent** — real money in 1956. Finding a piece of data on it took, on average, about **six tenths of a second**. Now consider the machine that generated this page. Its **L3 cache** — a component so minor it does not appear in any advertisement, sitting on the processor itself — holds **33 megabytes**. That is more than six times the entire capacity of IBM's ton of spinning steel, and it answers in **28 nanoseconds**: about twenty million times faster. The cache is not a small helper anymore. It is larger and unimaginably quicker than what an entire disk drive used to be. This lesson is about the full stack of places a computer keeps data — from that cache all the way down to a server on another continent — and about the one question every layer is answering.

</Intro>

<YouWillLearn>

- Every place a computer can store a byte, from registers to the far side of the internet
- The three-way trade — **fast**, **big**, **cheap** — and why no technology has ever offered all three
- What the latencies actually feel like, on a scale a human can hold in their head
- Why it is called a **hierarchy** and not a list: every level is a cache for the level below it
- The **page cache** — the operating system's own cache, measured here at **65× faster** than the SSD it hides
- Where a running program's data really is, and why nothing in your source code says so

</YouWillLearn>

<InlineToc />

## One question, asked over and over {/*one-question-asked-over-and-over*/}

Every storage technology ever built has been an answer to the same question: **where should this byte live?**

And every answer has been a compromise, because three things you want are in permanent conflict:

<Diagram name="memory-hierarchy/three_tradeoffs" height={400} width={720} alt="A diagram titled 'you may pick two', showing three panels across the top: 'fast' in blue (answers in nanoseconds, sits next to the core), 'big' in dark (holds terabytes, fits your whole dataset), and 'cheap' in red (pennies per gigabyte, you can afford lots of it). Below them, four rows compare technologies: registers and cache are fast, small and very expensive; main memory is quick, medium and expensive; SSD is slow, large and cheap; hard disk is very slow, huge and very cheap. A caption reads: no technology is all three, so a computer uses all of them at once.">

Three things you want, and a list of technologies each of which gives you two.

</Diagram>

**Fast** storage has to be physically close to the processor and built from expensive circuitry — which means there cannot be much of it. **Big** storage has to be cheap per byte to be affordable at all, and cheap-per-byte technologies are slow. There is no material that is simultaneously quick to access, dense enough to hold terabytes, and cheap enough to buy in quantity.

Engineers could have picked one and lived with it. Instead they did something cleverer: **use all of them at once**, arranged so that the fast expensive stuff holds whatever is being used right now, and the slow cheap stuff holds everything else.

That arrangement is the **memory hierarchy**, and it is the single most important structural fact about how computers are built.

## The whole ladder {/*the-whole-ladder*/}

Here is every rung, from the top of the processor to the other side of the world:

<Diagram name="memory-hierarchy/the_ladder" height={546} width={720} alt="A diagram titled 'everywhere a computer can keep a byte', with the note that wider means it holds more and further down means it answers slower. Eight horizontal bars of increasing width run down the figure, each labelled with a name, a capacity and a latency: registers, about 1 KB, 0.4 ns; L1 cache, 32 KB, 1.5 ns; L2 cache, 1 MB, 4.1 ns; L3 cache, 33 MB, 28 ns; main memory, 16 GB, 156 ns; SSD, 1 TB, 74 microseconds; hard disk, 8 TB, 10 ms; another city, no limit, 14 ms. The top four bars are blue, main memory is dark, and the bottom three are red. An arrow down the right side is labelled 'slower'. Captions read: top to bottom, about 34 million times slower and about a billion times bigger.">

One continuous ladder. A computer does not choose a rung — it uses all of them at once.

</Diagram>

Read that as one continuous ladder rather than separate technologies, because that is how a computer treats it. Going down each rung, three things happen together: it holds **more**, it costs **less per byte**, and it answers **more slowly**.

A short tour, since some of these rungs have not appeared yet in this course:

- **Registers** — the handful of slots inside the core itself, from the CPU anatomy lesson. Perhaps a kilobyte in total, and available in a single cycle.
- **L1, L2, L3 cache** — the subject of the last lesson. Small, fast, automatic, invisible.
- **Main memory (RAM)** — the gigabytes you buy when you buy "memory". This is where your program's variables, objects and data structures actually live. The next lesson opens it up.
- **SSD** — a solid-state drive. Flash memory, no moving parts, and it *keeps its contents when the power goes off*, which none of the levels above it do.
- **Hard disk** — physically spinning magnetic platters, with a head that has to move to the right track. Slower by a factor of a hundred, cheaper by a factor of five, and still where most of the world's data sits.
- **Another machine** — over a network. This is a real rung of the hierarchy, not an afterthought: a modern application reads from caches, databases and services on other computers constantly.

The span from top to bottom is worth stating plainly: about **34 million times** in speed, and about **a billion times** in capacity. Those two facts, and the tension between them, generate nearly every performance decision in computing.

## What those numbers feel like {/*what-those-numbers-feel-like*/}

Nanoseconds and milliseconds are both "small", which makes it very easy to underestimate the distance between them. So here is the standard trick for making the ladder intuitive: **pretend one CPU cycle takes one second**, and scale everything else to match.

<Diagram name="memory-hierarchy/human_scale" height={506} width={720} alt="A diagram titled 'the same ladder, in units a person can feel', with the premise 'suppose one CPU cycle took one second, then'. Eight rows list a level on the left and a human-scale duration on the right: one CPU cycle, 1 second; L1 cache, 4 seconds; L2 cache, 11 seconds; L3 cache, just over a minute; main memory, 7 minutes; SSD random read, 2 days; hard disk seek, 11 months; a server on another continent, 13 years. The top four rows are blue, main memory is dark, and the bottom three are red. Captions read: a cache miss is a coffee break, a disk seek is a season, a request across the world is a career.">

The same figures, rescaled until a person can feel them.

</Diagram>

Sit with that table for a moment, because it reframes everything.

If reaching into a register is **one second**, then going to main memory is a **seven-minute** errand. Reading a random block from an SSD is a **two-day** trip. Waiting on a hard disk seek is **most of a year**. And asking a server on the other side of the planet is a **thirteen-year** expedition.

Now recall what a processor does while it waits: nothing. This is why so many programs are slow for reasons that have nothing to do with their algorithms. A function doing a few thousand arithmetic operations and one database query spends essentially all of its time on the query — and no amount of optimising the arithmetic will matter.

**The practical rule that follows is worth memorising:** when something is slow, first ask *how far away is the data*, and only then ask *how much work is being done to it*.

## The measured spectrum {/*the-measured-spectrum*/}

Everything above is a claim. Here it is as a measurement — every point on this line was timed on the machine that produced this page:

<Diagram name="memory-hierarchy/latency_spectrum" height={340} width={720} alt="A diagram titled 'all of it on one line — note that the line is logarithmic', with the note that every point below was measured on this machine. A horizontal logarithmic axis runs from under 1 nanosecond to over 10 milliseconds, with tick marks labelled 1 ns, 1 microsecond, 1 ms and 10 ms. Ten points are marked along it with alternating labels above and below: register, L1, L2, L3, RAM, page cache, SSD, localhost, nearby server, far server. The first four are blue, RAM and page cache dark, and the last four red. Captions read: from one end to the other is a factor of about 34,000,000; which is why 'where is the data?' matters more than 'how fast is the CPU?' for almost every slow program you will ever meet.">

Ten measurements from one machine, on a scale that has to be logarithmic to fit.

</Diagram>

The raw figures:

<TerminalBlock>

register (one cycle)          0.4 ns
L1 cache                      1.5 ns
L2 cache                      4.1 ns
L3 cache                     27.6 ns
main memory                 156   ns
file data already in RAM      1.1 us
SSD, random 4 KB read        73.5 us
network to localhost        116   us
network to a nearby server    1.6 ms
network to a far server      13.6 ms

</TerminalBlock>

Two things about that list deserve pointing out.

**The axis is logarithmic.** It has to be — a linear chart with 0.4 ns at one end and 13.6 ms at the other would put the first eight points on top of each other, indistinguishable, at the very edge. That in itself tells you something: these are not different speeds, they are different *worlds*.

**The gaps are not evenly spaced.** From L1 to RAM is a factor of about 100. From RAM to the SSD is a factor of about 470. From the SSD to a far server is another 185. The two biggest cliffs in the whole ladder are **memory to storage** and **storage to network** — which is exactly why those two boundaries get the most engineering attention in real systems.

## Why it is a hierarchy and not a list {/*why-it-is-a-hierarchy-and-not-a-list*/}

So far this has been a list of storage technologies in order. But the word *hierarchy* is doing real work, and here is what it means.

Each level does not merely sit below the next. **Each level holds copies of the most-used parts of the level below it.**

<Diagram name="memory-hierarchy/every_level_is_a_cache" height={440} width={720} alt="A diagram titled 'the same trick, over and over, all the way down'. Five rows each show a fast store on the left, an arrow labelled 'caches' pointing right, a slower store in the middle, and on the right the name of whoever manages it. The rows read: L1 caches L2, managed by hardware; L3 caches main memory, managed by hardware; main memory caches the SSD, managed by the operating system; your app's cache caches the database, managed by your code; the browser cache caches a server far away, managed by the browser. A blue box at the bottom reads: every one of them answers the same four questions — what to keep, how to find it, what to throw out, what to fetch early.">

Different hardware, different decades, different people — and one repeated idea.

</Diagram>

This is the deep structural insight of the whole module, and it is worth stating in its strongest form: **caching is not a feature of processors. It is a pattern that reappears at every scale in computing.**

Look at that list again. The first two rows are done by hardware you cannot see. The third is done by the operating system. The fourth is written by application programmers. The fifth is your browser. Different technologies, different people, different decades — and every single one of them has to answer the same four questions:

1. **What do I keep?** (usually: whatever was used most recently)
2. **How do I find out whether I have it?** (a lookup, indexed somehow)
3. **What do I throw out when I am full?** (usually: whatever has gone longest unused)
4. **What should I fetch before it is asked for?** (whatever the pattern suggests)

Once you recognise that shape, you will find it everywhere: a CDN caching a website, a database caching query results, a DNS resolver caching lookups, `memoize` on a function, a browser holding an image, Redis in front of Postgres. They are all the same idea as L1 cache, at different distances and managed by different hands.

## The operating system's cache {/*the-operating-systems-cache*/}

One of those levels deserves its own section, because it is invisible, it is enormous, and it will confuse your benchmarks if you do not know about it.

When your program reads a file, the request does not go straight to the SSD. It goes to the **page cache**: a region of main memory that the operating system fills with copies of file data it has recently touched.

<Diagram name="memory-hierarchy/page_cache_measured" height={420} width={720} alt="A diagram titled 'the operating system runs a cache too'. At the top left, a grey box labelled 'your program' with the code read(file, 4096 bytes). An arrow points right to a blue box labelled 'the page cache — a slice of RAM holding file data'. A red arrow labelled 'only on a miss' points down from it to a red box labelled 'the SSD'. On the left, measured results from 3,000 random 4 KB reads of one file are shown as two bars: a tiny blue bar labelled 'from the page cache, 1.1 microseconds', and a long red bar labelled 'from the SSD, 73.5 microseconds'. Captions read: 65 times faster, for a file that has not moved and a program that did not change; this is why the second time you open an application it starts so much quicker, and why a benchmark you run twice lies to you the second time.">

A cache you never asked for, sitting between your program and the disk.

</Diagram>

The effect is not subtle. Here are three thousand random 4 KB reads of the same file, measured twice on the same machine — once with the file's data evicted from the page cache, and once with it resident:

<TerminalBlock>

random 4 KB reads, 3000 of them:
  cold (from the SSD):      73.5 us per read
  warm (from RAM):           1.1 us per read
  ratio: 65x

</TerminalBlock>

**Sixty-five times faster**, for the same program reading the same file with the same code. The only difference is whether the operating system happened to still have it in RAM.

This has a consequence you will run into constantly, so it is worth being blunt about: **the second time you measure something, you are usually measuring the page cache.** A database query that takes 400 ms the first time and 8 ms after that has not been optimised; it has been warmed. Benchmarks that do not account for this are one of the most common sources of wrong conclusions in performance work, and the fix is either to clear the cache between runs or — more honestly — to report both numbers and say which is which.

It also explains something you have experienced without thinking about it: why an application launches slowly the first time after a reboot and quickly ever afterwards.

<Note>

The page cache uses whatever RAM is not currently needed for anything else, which leads to a widespread misunderstanding. Look at a system monitor on a healthy Linux machine and you will often see almost all memory "used" — and people conclude they need more RAM.

Usually they do not. A large chunk of that is the page cache holding file data, and the operating system will hand it back the instant a program asks for memory. **Unused RAM is wasted RAM**, so the OS deliberately fills it with something possibly-useful. "Free memory" being near zero is normal and good; the number to watch is whether the system is *swapping*, not whether memory looks full.

</Note>

## The line where power matters {/*the-line-where-power-matters*/}

There is one boundary in the ladder that has nothing to do with speed, and it matters more than any other for how software is designed:

<Diagram name="memory-hierarchy/volatile_line" height={480} width={720} alt="A diagram titled 'the line where the power switch matters'. Three blue bars at the top are labelled registers, L1/L2/L3 cache, and main memory (RAM), marked on the left as 'volatile — needs power'. Across the middle runs a thick red dashed line labelled 'pull the plug here', with the note 'everything above is gone, everything below survives'. Four grey bars below are labelled SSD, hard disk, another machine's disk, and tape in a vault, marked on the left as 'persistent — keeps its contents'. A caption reads: the fast half of the hierarchy forgets — that is the deal you get for the speed.">

The most consequential boundary in the whole ladder, and it is not about speed.

</Diagram>

Everything from registers down through main memory is **volatile**: it holds data only while powered. Cut the power and it is gone, instantly and completely. Everything from the SSD downwards is **persistent**: it keeps its contents.

And notice where the line falls. It sits exactly between the fast half and the slow half — which is not a coincidence. The technologies that are fast are fast partly *because* they do not have to make anything permanent; they hold charge in a capacitor or a flip-flop rather than physically altering a material.

This one boundary generates an enormous amount of the complexity in real software:

- Every database has to write changes to persistent storage before reporting success, which is why a transaction commit is slow compared with an in-memory update.
- Every editor has to decide when to save, and every crash discussion is about what was above the line when the power went.
- "Durability" in distributed systems means, precisely, *has it crossed this line* — and often, *has it crossed it on more than one machine*.

The whole discipline of thinking about crashes is the discipline of tracking which side of that dashed line your data is on.

## Sequential still wins, even down here {/*sequential-still-wins-even-down-here*/}

One pattern from the cache lesson repeats at the storage level, and it repeats even more strongly.

Here is the same SSD, on the same machine, read two different ways:

<Diagram name="memory-hierarchy/random_vs_sequential" height={380} width={720} alt="A diagram titled 'the same SSD, read two ways', noting the figures were measured on this machine. A long blue bar labelled 'reading straight through' is marked 2,039 MB/s. A tiny red bar labelled 'random 4 KB reads' is marked 56 MB/s. Below, in bold red: 37 times less useful data per second, from the same device. A grey box explains why: a device answers requests, and each request has a fixed cost; one big request moves a lot per cost, while a thousand tiny scattered requests pay that cost a thousand times and move almost nothing. A final caption reads: you have met this exact shape before — it is the cache line argument, one floor down.">

Same device, same file, same total bytes. Only the order of the requests changed.

</Diagram>

Reading the file straight through delivered **2,039 MB/s**. Reading random 4 KB blocks from the same file delivered the equivalent of about **56 MB/s** — a factor of **37**, from nothing but the order of the requests.

The reason is the same reason cache lines exist, one level down. Any storage device answers *requests*, and each request carries a fixed overhead: the command has to travel, the device has to look up where the data is, and the answer has to come back. One large request pays that overhead once and moves a megabyte. A thousand small scattered requests pay it a thousand times and move four kilobytes each.

On a spinning hard disk the effect is far more brutal still, because the overhead includes physically moving a mechanical arm and waiting for the platter to rotate underneath it. Sequential throughput of 200 MB/s and random performance equivalent to under 1 MB/s is entirely normal for a hard disk — a difference of hundreds of times.

This is why so much storage engineering is about *turning random access into sequential access*: why databases keep write-ahead logs (append-only, therefore sequential), why log-structured storage exists, and why "we'll just read the rows we need" can be slower than reading the whole table.

## Where your program's data actually is {/*where-your-programs-data-actually-is*/}

Let us make this concrete. At any moment, one running program has data spread across most of the ladder simultaneously:

<Diagram name="memory-hierarchy/program_data_map" height={466} width={720} alt="A diagram titled 'where one running program's data actually is'. Eight rows pair a piece of data on the left with its location on the right: the loop counter you just incremented is in a register; the array element you read last is in L1 cache; the rest of that array is in L2 or L3; the objects your program allocated are in main memory; the file you opened a moment ago is in the page cache in RAM; the file you have not touched yet is on the SSD; last year's logs are on a disk somewhere else; the API response you are waiting for is on another continent. The rows shade from blue at the top through dark to red at the bottom. Captions read: nothing in your source code says which row a variable is on — and yet that row decides almost everything about how fast the program runs.">

One program, one instant, eight different rungs.

</Diagram>

Read the right-hand column and then re-read the caption, because that is the uncomfortable part.

Your source code contains no statement about which rung anything is on. You write `total += price[i]` and the language gives you no way to say "keep `total` in a register" or "make sure `price` is in L2". Those decisions are made, continuously and invisibly, by the compiler, the cache hardware and the operating system.

You cannot control them directly. But you can **influence** them, and that is what the rest of this module is about: how memory is actually laid out, which of your data goes on the stack and which on the heap, what makes an access sequential rather than scattered, and what happens when data you no longer need never gets released.

<Pitfall>

**"It's slow, so we need more RAM" is a guess, and usually the wrong one.**

Adding memory is the most common reflex when a system feels slow, and it helps in exactly one situation: when the machine does not have enough RAM to hold what it is actively using, and is therefore constantly pushing data out to disk and pulling it back. That situation has a name — **swapping**, or *thrashing* — and it is genuinely catastrophic, because it moves the working set from the 156-nanosecond rung to the 74-microsecond rung.

But if the machine is *not* swapping, more RAM changes nothing. The program is not waiting for memory it does not have; it is waiting for something else. And there are several much more likely candidates:

- It is waiting on the **network** — the 13-millisecond rung, which no amount of RAM affects.
- It is waiting on **random disk I/O** that would be fast if it were sequential.
- It is **cache-missing** inside the CPU, which is about data layout, not data quantity.
- It is doing too much work, and this is an algorithm problem wearing a hardware costume.

The correction is to identify which rung the time is being spent on before spending money. Every operating system can tell you: swap activity, disk read rates and queue depth, network wait time, CPU utilisation. The ladder in this lesson is also a diagnostic checklist — start at the bottom, because the bottom rungs are thousands of times more expensive and therefore far more likely to be the answer.

</Pitfall>

<DeepDive>

#### The bill, which is the real reason for all of this {/*the-bill*/}

Everything in this lesson would be unnecessary if fast memory were cheap. It is worth seeing roughly how far from cheap it is.

<Diagram name="memory-hierarchy/cost_per_byte" height={380} width={720} alt="A bar chart titled 'and then there is the bill', subtitled 'roughly what a gigabyte costs, in orders of magnitude'. Four bars of sharply decreasing length: SRAM (cache) costs thousands of dollars per gigabyte, shown in red; DRAM (main memory) costs a few dollars; SSD costs a few cents; hard disk costs a fraction of a cent. Captions read: this is the real reason the hierarchy exists — if cache memory were cheap, your computer would be one enormous cache and this module would be one page; prices move constantly, the ratios between them move far more slowly.">

The constraint underneath all of it. Note that the axis is orders of magnitude, not dollars.

</Diagram>

The exact prices change every year, so the numbers to hold on to are the *ratios*, which move much more slowly. Roughly speaking, each step down the ladder is a factor of a hundred or so cheaper per byte, and it is that factor which decides how much of each you get.

Notice what this implies about the shape of a computer. Nobody chose "32 KB of L1" because 32 KB is a satisfying number. It is what the speed target allowed at a price anyone would pay. Every capacity in the ladder is the answer to an economic question, not a technical one — which is why the *sizes* have grown enormously over sixty years while the *shape* of the hierarchy has barely changed at all.

There is a second cost that does not appear on a price list: **energy**. Moving data costs power, and moving it further costs more. Reading a value from a register uses a tiny fraction of the energy needed to fetch it from main memory, and orders of magnitude less than sending it over a network. On a phone, that is battery life; in a data centre, it is the electricity bill and the cooling. So the hierarchy is not only about speed and money — keeping data close is also how a device stays cool and how a fleet stays affordable.

</DeepDive>

<DeepDive>

#### The ladder keeps gaining and losing rungs {/*the-ladder-keeps-changing*/}

The hierarchy is not a fixed structure handed down from the 1960s. Rungs appear, move and disappear, and watching that happen is a good way to understand what the hierarchy actually *is* — which is not a list of devices but a **sorted arrangement of whatever storage technologies exist**.

Rungs that have come and gone: **magnetic tape** was once the main event and is now an archival layer that most people never touch. **Floppy disks** occupied the gap between memory and hard disks for two decades and then vanished entirely. **Optical discs** had a decade in the middle of the ladder. Each was inserted where its speed and price happened to fall, and each was removed when something else did the same job better.

Rungs that appeared recently: the **SSD** is the clearest example. Before flash storage was affordable, there was a gaping hole in the ladder between main memory (nanoseconds) and hard disks (milliseconds) — a gap of nearly a hundred thousand times, with nothing in it. The SSD filled that gap, and doing so quietly changed how software is written: databases, filesystems and applications all had assumptions built around the old cliff, and many of them had to be revisited.

Rungs still being argued about: **persistent memory** technologies aim at the volatility line itself, offering storage that is nearly as fast as DRAM but keeps its contents. That would be a genuinely new kind of rung, sitting exactly on the boundary this lesson drew, and it raises questions software has never had to answer — if memory survives a crash, what does "save" even mean?

And rungs that grew from nothing: the **network** now sits firmly in the ladder. A cache in another rack, a database in another building, an object store in another region — these are storage levels with real latencies, and a modern application reasons about them the way a 1970s programmer reasoned about disks.

The transferable idea is that you should expect to keep meeting this pattern. When some new storage technology arrives, the useful questions are always the same three: **how fast, how big, how much per byte** — and the answers slot it into the ladder automatically.

</DeepDive>

## Work out where the time goes {/*work-out-where-the-time-goes*/}

The whole module comes down to one piece of arithmetic, and it is worth having in your hands.

Suppose a program makes many accesses to some data. Some fraction of them are satisfied by a fast layer; the rest have to go to a slow one. The average cost is then:

```
 average = (hit rate × fast latency) + (miss rate × slow latency)
```

That formula is what a cache *is*, mathematically. Below you can set the two layers, the hit rate, and how many accesses the program makes, and see what it costs — both in real time and in the human-scale units from earlier.

Two things worth trying. Put the fast layer at RAM and the slow one at a far server, then move the hit rate from 90% to 99% and watch the total collapse. Then set the hit rate to 50% and notice how little the fast layer's speed matters any more.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';

// name, latency in nanoseconds  (all measured on one machine, except HDD)
const TIERS = [
  ['L1 cache', 1.5],
  ['L3 cache', 27.6],
  ['main memory', 156],
  ['file in RAM (page cache)', 1100],
  ['SSD, random read', 73500],
  ['hard disk seek', 10000000],
  ['nearby server', 1600000],
  ['server on another continent', 13600000],
];

function human(ns) {
  const cyclesInSeconds = ns / 0.357;          // 1 cycle = 1 second, at 2.8 GHz
  if (cyclesInSeconds < 90) return `${cyclesInSeconds.toFixed(0)} seconds`;
  if (cyclesInSeconds < 5400) return `${(cyclesInSeconds / 60).toFixed(0)} minutes`;
  if (cyclesInSeconds < 172800) return `${(cyclesInSeconds / 3600).toFixed(1)} hours`;
  if (cyclesInSeconds < 3.2e7) return `${(cyclesInSeconds / 86400).toFixed(0)} days`;
  return `${(cyclesInSeconds / 3.15e7).toFixed(1)} years`;
}

function realTime(ns) {
  if (ns < 1000) return `${ns.toFixed(1)} ns`;
  if (ns < 1e6) return `${(ns / 1000).toFixed(1)} \u00b5s`;
  if (ns < 1e9) return `${(ns / 1e6).toFixed(1)} ms`;
  if (ns < 6e10) return `${(ns / 1e9).toFixed(1)} s`;
  return `${(ns / 6e10).toFixed(1)} min`;
}

export default function HierarchyLab() {
  const [fastI, setFastI] = useState(2);       // main memory
  const [slowI, setSlowI] = useState(4);       // SSD
  const [hit, setHit] = useState(90);
  const [count, setCount] = useState(1000000);

  const fast = TIERS[fastI][1];
  const slow = TIERS[slowI][1];
  const h = hit / 100;
  const avg = h * fast + (1 - h) * slow;
  const total = avg * count;
  const allFast = fast * count;
  const allSlow = slow * count;
  const shareSlow = ((1 - h) * slow) / avg * 100;
  const inverted = fast >= slow;

  const pick = (list, cur, set, label) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 3 }}>{label}</div>
      <div>
        {list.map(([name, ns], i) => (
          <button key={name} onClick={() => set(i)} style={{
            margin: 2, padding: '3px 9px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            border: `2px solid ${cur === i ? ACC : '#888'}`,
            background: cur === i ? `${ACC}1e` : 'transparent',
            color: cur === i ? ACC : 'inherit',
            fontWeight: cur === i ? 'bold' : 'normal',
          }}>{name}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      {pick(TIERS, fastI, setFastI, 'the fast layer — where hits are served from')}
      {pick(TIERS, slowI, setSlowI, 'the slow layer — where misses have to go')}

      {inverted && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, marginBottom: 8,
          border: `2px solid ${DNG}`, background: `${DNG}14`, color: DNG, fontSize: 13,
        }}>
          The fast layer is not faster than the slow one. A cache like that is pure overhead.
        </div>
      )}

      <div style={{ margin: '12px 0' }}>
        <label style={{ fontSize: 13 }}>
          hit rate: <b style={{ fontFamily: 'monospace', color: ACC }}>{hit}%</b>
          <span style={{ color: '#888' }}> — so {100 - hit}% of accesses miss</span>
        </label>
        <input type="range" min="0" max="100" value={hit}
          onChange={(e) => setHit(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 6 }}>accesses</span>
        {[1000, 100000, 1000000, 10000000].map((c) => (
          <button key={c} onClick={() => setCount(c)} style={{
            margin: 2, padding: '3px 9px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            fontFamily: 'monospace',
            border: `2px solid ${count === c ? ACC : '#888'}`,
            background: count === c ? `${ACC}1e` : 'transparent',
            color: count === c ? ACC : 'inherit',
          }}>{c.toLocaleString()}</button>
        ))}
      </div>

      {/* where the average comes from */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
        what the average access is made of
      </div>
      <div style={{
        display: 'flex', height: 30, borderRadius: 7, overflow: 'hidden',
        border: '1px solid #8886', marginBottom: 6,
      }}>
        <div style={{
          width: `${100 - shareSlow}%`, background: `${ACC}40`, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{100 - shareSlow > 14 ? `hits ${(100 - shareSlow).toFixed(0)}%` : ''}</div>
        <div style={{
          width: `${shareSlow}%`, background: `${DNG}40`, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{shareSlow > 14 ? `misses ${shareSlow.toFixed(0)}%` : ''}</div>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#888', marginTop: 0 }}>
        {(h).toFixed(2)} × {realTime(fast)} + {(1 - h).toFixed(2)} × {realTime(slow)} ={' '}
        <b style={{ color: 'inherit' }}>{realTime(avg)}</b> per access
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${ACC}`, background: `${ACC}14`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            total for {count.toLocaleString()} accesses
          </div>
          <div style={{ fontSize: 24, fontFamily: 'monospace', color: ACC }}>
            {realTime(total)}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            best possible: {realTime(allFast)} · worst: {realTime(allSlow)}
          </div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${shareSlow > 50 ? DNG : '#888'}`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>the misses account for</div>
          <div style={{
            fontSize: 24, fontFamily: 'monospace',
            color: shareSlow > 50 ? DNG : 'inherit',
          }}>{shareSlow.toFixed(0)}%</div>
          <div style={{ fontSize: 12, color: '#888' }}>of the total time</div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10, border: '2px solid #888',
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>one access, in human time</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace' }}>{human(avg)}</div>
          <div style={{ fontSize: 12, color: '#888' }}>if a cycle were a second</div>
        </div>
      </div>

      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 10,
        border: `2px solid ${shareSlow > 60 ? DNG : ACC}`,
        background: shareSlow > 60 ? `${DNG}14` : `${ACC}14`, fontSize: 13,
      }}>
        {shareSlow > 90 ? (
          <>The misses are the program. The fast layer's speed is irrelevant here — the only
          thing worth improving is the hit rate.</>
        ) : shareSlow > 60 ? (
          <>Most of the time is going to misses. Raising the hit rate a few points will do far
          more than making the fast layer faster.</>
        ) : hit === 100 ? (
          <>Everything hits, so the fast layer's speed is all that matters. This is the
          situation every cache is trying to reach.</>
        ) : (
          <>The two layers are contributing comparably. Improving either will help,
          which is an unusually comfortable position to be in.</>
        )}
      </div>
    </div>
  );
}
```

</Sandpack>

The behaviour to take away from that toy is how **lopsided** the formula is. With RAM as the fast layer and an SSD as the slow one, a 90% hit rate still leaves the misses responsible for over 98% of the total time. You could make RAM twice as fast and barely notice; you could raise the hit rate from 90% to 99% and cut the runtime by nearly ten times.

That is the whole reason this module exists. Performance work is rarely about making the fast thing faster. It is about **going to the slow thing less often**.

<Recap>

- Every storage technology is an answer to the same question — *where should this byte live?* — and every answer is a compromise between **fast**, **big** and **cheap**, because no material offers all three.
- The **memory hierarchy** is the decision to use all of them at once: registers, L1/L2/L3 cache, main memory, SSD, hard disk, and other machines over a network. Going down, each level holds more, costs less per byte, and answers more slowly.
- Measured end to end on one machine, the span is roughly **34 million times** in speed — 0.4 ns for a register against 13.6 ms for a server on another continent — and about a billion times in capacity.
- Scaled so that one CPU cycle is **one second**: L1 is 4 seconds, main memory is **7 minutes**, an SSD read is **2 days**, a hard disk seek is **11 months**, and a request across the world is **13 years**.
- It is a *hierarchy* because **every level caches the level below it** — and the same four questions (what to keep, how to find it, what to evict, what to prefetch) are answered by hardware, by the operating system, by your application code and by your browser. Caching is a pattern, not a CPU feature.
- The **page cache** is the operating system caching file data in RAM. Measured here: the same 3,000 random 4 KB reads took **73.5 µs** each from the SSD and **1.1 µs** each from the page cache — **65× faster**. This is why a benchmark's second run lies to you.
- The **volatility line** sits between main memory and the SSD: everything above forgets when the power goes, everything below survives. That single boundary is what "durability", "commit" and "save" are all about.
- Sequential access wins at the storage level too, and by more: the same SSD delivered **2,039 MB/s** read straight through and the equivalent of **56 MB/s** in random 4 KB reads — a factor of **37**, because every request carries a fixed cost.
- A running program's data is spread across the whole ladder at once, and **nothing in your source code says which rung anything is on** — yet that placement decides most of the performance.
- The central arithmetic: `average = hit rate × fast + miss rate × slow`. It is so lopsided that improving the hit rate almost always beats improving the fast layer. Performance work means **going to the slow thing less often**.

</Recap>

<Challenges>

#### Put the ladder in order {/*put-the-ladder-in-order*/}

Here are seven places data can be, in scrambled order. (a) Sort them from fastest to slowest. (b) Draw the volatility line — which of them survive a power cut? (c) Two of them are far closer in speed than their names suggest. Which two, and why?

```
 a hard disk · L2 cache · a server in another country · main memory
 an SSD · a CPU register · file data in the page cache
```

<Hint>

For (c), remember what the page cache physically is. The name mentions files, but the storage is not a file.

</Hint>

<Solution>

**(a) Fastest to slowest**, with the measured figures from this lesson:

```
 1. a CPU register                 0.4 ns
 2. L2 cache                       4.1 ns
 3. main memory                  156   ns
 4. file data in the page cache     1.1 us
 5. an SSD                         73.5 us
 6. a hard disk                    ~10   ms
 7. a server in another country    ~13.6 ms
```

**(b) The volatility line** falls between **4 and 5**. Registers, cache, main memory and the page cache all live in volatile memory and are gone the instant power is lost. The SSD, the hard disk and the remote server all keep their contents.

Note the slightly counter-intuitive part: the **page cache is volatile**, even though it holds copies of files. The file on disk survives; the cached copy does not. This is exactly why a program that has "written" data may still lose it — the write may be sitting in the page cache, above the line, waiting to be flushed. It is why `fsync` exists.

**(c) The two that are closer than they sound: main memory and the page cache.** Both are RAM. The names suggest one is memory and the other is storage, but "the page cache" is simply a region of main memory that the operating system has filled with file contents. The measured gap between them (156 ns versus 1.1 µs) is not a memory-speed difference at all — it is the cost of the **system call** and the bookkeeping around going through the operating system, rather than reading a variable directly.

That is a useful thing to have noticed: some of the gaps in the ladder are physics, and some are software overhead. They are worth telling apart, because only one of the two can be engineered away.

</Solution>

#### Find the bottleneck {/*find-the-bottleneck*/}

A request handler does the following work, once per request:

```
 2,000,000  arithmetic operations   (roughly 1 cycle each)
     8,000  main memory accesses
        40  random SSD reads
         3  calls to a service in another region
```

(a) Using this lesson's figures, estimate how long each of those four categories takes. (b) Which dominates? (c) Your team has time to optimise exactly one of them. Which, and what would you expect to gain?

<Solution>

**(a) Estimating each category** with 0.4 ns per cycle, 156 ns per memory access, 73.5 µs per random SSD read and 13.6 ms per cross-region call:

```
 arithmetic:   2,000,000 × 0.4 ns   =   0.8 ms
 memory:           8,000 × 156 ns   =   1.25 ms
 SSD:                 40 × 73.5 us  =   2.94 ms
 network:              3 × 13.6 ms  =  40.8 ms
                                       ─────────
 total                              ≈  45.8 ms
```

**(b) The network dominates completely**, at about **89%** of the total. Three calls — three individual operations out of more than two million — account for nearly nine tenths of the time.

**(c) Optimise the network calls.** Nothing else is close, and the arithmetic is worth spelling out because it is so counter-intuitive:

- Eliminate **one** of the three remote calls and you save 13.6 ms — about **30%** of the whole request.
- Make the arithmetic **twice as fast** and you save 0.4 ms — under **1%**. Even making it *infinitely* fast saves less than 2%.

What would you actually do? The standard moves, in order of payoff: issue the three calls **in parallel** rather than in sequence (if they are independent, the network cost drops from 40.8 ms to about 13.6 ms — a 60% saving on the whole request for a change that touches no business logic); **cache** their results if they are repeatable; or **batch** them into one call if the service allows it.

The general lesson is the one this whole lesson is built on: **count operations weighted by their position on the ladder, not by how many there are.** Two million cheap operations lost decisively to three expensive ones.

</Solution>

#### The benchmark that got faster on its own {/*the-benchmark-that-got-faster-on-its-own*/}

Transfer task. A colleague reports a success: *"I optimised our report query. It used to take 900 ms, now it takes 40 ms — a 22× improvement. I've run it ten times to be sure."* Looking at their change, you see they added an index.

You are pleased, but suspicious. What would you check before believing the 22×, what is probably happening, and how would you measure it honestly?

<Solution>

**What to check first: how did they run it ten times?** If the ten runs were consecutive, the first run was measuring cold storage and the other nine were measuring the **page cache**. The measured 65× gap in this lesson is precisely this effect, and it is entirely capable of producing a "22× improvement" all by itself, with no change to the query at all.

**What is probably happening** is a mixture of two things, and the whole point is that they cannot be separated by this experiment:

1. The index is genuinely helping — it turns a scan of many rows into a lookup of a few, which reduces the *number* of storage reads.
2. The data is now warm. The 900 ms baseline was measured once, on cold storage; the 40 ms figure is an average of runs on data that is sitting in RAM.

The tell is the shape of the numbers. If they had reported the ten individual timings, a cold-cache effect would show up as one slow run followed by nine fast ones — a very different picture from ten consistent runs.

**How to measure it honestly.** The principle is to compare like with like, so measure both versions in both states:

- **Cold, both versions.** Clear the cache before each run (or restart the database, or use a machine that has not seen the data). This gives the honest first-request number that a real user hits.
- **Warm, both versions.** Run each version several times and take the steady state. This gives the honest number for a hot, frequently-queried path.
- **Report all four**, because they answer different questions. A dashboard loaded once a day cares about the cold number; an endpoint hit a thousand times a second cares about the warm one.
- **Discard the first run** of any warm measurement, and say that you did.

It is quite likely the index is a real and worthwhile improvement — indexes usually are. But "22×" is not yet a measurement of it; it is a measurement of the index *and* the page cache, and the honest version is almost certainly a smaller number that you can defend.

The habit worth building: **whenever a performance number looks too good, ask which rung of the ladder the data was on during each run.** The hierarchy is invisible, it is enormous, and it will flatter you if you let it. ✓

</Solution>

</Challenges>

<LearnMore title="How RAM Works" path="/learn/faza-0/modul-0-4/how-ram-works">

One rung of that ladder deserves opening up before any of the others, because it is where your program's data actually lives: main memory. Next lesson goes inside a RAM chip — how a single bit is stored as a charge in a capacitor so leaky it must be rewritten thousands of times a second, why reading memory means reading a whole *row* whether you wanted it or not, and where the numbers on a memory module actually come from.

</LearnMore>
