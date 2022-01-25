import test from 'ava'

import { situation_initial, play_moves } from '../board'

test('play perf', t => {

  let nb = 100
  let iterations = 10

  nb = 1
  iterations = 1

  const runOne = () => {
    play_moves(situation_initial(), [
      'e2e4',
      'd7d5',
      'e4d5',
      'd8d5',
      'b1c3',
      'd5a5',
      'd2d4',
      'c7c6',
      'g1f3',
      'c8g4',
      'c1f4',
      'e7e6',
      'h2h3',
      'g4f3',
      'd1f3',
      'f8b4',
      'f1e2',
      'b8d7',
      'a2a3',
      'e8c8',
      'a3b4',
      'a5a1',
      'e1d2',
      'a1h1',
      'f3c6',
      'b7c6',
      'e2a6'
    ])
  }

  const run = () => {
    for (let i = 1; i < nb; i++) runOne()
  }


  runOne()
  if (nb * iterations > 1) {
    console.log('warm up')
    run()
  }

  console.log('running tests')
  let durations = []

  for (let i = 0; i < iterations; i++) {
    let start = Date.now()
    run()
    let duration = Date.now() - start
    console.log(`${nb} games in ${duration} ms`)
    durations.push(duration)
  }

  let nbGames = iterations * nb
  let moveMicros = (1000 * durations.reduce((a, b) => a + b)) / nbGames
  console.log(`Average = ${moveMicros} microseconds per game`)
  console.log(`          ${1000000 / moveMicros} games per second`)

  t.truthy(true)
})
