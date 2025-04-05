import { createFileRoute, Link } from '@tanstack/react-router'
import { useCurrentProject } from '@/lib/hooks/use-current-project'
import { useTipc } from '@/lib/hooks/use-tipc'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../../components/ui/table'
import { Route as CollectionConfigRoute } from './$collectionConfig'

export const Route = createFileRoute('/projects/$projectId/$menuSection/$menuItem/')({
  component: RouteComponent,
  beforeLoad: () => ({
    breadcrumb: (routeParams) => routeParams.menuItem
  })
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { client, getCurrentProjectParams } = useTipc()
  const { projectName, projectPath } = getCurrentProjectParams()

  const { menuItem, menuSection } = Route.useParams()

  const configFromSingles = currentProject?.indexedSingles[menuItem]
  const configFromCollections = currentProject?.indexedCollections[menuItem]

  // Determine which config to use
  const config = configFromSingles || configFromCollections

  if (!config) {
    return <div>Config for key {menuItem} not found in sinlges or collections.</div>
  }

  if (!config.fields) {
    return <div>No fields to display in this config.</div>
  }

  /**
   * we can not put the hook useQuery in an if statement
   * because conditional hooks are not allowed in React.
   * We circumvent this by conditionally executing the query.
   * @see https://react.dev/reference/rules/rules-of-hooks
   */
  const folder = 'folder' in config ? config.folder : ''
  console.log(menuItem, menuSection, folder)
  const { data } = client.listDataDirectory.useQuery(
    {
      projectPath,
      projectName,
      contentDirPath: folder
    },
    {
      enabled: folder != ''
    }
  )

  // if there is no data, this is a singles config, not a collection
  if (!data) {
    return (
      <pre className="select-all whitespace-pre-wrap break-words user-select-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
    )
  }

  console.log(data)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">File name</TableHead>
            <TableHead className="font-bold">Path</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((collectionEntry, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Link
                  className="w-full h-full"
                  to={CollectionConfigRoute.to}
                  params={{
                    projectId: projectName,
                    menuSection,
                    menuItem,
                    collectionConfig: collectionEntry.name
                  }}
                >
                  {collectionEntry.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  className="w-min truncate overflow-x-hidden"
                  to={CollectionConfigRoute.to}
                  params={{
                    projectId: projectName,
                    menuSection,
                    menuItem,
                    collectionConfig: collectionEntry.name
                  }}
                >
                  {collectionEntry.path}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <pre className="select-all whitespace-pre-wrap break-words user-select-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  )
}
