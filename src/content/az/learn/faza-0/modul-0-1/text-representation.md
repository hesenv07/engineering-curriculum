---
title: "Mətn: ASCII-dən UTF-8-ə"
---

<Intro>

1992-ci ilin sentyabrında bir axşam, Nyu-Cersidəki bir yeməkxanada Ken Thompson — Unix-in həmmüəllifi, keçən dərs adının `NUXI`-yə qarışdığını izlədiyiniz sistemin özünün yaradıcısı — Rob Pike-ın gözü qarşısında süfrə dəsmalının üstündə bir encoding sxemi cızdı. İki Bell Labs mühəndisinə qüsurlu saydıqları bir standart təklifinə cavab vermək üçün cəmi bir neçə gün verilmişdi; şam yeməyinin sonunda əllərində daha yaxşısı vardı və bir həftə ərzində bütün əməliyyat sistemləri ona keçirildi. Həll etdikləri problem nəhəng idi: hesablama dünyasının mətni qarşılıqlı anlaşılmaz idi — eyni baytlar bir maşında fransızca, digərində yunanca, üçüncüsündə zibil oxunurdu — sənayenin rəsmi düzəlişləri isə Yer üzündəki hər mövcud faylı və aləti sındırmağa davam edirdi. Süfrə dəsmalı dizaynı *heç nəyi* sındırmadı. Bu gün ona **UTF-8** deyilir, vebin 98%-dən çoxunu daşıyır və mübahisəsiz mühəndislik tarixinin ən uğurlu backward-compatible dizaynıdır. Bu dərs mətnin hekayəsidir: 72-ni `H`-ə uyğunlaşdıran 1963-cü il müqaviləsi (bu kursun Dərs 1-dən bəri daşıdığı borc), `é`-ni `Ã©`-yə çevirən bayt-ölçülü imperiyalar, hər insan simvolunu tutmağa çalışan cədvəl — və süfrə dəsmalı encoding-inin dəqiq necə işlədiyi, bit-bit, çünki bu dərs bitməmiş bir emoji-ni əllə kodlayacaqsınız.

</Intro>

<YouWillLearn>

- **ASCII**: 128 yuvalı müqavilə, onun gizlicə gözəl daxili strukturu və `H`-in niyə 72 olduğu
- Baytın yuxarı 128 yuvasının necə müharibə edən **code page-lərə** çevrildiyi — və **mojibake**-nin dəqiq mexanikası (`café` → `cafÃ©`, `привет` → `Ð¿Ñ€Ð¸Ð²ÐµÑ‚`)
- **Unicode**: hər şeyi düzəldən ayrılma — *code point* rəqəmdir, *encoding* baytlardır və onlar fərqli müqavilələrdir
- **UTF-8** süfrə dəsmalından yuxarı: dörd bayt-şablonu, `é`, `€` və `😀`-nin əllə kodlanması
- UTF-8-in niyə qalib gəldiyi: ASCII-compatible, self-synchronizing, endianness-ə davamlı — və UTF-16-nın kabusunun proqramlaşdırma dilinizdə hələ də hara hənirtildiyi
- Production ilə təmasdan sağ çıxan qaydalar: "plain text" deyə bir şey yoxdur, length dörd fərqli rəqəmdir və MySQL-in `utf8`-i UTF-8 deyil

</YouWillLearn>

## 128 yuvalı müqavilə {/*the-128-slot-contract*/}

Dərs 1-dən bəri "mətn müqaviləsi" bir veksel idi: *hansısa* cədvəl 72-ni `H`-ə, 105-i `i`-yə uyğunlaşdırır və bu kurs ona qarşı borc götürməyə davam edirdi — `Hi`, `Hey`, hex dump-lar. Ödəmə vaxtıdır. Cədvəl **ASCII**-dir — American Standard Code for Information Interchange, 1963-cü ildə yekunlaşdırılıb — və o, 7-bitlik müqavilədir: **128 yuva**, 0–127 nömrələnmiş, Amerika ingiliscəsinin ehtiyac duya biləcəyini təsəvvür etdiyi hər simvol üçün bir dənə.

Komitə simvolları təsadüfi səpələmədi; bitlərin içinə struktur hördü və o struktur bu gün də sizin maaşınızı ödəyir:

<Diagram name="text-representation/ascii_map" height={360} width={720} alt="128 yuvadan ibarət, dörd bərabər 32 yuvalıq bloka bölünmüş üfüqi zolaq. Blok 0-dan 31-ə, solğunlaşdırılmış, 'control simvollar (görünməz): newline 10, carriage return 13, tab 9, bell 7' etiketi ilə. Blok 32-dən 63-ə 'boşluq, durğu işarələri, rəqəmlər' etiketli, 48-dən 57-yə yuvalar mavi ilə vurğulanıb və 'rəqəmlər 0-9' etiketi ilə. Blok 64-dən 95-ə 'böyük hərflər A-Z' etiketli, 72-ci yuva H = 72 işarələnib. Blok 96-dan 127-yə 'kiçik hərflər a-z' etiketli. Zolağın altında zoom paneli A = 01000001 ilə a = 01100001-i müqayisə edir, fərqlənən tək bit (dəyəri 32) qırmızı ilə vurğulanıb, 'bir bit fərq — case biti' alt yazısı ilə.">

Dörd təmiz 32 yuvalıq blok. Rəqəmlər 48–57-də oturur, böyük hərflər 65-dən, kiçiklər 97-dən başlayır — və bu rəqəmlərin heç biri təsadüf deyil.

</Diagram>

Bu 60 yaşlı cədvəldəki düşünülmüş mühəndisliyə baxın:

- **Rəqəmlər**: `'0'` 48 = `0110000`-dır. *Rəqəmin kodunun aşağı dörd biti elə rəqəmin özüdür* — `'7'` `0110111`-dir, aşağı nibble `0111` = 7. Simvolu ədədi dəyərinə çevirmək `c − 48`-dir, ya da sadəcə yuxarı bitləri mask etmək. 1963-cü ildə parsing-i ucuz etmək üçün dizayn edilib.
- **Case biti**: `A` = 65 = `01000001`; `a` = 97 = `01100001`. Hər hərf və onun kiçik əkizi **dəqiq bir bitdə** fərqlənir — bit 5, dəyəri 32. Böyük hərfə çevirmək *biti sıfırlamaqdır*; case-insensitive müqayisə *biti mask etməkdir*. Köhnə parser-lərdə bitwise fəndlərlə rastlaşanda (`c | 0x20` kiçik hərfə çevirmək üçün), söykəndikləri müqavilə budur.
- **0–31 yuvaları** görünməz **control simvolları** saxlayır — simvol deyil, qəbul edən cihaza *təlimatlar*, teletayp erasının ruhları: 10 `\n`-dir (line feed), 13 `\r`-dir (carriage return — hərfi mənada "yazı maşınının karetkasını geri sürüşdür", Windows fayllarının sətirləri hələ də iki-baytlıq `\r\n` fosili ilə bitirməsinin səbəbi), 9 tab-dır, 0 `NUL`-dur, yuva 7 — `BEL` — terminalın zınqırovunu fiziki olaraq çalırdı. Hələ də çalır: yaxınlıqdakı bir terminalda `printf '\a'`.

Və üç dərslik borcun ödənişi: `H` 72-dir, çünki H 8-ci hərfdir və böyük hərflər 64 + 1-dən başlayır. Bu kursda dekodladığınız hər hex dump bu cədvəlin işləməsi idi.

<Note>

ASCII qaçılmaz deyildi. IBM-in System/360-ı — Dərs 1-də 8-bitlik baytı və Dərs 3-də two's complement-i standartlaşdıran 1964-cü il maşını — IBM-in öz rəqib cədvəli **EBCDIC** ilə çıxdı: orada əlifba heç ardıcıl belə deyil (A–Z-nin *içində* boşluqlar var, perfokart zonalarının mirası). EBCDIC bu gün də dünya kart əməliyyatlarının böyük payını emal edən mainframe-lərdə işləyir — deməli hazırda haradasa bir bankın sərhəd kodu iki cədvəl arasında simvol-simvol tərcümə edir, düz Dərs 5-in `htons`-u kimi — müqavilələr arasında sərhəd nəzarəti.

</Note>

## Bir bayt, çoxlu imperiya {/*one-byte-many-empires*/}

ASCII 7 bit işlədirdi; bayt 8 təklif edir. O ehtiyat bit **128–255 yuvaları** deməkdir: **xəritənin bütöv ikinci yarısı, rəsmən boş.** Və dünyanın qeyri-ingilisdilliləri ona həvəslə möhtac idi — fransız *café* yaza bilmir, alman *Straße* yaza bilmir, rus 128 Amerika yuvasında ümumiyyətlə heç nə yaza bilmir.

Beləliklə, hamı yuxarı yarını müstəmləkələşdirdi — *fərqli cür*. Nəticə **code page-lər** oldu: 0–127 barədə hamısı razılaşan, yuxarıdakı hər şey barədə hamısı ayrılan onlarla qarşılıqlı uyğunsuz müqavilə. ISO 8859-1 ("Latin-1") 128–255-i Qərbi Avropa hərfləri ilə doldurdu; ISO 8859-7 ora yunan hərflərini qoydu; ISO 8859-5 və sovet KOI8-R ora kirili qoydu (*fərqli düzülüşlərdə*, təbii ki); Windows Windows-1252 kimi öz variantlarını buraxdı; yazı sistemi 128 yuvaya gülən Yaponiya Shift-JIS kimi çox-baytlı sxemlər qurdu.

Nəticə indi tam texniki dəqiqliklə deyə biləcəyiniz cümlədir: **127-dən yuxarı baytın, onu hansı code page-in yazdığını bilməyincə, heç bir mənası yoxdur.** `0xE9` baytı Latin-1 altında `é`-*dir* və ISO 8859-7 altında `ι`-*dir* — "belə görünür" yox, *odur*: hər müqavilə daxilən qüsursuzdur, düz Dərs 5-in iki endianness-i kimi. Fransız maşını ilə yunan maşını illərlə fayl mübadiləsi edə bilərdi — heç bir xəta mesajı qalxmadan — hər biri digərinin milli poeziyasını doğma cəfəngiyat kimi oxuyaraq. Baytlar heç vaxt səhv deyildi. Sadəcə iki müqavilə vardı və heç bir saziş yox idi.

## Mojibake: yanlış eynəklə oxumaq {/*mojibake-reading-with-the-wrong-glasses*/}

O sərhəddə istehsal olunan zibilin adı var — **mojibake**, yaponca "simvol çevrilməsi", ondan ən çox əziyyət çəkənlərin uydurduğu söz. Və onun ən məşhur nümunəsi — min e-poçtda gördüyünüz `Ã©` — indi bayt-bayt izah etmək tam ixtiyarınızdadır. Budur, müasir (UTF-8) göndərənin yazdığı və Latin-1 qəbul edənin oxuduğu *café*:

<Diagram name="text-representation/mojibake_pipeline" height={340} width={720} alt="Bir pipeline. Solda café sözü. O, beş bayt qutusuna çevrilir: 63, 61, 66, sonra mavi çalarlı C3 və A9, 'UTF-8-də é — bir simvol, iki bayt' etiketli mötərizə ilə. 'Latin-1 müqaviləsi altında oxu' etiketli ox beş simvol qutusuna aparır: c, a, f, sonra qırmızı çalarlı Ã və ©, cafÃ© çıxışına yığılır, qırmızı etiketlə: 'iki simvol — cütlük heç vaxt tanınmadı'.">

Beş düzgün bayt, bir yanlış müqavilə. İki-baytlıq `é` simvolu iki bir-baytlıq simvol kimi oxunur — Dərs 5-in anaqram imzası, indi mətndə.

</Diagram>

```
Göndərən (UTF-8):    c    a    f    é
baytlar:             63   61   66   C3 A9      ← é İKİ baytdır

Qəbul edən (Latin-1): 63→c  61→a  66→f  C3→Ã  A9→©

Ekranda:             cafÃ©   ✗
```

İlk üç bayt sərhədi toxunulmaz keçir — onlar 128-dən aşağıdadır, *hər* müqavilənin razılaşdığı yerdə (bu fikri saxlayın; süfrə dəsmalının şah gedişi budur). Zədə yuxarı yuvalara həqiqətən ehtiyacı olan simvolla məhdudlaşır. Mojibake-nin bu qədər tanınan *toxuması* da buradandır: hər qeyri-ASCII simvol eyni balaca latın zibil topasına çevrilir, adətən `Ã` və ya `Ð` ilə başlayan. Rusca *привет* eyni yanlış eynəkdən `Ð¿Ñ€Ð¸Ð²ÐµÑ‚` olur — hər kiril hərfi iki-simvollu `Ð`-dadlı cütlüyə dönür, keçən dərsin sonunda vəd edilən sətrin dəqiq özü. Təcrübəli göz qəza yerinin özünü oxuyur: "aparıcı `Ã` topaları — bu, Latin-1 kimi oxunmuş UTF-8-dir; aparıcı `Ð` — bu, kiril UTF-8-dir; səhifənin başında `ï»¿` — bu, yanlış müqavilədən göstərilən UTF-8 **byte order mark**-ıdır (`EF BB BF`, endianness-in Dərs 5-dən kameo çıxışı)." Mojibake səs-küy deyil; `NUXI` kimi, yanlış eynək taxmış öz datanızdır — və eynək barmaq izi qoyur.

Cinayət yerinə Dərs 1-in ən qədim aləti ilə birbaşa baxa bilərsiniz:

<TerminalBlock>

printf 'café' | xxd
00000000: 6361 66c3 a9                             caf..

</TerminalBlock>

Dörd simvol, *beş* bayt — və yalnız 32–126 yuvalarına etibar edən `xxd`-nin ASCII sütunu iki-baytlıq `é`-ni iki nöqtə kimi göstərir. Hətta hex-dump alətiniz də müqavilə qərarı verir.

## Unicode: bəşəriyyət üçün bir cədvəl {/*unicode-one-table*/}

1980-lərin sonuna endgame aydın idi: daha yaxşı code page yox, **son cədvəl** — hər insan yazı sisteminin hər simvoluna bir rəqəm təyin edən vahid universal reyestr. O layihə **Unicode**-dur (versiya 1.0, 1991). Rəqəmləri **code point** adlanır, `U+` üstəgəl hex ilə yazılır: `A` U+0041-dir, `é` U+00E9, `€` U+20AC, `😀` U+1F600 — və Azərbaycan `ə`-si U+0259. Fəza U+0000-dan U+10FFFF-ə uzanır — **1.114.112 yuva**, indiyə qədər təxminən 150.000-i təyin edilib: hər yaşayan yazı, qədim Misir heroqlifləri, riyazi əlifbalar və bəli, emoji-lər — onlar mətnə yamanmış bəzək deyil, eyni cədvəlin tamhüquqlu vətəndaşlarıdır.

Amma Unicode-un ən dərin ideyası böyük cədvəl deyil. O, *müqavilələrin ayrılmasıdır* — bütün bu modulun sizi hazırladığı konseptual gediş:

**Code point rəqəmdir. Rəqəm bayt deyil.** "é U+00E9-dur" demək faylda nəyin yaşadığı barədə *hələ heç nə* demir — düz Dərs 5-in öyrətdiyi kimi: 8080 dəyəri hansı baytının əvvəl getdiyi barədə heç nə demir. Abstrakt rəqəmlə fiziki baytlar arasında ikinci müqavilə — **encoding** — olmalıdır və Unicode qəsdən bir neçəsinə icazə verir:

- **UTF-32**: hər code point bir 32-bitlik tam ədəd kimi. Sadə, yeknəsəq — və ingilis mətninin ölçüsünü dördqat artırır (hər ASCII hərfi üç `00` bayt dolgu alır), üstəlik tam formalaşmış **endianness problemi** miras alır, çünki 32-bitlik tam ədədlər məhz Dərs 5-in xəbərdarlıq etdiyi çox-baytlı vahidlərdir.
- **UTF-16**: 90-ların əvvəlinin fərziyyəsi altında UCS-2 kimi doğuldu — 65.536 yuva (2¹⁶, Dərs 2-də şübhələnməyi öyrəndiyiniz rəqəm) bəşəriyyətin nə vaxtsa ehtiyac duyacağı hər simvolu tutacaqdı. Simvola iki bayt, nöqtə. Windows NT, Java və JavaScript hamısı onu qucaqladı... sonra Unicode 65.536-nı aşdı, fərziyyə çökdü (*limitlər dizayn vaxtı çatılmaz görünür; sistemlər dizaynerlərinin fərziyyələrindən uzun yaşayır* — dördüncü dərsdir təkrarlanır) və UTF-16-ya qaçış-lyuku cütlükləri retrofit edilməli oldu. Ona həm də **BOM** lazımdır — byte order mark U+FEFF, baytları endianness-dən asılı olaraq `FE FF` və ya `FF FE` kimi gəlir, Lilliput müharibəsini mətn fayllarınızın daimi sakini edərək.
- Və bir də süfrə dəsmalı var.

## Süfrə dəsmalı encoding-i {/*the-placemat-encoding*/}

Thompson-un dizayn tapşırığı, bərpa edilmiş halda: bütün Unicode-u kodla; hər mövcud ASCII faylı *bayt-bayt etibarlı və dəyişməz* saxla; mətnin içində heç vaxt sıfır bayt buraxma (C proqramları `00`-ı sətrin sonu sayır); və axını özü-özünü təmir edən et — faylın ortasına atılan oxucu ayaq yerini tapmalıdır. Həll code point-in ölçüsünə görə seçilən dörd bayt-şablonudur:

<Diagram name="text-representation/utf8_templates" height={360} width={720} alt="Dörd sətir, hər UTF-8 şablonuna bir. Sətir 1: aralıq U+0000-dan U+007F-ə, bir bayt 0xxxxxxx, payload 7 bit, 'adi ASCII, dəyişməz' etiketli. Sətir 2: aralıq U+0080-dan U+07FF-ə, baytlar 110xxxxx 10xxxxxx, payload 11 bit. Sətir 3: aralıq U+0800-dan U+FFFF-ə, baytlar 1110xxxx 10xxxxxx 10xxxxxx, payload 16 bit. Sətir 4: aralıq U+10000-dan U+10FFFF-ə, baytlar 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx, payload 21 bit. Hər sətirdə sabit prefiks bitləri mavi ilə vurğulanıb, x payload yuvaları adidir; yan qeyd hər continuation baytın 10 ilə başladığını qeyd edir.">

Bütün standart dörd sətrə sığır. Mavi bitlər şablonla sabitlənib; `x` yuvaları code point-in öz bitlərini daşıyır, ən böyük dərəcəli əvvəl.

</Diagram>

Prefiksləri özünütəsvir kimi oxuyun: `0` ilə başlayan bayt deyir: "mən tam ASCII simvoluyam". `110` ilə başlayan bayt deyir: "mən 2-baytlıq simvol başladıram"; `1110` — 3-baytlıq; `11110` — dörd. Və hər **continuation bayt** `10` ilə başlayır — *başqa heç nə üçün* işlədilməyən prefiks. Şablonlar müqavilədir; encoding sadəcə bitləri yuvalara tökməkdir. İki dəfə izləyin:

**İşlənmiş nümunə — `é`, U+00E9:**

```
Code point:  0xE9 = 11101001            (8 bit — 7-bitlik
                                         şablon 1 üçün böyükdür)
Şablon 2:    110xxxxx 10xxxxxx          (11 payload yuvası)
11-ə doldur: 000 1110 1001
Tök:         110 00011   10 101001
             ─────────   ─────────
Baytlar:     11000011    10101001
           = C3          A9   ✓        mojibake yarılmasındakı
                                        cütlüyün dəqiq özü
```

**İşlənmiş nümunə — `€`, U+20AC (üç bayt, üstəlik uyğun diaqram):**

<Diagram name="text-representation/euro_packing" height={340} width={720} alt="Avro işarəsinin code point-i U+20AC on altı bit kimi göstərilib: 0010000010101100, mötərizələrlə üç qrupa bölünüb: 0010, 000010, 101100. Üç ox qrupları 3-baytlıq şablona tökür: 1110xxxx 10xxxxxx 10xxxxxx. Yığılmış baytlar 11100010, 10000010, 10101100 oxunur, sabit prefiks bitləri mavi, yekun hex nəticə E2 82 AC aşağıda vurğulanıb.">

On altı bit, 4 + 6 + 6-lıq üç yuva. Prefikslər zərfdir; code point içindəki məktubdur.

</Diagram>

```
Code point:  0x20AC = 0010 0000 1010 1100     (16 bit → şablon 3)
Böl 4|6|6:    0010 | 000010 | 101100
Tök:          1110 0010   10 000010   10 101100
Baytlar:      E2          82          AC   ✓
```

Hər çətin qazanılmış xüsusiyyət o prefikslərdən öz-özünə çıxır:

- **Tam ASCII uyğunluğu.** 128-dən aşağı hər code point *özü kimi, bir bayt, yuxarı bit sıfır* kodlanır. 1975-ci ildən qalma ASCII faylı etibarlı UTF-8 faylı*dır* — heç bir çevirmə, heç vaxt. Dünyanın 20 il ərzində tədricən, fayl-fayl köçə bilməsinin və `café` mojibake-nizin yalnız `é`-ni zədələməsinin səbəbi budur. Süfrə dəsmalı mövcud bazanı məğlub etmədi; onu *ilhaq etdi*.
- **Self-synchronization.** UTF-8 axınının istənilən yerinə düşün: bayt `10` ilə başlayırsa, simvolun ortasındasınız — ən çox 3 bayt geri addımlayın və *mütləq* start baytına dəyəcəksiniz. Korlanmış bayt bir simvolu xarab edir, faylın qalanını heç vaxt — və bayt-yönümlü alətlər (`grep`, split, seek) anlamadıqları mətn üzərində işləməyə davam edir.
- **Sıfır bayt yox, endianness yox.** UTF-8 *bayt ardıcıllığıdır*, sətir kimi — Dərs 5-in immunitet qaydası tətbiq olunur. BOM lazım deyil, mətn üçün `htons` yoxdur, Lilliput-un dalaşacağı heç nə yoxdur.
- **Pulsuz düzgün sıralanır.** UTF-8-i bayt-bayt müqayisə etmək dəqiq code-point sırasını verir — çünki şablonlar *böyük ucu əvvələ* qoyur, biased float-ları tam ədəd kimi (Dərs 4) və ISO tarixləri sətir kimi (Dərs 5) sıralatdıran fəndin eynisi. Motivin üçüncü çıxışı; sonuncusu olmayacaq.

X/Open komitəsinin layihəsi FSS-UTF adlanırdı — "File System Safe UCS Transformation Format". Thompson-un versiyası təhlükəsizliyi saxladı, zərifliyi qazandı — və vahidə səkkiz bitlə, mərhəmətli dərəcədə qısa adı.

<DeepDive>

#### Dilinizdəki UCS-2 kabusu {/*the-ghost-of-ucs2*/}

UTF-16-nın çökmüş 65.536 fərziyyəsi ölmədi; Windows-un, Java-nın və JavaScript-in *içində* daşlaşdı və kabusu bir sətirlə çağıra bilərsiniz:

```js
"😀".length
```

<ConsoleBlock level="info">

2

</ConsoleBlock>

JavaScript sətirləri **UTF-16 code unit** ardıcıllıqlarıdır və `😀` (U+1F600) 65.535-dən yuxarıda yaşayır, ona görə qaçış-lyuku cütlüyü kimi saxlanır — **surrogate** adlanan iki vahid, Unicode-un məhz bu fəndi mümkün etmək üçün simvol fəzasından həmişəlik amputasiya etdiyi aralıqdan (U+D800–U+DFFF) götürülmüş. Çapıq yük daşıyır: heç vaxt simvol ola bilməyəcək 2.048 code point — 1993-cü il fərziyyəsi əvəz edilmək yerinə yamana bilsin deyə. `.length` vahidləri sayır, ona görə bir görünən emoji 2 kimi hesabat verir; `"😀".charCodeAt(0)` təkbaşına heç nə ifadə etməyən surrogate yarısı qaytarır; yarıların arasından dilimləmək zibil istehsal edir. Müasir JavaScript code-point-dən xəbərdar yollar əlavə etdi: `[..."😀"].length` 1-dir, çünki iterator code point dilində danışır. Java eyni kabusu daşıyır (`char` UTF-16 vahididir, buna görə `String.codePointAt` sonradan yamanıb) və Windows API-nin `W` funksiyaları bu gün də UTF-16-dır. Platformanın "character" tipi 1996-dan əvvələ aiddirsə, *code unit nəzərdə tutduğunu fərz edin* — və meta-dərsi yadda saxlayın: bir dilin nüvə sətir tipinə göndərilmiş encoding fərziyyəsi praktiki olaraq ölməzdir.

</DeepDive>

<DeepDive>

#### é yazmağın iki yolu {/*two-ways-to-write-e*/}

"Simvol axı nədir"in daha bir qatı, çünki production sistemlər bunun üstündə hər həftə sınır. Unicode `é`-nin iki cür yazılmasına icazə verir: tək code point U+00E9 kimi, və ya *iki* code point kimi — adi `e` (U+0065) və ardınca qonşusunun üstünə qalanan **combining accent** U+0301. Hər ikisi eyni görünür. Onlar fərqli sətirlərdir:

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

İki istifadəçi fərqli klaviaturalarda "café" yazır; verilənlər bazanız indi eyni söz üçün iki fərqli bayt ardıcıllığı saxlayır; axtarışlar boşa çıxır, dublikatlar çiçəklənir, parol yoxlamaları müəmmalı şəkildə uğursuz olur. Həll **normalization**-dır — kanonik reseptlər (NFC birləşdirir, NFD ayırır) *sərhəddə* tətbiq edilir ki, storage bir yazılış saxlasın. İstifadəçinin "bir simvol" kimi qavradığı isə — **grapheme cluster** — daha da böyük ola bilər: ailə emojisi 👨‍👩‍👧 görünməz zero-width joiner-lərlə tikilmiş dörd code point-dir və JavaScript-də `.length` 8 verir. Belə çıxır ki, mətn dördmərtəbəli binadır: ən altda **baytlar**, sonra **code unit-lər**, sonra **code point-lər**, ən yuxarıda — mansardda — **grapheme-lər**. Və "length" bu dörd adın hamısına vicdanla hay verir.

</DeepDive>

<Pitfall>

**"Plain text" deyə bir şey yoxdur.**

"Faylı sadəcə plain text kimi oxu" ifadəsində gizli dəyişən var və tarixdəki hər mojibake insidenti o dəyişənin səhv təxmin edilməsidir. Elan edilmiş encoding-i olmayan bayt axını *mətn deyil* — o, müqavilə gözləyən Dərs 1-in mənasız baytlarıdır. Buradan peşəkarları mojibake fabriklərindən ayıran sərhəd qaydaları: **encoding-i elan edilə bilən hər yerdə açıq elan edin** (`Content-Type: text/html; charset=utf-8`, `<meta charset="utf-8">`, verilənlər bazası sütun charset-ləri, `open(path, encoding='utf-8')`), **yeni sistemləri başdan-başa UTF-8-ə default edin** və **razılaşmaya bilən bayt axınlarını heç vaxt birləşdirməyin**. Yoldaş tələ `.length`-ə etibar etməkdir: `VARCHAR(10)` sütunu, 280 simvolluq limit, "max 20 chars" validasiyası — hər biri səssizcə dördmərtəbəli binanın bir mərtəbəsini seçir (baytlar? unit-lər? point-lər? grapheme-lər?) və off-by-one təhlükəsizlik buqları o boşluqlarda yaşayır. Length vacibdirsə, *hansı* length olduğunu ucadan deyin.

</Pitfall>

## Verilənlər bazasını sındıran emoji {/*the-emoji-that-broke-the-database*/}

On il boyunca bir production insidenti mühəndisləri bu dərslə istənilən dərslikdən çox tanış etdi. MySQL — dünyanın ən çox yayılmış açıq-mənbə verilənlər bazası — çoxdandır hərfi mənada `utf8` adlanan character set təklif edir və o, tarixi səbəblərdən simvolları **3 baytla** məhdudlaşdırır. Əsl UTF-8-ə U+FFFF-dən yuxarı hər şey üçün dörd lazımdır... emoji-lərin yaşadığı yer isə məhz oradır. Toqquşma qaçılmaz idi: istifadəçi şərhə `😀` yapışdırır, driver dörd vicdanlı bayt `F0 9F 98 80` göndərir və MySQL sətri era-müəyyənedici xəta ilə rədd edir və ya kəsir: `Incorrect string value: '\xF0\x9F\x98\x80'`. Bütöv applikasiyalar buraxıldı, ASCII-only test datası ilə QA-dan keçdi və real insanların istifadə etdiyi ilk həftəsonu yıxıldı — ASCII test-datası tələsinin ən saf forması. Əsl tam encoding **`utf8mb4`** ("most bytes 4") adı altında gəldi və MySQL 8.0 nəhayət onu default etdi; migrasiya bələdçiləri, charset-çevirmə skriptləri və döyüş hekayələri keçid mərasimi olaraq qalır. Dizaynerlər üçün əxlaq dərsi, bu modulun ən qədim səsi ilə: 3-baytlıq tavan dizayn vaxtı zərərsiz görünürdü — yalnız "heç kimin işlətmədiyi" simvolları xaric edirdi. Sonra 2010-cu il telefonlara emoji klaviaturası verdi və heç kimin istifadəçiləri hamının istifadəçilərinə çevrildi.

## Encoder laboratoriyası {/*the-encoder-lab*/}

Aşağıdakı oyuncaq Thompson-un süfrə dəsmalıdır, icra oluna bilən halda. Simvol seçin; code point-inin ölçülməsinə, şablonun seçilməsinə və payload bitlərinin tökülməsinə baxın — prefikslər mavi, diaqramlardakının dəqiq eynisi. Aşağıdakı sətir eyni baytları Latin-1 eynəyindən göstərir: əvvəl `Ã©`-ni təkrarlayın, sonra `😀`-nin bədnam dörd-baytlıq alter eqosu `ðŸ˜€` ilə tanış olun:

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
        {bytes.length} bayt — mavi bitlər şablondur, qalanı code point-dir.
      </p>
      <p style={{ fontFamily: 'system-ui', color: bytes.length > 1 ? '#c1554d' : '#087ea4' }}>
        {bytes.length > 1
          ? 'Latin-1 eynəyi bunu belə oxuyur: ' + latin1
          : '128-dən aşağı: Yer üzündəki hər müqavilə razıdır. Sınmaz.'}
      </p>
    </div>
  );
}
```

</Sandpack>

`A`-nın *sınmaqdan imtina edərək* nə nümayiş etdirdiyinə diqqət edin: baytın bütün aşağı yarısı neytral ərazidir — ASCII, hər code page və UTF-8 tərəfindən eyni dərəcədə qəbul edilmiş. O ortaq döşəmə internetin borularının — protokolların, URL-lərin, mənbə kodunun — dörd onillik encoding müharibələrindən salamat çıxmasının səbəbidir; Thompson-un döşəməni əvəz etmək yerinə *üstünə* qurmaq qərarının qalib gəlməsinin səbəbi də.

<Recap>

- **ASCII (1963)** 128 yuvalı mətn müqaviləsidir, qəsdən strukturlaşdırılmış: rəqəmlər 48–57-də (aşağı nibble = dəyər), `A` 65-də və `a` 97-də — dəqiq **bir bit fərqlə**, control simvollar 0–31-də teletayp ruhları kimi (`\n`=10, `\r`=13, `BEL`=7). `H` = 72 — Dərs 1-in borcu ödənildi.
- Baytın yuxarı 128 yuvası uyğunsuz **code page-lərə** çevrildi (Latin-1, ISO 8859-x, KOI8-R, Windows-1252): `0xE9` baytı müqavilədən asılı olaraq `é`-*dir* və ya `ι`-*dir*. **Mojibake** sərhəd uğursuzluğudur: UTF-8-in `C3 A9`-u Latin-1 kimi oxunanda `Ã©`-dur; kiril `Ð`-topası toxumasına çevrilir; `ï»¿` yanlış eynəkdəki BOM-dur.
- **Unicode** problemi ikiyə bölür: **code point** 1.114.112 yuvalıq fəzada rəqəmdir (U+0041, U+1F600); **encoding** rəqəmləri bayta çevirən ayrıca müqavilədir. UTF-32 israf edir; UTF-16 çökmüş 65.536 fərziyyəsini surrogate-lərə, BOM-lara və `"😀".length === 2`-yə daşlaşdırdı.
- **UTF-8** (Thompson & Pike, bir yeməkxana axşamı, 1992): dörd şablon — `0xxxxxxx`, `110xxxxx 10xxxxxx`, `1110…`, `11110…` — 7/11/16/21 payload biti daşıyır, böyük uc əvvəl. `é` → `C3 A9`, `€` → `E2 82 AC`, `😀` → `F0 9F 98 80`.
- Qələbə xüsusiyyətləri: **ASCII faylları onsuz da etibarlı UTF-8-dir**; continuation baytlar həmişə `10` ilə başlayır (**self-synchronizing**); sıfır bayt yoxdur; **endianness yoxdur**; bayt sırası = code-point sırası. Vebin **98%-dən çoxu** onunla danışır.
- Production qaydaları: **plain text yoxdur** — charset-i hər sərhəddə elan edin; girişdə **normalize edin** (é-nin iki yazılışı var); "length" dörd fərqli rəqəmdir (baytlar / code unit-lər / code point-lər / grapheme-lər); və MySQL-in `utf8`-i 3-baytlıq fırıldaqçıdır — əslisi **`utf8mb4`**-dür.

</Recap>

<Challenges>

#### Gülüşü kodla {/*encode-the-grin*/}

`😀`-ni (U+1F600) əllə dörd UTF-8 baytına kodlayın — şablon, bölmə, tökmə, hex. Sonra bir cümlə ilə izah edin: mojibake forması `ðŸ˜€` niyə düz dörd simvoldur?

<Hint>

0x1F600 binar sistemdə `1 1111 0110 0000 0000`-dır — 17 bit, deməli 21 payload yuvalı 4-baytlıq şablon lazımdır. Aparıcı sıfırlarla 21 bitə doldurun, sonra 3 | 6 | 6 | 6 bölün.

</Hint>

<Solution>

```
Code point:    0x1F600 = 0 0001 1111 0110 0000 0000   (21 bitə doldur)
Böl 3|6|6|6:    000 | 011111 | 011000 | 000000
Şablon 4:      11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
Tök:           11110 000   10 011111   10 011000   10 000000
Baytlar:       F0          9F          98          80   ✓
```

Maşınla çarpaz yoxlama: `'😀'.codePointAt(0).toString(16)` `'1f600'` qaytarır və emoji-nin istənilən hex dump-ı `f0 9f 98 80` göstərir.

Mojibake: bir *simvol* dörd *baytdır* və tək-baytlıq eynək hər baytı ayrıca simvol kimi oxuyur — `F0`→`ð`, `9F`→`Ÿ`, `98`→`˜`, `80`→`€` (Windows-1252-də) — buradan `ðŸ˜€`-nin düz dörd simvolu, `é`-ni cütlüyə çevirən bayt-başına-bir-simvol hesabının eynisi.

</Solution>

#### Sirli baytları dekodla {/*decode-the-mystery-bytes*/}

UTF-8 axınında var: `D0 9C D0 98 D0 A0`. Tam dekodlayın: simvol sərhədlərini yalnız prefikslərdən müəyyən edin, hər code point-i çıxarın və bunun hansı növ mətn olduğunu bildirin. (Tapacağınız code point-lər kiril blokunda olacaq, U+0400–U+04FF.)

<Solution>

Əvvəl prefiks analizi — cədvəl lazım deyil: `D0` = `11010000`, `110` ilə başlayır → "burada 2-baytlıq simvol başlayır"; `9C` = `10011100`, `10` ilə başlayır → continuation. Axın özü-özünü parse edir: `(D0 9C)(D0 98)(D0 A0)` — üç 2-baytlıq simvol. Bu, self-synchronization-ın öz işini görməsidir.

Payload-ları çıxarın (`110` və `10` prefikslərini atın, birləşdirin):

```
D0 9C:  10000 011100 → 100 0001 1100 = U+041C
D0 98:  10000 011000 → 100 0001 1000 = U+0418
D0 A0:  10000 100000 → 100 0010 0000 = U+0420
```

U+041C, U+0418, U+0420 kiril **М**, **И**, **Р**-dir — **МИР** sözü: rusca *sülh* (həm də *dünya*). Danny Cohen-in sülh çağırışı ilə başlayan modul qövsünün sonunda dekodlamaq üçün yaraşan mesaj — və bu sətir nə vaxtsa Latin-1 sərhədini keçsəydi, artıq bilirsiniz ki, `Ð`-topası uniformasında gələrdi: `ÐœÐ˜Ð `.

</Solution>

#### Emoji ticket-i {/*the-emoji-ticket*/}

Transfer tapşırığı. Masanıza support ticket-i düşür: *"İstifadəçilər bildirir ki, emoji olan profil bio-sunu saxlamaq `Incorrect string value: '\xF0\x9F\x92\xBB' for column 'bio'` xətası ilə uğursuz olur. Adi ingiliscə və hətta fransız vurğulu bio-lar normal saxlanır. Marketinq 'add your vibe' kampaniyasını başladandan sonra başlayıb."* Backend MySQL-dir, sütunun charset-i `utf8`. Kök səbəbi dəqiq izah edin (niyə *məhz* emoji, vurğular niyə işləyir), düzəlişi bildirin və komanda wiki-si üçün iki cümləlik postmortem dərsini yazın.

<Solution>

**Kök səbəb:** MySQL-in `utf8` adlı charset-i tarixən 3-bayt-maksimum alt çoxluqdur (utf8mb3). U+FFFF-ə qədər hər code point-i əhatə edir — buraya `é` (2 bayt, U+00E9) və bütün latın vurğuları daxildir, buradan "fransızca normal saxlanır" — amma emoji-lər U+FFFF-dən yuxarıda yaşayır və **4-baytlıq şablonla** kodlanır: `💻` U+1F4BB-dir → `F0 9F 92 BB`, xətadakı baytların dəqiq özü. Aparıcı `F0` 4-baytlıq simvol elan edir; sütunun müqaviləsi 3-də tavanlanır; MySQL dəyəri rədd edir. Heç nə korlanmayıb — iki müqavilə sərhəddə razılaşmır, bu modulun ən qədim uğursuzluq forması.

**Düzəliş:** əsl encoding-ə keçin — `ALTER TABLE profiles CONVERT TO CHARACTER SET utf8mb4` (üstəgəl uyğun collation, connection charset-i və indekslənmiş `VARCHAR` uzunluqlarının hələ də sığdığının yoxlanması, çünki simvola düşən ən pis halda bayt sayı 3-dən 4-ə böyüyür). Yeni sxemlər: ilk gündən `utf8mb4` — MySQL 8.0-ın default-u məhz bu səbəbdən odur.

**Postmortem dərsi:** *"Test datamız ASCII və Qərbi Avropa idi, ona görə 3-baytlıq encoding tavanı əlimizdəki hər testdən keçdi — limit yalnız testlərimizin heç vaxt ehtiva etmədiyi simvollar üçün mövcud idi. Charset müqavilələri mühəndislərin yazdığı alt çoxluğa qarşı yox, istifadəçilərin yaza biləcəyi tam aralığa qarşı yoxlanmalıdır (seed datasında bir 😀 bunu tutardı)."* ✓

</Solution>

</Challenges>

<LearnMore title="Binar Sistemdə Rəng, Şəkil və Səs" path="/learn/faza-0/modul-0-1/color-image-audio">

Rəqəmlər, mənfilər, kəsrlər, bayt sırası, mətn — indiyə qədərki müqavilələr kompüterlərin *qurulduğu* şeyləri kodlayırdı. Növbəti — insanların qurulduğu şeylər üçün müqavilələr: Dərs 2-nin `#FF5733`-ü necə gözünüzün inandığı rəngə çevrilir, rəqəmlər toru necə fotoşəkil olur və saniyədə 44.100 ölçü necə musiqi olur — o cümlədən, 1980-ci ildə özünəməxsus süfrə-masası-ölçülü komitə müharibəsində seçilmiş o qəribə dəqiq rəqəmin bu gün stream edəcəyiniz hər mahnını niyə hələ də idarə etdiyi.

</LearnMore>