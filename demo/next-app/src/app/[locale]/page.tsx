import Welcome from "./welcome";

export default function Home(props: any) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Hello, World!
      </p>
      <div>
        What's up?!
      </div>
      <Welcome />
      <p className="text-4xl font-bold text-center">
        {props.children}
      </p>
    </main>
  );
}
