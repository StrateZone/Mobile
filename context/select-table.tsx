import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChessTable } from "@/constants/types/chess_table";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

import { putRequest } from "@/helpers/api-requests";
import { useAuth } from "./auth-context";

const STORAGE_KEY = "selectedTables";

export const TableContext = createContext<any[]>([]);

export const TableProvider = ({ children }: any) => {
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

  const toggleTableSelection = async (table: ChessTable) => {
    try {
      let updatedTables = [...selectedTables];

      const isSelected = updatedTables.some(
        (t) =>
          t.tableId === table.tableId &&
          t.startDate === table.startDate &&
          t.endDate === table.endDate,
      );

      if (isSelected) {
        updatedTables = updatedTables.filter(
          (t) =>
            !(
              t.tableId === table.tableId &&
              t.startDate === table.startDate &&
              t.endDate === table.endDate
            ),
        );
      } else {
        const hasOverlap = updatedTables.some((t) => {
          if (t.tableId !== table.tableId) return false;

          const existingStart = new Date(t.startDate).getTime();
          const existingEnd = new Date(t.endDate).getTime();
          const newStart = new Date(table.startDate).getTime();
          const newEnd = new Date(table.endDate).getTime();

          return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          );
        });

        if (hasOverlap) {
          Alert.alert("Khoảng thời gian này bị trùng với bàn đã đặt trước đó.");
          return;
        }

        updatedTables.push({
          ...table,
          invitedUsers: [],
        });
      }

      setSelectedTables(updatedTables);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTables));
    } catch (error) {
      console.error("Error toggling table selection:", error);
    }
  };

  const addInvitedUser = async (tableId: number, userId: number) => {
    try {
      const updatedTables = selectedTables.map((table) => {
        if (table.tableId === tableId) {
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

  const removeInvitedUser = async (tableId: number, userId: number) => {
    try {
      const updatedTables = selectedTables.map((table) => {
        if (table.tableId === tableId) {
          return {
            ...table,
            invitedUsers: (table.invitedUsers || []).filter(
              (id) => id !== userId,
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

  const removeSelectedTable = (table: ChessTable) => {
    Alert.alert(
      "Xác nhận",
      "Nếu hủy chọn bàn này, tất cả lời mời sẽ bị hủy.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
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
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedTables),
              );
            } catch (error) {
              console.error("Error removing selected table:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
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
    <TableContext.Provider
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
    </TableContext.Provider>
  );
};
