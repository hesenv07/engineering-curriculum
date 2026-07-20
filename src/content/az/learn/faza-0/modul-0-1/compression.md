---
title: "Sıxışdırma: ZIP Necə İşləyir (Huffman, LZ)"
---

<Intro>

1951-ci ilin payızında MIT-də magistrant David Huffman Robert Fano-nun tədris etdiyi informasiya nəzəriyyəsi kursuna qatılmışdı. Fano tələbələrinə seçim təklif etdi: ya bir çətin məsələni həll edin — simvollar toplusuna ən effektiv ikili kodları necə təyin etmək olar — ya da yekun imtahana girin. Huffman məsələni seçdi. Aylarla üzərində işlədi, heç nəyə çatmadı, qeydlərini atıb imtahana hazırlaşmağa qərar verirdi ki, demək olar təsadüfən elə sadə bir üsul tapdı ki, bu, Fano-nun özünün nəşr etdirdiyi üsulu belə kölgədə qoydu. Fano-nun sxemi kodları yuxarıdan aşağıya qururdu; Huffman-ınkı isə aşağıdan yuxarıya, və isbatlanmış şəkildə optimal idi. Həmin üsul bu gün kompüterinizdəki sıxışdırılmış faylların yarısında yarım-tanıdığınız "H" hərfidir.

</Intro>

<YouWillLearn>

- Sabit uzunluqlu kodlar niyə yer israf edir və dəyişən uzunluqlu kod əvəzində nə qazandırır
- Huffman ağacını əllə necə qurmaq və şaxələrindən optimal kodu necə oxumaq olar
- LZ77 təkrarlanan mətni necə tapıb "geri qayıt və köçür" göstərişi ilə necə əvəz edir
- Niyə DEFLATE — hər ZIP, gzip və PNG faylının içindəki format — sadəcə ardıcıl işləyən LZ77 və Huffman-dır
- Bəzi faylların ümumiyyətlə niyə sıxışdırıla bilmədiyi və bu limitin informasiyanın özü haqqında nə dediyi

</YouWillLearn>

## Düşmən indi hədəfə çevrilir: artıqlıq {/*redundancy-the-enemy-that-becomes-the-target*/}

İki dərs əvvəl öyrəndiniz ki, CRC-32 checksum-u qəsdən artıq bitlər əlavə etməklə işləyir — heç bir yeni informasiya daşımayan, yalnız əvvəlki bitlərin riyazi barmaq izini təşkil edən bitlər. Bu artıqlıq bir üstünlükdür. Bu, 8-ci Dərsdə alıcının zədəni aşkarlamasını necə mümkün etdiyi idi: barmaq izi datayla üst-üstə düşmürsə, yolda nəsə dəyişib.

Bu dərs eyni fikri əks istiqamətdə işlədir. Adi mətn, şəkil və səs də artıqlıqla doludur — amma bu dəfə heç kimin istəmədiyi artıqlıqdır. İngilis mətni eyni bir neçə hərfi dəfələrlə təkrarlayır ("e" hərfi "z"-dən təxminən 8 dəfə tez-tez rast gəlinir). Bir fotonun səması minlərlə demək olar eyni mavi pikseldən ibarətdir, sıra ilə. Bu təkrarların heç biri sizi zədədən qorumur; onlar sadəcə hər dəfə eyni bahalı üsulla kodlanmış israf olunmuş bitlərdir. Sıxışdırma bu israfı tapıb üzərinə daha az bit xərcləmək sənətidir — daşıdığı informasiyanın heç bir hissəsini itirmədən.

Bu "heç bir informasiya itirmədən" şərti önəmlidir. Bu dərs tamamilə **itkisiz sıxışdırma** haqqındadır: orijinal datanı bit-bə-bit dəqiq bərpa edən sxemlər. JPEG və MP3 isə **itkili sıxışdırma** istifadə edir — insan gözünün ya qulağının hiss etməyəcəyi detalları atır, bu isə sonrakı bir dərs üçün fərqli (və xeyli qeyri-müəyyən) bir mübadilədir. ZIP, gzip və PNG — bu dərsin mövzuları — heç vaxt heç nəyi atmır. Sadəcə eyni şeyi daha az bitlə deyirlər.

1948-ci ildə Claude Shannon — 1-ci Dərsdə "bit" sözünü bizə verən 1948-ci il məqaləsinin müəllifi eyni Shannon — adi ingilis mətninin, ASCII hər simvolu kodlamaq üçün tam 8 bit xərcləsə də, simvol başına təxminən yalnız 1 bit faktiki informasiya daşıdığını qiymətləndirdi. Shannon-un qiymətləndirməsi doğrudursa, ASCII kimi saxlanılan ingilis mətni ehtiyacından təxminən 8 dəfə böyükdür. Sıxışdırma bu boşluğu bağlayan mexanizmdir.

<Note>

"Yeni informasiya yoxdur" o demək deyil ki "naxış yoxdur". Təkrarlanan naxış dəqiq olaraq ikinci dəfə göründüyündə heç bir *yeni* informasiya daşımayan şeydir — artıq nə gələcəyini bilirsiniz. Sıxışdırma alqoritmləri, əslində, naxış detektorlarıdır: tutduqları hər təkrar üçün qənaət olunmuş bitlərlə ödənilirlər.

</Note>

## Sabit uzunluqlu kodlar yer israf edir {/*fixed-length-codes-waste-space*/}

Fərz edin ki, **banana** sözünü kodlamalısınız — altı hərf, amma yalnız üç fərqli simvol: `a` (3 dəfə), `n` (2 dəfə), `b` (1 dəfə). Bariz yanaşma, 2-ci Dərsin sizə öyrətdiyi refleks, sabit uzunluqlu koddur: 3 simvol olduğu üçün, hər simvola ən azı 2 bit lazımdır (2 bit 4-ə qədər dəyəri ayırd edə bilər).

```
a = 00
n = 01
b = 10

banana hərf-hərf:
b  a  n  a  n  a
10 00 01 00 01 00   →   6 hərf × 2 bit = 12 bit
```

On iki bit, hansı hərfə xərclədiyinizdən asılı olmayaraq. Qüsur budur: `a` `b`-dən üç dəfə tez-tez görünür, amma tam eyni qiymətə başa gəlir. Sabit uzunluqlu kod ümumi simvolla nadir simvol arasındakı fərqi görə bilmir — kod cədvəlindəki hər yer eyni enlidir.

Bu, yeni bir fikir də deyil. Samuel Morse və Alfred Vail 1837-ci ildə, Huffman-dan bir əsr əvvəl, dəqiq eyni problemlə üzləşdilər. Teleqraf kodlarını qurarkən, nöqtə-xətt ardıcıllıqlarını əlifba sırası ilə paylamadılar. Rəvayətə görə, Vail real ingilis mətnində hər hərfin nə qədər tez-tez rast gəldiyini qiymətləndirmək üçün mətbəənin şrift qutusundakı tip parçalarını saydı, sonra ən tez-tez rast gəlinən hərflərə ən qısa ardıcıllıqları verdi — `E` tək bir nöqtədir, `T` tək bir xətt, halbuki `Q` və `Z` kimi nadir hərflər dörd simvol aldı. Morse kodu dəyişən uzunluqlu koddur, sabit uzunluqlu ikili kodun kənara atdığı məhz bu fikir üzərində qurulub: **daha tez-tez görünənə daha az simvol xərcləyin.**

<Pitfall>

Bariz növbəti fikir — "Morse kodu kimi, ümumi hərfləri sadəcə qısaldın" — Morse kodunun sakitcə yan keçdiyi bir problemə çırpılır: hərflər arasında fasilə olmadan, alıcı bir kodun harada bitib növbətinin harada başladığını necə bilir? Morse buna görə çıxa bilir ki, operatorlar hərflər arasına həqiqi bir sükut əlavə edirlər. Faylın əlavə edəcəyi sükut yoxdur. Əgər `a = 0` və `n = 01` olarsa, `001` bit sətri qeyri-müəyyəndir — bu `a`, `a`, yarım-`n`-dir? Yoxsa `a`, `01` = `n`? İstifadə oluna bilən dəyişən uzunluqlu kod elə qurulmalıdır ki, **heç bir kod başqa kodun prefiksi olmasın** — buna *prefiks kodu* (ya da "prefiks-azad" kodu) deyilir. Bir dəfəyə bir bit oxuyun, toplanmış bitləriniz hansısa simvolun koduna uyğun gəldiyi an — heç bir ayırıcıya ehtiyac olmadan — birmənalı şəkildə hansı simvol olduğunu bilirsiniz. Aşağıdakı Huffman alqoritmi öz strukturunun yan təsiri olaraq avtomatik prefiks kodları qurur.

</Pitfall>

## Huffman kodlaşdırma: optimal ağacı qurmaq {/*huffman-coding-build-the-optimal-tree*/}

Huffman-ın üsulu ikili ağacı aşağıdan yuxarıya qurur. Alqoritm dörd addımda ifadə oluna biləcək qədər qısadır:

```
1. Hər simvol üçün bir yarpaq node yaradın, tezliklə (sayla) çəkilib.
2. Bütün toplumdakı (node-lar ya alt-ağaclar) ən aşağı çəkili iki node götürün.
3. Onları çəkisi cəm olan yeni bir daxili node altında birləşdirin.
4. Yalnız bir node (kök) qalana qədər 2-ci addımdan təkrarlayın.
```

Ağac qurulduqdan sonra, hər simvolun kodu sadəcə kökdən onun yarpağına gedən yoldur — hər sol şaxə üçün `0`, hər sağ şaxə üçün `1`. Gec birləşdirilən (kökə yaxın) simvollar qısa kodla qalır; erkən birləşdirilən (kökdən uzaq, çünki nadir idilər) simvollar uzun kodla nəticələnir.

### Əl ilə nümunə 1: banana {/*worked-example-1-banana*/}

Tezliklər: `a`=3, `n`=2, `b`=1.

```
Addım 1 — yarpaqlar:  a(3)  n(2)  b(1)

Addım 2 — ən aşağı iki çəki: n(2) və b(1). Birləşdirin:
                     (3)
                    /    \
                  n(2)   b(1)

Addım 3 — qalan node-lar: a(3), birləşmiş-node(3). Birləşdirin:
                        (6)
                       /    \
                     a(3)  (3)
                          /    \
                        n(2)   b(1)

Addım 4 — bir node qaldı (kök, çəki 6). Bitdi.
```

Sol şaxələri `0`, sağ şaxələri `1` işarələyin:

```
a = 0    (1 bit)
n = 10   (2 bit)
b = 11   (2 bit)
```

İndi bu kodları `banana` üzərinə xərcləyin:

```
b  a  n  a  n  a
11 0  10 0  10 0   →   2+1+2+1+2+1 = 9 bit
```

Sabit uzunluqlu qiymət 12 bit idi. Huffman-ın qiyməti 9 bitdir — 25% azalma, hər tək bit isə hələ də orijinal sözü tam bərpa edir. ✓

<Diagram name="compression/huffman_tree" height={320} width={680} alt="A binary tree for the word banana. Three leaves: a (frequency 3), n (frequency 2), b (frequency 1). n and b merge first into an internal node of weight 3, labeled with a 0 edge to n and a 1 edge to b. That internal node then merges with leaf a (weight 3) under the root, weight 6, labeled with a 0 edge to a and a 1 edge to the internal node. Resulting codes shown beside each leaf: a = 0 (1 bit), n = 10 (2 bits), b = 11 (2 bits). Footer text: banana = 3(1) + 2(2) + 1(2) = 9 bits, versus 12 bits fixed-length.">

Nadir simvollar ağacın dibinə çökür və bunun əvəzini kod uzunluğu ilə ödəyir; ümumi simvollar kökə yaxın qalır və demək olar heç nə ödəmir.

</Diagram>

### Əl ilə nümunə 2: mississippi {/*worked-example-2-mississippi*/}

Hər giriş bu qədər yaxşı sıxışmır, buna niyə olduğunu görmək dəyərlidir. `mississippi`-nin tezlikləri `i`=4, `s`=4, `p`=2, `m`=1 — cəmi 11 hərf. Sabit uzunluqlu kod simvol başına 2 bit tələb edir (4 fərqli simvol): `11 × 2 = 22 bit`. Bu tezliklər üzərində Huffman alqoritmini işlətmək `i=10`, `s=00` (hər ikisi ən çox rast gəlinən olduğu üçün 2 bit), `p=11`, `m=010`... verir — dəqiq ağac birləşmə sırasındakı bərabərliyin necə həll olunmasından asılıdır, amma bu tezliklər üzərində istənilən etibarlı Huffman ağacı eyni cəmə düşür: **21 bit**.

```
mississippi: 22 bit sabit  →  21 bit Huffman  →  cəmi 4.5% kiçik ✓
```

Bunu banana-nın 25% qənaəti ilə müqayisə edin. Fərq alqoritmin qüsuru deyil — alqoritm girişin nə qədər əyri olduğunu sadəcə dürüstcə bildirir. Banana-nın tezlikləri (3, 2, 1) əyridir; mississippi-ninki (4, 4, 2, 1) daha bərabərə yaxındır. Huffman kodlaşdırmasının qazancı mənbənin simvolları nə qədər qeyri-bərabər istifadə etməsi ilə miqyaslanır. Tamamilə bərabər bir mənbə — hər simvol eyni ehtimalla — Huffman tərəfindən heç sıxışdırıla bilməz; istismar ediləcək qeyri-bərabərlik qalmayıb. Bu, bir alqoritmin məhdudiyyəti deyil. Bu, entropiya tavanıdır, və onunla bu dərsin sonunda rəsmi şəkildə tanış olacaqsınız.

<DiagramGroup>

<Diagram name="compression/fixed_code_table" height={300} width={340} alt="A table of fixed 2-bit codes for banana's three symbols: a=00, n=01, b=10, with counts a×3, n×2, b×1. Below it, a red bar 240 pixels wide labeled 12 bits total, representing 6 symbols times 2 bits each.">

Sabit uzunluq: hər simvol eyni qiymətə başa gəlir

</Diagram>

<Diagram name="compression/huffman_code_table" height={300} width={340} alt="A table of Huffman codes for banana's three symbols: a=0, n=10, b=11, with counts a×3, n×2, b×1 and bit-lengths 1, 2, 2. Below it, a blue bar 180 pixels wide labeled 9 bits total, 25% smaller than fixed, drawn at the same pixels-per-bit scale as the fixed-length bar for direct visual comparison.">

Huffman: ümumi simvollar daha az xərc daşıyır

</Diagram>

</DiagramGroup>

<DeepDive>

#### Huffman-ın ağacı niyə isbatlanmış şəkildə optimaldır? {/*why-is-huffmans-tree-provably-optimal*/}

Huffman-ın dörd-addımlı reseptivi *acgöz* alqoritmdir — hər addımda, sonradan yenidən nəzərdən keçirmədən, əlçatan ən ucuz yerli seçimi edir (ən aşağı çəkili iki node-u birləşdirin). Acgöz alqoritmlər adətən optimal olmur; yerli ucuz seçim sizi qlobal baha bir küncə sıxışdıra bilər. Huffman kodlaşdırması bu qaydanın nadir, məşhur istisnasıdır, və isbat bir müşahidəyə əsaslanır: istənilən optimal prefiks kodda ən az tezlikli iki simvol ağacın ən dərin səviyyəsində qardaş olmalıdır (əks halda, onları ən dərin səviyyədəki simvollarla dəyişdirmək cəmi xərci ancaq azalda bilərdi, bu isə optimallıqla ziddiyyət təşkil edərdi). Ən nadir iki simvolun cütləşməli olduğunu bildikdən sonra, onları əvvəlcə birləşdirib qalanlar üzərində rekursiya etmək heç nəyi itirməyəcəyinə zəmanət verir. İsbatın hamısı budur, və acgöz qısayolların əksəriyyətindən fərqli olaraq, bu, verilmiş simvol-tezlik cədvəli üçün həqiqi optimumu həmişə tapmasının səbəbidir.

</DeepDive>

## LZ77: tezliyi saymaq əvəzinə təkrarları ovlamaq {/*lz77-hunting-repeats-instead-of-counting-frequency*/}

Huffman kodlaşdırması artıqlığın xüsusi bir növünü həll edir: bəzi simvollar digərlərindən daha çox görünür. Amma o, başqa bir növə kordur: eyni *ardıcıllığın* birdən çox görünməsi. Huffman kodlaşdırması, `abcabcabcabc` sətrinə verildikdə, sadəcə dörd `a`, dörd `b`, dörd `c` görür — bərabər bölünmüş, istismar ediləcək heç nə yoxdur. İnsan gözü buna baxan kimi `abc`-nin dörd dəfə təkrarlandığını görür. 1977-ci ildə Abraham Lempel və Jacob Ziv tərəfindən nəşr olunan LZ77 maşına dəqiq eyni baxışı verən alqoritmdir.

LZ77 datanı emal edərkən üzərində bir pəncərəni sürüşdürür, iki hissəyə bölünmüş: **axtarış buferi** (artıq çıxarılmış, hələ görünüş sahəsində olan data) və **irəli baxış buferi** (növbədəki data). Hər mövqedə, o soruşur: irəli baxış buferindəki gələcək mətn axtarış buferində artıq mövcud olan bir şeylə uyğun gəlirmi? Uyğun gəlirsə, həmin simvolları yenidən çıxarmaq əvəzinə, yığcam bir token çıxarır: `(məsafə, uzunluq)` — "buradan `məsafə` simvol geri qayıt, `uzunluq` simvol irəli köçür."

### Əl ilə nümunə: abcabcabcabc {/*worked-example-abcabcabcabc*/}

```
Giriş:  a b c a b c a b c a b c     (12 simvol)

1-3-cü mövqe: hələ ki heç bir əvvəlki uyğunluq yoxdur — hərf-hərf çıxarın: a, b, c
4-cü mövqe:   geriyə baxın — 3 mövqe geridə başlayan "abc" uyğun gəlir!
              Uyğunluq nə qədər davam edə bilər? İrəli müqayisə etməyə davam edin:
              4-cü mövqe 1-ci mövqeni köçürür (a), 5-ci mövqe 2-ci mövqeni köçürür (b),
              6-cı mövqe 3-cü mövqeni köçürür (c), 7-ci mövqe 4-cü mövqeni köçürür
              (elə köçürmənin özünün istehsal etdiyi — a) ... və beləliklə,
              girişin sonuna qədər davam edir.
              → token: (məsafə=3, uzunluq=9)

Çıxış: a, b, c, (3, 9)   —   12 simvol əvəzinə 4 simvol ✓
```

Qəribə hissəyə diqqət yetirin: uyğunluğun `uzunluğu` (9) `məsafə`dən (3) böyükdür. Bu səhv deyil — bu, LZ77-ni təkrarlanan naxışlarda güclü edən hiylədir. Dekoder mənbə mətninin artıq 9 simvol geridə mövcud olmasına ehtiyac duymur; ona yalnız 3 simvolun mövcud olması lazımdır. O, 3 geridən 1 simvol köçürür, əlavə edir, sonra *növbəti* simvolu indi (yenidən) 3 geridə olandan köçürür (bu, elə köçürmənin özünün az öncə yazdığı bir simvol ola bilər), və beləliklə davam edir — heç vaxt istehsal etdiyi ardıcıllıq qədər böyük olmalı olmayan bir pəncərədən, təkrarlanan naxışı bir simvol-bir simvol sonsuza qədər yenidən yaradaraq.

<Diagram name="compression/lz77_window" height={380} width={720} alt="Twelve character cells spelling abcabcabcabc. The first three cells (a, b, c) are muted, labeled already output (search buffer). The remaining nine cells are highlighted, labeled matched via (distance 3, length 9). A curved arrow runs from the fourth cell back to the first cell, labeled distance 3. Footer text: Output: literals a, b, c, plus token (distance 3, length 9). 12 characters packed into 4 symbols. Smaller note: length (9) can exceed distance (3) — the copy runs past what exists and regenerates the pattern.">

Üç-simvollu pəncərə, öz kənarından o tərəfə köçürülərək, doqquz-simvollu bir ardıcıllığı yenidən yaradır.

</Diagram>

LZ77 lüğət-əsaslı sıxışdırmanın son sözü deyildi. Lempel və Ziv 1978-ci ildə ikinci bir sxem, LZ78, nəşr etdilər, bu, geriyə xam tarixçəni skan etmək əvəzinə açıq bir alt-sətir lüğəti qurur. Terry Welch 1984-cü ildə LZ78-i LZW-yə təkmilləşdirdi — klassik GIF şəkil formatının və erkən Unix `compress` proqramının arxasındakı alqoritm. Fərqli mühasibat, eyni əsas fikir: təkrarlaya biləcəyiniz şeyi təkrarlamayın, ona işarə edin.

## DEFLATE: Huffman və LZ birləşir {/*deflate-huffman-and-lz-join-forces*/}

Bu alqoritmlərin heç biri tək başına ZIP faylının tam hekayəsi deyil. Phil Katz tərəfindən 1989-cu ildə PKZIP proqramı üçün dizayn edilən, sonra 1996-cı ildə RFC 1951 kimi standartlaşdırılan **DEFLATE** hər iki keçidi eyni data üzərində, arxa-arxaya işlədir:

```
1-ci keçid (LZ77):    təkrarlanan ardıcıllıqları ovlayın, onları (məsafə, uzunluq) tokenləri ilə əvəz edin
2-ci keçid (Huffman):  qalan hər şeyi — hərf-hərf simvolları və tokenləri birlikdə —
                        Huffman ilə kodlayın, ki qalan ən ümumi parçalar
                        ən az bitə başa gəlsin
```

Bu iki alqoritm artıqlığın fərqli növlərinə hücum edir, məhz buna görə birləşdirilmələri dəyərlidir: LZ77 təkrarlanan *seriyaları* tutur, Huffman kodlaşdırması isə LZ77-nin artıq yığmadığı hər şeydəki qeyri-bərabər *tezlikləri* tutur. DEFLATE açdığınız `.zip` faylının içindəki, `gzip`-in istehsal etdiyi `.gz` faylının içindəki, və — bəlkə də təəccüblü şəkildə — foto qovluğunuzdakı `.png` şəkilinin içindəki formatdır. Hər üçü fərqli fayl-format geyimləri geyinmiş DEFLATE axınlarıdır.

Siz artıq bu geyimin bir parçası ilə tanışsınız. 8-ci Dərs sizə göstərdi ki, CRC-32 checksum-u zədəni tutmaq üçün hər ZIP girişinin içində gəzir. Həmin checksum faylın içində DEFLATE-lə sıxışdırılmış bayt-ların düz yanında oturur — sıxışdırma yükü kiçildir, checksum isə onu qoruyur, və heç bir alqoritm digərinin varlığını bilmək məcburiyyətində deyil.

<Diagram name="compression/deflate_pipeline" height={300} width={720} alt="Four boxes left to right connected by arrows: raw text, then LZ77 producing tokens, then Huffman producing short codes, then compressed bytes plus CRC-32. Caption: two passes over the same data — first hunt repeats, then squeeze what's left. Small note: RFC 1951 (1996), the format inside every .zip, .gz, and .png.">

İki keçid, eyni data üzərində iki fərqli artıqlıq növü, bir sıxışdırılmış axın.

</Diagram>

Bu, həmçinin 7-ci Dərsin açıq buraxdığı bir sualı nəhayət cavablandırır: 12 meqapiksellik foto xam pixel datası olaraq təxminən 36 MB tutur, halbuki telefonunuzdakı fayl 3 MB-a yaxındır. DEFLATE ailəsindən sıxışdırma (JPEG oxşar amma itkili bir pipeline istifadə edir) bu 12-qat boşluğun böyük hissəsidir — bu dərsin eyni iki-keçidli fikri, ingilis mətni əvəzinə şəkil datası üçün tənzimlənib.

<Pitfall>

"Sıxışdırma həmişə faylı kiçildir" fərz etmək cəlbedicidir. Kiçik bir şey üzərində sınayın:

<TerminalBlock>

printf 'the cat sat on the mat, the cat sat on the mat\n' > repeat.txt
wc -c repeat.txt
47 repeat.txt
gzip -k -9 repeat.txt
wc -c repeat.txt.gz
56 repeat.txt.gz

</TerminalBlock>

gzip-lənmiş fayl *daha böyükdür* — 47 əvəzinə 56 bayt. Heç nə sınmayıb; xam DEFLATE axınının özü bu mətni faktiki olaraq 33 bayta qədər kiçiltdi (cümlə təkrarlandığı üçün həqiqi ~30% qənaət). Amma `gzip` sizə çılpaq bir DEFLATE axını vermir — onu bir fayl formatına bükür: 10 baytlıq başlıq (magic nömrə, bayraqlar, zaman möhürü, ƏS baytı) və 8 baytlıq quyruq (CRC-32 və orijinal uzunluq), giriş ölçüsündən asılı olmayaraq təxminən 18 bayt sabit yük. 47-baytlıq bir girişdə, bu yük qənaəti üstələyir. Dərs "sıxışdırma işləmir" deyil — hər konteyner formatının sabit xərci var, və bu xərc yalnız fayl özünü ödəyəcək qədər böyük olduqda özünü doğruldur.

</Pitfall>

<Sandpack>

```js
import { useState } from 'react';

function huffmanBits(text) {
  if (text.length === 0) return 0;
  const counts = {};
  for (const ch of text) counts[ch] = (counts[ch] || 0) + 1;
  let nodes = Object.values(counts).map((freq) => ({ freq }));
  if (nodes.length === 1) return text.length;
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const [left, right] = nodes;
    nodes = nodes.slice(2);
    nodes.push({ freq: left.freq + right.freq, left, right });
  }
  let total = 0;
  const walk = (node, depth) => {
    if (node.left) {
      walk(node.left, depth + 1);
      walk(node.right, depth + 1);
    } else {
      total += node.freq * Math.max(depth, 1);
    }
  };
  walk(nodes[0], 0);
  return total;
}

export default function CompressionToy() {
  const [text, setText] = useState('banana');
  const fixedBits = text.length * 8;
  const huffBits = huffmanBits(text);
  const saved = fixedBits > 0 ? Math.round((1 - huffBits / fixedBits) * 100) : 0;

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 40))}
        style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
      />
      <p style={{ margin: '12px 0 4px' }}>
        Sabit uzunluq (8 bit/simvol): <strong>{fixedBits} bit</strong>
      </p>
      <p style={{ margin: '4px 0' }}>
        Huffman ilə kodlanmış: <strong style={{ color: '#087ea4' }}>{huffBits} bit</strong>
      </p>
      <p style={{ margin: '4px 0', color: saved > 0 ? '#087ea4' : '#c1554d' }}>
        {saved > 0 ? `${saved}% daha kiçik` : 'bu girişdə qənaət yoxdur'}
      </p>
    </div>
  );
}
```

</Sandpack>

<DeepDive>

#### Entropiya tavanı {/*the-entropy-ceiling*/}

Shannon-un 1948-ci il məqaləsi təkcə ingilis mətninin informasiya tutumunu qiymətləndirmədi — o, **mənbə kodlaşdırma teoremi** adlanan sərt bir limiti isbat etdi: heç bir itkisiz sxem, nə qədər ağıllı olsa da, bir mənbəni onun **entropiyasından** — mənbənin simvollarının faktiki paylanmasına görə simvol başına həqiqətən lazım olan orta bit sayından — aşağı sıxışdıra bilməz. Huffman kodlaşdırması bu limitə diqqətəlayiq dərəcədə yaxınlaşır; o, *simvol başına bir kod təyin edən prefiks kodlar arasında* isbatlanmış şəkildə optimaldır, baxmayaraq ki simvol qruplarını birlikdə kodlayan sxemlər (arifmetik kodlaşdırma, aralıq kodlaşdırma) bəzən daha da yaxınlaşa bilər. Amma heç nə entropiyadan aşağı düşmür — bu rəqəm sıxışdıran alqoritmin deyil, mənbənin özünün xüsusiyyətidir.

Buna görə artıq sıxışdırılmış bir faylı yenidən sıxışdırmaq nadir hallarda kömək edir, hətta zərər verə bilər: yaxşı sıxışdırılmış bir DEFLATE axını artıq öz entropiya tavanına yaxın oturur. Onun baytları statistik olaraq bərabərə yaxın görünür — heç bir simvol digərindən üstün deyil, heç bir ardıcıllıq təkrarlanmır — bu isə dəqiq olaraq Huffman kodlaşdırması ilə LZ77-nin ikisinin də istismar edəcək heç nə tapmadığı şərtdir. Maksimum sıxışdırılmış bir fayl, çox spesifik bir mənada, küydən ayırd edilməzdir. "Küy kimi görünmək" faktiki olaraq nə deməkdir, və deterministik bir maşın necə əvvəlcədən təsadüfi kimi keçən bir şey istehsal edə bilər, birbaşa növbəti dərsin açılış sualıdır.

</DeepDive>

<DeepDive>

#### 42.zip bombası {/*the-42zip-bomb*/}

Sıxışdırmanın riyaziyyatı silaha çevrilə bilər. **42.zip**, təxminən 2001-ci ildən etibarən internetdə dolaşan bir fayl, 16 zip fayl saxlayan tək bir 42-kilobaytlıq arxivdir, bunların hər biri daha 16 zip fayl saxlayır, beş qat dərinliyə qədər. Bu iç-içə düzülüşün dibində, ən daxili fayllar hər biri 4.3 GB eyni, yüksək dərəcədə təkrarlanan datadır — hər qatı tam açmaq orijinal 42 KB-ı təxminən 4.5 **petabayta** genişləndirir. Arxiv proqramları və antivirus skanerləri açma ölçüsünə və iç-içə dərinliyinə limit qoymağı öyrənməzdən əvvəl, belə bir faylı açmaq ya skan etmək bir maşının disk yerini və yaddaşını tükəndirə, onu çökdürə ya dondura bilərdi — DEFLATE-in əsas gücünü (ifrat təkrarın ifrat sıxışdırılması) xidmətdən-imtina yükünə çevirərək. Müasir arxiv proqramları və poçt/antivirus skanerləri məhz bu cür fayllara görə açma limitləri tətbiq edir.

</DeepDive>

<Recap>

- **Artıqlıq** sıxışdırmanın çıxardığı şeydir — heç bir yeni informasiya daşımayan təkrarlanan naxışlar və əyri simvol tezlikləri, checksum-ların qəsdən əlavə etdiyi artıqlığın güzgü əksi.
- **Sabit uzunluqlu kodlar** hər simvola nə qədər tez-tez görünməsindən asılı olmayaraq eyni bit sayı xərcləyir — tezliklər əyri olduqda israfçıdır.
- **Prefiks kodlar** (heç bir kod başqasının prefiksi deyil) dekoderin dəyişən uzunluqlu kodları heç bir ayırıcı olmadan oxumasına imkan verir.
- **Huffman kodlaşdırması** ən az tezlikli iki node-u təkrar-təkrar birləşdirərək, aşağıdan yuxarıya, optimal prefiks kod qurur — ümumi simvollar qısa kodlarla kökə yaxın oturur, nadir simvollar uzun kodlarla dibə çökür.
- Huffman-ın qənaəti girişin nə qədər əyri olduğu ilə miqyaslanır: banana 25% qənaət etdi, mississippi yalnız 4.5%, çünki mississippi-nin hərf tezlikləri bərabərə daha yaxın idi.
- **LZ77** sürüşən pəncərə ilə təkrarlanan ardıcıllıqları tapır və onları `(məsafə, uzunluq)` geriyə-istinad tokenləri ilə əvəz edir — və bu uzunluq məsafəni keçə bilər, hazırda mövcud olan şeyin kənarından o tərəfə keçərək bir naxışı yenidən yaradaraq.
- **DEFLATE** (RFC 1951) LZ77-ni sonra Huffman kodlaşdırmasını ardıcıl işlədir — bu, hər `.zip`, `.gz` və `.png` faylının içindəki formatdır, onu qoruyan CRC-32-nin düz yanında oturaraq.
- Heç bir itkisiz alqoritm bir mənbənin **entropiyasını** — onun həqiqi informasiya tutumunu — keçə bilməz, buna görə artıq sıxışdırılmış datanı sıxışdırmaq nadir hallarda kömək edir, və buna görə iç-içə arxiv "zip bombaları" ifrat sıxışdırma nisbətlərini xidmətdən-imtina hücumuna çevirə bilir.

</Recap>

<Challenges>

#### Huffman ağacını əllə qurun {/*build-a-huffman-tree-by-hand*/}

`abracadabra` sözü (11 hərf) üçün tezliklər belədir: `a`=5, `b`=2, `r`=2, `c`=1, `d`=1. Huffman ağacını əllə qurun (hər addımda ən aşağı çəkili iki node-u birləşdirin), hər hərf üçün nəticələnən kodu yazın və `abracadabra`-nın kodlanması üçün ümumi bit sayını hesablayın. Bunu sabit uzunluqlu qiymətlə (5 fərqli simvol hər biri 3 bit tələb edir) müqayisə edin.

<Hint>

`c` və `d`-ni (ən aşağı iki çəki, hər ikisi 1) birləşdirməklə başlayın, çəkisi 2 olan bir node verir. Sonra çəkisi 2 olan üç node-unuz olacaq (`b`, `r`, və birləşdirdiyiniz `c+d` node-u) — bunlar arasında istənilən bərabərlik-həll sırası etibarlıdır və eyni ümumi bit sayını verəcək.

</Hint>

<Solution>

Sabit uzunluq: 11 hərf × 3 bit = 33 bit.

Etibarlı bir ağac: `c`(1)+`d`(1) birləşdirin → çəki 2. İndi node-lar `a`(5), `b`(2), `r`(2), `cd`(2). `b`(2)+`r`(2) birləşdirin → çəki 4. İndi node-lar `a`(5), `cd`(2), `br`(4). `cd`(2)+`br`(4) birləşdirin → çəki 6. İndi node-lar `a`(5), `cdbr`(6). Onları birləşdirin → kök, çəki 11.

Kodlar: `a`=0 (1 bit), digər dörd hərf isə 3 səviyyə dərinlikdə, hər biri 3 bit (`b`, `r`, `c`, `d` bu xüsusi bərabərlik-həll sırasında hamısı 3 bit tələb edir).

Cəm: `a`×5×1 + (`b`+`r`+`c`+`d` sayları, 2+2+1+1=6 hərf) ×3 = 5 + 18 = 23 bit.

33 bit sabitə qarşı 23 bit — təxminən 30% qənaət. ✓ (Dəqiq hərf-başına kodlar bərabərlik-həllindən bir az fərqlənə bilər, amma bu tezliklər üzərində istənilən etibarlı Huffman ağacı cəmi 23 bitə düşür.)

</Solution>

#### LZ77 ilə təkrarlanan sətri kodlayın {/*encode-a-repeated-string-with-lz77*/}

Əllə, `xyxyxyxy` sətrini (8 simvol) LZ77 ilə kodlayın. Dərsdəki `abcabcabcabc` üçün əl nümunəsinin etdiyi kimi, hərf-hərf simvolları və kodlaşdırıcınızın çıxaracağı `(məsafə, uzunluq)` token(lər)ini yazın.

<Solution>

İlk iki simvolun, `x` və `y`, əvvəlki heç bir uyğunluğu yoxdur — hərf-hərf çıxarın. 3-cü mövqedən başlayaraq, `xyxyxy` mətni (6 simvol) 2 mövqe geridə başlayan bir naxışla uyğun gəlir. Nə qədər davam etdiyini yoxlayarkən: girişin sonuna qədər uyğun gəlir.

Çıxış: `x`, `y`, `(məsafə=2, uzunluq=6)` — 8 simvolu təmsil edən 3 simvol. Yenə diqqət yetirin ki, uzunluq (6) məsafəni (2) keçir — dərsdəki əl nümunəsindəki eyni özünü-üst-üstə-köçürmə hiyləsi. ✓

</Solution>

#### Etibarsız kodu tapın {/*spot-the-invalid-code*/}

Bir komanda yoldaşınız dörd simvol üçün bu kod cədvəlini təklif edir: `a=0`, `b=1`, `c=01`, `d=10`. Onlar bunun etibarlı dəyişən-uzunluqlu kod olduğunu iddia edir, çünki hər kod unikaldır. Bu kod cədvəlinin praktikada niyə hələ də uğursuz olacağını izah edin və dekoderin düzgün şərh edə bilməyəcəyi bir bit sətri verin.

<Solution>

Unikallıq kifayət deyil — kod **prefiks-azad** olmalıdır: heç bir kod daha uzun bir kodun prefiksi ola bilməz. Burada, `a=0` `c=01`-in prefiksidir, və `b=1` `d=10`-un prefiksidir. Dekoderə `01` bit sətrini verin: soldan-sağa oxuyaraq, əvvəlcə `0`-ı görür, bu `a` üçün tam, etibarlı koddur — bəs o, orada dayanıb sonra `1`-i `b` kimi oxuyur, yoxsa oxumağa davam edib `01`-i `c` kimi tanıyır? Bu cədvəl altında hər iki oxunuş etibarlıdır, buna görə eyni bit sətri iki fərqli cavaba deşifr olunur (`a` sonra `b`, ya da sadəcə `c`) və hansının nəzərdə tutulduğunu bilməyin heç bir yolu yoxdur. Huffman alqoritminin istehsal etdiyi kimi düzgün bir kod bu qeyri-müəyyənliyin heç vaxt yaranmayacağına zəmanət verir.

</Solution>

#### gzip-in faylı böyütdüyü müəmmanı izah edin {/*explain-the-gzip-grew-the-file-mystery*/}

Bir iş yoldaşınız 20-baytlıq bir faylda `gzip` işlədir və `.gz` nəticəsinin orijinaldan böyük olmasından çaşqındır. Bu dərsin Pitfall bölməsinin 47-baytlıq bir faylda göstərdiyi şeydən istifadə edərək, onlara — öz sözlərinizlə, rəqəmlərlə — bunun niyə baş verdiyini və təxminən hansı fayl ölçüsündə gzip-in etibarlı şəkildə əvəzinə kiçiltməyə başlayacağını gözləməli olduqlarını izah edin.

<Solution>

`gzip` çılpaq bir DEFLATE axını çıxarmır — onu giriş ölçüsündən asılı olmayaraq təxminən 18 bayt sabit yük olan bir fayl formatına bükür: sabit ölçülü başlıq (magic baytlar, bayraqlar, zaman möhürü, ƏS identifikatoru — təxminən 10 bayt) və sabit ölçülü quyruq (CRC-32 checksum və orijinal uzunluq — təxminən 8 bayt). 20-baytlıq bir faylda, bu yükün özü girişə demək olar bərabərdir, buna görə DEFLATE-in öz sıxışdırması mükəmməl işləsə belə, konteynerin sabit xərci üstünlük təşkil edir və nəticə daha böyük çıxır. Bu, dərsdəki 47-baytlıq təkrarlanan cümlə faylında dəqiq baş verən şeydir: DEFLATE yükünün özü 33 bayta qədər kiçildi, amma bitmiş `.gz` faylı konteyner yükü geri əlavə olunduqdan sonra 56 bayt oldu. Giriş ölçüsü böyüdükcə, bu sabit ~18-baytlıq xərc cəmin getdikcə kiçilən bir hissəsinə çevrilir, faktiki sıxışdırma qənaəti isə (giriş ilə miqyaslanan) böyüməyə davam edir — buna görə gzip fayl kifayət qədər böyük olduqda etibarlı şəkildə qazanmağa başlayır, adi mətn üçün ümumiyyətlə yüzlərlə baytdan aşağı-kilobayt aralığında, daha böyük ya daha təkrarlanan fayllar üçün isə xeyli tez.

</Solution>

#### Kod baxışı: lazımsız yenidən sıxışdırma {/*code-review-needless-recompression*/}

Bir komanda yoldaşınızın skriptinə baxış keçirirsiniz. O, bir JPEG foto qovluğunu götürür və yükləməzdən əvvəl "bant genişliyinə qənaət etmək üçün" hər birini gzip-ləyir. Bu dərsin DeepDive bölməsindəki entropiya tavanından istifadə edərək, komanda yoldaşınıza — konkret bir tövsiyə ilə — bu addımın niyə kömək etməsinin çox ehtimalsız olduğunu və əvəzinə nə edə biləcəyini izah edin.

<Solution>

JPEG bir `.jpg` faylı yazmazdan əvvəl artıq öz sıxışdırma pipeline-ını işlədir — fotoqrafik şəkil datası üçün xüsusi tənzimlənmiş biri. Bu fayl diskdə mövcud olduğu zamana qədər, onun baytları artıq öz entropiya tavanına yaxın oturur: az qalan artıqlıq, bərabərə yaxın bayt tezlikləri, az təkrarlanan ardıcıllıqlar. Bu, dəqiq olaraq gzip-in öz LZ77-və-Huffman pipeline-ının istismar edəcək heç nə tapmadığı şərtdir — çıxarılacaq heç bir qalıq əyrilik ya təkrar yoxdur. Ən yaxşı halda, JPEG-ləri gzip-ləmək cüzi, faiz kəsri qədər qənaət edir; ən pis halda — kiçik fayllarda — əvvəlki tapşırıqdakı sabit konteyner yükü onları faktiki olaraq böyüdür, tam olaraq 47-baytlıq mətn faylının gzip-ləndikdə böyüdüyü kimi. Konkret tövsiyə: artıq sıxışdırılmış formatları (JPEG, PNG, MP3, və artıq `.gz`/`.zip` faylları) sıxışdırmağı tamamilə buraxın, və bu CPU vaxtını yalnız həqiqətən sıxışdırıla bilən datada — sadə mətn, JSON, CSV, sıxışdırılmamış şəkillər — xərcləyin, harada ki, çıxarılacaq real artıqlıq hələ mövcuddur.

</Solution>

</Challenges>

<LearnMore title="Təsadüfilik: PRNG, toxum, entropiya" path="/learn/faza-0/modul-0-1/randomness">

Maksimum sıxışdırılmış bir fayl statistik olaraq küy kimi görünür — heç bir təkrarlanan naxış yoxdur, heç bir əyri bayt tezliyi yoxdur, Huffman ya LZ77-nin yapışacağı heç nə qalmayıb. Amma "küy kimi görünmək" dəqiq olaraq nə deməkdir? Və əgər kompüter həmişə dəqiq deyildiyini edən deterministik bir maşındırsa, o, heç ümumiyyətlə təsadüfi kimi keçən bir şeyi necə istehsal edir? Bu paradoks növbəti dərsin açılış sualıdır.

</LearnMore>
