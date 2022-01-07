import { FRoot } from './fnode'
import { Fen, SanOrCastles, Move, Situation } from '../types'

export type Ply = number

export type QPGN = {
  tags: TagMap,
  fens: FenMap,
  variations: FRoot<QMove, Situation>,
  branchPlies: Array<Ply>
}

export type QMove = {
  ply: Ply,
  maxPly?: Ply,
  move: SanMetaWithExtra,
  tsmove?: Move,
  fenAfter?: Fen
}

export type QScore = {
  ply: Ply,
  maxPly: Ply
}


export type TagMap = Map<string, string>
export type FenMap = Map<Fen, Array<QMove>>

export type SanMetaWithExtra = {
  san?: SanOrCastles,
  extra: any
}
