---
title: "Mənfi Rəqəmlər: Two's Complement"
---

<Intro>

1996-cı il iyunun 4-də Avropa Kosmik Agentliyi ilk Ariane 5-i buraxdı — hazırlanması on il və təxminən 7 milyard dollar çəkmiş raket, üstündə təqribən 370 milyon dollarlıq dörd Cluster elmi peyki. Uçuşun otuz yeddinci saniyəsində raket kəskin şəkildə kursdan çıxdı və öz özünüməhvetmə sistemini işə saldı. Səbəb nə mühərrik idi, nə çən, nə də sensor. İdarəetmə proqramının dərinliyində 64-bitlik sürət dəyəri **16-bitlik signed tam ədədə** çevrilirdi — 32.767-dən böyük heç nə tuta bilməyən qutuya. Ariane 5 sələfindən sürətli yüksəlirdi, rəqəm sığmadı, çevirmə exception qaldırdı və idarəetmə kompüteri söndü. Ehtiyat kompüter işi götürdü, *eyni datanın* üstündə *eyni kodun özünü* işlətdi və 72 millisaniyə əvvəl eyni ölümlə öldü. Yarım milyard dollarlıq hardware qutuya sığmayan bir rəqəmlə məhv edildi — özü də *signed* qutuya. Keçən dərs unsigned sayğacları daşırdınız; bu dərs "signed"in nə demək olduğunu, onun niyə bütün mühəndisliyin ən zərif fəndlərindən biri olduğunu və iti kənarlarının bu gün hələ də harada kəsdiyini öyrənəcəksiniz.

</Intro>

<YouWillLearn>

- Hardware-in heç yerində niyə minus işarəsi olmadığı — və "mənfi rəqəm müqaviləsi"nin nə vəd etməli olduğu
- İki uğursuz dizayn (sign-magnitude və one's complement) və hər birinin konkret necə sındığı
- **Two's complement**: geriyə sürülən odometr və bütün-bitləri-çevir-1-əlavə-et resepti
- Ən dərin baxış: MSB çəkisi **−128** olan adi mövqedir
- 8/16/32/64-bitlik tam ədədlərin signed aralıqları — və `abs()`-a yalan söylətdirən tənha `−128`
- Signed overflow-un Java-nın `binarySearch`-ünün içində doqquz il necə gizləndiyi və onu review-da necə tutmaq

</YouWillLearn>

## Hardware-də minus işarəsi yoxdur {/*no-minus-sign-in-the-hardware*/}

Bu kursun birinci qaydasını xatırlayın: **byte-ların mənası yoxdur — müqavilələrin var.** `01001000` byte-ı sırf hansı müqavilə altında oxuduğunuzdan asılı olaraq `H` hərfi, 72 rəqəmi və ya pikselin üçdə biri olurdu. İndiyə qədər bütün rəqəm müqavilələrimiz **unsigned** idi: səkkiz bit, çəkilər 1-dən 128-ə, aralıq 0-dan 255-ə, sıfırdan aşağı heç nə hətta təsəvvür edilə bilməz.

Amma real proqramlar sıfırdan aşağı düşən dəyərlərlə doludur: temperaturlar, bank balansları, koordinat sürüşmələri, tərs istiqamətə baxan sürət komponentləri. Yaddaş hüceyrəsi isə sizə düz iki gərginlik səviyyəsi təklif edir — "minus" üçün üçüncü hal yoxdur, silisiuma həkk olunmuş balaca tire yoxdur. Mənfi rəqəm nə olacaqsa, adi 0-lardan və 1-lərdən, yeni müqavilə altında qurulmalıdır.

Yaxşı müqavilə "budur, −5-i belə yazmaq olar"dan çoxunu vəd etməlidir. O, **hesabı** işlək saxlamalıdır — ideal halda unsigned rəqəmləri onsuz da emal edən eyni sadə adder sxemində, çünki 1950-ci ildə (və düzünü desək, 2026-da da) hər əlavə sxem pula, enerjiyə və uğursuzluq rejimlərinə başa gəlir. Dizaynerlər o ikinci tələbi unudanda nə baş verdiyinə baxın.

## Cəhd 1: sign-magnitude {/*attempt-1-sign-magnitude*/}

Aşkar ideya — sizin də, mənim də ilk beş dəqiqədə icad edəcəyimiz — insanların rəqəm yazdığı üsulu kopyalamaqdır: işarə, sonra qiymət. Ən soldakı biti (MSB-ni) **işarə bayrağı** kimi ayır: `0` müsbət deməkdir, `1` mənfi, qalan yeddi bit adi dəyəri saxlayır.

```
+5 = 0 0000101      (işarə 0, qiymət 5)
−5 = 1 0000101      (işarə 1, qiymət 5)
```

Bu, **sign-magnitude** adlanır və iki qüsuru var — biri çirkin, biri ölümcül.

Çirkini: indi **iki sıfır** var. `00000000` +0-dır və `10000000` −0-dır — eyni rəqəm olduğunu iddia edən iki fərqli bit nümunəsi. Maşındakı hər bərabərlik yoxlaması indi onları xüsusi hal kimi emal etməlidir ("x sıfırdır? hər iki yazılışı yoxla") və 256 qiymətli nümunənizdən biri dublikata israf olunur.

Ölümcülü: **toplama sınır.** +5 və −5-i adi binary adder-ə verin — keçən dərsin odometr mexanizmi, sadəcə sütunları toplayıb carry ötürən — və baxın:

```
    0 0000101      +5
  + 1 0000101      −5
  -----------
    1 0001010      işarə 1, qiymət 10  →  −10 ✗

Gözlənilən: 0.  Alınan: −10.
```

Adder öz işini mükəmməl gördü; cəfəngiyatı *müqavilə* istehsal etdi, çünki sign-magnitude altında mənfi rəqəm əlavə etmək müsbət əlavə etməklə eyni mexaniki hərəkət deyil. Hesabı işlətmək üçün ikinci sxem lazım olardı: işarələri müqayisə et, fərqlidirsə kiçik qiyməti böyükdən çıx, sonra böyüyün işarəsini kopyala... Bu, erkən maşınların həqiqətən qurduğu — və pulunu ödədiyi — real hardware-dir.

## Cəhd 2: one's complement {/*attempt-2-ones-complement*/}

İkinci tarixi cəhd daha hiyləgərdir: rəqəmi mənfiləşdirmək üçün **hər biti çevir**.

```
+5 = 00000101
−5 = 11111010      (hər bit tərsinə çevrilib)
```

Bu, **one's complement**-dir və toplama *az qala* işləyir. +5 ilə −5-i toplayın — `11111111` alırsınız, bu da bu müqavilə altında... −0-dır. Yenə iki sıfır (`00000000` və `11111111`), və sıfırı keçən cəmlər bir vahid yanlış çıxır — adder **end-around carry** adlı əlavə fənd icra etməyincə: carry sol ucdan düşəndə, onu dövrə vurub ən sağ sütuna əlavə et. Daha çox xüsusi hardware, daha çox xüsusi hal.

<Note>

One's complement uduzub yoxa çıxmış muzey eksponatı deyil. Ciddi maşınlar onunla çıxdı — Seymour Cray-in CDC 6600-ü, 1964-cü ildə dünyanın ən sürətli kompüteri, one's-complement maşını idi — və onun bir küncü hələ də işləyir: *elə indi, sizin cihazınızda*. Hər IP packet header-ini qoruyan **Internet checksum** (RFC 1071) one's-complement cəmi kimi müəyyən edilib. Şəbəkələr fazası packet header-ləri açanda end-around carry ilə yenidən görüşəcəksiniz — sağ və salamat.

</Note>

İndiyə qədərki hesab lövhəsi: iki dizayn, hər ikisində əkiz sıfırlar, hər ikisi düzgün toplamaq üçün xüsusi sxemə möhtac. Qalib dizayn heç bir cəhdin vermədiyi sualdan doğulur — və o suala cavab verən maşın artıq sizindir.

## Geriyə sürülən odometr {/*the-odometer-driven-backwards*/}

Keçən dərsin odometri *yuxarı* sayırdı: çarxlar irəli fırlanır, dolu çarx qonşusuna carry ötürür və tam dolu çarx dəsti sıfıra aşır. İndi maşını **geriyə** sürün.

Altı çarxlı odometr `000000` göstərir. Bir kilometr geri gedin. Hər çarx qonşusundan borc alır, borc sola qədər yayılır, ucdan düşür və ekran göstərir:

```
000000  −  1  =  999999
```

İndi fəlsəfi gediş. O göstərici *nədirsə, odur*. `999999`-u doqquz yüz doxsan doqquz min... kimi oxumağa davam etsəniz, odometr xarabdır. Amma yeni müqavilə elan etsəniz — "şkalanın zirvəsinə bu qədər yaxın istənilən göstərici sıfırdan *aşağıda* olduğumuzu bildirir" — onda `999999` sadəcə **−1-dir**. Bir kilometr də geri: `999998` −2-dir. Və bu, təkcə etiketləmə deyil: hesab artıq işləyir. `999999`-a 1 əlavə edin — çarxlar `000000`-a aşır: keçən dərsin bədxahı olan overflow məhz −1 + 1-in etməli olduğunu edir. **Aşma elə minus işarəsinin özüdür.**

Two's complement məhz bu müqavilədir, binary odometrə tətbiq edilmiş. 256 mövqeli 8-bitlik şkalanı götürün və *yenidən zonalaşdırın*: `00000000`-dan `01111111`-ə qədər nümunələr unsigned mənalarını saxlayır, 0-dan +127-yə. `10000000`-dan `11111111`-ə qədər nümunələr — şkalanın yuxarı yarısı, "aşmaya yaxın" olanlar — **−128-dən −1-ə** elan edilir.

<Diagram name="negative-numbers/twos_complement_circle" height={430} width={640} alt="Byte-ın 256 halını təmsil edən 16 bölgülü dairəvi şkala, keçən dərsin overflow şkalası ilə üst-üstə düşür. 0 yuxarıda oturur. Saat əqrəbi istiqamətində sağ tərəfə enərkən bölgülər mavi rəngdə +32, +64, +96 və +127 etiketlənib — şkalanın sağ yarısını 'müsbət, MSB = 0' etiketli mavi qövs əhatə edir. Aşağıda, +127-dən dərhal sonra saat əqrəbi istiqamətində, şkalanın kənarını 'tikiş: +127 + 1 = −128' etiketli qırıq qırmızı tikiş xətti kəsir. Saat əqrəbi istiqamətində sol tərəflə yuxarı davam edərkən bölgülər qırmızı tonlu mətnlə −128, −96, −64, −32 və −1 etiketlənib, onları 'mənfi, MSB = 1' etiketli solğun qırmızı qövs əhatə edir. −1 yuxarıda 0-ın dərhal saat əqrəbinin əksi tərəfində oturur. Mərkəz mətni: 'eyni 256 hal — yeni müqavilə'.">

Keçən dərsin eyni 256 mövqeli şkalası — yenidən zonalaşdırılmış. Sağ yarı müsbətdir, sol yarı mənfi, −1 düz 0-ın yanında oturur və yeganə təhlükəli keçid aşağıdakı tikişdir.

</Diagram>

Bunun *sıfır* yeni hardware ilə nə aldığına baxın:

- **Bir sıfır.** `00000000` və başqa heç nə. `11111111` nümunəsi artıq ehtiyat sıfır deyil — o, −1-dir, binary-nin "999999"-u.
- **Toplama sadəcə işləyir.** −1 + 1 `11111111 + 00000001` deməkdir = `1 00000000`; carry 8-bitlik ucdan düşür, düz odometrin borcunun düşdüyü kimi, geriyə `00000000` qalır. ✓
- **MSB işarəni yenə açıqlayır** — hər mənfi nümunə 1 ilə başlayır, hər qeyri-mənfi 0 ilə — amma bu, zonalaşdırmanın *nəticəsidir*, xüsusi qaydaları olan xüsusi bayraq deyil.

Formal olaraq: −x-i təmsil edən nümunə (byte üçün) `2⁸ − x`-dir, eynilə 999999-un 10⁶ − 1 olduğu kimi. Ad da buradan gəlir — *ikinin qüvvətinə nəzərən complement-i* saxlayırsınız.

## Resept: bitləri çevir, bir əlavə et {/*flip-the-bits-add-one*/}

Beyninizdə `256 − x` hesablamaq əyləncəli deyil, ona görə budur hər mühəndisin faktiki işlətdiyi mexaniki qısayol. İstənilən rəqəmi mənfiləşdirmək üçün:

1. **Hər biti çevir** (bu, one's complement-dir — `255 − x`).
2. **1 əlavə et** (`256 − x`-ə düzəldərək).

<Diagram name="negative-numbers/negate_invert_add_one" height={330} width={720} alt="Etiketli oxlarla birləşdirilmiş, bir sırada üç byte qutusu. Birinci qutu 00000101 göstərir, '+5' alt yazısı ilə. 'Hər biti çevir' etiketli ox 11111010 göstərən ikinci qutuya aparır. '+ 1' etiketli ikinci ox mavi ilə vurğulanmış üçüncü qutuya aparır: 11111011, '−5' alt yazısı ilə. Qutuların altında yoxlama cəmi sütunlarla düzülüb: 00000101 üstəgəl 11111011 bərabərdir 1 00000000, aparıcı carry rəqəmi 1 qırmızı rəngdə 8-bitlik çərçivədən kənara düşür və sağ qalan səkkiz bit 00000000 vurğulanıb, 'carry ucdan düşür — cəm dəqiq 0-dır' alt yazısı ilə.">

+5-in mənfiləşdirilməsi: çevir, bir əlavə et. Aşağıdakı yoxlama bütün satış təqdimatının özüdür — adi adder təmiz, tək sıfır istehsal edir.

</Diagram>

**İşlənmiş nümunə — −5-i kodla:**

```
 +5          = 00000101
 çevir       = 11111010
 1 əlavə et  = 11111011      ← bu, −5-dir

Adi adder ilə yoxla:
   00000101      +5
 + 11111011      −5
 ----------
 1 00000000
 ↑ carry 8-bitlik ucdan düşür (odometrin aşması)

 Nəticə: 00000000 = 0 ✓
```

İşarə-müqayisə sxemi yox, end-around carry yox, əkiz sıfır yox. Keçən dərsin kütbeyin adder-i düzgün cavab verir, *çünki müqavilə adder-in onsuz da etdiyinin ətrafında dizayn edilib.*

**İşlənmiş nümunə — çıxma pulsuz.** Mənfiləşdirmə ucuzlaşan kimi çıxma ayrıca əməliyyat olmaqdan çıxır: `a − b` sadəcə `a + (−b)`-dir. 7 − 3-ü hesablayın:

```
 −3:  00000011 → çevir → 11111100 → +1 → 11111101

   00000111       7
 + 11111101      −3
 ----------
 1 00000100
 ↑ düşən carry-ni at

 Nəticə: 00000100 = 4 ✓
```

CPU-nuzun subtractor ehtiva etməməsinin səbəbi budur. O, bir adder və bir sıra bit-çevirici ehtiva edir və indiyə qədər icra etdiyiniz hər çıxma gizlicə toplama olub. Bir sxem, dörd iş: signed toplama, unsigned toplama, signed çıxma, unsigned çıxma — adder hansını icra etdiyini *ayırd belə edə bilmir*; yalnız bitləri oxuduğunuz müqavilə fərqlənir. **Two's complement-in qalib gəlməsinin** səbəbi bu qənaətdir: John von Neumann onu məşhur 1945-ci il EDVAC hesabatında tövsiyə etdi, IBM-in System/360-ı — 8-bitlik byte-ı standartlaşdıran həmin 1964-cü il maşını — onu sementlədi və bu gün o qədər universaldır ki, C++20 standartı nəhayət alternativlərin mövcudluğunu iddia etməkdən əl çəkdi və signed tam ədədlərin two's complement *olduğunu* qanunla elan etdi.

<DeepDive>

#### Ən dərin baxış: MSB-nin çəkisi −128-dir {/*the-msb-weighs-minus-128*/}

Çevir-və-1-əlavə-et reseptdir; budur two's complement-in hər "sirrini" bir anda əridən *zehni model*. İşarələri tamam unudun. Two's complement byte-ı keçən dərsin adi mövqeli yazılışıdır — çəkiləri toplayaraq oxuyun, əvvəlki kimi — bir dəyişikliklə: **MSB-nin çəkisi +128 yox, −128-dir.**

<Diagram name="negative-numbers/msb_negative_weight" height={330} width={720} alt="Bir sırada 1 1 1 1 1 0 1 1 saxlayan səkkiz bit qutusu. Hər qutunun altında çəkisi: birinci qutunun altında təhlükə qırmızısı ilə −128, sonra adi mətnlə 64, 32, 16, 8, 4, 2, 1. 1 saxlayan qutular vurğulanıb; 0 saxlayan qutu (çəki 4) solğunlaşdırılıb. Əyri oxlar vurğulanmış sütunlardan aşağıya, cəm sətrinə axır: −128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5. −128 həddi qırmızıdır.">

`11111011` adi çəkiləri-topla üsulu ilə oxunur — yuxarı çəki mənfi olmaqla. Keçən dərsin eyni bacarığı, bir işarə dəyişib.

</Diagram>

```
  1        1     1     1     1    0    1    1
−128      64    32    16     8    4    2    1

−128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5 ✓
```

İndi sirlərin buxarlanmasına baxın:

- **MSB = 1 niyə mənfi deməkdir?** Çünki −128 qalan hər şeyin cəmindən ağırdır: o biri yeddi çəkinin cəmi ən çox +127-dir, deməli −128 sütunu ödənən kimi cəm *sıfırdan yuxarı geri dırmaşa bilməz.* "İşarə biti" bayraq deyil — sadəcə ən ağır çəkidir və elə olub ki, mənfidir.
- **Niyə dəqiq bir sıfır?** Sıfır "heç bir çəki seçilməyib" deməkdir: `00000000`. Sıfıra qapanan ikinci çəki seçimi yoxdur, çünki +127-lik müsbətlər −128-i heç vaxt tam ödəyə bilməz.
- **Aralıq niyə simmetrik yox, −128-dən +127-yə qaçır?** MSB-siz bütün müsbətlər seçilib: +127. Tək MSB: −128. Asimmetriya əzbərlənəcək qəribəlik deyil — göz qabağında duran çəkilər hesabıdır.

Bir byte, bir oxuma qaydası, hər xüsusiyyət çıxarılmış. Saxlamağa dəyən baxış budur.

</DeepDive>

## Aralıq cədvəli — və tənha −128 {/*the-range-table-and-the-lonely-minus-128*/}

Eyni müqavilə istənilən enə miqyaslanır — çevir-və-1-əlavə-et eyni cür işləyir və yuxarı bitin çəkisi −2ⁿ⁻¹-dir:

| En | Signed aralıq | Harada rastlaşırsınız |
|-------|--------------|-------------------|
| 8-bit | −128 … +127 | audio sample-lar, sensor göstəriciləri, `int8_t` |
| 16-bit | −32.768 … +32.767 | **Ariane 5-in ölümcül qutusu**; audio CD-lər; köhnə oyun koordinatları |
| 32-bit | −2.147.483.648 … +2.147.483.647 | C/Java-da `int`; Gangnam Style tavanı; Y2038-in saatı |
| 64-bit | ≈ ±9,2 × 10¹⁸ | `long`, `BIGINT`, müasir timestamp-lar |

Diqqət edin: hər sətirdə mənfi tərəfdə bir vətəndaş artıqdır. O tənha əlavə dəyər — `−128`, `−32.768`, `−2.147.483.648` — həqiqətən qəribə bir buqun mənbəyidir. −128-i reseptlə mənfiləşdirməyə çalışın:

```
 −128        = 10000000
 çevir       = 01111111
 1 əlavə et  = 10000000      ← yenə −128!
```

Signed byte-da +128 mövcud deyil (tavan +127-dir), ona görə resept dövrə vurub mənfiləşdirməyə çalışdığınız rəqəmin özünü geri verir. **Minimum dəyəri mənfiləşdirmək minimum dəyəri qaytarır** — bu isə o deməkdir ki, məhz mütləq-qiymət funksiyası mənfi rəqəm qaytara bilir. Java-da `Math.abs(Integer.MIN_VALUE)` həqiqətən −2.147.483.648 qaytarır: `abs()`-ın yalan dediyi yeganə giriş. Eyni dövrə vurmanı brauzer konsolunda typed array ilə izləyə bilərsiniz — o, JavaScript-in rəqəmlərini əsl signed byte-a məcbur edir:

```js
const a = new Int8Array(1);
a[0] = -128;
a[0] = -a[0];   // mənfiləşdir
a[0]
```

<ConsoleBlock level="info">

-128

</ConsoleBlock>

<Pitfall>

**Signed overflow sadəcə dövrə vurmur — işarəni çevirir.**

Keçən dərsin unsigned sayğacı heç olmasa *kiçik* uğursuz olurdu: 255 + 1 sıfırdan başlayırdı. Signed şkala *zorakılıqla* uğursuz olur, çünki tikiş bir-birindən ən uzaq iki dəyərin arasında oturur: `+127 + 1 = −128`. İki müsbət rəqəm toplayın, nəhəng mənfi alın. Bank balansı tavanı keçib borca çevrilir; oyun xalı mümkün ən pis xala çevrilir; sağa yönəlmiş sürət sola yönəlmiş sürətə çevrilir.

C və C++-da isə yanlışdan da betərdir — signed overflow formal olaraq **undefined behavior**-dur: kompilyatora bunun heç vaxt baş vermədiyini fərz etmək icazəsi verilib və o, təhlükəsizlik yoxlamalarınızı *yoxluğa optimallaşdıra* bilər. `if (x + 1 < x)` ağıllı overflow testinə oxşayır; müasir kompilyator onu bütövlükdə silə bilər — signed `x` üçün şərtin "qeyri-mümkün" olduğunu əsas gətirərək. Əməliyyatdan *əvvəl* test edin (`x > INT_MAX − y`) və ya kompilyatorun checked-arithmetic builtin-lərini işlədin — heç vaxt sonra test etməyin.

</Pitfall>

## İyirmi il gizlənən buq {/*the-bug-that-hid-for-twenty-years*/}

İşarə-çevirən overflow raketlərə xas ekzotik uğursuzluq deyil. 2006-cı ildə Joshua Bloch — Java-nın nüvə kitabxanasının böyük hissəsini yazan mühəndis — *"Nearly All Binary Searches and Mergesorts are Broken"* ("Demək olar bütün binary search-lər və mergesort-lar sınıqdır") adlı etiraf dərc etdi. Günahkar, indiyə qədər yazılmış az qala hər binary search-də görünən bir sətir idi — onun özünün təxminən on il əvvəl `java.util.Arrays`-ə qoyduğu da daxil:

```
mid = (low + high) / 2;
```

*Alqoritm* dərslik səviyyəsində düzgündür. Amma `low + high` signed 32-bitlik toplamadır və axtarış təxminən bir milyard elementdən (2³⁰) böyük massivdə işləyəndə `low + high` 2.147.483.647-ni keçə bilir — cəm tikişi keçir, mənfiyə çevrilir və `mid` mənfi indeks olur. Proqram `ArrayIndexOutOfBoundsException` ilə çökür... amma yalnız 1997-ci ildə heç kimin test etmədiyi qədər böyük girişlərdə.

Buq JDK-da təxminən doqquz il oturdu. Bloch-un daha böyük mesajı daha sərt idi: mahiyyətcə eyni sətir Jon Bentley-nin klassik *Programming Pearls* kitabında (1986) da var — alqoritmi formal olaraq düzgün *isbat edən* kitabda — deməli buq "isbatlanmış" kodda təxminən iyirmi il gizlənmişdi. İsbat ideal tam ədədlər haqqında idi; çöküş 32-bitliklər haqqında. Düzgün alqoritm, sınıq implementasiya.

Düzəlişləri əzbərləməyə dəyər, çünki bir gün bu sətri özünüz yazacaqsınız:

```
mid = low + (high − low) / 2;     // fərq daşa bilməz
mid = (low + high) >>> 1;         // Java: unsigned shift — işarə
                                  // müqaviləsinə məhəl qoymayan bölmə
```

Keçən dərsin əxlaq dərsini xatırlayın: *limitlər dizayn vaxtı çatılmaz görünür, amma sistemlər dizaynerlərinin fərziyyələrindən uzun yaşayır.* 1986-cı ildə milyard elementli massiv elmi fantastika idi. 2006-cı ildə adi bir çərşənbə axşamı.

<DeepDive>

#### Sign-magnitude hara köçdü {/*where-sign-magnitude-went-to-live*/}

Sign-magnitude tam ədəd müharibəsini uduzdu, amma ölmədi — çox rahat bir malikanəyə təqaüdə çıxdı. **IEEE 754 floating-point rəqəmləri** — hər dildəki `float` və `double`, növbəti dərsin mövzusu — dəyərlərini işarə biti üstəgəl qiymət kimi saxlayır. Bu dərsin 1-ci cəhdi kodunuzun toxunduğu hər `0.5`-in və `3.14`-ün içində işləyir.

Və köhnə yükünü də özüylə gətirdi: floating-point-də həqiqətən **iki sıfır** var. `+0.0` və `−0.0` hər IEEE maşınında fərqli bit nümunələridir. Komitə çirkinliyin üstünü örtdü — `==` operatoru onları bərabər saymağa borcludur — amma sıxışdırsanız, tikişlər görünür:

```
 0.0 === -0.0        →  true      (saziş)
 Object.is(0, -0)    →  false     (bitlər)
 1 / -0.0            →  -Infinity (ələ verən əlamət)
```

Two's complement-ə uduzandan əlli il sonra əkiz-sıfır problemi Yer üzündəki hər prosessorda sağdır — sadəcə bir mərtəbə yuxarıda.

</DeepDive>

## İşarəni özünüz sındırın {/*break-the-sign-yourself*/}

Budur Dərs 1-in açar paneli, təkmilləşdirilmiş: eyni səkkiz açar, amma indi byte-ı *hər iki* müqavilə eyni anda oxuyur. MSB — −128 çəkisinin sahibi olan açar — qırmızı haşiyə geyinib. Açarları çevirin və baxın: MSB sönülü qaldıqca iki oxunuş mükəmməl üst-üstə düşür. Onu yandırın — eyni bitlər 256 fərqlə iki fərqli rəqəmə bölünür. `11111011`-i (−5) qurmağa çalışın, sonra `10000000`-ı (tənha −128), sonra `01111111`-dən (+127) başlayıb əllə "bir əlavə edin":

<Sandpack>

```js
import { useState } from 'react';

export default function SignedPanel() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 1, 0, 1]);

  function flip(i) {
    const next = bits.slice();
    next[i] = next[i] ? 0 : 1;
    setBits(next);
  }

  const unsigned = bits.reduce((sum, b) => sum * 2 + b, 0);
  const signed = unsigned >= 128 ? unsigned - 256 : unsigned;
  const split = bits[0] === 1;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>
        Bir byte, iki müqavilə. Qırmızı haşiyəli açar MSB-dir:
      </p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => flip(i)}
            style={{
              width: 38, height: 50, margin: 2, fontSize: 22,
              borderRadius: 8, cursor: 'pointer',
              border: i === 0 ? '3px solid #c1554d' : '1px solid #888',
              background: bit ? '#087ea4' : 'transparent',
              color: bit ? 'white' : 'inherit'
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <h2>
        unsigned: {unsigned}
        <br />
        signed:{' '}
        <span style={{ color: split ? '#c1554d' : 'inherit' }}>
          {signed}
        </span>
      </h2>
      <p style={{ fontFamily: 'system-ui' }}>
        {split
          ? 'MSB yanılı: eyni bitlər indi 256 fərqlə iki rəqəm deməkdir.'
          : 'MSB sönülü: hər iki müqavilə razıdır.'}
      </p>
    </div>
  );
}
```

</Sandpack>

O dəqiq 256-lıq fərq bütün dərsin bir rəqəmdə xülasəsidir: MSB yanılı olanda signed oxunuş `unsigned − 256`-dır — odometrin "zirvəyə yaxın" əvəzinə "sıfırın azca altında" kimi şərh edilməsi.

<Recap>

- Hardware-də **minus işarəsi yoxdur** — mənfi rəqəmlər adi bitlərin üstünə sərilmiş *müqavilədir* və yaxşı müqavilə adi adder-i işlək saxlamalıdır.
- **Sign-magnitude** (işarə bayrağı + qiymət) və **one's complement** (bütün bitləri çevir) eyni iki cür uğursuz olur: **əkiz sıfırlar** və xüsusi hardware tələb edən hesab.
- **Two's complement** geriyə sürülən odometrdir: şkalanın yuxarı yarısı −128…−1 kimi yenidən zonalaşdırılıb, beləliklə `11111111` −1-dir və aşma minus işarəsinin *özüdür*. Bir sıfır — və kütbeyin adder həm toplamanı, həm çıxmanı, həm signed-i, həm unsigned-i emal edir.
- Mənfiləşdirmək üçün: **hər biti çevir, 1 əlavə et.** Çıxma sadəcə mənfiləşdirilənin toplanmasıdır — CPU-nuzda subtractor yoxdur.
- Ən dərin baxış: MSB **çəkisi −128** (və ya −2ⁿ⁻¹) olan adi mövqedir. Bu tək fakt işarə bitini, tək sıfırı və asimmetrik −128…+127 aralığını izah edir.
- Asimmetriya **−128-i müsbət əkizsiz** qoyur, ona görə INT_MIN-i mənfiləşdirmək INT_MIN qaytarır — `abs()`-ın mənfi rəqəm qaytardığı yeganə giriş.
- **Signed overflow işarəni çevirir**: `+127 + 1 = −128`, iki müsbətin cəmi mənfi olur və C/C++-da bu, undefined behavior-dur. Java-nın `binarySearch`-ündə `(low + high) / 2` kimi **~9 il** gizləndi (*Programming Pearls*-də isə ~20); `low + (high − low) / 2` yazın.

</Recap>

<Challenges>

#### −12-ni kodla {/*encode-minus-12*/}

Çevir-və-1-əlavə-et üsulu ilə −12-ni 8-bitlik two's complement byte-ı kimi kodlayın. Sonra cavabınızı *o biri* üsulla yoxlayın: byte-ı −128 çəkisi ilə geri oxuyun.

<Hint>

+12-dən başlayın. 12-ni binary sistemdə keçən dərs yazmısınız: 1, 2, 4, 8, 16... çəkilərindən hansı ikisinin cəmi 12 edir?

</Hint>

<Solution>

```
 +12         = 00001100      (8 + 4)
 çevir       = 11110011
 1 əlavə et  = 11110100      ← −12
```

Çəkilərlə yoxla, MSB = −128:

```
  1     1     1     1    0    1    0    0
−128   64    32    16    8    4    2    1

−128 + 64 + 32 + 16 + 4 = −128 + 116 = −12 ✓
```

İki müstəqil üsul, bir cavab — o çarpaz-yoxlama vərdişi real işdə sürüşmüş biti tutmağın dəqiq yoludur.

</Solution>

#### Bir byte, iki oxunuş {/*one-byte-two-readings*/}

Yaddaş dump-ı `11101100` byte-ını göstərir. Unsigned nədir? Signed nədir? Hər ikisinə cavab verin, sonra iki cavabınızı birləşdirən qısayolu tapın.

<Solution>

Unsigned, çəkiləri topla: 128 + 64 + 32 + 8 + 4 = **236**.

Signed, MSB −128 çəkir: −128 + 64 + 32 + 8 + 4 = −128 + 108 = **−20**.

Qısayol: MSB yanılı olanda həmişə **signed = unsigned − 256**. Yoxla: 236 − 256 = −20 ✓. Bu, şkala bir düsturda — eyni mövqe "236 addım yuxarı" və ya "aşmadan 20 addım aşağı" kimi oxunur. Sandpack oyuncağının işlətdiyi sətrin dəqiq özüdür.

</Solution>

#### Yalan danışan mütləq qiymət {/*the-absolute-value-that-lies*/}

Komanda yoldaşınız iddia edir: "`abs(x)` həmişə ≥ 0-dır — bütün işi elə budur." 8-bitlik byte-la onların haqsız olduğunu isbat edin: çevir-və-1-əlavə-et-in −128 üçün faktiki nə istehsal etdiyini göstərin və izah edin: *niyə* düzgün cavab mövcud deyildi?

<Solution>

```
 −128        = 10000000
 çevir       = 01111111
 1 əlavə et  = 10000000      ← −128, dəyişməz
```

Resept öz girişini geri qaytarır. Və uğursuz olmağa *məcbur idi*: düzgün cavab — +128 — signed byte-da mövcud deyil: müsbət tərəf +127-də bitir, çünki +128 "olmalı olan" `10000000` nümunəsi elə −128 olmaqla məşğuldur. Aralıq asimmetrikdir (bir sıfır + 127 müsbət + 128 mənfi = 256 hal), deməli minimum dəyərin müsbət əkizi yoxdur.

Bu, hər enə miqyaslanır: Java-da `Math.abs(Integer.MIN_VALUE)` −2.147.483.648 qaytarır. `abs()` hesablayıb nəticənin qeyri-mənfi olduğunu *fərz edən* istənilən kodun — massiv indeksi, məsafə, bucket nömrəsi kimi — onu sındıran 4,3-milyardda-bir girişi var. Müdafiə düzəlişi: mütləq qiymət götürməzdən əvvəl INT_MIN-i rədd edin və ya tipi genişləndirin.

</Solution>

#### Dəli olan sensor {/*the-sensor-that-went-mad*/}

Transfer tapşırığı. Firmware üzrə komanda yoldaşınız bu vəziyyəti review etməyinizi xahiş edir: mühərrik sensoru temperaturu **8-bitlik signed** dəyər kimi bildirir (aralıq −128…+127 °C, "artıqlaması ilə bəsdir — mühərrik heç vaxt 110 °C-ni keçmir"). Kalibrasiya yeniləməsi hər göstəriciyə saxlanmazdan əvvəl sabit **+30** offset əlavə edir. İsti test zamanı xam sensor 100 °C oxuyur. Firmware-in apardığı hesabı addım-addım keçin, hansı dəyərin saxlandığını bildirin və qoyacağınız iki cümləlik review şərhini yazın — o cümlədən bu uğursuzluq rejiminin crash-dan niyə *daha* təhlükəli olduğunu.

<Solution>

Firmware 100 + 30 = 130 hesablayır — amma 130 signed byte-a sığmır (tavan +127). Bit səviyyəsində:

```
   01100100      100
 + 00011110       30
 ----------
   10000010      MSB yanılı → signed oxunuş: −128 + 2 = −126
```

Saxlanan temperatur **−126 °C**-dir. Cəm +127-dəki tikişi keçib mənfi tərəfin dərinliyinə düşdü.

Review şərhi: *"+30 kalibrasiya göstəriciləri +127-dən yuxarı itələyə bilir (xam ≥ 98 °C artıq daşır) və saxlanan dəyər səssizcə böyük mənfi temperatura çevrilir — qızmış mühərrik qeyri-mümkün dərəcədə soyuq oxunacaq, deməli heç bir 'çox isti' həyəcan siqnalı heç vaxt işə düşməyəcək. Zəhmət olmasa saxlanan tipi 16-bitə genişləndirin (və ya toplamazdan əvvəl clamp edin) və xam = 98–127 üçün test əlavə edin."*

Crash-dan niyə betərdir: crash səslidir — watchdog-lar sistemləri yenidən başladır, loglar dolur, insanlar oyadılır. Burada isə sistem **səssizcə yanlış datanın** üstündə əminliklə işləməyə davam edir və təhlükəsizlik məntiqi "−126°"-ni "qətiyyən qızmır" kimi oxuyur. Qeyd edək ki, Ariane 5-in dizaynerləri əks mübadiləni seçmişdilər — çevirmə zibil saxlamaq əvəzinə exception qaldırdı — və o crash da fəlakət *oldu*. Əsl dərs bir mərtəbə yuxarıda oturur: aralıqlarınızı *dizayn vaxtı* bilin, çünki tikiş keçiləndə hər iki uğursuzluq rejimi pisdir. ✓ (98 + 30 = 128 → `10000000` = −128 — yanlışa gedən ilk xam dəyər.)

</Solution>

</Challenges>

<LearnMore title="Floating Point: 0.1 + 0.2 Niyə 0.3 Deyil" path="/learn/faza-0/modul-0-1/floating-point">

Tam ədədlər artıq sizindir, müsbəti də, mənfisi də. Amma dünya həm də 3.14, 0.001 və 6,02 × 10²³ üstündə fırlanır — və *onları* saxlayan müqavilə bu dərsdəki hər şeydən qəribədir: işarə bitini dirildir, iki sıfırı qəsdən saxlayır və 0.1-i dəqiq yaza bilmir — heç cür. 1991-ci ildə məhz o son fakt — hər tik-də 0,000000095 saniyəlik yuvarlaqlaşdırma xətası — bir Patriot raket batareyasına nişanını, 28 əsgərə isə həyatını itirtdi.

</LearnMore>