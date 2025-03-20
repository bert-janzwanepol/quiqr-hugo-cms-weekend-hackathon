import React from 'react'
import { Link, useMatches } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'

export const AppBreadcrumb = () => {
  const matches = useMatches()
  const breadcrumbMatches = matches.filter((match) => match.id !== '__root__')

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="app-region-no-drag">
          <BreadcrumbLink asChild>
            <Link
              to={'/'}
              className="flex flex-row items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 py-1 px-2 rounded-sm"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbMatches.map((item) => {
          const pathSegments = item.pathname.split('/').filter((segment) => segment.length > 0)

          return pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1

            return (
              <React.Fragment key={segment}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={reconstructUrlFromSegments(pathSegments, index)}
                      className="flex items-center capitalize app-region-no-drag hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 py-1 px-2 rounded-sm"
                    >
                      {segment}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

const reconstructUrlFromSegments = (segments: string[], index: number) => {
  return '/' + segments.slice(0, index + 1).join('/')
}
