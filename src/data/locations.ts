export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
}

export const provinces: Province[] = [
  { id: "tehran", name: "تهران" },
  { id: "isfahan", name: "اصفهان" },
  { id: "fars", name: "فارس" },
  { id: "razavi-khorasan", name: "خراسان رضوی" },
  { id: "east-azerbaijan", name: "آذربایجان شرقی" },
  { id: "alborz", name: "البرز" },
  { id: "mazandaran", name: "مازندران" },
  { id: "gilan", name: "گیلان" },
  { id: "khuzestan", name: "خوزستان" },
  { id: "qom", name: "قم" },
];

export const cities: City[] = [
  // تهران
  { id: "tehran-city", provinceId: "tehran", name: "تهران" },
  { id: "shemiranat", provinceId: "tehran", name: "شمیرانات" },
  { id: "ray", provinceId: "tehran", name: "ری" },
  { id: "pardis", provinceId: "tehran", name: "پردیس" },
  { id: "damavand", provinceId: "tehran", name: "دماوند" },

  // اصفهان
  { id: "isfahan-city", provinceId: "isfahan", name: "اصفهان" },
  { id: "kashan", provinceId: "isfahan", name: "کاشان" },
  { id: "shahinshahr", provinceId: "isfahan", name: "شاهین‌شهر" },
  { id: "najafabad", provinceId: "isfahan", name: "نجف‌آباد" },

  // فارس
  { id: "shiraz", provinceId: "fars", name: "شیراز" },
  { id: "marvdasht", provinceId: "fars", name: "مرودشت" },
  { id: "jahrom", provinceId: "fars", name: "جهرم" },
  { id: "fasa", provinceId: "fars", name: "فسا" },

  // خراسان رضوی
  { id: "mashhad", provinceId: "razavi-khorasan", name: "مشهد" },
  { id: "neyshabur", provinceId: "razavi-khorasan", name: "نیشابور" },
  { id: "sabzevar", provinceId: "razavi-khorasan", name: "سبزوار" },
  { id: "torbat-heydariyeh", provinceId: "razavi-khorasan", name: "تربت حیدریه" },

  // آذربایجان شرقی
  { id: "tabriz", provinceId: "east-azerbaijan", name: "تبریز" },
  { id: "maragheh", provinceId: "east-azerbaijan", name: "مراغه" },
  { id: "marand", provinceId: "east-azerbaijan", name: "مرند" },

  // البرز
  { id: "karaj", provinceId: "alborz", name: "کرج" },
  { id: "fardis", provinceId: "alborz", name: "فردیس" },
  { id: "hashtgerd", provinceId: "alborz", name: "هشتگرد" },

  // مازندران
  { id: "sari", provinceId: "mazandaran", name: "ساری" },
  { id: "babol", provinceId: "mazandaran", name: "بابل" },
  { id: "amol", provinceId: "mazandaran", name: "آمل" },
  { id: "gائم‌شهر", provinceId: "mazandaran", name: "قائم‌شهر" },

  // گیلان
  { id: "rasht", provinceId: "gilan", name: "رشت" },
  { id: "anzali", provinceId: "gilan", name: "بندر انزلی" },
  { id: "lahijan", provinceId: "gilan", name: "لاهیجان" },

  // خوزستان
  { id: "ahvaz", provinceId: "khuzestan", name: "اهواز" },
  { id: "dezhful", provinceId: "khuzestan", name: "دزفول" },
  { id: "abadan", provinceId: "khuzestan", name: "آبادان" },

  // قم
  { id: "qom-city", provinceId: "qom", name: "قم" },
];

export function getProvinces(): Province[] {
  return provinces;
}

export function getCitiesByProvince(provinceId: string): City[] {
  if (!provinceId) return [];
  return cities.filter((city) => city.provinceId === provinceId);
}
