import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getLists } from '../api/list'
import { TodoListI } from '../types/TodoList';

interface ListContextType {
    lists: TodoListI[]
    setLists: React.Dispatch<React.SetStateAction<any[]>>;
}
const ListsContext = createContext<ListContextType | undefined>(undefined);

export const ListsProvider = ({ children }: { children: ReactNode }) => {
    const [lists, setLists] = useState<TodoListI[]>([]);

    useEffect(() => {
        async function loadData() {
            const response = await getLists();
            setLists(response)
        }
        loadData()
    }, [])

    return (
        <ListsContext.Provider value={{ lists, setLists }}>
            {children}
        </ListsContext.Provider>
    );
};

export const useLists = () => {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error('useListsContext debe ser usado dentro de un ListsProvider');
    }
    return context;
};