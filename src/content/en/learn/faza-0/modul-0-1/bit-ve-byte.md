---
title: 'Bits and bytes: what is information'
---

<Intro>

The photo on your phone, the song you're listening to, the text on this website, the balance in your bank account — all made of the same thing: billions of 0s and 1s. But why 0s and 1s? Why doesn't a computer work with 10 digits like we do? The answer isn't hidden in mathematics but in *physics* — and all of computer science is built on that answer.

</Intro>

<YouWillLearn>

- What a bit — the smallest unit of information — is
- The real (physical) reason computers work in binary
- Why a byte is exactly 8 bits — and the history behind it
- The difference between KB and KiB: why a "1 TB" disk shows 931 GB
- The "everything is bytes" principle: different meanings from the same bits

</YouWillLearn>

## Communicating with a light switch {/*communicating-with-a-light-switch*/}

Take the light switch in your room. It has two states: on and off. Can you send a message to a friend in the next building using this switch?

Yes — you agree beforehand: "on" = yes, "off" = no. One switch gives you 2 possible messages.

Now take 2 switches. Combinations: on-on, on-off, off-on, off-off — that is already 4 messages. 3 switches = 8 messages. Every new switch **doubles** the possibilities.

<Diagram name="light_switches" height={280} width={640} alt="Three rows of light switches: 1 switch gives two states (2 messages), 2 switches give four combinations (4 messages), 3 switches give eight combinations (8 messages). Each row shows switches in on/off positions with the count of possible messages.">

Each additional switch doubles the number of possible combinations.

</Diagram>

A computer is a collection of trillions of such microscopic switches. Each switch is called a **transistor** (an electrically controlled switch that can flip billions of times per second), and each one's state carries one **bit** of information.

## Bit: the atom of information {/*bit-the-atom-of-information*/}

In 1948, Claude Shannon, working at Bell Labs, published "A Mathematical Theory of Communication" — the birth certificate of information theory. Shannon showed that *any* information — text, sound, image — can be converted into a sequence of "yes/no" questions. The smallest unit of information is a single "yes/no" answer: a **bit** (*binary digit*).

A bit has two values: `0` or `1`. There is no smaller unit of information.

As the number of bits increases, the number of representable states grows like this:

| Bits | Different states | What it covers in the real world |
|---|---|---|
| 1 | 2 | yes / no |
| 2 | 4 | four directions (↑ ↓ ← →) |
| 4 | 16 | one hexadecimal digit |
| 8 | 256 | one ASCII character, one color channel |
| 16 | 65,536 | one port number |
| 32 | ~4.3 billion | one IPv4 address |
| 64 | ~18 quintillion | one "word" of a modern CPU |

Memorize the formula behind the table — it will come up throughout the course:

**n bits = 2ⁿ different states**

In the interactive example below, flip 8 switches (i.e. 8 bits) yourself and see what number results:

<Sandpack>

```js
import { useState } from 'react';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function ByteToy() {
  const [bits, setBits] = useState(Array(8).fill(0));

  function toggle(i) {
    const next = [...bits];
    next[i] = next[i] === 0 ? 1 : 0;
    setBits(next);
  }

  const value = bits.reduce(
    (sum, bit, i) => sum + bit * WEIGHTS[i],
    0
  );

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace', padding: '20px' }}>
      <p style={{ marginBottom: '12px', color: '#404756' }}>Click the bits to toggle:</p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              width: 44,
              height: 56,
              margin: 3,
              fontSize: 22,
              fontFamily: 'monospace',
              borderRadius: 8,
              border: '2px solid',
              borderColor: bit ? '#087EA4' : '#EBECF0',
              cursor: 'pointer',
              background: bit ? '#087EA4' : 'transparent',
              color: bit ? 'white' : '#404756',
              transition: 'all 0.15s'
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#99A1B3', marginTop: 6 }}>
        {WEIGHTS.map(w => (
          <span key={w} style={{ display: 'inline-block', width: 50 }}>
            {w}
          </span>
        ))}
      </div>
      <h2 style={{ fontSize: 32, margin: '16px 0 8px', color: '#087EA4' }}>= {value}</h2>
      <p style={{ color: '#404756', fontSize: 14 }}>
        One byte (8 bits) can hold 2⁸ = 256 different values,{' '}
        from 0 to 255.
      </p>
    </div>
  );
}
```

</Sandpack>

Set them all to 1 — you'll get 255: the ceiling of one byte. Remember this number; in the next lesson we'll see what happens to it.

## Why exactly 2? Why not 10? {/*why-exactly-2*/}

This is the most important engineering decision in the history of computing, and the reason is **reliability** — not mathematical elegance.

In an electronic circuit, a digit is represented by voltage. Suppose we want to build a base-10 system: 0V = "0", 0.5V = "1", 1V = "2"... 4.5V = "9". The problem: in a real circuit voltage never stays perfectly stable. Temperature, electrical noise, and component aging cause it to fluctuate constantly. You measure 2.3V — is that "4" or "5"? Errors become inevitable.

In binary there are only two states: "voltage present" and "voltage absent," with a wide empty zone between them. Even if the signal drifts significantly, confusing 0 and 1 is nearly impossible.

<Diagram name="voltage_noise" height={340} width={720} alt="Two graphs side by side. Left: a 10-level system with voltage bands from 0V to 4.5V packed closely together; a noisy signal line crosses into adjacent bands in several places, marked with red X. Right: a binary system with only two wide zones (low = '0', high = '1') separated by a large buffer; the same level of noise never pushes the signal into the wrong zone, green check mark shown.">

Noise shakes both signals equally — but in binary there is no room for an error.

</Diagram>

**Binary is insurance against noise.** Computers don't work with 0s and 1s because it's mathematically special; they work that way because distinguishing two states is physically nearly error-free.

<Note>

Binary wasn't the only attempt. In the USSR in 1958, a ternary (base-3: −1, 0, +1) computer called **Setun** was built, and it was actually more efficient for some calculations. More interestingly: the first major electronic computer **ENIAC (1945) was not binary** — it operated in decimal and used 10-state vacuum-tube rings for each digit. Engineers drew the "reliability" lesson directly from the ENIAC experience — virtually every practical machine built afterward was binary.

</Note>

## Byte: why exactly 8? {/*byte-why-exactly-8*/}

Bits are too small to use individually — we group them. A group of 8 bits is called a **byte**. But 8 is not a law of nature; it is a **historical convention**.

The 1950s–60s were a chaotic era: machines with 6-bit, 7-bit, and 9-bit bytes coexisted. The word "byte" was coined in 1956 by IBM engineer Werner Buchholz — derived from the English word *bite* ("a mouthful"); the *i* was changed to *y* so it would not be confused with "bit."

The turning point was 1964: the era's most successful computer, the **IBM System/360**, was built around an 8-bit byte, and the entire market aligned to it. 8 was also practical: it comfortably fit the uppercase and lowercase letters of the English alphabet, digits, and symbols, and it is a power of 2.

A half-byte (4 bits) is jokingly but seriously called a **nibble** ("a small bite") — you will encounter it in the hexadecimal lesson.

<DeepDive>

#### Non-8-bit worlds {/*non-8-bit-worlds*/}

The 8-bitness of a byte is so established that standards documents use a separate word to avoid ambiguity: **octet** — "exactly 8 bits." Networking protocol specifications (RFCs) say "octet" rather than "byte," because when those documents were written, machines with 9-bit bytes (e.g., the PDP-10 — 36-bit words, 9-bit pieces) were still in active use.

Another trace: ASCII encoding is 7-bit, not 8. The reason: in 1963 every bit was expensive, and 128 characters were enough for English text. The "leftover" 8th bit was later assigned to different additional characters in different countries — and a years-long encoding chaos followed. You will see how this story ends — how Unicode and UTF-8 saved the world — a few lessons from now.

</DeepDive>

## KB, MB, GB — and the "missing" gigabytes {/*kb-mb-gb*/}

We use prefixes for large amounts of data, but here lives one of the industry's most famous confusions. There are two different "kilo"s:

| Marketing language (decimal) | Technical language (binary) |
|---|---|
| 1 KB = 1,000 bytes | 1 KiB = 1,024 bytes (2¹⁰) |
| 1 MB = 10⁶ bytes | 1 MiB = 2²⁰ bytes |
| 1 GB = 10⁹ bytes | 1 GiB = 2³⁰ bytes |
| used by disk manufacturers | used by RAM and operating systems |

The result has happened to every developer: you buy a "1 TB" disk (the manufacturer counts: 10¹² bytes), the OS measures it in GiB and shows **~931 GB**. Nothing was lost — two different vocabularies just collided. This confusion led to real class-action lawsuits against disk manufacturers in the US — now packages say "1 GB = 1 billion bytes" in fine print.

<Pitfall>

**Internet speed is measured in bits; file size is measured in bytes.**

"100 Mbps" = 100 mega**bits** per second = ~12.5 mega**bytes**. A 1 GB file at this speed takes ~80 seconds, not 10.

Lowercase **b** = bit, uppercase **B** = byte. ISPs love this confusion — a "100 megabit" plan sounds 8× faster when mistaken for "100 megabyte."

</Pitfall>

## Everything is bytes — interpretation gives meaning {/*everything-is-bytes*/}

The central idea of this lesson: to a computer there is **no difference** between text, an image, a song, and a program. They are all sequences of bytes. What creates the difference is *how* we read those bytes.

<Diagram name="same_bytes_three_meanings" height={320} width={680} alt="In the center, two bytes are shown: 01001000 01101001. Three arrows branch from them. The first arrow labeled 'read as text (ASCII)' leads to the word Hi. The second arrow labeled 'read as a 16-bit number' leads to the number 18537. The third arrow labeled 'read as a pixel' leads to a gray-blue color sample.">

Same two bytes — three different meanings. A byte has no "type" of its own.

</Diagram>

`01001000 01101001` — read as text it is "Hi," read as a 16-bit integer it is 18,537. There is no "I am text" label written on the byte.

File extensions (.jpg, .mp3, .txt) are essentially labels that indicate this interpretation rule. The "garbage" you see when you open a .jpg file in a text editor is bytes read with the wrong rule. The following lessons open these rules one by one: how numbers are encoded, how negatives work, how fractions work, how text is stored.

<Recap>

- The atom of information is a **bit**: 0 or 1. Formula: **n bits = 2ⁿ different states.**
- Computers work in binary because distinguishing two voltage states is **physically reliable** — the reason is engineering, not mathematics.
- **Byte = 8 bits** — a historical standard from IBM System/360, not a law of nature.
- KB (1,000) ≠ KiB (1,024): why a "1 TB" disk shows 931 GB. **Mbps ≠ MBps.**
- Everything in a computer is bytes; **interpretation** gives meaning — this idea is the key to the whole course.

</Recap>

<Challenges>

#### How many bits are needed? {/*how-many-bits-are-needed*/}

A game character has 4 states: standing, running, jumping, flying. What is the minimum number of bits needed to store this state? What if there were 5 states?

<Solution>

For 4 states, **2 bits** is enough: 2² = 4 (e.g., `00` standing, `01` running, `10` jumping, `11` flying).

For 5 states, 2 bits is no longer enough (2² = 4 < 5), so **3 bits** are needed: 2³ = 8. Yes, 3 combinations will remain "empty" — bits come in whole numbers, your need does not. This "rounding up" pattern (⌈log₂ n⌉ bits for n states) will come up many times throughout the course.

</Solution>

#### How long will the download take? {/*how-long-will-the-download-take*/}

Your internet speed is 50 Mbps. Roughly how long will a 3 GB game update take? (Use round numbers.)

<Solution>

First convert bits to bytes: 50 Mbps ÷ 8 = **6.25 MB/s**.

3 GB ≈ 3,000 MB. 3,000 ÷ 6.25 = **480 seconds = 8 minutes**.

If you had read Mbps as MB/s, you would get 1 minute — off by a factor of 8. The lowercase b / uppercase B difference is exactly where it "costs" you.

</Solution>

#### Write a reply to a friend {/*write-a-reply-to-a-friend*/}

A friend messages you: "I bought a 512 GB phone, but the settings show 476 GB. Did they cheat me? Should I return it?" Write a two-sentence technical reply.

<Solution>

Sample reply: "You weren't cheated — when the manufacturer says 512 GB they mean 512 billion bytes, but your phone's OS measures storage in 2³⁰-based gigabytes (GiB): 512 × 10⁹ ÷ 2³⁰ ≈ 476. All your storage is there; it's just two different units of measurement using the same name."

Check: 512,000,000,000 ÷ 1,073,741,824 ≈ 476.8 ✓

</Solution>

</Challenges>
