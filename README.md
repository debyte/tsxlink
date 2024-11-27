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
corresponding React.FunctionComponent (FC). The React components are dumb, or
in other words, presentation components. Programmers should not edit the
automatically built TSX files but wrap them in to other components that take
care of the necessary logic and state.

The design systems may not enforce a compatible and openly available support
for the concept of components. When necessary, additional custom tags are
inserted to the design elements in order to convey the necessary information
to the HTML output of the design system.

## Configuration

TODO

## Custom tags

* **`data-tsx="ComponentName"`**

    This element is a *reusable component*, which gets represented as
    `ComponentName.tsx` defining a `React.FC` of the same name. Note, that
    components often embed other reusable components and so embedded data-tsx
    attributes are also supported. Furthermore, designs typically include many
    instances of a single component, which could, for example, represent an
    item in a catalog of a webshop. All component instances should be marked
    with the same data-tsx attribute and their content can have differences.

* **`data-tsx-prop="name[:type][:target], ..."`**

    This element is inside a component and has a *property* that may be
    different in the different instances where the component appears in the
    design. For example, the element could contain the name or the price of an
    item in a webshop. The name of the property must be specified for the TSX
    code and appears in the *type interface* for the `React.FC`. The name must
    be unique in the component. The data type, as well as target, for the
    property may be autodetected from multiple component instances, and falls
    back to type `string` and target `text`. To avoid possible
    misinterpretations type and/or target can be specified inside the
    attribute too. In addition, multiple properties can be defined for the
    same element using commas as separators. Available property targets
    include:

    * `text` targets text content inside the element.

    * `value`, `class`, and *other attribute names* target the value of the
      named attribute. The `class` attribute always has an object type where
      keys are the class names and true values are active. The classes from the
      template are active by default.

    * `visibility` controls whether the element appears in the DOM or not. The
      type is always boolean. Property name `visibility` targets visibility
      rather than text on default, i.e., `visibility` has the effect of
      `visibility:visibility`.

    * `map` is typically used to attach *event listeners*, such as `onClick`
      and `onSubmit`. The type is an attribute map for the target element, for
      example `React.ButtonHTMLAttributes<HTMLButtonElement>`, and it may be
      used to add necessary element attributes that do not exist in the design.
      Property name `map` targets map on default, i.e., `map` has the effect of
      `map:map`.

* **`data-tsx-slot="name"`** and **`data-tsx-replace="name"`**

    This element renders content specified as a property. A *slot* uses the
    given content as its children while *replace* is switched to the new
    content. The content has a type `React.ReactNode` which accepts string,
    number, React element, undefined/null/false, or arrays of those.

    * **`children`** has a specific significance as a name. It indicates that
    the content is received as children in the React element tree rather than
    as an attribute of the React element.

### An example HTML output including custom tags maps to following TSX

```html
<div data-tsx="Search">
  <div class="flex flex-row items-center">
    <input type="text" name="query" data-tsx-prop="query:map" />
    <button data-tsx-prop="button:map">Search</button>
  </div>
  <div data-tsx-prop="loading:visibility">
    <span class="loading loading-spinner"></span>
  </div>
  <div class="flex flex-col gap-4" data-tsx-slot="results">
    <div class="flex flex-row items-stretch" data-tsx="SearchResult">
      <img src="placeholder.png" class="flex-none w-20" data-tsx-prop="image:src" />
      <div class="grow">
        <h1 data-tsx-prop="name">Item A</h1>
        <p>Item code: <span data-tsx-prop="code">101</span></p>
        <button data-tsx-prop="action,map">Display</button>
      </div>
    </div>
    <div class="flex flex-row items-stretch" data-tsx="SearchResult">
      <img src="placeholder.png" class="flex-none w-20" data-tsx-prop="image:src" />
      <div class="grow">
        <h1 data-tsx-prop="name">Item B</h1>
        <p>Item code: <span data-tsx-prop="code">110</span></p>
        <button data-tsx-prop="action,map">Listen</button>
      </div>
    </div>
  </div>
</div>
```
`Search.tsx`
```typescript
import React from "react";

export interface SearchProps {
  query?: React.InputHTMLAttributes<HTMLInputElement>,
  button?: React.ButtonHTMLAttributes<HTMLButtonElement>,
  loading?: boolean,
  results: React.ReactNode,
}

export const Search: React.FC<SearchProps> = (
  { query, button, loading, results }
) => (
  <div>
    <div className="flex flex-row items-center">
      <input type="text" name="query" {...query} />
      <button {...button}>Search</button>
    </div>
    {loading && (
      <div>
        <span className="loading loading-spinner"></span>
      </div>
    )}
    <div className="flex flex-col gap-4">
      {results}
    </div>
  </div>
);

export default Search;
```
SearchResult.tsx
```typescript
import React from "react";

export interface SearchResultProps {
  image: string,
  name: string,
  code: number,
  button?: React.ButtonHTMLAttributes<HTMLButtonElement>,
  action: string,
}

export const SearchResult: React.FC<SearchResultProps> = (
  {image, name, code, button, action}
) => (
  <div className="flex flex-row items-stretch">
      <img src={image} className="flex-none w-20" />
      <div className="grow">
        <h1>{name}</h1>
        <p>Item code: <span>{code}</span></p>
        <button {...button}>{action}</button>
      </div>
  </div>
);

export default SearchResult;
```
