---
title: "Fetch–Decode–Execute Dövrəsi"
---

<Intro>

İlk insan Ayın üzərində dayanmasına üç dəqiqə qalmış, enmə aparatını uçuran kompüter təslim oldu. 20 iyul 1969-cu ildə Sakitlik Dənizinə enərkən Apollo Guidance Computer ekranında sarı bir kod yandırdı: **1202**. Buzz Aldrin onu ucadan oxudu. Sonra bu, yenidən baş verdi. Sonra 1201. Dörd dəqiqədə beş həyəcan siqnalı və Hyustonda idarəetmə zabiti Steve Bales-in uçuşu dayandırmaq və ya davam etdirmək qərarını verməyə saniyələri vardı. Siqnal *executive overflow* demək idi — kompüterə bitirə biləcəyindən çox iş verilmişdi, çünki səhv mövqedə qalmış rendezvous radarı, enişin onsuz da tələb etdiyi 83%-in üstünə, heç kimə lazım olmayan iş üçün **dövrələrin təxminən 13%-ini** oğurlayırdı. Saniyənin içində kifayət qədər dövrə yox idi. Konsolunun pleksiqlası altına yapışdırılmış əlyazma arayışı oxuyan Jack Garman-ın istiqamətləndirməsi ilə Bales **go** dedi — çünki MIT-də Margaret Hamilton-un komandası elə software qurmuşdu ki, o, ən az vacib işlərini ata bilir və uçmağa davam edirdi. Eagle endi. Bu hekayədə hər şey processor-lar haqqında bir fakta söykənir və bu dərs elə həmin fakt haqqındadır: CPU sabit sürətlə, dönə-dönə, düz bir iş görür — instruction gətirir, onun nə demək olduğunu müəyyən edir və onu yerinə yetirir. Kompüterinin malik olduğu hər imkan həmin döngüdür və döngü artıq xərcləyə biləcəyin bir büdcədir.

</Intro>

<YouWillLearn>

- Üç fazanı — **fetch**, **decode**, **execute** — və hər birində dəqiq nəyin hərəkət etdiyini
- Bir instruction-ın bir neçə clock təkanına necə yayıldığını və "dövrə başına bir instruction" ifadəsinin niyə mif olduğunu
- **Jump**-ın niyə xüsusi bir güc yox, bir multiplexer üzərindəki bir əlavə input olduğunu
- `if`-in heç kimin saxlamadığı bir çıxmadan və açarı idarə edən bir flag-dən necə qurulduğunu
- Döngünün program counter-in gözü ilə necə göründüyünü — real x86 maşın kodunda izlənmiş halda
- **Interrupt**-ların döngünü kənardan necə pozduğunu — klaviaturanın işləməsinin yeganə səbəbi budur

</YouWillLearn>

<InlineToc />

## Heç vaxt dayanmayan döngü {/*the-loop-that-never-stops*/}

Keçən dərs hissələri düzdü: register-lər, ALU, program counter, instruction register, control unit. Çatışmayan şey *ardıcıllıq* idi. Processor bütün hissələrini eyni anda işə salmır; o, əbədi olaraq, eyni sıra ilə eyni üç fazadan keçir.

<Diagram name="fetch-decode-execute/cycle_ring" height={430} width={720} alt="Dairəvi sxem, başlıq: 'heç vaxt dayanmayan döngü'. Dairə boyunca üç yumru künclü qutu düzülüb: yuxarıda mavi rəngdə FETCH, qeyddə 'PC-nin göstərdiyi byte-ı oxu'; aşağı sağda qırmızı rəngdə DECODE, qeyddə 'hansı açarları qurmaq lazım olduğunu müəyyən et'; aşağı solda mavi rəngdə EXECUTE, qeyddə 'onu həqiqətən et, sonra PC-ni tərpət'. Üç qutu arasında saat əqrəbi istiqamətində boz əyri oxlar gedir və qapalı halqa əmələ gətirir. Halqanın mərkəzində monospace şriftlə PC yazılmış boz qutu oturur, qeyddə 'ötürülən yeganə state'. Aşağıdakı altyazılar: saniyədə milyardlarla dəfə, işə düşmədən sönənə qədər; və: CPU-nun boş state-i yoxdur — heç nə etməmək də bir proqramdır.">

Dördüncü faza yoxdur, istirahət vəziyyəti yoxdur, çıxış yoxdur. Enerji çipə çatan andan kəsilənə qədər processor bu halqanın harasındasa olur.

</Diagram>

Son altyazı bir anlıq dayanmağa dəyər. Noutbukun "boşdayanan" vəziyyətdə olanda, o, dayanmayıb — o, *idle loop* işlədir: bütün işi nəsə baş verənə qədər zərif şəkildə heç nə etmək olan kiçik bir proqram. Video render edən maşınla masaüstündə sakit dayanan maşın arasındakı yeganə fərq döngünün **hansı** instruction-ları gətirməsidir, gətirib-gətirməməsi yox.

Halqanın ortasında nəyin oturduğuna fikir ver: **program counter**. CPU-dakı hər şey qaralamadır — register dəyərləri, ALU input-ları, control siqnalları, hamısı hər dövrədə yenidən yaradılır. PC isə yeganə davamlılıq sapıdır, "harada idik?" sualına cavab verən tək ədəd. Onu dəyiş və maşının gələcəyini dəyişmiş olarsan — bu dərsin ikinci yarısı bütünlüklə bundan ibarətdir.

## Fetch {/*fetch*/}

Birinci faza bir sual verir: *sonra nə etməliyəm?* Cavab həmişə eyni yerdədir — PC-də hazırda olan ünvanda.

<Diagram name="fetch-decode-execute/fetch_detail" height={380} width={720} alt="Sxem, başlıq: 'FETCH: get və byte-ı gətir'. Solda PC yazılmış qırmızı qutu, içində 2 dəyəri. Qırmızı ox sağa, 'address bus' yazılmış boz qutuya aparır, qeyddə '2-ci ünvanda nə var?', oradan da sağdakı yaddaş blokuna gedir; blokda dörd binary dəyər var, üçüncüsü olan 00111111 qırmızı ilə vurğulanıb. Yaddaş blokundan mavi ox çıxır, aşağı və sola, 'data bus' yazılmış mavi qutuya gedir, sonra sola davam edərək indi 00111111 saxlayan IR yazılmış mavi qutuya çatır. PC qutusundan aşağı və geriyə, address yoluna dolanan kəsik boz ox var, üzərində 'PC ← PC + 1' yazısı. Altyazılar: PC-dəki ünvanda olan byte instruction register-ə köçürülür; və: PC səssizcə irəli addımlayır, hələ heç kim gələnə baxmamış.">

Ünvan çölə, byte geri və sayğac artıq növbətini göstərir.

</Diagram>

Bu sıra ilə üç şey baş verir: <CodeStep step={1}>PC address bus-u sürür</CodeStep>, <CodeStep step={2}>yaddaş həmin ünvandakı byte-ı data bus-a qaytarır</CodeStep> və <CodeStep step={3}>həmin byte instruction register-ə tutulur</CodeStep>.

Sonra dördüncü şey baş verir və yadda saxlamağa dəyəni elə odur: <CodeStep step={4}>PC artırılır</CodeStep> — *hələ heç kim instruction-a baxmamış*. Processor nikbinliklə ehtimal edir ki, növbəti instruction yaddaşdakı növbəti instruction-dır, çünki demək olar ki, həmişə elədir. Bu, xırda təfərrüat deyil. Bu o deməkdir ki, jump instruction-ı dekod olunanda PC **artıq irəli getmiş olur** — real maşın kodunda jump hədəflərinin niyə bu qədər tez-tez "bundan sonrakı instruction"-a nisbətən ölçüldüyünün səbəbi məhz budur. Həmin ədədi bu dərsdə sonra, onaltılıq sistemdə görəcəksən.

<Note>

Fetch həm də keçən dərsdəki yaddaş pilləkəninin haqqını almağa gəldiyi yerdir. Instruction təsadüfən L1 instruction cache-dədirsə, bu faza bir neçə dövrəyə başa gəlir. Deyilsə, CPU əsas yaddaş üçün **200 dövrə** gözləyə bilər — hələ baxmadığı bir byte üçün. Elə buna görə processor-lar hansı instruction-lara ehtiyacları olacağını onlara *ehtiyac yaranmazdan əvvəl* təxmin etməyə bu qədər səy göstərir və elə buna görə cache-ə sığan sıx bir döngü sığmayandan bir tərtib sürətli işləyə bilir.

</Note>

## Decode {/*decode*/}

Byte IR-dədir. İndi control unit onu oxuyur və hansı açarları bağlamaq lazım olduğunu müəyyən edir.

<Diagram name="fetch-decode-execute/decode_detail" height={380} width={720} alt="Sxem, başlıq: 'DECODE: nə demək olduğunu müəyyən et'. Yuxarıda instruction register iki qutuya bölünmüş göstərilir: içində 0011 olan və 'opcode = SUB' yazılmış mavi qutu, və içində 1111 olan və 'operand = 15' yazılmış boz qutu. Hər iki qutudan aşağı, 'control unit' yazılmış qırmızı qutuya oxlar gedir. Həmin qutudan altı kəsik xətt altı siqnal qutusuna açılır: MemRead = 1, MemAddr = 15, ALUop = SUB, AccWrite = 1, SetFlags = 1 və PCload = 0. Beşi aktiv kimi qırmızı ilə vurğulanıb, sonuncusu isə boz və qeyri-aktivdir. Altyazı: bir byte içəri, bir ovuc açar mövqeyi çölə — saf combinational logic.">

Opcode hesablama yox, indeksdir. Eyni dörd bit həmişə eyni telləri qaldırır.

</Diagram>

Dekodlama axtarışdır, hesablama deyil. Instruction sahələrə bölünür — burada *nə* olduğunu deyən 4-bitlik **opcode** və *nəyə* olduğunu deyən 4-bitlik **operand** — və opcode açar mövqelərinin sabit cədvəlində indeks rolunu oynayır. Uyğunlaşdırma heç vaxt dəyişmədiyi üçün bütün faza combinational logic-in oturmasıdır, tam olaraq keçən dərsdə təsvir olunduğu kimi.

Orada bozardılmış və qeyri-aktiv halda dayanan `PCload = 0`-a fikir ver. Həmin tək tel "davam et" ilə "başqa yerə get" arasındakı fərqdir və `SUB` üçün o, aşağıda qalır. Ondan gözünü çəkmə.

## Execute {/*execute*/}

İndi açarlar qurulub, deməli data hərəkət edə bilər.

<Diagram name="fetch-decode-execute/execute_detail" height={380} width={720} alt="Sxem, başlıq: 'EXECUTE: onu həqiqətən et'. Solda içində 5 olan və 'A register' yazılmış mavi qutu, içində 1 olan və 'memory[15]' yazılmış boz qutu. Hər ikisindən mərkəzdəki kəsikli mavi ALU formasına mavi oxlar gedir; ALU-nun üzərində SUB əməliyyatı yazılıb. ALU-ya yuxarı doğru 'control unit-dən gələn ALUop' yazılmış kəsik qırmızı ox göstərir. ALU-dan sağa mavi ox çıxır və içində 4 olan 'result' qutusuna gedir, boz ox isə Z=0 N=0 C=0 göstərən 'flags' qutusuna gedir. Result qutusundan aşağı və sola dolanan uzun mavi ox A register-ə qayıdır, üzərində 'növbəti clock edge-də A-ya geri yazılır' yazısı. Altyazı: operand-lar görüşür, ALU öz yeganə işini görür və cavab saxlanılır.">

Data-na həqiqətən nəsə baş verən yeganə faza — və flag-lər istəyib-istəmədiyindən asılı olmayaraq çıxır.

</Diagram>

Arifmetik instruction üçün bu, ALU-nun iki dərs əvvəl onu qurduğun işi görməsidir. Load üçün bu, yaddaşa ikinci gedişdir. Store üçün yazmadır. Və hər halda nəticə **clock edge-də** tutulur — clock dərsindəki nizam öz işini görür: cavaba logic-in içindən keçib tam oturmağa icazə verilir və yalnız bundan sonra o, təsdiqlənir.

ALU-dan iki output çıxır və ikincisini nəzərdən qaçırmaq asandır. Nəticə ilə yanaşı **flag**-lər gəlir — `Z`, `N`, `C`, `V` — və onlar kiminsə istəyib-istəmədiyindən asılı olmayaraq saxlanılır. Hələ heç nə onlardan istifadə etməyib. Onlar isə maşındakı ən vacib tellərə çevrilmək üzrədir.

## Beş təkan, bir instruction {/*five-ticks-one-instruction*/}

Üç faza məntiqi təsvirdir, timing sxemi deyil. Sadə processor-da hər faza daha kiçik addımlara bölünür, hər clock təkanına bir, və bunlara çox vaxt **T-state** deyilir:

<Diagram name="fetch-decode-execute/tstate_timeline" height={400} width={720} alt="Zaman xətti, başlıq: 'bir instruction, beş clock təkanı'. Soldan sağa T1-dən T5-ə qədər adlanmış beş qutu düzülüb, hər birinin içində qısa təsvir, altında isə faza adı var. T1: PC address bus-a, faza fetch. T2: yaddaş IR-ə, PC üstəgəl 1, faza fetch. T3: control unit, opcode-u oxuyur, faza decode. T4: operand ALU-ya, ikinci input hazır, faza execute. T5: nəticə register-ə, flag-lər qurulur, faza execute. Boz oxlar hər qutunu növbətisinə bağlayır. Qutuların altında clk adlı qırmızı düzbucaqlı clock siqnalı gedir, hər T-state-in altına bir dövrə düşür. Altyazılar: fazalar bərabər deyil və həmişə beş dənə də deyil — sadə instruction üçü çəkə bilər, yaddaşa müraciət onlarla, müasir CPU isə eyni anda bir neçə instruction-ı üst-üstə salır; amma sıra heç vaxt pozulmur: heç nə fetch olunmadan icra olunmur.">

Bir instruction, clock-a qarşı açılmış halda. Hər təkan bir şeyi tərpədir.

</Diagram>

Processor-lar haqqında ən inadkar yanlış təsəvvür məhz burada ölür. 3 GHz-lik CPU saniyədə üç milyard instruction icra etmir. O, saniyədə üç milyard dəfə təkan verir, instruction-lar isə *dəyişkən* sayda təkan yeyir: register-dən register-ə toplama bir təkan çəkə bilər, bölmə iyirmi, cache-i buraxan load isə iki yüz. Orta qiymət **CPI** adlanır — dövrə başına instruction — və onu sıxmaq processor mühəndisliyinin nəhəng bir hissəsinin əsas məşğuliyyətidir.

<Note>

Əgər instruction-ların hər biri bir neçə dövrə çəkirsə və maşının çox hissəsi həmin dövrələrin çoxunda boş dayanırsa, aydın bir fikir özünü göstərir: instruction 1 icra olunarkən niyə instruction 2-ni fetch etməyək? O, dekod olunarkən niyə instruction 3-ü fetch etməyək? Bu fikir **pipelining**-dir, 1980-ci illərdən bəri qurulmuş hər processor CPI-ni 1-ə (və aşağısına) doğru məhz bununla endirir və onun buradan iki dayanacaq sonra öz dərsi var. Hələlik sadə mənzərəni saxla: bir instruction, başdan sona, sonra növbəti.

</Note>

## «Başqa yerə get» deyən instruction {/*the-instruction-that-says-go-somewhere-else*/}

İndiyə qədər hər şey PC-nin sadəcə yuxarı saydığını fərz etdi. Onun etdiyi yalnız bu olsaydı, proqram bir dəfə icra olunan düz xətt olardı — nə döngü, nə funksiya, nə şərt, nə əməliyyat sistemi. Kompüterin etdiyi hər maraqlı şey növbəti instruction-ı *icra etməmək* qabiliyyətini tələb edir.

Bütün mexanizm buradadır və o, az qala məyusedicidir:

<Diagram name="fetch-decode-execute/pc_input_mux" height={380} width={340} alt="Sxem, başlıq: 'PC növbəti dəyərini haradan alır'. Solda iki qutu 'mux' yazılmış qırmızı trapesiyaya daxil olur: yuxarıda içində PC + 1 olan boz qutu, qeyddə 'standart variant', aşağıda isə içində 'target' olan qırmızı qutu, qeyddə 'instruction-dan gəlir'. Mux-un altına 'jump?' yazılmış kəsik qırmızı ox yuxarı göstərir. Mux-un output-u sağa, PC yazılmış qutuya aparır. Altyazı: jump xüsusi bir güc deyil — o, bir multiplexer üzərindəki bir əlavə input-dur.">

İki mümkün gələcək, bir select teli.

</Diagram>

PC bir register-dir. Register-lərin input-u olur. Həmin input-a iki seçimli **multiplexer** qoy — artırılmış dəyər, ya da instruction-ın verdiyi ünvan — və tək bir control teli növbəti clock edge-də hansının yazılacağına qərar versin. Həmin tel decode sxemində bozardılmış halda oturan `PCload` siqnalıdır.

Jump budur. Nə "goto mexanizmi" var, nə xüsusi rejim. Processor bunu qeyri-adi bir şey kimi hiss etmir də: o, fetch edir, decode edir, execute edir, sadəcə `JMP`-in execute fazası register əvəzinə PC-yə yazır. Növbəti dövrədə fetch PC indi hara göstərirsə oradan oxuyur, həmişəki kimi.

## `if` necə baş verir {/*how-an-if-happens*/}

Şərtsiz jump sənə heç vaxt bitməyən döngülər verir. *Qərar* vermək üçün mux-un select teli data-dan asılı olmalıdır — və lazımi məlumatı daşıyan tellər onsuz da oradadır, hər ALU əməliyyatı tərəfindən yaradılır və indiyə qədər səssizcə nəzərə alınmır.

<CodeDiagram>

```
 SUB 15      ; A = A - 1, və flag-ləri qur
 JZ  6       ; əgər Z qalxıbsa, PC ← 6

 ; SUB iki iş görür:
 ;   proqramın istədiyi arifmetika
 ;   branch-in oxuyacağı müqayisə
```

<Diagram name="fetch-decode-execute/branch_decision" height={380} width={340} alt="Sxem, başlıq: 'maşın necə qərar verir'. Yuxarıda SUB yazılmış boz qutu, qeyddə 'nəticə atılır, flag-lər saxlanılır'. Aşağı ox içində Z = 1 olan qırmızı qutuya aparır. Ondan sağa ox JZ yazılmış qırmızı qutuya gedir. JZ-dən aşağı ox içində 'jump = 1' olan daha geniş qırmızı qutuya aparır. Altyazılar: müqayisə heç kimin saxlamadığı bir çıxmadır; və: if bir multiplexer-i qidalandıran flag-dir.">

Çıx, yalnız hökmü saxla, qoy bir bit açarı idarə etsin.

</Diagram>

</CodeDiagram>

İndiyə qədər yazdığın hər şərt nəticədə belə həll olunur. `a == b` kimi müqayisə **nəticəsi atılan bir çıxmaya** kompilyasiya olunur; saxlanan yeganə şey `Z` flag-idir və o, məhz iki dəyər bərabər olanda 1-dir. `a < b` isə onun əvəzinə sign və carry flag-lərini oxuyur. Sonra şərti branch instruction-ı seçilmiş flag-i PC-nin multiplexer-inə qoşur.

Deməli, "kompüter necə qərar verir" sualının ən dibdəki cavabı budur: vermir. O, çıxma edir, cavabın sıfır olub-olmadığını görür və həmin bir bit-in açarı idarə etməsinə icazə verir.

## Döngü, PC-nin gözü ilə {/*a-loop-from-the-pcs-point-of-view*/}

Jump-ları və flag-ləri birləşdir və təkrarlanma alarsan. Bax burada kiçik bir maşın üçün tam proqram var — 5-dən geriyə sayan və saydıqca çap edən sayğac. Instruction formatı 4 bit opcode və 4 bit operand-dır, deməli hər instruction dəqiq bir byte-dır:

```
 ünv.  byte        assembly     nə edir
 ────  ────────    ─────────    ─────────────────────────────
   0   01010101    LDI 5        A ← 5
   1   11100000    OUT          A-nı çap et
   2   00111111    SUB 15       A ← A − memory[15], flag-ləri qur
   3   10000110    JZ  6        əgər Z-dirsə PC ← 6
   4   01100001    JMP 1        PC ← 1
   6   11110000    HLT          dayan
  15   00000001    (data: 1)    döngünün çıxdığı sabit
```

Yeddi mənalı byte. Onu işə sal və output belədir:

<ConsoleBlockMulti>

<ConsoleLogLine level="info">

5

</ConsoleLogLine>

<ConsoleLogLine level="info">

4

</ConsoleLogLine>

<ConsoleLogLine level="info">

3

</ConsoleLogLine>

<ConsoleLogLine level="info">

2

</ConsoleLogLine>

<ConsoleLogLine level="info">

1

</ConsoleLogLine>

</ConsoleBlockMulti>

İndi eyni proqrama *processor*-un yaşadığı kimi bax — yaddaşdakı yeddi instruction kimi yox, PC-nin zaman içində getdiyi yol kimi:

<Diagram name="fetch-decode-execute/loop_pc_trace" height={420} width={720} alt="Xətt qrafiki, başlıq: 'döngü PC-nin gözü ilə necə görünür'. Şaquli ox PC adlanır və kəsik şəbəkə xətləri ilə 0-dan 7-yə qədər gedir. Üfüqi ox zamandır, mavi xətlə birləşdirilmiş 21 nöqtə var. Xətt 0, 1, 2, 3, 4 qalxır, sonra kəskin şəkildə 1-ə düşür, yenidən 4-ə qalxır, yenə 1-ə düşür və bu mişar dişini dörd dəfə təkrarlayır, sonda isə 3-dən 6-ya qalxır. Hər aşağı düşmə qalın qırmızı seqment kimi çəkilib və son nöqtəsi qırmızı nöqtə ilə işarələnib; yuxarı addımlar mavidir. Solda 'start', sağda 'HLT' yazıları var. Altyazılar: hər qırmızı düşmə bir JMP 1-dir — PC artırılmaq əvəzinə yazılır; proqramda 7 instruction var; processor onlardan 21-ni icra etdi; döngü yaddaşdakı struktur deyil — o, PC-nin zaman içində cızdığı formadır.">

Yeddi instruction-ın iyirmi bir icrası. Döngü yalnız bu formada mövcuddur.

</Diagram>

Yaddaşda yeddi instruction; icra olunan iyirmi bir. Döngü heç yerdə obyekt kimi mövcud deyil — nə döngü instruction-ı var, nə mötərizə, nə blok. Mövcud olan şey bir register-in dəyərindəki mişar dişidir. **Döngü PC-nin cızdığı formadır** və bu yenidən çərçivələmə karyeranın qalan hissəsi boyunca öz haqqını ödəyəcək: elə buna görə "döngü", "funksiya çağırışı", "goto" və "exception" maşın səviyyəsində fərqli uçotla yerinə yetirilən eyni hərəkətdir.

## Eyni şey, real maşın kodunda {/*the-same-thing-in-real-machine-code*/}

Bunların heç biri tədris üçün sadələşdirmə deyil. Bax burada real x86-64 processor üçün kompilyasiya olunmuş əsl C funksiyası var, xam byte-ları göstərilməklə disassemble edilib (simvol adları en üçün kəsilib):

<TerminalBlock>

gcc -O1 -c loop.c && objdump -d loop.o

Disassembly of section .text:
   0:  f3 0f 1e fa     endbr64
   4:  85 ff           test   %edi,%edi
   6:  74 0d           je     15
   8:  b8 00 00 00 00  mov    $0x0,%eax
   d:  01 f8           add    %edi,%eax
   f:  83 ef 01        sub    $0x1,%edi
  12:  75 f9           jne    d
  14:  c3              ret

</TerminalBlock>

Bu dərsin irəli sürdüyü hər iddia həmin səkkiz sətirdə görünür.

Döngünün gövdəsi üç instruction-dır: `d`, `f` və `12` ünvanlarında. `f`-dəki `sub` sayğacı azaldır **və flag-ləri qurur**, tam olaraq oyuncaq proqramın `SUB`-ının etdiyi kimi. `12`-dəki `jne` həmin flag-ləri oxuyur və şərtlə PC-yə yazır. İndi də həmin jump-ın byte-larına bax: `75 f9`. İki byte — bir opcode və bir operand — və operand `0xf9`-dur; *signed byte* kimi (Modul 0.1-in Dərs 3-ü, hələ də haqqını qazanır) o, belədir:

```
 0xf9 = 11111001 = −7

 jne instruction-ı 0x12-də oturur və 2 byte uzunluğundadır,
 deməli jump icra olunanda PC artıq 0x14-ə irəliləyib

 0x14 + (−7) = 0x0D   ← döngünün başı ✓
```

Bax budur: fetch fazasının erkən artırması, two's complement və PC multiplexer-i — hamısı real processor-dakı real maşın kodunun iki byte-ının içində əlbir işləyir. Jump məhz PC artıq tərpəndiyi üçün *nisbi*-dir.

<YouTubeIframe src="https://www.youtube.com/embed/dHWFpkGsxOs" title="Ben Eater — 8-bit CPU control logic: Part 3" />

Bunun sxemdə yox, fiziki hardware-də baş verdiyini görmək istəyirsənsə, yuxarıdakı video bir saata dəyər. Ben Eater breadboard üzərində ayrı-ayrı logic çiplərindən processor qurur və bu buraxılışda instruction dövrəsinin özünü naqilləyir — T-state-lərdən keçən halqa sayğacı, opcode-u control siqnallarına çevirən EEPROM-lar — sonra isə onun üzərində proqram işlədir, hər control xətti LED kimi görünən halda. Qurduğu maşın demək olar ki, tam olaraq bu dərsdə istifadə olunan 4-bitlik opcode formatını işlədir, ona görə instruction-lar sənə tanış gələcək.

<Pitfall>

**Program counter müqəddəs deyil və onun hara göstərdiyini heç nə yoxlamır.**

Səhv CPU-nun "sənin funksiyanı işlətdiyini" təsəvvür etməkdir. O, bunu etmir. O, PC nəyi göstərirsə onu işlədir və PC düzgün kodlaması olan istənilən instruction-ın yaza biləcəyi adi bir register-dir.

Elə buna görə korlanmış geri-qayıtma ünvanı sadəcə səhv yox, fəlakətlidir. Funksiya geri qayıdanda processor PC-ni yaddaşda saxlanmış dəyərdən yükləyir — və nəsə həmin dəyərin üstünü yazıbsa, icra sadəcə yeni ünvanda davam edir, orada yaşayan byte-ları fetch və decode edir. Xəta yoxdur, çünki CPU-nun gözü ilə qeyri-adi heç nə baş vermədi: o, fetch etdi, decode etdi, execute etdi. Keçən dərsin `NX` bit-i həmin təyinatların *bəzilərini* qanunsuz etmək üçün mövcuddur, amma maşının özündə "etibarlı" instruction ünvanı anlayışı yoxdur.

Bununla bağlı, daha mülayim səhv isə disassembly oxuyub hər sətrin eyni qiymətə başa gəldiyini fərz etməkdir. T-state sxemi göstərdiyi kimi, instruction-lar kəskin şəkildə fərqli sayda dövrə yeyir, ona görə *instruction saymaq vaxt ölçmək deyil*. Eyni instruction sayına malik iki funksiya, biri fetch fazasında dayanmadan cache buraxırsa, bir tərtib fərqlənə bilər.

</Pitfall>

<DeepDive>

#### Döngünü kənardan nə pozur {/*what-breaks-the-loop-from-outside*/}

Təsvir olunduğu şəkildə dövrə hermetikdir və tamamilə kardır. Fetch, decode, execute, təkrar — həmin halqadakı heç nə sənin bir düyməyə basdığını, şəbəkə paketinin gəldiyini və ya diskin oxumağı bitirdiyini görə bilməz. Xarici dünya haqqında öyrənməyin yeganə yolu onu yoxlamaq olsaydı, processor "nəsə baş veribmi?" sualını etdiyi hər şeyin arasına səpələməli olardı və dövrələrinin çoxunu cavabı demək olar ki, həmişə yox olan suallara sərf edərdi. Bu yanaşma mövcuddur və **polling** adlanır; busy-wait döngüsündə ilişib qalmış proqramın nüvəni heç nə etmədən 100%-də saxlaya bilməsinin səbəbi elə budur.

Alternativ xarici dünyanın *interrupt* etməsinə icazə verməkdir. CPU-ya gedən xüsusi bir tel — praktikada bir neçəsi — diqqətə ehtiyacı olan istənilən qurğu tərəfindən qaldırıla bilər. Cari instruction-ın sonunda (heç vaxt ortasında: dövrə başladığını bitirir) processor həmin telə baxır və o, yüksəkdirsə, sadəliyi ilə heyrətamiz bir şey edir:

1. PC-ni — geri-qayıtma ünvanını — təhlükəsiz bir yerdə saxlayır.
2. PC-yə cədvəldən tapılan handler proseduru ünvanını yükləyir.
3. Adi dövrəni davam etdirir və dövrə indi özünü handler-i icra edərkən tapır.
4. Handler saxlanmış PC-ni bərpa edən "return from interrupt" instruction-ı ilə bitir.

Bütün mexanizm budur. Fikir ver ki, 2-dən 4-ə qədər addımlar *sadəcə jump-lardır* — eyni multiplexer, eyni PC-yə yazma, ondan sonra eyni fetch fazası. Interrupt hardware-in soruşmadan yerinə yetirdiyi jump-dır və kompüteri cavabverici hiss etdirən hər şey onun üzərində qurulub: klaviaturalar, siçanlar, taymerlər, şəbəkə kartları və əməliyyat sisteminin nüvəni güzəştə getməyən proqramdan geri ala bilməsi.

Bu bizi Aya qaytarır. Apollo Guidance Computer-in 1202 həyəcan siqnalı ən dibdə interrupt-larla idarə olunan bir planlayıcının, interrupt-ların növbəyə qoyduğu işlərin onları icra etmək üçün mövcud dövrələri aşdığını kəşf etməsi idi. Radarın yalançı siqnalları interrupt qaldırırdı; hər biri dövrə oğurlayırdı; executive yeni işlər üçün yerini tükətdi və `BAILOUT` adlı proseduru çağırdı, o isə aşağı prioritetli işləri ataraq vacib işləri yenidən başladırdı. Dörd dəqiqədə beş dəfə maşın kritik olmayan hər şeyi atdı və enişi uçurmağa davam etdi. Dövrə bir büdcədir və Hamilton-un komandası büdcə bitəndə nəyi kəsməli olduğunu bilən software yazmışdı.

</DeepDive>

<DeepDive>

#### Özünü yenidən yazan proqramlar {/*programs-that-rewrite-themselves*/}

Instruction-lar sadəcə yaddaşdakı byte-lar olduğuna və `STA` tipli instruction yaddaşa byte yaza bildiyinə görə, heç nə proqramın **öz instruction axınına yazmasına** mane olmur. İlk onilliklərdə bu, maraqlı bir hal deyil, standart təcrübə idi: Manchester Baby-nin nəsillərində index register yox idi, ona görə massivi gəzməyin yeganə yolu növbəti ünvanı hesablayıb onu icra etməzdən əvvəl *load instruction-ının operand sahəsinə yazmaq* idi. Özünü dəyişən kod ümumiyyətlə data üzərində döngü yazmağın yolu idi.

O, pis qocalıb və səbəbləri bu kursun öyrətdiyi hər şeyin turudur. Cache-lər instruction yaddaşının dəyişmədiyini fərz edir, ona görə onu dəyişmək bahalı invalidasiyalara məcbur edir. Pipeline-lar üstünü yazmaq üzrə olduğun instruction-ları artıq fetch edib. Bir neçə nüvə köhnəlmiş surətlər saxlaya bilər. Təhlükəsizlik siyasəti (`W^X`) indi həm yazıla bilən, həm də icra oluna bilən yaddaşı qadağan edir. Və yazdığın kod olmayan kodu debug etmək tam olaraq səsləndiyi qədər xoşagəlməzdir.

Amma fikir ölmədi — o, yuxarı mərtəbəyə köçdü və hörmətli bir ad aldı. **JIT compiler** — JavaScript mühərrikində, JVM-də və ya .NET runtime-da — işləmə zamanı yaddaşa təzə maşın kodu yazır, həmin yaddaşı yazıla biləndən icra oluna bilənə çevirir və oraya sıçrayır. Brauzerin bu səhifədəki kodla məhz bunu edir. Bu, üzərinə icazə mərasimi vintlənmiş özünü dəyişən koddur və o, yalnız stored-program prinsipinə görə mümkündür: processor üçün compiler-in output-u ilə fetch fazasının input-u eyni növ şeydir, yəni byte-lar.

</DeepDive>

## Dövrəni özün işlət {/*run-the-cycle-yourself*/}

Aşağıda geriyəsayma proqramı işlək maşın üzərindədir və bu dəfə onu **bir faza-bir faza** addımlaya bilərsən. Üçfazalı halqanın necə fırlandığına bax: fetch yanır və byte yaddaşdan IR-ə keçir, PC isə irəli təkan alır; decode byte-ı bölür və control siqnallarını qaldırır; execute data-nı hərəkət etdirir və instruction jump olanda onun əvəzinə PC-yə yazır.

Gözləməyə dəyən anlar 3 və 4 ünvanlarındadır. `Z` hələ 0 ikən `JZ`-dən yavaş-yavaş keç və `PCload`-un sönük qaldığına bax — jump fetch olunur, decode olunur və sonra *baş verməkdən imtina edir*. Sonra döngünü sıfıra qədər işlət və onun bir dəfə işə düşdüyü anı tut.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const PHASES = ['FETCH', 'DECODE', 'EXECUTE'];
const NAMES = {
  0: 'NOP', 1: 'LDA', 2: 'ADD', 3: 'SUB', 4: 'STA',
  5: 'LDI', 6: 'JMP', 8: 'JZ', 14: 'OUT', 15: 'HLT',
};
const INITIAL_MEM = [
  0x55, 0xE0, 0x3F, 0x86, 0x61, 0x00, 0xF0, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
];
const bin = (v) => v.toString(2).padStart(8, '0');

export default function CycleStepper() {
  const [mem, setMem] = useState(INITIAL_MEM);
  const [pc, setPc] = useState(0);
  const [ir, setIr] = useState(0);
  const [acc, setAcc] = useState(0);
  const [z, setZ] = useState(0);
  const [phase, setPhase] = useState(0);
  const [out, setOut] = useState([]);
  const [halted, setHalted] = useState(false);
  const [note, setNote] = useState('başlamaq üçün step-ə bas');
  const [count, setCount] = useState(0);

  const op = (ir >> 4) & 15;
  const arg = ir & 15;

  const reset = () => {
    setMem(INITIAL_MEM); setPc(0); setIr(0); setAcc(0); setZ(0);
    setPhase(0); setOut([]); setHalted(false); setCount(0);
    setNote('başlamaq üçün step-ə bas');
  };

  const stepPhase = () => {
    if (halted) return;
    if (phase === 0) {
      const fetched = mem[pc];
      setIr(fetched);
      setPc((pc + 1) & 15);
      setNote(`${pc} ünvanından ${bin(fetched)} fetch olundu; PC ${(pc + 1) & 15}-ə irəlilədi`);
      setPhase(1);
    } else if (phase === 1) {
      setNote(`opcode ${(ir >> 4) & 15} = ${NAMES[(ir >> 4) & 15] || '??'}, operand ${ir & 15}`);
      setPhase(2);
    } else {
      let msg = '';
      if (op === 5) { setAcc(arg); setZ(arg === 0 ? 1 : 0); msg = `A ← ${arg}`; }
      else if (op === 1) { setAcc(mem[arg]); setZ(mem[arg] === 0 ? 1 : 0); msg = `A ← memory[${arg}] = ${mem[arg]}`; }
      else if (op === 2) {
        const r = (acc + mem[arg]) & 255;
        setAcc(r); setZ(r === 0 ? 1 : 0); msg = `A ← ${acc} + ${mem[arg]} = ${r}`;
      } else if (op === 3) {
        const r = (acc - mem[arg]) & 255;
        setAcc(r); setZ(r === 0 ? 1 : 0); msg = `A ← ${acc} − ${mem[arg]} = ${r}, Z = ${r === 0 ? 1 : 0}`;
      } else if (op === 4) {
        const m = mem.slice(); m[arg] = acc; setMem(m); msg = `memory[${arg}] ← ${acc}`;
      } else if (op === 14) { setOut([...out, acc]); msg = `${acc} çap olundu`; }
      else if (op === 6) { setPc(arg); msg = `PCload = 1 → PC ← ${arg}`; }
      else if (op === 8) {
        if (z) { setPc(arg); msg = `Z 1-dir → PCload = 1 → PC ← ${arg}`; }
        else { msg = `Z 0-dır → PCload 0 qalır, jump baş vermir`; }
      } else if (op === 15) { setHalted(true); msg = 'HLT — dövrə burada dayanır'; }
      setNote(msg);
      setPhase(0);
      setCount(count + 1);
    }
  };

  const stepInstruction = () => {
    let guard = 0;
    // cari instruction-ı bitir, neçə faza qalırsa qalsın
    while (guard++ < 4) { stepPhase(); if (phase === 2) break; }
  };

  const pcLoad = phase === 2 && (op === 6 || (op === 8 && z));
  const signals = [
    ['MemRead', phase === 0 || (phase === 2 && [1, 2, 3].includes(op)) ? 1 : 0],
    ['IRload', phase === 0 ? 1 : 0],
    ['PCinc', phase === 0 ? 1 : 0],
    ['ALUop', phase === 2 && [2, 3].includes(op) ? 1 : 0],
    ['AccWrite', phase === 2 && [1, 2, 3, 5].includes(op) ? 1 : 0],
    ['PCload', pcLoad ? 1 : 0],
  ];

  const chip = (text, on, col = DNG) => (
    <span style={{
      fontFamily: 'monospace', fontSize: 12, padding: '3px 8px', margin: 2,
      borderRadius: 6, display: 'inline-block',
      border: `1px solid ${on ? col : '#888'}`,
      background: on ? `${col}1e` : 'transparent',
      color: on ? col : '#888',
    }}>{text}</span>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={stepPhase} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          bir faza addımla
        </button>
        <button onClick={stepInstruction} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          instruction-ı bitir
        </button>
        <button onClick={reset} style={{ fontSize: 15, padding: '4px 14px' }}>reset</button>
      </div>

      {/* üçfazalı halqa */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {PHASES.map((ph, i) => (
          <div key={ph} style={{
            flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9,
            border: `2px solid ${i === phase && !halted ? ACC : '#888'}`,
            background: i === phase && !halted ? `${ACC}1e` : 'transparent',
            color: i === phase && !halted ? ACC : '#888',
            fontWeight: i === phase && !halted ? 'bold' : 'normal',
          }}>{ph}</div>
        ))}
      </div>

      {/* yaddaş */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
        {mem.map((b, i) => {
          const here = i === pc && !halted;
          const isData = i === 15;
          return (
            <div key={i} style={{ textAlign: 'center', margin: 1, width: 62 }}>
              <div style={{ fontSize: 10, color: '#888' }}>{i}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 11, padding: '4px 2px',
                border: `2px solid ${here ? DNG : '#888'}`, borderRadius: 6,
                background: here ? `${DNG}22` : (isData ? `${ACC}12` : 'transparent'),
              }}>{bin(b)}</div>
              <div style={{ fontSize: 9, color: here ? DNG : '#888' }}>
                {isData ? 'data' : (NAMES[(b >> 4) & 15] || '')}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          PC = <b style={{ color: DNG }}>{pc}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          IR = <b>{bin(ir)}</b> ({NAMES[op] || '??'} {op === 14 || op === 15 ? '' : arg})
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          A = <b style={{ color: ACC }}>{acc}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          Z = <b style={{ color: z ? DNG : 'inherit' }}>{z}</b>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#888' }}>
          icra olunan instruction: {count}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 6 }}>control word</span>
        {signals.map(([n, on]) => chip(`${n}=${on}`, on, n === 'PCload' ? DNG : ACC))}
      </div>

      <div style={{
        padding: '8px 12px', borderRadius: 9, marginBottom: 8,
        border: `2px solid ${halted ? DNG : ACC}`,
        background: halted ? `${DNG}14` : `${ACC}14`,
      }}>
        <b style={{ color: halted ? DNG : ACC }}>{halted ? 'dayandı' : PHASES[phase]}</b>
        {' — '}{note}
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
        output: {out.length ? out.join('  ') : <span style={{ color: '#888' }}>(hələ heç nə)</span>}
      </div>
    </div>
  );
}
```

</Sandpack>

Hər şeyi bir dəfə addım-addım keç və gördüklərini say. İyirmi bir instruction, altmış üç faza, bir adder, PC üzərində bir multiplexer və nə vaxt dayanacağına qərar verən tək bir flag bit-i. Proqram işlədən kompüter budur — tam mexanizm, heç nə kənarda qoyulmadan və sehrin gizlənəcəyi heç bir yer olmadan.

<Recap>

- Processor əbədi olaraq düz bir iş görür: **fetch**, **decode**, **execute**, təkrar. Boş state yoxdur — "heç nə etməyən" maşın idle loop işlədir.
- **Fetch** PC-ni address bus-a qoyur, byte-ı IR-ə gətirir və **hələ heç kim instruction-a baxmamış PC-ni artırır**. Real jump offset-lərinin *növbəti* instruction-dan ölçülməsinin səbəbi həmin erkən artırmadır.
- **Decode** axtarışdır, hesablama deyil: opcode combinational logic tərəfindən yaradılmış sabit açar mövqeləri cədvəlində indeks rolunu oynayır.
- **Execute** data-nı hərəkət etdirir — ALU, yaddaş və ya register — və nəticəni clock edge-də təsdiqləyir, cavabla yanaşı həmişə **flag**-lər yaradır, kimsə istəsə də, istəməsə də.
- Bir instruction bir neçə clock təkanına (**T-state**) yayılır və müxtəlif instruction-lar kəskin fərqli sayda təkan çəkir. 3 GHz-lik CPU saniyədə 3 milyard instruction icra **etmir**; bu nisbət **CPI** adlanır.
- **Jump** PC-ni qidalandıran multiplexer üzərindəki bir əlavə input-dur və tək bir `PCload` teli ilə seçilir. Xüsusi goto mexanizmi yoxdur.
- **`if`** nəticəsi atılan və **`Z` flag**-i həmin multiplexer-i idarə edən çıxmadır. Müqayisə heç kimin saxlamadığı arifmetikadır.
- **Döngü yaddaşda obyekt deyil** — o, PC-nin zaman içində cızdığı mişar dişi formasıdır. Bu dərsin nümunəsində yeddi instruction iyirmi bir icra yaratdı və real x86 eyni şeyi `sub`-ın flag-ləri qurması və `jne`-nin signed nisbi offset vasitəsilə PC-yə yazması ilə edir (`75 f9` → −7 → başa qayıt).
- **Interrupt**-lar hardware-in soruşmadan etdiyi jump-lardır: PC-ni saxla, handler ünvanını yüklə, davam et. Maşınındakı hər cavabverici qurğu onlardan asılıdır — və Apollo 11-in 1202 həyəcan siqnalı dövrələri tükənən, interrupt-larla idarə olunan planlayıcı idi.

</Recap>

<Challenges>

#### İkişər-ikişər say {/*count-by-twos*/}

Dərsin geriyəsayma proqramını elə dəyiş ki, o, `10, 8, 6, 4, 2` çap etsin və sonra dayansın. Yalnız iki byte dəyişə bilərsən. Onların ünvanlarını, binary-də yeni dəyərlərini ver və döngünün niyə hələ də dayandığını izah et.

<Hint>

Ardıcıllığı iki şey müəyyən edir: accumulator-un başladığı dəyər və döngünün hər dövrədə çıxdığı sabit. Hər ikisi yaddaşda oturan tək byte-lardır.

</Hint>

<Solution>

İki byte dəyişir:

```
 ünvan    köhnə       yeni        mənası
 ───────  ────────    ────────    ──────────────────────
    0     01010101    01011010    LDI 10   (opcode 0101, operand 1010)
   15     00000001    00000010    data sabiti 2 olur
```

Döngü hələ də dayanır, çünki 10 2-nin dəqiq mislidir, ona görə təkrar çıxma düz sıfıra düşür və `Z` flag-i işə düşür:

```
 10 → 8 → 6 → 4 → 2 → 0 ✓   Z = 1, JZ branch-i götürür, HLT
```

Bax burada fikir verməyə dəyən tələ var. Başlanğıc dəyəri 10 əvəzinə **9** et və proqram heç vaxt dayanmaz: accumulator 9, 7, 5, 3, 1 addımlayır, sonra −1 olur ki, bu da səkkiz bitlik two's complement-də 255-dir və o, heç vaxt dəqiq sıfıra dəymədən bütün diapazonu dolanıb gedir. Döngü `Z`-ni yoxlayır, bu isə "sıfıra bərabər" deməkdir, "sıfırdan kiçik və ya bərabər" yox — və döngü şərti kimi `!=` ilə `<=` arasındakı bu fərq real software-də dəfələrlə buraxılmış real bug-dır. Gözlənilməz başlanğıc dəyərindən sağ çıxan döngü istəyirsənsə, bərabərliyi yox, işarəni və ya carry-ni yoxla.

</Solution>

#### Real jump-ı nişan al {/*aim-a-real-jump*/}

x86-64-də `jne`-nin qısa forması iki byte-dır: `75` opcode-u və ardınca **signed 8-bitlik nisbi offset**. `jne` `0x2A` ünvanında oturur və geriyə, `0x1C`-yə sıçramalıdır. Offset byte-ını hesabla, tam instruction-ın iki byte-ını ver və bu formanın ifadə edə biləcəyi ən böyük geriyə sıçrayışı de.

<Solution>

Offset **növbəti** instruction-ın ünvanından ölçülür, çünki PC fetch zamanı artırılıb:

```
 jne 0x2A və 0x2B-ni tutur, deməli fetch-dən sonra PC 0x2C saxlayır

 offset = hədəf − (instruction-dan sonrakı ünvan)
        = 0x1C − 0x2C
        = 28 − 44
        = −16

 −16 signed byte kimi:  16 = 00010000
                        çevir → 11101111
                        +1    → 11110000 = 0xF0
```

Tam instruction **`75 f0`**-dır.

Bu formanın çatdığı məsafə signed byte-ın diapazonudur və Modul 0.1 onu −128 ilə +127 arası kimi müəyyən etmişdi: ən uzaq geriyə sıçrayış sonrakı instruction-dan **128 byte** əvvəldir. Bu, çox deyil və elə buna görə assembler-lər və linker-lər məsafədən asılı olaraq qısa jump ilə daha uzun kodlama arasında seçim etməli olurlar — və elə buna görə hədəfi cəmi 3 byte uzağa itələyən kiçik bir redaktə faylın başqa yerindəki instruction-ın ölçüsünü səssizcə dəyişə bilər.

Baş verəni qiymətləndirməyə dəyər: bu suala cavab vermək üçün fetch fazasının erkən artırmasından, two's complement mənfiyə çevirməsindən və signed diapazon hədlərindən istifadə etdin — üç fərqli moduldan üç dərs, hamısı iki byte-ın içində.

</Solution>

#### Soyumayan nüvə {/*the-core-that-will-not-cool-down*/}

Köçürmə tapşırığı. Komanda yoldaşın problem bildirir: *"Sensor oxuyan servisimiz heç bir sensor data-sı gəlmədikdə belə bir CPU nüvəsini 100%-də saxlayır. Profiler deyir ki, vaxtın demək olar ki, hamısı `waitForData()`-nın içindədir. Funksiyanı qısaltmağı artıq sınadıq, heç nə dəyişmədi. Noutbukun ventilyatorları dayanmadan işləyir və batareya ömrü iki dəfə azalıb."* Funksiya belə görünür:

```
 while (dataReady == 0) {
     // heç nə
 }
 processData();
```

CPU-nun əslində nə etdiyini izah et, funksiyanı qısaltmağın niyə heç nəyi dəyişmədiyini de və tövsiyəni yaz.

<Solution>

**CPU nə edir:** heç nə hesablamayan bir döngü üzərində fetch–decode–execute dövrəsini tam sürətlə, əbədi işlədir. Hər dövrədə `dataReady`-nin yüklənməsini fetch edir, decode edir, execute edir, yoxlayır və geri sıçrayır — bir neçə instruction, saniyədə milyardlarla dəfə. Bu, **polling**-dir və processor-un gözü ilə faydalı işdən seçilmir: dövrənin "mənasız" instruction anlayışı yoxdur. Nüvə 100%-dədir, çünki o, həqiqətən 100% məşğuldur, və tam güc çəkir, çünki CMOS dərsinə görə transistor-lar enerjini **keçid edəndə** yandırır — bunlar isə clock-un imkan verdiyi qədər sürətlə keçid edir.

**Funksiyanı qısaltmaq niyə heç nəyi dəyişmədi:** xərc döngü gövdəsinin ölçüsü deyil, döngünün fasiləsiz işləməsidir. Gövdəni qısaltmaq hər iterasiyanı sürətləndirir, bu isə saniyəyə *daha çox* iterasiya deməkdir, daha az yox. Busy-wait-i optimallaşdırmaq onun enerjini daha səmərəli yandırmasına gətirir.

**Tövsiyə:** *"Bu, busy-wait-dir, ona görə nüvə görəcək işi olmadan fetch–decode–execute dövrəsində fırlanır. Həll soruşmağı dayandırmaq və hardware-in bizə deməsinə icazə verməkdir: flag-i poll etmək əvəzinə interrupt-la idarə olunan yolda blok ol. Platformadan asılı olaraq bu, sensorun interrupt handler-inin siqnal verdiyi condition variable / semaphore-u gözləmək, qurğunun file descriptor-u üzərində `epoll`/`select` tipli gözləmə, ya da blocking read deməkdir — hər halda OS thread-imizi cədvəldən çıxarır, nüvə başqa işlər üçün azad olur və ya aşağı güc vəziyyətinə keçə bilir, biz isə data həqiqətən gələndə oyandırılırıq. Nədənsə poll etmək məcburiyyətindəyiksə (çox qısa, proqnozlaşdırıla bilən gözləmələr), ən azı döngünün içinə sleep və ya CPU pause/yield instruction-ı əlavə edək ki, mövcud hər dövrəni yeməyək."*

Ümumi prinsip və interrupt-ların ümumiyyətlə mövcud olma səbəbi: **dövrə saniyədə sabit bir iş büdcəsidir və processor onu xərcləməklə israf etmək arasındakı fərqi görə bilmir.** Hansı işin dövrəyə layiq olduğuna qərar vermək hardware-in işi deyil — heç vaxt olmayıb. Apollo 11-in kompüteri eyni şeyi 30,000 futda kəşf etdi və yalnız kiminsə qabaqcadan nəyi atmalı olduğunu yazdığına görə sağ çıxdı. ✓

</Solution>

</Challenges>

<LearnMore title="Instruction Set Architecture" path="/learn/faza-0/modul-0-3/instruction-set-architecture">

Bu dərsdəki hər instruction həmin an üçün uydurulmuşdu: dörd bit opcode, dörd bit operand, çünki belə rahat idi. Real processor-lar bu seçimləri bir dəfə edir və sonra onilliklərlə onlarla yaşayır, çünki kodlama nə vaxtsa kod kompilyasiya edəcək hər kəslə nə vaxtsa onu işlədəcək hər çip arasındakı müqavilədir. Növbəti dərs: **instruction set** əslində nə vəd edir, x86 instruction-ları niyə on beş byte uzunluğunda ola bilir, halbuki ARM-ınkı həmişə dörddür, və 1978-ci ildə neçə register adlandırmaq barədə verilmiş qərar masanın üstündəki maşını bu gün necə formalaşdırmağa davam edir.

</LearnMore>