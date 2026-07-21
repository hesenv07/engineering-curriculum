---
title: 'Compression: How ZIP Works (Huffman, LZ)'
---

<Intro>

In 1951, MIT professor Robert Fano offered his information-theory class a deal: sit the final exam, or write a term paper solving one problem — find the most *efficient* binary code. He didn't mention that the problem was open, or that the best known attempt, the code bearing his and Claude Shannon's names, fell short of optimal. A graduate student named David Huffman chose the paper, struggled for months, and days before the exam threw his notes in the bin to go study — then, the next morning, saw the idea everyone had missed hiding in the discarded pages. The algorithm from that term paper has probably run on your machine a thousand times today: it fires every time you open a ZIP, a PNG, a JPEG, or this web page. This lesson teaches you Huffman's trick, its partner LZ77, and how the two combine into the machinery inside every `.zip` on Earth.

</Intro>

<YouWillLearn>

- Why data can shrink at all — **redundancy**, made visible by one experiment (a million bytes → 1,003 bytes... or 1,000,173)
- **Run-length encoding**: the obvious idea, where it wins (fax machines), and how it *doubles* ordinary text
- **Huffman coding**: short codes for common symbols, why **prefix-free** codes need no separators, and how to build the optimal tree by hand
- **LZ77**: "go back 13, copy 5" — compressing repetition itself, including the overlap trick that copies bytes that don't exist yet
- How **DEFLATE** chains the two into ZIP, gzip, PNG, and `.docx` — and why every ZIP on Earth begins with a dead programmer's initials
- The mathematical wall: why no algorithm can compress everything, why zipping twice backfires, and what a 42 KB file that unpacks to 4.5 petabytes teaches about trust

</YouWillLearn>

## Where the missing megabytes went {/*where-the-missing-megabytes-went*/}

Lesson 7 left you holding a debt. A 12-megapixel photo costs 36,000,000 bytes raw — you did the multiplication yourself — yet the file on your phone is about 3 MB. Two different ideas closed that gap. **Lossy** compression *discards*: JPEG throws away detail your eye won't miss — a one-way door you already know. **Lossless** compression — this lesson — discards *nothing*: unpack, and every byte returns bit-for-bit identical, a claim the CRC-32 riding inside the archive exists to verify (Lesson 8). ZIP, gzip, and PNG are pure lossless; JPEG is *both* — it discards first, then packs the survivors with the very Huffman coding this lesson teaches. The photo mystery resolves in two stages, and by the end of this page you'll own the second one completely.

But "smaller without losing anything" sounds like a scam. If nothing is thrown away, what leaves the file? Run the experiment — two inputs of *identical* size, one all zeros, one all random:

<TerminalBlock>

head -c 1000000 /dev/zero | gzip | wc -c

</TerminalBlock>

<TerminalBlock>

1003

</TerminalBlock>

<TerminalBlock>

head -c 1000000 /dev/urandom | gzip | wc -c

</TerminalBlock>

<TerminalBlock>

1000173

</TerminalBlock>

A million zeros collapse to **1,003 bytes** — about 1,000× smaller. A million random bytes come out at **1,000,173** — the "compressed" file is 173 bytes *bigger*. Same length in, opposite fates out: file size clearly isn't what gzip is measuring.

What gzip measures is **redundancy** — the part of the data you could have predicted without being told. A million zeros contain almost no information: the sentence "a million zeros" *is* the file, and 1,003 bytes is gzip's way of writing that sentence. Random bytes have no predictable part, so there's nothing to remove — and the bookkeeping overhead makes the output larger. That's the whole field in one line: **compression doesn't shrink data — it shrinks predictability.** Shannon's 1948 paper — the same one that named the bit in Lesson 1 — gave the idea a number, **entropy**: the true information content of a message in bits, which no lossless scheme can beat. We'll hit that wall near the end; first, let's hunt some redundancy.

One more framing, in this module's native language: a text file is bytes under a *standard* contract — one byte per character, everyone billed equally (Lesson 6). A compressed file is the same information rewritten under a **custom, private contract** designed for this data specifically, with the decoder ring traveling inside the file. Compression is contract negotiation.

<Note>

In this lesson, "compression" with no adjective means **lossless**. The lossy half — sampling, quantization, what JPEG and MP3 choose to destroy — was Lesson 7. Real media formats chain the two: lossy decides what to keep, lossless packs what's kept.

</Note>

## The obvious idea: run-length encoding {/*the-obvious-idea-run-length-encoding*/}

Humans invented compression notation long before computers. Open any knitting pattern: it says `k12, p2` — *knit twelve, purl two* — not `knit knit knit...` twelve times. Keep the knitting pattern in mind; by the end of the lesson you'll see it contains this entire lesson in miniature.

`k12` is the first algorithm: **run-length encoding (RLE)** — replace each *run* of repeated symbols with the symbol and a count. Take one scan line from a fax of a mostly-blank page, `W` for white pixels, `B` for black:

```
input:   WWWWWWWWWWWWBWWWWWWWWWWWWBBB          28 symbols

runs:    W ×12   B ×1   W ×12   B ×3

output:  (W,12)(B,1)(W,12)(B,3)                4 pairs = 8 bytes

28 bytes → 8 bytes: 3.5× smaller ✓
```

This is a real workhorse, not a toy: fax machines, standardized by the CCITT in 1980, scan **1,728 pixels per line**, and a typical page is overwhelmingly white — runs of hundreds, exactly RLE's food. (The fax standard adds a twist you'll recognize shortly: instead of storing run lengths as plain numbers, it gives the *most common* lengths the *shortest* codes. Hold that thought.)

Now watch RLE meet ordinary data:

```
input:   Hello, world!                          13 bytes

runs:    H×1 e×1 l×2 o×1 ,×1 ␣×1 w×1 o×1 r×1 l×1 d×1 !×1

output:  12 pairs = 24 bytes                    ✗ nearly DOUBLED
```

English text almost never repeats a letter *adjacently* — one lonely `ll` in that whole sentence — so RLE pays a count for every symbol and gets nothing back. The failure is instructive, because what it teaches is exactly the two halves of everything that follows:

1. Symbols are not equally common — `e` and space dominate English — yet ASCII charges everyone the same 8 bits. **Frequency deserves short names.**
2. Ordinary data *does* repeat — `Hello` and `world` will appear again paragraphs later — just not in adjacent runs. **Repetition lives at phrase distance.**

Idea 1 becomes Huffman coding. Idea 2 becomes LZ77. ZIP is what happens when you bolt them together.

## Huffman coding: short names for common things {/*huffman-coding-short-names-for-common-things*/}

Giving frequent things short names is older than computers. Morse code, designed in the 1830s, spends a single dot on `E` and a single dash on `T` — the two most common English letters — while rare `Q` costs `− − · −`; Alfred Vail reportedly estimated the frequencies by counting the movable type in a printer's shop, since printers stock exactly as much of each letter as the language demands. He was right to: in typical English roughly one letter in eight is an `E`, while `Z` is about 170× rarer. ASCII ignores all of this — flat pricing, 8 bits each (Lesson 6). There is obvious money on the table.

But variable-length codes carry a trap. Try the laziest scheme: `E = 0`, `T = 1`, `A = 01`. Now decode the incoming bits `01`. Is that `ET`, or `A`? The stream doesn't say — and unlike Morse operators, who pause between letters, a file has no pauses; bits arrive as one unbroken river. Spend extra bits on separators and you've spent the savings.

The escape is a property called **prefix-free**: *no code may be the prefix of another code.* If `0` is a complete code, nothing else may start with `0`. A prefix-free stream needs no separators, because every codeword announces its own ending: the moment your bits match a code, that code is finished — guaranteed. You trust this property daily: international phone codes are prefix-free by design — `+1` is North America, so no other country code begins with 1 — which is how your phone knows where the country code ends without a "done" key.

So the problem Fano assigned is sharper than "short codes for common symbols": **given the frequencies, find the prefix-free code with minimum total length.** His own method (and Shannon's) worked top-down — split the symbols into two roughly-equal-frequency halves, assign `0` to one side and `1` to the other, recurse. Intuitive, and *not always optimal* — which is why the problem was still open in 1951.

Huffman's insight flipped the direction: don't split from the top — **merge from the bottom.** The two rarest symbols must get the two longest codes in any optimal solution, so make them siblings, glue them into one combined symbol whose frequency is their sum, and repeat until one node remains. That node is the root of a code tree, and the codes read off its branches are provably unbeatable.

Watch it run on a string worth memorizing — `ABRACADABRA`, 11 letters:

```
frequencies:   A:5   B:2   R:2   C:1   D:1

step 1  merge the two rarest:  C:1 + D:1  →  (CD):2
        pool:  A:5   B:2   R:2   (CD):2

step 2  merge the two rarest:  R:2 + (CD):2  →  (RCD):4
        pool:  A:5   B:2   (RCD):4

step 3  merge:  B:2 + (RCD):4  →  (BRCD):6
        pool:  A:5   (BRCD):6

step 4  merge:  A:5 + (BRCD):6  →  root:11    ✓ all 11 letters accounted for
```

Draw the merges as a tree, label every left branch `0` and every right branch `1`, and each letter's code is the path from root to leaf:

<Diagram name="compression/huffman_tree" height={410} width={720} alt="A Huffman tree for the word ABRACADABRA, drawn with the root at the top labeled 11. Every left edge is labeled 0 and every right edge is labeled 1. The root's left child is the leaf A with count 5; its right child is an internal node with count 6. That node's left child is the leaf B with count 2, and its right child is an internal node with count 4. That node's left child is the leaf R with count 2, and its right child is an internal node with count 2, whose children are the leaves C with count 1 and D with count 1. Under each leaf its final code appears in accent color: A is 0, B is 10, R is 110, C is 1110, D is 1111. A panel on the right lists the codes with their costs — A 0 for 1 bit times 5 uses, B 10 for 2 bits times 2 uses, R 110 for 3 bits times 2, C 1110 for 4 bits times 1, D 1111 for 4 bits times 1 — summing to a 23 bits total highlighted in accent color. The rarest letters sit deepest in the tree; the most common letter sits one step from the root.">

Rare letters sink deep and pay long codes; the champion `A` sits one branch from the root and pays a single bit. Depth *is* price.

</Diagram>

Tally the bill:

```
A = 0       1 bit  × 5 uses  =  5 bits
B = 10      2 bits × 2       =  4
R = 110     3 bits × 2       =  6
C = 1110    4 bits × 1       =  4
D = 1111    4 bits × 1       =  4
                      total  = 23 bits

ASCII price: 11 letters × 8 = 88 bits  →  Huffman is 3.8× smaller ✓
```

And the prefix-free property came out automatically: letters live only at the *leaves*, and you can't pass through one leaf on the way to another — so no code can begin another. Decoding is just walking: start at the root, follow each bit down, and whenever you land on a leaf, emit its letter and jump back to the root. Here is `ABRACADABRA` encoded — 23 bits, no separators, no ambiguity:

```
stream:  0 10 110 0 1110 0 1111 0 10 110 0     (shown spaced; on disk it's
         01011001110011110101100                one unbroken 23-bit river)

decode:  0            lands on a leaf  →  A
         1,10         lands on a leaf  →  B
         1,11,110     lands on a leaf  →  R
         0                             →  A
         1,11,111,1110                 →  C
         ...and so on...               →  ABRACADABRA  ✓
```

<Note>

Run the merges yourself and you might build a *different* tree — in step 2 you could just as legally merge `B` with `R`. Ties allow several valid trees with different codes, but every one totals exactly 23 bits. Huffman's guarantee is about the *cost*, not the shape.

</Note>

This little machine is among the most-executed algorithms in computing history. The fax standard's "short codes for common run-lengths" is Huffman coding. JPEG's final stage — packing the quantized survivors of your 36 MB photo into 3 MB — is Huffman coding, which closes Lesson 7's mystery officially. MP3 ends with it; DEFLATE, two sections ahead, ends with it too. And it's why the knitting pattern spells its two most common stitches `k` and `p` while rare maneuvers get long names: the notation priced by frequency, a century early.

<DeepDive>

#### Why bottom-up beats top-down {/*why-bottom-up-beats-top-down*/}

A concrete case where the professor's method loses to the student's. Five symbols, frequencies `A:15  B:7  C:6  D:6  E:5` (39 total). Shannon–Fano splits top-down into balanced halves — `{A,B}` (22) versus `{C,D,E}` (17) — then recurses, yielding `A=00, B=01, C=10, D=110, E=111`. Cost: 15×2 + 7×2 + 6×2 + 6×3 + 5×3 = **89 bits**. Huffman merges bottom-up — `E+D`, then `C+B`, then the pair of pairs, `A` joining last — a lopsided tree where `A=0` pays one bit: 15×1 + 7×3 + 6×3 + 6×3 + 5×3 = **87 bits**. Two bits on 39 symbols sounds petty; at gigabyte scale it's megabytes, and more importantly it's the gap between "pretty good" and *provably unbeatable*.

The deep reason: a top-down splitter commits to its most consequential cut while knowing the least — it decides `A`'s fate before seeing the structure below. The bottom-up merger takes its risks on the *cheapest* symbols, where mistakes cost least; by the time it reaches the expensive ones, the right choice is forced. Huffman later said he might never have attempted the problem had he known his professor was struggling with it — one of history's better arguments for not telling students what's supposed to be impossible.

</DeepDive>

## LZ77: never say it twice {/*lz77-never-say-it-twice*/}

Huffman coding has a blind spot: feed it `ABABABAB...` a thousand letters long. The frequency table says 50% `A`, 50% `B`; Huffman assigns one bit each — an 8× win over ASCII — and stops, satisfied. But *you* can describe that string in a dozen characters: "AB, five hundred times." Frequencies are amnesiac — they count symbols but forget their *order* — so a Huffman coder can't see that `the ` keeps arriving as a unit, or that most data quotes itself constantly.

In May 1977, Abraham Lempel and Jacob Ziv of the Technion in Haifa published the fix — *A Universal Algorithm for Sequential Data Compression*, known forever after as **LZ77** — built on one insolent idea: **the best dictionary for a text is the text itself.** The compressor keeps a **window** of the bytes it has already emitted, and at each step asks: *do the next bytes already appear in the window?* If yes, don't repeat them — emit a **back-reference** `(distance, length)`: "go back *distance* bytes, copy *length*." If no, emit the byte as a plain **literal** and move on.

Watch it work on six famous words:

```
position:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
input:     t  o  ␣  b  e  ␣  o  r  ␣  n  o  t  ␣  t  o  ␣  b  e

cursor reaches 13. next bytes:  t o ␣ b e
search the window:              positions 0–4 hold  t o ␣ b e   ← match!

emit:  (back 13, copy 5)

output:  t o ␣ b e ␣ o r ␣ n o t ␣ (13,5)     13 literals + 1 copy token ✓
```

<Diagram name="compression/lz77_window" height={250} width={720} alt="The eighteen characters of the phrase 'to be or not to be' drawn as a row of monospace cells, with spaces shown as small middle dots, and position numbers 0 and 13 marked under the corresponding cells. The first five cells, holding 't o space b e', are outlined in accent color and labeled 'already written — the window'. The last five cells, also 't o space b e', are filled with translucent accent color and labeled 'being encoded'. A curved arrow arcs from the last five cells back to the first five, labeled 'go back 13, copy 5'. Below the row, the emitted output is shown: thirteen literal characters followed by a single accent-colored token (13,5).">

The second "to be" is never stored — only directions to the first one. Repetition becomes *coordinates*.

</Diagram>

Cost check, at roughly DEFLATE's pricing — a literal ≈ 1 byte, a copy token ≈ 3: the phrase drops from 18 bytes to 16. Modest, because the phrase is tiny; the economics explode with scale. In real prose, every repeated word and sentence pattern after its first appearance collapses to one small token — which is how this module's own lessons will shrink 61% a few paragraphs from now, and why *templated* data (HTML, JSON, logs — the same tags thousands of times) compresses savagely well.

Now the detail separating people who've heard of LZ77 from people who understand it. What does `(distance 2, length 3)` mean when only *two* bytes exist so far — a copy longer than the distance it reaches back? It's legal, and it's the algorithm's best trick. The rule: copy **one byte at a time**, and by the time the copy needs bytes that didn't exist when the token started, the token itself has created them:

```
tokens:  b   a   n   (2,3)

decode:  b                        → "b"
         a                        → "ba"
         n                        → "ban"
         (2,3): copy 3 bytes, each taken 2 positions back
           step 1: 2 back = 'a'   → "bana"
           step 2: 2 back = 'n'   → "banan"
           step 3: 2 back = 'a'   ← a byte this same token produced!
                                  → "banana"  ✓
```

The token quotes *itself* mid-sentence. And notice what `(distance 1, length N)` means: "repeat the previous byte N times" — which is run-length encoding, exactly. RLE was never a rival algorithm; it's the special case of LZ77 where the repetition happens to be adjacent. The knitting pattern knew this too: `k12` is a distance-1 copy, and *"repeat rows 3–8 five more times"* is a full back-reference — distance and length, written for hands instead of CPUs.

Enough reading — *cause* the phenomenon. The toy below runs a real (small-windowed) LZ77 on whatever you type: literals print as plain characters, and every copy token appears as a blue `↩distance,length` chip. Repeat yourself and watch the tokens eat your text; then press **random noise** and watch the algorithm starve:

<Sandpack>

```js
import { useState } from 'react';

const CHANT =
  'the drum goes boom, the drum goes boom, the drum goes boom, ' +
  'and the crowd goes wild, and the crowd goes wild.';

function compress(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    let len = 0, dist = 0;
    for (let j = Math.max(0, i - 255); j < i; j++) {
      let k = 0;
      while (k < 255 && i + k < text.length && text[j + k] === text[i + k]) k++;
      if (k > len) { len = k; dist = i - j; }
    }
    if (len >= 4) { tokens.push([dist, len]); i += len; }
    else { tokens.push(text[i]); i += 1; }
  }
  return tokens;
}

export default function LZLab() {
  const [text, setText] = useState(CHANT);
  const tokens = compress(text);
  const copies = tokens.filter((t) => typeof t !== 'string').length;
  const packed = tokens.length - copies + copies * 3;
  const saved = text.length - packed;
  const noise = () =>
    setText(Array.from({ length: 100 }, () =>
      'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    ).join(''));
  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <p>Type — repeat yourself and watch copy tokens eat the text:</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        rows={3} style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }} />
      <div style={{ margin: '8px 0' }}>
        <button onClick={() => setText(CHANT)} style={{ marginRight: 8 }}>
          chant
        </button>
        <button onClick={noise}>random noise</button>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 1.9,
        wordBreak: 'break-all' }}>
        {tokens.map((t, i) => typeof t === 'string' ? (
          <span key={i}>{t === ' ' ? '\u00B7' : t}</span>
        ) : (
          <span key={i} style={{ background: '#087ea4', color: 'white',
            borderRadius: 6, padding: '1px 6px', margin: '0 2px',
            fontSize: 12, whiteSpace: 'nowrap' }}>
            {'\u21A9'}{t[0]},{t[1]}
          </span>
        ))}
      </div>
      <p style={{ fontFamily: 'monospace' }}>
        {text.length} bytes {'\u2192'} {packed} bytes{' '}
        <span style={{ color: '#087ea4' }}>
          (saved {saved}{saved === 0 ? ' — nothing repeats' : ''})
        </span>
      </p>
      <p style={{ fontSize: 13, color: '#888' }}>
        Literals cost 1 byte; each {'\u21A9'}distance,length token is charged 3,
        and is only emitted when the match is long enough to pay for itself —
        real DEFLATE plays by the same rule.
      </p>
    </div>
  );
}
```

</Sandpack>

<DeepDive>

#### The GIF tax: when an algorithm gets a lawyer {/*the-gif-tax*/}

Lempel and Ziv published a sequel in 1978 (LZ78 — the dictionary as an explicit table), and in 1984 Terry Welch of Sperry streamlined it into **LZW**: fast, elegant, and — crucially — *patented*, filed June 20, 1983. CompuServe's engineers, assuming the published algorithm was free, built the GIF image format on LZW in 1987, and the young web adopted GIF everywhere. Then, in the last days of December 1994, Unisys (Sperry's successor) and CompuServe announced that software reading or writing GIFs owed license fees. The developer world detonated — the episode is remembered as the *GIF tax* — producing a protest holiday, **Burn All GIFs Day** (November 5, 1999), and something more durable: a deliberately patent-free image format, finished in 1996, built on DEFLATE instead of LZW. Its name is **PNG**, and every PNG you've ever seen exists because of a licensing letter. gzip has the same origin: Jean-loup Gailly and Mark Adler wrote it in 1992 to replace the LZW-based Unix `compress`. The patent expired June 20, 2003 — twenty years to the day after filing — and engineers threw parties. The moral belongs in every engineer's head: **algorithm choice is sometimes a legal decision**, and formats outlive the lawsuits that shaped them.

</DeepDive>

## DEFLATE: how a ZIP is actually built {/*deflate-how-a-zip-is-actually-built*/}

Look at what LZ77 emits: a stream of literals and copy tokens. Are those symbols equally common? Not remotely — literals are dominated by `e`, `t`, and space; short match lengths vastly outnumber long ones; some distances recur constantly. A stream with skewed frequencies... you own an algorithm for that. Feed LZ77's output *into Huffman coding* and both kinds of redundancy — repetition and frequency — get squeezed in one pipeline. That pipeline is **DEFLATE**.

<Diagram name="compression/deflate_pipeline" height={250} width={720} alt="A three-stage pipeline drawn left to right. Stage one is a box holding the raw monospace text 'to be or not to be', labeled 'raw bytes'. An arrow labeled 'LZ77 — find repeats' leads to stage two, a box holding the token stream: the literals t, o, space, b, e, space, o, r, space, n, o, t, space followed by an accent-colored copy token (13,5), labeled 'literals + copy tokens'. A second arrow labeled 'Huffman — shorten symbols' leads to stage three, a box holding a short run of bits, labeled 'DEFLATE stream'. Attached to the third box is a small tag reading 'code tables travel in the header'.">

DEFLATE = LZ77 for the *repetition*, then Huffman for the *frequencies* — with the custom code tables shipped inside each block's header, so the file carries its own decoder ring.

</Diagram>

That last detail is this module's oldest motif in new clothes. Huffman tables are custom-built per block from the actual frequencies, so the compressed bits are meaningless without them — and DEFLATE writes the tables into the block header. The private contract travels with the bytes it governs, like the legend at the top of a knitting pattern defining `k` and `p`. Bytes have no meaning; contracts do — and a compressed file is the first format you've met that carries a bespoke contract *inside itself*.

Two spec numbers to keep (RFC 1951): the window is **32,768 bytes** — copies reach back at most 32 KiB — and one copy token covers **3 to 258 bytes**. Those limits set DEFLATE's ceiling: in the best case ~2 bits of token command a 258-byte copy, capping the ratio at **1032:1**. Check it against our opening experiment — a million zeros became 1,003 bytes, ratio ≈ 997:1, brushing the ceiling. It holds at a billion, too:

<TerminalBlock>

head -c 1000000000 /dev/zero | gzip > gig.gz && gzip -l gig.gz

</TerminalBlock>

<TerminalBlock>

         compressed        uncompressed  ratio uncompressed_name
             970501          1000000000  99.9% gig

</TerminalBlock>

A gigabyte of zeros: 970,501 bytes — 1030:1. Remember the number 1032; the last section is about what happens when someone builds *past* it.

Now the history — DEFLATE has a human story. Through the late 1980s the archive format of the online world was ARC, and a Milwaukee programmer named **Phil Katz** wrote a faster clone, PKARC. In 1988 ARC's creators, System Enhancement Associates, sued — the clone was a little *too* faithful, down to identical spelling errors in the comments — and the settlement barred Katz from ARC-compatible software after January 1989. Cornered, Katz shipped **PKZIP (1989)** with a brand-new format of his own within weeks, then made the move that decided the next forty years: he published the full spec in a file called `APPNOTE.TXT` and declared the format **free for anyone to implement, forever**. The open format crushed the proprietary one in months. PKZIP 2 (1993) introduced DEFLATE itself, later pinned down as RFC 1951 (1996) — but Katz's life collapsed even as his format conquered; he died on April 14, 2000, aged 37. His monogram did not. The ZIP magic number — its contract sticker, Lesson 1 style, cousin to Java's `CAFEBABE` — is `0x50 0x4B`: in ASCII, **PK**. Check any ZIP you own:

<TerminalBlock>

xxd -l 4 lessons.zip

</TerminalBlock>

<TerminalBlock>

00000000: 504b 0304                                PK..

</TerminalBlock>

Phil Katz's initials are written onto humanity's disks billions of times a day — because "ZIP" means far more than `.zip`. A `.docx` is a ZIP of XML files; so are `.xlsx`, `.pptx`, `.jar`, `.apk`, and `.epub` — rename one to `.zip` and it unzips. And DEFLATE escaped the container entirely: **gzip** (1992) wrapped it for Unix, **zlib** (1995, Gailly and Adler again) made it a library, and today it compresses most web pages in transit (`Content-Encoding: gzip`), every PNG's pixels, PDF streams, and every object in every git repository. You have run DEFLATE thousands of times today without once asking to.

Notice who rides along: gzip's trailer carries a CRC-32 of the uncompressed data, and ZIP records one per file — Lesson 8's machinery guarding this lesson's output, because a single flipped bit in compressed data doesn't corrupt one byte, it derails every copy token downstream. Watch both lessons in one command: here are this module's eight English lessons, concatenated into `lessons.txt` and zipped —

<TerminalBlock>

zip -q lessons.zip lessons.txt && unzip -v lessons.zip

</TerminalBlock>

<TerminalBlock>

 Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
--------  ------  ------- ---- ---------- ----- --------  ----
  232654  Defl:N    90684  61% 2026-07-21 13:34 d3e18b84  lessons.txt

</TerminalBlock>

The whole lesson in one row: `Defl:N` (a method you now understand), **61% of honest English prose evaporated** — 232,654 → 90,684 bytes, every `the` and every repeated sentence pattern collapsed into back-references and short codes — and the CRC-32 fingerprint standing guard. No terminal handy? Your browser ships DEFLATE too:

```js
const bytes = new TextEncoder().encode('to be or not to be, '.repeat(500));
const packed = await new Response(
  new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
).arrayBuffer();
console.log(`${bytes.length} bytes in, ${packed.byteLength} bytes out`);
```

<ConsoleBlock level="info">

10000 bytes in, 80 bytes out

</ConsoleBlock>

Ten thousand bytes of Hamlet-on-repeat: 80 bytes, a 125:1 ratio — and you can hear both machines working: LZ77 reducing five hundred repetitions to a chain of copy tokens, Huffman pricing what's left.

## The wall: why you can't compress everything {/*the-wall-why-you-cant-compress-everything*/}

Here a dangerous thought appears, the same one that has occurred to every beginner since 1989: *if ZIP made it smaller once, zip the ZIP — and keep going, down to nothing.* The thought dies on a counting argument short enough to fit in a diagram and final enough that no future algorithm will ever escape it.

Count the 3-bit files: 2³ = 8 of them. Now count all *strictly shorter* files — every possible output a compressor could shrink them to: one empty file, two 1-bit files, four 2-bit files. Total: 1 + 2 + 4 = **7**. You know that sum — Lesson 2's identity, 2ⁿ − 1, coming up one short *again*:

<Diagram name="compression/pigeonhole" height={370} width={720} alt="Two columns of monospace boxes. The left column, headed 'every 3-bit file — 8 of them', lists all eight strings 000, 001, 010, 011, 100, 101, 110, 111. The right column, headed 'every shorter file — only 7', lists the empty string shown as a pair of quotes, then 0, 1, 00, 01, 10, 11. Seven muted arrows connect the first seven left boxes to the seven right boxes one-to-one. The eighth left box, 111, is tinted in danger color, and its arrow leads to a dashed empty slot marked with a danger-colored question mark and the label 'no shorter name left'. A caption below reads: 1 plus 2 plus 4 equals 2 cubed minus 1.">

Eight originals, seven possible shorter versions. Some original *must* go without — or two originals share one compressed file, and then no decompressor can tell them apart.

</Diagram>

That's the whole proof, and it scales: for any length n there are 2ⁿ files but only 2ⁿ − 1 shorter descriptions. So **no lossless algorithm can shrink every input** — any compressor that makes some files smaller *must* make others bigger; the arithmetic has nowhere else to go. gzip's +173 bytes on random data wasn't a flaw to engineer away; it was the counting argument collecting its fee.

What separates the shrinkable from the unshrinkable is **entropy** — the bits of genuine surprise. Redundant data sits far above its entropy; random data *is* its entropy, nothing left to remove. Shannon measured English itself in 1951, by having people guess text letter-by-letter: roughly **one bit of information per letter** (his bounds: 0.6 to 1.3). Stored as 8-bit ASCII, English is therefore almost 90% redundancy in principle — general-purpose tools like the one that squeezed our lessons 2.6× stop far short of that, trading ratio for speed.

The wall has a corollary that will save you real embarrassment: **compressed output looks random.** If any pattern survived in gzip's output, gzip would have used it — so what leaves the pipe is dense, patternless, at-entropy. Compressed files are themselves incompressible; the snake cannot eat its own tail:

<TerminalBlock>

wc -c lessons.txt && gzip -k lessons.txt && wc -c lessons.txt.gz && gzip -c lessons.txt.gz > twice.gz && wc -c twice.gz

</TerminalBlock>

<TerminalBlock>

232654 lessons.txt
90714 lessons.txt.gz
90762 twice.gz

</TerminalBlock>

First pass: 61% gone. Second pass: **48 bytes gained.** The same fate awaits any already-compressed input — JPEG, MP3, MP4, PNG: Lesson 7's formats already discarded and packed, so their bytes arrive at your ZIP pre-densified, with nothing left to give.

<Pitfall>

**"Compression made it 10× smaller — so running it twice will make it 100× smaller."**

It won't; the second pass makes it *bigger* (measured above: +48 bytes), because the first pass already removed the predictability, leaving effectively random output. The same logic explains the most common compression disappointment in industry: zipping a folder of photos and videos and gaining ~0%. Those files are already compressed; ZIP can only add overhead. Compress what's still redundant — text, logs, JSON, CSV, databases — and *store* what isn't.

</Pitfall>

One last turn of the idea, and it's the doorway to the next lesson: incompressibility isn't just a nuisance property of random data — it's arguably the *definition* of randomness. A sequence with an exploitable pattern isn't fully random; a sequence with no exploitable pattern cannot be compressed. gzip, it turns out, is a crude randomness detector. Hold that thought for one more section.

## When 42 kilobytes attack {/*when-42-kilobytes-attack*/}

Everything so far treats small files as the goal. Now invert the perspective, the way an attacker would: a compressed file is not data — it's **instructions for producing data**, and a short instruction can command an enormous output. "Go back 1, copy 258" is ~2 bits that create 258 bytes. What's the worst that scaling this can do?

There is a famous answer, circulating since before June 2001, called **42.zip**. It is 42 kilobytes — smaller than this page's HTML. Inside are 16 ZIP files, each containing 16 ZIP files, five layers deep; at the bottom sit 16⁵ = 1,048,576 archives, each unpacking to a file of **4,294,967,295 bytes**. Recognize the number? It's 2³² − 1 — even a weapon respects Lesson 2's ceilings; that's the largest size a 32-bit field can express. Multiplied out, 42 KB detonates into roughly **4.5 petabytes** — about 4,500 one-terabyte drives — a ratio of one hundred billion to one.

Didn't we just prove DEFLATE caps at 1032:1? Each *layer* does. Nesting multiplies layers — 1000× of 1000× of 1000×, exponential growth, Lesson 2's chessboard playing offense. And in 2019, researcher David Fifield showed nesting isn't even required: by *overlapping* entries so that up to a million directory records point into one shared block of compressed bytes, he built a flat archive that turns 10 MB into 281 TB within the classic ZIP format — over 28,000,000:1 — and 46 MB into 4.5 PB using the format's 64-bit extension. One round of decompression; no recursion for a scanner to notice.

Who gets hurt? Historically, the very tools built to protect you: antivirus scanners *must* look inside archives, so a mail gateway that innocently inflates attachments can be handed 42 KB and asked to materialize 4.5 PB. The same trap awaits anything that auto-unpacks user uploads — thumbnailers, import pipelines, CI systems, web servers accepting compressed request bodies.

<Pitfall>

**"The upload is 42 KB — tiny, safe to process."**

Compressed size proves nothing about output size, and the size fields *declared inside* an archive are attacker-controlled bytes, not truth — bytes have no meaning, and contracts can lie. The rule for decompressing anything untrusted: treat it as running someone else's instructions — because that is literally what it is — and give those instructions a budget. Enforce an absolute cap on bytes written, a maximum expansion ratio, and a nesting-depth limit, streaming the output so you can stop mid-explosion. Every serious decompression library offers these limits; incidents happen where nobody turns them on.

</Pitfall>

There's a pleasing symmetry to end on. Lesson 8 taught you the danger of *silent wrong data*; this lesson adds the complement — data that is perfectly correct and arrives as a bomb. Redundancy removed is space saved *and* leverage granted. Engineering, as usual, is choosing which side of the trade to stand on.

<Recap>

- Compression removes **redundancy** — the predictable part of data, not the data itself. A million zero bytes gzip to 1,003 bytes; a million random bytes come back 173 bytes *bigger*.
- **Run-length encoding** replaces runs with counts: 3.5× on a fax line, but it nearly *doubles* "Hello, world!" — adjacent repetition is rare, so the real targets are **frequency** and **phrase-level repetition**.
- **Huffman coding** builds the provably optimal **prefix-free** code bottom-up, merging the two rarest symbols until one tree remains: common symbols get short codes, no separators are needed, and `ABRACADABRA` drops from 88 bits to 23. Born as a term paper in 1951, it finishes the job inside JPEG, MP3, fax, and DEFLATE.
- **LZ77** (1977) replaces repeats with **(distance, length)** back-references into a sliding window; copies may overlap their own output (length > distance), which makes RLE a mere special case. In DEFLATE the window is 32,768 bytes and one token covers 3–258.
- **DEFLATE = LZ77 + Huffman**, with the custom code tables shipped inside each block — the contract travels with the data. It powers ZIP (Phil Katz, 1989 — magic bytes `50 4B`, "PK"), gzip (1992), PNG (1996), and `.docx`/`.jar`/`.apk`; the CRC-32 of Lesson 8 rides in every archive. Single-stream ceiling: **1032:1**.
- **No universal shrinker exists**: 2ⁿ files, only 2ⁿ − 1 shorter names — whatever shrinks something must grow something else. Entropy is the floor; compressing twice adds bytes (measured: +48); already-compressed media won't shrink.
- Compressed data is at-entropy and **looks random** — and small archives can detonate: 42 KB → 4.5 PB (42.zip); 46 MB → 4.5 PB with no nesting at all (2019). Decompress untrusted input only with an output cap, a ratio cap, and a depth cap.

</Recap>

<Challenges>

#### Compress the log line {/*compress-the-log-line*/}

A 100-character status line uses five symbols with these frequencies: `0` ×50, `1` ×20, `␣` (space) ×15, `E` ×10, `R` ×5. Build the Huffman tree by hand (show your merges), write out a valid code, and compute the total bits. Compare against a fixed-width code (how many bits per symbol would that need?) and against ASCII.

<Hint>

Merge the two rarest, put the sum back in the pool, repeat until one node remains. For the fixed-width comparison: how many bits do 5 distinct symbols require? Lesson 1's ⌈log₂ n⌉ pattern.

</Hint>

<Solution>

Merges (one valid order — ties permit others; the total won't change):

```
pool: 0:50  1:20  ␣:15  E:10  R:5

merge R:5 + E:10      →  (RE):15      pool: 0:50  1:20  ␣:15  (RE):15
merge ␣:15 + (RE):15  →  (␣RE):30     pool: 0:50  1:20  (␣RE):30
merge 1:20 + (␣RE):30 →  (1␣RE):50    pool: 0:50  (1␣RE):50
merge                 →  root:100  ✓
```

Reading codes off the tree: `0` = `0`, `1` = `10`, `␣` = `110`, `E` = `1110`, `R` = `1111`.

```
0: 1 bit  × 50 = 50      ␣: 3 × 15 = 45      R: 4 × 5 = 20
1: 2 bits × 20 = 40      E: 4 × 10 = 40
                                      total = 195 bits  ✓
```

Fixed-width needs ⌈log₂ 5⌉ = 3 bits per symbol → 300 bits; ASCII spends 800. Huffman: **195 bits** — 1.95 bits per symbol, 35% under fixed-width, 4.1× under ASCII. The skew did the work: one symbol carrying half the traffic at 1 bit pays for the rare symbols' long codes many times over.

</Solution>

#### Decode with no separators {/*decode-with-no-separators*/}

Using this lesson's `ABRACADABRA` table (`A=0, B=10, R=110, C=1110, D=1111`), decode the 12-bit stream `111001101111`. Then explain in a sentence or two *why* no separators were needed — and what specifically would go wrong if `A=0` and `C=01` were both in the table.

<Solution>

Walk the bits, restarting at the root after every leaf:

```
1,11,111,1110  →  C
0              →  A
1,11,110       →  R
1,11,111,1111  →  D        result: CARD ✓  (12 bits, zero ambiguity)
```

No separators are needed because the code is **prefix-free**: no codeword begins another, so the instant your bits match a codeword it *must* be complete. If `A=0` and `C=01` coexisted, then after reading `0` you couldn't know whether to emit `A` or wait for a possible `C` — the stream `01` would decode two ways, and one wrong guess desynchronizes everything after it. Prefix-freedom is what lets each codeword announce its own ending — the phone-country-code property.

</Solution>

#### The token that copies itself {/*the-token-that-copies-itself*/}

Part 1: decode the LZ77 token stream `n, a, (2,4)` step by step, one byte at a time. Part 2: give a 3-token LZ77 encoding of the 10-character string `ababababab`. Part 3: state in one sentence why a copy with length *greater than* distance is legal rather than a bug.

<Solution>

Part 1 — the copy source slides forward into bytes the token itself wrote:

```
n                       → "n"
a                       → "na"
(2,4): copy 4, each from 2 back
  'n' → "nan"    'a' → "nana"    'n' → "nanan"    'a' → "nanana"  ✓
```

Part 2: `a`, `b`, `(2,8)` — two literals, then "go back 2, copy 8", which regenerates `abababab` and completes the 10 characters. ✓

Part 3: it's legal because the decoder copies **one byte at a time**, so by the moment the copy reaches past the original data, the needed bytes have already been produced by the earlier steps of the same copy — the token consumes its own output, which is also exactly how LZ77 swallows RLE as the special case distance = 1.

</Solution>

#### The PR that zips JPEGs {/*the-pr-that-zips-jpegs*/}

Transfer task. A teammate opens a pull request titled *"Cut storage costs: compress user media."* The nightly job ZIPs every uploaded `.jpg` and `.mp4`; the description admits the measured saving is **0.3%** and proposes fixing that by "running compression twice." A second detail catches your eye in the diff: the same service *auto-unzips* user-uploaded archives to generate thumbnails — with no limits of any kind. Write the code-review comment: explain both problems precisely, propose what to do instead, and back every claim with a number from this lesson.

<Solution>

Sample review comment:

*"Requesting changes — two issues, one wasteful and one dangerous. (1) The 0.3% isn't a bug to fix; it's the expected result. JPEG and MP4 are already-compressed formats (lossy discard, then entropy coding — the same Huffman machinery ZIP uses), so their bytes arrive at maximum density; lossless compression can't shrink at-entropy data, only add container overhead. Running it twice goes backward: a second pass measurably grows the file (90,714 bytes of gzip re-gzips to 90,762 — the counting argument guarantees some inputs must grow, and compressed data is exactly that input). Recommend storing media as-is and pointing the job at what actually is redundant — our logs, JSON, and exports, where 61% is a realistic floor for English-like text and templated data does better. (2) Blocking: the thumbnailer decompresses untrusted uploads with no limits. Compressed size proves nothing — 42.zip is 42 KB and expands to ~4.5 PB, and modern non-recursive bombs hit 28,000,000:1 in a single layer, so a depth check alone doesn't save us. Please add an absolute output cap, a maximum expansion ratio, and a nesting-depth limit to the extraction path, streaming so we can abort mid-inflate — and verify each file's CRC-32 after extraction while we're in there."* ✓

The transferable pattern: compression questions in review reduce to two checks — *is the input still redundant?* (if not, don't compress) and *is the input trusted?* (if not, budget the decompression).

</Solution>

</Challenges>

<LearnMore title="Randomness: PRNG, Seeds, Entropy" path="/learn/faza-0/modul-0-1/randomness">

gzip refused to shrink `/dev/urandom` by a single byte — and this lesson ended by suggesting that *incompressible* is about the best definition of *random* anyone has. But look at the paradox that creates: a CPU is a perfectly deterministic machine, every output dictated by its inputs — so where could a computer possibly get randomness *from*? Next lesson: the generators that fake it, the seeds that replay it, why "random" numbers repeat if you let them, and Shannon's entropy returning — this time as something your operating system literally harvests and spends.

</LearnMore>
