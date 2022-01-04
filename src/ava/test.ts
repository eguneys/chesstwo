import test from 'ava';

import { 
  slide_uci,
  situation_moves,
  uci_pos, rays, initial_situation,
  situation_fen,
  initial } from '../types'

test('fen', t => {

  t.is(situation_fen(initial_situation), initial)
})

test.skip('rays', t => {
  t.log(rays['q'].get(uci_pos('a8')!))
})

test.skip('situation', t => {
  t.log(situation_moves(initial_situation).byorig)
})
