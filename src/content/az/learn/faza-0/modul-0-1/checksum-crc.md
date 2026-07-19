---
title: "Data Bütövlüyü: Parity, Checksum-lar, CRC"
---

<Intro>

2003-cü il may ayının 18-də, Schaerbeek Brüssel bölgəsindəki elektron səsvermə maşını yerli namizəd Maria Vindevoghel-ə **4,096 əlavə səs** verdi. Xəta yalnız ona görə aşkarlandı ki onun cəmi onu seçə biləcək insanların sayını aşdı; yenidən sayım maşının heç nədən səslər icad etdiyini təsdiqlədi. Rəsmi araşdırma heç bir xəta, fırıldaqçılıq, yenidən istehsal oluna bilən nasazlıq tapmadı — və dəqiqliklə uyğun gələn yeganə izahla nəticəlandı: bir bit, səs sayğacının 13-cü biti, özbaşına 0-dan 1-ə çevrildi. Bit 13-ün nə qiymət daşıdığını bilirsiniz: **2¹² = 4,096** — bu rəqəm təsadüfi deyildi, ikilik qüvvətin bir yüksəkdir, bir tranzistorun zəiflik anının dəqiq barmaq izi, çox güman ki qalaktikanın qarşısındakı kosmik şüadan gəlmiş bir zərrəcik tərəfindən baş vermişdir. Yeddi dərs sizi bitlərə dünya kodlaşdırmağa öyrətdi. Bu dərs həmin dərslərin təxirə saldığı narahat həqiqətlə üzləşir: **bitlər çevrilir**. Yaddaş unudur, kabellar küy pıçıldar, disklər cızılır — və datanız dəyişdirildikdə xəbər tutmaq üçün bütöv bir riyaziyyat sahəsi var. Bəziləri hətta datanı *geri qaytara bilir*.

</Intro>

<YouWillLearn>

- Bitlər fiziki dünyada niyə çevrilir — kosmik şüalar, küy, aşınma — və miqyasda "milyardda bir" niyə *gündəlik* deməkdir
- **Parity**: bir-bitlik qoruyan, tam olaraq nəyi tutduğu, iki çevrilmənin kor nöqtəsi
- **Checksum-lar**: sadə byte cəmindən (və onu aldadan yenidən sıralama xətasından) hər IP paketindəki Internet checksum-a qədər
- **CRC**: ZIP, PNG və Ethernet-in arxasındakı qalıq hiyləsi — tam əl hesabı ilə, uzun bölmə daxil
- **Səhv düzəltmə**: Hamming-in qəzəbli həftəsonu, yoxlama uğursuzluqlarının qırıq bitin ünvanını *hərflə ifadə etdiyi* kod, Reed–Solomon-un cızılmış CD-ləri və üstündən xətt çəkilmiş QR kodları sağalması
- Professional qərar qatı: aşkarlama vs düzəltmə, qəza vs düşmən, doğrulamanın pipeline-da nə yerdə aparılması

</YouWillLearn>

## Düşmən: çevrilmiş bitlər {/*the-enemy-flipped-bits*/}

1-ci Dərs o gündən bəri hər şeyin altında sessiz işləyən sadələşdirici bir söz verdi: bir bit, bir dəfə yazıldıqda, *yazılmış qalır*. Fizika əslində bu müqaviləni imzalamır. DRAM hüceyrəsi bir neçə on min elektron tutan mikroskopik kondensatordur; yüksək enerjili bir zərrəcik — atmosferin yuxarı qatlarından kosmik şüa törəməsi, çipin öz qablaşmasındakı radioaktiv atomlardan alfa zərrəciyi — onu çevirmək üçün kifayət qədər yük tulla ya çəkə bilər. Gərginlik sıçramaları tarlarda bit çevirir. Köhnə disklərə maqnitləşmə solur; yaşlanmış flash hüceyrələrindən yük axır (sənayenin termini, **bit rot**, metafora deyil); CD üzərindəki barmaq izi bir anda minlərlə biti silib atar.

İstənilən *tək* çevrilmə inanılmaz dərəcədə nadirdir. Lakin siz yeddi dərs nadir hadisələrlə kompüterlərin nə etdiyini öyrəndiniz: onları astronomik saylarla vurur. Google-un öz fleet-i üzərindəki əsas 2009-cu il araşdırması **yaddaş modullarının təxminən 8%-nin ildə ən azı bir xəta qeyd etdiyini** tapdı — data mərkəzindəkilər üçün kosmik şüalar anek­dot deyil, *rate*-dir.

Schaerbeek dəqiq olaraq *aşkarlandığı* üçün dəyərlidir — və *necə* aşkarlandığına diqqət yetirin. Korrupsiya riyaziyyat vasitəsilə özünü bildirdi: sayğac tam olaraq 2¹² qədər sıçradı. Bit çevrilməsindən korrupsiya həmişə bu imzanı daşıyır — tam ikilik qüvvəti qədər fərqli bir dəyər — 5-ci Dərsdəki byte sırası xətaları özlərini anaqram kimi bildirdiyi kimi. İmzaları öyrənin; onlar bir debug sessiyasını günlərdən dəqiqələrə endirir. Dərin düzəltmə daha yaxşı hardware deyil — siz hər kondensatoru qalaktikaya qarşı zirehliyə ala bilmirsiniz. Düzəltmə bir fəlsəfə dəyişiklidir: **saxlanılan dataya saxlanmış qalmağa inam etməyi dayandırın və datanı özü haqqında dəlil daşımasını təmin edin.** Bu dərsdəki hər mexanizm həmin bir fikirdir — **artıqlıq**: yük bitlərindən hesablanmış, onlarla birlikdə gedən, alıcının (ya da gələcəyin) yenidən hesablayıb müqayisə edə biləcəyi əlavə bitlər.

## Parity: bir-bitlik qoruyan {/*parity-the-one-bit-guard*/}

Ən ucuz mümkün dəlillə başlayın: **bir əlavə bit**. **Cüt parity** müqaviləsi: datanızdakı 1-ləri sayın; ümumi sayı *cüt* etmək üçün seçilmiş bit əlavə edin. Sxemin hamısı budur.

```
'H' = 01001000        birlik: 2 (cüt)    → parity bit 0
'i' = 01101001        birlik: 4 (cüt)    → parity bit 0
'C' = 01000011        birlik: 3 (tək)    → parity bit 1

saxlanılan 'C':  01000011 1      ← 9 bit indi birlikdə gedir
```

Alıcı yenidən sayır. Tək sayda 1-i olan doqquz bit = **xəbərdarlıq**: bir şey çevrildi. Öz ölçüsü üçün zəmanət möhkəmdir: *istənilən* tək-bit çevrilmə — datada *ya da parity biti-nin özündə* — sayın cütlüyünü dəyişdirir, buna görə tək çevrilmə heç vaxt sürüşə bilmir. Bir bit overhead üçün bu olduqca dəyərli bir alım idi.

Lakin iki kor nöqtəyə baxın, çünki onlar sonra gələn hər şeyi müəyyənləşdirir:

<DiagramGroup>

<Diagram name="checksum-crc/parity_catch" height={320} width={340} alt="A row of eight bit cells 01000011 plus a ninth separated parity cell holding 1, labeled 'even parity: total count of ones is even (4)'. Below, the same row with one data bit flipped, drawn in red: 01001011, parity still 1, and a counter noting five ones — odd. A red alarm label reads 'recount is odd: flip detected'.">

Bir çevrilmə cütlüyü həmişə pozur. Parity biti hansı bitin yalan söylədiyini deyə bilmir, yalnız birinin dediyi.

</Diagram>

<Diagram name="checksum-crc/parity_blind" height={320} width={340} alt="The same nine cells with two data bits flipped, both drawn in red: the count of ones goes from four to four again. A muted label reads 'recount is even: silence'. A caption warns: two flips cancel — the guard sees nothing.">

İki çevrilmə cütlüyü həmişə bərpa edir. Parity hər cüt sayda fəlakətə kordur, yalnız *aşkarlaya bilir* amma heç vaxt yerini təyin edib düzəldə bilmir.

</Diagram>

</DiagramGroup>

Beləliklə: parity **istənilən tək sayda çevrilməni aşkarlayır, istənilən cüt sayı qaçırır, heç nəyi yerini aşkar etmir, heç nəyi düzəltmir**. Bu tripwire-dır, şahid deyil. Daha yaxşı etmək üçün dəlillər daha zəngin olmalıdır — açıq növbəti fikir bitləri saymağı dayandırıb *byte-ları toplamaq*dır.

## Checksum-lar: dəlilləri toplamaq {/*checksums-summing-the-evidence*/}

Ən sadə formada **checksum**: bütün byte-ları toplayın (cəmi sabit genişlikdə sarmayın — 2-ci Dərsdəki odometer, bir dəfə dürüstcə istifadə olunur) və cəmi birlikdə göndərin.

```
"Hi"  =  0x48 + 0x69  =  0xB1        ← 1 byte dəlil
```

İndi demək olar ki hər yerdəki çevrilmə cəmi dəyişdirir, *cəmin genişliyi isə* çözünürlük alır: tək bir yanlış byte 8-bitlik checksum-u dəyişdirir, yalnız xəta 256-nın tam mislinə bərabər deyilsə. Bir parity bitindən çox güclü. Bu ailə orta riskdə hər yerdədir: hər IP, TCP və UDP başlığını qoruyan **Internet checksum** 16-bitlik toplaqdır — maraqlıdır ki, **birlik tamamlayıcı arifmetikada end-around carry ilə** hesablanır, tam 3-cü Dərsdəki mexanizm paket başlıqlarında yenidən görüşəcəyinizi vəd edərək sürgün etdi. Budur, göndərdiyiniz hər paketi emal edir.

Lakin toplamanın struktur qüsuru var, riyaziyyat dərslərindən adını bilirsiniz: **toplama kommutativdir**. Toplama *sıraya* əhəmiyyət vermir:

```
"Hi"  =  0x48 + 0x69  =  0xB1
"iH"  =  0x69 + 0x48  =  0xB1        ← eyni dəlil!
```

5-ci Dərsdəki qorxduğunuz tam korrupsiya — özünüzün byte-ları, bütöv amma *yenidən sıralanmış*, NUXI anaqramı, dəyişdirilməmiş uzunluq prefiksi — additivchecksum-dan keçib gedir. `Hi` ilə `iH` arasındakı fərqi görə bilməyən checksum bütün mebelin yerli-yerindəyini yoxlayan amma evin dağıdılıb-dağıdılmadığını yox­lamayan qoruyucudur.

<Note>

Sıralama probleminin ən məşhur düzəltməsi pul kisənizdədir. **Luhn alqoritmi** (Hans Peter Luhn, IBM, 1954-cü ildə patentlənib) hər kredit kartı nömrəsinin son rəqəmini hesablayır — toplamadan əvvəl *hər ikinci rəqəmi iki dəfə artırır* (iki rəqəmli nəticələri geri qatlayır). Bu mövqe çəkisi dəqiq anti-kommutativlik yamasıdır: qonşu iki rəqəmi dəyişdirin — ən ümumi insan yazım xətası — iki dəfə artırılmış/artırılmamış rollar dəyişir, cəmi dəyişir. "Yanlış nömrə" deyən hər kart formu bankla əlaqə saxlamadan əvvəl bu 70 illik checksum-u brauzerinizdə işlədir.

</Note>

Mövqe çəkisi qüsuru bağlayır. Lakin *qəti* həll daha qəribə bir sual soruşmaqdan gəldi: ya byte-ları toplamaq əvəzinə bütün mesajı **bir nəhəng ikili ədəd** kimi qəbul etsək — və yalnız onun *qalığını* saxlasaq?

## CRC: qalıq hiyləsi {/*crc-the-remainder-trick*/}

Budur bu dərsin fiziki maşını, kompüterlərdən əsrlər əvvəl mövcud olub. Uzun rəqəm sütunlarını köçürən mühasiblərin **dokuzu atmaq** adlı hiylədən istifadə edirdi: böyük bir ədədin mod 9-uncu qalığını hesablayın (qısayol: rəqəmlərini toplayın, təkrar). Ədədi köçürün, yenidən qalığı hesablayın — qalıqlar uyğun gəlmirsə, yanlış köçürdünüz. Qalıq ixtiyari böyük bir ədədin kiçik, sabit ölçülü *barmaq izidir* və demək olar ki istənilən ləkə onu dəyişdirir.

**CRC** — *cyclic redundancy check* — hardware üçün yenidən qurulmuş dokuzu atmaqdir: mesaj nəhəng bir ikili ədədə çevrilir, barmaq izi isə razılaşdırılmış bir sabit olan **generator**-la bölmə nəticəsindəki qalıqdır. İki mühəndislik yaxşılaşdırma onu oxudur. Birincisi, bölmə 2-ci Dərsdəki sevimli degenerat arifmetikada aparılır — ikili *daşımasız*, burada çıxma və toplama hər ikisi **XOR**-a çöküb — buna görə "uzun bölmə" sadəcə shift-and-XOR, əslində silikon üçün pulsuz. İkincisi, generator ixtiyari deyil. Generatorlar *seçilir*, real riyaziyyatla, belə ki sahədə faktiki baş verən xəta nümunələri — tək çevrilmələr, cüt çevrilmələr, və hər şeydən önəmli **burst**-lər (cızıq, statik bir şaqqıltı: ardıcıl çox sayda xarab bit) — qalığı dəyişdirməyi zəmanətlə dəyişdirsin.

Bir kiçik 4-bitlik generator `1011` (real CRC-3) ilə tam olaraq əllə edək. Mesaj: `1101`. Qayda: üç 0 əlavə edin (generatorun uzunluğundan bir az — barmaq izi üçün yer açmaq), sonra XOR ilə bölün:

<Diagram name="checksum-crc/crc_division" height={400} width={720} alt="A schoolbook-style long division worked in binary XOR. Dividend 1101000 at top, generator 1011 shown at left. Four subtraction steps follow, each aligning 1011 under the current leading 1 and XORing: 1101000 xor 1011 gives 0110000; then 110000 xor 1011 shifted gives 011100; then 11100 xor 1011 shifted gives 01010; then 1010 xor 1011 gives 0001. The surviving 3-bit remainder 001 is boxed in blue at the bottom, labeled 'the CRC'. A side note states: subtraction with no borrows is just XOR.">

Daşıma olmadan çıxılan uzun bölmə: generatoru aparıcı 1-in altına hizalayın, XOR edin, təkrarlayın. Generatordan qısa qalan hər şey qalıqdır — CRC.

</Diagram>

```
Mesaj 1101, generator 1011 → 000 əlavə et:

  1101000
⊕ 1011          aparıcı 1-in altına hizala, XOR et
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

Göndər: 1101 001
```

Alıcının addımı gözəldir: *bütün* alınan sətri — mesaj və CRC birlikdə — eyni generator ilə bölün. Konstruktiv olaraq əlavə edilmiş qalıq mesajın öz qalığını ləğv edir, buna görə bütöv ötürülmə **sıfır** qalığı verir:

```
Bütöv alındı:    1101001 ÷ 1011  →  qalıq 000   ✓ təmiz
Zədəli alındı    1111001 ÷ 1011  →  qalıq 110   ✗ XƏBƏRDARlıq
(bir bit çevrildi)
```

Miqyabı artırın və tam infrastruktur daxilindəki mexanizm alınır: **CRC-32** — 33-bitlik generator, 4 byte barmaq izi — **hər Ethernet frame**-i möhürlər (xarab frame → sessizce atılır → TCP yenidən göndərir), **hər PNG parçası** (böyük-endian, əlbəttə), **hər ZIP-dəki hər fayl**. Seçilmiş generatorun zəmanəti: bütün tək-bit xətaları, 32 bitə qədər bütün burst xətaları. Əlavə toplama tərtibi keçirə bilmədiyi halı izləyin:

<TerminalBlock>

python3 -c "import zlib; print(hex(zlib.crc32(b'Hi')), hex(zlib.crc32(b'iH')))"
0x4d170e0e 0x8de10bb3

</TerminalBlock>

Eyni iki byte, əks sıralar, barmaq izləri hətta uzaq qohumlar deyil — toplama checksum-u hər ikisinin `0xB1` olduğuna and içərkən. NUXI anaqramının nəhayət *ardıcıllığı* oxuyan, yalnız *inventarı* yox, bir şahidi var.

## Hamming-in qəzəbli həftəsonu {/*hammings-furious-weekend*/}

İndiyə qədər hər şey *aşkarlayır*. Aşkarlama bir lüks fərz edir: yenidən ötürmə istəmək üçün biri. Ethernet-in üstündə TCP var; cızılmış CD-nin kimisi yoxdur — orijinal basım getdi. Marsa bir probe-un yenidən göndərmə tələbi hər tərəf üçün çox dəqiqə tələb edir. 1947-ci ildə Bell Labs-da **Richard Hamming** adlı riyaziyyatçının öz paritetli arifmetikasını yoxlayan röle kompüterinə həftəsonu giriş imkanı var idi — parity nəzarəti işindəkilərini dayandırdığında maşın onları sadəcə *tərk edirdi* və Hamming birinci gün heç nəylə gəlirdi. İki həftəsonunu bu sualı doğurdu: *"Maşın xəta baş verdiyini deyə bilirsə, niyə HARDA olduğunu deyib düzəldə bilmir?"* 1950-ci ildə cavabı səhv *düzəltmə* kodlarını təsis etdi.

Konstruksiya bu dərsin fiziki maşınıdır. 4 data biti götürün; **3 parity bit** əlavə edin; lakin — dahiyanə vuruş — *yeddi mövqeyi ikilik sistemdə 1-dən 7-yə qədər nömrələndirin* və hər parity bitinə bu nömrələrə əsasən nəzarət etməli olduğu bir zona verin: parity 1 nömrəsindəki bit 1 olan hər mövqeyi nəzarət edir (1,3,5,7); parity 2 bit 2-si olan mövqelər (2,3,6,7); parity 4 bit 4-ü olan mövqelər (4,5,6,7):

<Diagram name="checksum-crc/hamming_venn" height={400} width={720} alt="Three large overlapping circles labeled parity 1, parity 2, and parity 4, forming a classic three-set Venn diagram. The seven regions are labeled with positions: circle-only regions hold positions 1, 2 and 4 (the parity bits themselves); pairwise overlaps hold positions 3 (circles 1 and 2), 5 (circles 1 and 4) and 6 (circles 2 and 4); the triple overlap holds position 7. Each region shows the example codeword bit value: 0,1,1,0,0,1,1 for positions 1 through 7. The bit at position 6 is drawn flipped in red, and its two containing circles, parity 2 and parity 4, are outlined in red with 'FAIL' tags, while parity 1 is marked 'pass'. A caption reads: failing checks 2 + 4 = 6 — the broken bit's own address.">

Hər data biti nəzarət zonalarının unikal kombinasiyasında oturur. Bir bit çevirin, uğursuz nəzarətlərin *nümunəsi* çevrilmiş mövqenin ikilik sistemdəki sayıdır.

</Diagram>

`1011` datasını kodlayın (3, 5, 6, 7 mövqelərindədir) və hər nəzarətin parity-ni öz zonasında hesablayın:

```
mövqelər:    1   2   3   4   5   6   7
             p1  p2  d   p4  d   d   d
data:                1       0   1   1

p1 {1,3,5,7} üzərindədir:  1⊕0⊕1 cüt lazımdır → p1 = 0
p2 {2,3,6,7} üzərindədir:  1⊕1⊕1 cüt lazımdır → p2 = 1
p4 {4,5,6,7} üzərindədir:  0⊕1⊕1 cüt lazımdır → p4 = 0

Kodeword:    0   1   1   0   0   1   1
```

İndi sehrli göstəriş. Kosmik şüa 6-cı mövqeyi çevirir (1 → 0). Alıcı üç nəzaretçini yenidən işlədir:

```
check 1 {1,3,5,7}: 0⊕1⊕0⊕1 = 0   cüt → KEÇDİ
check 2 {2,3,6,7}: 1⊕1⊕0⊕1 = 1   tək → UĞURSUZ
check 4 {4,5,6,7}: 0⊕0⊕0⊕1 = 1   tək → UĞURSUZ

Uğursuz nəzarətlər: 2 və 4  →  2 + 4 = 6
```

**Uğursuz yoxlamalar qırıq bitin ünvanını toplayır.** Təsadüfdən deyil — konstruksiya ilə: mövqe 6 ikilik sistemdə `110`-dır, buna görə nəzarət 2-nin zonasında və nəzarət 4-ün zonasında durur, nəzarət 1-in deyil, buna görə dəqiq həmin nəzarətlər işə düşür. Sindrom xəta *haqqında üstüörtülü ima vermir*; onu ikilik sistemdə **hərflə ifadə edir**. Bit 6-nı geri çevirin; data *sağaldı*, yenidən göndərmə yoxdur, insan yoxdur.

Bu muzey riyaziyyatı deyil. **ECC yaddaş** — hər ciddi serverdə standart, bu dərsin oxunduğu laptopda nəzərəçarpacaq dərəcədə yoxdur — hər 64-bitlik sözü tam bu konstruksiyanın 72 biti kimi saxlayır, bütün gün sessizce sağaldır. Schaerbeek maşınının heç biri yox idi; 4,096 fantom səs 8 əksik çipin qiyməti idi. Bir bitdən böyük zərər üçün — cızıq, burst — Hamming-in ideyası bütün *byte-larla* işləyən **Reed–Solomon kodlarına** (1960) yetişdi. Keçən dərsin çözülməmiş müəmması burada həll olur: CD öz 176,400 byte/saniyəsini çarpaz ötürülmüş Reed–Solomon-a (**CIRC**) sarır, əvvəlcə byte-ları *qarışdırır* ki cızığın zərəri dağılmış şəkildə düşsün, sonra **təxminən 4,000 ardıcıl ölü bit — yaxlaşıq 2,5 mm iz**-i sıfır eşidilə bilən izlə sağaldır. Hər QR kod eyni ailəni daşıyır, **30% məhvə qədər** dözə bilmək üçün tənzimlənib — logo kodu üzərində damğalanıb datanı *məhv edir* amma Reed–Solomon hər scan-da zərəri yenidən qurur.

<DeepDive>

#### Bitsquatting: çevrilmə hücuma işlədikdə {/*bitsquatting-when-the-flip-works*/}

2011-ci ildə təhlükəsizlik tədqiqatçısı Artem Dinaburg şıltaq bir sual verdi: RAM bitləri sahədə çevrilsə, bəzən onlar *saxlanılan domen adı* içərisindəki bitlər olmalıdır — pəs populyar adların bir bit çevrildikdə nə olduğunu qeydiyyatdan keçirsəydiniz? `fbcdn.net` (Facebook-un CDN-i) bir çevrilmiş bitdən uzaqdır... o, bir neçə düzinə tək-bit mutantdan ayrılır, əksəriyyəti qeydiyyata alına bilər. O, **bitsquat** domenları dəstini qeydiyyatdan keçirdi, server qurdu və gözlədi. Serverlər davamlı əlaqə axını aldı — növbəti aylarda minlərlə unikal maşın — telefonlardan masaüstü kompüterlərə, hətta hər checksum-dan keçdikdən *sonra* bir bit çevirən, indi sahiblərinin heç vaxt yazmadığı bir domenə ciddi qoşulan embedded cihazlara. Heç bir exploit, heç bir fişinq, heç bir zərərli proqram: hücum yüzü fizika idi. Bu dərsin təhdid modelinin mükəmməl bağlanış eksponatıdır.

</DeepDive>

<DeepDive>

#### Checksum özü yalan söylədikdə {/*when-the-checksum-itself-lies*/}

Sahədən iki ürəkdağlayan qeyd və onların məcbur etdiyi dizayn prinsipi. Birincisi: əhatə boşluqları realdır. Məşhur SIGCOMM 2000 araşdırması (Stone & Partridge) canlı internet trafikini tutdu və *korrupsiyanı zərərsiz vəziyyətə gətirmiş* datanı tapdı — Ethernet CRC-nin hop başına tutduğu, lakin *mühafizələr arasında* yenidən daxil edilmiş xətalar (router yaddaşında, xatalı NIC firmware-ında, proqram surətlərindədir), sonra sanki qanuni kimi yenidən checksum hesablanıb. Hər yoxlama yalnız öz **span**-ını qoruyur; span-lar arasındakı korrupsiya təmiz sağlık belgəsi alır.

İkincisi: bu dərsdəki hər şey *qəzalara* qarşı riyaziyyatdır, qəzalar mübarizə etmir. CRC xətti funksiyasıdır — faylınızı *dəyişdirmək* istəyən düşmən *CRC-32-ni qoruyaraq* bunu kağız qələmlə edə bilər; yalnız 2³² ehtimal var və cəbr açıqdır. Buna görə "bütövlük" iki peşəyə bölünür: CRC-lər və checksum-lar **təbiətə** qarşı, **kriptografik hash-lər** — SHA-256 və qohumları — **insanlara** qarşı. Birlikdə **end-to-end arqumenti** (Saltzer, Reed & Clark, 1984) adlanan işlək qaydanı verirlər: aralıq yoxlamalar optimallaşdırmadır; *əsas* doğrulama endpoint-lərdə, hər şeyi əhatə edərək baş verməlidir.

</DeepDive>

<Pitfall>

**"Checksum uyğun gəlir" hiss etdirdiyindən az şey sübut edir.**

Xəta birincisi: uyğun CRC-ni heç kimin oynamadığının sübutu kimi qəbul etmək. CRC-32 *"bu ehtimalən qəzadan zərər görübmü?"* sualını cavablandırır — hücumçu mikrosan­iyələr içərisində faylı istənilən CRC-yə düzəldir. Müdaxiləni sübut etmək kriptografik hash tələb edir, hətta onda belə: *eyni* serverdə endirməylə yayımlanan SHA-256 teatrdır — kimin faylı əvəz etsə eyni pozulmada hash sətirini düzəldir. İstinad barmaq izi hücumçunun idarə etmədiyi kanalda gəlməlidir.

Xəta ikincisi: aşağıdakı qatın "artıq idarə etdiyini" fərz etmək. TCP-nin checksum-u 16 bitdir və span-la məhdudlandırılıb; Ethernet-in CRC-si hər hopdda məhv olur; ECC olmayan RAM yazdıqdan sonra heç nəyi qorumur. Datanız *əhəmiyyətlidirsə* — ehtiyat nüsxələr, maliyyə qeydiyyatları, elmi nəticələr — **end-to-end** doğrulayın: yaradılışda barmaq izini çıxarın, barmaq izini ayrıca saxlayın, hər köçürmədən sonra cədvəl üzrə yenidən yoxlayın.

</Pitfall>

## Təmir maşını {/*the-repair-machine*/}

Aşağıda bu dərsdən canlı işləyən Hamming(7,4) kodu var — `1011` datasını qoruyan `0110011` kodeword-u. İstənilən biti zərər vermək üçün klikləyin (tələb üzrə kosmik şüa) və üç nəzarətin yenidən işləməsini izləyin: uğursuz yoxlamalar xəta sahibinin ünvanını toplayır. Sonra cərimə haqqında xəbərdarlıq etdiyi eksperimenti aparın: **iki** bit çevirin və əminliklə yanlış olanı təmir edən maşına baxın:

<Sandpack>

```js
import { useState } from 'react';

const CLEAN = [0, 1, 1, 0, 0, 1, 1]; // data 1011 at positions 3,5,6,7

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
        Kodeword-u zərərləndirmək üçün bitleri klikləyin (data 1011):
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
            check {c.n}: {c.fail ? 'UĞURSUZ' : 'keçdi'}
          </span>
        ))}
      </p>
      {pos === 0 && <p style={{ fontFamily: 'system-ui' }}>
        Bütün nəzarətlər keçdi — kodeword təmizdir.</p>}
      {pos > 0 && <p style={{ fontFamily: 'system-ui' }}>
        Uğursuz yoxlamalar <b>{pos}</b>-ə toplanır → bit {pos} ittiham olunur.{' '}
        {damage === 1 && 'Düzgün! Sağaltmaq üçün klikləyin.'}
        {damage === 2 && <b style={{ color: '#c1554d' }}>
          Lakin SİZ iki çevirdiniz — maşın yanlış biti təmir edir.</b>}
      </p>}
    </div>
  );
}
```

</Sandpack>

Bu iki-çevrilmə xəyanəti üzərindən düşünməyə dəyər: sindrom arifmetikası qüsursuzdur, nəticə əminliklə yanlışdır — çünki *müqavilə* yalnız tək çevrilmələri əhatə edir. Bu dərsdəki hər bütövlük mexanizmi dəqiq kənarlı dəqiq bir vədddir: parity (yalnız tək saylar), CRC-32 (burst-lər ≤ 32, qəza, düşmən deyil), Hamming (bir çevrilmə, iki deyil). Onlarla mühəndislik etmək vədi bilmək deməkdir, yalnız yaşıl checkmark-ın parıltısına güvənmək deyil.

<Recap>

- **Bitlər çevrilir.** Kosmik şüalar, alfa zərrəcikləri, elektrik küyü, aşınma tək-bit xətaları *rate* edir, anek­dot deyil (fleet miqyasında yaddaş modullarının ~8%-i illik xəta qeyd edir). Çevrilmələr barmaq izi buraxır: tam **ikilik qüvvəti** qədər fərqli dəyər — Schaerbeek-in 4,096 fantom səsi = bit 13.
- Müdafiə fəlsəfəsi **artıqlıqdır**: datadan hesablanmış, onunla birlikdə gedən, hər kəsin yenidən hesablayıb müqayisə edə biləcəyi əlavə bitlər. Mexanizmlər dəlil pilləsi yaradır.
- **Parity** (1 əlavə bit): hər *tək* sayda çevrilməni tutur, hər cüt sayı qaçırır, heç nəyin yerini müəyyən etmir.
- **Additivchecksum-lar** daha güclü amma **kommutativdir** — `Hi` və `iH` hər ikisi `0xB1`-ə toplanır, buna görə yenidən sıralama (5-ci Dərsin bütün haramzadəlar qalereyası) aşkarlanmır. Hər IP/TCP/UDP başlığındakı Internet checksum 3-cü Dərsdəki **birlik tamamlayıcısı, end-around carry**-dır.
- **CRC** sənayeyyəşdirilmiş dokuzu atmaqdir: mesaj nəhəng bir ikili ədəd kimi, seçilmiş generator-a qarşı **XOR bölmə qalığı** ilə barmaq izlənib. CRC-32 (Ethernet, ZIP, PNG, gzip) bütün tək çevrilmələri və 32 bitə qədər bütün burst-ləri zəmanətlə tutur — sıra dəyişikliklərinə qarşı qəddarcasına həssasdır.
- **Hamming kodları** *düzəldir*: mövqeləri ikilik sistemdə nömrələyin, bitlə nəzarət edin; uğursuz yoxlamalar **çevrilmiş bitin ünvanını toplayır**. ECC server RAM-ı (64 bit başına 72) sessizce sağaldır; iki çevrilmə onu aldadır, buna görə SECDED. **Reed–Solomon** burst-ləri sağaldır: CIRC CD-yə ~4,000 ölü bit (≈2.5 mm cızıq) dözmə imkanı verir; QR kodlar 30% məhvə dözmə üçün tənzimlənib.
- Qərar qatı: yoxlamalar yalnız öz **span**-larını qoruyur; CRC-lər **qəzalara** qarşı, kriptografik hash-lər **düşmənlərə** qarşı; əsas doğrulama **end-to-end**, barmaq izləri ayrı kanalda saxlanılmış.

</Recap>

<Challenges>

#### Alıcı kimi bölün {/*divide-like-a-receiver*/}

Dərs `1101 001`-i ötürdü (mesaj + CRC-3, generator `1011`) və zədəli `1111001`-in qalıq `110` verdiyini iddia etdi. Hər ikisini əllə yoxlayın: `1101001`-i bölün (təmiz çıxmalıdır) və `1111001`-i (qalıq `110` çıxmalıdır). Hər XOR addımını göstərin.

<Hint>

Generatoru hazırkı ən soldakı 1-in altına hizalayın, XOR edin, aparıcı sıfırların düşməsinə icazə verin, generatordan qısa qalana qədər (3 bit ya da daha az) təkrarlayın. Bütöv hal tam `000` ilə bitməlidir.

</Hint>

<Solution>

Bütöv ötürmə — hər hizalama üçün generatoru tam genişlikdə yazın:

```
  1101001
⊕ 1011000        (generator bit 6-da hizalanıb)
  = 0110001
⊕  101100        (bit 5-də hizalanıb)
  = 0011101
⊕   10110        (bit 4-də hizalanıb)
  = 0001011
⊕    1011        (bit 3-də hizalanıb)
  = 0000000      → qalıq 000 ✓ təmiz
```

Zədəli ötürmə (bit 4 çevrilib):

```
  1111001
⊕ 1011000        → 0100001
⊕  101100        → 0001101
⊕     1011       → 0000110   → qalıq 110 ✗ XƏBƏRDARlıq ✓
```

Alıcının heç vaxt nəyə ehtiyac duymadığına da diqqət yetirin: orijinal mesaj. Alınan sətir özü haqqında şəhadət verir.

</Solution>

#### Pul kisənizdəki rəqəm {/*the-number-in-your-wallet*/}

Luhn yoxlamasını (test) kart nömrəsindən `4539 1488 0343 6467`-yə tətbiq edin. Resept: **ən sağdakı** rəqəmdən başlayaraq, hər ikinci rəqəmi iki dəfə artırın (sağdan 2, 4, 6… mövqelər); iki rəqəm verərsə, onları toplayın (məs. 8 → 16 → 1+6 = 7); hər şeyi toplayın; cəm 0-la bitərsə düzgündür. Sonra cavab verin: ikiqat addım xüsusi olaraq hansı gündəlik yazım xətasını tutmaq üçün hazırlanıb, adi rəqəm cəmi onu niyə qaçırır?

<Solution>

Sağdan işlə (`7` birinci mövqedədir):

```
mövqe:   16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1
rəqəm:    4  5  3  9  1  4  8  8  0  3  4  3  6  4  6  7
ikiqat:   ×     ×     ×     ×     ×     ×     ×     ×
olur:     8  5  6  9  2  4  7  8  0  3  8  3  3  4  3  7
          (16→7)           (16→7)      (12→3)(12→3)

Cəm: 8+5+6+9+2+4+7+8+0+3+8+3+3+4+3+7 = 80  → 0 ilə bitir ✓ GEÇERLİ
```

Mühəndislik hədəfi **bitişik transpozisiya**dır — `…64…`-ü `…46…` kimi yazmaq, ən ümumi insan data girişi xətası. Adi rəqəm cəmi kommutativdir, buna görə dəyişimlər görünməzdir (`Hi`/`iH` xəstəliyi onluq sistemdə). Luhn altında qonşu mövqelərin *fərqli* müalicəsi var (biri ikiqat, biri yox), buna görə iki bərabərsiz qonşunu dəyişdirmək demək olar ki həmişə cəmi dəyişdirir. CRC-yə qarşı additivin eyni dərsi, 1954-cü ildə ofis maşınları üçün həll edilmiş.

</Solution>

#### Konfiqurasiya faylını yedən deduplication {/*the-dedup-that-ate-a-config*/}

Köçürmə tapşırığı. Dizayn baxışı tiketi: bir fayl sinxronizasiya məhsulu **(ölçü, additivchecksum)** cütü uyğun gəldikdə iki faylın eyni olduğuna qərar verir və yalnız birini saxlayır — "hər faylı hash etmək çox yavaşdır." Müştəri iki *fərqli* server konfiqurasiya faylının birləşdirildiyini, deploymentları korladığını bildirir. Sxemi məğlub edən ən kiçik nümayiş cütünü hazırlayın, uğursuzluq sinfini dəqiq izah edin, konkret düzəltmə ilə baxış hökmü yazın.

<Solution>

**Nümayiş cütü** — dərsin öz iki byte-ı kifayətdir:

```
fayl A: "Hi"   ölçü 2, cəm 0x48+0x69 = 0xB1
fayl B: "iH"   ölçü 2, cəm 0x69+0x48 = 0xB1   → "eyni" ✗
```

Eyni byte-ların istənilən permütasiyası toqquşur: `listen.conf` vs `silent.conf` məzmunları, yenidən sıralanmış YAML açarları, qarışıq sıra sırası — real konfiqurasiya fayllarının keçirdiyi tam dəyişikliklər. **Uğursuzluq sinfi:** additivchecksum kommutativ və mövqe kordur, buna görə faylın byte *inventarını* barmaq izini çıxarır, byte *ardıcıllığını* deyil; identiklik testi kimi istifadə etmək anaqramları bərabər elan edir.

**Baxış hökmü:** *"Bloklama: məzmun identikliyi toqquşma davamlı barmaq izi ilə müəyyən edilməlidir. Additivcəmini SHA-256 ilə əvəz edin (keçicilik narahatlıq olarsa BLAKE3 — müasir hash-lər çoxlu GB/s sürətindədir, buna görə 'çox yavaş' benchmark tələb edir, fərziyyə deyil); hash uyğunlaşmasında tam məzmunu müqayisə edin. Ucuz yoxlamalar düzgün işlərini saxlayır: ölçü və sürətli checksum yaxşı* mənfi *filtr kimi (uyğunsuzluq ⇒ mütləq fərqlidir, hash etməyi atlayın) — müsbət hökmü heç vaxt verməməlidirlər. End-to-end praktikasına uyğun olaraq: mənbədə deyil, hədəfdə transfer sonrası barmaq izini yoxlayın."*

</Solution>

</Challenges>

<LearnMore title="Sıxışdırma: ZIP Necə İşləyir (Huffman, LZ)" path="/learn/faza-0/modul-0-1/compression">

Bu dərs bitləri qəsdən xərclədi — zərər gizlənə bilməsin deyə artıqlıq əlavə etdi. Növbəti dərs maşını əks istiqamətdə işlədir: artıqlıq *axtarılıb aradan qaldırılır* ki eyni data daha az bitə sığsın. 7-ci Dərsin sirrinin çatışmayan parçası budur (36 MB foto 3 MB faylda yaşayır), hər açdığınız ZIP-in içindədir — indi anladığınız CRC-32-nin yanında — mərkəzi alqoritmi isə 1951-ci ildə bir magistrant tərəfindən icad edilib, termin işi ilə yekun imtahan arasında seçim edərək. İşi seçdi.

</LearnMore>
