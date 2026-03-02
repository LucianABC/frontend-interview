import { useEffect, useState } from 'react'
import { fetchData } from './api/todolist'
import './App.css'
import { TodoListI } from './types/TodoList'
import TodoList from './components/TodoList'
import { useTheme } from './context/ThemeContext'

function App() {
  const { theme, toggleTheme } = useTheme();
  const [lists, setLists] = useState<TodoListI[]>([])

  useEffect(() => {
    async function loadData() {
      const response = await fetchData();
      setLists(response)
    }
    loadData()
  }, [])

  return (
    <>
    <header style={{ padding: '1rem', textAlign: 'right' }}>
        <button onClick={toggleTheme} style={{ cursor: 'pointer' }}>
          Cambiar a modo {theme === 'light' ? 'oscuro' : 'claro'}
        </button>
      </header>
      <div>
        {lists.length > 0 && lists.map(list => (
          <div key={list.id}>
            <TodoList key={list.id} todoList={list} />
          </div>
        ))}
      </div>

    </>
  )
}

export default App
