---
title: "Negative Numbers: Two's Complement"
---

<Intro>

On June 4, 1996, the European Space Agency launched the first Ariane 5 — a rocket that had taken a decade and about $7 billion to develop, carrying four Cluster science satellites worth roughly $370 million. Thirty-seven seconds into the flight, it swerved violently off course and triggered its own self-destruct system. The cause was not an engine, a tank, or a sensor. Deep in the guidance software, a 64-bit velocity value was converted into a **16-bit signed integer** — a box that can hold nothing larger than 32,767. Ariane 5 accelerated faster than its predecessor, the number didn't fit, the conversion raised an exception, and the guidance computer shut down. The backup computer took over, ran the *exact same code* on the exact same data, and died the same death 72 milliseconds earlier. Half a billion dollars of hardware was destroyed by a number that wouldn't fit in a box — a *signed* box. Last lesson you overflowed unsigned counters; this lesson you'll learn what "signed" means, why it's one of the most elegant tricks in all of engineering, and where its sharp edges still cut today.

</Intro>

<YouWillLearn>

- Why there is no minus sign anywhere in hardware — and what a "negative number contract" must promise
- Two failed designs (sign-magnitude and one's complement) and the concrete way each one breaks
- **Two's complement**: the odometer driven backwards, and the flip-all-bits-add-1 recipe
- The deepest view: the MSB is just an ordinary position whose weight is **−128**
- The signed ranges of 8/16/32/64-bit integers — and the lonely `−128` that makes `abs()` lie
- How a signed overflow hid inside Java's `binarySearch` for nine years, and how to spot it in review

</YouWillLearn>

## There is no minus sign in the hardware {/*no-minus-sign-in-the-hardware*/}

Recall the first rule of this course: **bytes have no meaning — contracts do.** The byte `01001000` became the letter `H`, the number 72, or a third of a pixel, depending purely on which contract you read it under. So far all our number contracts have been **unsigned**: eight bits, weights 1 through 128, range 0 to 255, nothing below zero even conceivable.

But real programs are full of values that go below zero: temperatures, bank balances, coordinate offsets, velocity components pointing the wrong way. And a memory cell offers you exactly two voltage levels — there is no third state for "minus," no tiny dash etched into the silicon. Whatever a negative number is going to be, it must be built out of plain 0s and 1s, under a new contract.

A good contract has to promise more than "here is a way to write −5." It must keep **arithmetic** working — ideally on the same simple adder circuit that already handles unsigned numbers, because in 1950 (and, honestly, in 2026) every extra circuit costs money, power, and failure modes. Watch what happens when designers forget that second requirement.

## Attempt 1: sign-magnitude {/*attempt-1-sign-magnitude*/}

The obvious idea — the one you or I would invent in the first five minutes — is to copy how humans write numbers: a sign, then a magnitude. Reserve the leftmost bit (the MSB) as a **sign flag**: `0` means positive, `1` means negative, and the remaining seven bits store the ordinary value.

```
+5 = 0 0000101      (sign 0, magnitude 5)
−5 = 1 0000101      (sign 1, magnitude 5)
```

This is called **sign-magnitude**, and it has two defects — one ugly, one fatal.

The ugly one: there are now **two zeros**. `00000000` is +0 and `10000000` is −0 — two different bit patterns claiming to be the same number. Every equality check in the machine must now special-case them ("is x zero? check both spellings"), and one of your 256 precious patterns is wasted on a duplicate.

The fatal one: **addition breaks.** Feed +5 and −5 into a plain binary adder — the odometer mechanism from last lesson, which just adds columns and carries — and watch:

```
    0 0000101      +5
  + 1 0000101      −5
  -----------
    1 0001010      sign 1, magnitude 10  →  −10 ✗

Expected: 0.  Got: −10.
```

The adder did its job perfectly; the *contract* produced nonsense, because under sign-magnitude, adding a negative number is not the same mechanical motion as adding a positive one. To make arithmetic work you'd need a second circuit: compare the signs, if they differ then subtract the smaller magnitude from the larger, then copy the sign of the larger... That's real hardware that early machines actually built — and paid for.

## Attempt 2: one's complement {/*attempt-2-ones-complement*/}

The second historical attempt is more cunning: to negate a number, **flip every bit**.

```
+5 = 00000101
−5 = 11111010      (every bit inverted)
```

This is **one's complement**, and addition *almost* works. Add +5 and −5 and you get `11111111` — which under this contract is... −0. Still two zeros (`00000000` and `11111111`), and sums that cross zero come out off by one unless the adder performs an extra trick called the **end-around carry**: whenever a carry falls off the left end, loop it back around and add it to the rightmost column. More special hardware, more special cases.

<Note>

One's complement is not a museum piece that lost and vanished. Serious machines shipped with it — Seymour Cray's CDC 6600, the fastest computer in the world in 1964, was a one's-complement machine — and one corner of it is still running *right now, on your device*: the **Internet checksum** that guards every IP packet header is defined (RFC 1071) as a one's-complement sum. When the networks phase opens up packet headers, you'll meet the end-around carry again, alive and well.

</Note>

Scoreboard so far: two designs, both with twin zeros, both needing custom circuitry to add correctly. The winning design comes from asking a question neither attempt asked — and you already own the machine that answers it.

## The odometer driven backwards {/*the-odometer-driven-backwards*/}

Last lesson's odometer counted *up*: wheels roll forward, a full wheel carries into its neighbor, and a completely full set of wheels rolls over to zero. Now drive the car **backwards**.

A six-wheel odometer reads `000000`. Reverse one kilometer. Each wheel borrows from its neighbor, the borrow ripples all the way left, falls off the end, and the display shows:

```
000000  −  1  =  999999
```

Now the philosophical move. That display *is what it is*. If you keep treating `999999` as nine hundred ninety-nine thousand..., the odometer is broken. But if you declare a new contract — "any reading this close to the top of the dial means we're *below* zero" — then `999999` simply **is −1**. Drive back one more: `999998` is −2. And it's not just labeling: the arithmetic already works. Add 1 to `999999` and the wheels roll over to `000000` — the overflow that was last lesson's villain is doing exactly what −1 + 1 must do. **The wrap-around is the minus sign.**

Two's complement is precisely this contract, applied to a binary odometer. Take the 8-bit dial with its 256 positions and *re-zone* it: patterns `00000000` through `01111111` keep their unsigned meanings, 0 through +127. Patterns `10000000` through `11111111` — the top half of the dial, the ones "close to rollover" — are declared to be **−128 through −1**.

<Diagram name="negative-numbers/twos_complement_circle" height={430} width={640} alt="A circular dial with 16 tick marks representing the 256 states of a byte, matching the overflow dial from the previous lesson. 0 sits at the top. Going clockwise down the right side, ticks are labeled +32, +64, +96 and +127 in blue — the right half of the dial is spanned by a blue arc labeled 'positive, MSB = 0'. At the bottom, immediately clockwise after +127, a jagged red seam line crosses the dial edge, labeled 'the seam: +127 + 1 = −128'. Continuing clockwise up the left side, ticks are labeled −128, −96, −64, −32 and −1 in red-toned text, spanned by a muted red arc labeled 'negative, MSB = 1'. −1 sits immediately counterclockwise of 0 at the top. Center text reads: 'same 256 states — new contract'.">

The same 256-position dial as last lesson — re-zoned. The right half is positive, the left half is negative, −1 sits right next to 0, and the only dangerous crossing is the seam at the bottom.

</Diagram>

Look at what this buys, with *zero* new hardware:

- **One zero.** `00000000` and nothing else. The pattern `11111111` is no longer a spare zero — it's −1, the "999999" of binary.
- **Addition just works.** −1 + 1 means `11111111 + 00000001` = `1 00000000`; the carry falls off the 8-bit edge exactly like the odometer's borrow did, leaving `00000000`. ✓
- **The MSB still reveals the sign** — every negative pattern starts with 1, every non-negative with 0 — but it is a *consequence* of the zoning, not a special flag with special rules.

Formally: the pattern that represents −x is `2⁸ − x` (for a byte), the same way 999999 is 10⁶ − 1. That's where the name comes from — you store the *complement with respect to a power of two*.

## The recipe: flip the bits, add one {/*flip-the-bits-add-one*/}

Computing `256 − x` in your head is no fun, so here is the mechanical shortcut every engineer actually uses. To negate any number:

1. **Flip every bit** (that's one's complement — `255 − x`).
2. **Add 1** (correcting to `256 − x`).

<Diagram name="negative-numbers/negate_invert_add_one" height={330} width={720} alt="Three byte boxes in a row connected by labeled arrows. The first box shows 00000101 captioned '+5'. An arrow labeled 'flip every bit' leads to the second box showing 11111010. A second arrow labeled '+ 1' leads to the third box, highlighted in blue, showing 11111011 captioned '−5'. Below the boxes, a verification sum is laid out in columns: 00000101 plus 11111011 equals 1 00000000, with the leading carry digit 1 shown in red falling outside the 8-bit frame, and the surviving eight bits 00000000 highlighted, captioned 'the carry falls off the edge — the sum is exactly 0'.">

Negating +5: flip, add one. The verification below is the entire sales pitch — a plain adder produces a clean, single zero.

</Diagram>

**Worked example — encode −5:**

```
 +5          = 00000101
 flip        = 11111010
 add 1       = 11111011      ← this is −5

Verify with a plain adder:
   00000101      +5
 + 11111011      −5
 ----------
 1 00000000
 ↑ carry falls off the 8-bit edge (the odometer rolling over)

 Result: 00000000 = 0 ✓
```

No sign-comparison circuit, no end-around carry, no twin zero. The dumb adder from last lesson gives the right answer *because the contract was designed around what the adder already does.*

**Worked example — subtraction for free.** Once negation is cheap, subtraction stops being its own operation: `a − b` is just `a + (−b)`. Compute 7 − 3:

```
 −3:  00000011 → flip → 11111100 → +1 → 11111101

   00000111       7
 + 11111101      −3
 ----------
 1 00000100
 ↑ discard the falling carry

 Result: 00000100 = 4 ✓
```

This is why your CPU does not contain a subtractor. It contains an adder and a row of bit-flippers, and every subtraction you have ever executed was secretly an addition. One circuit, four jobs: signed add, unsigned add, signed subtract, unsigned subtract — the adder cannot even *tell* which one it's performing; only the contract you read the bits under differs. That economy is why **two's complement won**: John von Neumann recommended it in his famous 1945 EDVAC report, IBM's System/360 — the same 1964 machine that standardized the 8-bit byte — cemented it, and today it is so universal that the C++20 standard finally gave up pretending alternatives exist and declared signed integers *are* two's complement, by law.

<DeepDive>

#### The deepest view: the MSB weighs −128 {/*the-msb-weighs-minus-128*/}

Flip-and-add-1 is the recipe; here is the *mental model* that makes every "mystery" of two's complement dissolve at once. Forget signs entirely. A two's complement byte is ordinary positional notation from last lesson — read it by adding weights, exactly as before — with one change: **the MSB's weight is −128 instead of +128.**

<Diagram name="negative-numbers/msb_negative_weight" height={330} width={720} alt="Eight bit boxes in a row containing 1 1 1 1 1 0 1 1. Under each box its weight: −128 shown in danger red under the first box, then 64, 32, 16, 8, 4, 2, 1 in normal text. The boxes holding a 1 are highlighted; the box holding 0 (weight 4) is dimmed. Curved arrows flow from the highlighted columns down into a sum line reading: −128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5. The −128 term is red.">

`11111011` read as plain add-the-weights — with the top weight negative. Same skill as last lesson, one sign changed.

</Diagram>

```
  1        1     1     1     1    0    1    1
−128      64    32    16     8    4    2    1

−128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5 ✓
```

Now watch the mysteries evaporate:

- **Why does MSB = 1 mean negative?** Because −128 outweighs everything else combined: the other seven weights sum to at most +127, so once the −128 column is paid, the total *cannot climb back above zero.* The "sign bit" isn't a flag — it's just the heaviest weight, and it happens to be negative.
- **Why exactly one zero?** Zero is "no weights selected": `00000000`. There is no second way to select weights that cancel to zero, because +127 worth of positives can never fully cancel −128.
- **Why does the range run −128 to +127 instead of symmetrically?** All positives selected without the MSB: +127. The MSB alone: −128. The asymmetry isn't a quirk to memorize — it's the arithmetic of the weights, sitting in plain sight.

One byte, one reading rule, every property derived. This is the view worth keeping.

</DeepDive>

## The range table — and the lonely −128 {/*the-range-table-and-the-lonely-minus-128*/}

The same contract scales to any width — flip-and-add-1 works identically, and the top bit's weight is −2ⁿ⁻¹:

| Width | Signed range | Where you meet it |
|-------|--------------|-------------------|
| 8-bit | −128 … +127 | audio samples, sensor readings, `int8_t` |
| 16-bit | −32,768 … +32,767 | **Ariane 5's fatal box**; audio CDs; old game coordinates |
| 32-bit | −2,147,483,648 … +2,147,483,647 | `int` in C/Java; the Gangnam Style ceiling; Y2038's clock |
| 64-bit | ≈ ±9.2 × 10¹⁸ | `long`, `BIGINT`, modern timestamps |

Notice every row has one more citizen on the negative side. That lonely extra value — `−128`, `−32,768`, `−2,147,483,648` — is the source of a genuinely weird bug. Try to negate −128 with the recipe:

```
 −128       = 10000000
 flip       = 01111111
 add 1      = 10000000      ← −128 again!
```

+128 does not exist in a signed byte (the ceiling is +127), so the recipe wraps around and hands you back the very number you tried to negate. **Negating the minimum value returns the minimum value** — which means the absolute-value function, of all things, can return a negative number. In Java, `Math.abs(Integer.MIN_VALUE)` really does return −2,147,483,648: the one input where `abs()` lies. You can watch the same wraparound in a browser console using a typed array, which forces JavaScript's numbers into a true signed byte:

```js
const a = new Int8Array(1);
a[0] = -128;
a[0] = -a[0];   // negate it
a[0]
```

<ConsoleBlock level="info">

-128

</ConsoleBlock>

<Pitfall>

**Signed overflow doesn't just wrap — it flips the sign.**

The unsigned counter from last lesson at least failed *small*: 255 + 1 restarted at 0. The signed dial fails *violently*, because the seam sits between the two most distant values: `+127 + 1 = −128`. Add two positive numbers, receive a huge negative one. A bank balance climbs past the ceiling and becomes a debt; a game score becomes the worst score possible; a velocity to the right becomes a velocity to the left.

And in C and C++ it's worse than wrong — signed overflow is formally **undefined behavior**: the compiler is licensed to assume it never happens and may optimize your safety checks *out of existence*. `if (x + 1 < x)` looks like a clever overflow test; a modern compiler may delete it entirely, reasoning that for signed `x` the condition is "impossible." Test *before* the operation (`x > INT_MAX − y`), or use the compiler's checked-arithmetic builtins — never test after.

</Pitfall>

## The bug that hid for twenty years {/*the-bug-that-hid-for-twenty-years*/}

Sign-flip overflow is not an exotic failure for rockets. In 2006, Joshua Bloch — the engineer who wrote much of Java's core library — published a confession titled *"Nearly All Binary Searches and Mergesorts are Broken."* The culprit was one line that appears in virtually every binary search ever written, including the one he'd put into `java.util.Arrays` nearly a decade earlier:

```
mid = (low + high) / 2;
```

The *algorithm* is textbook-correct. But `low + high` is a signed 32-bit addition, and when a search runs over an array of more than about a billion elements (2³⁰), `low + high` can exceed 2,147,483,647 — the sum crosses the seam, turns negative, and `mid` becomes a negative index. The program crashes with an `ArrayIndexOutOfBoundsException`... but only on inputs so large nobody tested them in 1997.

The bug sat in the JDK for about nine years. Bloch's larger point was harsher: essentially the same line appears in Jon Bentley's classic *Programming Pearls* (1986) — a book that formally *proves* the algorithm correct — so the bug had been hiding in "proven" code for roughly twenty years. The proof was about ideal integers; the crash was about 32-bit ones. Correct algorithm, broken implementation.

The fixes are worth memorizing, because you will one day type this line yourself:

```
mid = low + (high − low) / 2;     // the difference can't overflow
mid = (low + high) >>> 1;         // Java: unsigned shift — division
                                  // that ignores the sign contract
```

Recall last lesson's moral: *limits look unreachable at design time, but systems outlive their designers' assumptions.* In 1986, a billion-element array was science fiction. By 2006, it was a Tuesday.

<DeepDive>

#### Where sign-magnitude went to live {/*where-sign-magnitude-went-to-live*/}

Sign-magnitude lost the integer war, but it didn't die — it retired to a very comfortable estate. **IEEE 754 floating-point numbers** — the `float` and `double` in every language, the subject of the next lesson — store their values as a sign bit plus a magnitude. Attempt 1 from this lesson is running inside every `0.5` and `3.14` your code touches.

And it brought its old baggage along: floating-point genuinely has **two zeros**. `+0.0` and `−0.0` are distinct bit patterns in every IEEE machine. The committee papered over the ugliness — the `==` operator is required to call them equal — but the seams show if you press:

```
 0.0 === -0.0        →  true      (the treaty)
 Object.is(0, -0)    →  false     (the bits)
 1 / -0.0            →  -Infinity (the tell)
```

Fifty years after losing to two's complement, the twin-zero problem is alive in every processor on Earth — just one floor up.

</DeepDive>

## Break the sign yourself {/*break-the-sign-yourself*/}

Here is the switch panel from Lesson 1, upgraded: the same eight switches, but now *both* contracts read the byte at once. The MSB — the switch that owns the −128 weight — wears a red border. Flip switches and watch: as long as the MSB stays dark, the two readings agree perfectly. Light it, and the same bits split into two different numbers, 256 apart. Try building `11111011` (−5), then `10000000` (the lonely −128), then start from `01111111` (+127) and "add one" by hand:

<Sandpack>

```js
import { useState } from 'react';

export default function SignedPanel() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 1, 0, 1]);

  function flip(i) {
    const next = bits.slice();
    next[i] = next[i] ? 0 : 1;
    setBits(next);
  }

  const unsigned = bits.reduce((sum, b) => sum * 2 + b, 0);
  const signed = unsigned >= 128 ? unsigned - 256 : unsigned;
  const split = bits[0] === 1;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>
        One byte, two contracts. The red-bordered switch is the MSB:
      </p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => flip(i)}
            style={{
              width: 38, height: 50, margin: 2, fontSize: 22,
              borderRadius: 8, cursor: 'pointer',
              border: i === 0 ? '3px solid #c1554d' : '1px solid #888',
              background: bit ? '#087ea4' : 'transparent',
              color: bit ? 'white' : 'inherit'
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <h2>
        unsigned: {unsigned}
        <br />
        signed:{' '}
        <span style={{ color: split ? '#c1554d' : 'inherit' }}>
          {signed}
        </span>
      </h2>
      <p style={{ fontFamily: 'system-ui' }}>
        {split
          ? 'MSB lit: the same bits now mean two numbers, 256 apart.'
          : 'MSB dark: both contracts agree.'}
      </p>
    </div>
  );
}
```

</Sandpack>

That gap of exactly 256 is the whole lesson in one number: the signed reading is `unsigned − 256` whenever the MSB is lit — the odometer interpreted as "just below zero" instead of "near the top."

<Recap>

- Hardware has **no minus sign** — negative numbers are a *contract* laid over ordinary bits, and a good contract must keep the plain adder working.
- **Sign-magnitude** (a sign flag + magnitude) and **one's complement** (flip all bits) both fail the same two ways: **twin zeros** and arithmetic that needs special hardware.
- **Two's complement** is the odometer driven backwards: the top half of the dial is re-zoned as −128…−1, so `11111111` is −1 and the rollover *is* the minus sign. One zero, and a dumb adder handles add *and* subtract, signed *and* unsigned.
- To negate: **flip every bit, add 1.** Subtraction is just addition of the negation — your CPU contains no subtractor.
- Deepest view: the MSB is an ordinary position whose **weight is −128** (or −2ⁿ⁻¹). This single fact explains the sign bit, the single zero, and the asymmetric range −128…+127.
- The asymmetry leaves **−128 with no positive twin**, so negating INT_MIN returns INT_MIN — the one input where `abs()` returns a negative number.
- **Signed overflow flips the sign**: `+127 + 1 = −128`, two positives sum to a negative, and in C/C++ it's undefined behavior. It hid in Java's `binarySearch` as `(low + high) / 2` for **~9 years** (and in *Programming Pearls* for ~20); write `low + (high − low) / 2`.

</Recap>

<Challenges>

#### Encode −12 {/*encode-minus-12*/}

Encode −12 as an 8-bit two's complement byte using flip-and-add-1. Then verify your answer with the *other* method: read the byte back using the −128 weight.

<Hint>

Start from +12. You wrote 12 in binary last lesson: which two weights from 1, 2, 4, 8, 16... sum to 12?

</Hint>

<Solution>

```
 +12        = 00001100      (8 + 4)
 flip       = 11110011
 add 1      = 11110100      ← −12
```

Verify by weights, MSB = −128:

```
  1     1     1     1    0    1    0    0
−128   64    32    16    8    4    2    1

−128 + 64 + 32 + 16 + 4 = −128 + 116 = −12 ✓
```

Two independent methods, one answer — that cross-check habit is exactly how you catch a slipped bit in real work.

</Solution>

#### One byte, two readings {/*one-byte-two-readings*/}

A memory dump shows the byte `11101100`. What is it unsigned? What is it signed? Answer both, then find the shortcut connecting your two answers.

<Solution>

Unsigned, add the weights: 128 + 64 + 32 + 8 + 4 = **236**.

Signed, MSB weighs −128: −128 + 64 + 32 + 8 + 4 = −128 + 108 = **−20**.

The shortcut: whenever the MSB is lit, **signed = unsigned − 256**. Check: 236 − 256 = −20 ✓. That's the dial in one formula — the same position read as "236 steps up" or "20 steps below the rollover." It's also exactly the line the Sandpack toy uses.

</Solution>

#### The absolute value that lies {/*the-absolute-value-that-lies*/}

A teammate claims: "`abs(x)` is always ≥ 0 — that's its whole job." Using an 8-bit byte, prove them wrong: show what flip-and-add-1 actually produces for −128, and explain *why* no correct answer was available.

<Solution>

```
 −128       = 10000000
 flip       = 01111111
 add 1      = 10000000      ← −128, unchanged
```

The recipe returns its own input. And it *had* to fail: the correct answer, +128, does not exist in the signed byte — the positive side ends at +127, because the pattern `10000000` that "should" be +128 is busy being −128 itself. The range is asymmetric (one zero + 127 positives + 128 negatives = 256 states), so the minimum value has no positive twin.

This scales to every width: `Math.abs(Integer.MIN_VALUE)` in Java returns −2,147,483,648. Any code that computes `abs()` and then *assumes* the result is non-negative — as an array index, a distance, a bucket number — has a one-in-4.3-billion input that breaks it. Defensive fix: reject or widen INT_MIN before taking the absolute value.

</Solution>

#### The sensor that went mad {/*the-sensor-that-went-mad*/}

Transfer task. A firmware teammate asks you to review this situation: an engine sensor reports temperature as an **8-bit signed** value (range −128…+127 °C, "more than enough — the engine never exceeds 110 °C"). A calibration update adds a fixed **+30** offset to every reading before it's stored. During a hot test, the raw sensor reads 100 °C. Walk through the arithmetic the firmware performs, state what value gets stored, and write the two-sentence review comment you'd leave — including why this failure mode is *more* dangerous than a crash.

<Solution>

The firmware computes 100 + 30 = 130 — but 130 doesn't fit in a signed byte (ceiling +127). Bit-level:

```
   01100100      100
 + 00011110       30
 ----------
   10000010      MSB lit → signed reading: −128 + 2 = −126
```

The stored temperature is **−126 °C**. The sum crossed the seam at +127 and landed deep on the negative side.

Review comment: *"The +30 calibration can push readings above +127 (raw ≥ 98 °C already overflows), and the stored value silently becomes a large negative temperature — an overheating engine will read as impossibly cold, so any 'too hot' alarm will never fire. Please widen the stored type to 16-bit (or clamp before adding), and add a test at raw = 98–127."*

Why worse than a crash: a crash is loud — watchdogs restart things, logs fill, humans are paged. Here the system keeps running confidently on **silently wrong data**, and the safety logic reads "−126°" as "definitely not overheating." Ariane 5's designers, note, chose the opposite trade — the conversion raised an exception rather than storing garbage — and that crash *was* catastrophic too. The real lesson sits one level up: know your ranges *at design time*, because by the time the seam is crossed, both failure modes are bad. ✓ (98 + 30 = 128 → `10000000` = −128, the first raw value to go wrong.)

</Solution>

</Challenges>

<LearnMore title="Floating Point: Why 0.1 + 0.2 Is Not 0.3" path="/learn/faza-0/modul-0-1/floating-point">

Integers are now yours, positive and negative. But the world also runs on 3.14, 0.001, and 6.02 × 10²³ — and the contract that stores *those* is stranger than anything in this lesson: it resurrects the sign bit, keeps two zeros on purpose, and cannot write down 0.1 exactly at all. In 1991, that last fact — a rounding error of 0.000000095 seconds per tick — cost a Patriot missile battery its aim and 28 soldiers their lives.

</LearnMore>
