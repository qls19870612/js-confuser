import { Node } from "./util/gen";
import { validateChain } from "./util/identifiers";

/**
 * A block refers to any object that has a **`.body`** property where code is nested.
 *
 * Types: `BlockStatement`, `Program`
 *
 * @param object
 * @param parents
 */
export function getBlock(object: any, parents: any[]) {
  if (!Array.isArray(parents)) {
    throw new Error("parents must be an array");
  }
  return [object, ...parents].find((node) => isBlock(node));
}

/**
 * Must have a **`.body`** property and be an array.
 *
 * - "BlockStatement"
 * - "Program"
 *
 * @param object
 */
export function isBlock(object: any) {
  return (
    object && (object.type == "BlockStatement" || object.type == "Program")
  );
}

export type EnterCallback = (
  object: Node,
  parents: Node[]
) => ExitCallback | "EXIT" | void;
export type ExitCallback = () => void;
var otherType = global['otherType']= global['otherType']||{};
export function walk(
  object: Node | Node[],
  parents: Node[],
  onEnter: EnterCallback,
  deep:number = 0
): "EXIT" | void {
  let nextDeep = deep+1;
  let objType = typeof object;
  let b = objType === "object";
  if (b)
  {
    otherType[objType] = 1;

  }
  if (b && object) {


    var newParents: Node[] = [object as Node, ...parents];

    if (!Array.isArray(object)) {
      validateChain(object, parents);
    }
    let startTime = new Date().getTime();
    // 1. Call `onEnter` function and remember any onExit callback returned
    var onExit = onEnter(object as Node, parents);

    let endTime = new Date().getTime();

    if (endTime - startTime > 10) {
      console.log("walk endTime.startTime:{}", endTime - startTime);
    }
    // 2. Traverse children
    if (Array.isArray(object)) {
      var copy = [...object];
      for (var element of copy) {
        if (walk(element, newParents, onEnter,nextDeep) === "EXIT") {
          return "EXIT";
        }
      }
      copy.forEach((x) => {});
    } else {
      var keys = Object.keys(object);
      for (var key of keys) {
        if (!key.startsWith("$")) {
          if (walk(object[key], newParents, onEnter,nextDeep) === "EXIT") {
            return "EXIT";
          }
        }
      }
    }

    if (onExit === "EXIT") {
      return "EXIT";
    }

    // 3. Done with children, call `onExit` callback
    if (onExit) {
      let startTime = new Date().getTime();
      onExit();
      let endTime = new Date().getTime();

      if (endTime - startTime > 10) {
        console.log("walk onExit endTime.startTime:{}", endTime - startTime);
      }
    }

  }
}

/**
 * The bare-bones walker.
 *
 * - Recursively traverse an AST object.
 * - Calls the `onEnter` function with:
 * - - `object` - The current node
 * - - `parents` - Array of ancestors `[closest, ..., root]`
 * - The `onEnter` callback can return an `onExit` callback for that node.
 *
 * - *Note*: Does not validate the property names.
 *
 * @param tree
 * @param onEnter
 */
export default function traverse(tree, onEnter: EnterCallback) {
  walk(tree, [], onEnter);
}
