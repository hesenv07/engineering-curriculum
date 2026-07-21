---
title: 'Sıxışdırma: ZIP Necə İşləyir (Huffman, LZ)'
---

<Intro>

1951-ci ildə MIT professoru Robert Fano informasiya nəzəriyyəsi sinfinə bir seçim təklif etdi: ya final imtahanına girin, ya da bir məsələni həll edən kurs işi yazın — ən *səmərəli* ikilik kodu tapın. Məsələnin açıq olduğunu, ən yaxşı məlum cəhdin — onun və Claude Shannon-un adını daşıyan kodun — optimaldan geri qaldığını isə demədi. David Huffman adlı bir magistr tələbəsi kurs işini seçdi, aylarla çabaladı və imtahana bir neçə gün qalmış qeydlərini zibil qutusuna atıb dərsə hazırlaşmağa getdi — sonra, ertəsi səhər, hamının gözdən qaçırdığı ideyanı atılmış səhifələrin içində gördü. Həmin kurs işindən çıxan alqoritm bu gün sizin maşınınızda yəqin ki min dəfə işləyib: hər ZIP, PNG, JPEG və ya bu veb səhifəni açanda işə düşür. Bu dərs sizə Huffman-ın hiyləsini, onun tərəfdaşı LZ77-ni və ikisinin Yer üzündəki hər `.zip`-in içindəki mexanizmə necə birləşdiyini öyrədir.

</Intro>

<YouWillLearn>

- Datanın ümumiyyətlə niyə kiçilə bildiyi — **artıqlıq**, bir eksperimentlə göz önünə sərilir (bir milyon byte → 1,003 byte... və ya 1,000,173)
- **Run-length encoding**: aşkar ideya, harada qalib gəldiyi (faks maşınları) və adi mətni necə *iki dəfə böyütdüyü*
- **Huffman kodlaşdırması**: ümumi simvollara qısa kodlar, **prefix-free** kodların niyə ayırıcı tələb etmədiyi və optimal ağacı əllə necə qurmaq
- **LZ77**: "13 geri get, 5 kopyala" — təkrarın özünü sıxışdırmaq, hələ mövcud olmayan byte-ları kopyalayan üst-üstə düşmə hiyləsi daxil
- **DEFLATE**-in ikisini ZIP, gzip, PNG və `.docx`-ə necə zəncirlədiyi — və Yer üzündəki hər ZIP-in niyə ölmüş bir proqramçının inisialları ilə başladığı
- Riyazi divar: heç bir alqoritmin niyə hər şeyi sıxışdıra bilmədiyi, iki dəfə zip-ləməyin niyə əks nəticə verdiyi və 4.5 petabyte-a açılan 42 KB-lıq faylın etibar haqqında öyrətdikləri

</YouWillLearn>

## İtmiş meqabaytlar hara getdi {/*where-the-missing-megabytes-went*/}

7-ci Dərs sizi bir borcla qoydu. 12 meqapiksellik şəkil xam halda 36,000,000 byte edir — vurmanı özünüz aparmışdınız — amma telefonunuzdakı fayl təxminən 3 MB-dır. Bu boşluğu iki fərqli ideya bağladı. **İtkili** (lossy) sıxışdırma *atır*: JPEG gözünüzün seçməyəcəyi detalları tullayır — birtərəfli qapı olduğunu artıq bilirsiniz. **İtkisiz** (lossless) sıxışdırma — bu dərs — *heç nə* atmır: açın, hər byte bit-bə-bit eyni qayıdır; arxivin içində gəzən CRC-32 məhz bu iddianı yoxlamaq üçün oradadır (8-ci Dərs). ZIP, gzip və PNG təmiz itkisizdir; JPEG isə *hər ikisidir* — əvvəl atır, sonra sağ qalanları məhz bu dərsin öyrətdiyi Huffman kodlaşdırması ilə qablaşdırır. Şəkil müəmması iki mərhələdə həll olunur — bu səhifənin sonunda ikinci mərhələ tamamilə sizin olacaq.

Amma "heç nə itirmədən kiçiltmək" fırıldaq kimi səslənir. Heç nə atılmırsa, fayldan nə çıxır? Eksperimenti aparın — *eyni* ölçülü iki giriş, biri tamam sıfırlar, biri tamam təsadüfi:

<TerminalBlock>

head -c 1000000 /dev/zero | gzip | wc -c

</TerminalBlock>

<TerminalBlock>

1003

</TerminalBlock>

<TerminalBlock>

head -c 1000000 /dev/urandom | gzip | wc -c

</TerminalBlock>

<TerminalBlock>

1000173

</TerminalBlock>

Bir milyon sıfır **1,003 byte**-a çökür — təxminən 1,000× kiçik. Bir milyon təsadüfi byte isə **1,000,173** olaraq çıxır — "sıxışdırılmış" fayl 173 byte *böyükdür*. İçəri eyni uzunluq, çölə əks talelər: fayl ölçüsü gzip-in ölçdüyü şey deyil.

gzip-in ölçdüyü **artıqlıqdır** — datanın sizə deyilmədən də proqnozlaşdıra biləcəyiniz hissəsi. Bir milyon sıfır demək olar ki heç bir informasiya daşımır: "bir milyon sıfır" cümləsi elə faylın *özüdür* və 1,003 byte gzip-in o cümləni yazmaq üsuludur. Təsadüfi byte-ların proqnozlaşdırıla bilən hissəsi yoxdur, deməli çıxarılacaq heç nə yoxdur — üstəlik uçot xərci nəticəni böyüdür. Bütün sahə bir sətirdə budur: **sıxışdırma datanı kiçiltmir — proqnozlaşdırıla bilənliyi kiçildir.** Shannon-un 1948-ci il məqaləsi — 1-ci Dərsdə bit-ə adını verən həmin məqalə — bu ideyaya bir ədəd verdi: **entropiya** — mesajın bitlərlə ölçülən həqiqi informasiya tutumu, hansı ki heç bir itkisiz sxem onu keçə bilməz. O divara dərsin sonuna yaxın çatacağıq; əvvəlcə gəlin artıqlıq ovuna çıxaq.

Bir çərçivə də, bu modulun doğma dilində: mətn faylı *standart* müqavilə altında yazılmış byte-lardır — hər simvola bir byte, hamıya eyni qiymət (6-cı Dərs). Sıxışdırılmış fayl isə eyni informasiyanın məhz bu data üçün qurulmuş **fərdi, özəl müqavilə** altında yenidən yazılmış halıdır — deşifrə açarı da faylın içində səyahət edir. Sıxışdırma müqavilə danışığıdır.

<Note>

Bu dərsdə sifətsiz "sıxışdırma" **itkisiz** deməkdir. İtkili yarı — diskretləşdirmə, kvantlama, JPEG ilə MP3-ün nəyi məhv etməyi seçdiyi — 7-ci Dərs idi. Real media formatları ikisini zəncirləyir: itkili nəyin qalacağına qərar verir, itkisiz qalanı qablaşdırır.

</Note>

## Aşkar ideya: run-length encoding {/*the-obvious-idea-run-length-encoding*/}

İnsanlar sıxışdırma notasiyasını kompüterlərdən xeyli əvvəl icad ediblər. İstənilən toxuma sxemini açın: orada `k12, p2` yazılır — *on iki üz ilmə, iki tərs ilmə* — `toxu toxu toxu...` on iki dəfə yox. Toxuma sxemini yadda saxlayın; dərsin sonunda görəcəksiniz ki o, bütöv bu dərsi miniatürdə daşıyır.

`k12` ilk alqoritmdir: **run-length encoding (RLE)** — təkrarlanan simvolların hər *run*-ını simvol və sayla əvəz et. Əsasən boş bir səhifənin faksından bir skan sətri götürək, `W` ağ piksellər, `B` qara:

```
giriş:   WWWWWWWWWWWWBWWWWWWWWWWWWBBB          28 simvol

run-lar: W ×12   B ×1   W ×12   B ×3

çıxış:   (W,12)(B,1)(W,12)(B,3)                4 cüt = 8 byte

28 byte → 8 byte: 3.5× kiçik ✓
```

Bu, oyuncaq yox, əsl iş atıdır: 1980-ci ildə CCITT tərəfindən standartlaşdırılan faks maşınları sətirdə **1,728 piksel** skan edir və tipik səhifə böyük əksəriyyətlə ağdır — yüzlərlə eyni pikseldən ibarət run-lar, tam RLE-nin yemi. (Faks standartı birazdan tanıyacağınız bir fənd də əlavə edir: run uzunluqlarını adi ədəd kimi saxlamaq əvəzinə, *ən çox rast gəlinən* uzunluqlara *ən qısa* kodları verir. Bu fikri saxlayın.)

İndi RLE-nin adi data ilə görüşünə baxın:

```
giriş:   Hello, world!                          13 byte

run-lar: H×1 e×1 l×2 o×1 ,×1 ␣×1 w×1 o×1 r×1 l×1 d×1 !×1

çıxış:   12 cüt = 24 byte                       ✗ az qala İKİQAT
```

İngilis mətni hərfi *yanaşı* demək olar ki heç vaxt təkrarlamır — bütün o cümlədə tək bir `ll` — beləcə RLE hər simvola say ödəyir və qarşılığında heç nə almır. Bu uğursuzluq ibrətlidir, çünki öyrətdiyi məhz bundan sonrakı hər şeyin iki yarısıdır:

1. Simvollar bərabər tezlikli deyil — ingiliscədə `e` və boşluq hökm sürür — amma ASCII hamıdan eyni 8 biti alır. **Tezlik qısa adlara layiqdir.**
2. Adi data *təkrarlanır* — `Hello` və `world` bir neçə abzas sonra yenə görünəcək — sadəcə yanaşı run-larda yox. **Təkrar ifadə məsafəsində yaşayır.**

1-ci ideya Huffman kodlaşdırmasına çevrilir. 2-ci ideya LZ77-yə. ZIP ikisini bir-birinə calayanda alınan şeydir.

## Huffman kodlaşdırması: ümumi şeylərə qısa adlar {/*huffman-coding-short-names-for-common-things*/}

Tez-tez rast gəlinənlərə qısa adlar vermək kompüterlərdən qədimdir. 1830-cu illərdə hazırlanan Morze kodu `E`-yə tək bir nöqtə, `T`-yə tək bir tire xərcləyir — ingiliscənin ən çox işlənən iki hərfi — nadir `Q` isə `− − · −`-ə başa gəlir; deyilənə görə Alfred Vail tezlikləri bir mətbəənin çeşidləmə qutusundakı hərf ştamplarını saymaqla qiymətləndirmişdi — mətbəələr hər hərfdən düz dilin tələb etdiyi qədər saxlayır. Haqlı idi: tipik ingilis mətnində təxminən hər səkkiz hərfdən biri `E`-dir, `Z` isə ondan təxminən 170× nadirdir. ASCII bunların hamısına göz yumur — sabit qiymət, hərəyə 8 bit (6-cı Dərs). Masada açıq-aşkar pul var.

Amma dəyişən uzunluqlu kodların bir tələsi var. Ən tənbəl sxemi sınayın: `E = 0`, `T = 1`, `A = 01`. İndi gələn `01` bitlərini dekod edin. Bu `ET`-dir, yoxsa `A`? Axın demir — və hərflər arasında fasilə verən Morze operatorlarından fərqli olaraq faylda fasilə yoxdur; bitlər fasiləsiz bir çay kimi gəlir. Ayırıcılara əlavə bit xərcləsəniz, qənaəti xərcləmisiniz.

Çıxış yolu **prefix-free** adlanan xassədir: *heç bir kod başqa bir kodun prefiksi ola bilməz.* Əgər `0` tam koddursa, başqa heç nə `0` ilə başlaya bilməz. Prefix-free axına ayırıcı lazım deyil, çünki hər kod sözü öz sonunu özü elan edir: bitləriniz bir koda uyğan gəldiyi an o kod bitib — zəmanətlə. Bu xassəyə hər gün etibar edirsiniz: beynəlxalq telefon kodları qəsdən prefix-free qurulub — `+1` Şimali Amerikadır, ona görə başqa heç bir ölkə kodu 1 ilə başlamır — telefonunuz ölkə kodunun harada bitdiyini "hazır" düyməsi olmadan məhz belə bilir.

Deməli Fano-nun verdiyi məsələ "ümumi simvollara qısa kodlar"dan daha itidir: **tezliklər verildikdə, ümumi uzunluğu minimum olan prefix-free kodu tap.** Onun öz üsulu (Shannon-unku da) yuxarıdan-aşağı işləyirdi — simvolları tezlikcə təxminən bərabər iki yarıya böl, bir tərəfə `0`, o biri tərəfə `1` ver, təkrarla. İntuitiv — və *həmişə optimal deyil* — məsələnin 1951-də hələ də açıq qalmasının səbəbi elə bu idi.

Huffman-ın parıltısı istiqaməti çevirmək oldu: yuxarıdan bölmə — **aşağıdan birləşdir.** İstənilən optimal həlldə ən nadir iki simvol ən uzun iki kodu alacaq; elə isə onları qardaş elə, tezliyi cəmlərinə bərabər olan bir birləşmiş simvola yapışdır və tək düyün qalana qədər təkrarla. O düyün kod ağacının köküdür və budaqlarından oxunan kodlar sübutla ən yaxşısıdır.

Əzbərləməyə dəyən bir sətir üzərində işə baxın — `ABRACADABRA`, 11 hərf:

```
tezliklər:   A:5   B:2   R:2   C:1   D:1

addım 1  ən nadir ikisini birləşdir:  C:1 + D:1  →  (CD):2
         hovuz:  A:5   B:2   R:2   (CD):2

addım 2  ən nadir ikisini birləşdir:  R:2 + (CD):2  →  (RCD):4
         hovuz:  A:5   B:2   (RCD):4

addım 3  birləşdir:  B:2 + (RCD):4  →  (BRCD):6
         hovuz:  A:5   (BRCD):6

addım 4  birləşdir:  A:5 + (BRCD):6  →  kök:11    ✓ bütün 11 hərf yerində
```

Birləşmələri ağac kimi çəkin, hər sol budağa `0`, hər sağ budağa `1` yazın — hər hərfin kodu kökdən yarpağa gedən yoldur:

<Diagram name="compression/huffman_tree" height={410} width={720} alt="A Huffman tree for the word ABRACADABRA, drawn with the root at the top labeled 11. Every left edge is labeled 0 and every right edge is labeled 1. The root's left child is the leaf A with count 5; its right child is an internal node with count 6. That node's left child is the leaf B with count 2, and its right child is an internal node with count 4. That node's left child is the leaf R with count 2, and its right child is an internal node with count 2, whose children are the leaves C with count 1 and D with count 1. Under each leaf its final code appears in accent color: A is 0, B is 10, R is 110, C is 1110, D is 1111. A panel on the right lists the codes with their costs — A 0 for 1 bit times 5 uses, B 10 for 2 bits times 2 uses, R 110 for 3 bits times 2, C 1110 for 4 bits times 1, D 1111 for 4 bits times 1 — summing to a 23 bits total highlighted in accent color. The rarest letters sit deepest in the tree; the most common letter sits one step from the root.">

Nadir hərflər dərinə batır və uzun kodlar ödəyir; çempion `A` kökdən bir budaq aralıda oturur və tək bir bit ödəyir. Dərinlik elə *qiymətdir*.

</Diagram>

Hesabı yekunlaşdıraq:

```
A = 0       1 bit  × 5 istifadə =  5 bit
B = 10      2 bit  × 2          =  4
R = 110     3 bit  × 2          =  6
C = 1110    4 bit  × 1          =  4
D = 1111    4 bit  × 1          =  4
                          cəmi  = 23 bit

ASCII qiyməti: 11 hərf × 8 = 88 bit  →  Huffman 3.8× kiçikdir ✓
```

Prefix-free xassəsi isə avtomatik, pulsuz alındı: hərflər yalnız ağacın *yarpaqlarında* yaşayır və bir yarpaqdan keçib başqa yarpağa gedə bilməzsiniz — deməli heç bir kod başqasını başlada bilməz. Dekod sadəcə gəzintidir: kökdən başla, hər gələn biti izləyərək aşağı düş, yarpağa çatanda hərfini yaz və kökə tullan. Budur kodlanmış `ABRACADABRA` — 23 bit, ayırıcısız, birmənalı:

```
axın:    0 10 110 0 1110 0 1111 0 10 110 0     (aralıqlarla göstərilib; diskdə
         01011001110011110101100                fasiləsiz 23-bitlik bir çaydır)

dekod:   0            yarpağa çatır  →  A
         1,10         yarpağa çatır  →  B
         1,11,110     yarpağa çatır  →  R
         0                           →  A
         1,11,111,1110               →  C
         ...və beləcə...             →  ABRACADABRA  ✓
```

<Note>

Birləşmələri özünüz aparsanız, *fərqli* bir ağac qura bilərsiniz — 2-ci addımda `B`-ni `R` ilə birləşdirmək eyni dərəcədə qanuni idi. Bərabərliklər fərqli kodlu bir neçə düzgün ağaca imkan verir, amma hər biri düz 23 bit edir. Huffman-ın zəmanəti formaya yox, *xərcə* aiddir.

</Note>

Bu balaca maşın hesablama tarixinin ən çox icra olunan alqoritmlərindəndir. Faks standartının "ümumi run-uzunluqlarına qısa kodlar"ı Huffman kodlaşdırmasıdır. JPEG-in son mərhələsi — 36 MB şəklinizin kvantlanmış sağ qalanlarını 3 MB-a qablaşdırmaq — Huffman kodlaşdırmasıdır; bununla 7-ci Dərsin müəmması rəsmən bağlanır. MP3 onunla bitir; iki bölmə irəlidəki DEFLATE də onunla bitir. Toxuma sxeminin də ən çox işlənən iki ilməsini `k` və `p` yazıb nadir manevrlərə uzun adlar verməsinin səbəbi budur: notasiya qiyməti tezliyə görə qoyub — bir əsr erkən.

<DeepDive>

#### Aşağıdan-yuxarı yuxarıdan-aşağını niyə üstələyir {/*why-bottom-up-beats-top-down*/}

Professorun üsulunun tələbəninkinə uduzduğu konkret hal. Beş simvol, tezliklər `A:15  B:7  C:6  D:6  E:5` (cəmi 39). Shannon–Fano yuxarıdan-aşağı balanslı yarılara bölür — `{A,B}` (22) qarşı `{C,D,E}` (17) — sonra təkrarlayır: `A=00, B=01, C=10, D=110, E=111`. Xərc: 15×2 + 7×2 + 6×2 + 6×3 + 5×3 = **89 bit**. Huffman aşağıdan birləşdirir — `E+D`, sonra `C+B`, sonra cütlərin cütü, `A` axırda qoşulur — `A=0`-ın bir bit ödədiyi əyri bir ağac: 15×1 + 7×3 + 6×3 + 6×3 + 5×3 = **87 bit**. 39 simvolda iki bit xırda görünür; giqabayt miqyasında meqabaytlardır, daha vacibi isə "pis deyil" ilə *sübutla keçilməz* arasındakı fərqdir.

Dərin səbəb: yuxarıdan bölən, ən az bildiyi anda ən nəticəli kəsimə imza atmalı olur — `A`-nın taleyini aşağıdakı incə quruluşu görmədən həll edir. Aşağıdan birləşdirən risklərini *ən ucuz* simvollarda götürür, səhvin ən az yandırdığı yerdə; bahalı simvollara çatanda düzgün seçim artıq məcburidir. Huffman sonralar deyirdi ki professorunun özünün bu məsələ ilə çabaladığını bilsəydi, bəlkə heç cəhd etməzdi — tələbələrə nəyin qeyri-mümkün sayıldığını deməməyin xeyrinə tarixin ən yaxşı arqumentlərindən biri.

</DeepDive>

## LZ77: heç nəyi iki dəfə demə {/*lz77-never-say-it-twice*/}

Huffman kodlaşdırmasının kor nöqtəsi var: ona min hərflik `ABABABAB...` verin. Tezlik cədvəli deyir: 50% `A`, 50% `B`; Huffman hərəyə bir bit verir — ASCII üzərində 8× qələbə — və razı halda dayanır. Amma *siz* o sətri on-on iki simvolla təsvir edə bilərsiniz: "AB, beş yüz dəfə." Tezliklər yaddaşsızdır — simvolları sayır, *sıralarını* unudur — ona görə Huffman kodlayıcısı `the ` sözünün hər dəfə bütöv bir vahid kimi gəldiyini, əksər datanın durmadan özündən sitat gətirdiyini görə bilmir.

1977-ci ilin mayında Hayfadakı Technion-dan Abraham Lempel və Jacob Ziv çarəni dərc etdilər — *A Universal Algorithm for Sequential Data Compression*, əbədi adı ilə **LZ77** — bir cəsarətli ideya üzərində: **bir mətn üçün ən yaxşı lüğət mətnin özüdür.** Sıxışdırıcı artıq yazdığı byte-lardan ibarət bir **pəncərə** saxlayır və hər addımda soruşur: *növbəti byte-lar pəncərədə artıq varmı?* Varsa, təkrar yazma — **geri-istinad** yaz: `(məsafə, uzunluq)` cütü, yəni "*məsafə* qədər geri get, *uzunluq* qədər kopyala." Yoxdursa, byte-ı adi **literal** kimi yaz və davam et.

Altı məşhur söz üzərində işinə baxın:

```
mövqe:     0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
giriş:     t  o  ␣  b  e  ␣  o  r  ␣  n  o  t  ␣  t  o  ␣  b  e

kursor 13-ə çatır. növbəti byte-lar:  t o ␣ b e
pəncərəni axtar:                      0–4 mövqelərində  t o ␣ b e   ← uyğunluq!

yaz:  (13 geri, 5 kopyala)

çıxış:  t o ␣ b e ␣ o r ␣ n o t ␣ (13,5)     13 literal + 1 kopyalama tokeni ✓
```

<Diagram name="compression/lz77_window" height={250} width={720} alt="The eighteen characters of the phrase 'to be or not to be' drawn as a row of monospace cells, with spaces shown as small middle dots, and position numbers 0 and 13 marked under the corresponding cells. The first five cells, holding 't o space b e', are outlined in accent color and labeled 'already written — the window'. The last five cells, also 't o space b e', are filled with translucent accent color and labeled 'being encoded'. A curved arrow arcs from the last five cells back to the first five, labeled 'go back 13, copy 5'. Below the row, the emitted output is shown: thirteen literal characters followed by a single accent-colored token (13,5).">

İkinci "to be" heç vaxt saxlanmır — yalnız birinciyə gedən yol göstərişi. Təkrar *koordinatlara* çevrilir.

</Diagram>

Xərc yoxlaması, təxminən DEFLATE-in qiymətləri ilə — literal ≈ 1 byte, kopyalama tokeni ≈ 3: ifadə 18 byte-dan 16-ya düşür. Təvazökar, çünki ifadə balacadır; iqtisadiyyat miqyasla partlayır. Real mətndə hər təkrarlanan söz və cümlə naxışı ilk görünüşündən sonra bir balaca tokenə çökür — bir neçə abzas sonra bu modulun öz dərslərinin 61% kiçilməsi də bundandır, *şablonlu* datanın (HTML, JSON, loglar — eyni teqlər minlərlə dəfə) vəhşicəsinə yaxşı sıxışması da.

İndi LZ77-nin adını eşidənləri onu başa düşənlərdən ayıran detal. Hələ cəmi *iki* byte mövcud ikən `(məsafə 2, uzunluq 3)` nə deməkdir — çatdığı məsafədən uzun bir kopyalama? Bu qanunidir və alqoritmin ən gözəl hiyləsidir. Qayda: **bir-bir byte** kopyala — token başlayanda mövcud olmayan byte-lara ehtiyac yarananda, onları artıq elə tokenin özü yaratmış olur:

```
tokenlər:  b   a   n   (2,3)

dekod:   b                          → "b"
         a                          → "ba"
         n                          → "ban"
         (2,3): 3 byte kopyala, hər biri 2 mövqe geridən
           addım 1: 2 geri = 'a'    → "bana"
           addım 2: 2 geri = 'n'    → "banan"
           addım 3: 2 geri = 'a'    ← elə bu tokenin özünün yaratdığı byte!
                                    → "banana"  ✓
```

Token cümləsinin ortasında *özündən* sitat gətirir. Bir də `(məsafə 1, uzunluq N)`-in mənasına baxın: "əvvəlki byte-ı N dəfə təkrarla" — bu, dəqiq run-length encoding-dir. RLE heç vaxt rəqib alqoritm deyilmiş; təkrarın təsadüfən yanaşı olduğu LZ77 xüsusi halıdır. Toxuma sxemi bunu da bilirdi: `k12` məsafə-1 kopyalamasıdır, *"3–8-ci sıraları daha beş dəfə təkrarla"* isə tam bir geri-istinaddır — məsafə və uzunluq, CPU-lar üçün yox, əllər üçün yazılmış.

Oxumaq yetər — hadisəni *törədin*. Aşağıdakı oyuncaq yazdığınız hər şeyin üzərində əsl (kiçik pəncərəli) LZ77 işlədir: literallar adi simvol kimi çap olunur, hər kopyalama tokeni mavi `↩məsafə,uzunluq` çipi kimi görünür. Özünüzü təkrarlayın və tokenlərin mətninizi yeməsinə baxın; sonra **təsadüfi küy** düyməsini basın və alqoritmin ac qalmasını izləyin:

<Sandpack>

```js
import { useState } from 'react';

const CHANT =
  'nağara bum vurur, nağara bum vurur, nağara bum vurur, ' +
  'camaat coşur, camaat coşur.';

function compress(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    let len = 0, dist = 0;
    for (let j = Math.max(0, i - 255); j < i; j++) {
      let k = 0;
      while (k < 255 && i + k < text.length && text[j + k] === text[i + k]) k++;
      if (k > len) { len = k; dist = i - j; }
    }
    if (len >= 4) { tokens.push([dist, len]); i += len; }
    else { tokens.push(text[i]); i += 1; }
  }
  return tokens;
}

export default function LZLab() {
  const [text, setText] = useState(CHANT);
  const tokens = compress(text);
  const copies = tokens.filter((t) => typeof t !== 'string').length;
  const packed = tokens.length - copies + copies * 3;
  const saved = text.length - packed;
  const noise = () =>
    setText(Array.from({ length: 100 }, () =>
      'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    ).join(''));
  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <p>Yazın — özünüzü təkrarlayın, kopyalama tokenləri mətni yesin:</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        rows={3} style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }} />
      <div style={{ margin: '8px 0' }}>
        <button onClick={() => setText(CHANT)} style={{ marginRight: 8 }}>
          nəqarət
        </button>
        <button onClick={noise}>təsadüfi küy</button>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 1.9,
        wordBreak: 'break-all' }}>
        {tokens.map((t, i) => typeof t === 'string' ? (
          <span key={i}>{t === ' ' ? '\u00B7' : t}</span>
        ) : (
          <span key={i} style={{ background: '#087ea4', color: 'white',
            borderRadius: 6, padding: '1px 6px', margin: '0 2px',
            fontSize: 12, whiteSpace: 'nowrap' }}>
            {'\u21A9'}{t[0]},{t[1]}
          </span>
        ))}
      </div>
      <p style={{ fontFamily: 'monospace' }}>
        {text.length} byte {'\u2192'} {packed} byte{' '}
        <span style={{ color: '#087ea4' }}>
          (qənaət: {saved}{saved === 0 ? ' — heç nə təkrarlanmır' : ''})
        </span>
      </p>
      <p style={{ fontSize: 13, color: '#888' }}>
        Literal 1 byte-a başa gəlir; hər {'\u21A9'}məsafə,uzunluq tokeni 3
        sayılır və yalnız uyğunluq özünü ödəyəcək qədər uzun olanda yazılır —
        əsl DEFLATE də eyni qaydayla oynayır.
      </p>
    </div>
  );
}
```

</Sandpack>

<DeepDive>

#### GIF vergisi: alqoritm vəkil tutanda {/*the-gif-tax*/}

Lempel və Ziv 1978-də davamını dərc etdilər (LZ78 — lüğət açıq cədvəl kimi), 1984-də isə Sperry-dən Terry Welch onu **LZW**-yə cilaladı: sürətli, zərif və — ən əsası — *patentli*, 20 iyun 1983-də ərizə verilmişdi. Dərc olunmuş alqoritmi azad sayan CompuServe mühəndisləri 1987-də GIF şəkil formatını LZW üzərində qurdular və gənc veb GIF-i hər yerə yaydı. Sonra, 1994-cü ilin dekabrının son günlərində, Unisys (Sperry-nin varisi) və CompuServe elan etdilər ki GIF oxuyan və ya yazan proqramlar lisenziya haqqı borcludur. Developer dünyası partladı — epizod *GIF vergisi* kimi yadda qaldı — nəticədə bir etiraz bayramı doğdu, **Burn All GIFs Day** (5 noyabr 1999), və daha davamlı bir şey: 1996-cı ildə tamamlanan, LZW əvəzinə DEFLATE üzərində qurulmuş, qəsdən patentsiz bir şəkil formatı. Adı **PNG**-dir və indiyədək gördüyünüz hər PNG bir lisenziya məktubuna görə mövcuddur. gzip-in mənşəyi də eynidir: Jean-loup Gailly və Mark Adler onu 1992-də LZW əsaslı Unix `compress`-i əvəz etmək üçün yazdılar. Patent 20 iyun 2003-də bitdi — ərizədən düz iyirmi il sonra — mühəndislər şənlik qurdular. Nəticə texniki kursda qəribə görünsə də hər mühəndisin başında olmalıdır: **alqoritm seçimi bəzən hüquqi qərardır** və formatlar onları formalaşdıran məhkəmələrdən uzun yaşayır.

</DeepDive>

## DEFLATE: ZIP əslində necə qurulur {/*deflate-how-a-zip-is-actually-built*/}

LZ77-nin çıxardığına baxın: literallar və kopyalama tokenlərindən ibarət bir axın. Bu simvollar bərabər tezliklidirmi? Heç yaxın deyil — literallarda `e`, `t` və boşluq hökm sürür; qısa uyğunluq uzunluqları uzunları qat-qat üstələyir; bəzi məsafələr durmadan təkrarlanır. Əyri tezlikli bir axın... bunun üçün əlinizdə alqoritm var. LZ77-nin çıxışını *Huffman kodlaşdırmasına* verin — hər iki artıqlıq növü, təkrar da, tezlik də, bir boru xəttində sıxılsın. O boru xəttinin adı **DEFLATE**-dir.

<Diagram name="compression/deflate_pipeline" height={250} width={720} alt="A three-stage pipeline drawn left to right. Stage one is a box holding the raw monospace text 'to be or not to be', labeled 'raw bytes'. An arrow labeled 'LZ77 — find repeats' leads to stage two, a box holding the token stream: the literals t, o, space, b, e, space, o, r, space, n, o, t, space followed by an accent-colored copy token (13,5), labeled 'literals + copy tokens'. A second arrow labeled 'Huffman — shorten symbols' leads to stage three, a box holding a short run of bits, labeled 'DEFLATE stream'. Attached to the third box is a small tag reading 'code tables travel in the header'.">

DEFLATE = *təkrar* üçün LZ77, sonra *tezliklər* üçün Huffman — fərdi kod cədvəlləri isə hər blokun başlığında göndərilir: fayl öz deşifrə açarını özü daşıyır.

</Diagram>

O son detal bu modulun ən köhnə motivinin təzə paltarıdır. Huffman cədvəlləri hər blok üçün real tezliklərdən fərdi qurulur, deməli sıxışdırılmış bitlər onlarsız mənasızdır — DEFLATE də cədvəlləri blokun başlığına yazır. Özəl müqavilə idarə etdiyi byte-larla birgə səyahət edir — toxuma sxeminin başındakı `k` ilə `p`-ni tərif edən açıqlama kimi. Byte-ların mənası yoxdur; müqavilələrin var — və sıxışdırılmış fayl tanış olduğunuz ilk formatdır ki, *öz içində* fərdi müqavilə daşıyır.

Saxlamalı iki spesifikasiya ədədi (RFC 1951): pəncərə **32,768 byte**-dır — kopyalamalar ən çox 32 KiB geri çata bilər — bir kopyalama tokeni isə **3-dən 258 byte-a** qədər əhatə edir. Bu hədlər DEFLATE-in tavanını qoyur: ən yaxşı halda ~2 bitlik token 258 byte-lıq kopyalamaya əmr verir, nisbəti **1032:1**-də kilidləyir. Açılış eksperimentimizlə tutuşdurun — bir milyon sıfır 1,003 byte olmuşdu, nisbət ≈ 997:1, tavana sürtünür. Bir milyardda da keçərlidir:

<TerminalBlock>

head -c 1000000000 /dev/zero | gzip > gig.gz && gzip -l gig.gz

</TerminalBlock>

<TerminalBlock>

         compressed        uncompressed  ratio uncompressed_name
             970501          1000000000  99.9% gig

</TerminalBlock>

Bir giqabayt sıfır: 970,501 byte — 1030:1. 1032 ədədini yadda saxlayın; son bölmə kiminsə bu tavanın *o üzünə* tikinti aparanda nə olduğu haqqındadır.

İndi tarix — DEFLATE-in insan hekayəsi var. 1980-ci illərin sonlarına qədər onlayn dünyanın arxiv formatı ARC idi və Milwaukee-li proqramçı **Phil Katz** onun daha sürətli klonunu yazdı: PKARC. 1988-də ARC-ın yaradıcıları, System Enhancement Associates, məhkəməyə verdi — klon bir az *həddindən artıq* sadiq idi, şərhlərdəki eyni orfoqrafik səhvlərə qədər — barışıq sazişi Katz-a 1989-un yanvarından sonra ARC-uyğun proqram qadağan etdi. Küncə sıxışdırılan Katz həftələr içində öz dizaynı olan yepyeni formatla **PKZIP (1989)**-u buraxdı, sonra növbəti qırx ili həll edən addımı atdı: tam spesifikasiyanı `APPNOTE.TXT` adlı faylda dərc etdi və formatı **istəyən hər kəsə, əbədi olaraq azad** elan etdi. Açıq format mülkiyyətçini aylar içində əzdi. PKZIP 2 (1993) DEFLATE metodunun özünü gətirdi, sonradan RFC 1951 (1996) kimi mismarlanmış — amma formatı dünyanı fəth etdikcə Katz-ın öz həyatı çökürdü; 14 aprel 2000-də, 37 yaşında vəfat etdi. Monoqramı isə çökmədi. ZIP-in sehrli ədədi — 1-ci Dərs üslubunda müqavilə etiketi, Java-nın `CAFEBABE`-inin əmisi oğlu — `0x50 0x4B`-dir: ASCII-də, **PK**. Əlinizdəki istənilən ZIP-i yoxlayın:

<TerminalBlock>

xxd -l 4 lessons.zip

</TerminalBlock>

<TerminalBlock>

00000000: 504b 0304                                PK..

</TerminalBlock>

Phil Katz-ın inisialları bəşəriyyətin disklərinə gündə milyardlarla dəfə yazılır — çünki "ZIP" `.zip`-dən qat-qat çoxu deməkdir. `.docx` XML fayllarının ZIP-idir; `.xlsx`, `.pptx`, `.jar`, `.apk` və `.epub` da elə — birini `.zip`-ə adlandırın, açılır. DEFLATE isə konteynerdən büsbütün qaçıb: **gzip** (1992) onu Unix üçün bükdü, **zlib** (1995, yenə Gailly və Adler) kitabxanaya çevirdi və bu gün o, ötürülmə zamanı veb səhifələrin əksəriyyətini (`Content-Encoding: gzip`), hər PNG-nin piksellərini, PDF axınlarını və hər git repozitoriyasındakı hər obyekti sıxışdırır. Bu gün DEFLATE-i bircə dəfə də istəmədən minlərlə dəfə işlətmisiniz.

Yanında kimin getdiyinə də baxın: gzip-in sonluğu açılmış datanın CRC-32-sini daşıyır, ZIP hər fayla birini yazır — 8-ci Dərsin mexanizmi bu dərsin çıxışını qoruyur, çünki sıxışdırılmış datada çevrilən tək bit bir byte-ı korlamır, aşağı axındakı hər kopyalama tokenini relsdən çıxarır. Hər iki dərsi bir komandada izləyin: bu modulun səkkiz ingiliscə dərsi, `lessons.txt`-yə birləşdirilib zip-lənmiş halda —

<TerminalBlock>

zip -q lessons.zip lessons.txt && unzip -v lessons.zip

</TerminalBlock>

<TerminalBlock>

 Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
--------  ------  ------- ---- ---------- ----- --------  ----
  232654  Defl:N    90684  61% 2026-07-21 13:34 d3e18b84  lessons.txt

</TerminalBlock>

Bütün dərs bir sətirdə: `Defl:N` (artıq başa düşdüyünüz metod), **dürüst ingilis mətninin 61%-i buxarlandı** — 232,654 → 90,684 byte, hər `the` və hər təkrarlanan cümlə naxışı geri-istinadlara və qısa kodlara çökdü — CRC-32 barmaq izi isə keşikdə. Terminal yoxdur? Brauzeriniz də DEFLATE daşıyır:

```js
const bytes = new TextEncoder().encode('to be or not to be, '.repeat(500));
const packed = await new Response(
  new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
).arrayBuffer();
console.log(`${bytes.length} bytes in, ${packed.byteLength} bytes out`);
```

<ConsoleBlock level="info">

10000 bytes in, 80 bytes out

</ConsoleBlock>

On min byte-lıq təkrar-təkrar Hamlet: 80 byte, 125:1 nisbət — hər iki maşının işini eşidə bilərsiniz: LZ77 beş yüz təkrarı kopyalama tokenləri zəncirinə endirir, Huffman qalanı qiymətləndirir.

## Divar: niyə hər şeyi sıxışdırmaq olmaz {/*the-wall-why-you-cant-compress-everything*/}

Burada təhlükəli bir fikir doğur — 1989-dan bəri hər yeni başlayanın ağlına gələn eyni fikir: *ZIP bir dəfə kiçiltdisə, ZIP-i zip-lə — və heçliyə qədər davam et.* Fikir bir diaqrama sığacaq qədər qısa və heç bir gələcək alqoritmin qaça bilməyəcəyi qədər qəti bir sayma arqumentində ölür.

3-bitlik faylları sayın: 2³ = 8 dənədir. İndi bütün *ciddi qısa* faylları sayın — sıxışdırıcının onları çevirə biləcəyi bütün mümkün çıxışları: bir boş fayl, iki 1-bitlik, dörd 2-bitlik. Cəmi: 1 + 2 + 4 = **7**. Bu cəmi tanıyırsınız — 2-ci Dərsin eyniliyi, 2ⁿ − 1, *yenə* bir əskik gəlir:

<Diagram name="compression/pigeonhole" height={370} width={720} alt="Two columns of monospace boxes. The left column, headed 'every 3-bit file — 8 of them', lists all eight strings 000, 001, 010, 011, 100, 101, 110, 111. The right column, headed 'every shorter file — only 7', lists the empty string shown as a pair of quotes, then 0, 1, 00, 01, 10, 11. Seven muted arrows connect the first seven left boxes to the seven right boxes one-to-one. The eighth left box, 111, is tinted in danger color, and its arrow leads to a dashed empty slot marked with a danger-colored question mark and the label 'no shorter name left'. A caption below reads: 1 plus 2 plus 4 equals 2 cubed minus 1.">

Səkkiz orijinal, yeddi mümkün qısa versiya. Hansısa orijinal *mütləq* paysız qalır — ya da iki orijinal bir sıxışdırılmış faylı bölüşür, onda heç bir açıcı onları ayıra bilməz.

</Diagram>

Sübutun hamısı budur və miqyaslanır: istənilən n uzunluğu üçün 2ⁿ fayl var, amma cəmi 2ⁿ − 1 qısa təsvir. Deməli **heç bir itkisiz alqoritm hər girişi kiçildə bilməz** — bəzi faylları kiçildən istənilən sıxışdırıcı başqalarını *mütləq* böyütməlidir; hesabın gedəcəyi başqa yer yoxdur. gzip-in təsadüfi datadakı +173 byte-ı aradan qaldırılası qüsur deyildi; sayma arqumentinin öz haqqını yığması idi.

Kiçiləni kiçilməzdən ayıran **entropiyadır** — həqiqi sürpriz bitləri. Artıq data öz entropiyasından xeyli yuxarıda oturur; təsadüfi data elə öz entropiyasıdır, çıxarılası heç nə qalmayıb. Shannon 1951-də ingilis dilinin özünü ölçdü — insanlara mətni hərf-hərf təxmin etdirməklə: hərfə təxminən **bir bit informasiya** (hədləri: 0.6-dan 1.3-ə). 8-bitlik ASCII ilə saxlananda ingilis mətni prinsipcə demək olar 90% artıqlıqdır — dərslərimizi 2.6× sıxan kimi ümumi-təyinatlı alətlər isə bundan xeyli geridə dayanır, nisbəti sürətə dəyişərək.

Divarın sizi əsl xəcalətdən qurtaracaq bir nəticəsi var: **sıxışdırılmış çıxış təsadüfi görünür.** gzip-in çıxışında hər hansı naxış sağ qalsaydı, gzip ondan istifadə edərdi — deməli borudan çıxan sıx, naxışsız, entropiyada olan datadır. Yəni sıxışdırılmış fayllar özləri sıxışdırıla bilməzdir; ilan öz quyruğunu yeyə bilmir:

<TerminalBlock>

wc -c lessons.txt && gzip -k lessons.txt && wc -c lessons.txt.gz && gzip -c lessons.txt.gz > twice.gz && wc -c twice.gz

</TerminalBlock>

<TerminalBlock>

232654 lessons.txt
90714 lessons.txt.gz
90762 twice.gz

</TerminalBlock>

Birinci keçid: 61% getdi. İkinci keçid: **48 byte artdı.** Eyni tale istənilən artıq-sıxışdırılmış girişi gözləyir — JPEG, MP3, MP4, PNG: 7-ci Dərsin formatları onsuz da atıb qablaşdırıb, byte-ları ZIP-inizə əvvəlcədən sıxlaşdırılmış, verəcək heç nəyi qalmamış halda gəlir.

<Pitfall>

**"Sıxışdırma 10× kiçiltdi — deməli iki dəfə işlətsəm 100× kiçildər."**

Kiçiltməz; ikinci keçid faylı *böyüdür* (yuxarıda ölçüldü: +48 byte), çünki birinci keçid proqnozlaşdırıla bilənliyi artıq çıxarıb, geriyə praktiki təsadüfi çıxış qalıb. Eyni məntiq sənayedəki ən yayğın sıxışdırma məyusluğunu izah edir: şəkil və video qovluğunu zip-ləyib ~0% qazanmaq. O fayllar onsuz da sıxışdırılıb; ZIP yalnız üstəlik xərc əlavə edə bilər. Hələ artıq olanı sıxışdırın — mətn, loglar, JSON, CSV, verilənlər bazaları — olmayanı isə *olduğu kimi saxlayın*.

</Pitfall>

İdeyanın son bir dönüşü — və bu, növbəti dərsin qapısıdır: sıxışdırıla bilməzlik təsadüfi datanın sadəcə bezdirici xassəsi deyil — bəlkə də təsadüfiliyin ən yaxşı *tərifidir*. İstismar edilə bilən naxışı olan ardıcıllıq tam təsadüfi deyil; istismar edilə bilən naxışı olmayan ardıcıllıq sıxışdırıla bilmir. gzip, sən demə, kobud bir təsadüfilik detektorudur. Bu fikri bir bölmə də saxlayın.

## 42 kilobyte hücuma keçəndə {/*when-42-kilobytes-attack*/}

İndiyədək hər şey kiçik faylı məqsəd sayırdı. İndi perspektivi çevirin — hücumçu kimi: sıxışdırılmış fayl data deyil — **data istehsalı üçün təlimatlardır** və qısa bir təlimat nəhəng bir çıxışa əmr verə bilər. "1 geri get, 258 kopyala" 258 byte yaradan ~2 bitdir. Bunu miqyaslamağın edə biləcəyi ən pisi nədir?

Məşhur bir cavab var, 2001-ci ilin iyunundan əvvəldən dolaşan: **42.zip**. 42 kilobyte-dır — bu səhifənin HTML-indən kiçik. İçində 16 ZIP faylı var, hərəsinin içində 16 ZIP, beş qat dərin; ən dibdə 16⁵ = 1,048,576 arxiv oturur, hər biri **4,294,967,295 byte**-lıq fayla açılır. Ədədi tanıdınız? 2³² − 1-dir — silah belə 2-ci Dərsin tavanlarına hörmət edir; bu, 32-bitlik sahənin ifadə edə biləcəyi ən böyük ölçüdür. Vurub-cəmləyəndə 42 KB təxminən **4.5 petabyte**-a partlayır — təqribən 4,500 bir-terabaytlıq disk — yüz milyardda bir nisbət.

Bayaq DEFLATE-in 1032:1-də tavanlandığını sübut etmədikmi? Hər *qat* tavanlanır. Qatlama isə qatları vurur — 1000× üstündə 1000× üstündə 1000×: eksponensial artım, 2-ci Dərsin şahmat taxtası hücumda. 2019-cu ildə isə tədqiqatçı David Fifield göstərdi ki qatlama heç lazım da deyil: qeydləri *üst-üstə mindirməklə* — bir milyona qədər kataloq qeydi sıxışdırılmış byte-ların bir ortaq blokuna işarə edir — klassik ZIP formatının içində 10 MB-ı 281 TB-a çevirən yastı bir arxiv qurdu — 28,000,000:1-dən çox — formatın 64-bit genişlənməsi ilə isə 46 MB-ı 4.5 PB-a. Bir dövrə açılma; skanerin görəcəyi rekursiya yoxdur.

Kim zərər çəkir? Tarixən, məhz sizi qorumaq üçün qurulan alətlər: antivirus skanerləri arxivlərin içinə baxmağa *məcburdur* — qoşmaları sadəlövhcəsinə açan bir poçt şlüzünə 42 KB verib 4.5 PB maddiləşdirməsini istəmək olar. Eyni tələ istifadəçi yükləmələrini avtomatik açan hər şeyi gözləyir — thumbnail-çılar, import pipeline-ları, CI sistemləri, sıxışdırılmış sorğu gövdələri qəbul edən veb serverlər.

<Pitfall>

**"Yükləmə 42 KB-dır — balacadır, emal etmək təhlükəsizdir."**

Sıxışdırılmış ölçü çıxış ölçüsü haqqında heç nə sübut etmir və arxivin *içində bəyan olunan* ölçü sahələri hücumçunun idarə etdiyi byte-lardır, həqiqət deyil — byte-ların mənası yoxdur, müqavilələr isə yalan danışa bilir. Etibarsız hər şeyi açmağın qaydası: buna başqasının təlimatlarını icra etmək kimi baxın — çünki hərfi mənada elə odur — və o təlimatlara büdcə verin. Yazılan byte-lara mütləq tavan, maksimum genişlənmə nisbəti və qatlama-dərinliyi limiti qoyun, çıxışı axınla emal edin ki partlayışın ortasında dayana biləsiniz. Hər ciddi açma kitabxanası bu limitləri təklif edir; hadisələr onları heç kimin yandırmadığı yerlərdə baş verir.

</Pitfall>

Sonda xoş bir simmetriya var. 8-ci Dərs sizə saxlamanın təhlükəsinin *səssiz yanlış data* olduğunu öyrətdi; bu dərs tamamlayıcısını əlavə edir — tamamilə düzgün olan, amma bomba kimi gələn data. Çıxarılan artıqlıq həm qazanılan yerdir, həm də verilən rıçaq. Mühəndislik, həmişəki kimi, alverin hansı tərəfində durduğunu seçməkdir.

<Recap>

- Sıxışdırma **artıqlığı** çıxarır — datanın proqnozlaşdırıla bilən hissəsini, datanın özünü yox. Bir milyon sıfır byte gzip-lə 1,003 byte olur; bir milyon təsadüfi byte 173 byte *artıq* qayıdır.
- **Run-length encoding** run-ları saylarla əvəz edir: faks sətrində 3.5×, amma "Hello, world!"-ü az qala *ikiqat* böyüdür — yanaşı təkrar nadirdir, əsl hədəflər **tezlik** və **ifadə-səviyyəli təkrardır**.
- **Huffman kodlaşdırması** sübutla optimal **prefix-free** kodu aşağıdan-yuxarı qurur, tək ağac qalana qədər ən nadir iki simvolu birləşdirərək: ümumi simvollar qısa kod alır, ayırıcı lazım olmur, `ABRACADABRA` 88 bitdən 23-ə düşür. 1951-də kurs işi kimi doğulub; işi JPEG, MP3, faks və DEFLATE-in içində bitirir.
- **LZ77** (1977) təkrarları sürüşən pəncərəyə **(məsafə, uzunluq)** geri-istinadları ilə əvəz edir; kopyalamalar öz çıxışlarının üstünə minə bilər (uzunluq > məsafə) — bu da RLE-ni adicə xüsusi hala çevirir. DEFLATE-də pəncərə 32,768 byte-dır, bir token 3–258 əhatə edir.
- **DEFLATE = LZ77 + Huffman**, fərdi kod cədvəlləri hər blokun içində göndərilir — müqavilə data ilə birgə səyahət edir. ZIP-i (Phil Katz, 1989 — sehrli byte-lar `50 4B`, "PK"), gzip-i (1992), PNG-ni (1996) və `.docx`/`.jar`/`.apk`-nı işlədir; 8-ci Dərsin CRC-32-si hər arxivdə gedir. Tək-axın tavanı: **1032:1**.
- **Universal kiçildici yoxdur**: 2ⁿ fayl, cəmi 2ⁿ − 1 qısa ad — nəyisə kiçildən nəyisə böyütməlidir. Entropiya döşəmədir; iki dəfə sıxışdırmaq byte artırır (ölçüldü: +48); onsuz da sıxışdırılmış media kiçilmir.
- Sıxışdırılmış data entropiyadadır və **təsadüfi görünür** — kiçik arxivlər isə partlaya bilir: 42 KB → 4.5 PB (42.zip); heç qatlamasız 46 MB → 4.5 PB (2019). Etibarsız girişi yalnız çıxış tavanı, nisbət tavanı və dərinlik tavanı ilə açın.

</Recap>

<Challenges>

#### Log sətrini sıxışdır {/*compress-the-log-line*/}

100 simvolluq status sətri beş simvoldan bu tezliklərlə istifadə edir: `0` ×50, `1` ×20, `␣` (boşluq) ×15, `E` ×10, `R` ×5. Huffman ağacını əllə qurun (birləşmələri göstərin), düzgün bir kod yazın və ümumi bitləri hesablayın. Sabit-enli kodla (simvola neçə bit lazım olardı?) və ASCII ilə müqayisə edin.

<Hint>

Ən nadir ikisini birləşdir, cəmi hovuza qaytar, tək düyün qalana qədər təkrarla. Sabit-en müqayisəsi üçün: 5 fərqli simvola minimum neçə bit lazımdır? 1-ci Dərsin ⌈log₂ n⌉ naxışı.

</Hint>

<Solution>

Birləşmələr (düzgün sıralardan biri — bərabərliklər başqalarına da imkan verir; cəm dəyişməz):

```
hovuz: 0:50  1:20  ␣:15  E:10  R:5

birləşdir R:5 + E:10      →  (RE):15      hovuz: 0:50  1:20  ␣:15  (RE):15
birləşdir ␣:15 + (RE):15  →  (␣RE):30     hovuz: 0:50  1:20  (␣RE):30
birləşdir 1:20 + (␣RE):30 →  (1␣RE):50    hovuz: 0:50  (1␣RE):50
birləşdir                 →  kök:100  ✓
```

Ağacdan kodları oxuyaq: `0` = `0`, `1` = `10`, `␣` = `110`, `E` = `1110`, `R` = `1111`.

```
0: 1 bit  × 50 = 50      ␣: 3 × 15 = 45      R: 4 × 5 = 20
1: 2 bit  × 20 = 40      E: 4 × 10 = 40
                                      cəmi = 195 bit  ✓
```

Sabit enə ⌈log₂ 5⌉ = 3 bit/simvol lazımdır → 300 bit; ASCII 800 xərcləyir. Huffman: **195 bit** — simvola 1.95 bit, sabit endən 35% aşağı, ASCII-dən 4.1× aşağı. İşi əyrilik gördü: trafikin yarısını 1 bitlə daşıyan bir simvol nadir simvolların uzun kodlarını qat-qat artıqlaması ilə ödəyir.

</Solution>

#### Ayırıcısız dekod et {/*decode-with-no-separators*/}

Bu dərsin `ABRACADABRA` cədvəli ilə (`A=0, B=10, R=110, C=1110, D=1111`) 12-bitlik `111001101111` axınını dekod edin. Sonra bir-iki cümlə ilə izah edin: ayırıcılar *niyə* lazım olmadı — və `A=0` ilə `C=01` cədvəldə birgə olsaydı, konkret nə xarab olardı?

<Solution>

Bitləri gəzin, hər yarpaqdan sonra kökə qayıdaraq:

```
1,11,111,1110  →  C
0              →  A
1,11,110       →  R
1,11,111,1111  →  D        nəticə: CARD ✓  (12 bit, sıfır ikimənalılıq)
```

Ayırıcı lazım deyil, çünki kod **prefix-free**-dir: heç bir kod sözü başqasını başlamır, deməli bitləriniz bir kod sözünə uyğun gəldiyi an o söz *mütləq* tamamlanıb. `A=0` ilə `C=01` birgə yaşasaydı, `0` oxuduqdan sonra `A` yazmaq, yoxsa mümkün `C`-ni gözləmək lazım olduğunu bilməzdiniz — `01` axını iki cür oxunardı və bir yanlış təxmin sonrakı hər şeyi sinxrondan çıxarardı. Prefix-free-lik hər kod sözünə öz sonunu elan etdirən şeydir — telefon-ölkə-kodu xassəsi.

</Solution>

#### Özünü kopyalayan token {/*the-token-that-copies-itself*/}

1-ci hissə: `n, a, (2,4)` LZ77 token axınını addım-addım, bir-bir byte dekod edin. 2-ci hissə: 10 simvolluq `ababababab` sətri üçün 3-tokenli LZ77 kodlaması verin. 3-cü hissə: uzunluğu məsafəsindən *böyük* kopyalamanın niyə bug yox, qanuni olduğunu bir cümlə ilə deyin.

<Solution>

1-ci hissə — kopyalama mənbəyi irəli sürüşüb elə tokenin özünün yazdığı byte-lara girir:

```
n                        → "n"
a                        → "na"
(2,4): 4 kopyala, hər biri 2 geridən
  'n' → "nan"    'a' → "nana"    'n' → "nanan"    'a' → "nanana"  ✓
```

2-ci hissə: `a`, `b`, `(2,8)` — iki literal, sonra "2 geri get, 8 kopyala": bu `abababab`-ı yenidən doğurur və 10 simvolu tamamlayır. ✓

3-cü hissə: qanunidir, çünki açıcı **bir-bir byte** kopyalayır — kopyalama orijinal datanın hüdudunu keçdiyi anda lazım olan byte-ları elə həmin kopyalamanın əvvəlki addımları artıq istehsal edib; token öz çıxışını yeyir — LZ77-nin RLE-ni məsafə = 1 xüsusi halı kimi udması da düz elə budur.

</Solution>

#### JPEG-ləri zip-ləyən PR {/*the-pr-that-zips-jpegs*/}

Transfer tapşırığı. Komanda yoldaşınız *"Saxlama xərclərini kəs: istifadəçi mediasını sıxışdır"* başlıqlı pull request açır. Gecə job-u yüklənən hər `.jpg` və `.mp4`-ü ZIP-ləyir; təsvirdə etiraf olunur ki ölçülmüş qənaət **0.3%**-dir və bunu "sıxışdırmanı iki dəfə işlətməklə" düzəltmək təklif olunur. Diff-də ikinci bir detal gözünüzə dəyir: eyni servis thumbnail yaratmaq üçün istifadəçi arxivlərini avtomatik açır — heç bir limitsiz. Code-review şərhini yazın: hər iki problemi dəqiq izah edin, əvəzində nə etməyi təklif edin və hər iddianı bu dərsdən bir ədədlə dəstəkləyin.

<Solution>

Nümunə review şərhi:

*"Dəyişiklik istəyirəm — iki məsələ var, biri israfçı, biri təhlükəli. (1) 0.3% düzəldiləsi bug deyil; gözlənilən nəticədir. JPEG və MP4 onsuz da sıxışdırılmış formatlardır (itkili atma, sonra entropiya kodlaşdırması — ZIP-in işlətdiyi eyni Huffman mexanizmi), byte-ları maksimum sıxlıqda gəlir; itkisiz sıxışdırma entropiyada olan datanı kiçildə bilmir, yalnız konteyner xərci artırır. İki dəfə işlətmək geriyə gedir: ikinci keçid faylı ölçülə bilən dərəcədə böyüdür (90,714 byte-lıq gzip yenidən gzip-lənəndə 90,762 olur — sayma arqumenti bəzi girişlərin böyüməli olduğuna zəmanət verir və sıxışdırılmış data məhz o girişdir). Təklif: medianı olduğu kimi saxlayaq, job-u həqiqətən artıq olana yönəldək — loglarımız, JSON, exportlar; ingilisəbənzər mətn üçün 61% realistik döşəmədir, şablonlu data daha yaxşı verir. (2) Bloklayıcı: thumbnail-çı etibarsız yükləmələri limitsiz açır. Sıxışdırılmış ölçü heç nə sübut etmir — 42.zip 42 KB-dır və ~4.5 PB-a genişlənir, müasir rekursiyasız bombalar isə tək qatda 28,000,000:1 vurur, yəni təkcə dərinlik yoxlaması bizi xilas etmir. Zəhmət olmasa açma yoluna mütləq çıxış tavanı, maksimum genişlənmə nisbəti və qatlama-dərinliyi limiti əlavə edək, axınla açaq ki inflate ortasında dayana bilək — yeri gəlmişkən açmadan sonra hər faylın CRC-32-sini də yoxlayaq."* ✓

Ötürülən naxış: review-dakı sıxışdırma sualları iki yoxlamaya enir — *giriş hələ artıqdırmı?* (deyilsə, sıxışdırma) və *giriş etibarlıdırmı?* (deyilsə, açılmaya büdcə qoy).

</Solution>

</Challenges>

<LearnMore title="Təsadüfilik: PRNG, Toxum, Entropiya" path="/learn/faza-0/modul-0-1/randomness">

gzip `/dev/urandom`-u bircə byte da kiçiltməkdən imtina etdi — bu dərs isə *sıxışdırıla bilməz*-in, bəlkə də, *təsadüfi*-nin əldə olan ən yaxşı tərifi olduğu fikri ilə bitdi. İndi bunun doğurduğu paradoksa baxın: CPU mükəmməl determinist maşındır, hər çıxışı girişləri ilə diktə olunur — bəs kompüter təsadüfiliyi haradan *ala* bilər? Növbəti dərs: onu saxtalaşdıran generatorlar, onu təkrar oynadan toxumlar, "təsadüfi" ədədlərin imkan versəniz niyə təkrarlandığı və Shannon entropiyasının qayıdışı — bu dəfə əməliyyat sisteminizin hərfi mənada yığıb xərclədiyi bir şey kimi.

</LearnMore>
