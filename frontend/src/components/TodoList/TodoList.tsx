import { useEffect, useRef, useState } from "react"
import { DndContext } from '@dnd-kit/core';
import styles from './TodoList.module.scss'
import Plus from '../../assets/plus-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import Times from '../../assets/times.svg?react'
import ListItem from "../ListItem/ListItem"
import Dialog from "../Dialog/Dialog"
import Check from '../../assets/check-circle.svg?react'
import InputWithButton from "../InputWithButton/InputWithButton"
import { useLists } from "../../context/ListsContext";
import { SortableContext } from "@dnd-kit/sortable";

interface Props {
  listId: number;
}

const TodoList = ({ listId }: Props) => {
  const { lists, reorderItems, deleteList, updateList, createListItem } = useLists();
  const list = lists.find(l => l.id === listId) ?? { name: '', todoItems: [], id: Date.now() };

  const [newTodo, setNewTodo] = useState<{ name: string, description?: string }>({ name: '', description: '' })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState(list?.name ?? '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editMode]);
  
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  }

  const handleAddTodo = () => {   
      const newItem = {
        name: newTodo.name,
        description: newTodo.description ?? ''
      }
      createListItem(listId, { ...newItem }).then(()=>{
        setNewTodo({name:'', description: ''})
      });
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

  const sortableItems = list.todoItems.map(t => `${listId}-${t.id}`);
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
              />) : (<h2>{listName}</h2>)}
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
            <InputWithButton
              value={newTodo.name}
              onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
              onAction={handleAddTodo}
              icon={<Plus />}
              buttonLabel="Add New Todo"
            />
            {list.todoItems.length < 1 ? (<h3>No tasks have been entered yet</h3>) :
              (<ul className={styles.list}>
                {list.todoItems.map(todo => (
                  <ListItem key={todo.id} item={todo} listId={listId}  />
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
    </DndContext>
  )
}

export default TodoList

