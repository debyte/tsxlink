# TSXLINK

This module can link HTML output from systems such as Figma or Webflow as
presentation TSX components in a React project. Designers are able to work in
the readily available, popular tools. Programmers receive automatically built
TSX components which they integrate into the React code base required to run
the final product. Once the link is established, changes from the design model
are reflected as changes in the TSX components. For example, visual updates do
not require any hand written changes to the code.

The link is based on the concept of nested components and their properties.
Reusable components need to be recognized and marked in the design so that
they can be instantiated with actual data and events in the React environment.
The design components are replicated as TSX files, which each define a
corresponding React.FunctionComponent. The React components are dumb, or in
other words, presentation components. Programmers should not edit the
automatically built TSX files but wrap them in to other components that take
care of the necessary logic and state.

The design systems may not enforce a compatible and openly available support
for the concept of components. When necessary, additional custom tags are
inserted to the design elements in order to convey the necessary information
to the HTML output of the design system.

## Custom tags

* **data-x-component**: A component name to be defined in `[name].tsx`
* **data-x-property**: A c

`html
<div data-x-component="ComponentName" class="flex flex-col">
  <div >
  
</div>
`
