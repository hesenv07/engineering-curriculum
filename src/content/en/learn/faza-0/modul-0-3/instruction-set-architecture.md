---
title: "Instruction Set Architecture"
---

<Intro>

In April 1985, in a small office in Cambridge, a team at Acorn Computers powered up the first chip they had ever designed. Steve Furber had drawn the hardware; Sophie Wilson had written the instruction set. They connected the test board, ran a program — and it worked, immediately, which almost never happens. Then someone looked at the ammeter measuring how much current the chip was drawing. It read **zero**. There was a fault on the board: the chip's power pin had never been connected. It had been running the whole time on the tiny leakage current seeping in through its input pins. The design was so frugal that it worked without being plugged in. That chip was the ARM1, it had about 25,000 transistors, and the instruction set Sophie Wilson wrote for it now runs in phones, cars, headphones, servers and laptops in numbers no one can count precisely. This lesson is about what she was actually designing when she wrote that instruction set — the most consequential and least visible thing in a computer.

</Intro>

<YouWillLearn>

- What an **instruction set** really is: a promise between the people who write software and the people who build chips
- How an instruction is encoded, field by field, and why every design is a fight over a fixed number of bits
- Why x86 instructions vary from 1 to 15 bytes while every ARM instruction is exactly 4 — and what each choice buys
- Why a decision made for a chip in 1978 is still visible inside the processor on your desk
- How the famous **RISC vs CISC** argument actually ended: with modern x86 chips being RISC on the inside

</YouWillLearn>

<InlineToc />

## The promise {/*the-promise*/}

Start with a question that sounds simple. When you compile a program, what exactly is the compiler aiming at?

Not a particular chip. Nobody compiles for "the processor in this specific laptop." A program compiled in 2010 runs on a machine built in 2024. A single download works on thousands of different processor models from different companies. Something must be holding all of that together, and that something is written down.

It is called the **instruction set architecture**, or **ISA**, and it is a document. It says:

- which instructions exist (`add`, `load`, `jump if equal`, and so on),
- exactly how each one is encoded as bits,
- how many registers there are and what they are called,
- and precisely what each instruction is guaranteed to do.

That is the whole thing. It is a contract, and it has two sides.

<Diagram name="instruction-set-architecture/isa_contract" height={420} width={720} alt="A layered diagram titled 'the ISA is a promise, and both sides build against it'. Along the top, four grey boxes read: your C code, a Rust program, a JavaScript JIT, hand-written assembly. Grey arrows lead down from each, past the note 'compilers translate down to…', into a wide blue box in the middle labelled 'the instruction set architecture' with the sub-text 'which instructions exist, how they are encoded, how many registers, what each one is guaranteed to do'. Below the blue box, the note 'and every one of these keeps the same promise' sits above four more grey boxes: a 1995 Pentium with 3.1 million transistors, a 2015 server chip with billions and 18 cores, a phone SoC that runs off a battery, and an emulator with no silicon at all. A caption reads: the ISA says WHAT. How a particular chip pulls it off is its own business.">

One document in the middle, and everyone above and below it building to match.

</Diagram>

Above the line sit everyone who produces instructions: compiler writers, assembly programmers, the just-in-time compiler inside your browser. Below it sit everyone who executes them: chip designers, and also the people writing emulators, where there is no silicon at all.

Here is the distinction that makes the whole subject click, and it is worth reading twice:

**The ISA says *what*. The chip decides *how*.**

The "how" has its own name — the **microarchitecture**. Two processors can implement the identical ISA and share almost nothing internally: one might execute instructions strictly in order while the other runs them out of order and reassembles the results; one might have a two-stage pipeline and the other twenty. Both are correct, because correctness means *keeping the promise*, not being built a particular way.

This is why an old program keeps working on a new computer. The chip changed completely. The promise did not.

<Note>

The clearest proof that an ISA is a document rather than a piece of hardware is that you can keep the promise in software. An **emulator** reads the same instruction bytes and produces the same results with no matching silicon anywhere — which is how a modern Mac with an ARM chip runs software compiled for x86. Slower, usually. But the contract does not specify speed; it specifies results.

</Note>

## An instruction is a form to fill in {/*an-instruction-is-a-form-to-fill-in*/}

Last lesson used a toy instruction: four bits saying *what*, four bits saying *to what*. Real instructions work exactly the same way, with more fields.

Here is a genuine ARM64 instruction, taken from a real compiled program. In memory it is four bytes: `11 00 04 21`. Split those 32 bits into fields and it explains itself:

<Diagram name="instruction-set-architecture/instruction_fields" height={400} width={720} alt="A diagram titled 'one real ARM64 instruction, opened up', showing the hex value 0x11000421. Below it, thirty-two small boxes contain the individual bits 00010001000000000000010000100001, numbered 31 on the left and 0 on the right. Coloured brackets group the bits into four fields: a blue bracket over bits 31 to 22 labelled 'opcode + format, 10 bits, meaning add an immediate, 32-bit'; a red bracket over bits 21 to 10 labelled 'imm12, 12 bits, the constant: 1'; and two grey brackets over bits 9 to 5 and 4 to 0 labelled Rn, 5 bits, source w1, and Rd, 5 bits, destination w1. Beneath, the assembled instruction reads 'add w1, w1, #1'. At the bottom, a horizontal bar divided into four proportional segments labelled format, constant, Rn and Rd illustrates the 32-bit budget, with captions: 12 bits for the constant means the biggest number you can add in one instruction is 4,095; want 5,000? That takes two instructions.">

Every bit belongs to exactly one field, and the fields add up to 32. That is the entire constraint.

</Diagram>

Read the fields left to right and the instruction reads itself: *add an immediate value; the value is 1; take it from register w1; put the result in w1.* Which is written, in assembly, as `add w1, w1, #1`. It adds one to a register — the increment at the bottom of a `for` loop.

Now look at the bar at the bottom of that figure, because it contains the central tension of the entire subject.

An instruction has **a fixed number of bits, and every field spends from the same purse.** ARM64 chose 32 bits. Ten of them went to saying which instruction this is. Five went to naming the destination register, five more to naming a source. What is left — twelve bits — is all the room there is for a constant.

Twelve bits holds 0 to 4,095. So `add w1, w1, #1` fits comfortably, and `add w1, w1, #5000` **does not exist**. A compiler that needs to add 5,000 must emit two instructions: one to build the number, one to add it.

That is not a flaw. It is the consequence of a choice, and every ISA designer makes a version of it:

- Want 64 registers instead of 32? That is 6 bits per register field instead of 5. With three register fields you have just spent 3 more bits, and they came out of the constant.
- Want more instructions? The opcode field grows, and again the constant shrinks.
- Want bigger constants? Something else must give.

There is no way to win this argument, only ways to lose it differently. Which brings us to the interesting part: different teams lost it differently, and we can look at the results.

## The same loop, three ways {/*the-same-loop-three-ways*/}

Here is a small C function. Nothing clever — it adds up the numbers from 1 to n:

```c
int sum_to(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) total += i;
    return total;
}
```

Compile it three times, for three different instruction sets, and disassemble the result. These are real bytes from real compilers, not illustrations.

**On x86-64** (the ISA in most desktops and servers), the loop body is:

<TerminalBlock>

gcc -O1 -c add.c && objdump -d add.o

  15:  01 c2        add    %eax,%edx
  17:  83 c0 01     add    $0x1,%eax
  1a:  39 f8        cmp    %edi,%eax
  1c:  75 f7        jne    15

</TerminalBlock>

**On ARM64** (phones, and Apple's laptops), the same loop:

<TerminalBlock>

aarch64-linux-gnu-gcc -O1 -c add.c && aarch64-linux-gnu-objdump -d add.o

  14:  0b010000     add    w0, w0, w1
  18:  11000421     add    w1, w1, #1
  1c:  6b02003f     cmp    w1, w2
  20:  54ffffa1     b.ne   14

</TerminalBlock>

**On RISC-V**, an ISA first published in 2010 and designed with the benefit of hindsight:

<TerminalBlock>

riscv64-linux-gnu-gcc -O1 -c add.c && riscv64-linux-gnu-objdump -d add.o

   c:  9d3d         addw   a0,a0,a5
   e:  2785         addiw  a5,a5,1
  10:  fee79ee3     bne    a5,a4,c

</TerminalBlock>

Three machines, three languages, one loop. Now put them side by side:

<Diagram name="instruction-set-architecture/length_comparison" height={400} width={720} alt="A diagram titled 'the same four-line loop, three instruction sets', subtitled 'each block is one byte of real machine code'. Three rows are shown. The x86-64 row has four blocks of unequal width, labelled add, add, cmp and jne, sized 2, 3, 2 and 2 bytes, summarised as 4 instructions and 9 bytes. The ARM64 row has four blocks of identical width, labelled add, add, cmp and b.ne, each 4 bytes, summarised as 4 instructions and 16 bytes. The RISC-V row has three blocks labelled addw, addiw and bne, sized 2, 2 and 4 bytes, summarised as 3 instructions and 8 bytes. Captions read: x86 packs the most into the fewest bytes per instruction; ARM keeps every instruction identical in size; RISC-V does the job in three because its branch compares and jumps at the same time.">

Real bytes from three real compilers. The loop is identical; only the contract underneath changed.

</Diagram>

| | instructions | bytes | instruction sizes |
|---|---|---|---|
| **x86-64** | 4 | 9 | 2, 3, 2, 2 — all different |
| **ARM64** | 4 | 16 | 4, 4, 4, 4 — always the same |
| **RISC-V** | 3 | 8 | 2, 2, 4 — two sizes allowed |

Three things in that table are worth pausing on.

**x86 instructions are different lengths.** Two bytes here, three there. The design squeezes common operations into as few bytes as possible, and lets rare ones be long. An x86 instruction can be anywhere from 1 to 15 bytes.

**Every ARM64 instruction is exactly four bytes.** Always. No exceptions. The loop takes more space because of it — 16 bytes instead of 9 — and that cost was accepted deliberately, for a reason we will get to.

**RISC-V did it in three instructions**, and this is not a trick of the compiler. Look at the last line: `bne a5,a4,c` means *compare these two registers and, if they differ, jump*. On x86 and ARM that takes two instructions — a `cmp` that sets flags, then a branch that reads them. RISC-V folded them into one and skipped flags entirely for this case.

Which also quietly demolishes a story you may have heard. The old caricature says CISC designs like x86 are compact and RISC designs are bloated. Here the *newest RISC design produced the smallest code*, in both instructions and bytes. Reality is more interesting than the slogan.

## Fixed length or variable length {/*fixed-length-or-variable-length*/}

Of all the choices an ISA makes, this one shapes the chip most, so it is worth understanding properly rather than memorising.

**Variable length (x86)** means the processor cannot know where the next instruction starts until it has worked out how long this one is. Think of a sentence written with no spaces: you can read it, but only strictly left to right, one character at a time. That is fine for a single instruction and awful when you want to decode four at once — because you cannot begin the second until you have finished the first. Modern x86 chips spend a genuinely large amount of silicon and power on decoders that attack this problem from several angles at once.

**Fixed length (ARM64)** means instruction number *n* always begins at byte 4n. Want to decode eight instructions in parallel? Grab 32 bytes and cut them into eight. No searching, no dependency between decoders. The chip pays for this in code size, and gets back a decoder that is simpler, faster and more power-efficient.

So the trade is:

| | variable length | fixed length |
|---|---|---|
| Code size | smaller | larger |
| Decoding | hard, sequential | easy, parallel |
| Decoder cost | large, power-hungry | small |
| Constants | can be as big as needed | limited by the leftover field |

When memory was measured in kilobytes and expensive, code size was the thing that mattered, and variable length was obviously right. When transistors became nearly free and power became the limit, easy decoding started to matter more. This is a large part of why ARM dominates anything running on a battery — and it goes right back to the ammeter reading zero in Cambridge in 1985.

## The decision from 1978 {/*the-decision-from-1978*/}

Now the part that explains a great deal about the strangeness of real computers.

In 1978 Intel released the **8086**. It was a 16-bit processor with eight general-purpose registers, and their names were `AX`, `BX`, `CX`, `DX`, `SI`, `DI`, `BP` and `SP`. Eight registers was a reasonable choice for 1978, when every bit in an instruction was precious and chips were tiny.

Then IBM picked a member of that family for the IBM PC in 1981, the PC became the standard, and the ISA was suddenly load-bearing for the entire industry. From that moment, Intel could add to x86 but could never remove anything, because software already existed that depended on it.

Watch what happened to a single register:

<Diagram name="instruction-set-architecture/register_evolution" height={380} width={720} alt="A diagram titled 'one register, forty-five years of sediment' showing four nested rectangles of increasing width, aligned at their right edges. The innermost and narrowest, in red, is labelled AL with the note '8 bits, added 1978'. Around it, a wider red box labelled AX, '16 bits, added 1978'. Around that, a blue box labelled EAX, '32 bits, added 1985'. The outermost and widest blue box is labelled RAX, '64 bits, added 2003'. Captions read: the 8-bit AL of the 1978 8086 is still there, still addressable, inside the 64-bit register; and: nothing was ever removed, because removing it would break software that still runs.">

Each new generation wrapped the old register rather than replacing it.

</Diagram>

In 1978 you had `AX`, a 16-bit register, whose lower half could also be used on its own as the 8-bit `AL`. In 1985 the 80386 made registers 32 bits and called the new one `EAX` — with the old `AX` living inside it as the bottom half. In 2003, 64-bit x86 arrived and called it `RAX`, with `EAX` inside *that*.

All four names still work today. Write `AL` in assembly and you are addressing the same eight bits that an 8086 addressed in 1978. Nothing was removed. Nothing can be.

The register *count* is stuck in the same way. 64-bit x86 doubled it from 8 to 16 — an improvement, but it could not simply jump to 32, because the number of registers is baked into how instructions are encoded, and old encodings had to keep working. ARM64, designed fresh with no obligations, chose 31. RISC-V chose 32.

## Why nobody can just start over {/*why-nobody-can-just-start-over*/}

The obvious reaction is: surely someone should throw x86 away and design something clean?

People have tried, and the attempts illustrate why it is so hard. The problem is not technical. It is that an ISA's value is almost entirely in **the software that already exists for it**, and that value belongs to everyone except the company that would have to pay for the transition.

So ISAs behave like a ratchet. They only ever gain features. x86 has accumulated decades of additions — new registers, new vector instructions, new modes — each one permanent from the day it shipped, because somewhere a program uses it.

This has a cost you can measure. A modern x86 chip must contain hardware to correctly execute instructions that essentially no current software uses, and it must boot into a mode that pretends to be a 1978 processor before switching to something modern. All of that is silicon, verification effort and power, spent on keeping a promise made to programs that may no longer exist.

And it has a benefit you can also measure: the software works. Thirty-year-old binaries run. That is not nostalgia, it is the reason the platform is worth anything at all.

## The twist: x86 is RISC on the inside {/*the-twist-x86-is-risc-on-the-inside*/}

So how do x86 chips stay competitive while carrying all this? By quietly not being x86 machines internally.

Starting with the Pentium Pro in 1995, Intel's processors stopped executing x86 instructions directly. Instead, the decoder **translates each x86 instruction into one or more simple, uniform internal operations** — usually called **micro-ops** — and the actual execution core runs those.

<Diagram name="instruction-set-architecture/microops" height={380} width={720} alt="A diagram titled 'what modern x86 actually does with a complicated instruction'. On the left, a red box contains the instruction 'add %eax, (%rbx)', labelled 'one CISC instruction'. An arrow leads right into a box labelled 'decoder', with the note 'splits it up'. From the decoder, three dashed arrows lead to three stacked blue boxes labelled 'load from memory', 'add the two values' and 'store the result back', collectively labelled 'three micro-ops'. Text on the left explains that the CPU core underneath only ever runs simple, uniform operations, which is to say it is a RISC machine wearing a CISC costume. A caption reads: the old argument ended in a truce — CISC on the outside, RISC on the inside.">

The instruction set stayed compatible; the machine underneath quietly became something else.

</Diagram>

Take `add %eax, (%rbx)`: a single x86 instruction that reads a value from memory, adds a register to it, and writes the result back. Internally that becomes three separate operations — load, add, store — each simple enough for a fast, uniform execution core to handle.

So the answer to "is x86 CISC or RISC?" is: **CISC on the outside, RISC on the inside.** The complicated instruction set is a compatibility layer, translated on the fly, and the machine doing the real work looks much more like ARM than like an 8086.

Which is how the argument actually ended. Not with one side winning, but with the CISC camp adopting RISC internals while keeping their instruction set, and everyone agreeing to stop shouting about it.

<Pitfall>

**Assembly language is not machine code, and the ISA is neither of them.**

Three things get confused constantly, so here they are separated:

- **Machine code** is the actual bytes: `11 00 04 21`. This is what the CPU fetches.
- **Assembly language** is a human-readable spelling of those bytes: `add w1, w1, #1`. It is text. It has to be assembled into machine code before anything can run it, and the assembler may add conveniences the hardware has never heard of — labels, macros, and pseudo-instructions that quietly expand into several real ones.
- **The ISA** is the specification that defines which byte patterns are legal and what each one means. Neither the bytes nor the text — the rulebook both of them follow.

The practical consequence: a line of assembly does not always produce one instruction. On ARM64, writing `mov x0, #70000` looks like one operation, but 70,000 does not fit in the immediate field, so the assembler emits two instructions to build it. If you are counting instructions or reasoning about size, count the *disassembly of the binary*, never the source you wrote.

</Pitfall>

<DeepDive>

#### How many instructions does x86 actually have? {/*how-many-instructions-does-x86-have*/}

Nobody knows, and that is not a joke — it depends entirely on how you count.

Do you count `add` once, or once for each combination of operand types it accepts? Do the vector extensions count, and if so which generations? What about instructions that exist only in specific modes, or ones that a manufacturer documents but discourages? Serious attempts to enumerate the x86 instruction set produce numbers well past a thousand, and they disagree with each other.

Now compare that with **RISC-V**, whose base integer instruction set contains **fewer than fifty instructions**. That is the entire foundation: enough to run a compiled C program, and small enough to write out on a single page. Everything beyond it — multiplication, floating point, atomics, vectors — is an optional *extension* that a chip may or may not include, and a compiler is told which ones it can use.

That difference in philosophy is worth more than the numbers. x86 grew by accumulation: each generation added what the market wanted, and nothing could ever be taken back. RISC-V was designed with the accumulation problem in mind, so the growth happens in named, optional modules rather than in one ever-thickening trunk.

Whether that discipline survives forty-five years of commercial pressure is a genuinely open question. Every ISA is clean at the start.

</DeepDive>

<DeepDive>

#### An instruction set you are allowed to use {/*an-instruction-set-you-are-allowed-to-use*/}

Here is a fact about ISAs that surprises most software engineers: they are property.

To build a chip that runs x86 instructions, you need permission from Intel or AMD, and essentially nobody has it — which is why, after four decades, the x86 market is two companies. To build an ARM chip you pay ARM for a licence, either for a ready-made core design or, at greater expense, for the right to design your own core that implements the instruction set. Apple holds the second kind of licence, which is why Apple can design its own processors that still run ARM software.

**RISC-V** was created at Berkeley in 2010 partly to break this pattern. Its specification is free to use: anyone can build a RISC-V processor, sell it, modify it, or teach with it, without asking or paying. That is unusual enough that it has produced a wave of chips from companies and universities that could never have afforded to enter otherwise, and it is why RISC-V shows up so often in research and in embedded controllers.

Notice what is being licensed in each case, though — not the chip design, but *the right to keep the promise*. An ISA is a document, and what you are buying is permission to implement it. That is a strange sort of property, and it makes more sense once you accept that the contract, not the silicon, was always the valuable part.

</DeepDive>

## Spend the bit budget yourself {/*spend-the-bit-budget-yourself*/}

Designing an instruction set is mostly this: deciding what to spend thirty-two bits on. Below you can make those decisions and watch what they cost.

Choose how wide an instruction is, how many registers your ISA names, how many different instructions it supports, and what shape the instruction takes. The bar shows where every bit went, and the number underneath shows the largest constant you have left room for.

Two experiments are worth doing. Set 32 registers with a three-register format and see how little space remains. Then try to design something with 64 registers *and* room for a constant of 100,000, and discover that you cannot.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';

export default function BitBudget() {
  const [width, setWidth] = useState(32);
  const [regs, setRegs] = useState(32);
  const [ops, setOps] = useState(128);
  const [form, setForm] = useState('reg3');

  const regBits = Math.ceil(Math.log2(regs));
  const opBits = Math.ceil(Math.log2(ops));
  const regFields = form === 'reg3' ? 3 : 2;
  const usedByRegs = regFields * regBits;
  const spent = opBits + usedByRegs;
  const immBits = width - spent;
  const fits = immBits >= 0;
  const maxImm = fits ? 2 ** immBits - 1 : 0;

  const segs = [
    ['opcode', opBits, ACC],
    ...Array.from({ length: regFields }, (_, i) => [
      i === 0 ? 'dest' : `src${i}`, regBits, '#888',
    ]),
    ...(form === 'reg3' ? [] : [['constant', Math.max(immBits, 0), DNG]]),
  ];
  const leftover = form === 'reg3' ? Math.max(immBits, 0) : 0;

  const choice = (label, value, current, set) => (
    <button key={label} onClick={() => set(value)} style={{
      margin: 2, padding: '3px 10px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
      border: `2px solid ${current === value ? ACC : '#888'}`,
      background: current === value ? `${ACC}1e` : 'transparent',
      color: current === value ? ACC : 'inherit',
      fontWeight: current === value ? 'bold' : 'normal',
    }}>{label}</button>
  );

  const row = (title, children) => (
    <div style={{ margin: '6px 0' }}>
      <span style={{ display: 'inline-block', width: 150, fontSize: 13, color: '#888' }}>
        {title}
      </span>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      {row('instruction width', [16, 32].map((v) => choice(`${v} bits`, v, width, setWidth)))}
      {row('how many registers', [8, 16, 32, 64].map((v) => choice(String(v), v, regs, setRegs)))}
      {row('how many opcodes', [16, 64, 128, 512].map((v) => choice(String(v), v, ops, setOps)))}
      {row('instruction shape', [
        choice('dest, src1, src2', 'reg3', form, setForm),
        choice('dest, src, constant', 'reg2', form, setForm),
      ])}

      <div style={{
        display: 'flex', height: 46, marginTop: 16, borderRadius: 8,
        overflow: 'hidden', border: `2px solid ${fits ? '#888' : DNG}`,
      }}>
        {fits ? (
          <>
            {segs.map(([name, bits, col], i) => (
              <div key={i} style={{
                width: `${(bits / width) * 100}%`,
                background: `${col}2e`, borderRight: '1px solid #8886',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, textAlign: 'center', overflow: 'hidden',
              }}>{bits >= 3 ? `${name} (${bits})` : bits}</div>
            ))}
            {leftover > 0 && (
              <div style={{
                width: `${(leftover / width) * 100}%`,
                background: '#8881', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, color: '#888',
              }}>unused ({leftover})</div>
            )}
          </>
        ) : (
          <div style={{
            width: '100%', background: `${DNG}2e`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: DNG,
          }}>
            <b>does not fit — {spent} bits needed, only {width} available</b>
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'monospace', fontSize: 14, marginTop: 10 }}>
        opcode {opBits} + {regFields} × register {regBits} = {spent} bits spent
        {' · '}
        {fits ? `${immBits} left` : `${-immBits} over budget`}
      </p>

      <div style={{
        padding: '10px 14px', borderRadius: 10,
        border: `2px solid ${fits ? ACC : DNG}`,
        background: fits ? `${ACC}14` : `${DNG}14`,
      }}>
        {!fits ? (
          <span style={{ color: DNG }}>
            <b>Impossible.</b> You have asked for more fields than the
            instruction has bits. Something has to be given up: fewer
            registers, fewer opcodes, or a wider instruction.
          </span>
        ) : form === 'reg2' ? (
          <span>
            <b style={{ color: ACC }}>Largest constant: {maxImm.toLocaleString()}</b>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              Any number bigger than this cannot be written into a single
              instruction — the compiler must build it with two or more.
            </div>
          </span>
        ) : (
          <span>
            <b style={{ color: ACC }}>Three registers named, {leftover} bits to spare.</b>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              Those spare bits are what real ISAs spend on shift amounts,
              condition codes and extra opcode space. Notice how few there are.
            </div>
          </span>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>
        For reference: ARM64 is 32 bits wide, names 31 registers, and leaves
        itself 12 bits for a constant — a maximum of 4,095, exactly as the
        diagram above showed.
      </p>
    </div>
  );
}
```

</Sandpack>

Play with it for a minute and the lesson lands harder than any explanation: **there is no configuration that gives you everything.** Every ISA you have ever heard of is one particular way of losing this argument, chosen decades ago, and then defended forever.

<Recap>

- An **ISA** is a document, not a piece of hardware: it lists which instructions exist, how they are encoded, how many registers there are, and what each instruction is guaranteed to do.
- It is a **contract**. Compilers target it from above; chips and emulators implement it from below. The ISA says *what*; the **microarchitecture** — how a particular chip pulls it off — is entirely separate, which is why old programs run on new processors.
- An instruction is a **form with fields**, and all the fields share one fixed bit budget. ARM64's `add w1, w1, #1` is `0x11000421`: 10 bits of opcode, 12 for the constant, 5 each for two registers. Twelve bits means the largest constant is **4,095**.
- Real comparison, real compilers, one identical loop: **x86-64** used 4 instructions in 9 bytes, **ARM64** 4 instructions in 16 bytes, **RISC-V** 3 instructions in 8 bytes — the newest RISC design produced the smallest code, which is the opposite of the old caricature.
- **Variable length** (x86, 1–15 bytes) gives compact code but decoding that must proceed strictly left to right. **Fixed length** (ARM64, always 4 bytes) costs space and buys a simple, parallel, power-efficient decoder — which is much of why ARM owns battery-powered devices.
- ISAs are a **ratchet**: they only gain. The 8-bit `AL` from the 1978 8086 still sits inside today's 64-bit `RAX`, because removing it would break software that still runs.
- The RISC/CISC argument ended in a **truce**. Since the Pentium Pro in 1995, x86 chips translate each instruction into simple, uniform **micro-ops** and execute those — CISC on the outside, RISC on the inside.
- **Assembly is not machine code.** Assembly is text, machine code is bytes, and the ISA is the rulebook both obey. One line of assembly can become two instructions when a constant does not fit.

</Recap>

<Challenges>

#### Design a register field {/*design-a-register-field*/}

You are designing a 32-bit fixed-length ISA. You want an instruction of the form `op dest, src1, src2` — three registers named in every instruction. (a) If you want 32 registers, how many bits do the three register fields consume in total? (b) How many bits are left for the opcode and everything else? (c) A colleague proposes going to 128 registers "since transistors are cheap." What does that actually cost, and why is "transistors are cheap" answering the wrong question?

<Hint>

Naming one of N registers takes log₂(N) bits, rounded up. Do that once, then multiply by how many registers the instruction names.

</Hint>

<Solution>

**(a)** Naming one of 32 registers takes 5 bits, because 2⁵ = 32. Three register fields therefore consume:

```
 3 × 5 = 15 bits
```

**(b)** From a 32-bit instruction:

```
 32 − 15 = 17 bits left
```

for the opcode and any other field the format needs. That is a comfortable but not generous amount — it is roughly why real 32-bit ISAs have opcode space in the hundreds rather than the tens of thousands.

**(c)** 128 registers needs 7 bits each, so the three fields grow from 15 bits to **21**, leaving only 11 bits instead of 17. Six bits vanished from every instruction in the entire instruction set — including instructions that name no registers at all, because the format is fixed.

And that is why "transistors are cheap" is answering the wrong question. The cost of more registers is not the silicon to store them. It is **encoding space**, which is the one resource that does not get cheaper over time. A 32-bit instruction had 32 bits in 1985 and has 32 bits today. Moore's law made transistors cheap; it never made bits in an instruction word cheap, because that number is fixed by the contract.

(There is a second cost from earlier lessons too: more registers means a larger register file, more read ports, longer internal wires — and the slowest path sets the clock for the whole chip.)

</Solution>

#### Read a real instruction {/*read-a-real-instruction*/}

The ARM64 instruction `0x11000421` decodes as `add w1, w1, #1`, using bits 21–10 as a 12-bit constant, bits 9–5 as the source register and bits 4–0 as the destination. Working from that: (a) what would the instruction be if you changed the constant to 4? (b) Explain why a compiler cannot produce a single ARM64 instruction for `total = total + 5000`, and say what it must do instead.

<Solution>

**(a)** The constant sits in bits 21–10, so the value 1 is currently encoded as `000000000001` starting at bit 10. To make it 4, put `000000000100` there instead — that is, add 3 to the field, which means adding `3 << 10` to the instruction word:

```
 3 << 10 = 3072 = 0xC00

 0x11000421 + 0xC00 = 0x11001021    →  add w1, w1, #4
```

The other fields are untouched: same opcode, same registers. Only the twelve bits carrying the constant changed.

**(b)** The constant field is 12 bits, so it can hold 0 to 4,095. **5,000 does not fit.** There is no encoding of `add w1, w1, #5000`, and no compiler can invent one — the ISA simply does not contain that instruction.

What the compiler does instead is build the number in a register first, then add register to register:

```
 mov  w2, #5000        ; put the constant into a spare register
 add  w1, w1, w2       ; now both operands are registers
```

Two instructions and one extra register consumed, to add a number that a human would consider unremarkable. This is the bit budget being paid for in real code, and it is a good illustration of why "how big can a constant be?" is one of the first questions an ISA designer has to answer.

</Solution>

#### The migration meeting {/*the-migration-meeting*/}

Transfer task. Your company runs its backend on x86 servers. Someone proposes moving to ARM-based servers to cut the cloud bill, and the meeting produces three claims:

1. *"ARM is RISC, so it's simpler, so it will be faster."*
2. *"All our code is in Python and Go, so the instruction set doesn't affect us."*
3. *"We can just copy the binaries over — a program is a program."*

Assess each claim using this lesson, and say what you would actually check before agreeing to the migration.

<Solution>

**Claim 1 — "RISC is simpler so it's faster."** This confuses the ISA with the microarchitecture. The ISA says *what* the chip must do; performance comes from *how* it does it — pipeline depth, cache sizes, out-of-order execution, clock speed, memory bandwidth. A simple instruction set makes certain things cheaper (notably parallel decoding, which is a real advantage) but it does not make a chip fast on its own. A well-engineered x86 core can and often does outperform a modest ARM core. **The honest version of the claim is about performance per watt, not raw speed**, and it should be settled with a benchmark of your actual workload, not with an argument about ISA philosophy.

**Claim 2 — "It's all Python and Go, so the ISA doesn't matter."** Half right, and the wrong half is the expensive one. Your source code is portable — Go recompiles, Python runs on an interpreter that has been ported. But the ISA is still underneath, and it shows up wherever something is *not* pure source:

- Native extensions and libraries with compiled components must exist for ARM.
- Container images are built for a specific architecture; an x86 image will not run.
- Any dependency shipping precompiled binaries needs an ARM build.
- Anything with hand-tuned assembly or CPU-specific vector code needs an ARM path.

**Claim 3 — "Just copy the binaries."** No. A binary *is* machine code for one specific ISA — the actual byte patterns from this lesson. x86 bytes are not valid ARM instructions; the CPU would decode nonsense. Everything must be **recompiled**, or run under **emulation**, which works (the ISA is a contract that software can keep) but costs performance.

**What to check before agreeing:**

- Benchmark your real workload on both, comparing **cost per unit of work**, not clock speed.
- Inventory every dependency for ARM builds — this is usually where migrations actually stall.
- Confirm your build and CI can produce multi-architecture images, and plan to run both for a period.
- Check anything performance-critical that was tuned for x86 specifically.

The transferable point is the lesson's central distinction: **the ISA determines what your binaries are, and the microarchitecture determines how fast they run.** Claim 2 got the first one wrong, claim 1 got the second one wrong, and claim 3 got both wrong at once. ✓

</Solution>

</Challenges>

<LearnMore title="Pipelining and Branch Prediction" path="/learn/faza-0/modul-0-3/pipeline-branch-prediction">

You now know what a processor promises and how those promises are encoded. What remains is the trick that made processors fast: not doing one instruction at a time. Next lesson, the CPU starts several instructions before finishing any of them — which works beautifully until it reaches a branch and has to guess which way the program will go. Guessing right is why your computer is fast. Guessing wrong is why it sometimes isn't, and guessing *observably* is how one of the most famous security flaws of the last decade worked.

</LearnMore>
