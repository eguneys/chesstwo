import test from 'ava';

import { 
  slide_uci,
  uci_pos, rays, board_slides, initial_situation } from '../types'

test('rays', t => {
  t.log(rays['q'].get(uci_pos('a8')!))
})

test.only('situation', t => {
  let { board } = initial_situation
  t.log(board_slides(board).get(uci_pos('a8')!)?.map(slide_uci))
})
