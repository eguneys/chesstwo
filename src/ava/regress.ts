import test from 'ava'
import { pos_uci } from '../types'
import { fen_situation, situation_valids } from '../types'

test('b3 move pawn dissapear, cant capture friend en passant ', t => {

  let _sit = fen_situation('rn1qkb1r/p4ppp/b1p1pn2/8/PppPPB2/5P2/NP4PP/2RQKBNR b Kkq - 3 9')!


  let res = situation_valids(_sit)

  //console.log(res.byorig.get(12))

})
