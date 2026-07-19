---
title: "Mətn: ASCII-dən UTF-8-ə"
---

<Intro>

Sentyabr 1992-ci ilin bir axşamı, Nyu-Cersi kafesinde, Unix-in həm-yaradıcısı Ken Thompson — adının ötən dərsdə `NUXI`-yə çevrildiyini izlədiyiniz həmin sistemin — Rob Pike baxarkən bir yer örtüyü üzərində bir kodlama sxemi cızırdı. Bell Labs-ın iki mühəndisi qırıq saydıqları standart təklifinə cavab vermək üçün günlər verilmişdi; yeməyin sonuna qədər daha yaxşı bir şeyləri var idi, bir həftə ərzindəki əməliyyat sistemi tamamilə ona keçirildi. Həll etdikləri problem nəhəng idi: hesablamanın mətni qarşılıqlı anlaşılmaz idi — eyni byte-lar bir maşında Fransızca, başqa birində Yunanca, üçüncüsündə cəfəngiyat yazırdı — sənayenin rəsmi düzəlişləri isə Yer üzündəki hər mövcud faylı və aləti pozmaqda davam edirdi. Yer örtüyü dizaynı *heç nəyi* pozmadı. Bu gün ona **UTF-8** deyilir, veb-in 98%-dən çoxunu daşıyır, mühəndislik tarixinin ən uğurlu geriyə-uyğun dizaynı olduğu arqumentlidir. Bu dərs mətn hekayəsidir: 72-ni `H`-ya uyğunlaşdıran 1963 kontraktı (Dərs 1-dən bu kurs üzərindəki bir borc), `é`-ni `Ã©`-ya çevirən bir-byte-lı imperiyalar, hər insan simvolunu tutmağa çalışan cədvəl — və yer örtüyü kodlamanın necə işlədiyini bit-bit, çünki bu dərs bitmədən əllə emoji kodlayacaqsınız.

</Intro>

<YouWillLearn>

- **ASCII**: 128 yuvalı kontrakt, gizlicə gözəl daxili strukturu, niyə `H` = 72
- Byte-ın yuxarı 128 yuvası müharibəçi **code page**-lərə necə çevrildi — və **mojibake**-nin dəqiq mexanikası (`café` → `cafÃ©`, `привет` → `Ð¿Ñ€Ð¸Ð²ÐµÑ‚`)
- **Unicode**: hər şeyi düzəldən ayrılma — *code point* bir ədəddir, *encoding* byte-lardır, bunlar fərqli kontraktlardır
- Yer örtüyündən **UTF-8**: dörd byte-şablonu, `é`, `€`, `😀`-ı əllə kodlamaq
- UTF-8-in niyə qalib gəldiyi: ASCII-uyğun, özünü-sinxronlayan, endianness-dən azad — UTF-16-nın xəyalının hələ dilinizi hansı yerdə bürüdüyü
- İstehsalla əlaqə quran qaydalar: "düz mətn" yoxdur, uzunluq dörd fərqli ədəddir, MySQL-in `utf8`-i UTF-8 deyil

</YouWillLearn>

## 128 yuvalı kontrakt {/*the-128-slot-contract*/}

Dərs 1-dən bəri "mətn kontraktı" vekselli bir vəd idi: *nəsə* cədvəl 72-ni `H`-ya, 105-i `i`-yə uyğunlaşdırırdı, bu kurs ona qarşı borc alırdı — `Hi`, `Hey`, hex dökümlər. Ödəmə vaxtı. Cədvəl **ASCII**-dir — Məlumat Mübadiləsi üçün Amerika Standart Kodu, 1963-cü ildə tamamlandı — 7-bit kontraktdır: **128 yuva**, 0–127 nömrələnib, Amerika ingiliscəsinin ehtiyac duyduğunu düşündüyü hər simvol üçün.

Komitə simvolları təsadüfi yerləşdirmədi; bitlerin içinə struktur qurdu, o struktur bu gün hələ maaşınızı ödəyir:

<Diagram name="text-representation/ascii_map" height={360} width={720} alt="A horizontal bar of 128 slots divided into four equal 32-slot blocks. Block 0 to 31, dimmed, labeled 'control characters (invisible): newline 10, carriage return 13, tab 9, bell 7'. Block 32 to 63 labeled 'space, punctuation, digits', with slots 48 to 57 highlighted in blue and labeled 'digits 0-9'. Block 64 to 95 labeled 'uppercase A-Z', with slot 72 marked H = 72. Block 96 to 127 labeled 'lowercase a-z'. Below the bar, a zoom panel compares A = 01000001 with a = 01100001, the single differing bit (value 32) highlighted in red, captioned 'one bit apart — the case bit'.">

Dörd təmiz 32-yuvalı blok. Rəqəmlər 48–57-dədir, böyük hərf 65-dən başlayır, kiçik hərf 97-dən — bu ədədlərin heç biri təsadüf deyil.

</Diagram>

Bu 60-illik cədvəldəki qəsdli mühəndisliyə baxın:

- **Rəqəmlər**: `'0'` 48 = `0110000`-dır. *Rəqəm kodunun aşağı dörd biti rəqəmin özüdür* — `'7'` `0110111`-dir, aşağı nibble `0111` = 7. Simvolu rəqəm dəyərinə çevirmək `c − 48`-dir, ya da sadəcə yuxarı bitləri maskelemek. 1963-cü ildə analitikanı ucuzlaşdırmaq üçün dizayn edilib.
- **Hərf bitki**: `A` = 65 = `01000001`; `a` = 97 = `01100001`. Hər hərf və kiçik hərf əkizi **tam bir bitdə** fərqlənir — bit 5, 32 dəyəri. Böyüklükdən kiçiklüyə keçid *bir biti silmekdir*; böyük-kiçik hərfə həssas olmayan müqayisə *bir biti maskeləmekdir*. Köhnə analizcılarda bit hiylələri görəndə (`c | 0x20` kiçik hərflə), söykəndikləri kontrakt budur.
- **Yuvalar 0–31** görünməz **control character**-ları saxlayır — simvol deyil, alan cihaza *göstərişlər*, teletype dövrünün xəyalları: 10 `\n`-dir (sətir keçidi), 13 `\r`-dir (daşıyıcı qayıtması — sözün əsl mənasında "yazı maşınının daşıyıcısını geri sürüşdür", Windows fayllarının hələ iki-byte-lı qazıntı `\r\n` ilə satırları bitirməsinin səbəbi), 9 tab-dır, 0 `NUL`-dur, 7-ci yuva `BEL` isə terminalın zəngini fiziki çalırdı. Hələ çalır: yaxınınızdakı terminalda `printf '\a'`.

Üç dərsdən bəri borcu ödəmək: `H` 72-dir, çünki H 8-ci hərfdir, böyük hərf 64 + 1-dən başlayır. Bu kursda deşifrə etdiyiniz hər hex döküm bu cədvəl idi, işləyirdi.

<Note>

ASCII qaçınılmaz deyildi. IBM-in System/360-ı — Dərs 1-də 8-bit byte-ı və Dərs 3-də two's complement-i standartlaşdıran 1964 maşını — IBM-in rəqib öz cədvəli **EBCDIC** ilə göndərildi, bu cədvəldə əlifba hətta ardıcıl deyil (deşik-kart zonalarının mirası olaraq A–Z-nin *içindəki* boşluqlar var). EBCDIC bu gün hələ dünyanın kart əməliyyatlarının böyük hissəsini işləyən mainframe-lərdə işləyir, bu isə haradasa bir bankın sınır kodunun iki cədvəl arasında, simvol-simvol, tam Dərs 5-in `htons`-u kimi — kontraktlar arasında sərhəd nəzarəti — çeviri etdiyini bildirir.

</Note>

## Bir byte, çox imperiya {/*one-byte-many-empires*/}

ASCII 7 bit istifadə etdi; byte 8 təklif edir. O ehtiyat bit yuvalar **128–255** deməkdir: xəritənin bütöv bir ikinci yarısı, rəsmi olaraq boş. Dünyanın qeyri-ingiliscə danışanları ona ümidsizliklə ehtiyac duyurdu — Fransız *café* yaza bilmir, Alman *Straße* yaza bilmir, Ruslar 128 Amerika yuvasında ümumiyyətlə heç nə yaza bilmir.

Beləliklə hər kəs yuxarı yarıya müstəmləkəcilik etdi — *fərqli şəkildə*. Nəticələr **code page**-lər idi: hamısı 0–127-dən razılaşan, yuxarısında hər şeydən ayrılıqda gedən onlarla qarşılıqlı uyğunsuz kontrakt. ISO 8859-1 ("Latin-1") 128–255-i Qərb Avropa hərifləriylə doldurdu; ISO 8859-7 ora Yunanca qoydu; ISO 8859-5 və Sovet KOI8-R ora Kiril qoydu (*fərqli düzənləmələrdə*, əlbəttə); Windows Windows-1252 kimi öz variantlarını göndərdi; yazı sistemi 128 yuvaya güldüyü Yaponiya Shift-JIS kimi çox-byte-lı sxemlər qurdu.

Nəticə indi tam texniki dəqiqliklə deyə biləcəyiniz bir cümlədur: **127-dən yuxarı byte-ın hansı code page-in yazdığını bilmədən heç bir mənası yoxdur.** Byte `0xE9` Latin-1 altında `é` *dir*, ISO 8859-7 altında isə `ι` *dur* — "kimi görünür" deyil, *dır*: hər kontrakt daxilən qüsursuzdur, Dərs 5-in iki endianness-i kimi. Fransız maşını ilə Yunan maşını heç bir xəta mesajı qaldırılmadan, hər biri digərinin milli şeirini doğma cəfəngiyat olaraq oxuyaraq illərcə fayl mübadiləsi edə bilərdi. Byte-lar heç vaxt yanlış deyildi. Sadəcə iki kontrakt var idi, müqavilə yox.

## Mojibake: yanlış gözlüklə oxumaq {/*mojibake-reading-with-the-wrong-glasses*/}

Həmin sınırda istehsal edilən cəfəngiyatın adı var — **mojibake**, Yaponca "simvol çevrilməsi", onu ən çox çəkənlər tərəfindən icat edildi. Ən məşhur nümunəsi, min e-mailda gördüyünüz `Ã©`, indi byte-byte izah etmə gücünüzdadır. Budur müasir (UTF-8) göndərici tərəfindən yazılmış *café* bir Latin-1 alıcısı tərəfindən oxunur:

<Diagram name="text-representation/mojibake_pipeline" height={340} width={720} alt="A pipeline. On the left, the word café. It becomes five byte boxes: 63, 61, 66, then C3 and A9 tinted blue with a bracket labeled 'é in UTF-8 — one character, two bytes'. An arrow labeled 'read under the Latin-1 contract' leads to five character boxes: c, a, f, then Ã and © tinted red, assembling into the output cafÃ© with a red label 'two characters — the pair was never recognized'.">

Beş doğru byte, bir yanlış kontrakt. İki-byte-lı simvol `é` iki bir-byte-lı simvol olaraq oxunur — Dərs 5-in anaqram imzası, indi mətndə.

</Diagram>

```
Göndərici (UTF-8):     c    a    f    é
byte-lar:              63   61   66   C3 A9      ← é İKİ byte-dır

Alıcı (Latin-1):       63→c  61→a  66→f  C3→Ã  A9→©

Ekran göstərir:        cafÃ©   ✗
```

İlk üç byte sınırı toxunulmaz keçir — 128-dən aşağıda *hər* kontrakt razılaşır (bu fikri saxlayın; yer örtüyünün şah hərəkətidir). Zərər faktiki olaraq yuxarı yuvalara ehtiyacı olan simvolla məhdudlaşır. Mojibake-nin bu qədər tanınan *toxumasının* da səbəbi budur: qeyri-ASCII simvol eyni kiçik Latin cəfəngiyat dəstinə, adətən `Ã` və ya `Ð` ilə başlayaraq çevrilir. Rusca *привет* eyni yanlış gözlüklerden `Ð¿Ñ€Ð¸Ð²ÐµÑ‚` olur — hər Kiril hərfi iki simvollu `Ð·`-şəkilli cütə çevrilir, ötən dərsin sonunda vəd edilən tam sətir. Öyrədilmiş göz xarabalığın özündən oxuyur: "aparıcı `Ã` klasterləri — Latin-1 olaraq oxunan UTF-8; aparıcı `Ð` — Kiril UTF-8; səhifənin başında `ï»¿` — yanlış kontrakt ilə göstərilən UTF-8 **byte order mark**-ı (`EF BB BF`, Dərs 5-dəki endianness-in epizodu)." Mojibake küy deyil; `NUXI` kimi, öz datanızdır, yanlış gözlüklər geyinib, gözlüklər isə barmaq izləri buraxır.

Cinayət yerini Dərs 1-in ən köhnə alətiylə birbaşa izləyə bilərsiniz:

<TerminalBlock>

printf 'café' | xxd
00000000: 6361 66c3 a9                             caf..

</TerminalBlock>

Dörd simvol, *beş* byte — `xxd`-nin yalnız 32–126 yuvalarına güvənən ASCII sütunu isə iki-byte-lı `é`-ni iki nöqtə olaraq render edir. Hətta hex-döküm alətiniz kontrakt qərarı verir.

## Unicode: insanlıq üçün bir cədvəl {/*unicode-one-table*/}

1980-ci illərin sonuna qədər son oyun aydın idi: daha yaxşı code page deyil, **sonuncu cədvəl** — hər insan yazı sisteminin hər simvoluna bir ədəd təyin edən bir universal reyestr. Bu layihə **Unicode**-dur (versiya 1.0, 1991). Onun ədədləri **code point** adlanır, `U+` üstəgəl hex olaraq yazılır: `A` U+0041, `é` U+00E9, `€` U+20AC, `😀` U+1F600, Azərbaycan `ə`-si isə U+0259-dur. Boşluq U+0000-dan U+10FFFF-ə qədər gedir — **1,114,112 yuva**, bunlardan hər canlı yazı, qədim Misir heroqlifləri, riyaziyyat əlifbaları, bəli, emoji — mətinə bərkidilmiş bəzəklər deyil, eyni cədvəlin tam vətəndaşları — daxil olmaqla təxminən 150,000-i indiyə qədər təyin edilib.

Lakin Unicode-nun ən dərin fikri böyük cədvəl deyil. Bu, bütün bu modulun sizi hazırladığı anlayış hərəkəti olan *kontraktların ayrılmasıdır*:

**Code point bir ədəddir. Ədəd byte deyil.** "é U+00E9-dur" demək bir faylda nə yaşadığı haqqında *hələ heç nə* demir — tam Dərs 5-in 8080 dəyərinin byte-larından hansının əvvəlcə getdiyi haqqında heç nə demədiyi kimi. Soyut ədəd ilə fiziki byte-lar arasında ikinci bir kontrakt, **encoding** olmalıdır, Unicode isə qəsdən bir neçəyə icazə verir:

- **UTF-32**: hər code point bir 32-bit tam ədəd kimi. Sadə, vahid — İngilizce mətni dörd qat böyüdür (hər ASCII hərfi üç `00` byte dolgu alır), həm də Dərs 5-in xəbərdar etdiyi tam çox-byte-lı vahidlər olan 32-bit tam ədədlər olduğu üçün tam **endianness problemi** miras alır.
- **UTF-16**: 65,536 yuvanın — 2¹⁶, Dərs 2-də etibarsız olmağı öyrəndiyiniz ədəd — insanlığın heç vaxt ehtiyacı olacağı hər simvolu tutacağı 90-cı il əvvəli fərziyyəsi altında UCS-2 olaraq doğdu. Simvol başına iki byte, nöqtə. Windows NT, Java, JavaScript hamısı onu qəbul etdi... sonra Unicode 65,536-dan böyüdü, fərziyyə çöküşə uğradı (*məhdudiyyətlər dizayn zamanı uçatılmaz görünür; sistemlər dizaynerlərin fərziyyələrindən uzun ömür sürürlər* — dördüncü dərs ardıcıl), UTF-16-ın qaçış-lük cütləri ilə yenidən uyğunlaşdırılması lazım gəldi. Həm də **BOM** tələb edir — U+FEFF byte order mark-ı, byte-ları endianness-ə görə `FE FF` ya da `FF FE` olaraq gəlir, Lilliput-un müharibəsini mətn fayllarınızda daimi sakin edir.
- Sonra yer örtüyü var.

## Yer örtüyü kodlaması {/*the-placemat-encoding*/}

Thompson-un dizayn brifinqi, yenidən qurulmuş: bütün Unicode-u kodlayın; hər mövcud ASCII faylını *byte-byte etibarlı və dəyişməz* buraxın; heç vaxt mətn içərisindəki sıfır byte göndərməyin (C proqramları `00`-ü sətir sonu kimi qəbul edir); axını öz-özünə düzəldici edin — faylın ortasına buraxılmış oxuyucu ayağını tapmalıdır. Həll code point-in ölçüsü tərəfindən seçilən dörd byte-şablonudur:

<Diagram name="text-representation/utf8_templates" height={360} width={720} alt="Four rows, one per UTF-8 template. Row 1: range U+0000 to U+007F, one byte 0xxxxxxx, payload 7 bits, labeled 'plain ASCII, unchanged'. Row 2: range U+0080 to U+07FF, bytes 110xxxxx 10xxxxxx, payload 11 bits. Row 3: range U+0800 to U+FFFF, bytes 1110xxxx 10xxxxxx 10xxxxxx, payload 16 bits. Row 4: range U+10000 to U+10FFFF, bytes 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx, payload 21 bits. In every row the fixed prefix bits are highlighted in blue and the x payload slots are plain; a side note marks that every continuation byte starts with 10.">

Bütün standart dörd sıraya sığır. Mavi bitlər şablon tərəfindən sabitlənib; `x` yuvaları code point-in öz bitlərini daşıyır, ən əhəmiyyətlisi əvvəlcə.

</Diagram>

Prefiksləri özünü-açıqlama olaraq oxuyun: `0` ilə başlayan byte "tam ASCII simvoluyam" deyir. `110` ilə başlayan byte "2-byte simvol başladıram" deyir; `1110` 3-byte-lı; `11110` dörd. Hər **davam byte-ı** `10` ilə başlayır — *başqa heç nə üçün* istifadə edilməyən prefix. Şablonlar kontraktdır; kodlama sadəcə bitləri yuvalara tökmekdir. İki dəfə izləyin:

**İşlənmiş nümunə — `é`, U+00E9:**

```
Code point:  0xE9 = 11101001            (8 bit — 7-bit şablon 1
                                         üçün çox böyük)
Şablon 2:    110xxxxx 10xxxxxx          (11 yük yuvası)
11-ə doldur: 000 1110 1001
Tök:         110 00011   10 101001
             ─────────   ─────────
Byte-lar:    11000011    10101001
           = C3          A9   ✓        mojibake autopsiyasındakı
                                        tam cüt
```

**İşlənmiş nümunə — `€`, U+20AC (üç byte, uyğun diaqramla):**

<Diagram name="text-representation/euro_packing" height={340} width={720} alt="The euro sign's code point U+20AC shown as sixteen bits 0010000010101100, split by brackets into three groups: 0010, 000010, 101100. Three arrows pour the groups into the 3-byte template 1110xxxx 10xxxxxx 10xxxxxx. The assembled bytes read 11100010, 10000010, 10101100, with the fixed prefix bits in blue, and the final hex result E2 82 AC highlighted below.">

On altı bit, 4 + 6 + 6-lıq üç yuva. Prefikslər zərfdir; code point içəridəki məktubdur.

</Diagram>

```
Code point:  0x20AC = 0010 0000 1010 1100     (16 bit → şablon 3)
4|6|6 bölün:  0010 | 000010 | 101100
Tök:          1110 0010   10 000010   10 101100
Byte-lar:     E2          82          AC   ✓
```

Bütün çətinliklə qazanılmış xüsusiyyətlər həmin prefikslərdən çıxır:

- **Tam ASCII uyğunluğu.** 128-dən aşağı hər code point *özü kimi, bir byte, yüksək bit sıfır* kodlanır. 1975-ci ilin ASCII faylı *UTF-8 faylıdır* — heç çevirmə, heç vaxt. Dünya 20 il ərzində, fayl-fayl tədricən köçə bildi, `café` mojibake-niz yalnız `é`-ni xarab etdi. Yer örtüyü qurulmuş bazanı yenmedi; onu *ilhaq etdi*.
- **Özünü sinxronlama.** UTF-8 axınının istənilən yerinə enin: byte `10` ilə başlayırsa, simvol ortasındasınız — ən çox 3 byte geri adım atın, *mütləq* başlanğıc byte-a çatacaqsınız. Korlanmış byte bir simvolu xarab edir, faylın qalanını heç vaxt, byte-yönümlü alətlər (`grep`, bölmə, axtarış) anlamadıqları mətndə işləməyə davam edir.
- **Sıfır byte yox, endianness yox.** UTF-8 bir *byte ardıcıllığıdır*, sətir kimi — Dərs 5-in immünlik qaydası tətbiq olunur. BOM lazım deyil, mətn üçün `htons` yoxdur, Lilliput-un dalaşacağı heç nə yoxdur.
- **Pulsuz doğru sıralama.** UTF-8-i byte-byte müqayisə etmek tam code point sırasını verir — şablonlar *böyük ucu əvvəlcə* qoyduğundan, biased float-ların tam ədəd kimi sıralandığı eyni hiylə (Dərs 4) və ISO tarixlərinin sətir kimi sıralandığı eyni hiylə (Dərs 5). Mövzunun üçüncü görünüşü; son olmayacaq.

X/Open-in komitə layihəsi FSS-UTF adlanmışdı, "Fayl Sistemi Etibarlı UCS Çevrim Formatı." Thompson-un versiyası etibarlılığı saxladı, zərifliyi qazandı — və səkkiz bit başına vahid olaraq, xoşbəxtcə daha qısa ad.

<DeepDive>

#### Dilinizdəki UCS-2 xəyalı {/*the-ghost-of-ucs2*/}

UTF-16-nın qırıq 65,536 fərziyyəsi ölmədi; Windows, Java, JavaScript-in *içərisine* fossilleşdi, xəyalı bir sətirdə çağıra bilərsiniz:

```js
"😀".length
```

<ConsoleBlock level="info">

2

</ConsoleBlock>

JavaScript sətirləri **UTF-16 code unit**-larının ardıcıllığıdır, `😀` (U+1F600) 65,535-dən yuxarıda yaşayır, buna görə qaçış-lük cütü kimi saxlanılır — bu hiyləni mümkün etmek üçün Unicode-un simvol məkanından daimi olaraq amputasiya etdiyi bir aralıqdan (U+D800–U+DFFF) götürülmüş **surrogate** adlanan iki vahid. İz yük daşıyıcıdır: heç vaxt simvol ola bilməyəcək 2,048 code point, ki 1993-ci il dövrünə aid bir fərziyyə dəyişdirilmək əvəzinə yamalanabilsin. `.length` vahidləri sayır, buna görə bir görünən emoji 2 olaraq bildirir; `"😀".charCodeAt(0)` tek başına heç bir mənası olmayan surrogate yarısını qaytarır; yarılar arasında dilimleme cəfəngiyat istehsal edir. Müasir JavaScript code-point-şüurlu genişlendirmeler əlavə etdi: `[..."😀"].length` 1-dir, çünki iterator code point-lərlə danışır. Java eyni xəyalı daşıyır (`char` UTF-16 vahididir, buna görə `String.codePointAt` sonradan əlavə edildi), Windows API-nın `W` funksiyaları bu gün hələ UTF-16-dır. Platformanın "simvol" tipi 1996-dan əvvəl dayanırsa, *code unit demek olduğunu fərz edin* — meta-dərsi xatırlayın: bir kodlama fərziyyəsi dilin əsas sətir tipinə bir dəfə göndərilincə, praktiki olaraq ölümsüzdür.

</DeepDive>

<DeepDive>

#### é-yi yazmanın iki yolu {/*two-ways-to-write-e*/}

İstehsal sistemlərinin həftəlik sındığı "simvol nədir ki" sualının bir qatı daha. Unicode `é`-nin iki şəkildə yazılmasına icazə verir: tək code point U+00E9 kimi, ya da *iki* code point — düz `e` (U+0065) ardından qonşusuna yığılan **birleştirici vurğu** U+0301. Hər ikisi eyni şəkildə render olunur. Bunlar fərqli sətirlerdir:

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

İki istifadəçi fərqli klaviaturalarda "café" yazır; verilənlər bazanız indi eyni söz üçün iki fərqli byte ardıcıllığı saxlayır; axtarışlar tapır, dublikatlar çiçeklenib, şifrə yoxlamaları sirli şəkildə uğursuz olur. Düzəliş **normalizasiyadır** — kanonik reseptlər (NFC birləşdirir, NFD ayrıştırır) *sınırda* tətbiq olunur, buna görə saxlama bir yazılış saxlayır. İstifadəçinin "bir simvol" kimi qəbul etdiyi şey — **grapheme cluster** — daha böyük ola bilər: ailə emojisi 👨‍👩‍👧 JavaScript-də `.length` 8 bildirən, görünməz sıfır genişlikli birləşdiricilərlə tikişlənmiş dörd code point-dir. Mətn, ortaya çıxır, dörd mərtəbəli binadır: aşağıda **byte-lar**, sonra **code unit-lər**, sonra **code point-lər**, penthousda **grapheme-lər** — "uzunluq" isə dürüstcəsinə dörd adın hamısına cavab verir.

</DeepDive>

<Pitfall>

**"Düz mətn" deyilən bir şey yoxdur.**

"Faylı sadəcə düz mətn kimi oxuyun" ifadəsi gizli bir dəyişən ehtiva edir, tarixdəki hər mojibake hadisəsi həmin dəyişənin yanlış təxmin edilməsidir. Elan edilmiş kodlaması olmayan byte axını *mətn deyil* — Dərs 1-in kontrakt gözləyən mənasız byte-larıdır. Buna görə mühəndisləri mojibake fabrikalarından ayıran sınır qaydaları: **kodlamaları elan edilə bildikləri hər yerdə açıqca elan edin** (`Content-Type: text/html; charset=utf-8`, `<meta charset="utf-8">`, verilənlər bazası sütun charset-ləri, `open(path, encoding='utf-8')`), **yeni sistemleri başdan sona UTF-8-ə varsayılan edin**, **razılaşmaya bilən byte axınlarını heç birləştirməyin**. Yanaşı tələ `.length`-ə güvənmekdir: `VARCHAR(10)` sütunu, 280 simvollu məhdudiyyət, "maksimum 20 simvol" validasiyası — hər biri gizlicə dörd mərtəbəli binanın bir mərtəbəsini seçir (byte-lar? vahidlər? nöqtələr? grapheme-lər?), off-by-one güvənlik bugları boşluqlarda yaşayır. Uzunluq vacibdirsa, *hansı* uzunluğu yüksək səslə söyləyin.

</Pitfall>

## Verilənlər bazasını sındıran emoji {/*the-emoji-that-broke-the-database*/}

On il ərzində bir istehsal hadisəsi mühəndisləri bu dərsə hər dərsliklə müqayisədə daha çox tanıtdırdı. Dünyanın ən geniş yayılmış açıq mənbəli verilənlər bazası MySQL-in `utf8` adlanan bir simvol dəsti uzun müddətdir mövcuddur — tarixən simvolları **3 byte** ilə məhdudlaşdıran. Real UTF-8 U+FFFF-dən yuxarı hər şey üçün dörd tələb edir... bu isə tam emojinin yaşadığı yerdir. Toqquşma qaçınılmaz idi: istifadəçi bir şərhə `😀` yapışdırır, sürücü dürüst dörd byte `F0 9F 98 80` göndərir, MySQL dövrün tanımlayıcı xətası `Incorrect string value: '\xF0\x9F\x98\x80'` ilə sətiri rədd edir ya da kəsir. Bütün tətbiqlər göndərildi, yalnız ASCII test verilənləri ilə QA-dan keçdi, real insanların onları ilk istifadə etdiyi həftəsonu dağıldı — ən saf formasında ASCII test-verilən tələsi. Həqiqi tam kodlama **`utf8mb4`** ("ən çox 4 byte") adı altında gəldi, MySQL 8.0 onu nəhayət varsayılan etdi; miqrasiya bələdçiləri, charset çeviri skriptləri, müharibə hekayələri isə keçiş mərasimi olaraq qalır. Dizaynerler üçün əxlaq, bu modulun ən köhnə səsiylə: 3-byte tavanı dizayn zamanı zararsız görünürdü — yalnız "heç kimin istifadə etmədiyi" simvolları istisna edirdi. Sonra 2010 telefonlara emoji klaviaturası verdi, heç kimin istifadəçiləri hər kəsin oldu.

## Kodlayıcı laboratoriya {/*the-encoder-lab*/}

Aşağıdakı oyuncaq Thompson-un yer örtüyüdür, icra oluna bilər. Bir simvol seçin; code point-inin ölçüldüyünü, şablonun seçildiğini, yük bitlərinin tökülduğünü izləyin — diaqramlardakı kimi mavi prefikslər. Alt sətir eyni byte-ları Latin-1 gözlükləri ilə göstərir: `Ã©` reproduksiya edin, sonra `😀`-nın məşhur dörd-byte alter eqosu `ðŸ˜€` ilə tanışın:

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
        {bytes.length} byte{bytes.length > 1 ? '' : ''} — mavi bitlər
        şablondur, qalanı code point-dir.
      </p>
      <p style={{ fontFamily: 'system-ui', color: bytes.length > 1 ? '#c1554d' : '#087ea4' }}>
        {bytes.length > 1
          ? 'Latin-1 gözlükləri bunu belə oxuyur: ' + latin1
          : '128-dən aşağı: Yer üzündəki hər kontrakt razılaşır. Qırılmaz.'}
      </p>
    </div>
  );
}
```

</Sandpack>

`A`-nın *sınmaqdan imtina edərək* nəyi sübut etdiyinə diqqət edin: byte-ın bütün aşağı yarısı neytral ərazidir, ASCII, hər code page, UTF-8 tərəfindən razılaşılır. Həmin ortaq mərtəbə internetin tesisatının — protokollar, URL-lər, mənbə kodu — dörd on illik kodlama müharibəsindən sağ çıxmasının, Thompson-un *üstünə qurmaq* qərarının isə dəyişdirmek əvəzinə qalibiyyətin səbəbidir.

<Recap>

- **ASCII (1963)** 128 yuvalı mətn kontraktıdır, qəsdlə strukturlaşdırılmış: rəqəmlər 48–57-də (aşağı nibble = dəyər), `A` 65-də, `a` 97-də tam **bir bit uzaqlığında**, idarəetmə simvolları 0–31 teletype xəyalları olaraq (`\n`=10, `\r`=13, `BEL`=7). `H` = 72 — Dərs 1-dəki borc, ödəndi.
- Byte-ın yuxarı 128 yuvası uyğunsuz **code page**-lər oldu (Latin-1, ISO 8859-x, KOI8-R, Windows-1252): byte `0xE9` kontrakta görə `é` ya da `ι` *dır*. **Mojibake** sınır uğursuzluğudur: UTF-8-in `C3 A9`-u Latin-1 olaraq `Ã©` oxunur; Kiril `Ð`-klaster toxumasına çevrilir; `ï»¿` yanlış gözlükdəki BOM-dur.
- **Unicode** problemi ikiyə bölür: **code point** 1,114,112 yuvalı boşluqda bir ədəddir (U+0041, U+1F600); **encoding** ədədləri byte-lara çevirən ayrı bir kontraktdır. UTF-32 israf edir; UTF-16 qırıq 65,536 fərziyyəsini surrogate-lara, BOM-lara, `"😀".length === 2`-yə fossilleşdirdi.
- **UTF-8** (Thompson & Pike, bir restoran axşamı, 1992): dörd şablon — `0xxxxxxx`, `110xxxxx 10xxxxxx`, `1110…`, `11110…` — 7/11/16/21 yük biti daşıyır, böyük ucu əvvəlcə. `é` → `C3 A9`, `€` → `E2 82 AC`, `😀` → `F0 9F 98 80`.
- Qalibiyyət xüsusiyyətləri: **ASCII fayllar artıq etibarlı UTF-8-dir**; davam byte-ları həmişə `10` ilə başlayır (**özünü sinxronlayan**); sıfır byte yoxdur; **endianness yoxdur**; byte sırası = code point sırası. **Veb-in 98%-dən çoxu** onunla danışır.
- İstehsal qaydaları: **düz mətn yoxdur** — hər sınırda charset elan edin; girişdə **normallaşdırın** (é-nin iki yazılışı var); "uzunluq" dörd fərqli ədəddir (byte-lar / code unit-lər / code point-lər / grapheme-lər); MySQL-in `utf8`-i 3-byte cəlladıdır — **`utf8mb4`** həqiqi şeydir.

</Recap>

<Challenges>

#### Gülüşü kodlayın {/*encode-the-grin*/}

`😀` (U+1F600) əllə dörd UTF-8 byte-ına kodlayın — şablon, böl, tök, hex. Sonra mojibake forması `ðŸ˜€`-nın niyə tam dörd simvol olduğunu bir cümlədə izah edin.

<Hint>

İkilidə 0x1F600 `1 1111 0110 0000 0000`-dır — 17 bit, buna görə 21 yük yuvası olan 4-byte şablona ehtiyacı var. Aparıcı sıfırlarla 21 bitə doldur, sonra 3 | 6 | 6 | 6 bölün.

</Hint>

<Solution>

```
Code point:   0x1F600 = 0 0001 1111 0110 0000 0000   (21 bitə doldur)
3|6|6|6 bölün:  000 | 011111 | 011000 | 000000
Şablon 4:     11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
Tök:          11110 000   10 011111   10 011000   10 000000
Byte-lar:     F0          9F          98          80   ✓
```

Maşınla çarpaz-yoxla: `'😀'.codePointAt(0).toString(16)` `'1f600'` qaytarır, emojinin hər hex dökümü `f0 9f 98 80` göstərir.

Mojibake: bir *simvol* dörd *byte*-dır, bir-byte-lı gözlüklər hər byte-ı öz simvolu olaraq oxuyur — `F0`→`ð`, `9F`→`Ÿ`, `98`→`˜`, `80`→`€` (Windows-1252-də) — buna görə `ðŸ˜€`-nın tam dörd simvolu, `é`-ni cütə çevirən eyni simvol-başına-byte arifmetikası.

</Solution>

#### Sirli byte-ları deşifrə edin {/*decode-the-mystery-bytes*/}

UTF-8 axını ehtiva edir: `D0 9C D0 98 D0 A0`. Tam deşifrə edin: yalnız prefikslerden simvol sınırlarını müəyyənləşdirin, hər code point-i çıxarın, bunun nə növ mətn olduğunu bildirin. (Tapacağınız code point-lər Kiril blokunda olacaq, U+0400–U+04FF.)

<Solution>

Əvvəlcə prefix analizi — cədvəl lazım deyil: `D0` = `11010000` `110` ilə başlayır → "2-byte simvol burada başlayır"; `9C` = `10011100` `10` ilə başlayır → davam. Axın özünü analiz edir: `(D0 9C)(D0 98)(D0 A0)` — üç 2-byte-lı simvol. Özünü sinxronlama işini görür.

Yükü çıxarın (`110` ve `10` prefikslərini çıxarın, birləşdirin):

```
D0 9C:  10000 011100 → 100 0001 1100 = U+041C
D0 98:  10000 011000 → 100 0001 1000 = U+0418
D0 A0:  10000 100000 → 100 0010 0000 = U+0420
```

U+041C, U+0418, U+0420 Kiril **М**, **И**, **Р** — söz **МИР**: Rusca *sülh* (ve *dünya*). Danny Cohen-in sülh yalvarışı ilə başlayan bir modul qövsünün sonunda deşifrə etmek üçün münasib mesaj — bu sətir heç vaxt Latin-1 sınırını keçsəydi, artıq bilirsiz ki, `Ð`-klaster formasında gələcəkdi: `ÐœÐ˜Ð `.

</Solution>

#### Emoji bileti {/*the-emoji-ticket*/}

Transfer tapşırığı. Masanıza bir dəstək bileti düşür: *"İstifadəçilər emoji ehtiva edən profil bio saxlamanın `Incorrect string value: '\xF0\x9F\x92\xBB' for column 'bio'` xətası ilə uğursuz olduğunu bildirirlər. Düz ingiliscə, hətta Fransız vurğularıyla bio-lar yaxşı saxlanılır. Marketinq 'vibe-ınızı əlavə edin' kampaniyasını başlatdıqda başladı."* Backend sütun charset-i `utf8` olan MySQL-dir. Kök səbəbi dəqiq izah edin (niyə tam emoji, niyə vurğular işləyir), düzəlişi göstərin, komanda wiki üçün iki cümləlik postmortem dərsi yazın.

<Solution>

**Kök səbəb:** MySQL-in `utf8` adlanan charset-i tarixən 3-byte-maksimum alt dəstdir (utf8mb3). U+FFFF-ə qədər hər code point-i əhatə edir — bu `é`-ni (2 byte, U+00E9) və bütün Latin vurğularını daxil edir, buna görə "Fransız saxlanılır" — lakin emoji U+FFFF-dən yuxarıda yaşayır, **4-byte şablonla** kodlanır: `💻` U+1F4BB → `F0 9F 92 BB`, xətadakı tam byte-lar. Aparıcı `F0` 4-byte-lı simvol elan edir; sütunun kontraktı 3-də bitir; MySQL dəyəri rədd edir. Heç nə korlanmadı — iki kontrakt sınırda razılaşmır, bu modulun ən köhnə uğursuzluq forması.

**Düzəliş:** həqiqi kodlamaya keçin — `ALTER TABLE profiles CONVERT TO CHARACTER SET utf8mb4` (üstəgəl uyğun collation, əlaqə charset-i, indexlənmiş `VARCHAR` uzunluqlarının hələ sığdığının yoxlanması, çünki simvol başına ən pis halda byte-lar 3-dən 4-ə böyüyür). Yeni sxemlər: gündən etibarən `utf8mb4` — MySQL 8.0 tam bu səbəbdən onu varsayılan etdi.

**Postmortem dərsi:** *"Test verilənlərimiz ASCII və Qərb Avropa idi, buna görə 3-byte kodlama tavanı sahib olduğumuz hər testi keçdi — məhdudiyyət yalnız testlərimizin heç vaxt ehtiva etmədiyi simvollar üçün mövcud idi. Charset kontraktları istifadəçilərin yaza bildiyi tam aralıqda yoxlanmalıdır (toxuma verilerinde bir 😀 bunu tutardı), mühəndislərin yazdığı alt dəstdə deyil."* ✓

</Solution>

</Challenges>

<LearnMore title="Rəng, Şəkil və Audio İkilidə" path="/learn/faza-0/modul-0-1/color-image-audio">

Ədədlər, mənfilər, kəsrlər, byte sırası, mətn — indiyə qədəri kontraktlar kompüterlərin *qurulduğu* şeyləri kodladı. Növbəti, insanların *qurulduğu* şeylərin kontraktları: `#FF5733`-ün Dərs 2-dən gözünüzün inandığı rəngə necə çevrildiyi, ədəd gridinin fotoğrafa necə çevrildiyi, saniyədə 44,100 ölçmənin musiqi haqqında necə olduğu — bu qeyri-adi konkret ədədin, 1980-ci ildə öz süfrə-miqyasında komitə müharibəsiylə seçilən, bu gün axın edəcəyiniz hər mahnını hələ idarə etdiyinin tam səbəbi daxil.

</LearnMore>
