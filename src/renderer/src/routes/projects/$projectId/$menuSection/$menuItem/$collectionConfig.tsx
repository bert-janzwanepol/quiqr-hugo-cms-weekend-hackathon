import { createFileRoute } from '@tanstack/react-router'
import FieldRenderer from '@/registry/FieldRenderer'
import { useCurrentProject } from '@/lib/hooks/use-current-project'
import {
  CollectionConfigValue,
  isCollectionConfig,
  isSingleConfig,
  SingleConfigValue
} from '../../../../../../../shared/types'
import { z } from 'zod'
import { fieldSchema } from '../../../../../../../shared/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '../../../../../components/ui/button'
import useCollectionData from '../../../../../lib/hooks/use-collection-data'
import useSingleData from '../../../../../lib/hooks/use-single-data'
import ConfigViewer from '../../../../../components/config-viewer'

export const Route = createFileRoute(
  '/projects/$projectId/$menuSection/$menuItem/$collectionConfig'
)({
  component: RouteComponent
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { menuItem } = Route.useParams()

  const config = currentProject?.indexedCollections[menuItem]

  if (!config) {
    return <div className="text-red-500">No collection config found for item {menuItem}</div>
  }

  return <ConfigForm config={config} />
}

export const ConfigForm = ({ config }: { config: CollectionConfigValue | SingleConfigValue }) => {
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: config['fields']
  })

  // TODO: move this to context probably so we don't have to prop drill
  const collectionData = useCollectionData()
  let filepath = ''
  if (isSingleConfig(config)) {
    filepath = config.file
  }
  const singleData = useSingleData({ filename: filepath })
  let data = collectionData
  if (!isCollectionConfig(config) && isSingleConfig(config)) {
    data = singleData
  }

  if (!data) {
    return (
      <div className="text-red-500">
        No data found for config
        <ConfigViewer config={filepath} />
      </div>
    )
  }

  function onSubmit(values: z.infer<typeof fieldSchema>) {
    console.log(values)
  }

  return (
    <div className="max-w-[65ch]">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit(onSubmit)
          }}
          className="space-y-8"
        >
          {config?.fields?.map((configField) => (
            <FormField
              key={`${configField.key}-${configField.type}`}
              control={form.control}
              name="username"
              render={() => (
                <FormItem>
                  <FormLabel>{configField.title || configField.key}</FormLabel>
                  <FormControl>
                    <FieldRenderer field={configField} data={data} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <div className="flex gap-8">
        {/* <ConfigViewer config={config} /> */}
        <ConfigViewer config={data} />
      </div>
    </div>
  )
}
