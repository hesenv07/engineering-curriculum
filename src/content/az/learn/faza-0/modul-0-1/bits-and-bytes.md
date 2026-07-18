---
title: 'Bit və Bayt: İnformasiya Nədir?'
---

<Intro>

Kainatdakı istənilən obyekti düşünün — pinqvin, Eyfel qülləsi, sol ayaqqabınız. Cəmi iyirmi "bəli/xeyr" sualı ilə "iyirmi sual" oyununun yaxşı bir oyunçusu hər şeyi demək olar ki, həmişə tapır. Bu oyun hiylə deyil; buna rəqəm qoşulmuş riyazi bir faktdır: iyirmi "bəli/xeyr" cavabı 2²⁰ — bir milyondan çox — ehtimalı ayırd edə bilir. 1948-ci ildə Bell Labs mühəndisi Claude Shannon bu müşahidəyə əsaslanaraq bütöv bir elm qurdu: *bütün* informasiya — mətn, səs, şəkillər, pul — "bəli/xeyr" cavablarına endirilə bilər. Ən kiçik mümkün cavaba bir ad verdi, və həmin ad bu bütün kursun qurulduğu atomdur: **bit**.

</Intro>

<YouWillLearn>

- Bit əslində nədir — və niyə bundan kiçik heç nə mövcud ola bilməz
- Hər şeyin arxasındakı tək formula: n bit = 2ⁿ vəziyyət
- Kompüterlər niyə 10 deyil, 2 vəziyyətdə işləyir — riyazi deyil, fiziki cavab
- Bir byte-ın niyə tam 8 bit olduğu (spoiler: demək olar ki, belə olmayacaqdı)
- İki fərqli "kilobayt" və niyə 1 TB diskinizdə 931 GB görünür
- Bu modulun kilidini açan ideya: byte-ların öz başına mənası yoxdur — *şərh* vacibdir

</YouWillLearn>

## Bütün hesablamanın arxasındakı oyun {/*the-game-behind-all-computing*/}

Sahib olduğunuz ən sadə informasiya cihazından başlayın: işıq açarı. İki vəziyyət — açıq, bağlı. Küçənin o tərəfindəki bir dostunuza bu açarla mesaj göndərə bilərsinizmi? Əlbəttə — əvvəlcədən razılığa gəlsəniz: *açıq "bəli" deməkdir, bağlı "xeyr"*. Bir açar, iki mümkün mesaj.

İndi ikinci açar quraşdırın. Kombinasiyalar: açıq-açıq, açıq-bağlı, bağlı-açıq, bağlı-bağlı — dörd mesaj. Üçüncü açar: səkkiz. Hər əlavə açar **iki dəfə artırır** mümkün mesajların sayını.

<Diagram name="bits-and-bytes/light_switches" height={330} width={720} alt="Three rows of light-switch icons. Row one: a single switch in the ON position, labeled 2 to the power of 1 equals 2 messages. Row two: two switches, one on and one off, labeled 2 squared equals 4 messages. Row three: three switches in a mixed on/off pattern, labeled 2 cubed equals 8 messages. A caption explains that a raised dot means ON, a lowered dot means OFF, and that a computer is trillions of such switches called transistors.">

Hər əlavə açar mesaj sahəsini iki dəfə artırır — bu kursdakı ən vacib nümunə.

</Diagram>

Məhz bu oyunu Shannon 1948-ci ildə *A Mathematical Theory of Communication* adlı məqaləsində rəsmiləşdirdi — yəqin ki, iyirminci əsrin ən əhəmiyyətli məqaləsi, çünki istifadə etdiyiniz hər telefon zəngi, video axını və fayl onun ideyaları üzərində işləyir. Shannon hər hansı mesajın "bəli/xeyr" cavabları ardıcıllığı kimi kodlaşdırıla biləcəyini, informasiyanın ən kiçik vahidinin isə belə bir cavab olduğunu göstərdi. Onun həmkarı John Tukey bunun adını tapdı: **bit**, *binary digit*-in qısaltması. Bir bit iki mümkün dəyərə malikdir — bəli/xeyr, açıq/bağlı, ya da bundan sonra yazacağımız kimi, `1` və `0`. Bundan kiçik heç nə mövcud deyil: "bəli/xeyr" cavabının yarısı cavab deyil.

Kompüter, hər şeyin dibinə qədər, bu eyni oyunun absurd miqyasda oynanmasıdır: **transistor** adlı trilyonlarla mikroskopik açar — hər biri saniyədə milyardlarla dəfə keçid edən, hər biri tam bir bit saxlayan elektrik idarəli açar. Onların üstündəki hər şey — əməliyyat sisteminizden bu veb səhifəyə qədər — açar nümunələrindən ibarətdir.

Və ikiləmə nümunəsi bizə bu bütün kursun dayandığı tək formulanı verir:

**n bit = 2ⁿ fərqli vəziyyət**

| Bit | Vəziyyətlər | Bunun üçün kifayətdir... |
|-----|-------------|--------------------------|
| 1 | 2 | bəli / xeyr |
| 2 | 4 | dörd istiqamət (↑ ↓ ← →) |
| 4 | 16 | bir hexadecimal rəqəm |
| 8 | 256 | bir ASCII simvol, bir rəng kanalı |
| 16 | 65,536 | bir şəbəkə port nömrəsi |
| 32 | ~4.3 milyard | bir IPv4 ünvanı |
| 64 | ~18 kvintilyon | müasir CPU-nun "sözü" |

Cədvəli əzbərləməyin — *öz əllərinizlə hiss edin*. Aşağıda 8 açar var, yəni 8 bit, yəni bir byte. Onları çevirin:

<Sandpack>

```js
import { useState } from 'react';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function ByteToy() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  function toggle(i) {
    const next = [...bits];
    next[i] = next[i] === 0 ? 1 : 0;
    setBits(next);
  }

  const value = bits.reduce((sum, bit, i) => sum + bit * WEIGHTS[i], 0);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <p style={{ fontFamily: 'system-ui' }}>One byte = 8 switches. Click them:</p>
      <div>
        {bits.map((bit, i) => (
          <button
            key={WEIGHTS[i]}
            onClick={() => toggle(i)}
            style={{
              width: 42,
              height: 54,
              margin: 3,
              fontSize: 22,
              fontFamily: 'monospace',
              borderRadius: 8,
              border: '1px solid #888',
              cursor: 'pointer',
              background: bit ? '#087ea4' : 'transparent',
              color: bit ? 'white' : 'inherit'
            }}
          >
            {bit}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>
        {WEIGHTS.map(w => (
          <span key={w} style={{ display: 'inline-block', width: 48 }}>{w}</span>
        ))}
      </div>
      <h2>= {value}</h2>
      <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#888' }}>
        {value === 255
          ? 'All switches on — 255, the ceiling of a byte. Remember this number.'
          : 'A byte holds 2⁸ = 256 different values: 0 through 255.'}
      </p>
    </div>
  );
}
```

</Sandpack>

Hamısını açın və 255 alacaqsınız — bir byte-ın tavanı. Bu rəqəmi yadda saxlayın; növbəti dərsdə Pac-Man, YouTube və Boeing 787-nin belə bir tavandan bir addım irəli getməyə çalışdıqda nə baş verdiyini görəcəksiniz.

## Niyə 2 vəziyyət, 10 deyil? {/*why-two-not-ten*/}

Bu sual kompüterləri *istifadə edən* insanlarla onları *anlayan* insanları ayırır. Bizim on barmağımız var və on rəqəmli say sistemimiz var — maşınlar niyə iki istifadə edir? Dürüst cavab riyaziyyatçıları məyus edir: binary riyazi baxımdan xüsusi deyil. **Bu fiziki dözümlülük məsələsidir.**

Sxemin daxilində rəqəm bir gərginliklə təmsil olunmalıdır. Onluq bir maşın düzəltdiyimizi fərz edin: 0 volt "0", 0.5 V "1", 1.0 V "2", 4.5 V-ə qədər "9". Bu sxem reallıqla üz-üzə gəlincə dağılır, çünki real gərginliklər heç vaxt sabit qalmır — temperatur, qonşu naqillərdən elektrik küyü və komponent köhnəliyi onları daim titrədir. Sensorunuz 2.3 V oxuyur. Bu bir az yüksək "4"-dür, yoxsa bir az alçaq "5"? Həmin aralığa sıxılmış on səviyyə ilə titrəmə tez-tez bir sərhədi keçir, hər keçid isə korrupsiyaya uğramış bir rəqəmdir.

İndi həmin titrəyən siqnalın yalnız iki zonada yaşamasına icazə verin — "yüksək" və "aşağı" — aralarında geniş boş bir tampon ilə:

<Diagram name="bits-and-bytes/voltage_noise" height={360} width={720} alt="Two panels comparing the same noisy signal. Left panel: a decimal signal with ten narrow voltage bands stacked closely; a red wobbling line repeatedly crosses band borders, captioned 'wobble crosses band borders — is it a 4 or a 5?'. Right panel: a binary signal with only two wide zones for 1 and 0 separated by a large empty buffer zone; the same wobbling line, drawn in blue, stays safely inside the top zone, captioned 'same wobble, still clearly a 1'. Bottom caption: binary wins for a physical reason, not a mathematical one.">

Eyni küy, əks nəticə. Tampon zona on səviyyənin ödəyə bilmədiyi sığortadır.

</Diagram>

Onluq siqnalı məhv edən titrəmə, binary siqnalı belə çaşdırmır. Sirrin hamısı budur: **iki vəziyyət, on vəziyyətin dözə bilmədiyi küyə dözür.** Bu möhkəmliyi saniyədə milyardlarla dəfə keçid edən trilyonlarla transistor ilə vurun, binary artıq seçim deyil — öz xəta nisbəti altında çöküb dağılmayan yeganə dizayndır.

<Note>

Binary yeganə namizəd deyildi — tarix bu eksperimenti apardı. İlk böyük elektron kompüter **ENIAC (1945) onluq** idi: hər rəqəmi on vakuum borulu halın halkasında saxlayırdı — məhz yuxarıda təsvir edilən həssas sxem — və dizaynerlərin çətin qazandığı nəticə bütün sahəni binary-ə itələdi. 1958-ci ildə isə Sovet İttifaqı **Setun** adlı *üçlü* kompüter qurdu (üç vəziyyət: −1, 0, +1) — həqiqətən elegant və səmərəli idi, lakin iki vəziyyətli sxemlərin istehsal sadəliyi qalib gəldi. Bu gün heç bir kommersiya qeyri-binary prosessoru mövcud deyil.

</Note>

## Byte: niyə tam 8? {/*the-byte-why-eight*/}

Tək bit-lər bir-bir idarə edilmək üçün çox kiçikdir, ona görə onları qruplaşdırırıq. 8-bitlik qrup **byte**-dır — yaddaşın ünvanlandığı vahid, fayl ölçülərinin ölçüldüyü vahid, bu bütün kursun sayacağı vahid. Lakin burada sürpriz var: **8 təbiət qanunu deyil. Bu bir müqavilədir.**

1950-ci və 60-cı illər xaos içindəydi: maşınlar 6-bitlik, 7-bitlik, hətta 9-bitlik simvol qrupları ilə göndərilir, ciddi elmi kompüterlərdə 36-bitlik "sözlər" adi idi. "Byte" sözünün özü 1956-cı ildə IBM mühəndisi Werner Buchholz tərəfindən icad edildi — *bite*-ın ("məlumat parçası") qəsdli yeni yazılışı, *i*-nin *y* ilə əvəz edilməsi isə heç kimin onu "bit" kimi oxumaması üçün.

Müqavilə 1964-cü ildə bazar qüvvələri tərəfindən imzalandı — IBM öz gələcəyini 8-bitlik byte üzərində qurulmuş System/360-a — dövrünün ən uğurlu kompüter ailəsinə — mərc etdi. Səkkiz ideal nöqtə idi: İngilis mətni üçün bir simvolu (böyük və kiçik hərflər, rəqəmlər, durğu işarələri) rahat şəkildə saxlayır, üstəlik 2-nin qüvvəti olduğu üçün ünvanlama riyaziyyatı səliqəlidir. Sənaye uyğunlaşdı, 8-bitlik byte hər kəsin üzərində qurduğu zəminin oldu. Bir byte-ın yarısı — 4 bit — zarafat adı **nibble** aldı ("kiçik bir dişləmə"), bu zarafat isə rəsmi sənədlərə girecək qədər möhkəm yerləşdi.

<DeepDive>

#### Byte-ın 8 bit olmadığı dünyalar {/*the-worlds-where-a-byte-wasnt-8*/}

8-bitlik müqavilə bu gün o qədər tam ki, istisnaları alternativ tarix kimi oxunur — lakin hələ də tapa biləcəyiniz izlər buraxdı.

Şəbəkə protokolu sənədləri (şəbəkə fazasında tanışacağınız RFC-lər) "byte" əvəzinə diqqətlə **octet** yazır — yəni *tam sekiz bit* — çünki həmin sənədlər yazılarkən 9-bitlik byte-ları olan maşınlar (erkən süni intellekt tədqiqatçılarının sevimli 36-bitlik PDP-10 kimi) hələ internettəydi və "byte" həqiqətən mübahimli idi.

ASCII — bir neçə dərsdə araşdıracağınız simvol cədvəli — **7-bitlik** koddur — 128 simvol — 8 deyil. 1963-cü ildə hər bit real pul dəyərindəydi, 128 yuva isə İngilis dilini rahat əhatə edirdi. 8-bitlik byte standart olduqda, hər simvol bir ehtiyat bit ilə gəldi... bu ehtiyat bit üçün dünyanın dillərinin necə mübarizə apardığının hekayəsi bu modulun ən yaxşı fəlakətlərindən biridir. Mətn dərsindəki sizi gözləyir.

</DeepDive>

## Byte-larınızla şəxsən tanış olun {/*meet-your-bytes-in-person*/}

Kifayət qədər nəzəriyyə — gəlin byte-ları real halda tutaq. İstənilən Unix-kimi maşında iki simvol bir fayla yazın və `xxd` ilə ham məzmununu soruşun:

<TerminalBlock>

printf 'Hi' > hello.txt && xxd hello.txt

</TerminalBlock>

<TerminalBlock>

00000000: 4869                                     Hi

</TerminalBlock>

İki simvol, iki byte: `48` və `69` (bu hexadecimal-dır — byte-ları yazmağın yığcam üsulu; növbəti dərsdə aydınlaşacaq; binary-də `01001000` və `01101001`-dir). Eyni experiment terminal lazım olmadan indi brauzerin konsolunda da işləyir:

```js
new TextEncoder().encode('Hi')
```

<ConsoleBlock level="info">

Uint8Array(2) [72, 105]

</ConsoleBlock>

Budur: 72 və 105 — eyni iki byte-ın onluq üzü. `"Hi"` sətri — saxladığınız hər sətir, şəkil və mahnı kimi — dibinə qədər rəqəmdir. Bu isə bu modulun ətrafında fırlandığı sualı ortaya qoyur: hər şey yalnız rəqəmlərdirsə... *onlar nə vaxt mənaya sahib olur?*

## İki kilo: gigabaytlarınız hara "getdi" {/*the-two-kilos*/}

Buna cavab verməzdən əvvəl, real çaşqınlıqdan xilas edəcək (və şirkətlərə real məhkəmə xərclərə başa gəlmiş) bir praktik byte savadı. Böyük miqdarlar üçün prefikslər istifadə edirik — kilo, meqa, giqa — lakin sənaye **iki uyğunsuz tərif** üzərinde işləyir:

| Marketinq dili (onluq) | Texniki dil (binary) |
|------------------------|----------------------|
| 1 KB = 1,000 byte | 1 KiB = 1,024 byte (2¹⁰) |
| 1 MB = 10⁶ byte | 1 MiB = 2²⁰ byte |
| 1 GB = 10⁹ byte | 1 GiB = 2³⁰ byte |
| disk istehsalçıları tərəfindən istifadə olunur | RAM və əməliyyat sistemləri tərəfindən istifadə olunur |

Niyə 1,024? Çünki yaddaş avadanlığı 2-nin qüvvətləri üzərinde qurulur (yenə açar-ikiləmə nümunəsi) və 2¹⁰ = 1,024 cazibədar şəkildə 1,000-ə yaxındır — o qədər yaxın ki, onilliklər boyu hər kəs hər ikisini "bir kilobayt" adlandırdı.

Bu laqeydliyin məşhur bir qurbanı var: siz. "1 TB" disk alın — istehsalçı 10¹² byte deməkdir — əməliyyat sisteminiz isə GiB (2³⁰) ilə ölçərək təxminən **931 GB** göstərir. Heç nə itməyib; iki lüğət toqquşdu. Fərq ABŞ-da disk istehsalçılarına qarşı toplu iddialar açmaq üçün kifayət qədər real idi, buna görə yaddaş qutularında indi "1 GB = 1 milyard byte" yazılmış kiçik mətn var.

<Pitfall>

**İnternet sürəti bit-lə ölçülür. Fayl ölçüsü byte-la ölçülür.**

"100 Mbps" bağlantı saniyədə 100 mega*bit* daşıyır — bu 100 ÷ 8 = **12.5 megabyte** deməkdir. 1 GB-lıq bir yükləmə bu sürətlə 10 deyil, təxminən 80 saniyə çəkir. Kiçik hərflə **b** = bit, böyük hərflə **B** = byte, internet provayderləri isə bu çaşqınlıqdan çox zövq alır: "100 meqabit" plan, hərfi yanlış oxuyan hər kəsə səkkiz dəfə sürətli *görünür*. Siz artıq bu hərfi heç vaxt yanlış oxumayacaqsınız.

</Pitfall>

## Hər şey byte-dır — məna şərhdən gəlir {/*everything-is-bytes*/}

İndi mükafat, bu modulun ən vacib tək ideyası. Terminal eksperimentindəki iki byte-ı götürün — `01001000 01101001` — və soruşun: bunlar nədir?

<DiagramGroup>

<Diagram name="bits-and-bytes/bytes_as_text" height={280} width={340} alt="The two bytes 01001000 and 01101001 shown in boxes. Read under the ASCII text contract, the first byte equals 72 and maps to the letter H, the second equals 105 and maps to the letter i — together spelling Hi.">

Mətn müqaviləsi altında: **"Hi"**

</Diagram>

<Diagram name="bits-and-bytes/bytes_as_number" height={280} width={340} alt="The same sixteen bits 01001000 01101001 shown as one long value. Read as a single 16-bit number, computed as 72 times 256 plus 105, they equal 18,537.">

Rəqəm müqaviləsi altında: **18,537**

</Diagram>

</DiagramGroup>

Eyni on altı bit. Mətn müqaviləsi ilə oxusanız, "Hi" deyirlər. Bir 16-bitlik rəqəm kimi oxusanız, 18,537 deyirlər. Pixel kimi oxusanız, mavi-bozumtul bir rəng çaları olardı. **Byte-ların özlərinde hansı olduqlarını göstərən heç bir işarə yoxdur.** Silisiumda gizlənmiş heç bir "mətn" əlaməti, "rəqəm" bayrağı yoxdur — yalnız bit-lər, üstəlik onları necə oxuyacağınıza dair bir *qərar*. Kompüter alimləri bu qərarı şərh, encoding ya da tip adlandırır; bu kurs onu **müqavilə** adlandıracaq.

Bunu gördükdən sonra kiçik sirlər həll olmağa başlayır. Niyə bir fotoşəkili mətn redaktorunda açanda garip simvollar görünür? Çünki redaktor mətn müqaviləsini şəkil müqaviləsi altında yazılmış byte-lara tətbiq etdi — heç nə pozulmayıb, yalnız yanlış oxundu. `.jpg` və `.txt` kimi fayl uzantıları əslində nədir? Hansı müqaviləni tətbiq etmək lazım olduğunu tövsiyə edən yapışqan qeydlər — tövsiyə, zəmanət deyil. Eyni fayl niyə həm etibarlı şəkil, həm də eyni zamanda başqa nəsə ola bilər? Çünki müqavilələr oxucuda yaşayır, byte-larda deyil.

Bu isə irəlidəki hər şeyi çərçivələyir. Bu modul dərslik üzrə böyük müqavilələrin bir turu ilə başqa bir şey deyil: rəqəmlərin necə kodlaşdırıldığı (növbəti dərs), *mənfi* rəqəmlərin necə işlədiyi (raket partlayışı ilə birlikdə), kəsrlərin necə işlədiyi (raket uğursuzluğu ilə birlikdə), mətnin necə işlədiyi (zibil simvollar sirri ilə) və s. Fərqli müqavilələr, eyni itaətkarlıq edən bit-lər.

<Recap>

- **Bit** informasiyanın atomudur — bir "bəli/xeyr" cavabı, `0` ya `1` — Tukey tərəfindən adlandırıldı, Shannon tərəfindən 1948-ci ildə "silahlandırıldı". Bundan kiçik heç nə mövcud deyil.
- Kursun əsas formulası: **n bit = 2ⁿ vəziyyət.** Hər əlavə bit sahəni iki dəfə artırır — iyirmi sual oyunu iyirmi cavabda bir milyondan çox obyektə çatır.
- Kompüterlər binary-dirlər **fiziki** səbəbdən: geniş tamponlu iki gərginlik zonası, on sıxışdırılmış səviyyənin dözə bilmədiyi küyə dözür. ENIAC (onluq) və Setun (üçlük) eksperimenti apardı; binary qalib gəldi.
- **Byte = 8 bit** müqavilə ilə, təbiət qanunu deyil — Buchholz adlandırdı (1956), IBM System/360 standartlaşdırdı (1964). Bir byte-ın yarısı **nibble**-dır; şəbəkə spesifikasiyaları tam 8 mənasında **octet** deyir.
- İki "kilo" bir arada mövcuddur: KB = 1,000 byte (marketinq) həm KiB = 1,024 (texniki) — bütün 931 GB terabayt sirri. **Mbps ≠ MBps**: 8-ə bölün.
- Modulun əsas açarı: **byte-ların mənası yoxdur — müqavilələrin (şərhlərin) mənası var.** Eyni 16 bit "Hi"-dir, 18,537-dir ya da rəngdir — onları necə oxuduğunuzdan asılı olaraq. İrəlidəki hər dərs bir daha müqavilədir.

</Recap>

<Challenges>

#### Oyunun neçə bit-ə ehtiyacı var? {/*how-many-bits-does-the-game-need*/}

Bir oyun personajının 4 vəziyyəti var: dayanan, qaçan, tullanılan, uçan. Vəziyyəti saxlamaq üçün lazım olan minimum bit sayı nədir? Beşinci vəziyyət — üzmə — əlavə edilsə nə olur?

<Hint>

n bit neçə *vəziyyəti* ayırd edə bilər? Ehtiyacınızı ödəyən 2ⁿ üçün ən kiçik n-i tapın.

</Hint>

<Solution>

4 vəziyyət tam **2 bit** ilə sığır: 2² = 4 (deyək ki, `00` dayanan, `01` qaçan, `10` tullanılan, `11` uçan).

Beşinci vəziyyət büdcəni aşır — 2² = 4 < 5 — ona görə **3 bit** lazımdır, bu da 2³ = 8 vəziyyət verir, üç kombinasiya isə istifadəsiz qalır. Bit-lər ehtiyacınız qeyri-tam olsa belə tam ədədlər şəklinde gəlir; bu "2-nin növbəti qüvvətinə yuvarlama" nümunəsi (rəsmi olaraq ⌈log₂ n⌉) kurs boyu sizi izləyəcək — şəbəkə masklarından verilənlər bazası səhifələrinə qədər.

</Solution>

#### Dürüst yükləmə müddəti {/*the-honest-download-estimate*/}

Bağlantınız 50 Mbps-dir. 3 GB-lıq oyun yeniləməsi təxminən nə qədər çəkir? Yalnız cavabı deyil, əsaslandırmanı göstərin.

<Solution>

Əvvəlcə bit-i byte-a çevirin: 50 Mbps ÷ 8 = **6.25 MB/s**. Sonra 3 GB ≈ 3,000 MB, və 3,000 ÷ 6.25 = **480 saniyə = 8 dəqiqə**.

Mbps-i "MB per saniyə" kimi oxusaydınız, 1 dəqiqə vəd edərdiniz — tam olaraq *b* ilə *B* arasındakı 8 fərq qədər yanılmış olardınız. Yükləmə "reklamda deyildiyi ilə müqayisədə 8× yavaş" hiss olunanda, bu adətən oğurluq deyil — sadəcə ölçü vahidləridir.

</Solution>

#### Real bir hex dump oxuyun {/*read-a-real-hex-dump*/}

Bir həmkar sizə bu terminal çıxışını göndərir və faylda nə olduğunu soruşur:

<TerminalBlock>

00000000: 4869 21                                  Hi!

</TerminalBlock>

Dump sağ tərəfdə mətni faydalı şəkildə göstərir — lakin üç byte `48 69 21`-in nə olduğunu izah edin, eyni üç byte-ın niyə məşrui olaraq mətndən başqa bir şey ola biləcəyini əsaslandırın.

<Solution>

ASCII mətn müqaviləsi altında, `48` → 72 → `H`, `69` → 105 → `i`, `21` → 33 → `!` — fayl "Hi!" deyir. (Növbəti dərsdə `48` kimi hex-i özünüz çevirməyi öyrənəcəksiniz; hələlik alətə güvənin.)

Lakin byte-lar "biz mətniyik" elan edən heç bir işarə daşımır. Üç ayrı rəqəm kimi oxusanız 72, 105, 33-dür; şəkil hissəsi kimi oxusanız pixel məlumatı olardı; maşın kodu kimi oxusanız bir proqram parçası belə ola bilər. Dump-un sağ sütunu *alətin* mətn müqaviləsindən istifadə edərək etdiyi *təxmindir* — bir rahatlıq, byte-ların xüsusiyyəti deyil. Dərsin əsas açarı real həyatda: məna faylda deyil, oxumada yaşayır.

</Solution>

#### Dəstək bileti: itən gigabaytlar {/*support-ticket-the-missing-gigabytes*/}

Bir dost mesaj atır: "512 GB telefon aldım, parametrlərdə 476 GB yazır. Aldatdılarımı? Geri qaytarayımmı?" İki cümlə ilə cavab verin — texniki cəhətdən düzgün, jarqon yığını olmadan.

<Solution>

Nümunə cavab: "Aldatmadılar — istehsalçı 512 GB-ı 512 milyard byte kimi sayır, telefon isə 2³⁰ byte-dan ibarət binary gigabaytlarla ölçür, 512 × 10⁹ ÷ 2³⁰ ≈ 476-dır. Bütün yaddaş oradadır; sadəcə iki sənaye eyni söz üçün iki cüzi fərqli vahid istifadə edir."

Yoxlama: 512,000,000,000 ÷ 1,073,741,824 ≈ 476.8 ✓. (Köçürülə bilən bacarıq: yaddaş rəqəmləri təxminən 7% fərq edəndə, oğurluqdan şübhə etməzdən əvvəl iki kilonu şübhə altına alın.)

</Solution>

</Challenges>

<LearnMore title="İkilik Say Sistemi" path="/learn/faza-0/modul-0-1/binary-number-system">

İndi 8 açarı çevirib rəqəm düzəldə bilirsiniz — növbəti addım binary-i axıcı şəkildə *oxumaq və yazmaq*, hexadecimal ilə tanışlıq (hex dump-dakı `48 69` nəhayət mənalı olacaq), və Pac-Man, YouTube həm Boeing 787-nin sayğacları tavana çatdıqda nə baş verdiyini öyrənmək.

</LearnMore>
