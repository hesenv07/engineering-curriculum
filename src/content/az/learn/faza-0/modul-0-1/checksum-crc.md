---
title: "Data Bütövlüyü: Parity, Checksum-lar, CRC"
---

<Intro>

2003-cü il mayın 18-də Brüsselin Schaerbeek bələdiyyəsində elektron səsvermə maşını yerli namizəd Maria Vindevoghel-ə sakitcə **4.096 əlavə səs** yazdı. Xəta yalnız ona görə aşkarlandı ki, onun ümumi səs sayı ona real səs verə biləcək insanların sayını keçmişdi; yenidən sayım maşının bu səsləri yoxdan uydurduğunu təsdiqlədi. Rəsmi araşdırma nə bug, nə saxtakarlıq, nə də təkrarlana bilən bir nasazlıq tapdı — və sübutlara qəribə dəqiqliklə uyğun gələn yeganə izaha gəldi: səs sayğacının 13-cü biti öz-özünə 0-dan 1-ə çevrilmişdi. 13-cü bitin nəyə bərabər olduğunu bilirsiniz: **2¹² = 4.096** — bu rəqəm təsadüfi deyildi, maskalanmış ikinin qüvvəti idi — bir tranzistorun zəiflik anının səhv salınmaz barmaq izi, çox güman ki, qalaktikanı keçib səyahətini Belçika səs sayğacında bitirən kosmik şüanın işi. Yeddi dərs sizə dünyanı bitlərə kodlamağı öyrətdi. Bu dərs həmin dərslərin təxirə saldığı narahat həqiqətlə üzləşir: **bitlər çevrilir (bit flip)**. Yaddaş unudur, kabellər səs-küy pıçıldayır, disklər cızılır — və bütöv bir riyaziyyat sahəsi məhz ona görə mövcuddur ki, kainat sizin datanızı redaktə edəndə bundan xəbər tutasınız. Hətta bəziləri datanı geriyə *özü redaktə edə* bilir.

</Intro>

<YouWillLearn>

- Fiziki dünyada bitlərin niyə çevrildiyi — kosmik şüalar, səs-küy, köhnəlmə — və miqyas böyüyəndə "milyardda bir"in niyə *hər gün* demək olduğu
- **Parity**: bir bitlik keşikçi, dəqiq nəyi tutduğu və onun sərhədlərini müəyyən edən iki-flip kor nöqtəsi
- **Checksum-lar**: sadəlövh bayt cəmləməsindən (və onu aldadan yerdəyişmə buqundan) hər IP paketinin içindəki Internet checksum-a qədər
- **CRC**: ZIP, PNG və Ethernet-in arxasındakı qalıq (remainder) fəndi — uzun bölmə də daxil olmaqla, tamamilə əllə hesablanmış
- **Xəta düzəltmə (error correction)**: Hamming-in qəzəbli həftəsonu, uğursuz yoxlamaların xarab bitin ünvanını *hərfbəhərf yazdığı* kod və cızılmış CD-ləri, üstü örtülmüş QR kodları sağaldan Reed–Solomon
- Peşəkar mühakimə qatı: detect vs correct, qəza vs düşmən (adversary) və pipeline-da yoxlamanın (verification) əslində harada dayanmalı olduğu

</YouWillLearn>

## Düşmən: çevrilmiş bitlər {/*the-enemy-flipped-bits*/}

Dərs 1 sadələşdirici bir vəd vermişdi və o vəd o vaxtdan bəri hər şeyin altında səssizcə dayanır: bit bir dəfə yazıldısa, *yazılı qalır*. Fizika əslində bu müqaviləni imzalamır. DRAM hüceyrəsi bir neçə on min elektron saxlayan mikroskopik kondensatordur; yüksək enerjili bir zərrəcik — atmosferin yuxarı qatlarından gələn kosmik şüa törəməsi, çipin öz korpusundakı iz miqdarında radioaktiv atomlardan qopan alfa zərrəciyi — həmin yükü çevirməyə kifayət edəcək qədər yük əlavə edə və ya boşalda bilər. Gərginlik sıçrayışları naqillərdəki bitləri çevirir. Köhnə disklərdə maqnitlənmə sönür; yaşlanan flash hüceyrələrindən yük sızır (sənayenin termini olan **bit rot** metafora deyil); CD-nin üstündəki bir barmaq izi bir anda minlərlə biti örtür.

İstənilən *tək* flip fantastik dərəcədə nadirdir. Amma siz yeddi dərsdir kompüterlərin nadir hadisələrlə nə etdiyini öyrənirsiniz: onları astronomik saylara vururlar. Google-un öz server parkı üzərində apardığı məşhur 2009-cu il tədqiqatı təxminən **yaddaş modullarının 8%-nin ildə ən azı bir xəta qeydə aldığını** göstərdi — data mərkəzində kosmik şüalar lətifə deyil, *sürətdir (rate)*. Evdə də eyni riyaziyyat daha kiçik rəqəmlərlə işləyir: giqabaytlarla RAM × aylarla iş vaxtı o deməkdir ki, maşınınız demək olar ki, mütləq fliplər yaşayıb; sadəcə onları nəticə verdiyi anda cinayət başında tutmaq nadir hadisədir.

Schaerbeek məhz *tutulduğu* üçün qiymətlidir — və *necə* tutulduğuna diqqət edin. Korrupsiya özünü hesab vasitəsilə elan etdi: say tam olaraq 2¹² qədər sıçradı. Bit flip nəticəsində yaranan korrupsiya həmişə bu imzanı daşıyır — dəyər təmiz ikinin qüvvəti qədər yanlışdır — eynilə Dərs 5-in byte-order buqlarının özlərini anaqram kimi elan etdiyi kimi. Barmaq izlərini öyrənin; onlar debugging sessiyasını günlərdən dəqiqələrə endirir. Amma barmaq izləri yalnız şübhələndikdən *sonra* kömək edir. Belçika maşınının şübhələnmək üçün heç bir vasitəsi yox idi: hər sayğacın bir nüsxəsini saxlayır və ona mütləq inanırdı. Əsl həll daha yaxşı hardware deyil — hər kondensatoru qalaktikaya qarşı zirehləyə bilməzsiniz. Həll fəlsəfə dəyişikliyidir: **saxlanmış datanın saxlanmış qalacağına inanmağı dayandırın və datanı öz haqqında sübut daşımağa məcbur edin.** Bu dərsdəki hər mexanizm həmin bir ideyadır — **redundancy (artıqlıq)**: payload bitlərindən *hesablanmış* əlavə bitlər onlarla birlikdə səyahət edir ki, qəbul edən tərəf (və ya gələcək) yenidən hesablayıb müqayisə edə bilsin. Mexanizmlər yalnız nə qədər sübut daşıdıqları və o sübutun nəyi isbat etdiyi ilə fərqlənir.

## Parity: bir bitlik keşikçi {/*parity-the-one-bit-guard*/}

Ən ucuz mümkün sübutdan başlayaq: **bir əlavə bit**. **Even parity** müqaviləsi belədir: datanızdakı 1-ləri sayın; ümumi sayı *cüt* edəcək bir bit əlavə edin. Bütün sxem budur.

```
'H' = 01001000        1-lər: 2 (cüt)   → parity biti 0
'i' = 01101001        1-lər: 4 (cüt)   → parity biti 0
'C' = 01000011        1-lər: 3 (tək)   → parity biti 1

saxlanmış 'C':  01000011 1      ← indi 9 bit birlikdə səyahət edir
```

Qəbul edən yenidən sayır. Doqquz bitdə tək sayda 1 varsa = **həyəcan siqnalı**: nəsə çevrilib. Və bu zəmanət öz ölçüsü üçün su keçirməzdir: *istənilən* tək-bit flip — datada *və ya parity bitinin özündə* — sayın cütlüyünü dəyişir, ona görə tənha bir flip heç vaxt gözdən yayına bilməz. Bir bitlik xərc üçün bu, möhtəşəm alış-verişdir və sənaye onu topdan aldı: klassik serial xətlər hər simvol üçün bir parity biti daşıyırdı və onilliklər boyu "əsl" kompüterlər hər bayt-genişlikli modulda **doqquz** çip olan RAM ilə satılırdı — səkkizi sizin üçün, biri keşikdə.

Amma keşikçinin iki kor nöqtəsinə baxın, çünki bundan sonra gələn hər şeyi məhz onlar müəyyən edir:

<DiagramGroup>

<Diagram name="checksum-crc/parity_catch" height={320} width={340} alt="Səkkiz bit xanasından ibarət sıra 01000011 və 1 saxlayan ayrıca doqquzuncu parity xanası, 'even parity: 1-lərin ümumi sayı cütdür (4)' etiketi ilə. Aşağıda eyni sıra bir data biti çevrilmiş halda, qırmızı rəngdə: 01001011, parity hələ də 1, və beş 1 qeyd edən sayğac — tək. Qırmızı həyəcan etiketi: 'yenidən sayım təkdir: flip aşkarlandı'.">

Bir flip cütlüyü pozur — həmişə. Parity biti *hansı* bitin yalan dediyini deyə bilməz, yalnız birinin dediyini *deyə bilər*.

</Diagram>

<Diagram name="checksum-crc/parity_blind" height={320} width={340} alt="Eyni doqquz xana iki data biti çevrilmiş halda, hər ikisi qırmızı: 1-lərin sayı dörddən yenə dördə keçir. Solğun etiket: 'yenidən sayım cütdür: sükut'. Xəbərdarlıq: iki flip bir-birini ləğv edir — keşikçi heç nə görmür.">

İki flip cütlüyü bərpa edir — həmişə. Parity hər cüt-saylı fəlakətə kordur və *detect* edə bilər, amma heç vaxt yeri tapa və ya düzəldə bilməz.

</Diagram>

</DiagramGroup>

Deməli: parity **istənilən tək sayda flipi tutur, istənilən cüt sayı qaçırır, heç nəyin yerini tapmır, heç nəyi düzəltmir**. O, şahid deyil, siqnalizasiya məftilidir. Daha yaxşısını etmək üçün sübut zənginləşməlidir — və növbəti aşkar ideya bitləri saymağı dayandırıb baytları *cəmləməyə* başlamaqdır.

## Checksum-lar: sübutun cəmlənməsi {/*checksums-summing-the-evidence*/}

**Checksum** ən sadə formasında belədir: bütün baytları toplayın (cəmin sabit endə dövr etməsinə icazə verərək — Dərs 2-nin odometri, bir dəfə də olsa vicdanla işlədilir) və nəticəni data ilə birgə göndərin.

```
"Hi"  =  0x48 + 0x69  =  0xB1        ← 1 bayt sübut
```

İndi demək olar ki, hər yerdəki flip cəmi dəyişir, *üstəlik* cəmin eni əlavə dəqiqlik alır: bir yanlış bayt, xəta 256-nın dəqiq misli olmadıqca, 8-bitlik checksum-u dəyişir. Bir parity bitindən xeyli güclüdür. Bu ailə risklərin orta olduğu hər yerdədir: hər IP, TCP və UDP header-ini qoruyan **Internet checksum** 16-bitlik cəmdir — və nə gözəl ki, **end-around carry ilə one's complement arifmetikasında** hesablanır — Dərs 3-ün sürgünə göndərdiyi və packet header-lərdə yenidən görüşəcəyinizi vəd etdiyi mexanizmin özü. Budur, göndərəcəyiniz hər paketi emal edir. (Onu çox 1970-lərə xas bir səbəbə görə seçmişdilər: one's complement cəmi byte-order-dən asılı olmadan hesablana bilir — Dərs 5-in müharibəsində kiçik bir sülh sazişi.)

Amma cəmləmənin struktur qüsuru var və adını cəbr dərsindən bilirsiniz: **toplama kommutativdir**. Cəm *sıraya* fikir vermir:

```
"Hi"  =  0x48 + 0x69  =  0xB1
"iH"  =  0x69 + 0x48  =  0xB1        ← eyni sübut!
```

Dərs 5-in sizə qorxmağı öyrətdiyi korrupsiya növünün eynisi — öz baytlarınız, toxunulmaz, amma *yerdəyişmiş*: NUXI anaqramı, swap edilməmiş length prefix — additiv checksum-dan toxunulmadan keçib gedir. Bir-birini ləğv edən xəta cütləri də elə (burada +1, orada −1). `Hi` ilə `iH` arasındakı fərqi görməyən checksum bütün mebelin yerində olduğunu yoxlayan, amma evin talan edilib-edilmədiyinə baxmayan keşikçidir.

<Note>

Sıralama probleminin ən məşhur həlli cüzdanınızdadır. **Luhn alqoritmi** (Hans Peter Luhn, IBM, 1954-cü ildə patentləşdirilib) hər kredit kartı nömrəsinin son rəqəmini hesablayır — və toplamazdan əvvəl *hər ikinci rəqəmi ikiyə vurur* (ikirəqəmli nəticələri yenidən aşağı qatlayaraq). Bu mövqe çəkiləndirməsi (positional weighting) məhz anti-kommutativlik yamağıdır: iki qonşu rəqəmin yerini dəyişin — ən çox rast gəlinən insan səhvi — və ikiyə vurulan/vurulmayan rollar dəyişir, cəm dəyişir. Heç bir banka müraciət etmədən dərhal "invalid number" deyən hər kart forması bu 70 yaşlı checksum-u brauzerinizdə işə salır. Challenge bölməsində onu əllə icra edəcəksiniz.

</Note>

Mövqe çəkiləndirməsi qüsuru yamaqlayır. Amma *qəti* həll daha qəribə bir sualdan doğuldu: bəs mesajın baytlarını toplamaq əvəzinə bütün mesajı **bir nəhəng binar ədəd** kimi götürsək — və yalnız onun *qalığını (remainder)* saxlasaq?

## CRC: qalıq fəndi {/*crc-the-remainder-trick*/}

Bu dərsin fiziki maşını budur və o, kompüterlərdən əsrlərlə əvvəl mövcud idi. Uzun rəqəm sütunlarını köçürən mühasiblər **casting out nines** ("doqquzların atılması") adlı fənd işlədirdilər: böyük bir ədədin mod 9 qalığını hesabla (qısayol: rəqəmlərini topla, təkrar-təkrar). Ədədi köçür, qalığı yenidən hesabla — qalıqlar uyğun gəlmirsə, səhv köçürmüsən. Qalıq ixtiyari böyüklükdəki ədədin kiçik, sabit ölçülü *barmaq izidir* və demək olar ki, hər ləkə onu dəyişir. Bir ədəd — deyək ki, 7.354.682 — öz birrəqəmli şahidini daşıyır (7+3+5+4+6+8+2 → 35 → 8). Mühasibat dəftərləri beş yüz il özlərini bu cür nəzarətdə saxladı.

**CRC** — *cyclic redundancy check* — hardware üçün yenidən qurulmuş casting out nines-dır: mesaj bir nəhəng binar ədədə çevrilir və barmaq izi onun razılaşdırılmış sabitə — **generator**-a bölünməsindən sonrakı qalığıdır. İki mühəndislik təkmilləşdirməsi onu oxutdurur. Birincisi, bölmə Dərs 2-nin sevimli degenerativ arifmetikasında aparılır — carry-siz binar, harada çıxma da, toplama da **XOR**-a çökür — beləliklə "uzun bölmə" sadəcə shift-və-XOR-dur, silisiumda demək olar ki, pulsuz. İkincisi, və ən vacibi: generator ixtiyari deyil. Generatorlar əsl riyaziyyatla elə *seçilir* ki, sahədə real baş verən xəta nümunələri — tək fliplər, cüt fliplər və hər şeydən əvvəl **burst-lar** (cızıq, statik xışıltı: çoxlu ardıcıl xarab bit) — qalığı dəyişməyə zəmanətli olsun.

Birini tam, əllə, oyuncaq 4-bitlik generator `1011` ilə edək (əsl CRC-3). Mesaj: `1101`. Qayda: üç 0 əlavə et (generatorun uzunluğundan bir az — barmaq izinə yer açmaq üçün), sonra XOR ilə böl:

<Diagram name="checksum-crc/crc_division" height={400} width={720} alt="Binar XOR-da işlənmiş məktəb üslublu uzun bölmə. Yuxarıda bölünən 1101000, solda generator 1011. Dörd çıxma addımı: hər birində 1011 cari aparıcı 1-in altına düzlənir və XOR edilir: 1101000 xor 1011 = 0110000; sonra 110000 xor sürüşdürülmüş 1011 = 011100; sonra 11100 xor sürüşdürülmüş 1011 = 01010; sonra 1010 xor 1011 = 0001. Sağ qalan 3-bitlik qalıq 001 aşağıda mavi çərçivəyə alınıb, 'CRC' etiketi ilə. Yan qeyd: borrow-suz çıxma sadəcə XOR-dur.">

Çıxmanın heç vaxt borrow etmədiyi uzun bölmə: generatoru aparıcı 1-in altına düzlə, XOR et, təkrarla. Generatordan qısa nə sağ qalırsa, qalıqdır — CRC.

</Diagram>

```
Mesaj 1101, generator 1011 → 000 əlavə et:

  1101000
⊕ 1011          aparıcı 1-in altına düzlə, XOR et
  -------
   110000       (aparıcı sıfırlar düşür)
⊕  1011
   ------
    11100
⊕   1011
    -----
     1010
⊕    1011
     ----
      001       ← qalıq: CRC = 001

Ötürülən: 1101 001
```

Qəbul edənin gedişi gözəldir: *bütün* alınmış sətri — mesaj və CRC birlikdə — eyni generatora böl. Konstruksiya etibarilə əlavə edilmiş qalıq mesajın öz qalığını ləğv edir, ona görə toxunulmaz ötürmə qalıq **sıfır** qoyur:

```
Toxunulmaz alındı:  1101001 ÷ 1011  →  qalıq 000   ✓ təmiz

Zədəli alındı       1111001 ÷ 1011  →  qalıq 110   ✗ HƏYƏCAN
(bir bit çevrilib)
```

(Zədəli halı sözə inanaraq qəbul etməyin — onu özünüz bölmək challenge bölməsinin isinmə tapşırığıdır və qalıq həqiqətən `110`-dur.) Oyuncağı böyüdün və infrastrukturun içindəki dəqiq mexanizmi əldə edirsiniz: **CRC-32** — 33-bitlik generator, 4-baytlıq barmaq izi — **hər Ethernet frame-ini** möhürləyir (xarab frame → səssizcə atılır → TCP yenidən göndərir; bunu minlərlə dəfə heç nə kimi "görmüsünüz", məqsəd də elə budur), **hər PNG chunk-ını** (əlbəttə ki, big-endian-da), **hər ZIP-dəki hər faylı**, hər gzip axınını. Seçilmiş generatorun zəmanətləri: *bütün* tək-bit xətalar, 32 bitə qədər *bütün* burst xətalar və ixtiyari təsadüfi zibilin 2⁻³² dilimi — təxminən **4,3 milyardda 1** — istisna olmaqla hamısı. Və additiv cəmdən fərqli olaraq, bölmə sıraya qarşı vəhşicəsinə həssasdır. Toplama işi həll edə bilmədiyi halda əsl CRC-32-nin hökmünə baxın:

<TerminalBlock>

python3 -c "import zlib; print(hex(zlib.crc32(b'Hi')), hex(zlib.crc32(b'iH')))"
0x4d170e0e 0x8de10bb3

</TerminalBlock>

Eyni iki bayt, əks sıralar, barmaq izləri hətta uzaq qohum da deyil — halbuki additiv checksum hər ikisinə `0xB1` deyə and içirdi. NUXI anaqramının nəhayət yalnız *inventarı* yox, *ardıcıllığı* oxuyan şahidi var.

## Hamming-in qəzəbli həftəsonu {/*hammings-furious-weekend*/}

İndiyə qədər hər şey *detect* edir. Detection bir lüksü fərz edir: retransmission istəməyə kimsə. Ethernet-in üstündə TCP var; cızılmış CD-nin heç kimi yoxdur — orijinal press artıq yoxdur. Mars zondunun yenidən göndərmə xahişi hər istiqamətdə çox dəqiqələr çəkir. Və 1947-ci ildə Bell Labs-da **Richard Hamming** adlı riyaziyyatçının eyni problemin daha xırda versiyası var idi: onun öz hesablamalarını parity ilə yoxlayan rele kompüterinə həftəsonu girişi vardı — və parity onun nəzarətsiz cümə gecəsi işlərində siqnal verəndə, maşın onları sadəcə *atırdı* və Hamming bazar ertəsi heç nəyə gəlirdi. Bunun iki həftəsonu mühəndislik tarixinin ən məhsuldar hirs tutmalarından birini doğurdu. Sualı bu idi: *"Maşın xətanın baş verdiyini deyə bilirsə, HARADA olduğunu niyə deyə bilmir — və düzəldə bilmir?"* Onun 1950-ci il cavabı error-*correcting* kodların əsasını qoydu.

Konstruksiya sehr nömrəsinə oxşayıb ünvanlama sxemi çıxan fəndlərdəndir. 4 data biti götür; **3 parity biti** əlavə et; amma — dahiyanə gediş — *yeddi mövqeyi binar sistemdə 1-dən 7-yə qədər nömrələ* və hər parity bitinə həmin nömrələrə əsaslanan patrul zonası ver: parity 1 nömrəsində 1-ci bit qalxıq olan hər mövqeyi qoruyur (1,3,5,7); parity 2 — 2-ci biti qalxıq mövqeləri (2,3,6,7); parity 4 — 4-cü biti qalxıq mövqeləri (4,5,6,7):

<Diagram name="checksum-crc/hamming_venn" height={400} width={720} alt="Parity 1, parity 2 və parity 4 etiketli üç böyük kəsişən dairə, klassik üç-çoxluqlu Venn diaqramı. Yeddi bölgə mövqelərlə etiketlənib: yalnız-dairə bölgələri 1, 2 və 4 mövqelərini saxlayır (parity bitlərinin özləri); cüt kəsişmələr 3 (dairə 1 və 2), 5 (dairə 1 və 4) və 6 (dairə 2 və 4) mövqelərini; üçlü kəsişmə 7 mövqeyini. Hər bölgə nümunə codeword bit dəyərini göstərir: 1-dən 7-yə qədər mövqelər üçün 0,1,1,0,0,1,1. 6-cı mövqedəki bit qırmızı, çevrilmiş çəkilib və onu ehtiva edən iki dairə — parity 2 və parity 4 — qırmızı konturla 'FAIL' etiketləri ilə, parity 1 isə 'pass' işarəsi ilə. Alt yazı: uğursuz yoxlamalar 2 + 4 = 6 — xarab bitin öz ünvanı.">

Hər data biti patrul zonalarının unikal kombinasiyasında oturur. Bir biti çevirin — uğursuz patrulların *nümunəsi* çevrilmiş mövqeyin nömrəsidir, binar sistemdə yazılmış.

</Diagram>

`1011` datasını kodlayaq (3, 5, 6, 7 mövqelərinə yerləşdirilib) və hər patrulun öz zonası üzərində parity-sini hesablayaq:

```
mövqelər:    1   2   3   4   5   6   7
             p1  p2  d   p4  d   d   d
data:                1       0   1   1

p1 {1,3,5,7} üzrə:  1⊕0⊕1 cüt olmalıdır → p1 = 0
p2 {2,3,6,7} üzrə:  1⊕1⊕1 cüt olmalıdır → p2 = 1
p4 {4,5,6,7} üzrə:  0⊕1⊕1 cüt olmalıdır → p4 = 0

Codeword:    0   1   1   0   0   1   1
```

İndi sehr nömrəsi. Kosmik şüa 6-cı mövqeyi çevirir (1 → 0). Qəbul edən üç patrulu yenidən işə salır:

```
check 1 {1,3,5,7}: 0⊕1⊕0⊕1 = 0   cüt → PASS
check 2 {2,3,6,7}: 1⊕1⊕0⊕1 = 1   tək → FAIL
check 4 {4,5,6,7}: 0⊕0⊕0⊕1 = 1   tək → FAIL

Uğursuz patrullar: 2 və 4  →  2 + 4 = 6
```

**Uğursuz yoxlamaların cəmi xarab bitin ünvanıdır.** Təsadüfən yox — konstruksiya etibarilə: 6-cı mövqe binar sistemdə `110`-dur, deməli patrul 2-nin zonasında və patrul 4-ün zonasındadır, patrul 1-in zonasında deyil — deməli məhz o patrullar siqnal verir. Syndrome xətaya *işarə etmir*; onu Dərs 2-nin mövqeli binar sistemində **hərfbəhərf yazır**. 6-cı biti geri çevirin; data *sağaldı* — retransmission yox, orijinal yox, insan yox. (Və xırda şriftə diqqət — aşağıdakı oyuncaq onu öz gözünüzlə görməyə imkan verəcək: *iki* biti çevirin və syndrome yenə hansısa yerə işarə edəcək — əminliklə və *yanlış*. Ona görə real sistemlər genişləndirilmiş SECDED kodları işlədir — "single error correct, double error detect" — təmiri pusqudan ayıran bir əlavə ümumi parity biti.)

Bu, muzey riyaziyyatı deyil. **ECC memory** — hər ciddi serverdə standart, bu dərsin oxunduğu laptopda nəzərəçarpacaq şəkildə yoxdur — hər 64-bitlik sözü məhz bu konstruksiyanın 72 biti kimi saxlayır və Google tədqiqatının xəta sürətini bütün günü səssizcə sağaldır. Schaerbeek maşınında, sözsüz ki, bu yox idi; 4.096 xəyali səs səkkiz əskik çipin qiyməti idi. Bir bitdən böyük zədə üçünsə — cızıq, burst — Hamming-in ideyası **Reed–Solomon kodlarına** (1960) çevrildi: onlar bütöv *baytlar* üzərində işləyir və eyni anda onlarlasını düzəldir. Keçən dərsin intriqası burada açılır: CD saniyədə 176.400 baytını cross-interleaved Reed–Solomon-a (**CIRC**) bükür — əvvəlcə baytları *qarışdırır* ki, cızığın zədəsi yığılmış yox, səpələnmiş düşsün (interleaving bir ölümcül burst-u çoxlu cüzi cızmaya çevirir), sonra **təxminən 4.000 ardıcıl itirilmiş biti — təqribən 2,5 mm treki** — eşidilə bilən heç bir iz qoymadan sağaldır. Skan etdiyiniz hər QR kodu eyni ailəni daşıyır, **30%-ə qədər dağıntıya** davam gətirəcək şəkildə tənzimlənmiş — buna görə loqonu kodun düz ortasına basmaq olur və o yenə skan olunur: loqo datadan yayınmır, onu *məhv edir* və Reed–Solomon itkini hər skanda, əbədi olaraq yenidən qurur. Voyager-in planetlərin o tayından fotoları, DVD-lər, RAID-6 massivləri, 5G, peyk əlaqələri: hamısı eyni nəsil, hamısı həftəsonu işləri ölüb gedən bir adamdan törəmə.

<DeepDive>

#### Bitsquatting: flip hücumçunun xeyrinə işləyəndə {/*bitsquatting-when-the-flip-works*/}

Bit flipləri şəxsi məsələyə çevirən bir tədqiqat nəticəsi. 2011-ci ildə təhlükəsizlik tədqiqatçısı Artem Dinaburg fitnəkar bir sual verdi: RAM bitləri təbiətdə çevrilirsə, deməli bəzən *saxlanmış domain adının* içində də çevrilməlidirlər — bəs məşhur adların bir bit çevriləndə çevrildiyi domenləri qeydiyyatdan keçirsək necə? `fbcdn.net` (Facebook-un CDN-i) `fbcdn.ne**f**`-dən bir çevrilmiş bit uzaqdadır... və başqa bir neçə onlarla tək-bit mutantdan, əksəriyyəti qeydiyyata açıq. O, belə **bitsquat** domenlərindən bir dəst qeydiyyatdan keçirdi, serverlər qurdu və gözlədi. Serverlər real bağlantıların sabit axınını aldı — sonrakı aylar ərzində minlərlə unikal maşın — telefonlardan, desktoplardan, hətta embedded cihazlardan: yaddaşları hər checksum artıq keçdikdən *sonra* bir bit çevirmiş və sahiblərinin heç vaxt yazmadığı domenə səmimi-qəlbdən müraciət edən cihazlar. Nə exploit, nə phishing, nə malware: hücum səthi fizika idi. Bu dərsin threat model-i üçün mükəmməl yekun eksponatdır — bütövlük yoxlamaları datanı *yolda* və *öz əhatə dairəsi (span) daxilində saxlanarkən* qoruyur, amma yoxlamalar arasındakı boşluqda, hostname saxlayan canlı RAM-da çevrilən bitin heç bir şahidi yoxdur (o RAM ECC deyilsə — istehlakçı cihazlarında isə deyil). Bu dünyada müdafiə belə görünür: vacib yerlərdə ECC, ehtiyat sığorta kimi TLS certificate validation (bitsquat serveri *nəzərdə tutulan* ad üçün etibarlı sertifikat təqdim edə bilməz) və öz mutantlarını sakitcə qeydiyyatdan keçirən korporasiyalar.

</DeepDive>

<DeepDive>

#### Checksum özü yalan deyəndə {/*when-the-checksum-itself-lies*/}

Sahədən iki ayıldıcı qeyd və onların məcbur etdiyi dizayn prinsipi. Birincisi: əhatə boşluqları realdır. Məşhur SIGCOMM 2000 tədqiqatı (Stone & Partridge) canlı internet trafikini tutdu və korlanıb *inandırıcılığa qədər təmir edilmiş* data tapdı — Ethernet-in CRC-sinin hər hop-da tutduğu, amma qorumalar *arasında* yenidən daxil edilmiş xətalar (router yaddaşında, buqlu NIC firmware-ində, software kopyalamalarında) — sonra sanki qanuni imiş kimi yenidən checksum edilmiş. Onların qiymətləndirməsi: hər 16 milyonda 1 ilə hər 10 milyardda 1 arasında TCP seqmenti 16-bitlik TCP checksum-un görmədiyi xəta daşıyır — paket başına cüzi, data mərkəzi başına gündə isə qaçılmaz (Dərs 2-nin vurması, həmişəki kimi). Hər yoxlama yalnız öz **span**-ını qoruyur; span-lar arasındakı korrupsiya təmiz sağlamlıq arayışı ilə miras qalır.

İkincisi: bu dərsdəki hər şey *qəzalara* qarşı riyaziyyatdır və qəzalar geri vurmur. CRC xətti funksiyadır — faylınızı dəyişdirmək *və CRC-32-sini qorumaq* istəyən hücumçu bunu kağız-qələmlə edə bilər; cəmi 2³² mümkün variant var və cəbr açıqdır. Buna görə "integrity" iki peşəyə bölünür: CRC-lər və checksum-lar **təbiətə** qarşı (sürətli, ucuz, təsadüfi zədəyə qarşı zəmanətli) və **kriptoqrafik hash-lar** — SHA-256 və qohumları — **insanlara** qarşı (elə dizayn edilib ki, eyni barmaq izinə malik *hər hansı* ikinci girişi tapmaq hesablama baxımından ümidsizdir). Birlikdə onlar **end-to-end argument** (Saltzer, Reed & Clark, 1984) adlanan iş qaydasını verir: aralıq yoxlamalar optimallaşdırmadır; *səlahiyyətli* yoxlama hər şeyi əhatə edərək endpoint-lərdə baş verməlidir — buna görə ZFS və müasir verilənlər bazaları hər aşağı qat artıq bütövlüyə "zəmanət verdiyi" halda belə hər bloku application qatında checksum edir və buna görə həqiqətən əhəmiyyət verdiyiniz yükləmə *müstəqil* kanaldan gələn SHA-256 ilə yoxlanılır. Link-lərə yox, span-lara etibar edin.

</DeepDive>

<Pitfall>

**"Checksum uyğun gəlir" hiss etdirdiyindən daha azını sübut edir.**

Birinci səhv: uyğun gələn CRC-ni heç kimin müdaxilə etmədiyinin sübutu saymaq. CRC-32 *"bu, ehtimal ki, qəza nəticəsində zədələnib?"* sualına cavab verir — hücumçu faylı mikrosaniyələr ərzində istədiyi CRC-yə uyğunlaşdırır. Tamper-evidence kriptoqrafik hash tələb edir və hətta o zaman da: yükləmə ilə *eyni serverdə* dərc edilmiş SHA-256 teatr tamaşasıdır — faylı əvəz edən şəxs eyni sındırmada hash sətrini də redaktə edir. İstinad barmaq izi hücumçunun nəzarət etmədiyi kanalla gəlməlidir (imzalanmış release açarları, ayrıca mənbə).

İkinci səhv: hansısa aşağı qatın bunu "onsuz da həll etdiyini" güman etmək. TCP-nin checksum-u 16 bitdir və span-la məhduddur; Ethernet-in CRC-si hər hop-da ölür; ECC-siz RAM saxlanma zamanı heç nəyi qorumur. Data *vacibdirsə* — backup-lar, maliyyə qeydləri, elmi nəticələr — **end to end** yoxlayın: yaradılma anında fingerprint götürün, fingerprint-i ayrıca saxlayın, hər miqrasiyadan sonra və müntəzəm cədvəllə yenidən yoxlayın. Bit rot-un sevimli qurbanları beş ildir heç kimin açmadığı fayllardır — ən çox lazım olacaq backup, müşahidəsiz çürüməyə ən uzun vaxtı olmuş backup-dır.

</Pitfall>

## Təmir maşını {/*the-repair-machine*/}

Aşağıda bu dərsdəki Hamming(7,4) kodu canlı işləyir — `1011` datasını qoruyan `0110011` codeword-ü. Hər hansı bitə klikləyib onu zədələyin (sifarişlə kosmik şüa) və üç patrulun yenidən işə düşməsinə baxın: uğursuz yoxlamaların cəmi günahkarın ünvanıdır və maşın ona işarə edir. Sonra xırda şriftin xəbərdarlıq etdiyi eksperimenti aparın: **iki** biti çevirin və özünə əmin maşının yanlış biti təmir etməsinə baxın:

<Sandpack>

```js
import { useState } from 'react';

const CLEAN = [0, 1, 1, 0, 0, 1, 1]; // data 1011, mövqelər 3,5,6,7

export default function RepairMachine() {
  const [bits, setBits] = useState(CLEAN);
  const flip = (i) => setBits(bits.map((b, j) => (j === i ? 1 - b : b)));
  const at = (p) => bits[p - 1];
  const checks = [
    { n: 1, zone: [1, 3, 5, 7] },
    { n: 2, zone: [2, 3, 6, 7] },
    { n: 4, zone: [4, 5, 6, 7] },
  ].map((c) => ({
    ...c,
    fail: c.zone.reduce((s, p) => s ^ at(p), 0) === 1,
  }));
  const pos = checks.reduce((s, c) => s + (c.fail ? c.n : 0), 0);
  const damage = bits.filter((b, i) => b !== CLEAN[i]).length;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>
        Codeword-ü zədələmək üçün bitlərə klikləyin (data 1011):
      </p>
      <div>
        {bits.map((b, i) => (
          <button key={i} onClick={() => flip(i)} style={{
            width: 44, height: 56, margin: 2, fontSize: 20,
            borderRadius: 8, cursor: 'pointer',
            border: pos === i + 1
              ? '3px solid #c1554d' : '1px solid #888',
            background: [0, 1, 3].includes(i) ? 'transparent' : '#087ea41f'
          }}>
            {b}
            <div style={{ fontSize: 10, color: '#888' }}>
              {[0, 1, 3].includes(i) ? 'p' : 'd'}{i + 1}
            </div>
          </button>
        ))}
      </div>
      <p>
        {checks.map((c) => (
          <span key={c.n} style={{
            margin: 6, color: c.fail ? '#c1554d' : '#087ea4'
          }}>
            check {c.n}: {c.fail ? 'FAIL' : 'pass'}
          </span>
        ))}
      </p>
      {pos === 0 && <p style={{ fontFamily: 'system-ui' }}>
        Bütün patrullar keçir — codeword təmizdir.</p>}
      {pos > 0 && <p style={{ fontFamily: 'system-ui' }}>
        Uğursuz yoxlamaların cəmi <b>{pos}</b> → bit {pos} ittiham olunur.{' '}
        {damage === 1 && 'Düzdür! Sağaltmaq üçün ona klikləyin.'}
        {damage === 2 && <b style={{ color: '#c1554d' }}>
          Amma SİZ iki bit çevirdiniz — maşın yanlış biti təmir edir.</b>}
      </p>}
    </div>
  );
}
```

</Sandpack>

O iki-flip xəyanəti üzərində oturub düşünməyə dəyər: syndrome hesabı qüsursuzdur, nəticə əminliklə yanlışdır — çünki *müqavilə* yalnız tək flipləri əhatə edir. Bu dərsdəki hər bütövlük mexanizmi dəqiq sərhədləri olan dəqiq vəddir: parity (yalnız tək saylar), CRC-32 (burst-lar ≤ 32, qəza — bədniyyət yox), Hamming (bir flip, iki yox). Onlarla mühəndislik etmək vədi bilmək deməkdir, yaşıl işarənin parıltısına inanmaq yox.

<Recap>

- **Bitlər çevrilir.** Kosmik şüalar, alfa zərrəcikləri, elektrik səs-küyü və köhnəlmə tək-bit xətaları lətifə yox, *sürət* edir (park miqyasında yaddaş modullarının ≈8%-i ildə xəta qeydə alır). Fliplər barmaq izi qoyur: təmiz **ikinin qüvvəti** qədər yanlış dəyərlər — Schaerbeek-in 4.096 xəyali səsi = bit 13.
- Müdafiə fəlsəfəsi **redundancy**-dir: datadan hesablanmış, onunla birlikdə səyahət edən əlavə bitlər — hər kəs yenidən hesablayıb müqayisə edə bilsin deyə. Mexanizmlər sübut nərdivanı qurur.
- **Parity** (1 əlavə bit): hər *tək* sayda flipi tutur, hər cüt sayına kordur və heç nəyin yerini tapa bilmir. Onilliklər boyu serial xətləri və doqquzuncu RAM çipini qorudu.
- **Additiv checksum-lar** daha güclüdür, amma **kommutativdir** — `Hi` və `iH` hər ikisi `0xB1` verir, deməli yerdəyişmə (Dərs 5-in bütün cinayətkarlar qalereyası) aşkarsız keçir. Hər IP/TCP/UDP header-indəki Internet checksum Dərs 3-ün **one's complement, end-around carry**-sidir — vəd yerinə yetirildi. Luhn-un kart nömrəsi yoxlaması transpozisiyanı mövqeli ikiyəvurma ilə düzəldir.
- **CRC** sənayeləşdirilmiş casting-out-nines-dır: mesaj bir nəhəng binar ədəd kimi, seçilmiş generatora qarşı **XOR-bölmə qalığı** ilə fingerprint edilir. CRC-32 (Ethernet, ZIP, PNG, gzip) bütün tək flipləri və ≤ 32 bitlik bütün burst-ları zəmanətləyir, təsadüfi zibili yalnız 2³²-də 1 halda qaçırır — və sıraya qarşı amansız həssasdır: `Hi` → `4d170e0e`, `iH` → `8de10bb3`.
- **Hamming kodları** *düzəldir*: mövqeləri binar sistemdə nömrələ, bit üzrə patrul et; uğursuz yoxlamaların **cəmi çevrilmiş bitin ünvanıdır**. ECC server RAM-ı (64-ə 72 bit) səssizcə sağaldır; iki flip onu aldadır, buna görə SECDED. **Reed–Solomon** burst-ları sağaldır: CIRC CD-yə ~4.000 ölü bitə (≈2,5 mm cızığa) davam gətirmə imkanı verir; QR kodlar 30% dağıntıya davam gətirir — loqo elə *zədənin özüdür*, hər skanda təmir edilir.
- Mühakimə qatı: yoxlamalar yalnız öz **span**-larını qoruyur (span-lar arasındakı korrupsiya təmiz kimi yenidən checksum edilir); CRC-lər **qəzalarla** vuruşur, kriptoqrafik hash-lar **düşmənlərlə**; səlahiyyətli yoxlama **end to end** aparılmalıdır, fingerprint-lər isə out-of-band saxlanmalıdır.

</Recap>

<Challenges>

#### Qəbul edən kimi böl {/*divide-like-a-receiver*/}

Dərs `1101 001` ötürdü (mesaj + CRC-3, generator `1011`) və zədəli versiya `1111001`-in `110` qalığı verdiyini iddia etdi. Hər ikisini əllə yoxlayın: `1101001`-i bölün (təmiz çıxmalıdır) və `1111001`-i (qalıq `110` çıxmalıdır). Hər XOR addımını göstərin.

<Hint>

Generatoru cari ən soldakı 1-in altına düzləyin, XOR edin, aparıcı sıfırların düşməsinə imkan verin, qalan generatordan qısa olana qədər (3 bit və ya az) təkrarlayın. Toxunulmaz hal dəqiq `000` ilə bitməlidir.

</Hint>

<Solution>

Toxunulmaz ötürmə — hər düzləmə üçün generatoru tam endə yazın (hardware-in shift register-inin etdiyinin eynisi və məktəb üslublu pilləli yazılışdan qat-qat çətin səhv salınır):

```
  1101001
⊕ 1011000        (generator bit 6-da düzlənib)
  = 0110001
⊕  101100        (bit 5-də düzlənib)
  = 0011101
⊕   10110        (bit 4-də düzlənib)
  = 0001011
⊕    1011        (bit 3-də düzlənib)
  = 0000000      → qalıq 000 ✓ təmiz
```

Zədəli ötürmə (bit 4 çevrilib):

```
  1111001
⊕ 1011000        → 0100001
⊕  101100        → 0001101
⊕     1011       → 0000110   → qalıq 110 ✗ HƏYƏCAN ✓
```

Həm də qəbul edənin heç vaxt *nəyə* ehtiyac duymadığına diqqət edin: orijinal mesaja. Alınmış sətir öz haqqında ifadə verir — əlavə edilmiş qalıq elə qurulmuşdu ki, həqiqət sıfıra bölünsün.

</Solution>

#### Cüzdanınızdakı rəqəm {/*the-number-in-your-wallet*/}

`4539 1488 0343 6467` (test) kart nömrəsi üzərində Luhn yoxlamasını icra edin. Resept: **ən sağdakı** rəqəmdən başlayaraq hər ikinci rəqəmi ikiyə vurun (sağdan 2, 4, 6… mövqelər); ikiyəvurma iki rəqəm verirsə, onları toplayın (məs. 8 → 16 → 1+6 = 7); hamısını toplayın; cəm 0 ilə bitirsə, nömrə etibarlıdır. Sonra cavablandırın: ikiyəvurma addımı hansı gündəlik yazı səhvini tutmaq üçün xüsusi dizayn edilib və adi rəqəm cəmi onu niyə qaçırardı?

<Solution>

Sağdan işləyərək (`7` mövqe 1-dir):

```
mövqe:  16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1
rəqəm:   4  5  3  9  1  4  8  8  0  3  4  3  6  4  6  7
×2:      ×     ×     ×     ×     ×     ×     ×     ×
olur:    8  5  6  9  2  4  7  8  0  3  8  3  3  4  3  7
         (16→7)            (16→7)       (12→3) (12→3)

Cəm: 8+5+6+9+2+4+7+8+0+3+8+3+3+4+3+7 = 80  → 0 ilə bitir ✓ ETİBARLI
```

Hədəfə alınmış səhv **qonşu transpozisiyadır** — `…64…`-ü `…46…` kimi yazmaq, insan data-daxiletməsinin ən çox rast gəlinən xətası. Adi rəqəm cəmi kommutativdir, ona görə yerdəyişmələr ona görünməzdir (`Hi`/`iH` xəstəliyi onluq sistemdə). Luhn-da qonşu mövqelərin *fərqli* rejimi var (biri ikiyə vurulur, digəri yox), ona görə iki qeyri-bərabər qonşunun yerini dəyişmək demək olar ki, həmişə cəmi dəyişir. CRC-vs-additiv dərsinin eynisi, 1954-cü ildə, 1950-ci illərin ofis maşınları nəzərdə tutularaq həll edilib: sıra vacibdirsə, fingerprint mövqeləri çəkiləndirməlidir.

</Solution>

#### Config yeyən dedup {/*the-dedup-that-ate-a-config*/}

Transfer tapşırığı. Design-review ticket-i: fayl-sinxronizasiya məhsulu iki faylın eyni olduğuna qərar verir — və səssizcə yalnız birini saxlayır — onların **(size, additiv-checksum)** cütü uyğun gələndə, "çünki hər faylı hash etmək çox yavaşdır". Müştəri iki *fərqli* server config faylının birinə birləşdirilib deployment-ləri korladığını bildirir. Sxemi məğlub edən ən kiçik nümayiş cütünü qurun, uğursuzluq sinfini dəqiq izah edin və konkret düzəlişlə (checksum-ların hansı rolu saxlamalı olduğu da daxil olmaqla) review hökmünü yazın.

<Solution>

**Nümayiş cütü** — dərsin öz iki baytı kifayətdir:

```
fayl A: "Hi"   size 2, cəm 0x48+0x69 = 0xB1
fayl B: "iH"   size 2, cəm 0x69+0x48 = 0xB1   → "eynidir" ✗
```

Eyni baytların istənilən permutasiyası toqquşur: `listen.conf` vs `silent.conf` məzmunu, yeri dəyişmiş YAML açarları, qarışdırılmış sətir sırası — məhz real config fayllarının keçirdiyi redaktələr. **Uğursuzluq sinfi:** additiv checksum kommutativdir və mövqeyə kordur, deməli faylın bayt *ardıcıllığını* yox, bayt *inventarını* fingerprint edir; onu identiklik testi kimi işlətmək anaqramları bərabər elan edir. (Kompensasiya edən redaktələr də toqquşur — bir bayt +1, digəri −1.)

**Review hökmü:** *"Blocking: content identity kolliziya-davamlı fingerprint ilə müəyyən edilməlidir. Additiv cəmi məzmunun SHA-256-sı ilə əvəz edin (throughput narahatlıqdırsa BLAKE3 — müasir hash-lar saniyədə çoxlu GB sürətlə işləyir, ona görə 'çox yavaş' fərziyyə yox, benchmark tələb edir); hər hansı adversarial girişlərlə üzləşəcəyiksə, hash uyğunluğunda tam məzmunu müqayisə edin. Ucuz yoxlamalar öz düzgün işlərini saxlayır: size və sürətli checksum* neqativ *filtr kimi qəbulediləndir (uyğunsuzluq ⇒ qəti fərqlidir, hash-ı buraxın) — pozitiv hökmü heç vaxt onlar verməməlidir. Və end-to-end praktikaya uyğun: fingerprint-i transferdən sonra təyinat nöqtəsində yoxlayın, təkcə mənbədə yox."*

Ümumi prinsip, bu modulun səsi ilə son dəfə: hər fingerprint **bəyan edilmiş əhatəli müqavilədir** — parity tək flipləri əhatə edir, CRC burst-ları, additiv cəmlər sıra haqqında demək olar heç nəyi — və production insidentləri kodun müqavilənin heç vaxt təklif etmədiyi əhatəni sakitcə fərz etdiyi zaman baş verir. ✓

</Solution>

</Challenges>

<LearnMore title="Sıxılma: ZIP necə işləyir (Huffman, LZ)" path="/learn/faza-0/modul-0-1/compression">

Bu dərs bitləri qəsdən xərclədi — zədə gizlənə bilməsin deyə əlavə edilmiş redundancy. Növbəti dərs maşını tərs istiqamətdə işlədir: redundancy *ovlanır və məhv edilir* ki, eyni data daha az bitə sığsın. Bu, Dərs 7-nin sirrinin çatışmayan parçasıdır (3 MB faylda yaşayan 36 MB foto), açdığınız hər ZIP-in içindədir — indi başa düşdüyünüz CRC-32-nin lap yanında — və onun mərkəzi alqoritmini 1951-ci ildə kurs işi ilə final imtahanı arasında seçim edən bir magistrant icad edib. O, kurs işini seçdi.

</LearnMore>