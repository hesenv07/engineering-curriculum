---
title: "Floating Point: Niyə 0.1 + 0.2 0.3 Deyil"
---

<Intro>

25 fevral 1991-ci il gecəsi, Körfəz müharibəsi zamanı, İraq Scud raketi Səudiyyə Ərəbistanının Dəhran şəhərindəki ABŞ Ordusu kazarmasına düşdü, 28 hərbçini öldürdü, 100-ə qədərini yaraladı. Bu cür hücumların qarşısını almaq üçün tam orada bir Patriot raket batareyası yerləşdirilmişdi — lakin o heç vaxt atəş açmadı. Rəsmi araşdırma nə sıradan çıxmış atıcı, nə də radar kor nöqtəsi tapdı. Batareya sadəcə fasiləsiz olaraq təxminən 100 saat işləmişdi, daxili saatı saniyənin onda biri ilə vaxtı sayırdı... **0.1** ədədinin 24-bit approximasiyasından istifadə edərək — bu dərsin ilk dəqiqələrindəki sübut edəcəyiniz kimi, *ikili sistemdə ümumiyyətlə yazıla bilməyən* bir ədəd. Hər tikin 0.000000095-lik kiçik xətası sakitcə toplanmış, 0.34 saniyə yanlış bir saat yaratmışdı; Mach 5 sürətdə isə 0.34 saniyə tutma ilə dəfn arasındakı fərqdir. Ötən dərs bir vəd ilə bitdi: kəsirli ədədlər üçün kontrakt işarə bitini diriltir, *qəsdən* iki sıfır saxlayır, 0.1-i heç dəqiq yazıla bilmir. Bu kontraktı açmağa vaxt gəldi — bu modulun ən qəribə və ən böyük nəticəli kontraktı.

</Intro>

<YouWillLearn>

- İkilinin nöqtədən *sonra* rəqəmləri necə idarə etdiyi — və 0.1-i yazıla bilməz edən sadə bölünəbilirlik qaydası
- **Fixed point**: açıq dizayn, Patriot-un niyə onu istifadə etdiyi, və onun qurduğu aralıq-dəqiqlik tələsi
- **Floating point**: ikili elmi notasiya — sign, exponent, mantissa — və IEEE 754-ü əllə necə kodlamaq/deşifrə etmək
- `0.1 + 0.2 === 0.3 → false`-nin tam autopsiyası, rəqəm-rəqəm
- Rezin xətkeş: ədədlər arasındakı boşluqların niyə *böyüdüyü*, 2⁵³-ün niyə JavaScript-in uçurum kənarı olduğu, Twitter-in bununla nə etdiyi
- Kontraktın kənarları — `Infinity`, `NaN`, `−0` — və iki dəmir qayda: floatları heç vaxt `===` ilə müqayisə etməyin, pulu heç vaxt float-da saxlamayın

</YouWillLearn>

## Nöqtədən sonra ikili {/*binary-after-the-point*/}

İndiyə qədər hər şey — açarlar, çəkilər, odometerlər, two's complement — tam ədədlər dünyasında yaşadı. Lakin mövqe notasiyasının həmişə ikinci yarısı olub. Onluqda nöqtənin *solundakı* rəqəmlər 1, 10, 100... çəkir; nöqtənin *sağındakı* rəqəmlər 1/10, 1/100, 1/1000 çəkir — eyni güc seriyası, mənfi istiqamətdə nöqtəni keçərək davam edir:

```
3.25 = 3×10⁰ + 2×10⁻¹ + 5×10⁻²
     = 3     + 0.2    + 0.05
```

İkili tam eyni şəkildə nöqtəni keçir — bu hələ ötən dərsin çəkilər-əlavə-et bacarığıdır, sadəcə əzbər yeni çəkilər ilə: **1/2, 1/4, 1/8, 1/16...**

```
Çəkilər:   ...  4    2    1  .  1/2   1/4   1/8   1/16 ...

0.101₂  =  1×(1/2) + 0×(1/4) + 1×(1/8)
        =  0.5 + 0.125
        =  0.625 ✓

101.11₂ =  4 + 1 + 1/2 + 1/4  =  5.75 ✓
```

Yeni heç nə icad edilmədi. Odometerin çarxları sadəcə nöqtənin sağına davam edir, hər biri sol qonşusunun yarısını çəkir. Onluq kəsri ikili olaraq *yazmaq* üçün ötən dərsin mühəndis metodunu güzgüdə əks etdirən mexaniki resept var: **kəsr hissəni ikiləşdirməyə davam edin; hər 1-i keçəndə 1 yazın və çıxın; əks halda 0 yazın.**

```
0.625 × 2 = 1.25   → 1, 0.25 saxla
0.25  × 2 = 0.5    → 0, 0.5 saxla
0.5   × 2 = 1.0    → 1, 0.0 saxla   ← bitdi, qalıq boş

0.625 = 0.101₂ ✓
```

Təmiz, sonlu, məmnun edici. İndi eyni resepti proqramlaşdırmada ən məsum ədədə tətbiq edin.

## Niyə 0.1 yazıla bilmir {/*why-zero-point-one-cannot-be-written*/}

**0.1** üzərində ikiləşdirmə reseptini işlədin:

```
0.1 × 2 = 0.2   → 0
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, 0.6 saxla
0.6 × 2 = 1.2   → 1, 0.2 saxla   ← yenə 0.2 — burada olmuşduq!
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, 0.6 saxla
0.6 × 2 = 1.2   → 1, 0.2 saxla   ← yenə, sonsuz
```

0.2 qalığı geri qayıdır, rəqəmlər təkrarlanır, genişlənmə heç vaxt bitmir:

```
0.1 = 0.0001100110011001100110011...₂
            └──┘└──┘└──┘└──┘
             0011 sonsuzluğa qədər təkrarlayır
```

İkilidə ondalıq 1/10 **sonsuz təkrarlayan kəsrdir** — onluqda 1/3 = 0.3333... ilə tamamilə eyni fenomen. Bunun nə zaman baş verdiyini idarə edən aydın bir qayda var. Kəsr verilən bazada yalnız məxrəcinin bütün asal çarpanları bazanı bölürsə sonlanır. Baza 10 = 2 × 5, buna görə 2-lərdən və 5-lərdən qurulan məxrəclər sonlanır (1/2, 1/5, 1/20 = 0.05), qalanı isə təkrarlanır (1/3, 1/7). Baza 2-nin tam *bir* asal çarpanı var: 2. Beləliklə ikili sistemdə, **yalnız iki dərəcəsi olan məxrəclər sonlanır** — 1/2, 1/4, 1/8, 3/16... Qalanı sonsuz təkrarlanır, 1/10 = 1/(2 × 5) isə qalandandır: 5-in amilı onu korladır.

Bir anlığa nəticə ilə oturun, çünki bu həqiqətən qəribədir: onluq-düşüncəli insanların *ən sadə mümkün kəsr* saydığı ədəd — bir dəfə, bir metrin onda biri, saniyənin onda biri saatın bir tiki — ikili maşınların **nə qədər bit versəniz verin heç vaxt tam saxlaya bilməyəcəyi** ədəddir. 24 bit, 53 bit, bir milyon bit: sonsuz quyruğu bir yerdə kəsirsiniz, kiçik bir xəta saxlayırsınız. Bu dərsin qalanı hər şeyi kompüterlərin bu xətanı necə idarə etdiyi — və etmədikləri günlərdə nə baş verdiyidir.

## Cəhd 1: nöqtəni yerə mıxlayın {/*attempt-1-fixed-point*/}

Floating point-dən əvvəl, öz instinktlərinizin güman etdiyi dizaynla tanış olun — və o gecə Patriot-un içindəki ilə. Sabit say bit götürün, sadəcə kontrakt ilə nöqtənin harada olduğunu *elan edin*. Məsələn, 8 bit, nöqtə ortada qaynaqlanmış: dörd tam hissə biti, dörd kəsr biti:

```
Çəkilər:   8  4  2  1  .  1/2  1/4  1/8  1/16

0110.1010  =  4 + 2 + 1/2 + 1/8  =  6.625
```

Buna **fixed point** deyilir, həqiqi üstünlükləri var: bu sadəcə gözlük taxmış tam ədəddir (bitlər `01101010` sadə 106 tam ədədidir, kontrakt isə "gördüyünüzü 16-ya bölün" deyir), buna görə ötən dərsin bütün tam ədəd arifmetikası — sadə toplayıcı, two's complement mənfilər — dəyişmədən işləyir. Fixed point audio DSP çiplərinda, embedded controllerlarda, maliyyə sistemlərında bu gün hələ yaşayır.

Amma qaynaqlanmış nöqtənin nəyə başa gəldiyinə baxın. Dörd tam bit ilə ən böyük dəyər 15.9375-dir — *on altı* qutudan daşır. Dörd kəsr biti ilə ən incə addım 1/16 = 0.0625-dir — daha kiçik hər şey sıfıra yuvarlayır. 32 bite genişləndirin, divarlar hərəkət edir, amma cəzaevi *forması* dəyişmir: aralığa nə qazandırsanız, dəqiqlikdən alırsınız, və əksi, çünki nöqtə hərəkət edə bilmir. Eyni proqramda həm planetin orbitinə (10¹¹ metr), həm də atomun radiusuna (10⁻¹⁰ metr) ehtiyacı olan fizika mühərriki sadəcə şansızdır — nöqtənin heç bir sabit yerləşdirməsi 21 böyüklük sırası örtmür.

Alimlər kompüterlərdən əsrlər əvvəl bu divara çatdı, düzəlişləri isə hər laboratoriya ağ lövhəsindədir: 602,214,076,000,000,000,000,000 yazmayın — **6.022 × 10²³** yazın. Bir ovuc *əhəmiyyətli rəqəm* saxlayın, nöqtənin harada getdiyini isə ayrıca. Nöqtə artıq qaynaqlanmayıb. O **üzür**.

<DiagramGroup>

<Diagram name="floating-point/fixed_point_window" height={320} width={340} alt="A row of 8 decimal digit cells with a large point welded between cell 4 and cell 5, showing 0 0 1 2 . 3 4 0 0. The leading zeros and trailing zeros are dimmed and labeled 'wasted cells'. Below, two failure lines in red: 4,096,000 marked 'too big — does not fit', and 0.0000012 marked 'too small — rounds to 0'. Caption: fixed point — the point is part of the contract and cannot move.">

Fixed point: nöqtə kontrakta qaynaqlanıb. 12.34-ü saxlamaq hücrələrin yarısını israf edir, həm nəhənglər, həm cırtdanlar isə təmsil edilə bilməz.

</Diagram>

<Diagram name="floating-point/floating_point_window" height={320} width={340} alt="The same row of 8 digit cells, now all highlighted in blue and holding 1 2 3 4 0 0 0 0 with no fixed point, plus a small attached dial box reading 'times ten to the n' with an arrow labeled 'the point slides'. Below, two success lines in blue: 4,096,000 equals 4.0960000 times 10 to the 6, and 0.0000012 equals 1.2000000 times 10 to the minus 6, both with check marks. Caption: floating point — same 8 cells, every one significant, the exponent aims the window.">

Floating point: eyni səkkiz hücrə, amma *hər* hücrə əhəmiyyətli rəqəm daşıyır, ayrıca exponent diski nöqtəni lazım olan yerə sürüşdürür.

</Diagram>

</DiagramGroup>

Bu dərsin qalanı üçün ağlınızda saxlayacağınız fiziki maşın budur: **8 rəqəmli ekran və kiçik exponent diski** olan cib kalkulyatoru. Ekran həmişə tam olaraq 8 əhəmiyyətli rəqəm saxlayan bir pəncərədir — daha çox heç vaxt. Disk bu pəncərəni qalaktika miqyasına ya da atom miqyasına yönəldə bilər. Pəncərəni *istənilən yerə* yönəldə bilərsiniz; heç vaxt edə bilmədiyiniz şey isə doqquzuncu rəqəmi ona sıxdırmaqdır. Floating point bitlərdən qurulan həmin kalkulyatordur.

## IEEE 754 kontraktı: bir bit, iki sahə {/*the-ieee-754-contract*/}

İkili elmi notasiya hər ədədi bu formaya normallaşdırır:

```
(−1)^sign  ×  1.fffff...₂  ×  2^exponent
```

— nöqtədən əvvəl bir sıfır olmayan rəqəm (ikili sistemdə tək sıfır olmayan rəqəm *1-dir*), sonra əhəmiyyətli rəqəmlər, iki dərəcəsinin qüvvətiylə hasildir. IEEE 754 standartı (1985) üç maddəni sabit sahələrə sıxışdırır. 32-bit **float** üçün:

<Diagram name="floating-point/float32_anatomy" height={340} width={720} alt="A 32-bit layout split into three labeled fields: a single blue box labeled 'sign, 1 bit' holding 0; eight boxes labeled 'exponent, 8 bits, stored with bias +127' holding 01111100; and one long rounded rectangle labeled 'fraction (mantissa), 23 bits, the implicit 1. is not stored' holding 01000000000000000000000. Below, the decoding of the example is written out: sign 0 means positive; exponent bits 01111100 equal 124, minus bias 127 gives 2 to the minus 3; mantissa gives 1.01 in binary; the assembled value line reads plus 1.01 base 2 times 2 to the minus 3 equals 0.00101 base 2 equals 0.15625.">

32-bit float-ın üç sahəsi, 0.15625 ədədini deşifrə edir. 64-bit double eyni anatomiya, yenilənmiş: 1 sign, 11 exponent, 52 mantissa biti.

</Diagram>

- **Sign — 1 bit.** 0 müsbət, 1 mənfi. Bəli: bu **sign-magnitude**-dur, ötən dərsdən Cəhd 1, vəd edildiyi kimi sürgündən qayıdır — cüt-sıfır bagajını da özüylə gətirir (sonda görəcəyik).
- **Exponent — 8 bit, bias ilə saxlanılır.** Exponent mənfiyə getməlidir (kiçik ədədlər 2⁻³, 2⁻¹²⁶... tələb edir), lakin two's complement əvəzinə IEEE 754 `real exponent + 127` saxlayır. Beləliklə 2⁻³ 124 olaraq, 2⁵ isə 132 olaraq saxlanılır. Niyə two's complement əvəzinə **bias**? Bu surunun aşağıdakı DeepDive-da gözəl cavabı var.
- **Mantissa (fraction) — 23 bit.** Nöqtədən sonra əhəmiyyətli rəqəmlər. Buraya standartın ən hiyləgər hiylə gizlənib: normallaşdırılmış ikili onda nöqtədən əvvəlki rəqəm *həmişə* 1-dir — bəs onu saxlamaq üçün bir bit xərcləmək niyə lazımdır? IEEE 754 xərcləmir. Aparıcı `1.` bir **implicit bit**-dir, kontrakt tərəfindən fərz edilir, heç vaxt yazılmır. 23 bit dəqiqlik üçün pul ödəyirsiniz, 24 alırsınız. Ötən dərsdə bir tam dizayn (sign-magnitude) israfçı nümunə üzündən öldü; bu standart bir biti heçdən geri qapar.

**İşlənmiş nümunə — 0.15625-i kodlayın (diaqramdakı ədəd):**

```
1. İkiliyə:      0.15625 = 5/32 = 0.00101₂
2. Normallaşdır: 0.00101 = 1.01 × 2⁻³
3. Sign:         müsbət → 0
4. Exponent:     −3 + 127 = 124 → 01111100
5. Mantissa:     "1."-dən sonrakı rəqəmlər → 01, dolduruldu → 01000000000000000000000

0 01111100 01000000000000000000000 ✓
```

**İşlənmiş nümunə — 5.75-i kodlayın:**

```
1. İkiliyə:      5.75 = 101.11₂          (4 + 1 + 1/2 + 1/4)
2. Normallaşdır: 101.11 = 1.0111 × 2²
3. Sign:         0
4. Exponent:     2 + 127 = 129 → 10000001
5. Mantissa:     0111 dolduruldu → 01110000000000000000000

0 10000001 01110000000000000000000

Geri deşifrə: 1.0111₂ × 2² = 101.11₂ = 5.75 ✓
```

Hər iki ədəd *tam olaraq* kodlanmışdır — çünki hər ikisi iki dərəcəsinin cəmlərdir. 0.1-ə belə mərhəmət yoxdur: sonsuz `0011` quyruğu mantissanın kənarında kəsilir, saxlanan son bit yuvarlanır. Saxlanan 0.1 deyil. O 0.1-in **ən yaxın təmsil edilə bilən qonşusudur** — həqiqətən fərqli bir ədəd, 0.1-in paltarını geyin.

<DeepDive>

#### Standartdan əvvəlki müharibə {/*the-war-before-the-standard*/}

IEEE 754-ün həmişə orada olduğunu, cazibə qüvvəsi kimi, fərz etmək asandır. Olmamışdır — öncəsi isə xaos idi. 1960-70-ci illərdə *hər istehsalçı öz floating point-ini icad edirdi*: IBM mainframe-ləri baza-16 float-lar istifadə edirdi (ədədin böyüklüyündən asılı olaraq gizlicə 3-ə qədər dəqiqlik biti itirirdi), Cray supercompüterlərin *müqayisə* zamanı overflow edə bilən formatları var idi, DEC, Burroughs, qalanları isə hərəsi başqa bir şey etdirdi. Eyni Fortran proqramı fərqli maşınlarda fərqli cavablar verirdi, rəqəmsal analistlər isə hansı kompüterə hansı düsturlarla etibar edilə biləcəyinin ağlı xəritələrini saxlayırdılar.

Dönüş nöqtəsi gözlənilməz istiqamətdən gəldi: bir *mikroprosequentin* şirkəti. 1976-cı ildə Intel gələcək 8087 riyaziyyat köməkçi prosessoru silisiumda ən yaxşı arifmetikaya sahib olmalıdır qərarına gəldi, floating-point dizaynların hesablamaları necə şikəst etdiyini kataloqlayan karyerasını keçirmiş Berkeley professoru **William Kahan**-ı işə götürdü. Kahan-ın komandasının Intel üçün yazdığı layihə IEEE komitəsinin işinin toxumuna çevrildi, 1985-ci ildə isə IEEE 754 kimi təsdiq edildi. 8087 1980-ci ildə, standart hələ yekunda çatmadan *əvvəl* göndərildi — hələ mövcud olmayan bir qanunu tətbiq edən silisium. On il içində hər ciddi CPU onu mənimsədi, "eyni proqram, fərqli cavablar" dövrü sona çatdı, Kahan isə 1989 Turing Mükafatını aldı — kompüterin Nobel-i — əsasən bu bir standart üçün. JavaScript-iniz `0.30000000000000004` çap edəndə, onu telefon, noutbuk, supercompüter üzərindəkilərlə *eyni şəkildə* çap edir. O cansıxıcı ardıcıllıq vaxtilə qeyri-mümkün xəyal idi.

</DeepDive>

## Məşhur cəmin autopsiyası {/*the-autopsy-of-a-famous-sum*/}

Proqramlaşdırmanın ən məşhur sətirini analiz etmək üçün lazım hər alətə sahibsiniz:

```js
0.1 + 0.2
```

<ConsoleBlock level="info">

0.30000000000000004

</ConsoleBlock>

JavaScript ədədləri 64-bit double-dır — 52 mantissa biti, implicit bir ilə birlikdə 53. Addım-addım nə baş verdiyini seyrdin:

**Addım 1 — `0.1`-i saxlamaq.** Sonsuz `0.000110011...` quyruğu kəsilir, 53 əhəmiyyətli bitə yuvarlanır. Saxlanan dəyər ən yaxın double-dır:

```
saxlanan "0.1"  =  0.1000000000000000055511151231257827...
                    └── ~5.55 × 10⁻¹⁸ artıq keçir
```

**Addım 2 — `0.2`-i saxlamaq.** Eyni quyruq (0.2 sadəcə 0.1-in nümunəsi bir mövqe sürüşdürülüb), eyni əməliyyat:

```
saxlanan "0.2"  =  0.2000000000000000111022302462515654...
                    └── ~1.11 × 10⁻¹⁷ artıq keçir
```

**Addım 3 — toplamaq.** Hardware iki saxlanmış dəyəri mükəmməl toplayır, sonra nəticəni yenidən ən yaxın double-a *yuvarlayır*:

```
iki saxlanmış dəyərin həqiqi cəmi ≈ 0.3000000000000000166...
ən yaxın double                    = 0.3000000000000000444089209850062616...
```

**Addım 4 — `0.3` ilə müqayisə.** Lakin mənbə kodunuzdakı `0.3` literalı öz *birinci Addımından* keçdi, ən yaxın double-ı isə *digər* tərəfdə oturur:

```
saxlanan "0.3"  =  0.2999999999999999888977697537484345...

0.30000000000000004440...  ===  0.29999999999999998889...   →  false
```

Üç ayrı yuvarlama — iki saxlamada, birisi toplamanın ardından — toplanmış toz `0.3`-ün düşdüyü yerdən bir təmsil edilə bilən ədəd uzaqda yerləşir. Heç kim nasaz işləmədi. Toplayıcı mükəmməl idi. **Hər addımda hər dəyər qanuni olaraq ən yaxın mümkün ədəd idi** — cavab hələ "yanlışdır", çünki sual ("mənə tam ondalıqlar ver") ikili sistemdə ümumiyyətlə soruşula bilməzdi. `0.30000000000000004.com` adlı vebsayt var, düşündüyünüz tam olaraq odur.

Maskanın düşməsini tələb edə bilərsiniz — JavaScript-dən adətən göstərdiyindən daha çox rəqəm istəyin:

```js
(0.1).toFixed(20)
```

<ConsoleBlock level="info">

'0.10000000000000000555'

</ConsoleBlock>

Standart ekran ~15–17 rəqəmə yuvarlayır, bu isə adətən xətanı yenidən gizlədir, "0.1" yazan təmiz görünür — yalan bəzəkdir, çap zamanı tətbiq edilir. `0.1 + 0.2` yalnız buna görə məşhurdur: tozu kosmetik yuvarlamadan sağ çıxır, ekranınıza çatır.

<Note>

1 ilə növbəti təmsil edilə bilən double arasındakı boşluq — 2⁻⁵² ≈ 2.22 × 10⁻¹⁶ — **machine epsilon** adlanır, əksər dillərdə adlandırılmış sabitdir: JavaScript-də `Number.EPSILON`, C-də `DBL_EPSILON`. Onu 1.0 yaxınlığında ədəd xəttinin dən boyutu kimi düşünün: bundan kiçik xətalar sözün əsl mənasında təmsil edilə bilməz, düzgün float müqayisələr (Pitfall-da gəlir) ondan qurulur.

</Note>

## Uzanan işarəli bir xətkeş {/*a-ruler-with-stretching-marks*/}

Cib kalkulyatoruna qayıdın: 8 əhəmiyyətli rəqəm, sürüşən pəncərə. 1 yaxınına yönəldin, yüz milyonda birləri həll edir. 400 milyona yönəldin, eyni 8 rəqəm indi ən incə addımın *onluq* olduğu deməkdir. Dəqiqlik yox olmadı — o **nisbi**dir, sabit sayda əhəmiyyətli rəqəmlər, buna görə təmsil edilə bilən ədədlər arasındakı *mütləq* boşluq böyüklüklə miqyaslanır. Double işarələri uzandıqca genişlənən bir xətkeşdir:

<Diagram name="floating-point/number_line_gaps" height={330} width={720} alt="Three horizontal number-line segments stacked vertically, each with tick marks. Top row, labeled 'between 1 and 2': ticks drawn extremely dense, annotated 'gap = 2 to the minus 52 — about 4.5 quintillion steps'. Middle row, labeled 'between 2 to the 52 and 2 to the 53': ticks spaced wide apart, annotated 'gap = exactly 1 — only whole numbers survive'. Bottom row, labeled 'above 2 to the 53': ticks twice as far apart, annotated 'gap = 2 — odd numbers vanish', with one missing tick marked by a red cross labeled 9,007,199,254,740,993. The rows share a caption: same 53 significant bits everywhere — the absolute gap doubles each time the magnitude doubles.">

Bir xətkeş, üç zoom səviyyəsi. Mantissa həmişə 53 əhəmiyyətli bit saxlayır; böyüklüyün hər ikiləşməsi qonşu təmsil edilə bilən ədədlər arasındakı boşluğu ikiləşdirir.

</Diagram>

Orta və alt sıralarını narahedici nəticəyə qədər izləyin. 2⁵² ilə 2⁵³ arasında, double-lar arasındakı boşluq tam olaraq 1-dir — xətkeş hələ hər tam ədəd üzərində qərar verə bilir, yer sıfıra bərabərdir. Bir ikiləşmə sonra boşluq 2-dir, **2⁵³-dən yuxarı tək tam ədədlər sadəcə double-da mövcud deyil**. Həmin ədəd — 2⁵³ = 9,007,199,254,740,992 — uçurum kənarıdır, *tək klassik* ədəd tipi double olan JavaScript isə son güvənli dəyərə `Number.MAX_SAFE_INTEGER` (2⁵³ − 1) adlandırır. Kənarı keçin, arifmetika gizlicə sürreal olur:

```js
2 ** 53 === 2 ** 53 + 1
```

<ConsoleBlock level="info">

true

</ConsoleBlock>

`9007199254740993`-ün öz double-ı yoxdur, buna görə cüt qonşusuna yuvarlanır, iki fərqli tam ədəd `===` bərabər olur. Heç istisna, heç xəbərdarlıq — yanlışlıq *səssizdir*, artıq bildiyiniz kimi bu təhlükəli növdür.

Bu uçurumun məşhur real dünya izəri var. Twitter-in tweet ID-ləri 64-bit tam ədədlərdir, 2010-cu ilə qədər 2⁵³-dən artdılar. API JSON-unu analiz edən hər JavaScript müştərisi fərqli tweet ID-lərinin gizlicə eyni yuvarlanan dəyərə sıxışdığını izlədi — cavablar yanlış tweetlərə yapışdırıldı, silinmələr qonşuları vurdu. Twitter-in düzəlişi bu gün API-da hələ görünür: rəqəmsal `id` ilə yanaşı, hər obyekt **`id_str`** daşıyır — JavaScript double-ının ona toxunmaması üçün tam olaraq mətn olaraq göndərilmiş eyni ID. Backend komanda yoldaşı 64-bit ID-ləri string kimi göndərəndə, bu dərsin niyəsidir; ona minnətdar olun.

Eyni uçurum 32-bit float-larda var, sadəcə çox daha yaxında: 24 əhəmiyyətli bit ilk təmsil edilə bilməyən tam ədədin sıradan **16,777,217** (2²⁴ + 1) olduğunu bildirir — bir video oyununun xal sayğacının bir günün öğlə yeməyinə çata biləcəyi ədəd. Float-ların təxminən 7 etibarlı ondalıq rəqəmi var; double-ların 15–16. Hər ikisi tükənir.

<Pitfall>

**Floatları heç vaxt `===` ilə müqayisə etməyin, pulu heç vaxt float-da saxlamayın.**

Əvvəlcə bərabərlik səhvi. Bu dərsin autopsiyasından sonra `if (total === 0.3)` olduğu kimi görünməlidir — üç müstəqil yuvarlama hadisəsinin tam eyni double üzərindəki qərarına bir bahis. Doğru addım **tolerans** ilə müqayisədir:

```
if (Math.abs(a − b) < 1e-9)          // mütləq epsilon — insan
                                      // miqyaslı dəyərlər üçün yaxşı
if (Math.abs(a − b) < Number.EPSILON  // nisbi epsilon — böyüklüklə
      * Math.max(Math.abs(a), Math.abs(b)))  // miqyaslanır
```

Pul səhvi eyni fizika, hüquqi nəticələrlə: `0.1` dollar double-da mövcud deyil, `total += 0.01` ilə sentləri toplayan ödəniş döngüsü hər iterasiyada toz istehsal edir — auditorların nəhayət tapdığı toz. Sənaye qaydası onilliklərdir: **pul ən kiçik vahidin tam ədədlərinde saxlanılır** (sent, qəpik, satoshi — 1999 sent, 19.99 dollar deyil), ötən dərsdən tam tam ədəd arifmetikasının hökm sürdüyü yerdə, ya da onluq onluq tiplərdə (`BigDecimal` Java-da, `decimal` Python-da və C#-da, `DECIMAL` SQL-də) ki baza 10-da hesablayır, sonsuz quyruqla heç vaxt görüşmür. Float-lar ölçmələr üçündür — fizika, qrafika, ML — 16-cı rəqəm hər halda səs-küydür. Pul ölçmə deyil.

</Pitfall>

Və bu kursdakı hər qaydanın üzərindəki bədən: Yanvar 1982-də **Vancouver Birja** parıltılı yeni elektron indeksini 1,000.000 nöqtədə başlatdı. Proqram hər ticarətin ardından indeksi yenidən hesablayırdı — gündə təxminən 2,800 dəfə — və hər dəfə nəticəni üç ondalığa *kəsirdi* (hətta yuvarlamamış, sadəcə doğramışdı), bir balıq qırpımı dəyərini sıyırırdı. İyirmi iki ay qırpımı sonra, Noyabr 1983-də indeks **524.811** oxudu — heç olmayan bazar çöküşünü nəzərdə tuturdu; səhmlər düz-artıydı. Məsləhətçilər indeksi bir həftəsonu düzgün yenidən hesabladılar, Bazar ertəsi isə **1,098.892**-dən yenidən açıldı. Nəhayət kimsə arifmetikanı düzgün etdiyi üçün bazar bir gecə 574 nöqtə "qazandı". Bir kəsmə görünməzdir; iki il ərzində gündə 2,800 kəsmə bütün birjanın yarısıdır. Kiçik xətalar *iterasiya etdiyinizdə* kiçik qalmır — bu cümləni saxlayın, çünki Dəhranın ehtiyacı olan son parça odur.

## Dəhran, həll edildi {/*dhahran-resolved*/}

İndi Patriot uğursuzluğunu mühəndis kimi oxuya bilərsiniz — hər tərkib hissəsi masadadır.

Patriot saatı saniyənin onda birinin *tam ədəd* sayı olaraq uptime sayırdı (tam, ötən dərsdən — tam ədədlər sürüşmür). İzləmə riyaziyyatı üçün saniyə almaq üçün bu sayı 0.1 ilə vurdu... **24-bit fixed-point registerdə** saxlanılan 0.1 ilə. `0.0001100110011001100110011...`-in 24 bitinin nə demək olduğunu bilirsiniz: quyruq kəsilir, saxlanan sabit

```
saxlanan "0.1" = 0.09999990463256836
xəta/tik       ≈ 0.000000095 s        (9.5 × 10⁻⁸ — bir mikrosaniyənin
                                       onda biri haqqında)
```

Tik başına gülünc. Lakin batareya ~100 saat işləmişdi — Ordunun doktrinası tez-tez yerdəyişmə və yenidən başlatma fərz edirdi, Dəhranın statik müdafiəsinin sakit bir şəkildə üstündən keçdiyi bir fərziyyə (*məhdudiyyətlər dizayn zamanı uçatılmaz görünür; sistemlər dizaynerlərin fərziyyələrindən uzun ömür sürürlər* — üç dərs ardıcıl):

```
100 saat = 360,000 s = 3,600,000 tik
3,600,000 × 0.000000095 ≈ 0.34 s toplanmış saat xətası
```

Scud təxminən 1,676 m/s sürətlə gəlir. Radar *həqiqətən* onu aşkarladı; proqram sonra sürüşmüş saat istifadə edərək hədəfin sonra harada olacağını proqnozlaşdırdı, təsdiq pəncərəsini — **range gate**-i — həmin nöqtəyə yönəltdi. Rəsmi GAO araşdırmasına görə, 0.34 saniyəlik xəta qapını təxminən **687 metr** sürüşdürdü. Qapı baxdı, Scud-un "olmalı olduğu" yerdə boş göy tapdı, ilkin aşkarlanmanı yalan siqnal kimi təsnif etdi, heç bir interceptor buraxılmadı. Raket baraka üzərinə maneəsiz düşdü.

Epiloq bu modulun dəfə-dəfə proqnozlaşdırdığı yollarla acıdır. İsrail batareyaları həftələr əvvəl sürüşməni fark etmiş, bildirmişdi; müvəqqəti rəhbərlik saati sıfırlamaq üçün **müntəzəm yenidən başlatma** idi — Boeing 787-nin məlhəmi, 24 il əvvəl — nə qədərinin çox uzun olduğunu göstərmədən. Sabitini düzəldən yenilənmiş proqram Dəhrana **26 Fevral**-da çatdı: bir gün gecikdi. Uğursuzluğun tam formasına diqqət edin — istisna deyil, çöküş deyil, *gizlicə yanlış verilənlər üzərindəki arxayınlıqla* işləyən bir sistem, Dərs 3-ün sensor tapşırığının çöküşdən daha çox qorxmağınızı istədiyi tam uğursuzluq rejimi. Patriot saatı yalan söylədiyini heç bilmədi.

## Kontraktın kənarları {/*the-edges-of-the-contract*/}

Tam ədəd kontraktları çirkin şəkildə yüksək səslə uğursuz olur — tikişi, işarə çevrimi. IEEE 754-ün dizaynerləri, hepsi şikəst olmuş rəqəmsal analistlər olaraq, əvəzinə formata *adlandırılmış çöküş yastıqları* tikdilər: exponent sahəsinin iki uç nümunəsi (hamısı sıfır, hamısı bir) ədədlər üçün deyil, **xüsusi dəyərlər** üçün ayrılıb.

```js
1 / 0
0 / 0
Math.sqrt(-1)
NaN === NaN
```

<ConsoleBlockMulti>

<ConsoleLogLine level="info">

Infinity

</ConsoleLogLine>

<ConsoleLogLine level="info">

NaN

</ConsoleLogLine>

<ConsoleLogLine level="info">

NaN

</ConsoleLogLine>

<ConsoleLogLine level="info">

false

</ConsoleLogLine>

</ConsoleBlockMulti>

- **±Infinity** (exponent hamısı 1, mantissa sıfır): overflow-un ya da sıfıra bölünmənin nəticəsi. Tam ədəd overflow-u dolandı və *yalan söylədi*; float overflow ən azından nə baş verdiyini qəbul edən bir dəyərə sabitlənir: hər şeydən böyük. Arifmetika sağlam davam edir — `Infinity + 1` `Infinity`-dir, `1 / Infinity` isə `0`.
- **NaN** — *Not a Number* (exponent hamısı 1, mantissa sıfırdan fərqli): cavabı olmayan suallara cavab — `0/0`, `√−1`, `Infinity − Infinity`. NaN qəsdən yoluxucudur (ona toxunan hər arifmetika NaN verir, buna görə gizlicə "real" verilənlərə yuyula bilməz) və dildə **özünə bərabər olmayan tək dəyərdir** — `NaN === NaN` standart gərəyincə `false`-dur. Bu bir bug deyil; rəsmi aşkarlama idiomunun temelidir (`x !== x` x NaN deməkdir; nəzakətlə, `Number.isNaN(x)`). İdarə panelinizde görünən NaN float-ın bug hesabatı təqdim etmək yoludur.
- **−0** (işarə biti 1, qalanı 0): sign-magnitude-un cüt sıfırı, *qəsdən* saxlanıldı — altdan keçən mənfi kəmiyyətin işarəsini qoruyur, müəyyən rəqəmsal metodların həqiqətən ehtiyacı var. Müqavilə və onu gördüyünüz tikişlər ötən dərsin DeepDive-ında artıq var idi: `0 === -0` `true`-dur, `Object.is(0, -0)` `false`-dur, `1/-0` isə `-Infinity`-dir — izahedici.
- Sıfır exponent həm sıfırın özünü, həm də **subnormal**-ları — uçurumdan düşmək əvəzinə sıfıra *tədricən* azala bilməsi üçün implicit aparıcı 1-in söndürüldüyü formatda (float üçün 2⁻¹²⁶-dan aşağı) əlavə kiçik ədədlər çatığını — barındırır. Güman yoxdur ki heç birini birbaşa idarə edəcəksiniz; mövcud olduqlarını bilin, bəzi CPU-larda onları əhatə edən riyaziyyatın dramatik şəkildə yavaş işlədiyini — klassik sirr profilleme hekayəsi.

<DeepDive>

#### Bias-ın sirri: float-lar tam ədəd kimi sıralanır {/*floats-sort-as-integers*/}

"Niyə two's complement əvəzinə bias?" borcunu ödəmə vaxtı. Müsbət float-ın üç sahəsini sıralayın — sign 0, sonra exponent, sonra mantissa — bias-ın nə etdiyini görün: *böyük exponentləri daha böyük işarəsiz bit nümunələrinə çevirdi* (2⁻³ → 124, 2⁵ → 132), ən əhəmiyyətli bitlərdə oturdu, mantissa isə altında qarar kəsici kimi. Nəticə gözəldir: **müsbət float-lar üçün 32 biti sadə işarəsiz tam ədəd kimi yenidən şərh etmək və müqayisə etmək düzgün float sırasını verir.** Böyük ədəd, böyük bit — format adi tam ədəd müqayisəçisinin, ötən dərsdən sevməyi öyrəndiyiniz ən ucuz dövrənin, float-ları *heç bir float-xüsusi hardware olmadan* düzgün sıralaması üçün düzəldildi.

Exponent two's complement istifadə etsəydi, mənfi exponentlər (2⁻³ kimi kiçik ədədlər) bit nümunəsi olaraq 1-lə başlayardı, müsbət exponentləri *üstələyərdi* — sıralama parçalanardı. Bias two's complement-in daha az zərif cousindir, burada dizayn məqsədi fərqli olduğuna görə seçildi: "toplayıcını işlət" deyil, "müqayisəçini işlət". Ötən dərsklə eyni hərəkət, fərqli pərəstiş edilən dövrə.

(Mənfi float-ların bir əlavə fırlama ehtiyacı var — onların sign-magnitude nümunələri tərsinə sıralanır, buna görə real radix-sort tətbiqləri əvvəlcə bəzi bitləri çevirir — amma prinsip dayanır, yüksək performanslı sıralama kitabxanaları bu günə qədər istifadə edir.)

</DeepDive>

## Patriot saatını yenidən yaradın {/*recreate-the-patriot-clock*/}

Aşağıdakı oyuncaq Dəhran batareyasının saatıdır, bit dəqiqliyi ilə: dəqiq tam ədəd tik sayğacı (mavi), Patriot-un istifadə etdiyi faktiki 24-bit kəsilmiş sabit `1677721/16777216` ilə çarpılır (qırmızı). Uptime-ı irəlilədən, iki sap ayrılır — sürüşmə və range-gate xətası canlı hesablanır. Cavabları tapın: İsrailin xəbər verdiyi 8 saatdan sonra saat nə qədər yanlış idi? Xəta ilk dəfə Scud-un ~17 metrlik uzunluğunu keçəndə uptime neçədir?

<Sandpack>

```js
import { useState } from 'react';

const CHOPPED = 1677721 / 16777216; // 24-bit kəsmədən sonra 0.1

export default function PatriotClock() {
  const [ticks, setTicks] = useState(0);

  const hours = ticks / 36000;
  const trueTime = ticks * 0.1;
  const clockTime = ticks * CHOPPED;
  const drift = trueTime - clockTime;
  const meters = drift * 1676;

  const row = { fontFamily: 'monospace', fontSize: 18, margin: 4 };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'system-ui' }}>
      <p>Patriot batareyası uptime: <b>{hours.toFixed(1)} saat</b></p>
      <p style={row}>həqiqi vaxt:  {trueTime.toFixed(4)} s</p>
      <p style={{ ...row, color: '#c1554d' }}>
        saat deyir: {clockTime.toFixed(4)} s
      </p>
      <p style={row}>
        sürüşmə: {drift.toFixed(4)} s ≈{' '}
        <span style={{ color: meters > 17 ? '#c1554d' : '#087ea4' }}>
          {meters.toFixed(0)} m
        </span>{' '}
        Scud sürəti ilə
      </p>
      <div>
        <button onClick={() => setTicks(ticks + 36000)}>+1 saat</button>{' '}
        <button onClick={() => setTicks(ticks + 360000)}>+10 saat</button>{' '}
        <button onClick={() => setTicks(ticks + 1800000)}>+50 saat</button>{' '}
        <button onClick={() => setTicks(0)}>yenidən başlat</button>
      </div>
      {hours >= 100 && (
        <p style={{ color: '#c1554d' }}>
          <b>Bu, Dəhran batareyasının 25 Fevral 1991-ci ildəki
          vəziyyətidir.</b> Range gate yüzlərlə metr yanlışdır —
          gələn hədəflər yalan siqnallar olaraq rədd edilir.
        </p>
      )}
      {hours > 0 && hours < 100 && (
        <p>Sürüşmə xətti böyüyür — hər tik eyni 0.000000095 s
        tozu yatırır. Yenidən başlatma düyməsi 1991 düzəlişidir.</p>
      )}
    </div>
  );
}
```

</Sandpack>

Oyuncağın formasına diqqət edin: xəta *cansıxıcıdır* — mükəmməl xətti, tamamilə proqnozlaşdırıla bilir, ilk saatdan kimsə onu çap etsəydi görünürdü. Bu toplanma buglarının imzasıdır (Patriot, Vancouver): heç tikişi, heç uçurum kənarı, sadəcə heç kim yazmadığı bir borçdan faiz birlikdə birləşir.

<Recap>

- İkili kəsrlər eyni çəkilər-əlavə-et oyunudur **1/2, 1/4, 1/8...** çəkiləri ilə. Kəsr baza 2-də yalnız məxrəci **iki dərəcəsi** isə sonlanır — buna görə 0.5 və 0.375 tam, **0.1 isə sonsuz təkrarlanır** (`0011` quyruğu) və heç vaxt tam saxlanıla bilməz.
- **Fixed point** nöqtəni yerə mıxlayır: sadə, tam ədəd dostu, lakin aralıq və dəqiqlik eyni bitlər üzərindəki müharibə aparır — Patriot-un 24-bit "0.1"-nin doğulmasına imkan verən budur.
- **Floating point** ikili elmi notasiyadır: **sign × 1.mantissa × 2^exponent**. IEEE 754 (1985, Kahan, Intel 8087) onu 1 + 8 + 23 bit (float) ya da 1 + 11 + 52 (double) olaraq, **biased exponent** və pulsuz **implicit leading 1** ilə paketlayir.
- `0.1 + 0.2` üç *qanuni* yuvarlama vasitəsilə uğursuz olur — saxla, saxla, topla — saxlanan `0.3`-dən bir təmsil edilə bilən ədəd uzaqda qərar verir. Hər addım mümkün olan ən yaxın dəyəri qaytardı; sual özü soruşula bilməzdi.
- Dəqiqlik **nisbidir**: boşluqlar böyüklük böyüdükcə ikiləşir. **2⁵³**-dən yuxarı double-lar tam ədədləri atlayır (`Number.MAX_SAFE_INTEGER`, Twitter-in `id_str`); float-lar 2²⁴-da eyni divara çatır, ~7 etibarlı rəqəm ilə, double-ın ~15–16-sına qarşı.
- Dəmir qaydalar: **tolerans** ilə müqayisə edin, heç vaxt `===` deyil; **pulu tam ədəd sentlerde ya da onluq tiplərdə** saxlayın — Vancouver indeksi 22 ay ərzində gündə 2,800 kəsmə ilə dəyərinin 48%-ni itirdi.
- **Dəhran, 1991**: tik başına 0.000000095 s xəta × 3.6 milyon tik = 0.34 s = 687 m hədəf yanlışlığı range gate-ə, 28 nəfər ölüb. Toplanmış xəta xətti, səssiz, bir gün gecikən düzəliş ilə düzəldilə bilərdi.
- Kontraktın kənarları qəsdən sivilldir: **Infinity** overflow-u qəbul edir, **NaN** yoluxucu, özünə bərabər deyil (`x !== x`), **−0** sign-magnitude-un cüt sıfırı qəsdən saxlanıldı, subnormal-lar isə formatın sıfıra tədricən sönmésini təmin edir.

</Recap>

<Challenges>

#### Əllə kodlayın {/*encode-by-hand*/}

**0.375**-i 32-bit IEEE 754 float olaraq kodlayın: sign, exponent bitleri, mantissanın ilk bir neçə biti. Sonra bu dərsin bölünəbilirlik qaydasını istifadə edərək mantissanın sonlu olduğunu təsdiqləyin — *tək bir rəqəm hesablamadan əvvəl*.

<Hint>

0.375 = 3/8. Məxrəc iki dərəcəsimidir? Bu dərhal sonluluq sualını cavablandırır. Rəqəmlər üçün ikiləşdirmə reseptini işlədin, sonra `1.nəsə × 2^n`-a normallaşdırın.

</Hint>

<Solution>

Əvvəlcə bölünəbilirlik qaydası: 0.375 = 3/8, 8 = 2³ tam iki dərəcəsidir → genişlənmə **mütləq sonlanır**. İndi rəqəmlər:

```
0.375 × 2 = 0.75  → 0
0.75  × 2 = 1.5   → 1, 0.5 saxla
0.5   × 2 = 1.0   → 1, bitdi        0.375 = 0.011₂

Normallaşdır:  0.011 = 1.1 × 2⁻²
Sign:          0
Exponent:      −2 + 127 = 125 → 01111101
Mantissa:      1, sonra sıfırlar  → 10000000000000000000000

0 01111101 10000000000000000000000
```

Deşifrə edərək yoxla: 1.1₂ × 2⁻² = 0.11₂ × 2⁻¹ = 0.011₂ = 1/4 + 1/8 = 0.375 ✓

</Solution>

#### Dökümü deşifrə edin {/*decode-the-dump*/}

Yaddaş dökümü 32-bit float göstərir: `0 10000010 01100000000000000000000`. Hansı ədəddir? Üç sahəni deşifrə edin, toplama edin, çəkiləri əlavə edərək yoxlayın.

<Solution>

```
Sign:      0 → müsbət
Exponent:  10000010₂ = 130;  130 − 127 = 3  → × 2³
Mantissa:  011... → qarşısında implicit 1. → 1.011₂

Toplama:   1.011₂ × 2³ = 1011.0₂
Çəkilər:   8 + 2 + 1 = 11
```

Float **+11.0**-dır ✓ — tam olaraq saxlanıldı, əlbəttə: 11 2²⁴ uçurumundan çox aşağıda bir tam ədəddir. Deşifrənin *ötən dərsdəki* bacarıqlarla başdan sona qədər necə işlədiyinə diqqət edin: işarəsiz byte oxuyun (130), çəkilər əlavə edin (1011 → 11). Ekzotik görünən format trençkotunda üç köhnə dostdur.

</Solution>

#### Ödəniş döngüsü {/*the-billing-loop*/}

Transfer tapşırığı. Kod review-da abunəlik-ödəniş xidmətindəki bu (JavaScript) ilə qarşılaşırsınız:

```js
let total = 0.0;
for (let i = 0; i < items.length; i++) {
  total += items[i].priceDollars;   // məs. 19.99, 0.10 ...
}
if (total === expectedTotal) {
  markInvoicePaid();
}
```

Review şərhini yazın: *hər iki* müstəqil buqu adlandırın, hər birinin arxasındakı mexanizmi bir cümlədə izah edin (bu dərs hər biri üçün fəlakət hekayəsi verdi — istifadə edin), standart düzəlişi göstərin.

<Solution>

**Bug 1 — valyutanı double-da toplamaq.** `19.99` və `0.10`-un dəqiq double təmsili yoxdur (məxrəclər iki dərəcəsi deyil), buna görə hər `+=` ~10⁻¹⁷ toz yatırır; minlərlə əşya ve milyonlarla faktura üzərindən toz uzlaşdırıla bilən pula çevrilir — Vancouver Birjası tam bu nümunəylə indeksinin 48%-ni itirdi, gündə 2,800 kəsmə.

**Bug 2 — float-larda `===`.** Minimal sürüşmə ilə belə `total` ve `expectedTotal` *fərqli* hesablama yolları vasitəsilə gəlir, buna görə son yuvarlama ehtiyacı yoxdur ki uyğun gəlsin — `0.1 + 0.2 === 0.3` iki sətirlik sübutdur — yani etibarlı fakturalar gah-gah ödənilmiş kimi qeyd edilməyəcək.

Review şərhi: *"Qiymətlər ən kiçik vahidin tam ədədleri olmalıdır — `priceCents: 1999`, dəqiq tam ədəd arifmetikası ilə toplanmalı (ya da sınırda `BigDecimal`/`DECIMAL` kimi onluq tip); faktura uyğunlaşması isə bu tam ədədləri `===` ilə müqayisə etməlidir — tip düzgün olandan sonra bu düzgün olur. Float-lar ölçmələr üçündür; pul ölçmə deyil, saydır."*

Xoş simmetriyaya diqqət edin: ötən dərsin tam ədəd overflow-u "tikişdən əvvəl genişləndir ya da kəs" dedi; bu dərs "sikkələri saymağa ölçü lenti gətirməyin" deyir. İkisi eyni intizamdır — **sayı kontraktını verilənlərə uyğun seçin**, dizayn zamanı, auditin ardından deyil. ✓

</Solution>

</Challenges>

<LearnMore title="Endianness: Byte-ların Sırası" path="/learn/faza-0/modul-0-1/endianness">

İndi tam ədədləri, mənfiləri, kəsrləri byte-lara kodlaya bilirsiniz. Bir sual qalır, o qədər əsas ki zarafat kimi səslənir: bir ədəd *bir neçə* byte-a ehtiyac duyanda, yaddaşda hansı byte **əvvəlcə** gəlir? Hesablama dünyası bu barədə iki düşərgəyə bölündü — *Gulliver's Travels*-dəki yumurta-qırma müharibəsinə görə adlandırıldı, tam ciddi olaraq — fayllar, şəbəkələr, CPU-lar bu gün hələ fərqli tərəflər tutaraq. Növbəti dərs: hesablamadakı ən əhval-ruhiyyəcə xırda görünən mübahisə, həqiqətən özüylə gətirdiyi real buglar.

</LearnMore>
