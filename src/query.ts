import { rays, board_pos, color_opposite, uci_role, RayRole, posmap, Pos, Fen, uci_piece, PieceOrPawn, Situation, fen_situation } from './types'

import { combinations } from './combinations'

type Bind = string

type Slide = {
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

  if (role) {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  } else {
    return true
  }
}

const ALL_POS = [...posmap.values()]

function slide(situation: Situation, _slide: Slide) {
  let { slide, role } = _slide

  let color = slide[0].toUpperCase() === slide[0] ? 
    situation.turn : color_opposite(situation.turn)

  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  }).flatMap(pos =>
    rays[role].get(pos)!.flatMap(ray => {

      let between_binds = slide.slice(1, slide.length - 1)
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
        )
      )

      if (cs) {

        return cs.map(combination => {
          let binds = new Map()
          binds.set(slide[0], pos)
          binds.set(slide[slide.length - 1], ray.dest)

          between_binds.map((bind, i) =>
            binds.set(bind, ray.between[combination[i]]))

          return binds
        })
      }
      return []
    })
  )
}

function pass(situation: Situation, rule: Rule) {
  if ("slide" in rule) {
    return slide(situation, rule)
  } else {
  }
}



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


  if (space === ' ') {
    let role = uci_role(rule[0])
    if (!role || role === 'p') { return undefined }

    let slide = rule
      .split(' ')

      return {
        role,
        slide
      }
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
      return pass(situation, res)
    }
    return []
  })

  console.log(res)
  return false
}
