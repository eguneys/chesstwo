import { RayRole, Board, Pos, Piece, board_pos } from './types'
import { rays, pawnpush_rays, pawncapture_rays } from './types'
import { Color } from './types'
import { pos_rank, promotables, pawn_promote_ranks } from './types'

function board_pawncapture(board: Board, pos: Pos, color: Color) {
  pawncapture_rays(pos, color).map(ray => {
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

function board_pawnpush(board: Board, pos: Pos, color: Color) {
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

function board_sliding(board: Board, pos: Pos, role: RayRole) {
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
