import { Pos, PromotableRole } from '../types'


export type Uci = {
  orig: Pos,
  dest: Pos,
  promote?: PromotableRole
}
