---
title: "Binary-da Rəng, Şəkil və Ses"
---

<Intro>

1979-1980-ci illərdə Philips və Sony mühəndisləri 12 santimetrlik plastik disk standartını müəyyənləşdirmək üçün Eindhoven və Tokioda gərgin birgə sessiyalar keçirdilər. Philips audio üçün hər bir nümunədə 14 bitin kifayət etdiyi iddiasıyla gəldi; Sony-nin Kees Schouhamer Immink və Toshitada Doi-nin komandası isə 16-ya israr etdi və qalib gəldi. Musiqinin neçə dəfə ölçüləcəyini müəyyən edən sampling rate qəribə spesifik **44,100** rəqəminə çatdı — bu rəqəmi heç kim sevdiyinə görə yox, çünki ilk rəqəmsal yazıcılar audioyu *video* lentdə saxlayırdı, 44,100 isə həm Amerika, həm Avropa TV sxemasına mükəmməl uyğun gəlirdi: 245 xətt × 60 kadr × 3 nümunə, həm də 294 × 50 × 3 — hər ikisi tam olaraq 44,100. "Red Book" standartı 1980-ci ildə tamamlandı, ilk playerlər 1982-ci ildə çıxdı, 1970-ci illərin video lent geometriyası isə bu gün hər CD-ni, əksər streaming master-lərini və bağlayacağınız hər audio interfeysin default dəyərini müəyyənləşdirir. Bu dərs data kodlaşdırma səyahətimizdəki son və ən insani dayanacaqdır: *davamlı* dünya — gözünüzün içdiyi işıq, qulağınızın süzdüyü təzyiq dalğaları — altı dərsdə mənimsədiyiniz integer-lərə necə doğranır, yuvarlaqlaşdırılır və tökülür. Sonunda bir fotoşəklin və bir mahnının byte dəyərini əsas prinsiplərdən hesablaya, nəyin atıldığını isə dəqiq biləcəksiniz.

</Intro>

<YouWillLearn>

- Gerçəkliyi rəqəmsallaşdırmağın universal iki addımlı resepti: **sampling** (kəsmə) və **quantization** (yuvarlaqlaşdırma)
- **Rəng**: piksel başına üç byte-ın bioloji hiylə olduğu və 2-ci Dərsdəki `#FF5733`-ün tam deşifri
- **Şəkillər**: pixel-lərin cədvəli kimi — 12 meqapiksellik foto niyə xam olaraq 36 MB, telefonunuzda isə 3 MB-dır
- **Səs**: Nyquist qaydası, CD-lərin musiqini niyə saniyədə 44,100 dəfə ölçdüyü və bir saniyəlik audio hesabı
- **Aliasing** nədir — geriyə fırlanan vaqon təkərləri, TV-də moiré görünüşlü köynəklər — və niyə itirilmiş məlumat geri gəlmir
- Heç bir benchmark-dan əvvəl əsas prinsiplərdən media üçün saxlama və bant genişliyi hesablamaq

</YouWillLearn>

## Şəbəkəli kağız resepti {/*the-graph-paper-recipe*/}

Bu modulun indiyə qədər kodlaşdırdığı hər şey — integer-lər, mənfi ədədlər, mətn — *artıq diskret* idi: sərt kənarlı, sayıla bilən şeylər. Amma hisslərinizin yaşadığı dünya belə deyil. Parlaqlıq hamar şəkildə dəyişir. Kaman notasındakı hava təzyiqi davamlı bir əyridir. Narıncının istənilən iki çaları arasında həmişə bir başqa çalar var. Kompüteriniz isə altı dərsin sübut etdiyi kimi yalnız sonlu integer-lər saxlayır.

Bu iki dünyanın arasındakı körpü bir reseptdir, tutmaq üçün fiziki bir maşın: **hamar əyrini şəbəkəli kağıza köçürmək.** Yalnız şəbəkə kəsişmə nöqtələrini işarə edə bilirsiniz. İki qərar hər şeyi müəyyənləşdirir:

- **Sütunlar** nə qədər incədir? Bu **sampling** — hər ölçümün nə qədər tez-tez götürüldüyü (səs üçün saniyədə, şəkillər üçün millimetr başına). Daha incə sütunlar daha sürətli dalğalanmaları tutur.
- **Sıralar** nə qədər incədir? Bu **quantization** — hər ölçümün yapışa biləcəyi səviyyələrin sayı, yəni "ölçü başına neçə bit", yəni 2-ci Dərsdəki `2ⁿ`. Daha çox sıra, daha yumşaq yuvarlaqlaşdırma.

<Diagram name="color-image-audio/sampling_quantization" height={360} width={720} alt="A smooth sine-like curve drawn in muted gray over a faint grid of 16 horizontal level lines. Vertical dashed lines mark 13 evenly spaced sample instants; at each instant a blue dot sits at the grid intersection nearest to the curve, and a blue staircase-like polyline connects the dots. Two annotations: a horizontal arrow along the bottom labeled 'sampling: slice time into columns', and a vertical arrow on the right labeled 'quantization: snap each slice to one of 2 to the n levels (here 4 bits, 16 levels)'.">

Rəqəmsal medianın hamısı bir şəkildə: hamar əyri, şəbəkə kəsişmə nöqtələrinə endirilmiş. Hər nöqtə bir integer-dir; nöqtələr arasındakı məkan yox olub.

</Diagram>

Hər iki qərar *qəsdən itkilidir*. Nöqtələr əyri deyil; onlar integer xülasəsidirlər — insan gözünün və qulağının illüziya quracaq qədər yaxşı seçilmiş. Rəqəmsal media gerçəkliyin surəti deyil — **gerçəkliyin hansı ölçülərinin saxlanmağa dəyər olduğuna dair bir müqavilədir** və 1-ci Dərsdən bəri hər müqavilə kimi onun rəqəmləri komitələr tərəfindən dondurulur, sonra da hamıdan uzun yaşayır. Bu dərsin qalanı həmin reseptin iki dəfə tətbiqidir: bir dəfə işığa, bir dəfə havaya.

## Rəng: gözünüzün inandığı üç rəqəm {/*color-three-numbers-your-eye-believes*/}

Bir işıq nöqtəsindən başlayaq. Fiziki olaraq onun rəngi bütöv bir *spektrdir* — dalğa uzunluqları boyunca enerjinin davamlı əyrisi, sonsuz ölçülü bir obyekt. Bunu saxlamaq ümidsizdir. Xoşbəxtlikdən siz spektrlər görmürsünüz. Göz torpağınız işığı tam olaraq **üç növ konuslu hüceyrə** ilə nümunələndirir, təxminən uzun, orta və qısa dalğa uzunluqlarına uyğunlaşdırılmış — "rəng" adlandırdığınız hər şey yalnız bu hüceyrələrin yuxarıya göndərdiyi üç rəqəmli hesabatdır. Təkamül Intel-dən əvvəl rəngi quantization etdi.

Bu bioloji təsadüf **RGB**-nin bütün əsasıdır: əgər göz hər spektri üç rəqəmə endirirsə, ekranın idarə etməli olduğu da yalnız üç rəqəmdir. Hər kanala — qırmızı, yaşıl, mavi — bir byte verin, 0-dan 255-ə qədər, ve pixel üç integer-ə çevrilir:

```
#FF5733            ← 2-ci Dərsdəki sirli byte-lar, nəhayət deşifr edildi

FF → R = 255       (qırmızı kanal tavana çatıb)
57 → G =  87       (bir az yaşıl)
33 → B =  51       (az miqdarda mavi)

Nəticə: günbatımının isti narıncısı — 3 byte, 24 bit.
```

Hex rəng kodu heç vaxt xüsusi "veb şeyi" olmayıb: o **hex geyimli üç byte-dır** və artıq bu modulun hər bacarığı ona tətbiq olunur. Ümumi palitra: 2²⁴ = **16,777,216 rəng** — monitor marketinqinin "16.7 milyon rəng"i yalnız 2-ci Dərsdəki ikilik qüvvət cədvəlinin reklam sferasında karyera qurmasıdır. **Alpha** (şəffaflıq) üçün dördüncü byte əlavə etsəniz, hər brauzer, GPU və dizayn aləti push edən 32-bitlik RGBA pixel-iniz olur.

Kanallar integer daxilindəki bit sahələri olduğundan, onları çıxarmaq 5-ci Dərsdəki shift və masking-dir, canlı:

```js
const c = 0xFF5733;
[(c >> 16) & 255, (c >> 8) & 255, c & 255]
```

<ConsoleBlock level="info">

[255, 87, 51]

</ConsoleBlock>

<Note>

RGB *sizin* hardware-ınızdakı bir hiylə, işığın qanunu deyil. Xalis spektral sarı ilə uyğun qırmızı + yaşıl işıq qarışığı fiziki olaraq fərqli spektrlərdir — amma üç konusunuzu eyni şəkildə həyəcanlandırır, siz onları ayırd edə bilmirsiniz, bu fenomenə metamerizm deyilir. Ekranlar onu çərçivə başına milyardlarla dəfə istismar edir. İnterprerasiya qatı byte-ların üstündə şanlı şəkildə etibarsız qalmağa davam edir: 2015-ci ilin fevralında bir elbisənin tək fotoşəkli interneti böldü — on milyonlarla insan *eyni RGB byte-larına* baxdı, bəziləri ağ-qızıl, bəziləri qara-mavi gördü, çünki beyin fərqli şəkildə fərz edilən işıqlandırma üçün düzəliş edir. Mükəmməl müqavilə ilə belə, "byte-ların mənası yoxdur" başa qədər çatır.

</Note>

## Şəkillər: pixel-lərin cədvəli {/*images-a-spreadsheet-of-pixels*/}

Sıxışdırılmamış şəkil artıq demək olar ki antikulminasiyalıdır: **pixel-lər şəbəkəsi**, hər pixel üç (və ya dörd) byte, ardıcıl sıralar halında saxlanılır — hər hüceyrənin bir rəng olduğu cədvəl. Sampling *çözünürlük* kimi yenidən meydana çıxır (səhnəni sütunlara və sıralara nə qədər incə böldüyünüz), quantization isə *bit depth* kimi (hər kanalın nə qədər incə yuvarlaqlaşdırıldığı).

<Diagram name="color-image-audio/pixel_zoom" height={340} width={720} alt="Three stages left to right. First, a rounded rectangle labeled 'photo, 4000 by 3000 pixels' with a simple mountain-and-sun line drawing inside and a small square marked on it. Zoom lines lead to the second stage: an 8 by 8 grid of cells representing that square magnified, with one cell highlighted in blue. Zoom lines continue to the third stage: three byte boxes labeled R 255, G 87, B 51 with hex values FF, 57, 33 beneath, captioned 'one pixel = 3 bytes'.">

İstənilən fotoşəkilə yetərince zoom etsəniz, cədvələ çatırsınız: üç integer-dən ibarət hüceyrə sıralar. Aşağıda başqa bir şey yoxdur.

</Diagram>

Format o qədər sadədir ki əl ilə hazırlamaq olar. Köhnə PPM image format sadəcə kiçik bir ASCII başlıqdır ("P6, genişlik, hündürlük, maksimum dəyər") arkasından xam RGB byte-lar gəlir, yəni yalnız 2-ci Dərsdəki byte-lardan istifadə edərək bir image faylını *əl ilə yaza bilərsiniz*:

<TerminalBlock>

printf 'P6 1 1 255\n\xff\x57\x33' > pixel.ppm
xxd pixel.ppm
00000000: 5036 2031 2031 2032 3535 0aff 5733       P6 1 1 255..W3

</TerminalBlock>

On dörd byte və hər image viewer onu açacaq: 2-ci Dərsin günbatımı narıncısının bir piksellik şəkli — başlıq mətn müqaviləsindədir (ASCII sütununda `P6 1 1 255` var), pixel rəng müqaviləsindədir (`ff 57 33`), iki müqavilə bir faylı açıq şəkildə paylaşır.

Bu o deməkdir ki şəkil saxlama *vurmaqdır* və hər zaman alətlərə güvənməzdən əvvəl etməlisiniz:

```
12 meqapiksellik telefon fotoşəkli, xam:
  4000 × 3000 pixel        = 12,000,000 pixel
  × 3 byte (R, G, B)       = 36,000,000 byte  ≈ 36 MB

Bir 1080p ekran kadrı, xam:
  1920 × 1080               = 2,073,600 pixel
  × 3 byte                  ≈ 6.2 MB
  × saniyədə 60 kadr        ≈ hər saniyə 373 MB  (!)
```

İndi məhsuldar şok: telefondakı fotoşəkil ~3 MB-dır, 36 deyil. Xam video 373 MB/s-də saxlama və şəbəkəni dərhal dolduracaq, lakin siz 100 dəfə yavaş bir bağlantı üzərindən 1080p stream edirsiniz. *Xam* ilə *faktiki* arasındakı fərq **sıxışdırma**dır — artıqlığı tapıb çıxarma sənəti — o qədər vacibdir ki iki addım sonra öz dərsini alacaq. Bu gün xam rəqəmi mərkəz nöqtəniz kimi saxlayın: müqavilənin dürüst qiymətidir, hər ağıllı formatın aşağıya danışdığı tavan.

Bit depth-in öz görünən uğursuzluq rejimi var. Kanal başına səkkiz bit 256 parlaqlıq səviyyəsi deməkdir və böyük hamar bir gradiyentdə — açıq göy, studiya fonu — göz yuvarlaqlaşdırmanı *tuta bilər*: **banding** adlı solğun zolaqlıq, şəbəkəli kağızın sıralarının izin içindən görünməsi. 10-bitlik "HDR" pipeline-larının mühəndislik əsası budur: kanal başına 1,024 səviyyə (2³⁰ ≈ 1.07 milyard rəng), sıralar pilləkən yenidən yox olana qədər kifayət qədər incə.

## Səs: saniyədə 44,100 ölçü {/*sound-44100-rulers-per-second*/}

Səs bir təzyiq dalğasıdır — zamanla hava təzyiqinin tək bir davamlı əyrisi (stereo: iki əyri). Mikrofon təzyiqi gərginliyə çevirir; sonra şəbəkəli kağız resepti dəvralır və hər iki düyməsi məşhur dəyərləri alır.

**Sütunlar — nə qədər tez-tez ölçmək lazımdır?** Burada bu dərsin yeganə teoremi yaşayır, **Nyquist–Shannon sampling qaydası**: saniyədə *f* dəfə titrəyən bir dalğanı tutmaq üçün onu saniyədə **2 × f-dən çox** ölçmək lazımdır — titreme başına ən azı iki nöqtə, ya da titrəmə sütunlar arasından tamamilə sürüşür. İnsan eşitməsi ~20,000 Hz-ə qədər çatır (bu da gənc insan üçündür; tavan yaşla aşınır), buna görə audio saniyədə 40,000-dən bir az çox nümunə tələb edir. Faktiki seçilmiş rəqəm — bu dərsin açılış anı — **44,100** idi; bunu gloriyalı romantik olmayan bir səbəbə görə: ilk rəqəmsal yazıcıların istifadə etdiyi video lent formatlarına bölündüyü üçün: rəqəmsal audionun fundamental sabiti NTSC və PAL televiziyasının fosilidir.

**Sıralar — nə qədər incə yuvarlaqlaşdırmaq lazımdır?** Red Book müharibəsi **nümunə başına 16 bit**-də qərar verdi: 65,536 təzyiq səviyyəsi — 2¹⁶, 2-ci Dərsdən bəri hesablaya bildiyiniz rəqəm. Hər əlavə bit səviyyələri iki dəfə artırır və musiqini yuvarlaqlaşdırma xışıltısından ayıran məsafəyə təxminən **6 dB** əlavə edir; 16 bit ~96 dB verir, vinyl-in ~70 dB-dən rahatca üstündür. Studiyalar eyni səbəbdən 24 bitlə (~144 dB nəzəri hüdud) yazır ki siz `double`-da hesablayıb `float`-da göndərirsiniz: data üzərindən riyaziyyat edərkən ehtiyat dəqiqlik saxlayın — 4-cü Dərsdən artıq etibar etdiyiniz qayda.

İndi dərsin onurğası — bir saniyəlik musiqini byte-lara çevirən hesab, heç bir alət yoxdur, yalnız vurma:

```
CD audio-nun bir saniyəsi:
  44,100 nümunə/saniyə
  × nümunə başına 2 byte  (16 bit)
  × 2 kanal               (stereo)
  = 176,400 byte/saniyə     ≈ 1.4 Mbit/s

Bir dəqiqə:   × 60  ≈ 10.6 MB
74 dəqiqə:    × 4,440 s ≈ 783,000,000 byte ≈ 750 MiB
```

Sonuncu sətir *compact disc-dir*: 12 sm plastik üzərində ~783 MB xam audio — disc əslində bundan xeyli çox xam bit saxlayır, çünki audio cızıq və barmaq izlərindən sağ çıxmasına imkan verən qalın səhv düzəltmə artıqlığı qatlarına sarılıb. Zədəli bir disc-in mükəmməl ifa etməsi bu dərsin işi deyil; bu tam olaraq *sonrakı* dərsin işidir.

Eyni üç faktorlu vurma hər audio müqaviləsini izah edir. Telefon şəbəkələri öz rəqəmlərini CD-dən onillər əvvəl dondurdu: **saniyədə 8,000 nümunə, 8 bit, bir kanal = 64,000 bit/saniyə** — o zaman mis bant genişliyi qızıl qiymətindəydi. Nyquist dərhal tavan göstərir: 8,000 nümunə/s 4,000 Hz-dən yuxarı heç nə təmsil edə bilmir — real telefon ~3,400 Hz-ə qədər filtr edir. Nitq sağ çıxır (güclüklə; ona görə ki 'F' ilə 'S' zəngdə seçilməzdir). Musiqi, həyatı 4 kHz-in üstündəki harmoniklər olan musiqi... hər dəfə gözləmə musiqisi eşidəndə tam nə olduğunu eşitmisiniz.

<DeepDive>

#### Aliasing: datanızdakı vaqon təkəri {/*aliasing-the-wagon-wheel*/}

Çox yavaş sampling etdikdə *nə olur* tam olaraq? Dalğalar sadəcə nəzakətlə yox olmur — onlar **yalan söyləyir**. Çəkilmiş vaqon təkərinə ya helikopter rotorunə baxın: saniyədə 24 kadrda, çarx çubuq mövqeyi başına bir kadrdan bir az yavaş fırlanarsa, yavaşca *geriyə* döndüyü görünür. Kameranın sampling şəbəkəsi gerçəkdən sürətli irəli hərəkatı yavaş geriyə hərəkatdan ayırd edə bilmir — hər ikisi eyni nöqtələri verir.

<Diagram name="color-image-audio/nyquist_alias" height={320} width={720} alt="A fast sine wave with eleven full cycles drawn in muted gray across the width. Twelve evenly spaced sample points are marked as red dots on the fast wave. A slow red sine wave completing exactly one cycle passes smoothly through all twelve dots. Caption inside the figure: both waves produce identical samples — after sampling, the fast wave is indistinguishable from the slow impostor.">

On bir dövr on iki dəfə nümunələndi: nöqtələr bir dövrlik saxtakara mükəmməl uyğun gəlir. Nyquist sürətinin altında nümunə götürmək sürətli dalğanı itirmir — onu yavaş bir saxtakara *çevirir*.

</Diagram>

Bu **aliasing**-dir: nümunə sürətinin yarısından yuxarı istənilən tezlik datada daha aşağı birinin "ləqəbi" altında yenidən girir. Ona görə audio hardware sampler-dan əvvəl analog *anti-aliasing filter* işlədir — Nyquist-dən yuxarı hər şeyi kobud şəkildə silir, çünki saxtakar nöqtələrin içinə girəndən sonra riyazi olaraq həqiqətdən fərqsizdir. Ona görə incə zolaqlı köynəklər kamerada burulğanlı **moiré** şəklindədir (parçanın məkan tezliyi sensor-un pixel şəbəkəsinə qarşı döyünür), ona görə oyun mühərrikləri eyni səbəbdən "anti-aliasing"ə böyük çalışma sərf edir. Qayda ümumilləşir: **əvvəl filtr et, sonra nümunə götür — sampling tutamadığını atmır; onu saxtalaşdırır.**

</DeepDive>

<Pitfall>

**İtirilmiş məlumat heç vaxt geri gəlmir.**

Hər "yaxşılaşdırma" fantaziyası bu qayaya çarpır. 640×480 şəkli 4K-ya böyütmək pixel-lər icad edir; heç vaxt çəkilməyənləri bərpa edə bilmir — "enhance!" filmindəki trope şəbəkəli kağızdan heç vaxt etmədiyi işarələri istəyir. 128 kbps MP3-ü WAV və ya FLAC-a çevirmək daha böyük bir qabda *zərərin bit-mükəmməl surəti* verir. JPEG-i "keyfiyyət 100"-də yenidən saxlamaq ilk saxlamanın atdığını bərpa etmir. Hər pipeline-da **ən dar müqavilə qalib gəlir** və heç bir yuxarı axar keyfiyyəti ondan sağ çıxa bilmir. Bu siz 6-cı Dərsdə gördünüz: `utf8mb3` sütunu tətbiqin sadaqətlə çatdırdığını kəsdi. Keyfiyyət qərarları birtərəfli qapılardır; onları mümkün olan *ən son* mərhələdə verin və orijinalı saxlayın.

</Pitfall>

<DeepDive>

#### Niyə üç rəng kifayətdir — nə vaxt kifayət etmir {/*why-three-colors-are-enough*/}

RGB-nin niyə işlədiyinin dərin səbəbi dəqiq ifadə edilməyə dəyər, çünki bu da *sampling* hekayəsidir: insan gözü dalğa uzunluğu spektrini yalnız üç geniş, üst-üstə düşən sensorla nümunələndirir. Rəng görüşü sonsuz ölçülü siqnalın üç ölçülü proyeksiyasudur. Ekranlar işığın spektrini bərpa etmir; *konus hüceyrələrinin cavabını* bərpa edir, bu isə çox daha ucuz bir problemdir. Üç emitter, üç byte, tamamdır.

Hiylənin kənarları onun fərziyyələrinin sındığı yerdə görünür. Çap işığı əks etdirmə yolu ilə çatdırır, buna görə mürəkkəb çıxarıcı işləyir — buna görə **CMYK**, dörd kanal, və ekran rənglərinin kağızda dəyişdiyi əbədi dizayner iztirabı: iki fərqli müqavilə. Quşlar və mantis karideslər dörd-on altı konuslu tiplər daşıyır — onlar üçün inşa edilmiş hər ekran ağlagəlməz derecede yanlışdır. Kişilərin ~8%-i iki effektiv konuslu tiplə bir ölçü aşağıda yaşayır; kritik vəziyyəti yalnız qırmızı-yaşıl çalarla kodlaşdıran interfeys onlar üçün görünməz mürəkkəblə kodlaşdırır. Əlçatımlılıq qaydalarının "heç vaxt yalnız rəngə güvənmə" tövsiyəsi nəzakət deyil — bu, sahədəki heterogen deşifr hardware üçün mühəndislikdir.

</DeepDive>

## Quantization laboratoriyası {/*the-quantization-lab*/}

Şəbəkəli kağızın sıralarını birbaşa hiss etmə vaxtı. Aşağıda 1-ci Dərsin açar paneli ruhunun rəng masası kimi yenidən doğulması var: üç kanal slider (üç byte — günbatımı narıncısı `#FF5733` əvvəlcədən yüklenib), üstəlik **kanal başına bit** idarəetməsi. Sağdakı swatch rənginizi daha az sıraya quantize etdikdən sonra göstərir. Qırmızı slider-i yavaşca 8 bitdə, sonra 2-də sürükləyin, *banding-in barmağınızın altında baş verdiyini izləyin* — hamar hərəkətin uzaq rənglər arasında sıçraması. Kanal başına 1 bitdə 1980-ci illərin ev kompüterlərinin 8 rəngli paletlərini yenidən kəşf etdiniz:

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
        bits per channel:{' '}
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
          <p>true: {hex(rgb)}</p>
        </div>
        <div>
          <div style={{ width: 120, height: 76, background: hex(q),
                        borderRadius: 8,
                        border: '2px solid #c1554d' }} />
          <p>{bits}-bit: {hex(q)}</p>
        </div>
      </div>
      <p style={{ fontFamily: 'system-ui' }}>
        {levels} levels per channel → {(levels ** 3).toLocaleString()} colors
      </p>
    </div>
  );
}
```

</Sandpack>

Aşağıdakı sayğac bütün hekayəni bir sətirdə anlatır: 8 bit → 16,777,216 rəng; 1 bit → 8. Eyni slider, eyni işıq, eyni göz — yalnız şəbəkəli kağızdakı sıralar dəyişdi.

<Recap>

- Gerçəkliyi rəqəmsallaşdırma hər yerdə bir reseptdir: **sample** edin (davamlılığı sütunlara bölün) və **quantize** edin (hər dilimi 2ⁿ sıradan birinə yapışdırın). Nöqtələr integer xülasəsidir; aralarındakı məkan *qəsdən* atılır.
- **Rəng** bioloji hiylərdir: gözün üç konuslu tipi sonsuz spektrləri üç rəqəmə endirir, buna görə pixel üç byte-dır — `#FF5733` = R 255, G 87, B 51 — 2²⁴ = **16,777,216 rəng** verir. Kanallar 5-ci Dərsdəki shift və mask-larla çıxarılır.
- **Şəkillər** pixel cədvəlləridir: xam dəyər = en × boy × byte/pixel. 12 MP foto **xam olaraq 36 MB**-dır; 1080p60 video **xam olaraq 373 MB/s**-dir — gerçəkliyə qədər olan fərq sıxışdırmadır (iki dərs sonra). Az sıralar **banding** kimi görünür; 10-bitlik HDR dərmandır.
- **Səs**: **Nyquist qaydası** ən yüksək tezliyin 2 qatından yuxarı sampling tələb edir; eşitmə ~20 kHz-də bitir, buna görə CD-lər **44,100 Hz**-də (video lent geometriyasının fosili, 1980-ci ildə dondurulmuş) **16 bitdə** (65,536 səviyyə, ~96 dB) nümunə götürür.
- Onurğa hesabı: **44,100 × 2 byte × 2 kanal = 176,400 B/s** ≈ 1.4 Mbit/s ≈ 74 dəqiqəlik disc üçün 750 MiB. Telefonun müqaviləsi — 8,000 Hz × 8 bit = **64 kbit/s**, ~3.4 kHz-dən yuxarı heç bir şey — gözləmə musiqisinin niyə öldüyünü izah edir.
- **Aliasing**: Nyquist-dən yuxarı tezliklər yox olmur, daha aşağı olanları *saxtalaşdırır* (vaqon təkərləri, moiré) — əvvəl filtr et, sonra sample götür.
- **İtirilmiş məlumat heç vaxt geri gəlmir**: böyütmə ixtira edir, MP3→FLAC zərəri kopyalayır, hər pipeline-da ən dar müqavilə qalib gəlir. Keyfiyyəti ən son mərhələdə seçin; orijinalları saxlayın.

</Recap>

<Challenges>

#### DodgerBlue-nu deşifrə et {/*decode-dodgerblue*/}

CSS `DodgerBlue` adlı bir rəng daşıyır, hex kodu `#1E90FF`. Hər üç kanalı onluq sistemə deşifrə edin, kanalları gücə görə sıralayın, cavab verin: bu dərsin oyuncağının 1-bitlik rejimi 16,777,216 mümkün 24-bitlik rəngdən yaxlaşıq hansı *fraksiyasını* qaldırdı?

<Hint>

Hər hex cütü bir byte-dır — 2-ci Dərsdəki qayda: birinci rəqəm × 16 + ikinci rəqəm. Fraksiya üçün: kanal başına 1 bit 2 səviyyə deməkdir, 3 kanal.

</Hint>

<Solution>

```
1E → 1×16 + 14 = 30      (R: demək olar ki qırmızı yoxdur)
90 → 9×16 + 0  = 144     (G: sağlam orta yaşıl)
FF → 15×16 + 15 = 255    (B: tavan səviyyəsindəki mavi)
```

B > G > R — maksimum mavi, orta yaşıl, qırmızı pıçıltısı: parlaq doymuş göy mavisi, tam swatchın göstərdiyi rəng. 1-bitlik palitra: 2³ = **8 rəng** 16,777,216-dan — yaxlaşıq **1 / 2.1 milyonda** fraksiya (2³/2²⁴ = 2⁻²¹). 1980-ci illərin ev kompüteri estetikasının hər rəngi həmin 2⁻²¹ dilimindəydi — gözünüz hər sprite-ı tanıdı, bu müqavilənin nə qədərinin *fidelity*-dən deyil, *struktur*dan daşındığını göstərir.

</Solution>

#### Studio klipini büdcələ {/*budget-a-studio-clip*/}

Video post-production audio 48,000 Hz, 24-bit, stereo-da işləyir. Əsas prinsiplərindən hesablayın: (a) 10 saniyəlik klip neçə byte-dır, (b) kbit/s cinsindən bitrate nədir, (c) bir müqayisə — bu eyni 10 saniyənin telefon keyfiyyətindəkinə nisbəti nə qədərdir?

<Solution>

```
(a)  48,000 nümunə/s × 3 byte × 2 kanal = 288,000 B/s
     × 10 s = 2,880,000 byte ≈ 2.88 MB

(b)  288,000 B/s × 8 = 2,304,000 bit/s = 2,304 kbit/s

(c)  Telefon: 8,000 × 1 byte × 1 kanal = 64,000 bit/s
     2,304 / 64 = 36× böyük
```

Üç faktor, xalis vurma — rate × depth × kanal — və istənilən audio müqaviləsinin qiymətini bir baxışda hesablaya bilirsiniz. 36×-in *haradan* gəldiyinə diqqət yetirin: 6× sample rate-dən, 3× bit depth-dən, 2× stereo-dan. Media xərclərini azaltmağınız istəniləndə, bu faktorizasiya sizin seçimlər menyusuzdur.

</Solution>

#### Gözləmə musiqisi tiketi {/*the-hold-music-ticket*/}

Köçürmə tapşırığı. Müştəri-təcrübə komandası bir tiket göndərir: *"Dəstək xəttimiz üçün gözəl bir orkestr parçasına lisenziya aldıq və studio master-ini yüklədik (48 kHz / 24-bit FLAC, 2,304 kbit/s!). Zəng edənlər deyir ki musiqi sanki divar arxasından eşidilir. 320 kbps-də yenidən ixrac etməyə, hətta FLAC-ı WAV kimi yenidən yükləməyə çalışdıq — heç bir dəyişiklik yoxdur. Telefon provayderimiz faylı korladı?" Nə olduğunu iki həlledici rəqəmlə izah edin; niyə heç bir yenidən ixrac heç vaxt kömək edə bilməyəcəyini izah edin; düzgün gözlənti qoyun və bir real tövsiyə yazın.*

<Solution>

**Nə olur:** heç nə korlanmadı — audio telefon şəbəkəsinin müqaviləsinə keçir: **saniyədə 8,000 nümunə**, Nyquist-ə görə bu pipeline 4,000 Hz-dən yuxarı heç nə daşıya bilmir (praktikada ~3,400 Hz). Orkestrin parlaqlığı — sim harmonikləri, zil şaqqıltısı, "hava" — demək olar ki tamamilə bu xətin üstündədir; kodek onu boğmur, *silir*, sonra qalan hissəni 8-bitlik telefon səviyyəsinə (cəmi 64 kbit/s) quantize edir. "Divar arxasından" tam doğru persepsiyadır: divarlar da aşağı keçirici filtrlərdir.

**Niyə yenidən ixrac kömək etmir:** zərər yükləndiklərindən *aşağı axarda* baş verir. Pipeline-daki ən dar müqavilə qalib gəlir, zəng edənin qulağına çatan son addımdır; 2,304 kbit/s master və 64 kbit/s boru hələ 64-də görüşür. Daha yaxşı fayllar yükləmək 4K poster göndərməkdir faks maşınına — məlumat müqavilənin tuta bilmədiyi yerdə yox olmur, heç vaxt keçmir.

**Cavab:** *"Telefon şəbəkəsi köhnə, sabit bir standartla məhdudlaşır (saniyədə 8,000 ölçü — fizika daha sonra audioyu ~3.4 kHz ilə məhdudlaşdırır, master-inizin məzmununun yaxlaşıq onda biri), buna görə heç bir mənbə faylı standart zəngdə daha yaxşı eşidilə bilməz; provayder tam olaraq mediumun icazə verdiyi şeyi çatdırır. Tövsiyə: ~3 kHz-dən aşağı yerləşən gözləmə musiqisi seçin və ya sifariş verin — tək piano, akustik gitar, nitq öndə olan parçalar bu müqavilədən çox az itkilərlə keçir; platformanızın HD-voice/VoIP kodekləri (16 kHz+) dəstəklədiyini öyrənin, çünki bu boruyu genişlədən yeganə leverage-dır."* ✓

</Solution>

</Challenges>

<LearnMore title="Data Integrity: Parity, Checksums, CRC" path="/learn/faza-0/modul-0-1/checksum-crc">

İndi bilirsiniz ki CD cızılan, kirlənən və düşən bir discdə ~750 MB audio integer-i daşıyır — lakin *mükəmməl* ifa edir, nota nota. Bu möcüzənin bir mexanizmi var. Növbəti dərsdə: bitlər döndüyündə nə olur — kosmik şüalar, ölən kabellar, toz — və zərər verməyin qarşısını ala bilmədiyiniz zaman onu fark etməyin, hətta *bərpa etməyin* gözəl riyaziyyatı: parity, checksum-lar və hər ZIP faylı, Ethernet frame-i və PNG-nin içindəki CRC.

</LearnMore>
