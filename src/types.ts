export type Fen = string

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

export type ActionType = 'slide' | 'pawnpush' | 'pawncapture' | 'enpassant' | 'castle'

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

export type HasPromote = {
  promote?: PromotableRole
}

export type IsAction = HasAction & HasOrigDest & HasValidTurn & {

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

export type PosActions = {
  byorig: PosMap<Array<AllActions>>,
  bydest: PosMap<Array<AllActions>>,
  byblocks: PosMap<Array<AllActions>>
  bycapture: PosMap<Array<AllActions>>
}


export type San = {
  to: Pos,
  role: Role,
  file?: File,
  rank?: Rank,
  promotion?: Role,
  capture?: boolean,
  check?: boolean,
  mate?: boolean
}

export type ShortCastles = 'O-O'
export type LongCastles = 'O-O-O'
export type Castles = ShortCastles | LongCastles

export type CastlesMap<A> = Record<Castles, A>

export type CastlesInfo = {
  castles: Castles,
  king: File,
  rook: File,
  trip: Dir
}

export type SanOrCastles = San | Castles

export type Move = {
  action: AllActions,
  piece: PieceOrPawn,
  before: Situation,
  after: Situation
}

export function isSan(_: SanOrCastles): _ is San {
  return typeof _ === 'object'
}

export const left: Dir = [-1, 0]
export const right: Dir = [1, 0]

export const pawn_push2_ranks: ColorMap<Rank> = {
  w: 2,
  b: 7
}

export const pawn_promote_ranks: ColorMap<Rank> = {
  w: 7,
  b: 2
}

export const enpassant_ranks: ColorMap<Rank> = {
  w: 5,
  b: 4
}

export const pawn_push: ColorMap<Dir> = {
  w: [0, 1],
  b: [0, -1]
}

export const pawn_capture: ColorMap<Array<Dir>> = {
  w: [[1, 1], [-1, 1]],
  b: [[1, -1], [-1, -1]]
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
  return ((file - 1) * 8 + (rank - 1)) + 1
}
export function pos_file(pos: Pos): File {
  return Math.floor((pos-1) / 8) + 1 as File
}
export function pos_rank(pos: Pos): Rank {
  return ((pos-1) % 8) + 1 as Rank
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

export const poss: Array<Pos> = eposs.flatMap(file => eposs.map(rank =>
  pos_make(file, rank)))

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

export function pawncapture_rays(orig: Pos, color: Color): Array<Ray> {
  return pawn_capture[color].flatMap(dir => make_ray(dir, orig, 1) || [])
}

export function castle_rook_rays(orig: Pos, castles: CastlesInfo): Ray | undefined {
  return make_ray(castles.trip, orig, 
    Math.abs(pos_file(orig) - castles.rook) as Projection)
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

export function color_opposite(c: Color) {
  return c === 'w' ? 'b' : 'w'
}

export function white_if(b: boolean) {
  return b ? 'w' : 'b'
}

export const roles = ['q', 'k', 'r', 'b', 'n', 'p']
export const promotables: Array<PromotableRole> = ['q', 'r', 'b', 'n']
export function isRole(_: string): _ is Role {
  return roles.includes(_)
}

export function isPromotable(_: string): _ is PromotableRole {
  return promotables.includes(_ as PromotableRole)
}

export function uci_role(uci: string) {
  let res = uci.toLowerCase()
  if (isRole(res)) {
    return res
  }
}

export function uci_promotable(uci: string) {
  let res = uci.toLowerCase()
  if (isPromotable(res)) {
    return res
  }
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

export function board_clone(board: Board) {
  let res = board_make()

  for (let [pos, piece] of board.pieces) {
    board_drop(res, pos, piece)
  }
  return res
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

export function board_kings(board: Board) {

  let res: ColorMap<Pos | undefined> = {w: undefined, b: undefined}

  for (let [pos, piece] of board.pieces) {
    if (piece.role === 'k') {
      res[piece.color] = pos
    }
  }
  return res 
}

export function situation_some(situation: Situation) {
  let { board, turn } = situation

  let slide_actions = posactions()

  let kings = board_kings(board)

  mapmap(board.pieces, (pos, piece) => {

    if (piece.role === 'r') {

      castlesInfos.map(castlesInfo => {
        let ray = castle_rook_rays(pos, castlesInfo)
        if (!ray) { return }
        let blocks = ray.between.flatMap(_ =>
          (board_pos(board, _) && _) || [])
        let capturePiece = board_pos(board, ray.dest)
        let kingPos = kings[piece.color]

        let valid_turn = piece.color === turn
        let valid_ok = blocks.length === 0 && !capturePiece
        let valid_king = false
 
        if (kingPos) {
          let kingTo = pos_make(castlesInfo.king, pos_rank(kingPos))
          let rookTo = ray.dest
          posactions_add(slide_actions, {
            action: 'castle',
            castles: castlesInfo.castles,
            orig: kingPos,
            dest: kingTo,
            blocks,
            valid_turn,
            valid_ok,
            valid_king,
            orig_rook: pos,
            dest_rook: rookTo
          })
        }
      })
    }



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


      if (enpassant_ranks[piece.color] === pos_rank(pos)) {

        [left, right].map(dir => {
          let orig = pos
          let capture = pos_dir(orig, dir)!
          let capturePawn = board_pos(board, capture)
          let dest = pos_dir(capture, pawn_push[piece.color])!

          let valid_turn = piece.color === turn
          let valid_ok = !!capturePawn && (capturePawn.color !== piece.color)
          let valid_king = false

          posactions_add(slide_actions, {
            action: 'enpassant', 
            orig,
            dest,
            capture,
            valid_turn,
            valid_king,
            valid_ok
          })

        })
      }



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


        if (pos_rank(orig) === pawn_promote_ranks[piece.color]) {
          promotables.map(promote => {
            posactions_add(slide_actions, {
              action: 'pawnpush', 
              orig,
              dest,
              blocks,
              promote,
              valid_turn,
              valid_king,
              valid_ok
            })
          })
        } else {
          posactions_add(slide_actions, {
            action: 'pawnpush', 
            orig,
            dest,
            blocks,
            valid_turn,
            valid_king,
            valid_ok
          })
        }
      })

      pawncapture_rays(pos, piece.color).map(ray => {
        let { orig, dest } = ray
        let capturePiece = board_pos(board, ray.dest)
        let capture = capturePiece && ray.dest

        let valid_turn = piece.color === turn
        let valid_ok = !!capturePiece
        let valid_king = false


        if (pos_rank(orig) === pawn_promote_ranks[piece.color]) {
          promotables.map(promote => {
            posactions_add(slide_actions, {
              action: 'pawncapture', 
              orig,
              dest,
              capture,
              promote,
              valid_turn,
              valid_king,
              valid_ok
            })
          })
        } else {

          posactions_add(slide_actions, {
            action: 'pawncapture', 
            orig,
            dest,
            capture,
            valid_turn,
            valid_king,
            valid_ok
          })
        }
      })
    }
  })
  return slide_actions
}


export function situation_valids(situation: Situation) {
  return posactions_filter(situation_some(situation))
}

export const situation_moves = situation_valids

export function situation_sanorcastles(situation: Situation, sanorcastles: SanOrCastles): Move | undefined {
  if (isSan(sanorcastles)) {
    let valids = situation_valids(situation)
    let action = valids.bydest.get(sanorcastles.to)?.filter(slide => 
      board_pos(situation.board, slide.orig)!.role == sanorcastles.role &&
      (!sanorcastles.file || pos_file(slide.orig) === sanorcastles.file) &&
      (!sanorcastles.rank || pos_rank(slide.orig) === sanorcastles.rank) &&
      (!sanorcastles.promotion || ("promote" in slide && slide.promote === sanorcastles.promotion))
    )?.[0]

    if (action) {

      let before = situation
      let piece = board_pos(situation.board, action.orig)!
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
  } else {
    let valids = situation_valids(situation)

    for (let [pos, actions] of valids.byorig) {
      let action = actions.find(_ => 
        _.action === 'castle' &&
        _.castles === sanorcastles
      )
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

  let p = board_pos(after, action.orig)
  if (p) {
    board_pickup(after, action.orig)

    if ("promote" in action && action.promote) {
      board_drop(after, action.dest, piece_make(action.promote, p.color))
    } else {
      board_drop(after, action.dest, p)
    }
    return situation_make(after, color_opposite(turn))
  }
}

export function situation_make(board: Board, turn: Color) {
  return {
    board,
    turn
  }
}

export function valid_action_filter(a: IsAction) {
  return a.valid_turn && a.valid_ok
}

export function posactions_filter(posaction: PosActions, filter: (_: IsAction) => boolean = valid_action_filter) {
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

export function posactions_add(posaction: PosActions, has_action: AllActions) {
    maparray_push(posaction.byorig, has_action.orig, has_action)
    maparray_push(posaction.bydest, has_action.dest, has_action)

  if ("blocks" in has_action) {
    has_action.blocks.forEach(block =>
      maparray_push(posaction.byblocks, block, has_action))
  }
  if ("capture" in has_action) {
    maparray_push(posaction.bycapture, has_action.capture, has_action)
  }
}

export function maparray_push<K, V>(_map: Map<K, Array<V>>, key: K, value: V) {
  let _arr = _map.get(key) || []
  _arr.push(value)
  _map.set(key, _arr)
}


export function posactions(): PosActions {
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

export function uci_file(uci: string) {
  let file = files.indexOf(uci[0]) + 1
  if (isEpos(file)) {
    return file
  }
}

export function uci_rank(uci: string) {
  let rank = ranks.indexOf(uci[1]) + 1
  if (isEpos(rank)) {
    return rank
  }
}

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

export function move_uci(move: Move): string {
  return pos_uci(move.action.orig) + pos_uci(move.action.dest) + ("promote" in move.action && move.action.promote ? '=' + move.action.promote.toUpperCase() : '')
}

export function move_san(move: Move): string {
  let { action, piece } = move

  if ("castles" in action) {
    return action.castles
  }

  let ambigiousFile = false,
    ambigiousRank = false,
    pawnCapture = action.action === 'pawncapture',
    pawnCaptureOrAmbigiousFile = pawnCapture || ambigiousFile;

  let pieceS = piece_san(piece),
    fileS = pawnCaptureOrAmbigiousFile?file_uci(pos_file(action.orig)):'',
    rankS = ambigiousRank?rank_uci(pos_rank(action.orig)):'',
    captureS = (pawnCapture || "capture" in action)?'x':'',
    toS = pos_uci(action.dest),
    promotionS = "promote" in action && action.promote ?`=${action.promote.toUpperCase()}`:'',
    checkS = '',
    mateS = '';

  return [pieceS, fileS, rankS, captureS, toS, promotionS, checkS, mateS].join('');
}

export function piece_make(role: Role, color: Color) {
  return { role, color }
}

export function piece_uci(p: PieceOrPawn): string {
  return p.color === 'w' ? p.role.toUpperCase() : p.role
}

export function piece_san(p: PieceOrPawn): string {
  if (isPiece(p)) { return piece_uci(p) }
  return ''
}

export function board_fen(board: Board): string {

  let res = ''
  let file: File = 1,
    rank: Rank = 8

  let spaces = 0
  while (rank >= 1) {
    let pos = pos_make(file as File, rank as Rank)

    let p = board.pieces.get(pos)

    if (!p) {
      spaces++
    } else {
      if (spaces > 0) {
        res += spaces
        spaces = 0
      }
      res += piece_uci(p)
    }
    file++
    if (file == 9) {
      file = 1
      rank--
      if (spaces > 0) {
        res += spaces
        spaces = 0
      }
      if (rank < 1) {
        break
      }
      res += '/'
    }
  }

  return res
}

export function situation_fen(situation: Situation): Fen {
  let position = board_fen(situation.board),
    turn = situation.turn

  return [position, turn, 'KQkq - 0 1'].join(' ')
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
export const initial_situation = fen_situation(initial)!;


export const shortCastleNotations = ["o-o", "O-O", "0-0"]
export const longCastleNotations = ["o-o-o", "O-O-O", "0-0-0"]

export const shortCastles: ShortCastles = "O-O"
export const longCastles: LongCastles = "O-O-O"

export const shortCastlesInfo = {
  castles: shortCastles,
  king: uci_file('g')!,
  rook: uci_file('f')!,
  trip: left 
}

export const longCastlesInfo = {
  castles: longCastles,
  king: uci_file('c')!,
  rook: uci_file('d')!,
  trip: right 
}

export const castlesInfos: Array<CastlesInfo> = [shortCastlesInfo, longCastlesInfo]

export function sanOrCastles(sanOrC: string): SanOrCastles | undefined {
  if (shortCastleNotations.includes(sanOrC)) {
    return "O-O";
  } else if (longCastleNotations.includes(sanOrC)) {
    return "O-O-O";
  }
  return san2(sanOrC) || san(sanOrC);
}

export function san2(san2: string): San | undefined {
  let res = san2.split(' ');

  if (res.length !== 8) {
    return;
  }
  let [roleS, fileS, rankS, captureS, toS, promotionS, checkS, mateS] = res;
  promotionS = promotionS.replace('=', '');
  return makeSan(san2, roleS, fileS, rankS, captureS, toS, promotionS, checkS, mateS); 
}

export function san(san: string): San | undefined {
  let RE = /(N|B|R|Q|K|)([a-h]?)([1-8]?)(x?)([a-h][0-9])(=?[NBRQ]?)(\+?)(\#?)/;

  let m = san.match(RE);

  if (m) {
    let [_, roleS, fileS, rankS, captureS, toS, promotionS, checkS, mateS] = m;

    promotionS = promotionS.replace('=', '');

    return makeSan(san, roleS, fileS, rankS, captureS, toS, promotionS, checkS, mateS);
  }  
}

export function sanorcastles_san(sanorc: SanOrCastles) {
  if (typeof sanorc === 'string') return sanorc
  else {

    let roleS = sanorc.role === 'p' ? '' : sanorc.role.toUpperCase()
    let rankS = sanorc.rank ? rank_uci(sanorc.rank):''
    let fileS = sanorc.file? file_uci(sanorc.file):''
    let captureS = sanorc.capture ? 'x':''
    let toS = pos_uci(sanorc.to)
    let promotionS = sanorc.promotion?('=' + sanorc.promotion.toUpperCase()) : ''

    return roleS + rankS + fileS + captureS + toS + promotionS
  }
}

export function makeSan(san: string,
  roleS: string,
  fileS: string,
  rankS: string,
  captureS: string,
  toS: string,
  promotionS: string,
  checkS: string,
  mateS: string): San | undefined {

    let mate = mateS !== '',
    check = checkS !== '',
    capture = captureS !== '',
    rank = rankS !== '' ? uci_rank(rankS) : undefined,
    file = fileS !== '' ? uci_file(fileS) : undefined,
    role = roleS !== '' ? uci_role(roleS) || 'p' : 'p',
    promotion = promotionS !== '' ? uci_role(promotionS): undefined,
    to = uci_pos(toS)

    if (to) {
      return {
        to,
        role,
        file,
        rank,
        promotion,
        capture,
        check,
        mate
      }
    }
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
