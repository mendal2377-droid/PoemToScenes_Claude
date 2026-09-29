/**
 * Weather.
 *
 * A preset is a target, not a state: choosing one sets where the sky is headed
 * and the renderer eases towards it, so clear turning to storm takes a few
 * seconds of darkening rather than a cut. The three sliders in the panel stay
 * live and sit on top — 风势 and 云雾 are set by a preset but remain yours to
 * push further.
 */

export type WeatherId = 'scene' | 'clear' | 'cloudy' | 'overcast' | 'drizzle' | 'storm' | 'snow' | 'fog' | 'gale';

export type WeatherTarget = {
  /** How overcast, 0–1. Greys the sky, dims the sun and moon, flattens colour. */
  cloud: number;
  /** Falling rain, 0–1. */
  rain: number;
  /** Falling snow that settles, 0–1. */
  snow: number;
  /** Lightning and thunder, 0–1. */
  thunder: number;
  wind: number;
  mist: number;
};

export type WeatherPreset = {
  id: WeatherId;
  label: string;
  /** One phrase for the tooltip — what the sky is doing. */
  hint: string;
  target: WeatherTarget;
};

export const WEATHER: readonly WeatherPreset[] = [
  {
    id: 'scene',
    label: '本景',
    hint: '诗里本来的天气',
    // Filled in from the scene itself; these values are never used directly.
    target: { cloud: 0.2, rain: 0, snow: 0, thunder: 0, wind: 0.5, mist: 0.3 },
  },
  {
    id: 'clear',
    label: '晴',
    hint: '天清气朗',
    target: { cloud: 0.04, rain: 0, snow: 0, thunder: 0, wind: 0.4, mist: 0.1 },
  },
  {
    id: 'cloudy',
    label: '多云',
    hint: '云在走',
    target: { cloud: 0.5, rain: 0, snow: 0, thunder: 0, wind: 0.65, mist: 0.26 },
  },
  {
    id: 'overcast',
    label: '阴',
    hint: '云压得很低',
    target: { cloud: 0.92, rain: 0, snow: 0, thunder: 0, wind: 0.5, mist: 0.46 },
  },
  {
    id: 'drizzle',
    label: '细雨',
    hint: '清明时节雨纷纷',
    target: { cloud: 0.82, rain: 0.42, snow: 0, thunder: 0, wind: 0.5, mist: 0.6 },
  },
  {
    id: 'storm',
    label: '雷雨',
    hint: '风雨如晦',
    target: { cloud: 1, rain: 1, snow: 0, thunder: 1, wind: 1.2, mist: 0.72 },
  },
  {
    id: 'snow',
    label: '雪',
    hint: '瑞雪',
    target: { cloud: 0.78, rain: 0, snow: 0.9, thunder: 0, wind: 0.28, mist: 0.52 },
  },
  {
    id: 'fog',
    label: '雾',
    hint: '烟雨蒙蒙，不辨远近',
    target: { cloud: 0.6, rain: 0, snow: 0, thunder: 0, wind: 0.1, mist: 1 },
  },
  {
    id: 'gale',
    label: '大风',
    hint: '风急天高',
    target: { cloud: 0.42, rain: 0, snow: 0, thunder: 0, wind: 1.6, mist: 0.16 },
  },
];

export function getWeather(id: WeatherId): WeatherPreset {
  return WEATHER.find((w) => w.id === id) ?? WEATHER[0];
}
