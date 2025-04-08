import { Field, GrayMatterParseResult } from '../../../shared/schemas'

// This type represents a function that returns a Promise resolving to a component
// The component expects a field of type T
export type TypedFieldImporter<T extends Field = Field> = () => Promise<{
  default: React.ComponentType<{
    field: T
    data: GrayMatterParseResult | undefined
    [key: string]: unknown
  }>
}>

// Enhance the existing FieldImporter type to work with the Field type
export type FieldImporter = TypedFieldImporter<Field>

class FieldRegistry {
  private components: Record<string, FieldImporter>

  public constructor() {
    this.components = {
      markdown: () => import('./components/MarkdownField'),
      notFound: () => import('./components/NotFoundField'),
      string: () => import('./components/StringField'),
      boolean: () => import('./components/SwitchField')
    }
  }

  /**
   * Register a new field type
   * @param type Field type identifier
   * @param componentImporter Function that imports the field component
   * @returns The registry instance for chaining
   */
  public register(type: string, componentImporter: FieldImporter): FieldRegistry {
    if (this.components[type]) {
      console.warn(`Field type "${type}" is being overridden`)
    }
    this.components[type] = componentImporter
    return this
  }

  /**
   * Type-safe register method for core field types
   * @param type Field type literal
   * @param componentImporter Function that imports the field component
   * @returns The registry instance for chaining
   */
  public registerCore<T extends Field>(
    type: T['type'],
    componentImporter: TypedFieldImporter<T>
  ): FieldRegistry {
    // We can safely cast here because TypedFieldImporter<T> is compatible with FieldImporter
    return this.register(type, componentImporter as FieldImporter)
  }

  /**
   * Get a component importer for a field type
   * @param type Field type identifier
   * @returns Component importer function
   */
  public getComponent(type: string): FieldImporter {
    return this.components[type] || this.components['notFound']
  }

  /**
   * Get a component importer with proper typing for a known field type
   * @param type Field type literal
   * @returns Component importer function with proper type
   */
  public getTypedComponent<T extends Field>(type: T['type']): TypedFieldImporter<T> {
    // Cast is safe if consumers use the correct type
    return this.getComponent(type) as TypedFieldImporter<T>
  }

  /**
   * Check if a field type is registered
   * @param type Field type identifier
   * @returns Boolean indicating if the field type is registered
   */
  public hasComponent(type: string): boolean {
    return !!this.components[type]
  }

  /**
   * Get all registered field types
   * @returns Array of registered field type names
   */
  public getRegisteredTypes(): string[] {
    return Object.keys(this.components)
  }
}

// Create and export a singleton instance
export const fieldRegistry = new FieldRegistry()

/**
 * Convenience function for registering field types
 * @param type Field type identifier
 * @param componentImporter Function that imports the field component
 * @returns The registry instance for chaining
 */
export function registerField(type: string, componentImporter: FieldImporter): FieldRegistry {
  return fieldRegistry.register(type, componentImporter)
}

/**
 * Convenience function for registering core field types with type safety
 * @param type Field type literal
 * @param componentImporter Function that imports the field component
 * @returns The registry instance for chaining
 */
export function registerCoreField<T extends Field>(
  type: T['type'],
  componentImporter: TypedFieldImporter<T>
): FieldRegistry {
  return fieldRegistry.registerCore(type, componentImporter)
}
