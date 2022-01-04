import * as erm from './types';
import { pClimbWithRoot, pAdd, pnode, PNode } from './pnode';
import { dis, em } from 'esra';
import { initial, fen_situation, situation_fen, situation_sanorcastles, SanOrCastles, sanOrCastles } from '../types';

export type CurrentAndParent = [PNode<erm.QMove> | undefined, PNode<erm.QMove>]

export default class StudyBuilder {

  errors: Array<[erm.Ply, erm.SanMetaWithExtra]>
  pgns: Array<erm.QPGN>;
  _tags: erm.TagMap;
  _root?: PNode<erm.QMove>;
  __branchs: Array<CurrentAndParent>;
  __currentParent?: PNode<erm.QMove>;
  __current?: PNode<erm.QMove>;

  constructor() {
    this.errors = []
    this.pgns = [];
    this._tags = new Map();
    this.__branchs = [];
  }

  addPgn() {
    let fenMap = new Map();
    if (this._root) {

      pClimbWithRoot(fen_situation(initial), this._root, (situation, _, maxDepth) => {
        _.maxPly = _.ply + maxDepth;
        if (situation && _.move.san) {
          let tsmove;
          try {
            tsmove = situation_sanorcastles(situation, _.move.san);
          } catch (e) {
            console.warn('throws at ', situation_fen(situation), _.move.san);
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
        variations: this._root,
        branchPlies
      };

      this.pgns.push(pgn);
    }

    this._tags = new Map();
    this._root = undefined;
    this.__branchs = [];
    this.__current = undefined;
  }

  addCurrentNode(node: PNode<erm.QMove>) {
    if (this.__current) {
      pAdd(this.__current, node);
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

        let node = pnode({
          ply,
          move
        });

        self.addCurrentNode(node);
      },
      twomove(ply: number, move: erm.SanMetaWithExtra, move2: erm.SanMetaWithExtra) {
        let node = pnode({
          ply,
          move
        });
        let node2 = pnode({
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
