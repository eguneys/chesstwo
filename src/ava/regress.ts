import test from 'ava'
import { pos_uci } from '../types'
import { fen_situation, situation_valids } from '../types'

import{ moba , moba_full} from './_regressfixture'
import Esrar from '../format'

test.only('moba study', t => {
  let res = Esrar(moba)

  t.is(res.errors.length, 0)
  t.log('errors', res.errors)

})


test('dxc6 bishop dissapear', t => {


  let _sit = fen_situation('rnbq1rk1/pp3ppp/2pp1n2/2bPp3/2P1P3/2N4P/PP3PP1/R1BQKBNR w KQ - 0 7')!

    let res = situation_valids(_sit)

  console.log(res.byorig)
})


test('b3 move pawn dissapear, cant capture friend en passant ', t => {

  let _sit = fen_situation('rn1qkb1r/p4ppp/b1p1pn2/8/PppPPB2/5P2/NP4PP/2RQKBNR b Kkq - 3 9')!


  let res = situation_valids(_sit)

  //console.log(res.byorig.get(12))

})
