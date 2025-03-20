import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Outlet } from '@tanstack/react-router'
import { AppBreadcrumb } from './components/app-breadcrumb'

export default function Page() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="relative">
          <header className="app-region-drag sticky top-0 bg-white dark:bg-background inset-x-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 app-region-no-drag" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AppBreadcrumb />
            </div>
          </header>
          <div className=" h-full p-4 pt-0 ">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
