export type TwoCharId = string

// "TwoCharIdTwoCharId"
export type Path = string

export type FHasChildren<A> = {
  children: Array<FNode<A>>
}

export type FHasData<A> = {
  data: A
}

export type FRoot<A, B> = FHasData<B> & FHasChildren<A> & {
}

export type FNode<A> = FHasData<A> & FHasChildren<A> & {
  id: TwoCharId,
}


export function path_head(path: Path) {
  return path.slice(0, 2)
}

export function path_tail(path: Path) {
  return path.slice(2)
}

export function path_last(path: Path) {
  return path.slice(-2)
}

export function path_init(path: Path) {
  return path.slice(0, -2)
}

export function root<A, B>(data: B): FRoot<A, B> {
  return {
    data,
    children: []
  }
}


export function node<A>(id: TwoCharId, data: A): FNode<A> {
  return {
    id,
    data,
    children: []
  }
}

export function add_node<A>(node: FHasChildren<A>, child: FNode<A>) {
  node.children.push(child)
}

export function add_nodes<A>(node: FHasChildren<A>, children: Array<FNode<A>>) {
  children.forEach(_ => node.children.push(_))
}

export function at_path<A, B>(node: FNode<A> | FRoot<A, B>, path: Path): FRoot<A, B> | FNode<A> | undefined {
  if (path === '') return node
  let child = node.children.find(_ => _.id === path_head(path))
  return child ? at_path<A, B>(child, path_tail(path)) : undefined
}

export function update_at<A, B>(node: FNode<A> | FRoot<A, B>, path: Path, fn: (_: FNode<A> | FRoot<A, B>) => void) {
  let _node = at_path<A, B>(node, path)
  if (_node) {
    fn(_node)
    return _node
  }
  return
}

export function add_node_at<A, B>(node: FNode<A> | FRoot<A, B>, path: Path, child: FNode<A>) {
  let newPath = path + ("id" in node ? node.id: '')
  update_at(node, path, _ => _.children.push(child))
}

export function climb_with_root<A, B>(root: FRoot<A, B>, fn: (root: B, child: A, max_depth: number) => B) {
  function helper(root_value: B, child: FNode<A>) {
    let next = fn(root_value, child.data, max_depth(child))

    child.children.forEach(_ => helper(next, _))
  }
  root.children.forEach(_ => helper(root.data, _))
}

export function map_with_root<A, B, D>(_root: FRoot<A, B>, 
  fn: (root: B, child: A, max_depth: number) => [TwoCharId, D, B] | undefined) {
  function helper(root_value: B, child: FNode<A>): FNode<D> | undefined {
    let res = fn(root_value, child.data, max_depth(child))
    if (res) {
      let [id, next, nextB] = res
      let new_child = node(id, next)

      child.children.forEach(_ => {
        let cc = helper(nextB, _)
        if (cc) {
          add_node(new_child, cc)
        }
      })
      return new_child
    }
  }

  let new_root: FRoot<D, B> = root(_root.data)
  _root.children.forEach(_ => {
    let cc = helper(_root.data, _)
    if (cc) {
      add_node(new_root, cc)
    }
  })

  return new_root
}

export function map<A, B, C, D>(_root: FRoot<A, B>, fna:(a: A) => C, fnb:(b: B) => D): FRoot<C, D> {

  function helper(child: FNode<A>) {
    let _node = node(child.id, fna(child.data))
    add_nodes(_node, child.children.map(_ => helper(_)))
    return _node
  }

  let new_root: FRoot<C, D> = root(fnb(_root.data))

  add_nodes(new_root, _root.children.map(_ => helper(_)))

  return new_root 
}

export function max_depth_root<A, B>(root: FRoot<A, B>): number {
  if (root.children[0]) {
    return max_depth(root.children[0]) + 1
  } else {
    return 1
  }
}

export function max_depth<A>(root: FNode<A>): number {
  if (root.children[0]) {
    return 1 + max_depth(root.children[0])
  } else {
    return 0
  }
}

export const fid = (_: any) => _

export const Path_root = '_r'
export const SEP_root = '└'
export const SEP_path = '┬'
export const SEP_node = '├'

export function flat<A, B>(root: FRoot<A, B>, fna: (a: A) => string = fid, fnb: (b: B) => string = fid) {
  function traverse(node: FNode<A>, parentPath: Path): string {
    let path = parentPath + node.id
    return node.children.map(_ =>
      traverse(_, path)).concat([path, fna(node.data)].join(SEP_path)).join(SEP_node)
  }

  return root.children
    .map(_ => traverse(_, Path_root))
    .join(SEP_node) + SEP_root + fnb(root.data)
}

export function flat_root<A, B>(str: string, fna: (_: string) => A = fid, fnb: (_: string) => B = fid): FRoot<A, B> {

  let [_childrenS, _rootS] = str.split(SEP_root)

  let _root: FRoot<A, B> = root(fnb(_rootS))

  _childrenS.split(SEP_node).sort((a, b) => 
    a.split(SEP_path)[0].length - b.split(SEP_path)[0].length
  ).forEach(_childS => {
    let [pathS, dataS] = _childS.split(SEP_path)
    let _node = node(path_last(pathS), fna(dataS))

    add_node_at(_root, path_tail(path_init(pathS)), _node) 
  })

  return _root
}



/*
https://github.com/substack/node-archy
'│' : '|'
'└' : '`'
'├' : '+'
'─' : '-'
'┬' : '-'


beep
├── ity
└─┬ boop
  ├─┬ o_O
  │ ├─┬ oh
  │ │ ├── hello
  │ │ └── puny
  │ └── human
  └── party
      time!
*/
export function pretty<A, B>(node: FRoot<A, B>, fna: (a: A | B) => string = fid) {

  function helper(prefix: string, node: FRoot<A, B> | FNode<A>): string {
    let label = ("id" in node ? node.id: '') + ' ' + fna(node.data)

    let nodes = node.children
    return prefix + label + '\n' +
      nodes.map((node, i) => {
        let last = i === nodes.length - 1
        let more = node.children.length > 0
        let _prefix = prefix + (last ? ' ' : '│') + ' '

        return prefix +
          (last ? '└' : '├') + '─' +
          (more ? '┬' : '─') + ' ' +
          helper(_prefix, node).slice(prefix.length + 2)
      }).join('')
  }
  return helper('', node)
}

