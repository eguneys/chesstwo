import { RayRole, Board, Pos, Piece, PieceOrPawn } from './types'
import { rays, pawnpush_rays, pawncapture_rays } from './types'
import { Color, isPawn, color_opposite } from './types'
import { Epos, pos_make, pos_rank, promotables, pawn_promote_ranks } from './types'
import { PromotableRole, Role, Situation, situation_make} from './types'
import { piece_make, board_make, board_clone } from './types'
import { uci_uci, Uci } from './format/uci'
import { Move, Castles, castlesInfos, castle_rook_rays } from './types'

export type ActionType = 'slide' | 'pawnpush' | 'pawncapture' | 'enpassant' | 'castle'

export type HasAction = {
  action: ActionType
}
export type HasOrigDest = {
  orig: Pos,
  dest: Pos
}

export type HasBlocks = {
  blocks: Array<Pos>
}

export type HasCapture = {
  capture?: Pos
}

export type HasPromote = {
  promote?: PromotableRole
}

export type IsAction = HasAction & HasOrigDest & {

}

export type Slide = IsAction & HasBlocks & HasCapture & {
  action: 'slide'
}

export type PawnPush = IsAction & HasBlocks & HasPromote & {
  action: 'pawnpush'
}
export type PawnCapture = IsAction & HasCapture & HasPromote & {
  action: 'pawncapture'
}

export type Enpassant = IsAction & HasCapture & {
  action: 'enpassant'
}

export type Castle = IsAction & HasBlocks & {
  action: 'castle'
  castles: Castles,
  orig_rook: Pos,
  dest_rook: Pos,
}

export type AllActions = Slide | PawnPush | PawnCapture | Enpassant | Castle


export const initial_pieces = (() => {
  let res = new Map()

  let backrank: Array<Role> = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']

  for (let i = 1; i <= 8; i++) {
    res.set(pos_make(i as Epos, 1), piece_make(backrank[i-1], 'w'))
    res.set(pos_make(i as Epos, 8), piece_make(backrank[i-1], 'b'))
    res.set(pos_make(i as Epos, 2), piece_make('p', 'w'))
    res.set(pos_make(i as Epos, 7), piece_make('p', 'b'))
  }


  return res
})()

export function situation_initial() {
  return {
    board: board_make(initial_pieces),
    turn: 'w' as Color
  }
}

export function play_moves(situation: Situation, moves: Array<string>) {
  return moves.reduce<Situation | undefined>((situation, move) => {
    if (!situation) {
      return 
    }
    let uci = uci_uci(move)
    if (!uci) {
      return
    }

    if (!situation_uci_after(situation, uci)) {
      console.log(situation.board.pieces.get(58), move, uci)
    }
    return situation_uci_after(situation, uci)?.after
  }, situation)
}


export function situation_uci_after(situation: Situation, uci: Uci) {
  return situation_moves(situation)
    .find(_ => _.action.orig === uci.orig && _.action.dest === uci.dest)
}

export function situation_moves(situation: Situation) {
  let { board } = situation
  let actions = board_actions(board)

  return actions.map(_ => situation_action_move(situation, _))
}

function board_actions(board: Board): Array<AllActions> {
  let { pieces } = board
  let res: Array<AllActions> = []

  for (let [pos, piece] of pieces) {
    if (isPawn(piece)) {
     res = res.concat(board_pawncapture(board, pos, piece.color))
     res = res.concat(board_pawnpush(board, pos, piece.color))
    } else {
      res = res.concat(board_slide(board, pos, piece.role))
    } 
  }
  return res
}

export function situation_action_move(situation: Situation, action: AllActions) {
  let before = situation
  let piece = board_pos(situation.board, action.orig)!;
  let after = situation_after(situation, action)

  return {
    action,
    before,
    after,
    piece
  }
}

export function situation_after(situation: Situation, action: AllActions) {
  let { board, turn } = situation
  let after = board_clone(board)

  if (action.action === 'castle') {
    let king = board_pos(after, action.orig)!
    let rook = board_pos(after, action.orig_rook)!

    board_pickup(after, action.orig)
    board_pickup(after, action.orig_rook)
    board_drop(after, action.dest, king)
    board_drop(after, action.dest_rook, rook)
    return situation_make(after, color_opposite(turn))
  }

  if ("capture" in action && action.capture) {
    board_pickup(after, action.capture)
  }

  let p = board_pos(after, action.orig)!
  board_pickup(after, action.orig)

  if ("promote" in action && action.promote) {
    board_drop(after, action.dest, piece_make(action.promote, p.color))
  } else {
    board_drop(after, action.dest, p)
  }
  return situation_make(after, color_opposite(turn))
}



function board_pawncapture(board: Board, pos: Pos, color: Color): Array<PawnCapture> {
  return pawncapture_rays(pos, color).flatMap(ray => {
    let { orig, dest } = ray

    let capturePiece = board_pos(board, ray.dest)
    let capture = capturePiece && ray.dest
    let cover = ray.dest

    if (pos_rank(orig) === pawn_promote_ranks[color]) {
      return promotables.map(promote =>
        ({
          action: 'pawncapture', 
          orig,
          dest,
          capture,
          cover,
          promote,
        })
      )
    } else {
      return {
        action: 'pawncapture', 
        orig,
        dest,
        capture,
        cover
      }
    }
  })
 
}

function board_pawnpush(board: Board, pos: Pos, color: Color): Array<PawnPush> {
  return pawnpush_rays(pos, color).flatMap(ray => {
    let { orig, dest } = ray

    let blocks = ray.between.flatMap(_ =>
      (board_pos(board, _) && _) || [])
    let capturePiece = board_pos(board, ray.dest)
    let capture = capturePiece && ray.dest

    if (capture) {
      blocks.push(capture)
    }

    if (pos_rank(orig) === pawn_promote_ranks[color]) {
      return promotables.map(promote =>
        ({
          action: 'pawnpush', 
          orig,
          dest,
          blocks,
          promote,
        }))
    } else {
      return {
        action: 'pawnpush', 
        orig,
        dest,
        blocks,
      }
    }
  })
}

function board_slide(board: Board, pos: Pos, role: RayRole): Array<Slide> {
  return rays[role].get(pos)!.map(ray => {
    let { orig, dest } = ray
    let blocks = ray.between.flatMap(_ =>
      (board_pos(board, _) && _) || [])
    let capturePiece = board_pos(board, ray.dest)
    let capture = capturePiece && ray.dest

    return {
      action: 'slide', 
      orig,
      dest,
      blocks,
      capture
    }
  })
}


function board_castle(board: Board, kingPos: Pos, pos: Pos) {
  return castlesInfos.flatMap(castlesInfo => {
    let ray = castle_rook_rays(pos, castlesInfo)
    if (!ray) { return [] }
    let blocks = ray.between.flatMap(_ =>
      (board_pos(board, _) && _) || [])
    let capturePiece = board_pos(board, ray.dest)

    if (kingPos) {
      let kingTo = pos_make(castlesInfo.king, pos_rank(kingPos))
      let rookTo = ray.dest
      return {
        action: 'castle',
        castles: castlesInfo.castles,
        orig: kingPos,
        dest: kingTo,
        blocks,
        orig_rook: pos,
        dest_rook: rookTo
      }
    }
  })
}

export function board_pickup(board: Board, pos: Pos) {
  board.pieces.delete(pos)
}

export function board_drop(board: Board, pos: Pos, pipa: PieceOrPawn) {
  board.pieces.set(pos, pipa)
}


export function board_pos(board: Board, pos: Pos) {
  return board.pieces.get(pos)
}
