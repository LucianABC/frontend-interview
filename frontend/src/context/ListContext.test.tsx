import { renderHook, act, waitFor } from '@testing-library/react';
import { ListsProvider, useLists } from './ListsContext';
import * as listApi from '../api/list';
import * as listItemApi from '../api/list-item';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TodoI } from '../types/TodoList';
import { LISTS_STORAGE_KEY } from './ListsContext';

// API Mocks
vi.mock('../api/list', () => ({
  getListById: vi.fn(),
  getLists: vi.fn(),
  createList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
}));

vi.mock('../api/list-item', () => ({
  getItemById: vi.fn(),
  createListItem: vi.fn(),
  updateListItem: vi.fn(),
  deleteListItem: vi.fn(),
}));

// LocalStorage Mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockItems: TodoI[] = [
  { id: 101, name: 'Take out trash', description: '', done: false },
  { id: 102, name: 'Do the dishes', description: '', done: false },
  { id: 103, name: 'Clean bathroom', description: '', done: true }
];

describe('ListsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initialization & Loading', () => { // REVISADO: OK
    it('should apply localStorage order to list items on load', async () => {
      const mockLists = [{ id: 1, name: 'Test List', todoItems: [...mockItems] }];
      const savedOrder = { 1: [102, 101, 103] };
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(savedOrder));

      (listApi.getLists as any).mockResolvedValue(mockLists);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });

      await waitFor(() => {
        expect(result.current.lists![0].todoItems[0].id).toBe(102);
      });
    });

    it('should ignore localStorage IDs that no longer exist in the API response', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [{ id: 101 }] }];
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ 1: [999, 101] }));

      (listApi.getLists as any).mockResolvedValue(mockLists);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });

      await waitFor(() => {
        const list = result.current.lists![0];
        expect(list.todoItems).toHaveLength(1);
        expect(list.todoItems[0].id).toBe(101);
      });
    });
  });


  describe('Create Item', () => { // REVISADO:ok
    it('should update localStorage with new item ID after successful API POST request', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [] }];
      const newItemFromApi = { id: 999, name: 'New Task', description: '' };

      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listItemApi.createListItem as any).mockResolvedValue(newItemFromApi);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        await result.current.createListItem(1, { name: 'New Task', description: '' });
      });

      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[1]).toContain(999);
    });

    it('should not duplicate IDs when managing mock and real item ID on localStorage', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [] }];
      const tempId = 12345;
      const realId = 999;

      let resolveApi: (value: any) => void;
      const delayedPromise = new Promise((resolve) => { resolveApi = resolve; });

      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(tempId);
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listItemApi.createListItem as any).mockReturnValue(delayedPromise);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      let actionPromise: Promise<void>;
      await act(async () => {
        actionPromise = result.current.createListItem(1, { name: 'Task', description: '' });
      });

      const storedOptimistic = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(storedOptimistic[1]).toContain(tempId);

      await act(async () => {
        resolveApi!({ id: realId, name: 'Real Task' });
        await actionPromise!;
      });

      const storedFinal = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(storedFinal[1]).toContain(realId);
      expect(storedFinal[1]).not.toContain(tempId);
      dateSpy.mockRestore();
    });
    it('should rollback (remove tempId) if the API fails during item creation', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [] }];
      const tempId = 12345;
      vi.spyOn(Date, 'now').mockReturnValue(tempId);

      vi.mocked(listApi.getLists).mockResolvedValue(mockLists);
      vi.mocked(listItemApi.createListItem).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        try {
          await result.current.createListItem(1, { name: 'Fail', description: '' });
        } catch (e) { /* ignore */ }
      });

      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
        const listOrders = stored[1] || [];
        expect(listOrders).not.toContain(tempId);
      });
    });
  });

  describe('Update Item', () => { // REVISADO: ok
    it('should update item properties optimistically BEFORE the API responds', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [{ id: 101, name: 'Old', done: false, description: '' }] }];
      vi.mocked(listApi.getLists).mockResolvedValue(mockLists);

      // Delayed response
      let resolveApi: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });
      vi.mocked(listItemApi.updateListItem).mockReturnValue(delayedPromise as any);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));
      expect(result.current.lists![0].todoItems[0].name).toBe('Old');

      let actionPromise: Promise<void>;
      await act(async () => {
        actionPromise = result.current.updateListItem(1, 101, { name: 'Optimistic Name', done: true });
      });

      const optimisticItem = result.current.lists![0].todoItems[0];
      expect(optimisticItem.name).toBe('Optimistic Name');
      expect(optimisticItem.done).toBe(true);

      await act(async () => {
        resolveApi!({ id: 101, name: 'Final Name', done: true, description: '' });
        await actionPromise!;
      });

      expect(result.current.lists![0].todoItems[0].name).toBe('Final Name');
    });

    it('should rollback the item update if the API fails', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [{ id: 101, name: 'Old', done: false, description: '' }] }];
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listItemApi.updateListItem as any).mockRejectedValue(new Error('Update Error'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        try { await result.current.updateListItem(1, 101, { name: 'New', done: true }); } catch (e) { }
      });

      const item = result.current.lists![0].todoItems[0];
      expect(item.name).toBe('Old');
      expect(item.done).toBe(false);
    });
  });

  describe('Get Item by Id', () => { // REVISADO
    it('should set searchResult to null if getItemById returns a 404 error', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [] }];
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listItemApi.getItemById as any).mockRejectedValue(new Error('404'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        await result.current.getItemById(1, 999);
      });

      expect(result.current.searchResult).toBeUndefined();
    });
  });

  describe('Create List', () => { // REVISADO: ok
    it('should add a new list optimistically BEFORE API responds', async () => {
      const TEMP_ID = 12345;
      vi.spyOn(Date, 'now').mockReturnValue(TEMP_ID);
      vi.mocked(listApi.getLists).mockResolvedValue([]);

      let resolveApi: (value: any) => void;
      const delayedPromise = new Promise((resolve) => { resolveApi = resolve; });
      vi.mocked(listApi.createList).mockReturnValue(delayedPromise as any);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toBeDefined());

      let actionPromise: Promise<void>;
      await act(async () => {
        actionPromise = result.current.createList({ name: 'Optimistic List' });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists![0].id).toBe(TEMP_ID);

      await act(async () => {
        resolveApi!({ id: 2, name: 'Optimistic List', todoItems: [] });
        await actionPromise!;
      });

      expect(result.current.lists![0].id).toBe(2);
    });
    it('should add a new list to the state when successfully created', async () => {
      (listApi.getLists as any).mockResolvedValue([]);
      (listApi.createList as any).mockResolvedValue({ id: 2, name: 'New List', todoItems: [] });

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(0));

      await act(async () => {
        await result.current.createList({ name: 'New List' });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists![0].id).toBe(2);
    });
    it('should rollback and remove the list if API creation fails', async () => {
      const TEMP_ID = 999;
      vi.spyOn(Date, 'now').mockReturnValue(TEMP_ID);
      vi.mocked(listApi.getLists).mockResolvedValue([]);

      // La API falla
      vi.mocked(listApi.createList).mockRejectedValue(new Error('Failed to create list'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toBeDefined());

      await act(async () => {
        try {
          await result.current.createList({ name: 'Fail List' });
        } catch (e) { /* Error esperado */ }
      });

      expect(result.current.lists).toHaveLength(0);

      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
      expect(stored[TEMP_ID]).toBeUndefined();
    });
  });

  describe('Delete List', () => { // REVISADO: ok

    it('should clear the list entry in localStorage when the list is deleted', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [] }];
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ 1: [101, 102] }));
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listApi.deleteList as any).mockResolvedValue({});

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        await result.current.deleteList(1);
      });

      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[1]).toBeUndefined();
    });

    it('should rollback UI and localStorage if list deletion fails', async () => {
      const LIST_ID = 1;
      const mockLists = [{ id: LIST_ID, name: 'L1', todoItems: [] }];
      const originalOrder = [101, 102];

      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ [LIST_ID]: originalOrder }));
      vi.mocked(listApi.getLists).mockResolvedValue(mockLists);

      // API fails
      vi.mocked(listApi.deleteList).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        try {
          await result.current.deleteList(LIST_ID);
        } catch (e) { /* Error esperado */ }
      });

      // ROLLBACK
      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists![0].id).toBe(LIST_ID);

      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[LIST_ID]).toEqual(originalOrder);
    });
  });

  describe('Reorder Items', () => { // REVISADO: ok
    it('should do optimistic reorder update and save in localStorage', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [...mockItems] }];
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ 1: [101, 102, 103] }));
      (listApi.getLists as any).mockResolvedValue(mockLists);

      const old = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(old[1]).toEqual([101, 102, 103]);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        await result.current.reorderItems(1, 101, 102);
      });

      expect(result.current.lists![0].todoItems[0].id).toBe(102);
      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[1]).toEqual([102, 101, 103]);
    });
  });

  describe('Update List', () => { // REVISADO: ok
    it('should update the list name optimistically and then persist the change', async () => {
      const mockLists = [{ id: 1, name: 'Old Name', todoItems: [] }];
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listApi.updateList as any).mockResolvedValue({ id: 1, name: 'New Name' });

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        await result.current.updateList(1, { name: 'New Name' });
      });

      expect(result.current.lists![0].name).toBe('New Name');
    });

    it('should rollback the list name to the original if the API update fails', async () => {
      const mockLists = [{ id: 1, name: 'Original Name', todoItems: [] }];
      (listApi.getLists as any).mockResolvedValue(mockLists);
      (listApi.updateList as any).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toHaveLength(1));

      await act(async () => {
        try {
          await result.current.updateList(1, { name: 'Failing Name' });
        } catch (e) { /* Expected */ }
      });

      // State should revert to the original name
      expect(result.current.lists![0].name).toBe('Original Name');
    });
  });
  describe('Get List by Id', () => {  // REVISADO: ok
    it('should find the correct list and update searchResult', async () => {
      const mockList = { id: 1, name: 'Find Me', todoItems: [] };
      vi.mocked(listApi.getLists).mockResolvedValue([mockList]);
      vi.mocked(listApi.getListById).mockResolvedValue(mockList);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });

      await waitFor(() => expect(result.current.lists).toBeDefined());

      let list;
      await act(async () => {
        list = await result.current.getListById(1);
      });

      expect(list).toEqual(mockList);
      expect(result.current.searchResult?.[0].id).toBe(1);
    });

    it('should return undefined and set searchResult to null if the list ID does not exist', async () => {
      vi.mocked(listApi.getLists).mockResolvedValue([]);
      // Mock fail
      vi.mocked(listApi.getListById).mockRejectedValue(new Error("404"));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists).toBeDefined());

      let list;
      await act(async () => {
        list = await result.current.getListById(999);
      });

      expect(list).toBeUndefined();
      expect(result.current.searchResult).toBeNull();
    });
  });
  describe('Delete Item', () => { // // REVISADO: ok
    it('should delete item optimistically and persist changes in localStorage on success', async () => {
      const LIST_ID = 1;
      const ITEM_ID = 101;
      const mockLists = [{ id: LIST_ID, name: 'L1', todoItems: [...mockItems] }];

      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ [LIST_ID]: [101, 102, 103] }));
      vi.mocked(listApi.getLists).mockResolvedValue(mockLists);

      // Slow API response
      let resolveApi: (value: any) => void;
      const delayedPromise = new Promise((resolve) => { resolveApi = resolve; });
      vi.mocked(listItemApi.deleteListItem).mockReturnValue(delayedPromise as any);

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists![0].todoItems).toHaveLength(3));

      let actionPromise: Promise<void>;
      await act(async () => {
        actionPromise = result.current.deleteListItem(LIST_ID, ITEM_ID);
      });

      // Optimistic:
      expect(result.current.lists![0].todoItems).toHaveLength(2);
      let stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[LIST_ID]).not.toContain(ITEM_ID);
      expect(stored[LIST_ID]).toEqual([102, 103]);

      // API:
      await act(async () => {
        resolveApi!({});
        await actionPromise!;
      });

      expect(result.current.lists![0].todoItems).toHaveLength(2);
      expect(result.current.lists![0].todoItems.find(i => i.id === ITEM_ID)).toBeUndefined();
    });
    it('should rollback optimistic update if API request fails during deletion', async () => {
      const mockLists = [{ id: 1, name: 'L1', todoItems: [...mockItems] }];
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify({ 1: [101, 102, 103] }));
      (listApi.getLists as any).mockResolvedValue(mockLists);

      vi.spyOn(listItemApi, 'deleteListItem').mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useLists(), { wrapper: ListsProvider });
      await waitFor(() => expect(result.current.lists![0].todoItems).toHaveLength(3));

      await act(async () => {
        try { await result.current.deleteListItem(1, 101); } catch (e) { }
      });

      expect(result.current.lists![0].todoItems).toHaveLength(3);
      const stored = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)!);
      expect(stored[1]).toContain(101);
    });
  });
});


