---
title: 'The Binary Number System: Base 2, 10, and 16'
---

<Intro>

Pac-Man, released in 1980, has no ending — in theory. But players who reached level 255 saw something strange: the right half of the screen dissolved into a pile of garbage symbols, and the level became unbeatable. Players called it the "kill screen." The reason: Pac-Man stored the level number *in a single byte* — and past 255, the counter rolled over to zero. In this lesson you'll learn how bits turn into numbers, and why the question "what happens after 255?" has the same answer everywhere — from arcade games to rockets.

</Intro>

<YouWillLearn>

- What a number system really is — and why base 10 and base 2 are the same machine
- Converting binary ↔ decimal: the fast method engineers actually use
- The powers of 2 worth memorizing, and the real disasters behind them (IPv4, Gangnam Style, Boeing 787, Y2038)
- What overflow is and why it shows up everywhere
- Hexadecimal: decoding `#FF5733`, git hashes, and memory addresses

</YouWillLearn>

## What is counting, really? {/*what-is-counting-really*/}

Before talking about number systems, let's look at our own base 10 with fresh eyes. When you write **345**, what are you actually saying?

> 345 = 3×100 + 4×10 + 5×1
>     = 3×10² + 4×10¹ + 5×10⁰

Each position is a power of 10; the digit says "how many" of that power we take. This is called **positional notation**, and it's one of the greatest inventions in human history.

For contrast, take the Roman system: MCMXCIV. There is no concept of "position" in that notation, which is why multiplying two Roman numerals on paper is practically impossible. The Roman Empire did its accounting on an abacus — the writing system was useless for computation.

Positional notation plus the digit zero turned arithmetic into a *mechanical process*: if you know the rules, you execute them step by step, without thinking. "Executing step by step, without thinking" — sound familiar? That's the definition of an algorithm. The very possibility of computers starts at this point.

## The odometer: a living model of a number system {/*the-odometer*/}

Picture the mechanical odometer in an old car: wheels side by side, each showing 0–9. When the rightmost wheel rolls past 9, it snaps back to 0 and nudges the wheel to its left one step forward: 09 → 10. That's what "carrying" is.

Now imagine each wheel has only two digits — 0 and 1.

<Diagram name="binary-say-sistemi/binary_odometer" height={280} width={720} alt="Five odometer states shown in sequence: 000, 001, 010, 011, and a highlighted 100, with +1 arrows between them. The final transition (011 to 100) highlights the carry: the two full wheels on the right roll back to 0 while the left wheel steps forward.">

Counting in binary: 0, 1, 10, 11, 100... The rule doesn't change one bit — the wheels just fill up sooner.

</Diagram>

Every number system is the same machine; the only difference is how many digits fit on a wheel. That count is called the **base**. Binary follows the exact same positional rule, with base 2:

```
1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰
      = 8 + 0 + 2 + 1
      = 11₁₀
```

The leftmost bit is the most "expensive" — the **most significant bit (MSB)**; the rightmost is the cheapest — the **least significant bit (LSB)**. Same logic as money: in $345, the leading 3 means three hundreds, the trailing 5 means five singles.

<Note>

Binary arithmetic was discovered 250 years before computers. The German philosopher and mathematician **Leibniz** published a paper on binary arithmetic in 1703 — one of his inspirations was the hexagrams of the ancient Chinese *I Ching*: 64 symbols made of solid and broken lines, essentially 6-bit codes.

Even more surprising: the first large electronic computer, **ENIAC (1945), was not binary** — it worked in decimal, keeping rings of ten-state vacuum tubes for every digit. The "reliability" argument from the previous lesson is exactly what engineers concluded from the ENIAC experience — virtually every machine after it was binary.

</Note>

## Conversions: both directions {/*conversions*/}

### Binary → Decimal: add up the weights {/*binary-to-decimal*/}

Write the power of 2 under every 1 and add them up:

<Diagram name="binary-say-sistemi/binary_weights" height={310} width={680} alt="The six bits of 110101 shown in boxes. Under each box its positional power (2⁵ down to 2⁰) and its weight (32, 16, 8, 4, 2, 1). The bits equal to 1 are highlighted, with arrows flowing down into the sum: 32 + 16 + 4 + 1 = 53.">

Only the columns holding a 1 contribute their weight: 110101₂ = 53.

</Diagram>

A habit worth building: memorize the position weights from the right — **1, 2, 4, 8, 16, 32, 64, 128**. After a while, reading `1101` as "13" becomes as fast as reading `13` as "thirteen."

### Decimal → Binary: the engineer's method {/*decimal-to-binary*/}

Textbooks teach "divide by 2, read the remainders backwards" — it works, but it's slow. In practice, engineers think in terms of **"subtract the largest power of 2 that fits."**

**Example — 53:**

| Weight | Fits? | Bit | Remainder |
|---|---|---|---|
| 32 (2⁵) | ✓ | `1` | 21 |
| 16 (2⁴) | ✓ | `1` | 5 |
| 8 (2³) | ✗ (8 > 5) | `0` | — |
| 4 (2²) | ✓ | `1` | 1 |
| 2 (2¹) | ✗ | `0` | — |
| 1 (2⁰) | ✓ | `1` | 0 |

**53 = 110101₂** — Check: 32 + 16 + 4 + 1 = 53 ✓

**Example — 200:**

| Weight | Fits? | Bit | Remainder |
|---|---|---|---|
| 128 (2⁷) | ✓ | `1` | 72 |
| 64 (2⁶) | ✓ | `1` | 8 |
| 32 (2⁵) | ✗ | `0` | — |
| 16 (2⁴) | ✗ | `0` | — |
| 8 (2³) | ✓ | `1` | 0 |
| 4 (2²) | ✗ | `0` | — |
| 2 (2¹) | ✗ | `0` | — |
| 1 (2⁰) | ✗ | `0` | — |

**200 = 11001000₂**

**Example — 255:** you can see it without subtracting anything. 255 = 256 − 1 = 2⁸ − 1, which means all 8 bits are 1: `11111111`. Remember this pattern — the rule **"2ⁿ − 1 = n ones"** will follow you everywhere: 255, 1023, 65535, 2147483647 — all of them are "all bits set" numbers.

<DeepDive>

#### Counting to 1023 on your fingers {/*counting-on-fingers*/}

Treat each finger as a bit: folded = 0, raised = 1. Let your right thumb be the LSB. Ten fingers = 10 bits = 2¹⁰ = 1024 states, so you can count **from 0 all the way to 1023**.

Where ordinary counting runs out at 10, binary counting goes 100 times further. It's a hands-on proof of the "n bits = 2ⁿ" formula — and a daily demonstration of exponential growth.

</DeepDive>

## Create an overflow with your own hands {/*overflow-sandpack*/}

Below is an 8-bit counter — the same kind Pac-Man used for its level number. It starts at 250. Press the buttons and watch what happens past 255:

<Sandpack>

```js
import { useState } from 'react';

export default function OverflowToy() {
  const [count, setCount] = useState(250);
  const [overflowed, setOverflowed] = useState(false);

  function add(n) {
    const raw = count + n;
    setOverflowed(raw > 255);
    setCount(raw % 256);
  }

  const bits = count.toString(2).padStart(8, '0');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>8-bit counter:</p>
      <div>
        {bits.split('').map((bit, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 36,
              height: 48,
              lineHeight: '48px',
              margin: 2,
              fontSize: 22,
              borderRadius: 8,
              border: '1px solid #888',
              background: bit === '1' ? '#087ea4' : 'transparent',
              color: bit === '1' ? 'white' : 'inherit'
            }}
          >
            {bit}
          </span>
        ))}
      </div>
      <h2>= {count}</h2>
      <div>
        <button onClick={() => add(1)}>+1</button>{' '}
        <button onClick={() => add(10)}>+10</button>{' '}
        <button onClick={() => { setCount(250); setOverflowed(false); }}>
          Reset (250)
        </button>
      </div>
      {overflowed && (
        <p style={{ color: '#c1554d', fontFamily: 'system-ui' }}>
          <b>Overflow!</b> Past 255 the counter wrapped around —
          this is the exact moment Pac-Man "dies" on level 256.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

A counter wrapping around like this is called an **overflow**. There's no room for a 9th bit — it simply falls off, and the number lands back at the start of the "dial":

<Diagram name="binary-say-sistemi/overflow_rollover" height={360} width={640} alt="A circular dial representing an 8-bit counter: 0 at the top, 64 on the right, 128 at the bottom, 192 on the left, and 255 just to the left of 0. A red arrow crossing from 255 to 0 marks the overflow event, labeled 255 + 1 = 0.">

An 8-bit counter is a dial with 256 states: the step after 255 is 0 again.

</Diagram>

## Powers of 2 worth memorizing — and the disasters behind them {/*powers-of-2*/}

| Power | Value | Where it lives |
|---|---|---|
| 2⁸ | 256 | one byte; an RGB channel (0–255); the Pac-Man kill screen |
| 2¹⁰ | 1,024 | KiB; the boundary of "system" ports |
| 2¹⁶ | 65,536 | the ceiling for port numbers; Excel's old row limit |
| 2²⁴ | ~16.7 million | "True color" — a 3-byte color |
| 2³¹−1 | 2,147,483,647 | the maximum of a 32-bit signed int |
| 2³² | ~4.29 billion | the IPv4 address space; the 32-bit RAM limit (4 GiB) |
| 2⁶⁴ | ~1.8×10¹⁹ | the modern address space |

The table looks dry, but every row hides a real story:

**IPv4 exhaustion.** An internet address is 32 bits → at most ~4.3 billion addresses. In 1981 that looked inexhaustible. Today there are far more connected devices than people, and the regional registries officially ran out of address pools between 2011 and 2019. The fact that 15 devices in your home hide behind one public IP (NAT), and the existence of IPv6 (128 bits!) — all of it is the consequence of this single number, 2³².

**The Gangnam Style incident (2014).** YouTube's view counter was a 32-bit signed int — ceiling: 2,147,483,647. When PSY's video approached that number, YouTube hastily upgraded the counter to 64 bits and announced it as a joke: "We never thought a video would be watched in numbers greater than a 32-bit integer... but that was before we met PSY."

**Boeing 787 (2015).** The FAA issued a directive: the Dreamliner's generator control units must be power-cycled at least every 248 days. The reason: an internal counter counted centiseconds in a 32-bit signed int, and 2³¹ centiseconds ≈ 248 days. If the counter filled up, all generators could shut themselves down at the same time.

**Y2038.** Unix systems traditionally store time as "seconds since January 1, 1970" in a 32-bit signed int. That counter fills up on **January 19, 2038, 03:14:07 UTC**. Modern systems have moved to 64 bits, but old embedded hardware — ATMs, industrial controllers, aging routers — is still in the risk zone.

The general lesson: **limits look unreachable at design time, but systems outlive their designers' assumptions.** Keep this one — it will travel with us all the way to the system design phase.

<DeepDive>

#### The chessboard and exponential intuition {/*the-chessboard*/}

An old legend: the inventor of chess asks the king for a reward — "one grain of wheat on the first square of the board, and double the previous amount on each next square." The king laughs and agrees. On the 64th square the number is 2⁶³; the total is 2⁶⁴ − 1 ≈ 18.4 quintillion grains — more than a thousand years of the world's harvest.

The power of doubling fools human intuition every time. For an engineer, the practical face of this is: **every extra bit doubles the space.** Going from 32 to 64 bits isn't "twice as much" — it's four billion times as much. It works in reverse too: saving one bit halves the space. This intuition will be reborn in the algorithms phase (why binary search is O(log n)).

</DeepDive>

## Hexadecimal: glasses for reading binary {/*hexadecimal*/}

Binary is precise, but it's a disaster for the human eye: `10101111010100110000...` — a single 32-bit address is 32 characters. The eye can't hold the line; transcription errors are inevitable.

The fix rests on an elegant mathematical coincidence: **16 = 2⁴**. If we split the bits into groups of 4 from the right and give each group a single symbol, the notation gets 4× shorter and — most importantly — the conversion becomes mechanical substitution, no arithmetic required. 4 bits = 16 states, so we need 16 symbols: 0–9 isn't enough, so we continue with letters: **A=10, B=11, C=12, D=13, E=14, F=15**.

<Diagram name="binary-say-sistemi/hex_grouping" height={320} width={680} alt="The 16-bit number 1010111101010011 is split into four 4-bit groups: 1010, 1111, 0101, 0011. An arrow drops from each group to its hex equivalent: A (10), F (15), 5, 3. The result combines into 0xAF53.">

Every 4-bit group becomes one hex digit — substitution, not computation.

</Diagram>

The `0x` prefix is the convention for "this is hex" (it comes from the C language, and everyone adopted it). The golden rule: **one byte = exactly two hex digits.** `0xFF` = `11111111` = 255 — the ceiling of a byte.

Now let's decode the hex sightings from a developer's everyday life:

- **`#FF5733`** — a CSS color = just 3 bytes: red `FF` (255), green `57` (87), blue `33` (51). The phrase "16.7 million colors" comes from here too: 3 bytes = 24 bits = 2²⁴ combinations.
- **`a3f9c21`** — a git commit: the first 7 hex digits of a SHA-1 hash (20 bytes). Internally git addresses everything by hashes like this — we'll go deep in the DevOps phase.
- **`3C:22:FB:9A:41:07`** — a MAC address: the 6-byte factory identity of a network card, bytes separated by colons.
- **`0x7ffee4b2c8d0`** — a memory address: the "postal code" of a single byte in RAM. Debuggers always display addresses in hex.
- **`DEADBEEF`, `CAFEBABE`** — engineering folklore: the tradition of spelling words using only the letters A–F to mark special values. `CAFEBABE` is the first 4 bytes of every Java class file (its "magic number"). Most file formats open with such a signature — a practical solution to the "interpretation" problem from the previous lesson: the file itself tells you how to read it.

<Pitfall>

The most common mistake: memorizing hex as **a separate number system** and missing its connection to binary.

Hex's entire reason to exist is displaying binary compactly — it's less a system than a *pair of glasses*. When an engineer sees `0xFF`, the first thing that should light up is not "255" but "eight ones"; seeing `0xF0` — "high 4 bits set, low 4 bits clear." Bit masks, color channels, permissions, network masks — this habit pays off in all of them.

</Pitfall>

<DeepDive>

#### Where did octal (base 8) go? {/*octal*/}

Hex's little sibling is **octal** — grouping bits in threes (8 = 2³), digits 0–7. It was popular on older machines; today it has one main refuge left: **Linux file permissions**.

`chmod 755`: each digit is 3 bits — read/write/execute. 7 = `111` (rwx), 5 = `101` (r-x). So 755 = everything for the owner, read + execute for everyone else. The cipher unlocks fully when we cover file systems in the OS phase.

One trap remains: in many languages a number starting with `0` is parsed as octal — generations of developers have hit the `010 == 8` surprise. Modern languages are switching to the explicit `0o10` notation because of it.

</DeepDive>

## Bonus intuition: multiplying by 2 = shifting {/*bit-shift*/}

In base 10, how do you multiply a number by 10? You append a 0: 34 → 340. The digits shift one position to the left.

In binary, the same trick works with 2:

| Expression | Binary | Decimal | |
|---|---|---|---|
| `13` | `00001101` | 13 | |
| `13 × 2` | `00011010` | 26 | one bit left |
| `13 × 4` | `00110100` | 52 | two bits left |
| `26 ÷ 2` | `00001101` | 13 | one bit right |

This is called a **bit shift**, and for a CPU shifting is far cheaper than multiplying. The `x << 1` (shift left) and `x >> 1` (shift right) you see in code is exactly this. In the CPU lesson we'll see at the circuit level why it's so fast.

<Recap>

- Every positional system is **the same odometer** — only the base differs. In binary, each position is a power of 2.
- The engineer's method for decimal → binary: **subtract the largest power of 2 that fits**. "2ⁿ − 1 = n ones" (255, 1023, 65535...).
- **Every extra bit doubles the space** — exponential growth fools intuition (the chessboard).
- Limits cause real disasters: Pac-Man (2⁸), Gangnam Style (2³¹), Boeing 787, IPv4 (2³²), Y2038. They all share one name: **overflow**.
- **Hex = binary written compactly in 4-bit groups**; one byte = exactly two hex digits. `#FF5733`, git hashes, MAC addresses — all of them are bytes dressed in hex.
- Octal lives on in chmod (755 = rwx r-x r-x); in binary, ×2 = one shift left (`<<`).

</Recap>

<Challenges>

#### Convert and verify {/*convert-and-verify*/}

Convert 45 to binary. Then verify your answer by adding up the weights.

<Solution>

Using the subtract-the-largest-power method:

```
45 − 32 = 13   → 2⁵ present
13 − 16 < 0    → 2⁴ absent
13 − 8  = 5    → 2³ present
 5 − 4  = 1    → 2² present
 1 − 2  < 0    → 2¹ absent
 1 − 1  = 0    → 2⁰ present
```

**45 = 101101₂.** Check: 32 + 8 + 4 + 1 = 45 ✓

</Solution>

#### Answer without computing {/*answer-without-computing*/}

What is 1023 in binary? Answer without doing a single subtraction.

<Solution>

1023 = 1024 − 1 = 2¹⁰ − 1. By the "2ⁿ − 1 = n ones" rule: **1111111111** (ten ones).

Same logic: 255 = eight ones, 65535 = sixteen ones, 2147483647 = thirty-one ones. Recognizing this pattern will save you a lot of time in mask and limit calculations later.

</Solution>

#### The hex glasses {/*the-hex-glasses*/}

What are `0xFF` and `0xF0` in binary? And in decimal? Say the binary first — we're testing the glasses habit.

<Solution>

Each hex digit is 4 bits: F = `1111`, 0 = `0000`.

- `0xFF` = `11111111` — eight ones → 255
- `0xF0` = `11110000` — high 4 bits set, low 4 clear → 240

If your brain "saw" the bits first — the habit is settling in. This way of seeing becomes your main tool when working with bit masks (network masks, permissions, color channels).

</Solution>

#### The chmod cipher {/*the-chmod-cipher*/}

What permissions does `chmod 644 file.txt` grant on Linux? (Hint: each digit is octal, i.e. 3 bits: read-write-execute.)

<Solution>

Expand each digit into 3 bits:

- 6 = `110` → read ✓, write ✓, execute ✗ (for the owner)
- 4 = `100` → read only (for the group)
- 4 = `100` → read only (for everyone else)

So: the owner can read and write, everyone else can only read — the classic permission for configuration files. Compare with `755`: there the execute bit is also set, which is why it's used for scripts.

</Solution>

</Challenges>
