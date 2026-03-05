import './App.scss'
import { useEffect, useState } from 'react'
import { getLists } from './api/list'
import { useLists } from './context/ListsContext'
import { createList } from './api/list';
import TodoList from './components/TodoList/TodoList'
import Modal from './components/Modal/Modal'
import Header from './components/Header/Header'
import { DndContext } from '@dnd-kit/core';

function App() {
  const { lists, setLists } = useLists();
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log('Drag ended', { active, over });

  }
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <>
        <Header setShowCreateListDialog={setShowCreateListDialog} />
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
    </DndContext>
  )
}

export default App
