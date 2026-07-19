---
title: "Text: From ASCII to UTF-8"
---

<Intro>

One evening in September 1992, in a New Jersey diner, Ken Thompson — co-creator of Unix, the very system whose name you watched scramble into `NUXI` last lesson — sketched an encoding scheme on a placemat while Rob Pike watched. The two Bell Labs engineers had been given days to respond to a standards proposal they considered broken; by the end of dinner they had something better, and within the week their entire operating system was converted to it. The problem they were solving was enormous: computing's text was mutually unintelligible — the same bytes spelled French on one machine, Greek on another, garbage on a third — and the industry's official fixes kept breaking every existing file and tool on Earth. The placemat design broke *nothing*. Today it's called **UTF-8**, it carries over 98% of the web, and it is arguably the most successful backward-compatible design in engineering history. This lesson is the story of text: the 1963 contract that maps 72 to `H` (a debt this course has carried since Lesson 1), the byte-sized empires that turned `é` into `Ã©`, the table that tried to hold every human symbol — and exactly how the placemat encoding works, bit by bit, because you're going to encode an emoji by hand before this lesson ends.

</Intro>

<YouWillLearn>

- **ASCII**: the 128-slot contract, its secretly beautiful internal structure, and why `H` = 72
- How the byte's upper 128 slots became warring **code pages** — and the exact mechanics of **mojibake** (`café` → `cafÃ©`, `привет` → `Ð¿Ñ€Ð¸Ð²ÐµÑ‚`)
- **Unicode**: the split that fixed everything — a *code point* is a number, an *encoding* is bytes, and they are different contracts
- **UTF-8** from the placemat up: the four byte-templates, encoding `é`, `€`, and `😀` by hand
- Why UTF-8 won: ASCII-compatible, self-synchronizing, endianness-proof — and where UTF-16's ghost still haunts your language
- The rules that survive contact with production: there is no "plain text," length is four different numbers, and MySQL's `utf8` isn't UTF-8

</YouWillLearn>

## The 128-slot contract {/*the-128-slot-contract*/}

Since Lesson 1, "the text contract" has been a promissory note: *some* table maps 72 to `H`, 105 to `i`, and this course kept borrowing against it — `Hi`, `Hey`, hex dumps. Time to pay up. The table is **ASCII** — the American Standard Code for Information Interchange, finalized in 1963 — and it is a 7-bit contract: **128 slots**, numbered 0–127, one for every symbol American English could imagine needing.

The committee didn't scatter characters randomly; they built structure into the bits, and the structure still pays your salary today:

<Diagram name="text-representation/ascii_map" height={360} width={720} alt="A horizontal bar of 128 slots divided into four equal 32-slot blocks. Block 0 to 31, dimmed, labeled 'control characters (invisible): newline 10, carriage return 13, tab 9, bell 7'. Block 32 to 63 labeled 'space, punctuation, digits', with slots 48 to 57 highlighted in blue and labeled 'digits 0-9'. Block 64 to 95 labeled 'uppercase A-Z', with slot 72 marked H = 72. Block 96 to 127 labeled 'lowercase a-z'. Below the bar, a zoom panel compares A = 01000001 with a = 01100001, the single differing bit (value 32) highlighted in red, captioned 'one bit apart — the case bit'.">

Four clean 32-slot blocks. The digits sit at 48–57, uppercase starts at 65, lowercase at 97 — and none of those numbers is an accident.

</Diagram>

Look at the deliberate engineering in this 60-year-old table:

- **Digits**: `'0'` is 48 = `0110000`. The *low four bits of a digit's code are the digit itself* — `'7'` is `0110111`, low nibble `0111` = 7. Converting a character to its numeric value is `c − 48`, or just masking off the top bits. Designed, in 1963, to make parsing cheap.
- **The case bit**: `A` = 65 = `01000001`; `a` = 97 = `01100001`. Every letter and its lowercase twin differ in **exactly one bit** — bit 5, worth 32. Uppercasing is *clearing a bit*; case-insensitive comparison is *masking a bit*. When you meet bitwise tricks in old parsers (`c | 0x20` to lowercase), this is the contract they're leaning on.
- **Slots 0–31** hold the invisible **control characters** — not symbols but *instructions* to the receiving device, ghosts of the teletype era: 10 is `\n` (line feed), 13 is `\r` (carriage return — literally "slide the typewriter carriage back," and the reason Windows files still end lines with the two-byte fossil `\r\n`), 9 is tab, 0 is `NUL`, and slot 7, `BEL`, physically rang the terminal's bell. It still does: `printf '\a'` in a terminal near you.

And the payoff of a three-lesson-old debt: `H` is 72 because H is the 8th letter and uppercase starts at 64 + 1. Every hex dump you've decoded in this course was this table, working.

<Note>

ASCII was not inevitable. IBM's System/360 — the 1964 machine that standardized the 8-bit byte in Lesson 1 and two's complement in Lesson 3 — shipped with IBM's own rival table, **EBCDIC**, in which the alphabet isn't even contiguous (there are gaps *inside* A–Z, a heritage of punched-card zones). EBCDIC still runs today on mainframes processing a large share of the world's card transactions, which means somewhere right now a bank's boundary code is translating between the two tables, character by character, exactly like Lesson 5's `htons` — border control between contracts.

</Note>

## One byte, many empires {/*one-byte-many-empires*/}

ASCII used 7 bits; the byte offers 8. That spare bit means slots **128–255: a whole second half of the map, officially blank.** And the world's non-English speakers needed it desperately — French can't write *café*, German can't write *Straße*, Russian can't write anything at all in 128 American slots.

So everyone colonized the upper half — *differently*. The results were **code pages**: dozens of mutually incompatible contracts that all agreed about 0–127 and disagreed about everything above. ISO 8859-1 ("Latin-1") filled 128–255 with Western European letters; ISO 8859-7 put Greek there; ISO 8859-5 and the Soviet KOI8-R put Cyrillic there (in *different arrangements*, naturally); Windows shipped its own variants like Windows-1252; Japan, whose writing system laughs at 128 slots, built multi-byte schemes like Shift-JIS.

The consequence is a sentence you can now say with full technical precision: **a byte above 127 has no meaning at all until you know which code page wrote it.** The byte `0xE9` *is* `é` under Latin-1 and *is* `ι` under ISO 8859-7 — not "displays as," *is*: each contract is internally flawless, exactly like Lesson 5's two endiannesses. A French machine and a Greek machine could exchange files for years with no error message ever raised, each reading the other's national poetry as native gibberish. The bytes were never wrong. There were simply two contracts and no treaty.

## Mojibake: reading with the wrong glasses {/*mojibake-reading-with-the-wrong-glasses*/}

The garbage produced at that boundary has a name — **mojibake**, Japanese for "character transformation," coined by the people who suffered it worst. And its most famous specimen, the `Ã©` you've seen in a thousand emails, is now fully within your power to explain byte-by-byte. Here's *café* written by a modern (UTF-8) sender and read by a Latin-1 receiver:

<Diagram name="text-representation/mojibake_pipeline" height={340} width={720} alt="A pipeline. On the left, the word café. It becomes five byte boxes: 63, 61, 66, then C3 and A9 tinted blue with a bracket labeled 'é in UTF-8 — one character, two bytes'. An arrow labeled 'read under the Latin-1 contract' leads to five character boxes: c, a, f, then Ã and © tinted red, assembling into the output cafÃ© with a red label 'two characters — the pair was never recognized'.">

Five correct bytes, one wrong contract. The two-byte character `é` is read as two one-byte characters — the anagram signature of Lesson 5, now in text.

</Diagram>

```
Sender (UTF-8):      c    a    f    é
bytes:               63   61   66   C3 A9      ← é is TWO bytes

Receiver (Latin-1):  63→c  61→a  66→f  C3→Ã  A9→©

Screen shows:        cafÃ©   ✗
```

The first three bytes cross the boundary untouched — they're below 128, where *every* contract agrees (hold that thought; it's the placemat's masterstroke). The damage is confined to the character that actually needed the upper slots. That's also why mojibake has such a recognizable *texture*: each non-ASCII character becomes the same little cluster of Latin junk, usually led by `Ã` or `Ð`. Russian *привет* through the same wrong glasses becomes `Ð¿Ñ€Ð¸Ð²ÐµÑ‚` — every Cyrillic letter turning into a two-symbol `Ð·`-flavored pair, the exact string promised at the end of last lesson. A trained eye reads the wreckage itself: "leading `Ã` clusters — that's UTF-8 read as Latin-1; leading `Ð` — that's Cyrillic UTF-8; `ï»¿` at the top of a page — that's a UTF-8 **byte order mark** (`EF BB BF`, endianness's cameo from Lesson 5) shown through the wrong contract." Mojibake is not noise; like `NUXI`, it's your own data wearing the wrong glasses, and the glasses leave fingerprints.

You can watch the crime scene directly with Lesson 1's oldest tool:

<TerminalBlock>

printf 'café' | xxd
00000000: 6361 66c3 a9                             caf..

</TerminalBlock>

Four characters, *five* bytes — and `xxd`'s ASCII column, which only trusts slots 32–126, renders the two-byte `é` as two dots. Even your hex-dump tool is making a contract decision.

## Unicode: one table for humanity {/*unicode-one-table*/}

By the late 1980s the endgame was obvious: not a better code page, but **the last table** — one universal registry assigning a number to every character of every human writing system. That project is **Unicode** (version 1.0, 1991). Its numbers are called **code points**, written `U+` plus hex: `A` is U+0041, `é` is U+00E9, `€` is U+20AC, `😀` is U+1F600, and the Azerbaijani `ə` is U+0259. The space runs from U+0000 to U+10FFFF — **1,114,112 slots**, of which about 150,000 are assigned so far: every living script, ancient Egyptian hieroglyphs, mathematical alphabets, and yes, the emoji, which are not decorations bolted onto text but full citizens of the same table.

But Unicode's deepest idea is not the big table. It's a *separation of contracts* — the conceptual move this whole module has been training you for:

**A code point is a number. A number is not bytes.** Saying "é is U+00E9" says *nothing yet* about what lives in a file — exactly as Lesson 5 taught that the value 8080 says nothing about which of its bytes goes first. Between the abstract number and the physical bytes there must be a second contract, an **encoding**, and Unicode deliberately allows several:

- **UTF-32**: every code point as one 32-bit integer. Simple, uniform — and it quadruples the size of English text (every ASCII letter gets three `00` bytes of padding) while inheriting a full-blown **endianness problem**, because 32-bit integers are exactly the multi-byte units Lesson 5 warned you about.
- **UTF-16**: born as UCS-2 under the early-90s assumption that 65,536 slots — 2¹⁶, a number you learned to distrust in Lesson 2 — would hold every character humanity would ever need. Two bytes per character, period. Windows NT, Java, and JavaScript all embraced it... and then Unicode outgrew 65,536, the assumption collapsed (*limits look unreachable at design time; systems outlive their designers' assumptions* — fourth lesson running), and UTF-16 had to be retrofitted with escape-hatch pairs. It also needs a **BOM** — the byte order mark U+FEFF, whose bytes arrive as `FE FF` or `FF FE` depending on endianness, making Lilliput's war a permanent resident of your text files.
- And then there's the placemat.

## The placemat encoding {/*the-placemat-encoding*/}

Thompson's design brief, reconstructed: encode all of Unicode; leave every existing ASCII file *byte-for-byte valid and unchanged*; never emit a zero byte inside text (C programs treat `00` as end-of-string); and make the stream self-repairing — a reader dropped into the middle of a file must find its footing. The solution is four byte-templates, selected by the code point's size:

<Diagram name="text-representation/utf8_templates" height={360} width={720} alt="Four rows, one per UTF-8 template. Row 1: range U+0000 to U+007F, one byte 0xxxxxxx, payload 7 bits, labeled 'plain ASCII, unchanged'. Row 2: range U+0080 to U+07FF, bytes 110xxxxx 10xxxxxx, payload 11 bits. Row 3: range U+0800 to U+FFFF, bytes 1110xxxx 10xxxxxx 10xxxxxx, payload 16 bits. Row 4: range U+10000 to U+10FFFF, bytes 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx, payload 21 bits. In every row the fixed prefix bits are highlighted in blue and the x payload slots are plain; a side note marks that every continuation byte starts with 10.">

The whole standard fits in four rows. Blue bits are fixed by the template; the `x` slots carry the code point's own bits, most significant first.

</Diagram>

Read the prefixes as self-description: a byte starting `0` says "I am a complete ASCII character." A byte starting `110` says "I start a 2-byte character"; `1110`, a 3-byte one; `11110`, four. And every **continuation byte** starts `10` — a prefix used for *nothing else*. The templates are the contract; encoding is just pouring bits into slots. Watch it twice:

**Worked example — `é`, U+00E9:**

```
Code point:  0xE9 = 11101001            (8 bits — too big for
                                         7-bit template 1)
Template 2:  110xxxxx 10xxxxxx          (11 payload slots)
Pad to 11:   000 1110 1001
Pour in:     110 00011   10 101001
             ─────────   ─────────
Bytes:       11000011    10101001
           = C3          A9   ✓        the exact pair from the
                                        mojibake autopsy
```

**Worked example — `€`, U+20AC (three bytes, and a diagram to match):**

<Diagram name="text-representation/euro_packing" height={340} width={720} alt="The euro sign's code point U+20AC shown as sixteen bits 0010000010101100, split by brackets into three groups: 0010, 000010, 101100. Three arrows pour the groups into the 3-byte template 1110xxxx 10xxxxxx 10xxxxxx. The assembled bytes read 11100010, 10000010, 10101100, with the fixed prefix bits in blue, and the final hex result E2 82 AC highlighted below.">

Sixteen bits, three slots of 4 + 6 + 6. The prefixes are the envelope; the code point is the letter inside.

</Diagram>

```
Code point:  0x20AC = 0010 0000 1010 1100     (16 bits → template 3)
Split 4|6|6:  0010 | 000010 | 101100
Pour in:      1110 0010   10 000010   10 101100
Bytes:        E2          82          AC   ✓
```

Every hard-won property falls out of those prefixes:

- **Total ASCII compatibility.** Every code point below 128 encodes as *itself, one byte, high bit zero*. An ASCII file from 1975 *is* a valid UTF-8 file — no conversion, ever. This is why the world could migrate gradually, file by file, over 20 years, and why your `café` mojibake damaged only the `é`. The placemat didn't defeat the installed base; it *annexed* it.
- **Self-synchronization.** Land anywhere in a UTF-8 stream: if the byte starts `10`, you're mid-character — step back at most 3 bytes and you *must* hit a start byte. A corrupted byte ruins one character, never the rest of the file, and byte-oriented tools (`grep`, split, seek) keep working on text they don't understand.
- **No zero bytes, no endianness.** UTF-8 is a *byte sequence*, like a string — Lesson 5's immunity rule applies. No BOM needed, no `htons` for text, nothing for Lilliput to fight over.
- **Sorts right for free.** Comparing UTF-8 byte-by-byte gives exactly code-point order — because the templates put the *big end first*, the same trick that made biased floats sort as integers (Lesson 4) and ISO dates sort as strings (Lesson 5). Third appearance of the motif; it will not be the last.

X/Open's committee draft had been called FSS-UTF, "File System Safe UCS Transformation Format." Thompson's version kept the safety and gained the elegance — and, at eight bits per unit, the mercifully shorter name.

<DeepDive>

#### The ghost of UCS-2 in your language {/*the-ghost-of-ucs2*/}

UTF-16's broken 65,536 assumption didn't die; it fossilized *inside* Windows, Java, and JavaScript, and you can summon the ghost in one line:

```js
"😀".length
```

<ConsoleBlock level="info">

2

</ConsoleBlock>

JavaScript strings are sequences of **UTF-16 code units**, and `😀` (U+1F600) lives above 65,535, so it's stored as an escape-hatch pair — two units called **surrogates**, drawn from a range (U+D800–U+DFFF) that Unicode permanently amputated from the character space just to make this trick possible. The scar is load-bearing: 2,048 code points that can never be characters, so that a 1993-era assumption could be patched instead of replaced. `.length` counts units, so one visible emoji reports as 2; `"😀".charCodeAt(0)` returns a surrogate half that means nothing alone; slicing between the halves manufactures garbage. Modern JavaScript added code-point-aware escapes: `[..."😀"].length` is 1, because the iterator speaks code points. Java carries the identical ghost (`char` is a UTF-16 unit, hence `String.codePointAt` bolted on later), and the Windows API's `W` functions are UTF-16 to this day. When a platform's "character" type predates 1996, *assume it means code unit* — and remember the meta-lesson: an encoding assumption, once shipped into a language's core string type, is effectively immortal.

</DeepDive>

<DeepDive>

#### Two ways to write é {/*two-ways-to-write-e*/}

One more layer of "what even is a character," because production systems break on it weekly. Unicode lets `é` be written two ways: as the single code point U+00E9, or as *two* code points — plain `e` (U+0065) followed by U+0301, a **combining accent** that stacks onto its neighbor. Both render identically. They are different strings:

```js
'é'.length
'é'.normalize('NFD').length
'é' === 'é'.normalize('NFD')
```

<ConsoleBlockMulti>

<ConsoleLogLine level="info">

1

</ConsoleLogLine>

<ConsoleLogLine level="info">

2

</ConsoleLogLine>

<ConsoleLogLine level="info">

false

</ConsoleLogLine>

</ConsoleBlockMulti>

Two users type "café" on different keyboards; your database now holds two distinct byte sequences for the same word; lookups miss, duplicates bloom, password checks fail mysteriously. The fix is **normalization** — canonical recipes (NFC composes, NFD decomposes) applied *at the boundary*, so storage holds one spelling. And what the user perceives as "one character" — a **grapheme cluster** — can be bigger still: the family emoji 👨‍👩‍👧 is four code points stitched with invisible zero-width joiners, reporting `.length` of 8 in JavaScript. Text, it turns out, is a four-story building: **bytes** at the bottom, then **code units**, then **code points**, then **graphemes** at the penthouse — and "length" honestly answers to all four names.

</DeepDive>

<Pitfall>

**There is no such thing as plain text.**

The phrase "just read the file as plain text" contains a hidden variable, and every mojibake incident in history is that variable being guessed wrong. A byte stream without a declared encoding is *not text* — it's Lesson 1's meaningless bytes awaiting a contract. Hence the boundary rules that separate professionals from mojibake factories: **declare encodings explicitly everywhere they can be declared** (`Content-Type: text/html; charset=utf-8`, `<meta charset="utf-8">`, database column charsets, `open(path, encoding='utf-8')`), **default new systems to UTF-8 end to end**, and **never concatenate byte streams that might disagree**. The companion trap is trusting `.length`: a `VARCHAR(10)` column, a 280-character limit, a "max 20 chars" validation — each silently picks one floor of the four-story building (bytes? units? points? graphemes?), and off-by-one security bugs live in the gaps. When length matters, say *which* length out loud.

</Pitfall>

## The emoji that broke the database {/*the-emoji-that-broke-the-database*/}

For a decade, one production incident introduced more engineers to this lesson than any textbook. MySQL, the world's most deployed open-source database, has long offered a character set literally named `utf8` — which, for historical reasons, caps characters at **3 bytes**. Real UTF-8 needs four for everything above U+FFFF... which is precisely where the emoji live. The collision was inevitable: a user pastes `😀` into a comment, the driver ships four honest bytes `F0 9F 98 80`, and MySQL rejects or truncates the string with the era-defining error `Incorrect string value: '\xF0\x9F\x98\x80'`. Entire apps shipped, passed QA in ASCII-only test data, and fell over the first weekend real humans used them — the ASCII test-data trap in its purest form. The genuine full encoding arrived under the name **`utf8mb4`** ("most bytes 4"), and MySQL 8.0 finally made it the default; the migration guides, charset-conversion scripts, and war stories remain a rite of passage. Moral for designers, in this module's oldest voice: the 3-byte cap looked harmless at design time — it excluded only characters "nobody used." Then 2010 gave phones an emoji keyboard, and nobody's users became everybody.

## The encoder lab {/*the-encoder-lab*/}

The toy below is Thompson's placemat, executable. Pick a character; watch its code point get measured, a template chosen, and the payload bits poured in — prefixes in blue, exactly as in the diagrams. The bottom line shows the same bytes through Latin-1 glasses: reproduce `Ã©`, then meet `😀`'s infamous four-byte alter ego `ðŸ˜€`:

<Sandpack>

```js
import { useState } from 'react';

const CP1252 = { 128: '€', 130: '‚', 152: '˜', 159: 'Ÿ' };
const PRESETS = ['A', 'é', '€', '😀'];

function utf8(cp) {
  if (cp < 0x80) return [cp];
  if (cp < 0x800) return [192 | (cp >> 6), 128 | (cp & 63)];
  if (cp < 0x10000)
    return [224 | (cp >> 12), 128 | ((cp >> 6) & 63), 128 | (cp & 63)];
  return [240 | (cp >> 18), 128 | ((cp >> 12) & 63),
          128 | ((cp >> 6) & 63), 128 | (cp & 63)];
}

export default function EncoderLab() {
  const [ch, setCh] = useState('é');
  const cp = ch.codePointAt(0);
  const bytes = utf8(cp);
  const prefixLen = (i) =>
    i > 0 ? 2 : bytes.length === 1 ? 1 : bytes.length + 1;
  const latin1 = bytes
    .map((b) => CP1252[b] || (b < 160 && b > 126 ? '·' : String.fromCharCode(b)))
    .join('');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <div>
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setCh(p)} style={{ fontSize: 18 }}>
            {p}
          </button>
        ))}
      </div>
      <h2>
        {ch} = U+{cp.toString(16).toUpperCase().padStart(4, '0')}
      </h2>
      <div>
        {bytes.map((b, i) => {
          const bin = b.toString(2).padStart(8, '0');
          const n = prefixLen(i);
          return (
            <span key={i} style={{
              display: 'inline-block', margin: 3, padding: 6,
              border: '1px solid #888', borderRadius: 8
            }}>
              <div style={{ fontSize: 15 }}>
                <span style={{ color: '#087ea4', fontWeight: 'bold' }}>
                  {bin.slice(0, n)}
                </span>
                {bin.slice(n)}
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                {b.toString(16).toUpperCase()}
              </div>
            </span>
          );
        })}
      </div>
      <p style={{ fontFamily: 'system-ui' }}>
        {bytes.length} byte{bytes.length > 1 ? 's' : ''} — blue bits are
        the template, the rest is the code point.
      </p>
      <p style={{ fontFamily: 'system-ui', color: bytes.length > 1 ? '#c1554d' : '#087ea4' }}>
        {bytes.length > 1
          ? 'Latin-1 glasses read this as: ' + latin1
          : 'Below 128: every contract on Earth agrees. Unbreakable.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Note what `A` demonstrates by *refusing* to break: the entire lower half of the byte is neutral territory, agreed by ASCII, every code page, and UTF-8 alike. That shared floor is why the internet's plumbing — protocols, URLs, source code — survived four decades of encoding wars unscathed, and why Thompson's decision to build *on top of* the floor, rather than replace it, won.

<Recap>

- **ASCII (1963)** is the 128-slot text contract, deliberately structured: digits at 48–57 (low nibble = value), `A` at 65 and `a` at 97 exactly **one bit apart**, control characters 0–31 as teletype ghosts (`\n`=10, `\r`=13, `BEL`=7). `H` = 72 — Lesson 1's debt, paid.
- The byte's upper 128 slots became incompatible **code pages** (Latin-1, ISO 8859-x, KOI8-R, Windows-1252): the byte `0xE9` *is* `é` or `ι` depending on contract. **Mojibake** is the boundary failure: UTF-8's `C3 A9` read as Latin-1 is `Ã©`; Cyrillic becomes the `Ð`-cluster texture; `ï»¿` is a BOM in the wrong glasses.
- **Unicode** splits the problem in two: a **code point** is a number (U+0041, U+1F600) in a space of 1,114,112 slots; an **encoding** is a separate contract turning numbers into bytes. UTF-32 wastes; UTF-16 fossilized the broken 65,536 assumption into surrogates, BOMs, and `"😀".length === 2`.
- **UTF-8** (Thompson & Pike, one diner evening, 1992): four templates — `0xxxxxxx`, `110xxxxx 10xxxxxx`, `1110…`, `11110…` — carrying 7/11/16/21 payload bits, big end first. `é` → `C3 A9`, `€` → `E2 82 AC`, `😀` → `F0 9F 98 80`.
- Its victory properties: **ASCII files are already valid UTF-8**; continuation bytes always start `10` (**self-synchronizing**); no zero bytes; **no endianness**; byte order = code-point order. Over **98% of the web** speaks it.
- Production rules: **there is no plain text** — declare the charset at every boundary; **normalize** at input (é has two spellings); "length" is four different numbers (bytes / code units / code points / graphemes); and MySQL's `utf8` is the 3-byte impostor — **`utf8mb4`** is the real thing.

</Recap>

<Challenges>

#### Encode the grin {/*encode-the-grin*/}

Encode `😀` (U+1F600) into its four UTF-8 bytes by hand — template, split, pour, hex. Then explain in one sentence why its mojibake form `ðŸ˜€` has exactly four symbols.

<Hint>

0x1F600 in binary is `1 1111 0110 0000 0000` — 17 bits, so it needs the 4-byte template with 21 payload slots. Pad to 21 bits with leading zeros, then split 3 | 6 | 6 | 6.

</Hint>

<Solution>

```
Code point:   0x1F600 = 0 0001 1111 0110 0000 0000   (pad to 21 bits)
Split 3|6|6|6:  000 | 011111 | 011000 | 000000
Template 4:   11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
Pour in:      11110 000   10 011111   10 011000   10 000000
Bytes:        F0          9F          98          80   ✓
```

Cross-check with the machine: `'😀'.codePointAt(0).toString(16)` returns `'1f600'`, and any hex dump of the emoji shows `f0 9f 98 80`.

The mojibake: one *character* is four *bytes*, and single-byte glasses read each byte as its own character — `F0`→`ð`, `9F`→`Ÿ`, `98`→`˜`, `80`→`€` (in Windows-1252) — hence exactly four symbols of `ðŸ˜€`, the same one-symbol-per-byte arithmetic that turned `é` into a pair.

</Solution>

#### Decode the mystery bytes {/*decode-the-mystery-bytes*/}

A UTF-8 stream contains: `D0 9C D0 98 D0 A0`. Decode it fully: identify the character boundaries from the prefixes alone, extract each code point, and report what kind of text this is. (The code points you find will be in the Cyrillic block, U+0400–U+04FF.)

<Solution>

Prefix analysis first — no tables needed: `D0` = `11010000` starts with `110` → "2-byte character starts here"; `9C` = `10011100` starts with `10` → continuation. The stream parses itself: `(D0 9C)(D0 98)(D0 A0)` — three 2-byte characters. That's self-synchronization doing its job.

Extract payloads (drop `110` and `10` prefixes, concatenate):

```
D0 9C:  10000 011100 → 100 0001 1100 = U+041C
D0 98:  10000 011000 → 100 0001 1000 = U+0418
D0 A0:  10000 100000 → 100 0010 0000 = U+0420
```

U+041C, U+0418, U+0420 are Cyrillic **М**, **И**, **Р** — the word **МИР**: Russian for *peace* (and *world*). A fitting message to decode at the end of a module arc that began with Danny Cohen's plea for peace — and if this string ever crossed a Latin-1 boundary, you already know it would arrive wearing the `Ð`-cluster uniform: `ÐœÐ˜Ð `.

</Solution>

#### The emoji ticket {/*the-emoji-ticket*/}

Transfer task. A support ticket lands on your desk: *"Users report that saving a profile bio containing emoji fails with `Incorrect string value: '\xF0\x9F\x92\xBB' for column 'bio'`. Bios with plain English and even French accents save fine. Started when marketing launched the 'add your vibe' campaign."* The backend is MySQL with the column charset `utf8`. Explain the root cause precisely (why *exactly* emoji, why accents work), state the fix, and write the two-sentence postmortem lesson for the team wiki.

<Solution>

**Root cause:** MySQL's charset named `utf8` is historically a 3-byte-max subset (utf8mb3). It covers every code point up to U+FFFF — which includes `é` (2 bytes, U+00E9) and all Latin accents, hence "French saves fine" — but emoji live above U+FFFF and encode with the **4-byte template**: `💻` is U+1F4BB → `F0 9F 92 BB`, the exact bytes in the error. The leading `F0` announces a 4-byte character; the column's contract caps at 3; MySQL rejects the value. Nothing is corrupted — two contracts disagree at a boundary, this module's oldest failure shape.

**Fix:** convert to the genuine encoding — `ALTER TABLE profiles CONVERT TO CHARACTER SET utf8mb4` (plus matching collation, connection charset, and a check that indexed `VARCHAR` lengths still fit, since worst-case bytes per character grows from 3 to 4). New schemas: `utf8mb4` from day one — it's the MySQL 8.0 default for exactly this reason.

**Postmortem lesson:** *"Our test data was ASCII and Western European, so a 3-byte encoding cap passed every test we had — the limit only existed for characters our tests never contained. Charset contracts must be verified against the full range users can type (one 😀 in the seed data would have caught this), not against the subset engineers type."* ✓

</Solution>

</Challenges>

<LearnMore title="Color, Image, and Audio in Binary" path="/learn/faza-0/modul-0-1/color-image-audio">

Numbers, negatives, fractions, byte order, text — the contracts so far have encoded things computers were *built* for. Next, the contracts for things humans are built for: how `#FF5733` from Lesson 2 becomes a color your eye believes, how a grid of numbers becomes a photograph, and how 44,100 measurements per second become music — including exactly why that oddly specific number, chosen in 1980 over a dinner-table-sized committee war of its own, still rules every song you'll stream today.

</LearnMore>
