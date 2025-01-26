import type {
  TodoDetailResponseSchema,
  TodoUpdateRequestSchema,
} from '@workspace/core/apis/todo.api'
import type { Route } from './+types/todo.page'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { Navbar } from '@/core/components/navbar/navbar'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { queryClient } from '@/core/providers/query/client'
import { http } from '@/core/services/http.service'
import { checkAuthUser } from '@/core/utils/checker.util'
import { useTodoDetail } from '@/todo/hooks/use-todo-detail.hook'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  todoKeys,
  todoRepositories,
  todoUpdateRequestSchema,
} from '@workspace/core/apis/todo.api'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from '@workspace/core/components/breadcrumbs'
import { Button } from '@workspace/core/components/button'
import { Input } from '@workspace/core/components/input'
import { useForm } from 'react-hook-form'
import {
  redirect,
  useFetcher,
  useLoaderData,
  useParams,
} from 'react-router'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().transform(value => Number(value)),
})

export async function clientAction({ request }: Route.ClientActionArgs) {
  if (request.method === 'PUT') {
    const payload = (await request.json()) as TodoUpdateRequestSchema
    await todoRepositories(http).update(payload)

    // invalidate only change the status to inactive, the cache is still there
    // `await` is the lever
    await queryClient.invalidateQueries({
      queryKey: todoKeys.all,
    })

    toast.success('Todo successfully updated')
    return redirect('/todos')
  }

  toast.warning('Not Implemented')
  return new Response('Not Implemented', { status: 501 })
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const authed = checkAuthUser()

  // redirect NOT authed user to login
  if (!authed) {
    toast.error('Unauthorized')
    return redirect('/login')
  }

  const parsedParams = paramsSchema.parse(params)
  const todoDetail = await queryClient.ensureQueryData({
    queryKey: todoKeys.detail(parsedParams.id),
    queryFn: () => todoRepositories(http).detail(parsedParams.id),
    staleTime: 1_000 * 60 * 1, // 1 min
  })

  return todoDetail
}

export default function Todo() {
  const [t] = useI18n()
  const fetcher = useFetcher()
  const { user } = useAuthUserStore()
  const initialData = useLoaderData() as TodoDetailResponseSchema
  const params = useParams()
  const parsedParams = paramsSchema.parse(params)

  // already populated in loader
  const todoDetailQuery = useTodoDetail(parsedParams.id, { initialData })

  const form = useForm<TodoUpdateRequestSchema>({
    resolver: zodResolver(todoUpdateRequestSchema),
    defaultValues: {
      id: initialData.id,
      completed: initialData.completed,
      todo: initialData.todo,
    },
  })

  return (
    <>
      <Navbar />

      <main className="container mx-auto flex flex-col items-center py-5 duration-300">
        <section className="mb-10 flex w-full flex-col space-y-2">
          <Breadcrumbs>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/todos">Todos</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{parsedParams.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumbs>

          <h1 className="text-3xl font-medium sm:text-4xl">
            {t('xDetail', { feature: 'Todo' })}
          </h1>
        </section>

        <form
          className="flex w-full items-center gap-x-2"
          onSubmit={form.handleSubmit((values) => {
          // prohibit unauthorized user submit (e.g. when clicking Enter in input)
            if (todoDetailQuery.data?.userId !== user?.id)
              return

            fetcher.submit(values, {
              method: 'PUT',
              encType: 'application/json',
            })
          })}
        >
          {match(todoDetailQuery)
            .with({ isError: true }, () => (
              <div
                aria-label="Todo detail query error"
                className="alert alert-error mt-2 shadow-lg"
              >
                <div className="flex items-center">
                  <span>
                    {t('error', { module: 'Todos' })}
                    :
                  </span>
                  <pre>{JSON.stringify(todoDetailQuery.error, null, 2)}</pre>
                </div>
              </div>
            ))
            .with({ isSuccess: true }, ({ data }) => (
              <>
                <Input
                  type="text"
                  className="w-10/12"
                  aria-label="todo detail input"
                  {...form.register('todo', { required: true })}
                />

                {user?.id === data.userId && (
                  <Button
                    type="submit"
                    className="w-2/12"
                    isDisabled={fetcher.state === 'submitting'}
                  >
                    {t('update')}
                  </Button>
                )}
              </>
            ))
            .otherwise(() => null)}
        </form>
      </main>
    </>
  )
}
