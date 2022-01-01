export type Fen = string

export type San = string


export type Epos = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type File = Epos
export type Rank = Epos
// File * 10 + Rank
export type Pos = number

export type PosMap<A> = Map<Pos, A>

export type Ray = {
  orig: Pos,
  dest: Pos,
  between: Array<Pos>
}

export type Color = 'w' | 'b'

export type RayRole = 'n' | 'r' | 'b' | 'q' | 'k'
export type PawnRole = 'p'
export type PromotableRole = 'n' | 'r' | 'b' | 'q'
export type Role = RayRole | PawnRole

export type ColorMap<A> = Record<Color, A>;

export type HasColor = {
  color: Color
}

export type Piece = HasColor & {
  role: RayRole
}

export type Pawn = HasColor & {
  role: 'p'
}

export type PieceOrPawn = Piece | Pawn

export type RayRoleMap<A> = Record<RayRole, A>

export type EDir = -2 | -1 | 0 | 1 | 2
export type Projection = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Dir = [EDir, EDir]


export type Board = {
  pieces: PosMap<PieceOrPawn>
}

export type Situation = {
  board: Board,
  turn: Color
}

export type ActionType = 'slide' | 'pawnpush' | 'pawncapture' | 'pawnpromote' | 'castle'

export type HasAction = {
  action: ActionType
}
export type HasOrigDest = {
  orig: Pos,
  dest: Pos
}

export type HasValidTurn = {
  valid_turn: boolean,
  valid_king: boolean,
  valid_ok: boolean
}

export type HasBlocks = {
  blocks: Array<Pos>
}

export type HasCapture = {
  capture?: Pos
}

export type IsAction = HasAction & HasOrigDest & HasValidTurn & {

}

export type Slide = IsAction & HasBlocks & HasCapture & {
  action: 'slide'
}

export type PawnPush = IsAction & HasBlocks & {
  action: 'pawnpush'
}
export type PawnCapture = IsAction & HasCapture & {
  action: 'pawncapture'
}

export type PawnPromote = IsAction & HasBlocks & {
  action: 'pawnpromote'
  to: PromotableRole
}

export type Castle = IsAction & HasBlocks & {
  action: 'castle'
  orig_rook: Pos,
  dest_rook: Pos,
}

export type PosActions<A extends HasAction> = {
  byorig: PosMap<Array<A>>,
  bydest: PosMap<Array<A>>,
  byblocks: PosMap<Array<A>>
  bycapture: PosMap<Array<A>>
}


export type SanMeta = {
  to: Pos,
  role: Role,
  file?: File,
  rank?: Rank,
  promotion?: Role,
  capture?: boolean,
  check?: boolean,
  mate?: boolean
}

export type LongCastles = 'o-o-o'
export type ShortCastles = 'o-o'

export type Castles = LongCastles | ShortCastles

export type SanOrCastles = San | Castles

export type Move = {
  before: Situation,
  after: Situation
}

export function isSlide(_: HasAction): _ is Slide {
  return _.action === 'slide'
}

export const pawn_push2_ranks: ColorMap<Rank> = {
  w: 2,
  b: 7
}

export const pawn_promote_ranks: ColorMap<Rank> = {
  w: 8,
  b: 1
}

export const pawn_push: ColorMap<Dir> = {
  w: [0, 1],
  b: [0, -1]
}

export const knight: Array<Dir> = [[-2, 1], [2, 1], [-2, -1], [2, -1],
  [1, -2], [1, 2], [-1, -2], [-1, 2]]
export const rook: Array<Dir> = [[1, 0], [-1, 0], [0, 1], [0, -1]]
export const bishop: Array<Dir> = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
export const queen: Array<Dir> = [...rook, ...bishop]
export const king: Array<Dir> = [...queen]

export const long_projection: Array<Projection> = [1, 2, 3, 4, 5, 6, 7]
export const short_projection: Array<Projection> = [1]

export const raydirs: RayRoleMap<[Array<Dir>, Array<Projection>]> = {
  n: [knight, short_projection],
  r: [rook, long_projection],
  b: [bishop, long_projection],
  q: [queen, long_projection],
  k: [king, short_projection]
}

export function isEpos(_: number): _ is Epos {
  return _ >= 1 && _ <= 8
}

export function pos_make(file: File, rank: Rank) {
  return file * 10 + rank
}
export function pos_file(pos: Pos): File {
  return Math.floor(pos / 10) as File
}
export function pos_rank(pos: Pos): Rank {
  return pos % 10 as Rank
}

export function pos_dir(pos: Pos, dir: Dir) {
 let file = pos_file(pos) + dir[0],
    rank = pos_rank(pos) + dir[1]

  if (isEpos(file) && isEpos(rank)) {
    return pos_make(file, rank)
  }
}

export const eposs: Array<Epos> = [1, 2, 3, 4, 5, 6, 7, 8]
export const posmap: PosMap<Pos> = (() => {
  let res = new Map<Pos, Pos>()
    eposs.forEach(file => eposs.forEach(rank => {
      res.set(pos_make(file, rank), pos_make(file, rank))
    })) 
  return res
})()

export const rays: RayRoleMap<PosMap<Array<Ray>>> = objmap(raydirs, 
  (role, [dirs, projections]) => 
  mapmap(posmap, (pos: Pos, _) => 
    dirs.flatMap(dir => projections.flatMap(projection =>
      make_ray(dir, pos, projection) || []))
  ))

export function pawnpush_rays(orig: Pos, color: Color): Array<Ray> {
  let projections: Array<Projection> = pos_rank(orig) === pawn_push2_ranks[color] && [1, 2] || [1]
  let dir = pawn_push[color]
  return projections.flatMap(projection => make_ray(dir, orig, projection) || [])
}

export function make_ray(dir: Dir, orig: Pos, projection: Projection): Ray | undefined {

  let next: Pos | undefined = orig
  let between = []
  for (let i = 0; i < projection - 1; i++) {
    next = pos_dir(next, dir)
   
    if (!next) {
      return undefined
    }
    between.push(next)
  }
  let dest = pos_dir(next, dir)
  if (!dest) {
    return undefined
  }

  return {
    orig,
    dest,
    between
  }
}


export function isPiece(_: PieceOrPawn): _ is Piece {
  return _.role !== 'p'
}

export const colors = ['w', 'b']
export function isColor(_: string): _ is Color {
  return colors.includes(_)
}

export function white_if(b: boolean) {
  return b ? 'w' : 'b'
}

export const roles = ['q', 'k', 'r', 'b', 'n', 'p']
export function isRole(_: string): _ is Role {
  return roles.includes(_)
}

export function uci_piece(uci: string) {

  let role = uci.toLowerCase()
  if (isRole(role)) {
    let color = white_if(role !== uci)

    return {
      role,
      color
    }
  }
}

export function board_make(pieces: PosMap<PieceOrPawn> = new Map()) {
  return { pieces }
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

export function situation_slides(situation: Situation) {
  let { board, turn } = situation

  let slide_actions = posactions<Slide>()
  let pawn_pushes = posactions<PawnPush>()

  mapmap(board.pieces, (pos, piece) => {
    if (isPiece(piece)) {
      rays[piece.role].get(pos)!.map(ray => {
        let { orig, dest } = ray
        let blocks = ray.between.flatMap(_ =>
          (board_pos(board, _) && _) || [])
        let capturePiece = board_pos(board, ray.dest)
        let capture = capturePiece && ray.dest

        let valid_turn = piece.color === turn
        let valid_ok = blocks.length === 0 &&
          (!capturePiece || capturePiece.color !== piece.color)
        let valid_king = false
          
        posactions_add(slide_actions, {
          action: 'slide', 
          orig,
          dest,
          blocks,
          capture,
          valid_turn,
          valid_king,
          valid_ok
        })
      })
    } else {
      pawnpush_rays(pos, piece.color).map(ray => {
        let { orig, dest } = ray
        let blocks = ray.between.flatMap(_ =>
          (board_pos(board, _) && _) || [])
        let capturePiece = board_pos(board, ray.dest)
        let capture = capturePiece && ray.dest

        let valid_turn = piece.color === turn
        let valid_ok = blocks.length === 0 &&
          !capturePiece
        let valid_king = false

        posactions_add(slide_actions, {
          action: 'slide', 
          orig,
          dest,
          blocks,
          capture,
          valid_turn,
          valid_king,
          valid_ok
        })
      })
    } 
  })
  return slide_actions
}

export function situation_moves(situation: Situation) {
  return posactions_filter(situation_slides(situation))
}

export function situation_sanorcastles(situation: Situation, sanorcastles: SanOrCastles): Move | undefined {

  return undefined
}

export function valid_action_filter(a: IsAction) {
  return a.valid_turn && a.valid_ok
}

export function posactions_filter<A extends IsAction>(posaction: PosActions<A>, filter: (_: IsAction) => boolean = valid_action_filter) {
  maparray_filter(posaction.byorig, filter)
  maparray_filter(posaction.bydest, filter)
  maparray_filter(posaction.byblocks, filter)
  maparray_filter(posaction.bycapture, filter)
  return posaction
}

export function maparray_filter<K, V>(map: Map<K, Array<V>>, filter: (v: V) => boolean) {
  for (let [key, value] of map) {
    map.set(key, value.filter(filter))
  }
}

export function mapfilter<K, V>(map: Map<K, V>, filter: (v: V) => boolean) {
  for (let [key, value] of map) {
    if (!filter(value)) {
      map.delete(key)
    }
  }
}

export function posactions_add<A extends HasAction>(posaction: PosActions<A>, has_action: A) {
  if (isSlide(has_action)) {
    maparray_push(posaction.byorig, has_action.orig, has_action)
    maparray_push(posaction.bydest, has_action.dest, has_action)

    has_action.blocks.forEach(block =>
      maparray_push(posaction.byblocks, block, has_action))

    if (has_action.capture) {
      maparray_push(posaction.bycapture, has_action.capture, has_action)
    }
  }
}

export function maparray_push<K, V>(_map: Map<K, Array<V>>, key: K, value: V) {
  let _arr = _map.get(key) || []
  _arr.push(value)
  _map.set(key, _arr)
}


export function posactions<A extends HasAction>(): PosActions<A> {
  let byorig = new Map(),
    bydest = new Map(),
    byblocks = new Map(),
    bycapture = new Map()

  return {
    byorig,
    bydest,
    byblocks,
    bycapture
  }
}


export function slide_uci(slide: Slide) {
  return pos_uci(slide.orig) + pos_uci(slide.dest)
}

export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

export function uci_pos(uci: string) {
  let file = files.indexOf(uci[0]) + 1,
    rank = ranks.indexOf(uci[1]) + 1

  if (isEpos(file) && isEpos(rank)) {
    return pos_make(file, rank)
  }
}

export function file_uci(file: File) {
  return files[file - 1]
}

export function rank_uci(rank: Rank) {
  return ranks[rank - 1]
}


export function pos_uci(pos: Pos) {
  return file_uci(pos_file(pos)) +
    rank_uci(pos_rank(pos))
}

export function move_san(move: Move): San {
  return ''
}

export function situation_fen(situation: Situation): Fen {
  return ''
}


export const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export function fen_situation(fen: Fen): Situation | undefined {

  let [_pieces, _turn] = fen.split(' ')
  let pieces = new Map()

  let file: File = 1,
    rank: Rank = 8
  for (let i = 0; i < _pieces.length; i++) {
    let ch = _pieces[i]
    if (ch === '/') {
      rank--
      file=1
    } else if (ch >= '1' && ch <= '8') {
      file += parseInt(ch)
    } else {
      let piece = uci_piece(ch),
        pos = pos_make(file as File, rank as Rank)

      if (piece && pos) {
        pieces.set(pos, piece)
      }


      file++
    }
  }

  if (isColor(_turn)) {
    return {
      board: board_make(pieces),
      turn: _turn
    }
  }
}
export const initial_situation = fen_situation(initial)!


export function sanOrCastles(sanOrC: string): SanOrCastles | undefined {
  return undefined
}

export function mapmap<K, A, B>(obj: Map<K, A>, fn: (k: K, a: A) => B | undefined): Map<K, B> {
  let res = new Map<K, B>()
  for (let [key, value] of obj) {
    let v2 = fn(key, value)
    if (v2) {
      res.set(key, v2)
    }
  }
  return res
}

export function objmap<K extends string, A, B>(obj: Record<K, A>, fn: (key: K, a: A) => B): Record<K, B> {
  let res: any = {}
  for (let key in obj) {
    res[key] = fn(key, obj[key])
  }
  return res
}
