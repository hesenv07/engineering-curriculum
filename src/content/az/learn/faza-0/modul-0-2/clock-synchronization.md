---
title: "Clock və Sinxronizasiya"
---

<Intro>

2000-ci ildə Intel Pentium 4-ü 1.5 GHz-lə buraxdı və dünyaya hara getdiyini elan etdi. Çipin arxitekturası olan NetBurst sıfırdan bir məqsəd ətrafında qurulmuşdu — clock sürəti — və Intel-in dərc etdiyi yol xəritəsi ailənin **10 GHz**-ə çatacağını proqnozlaşdırırdı. Şirkətin içindəki mühəndislər isə bu qədər sakit deyildilər: illər boyu əldən-ələ gəzdirdikləri bir güc sıxlığı qrafiki gələcək processor-ların trend xəttini əvvəlcə elektrik plitəsinin, sonra nüvə reaktoru aktiv zonasının, daha sonra isə raket soplasının yanına qoyurdu. Sonra 2004-cü ilin oktyabrı gəldi və Intel səssizcə 4 GHz-lik Pentium 4-ü ləğv etdi. Təxirə salmadı — ləğv etdi. İndiyə qədər satılmış ən sürətli Pentium 4 3.8 GHz-də işləyirdi və iyirmi ildən çox sonra bunu oxuduğun noutbukun clock-u böyük ehtimalla 2 ilə 5 GHz arasındadır. Rəqəm dayandı. Keçən dərsdə *nəhayətdə* düzgün cavab verən bir adder qurdun — carry yol getməlidir və ədədlərdən asılı olaraq fərqli məsafə qət edir. Bu dərs "nəhayətdə"-nin nə vaxt gəldiyinə qərar verən tel haqqındadır: clock fiziki olaraq nədir, nəyə başa gəlir, Yer üzündəki hər rəqəmsal maşın niyə eyni üçhissəli formaya malikdir və qutunun üzərindəki o bir rəqəm niyə heç vaxt aşa bilmədiyi bir divara dəydi.

</Intro>

<YouWillLearn>

- Düzgün bir circuit-in səhv anda oxunanda niyə yenə də zibil verdiyini — və **glitch**-in əslində necə göründüyünü
- **Clock**-un nə olduğunu: period, tezlik, rising edge və onun tətbiq etdiyi nizam
- Tək bir feedback dövrəsi əlavə etməyin logic-i necə **yaddaşa** çevirdiyini — latch, sonra isə **flip-flop**
- Hər rəqəmsal sistemin universal forması: **register → combinational logic → register**
- Çipin maksimum clock sürətini **T_cq + logic + setup + skew**-dən necə hesablamağı, real pikosaniyələrlə
- **Metastability**-ni: heç bir diqqətli dizaynın aradan qaldıra bilmədiyi, yalnız astronomik dərəcədə ehtimalsız edə bildiyi yeganə nasazlıq

</YouWillLearn>

## Qısa müddət yalan olan cavab {/*the-answer-that-is-briefly-a-lie*/}

Keçən dərsdəki 8-bit ripple-carry adder-ə qayıt və diqqətlə yayındığımız sualı ver: onun output-u *nə vaxt* düzgündür?

"Düzgündürmü" yox — bunu truth table-larla sübut etdik. **Nə vaxt.** Çünki səkkiz sum bit-i eyni anda peyda olmur. Bit 0-ın ehtiyacı olan hər şey dərhal əlindədir: iki input-u elə oradaca dayanıb, carry-in-i isə naqillə 0-a bağlanıb. O, demək olar ki, dərhal oturur. Bit 7 isə əksinə, carry altındakı yeddi full adder-dən dırmaşıb yuxarı çıxana qədər öz cavabını bilə bilmir. Bu iki ucun arasında hər bit öz anında yerinə düşür.

<Diagram name="clock-synchronization/settling_timing" height={450} width={720} alt="Timing qrafiki, başlıq: 'səkkiz cavab bit-i eyni anda gəlmir'. Səkkiz üfüqi zolaq üst-üstə düzülüb, yuxarıda S7, aşağıda S0 yazılıb. Hər zolaq qeyri-sabit kimi işarələnmiş qırmızı, diaqonal ştrixli sahə ilə başlayır və sonra 'stable' yazılmış tam mavi sahəyə keçir. Ştrixli sahə S7 üçün ən uzundur və zaman oxunda 16-da bitir, S0 üçün ən qısadır və 2-də bitir; aralıqdakı zolaqlar 14, 12, 10, 8, 6 və 4-də bitərək enən pilləkən əmələ gətirir. Aşağıdakı üfüqi ox 'zaman, gate delay ilə' adlanır və 0-dan 18-ə qədər bölünüb. İki şaquli kəsik xətt bütün zolaqları kəsir: 6-cı anda qırmızı, üzərində 'burada oxu' yazısı, və 17-ci anda mavi, üzərində 'və ya burada' yazısı. Aşağıdakı altyazılar: qırmızı rəngdə 'çox tez: beş bit hələ də zibildir' və mavi rəngdə 'bütün nəticəyə yalnız ən yavaş bit yerinə düşəndən sonra etibar etmək olar'.">

Eyni toplama, həqiqətə qarşı yox, zamana qarşı çəkilmiş. Bir bit-in mavi sahəsindən solda qalan hər şey səhv cavab deyil — o, *cavab deyil*.

</Diagram>

Nəticəni gate delay 6-da oxusan nə baş verdiyinə bax. Bit 0, 1 və 2 oturub və doğru danışır. Bit 3-dən 7-yə qədər hələ havadadır: transistor-ları keçid edir, output telləri gərginliklər arasında bir yerdədir və onlardan tutduğun dəyər nə olursa olsun, timing təsadüfüdür. İki yarını birləşdir və nəticədə 8-bitlik elə bir ədəd alarsan ki, o nə cəmdir, nə əvvəlki cəmdir, nə də hər hansı truth table-ın hər hansı sətridir. O, qısa müddət mövcud olmuş və heç nə ifadə etməyən bir dəyərdir.

Mühəndislər bu keçici səhv dəyərlərə **glitch** deyir və onlar nə nadirdir, nə də ekzotik — hər combinational circuit input dəyişən hər dəfə onları yaradır. Mümkün olan ən sadə hala bax:

```
 Tutaq ki, A 1-dən 0-a keçir və biz  (A AND B) OR (NOT A AND C)
 hesablayırıq; B = 0, C = 1, deməli cavab qalmalıdır… gəl izləyək.

 əvvəl:  A=1, B=0, C=1  →  (1 AND 0) OR (0 AND 1)  =  0 OR 0  =  0
 sonra:  A=0, B=0, C=1  →  (0 AND 0) OR (1 AND 1)  =  0 OR 1  =  1

 Output 0 → 1 getməlidir. Amma NOT A-nın görünməsi bir gate delay çəkir,
 ona görə həmin bir gate delay ərzində circuit qısa müddət belə hesab edir:

 arada:  A=0 (artıq), NOT A=0 (hələ köhnə)  →  0 OR 0  =  0

 …və sonra 1-ə çevrilir. Output düzgündür, sonra yenə düzgündür,
 aralarında isə bir an heç nə var. ✓
```

Dərs 1-in səliqəli truth table-larının gizlətdiyi narahat həqiqət budur: **truth table circuit-in nəyə oturduğunu təsvir edir, yolda nə etdiyini heç vaxt yox.** Combinational logic-in zaman anlayışı yoxdur, fizika isə bunu tələb edir.

Deməli, bizə bir qayda lazımdır və bu qayda amansız dərəcədə sadə olmalıdır, çünki eyni anda milyardlarla gate-ə tətbiq olunacaq. Kimsə deməlidir: *tellərin etdiyi hər şeyi nəzərə alma, yalnız bu konkret anlar istisna olmaqla — və anların bir-birindən ən yavaş siqnalın işini bitirəcəyi qədər aralı olduğuna əmin ol.*

## Zavod sexindəki fit {/*the-whistle-on-the-factory-floor*/}

Bax burada başında saxlamalı olduğun maşın var və o, realdır.

Bir konveyer xətti təsəvvür et. Hər stansiyada bir işçi və bir iş var: bolt bərkit, tikiş qaynaq et, araqatı yoxla. Stansiyalar arasında isə hissələr dayanır. İndi bütün zavodun malik olduğu yeganə koordinasiya vasitəsini əlavə et — bir **fit**. Fit çalınanda hər işçi eyni anda öz hissəsini bir stansiya irəli itələyir və arxadan gələni götürür. Sonra işləyirlər. Sonra fit yenidən çalınır.

Rəqəmsal dizayn haqqında vacib olan hər şey artıq bu şəkildədir:

- **Heç kim heç kimi izləmək məcburiyyətində deyil.** İşçinin qonşusunun nə vaxt bitirdiyini bilməsi lazım deyil. Sadəcə fitə qədər hazır olmalıdır.
- **Fit aralığını ən yavaş işçi müəyyən edir**, orta işçi yox. Araqatı yoxlaması on bir saniyə çəkirsə, fiti hər on saniyədən bir çalmaq o deməkdir ki, yarımçıq yoxlanmış araqatlar əbədi olaraq xətt boyu gedəcək.
- **Sürətli işçilər gözləyir.** İki saniyəyə bitirən bolt bərkidəni səkkiz saniyə boş dayanır. Bu boşdayanma optimallaşdırılıb aradan qaldırılası israf deyil — o, hamının "indi"-nin nə vaxt olduğunda razılaşmasının qiymətidir.
- **İş fitlər arasında görülür; state fit anında dəyişir.** Aralıqda heç nə tərpənmir, anda isə hər şey tərpənir.

Həmin fit **clock**-dur: bir tel, çipin hər küncünə gedir və 0 ilə 1 arasında əbədi növbələşən gərginlikdən başqa heç nə daşımır.

<Diagram name="clock-synchronization/clock_waveform" height={300} width={720} alt="Dalğa forması sxemi, başlıq: 'clock: İNDİ deyən tel'. Mavi düzbucaqlı dalğa şəkil boyunca dörd tam dövrə boyu gedir, solda 1 və 0 yazılmış yüksək və alçaq səviyyələr arasında növbələşir. Bir tam dövrə iki şaquli boz kəsik xətt arasında qeyd olunub, aralarında ikibaşlı ox və 'bir period T' yazısı var. Hər dövrənin əvvəlində qırmızı nöqtə rising edge-i işarələyir, ona aşağı baxan qırmızı ox göstərir; qırmızı yazıda deyilir: 'rising edge — hər register öz input-una baxır'. Dalğanın altında monospace şriftlə iki sətir yazılıb: 'frequency = 1 / T' və '1 GHz = təkan başına 1000 ps · 3 GHz = 333 ps · 4 GHz = 250 ps'.">

Bütün siqnal budur. Nə data, nə məna, nə də əbədi təkrarlanan bir şeydən başqa informasiya: *indi… indi… indi…*

</Diagram>

**Period** `T` bir dövrənin nə qədər davam etdiyidir; **tezlik** isə bir saniyəyə neçə dövrənin sığdığıdır və bu ikisi sadəcə bir-birinin tərsidir:

```
 frequency = 1 / T          T = 1 / frequency

   1 GHz  →  T = 1 / 1,000,000,000 s  =  1000 ps
   3 GHz  →  T ≈  333 ps
   4 GHz  →  T =  250 ps
  10 GHz  →  T =  100 ps        ← Intro-dakı Intel vədi
```

Kimsə bir processor-un "3 GHz-də işlədiyini" deyəndə bütün iddia budur: onun fiti saniyədə üç milyard dəfə çalınır, deməli içindəki hər logic parçasının ona tapşırılan işi bitirmək üçün 333 pikosaniyəsi var. "O, saniyədə üç milyard əməliyyat yerinə yetirir" demək deyil — bu səhv oxunuşu aşağıda bir Pitfall-da parçalayacağıq.

Ənənə üzrə demək olar ki, bütün çiplər **rising edge**-də hərəkət edir: clock-un 0-dan 1-ə keçdiyi an. Falling edge nəzərə alınmır. Niyə bütün yüksək period yox, məhz bir *edge*? Çünki edge bir andır, an isə birmənalıdır. Əgər register-lər clock yüksək olduğu bütün müddət ərzində input-larını köçürsəydilər, sürətli bir siqnal bir təkanda iki register-dən keçib qaça bilərdi — konveyerdə bir fitə iki stansiyadan sürüşüb keçən hissənin ekvivalenti.

## Yadda saxlayan circuit {/*a-circuit-that-remembers*/}

Clock tək başına heç nəyi dəyişmir. Stansiyalar arasında rəf olmayan zavodda fit çalmaq tam olaraq heç nə vermir — hissələrin növbəti işçi onlara çatana qədər *dayanacaq* bir yeri olmalıdır. Bizə elə bir circuit lazımdır ki, ona "bu dəyəri tut və saxla" demək mümkün olsun; indiyə qədər qurulmuş hər circuit isə bunu bacarmır və səbəbini adlandırmağa dəyər.

Bu modulda hər şey **combinational** olub: output input-ların funksiyasıdır, elə indi, başqa heç nə yoxdur. Eyni input-ları ver, həmişə eyni output-u alarsan, keçmiş yoxdur. Belə circuit quruluşuna görə yadda saxlaya bilməz — yaddaşın yaşayacağı yer yoxdur.

Həll mühəndislikdəki böyük kiçik fikirlərdən biridir və onu ilk dəfə görəndə adamı çaşdırır. İki NOR gate götür və **hər birinin output-unu digərinin input-una geri qoş.**

<Diagram name="clock-synchronization/latch_feedback" height={340} width={720} alt="Sxem, başlıq: 'bir dövrə əlavə et və circuit yadda saxlasın'. Hər biri output-unda kiçik dairə olan mavi qalxan formasında çəkilmiş iki NOR gate biri digərinin üstündə dayanır. Monospace şriftlə R yazılmış input yuxarıdakı NOR gate-ə daxil olur; S yazılmış input isə aşağıdakı NOR gate-ə. Yuxarıdakı gate-in output-u sağa Q yazısına, aşağıdakının output-u isə sağa 'not Q' yazısına gedir. Ox başlıqlı iki qırmızı tel çarpaz əmələ gətirir: Q telinin üzərindəki qırmızı birləşmə nöqtəsi aşağı dolanır və sola qayıdaraq aşağıdakı gate-in boş input-una girir, not-Q telinin üzərindəki qırmızı birləşmə nöqtəsi isə yuxarı dolanaraq yuxarıdakı gate-in boş input-una qayıdır. Aşağıdakı altyazılar: qırmızı rəngdə 'hər output digər gate-ə geri qoşulub — cütlük öz state-ini saxlayır' və boz rəngdə 'hələ clock yoxdur, amma bu circuit-in artıq keçmişi var'.">

İki adi gate, bir əlavə cüt tel — və circuit heç bir combinational circuit-in malik ola bilmədiyi bir şey qazanır: əvvəl nə baş verdiyindən asılı olan state.

</Diagram>

İki gate bir-birinin input-larını hesablayır, ona görə onları cüt kimi yaz — və unutma ki, NOR yalnız *hər iki* input-u 0 olanda 1 verir:

```
 Q     = NOR(R, not Q)
 not Q = NOR(S, Q)
```

Niyə saxladığını izlə. Tutaq ki, `Q` 1-dir, `not Q` 0-dır, `S` və `R` isə hər ikisi 0:

```
 Q     = NOR(R=0, notQ=0)  = 1   → Q 1 qalır      ✓
 not Q = NOR(S=0, Q=1)     = 0   → notQ 0 qalır   ✓
```

Hər output digərinin öz dəyərini yaratmağa davam etməsi üçün lazım olan şərti dəqiq yaradır. Circuit özünü öz saçından tutub yuxarı saxlayır və bunu qidalanma kəsilənə və ya kimsə müdaxilə edənə qədər edəcək.

Müdaxilə etmək məhz `S` və `R`-in işidir. Əks state-dən başla — `Q=0`, `not Q=1` — və `S`-ə 1 impulsu ver:

```
 not Q = NOR(S=1, Q=0)     = 0   → notQ 0-a düşür
 Q     = NOR(R=0, notQ=0)  = 1   → Q 1-ə qalxır
 …indi isə S-i yenidən 0-a endir:
 not Q = NOR(S=0, Q=1)     = 0   → notQ 0 qalır   ✓ state saxlanıldı
```

İmpuls anlıq idi; yaratdığı state isə daimidir. **Set** və **Reset**. Bu düzülüş **SR latch** adlanır və o, hər kompüterdəki hər yaddaş bit-inin əcdadıdır, o cümlədən istifadə etdiyin maşındakı DRAM-ın.

Amma SR latch hələ bizə lazım olan şey deyil. O, input-ları tərpənən an cavab verir, bu isə məhz qaçmağa çalışdığımız anarxiyadır. İki təkmilləşdirmə bunu həll edir:

- Bir idarə input-u əlavə et ki, latch yalnız həmin input yüksək olanda qulaq assın. İndi bu, **gated D latch**-dir — `D` data deməkdir, bir input, "gate açıq olduğu müddətdə bunu saxla."
- Sonra onu bir *period* boyu deyil, bir *anda* — rising edge-də — qulaq asan et. Bu, **edge-triggered D flip-flop**-dur və standart konstruksiyada əks clock fazaları ilə idarə olunan, ardıcıl qoşulmuş iki D latch-dən qurulur, beləcə həmişə biri bağlı olur. Bu hissə bütöv bir byte və ya word saxlamaq üçün bir neçəsi yan-yana yığılanda çox vaxt **register** adlanır.

D flip-flop-un davranışı tək bir cümlədir və onu tam olaraq əzbərləməyə dəyər: **hər rising clock edge-də output input-un həmin andakı dəyərini götürür və onu saxlayır, növbəti edge-ə qədər input-un etdiyi hər şeyi nəzərə almır.**

<Note>

Lüğətimizlə indicə nə baş verdiyinə fikir ver. Bu səhifəyə qədər circuit bir *funksiya* idi: input ver, output al, keçmiş yoxdur, zaman yoxdur. Bir feedback dövrəsi ilə indi **state**-i olan circuit-lərimiz var — state-i, clock-u və aralarında logic-i olan maşın isə **finite state machine** adlanır; hər processor, protokol emalçısı, svetofor və avtomat satış maşını nəticə etibarilə məhz bu formal obyektdir. Modul 0.3 bir CPU-nu açacaq və mərkəzində dəqiq bunu tapacaq: bir yığın register, bir yığın combinational logic və *indi* deyən bir tel.

</Note>

## Hər rəqəmsal maşının forması {/*the-shape-of-every-digital-machine*/}

Flip-flop-lar və clock ilə bütün rəqəmsal dizaynı təşkil edən nizam öz-özünə ortaya çıxır və o, o qədər eynidir ki, bir dəfə görəndən sonra artıq görməmək mümkün deyil:

<Diagram name="clock-synchronization/register_logic_register" height={340} width={720} alt="Blok sxemi, başlıq: 'indiyə qədər qurulmuş hər rəqəmsal sistemin forması'. Solda mavi çalarlı, yumru künclü qutu, üzərində 'hold' və 'register' yazıları, sol alt küncündə clock input-unu işarələyən kiçik qırmızı üçbucaq. Ondan sağa ox gedir və 'combinational logic' yazılmış böyük boz qeyri-müntəzəm bulud formasına daxil olur; buludun alt yazıları: 'adder, gate-lər, decoder-lər …' və 'yaddaş yoxdur, sadəcə oturma'. Buluddan sağa daha bir ox çıxır və sağdakı eyni register qutusuna girir. Aşağıda 'clock' yazılmış üfüqi qırmızı xətt uzanır, ondan hər iki register-in clock üçbucaqlarına iki qısa qırmızı tel qalxır. Altyazı: state register-lərdə oturur, iş onların arasında görülür, nə vaxt sayıldığına isə clock qərar verir.">

Register-lər saxlayır; logic hesablayır; clock isə bu ikisini zamanda ayırır. Hər processor, GPU, şəbəkə çipi və mikrokontroller bu şəkildir, kristalı dolduranadək təkrarlanmış.

</Diagram>

Müqavilə dəqiqdir və synchronous dizaynın hamısı elə budur:

1. Rising edge-də soldakı register logic-ə sabit dəyər təqdim edir.
2. Logic işləyir — glitch verir, oturur, fizikanın etdiyini edir — period-un qalan hissəsi boyu.
3. Növbəti rising edge-dən əvvəl onun output-u **sabit və düzgün** olmalıdır.
4. Həmin edge-də sağdakı register onu tutur və dövrə təkrarlanır.

Son iki dərsin öyrətdiyi hər şey 2-ci addımda yaşayır, clock-un yeganə işi isə 3-cü addıma zəmanət verməkdir. Bu da bu dərsin ətrafında dolandığı sualı doğurur: 2-ci addıma tam olaraq nə qədər vaxt lazımdır və buna kim qərar verir?

## Sürət həddi, hesablanmış {/*the-speed-limit-calculated*/}

Flip-flop fiziki qurğudur, ona görə "edge-də tut" tələbindən əlavə öz timing tələbləri ilə gəlir. Üç rəqəm əhəmiyyət daşıyır və hər datasheet onları sadalayır:

- **Clock-to-Q (`T_cq`)** — edge-dən sonra flip-flop-un yeni output-unu həqiqətən yaratması bir az vaxt aparır. Onun cavabı da ani deyil.
- **Setup time (`T_setup`)** — input edge-dən *əvvəl* qısa bir pəncərə boyu artıq sabit olmalıdır. Flip-flop fotoaparat deklanşoru deyil; dəyəri tutarkən onun yerində dayanmasına ehtiyacı var.
- **Hold time (`T_hold`)** — input edge-dən *sonra* da qısa bir pəncərə boyu sabit qalmalıdır.

Bunları logic gecikməsinə əlavə et və rəqəmsal hardware-in fundamental bərabərsizliyini alarsan. İki təkan arasında baş verməli olan hər şey:

```
 T_clock  ≥  T_cq  +  T_logic  +  T_setup  +  T_skew
```

Ona real rəqəmlər qoy — bunlar müasir bir proses üçün inandırıcı dəyərlərdir:

```
 T_cq      =  30 ps     buraxan flip-flop-un öz gecikməsi
 T_logic   = 250 ps     combinational buluddan keçən ən yavaş yol
 T_setup   =  20 ps     tutan flip-flop-un tələbi
 T_skew    =  25 ps     clock-un uzaq ucda gec çatması (növbəti bölmə)
 ─────────────────────
 cəmi      = 325 ps

 maksimum tezlik = 1 / 325 ps ≈ 3.08 GHz
```

<Diagram name="clock-synchronization/timing_budget" height={360} width={720} alt="Sxem, başlıq: 'iki təkan arasına nə sığmalıdır'; iki üfüqi zolaq göstərilir. 'at 3 GHz' yazılmış yuxarı zolaq 333 ps-lik clock period-unu təmsil edən düzbucaqlıdır, soldan sağa dörd rəngli hissə ilə doldurulub: Tcq, 'logic delay', 'setup' və qırmızı 'skew' hissəsi, ardınca 'slack' yazılmış kiçik kəsik mavi hissə; altında mavi rəngdə hökm yazılıb: 'sığır, 8 ps ehtiyatla'. 'at 4 GHz' yazılmış aşağı zolaq eyni dörd hissəni daha qısa, 250 ps-lik period çərçivəsinə qarşı göstərir, ona görə hissələr çərçivənin sağ kənarından kənara, 'late' yazılmış tam qırmızı bloka çıxır; altında qırmızı rəngdə hökm yazılıb: 'edge-i 75 ps ilə buraxır'. Aşağıdakı altyazılar: 30 + 250 + 20 + 25 = 325 ps iş növbəti rising edge-dən əvvəl bitməlidir; və: bütün çipdəki ən yavaş yol onun hər hissəsi üçün clock-u müəyyən edir.">

Eyni circuit, iki fərqli fitə qarşı. İki zolaq arasında logic-də heç nə dəyişməyib — yalnız ona verilən vaxt.

</Diagram>

Aşağıdakı zolağı diqqətlə oxu, çünki bu dərsin ən vacib nəticəsi orada yerləşir. 4 GHz-də period 250 ps-dir və bizim 325 ps-lik işimiz oraya sığmır. Çip nə daha yavaş işləyir, nə qızır, nə də təxmini cavab qaytarır. Tutan flip-flop hələ oturmamış bir dəyəri sample edir və **zibil** saxlayır; həmin andan etibarən maşın heç vaxt mövcud olmamış bir ədəd üzərində əminliklə hesablama aparır. Timing nasazlıqları bu kursun dəfələrlə rastlaşdığı cinayətkarın hardware variantıdır: səssiz, səhv data.

Altyazıdakı ifadəyə də fikir ver: *bütün çipdəki ən yavaş yol*. Orta yol yox — **critical path**. Milyard transistorlu dizaynın hansısa gözdən uzaq küncündən keçən tək bir bədbəxt marşrut 400 ps çəkirsə, onda bütün processor, hər nüvə, hər cache həmin bir yol üçün kifayət qədər yavaş clock-lanmalıdır. Elə buna görə çip dizaynerləri critical path ovuna nəhəng səy sərf edir və elə buna görə keçən dərsin carry-lookahead adder-i ümumiyyətlə mövcuddur: 64-bit ripple-carry adder-ə təxminən 1,920 ps lazımdır ki, bu da tək başına bütün CPU-nu təxminən **0.5 GHz**-də saxlayardı.

<Pitfall>

**Daha yüksək clock daha sürətli kompüter demək deyil.**

Səhv gigahertz-i məhsuldarlıq rəqəmi kimi qəbul etməkdir. O, məhsuldarlıq deyil; onun yarısıdır. Əsl əlaqə belədir:

```
 saniyədə iş  =  dövrə başına iş  ×  saniyədə dövrə
                 └── IPC ──┘         └── frequency ──┘
```

Bir dizayn hər dövrədə *daha az* iş görməklə tezlik ala bilər — logic-i daha çox, daha kiçik mərhələyə doğra ki, hər biri daha qısa period-a sığsın. Pentium 4-ün NetBurst arxitekturası məhz bunu etdi və elə buna görə 3.8 GHz-lik Pentium 4 2.4 GHz-də işləyən AMD Athlon 64-ə benchmark-larda uduza bilirdi: Athlon hər təkanda xeyli çox iş görürdü. AMD buna o qədər söykəndi ki, məhsul adlarında clock sürətini yazmağı tamamilə dayandırdı və bunun əvəzinə "Athlon 64 3200+" satdı — bu rəqəm öz clock-unu təsvir etmək üçün yox, *3.2 GHz-lik rəqiblə müqayisə oluna bilən* mənasında seçilmişdi. Apple da eyni fikir üzərində, "the megahertz myth" adı ilə reklam kampaniyası apardı.

Düzəliş qutunun üzərindəki rəqəmi yox, həmişə **real bir tapşırığın bitmə vaxtını** müqayisə etməkdir. Eyni tələnin müasir libası da var: eyni tezlikli iki maşın cache davranışı, nüvə sayı, yaddaş buraxma qabiliyyəti və ya istilik throttling-i səbəbindən dəfələrlə fərqlənə bilər — on bir saniyə 5 GHz-ə qalxıb sonra 2.5 GHz-ə oturan noutbukun asqırıqdan uzun istənilən iş üçün 5 GHz stikeri və 2.5 GHz məhsuldarlığı var.

</Pitfall>

## Fit hamıya çatmalıdır {/*the-whistle-has-to-reach-everyone*/}

Timing tənliyində əsaslandırmadığımız bir üzv var: `T_skew`. O ona görə mövcuddur ki, clock mücərrəd bir fikir deyil — o, çipdəki hər flip-flop-a çatmalı olan fiziki teldəki gərginlikdir və flip-flop-ların sayı yüz milyonlarladır.

Onların hamısı mənbədən eyni məsafədə ola bilməz. Ona görə clock bəzi flip-flop-lara digərlərindən bir az əvvəl çatır və bu fərq **clock skew** adlanır. Bir register fiti qonşusundan 25 ps sonra eşidirsə, ən pis halda qəbul edən tərəfin input-unu hazır etmək üçün faktiki olaraq 25 ps az vaxtı olur — skew birbaşa logic büdcəsindən çıxılır, elə buna görə də bərabərsizlikdə oturur.

<Diagram name="clock-synchronization/clock_tree_skew" height={400} width={720} alt="Sxem, başlıq: 'bir təkan, milyonlarla dinləyici'. Solda 'clock source' yazılmış qırmızı nöqtə sağa doğru şaquli qırmızı onurğaya qoşulur, o da simmetrik şəkildə yuxarı və aşağı üfüqi qırmızı tellərə ayrılır, onların hər biri yenidən iki qısa şaquli hissəyə, sonra isə dörd üfüqi telə ayrılaraq sağdakı FF yazılmış dörd boz qutuya çatır. Qutulardan üçü mavi rəngdə '0 ps-də çatır', ən aşağıdakı isə qırmızı rəngdə '25 ps-də çatır' qeydi ilə işarələnib. Aşağıdakı altyazılar: sonuncu flip-flop fiti 25 ps gec eşidir — həmin fərq clock skew-dur və onun hər pikosaniyəsi logic büdcəsindən oğurlanır.">

Çip dizaynerləri skew ilə qəsdən simmetrik paylama şəbəkələri vasitəsilə mübarizə aparır — klassik şablon **H-tree**-dir, burada mənbədən yarpağa gedən hər yol quruluşuna görə eyni uzunluqdadır.

</Diagram>

Clock şəbəkəsi haqqında iki fakt özünlə gəzdirməyə dəyər, çünki onlar müasir çiplər haqqında çox şeyi izah edir.

**Birincisi: clock kristaldakı ən böyük enerji istehlakçılarından biridir.** O, *hər tək dövrədə, hər yerdə* keçid edən yeganə siqnaldır və CMOS enerjini məhz keçid edəndə yandırır (bu modulun Dərs 1-i). Yüz milyonlarla flip-flop input-unu sürən və saniyədə milyardlarla dəfə çevrilən şəbəkə processor-un ümumi gücünün ciddi bir hissəsini təşkil edə bilər. Standart həll **clock gating**-dir: bu dövrədə görəcək işi olmayan çip hissələrinə fiti kəsmək — boş dayanan noutbukun sərin, kompilyasiya edənin isə isti olmasının böyük bir səbəbi elə budur.

**İkincisi və daha qəribəsi: müasir tezliklərdə çip bir clock təkanından böyükdür.** İşıq bir nanosaniyədə təxminən 30 sm yol gedir. 3 GHz-də bir tam period 333 ps-dir, deməli:

```
 bir 3 GHz dövrəsində işıq:               ≈ 10 sm
 silikonda elektrik siqnalı:              ≈  5 sm   (ən yaxşı halda c-nin təxminən yarısı)
 böyük bir processor kristalı:            ≈  2 sm eninə

 → siqnal ən yaxşı halda təkan başına kristalı təxminən iki dəfə keçə bilir,
   hələ heç bir transistor gecikməsi hesablanmadan
```

10 GHz-də — Intro-nun vədində — bir period 100 ps-dir, siqnal bəlkə 1.5 sm yol gedir və sadəcə *çipi keçmək* bütün dövrəni yeyir. Bu, optimallaşdırılıb aradan qaldırılası mühəndislik çətinliyi deyil; bu, işıq sürətinin qoyduğu bir döşəmədir. Elə buna görə müasir dizaynlar əsasən qonşuları ilə danışan çoxlu kiçik, lokal bloklardan qurulur: bu sürətlərdə məsafə zamandır.

<DeepDive>

#### Metastability: dizaynla aradan qaldıra bilmədiyin nasazlıq {/*metastability-the-failure-you-cannot-design-away*/}

Yuxarıdakıların hamısı flip-flop-a gələn data-nın setup və hold-a hörmət etdiyini fərz etdi. Bir clock domeni daxilində dizayner buna zəmanət verə bilər. Amma bəzi input-lar sadəcə bizim nəzarətimizdə deyil — insan barmağı ilə basılan düymə, öz kristal osilyatoru olan şəbəkə çipindən gələn paket, çipin 800 MHz-də işləyən bir hissəsindən 2.4 GHz-də işləyən başqa hissəsinə keçən siqnal. Belə siqnal nəhayət *tam olaraq* qadağan olunmuş anda, düz setup pəncərəsinin içində dəyişəcək.

Onda baş verən şey rəqəmsal elektronikanın ən qəribə hadisəsidir. Flip-flop nə 0 seçir, nə də 1. O, **metastability**-yə düşür: qeyri-sabit tarazlıq nöqtəsi, burada daxili feedback dövrəsinin hər iki yarısı yarı-açıq vəziyyətdə dayanır və output nə qanuni 0, nə də qanuni 1 olan aralıq gərginlikdə asılı qalır. Bu, ucunda mükəmməl tarazlanmış karandaşın, ya da iki eyni ot tayası arasında heç nə bərabərliyi pozmadığı üçün ac qalan filosofların Buridan eşşəyinin elektron versiyasıdır.

Karandaş nəhayət yıxılır. Flip-flop da elə — istilik noise-u onu zirvədən itələyir və o, hansısa dəyərdə oturur. Problem ondadır ki, **bunun nə qədər çəkəcəyinə yuxarı hədd yoxdur.** Həll vaxtı ehtimallıdır və eksponensial olaraq azalır:

```
 MTBF  ≈  e^(t / τ)  /  (T₀ × f_clock × f_data)
```

Düsturu əzbərləmə; eksponentin nə etdiyinə bax. Nümunə dəyərlərlə (τ = 20 ps, 1 GHz clock, saniyədə 10 milyon dəfə dəyişən asinxron input) müəyyən `t` oturma ehtiyatı üçün nasazlıqlar arasındakı orta vaxt:

```
  t = 200 ps   →  MTBF ≈ 0.1 saniyə        (fəlakət)
  t = 400 ps   →  MTBF ≈ 40 dəqiqə         (hələ də yararsız)
  t = 600 ps   →  MTBF ≈ 1.7 il            (bir yerə gedir)
```

Hər əlavə 200 ps gözləmə təxminən *dörd tərtib* etibarlılıq aldı. Bütün mühəndislik strategiyası həmin eksponentdir və o, demək olar ki, həddindən artıq sadə görünən standart həlli yaradır: **ardıcıl iki flip-flop** qoy və asinxron siqnalı hər ikisindən keçir. Birincisi metastable ola bilər; sonra ikincisi onu sample etməzdən əvvəl həll olmaq üçün tam bir clock period-u alır. Ardıcıl iki flip-flop **synchronizer** adlanır və siqnalın bir clock domenindən digərinə keçdiyi hər sərhəddə məcburidir — bu nizam **clock domain crossing** kimi tanınır və bütün hardware-də aralı-aralı görünən, təkrarlana bilməyən, karyera qısaldan bug-ların ən zəngin mənbələrindən biridir.

Synchronizer-in nə etdiyinə və nə etmədiyinə diqqətlə fikir ver. O, metastability-ni aradan qaldırmır — bu mümkün deyil və bunun sübutu var: məhdud vaxtda iki variant arasında qərar verməli olan istənilən qurğu tam səhv anda gələn input-la qeyri-məhdud qərara sürüklənə bilər. Synchronizer-in etdiyi şey nasazlıqlar arasındakı orta vaxtı əsrlərə qədər itələməkdir ki, "mümkünsüz" ilə "Günəş genişlənənə qədər baş verməyəcək" mühəndislik məqsədləri üçün eyni ifadəyə çevrilsin. Bu, Dərs 10-un 256-bit seed-i ilə eyni sövdələşmədir: pis halı mümkünsüz edə bilməzsən, yalnız əlçatmaz edə bilərsən.

</DeepDive>

<DeepDive>

#### Fitdən imtina edən maşınlar {/*the-machines-that-refused-the-whistle*/}

Bir addım geri çəkil və clock-un bizə nəyə başa gəldiyinə fikir ver. Data asan olanda belə hər circuit ən pis halı gözləyir — aşağıdakı Sandpack sənə 4 gate delay-də oturan bir toplamanın necə yenə də 16 aldığını göstərəcək. Clock şəbəkəsi güc büdcəsinin böyük hissəsini yandırır. Skew hər timing yolundan dişləyir. Bütün çip özünün tək ən yavaş marşrutunun girovudur.

Bəs onda niyə ümumiyyətlə clock-suz circuit-lər qurmayaq — belə ki, hər blok növbətisinə "işim bitdi" siqnalı versin və iş data-nın həqiqətən imkan verdiyi sürətlə irəli axsın? Bu, **asynchronous** (və ya self-timed) logic-dir və o, fikir təcrübəsi deyil. 1988-ci il Turing mükafatını artıq almış Ivan Sutherland öz Turing mühazirəsini məhz bu əl-sıxma fikri üzərində qurduğu və **micropipelines** adlandırdığı dizayn üslubuna həsr etdi. 1990-cı illər boyu Manchester Universitetindəki bir komanda **AMULET** processor-larını qurdu — ARM arxitekturasının tam asinxron implementasiyalarından ibarət seriya; onlar real ARM kodunu işlədirdilər və içlərində heç bir yerdə clock yox idi.

Üstünlüklər realdır: ən pis hal əvəzinə orta hal sürəti, clock gücü yoxdur, skew yoxdur, kəskin şəkildə az elektromaqnit şüalanma (clock-lu çip öz tezliyində qışqırır, asinxron olan isə geniş zolaqda uğuldayır) və gərginliklə temperatur sürüşəndə mülayim davranış. Bəs onda qarşındakı maşın niyə synchronous-dur?

Çünki fit bütün bunlardan daha dəyərli bir şey alır: **dayanacaq bir yer.** Clock ilə dizayner circuit haqqında diskret, tamamlanmış state-lərin ardıcıllığı kimi düşünə bilir — simulyasiya, formal verifikasiya, statik timing analizi və avtomatlaşdırılmış place-and-route-dan ibarət bütün alət zənciri məhz bu fərziyyə üzərində qurulub. Onu çıxart, hər blokun əl-sıxma sxeminə (sahə və gecikmə) ehtiyacı olar, alətlər əsasən mövcud deyil və verifikasiya problemi hər siqnalın hər mümkün ardıcıllığı haqqında düşünməyə çevrilib partlayır. Asinxron dizayn məhz yüzlərlə adamdan ibarət komandalara milyard transistorlu çiplər qurmağa imkan verən şeyi əldən verdi.

Faktiki olaraq buraxılan isə kompromisdir. Müasir processor bir clock domeni deyil, *çoxlu* domendir — nüvələr, yaddaş interfeysi və I/O üçün fərqli tezliklər — hər biri daxilən synchronous, hər sərhəddə isə synchronizer-lər. Qlobal olaraq asinxron, lokal olaraq synchronous. Fit qalib gəldi, sadəcə indi birdən çox zavod var.

</DeepDive>

## Timing laboratoriyası {/*the-timing-lab*/}

İşləyən bir circuit-i sırf tələsdirməklə sındırmağın vaxtıdır. Aşağıda keçən dərsin 8-bit adder-i var, indi clock ilə. Ədədləri seç, sonra clock period-unu sürüşdür və sample nöqtəsinin necə hərəkət etdiyinə bax: oturmuş bit-lər öz real dəyərlərini bildirir, oturmayanlar isə `?` kimi göstərilir — çünki dürüst desək, onlar haqqında bildiyin yalnız budur.

Ardıcıllıqla üç şey etməyə dəyər. `1 + 1` yüklə və ona nə qədər az vaxt lazım olduğunu gör. `127 + 1` yüklə və oturma vaxtlarının carry zənciri boyunca 16 gate delay-ə qədər necə qalxdığını izlə. Sonra `127 + 1` yüklü halda period-u 10-a endir və maşının indi əmin, konkret və tamamilə səhv bir cavab qaytardığını müşahidə et — heç bir xəta, heç bir xəbərdarlıq və növbəti mərhələnin bunu bilməsi üçün heç bir yol olmadan.

<Sandpack>

```js
import { useState } from 'react';

const N = 8;
const ACC = '#087ea4';
const DNG = '#c1554d';
const GATE_PS = 15; // gate delay başına pikosaniyə

const toBits = (v) => Array.from({ length: N }, (_, i) => (v >> i) & 1);
const toVal = (bits) => bits.reduce((s, b, i) => s + b * 2 ** i, 0);

// generate / propagate timing-i, dəqiq olaraq keçən dərsdəki model
function analyse(a, b) {
  const cVal = [0];
  const cValid = [0];
  for (let i = 0; i < N; i++) {
    const g = a[i] & b[i];
    const p = a[i] ^ b[i];
    if (p === 1) {
      cVal.push(cVal[i]);          // bu sütun sadəcə carry-ni ötürür
      cValid.push(cValid[i] + 2);  // ona görə onu gözləməlidir
    } else {
      cVal.push(g);                // lokal həll olunub, gözləmək yoxdur
      cValid.push(2);
    }
  }
  const sum = [];
  const settle = [];
  for (let i = 0; i < N; i++) {
    sum.push(a[i] ^ b[i] ^ cVal[i]);
    settle.push(Math.max(2, cValid[i] + 2));
  }
  return { sum, settle, worst: Math.max(...settle) };
}

export default function TimingLab() {
  const [a, setA] = useState(toBits(127));
  const [b, setB] = useState(toBits(1));
  const [period, setPeriod] = useState(18);

  const { sum, settle, worst } = analyse(a, b);
  const stable = settle.map((t) => t <= period);
  const badBits = stable.filter((s) => !s).length;
  const correct = badBits === 0;

  const av = toVal(a);
  const bv = toVal(b);
  const trueSum = toVal(sum);
  const maxGHz = 1000 / (worst * GATE_PS);
  const nowGHz = 1000 / (period * GATE_PS);

  const flip = (arr, set, i) => set(arr.map((v, j) => (j === i ? 1 - v : v)));
  const preset = (x, y) => { setA(toBits(x)); setB(toBits(y)); };
  const idx = Array.from({ length: N }, (_, k) => N - 1 - k);
  const TMAX = 20;
  const pct = (t) => `${(t / TMAX) * 100}%`;

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => preset(1, 1)}>1 + 1</button>{' '}
        <button onClick={() => preset(15, 1)}>15 + 1</button>{' '}
        <button onClick={() => preset(127, 1)}>127 + 1</button>{' '}
        <button onClick={() => preset(200, 100)}>200 + 100</button>
      </div>

      <div style={{ fontFamily: 'monospace', marginBottom: 8 }}>
        <div>
          A {idx.map((i) => (
            <button key={i} onClick={() => flip(a, setA, i)} style={{
              width: 30, height: 30, margin: 1, cursor: 'pointer',
              fontFamily: 'monospace',
              border: `1px solid ${a[i] ? ACC : '#888'}`,
              background: a[i] ? `${ACC}22` : 'transparent'
            }}>{a[i]}</button>
          ))} = {av}
        </div>
        <div>
          B {idx.map((i) => (
            <button key={i} onClick={() => flip(b, setB, i)} style={{
              width: 30, height: 30, margin: 1, cursor: 'pointer',
              fontFamily: 'monospace',
              border: `1px solid ${b[i] ? ACC : '#888'}`,
              background: b[i] ? `${ACC}22` : 'transparent'
            }}>{b[i]}</button>
          ))} = {bv}
        </div>
      </div>

      <div style={{ margin: '14px 0' }}>
        <label style={{ fontSize: 14 }}>
          clock period: <b style={{ fontFamily: 'monospace' }}>{period}</b> gate
          delay = {period * GATE_PS} ps ={' '}
          <b style={{ fontFamily: 'monospace' }}>{nowGHz.toFixed(2)} GHz</b>
        </label>
        <input type="range" min="2" max={TMAX} value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          style={{ width: '100%' }} />
      </div>

      {/* hər bit üçün oturma zolaqları */}
      <div style={{ position: 'relative' }}>
        {idx.map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}>
            <span style={{ width: 34, fontFamily: 'monospace', fontSize: 13 }}>S{i}</span>
            <div style={{
              position: 'relative', flex: 1, height: 20,
              background: '#8881', borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: pct(settle[i]), background: `${DNG}44`
              }} />
              <div style={{
                position: 'absolute', left: pct(settle[i]), top: 0, bottom: 0,
                right: 0, background: `${ACC}33`
              }} />
              <span style={{
                position: 'absolute', left: `calc(${pct(settle[i])} + 6px)`,
                fontSize: 11, lineHeight: '20px', color: ACC
              }}>{settle[i]}-də oturur</span>
            </div>
            <span style={{
              width: 30, textAlign: 'center', fontFamily: 'monospace',
              fontSize: 17, color: stable[i] ? ACC : DNG
            }}>{stable[i] ? sum[i] : '?'}</span>
          </div>
        ))}
        {/* sample xətti */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `calc(34px + (100% - 64px) * ${period / TMAX})`,
          width: 2, background: correct ? ACC : DNG
        }} />
      </div>

      <p style={{ fontFamily: 'monospace', fontSize: 15, marginTop: 12 }}>
        latch-lənmiş dəyər:{' '}
        <b style={{ color: correct ? ACC : DNG }}>
          {idx.map((i) => (stable[i] ? sum[i] : '?')).join('')}
        </b>
        {correct
          ? ` = ${trueSum}`
          : `  (əsl cavab ${trueSum})`}
      </p>

      <div style={{
        padding: '10px 14px', borderRadius: 10, marginTop: 4,
        border: `2px solid ${correct ? ACC : DNG}`,
        background: correct ? `${ACC}18` : `${DNG}18`
      }}>
        {correct ? (
          <span style={{ color: ACC }}>
            <b>Sabit.</b> Hər bit {period - worst} gate delay ehtiyatla oturdu.
          </span>
        ) : (
          <span style={{ color: DNG }}>
            <b>Timing nasazlığı.</b> Edge gələndə {N} bit-dən {badBits} dənəsi
            hələ hərəkətdə idi. Register elə bir dəyər saxladı ki, o nə cəmdir,
            nə köhnə dəyərdir, nə də hər hansı truth table-ın hər hansı sətridir
            &mdash; və aşağıdakı heç nə bunu bilə bilməz.
          </span>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>
        Bu ədədlərə {worst} gate delay lazımdır, deməli təkcə bu toplama clock-u{' '}
        <b>{maxGHz.toFixed(2)} GHz</b>-də saxlayır (gate başına {GATE_PS} ps ilə).{' '}
        <code>1 + 1</code>, sonra isə <code>127 + 1</code> sına: circuit eynidir,
        data isə yox &mdash; clock-un məhz ən pis hala görə təyin olunmasının və
        heç vaxt işlətdiyin konkret hala görə təyin olunmamasının səbəbi elə budur.
      </p>
    </div>
  );
}
```

</Sandpack>

Həmin son cümlə dərsin bütün əxlaqıdır və onu açıq şəkildə demək lazımdır. `1 + 1` 4 gate delay-də bitir; `127 + 1`-ə 16 lazımdır. Hardware çətin data üçün clock-dan əlavə vaxt istəyə bilmir və asan data üçün tez qayıda bilmir. Ona bir aralıq verilir, bir dəfə, dizayn zamanı, kiminsə nə vaxtsa verə biləcəyi ən pis input üçün seçilmiş. Sənin processor-undakı hər sürətli hal heç vaxt baş verməyə bilən yavaş bir halı səssizcə gözləyir.

Bu müşahidə həm də bir qapıdır. Əgər işin çoxu tez bitirsə və clock nadir bir ən pis hal tərəfindən təyin olunursa, onda açıq-aydın gediş *uzun yolu daha qısa parçalara doğramaqdır* ki, fit daha tez çalına bilsin — və eyni anda bir neçə instruction havada olsun, hər biri fərqli mərhələdə. Bu, **pipelining**-dir və o, processor dizaynındakı ən vacib fikirdir. Onun öz dərsi var, iki dayanacaq sonra.

<Recap>

- Combinational logic yalnız *nəhayətdə* düzgündür. Fərqli output bit-ləri fərqli vaxtlarda oturur, aralarında isə **glitch**-lər yaradır — heç bir truth table sətrinə uyğun gəlməyən dəyərlər. Truth table təyinat nöqtəsini təsvir edir, səyahəti heç vaxt yox.
- **Clock** sonsuz təkrarlanan düzbucaqlı dalğa daşıyan bir teldir. Onun **period**-u `T` və **tezliyi** bir-birinin tərsidir: 1 GHz = təkan başına 1000 ps, 3 GHz ≈ 333 ps, 4 GHz = 250 ps. Demək olar ki, bütün logic **rising edge**-də hərəkət edir, çünki an birmənalıdır, zaman parçası isə yox.
- Feedback yaddaş yaradır: iki NOR gate-i çarpaz qoş və öz state-ini saxlayan **SR latch** alarsan. Ona gate qoy, sonra onu edge-triggered et və **D flip-flop** alarsan — *hər rising edge-də input-u tut və növbəti edge-ə qədər saxla*. Circuit-lər məhz burada funksiya olmaqdan çıxıb **state machine** olmağa başlayır.
- Hər rəqəmsal sistemin bir forması var: **register → combinational logic → register**, clock isə hər iki register-i qidalandırır. State register-lərdə yaşayır; iş onların arasında görülür.
- Sürət həddi arifmetikadır: **T_clock ≥ T_cq + T_logic + T_setup + T_skew**. 30 + 250 + 20 + 25 = 325 ps ilə tavan təxminən **3.08 GHz**-dir — və hesaba gələn `T_logic` **critical path**-dir, yəni bütün çipdəki tək ən yavaş marşrut.
- **Clock skew** clock-un fərqli flip-flop-lara fərqli vaxtlarda çatmasıdır; o, birbaşa logic büdcəsindən çıxılır və ona qarşı simmetrik **H-tree** paylaması ilə mübarizə aparılır. Clock şəbəkəsi həm də kristaldakı ən böyük enerji istehlakçılarından biridir — **clock gating** elə buna görə mövcuddur.
- Tezlik məsələsində son sözü fizika deyir: 3 GHz-də silikondakı siqnal təkan başına təxminən 5 sm yol gedir, kristal isə təxminən 2 sm enindədir; 10 GHz-də isə o, çipi güclə keçir.
- **Metastability** aradan qaldırıla bilməz, yalnız ehtimalsız edilə bilər: tam səhv anda sample edilən flip-flop qeyri-məhdud müddət 0 ilə 1 arasında asılı qalır. Ardıcıl iki flip-flop — **synchronizer** — MTBF-i saniyənin hissələrindən əsrlərə qədər itələyir və hər **clock domain crossing**-də məcburidir.
- Clock sürəti məhsuldarlıq deyil: **saniyədə iş = dövrə başına iş × saniyədə dövrə**, elə buna görə 3.8 GHz-lik Pentium 4 2.4 GHz-lik Athlon 64-ə uduza bilirdi.

</Recap>

<Challenges>

#### Fiti tənzimlə {/*set-the-whistle*/}

Bir dizaynın timing-i belədir: `T_cq` = 40 ps, ən yavaş combinational yol 310 ps, `T_setup` = 25 ps və clock skew 35 ps. (a) Bu dizaynın işləyə biləcəyi ən sürətli clock hansıdır? (b) Komanda 3.5 GHz istəyir. Neçə pikosaniyə kəsilməlidir və inandırıcı olaraq haradan gələ bilər? (c) Onun əvəzinə 2 GHz-də buraxsalar, hər dövrədə nə qədər slack olar?

<Hint>

Minimum period-u almaq üçün dörd rəqəmi topla, sonra tezlik üçün onu tərsinə çevir. (b) üçün 3.5 GHz-in tələb etdiyi period-u hesabla və müqayisə et. Dörd üzvdən hansını dizaynerin həqiqətən dəyişə bildiyini xatırla.

</Hint>

<Solution>

**(a)** Büdcəni topla:

```
 40 + 310 + 25 + 35 = 410 ps

 maks. tezlik = 1 / 410 ps = 1 / (410 × 10⁻¹²) ≈ 2.44 GHz
```

**(b)** 3.5 GHz `1 / 3.5 GHz ≈ 286 ps` period tələb edir. Dizayna isə 410 ps lazımdır, deməli **124 ps çıxarılmalıdır**.

Haradan? `T_cq` və ya `T_setup`-dan yox — bunlar flip-flop hüceyrələrinin xassələridir, proses kitabxanası tərəfindən sabitlənib. Geriyə ikisi qalır:

- **Logic yolu (310 ps).** Əsl hədəf budur: critical path-i keçən dərsin carry-lookahead-inin carry zəncirini yenidən qurduğu kimi yenidən qur, ya da onu iki dövrəyə böl (pipelining), bu isə bir 310 ps-lik mərhələni təxminən 155 ps-lik iki mərhələyə çevirir.
- **Skew (35 ps).** Daha yaxşı balanslaşdırılmış clock tree 10–20 ps qaytara bilər, amma tək başına 124 ps verə bilməz.

Reallıqda bunu yalnız pipelining və ya logic-in yenidən dizaynı verir — "sadəcə clock-u artıra bilərikmi?" tipli sorğuların çoxuna dürüst cavab budur.

**(c)** 2 GHz-də period 500 ps-dir, deməli slack dövrə başına `500 − 410 = 90 ps`-dir. Fikir verməyə dəyər: bu slack israf deyil, o, *margin*-dir — çip isti olanda, qidalanma gərginliyi düşəndə və istehsal olunmuş konkret kristal proses fərqinin yavaş tərəfinə düşəndə onun işləməyə davam etməsini təmin edən yastıq. Sıfıra yaxın slack ilə buraxmaq, stolüstü sınaqda işləyən, isti otaqda isə nasaz olan məhsul almağın yoludur.

</Solution>

#### Yaddaş haradan gəlir? {/*where-does-the-memory-come-from*/}

SR latch iki NOR gate-dən qurulub və `NOR` yalnız hər iki input 0 olanda 1 verir. `S=0, R=0, Q=1, notQ=0` state-indən başlayaraq circuit-in state-i saxladığını göstər. Sonra `R`-ə 1 impulsu ver və oturana qədər gate-bə-gate nə baş verdiyini izlə. Nəhayət, bir cümlə ilə izah et ki, `S=1, R=1` niyə qadağandır.

<Solution>

**Saxlama.** Circuit `Q = NOR(R, notQ)` və `notQ = NOR(S, Q)` cütüdür. `S=0, R=0` və `Q=1, notQ=0` state-i ilə:

```
 Q     = NOR(R=0, notQ=0)  = 1   → Q 1 qalır      ✓
 not Q = NOR(S=0, Q=1)     = 0   → notQ 0 qalır   ✓
```

Hər gate digərinə hazırkı dəyərini yaratmağa davam etmək üçün lazım olan input-u dəqiq verir. Heç nə dəyişə bilməz, deməli state davam edir — və həmin davamlılıq *elə yaddaşın özüdür*.

**R-ə 1 impulsu vermək** (reset, `Q=1, notQ=0`-dan başlayaraq):

```
 addım 1:  Q     = NOR(R=1, notQ=0)  = 0    ← R Q-nu aşağı məcbur edir
 addım 2:  not Q = NOR(S=0, Q=0)     = 1    ← aşağıdakı gate azad olur
 addım 3:  Q     = NOR(R=1, notQ=1)  = 0    ← hələ 0, indi hər iki tərəfdən saxlanır
 R-i 0-a burax:
 addım 4:  Q     = NOR(R=0, notQ=1)  = 0    ← tək başına notQ Q-nu aşağı saxlayır ✓
```

`Q=0, notQ=1`-də oturdu və `R` 0-a qayıtdıqdan sonra da orada qalır. 3-cü və 4-cü addımlardakı ötürməyə fikir ver: `R` yüksək olduğu müddətdə işi o görürdü, əlini çəkənə qədər isə feedback dövrəsi işi üzərinə götürmüşdü. Input bir təkandır; yaddaş isə dövrədir.

**`S=1, R=1` niyə qadağandır:** hər iki gate aşağı məcbur edilir, deməli `Q` və `not Q` *hər ikisi* 0 olur — adları onların əks olduğunu vəd edən iki output, halbuki əks deyillər, ona görə onları oxuyan istənilən sonrakı logic mümkünsüz bir state görür. Daha dərin problem buraxma anında gəlir: hər iki input eyni anda 0-a qayıdarsa, hər iki gate eyni anda qalxmağa çalışar, hər biri hələ də digərini aşağı görər və hansının qalib gələcəyinə transistor gücündəki nanoskopik fərqlər və istilik noise-u qərar verər. Latch gözlənilməz şəkildə istənilən state-ə düşür — və ya onların arasında tarazlanır ki, bu da məhz bu dərsin DeepDive-ındakı **metastability**-dir, sadəcə buraya tamamilə başqa istiqamətdən gəlmiş.

</Solution>

#### Aralı-aralı görünən bug {/*the-intermittent-bug*/}

Köçürmə tapşırığı. Bir lövhənin debug-ına kömək edirsən. Mikrokontroller sensor lövhəsindəki mexaniki açardan `DOOR_OPEN` siqnalını oxuyur; iki lövhənin ayrı osilyatorları var. Firmware belə edir:

```c
if (door_open_reg) { halt_motor(); }
```

Bildirilən simptom: *"Təxminən hər bir neçə gündən bir mühərrik səbəbsiz dayanır, ya da qapı açılanda dayanmır. Bunu təkrarlaya bilmirik. Naqilləri yoxladıq, açarı dəyişdik, döngüyə gecikmə əlavə etdik və hər şeyi log-ladıq — log göstərir ki, register sensor lövhəsinin göndərdiyinə zidd bir dəyər oxuyur."*

Kök səbəbi bu dərsin dili ilə izah et, sınadıqları hər həllin niyə əvvəlcədən uğursuz olduğunu de və tövsiyəni yaz — həllin nəyə zəmanət verdiyini və nəyə vermədiyini də daxil edərək.

<Solution>

**Kök səbəb: sinxronlaşdırılmamış clock domain crossing.** Sensor lövhəsinin öz osilyatoru var, ona görə `DOOR_OPEN` mikrokontrollerin clock-u ilə heç bir əlaqəsi olmayan anlarda dəyişir. Gec-tez — və "hər bir neçə gündən bir" tam olaraq doğru tərtibdir — siqnal tutan flip-flop-un setup/hold pəncərəsinin içində keçid edir. Həmin flip-flop **metastable** olur, qeyri-məhdud müddət 0 ilə 1 arasında asılı qalır və sonrakı logic ondan nə sample edirsə, o da özbaşınadır. Daha pisi, həmin asılı qalmış output-u oxuyan müxtəlif circuit hissələri onu *fərqli* şəkildə həll edə bilər — log-un reallığa "zidd" görünməsinin səbəbi elə budur.

**Sınanan hər həll niyə əvvəlcədən uğursuz idi:**

- **Naqilləri yoxlamaq / açarı dəyişmək.** Hardware qaydasındadır. Bu, nasazlıq deyil; bu, timing tələblərini pozan input verilmiş flip-flop-un düzgün davranışıdır. Tapılası sınıq bir şey yoxdur.
- **Döngüyə gecikmə əlavə etmək.** Gecikmə sample-ın *nə vaxt* baş verdiyini dəyişir, asinxron siqnalın gec-tez qadağan pəncərəyə düşəcəyi faktını yox. Lotereyanı sürüşdürür, oynamağı dayandırmır.
- **Onu təkrarlamağa çalışmaq.** Nasazlıq ehtimalı sample başına eksponensial dərəcədə kiçik, aylar üzrə isə nəhəngdir, ona görə tələb üzrə praktiki olaraq təkrarlana bilməzdir — bütün bu nasazlıq sinfinin imzası elə budur. Təkrarlanmağa müqavimət göstərən və iki clock domeni ilə bağlı olan aralı-aralı bug səni hər şeydən əvvəl sinxronizasiyadan şübhələnməyə vadar etməlidir.

**Tövsiyə:** *"Bu, naqil nasazlığı deyil, klassik clock-domain-crossing uğursuzluğudur. `DOOR_OPEN` bizim clock-umuza asinxrondur, ona görə giriş flip-flop-u arabir metastable olacaq və logic-in qalanına təyin olunmamış dəyər verəcək. Həll: siqnalı onu hər hansı bir şey oxumazdan əvvəl eyni clock domenindəki iki flip-flop-luq synchronizer-dən keçirin — birinci mərhələ metastability-ni udur və həll olmaq üçün tam clock period-u alır, ikinci mərhələ isə təmiz dəyər təqdim edir. Ondan sonra debouncing əlavə edin, çünki mexaniki açar həm də sıçrayır. Təhlükəsizlik nəzərdən keçirməsi üçün qeyd: bu, nasazlığı astronomik dərəcədə ehtimalsız edir (MTBF günlərlə yox, əsrlərlə), amma onu mümkünsüz etmir — metastability aradan qaldırıla bilməz, yalnız uzağa itələnə bilər. Mühərriki dayandırmaq təhlükəsizlik baxımından kritikdirsə, synchronizer müstəqil hardware interlock-un əvəzinə yox, onun yanında dayanmalıdır."*

Köçürülə bilən vərdiş bu modulun fərqli libaslarda təkrar-təkrar öyrətdiyi vərdişdir: **sərhəddə müqaviləni adlandır.** Dərs 5 telin hansı byte sırasını işlətdiyini soruşdu; Dərs 8 checksum-ın əslində nəyi sübut etdiyini; burada isə sual budur — *bu siqnal hansı clock-a aiddir* — və "başqa birinə" cavabını verən istənilən siqnala nəyəsə təsir etməyə icazə verilməzdən əvvəl synchronizer lazımdır. ✓

</Solution>

</Challenges>

<LearnMore title="CPU-nun Anatomiyası" path="/learn/faza-0/modul-0-3/cpu-anatomy">

Bununla maşının təməli tamamlandı: qərar verən açarlar, arifmetika edən gate-lər, yadda saxlayan register-lər və nə vaxt olduğunu deyən clock. İndi processor-un qurulduğu hər hissə səndədir — və processor-un *nə olduğu* barədə hələ heç bir təsəvvürün yoxdur. Növbəti modul birini açır: dəyişənlərini saxlayan register-lər, artıq özün qurduğun arifmetik blok, bu təkanda hansı əməliyyatın baş verəcəyinə qərar verən idarə logic-i və proqramın özünün sadəcə data ilə eyni yaddaşda oturan başqa ədədlər olması kimi qəribə bir fakt.

</LearnMore>