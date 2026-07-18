---
title: 'İkilik Say Sistemi'
---

<Intro>

1980-ci ildə buraxılan Pac-Man-ın nəzəri olaraq sonu yoxdur. Lakin 255-ci səviyyəyə çatan oyunçular dizaynerlərin heç kimin görəcəyini düşünmədikləri bir şeylə qarşılaşdı: ekranın sağ yarısı zibil simvollara çevrildi, səviyyəni bitirmək mümkünsüz oldu. Oyunçular buna **kill screen** adını verdilər. Rəsm kodunda xəta yoxuydu, zədəli çip yoxdu — oyun öz səviyyə nömrəsini bir byte-da saxlayırdı, 255-dən sonra isə sayğac dolu bir sayğacın edə biləcəyi yeganə şeyi etdi. Bu dərsin sonunda həmin şeyin nə olduğunu, niyə eyni taleyin YouTube-u və Boeing 787-ni əhatə etdiyini, həm də `0xAF53` kimi rəqəmləri və əvvəlki dərsdən sirli `4869`-u onluq sayını oxuduğunuz kimi axıcı şəkildə necə oxuyacağınızı tam biləcəksiniz.

</Intro>

<YouWillLearn>

- Say sisteminin *əslində* nə olduğu — və niyə 10-lu həm 2-li eyni maşındır
- Binary-ni ani oxumaq (çəkiləri topla) həm sürətlə yazmaq (mühəndisin üsulu)
- Əzbərləməyə dəyər 2-nin qüvvətləri, həm hər birinin arxasındakı real fəlakətlər
- **Overflow** nədir — özünüz bir overflow törədəcəksiniz
- Hexadecimal: `#FF5733`, git hash-lərini həm hex dump-ları oxumağı asanlaşdıran "eynək"
- 2-yə vurmağın niyə yalnız bir shift olduğu — CPU-ların necə "fırıldatdığının" ilkin baxışı

</YouWillLearn>

## Saymaq bir maşındır {/*counting-is-a-machine*/}

2-li əsasa keçməzdən əvvəl, 10-lu əsasa təzə gözlərlə baxın — çünki bütün həyatınız boyu istifadə etdiniz amma heç vaxt *nə* olduğunu sormadınız. **345** yazanda əslında nə iddia edirsiniz?

```
345 = 3×100 + 4×10 + 5×1
    = 3×10² + 4×10¹ + 5×10⁰
```

Hər mövqe 10-un bir qüvvətidir; rəqəm o qüvvətin *neçəsini* götürəcəyini deyir. Bu sxem **positional notation** adlanır — bəşəriyyətin ən böyük ixtiralarından biri — bunu ən yaxşı onu olmayan bir sivilizasiyaya baş çəkərək görmək olar. 1994-cü ilin Roma rəqəmi MCMXCIV-dir. Bu notasiyada "mövqe" anlayışı yoxdur, buna görə MCMXCIV-i XVII-yə kağız üzərindəki vurmağa çalışın — bu praktiki olaraq mümkünsüzdür, həqiqətən də Roma İmperiyası real hesablamanı hesablama lövhəsinde edirdi, çünki *yazı sistemi hesablaya bilmirdi*.

Positional notation (sıfır rəqəmi ilə birlikdə) oyunu dəyişdirdi: arifmetika **mexaniki prosedura** çevrildi — qaydaları bilsəniz, addım-addım yerinə yetirirsiniz, zəka tələb olunmur. Sabit qaydaların addım-addım yerinə yetirilməsi, zəka olmadan... bunu *alqoritm* tərifi kimi tanıya bilərsiniz. Kompüterlərin mövcud ola bilməsi məhz buradan başlayır — rəqəmləri necə yazdığımızdan.

## Odometr: bir maşın, istənilən əsas {/*the-odometer*/}

Köhnə bir avtomobilin mexaniki odometrasını düşünün: yan-yana çarxlar, hər biri 0–9 rəqəmlərini daşıyır. Ən sağdakı çarx 9-dan keçəndə 0-a qayıdır və sol qonşusunu bir addım irəli itələyir. Bu itələmə — **carry** — saymanın bütün mexanizmidir.

İndi eyni odometri qurun, lakin hər çarxa yalnız iki rəqəm yazın: 0 və 1. Başqa heç nə dəyişmir:

<DiagramGroup>

<Diagram name="binary-number-system/odometer_decimal" height={300} width={340} alt="A two-wheel decimal odometer showing 09, with the right wheel marked 'wheel is full'. A +1 arrow leads to the wheels showing 10, highlighted. Caption: the right wheel resets to 0 and pushes the left wheel one step — a carry. Note at the bottom: the wheel fills after 10 digits.">

10-lu əsas: çarx on rəqəmdən sonra dolur, sonra carry edir.

</Diagram>

<Diagram name="binary-number-system/odometer_binary" height={300} width={340} alt="A two-wheel binary odometer showing 01, with the right wheel marked 'wheel is full!'. A +1 arrow leads to the wheels showing 10, highlighted. Caption: exactly the same carry rule, so 10 here means two, not ten. Note at the bottom: the wheel fills after just 2 digits.">

2-li əsas: eyni maşın — çarx sadəcə *iki* rəqəmdən sonra dolur.

</Diagram>

</DiagramGroup>

Binary-de saymaq belədir: 0, 1, sonra çarx dolu — carry! — 10, 11, yenə dolu — 100, 101, 110, 111, 1000... Hər say sistemi bu eyni odometridir; yeganə fərq bir çarxa neçə rəqəm sığmasıdır, bu sayı isə **əsas** adlanır. Beləliklə `10` "on" demək deyil; "bir çarx dolusu, üstəlik sıfır" deməkdir — 10-lu əsasda on, 2-li əsasda iki, 16-lı əsasda on altı.

Daha irəli getməzdən əvvəl iki termin. Binary rəqəmdə ən soldakı bit ən "bahalı"dır — **most significant bit (MSB)**; ən sağdakı ən ucuz bit — **least significant bit (LSB)**. Eyni məntiq pulla: $345-də aparıcı 3 üç yüzdür, sondakı 5 isə beş təndir.

<Note>

Binary arifmetikası kompüterlərdən iki əsr yarım əvvəl yarandı. Filosof-riyaziyyatçı **Leibniz** 1703-cü ildə bu mövzuda məqalə nəşr etdi — qismən qədim Çin *I Ching*-in heksaqramlarından ilhamlanaraq: bərk və qırıq xətlərdən qurulmuş 64 simvol, mahiyyətcə 6-bitlik kodlar. Həm əvvəlki dərsdə gördünüz kimi, ilk böyük elektron kompüter (ENIAC) bütün bunları görmürdü-işitmir kimi davranıb onluq sistemi seçdi — bir dəfə. Dərs mənimsənildi.

</Note>

## Binary oxumaq: çəkiləri topla {/*reading-binary*/}

Binary rəqəm oxumaq üçün hər mövqenin altına 2-nin qüvvətini yazın və `1` olan mövqeləri toplayın:

<Diagram name="binary-number-system/binary_weights" height={330} width={720} alt="The six bits of 110101 shown in boxes. Under each box its power of two (2 to the 5th down to 2 to the 0th) and its weight: 32, 16, 8, 4, 2, 1. The bits equal to 1 are highlighted in blue, and curved arrows flow from those columns down into the sum: 32 plus 16 plus 4 plus 1 equals 53. Caption advises memorizing the weights right to left: 1, 2, 4, 8, 16, 32, 64, 128.">

110101₂ = 53. Yalnız 1 olan sütunlar "ödəyir".

</Diagram>

Qurmağa dəyər vərdiş: çəkiləri sağdan əzbərləyin — **1, 2, 4, 8, 16, 32, 64, 128** (əvvəlki dərsin açar oyuncağında onlarla tanış olduğunuz). Bir həftəlik praktikadan sonra `1101`-i "on üç" kimi oxumaq `13`-ü "on üç" kimi oxumaq qədər sürətli olur. O zamana qədər, maşın işinizi təsdiq etsin:

```js
parseInt('110101', 2)
```

<ConsoleBlock level="info">

53

</ConsoleBlock>

## Binary yazmaq: mühəndisin üsulu {/*writing-binary*/}

Dərsliklər onluqdan binary-ə çevirməyi "2-yə böl, qalıqları tərsinə topla" şəklinde öyrədir. Bu işləyir, mövcudluğunu bilməyiniz lazımdır — lakin praktikada mühəndislər başqa cür düşünür: **sığan ən böyük 2-nin qüvvətini çıxart.** Bu üsul ağlınızda daha sürətlidir həm rəqəmi soldan sağa qurur — oxuyacağınız kimi.

**Nümunə — 53:**

```
53-ə sığan ən böyük qüvvət: 32 (2⁵)  → bit 5 = 1,  qalıq 21
21-ə sığar: 16 (2⁴)                   → bit 4 = 1,  qalıq 5
8 sığmır (8 > 5)                       → bit 3 = 0
4 sığır                                → bit 2 = 1,  qalıq 1
2 sığmır                               → bit 1 = 0
1 sığır                                → bit 0 = 1,  qalıq 0

53 = 110101₂        Yoxlama: 32 + 16 + 4 + 1 = 53 ✓
```

**Nümunə — 200:**

```
128 sığır → 1, qalıq 72
 64 sığır → 1, qalıq 8
 32 sığmır → 0
 16 sığmır → 0
  8 sığır → 1, qalıq 0
  4, 2, 1 → 0, 0, 0

200 = 11001000₂     Yoxlama: 128 + 64 + 8 = 200 ✓
```

**Nümunə — 255:** heç bir çıxartma lazım deyil. 255 = 256 − 1 = 2⁸ − 1, *2-nin qüvvətindən bir aşağı olan* rəqəm həmişə bütün birlərin ardıcıllığıdır: `11111111`. Bu nümunəni yaxşı mənimsəyin — **2ⁿ − 1 = n ədəd bir** — çünki 255, 1023, 65535, 2,147,483,647 hamısı "bütün bit-lər 1" rəqəmlərdir, bu kursda dönüb-dönüb qarşınıza çıxacaqlar.

Hər iki istiqamət, maşın tərəfindən doğrulanmış:

```js
(255).toString(2)
```

<ConsoleBlock level="info">

'11111111'

</ConsoleBlock>

Shell-iniz də binary danışır — bash əsas-prefiksli ədədlər qəbul edir:

<TerminalBlock>

echo $((2#110101))
53

</TerminalBlock>

<DeepDive>

#### Barmaqlarınızla 1023-ə qədər sayın {/*counting-on-fingers*/}

Hər barmağı bir bit kimi düşünün: bükülmüş = 0, qaldırılmış = 1, sağ baş barmaq LSB olaraq. On barmaq = 10 bit = 2¹⁰ = 1024 hal — beləcə adi barmaq sayımının 10-da dayandığı yerdə binary **0-dan 1023-ə** qədər gedə bilir, bir yüz dəfə uzaqlaşır. Bu əvvəlki dərsin əsas formulasıdır (n bit = 2ⁿ), canlı formada, həm eksponensial artışın bir ön baxışıdır. Mühəndislər nəslinin xəbərdarçılığı: 4 həm 132 rəqəmləri iclasda etmək istəmeyəcəyiniz əl hərəkətləri yaradır.

</DeepDive>

## Sayğacı özünüz sındırın {/*break-the-counter*/}

Pac-Man-ın ölümünü yenidən canlandırma vaxtı. Aşağıda 8-bitlik bir sayğac var — əvvəlki dərsin açar paneli, indi öz başına sayır, öyrəndiyiniz üç notasiyada göstərilir. 250-dən başlayır. Onu kənara itələyin:

<Sandpack>

```js
import { useState } from 'react';

export default function OverflowToy() {
  const [count, setCount] = useState(250);
  const [overflowed, setOverflowed] = useState(false);

  function add(n) {
    const raw = count + n;
    setOverflowed(raw > 255);
    setCount(raw % 256);
  }

  const bits = count.toString(2).padStart(8, '0');
  const hexv = count.toString(16).toUpperCase().padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>An 8-bit level counter, like Pac-Man's:</p>
      <div>
        {bits.split('').map((bit, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 38, height: 50, lineHeight: '50px',
              margin: 2, fontSize: 22, borderRadius: 8,
              border: '1px solid #888',
              background: bit === '1' ? '#087ea4' : 'transparent',
              color: bit === '1' ? 'white' : 'inherit'
            }}
          >
            {bit}
          </span>
        ))}
      </div>
      <h2>= {count}   ·   0x{hexv}</h2>
      <div>
        <button onClick={() => add(1)}>+1 level</button>{' '}
        <button onClick={() => add(10)}>+10</button>{' '}
        <button onClick={() => { setCount(250); setOverflowed(false); }}>
          reset (250)
        </button>
      </div>
      {overflowed && (
        <p style={{ color: '#c1554d', fontFamily: 'system-ui' }}>
          <b>Overflow!</b> Past 255 the counter wrapped back to the start —
          this is the exact moment the kill screen appears.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Tavanını keçən sayğac **overflow** adlanır, odometr bunu mükəmməl izah edir: dolu çarxlar seriyası hamısı sıfıra yuvarlanır. Doqquzuncu bit üçün yer yoxdur — o düşür, say isə diskin başlanğıcına qayıdır:

<Diagram name="binary-number-system/overflow_rollover" height={420} width={640} alt="A circular dial with sixteen tick marks representing an 8-bit counter: 0 at the top, 64 on the right, 128 at the bottom, 192 on the left, and 255 marked in red just left of the top. A red arc with an arrowhead crosses the seam from 255 past 0, under the heading 255 + 1 = 0. Center text reads 8-bit counter, 256 states, then back to 0. The caption lists Pac-Man level 256, Gangnam Style views, Boeing 787 and Y2038 as the same wheel with bigger dials.">

8-bitlik sayğac 256 mövqeli bir diskdir. 255-dən sonrakı addım həmişə 0-dır.

</Diagram>

## 2-nin qüvvətləri — onların arxasındakı fəlakətlər {/*powers-of-2-and-their-disasters*/}

| Qüvvət | Dəyər | Harada yaşayır |
|--------|-------|----------------|
| 2⁸ | 256 | bir byte; RGB kanalı; Pac-Man kill screen |
| 2¹⁰ | 1,024 | əvvəlki dərsdən KiB; "sistem portları" sərhədi |
| 2¹⁶ | 65,536 | şəbəkə port nömrələrinin tavanı; Excel-in köhnə sətir limiti |
| 2²⁴ | ~16.7 milyon | "true color" — hex bölümündə tanışacağınız 3-baytlıq rəng |
| 2³¹−1 | 2,147,483,647 | 32-bitlik signed integer-in maksimumu |
| 2³² | ~4.3 milyard | IPv4 ünvan sahəsi; 32-bitlik sistemlərin 4 GiB limiti |
| 2⁶⁴ | ~1.8×10¹⁹ | müasir ünvan sahəsi |

Quru bir cədvəl — hər sıranın *nə etdiyini* eşidənə qədər:

**IPv4 tükənməsi.** İnternet ünvanı 32 bitdir, deməli ən çox ~4.3 milyard mövcuddur. 1981-ci ildə bu sonsuz görünürdü; bu gün insandan çox qoşulmuş cihaz var, regional ünvan registrləri 2011-2019-cu illlər arasında rəsmi olaraq tükəndi. Evinizdəki on beş cihazın bir ümumi ünvanın arxasında gizlənməsinin (NAT adlı bir fənd), həm IPv6-nın 128 bit ilə mövcud olmasının səbəbi — hər ikisi bu tək sıradan irəli gəlir. Şəbəkə fazası tam hekayəni danışır.

**Gangnam Style hadisəsi (2014).** YouTube-un baxış sayğacı 32-bitlik signed integer idi — tavan 2,147,483,647. PSY-nin videosu buna yaxınlaşanda YouTube tələsik sayğacı 64 bitə yenidən qurdu həm bildirişi bir gülümsəmə ilə elan etdi: heç vaxt 32-bitlik integer-i aşacaq video... "lakin PSY ilə tanış olmazdın əvvəl."

**Boeing 787 (2015).** FAA bir uçuşa yararlılıq direktivi çıxardı: Dreamliner-in generator idarə vahidlərini ən azı hər 248 gündə yenidən başladın. Daxili sayğac saniyənin yüzdə birini 32-bitlik signed integer-də sayırdı, 2³¹ yüzdəbirlik ≈ 248 gün. Sayğacın dolmasına icazə versəniz, bütün generatorlar eyni anda kapana düşə bilərdi. Rəsmi müvəqqəti həll — *təyyarəni yenidən başlat* — bu modulun sonuna çatanda tanış gəlməlidir.

**Y2038.** Unix sistemləri ənənəvi olaraq zamanı "1 yanvar 1970-dən bu yana saniyələr" kimi 32-bitlik signed integer-də sayır. Bu sayğac **19 yanvar 2038-ci il, 03:14:07 UTC-də** dolur. Müasir sistemlər 64 bitə keçib (yeni tavan günəşdən uzun ömür sürür), lakin onilliklər uzunu xidmət ömrü olan embedded avadanlıq — sənaye idarəediciləri, ödəniş terminalları, unudulmuş routerlər — hələ orada tikirdir.

Dörd sıra, bir nəticə, bu kursun dönüb qayıdacağı bir nəticə: **məhdudiyyətlər dizayn zamanı əlçatmaz görünür, lakin sistemlər dizaynerlərin fərziyyələrini yaşatmır.** Namco-da heç kəs 256-cı səviyyəni düşünməmişdi; YouTube-da heç kəs iki milyard baxışı düşünməmişdi. Kiminsə bir yerdə 2045-ci ildə overflow edəcək sayğacı dizayn etdiyi müəyyəndir.

<DeepDive>

#### Şahmat taxtası, ya da ikiləmənin niyə hər kəsi aldatması {/*the-chessboard*/}

Köhnə bir əfsanə: şahmatın ixtiraçısı kralddan əlçatımlı bir mükafat istəyir — taxtanın birinci xanasına bir buğda dənəsi, qalan 63 xananın hər birinə əvvəlkinin iki qatı. Kral dilənçinin istəyinə güldü həm razılaşdı. Yalnız 64-cü xana 2⁶³ dənəyə borcluydu; cəmi, 2⁶⁴ − 1 ≈ 18.4 kvintilyon, minilliyin dünya məhsulunu aşır. Kral, versiyadan asılı olaraq, ya ixtiraçını edam edir ya da onu dənələri saymağa məcbur edir.

Eksponensial ikiləmə hər dəfə insan intuisiyasını məğlub edir, mühəndis üçün isə praktik nəticə belədir: **hər əlavə bit sahəni iki dəfə artırır.** 32-bitdən 64-bitə keçmək "iki dəfə böyük" deyil — dörd milyard dəfə böyükdür. Əksinə də işləyir: bir bit azaltmaq təmsil edə biləcəyinizi yarıya enir. Bu intuisiya alqoritmlər fazasında güclə qayıdır — binary axtarışın milyardlıq bir siyahıda bir adı yalnız 30 addımda tapmasını izah edir.

</DeepDive>

## Hexadecimal: bit-ləri oxumaq üçün eynək {/*hexadecimal*/}

Binary dəqiqdir, lakin uzunluqda oxunmaz: 32-bitlik dəyər `10110100...`-dən 32 simvoldur, insan gözü izi itirir. Həll yolu şanslı bir təsadüfdən yararlanır: **16 = 2⁴**, buna görə bit-ləri dörd qrupuna bölüb hər qrupa bir simvol versəniz, mətn 4× kiçilir həm — əsas hissə — çevrilmə *saf əvəzetmə* olur, heç vaxt arifmetika lazım deyil. Dörd bitin 16 halı var, buna görə 16 simvol lazımdır: 0–9 tükənir, əlifba qalanını verir — **A=10, B=11, C=12, D=13, E=14, F=15**.

<Diagram name="binary-number-system/hex_grouping" height={370} width={720} alt="The sixteen bits 1010 1111 0101 0011 shown in four boxes of four bits each. Blue arrows drop from each group to its hex digit: A (10), F (15), 5, 3. Brackets underneath pair the hex digits two by two, each labeled 'one byte = exactly two hex digits'. The result reads 0xAF53, with a caption noting that since 16 equals 2 to the 4th, the conversion is pure substitution with no arithmetic.">

Hər 4-bitlik qrup bir hex rəqəminə çevrilir; hər *cüt* hex rəqəmi tam bir byte-dır.

</Diagram>

`0x` prefiksi "ardından gələn hex-dir" üçün universal konvensiya (C dilinde yarandı, hamı qəbul etdi). Diaqramdakı mötərizə isə ucadan söyləməyə dəyər qızıl qayda: **bir byte = tam iki hex rəqəm.** `0xFF` = `11111111` = 255 — bir byte-ın tavanı həm Sandpack sayğacımızın tavanı.

İndi əvvəlki dərsdən borc. Hex dump-u xatırlayırsınızmı?

<TerminalBlock>

xxd hello.txt
00000000: 4869                                     Hi

</TerminalBlock>

İndi həmin sıradakı hər simvol sizdədir. `48` iki hex rəqəmi kimi yazılmış bir byte-dır: `4` = `0100`, `8` = `1000`, beləliklə byte `01001000`-dir — onluqda 72, mətn müqaviləsi isə onu `H`-yə çevirir. Eynilə `69` → `01101001` → 105 → `i`. Maşınınızdakı alət razılaşır:

<TerminalBlock>

printf '%x\n' 44883
af53

</TerminalBlock>

Eynək bir dəfə taxıldıqdan sonra hex mühəndisin iş gününüdə *hər yerdə* görünür:

- **`#FF5733`** — CSS rəngi sadəcə **3 byte**-dır: qırmızı `FF` (255), yaşıl `57` (87), mavi `33` (51). "16.7 milyon rəng" ifadəsi bu dərsin cədvəlindən gəlir: 3 byte = 24 bit = 2²⁴ kombinasiya.
- **`a3f9c21`** — git commit ID-si: çox daha uzun bir hash-in ilk 7 hex rəqəmi. Git daxilindəki *hər şeyi* belə hash-lərlə ünvanlayır — DevOps fazası bu qaputu açır.
- **`3C:22:FB:9A:41:07`** — MAC ünvanı: şəbəkə kartının fabrik kimliyi olan 6-baytlıq dəyər, hər cüt iki nöqtə ilə ayrılır.
- **`0x7ffee4b2c8d0`** — yaddaş ünvanı, RAM-dakı tək bir byte-ın "poçt kodu"; debuggerlər ünvanları həmişə hex-də çap edir.
- **`DEADBEEF`, `CAFEBABE`** — mühəndislik folkloru: yalnız A–F rəqəmlərindən yazılmış sözlər, dump-da göze çarpmaq üçün xüsusi dəyərləri işarələmək üçün istifadə edilir. `CAFEBABE` həqiqətən hər Java class faylının ilk 4 byte-ıdır — onun *magic number*-ı, əvvəlki dərsin müqavilə sualını cavablandıran imzası.

<Pitfall>

**Hex öyrəniləcək başqa bir say sistemi deyil. Binary üçün bir göstərmə formatıdır.**

Klassik səhv hex↔onluq çevirmələrini ayrı bir bacarıq kimi əzbərləmək həm hex-i bit-lərlə heç vaxt əlaqələndirməməkdir. Bu bütün məqamı qaçırır: hex mövcuddur *yalnız* binary-ni yığcam şəkildə göstərmək üçün. Praktik bir mühəndis `0xFF` gördükdə beyinddə ilk atəşlənən "255" deyil, "səkkiz bir"dir; `0xF0` "yüksək dörd bit qurulmuş, aşağı dörd bit sıfır" kimi oxunur. Bu refleksi məşq edin — bit maskaları, icazələr, rəng kanalları, şəbəkə maskları ilə qarşılaşdıqda ödəyən refleks budur. Hex bir cüt eynəkdir, eynəklər isə *bit-ləri görmək* üçündür.

</Pitfall>

<DeepDive>

#### Bəs 8-li əsas hara getdi? {/*where-did-octal-go*/}

Hex-in kiçik qardaşı var: **octal**, 8-li əsas — bit-lər *üçlü* qruplanır (8 = 2³), rəqəmlər 0–7. Üç bölünən söz ölçüləri olan köhnə maşınlarda çiçək açdı, bu gün isə bir şanlı gücləndə yaşayır: **Unix fayl icazələri**. `chmod 755`-də hər rəqəm üç bit — oxumaq/yazmaq/icra etmək: 7 = `111` (rwx), 5 = `101` (r-x). Beləliklə 755 "sahibi hər şeyi edə bilər, başqaları oxuyub icra edə bilər" deməkdir. OS fazası bütün sxemi açıqlayır.

Bir mina qalır: bir çox dil aparıcı `0`-ı octal kimi işləyir, beləliklə `010 == 8` — sıfırla doldurulmuş rəqəmləri koda kopyalayan mühəndis nəsillərini şaşırdan sürpriz. Müasir dillər məhz bu səbəbdən açıq `0o10`-a keçir.

</DeepDive>

## Bonus reflex: ×2 bir shift-dir {/*multiplying-by-shifting*/}

Positional notation-dan son bir hədiyyə. 10-lu əsasda 10-a vurmaq üçün nə edirsiniz? Hesablamırsınız — sona sıfır əlavə edirsiniz: 34 → 340. Hər rəqəm bir mövqe sola sürüşür. Binary-də eyni fənd 2 ilə işləyir:

```
13      = 00001101
13 × 2  = 00011010   (26) — hər bit bir sola sürüşdü
13 × 4  = 00110100   (52) — iki mövqe
26 ÷ 2  = 00001101   (13) — bir mövqe sağa
```

Bu **bit shift**-dir, əksər dillərdə `x << 1` (sola) həm `x >> 1` (sağa) kimi yazılır, CPU üçün isə real vurmadan kəskin şəkildə ucuzdur — çarxları fırlatmaqdan çarxları sürüşdürmək ucuzdur. Modul 0.2-dəki məntiqi qapılardan gerçək bir toplayıcı quranda, shift-in niyə demək olar ki, pulsuz olduğunu dövrə səviyyəsinde görəcəksiniz.

<Recap>

- Hər positional sistem **eyni odometrdir** — yalnız çarx ölçüsü (əsas) fərqlidir. Binary çarxlar iki rəqəmdən sonra carry edir, `10` isə *iki* deməkdir.
- Binary-ni **çəkiləri toplayaraq** oxuyun (1, 2, 4, 8, 16, 32, 64, 128-i əzbərləyin); **sığan ən böyük qüvvəti çıxararaq** yazın. Həm **2ⁿ − 1 = n ədəd bir**: 255, 1023, 65535 bütün birlərin sırasıdır.
- Dolu sayğac yuvarlanır: **overflow**. Pac-Man (2⁸), Gangnam Style (2³¹), Boeing 787, Y2038 — daha böyük diskli eyni çarxdır — nəticə isə *məhdudiyyətlər dizaynerlərin fərziyyələrini yaşatmır*.
- **Hər əlavə bit sahəni iki dəfə artırır** (şahmat taxtası). 64-bit, 32-bitin iki qatı deyil; dörd milyard qatıdır.
- **Hex binary üçün eynəkdir**: hər 4 bit üçün bir rəqəm, **hər byte üçün iki rəqəm**, `0x` prefiksi. `#FF5733` 3 byte-dır, `0xFF` beyninizde "255"-dən əvvəl "səkkiz bir" yanmalıdır.
- Octal `chmod`-da yaşayır (hər rəqəm 3 bit); 2-yə vurmaq bir **bit shift**-dir (`<<`) — CPU iqtisadiyyatının ilkin baxışı.

</Recap>

<Challenges>

#### Çevir həm yoxla {/*convert-and-verify*/}

45-i mühəndisin üsulu ilə binary-ə çevirin. Sonra cavabı çəkiləri toplayaraq yoxlayın.

<Hint>

45-ə sığan ən böyük 2-nin qüvvəti hansıdır? Oradan başlayın həm qalığı izləyin.

</Hint>

<Solution>

```
45 − 32 = 13   → 2⁵ var
13 − 16 < 0    → 2⁴ yoxdur
13 − 8  = 5    → 2³ var
 5 − 4  = 1    → 2² var
 1 − 2  < 0    → 2¹ yoxdur
 1 − 1  = 0    → 2⁰ var
```

**45 = 101101₂.** Yoxlama: 32 + 8 + 4 + 1 = 45 ✓ — maşından da soruşa bilərsiniz: `parseInt('101101', 2)` 45 qaytarır.

</Solution>

#### Hesablamadan cavab verin {/*answer-without-computing*/}

1023-ün binary-dəki ifadəsi nədir? Çıxartmaya icazə yoxdur — bu dərsdəki bir nümunədən cavab verin.

<Solution>

1023 = 1024 − 1 = 2¹⁰ − 1, "2ⁿ − 1 = n ədəd bir" qaydası isə **1111111111** (on bir) dərhal verir.

Eyni reflex bütün ailəni açıqlayır: 255 səkkiz bir, 65535 on altı bir, 2,147,483,647 otuz bir birdən ibarətdir. Baxışda "bütün bit-lər qurulmuş" rəqəmi tanımaq, sonrakı kurslarda şəbəkə maskaları həm integer limiti ilə üz-üzə gəldikdə real vaxt qənaət edir.

</Solution>

#### Hex eynəyi testi {/*the-hex-glasses-test*/}

`0xFF` həm `0xF0` binary-dədir nədir? Onluqda nədir? Əvvəlcə binary cavab verin — bu tapşırıq hansı refleksin atəşləndiyini yoxlayır.

<Solution>

Hər hex rəqəm dörd bitdir: F = `1111`, 0 = `0000`.

- `0xFF` = `11111111` — səkkiz bir → 255
- `0xF0` = `11110000` — yüksək dörd bit qurulmuş, aşağı dörd bit sıfır → 240

Onluq dəyərlərdən əvvəl bit-lər beyninizde göründüsə, eynək vərdişi kök atır. "Bit-ləri gör" refleksi bit maskaları kursda bir dəfə girdikcə əsas alətinizə çevrilir — şəbəkə maskaları, fayl icazələri, rəng kanalları hamısı ona söykənir.

</Solution>

#### Dump-u əllə açıqlayın {/*decode-the-dump-by-hand*/}

Əvvəlki dərsdə bir alət sizin üçün açıqladı. Bu dəfə hər addımı özünüz edin: fayl `48 65 79` byte-larını ehtiva edir. Hər birini binary-ə, sonra onluğa çevirin — mətn müqaviləsinin 72 → `H` xəritələdiyini, ardıcıl sayaraq (73 → `I`, 74 → `J`...) bilərək, 101 → `e` həm 121 → `y` olduğunu istifadə edərək sözü yazın.

<Solution>

- `48`: `4` = `0100`, `8` = `1000` → `01001000` = 64 + 8 = **72** → `H`
- `65`: `0110 0101` = 64 + 32 + 4 + 1 = **101** → `e`
- `79`: `0111 1001` = 64 + 32 + 16 + 8 + 1 = **121** → `y`

Fayl **"Hey"** deyir — siz isə ham hex-dən binary üzərindən onluğa həm mətné qədər tam yolu əllə keçdiniz. Oxuyacağınız hər hex dump bu eyni boru kəmərinin içindədir; son sıçrayışı mümkün edən simvol cədvəli öz dərsini (həm öz müharibələrini) bu modulda gözləyir.

</Solution>

#### İcazələr şifrəsi {/*the-permissions-cipher*/}

Transfer tapşırığı: bir həmkar `chmod 644 config.yaml` icra edir həm nə etdiyini soruşur. Octal-dan (hər rəqəm 3 bit: oxumaq-yazmaq-icra etmək) üç rəqəmi açıqlayın həm bir cümlə ilə cavab verin — sonra `chmod 777`-in niyə hər təhlükəsizlik yoxlamasında qırmızı bayraq olduğunu izah edin.

<Solution>

Hər rəqəmi genişləndin: 6 = `110` (oxumaq ✓ yazmaq ✓ icra etmək ✗) sahibi üçün; 4 = `100` (yalnız oxumaq) qrup üçün; 4 = `100` (yalnız oxumaq) hamı üçün. Bir cümlə: *"Faylı hamı üçün oxuna bilən, lakin yalnız siz üçün yazıla bilən etdiniz — konfiqurasiya faylları üçün klassik parametr."*

`777` = `111 111 111` — sistemdəki hər istifadəçi üçün hər icazə, yazma həm icra etmə daxil, tam yad adamlar üçün. İcazə xətalarını icazə anlayışını aradan qaldıraraq "düzəldir", buna görə təhlükəsizlik yoxlamaları onu bir fişek kimi görür. Tam inode-həm-icazə mexanizması OS fazasında gəlir; siz artıq dekoderə sahibsiniz.

</Solution>

</Challenges>

<LearnMore title="Mənfi Ədədlər: İki Tamamlayıcı" path="/learn/faza-0/modul-0-1/negative-numbers">

Artıq *müsbət* ədədləri oxuya, yaza həm overflow edə bilirsiniz. Lakin hardware-da mənfi işarəsi yoxdur — kompüter −5-i necə saxlayır? Cavab mühəndisliyin ən elegant fəndlərindən biridir, yanlış gitdikdə nə baş verdiyinin hekayəsi isə bir Avropa raketi həm yarım milyard dollar fişek içərir.

</LearnMore>
