const now = new Date("2026-11-02T12:00:00+07:00");
  const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();

  const categories = [
    { id: "paket-nasi", name: { id: "Paket Nasi", en: "Rice Sets" }, icon: "utensils" },
    { id: "light-bites", name: { id: "Light Bites", en: "Light Bites" }, icon: "bag" },
    { id: "mie-pasta", name: { id: "Mie & Pasta", en: "Noodles & Pasta" }, icon: "utensils" },
    { id: "pempek", name: { id: "Pempek", en: "Pempek" }, icon: "utensils" },
    { id: "kapten-chicken", name: { id: "Kapten Chicken", en: "Kapten Chicken" }, icon: "chef-hat" },
    { id: "minuman", name: { id: "Minuman", en: "Drinks" }, icon: "coffee" },
  ];

  const katsuSauceChoices = [
    { id: "bbq", label: { id: "BBQ", en: "BBQ" } },
    { id: "lada-hitam", label: { id: "Lada Hitam", en: "Black Pepper" } },
    { id: "lava", label: { id: "Lava", en: "Lava" } },
    { id: "sambal-geprek", label: { id: "Sambal Geprek", en: "Geprek Sambal" } },
  ];
  const katsuSauceGroup = {
    id: "saus",
    label: { id: "Pilihan Saus", en: "Sauce Choice" },
    required: true,
    choices: katsuSauceChoices,
  };

  const sosisSauceChoices = [
    { id: "asam-manis", label: { id: "Asam Manis", en: "Sweet & Sour" } },
    { id: "lada-hitam", label: { id: "Lada Hitam", en: "Black Pepper" } },
  ];
  const sosisSauceGroup = {
    id: "saus",
    label: { id: "Pilihan Saus", en: "Sauce Choice" },
    required: true,
    choices: sosisSauceChoices,
  };

  const menu = [
    // --- Paket Nasi ---
    {
      id: "chicken-katsu",
      category: "paket-nasi",
      name: { id: "Chicken Katsu", en: "Chicken Katsu" },
      desc: {
        id: "Nasi + chicken katsu dengan pilihan saus gurih.",
        en: "Rice + chicken katsu with savory sauce choices.",
      },
      price: 16000,
      image: "/assets/foto-menu/katsu-bbq.webp",
      available: true,
      popular: true,
      options: [katsuSauceGroup],
    },
    {
      id: "katsu-lada-garam",
      category: "paket-nasi",
      name: { id: "Katsu Lada Garam", en: "Salt & Pepper Katsu" },
      desc: {
        id: "Chicken katsu dengan bumbu lada garam gurih",
        en: "Chicken katsu with savory salt and pepper seasoning",
      },
      price: 16000,
      image: "/assets/foto-menu/katsu-ladagaram.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "katsu-kari",
      category: "paket-nasi",
      name: { id: "Katsu Kari", en: "Curry Katsu" },
      desc: {
        id: "Chicken katsu saus kari",
        en: "Chicken katsu with rich curry sauce",
      },
      price: 17500,
      image: "/assets/foto-menu/katsu-kari.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "katsu-sambal-matah",
      category: "paket-nasi",
      name: { id: "Katsu Sambal Matah", en: "Matah Sambal Katsu" },
      desc: {
        id: "Chicken katsu sambal matah pedas segar",
        en: "Chicken katsu with fresh spicy matah sambal",
      },
      price: 16000,
      image: "/assets/foto-menu/katsu-matah.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "ayam-geprek",
      category: "paket-nasi",
      name: { id: "Ayam Geprek", en: "Smashed Fried Chicken" },
      desc: {
        id: "Ayam crispy digeprek sambal bawang",
        en: "Crispy fried chicken smashed with garlic sambal",
      },
      price: 19000,
      image: "/assets/foto-menu/ayam-geprek.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "ayam-bakar",
      category: "paket-nasi",
      name: { id: "Ayam Bakar", en: "Grilled Chicken" },
      desc: {
        id: "Ayam bakar bumbu manis gurih + tahu tempe",
        en: "Sweet & savory grilled chicken + tofu and tempeh",
      },
      price: 19000,
      image: "/assets/foto-menu/ayam-kecap.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "ayam-penyet",
      category: "paket-nasi",
      name: { id: "Ayam Penyet", en: "Smashed Spiced Chicken" },
      desc: {
        id: "Ayam goreng penyet sambal pedas + tahu tempe",
        en: "Fried chicken smashed with spicy sambal + tofu and tempeh",
      },
      price: 19000,
      image: "/assets/foto-menu/ayam-penyet.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "ayam-kalasan",
      category: "paket-nasi",
      name: { id: "Ayam Kalasan", en: "Kalasan Fried Chicken" },
      desc: {
        id: "Ayam goreng bumbu kalasan + tahu tempe",
        en: "Kalasan-style seasoned fried chicken + tofu and tempeh",
      },
      price: 19000,
      image: "/assets/foto-menu/ayam-kalasan.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "ayam-kremes",
      category: "paket-nasi",
      name: { id: "Ayam Kremes", en: "Crispy Crunch Chicken" },
      desc: {
        id: "Ayam goreng renyah dengan kremesan gurih + tahu tempe",
        en: "Crispy fried chicken with golden savory crunch + tofu and tempeh",
      },
      price: 19000,
      image: "/assets/foto-menu/ayam-kremes.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "ayam-pedas-daun-jeruk",
      category: "paket-nasi",
      name: { id: "Ayam Pedas Daun Jeruk", en: "Spicy Lime Leaf Chicken" },
      desc: {
        id: "Ayam pedas wangi daun jeruk segar",
        en: "Spicy chicken infused with aromatic kaffir lime leaf",
      },
      price: 16000,
      image: "/assets/foto-menu/ayam-daunjeruk.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "ayam-teriyaki",
      category: "paket-nasi",
      name: { id: "Ayam Teriyaki", en: "Chicken Teriyaki" },
      desc: {
        id: "Ayam saus teriyaki manis gurih",
        en: "Chicken cooked in sweet and savory teriyaki sauce",
      },
      price: 16000,
      image: "/assets/foto-menu/ayam-teriyaki.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "ayam-lada-hitam",
      category: "paket-nasi",
      name: { id: "Ayam Lada Hitam", en: "Black Pepper Chicken" },
      desc: {
        id: "Ayam saus lada hitam gurih",
        en: "Chicken in rich black pepper sauce",
      },
      price: 16000,
      image: "/assets/foto-menu/ayam-ladahitam.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "chicken-wing",
      category: "paket-nasi",
      name: { id: "Chicken Wing", en: "Chicken Wings Set" },
      desc: {
        id: "Chicken wing bumbu saus dengan nasi",
        en: "Sauced chicken wings served with steamed rice",
      },
      price: 22000,
      image: "/assets/foto-menu/chicken-wing.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "sapi-lada-hitam",
      category: "paket-nasi",
      name: { id: "Sapi Lada Hitam", en: "Black Pepper Beef" },
      desc: {
        id: "Daging sapi empuk saus lada hitam",
        en: "Tender beef slices in savory black pepper sauce",
      },
      price: 19000,
      image: "/assets/foto-menu/sapi-ladahitam.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "sosis-asam-manis",
      category: "paket-nasi",
      name: { id: "Sosis Asam Manis", en: "Sweet & Sour Sausage" },
      desc: {
        id: "Pilihan saus: Asam Manis/Lada Hitam",
        en: "Sauce choices: Sweet & Sour / Black Pepper",
      },
      price: 16000,
      image: "/assets/foto-menu/sosis-asammanis.webp",
      available: true,
      popular: false,
      options: [sosisSauceGroup],
    },
    {
      id: "nasi-goreng-kecap",
      category: "paket-nasi",
      name: { id: "Nasi Goreng Kecap", en: "Sweet Soy Fried Rice" },
      desc: {
        id: "Nasi goreng kecap spesial",
        en: "Special sweet soy fried rice",
      },
      price: 17000,
      image: "/assets/foto-menu/nasi-goreng.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "nasi-goreng-putih",
      category: "paket-nasi",
      name: { id: "Nasi Goreng Putih", en: "White Fried Rice" },
      desc: {
        id: "Nasi goreng putih spesial",
        en: "Savory white fried rice",
      },
      price: 17000,
      image: "/assets/foto-menu/nasi-goreng-putih.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "nasi-goreng-cikur",
      category: "paket-nasi",
      name: { id: "Nasi Goreng Cikur", en: "Aromatic Kencur Fried Rice" },
      desc: {
        id: "Nasi goreng cikur harum + telor, mendoan",
        en: "Fragrant kencur fried rice + egg, mendoan tempeh",
      },
      price: 15000,
      image: "/assets/foto-menu/nasi-cikur.webp",
      available: true,
      popular: false,
      options: [],
    },

    // --- Light Bites ---
    {
      id: "kentang-katsu",
      category: "light-bites",
      name: { id: "Kentang Katsu", en: "Katsu Fries" },
      desc: {
        id: "Kentang katsu renyah dengan pilihan saus.",
        en: "Crispy katsu fries with choice of sauce.",
      },
      price: 17000,
      image: "/assets/foto-menu/kentang-katsu.webp",
      available: true,
      popular: true,
      options: [katsuSauceGroup],
    },
    {
      id: "kentang-sosis",
      category: "light-bites",
      name: { id: "Kentang Sosis", en: "Fries & Sausage" },
      desc: {
        id: "Kentang goreng dengan sosis gurih",
        en: "French fries with savory sausage bites",
      },
      price: 15000,
      image: "/assets/foto-menu/kentang-sosis.webp",
      available: true,
      popular: false,
      options: [],
    },

    // --- Mie & Pasta ---
    {
      id: "spaghetti-carbonara",
      category: "mie-pasta",
      name: { id: "Spaghetti Carbonara", en: "Spaghetti Carbonara" },
      desc: {
        id: "Spaghetti creamy saus carbonara gurih",
        en: "Creamy and rich savory carbonara spaghetti",
      },
      price: 15000,
      image: "/assets/foto-menu/carbonara.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "mie-tektek",
      category: "mie-pasta",
      name: { id: "Mie Tektek", en: "Street-Style Mie Tek-Tek" },
      desc: {
        id: "Mie goreng pedas gurih ala kaki lima",
        en: "Spicy and savory street-style fried noodles",
      },
      price: 16000,
      image: "/assets/foto-menu/mie-tektek.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "kwetiau-goreng",
      category: "mie-pasta",
      name: { id: "Kwetiau Goreng", en: "Fried Flat Rice Noodles" },
      desc: {
        id: "Kwetiau goreng spesial",
        en: "Special savory stir-fried flat rice noodles",
      },
      price: 16000,
      image: "/assets/foto-menu/kwetiau-goreng.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "kwetiau-kuah",
      category: "mie-pasta",
      name: { id: "Kwetiau Kuah", en: "Flat Rice Noodle Soup" },
      desc: {
        id: "Kwetiau kuah gurih",
        en: "Comforting flat rice noodle soup in savory broth",
      },
      price: 16000,
      image: "/assets/foto-menu/kwetiau-kuah.webp",
      available: true,
      popular: false,
      options: [],
    },

    // --- Pempek ---
    {
      id: "kapal-selam-besar",
      category: "pempek",
      name: { id: "Kapal Selam Besar", en: "Jumbo Egg Pempek" },
      desc: {
        id: "Pempek besar isi telur dengan cuko segar",
        en: "Large fishcake filled with egg and sweet-spicy cuko sauce",
      },
      price: 15000,
      image: "/assets/foto-menu/selam-besar.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "lenjer-besar",
      category: "pempek",
      name: { id: "Lenjer Besar", en: "Jumbo Cylindrical Pempek" },
      desc: {
        id: "Pempek tenggiri panjang besar kenyal gurih",
        en: "Chewy and savory jumbo cylindrical mackerel fishcake",
      },
      price: 15000,
      image: "/assets/foto-menu/lenjer-besar.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "pempek-kecil-isi-3",
      category: "pempek",
      name: { id: "Pempek Kecil Isi 3", en: "Assorted Mini Pempek (3 Pcs)" },
      desc: {
        id: "Isi 3 sejenis atau campur (kapal selam, lenjer, adaan, kulit) dengan cuko segar",
        en: "3 assorted mini fishcakes with authentic cuko sauce",
      },
      price: 15000,
      image: "/assets/foto-menu/pempek-kecil.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "model",
      category: "pempek",
      name: { id: "Model", en: "Model Palembang" },
      desc: {
        id: "Pempek isi tahu kuah kaldu gurih",
        en: "Tofu-filled fishcake served in savory broth",
      },
      price: 15000,
      image: "/assets/foto-menu/model.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "tekwan",
      category: "pempek",
      name: { id: "Tekwan", en: "Tekwan Soup" },
      desc: {
        id: "Sup tekwan tenggiri kuah bening gurih",
        en: "Mackerel fishball soup in clear shrimp broth",
      },
      price: 15000,
      image: "/assets/foto-menu/tekwan.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "lenggang",
      category: "pempek",
      name: { id: "Lenggang", en: "Grilled Lenggang" },
      desc: {
        id: "Pempek panggang telur dadar khas Palembang",
        en: "Grilled fishcake baked with egg, Palembang specialty",
      },
      price: 15000,
      image: "/assets/foto-menu/lenggang.webp",
      available: true,
      popular: false,
      options: [],
    },

    // --- Kapten Chicken ---
    {
      id: "ayam-besar",
      category: "kapten-chicken",
      name: { id: "Ayam Besar", en: "Large Chicken" },
      desc: {
        id: "Dada/Paha Atas",
        en: "Breast / Thigh",
      },
      price: 8500,
      image: "/assets/foto-menu/ayamkapten-besar.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "ayam-kecil",
      category: "kapten-chicken",
      name: { id: "Ayam Kecil", en: "Small Chicken" },
      desc: {
        id: "Sayap/Paha Bawah",
        en: "Wing / Drumstick",
      },
      price: 7500,
      image: "/assets/foto-menu/ayamkapten-kecil.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "kulit-ayam",
      category: "kapten-chicken",
      name: { id: "Kulit Ayam", en: "Crispy Chicken Skin" },
      desc: {
        id: "Kulit ayam goreng garing gurih",
        en: "Crispy and savory fried chicken skin",
      },
      price: 5000,
      image: "/assets/foto-menu/kulit.webp",
      available: true,
      popular: true,
      options: [],
    },

    // --- Minuman ---
    {
      id: "milo",
      category: "minuman",
      name: { id: "Milo", en: "Milo" },
      desc: {
        id: "Milo panas atau dingin",
        en: "Hot or iced chocolate malt Milo",
      },
      price: 6000,
      image: "/assets/foto-menu/milo.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "teh-tarik",
      category: "minuman",
      name: { id: "Teh Tarik", en: "Teh Tarik" },
      desc: {
        id: "Teh tarik manis panas atau dingin",
        en: "Sweet pulled tea, hot or iced",
      },
      price: 5000,
      image: "/assets/foto-menu/teh-tarik.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "lemon-tea",
      category: "minuman",
      name: { id: "Lemon Tea", en: "Lemon Tea" },
      desc: {
        id: "Teh manis lemon segar dingin",
        en: "Fresh sweet iced lemon tea",
      },
      price: 4000,
      image: "/assets/foto-menu/lemon-tea.webp",
      available: true,
      popular: true,
      options: [],
    },
    {
      id: "nutrisari",
      category: "minuman",
      name: { id: "Nutrisari", en: "Nutrisari" },
      desc: {
        id: "Aneka rasa Nutrisari segar dingin",
        en: "Refreshing chilled citrus fruit drink",
      },
      price: 4000,
      image: "/assets/foto-menu/nutrisari.webp",
      available: true,
      popular: false,
      options: [],
    },
    {
      id: "kopi",
      category: "minuman",
      name: { id: "Kopi", en: "Black Coffee" },
      desc: {
        id: "Kopi hitam manis panas atau dingin",
        en: "Traditional black coffee, hot or iced",
      },
      price: 5000,
      image: "/assets/foto-menu/kopi.webp",
      available: true,
      popular: false,
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
        { menuId: "chicken-katsu", qty: 1, options: ["bbq"], note: "Saus BBQ pedas" },
        { menuId: "lemon-tea", qty: 1, options: [], note: "" },
      ]),
      total: 20000,
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
        { menuId: "ayam-geprek", qty: 2, options: [], note: "" },
        { menuId: "milo", qty: 2, options: [], note: "Dingin" },
      ]),
      total: 50000,
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
      items: orderItems([{ menuId: "mie-tektek", qty: 2, options: [], note: "Pedas sedang" }]),
      total: 32000,
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
        { menuId: "chicken-katsu", qty: 1, options: ["sambal-geprek"], note: "" },
        { menuId: "teh-tarik", qty: 1, options: [], note: "" },
      ]),
      total: 21000,
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
        { menuId: "spaghetti-carbonara", qty: 1, options: [], note: "" },
        { menuId: "kopi", qty: 1, options: [], note: "Panas" },
      ]),
      total: 20000,
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
        { menuId: "nasi-goreng-kecap", qty: 1, options: [], note: "Pedas" },
        { menuId: "kentang-katsu", qty: 1, options: ["bbq"], note: "" },
      ]),
      total: 34000,
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
        { menuId: "nasi-goreng-cikur", qty: 1, options: [], note: "" },
        { menuId: "lemon-tea", qty: 1, options: [], note: "" },
      ]),
      total: 19000,
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
        { menuId: "kapal-selam-besar", qty: 2, options: [], note: "Cuko pedas" },
        { menuId: "milo", qty: 1, options: [], note: "" },
      ]),
      total: 36000,
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
        { menuId: "kentang-sosis", qty: 1, options: [], note: "" },
        { menuId: "nutrisari", qty: 1, options: [], note: "Dingin" },
      ]),
      total: 19000,
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
        { menuId: "ayam-besar", qty: 1, options: [], note: "Paha atas" },
        { menuId: "lemon-tea", qty: 1, options: [], note: "" },
      ]),
      total: 12500,
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
