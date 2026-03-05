import { createContext, useContext, useEffect, useState, ReactNode, useOptimistic, useTransition } from 'react';
import { getLists as getListsAPI, createList as createListAPI, updateList as updateListAPI, deleteList as deleteListAPI } from '../api/list'
import { createListItem as createListItemAPI, updateListItem as updateListItemAPI, deleteListItem as deleteListItemAPI } from '../api/list-item';
import { TodoI, TodoListI } from '../types/TodoList';
import { arrayMove } from '@dnd-kit/sortable';

type Action =
  | { type: 'REORDER'; listId: number; newOrder: any[] }
  | { type: 'ADD'; name: string }
  | { type: 'UPDATE'; listId: number; name: string }
  | { type: 'DELETE'; listId: number }
  | { type: 'ADD_ITEM'; listId: number; newItem: any }
  | { type: 'DELETE_ITEM'; listId: number; itemId: number }
  | { type: 'UPDATE_ITEM'; listId: number; itemId: number; data: any };

interface ListContextType {
  lists: TodoListI[]
  setLists: React.Dispatch<React.SetStateAction<any[]>>;
  createList: (data: { name: string }) => Promise<void>;
  updateList: (id: number, data: { name?: string }) => Promise<void>;
  reorderItems: (listId: number, activeId: number, overId: number) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  createListItem: (listId: number, data: { name: string, description: string }) => Promise<void>;
  updateListItem: (listId: number, itemId: number, data: { name: string, description?: string; completed?: boolean }) => Promise<void>;
  deleteListItem: (listId: number, itemId: number) => Promise<void>;
}
const ListsContext = createContext<ListContextType | undefined>(undefined);

export const ListsProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<TodoListI[]>([]);
  const [isPending, startTransition] = useTransition();

  const updateFn = (state: TodoListI[], action: Action): TodoListI[] => {
    switch (action.type) {
      case 'ADD':
        return [...state, { id: Date.now(), name: action.name, todoItems: [] }];

      case 'UPDATE':
        return state.map(l => l.id === action.listId ? { ...l, name: action.name } : l);

      case 'DELETE':
        return state.filter(l => l.id !== action.listId);

      case 'REORDER':
        return state.map(l => l.id === action.listId ? { ...l, todoItems: action.newOrder } : l);

      case 'ADD_ITEM': {
        console.log({ state, action })
        return state.map(l =>
          // Forzamos comparación simple por si hay temas de tipos string/number
          String(l.id) === String(action.listId)
            ? { ...l, todoItems: [...l.todoItems, { id: Date.now(), ...action.newItem }] }
            : l
        );
      }
      case 'DELETE_ITEM':
        {
          console.log({ state, action })
          return state.map(l =>
            String(l.id) === String(action.listId)
              ? { ...l, todoItems: l.todoItems.filter(t => String(t.id) !== String(action.itemId)) }
              : l
          );
        }

      case 'UPDATE_ITEM':
        {
          console.log({ state, action })
          return state.map(l =>
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
      setLists(response)
    }
    loadData()
  }, [])

  const createList = async ({ name }: { name: string }) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'ADD', name });
    })
    try {
      const newList = await createListAPI({ name });
      setLists(prev => [...prev, newList]);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const reorderItems = async (listId: number, activeId: number, overId: number) => {
    const targetList = optimisticLists.find(l => l.id === listId);
    if (!targetList) return;

    const oldIndex = targetList.todoItems.findIndex(t => t.id === activeId);
    const newIndex = targetList.todoItems.findIndex(t => t.id === overId);
    if (oldIndex === newIndex) return;

    const newTasksOrder = arrayMove(targetList.todoItems, oldIndex, newIndex);

    startTransition(async () => {
      setOptimisticLists({ type: 'REORDER', listId, newOrder: newTasksOrder });

      try {
        // Llamada a la API (la API actual no permite este update)
        // await updateTasksOrderApi(listId, newTasksOrder.map(t => t.id));
        setLists(prev => prev.map(l =>
          l.id === listId ? { ...l, todoItems: newTasksOrder } : l
        ));
      } catch (error) {
        console.error("Error al persistir el orden:", error);
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
        setLists(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    });
  };

  // Crear un ítem (Checklist)
  const createListItem = async (listId: number, { name, description }: { name: string, description: string }) => {
    const newItem = { name, description };

    startTransition(async () => {
      setOptimisticLists({ type: 'ADD_ITEM', listId, newItem });
      try {
        const savedItem = await createListItemAPI(listId, newItem);
        setLists(prev => prev.map(l =>
          l.id === listId ? { ...l, todoItems: [...l.todoItems, savedItem] } : l
        ));
      } catch (error) {
        console.error('Error creating item:', error);
      }
    });

  };

  // Actualizar un ítem (Toggle completed o editar texto)
  const updateListItem = async (listId: number, itemId: number, data: { name: string; decription?: string; done?: boolean }) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'UPDATE_ITEM', listId, itemId, data });
    });
    try {
      const updatedItem = await updateListItemAPI(listId, itemId, data);
      setLists(prev => prev.map(l => l.id === listId
        ? { ...l, todoItems: l.todoItems.map(t => t.id === itemId ? { ...t, ...updatedItem } : t) }
        : l
      ));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  // Eliminar un ítem
  const deleteListItem = async (listId: number, itemId: number) => {
    startTransition(async () => {
      setOptimisticLists({ type: 'DELETE_ITEM', listId, itemId });
    });
    try {
      await deleteListItemAPI(listId, itemId);
      setLists(prev => prev.map(l => l.id === listId
        ? { ...l, todoItems: l.todoItems.filter(t => t.id !== itemId) }
        : l
      ));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <ListsContext.Provider value={{ lists: optimisticLists, setLists, createList, updateList, reorderItems, deleteList, createListItem, updateListItem, deleteListItem }}>
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