import test from 'ava'

import { max_depth_root, map_with_root, str_root, str, root, node, add_node, add_nodes, pretty, FRoot } from '../format/fnode'
import Esrar from '../format'
import { branch } from './_fixture'
import { flat, flat_root } from '../format/fnode'

test('map', t => {

  let _root: FRoot<string, number> = root(0),
    a1 = node('a1', 'hello'),
    b1 = node('b1', 'world'),
    c1 = node('c1', 'good'),
    b2 = node('b2', 'world'),
    c2 = node('c2', 'good'),
    b3 = node('b3', 'see'),
    c3 = node('c3', 'hear')


  add_node(_root, a1)
  add_nodes(a1, [b1, b2, b3])
  add_node(b1, c1)
  add_node(b2, c2)
  add_node(b3, c3)


  let new_root = map_with_root(_root, (nb, child, _) => {
    return [child.slice(0, 2), 
      nb + child.length, nb + child.length] 
  })

  t.is(max_depth_root(new_root), 3)

})


test('flat pgn', t => {
  let res = Esrar(branch)

  t.is(max_depth_root(res.pgns[0].variations), 4)

  t.log(pretty(res.pgns[0].variations))

})


test('flat', t => {

  let _root: FRoot<string, string> = root('root'),
    a1 = node('a1', 'hello'),
    b1 = node('b1', 'world'),
    c1 = node('c1', 'good'),
    b2 = node('b2', 'world'),
    c2 = node('c2', 'good'),
    b3 = node('b3', 'see'),
    c3 = node('c3', 'hear')


  add_node(_root, a1)
  add_nodes(a1, [b1, b2, b3])
  add_node(b1, c1)
  add_node(b2, c2)
  add_node(b3, c3)


  let _root2 = str_root(str(_root))

  t.is(pretty(_root), pretty(_root2))

  let _root3 = flat_root(flat(_root))
  t.is(pretty(_root), pretty(_root3))


})
