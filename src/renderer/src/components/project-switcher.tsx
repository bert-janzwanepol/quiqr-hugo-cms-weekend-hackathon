// TODO:
// Known issue: menu config will not load if we use the project switcher
//              *before* we have visited /projects, the menu config is undefined
import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useTipc } from '@/lib/hooks/use-tipc'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

const ProjectSwitcherSkeleton = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4 opacity-50" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none w-full">
            <div className="h-4 w-24 bg-sidebar-accent rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-sidebar-accent rounded mt-1 animate-pulse"></div>
          </div>
          <ChevronsUpDown className="ml-auto opacity-50" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function ProjectSwitcher() {
  const { paths, client, getCurrentProjectName, openProject } = useTipc()
  const router = useRouter()
  const {
    data: projects,
    isLoading,
    isFetching,
    isError,
    error
  } = client.getActiveProjects.useQuery(
    { path: paths.quiqrHome },
    {
      enabled: Boolean(paths.quiqrHome)
    }
  )

  const currentProjectName = getCurrentProjectName()

  // Only redirect if we have projects and no project has been selected yet
  useEffect(() => {
    if (projects?.length && !currentProjectName && router?.state) {
      const isOnProjectPage = router.state.matches.some(
        (match) => match.routeId === '/projects/$projectId'
      )
      if (isOnProjectPage) {
        openProject(projects[0].dirName)
      }
    }
  }, [projects, currentProjectName, openProject, router?.state])

  if (isLoading || isFetching) {
    return <ProjectSwitcherSkeleton />
  }

  if (isError) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="text-sidebar-destructive">
            <div className="bg-sidebar-destructive/10 text-sidebar-destructive flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">Error Loading Projects</span>
              <span className="text-xs">{error?.message || 'Try refreshing'}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!projects?.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">No Projects Found</span>
              <span className="text-xs">Create a new project</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Current Quiqr Site</span>
                <span className="">{currentProjectName || 'No project selected'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            {projects?.map((project) => (
              <DropdownMenuItem key={project.dirName} onSelect={() => openProject(project.dirName)}>
                {project.dirName}{' '}
                {project.dirName === currentProjectName && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
