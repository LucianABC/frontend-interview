import { useEffect, useState } from 'react'
import './App.scss'
import { getLists } from './api/list'
import TodoList from './components/TodoList/TodoList'
import { useTheme } from './context/ThemeContext'
import { TodoListI } from './types/TodoList'
import Brightness from './assets/brightness.svg?react'
import NewFile from './assets/new-file.svg?react'
import Modal from './components/Modal/Modal'
import { createList } from './api/list';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [lists, setLists] = useState<TodoListI[]>([])
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    async function loadData() {
      const response = await getLists();
      setLists(response)
    }
    loadData()
  }, [])


  const handleCreateList = async () => {
   await createList({ name: newListName }).then(newList => {
      setLists(prev => [...prev, newList]);
      setShowCreateListDialog(false);
      setNewListName('');
    })
  }
  return (
    <>
      <header>
        <button className='new-list-btn' onClick={() => setShowCreateListDialog(true)}>
          <NewFile height={40} width={40} />
          <h2>Create list</h2>
        </button>
        <label className='switch'>
          <input
            type="checkbox"
            onChange={toggleTheme}
            checked={theme === 'dark'}
          />
          <span className="slider">
            <span className="circle"></span>
          </span>
          <Brightness height={28} width={28} />
        </label>
      </header>
      <main>
        <section className="lists-grid">
          {lists.length > 0 && lists.map(list => (
            <div key={list.id}>
              <TodoList key={list.id} todoList={list} />
            </div>
          ))}
        </section>
        {showCreateListDialog && (<Modal isOpen={showCreateListDialog} submitEnabled={newListName.trim() !== ''} onSubmit={handleCreateList} onClose={() => setShowCreateListDialog(false)} title="Create new list">
          <div className='field'>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name='name'
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              required
            />
          </div>
        </Modal>)}
      </main>

    </>
  )
}

export default App
