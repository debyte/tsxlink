import css from "css";

export class CssTransform {
  root: css.Stylesheet;

  static run(src: string): string {
    const tr = new CssTransform(src);
    const out = tr.tree(tr.root);
    return tr.stringify(out);
  }

  constructor(src: string) {
    this.root = css.parse(src);
  }

  stringify(root: css.Stylesheet | false): string {
    return root ? css.stringify(root) : "";
  }

  tree<T extends css.Node | css.KeyFrame>(node: T): T | false {
    switch (node.type) {
      case "stylesheet":
        return this.stylesheet(node) as T;
      case "comment":
        return this.comment(node) as T | false;
      case "rule":
        return this.rule(node) as T | false;
      case "declaration":
        return this.declaration(node) as T | false;
      case "import":
        return this.import(node) as T | false;
      case "charset":
        return this.charset(node) as T | false;
      case "font-face":
        return this.fontFace(node) as T | false;
      case "keyframes":
        return this.keyframes(node) as T | false;
      case "keyframe":
        return this.keyframe(node) as T | false;
      case "media":
        return this.media(node) as T | false;
      case "custom-media":
        return this.customMedia(node) as T | false;
      case "supports":
        return this.supports(node) as T | false;
      case "namespace":
        return this.namespace(node) as T | false;
      case "host":
        return this.host(node) as T | false;
      case "page":
        return this.page(node) as T | false;
      case "document":
        return this.document(node) as T | false;
    }
  }

  stylesheet(node: css.Stylesheet): css.Stylesheet {
    if (node.stylesheet !== undefined) {
      const rules = this.nodeList(node.stylesheet.rules) || [];
      return { ...node, stylesheet: { ...node.stylesheet, rules } };
    }
    return node;
  }

  comment(node: css.Comment): css.Comment | false {
    return node;
  }

  rule(node: css.Rule): css.Rule | false {
    const selectors = node.selectors?.filter(s => this.filterSelectors(s));
    if (selectors && selectors.length > 0) {
      return {
        ...node,
        declarations: this.nodeList(node.declarations),
        selectors,
      };
    }
    return false;
  }

  declaration(node: css.Declaration): css.Declaration | false {
    return { ...node, value: this.value(node.value) };
  }

  import(node: css.Import): css.Import | false {
    if (this.filterAtRule("@import " + node.import || "")) {
      return { ...node, import: this.value(node.import) };
    }
    return false;
  }

  charset(node: css.Charset): css.Charset | false {
    return this.filterAtRule("@charset " + node.charset || "") && node;
  }

  fontFace(node: css.FontFace): css.FontFace | false {
    if (this.filterAtRule("@font-face")) {
      return { ...node, declarations: this.nodeList(node.declarations) };
    }
    return false;
  }

  keyframes(node: css.KeyFrames): css.KeyFrames | false {
    if (this.filterAtRule("@keyframes " + node.name || "")) {
      return { ...node, keyframes: this.nodeList(node.keyframes) };
    }
    return false;
  }

  keyframe(node: css.KeyFrame): css.KeyFrame | false {
    return { ...node, declarations: this.nodeList(node.declarations) };
  }

  media(node: css.Media): css.Media | false {
    if (this.filterAtRule("@media " + node.media || "")) {
      return { ...node, rules: this.nodeList(node.rules) };
    }
    return false;
  }

  customMedia(node: css.CustomMedia): css.CustomMedia | false {
    return this.filterAtRule("@custom-media " + node.name || "") && node;
  }

  supports(node: css.Supports): css.Supports | false {
    if (this.filterAtRule("@supports " + node.supports || "")) {
      return { ...node, rules: this.nodeList(node.rules) };
    }
    return false;
  }

  namespace(node: css.Namespace): css.Namespace | false {
    return this.filterAtRule("@namespace " + node.namespace || "") && node;
  }

  host(node: css.Host): css.Host | false {
    if (this.filterAtRule("@host")) {
      return { ...node, rules: this.nodeList(node.rules) };
    }
    return false;
  }

  page(node: css.Page): css.Page | false {
    if (this.filterAtRule("@page " + node.selectors?.join(", "))) {
      return { ...node, declarations: this.nodeList(node.declarations) };
    }
    return false;
  }

  document(node: css.Document): css.Document | false {
    if (this.filterAtRule("@document " + node.document || "")) {
      return { ...node, rules: this.nodeList(node.rules) };
    }
    return false;
  }

  value(value: string | undefined): string | undefined {
    return value;
  }

  nodeList<T extends css.Node | css.KeyFrame>(
    nodes: T[] | undefined,
  ): T[] | undefined {
    if (nodes === undefined) {
      return undefined;
    }
    const out: T[] = [];
    for (const node of nodes) {
      const n = this.tree(node);
      if (n !== false) {
        out.push(n);
      }
    }
    return out;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterSelectors(selector: string): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterAtRule(atRule: string): boolean {
    return true;
  }
}
