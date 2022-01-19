import { uci_pos, uci_promotable, Pos, PromotableRole, Move } from '../types'
import { Fen, initial_situation, fen_situation, situation_fen, Situation, situation_valids, board_pos, situation_after } from '../types'


export type Uci = {
  orig: Pos,
  dest: Pos,
  promote?: PromotableRole
}

export function fen_after_ucis(fen: Fen, moves: Array<string>) {
  let res = moves.map(str => uci_uci(str))
    .reduce((situation, uci) =>
    uci && situation && situation_uci_move(situation, uci)?.after,
    fen === 'startpos' ? initial_situation : fen_situation(fen))

  return res && situation_fen(res)
}


export function situation_uci_move(situation: Situation, uci: Uci) {
  let valids = situation_valids(situation)
  let action = valids.bydest.get(uci.dest)?.filter(slide => 
    slide.orig === uci.orig &&
    (!uci.promote || ("promote" in slide && slide.promote === uci.promote))
  )?.[0]

  if (action) {

    let before = situation
    let piece = board_pos(situation.board, action.orig)!;
    let after = situation_after(situation, action)

    if (after) {
      return {
        action,
        before,
        after,
        piece
      }
    }
  }
}


export function move_ucio(move: Move): Uci {

  return {
    orig: move.action.orig,
    dest: move.action.dest,
    promote: "promote" in move.action ? move.action.promote: undefined
  }
}

export function uci_uci(uci: string) {
  if (uci.length === 4) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))

    if (orig && dest) {
      return {
        orig,
        dest
      }
    }
  } else if (uci.length === 6) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))
    let promote = uci_promotable(uci[5])

    if (orig && dest && promote) {
      return {
        orig,
        dest,
        promote
      }
    }

  }
}
