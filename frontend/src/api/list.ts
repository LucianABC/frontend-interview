import axios from "axios"

export const getLists = async () => {
  try {
    const response = await axios.get('/api/todo-lists')
    return response.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

export const createList = async ({ name }: { name: string }) => {
  try {
    const response = await axios.post('/api/todo-lists', { name })
    return response.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

export const getListById = async (id: number) => {
  try {
    const response = await axios.get(`/api/todo-lists/${id}`)
    return response.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

export const updateList = async (id: number, { name }: { name: string }) => {
  try {
    const response = await axios.put(`/api/todo-lists/${id}`, { name })
    return response.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

export const deleteList = async (id: number) => {
  try {
    const response = await axios.delete(`/api/todo-lists/${id}`)
    return response.data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}