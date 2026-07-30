---
title: "Why CPUs Stopped Getting Faster"
---

<Intro>

In April 1965, an engineer named Gordon Moore was asked to write a short piece for the thirty-fifth anniversary issue of *Electronics* magazine. He was head of research at Fairchild Semiconductor, integrated circuits were four years old, and the best chips of the day held about fifty components. Moore drew a graph. On it he plotted, from roughly five data points, how many components manufacturers had managed to fit on a single chip each year — and noticed the number had been doubling annually. Then he extended the line ten years into the future and predicted that by 1975 a single chip would hold **sixty-five thousand** components. It was an extraordinary claim from almost no evidence, and it turned out to be roughly right. The line held for the next fifty years, long after Moore co-founded Intel, and became the most quoted rule in technology. It is also the most misquoted, because Moore's law says nothing whatsoever about speed — and around 2005 the industry discovered exactly how much that distinction matters.

</Intro>

<YouWillLearn>

- What Moore's law actually predicts, and why "computers get twice as fast every two years" was never it
- **Dennard scaling**: the real reason software got faster for free for thirty years, and the physics behind it
- The **power wall** — why voltage stopped shrinking, and why `P = C·V²·f` ended the megahertz race
- The other two walls that arrived at the same time: the **ILP wall** and the **memory wall**
- Why the answer was **more cores**, and what that quietly transferred onto programmers
- **Amdahl's law**: why 256 cores does not give you 256× — and how to work out what it does give you

</YouWillLearn>

<InlineToc />

## What Moore actually said {/*what-moore-actually-said*/}

Moore's prediction was about **how many transistors fit on a chip**. That is the whole claim. Not clock speed, not performance, not how fast your program runs — just density, doubling on a regular schedule. (Moore revised the period from one year to two in 1975, and that is the version usually quoted.)

For about thirty years nobody needed to be careful about the difference, because transistor count and speed rose together. Then they stopped, and the gap between the two became the most important fact in computing:

<Diagram name="moore-law/moore_vs_clock" height={450} width={720} alt="A chart on logarithmic axes titled 'two lines that used to move together', covering 1971 to 2020. A blue line labelled 'transistors per chip' rises in an almost perfectly straight diagonal from 2,300 at the left to 16 billion at the right, with data points marked at 1971, 1978, 1985, 1993, 2000, 2004, 2006, 2012 and 2020. A red line labelled 'clock speed' rises steeply from 0.74 MHz alongside it, then flattens abruptly after a vertical dashed line marked 'about 2005', ending at a few GHz. Captions below read: 1978 to 2004, clock times 760; 2004 to 2020, clock times 1.3; and: the transistor line never bent, the clock line did.">

Real figures for flagship desktop parts, on log axes. Follow the red line to about 2005 and watch it give up.

</Diagram>

Read those two numbers at the bottom slowly, because they are the entire lesson:

```
 1978 → 2004    clock speed  × 760      in 26 years
 2004 → 2020    clock speed  ×   1.3    in 16 years

 2004 → 2020    transistors  × 128      in the same 16 years
```

Transistors kept arriving on schedule. Between 2004 and 2020 chips got **128 times more of them**. But the clock — the thing that determines how fast a single instruction stream executes — barely moved.

So Moore's law did not fail. Something else did, and it had a different name.

## The free lunch, and why it was free {/*the-free-lunch-and-why-it-was-free*/}

The thirty years of automatic speedups came from a physical bonus that arrived alongside every shrink. It was described in 1974 by Robert Dennard and colleagues, and it is called **Dennard scaling**.

The idea is a chain of consequences, each one following from the last:

<Diagram name="moore-law/dennard_scaling" height={380} width={720} alt="A diagram titled 'the free lunch, and exactly why it was free'. Four boxes in a row, connected by grey arrows, read: 'shrink the transistor (30% smaller)', 'it switches faster (clock can rise)', 'it needs less voltage (V drops too)', and 'power per area stays the same (nothing gets hotter)'. Below them, a wide blue box contains the formula P = C · V² · f with the note 'C down 30%, V down 30%, f up 40% → power actually FELL to 0.48×'. Captions read: every new generation was smaller, faster AND cooler at the same time; software got faster every year while nobody changed a line of it; and, in red: this is Dennard scaling, described in 1974 — and it is the thing that ended, not Moore's law.">

Four consequences of one shrink. The third link in that chain is the one that broke.

</Diagram>

Make a transistor smaller and three good things happen at once. It has less capacitance, so it charges faster and can be clocked higher. It needs a lower voltage to switch. And because both capacitance and voltage went down, the power it consumes goes down too.

Put actual numbers through the power equation from Module 0.2 and the result is startling:

```
 P = C · V² · f

 a 0.7× shrink:   C → 0.70    V → 0.70    f → 1.40

 new power = 0.70 × 0.70² × 1.40
           = 0.70 × 0.49 × 1.40
           = 0.48 ×
```

**Forty percent faster, at half the power.** Not a trade-off — a gift, delivered every couple of years, for free. You wrote a program, waited eighteen months, and it ran faster on the same source code because the hardware underneath had been quietly upgraded.

This is what people actually meant when they said "computers double in speed." It was never Moore's law. It was Dennard scaling riding on Moore's law's back.

## Why it stopped: the power wall {/*why-it-stopped-the-power-wall*/}

Look at the chain again and find the weakest link. Everything depends on **voltage falling with size**.

Voltage cannot fall forever. A transistor is a switch that turns on when its gate voltage exceeds a threshold, and that threshold cannot be lowered indefinitely — push it too low and the transistor never fully turns *off*. It leaks. Current trickles through a switch that is supposed to be closed, and that leakage costs power continuously, whether the transistor is doing anything or not.

By the mid-2000s, threshold voltage had been squeezed about as far as it could go. Transistors kept shrinking; **voltage stopped falling with them**. And the moment that happened, the power equation turned from a friend into an enemy:

<Diagram name="moore-law/power_wall" height={440} width={720} alt="A bar chart titled 'why the clock stopped: voltage refused to shrink', with the formula P = C · V² · f displayed above and the note that power depends on the square of voltage but only linearly on frequency. Four horizontal bars of increasing then decreasing length: 'same clock, same V' at 1.00× labelled baseline; '2× clock, same V' at 2.00× labelled '2× power — fine, if V could stay'; '2× clock, V ×1.3' at 3.38× in red, labelled '3.4× power — this is the wall'; and '2 cores, 0.75× clock, V ×0.85' at 1.08× in blue, labelled '1.5× work for 1.08× power'. Captions read: to run a transistor faster you must raise its voltage, and power grows with V squared; so a chip that was warm at 3 GHz would need a different kind of cooling at 6.">

The same equation read four ways. Only the last row is a bargain.

</Diagram>

Follow the three middle bars, because they contain the whole decision the industry faced.

Doubling the clock while holding voltage steady would cost 2× the power. Tolerable. But you *cannot* hold voltage steady when raising the clock — faster switching demands more drive, so voltage has to go up with it. Raise voltage by 30% as well, and because power depends on **V squared**, you land at:

```
 1 × 1.3² × 2  =  3.38 ×  the power
```

Three and a half times the heat, for twice the speed. And that heat is concentrated on a chip the size of a fingernail. This is the **power wall**: not a limit on how many transistors you can build, but a limit on how many you can *switch quickly* before the thing cooks itself.

This is why the Intel 4 GHz Pentium 4 from the clock lesson was cancelled in October 2004. It was not that they could not build it. It was that they could not cool it.

Now look at the fourth bar, because it is the answer the industry chose — and the rest of this lesson is about what it cost.

## Two more walls arrived at the same time {/*two-more-walls-arrived-at-the-same-time*/}

The power wall alone would have been enough. It did not arrive alone.

<Diagram name="moore-law/three_walls" height={380} width={720} alt="A diagram titled 'three walls, arriving at once' showing three red-tinted panels side by side. The first, 'the power wall', reads: raising the clock needs more voltage, and power grows with V squared, so the chip melts. The second, 'the ILP wall', reads: pipelines, prediction and out-of-order all extract parallelism from one stream, so the stream ran dry. The third, 'the memory wall', reads: cores got 1000× faster, memory latency barely improved at all, so the machine is waiting, not computing. Captions read: any one of these would have slowed progress, all three landed within a few years; the only resource still growing was transistors, so the answer had to be something you could buy with transistors instead of with frequency.">

Three independent limits, all reached within a few years of each other.

</Diagram>

**The ILP wall.** ILP means *instruction-level parallelism* — the trick from the last lesson of finding independent work inside one instruction stream. Pipelining, forwarding, branch prediction, executing instructions out of order: every one of these is a way to squeeze more overlap out of a single program. By the mid-2000s these techniques had been pushed extremely hard, and the returns had gone badly diminishing. Doubling the transistors in a single core no longer doubled its speed; it bought perhaps a few tens of percent. A sequential program simply does not contain unlimited independent work to find.

**The memory wall.** You met this ladder in the CPU anatomy lesson: a register is one cycle away and main memory is around two hundred. That gap did not exist in 1980; it opened up because processors got dramatically faster while memory latency improved only modestly. Making the core faster still does not help if the core is standing idle waiting for data — and increasingly, it was.

So: frequency was capped by heat, single-stream cleverness had hit diminishing returns, and memory could not keep up anyway. Meanwhile transistors were still arriving on schedule, 128× more of them over the next sixteen years.

The question became: **what can you buy with transistors that does not require a faster clock?**

## The turn {/*the-turn*/}

The answer was to stop building one heroic core and start building several ordinary ones.

<Diagram name="moore-law/one_big_vs_many" height={380} width={720} alt="A diagram titled 'the same silicon, spent two ways'. On the left, a dashed outline labelled 'one enormous core' contains a single large red box labelled '1 core' with the notes 'deeper pipeline, wider issue, cleverer prediction', and below it: 'diminishing returns — twice the transistors bought maybe 40% more speed'. On the right, an identical dashed outline labelled 'four modest cores' contains four smaller blue boxes labelled core 1 through core 4, with the notes: 'linear returns — if, and only if, the software can keep all four busy' and 'that if is now the programmer's problem'. A caption reads: in 2005 the industry stopped buying speed and started buying cores.">

Same transistor budget, two strategies — and only one of them needs the software's cooperation.

</Diagram>

The arithmetic is compelling. Take the transistors you would have spent making one core 40% faster, and build a second core instead. Now run both at a *slightly lower* clock, which lets you drop the voltage — and remember that power follows voltage squared:

```
 two cores, each at 0.75× the clock, voltage at 0.85×:

 power     = 2 × (1 × 0.85² × 0.75)  =  1.08 ×
 potential = 2 × 0.75                =  1.50 ×

 fifty percent more work for eight percent more power
```

That is the multicore bargain, and it is genuinely a good deal — the fourth bar in the power-wall chart. Between 2005 and 2006, AMD and Intel both shipped dual-core desktop processors, and within a few years core counts were the number on the box.

But read the small print on that calculation. It says *potential*. Two cores can do twice the work **only if there is twice as much independent work available**. And that is not a hardware property. It is a property of your program.

## The bill arrives in software {/*the-bill-arrives-in-software*/}

In March 2005, as the first dual-core chips were appearing, Herb Sutter published an article in *Dr. Dobb's Journal* with a title that became the name for the whole era: **"The Free Lunch Is Over."**

His point was simple and unwelcome:

<Diagram name="moore-law/free_lunch" height={340} width={720} alt="A diagram titled 'what the turn did to software' showing two panels. The left blue panel, headed 'before 2005', lists: write single-threaded code, wait eighteen months, it runs twice as fast, change nothing. The right red panel, headed 'after 2005', lists: write single-threaded code, wait eighteen months, it runs about as fast, the extra cores sit idle. An arrow points from the left panel to the right. Captions read: Herb Sutter named this in March 2005, 'The Free Lunch Is Over'; performance stopped being something hardware handed you and became something your program had to go and earn.">

Nothing about the left column was ever guaranteed. It just felt that way for thirty years.

</Diagram>

For thirty years, the way to make software faster was to wait. Hardware improvements were *transparent* — they required nothing from the programmer, because a faster clock speeds up every instruction of every program automatically.

Extra cores are not transparent. A single-threaded program running on an eight-core processor uses one core and ignores seven. The hardware improved; your program did not. Performance stopped being something delivered to you and became something you had to design for.

This is why concurrency went from a specialist topic to a mainstream one in the space of a few years, and it is why so much of modern software engineering — thread pools, async runtimes, message queues, map-reduce, actor models, `Promise.all` — is ultimately a response to a physics problem discovered around 2005.

## Amdahl's law {/*amdahls-law*/}

Which raises the obvious question: if you *do* parallelise your program, how much faster does it get?

The answer was worked out in 1967 by Gene Amdahl, long before anyone had a multicore desktop, and it is the single most important formula in this lesson. Split your program into the fraction `p` that can run in parallel and the fraction `(1 − p)` that cannot. With `N` cores:

```
                    1
 speedup  =  ─────────────────
              (1 − p) + p / N
```

The second term shrinks as you add cores. The first term does not shrink at all. So as `N` grows, the speedup runs into a ceiling set entirely by the serial part:

```
 maximum possible speedup  =  1 / (1 − p)

   p = 0.50   →  ceiling  2×
   p = 0.90   →  ceiling 10×
   p = 0.95   →  ceiling 20×
   p = 0.99   →  ceiling 100×
```

<Diagram name="moore-law/amdahl_curve" height={450} width={720} alt="A line chart titled 'Amdahl's law: the part you cannot parallelise sets the ceiling'. The horizontal axis is the number of cores on a logarithmic scale from 1 to 256; the vertical axis is speedup from 1× to 20×. Five curves rise from the bottom left and flatten out at different heights, labelled 99% parallel in red, 95%, 90%, 75% and 50%. The 50% curve flattens near 2×, the 90% curve near 10×, and only the 99% curve is still climbing steeply at 256 cores. Captions read: even at 95% parallel, 256 cores give you 19× — not 256×; and: the 5% that must run alone is what you are actually paying for.">

Every curve flattens. Where it flattens is decided entirely by the serial fraction, not by the hardware.

</Diagram>

Look at the shape of those curves, because it explains a great deal of real-world disappointment. A program that is **95% parallel** — which is already very good — gets:

```
   4 cores  →   3.5×
   8 cores  →   5.9×
  16 cores  →   9.1×
  64 cores  →  15.4×
 256 cores  →  18.6×      (and the ceiling is 20×)
```

Going from 64 cores to 256 — quadrupling the hardware — bought about 20% more speed. The remaining 5% of the program that must run alone has become the entire bottleneck, and no amount of hardware touches it.

This is why "we'll just add threads" so often disappoints, and why the useful question is never *how many cores do we have* but **what fraction of this work is actually independent**.

<Note>

Amdahl's law is pessimistic on purpose: it asks how fast a *fixed* amount of work can be finished. There is a companion result, **Gustafson's law**, that asks a different and often more realistic question — given more cores, how much *more work* can we do in the same time?

For many real workloads that framing fits better. A web server with eight cores does not serve one request eight times faster; it serves eight times as many requests. A renderer given more cores renders a bigger scene. When the workload grows with the hardware, the serial fraction shrinks in relative terms and scaling looks far healthier.

Both laws are correct. They answer different questions, and knowing which one your problem is asking is most of the value.

</Note>

<Pitfall>

**More threads is not more speed, and can be less.**

The reflex after learning about multicore is to add threads until the cores are busy. Three things make that backfire.

**Coordination is not free.** Threads that share data need locks, and a lock is a serial section by definition — you have just *added* to the `(1 − p)` term that Amdahl's law says is your ceiling. It is entirely possible to parallelise a program and make it slower, because the synchronisation cost exceeds the work saved. This shows up most brutally in fine-grained parallelism: splitting a loop that takes microseconds across eight threads can cost more in coordination than the loop cost in the first place.

**Cores share things you cannot see.** The cache hierarchy, the memory bus and the power budget are shared. Eight cores hammering memory do not get eight times the bandwidth; they queue. And modern chips reduce clock speed as more cores become active — so eight busy cores may each run slower than one busy core would.

**The bottleneck may not be the CPU at all.** If your program is waiting on disk, network or a database, adding compute threads adds nothing. The relevant question is what the program is *waiting for*, and threads only help when the answer is "arithmetic."

The correction is the same discipline as the last lesson: **measure what the program is actually doing** before choosing a fix. Find the serial fraction, find what is contended, find what it waits on. Amdahl's law is not a discouragement — it is a tool that tells you, before you write the code, roughly what the payoff can be.

</Pitfall>

<DeepDive>

#### The transistors you are not allowed to use {/*the-transistors-you-are-not-allowed-to-use*/}

Multicore bought time, but it did not repeal the power wall — it only stepped around it. And the wall kept advancing.

Here is the awkward arithmetic. Moore's law still delivers roughly twice the transistors per area each generation. But without Dennard scaling, the power those transistors consume does **not** halve to match. Meanwhile the amount of heat a package can shed has not changed much at all: a laptop chip can dissipate a few tens of watts, a desktop chip a couple of hundred, and those numbers are set by physics and fans, not by lithography.

Put those together and you get a chip with more transistors than it has power to switch. The unusable fraction has a name: **dark silicon**. A 2011 paper by Esmaeilzadeh and colleagues put the problem on the map, projecting that a growing majority of a chip's area would have to remain unpowered at any given moment.

<Diagram name="moore-law/dark_silicon" height={360} width={720} alt="A diagram titled 'you can build it, but you cannot switch it all on' showing a large rounded rectangle labelled 'one chip' divided into a four by four grid of sixteen blocks. Seven blocks are drawn in solid blue and labelled 'on'; the remaining nine are drawn faintly with dashed borders and labelled 'off'. A label on the left reads 'powered and working'; a label on the right reads 'present in the silicon, switched off'. Captions read: Moore's law still delivers the transistors, the power budget does not grow with them; so a growing share of every chip sits dark, and design becomes a question of which specialised block is worth waking up for this particular job.">

The transistors are all there. The power to switch them is not.

</Diagram>

If most of the chip must be dark anyway, the design question changes shape. It stops being "how do I use all these transistors at once?" and becomes **"which specialised circuits are worth the area, given that I will only ever light a few at a time?"**

That reframing explains the layout of a modern phone or laptop chip better than anything else. Alongside the general-purpose cores sit a video decoder, an image processor, a cryptography unit, a neural-network accelerator, a display engine — each one idle most of the time, each one dramatically more efficient than a general core at its single job. Playing a video on the dedicated decoder can use a fraction of the energy that decoding it on the CPU would, and the rest of the chip stays dark while it happens.

This is also why the mix of **efficiency cores and performance cores** in current designs makes sense: if you cannot power everything, you want the option of powering the cheap thing. The industry's answer to the end of Dennard scaling turned out not to be one idea but two — more cores, and more *kinds* of cores.

</DeepDive>

<DeepDive>

#### So where did the last twenty years of speed come from? {/*where-did-the-last-twenty-years-come-from*/}

If the clock has barely moved since 2004, why does a 2024 laptop feel so much faster than a 2004 one? It genuinely is faster — often by a large factor on real work — and the gains came from everywhere except frequency.

**More work per cycle.** The clock stalled; **IPC** did not. Modern cores issue several instructions per cycle, execute them out of order, predict branches far more accurately, and have much larger and smarter caches. A core running at 3 GHz today gets substantially more done per tick than a Pentium 4 at 3.8 GHz did — which is exactly the point the "megahertz myth" Pitfall made two lessons ago, now visible across two decades.

**More cores, and software that finally uses them.** Browsers, compilers, video tools, databases and game engines were all rewritten over this period to spread work across cores. The hardware handed programmers a bill in 2005 and, slowly, the bill got paid.

**Specialised hardware.** Enormous categories of work moved off the general-purpose core entirely — graphics and machine learning onto GPUs, video onto fixed-function decoders, encryption onto dedicated instructions. These are not faster because of a faster clock; they are faster because a circuit built for one job beats a general one by an order of magnitude or more.

**The memory hierarchy.** Caches grew dramatically and got cleverer at predicting what to prefetch. Since the memory wall means many programs are dominated by waiting, reducing the waiting is often worth more than any arithmetic improvement — which is why the *next* lesson but one is entirely about cache.

**Storage.** Not the CPU at all, but it dominates how fast a machine *feels*: the move from spinning disks to SSDs removed a latency measured in milliseconds from the critical path of everything a user does.

The honest summary is that the industry stopped getting one big free improvement and started collecting many smaller, harder-won ones — each requiring effort from hardware designers, compiler writers and application programmers. That is a less comfortable arrangement than Dennard scaling, and it is the one we live in.

</DeepDive>

## Work out your own ceiling {/*work-out-your-own-ceiling*/}

Amdahl's law is worth having in your hands rather than just in your notes. Below, set what fraction of a workload can run in parallel and how many cores you throw at it.

Two things are worth trying. Pick 95% parallel and walk the core count up from 1 to 256, watching the speedup flatten while the efficiency collapses. Then hold the cores at 16 and drag the parallel fraction — and notice how much difference the last few percent make compared with the first fifty.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const CORES = [1, 2, 4, 8, 16, 32, 64, 128, 256];
const PRESETS = [
  ['image filter, pixel by pixel', 0.99],
  ['web server, many requests', 0.95],
  ['data processing pipeline', 0.85],
  ['app with a big serial setup', 0.60],
  ['mostly sequential script', 0.20],
];

export default function AmdahlLab() {
  const [p, setP] = useState(0.95);
  const [n, setN] = useState(16);

  const speedup = 1 / ((1 - p) + p / n);
  const ceiling = 1 / (1 - p);
  const efficiency = speedup / n;
  const nextN = CORES[Math.min(CORES.indexOf(n) + 1, CORES.length - 1)];
  const nextSpeedup = 1 / ((1 - p) + p / nextN);
  const gain = nextN !== n ? (nextSpeedup / speedup - 1) * 100 : 0;

  // time split for the bar: serial part vs parallel part, relative to 1 core
  const serial = 1 - p;
  const par = p / n;
  const total = serial + par;

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          typical workloads
        </div>
        {PRESETS.map(([label, v]) => (
          <button key={label} onClick={() => setP(v)} style={{
            margin: 2, padding: '3px 9px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            border: `2px solid ${Math.abs(p - v) < 0.001 ? ACC : '#888'}`,
            background: Math.abs(p - v) < 0.001 ? `${ACC}1e` : 'transparent',
            color: Math.abs(p - v) < 0.001 ? ACC : 'inherit',
          }}>{label} · {Math.round(v * 100)}%</button>
        ))}
      </div>

      <div style={{ margin: '12px 0' }}>
        <label style={{ fontSize: 13 }}>
          parallel fraction:{' '}
          <b style={{ fontFamily: 'monospace', color: ACC }}>
            {(p * 100).toFixed(0)}%
          </b>{' '}
          <span style={{ color: '#888' }}>
            (so {((1 - p) * 100).toFixed(0)}% must run alone)
          </span>
        </label>
        <input type="range" min="0" max="99" step="1" value={Math.round(p * 100)}
          onChange={(e) => setP(Number(e.target.value) / 100)}
          style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#888', marginRight: 8 }}>cores</span>
        {CORES.map((c) => (
          <button key={c} onClick={() => setN(c)} style={{
            margin: 2, padding: '3px 10px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
            fontFamily: 'monospace',
            border: `2px solid ${n === c ? ACC : '#888'}`,
            background: n === c ? `${ACC}1e` : 'transparent',
            color: n === c ? ACC : 'inherit',
            fontWeight: n === c ? 'bold' : 'normal',
          }}>{c}</button>
        ))}
      </div>

      {/* where the time goes */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
        one unit of work on 1 core, versus on {n}
      </div>
      <div style={{
        display: 'flex', height: 34, borderRadius: 7, overflow: 'hidden',
        border: '1px solid #8886', marginBottom: 6,
      }}>
        <div style={{
          width: `${serial * 100}%`, background: `${DNG}3a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
        }}>{serial > 0.12 ? 'serial' : ''}</div>
        <div style={{
          width: `${p * 100}%`, background: `${ACC}3a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
        }}>parallel</div>
      </div>
      <div style={{
        display: 'flex', height: 34, borderRadius: 7, overflow: 'hidden',
        border: '1px solid #8886', marginBottom: 14, width: `${total * 100}%`,
      }}>
        <div style={{
          width: `${(serial / total) * 100}%`, background: `${DNG}3a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
        }}>{serial / total > 0.2 ? 'serial' : ''}</div>
        <div style={{
          width: `${(par / total) * 100}%`, background: `${ACC}3a`,
        }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${ACC}`, background: `${ACC}14`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>speedup on {n} cores</div>
          <div style={{ fontSize: 26, fontFamily: 'monospace', color: ACC }}>
            {speedup.toFixed(2)}×
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            out of a theoretical {n}×
          </div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${DNG}`, background: `${DNG}14`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>ceiling, with infinite cores</div>
          <div style={{ fontSize: 26, fontFamily: 'monospace', color: DNG }}>
            {ceiling.toFixed(1)}×
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            set by the {((1 - p) * 100).toFixed(0)}% serial part alone
          </div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${efficiency < 0.5 ? DNG : '#888'}`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>efficiency</div>
          <div style={{
            fontSize: 26, fontFamily: 'monospace',
            color: efficiency < 0.5 ? DNG : 'inherit',
          }}>{(efficiency * 100).toFixed(0)}%</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            how much of each core you are using
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 10,
        border: `2px solid ${gain < 10 ? DNG : ACC}`,
        background: gain < 10 ? `${DNG}14` : `${ACC}14`,
      }}>
        {nextN !== n ? (
          <>
            <b style={{ color: gain < 10 ? DNG : ACC }}>
              Doubling to {nextN} cores would gain {gain.toFixed(1)}%.
            </b>
            <div style={{ fontSize: 13, marginTop: 4, color: '#888' }}>
              {gain < 10
                ? 'Twice the hardware for almost nothing. Past this point the serial fraction is the only thing worth working on.'
                : 'Still worth it — the parallel part is large enough that more cores keep paying.'}
            </div>
          </>
        ) : (
          <b style={{ color: DNG }}>
            At 256 cores you are {(speedup / ceiling * 100).toFixed(0)}% of the way
            to the ceiling. More cores cannot help; only less serial code can.
          </b>
        )}
      </div>
    </div>
  );
}
```

</Sandpack>

The number to watch is **efficiency**. At 95% parallel on 256 cores the speedup looks respectable at nearly 19×, but efficiency is around 7% — meaning you are paying for 256 cores and using the equivalent of about eighteen. That is the shape of the world after 2005: hardware is willing to give you parallelism, and whether you can spend it is a property of your problem.

<Recap>

- **Moore's law** (Gordon Moore, April 1965, extrapolated from about five data points) predicts that **transistors per chip** double on a regular schedule. It says nothing about speed. It has not stopped.
- The automatic speedups came from **Dennard scaling** (1974): shrinking a transistor made it faster *and* let its voltage drop, so `P = C·V²·f` fell even as frequency rose — a 0.7× shrink gave **1.4× the speed at 0.48× the power**. That is the free lunch, and it is what ended.
- Voltage could not keep falling because a transistor's threshold cannot drop indefinitely without **leaking**. Once voltage stalled, raising the clock meant raising voltage, and power grows with **V squared**: 2× clock at 1.3× voltage costs **3.38× the power**. That is the **power wall**, and it is why the 4 GHz Pentium 4 was cancelled in 2004.
- Two more walls landed at the same time: the **ILP wall** (a single instruction stream ran out of independent work for pipelines and predictors to find) and the **memory wall** (cores got ~1000× faster; memory latency barely improved).
- Transistors were the only resource still growing, so the industry spent them on **more cores**: two cores at 0.75× clock and 0.85× voltage give **1.5× the potential work for 1.08× the power**.
- That bargain moved the cost onto software. **Herb Sutter, March 2005: "The Free Lunch Is Over."** A faster clock sped up every program automatically; extra cores speed up only programs written to use them.
- **Amdahl's law**: `speedup = 1 / ((1 − p) + p/N)`, with a hard ceiling of `1 / (1 − p)`. A 95%-parallel program tops out at **20×** no matter how many cores you buy — 256 cores gets it to 18.6× at about 7% efficiency.
- The wall kept moving, producing **dark silicon**: more transistors than there is power to switch. Hence specialised blocks (video decoders, GPUs, neural accelerators) and mixed performance/efficiency cores — if most of the chip must be off, you want the option of lighting the cheap thing.

</Recap>

<Challenges>

#### Follow the power equation {/*follow-the-power-equation*/}

A chip runs at 2 GHz with a supply voltage of 1.0 V. Using `P = C·V²·f` with capacitance held constant: (a) what happens to power if you raise the clock to 3 GHz and voltage must rise to 1.2 V to support it? (b) Instead, what happens if you keep 2 GHz but add a second core at the same voltage? (c) Which option would you ship, and what question decides it?

<Hint>

Work in relative terms — set the starting power to 1.0 and multiply the ratios. Remember voltage is squared and frequency is not.

</Hint>

<Solution>

**(a) Faster clock, higher voltage:**

```
 f ratio = 3 / 2   = 1.50
 V ratio = 1.2 / 1.0 = 1.20,  squared = 1.44

 power = 1.44 × 1.50 = 2.16 ×    for 1.5× the single-thread speed
```

Power grew faster than performance — a 44% penalty in efficiency, and all of it turns into heat in the same area.

**(b) Second core, same clock and voltage:**

```
 power = 2 × (1.0² × 1.0) = 2.00 ×   for up to 2× the throughput
```

Slightly *less* power than option (a), for more potential work. In practice it looks even better, because a second core at the same clock does not need the voltage headroom that a faster clock does — the fourth bar in this lesson's power chart pushes the clock down slightly and gets the throughput for around 1.08× power.

**(c) Which to ship.** On the numbers, more cores wins: better throughput per watt. But the deciding question is not about the hardware at all — it is **what does the software look like?**

- If the workload is many independent tasks (a server handling requests, a build system compiling files, a renderer with millions of pixels), the extra core is straightforwardly better.
- If the workload is one long dependent chain that cannot be split, option (a) is the only one that helps at all, because the second core would sit idle.

This is exactly the trade the industry faced in 2004, and it chose (b) — accepting that a great deal of existing software would not benefit until it was rewritten.

</Solution>

#### Find the ceiling {/*find-the-ceiling*/}

A data-processing job takes 100 seconds on one core. Profiling shows that 80 seconds of that is a loop over independent records, and the remaining 20 seconds is reading a configuration file, setting up, and writing a single summary at the end — all strictly sequential.

(a) What is `p`? (b) What is the runtime on 4 cores? On 16? On 1,000? (c) Your manager asks whether buying a 64-core machine is worth it over the 8-core you have. Answer with numbers, and say what you would do instead.

<Solution>

**(a)** The parallel fraction:

```
 p = 80 / 100 = 0.80      serial fraction = 0.20
```

**(b)** Using `speedup = 1 / ((1 − p) + p/N)`, or more directly: the serial 20 s never shrinks, and the 80 s is divided by N.

```
   4 cores:  20 + 80/4   = 20 + 20   = 40.0 s      →  2.50×
  16 cores:  20 + 80/16  = 20 +  5   = 25.0 s      →  4.00×
 1,000 cores: 20 + 80/1000 = 20 + 0.08 = 20.08 s   →  4.98×

 ceiling = 1 / (1 − 0.8) = 5×,  i.e. 20 s — the serial part alone
```

A thousand cores gets you to 20.08 seconds. Twenty of those seconds are the setup, and nothing can be done about them with hardware.

**(c) The 64-core question:**

```
  8 cores:  20 + 80/8  = 30.0 s
 64 cores:  20 + 80/64 = 21.25 s

 improvement: 30 / 21.25 ≈ 1.41×  for 8× the cores
 efficiency at 64 cores: 4.7× speedup / 64 cores ≈ 7%
```

So eight times the machine buys about 41% less runtime. Whether that is worth it depends on the price, but the *better* answer is to stop buying cores and attack the 20-second serial section:

- If the setup could be cut from 20 s to 5 s, then even the existing 8-core machine would run in `5 + 10 = 15 s` — **faster than the 64-core machine achieves today**, at no hardware cost.
- The ceiling would also rise from 5× to 20×, which makes any future hardware purchase actually pay off.

The general lesson, and the reason Amdahl's law is worth knowing before you spend money: **once efficiency is low, the serial fraction is the only thing worth optimising.** More cores cannot fix code that has to run alone.

</Solution>

#### The scaling proposal {/*the-scaling-proposal*/}

Transfer task. Your team's report-generation service takes 40 minutes. A proposal arrives:

*"The service is CPU-bound, so this is a parallelism problem. Plan: move from our 4-core box to a 32-core box, and add a thread pool around the main loop. That's 8× the cores, so we should get close to 8× — call it 6 minutes to be conservative."*

Using this lesson, explain what is wrong with the reasoning, what you would need to know before agreeing, and what outcomes are actually plausible.

<Solution>

**What is wrong with the reasoning.** It assumes the speedup equals the core ratio. Amdahl's law says the speedup is `1 / ((1 − p) + p/N)`, and the proposal never establishes `p` — the fraction of those 40 minutes that is actually parallelisable. Without that number, "close to 8×" is not conservative; it is the theoretical maximum, achievable only if the job is 100% parallel with zero coordination cost.

Work out what different values of `p` would give on 32 cores:

```
 p = 0.95  →  15.9×  →  2.5 minutes
 p = 0.80  →   4.7×  →  8.5 minutes
 p = 0.50  →   1.9×  → 21 minutes
 p = 0.20  →   1.2×  → 32 minutes    (8× the cores, 20% faster)
```

The same purchase produces anything from a dramatic win to almost nothing, entirely depending on a number nobody has measured.

**What I would want to know first:**

1. **Is it actually CPU-bound?** "CPU-bound" is asserted, not shown. If the service spends most of its time waiting on database queries, file reads or an external API, then it is not CPU-bound at all, more cores will do nothing, and the fix lies elsewhere. A profile showing CPU utilisation near 100% across the run is the minimum evidence.
2. **What is the serial fraction?** Where does the time go — is it one big loop over independent reports, or a pipeline with sequential stages, sorting and aggregation steps, or a single final assembly pass? Profile by phase.
3. **What is shared?** If all threads write to one output file, one connection pool, or one shared cache, that is a lock, and locks *add* to the serial fraction. Parallelising can make it slower.
4. **Does it fit in memory and bandwidth?** Thirty-two threads each holding a working set may not fit in cache, and the memory wall means they will queue for bandwidth rather than scaling cleanly.

**Plausible outcomes.** If the reports are genuinely independent and each is self-contained, this is close to the ideal case and a large win is realistic. If there is a substantial sequential setup or aggregation phase, expect something in the 3–5× range. If the service is actually waiting on I/O, expect roughly no improvement and a larger bill.

**What I would propose instead:** profile first, then try the thread pool on the *existing* 4-core box. If 4 cores gives close to 4×, the workload is highly parallel and the bigger machine will pay off. If 4 cores gives 1.8×, you have just learned — for free — that `p` is around 0.6, that the ceiling is 2.5×, and that the 32-core box would be mostly idle money. **Measure the scaling curve on hardware you already own before buying more of it.** ✓

</Solution>

</Challenges>

<LearnMore title="Multi-core: Core, Thread, Hyper-threading" path="/learn/faza-0/modul-0-3/multicore">

The industry's answer was more cores — but "core" turns out to be a slippery word. Your operating system may report eight processors when the chip physically contains four, and both numbers are honest. Next lesson: what a core actually is, what a **thread** is, how **hyper-threading** conjures two of the latter out of one of the former, and why that trick sometimes gives you 30% more performance and sometimes makes things worse.

</LearnMore>
