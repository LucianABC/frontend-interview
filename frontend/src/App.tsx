import { useEffect, useState } from 'react'
import { fetchData } from './api/todolist'
import './App.css'
import {TodoListI} from './types/TodoList'
import TodoList from './components/TodoList'

function App() {
  const [lists, setLists] = useState<TodoListI[]>([])

  useEffect(() => {
    async function loadData() {
      const response = await fetchData();
      setLists(response)
    }
    loadData()
  }, [])

  console.log(lists)
  return (
    <>
      <div>
      {lists.length > 0 && lists.map(list => (
        <div key={list.id}>
          <h2>{list.name}</h2>
          <ul>
            {list.todoItems.length > 0 && list.todoItems.map(todo => (
              <TodoList key={todo.id} todoList={list} />
            ))}
          </ul>
        </div>
      ))}
      </div>
    
    </>
  )
}

export default App
