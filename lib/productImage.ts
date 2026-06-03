/** Curated product photos (Unsplash, stable IDs). */
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export function productImageSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const IMG = {
  laptop: U("1496181133206-80ce9b88a853"),
  samsungPhone: U("1511707171634-5f897ff02aa9"),
  foldablePhone: U("1632669720104-ae459893352"),
  iphone: U("1592285419646-496a1669c4f7"),
  btSpeaker: U("1608043152269-e4551a4d586d"),
  wallCharger: U("1620570639158-0a6b3148260e"),
  carCharger: U("1561145460459-3c5e9f4ae04b"),
  wirelessCharger: U("1612198188060-c99661ccb3da"),
  powerBank: U("1609091839311-d5365f9ff1c5"),
  chargingCable: U("1606144033755-0937e67abf57"),
  wiredEarphones: U("1484704847642-9628856aa9b0"),
  whiteEarphones: U("1546432010582-6d645a326a42"),
  earbuds: U("1572569511254-d4973818196a"),
  overEarHeadphones: U("1505740420928-5e560c06d30e"),
  airpods: U("1606841472452-42b92ac69206"),
  usbDrive: U("1597872200909-4a7d22544717"),
  microSd: U("1555949963-ba85e89d7806"),
  otgDrive: U("1611188654248-f06928181c68"),
  externalHdd: U("1531497865446-84586f3405a1"),
  portableSsd: U("1624825433244-4a9086d9e2d1"),
  ringLight: U("1624625079388-f40394312b36"),
  phoneGrip: U("1601784551446-20c9e634cdb0"),
  cameraRemote: U("1526170375885-ad4fd9b8f259"),
  phoneTripod: U("1516035069372-29b1f5dd7956"),
  hdmiAdapter: U("1611188654248-f06928181c68"),
  screenProtector: U("1511707171634-5f897ff02aa9"),
  phoneCase: U("1565849900754-04277d9e495c"),
  usbFan: U("1585771726444-4b360946e4d7"),
  deskLamp: U("1507473886341-ef5332ed1ae"),
  watchBand: U("1523275339700-f32fe2402474"),
};

/** Product slug → image URL (each entry matched to product type) */
const PRODUCT_IMAGES: Record<string, string> = {
  // Laptops
  "hp-14-laptop-celeron-n4020-4gb-ram-64gb-emmc": IMG.laptop,
  "asus-vivobook-14-pentium-silver-4gb-ram-128gb-ssd": IMG.laptop,
  "lenovo-ideapad-15-ryzen-3-8gb-ram-256gb-ssd": IMG.laptop,
  "acer-aspire-3-core-i3-8gb-ram-128gb-ssd": IMG.laptop,
  "dell-latitude-refurb-core-i5-8gb-ram-256gb-ssd": IMG.laptop,
  "chuwi-herobook-pro-n100-8gb-ram-256gb-ssd": IMG.laptop,

  // Samsung phones
  "samsung-galaxy-a05-4gb-ram-64gb": IMG.samsungPhone,
  "samsung-galaxy-a15-6gb-ram-128gb": IMG.samsungPhone,
  "samsung-galaxy-a25-8gb-ram-128gb": IMG.samsungPhone,
  "samsung-galaxy-a55-8gb-ram-256gb": IMG.samsungPhone,
  "samsung-galaxy-s23-8gb-ram-256gb": IMG.samsungPhone,
  "samsung-galaxy-s24-8gb-ram-256gb": IMG.samsungPhone,
  "samsung-galaxy-s24-ultra-12gb-ram-512gb": IMG.samsungPhone,
  "samsung-galaxy-z-flip-5-8gb-ram-256gb": IMG.foldablePhone,

  // iPhones
  "iphone-se-2022-64gb": IMG.iphone,
  "iphone-12-64gb": IMG.iphone,
  "iphone-13-128gb": IMG.iphone,
  "iphone-14-128gb": IMG.iphone,
  "iphone-15-128gb": IMG.iphone,
  "iphone-15-pro-256gb": IMG.iphone,
  "iphone-15-pro-max-256gb": IMG.iphone,
  "iphone-16-pro-max-512gb": IMG.iphone,

  // Bluetooth speakers
  "oraimo-obs-53-mini-bluetooth-speaker": IMG.btSpeaker,
  "jbl-go-3-portable-speaker": IMG.btSpeaker,
  "sony-srs-xb100-bluetooth-speaker": IMG.btSpeaker,
  "anker-soundcore-2-speaker": IMG.btSpeaker,
  "tribit-stormbox-micro-speaker": IMG.btSpeaker,

  // Chargers
  "usb-c-20w-wall-charger": IMG.wallCharger,
  "car-dual-usb-charger-3-4a": IMG.carCharger,
  "samsung-25w-super-fast-charger": IMG.wallCharger,
  "apple-20w-usb-c-power-adapter": IMG.wallCharger,
  "3-in-1-wireless-charging-pad": IMG.wirelessCharger,
  "10000mah-power-bank-usb-c-pd": IMG.powerBank,
  "3-in-1-charging-cable-kit": IMG.chargingCable,

  // Earphones & earbuds
  "wired-earphones-with-mic-3-5mm": IMG.wiredEarphones,
  "sony-mdr-e9lp-wired-earphones": IMG.wiredEarphones,
  "oraimo-freepods-lite-earbuds": IMG.earbuds,
  "apple-earpods-lightning": IMG.whiteEarphones,
  "xiaomi-redmi-buds-4-earbuds": IMG.earbuds,
  "jbl-tune-510bt-wireless-earphones": IMG.overEarHeadphones,
  "samsung-galaxy-buds-fe": IMG.earbuds,
  "apple-airpods-2nd-gen": IMG.airpods,
  "apple-airpods-pro-2nd-gen": IMG.airpods,

  // Storage
  "sandisk-32gb-usb-flash-drive": IMG.usbDrive,
  "sandisk-64gb-usb-3-0-flash-drive": IMG.usbDrive,
  "kingston-128gb-usb-flash-drive": IMG.usbDrive,
  "samsung-256gb-microsd-card": IMG.microSd,
  "32gb-otg-usb-for-android-phones": IMG.otgDrive,
  "sandisk-1tb-external-hdd": IMG.externalHdd,
  "samsung-t7-500gb-portable-ssd": IMG.portableSsd,

  // Gadgets
  "selfie-ring-light-clip": IMG.ringLight,
  "phone-pop-socket-grip": IMG.phoneGrip,
  "bluetooth-remote-shutter": IMG.cameraRemote,
  "phone-tripod-stand": IMG.phoneTripod,
  "usb-c-to-hdmi-adapter": IMG.hdmiAdapter,
  "tempered-glass-screen-protector-2-pack": IMG.screenProtector,
  "silicone-phone-case-universal-fit": IMG.phoneCase,
  "mini-usb-desk-fan": IMG.usbFan,
  "led-desk-lamp-usb-powered": IMG.deskLamp,
  "smartwatch-silicone-band": IMG.watchBand,
};

export const PRODUCT_IMAGE_FALLBACK = IMG.laptop;

export function productImageUrl(nameOrSlug: string) {
  const slug = nameOrSlug.includes(" ")
    ? productImageSlug(nameOrSlug)
    : nameOrSlug;
  return PRODUCT_IMAGES[slug] ?? PRODUCT_IMAGE_FALLBACK;
}

export function isProductImageMapped(name: string) {
  return productImageSlug(name) in PRODUCT_IMAGES;
}
