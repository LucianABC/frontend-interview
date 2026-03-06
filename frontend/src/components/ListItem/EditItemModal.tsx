import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { TodoI } from '../../types/TodoList';
import styles from './ListItem.module.scss';
import { useLists } from '../../context/ListsContext';
interface EditModalProps {
  item: TodoI & { listId: number };
  isOpen: boolean;
  onClose: () => void;
}
const EditModal = ({ item, isOpen, onClose }: EditModalProps) => {
  const {updateListItem} = useLists()
  const [updatedItem, setUpdatedItem] = useState<TodoI>(item);

  const handleSubmit = async () => {
    await updateListItem(item.listId, item.id, { name: updatedItem.name, description: updatedItem.description });
    onClose();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedItem(prev => ({ ...prev, [name]: value }));
  }

  const isSubmitEnabled = updatedItem.name.trim() !== '' && (updatedItem.name !== item.name || updatedItem.description !== item.description);

  return (
    <Modal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit} submitEnabled={isSubmitEnabled} title='Edit Todo'>
      <div className={styles.editModalContent}>
        <div className='field'>
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name='name'
            value={updatedItem.name}
            onChange={handleChange}
            placeholder="Task/Item name"
            required
          />
        </div>

        <div className='field'>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name='description'
            value={updatedItem.description}
            onChange={handleChange}
            placeholder="Add todo description (optional)"
            rows={4}
          />
        </div>
      </div>
    </Modal>

  )
}

export default EditModal;