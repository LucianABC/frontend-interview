
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useLists } from "../../context/ListsContext"
import { TodoI } from "../../types/TodoList"
import styles from './ListItem.module.scss'
import Times from '../../assets/times.svg?react'
import Expanded from '../../assets/arrow-down-circle.svg?react'
import Collapsed from '../../assets/arrow-right-circle.svg?react'
import Edit from '../../assets/edit.svg?react'
import EditModal from "./EditItemModal"
import Check from '../../assets/check-circle.svg?react'

interface Props {
  item: TodoI,
  listId: number,
}

const ListItem = ({ item, listId }: Props) => {
  const { deleteListItem } = useLists();
  const [showButtons, setShowButtons] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `${listId}-${item.id}`,
  });

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
    setShowButtons(false)
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  return (<li key={`${listId}-${item.id}`} className={styles.listItem} style={style} onMouseEnter={handleOnHover} onMouseLeave={handleOnLeave} ref={setNodeRef} >
    <div className={styles.itemContent}>
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        {/* Un icono de 6 puntos o similar para indicar que se puede arrastrar */}
        ⋮⋮
      </div>
      <label className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => {/* Aquí iría tu lógica de update */ }}
        />
        <span className={styles.customCheck}>
          {item.done && <Check />}
        </span>
        <h3 className={item.done ? styles.completed : ''}>{item.name}</h3>
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