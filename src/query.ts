import { Fen, uci_piece, PieceOrPawn, Situation, fen_situation } from './types'

type Bind = string


type Slide = {
}

type Rule = any

function slide(slide: Slide, situation: Situation) {
  return true
}

function pass(rule: Rule, situation: Situation) {
  if ("slides" in rule) {
    return slide(rule, situation)
  } else {
    return true
  }
}



'R r a k c  k~ac'
function str_rule(rule: string) {
  let actor = uci_piece(rule[0])
  if (!actor) return undefined

  let space = rule[1]

  if (space === '~') {

    let flees = rule
      .slice(2)
      .split('')
      .map(_ => _)

    return {
      actor,
      flees
    }
  }


  if (space === ' ') {
    let slides = rule
      .slice(2)
      .split(' ')
      .map(_ => 
        uci_piece(_) || _
      )

      return {
        actor,
        slides
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
    if (!res) return []
    return pass(res, situation)?[1]:[]
  })

  return res.length === rules.length
}
