import { createFileRoute, Link } from '@tanstack/react-router'
import { useTipc } from '@/lib/hooks/use-tipc'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx'
import { ValidatedProject } from '../../../../shared/types'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/projects/')({
  component: ProjectsIndex,
  beforeLoad: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    breadcrumb: (_params) => {
      return 'Projects'
    }
  })
})

function ProjectsIndex() {
  const { paths, client } = useTipc()

  // Get all projects in the Quiqr folder
  // Example: /home/bjz/Quiqr/sites/{...directoryNames}
  const projects = client.getActiveProjects.useQuery(
    { path: paths.quiqrHome },
    {
      enabled: Boolean(paths.quiqrHome)
    }
  )

  // For each project, get and validate configs
  const projectConfigs = projects?.data?.map((project) => {
    return client.loadAndValidateConfigs.useQuery(
      { projectPath: paths.quiqrHome, projectName: project.dirName },
      {
        enabled: Boolean(paths.quiqrHome) && project.dirName !== ''
      }
    )
  })

  return (
    <>
      <h1>Your Projects</h1>
      <p className="mb-6">All sites on this computer</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.isLoading && (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        )}

        {projectConfigs &&
          projectConfigs.map((project, index) =>
            project.data ? (
              <ProjectCard project={project?.data} key={project.data.projectName} />
            ) : (
              <ProjectCardSkeleton key={`${index}-projectname`} />
            )
          )}

        <NewProjectCard />
      </div>

      {projects.error && <p className="text-red-500">Error: {projects.error.message}</p>}
    </>
  )
}

const ProjectCardSkeleton = () => {
  return (
    <Skeleton className="aspect-video w-full p-4 space-y-4 flex flex-col">
      <Skeleton className="w-36 h-4 bg-white bg-blend-lighten" />
      <Skeleton className="w-48 h-4 bg-white bg-blend-lighten" />
      <Skeleton className="w-36 h-8 bg-white bg-blend-lighten mt-auto ml-auto" />
    </Skeleton>
  )
}

const ProjectCard = ({ project }: { project: ValidatedProject }) => {
  return (
    <Card
      className={clsx(
        'py-4 shadow-none border-red-600 aspect-video',
        project.isValid && 'border-green-600'
      )}
    >
      <CardHeader className="px-4">
        <CardDescription className="flex items-center mb-4">
          <Badge variant={'secondary'}>
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${project.isValid ? 'bg-green-600' : 'bg-red-600'}`}
            ></span>
            <span>{project.isValid ? 'Valid configuration' : 'Configuration issues'}</span>
          </Badge>
        </CardDescription>
        <CardTitle>{project.projectName}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-end px-4 mt-auto">
        <Button asChild>
          <Link to={`/projects/$projectId`} params={{ projectId: project.projectName }}>
            Open project
            <ArrowRightIcon />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const NewProjectCard = () => {
  return (
    <Card className="py-4 shadow-none aspect-video">
      <CardContent className="h-full px-4">
        <Button asChild variant={'ghost'} className="w-full h-full font-bold text-lg">
          <Link to={`/projects/create`}>
            New project
            <PlusIcon />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
