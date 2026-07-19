---
title: "Mənfi Ədədlər: İkilik Tamamlayan"
---

<Intro>

4 iyun 1996-cı ildə Avropa Kosmik Agentliyi ilk Ariane 5 raketini buraxdı — bu raket bir onillik müddətdə təxminən 7 milyard dollara hazırlanmışdı və ümumi dəyəri 370 milyon dollar olan dörd Cluster elm peyki daşıyırdı. Uçuşdan otuz yeddi saniyə sonra raket güclü şəkildə kənarlaşdı və öz özündən məhvetmə sistemini işə saldı. Səbəb nə mühərrik, nə çən, nə də sensör idi. İdarəetmə proqramının dərinliklərində 64-bit sürət dəyəri **16-bit işarəli tam ədədə** çevrildi — 32 767-dən böyük heç nəyi tutmayan bir qutu. Ariane 5 sələfindən daha sürətli sürətləndi, ədəd sığmadı, çevirmə istisna qaldırdı və idarəetmə kompüteri söndü. Ehtiyat kompüter dəvr aldı, *eyni kodu* eyni verilənlər üzərində icra etdi və 72 millisaniyə əvvəl eyni şəkildə çöküşə uğradı. Yarım milyard dollarlıq texnika bir qutya sığmayan ədəd — *işarəli* qutu — tərəfindən məhv edildi. Ötən dərsdə işarəsiz sayğacların overflow etdiyini gördünüz; bu dərsdə "işarəli" nə deməkdir, niyə bütün mühəndisliyin ən zərif hiyləsi sayılır və iti kənarlarının bu gün hər yerdə necə görünüdüyünü öyrənəcəksiniz.

</Intro>

<YouWillLearn>

- Niyə hardware-da minus işarəsi yoxdur — və "mənfi ədəd kontraktı"nın nə vəd etməli olduğu
- İki uğursuz dizayn (sign-magnitude və one's complement) və hər birinin konkret sınma qaydası
- **Two's complement**: geri işləyən odometer, və bütün bitləri çevir-bir əlavə et resepti
- Ən dərin görünüş: MSB sadəcə ağırlığı **−128** olan adi bir mövqedir
- 8/16/32/64-bit tam ədədlərin işarəli aralıqları — və `abs()`-i yalan söylədən tənha −128
- İşarəli overflow-un Java `binarySearch`-inin içərisində necə doqquz il gizli qaldığı, və onu review-da necə tapmaq olar

</YouWillLearn>

## Hardware-da minus işarəsi yoxdur {/*no-minus-sign-in-the-hardware*/}

Bu kursun birinci qaydasını xatırlayın: **byte-ların mənası yoxdur — kontraktların var.** `01001000` byte-ı hansı kontraktla oxunduğuna görə `H` hərfi, 72 rəqəmi, ya da bir piksel parçası olurdu. İndiyə qədər bütün ədəd kontraktlarımız **unsigned** idi: səkkiz bit, 1-dən 128-ə qədər çəkilər, 0-dan 255-ə qədər aralıq, sıfırın altında heç nə düşünülmür.

Lakin real proqramlar sıfırdan aşağıya gedən dəyərlərlə doludur: temperaturlar, bank balansları, koordinat offsetləri, əks istiqamətə işarə edən sürət komponentləri. Yaddaş hücrəsi isə sizə yalnız iki gərginlik səviyyəsi təklif edir — "minus" üçün üçüncü hal yoxdur, silisiumda kiçik tire yoxdur. Mənfi ədəd nə olursa olsun, sadə 0 və 1-lərdən, yeni bir kontrakt altında qurulmalıdır.

Yaxşı kontrakt "−5-i yazmağın yolu budur"-dan çox şey vəd etməlidir. O, **arifmetikanın** işləməsini qorumalıdır — ideal olaraq, artıq işarəsiz ədədləri idarə edən eyni sadə toplayıcı dövrəsi üzərində, çünki 1950-ci ildə (dürüstcəsinə, 2026-da da) hər əlavə dövrə pul, güc və qüsur mənbəyi deməkdir. Dizaynerlərin bu ikinci tələbi unutduqda nə baş verdiyini izləyin.

## Cəhd 1: sign-magnitude {/*attempt-1-sign-magnitude*/}

Açıq fikir — siz ya mən ilk beş dəqiqədə icad edəcəyimiz — insanların ədəd yazmaq üsulunu kopyalamaqdır: işarə, sonra miqdar. Ən sol biti (MSB) **işarə bayrağı** kimi ayırın: `0` müsbət, `1` mənfi, qalan yeddi bit isə adi dəyəri saxlayır.

```
+5 = 0 0000101      (işarə 0, miqdar 5)
−5 = 1 0000101      (işarə 1, miqdar 5)
```

Buna **sign-magnitude** deyilir, iki qüsuru var — biri çirkin, biri ölümcül.

Çirkin olan: indi **iki sıfır** var. `00000000` +0-dır, `10000000` isə −0 — eyni ədədi iddia edən iki fərqli bit nümunəsi. Maşındakı hər bərabərlik yoxlaması artıq onları xüsusi hallandırmalıdır ("x sıfırdırmı? hər iki yazılışı yoxla"), 256 qiymətli nümunənizdən biri isə dublikat üçün israf olunur.

Ölümcül olan: **toplama sınır.** +5 və −5-i sadə ikili toplayıcıya verin — ötən dərsdəki odometer mexanizmi, sadəcə sütunları toplayır və daşıyır — və seyrdin:

```
    0 0000101      +5
  + 1 0000101      −5
  -----------
    1 0001010      işarə 1, miqdar 10  →  −10 ✗

Gözlənilən: 0.  Alınan: −10.
```

Toplayıcı işini mükəmməl etdi; *kontrakt* saçmalıq istehsal etdi, çünki sign-magnitude altında mənfi ədəd əlavə etmək müsbət ədəd əlavə etməklə eyni mexaniki hərəkət deyil. Arifmetikanı işlətmək üçün ikinci dövrəyə ehtiyac duyurdunuz: işarələri müqayisə et, fərqli isə kiçik miqdarı böyükdən çıxart, sonra böyüyün işarəsini kopyala... Bu, erkən maşınların həqiqətən qurduğu — və pul ödədiyi — real hardware idi.

## Cəhd 2: one's complement {/*attempt-2-ones-complement*/}

İkinci tarixi cəhd daha hiyləgərdir: ədədi mənfiləşdirmək üçün **hər biti çevirin**.

```
+5 = 00000101
−5 = 11111010      (hər bit invertləndi)
```

Buna **one's complement** deyilir, toplama *demək olar ki* işləyir. +5 və −5-i toplayanda `11111111` alırsınız — bu kontrakt altında bu... −0-dır. Hələ iki sıfır (`00000000` və `11111111`), sıfırı keçən cəmlər isə toplayıcı **son daşıma** adlanan əlavə bir hiylə etməzsə bir əksikdir: sol uçdan bir daşıma düşəndə, onu sağa döndər və ən sağ sütuna əlavə et. Daha çox xüsusi hardware, daha çox xüsusi hallar.

<Note>

One's complement muzey eksponatı kimi itib-batmadı. Ciddi maşınlar onunla göndərildi — 1964-cü ildə dünyanın ən sürətli kompüteri olan Seymour Cray-in CDC 6600-ü one's complement maşını idi — bir künc isə hələ *bu anda, cihazınızda* işləyir: hər IP paket başlığını qoruyan **Internet checksum**-u RFC 1071-ə əsasən one's complement cəmi kimi müəyyən edilib. Şəbəkələr mövzusu açılanda paket başlıqlarını görəcək, son daşımayla yenidən qarşılaşacaqsınız — canlı və sağlam.

</Note>

İndiki hesab: iki dizayn, ikisi də cüt sıfırla, ikisi də düzgün toplaması üçün xüsusi dövrəyə ehtiyac duyur. Qalib dizayn heç birinin vermədiyi suala cavab vermekdən gəlir — siz artıq cavablayan maşına sahib olursunuz.

## Geri işlədilən odometer {/*the-odometer-driven-backwards*/}

Ötən dərsdəki odometer yuxarıya sayırdı: çarxlar irəli fırlanır, dolu çarx qonşusuna daşıyır, tam dolu çarx dəsti isə sıfıra keçirdi. İndi maşını **geri sürun**.

Altı çarxlı odometer `000000` oxuyur. Bir kilometr geri sürün. Hər çarx qonşusundan borc alır, borc sol tərəfə dalğalanır, uçurumdan düşür, ekran isə göstərir:

```
000000  −  1  =  999999
```

İndi fəlsəfi hərəkət. O ekran *olduğu kimi*-dir. `999999`-u doqquz yüz doxsan doqquz min... kimi qəbul etsəniz, odometer sınıb. Amma yeni bir kontrakt elan etsəniz — "şkalanın yuxarısına bu qədər yaxın hər oxu biz *sıfırın altında* deməkdir" — onda `999999` sadəcə **−1 olar**. Daha bir geri getmək: `999998` isə −2-dir. Bu sadəcə etiketlənmə deyil: arifmetika artıq işləyir. `999999`-a 1 əlavə edin, çarxlar `000000`-a keçir — ötən dərsin qəhrəmanı olan overflow tam olaraq −1 + 1-in etməli olduğunu edir. **Dolanma mənfi işarəsidir.**

Two's complement məhz bu kontraktdır, ikili odometere tətbiq edilir. 256 mövqeyli 8-bit şkalasını götürün, onu *yenidən bölgülər**: `00000000`-dan `01111111`-ə qədər nümunələr öz işarəsiz mənalarını saxlayır, 0-dan +127-ə qədər. `10000000`-dan `11111111`-ə qədər — şkalanın yuxarı yarısı, "yeni dövrəyə yaxın" olanlar — **−128-dən −1-ə qədər** olaraq elan edilir.

<Diagram name="negative-numbers/twos_complement_circle" height={430} width={640} alt="A circular dial with 16 tick marks representing the 256 states of a byte, matching the overflow dial from the previous lesson. 0 sits at the top. Going clockwise down the right side, ticks are labeled +32, +64, +96 and +127 in blue — the right half of the dial is spanned by a blue arc labeled 'positive, MSB = 0'. At the bottom, immediately clockwise after +127, a jagged red seam line crosses the dial edge, labeled 'the seam: +127 + 1 = −128'. Continuing clockwise up the left side, ticks are labeled −128, −96, −64, −32 and −1 in red-toned text, spanned by a muted red arc labeled 'negative, MSB = 1'. −1 sits immediately counterclockwise of 0 at the top. Center text reads: 'same 256 states — new contract'.">

Ötən dərsdəki eyni 256 mövqeyli şkala — yenidən bölgülənib. Sağ yarı müsbət, sol yarı mənfi, −1 0-ın yanında oturur, tək təhlükəli keçid isə aşağıdakı tikişdir.

</Diagram>

Bunun *sıfır* yeni hardware ilə nə qazandırdığına baxın:

- **Bir sıfır.** `00000000` və başqa heç nə. `11111111` nümunəsi artıq ehtiyat sıfır deyil — o −1-dir, ikinin "999999"-u.
- **Toplama işləyir.** −1 + 1 `11111111 + 00000001` = `1 00000000` deməkdir; daşıma 8-bit kənarından düşür, eynən odometerin borc aldığı kimi, `00000000` qalır. ✓
- **MSB hələ işarəni göstərir** — hər mənfi nümunə 1-lə başlayır, hər müsbət isə 0-la — amma bu, bölgülənmənin *nəticəsidir*, xüsusi qaydalarla xüsusi bayraq deyil.

Formal olaraq: −x-i təmsil edən nümunə `2⁸ − x`-dir (byte üçün), eynən 999999-un 10⁶ − 1 olduğu kimi. Ad oradan gəlir — iki dərəcəsinə görə *tamamlayanı* saxlayırsınız.

## Resept: bitləri çevir, bir əlavə et {/*flip-the-bits-add-one*/}

Başınızda `256 − x` hesablamaq əyləncəli deyil, buna görə budur hər mühəndisin əslində istifadə etdiyi mexaniki qısayol. Hər hansı bir ədədi mənfiləşdirmək üçün:

1. **Hər biti çevirin** (bu one's complement — `255 − x`).
2. **1 əlavə edin** (`256 − x`-ə korreksiya).

<Diagram name="negative-numbers/negate_invert_add_one" height={330} width={720} alt="Three byte boxes in a row connected by labeled arrows. The first box shows 00000101 captioned '+5'. An arrow labeled 'flip every bit' leads to the second box showing 11111010. A second arrow labeled '+ 1' leads to the third box, highlighted in blue, showing 11111011 captioned '−5'. Below the boxes, a verification sum is laid out in columns: 00000101 plus 11111011 equals 1 00000000, with the leading carry digit 1 shown in red falling outside the 8-bit frame, and the surviving eight bits 00000000 highlighted, captioned 'the carry falls off the edge — the sum is exactly 0'.">

+5-i mənfiləşdirmək: çevir, bir əlavə et. Aşağıdakı yoxlama bütün satış meydançasıdır — sadə toplayıcı təmiz, bir sıfır verır.

</Diagram>

**İşlənmiş nümunə — −5 kodlayın:**

```
 +5          = 00000101
 çevir       = 11111010
 1 əlavə et  = 11111011      ← bu −5-dir

Sadə toplayıcı ilə yoxla:
   00000101      +5
 + 11111011      −5
 ----------
 1 00000000
 ↑ daşıma 8-bit kənarından düşür (odometerin üst-üstə gəlməsi)

 Nəticə: 00000000 = 0 ✓
```

İşarə müqayisəsi dövrəsi yoxdur, son daşıma yoxdur, cüt sıfır yoxdur. Ötən dərsdən sadə toplayıcı düzgün cavab verir, *çünki kontrakt toplayıcının artıq etdiyi şeyin ətrafında dizayn edilib.*

**İşlənmiş nümunə — pulsuz çıxma.** Mənfiləşdirmə ucuz olanda çıxma öz əməliyyatı olmağı dayandırır: `a − b` sadəcə `a + (−b)`-dir. 7 − 3 hesablayın:

```
 −3:  00000011 → çevir → 11111100 → +1 → 11111101

   00000111       7
 + 11111101      −3
 ----------
 1 00000100
 ↑ düşən daşımanı atın

 Nəticə: 00000100 = 4 ✓
```

Buna görə prosessorunuz çıxarıcı ehtiva etmir. O bir toplayıcı və bir bit çevirici sıra ehtiva edir, etdiyiniz hər çıxma gizlicə toplamaydı. Bir dövrə, dörd iş: işarəli toplama, işarəsiz toplama, işarəli çıxma, işarəsiz çıxma — toplayıcı hansını etdiyini belə *başa düşmür*; yalnız bitləri oxuduğunuz kontrakt fərqlənir. Bu qənaətçililik **two's complement-in qalib gəlməsinin** səbəbidir: John von Neumann onu 1945-ci ildəki məşhur EDVAC hesabatında tövsiyə etdi, IBM-in System/360-ı — 8-bit byte-ı standartlaşdıran eyni 1964-cü il maşını — onu möhkəmləndirdi, bu gün isə o qədər universal haldadır ki C++20 standartı alternativlərin mövcud olduğunu iddia etməkdən nəhayət imtina etdi və işarəli tam ədədlər qanunla *two's complement-dir* diye elan etdi.

<DeepDive>

#### Ən dərin görünüş: MSB-in çəkisi −128-dir {/*the-msb-weighs-minus-128*/}

Çevir-bir-əlavə-et reseptdir; budur hər two's complement "sirri"ni bir anda həll edən *mental model*. İşarələri tamamilə unutun. Two's complement byte ötən dərsdən adi mövqe notasiyasıdır — çəkilər əlavə edərək oxuyun, tam əvvəlki kimi — bir dəyişikliklə: **MSB-in çəkisi +128 əvəzinə −128-dir.**

<Diagram name="negative-numbers/msb_negative_weight" height={330} width={720} alt="Eight bit boxes in a row containing 1 1 1 1 1 0 1 1. Under each box its weight: −128 shown in danger red under the first box, then 64, 32, 16, 8, 4, 2, 1 in normal text. The boxes holding a 1 are highlighted; the box holding 0 (weight 4) is dimmed. Curved arrows flow from the highlighted columns down into a sum line reading: −128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5. The −128 term is red.">

`11111011` sadə çəkilər-əlavə-et olaraq oxunur — yuxarı çəki mənfi ilə. Ötən dərslə eyni bacarıq, bir işarə dəyişdi.

</Diagram>

```
  1        1     1     1     1    0    1    1
−128      64    32    16     8    4    2    1

−128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = −5 ✓
```

İndi sirlər buxarlanır:

- **Niyə MSB = 1 mənfi deməkdir?** Çünki −128 başqa hər şeyin cəmini üstələyir: digər yeddi çəki ən çoxu +127 verir, buna görə −128 sütunu ödəndikdən sonra cəm *sıfırın üstünə qalxa bilmir.* "İşarə biti" bayraq deyil — sadəcə ən ağır çəki, təsadüfən mənfidir.
- **Niyə düzgün bir sıfır?** Sıfır "heç bir çəki seçilməyib": `00000000`. +127-lik müsbətlər heç vaxt −128-i tam kompensasiya edə bilmədiyindən, çəkilərin sıfıra cəmlənəcəyi ikinci yol yoxdur.
- **Niyə aralıq simmetrik olaraq deyil −128-dən +127-yə qədər?** MSB olmadan bütün müsbətlər seçildi: +127. Yalnız MSB: −128. Asimmetriya əzbər üçün nüans deyil — ağırlıqların arifmetikası, adi görünüşdə.

Bir byte, bir oxuma qaydası, bütün xüsusiyyətlər türetildi. Bu, saxlamağa dəyər baxışdır.

</DeepDive>

## Aralıq cədvəli — və tənha −128 {/*the-range-table-and-the-lonely-minus-128*/}

Eyni kontrakt istənilən eni miqyaslayır — çevir-bir-əlavə-et eyni şəkildə işləyir, yuxarı bitin çəkisi −2ⁿ⁻¹-dir:

| En | İşarəli aralıq | Harada rast gəlinir |
|----|----------------|---------------------|
| 8-bit | −128 … +127 | audio nümunələri, sensor oxumaları, `int8_t` |
| 16-bit | −32,768 … +32,767 | **Ariane 5-in ölümcül qutusu**; audio CD-lər; köhnə oyun koordinatları |
| 32-bit | −2,147,483,648 … +2,147,483,647 | C/Java-da `int`; Gangnam Style tavanı; Y2038 saatı |
| 64-bit | ≈ ±9.2 × 10¹⁸ | `long`, `BIGINT`, müasir zaman damğaları |

Hər sıranın mənfi tərəfindəki bir əlavə üzvə diqqət edin. O tənha əlavə dəyər — `−128`, `−32,768`, `−2,147,483,648` — həqiqətən qəribə bir bug-ın mənbəyidir. Reseptlə −128-i mənfiləşdirməyə çalışın:

```
 −128       = 10000000
 çevir      = 01111111
 1 əlavə et = 10000000      ← yenə −128!
```

+128 işarəli byte-da mövcud deyil (tavan +127-dir), buna görə resept dolanır və əkslədiyiniz ədədi geri qaytarır. **Minimum dəyəri mənfiləşdirmək minimum dəyəri qaytarır** — bu isə mütləq dəyər funksiyasının, hər şeydən çox, mənfi bir ədəd qaytara biləcəyi deməkdir. Java-da `Math.abs(Integer.MIN_VALUE)` həqiqətən −2,147,483,648 qaytarır: `abs()`-in yalan söylədiyi bir giriş. Eyni dolanmanı JavaScript-in ədədi həqiqi işarəli byte-a məcbur edən typed array ilə brauzer konsolunda seyrə sala bilərsiniz:

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

**İşarəli overflow sadəcə dolanmır — işarəni çevirir.**

Ötən dərsin işarəsiz sayğacı ən azından *kiçik* uğursuzluq verdi: 255 + 1 sıfırdan yenidən başladı. İşarəli şkala *şiddətlə* uğursuz olur, çünki tikişi iki ən uzaq dəyər arasında oturur: `+127 + 1 = −128`. İki müsbət ədəd əlavə edin, böyük mənfi biri alın. Bank balansı tavanı keçib borc olur; oyun hesabı ən pis hesab olur; sağa doğru sürət sola doğru sürətə çevrilir.

C və C++-da isə sadəcə yanlışdan betərdir — işarəli overflow rəsmi olaraq **undefined behavior**-dır: kompilyator onun heç vaxt baş vermədiyini fərz etmə lisenziyasına malikdir və onu güvənlik yoxlamalarınızı *mövcudluqdan silə* bilər. `if (x + 1 < x)` ağıllı overflow testi kimi görünür; müasir kompilyator işarəli `x` üçün şərt "mümkünsüz" əsaslandırmasıyla onu tamamilə silə bilər. Əməliyyatdan *əvvəl* yoxlayın (`x > INT_MAX − y`), ya da kompilyatorun yoxlanmış-arifmetik daxili funksiyalarından istifadə edin — əməliyyatdan sonra heç vaxt yoxlamayın.

</Pitfall>

## İyirmi il gizlənən bug {/*the-bug-that-hid-for-twenty-years*/}

İşarə çevrilmə overflow yalnız raketlər üçün ekzotik uğursuzluq deyil. 2006-cı ildə Joshua Bloch — Java-nın əsas kitabxanasının böyük hissəsini yazan mühəndis — *"Demək olar ki, bütün Binary Search-lər və Mergesort-lar sınıqdır"* adlı bir etiraf yayımladı. Günahkar onun demək olar ki, bir onillik əvvəl `java.util.Arrays`-ə qoyduğu daxil olmaqla praktiki olaraq yazılmış hər binary search-də görünən bir sətir idi:

```
mid = (low + high) / 2;
```

*Alqoritm* dərslik-düzgündür. Lakin `low + high` işarəli 32-bit toplamasıdır, milyard elementdən çox üzərindəki axtarış üçün (2³⁰) `low + high` 2,147,483,647-i keçə bilər — cəm tikişi keçir, mənfiyə çevrilir, `mid` isə mənfi indeks olur. Proqram `ArrayIndexOutOfBoundsException` ilə çöküşə uğrayır... amma 1997-ci ildə heç kim test etməyəcək qədər böyük girişlər üzərindəki testlər.

Bug JDK-da təxminən doqquz il oturdu. Bloch-un daha sert nöqtəsi belə idi: demək olar ki, eyni sətir Jon Bentley-nin klassik *Programming Pearls*-ında (1986) görünür — alqoritmi rəsmi olaraq *sübut edən* bir kitab — beləliklə bug "sübut edilmiş" kodda təxminən iyirmi il gizləndi. Sübut ideal tam ədədlər haqqında idi; çöküş 32-bit olanlar haqqında. Düzgün alqoritm, sınıq tətbiq.

Düzəltmələr əzbər olmağa dəyər, çünki bir gün özünüz bu sətiri yazacaqsınız:

```
mid = low + (high − low) / 2;     // fərq overflow edə bilməz
mid = (low + high) >>> 1;         // Java: işarəsiz sürüşdürmə — bölünmə
                                  // işarə kontraktını ignore edir
```

Ötən dərsin əxlaqını xatırlayın: *məhdudiyyətlər dizayn zamanı uçatılmaz görünür, lakin sistemlər dizaynerlərin fərziyyələrindən uzun ömür sürürlər.* 1986-cı ildə milyard elementli array elmi fantastika idi. 2006-cı ildə isə sıradan bir çərşənbə idi.

<DeepDive>

#### Sign-magnitude-in yaşayacaq yer tapması {/*where-sign-magnitude-went-to-live*/}

Sign-magnitude tam ədəd müharibəsini uduzdu, amma ölmədi — çox rahat bir mülkiyyətə çəkildi. **IEEE 754 floating-point ədədlər** — hər dildəki `float` və `double`, növbəti dərsin mövzusu — dəyərlərini işarə biti üstə miqdar kimi saxlayır. Bu dərsin 1-ci cəhdi kodunuzun toxunduğu hər `0.5` və `3.14`-ün içərisindədir.

Köhnə bagajını da özüylə gətirdi: floating-point həqiqətən **iki sıfır** var. `+0.0` və `−0.0` hər IEEE maşınında fərqli bit nümunələridir. Komitə çirkinliyin üzərini örtdü — `==` operatoru onları bərabər saymağa məcburdur — amma sıxışdırsanız tikişlər görünür:

```
 0.0 === -0.0        →  true      (müqavilə)
 Object.is(0, -0)    →  false     (bitlər)
 1 / -0.0            →  -Infinity (açıqlama)
```

Two's complement-ə uduzduqdan əlli il sonra cüt sıfır problemi Yer üzündəki hər prosessorda canlıdır — sadəcə bir mərtəbə yuxarıda.

</DeepDive>

## İşarəni özünüz sındırın {/*break-the-sign-yourself*/}

Budur Dərs 1-dəki keçid paneli, yeniləndilər: eyni səkkiz açar, lakin indi *hər iki kontrakt* byte-ı eyni anda oxuyur. MSB — −128 çəkisinə malik açar — qırmızı kənar daşıyır. Açarları çevirin və seyrdin: MSB qaranlıq qaldıqca hər iki oxuma tamamilə razılaşır. Onu yandırın, eyni bitlər iki fərqli ədədə, 256 fərqli olaraq bölünür. `11111011` (−5) qurmağa, sonra `10000000` (tənha −128) qurmağa, sonra `01111111` (+127)-dən başlayıb əllə "bir əlavə etməyə" çalışın:

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
        One byte, two contracts. The red-bordered switch is the MSB:
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
          ? 'MSB lit: the same bits now mean two numbers, 256 apart.'
          : 'MSB dark: both contracts agree.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Tam olaraq 256-lıq o fərq — bütün dərsin bir ədəddə ifadəsidir: MSB yananda işarəli oxu `unsigned − 256`-dır — odometer "sıfırın just aşağısı" kimi yox, "üstündə" olaraq yozulur.

<Recap>

- Hardware-da **minus işarəsi yoxdur** — mənfi ədədlər adi bitlər üzərindəki bir *kontrakt*dır, yaxşı kontrakt isə sadə toplayıcının işləməsini qoruyur.
- **Sign-magnitude** (işarə bayrağı + miqdar) və **one's complement** (bütün bitləri çevir) eyni iki şəkildə uğursuz olurlar: **cüt sıfırlar** və xüsusi hardware tələb edən arifmetika.
- **Two's complement** geri işlədilən odometerdır: şkalanın yuxarı yarısı −128…−1 olaraq yenidən bölgülənir, belə ki `11111111` −1-dir, dolanma isə *mənfi işarəsidir*. Bir sıfır, sadə toplayıcı işarəli *və* işarəsiz cəm *və* çıxmanı idarə edir.
- Mənfiləşdirmək üçün: **hər biti çevir, 1 əlavə et.** Çıxma sadəcə mənfiləşdirməyin toplamasıdır — prosessorunuz çıxarıcı ehtiva etmir.
- Ən dərin görünüş: MSB-in **ağırlığı −128-dir** (ya da −2ⁿ⁻¹). Bu tək fakt işarə bitini, bir sıfırı, asimmetrik −128…+127 aralığını izah edir.
- Asimmetriya **−128-i müsbət əksi olmayan** tək olaraq buraxır, buna görə INT_MIN-i mənfiləşdirmək INT_MIN-i qaytarır — `abs()`-in mənfi ədəd qaytardığı bir giriş.
- **İşarəli overflow işarəni çevirir**: `+127 + 1 = −128`, iki müsbət mənfiyə cəmlənir, C/C++-da isə undefined behavior-dır. Java-nın `binarySearch`-inin içərisində `(low + high) / 2` olaraq **~9 il** (və *Programming Pearls*-da ~20 il) gizləndi; `low + (high − low) / 2` yazın.

</Recap>

<Challenges>

#### −12-i kodlayın {/*encode-minus-12*/}

Çevir-bir-əlavə-et istifadə edərək −12-i 8-bit two's complement byte olaraq kodlayın. Sonra cavabınızı *başqa* metodla yoxlayın: byte-ı −128 çəkisiylə geri oxuyun.

<Hint>

+12-dən başlayın. 12-ni ötən dərsdə ikili olaraq yazmışdınız: 1, 2, 4, 8, 16... çəkilərindən hansı ikisi 12-yə cəmlənir?

</Hint>

<Solution>

```
 +12        = 00001100      (8 + 4)
 çevir      = 11110011
 1 əlavə et = 11110100      ← −12
```

Çəkilərylə yoxla, MSB = −128:

```
  1     1     1     1    0    1    0    0
−128   64    32    16    8    4    2    1

−128 + 64 + 32 + 16 + 4 = −128 + 116 = −12 ✓
```

İki müstəqil metod, bir cavab — çapraz-yoxlama vərdişi real işdə sürüşmüş bir biti belə tutacaqdır.

</Solution>

#### Bir byte, iki oxuma {/*one-byte-two-readings*/}

Yaddaş dökümü `11101100` byte-ını göstərir. İşarəsiz nədir? İşarəli nədir? Hər ikisini cavablayın, sonra iki cavabınızı birləşdirən qısayolu tapın.

<Solution>

İşarəsiz, çəkiləri əlavə edin: 128 + 64 + 32 + 8 + 4 = **236**.

İşarəli, MSB −128 çəkisi: −128 + 64 + 32 + 8 + 4 = −128 + 108 = **−20**.

Qısayol: MSB yananda, **işarəli = işarəsiz − 256**. Yoxla: 236 − 256 = −20 ✓. Bu, bir formulda şkaladır — eyni mövqe "236 addım yuxarı" ya da "dolanmanın 20 addım aşağısı" olaraq oxunur. Bu, Sandpack oyununun istifadə etdiyi tam sətirdir.

</Solution>

#### Yalan söyləyən mütləq dəyər {/*the-absolute-value-that-lies*/}

Bir komanda yoldaşı iddia edir: "`abs(x)` həmişə ≥ 0-dır — bu onun bütün işidir." 8-bit byte istifadə edərək onları yanış sübut edin: çevir-bir-əlavə-etin −128 üçün əslində nə istehsal etdiyini göstərin, niyə düzgün cavabın mövcud olmadığını izah edin.

<Solution>

```
 −128       = 10000000
 çevir      = 01111111
 1 əlavə et = 10000000      ← −128, dəyişmədi
```

Resept öz girişini qaytarır. Və *uğursuz olmaq* məcburiyyətindəydi: düzgün cavab, +128, işarəli byte-da mövcud deyil — müsbət tərəf +127-də bitir, çünki "nəzərən" +128 olmalı olan `10000000` nümunəsi artıq −128 olmaqla məşğuldur. Aralıq asimmetrikdir (bir sıfır + 127 müsbət + 128 mənfi = 256 hal), buna görə minimum dəyərin müsbət əksi yoxdur.

Bu hər enə miqyaslayır: Java-da `Math.abs(Integer.MIN_VALUE)` −2,147,483,648 qaytarır. `abs()` hesablayan, sonra nəticənin mənfi olmadığını *fərz edən* hər kod — massiv indeksi, məsafə, kova nömrəsi olaraq — onu sındıran 4,3 milyard dəfədən birini var. Müdafiəçi düzəliş: mütləq dəyər almadan əvvəl INT_MIN-i rədd edin ya da genişləndirin.

</Solution>

#### Çılğınlaşan sensor {/*the-sensor-that-went-mad*/}

Transfer tapşırığı. Firmware komanda yoldaşı sizi bu vəziyyəti review etmənizi xahiş edir: mühərrik sensoru temperaturu **8-bit işarəli** dəyər olaraq bildirir (aralıq −128…+127 °C, "kifayət qədər çox — mühərrik 110 °C-ni heç vaxt keçmir"). Kalibrasiya yeniləməsi hər oxumaya saxlanmadan əvvəl sabit **+30** offset əlavə edir. İsti test zamanı xam sensor 100 °C oxuyur. Firmwarenin etdiyi arifmetikanı izah edin, hansı dəyərin saxlanıldığını göstərin, iki cümləlik review şərhini yazın — bu uğursuzluq rejiminin niyə çöküşdən *daha* təhlükəli olduğunu da daxil edin.

<Solution>

Firmware 100 + 30 = 130 hesablayır — lakin 130 işarəli byte-a sığmır (tavan +127). Bit səviyyəsində:

```
   01100100      100
 + 00011110       30
 ----------
   10000010      MSB yanır → işarəli oxu: −128 + 2 = −126
```

Saxlanan temperatur **−126 °C**-dir. Cəm +127-dəki tikişi keçdi və mənfi tərəfdə dərin yerə düşdü.

Review şərhi: *"Kalibrasiya +30 oxumaları +127-nin üzərinə çıxara bilər (xam ≥ 98 °C artıq overflow edir), saxlanan dəyər isə gizlicə böyük mənfi temperatur olur — qızan mühərrik qeyri-mümkün soyuq olaraq oxunacaq, buna görə hər 'çox isti' siqnalı heç vaxt işə düşməyəcək. Lütfən saxlanan tipi 16-bit-ə genişləndirin (ya da əlavəmədən əvvəl kəsin) və xam = 98–127-də test əlavə edin."*

Niyə çöküşdən betərdir: çöküş ucadır — watchdog-lar yenidən başladır, loglar doldurur, insanlar çağırılır. Burada isə sistem **gizlicə yanlış verilənlər üzərindəki** arxayınlıqla işləməyə davam edir, güvənlik məntiqı isə "−126°" oxuyur "qəti olaraq qızışmır" olaraq. Ariane 5-in dizaynerləri, qeyd edək ki, əks mübadiləni seçdilər — çevirmə zibillik saxlamaq əvəzinə istisna qaldırdı — o çöküş *də* fəlakətli idi. Həqiqi dərs bir səviyyə yuxarıda oturur: aralıqlarınızı *dizayn zamanı* bilin, çünki tikişi keçdikdə, hər iki uğursuzluq rejimi pisdir. ✓ (98 + 30 = 128 → `10000000` = −128, pis gedən ilk xam dəyər.)

</Solution>

</Challenges>

<LearnMore title="Floating Point: Niyə 0.1 + 0.2 0.3 Deyil" path="/learn/faza-0/modul-0-1/floating-point">

Tam ədədlər indi sizindir, müsbət və mənfi. Lakin dünya 3.14, 0.001, və 6.02 × 10²³ üzərindədir də — və *bunları* saxlayan kontrakt bu dərsdəki hər şeydən qəribədir: işarə bitini diriltir, qəsdən iki sıfır saxlayır, 0.1-i heç dəqiq yaza bilmir. 1991-ci ildə həmin son fakt — hər tikin başına 0.000000095 saniyəlik yuvarlama xətası — bir Patriot raket batareyasının nişanını korladı və 28 əsgərin həyatına başa gəldi.

</LearnMore>
