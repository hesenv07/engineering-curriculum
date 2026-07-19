---
title: "Data Integrity: Parity, Checksums, CRC"
---

<Intro>

On May 18, 2003, in the Brussels municipality of Schaerbeek, an electronic voting machine quietly awarded a local candidate named Maria Vindevoghel **4,096 extra votes**. The error was caught only because her total exceeded the number of people who could possibly have voted for her; the recount confirmed the machine had invented the votes from nothing. The official investigation found no bug, no fraud, no malfunction that could be reproduced — and settled on the only explanation that fit the evidence with eerie precision: a single bit, bit 13 of a vote counter, had spontaneously flipped from 0 to 1. You know what bit 13 is worth: **2¹² = 4,096** — the number wasn't random, it was a power of two wearing a disguise, the unmistakable fingerprint of one transistor's moment of weakness, quite possibly caused by a cosmic ray that had traveled across the galaxy to end its journey in a Belgian ballot counter. Seven lessons have taught you to encode the world into bits. This lesson faces the uncomfortable truth those lessons postponed: **bits flip**. Memory forgets, cables whisper noise, discs scratch — and an entire branch of mathematics exists so that when the universe edits your data, you find out. Some of it can even edit the data *back*.

</Intro>

<YouWillLearn>

- Why bits flip in the physical world — cosmic rays, noise, decay — and why at scale "one in a billion" means *daily*
- **Parity**: the one-bit guard, exactly what it catches, and the two-flip blind spot that defines its limits
- **Checksums**: from naive byte-summing (and the reordering bug that fools it) to the Internet checksum inside every IP packet
- **CRC**: the remainder trick behind ZIP, PNG, and Ethernet — computed fully by hand, long division and all
- **Error correction**: Hamming's furious weekend, the code where failing checks *spell out* the broken bit's address, and Reed–Solomon healing scratched CDs and defaced QR codes
- The professional judgment layer: detect vs correct, accident vs adversary, and where in a pipeline verification actually belongs

</YouWillLearn>

## The enemy: flipped bits {/*the-enemy-flipped-bits*/}

Lesson 1 made a simplifying promise that has silently underwritten everything since: a bit, once written, *stays* written. Physics does not actually sign that contract. A DRAM cell is a microscopic capacitor holding a few tens of thousands of electrons; a high-energy particle — a cosmic-ray secondary from the upper atmosphere, an alpha particle from trace radioactive atoms in the chip's own packaging — can dump or drain enough charge to flip it. Voltage spikes flip bits on wires. Magnetization fades on old drives; charge leaks from aging flash cells (the industry's term, **bit rot**, is not a metaphor); a fingerprint on a CD blots out thousands of bits at once.

Any *single* flip is fantastically rare. But you have spent seven lessons learning what computers do to rare events: they multiply them by astronomical counts. A landmark 2009 Google study of its own fleet found that roughly **8% of memory modules logged at least one error per year** — in a data center, cosmic rays are not an anecdote, they're a *rate*. At home the same math holds with smaller numbers: gigabytes of RAM × months of uptime means your machine has almost certainly experienced flips; you just rarely catch one red-handed in the act of mattering.

Schaerbeek is precious precisely because it *was* caught — and notice *how*. The corruption announced itself through arithmetic: the count jumped by exactly 2¹². Corruption by bit flip always carries this signature — a value off by a clean power of two — the same way Lesson 5's byte-order bugs announced themselves as anagrams. Learn the fingerprints; they narrow a debugging session from days to minutes. But fingerprints only help *after* you suspect. The Belgian machine had no way to suspect: it held one copy of each counter and believed it absolutely. The deep fix is not better hardware — you cannot armor-plate every capacitor against the galaxy. The fix is a change of philosophy: **stop trusting stored data to stay stored, and make the data carry evidence about itself.** Every mechanism in this lesson is that one idea — **redundancy**: extra bits, *computed from* the payload bits, traveling with them, so a receiver (or the future) can recompute and compare. The mechanisms differ only in how much evidence they carry and how much it proves.

## Parity: the one-bit guard {/*parity-the-one-bit-guard*/}

Start with the cheapest possible evidence: **one extra bit**. The **even parity** contract: count the 1s in your data; append a bit chosen to make the total count *even*. That's the whole scheme.

```
'H' = 01001000        ones: 2 (even)   → parity bit 0
'i' = 01101001        ones: 4 (even)   → parity bit 0
'C' = 01000011        ones: 3 (odd)    → parity bit 1

stored 'C':  01000011 1      ← 9 bits now travel together
```

The receiver recounts. Nine bits with an odd number of 1s = **alarm**: something flipped. And the guarantee is airtight for its size: *any* single-bit flip — in the data *or in the parity bit itself* — changes the count's evenness, so a lone flip can never slip through. For one bit of overhead, that is a remarkable purchase, and the industry bought it in bulk: classic serial links carried a parity bit per character, and for decades "real" computers shipped RAM with **nine** chips per byte-wide module — eight for you, one standing guard.

But watch the guard's two blind spots, because they define everything that comes after:

<DiagramGroup>

<Diagram name="checksum-crc/parity_catch" height={320} width={340} alt="A row of eight bit cells 01000011 plus a ninth separated parity cell holding 1, labeled 'even parity: total count of ones is even (4)'. Below, the same row with one data bit flipped, drawn in red: 01001011, parity still 1, and a counter noting five ones — odd. A red alarm label reads 'recount is odd: flip detected'.">

One flip breaks the evenness — always. The parity bit cannot say *which* bit lied, only *that* one did.

</Diagram>

<Diagram name="checksum-crc/parity_blind" height={320} width={340} alt="The same nine cells with two data bits flipped, both drawn in red: the count of ones goes from four to four again. A muted label reads 'recount is even: silence'. A caption warns: two flips cancel — the guard sees nothing.">

Two flips restore the evenness — always. Parity is blind to every even-numbered disaster, and it can *detect* but never *locate* or *repair*.

</Diagram>

</DiagramGroup>

So: parity **detects any odd number of flips, misses any even number, locates nothing, fixes nothing**. It's a tripwire, not a witness. To do better, the evidence must get richer — and the obvious next idea is to stop counting bits and start *summing bytes*.

## Checksums: summing the evidence {/*checksums-summing-the-evidence*/}

A **checksum** in its simplest form: add up all the bytes (letting the sum wrap in a fixed width — Lesson 2's odometer, employed honestly for once) and send the total along.

```
"Hi"  =  0x48 + 0x69  =  0xB1        ← 1 byte of evidence
```

Now a flip almost anywhere changes the sum, *and* the sum's width buys resolution: a single wrong byte changes an 8-bit checksum unless the error is an exact multiple of 256. Much stronger than one parity bit. This family is everywhere the stakes are moderate: the **Internet checksum** guarding every IP, TCP, and UDP header is a 16-bit sum — computed, delightfully, in **one's complement arithmetic with the end-around carry**, the very mechanism Lesson 3 sent into exile and promised you'd meet again in packet headers. Here it is, processing every packet you'll ever send. (It was chosen for a very 1970s reason: a one's complement sum can be computed byte-order-independently — a small peace treaty in Lesson 5's war.)

But summation has a structural flaw, and you can name it from algebra class: **addition commutes**. The sum doesn't care about *order*:

```
"Hi"  =  0x48 + 0x69  =  0xB1
"iH"  =  0x69 + 0x48  =  0xB1        ← identical evidence!
```

The exact corruption Lesson 5 taught you to fear — your own bytes, intact but *rearranged*, the NUXI anagram, the unswapped length prefix — sails through an additive checksum untouched. So do pairs of errors that cancel (+1 here, −1 there). A checksum that can't see the difference between `Hi` and `iH` is a guard who checks that all the furniture is present but not whether the house has been ransacked.

<Note>

The most famous fix for the ordering problem is in your wallet. The **Luhn algorithm** (Hans Peter Luhn, IBM, patented 1954) computes the last digit of every credit-card number — and before adding, it *doubles every second digit* (folding two-digit results back down). That positional weighting is precisely the anti-commutativity patch: transpose two adjacent digits — the most common human typo — and the doubled/undoubled roles swap, changing the total. Every card form that instantly says "invalid number" before contacting any bank is running this 70-year-old checksum in your browser. You'll run it by hand in the challenges.

</Note>

Positional weighting patches the flaw. But the *definitive* solution came from asking a stranger question: what if, instead of adding the message's bytes, we treated the entire message as **one gigantic binary number** — and kept only its *remainder*?

## CRC: the remainder trick {/*crc-the-remainder-trick*/}

Here is this lesson's physical machine, and it predates computers by centuries. Bookkeepers copying long columns of figures used a trick called **casting out nines**: compute a big number's remainder mod 9 (shortcut: sum its digits, repeatedly). Copy the number, compute the remainder again — if the remainders disagree, you miscopied. The remainder is a tiny, fixed-size *fingerprint* of an arbitrarily large number, and almost any smudge changes it. One number — 7,354,682, say — carries its own one-digit witness (7+3+5+4+6+8+2 → 35 → 8). Ledgers policed themselves this way for five hundred years.

A **CRC** — *cyclic redundancy check* — is casting out nines rebuilt for hardware: the message becomes one huge binary number, and the fingerprint is its remainder after division by an agreed constant, the **generator**. Two engineering upgrades make it sing. First, the division is done in Lesson 2's favorite degenerate arithmetic — binary *without carries*, where subtraction and addition both collapse into **XOR** — so the "long division" is just shift-and-XOR, essentially free in silicon. Second, and crucially: the generator isn't arbitrary. Generators are *chosen*, with real mathematics, so that the error patterns that actually happen in the field — single flips, double flips, and above all **bursts** (a scratch, a static crackle: many consecutive bad bits) — are guaranteed to change the remainder.

Let's do one completely, by hand, with a toy 4-bit generator `1011` (a real CRC-3). Message: `1101`. Rule: append three 0s (one less than the generator's length — making room for the fingerprint), then divide by XOR:

<Diagram name="checksum-crc/crc_division" height={400} width={720} alt="A schoolbook-style long division worked in binary XOR. Dividend 1101000 at top, generator 1011 shown at left. Four subtraction steps follow, each aligning 1011 under the current leading 1 and XORing: 1101000 xor 1011 gives 0110000; then 110000 xor 1011 shifted gives 011100; then 11100 xor 1011 shifted gives 01010; then 1010 xor 1011 gives 0001. The surviving 3-bit remainder 001 is boxed in blue at the bottom, labeled 'the CRC'. A side note states: subtraction with no borrows is just XOR.">

Long division where subtracting never borrows: align the generator under the leading 1, XOR, repeat. Whatever survives shorter than the generator is the remainder — the CRC.

</Diagram>

```
Message 1101, generator 1011 → append 000:

  1101000
⊕ 1011          align under the leading 1, XOR
  -------
   110000       (leading zeros drop away)
⊕  1011
   ------
    11100
⊕   1011
    -----
     1010
⊕    1011
     ----
      001       ← remainder: CRC = 001

Transmit: 1101 001
```

The receiver's move is beautiful: divide the *whole* received string — message and CRC together — by the same generator. By construction the appended remainder cancels the message's own, so an intact transmission leaves remainder **zero**:

```
Received intact:   1101001 ÷ 1011  →  remainder 000   ✓ clean

Received damaged   1111001 ÷ 1011  →  remainder 110   ✗ ALARM
(one bit flipped)
```

(Don't take the damaged case on faith — dividing it yourself is the challenge section's warm-up, and the remainder really is `110`.) Scale the toy up and you have the exact machinery inside the infrastructure: **CRC-32** — a 33-bit generator, a 4-byte fingerprint — seals **every Ethernet frame** (bad frame → silently dropped → TCP retransmits; you've "seen" this thousands of times as nothing at all, which is the point), **every PNG chunk** (in big-endian, of course), **every file in every ZIP**, every gzip stream. Its chosen-generator guarantees: *all* single-bit errors, *all* burst errors up to 32 bits long, and all but a 2⁻³² sliver — about **1 in 4.3 billion** — of arbitrary random garbage. And unlike the additive sum, division is savagely order-sensitive. Watch a real CRC-32 judge the case addition couldn't:

<TerminalBlock>

python3 -c "import zlib; print(hex(zlib.crc32(b'Hi')), hex(zlib.crc32(b'iH')))"
0x4d170e0e 0x8de10bb3

</TerminalBlock>

Same two bytes, opposite orders, fingerprints not even cousins — while the additive checksum swore both were `0xB1`. The NUXI anagram finally has a witness that reads *sequence*, not just *inventory*.

## Hamming's furious weekend {/*hammings-furious-weekend*/}

Everything so far *detects*. Detection presumes a luxury: someone to ask for a retransmission. Ethernet has TCP above it; a scratched CD has no one — the original pressing is gone. A Mars probe's request for a re-send takes many minutes each way. And in 1947 at Bell Labs, a mathematician named **Richard Hamming** had a pettier version of the same problem: he had weekend access to a relay computer that checked its own arithmetic with parity — and whenever parity tripped on his unattended Friday-night jobs, the machine simply *abandoned them*, and Hamming arrived Monday to nothing. Two weekends of this produced one of the great productive tantrums in engineering history. His question: *"If the machine can tell an error occurred, why can't it tell WHERE — and fix it?"* His 1950 answer founded error-*correcting* codes.

The construction is one of those tricks that looks like a magic show and turns out to be an addressing scheme. Take 4 data bits; add **3 parity bits**; but — the stroke of genius — *number the seven positions 1 through 7 in binary*, and give each parity bit a beat to patrol based on those numbers: parity 1 guards every position whose number has bit 1 set (1,3,5,7); parity 2 guards positions with bit 2 set (2,3,6,7); parity 4 guards positions with bit 4 set (4,5,6,7):

<Diagram name="checksum-crc/hamming_venn" height={400} width={720} alt="Three large overlapping circles labeled parity 1, parity 2, and parity 4, forming a classic three-set Venn diagram. The seven regions are labeled with positions: circle-only regions hold positions 1, 2 and 4 (the parity bits themselves); pairwise overlaps hold positions 3 (circles 1 and 2), 5 (circles 1 and 4) and 6 (circles 2 and 4); the triple overlap holds position 7. Each region shows the example codeword bit value: 0,1,1,0,0,1,1 for positions 1 through 7. The bit at position 6 is drawn flipped in red, and its two containing circles, parity 2 and parity 4, are outlined in red with 'FAIL' tags, while parity 1 is marked 'pass'. A caption reads: failing checks 2 + 4 = 6 — the broken bit's own address.">

Every data bit sits in a unique combination of patrol zones. Flip one bit, and the *pattern* of failing patrols is the flipped position's number, written in binary.

</Diagram>

Encode the data `1011` (placed at positions 3, 5, 6, 7) and compute each patrol's parity over its zone:

```
positions:   1   2   3   4   5   6   7
             p1  p2  d   p4  d   d   d
data:                1       0   1   1

p1 over {1,3,5,7}:  needs 1⊕0⊕1 even → p1 = 0
p2 over {2,3,6,7}:  needs 1⊕1⊕1 even → p2 = 1
p4 over {4,5,6,7}:  needs 0⊕1⊕1 even → p4 = 0

Codeword:    0   1   1   0   0   1   1
```

Now the magic show. A cosmic ray flips position 6 (a 1 → 0). The receiver re-runs the three patrols:

```
check 1 {1,3,5,7}: 0⊕1⊕0⊕1 = 0   even → PASS
check 2 {2,3,6,7}: 1⊕1⊕0⊕1 = 1   odd  → FAIL
check 4 {4,5,6,7}: 0⊕0⊕0⊕1 = 1   odd  → FAIL

Failing patrols: 2 and 4  →  2 + 4 = 6
```

**The failing checks sum to the broken bit's address.** Not by coincidence — by construction: position 6 is `110` in binary, so it lies in patrol 2's zone and patrol 4's zone and not patrol 1's, so exactly those patrols trip. The syndrome doesn't *hint at* the error; it **spells it**, in the positional binary of Lesson 2. Flip bit 6 back; the data is *healed*, no retransmission, no original, no human. (And note the fine print, which the toy below will let you trigger: flip *two* bits and the syndrome still points somewhere — confidently, and *wrongly*. Real systems therefore run extended SECDED codes — "single error correct, double error detect" — an extra overall parity bit that tells repair apart from ambush.)

This is not museum mathematics. **ECC memory** — standard in every serious server, conspicuously absent from the laptop this lesson is read on — stores every 64-bit word as 72 bits of exactly this construction, silently healing the Google study's error rate all day long. The Schaerbeek machine, needless to say, had none; 4,096 phantom votes was the price of eight missing chips. And for damage bigger than one bit — the scratch, the burst — Hamming's idea matured into **Reed–Solomon codes** (1960), which work over whole *bytes* and correct dozens of them at once. Last lesson's cliffhanger resolves here: a CD wraps its 176,400 bytes-per-second in cross-interleaved Reed–Solomon (**CIRC**), first *shuffling* the bytes so a scratch's damage lands scattered instead of clustered (interleaving turns one fatal burst into many trivial nicks), then healing up to about **4,000 consecutive lost bits — roughly 2.5 mm of track** — with zero audible trace. Every QR code you've scanned carries the same family, tuned to survive **up to 30% destruction** — which is why a logo can be stamped straight over the code's middle and it scans anyway: the logo isn't avoiding the data, it's *destroying* it, and Reed–Solomon rebuilds the loss on every scan, forever. Voyager's photographs from beyond the planets, DVDs, RAID-6 arrays, 5G, satellite links: all the same lineage, all descended from a man whose weekend jobs kept dying.

<DeepDive>

#### Bitsquatting: when the flip works for the attacker {/*bitsquatting-when-the-flip-works*/}

Here's a research result that makes bit flips feel personal. In 2011, security researcher Artem Dinaburg asked a mischievous question: if RAM bits flip in the wild, then sometimes they must flip inside a *stored domain name* — so what if you registered the domains that popular names become when one bit flips? `fbcdn.net` (Facebook's CDN) is one flipped bit away from `fbcdn.ne**f**`... and from a few dozen other single-bit mutants, most of them registrable. He registered a set of such **bitsquat** domains, stood up servers, and waited. The servers received a steady stream of real connections — thousands of unique machines over the following months — from phones, desktops, even embedded devices whose memory had flipped a bit *after* every checksum had already passed, causing them to earnestly contact a domain their owners never typed. No exploit, no phishing, no malware: the attack surface was physics. It's the perfect closing exhibit for this lesson's threat model — integrity checks protect data *in flight* and *at rest within their span*, but a bit that flips in the gap between checks, in live RAM holding a hostname, has no witness at all (unless that RAM is ECC — which, on consumer devices, it isn't). Defense in this world looks like: ECC where it matters, TLS certificate validation as a backstop (the bitsquat server can't present a valid certificate for the *intended* name), and corporations quietly registering their own mutants.

</DeepDive>

<DeepDive>

#### When the checksum itself lies {/*when-the-checksum-itself-lies*/}

Two sobering footnotes from the field, and the design principle they force. First: coverage gaps are real. A famous SIGCOMM 2000 study (Stone & Partridge) captured live internet traffic and found data that had been corrupted *and repaired into plausibility* — errors that Ethernet's CRC had caught per-hop but that were reintroduced *between* protections (in router memory, in buggy NIC firmware, in software copies), then re-checksummed as if legitimate. Their estimate: somewhere between 1 in 16 million and 1 in 10 billion TCP segments carries an error the 16-bit TCP checksum fails to notice — negligible per packet, and a certainty per data center per day (Lesson 2's multiplication, always). Each check guards only its own **span**; corruption between spans inherits a clean bill of health.

Second: everything in this lesson is math against *accidents*, and accidents don't fight back. A CRC is a linear function — an adversary who wants to alter your file *and preserve its CRC-32* can do so with pencil and paper; there are only 2³² possibilities and the algebra is public. That's why "integrity" splits into two professions: CRCs and checksums versus **nature** (fast, cheap, guarantees against random damage), and **cryptographic hashes** — SHA-256 and kin — versus **humans** (designed so that finding *any* second input with the same fingerprint is computationally hopeless). Together they yield the working rule called the **end-to-end argument** (Saltzer, Reed & Clark, 1984): intermediate checks are optimizations; the *authoritative* verification must happen at the endpoints, spanning everything — which is why ZFS and modern databases checksum every block at the application layer even though every lower layer already "guaranteed" integrity, and why the download you actually care about gets verified against a SHA-256 from an *independent* channel. Trust spans, not links.

</DeepDive>

<Pitfall>

**"The checksum matches" proves less than it feels like it proves.**

Mistake one: treating a matching CRC as proof nobody tampered. CRC-32 answers *"was this probably damaged by accident?"* — an attacker adjusts a file to any CRC they like in microseconds. Tamper-evidence requires a cryptographic hash, and even then: a SHA-256 published on the *same server* as the download is theater — whoever replaced the file edits the hash line in the same breach. The reference fingerprint must arrive by a channel the attacker doesn't control (signed release keys, a separate origin).

Mistake two: assuming some lower layer "already handles it." TCP's checksum is 16 bits and span-limited; Ethernet's CRC dies at each hop; RAM without ECC guards nothing at rest. If the data *matters* — backups, financial records, scientific results — verify **end to end**: fingerprint at creation, store the fingerprint separately, re-verify after every migration and on a schedule. Bit rot's favorite victims are the files nobody has opened in five years — the backup you'll want most is the one that's had the longest to decay unobserved.

</Pitfall>

## The repair machine {/*the-repair-machine*/}

Below is the Hamming(7,4) code from this lesson, running live — the codeword `0110011` protecting the data `1011`. Click any bit to damage it (cosmic ray on demand), and watch the three patrols re-run: the failing checks sum to the culprit's address, and the machine points at it. Then run the experiment the fine print warned about: flip **two** bits, and watch a confident machine repair the wrong one:

<Sandpack>

```js
import { useState } from 'react';

const CLEAN = [0, 1, 1, 0, 0, 1, 1]; // data 1011 at positions 3,5,6,7

export default function RepairMachine() {
  const [bits, setBits] = useState(CLEAN);
  const flip = (i) => setBits(bits.map((b, j) => (j === i ? 1 - b : b)));
  const at = (p) => bits[p - 1];
  const checks = [
    { n: 1, zone: [1, 3, 5, 7] },
    { n: 2, zone: [2, 3, 6, 7] },
    { n: 4, zone: [4, 5, 6, 7] },
  ].map((c) => ({
    ...c,
    fail: c.zone.reduce((s, p) => s ^ at(p), 0) === 1,
  }));
  const pos = checks.reduce((s, c) => s + (c.fail ? c.n : 0), 0);
  const damage = bits.filter((b, i) => b !== CLEAN[i]).length;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>
        Click bits to damage the codeword (data 1011):
      </p>
      <div>
        {bits.map((b, i) => (
          <button key={i} onClick={() => flip(i)} style={{
            width: 44, height: 56, margin: 2, fontSize: 20,
            borderRadius: 8, cursor: 'pointer',
            border: pos === i + 1
              ? '3px solid #c1554d' : '1px solid #888',
            background: [0, 1, 3].includes(i) ? 'transparent' : '#087ea41f'
          }}>
            {b}
            <div style={{ fontSize: 10, color: '#888' }}>
              {[0, 1, 3].includes(i) ? 'p' : 'd'}{i + 1}
            </div>
          </button>
        ))}
      </div>
      <p>
        {checks.map((c) => (
          <span key={c.n} style={{
            margin: 6, color: c.fail ? '#c1554d' : '#087ea4'
          }}>
            check {c.n}: {c.fail ? 'FAIL' : 'pass'}
          </span>
        ))}
      </p>
      {pos === 0 && <p style={{ fontFamily: 'system-ui' }}>
        All patrols pass — codeword clean.</p>}
      {pos > 0 && <p style={{ fontFamily: 'system-ui' }}>
        Failing checks sum to <b>{pos}</b> → bit {pos} accused.{' '}
        {damage === 1 && 'Correct! Click it to heal.'}
        {damage === 2 && <b style={{ color: '#c1554d' }}>
          But YOU flipped two — the machine repairs the wrong bit.</b>}
      </p>}
    </div>
  );
}
```

</Sandpack>

That two-flip betrayal is worth sitting with: the syndrome arithmetic is flawless, the conclusion confidently wrong — because the *contract* only covers single flips. Every integrity mechanism in this lesson is a precise promise with precise edges: parity (odd counts only), CRC-32 (bursts ≤ 32, accident not malice), Hamming (one flip, not two). Engineering with them means knowing the promise, not just trusting the glow of the green checkmark.

<Recap>

- **Bits flip.** Cosmic rays, alpha particles, electrical noise, and decay make single-bit errors a *rate*, not an anecdote (≈8% of memory modules log errors yearly at fleet scale). Flips leave a fingerprint: values off by a clean **power of two** — Schaerbeek's phantom 4,096 votes = bit 13.
- The defense philosophy is **redundancy**: extra bits computed from the data, traveling with it, so anyone can recompute and compare. The mechanisms form a ladder of evidence.
- **Parity** (1 extra bit): catches every *odd* number of flips, is blind to every even number, and can locate nothing. It guarded serial lines and the ninth RAM chip for decades.
- **Additive checksums** are stronger but **commutative** — `Hi` and `iH` both sum to `0xB1`, so reordering (Lesson 5's whole rogues' gallery) passes undetected. The Internet checksum in every IP/TCP/UDP header is Lesson 3's **one's complement, end-around carry** — promise kept. Luhn's card-number check fixes transposition with positional doubling.
- **CRC** is casting-out-nines industrialized: the message as one huge binary number, fingerprinted by its **XOR-division remainder** against a chosen generator. CRC-32 (Ethernet, ZIP, PNG, gzip) guarantees all single flips and all bursts ≤ 32 bits, missing random garbage only 1 in 2³² — and it is ferociously order-sensitive: `Hi` → `4d170e0e`, `iH` → `8de10bb3`.
- **Hamming codes** *correct*: number positions in binary, patrol by bit; the failing checks **sum to the flipped bit's address**. ECC server RAM (72 bits per 64) heals silently; two flips fool it, hence SECDED. **Reed–Solomon** heals bursts: CIRC lets a CD survive ~4,000 dead bits (≈2.5 mm of scratch); QR codes survive 30% destruction — the logo *is* damage, repaired at every scan.
- Judgment layer: checks protect only their **span** (corruption between spans re-checksums as clean); CRCs fight **accidents**, cryptographic hashes fight **adversaries**; authoritative verification belongs **end to end**, with fingerprints stored out-of-band.

</Recap>

<Challenges>

#### Divide like a receiver {/*divide-like-a-receiver*/}

The lesson transmitted `1101 001` (message + CRC-3, generator `1011`) and claimed that the damaged version `1111001` yields remainder `110`. Verify both by hand: divide `1101001` (should come out clean) and `1111001` (should come out `110`). Show every XOR step.

<Hint>

Align the generator under the current leftmost 1, XOR, let leading zeros fall away, repeat until what's left is shorter than the generator (3 bits or fewer). The intact case must end in exactly `000`.

</Hint>

<Solution>

Intact transmission — write the generator at full width for each alignment (exactly what the hardware's shift register does, and much harder to fumble than schoolbook staggering):

```
  1101001
⊕ 1011000        (generator aligned at bit 6)
  = 0110001
⊕  101100        (aligned at bit 5)
  = 0011101
⊕   10110        (aligned at bit 4)
  = 0001011
⊕    1011        (aligned at bit 3)
  = 0000000      → remainder 000 ✓ clean
```

Damaged transmission (bit 4 flipped):

```
  1111001
⊕ 1011000        → 0100001
⊕  101100        → 0001101
⊕     1011       → 0000110   → remainder 110 ✗ ALARM ✓
```

Also notice *what* the receiver never needed: the original message. The received string testifies about itself — the appended remainder was constructed so that truth divides to zero.

</Solution>

#### The number in your wallet {/*the-number-in-your-wallet*/}

Run the Luhn check on the (test) card number `4539 1488 0343 6467`. Recipe: from the **rightmost** digit, double every second digit (positions 2, 4, 6… from the right); if a doubling yields two digits, sum them (e.g. 8 → 16 → 1+6 = 7); add everything; valid iff the total ends in 0. Then answer: which everyday typo is the doubling step specifically engineered to catch, and why would a plain digit-sum miss it?

<Solution>

Working from the right (`7` is position 1):

```
pos:    16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1
digit:   4  5  3  9  1  4  8  8  0  3  4  3  6  4  6  7
double:  ×     ×     ×     ×     ×     ×     ×     ×
becomes: 8  5  6  9  2  4  7  8  0  3  8  3  3  4  3  7
         (16→7)            (16→7)       (12→3) (12→3)

Sum: 8+5+6+9+2+4+7+8+0+3+8+3+3+4+3+7 = 80  → ends in 0 ✓ VALID
```

The engineered target is the **adjacent transposition** — typing `…64…` as `…46…`, the most common human data-entry error. A plain digit sum is commutative, so swaps are invisible to it (the `Hi`/`iH` disease in decimal). Under Luhn, adjacent positions have *different* treatments (one doubled, one not), so swapping two unequal neighbors almost always changes the total. Same lesson as CRC-vs-additive, solved in 1954 with 1950s office machines in mind: when order matters, the fingerprint must weight positions.

</Solution>

#### The dedup that ate a config {/*the-dedup-that-ate-a-config*/}

Transfer task. A design-review ticket: a file-sync product decides two files are identical — and silently stores only one — when their **(size, additive-checksum)** pair matches, "because hashing every file is too slow." A customer reports that two *different* server config files are being merged into one, corrupting deployments. Construct the smallest demonstration pair that defeats the scheme, explain the failure class precisely, and write the review verdict with a concrete fix (including what role, if any, checksums should keep).

<Solution>

**Demonstration pair** — the lesson's own two bytes suffice:

```
file A: "Hi"   size 2, sum 0x48+0x69 = 0xB1
file B: "iH"   size 2, sum 0x69+0x48 = 0xB1   → "identical" ✗
```

Any permutation of the same bytes collides: `listen.conf` vs `silent.conf` contents, reordered YAML keys, a shuffled line order — precisely the edits real config files undergo. **Failure class:** an additive checksum is commutative and position-blind, so it fingerprints a file's byte *inventory*, not its byte *sequence*; using it as an identity test declares anagrams equal. (Compensating edits — one byte +1, another −1 — collide too.)

**Review verdict:** *"Blocking: content identity must be decided by a collision-resistant fingerprint. Replace the additive sum with SHA-256 of the content (BLAKE3 if throughput is the concern — modern hashes run at multiple GB/s, so 'too slow' needs a benchmark, not an assumption); compare full content on hash match if we ever face adversarial inputs. The cheap checks keep their correct jobs: size and a fast checksum are fine as a* negative *filter (mismatch ⇒ definitely different, skip hashing) — they must never supply the positive verdict. And per end-to-end practice: verify the fingerprint after transfer at the destination, not just at the source."*

The general principle, one last time in this module's voice: every fingerprint is a **contract with stated coverage** — parity covers odd flips, CRC covers bursts, additive sums cover almost nothing about order — and production incidents are what happens when code quietly assumes a coverage the contract never offered. ✓

</Solution>

</Challenges>

<LearnMore title="Compression: How ZIP Works (Huffman, LZ)" path="/learn/faza-0/modul-0-1/compression">

This lesson spent bits deliberately — redundancy added so damage can't hide. The next lesson runs the machine in reverse: redundancy *hunted and eliminated*, so the same data fits in fewer bits. It's the missing piece of Lesson 7's mystery (36 MB of photo living in a 3 MB file), it's inside every ZIP you've opened — right next to the CRC-32 you now understand — and its central algorithm was invented by a graduate student in 1951, choosing between a term paper and a final exam. He picked the paper.

</LearnMore>
