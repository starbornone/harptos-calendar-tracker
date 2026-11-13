export type SolarDaylightProfile = { winter: number; summer: number };

export type CampaignCalendar =
  | "harptos"
  | "galifar"
  | "exandrian"
  | "krynn"
  | "greyhawk"
  | "sigil"
  | "radiant";

type SurfaceWeather = {
  salt: number;
  fog: number;
  rain: number;
  snow: number;
  wind?: number;
  warmth?: number;
};

export type CampaignLocation = {
  name: string;
  region: string;
  detail: string;
  calendar: CampaignCalendar;
} & (
  | { mode: "solar"; daylight: SolarDaylightProfile; weather: SurfaceWeather }
  | {
      mode: "sigil" | "auroral";
      weather: {
        salt: number;
        conditions: readonly (readonly [
          "Smog" | "Fog" | "Drizzle" | "Clear Air" | "Ethereal Mist",
          number,
        ])[];
      };
    }
);

// Daylight values are campaign estimates in minutes at Midwinter and Midsummer.
export const campaignLocations = {
  neverwinter: {
    name: "Neverwinter",
    region: "Faerûn · Sword Coast",
    detail: "The warm river below Mount Hotenow.",
    calendar: "harptos",
    mode: "solar",
    daylight: { winter: 480, summer: 960 },
    weather: { fog: 18, rain: 19, snow: 5, salt: 0x9e37_79b9 },
  },
  phandalin: {
    name: "Phandalin",
    region: "Faerûn · Sword Coast",
    detail: "The trail to Wave Echo Cave.",
    calendar: "harptos",
    mode: "solar",
    daylight: { winter: 480, summer: 940 },
    weather: { fog: 9, rain: 15, snow: 24, salt: 0x85eb_ca6b },
  },
  "baldurs-gate": {
    name: "Baldur’s Gate",
    region: "Faerûn · Sword Coast",
    detail: "A port on the River Chionthar.",
    calendar: "harptos",
    mode: "solar",
    daylight: { winter: 560, summer: 880 },
    weather: { fog: 26, rain: 23, snow: 4, salt: 0x517c_c1b7 },
  },
  waterdeep: {
    name: "Waterdeep",
    region: "Faerûn · Sword Coast",
    detail: "The City of Splendors on the Sea of Swords.",
    calendar: "harptos",
    mode: "solar",
    daylight: { winter: 520, summer: 920 },
    weather: { fog: 17, rain: 28, snow: 13, wind: 8, salt: 0x1b87_3593 },
  },
  halruaa: {
    name: "Halruaa",
    region: "Faerûn · Shining South",
    detail: "A land of magic along the Great Sea.",
    calendar: "harptos",
    mode: "solar",
    daylight: { winter: 720, summer: 720 },
    weather: { fog: 8, rain: 26, snow: 0, warmth: 1, salt: 0x8f24_bdf1 },
  },
  sharn: {
    name: "Sharn",
    region: "Eberron · Breland",
    detail: "The City of Towers above the Dagger River.",
    calendar: "galifar",
    mode: "solar",
    daylight: { winter: 720, summer: 720 },
    weather: { fog: 14, rain: 72, snow: 0, warmth: 1, salt: 0xc2b2_ae35 },
  },
  sigil: {
    name: "Sigil",
    region: "Planescape · Outlands",
    detail: "The City of Doors above the Spire.",
    calendar: "sigil",
    mode: "sigil",
    weather: {
      salt: 0x27d4_eb2f,
      conditions: [
        ["Smog", 45],
        ["Fog", 25],
        ["Drizzle", 22],
        ["Clear Air", 8],
      ],
    },
  },
  "radiant-citadel": {
    name: "The Radiant Citadel",
    region: "Deep Ethereal",
    detail: "A city lit by the Auroral Diamond.",
    calendar: "radiant",
    mode: "auroral",
    weather: {
      salt: 0x1656_67b1,
      conditions: [
        ["Clear Air", 65],
        ["Ethereal Mist", 35],
      ],
    },
  },
  bazzoxan: {
    name: "Bazzoxan",
    region: "Exandria · Xhorhas",
    detail: "The garrison at Betrayers’ Rise.",
    calendar: "exandrian",
    mode: "solar",
    daylight: { winter: 580, summer: 860 },
    weather: { fog: 4, rain: 7, snow: 18, wind: 32, salt: 0xd3a2_646c },
  },
  kalaman: {
    name: "Kalaman",
    region: "Krynn · Solamnia",
    detail: "The harbor where the Vingaard meets Kalaman Bay.",
    calendar: "krynn",
    mode: "solar",
    daylight: { winter: 540, summer: 900 },
    weather: { fog: 24, rain: 26, snow: 12, wind: 8, salt: 0xfd70_46c5 },
  },
  greyhawk: {
    name: "Greyhawk",
    region: "Oerth · Flanaess",
    detail: "The Free City on the Selintan River.",
    calendar: "greyhawk",
    mode: "solar",
    daylight: { winter: 570, summer: 870 },
    weather: { fog: 12, rain: 20, snow: 22, salt: 0xb55a_4f09 },
  },
} as const satisfies Record<string, CampaignLocation>;

export type LocationId = keyof typeof campaignLocations;
export const locationIds = Object.keys(campaignLocations) as LocationId[];

export function usesHarptosCalendar(id: LocationId): boolean {
  return campaignLocations[id].calendar === "harptos";
}

export const selectableLocationIds = locationIds.filter(usesHarptosCalendar);

export function visibleLocationIds(selected: LocationId): LocationId[] {
  return usesHarptosCalendar(selected) ? selectableLocationIds : [selected, ...selectableLocationIds];
}
