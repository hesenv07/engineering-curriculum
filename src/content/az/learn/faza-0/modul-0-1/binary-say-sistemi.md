---
title: 'Binary say sistemi: 2-lik, 10-luq və 16-lıq'
---

<Intro>

1980-ci ildə buraxılan Pac-Man oyununun sonu yoxdur — nəzəri olaraq. Amma 255-ci səviyyəyə çatan oyunçular qəribə mənzərə görürdülər: ekranın sağ yarısı mənasız simvol yığınına çevrilir və oyun keçilməz olurdu. Oyunçular buna "kill screen" deyirdilər. Səbəb: Pac-Man səviyyə nömrəsini *bir byte-da* saxlayırdı — və 255-dən sonra sayğac dolub başa qayıdırdı. Bu dərsdə bitlərin ədədlərə necə çevrildiyini öyrənəcəksən və "255-dən sonra nə olur" sualının niyə oyunlardan raketlərə qədər hər yerdə eyni cavabı olduğunu görəcəksən.

</Intro>

<YouWillLearn>

- Say sisteminin əslində nə olduğu — və 10-luqla 2-liyin eyni maşın olması
- Binary ↔ decimal çevirmələri: mühəndislərin işlətdiyi sürətli üsul
- Əzbər bilinməli 2 dərəcələri və arxalarındakı real fəlakətlər (IPv4, Gangnam Style, Boeing 787, Y2038)
- Overflow nədir və niyə hər yerdə qarşına çıxır
- Hexadecimal: `#FF5733`, git hash və memory ünvanlarının deşifrəsi

</YouWillLearn>

## Saymaq nədir? {/*saymaq-nedir*/}

Say sistemləri haqda danışmazdan əvvəl gəl özümüzün 10-luq sistemə təzə gözlə baxaq. **345** yazanda əslində nə deyirsən?

> 345 = 3×100 + 4×10 + 5×1
>     = 3×10² + 4×10¹ + 5×10⁰

Hər mövqe 10-un bir dərəcəsidir; rəqəm o dərəcədən "neçə dənə" götürdüyümüzü göstərir. Buna **positional notation** (mövqeli yazılış) deyilir və bu, bəşər tarixinin ən böyük ixtiralarından biridir.

Müqayisə üçün Roma sistemini götür: MCMXCIV. Bu yazılışda "mövqe" anlayışı yoxdur, ona görə iki Roma ədədini sütunla vurmaq praktiki mümkünsüzdür. Roma imperiyası mühasibatı abakla aparırdı — yazı sistemi hesablamağa yaramırdı.

Mövqeli sistem + sıfır rəqəmi hesablamanı *mexaniki prosesə* çevirdi: qaydaları bilirsənsə, düşünmədən, addım-addım icra edirsən. "Düşünmədən, addım-addım icra" — tanış gəldi? Bu, alqoritmin tərifidir. Kompüterin mümkünlüyü məhz bu nöqtədən başlayır.

## Odometr: say sisteminin canlı modeli {/*odometr*/}

Köhnə maşınların mexaniki odometrini xatırla: yan-yana çarxlar, hər çarxda 0–9. Ən sağdakı çarx 9-dan bir də fırlananda 0-a qayıdır və solundakı çarxı bir addım itələyir: 09 → 10. "Onluq keçmə" dediyimiz şey budur.

İndi təsəvvür et: çarxlarda cəmi iki rəqəm var — 0 və 1.

<Diagram name="binary-say-sistemi/binary_odometer" height={280} width={720} alt="Beş odometr vəziyyəti ardıcıl göstərilir: 000, 001, 010, 011 və vurğulanmış 100. Aralarında +1 oxları. Son keçiddə (011-dən 100-ə) carry hadisəsi vurğulanıb: sağdakı iki dolu çarx 0-a qayıdır, soldakı çarx bir addım irəliləyir.">

Binary sayma: 0, 1, 10, 11, 100... Qayda zərrə qədər dəyişmir — sadəcə çarx daha tez dolur.

</Diagram>

Bütün say sistemləri eyni maşındır; fərq təkcə çarxdakı rəqəmlərin sayındadır. Buna **baza** deyilir. Binary-də eyni mövqeli qayda, baza 2 ilə işləyir:

```
1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰
      = 8 + 0 + 2 + 1
      = 11₁₀
```

Ən soldakı bit ən "bahalı"dır — **most significant bit (MSB)**; ən sağdakı ən "ucuz" — **least significant bit (LSB)**. Pul məntiqi ilə eynidir: 345 manatda soldakı 3 üç yüzlükdür, sağdakı 5 beş birlik.

<Note>

Binary hesab kompüterdən 250 il əvvəl kəşf olunub. Alman filosofu və riyaziyyatçısı **Leibniz** 1703-cü ildə binary hesab üzərində məqalə dərc etmişdi — ilhamlarından biri qədim Çin "Dəyişikliklər kitabı"nın (İ Çinq) heksaqramları idi: bütöv və qırıq xətlərdən ibarət 64 simvol, mahiyyətcə 6-bitlik kodlar.

Daha maraqlısı: ilk böyük elektron kompüter **ENIAC (1945) binary deyildi** — onluq sistemlə işləyirdi, hər rəqəm üçün 10 vəziyyətli lampa halqaları saxlayırdı. Keçən dərsdəki "etibarlılıq" arqumentini mühəndislər məhz ENIAC təcrübəsindən çıxardılar — sonrakı praktiki bütün maşınlar binary oldu.

</Note>

## Çevirmələr: iki istiqamət {/*cevirmeler*/}

### Binary → Decimal: çəkiləri topla {/*binary-decimal*/}

Hər 1-in altındakı 2 dərəcəsini yaz və topla:

<Diagram name="binary-say-sistemi/binary_weights" height={310} width={680} alt="110101 ədədinin altı biti qutularda göstərilir. Hər qutunun altında mövqe dərəcəsi (2⁵-dən 2⁰-a) və çəkisi (32, 16, 8, 4, 2, 1). Dəyəri 1 olan bitlər vurğulanıb və onlardan oxlar cəmə enir: 32 + 16 + 4 + 1 = 53.">

Yalnız 1 olan sütunlar öz çəkisini cəmə verir: 110101₂ = 53.

</Diagram>

Vərdiş məsləhəti: mövqe çəkilərini sağdan əzbər bil — **1, 2, 4, 8, 16, 32, 64, 128**. Bir müddət sonra `1101`-ə baxıb "13" deməyin sürəti `13`-ə baxıb "on üç" deməyin sürətinə çatacaq.

### Decimal → Binary: mühəndis üsulu {/*decimal-binary*/}

Dərsliklər "2-yə böl, qalıqları tərsinə yaz" öyrədir — işləyir, amma yavaşdır. Praktikada mühəndislər **"ən böyük 2 dərəcəsini çıx"** üsulu ilə düşünür.

**Nümunə — 53:**

| Çəki | Sığır? | Bit | Qalır |
|---|---|---|---|
| 32 (2⁵) | ✓ | `1` | 21 |
| 16 (2⁴) | ✓ | `1` | 5 |
| 8 (2³) | ✗ (8 > 5) | `0` | — |
| 4 (2²) | ✓ | `1` | 1 |
| 2 (2¹) | ✗ | `0` | — |
| 1 (2⁰) | ✓ | `1` | 0 |

**53 = 110101₂** — Yoxlama: 32 + 16 + 4 + 1 = 53 ✓

**Nümunə — 200:**

| Çəki | Sığır? | Bit | Qalır |
|---|---|---|---|
| 128 (2⁷) | ✓ | `1` | 72 |
| 64 (2⁶) | ✓ | `1` | 8 |
| 32 (2⁵) | ✗ | `0` | — |
| 16 (2⁴) | ✗ | `0` | — |
| 8 (2³) | ✓ | `1` | 0 |
| 4 (2²) | ✗ | `0` | — |
| 2 (2¹) | ✗ | `0` | — |
| 1 (2⁰) | ✗ | `0` | — |

**200 = 11001000₂**

**Nümunə — 255:** heç çıxmadan görmək olar. 255 = 256 − 1 = 2⁸ − 1, yəni 8 bitin hamısı 1: `11111111`. Bu naxışı yadda saxla — **"2ⁿ − 1 = n dənə 1"** qaydası hər yerdə qarşına çıxacaq: 255, 1023, 65535, 2147483647 — hamısı "bütün bitlər 1" ədədləridir.

<DeepDive>

#### Barmaqla 1023-ə qədər saymaq {/*barmaqla-saymaq*/}

Hər barmağını bir bit say: yumulu = 0, açıq = 1. Sağ əlin baş barmağı LSB olsun. 10 barmaq = 10 bit = 2¹⁰ = 1024 hal, deməli **0-dan 1023-ə qədər** saya bilərsən.

Adi sayma ilə 10-da qurtardığın yerdə binary sayma 100 dəfə uzağa gedir. Bu, "n bit = 2ⁿ" düsturunun əldə tutulan sübutudur — və eksponensial böyümənin gündəlik nümayişi.

</DeepDive>

## Overflow-u öz əlinlə yarat {/*overflow-sandpack*/}

Aşağıda 8-bitlik sayğac var — Pac-Man-ın səviyyə sayğacının eynisi. 250-dən başlayır. Düymələrlə artır və 255-dən sonra nə baş verdiyinə bax:

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

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>8-bit sayğac:</p>
      <div>
        {bits.split('').map((bit, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 36,
              height: 48,
              lineHeight: '48px',
              margin: 2,
              fontSize: 22,
              borderRadius: 8,
              border: '1px solid #888',
              background: bit === '1' ? '#087ea4' : 'transparent',
              color: bit === '1' ? 'white' : 'inherit'
            }}
          >
            {bit}
          </span>
        ))}
      </div>
      <h2>= {count}</h2>
      <div>
        <button onClick={() => add(1)}>+1</button>{' '}
        <button onClick={() => add(10)}>+10</button>{' '}
        <button onClick={() => { setCount(250); setOverflowed(false); }}>
          Sıfırla (250)
        </button>
      </div>
      {overflowed && (
        <p style={{ color: '#c1554d', fontFamily: 'system-ui' }}>
          <b>Overflow!</b> 255-dən sonra sayğac başa qayıtdı —
          Pac-Man-ın 256-cı səviyyədə "öldüyü" an budur.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Sayğacın dolub başa qayıtmasına **overflow** deyilir. 9-cu bitə yer yoxdur — o sadəcə itir, ədəd isə "dairənin" başına düşür:

<Diagram name="binary-say-sistemi/overflow_rollover" height={360} width={640} alt="Dairəvi siferblat 8-bitlik sayğacı təmsil edir: 0 yuxarıda, 64 sağda, 128 aşağıda, 192 solda, 255 isə 0-ın dərhal solunda. 255-dən 0-a keçən qırmızı ox '255 + 1 = 0' overflow hadisəsini göstərir.">

8-bit sayğac 256 vəziyyətli dairədir: 255-dən sonrakı addım yenidən 0-dır.

</Diagram>

## Əzbər biləcəyin 2 dərəcələri — və arxalarındakı fəlakətlər {/*2-dereceleri*/}

| Dərəcə | Dəyər | Harada yaşayır |
|---|---|---|
| 2⁸ | 256 | bir byte; RGB kanalı (0–255); Pac-Man kill screen |
| 2¹⁰ | 1 024 | KiB; "system" portların sərhədi |
| 2¹⁶ | 65 536 | port nömrələrinin tavanı; Excel-in köhnə sətir limiti |
| 2²⁴ | ~16,7 mln | "True color" — 3 byte-lıq rəng |
| 2³¹−1 | 2 147 483 647 | 32-bit signed int-in maksimumu |
| 2³² | ~4,29 mlrd | IPv4 ünvan fəzası; 32-bit RAM limiti (4 GiB) |
| 2⁶⁴ | ~1,8×10¹⁹ | müasir ünvan fəzası |

Cədvəl quru görünür, amma hər sətrin arxasında real hadisə dayanır:

**IPv4 tükənməsi.** İnternet ünvanı 32 bitdir → maksimum ~4,3 milyard ünvan. 1981-ci ildə bu, "tükənməz" görünürdü. Bu gün dünyada insandan qat-qat çox internetə qoşulan cihaz var və regional reyestrlər ünvan fondlarını 2011–2019 arası rəsmən tükətdilər. Evindəki 15 cihazın bir public IP arxasında gizlənməsi (NAT) və IPv6-nın (128 bit!) mövcudluğu — hamısı bu bir rəqəmin, 2³²-nin nəticəsidir.

**Gangnam Style hadisəsi (2014).** YouTube baxış sayğacı 32-bit signed int idi — tavan: 2 147 483 647. PSY-ın klipi bu rəqəmə yaxınlaşanda YouTube sayğacı təcili 64-bitə keçirdi və bunu zarafatla elan etdi: "Gangnam Style-ı int-də saxlaya biləcəyimizi düşünürdük, amma yanılmışıq."

**Boeing 787 (2015).** Aviasiya tənzimləyicisi FAA direktiv buraxdı: Dreamliner-in generator idarəetmə bloklarını hər 248 gündən bir söndürüb-yandırmaq lazımdır. Səbəb: daxili sayğac santisaniyələri 32-bit signed int-də sayırdı; 2³¹ santisaniyə ≈ 248 gün. Sayğac dolsa, generatorlar eyni anda özünü söndürə bilərdi.

**Y2038.** Unix sistemləri vaxtı "1 yanvar 1970-dən keçən saniyə" kimi, ənənəvi olaraq 32-bit signed int-də saxlayır. Bu sayğac **19 yanvar 2038, 03:14:07 UTC**-də dolur. Müasir sistemlər 64-bitə keçib, amma köhnə embedded avadanlıq — bankomatlar, sənaye kontrollerləri, köhnə routerlər — hələ də risk zonasındadır.

Ümumi dərs: **limitlər dizayn anında "çatılmaz" görünür, sistemlər isə dizaynerlərindən uzun yaşayır.** Bunu yadında saxla — system design fazasına qədər bizimlə gedəcək.

<DeepDive>

#### Şahmat taxtası və eksponensial intuisiya {/*sahmat-taxtasi*/}

Qədim əfsanə: şahmatın ixtiraçısı şahdan mükafat kimi "taxtanın 1-ci xanasına 1 buğda dəni, hər növbətiyə əvvəlkinin iki qatı" istəyir. Şah gülür, razılaşır. 64-cü xanada rəqəm 2⁶³-dür; cəmi isə 2⁶⁴−1 ≈ 18,4 kvintilyon dən — dünyanın min illik məhsulundan çox.

İkiqat artmanın gücü insan intuisiyasını həmişə aldadır. Mühəndis üçün bunun praktik üzü: **hər əlavə bit fəzanı ikiqat böyüdür.** 32 bitdən 64-ə keçid "2 dəfə çox" deyil — 4 milyard dəfə çoxdur. Əksinə də işləyir: bir bitə qənaət fəzanı yarıya endirir. Bu intuisiya alqoritmlər fazasında (niyə binary search O(log n)-dir) yenidən doğulacaq.

</DeepDive>

## Hexadecimal: binary-yə taxılan eynək {/*hexadecimal*/}

Binary dəqiqdir, amma insan gözü üçün fəlakətdir: `10101111010100110000...` — 32-bitlik bir ünvan 32 simvoldur. Göz sətri tutmur, transkripsiya səhvləri qaçılmazdır.

Həll zərif bir riyazi təsadüfə söykənir: **16 = 2⁴**. Bitləri sağdan 4-lük qruplara bölsək və hər qrupa bir simvol versək, yazı 4 dəfə qısalır və — ən vacibi — çevirmə hesablamasız, mexaniki əvəzləmə olur. 4 bit = 16 hal, deməli 16 simvol lazımdır: 0–9 bəs etmir, davamı hərflərlə: **A=10, B=11, C=12, D=13, E=14, F=15**.

<Diagram name="binary-say-sistemi/hex_grouping" height={320} width={680} alt="16 bitlik 1010111101010011 ədədi dörd 4-bitlik qrupa bölünür: 1010, 1111, 0101, 0011. Hər qrupdan ox aşağı enir və qrupun hex qarşılığını göstərir: A (10), F (15), 5, 3. Nəticə birləşir: 0xAF53.">

Hər 4-bitlik qrup bir hex simvoluna çevrilir — hesablama yox, əvəzləmə.

</Diagram>

`0x` prefiksi "bu hex-dir" konvensiyasıdır (C dilindən gəlir, hamı götürüb). Qızıl qayda: **bir byte = düz iki hex simvol.** `0xFF` = `11111111` = 255 — bir byte-ın tavanı.

İndi developer gündəliyindəki hex görüntülərini deşifrə edək:

- **`#FF5733`** — CSS rəngi = sadəcə 3 byte: qırmızı `FF` (255), yaşıl `57` (87), göy `33` (51). "16,7 milyon rəng" ifadəsi də buradandır: 3 byte = 24 bit = 2²⁴ kombinasiya.
- **`a3f9c21`** — git commit-i: SHA-1 hash-in (20 byte) ilk 7 hex simvolu. Git daxildə hər şeyi belə hash-lərlə ünvanlayır — DevOps fazasında dərinə gedəcəyik.
- **`3C:22:FB:9A:41:07`** — MAC ünvanı: şəbəkə kartının 6 byte-lıq zavod kimliyi, byte-lar iki nöqtə ilə ayrılıb.
- **`0x7ffee4b2c8d0`** — memory ünvanı: RAM-dakı bir byte-ın "poçt indeksi". Debugger-lər ünvanları həmişə hex göstərir.
- **`DEADBEEF`, `CAFEBABE`** — mühəndis folkloru: yalnız A–F hərflərindən söz düzəldib xüsusi dəyərləri işarələmək ənənəsi. `CAFEBABE` — Java class fayllarının ilk 4 byte-ıdır ("magic number"). Fayl formatlarının çoxu belə imza ilə başlayır — keçən dərsdəki "interpretasiya" probleminin praktik həlli: faylın özü "məni necə oxu" deyir.

<Pitfall>

Ən geniş yayılmış səhv: hex-i **ayrıca say sistemi kimi əzbərləmək** və binary ilə əlaqəsini görməmək.

Hex-in bütün varlıq səbəbi binary-ni kompakt göstərməkdir — o, sistemdən çox *eynəkdir*. Mühəndis `0xFF` görəndə beynində əvvəl "255" yox, "səkkiz dənə 1" canlanmalıdır; `0xF0` görəndə — "yuxarı 4 bit dolu, aşağı 4 boş". Bit maskaları, rəng kanalları, icazələr, şəbəkə maskaları — bu vərdiş hamısında işə düşəcək.

</Pitfall>

<DeepDive>

#### Octal (8-lik) hardan qalıb? {/*octal*/}

Hex-in kiçik qardaşı **octal** — bitlərin 3-lük qruplanması (8 = 2³), rəqəmlər 0–7. Köhnə maşınlarda populyar idi; bu gün bir əsas sığınacağı qalıb: **Linux fayl icazələri**.

`chmod 755`: hər rəqəm 3 bitdir — read/write/execute. 7 = `111` (rwx), 5 = `101` (r-x). Yəni 755 = sahibə hər şey, qalanlara oxu + icra. OS fazasında fayl sistemini keçəndə bu şifrə tam açılacaq.

Bir tələ də var: bir çox dildə `0` ilə başlayan ədəd octal sayılır — `010 == 8` sürprizi ilə nəsillər boyu developer baq tutub. Müasir dillər buna görə aydın `0o10` yazılışına keçir.

</DeepDive>

## Bonus intuisiya: 2-yə vurmaq = sürüşdürmək {/*bit-shift*/}

10-luq sistemdə bir ədədi 10-a vurmaq üçün nə edirsən? Sağına 0 yazırsan: 34 → 340. Rəqəmlər bir mövqe sola sürüşür.

Binary-də eyni fənd 2 ilə işləyir:

| İfadə | Binary | Onluq | |
|---|---|---|---|
| `13` | `00001101` | 13 | |
| `13 × 2` | `00011010` | 26 | bir bit sola sürüşdü |
| `13 × 4` | `00110100` | 52 | iki bit sola |
| `26 ÷ 2` | `00001101` | 13 | bir bit sağa |

Buna **bit shift** deyilir və CPU üçün sürüşdürmə vurmadan qat-qat ucuz əməliyyatdır. Kodda gördüyün `x << 1` (sola sürüşdür) və `x >> 1` (sağa) yazıları budur. CPU dərsində bunun niyə bu qədər sürətli olduğunu dövrə səviyyəsində görəcəyik.

<Recap>

- Bütün mövqeli sistemlər **eyni odometrdir** — fərq yalnız bazadadır. Binary-də hər mövqe 2-nin dərəcəsidir.
- Decimal → binary üçün mühəndis üsulu: **ən böyük 2 dərəcəsini çıx**. "2ⁿ − 1 = n dənə 1" (255, 1023, 65535...).
- **Hər əlavə bit fəzanı ikiqat böyüdür** — eksponensial böyümə intuisiyanı aldadır.
- Limitlər real fəlakətlər doğurur: Pac-Man (2⁸), Gangnam Style (2³¹), Boeing 787, IPv4 (2³²), Y2038. Hamısının adı birdir: **overflow**.
- **Hex = binary-nin 4-bitlik qruplarla kompakt yazılışı**; bir byte = düz iki hex simvol. `#FF5733`, git hash, MAC — hamısı hex geyimli byte-lardır.
- Octal chmod-da yaşayır (755 = rwx r-x r-x); binary-də ×2 = bir bit sola sürüşmə (`<<`).

</Recap>

<Challenges>

#### Çevir və yoxla {/*cevir-ve-yoxla*/}

45-i binary-yə çevir. Sonra cavabını çəkiləri toplamaqla yoxla.

<Solution>

Ən böyük 2 dərəcəsini çıx üsulu ilə:

```
45 − 32 = 13   → 2⁵ var
13 − 16 < 0    → 2⁴ yox
13 − 8  = 5    → 2³ var
 5 − 4  = 1    → 2² var
 1 − 2  < 0    → 2¹ yox
 1 − 1  = 0    → 2⁰ var
```

**45 = 101101₂.** Yoxlama: 32 + 8 + 4 + 1 = 45 ✓

</Solution>

#### Hesablamadan de {/*hesablamadan-de*/}

1023-ün binary yazılışı necədir? Heç bir çıxma aparmadan cavab ver.

<Solution>

1023 = 1024 − 1 = 2¹⁰ − 1. "2ⁿ − 1 = n dənə 1" qaydasına görə: **1111111111** (10 dənə 1).

Eyni məntiq: 255 = 8 dənə 1, 65535 = 16 dənə 1, 2147483647 = 31 dənə 1. Bu naxışı tanımaq gələcəkdə maska və limit hesablamalarında çox vaxt qazandıracaq.

</Solution>

#### Hex eynəyi {/*hex-eyneyi*/}

`0xFF` və `0xF0` binary-də nədir? Bəs decimal-da? Əvvəl binary-ni de — eynək vərdişini yoxlayırıq.

<Solution>

Hər hex simvolu 4 bitdir: F = `1111`, 0 = `0000`.

- `0xFF` = `11111111` — səkkiz dənə 1 → 255
- `0xF0` = `11110000` — yuxarı 4 bit dolu, aşağı boş → 240

Əgər beynin əvvəlcə bitləri "gördüsə" — vərdiş oturur. Bu görmə tərzi bit mask-larla işləyəndə (şəbəkə maskaları, icazələr, rəng kanalları) əsas alətin olacaq.

</Solution>

#### chmod şifrəsi {/*chmod-sifresi*/}

Linux-da `chmod 644 fayl.txt` əmri fayla hansı icazələri verir? (İpucu: hər rəqəm octal-dır, yəni 3 bit: read-write-execute.)

<Solution>

Hər rəqəmi 3 bitə aç:

- 6 = `110` → read ✓, write ✓, execute ✗ (sahib üçün)
- 4 = `100` → yalnız read (qrup üçün)
- 4 = `100` → yalnız read (qalan hamı üçün)

Yəni: sahib oxuyub yaza bilir, qalan hamı yalnız oxuyur — konfiqurasiya fayllarının klassik icazəsi. `755`-lə müqayisə et: orada execute biti də yanılıdır, ona görə skriptlərdə işlədilir.

</Solution>

</Challenges>
