---
title: "Floating Point: 0.1 + 0.2 Niyə 0.3 Deyil"
---

<Intro>

1991-ci il fevralın 25-i gecəsi, Körfəz müharibəsi zamanı, İraq Scud raketi Səudiyyə Ərəbistanının Dhahran şəhərindəki ABŞ ordusunun kazarmasına dəydi — 28 əsgər öldü, təxminən 100-ü yaralandı. Patriot raket batareyası orada məhz belə hücumları dayandırmaq üçün yerləşdirilmişdi — və heç vaxt atəş açmadı. Rəsmi araşdırma nə ilişib qalmış buraxılış qurğusu tapdı, nə də radar kor nöqtəsi. Batareya sadəcə təxminən 100 saat fasiləsiz işləmişdi və daxili saatı vaxtı saniyənin onda birləri ilə sayırdı... **0.1** rəqəminin 24-bitlik yaxınlaşmasından istifadə edərək — bu dərsin ilk dəqiqələrində isbat edəcəyiniz kimi, *binary sistemdə ümumiyyətlə yazıla bilməyən* rəqəmdən. Hər tik-də 0,000000095-lik cüzi xəta sakitcə yığılıb saatı 0,34 saniyə yanlış etmişdi — və Mach 5 sürətində 0,34 saniyə tutuşla dəfn arasındakı fərqdir. Keçən dərs bir vədlə bağlandı: kəsr rəqəmlərin müqaviləsi işarə bitini dirildir, iki sıfırı *qəsdən* saxlayır və 0.1-i dəqiq saxlaya bilmir. O müqaviləni açmaq vaxtıdır — bu modulun ən qəribə və ən çox nəticə doğuran müqaviləsini.

</Intro>

<YouWillLearn>

- Binary-nin nöqtədən *sonrakı* rəqəmləri necə emal etdiyi — və 0.1-i yazılmaz edən sadə bölünmə qaydası
- **Fixed point**: aşkar dizayn, Patriot-un onu niyə işlətdiyi və qurduğu aralıq-dəqiqlik tələsi
- **Floating point**: binary sistemdə elmi yazılış — sign, exponent, mantissa — və IEEE 754-ü əllə encode/decode etmək
- `0.1 + 0.2 === 0.3 → false`-un tam yarılması, rəqəm-rəqəm
- Rezin xətkeş: rəqəmlər arasındakı boşluqların niyə *böyüdüyü*, 2⁵³-ün niyə JavaScript-in uçurum kənarı olduğu və Twitter-in bu barədə nə etdiyi
- Müqavilənin kənarları — `Infinity`, `NaN`, `−0` — və iki dəmir qayda: float-ları heç vaxt `===` ilə müqayisə etmə, pulu heç vaxt float-da saxlama

</YouWillLearn>

## Nöqtədən sonra binary {/*binary-after-the-point*/}

İndiyə qədər hər şey — açarlar, çəkilər, odometrlər, two's complement — tam ədədlər dünyasında yaşayırdı. Amma mövqeli yazılışın həmişə ikinci yarısı olub. Onluq sistemdə nöqtənin *solundakı* rəqəmlər 1, 10, 100... çəkir; nöqtənin *sağındakılar* 1/10, 1/100, 1/1000 — eyni qüvvət silsiləsi, nöqtədən o tərəfə mənfi istiqamətdə davam edir:

```
3.25 = 3×10⁰ + 2×10⁻¹ + 5×10⁻²
     = 3     + 0.2    + 0.05
```

Binary nöqtədən o tərəfə tam eyni cür uzanır — bu, hələ də keçən dərsin çəkiləri-topla bacarığıdır, sadəcə əzbərləməli yeni çəkilərlə: **1/2, 1/4, 1/8, 1/16...**

```
Çəkilər:   ...  4    2    1  .  1/2   1/4   1/8   1/16 ...

0.101₂  =  1×(1/2) + 0×(1/4) + 1×(1/8)
        =  0.5 + 0.125
        =  0.625 ✓

101.11₂ =  4 + 1 + 1/2 + 1/4  =  5.75 ✓
```

Yeni heç nə icad edilməli olmadı. Odometrin çarxları sadəcə nöqtənin sağına davam edir — hər biri sol qonşusunun yarısı qədər dəyərli. Onluq kəsri binary-də *yazmaq* üçün isə keçən dərsin mühəndis üsulunu əks etdirən mexaniki resept var: **kəsr hissəni ikiyə vurmağa davam et; 1-i keçdikcə 1 yaz və onu çıx; əks halda 0 yaz.**

```
0.625 × 2 = 1.25   → 1, saxla 0.25
0.25  × 2 = 0.5    → 0, saxla 0.5
0.5   × 2 = 1.0    → 1, saxla 0.0   ← hazır, qalıq boşdur

0.625 = 0.101₂ ✓
```

Təmiz, sonlu, könülaçan. İndi eyni resepti proqramlaşdırmanın ən günahsız rəqəmi üzərində sınayın.

## 0.1 niyə yazıla bilmir {/*why-zero-point-one-cannot-be-written*/}

İkiyəvurma reseptini **0.1** üzərində işə salın:

```
0.1 × 2 = 0.2   → 0
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, saxla 0.6
0.6 × 2 = 1.2   → 1, saxla 0.2   ← yenə 0.2 — biz burada olmuşuq!
0.2 × 2 = 0.4   → 0
0.4 × 2 = 0.8   → 0
0.8 × 2 = 1.6   → 1, saxla 0.6
0.6 × 2 = 1.2   → 1, saxla 0.2   ← və yenə, əbədi olaraq
```

Qalıq 0.2 geri qayıdır, deməli rəqəmlər təkrarlanır, deməli açılış heç vaxt bitmir:

```
0.1 = 0.0001100110011001100110011...₂
            └──┘└──┘└──┘└──┘
             0011 təkrarlanır, sonsuzadək
```

Onda bir binary-də **sonsuz dövri kəsrdir** — onluq sistemdəki 1/3 = 0.3333... ilə tam eyni fenomen. Və bunun nə vaxt baş verdiyini idarə edən dəqiq qayda var. Kəsr verilmiş bazada yalnız o halda sonlanır ki, məxrəcinin bütün sadə vuruqları bazanı bölsün. Baza 10 = 2 × 5, deməli 2-lərdən və 5-lərdən qurulmuş məxrəclər sonlanır (1/2, 1/5, 1/20 = 0.05), qalan hər şey dövr edir (1/3, 1/7). Baza 2-nin isə düz *bir* sadə vuruğu var: 2. Deməli binary-də **yalnız ikinin qüvvəti olan məxrəclər sonlanır** — 1/2, 1/4, 1/8, 3/16... Qalan hər şey əbədi dövr edir və 1/10 = 1/(2 × 5) elə qalan hər şeydir: 5 vuruğu onu zəhərləyir.

Nəticənin üstündə bir saniyə dayanın, çünki həqiqətən qəribədir: onluq düşünən insanların *mümkün ən sadə kəsr* saydığı rəqəm — bir dime, metrin onda biri, onda-bir-saniyəlik saatın bir tiki — binary maşınların **heç vaxt dəqiq saxlaya bilmədiyi** rəqəmdir, neçə bit versəniz də. 24 bit, 53 bit, bir milyon bit: sonsuz quyruğu həmişə haradasa kəsirsiniz və kiçik bir xəta saxlayırsınız. Bu dərsin bütün qalanı kompüterlərin o xətanı necə idarə etdiyi haqqındadır — və etmədikləri günlərdə nə baş verdiyi haqqında.

## Cəhd 1: nöqtəni mismarla {/*attempt-1-fixed-point*/}

Floating point-dən əvvəl öz instinktlərinizin yəqin təklif edəcəyi dizaynla tanış olun — həmin gecə Patriot-un içində işləyənlə. Sabit sayda bit götürün və nöqtənin harada oturduğunu müqavilə ilə sadəcə *elan edin*. Deyək, 8 bit, nöqtə ortaya qaynaq edilib: dörd bit tam hissə, dörd bit kəsr:

```
Çəkilər:   8  4  2  1  .  1/2  1/4  1/8  1/16

0110.1010  =  4 + 2 + 1/2 + 1/8  =  6.625
```

Bu, **fixed point**-dir və real üstünlükləri var: o, sadəcə eynək taxmış tam ədəddir (`01101010` bitləri adi 106 tam ədədidir və müqavilə deyir: "gördüyünü 16-ya böl"), deməli keçən dərsin bütün tam ədəd hesabı — adi adder, two's complement mənfilər — dəyişmədən işləyir. Fixed point bu gün də sağ-salamatdır: audio DSP çiplərində, embedded kontrollerlərdə, maliyyə sistemlərində.

Amma qaynaq edilmiş nöqtənin nəyə başa gəldiyinə baxın. Dörd tam bitlə ən böyük dəyər 15.9375-dir — *on altı* qutunu daşırır. Dörd kəsr bitiylə ən incə addım 1/16 = 0.0625-dir — bundan kiçik hər şey yuvarlaqlaşıb heçliyə gedir. 32 bitə genişləndirin — divarlar yerini dəyişər, amma həbsxananın *forması* dəyişməz: aralığa nə verirsinizsə, dəqiqlikdən alırsınız, və əksinə — çünki nöqtə tərpənə bilmir. Eyni proqramda həm planetin orbitinə (10¹¹ metr), həm atomun radiusuna (10⁻¹⁰ metr) ehtiyacı olan fizika mühərrikinin bəxti sadəcə gətirməyib — nöqtənin heç bir sabit yeri 21 tərtib böyüklüyü örtmür.

Alimlər bu divara kompüterlərdən əsrlər əvvəl dəydilər və həlləri hər laboratoriya lövhəsindədir: 602.214.076.000.000.000.000.000 yazma — **6,022 × 10²³** yaz. Bir ovuc *əhəmiyyətli rəqəm* saxla, nöqtənin *hara getdiyini* isə ayrıca saxla. Nöqtə artıq qaynaq edilməyib. O, **üzür** (float edir).

<DiagramGroup>

<Diagram name="floating-point/fixed_point_window" height={320} width={340} alt="8 onluq rəqəm xanasından ibarət sıra, 4-cü və 5-ci xana arasına iri nöqtə qaynaq edilib, 0 0 1 2 . 3 4 0 0 göstərir. Aparıcı sıfırlar və sondakı sıfırlar solğunlaşdırılıb və 'israf edilmiş xanalar' etiketlənib. Aşağıda qırmızı iki uğursuzluq sətri: 4.096.000 'çox böyük — sığmır' işarəli və 0.0000012 'çox kiçik — 0-a yuvarlaqlaşır' işarəli. Alt yazı: fixed point — nöqtə müqavilənin hissəsidir və tərpənə bilməz.">

Fixed point: nöqtə müqaviləyə qaynaq edilib. 12.34-ü saxlamaq xanaların yarısını israf edir, nəhənglər də, cırtdanlar da təmsil oluna bilmir.

</Diagram>

<Diagram name="floating-point/floating_point_window" height={320} width={340} alt="Eyni 8 rəqəm xanası sırası, indi hamısı mavi vurğulanıb və sabit nöqtəsiz 1 2 3 4 0 0 0 0 saxlayır, üstəgəl 'vur on üstü n' oxunan balaca qoşma dial qutusu, 'nöqtə sürüşür' etiketli oxla. Aşağıda mavi iki uğur sətri: 4.096.000 bərabərdir 4,0960000 vur 10 üstü 6 və 0.0000012 bərabərdir 1,2000000 vur 10 üstü mənfi 6, hər ikisi işarələnib. Alt yazı: floating point — eyni 8 xana, hər biri əhəmiyyətli, exponent pəncərəni nişan alır.">

Floating point: eyni səkkiz xana, amma *hər* xana əhəmiyyətli rəqəm saxlayır və ayrıca exponent dial-ı nöqtəni lazım olan yerə sürüşdürür.

</Diagram>

</DiagramGroup>

Budur bu dərsin qalanı üçün beyninizdə saxlamalı olduğunuz fiziki maşın: **8-rəqəmli ekranı və balaca exponent dial-ı olan cib kalkulyatoru**. Ekran həmişə düz 8 əhəmiyyətli rəqəm tutan pəncərədir — heç vaxt artıq yox. Dial o pəncərəni qalaktika miqyasına da tuşlaya bilər, atom miqyasına da. Pəncərəni *istənilən yerə* tuşlaya bilərsiniz; heç vaxt edə bilməyəcəyiniz şey — ona doqquzuncu rəqəm sığdırmaqdır. Floating point bitlərdən qurulmuş həmin kalkulyatordur.

## IEEE 754 müqaviləsi: bir bit, iki sahə {/*the-ieee-754-contract*/}

Binary elmi yazılış hər rəqəmi bu formaya normallaşdırır:

```
(−1)^sign  ×  1.fffff...₂  ×  2^exponent
```

— nöqtədən əvvəl bir sıfırdan-fərqli rəqəm (binary-də yeganə sıfırdan-fərqli rəqəm elə 1-dir), qalan əhəmiyyətli rəqəmlər ondan sonra, vur ikinin qüvvəti. IEEE 754 standartı (1985) üç inqrediyenti sabit sahələrə yığır. 32-bitlik **float** üçün:

<Diagram name="floating-point/float32_anatomy" height={340} width={720} alt="Üç etiketli sahəyə bölünmüş 32-bitlik sxem: 0 saxlayan, 'sign, 1 bit' etiketli tək mavi qutu; 01111100 saxlayan, 'exponent, 8 bit, +127 bias ilə saxlanır' etiketli səkkiz qutu; və 01000000000000000000000 saxlayan, 'fraction (mantissa), 23 bit, gizli 1. saxlanmır' etiketli bir uzun yumru düzbucaqlı. Aşağıda nümunənin decode-u yazılıb: sign 0 müsbət deməkdir; exponent bitləri 01111100 bərabərdir 124, çıx bias 127 verir 2 üstü mənfi 3; mantissa binary-də 1.01 verir; yığılmış dəyər sətri oxunur: üstəgəl 1.01 baza 2 vur 2 üstü mənfi 3 bərabərdir 0.00101 baza 2 bərabərdir 0.15625.">

32-bitlik float-un üç sahəsi, 0.15625 rəqəmini decode edir. 64-bitlik double eyni anatomiyadır, təkmilləşdirilmiş: 1 sign, 11 exponent, 52 mantissa biti.

</Diagram>

- **Sign — 1 bit.** 0 müsbət, 1 mənfi. Bəli: bu, **sign-magnitude**-dur — keçən dərsin 1-ci cəhdi, düz vəd edildiyi kimi sürgündən qayıdıb — əkiz-sıfır yükü də yanında (onlara sonda baş çəkəcəyik).
- **Exponent — 8 bit, bias ilə saxlanır.** Exponent mənfiyə getməlidir (kiçik rəqəmlərə 2⁻³, 2⁻¹²⁶... lazımdır), amma two's complement əvəzinə IEEE 754 `əsl exponent + 127` saxlayır. Beləliklə 2⁻³ 124 kimi, 2⁵ 132 kimi saxlanır. Niyə bütöv bir dərs sərf etdiyimiz gözəl müqavilə əvəzinə **bias**? O sualı saxlayın — aşağıdakı DeepDive-da onu gözləyən həqiqətən zərif cavab var.
- **Mantissa (fraction) — 23 bit.** Nöqtədən sonrakı əhəmiyyətli rəqəmlər. Və burada standartın ən bic fəndi gizlənir: normallaşdırılmış binary-də nöqtədən əvvəlki rəqəm *həmişə* 1-dir — bəs onu saxlamağa niyə bit xərcləyək? IEEE 754 xərcləmir. Aparıcı `1.` **gizli bitdir (implicit bit)** — müqavilə ilə fərz edilir, heç vaxt yazılmır. 23 bit dəqiqliyin pulunu ödəyirsiniz, 24 alırsınız. Keçən dərs bütöv bir dizayn (sign-magnitude) bir israf edilmiş nümunəyə görə öldü; bu standart havadan bir bit qopardır.

**İşlənmiş nümunə — 0.15625-i encode et (diaqramdakı rəqəm):**

```
1. Binary-yə:      0.15625 = 5/32 = 0.00101₂
2. Normallaşdır:   0.00101 = 1.01 × 2⁻³
3. Sign:           müsbət → 0
4. Exponent:       −3 + 127 = 124 → 01111100
5. Mantissa:       "1."-dən sonrakı rəqəmlər → 01, doldurulmuş → 01000000000000000000000

0 01111100 01000000000000000000000 ✓
```

**İşlənmiş nümunə — 5.75-i encode et:**

```
1. Binary-yə:      5.75 = 101.11₂          (4 + 1 + 1/2 + 1/4)
2. Normallaşdır:   101.11 = 1.0111 × 2²
3. Sign:           0
4. Exponent:       2 + 127 = 129 → 10000001
5. Mantissa:       0111 doldurulmuş → 01110000000000000000000

0 10000001 01110000000000000000000

Geri decode: 1.0111₂ × 2² = 101.11₂ = 5.75 ✓
```

Hər iki rəqəm *dəqiq* encode olundu — çünki hər ikisi ikinin qüvvətlərinin cəmidir. 0.1-ə belə mərhəmət yoxdur: sonsuz `0011` quyruğu mantissa-nın kənarında kəsilir və saxlanan son bit yuvarlaqlaşdırılır. Saxlanan 0.1 deyil. O, 0.1-in **ən yaxın təmsil oluna bilən qonşusudur** — 0.1-in paltarını geymiş, həqiqətən fərqli bir rəqəm.

<DeepDive>

#### Standartdan əvvəlki müharibə {/*the-war-before-the-standard*/}

IEEE 754-ün cazibə qüvvəsi kimi həmişə mövcud olduğunu fərz etmək asandır. Deyildi — və ondan əvvəlki dövr xaos idi. 1960–70-lərdə *hər istehsalçı öz floating point-ini icad edirdi*: IBM mainframe-ləri baza-16 float işlədirdi (rəqəmin böyüklüyündən asılı olaraq sakitcə 3 bitə qədər dəqiqlik itirirdi), Cray superkompüterlərinin *müqayisə zamanı* daşa bilən formatları vardı, DEC, Burroughs və qalanları hərəsi yenə başqa cür edirdi. Eyni Fortran proqramı fərqli maşınlarda fərqli cavablar verirdi və ədədi analitiklər hansı kompüterlərə hansı düsturların etibar edilə biləcəyinin zehni siyahılarını saxlayırdılar.

Dönüş nöqtəsi gözlənilməz istiqamətdən gəldi: *mikroprosessor* şirkətindən. 1976-cı ildə Intel qərara aldı ki, hazırlanan 8087 riyaziyyat koprosessoru silisiuma qoyulmuş ən yaxşı hesaba malik olsun və Berkeley professoru **William Kahan**-ı — karyerasını floating-point dizaynlarının hesablamaları necə şikəst etdiyini kataloqlaşdırmağa həsr etmiş adamı — onu dizayn etməyə dəvət etdi. Kahan-ın komandasının Intel üçün yazdığı layihə IEEE komitəsinin işinin toxumu oldu və 1985-ci ildə IEEE 754 kimi təsdiqləndi. 8087 1980-ci ildə çıxdı — standart hələ yekunlaşmamış: hələ mövcud olmayan qanunu icra edən silisium. On il ərzində hər ciddi CPU onu qəbul etdi, "eyni proqram, fərqli cavablar" erası bitdi və Kahan 1989-cu ildə Turing mükafatını — hesablamanın Nobelini — böyük ölçüdə bu bir standarta görə aldı. JavaScript-iniz `0.30000000000000004` çap edəndə, onu telefonda, laptopda və superkompüterdə *eyni cür* çap edir. O darıxdırıcı ardıcıllıq nə vaxtsa qeyri-mümkün arzu idi.

</DeepDive>

## Məşhur cəmin yarılması {/*the-autopsy-of-a-famous-sum*/}

Artıq proqramlaşdırmanın ən məşhur sətrini yarmaq üçün lazım olan hər aləti əlinizdə tutursunuz:

```js
0.1 + 0.2
```

<ConsoleBlock level="info">

0.30000000000000004

</ConsoleBlock>

JavaScript rəqəmləri 64-bitlik double-lardır — 52 mantissa biti, gizli 1 ilə 53. Faktiki nə baş verdiyinə addım-addım baxın:

**Addım 1 — `0.1`-in saxlanması.** Sonsuz `0.000110011...` quyruğu kəsilir və 53 əhəmiyyətli bitə yuvarlaqlaşdırılır. Saxlanan dəyər ən yaxın double-dır:

```
saxlanan "0.1"  =  0.1000000000000000055511151231257827...
                      └── ~5,55 × 10⁻¹⁸ qədər artıq
```

**Addım 2 — `0.2`-nin saxlanması.** Eyni quyruq (0.2 sadəcə 0.1-in nümunəsinin bir mövqe sürüşdürülməsidir), eyni cərrahiyyə:

```
saxlanan "0.2"  =  0.2000000000000000111022302462515654...
                      └── ~1,11 × 10⁻¹⁷ qədər artıq
```

**Addım 3 — toplama.** Hardware iki saxlanan dəyəri qüsursuz toplayır, sonra nəticəni *yenidən* ən yaxın double-a yuvarlaqlaşdırmalıdır:

```
iki saxlanan dəyərin əsl cəmi ≈ 0.3000000000000000166...
ən yaxın double               = 0.3000000000000000444089209850062616...
```

**Addım 4 — `0.3` ilə müqayisə.** Amma mənbə kodunuzdakı `0.3` literalı *öz* 1-ci addımından keçdi və onun ən yaxın double-ı *o biri tərəfdə* oturur:

```
saxlanan "0.3"  =  0.2999999999999999888977697537484345...

0.30000000000000004440...  ===  0.29999999999999998889...   →  false
```

Üç ayrı yuvarlaqlaşdırma — ikisi saxlamada, biri toplamadan sonra — və yığılan toz `0.3`-ün düşdüyü yerdən bir təmsil-oluna-bilən rəqəm o tərəfə düşür. Heç kim nasaz işləmədi. Adder mükəmməl idi. **Hər addımda hər dəyər qanuni olaraq ən yaxın təmsil oluna bilən rəqəm idi** — cavab yenə "yanlışdır", çünki sual ("mənə dəqiq onda birlər ver") binary-də əvvəldən verilə bilən deyildi. `0.30000000000000004.com` adlı vebsayt var və o, tam təsəvvür etdiyiniz şeydir.

Maskanın sürüşməsinə istənilən vaxt baxa bilərsiniz — JavaScript-dən adətən göstərdiyindən çox rəqəm istəyin:

```js
(0.1).toFixed(20)
```

<ConsoleBlock level="info">

'0.10000000000000000555'

</ConsoleBlock>

Default göstəriş ~15–17 rəqəmə yuvarlaqlaşdırır — bu, adətən xətanı *yenidən gizlədir* və təmiz "0.1" çap edir: yalan kosmetikdir, çap vaxtı çəkilir. `0.1 + 0.2` yalnız ona görə məşhurdur ki, onun tozu kosmetik yuvarlaqlaşdırmadan sağ çıxıb ekranınıza çatır.

<Note>

1 ilə növbəti təmsil oluna bilən double arasındakı boşluq — 2⁻⁵² ≈ 2,22 × 10⁻¹⁶ — **machine epsilon** adlanır və əksər dillərdə adlı sabitdir: JavaScript-də `Number.EPSILON`, C-də `DBL_EPSILON`. Onu 1.0 yaxınlığında rəqəm oxunun dənə ölçüsü kimi düşünün: bundan kiçik xətalar hərfi mənada təmsil oluna bilməzdir və düzgün float müqayisələri (Pitfall-da gəlir) ondan qurulur.

</Note>

## Uzanan bölgülü xətkeş {/*a-ruler-with-stretching-marks*/}

Cib kalkulyatoruna qayıdın: 8 əhəmiyyətli rəqəm, sürüşən pəncərə. Onu 1-in yaxınlığına tuşlayın — yüz-milyondabirləri ayırd edir. 400 milyona tuşlayın — eyni 8 rəqəm indi o deməkdir ki, ən incə addım *onluqlarladır*. Dəqiqlik yoxa çıxmadı — o, **nisbidir**: sabit sayda əhəmiyyətli rəqəm, deməli təmsil oluna bilən rəqəmlər arasındakı *mütləq* boşluq böyüklüklə miqyaslanır. Double elə xətkeşdir ki, onun boyunca sürüşdükcə bölgüləri aralanır:

<Diagram name="floating-point/number_line_gaps" height={330} width={720} alt="Şaquli yığılmış üç üfüqi rəqəm-oxu parçası, hər birində bölgülər. Üst sıra, '1 ilə 2 arasında' etiketli: bölgülər son dərəcə sıx çəkilib, '(boşluq = 2 üstü mənfi 52 — təxminən 4,5 kvintilyon addım' annotasiyası ilə. Orta sıra, '2 üstü 52 ilə 2 üstü 53 arasında' etiketli: bölgülər geniş aralı, 'boşluq = düz 1 — yalnız tam ədədlər sağ qalır' annotasiyası ilə. Alt sıra, '2 üstü 53-dən yuxarı' etiketli: bölgülər iki dəfə aralı, 'boşluq = 2 — tək ədədlər yox olur' annotasiyası ilə, bir əskik bölgü qırmızı xaçla işarələnib: 9.007.199.254.740.993. Sıraların ortaq alt yazısı: hər yerdə eyni 53 əhəmiyyətli bit — böyüklük hər ikiqat artanda mütləq boşluq ikiqat artır.">

Bir xətkeş, üç zoom səviyyəsi. Mantissa həmişə 53 əhəmiyyətli bit tutur; böyüklüyün hər ikiqat artması qonşu təmsil-oluna-bilən rəqəmlər arasındakı boşluğu ikiqat artırır.

</Diagram>

Orta və alt sıraları həyəcanverici nəticələrinə qədər izləyin. 2⁵² ilə 2⁵³ arasında double-lar arasındakı boşluq düz 1-dir — xətkeş hələ hər tam ədədin üstünə düşə bilir, sıfır ehtiyatla. Bir ikiqatlanma sonra boşluq 2-dir və **2⁵³-dən yuxarı tək tam ədədlər double-da sadəcə mövcud deyil**. O rəqəm — 2⁵³ = 9.007.199.254.740.992 — uçurum kənarıdır və *yeganə* klassik rəqəm tipi double olan JavaScript son təhlükəsiz dəyəri `Number.MAX_SAFE_INTEGER` (2⁵³ − 1) adlandırır. Kənardan bir addım atın — hesab sakitcə sürrealizmə keçir:

```js
2 ** 53 === 2 ** 53 + 1
```

<ConsoleBlock level="info">

true

</ConsoleBlock>

`9007199254740993`-ün öz double-ı yoxdur, ona görə cüt qonşusuna yuvarlaqlaşır və iki fərqli tam ədəd `===` bərabər olur. Exception yox, xəbərdarlıq yox — yanlışlıq *səssizdir*, bunun isə təhlükəli növ olduğunu artıq bilirsiniz.

Bu uçurumun məşhur real-dünya çapığı var. Twitter-in tweet ID-ləri 64-bitlik tam ədədlərdir və 2010-cu ilə onlar 2⁵³-ü keçmişdilər. API-nin JSON-unu parse edən hər JavaScript klienti fərqli tweet ID-lərinin eyni yuvarlaqlaşdırılmış dəyərin üstünə səssizcə çökməsini izlədi — cavablar yanlış tweet-lərə bağlanır, silmələr qonşuları vururdu. Twitter-in düzəlişi API-də bu gün də görünür: ədədi `id`-nin yanında hər obyekt **`id_str`** daşıyır — eyni ID *sətir kimi*, mətn olaraq göndərilir ki, JavaScript-in double-ı ona heç vaxt toxuna bilməsin. Backend-dəki komanda yoldaşınız sizə 64-bitlik ID-ləri sətir kimi göndərəndə, səbəbi bu dərsdir; ona təşəkkür edin.

Eyni uçurum 32-bitlik float-larda da var, sadəcə xeyli yaxında: 24 əhəmiyyətli bit o deməkdir ki, ilk təmsil-oluna-bilməyən tam ədəd sadə bir **16.777.217**-dir (2²⁴ + 1) — video oyununun xal sayğacının bir günorta ərzində çata biləcəyi rəqəm. Float-ların təxminən 7 etibarlı onluq rəqəmi var; double-ların 15–16. Hər ikisi tükənir.

<Pitfall>

**Float-ları heç vaxt `===` ilə müqayisə etmə, pulu heç vaxt float-da saxlama.**

Əvvəl bərabərlik səhvi. Bu dərsin yarılmasından sonra `if (total === 0.3)` nə olduğu kimi görünməlidir — üç müstəqil yuvarlaqlaşdırma hadisəsinin dəqiq eyni double-ın üstünə düşməsinə mərc. Düzgün gediş **tolerans** ilə müqayisədir:

```
if (Math.abs(a − b) < 1e-9)          // mütləq epsilon — insan-miqyaslı
                                      // dəyərlər üçün yaxşıdır
if (Math.abs(a − b) < Number.EPSILON  // nisbi epsilon — miqyaslanır
      * Math.max(Math.abs(a), Math.abs(b)))
```

Pul səhvi eyni fizikadır — hüquqi nəticələrlə: `0.1` dollar double-da mövcud deyil və qəpikləri `total += 0.01` ilə toplayan billing dövrü hər iterasiyada toz istehsal edir — auditorların axırda tapdığı toz. Sənaye qaydası onilliklərdir mövcuddur: **pul ən kiçik vahidin tam ədədlərində saxlanır** (sent, qəpik, satoshi — 19.99 dollar yox, 1999 sent), harada ki keçən dərsin dəqiq tam ədəd hesabı hökm sürür — və ya baza 10-da hesablayan və dövri quyruqla ümumiyyətlə rastlaşmayan xüsusi decimal tiplərində (Java-da `BigDecimal`, Python və C#-da `decimal`, SQL-də `DECIMAL`). Float-lar ölçmələr üçündür — fizika, qrafika, ML — harada 16-cı rəqəm onsuz da səs-küydür. Pul ölçmə deyil.

</Pitfall>

Və bu kursda hər qaydanın yanında bir cəsəd olduğu üçün: 1982-ci ilin yanvarında **Vancouver Fond Birjası** 1.000,000 xalla parlaq yeni elektron indeks buraxdı. Proqram indeksi hər ticarətdən sonra yenidən hesablayırdı — gündə təxminən 2.800 dəfə — və hər dəfə nəticəni üç onluq rəqəmə *truncate edirdi* (heç yuvarlaqlaşdırmırdı da, sadəcə kəsirdi), dəyərdən bir tük qırxaraq. İyirmi iki ay tük qırxandan sonra, 1983-cü ilin noyabrında indeks təxminən **524,811** oxunurdu — heç vaxt baş verməmiş bazar çöküşünü nəzərdə tutan rəqəm; səhmlər sabit-yuxarı idi. Məsləhətçilər bir həftəsonu indeksi düzgün yenidən hesabladılar və bazar ertəsi o, **1.098,892**-də açıldı. Bazar bir gecədə 574 xal "qazandı" — çünki nəhayət kimsə hesabı düz apardı. Bir truncate görünməzdir; iki il boyu gündə 2.800-ü fond bazarının yarısıdır. Cüzi xətalar onları *iterasiya edəndə* cüzi qalmır — o cümləni saxlayın, çünki Dhahran-a lazım olan son parça odur.

## Dhahran, həll olunur {/*dhahran-resolved*/}

İndi Patriot uğursuzluğunu mühəndis kimi oxuya bilərsiniz — hər inqrediyent masanın üstündədir.

Patriot-un saatı işləmə vaxtını saniyənin onda birlərinin *tam ədədi* kimi sayırdı (dəqiq, keçən dərsə əsasən — tam ədədlər sürüşmür). İzləmə riyaziyyatı üçün saniyələri almaqdan ötrü o sayı 0.1-ə vururdu... **24-bitlik fixed-point registrində** saxlanan 0.1-ə. 24 bit `0.0001100110011001100110011...`-in nə demək olduğunu bilirsiniz: quyruq kəsilir və saxlanan sabit budur:

```
saxlanan "0.1" = 0.09999990463256836
xəta/tik       ≈ 0,000000095 s        (9,5 × 10⁻⁸ — mikrosaniyənin
                                       təxminən onda biri)
```

Tik başına — gülməli. Amma batareya ~100 saat işləkdə idi — ordunun doktrinası tez-tez yerdəyişmə və reboot fərz edirdi, Dhahran-ın statik müdafiəsinin sakitcə köhnəltdiyi fərziyyə (*limitlər dizayn vaxtı çatılmaz görünür; sistemlər dizaynerlərinin fərziyyələrindən uzun yaşayır* — üçüncü dərsdir dalbadal):

```
100 saat = 360.000 s = 3.600.000 tik
3.600.000 × 0,000000095 ≈ 0,34 s yığılmış saat xətası
```

Scud təqribən 1.676 m/s ilə gəlir. Radar onu aşkar *etdi*; proqram sonra sürüşmüş saatla hədəfin növbəti dəfə harada olacağını proqnozlaşdırdı və təsdiq pəncərəsini — **range gate**-i — o nöqtəyə tuşladı. Rəsmi GAO araşdırmasına görə, 0,34 saniyəlik xəta gate-i təxminən **687 metr** yerindən oynatdı. Gate baxdı, Scud-un "olmalı olduğu" yerdə boş səma tapdı, ilkin aşkarlamanı yalançı həyəcan kimi təsnifləşdirdi və heç bir tutucu raket buraxılmadı. Raket maneəsiz kazarmanın üstünə düşdü.

Epiloq məhz bu modulun proqnozlaşdırmağa davam etdiyi cəhətlərdən acıdır. İsrail batareyaları sürüşməni həftələr əvvəl sezib məlumat vermişdilər; müvəqqəti göstəriş saatı sıfırlamaq üçün **müntəzəm reboot etmək** idi — Boeing 787-nin dərmanı, 24 il əvvəl — nə qədərin çox uzun olduğunu dəqiqləşdirmədən. Sabiti düzəldən yenilənmiş proqram Dhahran-a **fevralın 26-da** çatdı: bir gün gec. Və uğursuzluğun dəqiq formasına diqqət edin — exception deyil, crash deyil, **səssizcə yanlış datanın** üstündə əminliklə işləyən sistem — Dərs 3-ün sensor tapşırığının sizdən crash-dan çox qorxmağı istədiyi uğursuzluq rejiminin dəqiq özü. Patriot-un saatı yalan dediyini heç vaxt bilmədi.

## Müqavilənin kənarları {/*the-edges-of-the-contract*/}

Tam ədəd müqavilələri səs-küylü çirkin uğursuz olur — tikiş, işarə çevrilməsi. IEEE 754-ün dizaynerləri — hamısı yaralı ədədi analitiklər — əvəzində formata *təyin edilmiş yumşaq eniş sahələri* qurdular: exponent sahəsinin iki ekstremal nümunəsi (hamısı sıfır, hamısı bir) rəqəmlər üçün yox, **xüsusi dəyərlər** üçün ayrılıb.

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

- **±Infinity** (exponent hamısı 1, mantissa sıfır): overflow-un və ya sıfıra bölmənin nəticəsi. Tam ədəd overflow-u dövrə vurub *yalan danışırdısa*, float overflow-u ən azı nə baş verdiyini etiraf edən dəyərə sancılır: hər şeydən böyük. Hesab ağıllı davam edir — `Infinity + 1` `Infinity`-dir, `1 / Infinity` `0`-dır.
- **NaN** — *Not a Number* (exponent hamısı 1, mantissa sıfırdan fərqli): cavabı olmayan sualların nəticəsi — `0/0`, `√−1`, `Infinity − Infinity`. NaN qəsdən yoluxucudur (ona toxunan istənilən hesab NaN verir, ona görə səssizcə "əsl" dataya yuyula bilməz) və dildəki **özünə bərabər olmayan yeganə dəyərdir** — `NaN === NaN` standarta görə `false`-dur. Bu, buq deyil; rəsmi aşkarlama idiomunun təməlidir (`x !== x` — x NaN-dır deməkdir; nəzakətlə: `Number.isNaN(x)`). Dashboard-unuzda üzə çıxan NaN float-un buq hesabatı verməsidir.
- **−0** (sign biti 1, qalan hər şey 0): sign-magnitude-un əkiz sıfırı, *qəsdən* saxlanılıb — underflow etmiş mənfi kəmiyyətin işarəsini qoruyur, bəzi ədədi üsulların həqiqətən ehtiyacı olan şey. Sazişi və tikişlərini keçən dərsin DeepDive-ında artıq gördünüz: `0 === -0` `true`-dur, `Object.is(0, -0)` `false`, `1/-0` isə `-Infinity` — ələ verən əlamət.
- Exponent hamısı-sıfır sıfırın özünü və **subnormal-ları** yerləşdirir — əlavə-cırtdan rəqəmlərin haşiyəsi (float-lar üçün 2⁻¹²⁶-dan aşağı), harada gizli aparıcı 1 söndürülür ki, format uçurumdan düşmək əvəzinə sıfıra *tədricən* ensin. Çox güman heç vaxt biri ilə birbaşa işləməyəcəksiniz; mövcud olduqlarını bilin — və bəzi CPU-larda onlarla riyaziyyatın kəskin yavaş işlədiyini: klassik müəmmalı-profiling hekayəsi.

<DeepDive>

#### Bias-ın sirri: float-lar tam ədəd kimi sıralanır {/*floats-sort-as-integers*/}

"Niyə two's complement əvəzinə bias?" borcunu ödəmə vaxtıdır. Müsbət float-un üç sahəsini yan-yana düzün — sign 0, sonra exponent, sonra mantissa — və bias-ın nə etdiyinə baxın: o, *böyük exponent-ləri böyük unsigned bit nümunələri etdi* (2⁻³ → 124, 2⁵ → 132), ən böyük dərəcəli bitlərdə oturan, mantissa isə aşağıda bərabərliyi pozan kimi. Nəticə füsunkardır: **müsbət float-lar üçün 32 biti adi unsigned tam ədəd kimi yenidən şərh edib müqayisə etmək düzgün float sırasını verir.** Böyük rəqəm — böyük bitlər: format elə düzülüb ki, adi tam ədəd komparatoru — keçən dərsin sizə sevdirdiyi ən ucuz sxem — float-ları *sıfır* float-a-xas hardware ilə düzgün sıralayır.

Exponent two's complement işlətsəydi, mənfi exponent-lər (2⁻³ kimi cırtdan rəqəmlər) 1 ilə başlayar və bit nümunəsi kimi müsbət exponent-lərdən *üstün* olardı — sıra çilik-çilik olardı. Bias two's complement-in az zərif əmisi oğludur — burada dizayn məqsədi fərqli olduğu üçün seçilib: "adder işləsin" yox, "komparator işləsin". Keçən dərsin eyni gedişi, sitayiş edilən sxem fərqli.

(Mənfi float-lara bir əlavə fənd lazımdır — sign-magnitude nümunələri tərsinə sıralanır, ona görə real radix-sort implementasiyaları əvvəlcə bəzi bitləri çevirir — amma prinsip qüvvədədir və yüksək performanslı sıralama kitabxanaları bu gün də ondan istifadə edir.)

</DeepDive>

## Patriot saatını yenidən qur {/*recreate-the-patriot-clock*/}

Aşağıdakı oyuncaq Dhahran batareyasının saatıdır, bit-dəqiqliyi ilə: dəqiq tam ədəd tik sayğacı (mavi sap), Patriot-un işlətdiyi faktiki 24-bitlik kəsilmiş `1677721/16777216` sabitinə vurulmuş (qırmızı sap). İşləmə vaxtını irəli çəkin və iki sapın ayrılmasına baxın — sürüşmə və range-gate xətası canlı hesablanır. Bunların cavabını tapın: İsrailin məlumat verdiyi 8 saatdan sonra saat nə qədər yanlış idi? Və hansı işləmə vaxtında xəta ilk dəfə Scud-un ~17 metrlik uzunluğunu keçir?

<Sandpack>

```js
import { useState } from 'react';

const CHOPPED = 1677721 / 16777216; // 24-bit truncate-dən sonrakı 0.1

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
      <p>Patriot batareyasının işləmə vaxtı: <b>{hours.toFixed(1)} saat</b></p>
      <p style={row}>əsl vaxt:   {trueTime.toFixed(4)} s</p>
      <p style={{ ...row, color: '#c1554d' }}>
        saat deyir: {clockTime.toFixed(4)} s
      </p>
      <p style={row}>
        sürüşmə: {drift.toFixed(4)} s ≈{' '}
        <span style={{ color: meters > 17 ? '#c1554d' : '#087ea4' }}>
          {meters.toFixed(0)} m
        </span>{' '}
        Scud sürətində
      </p>
      <div>
        <button onClick={() => setTicks(ticks + 36000)}>+1 saat</button>{' '}
        <button onClick={() => setTicks(ticks + 360000)}>+10 saat</button>{' '}
        <button onClick={() => setTicks(ticks + 1800000)}>+50 saat</button>{' '}
        <button onClick={() => setTicks(0)}>reboot</button>
      </div>
      {hours >= 100 && (
        <p style={{ color: '#c1554d' }}>
          <b>Dhahran batareyası 1991-ci il fevralın 25-də bu
          vəziyyətdə idi.</b> Range gate yüzlərlə metr yanlışdır —
          gələn hədəflər yalançı həyəcan kimi rədd edilir.
        </p>
      )}
      {hours > 0 && hours < 100 && (
        <p>Sürüşmə xətti böyüyür — hər tik eyni 0,000000095 s tozu
        çökdürür. Reboot düyməsi 1991-ci ilin düzəlişidir.</p>
      )}
    </div>
  );
}
```

</Sandpack>

Oyuncağın formasına diqqət edin: xəta *darıxdırıcıdır* — mükəmməl xətti, tamamilə proqnozlaşdırıla bilən, kimsə çap etsəydi ilk saatdan görünən. Yığılma buqlarının imzası budur (Patriot, Vancouver): tikiş yox, uçurum yox — sadəcə heç kimin yazıya almadığı borcun üstünə gələn faiz.

<Recap>

- Binary kəsrlər eyni çəkiləri-topla oyunudur, çəkilər **1/2, 1/4, 1/8...** Kəsr baza 2-də yalnız məxrəci **ikinin qüvvəti** olanda sonlanır — deməli 0.5 və 0.375 dəqiqdir, **0.1 isə əbədi dövr edir** (`0011` quyruğu) və *heç vaxt* dəqiq saxlana bilməz.
- **Fixed point** nöqtəni yerinə qaynaq edir: sadə, tam-ədəd-dostu, amma aralıq və dəqiqlik eyni bitlər üstündə dalaşır — və Patriot-un 24-bitlik "0.1"-inin doğulmasına imkan verən odur.
- **Floating point** binary elmi yazılışdır: **sign × 1.mantissa × 2^exponent**. IEEE 754 (1985, Kahan, Intel 8087) onu 1 + 8 + 23 bit (float) və ya 1 + 11 + 52 (double) kimi yığır — **bias-lı exponent** və pulsuz **gizli aparıcı 1** ilə.
- `0.1 + 0.2` üç *qanuni* yuvarlaqlaşdırmadan keçib uğursuz olur — saxla, saxla, topla — saxlanan `0.3`-dən bir təmsil-oluna-bilən rəqəm o tərəfə düşərək. Hər addım mümkün ən yaxın dəyəri qaytardı; sualın özü verilə bilən deyildi.
- Dəqiqlik **nisbidir**: böyüklük ikiqat artdıqca boşluqlar ikiqat artır. **2⁵³-dən** yuxarı double-lar tam ədədləri ötürür (`Number.MAX_SAFE_INTEGER`, Twitter-in `id_str`-i); float-lar eyni divara 2²⁴-də dəyir — double-ın ~15–16 rəqəminə qarşı ~7 etibarlı rəqəmlə.
- Dəmir qaydalar: **tolerans** ilə müqayisə et, heç vaxt `===`; **pulu tam ədəd sentlərdə və ya decimal tiplərdə** saxla — Vancouver indeksi dəyərinin 48%-ni 3-onluqlu truncate-ə itirdi: gündə 2.800 qırxım, 22 ay.
- **Dhahran, 1991**: tik başına 0,000000095 s xəta × 3,6 milyon tik = 0,34 s = hədəfdən 687 m yana düşmüş range gate və 28 ölü. Yığılan xəta xəttidir, səssizdir və bir gün gec düzəldilə bilən idi.
- Müqavilənin kənarları qəsdən sivildir: **Infinity** overflow-u etiraf edir, **NaN** yoluxucudur və özünə belə bərabər deyil (`x !== x`), **−0** sign-magnitude-un qəsdən saxlanmış əkiz sıfırıdır və subnormal-lar formata sıfıra tədricən sönməyə imkan verir.

</Recap>

<Challenges>

#### Əllə encode et {/*encode-by-hand*/}

**0.375**-i 32-bitlik IEEE 754 float kimi encode edin: sign, exponent bitləri və ilk bir neçə mantissa biti. Sonra mantissa-nın sonlu olduğunu bu dərsin bölünmə qaydası ilə təsdiqləyin — bircə rəqəm hesablamazdan *əvvəl*.

<Hint>

0.375 = 3/8. Məxrəc ikinin qüvvətidir? Bu, sonluluq sualına dərhal cavab verir. Rəqəmlər üçün ikiyəvurma reseptini işə salın, sonra `1.nəsə × 2^n`-ə normallaşdırın.

</Hint>

<Solution>

Əvvəl bölünmə qaydası: 0.375 = 3/8 və 8 = 2³ təmiz ikinin qüvvətidir → açılış **sonlanmağa məcburdur**. İndi rəqəmlər:

```
0.375 × 2 = 0.75  → 0
0.75  × 2 = 1.5   → 1, saxla 0.5
0.5   × 2 = 1.0   → 1, hazır        0.375 = 0.011₂

Normallaşdır:  0.011 = 1.1 × 2⁻²
Sign:          0
Exponent:      −2 + 127 = 125 → 01111101
Mantissa:      1, sonra sıfırlar  → 10000000000000000000000

0 01111101 10000000000000000000000
```

Decode ilə yoxla: 1.1₂ × 2⁻² = 0.11₂ × 2⁻¹ = 0.011₂ = 1/4 + 1/8 = 0.375 ✓

</Solution>

#### Dump-ı decode et {/*decode-the-dump*/}

Yaddaş dump-ı 32-bitlik float göstərir: `0 10000010 01100000000000000000000`. Bu hansı rəqəmdir? Hər üç sahəni decode edin, yığın və çəkiləri toplayaraq yoxlayın.

<Solution>

```
Sign:      0 → müsbət
Exponent:  10000010₂ = 130;  130 − 127 = 3  → × 2³
Mantissa:  011... → qabağa gizli 1. → 1.011₂

Yığ:       1.011₂ × 2³ = 1011.0₂
Çəkilər:   8 + 2 + 1 = 11
```

Float **+11.0**-dır ✓ — əlbəttə, dəqiq saxlanıb: 11 2²⁴ uçurumundan xeyli aşağıda olan tam ədəddir. Decode-un başdan-başa *keçən dərsin* bacarıqları üstündə qaçdığına diqqət edin: unsigned byte oxu (130), çəkiləri topla (1011 → 11). Ekzotik görünüşlü format plaşa bürünmüş üç köhnə dostdur.

</Solution>

#### Billing dövrü {/*the-billing-loop*/}

Transfer tapşırığı. Code review-da abunə-billing servisində bununla (JavaScript) rastlaşırsınız:

```js
let total = 0.0;
for (let i = 0; i < items.length; i++) {
  total += items[i].priceDollars;   // məs. 19.99, 0.10 ...
}
if (total === expectedTotal) {
  markInvoicePaid();
}
```

Review şərhini yazın: *hər iki* müstəqil buqun adını çəkin, hərəsinin mexanizmini bir cümlə ilə izah edin (bu dərs hərəsi üçün bir fəlakət hekayəsi verdi — onları işlədin) və standart düzəlişi bildirin.

<Solution>

**Buq 1 — valyutanın double-larda yığılması.** `19.99`-un və `0.10`-un dəqiq double təmsili yoxdur (məxrəclər ikinin qüvvəti deyil), ona görə hər `+=` ~10⁻¹⁷-lik toz çökdürür; minlərlə element və milyonlarla invoys üzərində toz uzlaşdırıla bilən pula çevrilir — Vancouver Fond Birjası indeksinin 48%-ni məhz bu nümunəyə itirdi: bir truncate bir dəfəyə, gündə 2.800 dəfə.

**Buq 2 — float-larda `===`.** Cüzi sürüşmə ilə belə, `total` və `expectedTotal` *fərqli* hesablama yollarından gəlir, deməli son yuvarlaqlaşdırmaları üst-üstə düşməyə borclu deyil — `0.1 + 0.2 === 0.3` iki-sətirlik isbatdır — yəni etibarlı invoyslar təsadüfi olaraq ödənilmiş kimi işarələnməyəcək.

Review şərhi: *"Qiymətlər ən kiçik vahidin tam ədədləri olmalıdır — `priceCents: 1999`, dəqiq tam ədəd hesabı ilə toplanmış (və ya sərhəddə `BigDecimal`/`DECIMAL` kimi decimal tiplə); invoys uyğunlaşdırması isə o tam ədədləri `===` ilə müqayisə etməlidir — tip düzələn andan bu, düzgün olur. Float-lar ölçmələr üçündür; pul saydır, ölçmə deyil."*

Xoş simmetriyaya diqqət edin: keçən dərsin tam ədəd overflow-u dedi: "tikişdən əvvəl genişləndir və ya clamp et"; bu dərs deyir: "qəpik saymağa ölçü lenti gətirmə." Hər ikisi eyni nizam-intizamdır — **rəqəm müqaviləsini dataya uyğun seç**, dizayn vaxtı, auditdən sonra yox. ✓

</Solution>

</Challenges>

<LearnMore title="Endianness: Byte-ların Sırası" path="/learn/faza-0/modul-0-1/endianness">

Artıq tam ədədləri, mənfiləri və kəsrləri byte-lara encode edə bilirsiniz. Bir sual qalır — o qədər əsas ki, zarafata oxşayır: rəqəmə *bir neçə* byte lazım olanda, yaddaşda hansı byte **əvvəl** gedir? Hesablama dünyası bunun üstündə iki düşərgəyə bölündü — tam ciddiyyətlə, *Qulliverin səyahətləri*ndəki yumurta-sındırma müharibəsinin adı ilə adlandırılmış — və fayllar, şəbəkələr, CPU-lar bu gün də fərqli tərəflərdə dayanır. Növbəti dərs: hesablamanın ən xırdaçı səslənən mübahisəsi və göndərdiyi çox real buqlar.

</LearnMore>