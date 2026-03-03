
import React, { useState } from "react"
import { deleteListItem, updateListItem } from "../../api/list-item"
import { TodoI } from "../../types/TodoList"
import styles from './ListItem.module.scss'
import Times from '../../assets/times.svg?react'
import Expanded from '../../assets/arrow-down-circle.svg?react'
import Collapsed from '../../assets/arrow-right-circle.svg?react'
import Edit from '../../assets/edit.svg?react'

interface Props {
  item: TodoI,
  listId: number,
  onUpdate: () => void
}

const ListItem = ({ item, listId, onUpdate }: Props) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const handleDeleteTodo = (itemId: number) => {
    try {
      deleteListItem(listId, itemId);
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const handleOnHover = () => {
    console.log('hover')
    setShowButtons(true)
  }

  const handleOnLeave = () => {
   // setShowButtons(false)
  }

  return (<li key={item.id} className={styles.listItem} onMouseEnter={handleOnHover} onMouseLeave={handleOnLeave}>
    <div className={styles.itemContent}>
      <label>
        <input type="checkbox" checked={item.done} />
        <h3 className={item.done ? styles.completed : ''}> {item.name}</h3>
      </label>

      {showButtons && (<div className={styles.buttons}>

        <button aria-label={`Delete Todo ${item.name}`} onClick={(e) => handleDeleteTodo(item.id)}>
          <Times width={20} height={20}/>
        </button>
        <button aria-label="Edit Button" onClick={() => console.log('Editar')} title="Editar">
          <Edit width={20} height={20}/>
        </button>
        {item.description && (
          <button
            onClick={() => setShowDesc(!showDesc)}
            title="Show Description"
          >
            {showDesc ? <Expanded width={20} height={20} /> : <Collapsed width={20} height={20} />}
          </button>
        )}
      </div>)}

    </div>

    {showDesc && item.description && (
      <div className={styles.description}>
        <p>{item.description}</p>
      </div>
    )}
  </li>)
}

export default ListItem