'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import type { LobbyDTO } from '@/domain/dtos';
import type { BattleEvent } from '@/application/stores';

export function useNotifications() {
  const lobby = useLobbyStore((s) => s.lobby);
  const myNickname = useLobbyStore((s) => s.myNickname);
  const events = useBattleStore((s) => s.events);
  const error = useConnectionStore((s) => s.error);
  const status = useConnectionStore((s) => s.status);

  const prevLobbyRef = useRef<LobbyDTO | null>(null);
  const prevEventsLenRef = useRef(0);
  const prevStatusRef = useRef(status);

  // Connection status changes
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === 'connecting' && status === 'connected') {
      toast.success('Connected to server');
    }
    if (prev === 'connected' && status === 'idle') {
      toast.error('Disconnected from server');
    }
  }, [status]);

  // Socket errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Lobby state changes
  useEffect(() => {
    const prev = prevLobbyRef.current;
    prevLobbyRef.current = lobby;

    if (!lobby || !myNickname) return;
    if (!prev) return;

    const prevPlayerCount = prev.players.length;
    const currPlayerCount = lobby.players.length;

    // Opponent joined
    if (prevPlayerCount < 2 && currPlayerCount === 2) {
      const opponent = lobby.players.find((p) => p.nickname !== myNickname);
      if (opponent) {
        toast.success(`${opponent.nickname} joined the lobby!`);
      }
    }

    // Opponent assigned team
    const prevOpponent = prev.players.find((p) => p.nickname !== myNickname);
    const currOpponent = lobby.players.find((p) => p.nickname !== myNickname);
    if (
      prevOpponent &&
      currOpponent &&
      prevOpponent.team.length === 0 &&
      currOpponent.team.length > 0
    ) {
      toast.info(`${currOpponent.nickname} has a team!`);
    }

    // Opponent ready
    if (
      prevOpponent &&
      currOpponent &&
      !prevOpponent.ready &&
      currOpponent.ready
    ) {
      toast.success(`${currOpponent.nickname} is ready!`);
    }
  }, [lobby, myNickname]);

  // Battle events
  useEffect(() => {
    const prevLen = prevEventsLenRef.current;
    const newEvents = events.slice(prevLen);
    prevEventsLenRef.current = events.length;

    newEvents.forEach((evt: BattleEvent) => {
      switch (evt.type) {
        case 'turn_result': {
          const { attacker, damage, typeMultiplier, defeated } = evt.data;
          const isMe = attacker.nickname === myNickname;

          if (typeMultiplier > 1) {
            toast.warning(
              `Super effective! ${damage} damage${defeated ? ' — KO!' : ''}`,
            );
          } else if (typeMultiplier < 1) {
            toast.info(`Not very effective... ${damage} damage`);
          } else if (defeated) {
            toast(isMe ? 'Enemy Pokémon fainted!' : 'Your Pokémon fainted!');
          }
          break;
        }
        case 'pokemon_defeated': {
          const isMine = evt.data.owner === myNickname;
          if (isMine) {
            toast.error(
              `${evt.data.pokemon} was defeated! (${evt.data.remainingTeam} left)`,
            );
          } else {
            toast.success(
              `You defeated ${evt.data.pokemon}! (${evt.data.remainingTeam} left)`,
            );
          }
          break;
        }
        case 'pokemon_switch': {
          const isMine = evt.data.player === myNickname;
          if (!isMine) {
            toast.info(`${evt.data.player} sent out ${evt.data.newPokemon}!`);
          }
          break;
        }
        case 'battle_end': {
          const isWinner = evt.data.winner === myNickname;
          if (evt.data.reason === 'opponent_disconnected') {
            toast.warning('Opponent disconnected — you win!');
          } else if (isWinner) {
            toast.success('Victory! You are the champion!');
          } else {
            toast.error(`Defeat! ${evt.data.winner} wins.`);
          }
          break;
        }
      }
    });
  }, [events, myNickname]);
}
