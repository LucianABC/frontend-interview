
import React, { useState } from "react"
import { deleteListItem } from "../../api/list-item"
import { TodoI } from "../../types/TodoList"
import styles from './ListItem.module.scss'
import Times from '../../assets/times.svg?react'
import Expanded from '../../assets/arrow-down-circle.svg?react'
import Collapsed from '../../assets/arrow-right-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import EditModal from "./EditItemModal"

interface Props {
  item: TodoI,
  listId: number,
  onUpdate: () => void
}

const ListItem = ({ item, listId, onUpdate }: Props) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = (itemId: number) => {
    try {
      deleteListItem(listId, itemId);
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const handleOnHover = () => {
    setShowButtons(true)
  }

  const handleOnLeave = () => {
    // setShowButtons(false)
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  return (<li key={item.id} className={styles.listItem} onMouseEnter={handleOnHover} onMouseLeave={handleOnLeave}>
    <div className={styles.itemContent}>
      <label>
        <input type="checkbox" checked={item.done} />
        <h3 className={item.done ? styles.completed : ''}> {item.name}</h3>
      </label>

      {showButtons && (<div className={styles.buttons}>
        {item.description && (
          <button
            onClick={() => setShowDesc(!showDesc)}
            title="Show Description"
          >
            {showDesc ? <Expanded width={20} height={20} /> : <Collapsed width={20} height={20} />}
          </button>
        )}

        <button aria-label="Edit Button" onClick={handleEditClick} title="Editar">
          <Edit width={18} height={18} />
        </button>
        <button aria-label={`Delete Todo ${item.name}`} onClick={(e) => handleDelete(item.id)}>
          <Times width={18} height={18} />
        </button>

      </div>)}

    </div>

    {showDesc && item.description && (
      <div className={styles.description}>
        <p>{item.description}</p>
      </div>
    )}
    {showEditModal && (<EditModal
      item={{ ...item, listId }}
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
    />
    )}
  </li>)
}

export default ListItem