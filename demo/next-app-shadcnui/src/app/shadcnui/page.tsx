import CtaReviews from "@/components/CtaReviews";

const someNumber = 42;

export default function Page() {
  return (
    <>
      <div>ShadcnUI Page</div>
      <br />
      <p className="leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        <Highlight>Chrome Extension</Highlight> —{" "}
        <Highlight>Save Time</Highlight> and{" "}
        <Highlight>Gain Insights</Highlight> Effortlessly {someNumber}
      </p>
      <br />
      <CtaReviews maxReviews={5} reviews={[]} />
    </>
  )
}

function Highlight({ children }: any) {
  return <span className="text-yellow-400">{children}</span>
}