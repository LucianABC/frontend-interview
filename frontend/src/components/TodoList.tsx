import React from "react"
import { TodoListI } from "../types/TodoList"
import './TodoList.css'
import plus from '../assets/plus.png'

interface Props {
    todoList: TodoListI
}
const TodoList = ({ todoList }: Props) => {
    return (
        <div className="list">
            <h2>{todoList.name}</h2>
            <div className="listContent">
                <div className="addTodo">
                    <input type='text' placeholder="Add new todo" />
                    <button><img src={plus} alt="Add" /></button>
                </div>
                <ul>
                    {todoList.todoItems.map(todo => (
                        <li key={todo.id} className="listItem">
                            <input type="checkbox" checked={todo.done} />
                            <h3>{todo.name}</h3>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default TodoList