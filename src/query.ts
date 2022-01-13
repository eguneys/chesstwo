import { rays, board_pos, color_opposite, uci_role, RayRole, posmap, Pos, Fen, uci_piece, PieceOrPawn, Situation, fen_situation } from './types'
import { mapmap, pos_uci, ray_uci, uci_pos } from './types'

import { combinations } from './combinations'

type Bind = string

type Slide = {
  role_bind: Bind,
  bind: Bind,
  role: RayRole,
  slide: Array<Bind>
}

type Flee = {
  actor: Bind,
  flee: Array<Bind>
}

type BindMap = Map<Bind, Pos>

type Rule = Slide | Flee


function match(bind: Bind, pos: Pos, situation: Situation) {
  let role = uci_role(bind)
  let color = bind.toUpperCase() === bind ? situation.turn : color_opposite(situation.turn)

  let piece = board_pos(situation.board, pos)
  if (role) {
    return piece && piece.role === role && piece.color === color
  } else {
    return !piece
  }
}

const ALL_POS = [...posmap.values()]

function slide(situation: Situation, _slide: Slide) {
  let { slide, role, bind, role_bind } = _slide

  let color = role_bind.toUpperCase() === role_bind ? situation.turn : color_opposite(situation.turn)

  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  }).flatMap(pos => {
    let _rays = rays[role].get(pos)!;

    if (role !== bind) {
      _rays = _rays.flatMap(ray => rays[role].get(ray.dest)!)
    }
    return _rays.flatMap(ray => {

      let between_binds = slide.slice(0, slide.length - 1)
      let dest_bind = slide[slide.length - 1]
      
      let ok = match(dest_bind, ray.dest, situation)

      if (!ok) {
        return []
      } 

      let keys = ray.between.map((_, i) => i)
      let places = between_binds.map((_, i) => i)

      if (places.length > keys.length) {
        return []
      }

      let cs = combinations(keys, places.length).filter(combination =>
        between_binds.every((bind, i) =>
          match(bind, ray.between[combination[i]], situation)
        ) &&
        ray.between.every((between, i) =>
          combination.includes(i) ||
          !board_pos(situation.board, between))
      )

      return cs.map(combination => {
        let binds = new Map()
        binds.set(role_bind, pos)
        binds.set(bind, ray.orig)
        binds.set(slide[slide.length - 1], ray.dest)

        between_binds.map((bind, i) =>
          binds.set(bind, ray.between[combination[i]]))

        return binds
      })
    })
  })
}

function pass(situation: Situation, rule: Rule) {
  if ("slide" in rule) {
    return slide(situation, rule)
  } else {
  }
}



'Ra c k d  k~cd'
'R r a k c  k~ac'
function str_rule(rule: string): Rule | undefined {

  let space = rule[1]

  if (space === '~') {
    let actor = rule[0]

    let flee = rule
      .slice(2)
      .split('')
      .map(_ => _)

    return {
      actor,
      flee
    }
  }


  let slide = rule
    .split(' ')

  let first = slide[0]
  let role = uci_role(first[0])
  if (!role || role === 'p') { return undefined }

  let bind = first[1] || first[0] 
  let role_bind = first[0]

  return {
    role_bind,
    role,
    bind,
    slide: slide.slice(1)
  }
}

export function qh(fen: Fen, query: string) {

  const situation = fen_situation(fen)
  if (!situation) { return false }

  let lines = query.split('\n')

  let rules = lines[0].split('  ')

  let res = rules.flatMap(rule => {
    let res = str_rule(rule)
    if (res) {
      return pass(situation, res) || []
    }
    return []
  })

  if (res.length > 0) {
    console.log(fen, res.map(_ => mapmap(_, (bind, pos) => pos_uci(pos)))[0], res.length)
  }
  return false
}
