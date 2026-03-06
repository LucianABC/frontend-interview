
import { ChangeEvent, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useLists } from "../../context/ListsContext"
import { TodoI } from "../../types/TodoList"
import styles from './ListItem.module.scss'
import EditModal from "./EditItemModal"
import Times from '../../assets/times.svg?react'
import Expanded from '../../assets/arrow-down-circle.svg?react'
import Collapsed from '../../assets/arrow-right-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import Check from '../../assets/check-circle.svg?react'
import Hamburger from '../../assets/hamburger.svg?react'
import { CSS } from "@dnd-kit/utilities";

interface Props {
  item: TodoI,
  listId: number,
}

const ListItem = ({ item, listId }: Props) => {
  const { deleteListItem, updateListItem } = useLists();
  const [showDesc, setShowDesc] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${listId}-${item.id}`,
  });

  const handleDelete = (itemId: number) => {
    try {
      deleteListItem(listId, itemId);
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Feedback visual al arrastrar
  };

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    updateListItem(listId, item.id, { done: e.target.checked })
  }

  return (<li key={`${listId}-${item.id}`} className={styles.listItem} style={style} ref={setNodeRef} >

    <div className={styles.itemContent}>
      
      <div className={styles.checkboxContainer}>
        <label>
          <input
            type="checkbox"
            checked={item.done}
            onChange={handleCheckbox}
          />
          <span className={styles.customCheck}>
            {item.done && <Check />}
          </span></label>
        <h3 className={
          `${styles.itemTitle} ${item.done ? styles.completed : ''}`
        }>{item.name}</h3>
      </div>

      <div className={styles.buttons}>
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
        <button {...attributes} {...listeners} className={styles.dragHandle}>
          <Hamburger height={20} width={20} />
        </button>
      </div>

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