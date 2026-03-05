import React, { useEffect, useRef, useState } from "react"
import { TodoListI } from "../../types/TodoList"
import styles from './TodoList.module.scss'
import Plus from '../../assets/plus-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import Times from '../../assets/times.svg?react'
import { createListItem } from "../../api/list-item"
import { deleteList, updateList } from "../../api/list"
import ListItem from "../ListItem/ListItem"
import Dialog from "../Dialog/Dialog"
import Check from '../../assets/check-circle.svg?react'
import InputWithButton from "../InputWithButton/InputWithButton"

interface Props {
  todoList: TodoListI
}

const TodoList = ({ todoList }: Props) => {
  const [newTodo, setNewTodo] = useState<{ name: string, description?: string }>({ name: '', description: '' })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState(todoList.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo({ ...newTodo, name: e.target.value })
  }

  useEffect(() => {
    if (editMode) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editMode]);

  const handleAddTodo = () => {
    try {
      const newItem = {
        name: newTodo.name,
        description: newTodo.description
      }
      createListItem(todoList.id, { ...newItem });
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const handleDeleteList = () => {
    setShowConfirmDialog(true);
  }

  const handleConfirmDelete = async () => {
    await deleteList(todoList.id).then(() => {
      console.log('List deleted successfully');
    })
    setShowConfirmDialog(false);
  }

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  }

  const handleSubmitEdit = async () => {
    await updateList(todoList.id, { name: listName }).then(updatedList => {
      console.log('List updated successfully', updatedList);
    })
    setEditMode(false);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        {editMode ?
          (<InputWithButton
            ref={nameInputRef}
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onAction={handleSubmitEdit}
            icon={<Check />} 
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
        {todoList.todoItems.length < 1 ? (<h3>No tasks have been entered yet</h3>) :
          (<ul className={styles.list}>
            {todoList.todoItems.map(todo => (
              <ListItem key={todo.id} item={todo} listId={todoList.id} onUpdate={() => { }} />
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
  )
}

export default TodoList