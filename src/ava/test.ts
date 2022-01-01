import test from 'ava';

import { 
  slide_uci,
  situation_moves,
  uci_pos, rays, initial_situation } from '../types'

test.skip('rays', t => {
  t.log(rays['q'].get(uci_pos('a8')!))
})

test.skip('situation', t => {
  t.log(situation_moves(initial_situation).byorig)
})
