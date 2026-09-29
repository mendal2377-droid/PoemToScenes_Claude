'use client';

import { useScene } from '@/lib/store';
import { clockLabel, dayPart, shichen, shichenPart } from '@/lib/time';
import { WEATHER } from '@/lib/weather';
import type { PoemScene } from '@/lib/types';

function Slider({
  label,
  roman,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  display,
}: {
  label: string;
  roman: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="field">
      <div className="field__row">
        <span>{label}</span>
        <b>{display ?? value.toFixed(2)}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={roman}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Where to jump on the dial: the four moments a poem is most often set at. */
const JUMPS: [string, number][] = [
  ['拂晓', 5.6],
  ['正午', 12],
  ['黄昏', 18.2],
  ['夜深', 23.2],
];

const SPEEDS: [string, number][] = [
  ['缓', 1],
  ['常', 4],
  ['疾', 14],
];

const FALL_LABEL = { snow: '落雪', leaf: '落叶', petal: '落花' } as const;

export function Panel({ scene }: { scene: PoemScene }) {
  const atm = useScene((s) => s.atmosphere);
  const setAtmosphere = useScene((s) => s.setAtmosphere);
  const clock = useScene((s) => s.clock);
  const setClock = useScene((s) => s.setClock);
  const running = useScene((s) => s.running);
  const setRunning = useScene((s) => s.setRunning);
  const speed = useScene((s) => s.speed);
  const setSpeed = useScene((s) => s.setSpeed);
  const weather = useScene((s) => s.weather);
  const setWeather = useScene((s) => s.setWeather);
  const mode = useScene((s) => s.mode);
  const placed = useScene((s) => s.placed);
  const selectedId = useScene((s) => s.selected);
  const updateSelected = useScene((s) => s.updateSelected);
  const removeSelected = useScene((s) => s.removeSelected);

  const item = placed.find((p) => p.uid === selectedId) ?? null;

  return (
    <aside className="panel">
      <div className="panel__head">
        <span>时辰</span>
        <span>Time</span>
      </div>

      <div className="clock">
        <span className="clock__name">
          {shichen(clock)}
          <em>{shichenPart(clock)}</em>
        </span>
        <span className="clock__part">
          {dayPart(clock)} · {clockLabel(clock)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={24}
        step={0.05}
        value={clock}
        aria-label="时刻"
        onChange={(e) => setClock(Number(e.target.value))}
      />

      <div className="chips">
        {JUMPS.map(([label, at]) => (
          <button key={label} type="button" className="chip" onClick={() => setClock(at)}>
            {label}
          </button>
        ))}
      </div>

      <div className="chips chips--spread">
        <button
          type="button"
          className="chip chip--play"
          data-on={running}
          onClick={() => setRunning(!running)}
          title="让一天自己流转"
        >
          {running ? '止' : '流转'}
        </button>
        {SPEEDS.map(([label, v]) => (
          <button
            key={label}
            type="button"
            className="chip"
            data-on={speed === v}
            disabled={!running}
            onClick={() => setSpeed(v)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel__head">
        <span>天气</span>
        <span>Weather</span>
      </div>

      <div className="chips chips--grid">
        {WEATHER.map((w) => (
          <button
            key={w.id}
            type="button"
            className="chip"
            data-on={weather === w.id}
            title={w.hint}
            onClick={() => setWeather(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>

      <Slider
        label="风势"
        roman="wind"
        value={atm.wind}
        min={0}
        max={1.6}
        onChange={(v) => setAtmosphere({ wind: v })}
      />
      <Slider
        label="云雾"
        roman="mist"
        value={atm.mist}
        min={0}
        max={1}
        onChange={(v) => setAtmosphere({ mist: v })}
      />
      <Slider
        label={FALL_LABEL[scene.fall.kind]}
        roman="fall"
        value={atm.snow}
        min={0}
        max={1}
        onChange={(v) => setAtmosphere({ snow: v })}
      />

      {mode === 'compose' && (
        <>
          <div className="panel__head">
            <span>笔意</span>
            <span>Brushwork</span>
          </div>

          {!item && (
            <p className="panel__empty">
              自下方笔盘取一物
              <br />
              点地而落
              <br />
              再点它，调其笔意
            </p>
          )}

          {item && (
            <>
              <Slider
                label="笔触密度"
                roman="stroke density"
                value={item.strokeDensity}
                min={0.2}
                max={2}
                onChange={(v) => updateSelected({ strokeDensity: v })}
              />
              <Slider
                label="笔触长短"
                roman="stroke length"
                value={item.strokeLength}
                min={0.4}
                max={1.9}
                onChange={(v) => updateSelected({ strokeLength: v })}
              />
              <Slider
                label="笔触卷曲"
                roman="stroke curl"
                value={item.strokeCurl}
                min={0}
                max={1.4}
                onChange={(v) => updateSelected({ strokeCurl: v })}
              />
              <Slider
                label="墨色浓淡"
                roman="ink tone"
                value={item.inkTone}
                min={0}
                max={1}
                onChange={(v) => updateSelected({ inkTone: v })}
              />
              <Slider
                label="大小"
                roman="scale"
                value={item.scale}
                min={0.4}
                max={2.4}
                onChange={(v) => updateSelected({ scale: v })}
              />
              <Slider
                label="朝向"
                roman="rotation"
                value={item.rot}
                min={0}
                max={Math.PI * 2}
                onChange={(v) => updateSelected({ rot: v })}
                display={`${Math.round((item.rot * 180) / Math.PI)}°`}
              />
              <button type="button" className="pill" onClick={removeSelected}>
                拭去此笔
              </button>
            </>
          )}
        </>
      )}

      <p className="panel__note">
        {scene.note}
        <br />
        <br />
        {mode === 'roam'
          ? '走到朱印处，那一句便现。'
          : mode === 'compose'
            ? '你添的笔墨不改原诗，只改这片山水。'
            : '拖动以转视角，滚轮远近。'}
      </p>
    </aside>
  );
}
