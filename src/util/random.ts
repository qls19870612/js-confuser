import { ok } from "assert";
import {
  Literal,
  ObjectExpression,
  Identifier,
  Property,
  Node,
  ArrayExpression,
} from "./gen";
export let debug:boolean  = false;
export function choice<T>(choices: T[]): T {
  if (choices.length == 0)
  {
    return null;
  }
  var index = getRealRandomInteger(0,choices.length);
  return choices[index];
}


/**
 * **Mutates the given array**
 * @param array
 */
export function shuffle(array: any[]): any[] {
  array.sort(() => fixRandom() - 0.5);
  return array;
}

/**
 * Returns a random string.
 */
export function getRandomString(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(fixRandom() * charactersLength));
  }
  return result;
}


export function getRealRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInteger(min, max) {
  if (debug)
  {
    return Math.floor(min);
  }
  return Math.floor(getRealRandom(min, max));
}
export function getRealRandomInteger(min, max) {
  return Math.floor(getRealRandom(min, max));
}
export function fixRandom()
{
  if (debug)
  {
    return 0;
  }
  return Math.random();
}

export function splitIntoChunks(str: string, size: number) {
  ok(typeof str === "string", "str must be typeof string");
  ok(typeof size === "number", "size must be typeof number");
  ok(Math.floor(size) === size, "size must be integer");

  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

/**
 * Returns a random expression that will test to `false`.
 */
export function getRandomFalseExpression() {
  var type = choice(["0", "false", "null", "undefined", "NaN", "emptyString"]);

  switch (type) {
    case "0":
      return Literal(0);
    case "false":
      return Literal(false);
    case "null":
      return Identifier("null");
    case "undefined":
      return Identifier("undefined");
    case "NaN":
      return Identifier("NaN");
    default:
      // case "emptyString":
      return Literal("");
  }
}

/**
 * Returns a random expression that will test to `true`
 */
export function getRandomTrueExpression() {
  var type = choice([
    "number",
    "true",
    "Infinity",
    "nonEmptyString",
    "array",
    "object",
  ]);

  switch (type) {
    case "number":
      return Literal(getRandomInteger(1, 100));
    case "true":
      return Identifier("true");
    case "Infinity":
      return Identifier("Infinity");
    case "nonEmptyString":
      return Literal(getRandomString(getRandomInteger(3, 9)));
    case "array":
      return ArrayExpression([]);
    default:
      //case "object":
      return ObjectExpression([]);
  }
}

export function alphabeticalGenerator(index: number) {
  let name = "";
  while (index > 0) {
    var t = (index - 1) % 52;
    var thisChar =
      t >= 26 ? String.fromCharCode(65 + t - 26) : String.fromCharCode(97 + t);
    name = thisChar + name;
    index = ((index - t) / 52) | 0;
  }
  if (!name) {
    name = "_";
  }
  return name;
}
