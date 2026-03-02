
  export const fetchData = async () => {
    try {
      const response = await fetch('/api/todo-lists') 
      const data = await response.json()
      return data
    }
    catch (error) {
      console.error('Error fetching data:', error)
    }
  }