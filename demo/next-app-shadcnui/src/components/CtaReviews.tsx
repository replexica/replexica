"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type CtaReviewsProps = {
  reviews: any[]
  maxReviews?: number
}

export default function CtaReviews({
  reviews,
  maxReviews = 5,
}: CtaReviewsProps) {
  const [randomizedReviewsSlice, setRandomizedReviewsSlice] = useState(
    reviews.slice(0, maxReviews)
  )

  useEffect(() => {
    setRandomizedReviewsSlice(reviews.slice(0, maxReviews))
  }, [maxReviews, reviews])

  return (
    <div className="flex flex-row items-start space-x-2">
      <div className="flex items-center justify-center -space-x-7 [&>span]:ring-2 [&>span]:ring-white dark:[&>span]:ring-zinc-950">
        {randomizedReviewsSlice.map((review, i) => (
          <Avatar
            key={i}
            className={cn([
              "h-10 w-10 border-2 border-white",
              i === 0 && "mr-3",
            ])}
          >
            <AvatarImage
              alt={review.name}
              src={review.avatar}
            />
            <AvatarFallback>{review.name[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex flex-col items-start justify-center pt-1">
        <div className="flex items-center">
          {new Array(5).fill(null).map((_, i) => (
            <span
              key={i}
              children="★"
              className="h-4 w-4 text-yellow-400"
            />
          ))}
        </div>
        <p className="font-semibold text-muted-foreground">
          Check it yourself!
        </p>
      </div>
    </div>
  )
}