import type { TodoListResponseSchema, TodoSchema } from '@workspace/core/apis/todo.api'
import type { Route } from './+types/todos.page'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { Navbar } from '@/core/components/navbar/navbar'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { queryClient } from '@/core/providers/query/client'
import { http } from '@/core/services/http.service'
import { checkAuthUser } from '@/core/utils/checker.util'
import { todosDefaults } from '@/todo/constants/todos.constant'
import { useTodoCreateOptimistic } from '@/todo/hooks/use-todo-create.hook'
import { useTodoDeleteOptimistic } from '@/todo/hooks/use-todo-delete.hook'
import { useTodoList } from '@/todo/hooks/use-todo-list.hook'
import { useTodoUpdateOptimistic } from '@/todo/hooks/use-todo-update.hook'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import { resourceListRequestSchema } from '@workspace/core/apis/core.api'
import { todoKeys, todoRepositories, todoSchema } from '@workspace/core/apis/todo.api'
import { Button } from '@workspace/core/components/button'
import { Checkbox } from '@workspace/core/components/checkbox'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@workspace/core/components/dialog'
import { Input } from '@workspace/core/components/input'
import { Label } from '@workspace/core/components/label'
import { Link } from '@workspace/core/components/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '@workspace/core/components/select'
import { random } from 'radashi'
import { GridList, GridListItem } from 'react-aria-components'
import { useForm } from 'react-hook-form'
import {
  redirect,
  useBlocker,
  useHref,
  useLoaderData,
  useSearchParams,
} from 'react-router'
import { toast } from 'sonner'
import { twJoin } from 'tailwind-merge'
import { match } from 'ts-pattern'
import { z } from 'zod'

/**
 * to avoid showing an error to the user because we use `catch` if a search parameter is malformed
 */
const searchParamsSchema = resourceListRequestSchema
  .pick({ select: true })
  .extend({
    limit: z
      .string()
      .optional()
      .default(todosDefaults.limit.toString())
      .catch(todosDefaults.limit.toString())
      .transform(value => Number(value)),
    skip: z
      .string()
      .optional()
      .default(todosDefaults.skip.toString())
      .catch(todosDefaults.skip.toString())
      .transform(value => Number(value)),
  })

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const authed = checkAuthUser()

  // redirect NOT authed user to login
  if (!authed) {
    toast.error('Unauthorized')
    return redirect('/login')
  }

  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams)
  const parsedSearchParams = searchParamsSchema.parse(searchParams)

  const todos = await queryClient.ensureQueryData({
    queryKey: todoKeys.list(parsedSearchParams),
    queryFn: () => todoRepositories(http).list(parsedSearchParams),
    staleTime: 1_000 * 60 * 1, // 1 min
  })

  return todos
}

export default function Todos() {
  const [t] = useI18n()

  return (
    <>
      <Navbar />

      <main className="container mx-auto flex flex-col py-5 duration-300">
        <h1 className="text-3xl font-medium sm:text-4xl">
          {t('xList', { feature: 'Todo' })}
        </h1>

        <section className="w-full pt-5">
          <TodosCreate />
          <TodosFilter />
          <TodosList />
        </section>
      </main>
    </>
  )
}

function TodosCreate() {
  const [t] = useI18n()
  const { user } = useAuthUserStore()
  const [searchParams] = useSearchParams()
  const parsedSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams),
  )

  const form = useForm<TodoSchema>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      id: 1, // we override it later on `onSubmit`
      todo: '',
      userId: 1,
      completed: false,
    },
  })

  const todoCreateOptimistic = useTodoCreateOptimistic(parsedSearchParams, {
    onSettled: () => {
      // reset form
      form.reset()
    },
  })

  // block navigating when input has been entered, but not submitted
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.watch('todo') !== ''
      && currentLocation.pathname !== nextLocation.pathname,
  )

  return (
    <>
      <DialogTrigger isOpen={blocker.state === 'blocked'}>
        <DialogOverlay isDismissable={false}>
          <DialogContent
            role="alertdialog"
            closeButton={false}
            isDismissable={false}
          >
            <DialogHeader>
              <DialogTitle>{t('attention')}</DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground text-sm">
              {t('unsavedChanges')}
            </p>

            <DialogFooter>
              <Button
                variant="outline"
                className="mt-2 sm:mt-0"
                onPress={blocker.reset}
              >
                Cancel
              </Button>
              <Button variant="destructive" onPress={blocker.proceed}>
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogOverlay>
      </DialogTrigger>

      <form
        className="mb-3 flex w-full flex-col duration-300 lg:flex-row"
        onSubmit={form.handleSubmit((values) => {
          const payload = {
            ...values,
            userId: user?.id ?? 1,
            id: random(11, 999_999), // generate different id everytime
          }

          todoCreateOptimistic.mutate(payload)
        })}
      >
        <Input
          type="text"
          className="w-full lg:w-10/12"
          placeholder={t('todoPlaceholder')}
          {...form.register('todo', { required: true, minLength: 3 })}
        />

        <Button
          type="submit"
          className="ml-0 mt-2 w-full normal-case lg:ml-2 lg:mt-0 lg:w-2/12"
          isDisabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          {t('add')}
        </Button>
      </form>
    </>
  )
}

function TodosFilter() {
  const [t] = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams),
  )

  const items = todosDefaults.limits.map(limit => ({ id: limit }))

  return (
    <form className="w-full pb-3">
      <Select
        aria-label="todo list limit selection"
        selectedKey={parsedSearchParams.limit.toString()}
        onSelectionChange={(selected) => {
          // set to url params
          searchParams.set('limit', selected as string)
          setSearchParams(searchParams)
        }}
      >
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <Label>{t('limit')}</Label>

        <SelectTrigger className="w-[160px]">
          <SelectValue>{({ selectedText }) => selectedText}</SelectValue>
        </SelectTrigger>

        <SelectPopover>
          <SelectContent aria-label="limits" items={items}>
            {({ id }) => <SelectItem textValue={id}>{id}</SelectItem>}
          </SelectContent>
        </SelectPopover>
      </Select>
    </form>
  )
}

function TodosList() {
  const [t] = useI18n()
  const initialData = useLoaderData() as TodoListResponseSchema
  const [searchParams] = useSearchParams()
  const parsedSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams),
  )

  const todoListQuery = useTodoList(parsedSearchParams, { initialData })

  return (
    <>
      {match(todoListQuery)
        .with({ isFetching: true }, { isLoading: true }, () => (
          <div
            aria-label="Todo list query loading spinner"
            className="flex items-center justify-center py-5"
          >
            <Icon
              icon="svg-spinners:3-dots-fade"
              height="5em"
              className="text-primary"
            />
          </div>
        ))
        .with({ isError: true }, ({ error }) => (
          <div
            aria-label="Todo list query error"
            className="bg-destructive mt-2 flex w-full items-center gap-x-3 rounded-md p-2 shadow-md"
          >
            <Icon icon="lucide:alert-circle" />

            <span className="flex flex-col">
              <p className="">
                {t('error', { module: 'Todos' })}
                :
              </p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </span>
          </div>
        ))
        .with({ isSuccess: true }, ({ data }) => (
          <GridList
            aria-label="Todo grid list with multiple checkbox selection and toggle behavior"
            selectionMode="multiple"
            selectionBehavior="toggle"
            items={data.todos}
            renderEmptyState={() => (
              <h2 className="flex items-center justify-center py-5">
                {t('empty')}
              </h2>
            )}
          >
            {todo => <TodosListItem todo={todo} />}
          </GridList>
        ))
        .otherwise(() => null)}
    </>
  )
}

function TodosListItem({ todo }: { todo: TodoSchema }) {
  const { user } = useAuthUserStore()
  const href = useHref(todo.id.toString(), { relative: 'path' })
  const [searchParams] = useSearchParams()
  const parsedSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams),
  )

  const todoUpdateOptimistic = useTodoUpdateOptimistic(parsedSearchParams)
  const todoDeleteOptimistic = useTodoDeleteOptimistic(parsedSearchParams)

  return (
    <GridListItem
      className="animate-in slide-in-from-left-5 mb-2 flex items-center justify-between duration-300 ease-in-out"
      textValue={todo.todo}
    >
      <Checkbox
        slot="selection"
        id={`todo-${todo.id}-checkbox`}
        name={`todo-${todo.id}-checkbox`}
        isSelected={todo.completed}
        onChange={() => {
          todoUpdateOptimistic.mutate({ ...todo, completed: !todo.completed })
        }}
      />

      <Link
        href={href}
        className={twJoin(
          'w-full justify-start text-lg text-current hover:font-bold',
          todo.completed && 'line-through hover:line-through',
        )}
        variant="link"
      >
        {todo.todo}
      </Link>

      {user?.id === todo.userId && (
        <Button
          data-testid="todo-delete"
          type="submit"
          size="xs"
          variant="destructive"
          onPress={() => {
            todoDeleteOptimistic.mutate(todo.id)
          }}
        >
          <Icon icon="lucide:trash-2" />
        </Button>
      )}
    </GridListItem>
  )
}
