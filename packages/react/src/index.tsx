export type MyComponentProps = {
  name: string;
};

export function MyComponent(props: MyComponentProps) {
  return <div>Hello, {props.name}!</div>;
}