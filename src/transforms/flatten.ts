import { reservedIdentifiers } from "../constants";
import { ObfuscateOrder } from "../order";
import traverse, { walk } from "../traverse";
import {
  FunctionDeclaration,
  Identifier,
  ReturnStatement,
  VariableDeclaration,
  VariableDeclarator,
  CallExpression,
  MemberExpression,
  ThisExpression,
  ArrayExpression,
  ExpressionStatement,
  AssignmentExpression,
  Node,
  BlockStatement,
  ArrayPattern,
  FunctionExpression,
  ObjectExpression,
  Property,
  SpreadElement,
  Literal,
  IfStatement,
  ThrowStatement,
  NewExpression,
} from "../util/gen";
import { getIdentifierInfo } from "../util/identifiers";
import {
  getBlockBody,
  getVarContext,
  isFunction,
  prepend,
  clone,
} from "../util/insert";
import {fixRandom, shuffle} from "../util/random";
import Transform from "./transform";

/**
 * Brings every function to the global level.
 *
 * Functions take parameters, input, have a return value and return modified changes to the scoped variables.
 *
 * ```js
 * function topLevel(ref1, ref2, refN, param1, param2, paramN){
 *   return [ref1, ref2, refN, returnValue];
 * }
 * ```
 */
export default class Flatten extends Transform {
  definedNames: Map<Node, Set<string>>;

  flatMapName: string;
  flatNode: Node;
  gen: any;

  constructor(o) {
    super(o, ObfuscateOrder.Flatten);

    this.definedNames = new Map();
    this.flatMapName = null;
    this.flatNode = null;
    this.gen = this.getGenerator();
  }

  apply(tree) {
    traverse(tree, (o, p) => {
      if (
        o.type == "Identifier" &&
        !reservedIdentifiers.has(o.name) &&
        !this.options.globalVariables.has(o.name)
      ) {
        var info = getIdentifierInfo(o, p);
        if (info.spec.isReferenced) {
          if (info.spec.isDefined) {
            var c = getVarContext(o, p);
            if (c) {
              if (!this.definedNames.has(c)) {
                this.definedNames.set(c, new Set([o.name]));
              } else {
                this.definedNames.get(c).add(o.name);
              }
            }
          }
        }
      }
    });

    super.apply(tree);
  }

  match(object: Node, parents: Node[]) {
    return (
      object.type == "FunctionDeclaration" &&
      object.body.type == "BlockStatement" &&
      !object.generator &&
      !object.async &&
      !object.params.find((x) => x.type !== "Identifier")
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      //

      if (
        parents.find(
          (x) =>
            x.type == "ClassExpression" ||
            x.type == "ClassDeclaration" ||
            x.type == "MethodDefinition"
        )
      ) {
        return;
      }

      var defined = new Set<string>();
      var references = new Set<string>();
      var modified = new Set<string>();

      var illegal = new Set<string>();
      var isIllegal = false;

      var definedAbove = new Set<string>(this.options.globalVariables);

      parents.forEach((x) => {
        var set = this.definedNames.get(x);
        if (set) {
          set.forEach((name) => definedAbove.add(name));
        }
      });

      walk(object, parents, (o, p) => {
        if (object.id && o === object.id) {
          return;
        }

        if (
          o.type == "Identifier" &&
          !this.options.globalVariables.has(o.name) &&
          !reservedIdentifiers.has(o.name)
        ) {
          var info = getIdentifierInfo(o, p);
          if (!info.spec.isReferenced) {
            return;
          }

          if (o.hidden) {
            illegal.add(o.name);
          }

          if (info.spec.isDefined) {
            defined.add(o.name);
          } else if (info.spec.isModified) {
            modified.add(o.name);
          } else {
            references.add(o.name);
          }
        }

        if (o.type == "TryStatement") {
          isIllegal = true;
          return "EXIT";
        }

        if (o.type == "Identifier") {
          if (o.name == "arguments") {
            isIllegal = true;
            return "EXIT";
          }
        }

        if (o.type == "ThisExpression") {
          isIllegal = true;
          return "EXIT";
        }

        if (o.type == "Super") {
          isIllegal = true;
          return "EXIT";
        }

        if (o.type == "MetaProperty") {
          isIllegal = true;
          return "EXIT";
        }

        if (o.type == "VariableDeclaration" && o.kind !== "var") {
          isIllegal = true;
          return "EXIT";
        }
      });

      if (isIllegal) {
        return;
      }
      if (illegal.size) {
        return;
      }

      illegal.forEach((name) => {
        defined.delete(name);
      });
      defined.forEach((name) => {
        references.delete(name);
        modified.delete(name);
      });

      // console.log(object.id.name, illegal, references);

      var input = Array.from(new Set([...modified, ...references]));

      if (Array.from(input).find((x) => !definedAbove.has(x))) {
        return;
      }

      var output = Array.from(modified);

      var newName = this.gen.generate();
      var valName = this.getPlaceholder();
      var resultName = this.getPlaceholder();
      var propName = this.gen.generate();

      getBlockBody(object.body).push(ReturnStatement());
      walk(object.body, [object, ...parents], (o, p) => {
        return () => {
          if (o.type == "ReturnStatement" && getVarContext(o, p) === object) {
            var elements = output.map(Identifier);
            if (
              o.argument &&
              !(
                o.argument.type == "Identifier" &&
                o.argument.name == "undefined"
              )
            ) {
              elements.unshift(clone(o.argument));
            }

            o.argument = ArrayExpression(elements);

            o.argument = AssignmentExpression(
              "=",
              MemberExpression(
                Identifier(resultName),
                Identifier(propName),
                false
              ),
              o.argument
            );
          }
        };
      });

      var newBody = getBlockBody(object.body);

      newBody.unshift(
        VariableDeclaration(
          VariableDeclarator(
            ArrayPattern([
              ArrayPattern(input.map(Identifier)),
              ArrayPattern(clone(object.params)),
              Identifier(resultName),
            ]),

            Identifier(valName)
          )
        )
      );

      if (!this.flatMapName) {
        this.flatMapName = this.getPlaceholder();
        prepend(
          parents[parents.length - 1],
          VariableDeclaration(
            VariableDeclarator(
              this.flatMapName,
              (this.flatNode = ObjectExpression([]))
            )
          )
        );
      }

      var newFunctionExpression = FunctionExpression(
        [Identifier(valName)],
        newBody
      );

      newFunctionExpression.async = !!object.async;
      newFunctionExpression.generator = !!object.generator;

      var property = Property(
        Identifier(newName),
        newFunctionExpression,
        false
      );
      property.kind = "set";

      this.flatNode.properties.push(property);

      var identifier = MemberExpression(
        Identifier(this.flatMapName),
        Identifier(newName),
        false
      );

      var newParamNodes = object.params.map(() =>
        Identifier(this.getPlaceholder())
      );

      // var result = newFn.call([...refs], ...arguments)
      var call = VariableDeclaration([
        VariableDeclarator(resultName, ArrayExpression([])),
        VariableDeclarator(
          "_",
          AssignmentExpression(
            "=",
            identifier,
            ArrayExpression([
              ArrayExpression(input.map(Identifier)),
              ArrayExpression([...newParamNodes]),
              Identifier(resultName),
            ])
          )
        ),
      ]);

      // result.pop()
      var pop = CallExpression(
        MemberExpression(
          MemberExpression(Identifier(resultName), Identifier(propName), false),
          Identifier("pop"),
          false
        ),
        []
      );

      // var result = newFn.call([...refs], ...arguments)
      // modified1 = result.pop();
      // modified2 = result.pop();
      // ...modifiedN = result.pop();...
      //
      // return result.pop()

      var newObjectBody: Node[] = [call];
      var outputReversed = [...output].reverse();

      // DECOY STATEMENTS
      var decoyKey = this.gen.generate();
      var decoyNodes = [
        IfStatement(
          MemberExpression(
            Identifier(resultName),
            Identifier(this.gen.generate()),
            false
          ),
          [
            ThrowStatement(
              NewExpression(Identifier("Error"), [
                Literal(this.getPlaceholder()),
              ])
            ),
          ]
        ),
        IfStatement(
          MemberExpression(
            Identifier(resultName),
            Identifier(this.gen.generate()),
            false
          ),
          [ReturnStatement(Identifier(resultName))]
        ),
        IfStatement(
          MemberExpression(
            Identifier(resultName),
            Identifier(this.gen.generate()),
            false
          ),
          [ReturnStatement(Identifier(resultName))]
        ),
        IfStatement(
          MemberExpression(Identifier(resultName), Identifier(decoyKey), false),
          [
            ReturnStatement(
              MemberExpression(
                Identifier(resultName),
                Identifier(decoyKey),
                false
              )
            ),
          ]
        ),
        IfStatement(
          MemberExpression(
            Identifier(resultName),
            Identifier(this.gen.generate()),
            false
          ),
          [
            ReturnStatement(
              MemberExpression(
                Identifier(resultName),
                Identifier(this.gen.generate()),
                false
              )
            ),
          ]
        ),
      ];

      shuffle(decoyNodes);
      decoyNodes.forEach((decoyNode) => {
        if (fixRandom() < 0.5) {
          newObjectBody.push(decoyNode);
        }
      });

      newObjectBody.push(
        ...outputReversed.map((name) => {
          return ExpressionStatement(
            AssignmentExpression("=", Identifier(name), clone(pop))
          );
        }),

        ReturnStatement(clone(pop))
      );

      object.body = BlockStatement(newObjectBody);

      object.params = newParamNodes;
    };
  }
}
