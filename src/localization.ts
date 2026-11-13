import { formatHarptosDate, toElapsedMinutes, type HarptosDate, type HarptosDateTime } from "./harptos.ts";
import type { CampaignCalendar } from "./locations.ts";
import { getSettingCalendar, getSettingDate } from "./setting-calendars.ts";

export type Locale = "en" | "zh-Hans";

const messages = {
  day: { en: "Day", "zh-Hans": "日期" },
  year: { en: "Year", "zh-Hans": "年份" },
  calendarPeriod: { en: "Month or festival week", "zh-Hans": "月份或节日周" },
  invalidSettingDay: {
    en: "That day does not occur in the selected period.",
    "zh-Hans": "所选时段中没有该日期。",
  },
  invalidSettingTime: {
    en: "Enter a clock time from 00:00 to 23:59.",
    "zh-Hans": "请输入 00:00 至 23:59 之间的时间。",
  },
  invalidAdvance: {
    en: "Advance by a supported number of whole hours.",
    "zh-Hans": "请按支持的整数小时数推进时间。",
  },
  clockOutOfRange: {
    en: "The Harptos date is outside the supported range.",
    "zh-Hans": "该哈普托斯历日期超出支持范围。",
  },
  invalidHarptosTime: {
    en: "Enter a Harptos clock time from 00:00 to 23:59.",
    "zh-Hans": "请输入 00:00 至 23:59 之间的时间。",
  },
  invalidHarptosDay: {
    en: "That day or festival does not occur in the given Harptos year.",
    "zh-Hans": "该日期或节日不在所选哈普托斯历年份中。",
  },
  invalidShieldmeetYear: {
    en: "Shieldmeet occurs only in years divisible by four, such as 1492 DR.",
    "zh-Hans": "盾会节只出现在可被4整除的年份，例如 1492 DR。",
  },
  invalidHarptosYear: {
    en: "A Harptos year must be a positive integer in DR.",
    "zh-Hans": "哈普托斯历年份 (DR) 必须为正整数。",
  },
  ledgerLabel: { en: "Dungeon Master’s ledger", "zh-Hans": "地下城主的日志" },
  harptosCalendarTracker: { en: "Harptos Calendar Tracker", "zh-Hans": "哈普托斯历追踪器" },
  harptosCalendar: { en: "Harptos Calendar", "zh-Hans": "哈普托斯历" },
  tracker: { en: "Tracker", "zh-Hans": "追踪器" },
  campaignClock: { en: "Campaign clock", "zh-Hans": "战役时钟" },
  timePhase: { en: "Time phase", "zh-Hans": "时间段" },
  clockMarker: { en: "Clock marker", "zh-Hans": "时钟标记" },
  hourlyWeather: { en: "Hourly weather", "zh-Hans": "每小时天气" },
  setCurrentTime: { en: "Set Current Time", "zh-Hans": "设置当前时间" },
  yearDr: { en: "Year (DR)", "zh-Hans": "年份 (DR)" },
  monthOrFestival: { en: "Month or festival", "zh-Hans": "月份或节日" },
  months: { en: "Months", "zh-Hans": "月份" },
  festivals: { en: "Festivals", "zh-Hans": "节日" },
  firstTenday: { en: "First tenday", "zh-Hans": "第一个十日" },
  secondTenday: { en: "Second tenday", "zh-Hans": "第二个十日" },
  thirdTenday: { en: "Third tenday", "zh-Hans": "第三个十日" },
  dayOfMonth: { en: "Day of month", "zh-Hans": "日期" },
  time24Hour: { en: "Time (24-hour)", "zh-Hans": "时间 (24小时制)" },
  cancel: { en: "Cancel", "zh-Hans": "取消" },
  setTime: { en: "Set Time", "zh-Hans": "设置时间" },
  advanceTime: { en: "Advance time", "zh-Hans": "推进时间" },
  advanceOneHour: { en: "+1 hour", "zh-Hans": "+1小时" },
  advanceTwoHours: { en: "+2 hours", "zh-Hans": "+2小时" },
  advanceFourHours: { en: "+4 hours", "zh-Hans": "+4小时" },
  advanceEightHours: { en: "+8 hours", "zh-Hans": "+8小时" },
  advanceOneDay: { en: "+1 day", "zh-Hans": "+1天" },
  advanceTenDays: { en: "+10 days", "zh-Hans": "+10天" },
  daylightEstimates: { en: "Daylight estimates", "zh-Hans": "日照估算" },
  ambientLight: { en: "Ambient light", "zh-Hans": "环境光" },
  steadyAuroralDiamondLight: { en: "Steady Auroral Diamond light", "zh-Hans": "极光钻石持续照明" },
  campaignSummary: { en: "Campaign summary", "zh-Hans": "战役摘要" },
  copyCampaignSummary: { en: "Copy campaign summary", "zh-Hans": "复制战役摘要" },
  campaignSummaryCopied: { en: "Campaign summary copied.", "zh-Hans": "已复制战役摘要。" },
  summaryCopyFallback: {
    en: "Select the campaign summary field and copy it manually.",
    "zh-Hans": "请选择战役摘要字段并手动复制。",
  },
  shareCampaign: { en: "Share Campaign", "zh-Hans": "分享战役" },
  hideShareLink: { en: "Hide Share Link", "zh-Hans": "隐藏分享链接" },
  shareLink: { en: "Share link", "zh-Hans": "分享链接" },
  copyLink: { en: "Copy Link", "zh-Hans": "复制链接" },
  shareLinkCopied: { en: "Share link copied.", "zh-Hans": "已复制分享链接。" },
  linkCopyFallback: {
    en: "Select the share link field and copy it manually.",
    "zh-Hans": "请选择分享链接字段并手动复制。",
  },
  sharedCampaignPreview: { en: "Shared campaign preview", "zh-Hans": "共享战役预览" },
  previewInstructions: {
    en: "Adopt this moment to replace your saved campaign and enable editing.",
    "zh-Hans": "采用此战役时刻可替换已保存的战役并启用编辑。",
  },
  adoptSharedCampaign: { en: "Adopt Shared Campaign", "zh-Hans": "采用共享战役" },
  backToSavedCampaign: { en: "Back to Saved Campaign", "zh-Hans": "返回已保存的战役" },
  adoptionSuccess: {
    en: "Shared campaign adopted and saved in this browser.",
    "zh-Hans": "已采用共享战役并保存在此浏览器中。",
  },
  adoptionFailure: {
    en: "Your browser could not save the shared campaign. The preview is still open.",
    "zh-Hans": "浏览器无法保存共享战役，预览仍处于打开状态。",
  },
  invalidShare: {
    en: "This share link is invalid or unsupported. Showing your local campaign.",
    "zh-Hans": "此分享链接无效或不受支持。当前显示本地战役。",
  },
  editSaveFailure: {
    en: "Campaign updated for this tab. Your browser could not save it for reload.",
    "zh-Hans": "当前标签页中的战役已更新，但浏览器无法保存以供重新加载。",
  },
  invalidSavedClock: {
    en: "Could not restore the saved clock. Showing the campaign start.",
    "zh-Hans": "无法恢复已保存的时钟。当前显示战役起点。",
  },
  initialSaveFailure: {
    en: "Your browser could not save the campaign for reload.",
    "zh-Hans": "浏览器无法保存战役以供重新加载。",
  },
  restoreFailure: {
    en: "Could not restore the saved campaign. Showing the campaign start.",
    "zh-Hans": "无法恢复已保存的战役。当前显示战役起点。",
  },
  invalidClockInput: {
    en: "Enter a 24-hour time such as 23:00.",
    "zh-Hans": "请输入24小时制时间，例如 23:00。",
  },
  chooseAMonthOrFestival: { en: "Choose a month or festival.", "zh-Hans": "请选择月份或节日。" },
  campaignLocation: { en: "Campaign location", "zh-Hans": "战役地点" },
  footerIntro: {
    en: "Track campaign time, seasonal daylight, and hourly weather for Dungeons & Dragons adventures in the Forgotten Realms.",
    "zh-Hans": "为《龙与地下城》的被遗忘国度冒险追踪战役时间、季节性日照和每小时天气。",
  },
  siteLinks: { en: "Site links", "zh-Hans": "网站链接" },
  returnToStarmistStudio: { en: "Return to Starmist Studio", "zh-Hans": "返回 Starmist Studio" },
  supportOnKoFi: { en: "Support on Ko-fi", "zh-Hans": "在 Ko-fi 上支持项目" },
  footerDisclaimer: {
    en: "Not affiliated with Wizards of the Coast.",
    "zh-Hans": "本工具与威世智 (Wizards of the Coast) 无关。",
  },
} as const;

export type MessageId = keyof typeof messages;

export function message(locale: Locale, id: MessageId): string {
  return messages[id][locale];
}

const simplifiedChinese = {
  Sunrise: "日出",
  "Year of the Scarlet Witch": "绯红女巫之年",
  Sunset: "日落",

  Hammer: "锤月",
  Alturiak: "阿尔图瑞克月",
  Ches: "切斯月",
  Tarsakh: "塔萨克月",
  Mirtul: "米尔图月",
  Kythorn: "基索恩月",
  Flamerule: "炎枪月",
  Eleasis: "伊莱西斯月",
  Eleint: "衰败之月",
  Marpenoth: "落叶之月",
  Uktar: "腐叶之月",
  Nightal: "岁末月",
  Midwinter: "仲冬节",
  Greengrass: "青草节",
  Midsummer: "仲夏节",
  Shieldmeet: "盾会节",
  Highharvestide: "丰收节",
  "Feast of the Moon": "明月节",

  Midnight: "午夜",
  Moondark: "月隐",
  "Night's End": "夜尽",
  Foredawn: "黎明前",
  Dawn: "黎明",
  Morning: "早晨",
  Mornbright: "晨明",
  Midmorn: "上午",
  "High Morn": "晌午前",
  Highsun: "正午",
  Waterclock: "水钟时",
  Afternoon: "下午",
  "Time of Summer Sunset": "夏日日落时",
  Twilight: "暮光",
  Dusk: "黄昏",
  Evening: "傍晚",
  "Steady Light": "恒定光照",
  Peak: "光照峰值",
  Antipeak: "光照谷值",
  Brightening: "渐亮",
  Dimming: "渐暗",

  "Clear Skies": "晴空",
  "Partly Cloudy": "局部多云",
  Fog: "雾",
  Overcast: "阴天",
  Rain: "雨",
  Snow: "雪",
  "Gusty Winds": "阵风",
  Thunderstorm: "雷暴",
  Smog: "烟雾",
  Drizzle: "毛毛雨",
  "Clear Air": "空气清朗",
  "Ethereal Mist": "以太薄雾",

  Neverwinter: "无冬城",
  "The warm river below Mount Hotenow.": "霍特瑙山下的温暖河流。",
  Phandalin: "凡达林",
  "The trail to Wave Echo Cave.": "通往回声洞的小径。",
  "Faerûn · Sword Coast": "费伦 · 剑湾",
  "Baldur’s Gate": "博德之门",
  "A port on the River Chionthar.": "冲萨河上的港口。",
  Waterdeep: "深水城",
  "The City of Splendors on the Sea of Swords.": "剑海上的辉煌之城。",
  "Eberron · Breland": "艾伯伦 · 布鲁兰",
  Sharn: "沙恩",
  "The City of Towers above the Dagger River.": "匕首河上方的高塔之城。",
  "Planescape · Outlands": "异度风景 · 外域",
  Sigil: "印记城",
  "The City of Doors above the Spire.": "尖塔上方的门之城。",
  "Deep Ethereal": "深层以太",
  "The Radiant Citadel": "光辉之城",
  "A city lit by the Auroral Diamond.": "被极光钻石照亮的城市。",
  "Exandria · Xhorhas": "艾克桑迪亚 · 索哈斯",
  Bazzoxan: "巴佐克桑",
  "The garrison at Betrayers’ Rise.": "背叛者之巅的驻军。",
  "Krynn · Solamnia": "克莱恩 · 索兰尼亚",
  Kalaman: "卡拉曼",
  "The harbor where the Vingaard meets Kalaman Bay.": "文加德河与卡拉曼湾交汇的港口。",
  "Oerth · Flanaess": "奥斯 · 法兰尼斯",
  Greyhawk: "灰鹰",
  Halruaa: "哈鲁阿",
  "Faerûn · Shining South": "费伦 · 光辉南方",
  "A land of magic along the Great Sea.": "大海沿岸的魔法之地。",
  "The Free City on the Selintan River.": "塞林坦河上的自由城邦。",
} as const;

export type DomainLabel = keyof typeof simplifiedChinese;

export function translate(locale: Locale, english: DomainLabel): string {
  return locale === "zh-Hans" ? simplifiedChinese[english] : english;
}

export function formatLocalizedDate(date: HarptosDate, locale: Locale): string {
  if (locale === "en") return formatHarptosDate(date);
  const day =
    "festival" in date ? translate(locale, date.festival) : `${translate(locale, date.month)}${date.day}日`;
  return `${date.year} DR ${day}`;
}

export function formatCampaignDate(
  dateTime: HarptosDateTime,
  calendar: CampaignCalendar,
  locale: Locale,
): string {
  if (calendar === "harptos") return formatLocalizedDate(dateTime.date, locale);
  const { year, period, day } = getSettingDate(calendar, toElapsedMinutes(dateTime));
  const definition = getSettingCalendar(calendar);
  if (!definition) return locale === "zh-Hans" ? `第${day}天` : `${message(locale, "day")} ${day}`;
  const displayYear = `${year} ${definition.era}`;
  return locale === "zh-Hans" ? `${displayYear} ${period} ${day}日` : `${day} ${period} ${displayYear}`;
}
