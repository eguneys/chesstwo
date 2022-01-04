import test from 'ava';

import Esrar from '../format'
import { simple, result10, more, advanced } from './_fixture'
import { move_san } from '../types'

test.only('simple', t => {
  let res = Esrar(simple)
  t.is(res.pgns.length, 1)
  t.is(res.pgns[0].fens.size, 5)
  t.log(res.errors)
})

test('result 1-0', t => {
  t.is(Esrar(result10).pgns.length, 1)
})

test('more pgns', t => {
  t.is(Esrar(more).pgns.length, 5)
})

test.skip('frenchadvanced', t => {
  let qpgn = Esrar(advanced).pgns[0].fens

  let b2d4 = qpgn.get('2r1k2r/pp1bbppp/1qn1p2n/3pP3/3p1P2/P1P2N2/1PB3PP/RNBQ1RK1 w - - 0 1');

  t.truthy(b2d4)

  let move = b2d4![0].tsmove
  t.is(move && move_san(move), 'cxd4')
})
