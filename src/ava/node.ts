import test from 'ava'

import { flat_root, flat, root, node, add_node, add_nodes, pretty, FRoot } from '../format/fnode'

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


  let _root2 = flat_root(flat(_root))

  t.is(pretty(_root), pretty(_root2))



})
