import { rays, board_pos, color_opposite, uci_role, RayRole, posmap, Pos, Fen, uci_piece, PieceOrPawn, Situation, fen_situation } from './types'

type Bind = string

type Slide = {
  role: RayRole,
  slide: Array<Bind>
}

type Flee = {
  actor: Bind,
  flee: Array<Bind>
}

type BindMap = Map<Bind, Array<Pos>>

type Rule = Slide | Flee



'R r a k c  k~ac'

const ALL_POS = [...posmap.values()]

function slide(binds: BindMap, situation: Situation, _slide: Slide) {
  let { slide, role } = _slide

  slide.map(bind => {
    if (!binds.has(bind)) {
      let poss = ALL_POS.filter(pos => {
        let role = uci_role(bind)
        if (!role) {
          return true
        }
        let color = (bind.toUpperCase() === bind) ? situation.turn : color_opposite(situation.turn)

        let piece = board_pos(situation.board, pos)

        if (piece) {
          return piece.color === color && piece.role === role
        }
      })
      binds.set(bind, poss)
    }
  })

  

  binds.get(slide[0])!.map(orig =>
    rays[role].get(orig)!
    .filter(ray =>
      binds.get(slide[slide.length - 1])!.map(dest =>
        dest
      )
    )
    .map(ray => {


    })
  )

}

function pass(binds: BindMap, situation: Situation, rule: Rule) {
  if ("slide" in rule) {
    slide(binds, situation, rule)
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

  let binds = new Map()

  let lines = query.split('\n')

  let rules = lines[0].split('  ')

  rules.map(rule => {
    let res = str_rule(rule)
    if (res) {
      pass(binds, situation, res)
    }
  })

  console.log(binds)
  return false
}
