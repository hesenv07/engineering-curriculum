---
title: "Negative Numbers: Two's Complement"
---

<Intro>

June 4, 1996. The European Space Agency launches Ariane 5 for the first time — a rocket that took ten years and billions of dollars to develop. The liftoff is perfect. Thirty-seven seconds later, the rocket veers off course and triggers its self-destruct system: half a billion dollars turning into fireworks over French Guiana. The investigation board's finding fits in one sentence: *a number didn't fit into its box.* A 64-bit value holding the rocket's horizontal velocity was being converted into a 16-bit signed integer — a leftover from Ariane 4, where that velocity could never grow large enough to matter. Ariane 5 was faster. The number overflowed, the navigation computer crashed, and the backup computer — running *the same code* — crashed with it. In this lesson you'll learn the machinery underneath that disaster: how computers store negative numbers, and exactly where that scheme bends and breaks.

</Intro>

<YouWillLearn>

- Why there is no minus sign in hardware — and what to do about it
- Two failed designs (sign-magnitude and one's complement) and what killed them
- Two's complement: the trick that powers virtually every CPU on Earth
- The negate recipe (flip + 1), the negative-weight MSB, and why subtraction comes for free
- The famous asymmetry: why −128 exists but +128 doesn't, and the `abs()` bug it causes
- Signed overflow in the wild: the bug that hid in Java's binary search for nine years

</YouWillLearn>

## The problem: there is no minus sign in hardware {/*no-minus-sign-in-hardware*/}

You know from the previous lessons: memory contains bits and nothing else. To store `−5`, where do we put the "−" symbol? Nowhere — **negativity itself has to be encoded in bits.**

This sounds like a small bookkeeping detail, but the design chosen here decides three things at once:

1. **How much extra circuitry the CPU needs.** In the 1950s, when every transistor was precious, an encoding that required a separate subtraction circuit was a serious cost.
2. **Whether comparisons are cheap.** Checking `x == 0` happens billions of times per second; an encoding where zero has two representations doubles that work.
3. **What bugs the encoding leaks into software.** Fifty years later, the choice made for hardware reasons still shapes the bugs you'll debug in high-level languages.

Engineers arrived at the answer in three attempts. The first two failures aren't just history — without them you can't feel why the third one is beautiful. So let's walk the same road.

## Attempt 1: Sign-magnitude — the "schoolbook" way {/*attempt-1-sign-magnitude*/}

The first idea anyone has: reserve the leftmost bit (the **most significant bit**, MSB) for the sign — 0 means positive, 1 means negative — and let the remaining 7 bits hold the magnitude:

| Binary | Value |
|---|---|
| `00000101` | +5 |
| `10000101` | −5 |

It mirrors what we write on paper, which is why it's called **sign-magnitude**. But it cracks in two places.

**First crack: two zeros.** `00000000` is +0 and `10000000` is −0. One value, two representations — which means every equality check against zero is secretly *two* checks, every hardware comparator needs extra logic, and every piece of software that forgets this grows a subtle bug.

**Second, fatal crack: addition breaks.** Feed `+5 + (−5)` into an ordinary binary adder — the same circuit that adds unsigned numbers:

```
  00000101   (+5)
+ 10000101   (−5)
──────────
  10001010   = −10 ???
```

Expected: 0. Received: −10. The adder happily added the magnitudes and kept a sign bit it doesn't understand. Conclusion: sign-magnitude hardware needs a *separate, more complex* circuit that first compares signs, then decides whether to add or subtract, then fixes the sign of the result. In the transistor-starved 1950s, that was a deal-breaker.

Sign-magnitude didn't die completely, though — hold that thought until the end of the lesson.

## Attempt 2: One's complement — one step short {/*attempt-2-ones-complement*/}

Next idea: to negate a number, **flip every bit**:

| Binary | Value | |
|---|---|---|
| `00000101` | +5 | |
| `11111010` | −5 | (every bit flipped) |

This is **one's complement**, and it *almost* works with a plain adder. Almost: in some cases the carry that falls off the left end has to be picked up and added back into the result — a quirk called the *end-around carry*, which costs extra hardware and an extra addition step. And yes, zero is still twins: `00000000` and `11111111`.

Warm — but not fire. Several respectable machines of the 1960s (including the UNIVAC line and the CDC 6600, the fastest computer of its day) shipped with one's complement. History voted against them.

## Two's complement: bending the dial into the negatives {/*twos-complement*/}

Picture the mechanical odometer from the previous lesson showing `000000`. Now drive the car **backwards** by one kilometer. What does it show?

`999999`.

So in this counter's own language, "999999" *is* −1. And 999998 is −2, 999997 is −3. Nobody added a minus sign to the odometer — we simply agreed that the "far side" of the dial belongs to the negative numbers.

**Two's complement** is exactly this trick in binary. On an 8-bit dial, one step back from `00000000` lands on `11111111`. Therefore:

| Binary | Signed value |
|---|---|
| `11111111` | −1 |
| `11111110` | −2 |
| `11111101` | −3 |
| … | … |

<Diagram name="menfi-ededler/twos_complement_circle" height={400} width={640} alt="A circular dial representing 8-bit signed numbers: 0 at the top, +64 on the right, +127 at the bottom right, −128 at the bottom left, −64 on the left, and −1 just left of 0. A red arrow at the bottom marks the overflow boundary where +127 + 1 wraps to −128.">

Same 256-state dial as unsigned — but now the left half counts down into the negatives. The dangerous seam moved from "255 → 0" to "+127 → −128".

</Diagram>

Compare this with the unsigned dial from the previous lesson: the circle is identical, all 256 states are identical — **only our interpretation of the left half changed.** This is the "everything is interpretation" idea from Lesson 1 striking again, and it's worth pausing on: the bits `11111111` are simultaneously 255 (unsigned) and −1 (signed). The CPU doesn't know which one you mean. Only your program does.

### The practical recipe: flip and add one {/*flip-and-add-one*/}

You don't have to count backwards around a dial every time. There's a mechanical recipe for negating any number: **invert every bit, then add 1.**

<Diagram name="menfi-ededler/negate_invert_add_one" height={260} width={720} alt="Three boxes connected by arrows: 00000101 labeled +5, then after a 'flip all bits' arrow 11111010, then after an 'add 1' arrow the highlighted result 11111011 labeled −5. Below, a verification line shows 00000101 + 11111011 = 1 00000000, where the ninth bit falls off and the remaining eight bits equal zero.">

Negation is two cheap operations: a bitwise NOT and an increment.

</Diagram>

Let's verify that `11111011` really *behaves* like −5 by running the big test — `+5 + (−5)` — through a completely ordinary adder:

```
   00000101    (+5)
 + 11111011    (−5)
 ──────────
 1 00000000
 ↑
 the 9th bit doesn't fit in an 8-bit register — it falls off

 remaining:  00000000  =  0  ✓
```

**A single zero. A plain adder. And subtraction comes for free** — `a − b` is just `a + (−b)`, so the CPU needs no subtraction circuit at all. Better still, the *same* adder serves signed and unsigned numbers, because the bit patterns behave identically; only the interpretation differs. One circuit, four operations (signed add, signed sub, unsigned add, unsigned sub). For hardware designers this is close to a free lunch, which is why virtually every CPU manufactured since the 1960s — from the IBM System/360 to the chip in your phone — uses two's complement. In 2008, the C standard still formally allowed all three encodings; the C23 standard finally admitted reality and made two's complement the only one.

<DeepDive>

#### The deepest view: the MSB's weight is negative {/*msb-negative-weight*/}

The flip-and-add-one recipe works, but it hides *why* it works. Here's the view that makes two's complement feel inevitable rather than magical.

In ordinary unsigned binary, the 8 position weights are: 128, 64, 32, 16, 8, 4, 2, 1. Two's complement changes exactly one thing: **the MSB's weight becomes −128.** Every other rule — positions, weights, addition — stays untouched.

<Diagram name="menfi-ededler/msb_negative_weight" height={310} width={720} alt="The eight bits of 11111011 in boxes with their weights underneath: −128 (highlighted in red as the only negative weight), 64, 32, 16, 8, 4, 2, 1. The sum line reads −128 + 64 + 32 + 16 + 8 + 2 + 1 = −5.">

Decode −5 the same way you decoded 53 in the last lesson — just remember the first weight is negative.

</Diagram>

> `11111011` = −128 + 64 + 32 + 16 + 8 + 0 + 2 + 1 = −128 + 123 = **−5** ✓

Now several mysteries dissolve at once:

- **Why does MSB = 1 always mean negative?** Because −128 outweighs everything the other seven bits can muster (their maximum is +127). The MSB isn't a "minus flag" — it's a regular position that happens to have a negative weight.
- **Why is the range asymmetric (−128 to +127)?** The most negative number is `10000000` = −128 alone; the most positive is `01111111` = +127. There's simply no bit pattern for +128.
- **Why is there only one zero?** `00000000` sums to 0; there's no second pattern that does.

This "one weight is negative" view also generalizes: it's how you can decode a signed number of any width in your head without running the flip-and-add recipe backwards.

</DeepDive>

## Play with it: one pattern, two meanings {/*sandpack-signed-unsigned*/}

The toy below is the 8-bit switch panel from Lesson 1 — but now it shows **both interpretations of the same bits** side by side. Try `11111111`, then `10000000`, and watch the two readings drift apart the moment the MSB lights up:

<Sandpack>

```js
import { useState } from 'react';

export default function SignedUnsignedToy() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 1, 0, 1]);

  function toggle(i) {
    const next = [...bits];
    next[i] = next[i] === 0 ? 1 : 0;
    setBits(next);
  }

  const unsigned = bits.reduce((sum, bit, i) => sum + bit * (128 >> i), 0);
  const signed = unsigned >= 128 ? unsigned - 256 : unsigned;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>
        Click the bits (leftmost = MSB, highlighted in red):
      </p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              width: 40,
              height: 52,
              margin: 3,
              fontSize: 22,
              fontFamily: 'monospace',
              borderRadius: 8,
              cursor: 'pointer',
              border: i === 0 ? '2px solid #c1554d' : '1px solid #888',
              background: bit ? (i === 0 ? '#c1554d' : '#087ea4') : 'transparent',
              color: bit ? 'white' : 'inherit',
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <table style={{ margin: '16px auto', fontSize: 18, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '6px 12px', fontFamily: 'system-ui', textAlign: 'right' }}>unsigned:</td>
            <td style={{ padding: '6px 12px', fontFamily: 'monospace' }}><b>{unsigned}</b></td>
          </tr>
          <tr>
            <td style={{ padding: '6px 12px', fontFamily: 'system-ui', textAlign: 'right' }}>signed (two's complement):</td>
            <td style={{ padding: '6px 12px', fontFamily: 'monospace' }}><b style={{ color: signed < 0 ? '#c1554d' : 'inherit' }}>{signed}</b></td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#888', maxWidth: 420, margin: '0 auto' }}>
        While the MSB is 0, both readings agree. Flip it on and the signed
        reading drops by 256 — exactly the negative weight of the MSB.
      </p>
    </div>
  );
}
```

</Sandpack>

Notice something the toy makes obvious: **for values 0–127 the two interpretations are identical.** That's why small positive numbers "just work" everywhere, and why signed/unsigned bugs hide until a value crosses 127 (or its 16/32-bit equivalent) — often years after the code shipped.

## The range table — and the lonely −128 {/*range-and-minus-128*/}

| Bits | Minimum | Maximum |
|---|---|---|
| 8 | −128 | +127 |
| 16 | −32,768 | +32,767 |
| 32 | −2,147,483,648 | +2,147,483,647 |
| 64 | ≈ −9.2×10¹⁸ | ≈ +9.2×10¹⁸ |

The negative side is always exactly one number longer. That lonely extra number — the most negative value, often called `INT_MIN` — is the source of a famous bug family.

Run the negate recipe on −128:

| Step | Binary | |
|---|---|---|
| −128 | `10000000` | start |
| flip all bits | `01111111` | |
| add 1 | `10000000` | = −128 ??? |

**Negating −128 gives back −128**, because +128 doesn't exist in 8 bits. Every language that uses fixed-width integers inherits this: in Java, `Math.abs(Integer.MIN_VALUE)` returns a *negative* number — the only input for which `abs()` breaks its own contract. Code that computes `abs(x)` and then assumes the result is non-negative (say, as an array index: `abs(hash) % buckets`) works perfectly for 4,294,967,295 possible inputs and crashes on exactly one. Bugs with that shape can live in production for a decade.

<Pitfall>

**Signed overflow doesn't announce itself — it changes sign.**

On the unsigned dial, overflow wraps a big number to a small one (255 + 1 = 0), which is at least *visibly* wrong. On the signed dial, the seam sits between +127 and −128, so overflow flips the sign: adding two positive numbers yields a negative one.

```
  01111111   (+127)
+ 00000001   (+1)
──────────
  10000000   (−128)
```

A balance that suddenly shows −2,147,483,648, a progress percentage that turns negative, a timer that jumps into the past — when you see a large negative number appear out of nowhere, your first suspect should be signed overflow near the type's maximum. And a warning for later: in C and C++, signed overflow is formally *undefined behavior* — the compiler is allowed to assume it never happens and optimize accordingly, producing results stranger than a mere wraparound.

</Pitfall>

## The bug that hid in Java for nine years {/*the-java-binary-search-bug*/}

In 2006, Joshua Bloch — one of Java's original library authors — published a post with a startling title: *"Nearly All Binary Searches and Mergesorts are Broken."* The bug he described had been sitting in `java.util.Arrays.binarySearch()` since Java 1.2, and in the classic textbook *Programming Pearls* for twenty years before that. It is one line long:

```java
int mid = (low + high) / 2;
```

Looks flawless — it's the "take the middle" line from every algorithms course. The trap: `low + high` is computed *first*, as a 32-bit signed int. If the array is large enough (over about 2³⁰ elements, roughly a billion) and the search is near the top, `low + high` exceeds 2,147,483,647 — and, as you now know, wraps around to a **negative** number. The next line indexes the array with a negative `mid` and the program crashes.

For years nobody noticed, because nobody searched arrays that big. Then memory got cheap, datasets got huge, and a "mathematically proven correct" algorithm started throwing exceptions. The fix is tiny:

```java
int mid = low + (high - low) / 2;   // difference can't overflow
// or, in Java specifically:
int mid = (low + high) >>> 1;       // unsigned shift rescues the carried bit
```

Two lessons worth engraving. First: **an algorithm can be correct while its implementation is broken**, because paper mathematics has unlimited integers and CPUs don't. Second, the same one as the previous lesson but sharper: the boundary was invisible at design time — arrays of a billion elements were science fiction in 1986 — yet the code outlived the assumption.

<DeepDive>

#### So where did sign-magnitude go? {/*where-did-sign-magnitude-go*/}

It didn't die — it moved. **IEEE 754 floating-point numbers** (the `float` and `double` you'll meet in the next lesson) store their sign as a separate bit, sign-magnitude style. That's why floats famously have both **+0.0 and −0.0** — the twin zeros that were a bug in integer sign-magnitude are a documented *feature* in floating point (they preserve the direction from which a value underflowed to zero).

For integers, the hardware argument won: two's complement, one adder, one zero. For floats, the hardware works completely differently anyway (you'll see why), so the twin-zero cost was acceptable. Same trade-off, different answers — a pattern you'll meet a hundred more times in this course.

One more relic: the two's complement idea itself predates electronics. Mechanical calculators in the 1900s and Pascal's 17th-century Pascaline performed subtraction using the "nines' complement" — the base-10 sibling of the same trick. Flip each digit to `9 − digit`, add 1, and subtraction becomes addition on a machine that only knows how to add.

</DeepDive>

<Recap>

- There's no minus sign in hardware; negativity must be encoded in bits. Sign-magnitude (two zeros, broken addition) and one's complement (end-around carry, still two zeros) both failed.
- **Two's complement** bends the dial: the far half of the wraparound circle represents negatives. `11111111` = −1 on an 8-bit dial.
- Negate = **flip all bits, add 1**. Verify: x + (−x) overflows cleanly to a single, unique 0.
- The genius: **one ordinary adder** handles signed and unsigned addition *and* subtraction. That's why every CPU since the 1960s uses it.
- The deepest view: it's ordinary positional binary where **the MSB's weight is −2ⁿ⁻¹**. All the "mysteries" (sign detection, asymmetric range, single zero) follow from this alone.
- Range is asymmetric: −128…+127. **Negating INT_MIN returns INT_MIN**, so `abs()` can return a negative number.
- **Signed overflow flips signs**: +127 + 1 = −128. It hid in Java's `binarySearch` for nine years as `(low + high) / 2`. Correct algorithm, broken implementation.
- Sign-magnitude survives inside floating point (hence +0.0 and −0.0) — the bridge to the next lesson.

</Recap>

<Challenges>

#### Run the recipe {/*run-the-recipe*/}

Encode −12 as an 8-bit two's complement number. Then verify your answer using the negative-weight method.

<Solution>

Start from +12 and run flip-and-add-one:

| Step | Binary | |
|---|---|---|
| +12 | `00001100` | |
| flip all bits | `11110011` | |
| add 1 | `11110100` | = −12 |

Verify with weights (remember the MSB weighs −128):

−128 + 64 + 32 + 16 + 4 = −128 + 116 = **−12** ✓

</Solution>

#### Decode the pattern {/*decode-the-pattern*/}

A debugger shows you the byte `11101100`. What is its value if the variable is unsigned? And if it's signed?

<Solution>

**Unsigned:** 128 + 64 + 32 + 8 + 4 = **236**.

**Signed:** the MSB is 1, so use the negative weight: −128 + 64 + 32 + 8 + 4 = −128 + 108 = **−20**.

Cross-check with the shortcut you can now derive yourself: for any 8-bit pattern, signed = unsigned − 256 whenever the MSB is set. 236 − 256 = **−20** ✓. This is exactly the `unsigned >= 128 ? unsigned - 256 : unsigned` line from the Sandpack toy.

</Solution>

#### The impossible negation {/*the-impossible-negation*/}

Without running the recipe, explain in one or two sentences why an 8-bit `abs(−128)` cannot return the right answer — and predict what flip-and-add-one actually produces for it.

<Solution>

The right answer, +128, doesn't exist in 8 bits — the positive side ends at +127, because the pattern that "would be" +128 (`10000000`) is already taken by −128 itself. The recipe confirms it: flip `10000000` → `01111111`, add 1 → `10000000`. Negating −128 returns −128, which is why `Math.abs(Integer.MIN_VALUE)` in Java (the 32-bit version of the same story) returns a negative number.

</Solution>

#### Spot the overflow {/*spot-the-overflow*/}

A program stores a temperature sensor reading in an 8-bit signed variable. The sensor reports 100, the code adds a calibration offset of +30. What value does the variable end up holding, and why?

<Solution>

100 + 30 = 130, which exceeds +127. On the signed dial, the arithmetic wraps past the +127/−128 seam:

```
  01100100   (100)
+ 00011110   (30)
──────────
  10000010   = −126
```

Verify with the negative weight: −128 + 2 = **−126**. The variable holds −126 — a plausible-looking temperature, which is what makes this bug family dangerous: nothing crashes, the data is just silently wrong. (And in C, the compiler is even allowed to assume signed overflow never happens.)

</Solution>

</Challenges>
