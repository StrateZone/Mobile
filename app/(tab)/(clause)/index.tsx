import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { Button, Overlay } from "@rneui/themed";

export default function ClauseScreen() {
  const [refundHours, setRefundHours] = useState<number | null>(null);
  const [nonCancelableHours, setNonCancelableHours] = useState<number | null>(
    null,
  );
  const [minutesBeforeCheckIn, setMinutesBeforeCheckIn] = useState<
    number | null
  >(null);
  const [contributionPoints_PerThread, setContributionPoints_PerThread] =
    useState<number | null>(null);
  const [contributionPoints_PerComment, setContributionPoints_PerComment] =
    useState<number | null>(null);
  const [
    userPoints_PerCheckinTable_ByPercentageOfTablesPrice,
    setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice,
  ] = useState<number | null>(null);
  const [
    max_NumberOfTables_CancelPerWeek,
    setMax_NumberOfTables_CancelPerWeek,
  ] = useState<number | null>(null);
  const [
    numberof_TopContributors_PerWeek,
    setNumberof_TopContributors_PerWeek,
  ] = useState<number | null>(null);
  const [
    max_NumberOfUsers_InvitedToTable,
    setMax_NumberOfUsers_InvitedToTable,
  ] = useState<number | null>(null);
  const [
    appointmentRequest_MaxHours_UntilExpiration,
    setAppointmentRequest_MaxHours_UntilExpiration,
  ] = useState<number | null>(null);
  const [userPoints_PerThread, setUserPoints_PerThread] = useState<
    number | null
  >(null);
  const [userPoints_PerComment, setUserPoints_PerComment] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/system/1",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          },
        );
        const data = await response.json();
        setRefundHours(data.appointment_Refund100_HoursFromScheduleTime);
        setNonCancelableHours(data.appointment_Incoming_HoursFromScheduleTime);
        setMinutesBeforeCheckIn(
          data.appointment_Checkin_MinutesFromScheduleTime,
        );
        setContributionPoints_PerThread(data.contributionPoints_PerThread);
        setContributionPoints_PerComment(data.contributionPoints_PerComment);
        setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice(
          data.userPoints_PerCheckinTable_ByPercentageOfTablesPrice,
        );
        setMax_NumberOfTables_CancelPerWeek(
          data.max_NumberOfTables_CancelPerWeek,
        );
        setNumberof_TopContributors_PerWeek(
          data.numberof_TopContributors_PerWeek,
        );
        setMax_NumberOfUsers_InvitedToTable(
          data.max_NumberOfUsers_InvitedToTable,
        );
        setAppointmentRequest_MaxHours_UntilExpiration(
          data.appointmentRequest_MaxHours_UntilExpiration,
        );
        setUserPoints_PerThread(data.userPoints_PerThread);
        setUserPoints_PerComment(data.userPoints_PerComment);
      } catch (error) {
        console.error("Error fetching system settings:", error);
        setRefundHours(3.5); // Fallback for refund hours
        setNonCancelableHours(1.5); // Fallback for non-cancelable hours
        setMinutesBeforeCheckIn(5); // Fallback for check-in minutes
        setContributionPoints_PerThread(35); // Fallback for thread points
        setContributionPoints_PerComment(5); // Fallback for comment points
        setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice(0.002); // Fallback for check-in points
        setMax_NumberOfTables_CancelPerWeek(5); // Fallback for max cancellations
        setNumberof_TopContributors_PerWeek(10); // Fallback for top contributors
        setMax_NumberOfUsers_InvitedToTable(6); // Fallback for max invites
        setAppointmentRequest_MaxHours_UntilExpiration(48); // Fallback for invite expiration
        setUserPoints_PerThread(10); // Fallback for user thread points
        setUserPoints_PerComment(2); // Fallback for user comment points
      }
    };

    fetchSystemSettings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Điều Khoản Sử Dụng</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>1. Quy Định Chung</Text>
        <Text style={styles.sectionText}>
          - Hệ thống chỉ hỗ trợ các loại cờ có 2 người chơi: Cờ Vua, Cờ Tướng,
          Cờ Vây.
          {"\n"}- Người dùng chỉ có thể chọn giờ chơi trong khoảng thời gian mở
          cửa và đóng cửa của hệ thống.
          {"\n"}- Lời mời tham gia chơi chỉ có thể được gửi trong các khung thời
          gian cụ thể do hệ thống thiết lập.
        </Text>

        <Text style={styles.sectionTitle}>2. Đặt Bàn và Thanh Toán</Text>
        <Text style={styles.sectionText}>
          - Tất cả dịch vụ chỉ có thể được thanh toán thông qua ví điện tử của
          hệ thống.
          {"\n"}- Một lịch hẹn có thể được sử dụng để đặt nhiều bàn ở các khung
          giờ khác nhau.
          {"\n"}- Không hỗ trợ đặt cọc; tất cả lịch hẹn phải được thanh toán đầy
          đủ khi xác nhận.
          {"\n"}- Lời mời chỉ có thể được gửi sau khi lịch đặt bàn đã được thanh
          toán.
          {"\n"}- Nếu đặt bàn có lời mời, hóa đơn sẽ được chia đều cho người gửi
          lời mời và những người được mời đã chấp nhận.
          {"\n"}- Người dùng chấp nhận lời mời phải thanh toán phần còn lại của
          lịch đặt bàn đó.
          {"\n"}- Mỗi bàn chỉ được gửi tối đa{" "}
          <Text style={styles.highlightText}>
            {max_NumberOfUsers_InvitedToTable ?? "Lỗi hiển thị"}
          </Text>{" "}
          lời mời cùng lúc.
        </Text>

        <Text style={styles.sectionTitle}>3. Hủy Lịch Hẹn và Hoàn Tiền</Text>
        <Text style={styles.sectionText}>
          - Người dùng có thể hủy lịch hẹn trong vòng{" "}
          <Text style={styles.highlightText}>
            {refundHours ?? "Lỗi hiển thị"}
          </Text>{" "}
          giờ sau khi đặt lịch để được hoàn tiền 100%.
          {"\n"}- Lịch hẹn sẽ không được hoàn tiền nếu hủy sau thời gian quy
          định.
          {"\n"}- Đối với các lịch hẹn không thể hủy, hệ thống sẽ áp dụng phí
          hủy theo quy định.
        </Text>

        <Text style={styles.sectionTitle}>4. Quản Lý Lời Mời</Text>
        <Text style={styles.sectionText}>
          - Người dùng có thể gửi tối đa{" "}
          <Text style={styles.highlightText}>
            {max_NumberOfUsers_InvitedToTable ?? "Lỗi hiển thị"}
          </Text>{" "}
          lời mời cho mỗi bàn.
          {"\n"}- Các lời mời phải được chấp nhận trong vòng{" "}
          <Text style={styles.highlightText}>
            {appointmentRequest_MaxHours_UntilExpiration ?? "Lỗi hiển thị"}
          </Text>{" "}
          giờ, nếu không sẽ hết hạn.
          {"\n"}- Người dùng có thể hủy lời mời trước khi người nhận chấp nhận.
        </Text>

        <Text style={styles.sectionTitle}>5. Check-in và Check-out</Text>
        <Text style={styles.sectionText}>
          - Người dùng phải thực hiện check-in ít nhất{" "}
          <Text style={styles.highlightText}>
            {minutesBeforeCheckIn ?? "Lỗi hiển thị"}
          </Text>{" "}
          phút trước giờ chơi để xác nhận có mặt.
          {"\n"}- Nếu không check-in đúng giờ, lịch hẹn sẽ bị hủy tự động.
          {"\n"}- Người dùng phải check-out sau khi kết thúc trận đấu để hoàn
          tất quy trình.
        </Text>

        <Text style={styles.sectionTitle}>
          7. Điểm Cá Nhân, Điểm Đóng Góp và Cơ Chế Đổi Thưởng
        </Text>
        <Text style={styles.sectionText}>
          - Người dùng sẽ nhận được{" "}
          <Text style={styles.highlightText}>
            {userPoints_PerThread ?? "Lỗi hiển thị"}
          </Text>{" "}
          điểm cá nhân cho mỗi bài đăng.
          {"\n"}- Điểm đóng góp cho mỗi bình luận là{" "}
          <Text style={styles.highlightText}>
            {userPoints_PerComment ?? "Lỗi hiển thị"}
          </Text>{" "}
          điểm.
          {"\n"}- Điểm cá nhân và điểm đóng góp có thể được đổi lấy các phần
          thưởng trong hệ thống.
        </Text>

        <Text style={styles.sectionTitle}>8. Liên Hệ</Text>
        <Text style={styles.sectionText}>
          - Nếu có bất kỳ thắc mắc nào, người dùng có thể liên hệ với chúng tôi
          qua email:{" "}
          <Text style={styles.highlightText}>support@example.com</Text>
          {"\n"}- Hoặc qua số điện thoại:{" "}
          <Text style={styles.highlightText}>(123) 456-7890</Text>
        </Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D4ED8",
    marginTop: 15,
  },
  sectionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginTop: 8,
  },
  highlight: {
    fontWeight: "bold",
    color: "#DC2626",
  },
});
