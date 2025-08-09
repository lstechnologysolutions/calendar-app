import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  CreditCard,
  BarChart2,
  ChevronRight,
  Filter,
} from "lucide-react-native";
import { Trans } from "@lingui/react/macro";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for dashboard
  const upcomingAppointments = [
    {
      id: 1,
      customer: "John Doe",
      service: "Consultation",
      date: "2023-06-15",
      time: "10:00 AM",
      status: "confirmed",
      isPaid: true,
    },
    {
      id: 2,
      customer: "Jane Smith",
      service: "Follow-up",
      date: "2023-06-15",
      time: "11:30 AM",
      status: "pending",
      isPaid: false,
    },
    {
      id: 3,
      customer: "Mike Johnson",
      service: "Initial Meeting",
      date: "2023-06-16",
      time: "2:00 PM",
      status: "confirmed",
      isPaid: true,
    },
  ];

  const stats = {
    totalAppointments: 24,
    confirmedAppointments: 18,
    pendingAppointments: 6,
    revenue: 1250,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <View className="space-y-6">
            <View className="flex-row flex-wrap justify-between">
              <StatCard
                title={<Trans>Total Appointments</Trans>}
                value={stats.totalAppointments}
                icon={<Calendar size={20} color="#4f46e5" />}
              />
              <StatCard
                title={<Trans>Confirmed</Trans>}
                value={stats.confirmedAppointments}
                icon={<Clock size={20} color="#10b981" />}
              />
              <StatCard
                title={<Trans>Pending</Trans>}
                value={stats.pendingAppointments}
                icon={<Clock size={20} color="#f59e0b" />}
              />
              <StatCard
                title={<Trans>Revenue</Trans>}
                value={`$${stats.revenue}`}
                icon={<CreditCard size={20} color="#6366f1" />}
              />
            </View>

            <View className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-base-content"><Trans>Upcoming Appointments</Trans></Text>
                <TouchableOpacity className="flex-row items-center">
                  <Filter size={16} color="#6b7280" />
                  <Text className="text-sm text-base-content/60 ml-1"><Trans>Filter</Trans></Text>
                </TouchableOpacity>
              </View>

              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}

              <TouchableOpacity className="mt-4">
                <Text className="text-primary text-center">
                  <Trans>View All Appointments</Trans>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case "appointments":
        return (
          <View className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
            <Text className="text-lg font-bold mb-4 text-base-content"><Trans>All Appointments</Trans></Text>
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </View>
        );
      case "customers":
        return (
          <View className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
            <Text className="text-lg font-bold mb-4 text-base-content"><Trans>Customer Management</Trans></Text>
            <Text className="text-base-content/60">
              <Trans>Manage your customer database here.</Trans>
            </Text>
          </View>
        );
      case "services":
        return (
          <View className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
            <Text className="text-lg font-bold mb-4 text-base-content"><Trans>Service Management</Trans></Text>
            <Text className="text-base-content/60">
              <Trans>Configure your services, pricing, and availability.</Trans>
            </Text>
          </View>
        );
      case "settings":
        return (
          <View className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200">
            <Text className="text-lg font-bold mb-4 text-base-content"><Trans>System Settings</Trans></Text>
            <Text className="text-base-content/60">
              <Trans>Configure booking rules, notifications, and Google Calendar sync.</Trans>
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-base-100">
      <StatusBar style="auto" />
      <View className="p-4 bg-primary">
        <Text className="text-2xl font-bold text-primary-content"><Trans>Admin Dashboard</Trans></Text>
        <Text className="text-primary-content/80">
          <Trans>Manage your booking system</Trans>
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">{renderTabContent()}</ScrollView>

      <View className="flex-row justify-around bg-base-100 border-t border-base-200 py-2">
        <NavButton
          title={<Trans>Overview</Trans>}
          icon={
            <BarChart2
              size={24}
              color={activeTab === "overview" ? "#4f46e5" : "#6b7280"}
            />
          }
          active={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />
        <NavButton
          title={<Trans>Appointments</Trans>}
          icon={
            <Calendar
              size={24}
              color={activeTab === "appointments" ? "#4f46e5" : "#6b7280"}
            />
          }
          active={activeTab === "appointments"}
          onPress={() => setActiveTab("appointments")}
        />
        <NavButton
          title={<Trans>Customers</Trans>}
          icon={
            <Users
              size={24}
              color={activeTab === "customers" ? "#4f46e5" : "#6b7280"}
            />
          }
          active={activeTab === "customers"}
          onPress={() => setActiveTab("customers")}
        />
        <NavButton
          title={<Trans>Services</Trans>}
          icon={
            <CreditCard
              size={24}
              color={activeTab === "services" ? "#4f46e5" : "#6b7280"}
            />
          }
          active={activeTab === "services"}
          onPress={() => setActiveTab("services")}
        />
        <NavButton
          title={<Trans>Settings</Trans>}
          icon={
            <Settings
              size={24}
              color={activeTab === "settings" ? "#4f46e5" : "#6b7280"}
            />
          }
          active={activeTab === "settings"}
          onPress={() => setActiveTab("settings")}
        />
      </View>
    </SafeAreaView>
  );
}

type StatCardProps = { title: React.ReactNode; value: React.ReactNode; icon?: React.ReactNode };
const StatCard = ({ title, value, icon }: StatCardProps) => (
  <View className="bg-base-100 p-4 rounded-lg shadow-sm w-[48%] mb-4 border border-base-200">
    <View className="flex-row justify-between items-center">
      <Text className="text-base-content/60 text-sm">{title}</Text>
      {icon}
    </View>
    <Text className="text-2xl font-bold mt-2 text-base-content">{value}</Text>
  </View>
);

const AppointmentCard = ({
  appointment = {
    id: 0,
    customer: "Customer Name",
    service: "Service",
    date: "2023-01-01",
    time: "00:00",
    status: "pending",
    isPaid: false,
  },
}) => (
  <Pressable className="border-b border-base-200 py-3">
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="font-medium">{appointment.customer}</Text>
        <Text className="text-sm text-base-content/60">{appointment.service}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-base-content/60">
            {appointment.date} • {appointment.time}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <View
          className={`rounded-full px-2 py-1 mr-2 ${appointment.status === "confirmed" ? "bg-green-100" : "bg-yellow-100"}`}
        >
          <Text
            className={`text-xs ${appointment.status === "confirmed" ? "text-green-800" : "text-yellow-800"}`}
          >
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Text>
        </View>
        {appointment.isPaid && (
          <View className="rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-xs text-blue-800"><Trans>Paid</Trans></Text>
          </View>
        )}
        <ChevronRight size={16} color="#9ca3af" className="ml-2" />
      </View>
    </View>
  </Pressable>
);

type NavButtonProps = { title: React.ReactNode; icon?: React.ReactNode; active?: boolean; onPress?: () => void };
const NavButton = ({
  title,
  icon,
  active = false,
  onPress = () => {},
}: NavButtonProps) => (
  <TouchableOpacity
    className={`items-center ${active ? "opacity-100" : "opacity-60"}`}
    onPress={onPress}
  >
    {icon}
    <Text
      className={`text-xs mt-1 ${active ? "text-indigo-600 font-medium" : "text-gray-500"}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);
