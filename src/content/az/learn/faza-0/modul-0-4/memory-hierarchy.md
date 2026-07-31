---
title: "Yaddaş iyerarxiyası (Memory Hierarchy)"
---

<Intro>

1956-cı ilin sentyabrında IBM 305 RAMAC adlı bir maşın təqdim etdi və onun içində o vaxta qədər heç bir kompüterdə olmayan bir şey vardı: lenti başdan sona sarımadan, istənilən nöqtəsindən — yəni **random** — oxuya biləcəyin bir disk. IBM 350 Disk Storage Unit **beş milyon simvol** saxlayırdı. İçində hər biri iki fut diametrində olan əlli fırlanan disk (platter) vardı, təxminən bir ton ağırlığındaydı və icarəsi ayda təxminən **3 200 dollara** başa gəlirdi — 1956-cı il üçün ciddi puldur. Onun üzərində bir məlumat parçasını tapmaq orta hesabla **saniyənin altı onda biri** çəkirdi. İndi isə bu səhifəni yaradan maşına bax. Onun **L3 cache**-i — heç bir reklamda adı çəkilməyəcək qədər əhəmiyyətsiz görünən, birbaşa prosessorun üstündə oturan bir komponent — **33 meqabayt** saxlayır. Bu, IBM-in bir ton fırlanan poladının bütün tutumundan altı dəfə çoxdur və cavabı **28 nanosaniyə**dədir: təxminən iyirmi milyon dəfə daha sürətli. Cache artıq kiçik bir köməkçi deyil. O, vaxtilə bütöv bir disk sürücüsünün olduğundan həm böyükdür, həm də təsəvvürəgəlməz dərəcədə sürətlidir. Bu dərs kompüterin məlumatı saxladığı bütün yerlər haqqındadır — həmin cache-dən tutmuş başqa qitədəki serverə qədər — və hər qatın cavab verdiyi o bir sualın haqqındadır.

</Intro>

<YouWillLearn>

- Kompüterin bir baytı saxlaya biləcəyi hər yer — register-lərdən internetin o üzünə qədər
- Üçtərəfli mübadilə — **sürətli (fast)**, **böyük (big)**, **ucuz (cheap)** — və heç bir texnologiyanın nə üçün üçünü birlikdə verməməsi
- Latency rəqəmlərinin insan miqyasında əslində necə hiss olunduğu
- Nə üçün buna siyahı deyil, **iyerarxiya** deyilir: hər qat özündən aşağıdakı qatın cache-idir
- **Page cache** — əməliyyat sisteminin öz cache-i; burada ölçülmüş nəticəyə görə gizlətdiyi SSD-dən **65 dəfə** sürətli
- İşləyən proqramın məlumatının həqiqətən harada olduğu və nə üçün sənin kodunda bu barədə bir söz olmadığı

</YouWillLearn>

<InlineToc />

## One question, asked over and over {/*one-question-asked-over-and-over*/}

İndiyə qədər qurulmuş hər bir yaddaş (storage) texnologiyası eyni sualın cavabı olub: **bu bayt harada yaşamalıdır?**

Və hər cavab bir güzəşt olub, çünki istədiyin üç şey daimi ziddiyyət içindədir:

<Diagram name="memory-hierarchy/three_tradeoffs" height={400} width={720} alt="'İkisini seçə bilərsən' adlı diaqram. Yuxarıda üç panel var: mavi rəngdə 'fast' (nanosaniyələrlə cavab verir, core-un yanında oturur), tünd rəngdə 'big' (terabaytları saxlayır, bütün datasetin yerləşir) və qırmızı rəngdə 'cheap' (qiqabayta qəpiklər, çoxunu almağa gücün çatır). Aşağıda dörd sətir texnologiyaları müqayisə edir: register və cache sürətli, kiçik və çox bahalıdır; main memory sürətli, orta ölçülü və bahalıdır; SSD yavaş, böyük və ucuzdur; hard disk çox yavaş, nəhəng və çox ucuzdur. Altdakı qeyd: heç bir texnologiya üçünü birlikdə vermir, ona görə kompüter hamısını bir yerdə işlədir.">

İstədiyin üç şey və hər biri onlardan yalnız ikisini verən texnologiyalar siyahısı.

</Diagram>

**Fast** yaddaş fiziki olaraq prosessora yaxın olmalı və bahalı elektronikadan qurulmalıdır — bu da onun çox ola bilməyəcəyi deməkdir. **Big** yaddaş ümumiyyətlə əlverişli olsun deyə bayta görə ucuz olmalıdır, bayta görə ucuz texnologiyalar isə yavaşdır. Eyni vaxtda həm cəld müraciət edilən, həm terabaytları saxlayacaq qədər sıx, həm də kütləvi almağa gücün çatacaq qədər ucuz olan bir material yoxdur.

Mühəndislər birini seçib onunla yaşaya bilərdilər. Onun yerinə daha ağıllı bir şey etdilər: **hamısını bir yerdə işlətmək** — belə qurulmuş ki, sürətli və bahalı hissə indi işlədilən nə varsa onu saxlasın, yavaş və ucuz hissə isə qalan hər şeyi.

Bu quruluşun adı **memory hierarchy**-dir və kompüterlərin necə qurulduğu barədə ən mühüm struktur faktdır.

## The whole ladder {/*the-whole-ladder*/}

Prosessorun ən yuxarısından dünyanın o üzünə qədər bütün pillələr:

<Diagram name="memory-hierarchy/the_ladder" height={546} width={720} alt="'Kompüterin bir baytı saxlaya biləcəyi hər yer' adlı diaqram; qeyd olunur ki, daha en olan daha çox saxlayır, daha aşağı olan daha yavaş cavab verir. Şəkildə enləri artan səkkiz üfüqi zolaq aşağıya doğru sıralanır, hər biri ad, tutum və latency ilə işarələnib: register-lər, təxminən 1 KB, 0.4 ns; L1 cache, 32 KB, 1.5 ns; L2 cache, 1 MB, 4.1 ns; L3 cache, 33 MB, 28 ns; main memory, 16 GB, 156 ns; SSD, 1 TB, 74 mikrosaniyə; hard disk, 8 TB, 10 ms; başqa şəhər, limitsiz, 14 ms. Yuxarıdakı dörd zolaq mavi, main memory tünd, aşağıdakı üçü qırmızıdır. Sağ tərəfdəki oxun üstündə 'daha yavaş' yazılıb. Qeydlər: yuxarıdan aşağıya təxminən 34 milyon dəfə yavaş və təxminən bir milyard dəfə böyük.">

Bir bütöv nərdivan. Kompüter pillə seçmir — hamısını bir vaxtda işlədir.

</Diagram>

Bunu ayrı-ayrı texnologiyalar kimi deyil, bir bütöv nərdivan kimi oxu, çünki kompüter də ona belə yanaşır. Hər pillə aşağı düşdükcə üç şey birlikdə baş verir: daha **çox** saxlayır, bayta görə daha **az** başa gəlir və daha **yavaş** cavab verir.

Bu pillələrin bəziləri kursda hələ görünmədiyi üçün qısa bir tur:

- **Register-lər** — CPU anatomiyası dərsindən tanıdığın, core-un öz içindəki bir neçə yuva. Ümumilikdə bəlkə bir kilobayt, və bir cycle-da əlçatandır.
- **L1, L2, L3 cache** — keçən dərsin mövzusu. Kiçik, sürətli, avtomatik, görünməz.
- **Main memory (RAM)** — "yaddaş" alanda aldığın qiqabaytlar. Proqramının dəyişənləri, obyektləri və data strukturları həqiqətən burada yaşayır. Növbəti dərs bunun içini açır.
- **SSD** — solid-state drive. Flash yaddaş, hərəkət edən hissəsi yoxdur və *enerji kəsiləndə məzmununu saxlayır*, yuxarıdakı qatların heç biri bunu edə bilmir.
- **Hard disk** — fiziki olaraq fırlanan maqnit disklər (platter) və düzgün track-a getmək üçün tərpənməli olan bir baş (head). Yüz dəfə yavaş, beş dəfə ucuz — və dünyanın datasının çoxu hələ də buradadır.
- **Başqa maşın** — şəbəkə üzərindən. Bu, iyerarxiyanın əsl pilləsidir, sonradan yapışdırılmış bir şey deyil: müasir tətbiq daim başqa kompüterlərdəki cache-lərdən, verilənlər bazalarından və servislərdən oxuyur.

Yuxarıdan aşağıya olan məsafəni açıq demək lazımdır: sürətdə təxminən **34 milyon dəfə**, tutumda təxminən **bir milyard dəfə**. Bu iki fakt və aralarındakı gərginlik kompüter elmindəki performans qərarlarının az qala hamısını doğurur.

## What those numbers feel like {/*what-those-numbers-feel-like*/}

Nanosaniyə də, millisaniyə də "kiçikdir" — bu isə aralarındakı məsafəni az qiymətləndirməyi çox asanlaşdırır. Ona görə nərdivanı hiss ediləsi etməyin standart üsulu belədir: **təsəvvür et ki, bir CPU cycle bir saniyə çəkir** və qalan hər şeyi bu miqyasa uyğunlaşdır.

<Diagram name="memory-hierarchy/human_scale" height={506} width={720} alt="'Eyni nərdivan, insanın hiss edə biləcəyi vahidlərdə' adlı diaqram; şərt belədir: 'fərz et ki, bir CPU cycle bir saniyə çəkirdi, o zaman'. Səkkiz sətirdə solda qat, sağda insan miqyasında müddət göstərilir: bir CPU cycle, 1 saniyə; L1 cache, 4 saniyə; L2 cache, 11 saniyə; L3 cache, bir dəqiqədən azca çox; main memory, 7 dəqiqə; SSD random oxu, 2 gün; hard disk seek, 11 ay; başqa qitədəki server, 13 il. Yuxarıdakı dörd sətir mavi, main memory tünd, aşağıdakı üçü qırmızıdır. Qeydlər: cache miss bir qəhvə fasiləsidir, disk seek bir fəsildir, dünyanın o üzünə sorğu bütöv bir karyeradır.">

Eyni rəqəmlər, insanın hiss edə biləcəyi miqyasa çevrilib.

</Diagram>

Bu cədvəlin üstündə bir az dayan, çünki o hər şeyə baxışını dəyişir.

Əgər register-ə uzanmaq **bir saniyədir**, o zaman main memory-yə getmək **yeddi dəqiqəlik** bir gedişdir. SSD-dən random blok oxumaq **iki günlük** səfərdir. Hard disk seek-i gözləmək **ilin çox hissəsidir**. Planetin o tayındakı serverdən nəsə istəmək isə **on üç illik** bir ekspedisiyadır.

İndi xatırla ki, prosessor gözlədiyi müddətdə nə edir: heç nə. Bir çox proqramın yavaş olmasının səbəbinin onların alqoritmləri ilə heç bir əlaqəsi olmamasının izahı budur. Bir neçə min arifmetik əməliyyat və bir verilənlər bazası sorğusu edən funksiya vaxtının faktiki olaraq hamısını o sorğuya verir — və arifmetikanı nə qədər optimallaşdırsan da, fərq etməyəcək.

**Buradan çıxan praktik qaydanı əzbərləmək dəyər:** bir şey yavaşdırsa, əvvəlcə *data nə qədər uzaqdadır* sualını ver, ancaq bundan sonra *onun üzərində nə qədər iş görülür* sualını.

## The measured spectrum {/*the-measured-spectrum*/}

Yuxarıdakı hər şey iddiadır. İndi isə ölçmə şəklində: bu xəttin üzərindəki hər nöqtə bu səhifəni yaradan maşında ölçülmüşdür:

<Diagram name="memory-hierarchy/latency_spectrum" height={340} width={720} alt="'Hamısı bir xətt üzərində — nəzərə al ki, xətt loqarifmikdir' adlı diaqram; qeyd olunur ki, aşağıdakı hər nöqtə bu maşında ölçülüb. Üfüqi loqarifmik ox 1 nanosaniyədən azdan 10 millisaniyədən çoxa qədər uzanır, bölgülər 1 ns, 1 mikrosaniyə, 1 ms və 10 ms kimi işarələnib. Ox üzərində on nöqtə, adları növbə ilə yuxarıda və aşağıda göstərilir: register, L1, L2, L3, RAM, page cache, SSD, localhost, yaxındakı server, uzaqdakı server. İlk dördü mavi, RAM və page cache tünd, sonuncu dördü qırmızıdır. Qeydlər: bir ucdan digərinə fərq təxminən 34 000 000 dəfədir; ona görə də rastlaşacağın az qala hər yavaş proqram üçün 'data haradadır?' sualı 'CPU nə qədər sürətlidir?' sualından daha vacibdir.">

Bir maşından on ölçmə — yerləşməsi üçün miqyas məcburi olaraq loqarifmikdir.

</Diagram>

Xam rəqəmlər:

<TerminalBlock>

register (bir cycle)          0.4 ns
L1 cache                      1.5 ns
L2 cache                      4.1 ns
L3 cache                     27.6 ns
main memory                 156   ns
RAM-da olan fayl datası       1.1 us
SSD, random 4 KB oxu         73.5 us
localhost-a şəbəkə          116   us
yaxındakı serverə şəbəkə      1.6 ms
uzaqdakı serverə şəbəkə      13.6 ms

</TerminalBlock>

Bu siyahıda iki şeyi ayrıca qeyd etmək lazımdır.

**Ox loqarifmikdir.** Məcburidir — bir ucunda 0.4 ns, digərində 13.6 ms olan xətti qrafik ilk səkkiz nöqtəni ən kənarda bir-birinin üstünə yığıb ayırd edilməz edərdi. Bunun özü də sənə bir şey deyir: bunlar müxtəlif sürətlər deyil, müxtəlif *dünyalardır*.

**Aralardakı boşluqlar bərabər deyil.** L1-dən RAM-a təxminən 100 dəfədir. RAM-dan SSD-yə təxminən 470 dəfə. SSD-dən uzaqdakı serverə daha 185 dəfə. Bütün nərdivandakı ən böyük iki uçurum **memory-dən storage-a** və **storage-dan network-ə** keçidlərdir — real sistemlərdə mühəndis diqqətinin ən çox bu iki sərhədə yönəlməsinin səbəbi elə budur.

## Why it is a hierarchy and not a list {/*why-it-is-a-hierarchy-and-not-a-list*/}

Buraya qədər bu, sıralanmış yaddaş texnologiyaları siyahısı idi. Amma *iyerarxiya* sözü real iş görür və mənası budur.

Hər qat sadəcə növbətinin altında oturmur. **Hər qat özündən aşağıdakı qatın ən çox işlədilən hissələrinin kopiyalarını saxlayır.**

<Diagram name="memory-hierarchy/every_level_is_a_cache" height={440} width={720} alt="'Eyni fənd, təkrar-təkrar, ta aşağıya qədər' adlı diaqram. Beş sətirdə solda sürətli anbar, sağa yönəlmiş 'cache-ləyir' oxu, ortada daha yavaş anbar, sağda isə onu kimin idarə etdiyi göstərilir. Sətirlər belədir: L1 L2-ni cache-ləyir, hardware idarə edir; L3 main memory-ni cache-ləyir, hardware idarə edir; main memory SSD-ni cache-ləyir, əməliyyat sistemi idarə edir; tətbiqinin cache-i verilənlər bazasını cache-ləyir, sənin kodun idarə edir; brauzer cache-i uzaqdakı serveri cache-ləyir, brauzer idarə edir. Aşağıdakı mavi çərçivədə: hamısı eyni dörd suala cavab verir — nəyi saxlamalı, onu necə tapmalı, nəyi atmalı, nəyi vaxtından əvvəl gətirməli.">

Fərqli hardware, fərqli onilliklər, fərqli insanlar — və təkrarlanan bir ideya.

</Diagram>

Bu, bütün modulun ən dərin struktur qavrayışıdır və onu ən güclü formasında demək dəyər: **caching prosessorların bir xüsusiyyəti deyil. O, kompüter elmində hər miqyasda yenidən ortaya çıxan bir pattern-dir.**

Siyahıya bir daha bax. İlk iki sətri görə bilmədiyin hardware edir. Üçüncüsünü əməliyyat sistemi edir. Dördüncüsünü tətbiq proqramçıları yazır. Beşincisi sənin brauzerindir. Fərqli texnologiyalar, fərqli insanlar, fərqli onilliklər — və onların hər biri eyni dörd suala cavab verməlidir:

1. **Nəyi saxlayım?** (adətən: ən son işlədilən nə varsa)
2. **Onun məndə olub-olmadığını necə bilim?** (nəyəsə görə indeksləşmiş bir lookup)
3. **Yer bitəndə nəyi atım?** (adətən: ən uzun müddət işlədilməyəni)
4. **Nəyi hələ istənməmişdən qabaq gətirim?** (pattern-in işarə etdiyini)

Bu formanı bir dəfə tanıdıqdan sonra onu hər yerdə görəcəksən: veb saytı cache-ləyən CDN, sorğu nəticələrini cache-ləyən verilənlər bazası, lookup-ları cache-ləyən DNS resolver, funksiyanın üstündəki `memoize`, şəkli saxlayan brauzer, Postgres-in qabağındakı Redis. Hamısı L1 cache ilə eyni ideyadır — sadəcə fərqli məsafələrdə və fərqli əllər tərəfindən idarə olunur.

## The operating system's cache {/*the-operating-systems-cache*/}

Bu qatlardan biri öz bölməsini haqq edir, çünki o görünməzdir, nəhəngdir və bilmirsənsə, benchmark-larını çaşdıracaq.

Proqramın bir fayl oxuyanda sorğu düz SSD-yə getmir. O, **page cache**-ə gedir: main memory-nin əməliyyat sisteminin son vaxtlar toxunduğu fayl datasının kopiyaları ilə doldurduğu bir hissəsinə.

<Diagram name="memory-hierarchy/page_cache_measured" height={420} width={720} alt="'Əməliyyat sistemi də bir cache işlədir' adlı diaqram. Yuxarı solda 'sənin proqramın' adlı boz çərçivə və içində read(file, 4096 bayt) kodu. Ox sağa, 'page cache — fayl datasını saxlayan RAM parçası' adlı mavi çərçivəyə işarə edir. Ondan aşağıya, 'yalnız miss olanda' yazılı qırmızı ox 'SSD' adlı qırmızı çərçivəyə gedir. Solda bir faylın 3 000 random 4 KB oxumasının nəticələri iki zolaq kimi göstərilir: 'page cache-dən, 1.1 mikrosaniyə' yazılı kiçik mavi zolaq və 'SSD-dən, 73.5 mikrosaniyə' yazılı uzun qırmızı zolaq. Qeydlər: 65 dəfə sürətli — yeri dəyişməyən fayl və dəyişməyən proqram üçün; ikinci dəfə açanda tətbiqin nə üçün bu qədər tez başladığının və eyni benchmark-ı ikinci dəfə işlədəndə nə üçün sənə yalan dediyinin izahı budur.">

Heç istəmədiyin, proqramınla disk arasında oturan bir cache.

</Diagram>

Effekt heç də incə deyil. Aşağıda eyni faylın üç min random 4 KB oxuması var, eyni maşında iki dəfə ölçülüb — bir dəfə faylın datası page cache-dən çıxarılmış vəziyyətdə, bir dəfə isə orada dururkən:

<TerminalBlock>

random 4 KB oxu, 3000 ədəd:
  cold (SSD-dən):           73.5 us hər oxuya
  warm (RAM-dan):            1.1 us hər oxuya
  nisbət: 65x

</TerminalBlock>

**Altmış beş dəfə sürətli** — eyni proqram, eyni fayl, eyni kod. Yeganə fərq əməliyyat sisteminin onu hələ RAM-da saxlayıb-saxlamamasıdır.

Bunun daim rastlaşacağın bir nəticəsi var, ona görə açıq demək lazımdır: **bir şeyi ikinci dəfə ölçəndə, çox vaxt page cache-i ölçürsən.** Birinci dəfə 400 ms, sonra 8 ms çəkən verilənlər bazası sorğusu optimallaşdırılmayıb; sadəcə qızdırılıb. Bunu nəzərə almayan benchmark-lar performans işində yanlış nəticələrin ən çox yayılmış səbəblərindən biridir və həlli ya işlətmələr arasında cache-i təmizləməkdir, ya da — daha vicdanlısı — hər iki rəqəmi verib hansının hansı olduğunu deməkdir.

Bu, həm də heç düşünmədən yaşadığın bir şeyi izah edir: nə üçün tətbiq reboot-dan sonra ilk dəfə yavaş, ondan sonra həmişə tez açılır.

<Note>

Page cache o an başqa heç nəyə lazım olmayan RAM-ı işlədir, bu da geniş yayılmış bir yanlış anlamaya gətirib çıxarır. Sağlam Linux maşınında sistem monitoruna baxanda tez-tez görəcəksən ki, yaddaşın az qala hamısı "istifadə olunur" — və insanlar buradan daha çox RAM lazım olduğu qənaətinə gəlirlər.

Adətən lazım deyil. O həcmin böyük bir hissəsi fayl datasını saxlayan page cache-dir və hər hansı proqram yaddaş istəyən an əməliyyat sistemi onu geri verəcək. **İşlədilməyən RAM boşa gedən RAM-dır**, ona görə OS onu qəsdən nəyəsə — ehtimalən faydalı olacaq nəyəsə — doldurur. "Free memory"-nin sıfıra yaxın olması normaldır və yaxşıdır; izlənməli rəqəm yaddaşın dolu görünüb-görünməməsi deyil, sistemin *swapping* edib-etməməsidir.

</Note>

## The line where power matters {/*the-line-where-power-matters*/}

Nərdivanda sürətlə heç bir əlaqəsi olmayan bir sərhəd var və proqram təminatının necə dizayn olunduğu üçün o, hamısından çox əhəmiyyət daşıyır:

<Diagram name="memory-hierarchy/volatile_line" height={480} width={720} alt="'Enerji açarının əhəmiyyət daşıdığı xətt' adlı diaqram. Yuxarıdakı üç mavi zolaq register-lər, L1/L2/L3 cache və main memory (RAM) kimi işarələnib, solda 'volatile — enerji lazımdır' yazılıb. Ortadan 'fişi buradan çək' yazılı qalın qırmızı kəsik xətt keçir və qeyd olunur: yuxarıdakı hər şey gedir, aşağıdakı hər şey sağ qalır. Aşağıdakı dörd boz zolaq SSD, hard disk, başqa maşının diski və seyfdəki lent kimi işarələnib, solda 'persistent — məzmununu saxlayır' yazılıb. Qeyd: iyerarxiyanın sürətli yarısı yaddan çıxarır — sürətin qarşılığında aldığın razılaşma budur.">

Bütün nərdivandakı ən nəticəli sərhəd — və o, sürətlə bağlı deyil.

</Diagram>

Register-lərdən main memory-yə qədər hər şey **volatile**-dir: datanı ancaq enerji varkən saxlayır. Enerjini kəs — o an və tamamilə yox olur. SSD-dən aşağıya doğru hər şey isə **persistent**-dir: məzmununu saxlayır.

Və xəttin haraya düşdüyünə diqqət et. O, tam olaraq sürətli yarı ilə yavaş yarının arasındadır — və bu təsadüf deyil. Sürətli olan texnologiyalar qismən *elə buna görə* sürətlidir ki, heç nəyi daimi etmək məcburiyyətində deyillər; materialı fiziki olaraq dəyişdirmək yerinə kondensatorda ya flip-flop-da yük saxlayırlar.

Bu bir sərhəd real proqram təminatındakı mürəkkəbliyin nəhəng bir hissəsini doğurur:

- Hər verilənlər bazası uğur bildirməkdən əvvəl dəyişiklikləri persistent yaddaşa yazmalıdır — transaction commit-in in-memory yeniləmə ilə müqayisədə yavaş olmasının səbəbi budur.
- Hər redaktor nə vaxt save edəcəyinə qərar verməlidir və hər crash söhbəti əslində enerji kəsiləndə xəttin yuxarısında nə qalması haqqındadır.
- Paylanmış sistemlərdə "durability" dəqiq olaraq *bu xətti keçib-keçməməsi* deməkdir — və çox vaxt *birdən çox maşında keçib-keçməməsi*.

Crash-lar barədə düşünmə intizamının hamısı datanın həmin kəsik xəttin hansı tərəfində olduğunu izləmək intizamıdır.

## Sequential still wins, even down here {/*sequential-still-wins-even-down-here*/}

Cache dərsindəki bir pattern storage səviyyəsində də təkrarlanır — hətta daha güclü şəkildə.

Aşağıda eyni SSD, eyni maşında, iki fərqli üsulla oxunub:

<Diagram name="memory-hierarchy/random_vs_sequential" height={380} width={720} alt="'Eyni SSD, iki cür oxunub' adlı diaqram; rəqəmlərin bu maşında ölçüldüyü qeyd olunur. 'Başdan sona oxumaq' yazılı uzun mavi zolaq 2 039 MB/s ilə işarələnib. 'Random 4 KB oxu' yazılı kiçik qırmızı zolaq 56 MB/s ilə işarələnib. Aşağıda qalın qırmızı ilə: eyni cihazdan saniyədə 37 dəfə az faydalı data. Boz çərçivə səbəbi izah edir: cihaz sorğulara cavab verir və hər sorğunun sabit bir xərci var; bir böyük sorğu həmin xərcə qarşılıq çox data daşıyır, min kiçik və səpələnmiş sorğu isə həmin xərci min dəfə ödəyib az qala heç nə daşımır. Sonuncu qeyd: bu formanı əvvəl də görmüşdün — bu, bir mərtəbə aşağıdakı cache line arqumentidir.">

Eyni cihaz, eyni fayl, eyni ümumi bayt sayı. Dəyişən yalnız sorğuların sırasıdır.

</Diagram>

Faylı başdan sona oxumaq **2 039 MB/s** verdi. Eyni fayldan random 4 KB bloklar oxumaq təxminən **56 MB/s** ekvivalenti verdi — sadəcə sorğuların sırasına görə **37 dəfə** fərq.

Səbəb cache line-ların mövcud olma səbəbinin eynisidir, bir səviyyə aşağıda. İstənilən yaddaş cihazı *sorğulara* cavab verir və hər sorğunun sabit bir əlavə xərci var: əmr yol getməli, cihaz datanın yerini tapmalı, cavab geri qayıtmalıdır. Bir böyük sorğu bu xərci bir dəfə ödəyib bir meqabayt daşıyır. Min kiçik və səpələnmiş sorğu onu min dəfə ödəyib hər dəfə dörd kilobayt daşıyır.

Fırlanan hard diskdə effekt daha da amansızdır, çünki əlavə xərcə mexaniki qolu fiziki olaraq tərpətmək və platter-in altından dönməsini gözləmək də daxildir. Hard disk üçün 200 MB/s sequential throughput və 1 MB/s-dən aşağı random performans tam normaldır — yüzlərlə dəfə fərq.

Storage mühəndisliyinin bu qədər böyük hissəsinin *random müraciəti sequential müraciətə çevirmək* haqqında olmasının səbəbi budur: verilənlər bazalarının nə üçün write-ahead log saxladığı (yalnız sonuna əlavə edilir, deməli sequential-dır), log-structured storage-ın nə üçün mövcud olduğu və "biz sadəcə lazım olan sətirləri oxuyacağıq" yanaşmasının nə üçün bütün cədvəli oxumaqdan yavaş ola biləcəyi.

## Where your program's data actually is {/*where-your-programs-data-actually-is*/}

Gəlin bunu konkretləşdirək. İstənilən anda bir işləyən proqramın datası nərdivanın az qala hamısına eyni vaxtda yayılmış olur:

<Diagram name="memory-hierarchy/program_data_map" height={466} width={720} alt="'İşləyən bir proqramın datası əslində harada olur' adlı diaqram. Səkkiz sətir solda bir data parçasını, sağda onun yerini göstərir: indicə artırdığın loop sayğacı register-dədir; ən son oxuduğun array elementi L1 cache-dədir; həmin array-in qalanı L2 ya da L3-dədir; proqramının ayırdığı obyektlər main memory-dədir; bir az əvvəl açdığın fayl RAM-dakı page cache-dədir; hələ toxunmadığın fayl SSD-dədir; keçən ilin log-ları başqa yerdəki diskdədir; gözlədiyin API cavabı başqa qitədədir. Sətirlərin rəngi yuxarıdakı mavidən tündə, sonra aşağıda qırmızıya keçir. Qeydlər: kodunda dəyişənin hansı sətirdə olduğunu bildirən heç nə yoxdur — və bununla belə həmin sətir proqramın nə qədər sürətli işlədiyi barədə az qala hər şeyi həll edir.">

Bir proqram, bir an, səkkiz fərqli pillə.

</Diagram>

Sağ sütunu oxu, sonra qeydi bir daha oxu, çünki narahat edən hissə elə budur.

Sənin kodunda heç nəyin hansı pillədə olduğunu bildirən bir ifadə yoxdur. `total += price[i]` yazırsan və dil sənə "`total`-ı register-də saxla" ya da "`price`-ın L2-də olmasını təmin et" demək imkanı vermir. Bu qərarları davamlı və görünməz şəkildə compiler, cache hardware-i və əməliyyat sistemi verir.

Onları birbaşa idarə edə bilmirsən. Ancaq onlara **təsir edə bilərsən** və modulun qalanı elə bunun haqqındadır: yaddaşın əslində necə düzüldüyü, datanın hansısa hissəsinin stack-də, hansısa hissəsinin heap-də olması, bir müraciəti səpələnmiş yerinə sequential edən şeyin nə olduğu və artıq lazım olmayan data heç vaxt buraxılmadıqda nə baş verdiyi.

<Pitfall>

**"Yavaşdır, deməli daha çox RAM lazımdır" bir təxmindir və adətən yanlış təxmindir.**

Sistem yavaş görünəndə ilk refleks yaddaş artırmaqdır və bu, yalnız bir vəziyyətdə köməkdir: maşının aktiv işlətdiyi şeyi saxlamağa kifayət qədər RAM-ı olmayanda və buna görə datanı daim diskə çıxarıb geri gətirəndə. Bu vəziyyətin adı var — **swapping**, ya da *thrashing* — və o həqiqətən fəlakətlidir, çünki working set-i 156 nanosaniyəlik pillədən 74 mikrosaniyəlik pilləyə köçürür.

Amma maşın swapping *etmirsə*, daha çox RAM heç nəyi dəyişmir. Proqram sahib olmadığı yaddaşı gözləmir; başqa bir şeyi gözləyir. Və daha ehtimallı bir sıra namizəd var:

- **Network**-ü gözləyir — 13 millisaniyəlik pillə, ona heç bir miqdarda RAM təsir etmir.
- Sequential olsaydı sürətli olacaq **random disk I/O**-nu gözləyir.
- CPU-nun içində **cache miss** edir — bu, datanın miqdarı deyil, düzülüşü (layout) məsələsidir.
- Sadəcə çox iş görür və bu, hardware kostyumu geyinmiş alqoritm problemidir.

Düzəliş pul xərcləməkdən əvvəl vaxtın hansı pillədə keçdiyini müəyyən etməkdir. İstənilən əməliyyat sistemi sənə deyə bilər: swap aktivliyi, disk oxu sürəti və queue depth, network gözləmə vaxtı, CPU utilization. Bu dərsdəki nərdivan həm də diaqnostika üçün yoxlama siyahısıdır — aşağıdan başla, çünki aşağı pillələr minlərlə dəfə bahalıdır, deməli cavab olma ehtimalı da qat-qat yüksəkdir.

</Pitfall>

<DeepDive>

#### The bill, which is the real reason for all of this {/*the-bill*/}

Sürətli yaddaş ucuz olsaydı, bu dərsdəki hər şeyə ehtiyac olmazdı. Onun ucuzdan nə qədər uzaq olduğunu təxmini görmək dəyər.

<Diagram name="memory-hierarchy/cost_per_byte" height={380} width={720} alt="'Və sonra hesab gəlir' adlı, 'bir qiqabaytın təxmini qiyməti, tərtib sırası ilə' altyazılı sütun diaqramı. Uzunluğu kəskin azalan dörd sütun: SRAM (cache) qiqabayta minlərlə dollar, qırmızı rəngdə; DRAM (main memory) bir neçə dollar; SSD bir neçə sent; hard disk sentin bir hissəsi. Qeydlər: iyerarxiyanın mövcud olmasının əsl səbəbi budur — cache yaddaşı ucuz olsaydı, kompüterin nəhəng bir cache olardı və bu modul bir səhifədən ibarət olardı; qiymətlər daim dəyişir, aralarındakı nisbətlər isə çox-çox yavaş dəyişir.">

Hamısının altındakı məhdudiyyət. Diqqət et ki, ox dollarları deyil, tərtib sıralarını göstərir.

</Diagram>

Dəqiq qiymətlər hər il dəyişir, ona görə yadda saxlanmalı rəqəmlər çox daha yavaş dəyişən *nisbətlərdir*. Kobud desək, nərdivanda hər addım aşağı bayta görə təxminən yüz dəfə ucuzdur və hər birindən nə qədər alacağını da elə bu əmsal həll edir.

Bunun kompüterin formasına dair nə demək istədiyinə diqqət et. "32 KB L1"-i heç kim 32 KB xoş rəqəm olduğu üçün seçməmişdi. Bu, sürət hədəfinin hər kəsin ödəməyə razı olacağı qiymətdə imkan verdiyi ölçüdür. Nərdivandakı hər tutum texniki deyil, iqtisadi bir sualın cavabıdır — məhz buna görə də altmış il boyunca *ölçülər* nəhəng şəkildə böyüsə də, iyerarxiyanın *forması* az qala heç dəyişməyib.

Qiymət siyahısında görünməyən ikinci bir xərc də var: **enerji**. Datanı hərəkət etdirmək güc tələb edir, onu daha uzağa hərəkət etdirmək daha çoxunu. Register-dən dəyər oxumaq main memory-dən gətirmək üçün lazım olan enerjinin cüzi bir hissəsini işlədir və şəbəkə üzərindən göndərməkdən tərtiblərlə azını. Telefonda bu, batareya ömrüdür; data mərkəzində elektrik hesabı və soyutmadır. Deməli iyerarxiya yalnız sürət və pul haqqında deyil — datanı yaxın saxlamaq həm də cihazın necə sərin qaldığı və bütün parkın necə əlverişli qaldığıdır.

</DeepDive>

<DeepDive>

#### The ladder keeps gaining and losing rungs {/*the-ladder-keeps-changing*/}

İyerarxiya 1960-cı illərdən bizə miras qalmış sabit bir quruluş deyil. Pillələr yaranır, yerini dəyişir və yox olur — bunu izləmək isə iyerarxiyanın əslində *nə olduğunu* anlamağın yaxşı bir yoludur: o, cihazlar siyahısı deyil, **mövcud olan hansı yaddaş texnologiyaları varsa, onların sıralanmış düzümüdür**.

Gəlib-gedən pillələr: **maqnit lent** vaxtilə əsas oyunçu idi, indi çoxunun heç toxunmadığı bir arxiv qatıdır. **Floppy disk**-lər iyirmi il boyunca memory ilə hard disk arasındakı boşluğu tutdu, sonra tamamilə yox oldu. **Optik disklər** nərdivanın ortasında bir onillik keçirdi. Hər biri sürəti və qiyməti hara düşürdüsə oraya yerləşdirildi və hər biri həmin işi daha yaxşı görən bir şey çıxanda çıxarıldı.

Son vaxtlar yaranan pillələr: ən aydın nümunə **SSD**-dir. Flash yaddaş sərfəli olmamışdan əvvəl main memory (nanosaniyələr) ilə hard disk (millisaniyələr) arasında ağzı açıq bir boşluq vardı — az qala yüz min dəfəlik bir fərq və içində heç nə. SSD həmin boşluğu doldurdu və bununla proqram təminatının necə yazıldığını səssizcə dəyişdi: verilənlər bazaları, fayl sistemləri və tətbiqlərin hamısının köhnə uçurumun ətrafına qurulmuş fərziyyələri vardı və onların çoxuna yenidən baxmaq lazım gəldi.

Hələ mübahisə olunan pillələr: **persistent memory** texnologiyaları birbaşa volatility xəttinin özünü hədəfləyir — DRAM-a az qala bərabər sürətdə olub məzmununu saxlayan yaddaş təklif edirlər. Bu, bu dərsdə çəkdiyimiz sərhədin tam üstündə oturan həqiqətən yeni bir pillə olardı və proqram təminatının indiyə qədər cavab verməli olmadığı suallar doğurur — əgər memory crash-dan sonra sağ qalırsa, "save" ümumiyyətlə nə deməkdir?

Və heç yoxdan böyüyən pillələr: **network** artıq nərdivanda möhkəm yer tutur. Başqa rack-dəki cache, başqa binadakı verilənlər bazası, başqa region-dakı object store — bunlar real latency-ləri olan yaddaş qatlarıdır və müasir tətbiq onlar barədə 1970-ci illərin proqramçısının disklər barədə düşündüyü kimi düşünür.

Buradan götürüləsi ümumi ideya budur: bu pattern-lə təkrar-təkrar rastlaşacağını gözlə. Nə vaxt yeni bir yaddaş texnologiyası çıxsa, faydalı suallar həmişə eynidir: **nə qədər sürətli, nə qədər böyük, bayta nə qədər** — və cavablar onu nərdivanda avtomatik yerinə oturdur.

</DeepDive>

## Work out where the time goes {/*work-out-where-the-time-goes*/}

Bütün modul bir hesablamaya gəlib dayanır və onu əlinin altında saxlamaq dəyər.

Fərz et ki, proqram bir dataya çoxlu müraciət edir. Onların bir hissəsi sürətli qat tərəfindən cavablanır, qalanı isə yavaş qata getməlidir. O zaman orta xərc belədir:

```
 average = (hit rate × fast latency) + (miss rate × slow latency)
```

Bu formul riyazi olaraq cache-in *nə olduğudur*. Aşağıda iki qatı, hit rate-i və proqramın nə qədər müraciət etdiyini təyin edib bunun nəyə başa gəldiyini görə bilərsən — həm real vaxtda, həm də əvvəldəki insan miqyasındakı vahidlərdə.

Sınamağa dəyən iki şey. Sürətli qatı RAM, yavaş qatı uzaqdakı server qoy, sonra hit rate-i 90%-dən 99%-ə apar və cəminin necə çökdüyünə bax. Sonra hit rate-i 50% qoy və sürətli qatın sürətinin artıq nə qədər az əhəmiyyət daşıdığına diqqət et.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';

// ad, latency nanosaniyə ilə  (hard disk istisna olmaqla hamısı bir maşında ölçülüb)
const TIERS = [
  ['L1 cache', 1.5],
  ['L3 cache', 27.6],
  ['main memory', 156],
  ['RAM-dakı fayl (page cache)', 1100],
  ['SSD, random oxu', 73500],
  ['hard disk seek', 10000000],
  ['yaxındakı server', 1600000],
  ['başqa qitədəki server', 13600000],
];

function human(ns) {
  const cyclesInSeconds = ns / 0.357;          // 1 cycle = 1 saniyə, 2.8 GHz-də
  if (cyclesInSeconds < 90) return `${cyclesInSeconds.toFixed(0)} saniyə`;
  if (cyclesInSeconds < 5400) return `${(cyclesInSeconds / 60).toFixed(0)} dəqiqə`;
  if (cyclesInSeconds < 172800) return `${(cyclesInSeconds / 3600).toFixed(1)} saat`;
  if (cyclesInSeconds < 3.2e7) return `${(cyclesInSeconds / 86400).toFixed(0)} gün`;
  return `${(cyclesInSeconds / 3.15e7).toFixed(1)} il`;
}

function realTime(ns) {
  if (ns < 1000) return `${ns.toFixed(1)} ns`;
  if (ns < 1e6) return `${(ns / 1000).toFixed(1)} \u00b5s`;
  if (ns < 1e9) return `${(ns / 1e6).toFixed(1)} ms`;
  if (ns < 6e10) return `${(ns / 1e9).toFixed(1)} s`;
  return `${(ns / 6e10).toFixed(1)} dəq`;
}

export default function HierarchyLab() {
  const [fastI, setFastI] = useState(2);       // main memory
  const [slowI, setSlowI] = useState(4);       // SSD
  const [hit, setHit] = useState(90);
  const [count, setCount] = useState(1000000);

  const fast = TIERS[fastI][1];
  const slow = TIERS[slowI][1];
  const h = hit / 100;
  const avg = h * fast + (1 - h) * slow;
  const total = avg * count;
  const allFast = fast * count;
  const allSlow = slow * count;
  const shareSlow = ((1 - h) * slow) / avg * 100;
  const inverted = fast >= slow;

  const pick = (list, cur, set, label) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 3 }}>{label}</div>
      <div>
        {list.map(([name, ns], i) => (
          <button key={name} onClick={() => set(i)} style={{
            margin: 2, padding: '3px 9px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            border: `2px solid ${cur === i ? ACC : '#888'}`,
            background: cur === i ? `${ACC}1e` : 'transparent',
            color: cur === i ? ACC : 'inherit',
            fontWeight: cur === i ? 'bold' : 'normal',
          }}>{name}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      {pick(TIERS, fastI, setFastI, 'sürətli qat — hit-lər buradan cavablanır')}
      {pick(TIERS, slowI, setSlowI, 'yavaş qat — miss-lər buraya getməli olur')}

      {inverted && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, marginBottom: 8,
          border: `2px solid ${DNG}`, background: `${DNG}14`, color: DNG, fontSize: 13,
        }}>
          Sürətli qat yavaş qatdan sürətli deyil. Belə bir cache sadəcə əlavə yükdür.
        </div>
      )}

      <div style={{ margin: '12px 0' }}>
        <label style={{ fontSize: 13 }}>
          hit rate: <b style={{ fontFamily: 'monospace', color: ACC }}>{hit}%</b>
          <span style={{ color: '#888' }}> — deməli müraciətlərin {100 - hit}%-i miss olur</span>
        </label>
        <input type="range" min="0" max="100" value={hit}
          onChange={(e) => setHit(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 6 }}>müraciət (access)</span>
        {[1000, 100000, 1000000, 10000000].map((c) => (
          <button key={c} onClick={() => setCount(c)} style={{
            margin: 2, padding: '3px 9px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            fontFamily: 'monospace',
            border: `2px solid ${count === c ? ACC : '#888'}`,
            background: count === c ? `${ACC}1e` : 'transparent',
            color: count === c ? ACC : 'inherit',
          }}>{c.toLocaleString()}</button>
        ))}
      </div>

      {/* orta dəyər nədən yaranır */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
        orta müraciət nədən ibarətdir
      </div>
      <div style={{
        display: 'flex', height: 30, borderRadius: 7, overflow: 'hidden',
        border: '1px solid #8886', marginBottom: 6,
      }}>
        <div style={{
          width: `${100 - shareSlow}%`, background: `${ACC}40`, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{100 - shareSlow > 14 ? `hit ${(100 - shareSlow).toFixed(0)}%` : ''}</div>
        <div style={{
          width: `${shareSlow}%`, background: `${DNG}40`, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{shareSlow > 14 ? `miss ${shareSlow.toFixed(0)}%` : ''}</div>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#888', marginTop: 0 }}>
        {(h).toFixed(2)} × {realTime(fast)} + {(1 - h).toFixed(2)} × {realTime(slow)} ={' '}
        <b style={{ color: 'inherit' }}>{realTime(avg)}</b> hər müraciətə
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${ACC}`, background: `${ACC}14`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            {count.toLocaleString()} müraciət üçün cəmi
          </div>
          <div style={{ fontSize: 24, fontFamily: 'monospace', color: ACC }}>
            {realTime(total)}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            mümkün ən yaxşı: {realTime(allFast)} · ən pis: {realTime(allSlow)}
          </div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10,
          border: `2px solid ${shareSlow > 50 ? DNG : '#888'}`,
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>miss-lərin payı</div>
          <div style={{
            fontSize: 24, fontFamily: 'monospace',
            color: shareSlow > 50 ? DNG : 'inherit',
          }}>{shareSlow.toFixed(0)}%</div>
          <div style={{ fontSize: 12, color: '#888' }}>ümumi vaxtın</div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '10px 14px', borderRadius: 10, border: '2px solid #888',
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>bir müraciət, insan vaxtında</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace' }}>{human(avg)}</div>
          <div style={{ fontSize: 12, color: '#888' }}>bir cycle bir saniyə olsaydı</div>
        </div>
      </div>

      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 10,
        border: `2px solid ${shareSlow > 60 ? DNG : ACC}`,
        background: shareSlow > 60 ? `${DNG}14` : `${ACC}14`, fontSize: 13,
      }}>
        {shareSlow > 90 ? (
          <>Proqram artıq miss-lərin özüdür. Sürətli qatın sürəti burada əhəmiyyətsizdir —
          yaxşılaşdırmağa dəyən yeganə şey hit rate-dir.</>
        ) : shareSlow > 60 ? (
          <>Vaxtın çoxu miss-lərə gedir. Hit rate-i bir neçə faiz qaldırmaq sürətli qatı
          sürətləndirməkdən qat-qat çox iş görəcək.</>
        ) : hit === 100 ? (
          <>Hər şey hit olur, deməli yalnız sürətli qatın sürəti əhəmiyyət daşıyır. Hər cache
          çatmağa çalışdığı vəziyyət elə budur.</>
        ) : (
          <>İki qat təxminən bərabər töhfə verir. Hər hansı birini yaxşılaşdırmaq köməkdir —
          bu, olduqca rahat bir mövqedir.</>
        )}
      </div>
    </div>
  );
}
```

</Sandpack>

Bu oyuncaqdan götürüləsi davranış formulun nə qədər **birtərəfli** olduğudur. Sürətli qat RAM, yavaş qat SSD olduqda, 90% hit rate-də belə miss-lər ümumi vaxtın 98%-dən çoxuna cavabdehdir. RAM-ı iki dəfə sürətli edə bilərsən və az qala fərqini hiss etməzsən; hit rate-i 90%-dən 99%-ə qaldırsan, işləmə vaxtını az qala on dəfə azaldarsan.

Bu modulun mövcud olmasının bütün səbəbi elə budur. Performans işi nadir hallarda sürətli şeyi daha da sürətli etmək haqqındadır. O, **yavaş şeyə daha az getmək** haqqındadır.

<Recap>

- Hər yaddaş texnologiyası eyni sualın cavabıdır — *bu bayt harada yaşamalıdır?* — və hər cavab **fast**, **big** və **cheap** arasında bir güzəştdir, çünki heç bir material üçünü birlikdə vermir.
- **Memory hierarchy** hamısını bir yerdə işlətmək qərarıdır: register-lər, L1/L2/L3 cache, main memory, SSD, hard disk və şəbəkə üzərindən başqa maşınlar. Aşağı düşdükcə hər qat daha çox saxlayır, bayta görə daha az başa gəlir və daha yavaş cavab verir.
- Bir maşında başdan sona ölçüldükdə fərq sürətdə təxminən **34 milyon dəfədir** — register üçün 0.4 ns, başqa qitədəki server üçün 13.6 ms — və tutumda təxminən bir milyard dəfə.
- Bir CPU cycle **bir saniyə** olacaq şəkildə miqyaslandırdıqda: L1 4 saniyə, main memory **7 dəqiqə**, SSD oxusu **2 gün**, hard disk seek **11 ay** və dünyanın o üzünə sorğu **13 il** olur.
- Bu, *iyerarxiyadır*, çünki **hər qat özündən aşağıdakını cache-ləyir** — və eyni dörd suala (nəyi saxlamalı, necə tapmalı, nəyi evict etməli, nəyi prefetch etməli) hardware, əməliyyat sistemi, sənin tətbiq kodun və brauzerin cavab verir. Caching bir pattern-dir, CPU xüsusiyyəti deyil.
- **Page cache** əməliyyat sisteminin fayl datasını RAM-da cache-ləməsidir. Burada ölçülüb: eyni 3 000 random 4 KB oxu SSD-dən hər biri **73.5 µs**, page cache-dən hər biri **1.1 µs** çəkdi — **65 dəfə sürətli**. Benchmark-ın ikinci işlətməsinin sənə yalan deməsinin səbəbi budur.
- **Volatility xətti** main memory ilə SSD arasında oturur: yuxarıdakı hər şey enerji kəsiləndə yaddan çıxarır, aşağıdakı hər şey sağ qalır. "Durability", "commit" və "save" sözlərinin hamısı elə bu bir sərhəd haqqındadır.
- Sequential müraciət storage səviyyəsində də qazanır və daha böyük fərqlə: eyni SSD başdan sona oxunanda **2 039 MB/s**, random 4 KB oxularda isə **56 MB/s** ekvivalenti verdi — **37 dəfə** fərq, çünki hər sorğunun sabit bir xərci var.
- İşləyən proqramın datası eyni vaxtda bütün nərdivana yayılıb və **kodunda heç nəyin hansı pillədə olduğunu bildirən heç nə yoxdur** — halbuki performansın çoxunu elə bu yerləşmə həll edir.
- Mərkəzi hesablama: `average = hit rate × fast + miss rate × slow`. O qədər birtərəflidir ki, hit rate-i yaxşılaşdırmaq az qala həmişə sürətli qatı yaxşılaşdırmaqdan üstündür. Performans işi **yavaş şeyə daha az getmək** deməkdir.

</Recap>

<Challenges>

#### Put the ladder in order {/*put-the-ladder-in-order*/}

Aşağıda datanın ola biləcəyi yeddi yer qarışıq sırada verilib. (a) Onları ən sürətlidən ən yavaşa doğru sırala. (b) Volatility xəttini çək — hansıları enerji kəsilməsindən sağ çıxır? (c) Onlardan ikisi adlarının işarə etdiyindən çox daha yaxın sürətdədir. Hansılar və nə üçün?

```
 hard disk · L2 cache · başqa ölkədəki server · main memory
 SSD · CPU register · page cache-dəki fayl datası
```

<Hint>

(c) üçün page cache-in fiziki olaraq nə olduğunu xatırla. Adında fayl var, amma yaddaşın özü fayl deyil.

</Hint>

<Solution>

**(a) Ən sürətlidən ən yavaşa**, bu dərsdə ölçülmüş rəqəmlərlə:

```
 1. CPU register                    0.4 ns
 2. L2 cache                        4.1 ns
 3. main memory                   156   ns
 4. page cache-dəki fayl datası      1.1 us
 5. SSD                             73.5 us
 6. hard disk                      ~10   ms
 7. başqa ölkədəki server          ~13.6 ms
```

**(b) Volatility xətti** **4 ilə 5-in** arasına düşür. Register-lər, cache, main memory və page cache — hamısı volatile yaddaşda yaşayır və enerji kəsilən an yox olur. SSD, hard disk və uzaqdakı server məzmununu saxlayır.

Bir az intuisiyaya zidd hissəni qeyd et: **page cache volatile-dir**, halbuki faylların kopiyalarını saxlayır. Diskdəki fayl sağ qalır; cache-lənmiş kopiya yox. Datanı "yazmış" bir proqramın hələ də onu itirə bilməsinin səbəbi məhz budur — yazma page cache-də, xəttin yuxarısında, flush olunmağı gözləyə bilər. `fsync`-in mövcud olma səbəbi elə budur.

**(c) Adlarının hiss etdirdiyindən daha yaxın olan ikisi: main memory və page cache.** İkisi də RAM-dır. Adlar birinin memory, digərinin storage olduğunu düşündürür, ancaq "page cache" sadəcə əməliyyat sisteminin fayl məzmunu ilə doldurduğu main memory bölgəsidir. Aralarında ölçülmüş fərq (156 ns qarşısında 1.1 µs) heç də yaddaş sürəti fərqi deyil — bu, dəyişəni birbaşa oxumaq yerinə əməliyyat sistemindən keçməyin, yəni **system call**-un və ətrafındakı uçotun xərcidir.

Bunu görmək faydalıdır: nərdivandakı boşluqların bəziləri fizikadır, bəziləri isə proqram təminatı yüküdür. Onları bir-birindən ayırd etmək dəyər, çünki ikisindən yalnız biri mühəndislik yolu ilə aradan qaldırıla bilər.

</Solution>

#### Find the bottleneck {/*find-the-bottleneck*/}

Bir request handler hər sorğuda aşağıdakı işi bir dəfə görür:

```
 2 000 000  arifmetik əməliyyat     (hərəsi təxminən 1 cycle)
     8 000  main memory müraciəti
        40  random SSD oxusu
         3  başqa region-dakı servisə çağırış
```

(a) Bu dərsdəki rəqəmlərlə həmin dörd kateqoriyanın hərəsinin nə qədər çəkdiyini təxmin et. (b) Hansı dominantdır? (c) Komandanın yalnız birini optimallaşdırmağa vaxtı var. Hansını və nə qazanmağı gözləyərsən?

<Solution>

**(a) Hər kateqoriyanı təxmin edək** — cycle üçün 0.4 ns, memory müraciəti üçün 156 ns, random SSD oxusu üçün 73.5 µs və region-lar arası çağırış üçün 13.6 ms:

```
 arifmetika:   2 000 000 × 0.4 ns   =   0.8 ms
 memory:           8 000 × 156 ns   =   1.25 ms
 SSD:                 40 × 73.5 us  =   2.94 ms
 network:              3 × 13.6 ms  =  40.8 ms
                                        ─────────
 cəmi                               ≈  45.8 ms
```

**(b) Network tamamilə dominantdır** — ümumi vaxtın təxminən **89%**-i. İki milyondan çox əməliyyatın içindən yalnız üçü — üç uzaq çağırış — vaxtın az qala onda doqquzunu tutur.

**(c) Network çağırışlarını optimallaşdır.** Yaxınlıqda başqa heç nə yoxdur və arifmetikanı açıq yazmağa dəyər, çünki nəticə intuisiyaya çox ziddir:

- Üç uzaq çağırışdan **birini** aradan qaldırsan, 13.6 ms qazanırsan — bütün sorğunun təxminən **30%**-i.
- Arifmetikanı **iki dəfə sürətli** etsən, 0.4 ms qazanırsan — **1%**-dən az. Hətta onu *sonsuz* sürətli etsən də, 2%-dən az qazanırsan.

Praktikada nə edərdin? Standart addımlar, qazanc sırası ilə: üç çağırışı ardıcıl yerinə **paralel** işə sal (əgər müstəqildirlərsə, network xərci 40.8 ms-dən təxminən 13.6 ms-ə düşür — heç bir biznes məntiqinə toxunmayan bir dəyişiklik üçün bütün sorğuda 60% qazanc); nəticələri təkrarlanırsa, onları **cache**-lə; ya da servis imkan verirsə, onları bir çağırışa **batch** et.

Ümumi dərs bütün bu mövzunun üstündə qurulduğu dərsdir: **əməliyyatları sayına görə deyil, nərdivandakı yerinə görə çəkiləndirib say.** İki milyon ucuz əməliyyat üç bahalı əməliyyata birmənalı şəkildə uduzdu.

</Solution>

#### The benchmark that got faster on its own {/*the-benchmark-that-got-faster-on-its-own*/}

Bilikləri köçürmə tapşırığı. Bir həmkarın uğur xəbəri verir: *"Report sorğumuzu optimallaşdırdım. Əvvəl 900 ms çəkirdi, indi 40 ms — 22 dəfə yaxşılaşma. Əmin olmaq üçün on dəfə işlətdim."* Dəyişikliyinə baxıb görürsən ki, bir index əlavə edib.

Məmnunsan, ancaq şübhələnirsən. 22 dəfəyə inanmazdan əvvəl nəyi yoxlayardın, ehtimalən nə baş verir və bunu vicdanlı şəkildə necə ölçərdin?

<Solution>

**Əvvəlcə yoxlanmalı şey: on dəfəni necə işlətdi?** Əgər on işlətmə ardıcıl olubsa, birinci işlətmə cold storage-ı ölçürdü, qalan doqquzu isə **page cache**-i. Bu dərsdə ölçülmüş 65 dəfəlik fərq elə bu effektdir və sorğuda heç bir dəyişiklik olmadan tək başına "22 dəfə yaxşılaşma" istehsal etməyə tam qadirdir.

**Ehtimalən baş verən** iki şeyin qarışığıdır və bütün məsələ də odur ki, bu təcrübə onları bir-birindən ayıra bilmir:

1. Index həqiqətən kömək edir — çox sətrin scan olunmasını bir neçə sətrin lookup-una çevirir, bu da storage oxumalarının *sayını* azaldır.
2. Data artıq warm-dır. 900 ms baseline cold storage üzərində bir dəfə ölçülüb; 40 ms rəqəmi isə RAM-da duran data üzərindəki işlətmələrin ortasıdır.

İşarə rəqəmlərin formasındadır. Əgər o, on ölçmənin hər birini ayrı-ayrı bildirsəydi, cold-cache effekti bir yavaş işlətmə və ardından doqquz sürətli işlətmə kimi görünərdi — on ardıcıl bərabər nəticədən tamamilə fərqli bir mənzərə.

**Bunu vicdanlı şəkildə necə ölçmək lazımdır.** Prinsip oxşarı oxşarla müqayisə etməkdir, yəni hər iki versiyanı hər iki vəziyyətdə ölç:

- **Cold, hər iki versiya.** Hər işlətmədən əvvəl cache-i təmizlə (ya da verilənlər bazasını yenidən başlat, ya da datanı heç görməmiş maşın işlət). Bu, real istifadəçinin ilk sorğuda gördüyü vicdanlı rəqəmi verir.
- **Warm, hər iki versiya.** Hər versiyanı bir neçə dəfə işlədib sabit vəziyyəti götür. Bu, tez-tez sorğulanan qaynar yol üçün vicdanlı rəqəmi verir.
- **Hər dörd rəqəmi bildir**, çünki onlar fərqli suallara cavab verir. Gündə bir dəfə açılan dashboard cold rəqəmə görə maraqlıdır; saniyədə min dəfə çağırılan endpoint isə warm rəqəmə.
- İstənilən warm ölçmənin **birinci işlətməsini at** və bunu etdiyini de.

Çox güman ki, index real və dəyərli bir yaxşılaşmadır — index-lər adətən elə olur. Amma "22 dəfə" hələ onun ölçüsü deyil; o, index-in *və* page cache-in birlikdə ölçüsüdür və vicdanlı variantı az qala mütləq müdafiə edə biləcəyin daha kiçik bir rəqəmdir.

Formalaşdırmağa dəyən vərdiş: **hər dəfə performans rəqəmi həddindən artıq yaxşı görünəndə, hər işlətmə zamanı datanın nərdivanın hansı pilləsində olduğunu soruş.** İyerarxiya görünməzdir, nəhəngdir və imkan versən, səni şirnikləndirəcək. ✓

</Solution>

</Challenges>

<LearnMore title="How RAM Works" path="/learn/faza-0/modul-0-4/how-ram-works">

Bu nərdivanın bir pilləsi hamısından əvvəl açılmağı haqq edir, çünki proqramının datası əslində orada yaşayır: main memory. Növbəti dərs RAM çipinin içinə girir — bir bitin o qədər sızan bir kondensatorda yük kimi necə saxlandığı ki, saniyədə minlərlə dəfə yenidən yazılmalı olur, memory oxumağın nə üçün istəyib-istəməməyindən asılı olmayaraq bütöv bir *row* oxumaq deməli olduğu və memory modulunun üstündəki rəqəmlərin əslində nədən gəldiyi.

</LearnMore>