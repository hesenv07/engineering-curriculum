---
title: "Gate-lərdən Adder Qurmaq"
---

<Intro>

1937-ci ilin noyabrında Bell Labs-da işləyən George Stibitz adlı riyaziyyatçı bir neçə ehtiyat telefon relay-i götürüb evinə apardı, mətbəx masasının arxasında oturdu və onlardan bir maşın qurdu. Display əvəzinə iki cib fənəri lampası qoşdu. Maşına ədədləri ötürən açarları isə tütün qutusundan kəsdiyi metal zolaqlardan düzəltdi. Bütün bu qurğu düz bir iş görürdü: iki binary rəqəmi toplayır və cavabı lampaları yandırmaqla göstərirdi. Həmkarları sonralar ona **Model K** adını verdilər — K, Kitchen sözündən. Elə həmin il, elə həmin şirkətin ətrafında Claude Shannon keçən dərsdə tanış olduğun tezisi təqdim edirdi və relay-lərin logic *edə biləcəyini* sübut edirdi; Stibitz isə sadəcə mətbəx masasında onlarla arifmetika etdi. Üç ilin içində Bell Labs bu fikri Complex Number Computer-ə çevirdi və 11 sentyabr 1940-cı ildə Dartmouth College-dəki bir auditoriya bir riyaziyyatçının New Hampshire-də teletaypa məsələ yazıb New York-dakı maşından cavab aldığını izlədi — tarixdə ilk dəfə kimsə yanında dayanmadığı bir kompüterdən istifadə edirdi. Keçən dərsdə gate-lərdən ibarət bir hissələr qutusu yığdın. Bu dərsdə onu xərcləyirik və quracağımız şey istənilən kompüterdəki ən vacib circuit-dir: toplama edən.

</Intro>

<YouWillLearn>

- İki bit-i toplamağın niyə **iki** output verdiyini və bunlardan birinin niyə XOR, digərinin isə sadə AND olduğunu
- **Half adder**-i, "half" adının niyə dürüst ad olduğunu və bunu düzəldən **full adder**-i
- Full adder-ləri zəncirləməklə istənilən genişlikdə adder qurmağı — Dərs 2-nin odometer-i, indi silikonda
- **Carry flag** ilə **signed overflow flag**-in haradan gəldiyini, niyə fərqli olduqlarını və `+127 + 1 = −128`-i nəhayət necə izah etdiklərini
- Eyni circuit-in heç yerdə subtractor olmadan çıxmanı necə yerinə yetirdiyini — Dərs 3-ün vədinin ödənməsi
- Carry-nin niyə processor-undakı ən yavaş şey olduğunu və Babbage ilə müasir çip dizaynerlərinin buna qarşı nə etdiyini

</YouWillLearn>

## Toplamaq əslində nədir {/*what-adding-actually-is*/}

Faydalı görünəndən də kiçikdən başla: **bir bit-i bir bit-ə** topla. Cəmi dörd ehtimal var, ona görə keçən dərsin dediyi kimi, dördünü də yazmaq seçmə deyil — tam spesifikasiyadır.

```
 0 + 0 = 0
 0 + 1 = 1
 1 + 0 = 1
 1 + 1 = 2   ← problem elə buradadır
```

Bu cavablardan üçü bir bit-ə sığır. Dördüncüsü sığmır: iki, binary-də `10`-dur — ikirəqəmli cavab. Bu, Dərs 2-dən artıq odometer üzərində yaşadığın həmin andır: bir sütun dolur, sıfıra qayıdır və nə isə solundakı sütuna ötürülməlidir. Həmin "nə isə" **carry**-dir.

Deməli, birbitlik adder-in bir output-u ola bilməz. Ona iki output lazımdır: bu sütunda qalan rəqəm — **sum** və sola keçən rəqəm — **carry**. Truth table-ı hər iki sütunla birlikdə yaz:

| A | B | carry | sum | | ədəd kimi |
|---|---|-------|-----|---|---|
| 0 | 0 | 0 | 0 | | `00` = 0 |
| 0 | 1 | 0 | 1 | | `01` = 1 |
| 1 | 0 | 0 | 1 | | `01` = 1 |
| 1 | 1 | 1 | 0 | | `10` = 2 |

İndi o iki output sütununa yaxşı bax, çünki hər ikisini əvvəl görmüsən — dünən, gate dəzgahında.

**Sum** sütunu 0, 1, 1, 0 kimi oxunur. Bu, **XOR**-dur: ya biri, ya digəri, amma hər ikisi yox. **Carry** sütunu 0, 0, 0, 1 kimi oxunur. Bu, **AND**-dır: yalnız hər ikisi olanda.

## Half adder {/*the-half-adder*/}

Görüləsi başqa iş yoxdur. İki bit-in binary toplanması *elə* bir XOR və bir AND-dır, eyni iki input-a qoşulmuş:

<Diagram name="building-an-adder/half_adder" height={340} width={720} alt="Gate sxemi, başlıq: 'half adder: iki gate və artıq topluya bilirsən'. Solda monospace şriftlə A və B yazılmış iki input teli. Hər input-un birləşmə nöqtəsi var və hər ikisi iki gate-ə ayrılır: yuxarı hissədə əlavə qabaq qövsü olan qalxan formasında çəkilmiş və XOR yazılmış gate, aşağı hissədə isə düz arxalı D formasında çəkilmiş və AND yazılmış gate. XOR gate-in output-u sağa mavi ox kimi gedir və sum yazısına çatır; AND gate-in output-u sağa qırmızı ox kimi gedir və carry yazısına çatır. Carry output-unun yanındakı kiçik qeyddə yazılır: 1 + 1 = 10. Aşağıdakı altyazı: sum sütunu XOR-dur, carry sütunu AND.">

Bütün circuit budur. İki gate, CMOS-da hər biri dörd transistor — deməli iki bit-in binary toplanması təxminən səkkiz transistora başa gəlir.

</Diagram>

Buna **half adder** deyilir və ad təvazökarlıq deyil, xəbərdarlıqdır. Onun nə edə bilmədiyinə bax. İki input-u var, deməli toplanan iki rəqəmi qəbul edə bilir — amma real toplama sütununun *üçüncü* input-u da var: sağdakı sütundan gələn carry. Odometer-i iki rəqəmli nümunə ilə yenidən izlə, `11 + 01`:

```
    1 1        sağ sütun: 1 + 1 = 0, carry 1
  + 0 1        sol sütun:  1 + 0 + 1 ← toplanası üç şey
  ─────
  1 0 0
```

Sol sütun iki yox, üç bit toplamalıdır. Half adder-in isə həmin üçüncü teli fiziki olaraq bağlayacağı yer yoxdur. Deməli, o yalnız toplamanın ən sağdakı sütunu ola bilər, başqa heç yerdə yox — bu isə düz-əməlli komponentin təxminən yarısıdır, dürüst şəkildə adlandırılmış.

## Full adder {/*the-full-adder*/}

Həll **üç input-u** — A, B və hər zaman `Cin` yazılan daxil olan carry — və eyni iki output-u olan circuit-dir. Üç input 2³ = 8 sətir deməkdir və yenə də səkkiz sətrin hamısı *elə* spesifikasiyadır:

| A | B | Cin | | Cout | Sum | | cəmi |
|---|---|-----|---|------|-----|---|-------|
| 0 | 0 | 0 | | 0 | 0 | | 0 |
| 0 | 0 | 1 | | 0 | 1 | | 1 |
| 0 | 1 | 0 | | 0 | 1 | | 1 |
| 0 | 1 | 1 | | 1 | 0 | | 2 |
| 1 | 0 | 0 | | 0 | 1 | | 1 |
| 1 | 0 | 1 | | 1 | 0 | | 2 |
| 1 | 1 | 0 | | 1 | 0 | | 2 |
| 1 | 1 | 1 | | 1 | 1 | | 3 |

Sağdakı sütunu oxu: iki output bit-i həmişə üç input arasındakı 1-lərin sayını binary-də yazır. Full adder məhz budur — **üç input-undan neçəsinin 1 olduğunu sayan** və nəticəni iki bit-lə bildirən qurğu.

Bunu sıfırdan da qura bilərdin, amma daha səliqəli yol var: full adder **iki half adder və bir OR gate**-dir. A və B-ni birinci half adder ilə topla. Sonra onun sum-unu `Cin` ilə ikinci half adder-də topla — bu, son sum bit-ini verir. Hər half adder carry vermiş ola bilər və *ən çoxu biri* vermiş ola bilər, ona görə hansı işə düşübsə, onu bir OR gate yığır:

<Diagram name="building-an-adder/full_adder" height={380} width={720} alt="Gate sxemi, başlıq: 'full adder: üç input daxil, iki çıxış'. Ən solda A və B input-ları birləşmə nöqtələri vasitəsilə 'half adder 1' adlı ilk gate cütünə ayrılır: yuxarıda XOR gate, aşağıda AND gate. XOR gate-in mavi rəngdə 'A xor B' yazılmış output-u sağa, bir birləşmə nöqtəsinə gedir və oradan 'half adder 2' adlı ikinci gate cütünə ayrılır: yuxarıda daha bir XOR, aşağıda daha bir AND. Cin adlı üçüncü input solda aşağıdan daxil olur, aşağı xətt boyunca sağa gedir, birləşmə nöqtəsinə çatır və yuxarı qalxaraq half adder 2-nin hər iki gate-inin ikinci input-una verilir. İkinci XOR-un output-u sağa mavi ox kimi gedir və Sum yazısına çatır. Hər iki half adder-in AND output-ları qırmızı rəngdə sağdakı iki input-lu OR gate-ə gedir, onun output-u isə qırmızı ox kimi Cout yazısına çatır. Aşağıdakı altyazı: iki half adder və bir OR — indi carry-lər həm çıxa, həm də daxil ola bilər.">

Cəmi beş gate. İstifadə etdiyin hər processor-dakı hər arifmetik blok bunun nüsxələrindən qurulub.

</Diagram>

**İşlənmiş nümunə — `A=1, B=1, Cin=1` izləməsi** (cədvəlin son sətri və hər şeyin yanılı olduğu yeganə sətir):

```
 half adder 1:  A XOR B = 1 XOR 1 = 0        ← onun sum-u
                A AND B = 1 AND 1 = 1        ← onun carry-si

 half adder 2:  0 XOR Cin = 0 XOR 1 = 1      ← son Sum
                0 AND Cin = 0 AND 1 = 0      ← onun carry-si

 OR gate:       1 OR 0 = 1                   ← son Cout

 nəticə: Cout = 1, Sum = 1  →  binary 11 = 3
 yoxlama: 1 + 1 + 1 = 3 ✓
```

**İşlənmiş nümunə — `A=1, B=0, Cin=1` izləməsi:**

```
 half adder 1:  1 XOR 0 = 1  ·  1 AND 0 = 0
 half adder 2:  1 XOR 1 = 0  ·  1 AND 1 = 1
 OR gate:       0 OR 1 = 1

 nəticə: Cout = 1, Sum = 0  →  binary 10 = 2
 yoxlama: 1 + 0 + 1 = 2 ✓
```

Fikir ver ki, OR gate heç vaxt hər iki input-unu yüksək görmür: half adder 1 yalnız A və B-nin hər ikisi 1 olanda carry verir, o halda isə onun sum-u 0-dır, deməli half adder 2 carry verə bilməz. İki carry bir-birini istisna edir və məhz buna görə onları birləşdirməyə sadə bir OR bəs edir.

## Sıra ilə səkkiz dənə {/*eight-in-a-row*/}

İndi 8-bit adder qur; konstruksiya demək olar ki, gözlənilməyəcək qədər sadədir: səkkiz full adder götür, hər bit mövqeyinə bir dənə, və **hər birinin Cout-unu sol qonşusunun Cin-inə qoş.** Ən sağdakı adder-ə Cin olaraq 0 ver, çünki birlər sütununa heç nə carry edilmir.

<Diagram name="building-an-adder/ripple_carry" height={340} width={720} alt="Sxem, başlıq: 'sıra ilə səkkiz full adder: carry piyada getməlidir'. Bir sırada səkkiz yumru künclü qutu dayanır, hər biri FA yazılıb, altında bit indeksi var, solda 7-dən sağda 0-a qədər nömrələnib; 0-dan 6-ya qədər olan yeddi qutu qırmızı çalarlıdır, bit 7 qutusu isə boz. Hər qutunun üstündə kiçik yazılar var: A7 B7, A6 B6 və sair, qısa tellərlə qutulara enir. Hər qutunun altından mavi tel S7, S6 və s. şəklində S0-a qədər sum yazılarına düşür. Qonşu qutular arasında sola doğru qırmızı oxlar gedir, hər biri bir mərhələnin carry-sini növbətisinə aparır. Sağda 0 yazılmış boz ox bit 0-ın carry input-una qoşulur; solda isə bit 7-dən CF yazılmış qırmızı ox çıxır. Altyazılar: bit 0 birinci qurtarır, bit 7 isə carry ona çatana qədər başlaya bilmir; və: istənilən genişlikdə düzgündür, əlavə etdiyin hər bit üçün isə daha yavaş.">

Buna **ripple-carry adder** deyilir və ad hərfi təsvirdir: carry sağdan sola yayılır, tam olaraq kağız üzərində toplayanda etdiyin kimi.

</Diagram>

Bu, Dərs 2-nin odometer-inin gate-lərdə yenidən qurulmuş halıdır — eyni mexanizm, eyni sağdan-sola carry, eyni sıfıra qayıtma. Və o, çox rahat ölçülənir: 32 bit istəyirsən, 32 full adder istifadə et; 64 istəyirsən, 64. Dizaynda heç nə dəyişmir.

**İşlənmiş nümunə — `00000111 + 00000011` (7 + 3), carry-ni izləyərək:**

```
 carry in:  0 0 0 0 1 1 1 0 →      (carry hər sütuna gəldiyi kimi)
        A:  0 0 0 0 0 1 1 1
        B:  0 0 0 0 0 0 1 1
      sum:  0 0 0 0 1 0 1 0

 bit 0: 1 + 1 + 0 = 10 → sum 0, carry 1
 bit 1: 1 + 1 + 1 = 11 → sum 1, carry 1
 bit 2: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 3: 0 + 0 + 1 = 01 → sum 1, carry 0
 bit 4-7: hamısı sıfır, daha heç nə baş vermir

 nəticə: 00001010 = 8 + 2 = 10 ✓
```

Carry sönməzdən əvvəl üç sütundan sağ çıxdı. Bu müşahidəni yadda saxla — iki bölmə sonra o, bu dərsin ən vacib rəqəminə çevrilir.

## İki fərqli həyəcan siqnalı {/*the-two-alarms*/}

Həmin zəncirdəki ən soldakı full adder-ə bax. Onun `Cout`-unun gedəcəyi yer yoxdur: bit 8 mövcud deyil. Onunla nə olur?

O, **flag**-ə çevrilir — processor-un toplamanın necə getdiyini təsvir etmək üçün nəticənin yanında saxladığı tək bir bit. Və Dərs 3-dən qalan bir borc məhz burada ödənilir, çünki adder-in yuxarısı **iki fərqli həyəcan siqnalı** yaradır və onları qarışdırmaq sistem proqramlaşdırmasının ən inadkar bug-larından biridir.

<Diagram name="building-an-adder/overflow_flags" height={340} width={720} alt="Sxem, başlıq: 'bir adder, iki fərqli həyəcan siqnalı'. Mərkəzdə boz, yumru künclü qutu dayanır, üzərində FA, bit 7 yazılıb; yuxarıdan A7 B7 input-ları daxil olur, aşağıya mavi S7 sum output-u düşür. Sağdan C6 yazılmış tel daxil olur, üzərində 'carry in' qeydi və bir birləşmə nöqtəsi var; sola C7 yazılmış tel çıxır, onun da birləşmə nöqtəsi var. Soldakı birləşmə nöqtəsindən qırmızı tel yuxarı ayrılır və 'unsigned həyəcan siqnalı' qeydi ilə CF yazısına çatır. Hər iki birləşmə nöqtəsindən qırmızı tellər aşağı, ən altdakı XOR gate-in iki input-una enir, onun qırmızı output oxu isə 'signed həyəcan siqnalı' qeydi ilə OF yazısına gedir. Aşağıdakı altyazı: CF sadəcə son carry-dir, OF isə C6 XOR C7 — onlar fərqli toplamalarda işə düşür.">

Bir-birindən saç teli qədər aralıda, eyni adder-dən götürülmüş iki flag — və onlar razılaşmır.

</Diagram>

**Carry flag (CF)** sadəcə yuxarı bit-dən çıxan carry-dir. *Unsigned* müqavilə altında o deməkdir: "əsl cavaba doqquzuncu bit lazım idi, səndə isə cəmi səkkiz var" — unsigned overflow.

**Overflow flag (OF)** yuxarı bit-ə *daxil olan* carry ilə oradan *çıxan* carry-nin XOR-udur. *Signed* two's-complement müqaviləsi altında o deməkdir: "işarə səhv çıxdı." Düstur Dərs 3-ün ən dərin fikrini xatırlayana qədər özbaşına görünür: two's complement-də yuxarı bit-in çəkisi +128 yox, **−128**-dir. Deməli, yuxarı sütun digərləri ilə eyni arifmetikanı etmir və onun səhv getdiyinin əlaməti məhz daxil olan carry ilə çıxan carry arasındakı *fikir ayrılığıdır*.

İndi isə mükafat. İki toplama, eyni adder, eyni səkkiz bit — və flag-lər **əks** çıxır.

**Hal 1 — `127 + 1`, Dərs 3-dəki cinayət yeri:**

```
 carry:  1 1 1 1 1 1 1 0 →
     A:  0 1 1 1 1 1 1 1     127
     B:  0 0 0 0 0 0 0 1       1
   sum:  1 0 0 0 0 0 0 0

 bit 7-yə daxil olan carry = 1     bit 7-dən çıxan carry = 0
 CF = 0        →  unsigned: 128 səkkiz bit-ə sığır, heç nə səhv deyil ✓
 OF = 1 XOR 0 = 1  →  signed: SINIB
 nəticə signed kimi oxunur: 10000000 = −128 ✗
```

Bax nəhayət, misin üzərində. `+127 + 1 = −128` nə bir instruction-dakı bug-dır, nə də bir dilin qəribəliyi — o, yeddi sütun boyu yayılan və çəkisi mənfi olan sütuna gəlib düşən bir carry-dir. Diqqət et ki, elə həmin bit-lərin unsigned oxunuşu **128-dir və tamamilə düzgündür**. Bir toplama, bir nəticə, iki müqavilə və onlardan biri pozulub.

**Hal 2 — `200 + 100`, güzgü şəkli:**

```
 carry:  1 0 0 0 0 0 0 0 →
     A:  1 1 0 0 1 0 0 0     unsigned 200  (və ya signed −56)
     B:  0 1 1 0 0 1 0 0     100
   sum:  0 0 1 0 1 1 0 0

 bit 7-yə daxil olan carry = 1     bit 7-dən çıxan carry = 1
 CF = 1        →  unsigned: 300 sığmır ✗ (nəticə 44 kimi oxunur)
 OF = 1 XOR 1 = 0  →  signed: qaydasındadır ✓  (−56 + 100 = 44, elə aldığımız da budur)
```

İki flag fərqli toplamalarda işə düşür və bu, onların eyni səkkiz bit haqqında həqiqətən müstəqil faktlar olduğunu sübut edir. Elə buna görə hər processor-un status registri **hər ikisini** saxlayır — x86-da `CF` və `OF`, ARM-da `C` və `V` — və elə buna görə assembly-də hər biri üçün ayrıca branch instruction-ları var. Adder hansı müqaviləni işlətdiyini bilmir. O, hər iki həyəcan siqnalını hesablayır və hansının vacib olduğunu sənin kodunun qərar verməsinə buraxır.

<Pitfall>

**Carry flag ilə overflow flag eyni flag deyil.**

Bu səhv üç fərqli libasda özünü göstərir. Assembly-də signed overflow nəzərdə tutub carry üzərində branch etmək (`jo` əvəzinə `jc`) — və ya əksi — elə kod yaradır ki, əksər input-larda düzgün, sərhədlərin yaxınlığında isə səhv olur; bu, mümkün olan ən pis nasazlıq profilidir. C-də bir müqayisədə signed və unsigned tipləri qarışdırmaq compiler-in birini səssizcə çevirməsinə səbəb olur, ona görə signed `i` və unsigned `len` ilə yazılmış `if (i < len)` nə carry, nə də overflow intuisiyasının qabaqcadan deyə bilmədiyi şəkildə davrana bilər. Yüksək səviyyəli koda gəldikdə isə "topladıqdan sonra overflow-u yoxlayaram" yanaşması signed tiplər üçün Dərs 3-ün göstərdiyi səbəbdən uğursuz olur: C və C++-da signed overflow undefined behaviour-dur, ona görə compiler həmin yoxlamanı silə bilər.

Düzəliş hər hansı bir şeyi yoxlamazdan *əvvəl* hansı müqavilədə olduğunu ucadan deməkdir. Unsigned arifmetika nəticə input-lardan hər hansı birindən kiçik olanda overflow verir — bu yoxlama yaxşı təyin olunub və etibarlıdır. Signed arifmetika isə əməliyyatdan *əvvəl* yoxlanmalıdır (`b > 0 && a > INT_MAX − b`) və ya sənin əvəzinə hardware-in OF-unu oxuyan checked-arithmetic builtin-i ilə. Eyni tellər, iki müqavilə, iki yoxlama — və bu modulun təkrar-təkrar öyrətdiyi vərdiş: əvvəlcə müqaviləni adlandır.

</Pitfall>

## Çıxma, pulsuz {/*subtraction-for-free*/}

Dərs 3 bir iddia irəli sürüb onu havada saxlamışdı: *sənin CPU-nda subtractor yoxdur.* İndiyə qədər işlətdiyin hər çıxma əslində gizlicə toplama idi. İndi əsl telləri görə bilərsən.

Dərs 3-dəki resept belə idi: bir ədədi mənfiyə çevirmək üçün hər bit-i çevir və 1 əlavə et. Deməli, `A − B` = `A + (NOT B) + 1`. İndi adder-in onsuz da əlinin altında nəyi olduğuna bax:

- **B-nin hər bit-ini çevirmək** — XOR gate digər input-u 1 olanda input-unu çevirir, həmin input 0 olanda isə onu olduğu kimi ötürür (şübhələnirsənsə, XOR sütununu yoxla: `x XOR 0 = x`, `x XOR 1 = NOT x`). Deməli, hər B input-una bir XOR qoy və hamısını tək bir **mode** xəttinə qoş.
- **1 əlavə etmək** — ən sağdakı full adder-in istifadə olunmayan `Cin`-i var, biz onu 0-a bağlamışdıq. Onun əvəzinə mode xəttinə bağla.

<Diagram name="building-an-adder/add_subtract" height={360} width={720} alt="Sxem, başlıq: 'bir circuit, hər iki əməliyyat'. Solda 'mode' yazılmış qırmızı idarə xətti var, yanında '0 = add' və '1 = sub' qeydləri; xətt sağa gedir və sonra birləşmə nöqtəsindən aşağı ayrılır. B2, B1, B0 yazılmış üç input bit-i öz qırmızı XOR gate-lərinə daxil olur; mode xətti hər üç XOR gate-in ikinci input-unu qidalandırır, qeyddə yazılır: mode = 1 hər B bit-ini çevirir. Üç XOR-un output-u sağa, 'eyni ripple adder' yazılmış böyük mavi yumru künclü qutuya gedir. Qutunun altına boz tel daxil olur, qeyddə yazılır: A bit-ləri də bura daxil olur. Mode xətti həmçinin aşağı və sağa davam edərək adder qutusunun altına girir, qeyddə yazılır: carry-in = mode. Adder-in output-u sağa mavi ox kimi gedir və result yazısına çatır. Aşağıdakı altyazı: B-ni çevir və bir əlavə et — two's complement mənfiyə çevirməsi, telin özündə edilmiş.">

Səkkiz XOR gate və bir tel. Çıxmanın bütün qiyməti budur.

</Diagram>

Mode-u 0 et: XOR-lar B-ni toxunmadan ötürür və Cin 0 qalır — circuit toplayır. Mode-u 1 et: hər B bit-i invert olunur və Cin 1 olur — circuit `A + NOT B + 1`, yəni `A − B` hesablayır. Adder-in özü isə heç vaxt dəyişmir və heç vaxt bilmir.

**İşlənmiş nümunə — 8 bit-də `7 − 3`, mode = 1:**

```
        A:  0 0 0 0 0 1 1 1      7
        B:  0 0 0 0 0 0 1 1      3
 XOR-dan sonra: 1 1 1 1 1 1 0 0  NOT B
       Cin: 1                    (mode bit-i)

 topla:     00000111 + 11111100 + 1
 carry:     1 1 1 1 1 1 1 1 →
      sum:  0 0 0 0 0 1 0 0

 nəticə: 00000100 = 4 ✓        və 7 − 3 = 4
```

Burada carry out 1-dir və çıxma oxunuşunda bu, "borc lazım olmadı" deməkdir — elə buna görə çıxma kontekstində `CF` çox vaxt tərsinə çevrilmiş *borrow* flag-i adlandırılır. Digər istiqaməti sına, `5 − 9`, və sum `11111100` çıxacaq: unsigned 252, amma signed oxunanda **−4**, yəni bunu ifadə edə bilən müqavilə altında düzgün cavab. Adder səkkiz bit yaratdı; həmin bit-lərin niyə −4 mənasına gəldiyini isə Dərs 3 sənə öyrətdi.

Bir circuit, dörd iş — signed add, unsigned add, signed subtract, unsigned subtract — və circuit onları bir-birindən ayıra bilmir. Two's complement-i qalib edən qənaətin hardware tərəfdən görünüşü elə budur.

<DeepDive>

#### Maşındakı ən yavaş şey carry-dir {/*the-carry-is-the-slowest-thing*/}

Ripple-carry adder istənilən genişlikdə düzgündür. Həm də geniş ədədlər üçün istifadəyə yararsız dərəcədə yavaşdır — səbəb isə öz sxemində görünür: **bit 7 carry bit 0-dan bütün yolu piyada gedib çatana qədər öz cavabını hesablaya bilməz.**

Rəqəmlərlə göstər. Full adder-in içində `Cin`-dən `Cout`-a gedən yol bir AND-dan, sonra bir OR-dan keçir: **mərhələ başına iki gate delay**. Deməli, 64-bit ripple-carry adder-in ən pis halda yolu belədir:

```
 64 mərhələ × 2 gate = 128 gate delay

 gate başına ~15 pikosaniyə:  128 × 15 ps = 1.92 nanosaniyə
```

İndi bunu clock-la müqayisə et. 1 GHz-lik processor hər addıma **1.0 ns** verir; 3 GHz-lik isə **0.33 ns**. 64-bit ripple-carry adder heç birinə sığmır. CPU-nu belə qur, təkcə adder sənin clock sürətini əbədi olaraq təxminən 500 MHz-də saxlayar, transistor-ların nə qədər yaxşı olsa da. Circuit səhv deyil — o, *gecikir*, hardware-də isə bu, səhv olmaqla eyni şeydir.

Charles Babbage bu divara 1830-larda misdən düzəlmiş halda dəydi. Carry-nin yayılması onun Analytical Engine-indəki ən çətin mexaniki problem idi: bunu rəqəm-rəqəm etmək o demək idi ki, rəqəm sayı artdıqca maşının sürəti çöküb gedir. Onun cavabı **anticipating carriage** adlandırdığı mexanizm idi — carry-lərin harada dayanacağını təkər-təkər ötürmək əvəzinə paralel şəkildə qabaqcadan hesablayan bir qurğu. O, transistor-un ixtirasından yüz qırx il əvvəl elə bu bölmənin problemini həll edirdi.

Müasir variant **carry-lookahead** adlanır və fənd ondadır ki, hər sütun *heç kimi gözləmədən* özü haqqında iki fakt elan edə bilər:

```
 generate:   Gi = Ai AND Bi        "nə olursa olsun, mən carry yaradacağam"
 propagate:  Pi = Ai XOR Bi        "mənə hansı carry çatsa, onu ötürəcəyəm"
```

Hər ikisi həmin sütunun öz input-larından dərhal, bir gate delay-də və hər 64 sütun üçün eyni vaxtda hesablana bilər. Sonra istənilən sütuna daxil olan carry aşağıdakı G-lər və P-lər üzərində bir düsturdur — məsələn `C2 = G1 OR (P1 AND G0) OR (P1 AND P0 AND C0)` — və bu ifadəni zəncirlə yox, gate-lərdən ibarət *ağacla* hesablaya bilərsən. Dərinliyi log₂(64) = **6** olan ağac 128 uzunluqlu zənciri əvəz edir və real 64-bit toplama bir clock təkanına rahatca sığır.

Qiymət sahə və güclə ödənilir: lookahead logic ripple variantından xeyli çox gate tələb edir və onların hər biri keçid edəndə enerji yandırır. Bu, kursun hər fazasında yenidən görəcəyin mübadilədir — **vaxt üçün sahə**, transistor-larla ödənilmiş. Sənin processor-unun adder-i bu ağaclardan ibarət kiçik bir meşədir və o, ona görə mövcuddur ki, alternativ 500 MHz-lik tavan idi.

</DeepDive>

<DeepDive>

#### Arifmetik circuit sadəcə səhv olanda {/*when-the-arithmetic-circuit-is-wrong*/}

Adder bütün halları tam yoxlamağa imkan verəcək qədər kiçikdir — full adder üçün 8 sətir, formal alətlər isə 64-bit adder-in bütün 2¹²⁸ input cütü üçün düzgünlüyünü onları sınamadan sübut edə bilir. Bölmə bu qədər şanslı deyil və 1994-cü ildə bu fərq Intel-ə yarım milyard dollara başa gəldi.

İlkin Pentium bölməni əvvəlcədən hesablanmış dəyərlərdən ibarət **lookup table**-a müraciət edən alqoritmlə edirdi. Cədvəl çipin sxeminə köçürüləndə skript xətası **beş yazının çatışmamasına** səbəb oldu — mindən çox xanadan beşi, düzgün dəyərlərin əvəzinə sıfır oxuyurdu. Çiplər satışa çıxdı. 1994-cü ilin iyununda Lynchburg College-də sadə ədədlərin tərs qiymətlərini hesablayan Thomas Nicely adlı riyaziyyatçı cəmlərinin uyğun gəlmədiyini gördü; aylarla öz kodunu yoxladıqdan sonra qərara gəldi ki, səhv edən processor-dur və oktyabrda bunu açıqladı. Ən çox sitat gətirilən nümayiş tək bir bölmə idi:

```
 4195835 / 3145727

 düzgün:    1.333820449136241…
 Pentium:   1.333739068902037…
             └── dördüncü əhəmiyyətli rəqəmdən etibarən səhv
```

Intel əvvəlcə demək olar ki, heç bir istifadəçinin bu qüsura rast gəlməyəcəyini iddia etdi — statistik olaraq müdafiə oluna bilən, ictimaiyyətlə əlaqələr baxımından isə fəlakət olan bir mövqe. Bir neçə həftə ərzində şirkət istəyən hər kəsə əvəzetmə təklif etdi və gəlirlərindən təxminən **475 milyon dollar** silindi.

Buradan iki şey götürməyə dəyər. Birincisi, bu nasazlığın forması artıq iki dəfə qarşına çıxıb: Dərs 3-dəki `binarySearch` bug-ı "düzgün alqoritm, sınıq implementasiya" idi və bu, elə həmin cümlənin silikonda yazılmış halıdır — bölmə alqoritmi sağlam idi, beş cədvəl yazısı yox. İkincisi, həll yolları tamamilə fərqlidir. Software çərşənbə axşamı yamaq buraxır; səhv circuit isə satılmış hər vahidin fiziki olaraq dəyişdirilməsi deməkdir. Məhz bu asimmetriyaya görə hardware mühəndisliyi test etməkdən çox *sübuta* söykənir və məhz buna görə təvazökar full adder — səkkiz sətir, baxmaqla sübut olunan — yamaq buraxıla bilməyən maşının dibində görmək istədiyin komponentdir.

</DeepDive>

## Adder-i özün qur {/*build-the-adder-yourself*/}

Bax burada bütün circuit canlı şəkildədir. A və B-nin bit-lərini çevir, hər sütunun carry-sinin necə göründüyünü izlə və nəticəni eyni anda hər iki müqavilə altında oxu. Sütunlar arasındakı carry göstəriciləri carry həqiqətən yol gedəndə yanır; **ripple length** sayğacı isə carry-nin neçə mərhələ piyada getdiyini göstərir — əvvəlki DeepDive-ın bəhs etdiyi gecikmə elə budur. **Subtract**-a keç və B sırası XOR gate-lərinin adder-ə əslində nə verdiyini göstərəcək.

Ardıcıllıqla baxmağa dəyən üç preset var: `127 + 1` (OF-un işə düşməsinə, CF-in isə sönük qalmasına bax), `200 + 100` (tam əksinə bax) və `255 + 1` (carry-nin səkkiz mərhələnin hamısından keçməsinə bax — 8-bit adder-in gedə biləcəyi ən uzun yol).

<Sandpack>

```js
import { useState } from 'react';

const N = 8;
const ACC = '#087ea4';
const DNG = '#c1554d';
const toBits = (v) => Array.from({ length: N }, (_, i) => (v >> i) & 1);
const toVal = (bits) => bits.reduce((s, b, i) => s + b * 2 ** i, 0);
const asSigned = (v) => (v >= 128 ? v - 256 : v);

export default function AdderLab() {
  const [a, setA] = useState(toBits(127));
  const [b, setB] = useState(toBits(1));
  const [sub, setSub] = useState(false);

  // XOR sırasını da, carry-in-i də mode bit-i idarə edir
  const bIn = b.map((x) => (sub ? 1 - x : x));

  const sum = [];
  const carry = [sub ? 1 : 0]; // carry[i] = bit i-yə çatan carry
  for (let i = 0; i < N; i++) {
    sum.push(a[i] ^ bIn[i] ^ carry[i]);
    carry.push((a[i] & bIn[i]) | (carry[i] & (a[i] ^ bIn[i])));
  }

  const cf = carry[N];
  const of = carry[N] ^ carry[N - 1];
  const result = toVal(sum);
  const av = toVal(a);
  const bv = toVal(b);

  // carry əslində nə qədər yol getməli oldu?
  let ripple = 0;
  for (let i = 0; i < N; i++) if (carry[i + 1]) ripple = i + 1;

  const flip = (arr, set, i) =>
    set(arr.map((v, j) => (j === i ? 1 - v : v)));

  const preset = (x, y, s) => {
    setA(toBits(x));
    setB(toBits(y));
    setSub(s);
  };

  const cell = (content, color, dim) => (
    <div style={{
      width: 40, height: 40, margin: 2, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', fontSize: 19,
      border: `2px solid ${dim ? '#888' : color}`,
      background: dim ? 'transparent' : `${color}22`,
      color: dim ? 'inherit' : color
    }}>{content}</div>
  );

  const idx = Array.from({ length: N }, (_, k) => N - 1 - k); // əvvəlcə bit 7

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => preset(127, 1, false)}>127 + 1</button>{' '}
        <button onClick={() => preset(200, 100, false)}>200 + 100</button>{' '}
        <button onClick={() => preset(255, 1, false)}>255 + 1</button>{' '}
        <button onClick={() => preset(7, 3, true)}>7 &minus; 3</button>{' '}
        <button onClick={() => setSub(!sub)} style={{
          fontWeight: 'bold', color: sub ? DNG : ACC
        }}>
          mode: {sub ? 'SUBTRACT' : 'ADD'}
        </button>
      </div>

      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ color: '#888', paddingRight: 8 }}>bit</td>
            {idx.map((i) => (
              <td key={i} style={{
                textAlign: 'center', color: '#888', fontFamily: 'monospace'
              }}>{i}</td>
            ))}
            <td />
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>A</td>
            {idx.map((i) => (
              <td key={i}>
                <div onClick={() => flip(a, setA, i)} style={{ cursor: 'pointer' }}>
                  {cell(a[i], ACC, !a[i])}
                </div>
              </td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {av} / {asSigned(av)}
            </td>
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>B</td>
            {idx.map((i) => (
              <td key={i}>
                <div onClick={() => flip(b, setB, i)} style={{ cursor: 'pointer' }}>
                  {cell(b[i], ACC, !b[i])}
                </div>
              </td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {bv} / {asSigned(bv)}
            </td>
          </tr>

          {sub && (
            <tr>
              <td style={{ paddingRight: 8, fontFamily: 'monospace', color: DNG }}>
                NOT B
              </td>
              {idx.map((i) => (
                <td key={i}>{cell(bIn[i], DNG, !bIn[i])}</td>
              ))}
              <td style={{ paddingLeft: 10, fontSize: 12, color: '#888' }}>
                XOR sırasından sonra
              </td>
            </tr>
          )}

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace', color: DNG }}>
              carry in
            </td>
            {idx.map((i) => (
              <td key={i}>{cell(carry[i], DNG, !carry[i])}</td>
            ))}
            <td style={{ paddingLeft: 10, fontSize: 12, color: '#888' }}>
              sağdan gəlir
            </td>
          </tr>

          <tr>
            <td style={{ paddingRight: 8, fontFamily: 'monospace' }}>sum</td>
            {idx.map((i) => (
              <td key={i}>{cell(sum[i], ACC, !sum[i])}</td>
            ))}
            <td style={{ paddingLeft: 10, fontFamily: 'monospace' }}>
              = {result} / {asSigned(result)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontFamily: 'monospace', fontSize: 15 }}>
        carry {N} mərhələdən{' '}
        <b style={{ color: ripple > 4 ? DNG : ACC }}>{ripple}</b> qədərini keçdi
        {' '}&middot;{' '}
        <span style={{ color: '#888' }}>
          critical path-də {ripple * 2} gate delay
        </span>
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          border: `2px solid ${cf ? DNG : '#888'}`,
          background: cf ? `${DNG}22` : 'transparent'
        }}>
          <b style={{ fontFamily: 'monospace' }}>CF = {cf}</b>
          <div style={{ fontSize: 12, color: cf ? DNG : '#888' }}>
            {cf
              ? `unsigned səhvdir: ${av} + ${bv} = ${av + bv}, ${result} deyil`
              : 'unsigned oxunuş düzgündür'}
          </div>
        </div>
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          border: `2px solid ${of ? DNG : '#888'}`,
          background: of ? `${DNG}22` : 'transparent'
        }}>
          <b style={{ fontFamily: 'monospace' }}>OF = {of}</b>
          <div style={{ fontSize: 12, color: of ? DNG : '#888' }}>
            {of
              ? `signed səhvdir: işarə çevrildi, nəticə ${asSigned(result)} kimi oxunur`
              : 'signed oxunuş düzgündür'}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#888' }}>
        Çevirmək üçün istənilən A və ya B bit-inə klikləyin. Burada heç nə
        adder simulyasiyası deyil &mdash; bunlar full adder tənlikləridir,
        hər sütuna bir dənə.
      </p>
    </div>
  );
}
```

</Sandpack>

Diqqətlə baxmağa dəyən iki sətir həmin döngüdə `sum` və `carry`-ni hesablayan sətirlərdir. Onlar circuit-in modeli deyil; onlar *elə circuit-in özüdür* — `a ^ b ^ cin` iki XOR-dur, `(a & b) | (cin & (a ^ b))` isə iki AND və bir OR. On iki simvol JavaScript və beş gate silikon eyni şeyin iki fərqli notasiyada yazılışıdır.

<Recap>

- İki bit-i toplamaq üçün **iki** output lazımdır, çünki `1 + 1 = 10` bir bit-ə sığmır. **Sum** sütunu dəqiq **XOR**-dur; **carry** sütunu dəqiq **AND**. Bu cütlük **half adder**-dir — iki gate.
- Ona görə "half" deyilir ki, real sütunun **üç** input-u var: A, B və sağdan gələn carry. **Full adder** hər üçünü qəbul edir və onlardan neçəsinin 1 olduğunu iki bit-lə bildirir — **iki half adder üstəgəl bir OR**-dan qurulub (daxildəki iki carry heç vaxt eyni anda işə düşə bilməz).
- N ədəd full adder-i zəncirlə, hər birinin `Cout`-unu növbətinin `Cin`-inə qoş və N-bitlik **ripple-carry adder** alarsan — Dərs 2-nin odometer-i gate-lərdə, istənilən genişlikdə düzgün.
- Yuxarıdakı adder **iki müstəqil flag** yaradır. **CF** son carry-dir (unsigned overflow). **OF** isə `MSB-yə daxil olan carry XOR MSB-dən çıxan carry`-dir (signed overflow), çünki yuxarı bit-in çəkisi +128 yox, −128-dir.
- Həmin flag-lər razılaşmır, bu da onların fərqli faktlar olduğunu sübut edir: `127 + 1` **CF = 0, OF = 1** verir (unsigned 128 qaydasındadır, signed isə −128 oxunur — Dərs 3-ün sirri, misdə həll olunmuş), `200 + 100` isə **CF = 1, OF = 0** verir (unsigned 300 overflow edir, signed −56 + 100 = 44 düzgündür).
- **Çıxma pulsuzdur**: hər B input-una bir XOR qoy, onları və birinci `Cin`-i tək bir **mode** telinə bağla, `mode = 1` isə `A + NOT B + 1` hesablayar — two's complement mənfiyə çevirməsi telin özündə edilmiş. Bir circuit, dörd iş və o, bunları bir-birindən ayıra bilmir.
- Carry **critical path**-dir: mərhələ başına iki gate delay o deməkdir ki, 64-bit ripple adder-ə ~128 gate delay ≈ 1.92 ns lazımdır, bu isə 1 ns-lik clock təkanına sığmır. **Carry-lookahead** hər sütun üçün `generate` və `propagate` hesablayır və carry-ləri log₂(64) = 6 dərinlikli ağac kimi həll edir — vaxtı transistor-larla almaq, yəni Babbage-in 1830-larda misdə cəhd etdiyi **anticipating carriage** mübadiləsinin eynisi.
- Adder-lər düzgünlüyünü *sübut* etməyə imkan verəcək qədər kiçikdir; bölücülər yox. 1994-cü ilin **Pentium FDIV** bug-ı — lookup table-da beş çatışmayan yazı — `4195835 / 3145727`-ni dördüncü rəqəmdən etibarən səhv etdi və Intel-ə təxminən **475 milyon dollara** başa gəldi, çünki səhv circuit çərşənbə axşamı yamaqla düzəldilə bilmir.

</Recap>

<Challenges>

#### Zənciri izlə {/*trace-the-chain*/}

8-bit ripple-carry adder ilə `00001111 + 00000001` (15 + 1) topla. Carry-nin hər sütuna necə gəldiyini göstər, nəticəni ver və carry-nin neçə mərhələ piyada getdiyini de. Sonra cavab ver: mərhələ başına iki gate delay götürsək, bu konkret toplama `00000001 + 00000001` ilə müqayisədə nə qədər çəkir?

<Hint>

Sağdan sola, sütun-sütun işlə, hər carry-ni növbətisinə ötür. Carry hansısa sütun 0 carry yaradan kimi yol getməyi dayandırır — bu baş verənə qədər neçə sütundan keçdiyini say.

</Hint>

<Solution>

```
 carry in:  0 0 0 1 1 1 1 0 →
        A:  0 0 0 0 1 1 1 1     15
        B:  0 0 0 0 0 0 0 1      1
      sum:  0 0 0 1 0 0 0 0

 bit 0: 1 + 1 + 0 = 10 → sum 0, carry 1
 bit 1: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 2: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 3: 1 + 0 + 1 = 10 → sum 0, carry 1
 bit 4: 0 + 0 + 1 = 01 → sum 1, carry 0
 bit 5-7: 0 + 0 + 0 = 0

 nəticə: 00010000 = 16 ✓
```

Dörd mərhələ carry yaratdı (bit 0-dan bit 3-ə qədər), sonra bit 4 onu udu, deməli critical path təxminən **4 × 2 = 8 gate delay**-dən keçdi.

`1 + 1 = 00000010` üçün isə yalnız bit 0 carry yaradır — **bir mərhələ, təxminən 2 gate delay**, dörd dəfə sürətli.

Ripple dizaynının narahat edən tərəfi elə budur: *eyni circuit* öz data-sından asılı olaraq fərqli vaxt aparır. Hardware bəzən hazır, bəzən hazır olmayan komponent buraxa bilməz, ona görə clock **ən pis** halın (`11111111 + 00000001`, səkkiz mərhələnin hamısından keçən carry) yavaşlığına uyğun olmalıdır — hər tək toplamada, hətta `0 + 0`-da belə. Bundan sonra quracağın hər şey həmişə ən pis halı ödəyir — növbəti dərsin məhz clock haqqında olmasının səbəbi də elə budur.

</Solution>

#### Hər iki flag-i qabaqcadan de {/*predict-both-flags*/}

Aşağıdakı hər 8-bit toplama üçün nəticə bit-lərini, sonra CF və OF-u hesabla, sonra isə hansı oxunuşun — unsigned, signed, hər ikisi, yoxsa heç biri — səhv cavab verdiyini de.

**(a)** `01100100 + 00110010` (100 + 50)  ·  **(b)** `11111111 + 00000001` (255 + 1)  ·  **(c)** `10000000 + 10000000`

<Solution>

**(a) 100 + 50**

```
 carry:  1 1 0 0 0 0 0 0 →      bit 7-yə daxil olan = 1, çıxan = 0
   sum:  1 0 0 1 0 1 1 0   = unsigned 150, signed −106

 CF = 0   OF = 1 XOR 0 = 1
```

Unsigned **düzgündür** (150 sığır). Signed **səhvdir**: 100 + 50 = 150 +127-ni aşır, ona görə −106-ya dolandı. Yalnız signed oxunuş sındı — Dərs 3-dəki temperatur sensoru ilə eyni nasazlıq.

**(b) 255 + 1**

```
 carry:  1 1 1 1 1 1 1 0 →      bit 7-yə daxil olan = 1, çıxan = 1
   sum:  0 0 0 0 0 0 0 0   = unsigned 0, signed 0

 CF = 1   OF = 1 XOR 1 = 0
```

Unsigned **səhvdir** (256 sıfıra çevrildi — Dərs 2-nin sıfıra qayıtması). Signed **düzgündür**: signed dəyər kimi bu, −1 + 1 = 0 idi ✓. Diqqət et ki, burada carry səkkiz mərhələnin hamısından keçdi: 8-bit adder-in edə biləcəyi ən yavaş toplama.

**(c) 128 + 128**

```
 carry:  0 0 0 0 0 0 0 0 →      bit 7-yə daxil olan = 0, çıxan = 1
   sum:  0 0 0 0 0 0 0 0   = 0

 CF = 1   OF = 0 XOR 1 = 1
```

**Hər ikisi** səhvdir. Unsigned: 256 sığmır. Signed: −128 + −128 = −256, təmsil oluna biləcək aralığa heç yaxın deyil və iki mənfi ədədin toplanması 0 verdi. Məhz bu hal göstərir ki, OF-ə niyə sadəcə işarə bit-inə baxmaq deyil, XOR düsturu lazımdır — və hardware-in bu qədər tam bir fəlakəti nə qədər ucuz aşkarladığına fikir ver: iki tel üzərində bir XOR gate.

</Solution>

#### Genişlik yüksəltməsi {/*the-width-upgrade*/}

Köçürmə tapşırığı. Bir hardware dizayn təklifini nəzərdən keçirirsən. Kiçik təcrübəli mühəndis paket-bayt sayğacını 32 bit-dən 64 bit-ə genişləndirməlidir və belə yazır: *"Sadə dəyişiklikdir: bizim 32-bit adder-imiz təmiz ripple-carry dizaynıdır, ona görə 32 əvəzinə 64 mərhələ yaradacağam. Eyni logic, eyni verifikasiya, sadəcə iki dəfə çox hüceyrə. Çip 1 GHz-də işləyir və hazırkı adder timing-ə ehtiyatla sığır."*

Mərhələ başına iki gate delay və gate başına təxminən 15 ps götür. Əvvəlki və sonrakı ən pis hal gecikməsini hesabla, təklifin buraxılıb-buraxılmayacağına qərar ver və review-nu yaz — ən azı iki konkret variant və hər birinin qiyməti ilə birlikdə.

<Solution>

**Əvvəlcə hesab.**

```
 1 GHz-də clock dövrü:            1 / 10⁹ s = 1000 ps = 1.00 ns

 32-bit ripple:  32 × 2 × 15 ps =  960 ps  →  1000 ps-ə sığır, güclə
 64-bit ripple:  64 × 2 × 15 ps = 1920 ps  →  büdcənin təxminən 2 misli ✗
```

Deməli, təklif **buraxıla bilməz**, üstəlik mühəndisin öz cümləsindəki tələyə fikir ver: "timing-ə ehtiyatla sığır" ifadəsi elə bu gün də yalandır — 1000 ps-lik büdcənin 960 ps-i 4% ehtiyat deməkdir, üstəlik naqil gecikməsi, clock skew, temperatur və istehsal fərqləri hələ hesaba alınmayıb. Mövcud dizayn onsuz da sərhəddədir; onu ikiqat etmək "iki dəfə çox hüceyrə" deyil, **critical path-də iki dəfə çox gecikmədir**, çünki ripple-carry gecikməsi genişliklə xətti artır, clock dövrü isə heç artmır.

**Variantlar və qiymətləri:**

1. **Carry-lookahead (və ya carry-select kimi hibrid).** Hər sütun üçün `generate` və `propagate` hesabla və carry-ləri ağac kimi həll et: 64 mərhələ əvəzinə təxminən log₂(64) ≈ 6 səviyyə dərinlik, 1 ns-ə rahatca sığır. Qiyməti: xeyli çox gate, deməli daha çox sahə və daha çox keçid gücü — həm də verifikasiya üçün daha mürəkkəb blok, hərçənd adder-lər formal olaraq sübut oluna bildiyi üçün bu, həll edilə biləndir.
2. **Toplamanı iki clock dövrü boyunca pipeline et.** Birinci dövrədə aşağı 32 bit-i topla, carry-ni saxla, ikinci dövrədə yuxarı 32 bit-i topla. Qiyməti: nəticələr bir dövrə gec gəlir və sayğacın hər istifadəçisi bu gecikməyə dözməlidir — bu, lokal deyil, bütün dizaynı əhatə edən dəyişiklikdir.
3. **Tələbin özünü şübhə altına al.** Paket sayğacı heç bir kritik qərar yolunda deyil; əgər onu yalnız arabir *oxumaq* lazımdırsa, iki dövrədə yenilənə və ya daha yavaş bir clock domenində işləyə bilər. Qiyməti: tələb həqiqətən bu qədər sərbəstdirsə, demək olar ki, sıfır — və bunu soruşmağa beş dəqiqə ayırmaq gate xərcləməkdən əvvəl dəyər.

**Review şərhi:** *"Yazıldığı kimi bloklayıram. Ripple-carry gecikməsi genişliklə xəttidir, ona görə 64 mərhələ 1.00 ns-lik dövrə qarşı ~1.92 ns deməkdir — üstəlik mövcud 32-bit versiya onsuz da ~960 ps-dədir, yəni naqil, skew və proses fərqlərindən əvvəl cəmi 4% ehtiyat, ona görə hazırkı dizaynı da riskli sayardım. Ya lookahead/carry-select struktura keçək (daha çox sahə və güc, bir dövrəyə sığır), ya da iki dövrə üzərində pipeline edək (sahədə pulsuz, hər oxuyucu üçün bir dövrə gecikmə). Hər ikisindən əvvəl gəlin dəqiqləşdirək ki, bu sayğacın nə qədər tez görünməsi əslində lazımdır — iki dövrəlik yeniləməyə dözürsə, üçüncü variant açıq-aydın ən ucuz həlldir."*

Köçürülə bilən vərdiş: **bir təklif "sadəcə eynisindən daha çox" deyəndə, hansı kəmiyyətin və nə sürətlə artdığını soruş.** İki dəfə genişlik iki dəfə *hüceyrə* və iki dəfə *gecikmə* demək idi — bu iki rəqəmdən isə yalnız birinin yanında sərt bir tavan dayanırdı. ✓

</Solution>

</Challenges>

<LearnMore title="Clock və Sinxronizasiya" path="/learn/faza-0/modul-0-2/clock-synchronization">

Sən düzgün cavabı verən bir circuit qurdun — nəhayətdə. Carry-yə yol getmək üçün vaxt lazımdır, bu yol ədədlərdən asılı olaraq fərqli sayda addım çəkir və o bitənə qədər output bit-ləri heç bir truth table sətrinə aid olmayan mənasız titrəyişdir. Deməli, maşına etibar edilməzdən əvvəl bir şey də lazımdır: *indi* deyən bir şey. Növbəti dərs: clock — milyardlarla yarışan siqnalın cavabın nə vaxt sayıldığı barədə razılaşmasını təmin edən ürək döyüntüsü — və dünyanın ən sürətli circuit-inin nə vaxt baxmaq lazım olduğunu heç kim bilmirsə, niyə faydasız olduğu.

</LearnMore>