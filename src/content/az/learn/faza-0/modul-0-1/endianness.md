---
title: "Endianness: Byte-ların Sırası"
---

<Intro>

Jonathan Swift-in *Gulliver's Travels* (1726) əsərində Lilliput və Blefuscu imperiyaları bir doktrina məsələsi üzərində nəsillərcə müharibə aparırlar: qaynadılmış yumurta **böyük ucundan** mı, **kiçik ucundan** mı qırılmalıdır? Satirada on bir min Lilliputlu yanlış ucu qırmamaq üçün ölümü seçir. Bu, insanların fərq etməyən fərqlər üzərindən ən sert döyüşməsi haqqında zarafat idi — 1 aprel 1980-ci ilə qədər, şəbəkə mühəndisi **Danny Cohen** *"Müqəddəs Müharibələr Haqqında və Barış Üçün Yalvarış"* adlı qeyd yayımladı. Qeyddə kompüter mühəndislərinin *tam bu müharibəni*, tam ciddi olaraq, həqiqi nəticələri olan həqiqi bir sual üzərindən apardığını qeyd etdi: bir ədəd bir byte-a sığmayanda, **hansı byte yaddaşda birinci gəlməlidir?** İki düşərgə artıq uyğunsuz hardware göndərmişdi. Cohen onları Big-Endian və Little-Endian adlandırdı, adlar əbədi yapışdı, müharibə onun proqnozlaşdırdığı şəkildə bitdi — qalib ilə deyil, sınırla. Laptopunuz o sınırın bir tərəfindədir, internet digər tərəfdə, hər gün saniyədə milyardlarla dəfə ədədlər onu keçir. Bu dərs keçiddə nə baş verdiyini öyrədir — `UNIX` sözünün onu keçib `NUXI` olaraq geri qayıtdığı daxil olmaqla.

</Intro>

<YouWillLearn>

- **Endianness**-in əslində nə olduğu — onu əbədi olaraq aydınlaşdıran bir cümlə
- **Big-endian** vs **little-endian**: eyni 4 byte-ın son rəqəmə qədər iki fərqli ədəd kimi oxunması
- Kim hansı düşərgədədir: CPU, internet, pasport daşıyan fayl formatları
- Endianness-in niyə illərcə görünməz olduğu, sonra yalnız *sınırlarda* vurduğu — şəbəkələr, fayllar, NUXI problemi
- Little-endian-ın CPU-nu (big-endian-ın isə naqili) qazanmasının təəccüblü dərəcədə yaxşı səbəbi
- İki klassik yanlış inanc — tərsinə çevrilmiş bitlər, dəyişdirilmiş sətrlər — və byte sırasını bir daha heç vaxt qarışdırmamaq üçün yol

</YouWillLearn>

## Bir ədəd, dörd qutu {/*one-number-four-boxes*/}

Bu modulun qurduğu yaddaş mənzərəsini xatırlayın: RAM nömrəli poçt qutuları olan nəhəng bir küçədir, hər qutuda bir **byte** var, Dərs 2-də gördüyünüz `0x7ffee4b2c8d0` kimi hex dəyəri isə tək qutunun poçt ünvanıdır. Vacib olan: byte *ünvana sahib olan ən kiçik vahiddir*. Bir qutunun yarısını ünvanlaya bilmirsiniz.

İndi sadə, məsum bir tapşırıq. Proqramınız 32-bit `0x12345678` ədədini — dörd byte: `12`, `34`, `56`, `78` — saxlayır, yaddaş ayırıcısı isə sizə 1000-dən 1003-ə qədər dörd ardıcıl qutu verir. Hansı byte 1000 qutusuna gedir?

Bunun necə *həll edilə bilməyən* olduğunu bir anlığa hiss edin. Riyaziyyatda bunun cavabı yoxdur. Fizikada bunun cavabı yoxdur. Ədəd bölünməz bir dəyərdir; qutular fiziki bir sıradır; bir kontrakt birini digərinə uyğunlaşdırmalıdır, iki özünəuyğun yol var:

<DiagramGroup>

<Diagram name="endianness/be_memory" height={300} width={340} alt="Four memory cells in a row at addresses 1000, 1001, 1002, 1003 holding the bytes 12, 34, 56, 78 of the value 0x12345678. The first cell, 12, is highlighted in blue and labeled 'MSB first'. A note underneath reads: stored in the same order the hex is written — the big end leads.">

**Big-endian:** ən əhəmiyyətli byte ən aşağı ünvanı tutur. Yaddaş yazılmış ədəd kimi oxunur: `12 34 56 78`.

</Diagram>

<Diagram name="endianness/le_memory" height={300} width={340} alt="The same four memory cells at addresses 1000 to 1003, now holding 78, 56, 34, 12. The last cell, 12, is highlighted in blue and labeled 'MSB last'. A note underneath reads: the little end leads — address 1000 holds the number's smallest part.">

**Little-endian:** *ən az* əhəmiyyətli byte ən aşağı ünvanı tutur. Yaddaş ədədi tərsinə saxlayır: `78 56 34 12`.

</Diagram>

</DiagramGroup>

Bu seçim — çox-byte-lı dəyərin byte-larının yaddaşdakı sırası — **endianness** adlanır, onunla bağlı heç vaxt yaşayacağınız hər çaşqınlığı həll edən bir cümləni əzbər etməyə dəyər: **endianness "hansı byte ən aşağı ünvanı alır" sualının cavabıdır, başqa heç nə deyil.** Bit sırası deyil. Sətirdəki simvolların sırası deyil. Yalnız: çox-byte-lı *ədədin* byte-larından hansı ən kiçik ünvanda yaşayır.

Hər iki kontrakt ədədi mükəmməl saxlayır. Hər ikisi onu mükəmməl geri alır. Little-endian yazıb little-endian oxuyan bir maşın iyirmi il heç kimin byte-ların "tərsinə" olduğunu fark etməyəcəyi şəkildə işləyə bilər — Dərs 1-i xatırlayın: **byte-ların mənası yoxdur; kontraktların var**, bir maşının içindəki kontrakt ardıcıldır. Fəlakət iki tərəf tələb edir. Big-endian oxuyucu little-endian məktubu açanda nə baş verdiyini seyrdin:

```
Yazılmış (little-endian) 1000..1003-də:   78 56 34 12

Big-endian fərz edərək geri oxunur:
  0x78563412
  = 0x78×2²⁴ + 0x56×2¹⁶ + 0x34×2⁸ + 0x12
  = 120×16,777,216 + 86×65,536 + 52×256 + 18
  = 2,013,265,920 + 5,636,096 + 13,312 + 18
  = 2,018,915,346  ✗

Nəzərdə tutulan dəyər:
  0x12345678 = 305,419,896  ✓
```

Eyni dörd byte, byte-byte eyni, tək bit belə korlanmamış — iki kontrakt ~6.6 amil ilə fərqli ədədlər çıxarır. Heç xəta qaldırılmır, çünki *qaldırılacaq xəta yoxdur*: hər tərəf öz kontraktını qüsursuz izlədi. Artıq bu janrı tanıyırsınız — Patriot janrı, sensor-offset janrı: **gizlicə yanlış data**, bu modulun çöküşdən daha çox qorxmağı öyrətdiyi uğursuzluq rejimi.

## İki düşərgə {/*the-two-camps*/}

Bəs kim nə seçdi? Cohen-in proqnozlaşdırdığı sınır, kabaca, *prosessorlar* ilə *aralarında gəzən hər şey* arasından keçir.

**Komanda Little-Endian — CPU-lar.** Intel ən erkən mikroprosequentlərə little-endian qoydu, x86 onu miras aldı, x86 isə masaüstü kompüteri və server bazarını fəth etdi. ARM texniki olaraq **bi-endian**-dır (hər iki şəkildə işləyə bilir), lakin praktikada — hər Android telefon, hər iPhone, hər Apple Silicon Mac — little-endian işləyir. RISC-V: little-endian. Bu gün istehsal edilən silikonun böyük əksəriyyəti, bu məqaləni oxuduğunuz maşın da daxil olmaqla, kiçik ucunu əvvəlcə saxlayır. Bunun əla bir mühəndislik səbəbi var, aşağıdakı DeepDive-da öz yerini alır.

**Komanda Big-Endian — naqil və arxivlər.** IBM-in System/360-ı (1964 — Dərs 1-də 8-bit byte-ı sizə verən maşın) big-endian idi, Motorola-nın 68000-i və Sun-un SPARC-ı da. Lakin düşərgənin həlledici ərazisi **şəbəkədir**: internetin əsas protokolları yazılanda, paket başlıqlarındakı bütün çox-byte-lı ədədlərin — portlar, ünvanlar, uzunluqlar — ən əhəmiyyətli byte əvvəlcə gedəcəyi elan edildi. Bu günə qədər big-endian-ın rəsmi sinonimi **network byte order**-dır. Bir çox fayl formatı izlədi: PNG ve JPEG daxili tam ədədlərini big-endian saxlayır; Java — şəbəkəli dünya üçün 90-cı illərdə dizayn edildi — hansı CPU üzərindən işlədiyindən asılı olmayaraq `.class` fayllarını və standart I/O-sunu big-endian etdi.

Bəzi formatlar isə zövqlü dürüstlüklə bir şey etdi: **TIFF** şəkil faylları iki-byte-lı pasportla başlayır — `II` (little-endian, "Intel") ya da `MM` (big-endian, "Motorola") — fayl *endianness-ini* ilk iki byte-da elan edir, hər oxuyucu uyğunlaşır. Bu arada GIF, BMP, ZIP isə little-endian göndərir, çünki PC-lərdə doğulublar. Hər ikili format spesifikasiyası haradasa birinci səhifəsindəki yumurta sualını cavablayır; unudanlar uyğunluq folklorunun içinə girirlər.

Öz maşınınız soruşulsa inanclılığını etiraf edər:

<TerminalBlock>

lscpu | grep 'Byte Order'
Byte Order:                         Little Endian

</TerminalBlock>

JavaScript isə CPU-nu işdə yaxalaya bilər. Typed array görünüşü (Dərs 3-ün `Int8Array` hiləsindən alət) 32-bit ədədi yaddaşa yazmağa, sonra xam ilk byte-ı yoxlamağa imkan verir:

```js
new Uint8Array(new Uint32Array([0x12345678]).buffer)[0].toString(16)
```

<ConsoleBlock level="info">

'78'

</ConsoleBlock>

Həmin buffer-in sıfır ünvanı `78` saxlayır — kiçik ucu. Hələ JavaScript işlədən az sayda big-endian maşında eyni sətir `'12'` qaytarır. Bu yüksək səviyyəli dildən endianness-in belə *görünə biləcəyi* az sayda yoldan biridir, bu da qəsdən belədir: bir maşının içindəsinizsə ve xam byte əvəzinə *dəyərlərle* danışırsınızsa, kontrakt başqasının problemidir. Bu isə başqasının problemi olmaqdan çıxdığı yerə gətirir.

## Vurduğu yer: sınırlar {/*where-it-bites-boundaries*/}

Endianness-in özünəməxsus bir güvənlik profili var: data **maşın sınırını** keçənə qədər — bir şəbəkə soketi, ikili fayl, yaddaşla eşlənmiş cihaz, bir tipin görünüşündən digərinə cast — *mükəmməl zararsızdır*. Sınırda yazıcının kontraktı ilə oxuyucunun kontraktı ilk dəfə görüşür, əgər *tranzitdəki byte-ların* hansı kontrakta tabe olduğunu heç kim yazmamışsa Unix folklorunun ən qədim müharibə hekayəsini alırsınız.

1970-ci illərin sonunda — hekayə hacker mədəniyyətinin salnaməsi Jargon File-da qorunur — Unix PDP-11-dən yeni bir maşına köçürülürdü. İki maşın byte-ları 16-bit sözcüklərə əks sıralarda sıxışdırdı. Boot mesajlarının bir yerinde, iki 16-bit dəyər olaraq paketlənmiş `UNIX` sözünün dörd byte-ı iki konvensiyanın arasını keçərək hər sözcüyün byte-larını dəyişdirdi — sistem qürurla çap etdi:

<Diagram name="endianness/nuxi_problem" height={320} width={720} alt="Top row: the four ASCII bytes of UNIX shown as two 16-bit word boxes, U N in the first word and I X in the second, with hex values 55 4E and 49 58, labeled 'packed as two 16-bit words on the source machine'. Two downward arrows labeled 'each word's bytes swap when the convention flips'. Bottom row: the same two word boxes now holding N U and X I, with hex 4E 55 and 58 49, highlighted in red, and the resulting printed text NUXI, labeled 'the same bytes, read under the other contract'.">

Dörd düzgün byte, iki çevrilmiş sözcük-kontrakt: banner `NUXI` oxuyur. Bug o qədər kanonikdir ki "NUXI problemi" byte-sırası xətaları üçün ümumi ad oldu.

</Diagram>

Tək byte itirilmədi ya da xarab edilmədi. `U`, `N`, `I`, `X` — Dərs 2-nin mətn kontraktından hex `55 4E 49 58` — hamısı çatdı. Yalnız *mövqelər* yalan söylədi. Endianness bugunu adi korrupsiyadan bir baxışda ayırd edən işarəyə diqqət edin: **cəfəngiyat öz datanızdan düzəldilib, düzgün, müntəzəm parçalar şəklində yenidən düzülüb.** Təsadüfi korrupsiya küy kimi görünür; byte-sırası bugları anaqram kimi görünür.

Lakin işdə ən çox vuran sınır şəbəkədir. Little-endian laptopunuz bir serverə "**8080** portuna qoşun meni" demək istəyir. 16-bit ədəd olaraq 8080 `0x1F90`-dır, RAM-ınız onu little-end-əvvəlcə `90 1F` saxlayır. Lakin naqilin kontraktı network byte order-dır — big-endian. Sınırda *açıq şəkildə* kimsə dəyişiklik etməlidir:

<Diagram name="endianness/network_byte_swap" height={360} width={720} alt="Two horizontal lanes. Top lane, labeled 'with htons()': a laptop box marked little-endian holding memory bytes 90 1F, an arrow labeled htons() leading to two wire bytes 1F 90 marked 'network byte order', then an arrow to a receiver box that reads port 8080 with a blue check mark. Bottom lane, labeled 'raw memory copy': the same laptop bytes 90 1F go onto the wire unchanged as 90 1F, and the receiver, applying the big-endian wire contract, reads port 36895 with a red cross, annotated 'no error raised — just the wrong port'.">

Bir sınır, iki nəticə. Dəyişiklik istəyə bağlı nəzakət deyil; hər iki düşərgənin öz yaddaş sırasını saxlayıb hələ də danışmasına imkan verən müqavilədir.

</Diagram>

Əllə yoxlama — saf Dərs 2 hex bacarıqları:

```
Nəzərdə tutulan port:  8080 = 0x1F90
  0x1F90 = 1×4096 + 15×256 + 9×16 + 0 = 8080 ✓

Naqil xam little-endian byte-ları daşıyır: 90 1F
Alıcı naqilin big-endian kontraktını tətbiq edir:
  0x901F = 9×4096 + 0×256 + 1×16 + 15
         = 36,864 + 16 + 15
         = 36,895 ✗
```

Bağlantı gizlicə 36895 portuna gedir — güman yox ki orada bir şey dinlənir, `connection refused` alırsınız, kodunuzdakı *dəyərlərə* nə qədər baxsanız da izah edə bilmirsiniz, çünki dəyərlər həmişə doğru idi. Buna görə Yer üzündəki hər soket API-sı tərcümə dördlüyünü göndərir — `htons`, `htonl`, `ntohs`, `ntohl` (*host-to-network-short*, *host-to-network-long* ve tərsi) — sənədlərinin isə big-endian hostlarda bunların tamamilə heç nəyə derlenediyini nəzakətlə heç vaxt qeyd etmədiyinin səbəbi. Funksiyalar riyaziyyat deyil; onlar **sərhəd nəzarətidir**.

Bir sınır keçişi daha var, artıq etmişdiniz. Dərs 1-də iki byte `48 69` mətn olaraq oxunanda `Hi` yazdı, tək 16-bit ədəd olaraq oxunanda **18,537** verdi. İndi həmin bağlantını əsl laptopunuzda tərsinə işlədin: little-endian maşında *ədəd* 18,537-yi (`0x4869`) saxlayın, yaddaş `69 48` saxlayır. Həmin byte-ları mətn kontraktından keçirin, `iH` yazır. Mətn ve ədədlər həqiqətən fərqli kontraktlar altında eyni byte-lardır — lakin *ədəd* kontraktının endianness-i var. Bu isə bu dərsin indi söküm etməli olduğu tələni qurar.

<Pitfall>

**Endianness buglarının əksəriyyətini yaradan iki yanlış inanc.**

*Yanlış inanc 1: "little-endian bitləri tərsinə çevirir."* Xeyr. Byte ünvanlama atomudur — Dərs 2-nin öyrətdiyi kimi MSB-dən LSB-ə sabit sırada möhürlənmiş vahid kimi gəzir. `0x12345678` little-endian `78 56 34 12`-dir — `0x12` byte-ı hələ `00010010` bit nümunəsidir, toxunulmaz. Endianness *qutuları* permutasiya edir, bir qutunun məzmununu heç vaxt deyil. Bir binary sətiri simvol-simvol tərsinə çevirəndə özünüzü tutsanız, dayanın: mühəndisliyi tərk edib origamiyə girdiniz.

*Yanlış inanc 2: "sətrlər də dəyişdirilir."* Xeyr. ASCII kontraktı altında sətir *müstəqil 1-byte-lı dəyərlərin ardıcıllığıdır*, 1-byte-lı dəyərin yenidən sıralanacaq heç nəyi yoxdur — `"Hi"` indiyə qədər qurulan hər maşında `48 69`-dur. Endianness yalnız **çox-byte-lı rəqəmsal vahidə** (16/32/64-bit tam ədəd, float-ın 4 ya da 8 byte-ı) tətbiq olunur. NUXI hekayəsi buna ziddiyyət etmir: byte-lar tam olaraq simvol kimi deyil, *16-bit ədəd kimi* idarə olunduqları üçün dəyişdirildi. Verilmə sual heç vaxt "bu data mətndir, yoxsa ikili?" deyil, "**vahid nədir, vahid bir byte-dan genişdir?**"-dir. Bir-byte-lı vahidlər: toxunulmaz. Daha geniş vahidlər: bir tərəf seçin, yazın.

</Pitfall>

<DeepDive>

#### Niyə little-endian CPU-nu qazandı {/*why-little-endian-won-the-cpu*/}

Little-endian qeyri-təbii görünür — hər hex dökümdə "tərsinə" çap edir — buna görə silikonun müharibəsini təsadüfə görə deyil, həqiqi üstünlüyə görə qazandığını bilmək dəyər.

**Səbəb 1: arifmetika kiçik uçdan başlayır.** Odometeri xatırlayın: toplanma ən az əhəmiyyətli rəqəmdən başlayır, çünki daşıma oradan doğur, daşımalar isə yalnız *sola* yayılır. İlk mikroprosequentlər 16-bit ədədləri bir anda bir byte əlavə etməli olan 8-bit maşınlardı — little-endian CPU ən *aşağı* ünvandakı byte-ı götürüb dərhal toplamanı başlada bilirdi, yüksək byte hələ gətirilirkən artıq aşağı byte-ın cəmini (və daşımasını) hesablayırdı. Big-endian maşınlar arifmetika başlamadan *önce* ədədin *sonuna* çatmalıydı. Bütün çipiniz bir neçə yüz kilohertsda işləyəndə bir byte əvvəl başlamaq həqiqi puldur.

**Səbəb 2: hər anda bir ünvan bir şey bildirir.** Little-endian maşında ədədin ünvanı *ən kiçik hissəsinin* ünvanıdır — buna görə 1000 ünvanında `0x00000042` saxlayan eyni ünvan 1 byte, 2 byte, 4 ya da 8 oxusanız da 66 oxunur. Dəyərin aşağı byte-ı tipi genişlənəndə hərəkət etmir; daha dar bir ştekdə yenidən şərh edilmiş göstərici hələ arifmetik cəhətdən doğru parçaya işarə edir. Big-endian-da hər genişlik dəyişikliyi aşağı byte-ı saxlayan ünvanı dəyişdirir. Kompilyatorlar, ayırıcılar, low-level kod little-endian qaydası altında ölçülə bilər şəkildə daha sadədir; bu göstərici-yayıcısının xəyalıdır.

**Yenə de big-endian naqili qazandı, yenə liyaqətle:** bir paket dökümü oxuyan insan ədədləri yazılış sırasında görür; ünvanları müqayisə edən routerlər ilk fərqli byte-da qısa qeyd edə bilir (müqayisə, toplamanın əksinə, *böyük* uçdan başlayır — Dərs 4-ün biased float-larının tam ədəd kimi sıralandığı eyni səbəb). Cohen-in 1980 yalvarışı tam bu nöqtəni qeyd etdi: hər iki sıra müdafiə edilə bilər, heç biri müharibəyə dəyməz, tək ölümcül seçim *seçməməkdir*. İnternet böyüyü seçdi; Intel kiçiyi artıq göndərmişdi; müqavilə hər soketdə bir cüt dəyişiklik funksiyasıdır. On bir min Lilliputlu daha azı üçün öldü.

</DeepDive>

<DeepDive>

#### Middle-endian: üçüncü yumurta {/*middle-endian-the-third-egg*/}

Təbii ki, hesablama həm də hər ikisinin dezavantajlarını birləşdirən kompromis konvensiyalar istehsal etdi. PDP-11 — NUXI hekayəsinin tam həmin maşını — 32-bit dəyərləri *big-endian* sözcük sırasında yerləşdirilmiş iki little-endian 16-bit sözcük olaraq saxlayırdı: byte ardıcıllığı `2 3 0 1`, sevgi və dəhşətle **middle-endian** ya da "PDP-endian" olaraq xatırlanır.

1970-ci il hardware-ini gülməyə qoyulmadan əvvəl təqviminizia baxın. `MM/GG/YYYY` tarix formatı middle-endian-dır (əvvəlcə orta vahid, sonra kiçik, sonra böyük); `GG/MM/YYYY` little-endian-dır; ISO 8601-in `YYYY-MM-DD`-si big-endian-dır — tam buna görə **sözlük müqayisəsi olaraq düzgün sıralanır**, biased float exponent-inin ötən dərsdə çəkdiyi eyni hiylə: ən əhəmiyyətli hissəni əvvəlcə qoyun, sadəlövh leksikografik müqayisə pulsuz düzgün rəqəmsal müqayisə olur. İnsanlıq zərflər və formalarda endianness müharibəsini əsrlərdir aparır; hesablama sadəcə ən qədim müqəddəs müharibəyə qatıldı. Logları ISO 8601 ilə saxlayın, tarihin doğru tərəfinde olun.

</DeepDive>

## Byte-sırası laboratoriyası {/*the-byte-order-lab*/}

Sınırı özünüz keçmə vaxtı. Aşağıda 1000–1003 ünvanlarında RAM-ın dörd poçt qutusu var. Bir dəyər seçin, **yazma** kontraktını seçin, **oxuma** kontraktını seçin, həm byte-ları, həm hər byte-ın mətn-kontrakt renderinqini (`iH` effekti, canlı) seyrdin. Uyğunsuz kombinasiyalar bu dərsdən hər ədədi tam olaraq reproduksiya edir: `2,018,915,346` tapın, port `36,895` tapın, `iH` tapın:

<Sandpack>

```js
import { useState } from 'react';

const PRESETS = [
  { label: '0x12345678', v: 0x12345678 },
  { label: '18537 ("Hi")', v: 18537 },
  { label: '8080 (a port)', v: 8080 },
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
        geri oxunur: {readBack.toLocaleString()}
      </h2>
      <p style={{ fontFamily: 'system-ui' }}>
        {ok
          ? 'Kontraktlar uyğundur — endianness görünməzdir.'
          : 'Kontraktlar sınırda fərqlənir: eyni byte-lar, yanlış ədəd.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Oyuncağın bitişik sübut etdiyinə diqqət edin: *uyğun* kontraktlarla — istənilən cütlüklə — hər şey işləyir. Bug tam olaraq dörd kombinasiyanın ikisindədir, ikisi də sınırlardır.

<Recap>

- **Endianness** yalnız bir sualı cavablandırır: *çox-byte-lı ədədin hansı byte-ı ən aşağı ünvanı alır.* **Big-endian**: ən əhəmiyyətli byte əvvəlcə, yaddaş yazılmış hex kimi oxunur. **Little-endian**: ən az əhəmiyyətli byte əvvəlcə.
- Hər iki kontrakt doğru ve özünəuyğundur; bir maşının içindəki endianness **görünməzdir**. Buglar yalnız **sınırlarda** yaşayır — şəbəkələr, ikili fayllar, castlər — yazıcının kontraktı fərqli oxuyucunun kontraktıyla görüşdüyündə: `0x12345678` `2,018,915,346` olur, port 8080 36,895 olur, `UNIX` `NUXI` olur.
- Byte-sırası xətaları **gizlicə yanlış data** istehsal edir, düzgün yenidən düzülmüş parçalarda — anaqramlar, küy deyil — heç istisna yoxdur, çünki hər iki tərəf öz kontraktını mükəmməl izlədi.
- Düşərgələr: little-endian CPU-lara malikdir (x86, praktikada ARM, RISC-V), çünki **toplama kiçik uçdan başlayır** ve ünvan hər ендə eyni şey bildirir. Big-endian naqilə (**network byte order**) ve PNG, JPEG, Java class faylları kimi formatlara malikdir, çünki **müqayisə ve insanlar böyük uçdan başlayır**. TIFF pasport daşıyır: `II` ya da `MM`.
- Şəbəkə sınırındakı müqavilə açıq dəyişiklikdir: **`htons` / `htonl` / `ntohs` / `ntohl`** — sərhəd nəzarəti, riyaziyyat deyil.
- Endianness yalnız **bütöv byte-ları yenidən sıralayır**: byte-ın içindəki bitləri heç vaxt deyil, bir-byte-lı vahidin sırasındakı simvolları da heç vaxt deyil. Sual həmişə: *vahid nədir, vahid bir byte-dan genişdir?* Bir-byte-lı vahidlər: toxunulmaz. Daha geniş vahidlər: bir tərəf seçin, yazın.
- Danny Cohen, 1 aprel 1980: istənilən sıra işləyir; **razılaşmamaq** tək ölümcül seçimdir. Dizayn etdiyiniz hər ikili format ve protokolda byte sırasını yazın — birinci səhifədə.

</Recap>

<Challenges>

#### Sehrli ədədin iki üzü {/*the-magic-numbers-two-faces*/}

Dərs 2 hər Java `.class` faylını açan 4-byte sehrli ədədi `CAFEBABE`-ni tanıtdı. Java class faylları spesifikasiya gərəyincə big-endian-dır. Bu dörd byte **faylda** hansı sırada oturur? Bir little-endian x86 JVM həmin sehrli ədədi 32-bit registrə *dəyər* `0xCAFEBABE` olaraq oxudandan sonra, bir debugger **registrin yaddaşında** hansı byte sırasını göstərər?

<Hint>

Fayl *byte ardıcıllığıdır* — spesifikasiya tərəfindən sabitlənmiş bir fiziki sıra var. *32-bit dəyər* saxlayan RAM CPU-nun kontraktına uyğundur. İki yeri ayrıca edin.

</Hint>

<Solution>

**Faylda:** spesifikasiyaya görə big-endian, ən əhəmiyyətli byte əvvəlcə — fiziki olaraq `CA FE BA BE`, tam yazılış sırasında. Dərs 1-dən (`xxd`) istənilən alət *istənilən* maşında 0–3 offsetlərinde həmin byte-ları göstərir, çünki fayl sadəcə byte ardıcıllığıdır; CPU-su yoxdur.

**x86 yaddaşında:** həmin byte-lar 32-bit *dəyər* `0xCAFEBABE` olduqdan sonra little-endian kontrakt tətbiq olunur, dörd poçt qutusu `BE BA FE CA` saxlayır — ən aşağı ünvan kiçik ucu alır.

Ümumi dərs: "byte-lar hansı sırada?" sualının haranı göstərdiyinizi müəyyənləşdirmədən cavabı yoxdur — faylda/naqildə (formatın spesifikasiyası ilə sabitlənib) ya da RAM-da yazılmış dəyər olaraq (CPU ilə sabitlənib). JVM-in fayl-analiz kodu sınırda çeviriyi həyata keçirir, tam bir `ntohl`-şəkilli dəyişiklik, nə dünya digərinin sırasını fark edir.

</Solution>

#### Dökümdü lokal kimi oxuyun {/*read-the-dump-like-a-local*/}

x86 laptopunuzda debuggingleyirsiniz, 32-bit `int` dökürünüz, `D2 04 00 00` byte-larını görürsünüz. Onluqda dəyər nədir? Little-endian maşınlarda kiçik ədədlərin dökümdə həmişə **sağda** sıfırları göstərməsinin niyə olduğunu bir cümlədə izah edin.

<Solution>

Little-endian: ən aşağı ünvan kiçik ucu saxlayır, buna görə ədədin byte-ları əhəmiyyət sırasında döküm *tərsinə* çevrilir: `00 00 04 D2` → `0x000004D2`.

```
0x4D2 = 4×256 + 13×16 + 2
      = 1024 + 208 + 2
      = 1234 ✓
```

Dəyər **1234**-dür. Sıfırlar haqqında: kiçik dəyərin *yüksək* byte-ları sıfırdır, little-endian yüksək byte-ları yüksək ünvanlara — dökümdün sağ tərəfinə — qoyur. Bu həqiqətən faydalı sahə bacarığıdır: x86-da `XX 00 00 00` silsiləsi demək olar ki həmişə "burada kiçik bir int yaşayır" olaraq oxunur, `00 00 00 XX` isə dəyişdirilməmiş big-endian data (şəbəkə çəkisi, Java yazılmış fayl) qoxusunu verir. Təcrübəli mühəndislər heç bir riyaziyyat etmədən bu nümunədən byte-sırası buglarını diaqnoz edir.

</Solution>

#### Cəhənnəmdən uzunluq prefiksi {/*the-length-prefix-from-hell*/}

Transfer tapşırığı. Komanda yoldaşının x86-dakı C xidməti ikili mesajları "4-byte uzunluq, sonra yük" olaraq göndərir, uzunluğu xam `fwrite(&len, 4, 1, ...)` ilə yazır. Ortaq komandanın oxuyucusu — big-endian cihazda işləyən ya da big-endian kontraktla Java `DataInputStream`-i olan — uzunluğu **1024** olan bir mesaj alır, dərhal çılğın yanlış bir buffer ayırmağa çalışır, sonra sincronunu itirir, həmişəlik cəfəngiyat oxuyur. Oxuyucunun tam olaraq hansı uzunluğu hesabladığını gösteren byte riyaziyyatını edin, sonra iki cümləlik review şərhini yazın.

<Solution>

1024 = `0x00000400`. x86 yazıcısının `fwrite`-ı little-endian RAM-ı birbaşa naqilə kopyalayır:

```
naqil byte-ları:       00 04 00 00
oxuyucu (big-endian):  0x00040000
                     = 4 × 65,536
                     = 262,144  ✗   (1 KiB deyil, 256 KiB)
```

Oxuyucu 1 KiB mesaj üçün 256 KiB buffer ayırır, heç gəlməyəcək 262,144 byte-ı gözləyir (ya da növbəti ~255 mesajı "yük" olaraq udumdur), çərçivə heç bərpa olunmur — bir dəyişdirilməmiş tam ədəd bütün axını zəhərləyir. Anaqram imzasına diqqət edin: `00 04 00 00` vs `00 00 04 00` — oxuyucunun öz datası, yenidən düzülüb.

Review şərhi: *"Çox-byte-lı tam ədədləri maşın sınırında heç vaxt `fwrite`/`memcpy` etməyin — naqilin host üzərindən asılı olmayaraq elan edilmiş bir byte sırası olmalıdır. Lütfən uzunluğu açıq serialize edin (`htonl(len)` yazmadan əvvəl, oxuduqdan sonra `ntohl`, ya da byte-byte sürüşmələrlə), byte sırasını protokol sənədinizin birinci səhifəsinə əlavə edin — format hazırda yalnız iki little-endian host arasında təsadüfən işləyir."*

Daha dərin vərdiş, üçüncü dərs ardıcıl: kontraktlar *dizayn zamanı* seçilməli ve yazılmalıdır. Aralıqlar (Dərs 3), təmsil edilə bilənlik (Dərs 4), byte sırası (bu gün) — üçündə də byte-lar heç vaxt yanlış olmadı; yazılmamış fərziyyə idi. ✓

</Solution>

</Challenges>

<LearnMore title="Mətn: ASCII-dən UTF-8-ə" path="/learn/faza-0/modul-0-1/text-representation">

Dərs 1-dən bəri "mətn kontraktı" gizlicə 72-ni `H`-ya uyğunlaşdıran bir xüsusi cədvəl deməkdi. Növbəti dərsdə həmin cədvəl nəhayət öz hekayəsini alır — bu da bir müharibə hekayəsidir: 7-bit Amerika ingiliscəsinin hər insan dilini necə tutmağa çalışdığı, e-maillarınızın niyə bir vaxtlar `Ã©` ve `Ð¿Ñ€Ð¸Ð²ÐµÑ‚` olaraq gəldiyi, UTF-8-in mühəndislik tarixinin ən böyük geriyə-uyğun dizaynlarından birini necə həyata keçirdiyi. Endianness belə bir dəfə meydana çıxır: bir çox mətn faylının ilk "simvolu" başqa bir şey deyil, yalnız byte-sırası işarəsidir.

</LearnMore>
