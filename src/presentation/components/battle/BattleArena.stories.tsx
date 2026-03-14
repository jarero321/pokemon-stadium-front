import type { Meta } from '@storybook/nextjs-vite';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BattleArena } from './BattleArena';
import { STADIUM_BACKGROUNDS } from './backgrounds';
import type { SpriteAnimation } from './PokemonSprite';
import { TEAMS } from './__fixtures__/battleData';
import { BattleLog, BattleLogEntry } from './BattleLog';
import { TurnIndicator } from './TurnIndicator';

const meta: Meta<typeof BattleArena> = {
  title: 'Battle/BattleArena',
  component: BattleArena,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

/* ── 1. Battle Start ── */

export const BattleStart = {
  name: '1. Battle Start',
  render: () => {
    const [pAnim, setPAnim] = useState<SpriteAnimation>('entering');
    const [oAnim, setOAnim] = useState<SpriteAnimation>('entering');
    const [key, setKey] = useState(0);

    const replay = () => {
      setKey((k) => k + 1);
      setPAnim('entering');
      setOAnim('entering');
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <BattleArena
          playerPokemon={TEAMS.player[0]}
          opponentPokemon={TEAMS.opponent[0]}
          playerAnimation={pAnim}
          opponentAnimation={oAnim}
          playerAnimKey={key}
          opponentAnimKey={key}
          onPlayerAnimationEnd={() => setPAnim('idle')}
          onOpponentAnimationEnd={() => setOAnim('idle')}
        />
        <button
          onClick={replay}
          className="rounded bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-500"
        >
          Replay Entry
        </button>
      </div>
    );
  },
};

/* ── 2. Attack Exchange (Auto) ── */

export const AttackExchange = {
  name: '2. Attack Exchange (Auto)',
  render: () => {
    const [pHp, setPHp] = useState(153);
    const [oHp, setOHp] = useState(150);
    const [pAnim, setPAnim] = useState<SpriteAnimation>('idle');
    const [oAnim, setOAnim] = useState<SpriteAnimation>('idle');
    const [pKey, setPKey] = useState(0);
    const [oKey, setOKey] = useState(0);
    const [log, setLog] = useState<string[]>([]);
    const [playing, setPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const turnRef = useRef(0);

    const addLog = useCallback((msg: string) => {
      setLog((prev) => [...prev.slice(-8), msg]);
    }, []);

    const runTurn = useCallback(() => {
      const turn = turnRef.current;
      if (turn >= 8) {
        setPlaying(false);
        return;
      }

      const dmg = Math.floor(Math.random() * 30) + 15;
      const mult = Math.random() > 0.7 ? 2 : Math.random() > 0.5 ? 0.5 : 1;
      const final = Math.round(dmg * mult);
      const eff =
        mult > 1
          ? ' Super effective!'
          : mult < 1
            ? ' Not very effective...'
            : '';

      if (turn % 2 === 0) {
        setOKey((k) => k + 1);
        setOAnim('damage');
        setOHp((h) => Math.max(0, h - final));
        addLog(`Charizard dealt ${final} dmg to Blastoise.${eff}`);
      } else {
        setPKey((k) => k + 1);
        setPAnim('damage');
        setPHp((h) => Math.max(0, h - final));
        addLog(`Blastoise dealt ${final} dmg to Charizard.${eff}`);
      }

      turnRef.current++;
      timerRef.current = setTimeout(runTurn, 1500);
    }, [addLog]);

    const startAutoPlay = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(true);
      setPHp(153);
      setOHp(150);
      setLog([]);
      turnRef.current = 0;
      timerRef.current = setTimeout(runTurn, 500);
    }, [runTurn]);

    useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      [],
    );

    return (
      <div className="flex flex-col items-center gap-4">
        <BattleArena
          playerPokemon={{ ...TEAMS.player[0], hp: pHp }}
          opponentPokemon={{ ...TEAMS.opponent[0], hp: oHp }}
          playerAnimation={pAnim}
          opponentAnimation={oAnim}
          playerAnimKey={pKey}
          opponentAnimKey={oKey}
          onPlayerAnimationEnd={() => setPAnim('idle')}
          onOpponentAnimationEnd={() => setOAnim('idle')}
        />
        <BattleLog
          title="Battle Log"
          className="w-full max-h-40 overflow-y-auto"
        >
          {log.length === 0 && (
            <p className="text-xs text-white/30">Press Auto Play...</p>
          )}
          {log.map((msg, i) => (
            <BattleLogEntry key={i}>{msg}</BattleLogEntry>
          ))}
        </BattleLog>
        <button
          onClick={startAutoPlay}
          disabled={playing}
          className="battle-btn battle-btn--attack max-w-xs"
        >
          {playing ? 'Battling...' : 'Auto Play (8 turns)'}
        </button>
      </div>
    );
  },
};

/* ── 3. KO + Switch ── */

export const KOAndSwitch = {
  name: '3. KO + Switch',
  render: () => {
    const [oIdx, setOIdx] = useState(0);
    const [oHp, setOHp] = useState(TEAMS.opponent[0].maxHp);
    const [oAnim, setOAnim] = useState<SpriteAnimation>('idle');
    const [oKey, setOKey] = useState(0);
    const [phase, setPhase] = useState<string>('idle');
    const [log, setLog] = useState<string[]>([]);
    const animNextRef = useRef<(() => void) | null>(null);

    const addLog = useCallback((msg: string) => setLog((p) => [...p, msg]), []);

    const delayedNext = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      return () => clearTimeout(timer);
    };

    const startKO = () => {
      const cur = TEAMS.opponent[oIdx];
      const nextIdx = oIdx + 1;
      setPhase('attacking');
      setLog([]);
      addLog(`Charizard uses Flamethrower on ${cur.name}!`);
      setOHp(0);
      setOKey((k) => k + 1);
      setOAnim('damage');

      // Chain: damage → (pause) → fainting → (pause) → entering
      animNextRef.current = () => {
        // Pause after damage hit before fainting starts
        delayedNext(() => {
          addLog(`${cur.name} fainted!`);
          setOAnim('fainting');
          if (nextIdx < TEAMS.opponent.length) {
            animNextRef.current = () => {
              // Pause after faint before next pokemon enters
              delayedNext(() => {
                addLog(`Opponent sends out ${TEAMS.opponent[nextIdx].name}!`);
                setOIdx(nextIdx);
                setOHp(TEAMS.opponent[nextIdx].maxHp);
                setOAnim('entering');
                setPhase('idle');
              }, 600);
            };
          } else {
            animNextRef.current = () => {
              delayedNext(() => {
                addLog('All opponent pokemon fainted! You win!');
                setPhase('done');
              }, 400);
            };
          }
        }, 400);
      };
    };

    const reset = () => {
      animNextRef.current = null;
      setOIdx(0);
      setOHp(TEAMS.opponent[0].maxHp);
      setOAnim('idle');
      setOKey(0);
      setPhase('idle');
      setLog([]);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <BattleArena
          playerPokemon={TEAMS.player[0]}
          opponentPokemon={
            phase !== 'done' ? { ...TEAMS.opponent[oIdx], hp: oHp } : null
          }
          opponentAnimation={oAnim}
          opponentAnimKey={oKey}
          onOpponentAnimationEnd={() => {
            const next = animNextRef.current;
            animNextRef.current = null;
            if (next) next();
            else setOAnim('idle');
          }}
        />
        <BattleLog title="Battle Log" className="w-full">
          {log.map((msg, i) => (
            <BattleLogEntry key={i}>{msg}</BattleLogEntry>
          ))}
          {log.length === 0 && (
            <p className="text-xs text-white/30">KO the opponent!</p>
          )}
        </BattleLog>
        <div className="flex gap-2">
          <button
            onClick={startKO}
            disabled={phase !== 'idle'}
            className="battle-btn battle-btn--attack max-w-xs"
          >
            {phase === 'done'
              ? 'Battle Over'
              : `KO ${TEAMS.opponent[oIdx].name}`}
          </button>
          <button
            onClick={reset}
            className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};

/* ── 4. Background Gallery ── */

export const BackgroundGallery = {
  name: '4. Background Gallery',
  render: () => {
    const [bgIdx, setBgIdx] = useState(0);
    const bg = STADIUM_BACKGROUNDS[bgIdx];
    const bgName =
      bg.split('/').pop()?.replace('bg-', '').replace('.jpg', '') ?? '';

    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-white/50 uppercase tracking-wider">
          Stadium: <span className="text-white/80 font-bold">{bgName}</span> (
          {bgIdx + 1}/{STADIUM_BACKGROUNDS.length})
        </p>
        <BattleArena
          playerPokemon={TEAMS.player[0]}
          opponentPokemon={TEAMS.opponent[0]}
          background={bg}
        />
        <div className="flex gap-2">
          <button
            onClick={() =>
              setBgIdx(
                (i) =>
                  (i - 1 + STADIUM_BACKGROUNDS.length) %
                  STADIUM_BACKGROUNDS.length,
              )
            }
            className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            ← Prev
          </button>
          <button
            onClick={() =>
              setBgIdx((i) => (i + 1) % STADIUM_BACKGROUNDS.length)
            }
            className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Next →
          </button>
          <button
            onClick={() =>
              setBgIdx(Math.floor(Math.random() * STADIUM_BACKGROUNDS.length))
            }
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            Random
          </button>
        </div>
      </div>
    );
  },
};

/* ── 5. Interactive Battle ── */

export const InteractiveBattle = {
  name: '5. Interactive Battle',
  render: () => {
    const [pHp, setPHp] = useState(153);
    const [oHp, setOHp] = useState(150);
    const [pAnim, setPAnim] = useState<SpriteAnimation>('idle');
    const [oAnim, setOAnim] = useState<SpriteAnimation>('idle');
    const [pKey, setPKey] = useState(0);
    const [oKey, setOKey] = useState(0);
    const [myTurn, setMyTurn] = useState(true);

    const attack = () => {
      if (!myTurn) return;
      const dmg = Math.floor(Math.random() * 35) + 20;
      setOHp((h) => Math.max(0, h - dmg));
      setOKey((k) => k + 1);
      setOAnim('damage');
      setMyTurn(false);
      setTimeout(() => {
        const oDmg = Math.floor(Math.random() * 30) + 15;
        setPHp((h) => Math.max(0, h - oDmg));
        setPKey((k) => k + 1);
        setPAnim('damage');
        setTimeout(() => setMyTurn(true), 600);
      }, 800);
    };

    const reset = () => {
      setPHp(153);
      setOHp(150);
      setMyTurn(true);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <BattleArena
          playerPokemon={{ ...TEAMS.player[0], hp: pHp }}
          opponentPokemon={{ ...TEAMS.opponent[0], hp: oHp }}
          playerAnimation={pAnim}
          opponentAnimation={oAnim}
          playerAnimKey={pKey}
          opponentAnimKey={oKey}
          onPlayerAnimationEnd={() => setPAnim('idle')}
          onOpponentAnimationEnd={() => setOAnim('idle')}
        />
        <div className="flex items-center gap-4">
          <TurnIndicator isMyTurn={myTurn}>
            {myTurn ? 'Your turn!' : 'Opponent attacking...'}
          </TurnIndicator>
        </div>
        <div className="flex gap-3">
          <button
            onClick={attack}
            disabled={!myTurn || pHp <= 0 || oHp <= 0}
            className="battle-btn battle-btn--attack max-w-xs"
          >
            Attack!
          </button>
          <button
            onClick={reset}
            className="rounded bg-gray-700 px-4 py-3 text-sm text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};
