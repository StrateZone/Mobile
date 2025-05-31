import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChessTable } from "@/constants/types/chess_table";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

import { putRequest } from "@/helpers/api-requests";
import { useAuth } from "./auth-context";

const STORAGE_KEY = "selectedMonthlyTables";

export const MonthlyTableContext = createContext<any[]>([]);

export const MonthlyTableProvider = ({ children }: any) => {
  const { authState } = useAuth();
  const user = authState?.user;

  const [selectedTables, setSelectedTables] = useState<any[]>([]);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        setSelectedTables(storedData ? JSON.parse(storedData) : []);
      } catch (error) {
        console.error("Error fetching selected tables:", error);
      }
    };
    loadTables();
  }, []);

  const toggleTableSelection = async (tables: ChessTable[]) => {
    try {
      const newTables = tables.map((table) => ({
        ...table,
        invitedUsers: [],
      }));

      // Combine existing tables with new ones, avoiding duplicates
      const updatedTables = [...selectedTables];

      newTables.forEach((newTable) => {
        const existingTableIndex = selectedTables.findIndex(
          (existingTable) =>
            existingTable.tableId === newTable.tableId &&
            existingTable.startDate === newTable.startDate &&
            existingTable.endDate === newTable.endDate,
        );

        if (existingTableIndex === -1) {
          // Table doesn't exist, add it
          updatedTables.push(newTable);
        } else {
          // Table exists, remove it (toggle behavior)
          updatedTables.splice(existingTableIndex, 1);
          Toast.show({
            type: "info",
            text1: "Đã bỏ chọn bàn",
          });
          return;
        }
      });

      setSelectedTables(updatedTables);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTables));

      if (newTables.length > 0) {
        Toast.show({
          type: "success",
          text1: "Đã thêm bàn vào danh sách",
        });
      }
    } catch (error) {
      console.error("Error toggling table selection:", error);
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra khi chọn bàn",
      });
    }
  };

  const addInvitedUser = async (
    tableId: number,
    userId: number,
    startDate: string,
    endDate: string,
  ) => {
    try {
      const updatedTables = selectedTables.map((table) => {
        if (
          table.tableId === tableId &&
          table.startDate === startDate &&
          table.endDate === endDate
        ) {
          return {
            ...table,
            invitedUsers: [...(table.invitedUsers || []), userId],
          };
        }
        return table;
      });

      setSelectedTables(updatedTables);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTables));
    } catch (error) {
      console.error("Error adding invited user:", error);
    }
  };

  const removeInvitedUser = async (
    tableId: number,
    userId: number,
    startDate: string,
    endDate: string,
  ) => {
    try {
      const updatedTables = selectedTables.map((table) => {
        if (
          table.tableId === tableId &&
          table.startDate === startDate &&
          table.endDate === endDate
        ) {
          return {
            ...table,
            invitedUsers: (table.invitedUsers || []).filter(
              (id: number) => id !== userId,
            ),
          };
        }
        return table;
      });

      setSelectedTables(updatedTables);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTables));
    } catch (error) {
      console.error("Error removing invited user:", error);
    }
  };

  const removeSelectedTable = async (table: ChessTable) => {
    try {
      const updatedTables = selectedTables.filter(
        (t) =>
          !(
            t.tableId === table.tableId &&
            t.startDate === table.startDate &&
            t.endDate === table.endDate
          ),
      );
      setSelectedTables(updatedTables);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTables));

      Toast.show({
        type: "success",
        text1: "Đã xóa bàn khỏi danh sách",
      });
    } catch (error) {
      console.error("Error removing selected table:", error);
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra khi xóa bàn",
      });
    }
  };

  const clearSelectedTables = () => {
    Alert.alert(
      "Xác nhận",
      "Nếu hủy tất cả bàn, tất cả lời mời sẽ bị hủy.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setSelectedTables([]);
              await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (error) {
              console.error("Error clearing selected tables:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  const clearSelectedTablesWithNoInvite = async () => {
    try {
      setSelectedTables([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing selected tables:", error);
    }
  };

  return (
    <MonthlyTableContext.Provider
      value={[
        selectedTables,
        toggleTableSelection,
        removeSelectedTable,
        clearSelectedTables,
        clearSelectedTablesWithNoInvite,
        addInvitedUser,
        removeInvitedUser,
      ]}
    >
      {children}
    </MonthlyTableContext.Provider>
  );
};
