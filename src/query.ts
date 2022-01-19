import { rays, board_pos, color_opposite, uci_role, RayRole, posmap, Pos, Fen, uci_piece, PieceOrPawn, Situation, fen_situation } from './types'
import { mapmap, pos_uci, ray_uci, uci_pos } from './types'
import { Pawn, pawncapture_rays } from './types'
import { posactions_filter, situation_some, situation_action_move } from './types'

import { all_combinations, combinations } from './combinations'

type Bind = string

type Slide = {
  role_bind: Bind,
  bind: Bind,
  role: RayRole,
  slide: Array<Bind>
}

type Flee = {
  role_bind: Bind,
  role: RayRole,
  flee: Array<Bind>
}

type PawnCover = {
  role_bind: Bind,
  pawn_cover: Array<Bind>
}

type BindMap = Map<Bind, Pos>

type Rule = Slide | Flee | PawnCover


function match(bind: Bind, pos: Pos, situation: Situation, capture: boolean) {
  let role = uci_role(bind)
  let color = bind.toUpperCase() === bind ? situation.turn : color_opposite(situation.turn)

  let piece = board_pos(situation.board, pos)
  if (role) {
    return piece && piece.role === role && piece.color === color
  } else {
    return !piece || capture
  }
}

const ALL_POS = [...posmap.values()]

function flee(situation: Situation, _flee: Flee) {

  let { flee, role, role_bind } = _flee

  let color = role_bind.toUpperCase() === role_bind ? situation.turn : color_opposite(situation.turn)

  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  }).flatMap(pos => {
    let _rays = rays[role].get(pos)!;

    let res = []

    return all_combinations(_rays.map((_, i) => i), flee.length)
      .filter(combination =>
      _rays.every((ray, i) => {
        let fi = combination.indexOf(i)
        if (fi !== -1) {
          let ok = match(flee[fi], ray.dest, situation, true)
          return ok
        } else {
         return !!board_pos(situation.board, ray.dest) 
        }
      })
    ).map((combination) => {
      let binds = new Map()
      binds.set(role_bind, pos)

      combination.forEach((ri, fi) => {
        binds.set(flee[fi], _rays[ri].dest)
      })

      return binds
    })
  })

}

function slide(situation: Situation, _slide: Slide) {
  let { slide, role, bind, role_bind } = _slide

  let color = role_bind.toUpperCase() === role_bind ? situation.turn : color_opposite(situation.turn)

  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  }).flatMap(pos => {
    let _rays = rays[role].get(pos)!;

    if (role_bind !== bind) {
      _rays = _rays.flatMap(ray => rays[role].get(ray.dest)!)
    }
    return _rays.flatMap(ray => {

      let between_binds = slide.slice(0, slide.length - 1)
      let dest_bind = slide[slide.length - 1]
      
      let ok = match(dest_bind, ray.dest, situation, true)

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
          match(bind, ray.between[combination[i]], situation, false)
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

function pawn_cover(situation: Situation, _pawn_cover: PawnCover) {

  let { role_bind, pawn_cover } = _pawn_cover

  let color = role_bind.toUpperCase() === role_bind ? situation.turn : color_opposite(situation.turn)


  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)

    return piece && piece.role === 'p' && piece.color === color
  }).flatMap(pos => 
     pawncapture_rays(pos, color).map(ray => {

      let binds = new Map()
      binds.set(pawn_cover[0], ray.dest)
      return binds
    })
  )
 
}

function passOld(situation: Situation, rule: Rule) {
  if ("slide" in rule) {
    return slide(situation, rule)
  } else if ("pawn_cover" in rule) {
    return pawn_cover(situation, rule)
  } else {
    return flee(situation, rule)
  }
}

function slide_new(situation: Situation, _slide: Slide) {
  let { slide, role, bind, role_bind } = _slide

  let between_binds = slide.slice(0, slide.length - 1)
  let dest_bind = slide[slide.length - 1]

  let color = role_bind.toUpperCase() === role_bind ? situation.turn : color_opposite(situation.turn)

  let slides = posactions_filter(situation_some(situation), _ => _.action === 'slide') 


  let jump_next = role_bind !== bind

  return ALL_POS.filter(pos => {
    let piece = board_pos(situation.board, pos)
    return piece && piece.role === role && piece.color === color
  }).flatMap(pos => {

    
    let actions = slides.byorig.get(pos)

    if (!actions) {
      return []
    }

    if (jump_next) {
      actions = actions.flatMap(action =>
        posactions_filter(
          situation_some(situation_action_move(situation, action)!.after),
          _ => _.action === 'slide').byorig.get(action.dest) || []
      )
    }


    return actions.flatMap(action => {
      if (action.action !== "slide") {
        return []
      }

      if (action.blocks.length !== between_binds.length) {
        return []
      }

      let ok = match(dest_bind, action.dest, situation, false)

      if (!ok) {
        return []
      }


      ok = action.blocks.every((pos, i) =>
        match(between_binds[i], pos, situation, false))

      let binds = new Map()
      binds.set(role_bind, action.orig)
      binds.set(bind, action.orig)
      binds.set(dest_bind, action.dest)

      action.blocks.forEach((pos, i) =>
        binds.set(between_binds[i], pos)
      )

      return binds
    })

  })
}

function pass(situation: Situation, rule: Rule) {
  if ("slide" in rule) {
    return slide_new(situation, rule)
  } else if ("pawn_cover" in rule) {
    return pawn_cover(situation, rule)
  } else {
    return flee(situation, rule)
  }
}


'Ra c k d  k~cd'
'R r a k c  k~ac'
function str_rule(rule: string): Rule | undefined {

  let space = rule[1]

  if (space === '~') {
    let role_bind = rule[0]

    let role = uci_role(rule[0])
    if (!role || role === 'p') { return undefined }

    let flee = rule
      .slice(2)
      .split('')
      .map(_ => _)

    return {
      role_bind,
      role,
      flee
    }
  }


  let role = uci_role(rule[0])
  if (role === 'p') {
    let pawn_cover = rule.slice(1).split('')
    let role_bind = rule[0]
    return {
      role_bind,
      pawn_cover
    }
  }





  let slide = rule
    .split(' ')

  let first = slide[0]
  if (!role) { return undefined }

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

  let res = rules.map(rule => {
    let res = str_rule(rule)
    if (res) {
      return pass(situation, res) || []
    }
    return []
  })

  let matcheds = res[0].flatMap(_res0 => 
    res[1].flatMap(_res1 => 
      mapmatch(_res0, _res1) ? (!res[2] && [[_res0, _res1]]) || 
      res[2].flatMap(_res2 =>
        mapmatch(_res0, _res2) && mapmatch(_res1, _res2) ? [[_res0, _res1]] : []): []
    )
  )

  if (matcheds.length > 0) {

    let move_rule = lines[1]

    let orig = move_rule[0]
    let dest = move_rule[1]

    return pos_uci(matcheds[0][0].get(orig)!) + pos_uci(matcheds[0][0].get(dest)!)
  }

  /*
  let _res = res[0]
  if (_res.length > 0) {
    console.log(fen, _res.map(_ => mapmap(_, (bind, pos) => pos_uci(pos)))[0], res.length)
  }
*/
  return false
}


function mapmatch(a: BindMap, b: BindMap) {
  for (let [key, value] of a) {
    let bvalue = b.get(key)

    if (bvalue && value !== bvalue) {
      return false
    }
  }
  return true
}
