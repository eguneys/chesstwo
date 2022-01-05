import test from 'ava';

import Esrar from '../format'
import { slav, enpassant, promotion, simple, result10, more, advanced } from './_fixture'
import { move_san } from '../types'

test('slav', t => {
  let res = Esrar(slav)

  t.is(res.errors.length, 0)
  t.log('errors', res.errors)
})

test('enpassant', t => {
  let res = Esrar(enpassant)

  t.is(res.errors.length, 0)
  t.log('errors', res.errors)
})


test('promotion', t => {
  let res = Esrar(promotion)
  let qpgn = res.pgns[0].fens

  let fxg8 = qpgn.get('rnbq1bnr/pppkpPpp/8/8/8/3p4/PPPP1PPP/RNBQKBNR w KQkq - 0 1');

  t.truthy(fxg8)

  let move = fxg8![0].tsmove
  t.is(move && move_san(move), 'fxg8=Q') 


  let c1N = qpgn.get('rnbq1b1r/ppp1p1pp/4Q3/k7/8/1P6/PBpP1PPP/RN1QKBNR b KQkq - 0 1')

  t.truthy(c1N)

  move = c1N![0].tsmove
  t.is(move && move_san(move), 'c1=N') 




  t.is(res.errors.length, 0)
  t.log('errors', res.errors)
})

test('simple', t => {
  let res = Esrar(simple)
  t.is(res.pgns.length, 1)
  t.is(res.pgns[0].fens.size, 4)
  t.is(res.errors.length, 0)
  t.log('errors', res.errors)
})

test('result 1-0', t => {
  let res = Esrar(result10)
  t.is(res.pgns.length, 1)
  t.is(res.errors.length, 0)
})

test('more pgns', t => {
  let res = Esrar(more)
  t.is(res.pgns.length, 5)
  t.is(res.errors.length, 0)
})

test('frenchadvanced', t => {
  let res = Esrar(advanced)
  let qpgn = res.pgns[0].fens

  // TODO -- fix castles 
  // 2r1k2r/pp1bbppp/1qn1p2n/3pP3/3p1P2/P1P2N2/1PB3PP/RNBQ1RK1 w KQkq - 0 1
  let b2d4 = qpgn.get('2r1k2r/pp1bbppp/1qn1p2n/3pP3/3p1P2/P1P2N2/1PB3PP/RNBQ1RK1 w KQkq - 0 1');

  t.truthy(b2d4)


  let move = b2d4![0].tsmove
  t.is(move && move_san(move), 'cxd4')
  t.is(res.errors.length, 0)
})
