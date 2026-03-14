import type { Meta } from '@storybook/nextjs-vite';
import { BattleLog, BattleLogEntry } from './BattleLog';

const meta: Meta<typeof BattleLog> = {
  title: 'Battle/BattleLog',
  component: BattleLog,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Empty = {
  render: () => (
    <BattleLog title="Battle Log (0 events)">
      <BattleLogEntry>Battle started — make your move!</BattleLogEntry>
    </BattleLog>
  ),
};

export const WithEvents = {
  name: 'With Battle Events',
  render: () => (
    <BattleLog title="Battle Log (5 events)">
      <BattleLogEntry>
        <span className="text-white/70">
          <strong>Player</strong>&apos;s Charizard dealt <strong>45</strong>{' '}
          damage to Blastoise
          <span className="text-amber-400"> (x2 super effective!)</span>
        </span>
      </BattleLogEntry>
      <BattleLogEntry>
        <span className="text-white/70">
          <strong>Opponent</strong>&apos;s Blastoise dealt <strong>22</strong>{' '}
          damage to Charizard
          <span className="text-blue-400"> (x0.5 not very effective)</span>
        </span>
      </BattleLogEntry>
      <BattleLogEntry>
        <span className="text-sky-400">
          Opponent switched from Blastoise to Gengar (120/120 HP)
        </span>
      </BattleLogEntry>
      <BattleLogEntry>
        <span className="text-red-400">
          Opponent&apos;s Gengar was defeated! (1 remaining)
        </span>
      </BattleLogEntry>
      <BattleLogEntry>
        <span className="text-yellow-300 font-extrabold">
          Battle ended — Player wins!
        </span>
      </BattleLogEntry>
    </BattleLog>
  ),
};
