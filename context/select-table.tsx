import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChessTable } from "@/constants/types/chess_table";

const STORAGE_KEY = "selectedTables";

/**
 * Lấy danh sách bàn đã chọn từ AsyncStorage
 */
export const getSelectedTables = async (): Promise<ChessTable[]> => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Error fetching selected tables:", error);
    return [];
  }
};

/**
 * Thêm hoặc xóa bàn khỏi danh sách đã chọn
 */
export const toggleTableSelection = async (table: ChessTable) => {
  try {
    let selectedTables = await getSelectedTables();
    const isSelected = selectedTables.some((t) => t.tableId === table.tableId);

    if (isSelected) {
      selectedTables = selectedTables.filter(
        (t) => t.tableId !== table.tableId,
      );
    } else {
      selectedTables.push(table);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTables));
    return selectedTables;
  } catch (error) {
    console.error("Error toggling table selection:", error);
  }
};

/**
 * Lấy số lượng bàn đã chọn
 */
export const getSelectedCount = async (): Promise<number> => {
  const selectedTables = await getSelectedTables();
  return selectedTables.length;
};

/**
 * Xóa toàn bộ danh sách bàn đã chọn
 */
export const clearSelectedTables = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing selected tables:", error);
  }
};
