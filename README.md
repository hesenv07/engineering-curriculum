# Engineering Curriculum

> No frameworks. Engineering. A public, free, login-free site for software engineers who want to understand how things actually work — from transistors to distributed systems.

## Haqqında

Bu layihə [react.dev](https://react.dev)-dən ilhamlanan bir tədris saytıdır, lakin React öyrətmir. Əvəzinə, proqram mühəndisliyinin əsas biliklərini — kompüter arxitekturasından, əməliyyat sistemlərindən, şəbəkələrdən tutmuş paylanmış sistemlərə və AI engineering-ə qədər — dərin, framework-süz şəkildə izah edir.

**Məqsəd:** Framework-ləri istifadə etmək deyil, onların necə işlədiyini anlamaq.

## Kurrikulumun Strukturu

| Faza | Mövzu |
|------|-------|
| 0 | Kompüter necə işləyir (transistordan CPU-ya) |
| 1 | Proqramlaşdırma təməlləri (dilsiz) |
| 2 | Əməliyyat Sistemləri |
| 3 | Şəbəkələr |
| 4 | Verilənlər bazası |
| 5 | Backend Engineering |
| 6 | Frontend daxildən (framework-süz) |
| 7 | Paylanmış Sistemlər |
| 8 | DevOps və İnfrastruktur |
| 9 | Təhlükəsizlik |
| 10 | AI Engineering |
| 11 | System Design Case Studies |

## Texnoloji Stek

Bu sayt react.dev ilə eyni arxitektur yanaşmada qurulub:

- **[Next.js 14](https://nextjs.org/)** — Pages Router ilə SSG
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)** — MDX content rendering
- **[@codesandbox/sandpack-react](https://sandpack.codesandbox.io/)** — İnteraktiv kod redaktoru
- **TypeScript** — Tip təhlükəsizliyi

## Yerli İşlətmə

```bash
# 1. Repo-nu klonla
git clone <repo-url>
cd engineering-curriculum

# 2. Paketləri yüklə
npm install

# 3. Development server-i başlat
npm run dev
```

Brauzdərdə http://localhost:3000 ünvanını aç.

## Yeni Dərs Əlavə Etmək

Hər dərs `src/content/learn/` qovluğunda MDX faylı kimi saxlanır:

```
src/content/learn/
  faza-0/
    modul-0-1/
      bit-ve-byte.md          ← mövcuddur
      binary-say-sistemi.md   ← əlavə et
    modul-0-2/
      tranzistor-logic-geyts.md
```

### Dərs faylının formatı

```mdx
---
title: 'Dərsin başlığı'
---

<Intro>

Giriş mətni buraya gəlir.

</Intro>

<YouWillLearn>

- Öyrənəcəyin şey 1
- Öyrənəcəyin şey 2

</YouWillLearn>

## Bölmə başlığı {/*bolme-id*/}

Məzmun...

<Note>

Qeyd: vacib məlumat.

</Note>

<Pitfall>

Tuzaq: diqqətli ol.

</Pitfall>

<DeepDive>

#### Dərinləmə başlığı {/*derinleme-id*/}

Əlavə məlumat...

</DeepDive>

<Recap>

- Əsas nöqtə 1
- Əsas nöqtə 2

</Recap>

<Challenges>

#### Tapşırıq başlığı {/*tapsirig-id*/}

Tapşırıq mətni...

<Solution>

Cavab mətni...

</Solution>

</Challenges>
```

### Sidebar-a əlavə et

`src/sidebar.json` faylında müvafiq modul blokuna yeni route əlavə et:

```json
{
  "title": "Yeni dərs başlığı",
  "path": "/learn/faza-0/modul-0-1/yeni-ders"
}
```

## MDX Komponentləri

| Komponent | İstifadə |
|-----------|---------|
| `<Intro>` | Səhifənin giriş hissəsi |
| `<YouWillLearn>` | Öyrənmə hədəfləri siyahısı |
| `<Recap>` | Dərs xülasəsi |
| `<Note>` | Məlumat qutusu (mavi) |
| `<Pitfall>` | Xəbərdarlıq qutusu (qırmızı) |
| `<DeepDive>` | Açılıb-bağlanan dərinləmə bölməsi |
| `<Challenges>` | İnteraktiv tapşırıqlar |
| `<Solution>` | `<Challenges>` daxilində cavab |
| `<Hint>` | `<Challenges>` daxilində ipucu |
| `<Diagram name="..." alt="...">` | Şəkil/diaqram |
| `<Sandpack>` | İnteraktiv kod redaktoru |

## Diaqramlar

`<Diagram>` komponenti şəkilləri `/public/images/docs/diagrams/{name}.png` yolundan oxuyur. Şəkil mövcud olmadıqda `alt` mətni vizual qutu kimi göstərilir.

Şəkil əlavə etmək üçün:
```
public/images/docs/diagrams/
  light_switches.png
  voltage_noise.png
  same_bytes_three_meanings.png
```

## Deploy

```bash
npm run build
npm start
```

Vercel, Netlify və ya istənilən Node.js hosting platformasında deploy edilə bilər.

## Töhfə

Kursun hər bir dərsi üçün PR açılabilir. Dərs yazarkən aşağıdakı prinsiplərə əməl edin:

1. **Konsept əsaslı:** Kod deyil, necə işləyir
2. **Azərbaycan dilində:** Texniki terminlər orijinal şəkildə qalır
3. **Nümunə ilə:** Hər konsept real dünya nümunəsi ilə
4. **İnteraktiv:** Mümkün olduqda `<Sandpack>` ilə canlı kod

## Lisenziya

[MIT License](./LICENSE) © 2025 Engineering Curriculum Contributors

Məzmun (dərslər, diaqramlar) **CC BY 4.0** şərtləri altında paylaşıla bilər.

---

Pulsuz · Açıq · Giriş tələb etmir
