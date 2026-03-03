import { useEffect, useState } from 'react'
import './App.scss'
import { getLists } from './api/list'
import TodoList from './components/TodoList/TodoList'
import { useTheme } from './context/ThemeContext'
import { TodoListI } from './types/TodoList'

function App() {
  const { theme, toggleTheme } = useTheme();
  const [lists, setLists] = useState<TodoListI[]>([])

  useEffect(() => {
    async function loadData() {
      const response = await getLists();
      setLists(response)
    }
    loadData()
  }, [])

  return (
    <>
    <header style={{ padding: '1rem', textAlign: 'right' }}>
        <button onClick={toggleTheme} style={{ cursor: 'pointer' }}>
          Cambiar modo
        </button>
      </header>
      <main className="lists-grid">
        {lists.length > 0 && lists.map(list => (
          <div key={list.id}>
            <TodoList key={list.id} todoList={list} />
          </div>
        ))}
      </main>

    </>
  )
}

export default App
