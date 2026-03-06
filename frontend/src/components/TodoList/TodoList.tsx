import { useEffect, useRef, useState } from "react"
import { DndContext } from '@dnd-kit/core';

import { useLists } from "../../context/ListsContext";
import { SortableContext } from "@dnd-kit/sortable";
import styles from './TodoList.module.scss'
import Search from '../../assets/search.svg?react'
import Plus from '../../assets/plus-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import Times from '../../assets/times.svg?react'
import ListItem from "../ListItem/ListItem"
import Dialog from "../Dialog/Dialog"
import Check from '../../assets/check-circle.svg?react'
import InputWithButton from "../InputWithButton/InputWithButton"
import { TodoI } from "../../types/TodoList";

type InputMode = 'SEARCH' | 'ADD'

interface Props {
  listId: number;
}

const TodoList = ({ listId }: Props) => {
  const { lists, reorderItems, deleteList, updateList, createListItem, getItemById, getItemsByListId } = useLists();
  const list = lists?.find(l => l.id === listId) ?? { name: '', todoItems: [], id: Date.now() };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const actionInputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState<string>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState(list?.name ?? '');
  const [inputMode, setInputMode] = useState<InputMode>();
  const [listItems, setListItems] = useState<TodoI[]>(list.todoItems)
  const [showClearSearch, setShowClearSearch] = useState(false)

  useEffect(() => {
    if (editMode) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editMode]);

  useEffect(()=>{
    setListItems(list.todoItems)
  },[list.todoItems])


  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  }

  const handleAddTodo = async () => {
    if (!inputText) return;
    const newItem = {
      name: inputText,
      description: ''
    }
    await createListItem(listId, { ...newItem })
    setInputText('')

  }

  const handleDeleteList = () => {
    setShowConfirmDialog(true);
  }

  const handleConfirmDelete = async () => {
    await deleteList(listId).then(() => {
      console.log('List deleted successfully');
    })
    setShowConfirmDialog(false);
  }

  const handleSubmitEdit = async () => {
    await updateList(listId, { name: listName }).then(() => {
      console.log('List updated successfully');
    })
    setEditMode(false);
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeItemId = Number(active.id.split('-').pop());
      const overItemId = Number(over.id.split('-').pop());
      reorderItems(listId, activeItemId, overItemId);
    }
  }

  const handleSearchItem = async () => {
    if (!inputText) return;
    const itemId = Number(inputText)
    const result = await getItemById(listId, itemId)
    if (result) {
      setListItems([result])
      setShowClearSearch(true)
    }
    setInputText('')
  }

  const handleModeToggle = (mode: InputMode) => {
    if (inputMode === mode) {
      setInputMode(undefined);
    } else {
      setInputMode(mode);
      setInputText('');

      setTimeout(() => actionInputRef.current?.focus(), 50);
    }
  };

  const handleAction = async () => {
    console.log('actino', {inputText, inputMode})
    if (!inputText) return;

    if (inputMode === 'ADD') {
      handleAddTodo()
    } else if (inputMode === 'SEARCH') {
      handleSearchItem()
    }

    setInputText('');
    setInputMode(undefined); // Cerramos después de la acción
  };
  const handleClearSearch = () => {
    setListItems(list.todoItems)
    setShowClearSearch(false)
  }
  const sortableItems = listItems.map(t => `${listId}-${t.id}`);
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={sortableItems}>
        <div className={styles.wrapper} >
          <header className={styles.header}>
            {editMode ?
              (<InputWithButton
                ref={nameInputRef}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onAction={handleSubmitEdit}
                icon={<Check height={"100%"} width={'100%'} />}
                buttonLabel="Save List Name"
                variant="secondary"
              />) : (<h2 title={listName}>{listName}</h2>)}
            <div className={styles.windowControls}>
              <button aria-label="Edit Todo List" onClick={toggleEditMode}>
                <Edit height={'100%'} />
              </button>
              <button aria-label="Delete Todo List" onClick={handleDeleteList}>
                <Times height={'100%'} />
              </button>
            </div>
          </header>
          <div className={styles.content}>

            <div className={styles.inputControls}>
              <div className={styles.modeButtons}>

                <button className={inputMode === 'SEARCH' ? styles.active : ''} onClick={() => handleModeToggle('SEARCH')}>
                  <Search />
                </button>
                <button className={inputMode === 'ADD' ? styles.active : ''} onClick={() => handleModeToggle('ADD')}>
                  <Plus />
                </button>
              </div>
              <div className={`${styles.expandableInput} ${inputMode ? styles.expanded : ''}`}>
                <InputWithButton
                  ref={actionInputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onAction={handleAction}
                  icon={inputMode === 'ADD' ? <Plus /> : <Search />}
                  buttonLabel={inputMode === 'ADD' ? 'Add New Todo' : 'Search Todo by ID'}
                  placeholder={inputMode === 'ADD' ? 'Add New Todo' : 'Search Todo by ID'}
                />
              </div>

            </div>
            {showClearSearch ? (<button className={styles.clearSearch} onClick={handleClearSearch}>Clear search</button>) : null}
            {listItems.length < 1 ? (<h3>No tasks have been entered yet</h3>) :
              (<ul className={styles.list}>
                {listItems.map(todo => (
                  <ListItem key={todo.id} item={todo} listId={listId} />
                ))}
              </ul>)
            }
            {showConfirmDialog && (<Dialog
              isOpen={showConfirmDialog}
              title={"Delete List"}
              message="Are you sure you want to delete this list? This action cannot be undone."
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setShowConfirmDialog(false);
              }}
            />)}
          </div>
        </div>
      </SortableContext>
    </DndContext >
  )
}

export default TodoList

