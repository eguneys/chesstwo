import { RayRole, Board, Pos, Piece, PieceOrPawn } from './types'
import { PosMap, Ray, rays, make_ray, pawn_push, pawn_capture, pawn_push2_ranks, Projection } from './types'
import { objmap, mapmap, posmap } from './types'
import { ColorMap, Color, isPawn, color_opposite } from './types'
import { Epos, pos_make, pos_rank, pos_file, promotables, pawn_promote_ranks } from './types'
import { PromotableRole, Role, Situation, situation_make} from './types'
import { piece_make, board_make, board_clone } from './types'
import { uci_uci, Uci } from './format/uci'
import { Castles, castlesInfos, CastlesInfo, shortCastlesInfo, longCastlesInfo } from './types'

export type Move = {
  action: AllActions,
  piece: PieceOrPawn,
  before: Situation
}

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


export type CastleMap<A> = Record<Castles, A>

function make_pawnpush_rays(orig: Pos, color: Color): Array<Ray> {
  let projections: Array<Projection> = pos_rank(orig) === pawn_push2_ranks[color] && [1, 2] || [1]
  let dir = pawn_push[color]
  return projections.flatMap(projection => make_ray(dir, orig, projection) || [])
}

function make_pawncapture_rays(orig: Pos, color: Color): Array<Ray> {
  return pawn_capture[color].flatMap(dir => make_ray(dir, orig, 1) || [])
}

export function make_castle_rook_rays(orig: Pos, castles: CastlesInfo): Ray | undefined {
  return make_ray(castles.trip, orig, 
    Math.abs(pos_file(orig) - castles.rook) as Projection)
}

export const castle_infos = {
  'O-O': shortCastlesInfo,
  'O-O-O': longCastlesInfo
}


export const castle_rook_rays: CastleMap<PosMap<Ray | undefined>> = objmap(castle_infos,
  (_, cinfo) =>
  mapmap(posmap, (pos: Pos, _) =>
    make_castle_rook_rays(pos, cinfo)
  ))


export const colors: ColorMap<Color> = {
  w: 'w',
  b: 'b'
}

export const pawnpush_rays: ColorMap<PosMap<Array<Ray>>> = objmap(colors,
  (color, _) =>
  mapmap(posmap, (pos: Pos, _) =>
    make_pawnpush_rays(pos, color)
  ))

export const pawncapture_rays: ColorMap<PosMap<Array<Ray>>> = objmap(colors,
  (color, _) =>
  mapmap(posmap, (pos: Pos, _) =>
    make_pawncapture_rays(pos, color)
  ))



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

    let ns = situation_uci_after(situation, uci)
    if (ns) {
      return situation_after(situation, ns.action)
    } else {
      console.log(situation.board.pieces.get(58), move, uci)
    }
  }, situation)
}


export function situation_uci_after(situation: Situation, uci: Uci) {
  return situation_moves(situation)
    .find(_ => _.action.orig === uci.orig && _.action.dest === uci.dest)
}

export function situation_moves(situation: Situation) {
  let { board } = situation


  let kings: ColorMap<Pos | undefined> = { w: undefined, b: undefined }
  let rooks: Array<Pos> = []

  let actions: Array<AllActions> = []

  for (let [pos, piece] of board.pieces) {
    if (piece.role === 'k') {
      kings[piece.color] = pos
    }
    if (piece.role === 'r') {
      rooks.push(pos)
    }

    if (piece.color === situation.turn) {

      let _actions = board_actions(board, pos, piece)

      actions = actions.concat(_actions)
    }
  }

  let _actions = rooks.flatMap(pos => {
    let piece = board_pos(board, pos)!
    return board_castle(board, pos, kings[piece.color]!)
  })

  actions = actions.concat(_actions)

  actions = actions.filter(_ => situation_action_turn_filter(situation, _))
  actions = actions.filter(_ => action_valid_filter(situation, _))

  return actions.map(_ => situation_action_move(situation, _))
}

function situation_action_turn_filter(situation: Situation, action: AllActions) {

  let piece = board_pos(situation.board, action.orig)

  if (!piece || piece.color !== situation.turn) {
    return false
  }
  return true
}

function action_valid_filter(situation: Situation, action: AllActions) {

  if ("blocks" in action && action.blocks.length > 0) {
    return false
  }
  if ("capture" in action && 
    action.capture &&
    board_pos(situation.board, action.capture)!.color ===
    board_pos(situation.board, action.orig)!.color) {
    return false
  }
  if (action.action === 'pawncapture' && !action.capture) {
    return false
  }
  return true
}

function board_actions(board: Board, pos: Pos, piece: PieceOrPawn): Array<AllActions> {
  let res: Array<AllActions> = []

  if (isPawn(piece)) {
    res = res.concat(board_pawncapture(board, pos, piece.color))
    res = res.concat(board_pawnpush(board, pos, piece.color))
  } else {
    res = res.concat(board_slide(board, pos, piece.role))
  } 
  return res
}

export function situation_action_move(situation: Situation, action: AllActions) {
  let before = situation
  let piece = board_pos(situation.board, action.orig)!;

  return {
    action,
    before,
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
  return pawncapture_rays[color].get(pos)!.flatMap(ray => {
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
  return pawnpush_rays[color].get(pos)!.flatMap(ray => {
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


function board_castle(board: Board, pos: Pos, kingPos: Pos): Array<Castle> {
  return castlesInfos.flatMap(castlesInfo => {
    let ray = castle_rook_rays[castlesInfo.castles].get(pos)!

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
    return []
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
