'use client'

import type {
  AutocompleteProps,
  CollectionRenderer,
  MenuProps,
  MenuTriggerProps,
  SearchFieldProps,
} from 'react-aria-components'
import type { MenuSectionProps } from '@/core/components/ui/menu'
import { Icon } from '@iconify/react'
import { createContext, use, useEffect } from 'react'
import {
  Autocomplete,
  Button,
  Collection,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  Dialog,
  Header,
  Input,
  Menu as MenuPrimitive,
  MenuSection,
  Modal,
  ModalContext,
  ModalOverlay,
  OverlayTriggerStateContext,
  SearchField,
  useFilter,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { DropdownKeyboard } from '@/core/components/ui/dropdown'
import { Loader } from '@/core/components/ui/loader'
import { Menu } from '@/core/components/ui/menu'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

interface CommandMenuProviderProps {
  isPending?: boolean
  escapeButton?: boolean
}

const CommandMenuContext = createContext<CommandMenuProviderProps | undefined>(undefined)

const renderer: CollectionRenderer = {
  CollectionRoot(props) {
    if (props.collection.size === 0) {
      return (
        <div className="col-span-full p-4 text-center text-sm text-muted-fg">No results found.</div>
      )
    }
    return <DefaultCollectionRenderer.CollectionRoot {...props} />
  },
  CollectionBranch: DefaultCollectionRenderer.CollectionBranch,
}

function useCommandMenu() {
  const context = use(CommandMenuContext)

  if (!context) {
    throw new Error('useCommandMenu must be used within a <CommandMenuProvider />')
  }

  return context
}

interface CommandMenuProps extends AutocompleteProps, MenuTriggerProps, CommandMenuProviderProps {
  'isDismissable'?: boolean
  'aria-label'?: string
  'shortcut'?: string
  'isBlurred'?: boolean
  'className'?: string
}

function CommandMenu({
  onOpenChange,
  className,
  isDismissable = true,
  escapeButton = true,
  isPending,
  isBlurred,
  shortcut,
  ...props
}: CommandMenuProps) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const filter = (textValue: string, inputValue: string) => contains(textValue, inputValue)
  useEffect(() => {
    if (!shortcut)
      return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcut && (e.metaKey || e.ctrlKey)) {
        onOpenChange?.(true)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shortcut, onOpenChange])
  return (
    <CommandMenuContext value={{ isPending, escapeButton }}>
      <ModalContext value={{ isOpen: props.isOpen, onOpenChange }}>
        <ModalOverlay
          isDismissable={isDismissable}
          className={twMerge([
            `
              fixed inset-0 z-50 max-h-(--visual-viewport-height) bg-black/15
              dark:bg-black/40
            `,
            `
              entering:animate-in entering:fade-in
              exiting:animate-in exiting:fade-out
            `,
            isBlurred && props.isOpen ? 'backdrop-blur' : '',
          ])}
        >
          <Modal
            className={twMerge([
              `
                fixed top-auto bottom-0 left-[50%] z-50 grid h-[calc(100vh-30%)]
                w-full max-w-full translate-x-[-50%] gap-4 overflow-hidden
                rounded-t-2xl bg-overlay text-overlay-fg shadow-lg ring-1
                ring-fg/10
                sm:top-[6rem] sm:bottom-auto sm:h-auto sm:w-full sm:max-w-xl
                sm:rounded-xl
                dark:ring-border
                forced-colors:border
              `,
              `
                entering:animate-in entering:duration-300 entering:fade-in-0
                entering:slide-in-from-bottom
                sm:entering:duration-300 sm:entering:slide-in-from-bottom-0
                sm:entering:zoom-in-95
              `,
              `
                exiting:animate-out exiting:duration-200 exiting:fade-out
                exiting:slide-out-to-bottom-56
                sm:exiting:slide-out-to-bottom-0 sm:exiting:zoom-out-95
              `,
              className,
            ])}
            {...props}
          >
            <Dialog
              aria-label={props['aria-label'] ?? 'Command Menu'}
              className={`
                flex max-h-[inherit] flex-col overflow-hidden outline-hidden
              `}
            >
              <Autocomplete filter={filter} {...props} />
            </Dialog>
          </Modal>
        </ModalOverlay>
      </ModalContext>
    </CommandMenuContext>
  )
}

interface CommandMenuSearchProps extends SearchFieldProps {
  placeholder?: string
  className?: string
}

function CommandMenuSearch({ className, placeholder, ...props }: CommandMenuSearchProps) {
  const state = use(OverlayTriggerStateContext)!
  const { isPending, escapeButton } = useCommandMenu()
  return (
    <SearchField
      aria-label="Quick search"
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      className={composeTailwindRenderProps(
        className,
        'flex w-full items-center border-b px-2.5 py-1',
      )}
      {...props}
    >
      {isPending
        ? (
            <Loader className="size-4.5" variant="spin" />
          )
        : (
            <Icon
              icon="lucide:search"
              data-slot="command-menu-search-icon"
              className="size-5 shrink-0 text-muted-fg"
            />
          )}
      <Input
        placeholder={placeholder ?? 'Search...'}
        className={`
          w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-fg
          placeholder-muted-fg outline-hidden
          focus:outline-hidden
          sm:px-2 sm:py-1.5 sm:text-sm
          [&::-ms-reveal]:hidden [&::-webkit-search-cancel-button]:hidden
        `}
      />
      {escapeButton && (
        <Button
          onPress={() => state?.close()}
          className={`
            hidden cursor-default rounded border text-current/90
            hover:bg-muted
            lg:inline lg:px-1.5 lg:py-0.5 lg:text-xs
          `}
        >
          Esc
        </Button>
      )}
    </SearchField>
  )
}

function CommandMenuList<T extends object>({ className, ...props }: MenuProps<T>) {
  return (
    <CollectionRendererContext value={renderer}>
      <MenuPrimitive
        className={composeTailwindRenderProps(
          className,
          'grid max-h-full flex-1 grid-cols-[auto_1fr] content-start overflow-y-auto p-2 sm:max-h-110 *:[[role=group]]:mb-6 *:[[role=group]]:last:mb-0',
        )}
        {...props}
      />
    </CollectionRendererContext>
  )
}

function CommandMenuSection<T extends object>({
  className,
  ref,
  ...props
}: MenuSectionProps<T>) {
  return (
    <MenuSection
      ref={ref}
      className={twMerge(
        `
          col-span-full grid grid-cols-[auto_1fr] content-start
          gap-y-[calc(var(--spacing)*0.25)]
        `,
        className,
      )}
      {...props}
    >
      {'title' in props && (
        <Header className={`
          col-span-full mb-1 block min-w-(--trigger-width) truncate px-2.5
          text-xs text-muted-fg
        `}
        >
          {props.title}
        </Header>
      )}
      <Collection items={props.items}>{props.children}</Collection>
    </MenuSection>
  )
}

function CommandMenuItem({ className, ...props }: React.ComponentProps<typeof Menu.Item>) {
  const textValue
    = props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <Menu.Item
      {...props}
      textValue={textValue}
      className={composeTailwindRenderProps(className, 'items-center gap-y-0.5')}
    />
  )
}

interface CommandMenuDescriptionProps extends React.ComponentProps<typeof Menu.Description> {}

function CommandMenuDescription({ className, ...props }: CommandMenuDescriptionProps) {
  return (
    <Menu.Description
      className={twMerge(
        `
          col-start-2 row-start-2
          sm:col-start-3 sm:row-start-1 sm:ml-auto
        `,
        className,
      )}
      {...props}
    />
  )
}

function CommandMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={twMerge('-mx-2', className)} {...props} />
}

function CommandMenuFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={twMerge(
        'col-span-full flex-none border-t px-2 py-1.5 text-sm text-muted-fg',
        `
          *:[kbd]:mx-1 *:[kbd]:inline-grid *:[kbd]:h-4 *:[kbd]:min-w-4
          *:[kbd]:place-content-center *:[kbd]:rounded-xs *:[kbd]:bg-secondary
          *:[kbd]:inset-ring *:[kbd]:inset-ring-fg/10
        `,
        className,
      )}
      {...props}
    />
  )
}

const CommandMenuLabel = Menu.Label
const CommandMenuKeyboard = DropdownKeyboard

CommandMenu.Search = CommandMenuSearch
CommandMenu.List = CommandMenuList
CommandMenu.Item = CommandMenuItem
CommandMenu.Label = CommandMenuLabel
CommandMenu.Section = CommandMenuSection
CommandMenu.Description = CommandMenuDescription
CommandMenu.Keyboard = CommandMenuKeyboard
CommandMenu.Separator = CommandMenuSeparator
CommandMenu.Footer = CommandMenuFooter

export type { CommandMenuDescriptionProps, CommandMenuProps, CommandMenuSearchProps }
export { CommandMenu }
