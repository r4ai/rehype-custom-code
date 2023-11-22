import { Element } from "hast";
import { isElement } from "hast-util-is-element";

interface PreElement extends Element {
  tagName: "pre";
}

interface CodeElement extends Element {
  tagName: "code";
}

export const isPreElement = (node?: unknown): node is PreElement =>
  isElement(node) && node.tagName === "pre";

export const isCodeElement = (node?: unknown): node is CodeElement =>
  isElement(node) && node.tagName === "code";
