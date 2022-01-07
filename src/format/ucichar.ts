import { Uci } from './uci'
import { promotables, eposs, pos_file, pos_rank, posmap, mapmap, File, Pos, PosMap, PromotableRole } from '../types'

export type UciChar = string

export type FilePairPromotable = string

export function uci_char(uci: Uci) {
  let { orig, dest } = uci
  if (uci.promote) {
    return pos_to2char(orig) + pos_to2char_p(pos_file(dest), uci.promote)
  } else {
    return pos_to2char(orig) + pos_to2char(dest)
  }
}


const charShift = 35
export const voidChar = String.fromCharCode(33) // '!'. skip 34 \"

const pos_hash = (pos: Pos) => pos

const pos2charMap: PosMap<string> = mapmap(posmap, (pos, _) => {
  return String.fromCharCode(pos_hash(pos) + charShift)
})

const pos_to2char = (pos: Pos) => pos2charMap.get(pos) || voidChar

const promotion2charMap: Map<FilePairPromotable, string> = new Map()
promotables.map((role, i) => {
  eposs.map(file => {
    let key = role + file
    let res = String.fromCharCode(charShift + pos2charMap.size + i * 8 + file - 1)
    promotion2charMap.set(key, res)
  })
})

const pos_to2char_p = (file: File, role: PromotableRole) => promotion2charMap.get(role + file) || voidChar

