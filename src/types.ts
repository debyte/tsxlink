export type Component = {
  name: string;
  props: Prop[];
  elementClass: string;
  template: string;
}

export type Prop = {
  name: string;
  type: PropType;
  target: string;
};

export type PropType = "string" | "number" | "boolean" | "fixed";
