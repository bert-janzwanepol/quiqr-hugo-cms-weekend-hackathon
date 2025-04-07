import { createFileRoute } from '@tanstack/react-router'
import FieldRenderer from '@/registry/FieldRenderer'
import { useCurrentProject } from '@/lib/hooks/use-current-project'
import { CollectionConfigValue } from '../../../../../../../shared/types'
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
// import { useEffect } from 'react'

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

  return (
    <div className="max-w-[65ch]">
      <CollectionForm config={config} />
    </div>
  )
}

const CollectionForm = ({ config }: { config: CollectionConfigValue }) => {
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: config['fields']
  })

  function onSubmit(values: z.infer<typeof fieldSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {config?.fields?.map((configField) => (
          <FormField
            key={`${configField.key}-${configField.type}`}
            control={form.control}
            name="username"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field }) => (
              <FormItem>
                <FormLabel>{configField.title || configField.key}</FormLabel>
                <FormControl>
                  <FieldRenderer field={configField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
