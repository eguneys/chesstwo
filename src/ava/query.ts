import test from 'ava'

import { li_100 } from './_fixture2'

import { qh } from '../query'
import { board_pos, uci_pos } from '../types'
import { fen_situation, situation_fen } from '../types'
import { uci_uci, situation_uci_move } from '../format/uci'

test('backrank', t => {

  let queries = [
    `
Ra c k d  k~cd
Ra
`, 
    `
Ra c k  k~c
Ra
    `,
`
Qa r  Qa k
Qa
    `,
    `
Na k  Na r
Na
    `,
    `
Na k  Na b
Na
    `,
    `
Qa k  B a  k a
Qa
    `,
    `
N q  N a
Nq
    `,
    `
Qa c k d  k~cde  Pe
Qa
    `
  ]

let queries2 = []

  queries2 = [`
Qa k  B a
Qa
` ]


  let ok = 0 , not = 0
  let res = li_100
    .trim()
    .split('\n')
    .slice(0, 100)
    .flatMap(line => {
      let [_, fen, _moves] = line.split(',')

      let moves = _moves.split(' ')

      let situation = fen_situation(fen)!
      let move = situation_uci_move(situation, uci_uci(moves[0])!)!

      fen = situation_fen(move.after)

      let match = queries.filter(query => qh(fen, query.trim()))


      if (match.length > 0) {
        ok++
        console.log('ok ', fen, match[0], qh(fen, match[0].trim()))
      } else {
        not++
        console.warn('not ', fen)
      }
      return []
    })

  console.log('ok ' + ok, ' not ' + not)

})
