import * as React from 'react'

import { SearchForm } from '@/components/search-form'
import { ProjectSwitcher } from '@/components/project-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { Link, useRouter } from '@tanstack/react-router'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { useCurrentProject } from '@/lib/hooks/use-current-project'
import { getMenuItemTitle } from '../../../shared/types/config-loader'
import { Alert, AlertTitle, AlertDescription } from './ui/alert'
import { ModeToggle } from './theme-toggle'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const activePath = router.state.location.pathname
  const { data: currentProject } = useCurrentProject()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {currentProject?.menuConfig?.map((menuSection) => (
            <Collapsible defaultOpen key={menuSection.title} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel>
                    {menuSection.title}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {menuSection.menuItems.map((item) => {
                      const url = `/projects/${currentProject.projectName}/${menuSection.title}/${item.key}/`
                      const menuItemTitle = getMenuItemTitle(
                        item,
                        currentProject.indexedSingles,
                        currentProject.indexedCollections
                      )
                      return menuItemTitle ? (
                        <SidebarMenuSubItem key={item.key}>
                          <SidebarMenuButton asChild isActive={url === activePath}>
                            <Link to={url}>{menuItemTitle}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ) : (
                        <MenuItemMissingError
                          errorMessage={currentProject.errors[item.key] || item.key}
                          key={item.key}
                        />
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const MenuItemMissingError = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
