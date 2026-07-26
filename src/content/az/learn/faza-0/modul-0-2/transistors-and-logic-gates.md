---
title: "Transistor-lar və Logic Gate-lər"
---

<Intro>

1854-cü ildə George Boole adlı ingilis riyaziyyatçısı bir kitab dərc etdi və orada iddia edirdi ki, insan düşüncəsi cəbr şəklində yazıla bilər. Adi cəbrdə ədədlər olan yerdə onunkunda düz iki dəyər vardı — true və false; adi cəbrdə toplama və vurma olan yerdə isə onunkunda *or* və *and* dayanırdı. Kitabın adını *An Investigation of the Laws of Thought* qoymuşdu və bunu hərfi mənada nəzərdə tuturdu: inanırdı ki, zehnin mexanikasını yazıya alır. On il sonra öldü və sisteminin heç bir yerdə istifadə olunduğunu görmədi. Həmin kitabdan səksən üç il sonra MIT-də 21 yaşlı bir aspirant otaq boyda, klik-klik edən elektrik relay-ləri ilə dolu mexaniki kalkulyatora baxım edən darıxdırıcı bir işdə çalışırdı və heç kimin diqqət etmədiyi bir şeyi gördü: **Boole-un cəbri düşüncənin təsviri deyildi. O, bir naqil sxemi idi.** Relay ya açıqdır, ya bağlı — iki dəyər. Ardıcıl qoşulmuş iki relay tam olaraq Boole-un *and*-i kimi davranır. Yan-yana qoşulmuş ikisi isə onun *or*-u kimi. Claude Shannon bunu 1937-ci ildə magistr tezisi kimi yazdı və beləcə dünyaya açarlardan zehin qurmağın təlimatını verdi. (Shannon-la əvvəl də görüşmüsən: on bir il sonra **bit** sözünü adlandıran məqaləni yazacaqdı, Dərs 1.) On dərs sənə bir bit-in nə *demək olduğunu* öyrətdi. Bu dərsdə bit nəhayət əlinlə tuta biləcəyin fiziki bir şeyə çevrilir — və bir parça silisium qərar verməyə başlayır.

</Intro>

<YouWillLearn>

- Bit fiziki olaraq **nədir** — bir gərginlik, üstəgəl threshold-un harada dayandığına dair bir müqavilə
- Rəqəmsal dünyanın niyə məhz iki state üzərində qurulduğunu və bu seçimin data-nı noise-dan necə qoruduğunu
- **Transistor**-un əslində nə etdiyini: dəstəyi başqa bir tel olan, hərəkət edən hissəsi olmayan açar
- **Series** qoşulmuş açarların necə AND-a, **parallel** qoşulmuşların necə OR-a çevrildiyini — bütün təməl, iki şəkildə
- Yadda saxlamağa dəyən yeddi gate-i, onların truth table-larını və bir circuit-i əllə necə izləməyi
- Real NAND gate-in niyə **4 transistor**-a, AND-ın isə 6-ya başa gəldiyini — və niyə bir tək gate tipi indiyə qədər mövcud olan bütün circuit-ləri qura bilər

</YouWillLearn>

## Bit, nəhayət, fiziki dünyada {/*a-bit-in-the-physical-world*/}

On dərsdir bit bir abstraksiya olub: 0 və ya 1, sxemdəki bir açar, haqqında düşünə bildiyin, amma toxuna bilmədiyin bir şey. İndi bütün bu müddət ərzində sakitcə təxirə salınmış suala cavab vermək vaxtıdır. **Bit nədən düzəlib?**

İndiyə qədər qurulmuş demək olar ki, hər kompüterdə cavab budur: **bir teldəki gərginlik**. Hamısı bu. Sıfır volta yaxın duran tel 0-dır; qidalanma gərginliyinə yaxın saxlanan tel isə 1.

Amma bunun necə bir cavab olduğuna dərhal fikir ver, çünki bu, kursun ən köhnə fikridir, sadəcə yeni paltarda. Gərginlik *kəsilməz* kəmiyyətdir — bir tel 0.3 voltda da dayana bilər, 1.7-də də, 2.85-də də. Təbiət sənə iki state vermir; sənə bir tənzimləyici dəstək verir. İki state *bizim tətbiq etdiyimiz* şeydir: biz bir threshold elan edirik və aradakı hər şeyi nəzərə almamağa razılaşırıq:

```
  3.3 V ──┬─────────────────────────
          │   1 kimi oxunur
  2.0 V ──┴─────────────────────────
              heç bir məna verilməyib
  0.8 V ──┬─────────────────────────
          │   0 kimi oxunur
  0.0 V ──┴─────────────────────────
```

Dərs 1-in ilk qaydası belə idi: **byte-ların mənası yoxdur — müqavilələrin var**. Bax burada həmin qayda bir mərtəbə də aşağıda: **voltların da mənası yoxdur.** 2.9 volt 1 deyil; o, 2.9 voltdur, sadəcə *bu çip ailəsi onu 1 adlandırmağa razılaşıb*. Çip ailəsini dəyiş, rəqəmlər də dəyişir — 5 V logic, 3.3 V, 1.8 V, müasir bir processor nüvəsinin içində isə xeyli aşağı, bir voltdan az. Bunların hər biri eyni fizika üzərində qurulmuş fərqli bir müqavilədir.

Və o ortadakı zolaq — heç bir məna verilməyən sahə — boş yerə sərf olunmuş yer deyil. O, kompüter tarixinin ən dəyərli dizayn qərarıdır, çünki sənə **noise immunity** qazandırır. Tutaq ki, bir çip 1 göndərmək üçün teli 3.3 V-a qaldırır, siqnal yolda maneə, müqavimət, qonşu teldən gələn crosstalk toplayır və 2.6 V-la gəlib çatır. Zədələnib — amma hələ də 2.0 V-dan rahatca yuxarıdadır, ona görə qəbuledici təmiz bir 1 oxuyur. Ən vacib hissə isə budur: o, zədələnmiş 2.6 V-u irəli ötürmür. Növbəti mərhələ üçün **təzə, tam gücündə 3.3 V** yaradır. Noise azaldılmır. O, *silinir*.

Elə buna görə on min dəfə kopyalanmış fayl orijinalla bit-bə-bit eynidir, halbuki fotosurətin fotosurətinin fotosurəti bulanıq bir ləkəyə çevrilir və kasetdən köçürülmüş kaset xışıldayır. Analoq siqnallar başlarına gələn hər zərbəni özlərində yığır. Rəqəmsal siqnallar isə hər mərhələdə yenidən mükəmməlliyə yuvarlaqlaşdırılır — və Dərs 7-nin birtərəfli qapısını xatırlayırsansa, bu, olduqca xoş bir tərsinə çevrilmədir: informasiyanı *kənara* atan quantization elə həmin sağ qalan informasiyanı dağıdılmaz edir.

## Dəstəyi tel olan açar {/*the-switch-whose-handle-is-a-wire*/}

İndi isə: bu açmağı-bağlamağı kim edir? Real hardware-in izi ilə get, çünki hər nəsil əvvəlkinin konkret bir qüsurunu düzəldir və bu ardıcıllıq müasir kompüterlərin niyə belə göründüyünü izah edir.

**Relay**-lər birinci gəldi — 1937-ci ildə Shannon-un baxdığı texnologiya. Relay bir elektromaqnitin bərkidildiyi mexaniki açardır: sarğıdan cərəyan keç, maqnit metal qolu dartsın, *ayrı* bir dövrə qapansın. Əsl əhəmiyyət daşıyan xüsusiyyət elə budur və onu yavaş-yavaş demək lazımdır, çünki bundan sonra gələn hər şey buna söykənir: relay **dəstəyi başqa bir tel olan açardır**. Adi işıq açarına barmaq lazımdır. Relay-i isə elektrik çevirə bilər — yəni bir açar başqa bir açarı çevirə bilər, yəni açarlar *otaqda heç kim olmadan* istənilən uzunluqda səbəb-nəticə zəncirlərinə düzülə bilər. Avtomatik hesablamanın bütün fikri elə budur və 1937-ci ildə əldə mövcud idi. Elektromexaniki hissələrdən qurulmuş Harvard Mark I saniyədə təxminən **3 toplama** edirdi — onun düşündüyünü görə, hətta eşidə bilərdin.

**Vacuum tube**-lar növbəti oldu; eyni işi hərəkət edən hissə olmadan görürdülər: qızmış bir filament elektronları qaynadıb çıxarır, bir şəbəkədəki kiçik gərginlik isə onlardan neçəsinin keçəcəyini idarə edir. Mexaniki heç nə olmaması fiziki olaraq tərpədiləsi heç nə olmaması deməkdir, ona görə tube-lar təxminən min dəfə sürətlə keçid edirdi. ENIAC (1945) təxminən saniyədə **5,000 toplama**-ya çatmaq üçün onlardan **17,468** ədəd istifadə etdi — Mark I-dən 1,600 dəfə sürətli. Hesab başqa valyutalarda gəldi: 27 ton, 150 kilovatt və ağ közərənə qədər qızıb yanan minlərlə şüşə balon; belə ki, dünyanın ən qabaqcıl kompüterini işlətməyin adi hissələrindən biri hansı tube-un öldüyünü axtarmaq idi.

**Transistor** qalanını düzəltdi. 16 dekabr 1947-ci ildə Bell Labs-da John Bardeen və Walter Brattain iki qızıl kontaktı olan bir parça germaniuma siqnal gücləndirtdilər; bir həftə sonra bunu rəhbərliyə nümayiş etdirdilər. William Shockley ilə birlikdə 1956-cı il Nobel Fizika mükafatını bölüşdülər. Ad şirkətin içində, *transresistance* sözündən yaradıldı və bu şeyi ən yaxşı relay-in arzusu kimi başa düşmək olar: bir tellə idarə olunan açar, hərəkət edən hissəsi yox, filamenti yox, demək olar ki, istiliyi yox, bərk materialdan düzəlib — və ən vacibi, **kiçildilə bilən**.

<Diagram name="transistors-and-logic-gates/transistor_switch" height={360} width={720} alt="Yan-yana üç panel, başlıq: 'dəstəyi başqa bir tel olan açar'. Sol panel, adı 'bir transistorun içi': boz silisium gövdə, hər iki ucunda tünd source və drain sahələri, gövdənin bir az üstündə qırmızı gate lövhəsi, ondan yuxarı gedən və gate yazılmış qırmızı çıxış, source ilə drain arasında kəsik mavi xətt üzərində channel yazısı, sahələrdən aşağı düşən və source, drain yazılmış çıxışlar; qeyddə yazılır: gate üzərindəki gərginlik channel-i açır və ya bağlayır. Orta panel, boz rəngdə 'gate = 0' başlığı: solda batareya, üst teldə qaldırılmış dəstək kimi çəkilmiş açıq açar və sağda yanmayan lampa olan sadə dövrə; açara qırmızı 'control wire' daxil olur; altyazı: açıq — cərəyan yoxdur. Sağ panel, mavi rəngdə 'gate = 1' başlığı: eyni dövrə, açar düz xətt kimi bağlanıb və lampa mavi şüalarla yanır; altyazı: bağlı — cərəyan axır. Aşağıdakı ümumi altyazı: hərəkət edən hissə yoxdur, yeyilib qurtaracaq bir şey yoxdur və saniyədə milyardlarla dəfə çevrilir.">

Bir transistor. Gate üzərindəki gərginlik source ilə drain arasındakı channel-in keçirici olub-olmayacağına qərar verir — yəni soldakı tel sağdakı dövrənin qoşulub-qoşulmayacağını həll edir.

</Diagram>

Bu sonuncu xüsusiyyət, kiçildilə bilmək, rəqəmlərin intuitiv olmağı dayandırdığı yerdir. Apple-ın M1-i (2020) kimi bir processor təxminən 120 mm²-lik bir kristalda — bir dırnaq boyda — təxminən **16 milyard** transistor saxlayır. Bu, kvadrat millimetrə **133 milyon açar** deməkdir və cibində itirə biləcəyin bir şeydə ENIAC-ın tube sayından təxminən **bir milyon dəfə** çox açar var. Onların hər biri saniyədə milyardlarla dəfə çevrilə bilər; 3 GHz-də bir təkan təxminən 333 pikosaniyə davam edir.

<Note>

Transistor kiçicik mexaniki açar deyil və balaca metal dəstək obrazını elə indi atmağa dəyər. Heç nə tərpənmir. Gate silisiumun üstündə, izolyasiya qatı ilə ayrılmış vəziyyətdə oturur və onun *elektrik sahəsi* bu izolyatordan keçərək aşağıdakı materialdakı yük daşıyıcılarını cəlb edir və ya itələyir, beləcə keçirici channel yaranır və ya yox olur. Elə buna görə geniş yayılmış tip MOSFET adlanır — metal-oxide-semiconductor **field-effect** transistor. Heç nə toxunmur; işi sahə görür. Həm də buna görə transistor-larda relay kontaktlarındakı kimi yeyilmə mexanizmi yoxdur və onları mexaniki hissənin heç vaxt dözə bilməyəcəyi tezliklərdə işlətmək mümkündür.

</Note>

## İki açar qərar verir {/*two-switches-make-a-decision*/}

Bax burada Shannon-un 1937-ci il fikri var və o, həqiqətən bu qədər sadədir. Bir batareya, bir lampa və iki açar götür. Açarları iki cür qoşa bilərsən və hər iki üsul fərqli davranır.

<DiagramGroup>

<Diagram name="transistors-and-logic-gates/switch_series_and" height={340} width={340} alt="Dövrə sxemi, başlıq 'ardıcıl iki açar', alt başlıq 'series qoşulma'. Aşağı soldakı batareya yuxarı qalxır və üst tel boyunca mavi rəngdə çəkilmiş, monospace şriftlə A və B yazılmış iki bağlı açardan keçir, sonra sağa və aşağı, içində X olan dairə kimi çəkilmiş və ətrafında mavi şüalar olan yanan lampaya gedir, oradan da aşağı tel boyunca batareyaya qayıdır. Şəklin içindəki altyazı: hər ikisi bağlı → lampa yanır.">

**Series.** Cərəyan əvvəlcə A-dan, *sonra* B-dən keçməlidir. Zəncirin istənilən yerində bir açıq açar hər şeyi kəsir.

</Diagram>

<Diagram name="transistors-and-logic-gates/switch_parallel_or" height={340} width={340} alt="Dövrə sxemi, başlıq 'yan-yana iki açar', alt başlıq 'parallel qoşulma'. Aşağı soldakı batareya yuxarı qalxır və telin iki paralel budağa ayrıldığı nöqtəyə çatır: yuxarı budaqda mavi rəngdə çəkilmiş, A yazılmış bağlı açar, aşağı budaqda isə boz rəngdə qaldırılmış dəstək kimi çəkilmiş, B yazılmış açıq açar var. Budaqlar sağda birləşir və ətrafında mavi şüalar olan yanan lampaya gedir, oradan aşağı tel boyunca batareyaya qayıdır. Şəklin içindəki altyazı: hər hansı biri bağlı → lampa yanır.">

**Parallel.** Cərəyanın iki yolu var. Hər hansı birini bağlamaq kifayətdir; lampa yalnız *hər ikisi* açıq qalanda sönür.

</Diagram>

</DiagramGroup>

İndi hər dövrənin nə etdiyini yaz; "bağlı" üçün 1, "lampa yanır" üçün 1 istifadə et — əvvəlki bölmədəki müqavilə, açarlara tətbiq olunmuş halda:

| A | B | series (lampa) | parallel (lampa) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 |

O iki sütuna bax. Series sütunu yalnız hər iki input 1 olanda 1-dir: bu, misdən qurulmuş Boole-un **AND**-idir. Parallel sütunu ən azı bir input 1 olanda 1-dir: Boole-un **OR**-u. Heç kim bu dövrələri logic etmək üçün dizayn etməyib. Gərginlikləri 0 və 1 adlandırmağa razılaşan kimi logic elə naqil çəkməyin *özü* olur. ✓

Bütün fənd budur, qalan hər şey nəticədir. Yuxarıdakı kimi cədvəl **truth table** adlanır və o, bir logic parçasının tam spesifikasiyasıdır — iki input üçün cəmi dörd mümkün vəziyyət var, deməli hər dörd sətri yazmısansa, *işin bitib*; o circuit haqqında kəşf ediləsi başqa heç nə qalmayıb. Bu, software-in nadir hallarda təklif etdiyi bir dəbdəbədir.

Amma tək açarların bacarmadığı bir şey var. Yuxarıdakı hər iki dövrə **monoton**-dur: bağlı bir açar əlavə etmək lampanı yalnız yandıra bilər, heç vaxt söndürə bilməz. Halbuki ən əsas məntiqi əməliyyat elə *tərsinə çevirmə*-dir — 1 verildikdə 0 üret. **NOT** üçün sənə elə bir açar lazımdır ki, input-u yüksək olanda output-u ground-a qoşsun, beləcə input-u yandırmaq output-u *aşağı* dartsın. Transistor-lar bunu təbii şəkildə edir və real gate-lərin növbəti bölmədəki kimi qurulmasının səbəbi elə budur.

## Yadda saxlamağa dəyər gate-lər {/*the-gates-worth-memorizing*/}

**Logic gate** bu funksiyalardan birini hesablayan kiçik bir circuit-dir — solda input-ları, sağda output-u olan təkrar istifadə oluna bilən hissə. Sənə lazım olan düz yeddi ədəddir:

| A | B | AND | OR | NAND | NOR | XOR | XNOR | | NOT A |
|---|---|-----|----|------|-----|-----|------|---|-------|
| 0 | 0 | 0 | 0 | **1** | **1** | 0 | 1 | | 1 |
| 0 | 1 | 0 | 1 | **1** | 0 | **1** | 0 | | 1 |
| 1 | 0 | 0 | 1 | **1** | 0 | **1** | 0 | | 0 |
| 1 | 1 | 1 | 1 | **0** | 0 | 0 | 1 | | 0 |

Sütunları əzbərləmək əvəzinə onları cümlə kimi oxu:

- **AND** — "hər ikisi". **OR** — "ən azı biri". **NOT** — "əksi".
- **NAND** — "hər ikisi deyil", yəni output-u çevrilmiş AND. Sütuna bax: demək olar ki, həmişə 1-dir və yalnız hər iki input-un 1 olduğu tək halda 0-a düşür.
- **NOR** — "heç biri".
- **XOR** — *exclusive* or, yəni "düz biri, amma hər ikisi yox". Bu, insanların ingiliscə "or" sözünü adətən necə işlətdiyinə uyğun gələn gate-dir ("çay ya qəhvə" nadir hallarda hər ikisini götürə bilərsən deməkdir) və onunla artıq görüşmüsən: Dərs 8-in CRC bölməsindəki carry-siz toplama elə XOR idi. Növbəti dərsdə göründüyü kimi, o həm də adder-in böyük hissəsidir.
- **XNOR** — "eynidir", buna görə də təbii bərabərlik yoxlamasıdır.

**İşlənmiş nümunə — AND, OR və NOT-dan XOR qur.** Tutaq ki, hissələr qutunda XOR yoxdur. "Onlardan düz biri" başqa cür də deyilə bilər: *ya A yanıb və B sönüb, ya da B yanıb və A sönüb.* Gate-lərlə: `(A AND NOT B) OR (NOT A AND B)`. Hər dörd sətri yoxla — və iki input-la dörd sətir seçmə yoxlama deyil, *sübutdur*:

```
 A B │ NOT B │ A AND NOT B │ NOT A │ NOT A AND B │  OR  → out
 ────┼───────┼─────────────┼───────┼─────────────┼────────────
 0 0 │   1   │      0      │   1   │      0      │      0
 0 1 │   0   │      0      │   1   │      1      │      1
 1 0 │   1   │      1      │   0   │      0      │      1
 1 1 │   0   │      0      │   0   │      0      │      0

 output sütunu: 0 1 1 0  =  yuxarıdakı XOR sütunu ilə eynidir ✓
```

Beş gate və yeni bir hissə mövcuddur. Rəqəmsal dizaynın bütün metodu budur: istədiyini truth table kimi təsvir et, sonra sütunlar uyğun gələnə qədər gate yığ.

## Gate əslində nədən qurulub {/*what-a-gate-is-really-made-of*/}

Bir gate-i açmağın vaxtıdır, çünki içərisi ilk baxışda tərs görünən bir faktı izah edir: real silikonda **NAND AND-dan ucuzdur**.

Müasir çiplər **CMOS** adlanan bir üslubdan istifadə edir və o, iki növ transistor-u cütləşdirir:

- **N-type** gate-i 1 olanda bağlanır ("1 onu bağlayır" tipli açar) və teli 0-a dartmaqda yaxşıdır;
- **P-type** gate-i **0** olanda bağlanır — tam əksi — və teli 1-ə qaldırmaqda yaxşıdır.

Sonra hər CMOS gate eyni qayda ilə qurulur: output-un üstündə onu 1-ə *yuxarı* dartan P-type şəbəkəsi və altında onu 0-a *aşağı* dartan güzgü şəkilli N-type şəbəkəsi; elə düzülür ki, istənilən anda bu iki şəbəkədən yalnız biri keçiricilik etsin. Onları belə qoş və NAND alarsan:

<Diagram name="transistors-and-logic-gates/cmos_nand" height={400} width={720} alt="Sxem, başlıq 'real NAND gate: dörd transistor'. Yuxarıda 1 işarəli və power yazılmış üfüqi qidalanma xətti; aşağıda 0 işarəli və ground yazılmış üfüqi torpaqlama xətti. Qidalanma xəttindən aşağı, ortadakı ümumi üfüqi telə doğru yan-yana iki şaquli açar sallanır; onların input-ları yuxarıda A və B kimi yazılıb və hər biri qırmızı rəngdə A = 0 olarsa bağlanır və B = 0 olarsa bağlanır qeydləri ilə işarələnib. Ortadakı ümumi teldə mavi nöqtə var, oradan sağa mavi tel gedir və out yazısına çatır. Həmin nöqtədən aşağı, tək sütunda daha iki şaquli açar ground xəttinə enir və mavi rəngdə A = 1 olarsa bağlanır və B = 1 olarsa bağlanır qeydləri ilə işarələnib. Solda qırmızı rəngdə yan qeyd: yan-yana iki açar, hər hansı biri out-u 1-ə qaldıra bilər; mavi rəngdə isə: ardıcıl iki açar, out-u 0-a dartmaq üçün hər ikisi lazımdır. Aşağıdakı altyazı: out yalnız A = 1 və B = 1 olanda 0-a düşür — bu da elə NAND-ın özüdür.">

Dörd transistor. Yuxarıdakı P-type-lar **parallel** qoşulub (hər hansı biri output-u yuxarı darta bilər); aşağıdakı N-type-lar isə **series** qoşulub (aşağı dartmaq üçün hər ikisi lazımdır) — lampa dövrələrindəki eyni iki düzülüş, indi üst-üstə yığılmış halda.

</Diagram>

Yalnız əhəmiyyət daşıyan halı izlə. **A = 1 və B = 1** qoy: hər iki N-type bağlanır, ground-a gedən series yol tamamlanır və output 0-a dartılır. Bu vaxt 0-da bağlanan hər iki P-type açıqdır, ona görə heç nə buna qarşı çıxmır. Output = 0. Bütün digər hallarda ən azı bir input 0-dır, bu isə N-series-i açır (aşağı yol yoxdur) və ən azı bir P-type-ı bağlayır (yuxarı yol var), deməli output 1-dir. Bu, dəqiq NAND sütunudur. ✓

İndi qiyməti hesabla. NAND: **4 transistor**. NOR: 4. NOT: **2** (bir P, bir N — mövcud olan ən kiçik gate). Bəs AND? Bu üslubda invert etməyən gate-i birbaşa qurmaq mümkün deyil, çünki aşağı dartan şəbəkə həmişə input-ların mənasını tərsinə çevirir. Ona görə AND **NAND-dan sonra NOT** kimi qurulur — **6 transistor**, yəni "daha sadə" əməliyyatdan yarım dəfə baha. Buna görə də çip dizaynerləri sənin `if` ifadələri ilə düşündüyün kimi NAND və NOR ilə düşünürlər, hardware üçün compiler isə sahə qazanmaq üçün sənin AND və OR-larını məmnuniyyətlə invert edən gate-lərə çevirəcək.

Bir nəticə də var və o, Faza 0-ın qalanı üçün əhəmiyyətli olacaq: nəzərə al ki, CMOS gate *dinc dayananda* şəbəkələrdən biri açıq olur, deməli power-dan ground-a yol yoxdur və demək olar ki, cərəyan axmır. Dincələn gate demək olar ki, pulsuzdur. O, enerjini əsasən **keçid etdiyi** anlarda sərf edir — output-undakı teli doldurub boşaldarkən. Elə bu tək fakta görə processor-lar həm gigahertz-lə, həm də vatt-la ölçülür, elə buna görə noutbukun boşdayanda sərin, kompilyasiya edəndə isti olur və elə buna görə son iyirmi ildə sənayenin əsas problemi istilikdir. Bu faza bitənə qədər bu müşahidəyə daha iki dəfə qayıdacağıq.

<DeepDive>

#### Niyə iki state, on yox {/*why-two-states-and-not-ten*/}

Binary qəribə, özbaşına bir məhdudiyyət kimi görünə bilər — insanlar onluqla sayır və bir tel açıq-aydın ikidən çox fərqləndirilə bilən gərginlik saxlaya bilər. Bəs bütün sənaye niyə mümkün olan ən kiçik state sayında dayandı?

Hər iki digər yol sınanıb və hər ikisi artıq qeydlərindədir. **ENIAC (1945)** *onluq* maşın idi: dizaynerləri insan arifmetikasına uyğunlaşmaq istədikləri üçün on mövqeli halqa sayğacları ilə 0–9 rəqəmlərini birbaşa təmsil edirdi. Moskva Dövlət Universitetində qurulmuş **Setun (1958)** balanslaşdırılmış *ternary* — üç state — istifadə edirdi; zərif idi, bəzi ölçülərə görə həqiqətən səmərəli idi və işləyirdi. Heç biri yaşamadı.

Səbəb birinci bölmədəki noise margin-dir. Tutaq ki, qidalanman 3.3 V-dur. İki state ilə "mütləq 0" ilə "mütləq 1" arasındakı boşluq bir voltdan xeyli çoxdur — siqnalı çox ağır incidə və yenə də onu mükəmməl bərpa edə bilərsən. Eyni 3.3 V-u on səviyyəyə böl, hər biri qonşusundan təxminən 0.33 V aralı olar, margin-ləri də çıxsan daha az; indi cüzi bir maneə 6-nı 5-ə çevirir və bunu *səssizcə* edir, çünki qəbuledicinin ona zədəli dəyər verildiyini bilməyə heç bir yolu yoxdur. Üç səviyyə ilə vəziyyət ikidən yenə də pisdir.

İkinci və daha fundamental bir səbəb var. "Bu açar açıqdır, yoxsa bağlı?" bir maddə parçasına verə biləcəyin ən asan sualdır — bu, yolun mövcud olub-olmaması haqqındadır. "Bu açar 40% açıqdır?" isə cihazdan analoq bir kəmiyyəti dəqiq saxlamağı tələb edir: temperatur dəyişmələri, istehsal fərqləri və iyirmi illik köhnəlmə boyunca. İki state o deməkdir ki, hər komponent yalnız *ekstremumlarda* etibarlı olmalıdır — fizikanın ən əməkdaş olduğu yerdə: tam açıq, tam bağlı.

Deməli, binary sənayenin qəbul etdiyi məhdudiyyət deyil; o, *mümkün olan ən ucuz etibarlılıqdır*. Modul 0.1-dəki hər şey — byte, two's complement, IEEE 754, UTF-8 — iki state-in təsadüfən sındırılması ən çətin şey olduğuna görə verilmiş bir qərarın nəticəsidir.

</DeepDive>

<DeepDive>

#### Hamısına hökm edən bir gate {/*one-gate-to-rule-them-all*/}

Bax burada mübaliğə kimi səslənən, amma olmayan bir nəticə var: **tək NAND indiyə qədər mümkün olan bütün rəqəmsal circuit-ləri qurmağa kifayət edir.** "Əksəriyyətini" yox. Hamısını — hər processor, hər memory, dizayn ediləcək hər qrafik çip. Bu xüsusiyyətə malik gate **universal** adlanır və NAND belədir. NOR da eləcə.

Sübut konstruktivdir və burada göstərməyə kifayət qədər qısadır. NAND-dan NOT, AND və OR qura bilirsənsə, deməli hər şeyi qura bilərsən, çünki istənilən truth table mümkün invert olunmuş input-ların AND-larının OR-u kimi yazıla bilər.

<Diagram name="transistors-and-logic-gates/nand_universality" height={320} width={720} alt="Üç çərçivəli panel, başlıq 'bir gate-dən bütün gate-lər'. Sol panelin başlığı NOT, qeydi '1 gate': tək NAND simvolu — output-unda kiçik dairə olan mavi D forması — A input-u ikiyə bölünüb onun hər iki input ayağına verilib, output isə 'not A' kimi yazılıb. Orta panelin başlığı AND, qeydi '2 gate': A və B input-ları birinci NAND-a verilir, onun output-u ikinci NAND-ın hər iki input ayağına gedir, ikincinin output-u 'A and B' kimi yazılıb. Sağ panelin başlığı OR, qeydi '3 gate': A input-u bir kiçik NAND-ın hər iki ayağına, B input-u isə ikinci kiçik NAND-ın hər iki ayağına verilir; bu ikisinin output-ları üçüncü NAND-ın iki input-una gedir və onun output-u 'A or B' kimi yazılıb. Aşağıdakı altyazı: bir hissə çap edə bilən zavod indiyə qədər mövcud olmuş istənilən circuit-i qura bilər.">

Üç konstruksiya və universallıq sübut olundu. Dairəciyi olan hər balaca D forması eyni dörd transistorlu hissədir.

</Diagram>

**NOT** hər iki input-u eyni telə bağlanmış bir NAND-dır. NAND "hər ikisi deyil" deməkdir və iki input eyni dəyər olanda "hər ikisi deyil" sadəcə "deyil"-ə çökür:

```
 A │ A NAND A
 ──┼──────────
 0 │    1
 1 │    0        = NOT A ✓
```

**AND** bir NAND-dan sonra həmin NOT-dur — invert olunmuş cavabı yenə invert et:

```
 A B │ A NAND B │ sonra özü ilə NAND → out
 ────┼──────────┼──────────────────────────
 0 0 │    1     │            0
 0 1 │    1     │            0
 1 0 │    1     │            0
 1 1 │    0     │            1     = A AND B ✓
```

**OR** De Morgan qanununu götürür — "ən azı biri doğrudur" ifadəsi "hər ikisi yalan deyil" ifadəsi ilə eynidir. Hər iki input-u invert et, sonra onları NAND et:

```
 A B │ NOT A │ NOT B │ (NOT A) NAND (NOT B)
 ────┼───────┼───────┼──────────────────────
 0 0 │   1   │   1   │          0
 0 1 │   1   │   0   │          1
 1 0 │   0   │   1   │          1
 1 1 │   0   │   0   │          1    = A OR B ✓
```

Bu, sadəcə imtahan üçün maraqlı bir fakt deyil — bu, istehsal strategiyasıdır. Bir dörd transistorlu hüceyrəni etibarlı şəkildə çap edə bilən istehsal xətti hər şeyi qura bilər və bir təkrarlanan hüceyrədən qurulmuş çipi yerləşdirmək, yoxlamaq və istehsalda çıxarını artırmaq daha asandır. Ən məşhur nümayiş uçdu: insanları Aya aparan maşın olan **Apollo Guidance Computer** təxminən **2,800 eyni inteqral sxemdən** qurulmuşdu və hər birində bir cüt üç input-lu **NOR** gate vardı — *tək bir tipdən* təxminən 5,600 gate və başqa heç nə. Mühəndislər bir universal gate seçib onu təkrarladılar, qismən də ona görə ki, tək bir hissə nömrəsini yoxlamaq və ona insan həyatını etibar etmək daha asan idi. Naviqasiya tənliklərindən tutmuş ekran interfeysinə qədər hər şey həmin bir gate idi, sadəcə fərqli qoşulmuş.

</DeepDive>

<Pitfall>

**Gate-lər ani hesablamır.**

Səhv, truth table-ı riyazi bərabərlik kimi, yəni hər an doğru olan bir şey kimi oxumaqdır. Fiziki gate teli sürən bir açardır və hər ikisi vaxt aparır: transistor-lar həqiqətən açılmalıdır və output telinin tutumu həqiqətən dolmalıdır. Müasir gate üçün onlarla pikosaniyə, uzun tel üçün daha çox olan bu gecikmə **propagation delay** adlanır və o deməkdir ki, input-lar dəyişəndən sonra qısa bir müddət ərzində gate-in output-u *səhvdir*.

Daha pisi, bu səhvlik görünən və qəribə ola bilər. Bir yolu digərindən yavaş olan iki gate-i zəncirlə və output truth table-ının heç bir sətrində olmayan bir dəyərə titrəyə bilər, sonra düzgün dəyərə oturar. Circuit dizaynerləri bunlara **glitch** deyir və truth table onları qabaqcadan deyə bilmir, çünki truth table-ın zaman anlayışı yoxdur.

Düzəliş daha sürətli gate-lər deyil; *gözləməkdir*. Real dizaynlar cavabı hesablayır, sonra ən yavaş yolun oturması üçün kifayət qədər gözləyir və yalnız bundan sonra nəticəni oxuyur — bu gözləməni məcbur edən şey isə **clock**-dur, bu modulun üçüncü dərsi. Deməli, özünlə aparacağın nəticə budur: truth table circuit-in nəyə *oturduğunu* təsvir edir, yolda nə etdiyini heç vaxt yox. Qarşına çıxacaq hər combinational circuit yalnız ona vaxt verildikdən *sonra* düzgündür.

</Pitfall>

## Gate dəzgahı {/*the-gate-bench*/}

Dərs 1 sənə səkkiz açar verdi və bir byte qurmağa imkan yaratdı. Bax burada iki açar və onların verə biləcəyi bütün qərarlar var. A və B-ni çevir; hər gate-in output-u canlı yanır və hazırda dayandığın truth table sətri işıqlanır. Axtarmağa dəyər iki şey: NAND-ın söndüyü tək sətri tap və XOR ilə OR-un düz bir sətirdə fərqləndiyini təsdiqlə:

<Sandpack>

```js
import { useState } from 'react';

const G = [
  ['AND', (a, b) => a && b],
  ['OR', (a, b) => a || b],
  ['NAND', (a, b) => !(a && b)],
  ['NOR', (a, b) => !(a || b)],
  ['XOR', (a, b) => a !== b],
  ['XNOR', (a, b) => a === b],
];
const ROWS = [[0, 0], [0, 1], [1, 0], [1, 1]];
const td = { padding: '4px 9px' };

export default function GateBench() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const toggle = (v, set) => (
    <button onClick={() => set(v ? 0 : 1)} style={{
      width: 74, height: 74, fontSize: 30, margin: 8, borderRadius: 12,
      cursor: 'pointer', fontFamily: 'monospace',
      border: `2px solid ${v ? '#087ea4' : '#888'}`,
      background: v ? '#087ea4' : 'transparent',
      color: v ? 'white' : 'inherit'
    }}>{v}</button>
  );
  return (
    <div style={{ fontFamily: 'system-ui', textAlign: 'center' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 18 }}>
        A {toggle(a, setA)} {toggle(b, setB)} B
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {G.map(([n, f]) => {
          const out = f(a, b) ? 1 : 0;
          return (
            <div key={n} style={{
              width: 92, margin: 5, padding: '8px 0', borderRadius: 10,
              border: `2px solid ${out ? '#087ea4' : '#888'}`,
              background: out ? '#087ea41f' : 'transparent'
            }}>
              <div style={{ fontSize: 13, color: '#888' }}>{n}</div>
              <div style={{ fontSize: 26, fontFamily: 'monospace',
                color: out ? '#087ea4' : 'inherit' }}>{out}</div>
            </div>
          );
        })}
      </div>
      <table style={{ margin: '14px auto', borderCollapse: 'collapse',
        fontFamily: 'monospace', fontSize: 15 }}>
        <tbody>
          <tr style={{ color: '#888' }}>
            {['A', 'B', ...G.map((g) => g[0])].map((h) => (
              <td key={h} style={td}>{h}</td>
            ))}
          </tr>
          {ROWS.map(([ra, rb]) => {
            const here = ra === a && rb === b;
            return (
              <tr key={`${ra}${rb}`} style={{
                background: here ? '#087ea425' : 'transparent',
                outline: here ? '2px solid #087ea4' : 'none'
              }}>
                <td style={td}>{ra}</td>
                <td style={td}>{rb}</td>
                {G.map(([n, f]) => (
                  <td key={n} style={td}>{f(ra, rb) ? 1 : 0}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: '#888' }}>
        Dörd sətir bütün həqiqətdir. Bu iki telin edə biləcəyi
        başqa heç nə yoxdur.
      </p>
    </div>
  );
}
```

</Sandpack>

Bir az o son cümlə üzərində dayan, çünki bu modulun ümumiyyətlə mövcud ola bilməsinin səbəbi elə odur. İki input-lu gate-in dörd mümkün vəziyyəti var və sən indicə onların hamısını gördün. Heç nə gizli deyil, heç nə ehtimallı deyil, heç nə havadan asılı deyil. Bu qədər kiçik və bu qədər tam başa düşülən hissələrdən qur, onda iyirmi milyard ədədindən ibarət maşın haqqında da düşünə bilərsən — Faza 0-ın qalanı elə bununla məşğuldur.

<Recap>

- Hardware-də bit **bir gərginlik üstəgəl bir müqavilədir**: bir threshold-dan aşağı 0, digərindən yuxarı 1 kimi oxunur, aradakı zolaq isə qəsdən mənasız buraxılır. Voltların öz-özünə mənası yoxdur — eyni fizika 5 V logic, 3.3 V logic, ya da müasir nüvədə 1 V-dan aşağı ola bilər.
- Həmin mənasız orta zolaq **noise immunity** qazandırır: zədələnmiş siqnal ən yaxın qanuni dəyər kimi oxunur və sonra *tam gücündə yenidən yaradılır*, ona görə rəqəmsal data kopyalanmağa tab gətirir, analoq isə hər zərbəni yığır. Binary onluğa (ENIAC) və ternary-yə (Setun) qalib gəldi, çünki iki state etibarlı olmaq üçün ən ucuz şeydir.
- **Transistor** dəstəyi başqa bir tel olan açardır — **gate** üzərindəki gərginlik source ilə drain arasındakı channel-i açır və ya bağlayır, hərəkət edən hissə olmadan. Apple-ın M1-i onlardan təxminən 16 milyardını ~120 mm²-ə yerləşdirir, yəni kvadrat millimetrə təxminən **133 milyon** və ENIAC-ın 17,468 tube-undan təxminən bir milyon dəfə çox.
- **Series qoşulmuş açarlar AND kimi, parallel qoşulmuş açarlar OR kimi davranır.** Shannon-un 1937-ci il tezisi bir cümlədə budur: logic naqil çəkməyə əlavə edilən bir şey deyil, gərginlikləri adlandıran kimi naqil çəkməyin özü elə odur. **NOT** üçün output-u *aşağı* dartan transistor lazımdır, sadə açarlar bunu bacarmır.
- **Truth table** tam spesifikasiyadır: iki input-la cəmi dörd sətir var, deməli hər dördünü yoxlamaq sübutdur. Yeddi gate: **AND** (hər ikisi), **OR** (ən azı biri), **NOT**, **NAND** (hər ikisi deyil), **NOR** (heç biri), **XOR** (düz biri), **XNOR** (eynidir).
- **CMOS**-da P-type-lar yuxarı dartır və 0-da bağlanır, N-type-lar aşağı dartır və 1-də bağlanır. NAND **4 transistor**-a, NOT 2-yə, AND isə **6**-ya başa gəlir (NAND + NOT) — invert edən gate-lər yerli olanlardır, buna görə hardware NAND və NOR-la dizayn edilir. Dinc dayanan gate demək olar ki, heç nə çəkmir; enerjini **keçid edəndə** yandırır.
- **NAND universal-dır**, NOR da eləcə: NOT input-ları bağlanmış bir NAND-dır, AND iki, OR isə üç NAND-dır (De Morgan vasitəsilə). Apollo Guidance Computer təxminən **bir tip hissədən 2,800 çip** ilə qurulmuşdu — cüt üç input-lu NOR gate-lər və başqa heç nə.
- Gate-lərin **propagation delay**-i var, ona görə truth table yalnız circuit-in nəyə *oturduğunu* təsvir edir, yolda nə etdiyini yox. Glitch-lər realdır və həlli gözləməkdir — clock elə bunun üçündür.

</Recap>

<Challenges>

#### Interlock-u qoş {/*wire-the-interlock*/}

Mikrodalğalı soba yalnız qapı bağlı olanda **və** start düyməsi basılanda işləməlidir. Yanğın siqnalizasiyası tüstü sensoru işə düşəndə **və ya** əl ilə çəkilən dəstək istifadə olunanda səslənməlidir. Hər biri üçün iki açarı series, yoxsa parallel qoşacağını de və truth table-ı yaz. Sonra dizayn sualına cavab ver: maşının içindəki bir tel qırılarsa, bu iki düzülüşdən hansı daha təhlükəsiz standartdır?

<Hint>

Qırılmış tel heç vaxt bağlana bilməyən açardır. Hər dövrənin iki yolundan biri həmişəlik ölü olanda nə etdiyini soruş — sonra mikrodalğalı sobada hansı nasazlığı, yanğın siqnalizasiyasında isə hansını üstün tutacağını soruş.

</Hint>

<Solution>

**Mikrodalğalı — series (AND).** Hər iki şərt ödənməlidir.

```
 qapı  start │ magnetron
 ────────────┼───────────
   0     0   │     0
   0     1   │     0
   1     0   │     0
   1     1   │     1     ✓
```

**Yanğın siqnalizasiyası — parallel (OR).** İstənilən tetikleyici kifayətdir.

```
 tüstü  dəstək │ sirena
 ──────────────┼────────
   0      0    │   0
   0      1    │   1
   1      0    │   1
   1      1    │   1     ✓
```

**Qırılmış tel sualı.** Qırılma açarı həmişəlik açıq edir. **Series**-də bir qırılma o deməkdir ki, output heç vaxt yana bilməz — maşın *ölü* olur. **Parallel**-də bir qırılma iki tetikleyicidən yalnız birini götürür; digəri hələ də işləyir və output yenə də işə düşə bilər.

Deməli, təhlükəsiz standart tamamilə hansı nəticənin təhlükəli olmasından asılıdır və bu iki nümunə qəsdən bir-birinin əksidir. Mikrodalğalı üçün "heç vaxt işə düşmür" zərərsiz nasazlıqdır, "qapı açıq işə düşür" isə yox — deməli series doğrudur və real interlock-lar məhz buna görə elə qoşulur ki, nasazlıq gücü kəssin, onu vermək əvəzinə. Siqnalizasiya üçün "heç vaxt səslənmir" fəlakətli nasazlıqdır, ona görə parallel doğrudur; real yanğın sistemləri isə daha da irəli gedir və naqillərin özünü fasiləsiz izləyir ki, qırılma səssizcə örtüyü azaltmaq əvəzinə *bildirilsin*.

Bu son fikir Dərs 8-in dərsinin misə çevrilmiş halıdır: təhlükəli nasazlıq səsli olan deyil, səssiz olandır. Ölü siqnalizasiya dövrəsi tam olaraq sakit bina kimi görünür.

</Solution>

#### Yalnız NOR-dan NOT və AND qur {/*build-not-and-and-from-nor-only*/}

Dərs NAND-ın universal olduğunu sübut etdi. İndi bunu digəri üçün sübut et — Apollo-nun əslində uçurduğu gate. Yalnız **NOR gate-lərdən** istifadə edərək (`A NOR B` = heç bir input 1 olmayanda 1) NOT, sonra OR, sonra AND qur. Hər birini truth table ilə yoxla.

<Solution>

**NOT** — hər iki input-u bir-birinə bağlanmış bir NOR. "Heç biri 1 deyil" sadəcə "o, 1 deyil"-ə çökür:

```
 A │ A NOR A
 ──┼─────────
 0 │    1
 1 │    0      = NOT A ✓
```

**OR** — NOR onsuz da output-u çevrilmiş OR-dur, ona görə yuxarıdakı NOT ilə onu geri çevir (cəmi iki gate):

```
 A B │ A NOR B │ sonra özü ilə NOR
 ────┼─────────┼───────────────────
 0 0 │    1    │          0
 0 1 │    0    │          1
 1 0 │    0    │          1
 1 1 │    0    │          1      = A OR B ✓
```

**AND** — yenə De Morgan, güzgüdə: "hər ikisi doğrudur" ifadəsi "heç biri yalan deyil" ifadəsi ilə eynidir. Hər iki input-u invert et, sonra onları NOR et (üç gate):

```
 A B │ NOT A │ NOT B │ (NOT A) NOR (NOT B)
 ────┼───────┼───────┼─────────────────────
 0 0 │   1   │   1   │          0
 0 1 │   1   │   0   │          0
 1 0 │   0   │   1   │          0
 1 1 │   0   │   0   │          1     = A AND B ✓
```

Dərsdəki NAND konstruksiyaları ilə xoş simmetriyaya fikir ver: NAND AND-ı iki gate-də, OR-u üç gate-də qurur; NOR isə OR-u ikidə, AND-ı üçdə. Hər universal gate onsuz da az qala özü olan əməliyyatda *ucuzdur* və digəri üçün bir əlavə qat ödəyir. Apollo mühəndisləri NOR-u seçdilər və onun təxminən 5,600 nüsxəsindən Ay missiyası qurdular.

</Solution>

#### De Morgan bug-ı {/*the-de-morgan-bug*/}

Köçürmə tapşırığı. Bir pull request icazə yoxlamasını "sadələşdirir":

```js
// əvvəl
if (!(isExpired && isRevoked)) { grantAccess(); }

// sonra — "daha təmiz"
if (!isExpired && !isRevoked) { grantAccess(); }
```

Müəllif bildirir ki, bütün testləri hələ də keçir. Truth table ilə göstər ki, iki ifadə tam olaraq harada fərqlənir, indi hansı real vəziyyətin və hansı istiqamətdə səhv davrandığını de, test dəstinin bunu niyə buraxdığını izah et və düzgün yenidən yazılışı da daxil olmaqla review şərhini yaz.

<Solution>

Qoy `E = isExpired`, `R = isRevoked` olsun:

```
 E R │ !(E && R)  │ !E && !R  │ üst-üstə düşür?
 ────┼────────────┼───────────┼─────────────────
 0 0 │     1      │     1     │  bəli
 0 1 │     1      │     0     │  XEYR
 1 0 │     1      │     0     │  XEYR
 1 1 │     0      │     0     │  bəli
```

Onlar **düz iki qarışıq sətirdə** fərqlənir — bayraqlardan biri qalxıb, digəri qalxmayanda.

**Hansı istiqamətdə və bu yaxşıdır, yoxsa pis?** Orijinal versiya token *həm* expired, *həm də* revoked olmayana qədər icazə verir — açıq oxunuşda bu, şübhəli dərəcədə sərbəst qaydadır: müddəti bitmiş, amma ləğv edilməmiş token içəri girir. Yenidən yazılmış versiya isə bayraqlardan hər hansı biri qalxıbsa, icazəni rədd edir. Deməli "daha təmiz" versiya əslində daha sərtdir və demək olar ki, əminliklə *nəzərdə tutulan* siyasətdir — bu isə review-nu həqiqətən xoşagəlməz edir, çünki dəyişiklik formatlama təmizliyi kimi maskalanmış davranış dəyişikliyidir. Dürüst oxunuş budur: orijinal şərt yəqin ki, onsuz da bug idi və PR heç nə etmədiyini iddia edərək onu səssizcə düzəldir.

**Testlər niyə keçdi:** görünür, yalnız üst-üstə düşən sətirləri əhatə edirdilər — tam etibarlı token (0,0) və tamamilə ölü olan (1,1). İki input-un dörd state-i var və dəst onlardan ikisini yoxlayıb. Dərsin öz vərdişi həlldir: iki boolean-la *dörd sətir bütün həqiqətdir* və sətirləri buraxan test dəsti şərti yoxlamır, sadəcə ondan seçmə götürür.

**Review şərhi:** *"Bu iki şərt ekvivalent deyil — düz bir bayraq qalxanda fərqlənirlər (expired amma revoked deyil, və revoked amma expired deyil), deməli bu, təmizlik yox, giriş siyasətinin dəyişməsidir. De Morgan qanunu orijinalın əsl ekvivalentini verir: `!(E && R)` = `!E || !R` — `||` işarəsinə fikir ver. Əgər yeni, daha sərt davranış istədiyimizdirsə (məncə elədir: istənilən expired və ya revoked token rədd edilməlidir), onda bunu qəsdən düzəliş kimi, bu əsaslandırma commit mesajında olmaqla göndərək, üstəlik hər dörd bayraq kombinasiyası üçün test yazaq, çünki hazırkı dəst yalnız ikisini əhatə edir."*

Köçürülə bilən vərdiş bu dərsin təkrar-təkrar öyrətdiyi vərdişdir: **bir şərtin iki boolean input-u varsa, hər dörd sətri yaz.** Hardware mühəndisləri bunu refleks kimi edirlər, çünki truth table onların *spesifikasiyasıdır* və elə buna görə dörd transistoru yerləşdirən eyni cəbr code review mübahisələrini də həll edir. Boole nəhayət ki, düşüncə haqqında yazırmış — sadəcə pull request-dən təxminən 170 il əvvəl gəlmişdi. ✓

</Solution>

</Challenges>

<LearnMore title="Gate-lərdən Adder Qurmaq" path="/learn/faza-0/modul-0-2/building-an-adder">

İndi tam hissələr qutusu sənindir: AND, OR, NOT və dörd sətrin tam spesifikasiya olduğu müşahidəsi. Növbəti dərsdə bunu Dərs 2-nin vəd etdiyi və Dərs 3-ün dəfələrlə borc aldığı maşına — əslində toplama edənə — xərcləyəcəyik. O, bir sürprizlə başlayır: iki tək bit-i toplamaq üçün düz iki gate lazımdır, biri XOR-dur, odometer-də öyrəndiyin "carry" isə sadəcə bir AND çıxır. Onlardan kifayət qədərini zəncirlə və Yer üzündəki hər processor-un mərkəzindəki arifmetik bloku qurmuş olarsan — nəhayət, `+127 + 1`-in niyə `−128` çıxdığına dürüst bir cavabla birlikdə.

</LearnMore>