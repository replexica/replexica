export default function WelcomeChild() {
  const value = 42;
  return (
    <div>
    <p>
      Hey there! This is a child component.
    <span>
      What's up with this <b>{value}</b> child <i>component</i>?
    </span>
    </p>
  </div>
  );
}