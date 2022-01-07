import * as erm from './types';
import { dis } from 'esra';
import { FRoot, 
  FNode,
  climb_with_root,
  add_node,
  root,
  node as fnode } from './fnode'
import { Situation, initial_situation, fen_situation, situation_fen, situation_sanorcastles, SanOrCastles, sanOrCastles } from '../types';

export type CurrentAndParent = [FNode<erm.QMove> | undefined, FNode<erm.QMove>]

export default class StudyBuilder {

  errors: Array<[erm.Ply, erm.SanMetaWithExtra]>
  pgns: Array<erm.QPGN>;
  _tags: erm.TagMap;
  _root?: FNode<erm.QMove>;
  __branchs: Array<CurrentAndParent>;
  __currentParent?: FNode<erm.QMove>;
  __current?: FNode<erm.QMove>;

  constructor() {
    this.errors = []
    this.pgns = [];
    this._tags = new Map();
    this.__branchs = [];
  }

  addPgn() {
    let fenMap = new Map();
    if (this._root) {

      let _root: FRoot<erm.QMove, Situation | undefined> = root(initial_situation)
      add_node(_root, this._root)

      climb_with_root(_root, (situation, _, maxDepth) => {
        _.maxPly = _.ply + maxDepth;
        if (situation && _.move.san) {
          let tsmove;
          try {
            tsmove = situation_sanorcastles(situation, _.move.san);
          } catch (e) {
            console.warn('throws at ', situation_fen(situation), _.move.san, e.message);
          }
          if (tsmove) {
            let after = tsmove.after;
            _.tsmove = tsmove;
            let res = fenMap.get(situation_fen(situation));
            if (!res) {
              fenMap.set(situation_fen(situation), [_]);
            } else {
              res.push(_);
            }
            return after;
          } else {
            console.warn('couldnt make ts move', situation_fen(situation), _.move.san);
            this.errors.push([_.ply, _.move])
          }
        }
      });

      let branchPlies = [];

      for (let moves of fenMap.values()) {
        if (moves[1]) {
          branchPlies.push(moves[1].ply);
        }
      }
      let pgn = {
        tags: this._tags,
        fens: fenMap,
        variations: _root,
        branchPlies
      };

      this.pgns.push(pgn);
    }

    this._tags = new Map();
    this._root = undefined;
    this.__branchs = [];
    this.__current = undefined;
  }

  addCurrentNode(node: FNode<erm.QMove>) {
    if (this.__current) {
      add_node(this.__current, node);
    }

    this.__currentParent = this.__current;
    this.__current = node;

    if (!this._root) {
      this._root = this.__current;
    }

  }

  branchSubMoves() {
    if (this.__current) {
      this.__branchs.push([this.__currentParent, this.__current]);
      this.__current = this.__currentParent;
      this.__currentParent = undefined;
    }
  }

  endBranchSubMoves() {
    let _ = this.__branchs.pop()!;

    this.__currentParent = _[0];
    this.__current = _[1];
  }
  
  d(): dis.DisectMap {
    let self = this;
    
    return {
      move(ply: number, move: erm.SanMetaWithExtra) {

        let node = fnode('', {
          ply,
          move
        });

        self.addCurrentNode(node);
      },
      twomove(ply: number, move: erm.SanMetaWithExtra, move2: erm.SanMetaWithExtra) {
        let node = fnode('', {
          ply,
          move
        });
        let node2 = fnode('', {
          ply: ply + 1,
          move: move2
        });

        self.addCurrentNode(node);
        self.addCurrentNode(node2);
      },
      branchSubMoves() {
        self.branchSubMoves();
      },
      endBranchSubMoves() {
        self.endBranchSubMoves();
      },
      pgn(pgn: any) {
        self.addPgn();
      },
      tag(name: string, value: string) {
        self._tags.set(name, value);
      },
      san(_san: string) {
        return sanOrCastles(_san);
      },
      sanWithExtra(san: SanOrCastles | undefined, extra: any) {
        return {
          san,
          extra
        };
      }
    };
  }
}
