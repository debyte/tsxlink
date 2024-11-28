declare const _default: "\nexport type ClassSelection = { [cls: string]: boolean };\n\nexport function classResolve(\n  classes?: ClassSelection,\n  defaults?: ClassSelection,\n): string {\n  const resolved = { ...defaults || {}, ...classes || {} };\n  return Object.keys(resolved).reduce(\n    (className, k) => resolved[k] ? `${className} ${k}` : className,\n  );\n}\n";
export default _default;
