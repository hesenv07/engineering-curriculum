---
title: 'Compression: how ZIP works (Huffman, LZ)'
---

<Intro>

In the fall of 1951, MIT graduate student David Huffman was taking a course on information theory taught by Robert Fano. Fano gave the class a choice: solve one hard problem — find the most efficient way to assign binary codes to a set of symbols — or take the final exam. Huffman picked the problem. He worked on it for months, got nowhere, and was about to throw out his notes and study for the exam instead. Then, almost by accident, he found a method so simple it embarrassed the one Fano himself had published. Fano's scheme built codes top-down; Huffman's built them bottom-up, and it was providably optimal. That method is still the "H" you half-recognize in half the compressed files on your computer.

</Intro>

<YouWillLearn>

- Why fixed-length codes waste space, and what a variable-length code buys you instead
- How to build a Huffman tree by hand and read the optimal code off its branches
- How LZ77 finds and replaces repeated text with a "go back and copy" instruction
- Why DEFLATE — the format inside every ZIP, gzip, and PNG file — is just LZ77 and Huffman working in sequence
- Why some files can't be compressed at all, and what that limit tells you about information itself

</YouWillLearn>

## Redundancy: the enemy that becomes the target {/*redundancy-the-enemy-that-becomes-the-target*/}

Two lessons ago you learned that a CRC-32 checksum works by deliberately adding redundant bits — bits that carry no new information, only a mathematical fingerprint of the bits that came before them. That redundancy is a feature. It's how [Lesson 8](/learn/faza-0/modul-0-1/checksum-crc) let a receiver detect damage: if the fingerprint doesn't match the data, something changed in transit.

This lesson runs the same idea in reverse. Ordinary text, images, and audio are also full of redundancy — but this time it's redundancy nobody asked for. English text reuses the same handful of letters over and over ("e" appears about 8 times more often than "z"). A photograph's sky is thousands of nearly-identical blue pixels in a row. None of that repetition is protecting you from damage; it's just wasted bits, encoded the same expensive way every time. Compression is the discipline of finding that waste and spending fewer bits on it — without losing any of the information those bits represented.

That "without losing any information" clause matters. This lesson is entirely about **lossless compression**: schemes that reconstruct the original data exactly, bit for bit. JPEG and MP3 use **lossy compression** instead — they throw away detail a human eye or ear won't miss, which is a different (and much fuzzier) trade-off for a later lesson. ZIP, gzip, and PNG — the subjects of this lesson — never throw anything away. They just say the same thing in fewer bits.

In 1948, Claude Shannon — the same Shannon whose 1948 paper gave us the word "bit" in [Lesson 1](/learn/faza-0/modul-0-1/bits-and-bytes) — estimated that ordinary English text carries only about 1 bit of actual information per character, even though ASCII spends a full 8 bits encoding each one. If Shannon's estimate is right, English text stored as ASCII is roughly 8 times larger than it needs to be. Compression is the machinery that closes that gap.

<Note>

"No new information" doesn't mean "no pattern." A repeated pattern is exactly what carries no *new* information the second time it appears — you already know what's coming. Compression algorithms are, in a real sense, pattern detectors: they get paid in bits saved for every repetition they notice.

</Note>

## Fixed-length codes waste space {/*fixed-length-codes-waste-space*/}

Suppose you need to encode the word **banana** — six letters, but only three distinct symbols: `a` (appears 3 times), `n` (2 times), `b` (1 time). The obvious approach, the one [Lesson 2](/learn/faza-0/modul-0-1/binary-number-system) trained you to reach for, is a fixed-length code: since there are 3 symbols, you need at least 2 bits per symbol (2 bits can distinguish up to 4 values).

```
a = 00
n = 01
b = 10

banana = 00 01 00 01 00 01... wait — let's write it out per letter:
b a n a n a
10 00 01 00 01 00  →  6 letters × 2 bits = 12 bits
```

Twelve bits, no matter which letter you're spending them on. That's the flaw: `a` shows up three times as often as `b`, but costs exactly the same. A fixed-length code can't tell the difference between a common symbol and a rare one — every slot in the code table is the same width.

This isn't a new idea, either. Samuel Morse and Alfred Vail ran into precisely this problem in 1837, over a century before Huffman. Building their telegraph code, they didn't hand out dot-dash sequences alphabetically. Vail reportedly counted the type slugs in a printer's type case to estimate how often each letter appeared in real English text, then gave the most frequent letters the shortest sequences — `E` is a single dot, `T` is a single dash, while rare letters like `Q` and `Z` got four symbols each. Morse code is a variable-length code, built on exactly the insight a fixed-length binary code throws away: **spend fewer symbols on what appears more often.**

<Pitfall>

The obvious next idea — "just make common letters shorter, like Morse code did" — runs into a problem Morse code quietly dodges: without a pause between letters, how does the receiver know where one code ends and the next begins? Morse gets away with it because operators insert a literal silence between letters. A file has no silence to insert. If `a = 0` and `n = 01`, then the bit string `001` is ambiguous — is that `a`, `a`, `n`-minus-a-bit? Or `a`, `01` = `n`? A usable variable-length code must be built so that **no code is ever a prefix of another code** — this is called a *prefix code* (or "prefix-free" code). Read a bit at a time, and the moment your accumulated bits match some symbol's code, you know — unambiguously — which symbol it was, with no separator needed. Huffman's algorithm, below, builds prefix codes automatically as a side effect of its structure.

</Pitfall>

## Huffman coding: build the optimal tree {/*huffman-coding-build-the-optimal-tree*/}

Huffman's method builds a binary tree from the bottom up. The algorithm is short enough to state in four steps:

```
1. Make one leaf node per symbol, weighted by its frequency (count).
2. Take the two lowest-weight nodes in the whole set (nodes or subtrees).
3. Merge them under a new internal node, whose weight is their sum.
4. Repeat from step 2 until only one node (the root) remains.
```

Once the tree is built, every symbol's code is just the path from the root to its leaf — `0` for every left branch, `1` for every right branch. Symbols that got merged in late (near the root) end up with short codes; symbols merged in early (far from the root, because they were rare) end up with long codes.

### Worked example 1: banana {/*worked-example-1-banana*/}

Frequencies: `a`=3, `n`=2, `b`=1.

```
Step 1 — leaves:  a(3)  n(2)  b(1)

Step 2 — two lowest weights: n(2) and b(1). Merge them:
                     (3)
                    /    \
                  n(2)   b(1)

Step 3 — remaining nodes: a(3), merged-node(3). Merge them:
                        (6)
                       /    \
                     a(3)  (3)
                          /    \
                        n(2)   b(1)

Step 4 — one node left (the root, weight 6). Done.
```

Label left branches `0`, right branches `1`:

```
a = 0    (1 bit)
n = 10   (2 bits)
b = 11   (2 bits)
```

Now spend those codes on `banana`:

```
b  a  n  a  n  a
11 0  10 0  10 0   →  2+1+2+1+2+1 = 9 bits
```

Fixed-length cost was 12 bits. Huffman's cost is 9 bits — a 25% reduction, and every single bit still reconstructs the exact original word. ✓

<Diagram name="compression/huffman_tree" height={320} width={680} alt="A binary tree for the word banana. Three leaves: a (frequency 3), n (frequency 2), b (frequency 1). n and b merge first into an internal node of weight 3, labeled with a 0 edge to n and a 1 edge to b. That internal node then merges with leaf a (weight 3) under the root, weight 6, labeled with a 0 edge to a and a 1 edge to the internal node. Resulting codes shown beside each leaf: a = 0 (1 bit), n = 10 (2 bits), b = 11 (2 bits). Footer text: banana = 3(1) + 2(2) + 1(2) = 9 bits, versus 12 bits fixed-length.">

Rare symbols sink to the bottom of the tree and pay for it in code length; common symbols stay near the root and pay almost nothing.

</Diagram>

### Worked example 2: mississippi {/*worked-example-2-mississippi*/}

Not every input compresses this well, and it's worth seeing why. `mississippi` has frequencies `i`=4, `s`=4, `p`=2, `m`=1 — 11 letters total. A fixed-length code needs 2 bits per symbol (4 distinct symbols): `11 × 2 = 22 bits`. Running Huffman's algorithm on these frequencies produces `i=10`, `s=00` (2 bits each, since they tie for most common), and `p=11`, `m=010`... — the exact tree depends on merge-order tie-breaking, but every valid Huffman tree on this input lands on the same total: **21 bits**.

```
mississippi: 22 bits fixed  →  21 bits Huffman  →  only 4.5% smaller ✓
```

Compare that to banana's 25% savings. The difference isn't a bug in the algorithm — it's the algorithm faithfully reporting how skewed the input actually is. Banana's frequencies (3, 2, 1) are lopsided; mississippi's (4, 4, 2, 1) are closer to even. Huffman coding's payoff scales with how unevenly a source uses its symbols. A perfectly uniform source — every symbol equally likely — can't be helped by Huffman coding at all; there's no unevenness left to exploit. That's not a limitation of this one algorithm. It's the entropy ceiling, and you'll meet it properly at the end of this lesson.

<DiagramGroup>

<Diagram name="compression/fixed_code_table" height={300} width={340} alt="A table of fixed 2-bit codes for banana's three symbols: a=00, n=01, b=10, with counts a×3, n×2, b×1. Below it, a red bar 240 pixels wide labeled 12 bits total, representing 6 symbols times 2 bits each.">

Fixed-length: every symbol costs the same

</Diagram>

<Diagram name="compression/huffman_code_table" height={300} width={340} alt="A table of Huffman codes for banana's three symbols: a=0, n=10, b=11, with counts a×3, n×2, b×1 and bit-lengths 1, 2, 2. Below it, a blue bar 180 pixels wide labeled 9 bits total, 25% smaller than fixed, drawn at the same pixels-per-bit scale as the fixed-length bar for direct visual comparison.">

Huffman: common symbols cost less

</Diagram>

</DiagramGroup>

<DeepDive>

#### Why is Huffman's tree provably optimal? {/*why-is-huffmans-tree-provably-optimal*/}

Huffman's four-step recipe is a *greedy* algorithm — at every step it makes the locally cheapest choice (merge the two lowest-weight nodes available) without ever reconsidering it. Greedy algorithms usually aren't optimal; a locally cheap choice can back you into a globally expensive corner. Huffman coding is a rare, celebrated exception, and the proof rests on one observation: in any optimal prefix code, the two least-frequent symbols must be siblings at the deepest level of the tree (if they weren't, swapping them with whichever symbols *are* at the deepest level could only reduce the total cost, contradicting optimality). Once you know the two rarest symbols must be paired, merging them first and recursing on the rest is guaranteed not to lose anything. That's the whole proof, and it's why — unlike most greedy shortcuts — this one always finds the true optimum for a given symbol-frequency table.

</DeepDive>

## LZ77: hunting repeats instead of counting frequency {/*lz77-hunting-repeats-instead-of-counting-frequency*/}

Huffman coding solves one specific kind of redundancy: some symbols show up more than others. But it's blind to a different kind: the same *sequence* of symbols showing up more than once. Huffman coding, fed the string `abcabcabcabc`, just sees four `a`s, four `b`s, four `c`s — evenly split, nothing to exploit. A human glancing at it instantly sees `abc` repeated four times. LZ77, published by Abraham Lempel and Jacob Ziv in 1977, is the algorithm that gives a machine that same glance.

LZ77 slides a window across the data as it processes it, split into two parts: a **search buffer** (the data already output, still in view behind you) and a **lookahead buffer** (the data coming up next). At each position, it asks: does the upcoming text in the lookahead buffer match something already sitting in the search buffer? If so, instead of outputting those characters again, it outputs a compact token: `(distance, length)` — "go back `distance` characters from here, and copy `length` characters forward."

### Worked example: abcabcabcabc {/*worked-example-abcabcabcabc*/}

```
Input:  a b c a b c a b c a b c     (12 characters)

Position 1-3: no earlier match exists yet — output as literals: a, b, c
Position 4:   look back — "abc" starting 3 positions back matches!
              How far can the match run? Keep comparing forward:
              position 4 copies position 1 (a), position 5 copies position 2 (b),
              position 6 copies position 3 (c), position 7 copies position 4
              (which the copy itself just produced — a) ... and so on,
              all the way to the end of the input.
              → token: (distance=3, length=9)

Output: a, b, c, (3, 9)   —   4 symbols instead of 12 characters ✓
```

Notice the strange part: the match `length` (9) is larger than the `distance` (3). That's not a mistake — it's the trick that makes LZ77 powerful on repeating patterns. The decoder doesn't need the source text to already exist 9 characters back; it only needs 3 characters to exist. It copies 1 character from 3 back, appends it, then copies the *next* character from what is now 3 back again (which might be a character the copy itself just wrote), and so on — regenerating the repeating pattern one character at a time, indefinitely, from a window that never has to be as large as the run it produces.

<Diagram name="compression/lz77_window" height={380} width={720} alt="Twelve character cells spelling abcabcabcabc. The first three cells (a, b, c) are muted, labeled already output (search buffer). The remaining nine cells are highlighted, labeled matched via (distance 3, length 9). A curved arrow runs from the fourth cell back to the first cell, labeled distance 3. Footer text: Output: literals a, b, c, plus token (distance 3, length 9). 12 characters packed into 4 symbols. Smaller note: length (9) can exceed distance (3) — the copy runs past what exists and regenerates the pattern.">

A three-character window, copied past its own edge, regenerates a nine-character run.

</Diagram>

LZ77 wasn't the last word on dictionary-based compression. Lempel and Ziv published a second scheme, LZ78, in 1978, which builds an explicit dictionary of substrings instead of scanning backward through raw history. Terry Welch refined LZ78 into LZW in 1984 — the algorithm behind the classic GIF image format and early Unix `compress`. Different bookkeeping, same core idea: don't repeat what you can point to.

## DEFLATE: Huffman and LZ join forces {/*deflate-huffman-and-lz-join-forces*/}

Neither algorithm alone is the full story of a ZIP file. **DEFLATE**, designed by Phil Katz for his PKZIP tool in 1989 and later standardized as RFC 1951 in 1996, runs both passes over the same data, back to back:

```
Pass 1 (LZ77):    hunt repeated sequences, replace them with (distance, length) tokens
Pass 2 (Huffman):  take whatever remains — literal bytes and tokens alike —
                    and Huffman-code it, so the most common leftover pieces
                    cost the fewest bits
```

The two algorithms attack different kinds of redundancy, which is exactly why they're worth combining: LZ77 catches repeated *runs*, and Huffman coding catches skewed *frequencies* in whatever LZ77 didn't already collapse. DEFLATE is the format inside the `.zip` file you unzip, the `.gz` file `gzip` produces, and — perhaps surprisingly — the `.png` image sitting in your photos folder. All three are DEFLATE streams wearing different file-format wrappers.

And you've already met one piece of that wrapper. [Lesson 8](/learn/faza-0/modul-0-1/checksum-crc) showed you that a CRC-32 checksum rides along inside every ZIP entry to catch corruption. That checksum sits right next to the DEFLATE-compressed bytes in the file — compression shrinks the payload, and the checksum protects it, and neither algorithm needs to know the other exists.

<Diagram name="compression/deflate_pipeline" height={300} width={720} alt="Four boxes left to right connected by arrows: raw text, then LZ77 producing tokens, then Huffman producing short codes, then compressed bytes plus CRC-32. Caption: two passes over the same data — first hunt repeats, then squeeze what's left. Small note: RFC 1951 (1996), the format inside every .zip, .gz, and .png.">

Two passes, two different kinds of redundancy, one compressed stream.

</Diagram>

This also finally answers a question [Lesson 7](/learn/faza-0/modul-0-1/color-image-audio) left open: a 12-megapixel photo stores roughly 36 MB of raw pixel data, yet the file on your phone is closer to 3 MB. DEFLATE-family compression (JPEG uses a related but lossy pipeline) is most of that 12-times gap — the same two-pass idea from this lesson, tuned for image data instead of English text.

<Pitfall>

It's tempting to assume "compression always shrinks the file." Try it on something tiny:

<TerminalBlock>

printf 'the cat sat on the mat, the cat sat on the mat\n' > repeat.txt
wc -c repeat.txt
47 repeat.txt
gzip -k -9 repeat.txt
wc -c repeat.txt.gz
56 repeat.txt.gz

</TerminalBlock>

The gzip'd file is *bigger* — 56 bytes instead of 47. Nothing is broken; the raw DEFLATE stream itself actually shrank this text to 33 bytes (a genuine ~30% savings, since the sentence repeats). But `gzip` doesn't hand you a bare DEFLATE stream — it wraps it in a file format: a 10-byte header (magic number, flags, timestamp, OS byte) and an 8-byte footer (CRC-32 and original length), roughly 18 bytes of fixed overhead no matter how small the payload is. On a 47-byte input, that overhead outweighs the savings. The lesson isn't "compression doesn't work" — it's that every container format has a fixed cost, and that cost only pays for itself once the file is large enough to amortize it.

</Pitfall>

<Sandpack>

```js
import { useState } from 'react';

function huffmanBits(text) {
  if (text.length === 0) return 0;
  const counts = {};
  for (const ch of text) counts[ch] = (counts[ch] || 0) + 1;
  let nodes = Object.values(counts).map((freq) => ({ freq }));
  if (nodes.length === 1) return text.length;
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const [left, right] = nodes;
    nodes = nodes.slice(2);
    nodes.push({ freq: left.freq + right.freq, left, right });
  }
  let total = 0;
  const walk = (node, depth) => {
    if (node.left) {
      walk(node.left, depth + 1);
      walk(node.right, depth + 1);
    } else {
      total += node.freq * Math.max(depth, 1);
    }
  };
  walk(nodes[0], 0);
  return total;
}

export default function CompressionToy() {
  const [text, setText] = useState('banana');
  const fixedBits = text.length * 8;
  const huffBits = huffmanBits(text);
  const saved = fixedBits > 0 ? Math.round((1 - huffBits / fixedBits) * 100) : 0;

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 40))}
        style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
      />
      <p style={{ margin: '12px 0 4px' }}>
        Fixed-length (8 bits/char): <strong>{fixedBits} bits</strong>
      </p>
      <p style={{ margin: '4px 0' }}>
        Huffman-coded: <strong style={{ color: '#087ea4' }}>{huffBits} bits</strong>
      </p>
      <p style={{ margin: '4px 0', color: saved > 0 ? '#087ea4' : '#c1554d' }}>
        {saved > 0 ? `${saved}% smaller` : 'no savings on this input'}
      </p>
    </div>
  );
}
```

</Sandpack>

<DeepDive>

#### The entropy ceiling {/*the-entropy-ceiling*/}

Shannon's 1948 paper didn't just estimate the information content of English — it proved a hard limit called the **source coding theorem**: no lossless scheme, however clever, can compress a source below its **entropy** — the average number of bits truly needed per symbol, given how the source's symbols are actually distributed. Huffman coding gets remarkably close to that limit; it's provably optimal *among prefix codes assigning one code per symbol*, though schemes that code groups of symbols together (arithmetic coding, range coding) can occasionally nudge closer still. But nothing gets below the entropy — that number is a property of the source itself, not of the algorithm compressing it.

This is why re-compressing an already-compressed file rarely helps and can even hurt: a well-compressed DEFLATE stream already sits close to its entropy ceiling. Its bytes look statistically close to uniform — no symbol is favored over another, no sequence repeats — which is precisely the condition under which Huffman coding and LZ77 both find nothing left to exploit. A maximally compressed file is, in a very specific sense, indistinguishable from noise. What "looking like noise" actually means, and how a deterministic machine can manufacture something that passes for random in the first place, is the question the next lesson takes on directly.

</DeepDive>

<DeepDive>

#### The 42.zip bomb {/*the-42zip-bomb*/}

Compression's arithmetic can be weaponized. **42.zip**, a file that circulated online from around 2001 onward, is a single 42-kilobyte archive containing 16 zip files, each of which contains 16 more zip files, five layers deep. At the bottom of that nesting, the innermost files are each 4.3 GB of identical, highly repetitive data — decompressing every layer in full expands the original 42 KB into roughly 4.5 **petabytes**. Before archive tools and antivirus scanners learned to cap decompression size and nesting depth, opening or scanning a file like this could exhaust a machine's disk space and memory and cause it to crash or hang — turning DEFLATE's core strength (extreme compression of extreme repetition) into a denial-of-service payload. Modern archive utilities and mail/antivirus scanners now enforce decompression limits specifically because of files like this one.

</DeepDive>

<Recap>

- **Redundancy** is what compression removes — repeated patterns and skewed symbol frequencies that carry no new information, the mirror image of the redundancy [checksums](/learn/faza-0/modul-0-1/checksum-crc) deliberately add.
- **Fixed-length codes** spend the same number of bits on every symbol regardless of how often it appears — wasteful when frequencies are skewed.
- **Prefix codes** (no code is a prefix of another) let a decoder read variable-length codes with no separator needed.
- **Huffman coding** builds an optimal prefix code by repeatedly merging the two least-frequent nodes into a tree, bottom-up — common symbols land near the root with short codes, rare symbols sink deep with long ones.
- Huffman's savings scale with how skewed the input is: banana saved 25%, mississippi saved only 4.5%, because mississippi's letter frequencies were closer to even.
- **LZ77** finds repeated sequences using a sliding window and replaces them with `(distance, length)` back-reference tokens — and that length can exceed the distance, regenerating a pattern past the edge of what currently exists.
- **DEFLATE** (RFC 1951) runs LZ77 then Huffman coding in sequence — it's the format inside every `.zip`, `.gz`, and `.png` file, sitting right next to the CRC-32 that protects it.
- No lossless algorithm beats a source's **entropy** — its true information content — which is why compressing already-compressed data rarely helps, and why nested-archive "zip bombs" can turn extreme compression ratios into a denial-of-service attack.

</Recap>

<Challenges>

#### Build a Huffman tree by hand {/*build-a-huffman-tree-by-hand*/}

Given the string `abracadabra` (11 letters), the frequencies are: `a`=5, `b`=2, `r`=2, `c`=1, `d`=1. Build the Huffman tree by hand (merge the two lowest-weight nodes at each step), write down the resulting code for each letter, and compute the total bit count for encoding `abracadabra`. Compare it to the fixed-length cost (5 distinct symbols need 3 bits each).

<Hint>

Start by merging `c` and `d` (the two lowest weights, both 1), giving a node of weight 2. You'll then have three nodes of weight 2 (`b`, `r`, and your merged `c+d` node) — any tie-breaking order among them is valid and will produce the same total bit count.

</Hint>

<Solution>

Fixed-length: 11 letters × 3 bits = 33 bits.

One valid tree: merge `c`(1)+`d`(1) → weight 2. Now nodes are `a`(5), `b`(2), `r`(2), `cd`(2). Merge `b`(2)+`r`(2) → weight 4. Now nodes are `a`(5), `cd`(2), `br`(4). Merge `cd`(2)+`br`(4) → weight 6. Now nodes are `a`(5), `cdbr`(6). Merge them → root, weight 11.

Codes: `a`=0 (1 bit), and the other four letters live 3 levels deep at 3 bits each (`b`, `r`, `c`, `d` all end up needing 3 bits in this particular tie-break order).

Total: `a`×5×1 + (`b`+`r`+`c`+`d` counts, 2+2+1+1=6 letters) ×3 = 5 + 18 = 23 bits.

23 bits vs 33 bits fixed — a savings of about 30%. ✓ (Exact per-letter codes can vary slightly with tie-breaking, but any valid Huffman tree on these frequencies totals 23 bits.)

</Solution>

#### Encode a repeated string with LZ77 {/*encode-a-repeated-string-with-lz77*/}

By hand, LZ77-encode the string `xyxyxyxy` (8 characters). Write out the literal characters and the `(distance, length)` token(s) your encoder would emit, the way the worked example in this lesson did for `abcabcabcabc`.

<Solution>

The first two characters, `x` and `y`, have no earlier match — output as literals. Starting at position 3, the text `xyxyxy` (6 characters) matches a pattern beginning 2 positions back. Checking how far it runs: it matches all the way to the end of the 8-character input.

Output: `x`, `y`, `(distance=2, length=6)` — 3 symbols standing in for 8 characters. Note again that length (6) exceeds distance (2) — the same self-overlapping copy trick from the lesson's worked example. ✓

</Solution>

#### Spot the invalid code {/*spot-the-invalid-code*/}

A teammate proposes this code table for four symbols: `a=0`, `b=1`, `c=01`, `d=10`. They claim it's a valid variable-length code because every code is unique. Explain why this code table will still fail in practice, and give a bit string that a decoder could not correctly interpret.

<Solution>

Uniqueness isn't enough — the code must be **prefix-free**: no code may be a prefix of a longer code. Here, `a=0` is a prefix of `c=01`, and `b=1` is a prefix of `d=10`. Feed a decoder the bit string `01`: reading left to right, it sees `0` first, which is a complete, valid code for `a` — so does it stop there and then read `1` as `b`, or keep reading and recognize `01` as `c`? Both readings are valid under this table, so the same bit string decodes to two different answers (`a` then `b`, or just `c`) with no way to tell which was intended. A correct code, like the one Huffman's algorithm produces, guarantees this ambiguity can never arise.

</Solution>

#### Explain the gzip-grew-the-file mystery {/*explain-the-gzip-grew-the-file-mystery*/}

A coworker runs `gzip` on a 20-byte file and is confused that the `.gz` result is larger than the original. Using what this lesson's Pitfall demonstrated on a 47-byte file, explain to them — in your own words, with numbers — why this happens and at roughly what file size they should expect gzip to reliably start shrinking things instead.

<Solution>

`gzip` doesn't output a bare DEFLATE stream — it wraps it in a file format with a fixed-size header (magic bytes, flags, timestamp, OS identifier — about 10 bytes) and a fixed-size footer (a CRC-32 checksum and the original length — about 8 bytes), roughly 18 bytes of overhead regardless of input size. On a 20-byte file, that overhead alone is nearly as large as the input, so even if DEFLATE's own compression works perfectly, the container's fixed cost dominates and the result comes out larger. This is exactly what happened with the 47-byte repeated-sentence file in this lesson: the DEFLATE payload itself shrank to 33 bytes, but the finished `.gz` file was 56 bytes once the container overhead was added back. As input size grows, that fixed ~18-byte cost becomes a shrinking fraction of the total, while the actual compression savings (which scale with the input) keep growing — so gzip reliably starts winning once the file is large enough, generally in the hundreds of bytes to low kilobytes range for typical text, and dramatically more for larger or more repetitive files.

</Solution>

#### Code review: needless recompression {/*code-review-needless-recompression*/}

You're reviewing a teammate's script. It takes a folder of JPEG photos and gzips every one of them before uploading, "to save bandwidth." Using the entropy ceiling from this lesson's DeepDive, explain to your teammate — with a concrete recommendation — why this step is very unlikely to help, and what it might do instead.

<Solution>

JPEG already runs its own compression pipeline before it ever writes a `.jpg` file — one tuned specifically for photographic image data. By the time that file exists on disk, its bytes already sit close to their entropy ceiling: little remaining redundancy, byte frequencies close to uniform, few repeated sequences. That's exactly the condition under which gzip's own LZ77-and-Huffman pipeline finds nothing left to exploit — there's no leftover skew or repetition for it to remove. In the best case, gzipping the JPEGs saves a negligible fraction of a percent; in the worst case — small files — the fixed container overhead from the earlier challenge actually makes them larger, the same way the 47-byte text file grew when gzipped. The concrete recommendation: skip compressing already-compressed formats (JPEG, PNG, MP3, and already-`.gz`/`.zip` files) entirely, and spend that CPU time only on genuinely compressible data — plain text, JSON, CSV, uncompressed images — where real redundancy still exists to remove.

</Solution>

</Challenges>

<LearnMore title="Randomness: PRNG, seeds, entropy" path="/learn/faza-0/modul-0-1/randomness">

A maximally compressed file looks statistically like noise — no repeated patterns, no skewed byte frequencies, nothing left for Huffman or LZ77 to grab onto. But what does "looking like noise" actually mean, precisely? And if a computer is a deterministic machine that always does exactly what it's told, how does it ever produce something that passes for random at all? That paradox is the next lesson's opening question.

</LearnMore>
