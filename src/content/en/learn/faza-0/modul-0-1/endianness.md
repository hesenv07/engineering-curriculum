---
title: "Endianness: The Order of Bytes"
---

<Intro>

In Jonathan Swift's *Gulliver's Travels* (1726), the empires of Lilliput and Blefuscu wage a generations-long war over a question of doctrine: should a boiled egg be cracked at its **big end** or its **little end**? In the satire, eleven thousand Lilliputians choose death over cracking the wrong end. It was a joke about how humans fight hardest over differences that don't matter — until April 1, 1980, when network engineer **Danny Cohen** published a memo titled *"On Holy Wars and a Plea for Peace,"* pointing out that computer engineers were fighting *exactly this war*, in complete seriousness, over a real question with real casualties: when a number is too big for one byte, **which of its bytes should come first in memory?** Two camps had already shipped incompatible hardware. Cohen named them Big-Endians and Little-Endians, the names stuck forever, and the war ended the way he predicted — not with a winner, but with a border. Your laptop lives on one side of that border, the internet lives on the other, and every day, billions of times per second, numbers cross it. This lesson is about what happens at the crossing — including the time the word `UNIX` crossed it and came back as `NUXI`.

</Intro>

<YouWillLearn>

- What **endianness** actually is — and the one sentence that makes it unambiguous forever
- **Big-endian** vs **little-endian**: how the same 4 bytes read as two different numbers, worked to the last digit
- Who sits in which camp: your CPU, the internet, and the file formats that carry a passport
- Why endianness is invisible for years and then bites *only at boundaries* — networks, files, and the NUXI problem
- The surprisingly good reason little-endian won the CPU (and the good reason big-endian won the wire)
- The two classic false beliefs — reversed bits and swapped strings — and how to never confuse byte order again

</YouWillLearn>

## One number, four boxes {/*one-number-four-boxes*/}

Recall the picture of memory this module has been building: RAM is a colossal street of numbered mailboxes, one **byte** per box, and the hex value like `0x7ffee4b2c8d0` you met in Lesson 2 is a postal address of a single box. Crucially, the byte is the *smallest unit that has an address*. You cannot address half a box.

Now a plain, innocent task. Your program stores the 32-bit number `0x12345678` — four bytes: `12`, `34`, `56`, `78` — and the memory allocator hands you four consecutive mailboxes, addresses 1000 through 1003. Which byte goes into box 1000?

Take a moment to feel how *undecidable* this is. Nothing in mathematics answers it. Nothing in physics answers it. The number is one indivisible value; the boxes are a physical row; some contract must map one onto the other, and there are two self-consistent ways to write it:

<DiagramGroup>

<Diagram name="endianness/be_memory" height={300} width={340} alt="Four memory cells in a row at addresses 1000, 1001, 1002, 1003 holding the bytes 12, 34, 56, 78 of the value 0x12345678. The first cell, 12, is highlighted in blue and labeled 'MSB first'. A note underneath reads: stored in the same order the hex is written — the big end leads.">

**Big-endian:** the most significant byte takes the lowest address. Memory reads exactly like the written number: `12 34 56 78`.

</Diagram>

<Diagram name="endianness/le_memory" height={300} width={340} alt="The same four memory cells at addresses 1000 to 1003, now holding 78, 56, 34, 12. The last cell, 12, is highlighted in blue and labeled 'MSB last'. A note underneath reads: the little end leads — address 1000 holds the number's smallest part.">

**Little-endian:** the *least* significant byte takes the lowest address. Memory holds the number back-to-front: `78 56 34 12`.

</Diagram>

</DiagramGroup>

This choice — the order of a multi-byte value's bytes in memory — is called **endianness**, and here is the one sentence that resolves every confusion you will ever have about it, worth memorizing verbatim: **endianness is the answer to "which byte gets the lowest address," and nothing else.** Not bit order. Not the order of characters in a string. Only: of a multi-byte *number's* bytes, which one lives at the smallest address.

Both contracts store the number perfectly. Both retrieve it perfectly. A machine that writes little-endian and reads little-endian will run for twenty years without anyone noticing the bytes are "backwards" — remember Lesson 1: **bytes have no meaning; contracts do**, and inside one machine the contract is consistent. The catastrophe requires two parties. Watch what happens when a big-endian reader opens little-endian mail:

```
Written (little-endian) at 1000..1003:   78 56 34 12

Read back assuming big-endian:
  0x78563412
  = 0x78×2²⁴ + 0x56×2¹⁶ + 0x34×2⁸ + 0x12
  = 120×16,777,216 + 86×65,536 + 52×256 + 18
  = 2,013,265,920 + 5,636,096 + 13,312 + 18
  = 2,018,915,346  ✗

Intended value:
  0x12345678 = 305,419,896  ✓
```

Same four bytes, byte-for-byte identical, not a single bit corrupted — and the two contracts extract numbers that differ by a factor of ~6.6. No error is raised, because *there is no error to raise*: each side followed its own contract flawlessly. By now you know this genre — it's the Patriot genre, the sensor-offset genre: **silently wrong data**, the failure mode this module keeps teaching you to fear above crashes.

## The two camps {/*the-two-camps*/}

So who chose what? The border Cohen predicted runs, roughly, between *processors* and *everything that travels between them*.

**Team Little-Endian — the CPUs.** Intel put little-endian into its earliest microprocessors, x86 inherited it, and x86 conquered the desktop and the server. ARM is technically **bi-endian** (it can run either way) but in practice — every Android phone, every iPhone, every Apple Silicon Mac — it runs little-endian. RISC-V: little-endian. The overwhelming majority of silicon manufactured today, including the machine you're reading this on, stores its little end first. There is an excellent engineering reason, and it gets its own DeepDive below.

**Team Big-Endian — the wire and the archives.** IBM's System/360 (1964 — the machine that gave you the 8-bit byte in Lesson 1) was big-endian, and so were Motorola's 68000 and Sun's SPARC. But the camp's decisive territory is the **network**: when the internet's core protocols were written down, they declared that all multi-byte numbers in packet headers — ports, addresses, lengths — travel most-significant-byte first. To this day the official synonym for big-endian is **network byte order**. Many file formats followed: PNG and JPEG store their internal integers big-endian; and Java — designed in the 90s for a networked world — made its `.class` files and its default I/O big-endian regardless of what CPU it runs on.

And a few formats did something delightfully honest: **TIFF** image files begin with a two-byte passport — `II` (little-endian, "Intel") or `MM` (big-endian, "Motorola") — the file *declares its endianness* in its first two bytes, and every reader adapts. Meanwhile GIF, BMP, and ZIP ship little-endian, because they were born on PCs. Every binary format's spec, somewhere in its first page, answers the egg question; the ones that forget to become interoperability folklore.

Your own machine will confess its allegiance if asked:

<TerminalBlock>

lscpu | grep 'Byte Order'
Byte Order:                         Little Endian

</TerminalBlock>

And JavaScript can catch the CPU in the act. A typed array view (the tool from Lesson 3's `Int8Array` trick) lets you write a 32-bit number into memory and then inspect its raw first byte:

```js
new Uint8Array(new Uint32Array([0x12345678]).buffer)[0].toString(16)
```

<ConsoleBlock level="info">

'78'

</ConsoleBlock>

Address zero of that buffer holds `78` — the little end. On the handful of big-endian machines still running JavaScript, the same line returns `'12'`. This is one of vanishingly few ways endianness is even *visible* from a high-level language, and that's by design: as long as you stay inside one machine and speak in *values* rather than raw bytes, the contract is somebody else's problem. Which brings us to where it stops being somebody else's problem.

## Where it bites: boundaries {/*where-it-bites-boundaries*/}

Endianness has a peculiar safety profile: it is *perfectly harmless* right up until data crosses a **machine boundary** — a network socket, a binary file, a memory-mapped device, a cast from one type's viewpoint to another's. At the boundary, the writer's contract and the reader's contract meet for the first time, and if nobody wrote down which contract the *bytes in transit* obey, you get the oldest war story in Unix folklore.

In the late 1970s — so the story is preserved in the Jargon File, the hacker culture's chronicle — Unix was being ported from the PDP-11 to a new machine. The two machines packed bytes into 16-bit words in opposite orders. Somewhere in the boot messages, the four bytes of the word `UNIX`, having crossed between the two conventions packed as two 16-bit values, got each word's bytes swapped — and the system proudly printed:

<Diagram name="endianness/nuxi_problem" height={320} width={720} alt="Top row: the four ASCII bytes of UNIX shown as two 16-bit word boxes, U N in the first word and I X in the second, with hex values 55 4E and 49 58, labeled 'packed as two 16-bit words on the source machine'. Two downward arrows labeled 'each word's bytes swap when the convention flips'. Bottom row: the same two word boxes now holding N U and X I, with hex 4E 55 and 58 49, highlighted in red, and the resulting printed text NUXI, labeled 'the same bytes, read under the other contract'.">

Four correct bytes, two flipped word-contracts: the banner reads `NUXI`. The bug is so canonical that "the NUXI problem" became a general name for byte-order failures.

</Diagram>

Not one byte was lost or damaged. `U`, `N`, `I`, `X` — hex `55 4E 49 58`, straight from Lesson 2's text contract — all arrived. Only the *positions* lied. And notice the tell that distinguishes an endianness bug from ordinary corruption at a glance: **the garbage is made of your own data, rearranged in neat, regular chunks.** Random corruption looks like noise; byte-order bugs look like anagrams.

The boundary that bites most often in working life, though, is the network. Your little-endian laptop wants to tell a server "connect me to port **8080**." As a 16-bit number, 8080 is `0x1F90`, which your RAM holds little-end-first as `90 1F`. But the wire's contract is network byte order — big-endian. Someone has to swap, *explicitly*, at the boundary:

<Diagram name="endianness/network_byte_swap" height={360} width={720} alt="Two horizontal lanes. Top lane, labeled 'with htons()': a laptop box marked little-endian holding memory bytes 90 1F, an arrow labeled htons() leading to two wire bytes 1F 90 marked 'network byte order', then an arrow to a receiver box that reads port 8080 with a blue check mark. Bottom lane, labeled 'raw memory copy': the same laptop bytes 90 1F go onto the wire unchanged as 90 1F, and the receiver, applying the big-endian wire contract, reads port 36895 with a red cross, annotated 'no error raised — just the wrong port'.">

One boundary, two outcomes. The swap is not optional politeness; it is the treaty that lets both camps keep their own memory order and still talk.

</Diagram>

The check, by hand — pure Lesson 2 hex skills:

```
Intended port:  8080 = 0x1F90
  0x1F90 = 1×4096 + 15×256 + 9×16 + 0 = 8080 ✓

Wire carries the raw little-endian bytes: 90 1F
Receiver applies the wire's big-endian contract:
  0x901F = 9×4096 + 0×256 + 1×16 + 15
         = 36,864 + 16 + 15
         = 36,895 ✗
```

The connection quietly goes to port 36895 — probably nothing is listening there, and you get a `connection refused` that no amount of staring at the *values* in your code will explain, because the values were always right. This is why every socket API on Earth ships the translation quartet — `htons`, `htonl`, `ntohs`, `ntohl` (*host-to-network-short*, *host-to-network-long*, and back) — and why their documentation politely never mentions that on big-endian hosts they compile to nothing at all. The functions aren't math; they're **border control**.

One more boundary crossing, and it's one you've already made. In Lesson 1, the two bytes `48 69` read as text spelled `Hi`, and read as a single 16-bit number made **18,537**. Now run that connection in reverse on your actual laptop: store the *number* 18,537 (`0x4869`) on a little-endian machine, and memory holds `69 48`. Dump those bytes through the text contract and they spell... `iH`. Text and numbers really are the same bytes under different contracts — but only the *number* contract has an endianness. Which sets up the trap this lesson must now disarm.

<Pitfall>

**The two false beliefs that create most endianness bugs.**

*False belief 1: "little-endian reverses the bits."* No. The byte is the atom of addressing — it travels as a sealed unit, its 8 bits in fixed order, MSB to LSB exactly as Lesson 2 taught. `0x12345678` little-endian is `78 56 34 12` — the byte `0x12` is still the bit pattern `00010010`, untouched. Endianness permutes *boxes*, never the contents of a box. If you catch yourself reversing a binary string character-by-character, stop: you've left engineering and entered origami.

*False belief 2: "strings get swapped too."* No. A string under the ASCII contract is a *sequence of independent 1-byte values*, and a 1-byte value has nothing to reorder — `"Hi"` is `48 69` on every machine ever built. Endianness applies only to a **multi-byte numeric unit** (a 16/32/64-bit integer, a float's 4 or 8 bytes). The `NUXI` story doesn't contradict this: the bytes got swapped precisely because they were being handled *as 16-bit numbers*, not as characters. The question to ask is never "is this data text or binary?" but "**what is the unit, and is the unit wider than one byte?**" One-byte units: immune. Wider units: pick a side, write it down.

</Pitfall>

<DeepDive>

#### Why little-endian won the CPU {/*why-little-endian-won-the-cpu*/}

Little-endian looks perverse — it prints "backwards" in every hex dump — so it's worth knowing it won the silicon war on genuine merit, not accident.

**Reason 1: arithmetic starts at the little end.** Recall the odometer: addition begins at the least significant digit, because that's where the carry is born and carries only ever ripple *leftward*. The first microprocessors were 8-bit machines that had to add 16-bit numbers one byte at a time — and a little-endian CPU could fetch the byte at the *lowest* address and start adding immediately, already computing the low byte's sum (and its carry) while the high byte was still being fetched. Big-endian machines had to reach the *end* of the number before the arithmetic could begin. When your entire chip runs at a few hundred kilohertz, starting one byte early is real money.

**Reason 2: an address means one thing at every width.** On a little-endian machine, the address of a number is the address of its *smallest part* — so the same address 1000 holding `0x00000042` reads as 66 whether you read 1 byte, 2 bytes, 4, or 8. The value's low byte doesn't move when the type widens; a pointer reinterpreted at a narrower width still points at the arithmetically-correct piece. On big-endian, every change of width changes which address holds the low byte. Compilers, allocators, and low-level code get measurably simpler under the little-endian rule; it's the pointer-caster's dream.

**And yet big-endian won the wire, also on merit:** a human reading a packet dump sees numbers in writing order; routers comparing addresses can short-circuit on the first differing byte (comparison, unlike addition, starts at the *big* end — the same reason Lesson 4's biased floats sort as integers). Cohen's 1980 plea made exactly this point: both orders are defensible, neither is worth a war, and the only fatal choice is *not choosing*. The internet chose big; Intel had already shipped little; the treaty is a pair of swap functions at every socket. Eleven thousand Lilliputians died for less.

</DeepDive>

<DeepDive>

#### Middle-endian: the third egg {/*middle-endian-the-third-egg*/}

Naturally, computing also produced compromise conventions that combine the disadvantages of both. The PDP-11 — the very machine of the NUXI story — stored 32-bit values as two little-endian 16-bit words placed in *big-endian* word order: byte sequence `2 3 0 1`, an arrangement remembered, with affection and horror, as **middle-endian** or "PDP-endian."

Before you laugh at 1970s hardware, check your calendar. The date format `MM/DD/YYYY` is middle-endian (medium unit first, then small, then big); `DD/MM/YYYY` is little-endian; and ISO 8601's `YYYY-MM-DD` is big-endian — which is precisely why it's the only one whose dates **sort correctly as plain strings**, the same trick the biased float exponent pulled last lesson: put the most significant part first, and dumb lexicographic comparison becomes correct numeric comparison for free. Humanity has been fighting the endianness war on its envelopes and forms for centuries; computing merely joined the oldest holy war there is. File your logs in ISO 8601 and be on the right side of history.

</DeepDive>

## The byte-order lab {/*the-byte-order-lab*/}

Time to cross the boundary yourself. Below are four mailboxes of RAM, addresses 1000–1003. Pick a value, choose the **write** contract, choose the **read** contract, and watch both the bytes and the text-contract rendering of each byte (the `iH` effect, live). The mismatched combinations reproduce, exactly, every number from this lesson: find `2,018,915,346`, find port `36,895`, and find `iH`:

<Sandpack>

```js
import { useState } from 'react';

const PRESETS = [
  { label: '0x12345678', v: 0x12345678 },
  { label: '18537 ("Hi")', v: 18537 },
  { label: '8080 (a port)', v: 8080 },
];

export default function ByteOrderLab() {
  const [value, setValue] = useState(0x12345678);
  const [writeBig, setWriteBig] = useState(false);
  const [readBig, setReadBig] = useState(false);

  const be = [3, 2, 1, 0].map((i) => (value >>> (i * 8)) & 255);
  const mem = writeBig ? be : [...be].reverse();
  const seen = readBig ? mem : [...mem].reverse();
  const readBack = seen.reduce((n, b) => n * 256 + b, 0);
  const ok = readBack === value;

  const hex = (b) => b.toString(16).toUpperCase().padStart(2, '0');
  const chr = (b) => (b >= 33 && b < 127 ? String.fromCharCode(b) : '·');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <div>
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setValue(p.v)}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ margin: 8 }}>
        {mem.map((b, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 64, margin: 2,
            border: '1px solid #888', borderRadius: 8, padding: 4
          }}>
            <div style={{ fontSize: 11, color: '#888' }}>{1000 + i}</div>
            <div style={{ fontSize: 20 }}>{hex(b)}</div>
            <div style={{ fontSize: 13, color: '#087ea4' }}>{chr(b)}</div>
          </span>
        ))}
      </div>
      <div style={{ fontFamily: 'system-ui' }}>
        <button onClick={() => setWriteBig(!writeBig)}>
          write: {writeBig ? 'big' : 'little'}-endian
        </button>{' '}
        <button onClick={() => setReadBig(!readBig)}>
          read: {readBig ? 'big' : 'little'}-endian
        </button>
      </div>
      <h2 style={{ color: ok ? '#087ea4' : '#c1554d' }}>
        read back: {readBack.toLocaleString()}
      </h2>
      <p style={{ fontFamily: 'system-ui' }}>
        {ok
          ? 'Contracts match — endianness is invisible.'
          : 'Contracts differ at the boundary: same bytes, wrong number.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Note what the toy proves by exhaustion: with *matching* contracts — either pair — everything works. The bug lives in exactly two of the four combinations, and both of them are boundaries.

<Recap>

- **Endianness** answers exactly one question: *which byte of a multi-byte number gets the lowest address.* **Big-endian**: the most significant byte first, memory reads like written hex. **Little-endian**: the least significant byte first.
- Both contracts are correct and self-consistent; within one machine endianness is **invisible**. Bugs live only at **boundaries** — networks, binary files, casts — where a writer's contract meets a different reader's contract: `0x12345678` becomes `2,018,915,346`, port 8080 becomes 36,895, `UNIX` becomes `NUXI`.
- Byte-order failures produce **silently wrong data** in neat rearranged chunks — anagrams, not noise — and no exception, because both sides followed their own contract perfectly.
- The camps: little-endian owns the CPUs (x86, ARM-in-practice, RISC-V), because **addition starts at the little end** and an address means the same thing at every width. Big-endian owns the wire (**network byte order**) and formats like PNG, JPEG, and Java class files, because **comparison and humans start at the big end**. TIFF carries a passport: `II` or `MM`.
- The treaty at the network boundary is explicit swapping: **`htons` / `htonl` / `ntohs` / `ntohl`** — border control, not math.
- Endianness reorders **whole bytes only**: never the bits inside a byte, and never the characters of a one-byte-per-unit string. The question is always: *what is the unit, and is it wider than one byte?*
- Danny Cohen, April 1, 1980: either order works; **not agreeing** is the only fatal option. Write the byte order into every binary format and protocol you design — page one.

</Recap>

<Challenges>

#### The magic number's two faces {/*the-magic-numbers-two-faces*/}

Lesson 2 introduced `CAFEBABE`, the 4-byte magic number opening every Java `.class` file. Java class files are big-endian by specification. In what order do those four bytes sit **in the file**? And after a little-endian x86 JVM reads that magic into a 32-bit register as the *value* `0xCAFEBABE`, what byte order would a debugger show **in the register's memory**?

<Hint>

The file is a *byte sequence* — it has one physical order, fixed by the spec. RAM holding a *32-bit value* obeys the CPU's contract. Treat the two locations separately.

</Hint>

<Solution>

**In the file:** big-endian by spec, most significant byte first — physically `CA FE BA BE`, exactly in writing order. Any tool from Lesson 1 (`xxd`) shows those bytes at offsets 0–3 on *any* machine, because a file is just a byte sequence; it has no CPU.

**In x86 memory:** the moment those bytes become the 32-bit *value* `0xCAFEBABE`, the little-endian contract applies, and the four mailboxes hold `BE BA FE CA` — lowest address gets the little end.

The general lesson: "what order are the bytes in?" has no answer until you specify *where* — in a file/wire (fixed by the format's spec) or in RAM as a typed value (fixed by the CPU). The JVM's file-parsing code performs the conversion at the boundary, exactly one `ntohl`-shaped swap, and neither world ever notices the other's order.

</Solution>

#### Read the dump like a local {/*read-the-dump-like-a-local*/}

Debugging on your x86 laptop, you dump a 32-bit `int` and see the bytes `D2 04 00 00`. What is the value in decimal? And explain, in one sentence, why small numbers on little-endian machines always show their zeros **on the right** of a dump.

<Solution>

Little-endian: lowest address holds the little end, so the value's bytes in significance order are the dump *reversed*: `00 00 04 D2` → `0x000004D2`.

```
0x4D2 = 4×256 + 13×16 + 2
      = 1024 + 208 + 2
      = 1234 ✓
```

The value is **1234**. And the zeros: a small value's *high* bytes are zero, and little-endian puts high bytes at high addresses — the right side of a dump. That's a genuinely useful field skill: on x86, a run of `XX 00 00 00` almost always reads as "a small int lives here," while `00 00 00 XX` smells like big-endian data (a network capture, a Java-written file) that hasn't been swapped. Experienced engineers diagnose byte-order bugs from this pattern alone, before doing any arithmetic.

</Solution>

#### The length prefix from hell {/*the-length-prefix-from-hell*/}

Transfer task. A teammate's C service on x86 sends binary messages as "a 4-byte length, then the payload," writing the length with a raw `fwrite(&len, 4, 1, ...)`. A partner team's reader — running on a big-endian device (or written in Java, whose `DataInputStream` is big-endian by contract) — receives a message of length **1024** and immediately tries to allocate a wildly wrong buffer, then desyncs and reads garbage forever. Do the byte math showing exactly what length the reader computed, then write the two-sentence review comment.

<Solution>

1024 = `0x00000400`. The x86 writer's `fwrite` copies its little-endian RAM straight onto the wire:

```
wire bytes:            00 04 00 00
reader (big-endian):   0x00040000
                     = 4 × 65,536
                     = 262,144  ✗   (256 KiB, not 1 KiB)
```

The reader allocates a 256 KiB buffer for a 1 KiB message, waits for 262,144 bytes that will never come (or swallows the next ~255 messages as "payload"), and the framing never recovers — one unswapped integer poisons the entire stream. Note the anagram signature: `00 04 00 00` vs `00 00 04 00` — the reader's own data, rearranged.

Review comment: *"Never `fwrite`/`memcpy` multi-byte integers across a machine boundary — the wire must have one declared byte order regardless of host. Please serialize the length explicitly (`htonl(len)` before writing, `ntohl` after reading, or byte-by-byte shifts), and add the byte order to the protocol doc's page one — the format currently only works between two little-endian hosts by accident."*

The deeper habit, third lesson running: contracts must be chosen *at design time* and written down. Ranges (Lesson 3), representability (Lesson 4), byte order (today) — in all three, the bytes were never wrong; the unwritten assumption was. ✓

</Solution>

</Challenges>

<LearnMore title="Text: From ASCII to UTF-8" path="/learn/faza-0/modul-0-1/text-representation">

Since Lesson 1, "the text contract" has quietly meant one specific table that maps 72 to `H`. Next lesson that table finally gets its own story — and it's a war story too: how 7 bits of American English tried to hold every human language, why your emails once arrived as `Ã©` and `Ð¿Ñ€Ð¸Ð²ÐµÑ‚`, and how UTF-8 pulled off one of the great backward-compatible designs in engineering history. Endianness even makes a cameo: the first "character" of many text files is nothing but a byte-order mark.

</LearnMore>
