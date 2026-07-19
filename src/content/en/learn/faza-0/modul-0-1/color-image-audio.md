---
title: "Color, Image, and Audio in Binary"
---

<Intro>

Between 1979 and 1980, engineers from Philips and Sony met in a series of tense joint sessions in Eindhoven and Tokyo to standardize a 12-centimeter plastic disc. Philips arrived arguing 14 bits per audio sample was plenty; Sony's Kees Schouhamer Immink and Toshitada Doi's team held out for 16, and won. The sampling rate — how many times per second the music would be measured — landed on the strangely specific **44,100**, not because anyone loved that number, but because early digital recorders stored audio on *video* tape, and 44,100 is the one rate that fits perfectly into both American and European TV line geometry: 245 lines × 60 fields × 3 samples, and 294 × 50 × 3 — both exactly 44,100. The "Red Book" standard shipped in 1980, the first players in 1982, and the fossilized geometry of 1970s video tape still defines every CD, most streaming masters, and the default of every audio interface you will ever plug in. This lesson is the last and most human stop in our data-representation tour: how the *continuous* world — light your eye drinks in, pressure waves your ear rides — gets chopped, rounded, and poured into the integers you've spent six lessons mastering. By the end you'll compute the byte cost of a photograph and a song from first principles, and know exactly what was thrown away.

</Intro>

<YouWillLearn>

- The universal two-step recipe for digitizing reality: **sampling** (slicing) and **quantization** (rounding)
- **Color**: why three bytes per pixel is a biological hack, and the full decoding of Lesson 2's `#FF5733`
- **Images**: pixels as a spreadsheet — and why a 12-megapixel photo is 36 MB raw but 3 MB on your phone
- **Sound**: the Nyquist rule, why CDs measure music 44,100 times a second, and the one-second-of-audio arithmetic
- What **aliasing** is — wagon wheels spinning backwards, moiré shirts on TV — and why lost information never comes back
- How to budget storage and bandwidth for media from first principles, before ever benchmarking

</YouWillLearn>

## The graph-paper recipe {/*the-graph-paper-recipe*/}

Everything this module has encoded so far — integers, negatives, text — was *already discrete*: countable things with hard edges. But the world your senses live in is not like that. Brightness varies smoothly. Air pressure in a violin note is a continuous curve. Between any two shades of orange there is another shade of orange, forever. And your computer, as six lessons have established beyond appeal, stores nothing but finite integers.

The bridge between those two worlds is one recipe, and here is the physical machine to hold in your head: **tracing a smooth curve onto graph paper.** You are only allowed to mark grid intersections. Two decisions determine everything:

- How fine are the **columns**? That's **sampling** — how often you take a measurement (per second for sound, per millimeter for images). Finer columns follow faster wiggles.
- How fine are the **rows**? That's **quantization** — how many levels each measurement can snap to, which is exactly "how many bits per measurement," which is exactly Lesson 2's `2ⁿ`. More rows, gentler rounding.

<Diagram name="color-image-audio/sampling_quantization" height={360} width={720} alt="A smooth sine-like curve drawn in muted gray over a faint grid of 16 horizontal level lines. Vertical dashed lines mark 13 evenly spaced sample instants; at each instant a blue dot sits at the grid intersection nearest to the curve, and a blue staircase-like polyline connects the dots. Two annotations: a horizontal arrow along the bottom labeled 'sampling: slice time into columns', and a vertical arrow on the right labeled 'quantization: snap each slice to one of 2 to the n levels (here 4 bits, 16 levels)'.">

The whole of digital media in one picture: a smooth curve, reduced to grid intersections. Every dot is one integer; the space between dots is gone.

</Diagram>

Both decisions are *lossy on purpose*. The dots are not the curve; they are a finite integer summary of it, chosen well enough that a human eye or ear reconstructs the illusion. Digital media is not a copy of reality — it's a **contract about which measurements of reality are worth keeping**, and like every contract since Lesson 1, its numbers get frozen by committees and then outlive everyone in the room. The rest of this lesson is just this recipe applied twice: once to light, once to air.

## Color: three numbers your eye believes {/*color-three-numbers-your-eye-believes*/}

Start with a single point of light. Physically, its color is a whole *spectrum* — a continuous curve of energy across wavelengths, an infinite-dimensional object. Storing that would be hopeless. Fortunately, you don't see spectra. Your retina samples light with exactly **three types of cone cells**, roughly tuned to long, medium, and short wavelengths — and everything you call "color" is just the three-number report those cones send upstream. Evolution quantized color before Intel did.

That biological accident is the entire basis of **RGB**: if the eye reduces every spectrum to three numbers, then three numbers are all a screen must control. Give each channel — red, green, blue — one byte, 0 to 255, and a pixel becomes three integers:

```
#FF5733            ← Lesson 2's mystery bytes, finally decoded

FF → R = 255       (red channel floored to the ceiling)
57 → G =  87       (some green)
33 → B =  51       (a little blue)

Result: the warm orange of a sunset — 3 bytes, 24 bits.
```

A hex color code was never a special "web thing": it is **three bytes wearing hex clothing**, and now every skill from this module applies to it. Total palette: 2²⁴ = **16,777,216 colors** — the "16.7 million colors" of monitor marketing is just Lesson 2's powers-of-two table having a career in advertising. Add a fourth byte for **alpha** (opacity) and you have the 32-bit RGBA pixel that every browser, GPU, and design tool actually pushes around.

And because channels are just bit fields inside an integer, extracting them is Lesson 5's shifting and masking, live:

```js
const c = 0xFF5733;
[(c >> 16) & 255, (c >> 8) & 255, c & 255]
```

<ConsoleBlock level="info">

[255, 87, 51]

</ConsoleBlock>

<Note>

RGB is a hack on *your* hardware, not a law of light. A pure spectral yellow and a suitable mixture of red + green light are physically different spectra — but they excite your three cones identically, so you cannot tell them apart, a phenomenon called metamerism. Screens exploit it billions of times per frame. And the interpretation layer above the bytes stays gloriously unreliable: in February 2015 a single photo of a dress split the internet — tens of millions of people looking at the *same RGB bytes*, some seeing white-and-gold, some black-and-blue, because brains correct for assumed lighting differently. Even with a perfect contract, "bytes have no meaning" reaches all the way into the skull.

</Note>

## Images: a spreadsheet of pixels {/*images-a-spreadsheet-of-pixels*/}

An uncompressed image is now almost anticlimactic: a **grid of pixels**, each pixel three (or four) bytes, stored row after row — a spreadsheet where every cell is a color. Sampling reappears as *resolution* (how finely you slice the scene into columns and rows), quantization as *bit depth* (how finely each channel rounds).

<Diagram name="color-image-audio/pixel_zoom" height={340} width={720} alt="Three stages left to right. First, a rounded rectangle labeled 'photo, 4000 by 3000 pixels' with a simple mountain-and-sun line drawing inside and a small square marked on it. Zoom lines lead to the second stage: an 8 by 8 grid of cells representing that square magnified, with one cell highlighted in blue. Zoom lines continue to the third stage: three byte boxes labeled R 255, G 87, B 51 with hex values FF, 57, 33 beneath, captioned 'one pixel = 3 bytes'.">

Zoom far enough into any photograph and you hit the spreadsheet: rows of cells, three integers each. There is nothing else down there.

</Diagram>

The format really is that plain — plain enough to forge by hand. The venerable PPM image format is just a tiny ASCII header ("P6, width, height, max value") followed by raw RGB bytes, which means you can *type an image file into existence* using nothing but Lesson 2's bytes:

<TerminalBlock>

printf 'P6 1 1 255\n\xff\x57\x33' > pixel.ppm
xxd pixel.ppm
00000000: 5036 2031 2031 2032 3535 0aff 5733       P6 1 1 255..W3

</TerminalBlock>

Fourteen bytes, and any image viewer will open it: a one-pixel image of Lesson 2's sunset orange — the header in the text contract (there's `P6 1 1 255` in the ASCII column), the pixel in the color contract (`ff 57 33`), two contracts sharing one file in plain sight.

Which means image storage is *multiplication*, and you should always do it before trusting any tool:

```
A 12-megapixel phone photo, raw:
  4000 × 3000 pixels        = 12,000,000 pixels
  × 3 bytes (R, G, B)       = 36,000,000 bytes  ≈ 36 MB

One 1080p screen frame, raw:
  1920 × 1080               = 2,073,600 pixels
  × 3 bytes                 ≈ 6.2 MB
  × 60 frames per second    ≈ 373 MB every second  (!)
```

Now the productive shock: the photo on your phone is ~3 MB, not 36. Raw video at 373 MB/s would saturate storage and networks instantly, yet you stream 1080p over a connection a hundred times slower. The gap between *raw* and *actual* is **compression** — the art of finding and evicting redundancy — and it is so consequential that it gets its own lesson two stops from now. For today, keep the raw number as your anchor: it is the honest cost of the contract, the ceiling from which every clever format negotiates down.

Bit depth has its own visible failure mode. Eight bits per channel means 256 brightness levels, and on a large smooth gradient — a clear sky, a studio backdrop — the eye *can* catch the rounding: faint stripes called **banding**, quantization made visible, the graph paper's rows showing through the trace. That's the actual engineering case for 10-bit "HDR" pipelines: 1,024 levels per channel (2³⁰ ≈ 1.07 billion colors), pushing the rows fine enough that the staircase disappears again.

## Sound: 44,100 rulers per second {/*sound-44100-rulers-per-second*/}

Sound is a pressure wave — one single continuous curve of air pressure against time (stereo: two curves). A microphone converts pressure to voltage; then the graph-paper recipe takes over, and both of its knobs acquire famous settings.

**The columns — how often to measure?** Here lives the one theorem of this lesson, the **Nyquist–Shannon sampling rule**: to capture a wave that wiggles up to *f* times per second, you must sample it **more than 2 × f** times per second — at least two dots per wiggle, or the wiggle slips between your columns entirely. Human hearing tops out near 20,000 Hz (and that's a young human; the ceiling erodes with age), so audio needs somewhat more than 40,000 samples per second. The number actually chosen — the diner-placemat moment of this lesson's hook — was **44,100**, for the gloriously unromantic reason that it divided evenly into the video-tape formats the first digital recorders borrowed: digital audio's fundamental constant is a fossil of NTSC and PAL television. (Company legend adds that the disc's 74-minute capacity was set so Beethoven's Ninth would fit on one side; historians quibble over the details, but Sony's own executives told the story for decades.)

**The rows — how finely to round?** The Red Book war settled on **16 bits per sample**: 65,536 pressure levels — 2¹⁶, a number you've been able to compute since Lesson 2. Each additional bit doubles the levels and buys roughly **6 dB** of distance between the music and the rounding error's hiss; 16 bits yields ~96 dB, comfortably beyond vinyl's ~70 and most listening rooms. Studios record at 24 bits (~144 dB of theoretical headroom) for the same reason you compute in `double` and ship in `float`: keep spare precision while you're still doing arithmetic on the data — a rule you already trust from Lesson 4.

And now the spine of the lesson — the arithmetic that turns a second of music into bytes, no tools, no benchmarks, just multiplication:

```
One second of CD audio:
  44,100 samples/second
  × 2 bytes per sample  (16 bits)
  × 2 channels          (stereo)
  = 176,400 bytes/second     ≈ 1.4 Mbit/s

One minute:   × 60  ≈ 10.6 MB
74 minutes:   × 4,440 s ≈ 783,000,000 bytes ≈ 750 MiB
```

That last line *is* the compact disc: ~783 MB of raw audio on a 12 cm platter — and the disc actually stores substantially more raw bits than that, because the audio is wrapped in thick layers of error-correcting redundancy that let it survive scratches and fingerprints. How a mangled disc plays back perfectly is not this lesson's business; it is precisely the *next* lesson's business.

The same three-factor multiplication explains every audio contract you'll meet — including the terrible ones. Telephone networks froze *their* numbers decades before the CD: **8,000 samples per second, 8 bits each, one channel = 64,000 bits per second**, a rate chosen when copper bandwidth was gold. Nyquist immediately tells you the ceiling: 8,000 samples/s can represent nothing above 4,000 Hz — and real telephony filters at ~3,400 Hz. Speech survives (barely; this is why 'F' and 'S' are indistinguishable on calls and every support line resorts to "F as in Foxtrot"). Music, whose life is in the harmonics above 4 kHz... you have heard exactly what happens to music, every time you've been put on hold.

<DeepDive>

#### Aliasing: the wagon wheel in your data {/*aliasing-the-wagon-wheel*/}

What *exactly* goes wrong when you sample too slowly? The wiggles don't just vanish politely — they **lie**. Watch a filmed wagon wheel or helicopter rotor: at 24 frames per second, a wheel spinning just slower than one spoke-position per frame appears to rotate slowly *backwards*. The camera's sampling grid genuinely cannot distinguish the fast forward motion from a slow backward one — both produce identical dots.

<Diagram name="color-image-audio/nyquist_alias" height={320} width={720} alt="A fast sine wave with eleven full cycles drawn in muted gray across the width. Twelve evenly spaced sample points are marked as red dots on the fast wave. A slow red sine wave completing exactly one cycle passes smoothly through all twelve dots. Caption inside the figure: both waves produce identical samples — after sampling, the fast wave is indistinguishable from the slow impostor.">

Eleven cycles sampled twelve times: the dots fit a one-cycle impostor perfectly. Sampling below the Nyquist rate doesn't lose the fast wave — it *converts* it into a false slow one.

</Diagram>

This is **aliasing**: any frequency above half the sample rate re-enters the data disguised as ("under the alias of") a lower one. It's why audio hardware runs an analog *anti-aliasing filter* before the sampler — brutally deleting everything above Nyquist first, because once the impostor is in the dots, it is mathematically indistinguishable from truth. It's why fine-striped shirts erupt into swirling **moiré** on camera (the fabric's spatial frequency beats against the sensor's pixel grid), why game engines spend enormous effort on "anti-aliasing" for the same reason at the pixel level, and why the resampling code in every audio library filters before it decimates. The rule generalizes into a slogan worth keeping: **filter first, then sample — because sampling doesn't drop what it can't hold; it forges it.**

</DeepDive>

<Pitfall>

**Lost information does not come back. Ever.**

Every enhancement fantasy dies on this rock. Upscaling a 640×480 image to 4K invents pixels; it cannot recover the ones never captured — the movie trope of shouting "enhance!" at a security photo is asking the graph paper for marks it never made. Converting a 128 kbps MP3 to WAV or FLAC produces a *bit-perfect copy of the damage* in a bigger box. Re-saving a JPEG at "quality 100" does not restore what the first save discarded (each generation quietly loses more). And routing studio-grade audio through a telephone codec caps it at the telephone's contract forever after — in any pipeline, **the narrowest contract wins**, and no upstream quality survives it. You met this exact shape last lesson: the `utf8mb3` column truncated what the application faithfully delivered. Quality decisions are one-way doors; make them at the *last* possible stage, and keep the original.

(The honest asterisk: modern AI upscalers produce plausible detail — but *plausible* is the correct word. They are painting an educated guess over the gap, which is exactly what you want for a vacation photo and exactly what you must never accept for evidence, medicine, or measurement.)

</Pitfall>

<DeepDive>

#### Why three colors are enough — and when they aren't {/*why-three-colors-are-enough*/}

The deep reason RGB works is worth stating precisely, because it's a *sampling* story too: the human eye samples the wavelength spectrum with only three broad, overlapping sensors. Color vision is a three-dimensional projection of an infinite-dimensional signal — evolution's own lossy codec, tuned over millions of years to the frequencies that mattered (ripe fruit against foliage, blood under skin). Screens don't reproduce light's spectrum; they reproduce *your cones' response* to it, which is a vastly cheaper problem. Three emitters, three bytes, done.

The hack's edges show where its assumptions break. Print reflects light instead of emitting it, so ink works subtractively — hence **CMYK**, four channels, and the eternal designer grief of on-screen colors shifting on paper: two different contracts, boundary losses included, a story you can now tell in your sleep. Birds and mantis shrimp carry four to sixteen cone types — to them, every screen ever built is garishly, laughably wrong. And roughly 8% of human males, with two effective cone types, live one dimension down; an interface encoding critical state purely in red-vs-green hue is, for them, encoding it in invisible ink. Accessibility guidelines' "never rely on color alone" is not politeness — it's engineering for heterogeneous decoding hardware in the field.

</DeepDive>

## The quantization lab {/*the-quantization-lab*/}

Time to feel the rows of the graph paper directly. Below is Lesson 1's switch-panel spirit reborn as a color bench: three channel sliders (three bytes — the sunset orange `#FF5733` is preloaded), plus a **bits-per-channel** control. The right swatch shows your color after being quantized to fewer rows. Drag the red slider slowly at 8 bits, then at 2, and *watch banding happen under your finger* — smooth motion snapping between distant colors. At 1 bit per channel you've rediscovered the 8-color palettes of 1980s home computers:

<Sandpack>

```js
import { useState } from 'react';

export default function ColorLab() {
  const [rgb, setRgb] = useState([255, 87, 51]);
  const [bits, setBits] = useState(8);

  const levels = 2 ** bits;
  const step = 255 / (levels - 1);
  const q = rgb.map((v) => Math.round(Math.round(v / step) * step));
  const hex = (a) =>
    '#' + a.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const set = (i, v) => {
    const n = rgb.slice();
    n[i] = Number(v);
    setRgb(n);
  };

  return (
    <div style={{ fontFamily: 'monospace', textAlign: 'center' }}>
      {['R', 'G', 'B'].map((n, i) => (
        <div key={n}>
          {n}{' '}
          <input type="range" min="0" max="255" value={rgb[i]}
            onChange={(e) => set(i, e.target.value)} />{' '}
          {rgb[i]}
        </div>
      ))}
      <p style={{ fontFamily: 'system-ui' }}>
        bits per channel:{' '}
        {[1, 2, 3, 4, 8].map((b) => (
          <button key={b} onClick={() => setBits(b)}
            style={{ fontWeight: b === bits ? 'bold' : 'normal',
                     color: b === bits ? '#087ea4' : 'inherit' }}>
            {b}
          </button>
        ))}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <div>
          <div style={{ width: 120, height: 76, background: hex(rgb),
                        borderRadius: 8 }} />
          <p>true: {hex(rgb)}</p>
        </div>
        <div>
          <div style={{ width: 120, height: 76, background: hex(q),
                        borderRadius: 8,
                        border: '2px solid #c1554d' }} />
          <p>{bits}-bit: {hex(q)}</p>
        </div>
      </div>
      <p style={{ fontFamily: 'system-ui' }}>
        {levels} levels per channel → {(levels ** 3).toLocaleString()} colors
      </p>
    </div>
  );
}
```

</Sandpack>

The counter at the bottom is the whole story in one line: 8 bits → 16,777,216 colors; 1 bit → 8. Same slider, same light, same eye — only the number of rows on the graph paper changed.

<Recap>

- Digitizing reality is one recipe everywhere: **sample** (slice the continuum into columns) and **quantize** (snap each slice to one of 2ⁿ rows). The dots are a finite integer summary; the space between them is discarded *by design*.
- **Color** is a biological hack: the eye's three cone types reduce infinite spectra to three numbers, so a pixel is three bytes — `#FF5733` = R 255, G 87, B 51 — giving 2²⁴ = **16,777,216 colors** (+ an alpha byte for opacity). Channels extract with Lesson 5's shifts and masks.
- **Images** are pixel spreadsheets: raw cost = width × height × bytes-per-pixel. A 12 MP photo is **36 MB raw**; 1080p60 video is **373 MB/s raw** — the gap to reality is compression (two lessons ahead). Too-few rows shows up as **banding**; 10-bit HDR is the cure.
- **Sound**: the **Nyquist rule** demands sampling above 2× the highest frequency; hearing ends near 20 kHz, so CDs sample at **44,100 Hz** (a fossil of video-tape geometry, frozen 1980) at **16 bits** (65,536 levels, ~96 dB; ~6 dB per bit).
- The spine arithmetic: **44,100 × 2 bytes × 2 channels = 176,400 B/s** ≈ 1.4 Mbit/s ≈ 750 MiB per 74-minute disc. Telephony's contract — 8,000 Hz × 8 bits = **64 kbit/s**, nothing above ~3.4 kHz — is why hold music dies and 'F' needs 'Foxtrot'.
- **Aliasing**: frequencies above Nyquist don't disappear, they *forge* lower ones (wagon wheels, moiré) — filter first, then sample.
- **Lost information never returns**: upscaling invents, MP3→FLAC copies damage, and in any pipeline the narrowest contract wins. Decide quality at the last stage; keep originals.

</Recap>

<Challenges>

#### Decode DodgerBlue {/*decode-dodgerblue*/}

CSS ships a named color `DodgerBlue`, hex `#1E90FF`. Decode all three channels to decimal, rank the channels by strength, and answer: of the 16,777,216 possible 24-bit colors, roughly what *fraction* did the 1-bit mode of this lesson's toy leave you?

<Hint>

Each hex pair is one byte — Lesson 2 rules: first digit × 16 + second digit. For the fraction: 1 bit per channel means 2 levels per channel, 3 channels.

</Hint>

<Solution>

```
1E → 1×16 + 14 = 30      (R: barely any red)
90 → 9×16 + 0  = 144     (G: a solid middle green)
FF → 15×16 + 15 = 255    (B: blue at the ceiling)
```

B > G > R — maximum blue, medium green, whisper of red: a bright saturated sky-blue, which is what the swatch shows. The 1-bit palette: 2³ = **8 colors** out of 16,777,216 — a fraction of about **1 in 2.1 million** (2³/2²⁴ = 2⁻²¹). Every color of the 1980s home-computer aesthetic was living in that 2⁻²¹ sliver — and your eye still recognized every sprite, which says something profound about how much of the contract is carried by *structure* rather than fidelity.

</Solution>

#### Budget a studio clip {/*budget-a-studio-clip*/}

Video post-production audio runs at 48,000 Hz, 24-bit, stereo. Compute, from first principles: (a) the bytes in a 10-second clip, (b) the bitrate in kbit/s, and (c) one comparison — how many times larger is this than the same 10 seconds at telephone quality?

<Solution>

```
(a)  48,000 samples/s × 3 bytes × 2 channels = 288,000 B/s
     × 10 s = 2,880,000 bytes ≈ 2.88 MB

(b)  288,000 B/s × 8 = 2,304,000 bit/s = 2,304 kbit/s

(c)  Telephone: 8,000 × 1 byte × 1 channel = 64,000 bit/s
     2,304 / 64 = 36× larger
```

Three factors, pure multiplication — rate × depth × channels — and you can now price any audio contract on sight: podcast masters, game asset budgets, voice-chat bandwidth. Notice *where* the 36× comes from: 6× from the sample rate, 3× from bit depth, 2× from stereo. When you're asked to cut media costs, that factorization *is* the menu of options, each with a known perceptual price you learned today (rate → frequency ceiling, depth → noise floor, channels → space).

</Solution>

#### The hold-music ticket {/*the-hold-music-ticket*/}

Transfer task. A ticket from the customer-experience team: *"We licensed a beautiful orchestral track for our support line and uploaded the studio master (48 kHz / 24-bit FLAC, 2,304 kbit/s!). Callers say it sounds like it's playing through a wall. We tried re-exporting at 320 kbps and even re-uploading the FLAC as WAV — no change. Is our telephony vendor corrupting our file?"* Explain what's actually happening, with the two numbers that decide the case; explain why *no* re-export can ever help; and write the reply that sets correct expectations plus one genuinely useful recommendation.

<Solution>

**What's happening:** nothing is corrupted — the audio is crossing into the telephone network's contract: **8,000 samples per second**, and by Nyquist that pipeline cannot carry any frequency above 4,000 Hz (in practice ~3,400 Hz). An orchestra's brilliance — string overtones, cymbal shimmer, the "air" — lives almost entirely above that line; the codec doesn't muffle it, it *deletes* it, then quantizes what's left to 8-bit telephone levels (64 kbit/s total). "Through a wall" is the literal correct perception: walls are also low-pass filters.

**Why re-exporting can't help:** the damage happens *downstream* of anything they upload. The narrowest contract in the pipeline wins, and it's the last hop to the caller's ear; a 2,304 kbit/s master and a 64 kbit/s pipe still meet at 64. Uploading better files is mailing a 4K poster to a fax machine — and this is the same one-way door as the Pitfall: information the contract can't hold is not stored somewhere waiting; it never crosses.

**Reply:** *"The phone network itself is limited by an old, fixed standard (8,000 measurements/sec — physics then caps audio at ~3.4 kHz, roughly a tenth of what your master contains), so no source file, at any quality, can sound better on a standard call; the vendor is delivering exactly what the medium permits. Recommendation: choose or commission hold audio that lives below ~3 kHz — solo piano mid-register, acoustic guitar, voice-forward pieces — which loses far less through this contract; and where your platform supports HD-voice/VoIP codecs (16 kHz+), enable them, as that's the only lever that actually widens the pipe."* ✓

</Solution>

</Challenges>

<LearnMore title="Data Integrity: Parity, Checksums, CRC" path="/learn/faza-0/modul-0-1/checksum-crc">

You now know a CD carries ~750 MB of audio integers on a disc that gets scratched, smudged, and dropped — yet plays back *perfectly*, note for note. That miracle has a mechanism. Next lesson: what happens when bits flip — cosmic rays, dying cables, dust — and the beautiful mathematics of noticing, and even *repairing*, damage you cannot prevent: parity, checksums, and the CRC hiding in every ZIP file, Ethernet frame, and PNG you've ever touched.

</LearnMore>
