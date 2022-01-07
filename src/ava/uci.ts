import test from 'ava'

import { uci_char, voidChar } from '../format/ucichar'
import { poss } from '../types'
import { Uci, uci_uci } from '../format/uci'

let allMoves = poss.flatMap((orig) =>
  poss.map((dest) => ({
    orig,
    dest
  })))
let allPairs = allMoves.map(_ => uci_char(_))

const conv = (uci: Uci) => uci_char(uci)

test('regular', t => {
  t.is(conv(uci_uci('a1b1')!), '$,')
  t.is(conv(uci_uci('a1a2')!), '$%')
  t.is(conv(uci_uci('h7h8')!), 'bc')
})

test('unicity', t => {
  t.is(new Set(allPairs).size, new Set(allMoves).size)
})

test('no void char', t => {
  t.is(allPairs.filter(_ => _ === voidChar).length, 0)
})

test('promotions', t => {
  t.is(conv(uci_uci('b7b8=Q')!), '2d')
  t.is(conv(uci_uci('b7c8=Q')!), '2e')
  t.is(conv(uci_uci('b7c8=N')!), '2}')
})
