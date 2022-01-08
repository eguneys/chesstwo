import * as erm from './types';
import { dis } from 'esra';
import { FRoot, 
  FNode,
  map_with_root,
  add_node,
  root,
  node as fnode } from './fnode'
import { Situation, initial_situation, fen_situation, situation_fen, situation_sanorcastles, SanOrCastles, sanOrCastles } from '../types';
import { uci_char } from './ucichar'
import { move_ucio } from './uci'

export type CurrentAndParent = [FNode<ExtraPly> | undefined, FNode<ExtraPly>]

export type ExtraPly = {
  extra: erm.SanMetaWithExtra,
  ply: erm.Ply
}

export default class StudyBuilder {

  errors: Array<[erm.Ply, erm.SanMetaWithExtra]>
  pgns: Array<erm.QPGN>;
  _tags: erm.TagMap;
  _root?: FNode<ExtraPly>;
  __branchs: Array<CurrentAndParent>;
  __currentParent?: FNode<ExtraPly>;
  __current?: FNode<ExtraPly>;

  constructor() {
    this.errors = []
    this.pgns = [];
    this._tags = new Map();
    this.__branchs = [];
  }

  addPgn() {
    let fenMap = new Map();
    if (this._root) {

      let meta_root: FRoot<ExtraPly, Situation> = root(initial_situation)
      add_node(meta_root, this._root)

      let res_root: FRoot<erm.QMove, Situation> = map_with_root(meta_root, (situation, _, maxDepth) => {
        let maxPly = _.ply + maxDepth;
        if (_.extra.san) {
          let tsmove;
          try {
            tsmove = situation_sanorcastles(situation, _.extra.san);
          } catch (e) {
            console.warn('throws at ', situation_fen(situation), _.extra.san, e.message);
            this.errors.push([_.ply, _.extra])
          }
          if (tsmove) {
            let after = tsmove.after;
            
            let qmove = {
              ply: _.ply,
              extra: _.extra,
              maxPly,
              move: tsmove
            }

            let path = uci_char(move_ucio(tsmove))

            let res = fenMap.get(situation_fen(situation));
            if (!res) {
              fenMap.set(situation_fen(situation), [qmove]);
            } else {
              res.push(qmove);
            }

            return [path, qmove, after];
          } else {
            console.warn('couldnt make ts move', situation_fen(situation), _.extra.san);
            this.errors.push([_.ply, _.extra])
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
        variations: res_root,
        branchPlies
      };

      this.pgns.push(pgn);
    }

    this._tags = new Map();
    this._root = undefined;
    this.__branchs = [];
    this.__current = undefined;
  }

  addCurrentNode(node: FNode<ExtraPly>) {
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
      move(ply: number, extra: erm.SanMetaWithExtra) {

        let node = fnode('TODO', {
          ply,
          extra 
        });

        self.addCurrentNode(node);
      },
      twomove(ply: number, extra: erm.SanMetaWithExtra, extra2: erm.SanMetaWithExtra) {
        let node = fnode('TODO', {
          ply,
          extra
        });
        let node2 = fnode('TODO', {
          ply: ply + 1,
          extra: extra2
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
