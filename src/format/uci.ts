import { uci_pos, uci_promotable, Pos, PromotableRole } from '../types'


export type Uci = {
  orig: Pos,
  dest: Pos,
  promote?: PromotableRole
}

export function uci_uci(uci: string) {
  if (uci.length === 4) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))

    if (orig && dest) {
      return {
        orig,
        dest
      }
    }
  } else if (uci.length === 6) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))
    let promote = uci_promotable(uci[5])

    if (orig && dest && promote) {
      return {
        orig,
        dest,
        promote
      }
    }

  }
}
