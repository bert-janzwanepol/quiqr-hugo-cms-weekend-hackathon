import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Welcome</h1>
      <p>This is the index route!</p>
      <Button asChild>
        <Link to={'/projects'} className="w-fit items-center justify-center flex">
          View Projects <ArrowRight />
        </Link>
      </Button>
    </div>
  )
}
