---
title: 'Bit və byte: informasiya nədir'
---

<Intro>

Telefonundakı şəkil, dinlədiyin mahnı, bu saytdakı mətn, bankdakı balansın — hamısı eyni şeydən ibarətdir: milyardlarla 0 və 1. Amma niyə məhz 0 və 1? Niyə kompüter bizim kimi 10 rəqəmlə işləmir? Bu sualın cavabı riyaziyyatda yox, *fizikada* gizlənir — və bütün computer science həmin cavabın üstündə qurulub.

</Intro>

<YouWillLearn>

- İnformasiyanın ən kiçik vahidi — bit — nədir
- Kompüterlərin binary işləməsinin əsl (fiziki) səbəbi
- Byte niyə məhz 8 bitdir — və bunun arxasındakı tarix
- KB ilə KiB fərqi: "1 TB" diskin niyə 931 GB görünməsi
- "Hər şey byte-dır" prinsipi: eyni bitlərin fərqli mənaları

</YouWillLearn>

## İşıq açarı ilə mesajlaşma {/*isiq-acari-ile-mesajlasma*/}

Otağındakı işıq açarını götür. İki halı var: yanır və sönüb. Bu açarla qonşu binadakı dostuna mesaj ötürə bilərsənmi?

Bəli — əvvəlcədən razılaşırsınız: "yanır" = hə, "sönüb" = yox. Bir açar sənə 2 mümkün mesaj verir.

İndi 2 açar götür. Kombinasiyalar: yanır-yanır, yanır-sönüb, sönüb-yanır, sönüb-sönüb — artıq 4 mesaj. 3 açar = 8 mesaj. Hər yeni açar imkanları **ikiqat** artırır.

<Diagram name="bit-ve-byte/light_switches" height={280} width={640} alt="Üç sıra işıq açarı: 1 açar iki hal verir (2 mesaj), 2 açar dörd kombinasiya verir (4 mesaj), 3 açar səkkiz kombinasiya verir (8 mesaj). Hər sırada açarların yanılı/sönülü vəziyyətləri və qarşısında mümkün mesaj sayı göstərilir.">

Hər əlavə açar mümkün kombinasiyaların sayını ikiqat artırır.

</Diagram>

Kompüter — trilyonlarla belə mikroskopik açarın yığınıdır. Hər açarın adı **transistor**-dur (elektriklə idarə olunan, saniyədə milyardlarla dəfə çevrilə bilən açar), hər birinin halı isə bir **bit** informasiya daşıyır.

## Bit: informasiyanın atomu {/*bit-informasiyanin-atomu*/}

1948-ci ildə Bell Labs-da işləyən Claude Shannon "A Mathematical Theory of Communication" məqaləsini dərc etdi — bu, informasiya nəzəriyyəsinin doğum sənədidir. Shannon göstərdi ki, *istənilən* məlumat — mətn, səs, şəkil — "hə/yox" suallarının ardıcıllığına çevrilə bilər. Ən kiçik informasiya vahidi bir "hə/yox" cavabıdır: **bit** (*binary digit* sözlərinin qısaltması).

Bir bitin iki dəyəri var: `0` və ya `1`. Bundan kiçik informasiya mövcud deyil.

Bit sayı artdıqca təmsil oluna bilən halların sayı belə böyüyür:

| Bit | Fərqli hal | Real dünyada nəyə bəs edir |
|---|---|---|
| 1 | 2 | hə / yox |
| 2 | 4 | dörd istiqamət (↑ ↓ ← →) |
| 4 | 16 | bir hexadecimal rəqəm |
| 8 | 256 | bir ASCII simvol, bir rəng kanalı |
| 16 | 65 536 | bir port nömrəsi |
| 32 | ~4,3 milyard | bir IPv4 ünvanı |
| 64 | ~18 kvintilyon | müasir CPU-nun bir "sözü" |

Cədvəlin arxasındakı düsturu əzbər bil — bütün kurs boyu qayıdacaq:

**n bit = 2ⁿ fərqli hal**

Aşağıdakı interaktiv nümunədə 8 açarı (yəni 8 biti) özün çevir və hansı ədədin alındığına bax:

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
      <p style={{ marginBottom: '12px', color: '#404756' }}>Bitlərə klik elə:</p>
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
        Bir byte (8 bit) 0-dan 255-ə qədər{' '}
        2⁸ = 256 fərqli dəyər tuta bilir.
      </p>
    </div>
  );
}
```

</Sandpack>

Hamısını 1 elə — 255 alacaqsan: bir byte-ın tavanı. Bu rəqəmi yadda saxla, növbəti dərsdə onun başına gələnləri görəcəyik.

## Niyə məhz 2? Niyə 10 yox? {/*niye-mehz-2*/}

Bu, hesablama tarixinin ən mühüm mühəndislik qərarıdır və səbəbi **etibarlılıqdır** — riyazi gözəllik yox.

Elektron dövrədə rəqəm gərginliklə (voltage) təmsil olunur. Tutaq ki, 10-luq sistem qurmaq istəyirik: 0V = "0", 0.5V = "1", 1V = "2"... 4.5V = "9". Problem budur: real dövrədə gərginlik heç vaxt dəqiq durmur. Temperatur, elektrik noise-u, komponentlərin köhnəlməsi onu daim titrədir. Ölçdün, 2.3V gəldi — bu "4"-dür, yoxsa "5"? Səhv qaçılmazdır.

İkilik sistemdə isə cəmi iki hal var: "gərginlik var" və "gərginlik yoxdur", aralarında geniş boş zona. Siqnal xeyli əyilsə belə, 0-la 1-i qarışdırmaq demək olar mümkün deyil.

<Diagram name="bit-ve-byte/voltage_noise" height={340} width={720} alt="İki qrafik yan-yana. Solda: 10 səviyyəli sistem — 0V-dan 4.5V-a qədər sıx düzülmüş 10 zolaq, üstündə titrəyən (noise-lu) siqnal xətti bir neçə yerdə qonşu zolağa keçir, ora qırmızı X işarələri qoyulub. Sağda: binary sistem — yalnız iki geniş zona (aşağıda '0', yuxarıda '1'), ortada böyük boş buffer zonası; eyni dərəcədə titrəyən siqnal xətti heç vaxt yanlış zonaya düşmür, yaşıl ✓ işarəsi.">

Noise hər iki siqnalı eyni qədər titrədir — amma binary-də səhv üçün yer qalmır.

</Diagram>

**Binary — noise-a qarşı sığortadır.** Kompüterlər 0 və 1-lə işləmir ona görə ki, bu, riyazi cəhətdən xüsusidir; ona görə işləyir ki, iki halı ayırd etmək fiziki cəhətdən demək olar səhvsizdir.

<Note>

Binary yeganə cəhd olmayıb. SSRİ-də 1958-ci ildə **Setun** adlı ternary (üçlük: −1, 0, +1) kompüter qurulmuşdu və bəzi hesablamalarda hətta daha səmərəli idi. Daha maraqlısı: ilk böyük elektron kompüter **ENIAC (1945) binary deyildi** — onluq sistemlə işləyirdi və hər rəqəm üçün 10 vəziyyətli lampa halqaları saxlayırdı. Mühəndislər "etibarlılıq" dərsini məhz ENIAC təcrübəsindən çıxardılar — ondan sonrakı praktiki bütün maşınlar binary oldu.

</Note>

## Byte: niyə məhz 8? {/*byte-niye-mehz-8*/}

Bitlər tək-tək işlətmək üçün çox xırdadır — onları qruplaşdırırıq. 8 bitlik qrup **byte** adlanır. Amma 8 təbiət qanunu deyil, **tarixi razılaşmadır**.

1950–60-cı illər xaos dövrü idi: 6-bitlik, 7-bitlik, 9-bitlik byte-larla işləyən maşınlar yaşayırdı. "Byte" sözünü 1956-cı ildə IBM mühəndisi Werner Buchholz uydurub — ingiliscə *bite* ("dişləm") sözündən; "bit" ilə qarışmasın deyə i hərfini y ilə əvəz ediblər.

Dönüş nöqtəsi 1964-cü ildir: dövrünün ən uğurlu kompüteri **IBM System/360** 8-bitlik byte üzərində quruldu və bütün bazar ona uyğunlaşdı. 8 həm də praktik idi: ingilis əlifbasının böyük-kiçik hərflərini, rəqəmləri və işarələri rahat tuturdu, üstəlik 2-nin dərəcəsi idi.

Yarım byte-a (4 bit) zarafatdan doğub ciddiləşən terminlə **nibble** ("qurtum") deyilir — hexadecimal dərsində qarşına çıxacaq.

<DeepDive>

#### 8-bit olmayan dünyalar {/*8-bit-olmayan-dunyalar*/}

Byte-ın 8 olması o qədər oturuşub ki, standartlar sənədlərində qarışıqlıq olmasın deyə ayrıca söz işlədilir: **octet** — "dəqiq 8 bit". Şəbəkə protokollarının rəsmi sənədlərində (RFC-lərdə) "byte" yox, məhz "octet" yazılır, çünki sənədlər yazılanda hələ 9-bitlik byte-lı maşınlar (məsələn, PDP-10 — 36-bitlik sözlər, 9 bitlik hissələr) real istifadədə idi.

Başqa bir iz: ASCII kodlaşması 7-bitlikdir, 8 yox. Səbəb: 1963-cü ildə hər bit bahalı idi və 128 simvol ingilis mətni üçün bəs edirdi. Sonradan "artıq qalan" 8-ci bit fərqli ölkələrdə fərqli əlavə simvollara verildi — və illərlə davam edən kodlaşma xaosu doğdu. Bu hekayənin davamını — Unicode və UTF-8-in dünyanı necə xilas etdiyini — bir neçə dərs sonra görəcəksən.

</DeepDive>

## KB, MB, GB — və "itən" gigabaytlar {/*kb-mb-gb*/}

Böyük həcmlər üçün prefikslər işlədirik, amma burada sənayenin ən məşhur qarışıqlıqlarından biri yaşayır. İki fərqli "kilo" var:

| Marketinq dili (onluq) | Texniki dil (ikilik) |
|---|---|
| 1 KB = 1 000 byte | 1 KiB = 1 024 byte (2¹⁰) |
| 1 MB = 10⁶ byte | 1 MiB = 2²⁰ byte |
| 1 GB = 10⁹ byte | 1 GiB = 2³⁰ byte |
| disk istehsalçıları işlədir | RAM və əməliyyat sistemləri işlədir |

Nəticə hər developer-in başına gəlib: mağazadan "1 TB" disk alırsan (istehsalçı sayır: 10¹² byte), sistem onu GiB ilə ölçür və **~931 GB** göstərir. Heç nə itməyib — sadəcə iki fərqli lüğət toqquşub. Bu qarışıqlıq ABŞ-da disk istehsalçılarına qarşı real kollektiv məhkəmə iddialarına səbəb olub — indi qutularda xırda şriftlə "1 GB = 1 billion bytes" yazılır.

<Pitfall>

**İnternet sürəti bitlə, fayl həcmi byte-la ölçülür.**

"100 Mbps" = saniyədə 100 mega**bit** = ~12,5 mega**byte**. 1 GB fayl bu sürətlə ~80 saniyəyə düşür, 10-a yox.

Kiçik **b** = bit, böyük **B** = byte. Provayderlər bu qarışıqlığı çox sevir — "100 meqabitlik" tarif "100 meqabaytlıq" səslənəndə 8 dəfə sürətli görünür.

</Pitfall>

## Hər şey byte-dır — mənanı interpretasiya verir {/*her-sey-byte-dir*/}

Bu dərsin aparıcı ideyası: kompüter üçün mətn, şəkil, mahnı, proqram arasında **heç bir fərq yoxdur**. Hamısı byte ardıcıllığıdır. Fərqi yaradan — həmin byte-ları hansı qaydayla *oxumağımızdır*.

<Diagram name="bit-ve-byte/same_bytes_three_meanings" height={320} width={680} alt="Mərkəzdə iki byte göstərilir: 01001000 01101001. Ondan üç ox ayrılır. Birinci ox 'mətn kimi oxu (ASCII)' etiketi ilə 'Hi' sözünə aparır. İkinci ox '16-bit ədəd kimi oxu' etiketi ilə 18537 rəqəminə aparır. Üçüncü ox 'piksel kimi oxu' etiketi ilə boz-göy rəng nümunəsinə aparır.">

Eyni iki byte — üç fərqli məna. Byte-ın öz "tipi" yoxdur.

</Diagram>

`01001000 01101001` — mətn qaydasıyla oxusan "Hi"-dır, 16-bitlik ədəd kimi oxusan 18 537. Byte-ın üstündə "mən mətnəm" yazılmayıb.

Fayl uzantıları (.jpg, .mp3, .txt) əslində elə bu interpretasiya qaydasını bildirən etiketlərdir. Bir .jpg faylını mətn redaktorunda açanda gördüyün "zibil" — yanlış qaydayla oxunmuş byte-lardır. Növbəti dərslər məhz bu qaydaları bir-bir açır: ədədlər necə kodlanır, mənfilər necə, kəsrlər necə, mətn necə.

<Recap>

- İnformasiyanın atomu **bit**-dir: 0 və ya 1. Düstur: **n bit = 2ⁿ fərqli hal.**
- Kompüterlər binary işlədir, çünki iki gərginlik halını ayırmaq **fiziki cəhətdən etibarlıdır** — səbəb mühəndislikdir, riyaziyyat yox.
- **Byte = 8 bit** — IBM System/360-dan gələn tarixi standart, təbiət qanunu deyil.
- KB (1000) ≠ KiB (1024): "1 TB" diskin 931 GB görünməsinin səbəbi. **Mbps ≠ MBps.**
- Kompüterdə hər şey byte-dır; mənanı **interpretasiya** verir — bu ideya bütün kursun açarıdır.

</Recap>

<Challenges>

#### Neçə bit lazımdır? {/*nece-bit-lazimdir*/}

Bir oyunda personajın 4 halı var: dayanıb, qaçır, tullanır, uçur. Bu halı saxlamaq üçün minimum neçə bit lazımdır? Bəs hallar 5 olsaydı?

<Solution>

4 hal üçün **2 bit** bəs edir: 2² = 4 (məsələn `00` dayanıb, `01` qaçır, `10` tullanır, `11` uçur).

5 hal üçün 2 bit artıq bəs etmir (2² = 4 < 5), deməli **3 bit** lazımdır: 2³ = 8. Bəli, 3 kombinasiya "boş" qalacaq — bitlər tam ədədlə gəlir, ehtiyacın isə yox. Bu "yuvarlaqlaşdırma" ideyası ilə (n hal üçün ⌈log₂ n⌉ bit) kurs boyu çox rastlaşacaqsan.

</Solution>

#### Yükləmə nə qədər çəkəcək? {/*yuklenme-ne-qeder-cekecek*/}

İnternetin 50 Mbps-dir. 3 GB-lıq oyun update-i təxminən nə qədərə düşəcək? (Yuvarlaq hesabla.)

<Solution>

Əvvəl biti byte-a çevir: 50 Mbps ÷ 8 = **6,25 MB/s**.

3 GB ≈ 3000 MB. 3000 ÷ 6,25 = **480 saniyə = 8 dəqiqə**.

Əgər Mbps-i "MB/s" kimi oxusaydın, cavabın 1 dəqiqə alınardı — 8 dəfə səhv. Kiçik b / böyük B fərqi məhz burada pul kimi "ödənilir".

</Solution>

#### Dəstək xidmətinə cavab yaz {/*destek-xidmetine-cavab-yaz*/}

Dostun sənə yazır: "512 GB telefon aldım, amma parametrlərdə 476 GB göstərir. Məni aldadıblar? Geri qaytarım?" Ona iki cümləlik texniki cavab yaz.

<Solution>

Nümunə cavab: "Səni aldatmayıblar — istehsalçı 512 GB deyəndə 512 milyard byte nəzərdə tutur, telefonun sistemi isə həcmi 2³⁰-luq gigabaytla (GiB) ölçür: 512 × 10⁹ ÷ 2³⁰ ≈ 476. Yaddaşın hamısı yerindədir, sadəcə iki fərqli ölçü vahidi eyni adla işlədilir."

Yoxlama: 512 000 000 000 ÷ 1 073 741 824 ≈ 476,8 ✓

</Solution>

</Challenges>
