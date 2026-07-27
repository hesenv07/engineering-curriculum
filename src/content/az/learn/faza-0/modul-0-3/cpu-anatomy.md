---
title: "CPU-nun Anatomiyası"
---

<Intro>

1945-ci ildə ENIAC-ı proqramlaşdırmaq üçün onun yanına vintaçanla gedirdin. Maşın bütöv bir otağı doldururdu və "software yazmaq" onu fiziki olaraq yenidən naqilləmək demək idi — bloklar arasına patch kabelləri taxmaq, üç min açarı əllə qurmaq, bir ədədin hardware-dən keçəcəyi yolu izləmək. Bu işi altı riyaziyyatçıdan ibarət komanda görürdü — Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Fran Bilas və Ruth Lichterman — və məsələni bir dəfə dəyişmək günlər çəkə bilərdi. Maşın hər şeyi hesablaya bilərdi; sadəcə fikrini hər dəyişəndə onu *yenidən qurmaq* lazım gəlirdi. Sonra, 1945-ci ilin iyununda, fərqli bir düzülüşü təsvir edən bir hesabat əldən-ələ gəzməyə başladı: proqramı maşına naqilləmə — **onu ədədlər şəklində, elə data-nın yanına, yaddaşa yaz.** Üç il sonra, 21 iyun 1948-ci ildə, Manchester-dəki kiçik təcrübi maşın 262,144-ün ən böyük xüsusi bölənini axtaran 17 instruction-luq proqramı işə saldı, 52 dəqiqə fikirləşdi və 131,072 çap etdi. Bu, kompüterin ilk dəfə öz yaddaşında saxlanmış proqramı icra etməsi idi və noutbukunun nə etdiyini kabel yox, fayl köçürməklə dəyişə bilməyinin səbəbi məhz budur. Bu dərs həmin fikrin yaratdığı maşını açır və içindəki hər hissəni adlandırır.

</Intro>

<YouWillLearn>

- **Stored-program** fikrini və CPU-nun instruction-ı ədəddən ayıra bilməməsi kimi narahat edici faktı
- Hər processor-da olan beş hissəni: **register**-lər, **ALU**, **program counter**, **instruction register** və **control unit**
- **Register file**-ın nə olduğunu, niyə iki read port-u və bir write port-u olduğunu və register-lərin niyə bu qədər az olduğunu
- Hissələrin **datapath**-a necə qoşulduğunu və **multiplexer**-lərin bir dəst tel-ə çoxlu iş görməyə necə imkan verdiyini
- **Control signal**-ın əslində nə olduğunu — və bir instruction-ın necə bir ovuc açar mövqeyinə çevrildiyini
- Register-in niyə ~1 dövrə, əsas yaddaşın isə ~200 dövrə olduğunu və bu fərqin yazdığın hər proqrama nə etdiyini

</YouWillLearn>

## Kompüteri universal edən fikir {/*the-idea-that-made-a-computer-general*/}

ENIAC-ın problemi sürət deyildi. Problem *proqramın naqillərdə yaşaması* idi, ona görə proqramı dəyişmək maşını dəyişmək demək idi. 1945-ci ilin iyununda yazılmış *First Draft of a Report on the EDVAC*-da təsvir olunan həll bu gün o qədər tanışdır ki, qəribəliyi tamamilə silinib: instruction-ları data ilə eyni yaddaşa qoy və eyni şəkildə — ədədlər kimi — kodla.

(Hesabat yalnız John von Neumann-ın adı ilə çıxdı, elə buna görə də bu düzülüş hər yerdə **von Neumann arxitekturası** adlanır. Bu fikirləri onunla birlikdə inkişaf etdirən J. Presper Eckert və John Mauchly bundan razı qalmadılar və müəlliflik mübahisəsi heç vaxt tam həll olunmadı. Ad isə yenə də yapışıb qaldı.)

Bunun əslində nə demək olduğu üzərində bir az dayan, çünki bu, bu moduldakı ən vacib fikirdir və az qala hoqqabazlıq kimi səslənir:

<Diagram name="cpu-anatomy/stored_program_memory" height={470} width={720} alt="Sxem, başlıq: 'bir yaddaş və içində heç nə etiketlənməyib'. Solda altı yaddaş xanasından ibarət şaquli sütun, sol tərəflərində aşağı doğru 00-dan 05-ə qədər ünvanlar, hər xanada səkkiz bitlik binary dəyər: 00011011, 01000110, 11101100, 00000101, 10010110, 00000000. PC yazılmış qırmızı ox birinci xanaya göstərir, qeyddə yazılır: CPU bura baxır. Sağda həmin birinci xanadan iki panel ayrılır. Yuxarıdakı mavi panelin başlığı 'instruction kimi oxu' və byte-ı 00 01 10 11 şəklində bölünmüş göstərir, altında op, rd, rs1, rs2 sahə adları var və bu, ADD R1, R2, R3 mətninə çevrilir. Aşağıdakı qırmızı panelin başlığı 'ədəd kimi oxu' və 00011011 = 27 göstərir, qeyddə yazılır: 'sadəcə bir byte, hər hansı digəri kimi'. Aşağıdakı altyazılar: byte dəyişmir, yalnız CPU-nun hansı hissəsinin ona baxdığı dəyişir; instruction xüsusi bir data növü deyil, sadəcə PC-nin təsadüfən göstərdiyi data-dır; və mavi rəngdə: byte-ların mənası yoxdur — müqavilələrin var.">

Eyni səkkiz bit, iki fərqli oxunuş altında. Heç bir oxunuş digərindən daha "düzgün" deyil — byte gizlicə instruction deyil.

</Diagram>

Son altyazı sənə tanış gəlirsə, bu, təbiidir: o, bütün bu kursun Dərs 1-idir və mümkün olan ən dərin yerə gəlib çatıb. **Byte-ların mənası yoxdur — müqavilələrin var.** Biz bu qaydanı tam ədədlərə, mənfilərə, kəsrlərə, mətnə, piksellərə tətbiq etmişik. İndi onu proqramın özünə tətbiq et və stored-program kompüterini alarsan: instruction sadəcə maşın görəcək iş axtaranda **program counter**-in təsadüfən göstərdiyi byte-dır.

Bundan dərhal üç nəticə çıxır və üçü də müasir hesablamanı müəyyən edir:

- **Proqramlar data-dır, deməli proqramları proqramlar emal edə bilər.** Compiler sadəcə byte oxuyub başqa byte-lar yazan software-dir; output-un icra oluna bilən olması onu hara qoymağından asılıdır. Loader-lər, linker-lər, JIT compiler-lər, özünü dəyişən kod və viruslar — hamısı bunun açdığı məkanda yaşayır.
- **Proqramı dəyişmək pulsuzdur.** Nə vintaçan, nə kabel. Yaddaşa fərqli ədədlər köçür və eyni hardware fərqli maşına çevrilsin.
- **Maşının nə etdiyindən xəbəri yoxdur.** O, sənin diqqətlə kompilyasiya etdiyin funksiyanı JPEG-dən ayıra bilmir. Program counter şəkil data-sını göstərməyə başlasa, CPU məmnuniyyətlə pikselləri instruction kimi dekod edib icra edəcək. Buna qayıdacağıq, çünki bu, həm super güc, həm də bütöv bir təhlükəsizlik fəlakəti kateqoriyasıdır.

## Qutunu açmaq {/*opening-the-box*/}

Deməli, bizə elə bir maşın lazımdır ki, yaddaşdan ədədləri gətirsin, onları əmr kimi şərh etsin və dediklərini etsin. Onun içində nə olmalıdır?

<Diagram name="cpu-anatomy/cpu_block_diagram" height={460} width={720} alt="Blok sxemi, başlıq: 'qutunun içindəki hər şey'. CPU yazılmış böyük yumru künclü düzbucaqlının içində beş komponent var. Yuxarı solda 'control unit' yazılmış qırmızı çalarlı qutu, qeyddə: 'instruction-ı oxuyur, hər açarı qurur'. Yuxarı sağda PC və IR yazılmış iki kiçik boz qutu, qeydlərdə: 'harada olduğumuz' və 'nə etdiyimiz'. Aşağı solda 'register file' yazılmış mavi çalarlı qutu, içində R0 R1 R2 R3 və qeyddə: 'keçən dərsdəki flip-flop-lar'. Aşağı mərkəzdə ALU yazılmış mavi kəsikli ox forması, qeyddə: 'bunu iki dərs əvvəl özün qurdun'. Onun altında kiçik boz qutuda 'flags Z N C V' yazılıb. Control unit-dən aşağıya, register file və ALU-ya 'control lines' yazılmış kəsik qırmızı oxlar gedir. Register file-dan ALU-ya mavi oxlar gedir, ALU output-undan isə register file-a qayıdan mavi ox dolanır, üzərində 'nəticə geri yazılır'. CPU-nun sağında, kənarda 'memory' yazılmış hündür boz qutu dayanır, içində nöqtə sıraları var, qeyddə: 'instruction-lar və data, yan-yana'. CPU ilə memory-ni iki ox birləşdirir: sağa gedən 'address', sola gedən 'data'. Altyazılar: beş hissə, bir dəstə control tel-i və xarici dünyaya iki bus; processor budur — hamısı.">

İndiyə qədər qurulmuş hər processor — 1971-ci il Intel 4004, telefonundakı çip, paltaryuyandakı — bu şəklin bir variasiyasıdır.

</Diagram>

Beş hissə və onlardan ikisini artıq qurmusan:

| Hissə | Nədir | Haradan gəldi |
|---|---|---|
| **Register file** | bir ovuc çox sürətli yaddaş yuvası | flip-flop-lar, keçən dərs |
| **ALU** | toplayan, çıxan və logic edən blok | adder-i iki dərs əvvəl qurdun |
| **Program counter (PC)** | növbəti instruction-ın ünvanını saxlayan register | sadəcə bir register |
| **Instruction register (IR)** | hazırda üzərində işlənən instruction-ı saxlayan register | sadəcə bir register |
| **Control unit** | IR-i oxuyur və maşındakı hər açarı ona uyğun qurur | həqiqətən yeni olan hissə |

Üstəgəl tellər. Hissələr arasında data daşıyan dəstələr **bus** adlanır — yaddaşa gedən address bus ("mənə 4,096-cı yerdəkini ver") və dəyərləri o yan-bu yana daşıyan data bus. Və hər yerdə, sxemlərdə əsasən görünməyən halda, keçən dərsin clock-u işləyir və hər register-ə nə vaxt tutacağını deyir.

Gəl hissələri bir-bir götürək.

## Register file {/*the-register-file*/}

**Register** bir dəyər saxlayan flip-flop sırasıdır — kiçik mikrokontrollerdə 8 bit, noutbukunda 64 bit. **Register file** isə onların yığımıdır və CPU-nun öz şəxsi qaralama dəftəridir: tam sürətlə toxuna bildiyi yeganə yaddaş.

<Diagram name="cpu-anatomy/register_file" height={380} width={720} alt="Sxem, başlıq: 'register file: çox kiçik, çox sürətli sənəd şkafı'. Böyük mavi çalarlı yumru künclü qutunun içində R0, R1, R2 və R3 adlı dörd sətir var, hər birində səkkiz binary rəqəm göstərilib. Solda 'read port 1' və 'read port 2' yazılmış iki mavi ox qutudan sola çıxır, hər biri qutuya daxil olan və 'hansı register?' yazılmış boz oxla cütləşib. Aşağıda 'write port' yazılmış qırmızı ox qutuya daxil olur, sağdan isə 'write enable' yazılmış kəsik qırmızı ox girir. Sağda qutudan mavi ox çıxır və 'iki dəyər çölə' və 'eyni anda' yazılarına gedir. Aşağıdakı altyazılar: hər tək dövrədə iki oxuma və bir yazma — R1 = R2 + R3-ə tam olaraq lazım olan da elə budur; və: hər register sadəcə sıra ilə dayanmış 8, 32 və ya 64 flip-flop-dur.">

İki dəyər çölə, bir dəyər içəri, hamısı eyni dövrədə. Kiçik boz oxlar register *nömrələridir* — file-a hansı yuvaları açacağı deyilməlidir.

</Diagram>

Port sayına fikir ver, çünki o, özbaşına deyil. Adi bir instruction-ın formasına bax:

```
 R1 = R2 + R3
      └┬┘  └┬┘     iki dəyər çölə çıxmalıdır
   └┬┘              bir dəyər içəri girməlidir
```

Hər dövrədə eyni anda iki oxuma və bir yazma. Ona görə hardware məhz bunu təmin edir: **iki read port və bir write port**, hər biri *hansı* register olduğunu soruşan öz kiçik address input-u ilə. Dörd register-lə həmin ünvanlar 2 bit-dir; 32 register-lə 5 bit.

Bu isə aydın sualı doğurur: register-lər maşındakı ən sürətli yaddaşdırsa, niyə bu qədər azdırlar? Tipik CPU-da 16 və ya 32 dənə olur — halbuki eyni silikona milyonlarla flip-flop yerləşdirmək olardı. Üç səbəb var və onları başa düşməyə dəyər, çünki CPU-ların niyə belə göründüyünü çox izah edirlər:

- **Port-lar bahalıdır.** Hər əlavə read port hər register-ə çatan daha bir tam dəst tel və multiplexer deməkdir. Xərc register sayından xeyli sürətli artır.
- **Böyük olan yavaşdır.** Daha böyük file daha dərin address dekodlanması və daha uzun daxili tellər tələb edir və — keçən dərsdən — ən yavaş yol bütün çip üçün clock-u müəyyən edir. Bir yerinə iki dövrə çəkən register file hər şeyi yavaşladardı.
- **Register nömrəsi instruction-ın içində yaşayır.** Əsas məhdudiyyət budur. Instruction 32 bit-dirsə və üç register adlandırmalıdırsa, onda 32 register hər biri üçün 5 bit-ə başa gəlir — hər instruction-ın on beş bit-i *yalnız hansı register-lərin istifadə olunacağına* sərf olunur. 64 register-ə ikiqat artırmaq daha üç bit tələb edir və onlar haradansa çıxmalıdır. Register sayı instruction kodlamasına həkk olunmuş daimi qərardır və onu dəyişmək yeni arxitektura dizayn etmək deməkdir.

<Note>

Bu, Faza 0-ın qalanına hakim olacaq mövzunun ilk görünüşüdür: **instruction kodlaması bir büdcədir** və processor-un ifadə edə bildiyi hər şey onun içinə sığmalıdır. Neçə register, nə boyda sabit, sıçrayışın nə qədər uzağa çata bilməsi — bunların hamısı dizaynerlərin neçə bit xərcləməyə razı olduğuna görə həll olunur. Həmin büdcənin adı var, **Instruction Set Architecture**, və buradan iki dayanacaq sonra öz dərsini alır.

</Note>

## ALU-ya yenidən baxış {/*the-alu-revisited*/}

Bunu Modul 0.2-də qurmusan. **Arithmetic logic unit** iki dəyər götürür, onların üzərində bir əməliyyat yerinə yetirir və nəticə ilə birlikdə bir dəst flag verir. İki dərs əvvəl o, toplaya və çıxa bilirdi; real ALU bir neçə logic əməliyyatı da əlavə edir və bunlar demək olar ki, heç nəyə başa gəlmir, çünki gate-lər onsuz da səndədir:

| Əməliyyat | Necə qurulub |
|---|---|
| ADD, SUB | ripple-carry (və ya lookahead) adder, çıxma üçün mode teli ilə |
| AND, OR, XOR, NOT | bit başına bir gate, paralel — 8-bit AND üçün 8 gate |
| shift-lər | hərfi mənada tellər: bir mövqe sola sürüşdürmək *i* bit-ini *i+1* output-una qoşmaqdır |

Sonuncu sətrə bir də baxmağa dəyər. Sadə halda shift-ə **ümumiyyətlə gate lazım deyil** — o, hansı telin hara getdiyinin yenidən düzülməsidir; elə buna görə shift ənənəvi olaraq CPU-nun ən ucuz əməliyyatıdır və elə buna görə compiler-lər imkan olanda `x * 8`-i `x << 3`-ə çevirirlər.

ALU həm də adder dərsində tanış olduğun **flag**-ləri yaradır: `Z` (nəticə sıfır idi), `N` (mənfi — sadəcə yuxarı bit-in surəti), `C` (carry out, unsigned overflow) və `V` ya da `O` (signed overflow, son iki carry-nin XOR-u). Flag-lər öz kiçik register-lərində yaşayır və müqayisənin qərara çevrilməsi məhz onların vasitəsilə baş verir: CPU iki ədədi *bir-birindən çıxmaqla* müqayisə edir, nəticəni atır və yalnız flag-ləri saxlayır.

## Datapath {/*the-datapath*/}

İndi hissələri bir-birinə qoş. Nəticə **datapath** adlanır və burada blok sxeminin gizlətdiyi bir incəlik üzə çıxır: tellər sabitdir, amma maşın fərqli dövrələrdə fərqli işlər görməlidir. Bəzən ALU-nun ikinci input-u register-dən gəlməlidir; bəzən isə instruction-ın içinə yerləşdirilmiş sabitdən. Bir dəst tel hər ikisinə necə xidmət edir?

**Multiplexer** ilə — gate-lərdən qurulmuş, bir neçə input, bir *select* siqnalı götürən və düz bir input-u output-una ötürən açar. Mux hardware üçün nədirsə, `if` software üçün odur və o, hər yerdədir:

<Diagram name="cpu-anatomy/datapath_mux" height={400} width={720} alt="Sxem, başlıq: 'datapath: yollar və yolu seçən açarlar'. Solda 'register file' yazılmış mavi çalarlı qutu, içində R0 R1 R2 R3. Ondan iki mavi ox çıxır: R1 yazılmış biri birbaşa sağdakı kəsikli ALU formasının yuxarı input-una gedir, R2 yazılmış digəri isə 'mux' yazılmış kiçik qırmızı trapesiyanın yuxarı input-una girir. Mux-un ikinci input-u aşağıdan gəlir, üzərində 'constant' yazısı. Mux-un altına 'hansı biri?' yazılmış kəsik qırmızı ox yuxarı göstərir. Mux-un output-u ALU-nun aşağı input-unu qidalandırır. ALU-nun içinə 'hansı əməliyyat?' yazılmış kəsik qırmızı ox yuxarı göstərir. ALU output-u sağa gedir, sonra aşağı dolanır və tamamilə sola, register file-a qayıdır, üzərində 'nəticə' və 'register-ə geri yazılır' yazıları var. Altyazılar: tellər heç vaxt tərpənmir — hansı dəyərin hansı yoldan keçəcəyinə multiplexer-lər qərar verir; və qırmızı rəngdə: hər kəsik qırmızı xətt control unit-in verdiyi bir qərardır.">

Mavi xətlər dəyər daşıyır; kəsik qırmızı xətlər qərar daşıyır. Bir instruction-dan digərinə yalnız qırmızılar dəyişir.

</Diagram>

Bir instruction-ı onun içindən izlə. `R1 = R2 + R3` üçün: register file-a R2 və R3-ü iki output port-una oxumaq deyilir; mux-a sabiti yox, register dəyərini seçmək deyilir; ALU-ya toplamaq deyilir; register file-a clock təkanı gələndə öz input-unu R1-ə yazmaq deyilir. Dörd qərar, ümumiyyətlə data daşımayan dörd dəst tel tərəfindən verilib.

Həmin tellər bu bölmənin əsas fikridir. Hardware-də **data sabit yollarla axır, hansı yolların açıq olduğuna isə control qərar verir.** Datapath yol şəbəkəsidir; o heç vaxt dəyişmir. Hər tək dövrədə dəyişən şey isə onun üzərinə sərilən açar mövqeləri naxışıdır.

## Control unit {/*the-control-unit*/}

Bu bizi software ekvivalenti olmayan və buna görə də təsəvvür etməsi ən çətin olan hissəyə gətirir. **Control unit** IR-də oturan instruction-ı oxuyur və açar mövqelərini yaradır — birlikdə **control word** adlanan tel dəstəsi.

<Diagram name="cpu-anatomy/control_word" height={400} width={720} alt="Sxem, başlıq: 'bir instruction içəri, bir ovuc açar mövqeyi çölə'. Yuxarıda solda IR yazılmış dörd qutudan ibarət sıra, içlərində 00, 01, 10 və 11 bit cütləri, altlarında op, rd, rs1 və rs2 sahə adları; sıranın altında ADD R1, R2, R3 mətni var. Aşağı ox 'control unit' yazılmış qırmızı çalarlı qutuya aparır. Həmin qutudan altı kəsik xətt iki sırada düzülmüş altı siqnal qutusuna açılır: RegRead1 = 10, RegRead2 = 11, ALUop = ADD, UseConstant = 0, RegWrite = 1 və WriteAddr = 01. Qutulardan beşi aktiv kimi qırmızı ilə vurğulanıb; UseConstant qutusu qeyri-aktiv kimi bozardılıb. Altyazı: bu tellər data deyil — onlar data-nı istiqamətləndirən lingələrdir.">

Bir byte control unit-ə daxil olur; altı açar mövqeyi ondan çıxır. Dekodlamanın bütün işi budur.

</Diagram>

Həmin sxemdəki altı siqnalı oxu və bir şeyə fikir ver: onların heç birində *dəyər* yoxdur. `RegWrite = 1` heç yerdə bir ədədinin saxlanması demək deyil; o deməkdir ki, "write port hazır vəziyyətdədir, deməli növbəti clock edge-də register file input-unda nə varsa onu tutmalıdır." Control siqnalları isimlər deyil, fellərdir.

Və bax burada xoş hissə gəlir. Control unit *nədən* qurulub? O, instruction bit-lərini input kimi götürür və control bit-lərini output kimi verir, uyğunlaşdırma isə sabitdir — eyni opcode həmişə eyni açar mövqelərini yaradır. Bu, truth table-dır. Deməli, control unit **combinational logic**-dir: bir yığın AND və OR gate, tam olaraq Modul 0.2-nin ilk dərsindəkilər kimi.

```
 opcode 00 (ADD)  →  ALUop=00, RegWrite=1, UseConstant=0
 opcode 01 (SUB)  →  ALUop=01, RegWrite=1, UseConstant=0
 opcode 10 (AND)  →  ALUop=10, RegWrite=1, UseConstant=0
 opcode 11 (OR)   →  ALUop=11, RegWrite=1, UseConstant=0

 dörd sətir və dizayner gate-ləri birbaşa cədvəldən oxuya bilər ✓
```

Bu boyda maşın üçün control unit həqiqətən bir ovuc gate-dir. Real processor-ların yüzlərlə instruction-ı və onlarla bit enində control word-ları var və onları qurmağın iki yolu var: **hardwired control** (böyük combinational logic bloku, sürətli, dəyişməsi çətin) və ya **microcoded control** (CPU-nun içində hər instruction üçün control word saxlayan kiçik lookup yaddaşı, daha yavaş, amma düzəltməsi və genişləndirməsi xeyli asan). Əksər masaüstü kompüterlərdəki x86 processor-lar daha mürəkkəb instruction-ları üçün microcode istifadə edir — elə buna görə CPU əməliyyat sistemindən "microcode update" ala bilir: maşının öz dekodlama cədvəllərinə fayl şəklində göndərilən əsl yamaq.

## Register-lər ümumiyyətlə niyə var {/*why-registers-exist-at-all*/}

Blok sxemindən bəri bir sual havada asılı qalıb: yaddaş elə oradadırsa, CPU niyə öz kiçik dəyər ehtiyatını saxlayır? Çünki "elə orada" ifadəsi yalandır. Yaddaş processor üçün əhəmiyyət daşıyan yeganə vahiddə — clock dövrələrində — *nəhəng* dərəcədə uzaqdadır.

<Diagram name="cpu-anatomy/memory_speed_ladder" height={420} width={720} alt="Üfüqi zolaq diaqramı, başlıq: 'register-lər niyə var', alt başlıq: '3 GHz-də bir CPU dövrəsi 0.33 ns-dir — indi onu elə miqyaslandır ki, register bir saniyə çəksin'. Yeddi sətir, hər birində solda etiket, siyahı boyunca uzanan rəngli zolaq, ortada dövrə sayı və sağda insan miqyasında vaxt var. Sətirlər belədir: register, 1 dövrə, 1 saniyə; L1 cache, 4 dövrə, 4 saniyə; L2 cache, 12 dövrə, 12 saniyə; L3 cache, 40 dövrə, 40 saniyə; əsas yaddaş, təxminən 200 dövrə, 3 dəqiqə; SSD, təxminən 300,000 dövrə, 3.5 gün; sərt diskdə axtarış, təxminən 30,000,000 dövrə, təxminən bir il. İlk dörd zolaq mavi və qısadır, son üçü qırmızı və uzundur. Altyazı: register kiçik bir optimallaşdırma deyil — o, yaddaşdan tamamilə fərqli bir dünyadır.">

Hər sətir eyni gözləməni iki dəfə verir: CPU dövrələri ilə və sonra insanın həqiqətən hiss edə biləcəyi vahidlə.

</Diagram>

Onu insan vaxtına miqyaslandır və mənzərə fiziki olaraq hiss olunur. Register-ə uzanmaq **bir saniyə** çəksəydi, əsas yaddaşa uzanmaq **üç dəqiqə**, fırlanan sərt diski gözləmək isə **ilin böyük hissəsi** çəkərdi. Hər operand üçün yaddaşa getməli olan processor faktiki olaraq bütün ömrünü gözləməklə keçirərdi.

Ona görə hər CPU-nun bağladığı sövdələşmə belədir: **bir neçə dəyəri register-lərə yüklə, mümkün qədər çox işi orada gör və nəticələri geri yaz.** Elə buna görə maşın kodu load və store-larla doludur, elə buna görə compiler-lər "register allocation" üzərində bu qədər çox işləyir və elə buna görə eyni alqoritm işçi dəstinin sürətli yaddaşa sığıb-sığmamasından asılı olaraq on dəfə sürətli və ya yavaş işləyə bilir.

Həmin ortadakı sətirlər — L1, L2, L3 — **cache**-dir, hardware-in bu fərqi gizlətmək üçün avtomatik cəhdi. Onların bu modulda daha sonra öz dərsi var. Hələlik pilləkəni yadda saxla: o, proqram məhsuldarlığı haqqında düşünmək üçün ən faydalı zehni modeldir və real dünyadakı yavaşlığı bu kursdakı hər hansı digər faktdan daha çox izah edir.

<Pitfall>

**"Proqramlar data-dır" ifadəsi hər iki tərəfə kəsir.**

Səhv stored-program xassəsini sırf rahatlıq kimi qəbul etməkdir. O həm də bütöv bir təhlükəsizlik zəifliyi kateqoriyasının mövcud olma səbəbidir və mexanizm birinci sxemdəkinin eynisidir: CPU program counter nəyi göstərirsə onu icra edir və həmin byte-ların kod olmaq üçün nəzərdə tutulub-tutulmadığını soruşmaq imkanı yoxdur.

Proqrama buffer-in tutduğundan çox data ver və artıq hissə yanında oturan saxlanmış geri-qayıtma ünvanının üstünü yaza bilər. Funksiya geri qayıdanda program counter-ə hücumçunun seçdiyi dəyər yüklənir — çox vaxt düz hücumçunun indicə verdiyi data-nın içinə göstərən dəyər. CPU vəzifəsinə sadiq şəkildə həmin data-nı instruction kimi dekod edib icra edir. Heç nə nasazlıq vermədi; hər hissə öz işini mükəmməl gördü. Bu, klassik **buffer overflow**-dur və o ona görə işlədi ki, instruction-lar və data onları bir-birindən ayıran heç bir etiket olmadan bir yaddaşda yaşayır.

Düzəliş saf von Neumann modelinin *kənarından* gəlməli oldu. Müasir sistemlər yaddaş səhifələrini ya yazıla bilən, ya da icra oluna bilən kimi işarələyir, amma heç vaxt hər ikisi kimi yox — bu siyasət **W^X** adlanır və səhifə cədvəllərindəki hardware **NX ("no execute") bit**-i ilə tətbiq olunur. Bu, faktiki olaraq əlli il sonra yaddaşa vintlənmiş bir etiketdir və von Neumann dizaynının qəsdən sildiyi məhz həmin fərqi geri qaytarır. Bunun fəlsəfi mənasına fikir ver: təhlükəsizlik həlli daxili mənası olmayan byte-lara qoyulmuş bir *müqavilədir* — bu kursun hər tək dərsdə etdiyi gedişin eynisi.

</Pitfall>

<DeepDive>

#### İxtiraçısının adını daşıyan darboğaz {/*the-bottleneck-named-after-its-inventor*/}

Instruction-ları və data-nı bir yaddaşa qoymaq universallığı bir qiymətə aldı və həmin qiymətin adı var. 1977-ci il Turing mükafatı mühazirəsində, *Can Programming Be Liberated from the von Neumann Style?* adlı çıxışında FORTRAN-ı yaradan komandaya rəhbərlik etmiş John Backus iddia etdi ki, processor ilə yaddaş arasındakı tək əlaqə hesablamanın müəyyənedici məhdudiyyətinə çevrilib. O, buna **von Neumann bottleneck** adını verdi: hər instruction və hər operand bir-bir eyni kanaldan sıxılıb keçməlidir və CPU ömrünün böyük hissəsini hesablamaqla yox, həmin kanalı gözləməklə keçirir.

Alternativ var və o, mübahisənin özündən köhnədir. **Harvard arxitekturası** — adını instruction-larını perforasiya lentindən oxuyan, data-nı isə relay-lərdə saxlayan Harvard Mark I-dən alıb — instruction-ları və data-nı fiziki olaraq ayrı yaddaşlarda, ayrı bus-larla saxlayır. Onda instruction gətirmək və data dəyəri oxumaq növbələşmək əvəzinə eyni anda baş verir.

Heç bir dizayn birbaşa qalib gəlmədi; buraxılan isə kompromis oldu. Müasir processor-un içinə bax və **instruction-lar ilə data üçün ayrı L1 cache-lər** görəcəksən — L1I və L1D, hər birinin nüvəyə öz yolu var — vahid tək əsas yaddaşın qarşısında oturmuş halda. Instruction-lar və data sürətin əhəmiyyət daşıdığı, CPU-ya yaxın yerdə Harvard tipli ayrılıb, çevikliyin əhəmiyyət daşıdığı uzaq yerdə isə von Neumann tipli birləşdirilib. Sənaye buna **modified Harvard architecture** deyir və bu, belə mübahisələrin adətən necə bitdiyinə yaxşı nümunədir: tərəflərdən biri qalib gəlməklə yox, sərhədin hər tərəfin ən güclü olduğu yerə köçürülməsi ilə.

</DeepDive>

<DeepDive>

#### Bütöv CPU, bir parça silikonda {/*the-whole-cpu-on-one-piece-of-silicon*/}

Manchester Baby-dən sonrakı iyirmi beş il ərzində "CPU" ya bir şkaf, ya da ən yaxşı halda çiplərlə örtülmüş bir lövhə demək idi. Sonra, 1971-ci ilin noyabrında, Intel **4004**-ü buraxdı.

Onun **2,300 transistoru** vardı. O, 4 bit enində idi, 740 kHz-də işləyirdi və demək olar ki, təsadüfən mövcud olmuşdu: yapon kalkulyator şirkəti Busicom Intel-ə masaüstü kalkulyator üçün onlarla xüsusi çipdən ibarət dəst sifariş etmişdi. Ted Hoff bütün dəsti bir ümumi təyinatlı proqramlaşdırıla bilən processor və yaddaşla əvəz etməyi təklif etdi; Stanley Mazor onu təyin etməyə kömək etdi, Federico Faggin silikonu dizayn etdi, Masatoshi Shima isə Busicom-u təmsil edirdi. Müqaviləyə görə çip Busicom-a məxsus idi — və nəyə sahib olduğunu hiss edən Intel hüquqları **60,000 dollara** geri almaq üçün danışıqlar apardı.

4004-ü müasir processor-un yanına qoy və nisbətlər dərk edilməz olur. On altı milyard transistora qarşı 2,300 təxminən **yeddi milyon** dəfə fərq deməkdir. Bununla belə, bu dərsin əvvəlindəki blok sxemi hər ikisini təsvir edir. 4004-ün register-ləri, ALU-su, program counter-i, instruction register-i və control unit-i vardı. O vaxtdan bəri gələn hər şey — cache-lər, pipeline-lar, çoxlu nüvələr, branch predictor-lar, vector blokları — həmin beş hissənin *ətrafında* qurulmuş təfərrüatdır, onların əvəzi yox. Elə buna görə anatomiyanı bir dəfə öyrənmək bu qədər dəyərlidir: hissələr siyahısı yetmiş beş ildir dəyişməyib.

</DeepDive>

## CPU qur və onun düşünməsinə bax {/*build-a-cpu-and-watch-it-think*/}

Yuxarıdakı hər şey, işlək halda. Aşağıda tam bir processor var: dörd 8-bit register, bir ALU, bir program counter, bir instruction register, bir control unit və altı byte proqram yaddaşı. Instruction formatı bir byte-dır, dörd 2-bitlik sahəyə bölünüb:

```
  7 6   5 4   3 2   1 0
 ┌─────┬─────┬─────┬─────┐
 │ op  │ rd  │ rs1 │ rs2 │      op:  00 ADD   01 SUB
 └─────┴─────┴─────┴─────┘           10 AND   11 OR
```

**step**-ə bas və hər hissənin eyni anda hərəkət etməsinə bax: PC bir ünvan seçir, həmin ünvandakı byte IR-ə düşür, control unit həmin byte-ın nəzərdə tutduğu siqnalları yandırır, iki register ALU-nun input-larında peyda olur və nəticə geri yazılır. İki şeyi axtarmağa dəyər. Birincisi, proqram byte-larına bax: onlar `6, 87, 161, 242, 0, 64`-dür — 4-cü ünvandakı instruction hərfi mənada **sıfır** ədədidir. İkincisi, flag-lərə bax: bu instruction-lardan ikisi sıfır nəticə verir və `Z`-ni qaldırır — indiyə qədər yazdığın hər `if` ifadəsi nəticədə məhz belə həll olunur.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const OPS = ['ADD', 'SUB', 'AND', 'OR'];
const PROGRAM = [6, 87, 161, 242, 0, 64];
const INITIAL = [0, 5, 3, 1];

const bin = (v, n = 8) => v.toString(2).padStart(n, '0');
const decode = (byte) => ({
  op: (byte >> 6) & 3,
  rd: (byte >> 4) & 3,
  rs1: (byte >> 2) & 3,
  rs2: byte & 3,
});

function execute(op, a, b) {
  let raw;
  if (op === 0) raw = a + b;
  else if (op === 1) raw = a - b;
  else if (op === 2) raw = a & b;
  else raw = a | b;
  const value = raw & 255;
  const carry = (op === 0 && raw > 255) || (op === 1 && raw < 0) ? 1 : 0;
  return { value, carry, zero: value === 0 ? 1 : 0, neg: (value >> 7) & 1 };
}

export default function TinyCPU() {
  const [pc, setPc] = useState(0);
  const [regs, setRegs] = useState(INITIAL);
  const [flags, setFlags] = useState({ zero: 0, neg: 0, carry: 0 });
  const [last, setLast] = useState(null);

  const halted = pc >= PROGRAM.length;
  const byte = halted ? 0 : PROGRAM[pc];
  const f = decode(byte);
  const aVal = regs[f.rs1];
  const bVal = regs[f.rs2];
  const preview = execute(f.op, aVal, bVal);

  const step = () => {
    if (halted) return;
    const next = regs.slice();
    next[f.rd] = preview.value;
    setRegs(next);
    setFlags({ zero: preview.zero, neg: preview.neg, carry: preview.carry });
    setLast({ pc, text: `${OPS[f.op]} R${f.rd}, R${f.rs1}, R${f.rs2}`, value: preview.value });
    setPc(pc + 1);
  };
  const reset = () => {
    setPc(0); setRegs(INITIAL);
    setFlags({ zero: 0, neg: 0, carry: 0 }); setLast(null);
  };

  const card = (title, children, col = '#888') => (
    <div style={{
      border: `2px solid ${col}`, borderRadius: 10, padding: '8px 12px',
      margin: 4, minWidth: 150
    }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );

  const signals = halted ? [] : [
    ['RegRead1', `R${f.rs1}`, 1],
    ['RegRead2', `R${f.rs2}`, 1],
    ['ALUop', OPS[f.op], 1],
    ['UseConstant', '0', 0],
    ['RegWrite', '1', 1],
    ['WriteAddr', `R${f.rd}`, 1],
  ];

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={step} disabled={halted}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>
          step
        </button>
        <button onClick={reset} style={{ fontSize: 15, padding: '4px 14px' }}>reset</button>
        {halted && <span style={{ marginLeft: 12, color: ACC }}>
          <b>proqram bitdi</b> — PC-də daha heç nə yoxdur
        </span>}
      </div>

      {/* yaddaş */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 6 }}>
        <span style={{ width: 74, color: '#888', fontSize: 12 }}>memory</span>
        {PROGRAM.map((b, i) => {
          const here = i === pc;
          const d = decode(b);
          return (
            <div key={i} style={{ textAlign: 'center', margin: 2 }}>
              <div style={{ fontSize: 10, color: '#888' }}>{i}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 14, padding: '6px 8px',
                border: `2px solid ${here ? DNG : '#888'}`, borderRadius: 7,
                background: here ? `${DNG}22` : 'transparent'
              }}>{bin(b)}</div>
              <div style={{ fontSize: 10, color: here ? DNG : '#888' }}>
                {here ? `PC → ${b}` : b}
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>
                {OPS[d.op]} R{d.rd},R{d.rs1},R{d.rs2}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {card('program counter', (
          <div style={{ fontFamily: 'monospace', fontSize: 20 }}>PC = {pc}</div>
        ), DNG)}

        {card('instruction register', (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 20 }}>{bin(byte)}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              = {byte} ədədi
            </div>
          </div>
        ), DNG)}

        {card('dekod olunmuş sahələr', (
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            <span style={{ color: ACC }}>{bin(f.op, 2)}</span>{' '}
            {bin(f.rd, 2)} {bin(f.rs1, 2)} {bin(f.rs2, 2)}
            <div style={{ fontSize: 12, color: '#888' }}>op rd rs1 rs2</div>
            <div style={{ fontSize: 14, marginTop: 2 }}>
              {OPS[f.op]} R{f.rd}, R{f.rs1}, R{f.rs2}
            </div>
          </div>
        ), ACC)}
      </div>

      {/* control word */}
      <div style={{ margin: '8px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ width: 68, color: '#888', fontSize: 12, alignSelf: 'center' }}>
          control word
        </span>
        {signals.map(([name, val, on]) => (
          <span key={name} style={{
            fontFamily: 'monospace', fontSize: 12, padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${on ? DNG : '#888'}`,
            background: on ? `${DNG}1e` : 'transparent',
            color: on ? DNG : '#888'
          }}>{name}={val}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {card('register file', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            {regs.map((v, i) => (
              <div key={i} style={{
                color: !halted && i === f.rd ? DNG : 'inherit'
              }}>
                R{i} = {bin(v)} = {String(v).padStart(3, ' ')}
                {!halted && i === f.rs1 && <span style={{ color: ACC }}> ← ALU A</span>}
                {!halted && i === f.rs2 && <span style={{ color: ACC }}> ← ALU B</span>}
              </div>
            ))}
          </div>
        ), ACC)}

        {card('ALU', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            <div>A = {aVal}</div>
            <div>B = {bVal}</div>
            <div style={{ color: ACC }}>
              {OPS[f.op]} → {preview.value}
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>nəticə, geri yazılmazdan əvvəl</div>
          </div>
        ), ACC)}

        {card('flags', (
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            {[['Z', flags.zero, 'nəticə sıfır idi'],
              ['N', flags.neg, 'yuxarı bit qalxıb'],
              ['C', flags.carry, 'carry çıxdı']].map(([n, v, why]) => (
              <div key={n} style={{ color: v ? DNG : '#888' }}>
                {n} = {v} <span style={{ fontSize: 11 }}>({why})</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {last && (
        <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
          son icra olunan: {last.pc} ünvanında{' '}
          <b style={{ fontFamily: 'monospace' }}>{PROGRAM[last.pc]}</b> byte-ı vardı,
          control unit onu <b>{last.text}</b> kimi oxudu və {last.value} yaratdı.
        </p>
      )}
    </div>
  );
}
```

</Sandpack>

Bütün proqramı bir dəfə addım-addım keç və sonra izlədiyinə geri bax. Nə sehrli qat vardı, nə interpretator, nə də gizli zəka. Bir ədəd ünvan seçdi; həmin ünvandakı byte bəzi açarları qurdu; açarlar iki dəyəri adder-ə yönləndirdi; adder-in output-unu clock edge-ində bir register tutdu. Bunu altı dəfə təkrarla və maşın "proqram işlətmiş" olur.

Çatışmayan yeganə şey *ardıcıllıqdır* — həmin addımların hər clock dövrəsinin içində baş verdiyi nizamlı sıra və PC-nin irəli getməyi haradan bilməsi. Həmin sıranın adı var və o, növbəti dərsdir.

<Recap>

- **Stored-program** fikri — 1945-ci il EDVAC hesabatından, ilk dəfə 21 iyun 1948-ci ildə Manchester Baby tərəfindən icra olunmuş — instruction-ları data ilə eyni yaddaşa, adi ədədlər kimi kodlanmış halda qoyur. Proqramlaşdırma yenidən naqilləmə olmaqdan çıxdı.
- CPU **instruction-ı ədəddən ayıra bilmir**. `00011011` byte-ı yalnız program counter-in ona göstərib-göstərməməsindən asılı olaraq ya `ADD R1, R2, R3`, ya da 27 dəyəridir. *Byte-ların mənası yoxdur — müqavilələrin var*, indi proqramın özünə tətbiq olunmuş halda.
- Hər processor-da beş hissə var: **register file**, **ALU**, **program counter**, **instruction register** və **control unit**; onlar **bus**-larla birləşdirilib və clock-la ritm alır.
- **Register file** **iki read port və bir write port** verir, çünki `R1 = R2 + R3`-ə tam olaraq bu lazımdır. Register-lər azdır (16–32), çünki port-lar bahalıdır, daha böyük file-lar daha yavaşdır və hər register nömrəsi instruction kodlamasının içində yazılmalıdır.
- **Datapath** sabit yol şəbəkəsidir; hansı dəyərin hansı yolla getdiyinə **multiplexer**-lər qərar verir. Mux `if`-in hardware ekvivalentidir.
- **Control signal**-lar data daşımır — onlar fellərdir. Opcode-dan control word-a keçid sabit truth table olduğuna görə control unit sadəcə combinational logic-dir: sürət üçün **hardwired**, çeviklik üçün **microcoded** — elə buna görə CPU-lar microcode update ala bilir.
- Yaddaş əhəmiyyət daşıyan yeganə vahiddə uzaqdadır: register ~1 dövrə, L1 ~4, əsas yaddaş ~**200**. Register bir saniyə çəkəcək şəkildə miqyaslandırılanda yaddaş üç dəqiqə, disk axtarışı isə ilin böyük hissəsi çəkir — CPU-ların register-lərə yükləyib orada işləməsinin səbəbi elə budur.
- Stored-program xassəsi həm də zəiflikdir: **buffer overflow**-lar ona görə işləyir ki, icra PC hara düşürsə oraya gedir. Həll — hardware **NX bit**-i ilə tətbiq olunan **W^X** — arxitekturanın qəsdən sildiyi fərqi bərpa etmək üçün yaddaşa vintlənmiş müqavilədir.

</Recap>

<Challenges>

#### Assemble et və disassemble et {/*assemble-and-disassemble*/}

Oyuncağın formatından istifadə edərək — `op(2) rd(2) rs1(2) rs2(2)`, burada `00`=ADD, `01`=SUB, `10`=AND, `11`=OR — hər iki istiqamətdə işlə. (a) `SUB R3, R2, R0`-ı tək bir byte-a kodla, binary və onluqda. (b) Yaddaşda `170` byte-ı görünür. Bu, hansı instruction-dır? (c) Program counter proqramçının sırf data kimi nəzərdə tutduğu bir byte-a göstərsəydi, CPU nə edərdi, izah et.

<Hint>

(a) üçün dörd 2-bitlik sahəni yan-yana yaz, sonra səkkiz bit-i tək ədəd kimi oxu. (b) üçün əvvəlcə 170-i binary-yə çevir, sonra onu dörd cütə böl.

</Hint>

<Solution>

**(a) `SUB R3, R2, R0`:**

```
 op  = SUB = 01
 rd  = R3  = 11
 rs1 = R2  = 10
 rs2 = R0  = 00

 byte = 01 11 10 00 = 01111000 = 64 + 32 + 16 + 8 = 120 ✓
```

**(b) 170 byte-ı:**

```
 170 = 10101010

 böl:    10 | 10 | 10 | 10
         op   rd   rs1  rs2
         AND  R2   R2   R2

 → AND R2, R2, R2
```

Bu, `R2 AND R2` hesablayıb nəticəni R2-yə saxlayan instruction-dır — tamamilə qanuni, tamamilə mənasız bir əməliyyat, maşını tapdığı kimi qoyub gedir (hərçənd flag-ləri yeniləyir, bəzən belə bir şey yazmağın əsl səbəbi elə budur).

**(c) PC-ni data-ya göstərmək:** CPU onu dekod edib icra edərdi. Nə yoxlama var, nə tip etiketi, nə də xəta — byte hər hansı digəri kimi `op`, `rd`, `rs1`, `rs2`-yə bölünərdi və bəzi register-lərin üstü nəticələrlə yazılardı. Stored-program maşınının byte-ın instruction olub-olmadığına qərar verməkdə düz bir yolu var: program counter ona göstərirmi. Elə buna görə Pitfall-dakı `NX` bit-i hardware-də əlavə olunmalı oldu; arxitekturanın özü müraciət ediləsi heç nə təklif etmir.

</Solution>

#### Port-ları say {/*count-the-ports*/}

Dizayn komandası bir dövrədə `R1 = R2 + R3 + R4` hesablayan instruction təklif edir. (a) Bu, register file-dan nə tələb edir? (b) ALU-dan nə tələb edir? (c) Hər ikisi texniki olaraq qurula bilən olsa da, komanda niyə bunu rədd edə bilər?

<Solution>

**(a) Register file**-a ikinin əvəzinə **üç read port** lazım olardı, çünki üç mənbə dəyəri eyni anda görünməlidir. Hər əlavə read port file-dakı *hər* register üçün address dekodlamasını və output multiplexing-ini təkrarlayır — bu, 50%-lik xərc artımı deyil, oxuma mexanizminin daha bir tam surətinə yaxındır.

**(b) ALU** üç ədədi eyni anda toplamalı olardı. Bu mümkündür — amma üç input-lu adder iki input-lu adder-dən nəzərəçarpacaq dərəcədə dərindir, dərinlik isə gecikmədir. Clock dərsindən: bu yeni yol critical path-ə çevrilirsə, o, təkcə bu instruction-ı yavaşlatmır, **bütün processor-dakı hər instruction** üçün clock tezliyini aşağı salır.

**(c) Niyə rədd etmək.** Üç səbəb, bu mübahisələri nə qədər tez-tez həll etməsinə görə təxmini sıra ilə:

- **Kodlama büdcəsi.** Instruction indi üç yox, dörd register adlandırmalıdır. 32 register-lə bu, sabit enli instruction-dan çıxarılan daha 5 bit deməkdir — bu bit-lər haradansa oğurlanmalıdır, ehtimal ki, *bütün* instruction-lar üçün sabit sahəsini və ya mövcud opcode sayını kiçildərək.
- **Clock.** Daha yavaş critical path nadir bir instruction-ı sürətləndirmək üçün hər instruction-dan vergi alır. İki adi `ADD` eyni işi iki dövrədə, clock-a toxunmadan görür.
- **Bu, əslində nə qədər faydalıdır?** Üç register toplamaq geniş yayılmış şablon deyil; ona daimi hardware və daimi kodlama yeri sərf etmək pis sövdələşmədir.

Cavabın ümumi forması processor dizaynının təkrarlanan dərsidir: **critical path-i uzadan və ya kodlama yerini yeyən lokal sürətlənmələr adətən itkidir**, çünki bu iki xərcin hər ikisi qlobal və əbədi olaraq ödənilir.

</Solution>

#### Sirli yavaşlama {/*the-mystery-slowdown*/}

Köçürmə tapşırığı. Bir həmkarın sənə məhsuldarlıq tapmacası gətirir. İki funksiya eyni miqdarda data üzərində eyni arifmetikanı edir və hər ikisi demək olar ki, eyni sayda instruction-a kompilyasiya olunur — amma biri təxminən **beş dəfə yavaş** işləyir. Sürətli olan kiçik bir massivi təkrar-təkrar gəzir; yavaş olan isə çox böyük massivi bir dəfə gəzir və hər elementə səpələnmiş sırada toxunur. CPU sayğacları göstərir ki, hər ikisi *iş* baxımından saniyəyə oxşar sayda instruction icra edir, amma yavaş olanda nüvə vaxtın böyük hissəsində boş dayanır.

Yalnız bu dərsin öyrətdiklərindən istifadə edərək demək olar ki, mütləq nə baş verdiyini izah et, "eyni instruction sayı"nın niyə yanıldıcı ölçü olduğunu de və növbəti addımda nəyi ölçməyi və ya dəyişməyi təklif edəcəyini yaz.

<Solution>

**Nə baş verir.** İki funksiya eyni miqdarda *gözləmə* etmir. Instruction sayı ALU-ya verilən işi ölçür; operand-ların haradan gəldiyi barədə heç nə demir. Sürətli funksiyanın data-sı kifayət qədər kiçikdir ki, dəyərləri pilləkənin sürətli ucunda qalsın — register-lər və ən yaxın cache səviyyələri, bir neçə dövrə uzaqda. Yavaş funksiya isə böyük massivə səpələnmiş şablonla uzanır, ona görə operand-larının böyük hissəsi əsas yaddaşdan, hər biri təxminən **200 dövrə** ilə gəlir. Nüvə yavaş hesablamır; o, **stall** vəziyyətindədir, yəni bir dəyər bu dərsin "register bir saniyə" miqyasında üç dəqiqə kimi ölçdüyü məsafəni keçərkən yerində dayanıb gözləyir.

**"Eyni instruction sayı" onları niyə yanıltdı.** Bu, ALU-nun iş yükünün ölçüsüdür, ALU isə heç vaxt darboğaz olmayıb. Blok sxemi səbəbi aydın göstərir: register file və ALU CPU-nun içində oturur və clock sürətində işləyir, yaddaş isə bus-un o biri tərəfindədir. Register oxuyan instruction ilə yaddaş oxuyan instruction sayğacda eyni görünür, vaxtca isə iki tərtib fərqlənir. İş vaxtını təxmin etmək üçün instruction saymaq, çatdırılma marşrutunun dayanacaqlarını onların bir-birindən nə qədər uzaq olduğunu soruşmadan saymağa bənzəyir.

**Növbəti addımda nəyi ölçmək və ya dəyişmək:**

- **Instruction-ları yox, stall-ları ölç.** Cache miss sayları və yaddaşa görə stall-lanmış dövrələr fərqi dərhal göstərəcək rəqəmlərdir; əksər CPU-lar bunları hardware performance counter kimi təqdim edir.
- **Arifmetikanı dəyişməzdən əvvəl müraciət şablonunu dəyiş.** Yaddaşı sıra ilə gəzmək atılıb-düşməkdən kəskin şəkildə daha münasibdir, ona görə döngünü data-ya ardıcıl toxunacaq şəkildə yenidən qurmaq və ya onu sürətli yaddaşda qalacaq qədər kiçik bloklarla emal etmək çox vaxt istənilən instruction tənzimləməsindən çox qazandırır.
- **Data yerləşməsini yenidən nəzərdən keçir.** Bəzən həll ümumiyyətlə döngüdə yox, data-nın necə düzüldüyündədir — həqiqətən oxunan sahələri yan-yana yığmaq ki, yaddaşa bir gediş daha çox faydalı dəyər gətirsin.

Köçürülə bilən vərdiş və yaddaş pilləkəninin mövcud olma səbəbi: **proqram yavaş işləyəndə kodunun nə etdiyini soruşmazdan əvvəl data-sının harada olduğunu soruş.** Müasir məhsuldarlıq işinin çoxu ALU-nu daha məşğul etmək haqqında deyil; onu gözləməkdən qurtarmaq haqqındadır. ✓

</Solution>

</Challenges>

<LearnMore title="Fetch–Decode–Execute Dövrəsi" path="/learn/faza-0/modul-0-3/fetch-decode-execute">

İndi hər hissəni və onların necə qoşulduğunu bilirsən — amma hərəkət etmə sıralarını yox. Real processor hər şeyi eyni anda etmir: hər təkanın içində PC-nin göstərdiyi byte-ı *fetch* edir, onu control siqnallarına *decode* edir və əməliyyatı *execute* edir, sonra PC-ni irəli aparır və bunu yenidən edir, saniyədə milyardlarla dəfə, əbədi. Növbəti dərs bir instruction-ı bu dövrənin bütün yolu boyunca izləyir və yuxarıdakı oyuncağın səssizcə yayındığı suala cavab verir: instruction "bunları topla" yox, "başqa yerə get" deyəndə nə baş verir?

</LearnMore>