import test from 'ava';

import { 
  pos_file,
  pos_rank,
  pos_make,
  pos_uci,
  board_pos,
  slide_uci,
  situation_moves,
  uci_pos, rays, initial_situation,
  situation_fen,
  initial } from '../types'

test('pos', t => {
  t.is(pos_file(pos_make(1, 8)), 1)
  t.is(pos_rank(pos_make(8, 1)), 1)
  t.is(pos_uci(pos_make(3, 7)), 'c7')
})

test('fen', t => {

  //console.log(board_pos(initial_situation.board, uci_pos('a1')!))
  t.is(situation_fen(initial_situation), initial)
})

test.skip('rays', t => {
  t.log(rays['q'].get(uci_pos('a8')!))
})

test.skip('situation', t => {
  t.log(situation_moves(initial_situation).byorig)
})
