---
title: "Randomness: PRNG, Seeds, Entropy"
---

<Intro>

In 1999, engineers at the security firm Reliable Software Technologies did something that should have been impossible: they sat down at an online poker table and watched everyone's hole cards in real time. Not by hacking the server, not by stealing a password — by *arithmetic*. The shuffling software, used by the popular site PlanetPoker, seeded its random number generator with the number of milliseconds since midnight. Milliseconds since midnight run from 0 to 86,399,999 — so however many ways there are to shuffle a deck of cards, that program could only ever produce **86,400,000 of them**. The real number of possible decks is 52 factorial: about 8 × 10⁶⁷, a number with 68 digits. The engineers synchronized their clock with the server's, narrowed the candidate shuffles to a few hundred thousand, and after seeing five cards on the table they could pin down the exact one — then display every opponent's hand, and every card still to come, in a little window beside the game. The deck was never shuffled. It was *chosen*, from a list short enough to read. Last lesson ended on a paradox: a CPU is deterministic, yet we demand randomness from it constantly. This lesson is how that demand gets met, how spectacularly it fails when nobody counts the possibilities, and where a machine that cannot be surprised goes to buy some surprise.

</Intro>

<YouWillLearn>

- Why a deterministic machine can only ever *replay* randomness — and the one book-and-page analogy that makes every PRNG obvious
- **Middle-square** and the **LCG**: the first two attempts, worked by hand, and exactly how they die
- **Period**, the odometer's revenge: why every generator repeats, and why Mersenne Twister's 2¹⁹⁹³⁷ − 1 still isn't safe
- The split that organizes everything: *statistical* randomness (looks random) vs *cryptographic* randomness (nobody can guess) — and which functions to reach for
- Where real surprise is harvested: interrupt jitter, thermal noise, a wall of lava lamps — and why 256 bits is enough forever
- Three catastrophes caused purely by a guessable seed: Netscape 1995, Debian 2008, and a games console that used the same "random" number every single time

</YouWillLearn>

## The machine that cannot be surprised {/*the-machine-that-cannot-be-surprised*/}

Lesson 9 closed with a definition worth carrying into this one: a sequence is random when it has no exploitable pattern — which is exactly why gzip could crush a million zeros into 1,003 bytes and had to *grow* a million random bytes by 173. **Incompressible is the best working definition of random anyone has.**

Now put that beside what a CPU actually is. Every lesson in this module has hammered the same nail: a processor is a machine of perfect determinism. Same bytes in, same bytes out, every time — that reliability is the entire point, the reason your bank balance survives a reboot. A machine incapable of surprising itself is being asked to produce surprise on demand, millions of times a second, for shuffles and simulations and session tokens. Something has to give.

Before hunting solutions, sharpen the requirement — because "random" turns out to be two different jobs wearing one word:

| | **Statistical randomness** | **Cryptographic randomness** |
|---|---|---|
| Requirement | the numbers *look* unpatterned | nobody can *guess* the next one |
| Passes | dice games, shuffles, sampling, Monte Carlo simulation, load testing, procedural worlds | keys, session tokens, password resets, nonces, salts, lottery draws |
| Failure looks like | subtly wrong simulation results | someone reading your mail |
| Cost | nanoseconds | slightly more nanoseconds |

Almost every disaster in this lesson comes from one confusion: shipping a tool built for the left column into a job from the right one. The poker shuffle was *statistically* fine — the cards looked well mixed, players saw nothing odd for years. It just wasn't *unguessable*, and unguessable was the job.

Two more terms, both already yours. A **PRNG** — pseudo-random number generator — is the arithmetic machine that fakes it: pseudo, from the Greek for "false," and the word is an honest confession. A **seed** is the number you start it with. And **entropy**, which named the compression floor last lesson, returns here as the same quantity measured from the other side: the bits of genuine unpredictability in a value. A seed with 26 bits of entropy has 2²⁶ possible values, and an attacker who can test 2²⁶ possibilities has already won. Hold that arithmetic; the entire lesson is that arithmetic.

## Attempt 1: squaring your way to chaos {/*attempt-1-squaring-your-way-to-chaos*/}

The first algorithmic generator on a computer came from John von Neumann around 1946, for nuclear simulations at Los Alamos, and it is charmingly simple. Take a 4-digit number. **Square it, pad to 8 digits, keep the middle 4.** That's your output — and your next input. It's called the **middle-square method**, and the reasoning is seductive: squaring smears the digits together, and the middle digits depend on all of them, so surely the result jumps around unpredictably?

Work it by hand, starting at 2916:

```
 2916² =  8,503,056  → 08503056 → middle 4 → 5030
 5030² = 25,300,900  → 25300900 → middle 4 → 3009
 3009² =  9,054,081  → 09054081 → middle 4 → 0540
  540² =    291,600  → 00291600 → middle 4 → 2916   ← the seed, again
```

Four steps and it's back where it started, looping `2916 → 5030 → 3009 → 0540` forever. ✓ Some seeds are worse: 3792 squares to 14,379,264, whose middle four digits are **3792** — a number that generates itself, immediately and eternally. And the most common death is quieter. Start at 1674 and the sequence looks healthy for a long while — 8022, 3524, 4185, 5142 — then, around the fortieth step, it stumbles into small numbers and suffocates:

```
 … → 4003 → 0240 → 0576 → 3317 → 0024 → 0005 → 0000 → 0000 → 0000 …
```

Zero squared is zero; the middle four digits are zero; the generator is dead and will emit zeros until the power fails. Von Neumann knew all this and used the method anyway — it was fast, and he checked for the collapse. He also delivered, in 1951, the most quoted sentence in the field: anyone who produces random digits by arithmetic is, he wrote, living "in a state of sin."

The failure is not bad luck, and this is the structural lesson: the generator's entire future is a function of its current 4-digit number. There are only 10,000 of them. Land on one you've visited before — you will, within 10,000 steps — and the whole sequence from there is a rerun. **A deterministic generator with finite state must eventually repeat.** That's not a flaw in middle-square; it's a theorem about every PRNG that will ever exist, and it has a name: the **period**.

## A book of a million pages {/*a-book-of-a-million-pages*/}

Here is the mental model to keep for the rest of your career, and it is not a metaphor — the object genuinely exists. In 1955 the RAND Corporation published a book called *A Million Random Digits with 100,000 Normal Deviates*. It is exactly what it says: page after page of random digits, generated from electronic noise, printed and bound, sold to scientists who needed randomness before every desk had a computer. To use it, you opened to some page and started reading.

That book is a PRNG, and it teaches every property of one:

- **The book is identical for everyone.** Two scientists with two copies, opening to the same page, read the same digits. A PRNG's algorithm is the book — usually public, standardized, printed in RFCs. There is no secret in it.
- **The seed is the page number.** It's the only thing that distinguishes your sequence from anyone else's. Same page, same numbers, forever.
- **The book is finite.** Read long enough and you reach the last page and wrap around to the first. That's the period.
- **And here is the whole security of the thing:** if your opponent owns a copy of the book — they do, it's public — then the only thing standing between them and your future is *whether they can guess your page number*.

Now re-read the poker story. The book was fine. The page number was "milliseconds since midnight" — a page number from a book with only 86,400,000 pages, in a world that needed 8 × 10⁶⁷. The attackers didn't break the shuffle; they read the same book, and simply tried every page until the cards matched.

## The generator behind almost everything {/*the-generator-behind-almost-everything*/}

Middle-square lost to a design so simple you already know all of its parts. The **linear congruential generator** — LCG — keeps a state `s` and steps it with one line:

```
s = (a · s + c)  mod  m
```

Multiply, add, wrap. That's Lesson 2's odometer wearing a lab coat: the `mod m` is the rollover you first met as an 8-bit counter's 255 → 0, here doing productive work instead of causing bugs. Every value stays in `0 … m−1`, so the state space is `m` and the period can never exceed it — the odometer's circumference *is* the book's length.

<Diagram name="randomness/prng_machine" height={340} width={720} alt="A left-to-right pipeline. On the left, a blue-tinted box labeled 'seed' holding the monospace value 1337, annotated 'the only input'. An arrow leads to a middle box labeled 'internal state' holding a monospace s. Below that box, connected by a pair of red arrows forming a loop down and back up, sits a red-tinted box holding the formula s = (a times s + c) mod m, annotated 'multiply, add, wrap — the odometer, again'. From the state box an arrow leads right to a blue-tinted box labeled 'output' holding the monospace sequence 4, 1, 6, 5, and an ellipsis. On the right sits a dashed circle of twelve evenly spaced dots with one dot highlighted in blue, captioned 'finite state, so it repeats' and labeled 'the period' underneath. A caption across the bottom reads: same seed, same stream, on every machine, forever.">

The whole architecture: one number of hidden state, one arithmetic step, one output. Because the state is finite, the dots on that ring are all the machine will ever have — sooner or later it walks around to the start.

</Diagram>

Run one by hand. Take `a = 5`, `c = 3`, `m = 16`, seed 7:

```
 s = (5·7  + 3) mod 16 = 38 mod 16 =  6
 s = (5·6  + 3) mod 16 = 33 mod 16 =  1
 s = (5·1  + 3) mod 16 =  8 mod 16 =  8
 s = (5·8  + 3) mod 16 = 43 mod 16 = 11

 full run: 7 6 1 8 11 10 5 12 15 14 9 0 3 2 13 4 → 7 …

 16 distinct values before it repeats — every value in 0…15 exactly
 once, then back to the seed. Period = 16 = m, the maximum ✓
```

Hitting the full period is not automatic; it requires choosing `a`, `c`, and `m` to satisfy a specific number-theoretic condition (the **Hull–Dobell theorem**), and getting it wrong is easy. Set `c = 0` and start at 8 with the same `a` and `m`: 5 × 8 = 40, and 40 mod 16 = 8. The generator emits 8, forever. One bad parameter choice and your "random" source is a constant.

Determinism isn't hidden, either — every language exposes it, and it's the single most useful thing about a PRNG:

<TerminalBlock>

python3 -c "import random; random.seed(42); print([random.randint(1,6) for _ in range(8)])"
[6, 1, 1, 6, 3, 2, 2, 2]

python3 -c "import random; random.seed(42); print([random.randint(1,6) for _ in range(8)])"
[6, 1, 1, 6, 3, 2, 2, 2]

</TerminalBlock>

Same page number, same digits — on your machine too, today, and in ten years. Those eight "dice rolls" were fixed the moment 42 was chosen; the computer merely read them out. Drop the seed and the runtime picks a page for you, so the numbers differ each run — but nothing about the machinery has changed.

<DeepDive>

#### Random numbers fall mainly in the planes {/*random-numbers-fall-mainly-in-the-planes*/}

The most consequential bad generator in history shipped from IBM in the early 1960s and was called **RANDU**: `a = 65539`, `c = 0`, `m = 2³¹`. It passed the tests people ran at the time. Its output looks fine as a list; plot pairs of consecutive values and it still looks fine.

Then in 1968 the mathematician George Marsaglia published a paper titled *Random numbers fall mainly in the planes*, showing that all LCGs have a hidden lattice structure in higher dimensions — and that RANDU's was catastrophic. Take its output three at a time as points `(x₁,x₂,x₃)` in a cube and look from the right angle:

<DiagramGroup>

<Diagram name="randomness/randu_planes" height={320} width={340} alt="A square plot frame containing 2,400 small red dots plotted from consecutive RANDU triples, viewed at the angle where the planes are edge-on. The dots form fifteen sharply separated horizontal stripes with completely empty white space between them. Title above reads 'RANDU (IBM, 1963)', subtitle '2,400 consecutive triples, viewed edge-on', caption below in red reads 'every point lands on one of 15 planes'.">

Real RANDU output, nothing rearranged. Every triple it can *ever* produce lies on one of these sheets; the space between them is unreachable.

</Diagram>

<Diagram name="randomness/good_prng_cloud" height={320} width={340} alt="A square plot frame of identical size containing 2,400 small blue dots from a modern generator, plotted at exactly the same viewing angle as the neighbouring RANDU figure. The dots form one evenly filled cloud with no stripes, gaps, or alignment. Title above reads 'a modern generator', subtitle '2,400 triples, identical viewing angle', caption below in blue reads 'no plane, no lattice, no structure'.">

A modern generator at the identical angle. This is what "no exploitable pattern" looks like — the compression definition from Lesson 9, made visible.

</Diagram>

</DiagramGroup>

The count isn't approximate. RANDU's outputs obey the exact identity `9xₖ − 6xₖ₊₁ + xₖ₊₂ ≡ 0 (mod 2³¹)`, which forces `9xₖ − 6xₖ₊₁ + xₖ₊₂` to equal one of exactly 15 multiples of 2³¹ — **fifteen planes**, no more, and the figure above is that fact drawn to scale.

Why it mattered: RANDU was the default on IBM mainframes through the 1960s and 70s, precisely when Monte Carlo simulation was becoming standard practice in physics and chemistry. Any simulation that consumed random numbers three at a time — a particle's x, y, z, say — was silently sampling a set of 15 sheets instead of a volume. Nobody crashed. Results simply came out subtly, unfalsifiably wrong, and to this day nobody can say how many published results from that era are affected. It is this module's oldest villain in its purest form: **silent wrong data**, no exception raised, for two decades.

</DeepDive>

## Period, and the twister {/*period-and-the-twister*/}

If the period is the book's length, the obvious upgrade is a longer book — and here engineering delivered spectacularly. The **Mersenne Twister** (Makoto Matsumoto and Takuji Nishimura, 1997) keeps not one number of state but 624 of them, and its period is **2¹⁹⁹³⁷ − 1**: a number roughly 6,002 digits long. Not 6,002 — six thousand *digits*. For scale, the observable universe holds something like 10⁸⁰ atoms, an 81-digit number. You could draw a billion numbers a second for the age of the universe and not measurably dent the sequence.

It is also statistically excellent — no RANDU stripes, uniform in high dimensions — which is why it became the default generator in Python, Ruby, PHP, R, and MATLAB. The `random` module in the terminal block above is Mersenne Twister.

And it is completely unsafe for anything secret. Watch the reasoning, because the shape of it generalizes: the generator's entire future is determined by its 624 words of state, and those words *are the output*, lightly stirred by a reversible scrambling step. Observe **624 consecutive outputs**, invert the stirring, and you have reconstructed the state exactly — after which you can compute every number it will ever produce, and every number it already produced. No brute force, no guessing the seed, no weakness to patch: it's arithmetic, and it takes milliseconds.

That's not a bug report — Matsumoto and Nishimura say so themselves in the original paper. It's a specification. And it's the sharp edge of the table from the first section: a generator can be *statistically flawless* and *trivially predictable at the same time*. Those are unrelated properties, and only one of them protects a password reset link.

<Pitfall>

**`Math.random()` is not a source of secrets.**

The mistake, in every language: using the convenient built-in for something an adversary wants. `Math.random()` in JavaScript, `random.random()` in Python, `rand()` in C — all fast, all statistically decent, all *reconstructable from their own output*. Any token, key, password, session ID, coupon code, or shuffle-with-money-on-it built from them is guessable in principle and often in practice.

The correction is a different function, not a bigger number. Every platform ships a **CSPRNG** — a cryptographically secure generator — beside the fast one:

```
JavaScript   crypto.getRandomValues(new Uint8Array(32))   ·   crypto.randomUUID()
Node.js      crypto.randomBytes(32)
Python       secrets.token_hex(32)          (not random.*)
Java         new SecureRandom()             (not new Random())
Go           crypto/rand                    (not math/rand)
C / POSIX    getrandom(2)                   (not rand())
```

Two lessons in a row now: Lesson 8's rule was that a CRC answers "was this damaged by accident?" and never "did someone tamper?" This lesson's rule has the same shape. `Math.random()` answers "does this look unpatterned?" and never "can an adversary predict this?" Reach for the tool that answers the question you're actually asking.

A second, smaller trap rides along: **modulo bias**. Squeezing a random byte into a smaller range with `%` doesn't divide evenly unless the range divides 256.

```js
const counts = Array(10).fill(0);
for (let b = 0; b < 256; b++) counts[b % 10]++;
console.log(counts);
```

<ConsoleBlock level="info">

[26, 26, 26, 26, 26, 26, 25, 25, 25, 25]

</ConsoleBlock>

Digits 0–5 get 26 of the 256 byte values; digits 6–9 get 25 — the low digits are **4% more likely**, permanently, no matter how perfect the generator upstream. Harmless in a dice game, fatal in a lottery or a key. The fix is rejection sampling: discard the leftover values (here, bytes 250–255) and draw again — which is exactly what `crypto.randomInt` and friends do for you.

</Pitfall>

## Where the surprise actually comes from {/*where-the-surprise-actually-comes-from*/}

Every PRNG hands the problem one step upstream: the sequence is only as unguessable as the page number. So where does a deterministic machine buy a page number nobody can guess? It stops doing arithmetic and starts **measuring the physical world**.

Your operating system runs an **entropy pool**: a reservoir it fills by timing things that no one can predict to the nanosecond. The exact microsecond you pressed a key. The jitter between network packet arrivals. How long a disk seek really took. The tiny variation in when interrupts fire. Modern CPUs include dedicated hardware — Intel's `RDRAND`, ARM's `RNDR` — sampling **thermal noise**, the genuinely quantum jitter of electrons in a resistor, which is unpredictable not because it's complicated but because physics says so.

<Diagram name="randomness/entropy_pipeline" height={340} width={720} alt="A left-to-right pipeline. On the left, four stacked grey boxes list physical noise sources: key and mouse timing, disk and network jitter, chip thermal noise, and a wall of lava lamps, jointly labelled 'unpredictable physical events'. Four thin arrows converge from them into a blue-tinted rounded box in the centre labelled 'entropy pool' holding the monospace text 256 bits and the note 'of real surprise'. An arrow leads right into a red-tinted box labelled CSPRNG containing the words 'one-way' and the note 'no rewind'. A final arrow leads right to the words 'endless keys and tokens'. Two captions run along the bottom: '2 to the 256 possible starting points — no one can search them, and the output cannot be run backwards' and, in red, 'the whole edifice rests on the pool being genuinely unpredictable'.">

Harvest once, expand forever: physical noise fills the pool, the pool seeds a one-way generator, and the generator supplies every key and token the machine will ever need.

</Diagram>

The economics here are worth pausing on, because they're the reason this works at all. You do **not** need a fresh physical measurement per random number — that would be far too slow. You need roughly **256 bits** of genuine entropy, once, and a CSPRNG stretches it into an endless stream. Why is 256 enough forever? Because 2²⁵⁶ is about 10⁷⁷, and the counting arguments of Lesson 2 apply with full force: no amount of hardware, energy, or time available in this universe searches a space that size. The pool's job is to make the page number unfindable; the CSPRNG's job is to keep the book unreadable in reverse — its outputs are one-way, so seeing a gigabyte of them tells you nothing about the state or about what came before. That's exactly the property Mersenne Twister lacks.

On any Unix machine the pool has a filename, and reading it gives you sixteen bytes nobody can predict — including you:

<TerminalBlock>

head -c 16 /dev/urandom | od -A x -t x1z
000000 fd ee 99 38 e9 cc 33 03 45 50 0f a4 12 a9 07 96  >...8..3.EP......<

head -c 16 /dev/urandom | od -A x -t x1z
000000 a0 0d 85 ec ab 19 9e 53 e0 7c c6 cd 45 2a d6 17  >.......S.|..E*..<

</TerminalBlock>

Those are real bytes from a real pool, and — one last continuity check — feed a stream of them to gzip and it will refuse to shrink by a single byte, exactly as Lesson 9 measured. Incompressible and unguessable turn out to be the same sentence read from two directions.

<Note>

You may have absorbed folklore that `/dev/random` is "the secure one" and `/dev/urandom` is "the fast, weaker one," and that you should prefer the former for keys. On modern Linux this is wrong and actively harmful: once the pool has been initialized at boot, both draw from the same cryptographic generator, and entropy is not a fuel that gets "used up" by reading. The old blocking behaviour of `/dev/random` bought no security and caused real outages when servers stalled waiting for entropy that was never needed. Current guidance is simply: use `getrandom(2)`, or `/dev/urandom`, or your language's CSPRNG wrapper, and stop worrying.

</Note>

And because entropy is precious at boot — a freshly imaged virtual machine has no mouse, no keyboard, and barely any disk history, which is a genuinely dangerous moment — some organizations get theatrical about topping it up. Cloudflare's San Francisco lobby holds a **wall of lava lamps**, filmed continuously; the chaotic blobs (plus whatever passing employees and shadows contribute) become one of several entropy inputs for their systems. Their London office uses chaotic pendulums, and their Singapore office a radioactive source. It is, admittedly, mostly wonderful marketing for a well-understood principle — but the principle is exact: to get real randomness, you must go outside the arithmetic and measure something the universe hasn't decided yet.

## Three catastrophes, one root cause {/*three-catastrophes-one-root-cause*/}

The poker break was not a one-off. Here is the same failure at three different scales, and in each one the algorithm was fine and the *page number* was the disaster.

**Netscape, September 1995.** Two Berkeley graduate students, Ian Goldberg and David Wagner, reverse-engineered how Netscape Navigator seeded the generator protecting every SSL connection in the young web. The seed came from the time of day, the process ID, and the parent process ID — values an attacker on the same machine could largely determine and otherwise brute-force. The key length was irrelevant: they recovered session keys in about a minute. The browser was advertising 128-bit security while the page number it drew from had a few tens of bits of real uncertainty.

**Debian, May 2008.** A maintainer, chasing warnings from a memory-checking tool, removed a line of code that fed unpredictable data into OpenSSL's generator. What remained feeding the pool was, essentially, the **process ID** — and Linux process IDs top out at 32,768. For nearly two years, every SSH key, every SSL certificate, and every session key generated on Debian and Ubuntu came from a set of roughly **32,768 possibilities per key type** — a set small enough to generate completely and publish as a lookup file, which people promptly did. The remediation ran for years: regenerate every key, revoke every certificate, audit every `authorized_keys` file on Earth. Two characters of well-intentioned cleanup, one commented-out line, and the cryptographic keys of a large fraction of the internet became enumerable. (Note the shape: the code still *ran*, the keys still *worked*, nothing crashed.)

**PlayStation 3, December 2010.** The group fail0verflow demonstrated at the 27C3 conference that Sony's code signing had a flaw of almost comic simplicity. The ECDSA signature algorithm requires a fresh, secret, unpredictable random number for each signature — and if the same one is ever reused for two different signatures, elementary algebra recovers the private key. Sony used a **constant**. Every signature, the same value where a random one was mandated. The console's master signing key fell out of two signed files, and Sony could not fix it in software.

The pattern is exact enough to check your own systems against: nobody attacked the mathematics. In every case the generator was the right shape and the *entropy of the seed* was too small, too structured, or zero — and in every case the system kept running, confidently, producing output that looked perfectly random right up until someone counted the possibilities.

<DeepDive>

#### The seed as a superpower {/*the-seed-as-a-superpower*/}

Determinism has been the villain of this lesson. Turn it around: for everything outside the security column, the fact that a seed replays exactly is one of the most useful properties in engineering.

**Debugging and testing.** A test that shuffles input and fails once a week is a nightmare — unless it logs its seed. Then the failure is a number you can paste back in and reproduce forever. Serious fuzzing tools work this way: a crash found after nine hours of random input is reported as a seed, and the whole nine hours is replayed in seconds. If you write anything randomized, print the seed. Future-you will send thanks.

**Reproducible science and machine learning.** Model training is saturated with randomness — weight initialization, data shuffling, dropout. A published result that cannot be re-run is barely a result, so the first lines of a training script pin every generator to a fixed seed. Same page number, same model.

**Worlds from nothing.** Minecraft describes an entire world — terrain, caves, ores, villages — with a single 64-bit seed, which is why players trade seeds like coordinates: hand someone that number and they walk your exact landscape on their own machine. That's 2⁶⁴, about 1.8 × 10¹⁹ distinct worlds, from a number that fits in eight bytes. *No Man's Sky* took the same idea to 18 quintillion planets. Nothing is stored; the world isn't loaded, it's *recomputed* — the ultimate compression, which Lesson 9 would recognize immediately as a generative program standing in for its own output.

The unifying idea: a seed is a compact, portable name for an arbitrarily long sequence. Whether that's a superpower or a catastrophe depends entirely on whether the name is supposed to be a secret.

</DeepDive>

## Crack a seed yourself {/*crack-a-seed-yourself*/}

Enough theory — reproduce the poker attack. Below, a hidden seed has been chosen from a space of **4,096** possibilities, and a small LCG turns it into dice rolls. Roll a few times. After each roll the panel re-counts how many of the 4,096 seeds could still have produced everything you've seen — watch that number collapse. When exactly one candidate remains, the machine has your page number, and it will print the next five rolls **before you make them**:

<Sandpack>

```js
import { useState } from 'react';

const M = 4096, A = 1229, C = 1;
const step = (s) => (A * s + C) % M;
const face = (s) => (s % 6) + 1;

export default function SeedCracker() {
  const [hidden, setHidden] = useState(() => Math.floor(Math.random() * M));
  const [state, setState] = useState(null);
  const [rolls, setRolls] = useState([]);

  const roll = () => {
    const s = step(state === null ? hidden : state);
    setState(s);
    setRolls([...rolls, face(s)]);
  };
  const reset = () => {
    setHidden(Math.floor(Math.random() * M));
    setState(null); setRolls([]);
  };

  const left = [];
  for (let c = 0; c < M; c++) {
    let t = c, ok = true;
    for (const r of rolls) {
      t = step(t);
      if (face(t) !== r) { ok = false; break; }
    }
    if (ok) left.push(c);
  }

  const cracked = left.length === 1;
  const future = [];
  if (cracked) {
    let t = left[0];
    for (let i = 0; i < rolls.length; i++) t = step(t);
    for (let i = 0; i < 5; i++) { t = step(t); future.push(face(t)); }
  }

  return (
    <div style={{ fontFamily: 'system-ui', textAlign: 'center' }}>
      <p>Rolls so far:</p>
      <div style={{ fontFamily: 'monospace', fontSize: 26, minHeight: 34 }}>
        {rolls.join('  ') || '\u2014'}
      </div>
      <div style={{ margin: 10 }}>
        <button onClick={roll} style={{ fontSize: 15, marginRight: 8 }}>
          roll the die
        </button>
        <button onClick={reset} style={{ fontSize: 15 }}>new hidden seed</button>
      </div>
      <div style={{
        height: 10, background: '#8882', borderRadius: 5, margin: '0 auto',
        width: 280, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: `${(left.length / M) * 100}%`,
          background: cracked ? '#c1554d' : '#087ea4'
        }} />
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 17 }}>
        seeds still possible: {left.length} / {M}
      </p>
      {cracked ? (
        <div style={{ color: '#c1554d' }}>
          <p><b>Seed found: {left[0]}.</b> Your next five rolls will be:</p>
          <p style={{ fontFamily: 'monospace', fontSize: 24 }}>
            {future.join('  ')}
          </p>
          <p style={{ fontSize: 13 }}>Keep rolling and check.</p>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#888' }}>
          Every roll rules out the seeds that would have produced
          something else.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Typically five to eight rolls is enough — because each roll of a six-sided die rules out roughly five-sixths of the survivors, and 4,096 doesn't survive many rounds of that. Then notice what the seed space actually costs an attacker: 4,096 is 2¹², so this generator has **12 bits of entropy**, total, forever. The poker shuffle had about 26. A real key has 256, and the same brute-force loop — the same twenty lines of code — would need longer than the universe has existed to finish its first pass.

<Recap>

- A CPU is deterministic, so it cannot *generate* randomness — it can only **replay** a fixed sequence. A **PRNG** is a public book of numbers; the **seed** is the page you open to; the algorithm is no secret, so all your protection lives in the page number.
- Finite state guarantees repetition: every generator has a **period**. Middle-square (von Neumann, 1946) dies fast — cycling in four steps from 2916, or decaying to a permanent 0000 — because its whole future is one 4-digit number.
- The **LCG**, `s = (a·s + c) mod m`, is Lesson 2's odometer doing useful work; the period can't exceed `m`, and bad parameters can collapse it to 1. IBM's **RANDU** looked fine and confined every triple it produced to exactly **15 planes**, quietly corrupting two decades of Monte Carlo simulation — silent wrong data, no exception raised.
- **Statistical** and **cryptographic** randomness are different jobs. **Mersenne Twister** has a period of 2¹⁹⁹³⁷ − 1 (about 6,002 digits) and superb statistics, yet **624 observed outputs reveal its entire state** and thus its whole past and future. Excellent and predictable are compatible.
- Use a **CSPRNG** for anything an adversary wants: `crypto.getRandomValues`, `crypto.randomBytes`, `secrets`, `SecureRandom`, `getrandom(2)` — never `Math.random()`/`rand()`. Beware **modulo bias**: `byte % 10` makes digits 0–5 4% more likely.
- Real surprise is **harvested from physics** — interrupt and key timing, disk jitter, on-chip thermal noise, lava lamps — into an **entropy pool**. About **256 bits**, once, is enough forever, because a CSPRNG expands it one-way and 2²⁵⁶ is unsearchable.
- Three disasters, one root cause — a guessable page number: **Netscape 1995** (seed from clock + PIDs, keys recovered in about a minute), **Debian 2008** (entropy reduced to the process ID → ~32,768 possible keys for two years), **PS3 2010** (a *constant* where ECDSA demanded a fresh random nonce → master key recovered).
- A seed's determinism is a **superpower** everywhere else: reproducible tests and fuzz crashes, repeatable ML training, and entire game worlds — Minecraft's 2⁶⁴ landscapes — recomputed from eight bytes instead of stored.

</Recap>

<Challenges>

#### Turn the crank {/*turn-the-crank*/}

Run the LCG `s = (7·s + 4) mod 16` by hand from seed 1 until it repeats. What is the period, and does it reach every value in 0…15? Then explain, in one sentence, why no LCG with `m = 16` can ever have a period of 20.

<Hint>

Just crank: 7×1 + 4 = 11, so the next state is 11 mod 16. Keep going until a value comes round a second time. For the last part, think about how many distinct states exist and what happens the moment one repeats.

</Hint>

<Solution>

```
 s = (7·1  + 4) mod 16 =  11
 s = (7·11 + 4) mod 16 =  81 mod 16 =  1     ← the seed already

 sequence: 1 → 11 → 1 → 11 → …    period = 2
```

The period is **2**, and it visits only 2 of the 16 possible values — a spectacular failure with perfectly respectable-looking parameters. (It fails Hull–Dobell: `m = 16` is divisible by 4, so a full period needs `a − 1` divisible by 4, and `a − 1 = 6` is not.) Compare the lesson's `a = 5, c = 3`, which does satisfy the condition and walks all 16.

Why 20 is impossible: there are only 16 possible states, and the *instant* a state repeats, the entire sequence from that point is an exact rerun — the machine has no memory beyond its current state. So the period can never exceed `m`. This is the same counting argument that killed middle-square, and it is why "make the state bigger" (624 words, in Mersenne Twister's case) is the only lever that lengthens a book.

</Solution>

#### Count the poker shuffles {/*count-the-poker-shuffles*/}

The hook's numbers, done properly. (a) How many bits of entropy does a seed drawn from "milliseconds since midnight" carry? (b) How many bits would a genuinely fair shuffle of 52 cards need? (c) What fraction of all possible decks could that program ever deal? Use log₂(52!) ≈ 225.6.

<Solution>

**(a)** The seed space is 86,400,000 values (0 through 86,399,999).

```
log₂(86,400,000) ≈ 26.4 bits          (2²⁶ = 67,108,864 · 2²⁷ = 134,217,728,
                                       so it sits just above 26 bits) ✓
```

**(b)** A fair shuffle must be able to produce any of 52! orderings, so it needs **≈ 225.6 bits** — call it 226.

**(c)** 86,400,000 ÷ 8.07 × 10⁶⁷ ≈ **1.07 × 10⁻⁶⁰**. Roughly one deck in 10⁶⁰ was reachable; essentially every possible poker hand simply *could not happen* on that site.

The gap is the entire attack: **26 bits offered, 226 bits required — a shortfall of 200 bits.** And 26 bits is not "weak encryption," it's not encryption at all: 67 million candidates is a fraction of a second of laptop time, which is why the engineers could re-shuffle every possibility and compare. Notice the shape of the lesson — the deficiency is invisible in the output (the cards looked shuffled) and obvious the moment you count the possibilities. Counting the possibilities is the whole discipline.

</Solution>

#### The token in the pull request {/*the-token-in-the-pull-request*/}

Transfer task. A pull request adds password-reset links. The token generator is:

```js
const token = Math.random().toString(36).slice(2);
```

The author's PR description says: *"Generates a unique 11-character token. I ran it 10 million times in a loop and got zero collisions, so uniqueness is proven. Links expire after 24 hours."* Write the review: explain what the collision test did and did not prove, name the concrete attack, and give the one-line fix.

<Solution>

**What the test proved:** that the tokens are *unique* — no two users get the same one. That is a real property and worth having. **What it did not touch:** whether a token is *unpredictable*, which is the only property that matters here, because the attacker isn't trying to collide with a token, they're trying to **guess** one and take over the account. Uniqueness and unpredictability are independent: a sequential counter `1, 2, 3…` never collides either, and is completely guessable.

**The concrete attack:** `Math.random()` in V8 is a fast non-cryptographic PRNG (xorshift128+), so its internal state is *recoverable from its own output* — the Mersenne Twister lesson in a different costume. An attacker requests a handful of password resets for accounts they control, reads their own tokens, reconstructs the generator's state, and then computes the tokens issued to *every other user* in that window — including the reset link emailed to the admin. No email interception, no brute force. And two aggravating factors: `.toString(36).slice(2)` yields a variable-length string with fewer than the ~52 bits `Math.random()` even offers, and the 24-hour expiry is a 24-hour *window of validity*, not a defense.

**Review comment:** *"Blocking — this is a security token, so it must come from a CSPRNG, not `Math.random()`, whose output stream is reconstructable from a few observed samples; an attacker who requests two resets for their own account can then predict everyone else's link. Please use `crypto.randomBytes(32).toString('hex')` (Node) or `crypto.getRandomValues` (browser), keep the 24-hour expiry, and add single-use invalidation. Also note for the future: the collision test measures uniqueness, which isn't the property under attack here."*

The transferable rule, and it is the third time this module has stated the same shape: **ask what property you actually need before you pick the tool.** A CRC proves accidental integrity, not tampering (Lesson 8). A checksum proves inventory, not order (Lesson 8). `Math.random()` proves nothing looks patterned — never that nothing can be guessed. ✓

</Solution>

</Challenges>

<LearnMore title="Transistors and Logic Gates" path="/learn/faza-0/modul-0-2/transistors-and-logic-gates">

That completes the module: ten lessons on what data *is* — bits, numbers, negatives, fractions, byte order, text, pixels and sound, integrity, compression, and now the manufactured surprise on top. Everything so far assumed a machine existed to hold it all. Next module, we build that machine, starting from a single switch made of silicon that can do exactly one thing — turn another switch on or off — and discovering how a pile of those becomes something that can add.

</LearnMore>
