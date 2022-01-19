
/*
let keys = [0, 1, 2, 3, 4, 5, 6, 7, 8]
let places = [0 1 2 3 4]

[0 1 2 3 4]
[0 1 2 3 5]
[0 1 2 3 6]
[0 1 2 3 7]
[0 1 2 3 8]
[0 1 2 4 5]
...
[4, 5, 6, 7]
[4, 5, 6, 8]
[4, 6, 7, 8]
[5, 6, 7, 8]
*/
/*
[0, 1, 2] 2

[0, 1]
[0, 2]
[1, 0]
[1, 2]
[2, 0]
[2, 2]
*/

export function all_combinations<A>(keys: Array<A>, nb: number): Array<Array<A>> {
  return keys.flatMap(key => {
    if (nb === 1) {
      return [[key]]
    }
    return all_combinations(keys, nb - 1).map(_ => _.concat(key))
  })
}


export function combinations<A>(keys: Array<A>, nb: number) {
  let combo = keys.map((_, i) => i >= keys.length - nb)

  let res = []
  do {
    res.push(filter(keys, combo))

  } while (nextPermutation(combo));
  return res
}

function nextPermutation(array: Array<boolean>, first = 0, last = array.length-1) {
  if(first>=last){
    return false;
  }
  let i = last;
  for(;;){
    const i1 = i;
    if(array[--i]<array[i1]){
      let i2 = last+1;
      while(array[i]>=array[--i2]);
      [array[i], array[i2]] = [array[i2], array[i]];
      reverse(array, i1, last);
      return true;
    }
    if(i===first){
      reverse(array, first, last);
      return false;
    }
  }
}

function reverse<A>(array: Array<A>, i=0, j=array.length-1) {
  while (i < j)
    [array[i++], array[j--]] = [array[j], array[i]];
}

function filter<A>(a: Array<A>, select: Array<boolean>) {
  return a.filter((_e,i) => select[i]);
}

