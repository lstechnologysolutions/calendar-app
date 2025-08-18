import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Trans } from "@lingui/react/macro";
import { Clock, Info } from "lucide-react-native";
import { ServiceSelectionProps, ServiceFilter } from "@/types/Service.types";
import { SERVICES, getPaidServices, getFreeServices } from "@/config/services.config";
import { PriceDisplay } from "../src/components/ui/PriceDisplay";

export default function ServiceSelection({
  onSelectService = () => {},
  services = SERVICES,
}: ServiceSelectionProps) {
  const [activeFilter, setActiveFilter] = useState<ServiceFilter>("all");

  const filteredServices = activeFilter === "all" 
    ? services 
    : activeFilter === "paid" 
      ? getPaidServices() 
      : getFreeServices();

  return (
    <View className="p-4 rounded-lg shadow-sm ">
      <Text className="text-base-content text-2xl font-bold mb-4 text-center">
        <Trans>Select a Service</Trans>
      </Text>

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
                  <PriceDisplay amount={service.price} variant="default" />
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

      <View className="flex-row items-center justify-center mt-4 bg-base-200 p-3 rounded-lg">
        <Info size={16} color={`rgb(var(--color-primary))`} />
        <Text className="text-base-content ml-2 text-sm">
          <Trans>Select a service to continue booking</Trans>
        </Text>
      </View>
    </View>
  );
}
