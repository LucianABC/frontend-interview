export interface TodoListI {
  id: number
  name: string
  todoItems: TodoI[]
}

export interface TodoI {
  id: number
  name: string
  done: boolean
  description: string
}