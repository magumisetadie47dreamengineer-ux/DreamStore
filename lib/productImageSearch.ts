const USER_AGENT = "DreamStore/1.0 (product catalog; +https://github.com)";

const SKIP_TITLE = /\b(logo|icon|diagram|schematic|wiring|manual|box art|papercraft|unboxing|person holding|people|woman|man|child|crowd)\b/i;
const SKIP_EXT = /\.(svg|gif|pdf|webm|ogv)$/i;

const CATEGORY_HINT: Record<string, string> = {
  Laptops: "laptop computer",
  Smartphones: "smartphone",
  "Bluetooth Speakers": "bluetooth speaker",
  Chargers: "phone charger",
  "Earphones & Earbuds": "earbuds",
  Storage: "usb flash drive",
  Gadgets: "tech gadget",
};

export type ImageSource = "wikimedia" | "openverse" | "pexels" | "cache";

export type ImageSearchResult = {
  url: string;
  source: ImageSource;
  query: string;
  title: string;
};

/** Product name before specs, for image search. */
export function buildSearchQueries(name: string, category: string): string[] {
  const primary = name
    .split(" — ")[0]
    .split(" - ")[0]
    .replace(/"/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const hint = CATEGORY_HINT[category] ?? "electronics";
  const queries = new Set<string>([
    primary,
    `${primary} ${hint}`,
    `${primary} product photo`,
  ]);

  const stripped = primary
    .replace(/\b(portable|wireless|wired|mini|universal|refurb)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped !== primary) {
    queries.add(`${stripped} ${hint}`);
  }

  const words = primary.split(/\s+/);
  if (words.length >= 2) {
    queries.add(`${words.slice(0, 2).join(" ")} ${hint}`);
    queries.add(`${words.slice(0, 3).join(" ")} ${hint}`);
  }

  if (/charger|charging|power bank|adapter/i.test(primary)) {
    queries.add(`${words[0]} ${primary.match(/\d+\s*W/i)?.[0] ?? ""} charger`.trim());
    queries.add(primary.replace(/\bsuper fast\b/i, "").trim());
  }

  if (/airpods|earbuds|earphones|buds/i.test(primary)) {
    queries.add(primary.replace(/\(\d+.*?\)/g, "").trim());
    queries.add(`${words.slice(0, 3).join(" ")} earbuds`);
  }

  if (/flash drive|microsd|ssd|hdd|storage/i.test(primary)) {
    queries.add(`${words.slice(0, 2).join(" ")} ${hint}`);
    queries.add(primary.replace(/\bUSB.*$/i, "USB flash drive").trim());
  }

  if (/speaker/i.test(primary)) {
    queries.add(`${words.slice(0, 3).join(" ")} bluetooth speaker`);
  }

  return [...queries];
}

function scoreTitle(title: string, query: string): number {
  const t = title.toLowerCase().replace(/^file:/, "");
  const q = query.toLowerCase();
  if (SKIP_TITLE.test(t) || SKIP_EXT.test(t)) return -1000;

  const qTokens = q
    .split(/[\s—\-]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2);

  let score = 0;
  for (const token of qTokens) {
    if (t.includes(token)) score += 12;
  }

  if (/\b(product|phone|laptop|speaker|earbud|charger|ssd|drive)\b/i.test(t)) {
    score += 4;
  }
  if (t.includes("svg")) score -= 200;

  const variants = [
    "macbook",
    "ipad",
    "iphone 14",
    "iphone 15",
    "iphone 16",
    "galaxy s24",
    "galaxy s23",
    "galaxy a",
    "pro max",
  ];
  for (const v of variants) {
    if (t.includes(v) && !q.includes(v)) score -= 18;
  }
  if (q.includes("iphone 13") && !q.includes("pro") && t.includes("pro")) score -= 20;

  const brand = qTokens[0];
  if (brand && brand.length >= 3 && !t.includes(brand)) score -= 35;

  if (q.includes("microsd") && !/microsd|sd card|memory card/i.test(t)) score -= 30;
  if (q.includes("ssd") && !/ssd|solid state|portable drive/i.test(t)) score -= 20;
  if (/\bjbl\b/i.test(q) && !/\bjbl\b/i.test(t)) score -= 40;

  return score;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type WikimediaResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: { url?: string; thumburl?: string; mime?: string }[];
      }
    >;
  };
};

export async function searchWikimedia(query: string): Promise<ImageSearchResult | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "800",
    format: "json",
    origin: "*",
  });

  const data = await fetchJson<WikimediaResponse>(
    `https://commons.wikimedia.org/w/api.php?${params}`
  );
  const pages = data?.query?.pages;
  if (!pages) return null;

  let best: { score: number; url: string; title: string } | null = null;

  for (const page of Object.values(pages)) {
    const title = page.title ?? "";
    const info = page.imageinfo?.[0];
    const mime = info?.mime ?? "";
    if (mime.includes("svg") || mime.includes("gif")) continue;

    const url = info?.thumburl || info?.url;
    if (!url || SKIP_EXT.test(url)) continue;

    const score = scoreTitle(title, query);
    if (!best || score > best.score) {
      best = { score, url, title };
    }
  }

  if (!best || best.score < 6) return null;

  return {
    url: best.url,
    source: "wikimedia",
    query,
    title: best.title,
  };
}

type OpenverseResponse = {
  results?: { title?: string; url?: string; thumbnail?: string }[];
};

export async function searchOpenverse(query: string): Promise<ImageSearchResult | null> {
  const params = new URLSearchParams({
    q: `${query} product`,
    page_size: "10",
    category: "photograph",
    license: "cc0,pdm,by,by-sa",
  });

  const data = await fetchJson<OpenverseResponse>(
    `https://api.openverse.org/v1/images/?${params}`
  );

  let best: { score: number; url: string; title: string } | null = null;

  for (const hit of data?.results ?? []) {
    const title = hit.title ?? "";
    const url = hit.url || hit.thumbnail;
    if (!url || SKIP_EXT.test(url) || SKIP_TITLE.test(title)) continue;

    const score = scoreTitle(title, query);
    if (!best || score > best.score) {
      best = { score, url, title };
    }
  }

  if (!best || best.score < 6) return null;

  return {
    url: best.url,
    source: "openverse",
    query,
    title: best.title,
  };
}

type PexelsResponse = {
  photos?: { alt?: string; src?: { large?: string; large2x?: string } }[];
};

export async function searchPexels(
  query: string,
  apiKey: string
): Promise<ImageSearchResult | null> {
  const params = new URLSearchParams({
    query,
    per_page: "8",
    orientation: "square",
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: {
      Authorization: apiKey,
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as PexelsResponse;

  let best: { score: number; url: string; title: string } | null = null;

  for (const photo of data.photos ?? []) {
    const title = photo.alt ?? query;
    const url = photo.src?.large2x || photo.src?.large;
    if (!url) continue;

    const score = scoreTitle(title, query) + 5;
    if (!best || score > best.score) {
      best = { score, url, title };
    }
  }

  if (!best || best.score < 4) return null;

  return {
    url: best.url,
    source: "pexels",
    query,
    title: best.title,
  };
}

export async function findProductImage(
  name: string,
  category: string,
  options?: { pexelsApiKey?: string }
): Promise<ImageSearchResult | null> {
  const queries = buildSearchQueries(name, category);
  const pexelsKey = options?.pexelsApiKey?.trim();
  const hint = CATEGORY_HINT[category] ?? "electronics";

  for (const query of queries) {
    const wiki = await searchWikimedia(query);
    await sleep(120);
    if (wiki) return wiki;
  }

  for (const query of queries) {
    const openverse = await searchOpenverse(query);
    await sleep(120);
    if (openverse) return openverse;
  }

  if (pexelsKey) {
    for (const query of queries.slice(0, 4)) {
      const pexels = await searchPexels(query, pexelsKey);
      await sleep(120);
      if (pexels) return pexels;
    }
  }

  const primary = name.split(" — ")[0].trim();
  const words = primary.split(/\s+/);
  const broadQueries = [
    `${words.slice(0, 2).join(" ")} ${hint}`,
    `${words.slice(0, 3).join(" ")} ${hint}`,
    `${primary.split(/\d/)[0].trim()} ${hint}`,
  ];

  for (const query of broadQueries) {
    if (!query || query.length < 4) continue;
    const wiki = await searchWikimedia(query);
    await sleep(120);
    if (wiki) return { ...wiki, query };
    const openverse = await searchOpenverse(query);
    await sleep(120);
    if (openverse) return { ...openverse, query };
  }

  const categoryFallback = await searchOpenverse(
    `${words.slice(0, 2).join(" ")} ${hint} product photo`
  );
  await sleep(120);
  if (categoryFallback && scoreTitle(categoryFallback.title, primary) >= -4) {
    return categoryFallback;
  }

  const openCategory = await searchOpenverse(`${hint} electronics product`);
  await sleep(120);
  if (openCategory) return openCategory;

  const LAST_RESORT_QUERY: Record<string, string> = {
    Laptops: "laptop computer product photo",
    Smartphones: "smartphone product photo",
    "Bluetooth Speakers": "portable bluetooth speaker",
    Chargers: "usb phone charger adapter",
    "Earphones & Earbuds": "wireless earbuds product",
    Storage: "usb flash drive product",
    Gadgets: "phone accessory product",
  };

  const lastQuery = LAST_RESORT_QUERY[category];
  if (lastQuery) {
    const last = await searchOpenverse(lastQuery);
    await sleep(120);
    if (last) return last;
  }

  return null;
}

export async function downloadProductImage(
  imageUrl: string,
  destPath: string
): Promise<boolean> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(30_000),
      redirect: "follow",
    });
    if (!res.ok) return false;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2_000) return false;

    const { writeFileSync } = await import("fs");
    writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}
