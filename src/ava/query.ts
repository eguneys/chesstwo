import test from 'ava'

import { li_100 } from './_fixture2'

import { qh } from '../query'
import { board_pos, uci_pos } from '../types'
import { fen_situation, situation_fen } from '../types'
import { uci_uci, situation_uci_move } from '../format/uci'

test('backrank', t => {

  let query = `
Ra c k d  k~cd
`

  let query2 = `
R r a k c  k~ac
Rxr
`

  let res = li_100
    .trim()
    .split('\n')
    .slice(0, 8)
    .flatMap(line => {
      let [_, fen, _moves] = line.split(',')

      let moves = _moves.split(' ')

      let situation = fen_situation(fen)!
      let move = situation_uci_move(situation, uci_uci(moves[0])!)!

      fen = situation_fen(move.after)

      if (qh(fen, query.trim())) {
        return [fen]
      }
      return []
    })

})
