---
title: "How RAM Works"
---

<Intro>

In 1966, at IBM's research centre in New York, an engineer named Robert Dennard was working on a problem everyone else was solving the expensive way. Memory at the time was built from circuits needing six transistors for every single bit — reliable, fast, and far too costly to build in quantity. Dennard's idea was to throw almost all of it away. Store the bit as **a puddle of electric charge in a tiny capacitor**, and guard it with **one** transistor. Two components instead of six. The catch was obvious and, to most people, disqualifying: capacitors that small leak. The charge drains away within milliseconds, so the memory forgets everything unless something continuously reads each bit and writes it back. Dennard's answer was essentially *so let it forget, and refresh it* — and that apparently absurd trade is the reason your computer has gigabytes of memory instead of megabytes. (If the name is familiar, it should be: this is the same Robert Dennard whose scaling rule, eight years later, gave computing thirty years of free speed.) This lesson opens up a memory chip and follows one byte out of it.

</Intro>

<YouWillLearn>

- How a single bit of RAM is physically stored, and why it needs exactly two components
- Why memory has to be **refreshed** thousands of times a second, and what that costs
- Why reading one byte means opening a whole **row** — and destroying it in the process
- Why the second access to the same row is several times cheaper than the first
- What `DDR4-3200 CL16` actually means, translated into nanoseconds
- Why memory **bandwidth** has grown enormously while memory **latency** has barely moved

</YouWillLearn>

<InlineToc />

## One bit, two components {/*one-bit-two-components*/}

Start at the smallest possible scale: one bit, in the main memory of the machine you are using.

<Diagram name="how-ram-works/dram_cell" height={420} width={720} alt="A diagram titled 'one bit of RAM: a switch and a bucket'. On the left, a blue panel labelled 'DRAM — main memory' shows a horizontal row line, a vertical wire dropping into a closed switch labelled '1 transistor', and below it a capacitor symbol labelled '1 capacitor' with the notes 'charged = 1' and 'empty = 0'; the panel is captioned 'two components per bit'. On the right, a red panel labelled 'SRAM — cache' shows six small boxes each marked T, captioned 'six transistors per bit'. Captions read: that ratio is why you have gigabytes of one and kilobytes of the other; the DRAM cell was invented by Robert Dennard at IBM in 1966 — the same Dennard whose scaling rule gave computing thirty years of free speed.">

Two components against six. That ratio decided the shape of the whole hierarchy.

</Diagram>

A **DRAM cell** — one bit of main memory — is a capacitor and a transistor.

The **capacitor** is the storage. A capacitor holds electric charge, and here it holds either enough charge to count as a 1, or almost none, which counts as a 0. That is the entire bit: a small quantity of electricity, present or absent.

The **transistor** is the gate, and it is exactly the switch from Module 0.2 — a switch whose handle is another wire. It connects the capacitor to the outside world when, and only when, the *row line* running past it is energised. The rest of the time it isolates the capacitor so the charge can sit there undisturbed.

Now compare that with the memory inside the CPU. An **SRAM cell** — what caches are built from — typically needs **six transistors** arranged in a loop that holds its own state, the cross-coupled arrangement you met in the clock lesson. It is faster, it never forgets while powered, and it costs three times the components and considerably more area.

That ratio is the whole reason the memory hierarchy has the shape it does. Three times the components per bit, plus a more complex layout, compounds into roughly a hundredfold difference in cost per byte — which is why your machine has 32 kilobytes of L1 and 16 gigabytes of RAM, rather than 16 gigabytes of L1.

<Note>

The names are worth pinning down since they get used loosely.

- **DRAM** — *Dynamic* Random Access Memory. "Dynamic" because it forgets and must be continually refreshed. This is main memory: the sticks you plug into a motherboard.
- **SRAM** — *Static* Random Access Memory. "Static" because it holds its value as long as power is applied. This is what CPU caches are made of.
- **Random Access** in both names is a historical distinction, and it means you can read any address directly without winding through everything before it — as opposed to magnetic tape, which was the alternative when the term was coined.

</Note>

## The bucket leaks {/*the-bucket-leaks*/}

Here is the problem with storing a bit as a puddle of charge. Capacitors that small are not perfect containers, and the transistor guarding them is not a perfect insulator. Charge escapes.

<Diagram name="how-ram-works/leaky_capacitor" height={400} width={720} alt="A diagram titled 'the bucket has a hole in it', showing four boxes in a row, each containing a vertical bar representing charge level, decreasing from left to right. The stages are labelled: 'just written' with a full blue bar and the note 'a clear 1'; 'a moment later' at about three quarters, 'still readable'; 'later still' at under half in red, 'getting doubtful'; and 'too late' nearly empty in red, 'indistinguishable from 0'. Grey arrows connect the stages. A blue box below reads: so every row is read and written back, over and over, forever — each row must be refreshed within 64 milliseconds of the last time — which is where the D in DRAM comes from: dynamic. A final caption notes that cache memory needs none of this, since six transistors hold their state as long as there is power.">

The bit fading. Nothing is broken — this is how the technology works.

</Diagram>

Follow the four stages. Immediately after writing, the capacitor is comfortably full and reads as an unambiguous 1. As charge drains, the difference between "1" and "0" narrows. Eventually there is not enough left to tell them apart, and the bit is simply gone.

The fix is brute force: **read every bit and write it back before it fades**. The DDR standards specify that every row must be refreshed within **64 milliseconds** of its last refresh. Miss the deadline and data is lost — not corrupted subtly, just gone.

That is what the **D** in DRAM stands for: **dynamic**, meaning it needs constant maintenance to keep existing. SRAM is *static* because its six-transistor loop actively holds its own state and needs no such attention.

It is worth appreciating how strange this is. Your computer's memory is, right now, in a continuous cycle of forgetting and being reminded, thousands of times a second, for every row of every chip. The data appears stable to you only because the reminding never stops.

## The housekeeping bill {/*the-housekeeping-bill*/}

Refreshing is not free, and the arithmetic is simple enough to do:

<Diagram name="how-ram-works/refresh_cost" height={380} width={720} alt="A diagram titled 'the housekeeping bill'. A horizontal timeline runs from 0 ms to 64 ms, marked with forty-one closely spaced red ticks, annotated 'each tick is a refresh command'. Below it: 8,192 of them fit in the 64 ms window — one every 7.8 microseconds. Four labelled rows follow: what a refresh does — reads a whole row and writes it straight back; what it costs you — that bank cannot answer a real request while it happens; why you never notice — it is a small fraction of the time, and the controller hides it; when you would notice — in the heat: refresh is why idle RAM still draws power. A caption reads: a memory chip spends part of its life just remembering what it already knew.">

Work that produces nothing, done forever, so that nothing is lost.

</Diagram>

```
 every row must be refreshed within        64 ms
 refresh commands issued in that window     8,192
 so one refresh command every         64 / 8,192 ms  =  7.8 us
```

Every 7.8 microseconds, the memory controller interrupts whatever it was doing and sends a refresh command. Each one causes some part of the chip to read a row and write it straight back — real work, producing nothing useful, purely to stop the data evaporating.

Three consequences worth knowing:

- **A refreshing bank cannot serve requests.** For a brief moment, part of your memory is busy remembering and unavailable. The controller schedules around it, which is one of the reasons memory latency is variable rather than fixed.
- **You will never see it in a profiler.** It is a small percentage of the available time and it is hidden inside the memory subsystem, below anything software can observe.
- **It costs power continuously.** This is why RAM draws power even when a machine is doing nothing at all, and part of why laptops try so hard to reduce memory when idling. A completely idle DRAM chip is still working.

## The cells are a grid {/*the-cells-are-a-grid*/}

A single cell is not much use. A memory chip contains billions, and how they are arranged determines everything about how memory behaves.

They are laid out as a **grid** — rows and columns:

<Diagram name="how-ram-works/dram_array" height={420} width={720} alt="A diagram titled 'the cells are laid out as a grid', showing a ten by ten grid of small empty squares representing memory cells. One horizontal row is highlighted in blue and labelled 'row'; one vertical column is highlighted in red and labelled 'column'. A dark dot marks the single cell where they intersect, labelled 'the bit you asked for'. Text on the left explains that an address is split in two: which row, which column. A caption reads: a real row holds about 1 to 2 kilobytes — thousands of bits side by side.">

One wire per row and one per column, instead of one wire per bit.

</Diagram>

Every cell sits at the intersection of one row line and one column line, and an address is split into two halves: **which row**, and **which column**.

This grid arrangement exists for the same reason the cache used sets rather than searching everything: wiring. A chip with billions of cells cannot afford an individual wire to each one. A grid needs only one wire per row plus one per column — for a million cells, two thousand wires instead of a million.

The size of a row matters enormously for what comes next. A real DRAM row holds roughly **1 to 2 kilobytes** — thousands of bits, sitting side by side, sharing a single row line.

<Note>

A confusing name to get out of the way early: a DRAM row is sometimes called a **DRAM page**, which has nothing to do with the 4 KB **memory pages** used by virtual memory. They are different sizes, managed by different parts of the system, for different reasons.

This lesson says **row** throughout, and means the physical line of cells inside the chip.

</Note>

## Reading destroys what it reads {/*reading-destroys-what-it-reads*/}

Now the part that explains most of memory's peculiar behaviour. Getting one byte out of DRAM is not one operation — it is four, and the third one is the only one you asked for.

<Diagram name="how-ram-works/row_activate" height={460} width={720} alt="A diagram titled 'reading one byte takes four steps and destroys a row', showing four stacked labelled panels. 1. ACTIVATE — open the row you want: the whole row's charges spill onto the sense lines. 2. SENSE — amplify what spilled: tiny charges become clean 1s and 0s in the row buffer. 3. READ — take your column: only now does the byte you asked for come out. 4. PRECHARGE — write the row back: reading emptied the capacitors, so they must be restored. The first two panels are blue, the third dark, the fourth red. Captions read: step 4 is the surprising one — a DRAM read is destructive, so every read is really a read followed by a rewrite of an entire row; and this is why a row, once open, is cheap to read again.">

Four steps, of which only the third is what you asked for.

</Diagram>

**Step 1 — ACTIVATE.** The controller energises the row line for the row containing your byte. Every transistor along that row opens at once, connecting **every capacitor in the row** to its column line. Thousands of bits, all released together, because there is no way to open just one.

**Step 2 — SENSE.** What comes out is minuscule — the charge from a capacitor a few tens of nanometres across, spread onto a comparatively long wire. Circuits called *sense amplifiers* detect these faint differences and amplify them into clean digital values. The result is held in the **row buffer**: a strip of fast storage holding the entire row, properly readable.

**Step 3 — READ.** Now, finally, the column part of the address selects your byte from the row buffer and sends it out. This is the step that gets a name on the specification sheet, and it is the shortest of the four.

**Step 4 — PRECHARGE.** And here is the surprising part. Reading a DRAM cell **drains the capacitor** — the charge had to leave in order to be detected. The row's data now exists only in the row buffer, so before the chip can open a different row, it must **write the whole row back** from the buffer into the capacitors.

So a DRAM read is *destructive*, and every read is secretly a read-and-rewrite of about a kilobyte. Which sounds like a disaster, and turns out to be an opportunity.

## The row that is already open {/*the-row-that-is-already-open*/}

Look again at those four steps and ask which of them you can skip if the row you want is *already sitting in the row buffer*.

Steps 1, 2 and 4 — all of them. Only step 3 remains.

<Diagram name="how-ram-works/row_buffer" height={420} width={720} alt="A diagram titled 'the row that is already open', showing two panels. The left blue panel, headed 'same row again — a row buffer hit', lists: the row is already sensed, just pick a different column, no activate no precharge; a large box beneath reads 'fast', with the note 'sequential access lands here again and again'. The right red panel, headed 'a different row — a row buffer miss', lists: close the open row first, activate the new one, sense it then read; a box beneath reads 'slow', with the note 'random access lands here every single time'. A caption reads: the cache line argument again, one level lower down — memory rewards anyone who keeps asking for things that are near each other.">

The same request, twice, at very different prices — depending only on what came before it.

</Diagram>

This is a **row buffer hit**, and it is several times cheaper than a miss. The expensive machinery has already run; you are just selecting a different column from a kilobyte that is already amplified and waiting.

A **row buffer miss** — asking for an address in a different row — costs the full sequence: close the current row (precharge), open the new one (activate), sense it, and only then read.

And now the practical consequence, which should feel familiar:

- **Sequential access** walks along a row, hitting the row buffer repeatedly. One expensive activate serves hundreds of cheap reads.
- **Random access** lands in a different row nearly every time, paying the full four-step cost on every single access.

This is exactly the cache line argument from the last module, one level further down. The cache rewards you for asking about neighbouring bytes because it moves 64 bytes at a time; memory rewards you for the same behaviour because it *opens a kilobyte at a time*. Two independent mechanisms, at different scales, both pushing in the same direction: **things that are near each other are cheap to fetch together**.

It also explains something the previous lesson measured but did not explain. When walking memory in order came out flat at around 2 ns per access regardless of data size, part of that was the prefetcher — and part of it was that a sequential walk keeps hitting the same open row.

## What the numbers on the stick mean {/*what-the-numbers-mean*/}

A memory module is sold with a label like `DDR4-3200 CL16`. Every part of that is now decodable.

<Diagram name="how-ram-works/module_numbers" height={440} width={720} alt="A diagram titled 'what the numbers on a memory stick mean', showing the label DDR4-3200 CL16 in large monospace at the top. Three annotated rows explain: DDR means Double Data Rate, it moves data on both edges of the clock; 3200 means 3,200 million transfers per second, so the clock is 1,600 MHz; CL16 means 16 clock cycles from asking for a column to getting data. A blue box headed 'turning CL16 into real time' shows: clock 1,600 MHz gives one cycle equals 0.625 ns, and 16 cycles times 0.625 ns equals 10.0 ns. A red box below reads: but a real random access measured 156 ns on this machine, because CL is only the last step — add row activate, precharge, address translation, the memory controller's queue and the trip across the bus; CL16 does not mean 16 ns memory. A final caption notes peak bandwidth is easier: 3,200 MT/s times 8 bytes equals 25.6 GB/s per channel.">

Every part of the label decoded, including the part that flatters the product.

</Diagram>

**DDR** is *Double Data Rate*: the module transfers data on both the rising and falling edges of its clock, so it moves two chunks per clock cycle instead of one. This is why the headline number is always twice the actual clock frequency.

**3200** is not megahertz, despite how it is usually said. It is **3,200 million transfers per second** — so the real clock is **1,600 MHz**.

**CL16** is the *CAS latency*: the number of clock cycles between the controller asking for a column and the data appearing. Convert it:

```
 clock          1,600 MHz
 one cycle      1 / 1,600,000,000 s  =  0.625 ns
 CL16           16 × 0.625 ns        =  10.0 ns
```

Ten nanoseconds. Which brings us to a genuinely useful piece of scepticism, because the previous lesson **measured** a random memory access on this machine at **156 nanoseconds** — more than fifteen times that figure.

Both numbers are correct. `CL16` describes **step 3 only** — the read from an already-open row. A real random access also pays for:

- **precharge** of whichever row was open before,
- **activate** and **sense** of the new row,
- **address translation**, turning the address your program used into a physical one,
- **queueing** inside the memory controller behind other requests and refreshes,
- and the **trip** out of the CPU, across the board, and back.

So `CL16` is not a promise of 16-nanosecond memory. It is one component of a much longer path, and it is the component the marketing department can most easily make look good.

Bandwidth, by contrast, is straightforward and honest:

```
 3,200 MT/s × 8 bytes per transfer  =  25.6 GB/s per channel
```

## How memory got fast without getting quick {/*fast-without-getting-quick*/}

Which raises an obvious question. If a single memory access still takes on the order of a hundred nanoseconds, how do modern machines move tens of gigabytes per second?

By doing many accesses **at the same time**.

<Diagram name="how-ram-works/banks_and_channels" height={420} width={720} alt="A diagram titled 'how memory gets fast without getting quick', subtitled 'one access is slow, so do many at once'. On the left, a blue panel headed 'banks' contains eight small boxes labelled b0 to b7, with the note 'each has its own row buffer, so eight rows can be open at once'. On the right, a red panel headed 'channels' contains two larger boxes labelled channel 0 and channel 1, with the note 'separate paths to the CPU — two channels, twice the bandwidth'. A grey box below reads: so a single access still takes about 100 nanoseconds, but dozens of them can be in flight at the same time, which is why bandwidth is measured in gigabytes per second. A caption notes this is the same distinction as the pipelining lesson: latency is how long one thing takes, throughput is how many finish per second — memory improved one of them.">

Nothing here makes one access quicker. It makes many accesses overlap.

</Diagram>

**Banks** divide a chip into independent sections, each with its own row buffer. Eight banks means eight rows can be open simultaneously, and while one bank is activating a row, another can be reading and a third can be refreshing. The slow four-step sequence still takes as long as it takes — but several sequences overlap.

**Channels** are separate physical paths between the CPU and memory. A dual-channel system has two, so it can move twice as much data at once. This is why memory is usually sold in matched pairs, and why installing one stick instead of two can measurably slow a machine down even though the capacity is the same.

If that pattern sounds familiar, it should: this is **pipelining**, from Module 0.3, applied to memory. Latency is how long one operation takes; throughput is how many finish per second. Overlapping operations improves the second and does nothing for the first.

Which is exactly what happened over three decades of memory development.

## Measured: the gap between accesses {/*measured-the-gap*/}

Time to see all of this in one measurement. Here is a program walking through 512 megabytes — far more than any cache can hold — reading one byte every *N* bytes, with *N* growing from 4 to 65,536:

<Diagram name="how-ram-works/stride_measured" height={440} width={720} alt="A line chart titled 'measured: walking 512 MB with a growing gap between accesses'. The horizontal axis is the stride in bytes on a logarithmic scale from 4 B to 64 KB; the vertical axis is nanoseconds per access from about 1 to 27. A blue line rises from 2.04 ns at a 4-byte stride, through 3.15 ns at 32 bytes, jumping to 6.12 ns at 64 bytes and 10.19 ns at 128 bytes, then plateauing around 11 to 13 ns through the middle strides before climbing again to 25.44 ns at 64 KB. Two vertical dashed lines mark 'one cache line' at 64 bytes and 'one page' at 4096 bytes. Annotations read '16 reads share one line', 'one read per line' and 'the prefetcher gives up'. Captions read: 3.15 ns at a 32-byte gap, 6.12 ns at 64 — the cost doubles exactly where a second cache line becomes necessary for every access; then a slow climb as the prefetcher, the row buffer and the address translation tables each run out of usefulness in turn.">

Real measurements on 512 MB. Each bend in the line is a different mechanism giving up.

</Diagram>

<TerminalBlock>

./stride

   stride    ns/access
      4 B       2.04 ns
     16 B       2.41 ns
     32 B       3.15 ns
     64 B       6.12 ns
    128 B      10.19 ns
    256 B      11.46 ns
   1024 B      11.85 ns
   4096 B      15.58 ns
  16384 B      19.26 ns
  65536 B      25.44 ns

</TerminalBlock>

Read that curve from left to right and it narrates the whole memory system:

**4 to 32 bytes** — several accesses share one 64-byte cache line, so the cost per access is tiny. At a 4-byte stride, sixteen reads come out of a single line.

**32 to 64 bytes** — the cost roughly doubles, from 3.15 to 6.12 ns. This is the cache line boundary, visible as an unambiguous step: at a 32-byte stride you need one new line per two accesses; at 64 you need one per access.

**64 to 2048 bytes** — a plateau around 11 to 13 ns. Each access needs a new cache line, but the pattern is perfectly regular, so the **prefetcher** stays ahead of it and the row buffer keeps being reused. The memory system is working hard and hiding it well.

**Past 4096 bytes** — the climb resumes. Several things give up around here at once: strides this large start crossing memory **pages**, which brings address translation into play; the prefetcher's usefulness drops; and consecutive accesses no longer land in the same DRAM row.

Notice what the numbers *do not* show: nothing on this curve reaches the 156 ns of a fully random access. Even a 64 KB stride is still a **predictable** pattern, and the machine can prepare for it. To reach full latency you have to remove predictability entirely — which is what the pointer chase in the previous lesson did.

That is the practical summary of this whole lesson: **memory is not slow or fast. It is slow or fast depending on whether it can see you coming.**

<DeepDive>

#### One number moved. The other did not. {/*one-number-moved*/}

Four generations of memory, with the specification arithmetic done for each:

<Diagram name="how-ram-works/latency_vs_bandwidth" height={440} width={720} alt="A chart titled 'four generations of memory: one number moved, the other did not'. The horizontal axis lists DDR3-1600, DDR4-2400, DDR4-3200 and DDR5-6000. A blue line labelled 'bandwidth, GB/s' rises steeply through the values 12.8, 19.2, 25.6 and 48.0. A red line labelled 'CAS latency, ns' stays nearly flat through 13.8, 14.2, 10.0 and 10.0. Below, two monospace lines summarise: bandwidth 12.8 to 48.0 GB/s, times 3.8; latency 13.8 to 10.0 ns, times 0.7. A final caption reads: you can widen a road, you cannot easily shorten it.">

Two lines, thirty years, and only one of them going anywhere.

</Diagram>

```
 label            clock      1 cycle    CAS latency    peak per channel
 DDR3-1600 CL11    800 MHz   1.250 ns      13.8 ns          12.8 GB/s
 DDR4-2400 CL17   1200 MHz   0.833 ns      14.2 ns          19.2 GB/s
 DDR4-3200 CL16   1600 MHz   0.625 ns      10.0 ns          25.6 GB/s
 DDR5-6000 CL30   3000 MHz   0.333 ns      10.0 ns          48.0 GB/s
```

Look at what happened across those generations. **Bandwidth nearly quadrupled.** **Latency improved by about a quarter** — and note that CL *rose* from 11 to 30 while the latency in nanoseconds stayed roughly flat, because faster cycles and more cycles cancelled out.

Why the asymmetry? Because bandwidth and latency are limited by different things.

Bandwidth is a question of **parallelism and signalling**: add channels, add banks, run the bus faster, transfer on more edges. All of these are engineering problems with engineering answers, and they have been solved repeatedly.

Latency is a question of **physics and sequence**. A capacitor takes a certain time to discharge onto a wire. A sense amplifier takes a certain time to resolve a faint difference. The signal takes a certain time to cross the board. These steps must happen in order, and none of them gets much faster when you add more hardware — you cannot parallelise a single sequence of dependent physical events.

The metaphor is a road. You can add lanes, and traffic per hour goes up dramatically. You cannot make the road shorter, so any individual journey takes the same time it always did.

This asymmetry has shaped software profoundly, and it is why the advice in the previous three lessons keeps taking the same form. Programs that need *volume* of data have been well served by thirty years of memory progress. Programs that need to *chase one pointer after another* have been served almost not at all — and that is why array-shaped code has quietly been getting relatively faster than pointer-shaped code for decades.

</DeepDive>

<DeepDive>

#### The page boundary in the measurement {/*the-page-boundary*/}

One feature of the stride curve deserves an explanation, because it comes from something this course has not covered yet: the jump at a stride of **4096 bytes**, from 12.85 ns to 15.58 ns.

4096 bytes is the size of a **memory page**, and it is the unit in which the operating system manages memory. Here is the minimum needed to read that part of the graph.

The addresses your program uses are not the addresses the memory chips use. Your program sees a private, tidy **virtual address space**; the hardware translates every access into a **physical address** before it reaches memory. The translation is done page by page — a table says "virtual page 12 lives at physical page 4,891" — and there are a great many pages, so the table itself lives in memory.

Which would be catastrophic: every memory access would need a memory access to translate it first. So there is a cache for translations, called the **TLB** (translation lookaside buffer), holding the most recently used mappings. Like every cache in this course, it is small and it can miss.

Now the curve explains itself. A stride smaller than 4096 bytes keeps landing in the same page, so one translation serves many accesses. A stride of 4096 or more touches a **new page on every access** — a fresh translation each time, and eventually more pages than the TLB can hold. The extra nanoseconds are the cost of looking up where the data actually is, before going to get it.

This is a good example of why measured curves are worth reading closely: that small step is a whole subsystem announcing itself. Virtual memory and the TLB have their own treatment later; for now the useful takeaway is that **large strides cost more than the cache alone can explain**, and the reason has a name.

</DeepDive>

<Pitfall>

**Faster RAM is rarely the upgrade you think it is.**

Memory is sold on two numbers, and it is easy to assume that a bigger first number and a smaller second one will make a computer faster. Sometimes it does. Usually it barely registers, and the reason follows directly from this lesson.

**Latency improvements are small and getting smaller.** Moving from `CL16` to `CL14` at the same speed shaves a couple of nanoseconds off one step of a path that measures over a hundred. It is a real improvement of a few percent on the part it affects, and a rounding error on the whole.

**Bandwidth improvements only help if you are bandwidth-limited.** Most programs are not. They are limited by *latency* — waiting for one value in order to compute the address of the next — and doubling the width of the road does nothing for a car that is stuck at a junction. The programs that genuinely benefit are the ones streaming large volumes: video encoding, large simulations, in-memory analytics, and notably **integrated graphics**, which have no dedicated memory of their own and share the system's.

**Channels matter more than the headline numbers.** Installing one stick where the board supports two halves your bandwidth, and this is a real and common mistake. Two smaller matched sticks usually beat one large one.

**Capacity beats speed, until it doesn't.** If a machine has too little memory it will swap, and swapping moves the working set from the 156-nanosecond rung to the 74-microsecond rung — a catastrophe next to which every timing figure on this page is noise. Enough RAM first; fast RAM a distant second.

The honest summary: for typical work, memory speed is one of the least effective things to spend money on, and *how your program accesses memory* is one of the most effective things to spend attention on.

</Pitfall>

## Open a row yourself {/*open-a-row-yourself*/}

Here is one DRAM bank, simplified down to eight rows of eight columns. It behaves exactly as the four steps described: one row can be open at a time, held in the row buffer, and asking for an address in a different row means closing the current one first.

Pick an access pattern and step through it. Watch the row buffer, and watch the running total.

The comparison worth making is between the first two patterns. **In order** walks along each row before moving to the next, so it activates a row once and then reads it eight times. **Down the columns** asks for one byte from each row in turn — the same sixty-four bytes, in a different order — and pays for an activate on every single access.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const ROWS = 8, COLS = 8;
const HIT_NS = 15;      // read from an already-open row
const MISS_NS = 45;     // precharge + activate + sense + read

const PATTERNS = [
  ['in order', 'seq', 'row 0 columns 0-7, then row 1, and so on'],
  ['down the columns', 'col', 'column 0 of every row, then column 1, …'],
  ['one row, over and over', 'same', 'row 3, all eight columns, four times'],
  ['random', 'rand', 'sixty-four addresses in random order'],
];

function build(kind) {
  const out = [];
  if (kind === 'seq') for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) out.push([r, c]);
  if (kind === 'col') for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) out.push([r, c]);
  if (kind === 'same') for (let k = 0; k < 4; k++) for (let c = 0; c < COLS; c++) out.push([3, c]);
  if (kind === 'rand') {
    let s = 987654321;
    const all = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) all.push([r, c]);
    while (all.length) { s = (s * 1103515245 + 12345) % 2147483648; out.push(all.splice(s % all.length, 1)[0]); }
  }
  return out;
}

export default function DramLab() {
  const [kind, setKind] = useState('seq');
  const [step, setStep] = useState(0);

  const seq = build(kind);

  // replay to get the current state
  let open = null, hits = 0, misses = 0;
  for (let k = 0; k < step; k++) {
    const [r] = seq[k];
    if (open === r) hits++; else { misses++; open = r; }
  }
  const done = step >= seq.length;
  const cur = done ? null : seq[step];
  const willHit = cur !== null && open === cur[0];
  const ns = hits * HIT_NS + misses * MISS_NS;
  const best = step * HIT_NS;

  const pick = (label, k) => (
    <button key={k} onClick={() => { setKind(k); setStep(0); }} style={{
      margin: 2, padding: '4px 10px', fontSize: 12.5, borderRadius: 6, cursor: 'pointer',
      border: `2px solid ${kind === k ? ACC : '#888'}`,
      background: kind === k ? `${ACC}1e` : 'transparent',
      color: kind === k ? ACC : 'inherit', fontWeight: kind === k ? 'bold' : 'normal',
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>{PATTERNS.map(([l, k]) => pick(l, k))}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#888', marginBottom: 10 }}>
        {PATTERNS.find(([, k]) => k === kind)[2]}
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setStep(Math.min(step + 1, seq.length))} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>next access</button>
        <button onClick={() => setStep(seq.length)} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>run to the end</button>
        <button onClick={() => setStep(0)} style={{ fontSize: 15, padding: '4px 14px' }}>reset</button>
        <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
          {Math.min(step + (done ? 0 : 1), seq.length)} of {seq.length}
        </span>
      </div>

      {/* the bank */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>the cell array</div>
          {Array.from({ length: ROWS }, (_, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <span style={{
                width: 46, fontSize: 11, fontFamily: 'monospace',
                color: open === r ? ACC : '#888',
              }}>row {r}</span>
              {Array.from({ length: COLS }, (_, c) => {
                const isTarget = cur && cur[0] === r && cur[1] === c;
                const inOpenRow = open === r;
                return (
                  <div key={c} style={{
                    width: 26, height: 24, margin: 1, borderRadius: 4, fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${isTarget ? DNG : inOpenRow ? ACC : '#8886'}`,
                    background: isTarget ? `${DNG}33` : inOpenRow ? `${ACC}22` : 'transparent',
                  }} />
                );
              })}
              {open === r && (
                <span style={{ marginLeft: 8, fontSize: 11, color: ACC }}>open</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>the row buffer</div>
          <div style={{
            padding: '10px 12px', borderRadius: 9, minHeight: 54,
            border: `2px solid ${open === null ? '#888' : ACC}`,
            background: open === null ? 'transparent' : `${ACC}14`,
          }}>
            {open === null ? (
              <span style={{ color: '#888' }}>empty — nothing has been activated yet</span>
            ) : (
              <>
                <b style={{ fontFamily: 'monospace', color: ACC }}>holding row {open}</b>
                <div style={{ fontSize: 12, color: '#888' }}>
                  all eight of its columns are amplified and ready
                </div>
              </>
            )}
          </div>

          <div style={{
            marginTop: 10, padding: '9px 12px', borderRadius: 9,
            border: `2px solid ${done ? ACC : willHit ? ACC : DNG}`,
            background: done ? `${ACC}10` : willHit ? `${ACC}14` : `${DNG}14`,
          }}>
            {done ? (
              <b style={{ color: ACC }}>finished all {seq.length} accesses</b>
            ) : (
              <>
                <b style={{ color: willHit ? ACC : DNG }}>
                  next: row {cur[0]}, column {cur[1]} &rarr; {willHit ? 'row buffer HIT' : 'row buffer MISS'}
                </b>
                <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                  {willHit
                    ? `row ${cur[0]} is already open — just read the column (${HIT_NS} ns)`
                    : open === null
                      ? `activate row ${cur[0]}, sense it, then read (${MISS_NS} ns)`
                      : `precharge row ${open}, activate row ${cur[0]}, sense, read (${MISS_NS} ns)`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: 'monospace', fontSize: 14 }}>
        <span style={{ color: ACC }}>row hits: {hits}</span>
        <span style={{ color: DNG }}>activates: {misses}</span>
        <span>total: <b>{ns} ns</b></span>
        {step > 0 && (
          <span style={{ color: '#888' }}>
            {(ns / best).toFixed(1)}× the cost of all hits
          </span>
        )}
      </div>

      <p style={{ fontSize: 12.5, color: '#888', marginTop: 10 }}>
        Simplified: one bank, eight rows, and fixed costs of {HIT_NS} ns for a hit and{' '}
        {MISS_NS} ns for a miss. Real chips have thousands of rows, several banks
        working in parallel, and a row of about a kilobyte rather than eight bytes.
      </p>
    </div>
  );
}
```

</Sandpack>

Run "in order" and then "down the columns" to the end and compare the totals. Both read all sixty-four addresses. The first pays for **eight** activates; the second pays for **sixty-four**. Same data, same chip, same amount of information delivered — and the only difference is the order in which it was asked for.

That is the whole lesson in one number, and it is the same number the previous lesson found at the cache level and at the disk level. The hierarchy is unanimous on this point.

<Recap>

- One bit of main memory is a **capacitor** (holding charge: full is 1, empty is 0) guarded by **one transistor**. Cache memory uses about **six transistors** per bit instead — three times the components, roughly a hundred times the cost per byte, and that ratio is why you have gigabytes of one and kilobytes of the other. Robert Dennard invented the cell at IBM in **1966**.
- The capacitor **leaks**, so every row must be read and written back within **64 milliseconds**. DDR4 issues **8,192 refresh commands** per window — one every **7.8 µs**. That is the *D* in DRAM, and it is why idle memory still draws power.
- Cells are arranged as a **grid**, and an address splits into *which row* and *which column*. A real row holds about **1–2 KB**.
- Reading takes four steps: **ACTIVATE** (open the row, releasing every capacitor in it), **SENSE** (amplify the faint charges into the **row buffer**), **READ** (finally select your column), and **PRECHARGE** (write the whole row back, because reading *drained* the capacitors). A DRAM read is **destructive**.
- Therefore a **row buffer hit** — asking for another column of the row that is already open — skips three of the four steps and is several times cheaper. Sequential access hits repeatedly; random access misses every time. This is the cache-line argument one level lower, at a granularity of a kilobyte instead of 64 bytes.
- `DDR4-3200 CL16` decodes as: **D**ouble **D**ata **R**ate, **3,200 MT/s** (so a 1,600 MHz clock), and **16 cycles** of CAS latency = **10.0 ns**. But a measured random access on this machine took **156 ns**, because CL covers only step 3 — precharge, activate, sense, address translation, queueing and the bus trip are all extra. **CL16 does not mean 16 ns memory.**
- Memory gained speed through **parallelism**, not shorter operations: **banks** let several rows be open at once, **channels** provide separate paths to the CPU. This is pipelining applied to memory — better throughput, unchanged latency.
- Across four generations, **bandwidth grew ~3.8×** (12.8 → 48.0 GB/s) while **CAS latency improved ~0.7×** (13.8 → 10.0 ns). You can widen a road; you cannot easily shorten it.
- Measured stride sweep over 512 MB: **3.15 ns** at a 32-byte gap and **6.12 ns** at 64 — the cost doubles exactly at the cache line boundary — then a plateau near 11–13 ns while the prefetcher and row buffer cope, then a climb past the **4096-byte page** boundary as address translation starts to cost. Nothing predictable ever reached the 156 ns of a truly random access.

</Recap>

<Challenges>

#### Do the module arithmetic {/*do-the-module-arithmetic*/}

A memory module is labelled `DDR5-5600 CL40`. (a) What is its actual clock frequency? (b) How long is one clock cycle? (c) What is the CAS latency in nanoseconds? (d) A friend says "CL40 is terrible, my old DDR4 was CL16." What is wrong with that comparison?

<Hint>

The headline number is transfers per second, and DDR does two per clock cycle. For (d), work out the DDR4 figure in nanoseconds and compare like with like.

</Hint>

<Solution>

**(a)** The 5600 is transfers per second, and DDR transfers twice per clock:

```
 clock = 5600 / 2 = 2,800 MHz
```

**(b)** One cycle:

```
 1 / 2,800,000,000 s = 0.357 ns
```

**(c)** CAS latency:

```
 40 cycles × 0.357 ns = 14.3 ns
```

**(d) The comparison is wrong because CL is measured in cycles, not in time.** A cycle on DDR5-5600 is much shorter than a cycle on DDR4-3200, so more of them can fit in the same amount of real time:

```
 DDR4-3200 CL16:  16 × 0.625 ns = 10.0 ns
 DDR5-5600 CL40:  40 × 0.357 ns = 14.3 ns
```

So in this particular pairing the friend is *accidentally right about the direction* — 14.3 ns is worse than 10.0 ns — but for entirely the wrong reason, and the size of the difference is nothing like 40-versus-16 suggests. A DDR5-6000 CL30 module comes out at exactly 10.0 ns, identical to the DDR4 part, despite a CL almost twice as large.

**Always convert CL to nanoseconds before comparing across generations.** And then remember the more important point from this lesson: on a real random access measured at 156 ns, a difference of 4 ns in one step is under 3% of the path.

</Solution>

#### Count the activates {/*count-the-activates*/}

A DRAM row holds 1,024 bytes. A program reads 4,096 consecutive bytes, one byte at a time. Ignore caches for this question and assume every read reaches the memory chip.

(a) How many rows does the data span? (b) How many ACTIVATE operations are needed? (c) How many row buffer hits? (d) Now the same 4,096 bytes are read in random order. How many activates, in the worst case?

<Solution>

**(a)** The data spans:

```
 4,096 / 1,024 = 4 rows
```

**(b)** Reading in order, each row is opened once and then read from repeatedly:

```
 4 ACTIVATE operations
```

**(c)** Every access except the first one in each row finds its row already open:

```
 total accesses      4,096
 activates              4
 row buffer hits    4,092     → a hit rate of 99.9%
```

**(d) Random order, worst case: up to 4,095 activates.** With only one row open at a time, every access that lands in a different row than the previous one forces a precharge and a fresh activate. In random order across four rows, roughly three quarters of consecutive accesses land in a different row — so around 3,000 activates in practice, and up to 4,095 if the order is maximally unhelpful.

Using this lesson's simplified costs of 15 ns for a hit and 45 ns for a miss:

```
 in order:  4 × 45 + 4,092 × 15  =    61,560 ns
 random:  ~3,072 × 45 + ~1,024 × 15  =  153,600 ns   → about 2.5× worse
```

And that is with only **four** rows to choose between. Spread the same accesses over a realistic address space of millions of rows and essentially every access becomes a miss — which is precisely why the measured random-access figure was 156 ns while the sequential figure was around 2 ns.

</Solution>

#### The upgrade request {/*the-upgrade-request*/}

Transfer task. A colleague files a hardware request: *"Our data processing job takes 40 minutes. I've profiled it and it's memory-bound — the CPU is only at 30% utilisation. I want to replace our DDR4-3200 CL16 memory with DDR4-3600 CL14, which is both faster and lower latency. That should cut the runtime meaningfully."*

Assess the reasoning. What does "memory-bound" leave unresolved, what would you measure, and what would you expect the proposed upgrade to actually deliver?

<Solution>

**What is right about the reasoning.** The diagnosis is a good start: 30% CPU utilisation on a busy job genuinely does suggest the processor is waiting rather than computing, and memory is a reasonable suspect. They also profiled before proposing, which is more than most requests manage.

**What "memory-bound" leaves unresolved** is the distinction this lesson is built on: **bandwidth-bound or latency-bound?** They are different problems with different fixes, and the proposed upgrade helps mainly with one of them.

- **Bandwidth-bound** means the job is streaming through large volumes of data and the memory bus is saturated. Faster memory helps here, roughly in proportion to the bandwidth increase.
- **Latency-bound** means the job is waiting on individual dependent accesses — chasing pointers, hopping around a hash table, walking a tree. Faster memory barely helps, because the bottleneck is a sequence of physical steps that does not shrink.

There is also a third possibility the CPU figure cannot rule out: the job may be waiting on **disk or network**, which would show up as low CPU utilisation too and which memory cannot fix at all.

**What I would measure:**

- **Memory bandwidth utilisation.** If the job is using a large fraction of theoretical peak, it is bandwidth-bound. If it is using a small fraction while still stalling, it is latency-bound.
- **Cache miss counts and stall cycles**, to confirm the stalls really are memory rather than something else.
- **I/O wait**, to rule out disk and network before buying RAM.
- **A cheap experiment:** run the job on a machine that already has faster memory, or artificially reduce the memory clock on the current one and see how much the runtime moves. If halving the memory speed barely changes the runtime, doubling it will not help either — and that experiment costs nothing.

**What the proposed upgrade would actually deliver:**

```
 bandwidth:  3200 → 3600 MT/s              = +12.5%
 CAS:        16 × 0.625 = 10.0 ns
             14 × 0.556 = 7.8 ns           = −2.2 ns on one step
```

So about 12% more bandwidth and roughly two nanoseconds off one component of a path measured in the hundreds. If the job is genuinely bandwidth-saturated, expect a few percent — perhaps 40 minutes becoming 37. If it is latency-bound, expect approximately nothing.

**What I would suggest instead.** Check first whether the memory is running in **dual channel**; a single stick is a far bigger and cheaper problem to fix than a module upgrade. Then look at the access pattern, because this lesson's own measurements put the available gains in perspective: sequential access was around 2 ns per access and random access 156 ns, a factor of nearly eighty. No memory purchase available at any price offers a factor of eighty. Restructuring the job's data access might.

The habit worth taking away: **"memory-bound" is a category, not a diagnosis.** Bandwidth and latency are separate ceilings, and only one of them is for sale. ✓

</Solution>

</Challenges>

<LearnMore title="Stack vs Heap" path="/learn/faza-0/modul-0-4/stack-vs-heap">

You now know what memory *is*, physically — a grid of leaky capacitors that answers in rows. What you have not seen is how a running program divides that memory up and decides where each of your variables goes. Next lesson: the two regions every program uses, why one of them is almost free and the other requires bookkeeping, why a function's local variables vanish when it returns while an allocated object does not, and what actually happens when a program recurses too deeply.

</LearnMore>
