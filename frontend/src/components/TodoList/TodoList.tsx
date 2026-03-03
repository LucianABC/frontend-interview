import React, { useState } from "react"
import { TodoListI } from "../../types/TodoList"
import styles from './TodoList.module.scss'
import Plus from '../../assets/plus-circle.svg?react'
import Maximize from '../../assets/maximize.svg?react'
import Times from '../../assets/times.svg?react'
import { createListItem } from "../../api/list-item"
import ListItem from "../ListItem/ListItem"

interface Props {
  todoList: TodoListI
}

const TodoList = ({ todoList }: Props) => {
  const [newTodo, setNewTodo] = useState<{ name: string, description?: string }>({ name: '', description: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo({ ...newTodo, name: e.target.value })
  }

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


  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>

        <h2>{todoList.name}</h2>
        <div className={styles.windowControls}>
          <button aria-label="Minimize Window" className={styles.minimize}><Maximize height={'100%'} /></button>
          <button aria-label="Delete Todo List" className={styles.close}><Times height={'100%'} /></button>
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.addTodo}>
          <input type='text' placeholder="Add new todo" value={newTodo.name} onChange={handleInputChange} />
          <button aria-label="Add New Todo" onClick={handleAddTodo}><Plus height={'100%'} /></button>
        </div>
        {todoList.todoItems.length < 1 ? (<h3>No tasks have been entered yet</h3>) :
          (<ul className={styles.list}>
            {todoList.todoItems.map(todo => (
              <ListItem key={todo.id} item={todo} listId={todoList.id} onUpdate={() => { }} />
            ))}
          </ul>)
        }

      </div>
    </div>
  )
}

export default TodoList