import React from "react";
import ReactDOM from "react-dom/client";
import { Download, Gauge, GitCompare, Info, Plus, Sparkles, Target, Trash2, UploadCloud } from "lucide-react";
import "./styles.css";

type HeadTrait = "低スピン" | "高スピン" | "つかまりやすい" | "つかまりにくい";
type ShotShape = "ドロー" | "フェード" | "ストレート";
type Concern = "引っかけ" | "スライス" | "高すぎる" | "低すぎる" | "スピン多い" | "スピン少ない";
type Feel = "しなり感あり" | "しっかり" | "中間";
type Flex = "R" | "SR" | "S" | "X" | "TX";
type ClubMode = "driver" | "iron";
type NumericOwnedKey = "buttStiffness" | "midStiffness" | "tipStiffness" | "catchBias" | "launch" | "spin";

type FlexProfile = {
  butt: number;
  mid: number;
  tip: number;
};

type Shaft = {
  id?: string;
  clubMode?: ClubMode;
  name: string;
  flex?: Flex;
  weight: string;
  torque: number;
  tipStiffness: number;
  midStiffness: number;
  buttStiffness: number;
  catchBias: number;
  launch: number;
  spin: number;
  speedRange: [number, number];
  trajectory: ShotShape | "ドロー寄り" | "フェード寄り" | "ニュートラル";
  comment: string;
  sourceName?: string;
  sourceUrl?: string;
  dataNote?: string;
};

type FormState = {
  clubMode: ClubMode;
  headName: string;
  headTrait: HeadTrait;
  headSpeed: number;
  desiredShape: ShotShape;
  concern: Concern;
  feel: Feel;
};

type MatchResult = {
  shaft: Shaft;
  score: number;
  reasons: string[];
};

type OwnedShaft = Shaft & {
  id: string;
  flex: Flex;
};

type ShaftReference = {
  clubMode: ClubMode;
  match: string[];
  displayName: string;
  sourceName: string;
  sourceUrl: string;
  base: Omit<Shaft, "name" | "weight" | "speedRange" | "comment">;
};

type StoredState = {
  form: FormState;
  ownedShafts: OwnedShaft[];
  selectedOwnedId: string;
  ownedDraft: Omit<OwnedShaft, "id">;
};

type ShareResult = {
  fileName: string;
  filePath: string;
  markdownName: string;
  markdownPath: string;
  notionPageName: string;
  notionPagePath: string;
  notionJsonName: string;
  notionJsonPath: string;
  manifestName: string;
  manifestPath: string;
  notionParentPageId: string;
  notionParentUrl: string;
  previewUrl: string;
};

type NotionUploadResult = {
  pageId: string;
  pageUrl: string;
  parentPageId: string;
  parentUrl: string;
  title: string;
};

const driverShafts: Shaft[] = [
  {
    name: "NS PRO Regio Formula M+",
    weight: "50g / 60g台",
    torque: 4.0,
    tipStiffness: 64,
    midStiffness: 58,
    buttStiffness: 70,
    catchBias: 72,
    launch: 68,
    spin: 58,
    speedRange: [38, 46],
    trajectory: "ドロー寄り",
    comment: "手元側に安定感を持たせつつ、ボールをつかまえやすい仮想設定。",
  },
  {
    name: "NS PRO Regio Formula B+",
    weight: "50g / 60g台",
    torque: 3.7,
    tipStiffness: 72,
    midStiffness: 66,
    buttStiffness: 62,
    catchBias: 54,
    launch: 56,
    spin: 50,
    speedRange: [40, 48],
    trajectory: "ニュートラル",
    comment: "中間から先端の動きを抑え、方向性を優先する仮想プロファイル。",
  },
  {
    name: "NS PRO Regio Formula MB+",
    weight: "50g / 60g台",
    torque: 3.5,
    tipStiffness: 76,
    midStiffness: 70,
    buttStiffness: 74,
    catchBias: 48,
    launch: 50,
    spin: 44,
    speedRange: [42, 50],
    trajectory: "フェード寄り",
    comment: "強めの入力でも左を抑えやすい、低スピン寄りの仮想設定。",
  },
  {
    name: "Diamana RF",
    weight: "50g / 60g台",
    torque: 4.2,
    tipStiffness: 58,
    midStiffness: 62,
    buttStiffness: 68,
    catchBias: 78,
    launch: 72,
    spin: 64,
    speedRange: [37, 45],
    trajectory: "ドロー寄り",
    comment: "しなり戻りを感じやすく、つかまりと高さを補う仮想モデル。",
  },
  {
    name: "Diamana BF",
    weight: "50g / 60g / 70g台",
    torque: 3.6,
    tipStiffness: 70,
    midStiffness: 68,
    buttStiffness: 66,
    catchBias: 56,
    launch: 58,
    spin: 52,
    speedRange: [40, 49],
    trajectory: "ニュートラル",
    comment: "クセを抑えた中弾道で、ヘッド特性を邪魔しにくい仮想設定。",
  },
  {
    name: "Diamana DF",
    weight: "60g / 70g台",
    torque: 3.2,
    tipStiffness: 82,
    midStiffness: 76,
    buttStiffness: 78,
    catchBias: 40,
    launch: 44,
    spin: 38,
    speedRange: [43, 53],
    trajectory: "フェード寄り",
    comment: "先端を強くして吹け上がりと左へのミスを抑える仮想プロファイル。",
  },
  {
    name: "Ventus Blue",
    weight: "50g / 60g / 70g台",
    torque: 3.4,
    tipStiffness: 74,
    midStiffness: 72,
    buttStiffness: 70,
    catchBias: 52,
    launch: 55,
    spin: 46,
    speedRange: [41, 51],
    trajectory: "ニュートラル",
    comment: "中元の安定感と適度な打ち出しを両立する仮想バランス。",
  },
  {
    name: "Ventus Black",
    weight: "60g / 70g台",
    torque: 3.0,
    tipStiffness: 88,
    midStiffness: 82,
    buttStiffness: 82,
    catchBias: 34,
    launch: 36,
    spin: 32,
    speedRange: [45, 55],
    trajectory: "フェード寄り",
    comment: "叩いても動きすぎない、低打ち出し・低スピンの仮想ハード設定。",
  },
  {
    name: "Tour AD DI",
    weight: "50g / 60g / 70g台",
    torque: 3.8,
    tipStiffness: 66,
    midStiffness: 56,
    buttStiffness: 72,
    catchBias: 68,
    launch: 66,
    spin: 56,
    speedRange: [39, 49],
    trajectory: "ドロー寄り",
    comment: "中間のしなりを使って押し出す感覚を出しやすい仮想設定。",
  },
  {
    name: "Tour AD UB",
    weight: "50g / 60g / 70g台",
    torque: 3.3,
    tipStiffness: 78,
    midStiffness: 74,
    buttStiffness: 76,
    catchBias: 44,
    launch: 48,
    spin: 40,
    speedRange: [42, 52],
    trajectory: "フェード寄り",
    comment: "つかまりを抑え、強い中低弾道を狙う仮想プロファイル。",
  },
];

const ironShafts: Shaft[] = [
  {
    clubMode: "iron",
    name: "NS PRO MODUS3 TOUR 105",
    weight: "100g台",
    torque: 1.7,
    tipStiffness: 70,
    midStiffness: 66,
    buttStiffness: 72,
    catchBias: 58,
    launch: 60,
    spin: 58,
    speedRange: [34, 42],
    trajectory: "ニュートラル",
    comment: "アイアンで高さと操作性を両立しやすい仮想設定。",
    sourceName: "Nippon Shaft MODUS3",
    sourceUrl: "https://nipponshaft.com/",
  },
  {
    clubMode: "iron",
    name: "NS PRO MODUS3 TOUR 120",
    weight: "110g / 120g台",
    torque: 1.6,
    tipStiffness: 74,
    midStiffness: 62,
    buttStiffness: 78,
    catchBias: 54,
    launch: 56,
    spin: 54,
    speedRange: [36, 44],
    trajectory: "ニュートラル",
    comment: "手元側の粘りを感じやすく、厚いインパクトを作る仮想プロファイル。",
    sourceName: "Nippon Shaft MODUS3",
    sourceUrl: "https://nipponshaft.com/",
  },
  {
    clubMode: "iron",
    name: "NS PRO MODUS3 TOUR 125",
    weight: "120g台",
    torque: 1.5,
    tipStiffness: 80,
    midStiffness: 72,
    buttStiffness: 80,
    catchBias: 46,
    launch: 48,
    spin: 48,
    speedRange: [39, 47],
    trajectory: "フェード寄り",
    comment: "強めの入射でも左と吹け上がりを抑えやすい仮想設定。",
    sourceName: "Nippon Shaft MODUS3",
    sourceUrl: "https://nipponshaft.com/",
  },
  {
    clubMode: "iron",
    name: "Dynamic Gold 105",
    weight: "100g台",
    torque: 1.8,
    tipStiffness: 72,
    midStiffness: 70,
    buttStiffness: 74,
    catchBias: 52,
    launch: 54,
    spin: 52,
    speedRange: [35, 43],
    trajectory: "ニュートラル",
    comment: "軽量スチールながら当たり負けしにくい仮想バランス。",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
  },
  {
    clubMode: "iron",
    name: "Dynamic Gold 120",
    weight: "110g / 120g台",
    torque: 1.6,
    tipStiffness: 78,
    midStiffness: 76,
    buttStiffness: 78,
    catchBias: 44,
    launch: 46,
    spin: 46,
    speedRange: [38, 46],
    trajectory: "フェード寄り",
    comment: "中低弾道で距離のばらつきを抑えたい人向けの仮想設定。",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
  },
  {
    clubMode: "iron",
    name: "Dynamic Gold S200",
    weight: "120g台",
    torque: 1.5,
    tipStiffness: 84,
    midStiffness: 80,
    buttStiffness: 82,
    catchBias: 40,
    launch: 42,
    spin: 44,
    speedRange: [40, 48],
    trajectory: "フェード寄り",
    comment: "重量感と低めの弾道で叩けるアイアン用仮想プロファイル。",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
  },
  {
    clubMode: "iron",
    name: "KBS TOUR",
    weight: "110g / 120g台",
    torque: 1.7,
    tipStiffness: 68,
    midStiffness: 72,
    buttStiffness: 76,
    catchBias: 56,
    launch: 62,
    spin: 60,
    speedRange: [36, 45],
    trajectory: "ニュートラル",
    comment: "適度な高さとスピンでグリーンに止めやすい仮想設定。",
    sourceName: "KBS Golf Shafts",
    sourceUrl: "https://kbsgolfshafts.com/",
  },
  {
    clubMode: "iron",
    name: "KBS C-TAPER",
    weight: "110g / 120g台",
    torque: 1.4,
    tipStiffness: 86,
    midStiffness: 82,
    buttStiffness: 84,
    catchBias: 38,
    launch: 40,
    spin: 38,
    speedRange: [40, 49],
    trajectory: "フェード寄り",
    comment: "低スピン・低打ち出しで左を抑える仮想ハード設定。",
    sourceName: "KBS Golf Shafts",
    sourceUrl: "https://kbsgolfshafts.com/",
  },
  {
    clubMode: "iron",
    name: "Project X LZ",
    weight: "110g / 120g台",
    torque: 1.6,
    tipStiffness: 76,
    midStiffness: 64,
    buttStiffness: 80,
    catchBias: 50,
    launch: 58,
    spin: 52,
    speedRange: [37, 46],
    trajectory: "ニュートラル",
    comment: "中間部のロード感を使いつつ暴れを抑える仮想プロファイル。",
    sourceName: "Project X",
    sourceUrl: "https://www.truetempersports.com/",
  },
  {
    clubMode: "iron",
    name: "MCI 80",
    weight: "80g台",
    torque: 2.6,
    tipStiffness: 60,
    midStiffness: 58,
    buttStiffness: 64,
    catchBias: 68,
    launch: 70,
    spin: 64,
    speedRange: [30, 39],
    trajectory: "ドロー寄り",
    comment: "軽量カーボンで高さとつかまりを補う仮想設定。",
    sourceName: "Fujikura MCI",
    sourceUrl: "https://www.fujikurashaft.jp/",
  },
];

const defaultForm: FormState = {
  clubMode: "driver",
  headName: "例: TaylorMade Qi10 LS",
  headTrait: "低スピン",
  headSpeed: 43,
  desiredShape: "ストレート",
  concern: "スライス",
  feel: "中間",
};

const defaultOwnedShafts: OwnedShaft[] = [
  {
    id: "owned-ventus-blue",
    name: "手持ち: Ventus Blue 6S",
    flex: "S",
    weight: "60g台",
    torque: 3.4,
    tipStiffness: 74,
    midStiffness: 72,
    buttStiffness: 70,
    catchBias: 52,
    launch: 55,
    spin: 46,
    speedRange: [41, 51],
    trajectory: "ニュートラル",
    comment: "比較用に登録された手持ちシャフト。",
    sourceName: "Fujikura Golf Shaft Specs",
    sourceUrl: "https://fujikuragolf.com/shaft-specs",
    dataNote: "公開スペックをもとにした仮想EI換算値。",
  },
  {
    id: "owned-di",
    name: "手持ち: Tour AD DI 6S",
    flex: "S",
    weight: "60g台",
    torque: 3.8,
    tipStiffness: 66,
    midStiffness: 56,
    buttStiffness: 72,
    catchBias: 68,
    launch: 66,
    spin: 56,
    speedRange: [39, 49],
    trajectory: "ドロー寄り",
    comment: "比較用に登録された手持ちシャフト。",
    sourceName: "Graphite Design / Pro's Choice shaft specifications",
    sourceUrl: "https://proschoicegolfshafts.com/",
    dataNote: "公開スペックをもとにした仮想EI換算値。",
  },
];

const blankOwnedShaft: Omit<OwnedShaft, "id"> = {
  name: "",
  flex: "S",
  weight: "60g台",
  torque: 3.5,
  tipStiffness: 70,
  midStiffness: 68,
  buttStiffness: 70,
  catchBias: 55,
  launch: 55,
  spin: 50,
  speedRange: [40, 50],
  trajectory: "ニュートラル",
  comment: "ユーザー入力の手持ちシャフト。",
};

const storageKey = "shaft-matching-simulator-state";

const shaftReferences: ShaftReference[] = [
  {
    clubMode: "driver",
    match: ["regio formula m+", "formula m+", "レジオ フォーミュラ m+"],
    displayName: "NS PRO Regio Formula M+",
    sourceName: "日本シャフト N.S.PRO Regio Formula M+",
    sourceUrl: "https://nipponshaft.co.jp/product/carbon/graphite_regio_m_plus.php",
    base: {
      torque: 4.0,
      tipStiffness: 64,
      midStiffness: 58,
      buttStiffness: 70,
      catchBias: 72,
      launch: 68,
      spin: 58,
      trajectory: "ドロー寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["regio formula b+", "formula b+", "レジオ フォーミュラ b+"],
    displayName: "NS PRO Regio Formula B+",
    sourceName: "Nippon Shaft N.S.PRO Regio Formula B+",
    sourceUrl: "https://nipponshaft.com/product/graphite/graphite_regio_b_plus.php",
    base: {
      torque: 3.7,
      tipStiffness: 72,
      midStiffness: 66,
      buttStiffness: 62,
      catchBias: 54,
      launch: 56,
      spin: 50,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "driver",
    match: ["regio formula mb+", "formula mb+", "レジオ フォーミュラ mb+"],
    displayName: "NS PRO Regio Formula MB+",
    sourceName: "Nippon Shaft N.S.PRO Regio Formula MB+",
    sourceUrl: "https://nipponshaft.com/product/graphite/graphite_regio_mb_plus.php",
    base: {
      torque: 3.5,
      tipStiffness: 76,
      midStiffness: 70,
      buttStiffness: 74,
      catchBias: 48,
      launch: 50,
      spin: 44,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["diamana rf", "ディアマナ rf"],
    displayName: "Diamana RF",
    sourceName: "Mitsubishi Chemical Golf Shaft",
    sourceUrl: "https://www.mitsubishichemicalgolf.jp/",
    base: {
      torque: 4.2,
      tipStiffness: 58,
      midStiffness: 62,
      buttStiffness: 68,
      catchBias: 78,
      launch: 72,
      spin: 64,
      trajectory: "ドロー寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["diamana bf", "ディアマナ bf"],
    displayName: "Diamana BF",
    sourceName: "Mitsubishi Chemical Golf Shaft",
    sourceUrl: "https://www.mitsubishichemicalgolf.jp/",
    base: {
      torque: 3.6,
      tipStiffness: 70,
      midStiffness: 68,
      buttStiffness: 66,
      catchBias: 56,
      launch: 58,
      spin: 52,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "driver",
    match: ["diamana df", "ディアマナ df"],
    displayName: "Diamana DF",
    sourceName: "Mitsubishi Chemical Diamana DF",
    sourceUrl: "https://www.mitsubishichemicalgolf.jp/ko/products/detail/?product_id=6",
    base: {
      torque: 3.2,
      tipStiffness: 82,
      midStiffness: 76,
      buttStiffness: 78,
      catchBias: 40,
      launch: 44,
      spin: 38,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["ventus blue", "ベンタス blue", "ベンタスブルー"],
    displayName: "Ventus Blue",
    sourceName: "Fujikura Golf Shaft Specs",
    sourceUrl: "https://fujikuragolf.com/shaft-specs",
    base: {
      torque: 3.4,
      tipStiffness: 74,
      midStiffness: 72,
      buttStiffness: 70,
      catchBias: 52,
      launch: 55,
      spin: 46,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "driver",
    match: ["ventus black", "ベンタス black", "ベンタスブラック"],
    displayName: "Ventus Black",
    sourceName: "Fujikura Golf Shaft Specs",
    sourceUrl: "https://fujikuragolf.com/shaft-specs",
    base: {
      torque: 3.0,
      tipStiffness: 88,
      midStiffness: 82,
      buttStiffness: 82,
      catchBias: 34,
      launch: 36,
      spin: 32,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["tour ad di", "ad di"],
    displayName: "Tour AD DI",
    sourceName: "Graphite Design / Pro's Choice shaft specifications",
    sourceUrl: "https://proschoicegolfshafts.com/",
    base: {
      torque: 3.8,
      tipStiffness: 66,
      midStiffness: 56,
      buttStiffness: 72,
      catchBias: 68,
      launch: 66,
      spin: 56,
      trajectory: "ドロー寄り",
    },
  },
  {
    clubMode: "driver",
    match: ["tour ad ub", "ad ub"],
    displayName: "Tour AD UB",
    sourceName: "Graphite Design Tour AD UB",
    sourceUrl: "https://gd-asia.com.hk/pages/ub",
    base: {
      torque: 3.3,
      tipStiffness: 78,
      midStiffness: 74,
      buttStiffness: 76,
      catchBias: 44,
      launch: 48,
      spin: 40,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "iron",
    match: ["modus3 tour 105", "modus 105", "モーダス 105", "モーダス105"],
    displayName: "NS PRO MODUS3 TOUR 105",
    sourceName: "Nippon Shaft MODUS3",
    sourceUrl: "https://nipponshaft.com/",
    base: {
      torque: 1.7,
      tipStiffness: 70,
      midStiffness: 66,
      buttStiffness: 72,
      catchBias: 58,
      launch: 60,
      spin: 58,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "iron",
    match: ["modus3 tour 120", "modus 120", "モーダス 120", "モーダス120"],
    displayName: "NS PRO MODUS3 TOUR 120",
    sourceName: "Nippon Shaft MODUS3",
    sourceUrl: "https://nipponshaft.com/",
    base: {
      torque: 1.6,
      tipStiffness: 74,
      midStiffness: 62,
      buttStiffness: 78,
      catchBias: 54,
      launch: 56,
      spin: 54,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "iron",
    match: ["dynamic gold 105", "dg105"],
    displayName: "Dynamic Gold 105",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
    base: {
      torque: 1.8,
      tipStiffness: 72,
      midStiffness: 70,
      buttStiffness: 74,
      catchBias: 52,
      launch: 54,
      spin: 52,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "iron",
    match: ["dynamic gold 120", "dg120"],
    displayName: "Dynamic Gold 120",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
    base: {
      torque: 1.6,
      tipStiffness: 78,
      midStiffness: 76,
      buttStiffness: 78,
      catchBias: 44,
      launch: 46,
      spin: 46,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "iron",
    match: ["dynamic gold s200", "dg s200", "s200"],
    displayName: "Dynamic Gold S200",
    sourceName: "True Temper Dynamic Gold",
    sourceUrl: "https://www.truetempersports.com/",
    base: {
      torque: 1.5,
      tipStiffness: 84,
      midStiffness: 80,
      buttStiffness: 82,
      catchBias: 40,
      launch: 42,
      spin: 44,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "iron",
    match: ["kbs tour"],
    displayName: "KBS TOUR",
    sourceName: "KBS Golf Shafts",
    sourceUrl: "https://kbsgolfshafts.com/",
    base: {
      torque: 1.7,
      tipStiffness: 68,
      midStiffness: 72,
      buttStiffness: 76,
      catchBias: 56,
      launch: 62,
      spin: 60,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "iron",
    match: ["kbs c-taper", "kbs ctaper", "c-taper"],
    displayName: "KBS C-TAPER",
    sourceName: "KBS Golf Shafts",
    sourceUrl: "https://kbsgolfshafts.com/",
    base: {
      torque: 1.4,
      tipStiffness: 86,
      midStiffness: 82,
      buttStiffness: 84,
      catchBias: 38,
      launch: 40,
      spin: 38,
      trajectory: "フェード寄り",
    },
  },
  {
    clubMode: "iron",
    match: ["project x lz", "px lz"],
    displayName: "Project X LZ",
    sourceName: "Project X",
    sourceUrl: "https://www.truetempersports.com/",
    base: {
      torque: 1.6,
      tipStiffness: 76,
      midStiffness: 64,
      buttStiffness: 80,
      catchBias: 50,
      launch: 58,
      spin: 52,
      trajectory: "ニュートラル",
    },
  },
  {
    clubMode: "iron",
    match: ["mci 80", "mci80"],
    displayName: "MCI 80",
    sourceName: "Fujikura MCI",
    sourceUrl: "https://www.fujikurashaft.jp/",
    base: {
      torque: 2.6,
      tipStiffness: 60,
      midStiffness: 58,
      buttStiffness: 64,
      catchBias: 68,
      launch: 70,
      spin: 64,
      trajectory: "ドロー寄り",
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function describeDifference(label: string, value: number, baseValue: number, unit = "") {
  const diff = value - baseValue;
  if (Math.abs(diff) < 1) return `${label}: ほぼ同等`;
  return `${label}: ${diff > 0 ? "+" : ""}${diff.toFixed(label === "トルク" ? 1 : 0)}${unit}`;
}

function compareTone(shaft: Shaft, base: Shaft) {
  const points = [
    shaft.catchBias - base.catchBias > 4 ? "つかまりやすい" : shaft.catchBias - base.catchBias < -4 ? "左を抑えやすい" : "",
    shaft.launch - base.launch > 4 ? "打ち出し高め" : shaft.launch - base.launch < -4 ? "打ち出し低め" : "",
    shaft.spin - base.spin > 4 ? "スピン多め" : shaft.spin - base.spin < -4 ? "スピン少なめ" : "",
    shaft.tipStiffness - base.tipStiffness > 4 ? "先端しっかり" : shaft.tipStiffness - base.tipStiffness < -4 ? "先端が動く" : "",
  ].filter(Boolean);

  return points.length > 0 ? points.join(" / ") : "全体傾向は近い";
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function weightNumber(weight: string) {
  const match = weight.match(/\d+/);
  return match ? Number(match[0]) : 60;
}

function flexAdjustment(flex: Flex) {
  return {
    R: -7,
    SR: -3,
    S: 0,
    X: 6,
    TX: 10,
  }[flex];
}

function speedRangeFor(weight: string, flex: Flex, clubMode: ClubMode): [number, number] {
  const weightBase = Math.round((weightNumber(weight) - 60) / 10);
  if (clubMode === "iron") {
    const ironWeightBase = Math.round((weightNumber(weight) - 100) / 12);
    const ironFlexBase = { R: 30, SR: 32, S: 34, X: 38, TX: 40 }[flex] + ironWeightBase;
    return [ironFlexBase, ironFlexBase + 8];
  }
  const flexBase = { R: 37, SR: 39, S: 41, X: 44, TX: 46 }[flex] + weightBase;
  return [flexBase, flexBase + 8];
}

function estimateReferenceShaft(draft: Omit<OwnedShaft, "id">, clubMode: ClubMode): Omit<OwnedShaft, "id"> | null {
  const normalized = normalizeName(draft.name);
  const reference = shaftReferences.find((item) => item.clubMode === clubMode && item.match.some((keyword) => normalized.includes(keyword)));
  if (!reference) return null;

  const baseWeight = clubMode === "iron" ? 100 : 60;
  const stiffnessOffset = flexAdjustment(draft.flex) + Math.round((weightNumber(draft.weight) - baseWeight) / 5);
  const torqueOffset = draft.flex === "R" ? 0.35 : draft.flex === "SR" ? 0.18 : draft.flex === "X" ? -0.22 : draft.flex === "TX" ? -0.35 : 0;
  const launchOffset = draft.flex === "R" ? 4 : draft.flex === "SR" ? 2 : draft.flex === "X" ? -3 : draft.flex === "TX" ? -5 : 0;

  return {
    ...draft,
    clubMode,
    name: `${reference.displayName} ${draft.weight.replace("台", "")}${draft.flex}`,
    torque: Number(clamp(reference.base.torque + torqueOffset, 2.2, 5.8).toFixed(1)),
    tipStiffness: Math.round(clamp(reference.base.tipStiffness + stiffnessOffset, 30, 95)),
    midStiffness: Math.round(clamp(reference.base.midStiffness + stiffnessOffset, 30, 95)),
    buttStiffness: Math.round(clamp(reference.base.buttStiffness + stiffnessOffset, 30, 95)),
    catchBias: Math.round(clamp(reference.base.catchBias - stiffnessOffset * 0.45, 25, 90)),
    launch: Math.round(clamp(reference.base.launch + launchOffset - stiffnessOffset * 0.2, 25, 90)),
    spin: Math.round(clamp(reference.base.spin + launchOffset - stiffnessOffset * 0.25, 25, 90)),
    speedRange: speedRangeFor(draft.weight, draft.flex, clubMode),
    trajectory: reference.base.trajectory,
    comment: "Web参照スペックから補完し、アプリ内の仮想EIへ換算した手持ちシャフト。",
    sourceName: reference.sourceName,
    sourceUrl: reference.sourceUrl,
    dataNote: "重量・トルク・調子などの公開スペックをもとにした推定値。メーカー実EI値ではありません。",
  };
}

function recommendedFlexFor(shaft: Shaft, headSpeed: number, clubMode: ClubMode): Flex {
  if (clubMode === "iron") {
    const base = headSpeed < 32 ? "R" : headSpeed < 35 ? "SR" : headSpeed < 40 ? "S" : headSpeed < 44 ? "X" : "TX";
    if (shaft.weight.includes("120") && base === "S" && headSpeed < 37) return "SR";
    if (shaft.catchBias <= 42 && shaft.tipStiffness >= 82 && base === "X") return "S";
    return base;
  }
  const base = headSpeed < 39 ? "R" : headSpeed < 42 ? "SR" : headSpeed < 47 ? "S" : headSpeed < 51 ? "X" : "TX";
  if (shaft.catchBias <= 42 && shaft.tipStiffness >= 80 && base === "X") return "S";
  if (shaft.catchBias >= 68 && headSpeed >= 45) return "X";
  return base;
}

function loadStoredState(): StoredState | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredState;
    return {
      ...parsed,
      form: { ...defaultForm, ...parsed.form },
    };
  } catch {
    return null;
  }
}

function scoreShaft(shaft: Shaft, form: FormState): MatchResult {
  let score = 64;
  const reasons: string[] = [];

  // ヘッドスピード帯は最重要条件として、範囲内なら加点し、外れ幅に応じて減点する。
  const [minSpeed, maxSpeed] = shaft.speedRange;
  if (form.headSpeed >= minSpeed && form.headSpeed <= maxSpeed) {
    score += 16;
    reasons.push(`ヘッドスピード ${form.headSpeed}m/s が推奨帯に収まります。`);
  } else {
    const distance = form.headSpeed < minSpeed ? minSpeed - form.headSpeed : form.headSpeed - maxSpeed;
    score -= distance * 5;
    reasons.push(`推奨ヘッドスピード帯とは ${distance.toFixed(1)}m/s 差があります。`);
  }

  if (form.desiredShape === "ドロー" && shaft.catchBias >= 60) {
    score += 10;
    reasons.push("ドロー希望に対して、つかまりやすい特性です。");
  }
  if (form.desiredShape === "フェード" && shaft.catchBias <= 50) {
    score += 10;
    reasons.push("フェード希望に対して、左を抑えやすい特性です。");
  }
  if (form.desiredShape === "ストレート" && shaft.catchBias > 45 && shaft.catchBias < 65) {
    score += 8;
    reasons.push("ストレート狙いに合うニュートラルなつかまりです。");
  }

  const concernRules: Record<Concern, (shaft: Shaft) => [number, string]> = {
    引っかけ: (s) => [s.catchBias <= 50 && s.tipStiffness >= 72 ? 13 : -6, "左へのミスを抑える先端剛性と控えめなつかまりを評価しました。"],
    スライス: (s) => [s.catchBias >= 60 ? 13 : -5, "スライス対策として、つかまりを補いやすい点を評価しました。"],
    高すぎる: (s) => [s.launch <= 52 && s.spin <= 48 ? 12 : -5, "打ち出しとスピンを抑える方向の特性です。"],
    低すぎる: (s) => [s.launch >= 60 ? 12 : -5, "高さを出しやすい打ち出し傾向を評価しました。"],
    スピン多い: (s) => [s.spin <= 46 && s.tipStiffness >= 72 ? 12 : -5, "スピン量を抑えやすい先端側の強さを評価しました。"],
    スピン少ない: (s) => [s.spin >= 54 && s.launch >= 58 ? 12 : -5, "キャリーを確保しやすいスピンと高さを評価しました。"],
  };
  const [concernScore, concernReason] = concernRules[form.concern](shaft);
  score += concernScore;
  if (concernScore > 0) reasons.push(concernReason);

  if (form.headTrait === "低スピン" && shaft.launch >= 56 && shaft.spin >= 50) {
    score += 8;
    reasons.push("低スピン系ヘッドに対して、打ち出しとスピンを少し補えます。");
  }
  if (form.headTrait === "高スピン" && shaft.spin <= 48) {
    score += 8;
    reasons.push("高スピン傾向のヘッドに対して、スピンを抑える方向です。");
  }
  if (form.headTrait === "つかまりやすい" && shaft.catchBias <= 52) {
    score += 8;
    reasons.push("つかまりやすいヘッドとの組み合わせで左への過剰反応を抑えます。");
  }
  if (form.headTrait === "つかまりにくい" && shaft.catchBias >= 60) {
    score += 8;
    reasons.push("つかまりにくいヘッドに対して、フェースターンを補えます。");
  }

  if (form.feel === "しなり感あり" && shaft.midStiffness <= 64) {
    score += 7;
    reasons.push("中間部のしなりを感じやすい仮想EIです。");
  }
  if (form.feel === "しっかり" && shaft.tipStiffness >= 74 && shaft.buttStiffness >= 72) {
    score += 7;
    reasons.push("全体にしっかり感が出やすい剛性配分です。");
  }
  if (form.feel === "中間" && shaft.midStiffness > 62 && shaft.midStiffness < 75) {
    score += 5;
    reasons.push("極端すぎない中間的なフィーリングです。");
  }

  return {
    shaft,
    score: Math.round(clamp(score, 0, 100)),
    reasons: reasons.slice(0, 4),
  };
}

function EiChart({ profile }: { profile: FlexProfile }) {
  const bars = [
    { label: "手元", value: profile.butt },
    { label: "中間", value: profile.mid },
    { label: "先端", value: profile.tip },
  ];

  return (
    <div className="ei-chart" aria-label="仮想EI特性チャート">
      {bars.map((bar) => (
        <div className="ei-bar" key={bar.label}>
          <div className="ei-track">
            <span style={{ height: `${bar.value}%` }} />
          </div>
          <strong>{bar.label}</strong>
          <small>{bar.value}</small>
        </div>
      ))}
    </div>
  );
}

function ShaftDifference({ shaft, base }: { shaft: Shaft; base: Shaft }) {
  const diffItems = [
    describeDifference("トルク", shaft.torque, base.torque),
    describeDifference("つかまり", shaft.catchBias, base.catchBias),
    describeDifference("打ち出し", shaft.launch, base.launch),
    describeDifference("スピン", shaft.spin, base.spin),
    describeDifference("手元剛性", shaft.buttStiffness, base.buttStiffness),
    describeDifference("中間剛性", shaft.midStiffness, base.midStiffness),
    describeDifference("先端剛性", shaft.tipStiffness, base.tipStiffness),
  ];

  return (
    <div className="difference-box">
      <div className="reason-title">
        <GitCompare size={17} />
        {base.name} との差
      </div>
      <p>{compareTone(shaft, base)}</p>
      <div className="diff-grid">
        {diffItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const storedState = React.useMemo(() => loadStoredState(), []);
  const [form, setForm] = React.useState<FormState>(storedState?.form ?? defaultForm);
  const [ownedShafts, setOwnedShafts] = React.useState<OwnedShaft[]>(storedState?.ownedShafts ?? defaultOwnedShafts);
  const [selectedOwnedId, setSelectedOwnedId] = React.useState(storedState?.selectedOwnedId ?? defaultOwnedShafts[0]?.id ?? "");
  const [ownedDraft, setOwnedDraft] = React.useState<Omit<OwnedShaft, "id">>(storedState?.ownedDraft ?? blankOwnedShaft);
  const [shareResult, setShareResult] = React.useState<ShareResult | null>(null);
  const [shareError, setShareError] = React.useState("");
  const [notionUploadResult, setNotionUploadResult] = React.useState<NotionUploadResult | null>(null);
  const [notionUploadError, setNotionUploadError] = React.useState("");
  const [isUploadingNotion, setIsUploadingNotion] = React.useState(false);

  const activeShafts = form.clubMode === "driver" ? driverShafts : ironShafts;
  const speedLabel = form.clubMode === "driver" ? "ヘッドスピード" : "7番アイアンHS";
  const speedRange = form.clubMode === "driver" ? { min: 34, max: 56 } : { min: 28, max: 48 };
  const results = React.useMemo(
    () => activeShafts.map((shaft) => scoreShaft(shaft, form)).sort((a, b) => b.score - a.score).slice(0, 3),
    [activeShafts, form],
  );

  const selectedOwnedShaft = React.useMemo(
    () => ownedShafts.find((shaft) => shaft.id === selectedOwnedId),
    [ownedShafts, selectedOwnedId],
  );

  React.useEffect(() => {
    const state: StoredState = {
      form,
      ownedShafts,
      selectedOwnedId,
      ownedDraft,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [form, ownedShafts, selectedOwnedId, ownedDraft]);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeClubMode(clubMode: ClubMode) {
    setForm((current) => ({
      ...current,
      clubMode,
      headName: clubMode === "driver" ? "例: TaylorMade Qi10 LS" : "例: Mizuno Pro 243",
      headSpeed: clubMode === "driver" ? 43 : 36,
    }));
    setOwnedDraft((current) => ({
      ...current,
      clubMode,
      weight: clubMode === "driver" ? "60g台" : "100g台",
      torque: clubMode === "driver" ? 3.5 : 1.8,
      speedRange: clubMode === "driver" ? [40, 50] : [34, 42],
    }));
  }

  function updateOwnedDraft<Key extends keyof Omit<OwnedShaft, "id">>(key: Key, value: Omit<OwnedShaft, "id">[Key]) {
    setOwnedDraft((current) => ({ ...current, [key]: value }));
  }

  function addOwnedShaft() {
    if (!ownedDraft.name.trim()) return;

    const enrichedDraft = estimateReferenceShaft(ownedDraft, form.clubMode) ?? { ...ownedDraft, clubMode: form.clubMode };
    const nextShaft: OwnedShaft = {
      ...enrichedDraft,
      id: `owned-${Date.now()}`,
      name: enrichedDraft.name.trim(),
    };

    setOwnedShafts((current) => [...current, nextShaft]);
    setSelectedOwnedId(nextShaft.id);
    setOwnedDraft(blankOwnedShaft);
  }

  function removeOwnedShaft(id: string) {
    setOwnedShafts((current) => {
      const next = current.filter((shaft) => shaft.id !== id);
      if (selectedOwnedId === id) {
        setSelectedOwnedId(next[0]?.id ?? "");
      }
      return next;
    });
  }

  function enrichOwnedDraft() {
    const enriched = estimateReferenceShaft(ownedDraft, form.clubMode);
    if (enriched) {
      setOwnedDraft(enriched);
    }
  }

  function buildSharePayload() {
    return {
      form,
      speedLabel,
      selectedOwnedShaft,
      results: results.map((result) => ({
        ...result,
        recommendedFlex: recommendedFlexFor(result.shaft, form.headSpeed, form.clubMode),
        compareTone: selectedOwnedShaft ? compareTone(result.shaft, selectedOwnedShaft) : "",
        differences: selectedOwnedShaft
          ? [
              describeDifference("トルク", result.shaft.torque, selectedOwnedShaft.torque),
              describeDifference("つかまり", result.shaft.catchBias, selectedOwnedShaft.catchBias),
              describeDifference("打ち出し", result.shaft.launch, selectedOwnedShaft.launch),
              describeDifference("スピン", result.shaft.spin, selectedOwnedShaft.spin),
              describeDifference("手元剛性", result.shaft.buttStiffness, selectedOwnedShaft.buttStiffness),
              describeDifference("中間剛性", result.shaft.midStiffness, selectedOwnedShaft.midStiffness),
              describeDifference("先端剛性", result.shaft.tipStiffness, selectedOwnedShaft.tipStiffness),
            ]
          : [],
      })),
    };
  }

  async function exportShareHtml() {
    setShareError("");
    setShareResult(null);

    const payload = buildSharePayload();

    try {
      const response = await fetch("/api/export-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("共有HTMLの作成に失敗しました。");
      }

      setShareResult((await response.json()) as ShareResult);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "共有HTMLの作成に失敗しました。");
    }
  }

  async function uploadToNotion() {
    setNotionUploadError("");
    setNotionUploadResult(null);
    setIsUploadingNotion(true);

    try {
      const response = await fetch("/api/upload-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSharePayload()),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Notionへのアップロードに失敗しました。");
      }

      setNotionUploadResult(result as NotionUploadResult);
    } catch (error) {
      setNotionUploadError(error instanceof Error ? error.message : "Notionへのアップロードに失敗しました。");
    } finally {
      setIsUploadingNotion(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <div className="product-meta">
            <p className="eyebrow">Golf Shaft Matching</p>
            <span className="prototype-badge">試作版</span>
          </div>
          <h1>シャフト特性マッチング・シミュレーター</h1>
          <p>ドライバーとアイアンのシャフト候補を、ヘッド特性、悩み、好みから仮想診断します。</p>
        </div>
        <div className="notice">
          <Info size={18} />
          <span>この診断は参考情報であり、試打を推奨します。</span>
        </div>
      </section>

      <div className="workspace">
        <section className="panel form-panel" aria-label="入力フォーム">
          <div className="panel-heading">
            <Target size={21} />
            <h2>診断条件</h2>
          </div>

          <fieldset>
            <legend>診断モード</legend>
            <div className="segmented mode-switch">
              <button
                className={form.clubMode === "driver" ? "active" : ""}
                type="button"
                onClick={() => changeClubMode("driver")}
              >
                ドライバー
              </button>
              <button
                className={form.clubMode === "iron" ? "active" : ""}
                type="button"
                onClick={() => changeClubMode("iron")}
              >
                アイアン
              </button>
            </div>
          </fieldset>

          <label>
            {form.clubMode === "driver" ? "手持ちのヘッド名" : "手持ちのアイアン名"}
            <input
              value={form.headName}
              onChange={(event) => updateField("headName", event.target.value)}
              placeholder={form.clubMode === "driver" ? "ヘッド名を入力" : "アイアン名を入力"}
            />
          </label>

          <label>
            ヘッドの特徴
            <select value={form.headTrait} onChange={(event) => updateField("headTrait", event.target.value as HeadTrait)}>
              <option>低スピン</option>
              <option>高スピン</option>
              <option>つかまりやすい</option>
              <option>つかまりにくい</option>
            </select>
          </label>

          <label>
            {speedLabel}
            <div className="speed-row">
              <input
                type="range"
                min={speedRange.min}
                max={speedRange.max}
                value={form.headSpeed}
                onChange={(event) => updateField("headSpeed", Number(event.target.value))}
              />
              <output>{form.headSpeed} m/s</output>
            </div>
          </label>

          <fieldset>
            <legend>希望弾道</legend>
            <div className="segmented">
              {(["ドロー", "フェード", "ストレート"] as ShotShape[]).map((shape) => (
                <button
                  className={form.desiredShape === shape ? "active" : ""}
                  key={shape}
                  type="button"
                  onClick={() => updateField("desiredShape", shape)}
                >
                  {shape}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            現在の悩み
            <select value={form.concern} onChange={(event) => updateField("concern", event.target.value as Concern)}>
              <option>引っかけ</option>
              <option>スライス</option>
              <option>高すぎる</option>
              <option>低すぎる</option>
              <option>スピン多い</option>
              <option>スピン少ない</option>
            </select>
          </label>

          <fieldset>
            <legend>好みの打感</legend>
            <div className="segmented">
              {(["しなり感あり", "しっかり", "中間"] as Feel[]).map((feel) => (
                <button
                  className={form.feel === feel ? "active" : ""}
                  key={feel}
                  type="button"
                  onClick={() => updateField("feel", feel)}
                >
                  {feel}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="owned-section">
            <div className="panel-heading compact-heading">
              <GitCompare size={19} />
              <h2>手持ちシャフト比較</h2>
            </div>

            <label>
              比較基準にするシャフト
              <select
                value={selectedOwnedId}
                onChange={(event) => setSelectedOwnedId(event.target.value)}
                disabled={ownedShafts.length === 0}
              >
                {ownedShafts.length === 0 ? (
                  <option>未登録</option>
                ) : (
                  ownedShafts.map((shaft) => (
                    <option key={shaft.id} value={shaft.id}>
                      {shaft.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            {ownedShafts.length > 0 && (
              <div className="owned-list">
                {ownedShafts.map((shaft) => (
                  <div className="owned-item" key={shaft.id}>
                    <span>{shaft.name}</span>
                    <button type="button" aria-label={`${shaft.name}を削除`} onClick={() => removeOwnedShaft(shaft.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="owned-editor">
              <label>
                追加するシャフト名
                <input
                  value={ownedDraft.name}
                  onChange={(event) => updateOwnedDraft("name", event.target.value)}
                  placeholder="例: The ATTAS V2 6S"
                />
              </label>

              <div className="mini-grid">
                <label>
                  重量帯
                  <select value={ownedDraft.weight} onChange={(event) => updateOwnedDraft("weight", event.target.value)}>
                    {(form.clubMode === "driver"
                      ? ["40g台", "50g台", "60g台", "70g台", "80g台"]
                      : ["70g台", "80g台", "90g台", "100g台", "110g台", "120g台", "130g台"]
                    ).map((weight) => (
                      <option key={weight}>{weight}</option>
                    ))}
                  </select>
                </label>
                <label>
                  フレックス
                  <select value={ownedDraft.flex} onChange={(event) => updateOwnedDraft("flex", event.target.value as Flex)}>
                    <option>R</option>
                    <option>SR</option>
                    <option>S</option>
                    <option>X</option>
                    <option>TX</option>
                  </select>
                </label>
                <label>
                  トルク
                  <input
                    type="number"
                    min="2.0"
                    max="6.5"
                    step="0.1"
                    value={ownedDraft.torque}
                    onChange={(event) => updateOwnedDraft("torque", Number(event.target.value))}
                  />
                </label>
              </div>

              {(
                [
                  ["手元剛性", "buttStiffness"],
                  ["中間剛性", "midStiffness"],
                  ["先端剛性", "tipStiffness"],
                  ["つかまり", "catchBias"],
                  ["打ち出し", "launch"],
                  ["スピン", "spin"],
                ] as [string, NumericOwnedKey][]
              ).map(([label, key]) => (
                <label className="compact-slider" key={key}>
                  {label}
                  <div className="speed-row">
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={ownedDraft[key]}
                      onChange={(event) => updateOwnedDraft(key, Number(event.target.value))}
                    />
                    <output>{ownedDraft[key]}</output>
                  </div>
                </label>
              ))}

              {ownedDraft.sourceUrl && (
                <p className="source-note">
                  参照: <a href={ownedDraft.sourceUrl} target="_blank" rel="noreferrer">{ownedDraft.sourceName}</a>
                </p>
              )}

              <div className="owned-actions">
                <button className="lookup-owned" type="button" onClick={enrichOwnedDraft} disabled={!ownedDraft.name.trim()}>
                  <Sparkles size={17} />
                  Web参照で補完
                </button>
                <button className="add-owned" type="button" onClick={addOwnedShaft} disabled={!ownedDraft.name.trim()}>
                  <Plus size={17} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="results" aria-label="おすすめ結果">
          <div className="result-header">
            <div>
              <p className="eyebrow">{form.clubMode === "driver" ? "Driver" : "Iron"} Top 3 Matches</p>
              <h2>{form.headName || "未入力ヘッド"} に合う候補</h2>
            </div>
            <div className="result-actions">
              <button className="share-export" type="button" onClick={exportShareHtml}>
                <Download size={18} />
                Web表示 + Notion用出力
              </button>
              <button className="notion-upload" type="button" onClick={uploadToNotion} disabled={isUploadingNotion}>
                <UploadCloud size={18} />
                {isUploadingNotion ? "Notion送信中" : "Notionへ直接アップロード"}
              </button>
              <div className="metric-pill">
                <Gauge size={18} />
                {form.headSpeed} m/s
              </div>
            </div>
          </div>

          {(shareResult || shareError) && (
            <div className={shareError ? "share-status error" : "share-status"}>
              {shareError || (
                <>
                  <span>作成しました: for_share/{shareResult?.fileName}</span>
                  {shareResult && (
                    <div className="share-links">
                      <a href={shareResult.previewUrl} target="_blank" rel="noreferrer">Web表示を見る</a>
                      <a href={`/for_share/${shareResult.notionPageName}`} target="_blank" rel="noreferrer">Notionページ本文</a>
                      <a href={`/for_share/${shareResult.manifestName}`} target="_blank" rel="noreferrer">for_share配置manifest</a>
                      <span>配置先: Notion for_share ({shareResult.notionParentPageId})</span>
                      <span>保管用Markdown: {shareResult.markdownName}</span>
                      <span>MCP用JSON: {shareResult.notionJsonName}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(notionUploadResult || notionUploadError) && (
            <div className={notionUploadError ? "share-status error" : "share-status"}>
              {notionUploadError || (
                <>
                  <span>Notion for_share に作成しました: {notionUploadResult?.title}</span>
                  {notionUploadResult && (
                    <div className="share-links">
                      <a href={notionUploadResult.pageUrl} target="_blank" rel="noreferrer">Notionページを開く</a>
                      <a href={notionUploadResult.parentUrl} target="_blank" rel="noreferrer">for_shareを開く</a>
                      <span>page_id: {notionUploadResult.pageId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {results.map((result, index) => (
            <article className="shaft-card" key={result.shaft.name}>
              <div className="rank">#{index + 1}</div>
              <div className="shaft-main">
                <div className="shaft-title">
                  <div>
                    <h3>{result.shaft.name}</h3>
                    <p>{result.shaft.comment}</p>
                  </div>
                  <div className="score">
                    <strong>{result.score}</strong>
                    <span>相性スコア</span>
                  </div>
                </div>

                <div className="flex-recommendation">
                  <strong>推奨フレックス: {recommendedFlexFor(result.shaft, form.headSpeed, form.clubMode)}</strong>
                  <span>
                    {speedLabel} {form.headSpeed}m/s とこのシャフトのつかまり・先端剛性から算出
                  </span>
                </div>

                <div className="spec-grid">
                  <span>重量帯<strong>{result.shaft.weight}</strong></span>
                  <span>トルク<strong>{result.shaft.torque.toFixed(1)}</strong></span>
                  <span>推奨速度<strong>{result.shaft.speedRange[0]}-{result.shaft.speedRange[1]} m/s</strong></span>
                  <span>弾道傾向<strong>{result.shaft.trajectory}</strong></span>
                </div>

                <div className="card-bottom">
                  <EiChart
                    profile={{
                      butt: result.shaft.buttStiffness,
                      mid: result.shaft.midStiffness,
                      tip: result.shaft.tipStiffness,
                    }}
                  />
                  <div className="reasons">
                    <div className="reason-title">
                      <Sparkles size={17} />
                      なぜおすすめか
                    </div>
                    <ul>
                      {result.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {selectedOwnedShaft && <ShaftDifference shaft={result.shaft} base={selectedOwnedShaft} />}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
