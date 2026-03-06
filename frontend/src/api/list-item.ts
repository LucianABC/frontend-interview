import axios from 'axios'

export const createListItem = async (listId: number, { name, description }: { name: string, description?: string }) => {
  try {
    const response = await axios.post(`/api/todo-lists/${listId}/todo-items`, { name, description })
    return response.data
  }
  catch (error) {
    console.error('Error creating list item:', error)
  }
}

export const updateListItem = async (listId: number, itemId: number, { name, description, done }: { name?: string, description?: string, done?: boolean }) => {
  try {
    const response = await axios.put(`/api/todo-lists/${listId}/todo-items/${itemId}`, { name, description, done }) // Ver si el undefined es un problema
    return response.data
  }
  catch (error) {
    console.error('Error updating list item:', error)
  }
}

export const deleteListItem = async (listId: number, itemId: number) => {
  try {
    const response = await axios.delete(`/api/todo-lists/${listId}/todo-items/${itemId}`)
    return response.data
  }
  catch (error) {
    console.error('Error deleting list item:', error)
  }
}

export const getItemById = async (listId: number, itemId: number) => {
  try {
    const response = await axios.get(`/api/todo-lists/${listId}/todo-items/${itemId}`)
    return response.data
  }
  catch (error) {
    console.error('Error fetching list item:', error)
  }
}

export const getAllItemsByListId = async (listId: number) => {
  try {
    const response = await axios.get(`/api/todo-lists/${listId}/todo-items`)       
    return response.data
  }
  catch (error) {
    console.error('Error fetching list items:', error)
  }
}