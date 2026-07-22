---
title: "Binar Sistemdə Rəng, Şəkil və Səs"
---

<Intro>

1979–1980-ci illər arasında Philips və Sony mühəndisləri 12 santimetrlik plastik diski standartlaşdırmaq üçün Eindhoven və Tokioda bir sıra gərgin birgə iclaslarda görüşdülər. Philips hər audio sample üçün 14 bitin bəs etdiyini iddia edirdi; Sony-dən Kees Schouhamer Immink və Toshitada Doi-nin komandası 16-nın üstündə dayandı və qalib gəldi. Sampling rate — musiqinin saniyədə neçə dəfə ölçüləcəyi — qəribə dərəcədə spesifik **44.100** rəqəmində qərarlaşdı: kimsə bu rəqəmi sevdiyi üçün yox, ilk rəqəmsal yazıcılar audionu *video* lentində saxladığı üçün — və 44.100 həm Amerika, həm də Avropa TV sətir həndəsəsinə mükəmməl oturan yeganə sürətdir: 245 sətir × 60 field × 3 sample və 294 × 50 × 3 — hər ikisi düz 44.100. "Red Book" standartı 1980-ci ildə çıxdı, ilk pleyerlər 1982-də — və 1970-lərin video lentinin daşlaşmış həndəsəsi bu gün də hər CD-ni, streaming masterlərinin əksəriyyətini və nə vaxtsa qoşacağınız hər audio interfeysin default-unu müəyyən edir. Bu dərs data-təmsili turumuzun son və ən insani dayanacağıdır: *kəsilməz* dünya — gözünüzün içdiyi işıq, qulağınızın mindiyi təzyiq dalğaları — necə doğranır, yuvarlaqlaşdırılır və altı dərsdir mənimsədiyiniz tam ədədlərə tökülür. Sonunda bir fotoşəkilin və bir mahnının bayt qiymətini ilk prinsiplərdən hesablayacaq və dəqiq nəyin atıldığını biləcəksiniz.

</Intro>

<YouWillLearn>

- Reallığı rəqəmsallaşdırmağın universal iki addımlı resepti: **sampling** (dilimləmə) və **quantization** (yuvarlaqlaşdırma)
- **Rəng**: pikselə üç baytın niyə bioloji hiylə olduğu və Dərs 2-nin `#FF5733`-ünün tam dekodlanması
- **Şəkillər**: piksellər cədvəl kimi — və 12 meqapiksellik fotonun niyə raw halda 36 MB, telefonunuzda isə 3 MB olduğu
- **Səs**: Nyquist qaydası, CD-lərin musiqini niyə saniyədə 44.100 dəfə ölçdüyü və bir-saniyəlik-audio hesabı
- **Aliasing** nədir — geriyə fırlanan araba təkərləri, televizorda dalğalanan zolaqlı köynəklər — və itirilmiş informasiyanın niyə heç vaxt geri qayıtmadığı
- Media üçün storage və bandwidth büdcəsini benchmark-dan əvvəl, ilk prinsiplərdən necə hesablamaq

</YouWillLearn>

## Millimetrlik kağız resepti {/*the-graph-paper-recipe*/}

Bu modulun indiyə qədər kodladığı hər şey — tam ədədlər, mənfilər, mətn — *onsuz da diskret* idi: sərt kənarları olan, sayıla bilən şeylər. Amma hisslərinizin yaşadığı dünya belə deyil. Parlaqlıq hamar dəyişir. Skripka notundakı hava təzyiqi kəsilməz əyridir. İstənilən iki narıncı çalar arasında daha bir narıncı çalar var, sonsuzadək. Kompüteriniz isə, altı dərsin şəksiz sübut etdiyi kimi, sonlu tam ədədlərdən başqa heç nə saxlamır.

Bu iki dünya arasındakı körpü bir reseptdir və beyninizdə saxlamalı olduğunuz fiziki maşın budur: **hamar əyrini millimetrlik kağıza köçürmək.** Yalnız tor kəsişmələrini işarələməyə icazəniz var. İki qərar hər şeyi müəyyən edir:

- **Sütunlar** nə qədər sıxdır? Bu, **sampling**-dir — ölçünü nə qədər tez-tez götürdüyünüz (səs üçün saniyədə, şəkil üçün millimetrdə). Daha sıx sütunlar daha sürətli dalğalanmaları izləyir.
- **Sətirlər** nə qədər sıxdır? Bu, **quantization**-dır — hər ölçünün neçə səviyyəyə oturuşa biləcəyi, yəni tam olaraq "hər ölçüyə neçə bit", yəni tam olaraq Dərs 2-nin `2ⁿ`-i. Daha çox sətir, daha yumşaq yuvarlaqlaşdırma.

<Diagram name="color-image-audio/sampling_quantization" height={360} width={720} alt="16 üfüqi səviyyə xəttindən ibarət solğun tor üzərində boz rənglə çəkilmiş hamar sinusabənzər əyri. Şaquli qırıq xətlər 13 bərabər aralıqlı sample anını qeyd edir; hər anda mavi nöqtə əyriyə ən yaxın tor kəsişməsində oturur və mavi pilləkənvari sınıq xətt nöqtələri birləşdirir. İki annotasiya: aşağıda üfüqi ox 'sampling: zamanı sütunlara dilimlə' etiketi ilə, sağda şaquli ox 'quantization: hər dilimi 2 üstü n səviyyədən birinə oturt (burada 4 bit, 16 səviyyə)' etiketi ilə.">

Bütün rəqəmsal media bir şəkildə: hamar əyri, tor kəsişmələrinə endirilmiş. Hər nöqtə bir tam ədəddir; nöqtələr arasındakı boşluq yoxdur.

</Diagram>

Hər iki qərar *qəsdən itkilidir (lossy)*. Nöqtələr əyri deyil; onlar əyrinin sonlu tam-ədəd xülasəsidir — insan gözünün və ya qulağının illüziyanı yenidən qura biləcəyi qədər yaxşı seçilmiş. Rəqəmsal media reallığın kopyası deyil — o, **reallığın hansı ölçülərinin saxlanmağa dəyər olduğu haqqında müqavilədir** və Dərs 1-dən bəri hər müqavilə kimi, rəqəmləri komitələr tərəfindən dondurulur, sonra otaqdakı hər kəsdən uzun yaşayır. Dərsin qalanı sadəcə bu reseptin iki dəfə tətbiqidir: bir dəfə işığa, bir dəfə havaya.

## Rəng: gözünüzün inandığı üç rəqəm {/*color-three-numbers-your-eye-believes*/}

Tək bir işıq nöqtəsindən başlayaq. Fiziki olaraq onun rəngi bütöv bir *spektrdir* — dalğa uzunluqları boyunca enerjinin kəsilməz əyrisi, sonsuz ölçülü obyekt. Bunu saxlamaq ümidsiz olardı. Xoşbəxtlikdən, siz spektrləri görmürsünüz. Torlu qişanız işığı düz **üç növ konus hüceyrəsi (cone)** ilə sample edir — təqribən uzun, orta və qısa dalğa uzunluqlarına köklənmiş — və "rəng" adlandırdığınız hər şey sadəcə o konusların yuxarıya göndərdiyi üç-rəqəmli hesabatdır. Təkamül rəngi Intel-dən əvvəl quantize etdi.

Həmin bioloji təsadüf **RGB**-nin bütün əsasıdır: göz hər spektri üç rəqəmə endirirsə, ekranın idarə etməli olduğu da elə üç rəqəmdir. Hər kanala — red, green, blue — bir bayt verin, 0-dan 255-ə, və piksel üç tam ədədə çevrilir:

```
#FF5733            ← Dərs 2-nin sirli baytları, nəhayət dekodlanır

FF → R = 255       (red kanalı tavana dirənib)
57 → G =  87       (bir az green)
33 → B =  51       (azca blue)

Nəticə: günəş batımının isti narıncısı — 3 bayt, 24 bit.
```

Hex rəng kodu heç vaxt xüsusi "veb şeyi" olmayıb: o, **hex paltarı geymiş üç baytdır** və indi bu modulun hər bacarığı ona tətbiq olunur. Ümumi palitra: 2²⁴ = **16.777.216 rəng** — monitor marketinqinin "16,7 milyon rəngi" sadəcə Dərs 2-nin ikinin qüvvətləri cədvəlinin reklamda karyera qurmasıdır. Dördüncü bayt — **alpha** (qeyri-şəffaflıq) əlavə edin və hər brauzerin, GPU-nun və dizayn alətinin əslində o tərəf-bu tərəfə ötürdüyü 32-bitlik RGBA pikselini alırsınız.

Və kanallar tam ədədin içindəki bit sahələrindən başqa bir şey olmadığı üçün, onları çıxarmaq Dərs 5-in shift və mask əməliyyatlarıdır, canlı:

```js
const c = 0xFF5733;
[(c >> 16) & 255, (c >> 8) & 255, c & 255]
```

<ConsoleBlock level="info">

[255, 87, 51]

</ConsoleBlock>

<Note>

RGB işığın qanunu deyil, *sizin* hardware-inizə qurulmuş hiylədir. Təmiz spektral sarı ilə uyğun red + green işıq qarışığı fiziki olaraq fərqli spektrlərdir — amma üç konusunuzu eyni cür həyəcanlandırır, ona görə onları ayıra bilmirsiniz; bu fenomen metamerizm adlanır. Ekranlar ondan hər kadrda milyardlarla dəfə istifadə edir. Baytların üstündəki interpretasiya qatı isə möhtəşəm dərəcədə etibarsız qalır: 2015-ci ilin fevralında bir donun tək fotosu interneti ikiyə böldü — on milyonlarla insan *eyni RGB baytlarına* baxırdı, kimisi ağ-qızılı, kimisi qara-göy görürdü, çünki beyinlər fərz edilən işıqlandırmanı fərqli düzəldir. Mükəmməl müqavilə ilə belə, "baytların mənası yoxdur" prinsipi kəllənin lap içinə qədər uzanır.

</Note>

## Şəkillər: piksellərdən ibarət cədvəl {/*images-a-spreadsheet-of-pixels*/}

Sıxılmamış şəkil artıq az qala antiklimaksdır: **piksel toru**, hər piksel üç (və ya dörd) bayt, sətir-sətir saxlanmış — hər xanası bir rəng olan cədvəl. Sampling burada *resolution* kimi yenidən görünür (səhnəni sütun və sətirlərə nə qədər incə dilimlədiyiniz), quantization isə *bit depth* kimi (hər kanalın nə qədər incə yuvarlaqlaşdırdığı).

<Diagram name="color-image-audio/pixel_zoom" height={340} width={720} alt="Soldan sağa üç mərhələ. Birincisi, içində sadə dağ-və-günəş cizgisi olan, 'foto, 4000-ə 3000 piksel' etiketli yumru künclü düzbucaqlı və üstündə işarələnmiş kiçik kvadrat. Zoom xətləri ikinci mərhələyə aparır: həmin kvadratın böyüdülməsini təmsil edən 8-ə 8 xana toru, bir xana mavi ilə vurğulanıb. Zoom xətləri üçüncü mərhələyə davam edir: R 255, G 87, B 51 etiketli üç bayt qutusu, altında FF, 57, 33 hex dəyərləri, 'bir piksel = 3 bayt' alt yazısı ilə.">

İstənilən fotoşəkilə kifayət qədər zoom edin — cədvələ çatacaqsınız: xana sıraları, hər birində üç tam ədəd. Orada, aşağıda başqa heç nə yoxdur.

</Diagram>

Format həqiqətən bu qədər sadədir — əllə saxtalaşdırıla biləcək qədər sadə. Qocaman PPM şəkil formatı sadəcə balaca ASCII header-dir ("P6, width, height, max value") və ardınca raw RGB baytları — bu o deməkdir ki, Dərs 2-nin baytlarından başqa heç nə işlətmədən *şəkil faylını klaviaturada yazıb var edə bilərsiniz*:

<TerminalBlock>

printf 'P6 1 1 255\n\xff\x57\x33' > pixel.ppm
xxd pixel.ppm
00000000: 5036 2031 2031 2032 3535 0aff 5733       P6 1 1 255..W3

</TerminalBlock>

On dörd bayt — və istənilən şəkil görüntüləyicisi onu açacaq: Dərs 2-nin günbatımı narıncısında bir-piksellik şəkil — header mətn müqaviləsində (ASCII sütununda `P6 1 1 255` görünür), piksel rəng müqaviləsində (`ff 57 33`) — iki müqavilə bir faylı göz qabağında bölüşür.

Bu isə o deməkdir ki, şəkil saxlanması *vurma əməlidir* və hər hansı alətə etibar etməzdən əvvəl onu həmişə özünüz etməlisiniz:

```
12 meqapiksellik telefon fotosu, raw:
  4000 × 3000 piksel        = 12.000.000 piksel
  × 3 bayt (R, G, B)        = 36.000.000 bayt  ≈ 36 MB

Bir 1080p ekran kadrı, raw:
  1920 × 1080               = 2.073.600 piksel
  × 3 bayt                  ≈ 6,2 MB
  × saniyədə 60 kadr        ≈ hər saniyə 373 MB  (!)
```

İndi məhsuldar şok: telefonunuzdakı foto ~3 MB-dır, 36 yox. Saniyədə 373 MB-lıq raw video storage-ı və şəbəkələri dərhal doldurardı, siz isə 1080p-ni bundan yüz dəfə yavaş bağlantı üzərindən stream edirsiniz. *Raw* ilə *faktiki* arasındakı uçurum **compression**-dır — redundancy-ni tapıb qovmaq sənəti — və o qədər həlledicidir ki, iki dayanacaq sonra öz dərsini alır. Bu gün üçün raw rəqəmi lövbəriniz kimi saxlayın: o, müqavilənin vicdanlı qiymətidir — hər ağıllı formatın aşağıya doğru sövdələşdiyi tavan.

Bit depth-in öz görünən uğursuzluq rejimi var. Kanala səkkiz bit 256 parlaqlıq səviyyəsi deməkdir və böyük hamar qradiyentdə — açıq səma, studiya fonu — göz yuvarlaqlaşdırmanı tuta *bilir*: **banding** adlanan zəif zolaqlar — görünən hala gəlmiş quantization, millimetrlik kağızın sətirlərinin cizginin altından boylanması. 10-bitlik "HDR" pipeline-larının əsl mühəndislik əsası da budur: kanala 1.024 səviyyə (2³⁰ ≈ 1,07 milyard rəng) — sətirləri o qədər sıxlaşdırır ki, pilləkən yenidən yox olur.

## Səs: saniyədə 44.100 xətkeş {/*sound-44100-rulers-per-second*/}

Səs təzyiq dalğasıdır — zamana qarşı hava təzyiqinin tək kəsilməz əyrisi (stereo: iki əyri). Mikrofon təzyiqi gərginliyə çevirir; sonra millimetrlik kağız resepti işə düşür və onun hər iki tənzimləyicisi məşhur qiymətlər alır.

**Sütunlar — nə qədər tez-tez ölçmək?** Bu dərsin yeganə teoremi burada yaşayır — **Nyquist–Shannon sampling qaydası**: saniyədə *f* dəfəyə qədər dalğalanan dalğanı tutmaq üçün onu saniyədə **2 × f-dən çox** sample etməlisiniz — hər dalğalanmaya ən azı iki nöqtə, yoxsa dalğalanma sütunlarınızın arasından bütünlüklə sürüşüb keçər. İnsan eşitməsi təxminən 20.000 Hz-də bitir (bu, gənc insandır; tavan yaşla aşınır), deməli audio saniyədə 40.000-dən bir qədər çox sample tələb edir. Faktiki seçilən rəqəm — bu dərsin giriş hekayəsinin düyün nöqtəsi — **44.100** oldu, möhtəşəm dərəcədə qeyri-romantik səbəbdən: o, ilk rəqəmsal yazıcıların borc aldığı video lent formatlarına qalıqsız bölünürdü — rəqəmsal audionun fundamental sabiti NTSC və PAL televiziyasının fosildir. (Şirkət əfsanəsi əlavə edir ki, diskin 74 dəqiqəlik tutumu Bethovenin Doqquzuncu simfoniyası bir üzə sığsın deyə seçilmişdi; tarixçilər detalları mübahisələndirir, amma Sony-nin öz rəhbərləri bu hekayəni onilliklər boyu danışdılar.)

**Sətirlər — nə qədər incə yuvarlaqlaşdırmaq?** Red Book müharibəsi **sample başına 16 bitdə** qərarlaşdı: 65.536 təzyiq səviyyəsi — 2¹⁶, Dərs 2-dən bəri hesablaya bildiyiniz rəqəm. Hər əlavə bit səviyyələri ikiqat artırır və musiqi ilə yuvarlaqlaşdırma xətasının fısıltısı arasında təqribən **6 dB** məsafə alır; 16 bit ~96 dB verir — vinilin ~70-indən və əksər dinləmə otaqlarından rahat yuxarı. Studiyalar 24 bitdə yazır (~144 dB nəzəri ehtiyat) — eyni səbəbdən ki, siz `double`-da hesablayıb `float`-da təhvil verirsiniz: data üzərində hələ hesab apararkən ehtiyat dəqiqlik saxla — Dərs 4-dən artıq etibar etdiyiniz qayda.

Və indi dərsin onurğası — bir saniyə musiqini bayta çevirən hesab, nə alət, nə benchmark, sadəcə vurma:

```
Bir saniyə CD audio:
  saniyədə 44.100 sample
  × sample başına 2 bayt  (16 bit)
  × 2 kanal               (stereo)
  = saniyədə 176.400 bayt     ≈ 1,4 Mbit/s

Bir dəqiqə:   × 60  ≈ 10,6 MB
74 dəqiqə:    × 4.440 s ≈ 783.000.000 bayt ≈ 750 MiB
```

O son sətir *elə kompakt diskin özüdür*: 12 sm-lik boşqabda ~783 MB raw audio — və disk əslində bundan xeyli çox raw bit saxlayır, çünki audio onu cızıqlardan və barmaq izlərindən sağ çıxaran qalın error-correcting redundancy qatlarına bükülüb. Əzilmiş diskin necə qüsursuz səsləndiyi bu dərsin işi deyil; o, məhz *növbəti* dərsin işidir.

Eyni üç-vuruqlu vurma qarşınıza çıxacaq hər audio müqaviləsini izah edir — dəhşətlilərini də. Telefon şəbəkələri *öz* rəqəmlərini CD-dən onilliklər əvvəl dondurdu: **saniyədə 8.000 sample, hər biri 8 bit, bir kanal = saniyədə 64.000 bit** — mis kabelin bandwidth-inin qızıl qiymətində olduğu vaxt seçilmiş sürət. Nyquist tavanı dərhal deyir: 8.000 sample/s 4.000 Hz-dən yuxarı heç nəyi təmsil edə bilməz — real telefoniya isə ~3.400 Hz-də filtrləyir. Nitq sağ qalır (güclə; telefonda 'F' ilə 'S'-in ayırd edilməməsinin və hər dəstək xəttinin "F as in Foxtrot"-a əl atmasının səbəbi budur). Həyatı 4 kHz-dən yuxarı harmonikalarda olan musiqi isə... musiqiyə nə olduğunu dəqiq eşitmisiniz — hər dəfə sizi gözləmə rejimində saxlayanda.

<DeepDive>

#### Aliasing: datanızdakı araba təkəri {/*aliasing-the-wagon-wheel*/}

Çox yavaş sample edəndə *dəqiq* nə xarab olur? Dalğalanmalar nəzakətlə yoxa çıxmır — **yalan danışır**. Lentə alınmış araba təkərinə və ya helikopter pərinə baxın: saniyədə 24 kadrda, kadr başına bir pər-mövqeyindən bir az yavaş fırlanan təkər yavaş-yavaş *geriyə* fırlanan kimi görünür. Kameranın sampling toru sürətli irəli hərəkəti yavaş geri hərəkətdən həqiqətən ayıra bilmir — hər ikisi eyni nöqtələri verir.

<Diagram name="color-image-audio/nyquist_alias" height={320} width={720} alt="Eni boyunca boz rəngdə çəkilmiş, on bir tam dövrü olan sürətli sinus dalğası. Sürətli dalğanın üstündə qırmızı nöqtələr kimi on iki bərabər aralıqlı sample nöqtəsi qeyd edilib. Düz bir dövr tamamlayan yavaş qırmızı sinus dalğası on iki nöqtənin hamısından hamar keçir. Fiqurun içindəki alt yazı: hər iki dalğa eyni sample-ları verir — sampling-dən sonra sürətli dalğa yavaş fırıldaqçıdan ayırd edilə bilmir.">

On bir dövr, on iki dəfə sample edilib: nöqtələr bir-dövrlü fırıldaqçıya mükəmməl oturur. Nyquist sürətindən aşağı sampling sürətli dalğanı itirmir — onu yalançı yavaş dalğaya *çevirir*.

</Diagram>

Bu, **aliasing**-dir: sample rate-in yarısından yuxarı istənilən tezlik dataya daha aşağı tezliyin maskasında ("alias-ı altında") yenidən daxil olur. Audio hardware-in sampler-dən əvvəl analoq *anti-aliasing filter* işlətməsinin səbəbi budur — Nyquist-dən yuxarı hər şeyi əvvəlcədən amansızca silmək, çünki fırıldaqçı nöqtələrə girdisə, riyazi olaraq həqiqətdən ayırd edilə bilməz. Nazik zolaqlı köynəklərin kamerada burulğanlı **moiré**-yə partlamasının (parçanın fəza tezliyi sensorun piksel toru ilə döyüşür), oyun mühərriklərinin piksel səviyyəsində eyni səbəbdən "anti-aliasing"-ə nəhəng qüvvə sərf etməsinin və hər audio kitabxanasındakı resampling kodunun decimate etməzdən əvvəl filtrləməsinin səbəbi də budur. Qayda saxlamağa dəyər şüara ümumiləşir: **əvvəl filtrlə, sonra sample et — çünki sampling tuta bilmədiyini atmır; saxtalaşdırır.**

</DeepDive>

<Pitfall>

**İtirilmiş informasiya geri qayıtmır. Heç vaxt.**

Hər "yaxşılaşdırma" fantaziyası bu qayada ölür. 640×480 şəkli 4K-ya upscale etmək piksel uydurur; heç vaxt çəkilməmiş pikselləri bərpa edə bilməz — təhlükəsizlik kamerası fotosuna "enhance!" deyə qışqıran kino ştampı millimetrlik kağızdan heç vaxt qoymadığı işarələri istəməkdir. 128 kbps MP3-ü WAV və ya FLAC-a çevirmək *zədənin bit-mükəmməl kopyasını* daha böyük qutuda verir. JPEG-i "quality 100" ilə yenidən saxlamaq ilk saxlamanın atdığını qaytarmır (hər nəsil sakitcə daha çox itirir). Studiya-səviyyəli audionu telefon codec-indən keçirmək onu bundan sonra əbədi olaraq telefonun müqaviləsi ilə məhdudlaşdırır — istənilən pipeline-da **ən dar müqavilə qalib gəlir** və heç bir yuxarı axın keyfiyyəti ondan sağ çıxmır. Bu formanın eynisi ilə keçən dərs tanış oldunuz: `utf8mb3` sütunu application-ın sədaqətlə çatdırdığını kəsdi. Keyfiyyət qərarları birtərəfli qapılardır; onları mümkün olan *ən son* mərhələdə verin və orijinalı saxlayın.

(Vicdanlı ulduzcuq: müasir AI upscaler-lər inandırıcı detal istehsal edir — amma *inandırıcı* düzgün sözdür. Onlar boşluğun üstünə savadlı təxmin çəkirlər — tətil fotosu üçün tam istədiyiniz, sübut, tibb və ya ölçmə üçün isə heç vaxt qəbul etməməli olduğunuz şey.)

</Pitfall>

<DeepDive>

#### Üç rəng niyə bəsdir — və nə vaxt bəs deyil {/*why-three-colors-are-enough*/}

RGB-nin işləməsinin dərin səbəbini dəqiq ifadə etməyə dəyər, çünki bu da bir *sampling* hekayəsidir: insan gözü dalğa uzunluğu spektrini cəmi üç geniş, üst-üstə düşən sensorla sample edir. Rəng görməsi sonsuz ölçülü siqnalın üçölçülü proyeksiyasıdır — təkamülün öz lossy codec-i, milyonlarla il ərzində əhəmiyyət daşıyan tezliklərə köklənmiş (yarpaqlar arasında yetişmiş meyvə, dərinin altında qan). Ekranlar işığın spektrini reproduksiya etmir; ona *konuslarınızın reaksiyasını* reproduksiya edir — qat-qat ucuz problem. Üç şüalandırıcı, üç bayt, vəssalam.

Hiylənin kənarları fərziyyələri pozulan yerdə görünür. Çap işığı şüalandırmaq əvəzinə əks etdirir, ona görə mürəkkəb subtraktiv işləyir — buradan **CMYK**, dörd kanal və ekrandakı rənglərin kağızda sürüşməsinin əbədi dizayner dərdi: iki fərqli müqavilə, sərhəd itkiləri daxil — artıq yuxuda belə danışa biləcəyiniz hekayə. Quşlar və mantis krevetkaları dörddən on altıya qədər konus növü daşıyır — onlar üçün indiyə qədər qurulmuş hər ekran zövqsüzcəsinə, gülünc dərəcədə yanlışdır. Və insan kişilərinin təqribən 8%-i, iki effektiv konus növü ilə, bir ölçü aşağıda yaşayır; kritik vəziyyəti sırf red-vs-green çalarında kodlayan interfeys onlar üçün onu görünməz mürəkkəblə kodlayır. Accessibility qaydalarının "heç vaxt yalnız rəngə arxalanma"sı nəzakət deyil — sahədəki heterogen dekodlama hardware-i üçün mühəndislikdir.

</DeepDive>

## Quantization laboratoriyası {/*the-quantization-lab*/}

Millimetrlik kağızın sətirlərini birbaşa hiss etmə vaxtıdır. Aşağıda Dərs 1-in açar-paneli ruhu rəng masası kimi yenidən doğulub: üç kanal slider-i (üç bayt — günbatımı narıncısı `#FF5733` əvvəlcədən yüklənib), üstəlik **bits-per-channel** idarəsi. Sağdakı nümunə rənginizi daha az sətrə quantize edildikdən sonra göstərir. Red slider-i 8 bitdə yavaş-yavaş çəkin, sonra 2-də — və *banding-in barmağınızın altında baş verməsinə baxın*: hamar hərəkət uzaq rənglər arasında sıçrayır. Kanala 1 bitdə 1980-lərin ev kompüterlərinin 8-rəngli palitralarını yenidən kəşf etmisiniz:

<Sandpack>

```js
import { useState } from 'react';

export default function ColorLab() {
  const [rgb, setRgb] = useState([255, 87, 51]);
  const [bits, setBits] = useState(8);

  const levels = 2 ** bits;
  const step = 255 / (levels - 1);
  const q = rgb.map((v) => Math.round(Math.round(v / step) * step));
  const hex = (a) =>
    '#' + a.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const set = (i, v) => {
    const n = rgb.slice();
    n[i] = Number(v);
    setRgb(n);
  };

  return (
    <div style={{ fontFamily: 'monospace', textAlign: 'center' }}>
      {['R', 'G', 'B'].map((n, i) => (
        <div key={n}>
          {n}{' '}
          <input type="range" min="0" max="255" value={rgb[i]}
            onChange={(e) => set(i, e.target.value)} />{' '}
          {rgb[i]}
        </div>
      ))}
      <p style={{ fontFamily: 'system-ui' }}>
        kanala bit sayı:{' '}
        {[1, 2, 3, 4, 8].map((b) => (
          <button key={b} onClick={() => setBits(b)}
            style={{ fontWeight: b === bits ? 'bold' : 'normal',
                     color: b === bits ? '#087ea4' : 'inherit' }}>
            {b}
          </button>
        ))}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <div>
          <div style={{ width: 120, height: 76, background: hex(rgb),
                        borderRadius: 8 }} />
          <p>həqiqi: {hex(rgb)}</p>
        </div>
        <div>
          <div style={{ width: 120, height: 76, background: hex(q),
                        borderRadius: 8,
                        border: '2px solid #c1554d' }} />
          <p>{bits}-bit: {hex(q)}</p>
        </div>
      </div>
      <p style={{ fontFamily: 'system-ui' }}>
        kanala {levels} səviyyə → {(levels ** 3).toLocaleString()} rəng
      </p>
    </div>
  );
}
```

</Sandpack>

Aşağıdakı sayğac bütün hekayəni bir sətirdə deyir: 8 bit → 16.777.216 rəng; 1 bit → 8. Eyni slider, eyni işıq, eyni göz — dəyişən yalnız millimetrlik kağızdakı sətirlərin sayıdır.

<Recap>

- Reallığı rəqəmsallaşdırmaq hər yerdə bir reseptdir: **sample et** (kəsilməzliyi sütunlara dilimlə) və **quantize et** (hər dilimi 2ⁿ sətirdən birinə oturt). Nöqtələr sonlu tam-ədəd xülasəsidir; aralarındakı boşluq *qəsdən* atılır.
- **Rəng** bioloji hiylədir: gözün üç konus növü sonsuz spektrləri üç rəqəmə endirir, deməli piksel üç baytdır — `#FF5733` = R 255, G 87, B 51 — nəticə 2²⁴ = **16.777.216 rəng** (+ qeyri-şəffaflıq üçün alpha baytı). Kanallar Dərs 5-in shift və mask-ları ilə çıxarılır.
- **Şəkillər** piksel cədvəlləridir: raw qiymət = en × hündürlük × pikselə-bayt. 12 MP foto **raw halda 36 MB**; 1080p60 video **raw halda 373 MB/s** — reallıqla fərq compression-dır (iki dərs sonra). Çox az sətir **banding** kimi üzə çıxır; dərman 10-bitlik HDR-dır.
- **Səs**: **Nyquist qaydası** ən yüksək tezliyin 2 mislindən yuxarı sampling tələb edir; eşitmə ~20 kHz-də bitir, ona görə CD-lər **44.100 Hz-də** (video lent həndəsəsinin fosili, 1980-də dondurulub), **16 bitdə** (65.536 səviyyə, ~96 dB; bitə ~6 dB) sample edir.
- Onurğa hesabı: **44.100 × 2 bayt × 2 kanal = 176.400 B/s** ≈ 1,4 Mbit/s ≈ 74 dəqiqəlik diskə ≈ 750 MiB. Telefoniyanın müqaviləsi — 8.000 Hz × 8 bit = **64 kbit/s**, ~3,4 kHz-dən yuxarı heç nə — gözləmə musiqisinin ölməsinin və 'F'-in 'Foxtrot'a möhtac qalmasının səbəbidir.
- **Aliasing**: Nyquist-dən yuxarı tezliklər yox olmur, daha aşağılarını *saxtalaşdırır* (araba təkərləri, moiré) — əvvəl filtrlə, sonra sample et.
- **İtirilmiş informasiya heç vaxt qayıtmır**: upscaling uydurur, MP3→FLAC zədəni kopyalayır və istənilən pipeline-da ən dar müqavilə qalib gəlir. Keyfiyyət qərarını son mərhələdə verin; orijinalları saxlayın.

</Recap>

<Challenges>

#### DodgerBlue-nu dekodla {/*decode-dodgerblue*/}

CSS-də `DodgerBlue` adlı rəng var, hex-i `#1E90FF`. Hər üç kanalı onluq sistemə dekodlayın, kanalları gücünə görə sıralayın və cavablandırın: mümkün 16.777.216 24-bitlik rəngdən bu dərsin oyuncağının 1-bit rejimi sizə təqribən hansı *payı* saxladı?

<Hint>

Hər hex cütü bir baytdır — Dərs 2 qaydaları: birinci rəqəm × 16 + ikinci rəqəm. Pay üçün: kanala 1 bit — kanala 2 səviyyə, 3 kanal deməkdir.

</Hint>

<Solution>

```
1E → 1×16 + 14 = 30      (R: red demək olar yoxdur)
90 → 9×16 + 0  = 144     (G: möhkəm orta green)
FF → 15×16 + 15 = 255    (B: blue tavanda)
```

B > G > R — maksimum blue, orta green, pıçıltı qədər red: parlaq, doymuş səma-mavisi — nümunənin göstərdiyi də elə odur. 1-bitlik palitra: 16.777.216-dan 2³ = **8 rəng** — təqribən **2,1 milyonda 1** pay (2³/2²⁴ = 2⁻²¹). 1980-lərin ev kompüteri estetikasının hər rəngi o 2⁻²¹ dilimində yaşayırdı — və gözünüz yenə hər sprite-ı tanıyırdı; bu, müqavilənin nə qədərinin dəqiqliklə yox, *strukturla* daşındığı haqqında dərin bir şey deyir.

</Solution>

#### Studiya klipinin büdcəsi {/*budget-a-studio-clip*/}

Video post-production audiosu 48.000 Hz, 24-bit, stereo işləyir. İlk prinsiplərdən hesablayın: (a) 10 saniyəlik klipdəki baytlar, (b) kbit/s ilə bitrate və (c) bir müqayisə — bu, eyni 10 saniyənin telefon keyfiyyətindən neçə dəfə böyükdür?

<Solution>

```
(a)  48.000 sample/s × 3 bayt × 2 kanal = 288.000 B/s
     × 10 s = 2.880.000 bayt ≈ 2,88 MB

(b)  288.000 B/s × 8 = 2.304.000 bit/s = 2.304 kbit/s

(c)  Telefon: 8.000 × 1 bayt × 1 kanal = 64.000 bit/s
     2.304 / 64 = 36 dəfə böyük
```

Üç vuruq, təmiz vurma — rate × depth × kanallar — və indi istənilən audio müqaviləsini bir baxışla qiymətləndirə bilirsiniz: podcast masterləri, oyun asset büdcələri, voice-chat bandwidth-i. 36 dəfənin *haradan* gəldiyinə diqqət edin: 6 dəfə sample rate-dən, 3 dəfə bit depth-dən, 2 dəfə stereodan. Sizdən media xərclərini kəsmək istənəndə, o vuruqlara ayırma elə *seçimlər menyusunun özüdür* — hər birinin bu gün öyrəndiyiniz məlum qavrama qiyməti var (rate → tezlik tavanı, depth → səs-küy döşəməsi, kanallar → məkan).

</Solution>

#### Gözləmə musiqisi ticket-i {/*the-hold-music-ticket*/}

Transfer tapşırığı. Müştəri-təcrübəsi komandasından ticket: *"Dəstək xəttimiz üçün gözəl orkestr treki lisenziyaladıq və studiya masterini yüklədik (48 kHz / 24-bit FLAC, 2.304 kbit/s!). Zəng edənlər deyir ki, sanki divar arxasından səslənir. 320 kbps-də yenidən export etməyi və hətta FLAC-ı WAV kimi yenidən yükləməyi sınadıq — dəyişiklik yoxdur. Telefoniya vendorumuz faylımızı korlayır?"* Əslində nə baş verdiyini işi həll edən iki rəqəmlə izah edin; *heç bir* yenidən export-un niyə heç vaxt kömək edə bilməyəcəyini izah edin; və düzgün gözləntilər quran, üstəlik bir həqiqətən faydalı tövsiyə verən cavabı yazın.

<Solution>

**Nə baş verir:** heç nə korlanmır — audio telefon şəbəkəsinin müqaviləsinə keçir: **saniyədə 8.000 sample**, və Nyquist-ə görə o pipeline 4.000 Hz-dən yuxarı heç bir tezliyi daşıya bilməz (praktikada ~3.400 Hz). Orkestrin parıltısı — simlərin oberton­ları, sinc kasaların şəfəqi, "hava" — demək olar tamamilə o xəttin üstündə yaşayır; codec onu boğmur, *silir*, sonra qalanı 8-bitlik telefon səviyyələrinə quantize edir (cəmi 64 kbit/s). "Divar arxasından" hərfi mənada düzgün qavrayışdır: divarlar da low-pass filtrlərdir.

**Yenidən export niyə kömək edə bilməz:** zədə onların yüklədiyi hər şeydən *aşağı axında* baş verir. Pipeline-dakı ən dar müqavilə qalib gəlir və o, zəng edənin qulağına gedən son hop-dur; 2.304 kbit/s-lik master ilə 64 kbit/s-lik boru yenə 64-də görüşür. Daha yaxşı fayllar yükləmək faks maşınına 4K poster göndərməkdir — və bu, Pitfall-dakı birtərəfli qapının eynisidir: müqavilənin tuta bilmədiyi informasiya harasa yığılıb gözləmir; heç vaxt o tərəfə keçmir.

**Cavab:** *"Telefon şəbəkəsinin özü köhnə, sabit standartla məhdudlaşıb (saniyədə 8.000 ölçü — fizika bundan sonra audionu ~3,4 kHz-lə tavanlayır, masterinizin ehtiva etdiyinin təqribən onda biri), ona görə heç bir mənbə faylı, heç bir keyfiyyətdə, standart zəngdə daha yaxşı səslənə bilməz; vendor mühitin icazə verdiyinin tam olaraq özünü çatdırır. Tövsiyə: ~3 kHz-dən aşağıda yaşayan gözləmə audiosu seçin və ya sifariş edin — orta registrdə solo piano, akustik gitara, vokal-önlü parçalar — bu müqavilədən xeyli az itki ilə keçirlər; platformanız HD-voice/VoIP codec-lərini (16 kHz+) dəstəkləyirsə, onları aktivləşdirin — borunu həqiqətən genişləndirən yeganə qol budur."* ✓

</Solution>

</Challenges>

<LearnMore title="Data Bütövlüyü: Parity, Checksum-lar, CRC" path="/learn/faza-0/modul-0-1/checksum-crc">

İndi bilirsiniz ki, CD cızılan, ləkələnən və yerə düşən diskdə ~750 MB audio tam ədədi daşıyır — və yenə də *qüsursuz*, notu-notuna səslənir. O möcüzənin mexanizmi var. Növbəti dərs: bitlər çevriləndə nə baş verir — kosmik şüalar, can verən kabellər, toz — və qarşısını ala bilmədiyiniz zədəni sezməyin, hətta *təmir etməyin* gözəl riyaziyyatı: parity, checksum-lar və toxunduğunuz hər ZIP faylında, Ethernet frame-ində və PNG-də gizlənən CRC.

</LearnMore>