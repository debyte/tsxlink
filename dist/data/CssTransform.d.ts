import css from "css";
export declare class CssTransform {
    root: css.Stylesheet;
    constructor(src: string);
    stringify(root: css.Stylesheet | false): string;
    tree<T extends css.Node | css.KeyFrame>(node: T): T | false;
    stylesheet(node: css.Stylesheet): css.Stylesheet;
    comment(node: css.Comment): css.Comment | false;
    rule(node: css.Rule): css.Rule | false;
    declaration(node: css.Declaration): css.Declaration | false;
    import(node: css.Import): css.Import | false;
    charset(node: css.Charset): css.Charset | false;
    fontFace(node: css.FontFace): css.FontFace | false;
    keyframes(node: css.KeyFrames): css.KeyFrames | false;
    keyframe(node: css.KeyFrame): css.KeyFrame | false;
    media(node: css.Media): css.Media | false;
    customMedia(node: css.CustomMedia): css.CustomMedia | false;
    supports(node: css.Supports): css.Supports | false;
    namespace(node: css.Namespace): css.Namespace | false;
    host(node: css.Host): css.Host | false;
    page(node: css.Page): css.Page | false;
    document(node: css.Document): css.Document | false;
    value(value: string | undefined): string | undefined;
    nodeList<T extends css.Node | css.KeyFrame>(nodes: T[] | undefined): T[] | undefined;
    filterSelectors(_selector: string): boolean;
    filterAtRule(_atRule: string): boolean;
}
