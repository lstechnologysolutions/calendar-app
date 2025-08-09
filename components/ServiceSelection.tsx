import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Trans } from "@lingui/react/macro";
import { Clock, DollarSign, Info } from "lucide-react-native";
import { Service } from "../types/Service";

interface ServiceSelectionProps {
  onSelectService?: (service: Service) => void;
  services?: Service[];
}

export default function ServiceSelection({
  onSelectService = () => {},
  services = [
    {
      id: "1",
      name: "Initial Consultation",
      description: "A free 15-minute consultation to discuss your needs",
      duration: "15 min",
      price: null,
      type: "free",
    },
    {
      id: "2",
      name: "Standard Appointment",
      description: "Regular 30-minute appointment session",
      duration: "30 min",
      price: 50,
      type: "paid",
    },
    {
      id: "3",
      name: "Extended Session",
      description: "In-depth 60-minute appointment session",
      duration: "60 min",
      price: 90,
      type: "paid",
    },
    {
      id: "4",
      name: "Quick Follow-up",
      description: "Brief follow-up session for existing clients",
      duration: "15 min",
      price: null,
      type: "free",
    },
  ],
}: ServiceSelectionProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "paid">(
    "all",
  );

  const filteredServices = services.filter((service) => {
    if (activeFilter === "all") return true;
    return service.type === activeFilter;
  });

  return (
    <View className="bg-base-100 p-4 rounded-lg shadow-sm">
      <Text className="text-base-content text-2xl font-bold mb-4 text-center">
        <Trans>Select a Service</Trans>
      </Text>

      {/* Filter Tabs */}
      <View className="flex-row justify-center mb-6">
        <TouchableOpacity
          className={`px-4 py-2 rounded-l-lg ${activeFilter === "all" ? "bg-primary" : "bg-base-200"}`}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            className={`${activeFilter === "all" ? "text-primary-content" : "text-base-content"}`}
          >
            <Trans>All</Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 ${activeFilter === "free" ? "bg-primary" : "bg-base-200"}`}
          onPress={() => setActiveFilter("free")}
        >
          <Text
            className={`${activeFilter === "free" ? "text-primary-content" : "text-base-content"}`}
          >
            <Trans>Free</Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-r-lg ${activeFilter === "paid" ? "bg-primary" : "bg-base-200"}`}
          onPress={() => setActiveFilter("paid")}
        >
          <Text
            className={`${activeFilter === "paid" ? "text-primary-content" : "text-base-content"}`}
          >
            <Trans>Paid</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service Cards */}
      <ScrollView className="max-h-128">
        {filteredServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => onSelectService(service)}
            className="mb-4"
          >
            <View className="p-4 border rounded-lg bg-base-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base-content text-lg font-semibold">{service.name}</Text>
                {service.type === "free" ? (
                  <View className="bg-primary px-2 py-1 rounded">
                    <Text className="text-primary-content text-xs font-medium">
                      <Trans>FREE</Trans>
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <DollarSign size={16} color={`rgba(var(--color-base-content), 0.7)`} />
                    <Text className="text-base-content/70 ml-1">${service.price}</Text>
                  </View>
                )}
              </View>

              <Text className="text-base-content/80 mb-3">
                <Trans>{service.description}</Trans>
              </Text>

              <View className="flex-row items-center">
                <Clock size={16} color={`rgba(var(--color-base-content), 0.7)`} />
                <Text className="text-base-content/70 ml-1">{service.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Info Text */}
      <View className="flex-row items-center justify-center mt-4 bg-base-200 p-3 rounded-lg">
        <Info size={16} color={`rgb(var(--color-primary))`} />
        <Text className="text-base-content ml-2 text-sm">
          <Trans>Select a service to continue booking</Trans>
        </Text>
      </View>
    </View>
  );
}
