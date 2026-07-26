---
title: 'Təsadüfilik: PRNG, Seeds, Entropiya'
---

<Intro>

1999-cu ildə Reliable Software Technologies adlı təhlükəsizlik şirkətinin mühəndisləri mümkünsüz görünən bir şey etdilər: onlayn poker masasına oturub bütün rəqiblərinin qapalı kartlarını canlı şəkildə izlədilər. Serveri sındırmadan, heç bir parol oğurlamadan — sadəcə *hesablama yolu ilə*. Populyar PlanetPoker saytının istifadə etdiyi qarışdırma proqramı random number generator-unu gecə yarısından keçən millisaniyələrin sayı ilə işə salırdı. Gecə yarısından keçən millisaniyələr 0-dan 86,399,999-a qədər dəyişir — yəni kart dəstəsini qarışdırmağın nə qədər üsulu olsa da, o proqram onlardan yalnız **86,400,000-ni** yarada bilərdi. Mümkün dəstə düzülüşlərinin həqiqi sayı isə 52 faktorialdır: təxminən 8 × 10⁶⁷ — 68 rəqəmli bir ədəd. Mühəndislər öz saatlarını serverin saatı ilə sinxronlaşdırdılar, ehtimal olunan qarışdırmaları bir neçə yüz minə qədər daraltdılar, və masada beş kart göründükdən sonra dəqiq hansı olduğunu müəyyən edə bildilər — sonra hər rəqibin əlini və gələcək bütün kartları oyunun yanındaki kiçik bir pəncərədə göstərdilər. Dəstə heç vaxt qarışdırılmırdı. O, oxunacaq qədər qısa bir siyahıdan **seçilirdi**. Keçən dərs bir paradoksla bitdi: CPU deterministikdir, buna baxmayaraq biz ondan davamlı olaraq təsadüfilik tələb edirik. Bu dərs həmin tələbin necə ödənildiyi, ehtimalları heç kim saymadıqda nə qədər möhtəşəm şəkildə uğursuzluğa uğradığı, və təəccüblənə bilməyən bir maşının təəccüb almağa hara getdiyi haqqındadır.

</Intro>

<YouWillLearn>

- Deterministik maşının niyə təsadüfiliyi yalnız *təkrar oynada* bildiyi — və hər PRNG-ni aydın edən kitab-və-səhifə analogiyası
- **Middle-square** və **LCG**: ilk iki cəhd, əllə işlənmiş, və onların dəqiq necə öldüyü
- **Period**, odometrin qisası: hər generator niyə təkrarlanır, və Mersenne Twister-in 2¹⁹⁹³⁷ − 1 dövrü niyə hələ də təhlükəsiz deyil
- Hər şeyi nizama salan ayrım: *statistik* təsadüfilik (təsadüfi görünür) və *kriptoqrafik* təsadüfilik (heç kim təxmin edə bilmir) — və hansı funksiyaya uzanmaq lazımdır
- Həqiqi təəccüb harada yığılır: interrupt titrəyişləri, istilik küyü, lava lampalarından ibarət divar — və 256 bitin niyə əbədi olaraq kifayət etdiyi
- Yalnız təxmin edilə bilən bir seed-in yaratdığı üç fəlakət: Netscape 1995, Debian 2008, və hər dəfə *eynilə həmin* "təsadüfi" ədədi işlədən oyun konsolu

</YouWillLearn>

## Təəccüblənə bilməyən maşın {/*the-machine-that-cannot-be-surprised*/}

Keçən dərs bu dərsə daşımağa dəyər bir tərif ilə bitdi: bir ardıcıllıq istifadə edilə bilən heç bir nümunəsi olmadıqda təsadüfidir — məhz bu səbəbdən gzip bir milyon sıfırı 1,003 bayta sıxdı, bir milyon təsadüfi baytı isə 173 bayt *böyütməli* oldu. **Sıxılmaz olmaq təsadüfiliyin ən yaxşı işlək tərifidir.**

İndi bunu CPU-nun əslində nə olduğu ilə yanaşı qoyun. Bu moduldaki hər dərs eyni mismarı vurdu: prosessor mükəmməl determinizm maşınıdır. Eyni baytlar girir, eyni baytlar çıxır, hər dəfə — və bu etibarlılıq bütün məqsəddir, bank balansınızın yenidən başlatmadan sonra sağ qalmasının səbəbidir. Özünü təəccübləndirməyə qadir olmayan bir maşından tələb olunur ki, qarışdırmalar, simulyasiyalar və sessiya token-ləri üçün saniyədə milyonlarla dəfə təəccüb istehsal etsin. Bir şey güzəştə getməlidir.

Həll yollarını axtarmadan əvvəl tələbi itiləşdirək — çünki "təsadüfi" sözü bir sözün altında gizlənmiş iki fərqli iş çıxır:

| | **Statistik təsadüfilik** | **Kriptoqrafik təsadüfilik** |
|---|---|---|
| Tələb | ədədlər nümunəsiz *görünür* | heç kim növbətini *təxmin edə bilmir* |
| Uyğun sahələr | zər oyunları, qarışdırmalar, seçmə, Monte Carlo simulyasiyası, yük testi, prosedural dünyalar | açarlar, sessiya token-ləri, parol sıfırlama, nonce-lar, salt-lar, lotereya çəkilişləri |
| Uğursuzluq belə görünür | nəticəsi incə şəkildə səhv olan simulyasiya | kiminsə sizin poçtunuzu oxuması |
| Qiymət | nanosaniyələr | bir az daha çox nanosaniyə |

Bu dərsdəki fəlakətlərin hamısı bir qarışıqlıqdan doğur: sol sütun üçün qurulmuş aləti sağ sütundan gələn bir işə göndərmək. Poker qarışdırması *statistik* olaraq qüsursuz idi — kartlar yaxşı qarışmış görünürdü, oyunçular illərlə heç nə hiss etmədi. Sadəcə **təxminedilməz** deyildi, iş isə məhz təxminedilməzlik idi.

Daha iki termin, ikisi də artıq sizindir. **PRNG** — pseudo-random number generator — bunu təqlid edən hesablama maşınıdır: *pseudo* yunanca "yalan" deməkdir, və bu söz dürüst bir etirafdır. **Seed** onu işə saldığınız başlanğıc ədəddir. Keçən dərs sıxılma həddini adlandıran **entropy** isə burada eyni kəmiyyətin digər tərəfdən ölçüsü kimi qayıdır: bir dəyərdəki həqiqi təxminedilməzliyin bit sayı. 26 bit entropy-si olan seed-in 2²⁶ mümkün dəyəri var, və 2²⁶ ehtimalı yoxlaya bilən hücumçu artıq qazanmışdır. Bu hesablamanı yadda saxlayın; bütün dərs bu hesablamadır.

## Cəhd 1: kvadrata yüksəldərək xaosa çatmaq {/*attempt-1-squaring-your-way-to-chaos*/}

Kompüterdə ilk alqoritmik generator təxminən 1946-cı ildə John von Neumann-dan, Los Alamos-daki nüvə simulyasiyaları üçün gəldi, və o, cazibədar dərəcədə sadədir. 4 rəqəmli bir ədəd götürün. **Onu kvadrata yüksəldin, 8 rəqəmə qədər sıfırla doldurun, ortadaki 4 rəqəmi saxlayın.** Bu, çıxışınızdır — həm də növbəti girişiniz. Buna **middle-square metodu** deyilir, və məntiqi valehedicidir: kvadrata yüksəltmə rəqəmləri bir-birinə qarışdırır, ortadakı rəqəmlər isə hamısından asılıdır, deməli nəticə təxminedilməz şəkildə tullanmalıdır, elə deyilmi?

2916-dan başlayaraq əllə işləyək:

```
 2916² =  8,503,056  → 08503056 → ortadaki 4 → 5030
 5030² = 25,300,900  → 25300900 → ortadaki 4 → 3009
 3009² =  9,054,081  → 09054081 → ortadaki 4 → 0540
  540² =    291,600  → 00291600 → ortadaki 4 → 2916   ← yenə seed
```

Dörd addım və başladığı yerə qayıdır, əbədi olaraq `2916 → 5030 → 3009 → 0540` dövrəsində fırlanır. ✓ Bəzi seed-lər daha pisdir: 3792-nin kvadratı 14,379,264-dür, onun ortadaki dörd rəqəmi isə **3792** — özünü dərhal və əbədi olaraq doğuran bir ədəd. Ən çox yayılan ölüm isə daha səssizdir. 1674-dən başlayın və ardıcıllıq uzun müddət sağlam görünür — 8022, 3524, 4185, 5142 — sonra qırxıncı addım ətrafında kiçik ədədlərə büdrəyib boğulur:

```
 … → 4003 → 0240 → 0576 → 3317 → 0024 → 0005 → 0000 → 0000 → 0000 …
```

Sıfırın kvadratı sıfırdır; ortadaki dörd rəqəm sıfırdır; generator ölmüşdür və enerji kəsilənə qədər sıfır çıxaracaq. Von Neumann bunların hamısını bilirdi və metodu hər halda istifadə etdi — sürətli idi, o da çöküşü yoxlayırdı. Həm də 1951-ci ildə sahənin ən çox sitat gətirilən cümləsini söylədi: hesablama yolu ilə təsadüfi rəqəmlər istehsal edən hər kəs, onun yazdığına görə, "günah vəziyyətində" yaşayır.

Bu uğursuzluq bədbəxtlik deyil, və struktur dərsi bundadır: generatorun bütün gələcəyi onun cari 4 rəqəmli ədədinin funksiyasıdır. Onlardan yalnız 10,000 ədəd var. Əvvəllər ziyarət etdiyiniz birinə düşün — 10,000 addım içində düşəcəksiniz — və oradan sonraki bütün ardıcıllıq təkrardır. **Sonlu vəziyyəti olan deterministik generator sonunda mütləq təkrarlanır.** Bu, middle-square-in qüsuru deyil; bu, mövcud olacaq hər PRNG haqqında bir teoremdir, və onun adı var: **period**.

## Bir milyon səhifəli kitab {/*a-book-of-a-million-pages*/}

Karyeranızın qalanı üçün saxlamalı olduğunuz zehni model budur, və bu metafora deyil — obyekt həqiqətən mövcuddur. 1955-ci ildə RAND Corporation *A Million Random Digits with 100,000 Normal Deviates* adlı bir kitab nəşr etdi. O, adının dediyi şeydən ibarətdir: səhifə-səhifə təsadüfi rəqəmlər, elektron küydən yaradılmış, çap edilmiş, cildlənmiş, hər masada kompüter olmayan dövrdə təsadüfiliyə ehtiyacı olan alimlərə satılmış. İstifadə etmək üçün hansısa səhifəni açır və oxumağa başlayırdınız.

Həmin kitab bir PRNG-dir, və onun hər xassəsini öyrədir:

- **Kitab hər kəs üçün eynidir.** İki nüsxə ilə iki alim eyni səhifəni açsa, eyni rəqəmləri oxuyar. PRNG-nin alqoritmi kitabdır — adətən ictimai, standartlaşdırılmış, RFC-lərdə çap olunmuş. Onun içində heç bir sirr yoxdur.
- **Seed səhifə nömrəsidir.** Sizin ardıcıllığınızı başqasının ardıcıllığından ayıran yalnız budur. Eyni səhifə, eyni ədədlər, əbədi.
- **Kitab sonludur.** Kifayət qədər uzun oxusanız, son səhifəyə çatıb birinciyə qayıdırsınız. Bu, period-dur.
- **Və bütün təhlükəsizlik bundadır:** rəqibinizdə kitabın nüsxəsi varsa — var, o ictimaidir — onda onunla sizin gələcəyiniz arasında dayanan tək şey *sizin səhifə nömrənizi təxmin edə bilməsidir*.

İndi poker hekayəsini yenidən oxuyun. Kitab qaydasında idi. Səhifə nömrəsi isə "gecə yarısından keçən millisaniyələr" idi — 8 × 10⁶⁷ lazım olan bir dünyada, yalnız 86,400,000 səhifəsi olan kitabdan səhifə nömrəsi. Hücumçular qarışdırmayı sındırmadılar; eyni kitabı oxudular və kartlar uyğun gələnə qədər sadəcə hər səhifəni yoxladılar.

## Demək olar ki, hər şeyin arxasındaki generator {/*the-generator-behind-almost-everything*/}

Middle-square o qədər sadə bir dizayna uduzdu ki, onun bütün hissələrini artıq tanıyırsınız. **Linear congruential generator** — LCG — `s` vəziyyətini saxlayır və onu bir sətirlə addımlayır:

```
s = (a · s + c)  mod  m
```

Vur, topla, bük. Bu, Dərs 2-nin odometri xalat geymiş halıdır: `mod m` sizin ilk dəfə 8-bitlik sayğacın 255 → 0 keçidi kimi gördüyünüz rollover-dir, burada isə bug yaratmaq yerinə faydalı iş görür. Hər dəyər `0 … m−1` aralığında qalır, deməli vəziyyət sahəsi `m`-dir və period heç vaxt onu keçə bilməz — odometrin çevrəsi **kitabın uzunluğudur**.

<Diagram name="randomness/prng_machine" height={340} width={720} alt="A left-to-right pipeline. On the left, a blue-tinted box labeled 'seed' holding the monospace value 1337, annotated 'the only input'. An arrow leads to a middle box labeled 'internal state' holding a monospace s. Below that box, connected by a pair of red arrows forming a loop down and back up, sits a red-tinted box holding the formula s = (a times s + c) mod m, annotated 'multiply, add, wrap — the odometer, again'. From the state box an arrow leads right to a blue-tinted box labeled 'output' holding the monospace sequence 4, 1, 6, 5, and an ellipsis. On the right sits a dashed circle of twelve evenly spaced dots with one dot highlighted in blue, captioned 'finite state, so it repeats' and labeled 'the period' underneath. A caption across the bottom reads: same seed, same stream, on every machine, forever.">

Bütün arxitektura: bir ədəd gizli vəziyyət, bir hesablama addımı, bir çıxış. Vəziyyət sonlu olduğu üçün həmin halqadaki nöqtələr maşının sahib olacağı hər şeydir — gec ya tez o, başlanğıca qədər dövrə vurur.

</Diagram>

Birini əllə işlədək. `a = 5`, `c = 3`, `m = 16`, seed 7:

```
 s = (5·7  + 3) mod 16 = 38 mod 16 =  6
 s = (5·6  + 3) mod 16 = 33 mod 16 =  1
 s = (5·1  + 3) mod 16 =  8 mod 16 =  8
 s = (5·8  + 3) mod 16 = 43 mod 16 = 11

 tam gediş: 7 6 1 8 11 10 5 12 15 14 9 0 3 2 13 4 → 7 …

 təkrarlanmadan əvvəl 16 fərqli dəyər — 0…15 aralığındaki hər dəyər
 dəqiq bir dəfə, sonra seed-ə qayıdış. Period = 16 = m, maksimum ✓
```

Tam period-a çatmaq avtomatik deyil; bu, `a`, `c` və `m`-in konkret bir ədədlər nəzəriyyəsi şərtini ödəməsini tələb edir (**Hull–Dobell teoremi**), və səhv etmək asandır. Eyni `a` və `m` ilə `c = 0` qoyun və 8-dən başlayın: 5 × 8 = 40, və 40 mod 16 = 8. Generator əbədi olaraq 8 çıxaracaq. Bir səhv parametr seçimi və sizin "təsadüfi" mənbəniz sabitə çevrilir.

Determinizm gizli də deyil — hər dil onu üzə çıxarır, və bu, PRNG haqqında ən faydalı şeydir:

<TerminalBlock>

python3 -c "import random; random.seed(42); print([random.randint(1,6) for _ in range(8)])"
[6, 1, 1, 6, 3, 2, 2, 2]

python3 -c "import random; random.seed(42); print([random.randint(1,6) for _ in range(8)])"
[6, 1, 1, 6, 3, 2, 2, 2]

</TerminalBlock>

Eyni səhifə nömrəsi, eyni rəqəmlər — sizin maşınınızda da, bugün də, on il sonra da. Həmin səkkiz "zər atışı" 42 seçildiyi anda təsbit olundu; kompüter sadəcə onları oxudu. Seed-i buraxsanız, runtime sizin üçün səhifə seçir, deməli ədədlər hər işə salışda dəyişir — amma mexanizmdə heç nə dəyişməyib.

<DeepDive>

#### Təsadüfi ədədlər əsasən müstəvilərə düşür {/*random-numbers-fall-mainly-in-the-planes*/}

Tarixdə ən nəticəli pis generator 1960-cı illərin əvvəlində IBM-dən çıxdı və adı **RANDU** idi: `a = 65539`, `c = 0`, `m = 2³¹`. O dövrdə aparılan testlərdən keçdi. Çıxışı siyahı kimi qaydasında görünür; ardıcıl dəyər cütlərini qrafikə çəkin, yenə də qaydasında görünür.

Sonra 1968-ci ildə riyaziyyatçı George Marsaglia *Random numbers fall mainly in the planes* adlı məqalə nəşr etdi və göstərdi ki, bütün LCG-lərin yüksək ölçülərdə gizli qəfəs strukturu var — və RANDU-nun strukturu fəlakətli idi. Onun çıxışını üç-üç götürüb kubda `(x₁,x₂,x₃)` nöqtələri kimi baxın, düzgün bucaqdan:

<DiagramGroup>

<Diagram name="randomness/randu_planes" height={320} width={340} alt="A square plot frame containing 2,400 small red dots plotted from consecutive RANDU triples, viewed at the angle where the planes are edge-on. The dots form fifteen sharply separated horizontal stripes with completely empty white space between them. Title above reads 'RANDU (IBM, 1963)', subtitle '2,400 consecutive triples, viewed edge-on', caption below in red reads 'every point lands on one of 15 planes'.">

Həqiqi RANDU çıxışı, heç nə yenidən düzülməmiş. Onun *ümumiyyətlə* yarada biləcəyi hər üçlük bu təbəqələrin üzərində dayanır; aralarındaki boşluq əlçatmazdır.

</Diagram>

<Diagram name="randomness/good_prng_cloud" height={320} width={340} alt="A square plot frame of identical size containing 2,400 small blue dots from a modern generator, plotted at exactly the same viewing angle as the neighbouring RANDU figure. The dots form one evenly filled cloud with no stripes, gaps, or alignment. Title above reads 'a modern generator', subtitle '2,400 triples, identical viewing angle', caption below in blue reads 'no plane, no lattice, no structure'.">

Eyni bucaqda müasir generator. "İstifadə edilə bilən nümunə yoxdur" belə görünür — Dərs 9-un sıxılma tərifi, gözlə görünən halda.

</Diagram>

</DiagramGroup>

Say təxmini deyil. RANDU-nun çıxışları dəqiq `9xₖ − 6xₖ₊₁ + xₖ₊₂ ≡ 0 (mod 2³¹)` eyniliyinə tabedir, bu da `9xₖ − 6xₖ₊₁ + xₖ₊₂` ifadəsini 2³¹-in dəqiq 15 qatından birinə bərabər olmağa məcbur edir — **on beş müstəvi**, artıq yox, və yuxarıdaki fiqur həmin faktın miqyasla çəkilmiş halıdır.

Nə üçün əhəmiyyətli idi: RANDU 1960 və 70-ci illər boyu IBM mainframe-lərində standart generator idi — məhz Monte Carlo simulyasiyasının fizika və kimyada adi praktikaya çevrildiyi dövrdə. Təsadüfi ədədləri üç-üç istehlak edən hər simulyasiya — məsələn, bir zərrəciyin x, y, z koordinatları — həcm yerinə 15 təbəqədən ibarət bir çoxluğu səssizcə seçirdi. Heç nə çökmədi. Nəticələr sadəcə incə, yoxlanılması mümkün olmayan şəkildə səhv çıxdı, və bugünə qədər heç kim həmin dövrün neçə nəşr olunmuş nəticəsinin təsirləndiyini deyə bilmir. Bu, bu modulun ən qədim düşməninin ən saf formasıdır: **səssiz səhv data**, heç bir istisna atılmadan, iyirmi il boyunca.

</DeepDive>

## Period və Twister {/*period-and-the-twister*/}

Period kitabın uzunluğu isə, aşkar təkmilləşdirmə daha uzun kitabdır — və burada mühəndislik möhtəşəm nəticə verdi. **Mersenne Twister** (Makoto Matsumoto və Takuji Nishimura, 1997) bir ədəd vəziyyət yerinə 624 ədəd saxlayır, və onun period-u **2¹⁹⁹³⁷ − 1**-dir: təxminən 6,002 rəqəm uzunluğunda bir ədəd. 6,002 deyil — altı min *rəqəm*. Miqyas üçün: müşahidə olunan kainatda təxminən 10⁸⁰ atom var, yəni 81 rəqəmli ədəd. Saniyədə bir milyard ədəd çəkib kainatın yaşı boyu davam etsəniz, ardıcıllığa nəzərəçarpan çentik də vurmazsınız.

O həm də statistik olaraq mükəmməldir — RANDU zolaqları yoxdur, yüksək ölçülərdə bərabərdir — və bu səbəbdən Python, Ruby, PHP, R və MATLAB-da standart generator oldu. Yuxarıdaki terminal blokundaki `random` modulu Mersenne Twister-dir.

Və o, sirr tələb edən heç nə üçün tam təhlükəsiz deyil. Məntiqi izləyin, çünki onun forması ümumiləşir: generatorun bütün gələcəyi onun 624 sözlük vəziyyəti ilə müəyyən edilir, və həmin sözlər *çıxışın özüdür*, yalnız geri qaytarıla bilən bir qarışdırma addımı ilə yüngülcə çalınmış. **624 ardıcıl çıxışı** müşahidə edin, qarışdırmanı tərsinə çevirin, və vəziyyəti dəqiq bərpa etmiş olacaqsınız — bundan sonra onun yaradacağı hər ədədi və artıq yaratdığı hər ədədi hesablaya bilərsiniz. Kobud güc yoxdur, seed təxmini yoxdur, yamaq olunacaq zəiflik yoxdur: bu, hesablamadır və millisaniyələr çəkir.

Bu, bug hesabatı deyil — Matsumoto və Nishimura bunu ilkin məqalələrində özləri deyirlər. Bu, spesifikasiyadır. Və bu, birinci bölmədəki cədvəlin iti kənarıdır: bir generator *statistik olaraq qüsursuz* və *eyni zamanda asanlıqla təxminedilən* ola bilər. Bunlar bir-birindən asılı olmayan xassələrdir, və onlardan yalnız biri parol sıfırlama linkini qoruyur.

<Pitfall>

**`Math.random()` sirr mənbəyi deyil.**

Səhv hər dildə aynıdır: rəqibin istədiyi bir şey üçün rahat daxili funksiyadan istifadə etmək. JavaScript-də `Math.random()`, Python-da `random.random()`, C-də `rand()` — hamısı sürətli, hamısı statistik olaraq layiqli, hamısı *öz çıxışından bərpa edilə bilən*. Onlardan qurulmuş hər token, açar, parol, sessiya ID-si, kupon kodu, ya da pul qoyulmuş qarışdırma prinsipcə, çox vaxt isə praktikada təxmin edilə biləndir.

Düzəliş daha böyük ədəd deyil, fərqli funksiyadır. Hər platforma sürətli generatorun yanında **CSPRNG** — kriptoqrafik olaraq təhlükəsiz generator — göndərir:

```
JavaScript   crypto.getRandomValues(new Uint8Array(32))   ·   crypto.randomUUID()
Node.js      crypto.randomBytes(32)
Python       secrets.token_hex(32)          (random.* deyil)
Java         new SecureRandom()             (new Random() deyil)
Go           crypto/rand                    (math/rand deyil)
C / POSIX    getrandom(2)                   (rand() deyil)
```

Ardıcıl iki dərs: Dərs 8-in qaydası bu idi ki, CRC "bu, təsadüfən zədələnibmi?" sualına cavab verir, heç vaxt "kimsə müdaxilə etdimi?" sualına yox. Bu dərsin qaydası eyni formadadır. `Math.random()` "bu, nümunəsiz görünürmü?" sualına cavab verir, heç vaxt "rəqib bunu təxmin edə bilərmi?" sualına yox. Əslində verdiyiniz suala cavab verən alətə uzanın.

Yanında daha kiçik bir tələ də gəlir: **modulo bias**. Təsadüfi baytı `%` ilə daha kiçik aralığa sıxmaq, aralıq 256-nı bölmürsə, bərabər bölünmür.

```js
const counts = Array(10).fill(0);
for (let b = 0; b < 256; b++) counts[b % 10]++;
console.log(counts);
```

<ConsoleBlock level="info">

[26, 26, 26, 26, 26, 26, 25, 25, 25, 25]

</ConsoleBlock>

0–5 rəqəmləri 256 bayt dəyərindən 26-sını alır; 6–9 rəqəmləri 25-ini — yəni aşağı rəqəmlər **4% daha ehtimallıdır**, daimi olaraq, yuxarıdaki generator nə qədər mükəmməl olsa da. Zər oyununda zərərsiz, lotereyada ya açarda ölümcül. Düzəlişi rejection sampling-dir: artıq qalan dəyərləri (burada 250–255 baytları) atıb yenidən çəkmək — `crypto.randomInt` və oxşarları sizin üçün məhz bunu edir.

</Pitfall>

## Təəccüb əslində haradan gəlir {/*where-the-surprise-actually-comes-from*/}

Hər PRNG problemi bir addım yuxarıya ötürür: ardıcıllıq yalnız səhifə nömrəsi qədər təxminedilməzdir. Beləliklə, deterministik maşın heç kimin təxmin edə bilməyəcəyi səhifə nömrəsini haradan alır? O, hesablamayı dayandırıb **fiziki dünyanı ölçməyə** başlayır.

Əməliyyat sisteminiz **entropy pool** işlədir: heç kimin nanosaniyə dəqiqliyi ilə təxmin edə bilməyəcəyi şeylərin vaxtını ölçərək doldurduğu bir su anbarı. Bir düyməni basdığınız dəqiq mikrosaniyə. Şəbəkə paketlərinin gəlişləri arasındaki titrəyiş. Disk axtarışının həqiqətən nə qədər çəkdiyi. Interrupt-ların nə vaxt işə düşdüyündəki kiçik dəyişkənlik. Müasir CPU-lar xüsusi aparat da daxil edir — Intel-in `RDRAND`-ı, ARM-in `RNDR`-i — **istilik küyünü** ölçən, yəni rezistordaki elektronların həqiqətən kvant titrəyişini, ki bu, mürəkkəb olduğu üçün deyil, fizika belə dediyi üçün təxminedilməzdir.

<Diagram name="randomness/entropy_pipeline" height={340} width={720} alt="A left-to-right pipeline. On the left, four stacked grey boxes list physical noise sources: key and mouse timing, disk and network jitter, chip thermal noise, and a wall of lava lamps, jointly labelled 'unpredictable physical events'. Four thin arrows converge from them into a blue-tinted rounded box in the centre labelled 'entropy pool' holding the monospace text 256 bits and the note 'of real surprise'. An arrow leads right into a red-tinted box labelled CSPRNG containing the words 'one-way' and the note 'no rewind'. A final arrow leads right to the words 'endless keys and tokens'. Two captions run along the bottom: '2 to the 256 possible starting points — no one can search them, and the output cannot be run backwards' and, in red, 'the whole edifice rests on the pool being genuinely unpredictable'.">

Bir dəfə yığ, əbədi genişləndir: fiziki küy hovuzu doldurur, hovuz birtərəfli generatoru işə salır, generator isə maşının ehtiyac duyacağı hər açarı və token-i verir.

</Diagram>

Buradaki iqtisadiyyat üzərində dayanmağa dəyər, çünki bunun ümumiyyətlə işləməsinin səbəbi elə budur. Hər təsadüfi ədəd üçün təzə fiziki ölçmə **lazım deyil** — bu, hədsiz yavaş olardı. Sizə bir dəfə təxminən **256 bit** həqiqi entropy lazımdır, CSPRNG isə onu sonsuz axına uzadır. 256 niyə əbədi kifayətdir? Çünki 2²⁵⁶ təxminən 10⁷⁷-dir, və Dərs 2-nin sayma arqumentləri tam gücü ilə keçərlidir: bu kainatda mövcud olan heç bir aparat, enerji ya vaxt bu ölçüdə sahəni axtara bilməz. Hovuzun işi səhifə nömrəsini tapılmaz etməkdir; CSPRNG-nin işi kitabı tərsinə oxunmaz saxlamaqdır — onun çıxışları birtərəflidir, deməli bir giqabayt çıxış görmək sizə vəziyyət haqqında və ya əvvəl nə olduğu haqqında heç nə demir. Mersenne Twister-də çatışmayan məhz bu xassədir.

Hər Unix maşınında hovuzun bir fayl adı var, və onu oxumaq sizə heç kimin — sizin də — təxmin edə bilməyəcəyi on altı bayt verir:

<TerminalBlock>

head -c 16 /dev/urandom | od -A x -t x1z
000000 fd ee 99 38 e9 cc 33 03 45 50 0f a4 12 a9 07 96  >...8..3.EP......<

head -c 16 /dev/urandom | od -A x -t x1z
000000 a0 0d 85 ec ab 19 9e 53 e0 7c c6 cd 45 2a d6 17  >.......S.|..E*..<

</TerminalBlock>

Bunlar real hovuzdan real baytlardır — və son davamlılıq yoxlaması: onların axınını gzip-ə verin, o, tam olaraq Dərs 9-un ölçdüyü kimi bir bayt da sıxmaqdan imtina edəcək. Sıxılmaz və təxminedilməz olmaq eyni cümlənin iki tərəfdən oxunuşu imiş.

<Note>

`/dev/random`-un "təhlükəsiz olanı", `/dev/urandom`-un isə "sürətli, zəif olanı" olduğu, açarlar üçün birincini seçməli olduğunuz folkloru eşitmiş ola bilərsiniz. Müasir Linux-da bu, səhvdir və aktiv şəkildə zərərlidir: hovuz boot vaxtı bir dəfə işə salındıqdan sonra hər ikisi eyni kriptoqrafik generatordan çəkir, və entropy oxumaqla "istifadə edilib qurtaran" bir yanacaq deyil. `/dev/random`-un köhnə bloklama davranışı heç bir təhlükəsizlik almırdı və serverlər heç vaxt lazım olmayan entropy-ni gözləyərək dayandığı üçün real kəsintilər yaradırdı. Cari tövsiyə sadədir: `getrandom(2)`, ya `/dev/urandom`, ya da dilinizin CSPRNG örtüyünü istifadə edin və narahat olmağı buraxın.

</Note>

Və entropy boot zamanı qiymətli olduğu üçün — təzə yaradılmış virtual maşında siçan yoxdur, klaviatura yoxdur və disk tarixi çətinliklə var, ki bu, həqiqətən təhlükəli bir andır — bəzi təşkilatlar onu doldurmaqda teatral davranırlar. Cloudflare-in San-Fransisko lobbisində **lava lampalarından ibarət divar** var, davamlı çəkilir; xaotik ləkələr (üstəgəl keçən işçilərin və kölgələrin verdikləri) onların sistemləri üçün bir neçə entropy girişindən birinə çevrilir. London ofisi xaotik rəqqaslardan, Sinqapur ofisi isə radioaktiv mənbədən istifadə edir. Doğrudur, bu, əsasən yaxşı anlaşılmış bir prinsip üçün gözəl marketinqdir — amma prinsip dəqiqdir: həqiqi təsadüfilik almaq üçün hesablamadan çıxıb kainatın hələ qərar vermədiyi bir şeyi ölçməlisiniz.

## Üç fəlakət, bir kök səbəb {/*three-catastrophes-one-root-cause*/}

Poker sındırması təkbaşına hadisə deyildi. Budur eyni uğursuzluq üç fərqli miqyasda, və hər birində alqoritm qaydasında, *səhifə nömrəsi* isə fəlakət idi.

**Netscape, sentyabr 1995.** Berkeley-dən iki aspirant, Ian Goldberg və David Wagner, Netscape Navigator-un gənc veb-dəki hər SSL bağlantısını qoruyan generatoru necə işə saldığını tərsinə mühəndisliklə açdılar. Seed günün vaxtından, proses ID-sindən və valideyn proses ID-sindən gəlirdi — eyni maşındaki hücumçunun böyük ölçüdə müəyyən edə, qalanını isə brute force ilə tapa biləcəyi dəyərlər. Açarın uzunluğu əhəmiyyətsiz idi: onlar sessiya açarlarını təxminən bir dəqiqədə bərpa etdilər. Brauzer 128-bitlik təhlükəsizlik reklam edirdi, çəkdiyi səhifə nömrəsində isə bir neçə onluq bit həqiqi qeyri-müəyyənlik var idi.

**Debian, may 2008.** Bir təchizatçı, yaddaş yoxlama alətinin xəbərdarlıqlarını qovarkən, OpenSSL-in generatoruna təxminedilməz data verən bir kod sətrini sildi. Hovuzu qidalandırmaq üçün qalan şey, əslində, **proses ID-si** idi — və Linux proses ID-ləri 32,768-də bitir. Təxminən iki il boyunca Debian və Ubuntu-da yaradılan hər SSH açarı, hər SSL sertifikatı və hər sessiya açarı **açar tipi üzrə təxminən 32,768 ehtimaldan** ibarət bir dəstdən gəlirdi — tam şəkildə yaradılıb axtarış faylı kimi nəşr olunacaq qədər kiçik bir dəst, ki insanlar bunu dərhal etdilər. Aradan qaldırma illər çəkdi: hər açarı yenidən yarat, hər sertifikatı ləğv et, yer üzündəki hər `authorized_keys` faylını yoxla. İki simvol yaxşı niyyətli təmizlik, bir kommentə alınmış sətir, və internetin böyük bir hissəsinin kriptoqrafik açarları sayıla bilən hala düşdü. (Formaya diqqət yetirin: kod hələ də *işləyirdi*, açarlar hələ də *qəbul olunurdu*, heç nə çökmədi.)

**PlayStation 3, dekabr 2010.** fail0verflow qrupu 27C3 konfransında göstərdi ki, Sony-nin kod imzalamasında az qala komik sadəlikdə bir qüsur var. ECDSA imza alqoritmi hər imza üçün təzə, gizli, təxminedilməz təsadüfi ədəd tələb edir — və eyni ədəd iki fərqli imza üçün təkrar istifadə olunsa, elementar cəbr gizli açarı bərpa edir. Sony **sabit** istifadə etmişdi. Hər imzada, təsadüfi tələb olunan yerdə eyni dəyər. Konsolun ana imzalama açarı iki imzalanmış fayldan düşdü, və Sony bunu proqram təminatı ilə düzəldə bilməzdi.

Nümunə öz sistemlərinizi yoxlaya biləcəyiniz qədər dəqiqdir: heç kim riyaziyyata hücum etməmişdi. Hər halda generator düzgün formada idi və *seed-in entropy-si* çox kiçik, çox strukturlu ya da sıfır idi — və hər halda sistem işləməyə davam edirdi, əminliklə, kimsə ehtimalları sayana qədər tam təsadüfi görünən çıxış istehsal edərək.

<DeepDive>

#### Seed bir superqüvvə kimi {/*the-seed-as-a-superpower*/}

Determinizm bu dərsin qəhrəman-əleyhdarı oldu. Onu tərsinə çevirin: təhlükəsizlik sütunundan kənarda hər şey üçün seed-in dəqiq təkrar oynanması mühəndislikdəki ən faydalı xassələrdən biridir.

**Debug və test.** Girişi qarışdıran və həftədə bir dəfə uğursuz olan test bir kabusdur — o, seed-ini loglamırsa. Loglayırsa, uğursuzluq geri yapışdırıb əbədi olaraq təkrar yarada biləcəyiniz bir ədədə çevrilir. Ciddi fuzzing alətləri belə işləyir: doqquz saatlıq təsadüfi girişdən sonra tapılan çökmə bir seed kimi bildirilir və bütün doqquz saat saniyələr içində təkrar oynanılır. Təsadüfi bir şey yazırsınızsa, seed-i çap edin. Gələcəkdəki siz təşəkkür göndərəcək.

**Təkrar yaradıla bilən elm və maşın öyrənməsi.** Model təlimi təsadüfiliklə doymuşdur — çəki inisializasiyası, data qarışdırması, dropout. Yenidən işlədilə bilməyən nəşr olunmuş nəticə çətinliklə nəticədir, ona görə təlim skriptinin ilk sətirləri hər generatoru sabit seed-ə bağlayır. Eyni səhifə nömrəsi, eyni model.

**Heç nədən dünyalar.** Minecraft bütöv bir dünyanı — relyef, mağaralar, filizlər, kəndlər — tək bir 64-bitlik seed ilə təsvir edir, buna görə oyunçular seed-ləri koordinat kimi mübadilə edir: kiməsə həmin ədədi versəniz, o, sizin dəqiq mənzərənizdə öz maşınında gəzir. Bu, səkkiz bayta sığan bir ədəddən **2⁶⁴**, təxminən 1.8 × 10¹⁹ fərqli dünya deməkdir. *No Man's Sky* eyni ideyanı 18 kvintilyon planetə çatdırdı. Heç nə saxlanılmır; dünya yüklənmir, *yenidən hesablanır* — Dərs 9-un dərhal tanıyacağı son həddə sıxılma: öz çıxışının yerinə keçən generativ proqram.

Birləşdirici ideya: seed ixtiyari uzunluqda ardıcıllığın yığcam, daşınabilən adıdır. Bunun superqüvvə ya fəlakət olması tamamilə həmin adın sirr olub-olmamasından asılıdır.

</DeepDive>

## Bir seed-i özünüz sındırın {/*crack-a-seed-yourself*/}

Nəzəriyyə bəsdir — poker hücumunu təkrar yaradın. Aşağıda gizli bir seed **4,096** ehtimaldan seçilmişdir, kiçik bir LCG isə onu zər atışlarına çevirir. Bir neçə dəfə atın. Hər atışdan sonra panel 4,096 seed-dən neçəsinin gördüyünüz hər şeyi yarada biləcəyini yenidən sayır — həmin ədədin çökməsini izləyin. Dəqiq bir namizəd qaldıqda maşın sizin səhifə nömrənizi bilir, və növbəti beş atışı **siz onları atmadan əvvəl** çap edəcək:

<Sandpack>

```js
import { useState } from 'react';

const M = 4096, A = 1229, C = 1;
const step = (s) => (A * s + C) % M;
const face = (s) => (s % 6) + 1;

export default function SeedCracker() {
  const [hidden, setHidden] = useState(() => Math.floor(Math.random() * M));
  const [state, setState] = useState(null);
  const [rolls, setRolls] = useState([]);

  const roll = () => {
    const s = step(state === null ? hidden : state);
    setState(s);
    setRolls([...rolls, face(s)]);
  };
  const reset = () => {
    setHidden(Math.floor(Math.random() * M));
    setState(null); setRolls([]);
  };

  const left = [];
  for (let c = 0; c < M; c++) {
    let t = c, ok = true;
    for (const r of rolls) {
      t = step(t);
      if (face(t) !== r) { ok = false; break; }
    }
    if (ok) left.push(c);
  }

  const cracked = left.length === 1;
  const future = [];
  if (cracked) {
    let t = left[0];
    for (let i = 0; i < rolls.length; i++) t = step(t);
    for (let i = 0; i < 5; i++) { t = step(t); future.push(face(t)); }
  }

  return (
    <div style={{ fontFamily: 'system-ui', textAlign: 'center' }}>
      <p>Rolls so far:</p>
      <div style={{ fontFamily: 'monospace', fontSize: 26, minHeight: 34 }}>
        {rolls.join('  ') || '\u2014'}
      </div>
      <div style={{ margin: 10 }}>
        <button onClick={roll} style={{ fontSize: 15, marginRight: 8 }}>
          roll the die
        </button>
        <button onClick={reset} style={{ fontSize: 15 }}>new hidden seed</button>
      </div>
      <div style={{
        height: 10, background: '#8882', borderRadius: 5, margin: '0 auto',
        width: 280, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: `${(left.length / M) * 100}%`,
          background: cracked ? '#c1554d' : '#087ea4'
        }} />
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 17 }}>
        seeds still possible: {left.length} / {M}
      </p>
      {cracked ? (
        <div style={{ color: '#c1554d' }}>
          <p><b>Seed found: {left[0]}.</b> Your next five rolls will be:</p>
          <p style={{ fontFamily: 'monospace', fontSize: 24 }}>
            {future.join('  ')}
          </p>
          <p style={{ fontSize: 13 }}>Keep rolling and check.</p>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#888' }}>
          Every roll rules out the seeds that would have produced
          something else.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Adətən beşdən səkkizə qədər atış kifayət edir — çünki altı üzlü zərin hər atışı sağ qalanların təxminən beş-altıda birini kənarlaşdırır, və 4,096 bunun çox turunu yaşamır. Sonra hücumçuya seed sahəsinin əslində nəyə başa gəldiyinə diqqət yetirin: 4,096 = 2¹², deməli bu generatorun ümumilikdə, əbədi olaraq **12 bit entropy** var. Poker qarışdırmasında təxminən 26 idi. Real açarda 256-dır, və eyni brute force dövrəsi — həmin iyirmi sətir kod — ilk keçidini bitirmək üçün kainatın mövcud olduğundan uzun vaxta ehtiyac duyardı.

<Recap>

- CPU deterministikdir, deməli təsadüfiliyi *yarada* bilməz — yalnız sabit ardıcıllığı **təkrar oynaya** bilər. **PRNG** ictimai ədədlər kitabıdır; **seed** açdığınız səhifədir; alqoritm sirr deyil, deməli bütün qorunmanız səhifə nömrəsində yaşayır.
- Sonlu vəziyyət təkrarı zəmanətləyir: hər generatorun bir **period**-u var. Middle-square (von Neumann, 1946) tez ölür — 2916-dan dörd addımda dövrəyə düşür, ya da daimi 0000-a çürüyür — çünki bütün gələcəyi bir 4 rəqəmli ədəddir.
- **LCG**, `s = (a·s + c) mod m`, Dərs 2-nin odometrinin faydalı iş görməsidir; period `m`-i keçə bilməz, pis parametrlər isə onu 1-ə çökdürə bilər. IBM-in **RANDU**-su qaydasında görünürdü və yaratdığı hər üçlüyü dəqiq **15 müstəvi** ilə məhdudlaşdırırdı, iyirmi illik Monte Carlo simulyasiyasını səssizcə korlayaraq — səssiz səhv data, heç bir istisna atılmadan.
- **Statistik** və **kriptoqrafik** təsadüfilik fərqli işlərdir. **Mersenne Twister**-in period-u 2¹⁹⁹³⁷ − 1-dir (təxminən 6,002 rəqəm) və statistikası əladır, buna baxmayaraq **müşahidə olunan 624 çıxış onun bütün vəziyyətini** və deməli bütün keçmiş və gələcəyini açır. Əla olmaq və təxminedilən olmaq bir araya sığır.
- Rəqibin istədiyi hər şey üçün **CSPRNG** istifadə edin: `crypto.getRandomValues`, `crypto.randomBytes`, `secrets`, `SecureRandom`, `getrandom(2)` — heç vaxt `Math.random()`/`rand()`. **Modulo bias**-dan çəkinin: `byte % 10` 0–5 rəqəmlərini 4% daha ehtimallı edir.
- Həqiqi təəccüb **fizikadan yığılır** — interrupt və düymə vaxtları, disk titrəyişi, çip üzərində istilik küyü, lava lampaları — bir **entropy pool**-a. Təxminən **256 bit**, bir dəfə, əbədi kifayətdir, çünki CSPRNG onu birtərəfli genişləndirir və 2²⁵⁶ axtarıla bilməz.
- Üç fəlakət, bir kök səbəb — təxmin edilə bilən səhifə nömrəsi: **Netscape 1995** (seed saat + PID-lərdən, açarlar təxminən bir dəqiqədə bərpa olundu), **Debian 2008** (entropy process ID-yə endi → iki il boyunca ~32,768 mümkün açar), **PS3 2010** (ECDSA təzə təsadüfi nonce tələb edən yerdə *sabit* → ana açar bərpa olundu).
- Seed-in determinizmi başqa hər yerdə **superqüvvədir**: təkrar yaradıla bilən testlər və fuzz çökmələri, təkrarlanan ML təlimi, və bütöv oyun dünyaları — Minecraft-ın 2⁶⁴ mənzərəsi — saxlanılmaq yerinə səkkiz baytdan yenidən hesablanır.

</Recap>

<Challenges>

#### Dəstəyi çevirin {/*turn-the-crank*/}

`s = (7·s + 4) mod 16` LCG-ni seed 1-dən başlayaraq təkrarlanana qədər əllə işlədin. Period nədir, və o, 0…15 aralığındaki hər dəyərə çatırmı? Sonra bir cümlə ilə izah edin: `m = 16` olan heç bir LCG-nin period-u niyə heç vaxt 20 ola bilməz?

<Hint>

Sadəcə dəstəyi çevirin: 7×1 + 4 = 11, deməli növbəti vəziyyət 11 mod 16-dır. Bir dəyər ikinci dəfə gələnə qədər davam edin. Son hissə üçün düşünün: neçə fərqli vəziyyət mövcuddur və bir vəziyyət təkrarlandığı an nə olur?

</Hint>

<Solution>

```
 s = (7·1  + 4) mod 16 =  11
 s = (7·11 + 4) mod 16 =  81 mod 16 =  1     ← artıq seed-in özü

 ardıcıllıq: 1 → 11 → 1 → 11 → …    period = 2
```

Period **2**-dir, və o, 16 mümkün dəyərdən yalnız 2-sini ziyarət edir — tamamilə hörmətəlayiq görünən parametrlərlə möhtəşəm bir uğursuzluq. (Hull–Dobell şərtini pozur: `m = 16` 4-ə bölünür, deməli tam period üçün `a − 1` 4-ə bölünməlidir, `a − 1 = 6` isə bölünmür.) Şərti ödəyən və 16 dəyərin hamısını gəzən dərsdəki `a = 5, c = 3` ilə müqayisə edin.

20-nin niyə mümkün olmadığı: yalnız 16 mümkün vəziyyət var, və bir vəziyyət təkrarlandığı **an** oradan sonraki bütün ardıcıllıq dəqiq təkrardır — maşının cari vəziyyətindən başqa yaddaşı yoxdur. Deməli period heç vaxt `m`-i keçə bilməz. Bu, middle-square-i öldürən eyni sayma arqumentidir, və "vəziyyəti böyüdün" (Mersenne Twister-in halında 624 söz) niyə kitabı uzadan tək dəstək olduğunun səbəbidir.

</Solution>

#### Poker qarışdırmalarını sayın {/*count-the-poker-shuffles*/}

Girişdəki rəqəmlər, düzgün şəkildə. (a) "Gecə yarısından keçən millisaniyələr"dən çəkilmiş seed neçə bit entropy daşıyır? (b) 52 kartın həqiqətən ədalətli qarışdırılması üçün nə qədər lazımdır? (c) Həmin proqram bütün mümkün dəstələrin hansı hissəsini paylaya bilərdi? log₂(52!) ≈ 225.6 istifadə edin.

<Solution>

**(a)** Seed sahəsi 86,400,000 dəyərdir (0-dan 86,399,999-a qədər).

```
log₂(86,400,000) ≈ 26.4 bit          (2²⁶ = 67,108,864 · 2²⁷ = 134,217,728,
                                      deməli 26 bitin bir az üstündə oturur) ✓
```

**(b)** Ədalətli qarışdırma 52! düzülüşdən hər hansı birini yarada bilməlidir, deməli ona **≈ 225.6 bit** lazımdır — deyək ki, 226.

**(c)** 86,400,000 ÷ 8.07 × 10⁶⁷ ≈ **1.07 × 10⁻⁶⁰**. Təxminən 10⁶⁰ dəstədən biri əlçatan idi; praktik olaraq hər mümkün poker əli həmin saytda sadəcə *baş verə bilməzdi*.

Fərq bütün hücumdur: **26 bit təklif olunub, 226 bit tələb olunur — 200 bit kəsir.** Və 26 bit "zəif şifrələmə" deyil, ümumiyyətlə şifrələmə deyil: 67 milyon namizəd noutbuk vaxtının bir hissəsidir, buna görə mühəndislər hər ehtimalı yenidən qarışdırıb müqayisə edə bildilər. Dərsin formasına diqqət yetirin — qüsur çıxışda görünməzdir (kartlar qarışmış görünürdü) və ehtimalları saydığınız an aşkardır. Ehtimalları saymaq bütün intizamdır.

</Solution>

#### Pull request-dəki token {/*the-token-in-the-pull-request*/}

Transfer tapşırığı. Bir pull request parol sıfırlama linkləri əlavə edir. Token generatoru budur:

```js
const token = Math.random().toString(36).slice(2);
```

Müəllifin PR təsviri deyir: *"Unikal 11 simvollu token yaradır. Dövrədə 10 milyon dəfə işlətdim və sıfır toqquşma aldım, deməli unikallıq sübut olunub. Linklər 24 saatdan sonra bitir."* Review yazın: toqquşma testinin nəyi sübut etdiyini və nəyi *etmədiyini* izah edin, konkret hücumu adlandırın, və birsətirlik düzəlişi verin.

<Solution>

**Testin sübut etdiyi:** token-lərin *unikal* olduğu — iki istifadəçi eyni token almır. Bu, real xassədir və sahib olmağa dəyər. **Toxunmadığı şey:** token-in *təxminedilməz* olub-olmaması, ki burada əhəmiyyət daşıyan yalnız budur, çünki hücumçu token ilə toqquşmağa çalışmır, o, token-i **təxmin edib** hesabı ələ keçirməyə çalışır. Unikallıq və təxminedilməzlik bir-birindən asılı deyil: `1, 2, 3…` ardıcıl sayğacı da heç vaxt toqquşmur və tamamilə təxmin ediləndir.

**Konkret hücum:** V8-də `Math.random()` sürətli, kriptoqrafik olmayan PRNG-dir (xorshift128+), deməli onun daxili vəziyyəti *öz çıxışından bərpa edilə bilər* — Mersenne Twister dərsi başqa kostyumda. Hücumçu idarə etdiyi hesablar üçün bir neçə parol sıfırlaması istəyir, öz token-lərini oxuyur, generatorun vəziyyətini bərpa edir, sonra həmin pəncərədə *bütün digər istifadəçilərə* verilmiş token-ləri hesablayır — admin-ə göndərilmiş sıfırlama linki də daxil olmaqla. Poçt tutmaq yoxdur, brute force yoxdur. Və iki ağırlaşdırıcı amil: `.toString(36).slice(2)` `Math.random()`-un ümumiyyətlə təklif etdiyi ~52 bitdən daha azı ilə dəyişkən uzunluqlu sətir verir, 24 saatlıq bitmə müddəti isə 24 saatlıq *etibarlılıq pəncərəsidir*, müdafiə deyil.

**Review şərhi:** *"Bloklayıcı — bu, təhlükəsizlik token-idir, deməli `Math.random()`-dan deyil, CSPRNG-dən gəlməlidir; onun çıxış axını bir neçə müşahidə olunan nümunədən bərpa edilə bilir, yəni öz hesabı üçün iki sıfırlama istəyən hücumçu sonra hər kəsin linkini proqnozlaşdıra bilər. Zəhmət olmasa `crypto.randomBytes(32).toString('hex')` (Node) ya da `crypto.getRandomValues` (brauzer) istifadə edin, 24 saatlıq bitməni saxlayın, və birdəfəlik istifadə üçün ləğvetmə əlavə edin. Gələcək üçün qeyd: toqquşma testi unikallığı ölçür, burada hücuma məruz qalan xassə isə o deyil."*

Daşınabilən qayda, və bu modulun eyni formanı üçüncü dəfə ifadə etməsidir: **aləti seçməzdən əvvəl əslində hansı xassəyə ehtiyacınız olduğunu soruşun.** CRC təsadüfi bütövlüyü sübut edir, müdaxiləni yox (Dərs 8). Checksum inventarı sübut edir, sıranı yox (Dərs 8). `Math.random()` heç nəyin nümunəli görünmədiyini sübut edir — heç vaxt heç nəyin təxmin edilə bilmədiyini. ✓

</Solution>

</Challenges>

<LearnMore title="Tranzistorlar və məntiqi qapılar" path="/learn/faza-0/modul-0-2/transistors-and-logic-gates">

Bu, modulu tamamlayır: datanın *nə olduğu* haqqında on dərs — bitlər, ədədlər, mənfilər, kəsrlər, byte sırası, mətn, piksellər və səs, bütövlük, sıxılma, və indi üstündəki süni təəccüb. Buraya qədər hər şey bunların hamısını saxlayan bir maşının mövcud olduğunu güman etdi. Növbəti modulda həmin maşını quracağıq — silisiumdan hazırlanmış, yalnız bir iş görə bilən tək bir açardan başlayaraq: başqa bir açarı yandırmaq ya söndürmək. Və həmin açarlardan ibarət bir yığının necə toplama edə bilən bir şeyə çevrildiyini kəşf edərək.

</LearnMore>