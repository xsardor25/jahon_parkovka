# Smart Parking Demo

Tailwind + HTML + JavaScript asosidagi interaktiv demo.

## Nima bor

- Parkovka statuslari: `empty`, `reserved`, `occupied`, `illegal`
- 4 ta rasm (`img/image1.png` ... `img/image4.png`) slot kartalarda ishlatiladi
- Telefon ramkasidagi mini-ilova: qidiruv, tanlash, bron, holat o'zgartirish
- Ruxsatsiz park uchun avtomatik jarima yozuvi
- KPI hisoblagichlar va localStorage saqlash

## Ishga tushirish

Variant 1 (Python):

```bash
cd "D:/c_p/jahon_parkovka"
python -m http.server 5500
```

Variant 2 (npm script):

```bash
cd "D:/c_p/jahon_parkovka"
npm run start
```

Brauzerda: `http://localhost:5500`

## Tekshiruv

```bash
cd "D:/c_p/jahon_parkovka"
npm run check
```