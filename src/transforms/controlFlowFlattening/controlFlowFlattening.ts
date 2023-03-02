import { ok } from "assert";
import { compileJsSync } from "../../compiler";
import { ObfuscateOrder } from "../../order";
import { ComputeProbabilityMap } from "../../probability";
import Template from "../../templates/template";
import { getBlock, isBlock, walk } from "../../traverse";
import {
  ArrayExpression,
  ArrayPattern,
  AssignmentExpression,
  BinaryExpression,
  BreakStatement,
  CallExpression,
  ConditionalExpression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  LabeledStatement,
  Literal,
  MemberExpression,
  Node,
  ObjectExpression,
  Property,
  ReturnStatement,
  SequenceExpression,
  SwitchCase,
  SwitchStatement,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
} from "../../util/gen";
import {
  containsLexicallyBoundVariables,
  getIdentifierInfo,
} from "../../util/identifiers";
import {
  clone,
  getBlockBody,
  getFunction,
  getVarContext,
  isVarContext,
} from "../../util/insert";
import {
  choice, fixRandom,
  getRandomInteger,
  getRealRandomInteger,
  shuffle
} from "../../util/random";
import Transform from "../transform";
import ChoiceFlowObfuscation from "./choiceFlowObfuscation";
import ControlFlowObfuscation from "./controlFlowObfuscation";
import ExpressionObfuscation from "./expressionObfuscation";
import SwitchCaseObfuscation from "./switchCaseObfuscation";

var flattenStructures = new Set([
  "IfStatement",
  "ForStatement",
  "WhileStatement",
  "DoWhileStatement",
]);

/**
 * Breaks functions into DAGs (Directed Acyclic Graphs)
 *
 * - 1. Break functions into chunks
 * - 2. Shuffle chunks but remember their original position
 * - 3. Create a Switch statement inside a While loop, each case is a chunk, and the while loops exits on the last transition.
 *
 * The Switch statement:
 *
 * - 1. The state variable controls which case will run next
 * - 2. At the end of each case, the state variable is updated to the next block of code.
 * - 3. The while loop continues until the the state variable is the end state.
 */
export default class ControlFlowFlattening extends Transform {
  isDebug = false;

  constructor(o) {
    super(o, ObfuscateOrder.ControlFlowFlattening);

    if (!this.isDebug) {
      this.before.push(new ExpressionObfuscation(o));

      this.after.push(new ControlFlowObfuscation(o));
      this.after.push(new SwitchCaseObfuscation(o));
    } else {
      console.warn("Debug mode enabled");
    }

    // this.after.push(new ChoiceFlowObfuscation(o));
  }

  match(object, parents) {
    return (
      isBlock(object) &&
      (!parents[1] || !flattenStructures.has(parents[1].type)) &&
      (!parents[2] || !flattenStructures.has(parents[2].type))
    );
  }

  transform(object, parents) {
    return () => {
      if (object.body.length < 3) {
        return;
      }
      if (containsLexicallyBoundVariables(object, parents)) {
        return;
      }

      if (
        !ComputeProbabilityMap(this.options.controlFlowFlattening, (x) => x)
      ) {
        return;
      }

      var body = getBlockBody(object.body);
      if (!body.length) {
        return;
      }
      // First step is to reorder the body
      // Fix 1. Bring hoisted functions up to be declared first

      var functionDeclarations: Set<Node> = new Set();
      var fnNames: Set<string> = new Set();
      var illegalFnNames = new Set<string>();

      /**
       * The variable names
       *
       * index -> var name
       */
      var stateVars = Array(this.isDebug ? 1 : getRandomInteger(2, 5))
        .fill(0)
        .map(() => this.getPlaceholder());

      body.forEach((stmt, i) => {
        if (stmt.type == "FunctionDeclaration") {
          functionDeclarations.add(stmt);
          var name = stmt.id && stmt.id.name;
          fnNames.add(name);
          if (stmt.body.type !== "BlockStatement") {
            illegalFnNames.add(name);
          } else {
            walk(stmt, [body, object, ...parents], (o, p) => {
              if (
                o.type == "ThisExpression" ||
                o.type == "SuperExpression" ||
                (o.type == "Identifier" &&
                  (o.name == "arguments" || o.name == "eval"))
              ) {
                illegalFnNames.add(name);
                return "EXIT";
              }
            });
          }
        }
      });

      walk(object, parents, (o, p) => {
        if (o.type == "Identifier" && fnNames.has(o.name)) {
          var info = getIdentifierInfo(o, p);
          if (!info.spec.isReferenced) {
            return;
          }

          if (info.spec.isModified) {
            fnNames.delete(o.name);
          } else if (info.spec.isDefined) {
            if (info.isFunctionDeclaration) {
              if (!functionDeclarations.has(p[0])) {
                fnNames.delete(o.name);
              }
            } else {
              fnNames.delete(o.name);
            }
          }

          if (!info.spec.isDefined) {
            var b = getBlock(o, p);
            if (b !== object || !p[0] || p[0].type !== "CallExpression") {
              illegalFnNames.add(o.name);
            } else {
              var isExtractable = false;
              if (p[1]) {
                if (
                  p[1].type == "ExpressionStatement" &&
                  p[1].expression == p[0] &&
                  p[2] == object.body
                ) {
                  isExtractable = true;
                  p[1].$callExpression = "ExpressionStatement";
                  p[1].$fnName = o.name;
                } else if (
                  p[1].type == "VariableDeclarator" &&
                  p[1].init == p[0] &&
                  p[2].length === 1 &&
                  p[4] == object.body
                ) {
                  isExtractable = true;
                  p[3].$callExpression = "VariableDeclarator";
                  p[3].$fnName = o.name;
                } else if (
                  p[1].type == "AssignmentExpression" &&
                  p[1].operator == "=" &&
                  p[1].right === p[0] &&
                  p[2] &&
                  p[2].type == "ExpressionStatement" &&
                  p[3] == object.body
                ) {
                  isExtractable = true;
                  p[2].$callExpression = "AssignmentExpression";
                  p[2].$fnName = o.name;
                }
              }

              if (!isExtractable) {
                illegalFnNames.add(o.name);
              }
            }
          }
        }
      });

      // redefined function,
      if (functionDeclarations.size !== fnNames.size) {
        return;
      }

      illegalFnNames.forEach((illegal) => {
        fnNames.delete(illegal);
      });

      var fraction = 0.9;
      if (body.length > 20) {
        fraction /= Math.max(1.2, body.length - 18);
      }
      fraction = Math.min(0.1, fraction);
      if (isNaN(fraction) || !isFinite(fraction)) {
        fraction = 0.5;
      }

      var resultVar = this.getPlaceholder();
      var argVar = this.getPlaceholder();
      var testVar = this.getPlaceholder();
      var stringBankVar = this.getPlaceholder();
      var stringBank: { [strValue: string]: string } = Object.create(null);
      var stringBankByLabels: { [label: string]: Set<string> } =
        Object.create(null);
      let stringBankGen = this.getGenerator();

      var needsTestVar = false;
      var needsResultAndArgVar = false;
      var needsStringBankVar = false;
      var fnToLabel: { [fnName: string]: string } = Object.create(null);

      fnNames.forEach((fnName) => {
        fnToLabel[fnName] = this.getPlaceholder();
      });

      const flattenBody = (
        body: Node[],
        startingLabel = this.getPlaceholder()
      ): { label: string; body: Node[] }[] => {
        var chunks = [];
        var currentBody = [];
        var currentLabel = startingLabel;
        const finishCurrentChunk = (
          pointingLabel?: string,
          newLabel?: string,
          addGotoStatement = true
        ) => {
          if (!newLabel) {
            newLabel = this.getPlaceholder();
          }
          if (!pointingLabel) {
            pointingLabel = newLabel;
          }

          if (addGotoStatement) {
            currentBody.push({ type: "GotoStatement", label: pointingLabel });
          }

          chunks.push({
            label: currentLabel,
            body: [...currentBody],
          });

          walk(currentBody, [], (o, p) => {
            if (
              o.type == "Literal" &&
              typeof o.value == "string" &&
              !o.regex &&
              fixRandom() / (Object.keys(stringBank).length / 2 + 1) > 0.5
            ) {
              needsStringBankVar = true;
              if (!stringBankByLabels[currentLabel]) {
                stringBankByLabels[currentLabel] = new Set();
              }

              stringBankByLabels[currentLabel].add(o.value);

              if (typeof stringBank[o.value] === "undefined") {
                stringBank[o.value] = stringBankGen.generate();
              }

              return () => {
                this.replaceIdentifierOrLiteral(
                  o,
                  MemberExpression(
                    Identifier(stringBankVar),
                    Literal(stringBank[o.value]),
                    true
                  ),
                  p
                );
              };
            }
          });

          currentLabel = newLabel;
          currentBody = [];
        };

        body.forEach((stmt, i) => {
          if (functionDeclarations.has(stmt)) {
            return;
          }

          if (stmt.$exit) {
            currentBody.push(stmt);
            currentBody.push(BreakStatement(switchLabel));
            finishCurrentChunk(null, null, false);
            return;
          }

          if (stmt.$callExpression && fnToLabel[stmt.$fnName]) {
            var afterPath = this.getPlaceholder();
            var args = [];

            switch (stmt.$callExpression) {
              // var a = fn();
              case "VariableDeclarator":
                args = stmt.declarations[0].init.arguments;
                stmt.declarations[0].init = Identifier(resultVar);
                break;

              // fn();
              case "ExpressionStatement":
                args = stmt.expression.arguments;
                stmt.expression = Identifier("undefined");
                break;

              // a = fn();
              case "AssignmentExpression":
                args = stmt.expression.right.arguments;
                stmt.expression.right = Identifier(resultVar);
                break;
            }

            needsResultAndArgVar = true;

            currentBody.push(
              ExpressionStatement(
                AssignmentExpression(
                  "=",
                  Identifier(argVar),
                  ArrayExpression([
                    {
                      type: "StateIdentifier",
                      label: afterPath,
                    },
                    ArrayExpression(args),
                  ])
                )
              )
            );
            finishCurrentChunk(fnToLabel[stmt.$fnName], afterPath);
          }

          if (stmt.type == "GotoStatement" && i !== body.length - 1) {
            finishCurrentChunk(stmt.label);
            return;
          }

          if (stmt.type == "LabeledStatement") {
            var lbl = stmt.label.name;
            var control = stmt.body;

            var isSwitchStatement = control.type === "SwitchStatement";

            if (
              isSwitchStatement ||
              ((control.type == "ForStatement" ||
                control.type == "WhileStatement" ||
                control.type == "DoWhileStatement") &&
                control.body.type == "BlockStatement")
            ) {
              if (isSwitchStatement) {
                if (
                  control.cases.length == 0 || // at least 1 case
                  control.cases.find(
                    (x) =>
                      !x.test || // cant be default case
                      !x.consequent.length || // must have body
                      x.consequent.findIndex(
                        (node) => node.type == "BreakStatement"
                      ) !==
                        x.consequent.length - 1 || // break statement must be at the end
                      x.consequent[x.consequent.length - 1].type !== // must end with break statement
                        "BreakStatement" ||
                      !x.consequent[x.consequent.length - 1].label || // must be labeled and correct
                      x.consequent[x.consequent.length - 1].label.name != lbl
                  )
                ) {
                  currentBody.push(stmt);
                  return;
                }
              }

              var isLoop = !isSwitchStatement;
              var supportContinueStatement = isLoop;

              var testPath = this.getPlaceholder();
              var updatePath = this.getPlaceholder();
              var bodyPath = this.getPlaceholder();
              var afterPath = this.getPlaceholder();
              var possible = true;
              var toReplace = [];

              walk(control.body, [], (o, p) => {
                if (
                  o.type == "BreakStatement" ||
                  (supportContinueStatement && o.type == "ContinueStatement")
                ) {
                  if (!o.label || o.label.name !== lbl) {
                    possible = false;
                    return "EXIT";
                  }
                  if (o.label.name === lbl) {
                    return () => {
                      toReplace.push([
                        o,
                        {
                          type: "GotoStatement",
                          label:
                            o.type == "BreakStatement" ? afterPath : updatePath,
                        },
                      ]);
                    };
                  }
                }
              });
              if (!possible) {
                currentBody.push(stmt);
                return;
              }
              toReplace.forEach((v) => this.replace(v[0], v[1]));

              if (isSwitchStatement) {
                var switchVarName = this.getPlaceholder();

                currentBody.push(
                  VariableDeclaration(
                    VariableDeclarator(switchVarName, control.discriminant)
                  )
                );

                var afterPath = this.getPlaceholder();
                finishCurrentChunk();
                control.cases.forEach((switchCase, i) => {
                  var entryPath = this.getPlaceholder();

                  currentBody.push(
                    IfStatement(
                      BinaryExpression(
                        "===",
                        Identifier(switchVarName),
                        switchCase.test
                      ),
                      [
                        {
                          type: "GotoStatement",
                          label: entryPath,
                        },
                      ]
                    )
                  );

                  chunks.push(
                    ...flattenBody(
                      [
                        ...switchCase.consequent.slice(
                          0,
                          switchCase.consequent.length - 1
                        ),
                        {
                          type: "GotoStatement",
                          label: afterPath,
                        },
                      ],
                      entryPath
                    )
                  );

                  if (i === control.cases.length - 1) {
                  } else {
                    finishCurrentChunk();
                  }
                });

                finishCurrentChunk(afterPath, afterPath);
                return;
              } else if (isLoop) {
                var isPostTest = control.type == "DoWhileStatement";

                // add initializing section to current chunk
                if (control.init) {
                  if (control.init.type == "VariableDeclaration") {
                    currentBody.push(control.init);
                  } else {
                    currentBody.push(ExpressionStatement(control.init));
                  }
                }

                // create new label called `testPath` and have current chunk point to it (goto testPath)
                finishCurrentChunk(isPostTest ? bodyPath : testPath, testPath);

                currentBody.push(
                  ExpressionStatement(
                    AssignmentExpression(
                      "=",
                      Identifier(testVar),
                      control.test || Literal(true)
                    )
                  )
                );

                needsTestVar = true;

                finishCurrentChunk();

                currentBody.push(
                  IfStatement(Identifier(testVar), [
                    {
                      type: "GotoStatement",
                      label: bodyPath,
                    },
                  ])
                );

                // create new label called `bodyPath` and have test body point to afterPath (goto afterPath)
                finishCurrentChunk(afterPath, bodyPath);

                var innerBothPath = this.getPlaceholder();
                chunks.push(
                  ...flattenBody(
                    [
                      ...control.body.body,
                      {
                        type: "GotoStatement",
                        label: updatePath,
                      },
                    ],
                    innerBothPath
                  )
                );

                finishCurrentChunk(innerBothPath, updatePath);

                if (control.update) {
                  currentBody.push(ExpressionStatement(control.update));
                }

                finishCurrentChunk(testPath, afterPath);
                return;
              }
            }
          }

          if (
            stmt.type == "IfStatement" &&
            stmt.consequent.type == "BlockStatement" &&
            (!stmt.alternate || stmt.alternate.type == "BlockStatement")
          ) {
            finishCurrentChunk();

            currentBody.push(
              ExpressionStatement(
                AssignmentExpression("=", Identifier(testVar), stmt.test)
              )
            );

            needsTestVar = true;

            finishCurrentChunk();

            var hasAlternate = !!stmt.alternate;
            ok(!(hasAlternate && stmt.alternate.type !== "BlockStatement"));

            var yesPath = this.getPlaceholder();
            var noPath = this.getPlaceholder();
            var afterPath = this.getPlaceholder();

            currentBody.push(
              IfStatement(Identifier(testVar), [
                {
                  type: "GotoStatement",
                  label: yesPath,
                },
              ])
            );

            chunks.push(
              ...flattenBody(
                [
                  ...stmt.consequent.body,
                  {
                    type: "GotoStatement",
                    label: afterPath,
                  },
                ],
                yesPath
              )
            );

            if (hasAlternate) {
              chunks.push(
                ...flattenBody(
                  [
                    ...stmt.alternate.body,
                    {
                      type: "GotoStatement",
                      label: afterPath,
                    },
                  ],
                  noPath
                )
              );

              finishCurrentChunk(noPath, afterPath);
            } else {
              finishCurrentChunk(afterPath, afterPath);
            }

            return;
          }

          if (!currentBody.length || fixRandom() < fraction) {
            currentBody.push(stmt);
          } else {
            // Start new chunk
            finishCurrentChunk();
            currentBody.push(stmt);
          }
        });

        finishCurrentChunk();
        chunks[chunks.length - 1].body.pop();

        return chunks;
      };

      var chunks = [];

      /**
       * label: switch(a+b+c){...break label...}
       */
      var switchLabel = this.getPlaceholder();

      functionDeclarations.forEach((node) => {
        if (node.id && fnNames.has(node.id.name)) {
          var exitStateName = this.getPlaceholder();
          var argumentsName = this.getPlaceholder();

          needsResultAndArgVar = true;

          node.body.body.push(ReturnStatement());

          walk(node.body, [], (o, p) => {
            if (o.type == "ReturnStatement") {
              if (!getFunction(o, p)) {
                return () => {
                  var exitExpr = SequenceExpression([
                    AssignmentExpression(
                      "=",
                      ArrayPattern(stateVars.map(Identifier)),
                      Identifier(exitStateName)
                    ),
                    AssignmentExpression(
                      "=",
                      Identifier(resultVar),
                      o.argument || Identifier("undefined")
                    ),
                  ]);

                  this.replace(o, ReturnStatement(exitExpr));
                };
              }
            }
          });

          var declarations = [
            VariableDeclarator(
              ArrayPattern([
                Identifier(exitStateName),
                Identifier(argumentsName),
              ]),
              Identifier(argVar)
            ),
          ];

          if (node.params.length) {
            declarations.push(
              VariableDeclarator(
                ArrayPattern(node.params),
                Identifier(argumentsName)
              )
            );
          }

          var innerName = this.getPlaceholder();

          chunks.push(
            ...flattenBody(
              [
                FunctionDeclaration(
                  innerName,
                  [],
                  [VariableDeclaration(declarations), ...node.body.body]
                ),
                this.objectAssign(
                  ExpressionStatement(
                    CallExpression(Identifier(innerName), [])
                  ),
                  {
                    $exit: true,
                  } as any
                ),
              ],
              fnToLabel[node.id.name]
            )
          );
        }
      });

      var startLabel = this.getPlaceholder();

      chunks.push(...flattenBody(body, startLabel));
      chunks[chunks.length - 1].body.push({
        type: "GotoStatement",
        label: "END_LABEL",
      });
      chunks.push({
        label: "END_LABEL",
        body: [],
      });

      var caseSelection: Set<number> = new Set();

      var uniqueStatesNeeded = chunks.length;
      var endLabel = chunks[Object.keys(chunks).length - 1].label;

      do {
        var newState = getRealRandomInteger(1, chunks.length * 15);
        if (this.isDebug) {
          newState = caseSelection.size;
        }
        caseSelection.add(newState);
      } while (caseSelection.size !== uniqueStatesNeeded);

      ok(caseSelection.size == uniqueStatesNeeded);

      /**
       * The accumulated state values
       *
       * index -> total state value
       */
      var caseStates = Array.from(caseSelection);

      /**
       * The individual state values for each label
       *
       * labels right now are just chunk indexes (numbers)
       *
       * but will expand to if statements and functions when `goto statement` obfuscation is added
       */
      var labelToStates: { [label: string]: number[] } = Object.create(null);

      Object.values(chunks).forEach((chunk, i) => {
        var state = caseStates[i];

        var stateValues = Array(stateVars.length)
          .fill(0)
          .map(() => getRandomInteger(-250, 250));

        const getCurrentState = () => {
          return stateValues.reduce((a, b) => b + a, 0);
        };

        var correctIndex = getRandomInteger(0, stateValues.length);
        stateValues[correctIndex] =
          state - (getCurrentState() - stateValues[correctIndex]);
        labelToStates[chunk.label] = stateValues;
      });

      // console.log(labelToStates);

      var initStateValues = [...labelToStates[startLabel]];
      var endState = labelToStates[endLabel].reduce((a, b) => b + a, 0);

      const numberLiteral = (num, depth, stateValues) => {
        ok(Array.isArray(stateValues));
        if (depth > 10 || fixRandom() > 0.8 / (depth * 4)) {
          return Literal(num);
        }

        var opposing = getRandomInteger(0, stateVars.length);

        if (fixRandom() > 0.5) {
          var x = getRandomInteger(-250, 250);
          var operator = choice(["<", ">"]);
          var answer =
            operator == "<"
              ? x < stateValues[opposing]
              : x > stateValues[opposing];
          var correct = numberLiteral(num, depth + 1, stateValues);
          var incorrect = numberLiteral(
            getRandomInteger(-250, 250),
            depth + 1,
            stateValues
          );

          return ConditionalExpression(
            BinaryExpression(
              operator,
              numberLiteral(x, depth + 1, stateValues),
              Identifier(stateVars[opposing])
            ),
            answer ? correct : incorrect,
            answer ? incorrect : correct
          );
        }

        return BinaryExpression(
          "+",
          Identifier(stateVars[opposing]),
          numberLiteral(num - stateValues[opposing], depth + 1, stateValues)
        );
      };

      const createTransitionExpression = (
        index: number,
        add: number,
        mutatingStateValues: number[]
      ) => {
        var newValue = mutatingStateValues[index] + add;

        var expr = null;

        if (this.isDebug) {
          expr = AssignmentExpression(
            "=",
            Identifier(stateVars[index]),
            Literal(newValue)
          );
        } else if (fixRandom() > 0.5) {
          expr = AssignmentExpression(
            "+=",
            Identifier(stateVars[index]),
            numberLiteral(add, 0, mutatingStateValues)
          );
        } else {
          var double = mutatingStateValues[index] * 2;
          var diff = double - newValue;

          var first = AssignmentExpression(
            "*=",
            Identifier(stateVars[index]),
            numberLiteral(2, 0, mutatingStateValues)
          );
          mutatingStateValues[index] = double;

          expr = SequenceExpression([
            first,
            AssignmentExpression(
              "-=",
              Identifier(stateVars[index]),
              numberLiteral(diff, 0, mutatingStateValues)
            ),
          ]);
        }

        mutatingStateValues[index] = newValue;

        return expr;
      };

      interface Case {
        state: number;
        body: Node[];
        order: number;
      }

      var order = Object.create(null);
      var cases: Case[] = [];

      chunks.forEach((chunk, i) => {
        // skip last case, its empty and never ran
        if (chunk.label === endLabel) {
          return;
        }

        ok(labelToStates[chunk.label]);
        var state = caseStates[i];
        var made = 1;

        var breaksInsertion = [];
        var staticStateValues = [...labelToStates[chunk.label]];
        var potentialBranches = new Set<string>();

        chunk.body.forEach((stmt, stmtIndex) => {
          var addBreak = false;
          walk(stmt, [], (o, p) => {
            if (
              !this.isDebug &&
              o.type == "Literal" &&
              typeof o.value === "number" &&
              Math.floor(o.value) === o.value &&
              Math.abs(o.value) < 100_000 &&
              fixRandom() < 4 / made &&
              !p.find((x) => isVarContext(x))
            ) {
              made++;
              return () => {
                this.replaceIdentifierOrLiteral(
                  o,
                  numberLiteral(o.value, 0, staticStateValues),
                  p
                );
              };
            }

            if (o.type == "StateIdentifier") {
              return () => {
                ok(labelToStates[o.label]);
                this.replace(
                  o,
                  ArrayExpression(labelToStates[o.label].map(Literal))
                );
              };
            }

            if (o.type == "GotoStatement") {
              return () => {
                var blockIndex = p.findIndex((node) => isBlock(node));
                if (blockIndex === -1) {
                  addBreak = true;
                } else {
                  var child = p[blockIndex - 2] || o;
                  var childIndex = p[blockIndex].body.indexOf(child);

                  p[blockIndex].body.splice(
                    childIndex + 1,
                    0,
                    BreakStatement(switchLabel)
                  );
                }

                potentialBranches.add(o.label);

                var mutatingStateValues = [...labelToStates[chunk.label]];
                var nextStateValues = labelToStates[o.label];
                ok(nextStateValues, o.label);
                this.replace(
                  o,
                  ExpressionStatement(
                    SequenceExpression(
                      mutatingStateValues.map((_v, stateValueIndex) => {
                        var diff =
                          nextStateValues[stateValueIndex] -
                          mutatingStateValues[stateValueIndex];
                        return createTransitionExpression(
                          stateValueIndex,
                          diff,
                          mutatingStateValues
                        );
                      })
                    )
                  )
                );
              };
            }
          });

          if (addBreak) {
            breaksInsertion.push(stmtIndex);
          }
        });

        breaksInsertion.sort();
        breaksInsertion.reverse();

        breaksInsertion.forEach((index) => {
          chunk.body.splice(index + 1, 0, BreakStatement(switchLabel));
        });

        for (var branch of Array.from(potentialBranches)) {
          var strings = stringBankByLabels[branch];
          if (strings) {
            chunk.body.unshift(
              ExpressionStatement(
                SequenceExpression(
                  Array.from(strings).map((strValue) => {
                    return AssignmentExpression(
                      "=",
                      MemberExpression(
                        Identifier(stringBankVar),
                        Literal(stringBank[strValue]),
                        true
                      ),
                      Literal(strValue)
                    );
                  })
                )
              )
            );
          }
        }

        // var c = Identifier("undefined");
        // this.addComment(c, stateValues.join(", "));
        // transitionStatements.push(c);

        var caseObject = {
          body: chunk.body,
          state: state,
          order: i,
        };
        order[i] = caseObject;

        cases.push(caseObject);
      });

      if (!this.isDebug) {
        shuffle(cases);
      }

      var discriminant = Template(`${stateVars.join("+")}`).single().expression;

      body.length = 0;

      if (functionDeclarations.size) {
        functionDeclarations.forEach((x) => {
          if (!x.id || illegalFnNames.has(x.id.name)) {
            body.unshift(clone(x));
          }
        });
      }

      var switchStatement: Node = SwitchStatement(
        discriminant,
        cases.map((x, i) => {
          var statements = [];

          statements.push(...x.body);

          var test = Literal(x.state);

          return SwitchCase(test, statements);
        })
      );

      var declarations = [];

      if (needsTestVar) {
        declarations.push(VariableDeclarator(testVar));
      }

      if (needsResultAndArgVar) {
        declarations.push(VariableDeclarator(resultVar));
        declarations.push(VariableDeclarator(argVar));
      }
      if (needsStringBankVar) {
        declarations.push(
          VariableDeclarator(
            stringBankVar,
            ObjectExpression(
              stringBankByLabels[startLabel]
                ? Array.from(stringBankByLabels[startLabel]).map((strValue) =>
                    Property(
                      Literal(stringBank[strValue]),
                      Literal(strValue),
                      false
                    )
                  )
                : []
            )
          )
        );
      }

      declarations.push(
        ...stateVars.map((stateVar, i) => {
          return VariableDeclarator(stateVar, Literal(initStateValues[i]));
        })
      );

      body.push(
        VariableDeclaration(declarations),

        WhileStatement(
          BinaryExpression("!=", clone(discriminant), Literal(endState)),
          [LabeledStatement(switchLabel, switchStatement)]
        )
      );

      // mark this object for switch case obfuscation
      switchStatement.$controlFlowFlattening = true;
    };
  }
}
