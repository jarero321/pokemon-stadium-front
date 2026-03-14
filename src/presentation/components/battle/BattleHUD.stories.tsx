import type { Meta } from '@storybook/nextjs-vite';
import { useState, useCallback, useRef } from 'react';
import { BattleArena } from './BattleArena';
import { BattleMessageBox, type BattleMessage } from './BattleMessageBox';
import { BattleActionMenu, type ActionMenuPokemon } from './BattleActionMenu';
import type { SpriteAnimation } from './PokemonSprite';
import {
  TEAMS,
  getMultiplier,
  calcDamage,
  capitalize,
  findNextAlive,
} from './__fixtures__/battleData';
import { BattleLog, BattleLogEntry } from './BattleLog';
import { TurnIndicator } from './TurnIndicator';

/* ── Meta ─────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Battle/BattleHUD',
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

/* ── 1. Message Box Demo ── */

export const MessageBoxDemo = {
  name: '1. Message Box Demo',
  render: () => {
    const scenarios: { label: string; messages: BattleMessage[] }[] = [
      {
        label: 'Super Effective Attack',
        messages: [
          { text: 'Charizard used Flamethrower!' },
          { text: "It's super effective!", type: 'super-effective' },
          { text: 'Blastoise took 45 damage!' },
        ],
      },
      {
        label: 'Not Very Effective',
        messages: [
          { text: 'Blastoise used Water Gun!' },
          { text: "It's not very effective...", type: 'not-effective' },
          { text: 'Charizard took 12 damage.' },
        ],
      },
      {
        label: 'KO Sequence',
        messages: [
          { text: 'Gengar used Shadow Ball!' },
          { text: "It's super effective!", type: 'super-effective' },
          { text: 'A critical hit!', type: 'critical' },
          { text: 'Alakazam fainted!', type: 'ko' },
        ],
      },
      {
        label: 'Victory',
        messages: [
          { text: 'Dragonite used Dragon Claw!' },
          { text: 'Machamp fainted!', type: 'ko' },
          { text: 'You defeated all enemy Pokemon!' },
          { text: 'Victory! You are the champion!', type: 'victory' },
        ],
      },
      {
        label: 'Defeat',
        messages: [
          { text: 'Machamp used Cross Chop!' },
          { text: "It's super effective!", type: 'super-effective' },
          { text: 'Dragonite fainted!', type: 'ko' },
          { text: 'You have no more Pokemon...', type: 'defeat' },
        ],
      },
    ];

    const [activeIdx, setActiveIdx] = useState(0);
    const [key, setKey] = useState(0);
    const [done, setDone] = useState(false);

    const play = (idx: number) => {
      setActiveIdx(idx);
      setKey((k) => k + 1);
      setDone(false);
    };

    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">
          Message Box — Click on the box to skip/advance
        </p>
        <div className="battle-hud">
          <BattleMessageBox
            messages={scenarios[activeIdx].messages}
            messageKey={key}
            onQueueComplete={() => setDone(true)}
          />
          <div className="battle-hud__divider" />
          <div className="flex min-w-[155px] items-center justify-center px-4">
            <span className="text-xs text-white/30">
              {done ? 'Queue complete' : 'Playing...'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => play(i)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                activeIdx === i
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

/* ── 2. Action Menu States ── */

export const ActionMenuStates = {
  name: '2. Action Menu States',
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    const addLog = (msg: string) => setLog((p) => [...p.slice(-6), msg]);

    const team: ActionMenuPokemon[] = [
      {
        name: 'Charizard',
        hp: 153,
        maxHp: 153,
        types: ['fire', 'flying'],
        defeated: false,
      },
      {
        name: 'Gengar',
        hp: 80,
        maxHp: 120,
        types: ['ghost', 'poison'],
        defeated: false,
      },
      {
        name: 'Dragonite',
        hp: 0,
        maxHp: 182,
        types: ['dragon', 'flying'],
        defeated: true,
      },
    ];

    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
            Your turn — Main menu
          </p>
          <div className="battle-hud">
            <BattleMessageBox messages={[]} messageKey={0} />
            <div className="battle-hud__divider" />
            <BattleActionMenu
              onAttack={() => addLog('FIGHT clicked!')}
              onSwitch={(i) => addLog(`Switch to ${team[i].name}!`)}
              team={team}
              activePokemonIndex={0}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
            Opponent turn — Disabled
          </p>
          <div className="battle-hud">
            <BattleMessageBox
              messages={[{ text: "Waiting for opponent's move..." }]}
              messageKey={0}
            />
            <div className="battle-hud__divider" />
            <BattleActionMenu disabled team={team} activePokemonIndex={0} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
            Forced switch — Pokemon fainted!
          </p>
          <div className="battle-hud">
            <BattleMessageBox
              messages={[
                {
                  text: 'Charizard fainted! Choose your next Pokemon!',
                  type: 'ko',
                },
              ]}
              messageKey={0}
            />
            <div className="battle-hud__divider" />
            <BattleActionMenu
              forcedSwitch
              onSwitch={(i) => addLog(`Forced switch to ${team[i].name}!`)}
              team={team}
              activePokemonIndex={0}
            />
          </div>
        </div>
        {log.length > 0 && (
          <BattleLog title="Action Log">
            {log.map((msg, i) => (
              <BattleLogEntry key={i}>{msg}</BattleLogEntry>
            ))}
          </BattleLog>
        )}
      </div>
    );
  },
};

/* ── 3. Immersive Battle ── */

interface BattleState {
  pTeam: typeof TEAMS.player;
  oTeam: typeof TEAMS.opponent;
  pIdx: number;
  oIdx: number;
}

export const ImmersiveBattle = {
  name: '3. Immersive Battle',
  render: () => {
    /* ── state ── */
    const [battle, setBattle] = useState<BattleState>({
      pTeam: TEAMS.player.map((p) => ({ ...p })),
      oTeam: TEAMS.opponent.map((p) => ({ ...p })),
      pIdx: 0,
      oIdx: 0,
    });
    const [messages, setMessages] = useState<BattleMessage[]>([]);
    const [msgKey, setMsgKey] = useState(0);
    const [phase, setPhase] = useState<
      'idle' | 'player-atk' | 'opponent-atk' | 'ko-switch' | 'finished'
    >('idle');
    const [pAnim, setPAnim] = useState<SpriteAnimation>('idle');
    const [oAnim, setOAnim] = useState<SpriteAnimation>('idle');
    const [pAnimKey, setPAnimKey] = useState(0);
    const [oAnimKey, setOAnimKey] = useState(0);
    const phaseAfterMsgRef = useRef<
      'opponent-atk' | 'idle' | 'ko-switch' | 'finished'
    >('idle');
    const oAnimNextRef = useRef<(() => void) | null>(null);
    const pAnimNextRef = useRef<(() => void) | null>(null);

    const pActive = battle.pTeam[battle.pIdx];
    const oActive = battle.oTeam[battle.oIdx];

    const team: ActionMenuPokemon[] = battle.pTeam.map((p) => ({
      name: p.name,
      hp: p.hp,
      maxHp: p.maxHp,
      types: p.types,
      defeated: p.hp <= 0,
    }));

    /* ── FIGHT ── */
    const handleAttack = useCallback(() => {
      if (phase !== 'idle' || pActive.hp <= 0 || oActive.hp <= 0) return;

      const mult = getMultiplier(pActive.types, oActive.types);
      const dmg = calcDamage(pActive.attack, oActive.defense, mult);
      const newHp = Math.max(0, oActive.hp - dmg);
      const ko = newHp <= 0;

      // Update opponent HP
      setBattle((prev) => {
        const oTeam = [...prev.oTeam];
        oTeam[prev.oIdx] = { ...oTeam[prev.oIdx], hp: newHp };
        return { ...prev, oTeam };
      });

      // Attacking lunge → damage
      setOAnimKey((k) => k + 1);
      setPAnim('attacking');
      setPAnimKey((k) => k + 1);
      pAnimNextRef.current = () => {
        setPAnim('idle');
        setOAnim(mult > 1 ? 'critical' : 'damage');
      };

      // Build messages
      const msgs: BattleMessage[] = [
        { text: `${capitalize(pActive.name)} attacks!` },
      ];
      if (mult > 1)
        msgs.push({ text: "It's super effective!", type: 'super-effective' });
      if (mult < 1 && mult > 0)
        msgs.push({
          text: "It's not very effective...",
          type: 'not-effective',
        });
      if (mult === 0)
        msgs.push({
          text: "It doesn't affect the enemy...",
          type: 'not-effective',
        });
      msgs.push({ text: `${capitalize(oActive.name)} took ${dmg} damage!` });

      if (ko) {
        msgs.push({ text: `${capitalize(oActive.name)} fainted!`, type: 'ko' });
        // Check if more opponent pokemon
        const nextOppIdx = findNextAlive(battle.oTeam, battle.oIdx, newHp);
        if (nextOppIdx === -1) {
          msgs.push({
            text: 'You defeated all enemy Pokemon!',
            type: 'victory',
          });
          msgs.push({
            text: 'Victory! You are the champion!',
            type: 'victory',
          });
          phaseAfterMsgRef.current = 'finished';
          // Chain: damage → fainting (no key change = no remount = no flash)
          oAnimNextRef.current = () => {
            setOAnim('fainting');
          };
        } else {
          msgs.push({
            text: `Opponent sends out ${capitalize(TEAMS.opponent[nextOppIdx].name)}!`,
          });
          phaseAfterMsgRef.current = 'idle';
          // Chain: damage → fainting → entering
          // No setOAnimKey — Framer Motion transitions between states without remounting
          oAnimNextRef.current = () => {
            setOAnim('fainting');
            oAnimNextRef.current = () => {
              setBattle((prev) => ({ ...prev, oIdx: nextOppIdx }));
              setOAnim('entering');
            };
          };
        }
      } else {
        phaseAfterMsgRef.current = 'opponent-atk';
      }

      setPhase('player-atk');
      setMessages(msgs);
      setMsgKey((k) => k + 1);
    }, [phase, pActive, oActive, battle]);

    /* ── Opponent counter-attack ── */
    const doOpponentAttack = useCallback(() => {
      const currentO = battle.oTeam[battle.oIdx];
      const currentP = battle.pTeam[battle.pIdx];
      if (currentO.hp <= 0 || currentP.hp <= 0) {
        setPhase('idle');
        return;
      }

      const mult = getMultiplier(currentO.types, currentP.types);
      const dmg = calcDamage(currentO.attack, currentP.defense, mult);
      const newHp = Math.max(0, currentP.hp - dmg);
      const ko = newHp <= 0;

      setBattle((prev) => {
        const pTeam = [...prev.pTeam];
        pTeam[prev.pIdx] = { ...pTeam[prev.pIdx], hp: newHp };
        return { ...prev, pTeam };
      });

      // Attacking lunge → damage/critical
      setOAnimKey((k) => k + 1);
      setOAnim('attacking');
      oAnimNextRef.current = () => {
        setOAnim('idle');
        setPAnimKey((k) => k + 1);
        setPAnim(mult > 1 ? 'critical' : 'damage');
      };

      const msgs: BattleMessage[] = [
        { text: `${capitalize(currentO.name)} attacks!` },
      ];
      if (mult > 1)
        msgs.push({ text: "It's super effective!", type: 'super-effective' });
      if (mult < 1 && mult > 0)
        msgs.push({
          text: "It's not very effective...",
          type: 'not-effective',
        });
      msgs.push({ text: `${capitalize(currentP.name)} took ${dmg} damage!` });

      if (ko) {
        msgs.push({
          text: `${capitalize(currentP.name)} fainted!`,
          type: 'ko',
        });
        const nextPlayerIdx = findNextAlive(battle.pTeam, battle.pIdx, newHp);
        if (nextPlayerIdx === -1) {
          msgs.push({ text: 'All your Pokemon fainted!', type: 'defeat' });
          msgs.push({ text: 'You blacked out...', type: 'defeat' });
          phaseAfterMsgRef.current = 'finished';
          // Chain: damage → fainting (no key change = smooth transition)
          pAnimNextRef.current = () => {
            setPAnim('fainting');
          };
        } else {
          msgs.push({ text: 'Choose your next Pokemon!' });
          phaseAfterMsgRef.current = 'ko-switch';
          // Chain: damage → fainting (no key change = smooth transition)
          pAnimNextRef.current = () => {
            setPAnim('fainting');
          };
        }
      } else {
        phaseAfterMsgRef.current = 'idle';
      }

      setPhase('opponent-atk');
      setMessages(msgs);
      setMsgKey((k) => k + 1);
    }, [battle]);

    /* ── Message queue complete handler ── */
    const handleQueueComplete = useCallback(() => {
      const nextPhase = phaseAfterMsgRef.current;
      if (nextPhase === 'opponent-atk') {
        setTimeout(() => doOpponentAttack(), 600);
      } else {
        setPhase(nextPhase);
        if (nextPhase === 'idle') {
          setMessages([]);
          setMsgKey((k) => k + 1);
        }
      }
    }, [doOpponentAttack]);

    /* ── Switch ── */
    const handleSwitch = useCallback(
      (index: number) => {
        if (index === battle.pIdx) return;
        const targetPkm = battle.pTeam[index];

        setBattle((prev) => ({ ...prev, pIdx: index }));
        setPAnimKey((k) => k + 1);
        setPAnim('entering');

        const msgs: BattleMessage[] = [
          { text: `Come back, ${capitalize(pActive.name)}!` },
          { text: `Go, ${capitalize(targetPkm.name)}!`, type: 'info' },
        ];

        if (phase === 'ko-switch') {
          phaseAfterMsgRef.current = 'idle';
        } else {
          // Voluntary switch costs a turn — opponent attacks
          phaseAfterMsgRef.current = 'opponent-atk';
        }

        setPhase('player-atk');
        setMessages(msgs);
        setMsgKey((k) => k + 1);
      },
      [battle, pActive, phase],
    );

    /* ── Reset ── */
    const reset = () => {
      oAnimNextRef.current = null;
      pAnimNextRef.current = null;
      setBattle({
        pTeam: TEAMS.player.map((p) => ({ ...p })),
        oTeam: TEAMS.opponent.map((p) => ({ ...p })),
        pIdx: 0,
        oIdx: 0,
      });
      setMessages([]);
      setMsgKey((k) => k + 1);
      setPhase('idle');
      setPAnim('entering');
      setOAnim('entering');
      setPAnimKey((k) => k + 1);
      setOAnimKey((k) => k + 1);
    };

    const isActionsDisabled = phase !== 'idle' && phase !== 'ko-switch';

    return (
      <div className="flex flex-col gap-0">
        {/* Arena */}
        <BattleArena
          playerPokemon={
            pActive.hp > 0 || pAnim !== 'idle'
              ? {
                  ...pActive,
                  name: pActive.name,
                  types: pActive.types,
                }
              : null
          }
          opponentPokemon={
            oActive.hp > 0 || phase === 'player-atk' || oAnim !== 'idle'
              ? {
                  ...battle.oTeam[battle.oIdx],
                  name: battle.oTeam[battle.oIdx].name,
                  types: battle.oTeam[battle.oIdx].types,
                }
              : null
          }
          playerAnimation={pAnim}
          opponentAnimation={oAnim}
          playerAnimKey={pAnimKey}
          opponentAnimKey={oAnimKey}
          onPlayerAnimationEnd={() => {
            const next = pAnimNextRef.current;
            pAnimNextRef.current = null;
            if (next) next();
            else setPAnim('idle');
          }}
          onOpponentAnimationEnd={() => {
            const next = oAnimNextRef.current;
            oAnimNextRef.current = null;
            if (next) next();
            else setOAnim('idle');
          }}
        />

        {/* HUD: Message Box + Action Menu */}
        <div
          className="battle-hud"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderTop: 'none',
            marginTop: -3,
          }}
        >
          <BattleMessageBox
            messages={messages}
            messageKey={msgKey}
            onQueueComplete={handleQueueComplete}
          />
          <div className="battle-hud__divider" />
          <BattleActionMenu
            disabled={isActionsDisabled}
            forcedSwitch={phase === 'ko-switch'}
            onAttack={handleAttack}
            onSwitch={handleSwitch}
            team={team}
            activePokemonIndex={battle.pIdx}
          />
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TurnIndicator isMyTurn={phase === 'idle'}>
              {phase === 'idle' && 'Your turn!'}
              {phase === 'player-atk' && 'Attacking...'}
              {phase === 'opponent-atk' && 'Opponent attacking...'}
              {phase === 'ko-switch' && 'Choose a Pokemon!'}
              {phase === 'finished' && 'Battle Over'}
            </TurnIndicator>
          </div>
          <button
            onClick={reset}
            className="rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white/70"
          >
            Reset Battle
          </button>
        </div>
      </div>
    );
  },
};
