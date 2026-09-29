'use client';

import { useScene } from '@/lib/store';
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

const HOURS: [number, string][] = [
  [0.18, '晨曦'],
  [0.44, '日中'],
  [0.62, '向晚'],
  [0.84, '初月'],
  [1.01, '夜深'],
];

const hourName = (h: number) => HOURS.find(([t]) => h < t)?.[1] ?? '夜深';

export function Panel({ scene }: { scene: PoemScene }) {
  const atm = useScene((s) => s.atmosphere);
  const setAtmosphere = useScene((s) => s.setAtmosphere);
  const mode = useScene((s) => s.mode);
  const placed = useScene((s) => s.placed);
  const selectedId = useScene((s) => s.selected);
  const updateSelected = useScene((s) => s.updateSelected);
  const removeSelected = useScene((s) => s.removeSelected);

  const item = placed.find((p) => p.uid === selectedId) ?? null;

  return (
    <aside className="panel">
      <div className="panel__head">
        <span>天时气象</span>
        <span>Atmosphere</span>
      </div>

      <Slider
        label="时辰"
        roman="hour"
        value={atm.hour}
        min={0}
        max={1}
        onChange={(v) => setAtmosphere({ hour: v })}
        display={hourName(atm.hour)}
      />
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
        label="落雪"
        roman="snow"
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
