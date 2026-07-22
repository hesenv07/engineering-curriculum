---
title: "Endianness: Baytların Sırası"
---

<Intro>

Jonathan Swift-in *Qulliverin səyahətləri*ndə (1726) Lilliput və Blefuscu imperiyaları bir doktrina sualı üstündə nəsillər boyu davam edən müharibə aparır: bişmiş yumurta **yoğun ucundan**, yoxsa **nazik ucundan** sındırılmalıdır? Satirada on bir min lilliputlu yanlış ucdan sındırmaqdansa ölümü seçir. Bu, insanların ən çox əhəmiyyətsiz fərqlər üstündə vuruşması haqqında zarafat idi — 1980-ci il aprelin 1-nə qədər: o gün şəbəkə mühəndisi **Danny Cohen** *"On Holy Wars and a Plea for Peace"* ("Müqəddəs müharibələr haqqında və sülh çağırışı") adlı memo dərc edib göstərdi ki, kompüter mühəndisləri *məhz bu müharibəni*, tam ciddiyyətlə, real itkiləri olan real sual üstündə aparırlar: rəqəm bir bayta sığmayanda **baytlarından hansı yaddaşda əvvəl gəlməlidir?** İki düşərgə artıq uyğunsuz hardware buraxmışdı. Cohen onları Big-Endian-lar və Little-Endian-lar adlandırdı, adlar əbədi yapışdı və müharibə onun proqnozlaşdırdığı kimi bitdi — qaliblə yox, sərhədlə. Laptopunuz o sərhədin bir tərəfində yaşayır, internet o biri tərəfində — və hər gün, saniyədə milyardlarla dəfə, rəqəmlər onu keçir. Bu dərs keçiddə baş verənlər haqqındadır — o cümlədən `UNIX` sözünün onu keçib `NUXI` kimi geri qayıtdığı vaxt haqqında.

</Intro>

<YouWillLearn>

- **Endianness** əslində nədir — və onu birdəfəlik birmənalı edən o bir cümlə
- **Big-endian** vs **little-endian**: eyni 4 baytın necə iki fərqli rəqəm kimi oxunduğu, son rəqəmə qədər işlənmiş
- Kim hansı düşərgədədir: CPU-nuz, internet və pasport daşıyan fayl formatları
- Endianness-in niyə illərlə görünməz qaldığı və yalnız *sərhədlərdə* dişlədiyi — şəbəkələr, fayllar və NUXI problemi
- Little-endian-ın CPU-nu qazanmasının təəccüblü dərəcədə yaxşı səbəbi (və big-endian-ın kabeli qazanmasının yaxşı səbəbi)
- İki klassik yanlış inanc — çevrilmiş bitlər və yeri dəyişmiş sətirlər — və bayt sırasını bir daha heç vaxt necə qarışdırmamaq

</YouWillLearn>

## Bir rəqəm, dörd qutu {/*one-number-four-boxes*/}

Bu modulun qurduğu yaddaş mənzərəsini xatırlayın: RAM nömrələnmiş poçt qutularından ibarət nəhəng küçədir, hər qutuya bir **bayt** — və Dərs 2-də tanış olduğunuz `0x7ffee4b2c8d0` kimi hex dəyər tək bir qutunun poçt ünvanıdır. Ən vacibi: bayt *ünvanı olan ən kiçik vahiddir*. Yarım qutunu ünvanlaya bilməzsiniz.

İndi sadə, günahsız bir tapşırıq. Proqramınız 32-bitlik `0x12345678` rəqəmini saxlayır — dörd bayt: `12`, `34`, `56`, `78` — və memory allocator sizə dörd ardıcıl poçt qutusu verir, ünvanlar 1000-dən 1003-ə. 1000-ci qutuya hansı bayt gedir?

Bir anlıq dayanıb bunun nə qədər *həlledilməz* olduğunu hiss edin. Riyaziyyatda buna cavab verən heç nə yoxdur. Fizikada da yoxdur. Rəqəm bir bölünməz dəyərdir; qutular fiziki sıradır; hansısa müqavilə birini digərinin üstünə köçürməlidir və bunu yazmağın iki öz-özünə uyğun yolu var:

<DiagramGroup>

<Diagram name="endianness/be_memory" height={300} width={340} alt="1000, 1001, 1002, 1003 ünvanlarında bir sırada dörd yaddaş xanası, 0x12345678 dəyərinin 12, 34, 56, 78 baytlarını saxlayır. İlk xana — 12 — mavi ilə vurğulanıb və 'MSB əvvəl' etiketlənib. Altındakı qeyd: hex necə yazılırsa, o sırada saxlanır — böyük uc öndə gedir.">

**Big-endian:** ən böyük dərəcəli bayt ən aşağı ünvanı tutur. Yaddaş yazılmış rəqəm kimi oxunur: `12 34 56 78`.

</Diagram>

<Diagram name="endianness/le_memory" height={300} width={340} alt="Eyni dörd yaddaş xanası 1000-dən 1003-ə, indi 78, 56, 34, 12 saxlayır. Son xana — 12 — mavi ilə vurğulanıb və 'MSB sonda' etiketlənib. Altındakı qeyd: kiçik uc öndə gedir — 1000-ci ünvan rəqəmin ən kiçik hissəsini saxlayır.">

**Little-endian:** *ən kiçik* dərəcəli bayt ən aşağı ünvanı tutur. Yaddaş rəqəmi tərsinə saxlayır: `78 56 34 12`.

</Diagram>

</DiagramGroup>

Bu seçim — çox-baytlı dəyərin baytlarının yaddaşdakı sırası — **endianness** adlanır və budur bu barədə nə vaxtsa yaşayacağınız hər çaşqınlığı həll edən, hərfbəhərf əzbərləməyə dəyər bir cümlə: **endianness "ən aşağı ünvanı hansı bayt alır" sualının cavabıdır və başqa heç nə deyil.** Bit sırası deyil. Sətirdəki simvolların sırası deyil. Yalnız: çox-baytlı *rəqəmin* baytlarından hansı ən kiçik ünvanda yaşayır.

Hər iki müqavilə rəqəmi mükəmməl saxlayır. Hər ikisi mükəmməl geri oxuyur. Little-endian yazıb little-endian oxuyan maşın iyirmi il işləyəcək və heç kim baytların "tərsinə" olduğunu sezməyəcək — Dərs 1-i xatırlayın: **baytların mənası yoxdur; müqavilələrin var** — və bir maşının içində müqavilə ardıcıldır. Fəlakət üçün iki tərəf lazımdır. Big-endian oxucunun little-endian məktubu açanda nə baş verdiyinə baxın:

```
Yazılıb (little-endian) 1000..1003-ə:   78 56 34 12

Big-endian fərz edərək geri oxunur:
  0x78563412
  = 0x78×2²⁴ + 0x56×2¹⁶ + 0x34×2⁸ + 0x12
  = 120×16.777.216 + 86×65.536 + 52×256 + 18
  = 2.013.265.920 + 5.636.096 + 13.312 + 18
  = 2.018.915.346  ✗

Nəzərdə tutulan dəyər:
  0x12345678 = 305.419.896  ✓
```

Eyni dörd bayt, bayt-bayt identik, bir bit belə korlanmayıb — və iki müqavilə ~6,6 dəfə fərqlənən rəqəmlər çıxarır. Heç bir xəta qalxmır, çünki *qaldırılacaq xəta yoxdur*: hər tərəf öz müqaviləsinə qüsursuz əməl etdi. Bu janrı artıq tanıyırsınız — Patriot janrıdır, sensor-offset janrıdır: **səssizcə yanlış data** — bu modulun sizə crash-lərdən çox qorxmağı öyrətməkdə davam etdiyi uğursuzluq rejimi.

## İki düşərgə {/*the-two-camps*/}

Bəs kim nəyi seçdi? Cohen-in proqnozlaşdırdığı sərhəd, təxminən, *prosessorlarla* *onların arasında səyahət edən hər şey* arasından keçir.

**Komanda Little-Endian — CPU-lar.** Intel little-endian-ı ən erkən mikroprosessorlarına qoydu, x86 onu miras aldı və x86 desktopu və serveri fəth etdi. ARM texniki olaraq **bi-endian**-dır (hər iki cür işləyə bilir), amma praktikada — hər Android telefon, hər iPhone, hər Apple Silicon Mac — little-endian işləyir. RISC-V: little-endian. Bu gün istehsal olunan silisiumun böyük əksəriyyəti, o cümlədən bunu oxuduğunuz maşın, kiçik ucunu əvvəl saxlayır. Bunun əla mühəndislik səbəbi var və aşağıda öz DeepDive-ını alır.

**Komanda Big-Endian — kabel və arxivlər.** IBM-in System/360-ı (1964 — Dərs 1-də sizə 8-bitlik baytı verən maşın) big-endian idi; Motorola-nın 68000-i və Sun-ın SPARC-ı da. Amma düşərgənin həlledici ərazisi **şəbəkədir**: internetin nüvə protokolları yazılanda elan etdilər ki, packet header-lərindəki bütün çox-baytlı rəqəmlər — portlar, ünvanlar, uzunluqlar — ən böyük dərəcəli bayt əvvəl olmaqla səyahət edir. Bu günə qədər big-endian-ın rəsmi sinonimi **network byte order**-dır. Çox fayl formatı arxasınca getdi: PNG və JPEG daxili tam ədədlərini big-endian saxlayır; 90-larda şəbəkəli dünya üçün dizayn edilmiş Java isə `.class` fayllarını və default I/O-sunu hansı CPU-da işləməsindən asılı olmayaraq big-endian etdi.

Bir neçə format isə ləzzətli dərəcədə vicdanlı bir şey etdi: **TIFF** şəkil faylları iki-baytlıq pasportla başlayır — `II` (little-endian, "Intel") və ya `MM` (big-endian, "Motorola") — fayl ilk iki baytında *öz endianness-ini elan edir* və hər oxucu uyğunlaşır. Bu vaxt GIF, BMP və ZIP little-endian gedir, çünki PC-lərdə doğulublar. Hər binar formatın spesifikasiyası, ilk səhifəsinin harasındasa, yumurta sualına cavab verir; unutduqları isə interoperability folkloruna çevrilir.

Öz maşınınız soruşsanız sədaqətini etiraf edəcək:

<TerminalBlock>

lscpu | grep 'Byte Order'
Byte Order:                         Little Endian

</TerminalBlock>

JavaScript isə CPU-nu cinayət başında tuta bilir. Typed array görünüşü (Dərs 3-ün `Int8Array` fəndindəki alət) 32-bitlik rəqəmi yaddaşa yazıb sonra xam ilk baytına baxmağa imkan verir:

```js
new Uint8Array(new Uint32Array([0x12345678]).buffer)[0].toString(16)
```

<ConsoleBlock level="info">

'78'

</ConsoleBlock>

O buffer-in sıfırıncı ünvanı `78` saxlayır — kiçik uc. JavaScript işlədən bir ovuc big-endian maşında eyni sətir `'12'` qaytarır. Bu, endianness-in yüksək səviyyəli dildən ümumiyyətlə *görünə bildiyi* nadir yollardan biridir və bu, qəsdən belədir: bir maşının içində qaldığınız və xam baytlarla yox, *dəyərlərlə* danışdığınız müddətcə müqavilə başqasının problemidir. Bu da bizi onun başqasının problemi olmaqdan çıxdığı yerə gətirir.

## Harada dişləyir: sərhədlər {/*where-it-bites-boundaries*/}

Endianness-in özünəməxsus təhlükəsizlik profili var: data **maşın sərhədini** keçənə qədər *tamamilə zərərsizdir* — şəbəkə soketi, binar fayl, memory-mapped cihaz, bir tipin baxışından digərinə cast. Sərhəddə yazanın müqaviləsi ilə oxuyanın müqaviləsi ilk dəfə görüşür və *yoldakı baytların* hansı müqaviləyə tabe olduğunu heç kim yazmayıbsa, Unix folklorunun ən qədim döyüş hekayəsini alırsınız.

1970-lərin sonunda — hekayə haker mədəniyyətinin salnaməsi olan Jargon File-da belə qorunub — Unix PDP-11-dən yeni maşına port edilirdi. İki maşın baytları 16-bitlik sözlərə əks sıralarda yığırdı. Boot mesajlarının harasındasa `UNIX` sözünün dörd baytı, iki 16-bitlik dəyər kimi yığılıb iki konvensiya arasından keçəndə, hər sözün baytları yerini dəyişdi — və sistem qürurla çap etdi:

<Diagram name="endianness/nuxi_problem" height={320} width={720} alt="Üst sıra: UNIX-in dörd ASCII baytı iki 16-bitlik söz qutusu kimi göstərilib, birinci sözdə U N, ikincidə I X, hex dəyərləri 55 4E və 49 58, 'mənbə maşında iki 16-bitlik söz kimi yığılıb' etiketi ilə. İki aşağı ox: 'konvensiya çevriləndə hər sözün baytları yer dəyişir'. Alt sıra: eyni iki söz qutusu indi N U və X I saxlayır, hex 4E 55 və 58 49, qırmızı ilə vurğulanıb, və nəticədə çap olunan mətn NUXI, 'eyni baytlar, o biri müqavilə altında oxunmuş' etiketi ilə.">

Dörd düzgün bayt, iki çevrilmiş söz-müqaviləsi: banner `NUXI` oxunur. Buq o qədər kanonikdir ki, "NUXI problemi" bayt-sırası uğursuzluqlarının ümumi adına çevrildi.

</Diagram>

Bir bayt belə itmədi, zədələnmədi. `U`, `N`, `I`, `X` — hex `55 4E 49 58`, birbaşa Dərs 2-nin mətn müqaviləsindən — hamısı çatdı. Yalnız *mövqelər* yalan dedi. Və endianness buqunu adi korrupsiyadan bir baxışla ayıran əlamətə diqqət edin: **zibil öz datanızdan düzəldilib — səliqəli, nizamlı parçalarla yeri dəyişdirilmiş.** Təsadüfi korrupsiya səs-küyə oxşayır; bayt-sırası buqları anaqrama oxşayır.

İş həyatında ən çox dişləyən sərhəd isə şəbəkədir. Little-endian laptopunuz serverə "məni **8080** portuna qoş" demək istəyir. 16-bitlik rəqəm kimi 8080 `0x1F90`-dır və RAM-ınız onu kiçik-uc-əvvəl `90 1F` kimi saxlayır. Amma kabelin müqaviləsi network byte order-dır — big-endian. Kimsə sərhəddə, *açıq-aşkar*, yerdəyişmə etməlidir:

<Diagram name="endianness/network_byte_swap" height={360} width={720} alt="İki üfüqi zolaq. Üst zolaq, 'htons() ilə' etiketli: little-endian işarəli laptop qutusu yaddaş baytları 90 1F ilə, htons() etiketli ox 'network byte order' işarəli iki kabel baytına 1F 90 aparır, sonra ox qəbuledici qutuya — port 8080 oxunur, mavi işarə ilə. Alt zolaq, 'xam yaddaş kopyası' etiketli: eyni laptop baytları 90 1F kabelə dəyişməz 90 1F kimi çıxır və big-endian kabel müqaviləsini tətbiq edən qəbuledici qırmızı xaçla port 36895 oxuyur, 'heç bir xəta qalxmır — sadəcə yanlış port' annotasiyası ilə.">

Bir sərhəd, iki nəticə. Yerdəyişmə könüllü nəzakət deyil; hər iki düşərgənin öz yaddaş sırasını saxlayıb yenə danışa bilməsinə imkan verən sazişdir.

</Diagram>

Yoxlama, əllə — təmiz Dərs 2 hex bacarıqları:

```
Nəzərdə tutulan port:  8080 = 0x1F90
  0x1F90 = 1×4096 + 15×256 + 9×16 + 0 = 8080 ✓

Kabel xam little-endian baytları daşıyır: 90 1F
Qəbuledici kabelin big-endian müqaviləsini tətbiq edir:
  0x901F = 9×4096 + 0×256 + 1×16 + 15
         = 36.864 + 16 + 15
         = 36.895 ✗
```

Bağlantı sakitcə 36895 portuna gedir — orada, çox güman, heç nə dinləmir və elə bir `connection refused` alırsınız ki, kodunuzdakı *dəyərlərə* nə qədər baxsanız da izah olunmayacaq, çünki dəyərlər həmişə düz idi. Buna görə Yer üzündəki hər socket API tərcümə kvartetini gətirir — `htons`, `htonl`, `ntohs`, `ntohl` (*host-to-network-short*, *host-to-network-long* və geriyə) — və buna görə onların sənədləri big-endian hostlarda heç nəyə kompilyasiya olunduqlarını nəzakətlə heç vaxt qeyd etmir. Bu funksiyalar riyaziyyat deyil; **sərhəd nəzarətidir**.

Daha bir sərhəd keçidi — və bunu artıq etmisiniz. Dərs 1-də iki bayt `48 69` mətn kimi oxunanda `Hi` yazırdı, tək 16-bitlik rəqəm kimi oxunanda **18.537** olurdu. İndi o əlaqəni öz real laptopunuzda tərsinə işə salın: little-endian maşında 18.537 (`0x4869`) *rəqəmini* saxlayın — yaddaş `69 48` saxlayır. O baytları mətn müqaviləsindən keçirin və yazırlar... `iH`. Mətn və rəqəmlər həqiqətən fərqli müqavilələr altında eyni baytlardır — amma endianness-i yalnız *rəqəm* müqaviləsi daşıyır. Bu da dərsin indi zərərsizləşdirməli olduğu tələni qurur.

<Pitfall>

**Əksər endianness buqlarını yaradan iki yanlış inanc.**

*Yanlış inanc 1: "little-endian bitləri çevirir."* Xeyr. Bayt ünvanlamanın atomudur — möhürlənmiş vahid kimi səyahət edir, 8 biti sabit sırada, MSB-dən LSB-yə, düz Dərs 2-nin öyrətdiyi kimi. `0x12345678` little-endian-da `78 56 34 12`-dir — `0x12` baytı hələ də `00010010` bit nümunəsidir, toxunulmamış. Endianness *qutuların* yerini dəyişir, qutunun içindəkilərin heç vaxt. Özünüzü binar sətri simvol-simvol tərsinə çevirərkən tutsanız, dayanın: mühəndislikdən çıxıb origamiyə girmisiniz.

*Yanlış inanc 2: "sətirlərin də yeri dəyişir."* Xeyr. ASCII müqaviləsi altında sətir *müstəqil 1-baytlıq dəyərlərin ardıcıllığıdır* və 1-baytlıq dəyərin yenidən sıralanacaq heç nəyi yoxdur — `"Hi"` indiyə qədər qurulmuş hər maşında `48 69`-dur. Endianness yalnız **çox-baytlı ədədi vahidə** tətbiq olunur (16/32/64-bitlik tam ədəd, float-un 4 və ya 8 baytı). `NUXI` hekayəsi bunu təkzib etmir: baytların yeri məhz *16-bitlik rəqəmlər kimi* emal edildikləri üçün dəyişdi, simvollar kimi yox. Veriləcək sual heç vaxt "bu data mətndir, yoxsa binar?" deyil — "**vahid nədir və vahid bir baytdan genişdir?**" Bir-baytlıq vahidlər: immunitetli. Daha geniş vahidlər: tərəf seçin, yazıya alın.

</Pitfall>

<DeepDive>

#### Little-endian CPU-nu niyə qazandı {/*why-little-endian-won-the-cpu*/}

Little-endian əcaib görünür — hər hex dump-da "tərsinə" çap olunur — ona görə bilməyə dəyər ki, silisium müharibəsini təsadüfən yox, əsl ləyaqətlə qazanıb.

**Səbəb 1: hesab kiçik ucdan başlayır.** Odometri xatırlayın: toplama ən kiçik dərəcəli rəqəmdən başlayır, çünki carry orada doğulur və carry-lər yalnız *sola* yayılır. İlk mikroprosessorlar 16-bitlik rəqəmləri bir dəfəyə bir bayt toplayan 8-bitlik maşınlar idi — və little-endian CPU *ən aşağı* ünvandakı baytı götürüb dərhal toplamağa başlaya bilirdi: yuxarı bayt hələ gətirilərkən aşağı baytın cəmini (və carry-sini) artıq hesablayırdı. Big-endian maşınlar hesab başlaya bilməzdən əvvəl rəqəmin *sonuna* çatmalı idi. Bütün çipiniz bir neçə yüz kiloherslə işləyəndə, bir bayt tez başlamaq real puldur.

**Səbəb 2: ünvan hər endə bir şey deməkdir.** Little-endian maşında rəqəmin ünvanı onun *ən kiçik hissəsinin* ünvanıdır — beləliklə `0x00000042` saxlayan eyni 1000 ünvanı 1 bayt da oxusanız, 2, 4 və ya 8 bayt da — 66 oxunur. Tip genişlənəndə dəyərin aşağı baytı yerindən tərpənmir; daha dar endə yenidən şərh edilən pointer yenə hesab baxımından düzgün parçaya işarə edir. Kompilyatorlar, allocator-lar və aşağı səviyyəli kod little-endian qaydası altında ölçülə bilən dərəcədə sadələşir; bu, pointer-cast edənin arzusudur.

**Və buna baxmayaraq big-endian kabeli qazandı — o da ləyaqətlə:** packet dump-ı oxuyan insan rəqəmləri yazı sırasında görür; ünvanları müqayisə edən router-lər ilk fərqlənən baytda qısa-qapanma edə bilir (müqayisə, toplamadan fərqli olaraq, *böyük* ucdan başlayır — Dərs 4-ün biased float-larının tam ədəd kimi sıralanmasının eyni səbəbi). Cohen-in 1980-ci il çağırışı məhz bunu deyirdi: hər iki sıra müdafiə oluna biləndir, heç biri müharibəyə dəyməz və yeganə ölümcül seçim *seçməməkdir*. İnternet böyüyü seçdi; Intel artıq kiçiyi buraxmışdı; saziş hər soketdə bir cüt swap funksiyasıdır. On bir min lilliputlu bundan azı üçün öldü.

</DeepDive>

<DeepDive>

#### Middle-endian: üçüncü yumurta {/*middle-endian-the-third-egg*/}

Təbii ki, hesablama dünyası hər ikisinin çatışmazlıqlarını birləşdirən kompromis konvensiyalar da istehsal etdi. PDP-11 — NUXI hekayəsinin maşınının özü — 32-bitlik dəyərləri *big-endian* söz sırasında yerləşdirilmiş iki little-endian 16-bitlik söz kimi saxlayırdı: bayt ardıcıllığı `2 3 0 1` — sevgi və dəhşətlə **middle-endian** və ya "PDP-endian" kimi yadda qalan düzülüş.

1970-lərin hardware-inə gülməzdən əvvəl təqviminizə baxın. `MM/DD/YYYY` tarix formatı middle-endian-dır (əvvəl orta vahid, sonra kiçik, sonra böyük); `DD/MM/YYYY` little-endian-dır; ISO 8601-in `YYYY-MM-DD`-i isə big-endian-dır — məhz buna görə tarixləri **adi sətir kimi düzgün sıralanan** yeganə formatdır: keçən dərs biased float eksponentinin çəkdiyi fəndin eynisi — ən böyük dərəcəli hissəni əvvələ qoy və kütbeyin leksikoqrafik müqayisə pulsuz düzgün ədədi müqayisəyə çevrilsin. Bəşəriyyət endianness müharibəsini zərflərində və blanklarında əsrlərdir aparır; hesablama sadəcə mövcud olan ən qədim müqəddəs müharibəyə qoşuldu. Loqlarınızı ISO 8601-də yazın və tarixin düzgün tərəfində olun.

</DeepDive>

## Bayt-sırası laboratoriyası {/*the-byte-order-lab*/}

Sərhədi özünüz keçmə vaxtıdır. Aşağıda dörd RAM poçt qutusu var, ünvanlar 1000–1003. Dəyər seçin, **yazma** müqaviləsini seçin, **oxuma** müqaviləsini seçin və həm baytlara, həm də hər baytın mətn-müqaviləsi görüntüsünə baxın (`iH` effekti, canlı). Uyğunsuz kombinasiyalar bu dərsdəki hər rəqəmi dəqiq təkrar istehsal edir: `2.018.915.346`-nı tapın, `36.895` portunu tapın və `iH`-i tapın:

<Sandpack>

```js
import { useState } from 'react';

const PRESETS = [
  { label: '0x12345678', v: 0x12345678 },
  { label: '18537 ("Hi")', v: 18537 },
  { label: '8080 (bir port)', v: 8080 },
];

export default function ByteOrderLab() {
  const [value, setValue] = useState(0x12345678);
  const [writeBig, setWriteBig] = useState(false);
  const [readBig, setReadBig] = useState(false);

  const be = [3, 2, 1, 0].map((i) => (value >>> (i * 8)) & 255);
  const mem = writeBig ? be : [...be].reverse();
  const seen = readBig ? mem : [...mem].reverse();
  const readBack = seen.reduce((n, b) => n * 256 + b, 0);
  const ok = readBack === value;

  const hex = (b) => b.toString(16).toUpperCase().padStart(2, '0');
  const chr = (b) => (b >= 33 && b < 127 ? String.fromCharCode(b) : '·');

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <div>
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setValue(p.v)}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ margin: 8 }}>
        {mem.map((b, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 64, margin: 2,
            border: '1px solid #888', borderRadius: 8, padding: 4
          }}>
            <div style={{ fontSize: 11, color: '#888' }}>{1000 + i}</div>
            <div style={{ fontSize: 20 }}>{hex(b)}</div>
            <div style={{ fontSize: 13, color: '#087ea4' }}>{chr(b)}</div>
          </span>
        ))}
      </div>
      <div style={{ fontFamily: 'system-ui' }}>
        <button onClick={() => setWriteBig(!writeBig)}>
          yaz: {writeBig ? 'big' : 'little'}-endian
        </button>{' '}
        <button onClick={() => setReadBig(!readBig)}>
          oxu: {readBig ? 'big' : 'little'}-endian
        </button>
      </div>
      <h2 style={{ color: ok ? '#087ea4' : '#c1554d' }}>
        geri oxunan: {readBack.toLocaleString()}
      </h2>
      <p style={{ fontFamily: 'system-ui' }}>
        {ok
          ? 'Müqavilələr uyğundur — endianness görünməzdir.'
          : 'Müqavilələr sərhəddə ayrılır: eyni baytlar, yanlış rəqəm.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Oyuncağın tam sadalama ilə nəyi sübut etdiyinə diqqət edin: *uyğun* müqavilələrlə — istənilən cütlə — hər şey işləyir. Buq dörd kombinasiyadan düz ikisində yaşayır və hər ikisi sərhəddir.

<Recap>

- **Endianness** düz bir suala cavab verir: *çox-baytlı rəqəmin hansı baytı ən aşağı ünvanı alır.* **Big-endian**: ən böyük dərəcəli bayt əvvəl, yaddaş yazılmış hex kimi oxunur. **Little-endian**: ən kiçik dərəcəli bayt əvvəl.
- Hər iki müqavilə düzgündür və öz-özünə uyğundur; bir maşının içində endianness **görünməzdir**. Buqlar yalnız **sərhədlərdə** yaşayır — şəbəkələr, binar fayllar, cast-lar — yazanın müqaviləsi fərqli oxucunun müqaviləsi ilə görüşəndə: `0x12345678` `2.018.915.346` olur, port 8080 36.895 olur, `UNIX` `NUXI` olur.
- Bayt-sırası uğursuzluqları **səssizcə yanlış datanı** səliqəli yenidən düzülmüş parçalarla istehsal edir — səs-küy yox, anaqram — və heç bir exception yoxdur, çünki hər iki tərəf öz müqaviləsinə mükəmməl əməl etdi.
- Düşərgələr: little-endian CPU-lara sahibdir (x86, praktikada-ARM, RISC-V), çünki **toplama kiçik ucdan başlayır** və ünvan hər endə eyni şeyi bildirir. Big-endian kabelə (**network byte order**) və PNG, JPEG, Java class faylları kimi formatlara sahibdir, çünki **müqayisə və insanlar böyük ucdan başlayır**. TIFF pasport daşıyır: `II` və ya `MM`.
- Şəbəkə sərhədindəki saziş açıq yerdəyişmədir: **`htons` / `htonl` / `ntohs` / `ntohl`** — riyaziyyat yox, sərhəd nəzarəti.
- Endianness yalnız **bütöv baytların** yerini dəyişir: heç vaxt baytın içindəki bitlərin, heç vaxt vahidi-bir-bayt sətrin simvollarının. Sual həmişə budur: *vahid nədir və bir baytdan genişdirmi?*
- Danny Cohen, 1 aprel 1980: hər iki sıra işləyir; **razılaşmamaq** yeganə ölümcül seçimdir. Dizayn etdiyiniz hər binar formata və protokola bayt sırasını yazın — birinci səhifəyə.

</Recap>

<Challenges>

#### Magic number-in iki üzü {/*the-magic-numbers-two-faces*/}

Dərs 2 hər Java `.class` faylını açan 4-baytlıq magic number `CAFEBABE`-ni təqdim etmişdi. Java class faylları spesifikasiyaya görə big-endian-dır. O dörd bayt **faylda** hansı sırada oturur? Və little-endian x86 JVM o magic-i 32-bitlik registrə *dəyər* `0xCAFEBABE` kimi oxuduqdan sonra, debugger **registrin yaddaşında** hansı bayt sırasını göstərərdi?

<Hint>

Fayl *bayt ardıcıllığıdır* — bir fiziki sırası var, spesifikasiya ilə sabitlənmiş. *32-bitlik dəyər* saxlayan RAM CPU-nun müqaviləsinə tabedir. İki yerə ayrı-ayrı baxın.

</Hint>

<Solution>

**Faylda:** spesifikasiyaya görə big-endian, ən böyük dərəcəli bayt əvvəl — fiziki olaraq `CA FE BA BE`, düz yazı sırasında. Dərs 1-in istənilən aləti (`xxd`) o baytları *hər* maşında 0–3 offset-lərində göstərir, çünki fayl sadəcə bayt ardıcıllığıdır; onun CPU-su yoxdur.

**x86 yaddaşında:** o baytlar 32-bitlik *dəyər* `0xCAFEBABE` olduğu anda little-endian müqavilə işə düşür və dörd poçt qutusu `BE BA FE CA` saxlayır — ən aşağı ünvan kiçik ucu alır.

Ümumi dərs: "baytlar hansı sıradadır?" sualının *harada* olduğunu dəqiqləşdirməyincə cavabı yoxdur — faylda/kabeldə (formatın spesifikasiyası ilə sabit) yoxsa RAM-da tipli dəyər kimi (CPU ilə sabit). JVM-in fayl-parse edən kodu çevirməni sərhəddə edir — düz bir `ntohl`-formalı yerdəyişmə — və heç bir dünya digərinin sırasını heç vaxt sezmir.

</Solution>

#### Dump-ı yerli kimi oxu {/*read-the-dump-like-a-local*/}

x86 laptopunuzda debug edərkən 32-bitlik `int`-i dump edirsiniz və `D2 04 00 00` baytlarını görürsünüz. Dəyər onluq sistemdə nədir? Və bir cümlə ilə izah edin: little-endian maşınlarda kiçik rəqəmlər sıfırlarını dump-ın niyə həmişə **sağında** göstərir?

<Solution>

Little-endian: ən aşağı ünvan kiçik ucu saxlayır, deməli dəyərin baytları dərəcə sırasında dump-ın *tərsidir*: `00 00 04 D2` → `0x000004D2`.

```
0x4D2 = 4×256 + 13×16 + 2
      = 1024 + 208 + 2
      = 1234 ✓
```

Dəyər **1234**-dür. Sıfırlar isə: kiçik dəyərin *yuxarı* baytları sıfırdır və little-endian yuxarı baytları yuxarı ünvanlara qoyur — dump-ın sağ tərəfinə. Bu, həqiqətən faydalı sahə bacarığıdır: x86-da `XX 00 00 00` ardıcıllığı demək olar həmişə "burada kiçik int yaşayır" oxunur, `00 00 00 XX` isə yerdəyişməsi edilməmiş big-endian datanın (şəbəkə capture-ı, Java-nın yazdığı fayl) iyini verir. Təcrübəli mühəndislər bayt-sırası buqlarını heç bir hesab aparmadan, təkcə bu nümunədən diaqnoz edirlər.

</Solution>

#### Cəhənnəmdən gələn length prefix {/*the-length-prefix-from-hell*/}

Transfer tapşırığı. Komanda yoldaşınızın x86-dakı C servisi binar mesajları "4-baytlıq length, sonra payload" kimi göndərir və length-i xam `fwrite(&len, 4, 1, ...)` ilə yazır. Tərəfdaş komandanın oxucusu — big-endian cihazda işləyən (və ya müqaviləsi big-endian olan `DataInputStream`-li Java-da yazılmış) — uzunluğu **1024** olan mesaj alır və dərhal vəhşicəsinə yanlış buffer ayırmağa çalışır, sonra desync olur və əbədi zibil oxuyur. Oxucunun dəqiq hansı length hesabladığını göstərən bayt hesabını aparın, sonra iki cümləlik review şərhini yazın.

<Solution>

1024 = `0x00000400`. x86 yazıcısının `fwrite`-ı little-endian RAM-ını birbaşa kabelə kopyalayır:

```
kabel baytları:         00 04 00 00
oxucu (big-endian):     0x00040000
                      = 4 × 65.536
                      = 262.144  ✗   (256 KiB, 1 KiB yox)
```

Oxucu 1 KiB-lıq mesaj üçün 256 KiB-lıq buffer ayırır, heç vaxt gəlməyəcək 262.144 baytı gözləyir (və ya növbəti ~255 mesajı "payload" kimi udur) və framing heç vaxt özünə gəlmir — bir yerdəyişməsiz tam ədəd bütün axını zəhərləyir. Anaqram imzasına diqqət edin: `00 04 00 00` vs `00 00 04 00` — oxucunun öz datası, yeri dəyişdirilmiş.

Review şərhi: *"Çox-baytlı tam ədədləri maşın sərhədindən heç vaxt `fwrite`/`memcpy` etməyin — kabelin host-dan asılı olmayan bir elan edilmiş bayt sırası olmalıdır. Zəhmət olmasa length-i açıq serialize edin (yazmazdan əvvəl `htonl(len)`, oxuduqdan sonra `ntohl`, və ya bayt-bayt shift-lər) və bayt sırasını protokol sənədinin birinci səhifəsinə əlavə edin — format hazırda yalnız iki little-endian host arasında, təsadüfən işləyir."*

Daha dərin vərdiş, üçüncü dərsdir təkrarlanır: müqavilələr *dizayn vaxtı* seçilməli və yazıya alınmalıdır. Aralıqlar (Dərs 3), təmsil oluna bilmə (Dərs 4), bayt sırası (bu gün) — üçündə də baytlar heç vaxt səhv deyildi; yazılmamış fərziyyə səhv idi. ✓

</Solution>

</Challenges>

<LearnMore title="Mətn: ASCII-dən UTF-8-ə" path="/learn/faza-0/modul-0-1/text-representation">

Dərs 1-dən bəri "mətn müqaviləsi" sakitcə 72-ni `H`-ə uyğunlaşdıran bir konkret cədvəl demək idi. Növbəti dərs o cədvəl nəhayət öz hekayəsini alır — və o da döyüş hekayəsidir: 7 bit Amerika ingiliscəsinin hər insan dilini tutmağa necə çalışdığı, e-poçtlarınızın vaxtilə niyə `Ã©` və `Ð¿Ñ€Ð¸Ð²ÐµÑ‚` kimi gəldiyi və UTF-8-in mühəndislik tarixinin ən böyük backward-compatible dizaynlarından birini necə bacardığı. Endianness də kameo çıxışı edir: çox mətn faylının ilk "simvolu" bayt-sırası işarəsindən başqa bir şey deyil.

</LearnMore>