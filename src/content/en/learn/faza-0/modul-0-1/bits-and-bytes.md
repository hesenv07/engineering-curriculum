---
title: 'Bits and Bytes: What Is Information?'
---

<Intro>

Think of any object in the universe — a penguin, the Eiffel Tower, your left shoe. With just twenty yes/no questions, a good player of "twenty questions" can almost always corner it. That's not a party trick; it's a mathematical fact with a number attached: twenty yes/no answers can distinguish 2²⁰ — more than a million — possibilities. In 1948, a Bell Labs engineer named Claude Shannon built an entire science on this observation: *all* information — text, sound, images, money — can be reduced to yes/no answers. He gave the smallest possible answer a name, and that name is the atom this whole course is built from: the **bit**.

</Intro>

<YouWillLearn>

- What a bit really is — and why nothing smaller can exist
- The one formula behind everything: n bits = 2ⁿ states
- Why computers run on 2 states instead of 10 — a physics answer, not a math one
- Why a byte is exactly 8 bits (spoiler: it almost wasn't)
- The two different "kilobytes", and why your 1 TB disk shows up as 931 GB
- The idea that unlocks the rest of this module: bytes have no meaning — *interpretation* does

</YouWillLearn>

## The game behind all computing {/*the-game-behind-all-computing*/}

Start with the humblest information device you own: a light switch. Two states — on, off. Can you send a message to a friend across the street with it? Absolutely, if you agree on a contract beforehand: *on means yes, off means no*. One switch, two possible messages.

Now install a second switch. The combinations are on-on, on-off, off-on, off-off — four messages. A third switch: eight. Every switch you add **doubles** the space of possible messages.

<Diagram name="bits-and-bytes/light_switches" height={330} width={720} alt="Three rows of light-switch icons. Row one: a single switch in the ON position, labeled 2 to the power of 1 equals 2 messages. Row two: two switches, one on and one off, labeled 2 squared equals 4 messages. Row three: three switches in a mixed on/off pattern, labeled 2 cubed equals 8 messages. A caption explains that a raised dot means ON, a lowered dot means OFF, and that a computer is trillions of such switches called transistors.">

Each additional switch doubles the message space — the most important pattern in this course.

</Diagram>

This is exactly the game Shannon formalized in his 1948 paper *A Mathematical Theory of Communication* — arguably the most consequential paper of the twentieth century, because every phone call, video stream, and file you've ever touched runs on its ideas. Shannon showed that any message can be encoded as a sequence of yes/no answers, and that the smallest unit of information is one such answer. His colleague John Tukey coined the word for it: **bit**, short for *binary digit*. A bit has two possible values — call them yes/no, on/off, or as we'll write them from now on, `1` and `0`. Nothing smaller exists: half a yes/no answer is not an answer.

A computer, at the bottom of everything, is this same game played at absurd scale: trillions of microscopic switches called **transistors** — each one an electrically controlled switch that flips billions of times per second, each one holding exactly one bit. Everything above them, from your operating system to this web page, is switch patterns.

And the doubling pattern gives us the single formula that this entire course leans on:

**n bits = 2ⁿ different states**

| Bits | States | Enough for... |
|------|--------|---------------|
| 1 | 2 | yes / no |
| 2 | 4 | four directions (↑ ↓ ← →) |
| 4 | 16 | one hexadecimal digit |
| 8 | 256 | one ASCII character, one color channel |
| 16 | 65,536 | one network port number |
| 32 | ~4.3 billion | one IPv4 address |
| 64 | ~18 quintillion | a modern CPU's word |

Don't memorize the table — *feel* it with your own hands. Below are 8 switches, which is to say 8 bits, which is to say one byte. Flip them:

<Sandpack>

```js
import { useState } from 'react';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function ByteToy() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  function toggle(i) {
    const next = [...bits];
    next[i] = next[i] === 0 ? 1 : 0;
    setBits(next);
  }

  const value = bits.reduce((sum, bit, i) => sum + bit * WEIGHTS[i], 0);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>One byte = 8 switches. Click them:</p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={WEIGHTS[i]}
            onClick={() => toggle(i)}
            style={{
              width: 42,
              height: 54,
              margin: 3,
              fontSize: 22,
              fontFamily: 'monospace',
              borderRadius: 8,
              border: '1px solid #888',
              cursor: 'pointer',
              background: bit ? '#087ea4' : 'transparent',
              color: bit ? 'white' : 'inherit'
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>
        {WEIGHTS.map(w => (
          <span key={w} style={{ display: 'inline-block', width: 48 }}>{w}</span>
        ))}
      </div>
      <h2>= {value}</h2>
      <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#888' }}>
        {value === 255
          ? 'All switches on — 255, the ceiling of a byte. Remember this number.'
          : 'A byte holds 2⁸ = 256 different values: 0 through 255.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Turn everything on and you get 255 — the ceiling of a byte. File that number away; in the next lesson you'll see what happens to Pac-Man, YouTube, and a Boeing 787 when a counter tries to go one step past a ceiling like that.

## Why 2 states and not 10? {/*why-two-not-ten*/}

Here's the question that separates people who *use* computers from people who understand them. We have ten fingers and a ten-digit number system — why would machines use two? The honest answer disappoints mathematicians: binary is not mathematically special. **It's physically robust.**

Inside a circuit, a digit has to be represented by a voltage. Suppose we build a decimal machine: 0 volts means "0", 0.5 V means "1", 1.0 V means "2", up to 4.5 V for "9". The scheme dies on contact with reality, because real voltages never hold still — temperature, electrical noise from neighboring wires, and component aging jiggle them constantly. Your sensor reads 2.3 V. Is that a slightly-high "4" or a slightly-low "5"? With ten levels crammed into the range, the wobble routinely crosses a border, and every crossing is a corrupted digit.

Now give the same wobbly signal only two zones to live in — "high" and "low" — with a wide empty buffer between them:

<Diagram name="bits-and-bytes/voltage_noise" height={360} width={720} alt="Two panels comparing the same noisy signal. Left panel: a decimal signal with ten narrow voltage bands stacked closely; a red wobbling line repeatedly crosses band borders, captioned 'wobble crosses band borders — is it a 4 or a 5?'. Right panel: a binary signal with only two wide zones for 1 and 0 separated by a large empty buffer zone; the same wobbling line, drawn in blue, stays safely inside the top zone, captioned 'same wobble, still clearly a 1'. Bottom caption: binary wins for a physical reason, not a mathematical one.">

Identical noise, opposite outcomes. The buffer zone is insurance that ten levels can't afford.

</Diagram>

The wobble that destroyed the decimal signal doesn't even come close to confusing the binary one. That's the entire secret: **two states survive noise that ten states cannot.** Multiply this robustness by trillions of transistors switching billions of times per second, and binary isn't a choice anymore — it's the only design that doesn't collapse under its own error rate.

<Note>

Binary wasn't the only contender — history ran the experiment. The first large electronic computer, **ENIAC (1945), was decimal**: it kept each digit in a ring of ten vacuum-tube states, exactly the fragile scheme described above, and its designers' hard-won conclusion pushed the entire field to binary. And in 1958 the Soviet Union built **Setun**, a *ternary* computer (three states: −1, 0, +1) that was genuinely elegant and efficient — but the manufacturing simplicity of two-state circuits won. No commercial non-binary processor exists today.

</Note>

## The byte: why exactly 8? {/*the-byte-why-eight*/}

Single bits are too small to handle one at a time, so we group them. The 8-bit group is the **byte** — the unit memory is addressed in, the unit file sizes are measured in, the unit this entire course will count in. But here's the surprise: **8 is not a law of nature. It's a treaty.**

The 1950s and 60s were chaos: machines shipped with 6-bit, 7-bit, even 9-bit character groups, and 36-bit words were common in serious scientific computers. The word "byte" itself was coined in 1956 by IBM engineer Werner Buchholz — a deliberate respelling of *bite* ("a bite of data"), with the *i* changed to *y* so nobody would misread it as "bit."

The treaty was signed by market forces in 1964, when IBM bet its future on the System/360 — the most successful computer family of its era — built around an 8-bit byte. Eight was a sweet spot: it comfortably held one character of English text (upper and lower case, digits, punctuation), and it was a power of 2, which keeps the arithmetic of addressing clean. The industry aligned, and the 8-bit byte became the ground everyone builds on. Half a byte — 4 bits — earned the joke name **nibble** (a small bite), and the joke stuck hard enough to appear in official documentation.

<DeepDive>

#### The worlds where a byte wasn't 8 bits {/*the-worlds-where-a-byte-wasnt-8*/}

The 8-bit treaty is so total today that its exceptions read like alternate history — but they left fingerprints you can still find.

Network protocol documents (the RFCs you'll meet in the networks phase) carefully say **octet** instead of "byte," meaning *exactly eight bits* — because when those documents were written, machines with 9-bit bytes (like the 36-bit PDP-10, beloved of early AI researchers) were still on the internet, and "byte" was genuinely ambiguous.

And ASCII, the character table you'll dissect in a few lessons, is a **7-bit** code — 128 characters — not 8. In 1963, every bit cost real money, and 128 slots covered English comfortably. When the 8-bit byte became standard, every character shipped with one spare bit... and the story of how the world's languages fought over that spare bit is one of the best disasters in this module. It's waiting for you in the text lesson.

</DeepDive>

## Meet your bytes in person {/*meet-your-bytes-in-person*/}

Enough theory — let's catch bytes in the wild. On any Unix-like machine, write two characters into a file and ask for its raw contents with a hex dump:

<TerminalBlock>

printf 'Hi' > hello.txt && xxd hello.txt

</TerminalBlock>

<TerminalBlock>

00000000: 4869                                     Hi

</TerminalBlock>

Two characters, two bytes: `48` and `69` (that's hexadecimal — a compact way to write bytes that the next lesson demystifies; in binary they're `01001000` and `01101001`). The same experiment works in your browser console right now, no terminal required:

```js
new TextEncoder().encode('Hi')
```

<ConsoleBlock level="info">

Uint8Array(2) [72, 105]

</ConsoleBlock>

There they are: 72 and 105, the decimal faces of the same two bytes. The string `"Hi"` — like every string, image, and song you've ever stored — is numbers all the way down. Which raises the question this module orbits around: if it's all just numbers... *what makes them mean anything?*

## The two kilos: where your gigabytes "went" {/*the-two-kilos*/}

Before answering that, one piece of practical byte literacy that will save you real confusion (and has cost companies real lawsuits). For large quantities we use prefixes — kilo, mega, giga — but the industry runs on **two incompatible definitions**:

| Marketing language (decimal) | Technical language (binary) |
|------------------------------|-----------------------------|
| 1 KB = 1,000 bytes | 1 KiB = 1,024 bytes (2¹⁰) |
| 1 MB = 10⁶ bytes | 1 MiB = 2²⁰ bytes |
| 1 GB = 10⁹ bytes | 1 GiB = 2³⁰ bytes |
| used by disk manufacturers | used by RAM and operating systems |

Why 1,024? Because memory hardware is built on powers of 2 (that's the switch-doubling pattern again), and 2¹⁰ = 1,024 sits temptingly close to 1,000 — close enough that for decades everyone sloppily called both "a kilobyte."

The sloppiness has a famous victim: you. Buy a "1 TB" drive — the manufacturer means 10¹² bytes — and your operating system, measuring in GiB (2³⁰), reports about **931 GB**. Nothing is missing; two dictionaries collided. The gap was real enough to trigger class-action lawsuits against drive makers in the US, which is why storage boxes now carry fine print reading "1 GB = 1 billion bytes."

<Pitfall>

**Internet speed is measured in bits. File sizes are measured in bytes.**

A "100 Mbps" connection moves 100 mega*bits* per second — which is 100 ÷ 8 = **12.5 megabytes** per second. A 1 GB download at that speed takes about 80 seconds, not 10. Lowercase **b** = bit, uppercase **B** = byte, and internet providers adore the confusion: a "100 megabit" plan *sounds* eight times faster than it is to anyone who misreads the letter. You will never misread it again.

</Pitfall>

## Everything is bytes — meaning is interpretation {/*everything-is-bytes*/}

Now the payoff, and the single most important idea in this module. Take the two bytes from our terminal experiment — `01001000 01101001` — and ask: what are they?

<DiagramGroup>

<Diagram name="bits-and-bytes/bytes_as_text" height={280} width={340} alt="The two bytes 01001000 and 01101001 shown in boxes. Read under the ASCII text contract, the first byte equals 72 and maps to the letter H, the second equals 105 and maps to the letter i — together spelling Hi.">

Under the text contract: **"Hi"**

</Diagram>

<Diagram name="bits-and-bytes/bytes_as_number" height={280} width={340} alt="The same sixteen bits 01001000 01101001 shown as one long value. Read as a single 16-bit number, computed as 72 times 256 plus 105, they equal 18,537.">

Under the number contract: **18,537**

</Diagram>

</DiagramGroup>

Same sixteen bits. Read with the text contract, they say "Hi". Read as one 16-bit number, they say 18,537. Read as a pixel, they'd be a shade of blue-gray. **The bytes themselves carry no marker saying which one they are.** There is no "text" property, no "number" flag hiding in the silicon — only the bits, plus a *decision* about how to read them. Computer scientists call that decision an interpretation, an encoding, or a type; this course will call it a **contract**.

Once you see this, small mysteries start dissolving. Why does opening a photo in a text editor show screens of garbage symbols? Because the editor applied the text contract to bytes written under the image contract — nothing is broken, only misread. What are file extensions like `.jpg` and `.txt`, really? Sticky notes suggesting which contract to apply — suggestions, not guarantees. Why can the *same* file be a valid image and valid something-else simultaneously? Because contracts live in the reader, not in the bytes.

And it frames everything ahead. This module is nothing more than a tour of the great contracts, one per lesson: how numbers are encoded (next lesson), how *negative* numbers work (with a rocket explosion attached), how fractions work (with a missile failure attached), how text works (with the answer to the garbage-symbols mystery), and onward. Different contracts, same obedient bits.

<Recap>

- The **bit** is the atom of information — one yes/no answer, `0` or `1` — named by Tukey, weaponized by Shannon in 1948. Nothing smaller exists.
- The course's master formula: **n bits = 2ⁿ states.** Every added bit doubles the space — the twenty-questions game reaches a million objects in twenty answers.
- Computers are binary for a **physics** reason: two voltage zones with a wide buffer survive noise that ten crowded levels cannot. ENIAC (decimal) and Setun (ternary) ran the experiment; binary won.
- A **byte = 8 bits** by treaty, not by nature — Buchholz named it (1956), the IBM System/360 standardized it (1964). Half a byte is a **nibble**; network specs say **octet** to mean exactly 8.
- Two "kilos" coexist: KB = 1,000 bytes (marketing) vs KiB = 1,024 (technical) — the entire mystery of the 931 GB terabyte. And **Mbps ≠ MBps**: divide by 8.
- The module's master key: **bytes have no meaning — contracts (interpretations) do.** The same 16 bits are "Hi", 18,537, or a color, depending on how you read them. Every lesson ahead is one more contract.

</Recap>

<Challenges>

#### How many bits does the game need? {/*how-many-bits-does-the-game-need*/}

A game character has 4 states: standing, running, jumping, flying. What's the minimum number of bits needed to store the state? What if a fifth state, swimming, is added?

<Hint>

How many *states* can n bits distinguish? Find the smallest n whose 2ⁿ covers what you need.

</Hint>

<Solution>

4 states fit in **2 bits** exactly: 2² = 4 (say, `00` standing, `01` running, `10` jumping, `11` flying).

A fifth state breaks the budget — 2² = 4 < 5 — so you need **3 bits**, giving 2³ = 8 states with three combinations left unused. Bits come in whole numbers even when your needs don't; this "round up to the next power of 2" pattern (formally ⌈log₂ n⌉) will follow you through the whole course, from network masks to database pages.

</Solution>

#### The honest download estimate {/*the-honest-download-estimate*/}

Your connection is 50 Mbps. Roughly how long does a 3 GB game update take? Show the reasoning, not just the answer.

<Solution>

First translate bits to bytes: 50 Mbps ÷ 8 = **6.25 MB/s**. Then 3 GB ≈ 3,000 MB, and 3,000 ÷ 6.25 = **480 seconds = 8 minutes**.

Misread Mbps as "MB per second" and you'd promise 1 minute — off by a factor of 8, which is exactly the factor between the two letters *b* and *B*. Whenever a download feels "8× slower than advertised," it isn't; the units were.

</Solution>

#### Read a real hex dump {/*read-a-real-hex-dump*/}

A colleague sends you this terminal output and asks what's in the file:

<TerminalBlock>

00000000: 4869 21                                  Hi!

</TerminalBlock>

The dump helpfully shows the text on the right — but explain what the three bytes `48 69 21` are, and why the *same* three bytes could legitimately be something other than text.

<Solution>

Under the ASCII text contract, `48` → 72 → `H`, `69` → 105 → `i`, `21` → 33 → `!` — the file says "Hi!". (You'll learn to convert hex like `48` yourself in the next lesson; for now, trust the tool.)

But the bytes carry no marker declaring "we are text." Read as three separate numbers they're 72, 105, 33; read as part of an image they'd be pixel data; read as machine code they might even be a fragment of a program. The dump's right-hand column is the *tool's guess* using the text contract — a convenience, not a property of the bytes. That's the lesson's master key in the wild: meaning lives in the reading, not in the file.

</Solution>

#### Support ticket: the missing gigabytes {/*support-ticket-the-missing-gigabytes*/}

A friend texts: "Bought a 512 GB phone, settings says 476 GB. Was I scammed? Should I return it?" Reply in two sentences — technically correct, no jargon dump.

<Solution>

Sample reply: "You weren't scammed — the manufacturer counts 512 GB as 512 billion bytes, while your phone measures in binary gigabytes of 2³⁰ bytes each, and 512 × 10⁹ ÷ 2³⁰ ≈ 476. All the storage is there; two industries just use the same word for two slightly different units."

Check: 512,000,000,000 ÷ 1,073,741,824 ≈ 476.8 ✓. (The transferable skill: whenever storage numbers disagree by roughly 7%, suspect the two kilos before suspecting theft.)

</Solution>

</Challenges>

<LearnMore title="The Binary Number System" path="/learn/faza-0/modul-0-1/binary-number-system">

You can now flip 8 switches to make numbers — next, learn to *read and write* binary fluently, meet hexadecimal (the `48 69` from our hex dump will finally make sense), and discover what happened to Pac-Man, YouTube, and a Boeing 787 when their counters hit the ceiling.

</LearnMore>
