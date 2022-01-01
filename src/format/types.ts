import { PNode } from './pnode'
import { Fen, SanOrCastles, Move } from '../types'

export type Ply = number

export type QPGN = {
  tags: TagMap,
  fens: FenMap,
  variations: PNode<QMove>,
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
