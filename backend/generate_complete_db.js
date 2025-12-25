const fs = require("fs");

const CONFIG = {
  NUM_USERS: 300,
  NUM_INTERACTIONS: 15000,
  NUM_PROVIDERS: 3,
};

const generateObjectId = () =>
  [...Array(24)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

const getRandomDate = (daysBack = 120) => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 86400000);
  return { $date: past.toISOString() };
};

const providerNames = [
  "HTX Nông Nghiệp Xanh",
  "Nông Trại Organic Đà Lạt",
  "Vườn Của Mẹ",
];

const generatedProviders = [];
const providerIds = [];

for (let i = 0; i < CONFIG.NUM_PROVIDERS; i++) {
  const pid = generateObjectId();
  const pName = providerNames[i];

  generatedProviders.push({
    _id: { $oid: pid },
    name: pName,
    email: `contact.${i + 1}@agrifarm.vn`,
    phone: `09${Math.floor(Math.random() * 100000000)}`,
    address: `Vùng nguyên liệu số ${i + 1}`,
    isActive: true,
  });

  providerIds.push(pid);
}
console.log(`   -> Đã tạo ${providerIds.length} nhà cung cấp.`);

console.log("🛠 2. Khởi tạo Danh mục (Categories)...");

const catalogTree = [
  {
    name: "Rau Củ Tươi",
    subs: [
      { n: "Rau Ăn Lá", c: "rau-la" },
      { n: "Củ Quả (Nấu)", c: "cu-qua" },
      { n: "Rau Gia Vị", c: "rau-thom" },
      { n: "Nấm Tươi & Khô", c: "nam" },
    ],
  },
  {
    name: "Trái Cây Đặc Sản",
    subs: [
      { n: "Trái Cây Miệt Vườn", c: "trai-cay-vuon" },
      { n: "Trái Cây Ôn Đới", c: "trai-cay-lanh" },
      { n: "Trái Cây Sấy Dẻo/Khô", c: "trai-cay-say" },
    ],
  },
  {
    name: "Ngũ Cốc & Hạt",
    subs: [
      { n: "Gạo Đặc Sản", c: "gao" },
      { n: "Đậu Đỗ Các Loại", c: "dau-do" },
      { n: "Hạt Dinh Dưỡng", c: "hat-kho" },
      { n: "Khoai & Sắn", c: "khoai-san" },
    ],
  },
  {
    name: "Dược Liệu & Gia Vị",
    subs: [
      { n: "Gia Vị Thô (Hạt/Củ)", c: "gia-vi-tho" },
      { n: "Thảo Mộc & Trà Lá", c: "thao-moc" },
      { n: "Mật Ong & Phấn Hoa", c: "mat-ong" },
    ],
  },
];

const generatedCategories = [];
const subCatMap = {};

catalogTree.forEach((parent) => {
  const parentId = generateObjectId();
  generatedCategories.push({
    _id: { $oid: parentId },
    name: parent.name,
    isActive: true,
  });
  parent.subs.forEach((sub) => {
    const subId = generateObjectId();
    generatedCategories.push({
      _id: { $oid: subId },
      name: sub.n,
      parentType: { $oid: parentId },
      isActive: true,
      profitMargin: 0.3,
    });
    subCatMap[sub.c] = subId;
  });
});
console.log(`   -> Đã tạo ${generatedCategories.length} danh mục.`);

console.log("Khởi tạo Sản phẩm");

const rawProducts = [
  {
    s: "bap-my",
    n: "Bắp Mỹ Nguyên Vỏ",
    o: "Đồng Nai",
    sub: "cu-qua",
    d: "Bắp ngọt tự nhiên, hạt vàng đều.",
  },
  {
    s: "cu-cai-trang",
    n: "Củ Cải Trắng",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Củ cải trắng to, chắc thịt.",
  },
  {
    s: "nam-dui-ga",
    n: "Nấm Đùi Gà",
    o: "Long Khánh",
    sub: "nam",
    d: "Nấm tươi thân mập, giòn ngọt.",
  },
  {
    s: "nam-kim-cham",
    n: "Nấm Kim Châm",
    o: "Đà Lạt",
    sub: "nam",
    d: "Nấm trắng tinh, dai giòn.",
  },
  {
    s: "rau-tan-o",
    n: "Rau Tần Ô",
    o: "Lâm Đồng",
    sub: "rau-la",
    d: "Rau cải cúc thơm nồng.",
  },
  {
    s: "khoai-mon",
    n: "Khoai Môn Sáp",
    o: "Trà Vinh",
    sub: "khoai-san",
    d: "Khoai môn củ cái, ruột tím.",
  },

  {
    s: "chanh-khong-hat",
    n: "Chanh Không Hạt",
    o: "Long An",
    sub: "gia-vi-tho",
    d: "Chanh vỏ mỏng, mọng nước.",
  },
  {
    s: "sa-tuoi",
    n: "Sả Cây Tươi",
    o: "Tiền Giang",
    sub: "gia-vi-tho",
    d: "Sả cây gốc to.",
  },
  {
    s: "gung-ta",
    n: "Gừng Ta Củ Nhỏ",
    o: "Đắk Lắk",
    sub: "gia-vi-tho",
    d: "Gừng sẻ củ nhỏ, cay nồng.",
  },
  {
    s: "mat-ong-rung",
    n: "Mật Ong Rừng Tràm",
    o: "Cà Mau",
    sub: "mat-ong",
    d: "Mật ong thiên nhiên rừng U Minh.",
  },
  {
    s: "hat-chia",
    n: "Hạt Chia Đen",
    o: "Nhập khẩu",
    sub: "hat-kho",
    d: "Hạt chia giàu Omega-3.",
  },
  {
    s: "nha-dam",
    n: "Lá Nha Đam",
    o: "Ninh Thuận",
    sub: "rau-la",
    d: "Bẹ nha đam to, thịt dày.",
  },

  {
    s: "yen-mach",
    n: "Yến Mạch",
    o: "Nhập khẩu",
    sub: "hat-kho",
    d: "Yến mạch cán dẹt.",
  },
  {
    s: "hanh-nhan",
    n: "Hạnh Nhân Sấy",
    o: "Sapa",
    sub: "hat-kho",
    d: "Hạnh nhân tách vỏ, sấy mộc.",
  },
  {
    s: "oc-cho",
    n: "Quả Óc Chó",
    o: "Sơn La",
    sub: "hat-kho",
    d: "Óc chó rừng Tây Bắc.",
  },
  {
    s: "chuoi-lab",
    n: "Chuối Laba",
    o: "Đà Lạt",
    sub: "trai-cay-vuon",
    d: "Chuối Laba dẻo thơm.",
  },
  {
    s: "dau-nanh",
    n: "Hạt Đậu Nành",
    o: "Hải Dương",
    sub: "dau-do",
    d: "Đậu nành hạt vàng.",
  },

  {
    s: "que-thanh",
    n: "Quế Thanh",
    o: "Yên Bái",
    sub: "gia-vi-tho",
    d: "Vỏ quế cạo sạch, cay ngọt.",
  },
  {
    s: "hoa-hoi",
    n: "Hoa Hồi Khô",
    o: "Lạng Sơn",
    sub: "gia-vi-tho",
    d: "Cánh hồi bung đều.",
  },
  {
    s: "thao-qua",
    n: "Thảo Quả",
    o: "Lào Cai",
    sub: "gia-vi-tho",
    d: "Nữ hoàng gia vị vùng cao.",
  },
  {
    s: "hanh-tay",
    n: "Hành Tây",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Hành tây củ to, trắng.",
  },
  {
    s: "hanh-tim",
    n: "Hành Tím",
    o: "Sóc Trăng",
    sub: "gia-vi-tho",
    d: "Hành tím củ tròn, phi thơm.",
  },

  {
    s: "buoi-nam-roi",
    n: "Bưởi Năm Roi",
    o: "Vĩnh Long",
    sub: "trai-cay-vuon",
    d: "Bưởi tép trắng, chua ngọt.",
  },
  {
    s: "vu-sua",
    n: "Vú Sữa Lò Rèn",
    o: "Tiền Giang",
    sub: "trai-cay-vuon",
    d: "Vú sữa vỏ mỏng, nước ngọt.",
  },
  {
    s: "cam-sanh",
    n: "Cam Sành",
    o: "Hậu Giang",
    sub: "trai-cay-vuon",
    d: "Cam sành mọng nước.",
  },
  {
    s: "chom-chom-nhan",
    n: "Chôm Chôm Nhãn",
    o: "Bến Tre",
    sub: "trai-cay-vuon",
    d: "Trái nhỏ, hạt nhỏ, tróc vỏ.",
  },

  {
    s: "khoai-lang-say",
    n: "Khoai Lang Sấy",
    o: "Đà Lạt",
    sub: "trai-cay-say",
    d: "Khoai lang sấy giòn.",
  },
  {
    s: "mit-say",
    n: "Mít Sấy Mộc",
    o: "Đồng Nai",
    sub: "trai-cay-say",
    d: "Mít chín cây sấy thăng hoa.",
  },
  {
    s: "hat-dieu",
    n: "Hạt Điều Rang Củi",
    o: "Bình Phước",
    sub: "hat-kho",
    d: "Hạt điều còn vỏ lụa.",
  },
  {
    s: "mac-ca",
    n: "Hạt Mắc Ca",
    o: "Đắk Lắk",
    sub: "hat-kho",
    d: "Hạt tròn, trắng sữa, béo.",
  },

  {
    s: "bi-do-ho-lo",
    n: "Bí Đỏ Hồ Lô",
    o: "Đắk Nông",
    sub: "cu-qua",
    d: "Bí đỏ dẻo quánh, ngọt bùi.",
  },
  {
    s: "ca-rot",
    n: "Cà Rốt",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Cà rốt củ nhỏ, cam đậm.",
  },
  {
    s: "su-hao",
    n: "Su Hào",
    o: "Mộc Châu",
    sub: "cu-qua",
    d: "Su hào củ non, giòn ngọt.",
  },
  {
    s: "hat-sen-tuoi",
    n: "Hạt Sen Tươi",
    o: "Đồng Tháp",
    sub: "hat-kho",
    d: "Hạt sen bóc vỏ, bở tơi.",
  },

  {
    s: "gao-st25",
    n: "Gạo ST25",
    o: "Sóc Trăng",
    sub: "gao",
    d: "Gạo ngon nhất thế giới.",
  },
  {
    s: "gao-lut-do",
    n: "Gạo Lứt Đỏ",
    o: "Điện Biên",
    sub: "gao",
    d: "Gạo đỏ nguyên cám.",
  },
  {
    s: "nep-nuong",
    n: "Nếp Nương",
    o: "Điện Biên",
    sub: "gao",
    d: "Hạt nếp to tròn.",
  },
  {
    s: "khoai-lang-mat",
    n: "Khoai Lang Mật",
    o: "Tà Nung",
    sub: "khoai-san",
    d: "Khoai lang ruột cam.",
  },

  {
    s: "xa-lach-lo-lo",
    n: "Xà Lách Lô Lô",
    o: "Đà Lạt",
    sub: "rau-la",
    d: "Lá xoăn xanh mướt.",
  },
  {
    s: "ca-chua-bi",
    n: "Cà Chua Bi",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Trái nhỏ mọng nước.",
  },
  {
    s: "dua-leo-baby",
    n: "Dưa Leo Baby",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Trái nhỏ đặc ruột.",
  },
  {
    s: "bo-sap",
    n: "Bơ Sáp 034",
    o: "Bảo Lộc",
    sub: "trai-cay-vuon",
    d: "Bơ dáng dài, cơm vàng.",
  },

  {
    s: "atiso",
    n: "Hoa Atiso",
    o: "Đà Lạt",
    sub: "thao-moc",
    d: "Bông atiso lớn, mát gan.",
  },
  {
    s: "la-tia-to",
    n: "Tía Tô",
    o: "Hà Nội",
    sub: "rau-thom",
    d: "Lá tím thơm nồng.",
  },
  {
    s: "ngai-cuu",
    n: "Rau Ngải Cứu",
    o: "Hưng Yên",
    sub: "rau-thom",
    d: "Vị đắng nhẹ, bổ dưỡng.",
  },
  {
    s: "tam-that",
    n: "Củ Tam Thất",
    o: "Hà Giang",
    sub: "gia-vi-tho",
    d: "Dược liệu quý.",
  },

  {
    s: "rau-muong",
    n: "Rau Muống Đồng",
    o: "Nam Định",
    sub: "rau-la",
    d: "Rau muống ngọn đỏ.",
  },
  {
    s: "rau-ngot",
    n: "Rau Ngót",
    o: "Bình Dương",
    sub: "rau-la",
    d: "Rau ngót lá xanh đậm.",
  },
  {
    s: "dau-ve",
    n: "Đậu Cove",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Đậu que hạt nhỏ.",
  },
  {
    s: "bi-dao",
    n: "Bí Đao",
    o: "Hòa Bình",
    sub: "cu-qua",
    d: "Bí đao trái dài.",
  },
  {
    s: "sau-rieng",
    n: "Sầu Riêng Ri6",
    o: "Tiền Giang",
    sub: "trai-cay-vuon",
    d: "Cơm vàng hạt lép.",
  },
  {
    s: "mang-cut",
    n: "Măng Cụt",
    o: "Lái Thiêu",
    sub: "trai-cay-vuon",
    d: "Chua ngọt thanh khiết.",
  },
  {
    s: "thanh-long",
    n: "Thanh Long Đỏ",
    o: "Long An",
    sub: "trai-cay-vuon",
    d: "Ruột đỏ thẫm, ngọt mát.",
  },
  {
    s: "dua-luoi",
    n: "Dưa Lưới Taki",
    o: "Bình Thuận",
    sub: "trai-cay-vuon",
    d: "Vân lưới đẹp, ruột cam.",
  },
  {
    s: "dau-den",
    n: "Đậu Đen Xanh Lòng",
    o: "Quảng Nam",
    sub: "dau-do",
    d: "Hạt nhỏ ruột xanh.",
  },
  {
    s: "dau-xanh",
    n: "Đậu Xanh Cà Vỏ",
    o: "Đắk Lắk",
    sub: "dau-do",
    d: "Đậu xanh hạt mẩy.",
  },
  {
    s: "me-den",
    n: "Mè Đen",
    o: "Nghệ An",
    sub: "hat-kho",
    d: "Hạt mè đen bóng.",
  },
  {
    s: "lac-do",
    n: "Lạc Đỏ",
    o: "Nghệ An",
    sub: "dau-do",
    d: "Lạc sẻ hạt nhỏ.",
  },
  {
    s: "tieu-so",
    n: "Tiêu Sọ",
    o: "Phú Quốc",
    sub: "gia-vi-tho",
    d: "Tiêu sọ hạt trắng.",
  },
  {
    s: "toi-ly-son",
    n: "Tỏi Cô Đơn",
    o: "Lý Sơn",
    sub: "gia-vi-tho",
    d: "Tỏi một nhánh.",
  },
  {
    s: "ot-xiem",
    n: "Ớt Xiêm Xanh",
    o: "Quảng Ngãi",
    sub: "gia-vi-tho",
    d: "Ớt rừng trái nhỏ.",
  },
  {
    s: "nghe-tuoi",
    n: "Nghệ Tươi",
    o: "Hưng Yên",
    sub: "gia-vi-tho",
    d: "Củ nghệ vàng cam.",
  },
  {
    s: "nu-voi",
    n: "Nụ Vối Khô",
    o: "Thái Bình",
    sub: "thao-moc",
    d: "Nụ vối phơi khô.",
  },
  {
    s: "la-sen",
    n: "Lá Sen Khô",
    o: "Đồng Tháp",
    sub: "thao-moc",
    d: "Lá sen bánh tẻ.",
  },
  {
    s: "long-nhan",
    n: "Long Nhãn",
    o: "Hưng Yên",
    sub: "trai-cay-say",
    d: "Cùi nhãn sấy dẻo.",
  },
  {
    s: "tao-do",
    n: "Táo Đỏ Khô",
    o: "Nhập khẩu",
    sub: "trai-cay-say",
    d: "Táo đỏ trái to.",
  },
  {
    s: "che-day",
    n: "Chè Dây",
    o: "Cao Bằng",
    sub: "thao-moc",
    d: "Chè dây sấy khô.",
  },
  {
    s: "la-pandan",
    n: "Lá Dứa",
    o: "Miền Tây",
    sub: "rau-thom",
    d: "Lá thơm nức, dùng nấu xôi.",
  },
  {
    s: "bot-san-day",
    n: "Bột Sắn Dây",
    o: "Kinh Môn",
    sub: "khoai-san",
    d: "Tinh bột sắn dây trắng tinh.",
  },
  {
    s: "dua-xiem",
    n: "Dừa Xiêm Xanh",
    o: "Bến Tre",
    sub: "trai-cay-vuon",
    d: "Nước dừa ngọt thanh.",
  },
  {
    s: "cu-den",
    n: "Củ Dền",
    o: "Đà Lạt",
    sub: "cu-qua",
    d: "Củ dền đỏ thẫm.",
  },
  {
    s: "hanh-la",
    n: "Hành Lá",
    o: "Hải Dương",
    sub: "rau-thom",
    d: "Hành lá gốc trắng.",
  },
  {
    s: "ngo-ri",
    n: "Ngò Rí",
    o: "Hưng Yên",
    sub: "rau-thom",
    d: "Rau mùi thơm.",
  },
  {
    s: "mang-tay",
    n: "Măng Tây Xanh",
    o: "Ninh Thuận",
    sub: "rau-la",
    d: "Măng tây thân mảnh.",
  },
  {
    s: "khoai-lang-tim",
    n: "Khoai Lang Tím",
    o: "Vĩnh Long",
    sub: "khoai-san",
    d: "Khoai tím đậm.",
  },
  {
    s: "chanh-day",
    n: "Chanh Dây",
    o: "Đắk Nông",
    sub: "trai-cay-vuon",
    d: "Ruột vàng, chua ngọt.",
  },
];

const generatedProducts = [];
const productLookup = {};

rawProducts.forEach((p) => {
  const pid = generateObjectId();
  const randomProviderId =
    providerIds[Math.floor(Math.random() * providerIds.length)];

  generatedProducts.push({
    _id: { $oid: pid },
    name: p.n,
    slug: p.s,
    description: p.d,
    provinceOfOrigin: p.o,
    type: { $oid: subCatMap[p.sub] },
    provider: { $oid: randomProviderId },
    unit: ["", "gói", "bó", "túi"][Math.floor(Math.random() * 4)],
    weight: 1,
    isActive: true,
    createdAt: getRandomDate(),
    images: [`https://agri-stock.vn/img/${p.s}.jpg`],
  });
  productLookup[p.s] = pid;
});
console.log(`   -> Đã tạo ${generatedProducts.length} sản phẩm.`);

console.log("Sinh Interactions");

const scenarios = [
  {
    id: 1,
    name: "Nấu Lẩu Nấm Chay",
    items: [
      "nam-dui-ga",
      "nam-kim-cham",
      "bap-my",
      "cu-cai-trang",
      "rau-tan-o",
      "dau-hu",
    ],
  },
  {
    id: 2,
    name: "Gia Vị Phở Bò",
    items: [
      "que-thanh",
      "hoa-hoi",
      "thao-qua",
      "gung-ta",
      "hanh-tay",
      "hanh-tim",
    ],
  },
  {
    id: 3,
    name: "Nước Detox",
    items: [
      "chanh-khong-hat",
      "sa-tuoi",
      "gung-ta",
      "mat-ong-rung",
      "hat-chia",
      "bac-ha",
    ],
  },
  {
    id: 4,
    name: "Ngũ Cốc Ăn Kiêng",
    items: ["yen-mach", "hanh-nhan", "oc-cho", "chuoi-lab", "mat-ong-rung"],
  },
  {
    id: 5,
    name: "Chè Dưỡng Nhan",
    items: ["tao-do", "long-nhan", "hat-sen-tuoi", "hat-chia", "la-pandan"],
  },
  {
    id: 6,
    name: "Ăn Vặt Văn Phòng",
    items: ["khoai-lang-say", "mit-say", "hat-dieu", "mac-ca", "chuoi-lab"],
  },
  {
    id: 7,
    name: "Trái Cây Giải Nhiệt",
    items: ["dua-xiem", "dua-luoi", "thanh-long", "chanh-day", "buoi-nam-roi"],
  },
  {
    id: 8,
    name: "Rau Luộc Kho Quẹt",
    items: ["dau-ve", "cu-cai-trang", "ca-rot", "su-hao", "bap-my"],
  },
  {
    id: 9,
    name: "Xôi Mặn Sáng",
    items: ["nep-nuong", "hanh-tim", "lap-xuong", "dau-xanh", "la-pandan"],
  },
  {
    id: 10,
    name: "Sữa Hạt Tại Nhà",
    items: [
      "dau-nanh",
      "dau-den",
      "me-den",
      "oc-cho",
      "hanh-nhan",
      "la-pandan",
    ],
  },
  {
    id: 11,
    name: "Canh Chua Miền Tây",
    items: ["bac-ha", "thom", "dau-bap", "me-chua", "ngo-ri", "ot-xiem"],
  },
  {
    id: 12,
    name: "Đồ Uống Ấm",
    items: ["nu-voi", "che-day", "gung-ta", "mat-ong-rung", "la-sen"],
  },
  {
    id: 13,
    name: "Salad Trộn",
    items: [
      "xa-lach-lo-lo",
      "ca-chua-bi",
      "dua-leo-baby",
      "bo-sap",
      "trung-ga",
    ],
  },
  {
    id: 14,
    name: "Làm Bánh Trôi",
    items: ["bot-san-day", "duong-phen", "me-trang", "gung-ta", "dua-nao"],
  },
  {
    id: 15,
    name: "Gia Vị Kho Cá",
    items: ["nghe-tuoi", "geng-ta", "ot-xiem", "hanh-tim", "tieu-so"],
  },
  {
    id: 16,
    name: "Trái Cây Cao Cấp",
    items: ["mang-cut", "sau-rieng", "bo-sap", "nho-xanh", "cherry"],
  },
  {
    id: 17,
    name: "Hầm Canh Bổ Dưỡng",
    items: ["cu-den", "khoai-tay", "ca-rot", "bap-my", "hanh-tay"],
  },
  {
    id: 18,
    name: "Rau Sống Cuốn",
    items: [
      "xa-lach-lo-lo",
      "la-tia-to",
      "rau-ngai-cuu",
      "dua-leo-baby",
      "thom",
    ],
  },
  {
    id: 19,
    name: "Cơm Gạo Lứt",
    items: ["gao-lut-do", "me-den", "dau-ve", "nam-dui-ga", "lac-do"],
  },
  {
    id: 20,
    name: "Khoai Sắn Hấp",
    items: [
      "khoai-lang-mat",
      "khoai-mon",
      "khoai-lang-tim",
      "cot-dua",
      "me-trang",
    ],
  },
  {
    id: 21,
    name: "Gia Vị Hằng Ngày",
    items: ["toi-ly-son", "hanh-tim", "tieu-so", "nuoc-mam", "duong-phen"],
  },
  {
    id: 22,
    name: "Nước Ép Xanh",
    items: ["can-tay", "tao-xanh", "thom", "dua-leo-baby", "gung-ta"],
  },
  {
    id: 23,
    name: "Cháo Giải Cảm",
    items: ["gao-st25", "la-tia-to", "hanh-la", "tieu-so", "trung-ga"],
  },
  {
    id: 24,
    name: "Đậu Hũ Sốt Cà",
    items: ["dau-hu", "ca-chua-chin", "hanh-la", "ngo-ri", "tieu-so"],
  },
  {
    id: 25,
    name: "Mâm Ngũ Quả",
    items: ["chuoi-xanh", "buoi-nam-roi", "quyt", "thanh-long", "xoai-cat"],
  },
];

const generatedInteractions = [];
const users = Array.from({ length: CONFIG.NUM_USERS }, (_, i) => `u${i + 1}`);

// Gán "Persona" cho User
const userPersonas = {};
users.forEach((u) => {
  const numInterests = Math.floor(Math.random() * 2) + 2;
  const interests = [];
  for (let k = 0; k < numInterests; k++) {
    interests.push(scenarios[Math.floor(Math.random() * scenarios.length)]);
  }
  userPersonas[u] = interests;
});

// Sinh interaction
for (let i = 0; i < CONFIG.NUM_INTERACTIONS; i++) {
  const userId = users[Math.floor(Math.random() * users.length)];
  const persona = userPersonas[userId];

  // Chọn kịch bản user thích (80%) hoặc random khám phá (20%)
  let selectedScenario;
  if (Math.random() < 0.8) {
    selectedScenario = persona[Math.floor(Math.random() * persona.length)];
  } else {
    selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  // Lọc sản phẩm valid
  const validItems = selectedScenario.items.filter(
    (slug) => productLookup[slug]
  );
  if (validItems.length === 0) continue;

  // Số lượng mua trong phiên (4 đến 8 món)
  const sessionSize = Math.floor(Math.random() * 5) + 4;
  const sessionItems = validItems
    .sort(() => 0.5 - Math.random())
    .slice(0, sessionSize);

  if (sessionItems.length < 4) {
    const keys = Object.keys(productLookup);
    for (let k = 0; k < 4 - sessionItems.length; k++) {
      const randomSlug = keys[Math.floor(Math.random() * keys.length)];
      if (!sessionItems.includes(randomSlug)) sessionItems.push(randomSlug);
    }
  }

  // Tạo chuỗi hành động View -> Cart -> Buy
  const sessionTime = getRandomDate(60).$date;

  sessionItems.forEach((slug) => {
    const pid = productLookup[slug];
    if (!pid) return;

    //View (100%)
    generatedInteractions.push({
      user_id: userId,
      product_id: { $oid: pid },
      interaction_type: "view",
      timestamp: { $date: sessionTime },
    });

    //Add to Cart (50%)
    if (Math.random() < 0.5) {
      generatedInteractions.push({
        user_id: userId,
        product_id: { $oid: pid },
        interaction_type: "add_to_cart",
        timestamp: { $date: sessionTime },
      });

      //Purchase (30% của Cart)
      if (Math.random() < 0.6) {
        generatedInteractions.push({
          user_id: userId,
          product_id: { $oid: pid },
          interaction_type: "purchase",
          timestamp: { $date: sessionTime },
        });
      }
    }
  });
}
console.log(`Đã tạo ${generatedInteractions.length} tương tác.`);

try {
  fs.writeFileSync(
    "provider.json",
    JSON.stringify(generatedProviders, null, 2)
  );
  fs.writeFileSync(
    "typeofagriproduct.json",
    JSON.stringify(generatedCategories, null, 2)
  );
  fs.writeFileSync("product.json", JSON.stringify(generatedProducts, null, 2));
  fs.writeFileSync(
    "interaction.json",
    JSON.stringify(generatedInteractions, null, 2)
  );

  console.log("Đã xuất ra 4 file:");
  console.log("   - provider.json");
  console.log("   - typeofagriproduct.json");
  console.log("   - product.json");
  console.log("   - interaction.json");
} catch (err) {
  console.error("Lỗi khi ghi file:", err);
}
