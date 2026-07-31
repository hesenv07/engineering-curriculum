---
title: "RAM Necə İşləyir"
---

<Intro>

1966-cı ildə, IBM-in Nyu-Yorkdakı tədqiqat mərkəzində, Robert Dennard adlı bir mühəndis hamının baha yolla həll etdiyi bir problem üzərində işləyirdi. O dövrdə yaddaş (memory) hər bir bit üçün altı transistor tələb edən sxemlərdən qurulurdu — etibarlı, sürətli, amma kütləvi istehsal üçün həddindən artıq bahalı. Dennard-ın fikri demək olar ki, hər şeyi atmaq idi. Biti kiçik bir kondensatorda **elektrik yükünün gölməçəsi** kimi saxla və onu **bir** transistorla qoru. Altı komponent əvəzinə iki. Problem aydın idi və çoxlarına görə bu, ideyanı diskvalifikasiya edirdi: bu qədər kiçik kondensatorlar sızır. Yük bir neçə millisaniyə ərzində boşalır, ona görə yaddaş hər şeyi unudur, əgər nəsə davamlı olaraq hər biti oxuyub yenidən yazmasa. Dennard-ın cavabı əslində *qoy unutsun, sonra təzələ (refresh)* idi — və məhz bu absurd görünən mübadilə kompüterinizdə meqabaytlar əvəzinə qiqabaytlarla yaddaş olmasının səbəbidir. (Ad tanış gəlirsə, təəccüblü deyil: bu, səkkiz il sonra öz miqyaslama (scaling) qaydası ilə kompüterlərə otuz il pulsuz sürət qazandıran həmin Robert Dennard-dır.) Bu dərs bir yaddaş çipini açır və ondan çıxan bir bayt izləyir.

</Intro>

<YouWillLearn>

- RAM-ın bir biti fiziki olaraq necə saxlanılır və niyə məhz iki komponent tələb olunur
- Niyə yaddaş saniyədə minlərlə dəfə **təzələnməlidir (refresh)** və bunun qiyməti nədir
- Niyə bir bayt oxumaq bütöv bir **sətri (row)** açmaq deməkdir — və bunu prosesdə məhv etmək
- Niyə eyni sətrə ikinci müraciət birincidən dəfələrlə ucuz olur
- `DDR4-3200 CL16` nə deməkdir, nanosaniyələrə tərcümə olunmuş
- Niyə yaddaşın **bant genişliyi (bandwidth)** çox artıb, amma **gecikmə (latency)** demək olar ki, yerində qalıb

</YouWillLearn>

<InlineToc />

## Bir bit, iki komponent {/*one-bit-two-components*/}

Ən kiçik miqyasdan başlayaq: istifadə etdiyiniz kompüterin əsas yaddaşında bir bit.

<Diagram name="how-ram-works/dram_cell" height={420} width={720} alt="'RAM-ın bir biti: bir açar və bir vedrə' adlı diaqram. Solda, 'DRAM — əsas yaddaş' etiketli mavi paneldə üfüqi sətir xətti, aşağı düşən şaquli məftil bağlı açara ('1 transistor') gedir, onun altında isə kondensator simvolu ('1 kondensator') 'dolu = 1' və 'boş = 0' qeydləri ilə göstərilir; panelin altında 'hər bit üçün iki komponent' yazısı var. Sağda, 'SRAM — keş (cache)' etiketli qırmızı paneldə hər biri T ilə işarələnmiş altı kiçik qutu var, altında 'hər bit üçün altı transistor' yazısı. Qeydlər: bu nisbət sizdə birinin qiqabaytlarla, digərinin isə kilobaytlarla olmasının səbəbidir; DRAM hüceyrəsi 1966-cı ildə IBM-də Robert Dennard tərəfindən icad edilib — kompüterlərə otuz il pulsuz sürət qazandıran miqyaslama (scaling) qaydasının müəllifi olan həmin Dennard.">

İki komponent altıya qarşı. Bu nisbət bütün iyerarxiyanın formasını müəyyən etdi.

</Diagram>

Bir **DRAM hüceyrəsi (cell)** — əsas yaddaşın bir biti — kondensator və transistordan ibarətdir.

**Kondensator** saxlama vasitəsidir. Kondensator elektrik yükü saxlayır, və burada ya 1 sayılacaq qədər yük saxlayır, ya da demək olar ki, heç nə saxlamır ki, bu da 0 sayılır. Bit dediyimiz elə budur: az miqdarda elektrik enerjisinin olması və ya olmaması.

**Transistor** isə qapıdır (gate), və bu, elə Modul 0.2-də gördüyünüz açardır — sapı başqa bir məftil olan açar. O, kondensatoru xarici dünya ilə yalnız o zaman birləşdirir ki, ondan keçən *sətir xətti (row line)* enerjiləndirilsin. Qalan vaxtlarda isə onu izolyasiya edir ki, yük rahat otursun.

İndi bunu CPU-nun içindəki yaddaşla müqayisə edin. **SRAM hüceyrəsi** — keşlərin (cache) qurulduğu material — adətən öz vəziyyətini saxlayan dövrədə düzülmüş **altı transistor** tələb edir, bu, saat (clock) dərsində gördüyünüz çarpaz-bağlı (cross-coupled) düzülüşdür. O daha sürətlidir, enerji olduğu müddətcə heç vaxt unutmur, amma üç dəfə çox komponent və xeyli daha çox sahə tələb edir.

Bu nisbət yaddaş iyerarxiyasının məhz bu formada olmasının əsas səbəbidir. Bit başına üç dəfə çox komponent, üstəgəl daha mürəkkəb düzülüş, birlikdə bayt başına təxminən yüz dəfə fərqli qiymətə səbəb olur — buna görə maşınınızda 16 qiqabayt L1 əvəzinə 32 kilobayt L1 və 16 qiqabayt RAM var.

<Note>

Adlar dəqiqləşdirilməyə dəyər, çünki tez-tez sərbəst istifadə olunurlar.

- **DRAM** — *Dynamic* Random Access Memory (dinamik təsadüfi əlçatımlı yaddaş). "Dinamik", çünki unudur və davamlı olaraq təzələnməlidir (refresh). Bu, əsas yaddaşdır: ana plataya taxılan lövhələr.
- **SRAM** — *Static* Random Access Memory (statik təsadüfi əlçatımlı yaddaş). "Statik", çünki enerji verildiyi müddətcə öz dəyərini saxlayır. Bu, CPU keşlərinin (cache) qurulduğu materialdır.
- Hər iki addakı **Random Access (təsadüfi əlçatım)** tarixi bir fərqdir və o deməkdir ki, siz hər hansı ünvana ondan əvvəlkilərin hamısından keçmədən birbaşa müraciət edə bilərsiniz — bu termin yaranan zaman alternativ olan maqnit lentinin (tape) əksinə olaraq.

</Note>

## Vedrə sızır {/*the-bucket-leaks*/}

Bir bitin yük gölməçəsi kimi saxlanılmasının problemi budur. Bu qədər kiçik kondensatorlar mükəmməl qab deyil, onları qoruyan transistor da mükəmməl izolyator deyil. Yük qaçır.

<Diagram name="how-ram-works/leaky_capacitor" height={400} width={720} alt="'vedrədə deşik var' adlı diaqram, soldan sağa azalan yük səviyyəsini göstərən şaquli çubuqlarla dörd qutu göstərir. Mərhələlər: 'az əvvəl yazılıb' — dolu mavi çubuq, 'aydın 1' qeydi; 'bir az sonra' — təxminən dörddə üç, 'hələ oxuna bilir'; 'daha sonra' — yarıdan az, qırmızı, 'artıq şübhəli'; 'artıq gec' — demək olar boş, qırmızı, '0-dan fərqlənmir'. Boz oxlar mərhələləri birləşdirir. Aşağıda mavi qutuda: buna görə hər sətir dəfələrlə oxunub geri yazılır, sonsuz olaraq — hər sətir son təzələnmədən (refresh) sonra 64 millisaniyə ərzində yenidən təzələnməlidir — bu da DRAM-dakı D hərfinin mənbəyidir: dinamik. Son qeyd: keş yaddaşına (cache) bu lazım deyil, çünki altı transistor enerji olduqca öz vəziyyətini özü saxlayır.">

Bitin sönməsi. Heç nə sınmır — texnologiya belə işləyir.

</Diagram>

Dörd mərhələni izləyin. Yazıldıqdan dərhal sonra kondensator rahatlıqla doludur və birmənalı 1 kimi oxunur. Yük boşaldıqca "1" ilə "0" arasındakı fərq azalır. Nəhayət, onları fərqləndirmək üçün kifayət qədər yük qalmır və bit sadəcə yox olur.

Həll qabaqcadan bəllidir: **hər bit sönmədən əvvəl oxunmalı və geri yazılmalıdır**. DDR standartları hər sətrin son təzələnmədən sonra **64 millisaniyə** ərzində yenidən təzələnməsini tələb edir. Bu son müddəti qaçırsanız, məlumat itir — incə şəkildə korlanmır, sadəcə yox olur.

Bu, DRAM-dakı **D** hərfinin mənasıdır: **dynamic (dinamik)**, yəni mövcud olmaq üçün daimi qulluğa ehtiyacı olması. SRAM isə *static (statik)*dir, çünki altı-transistorlu dövrə öz vəziyyətini aktiv şəkildə saxlayır və heç bir belə diqqətə ehtiyacı yoxdur.

Bunun nə qədər qəribə olduğunu qeyd etmək dəyər. Kompüterinizin yaddaşı, elə indi, hər çipin hər sətri üçün saniyədə minlərlə dəfə davamlı unutma və xatırlatma dövründədir. Məlumat sizə sabit görünür, çünki xatırlatma heç dayanmır.

## Ev təsərrüfatı hesabı {/*the-housekeeping-bill*/}

Təzələmə (refresh) pulsuz deyil, və hesablama kifayət qədər sadədir:

<Diagram name="how-ram-works/refresh_cost" height={380} width={720} alt="'ev təsərrüfatı hesabı' adlı diaqram. 0 ms-dən 64 ms-ə qədər üfüqi zaman xətti, qırx bir sıx yerləşdirilmiş qırmızı işarə ilə, 'hər işarə bir təzələmə (refresh) əmridir' qeydi ilə. Altında: 64 ms-lik pəncərəyə onlardan 8,192 sığır — hər 7.8 mikrosaniyədə bir. Dörd etiketli sətir izləyir: təzələmə nə edir — bütöv bir sətri oxuyub dərhal geri yazır; bu sizə nəyə başa gəlir — həmin bank bu zaman real sorğuya cavab verə bilmir; niyə heç vaxt hiss etmirsiniz — vaxtın kiçik bir hissəsidir və nəzarətçi (controller) bunu gizlədir; nə vaxt hiss edərsiniz — istilikdə: təzələmə boş RAM-ın belə enerji istifadə etməsinin səbəbidir. Qeyd: yaddaş çipi ömrünün bir hissəsini artıq bildiyini xatırlamağa sərf edir.">

Heç nə istehsal etməyən iş, sonsuz olaraq görülür ki, heç nə itməsin.

</Diagram>

```
 hər sətir 64 ms ərzində yenidən təzələnməlidir     64 ms
 bu pəncərədə verilən təzələmə əmrləri               8,192
 deməli, hər 64 / 8,192 ms = 7.8 us-də bir əmr
```

Hər 7.8 mikrosaniyədə yaddaş nəzarətçisi (memory controller) nə edirdisə dayandırır və təzələmə əmri göndərir. Hər biri çipin bir hissəsinin sətri oxuyub dərhal geri yazmasına səbəb olur — real iş, heç nə istehsal etmir, sadəcə məlumatın buxarlanmasının qarşısını almaq üçün.

Bilinməli üç nəticə:

- **Təzələnən bank sorğulara xidmət edə bilmir.** Qısa bir müddət ərzində yaddaşınızın bir hissəsi xatırlamaqla məşğul olur və əlçatan deyil. Nəzarətçi bunun ətrafında planlaşdırır, bu da yaddaş gecikməsinin (latency) niyə sabit deyil, dəyişkən olmasının səbəblərindən biridir.
- **Bunu heç vaxt profilerdə görməyəcəksiniz.** Bu, mövcud vaxtın kiçik bir faizidir və yaddaş alt sistemi içində gizlədilib, proqram təminatının müşahidə edə biləcəyindən aşağıda.
- **Davamlı olaraq enerji xərcləyir.** Buna görə maşın heç nə etmədiyi zaman belə RAM enerji çəkir, və noutbukların boşdaykən yaddaşı azaltmağa bu qədər çalışmasının bir səbəbi budur. Tamamilə boş DRAM çipi hələ də işləyir.

## Hüceyrələr bir şəbəkə (grid) təşkil edir {/*the-cells-are-a-grid*/}

Tək bir hüceyrənin özü çox işə yaramır. Bir yaddaş çipində milyardlarla hüceyrə var, və onların necə düzüldüyü yaddaşın davranışının hər cəhətini müəyyən edir.

Onlar **şəbəkə (grid)** — sətirlər (rows) və sütunlar (columns) şəklində düzülür:

<Diagram name="how-ram-works/dram_array" height={420} width={720} alt="'hüceyrələr şəbəkə (grid) şəklində düzülür' adlı diaqram, kiçik boş kvadratlardan ibarət on-a-on hüceyrə şəbəkəsini göstərir. Bir üfüqi sətir mavi rəngdə vurğulanıb və 'sətir (row)' adlanır; bir şaquli sütun qırmızı rəngdə vurğulanıb və 'sütun (column)' adlanır. Kəsişdikləri yerdə tünd nöqtə var, 'istədiyiniz bit' işarəli. Soldakı mətn ünvanın ikiyə bölündüyünü izah edir: hansı sətir, hansı sütun. Qeyd: real bir sətir təxminən 1-2 kilobayt saxlayır — minlərlə bit yan-yana.">

Bit başına bir məftil əvəzinə, sətir başına bir məftil və sütun başına bir məftil.

</Diagram>

Hər hüceyrə bir sətir xətti ilə bir sütun xəttinin kəsişdiyi nöqtədə yerləşir, və ünvan iki hissəyə bölünür: **hansı sətir**, **hansı sütun**.

Bu şəbəkə düzülüşü elə həmin səbəbdən mövcuddur ki, keş (cache) hər şeyi axtarmaq əvəzinə setlərdən (sets) istifadə edirdi: naqilləmə (wiring). Milyardlarla hüceyrəsi olan bir çip hər birinə ayrıca məftil çəkə bilməz. Şəbəkəyə isə sadəcə sətir başına bir, sütun başına bir məftil lazımdır — bir milyon hüceyrə üçün bir milyon məftil əvəzinə iki min məftil.

Sətrin ölçüsü sonrakı hər şey üçün böyük əhəmiyyət daşıyır. Real bir DRAM sətri təxminən **1-2 kilobayt** saxlayır — bir sətir xəttini paylaşan yan-yana minlərlə bit.

<Note>

Əvvəlcədən aydınlaşdırılmalı çaşdırıcı bir ad: DRAM sətri bəzən **DRAM page (səhifə)** adlanır ki, bu, virtual yaddaşın istifadə etdiyi 4 KB **memory page (yaddaş səhifəsi)** ilə heç bir əlaqəsi yoxdur. Onlar müxtəlif ölçülərdə, sistemin müxtəlif hissələri tərəfindən, müxtəlif səbəblərdən idarə olunur.

Bu dərs boyu **sətir (row)** termini istifadə olunur və çipin içindəki fiziki hüceyrə xəttini bildirir.

</Note>

## Oxumaq oxuduğunu məhv edir {/*reading-destroys-what-it-reads*/}

İndi yaddaşın əcaib davranışının çoxunu izah edən hissə. DRAM-dan bir bayt almaq bir əməliyyat deyil — dörddür, və üçüncüsü sizin istədiyiniz yeganə şeydir.

<Diagram name="how-ram-works/row_activate" height={460} width={720} alt="'bir bayt oxumaq dörd addım tələb edir və bir sətri məhv edir' adlı diaqram, dörd üst-üstə düzülmüş etiketli panel göstərir. 1. ACTIVATE — istədiyiniz sətri açın: bütün sətrin yükləri hiss (sense) xətlərinə tökülür. 2. SENSE — tökülənləri gücləndirin: kiçik yüklər sətir buferində (row buffer) təmiz 1-lərə və 0-lara çevrilir. 3. READ — sütununuzu götürün: yalnız indi istədiyiniz bayt çıxır. 4. PRECHARGE — sətri geri yazın: oxumaq kondensatorları boşaltdı, ona görə bərpa edilməlidirlər. İlk iki panel mavi, üçüncü tünd, dördüncü qırmızıdır. Qeydlər: 4-cü addım təəccüblü olanıdır — DRAM oxuma məhvedicidir, ona görə hər oxuma əslində bütöv bir sətrin oxunub yenidən yazılmasıdır; və bu, açıq bir sətrin, bir dəfə açılandan sonra, təkrar oxumaq üçün ucuz olmasının səbəbidir.">

Dörd addım, onlardan yalnız üçüncüsü sizin istədiyinizdir.

</Diagram>

**1-ci addım — ACTIVATE.** Nəzarətçi (controller) baytınızı ehtiva edən sətrin sətir xəttini enerjiləndirir. O sətir boyunca hər transistor bir anda açılır və **sətirdəki hər kondensatoru** öz sütun xəttinə birləşdirir. Minlərlə bit birlikdə buraxılır, çünki yalnız birini açmağın yolu yoxdur.

**2-ci addım — SENSE.** Çıxan siqnal çox kiçikdir — bir neçə on nanometr enində olan kondensatorun yükü, nisbətən uzun məftilə yayılır. *Sense amplifier* (hiss gücləndiricisi) adlanan sxemlər bu zəif fərqləri aşkarlayır və onları təmiz rəqəmsal dəyərlərə çevirir. Nəticə **row buffer (sətir buferi)**-də saxlanılır: bütöv sətri saxlayan, düzgün oxuna bilən sürətli yaddaş zolağı.

**3-cü addım — READ.** İndi, nəhayət, ünvanın sütun hissəsi sətir buferindən baytınızı seçir və göndərir. Bu, spesifikasiya vərəqində adı olan addımdır və dördü arasında ən qısasıdır.

**4-cü addım — PRECHARGE.** Və burada təəccüblü hissə gəlir. DRAM hüceyrəsini oxumaq **kondensatoru boşaldır** — yük aşkarlanmaq üçün getməli idi. Sətrin məlumatı artıq yalnız sətir buferində mövcuddur, ona görə çip başqa sətir aça bilməzdən əvvəl **bütöv sətri geri yazmalıdır** — buferindən kondensatorlara.

Yəni DRAM oxuması *destructive (məhvedici)*dir, və hər oxuma gizli şəkildə təxminən bir kilobaytlıq oxu-və-yenidən-yaz əməliyyatıdır. Bu, fəlakət kimi səslənir və faktiki olaraq bir imkana çevrilir.

## Artıq açıq olan sətir {/*the-row-that-is-already-open*/}

Bu dörd addıma yenidən baxın və soruşun: istədiyiniz sətir *artıq sətir buferində* olarsa, hansılarını atlaya bilərsiniz?

1, 2 və 4-cü addımlar — hamısı. Yalnız 3-cü addım qalır.

<Diagram name="how-ram-works/row_buffer" height={420} width={720} alt="'artıq açıq olan sətir' adlı diaqram, iki panel göstərir. Sol mavi panel, 'eyni sətir yenidən — sətir buferi vurğusu (hit)' başlığı ilə: sətir artıq hiss edilib (sensed), sadəcə fərqli sütun seçin, nə activate nə də precharge lazımdır; altında böyük qutu 'sürətli' yazır, 'ardıcıl müraciət dəfələrlə buraya düşür' qeydi ilə. Sağ qırmızı panel, 'fərqli sətir — sətir buferi buraxılışı (miss)' başlığı ilə: əvvəlcə açıq sətri bağlayın, yenisini activate edin, sonra hiss edib oxuyun; altında qutu 'yavaş' yazır, 'təsadüfi müraciət hər dəfə buraya düşür' qeydi ilə. Qeyd: yenidən keş xətti (cache line) arqumenti, bir səviyyə aşağıda — yaddaş bir-birinə yaxın olan şeyləri sorğulayanı mükafatlandırır.">

Eyni sorğu, iki dəfə, çox fərqli qiymətlərlə — yalnız ondan əvvəl nə olduğundan asılı olaraq.

</Diagram>

Bu, **row buffer hit (sətir buferi vurğusu)**dur və miss-dən (buraxılış) dəfələrlə ucuzdur. Baha başa gələn mexanizm artıq işləyib; siz sadəcə artıq gücləndirilib gözləyən bir kilobaytdan fərqli bir sütun seçirsiniz.

**Row buffer miss (sətir buferi buraxılışı)** — fərqli bir sətirdə ünvan istəmək — tam ardıcıllığın qiymətinə başa gəlir: hazırkı sətri bağla (precharge), yenisini aç (activate), hiss et (sense), yalnız sonra oxu.

Və indi tanış gələcək praktiki nəticə:

- **Ardıcıl müraciət (sequential access)** bir sətir boyunca gedir, sətir buferinə dəfələrlə dəyir. Bir bahalı activate yüzlərlə ucuz oxumaya xidmət edir.
- **Təsadüfi müraciət (random access)** demək olar ki, hər dəfə fərqli bir sətrə düşür, hər tək müraciətdə tam dörd-addımlı qiyməti ödəyir.

Bu, əvvəlki moduldan olan keş xətti (cache line) arqumentinin eynidir, bir səviyyə aşağıda. Keş sizi qonşu baytlar haqqında soruşduğunuz üçün mükafatlandırır, çünki bir dəfəyə 64 bayt köçürür; yaddaş isə eyni davranışa görə mükafatlandırır, çünki *bir dəfəyə bir kilobayt açır*. Fərqli miqyaslarda iki müstəqil mexanizm, eyni istiqamətdə itələyir: **bir-birinə yaxın olan şeylər birlikdə əldə etmək üçün ucuzdur**.

Bu, həm də əvvəlki dərsin ölçdüyü, amma izah etmədiyi bir şeyi izah edir. Yaddaşı sıra ilə gəzmək təxminən 2 ns-lik müraciət başına sabit qaldığında, verilənlərin ölçüsündən asılı olmayaraq, bunun bir hissəsi prefetcher-dən (əvvəlcədən yükləyicidən) idi — bir hissəsi isə ardıcıl gəzintinin eyni açıq sətrə dəfələrlə dəyməsindən.

## Lövhədəki rəqəmlər nə deməkdir {/*what-the-numbers-mean*/}

Yaddaş modulu `DDR4-3200 CL16` kimi bir etiketlə satılır. Bunun hər hissəsi indi açıqlana bilər.

<Diagram name="how-ram-works/module_numbers" height={440} width={720} alt="'yaddaş lövhəsindəki rəqəmlər nə deməkdir' adlı diaqram, yuxarıda böyük monospace şriftlə DDR4-3200 CL16 etiketini göstərir. Üç izahlı sətir: DDR — Double Data Rate (İkiqat Verilənlər Sürəti) deməkdir, saatın (clock) hər iki qırağında məlumat köçürür; 3200 — saniyədə 3,200 milyon transfer deməkdir, deməli saat 1,600 MHz-dir; CL16 — sütun sorğusundan məlumatın alınmasına qədər 16 saat dövrü (clock cycle) deməkdir. 'CL16-nı real vaxta çevirmək' başlıqlı mavi qutu göstərir: saat 1,600 MHz olarsa bir dövr 0.625 ns edir, 16 dövr vurulsun 0.625 ns bərabərdir 10.0 ns. Aşağıda qırmızı qutu: amma bu maşında real təsadüfi müraciət 156 ns ölçülüb, çünki CL yalnız son addımdır — üstünə sətir activate, precharge, ünvan tərcüməsi, yaddaş nəzarətçisinin növbəsi və bus üzərindən gedən yol əlavə olunmalıdır; CL16, 16 ns yaddaş demək deyil. Son qeyd: pik bant genişliyi daha asandır: 3,200 MT/s vurulsun 8 bayt bərabərdir 25.6 GB/s hər kanal üçün.">

Etiketin hər hissəsi açıqlanıb, məhsulu daha yaxşı göstərən hissə də daxil olmaqla.

</Diagram>

**DDR**, *Double Data Rate (İkiqat Verilənlər Sürəti)* deməkdir: modul saatının (clock) həm yüksələn, həm də enən qırağında məlumat köçürür, deməli hər saat dövründə (clock cycle) bir yerinə iki hissə köçürür. Buna görə əsas rəqəm həmişə real saat tezliyindən iki dəfə böyükdür.

**3200**, adətən deyildiyi kimi meqahertz deyil. Bu, saniyədə **3,200 milyon transfer**dir — deməli real saat **1,600 MHz**-dir.

**CL16**, *CAS latency (CAS gecikməsi)*dir: nəzarətçinin (controller) sütun soruşmasından məlumatın çıxmasına qədər olan saat dövrlərinin sayı. Çevirin:

```
 saat              1,600 MHz
 bir dövr          1 / 1,600,000,000 s  =  0.625 ns
 CL16              16 × 0.625 ns        =  10.0 ns
```

On nanosaniyə. Bu isə həqiqətən faydalı bir şübhəçiliyə gətirib çıxarır, çünki əvvəlki dərs bu maşında təsadüfi yaddaş müraciətini **156 nanosaniyə** ölçdü — bu rəqəmdən on beş dəfə çox.

Hər iki rəqəm doğrudur. `CL16` yalnız **3-cü addımı** — artıq açıq olan sətirdən oxumağı — təsvir edir. Real təsadüfi müraciət həmçinin bunlara görə ödəyir:

- əvvəl açıq olan sətrin **precharge**-i,
- yeni sətrin **activate**-i və **sense**-i,
- **address translation (ünvan tərcüməsi)**, proqramınızın istifadə etdiyi ünvanı fiziki ünvana çevirmək,
- yaddaş nəzarətçisi (memory controller) daxilində digər sorğuların və təzələmələrin (refresh) arxasında **növbə**yə düşmək,
- və CPU-dan çıxıb, plata boyunca gedib, geri qayıtmaq **yolu**.

Deməli, `CL16` 16 nanosaniyəlik yaddaş vədi deyil. Bu, daha uzun bir yolun bir komponentidir, və marketinq şöbəsinin ən asanlıqla yaxşı göstərə biləcəyi komponentdir.

Bant genişliyi (bandwidth) isə, əksinə, sadə və dürüstdür:

```
 3,200 MT/s × hər transferə 8 bayt  =  25.6 GB/s hər kanal üçün
```

## Yaddaş necə sürətli oldu, amma tez olmadı {/*fast-without-getting-quick*/}

Bu isə aydın bir sual doğurur. Əgər tək bir yaddaş müraciəti hələ də təxminən yüz nanosaniyə çəkirsə, müasir maşınlar necə saniyədə onlarla qiqabayt köçürə bilir?

Çoxlu müraciəti **eyni zamanda** yerinə yetirməklə.

<Diagram name="how-ram-works/banks_and_channels" height={420} width={720} alt="'yaddaş necə sürətli olur, amma tez olmur' adlı diaqram, 'bir müraciət yavaşdır, ona görə çoxunu eyni vaxtda et' altyazısı ilə. Solda, mavi panel 'banklar (banks)' başlığı ilə b0-dan b7-ə qədər səkkiz kiçik qutu ehtiva edir, 'hər birinin öz sətir buferi var, deməli eyni anda səkkiz sətir açıq ola bilər' qeydi ilə. Sağda, qırmızı panel 'kanallar (channels)' başlığı ilə channel 0 və channel 1 kimi iki böyük qutu ehtiva edir, 'CPU-ya ayrı yollar — iki kanal, iki dəfə bant genişliyi' qeydi ilə. Altında boz qutu: deməli, tək bir müraciət hələ də təxminən 100 nanosaniyə çəkir, amma onlarla belə müraciət eyni anda uçuşda ola bilər, buna görə bant genişliyi (bandwidth) saniyədə qiqabaytla ölçülür. Qeyd: bu, pipelining (kəmərləmə) dərsi ilə eyni fərqdir: gecikmə (latency) bir şeyin nə qədər çəkdiyidir, məhsuldarlıq (throughput) isə saniyədə nə qədərinin bitdiyi — yaddaş bunlardan yalnız birini yaxşılaşdırdı.">

Burada heç nə tək bir müraciəti sürətləndirmir. Çoxlu müraciətin üst-üstə düşməsini təmin edir.

</Diagram>

**Banklar (banks)** çipi müstəqil hissələrə bölür, hər birinin öz sətir buferi var. Səkkiz bank o deməkdir ki, eyni anda səkkiz sətir açıq ola bilər, bir bank sətir activate edərkən, digəri oxuya, üçüncüsü isə təzələnə (refresh) bilər. Yavaş dörd-addımlı ardıcıllıq hələ də özünə lazım olan vaxtı çəkir — amma bir neçə ardıcıllıq üst-üstə düşür.

**Kanallar (channels)** CPU ilə yaddaş arasında ayrı fiziki yollardır. İkiqat kanallı (dual-channel) sistemin ikisi var, deməli eyni anda iki dəfə çox məlumat köçürə bilər. Buna görə yaddaş adətən cütlərlə satılır, və buna görə iki əvəzinə bir lövhə taxmaq tutum eyni olsa belə maşını nəzərəçarpacaq dərəcədə yavaşlada bilər.

Bu naxış tanış gəlirsə, tanış olmalıdır: bu, Modul 0.3-dən olan **pipelining (kəmərləmə)**nin yaddaşa tətbiqidir. Gecikmə (latency) bir əməliyyatın nə qədər çəkdiyidir; məhsuldarlıq (throughput) isə saniyədə nə qədərinin bitdiyidir. Əməliyyatların üst-üstə düşməsi ikincini yaxşılaşdırır və birincisi üçün heç nə etmir.

Bu isə üç onillik yaddaş inkişafı boyunca məhz baş verən şeydir.

## Ölçülmüş: müraciətlər arasındakı boşluq {/*measured-the-gap*/}

Bütün bunları bir ölçmədə görmək vaxtıdır. Budur, 512 meqabayt — istənilən keşdən (cache) çox böyük — boyunca gəzən, hər *N* bayt üçün bir bayt oxuyan proqram, *N* 4-dən 65,536-ya qədər böyüyür:

<Diagram name="how-ram-works/stride_measured" height={440} width={720} alt="'ölçülmüş: 512 MB-ı böyüyən boşluqla gəzmək' adlı xətt qrafiki. Üfüqi ox loqarifmik miqyasda 4 B-dən 64 KB-ə qədər addımı (stride) göstərir; şaquli ox təxminən 1-dən 27-yə qədər müraciət başına nanosaniyəni göstərir. Mavi xətt 4 baytlıq addımda 2.04 ns-dən başlayır, 32 baytda 3.15 ns-ə çatır, 64 baytda 6.12 ns-ə və 128 baytda 10.19 ns-ə tullanır, sonra orta addımlar boyunca 11-13 ns ətrafında düzləşir, sonra 64 KB-də 25.44 ns-ə qədər yenidən qalxır. İki şaquli kəsik xətt 'bir keş xətti (cache line)'-ni 64 baytda, 'bir səhifə (page)'-ni isə 4096 baytda işarələyir. Qeydlər: '16 oxuma bir xətti bölüşür', 'xətt başına bir oxuma', 'prefetcher təslim olur'. Yazılar: 32-baytlıq boşluqda 3.15 ns, 64-də 6.12 ns — qiymət düz o nöqtədə ikiqat artır ki, orada hər müraciət üçün ikinci keş xətti lazım olur; sonra prefetcher, sətir buferi və ünvan tərcümə cədvəllərinin hər biri növbə ilə faydasını itirdikcə yavaş bir yüksəliş.">

512 MB üzərində real ölçmələr. Xəttin hər əyilməsi fərqli bir mexanizmin təslim olmasıdır.

</Diagram>

<TerminalBlock>

./stride

   addım (stride)    ns/müraciət
      4 B       2.04 ns
     16 B       2.41 ns
     32 B       3.15 ns
     64 B       6.12 ns
    128 B      10.19 ns
    256 B      11.46 ns
   1024 B      11.85 ns
   4096 B      15.58 ns
  16384 B      19.26 ns
  65536 B      25.44 ns

</TerminalBlock>

Bu əyriyə soldan sağa baxın, bütün yaddaş sistemini izah edir:

**4-dən 32 bayta qədər** — bir neçə müraciət bir 64-baytlıq keş xəttini (cache line) bölüşür, ona görə müraciət başına qiymət çox kiçikdir. 4-baytlıq addımda on altı oxuma tək bir xəttdən çıxır.

**32-dən 64 bayta qədər** — qiymət təxminən ikiqat artır, 3.15-dən 6.12 ns-ə. Bu, keş xətti sərhədidir, açıq bir addım kimi görünür: 32-baytlıq addımda hər iki müraciətə bir yeni xətt lazımdır; 64-də isə hər müraciətə bir.

**64-dən 2048 bayta qədər** — 11-13 ns ətrafında bir düzlük. Hər müraciətə yeni keş xətti lazımdır, amma naxış tamamilə müntəzəmdir, ona görə **prefetcher (əvvəlcədən yükləyici)** ondan qabaqda qalır və sətir buferi təkrar istifadə olunmağa davam edir. Yaddaş sistemi çox işləyir və bunu çox yaxşı gizlədir.

**4096 baytdan sonra** — yüksəliş yenidən başlayır. Burada bir neçə şey eyni vaxtda təslim olur: bu qədər böyük addımlar yaddaş **səhifələrini (pages)** keçməyə başlayır ki, bu da ünvan tərcüməsini işə salır; prefetcher-in faydası azalır; və ardıcıl müraciətlər artıq eyni DRAM sətrinə düşmür.

Rəqəmlərin *göstərmədiyinə* diqqət edin: bu əyri heç vaxt tam təsadüfi müraciətin 156 ns-inə çatmır. Hətta 64 KB-lik addım belə hələ də **proqnozlaşdırıla bilən** bir naxışdır, və maşın buna hazırlaşa bilir. Tam gecikməyə (latency) çatmaq üçün proqnozlaşdırılabilirliyi tamamilə aradan qaldırmaq lazımdır — bu, əvvəlki dərsdəki göstərici qovğusunun (pointer chase) etdiyi şeydir.

Bu bütün dərsin praktiki xülasəsidir: **yaddaş yavaş və ya sürətli deyil. O, sizin gəldiyinizi görüb-görməməsindən asılı olaraq yavaş və ya sürətlidir.**

<DeepDive>

#### Bir rəqəm hərəkət etdi. Digəri hərəkət etmədi. {/*one-number-moved*/}

Dörd nəsil yaddaş, hər biri üçün spesifikasiya hesablaması edilmiş:

<Diagram name="how-ram-works/latency_vs_bandwidth" height={440} width={720} alt="'dörd nəsil yaddaş: bir rəqəm hərəkət etdi, digəri etmədi' adlı qrafik. Üfüqi ox DDR3-1600, DDR4-2400, DDR4-3200 və DDR5-6000-i sadalayır. 'bant genişliyi, GB/s' etiketli mavi xətt 12.8, 19.2, 25.6 və 48.0 dəyərləri boyunca kəskin yüksəlir. 'CAS gecikməsi, ns' etiketli qırmızı xətt 13.8, 14.2, 10.0 və 10.0 boyunca demək olar ki, düz qalır. Altında iki monospace sətir xülasə edir: bant genişliyi 12.8-dən 48.0 GB/s-ə, 3.8 dəfə; gecikmə 13.8-dən 10.0 ns-ə, 0.7 dəfə. Son qeyd: yolu genişləndirə bilərsiniz, amma onu asanlıqla qısalda bilməzsiniz.">

İki xətt, otuz il, və onlardan yalnız biri haradasa gedir.

</Diagram>

```
 etiket            saat       1 dövr     CAS gecikməsi   kanal başına pik
 DDR3-1600 CL11    800 MHz   1.250 ns      13.8 ns          12.8 GB/s
 DDR4-2400 CL17   1200 MHz   0.833 ns      14.2 ns          19.2 GB/s
 DDR4-3200 CL16   1600 MHz   0.625 ns      10.0 ns          25.6 GB/s
 DDR5-6000 CL30   3000 MHz   0.333 ns      10.0 ns          48.0 GB/s
```

Bu nəsillər boyunca nə baş verdiyinə baxın. **Bant genişliyi demək olar ki, dörd dəfə artdı.** **Gecikmə isə təxminən dörddə bir yaxşılaşdı** — və qeyd edin ki, CL 11-dən 30-a *qalxdı*, gecikmə isə nanosaniyələrlə demək olar ki, düz qaldı, çünki daha sürətli dövrlər və daha çox dövr bir-birini kompensasiya etdi.

Bu asimmetriya niyə? Çünki bant genişliyi və gecikmə fərqli şeylərlə məhdudlaşır.

Bant genişliyi **parallellik və siqnallaşma** məsələsidir: kanal əlavə et, bank əlavə et, bus-ı daha sürətli işlət, daha çox qırağa köçür. Bunların hamısı mühəndislik məsələləridir və mühəndislik həlləri var, dəfələrlə həll olunub.

Gecikmə isə **fizika və ardıcıllıq** məsələsidir. Kondensator müəyyən bir vaxtda məftilə boşalır. Sense amplifier zəif fərqi müəyyən bir vaxtda həll edir. Siqnal plata boyunca müəyyən bir vaxtda gedir. Bu addımlar ardıcıl baş verməlidir, və heç biri əlavə avadanlıq ilə çox sürətlənmir — asılı fiziki hadisələr ardıcıllığını paralelə çevirə bilməzsiniz.

Metafora bir yoldur. Zolaq əlavə edə bilərsiniz, saatlıq trafik xeyli artır. Yolu qısalda bilməzsiniz, ona görə tək bir səyahət həmişəki qədər çəkir.

Bu asimmetriya proqram təminatına dərindən təsir edib, və əvvəlki üç dərsdəki məsləhətin hər dəfə eyni formada təkrarlanmasının səbəbi budur. Məlumat *həcminə* ehtiyacı olan proqramlara otuz illik yaddaş inkişafı yaxşı xidmət göstərib. Bir göstəricini digərinin ardınca *qovan* proqramlara isə demək olar heç xidmət göstərilməyib — buna görə array (massiv) şəklində olan kod onilliklər boyu sakitcə göstərici (pointer) şəklində olan koddan nisbətən daha sürətli olub.

</DeepDive>

<DeepDive>

#### Ölçmədə səhifə sərhədi {/*the-page-boundary*/}

Addım (stride) əyrisinin bir xüsusiyyəti izahı tələb edir, çünki bu kursun hələ əhatə etmədiyi bir şeydən gəlir: 4096 baytlıq addımda 12.85-dən 15.58 ns-ə tullanış.

4096 bayt bir **yaddaş səhifəsinin (memory page)** ölçüsüdür, və bu, əməliyyat sisteminin yaddaşı idarə etdiyi vahiddir. Qrafikin bu hissəsini oxumaq üçün lazım olan minimum budur.

Proqramınızın istifadə etdiyi ünvanlar yaddaş çiplərinin istifadə etdiyi ünvanlar deyil. Proqramınız şəxsi, səliqəli bir **virtual ünvan sahəsi (virtual address space)** görür; aparat isə hər müraciəti yaddaşa çatmazdan əvvəl **fiziki ünvana (physical address)** çevirir. Tərcümə səhifə-səhifə edilir — bir cədvəl "virtual səhifə 12 fiziki səhifə 4,891-də yerləşir" deyir — və çox sayda səhifə var, ona görə cədvəlin özü yaddaşda yerləşir.

Bu isə fəlakət olardı: hər yaddaş müraciəti onu tərcümə etmək üçün əvvəlcə bir yaddaş müraciəti tələb edərdi. Ona görə tərcümələr üçün bir keş (cache) var, **TLB** (translation lookaside buffer — tərcümə axtarış buferi) adlanır, ən son istifadə olunan uyğunlaşmaları saxlayır. Bu kursdakı hər keş kimi, o da kiçikdir və buraxılış (miss) verə bilər.

İndi əyri özünü izah edir. 4096 baytdan kiçik addım eyni səhifəyə düşməyə davam edir, ona görə bir tərcümə çoxlu müraciətə xidmət edir. 4096 və ya daha böyük addım isə **hər müraciətdə yeni səhifəyə** dəyir — hər dəfə təzə tərcümə, nəhayət isə TLB-nin saxlaya biləcəyindən çox səhifə. Əlavə nanosaniyələr məlumatın harada olduğunu axtarmağın qiymətidir, əldə etməzdən əvvəl.

Bu, ölçülmüş əyrilərin diqqətlə oxunmağa dəyməsinin yaxşı bir nümunəsidir: həmin kiçik addım bütöv bir alt sistemin özünü elan etməsidir. Virtual yaddaş və TLB-nin özlərinə aid dərsləri sonra gələcək; hələlik faydalı nəticə budur ki, **böyük addımlar keşin (cache) tək başına izah edə biləcəyindən çox baha başa gəlir**, və bunun bir adı var.

</DeepDive>

<Pitfall>

**Daha sürətli RAM nadir hallarda düşündüyünüz kimi yaxşılaşdırma verir.**

Yaddaş iki rəqəmlə satılır, və böyük birinci rəqəmin və kiçik ikinci rəqəmin kompüteri sürətləndirəcəyini düşünmək asandır. Bəzən elə olur. Adətən çətin sezilir, və səbəb birbaşa bu dərsdən çıxır.

**Gecikmə (latency) yaxşılaşmaları kiçikdir və getdikcə kiçilir.** Eyni sürətdə `CL16`-dan `CL14`-ə keçmək yüz nanosaniyəni ötən bir yolun bir addımından bir neçə nanosaniyə qırxır. Təsir etdiyi hissəyə görə bir neçə faizlik real yaxşılaşdırmadır, bütövə görə isə cüzi fərqdir.

**Bant genişliyi (bandwidth) yaxşılaşmaları yalnız siz bant genişliyi ilə məhdudlaşdığınız halda kömək edir.** Əksər proqramlar belə deyil. Onlar *gecikmə (latency)* ilə məhdudlaşır — növbəti ünvanı hesablamaq üçün bir dəyəri gözləyir — və yolu iki dəfə genişləndirmək yolayrıcında dayanan avtomobilə heç nə vermir. Həqiqətən fayda görən proqramlar böyük həcmi axan proqramlardır: video kodlaşdırma, böyük simulyasiyalar, yaddaş-daxili analitika, xüsusilə də öz ayrıca yaddaşı olmayan və sistemin yaddaşını bölüşən **inteqrasiya edilmiş qrafika (integrated graphics)**.

**Kanallar başlıq rəqəmlərindən daha çox əhəmiyyət daşıyır.** Platanın iki dəstəklədiyi yerdə bir lövhə taxmaq bant genişliyinizi yarıya endirir, və bu, real və çox rast gəlinən bir səhvdir. İki kiçik uyğun lövhə adətən bir böyük lövhədən üstün olur.

**Tutum, sürəti üstələyir, tutmayana qədər.** Bir maşında yaddaş azdırsa, o swap (dəyişdirmə) edəcək, swap isə iş yükünü 156-nanosaniyəlik pillədən 74-mikrosaniyəlik pilləyə köçürür — bu fəlakət qarşısında bu səhifədəki hər zaman rəqəmi cüzi qalır. Əvvəlcə kifayət qədər RAM; sürətli RAM isə çox uzaqda ikinci yerdə.

Dürüst xülasə: adi işlər üçün, yaddaş sürəti pul xərcləmək üçün ən az effektiv şeylərdən biridir, *proqramınızın yaddaşa necə müraciət etdiyi* isə diqqəti xərcləmək üçün ən effektiv şeylərdən biridir.

</Pitfall>

## Özünüz bir sətir açın {/*open-a-row-yourself*/}

Budur, bir DRAM bankı, səkkiz sətir səkkiz sütuna qədər sadələşdirilib. Bu, dəqiq təsvir edilən dörd addım kimi davranır: eyni anda bir sətir açıq ola bilər, sətir buferində saxlanılır, və fərqli bir sətirdə ünvan istəmək əvvəlcə hazırkı sətri bağlamaq deməkdir.

Bir müraciət naxışı seçin və addım-addım keçin. Sətir buferini izləyin, işləyən cəmi izləyin.

Etməyə dəyən müqayisə ilk iki naxış arasındadır. **Sıra ilə** hər sətri növbətinə keçməzdən əvvəl gəzir, ona görə bir sətri bir dəfə activate edir, sonra onu səkkiz dəfə oxuyur. **Sütunlar boyunca** isə növbə ilə hər sətirdən bir bayt istəyir — eyni altmış dörd bayt, fərqli sırada — və hər tək müraciətdə activate ödəyir.

<Sandpack>

```js
import { useState } from 'react';

const ACC = '#087ea4';
const DNG = '#c1554d';
const ROWS = 8, COLS = 8;
const HIT_NS = 15;      // artıq açıq olan sətirdən oxumaq
const MISS_NS = 45;     // precharge + activate + sense + read

const PATTERNS = [
  ['sıra ilə', 'seq', 'sətir 0, sütun 0-7, sonra sətir 1, və s.'],
  ['sütunlar boyunca', 'col', 'hər sətrin sütun 0-ı, sonra sütun 1, …'],
  ['bir sətir, təkrar-təkrar', 'same', 'sətir 3, bütün səkkiz sütun, dörd dəfə'],
  ['təsadüfi', 'rand', 'altmış dörd ünvan təsadüfi sırada'],
];

function build(kind) {
  const out = [];
  if (kind === 'seq') for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) out.push([r, c]);
  if (kind === 'col') for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) out.push([r, c]);
  if (kind === 'same') for (let k = 0; k < 4; k++) for (let c = 0; c < COLS; c++) out.push([3, c]);
  if (kind === 'rand') {
    let s = 987654321;
    const all = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) all.push([r, c]);
    while (all.length) { s = (s * 1103515245 + 12345) % 2147483648; out.push(all.splice(s % all.length, 1)[0]); }
  }
  return out;
}

export default function DramLab() {
  const [kind, setKind] = useState('seq');
  const [step, setStep] = useState(0);

  const seq = build(kind);

  // replay to get the current state
  let open = null, hits = 0, misses = 0;
  for (let k = 0; k < step; k++) {
    const [r] = seq[k];
    if (open === r) hits++; else { misses++; open = r; }
  }
  const done = step >= seq.length;
  const cur = done ? null : seq[step];
  const willHit = cur !== null && open === cur[0];
  const ns = hits * HIT_NS + misses * MISS_NS;
  const best = step * HIT_NS;

  const pick = (label, k) => (
    <button key={k} onClick={() => { setKind(k); setStep(0); }} style={{
      margin: 2, padding: '4px 10px', fontSize: 12.5, borderRadius: 6, cursor: 'pointer',
      border: `2px solid ${kind === k ? ACC : '#888'}`,
      background: kind === k ? `${ACC}1e` : 'transparent',
      color: kind === k ? ACC : 'inherit', fontWeight: kind === k ? 'bold' : 'normal',
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>{PATTERNS.map(([l, k]) => pick(l, k))}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#888', marginBottom: 10 }}>
        {PATTERNS.find(([, k]) => k === kind)[2]}
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setStep(Math.min(step + 1, seq.length))} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>növbəti müraciət</button>
        <button onClick={() => setStep(seq.length)} disabled={done}
          style={{ fontSize: 15, padding: '4px 14px', marginRight: 8 }}>sona qədər işə sal</button>
        <button onClick={() => setStep(0)} style={{ fontSize: 15, padding: '4px 14px' }}>sıfırla</button>
        <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
          {Math.min(step + (done ? 0 : 1), seq.length)} / {seq.length}
        </span>
      </div>

      {/* the bank */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>hüceyrə massivi</div>
          {Array.from({ length: ROWS }, (_, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <span style={{
                width: 46, fontSize: 11, fontFamily: 'monospace',
                color: open === r ? ACC : '#888',
              }}>sətir {r}</span>
              {Array.from({ length: COLS }, (_, c) => {
                const isTarget = cur && cur[0] === r && cur[1] === c;
                const inOpenRow = open === r;
                return (
                  <div key={c} style={{
                    width: 26, height: 24, margin: 1, borderRadius: 4, fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${isTarget ? DNG : inOpenRow ? ACC : '#8886'}`,
                    background: isTarget ? `${DNG}33` : inOpenRow ? `${ACC}22` : 'transparent',
                  }} />
                );
              })}
              {open === r && (
                <span style={{ marginLeft: 8, fontSize: 11, color: ACC }}>açıq</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>sətir buferi (row buffer)</div>
          <div style={{
            padding: '10px 12px', borderRadius: 9, minHeight: 54,
            border: `2px solid ${open === null ? '#888' : ACC}`,
            background: open === null ? 'transparent' : `${ACC}14`,
          }}>
            {open === null ? (
              <span style={{ color: '#888' }}>boş — hələ heç nə activate edilməyib</span>
            ) : (
              <>
                <b style={{ fontFamily: 'monospace', color: ACC }}>sətir {open} saxlanılır</b>
                <div style={{ fontSize: 12, color: '#888' }}>
                  bütün səkkiz sütunu gücləndirilib və hazırdır
                </div>
              </>
            )}
          </div>

          <div style={{
            marginTop: 10, padding: '9px 12px', borderRadius: 9,
            border: `2px solid ${done ? ACC : willHit ? ACC : DNG}`,
            background: done ? `${ACC}10` : willHit ? `${ACC}14` : `${DNG}14`,
          }}>
            {done ? (
              <b style={{ color: ACC }}>bütün {seq.length} müraciət tamamlandı</b>
            ) : (
              <>
                <b style={{ color: willHit ? ACC : DNG }}>
                  növbəti: sətir {cur[0]}, sütun {cur[1]} &rarr; {willHit ? 'sətir buferi VURĞU (HIT)' : 'sətir buferi BURAXILIŞ (MISS)'}
                </b>
                <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                  {willHit
                    ? `sətir ${cur[0]} artıq açıqdır — sadəcə sütunu oxu (${HIT_NS} ns)`
                    : open === null
                      ? `sətir ${cur[0]}-i activate et, hiss et (sense), sonra oxu (${MISS_NS} ns)`
                      : `sətir ${open}-i precharge et, sətir ${cur[0]}-i activate et, hiss et, oxu (${MISS_NS} ns)`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: 'monospace', fontSize: 14 }}>
        <span style={{ color: ACC }}>sətir vurğuları (hits): {hits}</span>
        <span style={{ color: DNG }}>activate-lər: {misses}</span>
        <span>cəmi: <b>{ns} ns</b></span>
        {step > 0 && (
          <span style={{ color: '#888' }}>
            hamısının vurğu (hit) olduğu haldan {(ns / best).toFixed(1)}× baha
          </span>
        )}
      </div>

      <p style={{ fontSize: 12.5, color: '#888', marginTop: 10 }}>
        Sadələşdirilmiş: bir bank, səkkiz sətir, sabit qiymətlər — vurğuya (hit) {HIT_NS} ns
        və buraxılışa (miss) {MISS_NS} ns. Real çiplərdə minlərlə sətir, paralel işləyən bir neçə
        bank, və səkkiz bayt əvəzinə təxminən bir kilobaytlıq sətir olur.
      </p>
    </div>
  );
}
```

</Sandpack>

"Sıra ilə"ni, sonra isə "sütunlar boyunca"nı sona qədər işə salın və cəmləri müqayisə edin. Hər ikisi altmış dörd ünvanı oxuyur. Birincisi **səkkiz** activate ödəyir; ikincisi **altmış dörd**. Eyni məlumat, eyni çip, eyni miqdarda çatdırılmış informasiya — yeganə fərq isə onun hansı sırada istəndiyidir.

Bu, bir rəqəmdə bütün dərsdir, və bu, əvvəlki dərsin keş (cache) səviyyəsində və disk səviyyəsində tapdığı eyni rəqəmdir. İyerarxiya bu məqamda yekdildir.

<Recap>

- Əsas yaddaşın bir biti bir **kondensator**dur (yükü saxlayır: dolu 1-dir, boş 0-dır), bir **transistor** tərəfindən qorunur. Keş yaddaşı (cache) isə bunun əvəzinə bit başına təxminən **altı transistor** istifadə edir — üç dəfə çox komponent, bayt başına təxminən yüz dəfə çox qiymət, və məhz bu nisbət sizdə birinin qiqabaytlarla, digərinin isə kilobaytlarla olmasının səbəbidir. Robert Dennard hüceyrəni IBM-də **1966**-cı ildə icad etdi.
- Kondensator **sızır**, ona görə hər sətir **64 millisaniyə** ərzində oxunub geri yazılmalıdır. DDR4 hər pəncərədə **8,192 təzələmə (refresh) əmri** verir — hər **7.8 µs**-də bir. Bu, DRAM-dakı *D* hərfidir, və boş yaddaşın hələ də enerji çəkməsinin səbəbidir.
- Hüceyrələr **şəbəkə (grid)** şəklində düzülür, və ünvan *hansı sətir* və *hansı sütuna* bölünür. Real bir sətir təxminən **1-2 KB** saxlayır.
- Oxumaq dörd addım tələb edir: **ACTIVATE** (sətri aç, ondakı hər kondensatoru buraxaraq), **SENSE** (zəif yükləri gücləndirib **sətir buferinə (row buffer)** çevir), **READ** (nəhayət sütununuzu seçin), və **PRECHARGE** (bütöv sətri geri yaz, çünki oxumaq kondensatorları *boşaltdı*). DRAM oxuması **destructive (məhvedici)**dir.
- Ona görə **row buffer hit (sətir buferi vurğusu)** — artıq açıq olan sətrin başqa bir sütununu istəmək — dörd addımdan üçünü atlayır və dəfələrlə ucuz olur. Ardıcıl müraciət dəfələrlə vurğu (hit) verir; təsadüfi müraciət isə hər dəfə buraxılış (miss) verir. Bu, keş xətti (cache line) arqumentinin bir səviyyə aşağıda, kilobayt miqyasında olan versiyasıdır.
- `DDR4-3200 CL16` belə açıqlanır: **D**ouble **D**ata **R**ate, **3,200 MT/s** (deməli 1,600 MHz saat), və **16 dövr** CAS gecikməsi = **10.0 ns**. Amma bu maşında ölçülmüş təsadüfi müraciət **156 ns** çəkdi, çünki CL yalnız 3-cü addımı əhatə edir — precharge, activate, sense, ünvan tərcüməsi, növbə və bus yolu hamısı əlavədir. **CL16, 16 ns-lik yaddaş demək deyil.**
- Yaddaş sürəti **daha qısa əməliyyatlarla** deyil, **parallelliklə** qazandı: **banklar** eyni anda bir neçə sətrin açıq olmasına imkan verir, **kanallar** CPU-ya ayrı yollar təmin edir. Bu, pipelining-in (kəmərləmə) yaddaşa tətbiqidir — daha yaxşı məhsuldarlıq (throughput), dəyişməz gecikmə (latency).
- Dörd nəsil boyunca **bant genişliyi ~3.8× artdı** (12.8 → 48.0 GB/s), **CAS gecikməsi isə ~0.7× yaxşılaşdı** (13.8 → 10.0 ns). Yolu genişləndirə bilərsiniz; onu asanlıqla qısalda bilməzsiniz.
- 512 MB üzərində ölçülmüş addım (stride) taraması: 32-baytlıq boşluqda **3.15 ns** və 64-də **6.12 ns** — qiymət düz keş xətti sərhədində ikiqat artır — sonra prefetcher və sətir buferi bacardıqca 11-13 ns ətrafında düzlük, sonra ünvan tərcüməsi qiymətə başladıqca **4096-baytlıq səhifə (page)** sərhədindən sonra yüksəliş. Proqnozlaşdırıla bilən heç nə həqiqi təsadüfi müraciətin 156 ns-inə çatmadı.

</Recap>

<Challenges>

#### Modul hesablamasını edin {/*do-the-module-arithmetic*/}

Yaddaş modulu `DDR5-5600 CL40` etiketlənib. (a) Onun real saat tezliyi nədir? (b) Bir saat dövrü nə qədər çəkir? (c) CAS gecikməsi nanosaniyə ilə nə qədərdir? (d) Bir dost deyir: "CL40 dəhşətlidir, mənim köhnə DDR4-üm CL16 idi." Bu müqayisədə nə səhvdir?

<Hint>

Əsas rəqəm saniyədə transferdir, DDR isə hər saat dövründə (clock cycle) iki dəfə köçürür. (d) üçün DDR4 rəqəmini nanosaniyə ilə hesablayın və bərabər şəkildə müqayisə edin.

</Hint>

<Solution>

**(a)** 5600 saniyədə transferdir, DDR isə hər dövrdə iki dəfə köçürür:

```
 saat = 5600 / 2 = 2,800 MHz
```

**(b)** Bir dövr:

```
 1 / 2,800,000,000 s = 0.357 ns
```

**(c)** CAS gecikməsi:

```
 40 dövr × 0.357 ns = 14.3 ns
```

**(d) Müqayisə səhvdir, çünki CL dövrlərlə ölçülür, vaxtla yox.** DDR5-5600-də bir dövr DDR4-3200-dəkindən xeyli qısadır, ona görə eyni real vaxtda daha çoxu sığır:

```
 DDR4-3200 CL16:  16 × 0.625 ns = 10.0 ns
 DDR5-5600 CL40:  40 × 0.357 ns = 14.3 ns
```

Deməli, bu konkret cütləşmədə dost *təsadüfən istiqamətcə haqlıdır* — 14.3 ns 10.0 ns-dən pisdir — amma tamamilə səhv səbəbdən, və fərqin ölçüsü də 40-a-qarşı-16-nın göstərdiyi kimi deyil. DDR5-6000 CL30 modulu dəqiq 10.0 ns verir, CL demək olar iki dəfə böyük olsa da, DDR4 ilə eynidir.

**Nəsillər arasında müqayisə etməzdən əvvəl həmişə CL-i nanosaniyəyə çevirin.** Və sonra bu dərsin daha vacib nöqtəsini xatırlayın: 156 ns ölçülmüş real təsadüfi müraciətdə, bir addımda 4 ns fərq yolun 3%-dən azdır.

</Solution>

#### Activate-ləri sayın {/*count-the-activates*/}

Bir DRAM sətri 1,024 bayt saxlayır. Bir proqram 4,096 ardıcıl baytı, bayt-bayt oxuyur. Bu sual üçün keşləri (cache) nəzərə almayın və hər oxumanın yaddaş çipinə çatdığını fərz edin.

(a) Məlumat neçə sətrə yayılır? (b) Neçə ACTIVATE əməliyyatı lazımdır? (c) Neçə sətir buferi vurğusu (hit) olur? (d) İndi eyni 4,096 bayt təsadüfi sırada oxunur. Ən pis halda neçə activate lazımdır?

<Solution>

**(a)** Məlumat yayılır:

```
 4,096 / 1,024 = 4 sətir
```

**(b)** Sıra ilə oxunanda, hər sətir bir dəfə açılır və sonra dəfələrlə oxunur:

```
 4 ACTIVATE əməliyyatı
```

**(c)** Hər sətirdəki birinci müraciətdən başqa hər müraciət artıq açıq olan sətri tapır:

```
 ümumi müraciətlər     4,096
 activate-lər              4
 sətir buferi vurğuları  4,092  → 99.9% vurğu (hit) nisbəti
```

**(d) Təsadüfi sıra, ən pis hal: 4,095-ə qədər activate.** Eyni anda yalnız bir sətir açıq olduğundan, əvvəlkindən fərqli sətirə düşən hər müraciət precharge və yeni activate məcbur edir. Dörd sətir arasında təsadüfi sırada ardıcıl müraciətlərin təxminən dörddə üçü fərqli sətirə düşür — deməli praktikada təxminən 3,000 activate, ən əlverişsiz sırada isə 4,095-ə qədər.

Bu dərsin sadələşdirilmiş qiymətlərini — vurğuya (hit) 15 ns, buraxılışa (miss) 45 ns — istifadə edərək:

```
 sıra ilə:  4 × 45 + 4,092 × 15  =    61,560 ns
 təsadüfi:  ~3,072 × 45 + ~1,024 × 15  =  153,600 ns   → təxminən 2.5× daha pis
```

Bu isə yalnız **dörd** sətir arasında seçim olanda belə. Eyni müraciətləri milyonlarla sətri olan real bir ünvan sahəsinə yayın, demək olar hər müraciət buraxılışa (miss) çevrilir — bu da elə niyə ölçülmüş təsadüfi müraciət rəqəminin 156 ns, ardıcıl rəqəmin isə təxminən 2 ns olmasının səbəbidir.

</Solution>

#### Yeniləmə tələbi {/*the-upgrade-request*/}

Transfer tapşırığı. Bir həmkarınız aparat tələbi göndərir: *"Bizim məlumat emalı işimiz 40 dəqiqə çəkir. Profil hazırladım və bu, yaddaş-bağlı (memory-bound) işdir — CPU cəmi 30% istifadə olunur. DDR4-3200 CL16 yaddaşımızı, həm sürətli, həm də daha az gecikməli olan DDR4-3600 CL14 ilə əvəz etmək istəyirəm. Bu, çalışma vaxtını nəzərəçarpacaq dərəcədə azaltmalıdır."*

Bu əsaslandırmanı qiymətləndirin. "Yaddaş-bağlı (memory-bound)" nəyi açıq saxlayır, siz nəyi ölçərdiniz, və təklif olunan yeniləmədən nə gözləyərdiniz?

<Solution>

**Əsaslandırmada doğru olan nədir.** Diaqnoz yaxşı başlanğıcdır: məşğul bir işdə 30% CPU istifadəsi həqiqətən prosessorun işləmək əvəzinə gözlədiyini göstərir, və yaddaş məntiqli bir şübhəlidir. Onlar həmçinin təklif verməzdən əvvəl profil hazırlayıblar ki, bu, əksər tələblərdən daha çoxdur.

**"Yaddaş-bağlı (memory-bound)" nəyi açıq saxlayır** bu dərsin üzərində qurulduğu fərqdir: **bant genişliyi-ilə-məhdud (bandwidth-bound), yoxsa gecikmə-ilə-məhdud (latency-bound)?** Bunlar fərqli həlləri olan fərqli problemlərdir, təklif olunan yeniləmə isə əsasən yalnız birinə kömək edir.

- **Bant genişliyi-ilə-məhdud (bandwidth-bound)** o deməkdir ki, iş böyük həcmdə məlumat axını edir və yaddaş bus-ı doyub. Sürətli yaddaş burada kömək edir, təxminən bant genişliyi artımı ilə mütənasib olaraq.
- **Gecikmə-ilə-məhdud (latency-bound)** o deməkdir ki, iş fərdi, asılı müraciətləri gözləyir — göstərici (pointer) qovmaq, hash cədvəli boyunca atlamaq, ağac gəzmək. Sürətli yaddaş burada çətin kömək edir, çünki dar boğaz kiçilmə göstərməyən fiziki addımlar ardıcıllığıdır.

CPU rəqəminin istisna edə bilmədiyi üçüncü bir ehtimal da var: iş **disk və ya şəbəkəni** gözləyə bilər, bu da az CPU istifadəsi kimi görünər və bunu yaddaş heç cür həll edə bilməz.

**Nəyi ölçərdim:**

- **Yaddaş bant genişliyi istifadəsi.** İş nəzəri pikin böyük bir hissəsini istifadə edirsə, bu, bant genişliyi-ilə-məhdud deməkdir. Kiçik bir hissəni istifadə edərkən hələ də dayanırsa, gecikmə-ilə-məhdud deməkdir.
- **Keş buraxılış (cache miss) sayları və dayanma dövrləri (stall cycles)**, dayanmaların həqiqətən yaddaşdan, başqa bir şeydən yox, olduğunu təsdiqləmək üçün.
- **G/Ç gözləməsi (I/O wait)**, RAM almazdan əvvəl disk və şəbəkəni istisna etmək üçün.
- **Ucuz bir eksperiment:** işi artıq daha sürətli yaddaşı olan bir maşında işə salın, ya da hazırkı maşında yaddaş saatını süni şəkildə azaldın və çalışma vaxtının nə qədər dəyişdiyinə baxın. Yaddaş sürətini yarıya endirmək çalışma vaxtını demək olar dəyişmirsə, iki dəfə artırmaq da kömək etməyəcək — bu eksperiment isə heç nəyə başa gəlmir.

**Təklif olunan yeniləmə əslində nə verərdi:**

```
 bant genişliyi:  3200 → 3600 MT/s          = +12.5%
 CAS:        16 × 0.625 = 10.0 ns
             14 × 0.556 = 7.8 ns           = bir addımda −2.2 ns
```

Deməli, təxminən 12% çox bant genişliyi və yüzlərlə nanosaniyəlik yolun bir komponentindən təxminən iki nanosaniyə. İş həqiqətən bant genişliyi ilə doymuşdursa, bir neçə faiz gözləyin — bəlkə 40 dəqiqə 37 olar. Gecikmə-ilə-məhduddursa, təxminən heç nə gözləyin.

**Bunun əvəzinə nə təklif edərdim.** Əvvəlcə yaddaşın həqiqətən **ikiqat kanalda (dual channel)** işlədiyini yoxlayın; tək lövhə həll etmək üçün modul yeniləməsindən daha böyük və daha ucuz bir problemdir. Sonra müraciət naxışına baxın, çünki bu dərsin öz ölçmələri əldə edilə biləcək qazancları perspektivə qoyur: ardıcıl müraciət təxminən müraciət başına 2 ns, təsadüfi müraciət isə 156 ns idi — demək olar səksən dəfə fərq. Heç bir yaddaş alışı, hər hansı bir qiymətə, səksən dəfəlik bir amil təklif etmir. İşin məlumata müraciət naxışını yenidən qurmaq isə ola bilər.

Qazanılmalı vərdiş: **"yaddaş-bağlı (memory-bound)" bir kateqoriyadır, diaqnoz deyil.** Bant genişliyi və gecikmə ayrı tavanlardır, və onlardan yalnız biri satılıqdır. ✓

</Solution>

</Challenges>

<LearnMore title="Stack vs Heap" path="/learn/faza-0/modul-0-4/stack-vs-heap">

İndi yaddaşın fiziki olaraq *nə olduğunu* bilirsiniz — sətirlərlə cavab verən sızan kondensatorlar şəbəkəsi. Görmədiyiniz isə işləyən bir proqramın bu yaddaşı necə böldüyü və hər bir dəyişənin harada yerləşəcəyinə necə qərar verdiyidir. Növbəti dərs: hər proqramın istifadə etdiyi iki bölgə, niyə biri demək olar pulsuzdur, digəri isə mühasibatlıq (bookkeeping) tələb edir, niyə bir funksiyanın lokal dəyişənləri qayıdanda yox olur, amma ayrılmış (allocated) bir obyekt yox olmur, və proqram həddindən artıq dərinə rekursiya edəndə əslində nə baş verir.

</LearnMore>