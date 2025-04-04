import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu'
import { Folder, File, ChevronRight } from 'lucide-react'
import { DirectoryEntry } from '../../../shared/types/config-loader'

interface DirectoryDropdownProps {
  rootEntry: DirectoryEntry
}

// Recursive component to render directory entries
const DirectoryEntryItem = ({ entry }: { entry: DirectoryEntry }) => {
  // If it's a directory with children, render as a submenu
  if (entry.isDirectory && entry.children && entry.children.length > 0) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span>{entry.name}</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {entry.children.map((childEntry) => (
              <DirectoryEntryItem key={childEntry.path} entry={childEntry} />
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    )
  }

  // If it's a file or empty directory, render as a simple item
  return (
    <DropdownMenuItem className="flex items-center gap-2">
      {entry.isDirectory ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />}
      <span>{entry.name}</span>
    </DropdownMenuItem>
  )
}

export const DirectoryDropdown: React.FC<DirectoryDropdownProps> = ({ rootEntry }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
        <Folder className="h-5 w-5" />
        <span>{rootEntry.name}</span>
        <ChevronRight className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {rootEntry.children &&
          rootEntry.children.map((entry) => <DirectoryEntryItem key={entry.path} entry={entry} />)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
