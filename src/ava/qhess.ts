import test from 'ava'

import { li_100 } from './_fixture2'

import { qh } from '../query'

test('backrank', t => {


  let query = `
R r a k c  k~ac
Rxr
`

  let res = li_100.trim().split('\n').filter(line => {
    let [_, fen, moves] = line.split(',')

    return qh(fen, query.trim())
  })

  console.log(res)

})
