import React from "react"
import { TodoListI } from "../types/TodoList"
import styles from './TodoList.module.scss'
import plus from '../assets/plus.png'

interface Props {
  todoList: TodoListI
}
const TodoList = ({ todoList }: Props) => {
  return (
    <div className={styles.wrapper}>
      <h2>{todoList.name}</h2>
      <div className={styles.content}>
        <div className={styles.addTodo}>
          <input type='text' placeholder="Add new todo" />
          <button><img src={plus} alt="Add" /></button>
        </div>
        <ul className={styles.list}>
          {todoList.todoItems.map(todo => (
            <li key={todo.id} className={styles.listItem}>
              <label>

                <input type="checkbox" checked={todo.done} />
                <h3>{todo.name}</h3>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TodoList