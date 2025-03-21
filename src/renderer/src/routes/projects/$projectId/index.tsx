import { createFileRoute } from '@tanstack/react-router'
import { useCurrentProject } from '../../../context/TipcContext'

export const Route = createFileRoute('/projects/$projectId/')({
  component: ProjectDetail,
  beforeLoad: () => ({
    breadcrumb: (params) => params.projectId
  })
})

function ProjectDetail() {
  const { data: projectData } = useCurrentProject()

  if (!projectData) {
    return <div>Loading....</div>
  }

  return (
    <>
      <h1>Project: {projectData?.projectName}</h1>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <div>
          <h2>Collections config</h2>
          <code className="select-auto whitespace-pre-wrap break-words">
            {JSON.stringify(projectData.collectionsConfig)}
          </code>
        </div>
        <div>
          <h2>Singles config</h2>
          <code className="select-auto whitespace-pre-wrap break-words">
            {JSON.stringify(projectData.singlesConfig)}
          </code>
        </div>
      </div>
    </>
  )
}
