---
title: "CPU Cache: L1, L2, L3"
---

<Intro>

In 1965 an English computer scientist named Maurice Wilkes published a two-page paper with an unremarkable title and a strange idea inside it. Computers, he pointed out, spend most of their time waiting for memory — so what if you gave the processor a second, much smaller memory, sitting right beside it, which automatically kept copies of whatever the program had been using lately? The programmer would not have to manage it. The programmer would not even have to know it existed. It would simply notice what was being used and keep it close. Wilkes called it a "slave memory"; three years later IBM shipped the first commercial machine with one and the name that stuck was **cache**. Today it is not a small addition to a processor — on a modern chip, the caches occupy a large share of the silicon, often more area than the parts that do the actual computing. This lesson is about what that silicon does, and why the single most useful thing you can know about performance is how it behaves. Everything here has been measured on the machine that generated this page, including one program that got **seventeen times slower** because two lines were written in the wrong order.

</Intro>

<YouWillLearn>

- Why memory is slow in the first place — not a design flaw, but distance and physics
- What a **cache** is, using an analogy you already live with every day
- The two habits of real programs (**temporal** and **spatial locality**) that make caching work at all
- What a **cache line** is, and why asking for 4 bytes gets you 64
- What a **hit** and a **miss** are, and why a 95% hit rate can still mean the machine spends most of its time waiting
- Why there are three caches instead of one, and what each is for
- How to make code cache-friendly — and the measured 17× that comes from getting it wrong

</YouWillLearn>

<InlineToc />

## Why memory is slow {/*why-memory-is-slow*/}

Every lesson in this module has mentioned the same awkward fact: reading from a register takes about one clock cycle, and reading from main memory takes a few hundred. It is worth spending a moment on *why*, because the reason is not that memory chips are badly made.

Three things add up.

**Distance.** Main memory is not on the processor. It is a separate set of chips, centimetres away across a circuit board. From the clock lesson: at 3 GHz, a signal travels only about five centimetres in a single clock tick — so simply getting a request out to the memory chips and an answer back costs several ticks before anything has been looked up.

**The memory itself is slow by design.** Main memory is **DRAM**, and it stores each bit as a tiny electrical charge in a capacitor. Charges leak away, so DRAM has to be continually refreshed, and reading a bit means detecting a very small charge carefully rather than quickly. In exchange you get memory that is extremely cheap and extremely dense — which is why you have gigabytes of it. The registers and caches inside a CPU use a different, faster, much larger-per-bit design called **SRAM**, and that is exactly why you have so little of it.

**Everyone is queueing for it.** As the multicore lesson showed, all the cores share one path to memory. Even if a request were fast, it may have to wait behind others.

None of this can be fixed. Memory is cheap and slow; there is no version that is cheap and fast. So instead of fixing it, computer architects worked around it — and the workaround is the subject of this lesson.

## The idea: keep a copy of what you are using {/*the-idea-keep-a-copy*/}

Here is Wilkes's idea, in a form you already use without thinking about it.

Imagine you are working at a desk in a library.

<Diagram name="cpu-cache/desk_analogy" height={400} width={720} alt="A diagram titled 'your desk, your shelf, the library' showing three horizontal bars of increasing length. The shortest blue bar is labelled 'your desk', holds 3 books, is reached by 'reach out your hand', and costs 'instant'. A longer blue bar is labelled 'the shelf behind you', holds 50 books, reached by 'stand up and turn round', costing 'a few seconds'. The longest red bar is labelled 'the city library', holds everything, reached by 'put your coat on and travel', costing 'half an hour'. Captions read: nobody plans which three books go on the desk, whatever you just used stays there; and: that is the entire idea of a cache, and the reason it needs no help from you.">

Three places to keep a book, and no planning involved anywhere.

</Diagram>

Three books fit on your desk, and reaching them costs nothing. Fifty more are on the shelf behind you, a few seconds away. Everything else is in the city library, half an hour each way.

Now here is the important part, and it is the part that makes a cache work: **nobody plans which three books belong on the desk.** You do not think about it at all. You fetch a book, use it, and leave it there. When the desk fills up and you need something new, whichever book you have not touched for longest gets put back.

That simple, thoughtless policy is remarkably effective — and it is exactly what a CPU cache does. A **cache** is a small, fast memory that automatically keeps copies of recently used data from a larger, slower memory. When the processor asks for an address, the cache is checked first. If the data is there, the answer comes back almost immediately. If not, the slow trip happens, and the data is kept on the way back, in case it is wanted again.

Nothing in your program says "put this in the cache." There is no instruction for it and no API. It happens underneath everything you write, always.

## Why it works: two habits of real programs {/*why-it-works-two-habits*/}

Keeping recent data close is only useful if programs actually reuse recent data. Do they?

They do — reliably enough that the whole edifice rests on it. Real programs have two habits, and they have names:

<Diagram name="cpu-cache/locality_two_kinds" height={420} width={720} alt="A diagram titled 'the two habits that make caching work', showing two panels. The left blue panel is headed 'used it recently? you will probably use it again' with the code example 'total = total + price[i]' and the note that total is touched on every single pass through the loop; it is labelled 'temporal locality — again, soon'. The right red panel is headed 'used address 1000? you will probably use 1004 next' with the code example 'for (i = 0; i < n; i++)' and the note that array elements sit next to each other and you walk them in order; it is labelled 'spatial locality — nearby, soon'. Captions read: neither is a law, they are habits of real programs, and they are so reliable that a small cache holding recent and nearby data catches the great majority of accesses; the first habit says keep what was just used; the second says when you fetch something, grab its neighbours too.">

Two observations about ordinary code. Every cache design is a consequence of them.

</Diagram>

**Temporal locality** — "again, soon." If a program touches a piece of data, it will probably touch it again shortly. Think of a loop counter, an accumulator, the current object being processed, the function you are inside. In this loop:

```c
long total = 0;
for (int i = 0; i < n; i++)
    total = total + price[i];
```

`total`, `i` and `n` are read and written on *every single iteration*. Keeping them close pays for itself thousands of times over.

**Spatial locality** — "nearby, soon." If a program touches address 1000, it will probably touch 1004 and 1008 shortly. This is because data is usually arranged in groups — arrays, structs, strings — and code usually walks through those groups in order. In the same loop, `price[0]`, `price[1]`, `price[2]` sit next to each other in memory and are visited in that order.

Neither habit is a law of nature. You can write a program that violates both, and later in this lesson you will see one, and see what it costs. But normal code obeys them so consistently that a cache of a few tens of kilobytes typically satisfies **over 90%** of all memory accesses.

The two habits also suggest two different design decisions, and a real cache does both:

- Because of temporal locality: **keep what was just used.**
- Because of spatial locality: **when you fetch something, fetch its neighbours too.**

That second decision has a bigger consequence than it sounds.

## The cache never moves one byte {/*the-cache-never-moves-one-byte*/}

Ask the cache for four bytes and you do not get four bytes. You get sixty-four.

<Diagram name="cpu-cache/cache_line" height={400} width={720} alt="A diagram titled 'you asked for one byte, you got sixty-four'. At the top, the code 'int x = data[0];' with the note 'your program wants 4 bytes'. An arrow points down to a row of sixteen small boxes labelled with byte offsets 0, 4, 8 and so on; the first box is highlighted in blue and labelled 'wanted', while the remaining fifteen are grey and labelled 'came along for free'. Below, a single wide red bar reads 'one 64-byte cache line — the smallest thing a cache can hold or move'. Captions read: this is why walking an array in order is so fast — the first access pays for the trip and the next fifteen are already sitting in the cache; and why jumping around is so slow — every jump pays full price for 64 bytes, and then throws away the 60 it did not want.">

The smallest thing memory will hand over. Four bytes were wanted; sixty-four arrived.

</Diagram>

Memory is only ever transferred in fixed-size blocks called **cache lines**, and on essentially every current processor a line is **64 bytes**. You can check it on any Linux machine:

<TerminalBlock>

getconf LEVEL1_DCACHE_LINESIZE

64

</TerminalBlock>

Why work in blocks at all? Because of spatial locality. If you are probably going to want the neighbours anyway, fetching them together costs almost nothing extra — the expensive part of a memory trip is the trip, not the amount carried. It is the difference between making one journey to the library and carrying back an armful, versus making sixteen journeys for one book each.

This single design choice explains a great deal of what follows:

- **Walking an array in order is fast.** The first element costs a full trip to memory; the next fifteen (for 4-byte integers) are already in the cache, free.
- **Jumping around is slow.** Every jump lands in a different line, pays the full cost of fetching 64 bytes, and uses only 4 of them. Fifteen sixteenths of the work is wasted.

Hold on to that ratio. It is where the 17× at the end of this lesson comes from.

## Hit, miss, and why 95% is not enough {/*hit-miss-and-why-95-is-not-enough*/}

Two words for the two things that can happen:

<Diagram name="cpu-cache/hit_and_miss" height={450} width={720} alt="A diagram titled 'two things that can happen when you read memory'. The left blue panel headed 'a HIT' lists three steps: the CPU asks the cache, the cache has it, hand it over — costing 'about 4 cycles'. The right red panel headed 'a MISS' lists five steps: the CPU asks the cache, the cache has not got it, ask the next level down, wait and wait, store the line then hand it over — costing 'up to 400+ cycles'. Below, a grey box headed 'why 95% is not good enough' shows the calculation: 95 hits times 4 cycles plus 5 misses times 200 cycles equals 380 plus 1000 equals 1380, with the note that the 5% of accesses that missed used 72% of the total time. Captions read: this is why cache behaviour dominates performance — the misses are so much more expensive than the hits that a small change in hit rate moves everything.">

Two paths, fifty times apart in cost — which is why the rare one dominates the total.

</Diagram>

A **hit** means the data was in the cache. A **miss** means it was not, and the slow path has to run.

The fraction of accesses that hit is called the **hit rate**, and for ordinary programs it is genuinely high — 90%, 95%, sometimes 99%. Which sounds like a solved problem, until you notice how lopsided the costs are. Work through 100 accesses at a 95% hit rate:

```
 95 hits   × 4 cycles   =   380 cycles
  5 misses × 200 cycles = 1,000 cycles
                          ─────────────
                          1,380 cycles

 the 5% that missed consumed 72% of the time
```

Five percent of the accesses did nearly three-quarters of the waiting. That asymmetry is the single most important thing to understand about caches, and it has a practical consequence: **small changes in hit rate produce large changes in runtime.** Improving from 95% to 99% removes four fifths of the misses and can nearly halve a program's execution time, while doing nothing at all to the instructions it executes.

It also explains why cache behaviour so often dominates performance in practice. Two programs with identical instruction counts can differ by an order of magnitude, and the difference is entirely in how many of their accesses missed.

## Three levels, and why not one {/*three-levels-and-why-not-one*/}

If a cache is so useful, why not build one huge one?

Because size and speed are in direct conflict. A bigger store takes longer to search, needs more wiring, and physically cannot sit as close to the core. From the clock lesson: whatever the slowest path is sets the clock for everything. A cache large enough to hold everything would be too slow to be worth having.

So processors build **several caches**, each one catching what the level above it missed:

<Diagram name="cpu-cache/three_levels" height={460} width={720} alt="A diagram titled 'why three caches instead of one' showing five horizontal bars of increasing length. Registers: a few hundred bytes, 1 cycle. L1: 32 KB, about 4 cycles. L2: 1 MB, about 12 cycles. L3: 33 MB, about 40 cycles. Main memory: 16 GB, about 400 cycles. The first three bars are blue, L3 is grey and main memory is red. Captions read: a cache can be small and fast, or big and slow, never both, because finding something in a bigger store takes longer and sits further from the core; so build several, and let each one catch what the one above it missed.">

Each level is a compromise between how much it holds and how fast it answers.

</Diagram>

The names are just the order they are checked in:

- **L1** ("level 1") is tiny and almost instant. Each core has its own, and it is usually split in two: one part for instructions, one for data.
- **L2** is bigger and a little slower. Usually private to a core as well.
- **L3** is much bigger and shared by all the cores on the chip. It is also the last stop before the long trip to memory.

When the processor needs an address it checks L1; on a miss it checks L2; on a miss it checks L3; on a miss it goes to memory. Each level is a bet that what the previous level could not hold might still be worth keeping nearby.

The sizes in that diagram are the real values from the machine that produced this page:

<TerminalBlock>

lscpu | grep -E 'L1d|L2|L3'

L1d cache:   32 KiB
L2 cache:    1 MiB
L3 cache:    33 MiB

</TerminalBlock>

## Measured on this machine {/*measured-on-this-machine*/}

Now for the part that turns all of the above from a story into a fact. Here are two programs, run on that same machine.

Both read the same amount of data. The **first** walks straight through it in order. The **second** follows a chain of random jumps, where each step's address depends on the previous step's value — which means nothing can be guessed in advance. Both are run over a range of data sizes, from 8 KB (fits comfortably in L1) to 512 MB (fits in nothing).

<Diagram name="cpu-cache/latency_staircase" height={470} width={720} alt="A chart on logarithmic axes titled 'the same machine, measured two ways', plotting time for one memory access against data size from 4 KB to 512 MB. A red line labelled 'jumping about randomly' starts flat at 1.5 nanoseconds for small sizes, then climbs in steps through 4, 10 and 28 nanoseconds, reaching 156 nanoseconds at 512 MB. A blue line labelled 'walking in order' stays almost flat at just over 2 nanoseconds across the entire range, rising only slightly at the largest sizes. Vertical dashed lines mark where L1, L2 and L3 end. Captions read: the red line is the real cost of memory, 1.5 ns when it fits in L1 and 156 ns when it does not; the blue line is the same machine reading the same amount of data, in order; your data size decides which caches can hold it; your access pattern decides whether that matters.">

Two lines from one machine. The gap between them is entirely about access order.

</Diagram>

Look at the red line first. It is a staircase, and every step is a cache running out of room:

<TerminalBlock>

./chase

      size   level    ns/access
      8 KB     L1       1.5 ns
     32 KB     L1       1.5 ns
    128 KB     L2       4.1 ns
   1024 KB     L2       9.7 ns
   4096 KB     L3      27.6 ns
  32768 KB     L3     116.5 ns
 131072 KB    RAM     131.1 ns
 524288 KB    RAM     155.9 ns

</TerminalBlock>

The same operation — read one value from memory — costs **1.5 nanoseconds** when the data fits in L1 and **156 nanoseconds** when it does not. That is a **hundredfold** difference, on one machine, from nothing but the amount of data being touched. (The largest sizes pay a little extra beyond cache misses, because the machinery that translates addresses runs out of room too; the shape is what matters.)

Now look at the blue line, which is the interesting one. It is the **same machine, reading the same amounts of data**, and it stays almost flat at a little over 2 nanoseconds no matter how large the array gets:

<TerminalBlock>

./cachebench

      size     ns/access
      4 KB       2.01 ns
     32 KB       2.44 ns
    256 KB       2.14 ns
   4096 KB       2.19 ns
  65536 KB       4.61 ns
 262144 KB       5.54 ns

</TerminalBlock>

At 256 MB, walking in order costs 5.5 ns per access while jumping around costs 156 ns — a difference of nearly thirty times, with identical data and identical hardware.

So the lesson from these two lines together, which is the practical heart of this whole subject:

- **Your data size** decides which caches can hold your working set.
- **Your access pattern** decides whether that matters.

Sequential access barely notices leaving L1, because of cache lines (each miss brings back fifteen future hits) and because of prefetching, which we will get to. Random access notices everything.

## The two-line change {/*the-two-line-change*/}

Here is the most famous demonstration in the subject, and it is worth doing slowly because it is easy to be fooled by it.

A two-dimensional array is a convenient fiction. You write `a[i][j]` and picture a grid, but memory is one long line of bytes, so the grid has to be flattened. In C, and in most languages, it is flattened **row by row**: the whole of row 0, then the whole of row 1, and so on.

<Diagram name="cpu-cache/row_vs_column" height={440} width={720} alt="A diagram titled 'a 2D array is a lie: memory is one long line'. On the left, a four by four grid of cells labelled 00 through 33 shows how a programmer pictures the array. On the right, the same sixteen cells are shown as one long horizontal row in memory order, with the four cells of row 0 highlighted in blue and bracketed. Below, two further rows illustrate access patterns: 'reading along a row' highlights four adjacent cells with a single box around them, captioned 'neighbours in memory — one cache line brings all four'; 'reading down a column' highlights every fourth cell with separate boxes, captioned '4,096 ints apart in the real array — a different cache line every single time'. At the bottom: measured on the machine that built this page, on a 4096 by 4096 array, row by row 10.2 ms, column by column 175.0 ms, 17 times slower from swapping two lines of a loop.">

The grid is in your head. Memory only has one dimension, and the loop has to respect it.

</Diagram>

Now consider two loops that add up every element. They differ only in which variable is on the inside:

```c
// A: along each row
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        sum += a[i][j];

// B: down each column
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        sum += a[i][j];
```

They read exactly the same elements. They perform exactly the same number of additions. They produce exactly the same answer. To a compiler counting instructions they are near-identical.

In loop **A**, consecutive accesses are *next to each other in memory*. One cache line fetch serves sixteen additions.

In loop **B**, consecutive accesses are one whole row apart. On a 4096-wide array of 4-byte integers, that is **16,384 bytes** between accesses — a different cache line every single time, and 60 of every 64 bytes fetched are thrown away unused.

Measured on the machine that produced this page:

<TerminalBlock>

./order2

summing a 4096 x 4096 int array (64 MB) two ways

  row by row  (j inner, neighbours in memory)      10.2 ms
  column by column (i inner, 4096 ints apart)     175.0 ms

  17.2x slower  ·  same arithmetic  ·  sums equal: yes

</TerminalBlock>

**Seventeen times slower**, reproducibly, from swapping two lines. No algorithm changed. No extra work was done. The only difference is that one version cooperated with the cache line and the other fought it.

This is why cache awareness is worth having: not because you will hand-tune caches, but because occasionally a change this small is worth this much, and you want to be able to see it.

## What gets thrown away {/*what-gets-thrown-away*/}

A cache is small, so it fills up. When a new line arrives and there is no room, something already there must be removed — this is called **eviction**, and the rule for choosing the victim is the **replacement policy**.

<Diagram name="cpu-cache/eviction" height={380} width={720} alt="A diagram titled 'the cache is full, something has to go'. On the left, under the heading 'before', four bars represent cached items A, B, C and D annotated 'used just now', 'used a moment ago', 'used a while back' and, in red, 'not used in ages'. An arrow labelled 'read E' points right. On the right, under 'after', four bars show E labelled 'the new arrival' followed by A, B and C; a red note reads 'D is gone'. Captions read: the rule is usually throw out whatever has gone longest without being used, which is a bet on temporal locality.">

Least recently used: a bet that the past predicts the future, which is usually right.

</Diagram>

The usual rule is **least recently used**, or **LRU**: throw out whatever has gone longest without being touched. Which is precisely the desk analogy — the book you have not opened in hours goes back on the shelf first.

Notice that LRU is a *bet on temporal locality*. It assumes that what has been used recently will be used again, and what has been idle will stay idle. When that assumption holds, LRU is excellent. When it does not — say you scan a huge array exactly once, touching everything and reusing nothing — the cache diligently fills up with data that will never be wanted again, and evicts things that would have been. This is why some processors use policies cleverer than plain LRU, and why "streaming" workloads behave so differently from "working set" ones.

There is one important practical consequence. A loop whose data **just fits** in a cache runs dramatically faster than one whose data is slightly too large, because in the second case each pass evicts exactly what the next pass is about to need. Programs can fall off a performance cliff from a small increase in problem size, and this is usually why.

## The cache also guesses ahead {/*the-cache-also-guesses-ahead*/}

One last piece, and it explains that flat blue line from the measurements.

Everything so far is reactive: the cache holds what you have already used. But hardware also tries to be *proactive*. A part of the processor called the **prefetcher** watches the pattern of addresses being requested, and when it spots a regularity, it starts fetching the next lines **before the program asks for them**.

<Diagram name="cpu-cache/prefetch" height={400} width={720} alt="A diagram titled 'the cache also guesses ahead'. A row of nine numbered boxes represents cache lines 5 to 13. The first three are solid blue and labelled 'already read'; the next three are drawn with dashed blue outlines and labelled 'fetched before you asked'; the last three are grey and dashed. Below, two panels: a blue one headed 'predictable pattern' notes sequential or fixed-stride access and that the prefetcher hides almost all of the memory latency; a red one headed 'unpredictable pattern' notes pointer chasing and random jumps, and that with nothing to predict you pay the full latency every time. A caption reads: this is why the two measured lines were so far apart — same data, one guessable, one not.">

The cache reading ahead — the reason walking in order barely notices leaving L1.

</Diagram>

So a sequential walk through a large array gets a remarkable deal. The prefetcher notices the pattern immediately, and by the time the program reaches line 10, line 12 is already on its way. The memory latency is still there — it just happens *in parallel with useful work* instead of blocking it.

And now the two measured lines make complete sense:

- The sequential walk stayed flat because the prefetcher was hiding the latency, and cache lines meant most accesses were free anyway.
- The random chase paid full price every time, because there was no pattern to spot, *and* because each step depended on the previous one, so the processor could not even start the next access early.

Which sharpens the practical advice considerably. "Cache-friendly" does not really mean "use less memory." It means **be predictable**.

<DeepDive>

#### Where a line is allowed to live {/*where-a-line-is-allowed-to-live*/}

This section is optional depth: it explains a subtlety that occasionally produces baffling performance behaviour. Skip it happily on a first read.

So far a cache has been described as though any line could sit anywhere in it. If that were true, then finding out whether an address is cached would mean comparing it against *every* entry — and for a 32 KB L1 with 64-byte lines, that is 512 comparisons on every single memory access. Far too slow.

Real caches solve this by restricting where a line may live. The address itself decides which small group of slots — called a **set** — it is allowed to occupy. Now a lookup only has to check the handful of slots in one set. If each set holds 8 slots, the cache is called **8-way set associative**, and only 8 comparisons are needed.

That restriction is what makes caches fast, and it comes with a strange side effect. Two addresses that happen to map to the *same set* compete for those 8 slots, **even if the rest of the cache is completely empty**. Access nine such addresses in a loop and you get misses every time, in a cache that is 99% unused.

Which addresses collide? Ones separated by an exact multiple of a certain power of two. This is why array dimensions that are round powers of two can behave surprisingly badly — a stride of exactly 4096 bytes, say, may keep landing in the same set. It is also why library authors sometimes pad arrays to *avoid* round numbers, which looks superstitious until you know this.

You will rarely need to reason about it directly. But if you ever see a program that gets dramatically slower when an array size changes from 1023 to 1024, this is the reason, and it is worth recognising rather than disbelieving.

</DeepDive>

<DeepDive>

#### Choosing data structures for the cache {/*choosing-data-structures-for-the-cache*/}

The cache does not care what your data structure is called. It cares about one thing: **is the next thing I need near the last thing I fetched?** Which quietly reorders a lot of received wisdom about data structures.

**Arrays versus linked lists.** A textbook comparison says a linked list has O(1) insertion and an array has O(n), so lists win for insert-heavy work. But an array's elements are contiguous, so walking it is the ideal cache pattern; a linked list's nodes are scattered wherever the allocator put them, so walking it is *pointer chasing* — the red line from the measurements. In practice, for small and medium collections, arrays frequently beat linked lists even at tasks the complexity analysis says lists should win, simply because the constant hidden inside O(1) is a cache miss. This is not a reason to abandon complexity analysis; it is a reason to remember it counts *operations*, not *time*.

**Struct of arrays versus array of structs.** Suppose you have a million particles, each with a position, a velocity, a colour and a name, and a loop that updates only positions. Store them as an array of structs and every position sits 200 bytes from the next one — each cache line fetched contains one useful position and a lot of colours and names you did not want. Store the positions in their own array instead and the same loop walks contiguous memory. Same data, same algorithm, dramatically different miss rate. Game engines and data-processing systems take this seriously enough to build whole architectures around it.

**Sizes matter more than you would expect.** Making a struct smaller so that more of them fit per cache line is a real optimisation; so is putting the fields you use together *next to each other*. And per the multicore lesson, keeping fields used by *different threads* apart avoids false sharing. Both are the same idea from opposite directions: the cache line is the unit, so control what shares one.

</DeepDive>

<Pitfall>

**Do not start rewriting code for the cache. Start by finding out whether the cache is the problem.**

Having seen a 17× and a 100×, the temptation is to go looking for cache problems everywhere. That is the wrong order of operations, for two reasons.

**Most code is not memory-bound.** If a function is slow because it makes a network call, or because it is running an O(n²) algorithm on a large input, no amount of cache tuning will help. Cache effects dominate when a program is doing simple work over a large amount of data — numerical loops, image processing, big scans, hot data structures. Elsewhere they are usually noise.

**Cache-friendly code is often less readable.** Splitting a clean struct into parallel arrays, padding fields, restructuring loops — these make code harder to follow, and that cost is real and permanent. Paying it for a measured 17× is obviously worth it. Paying it on a guess is how codebases become unpleasant for no benefit.

So: **measure first.** Profilers report cache misses; on Linux, `perf stat` shows cache-miss counts and rates directly. If misses are not showing up as a large fraction of your program's stalls, the cache is not your bottleneck and you have just saved yourself an afternoon.

When misses *are* the problem, the fixes in this lesson are usually enough, in this order: fix the access pattern first (make it sequential if you can), then the layout (put what you use together), and only then consider the more invasive rearrangements.

</Pitfall>

## Watch a cache work {/*watch-a-cache-work*/}

Here is a very small cache, doing exactly what the large ones do. The array has 32 elements. Memory moves them in **lines of 4 elements at a time**, and the cache holds **4 lines** — so 16 of the 32 elements can be cached at once. When the cache is full, the least recently used line is evicted.

Pick an access pattern and step through it. Watch which lines get loaded, which get thrown out, and what happens to the hit rate.

Try all four in this order, because together they are the whole lesson:

- **in order** — see how one miss is followed by three free hits. That is the cache line.
- **every 4th element** — every access lands in a new line. Nothing is reused; the hit rate collapses.
- **a small loop** — the data fits, so after the first pass everything hits. That is temporal locality.
- **random** — sometimes lucky, mostly not.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const ELEMENTS = 32;
const PER_LINE = 4;                        // 4 elements share one cache line
const LINES = ELEMENTS / PER_LINE;         // 8 lines of memory
const CACHE_LINES = 4;                     // the cache holds 4 of them
const HIT_COST = 4, MISS_COST = 200;       // cycles, roughly

function makePattern(kind) {
  const seq = [];
  if (kind === 'seq') for (let i = 0; i < ELEMENTS; i++) seq.push(i);
  if (kind === 'stride') for (let i = 0; i < ELEMENTS; i += 4) seq.push(i);
  if (kind === 'loop') for (let r = 0; r < 4; r++) for (let i = 0; i < 8; i++) seq.push(i);
  if (kind === 'random') {
    let s = 12345;
    for (let i = 0; i < 32; i++) { s = (s * 1103515245 + 12345) % 2147483648; seq.push(s % ELEMENTS); }
  }
  return seq;
}

const PATTERNS = [
  ['in order', 'seq', 'for (i = 0; i < 32; i++)  read a[i]'],
  ['every 4th element', 'stride', 'for (i = 0; i < 32; i += 4)  read a[i]'],
  ['a small loop', 'loop', 'repeat 4 times: read a[0] .. a[7]'],
  ['random', 'random', 'read a[random()] 32 times'],
];

export default function CacheLab() {
  const [kind, setKind] = useState('seq');
  const [step, setStep] = useState(0);

  const seq = makePattern(kind);

  // replay the first `step` accesses to get the current state
  let cache = [];                 // list of line numbers, most recent last
  let hits = 0, misses = 0, lastEvicted = null, lastWasHit = null;
  for (let k = 0; k < step; k++) {
    const line = Math.floor(seq[k] / PER_LINE);
    const at = cache.indexOf(line);
    lastEvicted = null;
    if (at >= 0) { cache.splice(at, 1); cache.push(line); hits++; lastWasHit = true; }
    else {
      if (cache.length === CACHE_LINES) lastEvicted = cache.shift();
      cache.push(line); misses++; lastWasHit = false;
    }
  }

  const done = step >= seq.length;
  const current = done ? null : seq[step];
  const currentLine = done ? null : Math.floor(current / PER_LINE);
  const willHit = currentLine !== null && cache.includes(currentLine);
  const rate = step ? (hits / step) * 100 : 0;
  const cycles = hits * HIT_COST + misses * MISS_COST;
  const perfect = step * HIT_COST;

  const choose = (label, k) => (
    <button key={k} onClick={() => { setKind(k); setStep(0); }} style={{
      margin: 2, padding: '4px 11px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
      border: `2px solid ${kind === k ? ACC : '#888'}`,
      background: kind === k ? `${ACC}1e` : 'transparent',
      color: kind === k ? ACC : 'inherit', fontWeight: kind === k ? 'bold' : 'normal',
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>
        {PATTERNS.map(([label, k]) => choose(label, k))}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#888', marginBottom: 10 }}>
        {PATTERNS.find(([, k]) => k === kind)[2]}
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setStep(Math.min(step + 1, seq.length))} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          next access
        </button>
        <button onClick={() => setStep(seq.length)} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          run to the end
        </button>
        <button onClick={() => setStep(0)} style={{ fontSize: 15, padding: '4px 14px' }}>
          reset
        </button>
        <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
          access {Math.min(step + (done ? 0 : 1), seq.length)} of {seq.length}
        </span>
      </div>

      {/* the array in memory, grouped into lines */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
        the array in memory, grouped into 4-element cache lines
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {Array.from({ length: LINES }, (_, L) => {
          const inCache = cache.includes(L);
          const isTarget = L === currentLine;
          return (
            <div key={L} style={{
              padding: '4px 5px', borderRadius: 8,
              border: `2px solid ${isTarget ? DNG : inCache ? ACC : '#888'}`,
              background: isTarget ? `${DNG}18` : inCache ? `${ACC}16` : 'transparent',
            }}>
              <div style={{ fontSize: 9.5, color: '#888', textAlign: 'center' }}>line {L}</div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: PER_LINE }, (_, e) => {
                  const el = L * PER_LINE + e;
                  return (
                    <div key={e} style={{
                      width: 26, height: 24, fontSize: 10.5, borderRadius: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'monospace',
                      background: el === current ? DNG : inCache ? `${ACC}30` : '#8881',
                      color: el === current ? 'white' : 'inherit',
                    }}>{el}</div>
                  );
                })}
              </div>
              <div style={{ fontSize: 9, textAlign: 'center', color: inCache ? ACC : '#888' }}>
                {inCache ? 'cached' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* the cache itself */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
        the cache · {CACHE_LINES} slots · oldest on the left
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {Array.from({ length: CACHE_LINES }, (_, i) => {
          const L = cache[i];
          return (
            <div key={i} style={{
              width: 110, padding: '8px 0', textAlign: 'center', borderRadius: 8,
              border: `2px solid ${L === undefined ? '#888' : ACC}`,
              background: L === undefined ? 'transparent' : `${ACC}14`,
              fontFamily: 'monospace', fontSize: 13,
              color: L === undefined ? '#888' : 'inherit',
            }}>
              {L === undefined ? 'empty' : `line ${L}`}
              <div style={{ fontSize: 10, color: '#888' }}>
                {L === undefined ? '' : i === cache.length - 1 ? 'just used' : ''}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '9px 13px', borderRadius: 9, marginBottom: 10,
        border: `2px solid ${done ? ACC : willHit ? ACC : DNG}`,
        background: done ? `${ACC}10` : willHit ? `${ACC}14` : `${DNG}14`,
      }}>
        {done ? (
          <b style={{ color: ACC }}>Finished all {seq.length} accesses.</b>
        ) : (
          <>
            <b style={{ color: willHit ? ACC : DNG }}>
              next: read a[{current}] &rarr; line {currentLine} &rarr;{' '}
              {willHit ? 'HIT' : 'MISS'}
            </b>
            <div style={{ fontSize: 12.5, color: '#888', marginTop: 3 }}>
              {willHit
                ? 'that line is already cached — about 4 cycles'
                : cache.length === CACHE_LINES
                  ? `not cached — fetch it, and evict line ${cache[0]} to make room`
                  : 'not cached — fetch it into an empty slot'}
            </div>
          </>
        )}
        {lastEvicted !== null && (
          <div style={{ fontSize: 12, color: DNG, marginTop: 4 }}>
            just evicted line {lastEvicted} — it had gone longest without being used
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: 'monospace', fontSize: 14 }}>
        <span style={{ color: ACC }}>hits: {hits}</span>
        <span style={{ color: DNG }}>misses: {misses}</span>
        <span>hit rate: <b>{rate.toFixed(0)}%</b></span>
        <span style={{ color: '#888' }}>
          ≈ {cycles.toLocaleString()} cycles
          {step > 0 && ` (${(cycles / perfect).toFixed(1)}× slower than all hits)`}
        </span>
      </div>

      <p style={{ fontSize: 12.5, color: '#888', marginTop: 10 }}>
        A real cache has thousands of lines rather than four, and restricts where each
        line may sit — but the behaviour you are watching is the same behaviour.
      </p>
    </div>
  );
}
```

</Sandpack>

Run "in order" to the end and look at the hit rate: 75%, and every single hit came free with a miss that had already been paid for. Then run "every 4th element" and watch it fall to 0% — the same number of accesses, touching the same array, with nothing reused. The instructions did not change. Only the order did.

<Recap>

- Memory is slow for three unfixable reasons: it is **physically far away**, it is built from **DRAM** (cheap, dense, slow) rather than the SRAM used inside the CPU, and every core **shares one path** to it.
- A **cache** is a small fast memory that automatically keeps copies of recently used data. Nothing in your program manages it — it works like a desk that keeps whatever you last used, and it needs no help from you.
- It works because real programs have two habits: **temporal locality** (what was used recently will be used again — loop counters, accumulators) and **spatial locality** (what is near what was used will be used — array elements walked in order).
- Memory is only ever moved in **64-byte cache lines**. Ask for 4 bytes and you get 64 — which makes walking an array almost free (one miss, then fifteen hits) and makes jumping around expensive (full price for 64 bytes, 60 of them wasted).
- A **hit** costs about 4 cycles, a **miss** up to 400. The asymmetry is what matters: at a 95% hit rate, the 5% of accesses that missed consume about **72%** of the time — so small hit-rate changes move runtime a lot.
- There are **three levels** because a cache can be small and fast or big and slow, never both: **L1** ~32 KB and ~4 cycles, **L2** ~1 MB, **L3** ~33 MB and shared by all cores, then main memory.
- Measured on one machine: a random dependent access cost **1.5 ns** when the data fit in L1 and **156 ns** when it did not — a hundredfold range. The same machine reading the same data **in order** stayed near 2 ns throughout.
- So: **data size** decides which cache can hold your working set; **access pattern** decides whether that matters. Sequential access is rescued by cache lines and by the **prefetcher**, which spots regular patterns and fetches ahead. Pointer chasing and random jumps have no pattern to spot and pay full price every time.
- Swapping the two loop lines of a 4096 × 4096 array sum — row-major versus column-major — changed the runtime from **10.2 ms to 175.0 ms**, a measured **17×**, with identical arithmetic and identical results.
- When a cache fills, it **evicts** the **least recently used** line, which is a bet on temporal locality. Data that *just* fits in a cache runs far faster than data slightly too large, which is why programs fall off performance cliffs at particular sizes.

</Recap>

<Challenges>

#### Count the misses {/*count-the-misses*/}

An array of 1,000,000 four-byte integers is summed in order. Cache lines are 64 bytes. (a) How many integers fit in one cache line? (b) How many cache misses does the whole loop cause? (c) What is the hit rate? (d) Now the same array is summed but reading only every 16th element. How many misses, and what is the hit rate?

<Hint>

Divide the line size by the element size to get part (a). For (b), each miss brings in a whole line, and everything else in that line is then a hit.

</Hint>

<Solution>

**(a)** 64 bytes ÷ 4 bytes = **16 integers per cache line.**

**(b)** Walking in order, the first element of each line misses and the other fifteen hit:

```
 1,000,000 ÷ 16 = 62,500 lines  →  62,500 misses
```

**(c)** The hit rate:

```
 hits    = 1,000,000 − 62,500 = 937,500
 rate    = 937,500 / 1,000,000 = 93.75%
```

Which is a good hit rate achieved with no effort whatsoever — the cache line did all the work.

**(d)** Reading every 16th element means reading exactly one element per cache line. There are 62,500 accesses, and **every one lands in a new line**:

```
 accesses = 1,000,000 / 16 = 62,500
 misses   = 62,500
 hit rate = 0%
```

Here is the part worth noticing. The strided version does **16× fewer accesses** than the sequential version, and yet performs **exactly the same number of misses** — so it is likely to take about as long, or longer, despite doing a sixteenth of the work. Every line fetched is 64 bytes of traffic to deliver 4 useful bytes; the other 60 are discarded.

This is the real reason "touch less data" is not the same advice as "touch data more cheaply." What the cache charges you for is *lines fetched*, not elements read.

</Solution>

#### Fix the loop {/*fix-the-loop*/}

This function copies a matrix while transposing it. It is correct, and slow.

```c
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        dst[j][i] = src[i][j];
```

(a) Explain which of the two arrays is being accessed badly, and why. (b) Say why simply swapping the loops does not fix it. (c) Describe an approach that does.

<Solution>

**(a)** Look at each array separately, remembering that memory is laid out row by row and the inner loop varies `j`:

- `src[i][j]` with `j` in the inner loop walks **along a row** — consecutive addresses. Perfect: one miss brings in sixteen useful elements.
- `dst[j][i]` with `j` in the inner loop walks **down a column** — each access is a whole row apart. Every access is a new cache line, and 60 of every 64 bytes fetched are wasted.

So `src` is read well and `dst` is written badly. This is the 17× pattern from the lesson, applied to one of the two arrays.

**(b) Swapping the loops does not fix it — it moves the problem.** Put `i` on the inside and now `dst[j][i]` walks along a row (good) while `src[i][j]` walks down a column (bad). You have simply chosen which array suffers.

That is the essential difficulty of a transpose: the operation *inherently* reads in one direction and writes in the other. No loop ordering makes both sequential, because the two requirements are opposites.

**(c) What does work: process the matrix in small blocks** — an approach called **tiling** or **blocking**. Instead of transposing whole rows, transpose small squares:

```c
for (int ii = 0; ii < N; ii += B)
  for (int jj = 0; jj < N; jj += B)
    for (int i = ii; i < ii + B; i++)
      for (int j = jj; j < jj + B; j++)
        dst[j][i] = src[i][j];
```

The idea: choose the block size `B` so that a whole block of `src` **and** a whole block of `dst` fit in cache at the same time. Within a block, the bad-direction accesses are still bad — but they are now bad *within data that is already cached*, so they cost cache hits instead of memory trips. Each cache line that is fetched gets fully used before it is evicted, rather than being fetched, used once, and thrown away.

Tiling is one of the most broadly useful cache techniques there is, and it appears everywhere serious numerical work happens — it is a large part of why a tuned matrix-multiply library is many times faster than the obvious three nested loops.

</Solution>

#### The mystery cliff {/*the-mystery-cliff*/}

Transfer task. A colleague brings you a benchmark result they cannot explain. Their image-processing function scales fine as the image grows — until it suddenly does not:

```
  512 ×  512  image      8 ms
  768 ×  768  image     19 ms      (2.25× the pixels, 2.4× the time — fine)
 1024 × 1024  image    104 ms      (1.8× the pixels, 5.5× the time — ???)
 1536 × 1536  image    240 ms
```

The algorithm is unchanged, the code path is identical, and the per-pixel work is constant. What is almost certainly happening, what would you measure to confirm it, and what would you try?

<Solution>

**What is happening.** The working set has outgrown a cache level. Up to some size, the data the function repeatedly touches fits in cache and each pass reuses it; past that size, every pass evicts what the next pass needs, and accesses that used to be ~4-cycle hits become ~200-cycle misses. The jump from 19 ms to 104 ms is far too large to be explained by 1.8× more pixels, and a sudden discontinuity in an otherwise smooth curve is the signature of crossing a cache boundary.

Some quick arithmetic supports it. For 4 bytes per pixel:

```
  512 ×  512 × 4 =   1.0 MB
  768 ×  768 × 4 =   2.25 MB
 1024 × 1024 × 4 =   4.0 MB
```

If this machine's L2 is around 1–2 MB, the smallest image fits and the largest ones do not — and the cliff lands exactly where the fit ends. (Two further suspects are worth keeping in mind: image-processing code often touches several rows at once, so the *reused* working set may be a few rows rather than the whole image; and 1024 is an exact power of two, which per this lesson's DeepDive can cause repeated collisions in the same cache sets, sometimes producing a cliff of its own.)

**What to measure to confirm it:**

- **Cache miss counts and rates**, per level. On Linux, `perf stat` reports these directly. If misses jump by an order of magnitude exactly where the time does, the diagnosis is settled.
- **A finer size sweep.** Run 896, 960, 1024, 1088 and find precisely where the cliff is. A sharp edge at a specific size confirms a capacity limit; a gradual slope suggests something else.
- **Compare against the cache sizes** from `lscpu`, and check whether the cliff coincides with one.

**What to try, cheapest first:**

1. **Tile the work.** Process the image in blocks small enough that a block's working set stays in cache, instead of sweeping whole rows across the full image. This is the single most likely fix and often recovers most of the loss.
2. **Fuse the passes.** If the function makes several passes over the image (blur, then adjust, then combine), each pass re-reads everything from memory. Doing all the operations on one tile while it is cached turns three trips into one.
3. **Check the layout.** If pixels are stored as separate structures with unused fields, or as separate colour planes that are all walked simultaneously, the effective line utilisation may be poor. Packing what is used together helps.
4. **Test a non-power-of-two size** as a diagnostic. If 1000 × 1000 is dramatically faster than 1024 × 1024, the problem is set collisions rather than pure capacity, and padding the row length fixes it.

The transferable pattern: **a smooth curve with a sudden step in it is a capacity boundary, not an algorithm problem.** Algorithms produce smooth curves — the shape of the curve tells you which kind of problem you have before you read a single line of the code. ✓

</Solution>

</Challenges>

<LearnMore title="Memory Hierarchy" path="/learn/faza-0/modul-0-4/memory-hierarchy">

That completes the processor: switches, gates, arithmetic, a clock, an instruction set, pipelines, cores, and the caches that keep them fed. The ladder in this lesson stopped at main memory — but it does not stop there in reality. Below memory sits the SSD, below that spinning disks and the network, each one slower than the last by a factor that makes the L1-to-RAM gap look modest. Next module opens with the whole picture: how every storage layer in a computer is the same idea as a cache, repeated at every scale, all the way down.

</LearnMore>
