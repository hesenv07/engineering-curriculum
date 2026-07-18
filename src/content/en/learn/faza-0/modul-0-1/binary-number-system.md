---
title: 'The Binary Number System'
---

<Intro>

Pac-Man, released in 1980, has no ending — in theory. But players who reached level 255 met something the designers never imagined anyone would see: the right half of the screen dissolved into a heap of garbage symbols, and the level became impossible to finish. Players named it the **kill screen**. There was no bug in the drawing code and no corrupted chip — the game stored its level number in a single byte, and past 255 the counter did the only thing a full counter can do. By the end of this lesson you'll know exactly what that thing is, why the same fate later visited YouTube and a Boeing 787, and how to read numbers like `0xAF53` and the mysterious `4869` from last lesson's hex dump as fluently as you read decimal.

</Intro>

<YouWillLearn>

- What a number system *really* is — and why base 10 and base 2 are the same machine
- Reading binary instantly (add the weights) and writing it fast (the engineer's method)
- The powers of 2 worth knowing by heart, and the real disasters behind each one
- What **overflow** is — you'll trigger one yourself
- Hexadecimal: the "glasses" that make `#FF5733`, git hashes, and hex dumps readable
- Why multiplying by 2 is just a shift — a preview of how CPUs cheat

</YouWillLearn>

## Counting is a machine {/*counting-is-a-machine*/}

Before touching base 2, look at base 10 with fresh eyes — because you've used it your whole life without ever asking what it *is*. When you write **345**, what are you actually claiming?

```
345 = 3×100 + 4×10 + 5×1
    = 3×10² + 4×10¹ + 5×10⁰
```

Each position is a power of ten; the digit says *how many* of that power to take. This scheme is called **positional notation**, and it's one of humanity's greatest inventions — which is easiest to see by visiting a civilization that didn't have it. The Roman numeral for 1994 is MCMXCIV. There's no concept of "position" in that notation, so try multiplying MCMXCIV by XVII on paper — it's practically impossible, and indeed the Roman Empire did its real accounting on an abacus, because its *writing system couldn't compute*.

Positional notation (plus the digit zero) changed the game: arithmetic became a **mechanical procedure** — if you know the rules, you execute them step by step, no cleverness required. Step-by-step execution of fixed rules, no cleverness required... you may recognize that as the definition of an *algorithm*. The very possibility of computers begins right here, in how we chose to write numbers down.

## The odometer: one machine, any base {/*the-odometer*/}

Picture the mechanical odometer in an old car: wheels side by side, each carrying the digits 0–9. When the rightmost wheel rolls past 9, it snaps back to 0 and nudges its left neighbor forward one step. That nudge — the **carry** — is the entire mechanism of counting.

Now build the same odometer, but print only two digits on each wheel: 0 and 1. Nothing else changes:

<DiagramGroup>

<Diagram name="binary-number-system/odometer_decimal" height={300} width={340} alt="A two-wheel decimal odometer showing 09, with the right wheel marked 'wheel is full'. A +1 arrow leads to the wheels showing 10, highlighted. Caption: the right wheel resets to 0 and pushes the left wheel one step — a carry. Note at the bottom: the wheel fills after 10 digits.">

Base 10: the wheel fills after ten digits, then carries.

</Diagram>

<Diagram name="binary-number-system/odometer_binary" height={300} width={340} alt="A two-wheel binary odometer showing 01, with the right wheel marked 'wheel is full!'. A +1 arrow leads to the wheels showing 10, highlighted. Caption: exactly the same carry rule, so 10 here means two, not ten. Note at the bottom: the wheel fills after just 2 digits.">

Base 2: identical machine — the wheel just fills after *two* digits.

</Diagram>

</DiagramGroup>

Counting in binary is therefore: 0, 1, then the wheel is full — carry! — 10, 11, full again — 100, 101, 110, 111, 1000... Every number system is this same odometer; the only knob is how many digits fit on a wheel, and that count is called the **base**. So `10` doesn't mean "ten"; it means "one wheel-full, plus zero" — ten in base 10, two in base 2, sixteen in base 16.

Two pieces of vocabulary before we go further. In a binary number, the leftmost bit is the most "expensive" — the **most significant bit (MSB)**; the rightmost is the cheapest — the **least significant bit (LSB)**. Same logic as money: in $345, the leading 3 is three hundreds, the trailing 5 is five singles.

<Note>

Binary arithmetic predates computers by two and a half centuries. The philosopher-mathematician **Leibniz** published a paper on it in 1703 — inspired partly by the hexagrams of the ancient Chinese *I Ching*: 64 symbols built from solid and broken lines, essentially 6-bit codes. And as you saw last lesson, the first big electronic computer (ENIAC) ignored all of this and went decimal — once. The lesson stuck.

</Note>

## Reading binary: add the weights {/*reading-binary*/}

To read a binary number, write the power of 2 under every position and add up the ones that hold a `1`:

<Diagram name="binary-number-system/binary_weights" height={330} width={720} alt="The six bits of 110101 shown in boxes. Under each box its power of two (2 to the 5th down to 2 to the 0th) and its weight: 32, 16, 8, 4, 2, 1. The bits equal to 1 are highlighted in blue, and curved arrows flow from those columns down into the sum: 32 plus 16 plus 4 plus 1 equals 53. Caption advises memorizing the weights right to left: 1, 2, 4, 8, 16, 32, 64, 128.">

110101₂ = 53. Only the 1-columns pay in.

</Diagram>

The habit worth building: memorize the weights from the right — **1, 2, 4, 8, 16, 32, 64, 128** (you met them under the switch toy last lesson). After a week of practice, reading `1101` as "thirteen" is as fast as reading `13` as "thirteen." Until then, let the machine confirm your work:

```js
parseInt('110101', 2)
```

<ConsoleBlock level="info">

53

</ConsoleBlock>

## Writing binary: the engineer's method {/*writing-binary*/}

Textbooks teach decimal→binary as "divide by 2, collect the remainders backwards." It works, and you should know it exists — but in practice engineers think the other way: **subtract the largest power of 2 that fits.** It's faster in your head and it builds the number left to right, the way you'll read it.

**Example — 53:**

```
Largest power that fits into 53: 32 (2⁵)  → bit 5 = 1,  remainder 21
Fits into 21: 16 (2⁴)                     → bit 4 = 1,  remainder 5
8 doesn't fit (8 > 5)                     → bit 3 = 0
4 fits                                    → bit 2 = 1,  remainder 1
2 doesn't fit                             → bit 1 = 0
1 fits                                    → bit 0 = 1,  remainder 0

53 = 110101₂        Check: 32 + 16 + 4 + 1 = 53 ✓
```

**Example — 200:**

```
128 fits → 1, remainder 72
 64 fits → 1, remainder 8
 32 doesn't fit → 0
 16 doesn't fit → 0
  8 fits → 1, remainder 0
  4, 2, 1 → 0, 0, 0

200 = 11001000₂     Check: 128 + 64 + 8 = 200 ✓
```

**Example — 255:** no subtraction needed at all. 255 = 256 − 1 = 2⁸ − 1, and a number that's *one less than a power of two* is always a solid run of ones: `11111111`. Burn this pattern in — **2ⁿ − 1 = n ones** — because 255, 1023, 65535, and 2,147,483,647 are all "all bits set" numbers, and they will keep appearing in this course like recurring characters.

Both directions, verified by machine:

```js
(255).toString(2)
```

<ConsoleBlock level="info">

'11111111'

</ConsoleBlock>

Your shell speaks binary too — bash accepts base-prefixed literals:

<TerminalBlock>

echo $((2#110101))
53

</TerminalBlock>

<DeepDive>

#### Counting to 1023 on your fingers {/*counting-on-fingers*/}

Treat each finger as a bit: folded = 0, raised = 1, right thumb as the LSB. Ten fingers = 10 bits = 2¹⁰ = 1024 states, so you can count from **0 to 1023** on two hands — where ordinary finger-counting taps out at ten, binary goes a hundred times further. It's the master formula from last lesson (n bits = 2ⁿ) made flesh, and a hands-on preview of exponential growth, which gets its own showcase below. Fair warning from generations of engineers: the numbers 4 and 132 produce hand gestures you may not want to flash in a meeting.

</DeepDive>

## Break the counter yourself {/*break-the-counter*/}

Time to recreate Pac-Man's death. Below is an 8-bit counter — the switch panel from last lesson, now counting on its own, displayed in all three notations you're learning. It starts at 250. Push it over the edge:

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
  const hexv = count.toString(16).toUpperCase().padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>An 8-bit level counter, like Pac-Man's:</p>
      <div>
        {bits.split('').map((bit, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 38, height: 50, lineHeight: '50px',
              margin: 2, fontSize: 22, borderRadius: 8,
              border: '1px solid #888',
              background: bit === '1' ? '#087ea4' : 'transparent',
              color: bit === '1' ? 'white' : 'inherit'
            }}
          >
            {bit}
          </span>
        ))}
      </div>
      <h2>= {count}   ·   0x{hexv}</h2>
      <div>
        <button onClick={() => add(1)}>+1 level</button>{' '}
        <button onClick={() => add(10)}>+10</button>{' '}
        <button onClick={() => { setCount(250); setOverflowed(false); }}>
          reset (250)
        </button>
      </div>
      {overflowed && (
        <p style={{ color: '#c1554d', fontFamily: 'system-ui' }}>
          <b>Overflow!</b> Past 255 the counter wrapped back to the start —
          this is the exact moment the kill screen appears.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

A counter wrapping past its ceiling is called an **overflow**, and the odometer explains it perfectly: a full set of wheels rolls over to all zeros. There's simply nowhere for a ninth bit to go — it falls off, and the count lands back at the start of the dial:

<Diagram name="binary-number-system/overflow_rollover" height={420} width={640} alt="A circular dial with sixteen tick marks representing an 8-bit counter: 0 at the top, 64 on the right, 128 at the bottom, 192 on the left, and 255 marked in red just left of the top. A red arc with an arrowhead crosses the seam from 255 past 0, under the heading 255 + 1 = 0. Center text reads 8-bit counter, 256 states, then back to 0. The caption lists Pac-Man level 256, Gangnam Style views, Boeing 787 and Y2038 as the same wheel with bigger dials.">

An 8-bit counter is a dial with 256 positions. The step after 255 is 0 — always.

</Diagram>

## The powers of 2 — and the disasters behind them {/*powers-of-2-and-their-disasters*/}

| Power | Value | Where it lives |
|-------|-------|----------------|
| 2⁸ | 256 | one byte; an RGB channel; the Pac-Man kill screen |
| 2¹⁰ | 1,024 | the KiB from last lesson; the "system ports" boundary |
| 2¹⁶ | 65,536 | the ceiling for network port numbers; Excel's old row limit |
| 2²⁴ | ~16.7 million | "true color" — the 3-byte color you'll meet in the hex section |
| 2³¹−1 | 2,147,483,647 | the maximum of a 32-bit signed integer |
| 2³² | ~4.3 billion | the IPv4 address space; the 4 GiB limit of 32-bit systems |
| 2⁶⁴ | ~1.8×10¹⁹ | the modern address space |

A dry table — until you hear what each row *did*:

**IPv4 exhaustion.** An internet address is 32 bits, so at most ~4.3 billion exist. In 1981 that looked infinite; today there are far more connected devices than people, and the regional address registries officially ran dry between 2011 and 2019. The reason fifteen devices in your home hide behind one public address (a trick called NAT), and the reason IPv6 exists with a frankly absurd 128 bits — both are consequences of this single row. The networks phase tells the full story.

**The Gangnam Style incident (2014).** YouTube's view counter was a 32-bit signed integer — ceiling 2,147,483,647. When PSY's video approached it, YouTube hastily rebuilt the counter at 64 bits and announced it with a wink: they'd never imagined a video outgrowing a 32-bit integer... "but that was before we met PSY."

**Boeing 787 (2015).** The FAA issued an airworthiness directive: power-cycle the Dreamliner's generator control units at least every 248 days. An internal counter ticked in hundredths of a second inside a 32-bit signed integer, and 2³¹ hundredths ≈ 248 days. Let the counter fill, and all generators could shut down at once. The official interim medicine — *reboot the plane* — should sound familiar by the end of this module.

**Y2038.** Unix systems traditionally count time as "seconds since January 1, 1970" in a 32-bit signed integer. That counter fills on **January 19, 2038, at 03:14:07 UTC**. Modern systems have moved to 64 bits (the new ceiling outlasts the sun), but embedded hardware with decades-long service lives — industrial controllers, payment terminals, forgotten routers — is still out there ticking.

Four rows, one moral, and it's a moral this course will keep returning to: **limits look unreachable at design time, but systems outlive their designers' assumptions.** Nobody at Namco imagined level 256; nobody at YouTube imagined two billion views. Somebody, somewhere, is right now designing the counter that will overflow in 2045.

<DeepDive>

#### The chessboard, or why doubling fools everyone {/*the-chessboard*/}

An old legend: the inventor of chess asks the king for a modest reward — one grain of wheat on the board's first square, and double the previous amount on each of the remaining 63. The king laughs at the pauper's request and agrees. The 64th square alone owes 2⁶³ grains; the total, 2⁶⁴ − 1 ≈ 18.4 quintillion, exceeds a millennium of world harvests. The king, depending on the telling, executes the inventor or makes him count the grains.

Exponential doubling defeats human intuition *every single time*, and for an engineer the practical translation is: **each extra bit doubles the space.** Going from 32-bit to 64-bit isn't "twice as big" — it's four billion times bigger. It cuts the other way too: saving one bit halves what you can represent. This intuition returns with force in the algorithms phase, where it explains why binary search finds one name among a billion in just 30 steps.

</DeepDive>

## Hexadecimal: glasses for reading bits {/*hexadecimal*/}

Binary is precise but unreadable at length: a 32-bit value is 32 characters of `10110100...`, and human eyes lose the thread. The fix exploits a lucky coincidence: **16 = 2⁴**, so if you slice bits into groups of four and give each group one symbol, the text shrinks 4× and — the key part — conversion becomes *pure substitution*, no arithmetic ever. Four bits have 16 states, so we need 16 symbols: 0–9 runs out, and the alphabet donates the rest — **A=10, B=11, C=12, D=13, E=14, F=15**.

<Diagram name="binary-number-system/hex_grouping" height={370} width={720} alt="The sixteen bits 1010 1111 0101 0011 shown in four boxes of four bits each. Blue arrows drop from each group to its hex digit: A (10), F (15), 5, 3. Brackets underneath pair the hex digits two by two, each labeled 'one byte = exactly two hex digits'. The result reads 0xAF53, with a caption noting that since 16 equals 2 to the 4th, the conversion is pure substitution with no arithmetic.">

Each 4-bit group becomes one hex digit; each *pair* of hex digits is exactly one byte.

</Diagram>

The `0x` prefix is the universal convention for "what follows is hex" (born in the C language, adopted by everyone). And the bracket in the diagram is the golden rule worth saying aloud: **one byte = exactly two hex digits.** `0xFF` = `11111111` = 255, the ceiling of a byte and of our Sandpack counter.

Now, the debt from last lesson. Remember the hex dump?

<TerminalBlock>

xxd hello.txt
00000000: 4869                                     Hi

</TerminalBlock>

You now own every symbol on that line. `48` is a byte written as two hex digits: `4` = `0100`, `8` = `1000`, so the byte is `01001000` — decimal 72, which the text contract maps to `H`. Likewise `69` → `01101001` → 105 → `i`. The tool on your machine agrees:

<TerminalBlock>

printf '%x\n' 44883
af53

</TerminalBlock>

Once the glasses are on, hex appears *everywhere* in a developer's day:

- **`#FF5733`** — a CSS color is just **3 bytes**: red `FF` (255), green `57` (87), blue `33` (51). The phrase "16.7 million colors" is this lesson's table talking: 3 bytes = 24 bits = 2²⁴ combinations.
- **`a3f9c21`** — a git commit ID: the first 7 hex digits of a much longer hash. Git addresses *everything* internally by such hashes — the DevOps phase opens that hood.
- **`3C:22:FB:9A:41:07`** — a MAC address: the 6-byte factory identity of a network card, one byte between each pair of colons.
- **`0x7ffee4b2c8d0`** — a memory address, the "postal code" of a single byte in RAM; debuggers always print addresses in hex.
- **`DEADBEEF`, `CAFEBABE`** — engineering folklore: words spelled using only the digits A–F, used to mark special values so they leap out of a dump. `CAFEBABE` is genuinely the first 4 bytes of every Java class file — its *magic number*, a signature that answers last lesson's contract question by having the file introduce itself.

<Pitfall>

**Hex is not another number system to "learn." It's a display format for binary.**

The classic mistake is memorizing hex↔decimal conversions as their own skill and never connecting hex to bits. That misses the entire point: hex exists *only* to show binary compactly. When a working engineer sees `0xFF`, the first thing that fires is not "255" but "eight ones"; `0xF0` reads as "high four bits set, low four clear." Train that reflex — it's the one that pays when you meet bit masks, permissions, color channels, and network masks in the phases ahead. Hex is a pair of glasses, and glasses are for *seeing the bits*.

</Pitfall>

<DeepDive>

#### And where did base 8 go? {/*where-did-octal-go*/}

Hex has a little sibling: **octal**, base 8 — bits grouped in *threes* (8 = 2³), digits 0–7. It thrived on old machines whose word sizes divided by three, and today survives in one glorious stronghold: **Unix file permissions**. In `chmod 755`, each digit is three bits — read/write/execute: 7 = `111` (rwx), 5 = `101` (r-x). So 755 means "owner can do everything, everyone else can read and execute." The OS phase decodes the whole scheme.

One landmine remains: many languages parse a leading `0` as octal, so `010 == 8` — a surprise that has bitten generations of developers copying zero-padded numbers into code. Modern languages are switching to an explicit `0o10` for exactly this reason.

</DeepDive>

## Bonus reflex: ×2 is a shift {/*multiplying-by-shifting*/}

One last gift from positional notation. In base 10, how do you multiply by 10? You don't compute — you append a zero: 34 → 340. Every digit slides one position left. In binary, the identical trick works with 2:

```
13      = 00001101
13 × 2  = 00011010   (26) — every bit slid one left
13 × 4  = 00110100   (52) — two positions
26 ÷ 2  = 00001101   (13) — one position right
```

This is a **bit shift**, written `x << 1` (left) and `x >> 1` (right) in most languages, and for a CPU it is drastically cheaper than real multiplication — sliding wheels beats spinning them. When we build an actual adder out of logic gates in Module 0.2, you'll see at the circuit level why shifting is nearly free.

<Recap>

- Every positional system is **the same odometer** — only the wheel size (the base) differs. Binary wheels carry after two digits, so `10` means *two*.
- Read binary by **adding the weights** (memorize 1, 2, 4, 8, 16, 32, 64, 128); write it by **subtracting the largest power that fits**. And **2ⁿ − 1 = n ones**: 255, 1023, 65535 are solid runs of 1s.
- A full counter rolls over: **overflow**. Pac-Man (2⁸), Gangnam Style (2³¹), Boeing 787, and Y2038 are the same wheel with bigger dials — and the moral is that *limits outlive their designers' assumptions*.
- **Each extra bit doubles the space** (the chessboard). 64-bit isn't twice 32-bit; it's four billion times it.
- **Hex is glasses for binary**: one digit per 4 bits, **two digits per byte**, `0x` prefix. `#FF5733` is 3 bytes, `0xFF` should flash "eight ones" in your head before "255."
- Octal survives in `chmod` (3 bits per digit); multiplying by 2 is a **bit shift** (`<<`) — a preview of CPU economics.

</Recap>

<Challenges>

#### Convert and verify {/*convert-and-verify*/}

Convert 45 to binary with the engineer's method. Then verify your answer by adding the weights back up.

<Hint>

What's the largest power of 2 that fits into 45? Start there and track the remainder.

</Hint>

<Solution>

```
45 − 32 = 13   → 2⁵ present
13 − 16 < 0    → 2⁴ absent
13 − 8  = 5    → 2³ present
 5 − 4  = 1    → 2² present
 1 − 2  < 0    → 2¹ absent
 1 − 1  = 0    → 2⁰ present
```

**45 = 101101₂.** Check: 32 + 8 + 4 + 1 = 45 ✓ — and you can always ask the machine: `parseInt('101101', 2)` returns 45.

</Solution>

#### Answer without computing {/*answer-without-computing*/}

What is 1023 in binary? No subtraction allowed — answer from a pattern in this lesson.

<Solution>

1023 = 1024 − 1 = 2¹⁰ − 1, and "2ⁿ − 1 = n ones" gives **1111111111** (ten ones) instantly.

The same reflex decodes the whole family: 255 is eight ones, 65535 is sixteen, 2,147,483,647 is thirty-one. Recognizing an "all bits set" number on sight will save you real time when you meet network masks and integer limits later in the course.

</Solution>

#### The hex glasses test {/*the-hex-glasses-test*/}

What are `0xFF` and `0xF0` in binary? In decimal? Answer binary *first* — this challenge is checking which reflex fires.

<Solution>

Each hex digit is four bits: F = `1111`, 0 = `0000`.

- `0xFF` = `11111111` — eight ones → 255
- `0xF0` = `11110000` — high four bits set, low four clear → 240

If the bits appeared in your head before the decimal values, the glasses habit is taking hold. That "see the bits" reflex becomes your main tool the moment bit masks enter the course — network masks, file permissions, and color channels all lean on it.

</Solution>

#### Decode the dump by hand {/*decode-the-dump-by-hand*/}

Last lesson a tool decoded this for you. This time, do every step yourself: the file contains bytes `48 65 79`. Expand each to binary, then to decimal — and using the fact that the text contract maps 72 → `H` and counts alphabetically from there (73 → `I`, 74 → `J`...), with 101 → `e` and 121 → `y`, spell the word.

<Solution>

- `48`: `4` = `0100`, `8` = `1000` → `01001000` = 64 + 8 = **72** → `H`
- `65`: `0110 0101` = 64 + 32 + 4 + 1 = **101** → `e`
- `79`: `0111 1001` = 64 + 32 + 16 + 8 + 1 = **121** → `y`

The file says **"Hey"** — and you just performed, by hand, the full journey from raw hex through binary through decimal to text. Every hex dump you'll ever read is this exact pipeline; the character table that made the last hop possible gets its own lesson (and its own wars) later in this module.

</Solution>

#### The permissions cipher {/*the-permissions-cipher*/}

Transfer task: a teammate runs `chmod 644 config.yaml` and asks what they just did. Using octal (3 bits per digit: read-write-execute), decode all three digits and answer in one sentence — then explain why `chmod 777` shows up in every security checklist as a red flag.

<Solution>

Expand each digit: 6 = `110` (read ✓ write ✓ execute ✗) for the owner; 4 = `100` (read only) for the group; 4 = `100` (read only) for everyone else. One-sentence answer: *"You made the file readable by everyone but writable only by you — the classic setting for config files."*

`777` = `111 111 111` — every permission for every user on the system, including write and execute for total strangers to the file. It "fixes" permission errors by removing the concept of permissions, which is why security reviews treat it as a flare. The full inode-and-permissions machinery arrives in the OS phase; you now hold the decoder.

</Solution>

</Challenges>

<LearnMore title="Negative Numbers: Two's Complement" path="/learn/faza-0/modul-0-1/negative-numbers">

You can now read, write, and overflow *positive* numbers. But there's no minus sign in hardware — so how does a computer store −5? The answer is one of the most elegant tricks in engineering, and the story of what happens when it goes wrong involves a European rocket and half a billion dollars of fireworks.

</LearnMore>
