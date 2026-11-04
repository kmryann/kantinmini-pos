const now = new Date("2026-11-02T12:00:00+07:00");
  const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();

  const categories = [
    { id: "nasi", name: { id: "Nasi & lauk", en: "Rice & sides" }, icon: "utensils" },
    { id: "mie", name: { id: "Mie & camilan", en: "Noodles & snacks" }, icon: "bag" },
    { id: "minuman", name: { id: "Minuman", en: "Drinks" }, icon: "coffee" },
  ];

  const sauceChoices = [
    { id: "bawang", label: { id: "Sambal bawang", en: "Garlic sambal" } },
    { id: "matah", label: { id: "Sambal matah", en: "Matah sambal" } },
    { id: "kecap", label: { id: "Kecap manis", en: "Sweet soy" } },
  ];
  const spiceChoices = [
    { id: "original", label: { id: "Original", en: "Original" } },
    { id: "pedas", label: { id: "Pedas", en: "Spicy" } },
    { id: "extra", label: { id: "Extra pedas", en: "Extra spicy" } },
  ];
  const sauceGroup = {
    id: "saus",
    label: { id: "Saus", en: "Sauce" },
    required: true,
    choices: sauceChoices,
  };
  const spiceGroup = {
    id: "rasa",
    label: { id: "Rasa", en: "Flavor" },
    required: true,
    choices: spiceChoices,
  };

  const menu = [
    {
      id: "nasi-goreng",
      category: "nasi",
      name: { id: "Nasi Goreng Kampung", en: "Village Fried Rice" },
      desc: {
        id: "Nasi goreng dengan telur, ayam, dan kerupuk.",
        en: "Fried rice with egg, chicken, and crackers.",
      },
      price: 25000,
      image: "/assets/menu/nasi-goreng.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "nasi-ayam",
      category: "nasi",
      name: { id: "Nasi Ayam Sambal Matah", en: "Matah Sambal Chicken Rice" },
      desc: {
        id: "Nasi putih, ayam sambal matah, lalapan, dan telur.",
        en: "Steamed rice, chicken with matah sambal, greens, and egg.",
      },
      price: 28000,
      image: "/assets/menu/nasi-ayam.webp",
      available: true,
      popular: true,
      options: [sauceGroup, spiceGroup],
    },
    {
      id: "ayam-geprek",
      category: "nasi",
      name: { id: "Ayam Geprek", en: "Smashed Fried Chicken" },
      desc: {
        id: "Ayam crispy geprek dengan sambal bawang dan nasi.",
        en: "Crispy smashed chicken with garlic sambal and rice.",
      },
      price: 24000,
      image: "/assets/menu/ayam-geprek.webp",
      available: true,
      popular: true,
      options: [sauceGroup, spiceGroup],
    },
    {
      id: "sate-ayam",
      category: "nasi",
      name: { id: "Sate Ayam", en: "Chicken Satay" },
      desc: {
        id: "Lima tusuk sate ayam, bumbu kacang, dan lontong.",
        en: "Five chicken skewers, peanut sauce, and rice cake.",
      },
      price: 22000,
      image: "/assets/menu/sate-ayam.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "nasi-campur",
      category: "nasi",
      name: { id: "Nasi Campur", en: "Mixed Rice" },
      desc: {
        id: "Nasi campur dengan lauk pilihan hari ini.",
        en: "Mixed rice with today's selection.",
      },
      price: 30000,
      image: "/assets/menu/nasi-campur.webp",
      available: false,
      popular: false,
      options: [],
    },
    {
      id: "mie-ayam",
      category: "mie",
      name: { id: "Mie Ayam Bakso", en: "Chicken Meatball Noodles" },
      desc: {
        id: "Mie ayam bakso dengan kuah kaldu dan sawi.",
        en: "Chicken meatball noodles in broth with greens.",
      },
      price: 23000,
      image: "/assets/menu/mie-ayam.webp",
      available: true,
      popular: true,
      options: [
        {
          id: "rasa",
          label: { id: "Rasa", en: "Flavor" },
          required: true,
          choices: [
            { id: "gurih", label: { id: "Gurih", en: "Savory" } },
            { id: "pedas", label: { id: "Pedas", en: "Spicy" } },
          ],
        },
      ],
    },
    {
      id: "roti-bakar",
      category: "mie",
      name: { id: "Roti Bakar Telur", en: "Egg Toast" },
      desc: {
        id: "Roti bakar telur dengan keju dan saus.",
        en: "Egg toast with cheese and sauce.",
      },
      price: 18000,
      image: "/assets/menu/roti-bakar.webp",
      available: true,
      popular: false,
      options: [
        {
          id: "saus",
          label: { id: "Saus", en: "Sauce" },
          required: true,
          choices: [
            { id: "mayo", label: { id: "Mayones", en: "Mayonnaise" } },
            { id: "sambal", label: { id: "Sambal", en: "Sambal" } },
            { id: "keju", label: { id: "Saus keju", en: "Cheese sauce" } },
          ],
        },
      ],
    },
    {
      id: "kentang-goreng",
      category: "mie",
      name: { id: "Kentang Goreng", en: "French Fries" },
      desc: {
        id: "Kentang goreng renyah dengan saus tomat.",
        en: "Crispy fries with tomato sauce.",
      },
      price: 15000,
      image: "/assets/menu/kentang-goreng.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "es-teh",
      category: "minuman",
      name: { id: "Es Teh Manis", en: "Sweet Iced Tea" },
      desc: {
        id: "Es teh manis dengan lemon.",
        en: "Sweet iced tea with lemon.",
      },
      price: 8000,
      image: "/assets/menu/es-teh.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "es-jeruk",
      category: "minuman",
      name: { id: "Es Jeruk", en: "Iced Orange" },
      desc: { id: "Es jeruk segar.", en: "Fresh iced orange." },
      price: 10000,
      image: "/assets/menu/es-jeruk.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "kopi-susu",
      category: "minuman",
      name: { id: "Kopi Susu Gula Aren", en: "Palm Sugar Milk Coffee" },
      desc: {
        id: "Kopi susu dengan gula aren.",
        en: "Milk coffee with palm sugar.",
      },
      price: 18000,
      image: "/assets/menu/kopi-susu.webp",
      available: true,
      popular: true,
      options: [],
    },
  ];

  const menuById = (id) => menu.find((item) => item.id === id);
  const categoryById = (id) => categories.find((item) => item.id === id);

  const orderItems = (items) =>
    items.map((item) => {
      const found = menuById(item.menuId);
      return { ...item, name: found ? found.name : { id: item.menuId, en: item.menuId }, price: found ? found.price : 0 };
    });

  const orderTotal = (items) =>
    items.reduce((sum, item) => {
      const found = menuById(item.menuId);
      return sum + (found ? found.price : 0) * item.qty;
    }, 0);

  const orders = [
    {
      code: "A-013",
      customer: "Dinda",
      type: "dine-in",
      table: 3,
      items: orderItems([
        { menuId: "nasi-ayam", qty: 1, options: ["matah", "pedas"], note: "Tanpa telur" },
        { menuId: "es-teh", qty: 1, options: [], note: "" },
      ]),
      total: 36000,
      payment: "QRIS",
      paymentStatus: "pending",
      orderStatus: "new",
      source: "QR",
      createdAt: minutesAgo(4),
    },
    {
      code: "A-012",
      customer: "Raka",
      type: "takeaway",
      table: null,
      items: orderItems([
        { menuId: "ayam-geprek", qty: 2, options: ["bawang", "pedas"], note: "" },
        { menuId: "es-teh", qty: 2, options: [], note: "Es sedikit" },
      ]),
      total: 64000,
      payment: "Cash",
      paymentStatus: "pending",
      orderStatus: "new",
      source: "QR",
      createdAt: minutesAgo(9),
      paymentCode: "K7F2",
    },
    {
      code: "A-011",
      customer: "Yoga",
      type: "takeaway",
      table: null,
      items: orderItems([{ menuId: "mie-ayam", qty: 2, options: ["gurih"], note: "" }]),
      total: 46000,
      payment: "Cash",
      paymentStatus: "pending",
      orderStatus: "new",
      source: "QR",
      createdAt: minutesAgo(18),
      paymentCode: "M3Q8",
    },
    {
      code: "A-010",
      customer: "Sinta",
      type: "dine-in",
      table: 2,
      items: orderItems([
        { menuId: "nasi-ayam", qty: 1, options: ["matah", "original"], note: "" },
        { menuId: "es-jeruk", qty: 1, options: [], note: "" },
      ]),
      total: 38000,
      payment: "QRIS",
      paymentStatus: "paid",
      orderStatus: "cooking",
      source: "QR",
      createdAt: minutesAgo(22),
    },
    {
      code: "A-009",
      customer: "Nadia",
      type: "dine-in",
      table: 5,
      items: orderItems([
        { menuId: "mie-ayam", qty: 1, options: ["pedas"], note: "" },
        { menuId: "kopi-susu", qty: 1, options: [], note: "" },
      ]),
      total: 41000,
      payment: "Cash",
      paymentStatus: "paid",
      orderStatus: "ready",
      source: "QR",
      createdAt: minutesAgo(31),
    },
    {
      code: "A-008",
      customer: "Bima",
      type: "takeaway",
      table: null,
      items: orderItems([
        { menuId: "nasi-goreng", qty: 1, options: [], note: "Pedas" },
        { menuId: "kentang-goreng", qty: 1, options: [], note: "" },
      ]),
      total: 40000,
      payment: "QRIS",
      paymentStatus: "paid",
      orderStatus: "ready",
      source: "POS",
      createdAt: minutesAgo(38),
    },
    {
      code: "A-007",
      customer: "Fajar",
      type: "dine-in",
      table: 1,
      items: orderItems([
        { menuId: "nasi-goreng", qty: 1, options: [], note: "" },
        { menuId: "es-teh", qty: 1, options: [], note: "" },
      ]),
      total: 33000,
      payment: "Cash",
      paymentStatus: "paid",
      orderStatus: "ready",
      source: "POS",
      createdAt: minutesAgo(45),
    },
    {
      code: "A-006",
      customer: "Lala",
      type: "takeaway",
      table: null,
      items: orderItems([
        { menuId: "roti-bakar", qty: 2, options: ["keju"], note: "" },
        { menuId: "kopi-susu", qty: 1, options: [], note: "" },
      ]),
      total: 54000,
      payment: "QRIS",
      paymentStatus: "paid",
      orderStatus: "ready",
      source: "QR",
      createdAt: minutesAgo(52),
    },
    {
      code: "A-005",
      customer: "Maya",
      type: "takeaway",
      table: null,
      items: orderItems([
        { menuId: "kentang-goreng", qty: 1, options: [], note: "" },
        { menuId: "es-jeruk", qty: 1, options: [], note: "" },
      ]),
      total: 25000,
      payment: "Cash",
      paymentStatus: "paid",
      orderStatus: "ready",
      source: "POS",
      createdAt: minutesAgo(60),
    },
    {
      code: "A-004",
      customer: "Adit",
      type: "dine-in",
      table: 7,
      items: orderItems([
        { menuId: "nasi-campur", qty: 1, options: [], note: "" },
        { menuId: "es-teh", qty: 1, options: [], note: "" },
      ]),
      total: 38000,
      payment: "QRIS",
      paymentStatus: "expired",
      orderStatus: "new",
      source: "QR",
      createdAt: minutesAgo(75),
    },
  ];

  const history = [
    { code: "A-003", date: "2026-11-02", time: "10:58", customer: "Dinda", type: "dine-in", table: 3, payment: "QRIS", status: "paid", orderStatus: "ready", total: 36000 },
    { code: "A-002", date: "2026-11-02", time: "10:42", customer: "Rani", type: "takeaway", table: null, payment: "Cash", status: "paid", orderStatus: "ready", total: 43000 },
    { code: "A-001", date: "2026-11-02", time: "10:15", customer: "Hendra", type: "dine-in", table: 4, payment: "QRIS", status: "paid", orderStatus: "ready", total: 61000 },
    { code: "B-024", date: "2026-11-01", time: "14:20", customer: "Rani", type: "takeaway", table: null, payment: "QRIS", status: "paid", orderStatus: "ready", total: 43000 },
    { code: "B-023", date: "2026-11-01", time: "13:05", customer: "Tio", type: "dine-in", table: 2, payment: "Cash", status: "paid", orderStatus: "ready", total: 28000 },
    { code: "B-022", date: "2026-11-01", time: "11:48", customer: "Sari", type: "dine-in", table: 6, payment: "QRIS", status: "paid", orderStatus: "ready", total: 72000 },
    { code: "B-021", date: "2026-11-01", time: "10:30", customer: "Andi", type: "takeaway", table: null, payment: "Cash", status: "cancelled", orderStatus: "new", total: 18000 },
    { code: "B-020", date: "2026-10-31", time: "14:02", customer: "Nabila", type: "dine-in", table: 1, payment: "QRIS", status: "paid", orderStatus: "ready", total: 52000 },
    { code: "B-019", date: "2026-10-31", time: "12:18", customer: "Yusuf", type: "takeaway", table: null, payment: "Cash", status: "paid", orderStatus: "ready", total: 31000 },
    { code: "B-018", date: "2026-10-31", time: "11:05", customer: "Mila", type: "dine-in", table: 5, payment: "QRIS", status: "expired", orderStatus: "new", total: 30000 },
    { code: "B-017", date: "2026-10-30", time: "13:44", customer: "Fikri", type: "takeaway", table: null, payment: "QRIS", status: "paid", orderStatus: "ready", total: 69000 },
    { code: "B-016", date: "2026-10-30", time: "12:25", customer: "Tami", type: "dine-in", table: 3, payment: "Cash", status: "paid", orderStatus: "ready", total: 24000 },
    { code: "B-015", date: "2026-10-29", time: "11:12", customer: "Galih", type: "takeaway", table: null, payment: "QRIS", status: "paid", orderStatus: "ready", total: 57000 },
    { code: "B-014", date: "2026-10-28", time: "14:35", customer: "Ayu", type: "dine-in", table: 7, payment: "Cash", status: "paid", orderStatus: "ready", total: 36000 },
  ];

  const dashboard = {
    stats: {
      revenue: 546000,
      transactions: 21,
      average: 26000,
      items: 34,
      revenueTrend: 9.4,
      transactionsTrend: 5.0,
      averageTrend: 3.2,
      itemsTrend: 11.2,
    },
    sales7d: [
      { label: { id: "Sel", en: "Tue" }, value: 820000 },
      { label: { id: "Rab", en: "Wed" }, value: 910000 },
      { label: { id: "Kam", en: "Thu" }, value: 880000 },
      { label: { id: "Jum", en: "Fri" }, value: 1050000 },
      { label: { id: "Sab", en: "Sat" }, value: 1220000 },
      { label: { id: "Min", en: "Sun" }, value: 1460000 },
      { label: { id: "Sen", en: "Mon" }, value: 1285000 },
    ],
    paymentMix: { qris: 68, cash: 32 },
    topMenus: [
      { menuId: "es-teh", count: 58 },
      { menuId: "nasi-ayam", count: 42 },
      { menuId: "ayam-geprek", count: 36 },
      { menuId: "mie-ayam", count: 31 },
      { menuId: "kopi-susu", count: 27 },
    ],
  };

  const cashierReport = {
    revenue: 546000,
    transactions: 21,
    average: 26000,
    items: 34,
    hourly: [
      { hour: "07", value: 1 },
      { hour: "08", value: 2 },
      { hour: "09", value: 3 },
      { hour: "10", value: 4 },
      { hour: "11", value: 4 },
      { hour: "12", value: 3 },
      { hour: "13", value: 2 },
      { hour: "14", value: 2 },
    ],
    paymentMix: { qris: 62, cash: 38 },
  };

  const accounts = [
    { id: "u1", name: "Rina Kartika", email: "rina@kantinmini.id", role: "cashier", active: true, lastLogin: "Hari ini, 06.50" },
    { id: "u2", name: "Budi Santoso", email: "budi@kantinmini.id", role: "manager", active: true, lastLogin: "Hari ini, 07.10" },
    { id: "u3", name: "Sari Wulandari", email: "sari@kantinmini.id", role: "admin", active: true, lastLogin: "Hari ini, 08.02" },
    { id: "u4", name: "Agus Pratama", email: "agus@kantinmini.id", role: "cashier", active: false, lastLogin: "28 Okt, 14.20" },
    { id: "u5", name: "Nadia Putri", email: "nadia@kantinmini.id", role: "manager", active: true, lastLogin: "Kemarin, 16.40" },
  ];

  const formatIDR = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const localized = (value, lang = "id") => {
    if (value && typeof value === "object") return value[lang] || value.id || "";
    return value || "";
  };

  const optionLabel = (choiceId, lang = "id") => {
    for (const item of menu) {
      for (const group of item.options || []) {
        const choice = group.choices.find((entry) => entry.id === choiceId);
        if (choice) return localized(choice.label, lang);
      }
    }
    return choiceId;
  };

  const orderItemSummary = (item, lang = "id") => {
    const options = (item.options || []).map((id) => optionLabel(id, lang));
    return options.join(" · ");
  };

  const initials = (name) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const posOrdersKey = "kantin-pos-orders";

  const getPosOrders = () => {
    try {
      const value = JSON.parse(localStorage.getItem(posOrdersKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const savePosOrder = (order) => {
    try {
      localStorage.setItem(posOrdersKey, JSON.stringify([order, ...getPosOrders()]));
    } catch {
      // Storage may be unavailable.
    }
  };

  export const KANTIN_DATA: any = {
    categories,
    menu,
    orders,
    history,
    dashboard,
    cashierReport,
    accounts,
    menuById,
    categoryById,
    orderTotal,
    orderItemSummary,
    formatIDR,
    localized,
    optionLabel,
    initials,
    getPosOrders,
    savePosOrder,
  };
