import { createContext, useContext, useEffect, useState, ReactNode, useOptimistic, useTransition } from 'react';
import { getLists as getListsAPI, getListById as getListByIdAPI, createList as createListAPI, updateList as updateListAPI, deleteList as deleteListAPI } from '../api/list'
import { createListItem as createListItemAPI, updateListItem as updateListItemAPI, deleteListItem as deleteListItemAPI, getItemById as getItemByIdAPI } from '../api/list-item';
import { TodoI, TodoListI } from '../types/TodoList';
import { arrayMove } from '@dnd-kit/sortable';

export const LISTS_STORAGE_KEY = 'todo_lists'

type Action =
  | { type: 'REORDER'; listId: number; newOrder: any[] }
  | { type: 'ADD'; name: string }
  | { type: 'UPDATE'; listId: number; name: string }
  | { type: 'DELETE'; listId: number }
  | { type: 'ADD_ITEM'; listId: number; newItem: TodoI }
  | { type: 'DELETE_ITEM'; listId: number; itemId: number }
  | { type: 'UPDATE_ITEM'; listId: number; itemId: number; data: any }
  | { type: 'SEARCH_BY_ID'; listId: number }
  | { type: 'SEARCH_ITEM_BY_ID'; listId: number; itemId: number }

interface ListContextType {
  lists?: TodoListI[]
  setLists: React.Dispatch<React.SetStateAction<any[]>>;
  createList: (data: { name: string }) => Promise<void>;
  updateList: (id: number, data: { name?: string }) => Promise<void>;
  reorderItems: (listId: number, activeId: number, overId: number) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  createListItem: (listId: number, data: { name: string, description: string }) => Promise<void>;
  updateListItem: (listId: number, itemId: number, data: { name?: string, description?: string; done?: boolean }) => Promise<void>;
  deleteListItem: (listId: number, itemId: number) => Promise<void>;
  getListById: (id: number) => Promise<void>
  getItemById: (listId: number, itemId: number) => Promise<void>;
  searchResult?: TodoListI[] | null;
  isLoading?: boolean;
  clearSearch: () => void;
}

const ListsContext = createContext<ListContextType | undefined>(undefined);

export const ListsProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<TodoListI[]>([]);
  const [searchResult, setSearchResult] = useState<TodoListI[] | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [_, startTransition] = useTransition();

  const updateFn = (state: TodoListI[], action: Action): TodoListI[] => {
    switch (action.type) {
      case 'ADD':
        return [...(state ?? []), { id: Date.now(), name: action.name, todoItems: [] }];

      case 'UPDATE':
        return state?.map(l => l.id === action.listId ? { ...l, name: action.name } : l);

      case 'DELETE':
        return state?.filter(l => l.id !== action.listId);

      case 'REORDER':
        return state?.map(l => l.id === action.listId ? { ...l, todoItems: action.newOrder } : l);

      case 'ADD_ITEM': {
        return state?.map(l =>
          String(l.id) === String(action.listId)
            ? { ...l, todoItems: [...l.todoItems, { ...action.newItem }] }
            : l
        );
      }
      case 'DELETE_ITEM': {
        return state?.map(l =>
          String(l.id) === String(action.listId)
            ? { ...l, todoItems: l.todoItems.filter(t => String(t.id) !== String(action.itemId)) }
            : l
        );
      }
      case 'UPDATE_ITEM': {
        return state?.map(l =>
          String(l.id) === String(action.listId)
            ? {
              ...l,
              todoItems: l.todoItems.map(t =>
                String(t.id) === String(action.itemId) ? { ...t, ...action.data } : t
              )
            }
            : l
        );
      }

      default:
        return state;
    }
  };

  const [optimisticLists, setOptimisticLists] = useOptimistic<TodoListI[], Action>(lists, updateFn);

  useEffect(() => {
    async function loadData() {
      const response = await getListsAPI();

      // Recuperar el mapa de órdenes del localStorage { listId: [id1, id2, ...] }
      const savedOrders = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');

      const orderedResponse = response.map((list: TodoListI) => {
        const orderForThisList = savedOrders[list.id];

        if (orderForThisList && Array.isArray(orderForThisList)) {
          // Reordenar los items según el array de IDs guardado
          const newItems = [...list.todoItems].sort((a, b) => {
            return orderForThisList.indexOf(a.id) - orderForThisList.indexOf(b.id);
          });
          return { ...list, todoItems: newItems };
        }
        return list;
      });

      setLists(orderedResponse);
    }
    loadData();
  }, []);

  const createList = async ({ name }: { name: string }) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'ADD', name });
      try {
        const newList = await createListAPI({ name });
        setLists(prev => [...prev, newList]);
      } catch (error) {
        console.error('Error creating list:', error);
      }
    })
  };

  const reorderItems = async (listId: number, activeId: number, overId: number) => {
    const targetList = optimisticLists?.find(l => l.id === listId);
    if (!targetList) return;
    const previousOrders = localStorage.getItem(LISTS_STORAGE_KEY);
    const oldIndex = targetList.todoItems.findIndex(t => t.id === activeId);
    const newIndex = targetList.todoItems.findIndex(t => t.id === overId);
    if (oldIndex === newIndex) return;

    const newTasksOrder = arrayMove(targetList.todoItems, oldIndex, newIndex);

    startTransition(async () => {
      setOptimisticLists({ type: 'REORDER', listId, newOrder: newTasksOrder });

      const savedOrders = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
      savedOrders[listId] = newTasksOrder.map(item => item.id);
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(savedOrders));
      try {
        // const res = await updateTasksOrderApi(listId, newTasksOrder.map(t => t.id));
        // if (!res)  throw new Error("404");
        setLists(prev => prev.map(l =>
          l.id === listId ? { ...l, todoItems: newTasksOrder } : l
        ));
      } catch (error) {
        console.error("Error al persistir el orden:", error);
        if (previousOrders) {
          localStorage.setItem(LISTS_STORAGE_KEY, previousOrders);
        } else {
          localStorage.removeItem(LISTS_STORAGE_KEY);
        }
      }
    });
  };

  const updateList = async (id: number, data: { name?: string }) => {
    if (!data.name) return;
    const newName = data.name;

    startTransition(async () => {
      setOptimisticLists({ type: 'UPDATE', listId: id, name: newName });
      try {
        const updated = await updateListAPI(id, { name: newName });
        setLists(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      } catch (error) {
        console.error('Error updating list:', error);
      }
    });
  };

  const deleteList = async (id: number) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'DELETE', listId: id });
      try {
        await deleteListAPI(id);

        const savedOrders = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
        delete savedOrders[id];
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(savedOrders));
        setLists(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    });
  };

  const createListItem = async (listId: number, { name, description }: { name: string, description: string }) => {
    const tempId = Date.now();
    const newItem = { name, description };
    const previousOrders = localStorage.getItem(LISTS_STORAGE_KEY);

    startTransition(async () => {
      setOptimisticLists({ type: 'ADD_ITEM', listId, newItem: { ...newItem, id: tempId, done: false } });

      const savedOrders = JSON.parse(previousOrders || '{}');
      savedOrders[listId] = [...(savedOrders[listId] || []), tempId];
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(savedOrders));

      try {
        const savedItem = await createListItemAPI(listId, newItem);

        const finalOrders = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
        finalOrders[listId] = finalOrders[listId].map((id: number) => id === tempId ? savedItem.id : id);
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(finalOrders));

        setLists(prev => prev.map(l =>
          l.id === listId ? { ...l, todoItems: [...l.todoItems, savedItem] } : l
        ));
      } catch (error) {
        console.error('Error creating item:', error);
        if (previousOrders) {
          localStorage.setItem(LISTS_STORAGE_KEY, previousOrders);
        } else {
          // Si no había nada antes, debemos limpiar el desastre que hizo el cambio optimista
          const current = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
          delete current[listId]; // Eliminamos la entrada que creamos para el tempId
          localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(current));
        }
      }
    });

  };

  const updateListItem = async (listId: number, itemId: number, data: { name?: string; decription?: string; done?: boolean }) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'UPDATE_ITEM', listId, itemId, data });
      try {
        const updatedItem = await updateListItemAPI(listId, itemId, data);
        setLists(prev => prev.map(l => l.id === listId
          ? { ...l, todoItems: l.todoItems.map(t => t.id === itemId ? { ...t, ...updatedItem } : t) }
          : l
        ));
      } catch (error) {
        console.error('Error updating item:', error);
      }
    });
  };

  const deleteListItem = async (listId: number, itemId: number) => {
    const previousOrders = localStorage.getItem(LISTS_STORAGE_KEY);
    startTransition(async () => {
      setOptimisticLists({ type: 'DELETE_ITEM', listId, itemId });


      const savedOrders = JSON.parse(previousOrders || '{}');
      if (savedOrders[listId]) {
        savedOrders[listId] = savedOrders[listId].filter((id: number) => id !== itemId);
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(savedOrders));
      }
      try {
        await deleteListItemAPI(listId, itemId);



        setLists(prev => prev.map(l => l.id === listId
          ? { ...l, todoItems: l.todoItems.filter(t => t.id !== itemId) }
          : l
        ));
      } catch (error) {
        console.error('Error deleting item:', error);
        if (previousOrders) {
          localStorage.setItem(LISTS_STORAGE_KEY, previousOrders);
        }
      }
    });
  };

  const getListById = async (listId: number) => {
    setIsLoading(true);

    const cached = optimisticLists.find(l => l.id === listId);
    if (cached) {
      setSearchResult([cached]);
    }

    try {
      const freshList = await getListByIdAPI(listId);
      if (!freshList || Object.keys(freshList).length === 0) {
        throw new Error("404");
      }
      setSearchResult([freshList]);
      setLists(prev => {
        const exists = prev.find(l => l.id === listId);
        return exists
          ? prev.map(l => l.id === listId ? freshList : l)
          : [...prev, freshList];
      });
      return freshList
    } catch (error) {
      setSearchResult(null)
      console.error("Error al obtener la lista:", error);
      return undefined
    } finally {
      setIsLoading(false);
    }
  };


  const getItemById = async (listId: number, itemId: number) => {
    setIsLoading(true);

    const currentList = optimisticLists?.find(l => l.id === listId);
    const cachedItem = currentList?.todoItems.find(t => t.id === itemId);

    if (cachedItem && currentList) {
      setSearchResult([{ ...currentList!, todoItems: [cachedItem] }]);
    }

    try {
      const freshItem = await getItemByIdAPI(listId, itemId);

      if (!freshItem) throw new Error("404");

      setSearchResult(prev => prev ? { ...prev, todoItems: [freshItem] } : null);
      setLists(prev => prev.map(l =>
        l.id === listId
          ? { ...l, todoItems: l.todoItems.map(t => t.id === itemId ? freshItem : t) }
          : l
      ));

    } catch (error) {
      console.error("Error al obtener el ítem:", error);
      setSearchResult(null);
      setLists(prev => prev.map(l =>
        l.id === listId
          ? { ...l, todoItems: l.todoItems.filter(t => t.id !== itemId) }
          : l
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => setSearchResult(undefined);

  return (
    <ListsContext.Provider value={{ lists: optimisticLists, setLists, isLoading, clearSearch, searchResult, createList, updateList, reorderItems, getListById, deleteList, createListItem, updateListItem, deleteListItem, getItemById }}>
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