import './App.scss'
import { useMemo, useState } from 'react'
import { useLists } from './context/ListsContext'
import TodoList from './components/TodoList/TodoList'
import Modal from './components/Modal/Modal'
import Header from './components/Header/Header'

function App() {
  const { lists, createList, searchResult, clearSearch } = useLists();
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = async () => {
    await createList({ name: newListName }).then(newList => {
      setShowCreateListDialog(false);
      setNewListName('');
    })
  }

  const noRecords = searchResult === null || !lists || lists.length === 0;

  const noResults = (!lists || lists.length === 0) ? (<h2 onClick={() => setShowCreateListDialog(true)}>No lists available. Try <a>creating</a> one.</h2>) : (<h2>No results. <a onClick={clearSearch}>Clear search </a>or try a different ID.</h2>)

  const cards = useMemo(() => {
    if (searchResult === undefined) {
      return lists
    }
    return searchResult
  }, [lists, searchResult])

  return (
    <>
      <Header setShowCreateListDialog={setShowCreateListDialog} />
      <main>
        <section className="lists-grid">
          {noRecords ? noResults : (cards?.map(list => (
            <div key={list.id}>
              <TodoList key={list.id} listId={list.id} />
            </div>
          )))}
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
