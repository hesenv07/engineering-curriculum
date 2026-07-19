---
title: "Floating Point: Why 0.1 + 0.2 Is Not 0.3"
---

<Intro>

On the night of February 25, 1991, during the Gulf War, an Iraqi Scud missile struck a US Army barracks in Dhahran, Saudi Arabia, killing 28 soldiers and injuring around 100 more. A Patriot missile battery was stationed there precisely to stop such attacks — and it never fired. The official investigation found no jammed launcher and no radar blind spot. The battery had simply been running for about 100 hours straight, and its internal clock counted time in tenths of a second... using a 24-bit approximation of the number **0.1** — a number that, as you'll prove within the first minutes of this lesson, *cannot be written in binary at all*. The tiny error of 0.000000095 per tick had quietly compounded into a clock that was 0.34 seconds wrong, and at Mach 5, 0.34 seconds is the difference between an intercept and a funeral. Last lesson closed with a promise: the contract for fractional numbers resurrects the sign bit, keeps two zeros *on purpose*, and cannot store 0.1 exactly. Time to open that contract — the strangest and most consequential one in this module.

</Intro>

<YouWillLearn>

- How binary handles digits *after* the point — and the simple divisibility rule that makes 0.1 unwritable
- **Fixed point**: the obvious design, why the Patriot used it, and the range-vs-precision trap it sets
- **Floating point**: scientific notation in binary — sign, exponent, mantissa — and how to encode/decode IEEE 754 by hand
- The full autopsy of `0.1 + 0.2 === 0.3 → false`, digit by digit
- The rubber ruler: why gaps between numbers *grow*, why 2⁵³ is JavaScript's cliff edge, and what Twitter did about it
- The contract's edges — `Infinity`, `NaN`, `−0` — and the two iron rules: never `===` floats, never floats for money

</YouWillLearn>

## Binary after the point {/*binary-after-the-point*/}

Everything so far — switches, weights, odometers, two's complement — lived in the world of whole numbers. But positional notation has always had a second half. In decimal, the digits *left* of the point weigh 1, 10, 100...; the digits *right* of the point weigh 1/10, 1/100, 1/1000 — the same power series, continued past the point in the negative direction:

```
3.25 = 3×10⁰ + 2×10⁻¹ + 5×10⁻²
     = 3     + 0.2    + 0.05
```

Binary extends past the point in exactly the same way — this is still last lesson's add-the-weights skill, just with new weights to memorize: **1/2, 1/4, 1/8, 1/16...**

```
Weights:   ...  4    2    1  .  1/2   1/4   1/8   1/16 ...

0.101₂  =  1×(1/2) + 0×(1/4) + 1×(1/8)
        =  0.5 + 0.125
        =  0.625 ✓

101.11₂ =  4 + 1 + 1/2 + 1/4  =  5.75 ✓
```

Nothing new had to be invented. The odometer's wheels simply continue to the right of the point, each worth half its left neighbor. And to *write* a decimal fraction in binary, there's a mechanical recipe that mirrors last lesson's engineer's method: **keep doubling the fractional part; each time it crosses 1, write a 1 and subtract it; otherwise write a 0.**

```
0.625 × 2 = 1.25   → 1, keep 0.25
0.25  × 2 = 0.5    → 0, keep 0.5
0.5   × 2 = 1.0    → 1, keep 0.0   ← done, remainder empty

0.625 = 0.101₂ ✓
```

Clean, finite, satisfying. Now try the same recipe on the most innocent number in programming.

## Why 0.1 cannot be written down {/*why-zero-point-one-cannot-be-written*/}

Run the doubling recipe on **0.1**:

```
0.1 × 2 = 0.2   → 0
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, keep 0.6
0.6 × 2 = 1.2   → 1, keep 0.2   ← 0.2 again — we've been here!
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, keep 0.6
0.6 × 2 = 1.2   → 1, keep 0.2   ← and again, forever
```

The remainder 0.2 returns, so the digits repeat, so the expansion never ends:

```
0.1 = 0.0001100110011001100110011...₂
            └──┘└──┘└──┘└──┘
             0011 repeating, to infinity
```

One tenth in binary is an **infinite repeating fraction** — the exact same phenomenon as 1/3 = 0.3333... in decimal. And there's a crisp rule governing when this happens. A fraction terminates in a given base only if its denominator's prime factors all divide the base. Base 10 = 2 × 5, so denominators built from 2s and 5s terminate (1/2, 1/5, 1/20 = 0.05) and everything else repeats (1/3, 1/7). Base 2 has exactly *one* prime factor: 2. So in binary, **only denominators that are powers of two terminate** — 1/2, 1/4, 1/8, 3/16... Everything else repeats forever, and 1/10 = 1/(2 × 5) is everything else: the factor of 5 poisons it.

Sit with the consequence for a second, because it's genuinely strange: the number that decimal-thinking humans consider the *simplest possible fraction* — one dime, one tenth of a meter, one tick of a tenth-of-a-second clock — is a number that binary machines **can never store exactly**, no matter how many bits you give them. 24 bits, 53 bits, a million bits: you're always cutting an infinite tail somewhere, and keeping a small error. The entire rest of this lesson is about how computers manage that error — and what happens on the days they don't.

## Attempt 1: nail the point down {/*attempt-1-fixed-point*/}

Before floating point, meet the design your own instincts probably suggest — and the one running inside the Patriot that night. Take a fixed number of bits and simply *declare*, by contract, where the point sits. Say, 8 bits with the point welded in the middle: four bits of whole part, four bits of fraction:

```
Weights:   8  4  2  1  .  1/2  1/4  1/8  1/16

0110.1010  =  4 + 2 + 1/2 + 1/8  =  6.625
```

This is **fixed point**, and it has real virtues: it's just an integer wearing glasses (the bits `01101010` are the plain integer 106, and the contract says "divide what you see by 16"), so all of last lesson's integer arithmetic — the plain adder, two's complement negatives — works unchanged. Fixed point is alive and well today in audio DSP chips, embedded controllers, and financial systems.

But look at what the welded point costs. With four whole bits, the largest value is 15.9375 — a *sixteen* overflows the box. With four fraction bits, the finest step is 1/16 = 0.0625 — anything smaller rounds away to nothing. Widen to 32 bits and the walls move, but the *shape* of the prison doesn't: whatever you grant to range you take from precision, and vice versa, because the point cannot move. A physics engine that needs both a planet's orbit (10¹¹ meters) and an atom's radius (10⁻¹⁰ meters) in the same program is simply out of luck — no fixed placement of the point covers 21 orders of magnitude.

Scientists hit this wall centuries before computers did, and their fix is on every lab whiteboard: don't write 602,214,076,000,000,000,000,000 — write **6.022 × 10²³**. Store a handful of *significant digits*, and separately store *where the point goes*. The point is no longer welded. It **floats**.

<DiagramGroup>

<Diagram name="floating-point/fixed_point_window" height={320} width={340} alt="A row of 8 decimal digit cells with a large point welded between cell 4 and cell 5, showing 0 0 1 2 . 3 4 0 0. The leading zeros and trailing zeros are dimmed and labeled 'wasted cells'. Below, two failure lines in red: 4,096,000 marked 'too big — does not fit', and 0.0000012 marked 'too small — rounds to 0'. Caption: fixed point — the point is part of the contract and cannot move.">

Fixed point: the point is welded into the contract. Storing 12.34 wastes half the cells, and both giants and dwarfs are unrepresentable.

</Diagram>

<Diagram name="floating-point/floating_point_window" height={320} width={340} alt="The same row of 8 digit cells, now all highlighted in blue and holding 1 2 3 4 0 0 0 0 with no fixed point, plus a small attached dial box reading 'times ten to the n' with an arrow labeled 'the point slides'. Below, two success lines in blue: 4,096,000 equals 4.0960000 times 10 to the 6, and 0.0000012 equals 1.2000000 times 10 to the minus 6, both with check marks. Caption: floating point — same 8 cells, every one significant, the exponent aims the window.">

Floating point: the same eight cells, but *every* cell holds a significant digit, and a separate exponent dial slides the point wherever it's needed.

</Diagram>

</DiagramGroup>

Here is the physical machine to keep in your head for the rest of this lesson: a pocket calculator with an **8-digit display and a tiny exponent dial**. The display is a window that always holds exactly 8 significant digits — never more. The dial can aim that window at the galaxy scale or the atom scale. You can point the window *anywhere*; what you cannot do, ever, is fit a ninth digit into it. Floating point is that calculator, built from bits.

## The IEEE 754 contract: one bit, two fields {/*the-ieee-754-contract*/}

Binary scientific notation normalizes every number to the form:

```
(−1)^sign  ×  1.fffff...₂  ×  2^exponent
```

— one nonzero digit before the point (and in binary, the only nonzero digit *is* 1), the rest of the significant digits after it, times a power of two. The IEEE 754 standard (1985) packs the three ingredients into fixed fields. For a 32-bit **float**:

<Diagram name="floating-point/float32_anatomy" height={340} width={720} alt="A 32-bit layout split into three labeled fields: a single blue box labeled 'sign, 1 bit' holding 0; eight boxes labeled 'exponent, 8 bits, stored with bias +127' holding 01111100; and one long rounded rectangle labeled 'fraction (mantissa), 23 bits, the implicit 1. is not stored' holding 01000000000000000000000. Below, the decoding of the example is written out: sign 0 means positive; exponent bits 01111100 equal 124, minus bias 127 gives 2 to the minus 3; mantissa gives 1.01 in binary; the assembled value line reads plus 1.01 base 2 times 2 to the minus 3 equals 0.00101 base 2 equals 0.15625.">

The three fields of a 32-bit float, decoding the number 0.15625. A 64-bit double is the same anatomy, upgraded: 1 sign, 11 exponent, 52 mantissa bits.

</Diagram>

- **Sign — 1 bit.** 0 positive, 1 negative. Yes: this is **sign-magnitude**, Attempt 1 from last lesson, back from exile exactly as promised — with its twin-zeros baggage in tow (we'll visit them at the end).
- **Exponent — 8 bits, stored with a bias.** The exponent must go negative (small numbers need 2⁻³, 2⁻¹²⁶...), but instead of two's complement, IEEE 754 stores `real exponent + 127`. So 2⁻³ is stored as 124, and 2⁵ as 132. Why a **bias** instead of the beautiful contract we just spent a lesson on? Hold that question — it has a genuinely elegant answer waiting in a DeepDive below.
- **Mantissa (fraction) — 23 bits.** The significant digits after the point. And here hides the standard's slyest trick: in normalized binary the digit before the point is *always* 1 — so why spend a bit storing it? IEEE 754 doesn't. The leading `1.` is an **implicit bit**, assumed by contract, never written. You pay for 23 bits of precision and receive 24. Last lesson a whole design (sign-magnitude) died over one wasted pattern; this standard claws a bit back out of thin air.

**Worked example — encode 0.15625 (the diagram's number):**

```
1. To binary:      0.15625 = 5/32 = 0.00101₂
2. Normalize:      0.00101 = 1.01 × 2⁻³
3. Sign:           positive → 0
4. Exponent:       −3 + 127 = 124 → 01111100
5. Mantissa:       digits after "1." → 01, padded → 01000000000000000000000

0 01111100 01000000000000000000000 ✓
```

**Worked example — encode 5.75:**

```
1. To binary:      5.75 = 101.11₂          (4 + 1 + 1/2 + 1/4)
2. Normalize:      101.11 = 1.0111 × 2²
3. Sign:           0
4. Exponent:       2 + 127 = 129 → 10000001
5. Mantissa:       0111 padded → 01110000000000000000000

0 10000001 01110000000000000000000

Decode back: 1.0111₂ × 2² = 101.11₂ = 5.75 ✓
```

Both numbers encoded *exactly* — because both are sums of powers of two. 0.1 gets no such mercy: its infinite `0011` tail is chopped at the mantissa's edge and the last kept bit is rounded. What's stored is not 0.1. It is the **nearest representable neighbor** of 0.1 — a genuinely different number, wearing 0.1's clothes.

<DeepDive>

#### The war before the standard {/*the-war-before-the-standard*/}

It's easy to assume IEEE 754 was always there, like gravity. It wasn't — and the time before it was chaos. In the 1960s and 70s, *every manufacturer invented its own floating point*: IBM mainframes used base-16 floats (which quietly lost up to 3 bits of precision depending on the number's magnitude), Cray supercomputers had formats that could overflow during a *comparison*, and DEC, Burroughs and the rest each did something different again. The same Fortran program produced different answers on different machines, and numerical analysts maintained mental lists of which computers could be trusted with which formulas.

The turning point came from an unlikely direction: a *microprocessor* company. In 1976, Intel decided its upcoming 8087 math coprocessor should have the best arithmetic ever put in silicon, and hired Berkeley professor **William Kahan** — a man who had spent his career cataloguing how floating-point designs maim calculations — to design it. The draft Kahan's team wrote for Intel became the seed of the IEEE committee's work, and in 1985 it was ratified as IEEE 754. The 8087 shipped in 1980, *before* the standard was even final — silicon implementing a law that didn't exist yet. Within a decade every serious CPU had adopted it, the era of "same program, different answers" ended, and Kahan received the 1989 Turing Award — computing's Nobel — largely for this one standard. When your JavaScript prints `0.30000000000000004`, it prints it *identically* on a phone, a laptop, and a supercomputer. That boring consistency was once the impossible dream.

</DeepDive>

## The autopsy of a famous sum {/*the-autopsy-of-a-famous-sum*/}

You now hold every instrument needed to dissect the most famous line in programming:

```js
0.1 + 0.2
```

<ConsoleBlock level="info">

0.30000000000000004

</ConsoleBlock>

JavaScript numbers are 64-bit doubles — 52 mantissa bits, 53 with the implicit one. Watch what actually happens, step by step:

**Step 1 — storing `0.1`.** The infinite tail `0.000110011...` is cut and rounded to 53 significant bits. The stored value is the nearest double:

```
stored "0.1"  =  0.1000000000000000055511151231257827...
                    └── overshoots by ~5.55 × 10⁻¹⁸
```

**Step 2 — storing `0.2`.** Same tail (0.2 is just 0.1's pattern shifted one position), same surgery:

```
stored "0.2"  =  0.2000000000000000111022302462515654...
                    └── overshoots by ~1.11 × 10⁻¹⁷
```

**Step 3 — adding.** The hardware adds the two stored values flawlessly, then must round the result to the nearest double *again*:

```
true sum of the two stored values ≈ 0.3000000000000000166...
nearest double                    = 0.3000000000000000444089209850062616...
```

**Step 4 — comparing to `0.3`.** But the literal `0.3` in your source code went through its *own* Step 1, and its nearest double sits on the *other side*:

```
stored "0.3"  =  0.2999999999999999888977697537484345...

0.30000000000000004440...  ===  0.29999999999999998889...   →  false
```

Three separate roundings — two at storage, one after the add — and the accumulated dust lands one representable number away from where `0.3` landed. Nobody malfunctioned. The adder was perfect. **Every single value was the legally nearest representable number at every step** — and the answer is still "wrong," because the question ("give me exact tenths") was never askable in binary to begin with. There is a website named `0.30000000000000004.com`, and it is exactly what you think it is.

You can see the mask slip on demand — ask JavaScript for more digits than it normally shows:

```js
(0.1).toFixed(20)
```

<ConsoleBlock level="info">

'0.10000000000000000555'

</ConsoleBlock>

The default display rounds to ~15–17 digits, which usually *re-hides* the error and prints a clean "0.1" — the lie is cosmetic, applied at print time. `0.1 + 0.2` is famous only because its dust happens to survive the cosmetic rounding and reach your screen.

<Note>

The gap between 1 and the next representable double — 2⁻⁵² ≈ 2.22 × 10⁻¹⁶ — is called **machine epsilon**, and it's a named constant in most languages: `Number.EPSILON` in JavaScript, `DBL_EPSILON` in C. Think of it as the grain size of the number line near 1.0: errors smaller than this are literally unrepresentable, and correct float comparisons (coming up in the Pitfall) are built from it.

</Note>

## A ruler with stretching marks {/*a-ruler-with-stretching-marks*/}

Return to the pocket calculator: 8 significant digits, sliding window. Aim it near 1 and it resolves hundred-millionths. Aim it at 400 million and the same 8 digits mean the finest step is now *tens*. The precision didn't disappear — it's **relative**, a fixed count of significant digits, so the *absolute* gap between representable numbers scales with the magnitude. A double is a ruler whose tick marks stretch apart as you slide along it:

<Diagram name="floating-point/number_line_gaps" height={330} width={720} alt="Three horizontal number-line segments stacked vertically, each with tick marks. Top row, labeled 'between 1 and 2': ticks drawn extremely dense, annotated 'gap = 2 to the minus 52 — about 4.5 quintillion steps'. Middle row, labeled 'between 2 to the 52 and 2 to the 53': ticks spaced wide apart, annotated 'gap = exactly 1 — only whole numbers survive'. Bottom row, labeled 'above 2 to the 53': ticks twice as far apart, annotated 'gap = 2 — odd numbers vanish', with one missing tick marked by a red cross labeled 9,007,199,254,740,993. The rows share a caption: same 53 significant bits everywhere — the absolute gap doubles each time the magnitude doubles.">

One ruler, three zoom levels. The mantissa always holds 53 significant bits; each doubling of magnitude doubles the gap between neighboring representable numbers.

</Diagram>

Follow the middle and bottom rows to their alarming conclusion. Between 2⁵² and 2⁵³, the gap between doubles is exactly 1 — the ruler can still land on every integer, with zero room to spare. One doubling later, the gap is 2, and **odd integers above 2⁵³ simply do not exist** in a double. That number — 2⁵³ = 9,007,199,254,740,992 — is the cliff edge, and JavaScript, whose *only* classic number type is the double, names the last safe value `Number.MAX_SAFE_INTEGER` (2⁵³ − 1). Step past the edge and arithmetic goes quietly surreal:

```js
2 ** 53 === 2 ** 53 + 1
```

<ConsoleBlock level="info">

true

</ConsoleBlock>

`9007199254740993` has no double of its own, so it rounds to its even neighbor, and two different integers become `===` equal. No exception, no warning — the wrongness is *silent*, which by now you know is the dangerous kind.

This cliff has a famous real-world scar. Twitter's tweet IDs are 64-bit integers, and by 2010 they had grown past 2⁵³. Every JavaScript client that parsed the API's JSON watched distinct tweet IDs silently collapse onto the same rounded value — replies attached to the wrong tweets, deletions hit neighbors. Twitter's fix is still visible in the API today: alongside the numeric `id`, every object carries an **`id_str`** — the same ID *as a string*, shipped as text precisely so that JavaScript's double never gets to touch it. When a backend teammate sends you 64-bit IDs as strings, this lesson is why; thank them.

The same cliff exists in 32-bit floats, just much closer: 24 significant bits means the first unrepresentable integer is a homely **16,777,217** (2²⁴ + 1) — a number a video game's score counter can reach in an afternoon. Floats have roughly 7 reliable decimal digits; doubles, 15–16. Both run out.

<Pitfall>

**Never compare floats with `===`, and never store money in floats.**

The equality mistake first. After this lesson's autopsy, `if (total === 0.3)` should look like what it is — a bet that three independent rounding events landed on the exact same double. The correct move is to compare against a **tolerance**:

```
if (Math.abs(a − b) < 1e-9)          // absolute epsilon — fine for
                                      // human-scale values
if (Math.abs(a − b) < Number.EPSILON  // relative epsilon — scales
      * Math.max(Math.abs(a), Math.abs(b)))
```

The money mistake is the same physics with legal consequences: `0.1` dollars does not exist in a double, and a billing loop that adds cents as `total += 0.01` is manufacturing dust on every iteration — dust that auditors eventually find. The industry rule is decades old: **money is stored in integers of the smallest unit** (cents, qəpik, satoshi — 1999 cents, not 19.99 dollars), where last lesson's exact integer arithmetic reigns, or in dedicated decimal types (`BigDecimal` in Java, `decimal` in Python and C#, `DECIMAL` in SQL) that compute in base 10 and never meet the repeating tail at all. Floats are for measurements — physics, graphics, ML — where the 16th digit is noise anyway. Money is not a measurement.

</Pitfall>

And because every rule in this course comes with a body attached: in January 1982 the **Vancouver Stock Exchange** launched a shiny new electronic index at 1,000.000 points. The software recomputed the index after every trade — about 2,800 times a day — and each time *truncated* (not even rounded, just chopped) the result to three decimals, shaving off a whisker of value. Twenty-two months of whiskers later, in November 1983, the index read about **524.811** — implying a market crash that had never happened; stocks were flat-to-up. Consultants recomputed the index correctly over a weekend, and on Monday it reopened at **1,098.892**. The market "gained" 574 points overnight because someone finally did the arithmetic right. One truncation is invisible; 2,800 a day for two years is half the stock market. Tiny errors do not stay tiny when you *iterate* them — hold that sentence, because it's the last piece Dhahran needs.

## Dhahran, resolved {/*dhahran-resolved*/}

Now you can read the Patriot failure like an engineer — every ingredient is on the table.

The Patriot's clock counted uptime as an *integer* number of tenths of a second (exact, per last lesson — integers don't drift). To get seconds for the tracking math, it multiplied that count by 0.1... held in a **24-bit fixed-point register**. You know what 24 bits of `0.0001100110011001100110011...` means: the tail is chopped, and the stored constant is

```
stored "0.1" = 0.09999990463256836
error/tick   ≈ 0.000000095 s        (9.5 × 10⁻⁸ — about a tenth
                                     of a microsecond)
```

Per tick, laughable. But the battery had been up ~100 hours — the Army's doctrine assumed frequent relocations and reboots, an assumption the static defense of Dhahran quietly outlived (*limits look unreachable at design time; systems outlive their designers' assumptions* — third lesson in a row):

```
100 hours = 360,000 s = 3,600,000 ticks
3,600,000 × 0.000000095 ≈ 0.34 s of accumulated clock error
```

A Scud arrives at roughly 1,676 m/s. The radar *did* detect it; the software then predicted where the target would be next, using the drifted clock, and aimed its confirmation window — the **range gate** — at that spot. Per the official GAO investigation, the 0.34-second error displaced the gate by about **687 meters**. The gate looked, found empty sky where the Scud "should" be, classified the original detection as a false alarm, and no interceptor launched. The missile fell unopposed onto the barracks.

The epilogue is bitter in exactly the ways this module keeps predicting. Israeli batteries had noticed the drift weeks earlier and reported it; the interim guidance was to **reboot regularly** to zero the clock — the Boeing 787's medicine, 24 years early — without specifying how long was too long. The updated software that fixed the constant arrived in Dhahran on **February 26**: one day late. And note the precise shape of the failure — not an exception, not a crash, but a system running *confidently on silently wrong data*, the exact failure mode your Lesson 3 sensor challenge asked you to fear more than a crash. The Patriot's clock never knew it was lying.

## The edges of the contract {/*the-edges-of-the-contract*/}

Integer contracts fail loudly ugly — the seam, the sign flip. IEEE 754's designers, scarred numerical analysts to a person, instead built *designated crash pads* into the format: the exponent field's two extreme patterns (all zeros, all ones) are reserved not for numbers but for **special values**.

```js
1 / 0
0 / 0
Math.sqrt(-1)
NaN === NaN
```

<ConsoleBlockMulti>

<ConsoleLogLine level="info">

Infinity

</ConsoleLogLine>

<ConsoleLogLine level="info">

NaN

</ConsoleLogLine>

<ConsoleLogLine level="info">

NaN

</ConsoleLogLine>

<ConsoleLogLine level="info">

false

</ConsoleLogLine>

</ConsoleBlockMulti>

- **±Infinity** (exponent all 1s, mantissa zero): the result of overflow or division by zero. Where integer overflow wrapped around and *lied*, float overflow pins to a value that at least admits what happened: larger than anything. Arithmetic continues sanely — `Infinity + 1` is `Infinity`, `1 / Infinity` is `0`.
- **NaN** — *Not a Number* (exponent all 1s, mantissa nonzero): the result of questions with no answer — `0/0`, `√−1`, `Infinity − Infinity`. NaN is deliberately infectious (any arithmetic touching it yields NaN, so it can't be silently laundered back into "real" data) and it is the **only value in the language not equal to itself** — `NaN === NaN` is `false` by standard. That's not a bug; it's the official detection idiom's foundation (`x !== x` means x is NaN; politely, `Number.isNaN(x)`). A NaN surfacing in your dashboard is a float's way of filing a bug report.
- **−0** (sign bit 1, everything else 0): sign-magnitude's twin zero, kept *deliberately* — it preserves the sign of an underflowed negative quantity, which certain numerical methods genuinely need. The treaty and its seams you already saw in last lesson's DeepDive: `0 === -0` is `true`, `Object.is(0, -0)` is `false`, and `1/-0` is `-Infinity` — the tell.
- Exponent all zeros houses zero itself and the **subnormals** — a fringe of extra-tiny numbers (below 2⁻¹²⁶ for floats) where the implicit leading 1 is switched off so the format can degrade *gradually* to zero instead of falling off a cliff. You'll likely never handle one directly; know they exist, and that on some CPUs math involving them runs dramatically slower — a classic mystery-profiling story.

<DeepDive>

#### The bias's secret: floats sort as integers {/*floats-sort-as-integers*/}

Time to pay off the "why a bias instead of two's complement?" debt. Line up the three fields of a positive float — sign 0, then exponent, then mantissa — and notice what the bias did: it made *bigger exponents into bigger unsigned bit patterns* (2⁻³ → 124, 2⁵ → 132), sitting in the most significant bits, with the mantissa as the tiebreaker below. The consequence is lovely: **for positive floats, reinterpreting the 32 bits as a plain unsigned integer and comparing gives the correct float ordering.** Bigger number, bigger bits — the format was laid out so that an ordinary integer comparator, the cheapest circuit last lesson taught you to love, sorts floats correctly with *zero* float-specific hardware.

Had the exponent used two's complement, negative exponents (tiny numbers like 2⁻³) would start with a 1 and *outrank* positive exponents as bit patterns — the ordering would shatter. The bias is two's complement's less elegant cousin, chosen because here the design goal was different: not "make the adder work" but "make the comparator work." Same move as last lesson, different circuit worshipped.

(Negative floats need one extra twist — their sign-magnitude patterns order backwards, so real radix-sort implementations flip some bits first — but the principle stands, and high-performance sorting libraries exploit it to this day.)

</DeepDive>

## Recreate the Patriot clock {/*recreate-the-patriot-clock*/}

The toy below is the Dhahran battery's clock, bit-accurate: an exact integer tick counter (blue thread), multiplied by the actual 24-bit chopped constant `1677721/16777216` the Patriot used (red thread). Advance the uptime and watch the two threads separate — the drift and the range-gate error are computed live. Find the answers to: how wrong was the clock after Israel's reported 8 hours? And at what uptime does the error first exceed a Scud's ~17-meter length?

<Sandpack>

```js
import { useState } from 'react';

const CHOPPED = 1677721 / 16777216; // 0.1 after 24-bit truncation

export default function PatriotClock() {
  const [ticks, setTicks] = useState(0);

  const hours = ticks / 36000;
  const trueTime = ticks * 0.1;
  const clockTime = ticks * CHOPPED;
  const drift = trueTime - clockTime;
  const meters = drift * 1676;

  const row = { fontFamily: 'monospace', fontSize: 18, margin: 4 };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'system-ui' }}>
      <p>Patriot battery uptime: <b>{hours.toFixed(1)} hours</b></p>
      <p style={row}>true time:  {trueTime.toFixed(4)} s</p>
      <p style={{ ...row, color: '#c1554d' }}>
        clock says: {clockTime.toFixed(4)} s
      </p>
      <p style={row}>
        drift: {drift.toFixed(4)} s ≈{' '}
        <span style={{ color: meters > 17 ? '#c1554d' : '#087ea4' }}>
          {meters.toFixed(0)} m
        </span>{' '}
        at Scud speed
      </p>
      <div>
        <button onClick={() => setTicks(ticks + 36000)}>+1 hour</button>{' '}
        <button onClick={() => setTicks(ticks + 360000)}>+10 hours</button>{' '}
        <button onClick={() => setTicks(ticks + 1800000)}>+50 hours</button>{' '}
        <button onClick={() => setTicks(0)}>reboot</button>
      </div>
      {hours >= 100 && (
        <p style={{ color: '#c1554d' }}>
          <b>This is the state the Dhahran battery was in on
          February 25, 1991.</b> The range gate is off by hundreds of
          meters — incoming targets are dismissed as false alarms.
        </p>
      )}
      {hours > 0 && hours < 100 && (
        <p>The drift grows linearly — every tick deposits the same
        0.000000095 s of dust. The reboot button is the 1991 fix.</p>
      )}
    </div>
  );
}
```

</Sandpack>

Notice the shape of the toy: the error is *boring* — perfectly linear, utterly predictable, visible from the first hour if anyone had printed it. That's the signature of accumulation bugs (Patriot, Vancouver): no seam, no cliff, just interest compounding on a debt nobody wrote down.

<Recap>

- Binary fractions are the same add-the-weights game with weights **1/2, 1/4, 1/8...** A fraction terminates in base 2 only if its denominator is a **power of two** — so 0.5 and 0.375 are exact, while **0.1 repeats forever** (`0011` tail) and can *never* be stored exactly.
- **Fixed point** welds the point in place: simple, integer-friendly, but range and precision fight over the same bits — and it's what let the Patriot's 24-bit "0.1" be born.
- **Floating point** is binary scientific notation: **sign × 1.mantissa × 2^exponent**. IEEE 754 (1985, Kahan, the Intel 8087) packs it as 1 + 8 + 23 bits (float) or 1 + 11 + 52 (double), with a **biased exponent** and a free **implicit leading 1**.
- `0.1 + 0.2` fails through three *legal* roundings — store, store, add — landing one representable number away from stored `0.3`. Every step returned the nearest possible value; the question itself was unaskable.
- Precision is **relative**: gaps double as magnitude doubles. Above **2⁵³** doubles skip integers (`Number.MAX_SAFE_INTEGER`, Twitter's `id_str`); floats hit the same wall at 2²⁴ with ~7 reliable digits vs the double's ~15–16.
- Iron rules: compare with a **tolerance**, never `===`; keep **money in integer cents or decimal types** — the Vancouver index lost 48% of its value to 3-decimal truncation, 2,800 shavings a day for 22 months.
- **Dhahran, 1991**: 0.000000095 s of error per tick × 3.6 million ticks = 0.34 s = a range gate 687 m off target and 28 dead. Accumulated error is linear, silent, and was fixable one day too late.
- The contract's edges are civilized on purpose: **Infinity** admits overflow, **NaN** is infectious and unequal even to itself (`x !== x`), **−0** is sign-magnitude's twin zero kept deliberately, and subnormals let the format fade to zero gradually.

</Recap>

<Challenges>

#### Encode by hand {/*encode-by-hand*/}

Encode **0.375** as a 32-bit IEEE 754 float: sign, exponent bits, and the first few mantissa bits. Then confirm the mantissa is finite using this lesson's divisibility rule — *before* you compute a single digit.

<Hint>

0.375 = 3/8. Is the denominator a power of two? That answers the finiteness question instantly. For the digits, run the doubling recipe, then normalize to `1.something × 2^n`.

</Hint>

<Solution>

Divisibility rule first: 0.375 = 3/8, and 8 = 2³ is a pure power of two → the expansion **must terminate**. Now the digits:

```
0.375 × 2 = 0.75  → 0
0.75  × 2 = 1.5   → 1, keep 0.5
0.5   × 2 = 1.0   → 1, done        0.375 = 0.011₂

Normalize:  0.011 = 1.1 × 2⁻²
Sign:       0
Exponent:   −2 + 127 = 125 → 01111101
Mantissa:   1 then zeros  → 10000000000000000000000

0 01111101 10000000000000000000000
```

Check by decoding: 1.1₂ × 2⁻² = 0.11₂ × 2⁻¹ = 0.011₂ = 1/4 + 1/8 = 0.375 ✓

</Solution>

#### Decode the dump {/*decode-the-dump*/}

A memory dump shows a 32-bit float: `0 10000010 01100000000000000000000`. What number is it? Decode all three fields, assemble, and verify by adding weights.

<Solution>

```
Sign:      0 → positive
Exponent:  10000010₂ = 130;  130 − 127 = 3  → × 2³
Mantissa:  011... → implicit 1. in front → 1.011₂

Assemble:  1.011₂ × 2³ = 1011.0₂
Weights:   8 + 2 + 1 = 11
```

The float is **+11.0** ✓ — stored exactly, of course: 11 is an integer well below the 2²⁴ cliff. Notice how the decode ran on *last lesson's* skills end to end: read an unsigned byte (130), add weights (1011 → 11). The exotic-looking format is three old friends in a trench coat.

</Solution>

#### The billing loop {/*the-billing-loop*/}

Transfer task. In code review you meet this (JavaScript) in a subscription-billing service:

```js
let total = 0.0;
for (let i = 0; i < items.length; i++) {
  total += items[i].priceDollars;   // e.g. 19.99, 0.10 ...
}
if (total === expectedTotal) {
  markInvoicePaid();
}
```

Write the review comment: name *both* independent bugs, explain the mechanism behind each in one sentence (this lesson gave you a disaster story for each — use them), and state the standard fix.

<Solution>

**Bug 1 — accumulating currency in doubles.** `19.99` and `0.10` have no exact double representation (denominators aren't powers of two), so every `+=` deposits ~10⁻¹⁷ of dust; over thousands of items and millions of invoices the dust becomes reconcilable money — the Vancouver Stock Exchange lost 48% of its index to exactly this pattern, one truncation at a time, 2,800 times a day.

**Bug 2 — `===` on floats.** Even with tiny drift, `total` and `expectedTotal` arrive via *different* computation paths, so their final roundings need not match — `0.1 + 0.2 === 0.3` is the two-line proof — meaning valid invoices will randomly fail to be marked paid.

Review comment: *"Prices must be integers of the smallest unit — `priceCents: 1999`, summed with exact integer arithmetic (or a decimal type like `BigDecimal`/`DECIMAL` at the boundary); and invoice matching must compare those integers with `===` — which becomes correct the moment the type is right. Floats are for measurements; money is a count, not a measurement."*

Note the pleasing symmetry: last lesson's integer overflow said "widen or clamp before the seam"; this lesson says "don't bring a measuring tape to count coins." Both are the same discipline — **choose the number contract to fit the data**, at design time, not after the audit. ✓

</Solution>

</Challenges>

<LearnMore title="Endianness: The Order of Bytes" path="/learn/faza-0/modul-0-1/endianness">

You can now encode integers, negatives, and fractions into bytes. One question remains, so basic it sounds like a joke: when a number needs *several* bytes, which byte goes **first** in memory? The computing world split into two camps over this — named, with complete sincerity, after the egg-cracking war in *Gulliver's Travels* — and files, networks, and CPUs still take different sides today. Next lesson: the most petty-sounding disagreement in computing, and the very real bugs it ships.

</LearnMore>
